# v1.08 — MOCK-UP: night torches · materials · wall / stands depth (for his ok; nothing shipped)

Source: tools/plans/v106/NOTES.md V3a (night torches) + V6a (v1.08 = materials polish, night torches, wall/stands depth), the night decision
(torches on the RIM only, warm pools at the sand edges, moonlit blue middle, pieces fully readable, gentle flicker that Reduce motion stops),
his lighting brief (tools/plans/v106/BRIEF-lighting.md) and the VISUAL POLISH RULE (CLAUDE.md §1).

Prototype: **src/board/407-v108proto.js**, in build.sh but **OFF** unless localStorage `flavius_v108proto` = `1` (all three) or
`torch` / `mat` / `depth` (a comma list works). With the flag unset nothing is wrapped: tools/bench/v108same.js loads a build without 407
and this build and compares the source of every function 407 can wrap — **0 of 14 differ** desk + phone (with the flag on: 11 differ,
so the check has teeth). Tests (flag off): tv91r tv92p tv106l tv107p **pass 4 / fail 0** (`node tools/smartreg.js -j 1 …`).

Pictures are NOT committed (session scratchpad `…/scratchpad/v108art/`, JPEG 1600 px, "today v1.07 | proposal" side by side).
Regenerate: `sh tools/bench/v108all.sh flavius-arena.html <dir>` (pictures + flicker check, paired cost, side-by-sides).

## What each item does (and how it stays cheap)
**1 · NIGHT TORCHES** (night only)
- The warm pools are **baked** into 189's night grade (the canvas it already lays over the board once a frame): round each of the 11 rim
  lights the grade is thinned and warmed, so the sand's own tone shows through warm at the sand edges while the middle keeps the moonlit
  blue (+ a faint cooler lift). Live, each frame: 189's 11 big pool gradients are replaced by small ones that only breathe with the flame;
  the torches/braziers themselves are 189's. Reduce motion (`SETTINGS.calm`) / Animations Off / Light board: no flicker — checked
  (rim-light flame factors two frames 0.4 s apart: differ normally, identical with Reduce motion; desk + phone).
- **Shadows point away from the nearest torches** (Lighting Full only, like v1.06's cast shadows; phones start on Light = contact only, so no
  torch shadows there): the two strongest rim lights at each piece re-aim the piece's **v1.06 baked sun shadow** along the ground (rotate in
  the ground plane about the base, stretch with distance 0.9–1.7×, weight by the light's falloff over 5 tiles; nothing per pixel). Pillars /
  jugs / chest: merged once into a copy of 399's cached static layer (one layer, 401's chunked blit). Figures + beasts: ≤ 2 extra
  drawImage each per frame. On a highlighted tile the torch shadow keeps 399's 85 % lift. The moon keeps today's 399 night shadow.
**2 · MATERIALS** (day + night) — all baked into layers already blitted once a frame (192's LIGHT by day, 189's grade by night):
- sand: a fine seeded grain (light + dark specks, a few pebbles); **raked rings were tried and dropped** (on the paved arenas they read as
  scratches — `V108K.rake`, 0);
- stands: plank seams (3 planks a tread), staggered butt joints, a lit nosing on each tread's front edge;
- metal: a sheen pass on each figure / beast cell when it is first made (steel + gold/bronze pixels: more contrast, a highlight on the
  sun-facing side; base discs skipped) — a **stand-in** for re-baking the sheets with a metal material;
- jugs: a glaze glint (one cached sprite per jug).
**3 · WALL / STANDS DEPTH** (day + night, baked the same way): ambient occlusion along the sand's edges (0.6 tile deep under the far walls,
0.35 at the low near walls), at the back of every bench tread (where it meets the next riser), a lit top on the far walls' cap, the far stands
slightly darker with distance (off the sand and the walls, so the banners and tile names keep their contrast).

## Pictures (scratchpad v108art/)
| file | what to judge |
|---|---|
| compare_torch_desk_night-flat / _night-zoom | laptop: warm pools along all four sand edges, blue middle, pillar shadows pointing inward away from the rim |
| compare_torch_closeup_desk_night-zoom | the packed middle at 2×: figures, HP bars, move tiles, the aim outline + tag, the bubble unchanged |
| compare_torch_phone_night-flat / _night-zoom | phone 390 px @2: pools only (Light = no cast shadows on phones) |
| compare_mat_* (desk/phone × day/night × flat/zoom) | grain on the sand, glint on the jugs, metal on helmets/blades |
| compare_mat_stands_desk_day-zoom / _night-zoom | the benches' planks + nosing, close |
| compare_depth_* + compare_depth_stands_desk_* | edge AO under the far walls, tread AO, lit cap, darker far stands |
| compare_all_* (+ closeup, stands) | the three together |
| compare_safari_* (desk/phone × day/night flat) | the three together on the Safari-like path (406 forced) vs that path today |

## Cost (measured)
**Method.** Whole-run medians (tools/bench/board.js per variant, tools/bench/v108cost.sh, 2 rounds) were tried first and **rejected**:
today-vs-today moved ±3–10 ms between runs on this shared box (1-min load 1.2–10.5), more than the ≤ 2 ms being checked. Instead
**tools/bench/v108ab.js**: one page per variant × view on the v1.06 forged bench scene (8 gladiators, 6 beasts, 12 pillars + jugs, chest,
rubble, 9 move + 1 attack tile, the slash, "−2"), 407's per-frame work switched on/off **every frame** (A B B A), 120 pairs per row,
Δ = median of (on − off) of neighbouring frames, ms per `draw()`. js = the `draw()` call; flush = + a 1-px getImageData (this box's CPU
raster: 4 vCPU, no GPU, headless Chromium; load 1.2–2.0 during the runs). Noise floor: torch in daylight (does nothing) reads −0.3…+0.1.
The baked parts ride in layers that are blitted anyway: 0 per frame by construction; their one-time re-bake is listed below.
(Cost run with the moon shadow at .11; the final .16 only changes an alpha. Pictures + contrast are from the final build.)

Δ ms per draw (desk 1440×900 @1, phone 390×844 @2; safari = all three on 406's WebKit path, `flavius_v107safariforce=1`, incl. desk @2):

| config | torch | mat | depth | all | safari |
|---|---|---|---|---|---|
| desk day-flat js | 0 | +0.2 | +0.1 | 0 | +0.1 |
| desk day-zoom js | −0.1 | +0.1 | 0 | +0.1 | +0.1 |
| desk night-flat js | 0 | +0.2 | 0 | +0.3 | +0.2 |
| desk night-zoom js | 0 | +0.1 | +0.1 | +0.1 | 0 |
| desk@2 day-flat / day-zoom / night-flat / night-zoom js | – | – | – | – | 0 / +0.15 / +0.3 / +0.1 |
| phone day-flat js | 0 | 0 | 0 | 0 | +0.2 |
| phone day-zoom js | +0.05 | +0.1 | +0.1 | +0.1 | +0.1 |
| phone night-flat js | 0 | +0.1 | 0 | +0.1 | +0.1 |
| phone night-zoom js | −0.1 | +0.1 | +0.05 | +0.1 | +0.1 |
| desk day-flat flush | −0.1 | +0.1 | 0 | +0.5 | +0.4 |
| desk day-zoom flush | −0.3 | +0.1 | −0.15 | 0 | −0.2 |
| desk night-flat flush | −0.45 | +0.5 | +0.2 | −0.35 | +0.05 |
| desk night-zoom flush | −0.75 | +0.1 | 0 | −0.4 | −0.5 |
| desk@2 day-flat / day-zoom / night-flat / night-zoom flush | – | – | – | – | +0.05 / +0.3 / −0.1 / −0.7 |
| phone day-flat flush | −0.2 | +0.2 | −0.05 | +0.2 | 0 |
| phone day-zoom flush | +0.1 | 0 | 0 | +0.3 | +0.3 |
| phone night-flat flush | −1.1 | +0.4 | +0.05 | −0.3 | 0 |
| phone night-zoom flush | −0.85 | +0.05 | +0.25 | −0.45 | −0.2 |

Today's frames in the same runs (median ms, off): desk js 5.2–6.0, desk flush 18.7–31.5, phone flush 23–26, Safari path flush 9.3–28.8.
- **Budget (all three ≤ +2 ms desk): met** — worst +0.3 js / +0.5 flush. Torch is at or under today at night (its live pools are smaller
  than 189's). **Safari path: near today** — worst +0.3 js / +0.4 flush.
- First torch build (before the fixes, for the record): drawImage'd pool sprites + a second shadow layer + a clip-lifted figure pass measured
  +3.1 ms (night flat) / +4.7 ms (night zoom) flush — over budget, hence the baked pools, the merged layer and the alpha-cut lift.
- **One-time costs** (not per frame): 192 LIGHT re-bake +0.4–0.8 ms (resize / zoom step / turn); 189 night grade re-bake +1.3–6.8 ms (Safari
  path 14.8) — **189 re-bakes its grade on every frame of a zoom ease (its key holds TW), so a night zoom ease pays this each frame for ~1 s**;
  torch shadow layer 7 ms (Safari path 20) at each 399 static-layer rebuild (zoom step, pillar push/topple); metal sheen ≈ 1 ms per NEW cell
  (≈ 215 cells for the scene's poses, 180–250 ms in all, spread over first poses).

## Readability (measured, tools/bench/v108shots.js — board.js CONTRAST: highlight vs the same pixel without it, 6 points per empty highlighted tile)
| config | today mean / min | proposal (all) mean / min |
|---|---|---|
| desk day-flat | 1.336 / 1.125 | 1.327 / 1.130 |
| desk day-zoom | 1.326 / 1.109 | 1.321 / 1.111 |
| desk night-flat | 1.139 / 1.052 | 1.137 / 1.047 |
| desk night-zoom | 1.142 / 1.033 | 1.141 / 1.037 |
| phone day-flat | 1.347 / 1.121 | 1.342 / 1.123 |
| phone night-zoom | 1.141 / 1.033 | 1.138 / 1.033 |
| Safari path desk night-flat | 1.139 / 1.052 | 1.138 / 1.050 |
Every shot within 0.01 of today. Night move tiles are faint TODAY already (min 1.03) — still worth its own fix (noted in v1.06). A weaker moon
shadow (.11) was tried to let the torch direction read more: the move tile in a pillar's shadow (H-6) fell 1.052 → 1.022 → kept today's .16.
Looked at in every picture: gold active tile, move/attack tiles + cost digits, the aim outline + "Ursa" tag (forged hover), HP bars, the
"−2", the speech bubble — unchanged; no seams at the baked layers' edges; the torch shadows stop short of the middle (falloff 5 tiles).

## Open choices for him (my pick ★)
1. **Torch strength** — a) as shown (grade thinned 72 % at a light, warm .2) ★ · b) softer (50 %) · c) stronger (90 %, near day-bright at the edges).
2. **Flicker** — a) pools breathe + flames flicker, shadows still ★ · b) also the torch shadows sway a little (cost ≈ 0, more motion) · c) flames only.
3. **How dark the night** — a) today's grade ★ (the move tiles are the limit: night min 1.03 already) · b) darker middle for more drama
   (needs the night move-tile fix first) · c) lighter.
4. **Torch shadows on phones** — a) no: phones stay on Light (contact only, V4a) ★ · b) yes on Full phones only.
5. **Moon shadow** — a) today's .16 ★ (keeps H-6's contrast) · b) .11 (torch direction clearer, H-6 1.05 → 1.02).
6. **Raked sand** — a) grain only ★ (rings read as scratches on paving) · b) rings on the sand arenas only (needs a per-arena "sand" flag).
7. **Metal sheen** — a) re-bake the figure sheets with a metal material in make.js (zero runtime, true highlights) ★ · b) keep the runtime
   cell pass (~1 ms a new cell: hitch risk at Fast, a GPU read-back on GPU canvases) · c) skip.
8. **Depth strength** — a) as shown (subtle; reads at zoom) ★ · b) stronger AO / far darkening (+30 %).

## Before the build (my recommendations)
- 189's night grade: bake the v1.08 additions in tile units (or keep the last grade while a zoom eases) so a night zoom ease does not
  re-paint them every frame (above).
- Metal: move to the sheet bake (choice 7a); drop the runtime pass.
- Torch shadows: give `l106Solid` the torch light's height so the stretch is physical (now a clamp 0.9–1.7×); cache figure torch shadows
  per pose like 399's cells if the beta's frame meter shows the per-frame part.
- Settings: torches + depth follow Lighting (Full / Light / Off: Off = today's board); kill switch `flavius_v108off=1`; a test (tv108)
  for flag-off identity, highlight contrast within 0.01, the Reduce-motion still path, NIGHT91.torches outside the sand.

## Honest limits
- Measured on a 4-vCPU box without a GPU (software canvas), not on his laptop / phone / Mac Safari; the Safari path is 406's switches in
  Chromium (CoreGraphics not emulated). **Real devices: assumed, not measured** — the 288 frame meter / ⏺ recorder in the beta will say.
- The forged scene has its pieces in the middle, so only 2 figure torch shadows draw there; a match with fighters at the edges draws up to
  2 per piece (~28 small drawImage, measured cheap in isolation but not in that layout).
- Metal detection is a colour heuristic (grey steel / yellow bronze) on the baked sheets: it can catch pale cloth or gold trim; the re-bake fixes that.

## His answers 2026-10-20: 1a 2a 3a 4a 5a 6a 7a 8a (all the picks)
1a torch strength as shown · 2a pools + flames flicker, shadows still (Reduce motion: still) · 3a night darkness as today · 4a phones stay on
Lighting Light (no torch shadows) · 5a moon shadow .16 as today · 6a raked sand = grain only · 7a metal = re-bake the figure sheets with a metal
material (no runtime pass; a re-bake never ships bundled with other feature work → its own step/beta check, R4) · 8a depth as shown.
Build must also fix: 189 night grade re-bake per zoom-ease frame (+1.3–6.8 ms, 14.8 Safari), torch shadow layer ~7 ms per 399 rebuild,
then real-device fps on the beta (60 laptop / 30 phone, Safari).

## Build (his go 2026-10-20)
7a metal re-bake conflicts with R4 (a re-bake never ships bundled with feature work, decided 2026-10-18) → v1.08 ships torches + sand
grain + planks + jug glint + depth WITHOUT metal; the metal sheet re-bake = its own release v1.08b (after v1.08a sounds), unless he pulls it in.
