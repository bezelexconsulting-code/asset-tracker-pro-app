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

    // Get user's role and client context
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isOwner = user.role === 'OWNER';

    // Only owners can view client metrics
    if (!isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch clients with basic counts; compute derived metrics per client
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        companyName: true,
        status: true,
        updatedAt: true,
        _count: { select: { items: true, users: true } }
      },
      orderBy: { companyName: 'asc' }
    });

    // Transform client data into metrics format
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const clientMetrics = await Promise.all(
      clients.map(async (client) => {
        const [billingAgg, lastItem, lastAssignment, activeAssignments] = await Promise.all([
          prisma.invoice.aggregate({
            where: { clientId: client.id, status: 'PAID', createdAt: { gte: startOfMonth, lte: endOfMonth } },
            _sum: { amount: true }
          }),
          prisma.item.findFirst({ where: { clientId: client.id }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
          prisma.assignment.findFirst({ where: { item: { clientId: client.id } }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
          prisma.assignment.count({ where: { status: 'ACTIVE', item: { clientId: client.id } } })
        ]);

        let lastActivity = client.updatedAt;
        if (lastItem?.updatedAt && lastItem.updatedAt > lastActivity) lastActivity = lastItem.updatedAt;
        if (lastAssignment?.updatedAt && lastAssignment.updatedAt > lastActivity) lastActivity = lastAssignment.updatedAt;

        return {
          id: client.id,
          name: client.companyName,
          totalItems: client._count.items,
          activeAssignments,
          monthlyBilling: billingAgg._sum.amount || 0,
          lastActivity: lastActivity.toISOString(),
          status: client.status.toLowerCase()
        };
      })
    );

    return NextResponse.json(clientMetrics);

  } catch (error) {
    console.error('Client metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client metrics' },
      { status: 500 }
    );
  }
}
