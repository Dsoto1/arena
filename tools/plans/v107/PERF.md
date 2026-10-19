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
