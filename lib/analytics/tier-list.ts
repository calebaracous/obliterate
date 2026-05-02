import { WeaponWinRate } from './win-rate'

export function wilsonLowerBound(successes: number, total: number, z = 1.96): number {
  if (total === 0) return 0
  const p = successes / total
  const denom = 1 + (z * z) / total
  const centre = p + (z * z) / (2 * total)
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total)
  return (centre - spread) / denom
}

export function computeTierScore(weapon: WeaponWinRate): number {
  const wilsonScore = wilsonLowerBound(weapon.kills, weapon.sampleSize)
  const popularityFactor = Math.log10(weapon.sampleSize + 1) / 4
  return wilsonScore * 0.8 + popularityFactor * 0.2
}

const TIER_THRESHOLDS: Array<{ tier: 'S' | 'A' | 'B' | 'C' | 'D'; min: number }> = [
  { tier: 'S', min: 0.58 },
  { tier: 'A', min: 0.52 },
  { tier: 'B', min: 0.48 },
  { tier: 'C', min: 0.44 },
  { tier: 'D', min: -Infinity },
]

function scoreTier(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  for (const { tier, min } of TIER_THRESHOLDS) {
    if (score >= min) return tier
  }
  return 'D'
}

export function computeTierList(
  weapons: WeaponWinRate[],
): Record<'S' | 'A' | 'B' | 'C' | 'D', WeaponWinRate[]> {
  const result: Record<'S' | 'A' | 'B' | 'C' | 'D', WeaponWinRate[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  }

  for (const weapon of weapons) {
    const score = computeTierScore(weapon)
    const tier = scoreTier(score)
    result[tier].push(weapon)
  }

  for (const tier of ['S', 'A', 'B', 'C', 'D'] as const) {
    result[tier].sort((a, b) => computeTierScore(b) - computeTierScore(a))
  }

  return result
}
