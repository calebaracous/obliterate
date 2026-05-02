#!/usr/bin/env tsx
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' })
import { neon } from '@neondatabase/serverless'

const patches = [
  {
    slug: 'rise-of-avalon-2024',
    label: 'Rise of Avalon 2024',
    releasedAt: '2024-01-01T00:00:00Z',
    notesUrl: null,
  },
  {
    slug: '2024-q2',
    label: 'April 2024 Update',
    releasedAt: '2024-04-01T00:00:00Z',
    notesUrl: null,
  },
  {
    slug: '2024-q3',
    label: 'July 2024 Update',
    releasedAt: '2024-07-01T00:00:00Z',
    notesUrl: null,
  },
  {
    slug: '2024-q4',
    label: 'October 2024 Update',
    releasedAt: '2024-10-01T00:00:00Z',
    notesUrl: null,
  },
  {
    slug: '2025-q1',
    label: 'January 2025 Update',
    releasedAt: '2025-01-01T00:00:00Z',
    notesUrl: null,
  },
  {
    slug: '2025-q2',
    label: 'April 2025 Update',
    releasedAt: '2025-04-01T00:00:00Z',
    notesUrl: null,
  },
] as const

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL_UNPOOLED
  if (!databaseUrl) {
    throw new Error('DATABASE_URL_UNPOOLED is not set')
  }

  const sql = neon(databaseUrl)

  console.log('Seeding patches ...')

  for (const patch of patches) {
    await sql.query(
      `INSERT INTO patches (slug, label, released_at, notes_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET
         label       = EXCLUDED.label,
         released_at = EXCLUDED.released_at,
         notes_url   = EXCLUDED.notes_url`,
      [patch.slug, patch.label, patch.releasedAt, patch.notesUrl],
    )
    console.log(`  upserted patch: ${patch.slug}`)
  }

  console.log('Seeding ingestion_state ...')

  await sql.query(
    `INSERT INTO ingestion_state (region, consecutive_errors)
     VALUES ('west', 0), ('eu', 0), ('asia', 0)
     ON CONFLICT (region) DO NOTHING`,
  )

  console.log('Done.')
}

main().catch((err) => {
  console.error('seed-patches failed:', err)
  process.exit(1)
})
