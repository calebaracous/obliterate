const REGION_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  west: { bg: 'bg-[#0e1828]', text: 'text-[#4a7ab8]', label: 'US' },
  eu: { bg: 'bg-[#0e1e0a]', text: 'text-[#6a9a40]', label: 'EU' },
  asia: { bg: 'bg-[#201408]', text: 'text-[#b87840]', label: 'AS' },
}

export function RegionBadge({ region }: { region: string }) {
  const s = REGION_STYLES[region] ?? {
    bg: 'bg-bg-subtle',
    text: 'text-text-secondary',
    label: region.toUpperCase(),
  }
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wide rounded-[2px] border border-white/5 ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  )
}
