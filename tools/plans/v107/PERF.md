# v1.07 — frame rate in matches, zoomed and not (his beta-1 note 2) — 401-v107perf

## Method
- **Box:** 4 vCPU container, **no GPU**: headless Chromium draws the 2D canvas in software (CDP SystemInfo: `2d_canvas: unavailable_software`).
  Other builders shared it the whole time (1-min load 1.5–7.9). The numbers here are only good for **comparing before and after on the same box
  at the same time**. They do not predict a laptop.
- **Whole frame, live play:** `tools/bench/live.js` (new). A real CPU match (Democritus at Pompeii, seed 4242, 8 CPU seats of the 8 printed
  classes, Normal speed, Animations On, stands + spectators) runs for 3 s, then 6 s are measured. Per frame:
  - **frame** = the rAF interval (the whole frame: script, style, layout, paint, canvas raster, commit);
  - **js** = the board paint (the sum of the `drawLayers93` calls in that frame);
  - with `--cpu`: **main CPU/frame** = the renderer main thread's thread time (trace `RunTask` tdur) ÷ frames. This one holds up best when the box is loaded.
  - Configs: desk 1440×900 @1, hd = the same @2 (DPR 2), phone 844×390 @2 (landscape, touch). Each one flat / z14 ("Zoom in" 1.4, with the
    camera following and gliding) / z2 (a pinch to 2). Also desk-z14-hover (pointer sweeps), desk-z14/z2-aim (a human aiming, 396), and
    desk-z14/z2-nobase (bases off, 321/334 clean-ups). Lighting: Full on desk/hd, Light (the default) on phone, no auto-drop.
  - Tools: `--profile` (CDP sampler: self + inclusive time), `--trace` (main-thread self time by trace event), `--probe` (who calls createImageBitmap /
    getImageData / new canvases / filters / shadowBlur), `--fn a,b` (times page functions), `--who` (who calls draw), `--ablate` (layers off),
    `--trend N` (time windows), `--gpu` (Chromium's GPU path on SwiftShader: accelerated canvas, so read-backs and uploads show up; much slower).
  - Summary: `node tools/bench/livesum.js after*.json --vs before*.json`.
- **Raster per layer:** `tools/bench/board.js --ablate --flush`: tools/plans/v106's forged scene with a 1-px getImageData flush, one layer off at a time.
- **Look:** `tools/bench/shots107.js`. The same forged frame (frozen clock, seeded Math.random, 10 highlighted tiles) is drawn with 401 ON and OFF in
  one page, at z1 / z1.4 / z2 × day / night × desk, desk@2, phone. It reports the pixel diff and saves on / off / diff (×16) PNGs.

## Causes found (measured)
1. **Synchronous sheet decodes (every config, the worst hitches).** 311's `an100Bm` cut each action's rows with
   `createImageBitmap(<img>, rect)`. For an `<img>` source Chrome decodes the whole sheet on the main thread: 100–150 ms a call, 3–5 calls in
   each 6-s window of play (≈ 500 ms). The v1.06 light pass asks for the pose's row first (`l106GladSh`), so profiles booked it as "L106 figs
   5–8 ms a pass" (40 ms at DPR 2). Inclusive: an100Bm 502–647 ms per 6 s.
2. **The light pass's raster, which grows with zoom and DPR.** In the forged frame with a forced flush, light Full vs no pass costs desk +4 ms
   at z1.4 and +5…10 at z2, desk@2 +14…26 ms. Parts: the board-sized static layer (drawn scaled at a fractional position, most of it transparent), the
   highlight lift, and the contacts. The lift is `l106Lifted`'s anti-aliased **evenodd clip with a huge rect**: the mask is the size of the
   whole canvas, built twice for the static layer and twice for the figure shadows, every frame a tile is highlighted (the CPU turns show move tiles too).
3. **GPU read-back stalls when zoomed (GPU path; seen with `--gpu`).** 346's unsharp mask runs only on **up-scaled** cells (zoomed, or a 2× screen).
   It calls `getImageData` on a freshly painted cell canvas. Zoomed, those cells are big enough to be GPU canvases, so each read waits for the GPU:
   desk z2 measured 3 sharpens = 2268 ms, an100CellCanvas 48× = 1231 ms, bst100CellCanvas 36× = 1044 ms (SwiftShader, so the size is exaggerated,
   but each one is a stall on a real GPU too). Not visible on the CPU box. This is the zoom-only cost a laptop with a GPU would feel.
4. **The #fx95 number overlay** (227) was cleared on every board draw, numbers or not, so a second board-sized canvas was re-produced every
   frame (trace: 2 ProduceCanvasResource a frame).
5. **312 `bst100Live`** read `cv.offsetParent` (a forced layout) on every beast tick / schedule (profile: "get offsetParent" 115–160 ms per 6 s).
6. **Not changed (measured, documented):**
   - On this box the canvas raster at commit is ~17–25 ms a frame at desk z1.4 (trace `ProduceCanvasResource`) and 4× that at DPR 2.
     It comes from the stack of ~8 board-sized alpha layers (stone under/deco/top + light source-atop + sky destination-over, tiles, wear, static shadows).
     A GPU does this as compositing. Merging layers would change what the crowd / marks sit under, so it was left alone.
   - z ≥ 1.5 (pinch, the duel's 1.75): 294's whole-arena stone frame stops at z² > 2.25 (memory), so camera trips re-reference the stone layers.
     z99 then re-cuts their ImageBitmap pieces: 480–780 createImageBitmap per 6 s, ≈ 160–270 ms.
   - The rail / panels: style + layout ≈ 8 % of the main thread in a CPU match.
   - The aim hover (396) is cheap: desk-z14-aim 46 fps, board js p95 12 ms.
   - Frames get slower over a long match on the loaded box (`--trend`) with a stable heap and stable js. That was load, not a leak.

## Fixes (401-v107perf, kill switch `flavius_v107perfoff=1`; 399 split out `l106DrawStatic` / `l106DrawFigs` and keeps the static layer's rects)
- **P1** rows decoded off the main thread: the sheet bytes are fetched once and cut with `createImageBitmap(Blob, rect)`, which decodes on a worker.
  file:// or a failed fetch falls back to 311's path. **an100Bm 500–650 → 6–13 ms per 6 s; L106 pass at desk zoom 5.9–8.2 → 1.5–1.7 ms a pass.**
- **P2** static light layer drawn 1:1 on whole device pixels, only the pieces that hold pixels (128² grid). The lift clip is cut to the
  pieces / shadows that touch a highlighted tile (a small mask, not the whole canvas). A layer made mid-zoom (399's 3% step) is rebuilt once the zoom holds.
- **P3** `{willReadFrequently:true}` for canvases made by 346's sharpened cells and by the 321/334/346/398 base clean-ups and 396's outline.
  `--gpu` desk z2: sharpen 3 × 756 ms → 4 × 6 ms; an100CellCanvas 48 × 25.7 ms → 64 × 0.08 ms; bst100CellCanvas 36 × 29 ms → 48 × 0.44 ms.
- **P4** blank #fx95 overlay not cleared again (P107.st.fxSkip ≈ one per draw).
- **P5** `bst100Live`'s layout read cached per animation frame.
- Lighting auto-drop to Light is untouched; it stays a safety net only.

## Before / after (live play, CPU box, median of 3 interleaved runs each, `--cpu`; before = this branch without 401, after = P1–P4)
Load during the runs: 2.4–7.9 on 4 CPUs, so the p50s move with load. p95 / max / main-CPU are the robust rows.

| config | fps | frame p50 | frame p95 | % frames >50 ms | js p50 | js p95 | js max | main CPU/frame |
|---|---|---|---|---|---|---|---|---|
| desk-flat | 29.2 → 27.0 | 17.1 → 17.4 | 107.9 → 120.5 | 12.0 → 18.3 | 0.0 → 0.0 | 24.4 → 27.9 | 200.2 → 84.9 | 25.0 → 23.8 |
| desk-z14 | 17.3 → 19.5 | 37.7 → 39.0 | 139.1 → 122.4 | 31.4 → 32.8 | 5.7 → 6.5 | 50.3 → 18.7 | 224.6 → 109.4 | 47.9 → 39.1 |
| desk-z2 | 13.4 → 16.1 | 55.0 → 47.9 | 188.4 → 147.2 | 56.1 → 47.5 | 7.8 → 7.3 | 120.2 → 53.0 | 178.6 → 159.2 | 58.6 → 52.0 |
| hd-z14 (DPR 2) | 6.1 → 6.5 | 140.7 → 120.9 | 303.9 → 251.2 | 100 → 100 | 66.8 → 57.8 | 182.7 → 129.7 | 241.9 → 146.9 | 143.8 → 118.1 |
| phone-z14 | 10.7 → 12.7 | 67.5 → 65.2 | 232.5 → 159.1 | 80.3 → 75.6 | 33.4 → 30.1 | 63.6 → 51.8 | 216.2 → 72.6 | 82.6 → 70.7 |
| phone-z2 | 9.5 → 11.5 | 70.7 → 72.1 | 217.5 → 178.4 | 76.6 → 75.7 | 28.6 → 29.5 | 146.9 → 76.2 | 267.9 → 274.8 | 98.6 → 80.9 |

Reading it:
- The hitches are mostly gone. Board-paint js p95 drops 2–3× zoomed (desk z1.4 50 → 19 ms, desk z2 120 → 53, phone z2 147 → 76), js max is halved, and main-thread CPU per frame is down 5–18 %.
- The p50 frame on this box is still the software canvas raster (~20 ms a frame at desk zoom, ~4× at DPR 2), so the box itself cannot reach 60 fps.
- The GPU-path fix (P3) cannot be measured here except under SwiftShader (above). **Real laptop / phone: not measured. Assumed, not measured.**
  He should check the 288 frame meter zoomed on his laptop and phone in the beta.

## Look (tools/bench/shots107.js, 401 on vs off, same frame; PNGs in the session scratchpad perf/shots/, not committed)
Max channel difference 0–28 levels; pixels over 8 levels ≤ 0.39 %; mean ≤ 0.30 level. The diffs are the static shadows' ≤ ½-device-px snap to the pixel
grid: soft edges and the contact ring at the pillar bases (×16 diff images show smooth shifted outlines, no seams). DPR 2 at z2: max 3. Night ≤ 19.

---

# beta 3: CPU Fast on a GPU canvas (405-v107perf2, his beta-3 note 4)
His report (laptop, GPU canvas, v1.07 beta 3): "all animations slow it down still"; Hand to CPU + CPU speed **Fast → 0–10 fps**; ~57 fps idle /
zoomed. Later: Lighting Off did not help, Animations Off only a little, "when CPU takes turns/actions it slugs".

## Method
- **GPU path emulated:** Chromium with `--use-gl=angle --use-angle=swiftshader --enable-gpu-rasterization --ignore-gpu-blocklist
  --enable-accelerated-2d-canvas --enable-unsafe-swiftshader`, real scrollbars (`--hide-scrollbars` dropped). CDP SystemInfo then says
  `2d_canvas: enabled, rasterization: enabled_force, gpu_compositing: enabled`; WebGL renderer "ANGLE (… SwiftShader …)". A 1-px getImageData
  of a 1440×900 canvas costs 12 ms (2.6 ms on the plain CPU path): read-backs are real here.
- **Tools:** `tools/bench/live.js --gpu --speed fast` (new `--speed`, `--rb` = every blocking GPU read-back on the main thread with its call chain,
  `--decodes`, `--natives`); `tools/bench/gpu107.js` (paused match, the board / render() redrawn every frame, one layer or effect off at a time;
  GPU-process CPU from /proc, raster tasks, paints, style invalidations); `tools/bench/rec107.js` (the in-game recorder driven by a script =
  the same report file he would send). Scenario: Democritus at Pompeii, seed 4242, 8 CPU seats, Lighting Full, desk 1440×900 @1 / @2, zoom 1 / 1.4.
- **What SwiftShader can and cannot say.** It rasterises the 2D canvas on the CPU, 4–6× slower than Skia's own CPU raster (200 rects + 200
  small images: 100 ms a frame vs 16.7). So **every** config is ~1 fps on it (Fast 0.8–1.7, Normal 1.1, even with read-backs fixed), while a
  paused match (nothing drawn) is 58 fps. The absolute fps say nothing about a laptop; what it does show reliably is *synchronous waits on
  the GPU* (read-backs) and work that only exists on the GPU path.

## Reproduced?
- **0–10 fps: yes in the emulation, but not for his reason alone.** All-CPU Fast on the emulated GPU: 0.8–1.7 fps, frame p50 160–570 ms, p95 1.1–3.8 s;
  the main thread is 75 % idle (CDP profile) — the frames wait on the (software) GPU. That part is SwiftShader's raster speed, not the game.
- On the plain CPU path (this box) the same Fast match is 27–31 fps with the main thread 92 % busy (draw ≈ 21 %, render ≈ 6–10 %, the CPU raster
  of the canvas ≈ 55 %): no 0–10 fps here. AI, autosave, aim, log, audio are each ≤ 3 ms/s (recorder areas, 10 s of Fast play:
  draw 206 ms/s · render 59 · bus 32 (renders run inside BUS handlers) · light 16 · stands 16 · cells 6 · log 5 · clean-ups 4 · save 2 · ai 1 · audio 0.6).

## Causes found (measured on the emulated GPU unless said)
1. **Face JPEGs read the GPU back (main thread blocked 0.6–2.3 s each).** 268's face cache (R99) turns each SVG face into a JPEG in idle time:
   draws it on a plain canvas and calls `toBlob`. On a GPU page that canvas is on the GPU: `toBlob` = `ReadbackImagePixels` → the main thread
   waits until the GPU has finished EVERY queued command, the board's frames too. Trace (`--rb`): `EventDispatch[load] > im.onload (r99Step) >
   RasterImplementation::ReadbackImagePixels` 832–1979 ms, 4–5 a 10-s window (5.6 s of 10 blocked in one run). It is idle-time work, so it
   bites exactly when the CPU is not using the main thread — between CPU actions — and on his GPU this is a full pipeline flush per face.
   Microbench (same flags): `toBlob` of a GPU canvas 605 ms; drawing a GPU canvas into a willReadFrequently canvas 2255 ms; createImageBitmap(canvas)
   0.4 ms (no read-back); createImageBitmap of a willReadFrequently canvas 0.1 ms.
2. **Every render() took six panels out of the page and put them back** (230's `p95Patch`: the live #status/#rosterHd/#roster/#board/#npcPanel/
   #turnInd swapped for empty twins while render wrote). Each render therefore re-styled (the `:has()` rules invalidate up to `<html>`: 2993
   style invalidations in 2 s), re-laid-out and **repainted those panels whole**: 29 raster tiles a render (plain path, gpu107 `--raster`), and on a
   GPU page that is GPU raster, 4 times a second while a CPU acts (230's coalescing). render() alone, once a frame, on the emulated GPU: 0.2–4 fps
   and 0.8–13 s of GPU-process CPU a frame vs 0.28–0.37 s for a board draw — the DOM, not the canvas, was the heavier GPU load per action.
3. **312's bst100Live read `cv.offsetParent`** (a forced layout after each panel update) on every beast tick: `shown` 279 ms self per 8 s in the
   plain Fast profile (3.5 % of the main thread) — 401's per-frame cache still forced one layout a frame.
4. **Cell canvases on the GPU feeding in-memory clean-ups.** 401 made a cell canvas in-memory only when 346 sharpens it; the clean-ups /
   outline / corpse colour picks draw cells into in-memory canvases — with a GPU cell each such copy is a read-back. In the steady Fast window
   the recorder's `readback?` count was 0 (they happen on new poses / falls / corpses), so this one is a guard, not a measured win.
5. **Not changed (measured, documented):**
   - The emulated GPU's per-draw cost (any layer): with nothing drawn 58 fps; one board draw a frame 3–12 fps, and turning any single layer off
     moves it within the noise. A real GPU does this compositing in a few ms; the 288 meter's ~57 fps idle/zoomed on his laptop agrees.
   - Democritus' pots (192's jug): ~540 fillRect + 1 clip each frame (the grain) — the most draw calls of any item; drawPot ≈ 2.6 ms/s on the CPU path. A
     sprite cache needs a copy of 192's painter (ctx is a const); left for now.
   - Unattributed native read-backs remain on the emulated GPU (`RunTask > ReadbackImagePixels` with no script, 0.9–2.7 s, 1–3 a 10-s window, also
     one inside pace96's frame draw). Not found; the recorder's long tasks / long animation frames on his laptop will say if they happen there.
   - The action bar (#actions, outside 230's panels) still rewrites a few nodes / attributes on each render (data-en84, btnZoom title, round chip).

## Fixes (405-v107perf2, kill switch `flavius_v107perf2off=1`)
- **Q1** 268's `r99Step` draws the face on a `{willReadFrequently:true}` canvas: same JPEG, no GPU read-back. Emulated GPU: face read-backs 4–5 →
  0 a window (blocked main thread 5.6 s → 0 in the worst run).
- **Q2** `bst100Live`'s "board shown" from a ResizeObserver on #cv (`P107B.vis`), no layout read.
- **Q4** `p95Patch` keeps the live panels in the page: the id is parked, the twin is written in a hidden `#p107hold` placed first in `<body>` (so
  the render's lookups find the twin's elements first), then morphed into the live panel. Per render on the plain path (gpu107 rendernodraw):
  raster tiles 29 → 10, main CPU 47 → 37 ms; DOM mutations of an unchanged render: the 53 text + ~80 child-list changes of the six panels are gone
  (only the id parking and the action bar's own churn are left). `P107B.hold=false` = 230's swap (tv107r checks both).
- **Q5** every canvas made by an100CellCanvas, bst100CellCanvas, g6Scaled, b103Scaled, bs101Proc and cv107Lie is in memory (P107.wrf scope), so a
  clean-up never copies a GPU canvas. `P107B.cellsOn=false` = 401's rule.
- **Q3 the recorder** (288's frame meter, "⏺ 10 s"): the report file he can send. Areas are timed with wrappers put in at the start and taken out
  at the end (tv107r: the same function objects before and after), so nothing runs while it is off.

## Before / after (plain CPU path, 3 interleaved runs each, `live.js --speed fast --cpu`, before = `flavius_v107perf2off=1`)
Load 2–4 on 4 CPUs; the box's software raster keeps the main thread ~92 % busy, so the fps gain is bounded here.

| config | fps (median) | frame p95 | long tasks ms / 8 s | main CPU / frame |
|---|---|---|---|---|
| desk-flat Fast | 28.5 → 31.0 | 72.7 / 71.2 / 84.2 → 72.3 / 66.5 / 65.4 | 1061 / 925 / 1099 → 955 / 664 / 480 | 32.0 / 32.2 / 34.3 → 30.0 / 29.6 / 31.4 ms |
| desk-z14 Fast | 23.5 → 25.6 | 96.6 / 87.5 / 82.4 → 80.1 / 82.7 / 80.4 | 2034 / 1762 / 1304 → 1401 / 1244 / 1460 | 42.7 / 40.0 / 39.0 → 36.2 / 38.7 / 35.7 ms |

Emulated GPU (desk-flat Fast, 2 runs each): fps stays ~1 (SwiftShader-bound, see Method); the main-thread read-backs from faces: 5 (5.6 s) and 1 (0.6 s)
→ 0 and 0. **His laptop: not measured. Assumed, not measured** — he should run ⏺ 10 s in a Fast all-CPU match and send the file; it names what
blocks (long tasks with the areas inside them, long animation frames with the scripts, read-back risks with who asked, the GPU renderer string).

## The recorder report (flavius-perf-<date>-<time>.json)
`{kind:'flavius-perf', v:1, game, at, secs, ua, gpu:{vendor,renderer}, cores, memGB, dpr, view, canvas, zoom, light, speed, anim, event{ev,round,turns,
players,cpu}, screen, frames{n,fps,p50,p95,max,over33,over50,intervals[]}, areas{name:{calls,ms,perS,max}}, slowFrames[{t,ms,areas}],
longTasks[{t,ms,attr,areas}], longFrames[{t,ms,blocking,render,styleLayout,scripts[{ms,fn,inv,type,pos,layout}]}], counts{newCanvas, canvasResize,
getImageData, toBlob, toDataURL, convertToBlob, createImageBitmap(…), imageLoad, readback?: {n,ms,by{caller:n}}}, layers[], p107, p107b}`.
Areas are inclusive (draw holds light / cells / stands / clean-ups; renders run inside BUS handlers). `pos` in a long frame's script = the character
offset in the page (find it in flavius-arena.html). `node tools/bench/rec107.js <page> [--gpu]` prints the same digest here.
