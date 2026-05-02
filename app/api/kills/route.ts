import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { ok, err } from '@/lib/api/response'
import { getKills } from '@/lib/db/kills-queries'
import { kvGet, kvSet, kvCacheKey } from '@/lib/cache/kv'

const schema = z.object({
  region: z.enum(['west', 'eu', 'asia', 'all']).default('all'),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
  contentType: z.string().optional(),
  weaponId: z.string().optional(),
  playerId: z.string().optional(),
  guildId: z.string().optional(),
  minIp: z.coerce.number().optional(),
  maxIp: z.coerce.number().optional(),
})

type KillsResult = Awaited<ReturnType<typeof getKills>>

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = schema.safeParse(raw)
  if (!parsed.success) return err('INVALID_PARAMS', parsed.error.issues[0].message)

  const params = parsed.data
  // Strip 'all' region before passing to getKills (it expects undefined or a specific region)
  const filter = {
    ...params,
    region: params.region === 'all' ? undefined : params.region,
  }

  const cacheKey = kvCacheKey('kills', JSON.stringify(params))

  try {
    const cached = await kvGet<KillsResult>(cacheKey)
    if (cached) return ok(cached, { cached: true })
  } catch {
    // cache miss or unavailable — proceed to DB
  }

  try {
    const result = await getKills(filter)
    try {
      await kvSet(cacheKey, result, 60)
    } catch {
      // non-fatal
    }
    return ok(result, { cached: false })
  } catch {
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
