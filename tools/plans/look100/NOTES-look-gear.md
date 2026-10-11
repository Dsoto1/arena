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


## Round 3 — shield/elbow fix, FULL OUTFITTING, faces
Re-render: `node tools/plans/look100/make3.js` (~2.3 min). New code: `outfit100.js` (layer stack + PIECES table + `outfitCheck` rules),
weapon additions in `gear100.js` `weaponKit`, face sculpt + 2.2 mm head grid in `body100.js` (`face2`, `headRes`). Inventory: `r3_inventory.json`
(32 ARM + 29 W from the built game, after every module patch); layer table: `r3_layers.json` (and below).

| file | what |
|---|---|
| r3_shield.png | 3 poses × front / shield-arm side / behind the shield + 8 facings |
| r3_maxload.png + r3_maxload_sheet.png | max load in 8 facings, 512 hero, side/back, unarmed stack, worn + REFUSED list |
| r3_contact.png | all 32 printed armor pieces + 28 weapons on the mannequin, labelled (chariotCard skipped) |
| r3_faces.png | male/female before vs after at 512 px, profile, board size (1×) and head ×3 |

- Elbow fix: the scutum's long axis follows the FOREARM (elbow → wrist) and stands 85 mm off its axis (75 mm for the Thracian / Achilles);
  the grip constraint twists about the forearm; the board is centred on the fist (boss over the hand); two brackets join the handle to the board.
- Layer stack (shell offset off the skin): sandals 4.8 · padding 6.2 · mail 9.2 · plates 12.5 · belts 19 mm · then rigid shoulder flares stacked
  outward (+12 % each: thorax pauldron → manica → segmentata) · helmets. The rules (outfitCheck = armorConflict + armPad): one hard piece per equip
  point, lower padding under a hard lower piece, the belt on the chest plate, the Leather Tasset alone on the upper leg.
- Faces: 2.2 mm head grid merged into the 5 mm body (overlap band at y 1.585, no seam), small blend radii, no eyeballs (flush eye + painted
  almond, iris, dark upper lid), wedge nose, brow ledge, mouth line painted, jaw angle + chin, flat ears with a hollow. Build 3.5 → 9–11 s
  (~270k verts) on SwiftShader; sheet size unchanged (27–28 KB) — the gain is at 512 px; at board size the heads read about the same.

| piece | name | slot/pt | AP | segment | layer | offset mm | recipe |
|---|---|---|---|---|---|---|---|
| galea | Iron Helm | head/helm | 2 | head | helm | rigid | rigid helmet galea |
| cassis | Horned Helm | head/helm | 3 | head | helm | rigid | rigid helmet horned |
| crista | Hoplomachus Helm | head/helm | 3 | head | helm | rigid | rigid helmet crested |
| murmillo | Steel Gated Helm | head/helm | 4 | head | helm | rigid | rigid helmet murm |
| helm5 | Steel Dome Helm | head/helm | 5 | head | helm | rigid | rigid helmet secutor |
| flavhelm | Helm of Flavius | head/helm | 5 | head | helm | rigid | rigid helmet crested |
| centurion | Centurian Helm | head/helm | 3 | head | helm | rigid | rigid helmet centurion |
| steelhelm | Steel Helm | head/helm | 2 | head | helm | rigid | rigid helmet galea |
| thrachelm | Thracian Helm | head/helm | 4 | head | helm | rigid | rigid helmet thraex |
| pectorale | Bronze Chest Armor | chest/chest | 3 | torso | plate | 12.5 | shell pect |
| lorica | Scaled Chest Armor | chest/chest | 4 | torso | mail | 9.2 | shell cuirass scale |
| musculata | Forged Chest Armor | chest/chest | 5 | torso | plate | 12.5 | shell cuirass muscle |
| amazon | Plated Chest Armor | chest/chest | 5 | torso | plate | 12.5 | shell cuirass straps |
| flavchest | Flavius' Chest Armor | chest/chest | 5 | torso | plate | 12.5 | shell cuirass muscle |
| thorax | Reinforced Chest Armor | chest/chest | 7 | torso | plate | 12.5 | shell high plates + pauldrons |
| ornate | Ornate Chest Armor | chest/chest | 4 | torso | plate | 12.5 | shell high medal |
| balteus | Leather Gladiator Belt II | chest/chest | 2 | belt | belt | 19 | shell ornate |
| balteus1 | Leather Gladiator Belt I | chest/chest | 2 | belt | belt | 19 | shell ring |
| wraps | Padded Arm Armor | arm/lower | 2 | armL | pad | 6.2 | shell  pad |
| bracers | Flavius' Bracers | arm/lower | 3 | armL | plate | 12.5 | shell  plate |
| manica | Galerus | arm/upper | 3 | armU | plate | 12.5 | shell  lames + 1 shoulder flare(s) |
| provmanica | Manica | arm/upper | 3 | armU | plate | 12.5 | shell  lames + 1 shoulder flare(s) |
| galerus | Lorica Segmentata | arm/upper | 4 | armU | plate | 12.5 | shell  lames + 2 shoulder flare(s) |
| cestus | Cestus | arm/hand | 2 | hand | pad | 6.2 | shell |
| legwrapsU | Leather Tasset Armor | leg/upper | 2 | legU | plate | 12.5 | shell  strips |
| femoralia | Iron Tasset Armor | leg/upper | 3 | legU | plate | 12.5 | shell  lames |
| thighplate | Tasset Armor | leg/upper | 4 | legU | plate | 12.5 | shell  lames |
| legwraps | Padded Leg Armor | leg/lower | 2 | legL | pad | 6.2 | shell  pad |
| ocrea | Greaves | leg/lower | 4 | legL | plate | 12.5 | shell + knee cap (front) |
| greaves | Flavius' Greaves | leg/lower | 3 | legL | plate | 12.5 | shell  engr + knee cap (front) |
| cnemis | Steel Greaves | leg/lower | 5 | legL | plate | 12.5 | shell + knee cap (front) |
| lgreaves | Leather Greaves | leg/lower | 3 | legL | plate | 12.5 | shell (front) |


## Round 4 — every piece modelled from his art, every weapon from his card with its hold
Re-render: `node tools/plans/look100/make4.js` (~3.2 min). Code: `r4_pieces.js` (HELM builders, PIECES4 table with the reference per piece,
`arm4`/`outfit4`, WGEO4 weapon models, HOLD4 stances + WHOLD4 weapon → stance, `weapon4`), `page4.js` (equip = armor + weapons + stance +
two-hand partner + bow string + net; `clearance` = weapon points inside posed bone capsules / the shield board).

| file | what |
|---|---|
| r4_armor.png | all 32 printed pieces: his art (arm81_* / armor2 cell) beside the 3D piece in two views |
| r4_weapons.png | all 28 weapons: his card (weapons.jpg cell) beside 3 facings in their hold + the clearance check |
| r4_maxload.png + r4_maxload_sheet.png | maximum load with the modelled pieces |
| r4_classes.png + r4_cls_<class>.png | the 8 class loadouts, his mini beside each |

- Helmets: own silhouettes (Iron: nasal, cheek guards, riveted crossing bands · Horned: horns + gold-trimmed mask · Hoplomachus: brim, crest fin,
  plume, grille · Steel Gated: grille + flared bottom brim · Steel Dome: enclosed, red eyes, ridge · Flavius: lion mane, ears, brow muzzle, fangs,
  spike · Centurian: cap, cheek guards, neck guard, fore-aft plume · Steel: pointed lathe dome, ridge, eye slits, nasal · Thracian: brim, griffin
  crest, gold grille).
- Cuirasses: shells over the neckline AND the shoulders (no floating straps), rolled rim (+2.8 mm at the edge + a hem), relief by type (scale
  rows, overlapping plates on the Reinforced, crossing wing straps, the red figures + a red pteruges skirt on Flavius', medallions + a striped
  collar on the Ornate); the Reinforced is lighter steel with 3-plate pauldrons.
- Tassets: three separate curved plates per thigh on the hip bone (they swing with the leg), rivets, a bottom band; the Leather Tasset has strips.
- Greaves: shaped shell (shin ridge, ankle flare, rolled edge) + a knee cap (plain, dome for the Steel Greaves, lion boss for Flavius').
- Arms: Galerus (key manica) = 6 overlapping lames + a flanged shoulder; Lorica Segmentata = 4 stacked riveted shoulder plates + 3 lames;
  Manica (provmanica) = fur mantle + 2 iron shoulder plates + the octagonal plate; Bracers engraved; wraps/leg wraps padded rings; cestus ribbed.
- Holds (HOLD4): sword-type forward and low · dagger/knives reverse grip · spear/trident/pilum/jade overhand, point forward (trident + a net in
  the off hand) · mace/axe/charun/flail/severed limbs raised · stones raised to throw · bow drawn (string to the drawing hand) · crossbow
  shouldered, off hand under the stock · labrys two-handed · sling hanging · lyre held + plucked · scissor on the forearm · shields strapped.

## Round 5 — straight wrists + sculpted helmets and cuirasses (r5_*)

Files: r5_wrists.png (round 4 vs round 5, 4 holds × 3 facings, wrist numbers), r5_holds.png (all 25 held weapons, wrist numbers),
r5_sculpt.png (his art · round 4 · round-5 sculpt in 3 views, triangles, build ms), r5_maxload.png + r5_maxload_sheet.png,
r5_classes.png + r5_cls_<class>.png, r5_stats.json. Code: r5_sculpt.js (SDF sculpts), page5.js (hold solver + sheets), make5.js;
game100.js gained align(sd, {tf}) = twist about the forearm only.

Wrists. Each weapon now leaves the fist at a fixed angle θ in the hand's own frame (sword 28° toward the thumb, spear/dagger −90/−100°
= out of the little-finger side, haft 80°, two-handed trident 25°, bow/lyre 90° in the left hand). From the wanted blade direction the
solver derives the forearm direction, places the elbow on the shoulder's reach sphere, the wrist one forearm further, and gives the
two-bone IK that elbow as its pole; only a forearm twist turns the thumb. Clamp: ≤15° flex, ≤10° deviation (strip to twist + re-solve).
Measured (hand vs neutral, in the hand's frame): round 4 gladius 94°/92°, hasta 47°/33°, axe 70°/50°, knives 70°/75° (flex/dev);
round 5 every one of the 25 weapons ≤5.5° total, the clamp never fired; the blade lands within 0.1–3.4° of its aim.

Sculpts (SDF → surface nets 2.2 mm helmets / 2.5 mm cuirasses → normal-aware vertex clustering 4.5 / 7.2 mm → AO + wear + palette):
murmillo 55,268 tris (built 0.69 s), thrachelm 60,032 (0.94 s), crista 55,138 (0.72 s), centurion 32,671 (0.46 s),
musculata 38,121 (4.1 s), thorax 56,458 (5.4 s); cached per body. Helmets are SOLID (the head fills them: no inner face, no thin-shell
speckle), brims use an exact slanted-segment SDF (no toon ripples), grilles are real holes over a dark liner. Cuirasses = the body
field offset 13.5 mm, solid down into the body, skinned from the nearest body vertex. Sheets stay ~28–35 KB WebP per class; a class
sheet renders in 6.1–7.4 s, full run 142 s.

Short of his minis: muscle relief and lames read weakly through the 4-band toon at board size; the Thracian griffin is a smooth swan
neck (no feathers/mane detail); no embossed figures (his helmets' engraved crests/medallions); pauldrons are one plate with stepped
lames, not his riveted scales; metals have no specular highlight/reflection, so steel and silver look matte; the gladius tip touches
the scutum edge in the front view of the max load; sculpts not yet made for the other helmets/chests (cassis, galea, flavhelm,
steelhelm, ornate, amazon).

## Round 6 — painted highlights, refined + 10 new sculpts, sword 15°, gladius clear (r6_*)

Files: r6_sculpt.png (all 16 sculpts: his art · round 4 · round 6 two views), r6_maxload.png + r6_maxload_sheet.png, r6_classes.png +
r6_cls_<class>.png, r6_board.png (his mini beside ours, 1:1 and ×2), r6_stats.json. Code: r6_sculpt.js (fork of r5_sculpt.js, which is
unchanged), page6.js, make6.js.

- Painted highlight (bake): a crisp light band on curves facing the upper left (n·L > 0.74, L = (−0.5, 0.75, 0.45) in the piece's own
  frame, so it turns with the figure like paint) + a soft wider band; steel/silver take near-white, gold/bronze/copper take a saturated
  pale gold (#ffe070 / #ffd98a / #ffb880) so gold stays gold. Recesses: AO^1.35 × (1 − 0.7·cavity), cavity from the field Laplacian.
- Refined: Thracian neck rippled into feather scales + an 11-feather mane (alternating silver/gold) + embossed palmette on the brow +
  cheek medallions; Hoplomachus crest is a flat plate with a bronze bead + brow medallion; Centurian embossed scroll band + 8 bosses;
  Murmillo grille wider + centre bar; Reinforced Chest shoulders = riveted overlapping scales, a rivet row on every lame; muscle relief
  ~15% stronger.
- New sculpts: galea (spangenhelm, bands, rivets, nasal → cheek guards), cassis (horns, gold front plate, eye slot, emblem), helm5
  (closed blue-steel, red eye holes, ridge, spike, gorget), flavhelm (lion: mane, brow, snout, eyes, fangs, jaw blades, spike),
  steelhelm (gothic V face, ridge, spike, slanted slits with red glint, embossed skulls); pectorale (laurel wreath), lorica (scales
  all over), amazon (crossing feathered wings), flavchest (dark plate, copper figures, red fringed skirt), ornate (blue scaled collar
  band, two blue rosettes).
- Triangles 30.7k–60.3k per piece (thorax 71.0k), helmets build 0.5–1.0 s, cuirasses 3.7–9.8 s, once per body.
- Sword 15° off the forearm line; max load searched until no gladius point is in the scutum board or the body: 0/68 with the shield
  hand 230 mm left of round 5 and the sword hand at (−0.33, 1.20, 0.44).

## Round 7 — belts + limb pieces sculpted, engraving dropped, cloth per class (r7_*)

Files: r7_sculpt.png (15 new belt/limb sculpts: his art · round 4 · round 7 two views), r7_maxload.png + r7_maxload_sheet.png,
r7_classes.png + r7_cls_<class>.png, r7_board.png, r7_stats.json. Code: r7_sculpt.js (fork of r6), page7.js, make7.js.

- 1b Reinforced Chest 53,463 tris (cell 12.1 mm; was 71k).
- 2c dropped: Thracian palmette + cheek medallions, Hoplomachus brow medallion, Centurian bosses, Horned Helm brow medallion, Iron
  Helm brow rivets, Steel Helm skulls, Bronze Chest wreath. Kept: silhouettes, colour blocks (Flavius' Chest figures, Ornate rosettes),
  the Centurian scroll band, scales, the highlight bands.
- 3b loincloth per class = k-means of the hip band of his minis8 front+back cells, lifted to survive the toon ramp (sampled → used):
  soldier #3f0b06 → #7a1c14, royalty #222630 → #2c3550, hero #534824 → #5c6a2a, slave #7c5f3a → #9c7a46, veteranus #b1a391,
  amazonia #73492e → #8a4a2a, venatore #452c45 → #5a3466, damnatio #3e2e22 → #4a3a2e.
- 4a limb sculptor (LIMB7 + sculptLimb): an offset shell of the body field around one limb segment (span along the bone, sector around
  it, never wrapping a neighbouring bone), solid into the limb, layer offsets pad 6 / plate 12.5 / belt 19 mm, lames / spiral wraps /
  knee cops (round, pointed) / shoulder flange / fur + scaled plate; skinned from that limb's own body vertices. Pieces: wraps 10.8k,
  legwraps 15.3k, bracers 9.0k, manica (Galerus) 32.3k, provmanica (Manica) 27.6k, galerus (Lorica arm) 25.6k, tassets 23.6–24.7k,
  greaves 15.3–16.5k, leather greaves 18.8k, belts 23–24k triangles; 3.7–8.6 s each (belts 1.3–1.7 s), once per body and side.
  Fix found on the way: the vertex re-projection now uses a normalised gradient and a capped step (a cut region in the field had flung
  vertices a metre away).
- Cost: class sheets now 16.8–21.1 s each (were 6–8 s) and the max-load sheet 30.3 s — the SwiftShader render of many skinned meshes
  with outlines; sizes unchanged (27.6–35.4 KB per class, 33.5 KB max load). Full run 446 s.

## Round 8 — scutum fixed + shield check, merged sculpts, hanging tassets, belts, in-game preview (r8_*)

Files: r8_sculpt.png (tassets + belts), r8_maxload.png + r8_maxload_sheet.png, r8_classes.png + r8_cls_<class>.png, r8_board.png,
r8_stats.json; in-game preview r8_ingame_{studio_1440,modeller_1440,modeller_390,board_1440,board_1440_crop,board_390}.png + r8_ingame.json.
Code: r8_sculpt.js (merge8, plate tassets), page8.js (shield pose + shieldCheck8 + belt8 + merge timing), make8.js, r8_ingame.js;
gear100.js gained spec.up8 (board long edge along the forearm). Preview tree: ingame/ (copy of src/ + build.sh, assets symlinked except
tok93.js, rig92/ = the look-test modules + sculpt.js, mkgame8.js → ingame/assets/tok93.js, flavius-arena.html built there).

- SCUTUM: the shield forearm stands upright (elbow over wrist) in the board's plane, upper arm reaching back; the board's LONG edge runs
  along the forearm (round 3's code put its width there — upright forearm = landscape board, the round-6/7 tilt). SHIELD CHECK (make8
  fails on any break): every posed skin point of the elbow + forearm inside the board's outline must be behind it, the face within 10° of
  the facing, the long edge within 10° of the forearm — all 8 facings. Max load: 0 of 2030 points in front, face 1.4°, edge 0°; hero
  (Thracian) the same; other classes carry no shield.
- MERGE: one skinned mesh + one outline per figure. Sheet times merged vs unmerged: max load 16.6 vs 17.3 s; soldier 11.7/12.3,
  royalty 9.5/9.1, hero 10.5/11.4, slave 10.9/10.6, veteranus 10.4/11.0, amazonia 9.4/10.6, venatore 9.8/9.6, damnatio 8.9/8.9 (no
  sculpts) — the sheet's base cost (~9 s, SwiftShader at 2× supersampling, 8 facings) dominates; merging saves 0–11%.
- TASSETS: three separate plates on two straps from the belt, each plate a thin shell standing off the thigh more toward its lower edge
  (gap 11 → 31 mm), overlapping, skinned to the thigh. 60,470 tris each (thin shells need a 3.6 mm cluster cell).
- BELTS: moved onto the body's belt line (1.035–1.115 m); the old belt shell, studs and front ring are hidden while one is worn.
- IN-GAME PREVIEW: a soldier-kit Studio character converted in 67 s (modeller load 23.7 s, sheet 17.0 s, sculpts the rest) to a 29.7 KB
  sheet (92×145); worn sculpts: centurion, balteus, wraps L/R, tassets L/R. tok93.js 128 KB → 232 KB.
