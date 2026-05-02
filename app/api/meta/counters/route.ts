import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { ok, err } from '@/lib/api/response'
import { computeMatchupMatrix } from '@/lib/analytics/matchup'

const schema = z.object({
  weapon: z.string().min(1),
  region: z.enum(['west', 'eu', 'asia', 'all']).default('all'),
  contentType: z.string().default('all'),
})

export async function GET(request: NextRequest) {
  const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return err('INVALID_PARAMS', parsed.error.issues[0].message)

  const { weapon, region, contentType } = parsed.data

  try {
    const matrix = await computeMatchupMatrix({
      region: region as 'west' | 'eu' | 'asia' | 'all',
      contentType: contentType as 'all',
      ipBracket: 'all',
    })

    const counters = matrix
      .filter((c) => c.victimId === weapon && c.sampleSize >= 30)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5)

    return ok({ weapon, counters })
  } catch {
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
