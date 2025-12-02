import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const checkInOuts = await prisma.checkInOut.findMany({
      where: {
        item: { clientId: session.user.clientId },
        user: { clientId: session.user.clientId },
        ...(itemId && { itemId }),
        ...(userId && { userId })
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            serialNumber: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return NextResponse.json(checkInOuts);
  } catch (error) {
    console.error('Error fetching check-in/out records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, action, location, notes } = body;

    // Validate action
    if (!['check_in', 'check_out'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the item to check current status
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        clientId: session.user.clientId
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Validate action based on current status
    if (action === 'check_out' && item.status === 'CHECKED_OUT') {
      return NextResponse.json({ error: 'Item is already checked out' }, { status: 400 });
    }

    if (action === 'check_in' && item.status === 'AVAILABLE') {
      return NextResponse.json({ error: 'Item is already available' }, { status: 400 });
    }

    // Create check-in/out record
    const checkInOut = await prisma.checkInOut.create({
      data: {
        itemId,
        userId: session.user.id,
        type: action === 'check_out' ? 'CHECK_OUT' : 'CHECK_IN',
        location: location || item.location,
        notes,
        timestamp: new Date()
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            serialNumber: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update item status
    const newStatus = action === 'check_out' ? 'CHECKED_OUT' : 'AVAILABLE';
    await prisma.item.update({
      where: { id: itemId },
      data: { 
        status: newStatus,
        location: location || item.location,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(checkInOut, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in/out record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
