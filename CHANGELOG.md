# Changelog

All notable changes to Aviendha are documented in this file.

## [1.17.0] - 2026-08-25

WordPress.org theme directory preparation. See `docs/WPORG-DISTRIBUTION-PLAN.md` in the
imagewize.com repo for the wider plan this belongs to.

### Changed
- **`remove_theme_support( 'core-block-patterns' )` dropped.** The line made sense while the theme was distributed to sites that always ran Aludra: content came from `aludra/*` blocks, and core's patterns were noise. It does not survive the directory. Aviendha ships no patterns of its own, so a user who installs it from wordpress.org *without* Aludra opened a completely empty pattern inserter — the one place the theme actively took something away and gave nothing back. Core's patterns now stay registered. A fork that wants the old behaviour gets it back with the same single line in its own `functions.php`.
- **License back to GPL — "v3 or later", matching Aludra, Elayne and Ixian.** 1.16.0 moved the theme to MIT alongside the "fork it like Sage" positioning. MIT is GPL-compatible and Theme Check passes either way, so this was never a submission blocker — but the [theme review handbook](https://make.wordpress.org/themes/handbook/review/required/) requires a GPL-compatible license and MIT left Aviendha the odd one out of its own family for no gain. v3 rather than the handbook's recommended v2-or-later is a deliberate consistency choice: every other Imagewize package is GPLv3, and Ixian — the theme forked directly from this one — already is. `LICENSE.md` is now the same GPLv3 text those three ship, byte for byte; `style.css`, `readme.txt`, `README.md`, `package.json`, `composer.json`, `CLAUDE.md` and `AGENTS.md` updated to match. The bundled Ionicons rose stays MIT and both fonts stay OFL 1.1 — third-party licenses are unaffected.
- `Tested up to` 7.0 → 7.1 in `style.css` and `readme.txt`. `Requires at least` stays 6.6; nothing in this release needs newer.

### Note
WooCommerce's `woocommerce-blocks/*` patterns are still unregistered when WooCommerce is active. That is unchanged and deliberate — the theme neither designed nor styles them — but its comment previously justified it by pointing at the core removal above, which no longer exists. The reasoning is now stated on its own terms.

## [1.16.1] - 2026-08-21

### Added
- `@imwz/wp-pattern-sentinel` as a `package.json` dependency, with `setup`/`validate`/`validate:file`/`validate:new`/`validate:clear-cache` scripts. Aviendha ships no patterns itself, but forks (e.g. Ixian) that add a `patterns/` directory now inherit a working browser-based pattern validator instead of wiring it up from scratch. Documented under a new "Pattern validation" section in `CLAUDE.md`.

## [1.16.0] - 2026-08-19

### Changed
- Positioned Aviendha as a Full Site Editing (FSE) starter theme for WordPress, designed to be forked and customized — similar to Sage in classic theming. Updated README.md, readme.txt, and package.json to reflect the new positioning.
- Changed license from GPL v3 to MIT License. Updated LICENSE.md, README.md, readme.txt, package.json, and style.css accordingly.
- Updated references to Ixian theme as an example of a theme forked from Aviendha.

## [1.15.0] - 2026-07-27

Three WCAG 2.1 AA failures found by auditing the theme against the European Accessibility Act, which
points at EN 301 549 and so at WCAG 2.1 AA for anything on the web. All three are contrast or focus
issues in CSS — nothing structural changed, and no markup moved.

### Added
- **A `control-border` custom colour, at 3:1 against the page.** WCAG 1.4.11 asks for 3:1 between a
  control's boundary and its background; `border-light` is **1.25:1** on `base`, so every form
  control the theme styled had a boundary nobody could see. The filter checkbox was the sharp case —
  `woocommerce.css` removes WooCommerce's `currentColor` wash from the unchecked box and lets the
  border do the work, which made that invisible hairline the entire unchecked state. The new token is
  `#8C8378` (3.49:1 on `base`, 3.09:1 on `tertiary`), and `#7A6F68` under `twilight` (3.45:1 /
  3.12:1). It lives in `settings.custom.color` rather than the palette because it is a system token,
  not a colour anyone should be picking in the editor.

  `border-light` is unchanged and still correct for decorative rules, card edges, and group
  separators — 1.4.11 doesn't reach those, and Aludra's patterns reference the slug.

### Changed
- **`main-accent` `#78716C` → `#6F6862`.** It was **4.49:1** on `base` against a 4.5:1 requirement,
  missing 1.4.3 by a hair — on comment form labels, placeholder text, post meta, the author byline,
  sidebar widget titles, comment dates, eyebrow labels, and the struck-through old price on sale
  items. Now 5.13:1 on `base` and 4.54:1 on `tertiary`. `tertiary` is the tighter of the two grounds,
  so check any future adjustment against it rather than against `base`. Twilight's `#A8A29E` was
  already 6.68:1 and is untouched.
- **Real focus rings on the comment form fields and the catalog sorting select.** Both removed the
  outline and swapped a 1px border colour in its place. That is technically a visible indicator, but
  it repaints the same pixel the resting state already draws, and with the border at 1.25:1 the change
  was close to imperceptible. Both now use `outline: 2px solid` `primary` at a 2px offset, matching
  the quantity stepper — which had the only correct focus treatment in the theme. The comment form
  moved from `:focus` to `:focus-visible` at the same time, so clicking a field no longer rings it.

## [1.14.0] - 2026-07-25

### Added
- **Product cards are contained.** Across the shop archive, search results, and the single-product
  "related products" grid, `woocommerce/product-template` items now sit in a bordered, rounded card
  (`base` background, `border-light` hairline, `lg` radius, `overflow: hidden`) whose border darkens
  to `sand-deep` on hover — no background tint, transform, or shadow, so nothing moves or reflows as
  the pointer crosses a dense grid of cards. `woocommerce/product-image` no longer carries its own
  corner radius in any of the three templates that use it — the card's `overflow: hidden` does the
  rounding instead, so the image doesn't double up a smaller radius inside the card's larger one.
- **Sidebar filter headings read as eyebrows.** Price, Category, Availability, and Rating now carry
  `aviendha-eyebrow` — the same mono, uppercase, dash-prefixed label already used for "Description",
  "Specifications", "Reviews", and "More like this" on the single-product page — rather than a plain
  bold heading, so the filter sidebar speaks the same label language as the rest of the product page.
- **A hairline separates each filter group.** `product-filter-price`, `-taxonomy`, `-status`, and
  `-rating` previously ran together as one stack under `blockGap`; each now gets a `border-bottom`
  except the last, so the sidebar reads as sectioned filters rather than a single undivided list. The
  rule anchors on `:last-child` rather than `:first-child` because the active-filter-chips group
  collapses to `display: none` when empty instead of leaving the DOM — a hidden sibling still counts
  for `:not(:last-child)` but renders no box, so no rule floats above the first visible group.
- **The catalog sort dropdown is themed.** `woocommerce/catalog-sorting` renders a bare `<select>`
  with no colour, border, or typography supports — previously the one native, unstyled control next to
  an otherwise-designed toolbar. It now gets the theme's pill radius, `border-light` border, and an
  inlined chevron in place of the browser's native arrow (`appearance: none`; no build step to source a
  separate asset from).

### Changed
- **The results count matches the breadcrumb's tone.** `woocommerce/product-results-count` now carries
  `textColor: secondary`, so "Showing 1–16 of 17 results" reads as muted supporting text rather than at
  full `contrast` weight, consistent with the breadcrumb directly above it.

## [1.13.0] - 2026-07-25

### Changed
- **`layout.wideSize` 1200px → 1360px.** The shop archive is the template that pays for a narrow
  wide width: it spends 25% of the row on the filter sidebar before the product grid gets any, so at
  1200px the three cards came out 267px each and the grid read as cramped on a large display. 1360px
  puts them at 320px. It is a theme-wide change by design rather than a shop-only override — the
  header and footer align to the same wide width, and widening only `archive-product.html` would have
  left the grid hanging past the masthead. 1360px plus the `content-padding` clamp still fits a 14"
  laptop's 1512px viewport with margin to spare, which is the narrowest screen this must not overflow.

### Added
- **`assets/css/woocommerce.css` section 10 — the product grid.** `woocommerce/product-template`
  builds its own grid and hardcodes `grid-gap: 1.25em` (20px), a value on no part of the spacing
  scale, and the block declares only `interactivity` plus a layout support with `allowEditing: false`
  — so neither theme.json nor the template markup can reach it. The gap is now `large` on rows and
  `medium` on columns; rows get the wider one because a row break has to separate an "Add to cart"
  button from the image below it, and at 20px the rows ran together into one dense block.

  **The `columns-3` track formula has to be overridden in the same breath.** WooCommerce sizes each
  track as `minmax(max(150px, calc(33.3333% - .83333em)), 1fr)` — the subtraction assumes the 20px
  gap it also hardcoded. Changing the gap without changing the formula makes each track wider than a
  third of the row and `auto-fill` silently drops the grid to two columns. `columns-3` is the only
  variant the theme's templates use.

  Cards are flex columns now with the button pinned to the bottom, so a wrapped two-line title on one
  card no longer leaves its neighbours' buttons floating at different heights.
- **`indigo` (`#1E3A5F`) in the palette.** The WooCommerce sample catalogue ships a **Blue**
  `pa_color` term and the palette had no blue to map it onto, so the demo's blue hoodie and blue
  v-neck had nothing in-system to be drawn in. Added as a product colour alongside `terracotta` and
  `sand-deep` rather than invented in the artwork, which keeps the featured-image set's rule — every
  colour is a theme.json preset — true.

## [1.12.0] - 2026-07-24

### Changed
- **`templates/single.html` is a designed reading surface, not a raw stack.** The blog single was
  the least-designed template in the theme — `post-title → featured-image → post-content → post-terms
  → comments`, with no meta, no author box, no related posts, no sidebar. It is now built as: a
  `tertiary` **title band** (category eyebrow, `h1`, `post-excerpt` lede, and a mono **meta line** of
  avatar · author · date) matching the `page-with-title` band so posts and titled pages share a
  language; the featured image; a **two-column article grid** with the prose on the left and a
  **sticky sidebar** on the right (Recent, Topics, and a dark CTA); a **post tail** with a mono tag
  list and an inline **author card**; a **Related posts** band; and **restyled comments** built from
  the comment blocks with avatars, mono timestamps, and hairline separators.

  **Behaviour change worth noting:** `post-content` now sits inside a column, so `alignwide` /
  `alignfull` blocks in a post fill the *reading column* rather than the viewport. This is wanted for
  a text-first blog (no full-bleed images breaking the column) but is a real change from the previous
  full-width single — a post that relied on a full-bleed image will render it column-width. A separate
  `single-wide.html` is the escape hatch if one is ever needed, rather than withholding the sidebar
  from the default.

  **Related posts are latest-by-date, not related-by-taxonomy.** A `core/query` set to the three
  latest posts is a core-only stand-in; true relevance would need an Aludra block or a plugin and is
  not worth it for this pass. With few posts the grid shows empty trailing slots — expected, and it
  fills as posts accumulate.

### Added
- **`style.css` sections 5–6 — content rhythm and the single-post design.** Section 5 pairs a heading
  tightly with the block it introduces (`:is(h2…h6) + *`), the other half of the global `blockGap` /
  `h2` margin theme.json sets. Section 6, scoped entirely to core's `.single` body class so none of it
  leaks onto pages or archives, covers the mono meta line, the two-column grid and its sticky sidebar
  (a fixed 300px column beside a growing content column, collapsing to one column under 980px and
  dropping sticky there), the prose flourishes theme.json cannot express (a display pull-quote,
  `primary` list markers, a drop cap only when the post opens with a paragraph), the tag pills and
  author card, the sidebar widgets and dark CTA, the related-posts cards, and the comment thread and
  form.
- **A reading-progress hairline under the masthead**, filling as the post scrolls. Driven by
  `animation-timeline: scroll()` rather than a scroll listener — the same no-JavaScript technique the
  light header's scroll edge uses — so where `scroll()` is unsupported the bar simply never appears,
  which is the resting state either way. Scoped to `.single`, so it is a reading affordance for posts
  only.

## [1.11.0] - 2026-07-24

### Added
- **`order-confirmation.html`** — theme-provided order-confirmation template wrapping WooCommerce's order-confirmation blocks with the theme's header and footer. It is the highest-trust page in the funnel and previously rendered unbranded through WooCommerce's default. The body mirrors the plugin's own default structure verbatim — `order-confirmation-status`, `-summary`, the `totals-wrapper` and `downloads-wrapper`, the shipping/billing address columns, `additional-fields-wrapper` and `-additional-information`, each heading supplied by WooCommerce's own `woocommerce/order-confirmation-*-heading` patterns (left registered, since only the `woocommerce-blocks/*` prefix is unregistered) — so it stays valid across Woo releases rather than inventing block markup the plugin doesn't ship.
- **`woocommerce/customer-account` in both headers.** The light and dark header carried only the mini cart; they now open the icon group with an account icon as well, stripped alongside the mini cart on sites without WooCommerce. It's set icon-only so it sits with the cart rather than reading as a stray text link, and `style.css` makes it inherit the header's own text colour — the block renders as a link and would otherwise pick up the global rose link colour, which is too low-contrast on the dark header's `main` background.

  A header search was considered and left out of the shipped theme. An always-visible inline `woocommerce/product-search` crowds the masthead and wraps the navigation, and an icon-triggered search *overlay* is an Aludra block (`aludra/search-overlay-trigger`) — putting it in a theme file would reintroduce the hardcoded Aludra dependency 0.2.0 removed, against the "Aludra recommended, not required" position. Search belongs in the header via the Site Editor (the Aludra overlay on stores that run it, a `core/search` block otherwise) — DB-stored, matching how the mega menu already works — rather than shipped as theme markup.

### Fixed
- **The header account icon rendered invisibly.** WooCommerce sizes the customer-account icon with a rule targeting `.wc-block-customer-account__account-icon`, but the block renders the SVG with `class="icon"` (its `iconClass` default), so the two never match and the icon collapses to zero in every display mode. `style.css` sizes the SVG directly — which is what makes the icon-only account link usable at all.
- **`order-confirmation` is filtered out of the Site Editor on sites without WooCommerce**, added to the theme's Woo template slugs alongside the existing store templates so it doesn't appear where it can't render.

## [1.10.0] - 2026-07-24

### Added
- **`product-search-results.html`** — theme-provided search results template matching the product archive's layout: breadcrumbs, search query title, results bar with count and sorting, product grid with the same card styling, pagination, and a branded no-results state. Without this, product search results fall back to WooCommerce's generic template and don't match the archive customers just came from.
- **`coming-soon.html`** — theme-provided coming-soon template wrapping WooCommerce's coming-soon block with the theme's header and footer, and a centred launch message inside it. This is the first page a new store shows when launch mode is active; branding it provides a consistent experience with the rest of the site. The `woocommerce/coming-soon` block only renders its inner blocks — it does not load a design from `comingSoonPatternId` — so the template supplies the message directly.

### Fixed
- **The footer no longer floats mid-viewport on the coming-soon template.** The short-page fix grows `.wp-site-blocks > main`, but the `woocommerce/coming-soon` block wraps `main` in its own `.wp-block-woocommerce-coming-soon` div, making that wrapper — not `main` — the flex child of `.wp-site-blocks`. Growing the wrapper (transparent, so the stretch is invisible base-on-base) sends the footer back to the bottom.

## [1.9.0] - 2026-07-24

### Added
- **`page-with-title` opens with a tinted title band.** The template previously printed a bare
  `post-title` with no spacing above it, so the title sat flush under the masthead. It now leads
  with a full-width `tertiary` group holding the `h1`, which both supplies that spacing and gives
  the light header a tonal change to sit against.

  Title only — no breadcrumb, no lede. Core ships no breadcrumb block, and `post-excerpt` falls
  back to an auto-trimmed content snippet when a page has no excerpt set: on a prose page the band
  would have repeated the page's own opening paragraph directly above it, and on a block-built page
  it rendered nothing at all.
- **The light header carries the same "Start a project" CTA as the dark one**, in the filled
  `primary` style straight from `elements.button` rather than the dark header's outline treatment.
- **A wipe-in underline marks the current page in the navigation**, held open on
  `[aria-current="page"]`. Drawn in `currentColor` so one rule serves both headers — `primary`
  against the dark header's `main` background is too low-contrast to read as a marker — and
  suppressed in the mobile overlay, where a full-width rule reads as a divider.
- **A global block rhythm in `theme.json`:** a root `blockGap` of `medium` and an `h2` top margin of
  `large`, so vertical spacing comes from the design system rather than per-block padding that rots
  the first time a client edits a page. `settings.spacing.blockGap` has to be enabled alongside it
  or core emits no gap styles at all.

### Changed
- **The light header no longer draws a resting hairline.** It sat on `base` with `base` beneath it,
  so a `border-light` rule had no tonal change to describe and read as a scratch across the page
  rather than a boundary. The edge now appears only once the page scrolls, when the sticky masthead
  genuinely is above something — done with a scroll-driven animation rather than a scroll listener,
  so the theme still ships no JavaScript. Where `animation-timeline: scroll()` is unsupported the
  header simply stays flush, which is the resting state either way.
- **The light header is sticky, and wears the display-font wordmark.** Both behaviours existed but
  were scoped to `.aviendha-header--dark`, which made the light variant a header with features
  missing rather than a colour alternative. The tonal-neutral rules are now shared.
- **The navigation stays behind the hamburger until 1024px**, up from core's hardcoded 600px.
  Between those widths the inline menu competed with the wordmark, the cart and account icons and
  the CTA, and the row wrapped — a 105px-tall masthead on a tablet. 1024px rather than a rounder
  960px because the masthead's own contents decide it: they measure 973px, so at 960px it still
  wrapped. A longer menu would want this raised again.

### Fixed
- **The footer no longer floats mid-viewport on short pages.** `.wp-site-blocks` is a `100vh` flex
  column and `main` takes up the slack. `main` is transparent, so on a prose page the stretch is
  indistinguishable from the content area around it.

  Where the page ends in a full-bleed section, that same stretch would read as a base-coloured strip
  under the section's own colour, so the section itself absorbs the space instead and its background
  continues to the footer. Scoped with `:has()` rather than applied everywhere, because `float` is
  ignored on flex items: a prose page with an `alignleft` image would lose its text wrap, and it
  gains nothing in return since its filler is already invisible. Where `:has()` is unsupported the
  chain never engages and the strip comes back, which is the unstyled behaviour anyway.

  Growing the footer instead of `main` hides the strip too, but it is the same region either way —
  only the colour differs — and a viewport's worth of it in the footer's `tertiary` reads as an
  enormous footer on a short page.

## [1.8.1] - 2026-07-24

### Fixed
- **The product archive's filter sidebar is styled.** 1.8.0 covered the WooCommerce blocks that
  declare colour and typography supports, which left the filter controls out: every one of
  `product-filter-removable-chips`, `-clear-button`, `-checkbox-list` and `-price-slider` declares
  `interactivity` supports only, so `theme.json` had no way in and the sidebar rendered in
  WooCommerce's stock greys regardless of the active style variation.

  `assets/css/woocommerce.css` gains a filters section covering the active-filter chips, the
  category / availability / rating checkboxes, the price slider and its inputs, and the spacing
  above the clear button. Most of it goes through the `--wc-product-filter-*` custom properties
  WooCommerce exposes: nothing in the plugin sets them unless an editor user picks colours on the
  block, so a value set here always applies, and a user who does pick colours still wins through
  the inline style the block writes on the same wrapper.

  The clear button needed nothing beyond spacing — it is a core button block, so `elements.button`
  and the outline style already reached it.
- **The price slider handle was near-invisible on hover and focus under a dark style variation.**
  It is the one part of the sidebar with no custom property: WooCommerce hardcodes `#1e1e1e` on
  `#fff` for those two states. Restated against the palette.
- **The unchecked filter checkbox showed WooCommerce's `currentColor` wash on top of the theme's
  background.** The plugin hides that pseudo-element only when the block carries
  `has-option-element-color`, an editor-set attribute the shipped template doesn't use.

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
