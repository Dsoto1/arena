# A live 3D arena in Babylon.js — look-only prototype (v1.0 planning)

This prototype only shows what a live 3D board would look like. Nothing in `src/`, `build.sh` or the tests changed. His call stands: the game keeps its 2D canvas plus render-once 3D. Any Babylon work would come in a later release.

## How to run it
- `cd tools/plans/babylon100 && npm ci` installs Babylon.js 9.27.1 + the loaders (Apache-2.0) into `node_modules/`. That folder is git-ignored.
- Serve the **repo root** over http (`python3 -m http.server`), then open `/tools/plans/babylon100/arena.html`.
- Controls: drag to orbit, wheel/pinch to zoom, **N** day/night, **P** isometric/perspective, **R** reset.
- URL flags: `?night=1 ?persp=1 ?zoom=close ?orbit=1 ?shadows=0 ?outline=0 ?crowd=0 ?noui=1 ?cdn=1`. `cdn=1` loads the same version from jsDelivr.
- `node tools/plans/babylon100/measure.js [variant,…]` writes `measure.json` + `shots/<variant>.webp`. `GAME=1` also measures the game's own `draw()`.
- `node tools/plans/babylon100/export.js` re-bakes `models/*.glb` from rig92 (4 gladiators, 2 beasts, each with lod0/lod1 + one skeleton).

## What is in the scene
- **Sand and board:** a 13×13 board with a painted sand texture (grain, tile bevels, grid, scars, blood). Democritus layout: 12 pillars with clay pots, 4 spike caps, 4 tunnel doors, the chest and 4 start marks.
- **192 arena look (Roma):**
  - Roma travertine.
  - Far sides: podium wall with a red cap and 8 tiers of stands.
  - Near sides: cut-down walls with a gilt rail and a gap at each stairway.
  - Stairs at the near corner.
  - Flat corner towers with braziers.
  - Flavius's box with his painted face, banners on poles, and a plaza below.
- **Pieces:** four rig92 gladiators wearing his printed gear (murmillo, thraex, royalty, venatore) and Leo + Ursa. They are GPU-skinned with an idle per species and an outline.
- **Crowd:** 914 spectators drawn in ONE call (thin instances).
- **Day/night:**
  - Day: sun + sky fill, with a 2048 PCF shadow map.
  - Night: moonlight plus 4 flickering torch lights on the rim. The pieces stay readable.
- **Camera:** an orbit camera with the game's 2:1 orthographic view by default, and a perspective switch.

Screenshots are in `shots/`:
- `day.webp`, `night.webp`
- `orbit.webp` (perspective, mid-orbit), `persp_night.webp`
- `close.webp` / `close_night.webp` (zoomed in on the near corner)
- `lite.webp` (no shadows or outlines), `noshadow.webp`
- `phone.webp` (844×390 @3)
- `game_today.webp`: today's 2D board in the same headless browser, for comparison

## Numbers (headless Chromium, 2026-10-11)
**Read this first:** this container has **no GPU**. WebGL runs on SwiftShader, which rasterises in software on 4 CPU cores. Other agents were also running, so the load average was **18–47** during these runs. Wall-clock fps here measures that software rasteriser, not a laptop or a phone. Babylon's own CPU-side counters (`frameMs`/`renderMs`: animation, culling, draw submission) are the meaningful part.

| variant | draw calls | tris on screen | CPU frame ms (Babylon) | render ms | wall fps (SwiftShader) | ready ms |
|---|---|---|---|---|---|---|
| day (iso, 1440×900) | 85 | 392k | 11.2 | 3.6 | 0.2 | 4 800 (load 24) |
| night (6 lights) | 85 | 392k | 19.7 | 9.6 | 0.1 | 120 500 (load 43) |
| orbit (perspective, moving) | 87 | 344k | 30.5 | 26.0 | 0.2 | 43 600 |
| close (zoomed in) | 55 | 303k | 30.8 | 16.4 | 0.1 | 79 700 |
| lite (no shadows/outline) | 50 | 217k | 9.7 | 4.4 | 0.2 | 70 500 |
| noshadow | 62 | 367k | 5.6 | 3.1 | 0.1 | 72 300 |
| phone 844×390 @3 (1688×780) | 85 | 296k | 19.5 | 15.4 | 0.4 | 57 400 |

- **CPU per frame:** 5.6–31 ms, swinging with machine load. The quietest run (day, load ~24) was 11 ms with 3.6 ms in render. On his laptop the CPU side should fit well inside 16 ms. 85 draw calls and ~0.4 M triangles are small for any real GPU. The fill-rate risks are the 2048 shadow map with PCF, the 4 point lights at night, and the outline pass (the board drawn twice for the pieces).
- **Today's 2D board, same browser:**
  - `draw()` p50 is **4.1 ms** (p95 6.3) on its 970×611 canvas with cached layers. Zoomed ×2 it is p50 6.8 ms (p95 158 ms when a cache rebuilds).
  - This is apples to oranges: the 2D canvas also rasterises in software here, and it does that fine.
  - The 3D scene cannot be measured fairly without a GPU. **The real test is his Settings FPS meter on his laptop and phone**, against the 60/30 fps target.
- **Load:**
  - Babylon parse: 1.4 s at load 24, up to 6 s under heavy load.
  - First frame 4.6 s, ready (10 frames) 4.8 s in the quiet run. Up to 2 min under load, because SwiftShader compiles every shader on the CPU.
  - On a GPU, expect ~1–2 s after download.
  - The game itself booted in 161 s under the same load, so neither number is a real-device time.
- **Download** (bytes per file; the page loaded 13.3 MB uncompressed):

| what | raw | gzip | brotli |
|---|---|---|---|
| babylon.js UMD (whole engine, what the prototype uses) | 8 361 KB | 1 797 KB | 1 258 KB |
| glTF2 loader | 389 KB | 85 KB | 70 KB |
| **tree-shaken ES bundle** of exactly what arena.js uses (@babylonjs/core + loaders 9.27.1, esbuild --minify; size only, not run) | 3 664 KB | 851 KB | 619 KB |
| 4 gladiators .glb (20k-tri lod0 + 4k lod1 each) | 3 828 KB | ~1 916 KB | ~1 608 KB |
| 2 beasts .glb | 700 KB | ~448 KB | ~371 KB |
| textures (travertine + Flavius) | 32 KB | — | — |

  - **CDN vs bundled:**
    - From jsDelivr the UMD is ~1.26 MB brotli. The browser keeps it in its cache across releases (the version is in the URL), and ours never re-downloads it.
    - Bundled into the page, a tree-shaken build is ~0.62 MB brotli, but every release re-ships it. The standalone download (already ~30 MiB) would also need it inlined.
    - jsDelivr could not be reached from this sandbox (proxy 403), so `?cdn=1` was not exercised here.
    - The models dominate either way. Meshopt/Draco compression on the glTFs would roughly halve them.
- **Memory:**
  - JS heap ~52 MB with Babylon + scene (the whole game, with an event running, was 28 MB).
  - GPU textures ≈ 41 MB: the 2048² sand DynamicTexture ≈ 21 MB and the 2048² shadow map ≈ 16 MB. Without shadows, 25 MB.
  - Browser RSS (all processes) 0.64–0.75 GB, against 1.03 GB for the full game with an event. The two are not comparable: the game holds the whole app.

## Pros and cons against today (2D canvas + render-once 3D)
**Pros**
- A real camera: free orbit, perspective, smooth zoom. Rotating the board (ROT89) and the follow camera come for free.
- Real lighting: day/night, torch pools, moving shadows. No hand-painted lighting or per-arena caches (192/194/208/235/260).
- Pieces could animate fully (walk, attack, fall) from ONE skeleton per species, instead of 8-facing sprite sheets per pose.
- Depth sorting, occlusion and picking are exact. No `dep89`/`isoFix` or tile-seam work (SNAP96, Z99).

**Cons / risks**
- **Look:** today's board is PAINTED, with his art: the Flavius box frame, banners, the stone texture, minis from his TTS models, and sand with grain and scars. The prototype reads as "clean 3D", not his style yet. Matching it means real modelling/texturing per arena (12 cities) and for every printed piece and beast. That is the big cost, not the engine.
- **Phones:**
  - At phone width the 3D stands eat the view and the board is small (`phone.webp`). It needs its own framing.
  - Fill rate with shadows, outlines and night lights at dpr 2–3 is the real phone risk. That points to a Lite mode: no shadows, no outline, dpr ≤1.5.
- **Every 2D feature drawn on the board must be redone in 3D or overlaid:**
  - Highlights (`computeHL`), floating numbers (#fx95), stuck arrows, blood/rubble/dust (LIFE84), the clean-up crew, the cheering crowd, chariot/naumachia boards, the Event Designer and keyboard tile focus.
  - The v0.93 layer list would be replaced, not extended.
- **Download:** +0.6–1.3 MB brotli for the engine, +~2 MB for the 6 models. Today the board ships no 3D runtime. three.js loads only in the token modeller.
- **Tests and budgets:** headless here has no GPU. Draw-time budgets (tv91r/tv92p), pixel-identical checks (tv93l) and seam tests would need a new approach, such as Babylon's CPU counters plus device checks. The suite would get slower under SwiftShader (a single frame took seconds here under load).
- **Two renderers:** Babylon on the board, three.js in the modeller. A move would mean porting rig92/tok93 to Babylon or keeping both.

**My read:** the engine is not the blocker. CPU cost is fine and draw calls are low. The blockers are art direction (making it look like *his* arena), phone fill rate, and redoing every board overlay and the tests. A careful, opt-in "3D board" view behind a setting is the realistic shape, if he wants it at all.

## Questions for Virgilante
1. **Where would a live 3D board go?**
   - (a) Nowhere for now: keep 2D + render-once 3D. The prototype answered the question.
   - (b) An optional "3D board" setting for desktop only, beside today's board.
   - (c) Replace the 2D board on every device, in a later release.
2. **The look, if it goes ahead:**
   - (a) Keep the clean, flat-shaded style of the prototype.
   - (b) Match today's painted arena: his textures and stone per city, the Flavius box frame, the painted sand. This is much more art work.
   - (c) Something in between: painted textures on simple shapes, without per-city modelling.
3. **Download and phones:**
   - (a) Babylon from the jsDelivr CDN (cached across releases; no Online in the standalone without internet anyway).
   - (b) Bundled tree-shaken into play/assets and loaded on demand (~0.6 MB brotli per release, works offline in the standalone).
   - (c) Desktop only: phones always keep the 2D board.
