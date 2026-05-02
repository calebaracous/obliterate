import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { WinBar } from '@/components/ui/WinBar'

export default function SmokePage() {
  return (
    <main className="min-h-screen bg-bg-base p-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl text-text-primary mb-1">Obliterate smoke test</h1>
        <p className="font-sans text-text-secondary text-sm">
          If this looks like the brief, tokens are wired correctly.
        </p>
      </div>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-medium">Buttons</div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="primary">Apply filter</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Reset</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="quiet">Quiet</Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="primary" size="sm">Small primary</Button>
          <Button variant="ghost" size="sm">Small ghost</Button>
          <Button variant="danger" size="sm">Small danger</Button>
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-medium">Region pills</div>
        <div className="flex gap-2 flex-wrap">
          <Pill color="west" dot>West</Pill>
          <Pill color="eu" dot>EU</Pill>
          <Pill color="asia" dot>Asia</Pill>
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-medium">Content type pills</div>
        <div className="flex gap-2 flex-wrap">
          <Pill color="hg5">HG 5v5</Pill>
          <Pill color="hg2">HG 2v2</Pill>
          <Pill color="zvz">ZvZ</Pill>
          <Pill color="mists">Mists 1v1</Pill>
          <Pill color="corrupt">Corrupted</Pill>
          <Pill color="solo">Solo</Pill>
          <Pill color="small">Small scale</Pill>
          <Pill color="gank">Gank</Pill>
          <Pill color="unknown">Unknown</Pill>
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-medium">Status pills</div>
        <div className="flex gap-2 flex-wrap">
          <Pill color="win" dot>Win</Pill>
          <Pill color="stale" dot>Stale</Pill>
          <Pill color="down" dot>Down</Pill>
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-medium">Win bar</div>
        <div className="flex items-center gap-4">
          <WinBar wins={72} losses={28} />
          <span className="font-mono text-[12px] text-text-secondary">72W / 28L</span>
        </div>
        <div className="flex items-center gap-4">
          <WinBar wins={44} losses={56} />
          <span className="font-mono text-[12px] text-text-secondary">44W / 56L</span>
        </div>
        <div className="flex items-center gap-4">
          <WinBar wins={0} losses={0} />
          <span className="font-mono text-[12px] text-text-secondary">No data</span>
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-medium">Typography + numbers</div>
        <div className="font-mono text-[24px] tabular-nums text-gold-text">54.3%</div>
        <div className="font-mono text-[24px] tabular-nums text-crimson-text">41.2%</div>
        <div className="font-mono text-[14px] tabular-nums text-text-primary">1,432 IP · 2.4M fame · 3h</div>
      </section>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-medium">Surface colors</div>
        <div className="flex gap-2">
          {[
            ['bg-bg-base', '#0f0f0e'],
            ['bg-bg-surface', '#181815'],
            ['bg-bg-elevated', '#222220'],
            ['bg-bg-subtle', '#1c1c1a'],
          ].map(([cls, hex]) => (
            <div key={cls} className="text-center">
              <div
                className={`w-16 h-12 rounded-[4px] border border-border-subtle ${cls}`}
              />
              <div className="font-mono text-[10px] text-text-tertiary mt-1">{hex}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
