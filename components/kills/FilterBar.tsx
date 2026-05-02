'use client'
import { ChevronDown } from 'lucide-react'

const REGIONS = [
  { value: 'all', label: 'All' },
  { value: 'west', label: 'West' },
  { value: 'eu', label: 'EU' },
  { value: 'asia', label: 'Asia' },
]

const CONTENT_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'hellgate_5v5', label: 'HG 5v5' },
  { value: 'hellgate_2v2', label: 'HG 2v2' },
  { value: 'zvz', label: 'ZvZ' },
  { value: 'mists_1v1', label: 'Mists 1v1' },
  { value: 'mists_2v2', label: 'Mists 2v2' },
  { value: 'corrupted', label: 'Corrupted' },
  { value: 'solo', label: 'Solo' },
  { value: 'small_scale', label: 'Small scale' },
  { value: 'gank', label: 'Gank' },
]

const IP_BRACKETS = [
  { value: 'all', label: 'All IP' },
  { value: '800-1100', label: '800–1100' },
  { value: '1100-1400', label: '1100–1400' },
  { value: '1400+', label: '1400+' },
]

const WINDOWS = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'Last 7d' },
  { value: '30d', label: 'Last 30d' },
]

export interface FilterBarValues {
  region: string
  contentType: string
  ipBracket: string
  window: string
}

interface FilterBarProps extends FilterBarValues {
  onRegionChange: (v: string) => void
  onContentTypeChange: (v: string) => void
  onIpBracketChange: (v: string) => void
  onWindowChange: (v: string) => void
}

function FilterSelect({
  label,
  value,
  options,
  defaultValue,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  defaultValue: string
  onChange: (v: string) => void
}) {
  const active = value !== defaultValue
  return (
    <label
      style={{
        height: 32,
        padding: '0 10px',
        background: 'var(--color-bg-subtle)',
        border: `1px solid var(--color-border-default)`,
        borderBottom: active ? '2px solid var(--color-gold-bright)' : undefined,
        borderRadius: active ? '3px 3px 0 0' : 3,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          color: 'var(--color-text-primary)',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={11} color="var(--color-text-tertiary)" />
    </label>
  )
}

export function FilterBar({
  region,
  contentType,
  ipBracket,
  window,
  onRegionChange,
  onContentTypeChange,
  onIpBracketChange,
  onWindowChange,
}: FilterBarProps) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '14px 0', flexWrap: 'wrap' }}>
      <FilterSelect
        label="Region"
        value={region}
        options={REGIONS}
        defaultValue="all"
        onChange={onRegionChange}
      />
      <FilterSelect
        label="Type"
        value={contentType}
        options={CONTENT_TYPES}
        defaultValue="all"
        onChange={onContentTypeChange}
      />
      <FilterSelect
        label="IP"
        value={ipBracket}
        options={IP_BRACKETS}
        defaultValue="all"
        onChange={onIpBracketChange}
      />
      <FilterSelect
        label="Window"
        value={window}
        options={WINDOWS}
        defaultValue="24h"
        onChange={onWindowChange}
      />
    </div>
  )
}
