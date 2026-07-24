# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aviendha is a lean full-site-editing (FSE) WordPress theme for WooCommerce stores — a general-purpose
e-commerce base for small and medium businesses. It is a companion to Imagewize's **Elayne** and
**Nynaeve** themes, but deliberately simpler: **no theme-level patterns**. `theme.json`, WooCommerce
block templates, and style variations form the design system; page content is composed directly from
blocks (core blocks or the [Aludra](https://github.com/imagewize/aludra) block library) rather than
inserted as pre-built patterns.

**Requirements:**
- WordPress 6.6+
- PHP 8.0+
- WooCommerce (for store templates)
- Aludra plugin — recommended, not required

## Why no patterns

Elayne and Nynaeve both ship large pattern libraries. Aviendha intentionally does not, because:

1. Blocks (not patterns) are where the reusable logic should live — see Aludra's `aludra/*` blocks
   (mega menu, carousel, FAQ tabs, etc.). Patterns become one-liners around those blocks rather than
   theme-maintained markup walls.
2. It keeps this theme's surface area small: no pattern-validation harness, no per-vertical pattern
   sets to maintain.

If Aviendha ever needs vertical-specific starting content (e.g. a "cycling" flavor), prefer a
**style variation** (`styles/*.json`) over a pattern library — same design system, different palette.

## Architecture

### Design system (`theme.json`)

Single source of truth for color, typography, spacing, and border radius. Color and spacing slugs are
chosen to match what Aludra's block styles and patterns already reference (mega-menu patterns use
`var:preset|color|contrast`, `secondary`, `border-light`, and `var:preset|spacing|small` etc.) —
**do not rename or remove these slugs** without checking Aludra's `patterns/*.php` for references:

- Colors: `base`, `tertiary`, `border-light`, `contrast`, `secondary`, `main`, `primary`, `accent`
- Spacing: `2-x-small`, `x-small`, `small`, `medium`, `large`, `x-large`

### Templates (`templates/`)

Real block markup — not pattern references. Includes core templates (`index`, `home`, `archive`,
`single`, `page`, `search`, `404`) and two WooCommerce templates:

- `single-product.html` — product gallery, title, price, add-to-cart, details, related products
- `archive-product.html` — product grid via `woocommerce/product-collection`

**`page.html` (default) omits `post-title`.** Most Aviendha pages are composed directly from blocks
(or Aludra blocks) whose own heading already serves as the page's title — e.g. `aludra/hero-split`'s
`<h1>`. Auto-printing `post-title` above that would duplicate it. Use **`page-with-title.html`** (a
custom template, selectable per-page under Page → Template in the editor) for standard content pages
that do want the conventional title treatment — it's identical to `page.html` plus `post-title`.

**Deliberately not shipped:** `cart.html`, `checkout.html`, `taxonomy-product_cat.html`. WooCommerce
ships its own block-theme default templates for these and uses them automatically when a theme
doesn't override them. Only add theme-specific versions here once there's an actual customization
need — don't ship untested block markup for the sake of completeness.

### Template parts (`parts/`)

`header.html` and `footer.html` only. No file-based `menu` template part — see below.

### Aludra mega-menu integration

The Aludra mega-menu block requires its host theme to register a `menu` template part area.
`functions.php` does this via the `default_wp_template_part_areas` filter. This makes mega menu
template parts (created by users in the Site Editor) appear under
**Appearance → Editor → Patterns → Template Parts → Menus**. Content for those template parts lives
in the database, not in this theme — Aviendha ships no menu template part files, matching the
"no patterns" rule above.

### Style variations (`styles/`)

Alternate color palettes layered on the same `theme.json` design system. `styles/twilight.json` is
the example — a dark, rose-accented variant. Follow this pattern for future variations: override
`settings.color.palette` (keep the same slugs) and any `styles` overrides needed, nothing else.

## Development

No JS build step — the theme ships no bundled JavaScript or CSS preprocessing.

```bash
composer install
composer run lint       # php-parallel-lint syntax check
composer run wpcs:scan  # PHPCS against phpcs.xml (WordPress standard)
composer run wpcs:fix   # PHPCBF auto-fix
```

### Where docs and design mockups live

**Not in this repo.** Planning documents, roadmaps and HTML design mockups belong in the
`imagewize/imagewize.com` repo, under `docs/aviendha/` and `designs/aviendha/` — the same
per-project layout Aludra, Elayne and Nynaeve use. Elayne and Nynaeve ship no `docs/` or `designs/`
directory at all; keep it that way here.

**That repo is private, and access is limited to the Imagewize team.** Contributors outside the
team cannot read it, so nothing here — no code comment, no README, no issue reply — should treat a
document there as something a reader can go and open. Anything an outside contributor genuinely
needs must live in this repo, in `readme.txt`, `CHANGELOG.md` or a code comment. Team members
clone `imagewize.com` alongside this repo and read the documents locally; the paths above are
relative to that clone.

Two reasons, beyond consistency: this repo is public and distributable, so mockups carrying client
names and roadmaps of unshipped work do not belong in it; and a second copy of a design file drifts
from the first (`aviendha-redesign.html` was already duplicated in both repos before this rule).

Durable rationale for a change belongs in the commit message and in code comments, not in a
document — that is what makes the split cost nothing. `.distignore` and `.gitattributes` still
carry `docs/` and `designs/` entries as a guard, so a stray file never reaches a release zip.

### Testing on the demo site

Aviendha is exercised on the `/aviendha/` subsite of the local Trellis/Bedrock multisite at
`~/code/imagewize.com/demo` (`http://demo.imagewize.test/aviendha/`), alongside the
[Aludra](https://github.com/imagewize/aludra) block library the content is composed from.

Both are pinned Composer dependencies there, **not** symlinks to these working copies. Do not cut
a release to test a local change — sync instead, with `rsync-package-to-site.sh` from
[wp-ops](https://github.com/imagewize/wp-ops) (`scripts/rsync-package-to-site.sh`):

```bash
SITE_ROOT=~/code/imagewize.com/demo/web/app \
  ~/code/wp-ops/scripts/rsync-package-to-site.sh theme aviendha ~/code/aviendha
```

It rsyncs a dist-faithful tree (`--delete --delete-excluded`, honouring `.distignore`), so what
you test is what ships; pass `plugin aludra` for the block library. A `composer update` on the
demo site puts the released code back.

The script deliberately lives in wp-ops rather than here: its paths are personal configuration,
not theme code, and Theme Check's `File_Check` rejects a theme that ships a `.sh` file at all.
Elayne and Nynaeve keep their copies untracked for the same reason; `bin/sync-demo.sh` is
gitignored here if you want a local shortcut.

Run one-off WP-CLI commands against it with:

```bash
cd ~/code/imagewize.com/trellis
trellis vm shell --workdir /srv/www/demo.imagewize.com/current -- wp <command> --url=demo.imagewize.test/aviendha/
```

### CI

Two checks run on GitHub, both mirroring Elayne's:

- `wpcs.yml` — PHPCS against the WordPress standard, on every pull request. `composer run
  wpcs:scan` runs the same standard locally.
- `theme-check.yml` — the WordPress theme review action with the stricter accessibility suite
  enabled, on pull requests and pushes to `main`. It reviews the repo root, exactly as Elayne's
  does. The action copies whatever `root-folder` points at, so anything tracked here is reviewed:
  Theme Check's `File_Check` rejects a theme carrying a `.sh` file, which is why the sync script
  lives in wp-ops and is gitignored here. Keep it that way rather than reaching for a build step.

### Release packaging

Publishing a GitHub release triggers `.github/workflows/create-release.yml`, which zips the theme
with `zip -x@.distignore` and attaches it to the release. Anything that should not reach an
installed site belongs in `.distignore` — and, so source archives match, in `.gitattributes` as
`export-ignore`. Keep the two in step.

## Version Management

When updating the theme version, update **three files** in sync:

1. **CHANGELOG.md** — add a new version section
2. **readme.txt** — update `Stable tag` header and add a changelog entry
3. **style.css** — update the `Version` header

## Git Commit Guidelines

**Never mention AI tools (Claude, ChatGPT, etc.) in commit messages or PR bodies**, and never add
AI co-author/attribution trailers (e.g. `Co-Authored-By: Claude ...`, "Generated with Claude Code").
This applies regardless of how the change was made — commit messages describe the change, not the
tooling used to produce it.

Commit messages should be concise, professional, and focused on the change itself:

- Good: "Add archive-product template", "Fix header nav overlay z-index"
- Bad: "Claude helped me fix..." / overly long explanations / AI attribution footers

**Prefer atomic commits** — one commit per file or logically-related group of files, rather than
one large commit bundling unrelated changes. Makes history easier to review and bisect.

## Key Files

- `theme.json` — design system (single source of truth)
- `functions.php` — theme setup, `menu` template part area registration, WooCommerce hooks
- `templates/*.html` — FSE templates, including WooCommerce single-product/archive-product
- `parts/header.html`, `parts/footer.html` — template parts
- `styles/*.json` — style variations
- `assets/logos/` — rose logo mark (SVG, adapted from Lucide, ISC License)
- `composer.json` / `phpcs.xml` — PHP lint/coding-standards tooling
