# Claude Code Handoff — Using the Obliterate Design System

> This guide tells **Claude Code** (working inside the Obliterate Next.js codebase) how to consume the design system in this folder. Read this first before touching any UI.

---

## What this folder is

A standalone reference design system for **Obliterate**, the Albion Online PvP analytics web app. It was authored from `.agents/DESIGN_SYSTEM_BRIEF.md` before any UI shipped — so it **is** the source of truth, not a recreation. The production app (`apps/web`) should be built _against_ this system.

```
obliterate-design-system/
├── README.md               ← human-readable design philosophy (read second)
├── SKILL.md                ← invokable skill manifest (ignore unless re-invoking)
├── HANDOFF.md              ← this file
├── colors_and_type.css     ← all design tokens (drop-in CSS variables)
├── assets/                 ← logo.svg, glyph.svg, logo-light.svg
├── preview/                ← per-token reference cards (visual lookup only)
└── ui_kits/web/            ← reference component implementations (vanilla React + inline styles)
```

The `preview/` cards exist for visual review, not consumption — don't import from them. The `ui_kits/web/` files use inline-style React for the standalone demo; in production, **port the patterns to Tailwind v4 + your file structure**, don't copy the JSX verbatim.

---

## Step 1 — Wire up the design tokens

The single most important thing in this folder is `colors_and_type.css`. It defines every color, type, spacing, radius, shadow, and motion variable as plain CSS custom properties.

### In Tailwind v4 (the brief's target stack)

Copy the variable values into a Tailwind `@theme` block in `apps/web/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-bg-base:        #0f0f0e;
  --color-bg-surface:     #181815;
  --color-bg-elevated:    #222220;
  --color-bg-subtle:      #1c1c1a;

  /* Borders */
  --color-border-subtle:  #2a2a27;
  --color-border-default: #3a3a36;
  --color-border-strong:  #4a4a45;

  /* Text */
  --color-text-primary:   #e8e6df;
  --color-text-secondary: #9a9890;
  --color-text-tertiary:  #5c5b55;
  --color-text-inverse:   #0f0f0e;

  /* Gold (primary accent) */
  --color-gold-bright: #c9922a;
  --color-gold-muted:  #8a6420;
  --color-gold-subtle: #2a2014;
  --color-gold-text:   #e8b060;

  /* Crimson (death / danger) */
  --color-crimson-bright: #b83232;
  --color-crimson-muted:  #7a2020;
  --color-crimson-subtle: #281414;
  --color-crimson-text:   #e06060;

  /* Win / loss / neutral (PvP outcomes — separate from brand crimson) */
  --color-win:        #3a7a3a;
  --color-win-text:   #6dbe6d;
  --color-win-subtle: #14281a;
  --color-loss:       #7a3a3a;
  --color-loss-text:  #e06060;
  --color-neutral:    #4a4a45;

  /* Region servers */
  --color-region-west: #4a7ab8;
  --color-region-eu:   #6a9a40;
  --color-region-asia: #b87840;

  /* Tiers */
  --color-tier-s-bg: #2a1e06; --color-tier-s-text: #f0a020;
  --color-tier-a-bg: #1e2a06; --color-tier-a-text: #90c040;
  --color-tier-b-bg: #062028; --color-tier-b-text: #40a0c0;
  --color-tier-c-bg: #20201a; --color-tier-c-text: #a0a090;
  --color-tier-d-bg: #201a1a; --color-tier-d-text: #806060;

  /* Item quality borders */
  --color-quality-normal:      #b8b8ad;
  --color-quality-good:        #6dbe6d;
  --color-quality-outstanding: #4a8acb;
  --color-quality-excellent:   #e8b060;
  --color-quality-masterpiece: #d97a2a;

  /* Type families */
  --font-display: 'Cinzel', 'Trajan Pro', serif;
  --font-sans:    'IBM Plex Sans', system-ui, sans-serif;
  --font-mono:    'IBM Plex Mono', 'SF Mono', Menlo, monospace;

  /* Radii */
  --radius-badge:  2px;
  --radius-button: 3px;
  --radius-card:   4px;
}
```

That gives you `bg-bg-base`, `text-gold-text`, `font-display`, `rounded-card`, etc. as auto-generated Tailwind utilities.

### Fonts

Add to `apps/web/app/layout.tsx`:

```tsx
import { Cinzel, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-display' });
const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-sans' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-mono' });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

## Step 2 — Port the brand assets

Copy SVGs verbatim:

```bash
cp obliterate-design-system/assets/glyph.svg       apps/web/public/brand/glyph.svg
cp obliterate-design-system/assets/logo.svg        apps/web/public/brand/logo.svg
cp obliterate-design-system/assets/logo-light.svg  apps/web/public/brand/logo-light.svg
```

Use them via `next/image` or plain `<img>`. Do **not** auto-generate brand SVGs — these are it.

---

## Step 3 — Rebuild the components in your stack

The reference implementations in `ui_kits/web/*.jsx` are vanilla React with inline styles (so they run standalone). For production, port each to a Tailwind class-based component under `apps/web/components/`.

### Mapping table

| Reference file | Production target | Notes |
|---|---|---|
| `Components.jsx` → `Button` | `components/ui/button.tsx` | 3 variants: primary (gold), ghost, danger. Use `cva` for variants. |
| `Components.jsx` → `Pill` | `components/ui/pill.tsx` | Region / content-type / status pills. Color enum, not freeform. |
| `Components.jsx` → `ItemIcon` | `components/items/item-icon.tsx` | Wrap `<Image>` to `https://render.albiononline.com/v1/item/${id}.png`. Cache to `/public/items/`. Quality border via prop. |
| `Components.jsx` → `WinBar` | `components/charts/win-bar.tsx` | 80px segmented bar. |
| `Components.jsx` → `FreshnessBar` | `components/layout/freshness-bar.tsx` | Reads from `/api/freshness` (Vercel KV). |
| `Shell.jsx` → `Sidebar` | `components/layout/sidebar.tsx` | Active state uses `usePathname()`. |
| `Shell.jsx` → `TopBar` | `components/layout/topbar.tsx` | Sticky with `backdrop-filter: blur(8px)`. |
| `KillFeed.jsx` → `KillRow` | `components/kills/kill-row.tsx` | Server-rendered list, hydrate for hover state. |
| `BuildsPage.jsx` → `WinRateRow` | `components/builds/win-rate-row.tsx` | Use TanStack Query for filter changes. |
| `BuildsPage.jsx` → `TierList` | `components/meta/tier-list.tsx` | Staggered fade-in on mount. |
| `BuildsPage.jsx` → `MatchupMatrix` | `components/charts/matchup-matrix.tsx` | Build with Observable Plot, not raw divs. |
| `PlayerProfile.jsx` → page | `app/players/[id]/page.tsx` | RSC, `revalidate: 300`. |

### Important rules

1. **Numbers are always mono and tabular.** Every percentage, IP value, fame, timestamp, K/D — IBM Plex Mono with `font-variant-numeric: tabular-nums`.
2. **Cinzel only for display + headings.** Never for body. Never below 16px.
3. **Sharp corners.** `rounded-card` (4px), `rounded-button` (3px), `rounded-badge` (2px). Pills use `rounded-full` and are reserved for region/content-type/status only.
4. **Win-rate color rule:** `≥ 55%` → `text-gold-text`, `≤ 45%` → `text-crimson-text`, else `text-text-primary`. Add `*` suffix when sample < 200.
5. **Active filter underline:** active filter dropdowns get `border-b-2 border-gold-bright` and lose their bottom border-radius. Inactive filters keep `border border-border-default rounded-button`.
6. **Hover states:** background steps up one level (`bg-surface` → `bg-elevated`). Never scale on hover. Never use shadow on hover.
7. **No emoji anywhere.** Use Lucide icons or color, never `🔥💀⚔️`.

---

## Step 4 — Voice & copy rules (apply during component authoring)

Copywriting is part of the design system. When you write button labels, empty states, error messages, or chart axis titles:

- **Sentence case** for body, table headers, filter labels: `Win rate`, `Sample size`, `Last 7 days`.
- **UPPERCASE** for micro-labels and tags: `WEST`, `S TIER`, `LIVE`.
- **Title Case** only for the product name (`Obliterate`) and proper nouns from the game (`Hellgates`, `Mists`, `Corrupted Dungeons`).
- **Numbers:** always show with one decimal for win rates (`54.3%`), compact for fame (`1.2M`, `847k`), raw for IP (`1432 IP`), tight for time (`2m`, `3h`, `4d`).
- **Confidence:** `*` after a percentage when sample < 200. `~` prefix on content-type label when classifier confidence < 0.8.
- **Tone:** terse, sharp, owns failure modes. `"Sample size 47 — too thin to call."` not `"Insufficient data."` `"API stale. Last poll 4m ago."` not `"Loading..."`
- **Banned:** marketing fluff (`Unleash your potential`), cheerleading (`Awesome!`), GoT LARP voice (`thy`, `forsooth`).

Full voice spec in `README.md` under "Content fundamentals".

---

## Step 5 — Iconography integration

Three sources, kept distinct:

### UI icons → `lucide-react`

```bash
pnpm add lucide-react
```

```tsx
import { Filter, Search, ChevronDown } from 'lucide-react';
// 16px in normal UI, 20px for standalone icon buttons. Stroke 2.
<Filter size={16} className="text-text-secondary" />
```

### Item thumbnails → Albion render API + local cache

Build a `<ItemIcon>` that:
1. Renders `<Image src={`/items/${id}.png`} />` from local cache.
2. On 404, fetches `https://render.albiononline.com/v1/item/${id}.png`, writes to `public/items/`, retries.
3. Applies the quality border via `border-quality-{normal|good|outstanding|excellent|masterpiece}`.
4. Has a skeleton bg pulse during load.

Sizes: 20 (kill card inline), 32 (table row), 40 (tier list), 64 (gear grid expanded).

### Brand glyphs → static SVG

`/public/brand/{glyph,logo,logo-light}.svg`. Never re-author.

---

## Step 6 — Animation guardrails

```css
/* Use these durations + easings everywhere. No bouncy springs. */
--duration-micro: 150ms;
--duration-base:  250ms;
--ease-out: cubic-bezier(0.2, 0, 0, 1);
--ease-in:  cubic-bezier(0.4, 0, 1, 1);
```

- **Hover/press:** `transition: background var(--duration-micro) var(--ease-out)`.
- **Filter changes / tab switches:** `var(--duration-base) var(--ease-out)`.
- **Kill feed entry:** new rows fade + `translateY(-8px → 0)` over 250ms.
- **Tier list on mount:** stagger 30ms per icon.
- **Charts:** let Observable Plot handle its own motion; do NOT layer CSS transitions on `<g>` elements.
- **Skeleton loaders, not spinners.**
- **Honor `prefers-reduced-motion`** — wrap all transitions in a media query check or a `useReducedMotion()` hook.

---

## Step 7 — Workflow when extending

When you need a new component or a new page:

1. **Check `preview/` first** — there may already be a swatch / specimen for what you're building. Open the relevant `.html` file.
2. **Check `ui_kits/web/*.jsx`** — find a similar pattern and port it.
3. **If nothing matches**, sketch it using only existing tokens. Don't invent new colors. If you find yourself reaching for a new accent — stop, ask the human.
4. **Write the component**, then add a story / showcase page under `apps/web/app/(internal)/styleguide/[name]/page.tsx` so the team can review it in isolation.

---

## Things that will trip you up

- **Don't import from `colors_and_type.css` directly into Next.js.** Port the values into `@theme` so Tailwind generates utilities. Otherwise you lose autocomplete + JIT pruning.
- **Don't use the `.t-display` / `.t-heading` etc. classes from `colors_and_type.css` in production.** Those exist for the standalone preview cards. In production, use Tailwind utilities (`font-display text-display-size leading-display-lh font-semibold`) or define typography components.
- **Don't copy inline styles from `ui_kits/web/`.** They're styled inline so the demo runs without a build step. Production should be Tailwind classes.
- **Don't re-author the logo or glyph.** Always use the provided SVG.
- **Don't add new tier colors / region colors / content-type colors.** The set is closed. If a new content type is added to the classifier, ask before assigning a color.
- **Don't round corners more than the spec.** No 8px, 12px, or 16px radii. Sharp is intentional.

---

## Quick smoke test

After you've wired tokens + ported the first component (likely `<Pill>` or `<Button>`), build this test page at `apps/web/app/(internal)/smoke/page.tsx`:

```tsx
export default function SmokePage() {
  return (
    <main className="min-h-screen bg-bg-base p-8 space-y-6">
      <h1 className="font-display text-3xl text-text-primary">Obliterate smoke test</h1>
      <p className="font-sans text-text-secondary">If this looks like the brief, tokens are wired correctly.</p>
      <div className="flex gap-2">
        <Button variant="primary">Apply filter</Button>
        <Button variant="ghost">Reset</Button>
        <Button variant="danger">Delete</Button>
      </div>
      <div className="flex gap-2">
        <Pill color="west" dot>West</Pill>
        <Pill color="eu" dot>EU</Pill>
        <Pill color="asia" dot>Asia</Pill>
        <Pill color="hg5">HG 5v5</Pill>
        <Pill color="zvz">ZvZ</Pill>
      </div>
      <div className="font-mono tabular-nums text-gold-text text-2xl">54.3%</div>
    </main>
  );
}
```

Compare against `preview/components-buttons.html` and `preview/components-badges.html`. They should be visually identical (within Tailwind's spacing rounding).

---

## Where to ask questions

- **Token / color question** → `colors_and_type.css` is canonical.
- **Voice / copy question** → `README.md` § Content fundamentals.
- **Component anatomy question** → `ui_kits/web/*.jsx` reference implementation, or the matching `preview/components-*.html` card.
- **"Should I add X?"** → Ask the human. The system is intentionally narrow.
