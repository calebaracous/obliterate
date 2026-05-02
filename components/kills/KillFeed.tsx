'use client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { KillCard, type KillCardKill } from './KillCard'
import { Skeleton } from '@/components/ui/Skeleton'

interface KillFeedProps {
  region?: string
  contentType?: string
  playerId?: string
  guildId?: string
}

interface KillsResponse {
  data: {
    kills: KillCardKill[]
    total: number
    hasMore: boolean
  }
}

export function KillFeed({
  region = 'all',
  contentType,
  playerId,
  guildId,
}: KillFeedProps) {
  const [offset, setOffset] = useState(0)
  const limit = 25

  const params = new URLSearchParams({ region, limit: String(limit), offset: String(offset) })
  if (contentType) params.set('contentType', contentType)
  if (playerId) params.set('playerId', playerId)
  if (guildId) params.set('guildId', guildId)

  const { data, isLoading, isError } = useQuery<KillsResponse>({
    queryKey: ['kills', region, contentType, playerId, guildId, offset],
    queryFn: async () => {
      const res = await fetch(`/api/kills?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch kills')
      return res.json() as Promise<KillsResponse>
    },
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-px">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-[60px] w-full rounded-none" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-text-secondary">Failed to load kill feed.</div>
    )
  }

  const kills = data?.data.kills ?? []

  return (
    <div>
      <div className="border border-border-subtle rounded-[4px] overflow-hidden">
        {kills.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No kills found.</div>
        ) : (
          kills.map((kill) => <KillCard key={kill.id} kill={kill} />)
        )}
      </div>
      {data?.data.hasMore && (
        <div className="mt-3 text-center">
          <button
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border-default rounded-[3px] hover:bg-bg-elevated transition-colors"
            onClick={() => setOffset((o) => o + limit)}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}
