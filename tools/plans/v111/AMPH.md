# v1.11 art — THE AMPHITHEATRE (baked 3D surround) · pass log

Target: his concept (tools/plans/v110/ref/arena-concept.jpg, not committed; copy in the scratchpad), "tasteful: fewer torches and
lights, borrow heavily but don't overdo it", compare after each pass, max 5. Decisions 11a (offline three.js bake), 12a (baked static
crowd on the upper tiers), 13a (one design, per-arena stone + banner colours), 14a (first render for approval before it goes in).

## Pass 1 — the first build (alignment + layout)
- Built: footprint holdout = the game's grand outline (X/Z −2.92 … 15.92); far sides: walkway, low podium wall, 8 rows (bench slabs),
  3 aisles, a vomitorium, top gallery (blind arcade), attic + cornice + windows; near sides cut at the stands' level with a 1-storey
  arcade of storage bays down to the ground (y −2.6); Flavius's box (4 columns, niche) at the top corner; landing + grand stair + 2
  lions at the bottom corner; corner towers left/right; 4 banners far, 2 near; braziers: landing 2 + tower tops 2; ~1,000 seated figures.
- Alignment: exact — the holdout edges sit on the game's stands outline in the composite (no offset at any edge).
- Compared with the concept:
  - far too dark and grey; the concept is warm and sunlit. The vignette (0.5) on top of shadowed faces kills the near arcade.
  - no separation between the board's red benches and the upper rows' red benches: the concept has an ARCADED PODIUM WALL (a full
    storey with dark arches + piers) between the inner stands and the upper tiers — mine is a low parapet, so it reads as one red mass.
  - the rows are too small and many (8 thin stripes); the crowd figures are specks. The concept has fewer, deeper rows with readable people.
  - Flavius's box: columns hide behind his banner, the guards are small and dark, the rows end in blank grey walls beside it.
  - lions read as grey blobs; the towers fall off a 1440 canvas (only wide screens see them).

## Pass 2 — the podium storey, fewer + deeper rows, brighter
- Changed: the far sides get an ARCADED PODIUM (a full storey, dark arches every 1.6, pilasters, cornice, parapet) between the
  board's stands and the upper rows; 6 rows (0.6 deep, 0.4 rise) instead of 8; crowd figures ×1.3; Flavius's box rebuilt as a pavilion
  rising from the walkway (4 columns either side of his banner, a purple drape, an entablature), the rows cut on planes parallel to
  the diagonal (seen edge-on → no blank walls); guards ×1.3 facing the viewer, scutum in front; seated lions; brighter warm light
  (sun 2.7 warm, sky fill 2.1); vignette 0.35. Then 2 banners + 1 brazier per far side on the podium (the concept's accents, sparse).
- Bug found by the comparison: the crowd washed out to pale beads — a depth-only holdout drawn AFTER a layer's mesh cannot erase it,
  so stone sat under every figure and the additive composite brightened them. Fix: holdouts render first (renderOrder −1).
- Compared with the concept:
  - the podium arcade gives the concept's "arches behind the stands" band; the two red bench groups now read apart.
  - banners came out WHITE: the eagle decal's holdout ignored its alpha (a square hole in the cloth layer, the sky showed through).
  - thin see-through seams round every arch (vault polygon smaller than the hole polygon).
  - the storage bays are black holes; the concept's are warm, torch-lit rooms with crates you can read.
  - stone still a little grey next to the concept's warm cream.

## Pass 3 — fixes + warmer stone
- Changed: alpha-tested holdouts (the eagle cuts only its shape), the bay vaults 3.5 cm larger than their holes, creamier stone
  luminance (base 231 instead of 210, less texture contrast), a warm lamp in each stocked bay, vignette 0.3 from 9 TW.
- Compared with the concept:
  - banners now red with the gold eagle ✓; seams gone ✓; overall warmth close to the concept's daylight.
  - the bay lamps are too weak to read at 1×; the props inside are invisible.
  - sky shows through in small triangles beside Flavius's box and at the left/right canvas edges (the walkway stopped on the box's
    planes; the far rows stopped short of the towers).
  - the crowd palette is dark (browns/blues) — the concept's crowd is mostly light tunics.
  - the corner towers are plain blocks (wide screens see them).
  - NIGHT (first look): the two podium braziers + the landing pair give the concept's warm pools without lighting every pier ✓.

## Pass 4 — lit bays, lighter crowd, towers, ink
- Changed: bay lamps ×3 (a small floor brazier in each stocked bay as the source), crowd palette mostly light tunics, towers with a
  gate arch + an arched window on each visible face, bands, cornice, a bronze lion-head medallion; darker, calmer ground (texture ×1.5
  larger); ink lines stronger (0.7, 2 px at 2×).
- Compared with the concept (desk, phone 390, zoomed):
  - the stocked bays now glow warm at their arch edges like the concept's ✓; readable crates/barrels need the 2× bake.
  - highlight contrast read-back identical to today (desk day 1.332 / 1.141, night 1.146 / 1.050; phone 1.32 / 1.11) ✓.
  - the small sky triangles beside Flavius's box and at the canvas's left/right edges are still there (fix in pass 5).
  - the ground in the two bottom corners is a large empty dark field; the concept fills it with a lower level (the crossed-out
    seats). A low balustrade + a few crates on the plaza would frame it without people.
  - zoomed in, the 1× bake goes soft (the shipped layers are rendered at 2×: TW0 112).

## Pass 5 — final (2× bake, TW0 112)
- Changed: the footprint holdout at sand level on the 3-tier outline (a grand arena's 4th tier paints over our walkway strip, a 3-tier
  arena shows it — no sky slivers either way), a strip under the near stands for 3-tier arenas, the rows/walkway/facade run into the
  towers (UEND +1), the step in front of Flavius's box reaches under the footprint; a low balustrade 4.3 out on the plaza + goods
  waiting outside (frames the two bottom corners without the crossed-out people); teardrop flames (orange body, yellow heart);
  calmer, darker ground; the three tint layers made NEUTRAL luminance in enc.py (a warm cast made Syracusae's cool white stone cream).
- Compared with the concept (desk 2×, phone, zoom; Roma, Syracusae, Verona, Capua):
  - layout, rhythm and warmth follow the concept: arcades on all four sides, the podium storey, upper rows with a crowd, Flavius's box
    with two guards, banners with the gold eagle, lit storage bays, lions at the stair; fires at only 4 key points + the bay lamps.
  - still different, by design or by the canvas: fewer fires/banners/people (tasteful); the grand stair is mostly below the canvas
    (it ends at the near corner); the box's top and the towers are cut by the canvas (towers show on wide canvases); the crowd and
    lions are simple at this size.
  - readability: the highlight contrast read-back is identical to today in every view and arena measured (bench CONTRAST).

## Pass 6 — the bottom corners (his approval 3a + note "bottom left and right looks strange … take liberty to clean that up")
- Before: a dark brown void, a balustrade cut on a slant, goods scattered on the plaza, the lions and the landing fires half cut
  by the canvas bottom.
- Changed: a paved FORECOURT in front of the arcade (paving in the stone layer, so it takes each arena's stone tint and stays
  light), a kerb along the arcade, ONE tidy low wall with coping 3.4 out running from the tower into the landing (it leaves the canvas
  at the bottom, it never ends in view), pier blocks on it in line with every second arcade pier; one deliberate group of goods per side,
  square to the arcade against a pier (left: crates + barrels, right: barrels + stacked crates); the two landing fires moved onto the
  wall (they light the forecourt at night); the lions moved back 0.7 so the canvas bottom never cuts them; every empty bay gets an iron
  grille and the bay interiors are a warm dark brown, not black. The ground beyond the wall is the same paving, dimmed by the vignette.
- Checked: desk 1440 at 1× and 2×, a wide canvas, a 390 phone, zoomed, day + night, Roma + Syracusae + Capua.

## Pass 7 — the near/front sides (his picture of the front + 1a 2a 3a; REPLACES pass 6's forecourt, low wall and goods)
Target: a carved façade straight under the near stands (arched doorways, piers with red eagle banners, potted cypress + ivy), the grand
stair at the front corner with two lions at its foot, fires ONLY on the two pillars flanking the stair, plain background beyond, and room
below the board for the whole stair when the window is tall enough (phones / short windows unchanged).

### 7a — first build
- Built: the near sides rebuilt on the game's 3-tier outline (E1): a wall with plain arched doorways (dark brick vaults) every 2.0, piers
  with base + capital, a two-step cornice under the stands' edge, a plinth course; banners on every second pier, a potted cypress + ivy
  on the others; the stair continues the game's own 4-step corner flight (192 cuts the corner at X + Z = 28.57 and draws down to
  y −0.49): 11 steps to the ground, cheek walls, two pillars, lions on plinths at the foot. The ground plane, the forecourt, the low wall,
  the goods, the bay props/lamps and the grilles are gone; the holdout follows the game's real outline (its bottom corner cut).
- Framing: a taller canvas in tall windows (below).
- Compared with his picture: the layout reads right (façade, doorways, banners, greenery, the stair between pillars, lions), BUT
  - the façade is a dull grey: the sun (az 30) barely touches the two near faces, and the recede vignette darkens them further; his
    façade is a light, warm cream;
  - the pillars' tops and braziers are INVISIBLE: anything of ours that rises above the stands' level near the corner is painted over
    by the game's own corner floor (the bake is drawn under the game);
  - the lions are dark lumps.

### 7b — front pieces + brighter near stone
- Changed: the near façade, stair, pillars and lions get a brighter stone albedo (×1.45; still tinted per arena), wider pillars (1.1)
  that end just above the stands' level with a wide bowl on top; a 'front' coverage mask (pillars + braziers + their banners, a 382×302
  box) — 419 paints the composite through it once more at the end of 192's cached 'deco' layer, so the pillars stand IN FRONT of the
  game's stands corner like his picture (0 cost per frame).
- Compared with his picture: façade colour, the pillars with braziers at the stair top, banners on the pillar fronts and the stair
  now match his composition; the flames read red (bronze bowl, small yellow heart); NIGHT: a hard-edged orange rectangle on the game's
  floor beside each brazier (the brazier light on our abutment top, which the game paints over by day but the glow is added on top).

### 7c — final
- Changed: gilded bowls and a larger yellow heart (his picture's gold braziers); the two night lights moved in front of the pillars, a
  little below their tops, with shadows (the braziers themselves cast none) — no light lands on surfaces the game paints over, the
  hard rectangle is gone (the light sits level with the pillar tops, so they do not blow out); the stair, the pillar faces and the near piers take the warm pool.
- Compared with his picture (tall 1440×1200 at 1× and 2×, 2560×1440, Roma + Syracusae + Capua, day + night, zoomed):
  - same: the façade under the stands, doorways, piers with banners, cypress + ivy, the stair between two pillars with gold braziers and
    banners, lions at its foot, a plain background beyond, fires only at the stair (+ the existing podium and tower ones).
  - different: his façade is taller and more ornate (lion heads, relief panels, a brazier on most piers — not wanted, 2a); his lions
    are detailed sculptures, ours are simple seated shapes; his stair is a little wider; our doorways are darker; the near banners are
    every second pier (his: most piers) to keep it calm. The pillars stop just above the stands' level (taller ones would cover the
    corner spectators).
- Framing (3a): see FRAMING in 419's header. The board itself does not move (Flavius's banner already touches the canvas top, so it
  cannot go up): the canvas grows DOWN to OY + 10.65·TW when the window's fit budget (innerHeight − fitReserve(), 07-ui's fitH) holds
  it — e.g. 1440×1200 (TW 64: canvas 724 → 855 px) and 2560×1440 / 1600×1300 (TW 68: 769 → 908 px); 1440×900, 1920×1080, 2200×1000,
  1512×982, 1280×720, phones and landscape phones keep today's framing exactly (tv111am).
- Sizes: 7 files 416 KB (stone 212, fixed 77, glow 50, bench 49, cloth 13, fire 11, front 4.5) — less than pass 6 (448 KB) though the
  frame grew to 2576×1624: the ground plane is gone.

## Pass 8 — MOCK-UP: filling the bottom corners (his note on pass 7 + picks 1a 2a 3a; decisions 2026-10-22 "corners + glow")
His note: "the glow of the stair is strong; the bottom right and left corners are really bland … looks odd empty floating / seeing night
sky". Picks: 1a ground + a Roman city ONLY in the two bottom corners and below the stair (3a: above the far stands unchanged), MOCK-UP
FIRST, with his fallback (c) ground only (+ a raised-view version) to compare; 2a two small warm pools on the stair's top steps at ~1/3.
Built behind a VARIANT switch: `make.js --variant p7|city|ground` (scene.js opt.variant; default p7 — re-baked and compared: byte-identical
to the committed pass 7 files). Raised view = (c) with 419's framing kill switch in a tall window (today's 724 px canvas): render-only.
Review page: scratchpad amph111-review.html, new top section "Pass 8 mock-up: filling the bottom corners".

### 8a — first build
- Built ('city'): a paved terrace at the façade's foot (2.0 deep, a plaza square under the stair big enough for the lions), three steps
  down to a street plane that covers everything below the near façades out to the canvas edges (no night sky can show); a sidewalk;
  per corner a low portico, 4–6 houses (terracotta hip roofs with tile courses drawn in code, plaster walls in the stone layer so they take
  each arena's colour), cypresses and umbrella pines; a handful of lit windows (5 in 8c) as glow-only meshes. HAZE (amph111.html hz8): the city + ground
  materials mix toward a haze colour with the distance out from the façade and toward the canvas sides, and the ink lines fade by the same
  factor (the normal pass writes 1 − haze into alpha; the post pass scales the ink with it). 'ground': the paving + steps + street only,
  the haze dark. 2a: the two pillar lights (pass 7c) are off; two spot lights straight down on the top steps, no shadow.
- Bug: the pillar lights stayed on (props.js `o.light || 1` turned 0 into 1) → `o.light == null ? 1 : o.light`.
- Compared with pass 7 and his picture: the corners are no longer empty, but most of the city sat OFF the canvas — a 1440 window shows only
  ±7.6 TW (canvas 970 px), not the bake's ±11.5; the visible corner is a small triangle (x − z ≥ −5.8, x + z ≤ 12.3 at street level in the
  near frame). The pools were 1/5 of pass 7 (top steps 12 vs 63 in the glow layer).

### 8b — the city moved into view, calmer paving, haze toward the bottom
- Changed: the buildings regrouped right by the plaza and the street (each corner: a portico on the sidewalk, 5 houses, 3 cypresses, 3 pines;
  in short windows only the nearest roofs show); terrace 1.4 deep, steps 0.25; a calmer paving texture (luminance contrast ×0.32 instead of
  0.55: the marbled veins read dark and busy); the haze also grows toward the canvas BOTTOM (sy 8.4 → 11.2 TW) so the city fades out at the
  bottom edge; pools 5.0 aimed at the top steps → 21.5 vs pass 7's 63 (≈1/3), lower steps 0.2, lions 0, façade 0.
- Compared: day reads as ground + a quiet town in a warm haze, lower contrast than the stands; night dark blue-grey with a handful of
  windows; (c) a dark warm band round the stair. Left: umbrella pines read as khaki discs; on Syracusae the roofs' haze (warm) did not
  match the cool walls/ground.

### 8c — final mock-up
- Changed: darker pine/cypress greens, smaller pine canopies; the fixed layer's haze colour more neutral (#c0b7a6) so it suits warm and cool
  arenas.
- Compared with pass 7 and his picture (tall 1440×1200 at 1× and 2×, 1440×900, day + night, Roma + Syracusae): the bottom corners are
  paving → steps → street → a few roofs/portico/trees fading into haze; nothing floats, no night sky below the arena; the stair's light is
  two small pools on the top steps, the lions and façade unlit. His picture's ground is a plain cream floor (no city) — (c) is closer to
  that by layout, (a) is what he asked for now.
- Sizes: (a) 488 KB (stone 272, fixed 98, glow 41, others as pass 7) vs pass 7 416; (c) 440 KB. Same frame (2576×1624): same memory and the
  same one-off composite. Per frame: 0 by day (cached under layer); night glow blits 18 pieces / 35% of the frame for (a), 14 / 31% for (c),
  15 / 33% for pass 7. Contrast read-back identical to pass 7 in every view.
- assets/amph111_* now hold (a) (the preview is off by default); 419 is unchanged (same frame + front box).

## Method
- Projection: an orthographic camera 30° down / 45° round = the game's 2:1 iso; world X/Z = the board's columns/rows (1 unit = 1 tile),
  so tile corner (0,0) is the game's (OX, OY) and K = TW/√2 px per view unit; heights: 1 unit = 0.612 TW. The frame is 11.5 TW either side
  of OX, 3.6 TW above and 10.9 TW below OY (8.9 before pass 7) (07-ui draw: OY = 2.7 TW, the canvas ends ≤ 8.6 TW below it). In the game the composite is drawn
  at (OX − 11.5·TW, OY − 3.6·TW) scaled TW/112, so every size and zoom lines up with no per-view bake.
- Alignment check: the game's footprint is a holdout in the bake (transparent there); composited in the real game (Playwright, the bench
  scene) its edges sit on the stands' outline on every side, at 1×, 2×, phone and zoomed.
- Layers: rendered at 2× with no MSAA, box-filtered (down.py, premultiplied) → each layer's alpha is exact coverage, the layers add
  ('lighter') without seams. Holdouts render first (renderOrder −1) and alpha-tested meshes keep their cut-outs in other layers' passes.
- Sun = 399's LIGHT106_SUN (az 30, el 55 → world (−0.554, 0.819, 0.149)), PCF soft shadows, warm sky fill; ink = depth + normal edges.
