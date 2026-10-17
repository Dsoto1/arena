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

## Season locks (his d1a d2-1,2,3, 2026-10-17)
- Trade + loan DEADLINE at the end of week 8: from week 9 no new trades, loans or loan asks (running loans finish on their terms); a week-7
  letter warns; rivals and Sica follow it.
- After the deadline: free agents may still be signed ONLY into an empty roster spot under the cap; Superbus bouts take only fighters on
  the roster at the deadline; no releasing fighters during the playoff weeks.

## Rival trade strategy (his t1a, 2026-10-17)
- Each AI trade offer comes from a MOTIVE picked from the house's situation: cut wages (poor house), youth/potential (rebuilding),
  fill a gap (missing class / injured starter), all-in (contender, weeks 7–8), sell high (a fighter about to fade).
- Value = rating + fame + age + career kind + potential − weekly wage (a dearer fighter costs value). The offer card says WHY in one line
  and shows the weekly cost change ("+3/wk for you"). Deadline end of week 8 (d1a). REPLACES 47 offersWeek's gValue match (rating×2.2 +
  fame×1.2 − age over 30, no wages).

## His lighting + shadow brief (2026-10-17) — tools/plans/v106/BRIEF-lighting.md (verbatim); how it maps onto this repo
It EXTENDS N12a / E5a / E6a / l1a above (nothing replaced; it sets the bar and the method). Adapted to how the game is built:
- Renderer: one 2D canvas, draw() in 03/07 + board layers (227 layers/bus, 260 zoom/camera, 277/321 arena look). Figures + beasts are NOT live 3D:
  Three.js bakes them OFFLINE (tools/art/anim100/make.js → assets/anim100_<cls>_move/act.webp, 8 facings) or on the device for Studio/Online
  tokens (311 ANIM100_LIB). So "light the units" = re-bake the sheets with the sun's direction per facing (asset change), not a live shader;
  "cast shadows from silhouettes" = a cached, skewed alpha silhouette per sheet frame, drawn under the figure (moves with every frame).
- Existing shadow/light code to unify (one LIGHT config, one shadow module): 356/359 floor marks under figures, 366 shadow scale with bases
  off, 282 mm100Shadow (menu), 176 sculpt light upper left, 192 day sky sun upper left, 189 night look, 136 sand, 134/135 spikes/chest,
  312 beasts, 313 crowd, 323 projectiles, 277-hit FX. Pillars/pots/chest/rubble are drawn procedurally → cast shadows computed from height.
- Our standing rules win where they differ from the brief: VISUAL POLISH RULE (tv91r/tv92p draw cost, ≤ 16 ms laptop / 30 fps phone,
  tv66/tv88 phones, tv86/tv87l languages, saves, trng92 dice, tonl* online lockstep — display only, never S/rand()), a kill switch +
  Settings path (Off / Light / Full) for every effect incl. Reduce motion / Animations Off, tests through smartreg, the full suite only on GitHub.
- Process (his l1a: mock-up first): audit + baseline numbers → before/after mock-up on real board screenshots (day, night, zoomed, phone)
  + frame-time numbers → his ok → build → measure → report in the brief's §11 format.
