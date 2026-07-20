# Changelog

All notable changes to Aviendha are documented in this file.

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
