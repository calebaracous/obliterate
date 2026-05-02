import { eq, sql } from 'drizzle-orm'
import { db } from './index'
import * as schema from './schema'

export type NewKill = typeof schema.kills.$inferInsert

const CHUNK_SIZE = 50

export async function upsertKills(rows: NewKill[]): Promise<void> {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE)
    await db.insert(schema.kills).values(chunk).onConflictDoNothing()
  }
}

export async function getIngestionState(
  region: string,
): Promise<typeof schema.ingestionState.$inferSelect | null> {
  const rows = await db
    .select()
    .from(schema.ingestionState)
    .where(eq(schema.ingestionState.region, region))
    .limit(1)
  return rows[0] ?? null
}

export async function upsertIngestionState(
  region: string,
  lastEventId: number,
  lastPolledAt: Date,
): Promise<void> {
  await db
    .insert(schema.ingestionState)
    .values({
      region,
      lastEventId,
      lastPolledAt,
      consecutiveErrors: 0,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.ingestionState.region,
      set: {
        lastEventId,
        lastPolledAt,
        consecutiveErrors: 0,
        updatedAt: new Date(),
      },
    })
}

export async function incrementRegionError(region: string, error: string): Promise<void> {
  await db
    .insert(schema.ingestionState)
    .values({
      region,
      consecutiveErrors: 1,
      lastError: error,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.ingestionState.region,
      set: {
        consecutiveErrors: sql`${schema.ingestionState.consecutiveErrors} + 1`,
        lastError: error,
        updatedAt: new Date(),
      },
    })
}
