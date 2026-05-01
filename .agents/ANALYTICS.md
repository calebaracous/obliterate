# Analytics Engine

All analytics logic lives in `lib/analytics/`. Nothing in this module touches
React or Next.js — it is pure TypeScript that can run in API routes, cron jobs,
or scripts.

---

## Win-rate computation

### Definition

> **Win rate** for weapon W = kills where killer used W / (kills where killer
> used W + kills where victim used W)
>
> Interpreted as: "when weapon W appears in a fight, how often is its user
> the one left standing?"

This is the same definition Murder Ledger uses. It's intuitive and avoids
the need to define "loss" explicitly.

### Query pattern

The core aggregation runs against the `kills` table. For performance, the UI
serves results from `meta_snapshots` (precomputed nightly), not live queries.

```typescript
// lib/analytics/win-rate.ts

interface WinRateOptions {
  region: 'west' | 'eu' | 'asia' | 'all'
  contentType: ContentType | 'all'
  ipBracket: IpBracket | 'all'
  patchSlug?: string
  days?: number     // rolling window if no patchSlug
  minSamples?: number  // suppress results below this threshold (default: 50)
}

interface WeaponWinRate {
  weaponId: string
  weaponName: string
  subcategory: string
  kills: number          // times this weapon appeared on the winning side
  deaths: number         // times this weapon appeared on the losing side
  winRate: number        // kills / (kills + deaths), 0.0–1.0
  sampleSize: number     // kills + deaths
  confidence: 'high' | 'medium' | 'low'  // based on sampleSize
}
```

```sql
-- Win-rate query (simplified — actual uses parameterized Drizzle query)
SELECT
  item_id,
  SUM(CASE WHEN side = 'killer' THEN 1 ELSE 0 END) AS kills,
  SUM(CASE WHEN side = 'victim' THEN 1 ELSE 0 END) AS deaths,
  COUNT(*) AS sample_size,
  SUM(CASE WHEN side = 'killer' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) AS win_rate
FROM (
  -- Killer mainhand weapons
  SELECT (killer_gear -> 'mainhand' ->> 'id') AS item_id, 'killer' AS side
  FROM kills
  WHERE killed_at >= NOW() - INTERVAL '7 days'
    AND region = $region
    AND content_type = $content_type
    AND killer_ip BETWEEN $ip_min AND $ip_max
    AND (killer_gear -> 'mainhand') IS NOT NULL

  UNION ALL

  -- Victim mainhand weapons
  SELECT (victim_gear -> 'mainhand' ->> 'id') AS item_id, 'victim' AS side
  FROM kills
  WHERE killed_at >= NOW() - INTERVAL '7 days'
    AND region = $region
    AND content_type = $content_type
    AND victim_ip BETWEEN $ip_min AND $ip_max
    AND (victim_gear -> 'mainhand') IS NOT NULL
) weapon_appearances
GROUP BY item_id
HAVING COUNT(*) >= $min_samples
ORDER BY win_rate DESC
```

### Confidence tiers

| Sample size | Confidence | UI indicator |
|---|---|---|
| ≥ 200 | `high` | Show as-is |
| 50–199 | `medium` | Show with `*` note |
| < 50 | `low` | Suppress or show with warning |

---

## IP brackets

```typescript
// types/app.ts

export type IpBracket = 'all' | '900-1100' | '1100-1300' | '1300-1500' | '1500+'

export const IP_BRACKETS: Record<IpBracket, { min: number; max: number }> = {
  'all':       { min: 0,    max: 99999 },
  '900-1100':  { min: 900,  max: 1099 },
  '1100-1300': { min: 1100, max: 1299 },
  '1300-1500': { min: 1300, max: 1499 },
  '1500+':     { min: 1500, max: 99999 },
}
```

IP bracket filtering uses the killer's IP for both the killer and victim weapons
(i.e. "show me what weapon X players in this IP range are using and how they
perform"). This avoids conflating the victim's gear with the killer's bracket.

---

## Build-vs-build matchup matrix

### Definition

> **Win rate of weapon A vs weapon B** = fights where A killed B / (fights
> where A killed B + fights where B killed A), when both weapons were the
> respective mainhands.

This is a square matrix of all weapon subcategories vs all weapon subcategories.
Stored as the `matchup_matrix` JSONB column in `meta_snapshots`.

### Computation

```typescript
// lib/analytics/matchup.ts

interface MatchupCell {
  attackerId: string   // weapon subcategory ID (e.g. "cursedstaff")
  victimId: string
  kills: number        // A killed B this many times
  winRate: number      // kills / (kills + deaths where A was victim, B was killer)
  sampleSize: number
}

// Query: for each (attacker_mainhand_subcategory, victim_mainhand_subcategory) pair,
// count how often each direction wins.
```

```sql
SELECT
  i_killer.subcategory AS attacker_subcategory,
  i_victim.subcategory AS victim_subcategory,
  COUNT(*) AS kills
FROM kills k
JOIN items i_killer ON i_killer.id = (k.killer_gear -> 'mainhand' ->> 'id')
JOIN items i_victim  ON i_victim.id  = (k.victim_gear  -> 'mainhand' ->> 'id')
WHERE k.killed_at >= NOW() - INTERVAL '30 days'
  AND k.content_type = $content_type
  AND i_killer.subcategory IS NOT NULL
  AND i_victim.subcategory IS NOT NULL
GROUP BY i_killer.subcategory, i_victim.subcategory
HAVING COUNT(*) >= 20
```

Post-query: compute symmetric win rates (A vs B = A_kills / (A_kills + B_kills
where roles are reversed).

### Matrix display

The matchup matrix is displayed as a D3 heatmap in `components/charts/MatchupMatrix.tsx`.
Color scale: red (≤ 40% win rate) → gray (50%) → green (≥ 60%).

---

## Meta tier list

Weapons are auto-tiered based on a composite score:

```typescript
// lib/analytics/tier-list.ts

function computeTierScore(weapon: WeaponWinRate): number {
  // Win rate weighted by sample size (Wilson score lower bound)
  const wilsonScore = wilsonLowerBound(weapon.kills, weapon.sampleSize)

  // Popularity factor: avoid over-ranking niche weapons with lucky streaks
  const popularityFactor = Math.log10(weapon.sampleSize + 1) / 4

  return wilsonScore * 0.8 + popularityFactor * 0.2
}

// Wilson score lower bound for a proportion
function wilsonLowerBound(successes: number, total: number, z = 1.96): number {
  if (total === 0) return 0
  const p = successes / total
  const denom = 1 + (z * z) / total
  const centre = p + (z * z) / (2 * total)
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total)
  return (centre - spread) / denom
}
```

Tier thresholds (tunable — start with these and adjust after seeing real data):

| Tier | Score threshold |
|---|---|
| S | ≥ 0.58 |
| A | ≥ 0.52 |
| B | ≥ 0.48 |
| C | ≥ 0.44 |
| D | < 0.44 |

---

## Counter-build finder

Given a weapon W, find weapons with the highest win rate *against* W:

```typescript
// lib/analytics/counters.ts

export async function findCounters(
  weaponSubcategory: string,
  options: WinRateOptions
): Promise<CounterResult[]> {
  // From matchup matrix: rows where victimId === weaponSubcategory
  // Sort by win rate DESC, return top 5
  const cells = await getMatchupCells({ victimId: weaponSubcategory, ...options })
  return cells
    .filter(c => c.sampleSize >= 30)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5)
    .map(c => ({
      weaponId: c.attackerId,
      winRateAgainst: c.winRate,
      sampleSize: c.sampleSize,
    }))
}
```

---

## Trend tracking

The nightly snapshot cron writes one `meta_snapshots` row per
(region × content_type × ip_bracket) combination. The trend API reads
snapshots over a date range and returns the time series.

```typescript
// GET /api/meta/trend?weapon=cursedstaff&contentType=solo&region=west&days=30

interface TrendPoint {
  date: string        // YYYY-MM-DD
  winRate: number
  sampleSize: number
}
```

Trend charts use Observable Plot in `components/charts/TrendLine.tsx`.

---

## Precomputed snapshot cron

The `meta:snapshot` cron runs at 02:00 UTC and writes snapshots for:
- Regions: `west`, `eu`, `asia`, `all`
- Content types: all 10 types + `all`
- IP brackets: all 5 brackets
- Window: last 7 days (regenerates daily to catch late-arriving kills)
- Current patch slug

Total combinations: 4 × 11 × 5 = 220 rows per nightly run.

Each row's `weapon_stats` JSON is ~5–50KB depending on how many weapons have
enough data. The `matchup_matrix` JSON per row is ~50–200KB.

Total snapshot table size: modest. Index on `(region, content_type,
ip_bracket, snapshot_date DESC)` keeps reads fast.

---

## Serving analytics to the UI

```
UI request → /api/meta/builds?region=west&contentType=solo&ipBracket=1300-1500
           → Read latest meta_snapshot from Neon (index scan, <10ms)
           → Cache in Vercel KV for 1 hour
           → Return { data: WeaponWinRate[], meta: { snapshotDate, freshness } }
```

Never run live aggregation queries against `kills` in response to a user
request. Always serve from `meta_snapshots`. The live data lag is at most
24 hours (snapshot age) + ingestion lag (≤ 2 minutes normally).
