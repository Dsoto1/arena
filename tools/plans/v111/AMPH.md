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

### 8 final — his pick: (c) ground only + the raised view (2026-10-22; REPLACES pass 7's 3a "grow the canvas for the whole stair")
- assets/amph111_* = the 'ground' bake (paving at the façade's foot, three steps down to street level, fading into a dark warm haze; the 2a
  stair pools), make.js's default variant is now `ground` (p7 and city stay reproducible with --variant).
- 419: the tall-window ar91View canvas growth and its kill switch flavius_amph111frameoff are removed — the framing (canvas height, TW, OX,
  OY) is today's in every window; in tall windows the stair's foot and the lions sit below the canvas edge like on a 1440×900 desktop.
- Sizes: 7 files 440 KB (stone 246, fixed 77, bench 49, glow 40, cloth 13, fire 11, front 4.5) vs pass 7's 416 KB; same frame, same
  memory; 0 per frame by day; night glow 14 pieces / 31% of the frame (pass 7: 15 / 33%).
- Tests: tv111am rewritten to the new rule (flag on: layers load, framing = flag off in tall/short/phone, tile clicks right, no errors);
  tv111am tv91r tv66 tv100z tv101z pass.

### 9 — the upper-tier crowd = our spectators (v1.11b, his pick 1a 2026-10-22)
- Source: the LIVE crowd's own sprites — assets/crowd100_s0..s5.webp (the production rig92 token pre-rendered by tools/art/crowd100, 6 looks,
  seated poses, 4 facings, the tunic key mask) with 313-v100crowd's CROWD100_META (read from the source file by the bake page). The rig92
  token itself was not put in the bake scene: it is an ES-module three build with skinning + outline shells (a second three instance in the
  page); the sprites ARE what the inner stands draw, so the same pixels at a smaller size. Tint = 313's rule copied (cr100Tint(mix(colour,
  home-city wool, 0.4)), multiplied through the mask): 60% fans in the 8 class colours (16-crowd allegCol), 40% in the 10 ROBES; wool = one
  of the 12 CITY_TUNIC. Looks weighted like a live house (96 spectators × 5 arenas dump: s2 37 · s5 21 · s4 16 · s0 15 · s1 5 · s3 5 %).
  Poses: sit 94%, sitfist 3%, sitcheer 3%; facing the sand (farL = facing 3 down-right, farR = 0 down-left) like 313's far stands.
- Build (props.js crowdSprites, amph111.html AMPH111_CROWD): each figure a quad in the camera plane, one merged mesh + one atlas of only
  the cells used (2048×951, 260 cells); seeded + deterministic (scene rnd). Light: MeshStandard, emissive 0.72 (its own painted light) +
  diffuse 0.35 (the bake's sun + shadows still reach it; the night/glow render turns the emissive off, so only the fires light them).
  Ink (9a–9c): an alpha-tested normal/depth material, so the outline follows the cut-out (its own edge pixels take half the ink; 9d: off).
  make.js --crowd prim re-bakes pass 8's figures; --copt '{"f","pitch","fans","inset","full","ink"}' / --cs '{"d","e"}' tune it.
- 9a: anchored at the bench's front edge, robe colours only. Compared with the inner stands (zoomed Roma): the shins hung down the deep
  risers like stilts; dark and orange-heavy (the ROBES dyes are dark; the live house is mostly fans in bright class colours).
- 9b: anchor 0.12 inside the bench (the slab hides thighs + shins — they sit ON the bench), 60% fans; size 0.85 × the inner stands'
  seated head height (0.39 TW). Read right, but sparse (pass 8 occupancy).
- 9c (final): fuller (≈ 3 seats in 4, still clustered and thinner up high, a few empty seats; aisles + vomitorium kept), emissive
  0.62 → 0.72. 319 figures. Checked 1440×900 1× and 2×, zoomed day/night, 390 phone, Roma + arenas 0 and 3 day/night: the same people as
  the inner stands, smaller; 419's vignette (darker + less saturated away from the sand) keeps them quieter than the inner stands and board.
- Sizes: assets/amph111_* 474 KB (pass 8: 440): fixed 77 → 109, stone 246 → 251 (their shadows), bench 49 → 46, glow 40 → 39. Same frame
  + front box (419 unchanged), 0 per frame by day, night glow unchanged in shape.
- 9d (his note on 9c: "those spectators need to face the proper direction"): 9c used 313's far-stand cells (top-right = cell 0,
  top-left = 3), but the sheets render cell i at tools/art/crowd100 YAWS[i] = 45/135/−135/−45 and yaw 45 turns the rig's +z front to +x
  = screen DOWN-RIGHT (checked: the walk cells, the bake's projection of the camera right/up vectors, a marked atlas proving the bake does
  not mirror, and the occlusion: with cell 0 on the top-right rows the knees went ALONG the bench and the slab hid them). So 9c faced along
  the rows. Now top-left = cell 0 (down-right), top-right = cell 3 (down-left): every figure faces the sand. Facing the sand the knees
  come over the bench's front edge, so 9b's inset (which cut the thighs with red slab wedges) is gone: anchored at the edge (−0.02), the
  shins hang down the riser to the row below. The bake's depth ink is off for the crowd (props ink 0 writes normal-alpha 0; the post pass
  skips alpha-0 neighbours): it drew grey halos round the hanging legs; the sprites keep their own painted outline, as live.
  Sizes: assets/amph111_* 498 KB (fixed 109 → 136: the legs). The live inner stands are RIGHT and stay unchanged (9e check): 321-v101board
  (G4, test tv101e) reverses every CROWD100_META cell list at load, so in the game 313's index 0 is the sheet's cell 3 (down-left) as its
  comment says; only the bake (which reads the raw meta from 313's source) had the mirror-image cells. The "inner stands too" fix
  (a 421 module swapping 0/3) was NOT built: it would have turned the live crowd along its rows. Zoomed shots of all four inner
  sections + the upper tiers, day and night (v1.11a merged): every seated spectator faces the sand, near stands show their backs.
- Left: one size on every row (ortho bake, no per-row shrink); fans wear the class colours, not this match's fighters (a bake can't follow
  the match); no stand-ups / cheering waves up there (static).

## Pass 10 — the side corners (v1.11c; his screenshot of the right corner + picks 1a 2a 3a, decisions 2026-10-22 "side corners")
His screenshot (zoomed on the right corner): 192's short corner flight runs off the paved corner landing into thin air over the tower's
dark doorway; the tower is a flat grey block, greyer than the cream façade; a strip of sky beyond the tower at the canvas edge; the ground
is dark. Built behind `make.js --corner p10|p9` (scene.js opt.corner; p10 = the default; p9 re-bakes v1.11b byte-identically, checked).
- 192's flight (ar91Under, read in the page): chevron treads round the outline's side vertex V, 5 steps, each 0.12 TW out in screen x
  (= 0.12 world units out along X and Z) and 0.06 TW down (0.098), arms 1.5 TW (2.68 units) along the outline, foot 0.3 TW (0.49) below
  it. Grand arenas V = (15.92, −2.92) (right corner), the near arm's foot on X = 16.52; 3-tier V = (15.45, −2.45), X = 16.05.
### 10a — first build
- Right corner in world coordinates, the left = X and Z swapped (a mirrored frame; put() now swaps two corners of each triangle when
  the matrix's determinant is negative — every old frame is right-handed, so nothing else changes). Tower = v1.11b's square.
- 1a: a landing at 192's foot level (Y −0.49) from the façade to X 16.52 (a 3-tier arena's flight lands on it too), then 10 steps down
  along the tower's +Z face to the ground (rise 0.192, run 0.24 = 192's slope), a stepped cheek wall like the front stair, a newel block
  at the foot, a one-storey annex continuing the near façade round the tower (its cornice + plinth, a parapet) with the arched doorway
  right at the stair's foot; a paved apron (the terrace's paving and level) with three steps down to the street; the tower and annex
  stand on the street (no floating base).
- 2a: stoneN (the façade's cream, tinted per arena), cornices between 4 storeys, one arched window per storey per visible face (dark
  opening, sill, keystone), ONE banner (+Z face, middle storey), the top brazier; the medallions and the old gate arches are gone.
- Compared with his screenshot + 9d: the stair reads (nothing hangs), the tower is cream and calm; but 192's flight still drew over the
  tower's wall (its back part lies inside the tower: the game paints on top of the bake) and the sky still showed past the frame.
### 10b — a portal under the board's flight + the frame goes on
- The tower's foot opens in a wide arch (X 15.45..18.15, up to 2.2, 2.07 deep) exactly where 192's flight and corner landing lie inside
  the tower; our steps run back under it to its far wall. The board's steps now read as coming out of the tower.
- 3a: enc.py settles the frame's outermost band (AMPH_EDGE, in TW) into one colour per row (premultiplied, so the layers still add up);
  419 draws that outer column past the frame's left/right edge (amphPlace in the cached layer; amphOutside when zoomed), so the tower +
  ground haze go on to the canvas edge. First try (0.45 TW, rows blurred 0.2 TW): horizontal streaks far out.
### 10c — final
- Band 0.7 TW, rows blurred 0.5 TW; 419 eases the stretched column over 4 TW into its own mean colour (cached 48-px strips per
  composite): a calm haze, no sky beside the towers at any width; sky stays above the towers' roofline (as above the far stands).
- His "the ground is dark": the side haze is lighter up by the towers (amph111.html hz8: the sideways term × 0.55..1 by screen y < 8 TW;
  the bottom corners as before). Most of the dark at the stair's foot is the tower's own shadow (sun upper left).
- Checked (review page amph-corner-review.html): his view, both corners zoomed day/night, Honey raw sienna (3-tier) day/night, 1440×900
  @2×, 1920×1080, 2560×1440, 2200×1000, 3440×1440 (canvas 1030 wide), 390 phone, landscape phone, pinch 1.1 on both phones, 3440 zoomed.
  Unzoomed the corners sit at the canvas edge (only the stair's head shows at 1440); everything else is as shipped.
- Sizes: assets/amph111_* 532 KB (9d: 498): stone 249 → 275, fixed 136 → 140, glow 39 → 43, bench/cloth ±1. Same frame, same memory;
  0 per frame by day; zoomed past the frame: ≤ 2 clipped blits per uncovered strip. Night glow unchanged in shape.
- Left: pinched to 1.1 on a phone, the lighting wash ends at the cached layers' margin, so a faint step in shade can show far out in the
  haze (v1.11a's zoom strips have the same limit). 192's flight is drawn on top of everything of ours, by design.
- Tests: tv111am tv100r tv100z tv91r tv92p tv66 tv101z pass (tv111s fails its call-count checks only when run in parallel — same on v1.11b).

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
