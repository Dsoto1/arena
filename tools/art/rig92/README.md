# rig92 — posable 3D gladiator tokens (v0.92 groundwork, in the game since v0.93)

The procedural body + rig behind the standard token of every Studio custom character (printed classes keep their 3D minis;
online keeps the sculpted tokens until v0.94). **In the game since v0.93:** `node tools/art/rig92/mkgame.js` bundles rig.js +
body.js + presets.js + gear.js + game.js into `assets/tok93.js` and three.js into `assets/three93.js` (both plain scripts, loaded
on demand by src/222-v93token.js — re-run it after editing any of these files and commit the two assets).

## Run

```sh
node tools/art/rig92/make.js              # every preset → out/  (~45 s: body build ~4 s, then ~6 s per preset)
node tools/art/rig92/make.js lunge compare   # just some
python3 -m http.server 8792               # from the repo root, then open http://127.0.0.1:8792/tools/art/rig92/rig.html
```
make.js starts its own `python3 -m http.server` and drives headless Chromium (Playwright, SwiftShader WebGL).
`rig.html?headless=1` skips the editor loop; `&res=0.005` sculpts on a coarser grid (faster, softer).

## Files

| file | what |
|---|---|
| `body.js` | the sculpt (~150 anatomical primitives: muscle ellipsoids, round cones, smooth unions, sub-tracted eye sockets/mouth/navel) → field on a 4 mm grid → surface nets → skin weights → base gear shells + rigid bits → toon/ink materials |
| `rig.js` | joints, `makeBones`, pose JSON (`poseToJSON`/`poseFromJSON`), `applyPose`, two-bone IK (`solveTwoBone`, `solveFoot`, `solveArm`), feet kept on the base (`clampFoot`), `resolveSpec` for presets |
| `presets.js` | v0.99: 24 presets in `PRESET_GROUPS` — Stances (stand guard ready wide crouch coil) · Attacks (overhead thrust lunge slash bash throw net aim) · Defence (defend parry brace) · Show (victory salute taunt kneel crossed limp spent); specs: FK + pinned feet + wrist IK targets. Keys stay `[a-z0-9]{≤16}` (the online `pk` check) |
| `rig.html` | the editor + the render API (`renderSheet`, `renderHero`, `renderFront`, `footCheck`) |
| `make.js` | headless renders → `out/<preset>_sheet.png`, `out/<preset>_hero.png`, `out/compare.png`, `out/meta.json` |
| `gear.js` | v0.93: armor shells per equip point (cuirass, belt, manica, bracers, greaves, thigh plates, wraps, cestus) + rigid helmets / crests / cosmetic headgear / shields / weapons; custom pieces' 3D-able extras (studs, spikes, fur, neck guard, trim, paint); `makeGear(B).set(spec)` rebuilds only changed pieces |
| `game.js` | v0.93: the engine the game uses — `createToken()` → `apply({look,gear,pose})`, `sheet()` (minis8 format), `facings()`, `editor(canvas)` (drag joints on a 2D canvas; one WebGL context), `presets`, `pins()` |
| `mkgame.js` | v0.93: bundles the above into `assets/tok93.js` (window.TOK93LIB) and three into `assets/three93.js` (window.THREE93) |
| `vendor/` | three.js r169 (`three.module.min.js`, MIT, see `vendor/LICENSE`) + `OrbitControls.js` |

## Space and scale

Metres, y up, the figure stands on the base top (y = 0) facing +z; its **left is +x**. Crown 1.855 m (≈7.5 heads).
Mini scale: the figure is 32.5 mm on a 25.4 mm round base (`MM_PER_M`, `BASE_R`, `BASE_H` in rig.js), rendered at
`MINI_PXMM` 3.143 px/mm like the printed minis.

## Skeleton (his pose app's colours)

`pe` pelvis (pink, root) → `sp` spine → `ch` chest → `ne` neck → `he` head (yellow);
left (blue) / right (red): `sL/sR` shoulder → `eL/eR` elbow → `wL/wR` wrist (hand tips = pink handles),
`hL/hR` hip → `kL/kR` knee → `aL/aR` ankle (foot). Every bone's rest rotation is the identity, so eulers read in world axes:
limbs hanging down: +X swings back, −X forward, +Z toward +x; spine/neck/head: +X bends forward, +Y turns to its left.

## Pose JSON (v1)

```json
{"v":1,"p":[0,-215,40],
 "j":{"pe":[10,-14,0],"sp":[10,6,0],"sR":[-96,48,19],"eR":[-49,18,8],"hL":[-72,11,21],"kL":[60,2,-1], "…":[0,0,0]},
 "f":{"L":[150,380,4],"R":[-120,-380,-30]}}
```
- `p` pelvis offset from rest, mm (body space), ints. `j` joint eulers in degrees, ints, order XYZ; omitted joints = 0.
- `f` pinned feet: ankle x,z in mm over the base + foot yaw. On load the legs are re-solved by IK, the sole lies flat on
  the base, the foot is pulled inside the base disc (`clampFoot`), and the pelvis drops if a leg can't reach.
- Size: 243–334 bytes for the 24 presets (limit 600; the whole online look must stay ≤ 3 KB). game.js clamps hand-made eulers to ±180° and the
  pelvis to ±450 mm, so even every joint at its extreme stays ≤ ~470 B (tv93k checks it).
- v0.99 joint tools in game.js: `joint/setJoint`, `offset/setOffset`, `mirror(limb, from)` (a reflection keeps X and negates Y and Z; a pinned
  foot moves to [-x, z, -yaw]), `resetJoint/resetLimb`, `thumb(json, px)` (preset pictures), and the editor's `select(k)` / `axis(i)` gizmo
  (rings for the X / Y / Z euler axes in XYZ order, the active one bold).

## Sprite sheet format (same as `assets/minis8_<key>.webp`)

One row of 8 cells in `MINI_YAW` order `[0,45,90,135,180,-135,-90,-45]` (cell 0 faces the camera; yaw +45 faces screen
right-down, i.e. a step along +c, matching `miniFace` in src/102-minis73.js). Orthographic camera at **30°** elevation (the
elevation the printed `minis8` were rendered at), transparent background, rendered ×4 and halved down.
`renderSheet` returns `meta = [cellW, cellH, anchorX, anchorY]` exactly like `MINI8` — the anchor is the base centre on the
board plane (bottom of the base). Typical: `[86,124,43.5,101.4]`.

## Look

Toon shading (3-step ramp, one sun upper left), crease ink computed from the field (a cavity value per vertex, thresholded per
fragment so lines stay crisp), inverted-hull outline (`setOutline(metres)`; sheets use 0.85 px). Gear = the avatar's base kit:
harness straps (polylines projected onto the skin) + front/back rings + square buckles, studded belt + iron ring, grey wrap,
yellow subligaculum with brown hem and V seam, sandal straps (two helices crossing front and back, top band, ankle/foot straps),
soles; optional hair cap. Straps and cloth are **shells**: body triangles lifted 5–11 mm along the normal, same skin weights,
cut by a mask attribute (crisp edge + ink/hem bands in the shader), so they follow any pose.

## Timing (this sandbox, SwiftShader CPU WebGL)

Body build ~4.1 s (field 2.1 s, mesh 0.5 s, weights 0.8 s, gear 0.7 s) → 171k verts / 343k tris.
Sheet (8 facings ×4 supersampled) ~5–6 s, hero close-up ~0.8 s. On a real GPU the renders are a fraction of that.

## Done in v0.93

- `buildBodyAsync` (the same build cut into ~14 ms slices, so the Studio stays responsive), `setLook({skin,hair,hs,bs,fem,cloth})`
  repaints skin/hair/cloth and shows hair styles (cap, crop, curly, crest, long, braid), beards (full, goatee, stache, stubble,
  forked) and the gladiatrix's strophium, built lazily; `kit` + `kill` let gear.js add and remove shells and rigid bits.
- The game builds at `res 0.005` (~107k verts, ~2.5–6 s on SwiftShader, far less on a GPU); a sheet is ss 2 + MSAA (~35–45 KB webp).

## Still open (was: Left for v0.93)

1. **Gear shells on bones**: printed armor/weapons modelled once (helmets on `he`, manica on `sL/eL`, greaves on `kL/aL`,
   shields/weapons in the hand on `wL/wR` with a grip pose), custom pieces from base shapes + the ARMOR EXTRAS (studs, spikes,
   fur, neck guard, crest, damage…). Shells can reuse `shellFrom` (body-hugging) or ride a bone like the rings.
2. **Hands**: a grip/fist pose per hand (fingers are fused capsules today) so weapons sit in the palm.
3. **Wiring**: `tokenForP`/`drawPlayer` pick the 8-facing sheet for custom/online characters (MINI8-style meta),
   render on demand in a hidden canvas, **cache per pose + parts hash** (IndexedDB/Store) so a sheet is made once.
4. **Look parameters** from the Studio/online look (skin tone, hair style/colour, build sliders → primitive radii/headScale),
   all ≤ 3 KB with the pose.
5. **Speed**: the 4 mm dense field could be built once and cached as a mesh (or moved to a worker); posing is instant.
6. Polish: face at close-up (still a little puppet-like), loincloth/flap cloth that hangs, deep elbow/knee bends pinch (plain
   linear skinning — dual quaternions or corrective blend if needed), knee pole choice for crossed stances.
