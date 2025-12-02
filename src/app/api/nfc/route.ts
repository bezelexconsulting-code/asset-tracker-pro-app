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
    const tagId = searchParams.get('tagId');

    if (tagId) {
      // Get specific NFC tag
      const nfcTag = await prisma.nFCTag.findFirst({
        where: {
          id: tagId,
          item: { clientId: session.user.clientId }
        },
        include: {
          item: {
            include: {
              images: true,
              assignments: {
                include: {
                  user: {
                    select: { name: true, email: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!nfcTag) {
        return NextResponse.json({ error: 'NFC tag not found' }, { status: 404 });
      }

      // Logging taps to NFCTap omitted here (requires subClient context)

      return NextResponse.json(nfcTag);
    }

    // Get all NFC tags
    const nfcTags = await prisma.nFCTag.findMany({
      where: { item: { clientId: session.user.clientId } },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(nfcTags);
  } catch (error) {
    console.error('Error fetching NFC tags:', error);
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
    const { tagId, data, itemId } = body;

    // Check if tag already exists
    const existingTag = await prisma.nFCTag.findFirst({ where: { id: tagId } });

    if (existingTag) {
      return NextResponse.json({ error: 'NFC tag already exists' }, { status: 400 });
    }

    const nfcTag = await prisma.nFCTag.create({
      data: {
        id: tagId,
        data: data || {},
        ...(itemId && { itemId })
      },
      include: {
        item: true
      }
    });

    return NextResponse.json(nfcTag, { status: 201 });
  } catch (error) {
    console.error('Error creating NFC tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tagId, data, itemId } = body;

    const nfcTag = await prisma.nFCTag.update({
      where: { id: tagId },
      data: {
        data: data || {},
        ...(itemId !== undefined && { itemId })
      },
      include: {
        item: true
      }
    });

    return NextResponse.json(nfcTag);
  } catch (error) {
    console.error('Error updating NFC tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
