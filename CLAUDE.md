@AGENTS.md

# Albion PvP Analytics — Claude Code Project Guide

This is the master reference file for Claude Code. Read this first, then refer to
the specific docs in `.agents/` for deeper context on each domain.

---

## Project summary

A public web tool that aggregates Albion Online killboard data to surface gear/build
win rates, meta trends, and recommendations for various PvP content types (solo, 2v2,
5v5, ZvZ, Corrupted Dungeons, Hellgates, Mists). The primary differentiator over
existing tools (Murder Ledger) is content-type bucketing, build-vs-build matchup
matrices, IP-bracket filtering, and multi-region coverage from day one.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR for player/guild pages, API routes for data |
| Language | TypeScript (strict mode) | All files `.ts` / `.tsx` |
| Database | Neon (Postgres 16) | Serverless Postgres; connection via `@neondatabase/serverless` |
| Cache | Upstash Redis (Vercel Marketplace) | Precomputed meta stats, leaderboards, freshness timestamps |
| Hosting | Vercel Pro | Edge-optimized deploys; Cron Jobs for ingestion |
| Styling | Tailwind CSS v4 | Design tokens defined in `.agents/DESIGN_SYSTEM_BRIEF.md` |
| Charts | Observable Plot + D3 | Win-rate matrices, trend lines, heatmaps |
| State | Zustand | Client-side UI state only (filters, selected regions) |
| Data fetching | TanStack Query v5 | Client-side data fetching with stale-while-revalidate |
| Testing | Vitest + Playwright | Unit + E2E |
| Linting | ESLint + Prettier | Config in repo root |

---

## Repository structure

```
/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Landing page, about
│   ├── builds/                   # Build explorer and matchup matrix
│   ├── meta/                     # Meta tier list and trend graphs
│   ├── players/[id]/             # Player profile pages
│   ├── guilds/[id]/              # Guild pages
│   ├── battles/[id]/             # Battle report pages
│   ├── api/                      # Next.js API routes
│   │   ├── cron/                 # Vercel Cron handlers (ingestion)
│   │   ├── kills/
│   │   ├── builds/
│   │   ├── players/
│   │   ├── guilds/
│   │   └── meta/
│   ├── layout.tsx
│   └── globals.css
├── components/                   # Shared UI components
│   ├── ui/                       # Primitives (Button, Badge, Card, etc.)
│   ├── charts/                   # Plot/D3 chart components
│   ├── kills/                    # Kill feed, kill card, gear display
│   ├── builds/                   # Build cards, matchup matrix
│   └── meta/                     # Tier list, trend sparklines
├── lib/                          # Core logic, no React
│   ├── db/                       # Neon client, query helpers
│   ├── cache/                    # Redis helpers
│   ├── ingestion/                # Gameinfo API polling + normalization
│   ├── classifier/               # Content-type inference engine
│   ├── analytics/                # Win-rate, matchup, meta computations
│   └── items/                    # Item dictionary loader from ao-bin-dumps
├── .agents/                      # Planning and architecture docs
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── INGESTION.md
│   ├── ANALYTICS.md
│   ├── CLASSIFIER.md
│   ├── API.md
│   ├── DESIGN_SYSTEM_BRIEF.md
│   └── PHASE1_CHECKLIST.md
├── scripts/                      # One-off scripts (seed items, backfill)
├── public/
│   └── items/                    # Cached item thumbnails (from render API)
├── types/                        # Shared TypeScript types
│   ├── albion.ts                 # Raw API response shapes
│   ├── db.ts                     # DB row types
│   └── app.ts                    # App-level domain types
├── vercel.json                   # Cron job definitions
└── .env.local.example
```

---

## Environment variables

```bash
# Neon
DATABASE_URL=                     # Neon connection string (pooled)
DATABASE_URL_UNPOOLED=            # Neon direct connection (for migrations)

# Upstash Redis (via Vercel Marketplace)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=

# Albion API (no auth required, just base URLs)
ALBION_API_WEST=https://gameinfo.albiononline.com/api/gameinfo
ALBION_API_EU=https://gameinfo-ams.albiononline.com/api/gameinfo
ALBION_API_ASIA=https://gameinfo-sgp.albiononline.com/api/gameinfo
ALBION_RENDER_API=https://render.albiononline.com/v1

# Cron secret (set in Vercel dashboard, validate in cron handlers)
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

---

## Key conventions

### TypeScript
- Strict mode. No `any`. Use `unknown` + type guards when needed.
- All API response types live in `types/albion.ts` and match the raw gameinfo API shape.
- App-level domain types live in `types/app.ts` — these are normalized from raw API types.

### Database access
- Use `@neondatabase/serverless` with the `neon()` tagged template function for simple queries.
- Use `drizzle-orm` for schema definition, migrations, and complex queries.
- Never use the pooled connection URL for migrations — use `DATABASE_URL_UNPOOLED`.
- All DB calls in `lib/db/`. No raw SQL in components or API routes.

### API routes
- All API routes return `{ data, meta: { freshness, region, generatedAt } }`.
- Use `next/cache` `unstable_cache` for expensive DB queries with `revalidate`.
- Validate all query params with `zod`.

### Error handling
- API routes: always return structured errors `{ error: { code, message } }`.
- Never expose raw DB errors to the client.
- Ingestion workers: log errors and continue — a single failed region poll must not crash the others.

### Cron jobs
- All cron handlers validate `Authorization: Bearer ${CRON_SECRET}` before executing.
- Cron jobs are fire-and-forget from Vercel's perspective; handle their own error logging.
- See `vercel.json` and `.agents/INGESTION.md` for the full cron schedule.

---

## Deployment workflow

**Single-branch, production-only.** There is no preview environment. All work happens directly on `main` — push to `main` and Vercel deploys to production automatically.

- No feature branches, no PRs, no preview deployments.
- `vercel.json` cron jobs run against the production deployment only.
- Vercel is configured with `commandForIgnoringBuildStep: '[ "$VERCEL_ENV" != "production" ]'` — any non-production build (preview, etc.) is skipped at the Vercel level.
- To deploy: `git push origin main`. That's it.
- To check deployment status: `vercel ls` or visit https://vercel.com/calebaracous-projects/obliterate.

---

## Getting started (local dev)

```bash
npm install
cp .env.local.example .env.local
# Fill in env vars — minimum needed locally: DATABASE_URL, KV_* vars

npm run db:migrate
npm run seed:items
npm run dev
```

---

## Reference docs

| File | What it covers |
|---|---|
| `.agents/ARCHITECTURE.md` | System design, data flow diagrams, caching strategy |
| `.agents/DATABASE.md` | Full schema, indexes, migration notes |
| `.agents/INGESTION.md` | Gameinfo API details, polling logic, cron schedule |
| `.agents/ANALYTICS.md` | Win-rate computation, matchup matrix, meta scoring |
| `.agents/CLASSIFIER.md` | Content-type inference algorithm |
| `.agents/API.md` | All internal API route specs |
| `.agents/DESIGN_SYSTEM_BRIEF.md` | Design tokens, color palette, component patterns |
| `.agents/PHASE1_CHECKLIST.md` | Phase 1 build checklist |
