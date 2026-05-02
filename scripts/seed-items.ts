#!/usr/bin/env tsx
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' })
import { neon } from '@neondatabase/serverless'

import { parseItemEntry } from '../lib/items/dictionary'
import type { RawItem } from '../lib/items/dictionary'

const DUMP_URL =
  'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json'

const CHUNK_SIZE = 100

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL_UNPOOLED
  if (!databaseUrl) {
    throw new Error('DATABASE_URL_UNPOOLED is not set')
  }

  const sql = neon(databaseUrl)

  console.log(`Fetching items from ${DUMP_URL} ...`)
  const res = await fetch(DUMP_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch items.json: ${res.status} ${res.statusText}`)
  }

  const raw: unknown = await res.json()

  // ao-bin-dumps returns either a plain array or { items: [...] }
  let rawItems: RawItem[]
  if (Array.isArray(raw)) {
    rawItems = raw as RawItem[]
  } else if (
    raw !== null &&
    typeof raw === 'object' &&
    'items' in raw &&
    Array.isArray((raw as { items: unknown }).items)
  ) {
    rawItems = (raw as { items: RawItem[] }).items
  } else {
    throw new Error('Unexpected items.json shape — expected array or { items: [] }')
  }

  console.log(`Parsing ${rawItems.length} items ...`)

  const parsed = rawItems
    .filter((item) => item.UniqueName)
    .map((item) => parseItemEntry(item))

  console.log(`Upserting ${parsed.length} items in chunks of ${CHUNK_SIZE} ...`)

  let upserted = 0

  for (let i = 0; i < parsed.length; i += CHUNK_SIZE) {
    const chunk = parsed.slice(i, i + CHUNK_SIZE)

    // Build parameterised values list
    // Each row: (id, name, name_en, tier, enchantment, slot, category, subcategory, two_handed, NOW())
    const placeholders: string[] = []
    const values: (string | number | boolean | null)[] = []
    let paramIndex = 1

    for (const item of chunk) {
      placeholders.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, NOW())`,
      )
      values.push(
        item.id,
        item.name,
        item.name, // name_en
        item.tier,
        item.enchantment,
        item.slot,
        item.category,
        item.subcategory,
        item.twoHanded,
      )
    }

    await sql.query(
      `INSERT INTO items (id, name, name_en, tier, enchantment, slot, category, subcategory, two_handed, updated_at)
       VALUES ${placeholders.join(', ')}
       ON CONFLICT (id) DO UPDATE SET
         name        = EXCLUDED.name,
         name_en     = EXCLUDED.name_en,
         tier        = EXCLUDED.tier,
         slot        = EXCLUDED.slot,
         category    = EXCLUDED.category,
         subcategory = EXCLUDED.subcategory,
         two_handed  = EXCLUDED.two_handed,
         updated_at  = NOW()`,
      values,
    )

    upserted += chunk.length
    process.stdout.write(`\r  ${upserted} / ${parsed.length}`)
  }

  console.log(`\nDone. Upserted ${upserted} items.`)
}

main().catch((err) => {
  console.error('seed-items failed:', err)
  process.exit(1)
})
