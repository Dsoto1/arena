# sh tools/plans/mock100/pn_shots.sh — every playnow mock state at 1440x900 and 390x844
cd "$(dirname "$0")"
for h in 1a hotseat 1c 1c-mgr 1d buttons; do
  node pn_shot.js "playnow.html#$h" "pn_$h.png" 1440 900
  node pn_shot.js "playnow.html#$h" "pn_${h}_390.png" 390 844
done
node pn_shot.js "playnow.html#1a" pn_1a_full.png 1440 900 1
node pn_shot.js "playnow.html#hotseat" pn_hotseat_full.png 1440 900 1
