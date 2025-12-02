import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-setup-token') || ''
    if (!token || token !== (process.env.BOOTSTRAP_TOKEN || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const statements: string[] = [
      `create table if not exists subclients (
        id text primary key,
        client_id text not null,
        name text not null,
        created_at timestamptz default now()
      );`,
      `create table if not exists assignments (
        id text primary key,
        client_id text not null,
        asset_id text,
        assignee text,
        start text,
        due text,
        subclient_id text,
        timestamp timestamptz default now()
      );`
    ]

    for (const sql of statements) {
      await (prisma as any).$executeRawUnsafe(sql)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal server error', message: e?.message || String(e) }, { status: 500 })
  }
}

