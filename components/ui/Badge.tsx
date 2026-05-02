import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'crimson' | 'win' | 'loss'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide font-mono',
        'rounded-[2px] border',
        variant === 'default' && 'bg-bg-subtle text-text-secondary border-border-subtle',
        variant === 'gold' && 'bg-gold-subtle text-gold-text border-gold-muted/40',
        variant === 'crimson' && 'bg-crimson-subtle text-crimson-text border-crimson-muted/40',
        variant === 'win' && 'bg-win-subtle text-win-text border-win/40',
        variant === 'loss' && 'bg-crimson-subtle text-loss-text border-loss/40',
        className
      )}
    >
      {children}
    </span>
  )
}
