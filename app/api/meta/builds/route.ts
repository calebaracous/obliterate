import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { ok, err } from '@/lib/api/response'
import { computeWeaponWinRates, type WeaponWinRate } from '@/lib/analytics/win-rate'
import { kvGet, kvSet, kvCacheKey } from '@/lib/cache/kv'

const schema = z.object({
  region: z.enum(['west', 'eu', 'asia', 'all']).default('all'),
  contentType: z.string().default('all'),
  ipBracket: z
    .enum(['all', '900-1100', '1100-1300', '1300-1500', '1500+'])
    .default('all'),
  patchSlug: z.string().optional(),
  minSamples: z.coerce.number().default(50),
})

export async function GET(request: NextRequest) {
  const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return err('INVALID_PARAMS', parsed.error.issues[0].message)

  const p = parsed.data
  const cacheKey = kvCacheKey('meta', 'builds', p.region, p.contentType, p.ipBracket)

  try {
    const cached = await kvGet<WeaponWinRate[]>(cacheKey)
    if (cached) {
      return ok(
        { weapons: cached, snapshotDate: new Date().toISOString().split('T')[0] },
        { cached: true },
      )
    }
  } catch {
    // cache unavailable — fall through
  }

  try {
    const weapons = await computeWeaponWinRates({
      region: p.region as 'west' | 'eu' | 'asia' | 'all',
      contentType: p.contentType as 'all',
      ipBracket: p.ipBracket,
      patchSlug: p.patchSlug,
      minSamples: p.minSamples,
    })

    try {
      await kvSet(cacheKey, weapons, 3600)
    } catch {
      // non-fatal
    }

    return ok(
      { weapons, snapshotDate: new Date().toISOString().split('T')[0] },
      { cached: false },
    )
  } catch {
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
