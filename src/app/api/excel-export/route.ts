import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';


// POST /api/excel-export - Generate and return Excel file for NFC tap data with client branding
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subClientId, clientId, dateFrom, dateTo, format = 'single', includeBranding = true } = body;

    // Validate required fields
    if (!subClientId && !clientId) {
      return NextResponse.json(
        { error: 'Either subClientId or clientId is required' },
        { status: 400 }
      );
    }

    // Get client branding information
    let clientBranding = null;
    if (includeBranding) {
      const client = await prisma.client.findFirst({
        where: clientId ? { id: clientId } : {
          subClients: {
            some: { id: subClientId }
          }
        },
        select: {
          companyName: true,
          logo: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          customDomain: true
        }
      });

      if (client) {
        clientBranding = {
          companyName: client.companyName,
          logoUrl: client.logo || null,
          primaryColor: client.primaryColor,
          secondaryColor: client.secondaryColor,
          accentColor: client.accentColor,
          customDomain: client.customDomain
        } as any;
      }
    }

    // Build the where clause for filtering with tenant isolation
    const where: any = {};
    
    // Ensure tenant isolation - users can only access their own data
    if (!session.user.isSuperAdmin) {
      if (session.user.role === 'OWNER') {
        where.subClient = {
          clientId: session.user.clientId
        };
      } else {
        where.subClientId = session.user.clientId; // For non-owners, clientId is actually subClientId
      }
    }
    
    if (subClientId) {
      where.subClientId = subClientId;
    } else if (clientId) {
      where.subClient = {
        clientId: clientId
      };
    }

    // Add date filtering if provided
    if (dateFrom || dateTo) {
      where.tappedAt = {};
      if (dateFrom) {
        where.tappedAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.tappedAt.lte = new Date(dateTo);
      }
    }

    // Fetch NFC tap data
    const nfcTaps = await prisma.nFCTap.findMany({
      where,
      include: {
        subClient: {
          select: {
            id: true,
            name: true,
            email: true,
            client: {
              select: {
                id: true,
                companyName: true,
                email: true
              }
            }
          }
        },
        nfcTag: {
          select: {
            id: true,
            tagId: true,
          }
        }
      },
      orderBy: {
        tappedAt: 'desc'
      }
    });

    if (nfcTaps.length === 0) {
      return NextResponse.json(
        { error: 'No NFC tap data found for the specified criteria' },
        { status: 404 }
      );
    }

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    if (format === 'summary' && clientId) {
      // Create summary sheet grouped by subclient
      const subClientGroups = nfcTaps.reduce((groups: any, tap) => {
        const subClientName = tap.subClient.name;
        if (!groups[subClientName]) {
          groups[subClientName] = [];
        }
        groups[subClientName].push(tap);
        return groups;
      }, {});

      // Create summary worksheet
      const summaryData = Object.entries(subClientGroups).map(([subClientName, taps]: [string, any]) => ({
        'Sub-Client': subClientName,
        'Total Taps': taps.length,
        'First Tap': new Date(Math.min(...taps.map((t: any) => new Date(t.tappedAt).getTime()))).toLocaleString(),
        'Last Tap': new Date(Math.max(...taps.map((t: any) => new Date(t.tappedAt).getTime()))).toLocaleString(),
        'Unique Locations': [...new Set(taps.map((t: any) => t.location))].join(', ')
      }));

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

      // Create individual sheets for each subclient
      Object.entries(subClientGroups).forEach(([subClientName, taps]: [string, any]) => {
        const tapData = taps.map((tap: any) => ({
          'Date & Time': new Date(tap.tappedAt).toLocaleString(),
          'Sub-Client': tap.subClient.name,
          'Sub-Client Email': tap.subClient.email,
          'NFC Tag': tap.nfcTag.tagId,
          'Location': tap.location || '',
          'Additional Data': JSON.stringify(tap.data || {})
        }));

        const worksheet = XLSX.utils.json_to_sheet(tapData);
        const safeSheetName = subClientName.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
      });

    } else {
      // Create single sheet with all data
      const tapData = nfcTaps.map(tap => ({
        'Date & Time': new Date(tap.tappedAt).toLocaleString(),
        'Sub-Client': tap.subClient.name,
        'Sub-Client Email': tap.subClient.email,
        'Client': tap.subClient.client.companyName,
        'Client Email': tap.subClient.client.email,
        'NFC Tag': tap.nfcTag.tagId,
        'Location': tap.location || '',
        'Notes': tap.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(tapData);
      
      // Add client branding header if available
      if (clientBranding) {
        try {
          // Get the range of the worksheet
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          
          // Shift all data down by 3 rows to make room for header
          const newRange = { ...range, e: { ...range.e, r: range.e.r + 3 } };
          
          // Move existing data down
          for (let row = newRange.e.r; row >= range.s.r + 3; row--) {
            for (let col = range.s.c; col <= range.e.c; col++) {
              const oldAddr = XLSX.utils.encode_cell({ r: row - 3, c: col });
              const newAddr = XLSX.utils.encode_cell({ r: row, c: col });
              if (worksheet[oldAddr]) {
                worksheet[newAddr] = worksheet[oldAddr];
                delete worksheet[oldAddr];
              }
            }
          }

          // Add branding header
          worksheet['A1'] = { t: 's', v: clientBranding.companyName || 'Company Report' };
          worksheet['A2'] = { t: 's', v: clientBranding.headerText || 'NFC Tap Data Export' };
          worksheet['A3'] = { t: 's', v: `Generated on: ${new Date().toLocaleDateString()}` };

          // Update worksheet range
          worksheet['!ref'] = XLSX.utils.encode_range(newRange);
        } catch (error) {
          console.warn('Could not add branding header:', error);
        }
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'NFC Tap Data');
    }

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with client branding
    const timestamp = new Date().toISOString().split('T')[0];
    const clientName = clientBranding?.companyName || 'Client';
    const subClientName = subClientId ? nfcTaps[0]?.subClient.name : 'All_SubClients';
    const filename = `${clientName}_${subClientName}_NFC_Export_${timestamp}.xlsx`;

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel export' },
      { status: 500 }
    );
  }
}

// GET /api/excel-export - Get available export options and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // Get statistics for the client
    const stats = await prisma.nFCTap.groupBy({
      by: ['subClientId'],
      where: {
        subClient: {
          clientId: clientId
        }
      },
      _count: {
        id: true
      },
      _min: {
        tappedAt: true
      },
      _max: {
        tappedAt: true
      }
    });

    // Get subclient details
    const subClients = await prisma.subClient.findMany({
      where: {
        clientId: clientId
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Combine stats with subclient info
    const exportOptions = subClients.map(subClient => {
      const stat = stats.find(s => s.subClientId === subClient.id);
      return {
        subClientId: subClient.id,
        subClientName: subClient.name,
        subClientEmail: subClient.email,
        totalTaps: stat?._count.id || 0,
        firstTap: stat?._min.tappedAt,
        lastTap: stat?._max.tappedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        exportOptions,
        totalSubClients: subClients.length,
        totalTaps: stats.reduce((sum, stat) => sum + stat._count.id, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching export options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch export options' },
      { status: 500 }
    );
  }
}
