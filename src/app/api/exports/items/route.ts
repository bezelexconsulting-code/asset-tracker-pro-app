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
    const status = searchParams.get('status') || ''
    const subClientId = searchParams.get('subClientId') || ''

    const items = await prisma.item.findMany({
      where: {
        clientId: session.user.clientId,
        ...(status && { status }),
        ...(subClientId && { subClientId })
      },
      include: {
        assignments: true,
        checkInOuts: true,
        maintenanceRecords: true,
        images: true,
        nfcTag: true,
        subClient: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    const rows = items.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description ?? '',
      category: i.category ?? '',
      serialNumber: i.serialNumber ?? '',
      location: i.location ?? '',
      status: i.status,
      subClient: i.subClient?.name ?? '',
      nfcTagId: i.nfcTagId ?? '',
      imagesCount: i.images.length,
      assignmentsCount: i.assignments.length,
      lastCheckEvent: i.checkInOuts[0]?.type ?? '',
      lastMaintenanceStatus: i.maintenanceRecords[0]?.status ?? '',
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    }))

    if (format === 'xlsx' || format === 'excel') {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(rows)
      XLSX.utils.book_append_sheet(wb, ws, 'Items')
      const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="items.xlsx"'
        }
      })
    }

    const csv = toCSV(rows)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="items.csv"'
      }
    })
  } catch (error) {
    console.error('Export items error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

