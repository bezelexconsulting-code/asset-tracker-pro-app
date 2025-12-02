import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const subClientId = searchParams.get('subClientId');
    const clientId = searchParams.get('clientId');
    const format = searchParams.get('format') || 'xlsx';
    const includeBranding = searchParams.get('includeBranding') !== 'false';

    // Get client branding information
    let clientBranding = null;
    if (includeBranding) {
      const client = await prisma.client.findFirst({
        where: clientId ? { id: clientId } : {
          subClients: {
            some: { id: String(subClientId) }
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

    // Build filter conditions with tenant isolation
    const whereConditions: any = {};
    
    // Ensure tenant isolation - users can only access their own data
    if (!session.user.isSuperAdmin) {
      if (session.user.role === 'OWNER') {
        whereConditions.subClient = {
          clientId: session.user.clientId
        };
      } else {
        whereConditions.subClientId = session.user.clientId; // For non-owners, clientId is actually subClientId
      }
    }

    if (startDate) {
      whereConditions.tappedAt = {
        ...whereConditions.tappedAt,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereConditions.tappedAt = {
        ...whereConditions.tappedAt,
        lte: new Date(endDate)
      };
    }

    if (subClientId) {
      whereConditions.subClientId = subClientId;
    }

    // Fetch NFC tap data with related information
    const nfcTaps = await prisma.nFCTap.findMany({
      where: whereConditions,
      include: {
        nfcTag: {
          include: {
            item: {
              include: {
                client: true
              }
            }
          }
        },
        subClient: {
          select: {
            name: true,
            email: true,
            client: {
              select: {
                companyName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        tappedAt: 'desc'
      }
    });

    // Transform data for Excel export
    const exportData = nfcTaps.map((tap, index) => ({
      'Row #': index + 1,
      'Date': tap.tappedAt.toLocaleDateString(),
      'Time': tap.tappedAt.toLocaleTimeString(),
      'Asset Name': tap.nfcTag?.item?.name || 'Unknown Asset',
      'Asset Category': tap.nfcTag?.item?.category || '',
      'Serial Number': tap.nfcTag?.item?.serialNumber || '',
      'NFC Tag ID': tap.nfcTagId,
      'Client': tap.nfcTag?.item?.client?.companyName || 'Unassigned',
      'Sub-Client Name': tap.subClient?.name || 'Unknown',
      'Sub-Client Email': tap.subClient?.email || '',
      'Location': tap.location || '',
      'Notes': tap.notes || '',
      'Exported': tap.exported ? 'Yes' : 'No',
      'Timestamp (ISO)': tap.tappedAt.toISOString()
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

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
        worksheet['A2'] = { t: 's', v: 'Asset Tracking Export' };
        worksheet['A3'] = { t: 's', v: `Generated on: ${new Date().toLocaleDateString()}` };

        // Update worksheet range
        worksheet['!ref'] = XLSX.utils.encode_range(newRange);
      } catch (error) {
        console.warn('Could not add branding header:', error);
      }
    }

    // Auto-size columns
    const columnWidths = [
      { wch: 8 },   // Row #
      { wch: 12 },  // Date
      { wch: 12 },  // Time
      { wch: 25 },  // Asset Name
      { wch: 15 },  // Asset Category
      { wch: 15 },  // Serial Number
      { wch: 15 },  // NFC Tag ID
      { wch: 20 },  // Client
      { wch: 20 },  // Worker Name
      { wch: 25 },  // Worker Email
      { wch: 20 },  // Location
      { wch: 30 },  // Notes
      { wch: 10 },  // Exported
      { wch: 20 }   // Timestamp (ISO)
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'NFC Tap Data');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: format as any 
    });

    // Mark taps as exported
    if (nfcTaps.length > 0) {
      await prisma.nFCTap.updateMany({
        where: {
          id: {
            in: nfcTaps.map(tap => tap.id)
          }
        },
        data: {
          exported: true
        }
      });

      // Create export record (temporarily disabled for deployment)
      // await prisma.excelExport.create({
      //   data: {
      //     filename: `nfc-tap-data-${new Date().toISOString().split('T')[0]}.${format}`,
      //     type: 'NFC_TAP_DATA',
      //     userId: session.user.id
      //   }
      // });
    }

    // Set response headers for file download with client branding
    const timestamp = new Date().toISOString().split('T')[0];
    const clientName = clientBranding?.companyName || 'Client';
    const filename = `${clientName}_Asset_Export_${timestamp}.${format}`;
    
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel export' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      subClientId,
      clientId,
      includeExported = false,
      format = 'xlsx'
    } = body;

    // Build filter conditions with tenant isolation
    const whereConditions: any = {};
    
    // Ensure tenant isolation - users can only access their own data
    if (!session.user.isSuperAdmin) {
      if (session.user.role === 'OWNER') {
        whereConditions.subClient = {
          clientId: session.user.clientId
        };
      } else {
        whereConditions.subClientId = session.user.clientId; // For non-owners, clientId is actually subClientId
      }
    }

    if (startDate) {
      whereConditions.tappedAt = {
        ...whereConditions.tappedAt,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereConditions.tappedAt = {
        ...whereConditions.tappedAt,
        lte: new Date(endDate)
      };
    }

    if (subClientId) {
      whereConditions.subClientId = subClientId;
    }

    if (!includeExported) {
      whereConditions.exported = false;
    }

    // Get count of records that will be exported
    const tapCount = await prisma.nFCTap.count({
      where: whereConditions
    });

    return NextResponse.json({
      success: true,
      recordCount: tapCount,
      message: `${tapCount} records ready for export`
    });

  } catch (error) {
    console.error('Excel export preview error:', error);
    return NextResponse.json(
      { error: 'Failed to preview export data' },
      { status: 500 }
    );
  }
}
