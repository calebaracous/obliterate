import { cn } from '@/lib/utils'

export function Card({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-bg-surface border border-border-subtle rounded-[4px] p-4', className)}>
      {children}
    </div>
  )
}
