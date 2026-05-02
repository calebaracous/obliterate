import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { and, eq, gte, desc } from 'drizzle-orm'
import { ok, err } from '@/lib/api/response'
import { db } from '@/lib/db/index'
import { metaSnapshots } from '@/lib/db/schema'
import { kvGet, kvSet, kvCacheKey } from '@/lib/cache/kv'

const schema = z.object({
  weapon: z.string().min(1),
  region: z.enum(['west', 'eu', 'asia', 'all']).default('all'),
  contentType: z.string().default('all'),
  days: z.coerce.number().int().min(1).max(365).default(30),
})

type WeaponStat = { weaponId: string; winRate: number; sampleSize: number }

type TrendPoint = { date: string; winRate: number; sampleSize: number }

export async function GET(request: NextRequest) {
  const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return err('INVALID_PARAMS', parsed.error.issues[0].message)

  const { weapon, region, contentType, days } = parsed.data
  const cacheKey = kvCacheKey('meta', 'trend', weapon, region, contentType, String(days))

  try {
    const cached = await kvGet<{ points: TrendPoint[]; weapon: string }>(cacheKey)
    if (cached) return ok({ data: cached }, { cached: true })
  } catch {
    // cache unavailable — fall through
  }

  try {
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceDate = since.toISOString().split('T')[0]

    const snapshots = await db
      .select()
      .from(metaSnapshots)
      .where(
        and(
          eq(metaSnapshots.region, region),
          eq(metaSnapshots.contentType, contentType),
          eq(metaSnapshots.ipBracket, 'all'),
          gte(metaSnapshots.snapshotDate, sinceDate),
        ),
      )
      .orderBy(desc(metaSnapshots.snapshotDate))

    const points = snapshots
      .map((snap) => {
        const stats = snap.weaponStats as WeaponStat[]
        const w = stats.find((s) => s.weaponId === weapon)
        return w
          ? ({ date: snap.snapshotDate as string, winRate: w.winRate, sampleSize: w.sampleSize } satisfies TrendPoint)
          : null
      })
      .filter((p): p is TrendPoint => p !== null)

    const result = { points, weapon }

    try {
      await kvSet(cacheKey, result, 21600)
    } catch {
      // non-fatal
    }

    return ok({ data: result }, { cached: false })
  } catch {
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
