import { cn } from '@/lib/utils'

const TYPE_STYLES: Record<string, string> = {
  solo: 'bg-bg-elevated text-text-secondary border-border-default',
  corrupted: 'bg-[#1e1428] text-[#b090e0] border-[#4a3060]',
  mists_1v1: 'bg-[#0e2020] text-[#60c8c0] border-[#206060]',
  mists_2v2: 'bg-[#0e2020] text-[#60c8c0] border-[#206060]',
  hellgate_2v2: 'bg-gold-subtle text-gold-text border-gold-muted/40',
  hellgate_5v5: 'bg-[#2a1a00] text-[#f0b040] border-[#604020]',
  small_scale: 'bg-[#0e1428] text-[#6090e0] border-[#204080]',
  zvz: 'bg-crimson-subtle text-crimson-text border-crimson-muted/40',
  gank: 'bg-[#1e1008] text-[#e08040] border-[#604020]',
  unknown: 'bg-bg-subtle text-text-tertiary border-border-subtle italic',
}

const TYPE_LABELS: Record<string, string> = {
  solo: 'Solo',
  corrupted: 'Corrupted',
  mists_1v1: 'Mists 1v1',
  mists_2v2: 'Mists 2v2',
  hellgate_2v2: 'HG 2v2',
  hellgate_5v5: 'HG 5v5',
  small_scale: 'Small Scale',
  zvz: 'ZvZ',
  gank: 'Gank',
  unknown: 'Unknown',
}

interface ContentTypeBadgeProps {
  contentType: string
  confidence?: number
}

export function ContentTypeBadge({ contentType, confidence = 1 }: ContentTypeBadgeProps) {
  const label = TYPE_LABELS[contentType] ?? contentType
  const prefix = confidence < 0.8 ? '~' : ''
  const styles = TYPE_STYLES[contentType] ?? TYPE_STYLES.unknown
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide font-mono rounded-[2px] border',
        styles
      )}
    >
      {prefix}
      {label}
    </span>
  )
}
