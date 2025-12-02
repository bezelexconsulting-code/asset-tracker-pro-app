import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const branding = await request.json();
    const { clientId } = params;

    // Validate branding data
    const allowedFields = [
      'logo',
      'primaryColor',
      'secondaryColor',
      'accentColor',
      'customDomain',
      'favicon',
      'loginBgImage',
      'dashboardTheme',
      'timezone',
      'dateFormat',
      'currency',
      'language'
    ];

    const updateData: any = {};
    for (const [key, value] of Object.entries(branding)) {
      if (allowedFields.includes(key) && value !== undefined && value !== '') {
        updateData[key] = value;
      }
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data: updateData
    });

    return NextResponse.json({
      message: 'Branding updated successfully',
      client
    });
  } catch (error) {
    console.error('Error updating client branding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
