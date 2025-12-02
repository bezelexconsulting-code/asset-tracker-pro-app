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

    // Get all assets for this client
    const assets = await prisma.item.findMany({
      where: { clientId: user.client.id },
      include: {
        nfcTag: true,
        images: true,
        client: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
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
    const { 
      name, 
      description, 
      category, 
      serialNumber, 
      location, 
      subClientId, 
      nfcTagId,
      images 
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Asset name is required' }, { status: 400 });
    }

    // Get the client user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true }
    });

    if (!user || !user.client || user.role !== 'CLIENT_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify sub-client belongs to this client if provided
    if (subClientId) {
      const subClient = await prisma.subClient.findFirst({
        where: { 
          id: subClientId, 
          clientId: user.client.id 
        }
      });
      
      if (!subClient) {
        return NextResponse.json({ error: 'Invalid sub-client' }, { status: 400 });
      }
    }

    // Create the asset
    const asset = await prisma.item.create({
      data: {
        name,
        description,
        category,
        serialNumber,
        location,
        status: 'ACTIVE',
        clientId: user.client.id
      }
    });

    // Create NFC tag if provided
    if (nfcTagId) {
      await prisma.nFCTag.create({
        data: {
          tagId: nfcTagId,
          itemId: asset.id,
          data: JSON.stringify({
            assetId: asset.id,
            assetName: name,
            clientId: user.client.id
          })
        }
      });
    }

    // Create image records if provided
    if (images && images.length > 0) {
      const imageRecords = images.map((image: any) => ({
        itemId: asset.id,
        filename: image.filename,
        url: image.url,
        uploadedBy: user.id
      }));

      await prisma.itemImage.createMany({
        data: imageRecords
      });
    }

    // Fetch the complete asset with relations
    const completeAsset = await prisma.item.findUnique({
      where: { id: asset.id },
      include: {
        nfcTag: true,
        images: true,
        client: true
      }
    });

    return NextResponse.json({ asset: completeAsset }, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
