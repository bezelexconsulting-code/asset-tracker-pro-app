import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const subClientId = searchParams.get('subClientId') || '';

    const items = await prisma.item.findMany({
      where: {
        clientId: session.user.clientId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { serialNumber: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(status && { status }),
        ...(subClientId && { subClientId }),
        // assignedTo is not a field on Item; removed
      },
      include: {
        nfcTag: true,
        images: true,
        assignments: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        checkInOuts: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        maintenanceRecords: {
          orderBy: { performedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, serialNumber, category, location, nfcTagId, images, subClientId } = body;

    if (!name || !serialNumber) {
      return NextResponse.json({ error: 'Name and serialNumber are required' }, { status: 400 });
    }

    const exists = await prisma.item.findUnique({ where: { serialNumber } });
    if (exists) {
      return NextResponse.json({ error: 'Serial number already exists' }, { status: 409 });
    }

    const item = await prisma.item.create({
      data: {
        name,
        description,
        serialNumber,
        category,
        location,
        status: 'AVAILABLE',
        clientId: session.user.clientId,
        ...(subClientId && { subClientId }),
        ...(nfcTagId && { nfcTagId }),
        // Images creation expects filename/originalName/mimeType/size/url. Handle via upload endpoint first.
      },
      include: {
        nfcTag: true,
        images: true
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
