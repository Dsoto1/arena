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

## Method
- Projection: an orthographic camera 30° down / 45° round = the game's 2:1 iso; world X/Z = the board's columns/rows (1 unit = 1 tile),
  so tile corner (0,0) is the game's (OX, OY) and K = TW/√2 px per view unit; heights: 1 unit = 0.612 TW. The frame is 11.5 TW either side
  of OX, 3.6 TW above and 8.9 TW below OY (07-ui draw: OY = 2.7 TW, the canvas ends ≤ 8.6 TW below it). In the game the composite is drawn
  at (OX − 11.5·TW, OY − 3.6·TW) scaled TW/112, so every size and zoom lines up with no per-view bake.
- Alignment check: the game's footprint is a holdout in the bake (transparent there); composited in the real game (Playwright, the bench
  scene) its edges sit on the stands' outline on every side, at 1×, 2×, phone and zoomed.
- Layers: rendered at 2× with no MSAA, box-filtered (down.py, premultiplied) → each layer's alpha is exact coverage, the layers add
  ('lighter') without seams. Holdouts render first (renderOrder −1) and alpha-tested meshes keep their cut-outs in other layers' passes.
- Sun = 399's LIGHT106_SUN (az 30, el 55 → world (−0.554, 0.819, 0.149)), PCF soft shadows, warm sky fill; ink = depth + normal edges.
