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
