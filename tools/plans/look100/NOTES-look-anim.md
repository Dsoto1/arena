# v1.0 LOOK TEST — animated tokens, effects, 3D spectators

Pictures only, no game code. Everything is rendered from the rig92 token modeller (read-only import of
`tools/art/rig92/game.js` + `rig.js`), the way the clean-up crew (clean96) was: poses → one sheet ROW per frame × 8
MINI_YAW cells, rendered once. Board crops come from the built `flavius-arena.html` (all-CPU Classic Elimination,
24 CPU spectators, 1440×900, board fit = z1 and zoom ×2 = z2).

## Files

| file | what |
|---|---|
| `anim_strip.png` / `.webp` | **1. ANIM STRIP** — murmillo at board size (zoom ×2, base ≈ 0.8 tile), 12 rows, facings 1 (45°) and 3 (135°) |
| `anim_clip_walk_attack.webp` | **looping clip** (21 frames, 110 ms, 364×296, 131 KB): walk two tiles + 5-frame attack, the retiarius takes the hit and recoils, on a real board crop |
| `anim_clip_frames.png` | the same clip as a frame row |
| `anim_fx_rete.png` | **2. rete** — wind-up, release, flight, net dropping, wrapped (5 frames) |
| `anim_fx_spiders.png` | **2. spiders** — today's drawHitFX swarm (ported 1:1) above the new modelled spider (4 gait frames), crawling in and climbing |
| `anim_fx_bounty.png` | **2. Fortuna's Bounty** — an offering token (elix2 round) thrown from a seat, tumbling, landing flat on a tile with dust + glints (5 frames) |
| `spec_compare_z1.webp`, `spec_compare_z2.webp` | **3. spectators** — today's 193 sculpted crowd (top) vs rig92 spectators on the same seats (bottom), real zoom |
| `spec_detail_z1.png`, `spec_detail_z2.png` | one stand section enlarged (×3 / ×2) side by side |
| `spec_sheet_one_look.png` | one spectator look: 5 poses (sit, sit-cheer, sit-fist, stand, stand-cheer) × 8 facings |
| `anim_glad_main_sheet.webp`, `anim_glad_fall_sheet.webp`, `anim_ret_sheet.webp`, `anim_spider_sheet.webp` | the real game-format sheets (8 facings), for the size numbers |
| `anim_shot.js`, `anim_rig.html/.js`, `anim_comp.js`, `anim_make.js`, `anim_webp.py` | how it was made: `node tools/plans/look100/anim_shot.js` (board shots + `anim_board.json`), then `node tools/plans/look100/anim_make.js` (render ≈ 11 min, then compositing). `anim_make.js comp` re-composites from the sheets kept in the scratch dir (`LOOK_SCRATCH`) |

## Which of his notes each row covers

| strip row | frames | his note |
|---|---|---|
| Idle — breathing, weight shift | 4 | n19 breathing / weight shifts while idle |
| Walk | 6 | animated tokens: walk |
| Attack — wind, raise, slash, thrust, recover | 5 | animated tokens: attack · n19 attack |
| Block — shield up, brace | 3 | n19 block |
| Hit / recoil | 3 | animated tokens: hit · n19 injured |
| Injured limp (sword dragging) | 4 | n19 injured |
| Scared cower / peek | 3 | n19 scared |
| Push — set, contact, drive, follow | 4 | n19 push |
| Topple a pillar — set, shoulder, heave, stumble | 4 | n19 pillars (toppling; the column itself stays the game's doTopple drawing) |
| Knock a pot — wind, swipe up, follow | 3 | n19 knocking pots |
| Fall / die — struck, buckle, slump, tip, lying | 5 | animated tokens: die |
| Severed forearm — hit, stump + clutch, stagger | 3 | n19 limbs (severed) — forearm bone scaled away, wound cap at the elbow, weapon goes with it |
| effects: rete | 5 | Rete throw-and-wrap (new) |
| effects: spiders | 4 | Spiders redrawn (today's read as bats) |
| effects: Fortuna's Bounty | 5 | offerings thrown from the stands onto the tiles |

Total per gladiator: **47 frames** (39 + 8 fall/sever) → **376 cells** with 8 facings.

## Sizes (WebP q 0.8 unless said) and render time

Render = headless Chromium, SwiftShader CPU WebGL (the rig92 setup), 2× supersampled; body build 3.4 s.

| sheet | frames × facings | cell | WebP | 4 facings | render |
|---|---|---|---|---|---|
| murmillo main | 39 × 8 | 124×143 | **697 KB** (586 KB at q 0.65) | 356 KB | 198 s (5.1 s a frame) |
| murmillo fall + sever | 8 × 8 | 146×144 | 136 KB | 69 KB | 47 s |
| retiarius (idle, rete ×3, hit ×3) | 7 × 8 | 116×154 | 130 KB | — | 33 s |
| spider | 4 × 8 | 94×72 | **34 KB** | — | 0.8 s |
| spectator, one look | 5 × 8 | 56×133 | 66 KB | — | ≈ 41 s a look (8 looks 328 s; mostly rebuilding the tunic/toga shells) |

- ≈ 2.2 KB a cell. **The ≤150 KB budget fits ≈ 68 cells: 8–9 frames × 8 facings, or 17 frames × 4 facings.** The full
  47-frame set is ≈ 830 KB per look — 5.5× over.
- The lying frame (fall 5) is wider than everything else; keeping fall/sever on their own sheet saves ~15% on the main sheet.
- Cache key = look + gear + pose-set hash; a Studio character needs ~4 min of rendering on this CPU renderer (a real GPU
  is far faster — not measured here).
- Off path (as asked): Animations Off / Reduce motion / Fast / sims draw the still cell (idle 0) — same drawImage.

## What the pictures show (for the decision)

- Tokens: the rig92 body animates well at board size; poses read at ×2 zoom, still readable at fit. Facing 3 (away) is
  less readable for attacks — most actions read best in the four front-ish facings.
- Clip: the base glides, legs step; at 110 ms a frame (≈ 9 fps) the walk looks like a mini being moved by hand, which
  suits the board-game look.
- Rete/Bounty are 2D paint over the sprites (cheap, no extra sheets); the spider is a 34 KB modelled sheet.
- Spectators: at board-fit zoom the rig92 figures are thinner and fainter than today's chunky sculpted crowd (the
  sash/head-ring silhouettes read better at 26 px). At ×2 they look like real people in tunics/togas. Seated legs
  need a bench edge to sit on (they float a little).

## Open questions (multiple choice)

1. Frames per gladiator (budget ≤150 KB a sheet):
   a) core set only — idle 2, walk 4, attack 3, hit 2, fall 3 (14 frames × 8 ≈ 250 KB, or × 4 facings ≈ 125 KB) ·
   b) two sheets loaded on demand: "move" (idle/walk/hit ≈ 150 KB) + "act" (the rest, only when used) ·
   c) the full 47 frames, accept ≈ 830 KB per look · d) 5 rendered facings + mirroring for the other 3 (weapon hand flips).
2. Printed classes (today his TTS minis): a) keep the minis still, animate only Studio/online rig92 tokens ·
   b) rig92 stand-ins of the 8 printed classes for animation · c) animate the minis with 2D tricks only (bob, lean, squash).
3. Spectators: a) keep today's sculpted crowd · b) rig92 crowd only when zoomed in (≥ ×1.5), today's at fit ·
   c) rig92 everywhere (≈ 66 KB a look; 6–8 looks recoloured at runtime).
4. Spiders: a) the modelled spider (this test) · b) a flat painted spider in the printed token's style · c) both: modelled
   on the board, token in panels.
5. Rete: a) 2D net painted over the sprites (this test) · b) a modelled net rendered per facing.
6. Frame rate: a) ~9 fps stepped (this clip) · b) 12–15 fps (more frames, bigger sheets) · c) stepped poses + smooth glide in between.

---

# Round 2 (his answers: full frame set, 3D class stand-ins, 3D crowd everywhere, modelled spider, 2D rete, stepped poses + glide, forum walkers)

## New files
| file | what |
|---|---|
| `anim_clip2_walk_attack.webp` | clip v2: 57 frames × 40 ms (2.3 s loop, 232 KB). Pose steps every 120 ms, position glides every frame (ease in/out over the two tiles, small lunge on the thrust). Token drawn at the game's 3D-token size (T99B.t93k 0.88 × 0.8 tile → base = **0.70 tile**), path kept off the edge row (no base on the railing) |
| `anim_clip2_still.png` | one clip frame with both tiles dashed: the bases sit inside their tiles |
| `anim_classes_lineup.png` | the 8 printed classes as rig92 stand-ins (approximate loadouts from CLASSES + the 103/106/123 edits), 8 frames × facings 1 and 3, dashed tile under each base |
| `spec2_compare_z1.webp`, `spec2_compare_z2.webp`, `spec2_detail_z1.png`, `spec2_detail_z2.png` | crowd v2: a red-wood bench under every sitter, the darker painted tone (brightness .8, contrast 1.14, saturation .88), +20% size, **6 rendered looks × 12 tunic colours** recoloured at draw time (grey-keyed cloth) |
| `spec_forum_compare.webp`, `spec_forum_detail.png` | the Roma forum (172-v89city): today's figures vs the same rig92 people (townsfolk = crowd looks walking/standing, guards + gladiators = class stand-ins) |
| `spec_forum_shot.js`, `anim_make2.js`, `anim_comp2.js`, `anim_time2.js` | how (render ≈ 10 min, comp ≈ 1 min) |

## Size: who wins
The other agent's round 2 landed while this ran (look100_r2_board.png): figure ×1.15 on the same 25.4 mm base, drawn with the minis'
rule (base 0.8 tile), pillars/pots/chest ×1.15. This round was rendered before that: figure ×1.0, base 0.70 tile (the game's 0.88 rule). To match:
re-render the sheets with createToken({scale:1.15}) and draw at 0.8 tile (clip scale ÷0.88) — one comp + render pass (~10 min here).
This round uses the game's current 3D-token size (0.88 × 0.8 tile base = 0.70 tile, which just fits the tile's inscribed circle 0.707).
A +15% figure on the same 0.70 base still fits the tile; a +15% base (0.81 tile) would overhang the tile diamond slightly.

## Memory per look (decoded RGBA = cells × w × h × 4)
| | 8 facings | 5 facings + mirror (×5/8) |
|---|---|---|
| gladiator, full 47 frames (main 312 cells 124×143 + fall 64 cells 146×144) | **26.2 MiB** | **16.4 MiB** |
| same, sheets rendered at the drawn size (×0.92 at zoom 2) | ≈ 22 MiB | ≈ 14 MiB |
| spectator look, 9 poses (66×133) | 2.4 MiB | 1.5 MiB |
- 4 gladiators on the table = ≈ 105 MiB (8 facings) / 66 MiB (5+mirror) — too much for phones; tolerable on desktop. Levers: decode
  per action on demand (idle+walk ≈ 5.4 MiB always, the rest when used), render at the drawn size, trim cells per row.
- Mirroring swaps the weapon hand (the shield/sword side flips) — visible on every class with a shield.
- WebP on disk: full gladiator 659 + 128 KB (431 + 80 KB at half resolution); class stand-in 8 frames × 2 facings 36 KB; spectator look 101 KB (74 KB half).

## Render time per look (full 47 frames × 8 = 376 cells)
- Measured here (headless Chromium, SwiftShader CPU WebGL, 614k triangles a cell incl. outlines, 488² px at 2× supersample):
  raster **523 ms a cell** (gl.finish-forced), full readback 1.6 ms, 2D downscale + crop scan 4.5 ms → ≈ 200 s + body build 3.4 s
  (first run measured 245 s for the full set). The page's own JS is ~6 ms a cell; everything else is the software rasteriser.
- Estimate on real GPUs (basis: the per-cell JS measured here + raster throughput assumptions, NOT measured): laptop iGPU at a few
  hundred M triangles/s → raster ≈ 2–5 ms a cell → **≈ 3–4 s of rendering + ≈ 3 s body build ≈ 6–8 s a look**; mid phone GPU
  ≈ 10–20 ms a cell + ≈ 8–10 s body build (JS ~3× slower) → **≈ 15–20 s a look**. 5 facings + mirror cuts the render part by 3/8.
- Class stand-ins (8 frames × 2 facings): 87 s for all 8 here. Spectators: 56–91 s a look here (6 looks 462 s), most of it rebuilding the cloth shells.

## Known limits of round 2
- Crowd benches are small blocks turned with the sitter; in the game the tier itself should be the bench (sit the pelvis on the tier edge).
- Forum figures are drawn over the stalls (no occlusion in this paste-up) and stand ~20% taller than today's townsfolk.
- Class stand-ins in the forum use facings 1/3 only, mirrored for the others (weapon hand flips).
