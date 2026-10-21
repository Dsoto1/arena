# v1.08c — BASELINE measurements (item 8; no budgets — v1.10 D sets them from these)

Build: worktree of claude/cloud-credits-usage-vq4w63 @ b8c9fd6 + this builder's 412-v108cread (WebKit only; Chromium paths untouched),
measured 2026-10-21. Raw output: `tools/plans/v108c/perf/*.json` (+ `*.txt` console logs). One run per cell unless noted.

**Machine:** 4 vCPU container, **no GPU** (headless Chromium 1194, software raster), SHARED with two other builders (1-min load 1.4–5.7
during these runs, printed in each JSON as `load0`/`load1`). Absolute ms are this box's, not a player's: compare like for like (same
tool, same config, A/B in one page where the tool does it). The "WebKit path" is Chromium with `flavius_v107safariforce=1` (406's W1–W5
+ 412) — it shows our WebKit-only code paths and cache churn, NOT Safari's raster (his ⏺ recordings stay the Safari truth).

## 1. Board draw — forged scene (tools/bench/board.js, ms per `draw()`, p50 / p95)

`js` = the draw call (Chromium records; raster deferred) · `flush` = draw + 1-px getImageData (forces the raster now).

| config | desk 1440×900 @1 | desk @2 (desk2x) | phone 390×844 @2 | phone 390×844 @3 | WebKit path desk @2, cap 1.5 held |
|---|---|---|---|---|---|
| day-flat js | 4.7 / 11.9 | 35.2 / 49.9 | 3.6 / 6.7 | 4.2 / 8.0 | 24.5 / 36.7 |
| day-zoom js | 4.2 / 8.2 | 34.3 / 45.6 | 3.5 / 5.5 | **23.5 / 37.1** | 21.7 / 27.5 |
| night-flat js | 4.8 / 10.1 | 41.3 / 60.9 | 4.0 / 6.3 | 4.3 / 9.1 | 27.7 / 45.2 |
| night-zoom js | 4.7 / 7.6 | 35.4 / 52.6 | 5.0 / 8.0 | **27.5 / 34.6** | 22.9 / 31.6 |
| day-flat flush | 15.5 / 25.9 | 44.1 / 59.0 | 14.5 / 19.3 | 28.2 / 45.4 | 32.6 / 47.0 |
| day-zoom flush | 24.6 / 36.2 | 57.5 / 92.8 | 17.7 / 25.9 | 33.4 / 50.0 | 47.3 / 66.7 |
| night-flat flush | 19.5 / 30.2 | 50.9 / 70.7 | 16.9 / 21.6 | 29.1 / 38.7 | 43.7 / 61.4 |
| night-zoom flush | 28.3 / 43.9 | 68.4 / 90.6 | 22.4 / 31.7 | 37.5 / 50.5 | 55.3 / 78.9 |

Files: board-chromium (desk, phone@2, desk2x) · board-phone3 · board-wk15 (WebKit path, `flavius_v107dpr=1.5`) · board-wk (WebKit path
WITHOUT the held cap: 406 W1 dropped every view to 1× on this slow box within the warm-up — desk2x js 4.2 / 7.4, flush 14.5 / 24.1;
that drop is what his Mac does when frames stay > 45 ms).
Readings: (a) at a device ratio ≥ 1.5 one layer's js jumps to 15–22 ms (`walls`, `decals` or `tiles`, varies run to run, L106 figs
14 ms in one desk2x run) — a board-sized blit forcing the queued raster inside js on this CPU-raster box, i.e. raster cost of 2.25–4×
the pixels, not a cache miss (layer builds 0). (b) **phone @3 zoomed: js 23–27 ms vs 3.5–5 at @2** — the same jump, from the zoomed
board at 1164×951 device px; worth a look in v1.10 (phones are DPR 3). (c) Lighting itself (L106) stays 0.3–1.1 ms a pass everywhere
except that desk2x run.

## 2. Live play — a real all-CPU match (tools/bench/live.js `--cpu --mem`, Normal speed, 6 s after 3 s warm)

frame = the rAF interval; js = board paint inside it; CPU = renderer main-thread time per frame (trace). Lighting: desk/hd Full, phones Light.

| config | fps | frame p50 / p95 | js p50 / p95 | CPU ms/frame | long tasks n / ms |
|---|---|---|---|---|---|
| desk-flat | 37.7 | 17.3 / 86.1 | 0 / 16.6 | 16.6 | 9 / 755 |
| desk-z14 | 18.2 | 36.1 / 125.9 | 5.9 / 28.5 | 36.5 | 25 / 2000 |
| desk-z2 | 30.6 | 22.5 / 83.8 | 4.1 / 26.2 | 27.8 | 15 / 1379 |
| desk-z14-aim | 49.1 | 16.8 / 42.2 | 0 / 11.3 | 9.0 | 4 / 242 |
| desk-z14-nobase | 31.8 | 20.8 / 73.8 | 3.8 / 19.2 | 23.7 | 14 / 1025 |
| hd-flat (@2) | 19.2 | 17.2 / 174.1 | 0 / 109.8 | 34.5 | 35 / 3389 |
| hd-z14 | 11.0 | 82.8 / 140.5 | 39 / 73.1 | 83.1 | 65 / 5045 |
| hd-z2 | 7.8 | 87 / 307 | 56.2 / 121 | 126.9 | 48 / 5078 |
| phone-flat (844×390 @2) | 20.2 | 40.6 / 100.7 | 20.8 / 34.3 | 45.5 | 19 / 1240 |
| phone-z14 | 23.3 | 35 / 91.3 | 17.8 / 32.2 | 38.6 | 22 / 1382 |
| phone3-flat (390×844 @3) | 36.3 | 17.1 / 77.3 | 0 / 12.7 | 19.5 | 6 / 412 |
| phone3-z14 | 28.9 | 29 / 76 | 17.2 / 28.6 | 29.6 | 12 / 781 |
| WebKit path hd-flat (cap 1.5) | 26.1 | 17.2 / 146.3 | 0 / 76.2 | 23.1 | 31 / 2601 |
| WebKit path hd-z14 | 12.7 | 68.6 / 154 | 22 / 58.5 | 59.0 | 49 / 3881 |
| WebKit path hd-z2 (2nd run; 1st: 2.9 fps, box contended) | 7.1 | 103 / 245 | 59.9 / 195.5 | 101.9 | 42 / 4690 |
| WebKit path desk-z14-nobase | 37.1 | 21.3 / 54.9 | 4.1 / 13.7 | 22.3 | 5 / 383 |

Files: live-chromium (the first 12 rows; its phone3 rows ran with Lighting Full by a tool slip, fixed → live-phone3 = the rows above),
live-wk, live-wk-hdz2b. (The phone-flat row reports z 1.4: 07 zooms a phone in by default.)

## 3. Decoded picture memory (live.js `--mem`, MB = px × 4, nominal decoded size — the browser may discard / hold GPU copies)

| config | figure sheets (`<img>`) + row bitmaps | beast sheets | cells (figures + beasts) | page canvases | JS heap | 2× sheets |
|---|---|---|---|---|---|---|
| desk @1 (all desk rows) | 710.7 + 29–45 (16 sheets) | 35–133 | 0.9–3.7 | 6.4 | 45–72 | yes (410: ≥ 900 px wide) |
| hd @2 | 710.7 + 24–32 | 119–133 | 3–10.5 | 20.7 | 47–68 | yes |
| phone @2 / @3 | 177.7 + 10–15 | 35.1 | 2.2–8.8 | 10.5–12.6 | 47–77 | no (phone) |

**The 2× sheets are the memory headline:** 16 printed-class sheets decode to ≈ 711 MB nominal (≈ 44 MB each) vs ≈ 178 MB at 1×
(410's `deviceMemory > 4` gate is the only guard; Safari has no `deviceMemory`). Cells / clean-ups / corpses / W3 copies are < 25 MB together.

## 4. Peak frames, zoom eases, Fast CPU

| tool | config | fps | p50 / p95 / max ms | draw p50 / p95 ms | long tasks | rebuilds |
|---|---|---|---|---|---|---|
| tools/perf95/zoom100.js | normal, flat | 21.8 | 16.7 / 133.4 / 333 | 9.4 / 51.1 | 24 / 2197 ms | t96build 2 |
| zoom100.js | normal, zoomed | 18.5 | 33.4 / 133.3 / 400 | 8.6 / 50.5 | 33 / 2801 ms | z99build 2 |
| zoom100.js | fast, flat | 16.3 | 33.4 / 133.4 / 1267 | 0.1 / 0.2 | 22 / 1965 ms | — |
| zoom100.js | fast, zoomed | 22.1 | 33.4 / 100 / 217 | 0.1 / 0.2 | 25 / 2113 ms | — |
| tools/perf95/prof.js | fast, spectators, 15 s | 24 | 29 / 100 | — | 42 / 3831 ms | top self: drawImage 1107, font 457, getImageData 451, innerHTML 406 ms |

## 5. The ⏺ recorder (405 REC107 via tools/bench/rec107.js — the same report file he sends)

| run | dpr | zoom | Lighting | fps | p50 / p95 / max | >50 ms | draw / render / bus / clean / light ms/s | getImageData n / ms |
|---|---|---|---|---|---|---|---|---|
| desk, Normal | 1 | 1 | Full | 21.9 | 16.7 / 150 / 483 | 50 | 217 / 128 / 104 / 2.5 / 27.9 | 2 / 58 |
| WebKit path, bases off (switched at start), Normal | 1.5 | 1.4 | Light | 11.6 | 66.7 / 183 / 350 | 75 | 444 / 40 / 22 / 79.7 / 6.2 | 95 / 332 |

The report now times `createImageBitmap`'s synchronous part (405) and carries `rb108` (412's counts) — on his Mac the next recording
shows whether the worker path costs anything on the main thread.

## 6. Item 0b — the bases-off read-back, before / after 412 (tools/bench/readback.js, WebKit path, cap 1.5, DPR 2, 15 s, Normal)

| zoom | main-thread `bs101Off` getImageData before | after | cells done in the worker | interim frames | first cells still sync (no earlier base-less cell) |
|---|---|---|---|---|---|
| 1 | 18 | 4 | 20 | 29 | 4 |
| 1.4 | 18 | 4 | 19 | 20 | 4 |

At his measured 28 ms a call: ≈ 504 → 112 ms per 15 s of play (his 075400: 821 ms / 10 s → ≈ 160). Pixels: byte-identical to 321's
sync path (tv108c: 40 / 40 cells). Other main-thread read-backs in the same runs (unchanged, each once per beast cell ever): g6Proc
20–28, cl398 35–43, b103Wall 15, sh103Sharpen 24–32 (zoomed), cv107Alpha 2. Files rb-before-wk-z*.json / rb-after-wk-z*.json.

## 7. Guard tests (the suite's own numbers at this build)

All pass (`node tools/smartreg.js -j 1 …` 18 / 18 incl. these; each also run alone → perf/guard-*.txt):

| test | what it measures | number at this build |
|---|---|---|
| tv91r | 192 arena look on / off, ms per draw (day; night) | 3.9 vs 3.6 (day); 5.0 vs 4.1 (night) |
| tv92p | 219 LAYERS93 ms / frame; busy ms/s | 4 ms / frame (decals 0.91, stands 0.51, pieces largest); busy: unmanaged 20 · managed active 19 · idle 13 |
| tv95p | perf pass off / on (fps, p50 / p95) | off 13 fps 74 / 293 ms · on 31 fps 38 / 101 ms; decode ms 3578 (all) |
| tv100fps | 288 frame meter | OK |
| tv108x | 2× sheets drawn at the 1× size | bbox within 1 css px (soldier / hero / beast), outline within 4.24 device px |
| tv108l | 409 zoom ease cost | moving frame median 0.3 ms, p90 2.5 ms; torch layer in 2 pieces, step max 2 ms |

## 8. Item 0a lead — 406 W1's 1.5 → 1 drop mid-visit (tools/bench/dprdrop.js)

WebKit path, DPR 2 screen, every system beast's corpse beside a living one, night; W1's automatic drop held off, then forced
(`W1.dropped = true`, as 406 does) — after the beasts died (z 1 / 1.4 / 2, Lighting Full / Light, bases on / off, 1× and 2× sheets) and
while their die rows played (`--early 1`). Every corpse and living beast: the same CSS size before / after (± 1 px; e.g. bear corpse
108.7×118.7 → 110×120 css at z 1.4, its cell re-made at the new device size 163×178 → 110×120 px); 404's checks quiet; the screenshots
match (layout identical, only resolution). **Ruled out in Chromium**: every per-object cache keys on the board's device scale (311
AN100CC, 312 BST100.cc via 346, 404 CV107.lie, 321 through px/mm), every board-sized one on dpr / canvas size (192, 194, 189, 235),
and every cached draw passes an explicit CSS size (a stale device-px canvas would be soft, not big; 346's sh103Blit refuses a cell ≠ ±6 %).
Files dprdrop-*.json.

## How to re-run (one process at a time on a shared box)

```
sh build.sh
node tools/bench/board.js flavius-arena.html --dprs 2 --json board.json                       # desk, phone@2, desk2x
node tools/bench/board.js flavius-arena.html --only phone --phonedpr 3 --json board-p3.json
node tools/bench/board.js flavius-arena.html --dprs 2 --only desk2x --ls flavius_v107safariforce=1,flavius_v107dpr=1.5 --json board-wk.json
node tools/bench/live.js flavius-arena.html --mem --cpu --only desk-flat,desk-z14,desk-z2,desk-z14-aim,desk-z14-nobase,hd-flat,hd-z14,hd-z2,phone-flat,phone-z14,phone3-flat,phone3-z14 --json live.json
node tools/bench/live.js flavius-arena.html --mem --cpu --only hd-flat,hd-z14,hd-z2,desk-z14-nobase --ls flavius_v107safariforce=1,flavius_v107dpr=1.5 --json live-wk.json
node tools/perf95/zoom100.js flavius-arena.html normal 0 8     # normal|fast × 0|1
node tools/perf95/prof.js flavius-arena.html '{"speed":"fast","spect":1,"secs":15}'
node tools/bench/rec107.js flavius-arena.html --speed normal --z 1 --dpr 1 --json rec.json
node tools/bench/rec107.js flavius-arena.html --speed normal --z 1.4 --dpr 2 --ls 'flavius_v107safariforce=1,flavius_v107dpr=1.5,flavius_light106=light' --pre 'SETTINGS.bases101=false;applySettings()' --json rec-wk.json
node tools/bench/readback.js flavius-arena.html --z 1.4 --secs 15 --ls flavius_v107safariforce=1,flavius_v107dpr=1.5 --json rb.json
node tools/bench/dprdrop.js flavius-arena.html --z 1.4 --light full [--x2 1] [--early 1] [--bases off] --shots DIR
node tools/smartreg.js -j 1 tv91r tv92p tv95p tv100fps tv108x tv108l
```
Safari: his ⏺ recorder (405 Q3 / 406 W4), 4 runs like tools/plans/v107/perf/safari-v108b-* (board dpr 1.5 / 1 × zoom 1 / 1.4, bases off),
after the LIB VER 6 device re-render has finished (the 1× runs of 2026-10-21 carry ~420 one-time read-backs from it).
Not measured here: lighting A/B per item (tools/bench/v108ab.js — v1.08's own numbers in tools/plans/v108/MOCKUP.md stand), the aim
overlay's DRAWCOST (tv106d step 8, in its CI log).
