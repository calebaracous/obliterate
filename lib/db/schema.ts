import {
  pgTable,
  text,
  smallint,
  boolean,
  timestamp,
  date,
  bigint,
  bigserial,
  integer,
  real,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const items = pgTable(
  'items',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    nameEn: text('name_en').notNull(),
    nameDe: text('name_de'),
    nameFr: text('name_fr'),
    nameRu: text('name_ru'),
    nameZh: text('name_zh'),
    nameKo: text('name_ko'),
    nameJa: text('name_ja'),
    nameEs: text('name_es'),
    namePt: text('name_pt'),
    namePl: text('name_pl'),
    tier: smallint('tier').notNull(),
    enchantment: smallint('enchantment').notNull().default(0),
    slot: text('slot').notNull(),
    category: text('category').notNull(),
    subcategory: text('subcategory'),
    twoHanded: boolean('two_handed').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('items_slot_idx').on(t.slot),
    index('items_category_idx').on(t.category),
    index('items_subcategory_idx').on(t.subcategory),
  ],
)

export const kills = pgTable(
  'kills',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    region: text('region').notNull(),
    killedAt: timestamp('killed_at', { withTimezone: true }).notNull(),
    killerId: text('killer_id').notNull(),
    killerName: text('killer_name').notNull(),
    killerGuildId: text('killer_guild_id'),
    killerAllianceId: text('killer_alliance_id'),
    killerIp: real('killer_ip'),
    killerAvgIp: real('killer_avg_ip'),
    victimId: text('victim_id').notNull(),
    victimName: text('victim_name').notNull(),
    victimGuildId: text('victim_guild_id'),
    victimAllianceId: text('victim_alliance_id'),
    victimIp: real('victim_ip'),
    victimAvgIp: real('victim_avg_ip'),
    killerGear: jsonb('killer_gear').notNull().default({}),
    victimGear: jsonb('victim_gear').notNull().default({}),
    participants: smallint('participants').notNull().default(2),
    killerPartySize: smallint('killer_party_size'),
    victimPartySize: smallint('victim_party_size'),
    totalFame: bigint('total_fame', { mode: 'number' }),
    killZone: text('kill_zone'),
    contentType: text('content_type'),
    contentConfidence: real('content_confidence'),
    patchSlug: text('patch_slug'),
    ingestedAt: timestamp('ingested_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('kills_killed_at_idx').on(t.killedAt),
    index('kills_region_killed_at_idx').on(t.region, t.killedAt),
    index('kills_killer_id_idx').on(t.killerId),
    index('kills_victim_id_idx').on(t.victimId),
    index('kills_killer_guild_idx')
      .on(t.killerGuildId)
      .where(sql`${t.killerGuildId} IS NOT NULL`),
    index('kills_victim_guild_idx')
      .on(t.victimGuildId)
      .where(sql`${t.victimGuildId} IS NOT NULL`),
    index('kills_content_type_idx').on(t.contentType, t.killedAt),
    index('kills_patch_idx').on(t.patchSlug, t.killedAt),
  ],
)

export const battles = pgTable(
  'battles',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    region: text('region').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }).notNull(),
    totalKills: integer('total_kills').notNull().default(0),
    totalFame: bigint('total_fame', { mode: 'number' }).notNull().default(0),
    playerCount: integer('player_count').notNull().default(0),
    guildCount: integer('guild_count').notNull().default(0),
    allianceCount: integer('alliance_count').notNull().default(0),
    guilds: jsonb('guilds').notNull().default([]),
    alliances: jsonb('alliances').notNull().default([]),
    ingestedAt: timestamp('ingested_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('battles_started_at_idx').on(t.startedAt),
    index('battles_region_idx').on(t.region, t.startedAt),
  ],
)

export const players = pgTable(
  'players',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    guildId: text('guild_id'),
    guildName: text('guild_name'),
    allianceId: text('alliance_id'),
    allianceName: text('alliance_name'),
    totalKills: integer('total_kills').notNull().default(0),
    totalDeaths: integer('total_deaths').notNull().default(0),
    totalFame: bigint('total_fame', { mode: 'number' }).notNull().default(0),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('players_guild_idx')
      .on(t.guildId)
      .where(sql`${t.guildId} IS NOT NULL`),
    // GIN trgm index — apply manually:
    // CREATE INDEX players_name_trgm_idx ON players USING GIN (name gin_trgm_ops);
    // Requires: CREATE EXTENSION IF NOT EXISTS pg_trgm;
  ],
)

export const guilds = pgTable(
  'guilds',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    allianceId: text('alliance_id'),
    allianceName: text('alliance_name'),
    memberCount: integer('member_count'),
    killFame: bigint('kill_fame', { mode: 'number' }).notNull().default(0),
    deathFame: bigint('death_fame', { mode: 'number' }).notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (_t) => [
    // GIN trgm index — apply manually:
    // CREATE INDEX guilds_name_trgm_idx ON guilds USING GIN (name gin_trgm_ops);
    // Requires: CREATE EXTENSION IF NOT EXISTS pg_trgm;
  ],
)

export const patches = pgTable('patches', {
  slug: text('slug').primaryKey(),
  label: text('label').notNull(),
  releasedAt: timestamp('released_at', { withTimezone: true }).notNull(),
  notesUrl: text('notes_url'),
})

export const metaSnapshots = pgTable(
  'meta_snapshots',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    snapshotDate: date('snapshot_date').notNull(),
    region: text('region').notNull(),
    contentType: text('content_type').notNull(),
    ipBracket: text('ip_bracket').notNull(),
    patchSlug: text('patch_slug'),
    weaponStats: jsonb('weapon_stats').notNull().default([]),
    matchupMatrix: jsonb('matchup_matrix').notNull().default([]),
    generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('meta_snapshots_unique_idx').on(
      t.snapshotDate,
      t.region,
      t.contentType,
      t.ipBracket,
    ),
    index('meta_snapshots_date_idx').on(t.snapshotDate),
    index('meta_snapshots_lookup_idx').on(t.region, t.contentType, t.ipBracket, t.snapshotDate),
  ],
)

export const ingestionState = pgTable('ingestion_state', {
  region: text('region').primaryKey(),
  lastEventId: bigint('last_event_id', { mode: 'number' }),
  lastPolledAt: timestamp('last_polled_at', { withTimezone: true }),
  consecutiveErrors: integer('consecutive_errors').notNull().default(0),
  lastError: text('last_error'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/*
 * GIN indexes that must be applied manually (Drizzle schema builder emits btree by default
 * for expression indexes and does not support GIN expression indexes via the schema API):
 *
 * -- Weapon lookup indexes on kills gear JSONB:
 * CREATE INDEX kills_killer_mainhand_idx ON kills USING GIN ((killer_gear -> 'mainhand'));
 * CREATE INDEX kills_victim_mainhand_idx ON kills USING GIN ((victim_gear -> 'mainhand'));
 *
 * -- Trigram search indexes (requires pg_trgm extension):
 * CREATE EXTENSION IF NOT EXISTS pg_trgm;
 * CREATE INDEX players_name_trgm_idx ON players USING GIN (name gin_trgm_ops);
 * CREATE INDEX guilds_name_trgm_idx ON guilds USING GIN (name gin_trgm_ops);
 */
