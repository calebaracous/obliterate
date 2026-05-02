# Obliterate Web — UI Kit

A first-pass interpretation of the Obliterate web app, built directly from the design brief. There's no shipped product to recreate — this kit **is** the reference implementation.

## Structure

- `index.html` — interactive multi-screen demo (kill feed → builds → tier list → player profile). Uses tabs to navigate.
- `Shell.jsx` — sidebar nav, top bar, freshness indicator
- `KillFeed.jsx` — live kill feed page
- `BuildsPage.jsx` — weapon win-rate explorer
- `TierList.jsx` — meta tier list
- `PlayerProfile.jsx` — player page with header stats, recent kills, favorite weapons
- `Components.jsx` — shared primitives: `<Button>`, `<Pill>`, `<ItemIcon>`, `<RegionPill>`, `<TypePill>`, `<WinBar>`, `<KillRow>`, `<FreshnessBar>`

## Conventions

- All colors come from `../../colors_and_type.css` CSS variables.
- Each JSX file ends with `Object.assign(window, {...})` to expose its components globally (Babel scopes per-script).
- Style objects are uniquely named per component (`shellStyles`, `feedStyles`, etc.) — never `styles`.
