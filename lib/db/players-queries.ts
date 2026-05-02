import { eq, desc, count, sum, avg, sql } from 'drizzle-orm'
import { neon } from '@neondatabase/serverless'
import { db } from './index'
import * as schema from './schema'

export type PlayerRow = typeof schema.players.$inferSelect
export type KillRow = typeof schema.kills.$inferSelect

export async function getPlayerProfile(id: string): Promise<PlayerRow | null> {
  const rows = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.id, id))
    .limit(1)
  return rows[0] ?? null
}

export async function getPlayerKills(
  id: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<KillRow[]> {
  const limit = Math.min(opts.limit ?? 25, 100)
  const offset = opts.offset ?? 0
  return db
    .select()
    .from(schema.kills)
    .where(eq(schema.kills.killerId, id))
    .orderBy(desc(schema.kills.killedAt))
    .limit(limit)
    .offset(offset)
}

export async function getPlayerDeaths(
  id: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<KillRow[]> {
  const limit = Math.min(opts.limit ?? 25, 100)
  const offset = opts.offset ?? 0
  return db
    .select()
    .from(schema.kills)
    .where(eq(schema.kills.victimId, id))
    .orderBy(desc(schema.kills.killedAt))
    .limit(limit)
    .offset(offset)
}

export interface WeaponUsage {
  weaponId: string
  kills: number
}

export async function getPlayerFavoriteWeapons(id: string): Promise<WeaponUsage[]> {
  const rawSql = neon(process.env.DATABASE_URL!)
  const rows = await rawSql`
    SELECT
      killer_gear -> 'mainhand' ->> 'id' AS weapon_id,
      COUNT(*)::int                       AS kills
    FROM kills
    WHERE killer_id = ${id}
      AND killer_gear -> 'mainhand' ->> 'id' IS NOT NULL
    GROUP BY weapon_id
    ORDER BY kills DESC
    LIMIT 5
  `
  return rows.map((r) => ({ weaponId: r.weapon_id as string, kills: r.kills as number }))
}

export interface PlayerStats {
  totalKills: number
  totalDeaths: number
  avgKillerIp: number | null
  avgVictimIp: number | null
  totalFame: number
  killsByContentType: { contentType: string | null; kills: number }[]
}

export async function getPlayerStats(id: string): Promise<PlayerStats> {
  const [killAgg, deathAgg, contentBreakdown] = await Promise.all([
    db
      .select({
        total: count(),
        avgIp: avg(schema.kills.killerIp),
        fame: sum(schema.kills.totalFame),
      })
      .from(schema.kills)
      .where(eq(schema.kills.killerId, id)),

    db
      .select({
        total: count(),
        avgIp: avg(schema.kills.victimIp),
      })
      .from(schema.kills)
      .where(eq(schema.kills.victimId, id)),

    db
      .select({
        contentType: schema.kills.contentType,
        kills: count(),
      })
      .from(schema.kills)
      .where(eq(schema.kills.killerId, id))
      .groupBy(schema.kills.contentType)
      .orderBy(desc(count())),
  ])

  const killRow = killAgg[0]
  const deathRow = deathAgg[0]

  return {
    totalKills: killRow?.total ?? 0,
    totalDeaths: deathRow?.total ?? 0,
    avgKillerIp: killRow?.avgIp != null ? Number(killRow.avgIp) : null,
    avgVictimIp: deathRow?.avgIp != null ? Number(deathRow.avgIp) : null,
    totalFame: killRow?.fame != null ? Number(killRow.fame) : 0,
    killsByContentType: contentBreakdown.map((r) => ({
      contentType: r.contentType,
      kills: r.kills,
    })),
  }
}
