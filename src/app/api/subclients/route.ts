import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


// GET /api/subclients - Get all subclients for a client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let clientId = searchParams.get('clientId');
    if (!clientId) {
      const session = await getServerSession(authOptions as any) as any
      if (!session?.user?.clientId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      clientId = session.user.clientId
    }
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // clientId ensured above

    // Build where clause
    const where: any = {
      clientId: clientId
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get subclients with NFC tap counts
    const subClients = await prisma.subClient.findMany({
      where,
      include: {
        _count: {
          select: {
            nfcTaps: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.subClient.count({ where });

    return NextResponse.json({
      success: true,
      data: subClients,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching subclients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subclients' },
      { status: 500 }
    );
  }
}

// POST /api/subclients - Create a new subclient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, name, email, phone, address, notes } = body;

    // Validate required fields
    if (!clientId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, name, and email' },
        { status: 400 }
      );
    }

    // Check if email already exists for this client
    const existingSubClient = await prisma.subClient.findFirst({
      where: {
        clientId: clientId,
        email: email
      }
    });

    if (existingSubClient) {
      return NextResponse.json(
        { error: 'A subclient with this email already exists' },
        { status: 409 }
      );
    }

    // Create the subclient
    const subClient = await prisma.subClient.create({
      data: {
        clientId,
        name,
        email,
        phone: phone || null,
      },
      include: {
        _count: {
          select: {
            nfcTaps: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: subClient
    });

  } catch (error) {
    console.error('Error creating subclient:', error);
    return NextResponse.json(
      { error: 'Failed to create subclient' },
      { status: 500 }
    );
  }
}

// PUT /api/subclients - Update a subclient
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, address, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Subclient ID is required' },
        { status: 400 }
      );
    }

    // Check if subclient exists
    const existingSubClient = await prisma.subClient.findUnique({
      where: { id }
    });

    if (!existingSubClient) {
      return NextResponse.json(
        { error: 'Subclient not found' },
        { status: 404 }
      );
    }

    // Update the subclient
    const updatedSubClient = await prisma.subClient.update({
      where: { id },
      data: {
        name: name || existingSubClient.name,
        email: email || existingSubClient.email,
        phone: phone !== undefined ? phone : existingSubClient.phone,
      },
      include: {
        _count: {
          select: {
            nfcTaps: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSubClient
    });

  } catch (error) {
    console.error('Error updating subclient:', error);
    return NextResponse.json(
      { error: 'Failed to update subclient' },
      { status: 500 }
    );
  }
}

// DELETE /api/subclients - Delete a subclient
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Subclient ID is required' },
        { status: 400 }
      );
    }

    // Check if subclient exists
    const existingSubClient = await prisma.subClient.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            nfcTaps: true
          }
        }
      }
    });

    if (!existingSubClient) {
      return NextResponse.json(
        { error: 'Subclient not found' },
        { status: 404 }
      );
    }

    // Check if subclient has NFC taps
    if (existingSubClient._count.nfcTaps > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete subclient with existing NFC tap records. Please archive instead or contact support.',
          tapCount: existingSubClient._count.nfcTaps
        },
        { status: 409 }
      );
    }

    // Delete the subclient
    await prisma.subClient.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Subclient deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subclient:', error);
    return NextResponse.json(
      { error: 'Failed to delete subclient' },
      { status: 500 }
    );
  }
}
