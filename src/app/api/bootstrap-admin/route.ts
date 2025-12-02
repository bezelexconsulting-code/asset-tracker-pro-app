import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = body?.token as string
    if (!token || token !== process.env.BOOTSTRAP_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail = body?.adminEmail as string
    const adminPassword = body?.adminPassword as string
    const adminName = body?.adminName as string
    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'adminEmail and adminPassword required' }, { status: 400 })
    }

    const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (!adminExists) {
      const adminHash = await bcrypt.hash(adminPassword, 12)
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName || 'Owner Admin',
          password: adminHash,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
        },
      })
    }

    const clientName = body?.clientName as string | undefined
    const clientEmail = body?.clientEmail as string | undefined
    const clientAdminEmail = body?.clientAdminEmail as string | undefined
    const clientAdminPassword = body?.clientAdminPassword as string | undefined
    const clientAdminName = body?.clientAdminName as string | undefined

    let clientId: string | null = null
    if (clientName && clientEmail) {
      const existingClient = await prisma.client.findUnique({ where: { email: clientEmail } })
      const client = existingClient || await prisma.client.create({
        data: {
          companyName: clientName,
          email: clientEmail,
          contactName: clientAdminName || 'Client Admin',
          status: 'ACTIVE',
        },
      })
      clientId = client.id
    }

    if (clientId && clientAdminEmail && clientAdminPassword) {
      const u = await prisma.user.findUnique({ where: { email: clientAdminEmail } })
      if (!u) {
        const hash = await bcrypt.hash(clientAdminPassword, 12)
        await prisma.user.create({
          data: {
            email: clientAdminEmail,
            name: clientAdminName || 'Client Admin',
            password: hash,
            role: 'CLIENT_ADMIN',
            clientId,
            isSuperAdmin: false,
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
