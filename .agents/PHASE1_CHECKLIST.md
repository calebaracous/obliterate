# Phase 1 Build Checklist

Use this as a step-by-step task list. Complete in order — each step
depends on the previous one. Check off tasks as you complete them.

**Goal:** A live kill feed with ingestion running, player pages working,
and the nightly snapshot job wired up. Everything needed to start
accumulating real data from day one.

---

## 0. Project scaffold

- [ ] Init Next.js 15 with App Router: `npx create-next-app@latest --typescript --tailwind --app`
- [ ] Install core dependencies:
  ```bash
  npm install @neondatabase/serverless drizzle-orm drizzle-kit
  npm install @vercel/kv
  npm install zod
  npm install @tanstack/react-query
  npm install zustand
  npm install lucide-react
  npm install clsx tailwind-merge
  ```
- [ ] Install dev dependencies:
  ```bash
  npm install -D drizzle-kit tsx @types/node
  ```
- [ ] Copy `.env.local.example` → `.env.local`, fill in Neon and Vercel KV credentials
- [ ] Create `docs/` folder, copy all planning `.md` files into it
- [ ] Create folder structure as per `CLAUDE.md`

---

## 1. Database setup

- [ ] Create `lib/db/schema.ts` with all tables from `docs/DATABASE.md`:
  - `items`
  - `kills`
  - `battles`
  - `players`
  - `guilds`
  - `patches`
  - `meta_snapshots`
  - `ingestion_state`
- [ ] Create `lib/db/index.ts` with Neon + Drizzle client
- [ ] Run `npm run db:generate` to generate migrations
- [ ] Run `npm run db:migrate` to apply to Neon
- [ ] Enable `pg_trgm` extension in Neon:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  ```
- [ ] Verify tables exist in Neon console

---

## 2. Item seed

- [ ] Create `lib/items/dictionary.ts` — loads items.json into memory Map
- [ ] Create `scripts/seed-items.ts`:
  - Fetch `https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json`
  - Parse and upsert all items into `items` table
  - Log count on completion
- [ ] Add `"seed:items": "npx tsx scripts/seed-items.ts"` to `package.json`
- [ ] Run `npm run seed:items` — verify items table is populated
- [ ] Create `scripts/seed-patches.ts` with initial patch records (can be minimal for now)
- [ ] Run `npm run seed:patches`

---

## 3. Type definitions

- [ ] Create `types/albion.ts`:
  - `AlbionKillEvent`
  - `AlbionPlayer`
  - `AlbionEquipment`
  - `AlbionItem`
  - Full shapes from `docs/INGESTION.md`
- [ ] Create `types/app.ts`:
  - `ContentType` union type (all 10 values)
  - `Region` union type
  - `IpBracket` type + `IP_BRACKETS` constant
  - `KillSummary`
  - `WeaponWinRate`
  - `GearSnapshot`
  - `ItemRef`
  - `PlayerProfile`
  - `PlayerStats`
  - `MatchupCell`
  - `TrendPoint`
  - `RegionFreshness`
  - `ResponseMeta`
- [ ] Create `types/db.ts` — Drizzle inferred types from schema

---

## 4. Ingestion pipeline

- [ ] Create `lib/ingestion/api.ts`:
  - `fetchKillEvents(region, options)` — wraps gameinfo API `/events` endpoint
  - Handle 3 regional base URLs
  - Typed return: `AlbionKillEvent[]`
  - Timeout: 10s. Throw on non-200.
- [ ] Create `lib/ingestion/normalize.ts`:
  - `normalize(event, region)` — converts `AlbionKillEvent` → DB kill row shape
  - Maps `Equipment` slots to `killer_gear` / `victim_gear` JSONB
  - Computes `participants`, `killer_party_size`, `victim_party_size`
  - Resolves `patch_slug` from patches table
- [ ] Create `lib/classifier/classify.ts`:
  - `classify(input)` → `{ contentType, contentConfidence }`
  - Full scoring algorithm from `docs/CLASSIFIER.md`
  - Helper: `parseZoneHint(zone)`
  - Helper: `getWeaponCategory(itemId)` (looks up from item dictionary)
- [ ] Create `lib/db/kills.ts`:
  - `upsertKills(rows[])` — batch upsert with `ON CONFLICT DO NOTHING`
  - `getIngestionState(region)` 
  - `updateIngestionState(region, lastEventId)`
  - `incrementRegionError(region, error)`
- [ ] Create `lib/db/players.ts`:
  - `upsertPlayersFromKills(kills[])` — extract and upsert player records
- [ ] Create `lib/ingestion/poll.ts`:
  - `pollRegion(region)` → `PollResult`
  - Full flow from `docs/INGESTION.md`

---

## 5. Cron handlers

- [ ] Create `app/api/cron/ingest/route.ts`:
  - `GET` handler (Vercel Cron uses GET)
  - Validate `Authorization: Bearer ${CRON_SECRET}` — return 401 if missing
  - Parse `?region=` param, validate it's `west|eu|asia`
  - Call `pollRegion(region)`
  - Return 200 always (even on error — store error in DB)
- [ ] Create `vercel.json` with cron schedule:
  ```json
  {
    "crons": [
      { "path": "/api/cron/ingest?region=west", "schedule": "* * * * *" },
      { "path": "/api/cron/ingest?region=eu",   "schedule": "* * * * *" },
      { "path": "/api/cron/ingest?region=asia",  "schedule": "* * * * *" }
    ]
  }
  ```
- [ ] Test cron handler locally with: `curl -H "Authorization: Bearer test" http://localhost:3000/api/cron/ingest?region=west`
- [ ] Verify kills are being inserted into Neon

---

## 6. Kill feed API

- [ ] Create `lib/cache/kv.ts` — Vercel KV helpers with typed get/set/del
- [ ] Create `lib/db/kills-queries.ts`:
  - `getKills(filters)` — paginated kill query with all filter params
  - `getKillById(id)` — single kill
- [ ] Create `app/api/kills/route.ts`:
  - Parse + validate all query params with zod (see `docs/API.md`)
  - Check KV cache (key: `albion:kills:{hash of params}`, TTL 60s)
  - Query Neon on cache miss
  - Return standard `{ data, meta }` envelope
- [ ] Create `app/api/items/[id]/route.ts`:
  - Return item metadata from dictionary
- [ ] Create `app/api/internal/freshness/route.ts`:
  - Return per-region ingestion state for UI freshness indicator

---

## 7. Kill feed UI

- [ ] Set up global layout in `app/layout.tsx`:
  - Import Google Fonts (Cinzel, IBM Plex Sans, IBM Plex Mono)
  - TanStack Query provider
  - Zustand store provider
  - Global navigation shell (basic for now)
- [ ] Create `components/ui/` primitives:
  - `Badge` — pill badge with color variants
  - `Card` — surface card wrapper
  - `Skeleton` — loading skeleton
  - `Tooltip` — hover tooltip
  - `Button` — primary/secondary/ghost variants
- [ ] Create `components/kills/ItemIcon.tsx`:
  - Renders item thumbnail from `/api/items/[id]/render`
  - Shows empty slot placeholder if no item
  - Quality border color
- [ ] Create `components/kills/GearRow.tsx`:
  - Row of 5 `ItemIcon` components (mainhand, offhand, helm, chest, shoes)
- [ ] Create `components/kills/ContentTypeBadge.tsx`:
  - Pill with content-type label and confidence prefix (`~`)
- [ ] Create `components/kills/RegionBadge.tsx`
- [ ] Create `components/kills/KillCard.tsx`:
  - Full kill card layout from design spec
  - Hover state showing full gear
- [ ] Create `components/kills/KillFeed.tsx`:
  - Uses TanStack Query to fetch `/api/kills`
  - Infinite scroll or pagination
  - Skeleton loading state
- [ ] Create `components/layout/FreshnessBar.tsx`:
  - Polls `/api/internal/freshness` every 30s
  - Per-region status dots
- [ ] Create `app/page.tsx` — homepage with `KillFeed`

---

## 8. Player profile pages

- [ ] Create `lib/db/players-queries.ts`:
  - `getPlayerProfile(id)` — player record + aggregated stats
  - `getPlayerKills(id, pagination)` — kills where killer_id = id
  - `getPlayerDeaths(id, pagination)` — kills where victim_id = id
  - `getPlayerFavoriteWeapons(id)` — top 5 mainhands by kill count
  - `getPlayerKillsByContentType(id)` — breakdown by content_type
- [ ] Create `app/api/players/[id]/route.ts` with full response shape
- [ ] Create `app/api/players/search/route.ts` with `pg_trgm` fuzzy search
- [ ] Create `components/ui/StatCard.tsx` — metric card (label + big number)
- [ ] Create `app/players/[id]/page.tsx`:
  - SSR with `generateMetadata()` for OG tags
  - Player header: name, guild, alliance, total K/D
  - Stats row: kills, deaths, K/D ratio, avg IP, fame
  - Favorite weapons list
  - Kill/death tabs with `KillFeed` filtered to this player
- [ ] Test with real player IDs from the kill feed

---

## 9. Nightly snapshot cron

- [ ] Create `lib/analytics/win-rate.ts`:
  - `computeWeaponWinRates(options)` — runs aggregation query against `kills`
  - Returns `WeaponWinRate[]` sorted by Wilson score
- [ ] Create `lib/analytics/matchup.ts`:
  - `computeMatchupMatrix(options)` — weapon-vs-weapon matchup counts
  - Returns `MatchupCell[]`
- [ ] Create `lib/analytics/tier-list.ts`:
  - `computeTierList(weapons)` — assigns S/A/B/C/D tiers using Wilson score
- [ ] Create `lib/analytics/snapshot.ts`:
  - `runSnapshot(date)` — iterates all region × contentType × ipBracket combos
  - Calls win-rate + matchup queries for each
  - Writes to `meta_snapshots` with `ON CONFLICT DO UPDATE`
- [ ] Create `app/api/cron/snapshot/route.ts`:
  - Validate cron secret
  - Call `runSnapshot(today)`
  - Return count of snapshots written
- [ ] Add to `vercel.json`:
  ```json
  { "path": "/api/cron/snapshot", "schedule": "0 2 * * *" }
  ```
- [ ] Trigger manually once to verify snapshot data: `curl -H "Authorization: Bearer ..." http://localhost:3000/api/cron/snapshot`

---

## 10. Deploy

- [ ] Push to GitHub
- [ ] Connect repo to Vercel
- [ ] Add all env vars to Vercel dashboard (Neon URLs, KV URLs, CRON_SECRET)
- [ ] Deploy and verify:
  - [ ] Kill feed loads on homepage
  - [ ] Cron jobs appear in Vercel dashboard and fire on schedule
  - [ ] Kills are being ingested (check Neon table row count)
  - [ ] Player profile pages work with real IDs
  - [ ] Snapshot cron runs at 02:00 UTC
- [ ] Set up Grafana Cloud free tier with Neon metrics
- [ ] Monitor `ingestion_state` table for errors over first 48 hours

---

## Post-Phase-1 (Phase 2 starting point)

Once Phase 1 is live and ingesting data, the next priorities are:

- Builds/meta page (`/builds`) — win rates from snapshots
- Matchup matrix chart (D3 heatmap)
- Guild profile pages
- Filter bar component (reusable across builds + kill feed)
- Verify classifier accuracy — manually review 50 classified kills
- Counter-build API + UI

See the full feature roadmap in `CLAUDE.md`.
