#!/bin/sh
# strength115: run each batch, then commit + push its output (a restart loses nothing).
# Baseline B0 = the deaths fix G3+G5 + the smart buy-back (= deaths112's G35). Every candidate X = B0 + patches/X.js
# (SIMK env overrides the lanista knobs; default {"blood":"smart"}). Usage: SEEDS=1-12 sh runbatches.sh B0 F1 ...
cd "$(dirname "$0")/../../.." || exit 1
O=tools/plans/strength115/out
D=tools/plans/strength115/patches
SEEDS=${SEEDS:-1-12}; SEAS=${SEAS:-5}
DEFK='{"blood":"smart"}'
K=${SIMK:-$DEFK}
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
BASE="$(cat $D/G3.js $D/G5.js)"
save(){
  git add $O tools/plans/strength115 tools/mgrsim2.js
  git commit -q -m "strength115: batch $1 output [skip ci]"
  git push -q origin HEAD:refs/heads/wip/strength-study 2>&1 | tail -1
}
run(){ tag=$1; shift; t0=$(date +%s)
  node tools/mgrsim2.js flavius-arena.html --profiles careful --seeds $SEEDS --seasons $SEAS --par 2 --tag "$tag" --skip-done --out "$O/$tag.jsonl" "$@" >> "$O/$tag.log" 2>&1
  echo "batch $tag done: $(grep -c '^\[w' "$O/$tag.log") runs in $(( ($(date +%s)-t0)/60 )) min"; save "$tag"; }
for b in "$@"; do
  if [ "$b" = B0 ]; then run B0 --patch "$BASE" --simk "$K"
  elif [ -f "$D/$b.js" ]; then run "$b" --patch "$BASE
$(cat $D/$b.js)" --simk "$K"
  else echo "no patch $b"; fi
done
echo ALLDONE
