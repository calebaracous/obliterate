export type ContentType =
  | 'solo'
  | 'corrupted'
  | 'mists_1v1'
  | 'mists_2v2'
  | 'hellgate_2v2'
  | 'hellgate_5v5'
  | 'small_scale'
  | 'zvz'
  | 'gank'
  | 'unknown'

export interface ClassifyInput {
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

export interface ClassifyResult {
  contentType: ContentType
  contentConfidence: number
}

type ZoneHint =
  | 'corrupted'
  | 'hellgate'
  | 'mists'
  | 'roads'
  | 'blackzone'
  | 'redzone'
  | 'yellowzone'
  | 'unknown'

function parseZoneHint(zone: string | null): ZoneHint {
  if (!zone) return 'unknown'
  const z = zone.toLowerCase()
  if (z.includes('corrupted')) return 'corrupted'
  if (z.includes('hellgate')) return 'hellgate'
  if (z.includes('mists')) return 'mists'
  if (z.includes('roads')) return 'roads'
  if (z.includes('black zone')) return 'blackzone'
  if (z.includes('red zone')) return 'redzone'
  if (z.includes('yellow')) return 'yellowzone'
  return 'unknown'
}

function isPeakHour(date: Date): boolean {
  const hour = date.getUTCHours()
  return hour >= 19 && hour <= 23
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay()
  return day === 0 || day === 6
}

// Placeholder — weapon category signal reserved for future tuning
function getWeaponCategory(_mainhand: string | null): string | null {
  return null
}

interface Signals {
  participants: number
  killerParty: number
  victimParty: number
  fame: number
  ipDelta: number | null
  asymmetryRatio: number | null
  zoneHint: ZoneHint
  isWeekend: boolean
  isPeakHour: boolean
  weaponCategory: string | null
}

function extractSignals(input: ClassifyInput): Signals {
  const ipDelta =
    input.killerIp !== null && input.victimIp !== null
      ? Math.abs(input.killerIp - input.victimIp)
      : null

  const killerParty = input.killerPartySize ?? 1
  const victimParty = input.victimPartySize ?? 1

  const asymmetryRatio =
    input.killerPartySize !== null && input.victimPartySize !== null
      ? Math.max(killerParty, victimParty) / Math.min(killerParty, victimParty)
      : null

  return {
    participants: input.participants,
    killerParty,
    victimParty,
    fame: input.totalFame,
    ipDelta,
    asymmetryRatio,
    zoneHint: parseZoneHint(input.killZone),
    isWeekend: isWeekend(input.killedAt),
    isPeakHour: isPeakHour(input.killedAt),
    weaponCategory: getWeaponCategory(input.killerMainhand),
  }
}

function scoreContentTypes(s: Signals): Map<ContentType, number> {
  const scores = new Map<ContentType, number>()

  // corrupted
  {
    let score = 0
    if (s.participants === 2) score += 0.4
    if (s.killerParty === 1 && s.victimParty === 1) score += 0.3
    if (s.fame >= 50_000 && s.fame <= 800_000) score += 0.2
    if (s.ipDelta !== null && s.ipDelta < 200) score += 0.1
    if (s.zoneHint === 'corrupted') score += 0.5
    scores.set('corrupted', Math.min(1, score))
  }

  // mists_1v1
  {
    let score = 0
    if (s.participants === 2) score += 0.4
    if (s.killerParty === 1 && s.victimParty === 1) score += 0.3
    if (s.fame >= 10_000 && s.fame <= 200_000) score += 0.2
    if (s.ipDelta !== null && s.ipDelta < 100) score += 0.1
    if (s.zoneHint === 'mists') score += 0.5
    scores.set('mists_1v1', Math.min(1, score))
  }

  // mists_2v2
  {
    let score = 0
    if (s.participants === 4) score += 0.5
    if (s.killerParty === 2 && s.victimParty === 2) score += 0.4
    if (s.fame >= 10_000 && s.fame <= 200_000) score += 0.1
    if (s.zoneHint === 'mists') score += 0.3
    scores.set('mists_2v2', Math.min(1, score))
  }

  // hellgate_2v2
  {
    let score = 0
    if (s.participants === 4) score += 0.4
    if (s.killerParty === 2 && s.victimParty === 2) score += 0.3
    if (s.fame >= 200_000) score += 0.2
    if (s.ipDelta !== null && s.ipDelta > 100) score += 0.1
    if (s.zoneHint === 'hellgate') score += 0.3
    scores.set('hellgate_2v2', Math.min(1, score))
  }

  // hellgate_5v5
  {
    let score = 0
    if (s.participants >= 8 && s.participants <= 12) score += 0.5
    if (s.killerParty >= 4 && s.killerParty <= 6) score += 0.3
    if (s.victimParty >= 4 && s.victimParty <= 6) score += 0.2
    if (s.zoneHint === 'hellgate') score += 0.3
    scores.set('hellgate_5v5', Math.min(1, score))
  }

  // solo
  {
    let score = 0
    if (s.participants === 2) score += 0.3
    if (s.killerParty === 1 && s.victimParty === 1) score += 0.3
    if (s.fame < 50_000) score += 0.2
    if (s.ipDelta !== null && s.ipDelta > 200) score += 0.2
    scores.set('solo', Math.min(1, score))
  }

  // gank
  {
    let score = 0
    if (s.asymmetryRatio !== null && s.asymmetryRatio >= 3) score += 0.6
    if (s.participants >= 3) score += 0.2
    if (s.victimParty === 1) score += 0.2
    scores.set('gank', Math.min(1, score))
  }

  // small_scale
  {
    let score = 0
    if (s.participants >= 3 && s.participants <= 18) score += 0.4
    if (s.asymmetryRatio !== null && s.asymmetryRatio < 3) score += 0.3
    if (s.killerParty >= 2 && s.killerParty <= 9) score += 0.3
    scores.set('small_scale', Math.min(1, score))
  }

  // zvz
  {
    let score = 0
    if (s.participants >= 20) score += 0.5
    if (s.killerParty >= 10) score += 0.3
    if (s.fame >= 1_000_000) score += 0.2
    if (s.isPeakHour) score += 0.1
    scores.set('zvz', Math.min(1, score))
  }

  return scores
}

function argmax(scores: Map<ContentType, number>): { type: ContentType; score: number } {
  let bestType: ContentType = 'unknown'
  let bestScore = -Infinity

  for (const [type, score] of scores) {
    if (score > bestScore) {
      bestScore = score
      bestType = type
    }
  }

  return { type: bestType, score: bestScore }
}

export function classify(input: ClassifyInput): ClassifyResult {
  const signals = extractSignals(input)

  // Zone hint override — high confidence direct classification
  const { zoneHint } = signals
  if (zoneHint === 'corrupted') {
    return { contentType: 'corrupted', contentConfidence: 0.95 }
  }
  if (zoneHint === 'hellgate') {
    return { contentType: 'hellgate_5v5', contentConfidence: 0.75 }
  }
  if (zoneHint === 'mists') {
    return { contentType: 'mists_1v1', contentConfidence: 0.75 }
  }

  const scores = scoreContentTypes(signals)
  const best = argmax(scores)

  if (best.score < 0.4) {
    return { contentType: 'unknown', contentConfidence: best.score }
  }

  // Corrupted vs mists_1v1 disambiguation — when both types are close and
  // confidence is low, default to corrupted (it is more common) but cap at 0.55
  if (best.type === 'mists_1v1' || best.type === 'corrupted') {
    const corruptedScore = scores.get('corrupted') ?? 0
    const mistsScore = scores.get('mists_1v1') ?? 0
    const diff = Math.abs(corruptedScore - mistsScore)

    if (diff < 0.1 && best.score < 0.6) {
      return { contentType: 'corrupted', contentConfidence: Math.min(best.score, 0.55) }
    }
  }

  return { contentType: best.type, contentConfidence: best.score }
}
