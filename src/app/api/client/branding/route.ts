import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getClientBranding, getTenantFromHeaders } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    // Get tenant from headers or URL parameter
    const tenantId = clientId || await getTenantFromHeaders();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // If user is authenticated, verify they have access to this tenant
    if (session?.user) {
      const userClientId = (session.user as any).clientId;
      const isSuperAdmin = (session.user as any).isSuperAdmin;
      
      if (!isSuperAdmin && userClientId !== tenantId) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const branding = await getClientBranding(tenantId);

    if (!branding) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(branding);
  } catch (error) {
    console.error('Error fetching client branding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userClientId = (session.user as any).clientId;
    const isSuperAdmin = (session.user as any).isSuperAdmin;
    const role = (session.user as any).role;

    // Only super admins and client admins can update branding
    if (!isSuperAdmin && role !== 'CLIENT_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || userClientId;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Non-super admins can only update their own client's branding
    if (!isSuperAdmin && userClientId !== clientId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        logo: body.logo,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        favicon: body.favicon,
        loginBgImage: body.loginBgImage,
        dashboardTheme: body.dashboardTheme,
        timezone: body.timezone,
        dateFormat: body.dateFormat,
        currency: body.currency,
        language: body.language,
      },
      select: {
        companyName: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        favicon: true,
        loginBgImage: true,
        dashboardTheme: true,
        timezone: true,
        dateFormat: true,
        currency: true,
        language: true,
      }
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client branding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}