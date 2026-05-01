# API Routes

All routes live under `app/api/`. All responses follow a standard envelope:

```typescript
// Success
{ data: T, meta: ResponseMeta }

// Error
{ error: { code: string, message: string } }

interface ResponseMeta {
  generatedAt: string    // ISO timestamp
  freshness: {
    west:  RegionFreshness
    eu:    RegionFreshness
    asia:  RegionFreshness
  }
  cached: boolean
  cacheMaxAge?: number   // seconds
}

interface RegionFreshness {
  lastPolledAt: string | null
  consecutiveErrors: number
  isStale: boolean       // true if lastPolledAt > 5 minutes ago
}
```

All query params validated with **zod**. Return `400` with error body on
invalid params. Return `500` with generic error on unexpected failures —
never expose raw DB or stack trace output.

---

## Kills feed

### `GET /api/kills`

Returns the latest kill events, paginated.

**Query params**

| Param | Type | Default | Notes |
|---|---|---|---|
| `region` | `west\|eu\|asia\|all` | `all` | |
| `limit` | `1–100` | `25` | |
| `offset` | `number` | `0` | |
| `contentType` | `ContentType\|all` | `all` | |
| `weaponId` | `string` | — | Filter by killer or victim weapon item ID |
| `playerId` | `string` | — | Filter kills involving this player |
| `guildId` | `string` | — | Filter kills involving this guild |
| `minIp` | `number` | — | Minimum killer IP |
| `maxIp` | `number` | — | Maximum killer IP |

**Response**

```typescript
{
  data: {
    kills: KillSummary[]
    total: number
    hasMore: boolean
  }
}

interface KillSummary {
  id: number
  killedAt: string
  region: string
  contentType: string
  contentConfidence: number
  killer: {
    id: string
    name: string
    guildName: string | null
    ip: number | null
    mainhand: ItemRef | null
    gear: GearSnapshot
  }
  victim: {
    id: string
    name: string
    guildName: string | null
    ip: number | null
    mainhand: ItemRef | null
    gear: GearSnapshot
  }
  totalFame: number
  participants: number
}

interface ItemRef {
  id: string
  name: string
  renderUrl: string    // /api/items/{id}/render → redirect to render.albiononline.com
}
```

---

## Builds / meta

### `GET /api/meta/builds`

Returns precomputed weapon win rates from the latest snapshot.

**Query params**

| Param | Type | Default |
|---|---|---|
| `region` | `west\|eu\|asia\|all` | `all` |
| `contentType` | `ContentType\|all` | `all` |
| `ipBracket` | `IpBracket\|all` | `all` |
| `patchSlug` | `string` | — (uses latest) |
| `minSamples` | `number` | `50` |
| `slot` | `mainhand\|offhand\|head\|chest\|shoes\|cape` | `mainhand` |

**Response**

```typescript
{
  data: {
    weapons: WeaponWinRate[]
    snapshotDate: string
    patchSlug: string | null
  }
}
```

### `GET /api/meta/matchup`

Returns the weapon-vs-weapon matchup matrix from the latest snapshot.

**Query params**: same as `/api/meta/builds` minus `slot` and `minSamples`.

**Response**

```typescript
{
  data: {
    matrix: MatchupCell[]
    weapons: string[]           // ordered list of weapon subcategories in matrix
    snapshotDate: string
  }
}
```

### `GET /api/meta/counters`

Returns top counter-weapons for a given weapon.

**Query params**

| Param | Type | Required |
|---|---|---|
| `weapon` | `string` | Yes — weapon subcategory |
| `region` | `west\|eu\|asia\|all` | No |
| `contentType` | `ContentType\|all` | No |

**Response**

```typescript
{
  data: {
    weapon: string
    counters: CounterResult[]
  }
}

interface CounterResult {
  weaponId: string
  weaponName: string
  winRateAgainst: number
  sampleSize: number
}
```

### `GET /api/meta/trend`

Returns time-series win rate for a weapon.

**Query params**

| Param | Type | Notes |
|---|---|---|
| `weapon` | `string` | Weapon subcategory |
| `region` | `west\|eu\|asia\|all` | |
| `contentType` | `ContentType\|all` | |
| `days` | `7\|14\|30\|60\|90` | Default 30 |

**Response**

```typescript
{ data: { points: TrendPoint[], weapon: string } }
```

### `GET /api/meta/tier-list`

Returns auto-generated tier list for the current meta.

**Query params**: same as `/api/meta/builds`.

**Response**

```typescript
{
  data: {
    tiers: {
      S: WeaponWinRate[]
      A: WeaponWinRate[]
      B: WeaponWinRate[]
      C: WeaponWinRate[]
      D: WeaponWinRate[]
    }
    snapshotDate: string
  }
}
```

---

## Players

### `GET /api/players/search`

Fuzzy search for players by name.

| Param | Type | Notes |
|---|---|---|
| `q` | `string` | Min 2 chars |
| `limit` | `1–20` | Default 10 |

### `GET /api/players/[id]`

Player profile with aggregated stats.

**Response**

```typescript
{
  data: {
    player: PlayerProfile
    recentKills: KillSummary[]
    recentDeaths: KillSummary[]
    stats: PlayerStats
  }
}

interface PlayerStats {
  totalKills: number
  totalDeaths: number
  kd: number
  totalFame: number
  avgKillerIp: number | null
  favoriteWeapons: { weaponId: string; weaponName: string; count: number }[]
  killsByContentType: Record<ContentType, number>
  region: string
}
```

### `GET /api/players/[id]/kills`

Paginated kills for a player. Same params as `/api/kills` minus `playerId`.

### `GET /api/players/[id]/deaths`

Paginated deaths for a player.

---

## Guilds

### `GET /api/guilds/search`

Fuzzy search for guilds.

### `GET /api/guilds/[id]`

Guild profile with aggregated stats.

### `GET /api/guilds/[id]/kills`

Recent kills involving guild members.

### `GET /api/guilds/[id]/battles`

Recent battles the guild participated in.

---

## Items

### `GET /api/items/[id]`

Returns item metadata from the local dictionary.

```typescript
{ data: { item: Item } }
```

### `GET /api/items/[id]/render`

Redirects to the cached item image. If not cached, fetches from
`render.albiononline.com`, stores in Vercel Blob (or `/public/items/img/`
for local dev), then redirects.

```
302 → /items/img/{id}.png
```

---

## Cron handlers

All require `Authorization: Bearer ${CRON_SECRET}`.

### `POST /api/cron/ingest`

| Param | Notes |
|---|---|
| `?region=west\|eu\|asia` | Required |

Polls 51 new kill events for the given region. Returns:
```typescript
{ fetched: number, inserted: number, region: string, error?: string }
```

### `POST /api/cron/snapshot`

Runs nightly meta snapshot aggregation across all region/contentType/ipBracket
combinations. Returns:
```typescript
{ snapshotsWritten: number, errors: string[] }
```

---

## Caching strategy

| Route | Cache | TTL |
|---|---|---|
| `/api/kills` | Vercel KV | 60s |
| `/api/meta/builds` | Vercel KV | 1hr |
| `/api/meta/matchup` | Vercel KV | 1hr |
| `/api/meta/tier-list` | Vercel KV | 1hr |
| `/api/meta/trend` | Vercel KV | 6hr |
| `/api/players/[id]` | `next/cache` revalidate 300s | |
| `/api/players/search` | None | |
| `/api/guilds/[id]` | `next/cache` revalidate 300s | |
| `/api/items/[id]` | `next/cache` revalidate 86400s | |

Cache keys are namespaced: `albion:meta:builds:{region}:{contentType}:{ipBracket}:{date}`
