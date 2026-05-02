import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>

let _db: DrizzleClient | undefined

function getDb(): DrizzleClient {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!)
    _db = drizzle(sql, { schema })
  }
  return _db
}

// Lazy proxy — neon() is not called until the first DB method is accessed
export const db = new Proxy({} as DrizzleClient, {
  get: (_, prop: string | symbol) => getDb()[prop as keyof DrizzleClient],
})

export type DB = DrizzleClient
