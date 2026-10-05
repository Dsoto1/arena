#!/bin/sh
# Full regression: every test gets the built page; pass = "exit=0" and no "ERRS [ ...non-empty ]".
# Usage: sh tools/runreg.sh [-j N] [test names...]   (results in tools/reg.txt, ends with ALLDONE)
#   -j N  run N tests at once (default 3; -j 1 = the old one-at-a-time run). Each test has its own browser, so they do
#         not share storage. Slowest tests start first (timings from the last run in tools/reg/times.txt), and
#         tools/reg.txt keeps the list order, so it reads exactly like a serial run.
# Run it in the background:  (nohup sh tools/runreg.sh >/dev/null 2>&1 &)   — ~11 min at -j 3 (was ~90 serial)
cd "$(dirname "$0")/tests"
F=$(cd ../.. && pwd)/flavius-arena.html
OUT=../reg.txt
J=3
if [ "$1" = "-j" ]; then J=$2; shift 2; fi
: > $OUT
mkdir -p ../reg
DEFAULT="t12 tseed4 tbrief tgo45 tstudio45 tmgr45 tmisc45 tb1 tb4 tb5 tb6 tb7 tb8 tb9 tsim tmid tworld tinf tc1 tsb tcity tv30 tg tf tc3 tgore thorn tsc tclean tclean2 tlock tmkt tmenu3 tud2 tud4 tboss tlive tnaum tcity35 trec thist tbuy tnaum2 tnames ttro tbake taud36 tcard tlive36 tlan ttruce2 tall ttut tstep tspect tspect2 tsculpt tmshow trail tflick thorns tcitysch ttix tlayers tico tsnap ttoss tseed tpia ttut2 ttravel tcurt tboss2 tfair tseat2 tmtut tcr tpots tmtut46 tseed46 ttut46 tmgr46 tbeast46 tstudio46 tpair46 trost46 tmusic47 ttourn47 tmgr47 tarena47 tstudio47 ttut47 tmgr48 tguide48 tmgr49 taud49 ths49 tv50 tguide50 ths50 tv51 tver51 tarena51 tanim51 tv52 tcls tlook tbye tv53 temp53 t53s tres tmgr54 tpia t54a tv55 tstat55 tv56 tv57 tv58 tv59 tv60 tv60b tv61 tv62 tv63 tv64 tv65 tv66 tv67 tv68 tv69 tv70 tv71 tv72 tv73 tv74 tv75 tv76 tupd76 tdel76 tv77 tonl77 tonlws77 tonl78 tv79 tonl79 tonl80 tonl80r tonlws80 tonl80m thsleak80 tv81a tv81o tv81p tv82b tv82o tv82s tv82v tv83a tv83c tonl83 tonl83u tv84 tv84p tv84r tv84u tonl84 tv85f tv85x tv85r tv85m tv85l tv86 tv87n tv87c tv87l tv87x tv87w tv87m tv87i tv88k tv88s tv88d tv88r tv88m tv88g"
[ -n "$*" ] && LIST="$*"
LIST=${LIST:-$DEFAULT}
LIST=$(echo $LIST | tr ' ' '\n' | awk '!seen[$0]++' | tr '\n' ' ')  # each test once
TIMES=../reg/times.txt
[ -f $TIMES ] || : > $TIMES
# order: slowest first (unknown tests count as slow), the rest in list order
ORDER=$(for t in $LIST; do s=$(awk -v t=$t '$1==t{print $2}' $TIMES); echo "${s:-9999} $t"; done | sort -rn -s -k1,1 | awk '{print $2}')
# kill limit per test: 400 s, or 1.6x its last time + 60 s when slower; t12 (every event by sims) at least 900 s — it needs ~430-510 s alone, more under load
echo "$ORDER" | xargs -P "$J" -I{} sh -c 't={}; k=$(awk -v t=$t '"'"'$1==t{print int($2*1.6+60)}'"'"' '"$TIMES"'); [ "${k:-0}" -gt 400 ] || k=400; [ "$t" = t12 ] && [ "$k" -lt 900 ] && k=900; s=$(date +%s); timeout $k node $t.js '"$F"' > ../reg/$t.out 2>&1; echo "exit=$?" >> ../reg/$t.out; echo "$t $(( $(date +%s)-s ))" > ../reg/$t.time'
: > $TIMES.new
for t in $LIST; do
  echo "== $t ==" >> $OUT
  cat ../reg/$t.out >> $OUT 2>/dev/null || echo "exit=99" >> $OUT
  cat ../reg/$t.time >> $TIMES.new 2>/dev/null
  rm -f ../reg/$t.out ../reg/$t.time
done
# keep timings for tests not in this run
awk 'NR==FNR{seen[$1]=1;print;next} !seen[$1]' $TIMES.new $TIMES > $TIMES.tmp && mv $TIMES.tmp $TIMES && rm -f $TIMES.new
echo ALLDONE >> $OUT
