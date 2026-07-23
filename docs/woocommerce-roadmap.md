# WooCommerce roadmap

Gap analysis of Aviendha's WooCommerce surface, with prioritised work items.

**Status:** §1–§3 are implemented on `feat/woocommerce-improvements` and verified on the demo
subsite. §4–§6 are outstanding. Sections kept in place after implementation so the reasoning behind
each choice stays with the theme.

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
| `templates/single-product.html` | Breadcrumbs, gallery, title, rating, price, summary, `add-to-cart-with-options`, meta, details, related products. |
| `templates/archive-product.html` | Breadcrumbs, title, term description, results bar (count + sorting), filters sidebar, product grid, pagination, no-results state. |
| `parts/*-product-add-to-cart-with-options.html` | Theme overrides for the simple and variable product types. External and grouped fall back to WooCommerce's. |
| Cart / checkout / order confirmation / product search / attribute archives | Not shipped — inherited from WooCommerce's own block templates. See §4. |
| `parts/header.html` | Contains `woocommerce/mini-cart`, stripped when the plugin is inactive. |
| `functions.php` | Theme supports, conditional stylesheet enqueue, and the plugin-state branch described in §1. |
| `assets/css/woocommerce.css` | Empty stub — a comment and nothing else. See §5. |
| `theme.json` → `styles.blocks` | One entry (`core/separator`). No WooCommerce blocks styled. See §5. |
| `styles/twilight.json` | No WooCommerce block overrides. See §5. |

---

## 1. Handle "WooCommerce not active" — done

**This was a correctness bug, not an enhancement.** `single-product.html` and `archive-product.html`
were registered unconditionally, and `parts/header.html` hardcodes `woocommerce/mini-cart`. On a site
where WooCommerce is inactive:

- both templates appeared in the Site Editor's template list and rendered as invalid blocks;
- the header showed the "your site doesn't include support for this block" placeholder in the editor.

The fix is a single `class_exists( 'WooCommerce' )` branch in `functions.php` registering one of two
hook sets — the standard approach for a theme whose store templates are optional. When the plugin is
missing, the theme's Woo template slugs are filtered out of `get_block_templates`.

The header mini-cart needed its own answer, since block markup in a file can't be conditional.
Options, in order of preference:

1. Leave it and accept the editor placeholder — **not acceptable**, this was the visible symptom.
2. Strip the block from the template part's content when Woo is inactive, via the same template
   filters. Cheap, robust, covers editor and frontend, no duplicate template parts.
3. Ship a second header part without the cart. Rejected — doubles the header parts to maintain, and
   users who switch parts lose their customisations.

Implemented as (2), matching on `woocommerce/mini-cart` and `woocommerce/customer-account` so the
§6 header addition is already covered. `get_block_file_template` is filtered alongside
`get_block_templates` because the front end resolves parts through the former.

The add-to-cart parts from §3 are filtered out the same way, and the `add-to-cart-with-options`
template part area is registered by the theme **only** when Woo is inactive — the plugin registers
it otherwise, and an unknown area on a theme.json template part triggers a `_doing_it_wrong` notice.

### 1b. Unregister WooCommerce's bundled patterns — done

Related, and it closes a hole in the theme's stated philosophy. `functions.php` calls
`remove_theme_support( 'core-block-patterns' )` so the inserter stays clean — but WooCommerce then
registers its own `woocommerce-blocks/*` patterns, so on any store the inserter filled back up with
patterns Aviendha never designed and doesn't style. They are now unregistered on `init` at priority
999.

Only the `woocommerce-blocks/` prefix is unregistered. The plugin also ships `woocommerce/coming-soon*`
patterns, which its own coming-soon templates render — removing those breaks launch mode.

`pattern-toolkit-full-composability` is removed from `woocommerce_admin_features`, which stops Woo's
pattern-assembler onboarding flow from offering to overwrite the theme's templates.

---

## 2. `archive-product.html` — done

The template was a bare product grid. What a store base is expected to have, all of it shipping
blocks in Woo 10.x, and all now in place:

- **`woocommerce/product-results-count` + `woocommerce/catalog-sorting`**, in a flex group with
  `justifyContent: space-between` — a "results bar" above the grid. Customers previously **could not
  sort a category at all**. Cheapest high-impact addition on the list.
- **`woocommerce/product-filters`** in a 25% sidebar column: `product-filter-active` (with
  `product-filter-removable-chips` and `product-filter-clear-button`), `product-filter-price` (+
  `product-filter-price-slider`), `product-filter-taxonomy`, `product-filter-status`,
  `product-filter-rating`.
- **`woocommerce/product-collection-no-results`** — a filtered archive that matched nothing
  previously rendered *nothing at all*. Mandatory once filters exist.
- **`woocommerce/breadcrumbs`** and **`core/term-description`** — `single-product.html` had
  breadcrumbs, the archive didn't, which is backwards from how customers navigate.

**`product-filter-attribute` was deliberately left out.** Its `attributeId` defaults to `0`, so a
shipped instance renders as an unconfigured prompt on every store until someone picks an attribute —
and which attribute matters is per-store by definition. Stores that want to filter by brand or size
add the block in the Site Editor.

### Product Collection attributes were dated

The block carried `displayLayout: {"type":"grid","columns":3}` and now uses what current Woo emits:

```json
"displayLayout":{"type":"flex","columns":3,"shrinkColumns":true},
"dimensions":{"widthType":"fill","fixedWidth":""}
```

`shrinkColumns` is what gives sane responsive column collapse on narrow viewports.

### Resolved: where do filters live?

A filters sidebar changes the default archive layout for every store, including ones with five
products where filters are noise. The usual escape hatch — shipping both a plain and a
with-sidebar archive as user-selectable patterns — is unavailable under Aviendha's no-patterns
rule. The realistic choices were:

- **Filters in the default `archive-product.html`.** Simplest; the sidebar is what most stores want.
- **Filters in `taxonomy-product_cat.html` only**, leaving the shop index unfiltered. Gives both
  layouts without patterns, at the cost of one more template file. See §4.

Went with the first. Stores that don't want filters can remove the sidebar column in the Site
Editor, which is easier than adding one.

---

## 3. `single-product.html` — done

The template used `woocommerce/add-to-cart-form`, the legacy PHP-rendered form. Woo 10.x registers
an **`add-to-cart-with-options` template part area** with per-product-type parts that a theme can
override by shipping files of the same slug:

- `parts/simple-product-add-to-cart-with-options.html` — shipped
- `parts/variable-product-add-to-cart-with-options.html` — shipped
- `parts/external-product-add-to-cart-with-options.html` — not shipped
- `parts/grouped-product-add-to-cart-with-options.html` — not shipped

(Confirmed against `woocommerce/src/Blocks/Utils/BlockTemplateUtils.php` and
`woocommerce/templates/parts/` in 10.9.4. `BlockTemplateUtils::get_template_part()` checks
`theme_has_template_part()` first, so a theme file of the same slug wins over the plugin's.)

This is the clean route to styling quantity steppers and variation selectors *inside the design
system* — as blocks with `theme.json` styling — rather than writing CSS to override Woo's form
markup. The parts follow the plugin's own structure with theme spacing presets substituted for its
hardcoded `1rem` margins.

Overriding only `simple` and `variable` is deliberate — external and grouped products are rarer,
and Woo's defaults for them stay in force.

Also added: **`woocommerce/product-stock-indicator`** (inside the add-to-cart parts) and
**`woocommerce/product-summary`** above add-to-cart — the full description is buried in
`product-details` tabs, and the excerpt is the sales copy.

**Upsells were deferred.** The `woocommerce/product-collection/upsells` collection reads
`upsellsProductReferences` off the collection args, and getting that query shape right by hand is
guesswork; shipping unverified block markup is what `CLAUDE.md` warns against. Revisit by building
it in the Site Editor and copying the emitted markup.

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
| `product-search-results.html` | Woo's default is generic; without one, search results look nothing like the archive customers just came from — which now has a filters sidebar and results bar, widening the gap. | High. |
| `taxonomy-product_cat.html` | Falls back to `archive-product`, which is now filtered — acceptable. Only worth its own file if category pages should differ from the shop index. | Low, reassessed after §2. |
| `coming-soon.html` | Woo's launch / coming-soon mode, on by default for new stores — the aviendha subsite was in it until switched off, so this is the *first* page a new store shows. Branding it is genuinely valuable and self-contained. | Medium–high. |
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

§2 and §3 made this more visible, not less: the filters sidebar, quantity stepper, variation chips
and product-details tabs are all new unstyled surfaces on the demo site.

Blocks that need `styles.blocks` entries, roughly in order of visual impact:

- `woocommerce/product-price`
- `woocommerce/product-button`
- `woocommerce/product-sale-badge`
- `woocommerce/mini-cart` (and the drawer)
- `woocommerce/product-filters` and its chips / clear button
- `woocommerce/product-details` (tab strip)
- `woocommerce/add-to-cart-with-options-quantity-selector`
- `woocommerce/product-rating`

Keep to the existing rule: everything expressible in `theme.json` goes in `theme.json`;
`woocommerce.css` takes only what it can't express (pseudo-classes, media queries, overriding Woo's
`!important` declarations) — the same division `style.css` already documents for core blocks.

Once `theme.json` carries Woo block styles, `styles/twilight.json` needs matching palette overrides
for them, and any future variation inherits the work.

---

## 6. Smaller items

- **`woocommerce/customer-account`** in the header — account icon/link, one line of markup. The
  §1 stripping already covers it, so it can be added without further PHP work.
- **`woocommerce/product-search`** in the header or footer, pairing with the
  `product-search-results` template from §4.
- **`taxonomy-product_tag.html`** — same fallback situation as `product_cat`; lower value.

---

## Implementation notes

Things that cost time on the first pass and would cost it again.

**`woocommerce/product-image` renders its own sale badge.** `showSaleBadge` defaults to `true`, so
nesting a `woocommerce/product-sale-badge` inside it produces *two* badges per on-sale card — one
left, one right. The template sets `"showSaleBadge": false` and keeps the explicit block, which is
what gives the badge a font size and keeps it visible in the editor's list view.

**Filters need `wc_product_meta_lookup` populated.** `ProductFilterPrice` hides itself when
`$min_range === $max_range || ! $max_range`, and status/attribute filters behave similarly. Products
imported from XML don't populate the lookup tables, so every filter renders with
`wc-block-product-filter--hidden` and the sidebar looks broken. Fix with:

```bash
wp wc tool run regenerate_product_lookup_tables --user=1 --url=demo.imagewize.test/aviendha/
```

Two filters legitimately stay hidden on a fresh store: `product-filter-active` (nothing selected)
and `product-filter-rating` (no reviews).

**Alignment has to be set per block, not inherited.** In a `constrained` main group, `alignwide`
columns sit wider than an unaligned heading above them, so the archive title appeared indented
relative to its own sidebar. `query-title`, `term-description` and the results bar all carry
`"align":"wide"` explicitly. `woocommerce/breadcrumbs` renders wide on its own.

**Demo site setup.** The aviendha subsite needed WooCommerce activated, sample products imported
(`wp import web/app/plugins/woocommerce/sample-data/sample_products.xml --authors=skip` — do **not**
pass `--skip=attachment`, or every product renders a placeholder image), coming-soon mode switched
off (`wp option update woocommerce_coming_soon no`), and the lookup tables regenerated.

---

## Suggested sequencing

**PR 1 — correctness, archive, single product.** Done: §1, §2, §3 on
`feat/woocommerce-improvements`.

**PR 2 — design system.** §5: `theme.json` Woo block styles plus the `twilight.json` counterparts.
Now unblocked — every block that needs styling exists in a template and renders on the demo site.

**PR 3 — additional templates.** §4, in the priority order of that table, plus the §6 header blocks.

Each PR should be verified on the demo subsite before merge — sync with `rsync-package-to-site.sh`
per `CLAUDE.md`, don't cut a release to test.
