import type { AlbionRegion } from '../../types/albion'
import {
  getIngestionState,
  upsertIngestionState,
  incrementRegionError,
  upsertKills,
  type NewKill as DbNewKill,
} from '../db/kills'
import { upsertPlayersFromKills } from '../db/players'
import { fetchKillEvents } from './api'
import { normalize } from './normalize'

export interface PollResult {
  region: AlbionRegion
  fetched: number
  inserted: number
  error?: string
}

export async function pollRegion(region: AlbionRegion): Promise<PollResult> {
  let state: Awaited<ReturnType<typeof getIngestionState>>
  try {
    state = await getIngestionState(region)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await incrementRegionError(region, message)
    return { region, fetched: 0, inserted: 0, error: message }
  }

  let events: Awaited<ReturnType<typeof fetchKillEvents>>
  try {
    events = await fetchKillEvents(region, { limit: 51, offset: 0 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await incrementRegionError(region, message)
    return { region, fetched: 0, inserted: 0, error: message }
  }

  const lastEventId = state?.lastEventId ?? null

  // Keep only events newer than what we have already stored
  const newEvents = lastEventId !== null
    ? events.filter((e) => e.EventId > lastEventId)
    : events

  if (newEvents.length === 0) {
    return { region, fetched: events.length, inserted: 0 }
  }

  // Sort ascending so we process oldest-first; ensures lastEventId is the true max
  newEvents.sort((a, b) => a.EventId - b.EventId)

  try {
    const normalized = newEvents.map((e) => normalize(e, region))

    // Cast to Drizzle's inferred insert type — the shapes are structurally
    // compatible; the only difference is that jsonb columns are typed as
    // `unknown` by Drizzle while our GearJson is more specific.
    await upsertKills(normalized as unknown as DbNewKill[])
    await upsertPlayersFromKills(normalized as unknown as DbNewKill[])

    const maxEventId = newEvents[newEvents.length - 1]!.EventId
    await upsertIngestionState(region, maxEventId, new Date())

    return { region, fetched: events.length, inserted: normalized.length }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await incrementRegionError(region, message)
    return { region, fetched: events.length, inserted: 0, error: message }
  }
}
