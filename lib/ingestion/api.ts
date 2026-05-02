import type { AlbionKillEvent, AlbionRegion } from '../../types/albion'

const REGION_URLS: Record<AlbionRegion, string> = {
  west: 'https://gameinfo.albiononline.com/api/gameinfo',
  eu: 'https://gameinfo-ams.albiononline.com/api/gameinfo',
  asia: 'https://gameinfo-sgp.albiononline.com/api/gameinfo',
}

const REQUEST_TIMEOUT_MS = 10_000

function makeAbortSignal(): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  return controller.signal
}

export async function fetchKillEvents(
  region: AlbionRegion,
  opts?: { offset?: number; limit?: number },
): Promise<AlbionKillEvent[]> {
  const base = REGION_URLS[region]
  const limit = opts?.limit ?? 51
  const offset = opts?.offset ?? 0
  const url = `${base}/events?limit=${limit}&offset=${offset}`

  const res = await fetch(url, { signal: makeAbortSignal() })

  if (!res.ok) {
    throw new Error(
      `fetchKillEvents [${region}] failed with status ${res.status} ${res.statusText}`,
    )
  }

  return (await res.json()) as AlbionKillEvent[]
}

export async function fetchSingleKill(
  region: AlbionRegion,
  eventId: number,
): Promise<AlbionKillEvent> {
  const base = REGION_URLS[region]
  const url = `${base}/events/${eventId}`

  const res = await fetch(url, { signal: makeAbortSignal() })

  if (!res.ok) {
    throw new Error(
      `fetchSingleKill [${region}] eventId=${eventId} failed with status ${res.status} ${res.statusText}`,
    )
  }

  return (await res.json()) as AlbionKillEvent
}
