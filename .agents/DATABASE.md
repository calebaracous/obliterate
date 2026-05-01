# Database — Schema, Indexes & Migration Notes

ORM: **Drizzle ORM** with `drizzle-kit` for migrations.
DB: **Neon Postgres 16** (serverless).

All schema lives in `lib/db/schema.ts`. Run `npm run db:generate` after schema
changes, then `npm run db:migrate` to apply.

---

## Tables

### `items`

Populated once from `ao-bin-dumps` JSON on first run, then re-seeded on each
game patch. This is the source of truth for resolving item IDs to human names.

```sql
CREATE TABLE items (
  id            TEXT PRIMARY KEY,           -- e.g. "T8_MAIN_CURSEDSTAFF_MORGANA"
  name          TEXT NOT NULL,              -- "Cursed Skull"
  name_en       TEXT NOT NULL,
  name_de       TEXT,
  name_fr       TEXT,
  name_ru       TEXT,
  name_zh       TEXT,
  name_ko       TEXT,
  name_ja       TEXT,
  name_es       TEXT,
  name_pt       TEXT,
  name_pl       TEXT,
  tier          SMALLINT NOT NULL,          -- 1–8
  enchantment   SMALLINT NOT NULL DEFAULT 0, -- 0–4
  slot          TEXT NOT NULL,              -- mainhand, offhand, head, chest, shoes, cape, bag, food, potion, mount
  category      TEXT NOT NULL,             -- weapon, armor, accessory, consumable, mount
  subcategory   TEXT,                      -- e.g. "cursedstaff", "sword", "cloth_armor"
  two_handed    BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX items_slot_idx ON items(slot);
CREATE INDEX items_category_idx ON items(category);
CREATE INDEX items_subcategory_idx ON items(subcategory);
```

### `kills`

Core table. One row per kill event. Populated by the ingestion cron.

```sql
CREATE TABLE kills (
  id              BIGINT PRIMARY KEY,          -- SBI kill event ID
  region          TEXT NOT NULL,               -- 'west' | 'eu' | 'asia'
  killed_at       TIMESTAMPTZ NOT NULL,

  -- Killer
  killer_id       TEXT NOT NULL,               -- SBI player ID (UUID)
  killer_name     TEXT NOT NULL,
  killer_guild_id TEXT,
  killer_alliance_id TEXT,
  killer_ip       REAL,                        -- Item Power at time of kill
  killer_avg_ip   REAL,                        -- Average IP (if different from equipped)

  -- Victim
  victim_id       TEXT NOT NULL,
  victim_name     TEXT NOT NULL,
  victim_guild_id TEXT,
  victim_alliance_id TEXT,
  victim_ip       REAL,
  victim_avg_ip   REAL,

  -- Gear snapshots (full slot breakdown as JSONB for flexibility)
  killer_gear     JSONB NOT NULL DEFAULT '{}', -- { mainhand, offhand, head, chest, shoes, cape, bag, food, potion, mount }
  victim_gear     JSONB NOT NULL DEFAULT '{}',

  -- Battle context
  participants    SMALLINT NOT NULL DEFAULT 2, -- total players involved (killer+assists+victim allies visible)
  killer_party_size SMALLINT,
  victim_party_size SMALLINT,
  total_fame      BIGINT,                      -- victim's fame lost (proxy for content tier)
  kill_zone       TEXT,                        -- zone/cluster name from SBI (often null)

  -- Classification (set by classifier after ingestion)
  content_type    TEXT,                        -- 'solo' | '2v2' | '5v5' | 'zvz' | 'corrupted' | 'hellgate' | 'mists_1v1' | 'mists_2v2' | 'unknown'
  content_confidence REAL,                     -- 0.0–1.0 classifier confidence

  -- Patch tracking
  patch_slug      TEXT,                        -- e.g. "2025-03" populated from patches table

  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary access patterns
CREATE INDEX kills_killed_at_idx ON kills(killed_at DESC);
CREATE INDEX kills_region_killed_at_idx ON kills(region, killed_at DESC);
CREATE INDEX kills_killer_id_idx ON kills(killer_id);
CREATE INDEX kills_victim_id_idx ON kills(victim_id);
CREATE INDEX kills_killer_guild_idx ON kills(killer_guild_id) WHERE killer_guild_id IS NOT NULL;
CREATE INDEX kills_victim_guild_idx ON kills(victim_guild_id) WHERE victim_guild_id IS NOT NULL;
CREATE INDEX kills_content_type_idx ON kills(content_type, killed_at DESC);
CREATE INDEX kills_patch_idx ON kills(patch_slug, killed_at DESC);

-- JSONB index for gear lookups (weapon win rates)
CREATE INDEX kills_killer_mainhand_idx ON kills USING GIN ((killer_gear -> 'mainhand'));
CREATE INDEX kills_victim_mainhand_idx ON kills USING GIN ((victim_gear -> 'mainhand'));
```

> **Gear JSONB shape** — each gear slot value is `{ id: string, ip: number } | null`:
> ```json
> {
>   "mainhand": { "id": "T8_MAIN_CURSEDSTAFF_MORGANA", "ip": 1247 },
>   "offhand":  { "id": "T8_OFF_BOOK", "ip": 1198 },
>   "head":     null,
>   "chest":    { "id": "T8_ARMOR_CLOTH_ROYAL", "ip": 1301 },
>   "shoes":    { "id": "T8_SHOES_CLOTH_ROYAL", "ip": 1289 },
>   "cape":     { "id": "T7_CAPE", "ip": 1100 },
>   "bag":      { "id": "T8_BAG", "ip": 0 },
>   "food":     { "id": "T8_FOOD_PIE_FISH", "ip": 0 },
>   "potion":   { "id": "T8_POTION_INVISIBILITY", "ip": 0 },
>   "mount":    { "id": "T8_MOUNT_DIREWOLF_FW", "ip": 0 }
> }
> ```

### `battles`

Aggregated battle records. Populated from the `/battles` gameinfo endpoint.
Used for ZvZ and guild-level analytics.

```sql
CREATE TABLE battles (
  id              BIGINT PRIMARY KEY,
  region          TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ NOT NULL,
  total_kills     INT NOT NULL DEFAULT 0,
  total_fame      BIGINT NOT NULL DEFAULT 0,
  player_count    INT NOT NULL DEFAULT 0,
  guild_count     INT NOT NULL DEFAULT 0,
  alliance_count  INT NOT NULL DEFAULT 0,

  -- Top guilds/alliances by kill fame (JSONB array, max 10)
  guilds          JSONB NOT NULL DEFAULT '[]',
  alliances       JSONB NOT NULL DEFAULT '[]',

  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX battles_started_at_idx ON battles(started_at DESC);
CREATE INDEX battles_region_idx ON battles(region, started_at DESC);
```

### `players`

Lightweight player cache. Upserted whenever a player appears in a kill event.
Not a full profile — just enough to power search and profile pages without
hitting the gameinfo API on every page load.

```sql
CREATE TABLE players (
  id              TEXT PRIMARY KEY,        -- SBI UUID
  name            TEXT NOT NULL,
  guild_id        TEXT,
  guild_name      TEXT,
  alliance_id     TEXT,
  alliance_name   TEXT,
  total_kills     INT NOT NULL DEFAULT 0,
  total_deaths    INT NOT NULL DEFAULT 0,
  total_fame      BIGINT NOT NULL DEFAULT 0,
  last_seen_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX players_name_trgm_idx ON players USING GIN (name gin_trgm_ops);
CREATE INDEX players_guild_idx ON players(guild_id) WHERE guild_id IS NOT NULL;
```

> Requires `pg_trgm` extension for fuzzy name search. Enable with:
> `CREATE EXTENSION IF NOT EXISTS pg_trgm;`

### `guilds`

```sql
CREATE TABLE guilds (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  alliance_id     TEXT,
  alliance_name   TEXT,
  member_count    INT,
  kill_fame       BIGINT NOT NULL DEFAULT 0,
  death_fame      BIGINT NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX guilds_name_trgm_idx ON guilds USING GIN (name gin_trgm_ops);
```

### `patches`

Manual table. Seed when SBI releases patch notes. Used to bucket win-rate
snapshots by game version.

```sql
CREATE TABLE patches (
  slug            TEXT PRIMARY KEY,        -- e.g. "2025-03-rise-of-avalon"
  label           TEXT NOT NULL,           -- "Rise of Avalon — March 2025"
  released_at     TIMESTAMPTZ NOT NULL,
  notes_url       TEXT
);
```

### `meta_snapshots`

Precomputed daily rollups. Written by the `meta:snapshot` cron job.
Avoids recomputing win rates from raw kills on every page load.

```sql
CREATE TABLE meta_snapshots (
  id              BIGSERIAL PRIMARY KEY,
  snapshot_date   DATE NOT NULL,
  region          TEXT NOT NULL,           -- 'west' | 'eu' | 'asia' | 'all'
  content_type    TEXT NOT NULL,           -- 'solo' | '2v2' | 'zvz' | ... | 'all'
  ip_bracket      TEXT NOT NULL,           -- 'all' | '1100-1300' | '1300-1500' | '1500+'
  patch_slug      TEXT,

  -- Serialized win-rate data for all weapons in this slice
  -- Array of { weapon_id, weapon_name, kills, deaths, win_rate, sample_size }
  weapon_stats    JSONB NOT NULL DEFAULT '[]',

  -- Matchup matrix: weapon A vs weapon B
  -- Array of { attacker_id, victim_id, kills, win_rate }
  matchup_matrix  JSONB NOT NULL DEFAULT '[]',

  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(snapshot_date, region, content_type, ip_bracket)
);

CREATE INDEX meta_snapshots_date_idx ON meta_snapshots(snapshot_date DESC);
CREATE INDEX meta_snapshots_lookup_idx ON meta_snapshots(region, content_type, ip_bracket, snapshot_date DESC);
```

### `ingestion_state`

Tracks polling cursors per region so cron jobs resume from the last known
position after a restart.

```sql
CREATE TABLE ingestion_state (
  region          TEXT PRIMARY KEY,        -- 'west' | 'eu' | 'asia'
  last_event_id   BIGINT,                  -- highest kill event ID seen
  last_polled_at  TIMESTAMPTZ,
  consecutive_errors INT NOT NULL DEFAULT 0,
  last_error      TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Drizzle schema location

All tables defined in `lib/db/schema.ts` using Drizzle's `pgTable` builder.
Migration files auto-generated into `lib/db/migrations/`.

```typescript
// lib/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

---

## npm scripts

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "db:push": "drizzle-kit push",
  "seed:items": "npx tsx scripts/seed-items.ts",
  "seed:patches": "npx tsx scripts/seed-patches.ts"
}
```

---

## Performance notes

- The `kills` table will be the largest. Add a Postgres `BRIN` index on
  `killed_at` if the table grows past ~50M rows.
- `meta_snapshots` is the primary read path for the UI — keep it small and
  precomputed. The nightly snapshot cron should regenerate the last 7 days
  of snapshots on every run to handle late-arriving kills.
- Neon's connection pooling (`DATABASE_URL`) uses PgBouncer. Use the unpooled
  URL (`DATABASE_URL_UNPOOLED`) only in migration scripts and one-off jobs
  that need DDL or `LISTEN/NOTIFY`.
- Enable `pg_stat_statements` in Neon console to monitor slow queries.
