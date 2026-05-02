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

function RegionDot({
  label,
  status,
}: {
  label: string
  status: RegionStatus | undefined
}) {
  const dotColor = !status
    ? 'bg-bg-elevated'
    : status.consecutiveErrors > 3
      ? 'bg-crimson-bright'
      : status.isStale || status.consecutiveErrors > 0
        ? 'bg-gold-bright'
        : 'bg-win'

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-secondary">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </div>
  )
}

export function FreshnessBar() {
  const { data } = useQuery<FreshnessData>({
    queryKey: ['freshness'],
    queryFn: () => fetch('/api/internal/freshness').then((r) => r.json()),
    refetchInterval: 30_000,
  })

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 bg-bg-surface border-b border-border-subtle">
      <span className="text-[10px] uppercase tracking-wide text-text-tertiary font-medium mr-1">
        Data
      </span>
      <RegionDot label="US" status={data?.data.west} />
      <RegionDot label="EU" status={data?.data.eu} />
      <RegionDot label="AS" status={data?.data.asia} />
    </div>
  )
}
