# v1.06 lighting — BASELINE frame times (today's board, before any lighting change)

Harness: `node tools/bench/board.js flavius-arena.html --frames 120 --warm 20 --json out.json` (3 runs) →
`node tools/bench/summary.js out1.json out2.json out3.json`. Build: claude/cloud-credits-usage-vq4w63 @ 850c76c (v1.06 work so far),
measured 2026-10-18 11:13–11:19 UTC.

## The benchmark scene (deterministic, forged — tools/bench/board.js `SCENE`)
Democritus at Pompeii, seed 4242, 8 CPU seats (the 8 printed classes), paused, then forged: the 8 gladiators packed round the centre
(F-6 … H-8), 6 beasts (2 bears, 2 wolves, 2 snakes) among them, the 12 pillars with their Blessing jugs, the chest, one pillar's rubble,
an elimination's blood + a limb's; the soldier is the active fighter (gold ring) mid-SLASH on the bear (slash row frame 2, re-stamped
every frame), a floating "−2" over the bear, 9 move tiles + 1 attack tile forged into `computeHL`. Offline, Normal-speed animation
rules (Animations On, no Reduce motion), stands + crowd on. `p95Defer` is stubbed off so every `draw()` paints (checked: painted 120/120).

Configs: **desk** 1440×900 @1x (board TW 56 px) · **phone** 390×844 @2x, mobile + touch (TW 28 CSS px) × **day / night** (`S.night`)
× **flat / zoom** ("Zoom in", 1.4×, camera on the soldier).

Two passes per config: **js** = `performance.now()` around `draw()` only (Chromium records canvas commands; rasterising is deferred)
and **flush** = `draw()` + a 1-px `getImageData` (forces the raster now; run after the js pass).

## Machine (measured)
4 vCPU container, **no GPU** (headless Chromium, software raster). OTHER BUILDERS SHARED THE BOX: 1-min load before→after each run
1.29→3.4, 3.4→6.34, 6.34→4.99 (4 CPUs). The js rows are stable across the 3 runs (±0.3 ms p50); the flush rows swing much more.

## Results — median of 3 runs, ms per `draw()`
| config | p50 | p95 | max (median) |
|---|---|---|---|
| desk day-flat js | 4.4 | 7.5 | 12.5 |
| desk day-zoom js | 4.2 | 6.1 | 8.3 |
| desk night-flat js | 4.5 | 7.0 | 13.6 |
| desk night-zoom js | 4.6 | 7.8 | 13.8 |
| desk day-flat flush | 16.8 | 32.0 | 35.3 |
| desk day-zoom flush | 20.5 | 32.8 | 34.9 |
| desk night-flat flush | 20.1 | 33.4 | 45.6 |
| desk night-zoom flush | 29.0 | 47.2 | 59.1 |
| phone day-flat js | 4.4 | 8.3 | 21.8 |
| phone day-zoom js | 4.7 | 7.2 | 10.1 |
| phone night-flat js | 4.5 | 8.0 | 17.3 |
| phone night-zoom js | 4.6 | 7.8 | 10.2 |
| phone day-flat flush | 16.2 | 30.5 | 35.6 |
| phone day-zoom flush | 19.3 | 32.6 | 42.6 |
| phone night-flat flush | 19.3 | 29.7 | 33.0 |
| phone night-zoom flush | 25.3 | 40.7 | 45.5 |

Per layer (219 LAYERS93 averages, desk day-flat js, median of 3): pieces 2.17 · stands 0.63 · decals 0.46 · floor 0.41 · walls 0.22
(0.50 at night) · fx 0.13 · tiles 0.07 · highlights 0.07 · overlays 0.03 ms. The remainder of `draw()` (~0.3 ms) is setup (sizing,
the per-frame canvas reset, `computeHL`).

## Reading it
- Against the frame target (≤ 16 ms laptop, ≤ 33 ms phone): the JS side of today's board is ~4.5 ms everywhere, so the lighting
  budget the notes set (shadows ≤ 2 ms of the frame) fits on the JS side with room.
- The flush rows are this box's CPU raster (no GPU) — they exceed 16 ms already TODAY, so they are not a laptop prediction; they are
  only useful to compare before/after on the same machine and load. A real-device check (his laptop + phone, the 288 frame meter) is
  still needed before the full build — **assumed, not measured here**.
- Overlay contrast (WCAG ratio of a highlight pixel vs the same pixel without the highlight, 6 points in each empty highlighted tile;
  `--shots`): desk day 1.28–1.32 mean (min 1.12), desk night 1.13–1.14 (min 1.03) — night move tiles are already faint today.
