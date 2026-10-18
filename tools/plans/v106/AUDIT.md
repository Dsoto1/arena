# v1.06 lighting — phase 1 AUDIT (the board renderer as it is in v1.05 + v1.06 work so far)

Short and factual; what is measured is marked **measured**, the rest is read from the code. Numbers: tools/plans/v106/BASELINE.md.

## Headline
- **One 2D canvas, one ordered layer list, no lighting model.** The board is repainted from scratch by `draw()` (src/ui/07-ui.js) as 13
  named layers (219-v93layers). "Light" today is a set of unrelated local tricks: a camera-relative key light baked into the 3D figure
  sheets, a horizontal gradient on the pillar shaft, flat 32 %-black discs under every piece, a painted sun in the sky. **No cast shadow
  exists anywhere on the board.** The disc offset (+2, +3 px) is the only hint of a sun direction; the figures are lit from upper-left
  *front* (`lightFor`, tok93.js), which would cast shadows *up-right* (behind) — not the "lower right" N12a asks for.
- **The draw is cheap in JS (≈ 4.4 ms p50, measured) and the pieces layer is half of it (≈ 2.2 ms).** Rasterising the frame is the
  bigger cost on this CPU-only box (≈ 17–29 ms p50 with a forced flush, measured; no GPU here, so that part says little about a laptop).
- **The cheapest place for shadows is the end of the `decals` layer**: after the sand, wear, blood, tokens and chest, before the move/attack
  highlights, the rings and the figures — a shadow there can never cover a tactical mark.

## Draw pipeline (07-ui `draw()` → `drawLayers93([...])`, in this order)
| # | layer | what | cached? |
|---|---|---|---|
| — | setup | sizes TW/TH/OX/OY to the window (+ zoom `duelCam`, camera `camFocus`), **sets `cv.width/height` every frame** (resets the bitmap + context), `computeHL()` | — |
| 10 | rim | the raised board rim (3 polygons) | no |
| 20 | stands | 192 UNDER (cached) · benches · 192 DECO (cached) · the crowd (313 3D crowd sheets) | sub-layers cached (192 `AR91.L`, 208 padded reference frame, 260 bitmap pieces) |
| 30 | tiles | the 169 sand tiles, zone tints, out-of-zone shade, grid | 235 TILES96 whole-layer cache |
| 40 | walls | `night91Sand`: 192 TOP + LIGHT (cached, `source-atop`) + SKY (cached, `destination-over`, sun upper left), 189 night grade + torches + flames | sub-layers cached; flames live |
| 50 | floor | exit/capture marks, chariot lines, ropes, tile names, start marks, tunnels, 134 spikes | no |
| 60 | decals | rubble (+138 settle), 194 WEAR (cached), corpses (`drawCorpseFig`), blood (seeded splats), clean-up crew, floor tokens, 135 chest | wear cached |
| 70 | highlights | move/attack/push/tunnel tile fills (`TB.hl*`, translucent), cost digits, hover outline | no |
| 80 | pieces | 356/359/366 FLOOR PASS first (team/turn/seat rings, the shadow DISCS), then pillars, beasts, gladiators **depth-sorted** (`dep89`), see-through alpha | figure cells pre-scaled (311 `AN100CC`, 312 `BST100.cc`, LRU) |
| 90 | overlays | aggro tethers, attack rings on empty tiles, guide tile, tosses | no |
| 100–130 | crowdtop · flavius · fx · duel | fan flags + shouts, Flavius's box, `drawFX` (hit FX, numbers, 277 hit), bubbles, duel vignette | no |

Wrappers around `draw()` coalesce extra paints (232 batch, 235 PACE96 at Fast, 260 Z99F zoomed, 271 resize, 330 zoom2); 218 emits
`draw.after`. Per-layer timings already exist (`LAYERS93.stats`, `LAYERS93.report()`), which the bench prints.

## Where light and shadow exist today
| what | where | how | baked / drawn |
|---|---|---|---|
| sun in the sky (upper left) | 192 SKY | painted disc | cached layer |
| arena "LIGHT" | 192 LIGHT | stone shading layer, `source-atop` | cached |
| night | 189 | baked grade (cool sand, darker stands), sky + moon, 11 rim torches (`lighter` pools), warm glow + rim light round every figure (`night91Rim`, ctx shadow blur) | grade cached; torches/flames + figure glow live |
| sand | 136 SAND83 / 194 wear | grain + scars + stains | cached |
| figures (8 printed classes) | 311 + tools/art/anim100/make.js | Three.js toon render OFFLINE, ambient 0.27π + one DirectionalLight 0.86π **camera-relative** (-0.55, 0.85, 0.55) = upper-left-FRONT; 4-step toon ramp; ink outline | baked sheets (move ≈ 140 KB, act ≈ 670 KB per class) |
| Studio / online tokens | 311 ANIM100_LIB on the device | same renderer + lights | baked on device (IndexedDB) |
| beasts | 312 | own sheets, same toon look | baked |
| crowd | 313 | 3D crowd sheets | baked |
| sculpts (Studio) | 176 | "light upper left" | live 3D (Studio only) |
| pillar shaft | 07 / 130 `drawPillar82` | horizontal linear gradient (dark–light–dark) | drawn |
| chest | 135 | flat-shaded faces | drawn |
| **shadow discs** | 356 `fl104Sh` (callers 311, 312, 222, 102, 94) | `rgba(0,0,0,.32)` ellipse, 0.55 of the base, at (+2, +3) px | drawn, a handful of ellipses |
| pillar disc | 130 `pillarShadow82` | `rgba(0,0,0,.32)` ellipse at (+1.5, +2) | drawn |
| jug stack | 186 `drawTokStack90` | own 0.3 ellipse | drawn |
| spikes | 134 | darkened plate | drawn |
| menu show | 282 `mm100Shadow` | own shadow | drawn (menu) |

Nothing is shared: each shadow chooses its own alpha and offset. There is no LIGHT config; sun direction exists only implicitly
(the painted sun, the +x/+y disc offsets, the figures' camera-relative key).

## Costs (measured on the bench scene, BASELINE.md; desktop 1440×900, JS time of `draw()`, median of 3 runs)
- whole `draw()`: 4.4 ms p50 / 7.5 ms p95 (day, flat); zoomed and night are within ±0.3 ms p50.
- pieces 2.2 ms · stands 0.6 · decals 0.46 · floor 0.4 · walls 0.2 (0.5 at night) · fx 0.13 · tiles 0.07 (cached) · highlights 0.07.
- forcing the raster (1-px `getImageData`) adds 12–25 ms on this machine: Chromium here has no GPU (headless, software raster), so this is
  the CPU raster of a ~1 Mpx frame — an upper bound, not a laptop number. Treat the "flush" rows as relative, not absolute.
- caches: tiles, stone layers, wear, sky and the figure cells already avoid repainting; the frame still pays one full bitmap reset
  (`cv.width=` every draw) and ~20 cached-layer blits.

## What can be reused for v1.06a
- the layer list (one new pass inside `decals`, no new layer → 219's order/stats untouched);
- 356's per-piece shadow records (`fl104Sh` is the one place every figure drawer reports its footprint) → the contact shadow;
- 311 / 312 pre-scaled cell canvases (`an100CellCanvas`, `bst100CellCanvas`) → silhouettes without new decoding;
- the anim100 pipeline (make.js + ANIM100_LIB + tok93 `_dbg` scene) → re-lit sheets and a ground-shadow sheet per pose, same cells;
- glide/shove/walk offsets already computed for 359's floor pass (`fl104Offs`, `bst100Off`) → shadows that never trail the figure.

## Deficiencies (ranked by the brief's priorities)
1. No cast shadows; the board reads flat, tall pillars float on a small disc.
2. Light direction is incoherent: figures lit from upper-left-front, sky sun upper left, discs offset lower right, pillar gradient symmetric.
3. Contact = one flat disc, same alpha everywhere, mostly hidden under the base (its visible rim is a hard 1–2 px edge).
4. Overlapping shadows would double-darken if simply stacked (there are none yet — a constraint for the new pass).
5. Night has torch light but no light direction for shadows (v1.06b).
