import { cn } from '@/lib/utils'

type PillColor =
  | 'west' | 'eu' | 'asia'
  | 'solo' | 'corrupt' | 'mists' | 'hg2' | 'hg5' | 'small' | 'zvz' | 'gank' | 'unknown'
  | 'win' | 'stale' | 'down'

interface PillProps {
  color: PillColor
  dot?: boolean
  children: React.ReactNode
  className?: string
}

const PILL_STYLES: Record<PillColor, { bg: string; fg: string; dot?: string; bd?: string; italic?: boolean }> = {
  west:    { bg: 'rgba(74,122,184,0.12)',  fg: '#7aa8e8', dot: '#4a7ab8', bd: 'rgba(74,122,184,0.3)' },
  eu:      { bg: 'rgba(106,154,64,0.12)',  fg: '#9ac870', dot: '#6a9a40', bd: 'rgba(106,154,64,0.3)' },
  asia:    { bg: 'rgba(184,120,64,0.12)',  fg: '#e0a070', dot: '#b87840', bd: 'rgba(184,120,64,0.3)' },
  solo:    { bg: '#222220', fg: '#9a9890' },
  corrupt: { bg: 'rgba(140,80,180,0.12)',  fg: '#c090e0' },
  mists:   { bg: 'rgba(64,180,180,0.12)',  fg: '#70d0d0' },
  hg2:     { bg: 'rgba(201,146,42,0.12)',  fg: '#e8b060' },
  hg5:     { bg: 'rgba(240,160,32,0.18)',  fg: '#f0c060' },
  small:   { bg: 'rgba(74,122,184,0.12)',  fg: '#7aa8e8' },
  zvz:     { bg: 'rgba(184,50,50,0.15)',   fg: '#e06060' },
  gank:    { bg: 'rgba(217,122,42,0.15)',  fg: '#e8a060' },
  unknown: { bg: '#1c1c1a', fg: '#5c5b55', italic: true },
  win:     { bg: 'rgba(58,122,58,0.12)',   fg: '#6dbe6d', dot: '#3a7a3a', bd: 'rgba(58,122,58,0.3)' },
  stale:   { bg: 'rgba(232,176,96,0.12)',  fg: '#e8b060', dot: '#e8b060', bd: 'rgba(232,176,96,0.3)' },
  down:    { bg: 'rgba(184,50,50,0.15)',   fg: '#e06060', dot: '#b83232', bd: 'rgba(184,50,50,0.3)' },
}

/** Map classifier content_type strings to Pill color keys */
export function contentTypeToPillColor(contentType: string): PillColor {
  const map: Record<string, PillColor> = {
    solo: 'solo', corrupted: 'corrupt',
    mists_1v1: 'mists', mists_2v2: 'mists',
    hellgate_2v2: 'hg2', hellgate_5v5: 'hg5',
    small_scale: 'small', zvz: 'zvz', gank: 'gank', unknown: 'unknown',
  }
  return map[contentType] ?? 'unknown'
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  solo: 'Solo', corrupted: 'Corrupted',
  mists_1v1: 'Mists 1v1', mists_2v2: 'Mists 2v2',
  hellgate_2v2: 'HG 2v2', hellgate_5v5: 'HG 5v5',
  small_scale: 'Small scale', zvz: 'ZvZ', gank: 'Gank', unknown: 'Unknown',
}

export function Pill({ color, dot = false, children, className }: PillProps) {
  const s = PILL_STYLES[color] ?? PILL_STYLES.unknown

  return (
    <span
      className={cn('inline-flex items-center gap-[5px] font-mono font-medium uppercase whitespace-nowrap', className)}
      style={{
        height: 22,
        padding: '0 10px',
        borderRadius: 999,
        fontSize: 10,
        letterSpacing: '0.08em',
        background: s.bg,
        color: s.fg,
        border: s.bd ? `1px solid ${s.bd}` : '1px solid transparent',
        fontStyle: s.italic ? 'italic' : 'normal',
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: s.dot ?? s.fg,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  )
}
