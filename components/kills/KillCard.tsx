import { GearRow } from './GearRow'
import { Pill, contentTypeToPillColor, CONTENT_TYPE_LABELS } from '@/components/ui/Pill'

function timeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function formatFame(fame: number): string {
  if (fame >= 1_000_000) return `${(fame / 1_000_000).toFixed(1)}M`
  if (fame >= 1000) return `${(fame / 1000).toFixed(0)}k`
  return String(fame)
}

function formatIp(ip: number | null): string {
  if (!ip) return '—'
  return `${Math.round(ip)} IP`
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

export function KillCard({ kill }: KillCardProps) {
  const killerGear = kill.killer.gear as Parameters<typeof GearRow>[0]['gear']
  const victimGear = kill.victim.gear as Parameters<typeof GearRow>[0]['gear']
  const pillColor = contentTypeToPillColor(kill.contentType)
  const rawLabel = CONTENT_TYPE_LABELS[kill.contentType] ?? kill.contentType
  const typeLabel = kill.contentConfidence < 0.8 ? `~${rawLabel}` : rawLabel

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 160px 72px 100px 28px auto 160px 72px 68px 44px',
        alignItems: 'center',
        gap: 12,
        height: 56,
        padding: '0 16px',
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        cursor: 'pointer',
        transition: 'background 150ms cubic-bezier(0.2,0,0,1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-surface)'
      }}
    >
      {/* Killer gear */}
      <GearRow gear={killerGear} size={22} />

      {/* Killer identity */}
      <div style={{ minWidth: 0 }}>
        <a
          href={`/players/${kill.killer.id}`}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {kill.killer.name}
        </a>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {kill.killer.guildName ? `⟪${kill.killer.guildName}⟫` : '⟪—⟫'}
        </div>
      </div>

      {/* Killer IP */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-text-secondary)',
        }}
      >
        {formatIp(kill.killer.ip)}
      </div>

      {/* Content-type pill */}
      <Pill color={pillColor}>{typeLabel}</Pill>

      {/* vs */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-crimson-text)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        vs
      </div>

      {/* Victim gear */}
      <GearRow gear={victimGear} size={22} />

      {/* Victim identity */}
      <div style={{ minWidth: 0 }}>
        <a
          href={`/players/${kill.victim.id}`}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {kill.victim.name}
        </a>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {kill.victim.guildName ? `⟪${kill.victim.guildName}⟫` : '⟪—⟫'}
        </div>
      </div>

      {/* Victim IP */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-text-secondary)',
        }}
      >
        {formatIp(kill.victim.ip)}
      </div>

      {/* Fame */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-gold-text)',
          textAlign: 'right',
        }}
      >
        {kill.totalFame > 0 ? formatFame(kill.totalFame) : '—'}
      </div>

      {/* Time */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          textAlign: 'right',
        }}
      >
        {timeAgo(kill.killedAt)}
      </div>
    </div>
  )
}
