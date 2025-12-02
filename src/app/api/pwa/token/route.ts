import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Issue a short-lived JWT for the PWA (static app) to call its own /api/* endpoints
// The token is signed with APP_JWT_SECRET so the PWA's verifyToken can validate it
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = session.user

    const secret = process.env.APP_JWT_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Server not configured: APP_JWT_SECRET missing' }, { status: 500 })
    }

    // Build payload with client_id context
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 // 1 hour expiry
    const payload = {
      iss: 'app',
      sub: String(user.id),
      role: user.role || 'ADMIN',
      client_id: user.clientId || null,
      iat: now,
      exp,
    }

    const token = await signHS256(payload, secret)

    const pwaUrl = process.env.PWA_URL || ''
    const connectUrl = pwaUrl ? `${pwaUrl}?token=${encodeURIComponent(token)}` : null

    return NextResponse.json({ token, exp, connectUrl })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal server error', message: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = session.user

    const secret = process.env.APP_JWT_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Server not configured: APP_JWT_SECRET missing' }, { status: 500 })
    }

    const body = await request.json()
    const requestedClientId = body?.clientId as string | null
    const requestedRole = body?.role as string | null
    const hours = Math.max(1, Math.min(24, parseInt(String(body?.hours || '1'), 10)))

    const isSuperAdmin = Boolean((user as any)?.isSuperAdmin)
    const isOwner = ((user as any)?.role === 'OWNER')

    let clientId: string | null = null
    let role: string = user.role || 'ADMIN'

    if (isSuperAdmin) {
      clientId = requestedClientId || null
      role = requestedRole || role
    } else if (isOwner) {
      clientId = requestedClientId || user.clientId || null
      role = requestedRole || 'ADMIN'
    } else {
      clientId = user.clientId || null
      role = 'ADMIN'
    }

    const now = Math.floor(Date.now() / 1000)
    const exp = now + hours * 60 * 60
    const payload = { iss: 'app', sub: String(user.id), role, client_id: clientId, iat: now, exp }
    const token = await signHS256(payload, secret)

    const pwaUrl = process.env.PWA_URL || ''
    const connectUrl = pwaUrl ? `${pwaUrl}?token=${encodeURIComponent(token)}` : null

    return NextResponse.json({ token, exp, clientId, role, connectUrl })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal server error', message: e?.message || String(e) }, { status: 500 })
  }
}

async function signHS256(payload: any, secret: string) {
  // Minimal HS256 signer without external deps to keep runtime lean
  const base64url = (input: Buffer | string) =>
    Buffer.from(input)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

  const header = { alg: 'HS256', typ: 'JWT' }
  const encHeader = base64url(JSON.stringify(header))
  const encPayload = base64url(JSON.stringify(payload))
  const data = `${encHeader}.${encPayload}`
  const crypto = await import('crypto')
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest()
  const encSig = base64url(signature)
  return `${data}.${encSig}`
}