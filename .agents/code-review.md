# Code review rules — Aviendha

Aviendha is a lean full-site-editing **starter theme**: no bundled patterns, no
JS build step, no runtime Composer or npm dependencies. `theme.json`, the
templates in `templates/`, and the style variations in `styles/` are the
product. These rules are read by the `code-review` skill
(`.agents/skills/code-review/SKILL.md`) and checked before its generic
checklists. They stand on their own; `CLAUDE.md` has more background but is
not required.

## Facts

- Text domain: `aviendha`.
- No JS build step. `package.json` exists only for the `@imwz/wp-pattern-sentinel`
  pattern-validation harness (`npm run validate*`) — it is not a build, and the
  theme ships no bundled JavaScript or CSS.
- **Aviendha ships no patterns itself** (see CLAUDE.md "Why no patterns"). A
  missing `patterns/` directory is the design, not a gap. Forks (e.g. Ixian)
  add their own; the validation harness in `package.json` exists for them.
- `templates/page.html` deliberately **omits** `post-title` — most pages are
  composed from blocks (often Aludra blocks) whose own heading serves as the
  title. `templates/page-with-title.html` is the variant that includes it.
  Flagging `page.html` for a "missing" title is a false positive.
- Deliberately unshipped: `cart.html`, `checkout.html`, `taxonomy-product_cat.html`.
  WooCommerce provides its own block-theme defaults for these. Not a gap unless
  there's an actual customization need.
- `theme.json` color and spacing slugs (`base`, `tertiary`, `border-light`,
  `contrast`, `secondary`, `main`, `primary`, `accent`; `2-x-small`, `x-small`,
  `small`, `medium`, `large`, `x-large`) are a contract with the separate
  **Aludra** plugin's block styles and patterns, which reference them by slug.
  Renaming or removing one is a breaking change this repo cannot verify locally
  — flag it, don't wave it through.
- `.github/workflows/template-rename.yml`'s `paths-ignore` deliberately excludes
  `.github/**` (default `GITHUB_TOKEN` has no `workflow` scope) and
  `README.md`/`CHANGELOG.md`/`readme.txt`/`AGENTS.md`/`CLAUDE.md` (a fork keeps
  Aviendha's lineage in these). Not a bug.
- `bin/sync-demo.sh` is intentionally gitignored, not missing — Theme Check's
  `File_Check` rejects a theme that ships a `.sh` file, so the demo-sync script
  lives in the separate `wp-ops` repo.

## Audit targets

- `templates/` — `/code-review page` audits `templates/page.html`; a bare
  template name matches `templates/<name>.html`.
- `parts/` — `header` or `footer` audits `parts/header.html` / `parts/footer.html`.
- `styles/` — a style variation name (e.g. `twilight`) audits `styles/<name>.json`.

## Review

- `.github/workflows/*.yml` — encodes the packaging/rename contracts CLAUDE.md
  documents; a change here has effects beyond this repo.
- `.distignore`, `.gitattributes` — must stay in step (see Version Management /
  Release packaging in CLAUDE.md); a file excluded from one but not the other
  is a finding.
- `functions.php` — in particular the `default_wp_template_part_areas` filter
  that registers the `menu` template part area for Aludra's mega-menu.

## Commands

```bash
composer run lint       # php-parallel-lint, whole repo
composer run wpcs:scan  # PHPCS against phpcs.xml, WordPress standard
```

No PHPUnit suite and no JS build/lint — do not report either as missing.
`npm run validate` (wp-pattern-sentinel) needs a live Trellis site and a
browser session; it is not part of this review and should not be simulated.

## Disable core rules

- **Blocks** checklist section (block.json / build-output consistency,
  `viewScript` enqueueing, etc.) — Aviendha ships no blocks of its own.
- **Theme → WordPress auto-registers `patterns/`** — only relevant once a fork
  adds a `patterns/` directory; its absence here is not a finding.

## Rules

### theme.json

- A color or spacing **slug** rename/removal is flagged even without local
  evidence of breakage — the consumer (Aludra) is a separate repo.
  Why: a mega-menu or other Aludra pattern referencing
  `var:preset|color|secondary` silently loses styling the moment the slug
  disappears from this theme's palette, with nothing in this repo's CI to
  catch it.

### Templates

- `page.html` must **not** gain a `post-title` block; that belongs only in
  `page-with-title.html`. A change that adds one to `page.html` is a finding,
  not a fix.
  Why: it would duplicate the title against a hero block's own `<h1>` on every
  page using the default template.
- A `wp:template-part` reference resolves to a file in `parts/` (only
  `header.html` and `footer.html` ship) or to a `menu` part the Site Editor
  manages in the database — never to a file, since no `menu` template part
  file ships (see CLAUDE.md "Aludra mega-menu integration").

### Version bumps

- If `style.css`'s `Version` header moved, `CHANGELOG.md`, `readme.txt`
  (`Stable tag` + changelog entry) and `package.json`'s `version` all moved
  with it — or none did.
  Why: `style.css` is the only one of the four WordPress actually reads; a
  partial bump leaves the repo, the WP.org listing, or the release tooling
  telling a different version story than what ships.

## Audit rules

- `templates/page.html` and `templates/page-with-title.html` differ by exactly
  the `post-title` block and nothing else drifting silently between them.
- Every `styles/*.json` variation overrides `settings.color.palette` using the
  same slugs as the root `theme.json` — a variation introducing or dropping a
  slug breaks the Aludra contract for any page that switches variations.
- `.distignore` and `.gitattributes` `export-ignore` entries name the same set
  of paths (allowing for the different exclusion dialects — see comments in
  each file).

## Audit context

```bash
git grep -n "post-title" -- templates/
git grep -n "var:preset|color\|var:preset|spacing" -- templates/ parts/ styles/
```
