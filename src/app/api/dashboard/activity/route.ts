export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's client context
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const clientId = user.clientId;
    const isOwner = user.role === 'OWNER';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

    // Base query conditions
    // Build client scoping for relations
    const scopeAssignment = isOwner ? {} : { item: { clientId } };
    const scopeMaintenance = isOwner ? {} : { item: { clientId } };
    const scopeCheckInOut = isOwner ? {} : { item: { clientId } };
    const scopeItems = isOwner ? {} : { clientId };

    // Get recent activities from different sources
    const [
      recentAssignments,
      recentMaintenance,
      recentCheckInOut,
      recentItems
    ] = await Promise.all([
      // Recent assignments
      prisma.assignment.findMany({
        where: scopeAssignment,
        include: {
          item: { select: { name: true } },
          user: { select: { name: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: Math.ceil(limit / 4)
      }),

      // Recent maintenance records
      prisma.maintenanceRecord.findMany({
        where: scopeMaintenance,
        include: {
          item: { select: { name: true } },
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limit / 4)
      }),

      // Recent check-in/out records
      prisma.checkInOut.findMany({
        where: scopeCheckInOut,
        include: {
          item: { select: { name: true } },
          user: { select: { name: true } }
        },
        orderBy: { timestamp: 'desc' },
        take: Math.ceil(limit / 4)
      }),

      // Recent items created
      prisma.item.findMany({
        where: scopeItems,
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limit / 4)
      })
    ]);

    // Transform activities into a unified format
    const activities: Array<{ id: string; type: string; description: string; timestamp: string; user: string; status: string }> = [];

    // Add assignment activities
    recentAssignments.forEach(assignment => {
      activities.push({
        id: `assignment-${assignment.id}`,
        type: 'assignment',
        description: `${assignment.item.name} assigned to ${assignment.user.name}`,
        timestamp: assignment.updatedAt.toISOString(),
        user: assignment.user.name || 'Unknown',
        status: assignment.status === 'ACTIVE' ? 'success' : 
                assignment.status === 'OVERDUE' ? 'error' : 'warning'
      });
    });

    // Add maintenance activities
    recentMaintenance.forEach(maintenance => {
      let description = '';
      let status = 'success';
      
      switch (maintenance.status) {
        case 'SCHEDULED':
          description = `Maintenance scheduled for ${maintenance.item.name}`;
          status = 'warning';
          break;
        case 'IN_PROGRESS':
          description = `Maintenance in progress for ${maintenance.item.name}`;
          status = 'warning';
          break;
        case 'COMPLETED':
          description = `Maintenance completed for ${maintenance.item.name}`;
          status = 'success';
          break;
        case 'CANCELLED':
          description = `Maintenance cancelled for ${maintenance.item.name}`;
          status = 'error';
          break;
        default:
          description = `Maintenance updated for ${maintenance.item.name}`;
      }

      activities.push({
        id: `maintenance-${maintenance.id}`,
        type: 'maintenance',
        description,
        timestamp: maintenance.createdAt.toISOString(),
        user: maintenance.user.name || 'Unknown',
        status
      });
    });

    // Add check-in/out activities
    recentCheckInOut.forEach(record => {
      activities.push({
        id: `checkinout-${record.id}`,
        type: record.type === 'CHECK_IN' ? 'check_in' : 'check_out',
        description: `${record.item.name} ${record.type.toLowerCase().replace('_', ' ')} ${record.location ? `at ${record.location}` : ''}`,
        timestamp: record.timestamp.toISOString(),
        user: record.user.name || 'Unknown',
        status: 'success'
      });
    });

    // Add new item activities
    recentItems.forEach(item => {
      activities.push({
        id: `item-${item.id}`,
        type: 'new_item',
        description: `New item added: ${item.name}`,
        timestamp: item.createdAt.toISOString(),
        user: 'System',
        status: 'success'
      });
    });

    // Sort all activities by timestamp (most recent first) and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json(sortedActivities);

  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard activity' },
      { status: 500 }
    );
  }
}
