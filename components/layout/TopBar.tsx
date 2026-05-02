'use client'
import { Search } from 'lucide-react'
import { FreshnessBar } from './FreshnessBar'

export function TopBar() {
  return (
    <header
      className="flex items-center gap-4 px-6 border-b border-border-subtle flex-shrink-0"
      style={{
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(15,15,14,0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 text-text-tertiary text-[12px] flex-1 max-w-[280px]"
        style={{
          height: 32,
          background: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 3,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <Search size={13} />
        <span>Search players, guilds, weapons…</span>
      </div>

      <div className="flex-1" />

      {/* Freshness inline */}
      <FreshnessBar />
    </header>
  )
}
