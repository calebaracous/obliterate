# Content-Type Classifier

The SBI gameinfo API does not expose the PvP zone subtype (Corrupted Dungeon,
Hellgate, Mists, open-world, etc.). This classifier infers `content_type` from
observable signals in each kill event. Results are probabilistic — always
surface the `content_confidence` score in the UI so users know when a
classification is uncertain.

Lives in `lib/classifier/classify.ts`.

---

## Content types

| `content_type` | Description |
|---|---|
| `solo` | 1v1 open-world fight |
| `corrupted` | Corrupted Dungeon (1v1 instanced) |
| `mists_1v1` | Mists solo portal (1v1) |
| `mists_2v2` | Mists duo portal (2v2) |
| `hellgate_2v2` | 2v2 Hellgate |
| `hellgate_5v5` | 5v5 Hellgate |
| `small_scale` | 3–9 players per side, open world |
| `zvz` | 10+ players per side, guild vs guild |
| `gank` | Heavily asymmetric fight (e.g. 5v1) |
| `unknown` | Classifier cannot determine with confidence |

---

## Input signals

Each kill event provides:

| Signal | Source | Notes |
|---|---|---|
| `participants` | `NumberOfParticipants` | Total players SBI counted in the fight |
| `killer_party_size` | `GroupMembers.length + 1` | Killer's party |
| `victim_party_size` | Inferred from `Participants` minus killer party | Approximate |
| `total_fame` | `TotalVictimKillFame` | Victim's fame dropped |
| `killer_ip` | Computed from gear | Killer's item power |
| `victim_ip` | Computed from gear | Victim's item power |
| `kill_zone` | `Location` field | Zone name string — often null |
| `killed_at` | `TimeStamp` | Time of kill |
| `killer_gear.mainhand` | Normalized gear | Some weapons are content-specific |

---

## Classifier algorithm

```typescript
// lib/classifier/classify.ts

interface ClassifyInput {
  participants: number
  killerPartySize: number | null
  victimPartySize: number | null
  totalFame: number
  killerIp: number | null
  victimIp: number | null
  killZone: string | null
  killedAt: Date
  killerMainhand: string | null
}

interface ClassifyResult {
  contentType: ContentType
  contentConfidence: number  // 0.0–1.0
}

export function classify(input: ClassifyInput): ClassifyResult {
  const signals = extractSignals(input)
  const scores = scoreContentTypes(signals)
  const best = argmax(scores)

  return {
    contentType: best.type,
    contentConfidence: best.score,
  }
}
```

### Signal extraction

```typescript
function extractSignals(input: ClassifyInput) {
  const ipDelta = input.killerIp && input.victimIp
    ? Math.abs(input.killerIp - input.victimIp)
    : null

  const asymmetryRatio = input.killerPartySize && input.victimPartySize
    ? Math.max(input.killerPartySize, input.victimPartySize) /
      Math.min(input.killerPartySize, input.victimPartySize)
    : null

  return {
    participants:     input.participants,
    killerParty:      input.killerPartySize ?? 1,
    victimParty:      input.victimPartySize ?? 1,
    fame:             input.totalFame,
    ipDelta,
    asymmetryRatio,
    zoneHint:         parseZoneHint(input.killZone),
    isWeekend:        isWeekend(input.killedAt),
    isPeakHour:       isPeakHour(input.killedAt),     // 19:00–23:00 UTC
    weaponCategory:   getWeaponCategory(input.killerMainhand),
  }
}
```

### Scoring rules

Each content type accumulates a score from 0.0–1.0 based on matching signals.
Scores are not exclusive — the highest scorer wins.

#### `corrupted` (Corrupted Dungeon)
- `participants === 2` → +0.4
- `killerParty === 1 && victimParty === 1` → +0.3
- `fame >= 50_000 && fame <= 800_000` → +0.2 (CDs have characteristic fame range)
- `ipDelta < 200` → +0.1 (CD matchmaking keeps IPs close)
- Zone hint contains "corrupted" → +0.5 (rare, but use it when present)

#### `mists_1v1`
- `participants === 2` → +0.4
- `killerParty === 1 && victimParty === 1` → +0.3
- `fame >= 10_000 && fame <= 200_000` → +0.2 (Mists kills tend to be lower fame)
- `ipDelta < 100` → +0.1 (Mists also matchmakes by IP range)

> Distinguishing `corrupted` from `mists_1v1` is the hardest classification.
> Use fame range as the primary discriminator — Corrupted Dungeons gate on
> higher fame victims. If confidence < 0.6, classify as `corrupted` (it's
> more common) but cap confidence at 0.55.

#### `mists_2v2`
- `participants === 4` → +0.5
- `killerParty === 2 && victimParty === 2` → +0.4
- `fame >= 10_000 && fame <= 200_000` → +0.1

#### `hellgate_2v2`
- `participants === 4` → +0.4
- `killerParty === 2 && victimParty === 2` → +0.3
- `fame >= 200_000` → +0.2 (Hellgates tend to have higher-fame victims)
- `ipDelta > 100` → +0.1 (Hellgates don't IP-match)

#### `hellgate_5v5`
- `participants >= 8 && participants <= 12` → +0.5
- `killerParty >= 4 && killerParty <= 6` → +0.3
- `victimParty >= 4 && victimParty <= 6` → +0.2

#### `solo`
- `participants === 2` → +0.3
- `killerParty === 1 && victimParty === 1` → +0.3
- `fame < 50_000` → +0.2 (low-value open-world kill)
- `ipDelta > 200` → +0.2 (no matchmaking → IP mismatch common)

#### `gank`
- `asymmetryRatio >= 3` → +0.6
- `participants >= 3` → +0.2
- `victimParty === 1` → +0.2

#### `small_scale`
- `participants >= 3 && participants <= 18` → +0.4
- `asymmetryRatio < 3` → +0.3
- `killerParty >= 2 && killerParty <= 9` → +0.3

#### `zvz`
- `participants >= 20` → +0.5
- `killerParty >= 10` → +0.3
- `fame >= 1_000_000` → +0.2 (ZvZ generates massive fame events)
- `isPeakHour` → +0.1 (ZvZs happen in scheduled prime time)

---

## Zone hint parsing

```typescript
function parseZoneHint(zone: string | null): ZoneHint {
  if (!zone) return 'unknown'
  const z = zone.toLowerCase()
  if (z.includes('corrupted'))     return 'corrupted'
  if (z.includes('hellgate'))      return 'hellgate'
  if (z.includes('mists'))         return 'mists'
  if (z.includes('roads'))         return 'roads'
  if (z.includes('black zone'))    return 'blackzone'
  if (z.includes('red zone'))      return 'redzone'
  if (z.includes('yellow'))        return 'yellowzone'
  return 'unknown'
}
```

Zone hints are rare but high-value. When present and unambiguous, they
override the scoring model (confidence → 0.95).

---

## Confidence thresholds

| Confidence | UI treatment |
|---|---|
| ≥ 0.80 | Show content type label normally |
| 0.60–0.79 | Show label with `~` prefix (e.g. "~Corrupted") |
| 0.40–0.59 | Show label with tooltip: "Low confidence classification" |
| < 0.40 | Show as "Unknown" |

---

## Evaluating the classifier

`scripts/eval-classifier.ts` runs the classifier against a hand-labeled
sample of 500 kills (stored in `scripts/classifier-eval-set.json`) and
outputs precision/recall per content type.

```bash
npm run classifier:eval
```

Update the eval set and retune weights when:
- SBI changes zone naming conventions.
- A new content type is added to the game.
- Community feedback identifies systematic misclassifications.

---

## Future improvements

- **Weapon category signal**: Some weapons are strongly correlated with content
  type (e.g. Primal Staff → ZvZ/5v5, not solo). Incorporate weapon subcategory
  as a signal once enough labeled data exists.
- **Temporal clustering**: ZvZs happen in bursts. If many ZvZ-classified kills
  share the same 30-minute window and overlapping guilds, boost their
  confidence scores retroactively.
- **Community corrections**: Allow logged-in users to flag misclassified kills.
  Accumulate corrections as a labeled training set for a future ML classifier.
