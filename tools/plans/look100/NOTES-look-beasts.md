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
