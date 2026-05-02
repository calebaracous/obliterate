import { eq, and, or, desc, sql, gte, lte, count } from 'drizzle-orm'
import { db } from './index'
import * as schema from './schema'

export interface KillsFilter {
  region?: string
  limit?: number
  offset?: number
  contentType?: string
  weaponId?: string
  playerId?: string
  guildId?: string
  minIp?: number
  maxIp?: number
}

export type KillRow = typeof schema.kills.$inferSelect

export async function getKills(filter: KillsFilter): Promise<{
  kills: KillRow[]
  total: number
  hasMore: boolean
}> {
  const limit = Math.min(filter.limit ?? 25, 100)
  const offset = filter.offset ?? 0

  const conditions = []

  if (filter.region) {
    conditions.push(eq(schema.kills.region, filter.region))
  }

  if (filter.contentType) {
    conditions.push(eq(schema.kills.contentType, filter.contentType))
  }

  if (filter.playerId) {
    conditions.push(
      or(
        eq(schema.kills.killerId, filter.playerId),
        eq(schema.kills.victimId, filter.playerId),
      ),
    )
  }

  if (filter.guildId) {
    conditions.push(
      or(
        eq(schema.kills.killerGuildId, filter.guildId),
        eq(schema.kills.victimGuildId, filter.guildId),
      ),
    )
  }

  if (filter.minIp !== undefined) {
    conditions.push(
      or(
        gte(schema.kills.killerIp, filter.minIp),
        gte(schema.kills.victimIp, filter.minIp),
      ),
    )
  }

  if (filter.maxIp !== undefined) {
    conditions.push(
      or(
        lte(schema.kills.killerIp, filter.maxIp),
        lte(schema.kills.victimIp, filter.maxIp),
      ),
    )
  }

  if (filter.weaponId) {
    conditions.push(
      or(
        sql`${schema.kills.killerGear}->'mainhand'->>'id' = ${filter.weaponId}`,
        sql`${schema.kills.victimGear}->'mainhand'->>'id' = ${filter.weaponId}`,
      ),
    )
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [killsResult, countResult] = await Promise.all([
    db
      .select()
      .from(schema.kills)
      .where(where)
      .orderBy(desc(schema.kills.killedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(schema.kills)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    kills: killsResult,
    total,
    hasMore: offset + killsResult.length < total,
  }
}

export async function getKillById(id: number): Promise<KillRow | null> {
  const rows = await db
    .select()
    .from(schema.kills)
    .where(eq(schema.kills.id, id))
    .limit(1)
  return rows[0] ?? null
}
