#!/bin/sh
# tools/i18n/finish.sh — after the translations are written: check, build the language packs (+ en-AU), the v0.93 key check, the page.
set -e; cd "$(dirname "$0")/../.."
node tools/i18n/check.js; node tools/i18n/mkdict.js | tail -1; node tools/i18n/mkau.js | tail -1; node tools/i18n/check93.js | tail -1; sh build.sh | tail -1
