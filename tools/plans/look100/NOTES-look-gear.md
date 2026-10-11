# v1.0 look test — 3D gear on the token + modeller polish (pictures only, not game code)

Re-render: `node tools/plans/look100/make.js` (~60–75 s: 6 bodies + sheets, SwiftShader CPU WebGL). Nothing in src/ or tools/art/rig92 changed;
`body100.js` / `gear100.js` / `game100.js` are copies of rig92's body/gear/game with the test options added (header comments say what).

| file | what |
|---|---|
| look100_armor_sheet.png | his minis8_soldier + minis8_hero, today's bare 3D token, the 3D Murmillo-like Soldier (8 MINI_YAW facings, 1×), on 100 px board tiles, 2× |
| look100_armor_hero.png | 512 px hero beside his printed art (ref/pieces.png) |
| look100_grip.png | open hands today vs fists closed on a gladius hilt / scutum handle (outer + front) |
| look100_female.png | male vs female (Amazonia-type) sheets, her with the same kit, both 512 px |
| look100_severed.png | one frame, left forearm gone (512 px + board size) |
| murm_sheet.png, fem_sheet.png, murm_hero512.png, look100_grip_inpose.png | the raw renders |
| stats.json | build / sheet ms, WebP KB, cell meta |

## Sizes and times (WebP q0.9 = the game's t93Make setting; res 5 mm = the game's build)
- Murmillo sheet 720×126 (cell [90,126,45,102.9]) **27.4 KB**; bare male 24.3 KB; female 24.6 KB; female armed 26.4 KB; severed 25.8 KB.
- Body build 3.4–3.8 s; 8-facing sheet 4.5–10 s (gear adds ~2–3 s); 512 px hero ~1.3 s — SwiftShader CPU; a real GPU is a fraction.

## How the gear is built
- Helmet, shoulder guard, knee cap, gladius, scutum = rigid meshes on a bone (head, shoulder, knee, wrist). Manica lames, ocrea, balteus,
  wraps = shells lifted off the skin with the body's skin weights (bend with the pose). Grille and scutum face are small canvas textures.
- Fists are sculpted (finger capsules arc round a bar along the hand's forward axis); the weapon's grip sits in the fist on the wrist bone.
  Scutum = center grip: the fist holds the handle behind the boss, board just past the knuckles; the pose turns the hand so it faces forward.
- Severed: the forearm triangles past the cut leave the index (instant) + a stump cap on the elbow bone.

## Known limits
- Female: muscle/breast/hip changes only — shoulder width is fixed by rig.js joints; the head is still the male head (reads female mostly
  by strophium + hair). Needs a female head + a per-body joint table.
- Fingers fuse at the 5 mm grid (reads as a fist at board size, mitten-like at 512 px). 3 mm would separate them (slower build).
- Our token stands ~15% smaller than his minis on the board (rig scale 32.5 mm figure on a 25.4 mm base vs his bigger bases).
- The thin sword reads black edge-on (the outline is wider than the blade); the ocrea renders orange-gold.
