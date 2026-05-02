import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { ok, err } from '@/lib/api/response'
import { computeMatchupMatrix, type MatchupCell } from '@/lib/analytics/matchup'
import { kvGet, kvSet, kvCacheKey } from '@/lib/cache/kv'

const schema = z.object({
  region: z.enum(['west', 'eu', 'asia', 'all']).default('all'),
  contentType: z.string().default('all'),
  ipBracket: z
    .enum(['all', '900-1100', '1100-1300', '1300-1500', '1500+'])
    .default('all'),
  days: z.coerce.number().int().min(1).max(90).default(30),
})

export async function GET(request: NextRequest) {
  const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return err('INVALID_PARAMS', parsed.error.issues[0].message)

  const p = parsed.data
  const cacheKey = kvCacheKey('meta', 'matchup', p.region, p.contentType, p.ipBracket)

  try {
    const cached = await kvGet<{ matrix: MatchupCell[]; weapons: string[] }>(cacheKey)
    if (cached) {
      return ok(
        { ...cached, snapshotDate: new Date().toISOString().split('T')[0] },
        { cached: true },
      )
    }
  } catch {
    // cache unavailable — fall through
  }

  try {
    const matrix = await computeMatchupMatrix({
      region: p.region as 'west' | 'eu' | 'asia' | 'all',
      contentType: p.contentType as 'all',
      ipBracket: p.ipBracket,
      days: p.days,
    })

    const weapons = [...new Set(matrix.flatMap((c) => [c.attackerId, c.victimId]))]
    const payload = { matrix, weapons }

    try {
      await kvSet(cacheKey, payload, 3600)
    } catch {
      // non-fatal
    }

    return ok(
      { ...payload, snapshotDate: new Date().toISOString().split('T')[0] },
      { cached: false },
    )
  } catch {
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
