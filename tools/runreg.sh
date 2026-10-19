#!/bin/sh
# Full regression: every test gets the built page; pass = "exit=0" and no "ERRS [ ...non-empty ]".
# Usage: sh tools/runreg.sh [-j N] [test names...]   (results in tools/reg.txt, ends with ALLDONE)
#   -j N  run N tests at once (default 4; -j 1 = the old one-at-a-time run). Each test has its own browser, so they do
#         not share storage. Slowest tests start first (timings from the last run in tools/reg/times.txt), and
#         tools/reg.txt keeps the list order, so it reads exactly like a serial run.
# Run it in the background:  (nohup sh tools/runreg.sh >/dev/null 2>&1 &)   — ~30 min at -j 4 on 4 cores (v0.88: 190 tests, ~110 min serial; tools/smartreg.js --full also shares one browser per worker)
cd "$(dirname "$0")/tests"
F=$(cd ../.. && pwd)/flavius-arena.html
OUT=../reg.txt
J=4
if [ "$1" = "-j" ]; then J=$2; shift 2; fi
: > $OUT
mkdir -p ../reg
DEFAULT="tv106h tv106f tv106l tv106a tv106b tv106c tv105ad tv105ab tv105z tv105v tv105s tv105f tv104l tv104i tv104e tv104a tv104g tv100bal tv101a tv101c tv101d tv101e tonl101r tv103a tv103e tv102l tv102h tv102f tv101z tv101m tnode101 tv101s tv101r tv101q treplay101 tv100sd tv100rp tv100sb tonl100lb tonl100b tv100c tv100g tv99q tv99o tv99a tv99y tv99g tv99f tv99e tonl98 tonl98f tv96c tv95l tv95p tv94m tv94d tonl94 tv93a tv93t tv93k tv93i tv93l trng92 tv92t tv92k tonl92 tv92y tv92f tv92c tv92p tv92m tv92s tv92x tv91d tv91l tv91z tv91r tv91i tv91e tv91m tv91a tv91v tv91w tv91c tv91s tv90p tonl89p tv89m tv89f tv89s tv89a tv89c tv89h tv89j tv89t tonl89d tonl89a tv89y tv89k tonl89n tv89b tonl89 tv90y tv90w tv90k tv90b tv91n t12a t12b t12c tseed4 tbrief tgo45 tstudio45 tmgr45 tmisc45 tb1 tb4 tb5 tb6 tb7 tb8 tb9 tsim tmid tworld tinf tc1 tsb tcity tv30 tg tf tc3 tgore thorn tsc tclean tclean2 tlock tmkt tmenu3 tud2 tud4 tboss tlive tnaum tcity35 trec thist tbuy tnaum2 tnames ttro tbake taud36 tcard tlive36 tlan ttruce2 tall ttut tstep tspect tspect2 tsculpt tmshow trail tflick thorns tcitysch ttix tlayers tico tsnap ttoss tseed tpia ttut2 ttravel tcurt tboss2 tfair tseat2 tmtut tcr tpots tmtut46 tseed46 ttut46 tmgr46 tbeast46 tstudio46 tpair46 trost46 tmusic47 ttourn47 tmgr47 tarena47 tstudio47 ttut47 tmgr48 tguide48 tmgr49 taud49 ths49 tv50 tguide50 ths50 tv51 tver51 tanim51 tv52 tcls tlook tbye tv53 temp53 t53s tres tmgr54 t54a tv55 tstat55 tv56 tv57 tv58 tv59 tv60 tv60b tv61 tv62 tv63 tv64 tv65 tv66 tv67 tv68 tv69 tv70 tv71 tv72 tv73 tv74 tv75 tv76 tupd76 tdel76 tv77 tonl77 tonlws77 tonl78 tv79 tonl79 tonl80 tonl80r tonlws80 tonl80m thsleak80 tv81a tv81o tv81p tv82b tv82o tv82s tv82v tv83a tv83c tonl83 tonl83u tv84 tv84p tv84r tv84u tonl84 tv85f tv85x tv85r tv85m tv85l tv86 tv87n tv87c tv87l tv87x tv87w tv87m tv87i tv88k tv88s tv88d tv88r tv88m tv88g tv88h tv88p tv95c tv95b tv95a tv96a tv96b tonl96 tv96m tv96f tv98bear tv98d tv98b tv98o tv98m tv98h tv98dr tv99z tv99r tv99d tv99t tv99k tv100f tv100s tv100t tonl100tt tv100w2 tv100g2 tonl100t tonl100w tv100x tv96d tv96g tv96k tv96l tv96o tv96r tv96t tv96u tv96w tv98a tv98c tv98f tv100fps tv100mt tonl100a tonl101 tv100z tv100r tv100l tv100l2 tv100mm tv100h tv100p tv100mp tv100ae tv100rm tv100rc tv100bf tv100pn tv100q tv100bb tv100in tonl100bf tv100dc tv100fh tv100ti tv100bs tv100an tv100cr tv101f tv101b tv102e tv102c tv102b tv102d tv102a tv102g tv102j tv102k tonl102p tv103b tv104d tv103c tv104b tv104c tv104h tv104f tv104j tv104k tv105a tv105d tv105c tv105b tv105e tv105k tv105q tv105h tv105g tv105i tv105m tv105n tv105j tv105p tv105l tv105r tv105o tv105t tv105x tv105u tv105w tv105aa tv105y tv105ac tv106d tv106g tv106e"
[ -n "$*" ] && LIST="$*"
LIST=${LIST:-$DEFAULT}
LIST=$(echo $LIST | tr ' ' '\n' | awk '!seen[$0]++' | tr '\n' ' ')  # each test once
TIMES=../reg/times.txt
[ -f $TIMES ] || : > $TIMES
# order: slowest first (unknown tests count as slow), the rest in list order
ORDER=$(for t in $LIST; do s=$(awk -v t=$t '$1==t{print $2}' $TIMES); echo "${s:-9999} $t"; done | sort -rn -s -k1,1 | awk '{print $2}')
# kill limit per test: 400 s, or 1.6x its last time + 60 s when slower; the whole t12 (every event by sims; the suite runs its
# three shards t12a/b/c instead) at least 1500 s — it needs ~900 s alone, more under load
echo "$ORDER" | xargs -P "$J" -I{} sh -c 't={}; k=$(awk -v t=$t '"'"'$1==t{print int($2*1.6+60)}'"'"' '"$TIMES"'); [ "${k:-0}" -gt 400 ] || k=400; { [ "$t" = t12 ] || [ "$t" = treplay101 ]; } && [ "$k" -lt 1500 ] && k=1500; s=$(date +%s); timeout $k node $t.js '"$F"' > ../reg/$t.out 2>&1; echo "exit=$?" >> ../reg/$t.out; echo "$t $(( $(date +%s)-s ))" > ../reg/$t.time'
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
