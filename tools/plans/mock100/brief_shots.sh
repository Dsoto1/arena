# sh tools/plans/mock100/brief_shots.sh — the briefing mock at 1440x900 and 390x844 (uses pn_shot.js)
cd "$(dirname "$0")"
for h in classic special reopen phone; do
  node pn_shot.js "brief.html#$h" "brief_$h.png" 1440 900
  node pn_shot.js "brief.html#$h" "brief_${h}_390.png" 390 844
done
node pn_shot.js "brief.html#classic" brief_classic_390_full.png 390 844 1
