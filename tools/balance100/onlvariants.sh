#!/bin/sh
# onlvariants.sh — the online coin model (onlcoin.js) under the what-if overrides used in REPORT.md. Usage: sh tools/balance100/onlvariants.sh
cd "$(dirname "$0")/../.." || exit 1
[ -f tools/plans/balance100/raw/onlgear_fighter.json ] || gunzip -k tools/plans/balance100/raw/onlgear_fighter.json.gz
O=tools/plans/balance100/raw; G=$O/onlgear_fighter.json
node tools/balance100/onlcoin.js $G 2000 120 > $O/onlcoin_base.json 2> $O/onlcoin_base.md
SURVT=15 node tools/balance100/onlcoin.js $G 2000 120 > $O/onlcoin_surv15.json 2> $O/onlcoin_surv15.md
SURVT=15 GLORYK=0.5 node tools/balance100/onlcoin.js $G 2000 120 > $O/onlcoin_surv15_glory50.json 2> $O/onlcoin_surv15_glory50.md
KEEPW=1 DENT=1 node tools/balance100/onlcoin.js $G 2000 120 > $O/onlcoin_keepw_dent.json 2> $O/onlcoin_keepw_dent.md
KEEPW=1 DENT=1 SURVT=15 AWARDK=1.5 node tools/balance100/onlcoin.js $G 2000 120 > $O/onlcoin_all.json 2> $O/onlcoin_all.md
KEEPW=1 DENT=1 DEADK=0.33 node tools/balance100/onlcoin.js $G 2000 120 > $O/onlcoin_keep_dead33.json 2> $O/onlcoin_keep_dead33.md
GLORYK=0.5 node tools/balance100/onlcoin.js $G 2000 120 > $O/onlcoin_glory50.json 2> $O/onlcoin_glory50.md
KEEPW=1 DENT=1 DEADK=0.1 AWARDK=3 node tools/balance100/onlcoin.js $G 1000 120 > $O/onlcoin_keep_dead10_award3.json 2> $O/onlcoin_keep_dead10_award3.md
GIFTONCE=1 node tools/balance100/onlcoin.js $G 2000 120 > $O/onlcoin_giftonce.json 2> $O/onlcoin_giftonce.md
echo done
