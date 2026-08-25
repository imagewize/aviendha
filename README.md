<p align="center">
  <img src="assets/logos/aviendha-rose-primary.svg" alt="Aviendha Logo" width="128" height="128">
</p>
<div align="center">
<h1>Aviendha</h1>
</div>
<div align="center">

[![Total Downloads](https://img.shields.io/packagist/dt/imagewize/aviendha.svg)](https://packagist.org/packages/imagewize/aviendha)
[![Latest Stable Version](https://img.shields.io/packagist/v/imagewize/aviendha.svg)](https://packagist.org/packages/imagewize/aviendha)
[![License](https://img.shields.io/packagist/l/imagewize/aviendha.svg)](https://packagist.org/packages/imagewize/aviendha)
[![Theme Check](https://github.com/imagewize/aviendha/actions/workflows/theme-check.yml/badge.svg)](https://github.com/imagewize/aviendha/actions/workflows/theme-check.yml)

</div>
<div align="center">

A lean full-site-editing starter theme for WordPress.
</div>

## Description

Aviendha is a full-site-editing (FSE) WordPress starter theme. It provides a solid design system via `theme.json` (colors, typography, spacing, layout), WooCommerce block templates, and style variations, but ships **no bundled patterns** — pages are composed directly from blocks. It is intended as a base theme to fork from, similar to Sage in the classic theming world.

Unlike Imagewize's [Elayne](https://github.com/imagewize/elayne) theme, Aviendha is minimal by design. It pairs with the [Aludra](https://github.com/imagewize/aludra) block library (mega menu, carousel, FAQ tabs, and more), but doesn't require it — the theme is a plain block theme that works with core blocks and any block plugin.

> **Lineage:** Aviendha is a companion starter theme to Imagewize's [Elayne](https://github.com/imagewize/elayne) and [Nynaeve](https://github.com/imagewize/nynaeve) themes, and serves as the base for themes like [Ixian](https://github.com/imagewize/ixian). Like Elayne, it ships no custom blocks of its own — content blocks come from the shared [Aludra](https://github.com/imagewize/aludra) plugin, per WordPress.org's theme-review rules. (Nynaeve is a separate case: it registers its own blocks and doesn't use Aludra.)

## Requirements

- WordPress 6.6+
- PHP 8.0+
- WooCommerce (optional, for store templates)
- Aludra plugin (recommended, not required)

## Features

- **Starter theme foundation** — designed to be forked and customized, with a clean separation of concerns and no opinionated patterns that would need removal
- **Design system** — `theme.json` defines the color palette, typography, spacing, and border radii; color/spacing slugs match what Aludra's own block styles expect (`base`, `contrast`, `secondary`, `main`, `primary`, `accent`, `tertiary`, `border-light`)
- **WooCommerce templates** — `templates/single-product.html`, `templates/archive-product.html`, `templates/product-search-results.html`, and `templates/coming-soon.html` are theme-provided; cart, checkout, and category-archive templates fall back to WooCommerce's own block-theme defaults. The product archive and search results ship a results count, catalog sorting, a filters sidebar (price, category, availability, rating) and an empty state; the single product template uses the block-based add to cart, with theme layouts for simple and variable products in `parts/`. The coming-soon template wraps WooCommerce's coming-soon block with the theme's header and footer.
- **Degrades gracefully without WooCommerce** — with the plugin inactive, the store templates and the header's mini cart are filtered out rather than left to render as unsupported blocks. WooCommerce's own bundled `woocommerce-blocks/*` patterns are unregistered when it *is* active — the theme neither designed nor styles them, and they crowd out core's.
- **Two page templates** — `page.html` (default) omits `post-title` since most pages get their title from a block's own heading; `page-with-title.html` (selectable per-page under Page → Template) adds the conventional title treatment.
- **Style variations** — see `styles/` (e.g. `twilight.json`) for alternate color palettes on top of the same design system.
- **No bundled patterns** — block-first composition. Core's own patterns stay registered, so the inserter is never empty; insert `aludra/*` blocks (or core blocks) directly into pages and templates, then add your own patterns as needed.

## Structure

```
aviendha/
├── style.css          # Theme header (metadata only)
├── theme.json          # Design system: color, typography, spacing, layout
├── functions.php       # Theme setup, 'menu' template part area, WooCommerce hooks
├── templates/          # FSE templates (index, single, page, page-with-title, archive, search, 404, WooCommerce: single-product, archive-product, product-search-results, coming-soon)
├── parts/               # header.html, header-dark.html, footer.html, add-to-cart layouts
├── styles/              # Style variations
├── assets/
│   ├── logos/           # Rose logo mark (SVG)
│   └── css/             # WooCommerce override stylesheet (enqueued conditionally)
├── docs/                # Contributor notes (not shipped in the theme zip)
└── languages/           # Translations (text domain: aviendha)
```

## Theme Integration for Aludra

The Aludra mega-menu block requires its host theme to register a `menu` template part area. Aviendha does this in `functions.php` via the `default_wp_template_part_areas` filter, so mega menu template parts created in the Site Editor appear under **Appearance → Editor → Patterns → Template Parts → Menus**.

## Development

```bash
composer install
composer run lint       # php-parallel-lint syntax check
composer run wpcs:scan   # PHPCS against phpcs.xml
composer run wpcs:fix    # PHPCBF auto-fix
```

No JS build step is required — the theme ships no bundled JavaScript.

## License

GNU GPL v3 (or later). See `LICENSE.md`.
