import { unstable_cache } from 'next/cache'
import { ok, err } from '@/lib/api/response'
import {
  getPlayerProfile,
  getPlayerKills,
  getPlayerDeaths,
  getPlayerStats,
} from '@/lib/db/players-queries'

function makeGetPlayerData(id: string) {
  return unstable_cache(
    async () =>
      Promise.all([
        getPlayerProfile(id),
        getPlayerKills(id, { limit: 10 }),
        getPlayerDeaths(id, { limit: 10 }),
        getPlayerStats(id),
      ]),
    [`player-${id}`],
    { revalidate: 300 },
  )
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const fetchPlayerData = makeGetPlayerData(id)
    const [player, recentKills, recentDeaths, stats] = await fetchPlayerData()
    if (!player) return err('NOT_FOUND', 'Player not found', 404)
    return ok({ player, recentKills, recentDeaths, stats })
  } catch {
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
