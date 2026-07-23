# Changelog

All notable changes to Aviendha are documented in this file.

## [1.6.0] - 2026-07-23

### Added
- **Release packaging.** `.github/workflows/create-release.yml` attaches a theme zip to every
  published GitHub release, built with `zip -x@.distignore` — the same mechanism the Aludra
  plugin uses. A new `.distignore` keeps dev-only files (Composer/npm metadata, `vendor/`,
  `phpcs.xml`, contributor docs, tooling) out of that zip, and `.gitattributes` mirrors it with
  `export-ignore` so source archives match. Verified: the zip is 35 files — templates, parts,
  styles, assets, `theme.json`, `functions.php`, `style.css`, `readme.txt`, languages, licence,
  changelog.
- **CI checks**, matching Elayne's: `wpcs.yml` runs PHPCS against the WordPress standard on every
  pull request, and `theme-check.yml` runs the WordPress theme review action (including the
  stricter accessibility suite) on pull requests and pushes to `main`.
- **`bin/sync-demo.sh`** — pushes this working copy into the demo Bedrock site
  (`~/code/imagewize.com/demo/web/app/themes/aviendha`) so unreleased theme changes can be
  tested there without cutting a release. Rsyncs a dist-faithful tree (`--delete
  --delete-excluded`, mirroring `.distignore`), so what you test is what ships; a `composer
  update` on the demo site restores the released version. The Aludra plugin has its own copy of
  the script.

### Fixed
- `package.json` declared version `1.5.2` while the theme was on `1.5.4`. It now tracks the
  theme version, though `style.css`, `readme.txt`, and `CHANGELOG.md` remain the three files
  that matter.

## [1.5.4] - 2026-07-23

### Changed
- **Footer navigation displays as a list on mobile.** The footer navigation block now
  sets `overlayMenu: "never"`, so core renders a plain list at every width and emits no
  hamburger toggle or responsive overlay markup at all. CSS only handles stacking: the
  shell and the nav links switch to a column layout under 600px.

## [1.5.3] - 2026-07-23

### Fixed
- **The dark header's mobile menu was white text on a white overlay.** The navigation block
  sets no background of its own, so core's
  `.wp-block-navigation:not(.has-background) …is-menu-open` rule paints the overlay `#fff`,
  while the block's `textColor: "base"` keeps the links — and the close button — white.
  `style.css` now overrides the color inside the open overlay (with `!important`, since the
  markup carries `has-base-color` and core emits that with `!important`).

  The override is scoped to `.is-menu-open`. With `overlayMenu: "mobile"` the responsive
  container gets no `hidden-by-default` class, so above 600px core reuses that same element to
  render the *inline desktop* nav — an unscoped rule would darken the desktop links against the
  dark masthead, and would win over core's own `color: inherit !important` on the strength of
  the `.aviendha-header--dark` prefix.

### Changed
- `style.css` is now organized into numbered sections (template parts → header → footer), with
  a table of contents and a note on what belongs in this file versus `theme.json`. No rule
  changes beyond the scoping fix above.

## [1.5.2] - 2026-07-23

### Added
- **Footer parity (Step 14 of the Aviendha/Aludra redesign).** `parts/footer.html` now matches
  the redesign mockup: uses `.foot` class with constrained layout (not `alignfull`), tertiary
  background, 2.5rem padding, and a `.shell` inner group with flex layout, gap, and
  space-between alignment. Branding text updated to "Aviendha — WordPress & WooCommerce",
  copyright includes year. Navigation uses `foot-nav` class and flex layout. `style.css` adds
  corresponding `.foot`, `.foot .shell`, `.foot .wp-block-navigation-*`, and `.foot a` rules
  for proper styling and hover states.

### Fixed
- **The footer's constrained layout was never applied.** Same class of bug as the 1.5.1 header
  fix: the outer group's `layout` attribute sat outside the parsed JSON object (a stray `}`
  after `backgroundColor`), so WordPress silently dropped it and rendered `is-layout-flow`
  instead of `is-layout-constrained`. The inner `.shell` group also lacked `align:"wide"`, so
  nothing clamped its width — the branding text and copyright sat flush against the viewport
  edges instead of the mockup's centered column.
- **A visible gap sat between the last section and the footer.** Core's
  `:where(.wp-site-blocks) > *` global style adds a 24px `margin-block-start` to every
  top-level block, including the `wp-block-template-part` wrapper WordPress injects around
  header/footer — not to the `.foot`/`.aviendha-header--dark` block inside it, so a margin
  reset on those blocks directly had no effect on the wrapper. Reset generally for all
  template parts via `.wp-site-blocks > .wp-block-template-part`.
- **The header CTA's text was invisible on hover.** The button's saved markup carries
  `has-base-color`, and WordPress core emits `.has-base-color` with `!important`, so the
  hover rule's `color` override never won — white text sat on the hover state's white
  background. Added `!important` to the hover rule.

## [1.5.1] - 2026-07-21

### Fixed
- **The 1.5.0 header CSS was never live.** `style.css`'s theme header comment was
  missing its closing `*/`, so every rule the 1.5.0 release added — sticky
  positioning, the `display`-font wordmark, the hidden logo — sat inside that
  comment and was discarded by the parser. The comment is now terminated
  properly.
- **The dark header didn't sit in the content shell.** `parts/header-dark.html`
  nested `backgroundColor`, `textColor` and `layout` *inside* the `style` object
  rather than beside it, so WordPress never read the constrained layout
  attribute. The part rendered `is-layout-flow` and its `alignwide` inner group
  got no max-width, stretching the wordmark and navigation to the viewport edges
  instead of the centered shell the redesign mockup uses. (The colors still
  applied only because the `has-*` classes are baked into the saved markup.)
- **Sticky positioning never engaged.** WordPress wraps a header-area template
  part in its own `<header class="wp-block-template-part">` whether or not
  `tagName` is set on the `wp:template-part` invocation, and that wrapper is
  exactly as tall as the header — leaving a `position: sticky` child no scroll
  range to move within. The wrapper now carries the sticky rule as well, via
  `.wp-block-template-part:has(> .aviendha-header--dark)`.

### Added
- A "Start a project" CTA button in `parts/header-dark.html`, styled with the
  `mono` font family as a pill (`.aviendha-header__cta`). Without it the
  `space-between` row had only two real items, pushing the navigation hard
  against the right edge instead of reading as centered like the mockup.

### Changed
- Dropped `tagName: "header"` from every `wp:template-part` invocation of
  `header`/`header-dark` across the templates; the part already emits its own
  `<header>`, so the attribute produced a redundant second landmark.

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
