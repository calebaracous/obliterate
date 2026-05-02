'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/',        label: 'Kill feed' },
  { href: '/builds',  label: 'Builds' },
  { href: '/meta',    label: 'Tier list' },
  { href: '/matchups',label: 'Matchups' },
  { href: '/players', label: 'Players' },
  { href: '/guilds',  label: 'Guilds' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav
      className="w-[240px] flex-shrink-0 bg-bg-surface border-r border-border-subtle flex flex-col"
      style={{ minHeight: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border-subtle">
        <Image src="/brand/glyph.svg" alt="" width={28} height={28} />
        <span
          className="text-text-primary font-semibold tracking-[0.12em] uppercase"
          style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}
        >
          Obliterate
        </span>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
        Meta
      </div>

      {/* Nav items */}
      <div className="flex flex-col">
        {NAV.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center px-5 py-2 text-[13px] transition-colors"
              style={{
                fontFamily: 'var(--font-sans)',
                color: active ? 'var(--color-gold-text)' : 'var(--color-text-secondary)',
                background: active ? 'var(--color-gold-subtle)' : 'transparent',
                borderLeft: active
                  ? '2px solid var(--color-gold-bright)'
                  : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto px-5 py-4 border-t border-border-subtle font-mono text-[10px] text-text-tertiary leading-relaxed">
        Patch · 2026-04-18
        <br />
        obliterate · prod
      </div>
    </nav>
  )
}
