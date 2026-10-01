#!/bin/sh
# Full regression: every test gets the built page; pass = "exit=0" and no "ERRS [ ...non-empty ]".
# Usage: sh tools/runreg.sh [test names...]   (results in tools/reg.txt, ends with ALLDONE)
# Run it in the background — the full suite takes ~35 minutes:  (nohup sh tools/runreg.sh >/dev/null 2>&1 &)
cd "$(dirname "$0")/tests"
F=$(cd ../.. && pwd)/flavius-arena.html
OUT=../reg.txt
: > $OUT
LIST="$*"
[ -z "$LIST" ] && LIST="t12 tseed4 tbrief tgo45 tstudio45 tmgr45 tmisc45 tb1 tb4 tb5 tb6 tb7 tb8 tb9 tsim tmid tworld tinf tc1 tsb tcity tv30 tg tf tc3 tgore thorn tsc tclean tclean2 tlock tmkt tmenu3 tud2 tud4 tboss tlive tnaum tcity35 trec thist tbuy tnaum2 tnames ttro tbake taud36 tcard tlive36 tlan ttruce2 tall ttut tstep tspect tspect2 tsculpt tmshow trail tflick thorns tcitysch ttix tlayers tico tsnap ttoss tseed tpia ttut2 ttravel tcurt tboss2 tfair tseat2 tmtut tcr tpots tmtut46 tseed46 ttut46 tmgr46 tbeast46 tstudio46 tpair46 trost46 tmusic47 ttourn47 tmgr47 tarena47 tstudio47 ttut47 tmgr48 tguide48 tmgr49 taud49 ths49 tv50 tguide50 ths50 tv51 tver51 tarena51 tanim51 tv52 tcls tlook tbye tv53 temp53 t53s tres tmgr54 tpia t54a tv55 tstat55 tv56 tv57 tv58 tv59 tv60"
for t in $LIST; do
  echo "== $t ==" >> $OUT
  timeout 400 node $t.js $F >> $OUT 2>&1
  echo "exit=$?" >> $OUT
done
echo ALLDONE >> $OUT
