#!/bin/sh
# mgrbatch.sh — the v1.0 Manager economy runs (tools/balance100/mgrecon.js), one at a time. Raw rows → tools/plans/balance100/raw/mgr_<cfg>.jsonl,
# summaries → mgr_<cfg>.txt.  Usage: sh tools/balance100/mgrbatch.sh [runs=20] [seasons=2]
cd "$(dirname "$0")/../.." || exit 1
R=${1:-20}; SE=${2:-2}; O=tools/plans/balance100/raw
run(){ n=$1; shift; echo "== $n $(date +%T)"; env "$@" node tools/balance100/mgrecon.js flavius-arena.html $SE $RR base $GM > $O/mgr_$n.txt 2> $O/mgr_$n.jsonl; }
RR=$R GM=on;  run v100        X=1
RR=$R GM=on;  run any_play    ANY100=play
RR=$R GM=on;  run any_off     ANY100=off
RR=$R GM=on;  run adv_off     ADVOFF=1
RR=$R GM=off; run gear_off    X=1
echo ALLDONE $(date +%T)
