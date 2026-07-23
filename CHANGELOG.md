# Changelog

All notable changes to Aviendha are documented in this file.

## [1.8.0] - 2026-07-23

### Added
- **WooCommerce block styling in `theme.json`.** `styles.blocks` covered exactly one core block and
  no store block, so prices, buttons, sale badges, the mini cart, filters, ratings and summaries all
  rendered in WooCommerce's stock colours regardless of which style variation was active. Eight
  entries now cover them: prices take the display font at 600, buttons and the sale badge take
  `primary` on `base` with the pill radius (matching `elements.button`), stars take `terracotta`,
  summaries take `secondary`.

  `styles/twilight.json` needed no changes — every value is a `var(--wp--preset--*)` reference and
  the variation overrides the palette under the same slugs, so it picks all of this up for free.
- **`assets/css/woocommerce.css` is no longer an empty stub.** It holds what `theme.json` cannot
  express, each section carrying the reason: the mini cart drawer panel (a component wrapper outside
  the block, with a hardcoded white background), the classic product gallery, `del`/`ins` inside a
  sale price, the quantity stepper and the specifications table (blocks that declare no colour or
  typography supports at all), and the review form (core comment-form markup, not blocks).
- **`.aviendha-eyebrow` utility** in `style.css` — a mono, letter-spaced label introduced by a short
  rule. It can't come from `theme.json`: the rule is a pseudo-element, and the class has to be
  available to any block rather than to one block type.
- **A hover state on `elements.button`**, using `primary-alt`.
- `designs/aviendha-redesign.html` — the visual reference this pass works from. Excluded from the
  theme zip and from source archives.

### Changed
- **The single product page no longer uses `woocommerce/product-details`.** That block renders
  WooCommerce's classic tab strip: PHP markup with jQuery behind it, declaring no colour or
  typography supports, so nothing in the design system could reach it. Description, specifications
  and reviews are now three stacked sections built from the standalone `woocommerce/product-description`,
  `woocommerce/product-specifications` and `woocommerce/product-reviews` blocks, each marked by an
  eyebrow label and separated by a hairline rule.

  `woocommerce/accordion-group` was the other candidate and was rejected — hiding a product
  description behind a click costs more than the vertical space it saves.
- **Related products are now a `woocommerce/product-collection`** using the
  `woocommerce/product-collection/related` collection, matching the card treatment on the archive.

### Fixed
- **Two blocks on the single product template rendered nothing at all.**
  `woocommerce/product-meta` and `woocommerce/related-products` are containers, and both were
  shipped self-closing: the first produced no SKU or tags, and the second had nothing to expand into
  once WooCommerce's bundled patterns were unregistered in 1.7.0. Meta now wraps
  `woocommerce/product-sku` and a tag list; related products is the collection described above.
- **The mini cart drawer stayed white under a dark style variation**, so its contents rendered light
  text on a white panel.
- **The sale flash on a product page was WooCommerce's green circle**, unrelated to the rose pill
  badge the archive cards use.
- **Sale prices gave the old and new price the same weight and colour**, leaving the struck-through
  price competing with the one the customer pays.
- **The add-to-cart button had no hover state.** WordPress prints element styles before block styles
  at the same specificity, so the `woocommerce/product-button` entry overrode the `elements.button`
  hover that came before it; the hover is restated in `woocommerce.css`, which lands after both.

## [1.7.0] - 2026-07-23

### Added
- **Product filtering and sorting on the archive.** `templates/archive-product.html` was a bare
  product grid — customers could not sort a category at all. It now carries a results bar
  (`woocommerce/product-results-count` + `woocommerce/catalog-sorting`) and a 25% filters sidebar
  built from `woocommerce/product-filters`: active-filter chips with a clear button, a price
  slider, category, availability, and rating. Also added breadcrumbs, `core/term-description`, and
  a `woocommerce/product-collection-no-results` empty state — a filtered archive that matched
  nothing previously rendered nothing at all.

  `woocommerce/product-filter-attribute` is deliberately not shipped: its `attributeId` defaults to
  `0`, so a bundled instance renders as an unconfigured prompt on every store, and which attribute
  matters is per-store by definition. Add it per site in the Site Editor.
- **Per-product-type add-to-cart layouts.** `parts/simple-product-add-to-cart-with-options.html`
  and `parts/variable-product-add-to-cart-with-options.html` override WooCommerce's own parts in
  the `add-to-cart-with-options` template part area (registered in `theme.json`), giving the
  quantity stepper and variation chips theme spacing presets instead of the plugin's hardcoded
  `1rem` margins. External and grouped products keep WooCommerce's defaults.
- **`woocommerce/product-summary` and `woocommerce/product-stock-indicator`** on the single product
  template. The full description was reachable only through the `product-details` tabs, and stock
  state was not shown anywhere.
- `docs/woocommerce-roadmap.md` — gap analysis and the reasoning behind each of these choices,
  plus what remains (store block styling in `theme.json`, additional templates). Not shipped in
  the theme zip.

### Changed
- **`woocommerce/add-to-cart-form` replaced with `woocommerce/add-to-cart-with-options`** on
  `templates/single-product.html`. The former is the legacy PHP-rendered form, which can only be
  restyled by overriding WooCommerce's markup; the latter is composed of blocks the design system
  can reach.
- **WooCommerce's bundled block patterns are unregistered.** `functions.php` already called
  `remove_theme_support( 'core-block-patterns' )` to keep the inserter clean, but WooCommerce
  registered its own `woocommerce-blocks/*` set on top — patterns this theme never designed and
  does not style. The `woocommerce/coming-soon*` patterns are left alone, since the plugin's own
  templates render them. `pattern-toolkit-full-composability` is also removed from
  `woocommerce_admin_features`, which stops the pattern-assembler onboarding flow from offering to
  overwrite the theme's templates.
- Product Collection now uses the current `displayLayout` shape
  (`{"type":"flex","columns":3,"shrinkColumns":true}` plus `dimensions`) instead of the older grid
  attributes. `shrinkColumns` is what collapses columns sensibly on narrow viewports.

### Fixed
- **The store templates were registered on sites without WooCommerce.** `single-product` and
  `archive-product` appeared in the Site Editor's template list on a site that cannot render them,
  and `parts/header.html`'s hardcoded mini cart showed an unsupported-block placeholder in the
  editor. `functions.php` now branches on `class_exists( 'WooCommerce' )`: when the plugin is
  absent, the store templates and add-to-cart parts are filtered out of `get_block_templates`, and
  `woocommerce/mini-cart` and `woocommerce/customer-account` are stripped from template part
  content (`get_block_file_template` is filtered too, since the front end resolves parts through
  it). The `add-to-cart-with-options` template part area is registered by the theme in that branch
  only — the plugin registers it otherwise, and an unknown area on a `theme.json` template part
  triggers a `_doing_it_wrong` notice.
- **Two sale badges rendered on every discounted product card.** `woocommerce/product-image`
  renders its own badge (`showSaleBadge` defaults to `true`), so the nested
  `woocommerce/product-sale-badge` block produced a second one — one left-aligned, one right. The
  image block's own badge is now disabled and the explicit block kept, which is what carries the
  font size and stays visible in the editor's list view.
- **The archive's heading sat indented from its own product grid.** In a `constrained` main group,
  `alignwide` columns are wider than an unaligned heading above them. `query-title`,
  `term-description` and the results bar now set `align: "wide"` explicitly.

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
  stricter accessibility suite) on pull requests and pushes to `main`. The review action copies
  the repo root, so anything tracked here is reviewed — which is exactly how the missing
  screenshot and a stray shell script were both caught.

### Changed
- **Demo-site syncing moved to [wp-ops](https://github.com/imagewize/wp-ops)**
  (`scripts/rsync-package-to-site.sh`) instead of a `bin/sync-demo.sh` committed here. It does the
  same thing — rsyncs a dist-faithful tree (`--delete --delete-excluded`, honouring `.distignore`)
  into the demo Bedrock site, so what you test is what ships — but it takes the package kind and
  slug as arguments and reads the destination from `SITE_ROOT`, so one script serves the theme,
  the Aludra plugin, Elayne and Nynaeve. The paths in the old copy were personal configuration
  rather than theme code, and Theme Check's `File_Check` rejects a theme that ships a `.sh` file
  at all, so keeping it here would have meant working around CI to hide it. It is gitignored now
  if you want a local shortcut.

### Fixed
- **`screenshot.png` was missing.** WordPress requires every theme to ship one, and the new
  `theme-check.yml` workflow was the first thing to say so — it failed at the structure check
  before running a single review test. Added at the required 1200×900 (4:3), showing the
  masthead, the hero with its load waterfall, the stat rail, and one full spine section.
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
