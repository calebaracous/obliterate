import { NextResponse } from 'next/server'

export function ok<T>(data: T, meta?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ data, meta: { generatedAt: new Date().toISOString(), ...meta } })
}

export function err(code: string, message: string, status = 400): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status })
}

export function validateCronAuth(request: Request): boolean {
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}
