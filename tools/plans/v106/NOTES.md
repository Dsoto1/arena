# v1.06 — board visuals (light + shadows) — his l2a (2026-10-17)

Already decided 2026-10-15 (tools/plans/v103/NOTES.md, RELEASE SPLIT "v1.05 = board visuals"; dropped from the plan when v1.05 became the
Match Week release — my miss, restored here):
- N12a one sun upper left, silhouette shadows cast lower right, pillars cast long; Off + Light board paths; ≤ 16 ms frame
- E5a shadows on everything (beasts, pillars, pots, chest, rubble); night = shadows away from the rim torches
- N11a beast bodies (corpse models on the sand, cleared by the crew) + always 3D (no fallback to the old token on damage / lost limbs;
  Settings "Token style: 3D always / classic")
- E6a sharp pieces everywhere, not only zoomed (check what v1.03 T6 already covers)
His l1a (2026-10-17) confirms N12a: one sun direction per arena, pillars and figures cast soft shadows the same way, the 3D figures lit
from that side, night = torch light. Mock-up first. Existing to build on: 176 light upper left on sculpts, 192 day sky with the sun upper
left, 189 night look, 266 arena themes, 356/359/366 the floor pass + shadow disc.
Winter Quarters (N4, was v1.06) moves to v1.07.

## His notes for v1.06 (2026-10-17, beta 2 screenshots)
- E6a confirmed with screenshots (normal un-zoomed view and a closer view): soft/blurry edges on the 3D gladiator minis, the 3D SPECTATORS
  in the stands and the 3D BEASTS (bear, snakes, wolf). Pillars, pots and the board itself look sharp. Target: render the minis, beasts and
  crowd at the screen's real pixel density (devicePixelRatio) and the current zoom, cached per zoom step so the frame budget holds
  (≤ 16 ms laptop, 30 fps phone); compare side by side in the mock-up.
- Seen in the same shot: one beast drawn as a flat dark silhouette (right half, a small black figure on a grey disc) — check whether it is a
  render still pending (N11a: plain 3D set while pending) or a missing render.
