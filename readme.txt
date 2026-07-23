=== Aviendha WordPress Theme ===
Contributors: Rhand
Tags: e-commerce, full-site-editing, custom-colors, custom-logo, custom-menu, editor-style, featured-images, grid-layout, template-editing, translation-ready, wide-blocks
Requires at least: 6.6
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 1.6.0
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

= 1.6.0 =
* Added: GitHub release workflow that attaches a theme zip to every published release, with a `.distignore` and matching `.gitattributes` keeping dev-only files out of the package
* Added: `bin/sync-demo.sh`, a development helper that pushes the working copy into a local Bedrock site so unreleased changes can be tested without cutting a release (not shipped in the theme zip)
* Fixed: `package.json` version drifted behind the theme version and now tracks it

= 1.5.4 =
* Change: footer navigation no longer collapses into a hamburger menu — it renders as a plain list at every width, stacking vertically under 600px

= 1.5.3 =
* Fixed: the dark header's mobile menu showed white text on a white overlay — the navigation block sets no background, so core paints the open overlay white while the block's `base` text color keeps the links and close button white. The override is scoped to the open menu only, since above 600px core reuses the same element for the inline desktop nav.
* Change: organize `style.css` into numbered sections (template parts, header, footer) with a table of contents.

= 1.5.2 =
* Add: footer parity with the redesign mockup (Step 14) — `.foot` class with constrained layout, tertiary background, and a `.shell` inner group with flex layout matching the mockup's wrapped row
* Fixed: the footer's constrained layout was never applied — same class of bug as 1.5.1's header fix, a stray `}` put the `layout` attribute outside the parsed JSON, so it rendered `is-layout-flow` and the branding/copyright sat flush against the viewport edges
* Fixed: a visible gap between the last section and the footer — core's global styles add a 24px top margin to every top-level block, including the `wp-block-template-part` wrapper around header/footer, which a margin reset on the inner block couldn't reach; reset generally for all template parts
* Fixed: the header CTA's text was invisible on hover — the button's `has-base-color` markup carries a core `!important` rule the hover state's color override couldn't beat

= 1.5.1 =
* Fixed: the 1.5.0 header styling was never live — `style.css`'s theme header comment was missing its closing `*/`, so every rule that release added sat inside the comment and was discarded by the parser
* Fixed: the dark header now sits in the centered content shell — its layout attribute was nested inside the `style` object, so WordPress never applied the constrained layout and the wordmark/navigation stretched to the viewport edges
* Fixed: sticky positioning now works — WordPress wraps a header-area template part in its own element that is exactly as tall as the header, leaving a sticky child no scroll range, so the wrapper is now sticky as well
* Add: "Start a project" CTA button in the dark header, styled as a `mono` font pill, balancing the wordmark/navigation/button row against the redesign mockup
* Change: drop the redundant `tagName` attribute from every header template-part invocation; the part already emits its own `<header>`

= 1.5.0 =
* Header parity: `header-dark` masthead is now sticky, its wordmark uses the `display` font family (Bricolage Grotesque, 800 weight, tightened letter-spacing), and the site logo is hidden in favor of the text wordmark. Homepage now uses the dark header instead of the light one.

= 1.4.0 =
* Add `xx-small`, `x-small`, `base`, and `display` font-size presets to `theme.json`, rounding the scale out to 9 named tiers (xx-small through display) matching the naming convention used by Ollie and Elayne, so blocks (Aludra) can reference a named size instead of hardcoding clamp()/rem/px values.
* Change body text default font-size from `medium` to `base`, matching Ollie's/Elayne's convention where `base` is the body-text tier.

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

= Bricolage Grotesque =
* License: SIL Open Font License, Version 1.1
* Source: https://fonts.google.com/specimen/Bricolage+Grotesque
* License URI: https://scripts.sil.org/OFL
* Used in: `assets/fonts/bricolage-grotesque-variable.woff2`
* Purpose: Display font family (headings), self-hosted as a single variable-font file.

= JetBrains Mono =
* License: SIL Open Font License, Version 1.1
* Source: https://fonts.google.com/specimen/JetBrains+Mono
* License URI: https://scripts.sil.org/OFL
* Used in: `assets/fonts/jetbrains-mono-variable.woff2`
* Purpose: Mono font family (eyebrows/labels/metrics), self-hosted as a single variable-font file.

The SIL Open Font License is GPL-compatible.

== Copyright ==

Aviendha WordPress Theme, (C) 2026 Jasper Frumau
Aviendha is distributed under the terms of the GNU GPL v3 (or later).
