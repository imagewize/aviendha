<p align="center">
  <img src="assets/logos/aviendha-rose-primary.svg" alt="Aviendha Logo" width="128" height="128">
</p>
<div align="center">
<h1>Aviendha</h1>

A lean full-site-editing theme for WooCommerce stores.
</div>

## Description

Aviendha is a full-site-editing (FSE) WordPress theme for WooCommerce stores, built as a general-purpose e-commerce base for small and medium businesses. Unlike Imagewize's [Elayne](https://github.com/imagewize/elayne) theme, it ships **no bundled patterns** — `theme.json`, WooCommerce block templates, and style variations provide the design system, and pages are composed directly from blocks.

Aviendha pairs with the [Aludra](https://github.com/imagewize/aludra) block library (mega menu, carousel, FAQ tabs, and more), but doesn't require it — the theme is a plain block theme that works with core blocks and any block plugin.

> **Lineage:** Aviendha is a companion theme to Imagewize's [Elayne](https://github.com/imagewize/elayne) and [Nynaeve](https://github.com/imagewize/nynaeve) themes. Like Elayne, it ships no custom blocks of its own — content blocks come from the shared [Aludra](https://github.com/imagewize/aludra) plugin, per WordPress.org's theme-review rules. (Nynaeve is a separate case: it registers its own blocks and doesn't use Aludra.)

## Requirements

- WordPress 6.6+
- PHP 8.0+
- WooCommerce (for store templates)
- Aludra plugin (recommended, not required)

## Features

- **Design system** — `theme.json` defines the color palette, typography, spacing, and border radii; color/spacing slugs match what Aludra's own block styles and patterns expect (`base`, `contrast`, `contrast-2`, `main`, `primary`, `accent`, `tertiary`, `border-light`).
- **WooCommerce templates** — `templates/single-product.html` and `templates/archive-product.html` are theme-provided; cart, checkout, and category-archive templates fall back to WooCommerce's own block-theme defaults.
- **Style variations** — see `styles/` (e.g. `twilight.json`) for alternate color palettes on top of the same design system.
- **No patterns** — block-first composition. Insert `aludra/*` blocks (or core blocks) directly into pages and templates.

## Structure

```
aviendha/
├── style.css          # Theme header (metadata only)
├── theme.json          # Design system: color, typography, spacing, layout
├── functions.php       # Theme setup, 'menu' template part area, WooCommerce hooks
├── templates/          # FSE templates (index, single, page, archive, search, 404, WooCommerce)
├── parts/               # header.html, footer.html
├── styles/              # Style variations
├── assets/
│   ├── logos/           # Rose logo mark (SVG)
│   └── css/             # WooCommerce override stylesheet (enqueued conditionally)
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

GPL v3 or later. See `LICENSE.md`.

- Logo: the [Ionicons](https://ionic.io/ionicons) "rose" icon (via [Blade Icons](https://blade-ui-kit.com/blade-icons/ionicon-rose)), used unmodified except for recoloring, under the MIT License (GPL-compatible). See `readme.txt` for full attribution.
