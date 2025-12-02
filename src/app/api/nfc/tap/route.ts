import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nfcTagId, location, notes } = body;

    if (!nfcTagId) {
      return NextResponse.json({ error: 'NFC tag ID is required' }, { status: 400 });
    }

    // Get the user (worker)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        client: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the NFC tag and associated item
    const nfcTag = await prisma.nFCTag.findUnique({
      where: { tagId: nfcTagId },
      include: {
        item: {
          include: {
            client: true
          }
        }
      }
    });

    if (!nfcTag || !nfcTag.item) {
      return NextResponse.json({ error: 'NFC tag not found or not associated with an item' }, { status: 404 });
    }

    // Verify user has access to this item (either same client or is a worker for the client)
    const hasAccess = 
      (user.client && user.client.id === nfcTag.item.clientId) ||
      (user.role === 'WORKER' && user.clientId === nfcTag.item.clientId);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this asset' }, { status: 403 });
    }

    // Create NFC tap record
    const nfcTap = await prisma.nFCTap.create({
      data: {
        nfcTagId: nfcTag.id,
        subClientId: user.id, // Using user.id as subClientId since NFCTap only has subClientId
        location: location || null,
        notes: notes || null,
        tappedAt: new Date(),
        exported: false
      }
    });

    // Get complete tap data for response
    const completeTap = await prisma.nFCTap.findUnique({
      where: { id: nfcTap.id },
      include: {
        subClient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        nfcTag: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                category: true,
                serialNumber: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      tap: completeTap,
      message: 'NFC tap recorded successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording NFC tap:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const subClientId = searchParams.get('subClientId');
    const exported = searchParams.get('exported');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build where clause
    const whereClause: any = {};

    // If user is a client admin, only show their data
    if (user.role === 'CLIENT_ADMIN' && user.client) {
      whereClause.nfcTag = {
        item: {
          clientId: user.client.id
        }
      };
    } else if (clientId) {
      // Verify access to the specified client
      if (user.client?.id !== clientId && user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      whereClause.nfcTag = {
        item: {
          clientId: clientId
        }
      };
    }

    if (subClientId) {
      whereClause.subClientId = subClientId;
    }

    if (exported !== null) {
      whereClause.exported = exported === 'true';
    }

    if (startDate || endDate) {
      whereClause.tappedAt = {};
      if (startDate) {
        whereClause.tappedAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.tappedAt.lte = new Date(endDate);
      }
    }

    // Get NFC taps
    const nfcTaps = await prisma.nFCTap.findMany({
      where: whereClause,
      include: {
        subClient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        nfcTag: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                category: true,
                serialNumber: true,
                location: true
              }
            }
          }
        }
      },
      orderBy: { tappedAt: 'desc' }
    });

    return NextResponse.json({ nfcTaps });
  } catch (error) {
    console.error('Error fetching NFC taps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
