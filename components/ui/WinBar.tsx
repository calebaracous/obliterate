interface WinBarProps {
  wins: number
  losses: number
  width?: number
}

export function WinBar({ wins, losses, width = 80 }: WinBarProps) {
  const total = wins + losses
  if (total === 0) {
    return (
      <div
        style={{ width, height: 6, borderRadius: 999, background: 'var(--color-neutral)' }}
      />
    )
  }
  const winPct = wins / total
  return (
    <div
      style={{
        width,
        height: 6,
        borderRadius: 999,
        overflow: 'hidden',
        background: 'var(--color-loss)',
        display: 'flex',
      }}
    >
      <div
        style={{
          width: `${winPct * 100}%`,
          height: '100%',
          background: 'var(--color-win)',
        }}
      />
    </div>
  )
}
