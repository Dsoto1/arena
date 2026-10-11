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
