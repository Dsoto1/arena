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

## His answers on the lighting brief (2026-10-17): v1a v2a v3a v4a v5a v6a
- V1a one sun upper left in every arena; arenas vary by warmth/time of day (shadow length); the figure sheets re-baked once.
- V2a figure shadows BAKED with the figures: make.js renders each facing × pose's true ground shadow from the sun → a shadow sheet beside each
  move/act sheet (≈ +⅓ download; a lighter set for phones); zero runtime cost. Layering: contact (dark, at the feet, runtime) + baked cast shadow.
  Materials (metal sheen, skin form, rim separation, self-shadow) come from the re-bake lighting (key = sun, fill, thin rim, AO), not runtime paint.
- V3a night torches in the lighting work (warm local light, shadows away from the rim torches) — goes to v1.06b (V6a).
- V4a Settings → Lighting: Full / Light / Off; Full drops to Light by itself when frames exceed 16 ms; phones start on Light.
- V5a order: baseline frame times on a BENCHMARK SCENE (a fixed packed arena from a recorded replay: gladiators, beasts, pillars, pots, an attack)
  → mock-up (today vs v1.06a: day, night, zoomed, phone + one class re-baked before/after + the numbers) → his ok → bake all classes → build.
- V6a split: v1.06a = sun + contact/cast shadows on everything + re-baked figures; v1.06b = materials polish, night torches, wall/stands depth.
- Measurable acceptance (added to the brief): frame ≤ 16 ms laptop / ≤ 33 ms phone on the benchmark scene, shadows ≤ 2 ms of it; highlight
  overlays keep their contrast vs the floor (automated); no haze on the board (depth only between sand, walls, stands); local light only where
  something burns/glows; board first, then the main-menu show (same sheets); City Square / Studio / Online later.

## Target clarity (a tester's note via him, 2026-10-17; his u1c u2a u3a)
Tester: "changing the cursor or having a confirmation when selecting nearby targets for attacks — in the isometric view it isn't clear what
you're targeting. That said, it went where I wanted each time." Found: the board has NO hover feedback at all (no pointermove on the board).
- U1c HOVER PREVIEW: with an attack chosen, the valid target under the pointer gets a red ring on its tile + a soft outline on the figure +
  a crosshair cursor + a small tag (name · your hit chance); leaving clears it; the click hits exactly what is shown. Overlapping figures:
  the figure whose BODY (sprite alpha) is under the pointer wins over the tile behind. PLUS Settings → "Confirm attacks" (off by default):
  "Strike <name>?" Yes/No.
- U2a TOUCH: first tap = select + the same ring/outline/tag, second tap on the same target = strike (a tap elsewhere cancels).
- U3a in v1.06 (the board release, with the lighting). Display/input only: no rule, dice or online-lockstep change.
- His follow-up (2026-10-17): "Confirm attacks" is OFFLINE ONLY — never in Online matches (the setting is ignored/hidden there; turn timers).
  The hover preview (and the touch two-tap select) DO work in Online.

## His calls 2026-10-18 (v1.05 shipped; "start 1.06")
- I1 Infirmary: the BANNER shows both the injured count (a chip "⚕ N injured") and the Medicus hours chip (392 hrs105Chip); the RAIL tab keeps
  only the injured count ("⚕ N", as today). Answers the open beta-5 question.
- v1.06 order: (1) lighting — benchmark scene + baseline frame times + audit → mock-up (today vs v1.06a, one class re-baked) for his ok, THEN the
  full bake/build; (2) Manager: season locks (d1a d2-123) + rival trade motives (t1a) + I1; (3) attack-target preview + offline Confirm attacks
  (u1c u2a, Online hover only). (2)+(3) are decided → built now; lighting waits on the mock-up ok.
- Mock-up published 2026-10-18: https://claude.ai/artifact/5HKkQE1uKseEt3VHawxBCh (prototype on branch worktree-agent-a95f2ee3813202e8e, commit 23221c1, off by default; not merged until his ok).
- His ok on the mock-up (2026-10-18): "lighting looks good" → full v1.06a build: direct shadow draw + cached static shadow layer, darker base top, half-size alpha shadow sheets (+ phone set), all classes + severed sets + beasts baked (no runtime stand-ins), Settings → Lighting Full/Light/Off with auto-drop on the frame meter, test tv106l.
- Poaching after the deadline (his "you decide", 2026-10-18): BLOCKED for the player, rivals and Sica's lure from week 9 (a signed fighter moving houses = a trade; keeps the frozen Superbus roster honest). The moneylender's coin loans and calling back your own lent fighter stay open.

## His beta-1 notes (2026-10-18, PDF "beta")
- G1 Match Week: he entered a fighter into the FIRST bout and simulated it BEFORE setting off (B74 locked the square, not the bouts).
  Fix: no bout can be fought, watched or simulated before the house has set off on an away week (Set off first, same 🔒 message).
- G2 City Square (screenshot, Capua): the city's EDGES look strange (houses cut off at the map border, the tiled ground ending in a hard
  line); the building SIGN letters don't fit their plates (Bathhouse, Armorer, Arms market, Auction block, Lupanar, The Arena Gate…).
- G3 City Square: remove the speed control (it only speeds walking; no purpose). REPLACES its place in the square's top bar.
- G4 Match Week: when a bout ends (it collapses, the next opens) the results card should show OUR gladiator in the win/results box on
  the right of the card.
- G5 Board (screenshot, Classic Elimination): rings still an issue + new visual "debris" — yellow arrows at: the dashed ring under each
  snake, a white tile outline + dark ring under the bears, specks around a flat dark beast figure (the B? flat silhouette, known issue),
  the orange ring under the active gladiator. Likely v1.06a shadow-sheet artifacts (lossy alpha) + leftover rings.
- Answers (2026-10-18): G4a (the results box shows OUR fighter's face + name + result Won/Lost/Fell + purse; none of ours → the bout winner's
  face) · G5a (no rings under figures — only the highlighted tile under the active piece; fix the shadow-sheet speck artifacts; diagnose the
  flat dark beast). REPLACES the team/seat rings at the mini bases (v1.0 "team rings at mini bases", thinned in v1.03 346).
- Aim tag % (his a1a a2a, 2026-10-18): today 396 shows only "≥1 hit die lands" = 1−0.5^n (75% vs a gladiator, 94% vs a beast) and ignores
  blessings, gods, items, shields, armor, Fidelis, Focus!, Omnia Mutantur. NEW: the tag shows the chance to actually WOUND, computed from the
  rules (no sampling): the same dice counts as doAttack/chAttack/tamedAttack + every active modifier the attack/hurt path applies — the
  target's shield raise, armor/AP soak, blessings (Minerva etc.), Fidelis Constans, Achilles' shield, elixirs, the attacker's Focus! and
  Omnia Mutantur when active this turn (a2a); likely damage added when the chance is high. Ranked online: no % (unchanged). The confirm
  dialog shows the same number. Enumerate every modifier from 03-engine hurt()/04-rules doAttack and their wrappers (grep), list them.
