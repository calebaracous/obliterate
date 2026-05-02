/* global React, Pill, ItemIcon, FreshnessBar */
const { useState: useShellState } = React;

function Sidebar({ active, onNav }) {
  const items = [
    { id: 'feed', label: 'Kill feed' },
    { id: 'builds', label: 'Builds' },
    { id: 'tier', label: 'Tier list' },
    { id: 'matchup', label: 'Matchups' },
    { id: 'player', label: 'Players' },
    { id: 'guild', label: 'Guilds' },
  ];
  return (
    <nav style={{
      width: 240, flexShrink: 0,
      background: 'var(--color-bg-surface)',
      borderRight: '1px solid var(--color-border-subtle)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0',
    }}>
      <div style={{ padding: '0 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="../../assets/glyph.svg" alt="" style={{ width: 28, height: 28 }}/>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
          letterSpacing: '0.12em', color: 'var(--color-text-primary)',
        }}>OBLITERATE</span>
      </div>

      <div style={{
        padding: '0 20px 8px',
        fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'var(--color-text-tertiary)',
      }}>Meta</div>
      {items.map((i) => (
        <div key={i.id}
          onClick={() => onNav(i.id)}
          style={{
            padding: '8px 20px',
            fontFamily: 'var(--font-sans)', fontSize: 13,
            color: active === i.id ? 'var(--color-gold-text)' : 'var(--color-text-secondary)',
            background: active === i.id ? 'var(--color-gold-subtle)' : 'transparent',
            borderLeft: active === i.id ? '2px solid var(--color-gold-bright)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => { if (active !== i.id) e.currentTarget.style.background = 'var(--color-bg-elevated)'; }}
          onMouseLeave={(e) => { if (active !== i.id) e.currentTarget.style.background = 'transparent'; }}
        >
          {i.label}
        </div>
      ))}

      <div style={{ flex: 1 }}/>
      <div style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border-subtle)' }}>
        Patch · 2026-04-18<br/>
        Build 4f3a2c · prod
      </div>
    </nav>
  );
}

function TopBar({ title, subtitle, regions }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 24px',
      borderBottom: '1px solid var(--color-border-subtle)',
      background: 'rgba(15,15,14,0.85)',
      backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
          letterSpacing: '0.02em', color: 'var(--color-text-primary)',
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--color-text-tertiary)', marginTop: 2,
          }}>{subtitle}</div>
        )}
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{
        height: 32, padding: '0 12px',
        background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 3,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        width: 280,
        fontFamily: 'var(--font-sans)', fontSize: 12,
        color: 'var(--color-text-tertiary)',
      }}>
        <span>⌕</span>
        <span>Search players, guilds, weapons…</span>
      </div>
      <FreshnessBar regions={regions}/>
    </header>
  );
}

Object.assign(window, { Sidebar, TopBar });
