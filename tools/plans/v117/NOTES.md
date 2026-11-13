# v1.17 (proposed) — the build split (item 2 of his order 2026-11-13). NOTHING built; facts + questions.

## Facts measured 2026-11-13 (lead)
- Script by topic (raw, 10.62 MB, 433 modules): manager 25% · board 16% · online 14% · ui 8% · studio 7% · core 7% · batches 6% · rest 17%.
  Manager + Studio + Online + lessons + city = 5.16 MB = 49%.
- The build order is NOT grouped by topic: 302 topic switches along build.sh's list; the first lazy-topic module is #18 of 433.
- WRAP ORDER HAZARD: 974 wrapped functions; 164 are wrapped by both a lazy-topic and a core-topic module; in 112 of them a core wrapper
  is installed AFTER a lazy one today (newWorld, startEvent, drawNPC, cardHTML, eventDef, loadCustoms, infirmaryHTML …). Loading the lazy
  topics later would swap those orders = possible behaviour changes in 112 functions.
- Movable with NO wrapper-order swap (by the wrap criterion alone; top-level references not yet checked): 2.67 MB = 25% of the page
  (manager 1.83 of 2.64 · online 0.36 of 1.45 · studio 0.31 of 0.76 · city 0.09 · lessons 0.08).
- Minifying the main script (esbuild, whitespace + syntax, names kept): raw 10.42 → 8.27 MB (−20%), Brotli −22% (q9 3.06 → 2.40 MB).
  Cost: the error log's line numbers point into minified code unless a source map / the readable copy is kept beside it.
- Inline base64 images in the page: 0.64 MB (30 webp) — could become asset files (cached separately).
- Wire sizes for the whole page: uncompressed 10.6 · gzip 3.85 · Brotli 2.84 (v1.16a) · Brotli + minify ≈ 2.2 MB.

## Options (his pick wanted)
A. v1.17 = minify + move inline images out (days, low risk): ≈ 2.84 → ≈ 2.1 MB on the wire, less to parse. No split.
B. v1.17 = A, then v1.18 = SAFE split: only the 25% that moves without changing any wrapper order (mostly Manager), found by a tool that
   proves it (wrap order + top-level references), loaded when Manager / Online / Studio is opened, with a real progress bar. Beta first.
C. Full topic split (49%): needs the 112 order swaps reviewed one by one. Weeks, real regression risk. Not recommended now.
