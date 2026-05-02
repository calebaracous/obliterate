import { unstable_cache } from 'next/cache'
import { ok, err } from '@/lib/api/response'
import { db } from '@/lib/db/index'
import { items } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

function makeGetItem(id: string) {
  return unstable_cache(
    async () => {
      const rows = await db.select().from(items).where(eq(items.id, id)).limit(1)
      return rows[0] ?? null
    },
    [`item-${id}`],
    { revalidate: 86400 },
  )
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const getItem = makeGetItem(id)
  const item = await getItem()
  if (!item) return err('NOT_FOUND', 'Item not found', 404)
  return ok({ item })
}
