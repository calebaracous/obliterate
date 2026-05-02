import { type NextRequest } from 'next/server'
import { ok, err, validateCronAuth } from '@/lib/api/response'
import { runSnapshot } from '@/lib/analytics/snapshot'

export async function GET(request: NextRequest) {
  if (!validateCronAuth(request)) return err('UNAUTHORIZED', 'Unauthorized', 401)
  try {
    const result = await runSnapshot(new Date())
    return ok(result)
  } catch {
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
