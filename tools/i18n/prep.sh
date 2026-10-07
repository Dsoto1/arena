#!/bin/sh
# tools/i18n/prep.sh — before translating a release: mark new literals, collect untranslated keys into the next part.
# Prints the new part's path and key count (0 → nothing to translate). Then hand TRANSLATE.md to ONE translation agent.
set -e; cd "$(dirname "$0")/../.."
node tools/i18n/wrap.js --write | tail -1; node tools/i18n/frag.js --write | tail -1; node tools/i18n/srvkeys.js | tail -1; node tools/i18n/newkeys.js | tail -1
