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

## v1.06a final (2026-10-18, after his mock-up ok) — today vs the built v1.06a, interleaved
Build: the v1.06a worktree (399 final: cached static layer + direct figure shadows, every class / severed set / beast baked) vs today =
claude/cloud-credits-usage-vq4w63 @ 1311b4e (its own page + assets). 3 rounds interleaved (today, v1.06a Full) × 120 frames + 20 warm,
`--ls flavius_light106=full,flavius_light106auto=0` (phones would start on Light; Full forced to measure the worst case), then one Light run.
Same box: 4 vCPU, no GPU, headless Chromium software raster. 1-min load before→after: v1.06a 1.18→1.54, 1.18→1.52, 1.49→1.56 · today
1.2→1.18, 1.54→1.18, 1.52→1.49 (quiet box this time; the bakes had finished). Measured, ms per `draw()`, median of 3 runs:

| config | v1.06a p50 | p95 | today p50 | p95 | Δp50 | Δp95 | light pass p50 / p95 (mean) |
|---|---|---|---|---|---|---|---|
| desk day-flat js | 4.9 | 7.1 | 4.2 | 6.1 | +0.7 | +1.0 | 0.7 / 1.0 (0.73) |
| desk day-zoom js | 4.6 | 6.8 | 4.3 | 6.9 | +0.3 | −0.1 | 0.6 / 1.0 (0.70) |
| desk night-flat js | 5.0 | 7.1 | 4.2 | 6.2 | +0.8 | +0.9 | 0.6 / 1.1 (0.67) |
| desk night-zoom js | 4.8 | 8.1 | 4.5 | 7.2 | +0.3 | +0.9 | 0.6 / 1.8 (0.93) |
| phone day-flat js | 4.7 | 6.9 | 4.4 | 7.1 | +0.3 | −0.2 | 0.6 / 1.1 (0.69) |
| phone day-zoom js | 4.7 | 6.9 | 4.2 | 6.1 | +0.5 | +0.8 | 0.7 / 1.0 (0.73) |
| phone night-flat js | 5.1 | 8.0 | 4.5 | 6.5 | +0.6 | +1.5 | 0.6 / 1.0 (0.73) |
| phone night-zoom js | 4.8 | 6.8 | 4.3 | 6.1 | +0.5 | +0.7 | 0.6 / 0.9 (0.65) |
| desk day-flat flush | 17.1 | 27.8 | 15.3 | 21.8 | +1.8 | +6.0 | 0.6 / 0.9 |
| desk day-zoom flush | 23.0 | 34.1 | 19.9 | 30.3 | +3.1 | +3.8 | 0.6 / 1.0 |
| desk night-flat flush | 21.7 | 33.7 | 20.0 | 32.2 | +1.7 | +1.5 | 0.6 / 0.9 |
| desk night-zoom flush | 29.8 | 50.2 | 24.5 | 40.2 | +5.3 | +10.0 | 0.6 / 1.0 |
| phone day-flat flush | 17.6 | 28.0 | 15.2 | 23.9 | +2.4 | +4.1 | 0.6 / 0.9 |
| phone day-zoom flush | 21.3 | 29.0 | 17.7 | 26.0 | +3.6 | +3.0 | 0.6 / 0.9 |
| phone night-flat flush | 21.8 | 32.7 | 19.2 | 30.1 | +2.6 | +2.6 | 0.6 / 0.9 |
| phone night-zoom flush | 27.1 | 43.8 | 22.9 | 33.9 | +4.2 | +9.9 | 0.6 / 1.0 |

Light pass split (Full, median of 3, mean ms a pass after warm-up): static layer blit 0.13–0.21 · figure + beast shadows 0.38–0.54
(14 a pass) · contact 0.10–0.15 · static-layer rebuilds during the 120 measured frames: 0 in every config.
**Light** (contact only, one run vs the same 3 today runs): desk day-flat 3.9 / 6.3 (Δ −0.3), the other configs Δp50 −0.4…+0.2 —
pass 0.27–0.35 ms (mean): inside the noise.
Prototype (MOCKUP.md, buffered): pass 1.57–2.40 ms, Δp50 +1.2…+2.0 (js). Final: pass ≈ 0.6 ms p50 (target ≤ 1 ms), whole draw Δp50
+0.3…+0.8 ms js (target ≤ +1.2 ms).

Reading it: the JS side meets both targets (measured). The flush rows are this box's CPU raster (no GPU): +1.7…+5.3 ms p50 is the
cost of rasterising the shadow pixels (the layer blit + 14 figure cells + contacts; twice under the highlight clip where tiles are lit)
in software — relative only; on a laptop/phone GPU this is compositing work and is **not measured here (assumed small)**. The real
guard on devices is the auto-drop: Full → Light when ≥ 60 % of the frames in 5 s run over 17.5 ms (288's meter / rAF intervals).
Overlay contrast (bench `--shots`, WCAG ratio highlight vs none, 6 points × empty highlighted tile), Off → Full: desk day-flat mean
1.332 → 1.329 (min 1.107 → 1.104), day-zoom 1.317 → 1.316, night-flat 1.135 → 1.136 (min 1.039 → 1.048), night-zoom 1.131 → 1.134,
phone day-flat 1.333 → 1.332, phone night-zoom 1.136 → 1.137 — every config within 0.01 (hlLift 0.85). Shots (not committed):
session scratchpad v106final/ (off_*, full_*, default_* = desk Full / phone Light, compare_*, closeup_*, classes_3x8_facings_before_after.png).
Downloads (measured, file sizes): today anim100_* 9250 KB + beast100_* 4146 KB = 13 397 KB. Re-lit colour sheets +176 KB / +183 KB;
shadow sheets desktop 1094 KB (gladiators + severed 739, beasts 355), phone set 397 KB (268 + 129), 102 files each. A desktop
downloads +1.45 MB (10.8 %), a phone on Full +0.76 MB (5.7 %) — under the ⅓ target; phones on Light (default) load no shadow sheet.
