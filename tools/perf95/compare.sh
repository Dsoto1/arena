#!/bin/sh
# v0.95 perf: before/after rows. sh tools/perf95/compare.sh <before.html> <after.html> [rounds]
# Alternates the two pages (a loaded machine hits both alike); one line per run: fps / frame p50 / p95 / busy % (prof.js, 15 s) and
# image decodes (trace.js, 8 s). Served over http (tools/perf95/serve.js); FILE=1 for file://.
B=$1; A=$2; N=${3:-2}; D=$(dirname "$0")
for i in $(seq 1 "$N"); do for p in "$B" "$A"; do for s in normal fast; do
  P=$(node "$D/prof.js" "$p" "{\"speed\":\"$s\",\"spect\":1,\"secs\":15}" 2>&1 | grep -E '"(fps|p50|p95|busyPct)"' | tr -d ' \n')
  T=$(node "$D/trace.js" "$p" "{\"speed\":\"$s\",\"spect\":1,\"secs\":8}" 2>&1 | grep -E "DECODES|CPU" | tr "\n" " ")
  echo "$(basename "$p") $s $P $T load=$(cut -d' ' -f1 /proc/loadavg)"
done; done; done
