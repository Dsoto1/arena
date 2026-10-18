# v1.06a lighting — MOCK-UP (today vs the prototype) for his ok

Prototype: src/board/399-v106light.js, **off by default** (on: localStorage `flavius_light106=full|light`; kill switch
`flavius_light106off=1`). Audit: AUDIT.md · baseline: BASELINE.md · harness: tools/bench/board.js (+ summary.js).
Pictures are NOT committed — they are in the session scratchpad
`/tmp/claude-0/-home-user-arena/cc1b704a-5035-5a46-beb6-a9feaecd4df4/scratchpad/v106mock/`; regenerate with
`node tools/bench/board.js flavius-arena.html --frames 5 --shots DIR --tag today` and the same with
`--ls flavius_light106=1,flavius_light106auto=0 --tag v106a`.

## What the prototype does (v1.06a scope only)
- ONE sun (`LIGHT106_SUN` az 30°, el 55°): shadows fall right and a little toward the viewer (lower right), matching the painted sun upper left.
- Contact shadow at every grounded piece (gladiators, beasts, pillars, chest): a compact dark band at the base edge fading out + a broader
  soft layer leaning down-sun; one cached gradient sprite. Replaces the flat 32 % discs.
- Cast shadows: pillars + jugs and the chest from a height profile (cached blurred sprite per size step), rubble stones, and figures.
  The **soldier** uses his BAKED shadow sheet (make.js `l106`: Three.js ShadowMaterial ground pass from the sun, same rows/frames/8
  facings); every other class and the beasts use a runtime stand-in (their own cell's silhouette sheared along the sun, cached).
- The soldier is re-lit (key = the sun, cool fill from the camera side, thin warm rim from behind-right) — his sheets only.
- Shadows are drawn at the end of the `decals` layer, i.e. UNDER highlights, rings, figures and every UI mark; cast shadows go through one
  buffer (no double-darkening where two overlap) and are lifted 75 % off highlighted tiles (readability, below).
- Night: same direction, about half as strong (moonlight); torch light/shadows are v1.06b.

## The pictures (what to judge)
| file | what to look at |
|---|---|
| compare_desk_day-flat.png | today vs prototype, laptop, day: do pillars/figures sit on the sand? is the board still as easy to read? |
| compare_desk_day-zoom.png | same, zoomed 1.4×: pillar shadows' length (too long?), softness of the edges |
| compare_closeup_desk_day-zoom.png | 2× crop of the packed centre: contact band under the bases, the soldier's baked shadow, the stand-in shadows of the others, the shadow lifted off the orange move tiles |
| compare_desk_night-flat.png / _night-zoom.png | night: shadows fainter; enough, too little? |
| compare_phone_day-flat.png / _day-zoom.png / _night-* | phone 390 px @2x: do shadows turn into noise at TW 28? (phones start on Light = contact only, V4a) |
| soldier_8facings_before_after.png | the soldier's 8 facings, idle + a walk frame: today (camera-relative upper-left-front key, flat disc) vs re-lit + baked ground shadow. Judge the face/front brightness and the base top (see "change before the full bake") |
| today_*.png / v106a_*.png / closeup_*.png | the single frames the comparisons are made of |

## Numbers (measured; interleaved A/B on one box: today, prototype, × 3 rounds, 2026-10-18 11:40–11:52 UTC)
1-min load before→after each run: today 10.1→5.0, 3.5→2.7, 3.1→2.9 · prototype 5.0→3.5, 2.7→3.3, 2.9→3.1 (4 vCPU, no GPU, shared box).
ms per `draw()`, median of 3 runs (js = the JS call; flush = + forced CPU raster, see BASELINE.md for why that is only relative):

| config | proto p50 | proto p95 | today p50 | today p95 | Δp50 | Δp95 | shadow pass ms |
|---|---|---|---|---|---|---|---|
| desk day-flat js | 5.7 | 8.4 | 4.3 | 6.8 | +1.4 | +1.6 | 1.69 |
| desk day-zoom js | 6.1 | 10.0 | 4.3 | 7.1 | +1.8 | +2.9 | 2.40 |
| desk night-flat js | 5.8 | 8.7 | 4.6 | 7.2 | +1.2 | +1.5 | 1.57 |
| desk night-zoom js | 6.2 | 9.6 | 4.6 | 7.0 | +1.6 | +2.6 | 2.17 |
| phone day-flat js | 5.7 | 8.1 | 4.4 | 6.8 | +1.3 | +1.3 | 1.67 |
| phone day-zoom js | 6.0 | 8.7 | 4.6 | 6.8 | +1.4 | +1.9 | 2.33 |
| phone night-flat js | 6.0 | 8.8 | 4.6 | 7.2 | +1.4 | +1.6 | 1.59 |
| phone night-zoom js | 6.3 | 9.3 | 4.3 | 6.3 | +2.0 | +3.0 | 2.07 |
| desk day-flat flush | 18.0 | 30.1 | 15.7 | 24.0 | +2.3 | +6.1 | 2.12 |
| desk day-zoom flush | 24.7 | 36.5 | 19.9 | 31.7 | +4.8 | +4.8 | 2.23 |
| desk night-flat flush | 22.9 | 33.6 | 20.3 | 31.9 | +2.6 | +1.7 | 1.51 |
| desk night-zoom flush | 30.2 | 43.7 | 24.8 | 40.8 | +5.4 | +2.9 | 2.02 |
| phone day-flat flush | 19.1 | 28.8 | 15.2 | 24.1 | +3.9 | +4.7 | 1.63 |
| phone day-zoom flush | 23.3 | 35.1 | 18.0 | 28.2 | +5.3 | +6.9 | 2.21 |
| phone night-flat flush | 22.4 | 37.0 | 19.4 | 31.3 | +3.0 | +5.7 | 1.73 |
| phone night-zoom flush | 29.6 | 44.3 | 23.5 | 35.0 | +6.1 | +9.3 | 2.03 |

Where the pass spends it (single run, 60 frames, load ≈ 2.3–3.6): **buffer composite 1.0–1.7 ms** (clearing + blitting the shadow
buffer — the blit makes the buffer rasterise synchronously), figure shadows 0.2–0.6, pillar/chest/rubble sprites 0.2–0.35, contact 0.2–0.4.
Same scene drawing straight onto the board (`flavius_light106direct=1`, overlaps then double-darken): **0.54–0.97 ms a pass**.
→ The buffered prototype is at/over the notes' "shadows ≤ 2 ms" budget zoomed; the direct path is well inside it (see changes below).

## Readability (measured): highlight overlay contrast vs the floor under it
WCAG contrast of a highlight pixel against the same pixel without the highlight, 6 points per empty highlighted tile (off the cost digit);
H-6 is the move tile inside the pillar at I-5's cast shadow.
| config | today mean / min / H-6 | prototype, no lift | prototype (75 % lift, as committed) |
|---|---|---|---|
| desk day-flat | 1.333 / 1.127 / 1.144 | 1.320 / 1.037 / 1.037 | 1.331 / 1.124 / 1.138 |
| desk day-zoom | 1.317 / 1.117 / 1.250 | 1.299 / 1.097 / 1.097 | 1.315 / 1.120 / 1.243 |
| desk night-flat | 1.136 / 1.041 / 1.041 | 1.134 / 1.022 / 1.022 | 1.138 / 1.055 / 1.063 |
| phone day-flat | 1.334 / 1.112 / 1.134 | 1.322 / 1.038 / 1.038 | 1.334 / 1.112 / 1.140 |
| phone night-zoom | 1.135 / 1.033 / 1.066 | 1.131 / 1.033 / 1.044 | 1.136 / 1.033 / 1.096 |
Without the lift a move tile in a pillar's shadow lost most of its contrast (1.14 → 1.04); with it every tile is within 0.01 of today
or better. Note: night move tiles are already faint TODAY (min 1.03) — worth its own fix, independent of shadows.

## What I would change before the full bake (my recommendations)
1. **Drop the per-frame shadow buffer.** Pillars, jugs, chest and rubble only change when the board does: paint their merged shadows once
   into a cached layer (keyed like 192's stone layers: TW, origin, turn, pillars/rubble/chest state, night) and blit it; draw figure
   shadows straight onto the board (figures rarely overlap each other's shadows; the baked ones are soft). Expected ≈ 0.6–1 ms (the
   direct path measured 0.54–0.97 ms) — inside the 2 ms budget; then re-measure.
2. **The base top washes out in the re-bake** (soldier_8facings: cream base): the sun now hits the base top almost straight on.
   Darken the base material in the re-bake or keep it out of the key light; check the toon ramp's top step on skin/metal too.
3. **Shadow sheets are heavy** (move 60 KB, act 333 KB for one class; colour sheets 145/689 KB): bake them at half resolution as a
   single-channel alpha (they are blurred anyway) — ~1/4 of the size; a lighter phone set (V2a) can even skip the act shadows.
4. Bake the ACT rows' shadows with contact hardening (sharper near the feet), and extend `shadowRow` to the severed sets + beasts
   (312's own pipeline) so no runtime stand-in remains.
5. Pillar profile: measure the pillar mini/jug silhouette instead of the hand-written profile (LIGHT106.pillar) — the cast is close but not exact.
6. Settings → Lighting (Full / Light / Off) row + phones start on Light; keep the auto-drop but base it on the 288 frame meter
   (real frame time, GPU incl.) rather than JS draw time; add a test (tv106l: kill switch = identical pixels, shadow under highlights,
   contrast check, auto-drop) before shipping.

## Honest limits
- Measured here: JS draw time, forced CPU raster time, per-part pass time, overlay contrast, on a 4-vCPU box WITHOUT a GPU shared with
  other builders (load figures above). NOT measured: a real laptop/phone with a GPU, GC pressure (the pass allocates small objects per
  frame: arrays/objects per piece), memory of the caches (sprite cache ≤ 40, shadow cells ≤ 200, silhouettes per cell canvas — a WeakMap).
- Figure poses in the shadow pass are one frame old (positions are fresh) — not noticeable at 120 ms a pose, not verified frame by frame.
- Only the soldier is baked; the stand-in skew shadows of the other classes/beasts are flatter and clip at the base line. Shadows do not
  fall ON figures or pillars (they are drawn under every piece). Pushed/toppling pillars keep their shadow on the tile (no offset).
- The highlight lift makes a pillar's shadow lighten when move tiles appear under it — visible as a change, by design; judge it.
- Prototype only: no Settings row, no translations, no test of its own yet; the anim106 sheets (~1.2 MB) are in assets/ (deployed with the
  game, never loaded while the prototype is off; mkshare skips them).
