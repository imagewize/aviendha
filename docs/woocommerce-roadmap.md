# WooCommerce roadmap

Gap analysis of Aviendha's WooCommerce surface, with prioritised work items.

**Status:** §1–§3 shipped in 1.7.0. §3b and §5 shipped in 1.8.0; §5's outstanding filter styling
followed in 1.8.1, which completes it. §4 and §6 are outstanding — see the sequencing note at the
end for what's still worth doing and what has been dropped. Sections kept in place after
implementation so the reasoning behind each choice stays with the theme.

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
| `templates/single-product.html` | Breadcrumbs, gallery, title, rating, price, summary, `add-to-cart-with-options`, SKU and tags, then stacked description / specifications / reviews sections and a related-products collection. See §3b. |
| `templates/archive-product.html` | Breadcrumbs, title, term description, results bar (count + sorting), filters sidebar, product grid, pagination, no-results state. |
| `parts/*-product-add-to-cart-with-options.html` | Theme overrides for the simple and variable product types. External and grouped fall back to WooCommerce's. |
| Cart / checkout / order confirmation / product search / attribute archives | Not shipped — inherited from WooCommerce's own block templates. See §4. |
| `parts/header.html` | Contains `woocommerce/mini-cart`, stripped when the plugin is inactive. |
| `functions.php` | Theme supports, conditional stylesheet enqueue, and the plugin-state branch described in §1. |
| `assets/css/woocommerce.css` | Drawer, gallery, prices, stepper, button hover, meta, specifications, reviews, filters. See §5. |
| `theme.json` → `styles.blocks` | `core/separator` plus eight WooCommerce blocks. See §5. |
| `styles/twilight.json` | No WooCommerce block overrides — and needs none; see §5. |

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

### 3b. Replacing `product-details` with composed blocks — done

`woocommerce/product-details` renders WooCommerce's classic PHP tab strip: `ul.tabs.wc-tabs` with
grey tab chrome and jQuery behind it. It has **no colour or typography supports**, so theme.json
can't touch it, and the plugin's own `is-style-minimal` variation styles it from `html body …`
selectors that any theme override has to out-specify. It was the one part of the page that still
looked like stock WooCommerce.

Woo 10.9 ships the pieces to do without it: `product-description`, `product-specifications` and
`product-reviews` render the three tab panels as standalone blocks. The template now lays them out
as three stacked sections, each a `core/columns` with a narrow label column and the content beside
it, separated by hairline rules. No tabs, no jQuery, and every part of it is a block the design
system reaches.

`woocommerce/accordion-group` (also new in 10.9) was the other candidate and was rejected: hiding a
product description behind a click costs more than the vertical space it saves.

The reviews block needs a full inner-block tree — title, review template with avatar/author/rating/
date/content, pagination, form. That tree is not in any shipped template or pattern; it lives in the
block's editor default in `assets/client/blocks/product-reviews.js`. The template reproduces it
verbatim, which is the same "follow the plugin's structure" rule the rest of this document uses.

**Two blocks in the old template rendered nothing at all**, both because they are containers that
were shipped self-closing: `woocommerce/product-meta` (now wraps `product-sku` and a `post-terms`
tag list) and `woocommerce/related-products` (replaced with `woocommerce/product-collection` using
the `woocommerce/product-collection/related` collection, matching the plugin's own
`related-products` pattern — which Aviendha unregisters along with the rest of `woocommerce-blocks/*`,
so the block on its own had nothing to expand into).

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
| `taxonomy-product_cat.html` | Falls back to `archive-product`, which is now filtered — acceptable. Only worth its own file if category pages should differ from the shop index. | Dropped after §2; see sequencing. |
| `coming-soon.html` | Woo's launch / coming-soon mode, on by default for new stores — the aviendha subsite was in it until switched off, so this is the *first* page a new store shows. Branding it is genuinely valuable and self-contained. | Medium–high. |
| `order-confirmation.html` | The highest-trust page in the funnel and it currently renders unbranded. Cheap. | Low–medium. |

WooCommerce 10.9.4's own template set, for reference: `archive-product`, `single-product`,
`page-cart`, `page-checkout`, `order-confirmation`, `product-search-results`, `coming-soon`,
`taxonomy-product_attribute`.

---

## 5. The design system doesn't reach WooCommerce — theme.json part done

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

### Shipped in `theme.json`

`price`, `button`, `sale-badge`, `mini-cart`, `mini-cart-contents`, `product-filters`,
`product-rating` and `product-summary`. Prices take the display font at 600; buttons and the sale
badge take `primary` on `base` with the pill radius, matching `elements.button`; stars take
`terracotta`; summaries take `secondary`.

**`styles/twilight.json` needed no changes.** Every value is a `var(--wp--preset--*)` reference and
twilight overrides the palette under the same slugs, so the variation picks the Woo block styles up
for free. Only a block needing a *different* choice per variation (not just a different colour
value) would need an entry there — none do so far.

### Half of the list can't be done in `theme.json`

Checked against each block's `supports` in Woo 10.9.4. Three of the blocks named above declare no
colour or typography supports at all, so a `styles.blocks` entry for them generates nothing:

- `woocommerce/product-details` — `align` only. Since resolved by not using the block; see §3b.
- `woocommerce/add-to-cart-with-options-quantity-selector` — `interactivity` only.
- `woocommerce/product-filter-clear-button`, `-chips`, `-removable-chips`, `-checkbox-list`,
  `-price-slider` — `interactivity` only. Handled in CSS in 1.8.1; see below.

Worth checking `supports` before adding any entry: `product-specifications` looks like a styling
target and declares only `align`, `spacing` and two typography properties.

### Shipped in `assets/css/woocommerce.css`

The file is no longer a stub. What's in it, and why each one couldn't be theme.json:

| Section | Why CSS |
| --- | --- |
| Mini cart drawer | `.wc-block-components-drawer` sits *outside* the `mini-cart-contents` block with a hardcoded `background: #fff`, so the block entry can't reach it — and without it a dark variation renders light contents text on a white panel. |
| Product gallery | `product-image-gallery` renders the classic PHP gallery: nothing inside it is a block, and the sale flash is a bare `span.onsale` WooCommerce draws as a green circle. |
| Prices | A sale price is `del` + `ins` inside one block; theme.json styles the container, so the old price arrives at the same weight as the new one. |
| Quantity stepper | No supports at all (see above). |
| Add to cart hover | See the cascade note below. |
| Specifications | No colour or border supports; the block renders a table. |
| Reviews | The review form is core comment-form markup, not blocks. |
| Filters | Every filter control declares `interactivity` supports only (see above). |

The product-details tab strip left the list when the template stopped using that block — see §3b.

### The filter sidebar — done in 1.8.1

The last outstanding piece of this section. It turned out to be less hostile than the supports list
suggests: **WooCommerce exposes `--wc-product-filter-*` custom properties** on the chips, checkbox
lists and price slider, and *nothing in the plugin sets them* unless an editor user picks colours on
the block. So a value set in the theme stylesheet always applies, and a user who does pick colours
still wins — the block writes an inline style on the same wrapper the theme targets. Prefer these
over selector overrides for anything they cover.

Three things they don't cover, each needing a real override:

- **The price slider handle's `:hover` and `:focus`.** Hardcoded `#1e1e1e` on `#fff` with no
  property behind it — the handle went near-invisible under twilight. Each vendor pseudo-element
  (`::-webkit-slider-thumb`, `::-moz-range-thumb`) needs its own rule; a selector list containing
  one the browser doesn't recognise is dropped whole.
- **The unchecked checkbox's `currentColor` wash**, a pseudo-element the plugin hides only when the
  block carries `has-option-element-color` — an editor-set attribute the shipped template doesn't
  use, so the wash sat on top of the theme's background.
- **Hardcoded `2px` radii and the `1rem` gap above the clear button.**

The clear button needed nothing else: it's a core button block, so `elements.button` and the outline
style already reached it.

**On load order:** these filter stylesheets are enqueued as their blocks render, so the theme's
sheet landing after them isn't guaranteed the way it is for `wp_head`. Observed on the demo archive
it does — Woo's filter CSS inlines early and `woocommerce.css` follows it — but the rules are
written to out-specify rather than rely on that.

### Cascade notes

Global styles print *after* every `wc-blocks-style-*` stylesheet in `wp_head`, and WordPress wraps
block styles as `:root :where(…)` — specificity 0,1,0 with everything inside `:where()` discounted.
So theme.json beats Woo's own block CSS on source order, but loses to anything Woo declares at two
classes or with `!important`, and loses to per-instance preset classes in the templates. That last
part is why **no entry sets `font-size`** on a block the templates size per instance
(`product-price`, `product-sale-badge`): the template attribute is the intended winner, and a
theme.json font-size would be a coin-flip on source order for blocks whose preset class lands on the
same element the block selector targets.

`woocommerce/product-rating-stars` was tried and dropped — it resolves to the same
`.wc-block-components-product-rating` selector as `product-rating`, so it only emitted a duplicate
rule.

**Element styles print before block styles**, at the same specificity. So the `elements.button`
`:hover` added to `theme.json` is overridden on the add-to-cart button by the
`woocommerce/product-button` block entry that follows it — the button would have had no hover state
at all. That hover is restated in `woocommerce.css`, which lands after both. Any future block entry
that sets a property `elements.button` also hovers has the same problem.

---

## 6. Smaller items

- **`woocommerce/customer-account`** in the header — account icon/link, one line of markup. The
  §1 stripping already covers it, so it can be added without further PHP work.
- **`woocommerce/product-search`** in the header or footer, pairing with the
  `product-search-results` template from §4.
- **`taxonomy-product_tag.html`** — same fallback situation as `product_cat`, and dropped for the
  same reason; see sequencing.

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

**`woocommerce/product-rating` renders nothing until a product has a review**, which also makes the
star styling unverifiable. The sample data ships none. Seed one with `wp comment create
--comment_post_ID=<id> --comment_type=review --comment_approved=1`, `wp comment meta set <id> rating
5`, then set the product's `average_rating` / `rating_counts` / `review_count` and save it — the
comment alone doesn't update the product's cached rating.

**Alignment has to be set per block, not inherited.** In a `constrained` main group, `alignwide`
columns sit wider than an unaligned heading above them, so the archive title appeared indented
relative to its own sidebar. `query-title`, `term-description` and the results bar all carry
`"align":"wide"` explicitly. `woocommerce/breadcrumbs` renders wide on its own.

**`postId` context reaches top-level blocks on `single-product.html`.** `product-description`,
`product-specifications` and `product-reviews` all bail out returning an empty string when
`$block->context['postId']` is missing, and they declare `ancestor` lists that the template doesn't
satisfy (`woocommerce/single-product`, `product-template`, `core/post-template`). Neither turned out
to matter — `ancestor` only restricts editor insertion, and the singular template supplies `postId`.
Verified on the demo site rather than assumed, because a wrong answer here is a silently blank page.

**Beanie is the copy test product.** The sample data ships every product with "This is a simple
product." as the short description and a lorem ipsum body, which tells you nothing about whether the
type is working. The demo Beanie now has real short and long copy plus five visible attributes, so
the summary, description and specifications sections all have something to render.

**Demo site setup.** The aviendha subsite needed WooCommerce activated, sample products imported
(`wp import web/app/plugins/woocommerce/sample-data/sample_products.xml --authors=skip` — do **not**
pass `--skip=attachment`, or every product renders a placeholder image), coming-soon mode switched
off (`wp option update woocommerce_coming_soon no`), and the lookup tables regenerated.

---

## Suggested sequencing

**PR 1 — correctness, archive, single product.** Done: §1, §2, §3 on
`feat/woocommerce-improvements`.

**PR 2 — design system.** Done: §5 plus the §3b template rebuild, on
`feat/woocommerce-design-system`, released as 1.8.0. `twilight.json` turned out to need nothing.

**PR 2b — filter sidebar.** Done: the piece left over from PR 2, on `fix/product-filter-chips`,
released as 1.8.1. Widened past the chips and clear button to the checkboxes and price slider once
the custom-property hook made them cheap — a half-styled sidebar is still an inconsistent one.

**PR 3 — additional templates.** `product-search-results.html` together with
`woocommerce/product-search` in the header (the template has no entry point without it), then
`coming-soon.html`, plus `woocommerce/customer-account` in the header.

**Dropped, not deferred:** `taxonomy-product_cat.html` and `taxonomy-product_tag.html`. §2's
resolution made the archive fallback the intended behaviour, so shipping near-duplicate template
files would contradict `CLAUDE.md`'s rule against markup added for completeness. `order-confirmation.html`
stays on the list but below `coming-soon.html` — cheap, but low traffic and currently only
theoretically a problem.

Testing `coming-soon.html` means flipping `woocommerce_coming_soon` back to `yes` on the demo
subsite, which the §Implementation notes turned off — and remembering to flip it back.

Each PR should be verified on the demo subsite before merge — sync with `rsync-package-to-site.sh`
per `CLAUDE.md`, don't cut a release to test.
