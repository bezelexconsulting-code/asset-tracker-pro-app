import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


// GET - Fetch clients
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get current user to check if they're an owner
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user is not an owner, they can only see their own client
    if (currentUser.role !== 'OWNER') {
      where.id = currentUser.clientId;
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy === 'companyName' ? { companyName: sortOrder as any } : { createdAt: sortOrder as any },
        select: {
          id: true,
          companyName: true,
          email: true,
          phone: true,
          address: true,
          contactName: true,
          status: true,
          createdAt: true,
          _count: { select: { items: true, users: true } }
        }
      }),
      prisma.client.count({ where })
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST - Create new client
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an owner
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can create clients' }, { status: 403 });
    }

    const body = await request.json();
    const {
      companyName,
      email,
      phone,
      address,
      contactName,
      primaryColor,
      secondaryColor,
      accentColor,
      logo
    } = body;

    // Validate required fields
    if (!companyName || !email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      );
    }

    // Check if client with email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        companyName,
        email,
        phone,
        address,
        contactName,
        primaryColor,
        secondaryColor,
        accentColor,
        logo,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        address: true,
        contactName: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true, users: true } }
      }
    });

    // Log the activity
    // ActivityLog not in schema; skipping logging

    return NextResponse.json(client, { status: 201 });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// PUT - Update client
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientId,
      companyName,
      email,
      phone,
      address,
      contactName,
      primaryColor,
      secondaryColor,
      accentColor,
      logo,
      status
    } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions
    if (currentUser.role !== 'OWNER' && currentUser.clientId !== clientId) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // If email is being changed, check for conflicts
    if (email && email !== existingClient.email) {
      const emailConflict = await prisma.client.findUnique({
        where: { email }
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: 'Client with this email already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    if (logo !== undefined) updateData.logo = logo;
    if (status !== undefined && currentUser.role === 'OWNER') updateData.status = status;

    const client = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        address: true,
        contactName: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true, users: true } }
      }
    });

    // Log the activity
    // ActivityLog not in schema; skipping logging

    return NextResponse.json(client);

  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE - Delete client (soft delete by setting status to INACTIVE)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Check if user is an owner
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can delete clients' }, { status: 403 });
    }

    // Verify client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Soft delete by setting status to INACTIVE
    const client = await prisma.client.update({
      where: { id: clientId },
      data: { status: 'INACTIVE' }
    });

    // ActivityLog not in schema; skipping logging

    return NextResponse.json({ message: 'Client deleted successfully' });

  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
