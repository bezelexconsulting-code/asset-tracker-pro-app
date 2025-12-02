import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const upcoming = searchParams.get('upcoming') === 'true';
    const subClientId = searchParams.get('subClientId');

    const maintenanceRecords = await prisma.maintenanceRecord.findMany({
      where: {
        item: { clientId: session.user.clientId, ...(subClientId ? { subClientId } : {}) },
        ...(itemId && { itemId }),
        ...(status && { status }),
        ...(type && { type }),
        ...(upcoming && {
          status: 'SCHEDULED',
          nextDue: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        })
      },
      include: {
        item: { select: { id: true, name: true, serialNumber: true, category: true, location: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { performedAt: 'desc' }
    });

    return NextResponse.json(maintenanceRecords);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, type, description, scheduledDate, performedById, estimatedCost, notes } = body;

    // Validate required fields
    if (!itemId || !type || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: itemId, type, description' 
      }, { status: 400 });
    }

    // Check if item exists
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        clientId: session.user.clientId
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check if performer exists (if specified)
    if (performedById) {
      const performer = await prisma.user.findFirst({
        where: {
          id: performedById,
          clientId: session.user.clientId
        }
      });

      if (!performer) {
        return NextResponse.json({ error: 'Performer not found' }, { status: 404 });
      }
    }

    const maintenanceRecord = await prisma.maintenanceRecord.create({
      data: {
        itemId,
        type,
        description,
        status: 'SCHEDULED',
        nextDue: scheduledDate ? new Date(scheduledDate) : null,
        cost: estimatedCost || null,
        notes: notes || null,
        ...(performedById && { userId: performedById })
      },
      include: {
        item: { select: { id: true, name: true, serialNumber: true, category: true, location: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(maintenanceRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recordId, status, completedDate, actualCost, completionNotes, performedById, nextMaintenanceDate } = body;

    const updateData: any = { status, updatedAt: new Date() };

    if (status === 'COMPLETED') {
      updateData.performedAt = completedDate ? new Date(completedDate) : new Date();
      updateData.cost = actualCost || null;
      updateData.notes = completionNotes || null;
      if (performedById) updateData.userId = performedById;
    }

    if (status === 'IN_PROGRESS') {
      // no dedicated field; keep status only
    }

    const maintenanceRecord = await prisma.maintenanceRecord.update({
      where: { id: recordId },
      data: updateData,
      include: {
        item: { select: { id: true, name: true, serialNumber: true, category: true, location: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // Schedule next maintenance if provided
    if (status === 'COMPLETED' && nextMaintenanceDate) {
      await prisma.maintenanceRecord.create({
        data: {
          itemId: maintenanceRecord.itemId,
          type: maintenanceRecord.type,
          description: `Follow-up ${maintenanceRecord.type}`,
          nextDue: new Date(nextMaintenanceDate),
          status: 'SCHEDULED',
          notes: `Automatically scheduled after completion of record ${recordId}`,
          userId: session.user.id
        }
      });
    }

    return NextResponse.json(maintenanceRecord);
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
