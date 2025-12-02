import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/owner/clients - Get all clients
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        workers: {
          where: { status: 'ACTIVE' }
        },
        _count: {
          select: {
            workers: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const clientsWithWorkerCount = clients.map(client => ({
      id: client.id,
      companyName: client.companyName,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone,
      status: client.status,
      workerLimit: client.workerLimit,
      pricePerWorker: client.pricePerWorker,
      workerCount: client._count.workers,
      createdAt: client.createdAt.toISOString()
    }));

    return NextResponse.json(clientsWithWorkerCount);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/owner/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      address,
      workerLimit,
      pricePerWorker
    } = body;

    // Validate required fields
    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { error: 'Company name, contact name, and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a temporary password for the client
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create the client
    const client = await prisma.client.create({
      data: {
        companyName,
        contactName,
        email,
        phone,
        address,
        workerLimit: parseInt(workerLimit) || 5,
        pricePerWorker: parseFloat(pricePerWorker) || 25.0,
      }
    });

    // Create a user account for the client admin
    await prisma.user.create({
      data: {
        email,
        name: contactName,
        password: hashedPassword,
        role: 'CLIENT_ADMIN',
        clientId: client.id
      }
    });

    return NextResponse.json({
      client: {
        id: client.id,
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email,
        tempPassword // Return this so the owner can share it with the client
      }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}