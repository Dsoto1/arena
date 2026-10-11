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

---

# Round 3 — his round-2 answers (1a Leo split · snake much slimmer · 3a mane framing the face · 4a Commodus pelt hood + segmented armour · 5a Tholo's cape swings · 6a Zora smaller + perched)

Pictures only, not game code. Nothing in `src/` or `tools/art/rig92` was touched. `anim_rig.js` got one additive export line at the end
(`LOOK100X`) so the round-3 humanoid module can reuse its frames and renderer; rounds 1–2 render as before.
An earlier, unfinished round-3 attempt (strand fur, a sculpted pelt geometry) is in git history (commits a7fc185 / 23cd995); this round replaces it.

## What changed
| beast | round 3 |
|---|---|
| **Leo** (1a + 3a) | Sheet SPLIT: `beast3_leo_sheet.webp` = idle + walk (10 frames, cell 152×124, cropped on its own) and `beast3_leo_act_sheet.webp` = attack/hit/die (13 frames, 242×180, the wide pounce). Mane rebuilt: two rings of BIG locks radiating round the face in the face plane (inner ring pale gold `#e0bc80`, outer `#c49656`), a forelock tuft, 3 neck rings behind (was 5), a bigger chest bib — the face is framed, not collared. |
| **Glykon / Arenosus** (snake) | Body radius 0.95 mm (was 2.1), a loose S-coil over the middle of the base (1.7 turns of a widening spiral, nothing stacked, radius 6.9 → 3.3 mm), a longer raised S-neck, the head ×0.62, finer mesh (0.26 mm). Reads like his minis' thin snakes instead of a coiled rope. |
| **Zora** (6a) | ×0.72 (figure scale 0.83 instead of 1.15), PERCHED on a pale rock on the base (body low, feet on the rock), wings spread LOW (flap 12–24° instead of 44–52°) like his mini; the flight frames are short hops off the perch; she falls off the rock in the die frames; lighter, less orange feathers. |
| **Tholo** (5a) | The cape is CLOTH: every frame it is re-hung from the shoulders as 9 × 12 chains — gravity + that frame's motion (the walk trails it back and sways it left/right in step with the legs; the attack swirls it; the hit whips it forward; the die lets it drape) — and pushed out of the body (capsules on torso, thighs, shins), so the legs push it instead of passing through. Closed slab (two layers + rim) with fold shading and an ink outline. Cost: ~3 ms per frame (480 ms for the whole sheet). The rigid round-2 panel is gone. |
| **Commodus** (4a) | LION-PELT HOOD: a fur shell over crown, back and sides of the head + the lion's upper face over his brow (skull, muzzle, nose, eyes, ears, two fangs) + 9 dark mane tufts framing his face + the pelt hanging down his back (the same cloth chains, shorter, fur-shaded). SEGMENTED ARMOUR: banded lorica segmentata on the torso + shoulder bands (dark seams every 43 mm, a front closure line) and leather pteruges below; the galea and the scale lorica are gone; manica, greaves, gold belt, sword stay. |
| others | Leaena, bears, wolves, boar, croc, spider: unchanged (round-2 sheets `beast2_*` stay current; they were re-rendered only for the composites). |

The rigs (one skeleton per species, his colour language — `beast3_rig_leo.png`, `beast3_rig_glykon.png`, `beast3_rig_zora.png` for the
changed ones) follow his "BEAST 3D MODELS" note: lion = the wolf skeleton (26 joints) + a separate mane (the locks are their own pieces,
not body joints); snake = root/head/neck + a spine chain (13 joints); Zora = spine, chest, head, wing shoulder → elbow → wrist → tip both
sides, legs/feet, tail (17 joints). As in round 2 every frame is re-sculpted (sprite sheets), not a skinned mesh.

## Files
| file | what |
|---|---|
| `beast3_r2_vs_r3.webp` | **round 2 above round 3** for the six changed beasts (idle, 8 facings, as drawn at zoom ×2; Tholo/Commodus ×1.4 and their walk) |
| `beast3_board.png` | every beast + two ×1.15 gladiators on the real board |
| `beast3_vs_minis.webp` | his mini above ours, 8 facings, both as drawn at zoom ×2 |
| `beast3_cape_frames.png`, `beast3_clip_cape.webp` | Tholo's cape: walk0–5 at four facings (×1.8); Tholo walking two tiles, the cape trailing and swaying (48 × 40 ms, 194 KB) |
| `beast3_clip_pounce.webp`, `beast3_clip_frames.png` | Leo's pounce with the new mane (46 × 40 ms, 121 KB) |
| `beast3_strip_<leo|glykon|arenosus|zora|tholo|commodus>.png` | animation strips (facings 1 and 3) |
| `beast3_<key>_sheet.webp` | game-format sheets: `leo` (idle+walk) + `leo_act`, `glykon`, `arenosus`, `zora`, `tholo`, `commodus` |
| `beast3_rig_<leo|glykon|zora>.png` | rig diagrams |
| `beast3_rig.js/.html`, `beast3_make.js`, `beast3_comp.js`, `beast3_hum.js/.html`, `beast3_humanoid.js`, `beast3_report.json`, `beast3_hum.json` | how it was made |

**Re-run** (with `LOOK_SCRATCH` = the round-2 scratch, which also holds `beast2_glad.png` and the `beast2_<k>.png` sheets the comparison reads):
1. `node tools/plans/look100/beast3_make.js render` (all quadrupeds/snakes/Zora/spider, ~12 min on a loaded box)
2. `node tools/plans/look100/beast3_make.js diag leo glykon zora`
3. `node tools/plans/look100/beast3_humanoid.js` (Tholo + Commodus; 9–20 min each under load)
4. `node tools/plans/look100/beast3_make.js comp`

## Numbers (SwiftShader; decoded = cells × w × h × 4)
| beast | cell | WebP | decoded, all | decoded, idle + walk | render |
|---|---|---|---|---|---|
| leo — idle+walk sheet | 152×124 | 207 KB | 5.8 MB | **5.8 MB** (round 2: 12.8) | 124 s for both |
| leo — action sheet | 242×180 | 262 KB | 17.3 MB | — | |
| glykon / arenosus | 96×83 | 242 / 238 KB | 5.6 MB (r2 8.3) | 2.4 MB | 34–36 s |
| zora | 110×130 | 271 KB | 10.0 MB (r2 20.4) | 4.4 MB | 76 s |
| tholo | 212×228 | 512 KB | 33.9 MB (r2 25.4) | 14.8 MB | 21 min (box load 12–40) |
| commodus | 182×203 | 517 KB | 25.9 MB (r2 21.2) | 11.3 MB | 9 min |

- **All 14 loaded:** ≈ 184 MB decoded (round 2: 193); idle + walk only ≈ 76 MB (round 2: 84). Leo's split, the slim snakes and the small Zora
  saved ~31 MB; the cape and the pelt cost ~13 MB because their swinging/draping frames widen the humanoids' cells.
- Tholo's and Commodus's cells grow with the cloth in the attack/die frames — the same split as Leo's (idle + walk vs actions) would bring
  their idle + walk back to about 6–7 MB each.
- Cloth simulation itself is cheap (0.5 s for a sheet); the humanoid render time is the rig92 body + gear shells, as before.

## What still falls short
1. **Commodus's lion face** is small at board size — the pelt reads as a tawny hood, the muzzle only from the front facings. His mini's hood reads as a grey wolf-like head; ours is a lion (his 4a word).
2. **Pteruges** read as puffy shorts more than strips at board size.
3. **The cape's top edge** follows the shoulders but has no clasp or brooch; in the back facings it covers his back fully (that is how a cape hangs, but it hides the tunic).
4. **Zora's perch rock** is a plain rounded stone; his mini's perch is hard to see — he may want no rock at all, just low on the base.
5. **Mane locks** are still smooth ellipsoids (no strand grooves); colour is closer to his pale gold than round 2.

## Open questions (multiple choice)
1. **Split the humanoids like Leo** (idle + walk sheet and an action sheet, each cropped on its own)?
   - a) yes — Tholo and Commodus too (idle + walk ≈ 6–7 MB each instead of 11–15)
   - b) yes — every beast whose actions widen the cell (lions, bears, croc as well)
   - c) no, Leo only
2. **Tholo's cape:**
   - a) good as is (red, to the calves, swinging)
   - b) shorter (to the knees) so the legs read better from behind
   - c) add a bronze clasp/brooch at the shoulders
3. **Commodus's hood:**
   - a) lion as built, but a bigger muzzle/face so it reads at board size
   - b) a grey wolf-like pelt like his mini
   - c) keep as is
4. **Zora's perch:**
   - a) keep the rock
   - b) no rock — low over the bare base like his mini
   - c) a wooden stump/post instead
5. **Snake:**
   - a) good as is (thin, loose S, raised neck)
   - b) even thinner / smaller coil
   - c) a little thicker (between round 2 and round 3)

# Round 4: his round-3 answers (1a split Tholo + Commodus · 2c ivory cape + bronze clasp · 3a bigger lion face · 4 Zora on a broken pillar chunk · 5 snake thinner)

These are pictures only, not game code. Nothing in `src/`, `assets/`, `tools/art/` or the tests was touched. The `beast4_*` files are copies of round 3 with the changes.
The naming lets `tools/art/mm100/make.js` keep picking the newest `beastN_rig.js` + `beastN_hum.js`. Both files still expose `BEAST300` / `LOOK100.humanoid3`.
Their result still carries the FULL sheet (`png/meta/rows`), plus `parts`.

## What changed
| beast | round 4 |
|---|---|
| **Tholo** (1a + 2c) | TWO sheets: `beast4_tholo_sheet.webp` = idle + walk (10 frames, cell 126×152) and `beast4_tholo_act_sheet.webp` = attack/hit/die (13 frames, 212×228). The cape is IVORY `#efe7d2` (was red), with the same length (calves) and the same cloth motion. A BRONZE CLASP sits on each shoulder top (13 cm disc + dark rim + raised boss), and a bronze chain across the chest joins the two. In the attack frames the body showed through the ivory cloth as red ovals. The cloth now keeps 7 cm off the body (`m: 0.07`; it was 1.6 cm) and is a little thicker. |
| **Commodus** (1a + 3a) | TWO sheets (idle + walk 112×147, actions 182×203). The lion's face is about 1.6× and sits HIGH on the hood. It has a long nose bridge to a broad dark nose, a heavy brow, a pale muzzle with whisker pads, dark sockets with amber eyes and small cone ears. A dark mane ring goes round the lion's head, and longer tufts frame his face. The first try had round ears and read as a teddy bear; the long nose makes it read as a lion. |
| **Zora** (4) | She perches on a BROKEN CHUNK OF PILLAR: a fluted drum (16 flutes, shaded grooves) in the pillars' grey stone. The top is broken off unevenly: high where she stands, falling away to one side, with a paler fresh break. A torus band runs round its foot and two fallen chips lie on the base. The drum is 6.6 mm high and 9 mm across (the rock was 3.2 mm high). Her die frames carry her 4.2 mm further forward so she falls clear of it. |
| **Glykon / Arenosus** (5) | Thinner again: body radius 0.68 mm (round 3: 0.95, round 2: 2.1), head ×0.6. The S-coil, raised neck and small head are unchanged. |
| others | Unchanged: Leo (round-3 sheets); Leaena, the bears, wolves, boar, croc and spider (round-2 sheets). The board composite uses those sheets. |

## Files
| file | what |
|---|---|
| `beast4_r3_vs_r4.webp` | **round 3 above round 4** for the five changed beasts (idle, 8 facings, as drawn at zoom ×2; Tholo and Commodus at ×1.4, plus their walk) |
| `beast4_board.png` | every beast (round-4 sheets for the changed ones) + two ×1.15 gladiators on the real board |
| `beast4_close_tholo.png` | Tholo ×3, upper body: idle, walk, attack and hit × 5 facings (cape, clasps, chain) |
| `beast4_close_commodus.png` | Commodus ×3, head + shoulders: idle, walk and attack × 5 facings (the lion face) |
| `beast4_close_zora.png` | Zora ×2.5 on the pillar chunk: idle, hop (walk2), strike, die1 and die4 × 5 facings |
| `beast4_cape_frames.png`, `beast4_clip_cape.webp` | Tholo walk0–5 at four facings (×1.8); Tholo walking two tiles (48 × 40 ms, 194 KB) |
| `beast4_strip_<glykon|arenosus|zora|tholo|commodus>.png` | animation strips (facings 1 and 3) |
| `beast4_<key>_sheet.webp` | game-format sheets: `tholo` + `tholo_act`, `commodus` + `commodus_act`, `zora`, `glykon`, `arenosus` |
| `beast4_rig.js/.html`, `beast4_make.js`, `beast4_comp.js`, `beast4_hum.js/.html`, `beast4_humanoid.js`, `beast4_report.json` (incl. `memory`), `beast4_hum.json` | how it was made |

**Re-run** with `LOOK_SCRATCH` set to any scratch folder. The round-3 side and the unchanged beasts come from the committed beast3_/beast2_ sheets, and the gladiator from `anim_glad_main_sheet.webp`.
1. `node tools/plans/look100/beast4_make.js render zora glykon arenosus` (~1 min)
2. `node tools/plans/look100/beast4_humanoid.js` (Tholo + Commodus; 5–8 min each under load). It writes `beast4_<k>_part.png` for each part to the scratch folder.
3. `node tools/plans/look100/beast4_make.js comp`

## Memory (decoded = cells × w × h × 4; full numbers in `beast4_report.json` → `memory`)
| beast | round 3 | round 4 idle + walk | round 4 actions | round 4 both |
|---|---|---|---|---|
| tholo | one sheet 212×228, 512 KB, **33.9 MB** (all of it loaded even to stand) | 126×152, 246 KB, **5.8 MB** | 212×228, 314 KB, 19.2 MB | 25.0 MB |
| commodus | one sheet 182×203, 517 KB, **25.9 MB** | 112×147, 232 KB, **5.0 MB** | 182×203, 312 KB, 14.7 MB | 19.7 MB |
| zora | 110×130, 271 KB, 10.0 MB (idle + walk 4.4) | 110×141, 311 KB, 10.9 MB (idle + walk 4.7); the taller perch costs 0.9 MB | | |
| glykon / arenosus | 96×83, 242 / 238 KB, 5.6 MB | 96×82, 232 / 229 KB, 5.5 MB; the raised neck sets the cell, not the body | | |

- Tholo + Commodus standing or walking: **59.9 MB → 10.9 MB**. The action sheets load only when they act.
- All 14 loaded: ≈ 184 → **≈ 170 MB**. The split also trims 15 MB of empty cell space around the idle/walk frames.

## What still falls short
1. At board size (zoom ×1) Tholo's clasps are only a few gold pixels. The chain and clasps read from zoom ×2 up. The cape reads clearly (ivory against the red tunic).
2. The cape now hangs a hand's width off his back, so the body never shows through the pale cloth. In the back facings it looks a little stiff and boxy.
3. From the front-top camera, Commodus's own face is mostly under the lion's upper jaw. The lion reads; his face reads less.
4. Zora's die1/die2: a wing tip dips under the base in two facings. This was already there in round 3 and is unchanged.
5. The snake is thinner, but the coil and head still set the cell, so its memory hardly changes.

## Open questions (multiple choice)
1. **Tholo's cape off the back:** a) as is (7 cm, the body never shows) · b) closer (4 cm), accepting a rare red fleck in the swing frames · c) closer + a darker ivory/linen so a fleck doesn't show
2. **Clasps:** a) as is (disc + boss + chain) · b) bigger discs, no chain · c) lion-head brooches (Tholo's own touch)
3. **Commodus's lion face:** a) as is · b) the lion's jaw higher, so more of his face shows · c) bigger still, so it reads at zoom ×1
4. **Zora's pillar chunk:** a) as is (grey drum, broken top) · b) a lower drum · c) marble-white like the arena's pillars in the lighter themes
5. **Split every beast whose actions widen the cell** (the lions are done; bears, croc and wolves next)? a) yes · b) only if the menu/board needs the memory · c) no
