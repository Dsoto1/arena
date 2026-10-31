#!/bin/sh
# run each deaths112 batch, then commit + push its outputs (so a restart can't lose them)
cd /home/user/arena/.claude/worktrees/agent-aceceaa358a122130 || exit 1
O=tools/plans/deaths112/out
D=tools/plans/deaths112/patches
SEEDS=${SEEDS:-1-12}; SEAS=${SEAS:-5}
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
save(){ git add $O/*.jsonl $O/*.log 2>/dev/null; git commit -q -m "deaths112: batch $1 output [skip ci]" && git push -q origin HEAD:refs/heads/wip/deaths-study 2>&1 | tail -1; }
run(){ tag=$1; shift; t0=$(date +%s)
  node tools/mgrsim2.js flavius-arena.html --profiles careful --seeds $SEEDS --seasons $SEAS --par 2 --tag "$tag" --skip-done --out "$O/$tag.jsonl" "$@" >> "$O/$tag.log" 2>&1
  echo "batch $tag done: $(grep -c '^\[w' "$O/$tag.log") runs in $(( ($(date +%s)-t0)/60 )) min"; save "$tag"; }
for b in "$@"; do
  case $b in
    S1blood) run S1blood --simk '{"blood":"smart"}';;
    S2fame) run S2fame --simk '{"fameBuy":18,"bypass":true}';;
    S3both) run S3both --simk '{"blood":"smart","fameBuy":18,"bypass":true}';;
    S4ent) run S4ent --simk '{"entMax":2,"entFit":0}';;
    G1clem) run G1clem --patch "$(cat $D/G1.js)";;
    G3half) run G3half --patch "$(cat $D/G3.js)" --simk '{"blood":"smart"}';;
    G4gate) run G4gate --patch "$(cat $D/G4.js)";;
    G5fame) run G5fame --patch "$(cat $D/G5.js)";;
    G6med) run G6med --patch "$(cat $D/G6.js)";;
    S5player) run S5player --simk '{"fameBuy":18,"bypass":true,"reserveWk":3}';;
    G4S5) run G4S5 --patch "$(cat $D/G4.js)" --simk '{"fameBuy":18,"bypass":true,"reserveWk":3}';;
    G35) run G35 --patch "$(cat $D/G3.js; cat $D/G5.js)" --simk '{"blood":"smart"}';;
    S6real) run S6real --simk '{"blood":"smart","fameBuy":18,"bypass":true,"reserveWk":3}';;
    PKG) run PKG --patch "$(cat $D/G3.js; cat $D/G4.js; cat $D/G5.js)" --simk '{"blood":"smart","fameBuy":18,"bypass":true,"reserveWk":3}';;
  esac
done
echo ALLDONE
