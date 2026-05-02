import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet'
  size?: 'sm' | 'md'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors rounded-[3px] cursor-pointer',
        size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm',
        variant === 'primary' && 'bg-gold-bright text-text-inverse hover:bg-gold-muted',
        variant === 'secondary' &&
          'bg-bg-elevated text-text-primary border border-border-default hover:border-border-strong',
        variant === 'ghost' && 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle',
        variant === 'danger' &&
          'border border-crimson-muted text-crimson-text hover:bg-crimson-subtle',
        variant === 'quiet' && 'text-text-secondary hover:text-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
