import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const clients = await prisma.client.findMany({
      select: {
        id: true,
        companyName: true,
        email: true,
        status: true,
        createdAt: true,
        _count: { select: { users: true, items: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const companyName = formData.get('companyName') as string;
    const email = formData.get('email') as string;
    const adminName = formData.get('adminName') as string;
    const customDomain = formData.get('customDomain') as string;

    if (!companyName || !email || !adminName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Create client and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create client
      const client = await tx.client.create({
        data: {
          companyName,
          contactName: adminName,
          email,
          status: 'ACTIVE',
          customDomain: customDomain || null,
          // Default branding
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          accentColor: '#10b981',
          dashboardTheme: 'light',
          timezone: 'UTC',
          currency: 'USD',
          language: 'en'
        }
      });

      // Generate default password
      const defaultPassword = 'Welcome123!';
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          name: adminName,
          email,
          password: hashedPassword,
          role: 'CLIENT_ADMIN',
          clientId: client.id,
          isSuperAdmin: false
        }
      });

      return { client, adminUser, defaultPassword };
    });

    return NextResponse.json({
      message: 'Client created successfully',
      client: result.client,
      defaultPassword: result.defaultPassword
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
