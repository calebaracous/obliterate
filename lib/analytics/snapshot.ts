import { sql } from 'drizzle-orm'
import { db } from '../db/index'
import { metaSnapshots } from '../db/schema'
import { computeWeaponWinRates } from './win-rate'
import { computeMatchupMatrix } from './matchup'

type Region = 'west' | 'eu' | 'asia' | 'all'
type ContentType =
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

type IpBracket = 'all' | '900-1100' | '1100-1300' | '1300-1500' | '1500+'

const REGIONS: Region[] = ['west', 'eu', 'asia', 'all']
const CONTENT_TYPES: Array<ContentType | 'all'> = [
  'solo',
  'corrupted',
  'mists_1v1',
  'mists_2v2',
  'hellgate_2v2',
  'hellgate_5v5',
  'small_scale',
  'zvz',
  'gank',
  'unknown',
  'all',
]
const IP_BRACKETS: IpBracket[] = ['all', '900-1100', '1100-1300', '1300-1500', '1500+']

export async function runSnapshot(date: Date): Promise<{ written: number; errors: string[] }> {
  const snapshotDate = date.toISOString().slice(0, 10)
  let written = 0
  const errors: string[] = []

  for (const region of REGIONS) {
    for (const contentType of CONTENT_TYPES) {
      for (const ipBracket of IP_BRACKETS) {
        try {
          const [weaponStats, matchupMatrix] = await Promise.all([
            computeWeaponWinRates({ region, contentType, ipBracket, days: 7, minSamples: 20 }),
            computeMatchupMatrix({ region, contentType, ipBracket, days: 30 }),
          ])

          await db
            .insert(metaSnapshots)
            .values({
              snapshotDate,
              region,
              contentType,
              ipBracket,
              weaponStats,
              matchupMatrix,
              generatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [
                metaSnapshots.snapshotDate,
                metaSnapshots.region,
                metaSnapshots.contentType,
                metaSnapshots.ipBracket,
              ],
              set: {
                weaponStats,
                matchupMatrix,
                generatedAt: sql`NOW()`,
              },
            })

          written++
        } catch (err) {
          const label = `${region}/${contentType}/${ipBracket}`
          errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
    }
  }

  return { written, errors }
}
