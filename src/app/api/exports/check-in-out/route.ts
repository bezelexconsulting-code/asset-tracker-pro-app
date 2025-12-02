import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function toCSV(rows: any[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(headers.map(h => escape((r as any)[h])).join(','))
  }
  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'csv').toLowerCase()
    const itemId = searchParams.get('itemId') || ''
    const userId = searchParams.get('userId') || ''
    const limit = parseInt(searchParams.get('limit') || '1000', 10)

    const records = await prisma.checkInOut.findMany({
      where: {
        item: { clientId: session.user.clientId },
        user: { clientId: session.user.clientId },
        ...(itemId && { itemId }),
        ...(userId && { userId })
      },
      include: {
        item: { select: { id: true, name: true, serialNumber: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    })

    const rows = records.map(r => ({
      id: r.id,
      type: r.type,
      timestamp: r.timestamp.toISOString(),
      location: r.location ?? '',
      notes: r.notes ?? '',
      itemId: r.itemId,
      itemName: r.item?.name ?? '',
      itemSerial: r.item?.serialNumber ?? '',
      userId: r.userId,
      userName: r.user?.name ?? '',
      userEmail: r.user?.email ?? ''
    }))

    if (format === 'xlsx' || format === 'excel') {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(rows)
      XLSX.utils.book_append_sheet(wb, ws, 'CheckInOut')
      const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="check-in-out.xlsx"'
        }
      })
    }

    const csv = toCSV(rows)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="check-in-out.csv"'
      }
    })
  } catch (error) {
    console.error('Export check-in/out error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

