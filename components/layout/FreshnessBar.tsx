'use client'
import { useQuery } from '@tanstack/react-query'

interface RegionStatus {
  lastPolledAt: string | null
  consecutiveErrors: number
  isStale: boolean
}

interface FreshnessData {
  data: {
    west: RegionStatus
    eu: RegionStatus
    asia: RegionStatus
  }
}

function timeAgo(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return '<1m'
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h`
}

function dotStyle(status: RegionStatus | undefined): React.CSSProperties {
  if (!status) return { background: '#4a4a45' }
  if (status.consecutiveErrors > 3) return { background: '#b83232' }
  if (status.isStale || status.consecutiveErrors > 0)
    return { background: '#e8b060' }
  return { background: '#3a7a3a', boxShadow: '0 0 5px 1px rgba(58,122,58,0.55)' }
}

const REGIONS = [
  { key: 'west' as const, label: 'US' },
  { key: 'eu' as const, label: 'EU' },
  { key: 'asia' as const, label: 'AS' },
]

export function FreshnessBar() {
  const { data } = useQuery<FreshnessData>({
    queryKey: ['freshness'],
    queryFn: () => fetch('/api/internal/freshness').then((r) => r.json()),
    refetchInterval: 30_000,
  })

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-medium">
        Freshness
      </span>
      {REGIONS.map(({ key, label }) => {
        const s = data?.data[key]
        return (
          <div key={key} className="flex items-center gap-1.5">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'inline-block',
                ...dotStyle(s),
              }}
            />
            <span className="text-[11px] font-mono text-text-secondary">{label}</span>
            {s?.lastPolledAt && (
              <span className="text-[10px] font-mono text-text-tertiary">
                {timeAgo(s.lastPolledAt)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
