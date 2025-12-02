import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status } = await request.json();
    const { clientId } = params;

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data: { status },
      include: {
        _count: { select: { users: true, items: true } }
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { clientId } = params;

    // Delete client and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all items for this client
      await tx.item.deleteMany({ where: { clientId } });

      // Delete all users for this client
      await tx.user.deleteMany({
        where: { clientId }
      });

      // Delete the client
      await tx.client.delete({
        where: { id: clientId }
      });
    });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
