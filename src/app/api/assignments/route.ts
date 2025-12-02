import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const itemId = url.searchParams.get('itemId') || undefined
  const userId = url.searchParams.get('userId') || undefined
  const status = url.searchParams.get('status') || undefined
  const subClientId = url.searchParams.get('subClientId') || undefined

  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user?.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assignments = await prisma.assignment.findMany({
    where: {
      OR: [
        { item: { clientId: user.clientId } },
        { user: { clientId: user.clientId } },
      ],
      ...(itemId && { itemId }),
      ...(userId && { userId }),
      ...(status && { status }),
      ...(subClientId && { item: { subClientId } }),
    },
    include: { item: true, user: true },
  })

  return NextResponse.json({ data: assignments })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user?.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { itemId, userId, notes } = await req.json()
    if (!itemId || !userId) {
      return NextResponse.json({ error: 'itemId and userId are required' }, { status: 400 })
    }

    // Verify item and user belong to same client
    const [item, targetUser] = await Promise.all([
      prisma.item.findFirst({ where: { id: itemId, clientId: user.clientId } }),
      prisma.user.findFirst({ where: { id: userId, clientId: user.clientId } })
    ])
    if (!item || !targetUser) {
      return NextResponse.json({ error: 'Invalid item or user for tenant' }, { status: 403 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        itemId,
        userId,
        status: 'ACTIVE',
        notes
      },
      include: { item: true, user: true }
    })

    return NextResponse.json({ data: assignment }, { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
