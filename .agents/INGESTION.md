# Ingestion — Gameinfo API Polling & Cron Schedule

The ingestion system is the most critical and most fragile part of the stack.
The SBI gameinfo API is undocumented, has no SLA, and goes down for 24–72+ hours
multiple times per year. Every design decision here is made with that instability
in mind.

---

## Gameinfo API reference

Three regional base URLs. Swap the host; paths are identical.

| Region | Base URL |
|---|---|
| Americas (West) | `https://gameinfo.albiononline.com/api/gameinfo` |
| Europe | `https://gameinfo-ams.albiononline.com/api/gameinfo` |
| Asia | `https://gameinfo-sgp.albiononline.com/api/gameinfo` |

### Kill event endpoints

```
GET /events
  ?limit=51           # Max 51 per call (hard limit from SBI)
  &offset=0           # Pagination offset
  &timestamp=0        # Unix ms timestamp filter (not reliable — use offset pagination)

GET /events/{eventId}           # Single kill by ID

GET /events/playerfame          # Top players by kill fame (leaderboard, not useful for ingestion)

GET /players/{playerId}/kills   # All kills by a player
GET /players/{playerId}/deaths  # All deaths by a player
```

### Battle endpoints

```
GET /battles
  ?sort=recent        # or 'totalfame'
  &limit=51
  &offset=0

GET /battles/{battleId}
```

### Player / Guild endpoints

```
GET /players/search?q={name}
GET /players/{id}
GET /players/{id}/topkills
GET /players/{id}/solokills

GET /guilds/{id}
GET /guilds/{id}/members
GET /guilds/{id}/data
GET /guilds/{id}/top

GET /alliances/{id}
```

### Item render

```
GET https://render.albiononline.com/v1/item/{itemId}.png?size=217&quality=1
```

---

## Raw kill event shape

The gameinfo API returns kill events in this shape. The TypeScript type lives
in `types/albion.ts`.

```typescript
interface AlbionKillEvent {
  EventId: number
  TimeStamp: string           // ISO 8601
  Version: number
  Killer: AlbionPlayer
  Victim: AlbionPlayer
  TotalVictimKillFame: number
  Location: string | null     // Zone name — often null or generic
  Participants: AlbionPlayer[]
  GroupMembers: AlbionPlayer[]
  GvGMatch: null
  BattleId: number
  Type: string                // "pvp_kill"
  NumberOfParticipants: number
}

interface AlbionPlayer {
  Id: string                  // SBI UUID
  Name: string
  GuildId: string | null
  GuildName: string | null
  AllianceId: string | null
  AllianceName: string | null
  AllianceTag: string | null
  Avatar: string | null
  AvatarRing: string | null
  DeathFame: number
  KillFame: number
  FameRatio: number
  LifetimeStatistics: object
  Equipment: AlbionEquipment
  Inventory: null
}

interface AlbionEquipment {
  MainHand:  AlbionItem | null
  OffHand:   AlbionItem | null
  Head:      AlbionItem | null
  Armor:     AlbionItem | null  // chest
  Shoes:     AlbionItem | null
  Bag:       AlbionItem | null
  Cape:      AlbionItem | null
  Mount:     AlbionItem | null
  Potion:    AlbionItem | null
  Food:      AlbionItem | null
}

interface AlbionItem {
  Type: string                // Item ID, e.g. "T8_MAIN_CURSEDSTAFF_MORGANA"
  Count: number
  Quality: number             // 1–5
  ActiveSpells: unknown[]
  PassiveSpells: unknown[]
}
```

---

## Ingestion pipeline

### Step 1: Poll (Vercel Cron → API route)

`vercel.json` schedules three cron jobs — one per region — every 60 seconds:

```json
{
  "crons": [
    { "path": "/api/cron/ingest?region=west", "schedule": "* * * * *" },
    { "path": "/api/cron/ingest?region=eu",   "schedule": "* * * * *" },
    { "path": "/api/cron/ingest?region=asia", "schedule": "* * * * *" }
  ]
}
```

> Vercel Pro supports 1-minute cron intervals. Hobby is limited to daily.

Each cron invocation:
1. Validates `Authorization: Bearer ${CRON_SECRET}` header.
2. Reads `last_event_id` from `ingestion_state` for this region.
3. Fetches the latest 51 events from the gameinfo API.
4. Filters to events newer than `last_event_id`.
5. Normalizes and upserts new events into `kills`.
6. Upserts player/guild records.
7. Enqueues each new kill for classification (see below).
8. Updates `ingestion_state` with the new `last_event_id` and `last_polled_at`.
9. On any gameinfo API error: increments `consecutive_errors`, stores
   `last_error`, returns 200 (so Vercel doesn't retry immediately).

### Step 2: Normalize

`lib/ingestion/normalize.ts` converts a raw `AlbionKillEvent` into the DB row
shape. Key transforms:

- Flatten `Equipment` into the `killer_gear` / `victim_gear` JSONB structure.
- Compute `killer_ip` as the average IP across all equipped items (SBI sometimes
  provides this directly in the event; fall back to approximation if missing).
- Map `Participants.length` to `participants`.
- Extract `killer_party_size` from `GroupMembers` count + 1.
- Resolve current `patch_slug` from the `patches` table by `released_at ≤ killed_at`.

### Step 3: Classify

`lib/classifier/classify.ts` runs synchronously during ingestion (not async —
it's fast enough). See `docs/CLASSIFIER.md` for the full algorithm.

Sets `content_type` and `content_confidence` on each kill row before upsert.

### Step 4: Snapshot (nightly)

A separate cron job runs at 02:00 UTC daily and recomputes `meta_snapshots`
for all combinations of (region × content_type × ip_bracket) for the last 7
days. This is the heavy aggregation job — runs against the raw `kills` table
and writes precomputed results to `meta_snapshots`.

```json
{ "path": "/api/cron/snapshot", "schedule": "0 2 * * *" }
```

---

## Error handling & resilience

```typescript
// lib/ingestion/poll.ts — simplified

export async function pollRegion(region: Region): Promise<PollResult> {
  const state = await getIngestionState(region)

  let events: AlbionKillEvent[]
  try {
    events = await fetchKillEvents(region, { limit: 51 })
  } catch (err) {
    await incrementRegionError(region, String(err))
    return { region, fetched: 0, inserted: 0, error: String(err) }
  }

  const newEvents = events.filter(e => e.EventId > (state.last_event_id ?? 0))
  if (newEvents.length === 0) return { region, fetched: events.length, inserted: 0 }

  const rows = newEvents.map(e => normalize(e, region))
  const classified = rows.map(r => ({ ...r, ...classify(r) }))

  await upsertKills(classified)
  await upsertPlayersFromKills(classified)
  await updateIngestionState(region, Math.max(...newEvents.map(e => e.EventId)))

  return { region, fetched: events.length, inserted: newEvents.length }
}
```

### Resilience rules

- **Always return HTTP 200** from cron handlers even on error. Vercel retries
  on non-2xx, which causes thundering herd against an already-failing API.
- **Deduplication**: the `kills` table uses `id BIGINT PRIMARY KEY`. Upsert
  with `ON CONFLICT (id) DO NOTHING` — safe to re-ingest the same window.
- **Freshness indicators**: every API response includes
  `meta.freshness.lastPolledAt` and `meta.freshness.consecutiveErrors` per
  region. The UI shows a staleness banner when `lastPolledAt` is >5 min old.
- **Backoff**: if `consecutive_errors ≥ 5` for a region, skip that region's
  poll for the next 5 minutes (check in the cron handler before calling
  `pollRegion`). Reset on success.

---

## Item dictionary seeding

`scripts/seed-items.ts` downloads the latest `ao-bin-dumps` release from
GitHub and populates the `items` table. Run once after initial setup and
after each game patch.

```typescript
const DUMP_URL =
  'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json'

// Upsert all items — safe to re-run
await db.insert(items).values(parsed).onConflictDoUpdate({
  target: items.id,
  set: { name: sql`excluded.name`, updatedAt: sql`now()` }
})
```

The item dump is also cached locally in `public/items/items.json` and loaded
into memory at startup via `lib/items/dictionary.ts`. This avoids DB round
trips when resolving item IDs during ingestion.

---

## Rate limiting

The gameinfo API has no documented rate limits. Based on community observation:
- Polling at 1-minute intervals per region (3 total) is safe.
- Do not parallelize multiple requests to the same region simultaneously.
- Add a 500ms delay between paginated calls if backfilling.
- The render API (item images) — cache to `/public/items/img/` and never
  hotlink from the client directly.

---

## Backfilling historical data

The gameinfo API only exposes ~3 days of rolling kill history. To maximize
historical coverage:

1. Deploy ingestion workers as soon as possible — every day you delay is
   data you'll never have.
2. On first deploy, run `scripts/backfill.ts` which paginates backward
   through all available events before the normal polling starts.
3. There is no way to recover kills older than SBI's ~3-day window.
   Accept this and document the tool's "data since [date]" clearly in the UI.
