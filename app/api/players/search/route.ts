import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { neon } from '@neondatabase/serverless'
import { ok, err } from '@/lib/api/response'

const schema = z.object({
  q: z.string().min(2),
  limit: z.coerce.number().int().min(1).max(20).default(10),
})

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = schema.safeParse(raw)
  if (!parsed.success) return err('INVALID_PARAMS', parsed.error.issues[0].message)

  const { q, limit } = parsed.data

  try {
    const sql = neon(process.env.DATABASE_URL!)
    const rows = await sql`
      SELECT id, name, guild_name, total_kills, total_deaths
      FROM players
      WHERE name ILIKE ${q + '%'} OR similarity(name, ${q}) > 0.3
      ORDER BY similarity(name, ${q}) DESC, total_kills DESC
      LIMIT ${limit}
    `
    return ok({ players: rows })
  } catch {
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
