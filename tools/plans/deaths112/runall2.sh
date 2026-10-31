#!/bin/sh
# deaths112 second wave (after runall.sh): the "real player" composite and the eased gate together with it.
O=${1:-/tmp/d112}
D=tools/plans/deaths112/patches
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
# wait for the first wave (runall.sh writes ALLDONE into $O/runall.log)
while ! grep -q ALLDONE "$O/runall.log" 2>/dev/null; do sleep 30; done
run(){ tag=$1; shift; node tools/mgrsim2.js flavius-arena.html --profiles careful --seeds 1-12 --seasons 5 --par 2 --tag "$tag" --skip-done --out "$O/$tag.jsonl" "$@" > "$O/$tag.log" 2>&1; echo "batch $tag done: $(grep -c '^\[w' "$O/$tag.log") runs"; }
run S5player --simk '{"fameBuy":18,"bypass":true,"reserveWk":3}'
run G4S5 --patch "$(cat $D/G4.js)" --simk '{"fameBuy":18,"bypass":true,"reserveWk":3}'
echo ALLDONE2
