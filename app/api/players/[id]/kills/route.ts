import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { ok, err } from '@/lib/api/response'
import { getPlayerKills } from '@/lib/db/players-queries'

const schema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return err('INVALID_PARAMS', parsed.error.issues[0].message)

  try {
    const kills = await getPlayerKills(id, parsed.data)
    return ok({ kills })
  } catch {
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
