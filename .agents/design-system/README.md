# Obliterate — Design System

> **Obliterate** is a public web tool for Albion Online players that surfaces PvP gear/build statistics, win rates, meta tier lists, and counter-build recommendations. It's an aggregator of the killboard meta — like OP.GG for League, but for Albion's open-world PvP.

The product is data-dense. Most pages are dashboards: filters, tables, heatmaps, sparklines, kill feeds. The design language is **dark, data-forward, professional** — military intelligence dashboard filtered through Albion's medieval-fantasy aesthetic. Not cartoonish. Not corporate SaaS. Not purple-gradient AI slop.

---

## Sources

- **Codebase brief** — `obliterate/.agents/DESIGN_SYSTEM_BRIEF.md` (mounted via File System Access API). Comprehensive Tailwind v4 design spec written before any UI was built.
- **Project context** — `obliterate/.agents/CLAUDE.md`, `ARCHITECTURE.md`, `API.md`, `DATABASE.md`. Stack: Next.js 15 App Router, TypeScript strict, Tailwind v4, Observable Plot + D3, Neon Postgres, Vercel KV.
- **Existing app code** — none yet. The codebase is a brief / planning repo; UI does not exist. This design system **is** the source of truth that the production app will be built against.

> Because there is no shipped UI to copy from, the UI kit components in `ui_kits/` are first-pass interpretations of the brief. They are intended as the reference build for the production app, not recreations of an existing app.

---

## Tone references

- **Warcraft Logs** — dense data tables, dark bg, confident typography, no decoration
- **OP.GG / Murder Ledger** — kill feeds, build cards, percentage-everywhere
- **Teamfight Tactics meta sites** — compact tier list cards, color-coded
- **Medieval illuminated manuscript meets modern terminal/HUD** — the visual emotional pole

---

## Index

| Path | What it contains |
|---|---|
| `README.md` | This file. Overview, content + visual foundations, iconography, manifest. |
| `HANDOFF.md` | **Claude Code integration guide** — how to wire this system into the Next.js app: token port to Tailwind v4 `@theme`, font setup, asset copy, component porting map, smoke test. Read this before touching any UI in `apps/web/`. |
| `SKILL.md` | Cross-compatible Agent Skill manifest. Read first if invoking as a skill. |
| `colors_and_type.css` | All CSS custom properties — colors, type scale, spacing, radii, shadows, motion. Plus semantic type classes (`.t-display`, `.t-heading`, etc.). |
| `fonts/` | (none — fonts are loaded from Google Fonts CDN: Cinzel, IBM Plex Sans, IBM Plex Mono.) |
| `assets/` | Brand logo, sample item icons (from Albion render API), region/tier glyphs. |
| `preview/` | Per-card HTML files that render in the Design System tab — color swatches, type specimens, button states, badges, kill cards, etc. |
| `ui_kits/web/` | The web app UI kit. JSX components for the live kill feed, builds page, tier list, player profile, navigation shell. `index.html` is an interactive demo. |

---

## Content fundamentals

**Voice.** Write like a sharp guildmate who reads dev patches at 2 AM. Confident, specific, not wordy. Numbers do the talking; copy stays out of the way. The reader is already an Albion player — never explain what IP or fame is.

**Pronouns.** "You" for the reader (it's their stats, their meta). "We" only in the about page. Never "us" / "our team" elsewhere.

**Casing.**
- **Sentence case** for body, table headers, filter labels: "Win rate", "Sample size", "Last 7 days".
- **UPPERCASE** for micro-labels, region tags, tier letters: `WEST`, `EU`, `S TIER`, `LIVE`.
- **Title Case** is rare — only product name (Obliterate), proper nouns from the game (Hellgates, Corrupted Dungeons, Mists), and page titles.

**Numbers.**
- Always show the number. Confidence asterisk `*` when sample < 200.
- Fame in compact form: `1.2M`, `847k`, never `1,200,000`.
- Win rates always with one decimal: `54.3%`, never `54%` or `54.32%`.
- IP shown raw: `1432 IP`, mono font.
- Time ago in tight short form: `2m`, `3h`, `4d`, never `2 minutes ago`.

**Tone tells.**
- "Sample size 47 — too thin." (call it out, don't hide it)
- "API stale. Last poll 4m ago." (own the failure mode)
- "Top counter: Cursed Staff (61.2%)." (lead with the verdict)

**Avoid.**
- Cheerleading: no "Awesome!", "Great choice!", "You're crushing it!"
- Marketing fluff: no "Unleash your potential", "The ultimate destination"
- Emoji: not part of the brand. Use icons or color, not 🔥💀⚔️.
- Game-of-Thrones medieval LARP voice: no "thy", "forsooth", "by the gods". Cinzel does the medieval lifting; copy stays modern.

**Examples.**
- ✅ "Live kills · 3 regions · updated 47s ago"
- ✅ "1H Spear is up 4.2% this patch."
- ✅ "Sample size 47 — too thin to call."
- ❌ "Discover the most powerful builds in Albion! 🗡️"
- ❌ "Welcome, brave warrior, to the ultimate Albion meta tracker."

---

## Visual foundations

### Color
The palette is **near-black + warm-white + muted gold + deep crimson**. No bright blues, no pastels, no neon. Backgrounds sit in a tight range from `#0f0f0e` (page) to `#222220` (elevated) — depth comes from layering, not color shifts. **Gold** (`#c9922a`) is the primary accent; reserved for CTAs, active states, and "good" stats. **Crimson** (`#b83232`) means death, kills, danger — never used decoratively. Win/loss gets its own muted green/red pair so PvP outcomes don't fight the brand crimson. Tier labels (S/A/B/C/D) each get a tinted background — gold for S, lime for A, cyan for B, gray for C, dim red for D.

### Type
**Cinzel** (serif, Roman majuscule) for display + headings. It's the medieval voice — used sparingly, always with light tracking, never below 16px. **IBM Plex Sans** for everything else — UI, body, table cells. **IBM Plex Mono** for numbers, IP, percentages, item IDs, timestamps. The mono/sans split is critical: numbers always tabular, always mono, so columns align in tables without manual padding.

### Spacing
4px base unit. Standard Tailwind scale (1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24). Card inner padding `16px` standard, `20px` for larger cards. Table cells `8px 12px` (tight — players scan). Sidebar 240px. Max content 1280px. Charts get a 40px gutter for axis labels.

### Backgrounds
Mostly flat dark surface. **No full-bleed images.** **No gradients** as primary surface — only as overlays (e.g. fade-to-bg behind a sticky header for protection). A subtle CSS-only stone/parchment noise can sit behind hero sections (`.bg-stone` utility) but it should be barely perceptible. Imagery in the product is **item icons** (square, 1:1, on neutral subtle bg) and **player avatars** (squarish, never circular — Albion characters are not Twitter profiles).

### Borders & corners
**Sharp.** Cards `4px`, buttons `3px`, badges `2px`, pills `999px` only for region/content-type tags. Borders are 1px and live in three weights: `subtle` (`#2a2a27`) for default dividers, `default` (`#3a3a36`) for emphasized, `strong` (`#4a4a45`) for active/selected. Item-quality borders are colored 1px (white / green / blue / yellow / orange).

### Shadows / elevation
Drop shadows are subtle and cool-black (the bg is warm; shadows pull cool to read as recession). Three weights: `sm` (1px hairline), `md` (12px modal lift), `lg` (32px overlay/sheet). **Inner glows** on gold/crimson elements (1px inset border at 40% opacity) — used for active CTAs and danger states.

### Hover & press
- **Hover:** background lightens by one step (`bg-subtle` → `bg-elevated`). Gold buttons darken to `gold-muted`. Crimson buttons darken to `crimson-muted`. **No scale on hover.**
- **Press:** brightness drops 10% via `filter`. Tactile, not bouncy.
- **Active/selected:** gold inset glow + slightly elevated bg. Active row in a table gets a 2px gold left-border accent **only on the active row** (never as decoration).
- **Focus ring:** 2px gold offset 1px. Visible on keyboard nav, hidden for mouse.

### Animation
Fast and unfussy. **150ms** for hovers and micro-interactions, **250ms** for transitions (filter changes, tab switches). `ease-out` on enter, `ease-in` on exit. **No bounces, no springs, no wobble** — this is a tool, not a game. Kill feed: new kills slide in from top with `translateY(-8px) → 0` + fade. Tier list: weapon icons reveal staggered on page load. Charts: Observable Plot's built-in motion, no CSS layered on top. Skeleton loaders, not spinners. Honor `prefers-reduced-motion`.

### Transparency & blur
Used sparingly. **Sticky headers and freshness banner** get a `backdrop-filter: blur(8px)` over a 90%-opacity bg — content scrolls behind, header reads. **Modals** sit on a 70%-opacity black scrim, no blur (data-tool aesthetic — blurred backdrops feel marketing-y). **No frosted-glass cards.**

### Imagery vibe
**Cool and desaturated.** Item icons come from the Albion render API and are slightly warm — that's fine, they're the only color in many views. Background imagery (used rarely, e.g. landing page hero) is dark, near-grayscale, with crushed blacks and a faint film-grain overlay. Never bright, never saturated. No marketing photography of people.

### Cards
- Background: `bg-surface`
- Border: 1px `border-subtle`
- Radius: 4px
- Padding: 16px (or 20px for large)
- Shadow: none by default; `shadow-md` only for floating overlays
- Hover (if interactive): bg → `bg-elevated`, border → `border-default`

### Layout
- Desktop-first. Sidebar nav 240px, main content fluid up to 1280px max.
- Filter bar pinned above tables, never inside scroll regions.
- Freshness indicator pinned top-right of header — players need to know if data is stale.
- Mobile: sidebar collapses to a top sheet, tables get horizontal scroll, charts shrink with no axis labels (tap to expand).

---

## Iconography

The product uses three distinct icon sources, kept visually separate:

### 1. UI icons → Lucide React
Filter, search, chevron, close, external-link, copy, etc. **16px** in normal UI contexts, **20px** for standalone icon buttons. Stroke 2px, currentColor — they take on `--color-text-secondary` by default and `--color-text-primary` on hover/active.

Lucide is loaded via the npm package in production (`lucide-react`). For static design artifacts in this system, link from the [Lucide CDN](https://unpkg.com/lucide-static@latest) or use inline `<svg>` from the `assets/lucide/` folder.

### 2. Item icons → Albion render API
Live URLs: `https://render.albiononline.com/v1/item/<ITEM_ID>.png` — e.g. `https://render.albiononline.com/v1/item/T8_2H_HOLYSTAFF.png`. We cache thumbnails in `public/items/` server-side. Standard sizes: **20×20** (kill card inline), **32×32** (table row), **40×40** (tier list grid), **64×64** (gear slot expanded).

A wrapper component `<ItemIcon item="T8_2H_HOLYSTAFF" size={32} />` handles loading state (subtle bg pulse) and quality border.

### 3. Brand glyphs → Custom SVG (in `assets/`)
Just the Obliterate wordmark + crossed-axes glyph. No other custom illustration. **Never auto-generate brand SVGs** — copy `assets/logo.svg` and `assets/glyph.svg` as-is.

### Emoji / Unicode
**Not used.** No emoji in the product UI, no `🔥`/`⚔️`/`💀`. Unicode glyphs are used minimally and functionally only:
- `·` (middle dot) as a separator in metadata rows: `1432 IP · 2m ago · West`
- `↑` / `↓` for trend arrows next to win-rate deltas
- `*` (asterisk) for low-sample-size flag
- `~` (tilde) prefix for low-confidence content-type classifications

---

## Component anchor specs

(Full implementation in `ui_kits/web/`. Reference for designers.)

- **Kill card** — single kill event row. ~60px tall. Killer gear → name+guild → IP → content-type badge → vs → victim name+guild → IP → victim gear → fame → time ago.
- **Weapon win-rate row** — table row in builds page. Weapon icon → name → subcat tag → sample size → win-rate bar → win-rate %.
- **Tier list card** — full-height tier label (S/A/B/C/D) + 4×N grid of weapon icons.
- **Matchup matrix cell** — 40×40 cell, color-interpolated bg (loss→neutral→win), 11px mono % inside, hatched diagonal.
- **Gear slot grid** — 3×3 + 4 consumables. Quality-colored 1px border per slot.
- **Region badge** — pill, 10px uppercase mono, color-tinted (West=blue, EU=green, Asia=amber).
- **Content-type badge** — pill, color per type (Solo gray, ZvZ crimson, Hellgate gold, Mists teal, etc.). `~` prefix when confidence < 0.8.
- **Freshness indicator** — green/amber/red dot + region label. Lives top-right of header.
- **Filter bar** — horizontal row of dropdowns above tables. Active filter gets gold underline.

---

## What's missing / open

- **No production app exists yet** — all UI in this system is a first-pass interpretation of the brief, not a recreation. Ground truth lives here until the app ships.
- **Item icon CDN dependency** — the design system links the Albion render API directly. If that goes down or rate-limits, we need a local mirror.
- **No real player names / data** — the UI kit uses placeholder names. When the app ships, swap these for real seed data.
