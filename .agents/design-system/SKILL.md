---
name: obliterate-design
description: Use this skill to generate well-branded interfaces and assets for Obliterate, an Albion Online PvP meta aggregator (kill feeds, build win rates, tier lists, matchup matrices). Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- **Brand:** Obliterate — dark, data-forward Albion Online PvP analytics. Think Warcraft Logs filtered through medieval HUD. Not cartoonish, not corporate SaaS.
- **Tokens:** `colors_and_type.css` — every color, type scale, spacing, radius, shadow, motion variable.
- **Voice:** Sharp, terse, numeric. Sentence case. UPPERCASE for tags. No emoji. See README "Content fundamentals".
- **Iconography:** Lucide for UI · Albion render API for items (`https://render.albiononline.com/v1/item/<ID>.png`) · custom SVG only for the wordmark/glyph in `assets/`.
- **UI kit:** `ui_kits/web/` — `<Sidebar>`, `<TopBar>`, `<KillFeed>`, `<BuildsPage>`, `<TierList>`, `<MatchupMatrix>`, `<PlayerProfile>`, plus primitives `<Button>`, `<Pill>`, `<ItemIcon>`, `<WinBar>`, `<FreshnessBar>` in `Components.jsx`.

## Common dos / don'ts

- ✅ Cinzel for display + headings, IBM Plex Sans for UI body, IBM Plex Mono for all numbers.
- ✅ Sharp corners (4px cards, 3px buttons, 2px badges). Pills only for region/content tags.
- ✅ Gold (#c9922a) is the only accent for CTAs and active states. Crimson is reserved for death/danger.
- ✅ Tabular mono numbers, always — `54.3%`, `1432 IP`, `2m`.
- ❌ No purple gradients, no emoji, no rounded-everywhere SaaS look, no marketing fluff copy.
- ❌ No bouncy animations. 150ms ease-out on hover, 250ms on transitions, that's it.
