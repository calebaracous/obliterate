CREATE TABLE "battles" (
	"id" bigint PRIMARY KEY NOT NULL,
	"region" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL,
	"total_kills" integer DEFAULT 0 NOT NULL,
	"total_fame" bigint DEFAULT 0 NOT NULL,
	"player_count" integer DEFAULT 0 NOT NULL,
	"guild_count" integer DEFAULT 0 NOT NULL,
	"alliance_count" integer DEFAULT 0 NOT NULL,
	"guilds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"alliances" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guilds" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"alliance_id" text,
	"alliance_name" text,
	"member_count" integer,
	"kill_fame" bigint DEFAULT 0 NOT NULL,
	"death_fame" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_state" (
	"region" text PRIMARY KEY NOT NULL,
	"last_event_id" bigint,
	"last_polled_at" timestamp with time zone,
	"consecutive_errors" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_en" text NOT NULL,
	"name_de" text,
	"name_fr" text,
	"name_ru" text,
	"name_zh" text,
	"name_ko" text,
	"name_ja" text,
	"name_es" text,
	"name_pt" text,
	"name_pl" text,
	"tier" smallint NOT NULL,
	"enchantment" smallint DEFAULT 0 NOT NULL,
	"slot" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"two_handed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kills" (
	"id" bigint PRIMARY KEY NOT NULL,
	"region" text NOT NULL,
	"killed_at" timestamp with time zone NOT NULL,
	"killer_id" text NOT NULL,
	"killer_name" text NOT NULL,
	"killer_guild_id" text,
	"killer_alliance_id" text,
	"killer_ip" real,
	"killer_avg_ip" real,
	"victim_id" text NOT NULL,
	"victim_name" text NOT NULL,
	"victim_guild_id" text,
	"victim_alliance_id" text,
	"victim_ip" real,
	"victim_avg_ip" real,
	"killer_gear" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"victim_gear" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"participants" smallint DEFAULT 2 NOT NULL,
	"killer_party_size" smallint,
	"victim_party_size" smallint,
	"total_fame" bigint,
	"kill_zone" text,
	"content_type" text,
	"content_confidence" real,
	"patch_slug" text,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_snapshots" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"snapshot_date" date NOT NULL,
	"region" text NOT NULL,
	"content_type" text NOT NULL,
	"ip_bracket" text NOT NULL,
	"patch_slug" text,
	"weapon_stats" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"matchup_matrix" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patches" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"released_at" timestamp with time zone NOT NULL,
	"notes_url" text
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"guild_id" text,
	"guild_name" text,
	"alliance_id" text,
	"alliance_name" text,
	"total_kills" integer DEFAULT 0 NOT NULL,
	"total_deaths" integer DEFAULT 0 NOT NULL,
	"total_fame" bigint DEFAULT 0 NOT NULL,
	"last_seen_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "battles_started_at_idx" ON "battles" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "battles_region_idx" ON "battles" USING btree ("region","started_at");--> statement-breakpoint
CREATE INDEX "items_slot_idx" ON "items" USING btree ("slot");--> statement-breakpoint
CREATE INDEX "items_category_idx" ON "items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "items_subcategory_idx" ON "items" USING btree ("subcategory");--> statement-breakpoint
CREATE INDEX "kills_killed_at_idx" ON "kills" USING btree ("killed_at");--> statement-breakpoint
CREATE INDEX "kills_region_killed_at_idx" ON "kills" USING btree ("region","killed_at");--> statement-breakpoint
CREATE INDEX "kills_killer_id_idx" ON "kills" USING btree ("killer_id");--> statement-breakpoint
CREATE INDEX "kills_victim_id_idx" ON "kills" USING btree ("victim_id");--> statement-breakpoint
CREATE INDEX "kills_killer_guild_idx" ON "kills" USING btree ("killer_guild_id") WHERE "kills"."killer_guild_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "kills_victim_guild_idx" ON "kills" USING btree ("victim_guild_id") WHERE "kills"."victim_guild_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "kills_content_type_idx" ON "kills" USING btree ("content_type","killed_at");--> statement-breakpoint
CREATE INDEX "kills_patch_idx" ON "kills" USING btree ("patch_slug","killed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "meta_snapshots_unique_idx" ON "meta_snapshots" USING btree ("snapshot_date","region","content_type","ip_bracket");--> statement-breakpoint
CREATE INDEX "meta_snapshots_date_idx" ON "meta_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "meta_snapshots_lookup_idx" ON "meta_snapshots" USING btree ("region","content_type","ip_bracket","snapshot_date");--> statement-breakpoint
CREATE INDEX "players_guild_idx" ON "players" USING btree ("guild_id") WHERE "players"."guild_id" IS NOT NULL;