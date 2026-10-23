#!/bin/sh
# deaths112 proposal batches: careful x 12 seeds x 5 seasons each, 2 browsers, one batch at a time (run from the repo root).
# usage: sh tools/plans/deaths112/runall.sh <outdir>
O=${1:-/tmp/d112}
D=tools/plans/deaths112/patches
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
run(){ tag=$1; shift; node tools/mgrsim2.js flavius-arena.html --profiles careful --seeds 1-12 --seasons 5 --par 2 --tag "$tag" --skip-done --out "$O/$tag.jsonl" "$@" > "$O/$tag.log" 2>&1; echo "batch $tag done: $(grep -c '^\[w' "$O/$tag.log") runs"; }
run S1blood --simk '{"blood":"smart"}'
run S2fame --simk '{"fameBuy":18,"bypass":true}'
run S3both --simk '{"blood":"smart","fameBuy":18,"bypass":true}'
run S4ent --simk '{"entMax":2,"entFit":0}'
run G1clem --patch "$(cat $D/G1.js)"
run G3half --patch "$(cat $D/G3.js)" --simk '{"blood":"smart"}'
run G4gate --patch "$(cat $D/G4.js)"
run G5fame --patch "$(cat $D/G5.js)"
run G6med --patch "$(cat $D/G6.js)"
echo ALLDONE
