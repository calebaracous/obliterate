import { ok } from '@/lib/api/response'
import { getIngestionState } from '@/lib/db/kills'

function toFreshness(state: Awaited<ReturnType<typeof getIngestionState>>) {
  const isStale =
    !state?.lastPolledAt ||
    Date.now() - new Date(state.lastPolledAt).getTime() > 5 * 60 * 1000
  return {
    lastPolledAt: state?.lastPolledAt ?? null,
    consecutiveErrors: state?.consecutiveErrors ?? 0,
    isStale,
  }
}

export async function GET() {
  const [west, eu, asia] = await Promise.all([
    getIngestionState('west'),
    getIngestionState('eu'),
    getIngestionState('asia'),
  ])
  return ok({ west: toFreshness(west), eu: toFreshness(eu), asia: toFreshness(asia) })
}
