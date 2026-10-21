# Render caches — map + v1.10 proposal

What the board keeps between frames, what each cache is keyed by, who throws it away, and the one-owner proposal for v1.10 A.
Source: tools/plans/v108c/NOTES.md item 7 (his 5a, 2026-10-21), checked against the code at v1.08c (file:line below = `src/board/…`
unless named). **Proposal only — nothing in §3 is built.** Read this before adding a cache or a hand-written invalidation.

## 1. The caches

| # | cache (module) | holds | key / identity | thrown away by | history |
|---|---|---|---|---|---|
| 1 | `AR91.L` under / deco / top / light / sky (192; key via 208) | stone layers; LIGHT (+ 409 grain / planks / depth by day) | `ar91Key` (208:15): canvas w×h, dpr, TW, 208 ref-frame id, type, ROT89, N, material, tiers, ludus, night, **`AR91.ver`**, texture, lite84 | key; `AR91.ver++` on a stone image load (192:99), 277 `A100X.set` (277:176), 304 `ins100ArenaBump`, 409 `v108Sig` (409:60) | 208 (OX/OY in the key → repaint every camera frame → ref frame), 294 (ref per 0.18 screen), 330 (2nd slot `ZB101.alt`), 403 (board column width → every size-keyed layer rebuilt) |
| 2 | `WEAR91_C` (194) | sand wear, blood trickles, stains, settled rubble (one board-sized canvas) | 194:220: S id, TW, ROT89, **dpr**, lite, gore, `w.ver`, rotation, blood count + last seeds, still rubble, drains, stone, theme | key; `w.ver++` per wear step | — |
| 3 | `TILES96` (235) | the 169 sand tiles | `tiles96Key` (235:46): transform, iso projection, theme, S id, zones, scars, sand, ROT89, lite84 | key | 260 (camera in the key → rebuild per zoomed frame), 330 (ease frames overwrote the unzoomed cache) |
| 4 | `Z99` chunks / `Z100` scaled-last / `ZB101.alt` (260 / 294 / 330) | zoomed whole-board tiles in pieces (ImageBitmaps, `z99Bits`); scaled stand-ins while the zoom eases; the idle pre-bake second slot | `Z99.key` + chunk x,y (260:101); zoom, size, theme, zones, state; `Z100.hold` settle timer | key; settle draw (`z100Settle`, 294:39) | see 3 |
| 5 | `NIGHT91.cache` (189) | night grade (+ 409's pools baked in) | `night91Bake` (189:80): Wd, Hd, **dpr**, TW, OX, OY, STANDS, N | key; **409 clears `NIGHT91.key` / `.cache` by hand** (409:60, :133) | 409 F1: re-baked every zoom frame → last sharp grade scaled, re-bake after 160 ms |
| 6 | `L106.layer` (399) | static shadow layer: pillar / jug / chest casts + contacts | `l106Key` (399:129): mode, night, TW·ds 3 % step, orientation, pillars (+ jugs, moving), chest, rubble | key; **409 nulls it by hand** (409:60) | 401 P2 split into aligned pieces |
| 7 | l106 cell / sprite caches (399 `l106Mk` / `l106Cell`, `L106.cc`) | per-cell shadow sprites (`_l106` canvases) | name·q·sun az·el / id·fx·fy·q | key (LRU) | — |
| 8 | `V108.tl` / `V108.tb` (409) | torch shadow layer, built over several frames | 399's key + `'|v108'` **and** `tl.src===Ly0` identity (409:252) | 399 rebuild; `v108Sig` | v1.08 beta disc shadows (casts paired by identity; Safari still open) |
| 9 | `AN100CC` (311 `an100CellCanvas`) | pre-scaled figure cells, LRU 400 | image id (`AN100CCID` WeakMap) + set·name·i + source rect + 3 % step of scale × ds (311:391) | LRU; a new image (2× swap, 410) = a new id | — |
| 10 | sh103 (346) | **in-place** unsharp mask of those cells (and 312 / 334 beast cells) | flag `c._sh103` on the canvas (346:54–57), no revision | never (one-way mutation of the cached canvas) | **403 F4**: aim outline built from the unsharpened alpha (key lacked `_sh103`) |
| 11 | `BS101.cache` (321) | bases-off / thin-base processed cells | WeakMap per **source canvas object** → Map (≤ 80) of mode·rect·fam·anchor·ppm (321:177) | the Map's 80 cap; GC of the source | Safari: 28 ms per getImageData (v1.08c 0b → 412 below). Stale if 346 sharpens the source **after** 321 processed it (key has no `_sh103` / revision) |
| 12 | `RB108` jobs + `recent` (412, v1.08c, WebKit only) | cells in flight to the worker; the last ≤ 48 base-less cells drawn (interim stand-ins) | in flight: source object + 321's key; recent: family + base point + px/mm, ≤ 90 draws old | worker reply → written into #11; 4 s stale timer | new in v1.08c |
| 13 | `an100Bm` rows (311 + 401 P1) | ImageBitmap per action row (off-thread decode) | per sheet object `o.bm[name]` | 311 `an100Trim`; 410 `an100X2Fail` closes them | v1.07: main-thread decodes 100–150 ms (fixed by 401) |
| 14 | `BST100.cc` (312 `bst100CellCanvas`) | pre-scaled beast cells, LRU 480 | `im.src` length + tail · face · row · 3 % step of scale × ds (346 passes ds) (312:102) | LRU; **410 `x108Back` clears it whole** (410:73) | — |
| 15 | `G6.cache` / `B103.cache` (334 / 346) | base-less beast cells (1× sheet coords) | `im.src` tail · face · row (334:110) | never (Map, `G6.max`) | 410: beasts drawn with bases off stay 1× (the pixel rules are tuned on 1×) |
| 16 | W3 (406, WebKit only) | ImageBitmap copy of an in-memory cell | canvas identity + **`__v107` content revision** bumped by every mutating 2D call / resize (406:78–84) | any mutation; 600 unused board draws → closed | the ONLY content-revision counter in the pipeline |
| 17 | `AIM106.oc` / `.figs` / `.tmap` (396 + 403) | outline sprites LRU 8; per-frame recorded target figures | ops (img id, rects, transform) + `img._sh103` (403:36); figs reset per `drawLayers93` (396:244) | LRU; every frame | 403 F4; tv106d CI misses (NOTES item 1) |
| 18 | `CV107.lie` / `.sane` / `.face` (404) | lying-corpse canvases LRU 64; die-frame sanity per (kind, facing) | `'b:'+k` / `'g:'+cls` · source x · 3 % step of s × ds · side · flat (404:43) — **no image identity, no 1× / 2× mark** | LRU | bear corpse 2–3 tiles on Safari (0a, open) |
| 19 | `X108` (410) | 1× ↔ 2× sheet per class / beast | per sheet `o.k`; `BEAST100_META[k]` swapped to the 2× meta (`BST108X1` keeps the 1×) | load / fail → `x108Back` (meta back, 2× images dropped, `BST100.cc.clear()`) | readers must use `bst100Scale(M)·M.px` |
| 20 | `LAYERS93` (219) | watcher: hit / miss / key / ms per layer + sub-layer | reads `AR91.L[s].key` / `WEAR91_C.key` | — | the decided owner (§3) |

Checked against NOTES item 7: rows 1–11, 13, 16–20 as written there, with these corrections — #2's key also holds the device ratio,
gore, stone and theme; #11 is not "GC only" (an 80-entry Map per source) and can go stale after a later sharpen; #14, #15 and #12 were
not in the table. Device ratio: every per-object cache (#9, #14, #18, #11 through px/mm) carries the board's ds in its key, and every
board-sized one (#1, #2, #5, #3 via the transform) carries dpr or the canvas size — the v1.08c check of a 1.5 → 1 drop (406 W1)
found no cache drawn at its old size (tools/bench/dprdrop.js, tools/plans/v108c/BASELINE.md).

## 2. Who must follow whom

- **BOARD STATE** (pieces, pillars, rubble, blood, zones) → #2, #3 (S id), #6 static → #8 torch layer; per frame → #17 figs.
- **VIEW** (canvas size, dpr, TW, OX/OY, ROT89, zoom ease) → #1 via 208's ref, #3 / #4, #5 (raw OX/OY), #6 (3 % step) → #8, #9 / #14
  (3 % step) → #10 sharpen → #16 W3 → #17 outline; #11 (px/mm); #18 (scale step).
- **LIGHT** (Lighting pref / mode, night, V108 items, lite84) → #1 LIGHT, #5, #6, #8 — today kept in step BY HAND (409:60 bumps
  `AR91.ver` and clears `NIGHT91` + `L106.layer` + `V108.tl/tb`).
- **ASSETS** (image load, 2× swap, sharpen, bases-off clean-up) → `AR91.ver` (stone textures only), #9 (new image id), #10 (mutates, no
  revision), #16 (`__v107`), #17 (`_sh103` special case), #18 (no identity at all), #11 (source object, no revision), #14 (src string;
  cleared whole on a 2× fall-back), #15 (src string).

## 3. v1.10 A proposal — one owner (his 5a): LAYERS93 generations + a universal per-canvas revision

No new system: 219 LAYERS93 is already the decided owner (v0.93 "LAYER MANAGER … each with its own cache key + Off path", his yes
2026-10-07; built as a watcher only). Two additions:

1. **Four generation counters** `LAYERS93.gen = {board, view, light, asset}`, each bumped in ONE place:
   - `board`: BUS `turn.begin` / `hit` / `elim` / `state` + pillar / rubble / spear moves (218's emitters; no new hooks);
   - `view`: one setter called from 07's canvas sizing + 208 / 294 camera (size, dpr, TW, OX/OY, ROT89, zoom);
   - `light`: the Lighting setting, night, V108 items, lite84 (today 409's `v108Sig`);
   - `asset`: image load (192 `ar91Img`, 311 `an100Sheet`, 312 `bst100Img`), 2× swap / fall-back (410), bases setting (321).
2. **`__v107` everywhere**: 406's per-canvas content revision (bumped by every mutating 2D call and resize) installed on every cached
   canvas, not only on WebKit's in-memory cells. A cache built FROM another canvas keys on that canvas's revision, never on a flag.

Each cache's key = the generations it depends on (§2) + its own parameters. It would **replace**:

| ad-hoc key / bump today | where | becomes |
|---|---|---|
| `AR91.ver` (+ its four bumpers) | 192:99, 277:176, 304 `ins100ArenaBump`, 409:60 | `gen.asset` (stone images) + `gen.light` |
| `NIGHT91.key=''; NIGHT91.cache=null` | 409:60, 409:133 | #5 keyed on `gen.light` (no hand clear) |
| `L106.layer=null`; `V108.tl=V108.tb=null` | 409:60 | #6 / #8 keyed on `gen.light` + `gen.board` |
| `tl.src===Ly0` identity pairing | 409:252 | #8 keyed on #6's revision |
| `o.img._sh103` in the outline key | 403:36 | the source cell's `__v107` |
| `c._sh103` one-way flag as a cache key | 346:54–57 (read by 403) | stays as the "done" flag; consumers key on `__v107` |
| W3's private bump (WebKit only) | 406:78–84 | the universal `__v107` (W3 keeps only its bitmap) |
| 404's identity-less corpse key `'b:'+k·sx·q·side` | 404:43 | + the sheet's `gen.asset` and `M.x2` (1× / 2×) |
| `BS101.cache` source-object key without revision | 321:177 | + the source's `__v107` (fixes the sharpen-after-clean-up staleness) |
| `BST100.cc.clear()` on a 2× fall-back | 410:73 | `gen.asset` in #14's key (no global clear) |
| `CV107.sane` / `G6.cache` / `B103.cache` keyed by `im.src` | 404, 334:110, 346 | + `gen.asset` |

**Before building (v1.10 A):** measure the universal `__v107` cost — it wraps the mutating 2D calls of every cached canvas (W3 does
this today on WebKit only; ≈ 10 wrapped methods). Use tools/bench/board.js `--flush` and live.js on the v1.08c baseline configs
(tools/plans/v108c/BASELINE.md); the budget is set by v1.10 D. Migrate one dependency group at a time (LIGHT first: it removes every
hand clear in 409), each with its kill switch and the replay / pixel tests (tv91r, tv92p, tv106l, tv108l).

Rejected alternatives (Q5): b) a dirty-region model (per-tile rects — a rewrite of every painter); c) keep per-module keys and only
document them (this file) — the stale / over-invalidation history in §1 is what it costs.
