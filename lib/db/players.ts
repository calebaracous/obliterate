import { sql } from 'drizzle-orm'
import { db } from './index'
import * as schema from './schema'
import type { NewKill } from './kills'

type PlayerUpsert = {
  id: string
  name: string
  guildId: string | null
  allianceId: string | null
  isKiller: boolean
  isVictim: boolean
  lastSeenAt: Date
}

function extractPlayersFromKills(kills: NewKill[]): PlayerUpsert[] {
  const map = new Map<string, PlayerUpsert>()

  for (const kill of kills) {
    const killedAt = kill.killedAt instanceof Date ? kill.killedAt : new Date(kill.killedAt as string)

    const existingKiller = map.get(kill.killerId)
    map.set(kill.killerId, {
      id: kill.killerId,
      name: kill.killerName,
      guildId: kill.killerGuildId ?? existingKiller?.guildId ?? null,
      allianceId: kill.killerAllianceId ?? existingKiller?.allianceId ?? null,
      isKiller: true,
      isVictim: existingKiller?.isVictim ?? false,
      lastSeenAt:
        existingKiller?.lastSeenAt && existingKiller.lastSeenAt > killedAt
          ? existingKiller.lastSeenAt
          : killedAt,
    })

    const existingVictim = map.get(kill.victimId)
    if (existingVictim) {
      map.set(kill.victimId, {
        ...existingVictim,
        name: kill.victimName,
        guildId: kill.victimGuildId ?? existingVictim.guildId,
        allianceId: kill.victimAllianceId ?? existingVictim.allianceId,
        isVictim: true,
        lastSeenAt:
          existingVictim.lastSeenAt > killedAt ? existingVictim.lastSeenAt : killedAt,
      })
    } else {
      map.set(kill.victimId, {
        id: kill.victimId,
        name: kill.victimName,
        guildId: kill.victimGuildId ?? null,
        allianceId: kill.victimAllianceId ?? null,
        isKiller: false,
        isVictim: true,
        lastSeenAt: killedAt,
      })
    }
  }

  return Array.from(map.values())
}

export async function upsertPlayersFromKills(kills: NewKill[]): Promise<void> {
  if (kills.length === 0) return

  const players = extractPlayersFromKills(kills)
  if (players.length === 0) return

  // Process individually so the kill/death increment is correct per player.
  // Batch inserts with per-row conditional increments require a VALUES list
  // with computed columns, which is complex across adapters. Individual upserts
  // on the primary key are safe and predictable.
  for (const player of players) {
    await db
      .insert(schema.players)
      .values({
        id: player.id,
        name: player.name,
        guildId: player.guildId,
        guildName: null,
        allianceId: player.allianceId,
        allianceName: null,
        totalKills: player.isKiller ? 1 : 0,
        totalDeaths: player.isVictim ? 1 : 0,
        lastSeenAt: player.lastSeenAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.players.id,
        set: {
          name: sql`EXCLUDED.name`,
          guildId: sql`EXCLUDED.guild_id`,
          allianceId: sql`EXCLUDED.alliance_id`,
          totalKills: sql`${schema.players.totalKills} + EXCLUDED.total_kills`,
          totalDeaths: sql`${schema.players.totalDeaths} + EXCLUDED.total_deaths`,
          lastSeenAt: sql`GREATEST(${schema.players.lastSeenAt}, EXCLUDED.last_seen_at)`,
          updatedAt: sql`NOW()`,
        },
      })
  }
}
