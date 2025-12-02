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

    // Scopes per model
    const scopeItems = isOwner ? {} : { clientId };
    const scopeAssignments = isOwner ? {} : { item: { clientId } };
    const scopeMaintenance = isOwner ? {} : { item: { clientId } };
    const scopeUsers = isOwner ? {} : { clientId };

    // Get current date for time-based queries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch all statistics in parallel
    const [
      totalItems,
      activeAssignments,
      pendingMaintenance,
      overdueItems,
      totalUsers,
      monthlyRevenue,
      activeClients,
      completedMaintenanceThisMonth,
      totalMaintenance
    ] = await Promise.all([
      // Total items
      prisma.item.count({ where: scopeItems }),

      // Active assignments
      prisma.assignment.count({ where: { ...scopeAssignments, status: 'ACTIVE' } }),

      // Pending maintenance
      prisma.maintenanceRecord.count({ where: { ...scopeMaintenance, status: 'SCHEDULED' } }),

      // Overdue items (assignments past due date or maintenance overdue)
      prisma.assignment.count({ where: { ...scopeAssignments, status: 'OVERDUE' } }),

      // Total users
      prisma.user.count({ where: scopeUsers }),

      // Monthly revenue (for owners only)
      isOwner ? prisma.invoice.aggregate({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth }, status: 'PAID' },
        _sum: { amount: true }
      }) : Promise.resolve({ _sum: { amount: 0 } }),

      // Active clients (for owners only)
      isOwner ? prisma.client.count({
        where: {
          status: 'ACTIVE'
        }
      }) : Promise.resolve(1),

      // Completed maintenance this month
      prisma.maintenanceRecord.count({
        where: {
          ...scopeMaintenance,
          status: 'COMPLETED',
          performedAt: { gte: startOfMonth, lte: endOfMonth }
        }
      }),

      // Total maintenance records
      prisma.maintenanceRecord.count({ where: scopeMaintenance })
    ]);

    // Calculate system health based on various factors
    const systemHealth = calculateSystemHealth({
      totalItems,
      activeAssignments,
      pendingMaintenance,
      overdueItems,
      completedMaintenanceThisMonth,
      totalMaintenance
    });

    const stats = {
      totalItems,
      activeAssignments,
      pendingMaintenance,
      overdueItems,
      totalUsers,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      activeClients,
      systemHealth
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

function calculateSystemHealth(metrics: {
  totalItems: number;
  activeAssignments: number;
  pendingMaintenance: number;
  overdueItems: number;
  completedMaintenanceThisMonth: number;
  totalMaintenance: number;
}): number {
  const {
    totalItems,
    activeAssignments,
    pendingMaintenance,
    overdueItems,
    completedMaintenanceThisMonth,
    totalMaintenance
  } = metrics;

  if (totalItems === 0) return 100;

  let healthScore = 100;

  // Deduct points for overdue items (high impact)
  const overduePercentage = (overdueItems / totalItems) * 100;
  healthScore -= overduePercentage * 2; // 2 points per percent overdue

  // Deduct points for pending maintenance (medium impact)
  const pendingMaintenancePercentage = (pendingMaintenance / totalItems) * 100;
  healthScore -= pendingMaintenancePercentage * 0.5; // 0.5 points per percent pending

  // Add points for completed maintenance this month (positive impact)
  if (totalMaintenance > 0) {
    const maintenanceCompletionRate = (completedMaintenanceThisMonth / totalMaintenance) * 100;
    healthScore += maintenanceCompletionRate * 0.1; // Small bonus for maintenance completion
  }

  // Ensure health score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(healthScore)));
}
