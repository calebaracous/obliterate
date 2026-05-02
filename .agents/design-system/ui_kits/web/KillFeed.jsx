/* global React, Pill, ItemIcon */

const KILLS = [
  { id: 1, killer: 'Sigvald', kg: 'Black Hand', kIp: 1432, victim: 'Velthrak', vg: 'Mercia', vIp: 1287, type: 'hg5', typeLabel: 'HG 5v5', region: 'west', fame: '2.4M', ago: '2m', kQ: ['masterpiece','excellent','outstanding','good','normal'], vQ: ['outstanding','good','normal','normal','normal'] },
  { id: 2, killer: 'Yrsa.Ulvr', kg: 'Iron Crown', kIp: 1376, victim: 'Doomrider', vg: 'Ashen', vIp: 1198, type: 'zvz', typeLabel: 'ZvZ', region: 'eu', fame: '847k', ago: '5m', kQ: ['excellent','outstanding','good','normal','normal'], vQ: ['good','normal','normal','normal','normal'] },
  { id: 3, killer: 'Khorvash', kg: 'Twilight Vow', kIp: 1521, victim: 'Aelfric', vg: '—', vIp: 1102, type: 'mists', typeLabel: 'Mists 1v1', region: 'asia', fame: '312k', ago: '7m', kQ: ['masterpiece','masterpiece','excellent','outstanding','good'], vQ: ['outstanding','good','normal','normal','normal'] },
  { id: 4, killer: 'Brunhild', kg: 'Stoneforge', kIp: 1289, victim: 'Sablekeep', vg: 'Rust Watch', vIp: 1334, type: 'gank', typeLabel: 'Gank', region: 'west', fame: '1.1M', ago: '11m', kQ: ['excellent','excellent','outstanding','good','good'], vQ: ['masterpiece','excellent','outstanding','good','normal'] },
  { id: 5, killer: 'Ravenpriest', kg: 'Black Hand', kIp: 1402, victim: 'Volkar', vg: 'Mercia', vIp: 1356, type: 'hg2', typeLabel: 'HG 2v2', region: 'eu', fame: '923k', ago: '14m', kQ: ['masterpiece','excellent','excellent','outstanding','good'], vQ: ['excellent','outstanding','outstanding','good','good'] },
  { id: 6, killer: 'Solveig', kg: '—', kIp: 1187, victim: 'Maelfric', vg: 'Ashen', vIp: 1098, type: 'corrupt', typeLabel: 'Corrupted', region: 'asia', fame: '458k', ago: '18m', kQ: ['outstanding','good','good','normal','normal'], vQ: ['good','normal','normal','normal','normal'] },
];

function KillRow({ k }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 180px 70px 90px 30px auto 180px 70px 80px 40px',
      alignItems: 'center', gap: 12,
      height: 56, padding: '0 16px',
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 4,
      cursor: 'pointer',
      transition: 'background 150ms, border-color 150ms',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-elevated)'; e.currentTarget.style.borderColor = 'var(--color-border-default)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-surface)'; e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; }}
    >
      <div style={{ display: 'flex', gap: 2 }}>
        {k.kQ.map((q, i) => <ItemIcon key={i} size={22} quality={q}/>)}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{k.killer}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>⟪{k.kg}⟫</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)' }}>{k.kIp} IP</div>
      <Pill color={k.type}>{k.typeLabel}</Pill>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-crimson-text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>vs</div>
      <div style={{ display: 'flex', gap: 2 }}>
        {k.vQ.map((q, i) => <ItemIcon key={i} size={22} quality={q}/>)}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-secondary)' }}>{k.victim}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>⟪{k.vg}⟫</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)' }}>{k.vIp} IP</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-gold-text)', textAlign: 'right' }}>{k.fame}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'right' }}>{k.ago}</div>
    </div>
  );
}

function FilterBar({ filters, onChange }) {
  const opts = (label, value, key, list) => (
    <div style={{
      height: 32, padding: '0 12px',
      background: 'var(--color-bg-subtle)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 3,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-sans)', fontSize: 12,
      color: 'var(--color-text-primary)',
      cursor: 'pointer',
      borderBottom: filters[key] !== list[0] ? '2px solid var(--color-gold-bright)' : '1px solid var(--color-border-default)',
      borderRadius: filters[key] !== list[0] ? '3px 3px 0 0' : 3,
    }}
    onClick={() => {
      const idx = list.indexOf(value);
      onChange(key, list[(idx + 1) % list.length]);
    }}>
      <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      {value} <span style={{ color: 'var(--color-text-tertiary)' }}>▾</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: 8, padding: '14px 0', flexWrap: 'wrap' }}>
      {opts('Region', filters.region, 'region', ['All', 'West', 'EU', 'Asia'])}
      {opts('Type', filters.type, 'type', ['All', 'HG 5v5', 'HG 2v2', 'ZvZ', 'Mists 1v1'])}
      {opts('IP', filters.ip, 'ip', ['All', '800–1100', '1100–1400', '1400+'])}
      {opts('Window', filters.window, 'window', ['Last 24h', 'Last 7d', 'Last 30d'])}
    </div>
  );
}

function KillFeed() {
  const [filters, setFilters] = React.useState({ region: 'All', type: 'All', ip: 'All', window: 'Last 24h' });
  return (
    <div style={{ padding: '20px 24px', maxWidth: 1280 }}>
      <FilterBar filters={filters} onChange={(k, v) => setFilters({ ...filters, [k]: v })}/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {KILLS.map((k) => <KillRow key={k.id} k={k}/>)}
      </div>
      <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
        Showing 6 of 18,432 kills · scroll to load more
      </div>
    </div>
  );
}

Object.assign(window, { KillFeed, FilterBar, KillRow });
