import { GearRow } from './GearRow'
import { ContentTypeBadge } from './ContentTypeBadge'
import { RegionBadge } from './RegionBadge'

function timeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export interface KillCardKill {
  id: number
  killedAt: string
  region: string
  contentType: string
  contentConfidence: number
  killer: {
    id: string
    name: string
    guildName: string | null
    ip: number | null
    gear: Record<string, { id: string; ip: number } | null>
  }
  victim: {
    id: string
    name: string
    guildName: string | null
    ip: number | null
    gear: Record<string, { id: string; ip: number } | null>
  }
  totalFame: number
  participants: number
}

interface KillCardProps {
  kill: KillCardKill
}

function formatFame(fame: number): string {
  if (fame >= 1_000_000) return `${(fame / 1_000_000).toFixed(1)}M`
  if (fame >= 1000) return `${(fame / 1000).toFixed(0)}K`
  return String(fame)
}

export function KillCard({ kill }: KillCardProps) {
  const killerGear = kill.killer.gear as Parameters<typeof GearRow>[0]['gear']
  const victimGear = kill.victim.gear as Parameters<typeof GearRow>[0]['gear']

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-bg-surface border-b border-border-subtle hover:bg-bg-elevated transition-colors cursor-pointer text-sm">
      {/* Killer gear */}
      <GearRow gear={killerGear} size={20} />

      {/* Killer identity */}
      <div className="min-w-0">
        <a
          href={`/players/${kill.killer.id}`}
          className="text-text-primary font-medium hover:text-gold-text truncate block max-w-[120px]"
          onClick={(e) => e.stopPropagation()}
        >
          {kill.killer.name}
        </a>
        {kill.killer.guildName && (
          <div className="text-[11px] text-text-tertiary truncate max-w-[120px]">
            {kill.killer.guildName}
          </div>
        )}
      </div>

      {/* Killer IP */}
      {kill.killer.ip && (
        <span className="text-[11px] font-mono text-text-secondary whitespace-nowrap">
          {Math.round(kill.killer.ip)}
        </span>
      )}

      {/* Center badges */}
      <div className="flex items-center gap-1.5 mx-1">
        <ContentTypeBadge contentType={kill.contentType} confidence={kill.contentConfidence} />
        <RegionBadge region={kill.region} />
      </div>

      {/* Victim IP */}
      {kill.victim.ip && (
        <span className="text-[11px] font-mono text-text-secondary whitespace-nowrap">
          {Math.round(kill.victim.ip)}
        </span>
      )}

      {/* Victim identity */}
      <div className="min-w-0">
        <a
          href={`/players/${kill.victim.id}`}
          className="text-crimson-text hover:text-text-primary truncate block max-w-[120px]"
          onClick={(e) => e.stopPropagation()}
        >
          {kill.victim.name}
        </a>
        {kill.victim.guildName && (
          <div className="text-[11px] text-text-tertiary truncate max-w-[120px]">
            {kill.victim.guildName}
          </div>
        )}
      </div>

      {/* Victim gear */}
      <GearRow gear={victimGear} size={20} />

      {/* Meta */}
      <div className="ml-auto flex items-center gap-3 flex-shrink-0">
        {kill.totalFame > 0 && (
          <span className="text-[11px] font-mono text-gold-text whitespace-nowrap">
            {formatFame(kill.totalFame)}
          </span>
        )}
        <span className="text-[11px] text-text-tertiary whitespace-nowrap">
          {timeAgo(kill.killedAt)}
        </span>
      </div>
    </div>
  )
}
