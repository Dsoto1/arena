#!/bin/sh
# tools/bench/v108all.sh — the whole v1.08 mock-up run (tools/plans/v108/MOCKUP.md): pictures + flicker check, paired per-frame A/B cost,
# side-by-side JPEGs. sh tools/bench/v108all.sh <page> <outdir>
PAGE=${1:-flavius-arena.html}; OUT=${2:-/tmp/v108art}
mkdir -p "$OUT/shots" "$OUT/img"
node tools/bench/v108shots.js "$PAGE" --out "$OUT/shots" --variants off,torch,mat,depth,all,safarioff,safari --still --json "$OUT/shots.json" > "$OUT/shots.log" 2>&1
echo "shots exit $?"
node tools/bench/v108ab.js "$PAGE" --variants torch,mat,depth,all,safari --blocks 8 --n 30 --json "$OUT/ab.json" > "$OUT/ab.log" 2>&1
echo "ab exit $?"
python3 tools/bench/v108compose.py "$OUT/shots" "$OUT/img" > "$OUT/img.log" 2>&1
echo "compose exit $?"
