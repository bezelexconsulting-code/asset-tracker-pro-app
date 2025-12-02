import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/owner/stats - Get owner dashboard statistics
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ totalClients: 0, totalWorkers: 0, totalRevenue: 0, pendingPayments: 0 })
    }
    // Get total clients
    const totalClients = await prisma.client.count({
      where: { status: 'ACTIVE' }
    });

    // Get total active workers across all clients
    const totalWorkers = await prisma.worker.count({
      where: { status: 'ACTIVE' }
    });

    // Calculate total monthly revenue (active workers * their monthly fees)
    const activeWorkers = await prisma.worker.findMany({
      where: { 
        status: 'ACTIVE',
        paymentStatus: 'PAID'
      },
      select: {
        monthlyFee: true
      }
    });

    const totalRevenue = activeWorkers.reduce((sum, worker) => {
      return sum + (worker.monthlyFee || 0);
    }, 0);

    // Get pending payments count
    const pendingPayments = await prisma.worker.count({
      where: { 
        status: 'ACTIVE',
        paymentStatus: 'PENDING'
      }
    });

    return NextResponse.json({
      totalClients,
      totalWorkers,
      totalRevenue,
      pendingPayments
    });
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
