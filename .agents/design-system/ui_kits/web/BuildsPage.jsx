/* global React, ItemIcon, Pill, WinBar, pctColor */

const BUILDS = [
  { name: 'Cursed Staff',     cat: 'CURSED',     hand: '2H', sample: 3847, win: 61.2, q: 'excellent' },
  { name: 'Bloodletter',      cat: 'DAGGER',     hand: '1H', sample: 2916, win: 57.8, q: 'masterpiece' },
  { name: '1H Spear',         cat: 'SPEAR',      hand: '1H', sample: 2104, win: 54.3, q: 'masterpiece' },
  { name: 'Permafrost Prism', cat: 'FROST',      hand: '2H', sample: 1742, win: 53.9, q: 'excellent' },
  { name: 'Great Axe',        cat: 'AXE',        hand: '2H', sample: 1601, win: 52.1, q: 'excellent' },
  { name: 'Wailing Bow',      cat: 'BOW',        hand: '2H', sample: 1488, win: 51.4, q: 'outstanding' },
  { name: 'Carving Sword',    cat: 'SWORD',      hand: '1H', sample:  142, win: 43.1, q: 'good', thin: true },
  { name: 'Hoarfrost Staff',  cat: 'FROST',      hand: '2H', sample:   87, win: 39.2, q: 'normal', thin: true },
];

function WinRateRow({ b, isHover }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr 90px 100px 80px',
      alignItems: 'center', gap: 16,
      padding: '10px 12px',
      borderBottom: '1px solid var(--color-border-subtle)',
      background: isHover ? 'var(--color-bg-subtle)' : 'transparent',
      cursor: 'pointer',
    }}>
      <ItemIcon size={32} quality={b.q}/>
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-primary)' }}>{b.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
          <span style={{
            display: 'inline-block', padding: '1px 6px', borderRadius: 2,
            background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 6,
          }}>{b.cat}</span>
          {b.hand}{b.thin && <span style={{ color: 'var(--color-text-tertiary)', marginLeft: 8 }}>· low sample</span>}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'right' }}>{b.sample.toLocaleString()}</div>
      <WinBar pct={b.win} width={100}/>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: pctColor(b.win), textAlign: 'right' }}>
        {b.win.toFixed(1)}%{b.thin && '*'}
      </div>
    </div>
  );
}

function BuildsPage() {
  const [tab, setTab] = React.useState('table');
  const [hoverIdx, setHoverIdx] = React.useState(-1);
  return (
    <div style={{ padding: '20px 24px', maxWidth: 1280 }}>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border-default)', marginBottom: 16 }}>
        {['table', 'tier', 'matchup'].map((t) => (
          <div key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 18px',
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: tab === t ? 'var(--color-gold-text)' : 'var(--color-text-secondary)',
              borderBottom: tab === t ? '2px solid var(--color-gold-bright)' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1,
            }}>
            {t === 'table' ? 'Win rates' : t === 'tier' ? 'Tier list' : 'Matchups'}
          </div>
        ))}
      </div>

      {tab === 'table' && (
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 4 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 1fr 90px 100px 80px',
            gap: 16, padding: '10px 12px',
            fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--color-text-tertiary)',
            borderBottom: '1px solid var(--color-border-default)',
          }}>
            <div></div>
            <div>Weapon</div>
            <div style={{ textAlign: 'right' }}>Sample</div>
            <div></div>
            <div style={{ textAlign: 'right' }}>Win %</div>
          </div>
          {BUILDS.map((b, i) => (
            <div key={b.name} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(-1)}>
              <WinRateRow b={b} isHover={hoverIdx === i}/>
            </div>
          ))}
        </div>
      )}

      {tab === 'tier' && <TierList/>}
      {tab === 'matchup' && <MatchupMatrix/>}
    </div>
  );
}

function TierList() {
  const tiers = [
    { letter: 'S', bg: '#2a1e06', fg: '#f0a020', count: 5 },
    { letter: 'A', bg: '#1e2a06', fg: '#90c040', count: 8 },
    { letter: 'B', bg: '#062028', fg: '#40a0c0', count: 6 },
    { letter: 'C', bg: '#20201a', fg: '#a0a090', count: 4 },
    { letter: 'D', bg: '#201a1a', fg: '#806060', count: 3 },
  ];
  const qualityForIdx = (i) => ['masterpiece','excellent','excellent','outstanding','good','good','normal','normal'][i % 8];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {tiers.map((t) => (
        <div key={t.letter} style={{
          display: 'grid', gridTemplateColumns: '72px 1fr',
          minHeight: 64,
          border: '1px solid var(--color-border-subtle)', borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.bg, color: t.fg,
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '0.04em',
          }}>{t.letter}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 14px', background: 'var(--color-bg-surface)', flexWrap: 'wrap' }}>
            {[...Array(t.count)].map((_, i) => <ItemIcon key={i} size={40} quality={qualityForIdx(i)}/>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatchupMatrix() {
  const labels = ['CRS', 'SPR', 'SWD', 'DAG', 'BOW', 'XBW', 'AXE'];
  // synthetic win rates, symmetric (cell vs reflection sums to 100)
  const data = [
    [50, 61, 68, 52, 42, 59, 47],
    [39, 50, 51, 58, 64, 49, 53],
    [32, 49, 50, 63, 53, 41, 57],
    [48, 42, 37, 50, 55, 60, 44],
    [58, 36, 47, 45, 50, 56, 39],
    [41, 51, 59, 40, 44, 50, 48],
    [53, 47, 43, 56, 61, 52, 50],
  ];
  const cellColor = (v) => {
    // -25..+25 from neutral
    const t = (v - 50) / 50; // -1..1
    if (t > 0) return `rgba(58,122,58,${0.2 + t * 0.6})`;
    return `rgba(122,58,58,${0.2 + Math.abs(t) * 0.6})`;
  };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${labels.length}, 44px)`, gap: 2, fontFamily: 'var(--font-mono)' }}>
        <div></div>
        {labels.map((l) => <div key={l} style={{ fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'center', height: 28, lineHeight: '28px' }}>{l}</div>)}
        {data.map((row, ri) => (
          <React.Fragment key={ri}>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'right', paddingRight: 8, lineHeight: '44px' }}>{labels[ri]}</div>
            {row.map((v, ci) => ri === ci ? (
              <div key={ci} style={{ height: 44, background: 'repeating-linear-gradient(45deg, #2a2a27 0px, #2a2a27 2px, #181815 2px, #181815 4px)' }}/>
            ) : (
              <div key={ci} style={{
                height: 44, background: cellColor(v),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: v >= 55 ? '#0f0f0e' : v <= 45 ? '#0f0f0e' : '#e8e6df',
              }}>{v}</div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>
        Loss
        <div style={{ width: 200, height: 8, background: 'linear-gradient(90deg, #7a3a3a, #4a4a45, #3a7a3a)', borderRadius: 2 }}/>
        Win
      </div>
    </div>
  );
}

Object.assign(window, { BuildsPage, TierList, MatchupMatrix, WinRateRow });
