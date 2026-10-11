# Arena look test, v1.0: railing + new stone (prefix `arena_`)

This is pictures only. Nothing in src/, build.sh or tests changed. The prototype is `arena_proto.js`. It is injected at runtime and overrides 192 functions.

## Files
- `arena_lib.js`: opens the page (webdriver off, firstrun shown, waits for FLAVIUS_READY), starts an all-CPU Democritus, zooms, takes shots.
- `arena_before.js`: first BEFORE shots (`arena_before_full/out/in/phone.png`).
- `arena_shots.js`: every AFTER shot. Per city it also writes `arena_before_<city>.png`, plus `arena_before_edge_in.png` and `arena_before_phone_edge.png` (pieces moved onto the near edge rows, display only).
- `arena_cost.js`: draw costs written to `arena_costs.json`. Configs are interleaved over 4 rounds and the medians are kept.
- `arena_sheet.py`: builds `arena_compare.png`, the side-by-side sheet.
- `arena_before_line.png`: the faint black line, cropped and marked.
- Rails: `arena_rail_<bronze|balus|parapet>.png` (zoomed out) and `…_in.png` (zoomed in, pieces on the near edge).
- Stone: `arena_stone_<trav|sand|marble>_<roma|capua|leptis>.png`, plus `…_roma_in.png`.
- Matched sets: `arena_combo_*.png`, phone `arena_phone_*.png`.

## 1 · The faint black line
The line is the stroke at the foot of the CUT-DOWN NEAR WALL. In 192 `ar91Under` it is the last
`g.strokeStyle='rgba(30,20,10,.5)'` line at `a.y+Hc` (Hc = 0.16 TW). It runs from tower to tower along both near sides, between the sand's red lip and the first bench.

## Railing: how it stays off the sand
- The rail is painted at the end of `ar91Under`, which is the baked 'under' layer, drawn BEFORE the tiles. Anything taller than the near wall would be covered by the sand, so it can never sit over the sand or the pieces. tv91r's clarity rule holds by construction, and no fade is needed. Pieces on the edge row are shown in the `_in` shots.
- Height is ≤ Hc. The rail sits on the line and its top ends just under the red lip.
- There is a gap in front of each side's stairway (the middle of the side). The rail runs on to the corner towers like the wall does.
- Styles:
  - (a) bronze: round bar, knobbed posts every ½ tile, a low second bar.
  - (b) stone balustrade: plinth, vase balusters, coping and end pedestals, coloured from the arena cap.
  - (c) marble parapet: white slab with veins and a joint per tile, top face, bronze rail on stubs.

## Stone: how it works
- `ar91Tex` returns a procedural 512² texture, built once per style (seeded, never the dice RNG). It is MULTIPLIED by the arena's cap colour (`ar91Mat().cap`, i.e. THEMES99 `mat.cap`), so each arena keeps its tint. Capua stays dark red.
  - A travertine: running bond 64 px courses, voids, bedding streaks, pale mortar with a shadow line.
  - B sandstone: the menu slab palette (#dcc196 → #c9a877 → #b48f5c), a lit/shaded chamfer, the slab's inner incised line, strata.
  - C marble: clouding, veins, large polished panels.
- `ar91Fill` is new. Flat surfaces (the foundation top, the gully) get an ISO pattern matrix, so the slabs lie on the floor. Vertical faces keep the wall pattern. The old stone_wall.webp is screen-aligned everywhere.
- Marble only: Pompeian-red dado bands (gold fillet + dark lines). They go on the foundation side faces and the tower fronts (`ar91Stone` hook), and on a low band at the foot of the far walls (after `ar91TopPaint`).
- The ludus (plaster) is untouched.

## Draw cost (`arena_costs.json`; headless Chromium, software canvas; ms, medians)
| config | 1440 cached frame | 1440 rebuild | phone (dpr 2) cached | phone rebuild |
|---|---|---|---|---|
| before | 4.1 | 50.5 | 30.8 | 192.5 |
| bronze rail | 5.1 | 67.1 | 25.4 | 172.3 |
| balustrade | 4.5 | 70.0 | 27.6 | 196.3 |
| parapet | 4.3 | 63.7 | 32.5 | 201.1 |
| travertine | 3.6 | 54.0 | 36.9 | 195.1 |
| sandstone | 3.4 | 61.0 | 29.1 | 191.8 |
| marble | 3.4 | 53.7 | 26.8 | 182.7 |
| trav + bronze | 4.3 | 52.3 | 33.0 | 203.3 |
| sand + balus | 4.2 | 49.2 | 25.5 | 172.3 |
| marble + parapet | 4.0 | 68.2 | 28.5 | 190.4 |

- **Cached frame:** no change. The rail and stone live in the baked layers, so a frame only blits them. The differences are within run-to-run noise (about ±1 ms desktop, ±6 ms phone).
- **Rebuild** (only on resize/zoom step/theme/turn): rails add about 3–10 ms to the 'under' bake (balusters are the most). Stone styles are within noise of today.
- **One-time texture build** per page: travertine 31–36 ms, sandstone 38–44 ms, marble 22–41 ms, plus about 1 ms per arena tint. A real module should build it on idle, or ship the three textures as small webp files (~60–90 KB each), which costs 0 ms.

## Real-module changes it would need (a new `2xx-v100arena.js`, wrappers only)
1. **Railing:** wrap `ar91Under` → after base, `rail100(g)` along `ar91Edges(0.19)` near sides. It needs the same tower extension and stair gap as 192. Factor the near-wall geometry out of `ar91Under` into a helper (`ar91NearWalls()`) so the wall and rail share it.
   - Ludus: none, or a wooden lattice like its far walls.
   - Add the style to the `ar91Key()` cache key (or bump `AR91.ver` on change).
   - Optionally drop the faint stroke (the rail's shadow replaces it).
2. **Stone:** replace `ar91Tex` (`AR91TEX` keyed by style + `M.n`). Add `style` to the mat (THEMES99.P[k].mat / AR91MAT: e.g. `s:'trav'|'sand'|'marble'`). Override `ar91Fill` for the iso floor matrix.
   - Marble bands: either a `face` flag passed by 192's own calls (cleaner than the prototype's "scale===0.8" sniffing), or wrap `ar91TopPaint` for the far-wall dado.
   - Podium columns / tower cornice are untouched.
3. **266-v99themes:** the `mat` of each of the 12 arenas gets its stone family + the tint. The `f` filter is then only used when the style is the old texture.
4. **Settings (optional):** Board & pieces → "Arena stone: Classic / New", plus the rail on/off. 260-v99zoom's `ar91Blit` override and 208's padded frame need no change: the layers just hold different pixels.
5. **Tests:** tv91r (nothing over the sand; holds by layer order), plus a pixel check that the rail stays below the near sand edge. tv93l (layers ON/OFF identical) is unchanged. Add a Reduce-motion/Light path: on the Light board (lite84On), skip the voids, veins and noise.

## What I saw
- The balustrade reads best zoomed in. Zoomed out it becomes a fine white comb. Bronze is quietest at a distance. The parapet makes a clear white frame round the sand and pairs well with marble.
- Sandstone matches the menu slabs well. Travertine is the closest to today's feel.
- On light arenas (Roma, Leptis), travertine/sandstone look much alike, because the tint is near white. Identity there comes mostly from the board colours.

---

# Round 2: his answers 3a + 2d + 4a + 5b, corner towers, palettes (prefix `arena2_`)

These are still pictures only. src/ is untouched and nothing was committed. The prototype is `arena2_proto.js`, a standalone file injected at runtime (round 1's `arena_proto.js` is not loaded).

## Deliverables
- `arena2_contact.png`: all 12 arenas. Each row has the zoomed-out view, the left corner tower zoomed in, a panel sample (the real side panel under the proposed palette) and the palette strip with WCAG ratios. A green ring marks a proposed change.
- `arena2_grid.png`: the 12 arenas zoomed out, 4×3.
- `arena2_corners.png`: corner close-ups (left tower, right tower, near corner, stair opening). Rows: today (v0.99), Roma (travertine + gilt bronze), Thysdrus (sandstone + balustrade), Leptis (marble + parapet). Single files are `arena2_close_*.png`.
- Per-arena files: `arena2_<k>_<key>_out.png`, `_corner.png`, `_panel.png`. Phones: `arena2_phone_<roma|thysdrus|leptis>.png`.
- Textures: `arena2_tex/<k>_<key>.webp` (12 × 512², tileable). The sheet `arena2_tex/sheet.png` shows each one tiled 2×2. Sizes are in `sizes.json`: 12.8–60.8 KB, about 400 KB in total, all under 90 KB.
- Scripts: `arena2_texgen.js` (textures), `arena2_shots.js` (shots), `arena2_cost.js` (costs → `arena2_costs.json`), `arena2_sheet.py` (sheets), `arena2_pal_prop.js` (palette changes). `arena2_pal.json` holds the full palettes as shown.

## Corner towers (his note): what changed
- Today, the near wall and rail run on under the tower's foot. The tower's base sits about one wall height (Hc) above the walkway, so the rail slipped under it: a gap from one side, an overlap from the other.
- Fix, in the 'under' layer:
  1. Each corner tower gets a PLINTH that carries its front face down to the walkway (same stone, a dark seam under the tower).
  2. The rail run stops at the tower's inner face.
  3. A stone PIER with a cap stands against the plinth. On bronze and parapet rails the cap also has a bronze knob.
- The same pier caps the near corner (a slightly bigger one) and both sides of each stair opening. Every run therefore ends on a pier, with no gap and no overlap.
- Checked on both towers, the near corner and the stair opening, zoomed out and at 2.4×, for all three rail families. The towers are found by screen position each bake, so this follows the turned board too.

## The twelve arenas (2d: a family each; rails follow the family = 3a)
| # | arena | stone family + touch | rail | band / motif |
|---|---|---|---|---|
| 1 | Syracusae | Greek (Parian) marble: cool white, blue-grey veins, big slabs | marble parapet + bronze | Greek blue, white **meander** |
| 2 | Verona | rosso Verona: pink nodular marble, pale stylolites | rose-marble parapet + gilt | deep rose, cream **dentils** |
| 3 | Arles | Gallic honey limestone, *petit appareil* (small near-square blocks) | bronze | — |
| 4 | Capua | dark red Campanian stone, rusticated *opus quadratum*, drafted margins | red-stone balustrade | black, red fillet |
| 5 | Thysdrus | African sandstone: amber blocks with the menu slab's carved chamfer | sandstone balustrade | — |
| 6 | Roma | Colosseum travertine: warm cream, voids, bedding streaks, pale mortar | **gilt** bronze | — |
| 7 | Nemausus | grey-green Gallic limestone laced with **red brick courses** (*opus mixtum*) | dark bronze | — |
| 8 | Pompeii | grey tuff ***opus reticulatum*** (diamond net) + brick courses | grey-tuff balustrade | **Pompeian red**, black fillet |
| 9 | Leptis Magna | Proconnesian marble: warm white, streaky grey bands | white parapet + gilt | **cipollino green**, white **wave** |
| 10 | Uthina | Punic ***opus africanum***: ashlar piers between rubble panels, dusk-violet | violet sandstone balustrade | — |
| 11 | Pola | Istrian white stone: big smooth ashlar, chiselled drafted margins | **verdigris** bronze | — |
| 12 | Puteoli | Neapolitan yellow tuff, porous, in *opus listatum* (2 tuff + 2 brick rows) | tuff balustrade | — |

The Roma/Leptis look-alike is fixed: Roma is warm, pitted cream travertine with a gilt rail and no band; Leptis is cool polished white marble with a green parapet band and green UI accents.

## Proposed THEMES99 changes (266-v99themes.js)
Every new value still passes WCAG AA (bone/muted/gold on panel ≥ 5.8:1; bone on the button colour ≥ 5.0:1 in all 12). The default Arena theme (BASE_THEME, brown) is untouched.
| arena | key | today | proposed | why |
|---|---|---|---|---|
| 4 Capua | board.standA / standB | #4c1c16 / #5e2820 | **#3a2622 / #4a302a** | umber benches separate from the red stone |
| 5 Thysdrus | board.standA / standB | #7a481a / #905a24 | **#5a3416 / #6c4220** | benches darker than the amber sandstone |
| 8 Pompeii | board.standA / standB | #4a4446 / #5c5456 | **#5e2a24 / #70342c** | Pompeian red benches against the grey tuff |
| 9 Leptis | ui.blood (buttons) | #7e6526 | **#3f6b4c** | cipollino green (bone on it 5.8:1) |
| 9 Leptis | ui.line2 | #736a52 | **#5f6e58** | green-grey borders |
| 9 Leptis | board.rim / grid | #6c604a / #ab966c | **#3f5446 / #9a9c80** | green rim, matches the band |

Every arena's `mat` becomes `{n, tex:'stone100_<k>_<key>.webp', cap, rail, metal|stone|slab, band}` (values in `A2` at the top of `arena2_proto.js`). The `f` filter strings are retired; keep them only as the kill-switch fallback. New caps:

| arena | cap |
|---|---|
| 1 Syracusae | #e4eaee |
| 2 Verona | #e8b8aa |
| 3 Arles | #e4cb94 |
| 4 Capua | #86463a |
| 5 Thysdrus | #dda466 |
| 6 Roma | #e8d6b4 |
| 7 Nemausus | #cfccb2 |
| 8 Pompeii | #a09a92 |
| 9 Leptis | #f2f0ea |
| 10 Uthina | #d6b8aa |
| 11 Pola | #eae9e2 |
| 12 Puteoli | #d8c072 |

Every other UI and board colour stays as it is today, since each one already matches its new stone.

## Draw cost (`arena2_costs.json`; headless Chromium, software canvas; medians of 4 interleaved rounds; today → round 2)
| | cached frame | rebuild (all layers re-baked) |
|---|---|---|
| desktop 1440, Roma | 5.2 → 5.6 ms | 66.7 → 70.8 ms |
| desktop 1440, Thysdrus | 4.1 → 3.6 ms | 61.8 → 67.7 ms |
| desktop 1440, Leptis | 3.3 → 3.8 ms | 49.4 → 62.3 ms |
| phone 844×390 (dpr 2) | 31–41 → 35–51 ms | 277–345 (both, too noisy to rank) |

- **Cached frame:** unchanged within noise, because everything new lives in the baked layers.
- **Rebuild:** +4–13 ms on desktop (rail, piers, plinths, bands). It happens only on resize, zoom step, turn or theme change.
- **WebP:** load + decode is 17–57 ms each, once per page. Only the current arena's file is needed (the shots preload all 12). There is no texture build cost any more (5b).

## Module plan (v1.0)
New `2xx-v100arena.js` before 08-setup, wrappers only, plus two tiny direct edits:
1. **Data:** `A100[k]` (family, tex, cap, rail + colours, band) in the module. 266's `THEMES99.P[k].mat` points at it (tex + cap + n), plus the 4 palette changes above. Ship the 12 WebP files as `assets/stone100_<k>_<key>.webp` (flat, so mkshare inlines them, about +400 KB to the standalone).
2. **ar91Mat / ar91Tex:** the arena's WebP through `ar91Img(ar91Asset(...))`. Its onload already bumps `AR91.ver`, so the layers re-bake once. Ludus plaster is unchanged.
3. **ar91Fill floor vs wall:**
   - DIRECT EDIT in 192: pass `'floor'` at the two flat fills (the top ring in `ar91Under`, the gully in `ar91TopPaint`). The prototype guessed it from the transform and scale.
   - Floor uses an iso matrix: 150 px per tile along u, 80 along v, so slabs come out squarer than the long blocks on walls (long blocks read as planks).
4. **Bands:** DIRECT EDIT in 192: call a hook `ar91Face(g,Q,'side'|'tower')` after the foundation side faces and the tower front. The far-wall foot band is a wrapper on `ar91TopPaint` (`out.walls`).
5. **Rail + corners:**
   - Wrap `ar91Under`: plinths → rail runs (tower face → stair opening → corner) → piers.
   - Move the tower placement (today inline in `ar91TopPaint`) and the near-wall extension (inline in `ar91Under`) into one helper, `ar91NearGeom()`, so the tower, wall, plinth and rail can never drift apart.
6. **Off path (visual polish rule):** localStorage `flavius_arena100off=1` gives back the 192 look. On the Light board (`lite84On`), skip the rail shadows and baluster gradients. Night is fine: the layers paint before 189's grade.
7. **Tests:**
   - tv91r stays green by construction: the rail is in 'under', before the tiles.
   - New `tv100a`:
     - each arena's WebP loads;
     - near-edge sand pixels are identical on/off (the rail never shows above the sand);
     - a pier pixel sits against each tower;
     - the cached frame stays within +1 ms;
     - turned board (ROT89) and phone 390.
   - tv93l (layers ON/OFF) is unchanged.
8. **No Settings switch (4a). No save change.**
