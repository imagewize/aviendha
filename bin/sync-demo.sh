#!/usr/bin/env bash
#
# Sync this working copy of Aviendha into the demo Bedrock site so unreleased
# theme changes can be tested there without cutting a release.
#
# Aviendha is a pinned Composer dependency on the demo site, so a `composer
# update` there will overwrite whatever this pushes. That is the intended way
# back to released code.
#
# The Aludra plugin has its own copy of this script: ~/code/aludra/bin/sync-demo.sh.
#
# Usage:
#   bin/sync-demo.sh
#
# Override paths with AVIENDHA_SRC / DEMO_ROOT if your checkouts live elsewhere.

set -euo pipefail

AVIENDHA_SRC="${AVIENDHA_SRC:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
DEMO_ROOT="${DEMO_ROOT:-$HOME/code/imagewize.com/demo/web/app}"

dest="$DEMO_ROOT/themes/aviendha"
[ -d "$dest" ] || { echo "✗ $dest not found — is the demo site installed?" >&2; exit 1; }

# Mirrors .distignore: push the shipped theme, not the dev tree.
rsync -a --delete \
	--exclude '.git/' \
	--exclude '.github/' \
	--exclude '.claude/' \
	--exclude 'node_modules/' \
	--exclude 'vendor/' \
	--exclude 'docs/' \
	--exclude 'bin/' \
	--exclude '.DS_Store' \
	"$AVIENDHA_SRC/" "$dest/"

echo "✓ aviendha → $dest ($(grep -m1 'Version:' "$dest/style.css" | tr -d ' '))"
