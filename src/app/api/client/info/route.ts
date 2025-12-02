export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// GET /api/client/info - Get client company information
export async function GET() {
  try {
    // In a real app, you'd get this from the session
    // For now, we'll get the first client as an example
    const session = await getServerSession();
    
    // TODO: Replace with actual session-based client ID
    const client = await prisma.client.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: client.id,
      companyName: client.companyName,
      contactName: client.contactName,
      logo: client.logo,
      primaryColor: client.primaryColor,
      workerLimit: client.workerLimit,
      pricePerWorker: client.pricePerWorker
    });
  } catch (error) {
    console.error('Error fetching client info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client information' },
      { status: 500 }
    );
  }
}
