'use client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { KillCard, type KillCardKill } from './KillCard'
import { FilterBar } from './FilterBar'
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
  region: initialRegion = 'all',
  contentType: initialContentType = 'all',
  playerId,
  guildId,
}: KillFeedProps) {
  const [region, setRegion] = useState(initialRegion)
  const [contentType, setContentType] = useState(initialContentType)
  const [ipBracket, setIpBracket] = useState('all')
  const [window, setWindow] = useState('24h')
  const [offset, setOffset] = useState(0)
  const limit = 25

  const showFilters = !playerId && !guildId

  const params = new URLSearchParams({ region, limit: String(limit), offset: String(offset) })
  if (contentType !== 'all') params.set('contentType', contentType)
  if (playerId) params.set('playerId', playerId)
  if (guildId) params.set('guildId', guildId)

  const { data, isLoading, isError } = useQuery<KillsResponse>({
    queryKey: ['kills', region, contentType, ipBracket, window, playerId, guildId, offset],
    queryFn: async () => {
      const res = await fetch(`/api/kills?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch kills')
      return res.json() as Promise<KillsResponse>
    },
    refetchInterval: 30_000,
  })

  const kills = data?.data.kills ?? []

  return (
    <div>
      {showFilters && (
        <FilterBar
          region={region}
          contentType={contentType}
          ipBracket={ipBracket}
          window={window}
          onRegionChange={(v) => { setRegion(v); setOffset(0) }}
          onContentTypeChange={(v) => { setContentType(v); setOffset(0) }}
          onIpBracketChange={(v) => { setIpBracket(v); setOffset(0) }}
          onWindowChange={(v) => { setWindow(v); setOffset(0) }}
        />
      )}

      <div className="border border-border-subtle rounded-[4px] overflow-hidden">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-[56px] w-full rounded-none" />
          ))
        ) : isError ? (
          <div className="p-8 text-center text-text-secondary font-mono text-[12px]">
            API stale. Reload to retry.
          </div>
        ) : kills.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No kills found.</div>
        ) : (
          kills.map((kill) => <KillCard key={kill.id} kill={kill} />)
        )}
      </div>

      {data?.data.hasMore && (
        <div className="mt-3 text-center">
          <button
            className="px-4 py-2 text-[12px] font-mono text-text-secondary hover:text-text-primary border border-border-default rounded-[3px] hover:bg-bg-elevated transition-colors"
            onClick={() => setOffset((o) => o + limit)}
          >
            Load more
          </button>
        </div>
      )}

      {data && (
        <div className="mt-3 font-mono text-[11px] text-text-tertiary text-center">
          Showing {kills.length} of {data.data.total.toLocaleString()} kills
        </div>
      )}
    </div>
  )
}
