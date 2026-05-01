# Albion PvP Analytics — Design System Brief

**For:** Claude Design (design system creation)
**Output:** A complete Tailwind CSS v4 design system + component library spec
**Stack:** Next.js 15, React, Tailwind CSS v4, Observable Plot, D3

---

## Product context

A public web tool for Albion Online players that surfaces PvP gear/build
statistics, win rates, meta tier lists, and counter-build recommendations.
Target audience: competitive PvP players, guild leaders, theorycrafters.
They are data-hungry, sophisticated, and already familiar with tools like
Murder Ledger and Albionbb.

The tool is data-dense — think League of Legends OP.GG or Warcraft Logs
rather than a marketing site. Most pages are dashboards with filters, tables,
heatmaps, and sparklines.

---

## Aesthetic direction

**Core feeling:** Dark, data-forward, professional. Like a military intelligence
dashboard filtered through the medieval-fantasy aesthetic of Albion Online.
Not cartoonish. Not corporate SaaS. Not purple-gradient AI slop.

**Tone references:**
- Warcraft Logs — dense data, dark bg, confident typography
- Teamfight Tactics meta sites — compact cards, color-coded tiers
- Medieval illuminated manuscript meets modern terminal/HUD

**Visual character:**
- Dark backgrounds (near-black, not pure black)
- Muted gold / amber as the primary accent — references Albion's silver/gold
  economy and medieval aesthetic
- Deep crimson as the secondary accent for danger/death/kills
- Cool gray for neutral data surfaces
- Tight, readable typography — players are scanning tables, not reading prose
- Subtle parchment/stone texture on backgrounds (CSS only, no images)
- Sharp corners where possible — this is not a rounded-corners-everywhere SaaS app.
  Cards get `border-radius: 4px`, not `12px`.

---

## Color system

Define as Tailwind CSS v4 CSS custom properties (`@theme` block).

### Base palette

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-base` | `#0f0f0e` | Page background |
| `--color-bg-surface` | `#181815` | Card / panel background |
| `--color-bg-elevated` | `#222220` | Dropdown, modal, raised surface |
| `--color-bg-subtle` | `#1c1c1a` | Table row hover, input background |
| `--color-border-subtle` | `#2a2a27` | Default border |
| `--color-border-default` | `#3a3a36` | Emphasized border |
| `--color-border-strong` | `#4a4a45` | Active / selected border |

### Text

| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#e8e6df` | Primary text — warm white, not pure white |
| `--color-text-secondary` | `#9a9890` | Secondary / muted text |
| `--color-text-tertiary` | `#5c5b55` | Placeholder, disabled, captions |
| `--color-text-inverse` | `#0f0f0e` | Text on light/accent backgrounds |

### Accents

| Token | Hex | Usage |
|---|---|---|
| `--color-gold-bright` | `#c9922a` | Primary accent — CTA buttons, active states, highlights |
| `--color-gold-muted` | `#8a6420` | Hover state for gold elements |
| `--color-gold-subtle` | `#2a2014` | Gold tint for backgrounds (e.g. selected row) |
| `--color-gold-text` | `#e8b060` | Gold text on dark backgrounds |
| `--color-crimson-bright` | `#b83232` | Kills, danger, death indicators |
| `--color-crimson-muted` | `#7a2020` | Hover state for crimson |
| `--color-crimson-subtle` | `#281414` | Crimson tint for backgrounds |
| `--color-crimson-text` | `#e06060` | Crimson text on dark backgrounds |

### Semantic / data

| Token | Hex | Usage |
|---|---|---|
| `--color-win` | `#3a7a3a` | Win rates, positive indicators |
| `--color-win-text` | `#6dbe6d` | Win rate text |
| `--color-win-subtle` | `#14281a` | Win tint backgrounds |
| `--color-loss` | `#7a3a3a` | Loss rates, negative indicators |
| `--color-loss-text` | `#e06060` | Loss rate text |
| `--color-neutral` | `#4a4a45` | 50/50, neutral states |
| `--color-region-west` | `#4a7ab8` | Americas server |
| `--color-region-eu` | `#6a9a40` | Europe server |
| `--color-region-asia` | `#b87840` | Asia server |

### Tier colors (for tier list)

| Token | Hex | Label bg | Label text |
|---|---|---|---|
| `--color-tier-s-bg` | `#2a1e06` | S tier | `--color-tier-s-text`: `#f0a020` |
| `--color-tier-a-bg` | `#1e2a06` | A tier | `--color-tier-a-text`: `#90c040` |
| `--color-tier-b-bg` | `#062028` | B tier | `--color-tier-b-text`: `#40a0c0` |
| `--color-tier-c-bg` | `#20201a` | C tier | `--color-tier-c-text`: `#a0a090` |
| `--color-tier-d-bg` | `#201a1a` | D tier | `--color-tier-d-text`: `#806060` |

---

## Typography

### Font stack

| Role | Font | Source |
|---|---|---|
| Display / headings | **Cinzel** | Google Fonts — serif, Roman majuscule, medieval-regal |
| Body / UI | **IBM Plex Sans** | Google Fonts — technical, readable, humanist |
| Monospace / numbers | **IBM Plex Mono** | Google Fonts — for IP numbers, item IDs, stats |

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');
```

### Type scale

| Token | Size | Weight | Font | Line height | Usage |
|---|---|---|---|---|---|
| `text-display` | 28px | 600 | Cinzel | 1.2 | Page titles, hero stats |
| `text-heading` | 18px | 600 | Cinzel | 1.3 | Section headings |
| `text-subheading` | 14px | 500 | IBM Plex Sans | 1.4 | Card titles, table headers |
| `text-body` | 14px | 400 | IBM Plex Sans | 1.6 | Body text |
| `text-small` | 12px | 400 | IBM Plex Sans | 1.5 | Captions, badges |
| `text-micro` | 11px | 500 | IBM Plex Sans | 1.4 | Labels, uppercase tags |
| `text-stat` | 24px | 500 | IBM Plex Mono | 1.1 | Large stat numbers |
| `text-mono` | 13px | 400 | IBM Plex Mono | 1.5 | Item IDs, percentages |

---

## Spacing system

Base unit: 4px. Scale: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48.
(Standard Tailwind spacing — no changes needed here.)

Component-specific:
- Card padding: `16px` (inner), `20px` (large card)
- Table cell padding: `8px 12px`
- Sidebar width: `240px`
- Max content width: `1280px`
- Chart gutter: `40px` (space for axis labels)

---

## Component specifications

### Kill card

A compact card showing a single kill event. Used in kill feeds and player
profile pages. Approx 60px tall.

**Layout:** `[Killer gear icons] [Killer name + guild] [IP] [content-type badge] [vs] [Victim name + guild] [IP] [victim gear icons] [fame] [time ago]`

- Gear icons: 20×20px item thumbnails, 5 in a row (mainhand, offhand, helm, chest, shoes), 2px gap
- Content-type badge: pill, 10px font, uppercase, colored by content type
- IP numbers: IBM Plex Mono, 12px
- Fame: IBM Plex Mono, gold text
- On hover: background lightens to `--color-bg-elevated`, show full gear row

### Weapon win-rate row

Used in the builds/meta page table.

**Layout:** `[weapon icon 32×32] [weapon name] [subcategory tag] [sample size] [win rate bar] [win rate %]`

- Win rate bar: 80px wide, segmented — green fill for win %, red for loss %
- Win rate %: IBM Plex Mono, colored by value (≥55% gold, ≤45% crimson, else default)
- Confidence asterisk: `*` after % if sample size < 200
- Hover: expand row to show top 3 counters inline

### Tier list card

**Layout:** `[Tier label S/A/B/C/D] [weapon icon grid]`

- Tier label: Cinzel, 20px, full-height left column, background = tier color bg
- Weapon icons: 40×40px grid, 4px gap
- Hover weapon icon: tooltip with name + win rate

### Matchup matrix cell

Grid of weapon-vs-weapon win rates. Cell is 40×40px minimum.

- Color: CSS linear interpolation from `--color-loss` (0%) through neutral (50%) to `--color-win` (100%)
- Number inside: 11px mono, white for dark cells, dark for light cells
- Diagonal cells (weapon vs itself): hatched pattern, no value
- Row/column headers: weapon icon + 11px name label

### Gear slot display

Full gear snapshot for a player at time of kill. Used in expanded kill view
and player profiles.

**Layout:** 3×3 grid + 3 consumable slots

```
[Head]    [Cape]   [Bag]
[Chest]   [Mount]  [Food]
[Shoes]   [Main]   [Off]
          [Potion]
```

- Slot bg: `--color-bg-subtle` for empty slots
- Item quality border: 1px border color by quality (white=normal, green=good,
  blue=outstanding, yellow=excellent, orange=masterpiece)
- Hover: show item name + IP tooltip

### Region badge

Pill badge showing which server a kill is from.

- West: blue tint text, blue subtle bg
- EU: green tint text, green subtle bg
- Asia: amber tint text, amber subtle bg
- Font: 10px, uppercase, IBM Plex Mono

### Content-type badge

Pill badge for classified content type.

| Type | Color |
|---|---|
| Solo | Gray |
| Corrupted | Purple tint |
| Mists 1v1 | Teal |
| Mists 2v2 | Teal |
| HG 2v2 | Amber |
| HG 5v5 | Amber, brighter |
| Small scale | Blue |
| ZvZ | Crimson |
| Gank | Orange |
| Unknown | Dimmed gray, italic |

Show `~` prefix on label when confidence < 0.8.

### Freshness indicator

Global status bar at top of page (or collapsible in header).
Shows per-region ingestion status.

- Green dot: region fresh (< 2 min since last poll)
- Amber dot + time: slightly stale (2–10 min)
- Red dot + "Stale": API down, showing last polled time
- Clicking expands to show consecutive error count

### Filter bar

Used above builds page, kill feed, etc. Horizontal row of dropdowns.

- Background: `--color-bg-surface`
- Border bottom: `--color-border-default`
- Dropdowns: custom-styled `<select>` or headless combobox
- Active filter: gold underline or filled background
- Layout: `[Region] [Content Type] [IP Bracket] [Time Window] [Patch]`

---

## Icon system

Use **Lucide React** for UI icons (close, filter, chevron, search, etc.).
All at 16px in UI contexts, 20px for standalone buttons.

Item thumbnails come from the Albion render API and are cached locally.
Use a `<ItemIcon>` component that handles loading state and fallback.

---

## Chart design tokens

For Observable Plot and D3 charts. Provide these as a `chartTheme` export
from `lib/design/chart-theme.ts`:

```typescript
export const chartTheme = {
  background: 'transparent',
  axis: {
    stroke: '#3a3a36',         // --color-border-default
    label: '#9a9890',          // --color-text-secondary
    tick: '#5c5b55',           // --color-text-tertiary
  },
  grid: {
    stroke: '#2a2a27',         // --color-border-subtle
    opacity: 0.8,
  },
  marks: {
    win: '#3a7a3a',
    loss: '#7a3a3a',
    neutral: '#4a4a45',
    gold: '#c9922a',
    crimson: '#b83232',
  },
  text: {
    fill: '#9a9890',
    size: 11,
    fontFamily: 'IBM Plex Mono',
  },
}
```

---

## Animation guidelines

- Keep animations fast: 150ms for micro-interactions, 250ms for transitions.
- No bouncy/elastic easings — this is a data tool, not a game.
- `ease-out` for entering elements, `ease-in` for exiting.
- Kill feed: new kills slide in from top with `translateY(-8px) → 0` + fade.
- Tier list: weapon icons reveal with staggered fade on page load.
- Charts: Observable Plot handles its own animation; don't add CSS transitions
  on top of D3 elements.
- Skeleton loaders instead of spinners for initial data loads.

---

## Responsive breakpoints

This is a desktop-first tool (Albion players are on PC). Mobile is nice-to-have.

| Breakpoint | Target |
|---|---|
| `xl` (1280px+) | Full layout — sidebar + main |
| `lg` (1024px) | Condensed sidebar |
| `md` (768px) | Collapsed sidebar, horizontal scroll on tables |
| `sm` (640px) | Mobile — single column, reduced chart sizes |

---

## Key pages to design

Priority order:

1. **Homepage / Kill feed** — live kills list with basic filters
2. **Builds / Meta page** — weapon win rates with filter bar, tier list tab, matchup matrix tab
3. **Player profile** — header stats, kill history, favorite weapons, recent kills/deaths
4. **Guild page** — similar to player but guild-wide
5. **Navigation / layout shell** — sidebar or top nav, global search, freshness indicator
6. **Landing page** — explain the tool, CTA to explore

---

## Accessibility

- Minimum contrast ratio: 4.5:1 for body text. The warm white on near-black
  palette achieves this.
- All interactive elements keyboard-accessible.
- Chart data tables: provide an accessible `<table>` alternative alongside
  visual charts (can be visually hidden).
- Color is never the *only* indicator — win/loss also uses % numbers and icons.
- Reduced-motion: respect `prefers-reduced-motion` — skip slide-in animations,
  use instant transitions.

---

## Tailwind v4 config notes

In Tailwind v4, the theme is defined in CSS via `@theme`:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-bg-base: #0f0f0e;
  --color-bg-surface: #181815;
  /* ... all tokens above */

  --font-display: 'Cinzel', serif;
  --font-sans: 'IBM Plex Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  --radius-card: 4px;
  --radius-badge: 2px;
  --radius-button: 3px;
}
```

Utility classes are then auto-generated: `bg-bg-base`, `text-gold-text`,
`font-display`, `rounded-card`, etc.
