#!/bin/sh
# deaths112 third wave (after runall2.sh): the recommended game package G3 + G5 with a lanista who buys back (blood smart).
O=${1:-/tmp/d112}
D=tools/plans/deaths112/patches
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
while ! grep -q ALLDONE2 "$O/runall2.log" 2>/dev/null; do sleep 30; done
run(){ tag=$1; shift; node tools/mgrsim2.js flavius-arena.html --profiles careful --seeds 1-12 --seasons 5 --par 2 --tag "$tag" --skip-done --out "$O/$tag.jsonl" "$@" > "$O/$tag.log" 2>&1; echo "batch $tag done: $(grep -c '^\[w' "$O/$tag.log") runs"; }
run G35 --patch "$(cat $D/G3.js; cat $D/G5.js)" --simk '{"blood":"smart"}'
echo ALLDONE3
