import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function kvGet<T>(key: string): Promise<T | null> {
  return redis.get<T>(key)
}

export async function kvSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds })
}

export async function kvDel(key: string): Promise<void> {
  await redis.del(key)
}

export function kvCacheKey(...parts: string[]): string {
  return `albion:${parts.join(':')}`
}
