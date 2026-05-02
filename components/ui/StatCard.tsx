import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  className?: string
}

export function StatCard({ label, value, sub, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-bg-surface border border-border-subtle rounded-[4px] px-4 py-3',
        className
      )}
    >
      <div className="text-[11px] uppercase tracking-wide text-text-tertiary font-medium mb-1">
        {label}
      </div>
      <div className="text-[24px] font-mono font-medium text-text-primary leading-none">{value}</div>
      {sub && <div className="text-[11px] text-text-secondary mt-1">{sub}</div>}
    </div>
  )
}
