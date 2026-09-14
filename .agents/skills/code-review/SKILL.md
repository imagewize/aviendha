---
name: code-review
description: Review a branch diff or GitHub PR, or audit a block, pattern, template or path in place, in any WordPress plugin, theme or site — correctness, WordPress security, and the project's own rules from .agents/code-review.md
user-invocable: true
allowed-tools:
  - read_file
  - grep
  - bash
  - ask_user_question
  - todo
metadata:
  version: "1.1.0"
  source: "github.com/imagewize/mistral-agents skills/code-review"
---

# Code Review

Reviews a WordPress project — plugin, theme, block theme, Sage theme or Bedrock
site — either as a branch diff or as an in-place audit of one block, pattern,
template or path.

The review has two halves. The generic half — correctness, WordPress security,
architecture — lives in this file and is the same for every project. The half
that catches most regressions lives in the project's **rules file**, because in
WordPress code most regressions are rule violations, not logic bugs: a stylesheet
fix shipped without a block `version` bump keeps serving cached CSS, a pattern
with a hand-edited wrapper class invalidates in the editor, a new block missing
from one enumeration never registers. This file knows none of those rules for a
particular project. The rules file does.

**No tool may write to the working tree during a review. Report; do not fix.**
Print the report in the conversation. Write it to a file only when the user asks,
and never inside the repository under review.

## Modes

The skill runs in one of two modes, chosen from the first argument.

- **Branch mode** (default) — review what this branch changed against a base.
  Works from the diff; the unit of review is the added line.
- **Audit mode** — review a block, pattern, template, directory or file **as it
  stands**, with no base and no diff. This is the mode for "review the hero
  block" while sitting on `main`. The unit of review is the whole file, and the
  checks that ask "did this change bump/update X" become "are X and Y consistent
  with each other right now".

## Tool use

Every shell command may stop the review for an approval, and each part of a pipe,
`&&`, `;` or `$(…)` is approved separately. Keep the review moving:

- **Read files with `read_file`**, using its offset and limit for line ranges.
  Do not read with `sed -n`, `cat`, `head` or `tail`.
- **Search tracked files with `git grep`.** The `grep` tool is fine for source,
  but it skips `build/` and `dist/`, so it cannot see a committed `build/block.json`.
- **One plain command per call.** No shell loops, no `$(…)`, no `python3`,
  `php -r` or `node -e` one-liners, and no `cd <repo> &&` prefix — the session
  already runs in the repository.
- **One command across all files beats a loop over them**: `git grep -L` lists
  files missing a string, `git grep -c` counts per file.

The commands this skill runs are listed under **Setup** for the project allowlist.

## Instructions

### Phase 0: Preparation

1. **Load the project rules.**

```bash
ls -d .agents/code-review.md .vibe/code-review.md AGENTS.md CLAUDE.md
```

   Read the first rules file that exists — `.agents/code-review.md`, else
   `.vibe/code-review.md` — in full. It is authoritative for this project: its
   **Facts** override detection, its **Disable core rules** entries are not
   checked, and its **Rules** are checked before anything in this file.

   `AGENTS.md` is usually already in context (Vibe loads it automatically); if it
   is not, read it. With no rules file, apply what `AGENTS.md` — or failing that
   `CLAUDE.md` — states as a requirement, and nothing it merely describes.

   The report names where the project rules came from.

2. **Build the project profile.** Detect the project from its files; never fill
   in a fact you did not read.

```bash
git ls-files -- style.css theme.json composer.json package.json readme.txt config/application.php 'templates/*.html' 'parts/*.html'
git ls-files -- '*block.json'
git grep -l "Plugin Name:" -- ':(glob)*.php'
```

   Then `read_file` what exists: the first 30 lines of `style.css` or of the main
   plugin file, `composer.json`, the `scripts` of `package.json`, and the
   `settings` of `theme.json`.

   | Signal | Project type |
   |---|---|
   | A root PHP file with a `Plugin Name:` header | plugin |
   | `style.css` with a `Theme Name:` header | theme |
   | …plus `templates/*.html` or `parts/*.html` | block theme |
   | `composer.json` requires `roots/acorn` | Sage / Acorn theme |
   | `block.json` files | ships blocks |
   | `config/application.php` and `web/app/` | Bedrock site — review only the project's own code under `web/app/` and `config/` |

   Types combine: a block plugin is a plugin that ships blocks.

   | Fact | Source |
   |---|---|
   | Minimum PHP | `Requires PHP:` header, else `require.php` in `composer.json` |
   | Minimum WordPress | `Requires at least:` header |
   | Text domain | `Text Domain:` header; in a Sage theme, the domain its existing `__()` calls use |
   | Presets | `theme.json` `settings` — and the parent theme's, for a child theme |
   | Lint and test commands | `scripts` in `composer.json` and `package.json`; `phpcs.xml(.dist)`, `pint.json`, `phpstan.neon(.dist)`, `phpunit.xml(.dist)` |
   | Committed build output | `git ls-files -- '*/build/block.json'` returns files |

   A fact that cannot be found is **unknown**. Rules that depend on it are not
   checked, and the report says so under "not checked". Never assume a PHP or
   WordPress version.

   Print the profile before reviewing:

```
PROJECT PROFILE
Type: block plugin         PHP >= 7.4      WP >= 6.5
Text domain: acme          Build output committed: yes
Lint/test: composer run lint, composer run test
Rules: .agents/code-review.md
```

3. **Fetch latest changes** (branch mode only):

```bash
git fetch origin
```

4. **Resolve the argument mechanically, then pick a mode.** The argument is the
   text after `/code-review` in the message that invoked the skill. Let `TOKEN`
   be its first word.

   **Do not interpret `TOKEN` as English. Run these commands and let them decide.**
   Block, pattern and template names are ordinary words — `about`, `slide`,
   `hero`, `contact` — so a token that reads like a question is far more likely
   to be a target name. `/code-review about` audits the `about` block; it is
   **not** a request to explain the skill.

   Substitute the token literally:

```bash
ls -d <TOKEN> <target-dir>/<TOKEN>                 # a path, or a named target?
git rev-parse --verify --quiet <TOKEN>^{commit}    # a git ref?
git rev-parse --abbrev-ref origin/HEAD             # default base branch
```

   **Named target directories** come from the rules file's **Audit targets**.
   Without one: every directory that holds block folders (the parent of each
   `<block>/src/block.json` or `<block>/block.json`), and for a theme
   `patterns/<TOKEN>.php`, `templates/<TOKEN>.html` and `parts/<TOKEN>.html`.

   Then, in this order:

   - No argument at all → **branch mode** against the default base branch.
   - `TOKEN` is `--help`, `-h` or `help` → print the Modes, the usage examples
     and the named targets (`ls <target-dir>`). Review nothing. This is the
     **only** way to ask for usage; every other token is a review target.
   - `TOKEN` is all digits → **branch mode** on that GitHub PR:
     `gh pr diff <TOKEN>` for the diff and `gh pr view <TOKEN>` for the title,
     body and base branch. Use the PR body as review context automatically.
   - `TOKEN` is a named target → **audit mode** on it.
   - `TOKEN` is an existing path → **audit mode** on that path.
   - `TOKEN` resolves as a git ref → **branch mode** against it.
   - `TOKEN` is **both** a target/path and a ref → ask which was meant. Do not guess.
   - `TOKEN` is none of them → say so, list the named targets, and stop. Do not
     fall back to the default branch, and do not answer the token as a question.

   Everything after the first token (or after `--`) is PR/review context: use it
   to judge intent and scope. When passing both a target and a description, put
   the target first or separate the description with `--`.

   ```
   /code-review                                   # branch mode vs default base
   /code-review --help                            # usage; reviews nothing
   /code-review origin/develop                    # branch mode vs origin/develop
   /code-review 51                                # review GitHub PR #51
   /code-review hero                              # audit the hero block or pattern
   /code-review patterns/page-home.php            # audit one file
   /code-review includes/ -- why do settings reset on save
   ```

   Only branch mode needs `git fetch origin` — skip step 3 in audit mode.

### Phase 1: Discover Files

5. **Branch mode — list changed files** (names only; do not pull full diffs yet):

```bash
git diff --name-status origin/main...HEAD     # or <base>...HEAD
git diff --name-status                        # unstaged
git diff --cached --name-status               # staged
```

   If this yields nothing, the branch is identical to its base. Say so, stop,
   and point out that auditing in place is `/code-review <target>`.

5b. **Audit mode — enumerate tracked files under the target**:

```bash
git ls-files -- <target>
```

   Use `git ls-files`, not `find` or `ls -R`: it skips `node_modules/` and
   anything else untracked.

   Then gather the context a target cannot be judged without — in audit mode
   these files are part of the review even when they sit outside the target:

```bash
git grep -ln "<target-name>" -- ':!<target>'     # what references it
git log --oneline -10 -- <target>                # recent history
```

   Add the commands under the rules file's **Audit context**.

### Phase 2: Filter and Prioritize

6. **Categorize every file as REVIEW or SKIP.**

**SKIP:**
- `vendor/**`, `node_modules/**`.
- Build output — `build/**`, `dist/**`, `public/build/**`, `*.asset.php`,
  source maps, minified files — **except** a committed `build/block.json`, which
  is metadata WordPress reads and **must** be reviewed.
- Lockfiles: `package-lock.json`, `composer.lock`, `yarn.lock`, `pnpm-lock.yaml`.
- Binaries: images, fonts, archives.
- Deleted files (status `D`) — note them, don't diff them.
- Whatever the rules file lists under **Skip**.

The same list applies in audit mode: build output under the target is counted as
skipped, not listed as reviewed.

**Flag as a finding instead of skipping:**
- Files that should never be committed: `.env`, `auth.json`, logs, database
  dumps, credentials, OS and IDE files.
- Any change inside third-party code the rules file marks as vendored.

**REVIEW:**
- PHP, including Blade templates.
- JS, JSX, TS, TSX; CSS and SCSS.
- `block.json`, `theme.json`, `styles/*.json`, `templates/`, `parts/`, `patterns/`.
- Config: `composer.json`, `package.json`, `phpcs.xml(.dist)`, `phpunit.xml(.dist)`,
  `.distignore`, `.gitattributes`, `.github/workflows/*`.
- Docs: `readme.txt`, `README.md`, `CHANGELOG.md`, `AGENTS.md`, `CLAUDE.md`.
- Whatever the rules file lists under **Review**.

7. **Print the categorization** before reviewing:

```
FILES TO REVIEW (X):
- blocks/hero/src/save.js (Modified)
- patterns/section-hero.php (Added)

FILES SKIPPED (Y):
- blocks/hero/build/index.js (build output)
- composer.lock (lock file)
```

### Phase 3: Correctness Review

8. **Branch mode — diff each REVIEW file**:

```bash
git diff origin/main...HEAD -- <file_path>
```

   **Focus on added lines** (`+`). Review removed lines only for context. Open
   the full file only when the surrounding code is needed to judge the change.

9. **Audit mode — read each REVIEW file in full.** There is no diff to narrow
   the scope. Read a block's `block.json`, edit, save, view and render files and
   its stylesheets as a set, and judge whether they agree with each other. Apply
   the **Audit Checklist** in addition to the shared ones. Age is not a defect: do
   not report a deliberate old decision as a finding just because the code is not
   how you would write it today.

10. **Apply the checklists in this order:** the rules file's **Rules** (and, in
    audit mode, its **Audit rules**), then the sections of the **WordPress
    Checklist** that match the profile, then the **General Checklist**. Skip
    anything the rules file disables. Surface only failing or
    attention-required items. If everything passes: "Checklist: no issues found."

11. **Run the linters and tests; do not simulate them.** Use the commands from
    the profile and the rules file. They are fast, they are ground truth, and a
    reviewer guessing at their output is strictly worse than the tool. Report what
    they actually printed. If one cannot run (no `vendor/`, no `node_modules/`),
    say so rather than substituting an opinion about what it would have said.

### Phase 4: Architecture Review

12. **Branch mode** — assess the change as a whole: does it cohere as one
    feature or fix; does it duplicate an existing block, pattern, template or
    helper; does it respect the project's boundaries (bootstrap vs. block source
    vs. pattern markup vs. templates); does it make the next change harder.

    **Audit mode** — assess the target's place in the project: is it reachable at
    all (registered, enabled, included, discoverable); does it duplicate another
    target's job; do the patterns and templates that use it still match its
    output; is anything in it dead — an attribute nothing reads, a style variation
    no markup emits, a stylesheet rule for a class nothing renders.

### Phase 4b: Verify Findings

13. **Try to disprove every candidate finding before reporting it.** A review's
    value is set by its false-positive rate: one confident wrong finding costs
    more trust than three missed nits.

    For each candidate, write the **failure scenario** — concrete inputs or state
    leading to a concrete wrong result: "a page saved before this change has no
    `is-layout-grid` class on the wrapper, so opening it in the editor invalidates
    the block." If you cannot write one, the finding is a preference, not a defect.
    Drop it or demote it to an observation.

    Then go looking for what makes it wrong — the guard clause further up the
    file, the default in `block.json`, the deprecation entry, the caller that
    already sanitizes, the exception the rules file documents. Label what survives:

    - **CONFIRMED** — verified in the code; the failure scenario holds.
    - **PLAUSIBLE** — depends on a caller, saved content or a runtime condition
      not visible here. Say what would settle it.

    Never report a finding whose failure scenario you could not write, and never
    upgrade PLAUSIBLE to CONFIRMED to sound more certain.

### Phase 5: Summary Report

14. **Report** in this shape. No per-file narration unless asked.

```
REVIEW SUMMARY
==============
Target: <branch pair, PR, or audit target>
Project: <type> — rules from <rules file | AGENTS.md | none>
Files reviewed: X
Files skipped: Y

CRITICAL ACTION ITEMS:
- [CONFIRMED] file:line — what is wrong, and what breaks because of it

IMPORTANT:
- [PLAUSIBLE] file:line — ... (and what would settle it)

ARCHITECTURE OBSERVATIONS:
- ...

OVERALL ASSESSMENT: Approve | Request Changes | Comment
Not checked: ...
```

Order findings most-severe first, and carry each one's CONFIRMED/PLAUSIBLE label
into the report. A section with nothing in it is omitted, not filled, and checks
that passed are not listed — the report is for what needs attention.

The overall assessment follows from the CONFIRMED items alone. A PLAUSIBLE item
stays a question in the report: never restate it as a violation in the summary,
and never turn it into a required action.

In audit mode the target line names the target rather than a branch pair
(`blocks/hero (audit)`), "Files skipped" counts what was enumerated and excluded,
and the assessment reads `Healthy | Needs Work | Comment` rather than the PR verbs.

Every action item names a file and, where it exists, a line. An item with no
concrete failure behind it is noise — drop it.

**Assertion discipline.** State a check as done only if a command in this session
actually ran it. Listing a file under "Files reviewed" means it was read or
diffed, not that it was grepped for a line number. A sentence like "all patterns
that use it emit matching markup" is a claim about every one of those files —
either verify it across all of them with one command, or name the ones you checked:

```bash
git grep -L "defined( 'ABSPATH' )" -- 'patterns/*.php'    # pattern files missing the guard
git grep -c "wp-block-acme-hero" -- patterns/             # wrapper class count per file
```

When something could not be verified, list it under "Not checked" rather than
leaving the reader to assume it passed.

When the project has no rules file, add under the assessment: "No project rules
file — project-specific rules not checked." Offer to draft one from what the
review learned; if the user accepts, print it in the conversation.

---

## WordPress Checklist

Apply the sections that match the project profile. A rules file may disable any
item here.

### All PHP

- **Escape late**, at the point of output: `esc_html()`, `esc_attr()`,
  `esc_url()`, `wp_kses_post()`, and the `esc_html__()` family for translated
  strings. Values that are escaped by construction — `get_block_wrapper_attributes()`
  — may be echoed with a `phpcs:ignore` that says why.
- **Sanitize input** from `$_GET`, `$_POST`, `$_REQUEST`, `$_COOKIE`, `$_SERVER`:
  `wp_unslash()` first, then the matching `sanitize_*()` function. Option writes go
  through a sanitize callback.
- **Nonce and capability** on every state change: admin forms
  (`check_admin_referer()`), AJAX (`check_ajax_referer()`) and anything else
  (`wp_verify_nonce()`), each with `current_user_can()`. REST routes declare a
  `permission_callback`; `__return_true` is acceptable only for public reads.
- **SQL**: every variable goes through `$wpdb->prepare()`; `LIKE` values through
  `$wpdb->esc_like()`.
- **No** `extract()`, `eval()`, `unserialize()` of request data, or `include` of a
  path built from input.
- **i18n**: the profile's text domain everywhere; translatable strings are
  literals, never variables or concatenations; placeholders carry a
  `/* translators: */` comment; plurals use `_n()`.
- **Minimum versions**: no PHP syntax or function newer than the profile's
  minimum — named arguments, `match`, the nullsafe operator and constructor
  promotion need 8.0; enums and `readonly` properties 8.1; `readonly` classes 8.2.
  No WordPress function or `theme.json`/`block.json` key newer than the WordPress
  minimum; check the `@since` tag in core before flagging. If a minimum is unknown,
  do not flag against it.
- **Prefix or namespace** global functions, classes, constants, hooks and option
  names.
- Scripts and styles are enqueued, never printed as tags, and carry a version.

### Plugin

- A **direct-access guard** — `if ( ! defined( 'ABSPATH' ) ) { exit; }` — at the
  top of every PHP file that can be requested directly, including pattern and
  template files the plugin `include`s. Plugin Check flags files without one.
- WordPress does **not** auto-register a plugin's `patterns/` directory; the
  plugin's own loader decides which headers matter.
- **Release consistency**: if the version moved, the `Version:` header, any
  version constant, `readme.txt` `Stable tag` and its changelog entry, and
  `CHANGELOG.md` all agree — or none changed.
- New development-only files and directories are excluded from the distribution
  (`.distignore`, `.gitattributes` `export-ignore`).

### Theme

- WordPress auto-registers PHP files in a theme's `patterns/` directory (6.0+).
  Each needs `Title` and `Slug` headers; the slug is prefixed with the theme slug;
  every `Categories` value is a core category or one the theme registers.
- `wp:template-part` slugs resolve to files in `parts/`; templates referenced by
  name exist in `templates/`.
- In a child theme, `get_stylesheet_directory*()` for the child's files and
  `get_template_directory*()` for the parent's.

### theme.json and presets

- Every preset reference resolves — `var(--wp--preset--<type>--<slug>)` in CSS,
  `var:preset|<type>|<slug>` in block markup — against a preset `theme.json`
  defines (or its parent theme's), or a core default preset. Types: `color`,
  `gradient`, `font-size`, `font-family`, `spacing`, `shadow`, `aspect-ratio`,
  and `border-radius` when `settings.border.radiusSizes` exists (WordPress 6.9+).
- `var(--wp--custom--…)` resolves to a key under `settings.custom` (camelCase
  keys become kebab-case; nesting becomes `--`).
- Flag a reference only because it **does not resolve**. Never flag a namespace
  as invalid when `theme.json` defines it.
- No hard-coded development URLs (`.test`, `.local`, `localhost`) or attachment
  IDs from one install in templates, parts or patterns.
- Pattern and template markup extracted from a live page or written by hand has
  never been through the editor's `save()`. "It renders fine" is no evidence that
  it validates; ask whether it was opened in the editor or run through a validator.

### Blocks

- `block.json` is the single source of truth: blocks register from metadata, and
  attributes are not redeclared in JS.
- **Changing an existing block's `save()` output** without a `deprecated` entry
  invalidates content already saved on live sites. This is a critical finding.
  Dynamic blocks (`save` returns `null`) are exempt.
- Markup in patterns and templates that use the block matches its current `save()`
  output — wrapper class and support-generated classes included.
- WordPress uses the block's `version` as the version of its registered
  stylesheets, and of scripts whose `.asset.php` has none. A style or markup change
  without a `version` bump can keep serving cached CSS. Metadata-only changes —
  `category`, `keywords`, `title`, `description`, `icon` — change no output and
  need no bump.
- **Committed build output**: `src/block.json` and `build/block.json` agree, and a
  source change that affects output ships with regenerated `build/`. The build may
  reformat the JSON, so compare semantically (see Audit Checklist); a formatting
  difference alone is never a finding.
- `viewScript` and `viewScriptModule` are enqueued whenever the block is on the
  page, regardless of attributes. Assets needed only for some configurations are
  enqueued conditionally instead.
- `render.php` escapes every attribute it prints and uses
  `get_block_wrapper_attributes()` for the wrapper.
- `parent` and `ancestor` constraints still hold.
- Interactivity API: `supports.interactivity` is set, `data-wp-interactive` names
  a store the view module defines, and directives reference state, actions and
  callbacks that exist.

### Sage / Acorn

- Blade `{{ }}` escapes; `{!! !!}` prints raw and is only for values already
  escaped or known safe HTML. Raw post meta, options or request data in `{!! !!}`
  is a finding.
- Assets through the bundler helper (`@vite` / `Vite::asset()` in Sage 11), never
  hard-coded build paths.
- Queries and data preparation in View Composers or components, not in templates.

### Bedrock site

- Only project code is reviewed: custom themes, plugins and mu-plugins under
  `web/app/`, and `config/`. Composer-managed plugins and themes are skipped.
- No secrets committed: `.env` stays ignored; credentials come from environment
  variables.
- Production config keeps `WP_DEBUG_DISPLAY` off.

---

## Audit Checklist (audit mode only)

In audit mode nothing "changed", so the version rules turn into consistency rules.

### Is it reachable

- A block is registered: the `block.json` the project registers from exists
  (`build/block.json` when build output is committed), and the block appears in
  every enumeration the rules file names.
- A pattern has the headers its loader reads, and its categories are registered.
- A template part, Blade partial or PHP file is included or autoloaded somewhere.
- A child block (`parent` in `block.json`) has its parent present.

### Are source and build in step (committed build output only)

```bash
git grep -n '"version"' -- <block>/src/block.json <block>/build/block.json
diff <(jq -S . <block>/src/block.json) <(jq -S . <block>/build/block.json)
git log --format='%h %cs %s' --name-only -- <block>/
```

- The two `block.json` files agree on `version`, `attributes`, `supports` and the
  asset fields. Without `jq`, `read_file` both; a plain `diff` is useless when the
  build reformats the file.
- Judge staleness **per file**, not per directory. A build rewrites only the
  files whose sources changed, so build files with different commit dates are
  normal: a `category` edit regenerates only `build/block.json`, a stylesheet
  edit only the compiled CSS. A build file is stale only when a commit changed
  its source without changing it. The usual pairs with `@wordpress/scripts`:

  | Source | Build output |
  |---|---|
  | `src/block.json` | `build/block.json` |
  | `src/style.scss` | `build/style-index.css`, `build/style-index-rtl.css` |
  | `src/editor.scss` | `build/index.css`, `build/index-rtl.css` |
  | `src/index.js`, `edit.js`, `save.js(x)` | `build/index.js`, `build/index.asset.php` |
  | `src/view.js` | `build/view.js`, `build/view.asset.php` |
  | `src/render.php` | `build/render.php` |

- Every past commit that changed the block's markup, styles or attributes also
  bumped its `version`. One that did not is reported with its commit hash; the
  fix is a patch bump in the next release, which refreshes cached assets.

### Does it agree with itself

- Every attribute declared in `block.json` is read somewhere (edit, save, render,
  view). An attribute nothing reads is dead weight or a missing feature — say which.
- Everything `save()` or `render.php` emits has a matching style rule, and every
  rule targets a class the block can actually emit. Orphan CSS is the usual
  residue of a half-finished rename.
- Style variations registered in `block.json` have matching `is-style-*` rules.
- Editor-only stylesheets carry only editor overrides.

### Does it agree with the rest of the project

- Patterns and templates that use the block emit markup matching the current
  `save()` output. A mismatch invalidates the block for every editor who opens a
  page built from them, while the front end keeps rendering fine.
- Attributes the block has gained or renamed have a `deprecated` entry covering
  saved content.
- A front-end script is a `viewScript` only if every configuration of the block
  needs it.

---

## General Checklist

**Correctness**
- Null, empty and boundary cases handled.
- Error paths return something callers can act on.
- No regression in behavior the diff did not intend to change.

**Duplication and boundaries**
- No copy of a block, pattern, template or helper that already exists.
- Bootstrap logic stays in the bootstrap; block logic stays in the block; template
  logic stays in templates.

**Dependencies**
- No new npm or Composer dependency without a reason.
- Vendored third-party code is not modified.

**Accessibility**
- Keyboard operable; focus managed on open and close (menus, modals, tabs,
  overlays); ARIA roles and labels present and correct; images carry alt text;
  form fields have labels.

**Tests**
- New logic has a test where the project has a suite.
- A test that stubs its way to a green result proves nothing; say so.

**Docs**
- User-facing changes reflected in `readme.txt` and `CHANGELOG.md` where the
  project keeps them.
- A new project rule belongs in the rules file or `AGENTS.md`, not only in a commit
  message.

---

## The project rules file

Each project keeps its own rules in `.agents/code-review.md` (fallback:
`.vibe/code-review.md`), versioned and reviewed with the code. `.agents/` is not
tied to one tool. Exclude it from distributions — `/.agents export-ignore` in
`.gitattributes`, `.agents/*` in `.distignore`.

Every section is optional. The rules file must stand on its own: tools do not all
load `CLAUDE.md`, so a rule that matters is written here, not only referenced.

```markdown
# Code review rules — <project>

<One paragraph: what the project is and what ships.>

## Facts
- <Fact that overrides detection, e.g. "Text domain: acme (style.css header is stale)">

## Audit targets
- `blocks/` — `/code-review hero` audits `blocks/hero/`

## Skip
- `assets/vendor/**` — vendored; any diff here is a finding

## Review
- `bin/build-zip.sh`

## Commands
- `composer run lint`
- `npm run lint:css`

## Disable core rules
- <Core rule> — <why it does not apply here>

## Rules
### <Area>
- <Rule.>
  Why: <the concrete failure when it is broken>

## Audit rules
- <Consistency check for audit mode>

## Audit context
- `git grep -n "'<block>'" -- includes/`
```

The **Why** line is what the verification phase tests a finding against: a rule
without one cannot be verified, only asserted.

---

## Setup

**Install.** Copy this folder to a project's `.agents/skills/code-review/`, or add
the directory holding it to `skill_paths` in `.vibe/config.toml`. Vibe keeps the
first skill it finds for a name and searches `skill_paths` before the project's
`.vibe/skills/` and `.agents/skills/`, then `~/.vibe/skills/`.

**Allowlist.** Put the commands in the project's `.vibe/config.toml` so everyone
working on the project gets the same approvals. A project `allowlist` **replaces**
the one in `~/.vibe/config.toml` — lists are not merged — so include the read-only
basics as well:

```toml
[tools.bash]
allowlist = [
    # read-only basics
    "cat", "diff", "file", "find", "grep", "head", "jq", "ls", "pwd", "sort",
    "stat", "tail", "test", "tree", "uniq", "wc", "which",
    # git and GitHub, read-only
    "git branch", "git diff", "git fetch", "git grep", "git log", "git ls-files",
    "git rev-parse", "git show", "git status", "gh pr diff", "gh pr view",
    # the project's own lint and test commands
    "composer run lint", "composer run test", "vendor/bin/phpcs", "php -l",
]
```

`allowed-tools` in this file's header documents intent only; approvals come from
the allowlist.

## Tips

- Branch mode: run from the branch under review.
- Audit mode: `/code-review <target-name>` works from any branch, including a
  clean `main`.
- `/code-review --help` lists every named target.
- Keep PRs under ~20 files for a useful review.
- Pass the PR description as context — intent changes what counts as a defect.
- Re-run after addressing action items.
