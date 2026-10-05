#!/bin/sh
# release.sh — one command from source to a shippable build (CLAUDE.md §6, steps 1-4 + the zip).
# Usage: sh tools/release.sh 0.63        (from anywhere; stops at the first failure)
#   1. the badge in src/01-head.html must read "arena · v<ver>" and the first MILESTONES entry must be v:'<ver>'
#   2. sh build.sh → SYNTAX_OK, swallowed-statement guard quiet
#   3. page hygiene: no cheat word (from CLAUDE.md "Current words") and no e-mail address in plain text
#   4. FULL regression (tools/smartreg.js --full — releases never skip a test)
#   4b. the advert shot for flaviusrule.com/play.html (tools/siteshot.js → share/arena_shot.webp → the game zip's play/arena_shot.webp)
#   5. share build (tools/mkshare.py) + its smoke test + zip — ALWAYS (SHARE=0 skips it): the site's download is play/flavius-rule-arena.zip (his pick, v0.82; was off by default in v0.81: the site
#      and the artifact use the page + assets; the in-game ⇩ download builds its own one-file copy in the browser)
# Left for Claude/the owner: publish to the artifact (read the live version first), update CLAUDE.md, send the zip.
set -e
V="$1"; [ -n "$V" ] || { echo "usage: sh tools/release.sh X.YY"; exit 2; }
cd "$(dirname "$0")/.."
step(){ printf '\n== %s ==\n' "$1"; }
step "1 version"
grep -q "arena · v$V<" src/01-head.html || grep -q "arena · v$V\b" src/01-head.html || { echo "badge is not v$V (src/01-head.html)"; exit 1; }
head -20 src/34-notes.js | grep -m1 "{v:'" | grep -q "{v:'$V'" || { echo "first MILESTONES entry is not v:'$V' (src/34-notes.js)"; exit 1; }
echo "badge + milestone v$V"
step "2 build"
OUT=$(sh build.sh); echo "$OUT" | tail -1
echo "$OUT" | grep -q SYNTAX_OK || { echo "build failed"; exit 1; }
echo "$OUT" | grep -q "GUARD TRIPPED" && { echo "swallowed-statement guard tripped"; exit 1; }
printf '{"v":"%s"}\n' "$V" > version.json; echo "version.json → v$V (upload it to play/ with index.html)"
step "3 page hygiene"
WORDS=$(grep -m1 "Current words:" CLAUDE.md | sed 's/.*Current words://' | grep -oE '[A-Z][A-Z0-9]{3,}')
for w in $WORDS; do if grep -q "$w" flavius-arena.html; then echo "cheat word in plain text: $w"; exit 1; fi; done
# public contacts that belong on the page (the Credits page); any other address is a leak
ALLOW='FlaviusRule@gmail.com'
LEAK=$(grep -oE '[A-Za-z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|icloud|proton)\.(com|me)' flavius-arena.html | sort -u | grep -vixF "$ALLOW" | head -1)
if [ -n "$LEAK" ]; then echo "an e-mail address is in the page: $LEAK"; exit 1; fi
echo "clean ($(echo $WORDS | wc -w) words checked)"
step "4 full regression (~12 min)"
node tools/smartreg.js --full || { echo "regression failed — see tools/reg.txt"; exit 1; }
step "4b advert shot (play.html)"
mkdir -p share && node tools/siteshot.js "$PWD/flavius-arena.html" share/arena_shot.png | tail -1
python3 -c "from PIL import Image;im=Image.open('share/arena_shot.png').convert('RGB');im=im.resize((1200,round(im.height*1200/im.width)),Image.LANCZOS);im.save('share/arena_shot.webp',quality=82,method=6)" && rm -f share/arena_shot.png
echo "share/arena_shot.webp → the game zip's play/arena_shot.webp (flavius.sh game uploads it; play.html shows it)"
if [ "$SHARE" = "0" ]; then printf '\nREADY v%s (no share build — SHARE=0 skipped it) — next: publish (read the live artifact first), update CLAUDE.md, commit.\n' "$V"; exit 0; fi
step "5 share build"
python3 tools/mkshare.py "$V" | tail -1
mkdir -p /tmp/sharetest39 && cp "share/flavius-rule-arena-v$V.html" /tmp/sharetest39/
sed "s/v0.54.html/v$V.html/" tools/tshare54.js > "/tmp/sharetest39/t$V.js"
SM=$(cd /tmp/sharetest39 && node "t$V.js" 2>&1 | tail -1); echo "$SM"
echo "$SM" | grep -q "missing 0 \[\]" || { echo "share smoke test failed"; exit 1; }
rm -f "share/flavius-rule-arena-v$V.zip"; (cd share && zip -q -9 "flavius-rule-arena-v$V.zip" "flavius-rule-arena-v$V.html")
ls -la "share/flavius-rule-arena-v$V.zip"
step "6 site zips (what he uploads to CloudShell: bash flavius.sh release)"
OUT=share/deploy; mkdir -p "$OUT"; T=$(mktemp -d); mkdir -p "$T/a/play" "$T/b/play"
cp flavius-arena.html "$T/a/play/index.html"; cp version.json share/arena_shot.webp "$T/a/play/"; cp -r assets "$T/a/play/assets"; cp tools/deploy/flavius.sh "$T/a/flavius.sh"
cp "share/flavius-rule-arena-v$V.zip" "$T/b/play/flavius-rule-arena.zip"
rm -f "$OUT"/flavius-site-update-v*.zip "$OUT"/flavius-download-v*.zip
(cd "$T/a" && zip -q -r "$OLDPWD/$OUT/flavius-site-update-v$V.zip" play flavius.sh); (cd "$T/b" && zip -q -r "$OLDPWD/$OUT/flavius-download-v$V.zip" play); rm -rf "$T"
for z in "$OUT"/flavius-*-v$V.zip; do s=$(stat -c %s "$z"); printf '  %s  %s MiB%s\n' "$z" "$(echo "scale=1;$s/1048576" | bc)" "$([ "$s" -gt 31457280 ] && echo '  ← over 30 MiB: too big to send in one file')"; done
printf '\nREADY v%s — next: publish (read the live artifact first), update CLAUDE.md, commit, send share/deploy/*.zip (+ the server zip when there is one).\n' "$V"
