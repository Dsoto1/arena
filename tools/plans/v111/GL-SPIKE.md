# v1.11 SPIKE — the board through WebGL (his 1a 2a 3a, 2026-10-22)

Question: does drawing the board through ONE WebGL context (textured quads, few draw calls) fix Safari's frame rate before we commit to a
full v1.11 renderer? Module `src/board/419-v111gl.js` (opt-in, OFF by default), bench `tools/bench/gl111.js`, test `tv111gl`.

## 1. What was built

Opt-in only: localStorage `flavius_gl111=1` or the page address ending in **`#perf=gl111`** (00b-perf turns it into the same key for one
load). Off = nothing installed (no hook, no canvas). Rules, dice, online, saves untouched — it only changes where the board's pixels go.

Hook: the outermost `drawLayers93` wrapper + the board context's prototype `drawImage` (only while a GL board draw runs, only for `ctx`).

| what | where it goes | how |
|---|---|---|
| **PLANES** — any drawImage whose source is board-sized (≥ 45 % of #cv): 192 AR91 under / deco / top / LIGHT (source-atop) / SKY (destination-over), 235 TILES96, 194 wear, 399 L106 / 409 torch layers, + the rim (painted once per view into its own canvas) | WebGL canvas `#gl111p` UNDER `#cv` | one texture per source, uploaded only when its content revision changes; the plane canvas is **not touched at all** when the list (sources, revisions, places, ops) is the same as the last draw. 260's `z99Put` (bitmap pieces) is bypassed: the whole layer canvas is one texture. Blend modes: source-over, source-atop, destination-over, lighter, multiply, screen, destination-in/out |
| **SPRITES** — every other drawImage of the `pieces` layer (figure / beast / prop / corpse cells) | WebGL canvas `#gl111s` OVER `#cv` | streamed in the 2D path's painter's order; one draw call per run of quads that share a texture |
| everything else: paths, rects, text, crowd sprites, highlights, lighting's vector parts, overlays, Flavius, duel | `#cv` (2D) between the two | unchanged |

Content revisions: every 2D canvas made after the spike switches on counts its own changes (`__g111`, wraps the mutating calls of its
context + width/height), plus 406's `__v107`; a canvas without a counter is re-uploaded every GL draw (counted). Pictures key on their
address, ImageBitmaps never change. Context loss / any GL error → back to 2D for the visit (`GL111.err`). Cross-origin (tainted) pictures
cannot be textures: that source stays 2D (a `file://` page taints them all — the bench and the test serve the page over http).

**Not ported (draw 2D, GL canvases hidden for that draw):** zoomed boards (`duelCam() > 1`: 260/330 copy #cv into chunks), Naumachia and
Chariot tiles. **Known order changes** (spike shortcuts, visible on close look): 2D content of the layers BELOW a plane now lies above it
(the crowd over the stand walls / deco, zone tints and floor marks over the near wall); 2D parts of `pieces` and the later layers (the
pots drawn in code, aggro tethers, attack rings, the duel vignette, hit flashes) lie UNDER the sprites; clipped / filtered / shadowed
drawImage calls stay 2D. A full build removes these by owning the whole frame (§4).

What the recorder shows (405 ⏺, `gl111` block of the JSON): `on, ctx ('webgl2'|'webgl1'), drawsPerFrame` (WebGL draw calls per board
draw), `texUploadsPerS, texMBPerS, msPerFrame` (JS ms of routing + GL work per board draw), `planesPerFrame, spritesPerFrame,
planeSkips, fallPerFrame` (what stayed 2D and why), `texMB, textures, lost, err`. The usual `page.drawnPerFrame` now counts only the
drawImage calls left on the 2D canvas.

## 2. What it measured (this box)

Board per draw, Democritus at Pompeii, 4 CPU, 1440×900 @1 (board 810×567): **9 planes** (rim, under, deco, tiles, top, light, sky, wear,
shadow layer) + **~46 sprites** routed; **~35 WebGL draw calls** per board draw (sprites are separate textures — no atlas yet); texture
memory ≈ **21 MB**; uploads in steady play **1–5 / s** (the plane canvas is skipped in ~80–87 % of board draws). Left on 2D per board draw: ~80–100 drawImage (crowd,
decals, beasts' clean-up fall-backs) and **~1100 path / rect calls** — 683 of them `fillRect` from the jugs (192's `drawPot` override),
96 in the stands, 95 in the decals.

`node tools/bench/gl111.js --secs 15` (2026-10-22, shared box, load 3.5–7.5; one run per cell — noisy). "2D raster" = a board draw
forced to raster at once on the 2D canvas (FLUSH, p50) = the work Safari's CoreGraphics does; "GL raster" = SwiftShader drawing the quads
(software — on a Mac this is the GPU, ~free); js/draw = drawLayers93 incl. routing + GL calls.

| config (1440×900) | 2D drawImage / frame | 2D raster ms | GL raster ms (SwiftShader) | js / draw ms | GL draw calls / draw | tex MB | uploads / s |
|---|---|---|---|---|---|---|---|
| @1 · 2d | 117 | 28.7 | — | 15.8 | — | — | — |
| @1 · gl (planes + sprites) | 52 | 22.3 (−22 %) | 138 | 21.9 | 34 | 22 | 4 |
| @1 · gl1 (planes only) | 59 | 21.3 (−26 %) | 83 | 12.6 | 1.1 | 20 | 1.7 |
| @1 · 2d-sf (WebKit path) | 95 | 21.7 | — | 10.6 | — | — | — |
| @1 · gl-sf | 32 | 18.0 (−17 %) | 99 | 12.5 | 33 | 22 | 5 |
| **@2 · 2d** | 151 | **67.8** | — | 68.0 | — | — | — |
| **@2 · gl** | 63 | **41.4 (−39 %)** | 124 | 35.5 | 34 | 84 | 3 |
| **@2 · gl1** | 44 | **38.9 (−43 %)** | 97 | 28.5 | 1.5 | 79 | 1.5 |

Readings: (a) the 2D canvas's raster work falls by a fifth at @1 and by **~40 % at @2** (his Mac draws at 1.5×) — the board-sized
blits grow with the pixels, the rest does not; (b) **planes alone (gl1) give all of that win** with ~1 GL draw call a board draw (the
plane canvas is redrawn in only ~15 % of board draws: skips 192 of 221); the sprites add 33 draw calls and JS for no further 2D gain
at this point — they pay only with an atlas; (c) ~60 % of the 2D raster remains: the ~1100 path / rect calls, the crowd, the decals;
(d) fps here is meaningless (SwiftShader GL is slower than the CPU 2D it replaces on a box without a GPU: gl fps < 2d fps);
(e) texture memory ≈ 20 MB @1, **≈ 80 MB @2**.

Headless Chromium draws WebGL with **SwiftShader (software GL on the CPU)** and the 2D canvas with its CPU raster; the box is a shared
4-vCPU container (load printed in the run). Absolute numbers mean nothing for a Mac; only the ratios inside one run do. **Safari is the
truth** — §5.

Visual: the same moment with GL off / on (bench SHOTS, scratchpad only) differs where §1's order changes are (crowd vs stand walls,
tethers / pots vs figures) and in animated bits (crowd, flames) between the two shots; the board, sky, lighting grade, shadows and
figures match.

## 3. Why it should help Safari (and the risk that it does not)

His recordings (tools/plans/v110/perf): Lighting Full 31 fps, p95 92 ms, **while our JS for a draw is 3–7 ms** in the long slow stretches
(frames of 60–65 ms with `draw: 3`) → the time is in WebKit's GPU process: CoreGraphics rasterising each board draw = ~15 board-sized
composited blits (source-atop / destination-over at 1.5× DPR) + ~100 small drawImage + ~1100 paths. Lighting Off (fewer board-sized
layers) → 53 fps. The spike takes the board-sized blits out of CoreGraphics completely (GPU quads, re-done only when a layer changes)
and the figure cells too; what is left on the 2D canvas is the small stuff. **Risk:** the remaining ~1100 path calls (drawPot alone
~680 fillRects) and the crowd keep CoreGraphics busy; Safari's WebGL also runs in the GPU process (each texImage2D of a 2D canvas is a
cross-process copy — the plane skips keep these rare). If his ⏺ with `#perf=gl111` is still ~30 fps, the vector work is the cost and
the cheap fix is caching drawPot / benches as sprites (a 2D-only change), not WebGL.

## 4. What a full v1.11 needs (port list)

1. **One frame owner.** The renderer owns the whole board frame as an ordered display list (the 219 layer list) instead of intercepting
   drawImage: each layer is a GL layer (quads) or a 2D "vector layer" baked into a texture **only when its key changes** (rim, tiles
   tints, floor marks, benches, highlights — all static between moves). No more order compromises; `#cv` becomes the GL canvas + one
   small 2D overlay for text/UI.
2. **Lighting / torches** (399, 409): the static shadow layer and torch layer are already board-sized canvases → planes; the per-figure
   shadows (l106DrawFigs) and torch glows become quads with a blend; night grade (189) a full-screen quad with multiply.
3. **Shadows** under figures: per-sprite quads from 399's cell sprites (already cached canvases).
4. **Wear** (194): stays a baked plane (blood/stains rarely change) — already works.
5. **Crowd** (313/193): ~24 sprites + animated bits → a crowd atlas, one draw call; the benches' multiply shading baked into `under`.
6. **FX** (227 fx95, 277 hit, 311 vfx): additive quads; text numbers stay on the fx95 2D canvas.
7. **Zoom / camera** (208/260/294/330): with GL the camera is a matrix — the chunked zoom caches (Z99 / Z100 / ZB101) can go; the stone
   layers must then be baked at a resolution for the zoom (or re-baked on settle as today).
8. **Sprite atlas**: ~46 sprites → ~35 draw calls now; a dynamic atlas (figure cells 311/312, corpses 404, props) gets the pieces to
   1–3 draw calls and cuts texture binds.
9. **Phones** (tv66/tv88, 390 px, DPR 3 capped at 2): the same path; check MAX_TEXTURE_SIZE (4096 on old iPhones) — planes at 2× zoomed
   exceed it → tile the planes.
10. **Reduce motion / Animations Off**: no change (the renderer draws what the layers produce); the 60/30 fps frame target and tv91r /
    tv92p draw-cost tests get a GL variant.
11. **Context loss**: `webglcontextlost` → 2D fall-back today; full build: rebuild textures from the caches on `webglcontextrestored`.
12. **Fallback to 2D**: no WebGL / blocklisted GPU / error → today's 2D renderer stays as the fallback path (keep it tested: one CI
    shard runs with GL forced off).
13. **Memory budget**: textures ≈ 21 MB at 810×567 @1; at 1545×1064 (his Mac, 1.5×) ≈ 4× = **~80 MB**, plus the 2× sheets if their
    cells go to the atlas. Budget 128 MB desktop / 64 MB phone, LRU-evicted (the spike deletes textures unused for 240 GL draws).
14. **Device sheet baking off the main thread** (his recordings: 311's in-match sheet baking — `grab / halve / alphaBox / shadowRow`,
    336 getImageData ≈ 740 ms per 10 s on Safari): move `sheetSteps` into a Worker with **OffscreenCanvas** (Safari 17+ has it) and
    hand back ImageBitmaps, or bake every sheet the match needs **before the match** (behind the briefing / loading card) and keep
    them in IndexedDB (311 already caches Studio sheets there). Either removes the getImageData stalls whatever the renderer.
15. **Recorder + tests**: keep `gl111` in the ⏺ report; tests tv111gl (on/off), a GL variant of t12 screenshots for the layer order.

## 5. What to measure on his Safari first (before any build)

1. Load the beta / live game with **`#perf=gl111`** at the end of the address (e.g. `…/index.html#perf=gl111`), start the same 4-CPU
   Democritus, Lighting Full, Normal speed, press **⏺ 10 s** (Settings → frame meter). Then the same without the hash. Two JSON files.
2. Compare `frames.fps / p95` and the `gl111` block (`on: true`, `ctx`, `drawsPerFrame`, `texUploadsPerS`, `fallPerFrame`). If `on` is
   false or `err` is set, the reason is in `gl111.err`.
3. Optional third: `#perf=gl111,gl111lv:1` (planes only) — tells whether the planes alone (the board-sized blits) carry the win.
4. Decision rule: **GO** when the GL run reaches ≥ 50 fps with p95 ≤ 40 ms (≈ his Lighting-Off numbers or better) with Lighting Full;
   **NO-GO for WebGL** when it stays near 31 fps — then the next step is the cheap 2D work (sprite-cache drawPot / benches, sheet baking
   off-thread) and re-record.

## 6. Estimate (if GO), in stages — each a beta

| stage | content | size |
|---|---|---|
| A | renderer core: display list over the 219 layers, vector layers baked on key, planes + sprites + atlas, context loss + 2D fallback, recorder | 3–4 days |
| B | lighting / shadows / torches / night as GL layers, FX quads, crowd atlas | 3 days |
| C | zoom / camera as a matrix (drop Z99/Z100/ZB101), phones (texture size tiling, DPR caps), Reduce motion check | 2–3 days |
| D | sheet baking in a Worker / pre-match (independent — can ship first, also helps the 2D path) | 1–2 days |
| E | tests: GL variants of tv91r / tv92p / t12 shots / tv66 / tv88 / tv86, CI shard with GL off; budgets (texture MB, draw calls) | 2 days |

Total ≈ **11–14 working days**, split v1.11 (A + D, opt-in "Renderer: WebGL (beta)" setting) → v1.11a (B + C, on by default for
Safari) → v1.11b (E + 2D path cleanup). Risks: Safari WebGL texture upload cost from 2D canvases (measure `texMBPerS` in §5), the
order-dependent effects (source-atop LIGHT over the crowd), and keeping two renderers in step until the 2D path retires.

## 7. Recommendation

**Not yet a go — measure on his Safari first (§5), it is a 2-minute test.** On this box the GL planes remove the board-sized
CoreGraphics work (−40 % of the 2D raster at @2, the layers re-drawn on the GPU only when they change), which is the part his Lighting
Full / Off recordings point at — but ~60 % of the 2D raster (≈1100 path / rect calls a draw, two-thirds of them the jugs) stays on the
2D canvas, and this box cannot show what Safari's GPU process does with either. Ask him for two ⏺ recordings: `#perf=gl111,gl111lv:1`
(planes only — the cheap, safe half) and `#perf=gl111`. Then:
- planes-only ≥ 50 fps / p95 ≤ 40 → **GO, small**: v1.11 = the planes path made production-grade (stage A without the sprite atlas,
  + D sheet baking), a few days; the full renderer only if phones need it.
- both ≈ 31 fps → **NO-GO for WebGL now**: the cost is the vector work; do the cheap 2D fixes first (jugs and benches cached as
  sprites, sheet baking off-thread) and re-record.
- only the full `gl111` helps → GO for the staged plan in §6.

## His Safari recordings (2026-10-22, v1.10a beta, 4-CPU Democritus, Lighting Full, DPR 1.5)
| run | fps | p50 ms | p95 ms |
|---|---|---|---|
| planes only (`gl111,gl111lv:1`) ×2 | 14.9 / 13.4 | 45 / 57 | 151 / 152 |
| planes + sprites (`gl111`) | 27.2 | 17 | 130 |
| baseline (no hash) | 26.3 | 17 | 140 |

Verdict: NO-GO for WebGL now. Planes only is HALF speed (steady ~42 ms frames with only ~3 ms of JS: a WebGL canvas under a
transparent 2D canvas costs Safari a lot to composite); the full spike only matches the baseline. What the recordings DO show:
getImageData 0.8–1.0 s per 10 s (311 sheetSteps alphaBox + shadowRow during the match) and `cells`/`clean` bursts of 40–80 ms
in the slow frames → the cheap 2D fixes are the next step.
