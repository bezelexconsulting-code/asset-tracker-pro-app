import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// GET /api/client/workers - Get all workers for the client
export async function GET() {
  try {
    // In a real app, you'd get the client ID from the session
    // For now, we'll get the first client as an example
    const client = await prisma.client.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const workers = await prisma.worker.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}

// POST /api/client/workers - Create a new worker (pending payment)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      position,
      department
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Get client info
    const client = await prisma.client.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        workers: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check worker limit
    if (client.workers.length >= client.workerLimit) {
      return NextResponse.json(
        { error: 'Worker limit reached. Please upgrade your plan.' },
        { status: 400 }
      );
    }

    // Check if email already exists for this client
    const existingWorker = await prisma.worker.findFirst({
      where: { 
        clientId: client.id,
        email 
      }
    });

    if (existingWorker) {
      return NextResponse.json(
        { error: 'A worker with this email already exists' },
        { status: 400 }
      );
    }

    // Create the worker with pending payment status
    const worker = await prisma.worker.create({
      data: {
        clientId: client.id,
        name,
        email,
        phone,
        position,
        department,
        status: 'INACTIVE', // Will be activated after payment
        paymentStatus: 'PENDING',
        monthlyFee: client.pricePerWorker,
        startDate: new Date()
      }
    });

    return NextResponse.json({
      worker,
      message: 'Worker created successfully. Please complete payment to activate.'
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json(
      { error: 'Failed to create worker' },
      { status: 500 }
    );
  }
}