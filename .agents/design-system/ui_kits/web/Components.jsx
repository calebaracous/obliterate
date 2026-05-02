/* global React */
const { useState } = React;

// ========================================================================
// Primitive — Button
// ========================================================================
function Button({ children, variant = 'ghost', size = 'md', onClick, disabled, icon }) {
  const base = {
    height: size === 'sm' ? 26 : 32,
    padding: size === 'sm' ? '0 10px' : '0 14px',
    borderRadius: 3,
    fontFamily: 'var(--font-sans)',
    fontSize: size === 'sm' ? 12 : 13,
    fontWeight: 500,
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'background 150ms cubic-bezier(.2,0,0,1), border-color 150ms',
    opacity: disabled ? 0.4 : 1,
    background: 'transparent',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border-default)',
  };
  const variants = {
    primary: { background: 'var(--color-gold-bright)', color: 'var(--color-text-inverse)', borderColor: 'transparent' },
    ghost:   {},
    danger:  { color: 'var(--color-crimson-text)', borderColor: 'rgba(184,50,50,0.4)' },
    quiet:   { borderColor: 'transparent', color: 'var(--color-text-secondary)' },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--color-gold-muted)';
        else if (variant === 'danger') e.currentTarget.style.background = 'var(--color-crimson-subtle)';
        else e.currentTarget.style.background = 'var(--color-bg-elevated)';
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = 'var(--color-gold-bright)';
        else e.currentTarget.style.background = 'transparent';
      }}
    >
      {icon}{children}
    </button>
  );
}

// ========================================================================
// Primitive — Pill
// ========================================================================
function Pill({ children, color, dot = false, style = {} }) {
  const colors = {
    west:    { bg: 'rgba(74,122,184,0.12)', fg: '#7aa8e8', dot: '#4a7ab8', bd: 'rgba(74,122,184,0.3)' },
    eu:      { bg: 'rgba(106,154,64,0.12)', fg: '#9ac870', dot: '#6a9a40', bd: 'rgba(106,154,64,0.3)' },
    asia:    { bg: 'rgba(184,120,64,0.12)', fg: '#e0a070', dot: '#b87840', bd: 'rgba(184,120,64,0.3)' },
    solo:    { bg: '#222220', fg: '#9a9890' },
    corrupt: { bg: 'rgba(140,80,180,0.12)', fg: '#c090e0' },
    mists:   { bg: 'rgba(64,180,180,0.12)', fg: '#70d0d0' },
    hg2:     { bg: 'rgba(201,146,42,0.12)', fg: '#e8b060' },
    hg5:     { bg: 'rgba(240,160,32,0.18)', fg: '#f0c060' },
    small:   { bg: 'rgba(74,122,184,0.12)', fg: '#7aa8e8' },
    zvz:     { bg: 'rgba(184,50,50,0.15)', fg: '#e06060' },
    gank:    { bg: 'rgba(217,122,42,0.15)', fg: '#e8a060' },
    unknown: { bg: '#1c1c1a', fg: '#5c5b55', italic: true },
    win:     { bg: 'rgba(58,122,58,0.12)', fg: '#6dbe6d', dot: '#3a7a3a', bd: 'rgba(58,122,58,0.3)' },
    stale:   { bg: 'rgba(232,176,96,0.12)', fg: '#e8b060', dot: '#e8b060', bd: 'rgba(232,176,96,0.3)' },
    down:    { bg: 'rgba(184,50,50,0.15)', fg: '#e06060', dot: '#b83232', bd: 'rgba(184,50,50,0.3)' },
  };
  const c = colors[color] || colors.solo;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 22, padding: '0 10px', borderRadius: 999,
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      background: c.bg, color: c.fg,
      border: c.bd ? `1px solid ${c.bd}` : '1px solid transparent',
      fontStyle: c.italic ? 'italic' : 'normal',
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot || c.fg }}/>}
      {children}
    </span>
  );
}

// ========================================================================
// Primitive — ItemIcon (placeholder thumbnail with quality border)
// ========================================================================
function ItemIcon({ size = 32, quality = 'normal', label }) {
  const qualities = {
    normal:      '#3a3a36',
    good:        '#6dbe6d',
    outstanding: '#4a8acb',
    excellent:   '#e8b060',
    masterpiece: '#d97a2a',
  };
  return (
    <div style={{
      width: size, height: size,
      background: 'var(--color-bg-subtle)',
      border: `${size >= 40 ? 1.5 : 1}px solid ${qualities[quality]}`,
      borderRadius: size >= 40 ? 3 : 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontSize: Math.max(8, size / 5),
      color: 'var(--color-text-tertiary)',
      letterSpacing: '0.08em',
      flexShrink: 0,
    }}>{label}</div>
  );
}

// ========================================================================
// WinBar
// ========================================================================
function WinBar({ pct, width = 100 }) {
  return (
    <div style={{ height: 6, width, background: 'var(--color-bg-subtle)', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
      <div style={{ background: 'var(--color-win)', width: `${pct}%` }}/>
      <div style={{ background: 'var(--color-loss)', width: `${100 - pct}%` }}/>
    </div>
  );
}

function pctColor(pct) {
  if (pct >= 55) return 'var(--color-gold-text)';
  if (pct <= 45) return 'var(--color-crimson-text)';
  return 'var(--color-text-primary)';
}

// ========================================================================
// FreshnessBar
// ========================================================================
function FreshnessBar({ regions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '8px 14px',
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 4,
      fontFamily: 'var(--font-mono)', fontSize: 12,
    }}>
      <span style={{
        fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'var(--color-text-tertiary)',
      }}>Freshness</span>
      {regions.map((r) => {
        const tone = r.status === 'fresh' ? '#6dbe6d' : r.status === 'stale' ? '#e8b060' : '#e06060';
        return (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: tone,
              boxShadow: r.status === 'fresh' ? `0 0 6px ${tone}99` : 'none',
            }}/>
            {r.name}
            <span style={{ color: r.status === 'fresh' ? '#6dbe6d' : r.status === 'stale' ? '#e8b060' : '#e06060' }}>
              {r.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { Button, Pill, ItemIcon, WinBar, FreshnessBar, pctColor });
