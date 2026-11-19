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

## His pick 2026-11-13: **B** — v1.17 = minify + inline images out (no split); then v1.18 = the SAFE split (the ~25% a tool proves
moves without a wrapper-order change; loaded when Manager / Online / Studio opens; real progress bar; beta first).
REPLACES the 2026-11-06 plan "v1.17 = core + lazy Manager/Studio/Online chunks" (docs/decisions.md) — the modes are only partly separable.
Lead's design for v1.17 (build): minify PER MODULE inside build.sh (esbuild transform, whitespace + syntax, names kept), so the built page
= what is tested = what ships, module boundaries stay (smartreg's maps), a missing esbuild = unminified build + release.sh refuses;
the error log names the build; inline images move to assets/ only where the canvas never reads their pixels (file:// taint).

## BUILT 2026-11-13 (builder; step 1 of B — the lead does the badge / MILESTONES / release)
- tools/minbuild.js + build.sh: `flavius-arena.html` = every module minified on its own (esbuild 0.27.7 pinned), `window.BUILD_MIN=1`;
  readable copy `flavius-arena.src.html` + module table `flavius-arena.mods.json` (both gitignored). 10.62 → 8.74 MB, gzip -9 3.85 → 3.12,
  Brotli q11 2.84 → 2.29 MB (−19%); build 0.6 → 1.7 s; phone Slow-4G profile (tv116load, gzip): menu 28.2 → 24.4 s.
- WHITESPACE ONLY, not "whitespace + syntax" (the design above): esbuild's syntax pass inlines top-level `const` values into functions
  (AVHIT_MS → 1300), drops dead code (function counts change in 15-custom, 43-beasts, 290-v100world) and rewrites statements — for
  0.2% on the wire (Brotli 2.242 vs 2.246 MB, all modules). One constant (SYNTAX in tools/minbuild.js) if he ever wants it; tv117min
  then shows what breaks first (2 timer sweeps).
- 29 modules stay raw (616 KB of source, ≈ 45 KB of Brotli): a function declared inside a top-level block — esbuild rewrites it
  (`let name2=function…;var name=name2`). Moving those declarations to the top level of their module would let them minify (v1.18?).
- Found and fixed: 00b-perf matched 4 timer sweeps on single-quoted source text (onlCry80, rb82Fit, srInfo73, tutlock66) — quotes fold now.
- IMAGES: nothing moved. 29 inline images = 0.64 MB: 18 standees + zoraMini (0.59 MB) are drawn on the board, whose pixels are read
  (396/423 aim alpha, 403 silhouettes, 321 bases — each has a "tainted (file://)" fallback that behaves differently); 9 weapon icons
  WICO75 (45 KB: SVG `<image href>`, `<img>`, and 277's hit line on the canvas) and PTOK81_HERO (12 KB, canvas-processed) → the safe set
  is under 0.15 MB. Idea for v1.18 (it is a "load later" change): ship the standees as a script asset (data URIs inside assets/standees.js,
  like the language packs) — no taint, cached apart, mkshare already inlines .js assets.

## Added 2026-11-19 — WebKit findings (cloud session; his picks)
Facts: tools/ci/idbprobe.js on WebKit (run 44545211173): an EPHEMERAL session (Playwright b.newContext = Safari Private Browsing) refuses to
store a Blob in IndexedDB ("Error preparing Blob/File data to be stored in object store"); objects + ArrayBuffers store fine; a persistent
profile stores Blobs. 311's figure cache stores Blobs and swallows the error → in Safari PRIVATE windows device-rendered figures are rebuilt
every visit. tv100an 10/12c failed on WebKit for this reason (same over http: run 44543221342). 5a fixed (BUS 'hit' draw); 2b flaked once.
His picks:
1. a) tv100an on WebKit runs steps 10/12 in a SAVED profile (launchPersistentContext = a normal Safari window); Chromium unchanged.
2. a) GAME FIX in v1.17: the figure cache stores ArrayBuffers (works in every WebKit session), reads old Blob records too; a failed write is
   logged once (no more silent tx.onerror → ok). One new module (CLAUDE.md §4), kill switch.
3. a) http stays an opt-in dispatch input (file:// default); tv100an 2b samples the walk like 5a; one more WebKit run of tv100an to confirm.

## His go 2026-11-19 on the lead's improvement list (1, 2, 3)
1. Ship v1.17 (minify + the Private-window cache fix) — release steps, [full] run, beta first.
2. Silent-failure audit (READ-ONLY first, list to him): every place a failed save/write is swallowed (Store, Manager saves, backups,
   caches, settings), ranked by what a player could lose. Fixes only after his picks.
3. WebKit probe for the live Safari board bugs: oversized/blurry beast corpses (2026-10-21 Safari 26.6; AGAIN in his screenshot
   2026-11-19: a big blurry corpse with bone shards around two fighters, a red smear, a striped corpse top right), the dark round shadow
   discs, and the 2× sheets' memory on Safari (no deviceMemory, ≈711 MB). Measure on WebKit, report, then fix on his pick.
