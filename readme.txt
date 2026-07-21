=== Aviendha WordPress Theme ===
Contributors: Rhand
Tags: e-commerce, full-site-editing, custom-colors, custom-logo, custom-menu, editor-style, featured-images, grid-layout, template-editing, translation-ready, wide-blocks
Requires at least: 6.6
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 1.3.0
License: GNU General Public License v3.0 (or later)
License URI: https://www.gnu.org/licenses/gpl-3.0.html

== Description ==

Aviendha is a lean full-site-editing theme for WooCommerce stores. Unlike Imagewize's Elayne theme,
it ships no bundled patterns — `theme.json`, WooCommerce block templates, and style variations
provide the design system, and page content is composed directly from blocks. It works with any
blocks, but is built to pair with the [Aludra](https://github.com/imagewize/aludra) block library
(mega menu, carousel, FAQ tabs, and more).

Aviendha recommends, but does not require, the Aludra plugin. It requires WooCommerce for the
store templates.

= Key Features =

* Solid Full Site Editing (FSE) design system via `theme.json`
* WooCommerce block templates for single product and product archive
* Style variations (see `styles/`)
* No theme-level patterns — block-first composition
* Pairs with the Aludra block library (mega menu, carousel, FAQ tabs, and more)
* Translation-ready

== Installation ==

1. Upload the theme folder to `/wp-content/themes/`, or install via Appearance → Themes → Add New.
2. Activate the theme through the 'Appearance' menu in WordPress.
3. Optionally install and activate the Aludra plugin for mega menu, carousel, and other blocks.
4. Install and activate WooCommerce for store functionality.

== Changelog ==

= 1.3.0 =
* Add `display` (Bricolage Grotesque) and `mono` (JetBrains Mono) font families to `theme.json`, self-hosted as variable-font woff2 files; headings now use `display`

= 0.4.0 =
* Add `page-with-title.html` custom template (selectable under Page → Template) for standard content pages that want the conventional post-title treatment.
* `page.html` (default) no longer prints post-title, since most pages get their title from a block's own heading.

= 0.3.0 =
* Drive page/single content width and padding from theme.json's global spacing rule instead of alignwide, for consistent edge-to-edge padding.
* Replace the Lucide rose icon with the Ionicons rose icon (via Blade Icons) as the theme's logo mark.

= 0.2.0 =
* Remove hardcoded Aludra block from header.html so the theme works with core blocks alone, as documented.

= 0.1.0 =
* Initial scaffold: theme.json design system, WooCommerce templates, style variation, rose logo mark.

== Third-Party Libraries ==

= Ionicons (via Blade Icons) =
* License: MIT License
* Source: https://blade-ui-kit.com/blade-icons/ionicon-rose
* License URI: https://github.com/driesvints/blade-icons/blob/main/LICENSE.md
* Used in: `assets/logos/aviendha-rose-primary.svg` and `assets/logos/aviendha-rose-outline.svg`
* Purpose: The "rose" icon is used, unmodified except for recoloring, as the theme's logo mark.

The MIT License is GPL-compatible.

== Copyright ==

Aviendha WordPress Theme, (C) 2026 Jasper Frumau
Aviendha is distributed under the terms of the GNU GPL v3 (or later).
