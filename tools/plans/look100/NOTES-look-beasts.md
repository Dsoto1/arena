# v1.0 LOOK TEST — beasts as 3D tokens with animation frames

These are pictures only, not game code. Nothing in `src/` or `tools/art/rig92` was touched, and nothing is committed.

## How the beasts are built
- **Quadrupeds, snakes, the eagle and spiders: `beast_rig.js`.**
  - Each animation frame is one signed-distance sculpt, measured in millimetres of the real mini.
  - The sculpt is a smooth union of tapered capsules and oriented ellipsoids. It is meshed with surface nets, using the same method as `body100.js` and `r6_sculpt.js`.
  - Each mesh is then baked like the r6 sculpts: ambient occlusion from the distance field, darker cavities, a dry-brushed highlight on convex edges, and fur / mane / feather / scale / band patterns.
  - Drawing uses a 4-step toon ramp, an ink outline and a sun from the upper left, on his oval or round bases.
- **Tholo and Commodus: `anim_rig.js` `humanoid()`.** They reuse the rig92 gladiator body with the murmillo's 23 frames (no shield):
  - Tholo: laurel, club, grey beard.
  - Commodus: silver lorica, galea, manica, greaves, sword.
- **Sheets:** 8 MINI_YAW facings per frame (no mirroring), one row per frame, the same format as minis8 / crew96.
- **Frame set per beast (23 frames):**
  - idle 4
  - walk 6 (for Zora this is the flight flap)
  - attack 5
  - hit 3
  - die 5
- **Spiders: 14 frames, with no base.** They are an offering effect, not a piece on the board.

### Inventory and what each beast is modelled on
| key | what | his reference art | base we used | attack |
|---|---|---|---|---|
| leo | lion (NPCT lion, maned) | minis8_leo, npccard82_leo, npcback82p_leo | oval 72×42 mm (his MINI_A footprint 58) | pounce |
| leaena | lioness | minis8_leaena, npccard82/npcback82p_leaena | oval 72×42 | pounce |
| ursa, brutum | bears (named per arena by 250-v98bears) | minis8_ursa/brutum, rtok ursa/brutum | oval 75×47 (his footprint 63) | maul (rears up, swipes, slams) |
| valencia, moechus | wolves (brown / dark) | minis8_valencia/moechus, rtok | round 25.4 | lunge + bite + shake |
| glykon, arenosus | snakes (banded / diamond) | minis8_glykon/arenosus, rtok | round 25.4 | coil, then strike with the jaw open |
| zora | the golden eagle (NPCT zora, flies) | minis8_zora, npccard82/npcback82p_zora | round 25.4 | dive with talons forward |
| tholo | humanoid boss | minis8_tholo, npccard82/npcback82p_tholo | round 25.4 | the gladiator attack, with a club |
| commodus | humanoid boss | minis8_commodus, npccard82/npcback82p_commodus | round 25.4 | the gladiator attack, with a sword |
| boar | custom-beast kind (STOCK_KIND, rtok boar), no mini | rtok boar | round 25.4 | gore |
| croc | custom-beast kind + Naumachia hazard (rtok croc), no mini | rtok croc | oval 75×34 | jaw snap + death roll |
| spider | the Spiders offering (11-extra) | rtok spiders | none | rears up |

## Files
| file | what |
|---|---|
| `beast_vs_minis.webp` | his mini (8 facings) above ours (idle, 8 facings) for every beast, at the same 3.143 px/mm |
| `beast_strip_<key>.png` | one per beast: actions as rows, frames as columns, facings 1 and 3 |
| `beast_<key>_sheet.webp` | the game-format sheets (all frames × 8 facings) |
| `beast_board.png` | every beast on one real board crop with two gladiators for reference. Round bases are 0.8 tile; long bases are 1.1 tile |
| `beast_clip_pounce.webp`, `beast_clip_frames.png` | Leo pounces on a gladiator: 46 frames × 40 ms. The pose steps every 120 ms while the base glides; the gladiator plays hit0–2 |
| `beast_rig.js`, `beast_rig.html`, `beast_make.js`, `beast_humanoid.js`, `beast_comp.js`, `beast_board_shot.js`, `beast_board_empty.png`, `beast_board.json`, `beast_report.json` | how it was made |

**Re-run order:**
1. `node tools/plans/look100/beast_make.js render` (about 5 min)
2. `node tools/plans/look100/beast_humanoid.js` (about 9 min)
3. `node tools/plans/look100/beast_board_shot.js`
4. `node tools/plans/look100/beast_make.js comp`

## Sizes and times
Sheets are rendered at the minis' 3.143 px/mm (×2 supersample) on SwiftShader, the CPU WebGL in headless Chromium. "Decoded" means cells × w × h × 4 bytes.

| beast | cell | frames | WebP (q 0.8) | decoded, all | decoded, idle + walk | render |
|---|---|---|---|---|---|---|
| leo | 256×219 | 23 | 736 KB | 39.4 MB | 17.1 MB | 43 s (sculpting 6.4 s) |
| leaena | 236×190 | 23 | 701 KB | 31.5 MB | 13.7 MB | 33 s |
| ursa / brutum | 240×204 | 23 | 638 / 593 KB | 34.4 MB | 14.9 MB | 43 / 34 s |
| valencia / moechus | 122×107 | 23 | 278 / 227 KB | 9.2 MB | 4.0 MB | 17–18 s |
| glykon / arenosus | 110×87 | 23 | 300 / 293 KB | 6.7 MB | 2.9 MB | 15 s |
| zora | 124×163 | 23 | 286 KB | 14.2 MB | 6.2 MB | 17 s |
| boar | 126×106 | 23 | 209 KB | 9.4 MB | 4.1 MB | 15 s |
| croc | 240×148 | 23 | 524 KB | 24.9 MB | 10.8 MB | 34 s |
| spider | 50×50 | 14 | 35 KB | 1.1 MB | 0.5 MB | 6 s |
| tholo / commodus (rig92 body) | 140–142×144 | 23 | 395 / 430 KB | 14.2–14.4 MB | 6.2 MB | 256 / 266 s (gear shells re-skinned per pose; rig92 is slower) |

- **Meshes:** 12k–23k triangles per frame.
- **Sculpting:** 0.06–0.3 s per frame. The rest of each render is the software rasteriser at about 0.5 s per facing; the gladiator round measured raster 523 ms per cell here.
- **Memory is set by the big beasts.** Lions, bears and the croc are rendered at full mini resolution but drawn on the board at 0.43–0.51 × that size, because a long base is capped at 1.1 tile. Rendering them at the size they are drawn would cut both memory and WebP size by about 4×: a lion would drop to roughly 10 MB decoded and 180 KB on disk.
- **Idle + walk always loaded, every beast once:** about 108 MB at today's resolution; about 30 MB rendered at drawn size.
- **The clip:** 106 KB.

## What falls short of his minis
1. **Detail and silhouette.**
   - His minis are real sculpts with fur strands, faces and muscle definition; ours are smooth capsule-and-ellipsoid blobs with painted noise.
   - The lion's mane is a dark cap rather than a flowing mane, and the faces have no expression.
   - At board size (about 40–90 px) the gap narrows. Beside his minis at 1:1 it is obvious.
2. **Colour.**
   - Our bears and Moechus come out darker and more saturated than his (his bear is a lighter tan-brown).
   - The lions are more orange than his golden sand colour.
   - His bases are dark textured sand with a coloured rim; ours are lighter.
3. **Poses.**
   - The bear's maul rears up, but the front paws are hidden inside the body.
   - Zora's idle has the wings folded, while his mini has them spread mid-flight. The flap frames read better than the perch.
   - Tholo has no cape and the same height as a gladiator; his mini is about 13% taller and much bulkier. This needs the scale option from the other agent's rig100.
4. **Scale on the board.**
   - With long bases capped at 1.1 tile, the lions and bears end up small next to the gladiators. Even at the old base 0.8 tile, the gladiator looks bigger than a lion.
   - The other agent's +15% figure scale is not applied to the reference gladiators here: these sheets have the figure at 1.0 on a 0.8-tile base.
5. **Deaths.** The die frames are a generic fall onto the side; there is no blood or pose variety.
6. **Not built.**
   - Croc and boar have no mini of his to match.
   - Spiders have no hit reaction on the target.
   - The lion's pounce moves the base only 0.36 tile toward the gladiator and back; the board rule (base stays in its tile) keeps the leap short.

## Open questions (multiple choice)
1. **Board size of the big beasts (long bases capped at 1.1 tile today):**
   - a) keep the cap (small lions and bears)
   - b) let long bases span up to 1.5 tiles, drawn across two tiles
   - c) cap the base at 1.1 tile but draw the figure +30% over it, the way the gladiators get +15%
2. **Sculpt detail:**
   - a) keep the smooth painted look and push only colour and pattern
   - b) add sculpted fur-tuft and muscle passes (about 3× sculpt time, same sheet size)
   - c) bake his TTS mini meshes into the same rig (best likeness, needs his bundles rigged)
3. **Resolution:**
   - a) render each beast at the size it is drawn on the board (about ¼ memory, softer close-ups)
   - b) keep the mini resolution (crisper zoom, about 250 MB decoded for everything loaded)
   - c) two sizes: a small board sheet plus a full-resolution idle row for cards and zoom
4. **Frame set:**
   - a) 23 frames for every beast
   - b) beasts that only scan and strike get fewer: idle 2, walk 4, attack 3, hit 2, die 3 (14 frames, about 40% smaller)
5. **Tholo:**
   - a) the rig92 body scaled +13% with a cape and a heavier build
   - b) his mini rendered to 8 facings with 2D bob/lean for motion
6. **Spiders:**
   - a) the modelled sheet as a swarm effect (35 KB)
   - b) also a board piece with a base, if a custom spider beast should exist

---

# Round 2 — his answers (new rig per beast, 2c, 3a, 4a, 6a, Tholo 5a, longer pounce)

## What changed
- **A rig per species in his colour language** (his `ref_beast_rigs.jpg`). The colours are head red, shoulder/chest/hip orange, spine yellow, elbow/knee/wing green, paw/foot/wing tip blue, and tail purple. Every build in `beast2_rig.js` emits its joints (`JL`), and `beast2_rig_<key>.png` draws them over the figure in two views.

  | species | joints | skeleton |
  |---|---|---|
  | lion, lioness, wolf, boar | 26 | pelvis, mid and withers spine; neck; head + jaw; per leg top → elbow/knee → wrist/hock → paw; tail chain |
  | bear | 26 | same skeleton, plantigrade feet |
  | croc | 27 | sprawled plantigrade legs, long tail |
  | snake | 12 | spline chain, head, tail |
  | Zora | 17 | spine, chest, head; wing shoulder → elbow → wrist → tip on both sides; legs/feet; tail |

- **Legs done right.** Cats, wolves and boars are digitigrade: the wrist and hock sit high, behind the toes. Bears and the croc are plantigrade: heel and palm are flat and the paws are long.
- **Sculpt.**
  - Muscle masses: shoulder blade, triceps, haunch, gaskin.
  - Face: brow ridge, cheeks, whisker pads (cats), a broader nose pad, chin.
  - Fur: the lion's mane is about 85 locks in 5 rings plus a chest mane; the wolf has a neck ruff; the wolf's tail is brushed in clumps; the bear and boar have about 200 shag clumps on back, flanks and belly; the lion's tail tip is a tuft of locks.
  - Colours are taken from his minis8 renders (lit side), then corrected by eye. Bases are darker sand with his rim colours: lion dark red-brown, bear brick red, wolf dark brown, snake gold, Zora dark red.
- **Fixes.**
  - The rearing bear holds its front paws up and forward in its own body frame (`feetL`), so they show.
  - Zora's idle has the wings spread and raised, like his mini.
  - The lion's pounce reaches 1.6 body lengths forward and the clip's base glides 0.55 tile toward the gladiator, up from 0.36.
- **Board rule (2c).** Long bases stay capped at 1.1 tile, but lion, lioness, bear and croc figures are drawn +30% over the base. Round-base beasts are +15%, like the gladiators. The reference gladiator is the murmillo at ×1.15 on the same 25.4 mm base (the gear agent's r7 rule).
- **Drawn size (3a).** Each sheet is rendered at the size it is drawn at zoom ×2 (tile 104 px). Long bases come out at 1.53–1.59 px/mm instead of 3.143, about a quarter of the memory. Round bases stay at 3.143.
- **Tholo (5a).** Rig92 body at ×1.15 × 1.13 taller and ×1.24 wider, laurel, club, a brick tunic and a red cape. The cape is a rigid curved panel on the chest bone.
- **Commodus.** Rig92 body at ×1.21, white tunic, silver lorica, galea, manica, greaves, sword.
- **Spiders (6a).** Swarm effect only, no board piece.

## Files
| file | what |
|---|---|
| `beast2_rig_<key>.png` | rig diagrams in his colour language (11 beasts; spider skipped since it is a swarm only) |
| `beast2_vs_minis.webp` | his mini above ours, 8 facings, both as drawn on the board at zoom ×2 |
| `beast2_strip_<key>.png` | animation strips (14), facings 1 and 3 |
| `beast2_<key>_sheet.webp` | game-format sheets (23 frames × 8 facings; spider 14) |
| `beast2_board.png` | every beast + two ×1.15 gladiators on the real board |
| `beast2_clip_pounce.webp`, `beast2_clip_frames.png` | Leo's longer pounce (46 frames × 40 ms, 116 KB) |
| `beast2_rig.js`, `beast2_rig.html`, `beast2_make.js`, `beast2_comp.js`, `beast2_humanoid.js`, `beast2_report.json`, `beast2_hum.json`, + `anim_rig.js` `humanoid2()` | how it was made |

**Re-run** (with `LOOK_SCRATCH` set):
1. `node tools/plans/look100/beast2_make.js render` — about 6 min
2. `node tools/plans/look100/beast2_make.js diag` — about 3 min
3. `node tools/plans/look100/beast2_humanoid.js` — about 15 min
4. `node tools/plans/look100/beast2_make.js comp`

## Numbers
All renders are SwiftShader (CPU WebGL in headless Chromium). "Decoded" means cells × w × h × 4 bytes.

| beast | cell | px/mm | WebP | decoded, all | decoded, idle + walk | render |
|---|---|---|---|---|---|---|
| leo | 242×173 | 1.59 | 385 KB | 29.4 MB | 12.8 MB | 35 s |
| leaena | 158×120 | 1.59 | 363 KB | 13.3 MB | 5.8 MB | 27 s |
| ursa / brutum | 118×127 | 1.53 | 336 / 315 KB | 10.5 MB | 4.6 MB | 40 / 43 s |
| valencia / moechus | 140×120 | 3.14 | 305 / 231 KB | 11.8 MB | 5.1 MB | 25 s |
| glykon / arenosus | 126×94 | 3.14 | 314 / 302 KB | 8.3 MB | 3.6 MB | 21–23 s |
| zora | 150×194 | 3.14 | 304 KB | 20.4 MB | 8.9 MB | 36 s |
| boar | 144×118 | 3.14 | 215 KB | 11.9 MB | 5.2 MB | 32 s |
| croc | 148×88 | 1.53 | 222 KB | 9.1 MB | 4.0 MB | 35 s |
| spider (swarm) | 50×50 | 3.14 | 35 KB | 1.1 MB | 0.5 MB | 10 s |
| tholo | 182×199 | 3.14 | 507 KB | 25.4 MB | 11.1 MB | 319 s |
| commodus | 168×180 | 3.14 | 495 KB | 21.2 MB | 9.2 MB | 320 s |

- **Totals, all 14 loaded:** 193 MB decoded, or 84 MB for idle + walk only (round 1: about 250 / 108 MB). Most of the remaining weight is in the round-base beasts and the humanoids, which stay at 3.14 px/mm.
- **Mesh and sculpt cost:** 17k–37k triangles per frame; sculpting 0.1–0.4 s per frame. The bear's shag clumps make it the slowest beast.
- **Leo's cell is wide (242 px)** because the long pounce frames widen every cell in the sheet. Splitting it into an idle + walk sheet and an action sheet, each cropped on its own, would bring idle + walk down to about 5.5 MB.

## What still falls short of his minis
1. **Detail at board size.** Clumps and locks read as bumps; his sculpts have real strand grooves and faces with expression. The bear's shag shows as light flakes on the back. The lion's mane is fuller but sits as a collar behind the head; his frames the face.
2. **Colour.** Closer to his than round 1, but our lions are still warmer and more orange than his pale gold, and Moechus is near-black where his is dark grey.
3. **Commodus.** His mini has a pelt hood and a silver/white kit that reads as armour. Ours reads as a white tunic with little armour; there is no pelt.
4. **Tholo.** The cape is rigid on the chest bone, so the legs pass through it in walk frames. A skinned cloth shell would fix that.
5. **Zora** is bigger and darker than his. His eagle is small, low and mid-flap on a perch.
6. **Seams.** The rig is a joint diagram over a whole-figure sculpt per frame. That is not a skinned mesh, so nothing deforms between frames: each frame is re-sculpted, which is fine for sprite sheets.

## Open questions (multiple choice)
1. **Leo's sheet:**
   - a) split idle + walk from the actions (each cropped on its own, idle + walk ≈ 5.5 MB)
   - b) keep one sheet
2. **Round-base beasts and humanoids at 3.14 px/mm:**
   - a) keep (sharp at zoom 2.4)
   - b) render at drawn size for zoom 2 (≈ 3.27, about the same)
   - c) a 0.75 board sheet + full size only for cards
3. **The lion's mane:**
   - a) bigger, lighter locks framing the face (his look)
   - b) keep the current collar
4. **Commodus:**
   - a) add a lion-pelt hood + segmented armour shells
   - b) keep him plain
5. **Tholo's cape:**
   - a) a skinned cloth shell that swings with the walk (slower to render)
   - b) keep it rigid
6. **Zora's size:**
   - a) match his mini (smaller, on the perch)
   - b) keep her big and spread like now
