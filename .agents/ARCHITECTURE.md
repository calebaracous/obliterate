# Architecture & System Design

---

## Data flow

```
SBI Gameinfo API (3 regions)
        │
        │  Vercel Cron (every 60s, per region)
        ▼
/api/cron/ingest
        │
        ├─ Fetch latest 51 kill events
        ├─ Normalize (lib/ingestion/normalize.ts)
        ├─ Classify content type (lib/classifier/classify.ts)
        ├─ Upsert → kills table (Neon)
        └─ Upsert → players, guilds tables (Neon)

        │
        │  Vercel Cron (nightly 02:00 UTC)
        ▼
/api/cron/snapshot
        │
        └─ Aggregate kills → meta_snapshots table (Neon)


User request (browser)
        │
        ▼
Next.js App Router (Vercel Edge)
        │
        ├─ Static/ISR pages (player profiles, guild pages)
        │
        └─ Client components → TanStack Query
                │
                ▼
         /api/* routes
                │
                ├─ Check Vercel KV cache → HIT: return cached
                │
                └─ MISS: query Neon → store in KV → return
```

---

## Caching layers

### Layer 1: Vercel Edge / CDN
- Static assets (JS, CSS, images) served from edge.
- Item render images cached at edge after first fetch.

### Layer 2: Next.js `unstable_cache` / ISR
- Player and guild profile pages revalidated every 5 minutes.
- `fetch` calls in Server Components use Next.js data cache.

### Layer 3: Vercel KV (Redis)
- Precomputed meta stats (builds, tier list, matchup matrix) cached 1 hour.
- Kill feeds cached 60 seconds.
- Freshness state (per-region ingestion status) stored here for fast reads.

### Layer 4: Neon (Postgres)
- Source of truth for all kills and precomputed snapshots.
- `meta_snapshots` is the primary read table — the UI never runs live
  aggregations against the raw `kills` table.

---

## Page architecture (Next.js App Router)

### Server-rendered pages (SSR/ISR)
These pages benefit from SSR for SEO and social share previews:
- `/players/[id]` — player profiles
- `/guilds/[id]` — guild pages
- `/battles/[id]` — battle reports

Use `generateMetadata()` to populate Open Graph tags with player/guild names
and stats. Revalidate every 5 minutes.

### Client-heavy pages (SPA-style with React Server Components shell)
These pages have heavy interactivity and filtering:
- `/builds` — build explorer with filter controls
- `/meta` — tier list with region/content-type/IP toggles

Pattern: RSC shell fetches initial data server-side for fast first paint.
Client components hydrate and use TanStack Query for subsequent filter
changes without full page reload.

### Static pages
- `/` (landing)
- `/about`

---

## Multi-region handling

All three SBI servers (West, EU, Asia) are polled independently. Region is
stored on every `kills` row. The UI defaults to showing `all` regions
combined, with a region filter available on all analytics views.

The ingestion cron runs three separate jobs — one per region — rather than
one combined job. This means one region's API downtime doesn't block others.

Freshness state is tracked per region in both `ingestion_state` (DB) and
Vercel KV (for fast UI reads). The staleness banner in the UI shows
per-region status.

---

## Phase 1 implementation priority

Build in this order to have something functional as fast as possible:

1. **DB migrations** — run schema against Neon
2. **Item seed** — populate `items` from ao-bin-dumps
3. **Ingestion cron** — get kills flowing into DB (do this before anything else;
   every day without ingestion is history you lose forever)
4. **Kill feed API** — `/api/kills` with basic filters
5. **Kill feed UI** — homepage showing live kills with gear icons
6. **Player profile pages** — `/players/[id]`
7. **Nightly snapshot cron** — `meta_snapshots` aggregation
8. **Builds page** — weapon win rates from snapshots
9. **Classifier** — content type bucketing (can be added retroactively to
   existing kills via a backfill script)
10. **Matchup matrix** — build-vs-build chart

---

## Known constraints and mitigations

### Vercel function timeouts
- API routes: 30s timeout on Pro.
- Cron handlers must complete within 30s. Fetching 51 events + upsert is
  well within this. The nightly snapshot job may need to be chunked if it
  grows large — run it as multiple cron invocations with state in KV.

### Neon connection limits
- Neon serverless uses HTTP pooling via `@neondatabase/serverless`.
- Each Vercel function invocation gets its own connection. At scale, use
  Neon's connection pooler (PgBouncer) via the pooled `DATABASE_URL`.
- Max 100 concurrent connections on Neon free; 500 on Launch plan.

### No persistent processes on Vercel
- Vercel Cron is the only option for background work.
- The 1-minute cron interval on Pro is sufficient for ingestion.
- If cron isn't fast enough at high traffic, consider a small Railway/Fly.io
  worker for ingestion only, writing to the shared Neon DB.

### SBI API instability
- Ingest, deduplicate, and persist immediately.
- Never assume the API will be available.
- Surface data freshness prominently in UI — users should know when stats
  are stale, not silently confused.
