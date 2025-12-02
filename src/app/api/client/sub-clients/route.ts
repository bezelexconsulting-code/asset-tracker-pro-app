import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the client user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true }
    });

    if (!user || !user.client || user.role !== 'CLIENT_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all sub-clients for this client
    const subClients = await prisma.subClient.findMany({
      where: { clientId: user.client.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ subClients });
  } catch (error) {
    console.error('Error fetching sub-clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, contactPerson } = body;

    if (!name) {
      return NextResponse.json({ error: 'Sub-client name is required' }, { status: 400 });
    }

    // Get the client user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true }
    });

    if (!user || !user.client || user.role !== 'CLIENT_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create new sub-client
    const subClient = await prisma.subClient.create({
      data: {
        name,
        email,
        phone,
        clientId: user.client.id,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({ subClient }, { status: 201 });
  } catch (error) {
    console.error('Error creating sub-client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
