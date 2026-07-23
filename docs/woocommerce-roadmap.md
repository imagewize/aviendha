# WooCommerce roadmap

Gap analysis of Aviendha's WooCommerce surface, with prioritised work items.

**Baseline for this document:** Aviendha 1.6.0, WooCommerce 10.9.4 (the version installed on the
`demo.imagewize.test/aviendha/` test site). Every block named below ships in that version — nothing
here depends on a feature plugin or an experimental flag.

The gaps were identified by comparing Aviendha against WooCommerce's own default block templates
and template parts (`woocommerce/templates/`), which are the reference for current block-theme
store practice. Where the plugin's defaults demonstrate a structure, Aviendha should follow it
rather than invent one — the blocks are picky about inner-block nesting, and matching the plugin's
markup keeps the theme working across Woo releases.

Note one Aviendha-specific constraint throughout: **the theme ships no patterns** (see `CLAUDE.md`).
Most block themes deliver store UI as patterns with one-line templates pointing at them. Everything
below lands as real block markup in `templates/` and `parts/` instead. That is a presentation
difference, not a capability one.

## Where Aviendha stands today

| Area | Status |
| --- | --- |
| `templates/single-product.html` | Ships. Gallery, title, rating, price, meta, legacy add-to-cart form, details, related products. |
| `templates/archive-product.html` | Ships. Query title, store notices, product grid, pagination. Nothing else. |
| Cart / checkout / order confirmation / product search / attribute archives | Not shipped — inherited from WooCommerce's own block templates. |
| `parts/header.html` | Contains `woocommerce/mini-cart`, unconditionally. |
| `functions.php` | `add_theme_support( 'woocommerce' )` plus the three `wc-product-gallery-*` supports; conditional enqueue of `assets/css/woocommerce.css`. |
| `assets/css/woocommerce.css` | Empty stub — a comment and nothing else. |
| `theme.json` → `styles.blocks` | One entry (`core/separator`). No WooCommerce blocks styled. |
| `styles/twilight.json` | No WooCommerce block overrides. |

---

## 1. Handle "WooCommerce not active" — highest priority

**This is a correctness bug, not an enhancement.** `single-product.html` and `archive-product.html`
are registered unconditionally, and `parts/header.html` hardcodes `woocommerce/mini-cart`. On a site
where WooCommerce is inactive:

- both templates appear in the Site Editor's template list and render as invalid blocks;
- the header shows the "your site doesn't include support for this block" placeholder in the editor.

The fix is a single `class_exists( 'WooCommerce' )` branch in `functions.php` registering one of two
hook sets — the standard approach for a theme whose store templates are optional. When the plugin is
missing, filter the theme's Woo template slugs out of `get_block_templates`. Aviendha already does a
`class_exists` check for stylesheet enqueueing, so the idiom is established.

The header mini-cart needs its own answer, since block markup in a file can't be conditional.
Options, in order of preference:

1. Leave it and accept the editor placeholder — **not acceptable**, this is the visible symptom.
2. Strip the block from the template part's content when Woo is inactive, via the same template
   filters. Cheap, robust, covers editor and frontend, no duplicate template parts.
3. Ship a second header part without the cart. Rejected — doubles the header parts to maintain, and
   users who switch parts lose their customisations.

Go with (2).

### 1b. Unregister WooCommerce's bundled patterns

Related, and it closes a hole in the theme's stated philosophy. `functions.php` calls
`remove_theme_support( 'core-block-patterns' )` so the inserter stays clean — but WooCommerce then
registers its own `woocommerce-blocks/*` patterns, so on any store the inserter fills back up with
patterns Aviendha never designed and doesn't style. Unregistering them on `init` at a late priority
restores the intent:

```php
foreach ( $all_patterns as $pattern ) {
    if ( isset( $pattern['name'] ) && strpos( $pattern['name'], 'woocommerce-blocks' ) === 0 ) {
        unregister_block_pattern( $pattern['name'] );
    }
}
```

Worth pairing with removing `pattern-toolkit-full-composability` from `woocommerce_admin_features`,
which stops Woo's pattern-assembler onboarding flow from offering to overwrite the theme's
templates.

---

## 2. `archive-product.html` — the thinnest part of the theme

The current template is a bare product grid. What a store base is expected to have, all of it
shipping blocks in Woo 10.x:

- **`woocommerce/product-results-count` + `woocommerce/catalog-sorting`**, in a flex group with
  `justifyContent: space-between` — a "results bar" above the grid. Right now customers **cannot
  sort a category at all**. This is the single cheapest high-impact addition on the list.
- **`woocommerce/product-filters`** in a sidebar column. Inner blocks worth including:
  `product-filter-active` (with `product-filter-removable-chips` and `product-filter-clear-button`),
  `product-filter-price` (+ `product-filter-price-slider`), `product-filter-rating`,
  `product-filter-attribute`, `product-filter-taxonomy`, `product-filter-status` — each with a
  `product-filter-checkbox-list` where applicable.
- **`woocommerce/product-collection-no-results`** — a filtered archive that matches nothing
  currently renders *nothing at all*. This becomes mandatory the moment filters exist.
- **`woocommerce/breadcrumbs`** and **`core/term-description`** — `single-product.html` has
  breadcrumbs, the archive doesn't, which is backwards from how customers navigate.

### Product Collection attributes are dated

The block currently carries `displayLayout: {"type":"grid","columns":3}`. Current Woo emits:

```json
"displayLayout":{"type":"flex","columns":3,"shrinkColumns":true},
"dimensions":{"widthType":"fill","fixedWidth":""}
```

`shrinkColumns` is what gives sane responsive column collapse on narrow viewports. The grid variant
still renders, but it's the pre-`shrinkColumns` shape and won't pick up layout improvements.

### Open question: where do filters live?

A filters sidebar changes the default archive layout for every store, including ones with five
products where filters are noise. The usual escape hatch — shipping both a plain and a
with-sidebar archive as user-selectable patterns — is unavailable under Aviendha's no-patterns
rule. The realistic choices:

- **Filters in the default `archive-product.html`.** Simplest; the sidebar is what most stores want.
- **Filters in `taxonomy-product_cat.html` only**, leaving the shop index unfiltered. Gives both
  layouts without patterns, at the cost of one more template file. See §4.

Recommendation: filters in `archive-product.html`. Stores that don't want them can remove the
sidebar column in the Site Editor, which is easier than adding one.

---

## 3. `single-product.html` — modernise the add-to-cart

The template uses `woocommerce/add-to-cart-form`, the legacy PHP-rendered form. Woo 10.x registers
an **`add-to-cart-with-options` template part area** with per-product-type parts that a theme can
override by shipping files of the same slug:

- `parts/simple-product-add-to-cart-with-options.html`
- `parts/variable-product-add-to-cart-with-options.html`
- `parts/external-product-add-to-cart-with-options.html`
- `parts/grouped-product-add-to-cart-with-options.html`

(Confirmed against `woocommerce/src/Blocks/Utils/BlockTemplateUtils.php` and
`woocommerce/templates/parts/` in 10.9.4.)

This is the clean route to styling quantity steppers and variation selectors *inside the design
system* — as blocks with `theme.json` styling — rather than writing CSS to override Woo's form
markup. The plugin's own simple-product part is the model to follow:

```html
<!-- wp:woocommerce/product-stock-indicator {"style":{"spacing":{"margin":{"top":"1rem","bottom":"1rem"}}}} /-->
<!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"stretch"}} -->
<div class="wp-block-group"><!-- wp:woocommerce/add-to-cart-with-options-quantity-selector {"quantitySelectorStyle":"stepper"} /-->
<!-- wp:woocommerce/product-button {"textAlign":"left"} /--></div>
<!-- /wp:group -->
```

Overriding only `simple` and `variable` is a reasonable scope — external and grouped products are
rarer, and Woo's defaults for them stay in force.

Also missing from the single-product template:

- **`woocommerce/product-stock-indicator`** — no stock state is shown anywhere. (Comes along with
  the add-to-cart parts above.)
- **A short description** (`woocommerce/product-summary`) above add-to-cart. The full description is
  buried in `product-details` tabs; the excerpt is the sales copy.
- **Upsells** alongside `related-products`, via a `product-collection` with the upsells collection.

### Note on the gallery theme supports

`functions.php` declares `wc-product-gallery-zoom`, `-lightbox`, and `-slider`. These configure the
*classic* gallery markup, which is what `woocommerce/product-image-gallery` renders. If the template
ever moves to Woo's newer interactive `woocommerce/product-gallery` block, those three supports
become inert and the equivalent settings move onto the block. Not a bug today — just don't assume
they carry over.

---

## 4. Templates worth adding

`CLAUDE.md`'s rule — *don't ship untested block markup for the sake of completeness* — is correct
and should hold for cart and checkout: WooCommerce's defaults are functional, use the theme's header
and footer parts, and inherit `theme.json`. Ship theme versions only when there's a concrete styling
need.

These four are a different case:

| Template | Why | Priority |
| --- | --- | --- |
| `product-search-results.html` | Woo's default is generic; without one, search results look nothing like the archive customers just came from. | High — pairs with §2. |
| `taxonomy-product_cat.html` | Currently falls back to `archive-product`. Becomes worth its own file if the filters decision in §2 goes the "category pages only" way. | Conditional on §2. |
| `coming-soon.html` | Woo's launch / coming-soon mode. A *store base theme* branding the pre-launch page is genuinely valuable, and it's a self-contained template with no ongoing maintenance. | Medium. |
| `order-confirmation.html` | The highest-trust page in the funnel and it currently renders unbranded. Cheap. | Low–medium. |

WooCommerce 10.9.4's own template set, for reference: `archive-product`, `single-product`,
`page-cart`, `page-checkout`, `order-confirmation`, `product-search-results`, `coming-soon`,
`taxonomy-product_attribute`.

---

## 5. The design system doesn't reach WooCommerce

`theme.json` is described in `CLAUDE.md` as the single source of truth for the design system, but
its `styles.blocks` section has exactly one entry (`core/separator`) and mentions no WooCommerce
block. `assets/css/woocommerce.css` is an empty stub. `styles/twilight.json` overrides no Woo
blocks either — so **the dark variation doesn't restyle the store at all**: sale badges, prices,
buttons, the mini-cart drawer and the filter chips all render in WooCommerce's stock colours
regardless of which style variation is active.

Blocks that need `styles.blocks` entries, roughly in order of visual impact:

- `woocommerce/product-price`
- `woocommerce/product-button`
- `woocommerce/product-sale-badge`
- `woocommerce/mini-cart` (and the drawer)
- `woocommerce/product-filters` and its chips / clear button
- `woocommerce/product-rating`

Keep to the existing rule: everything expressible in `theme.json` goes in `theme.json`;
`woocommerce.css` takes only what it can't express (pseudo-classes, media queries, overriding Woo's
`!important` declarations) — the same division `style.css` already documents for core blocks.

Once `theme.json` carries Woo block styles, `styles/twilight.json` needs matching palette overrides
for them, and any future variation inherits the work.

---

## 6. Smaller items

- **`woocommerce/customer-account`** in the header — account icon/link, one line of markup. Subject
  to the same Woo-inactive handling as the mini-cart (§1).
- **`woocommerce/product-search`** in the header or footer, pairing with the
  `product-search-results` template from §4.
- **`taxonomy-product_tag.html`** — same fallback situation as `product_cat`; lower value.

---

## Suggested sequencing

**PR 1 — correctness, archive, single product**
§1 (template filtering, mini-cart handling, Woo pattern unregistration), §2 (results bar, filters
sidebar, no-results state, breadcrumbs, Product Collection attribute refresh) and §3 (the
`add-to-cart-with-options` parts, stock indicator, product summary, upsells). Fixes an
actually-broken state, closes the no-patterns leak, and brings both store templates up to current
practice.

**PR 2 — design system**
§5: `theme.json` Woo block styles plus the `twilight.json` counterparts. Best done after PR 1 so
every block that needs styling already exists in a template.

**PR 3 — additional templates**
§4, in the priority order of that table.

Each PR should be verified on the demo subsite before merge — sync with `rsync-package-to-site.sh`
per `CLAUDE.md`, don't cut a release to test.
