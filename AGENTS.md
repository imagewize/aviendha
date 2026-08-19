# Repository Guidelines

Aviendha is a lean **Full Site Editing (FSE) starter theme** for WordPress (WP 6.6+, PHP 8.0+, no build
tools — direct HTML block markup and PHP), designed to be forked and customized — similar to Sage in
classic theming. `theme.json` is the single source of truth for colors, typography, spacing, and layout.
Unlike Imagewize's Elayne theme, Aviendha ships **no bundled patterns** — content is composed directly
from blocks (core blocks or the Aludra block library). It serves as the base for themes like Ixian.

## Project Structure & Module Organization

- Root is a WordPress block theme; `style.css` holds theme metadata only, `theme.json` holds global
  styles.
- Full templates live in `templates/`, template parts in `parts/` (header/footer only).
- `page.html` (default) omits `post-title` since most pages get their title from a block's own
  heading; use `page-with-title.html` (selectable per-page under Page → Template) for pages that
  want the conventional title treatment.
- Style variations live in `styles/` (e.g. `twilight.json`).
- Shared assets live under `assets/` (`logos/` for the rose mark, `css/` for the conditional
  WooCommerce stylesheet).
- Reusable PHP lives in `functions.php` — keep it there, not scattered across templates.
- Translations live in `languages/` (text domain: `aviendha`).
- **No `docs/` or `designs/` directory here.** Planning documents, roadmaps and HTML design mockups
  live in the `imagewize/imagewize.com` repo under `docs/aviendha/` and `designs/aviendha/`, the
  same per-project layout Aludra, Elayne and Nynaeve use. This repo is public and distributable, so
  mockups carrying client names and roadmaps of unshipped work do not belong in it, and a second
  copy of a design file only drifts from the first.
- **That repo is private — Imagewize team only.** Outside contributors cannot read it, so never
  point one at a document there or write a comment that assumes the reader can open it. Anything an
  outside contributor needs belongs in this repo, in `readme.txt`, `CHANGELOG.md` or a code
  comment; durable rationale for a change belongs in its commit message. Team members clone
  `imagewize.com` next to this repo and read those documents locally.

## Build, Test, and Development Commands

- No JS build pipeline. Activate by placing the folder in `wp-content/themes/aviendha/` and
  enabling it in WP Admin, or `wp theme activate aviendha`.
- `composer install` then `composer run lint` / `composer run wpcs:scan` / `composer run wpcs:fix`.
- Regenerate translations when strings change: `wp i18n make-pot . languages/aviendha.pot`.
- **Testing unreleased changes: sync, don't release.** The theme is a pinned Composer dependency
  on the local demo site (`~/code/imagewize.com/demo`, subsite
  `http://demo.imagewize.test/aviendha/`), not a symlink.
  
  Sync to the demo site by running this **from anywhere**, always passing the theme working copy
  as the explicit third (source) argument — do **not** `cd` into the demo site first:
  ```bash
  SITE_ROOT=/Users/j/code/imagewize.com/demo/web/app \
    bash ~/code/wp-ops/scripts/rsync-package-to-site.sh theme aviendha /Users/j/code/aviendha
  ```

  **Critical — omitting that source argument wipes the theme.** The script defaults the source to
  `$PWD`, so running it from inside the demo site rsyncs the whole Bedrock site *into*
  `themes/aviendha/` and, because the sync uses `--delete --delete-excluded`, deletes the real
  theme. Preview with `--dry-run` (before the `theme` argument) when unsure; if it shows deletions
  of WordPress core (`web/wp/...`) or Bedrock files (`.env`, `config/`), the source is wrong — stop.
  `composer update` on that site restores the released version. See CLAUDE.md → *Testing on the
  demo site* for the canonical, fuller version of this workflow (keep the two in step).
  Do not commit a sync script here — Theme Check rejects a theme that ships a `.sh` file.
- **Releases** are packaged by `.github/workflows/create-release.yml` (`zip -x@.distignore`) on
  publish. Keep `.distignore` and `.gitattributes` (`export-ignore`) in step so the release zip
  and source archives contain the same files.
- **CI**: `wpcs.yml` (PHPCS, WordPress standard) on pull requests, `theme-check.yml` (WordPress
  theme review action, accessibility suite included) on pull requests and pushes to `main`. Run
  `composer run wpcs:scan` locally before pushing — it uses the same standard.

## Coding Style

- Follow WordPress PHP Coding Standards (enforced via `phpcs.xml`).
- Block markup in `templates/*.html` and `parts/*.html` is real, hand-authored block markup — not
  pattern references. Keep attributes minimal; don't copy inline styles that theme.json presets
  already provide.
- Color and spacing preset slugs in `theme.json` (`base`, `contrast`, `secondary`, `main`,
  `primary`, `accent`, `tertiary`, `border-light`; `small`, `medium`, `large`, etc.) are referenced
  by Aludra's own block patterns — don't rename them without checking `aludra/patterns/*.php`.
- **Borders on form controls use `--wp--custom--color--control-border`, not `border-light`.**
  `border-light` is a decorative hairline at 1.25:1 against `base` — correct for card edges, group
  separators and rules, and far too faint for anything a user has to find and operate. WCAG 2.1 AA
  (1.4.11) wants 3:1 on a control's boundary, which is what `control-border` is for. Both style
  variations define it; a new variation must too.
- **Don't remove a focus outline.** If a focus treatment needs to change, replace the outline with
  another outline — `outline: 2px solid` `primary` at a 2px offset is the theme's pattern. Swapping
  a 1px border colour in place of `outline: none` is not enough to satisfy 2.4.7, especially at the
  border weights this theme uses.
- **Text colours clear 4.5:1 against every ground they land on.** `tertiary` is usually the tighter
  of the two grounds, not `base` — check muted greys against it before assuming they pass.

## Version Management

Bumping the theme version means updating **four files** in sync (CLAUDE.md carries the same list —
keep the two in step):

1. `CHANGELOG.md` — add a new version section
2. `readme.txt` — update the `Stable tag` header and add a changelog entry
3. `style.css` — update the `Version` header
4. `package.json` — update `version`

`style.css` is the version WordPress actually reads and the only one that affects an installed
site; the other three keep the repo, the WP.org listing and the release tooling honest. Check all
four before tagging.

**License:** Aviendha uses the MIT License (see `LICENSE.md`).

## Commit & Pull Request Guidelines

- **Never mention AI tools or add AI attribution trailers in commit messages or PR bodies.**
  This includes removing any "Generated by Mistral Vibe" or "Co-Authored-By: Mistral Vibe" lines.
- Prefer atomic commits — one commit per file or logically-related group of files.
- Keep commit messages short and focused on the change, not the process behind it.
