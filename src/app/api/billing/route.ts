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
    const clientId = user.clientId;

    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const clientFilter = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};

    // Access control
    if (!isOwner) {
      where.clientId = clientId;
    } else if (clientFilter) {
      where.clientId = clientFilter;
    }

    // Filters
    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Fetch billing records with pagination
    const [billingRecords, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.invoice.count({ where })
    ]);

    return NextResponse.json({
      billingRecords,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Billing GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      clientId, 
      amount, 
      billingDate, 
      dueDate, 
      workerCount,
      bankTransferReference
    } = body;

    // Validate required fields
    if (!clientId || !amount || !billingDate) {
      return NextResponse.json(
        { error: 'Client ID, amount, and billing date are required' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create invoice record
    const billingRecord = await prisma.invoice.create({
      data: {
        clientId,
        amount: parseFloat(amount),
        workerCount: typeof workerCount === 'number' ? workerCount : 0,
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : new Date(new Date(billingDate).getTime() + 30 * 24 * 60 * 60 * 1000),
        bankTransferReference: bankTransferReference || null,
        invoiceNumber: `INV-${Date.now()}`
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(billingRecord, { status: 201 });

  } catch (error) {
    console.error('Billing POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing record' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { billingId, status, paymentDate, paymentMethod, notes } = body;

    if (!billingId) {
      return NextResponse.json(
        { error: 'Billing ID is required' },
        { status: 400 }
      );
    }

    // Find the billing record
    const existingBilling = await prisma.invoice.findUnique({
      where: { id: billingId },
      include: { client: true }
    });

    if (!existingBilling) {
      return NextResponse.json(
        { error: 'Billing record not found' },
        { status: 404 }
      );
    }

    // Access control - owners can update any billing, clients can only view their own
    const isOwner = user.role === 'OWNER';
    if (!isOwner && existingBilling.clientId !== user.clientId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only owners can update billing status
    if (status && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'PAID' && paymentDate) {
        updateData.paidAt = new Date(paymentDate);
      }
    }
    
    // paymentMethod and notes are not part of Invoice schema; ignore extra fields

    // Update billing record
    const updatedBilling = await prisma.invoice.update({
      where: { id: billingId },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedBilling);

  } catch (error) {
    console.error('Billing PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update billing record' },
      { status: 500 }
    );
  }
}
