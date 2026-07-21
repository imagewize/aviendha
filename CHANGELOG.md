# Changelog

All notable changes to Aviendha are documented in this file.

## [1.5.0] - 2026-07-21

### Changed
- **Header parity (Step 12 of the Aviendha/Aludra redesign).** `parts/header-dark.html`'s
  masthead is now sticky (`position: sticky; top: 0`, `z-index: 50`), and its wordmark
  (`site-title`) renders in the `display` font family at `800` weight with tightened
  letter-spacing (`-0.03em`), matching the redesign mockup's `.masthead`/`.wordmark`
  treatment. `templates/home.html` now uses `header-dark` instead of the light `header`
  part, since the mockup's masthead is always dark with no light variant — other
  templates are unchanged for now. `style.css` also hides the site logo on the dark
  header (text wordmark stands in for it) and mirrors the sticky/wordmark rules for the
  same selectors.

## [1.4.0] - 2026-07-21

### Added
- `xx-small`, `x-small`, `base`, and `display` font-size presets in `theme.json`,
  rounding the scale out to 9 named tiers (`xx-small` → `display`) alongside the
  existing `small`/`medium`/`large`/`x-large`/`xx-large`. Naming matches the
  `xx-small`/`x-small`/`small`/`base`/`medium`/`large`/`x-large`/`xx-large`(/`display`)
  convention already used by Ollie and Elayne, with Aviendha's own size values. Lets
  Aludra blocks reference a named size (`var(--wp--preset--font-size--*)`) instead of
  hardcoding clamp()/rem/px values per block. Part of the Aviendha/Aludra redesign
  typography pass.

### Changed
- `styles.typography.fontSize` (body text default) now references the new `base` tier
  instead of `medium`, matching the role `base` plays in Ollie's and Elayne's scales —
  `medium` is freed up to be a genuinely larger tier rather than doing double duty as
  the body default.

## [1.3.0] - 2026-07-21

### Added
- `display` (Bricolage Grotesque) and `mono` (JetBrains Mono) font family slugs in
  `theme.json`, self-hosted as single variable-font `woff2` files under
  `assets/fonts/` (one file per family covers the full weight range used, avoiding
  a Google Fonts render-blocking origin). `styles.elements.heading.typography.fontFamily`
  now points at `display`; `mono` is available for blocks (Aludra) to reference
  directly for eyebrows/labels/metrics. Part of the Aviendha/Aludra redesign — see
  Aludra's `docs/FONT-CONTRACT.md` for the full font slug contract.

## [1.2.0] - 2026-07-20

### Changed
- **Palette slug naming cleanup** (matches Aludra 2.18.0's contract) — `primary-dark`
  renamed to `primary-alt` (`#7F0F2E` / Twilight `#F43F5E`, values unchanged) to match
  the `<family>-alt` tier naming used by Ollie. `contrast-2` removed from the palette —
  it was a byte-for-byte duplicate of `secondary`; the footer copyright now uses
  `secondary` directly.

## [1.1.0] - 2026-07-20

### Added
- Two accent palette entries: `terracotta` (`#C2410C`) as a second warm accent (used by Aludra
  2.17.0+ for eyebrow/kicker text, with fallback to `primary` on other themes) and `sand-deep`
  (`#D6C7AE`) for deeper sand surfaces. Twilight equivalents: `#FB923C` / `#3D3532`.
- Two gradients alongside Rose Bloom: `Sunset` (`#C2410C → #9F1239`) and `Sand`
  (`#FAF7F2 → #F0E9DD`, for subtle section fades). Twilight defines dark equivalents of all
  three gradients (previously it inherited the light Rose Bloom).

### Changed
- Link hover colour switched from `main` (dark maroon) to `accent` (olive) — activates the
  green that was defined but unused, per the Aiel palette direction.

## [1.0.0] - 2026-07-20

First stable release.

### Added
- Five palette slugs that Aludra block styles and patterns reference but the theme never defined
  (`secondary`, `main-accent`, `primary-accent`, `primary-dark`, `white`), mapped to warm values
  (`#57534E`, `#78716C`, `#FDE8EC`, `#7F0F2E`, `#FFFFFF`). Without them, Aludra blocks fell back to
  cool grays and blues from an older palette (gray-blue lead text, blue hover states, transparent
  card backgrounds). `styles/twilight.json` defines dark-appropriate equivalents for the same slugs.
- `parts/header-dark.html` — "Header (Dark)" template part: same layout as the default header but on
  the `main` surface with `base` text and a faint translucent hairline, so pages that open with a
  dark hero (e.g. Aludra's hero-split "Night" style) no longer show a cream band and a hard
  border-light line above the dark section.
- `templates/page-dark-header.html` — "Page (Dark Header)" custom template using the dark header
  part, selectable per-page for dark-hero landing pages.
- `customTemplates` registration in `theme.json` for `page-with-title` and `page-dark-header`.

## [0.4.0] - 2026-07-19

### Added
- `templates/page-with-title.html` — a custom template (selectable per-page under Page → Template)
  identical to `page.html` but with `post-title` printed above the featured image, for standard
  content pages that want the conventional title treatment.

### Changed
- `templates/page.html` (default) no longer prints `post-title`. Most Aviendha pages are composed
  directly from blocks (or Aludra blocks) whose own heading already serves as the page's title, so
  auto-printing `post-title` above that duplicated it.

## [0.3.0] - 2026-07-19

### Changed
- `templates/page.html` and `templates/single.html` no longer wrap `main` in `alignwide`. Content
  width and horizontal padding are now driven by the global `styles.spacing.padding` rule in
  `theme.json` (using the `content-padding` custom spacing value) applied via `post-content`'s
  `align: full`, so page and single templates get consistent edge-to-edge padding instead of a
  fixed wide alignment.
- Logo mark (`assets/logos/aviendha-rose-primary.svg`, `assets/logos/aviendha-rose-outline.svg`)
  now uses the Ionicons "rose" icon (via Blade Icons), replacing the previous Lucide rose icon.

## [0.2.0] - 2026-07-13

### Fixed
- `parts/header.html` no longer hardcodes `aludra/search-overlay-trigger`. The header now uses only
  core/WooCommerce blocks, matching the documented "Aludra recommended, not required" position.

## [0.1.0] - 2026-07-11

### Added
- Initial scaffold: `theme.json` design system, WooCommerce block templates (single product, product archive), `twilight` style variation.
- Rose logo mark (`assets/logos/`).
- No theme-level patterns — content is composed directly from `aludra/*` blocks.
