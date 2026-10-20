#!/bin/sh
# tools/bench/v108cost.sh — v1.08 mock-up draw cost (tools/plans/v108/MOCKUP.md): tools/bench/board.js per variant, interleaved rounds.
#   sh tools/bench/v108cost.sh <page> <outdir> [rounds=2] [frames=80]
# Variants: off (today) · torch · mat · depth · all — then the Safari-like path (406 forced, + a desk @2 view the DPR cap applies to):
# safarioff (today) · safari (all three). Each run writes <outdir>/<variant>_r<k>.json; summarise with node tools/bench/v108sum.js <outdir>.
PAGE=${1:-flavius-arena.html}; OUT=${2:-/tmp/v108cost}; R=${3:-2}; F=${4:-80}
mkdir -p "$OUT"
k=1
while [ "$k" -le "$R" ]; do
  for v in off torch mat depth all; do
    case $v in off) LS=flavius_light106auto=0;; all) LS=flavius_light106auto=0,flavius_v108proto=1;; *) LS=flavius_light106auto=0,flavius_v108proto=$v;; esac
    node tools/bench/board.js "$PAGE" --frames "$F" --warm 15 --ls "$LS" --json "$OUT/${v}_r$k.json" > "$OUT/${v}_r$k.log" 2>&1
    echo "round $k $v exit $?"
  done
  for v in safarioff safari; do
    case $v in safarioff) LS=flavius_light106auto=0,flavius_v107safariforce=1;; *) LS=flavius_light106auto=0,flavius_v107safariforce=1,flavius_v108proto=1;; esac
    node tools/bench/board.js "$PAGE" --frames "$F" --warm 15 --dprs 2 --ls "$LS" --json "$OUT/${v}_r$k.json" > "$OUT/${v}_r$k.log" 2>&1
    echo "round $k $v exit $?"
  done
  k=$((k+1))
done
