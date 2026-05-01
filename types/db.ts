// DB row types — keep in sync with drizzle schema in lib/db/schema.ts

export interface KillRow {
  id: string
  event_id: number
  killed_at: Date
  region: string
  killer_id: string
  killer_name: string
  killer_guild_id: string | null
  killer_guild_name: string | null
  killer_ip: number | null
  killer_gear: object
  killer_party_size: number
  victim_id: string
  victim_name: string
  victim_guild_id: string | null
  victim_guild_name: string | null
  victim_ip: number | null
  victim_gear: object
  total_victim_fame: number
  participants: number
  battle_id: number | null
  location: string | null
  content_type: string
  ip_bracket: string
  patch_slug: string | null
  created_at: Date
}

export interface PlayerRow {
  id: string
  name: string
  guild_id: string | null
  guild_name: string | null
  alliance_id: string | null
  alliance_name: string | null
  alliance_tag: string | null
  kill_fame: number
  death_fame: number
  fame_ratio: number
  updated_at: Date
}

export interface GuildRow {
  id: string
  name: string
  alliance_id: string | null
  alliance_name: string | null
  alliance_tag: string | null
  updated_at: Date
}

export interface IngestionStateRow {
  region: string
  last_event_id: number | null
  last_polled_at: Date | null
  consecutive_errors: number
  last_error: string | null
}

export interface PatchRow {
  slug: string
  released_at: Date
  label: string
}
