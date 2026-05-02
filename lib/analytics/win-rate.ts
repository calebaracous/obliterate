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

export interface WinRateOptions {
  region: Region
  contentType: ContentType | 'all'
  ipBracket: IpBracket | 'all'
  patchSlug?: string
  days?: number
  minSamples?: number
}

export interface WeaponWinRate {
  weaponId: string
  weaponName: string
  subcategory: string
  kills: number
  deaths: number
  winRate: number
  sampleSize: number
  confidence: 'high' | 'medium' | 'low'
}

const IP_RANGES: Record<string, { min: number; max: number }> = {
  all: { min: 0, max: 99999 },
  '900-1100': { min: 900, max: 1099 },
  '1100-1300': { min: 1100, max: 1299 },
  '1300-1500': { min: 1300, max: 1499 },
  '1500+': { min: 1500, max: 99999 },
}

function confidenceTier(sampleSize: number): 'high' | 'medium' | 'low' {
  if (sampleSize >= 200) return 'high'
  if (sampleSize >= 50) return 'medium'
  return 'low'
}

export async function computeWeaponWinRates(options: WinRateOptions): Promise<WeaponWinRate[]> {
  const { region, contentType, ipBracket, patchSlug, days = 7, minSamples = 50 } = options
  const sql = neon(process.env.DATABASE_URL!)

  const ipRange = IP_RANGES[ipBracket] ?? IP_RANGES['all']
  const params: (string | number)[] = []

  function addParam(val: string | number): string {
    params.push(val)
    return `$${params.length}`
  }

  const ipMinParam = addParam(ipRange.min)
  const ipMaxParam = addParam(ipRange.max)
  const minSamplesParam = addParam(minSamples)

  let intervalClause: string
  let patchClause = ''

  if (patchSlug) {
    const patchParam = addParam(patchSlug)
    intervalClause = ''
    patchClause = `AND patch_slug = ${patchParam}`
  } else {
    const daysParam = addParam(days)
    intervalClause = `AND killed_at >= NOW() - (${daysParam} || ' days')::INTERVAL`
    patchClause = ''
  }

  const regionClause = region !== 'all' ? `AND region = ${addParam(region)}` : ''
  const contentTypeClause =
    contentType !== 'all' ? `AND content_type = ${addParam(contentType)}` : ''

  const query = `
    SELECT
      wa.item_id AS weapon_id,
      COALESCE(i.name_en, i.name, wa.item_id) AS weapon_name,
      COALESCE(i.subcategory, '') AS subcategory,
      SUM(CASE WHEN wa.side = 'killer' THEN 1 ELSE 0 END)::INT AS kills,
      SUM(CASE WHEN wa.side = 'victim' THEN 1 ELSE 0 END)::INT AS deaths,
      COUNT(*)::INT AS sample_size,
      SUM(CASE WHEN wa.side = 'killer' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) AS win_rate
    FROM (
      SELECT
        (killer_gear -> 'mainhand' ->> 'id') AS item_id,
        'killer' AS side
      FROM kills
      WHERE (killer_gear -> 'mainhand') IS NOT NULL
        ${intervalClause}
        ${patchClause}
        ${regionClause}
        ${contentTypeClause}
        AND killer_ip BETWEEN ${ipMinParam} AND ${ipMaxParam}

      UNION ALL

      SELECT
        (victim_gear -> 'mainhand' ->> 'id') AS item_id,
        'victim' AS side
      FROM kills
      WHERE (victim_gear -> 'mainhand') IS NOT NULL
        ${intervalClause}
        ${patchClause}
        ${regionClause}
        ${contentTypeClause}
        AND killer_ip BETWEEN ${ipMinParam} AND ${ipMaxParam}
    ) wa
    LEFT JOIN items i ON i.id = wa.item_id
    GROUP BY wa.item_id, i.name_en, i.name, i.subcategory
    HAVING COUNT(*) >= ${minSamplesParam}
    ORDER BY win_rate DESC
  `

  const rows = await sql.query(query, params)

  return rows.map((row) => ({
    weaponId: row.weapon_id as string,
    weaponName: row.weapon_name as string,
    subcategory: row.subcategory as string,
    kills: row.kills as number,
    deaths: row.deaths as number,
    winRate: row.win_rate as number,
    sampleSize: row.sample_size as number,
    confidence: confidenceTier(row.sample_size as number),
  }))
}
