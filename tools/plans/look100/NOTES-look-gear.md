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

## Round 2 (his answers 1a 2a 3 4b 5a 6 7a + the clip fixes)
Re-render: `node tools/plans/look100/make2.js` (~2.5 min) then `node tools/plans/look100/board.js` (the real game page, ~1 min).

| file | what |
|---|---|
| look100_r2_armor.png | his mini · round 1 · ROUND 2 (painted, 1.15×, strapped scutum, stance) + 512 hero + shield-side/back views |
| look100_r2_female.png | male / female / female armed sheets, both 512 px, head close-ups (her head) |
| look100_r2_classes.png | the 8 class loadouts in 3D, his mini beside each, 8 facings + a small hero |
| look100_r2_board.png | the real board: A his minis today · B 3D class tokens at the mini rule · C + pillars/pots/chest ×1.15; an edge token by the railing |
| murm2_sheet.png, fem2_sheet.png, cls2_<class>.png, murm2_hero512.png, stats2.json | raw renders + numbers |

- Scale: figure ×1.15 on the same 25.4 mm base (`createToken({scale})`); drawn with the minis' rule (base 0.8 TW). 222's 3D draw uses `(h/1.3)`
  with h from the caller — the game fix is to use the minis' TW rule so the base never outgrows the tile.
- Objects: pillars (incl. pots) and the chest ×1.15 about their tile centre (board.js wraps drawPillar / drawChest83 in the test page only).
- Scutum: forearm along the board's back with a leather strap, the fist on the handle behind the boss; a grip constraint (`align`) turns the
  wrist after any pose so the board faces forward (no more edge-on / floating). Thracian shield the same way.
- Female: her own head (face, chin, jaw, brow, eyes + dark lids, lips, nose, ears) + skeleton table `rig100.setBody(FEM_BODY)`
  (shoulder chain −17 mm, hips +11 mm a side; torso follows). Close-up faces stay puppet-like (known rig92 item), board size reads.
- Painted pass: 4-band ramp 40/100/176/255, ambient 0.27π, warm sun 0.86π, tanned skin. Still lighter than his minis (they carry baked
  textures/environment light); a darker cloth palette + baked AO would be the next step.
- Sizes (WebP q0.9): Murmillo 29.7 KB (912×138), male 27.3, female 27.7, female armed 29.3, classes 27.5–31.2 KB. Build ~3.4–4.1 s,
  sheet 7–10.4 s, 512 hero ~1.4 s (SwiftShader).
- Class pieces come from gear.js's generic shells/helmets (centurion, cassis, thracian, galea, Flavius, steel; ornate/musculata/amazon chests,
  manicas, greaves, cestus, wraps): they read, but weaker than his minis — the next pass models each printed piece like the Murmillo kit.
