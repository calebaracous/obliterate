import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { ok, err, validateCronAuth } from '@/lib/api/response'
import { pollRegion } from '@/lib/ingestion/poll'

const regionSchema = z.enum(['west', 'eu', 'asia'])

export async function GET(request: NextRequest) {
  if (!validateCronAuth(request)) return err('UNAUTHORIZED', 'Unauthorized', 401)
  const region = request.nextUrl.searchParams.get('region')
  const parsed = regionSchema.safeParse(region)
  if (!parsed.success) return err('INVALID_REGION', 'region must be west|eu|asia')
  const result = await pollRegion(parsed.data)
  return ok(result)
}
