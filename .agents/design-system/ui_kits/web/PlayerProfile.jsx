/* global React, ItemIcon, Pill, WinBar, pctColor */

function StatBlock({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'var(--color-text-tertiary)',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
        color: color || 'var(--color-text-primary)',
      }}>{value}</div>
    </div>
  );
}

function PlayerProfile() {
  const fav = [
    { name: 'Cursed Staff', kills: 142, win: 68.4, q: 'masterpiece' },
    { name: 'Bloodletter',  kills:  87, win: 61.2, q: 'excellent' },
    { name: '1H Spear',     kills:  54, win: 53.8, q: 'outstanding' },
    { name: 'Permafrost',   kills:  31, win: 48.1, q: 'good' },
  ];
  const recent = [
    { type: 'kill',  vs: 'Velthrak',   guild: 'Mercia',     ip: 1287, fame: '2.4M', ago: '2m',  region: 'west', tag: 'hg5',  tagL: 'HG 5v5' },
    { type: 'kill',  vs: 'Doomrider',  guild: 'Ashen',      ip: 1198, fame: '847k', ago: '5m',  region: 'eu',   tag: 'zvz',  tagL: 'ZvZ' },
    { type: 'death', vs: 'Khorvash',   guild: 'Twilight',   ip: 1521, fame: '1.2M', ago: '14m', region: 'eu',   tag: 'mists', tagL: 'Mists 2v2' },
    { type: 'kill',  vs: 'Aelfric',    guild: '—',          ip: 1102, fame: '312k', ago: '24m', region: 'asia', tag: 'gank', tagL: 'Gank' },
  ];

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1280, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 4,
        padding: 24,
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 4,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--color-gold-text)',
        }}>S</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '0.02em', color: 'var(--color-text-primary)' }}>Sigvald</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-secondary)' }}>⟪Black Hand⟫</span>
            <Pill color="west" dot>West</Pill>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>Last seen 2m ago</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          <StatBlock label="Kills (7d)" value="384"/>
          <StatBlock label="Deaths" value="47"/>
          <StatBlock label="K/D" value="8.17" color="var(--color-gold-text)"/>
          <StatBlock label="Fame (7d)" value="142M" color="var(--color-gold-text)"/>
        </div>
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Favorite weapons */}
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 4 }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border-default)',
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
            letterSpacing: '0.02em', color: 'var(--color-text-primary)',
          }}>Favorite weapons</div>
          {fav.map((w) => (
            <div key={w.name} style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 60px 80px 60px',
              gap: 12, alignItems: 'center',
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}>
              <ItemIcon size={32} quality={w.q}/>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-primary)' }}>{w.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'right' }}>{w.kills}k</div>
              <WinBar pct={w.win} width={80}/>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: pctColor(w.win), textAlign: 'right' }}>{w.win.toFixed(1)}%</div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 4 }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border-default)',
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
            letterSpacing: '0.02em', color: 'var(--color-text-primary)',
          }}>Recent activity</div>
          {recent.map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr auto auto auto',
              gap: 10, alignItems: 'center',
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: r.type === 'kill' ? 'var(--color-win-text)' : 'var(--color-crimson-text)',
              }}>{r.type === 'kill' ? '+ KILL' : '− DEATH'}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-primary)' }}>{r.vs}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>⟪{r.guild}⟫ · {r.ip} IP</div>
              </div>
              <Pill color={r.tag}>{r.tagL}</Pill>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold-text)' }}>{r.fame}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{r.ago}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PlayerProfile });
