import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return NextResponse.json({
    SUPABASE_URL: url,
    SUPABASE_ANON_KEY: anonKey
  })
}
