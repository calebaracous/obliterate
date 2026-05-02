import { neon } from '@neondatabase/serverless'

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

export interface MatchupCell {
  attackerId: string
  victimId: string
  kills: number
  winRate: number
  sampleSize: number
}

export interface MatchupOptions {
  region: Region
  contentType: ContentType | 'all'
  ipBracket: IpBracket | 'all'
  days?: number
}

const IP_RANGES: Record<string, { min: number; max: number }> = {
  all: { min: 0, max: 99999 },
  '900-1100': { min: 900, max: 1099 },
  '1100-1300': { min: 1100, max: 1299 },
  '1300-1500': { min: 1300, max: 1499 },
  '1500+': { min: 1500, max: 99999 },
}

interface RawMatchupRow {
  attacker_subcategory: string
  victim_subcategory: string
  kills: number
}

export async function computeMatchupMatrix(options: MatchupOptions): Promise<MatchupCell[]> {
  const { region, contentType, ipBracket, days = 30 } = options
  const sql = neon(process.env.DATABASE_URL!)

  const ipRange = IP_RANGES[ipBracket] ?? IP_RANGES['all']
  const params: (string | number)[] = []

  function addParam(val: string | number): string {
    params.push(val)
    return `$${params.length}`
  }

  const daysParam = addParam(days)
  const ipMinParam = addParam(ipRange.min)
  const ipMaxParam = addParam(ipRange.max)

  const regionClause = region !== 'all' ? `AND k.region = ${addParam(region)}` : ''
  const contentTypeClause =
    contentType !== 'all' ? `AND k.content_type = ${addParam(contentType)}` : ''
  const ipClause = `AND k.killer_ip BETWEEN ${ipMinParam} AND ${ipMaxParam}`

  const query = `
    SELECT
      i_killer.subcategory AS attacker_subcategory,
      i_victim.subcategory AS victim_subcategory,
      COUNT(*)::INT AS kills
    FROM kills k
    JOIN items i_killer ON i_killer.id = (k.killer_gear -> 'mainhand' ->> 'id')
    JOIN items i_victim  ON i_victim.id  = (k.victim_gear  -> 'mainhand' ->> 'id')
    WHERE k.killed_at >= NOW() - (${daysParam} || ' days')::INTERVAL
      AND i_killer.subcategory IS NOT NULL
      AND i_victim.subcategory IS NOT NULL
      ${regionClause}
      ${contentTypeClause}
      ${ipClause}
    GROUP BY i_killer.subcategory, i_victim.subcategory
    HAVING COUNT(*) >= 20
  `

  const rows = (await sql.query(query, params)) as RawMatchupRow[]

  const killMap = new Map<string, number>()
  for (const row of rows) {
    const key = `${row.attacker_subcategory}::${row.victim_subcategory}`
    killMap.set(key, row.kills)
  }

  const cells: MatchupCell[] = []

  for (const row of rows) {
    const aKills = row.kills
    const reverseKey = `${row.victim_subcategory}::${row.attacker_subcategory}`
    const bKills = killMap.get(reverseKey) ?? 0
    const total = aKills + bKills
    const winRate = total > 0 ? aKills / total : 0.5

    cells.push({
      attackerId: row.attacker_subcategory,
      victimId: row.victim_subcategory,
      kills: aKills,
      winRate,
      sampleSize: total,
    })
  }

  return cells
}
