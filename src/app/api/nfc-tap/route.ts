import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// POST /api/nfc-tap - Record a new NFC tap
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subClientId, nfcTagId, data } = body;

    // Validate required fields
    if (!subClientId || !nfcTagId) {
      return NextResponse.json(
        { error: 'Missing required fields: subClientId and nfcTagId' },
        { status: 400 }
      );
    }

    // Create the NFC tap record
    const nfcTap = await prisma.nFCTap.create({
      data: {
        subClientId,
        nfcTagId,
        location: data?.location || null,
        notes: data?.notes || null,
        tappedAt: new Date(),
      },
      include: {
        subClient: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        nfcTag: {
          select: {
            id: true,
            tagId: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: nfcTap
    });

  } catch (error) {
    console.error('Error recording NFC tap:', error);
    return NextResponse.json(
      { error: 'Failed to record NFC tap' },
      { status: 500 }
    );
  }
}

// GET /api/nfc-tap - Get NFC tap records with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subClientId = searchParams.get('subClientId');
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build the where clause based on filters
    const where: any = {};
    
    if (subClientId) {
      where.subClientId = subClientId;
    }
    
    if (clientId) {
      where.subClient = {
        clientId: clientId
      };
    }

    // Get NFC tap records
    const nfcTaps = await prisma.nFCTap.findMany({
      where,
      include: {
        subClient: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        nfcTag: {
          select: {
            id: true,
            tagId: true,
          }
        }
      },
      orderBy: {
        tappedAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.nFCTap.count({ where });

    return NextResponse.json({
      success: true,
      data: nfcTaps,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching NFC taps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFC tap records' },
      { status: 500 }
    );
  }
}
