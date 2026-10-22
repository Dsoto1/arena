# v1.10a ART — the arena's substructure (mock-up, nothing shipped)

His ask (NOTES 2026-10-22, 4a 5a 6 7a, then clarified through the lead): fill the **empty space behind and under the stands** so the
arena has structure and depth. Today the stands float: there is beige void under the two near edges and the corner stairs, and open
sky behind the far stands. Floor, walls and benches stay as they are.

Mock-up page (self-contained, 4.8 MB): `/tmp/claude-0/-home-user-arena/cc1b704a-5035-5a46-beb6-a9feaecd4df4/scratchpad/arena110-mockup.html`
(in the scratchpad, not in git). It has a drag compare against today, day / night / zoomed / phone for every option, close-ups and the
cost table. Scene: tools/bench/board.js SCENE (Roma, Democritus, 8 gladiators + beasts, highlights, Lighting Full) with spectators on.
Shot at desktop 1440 × 900 @2× and phone 390 @2×. The injected page script (throw-away, NOT a module) is in the scratchpad
(`mock110/override.js`, `shot.js`).

## Options

| | What | Textures (CC0, tools/art/arena110) |
|---|---|---|
| **A · Light** | **Ground plane** Hs = 1.5 TW below the stands' top, fading into the haze toward the top of the screen, with the building's shadow (sun upper left). **Arcaded substructure** under the near edges: an ashlar face down to the ground, one arch per tile, brick-lined vaults, impost band, plinth. The sky stays open. | ground_sand, stone_ashlar, vault_brick |
| **B · Medium** | A + a **paved plaza** + the **outer façade** behind the far stands. We see its inner face: two arcades with engaged pilasters, an attic with small windows, a cornice and end piers where it stops (the near walls' cut-away rule). Aerial haze keeps it in the background. | ground_paving, stone_ashlar, vault_brick |
| **C · Full** | B + a **vomitorium gate** mid-side (near and far) + **stairs** from the corner flights down to the ground + the **velarium** (masts on the façade top, sagging cream/red awning strips, ropes). | same |

**Readability:** everything sits in 192's `under` layer, under the benches, the sand, highlights and pieces. The highlight-contrast
read-back (board.js CONTRAST) is identical to today for A, B and C, day and night (1.332/1.141 day, 1.146/1.050 night, desk).

**What looked worse:**
- B and C cover most of the sky. The sun stays, but the clouds and the "open air" go.
- The façade's top runs off the canvas at the top corner behind Flavius's box.
- C's red awning strips echo the red benches and make the top edge busy.
- C's corner stairs fall off-canvas on a 1440 desktop at normal zoom (seen only when zoomed out or on some aspect ratios).
- At night the ground is a large grey-blue area. It is fine, but it is the biggest new surface on screen.
- At the left and right screen edges the ground's haze fade makes a soft band.

## Where it plugs in

- **192-v91arena `ar91Under(g)`** paints the `under` layer: the first cached layer of 219's `stands` (20), drawn before the benches, the
  `deco` layer and the crowd (16-crowd / 193 / 283 / 313). The mock wraps it and paints the substructure first, so the foundation,
  corner stairs, benches and spectators lie on top. The geometry reuses 192's outline (`pt`, `lo/hi = ∓2.95 − ar91Ex()`, the cut near
  corner), so it follows 4-tier grand arenas and turned boards (ROT89: faces are chosen by screen normal, far edges by screen y).
- **Build plan:** a new module `NN-v110sub.js` that gives the substructure **its own cached sub-layer**, `sub`, registered under
  `stands` in 219's LAYERS93 defs and blitted first inside 192's `drawStands` wrapper. Its key is canvas size, dpr, TW, OX/OY, turn, N,
  tiers, night and the stone. Without its own layer, every re-bake of `under` also repaints it (see cost). 330-v101zoom2's
  padded reference-frame bake needs the same name→paint entry (`name==='sub'`).
- **Stone per arena:** the build should paint the faces with **`ar91Fill(g,scale)`**, the arena's own A100 stone family (277), not a
  fixed ashlar. Then Pompeii, Capua, Leptis and the rest match their walls for free, and `stone_ashlar.webp` is needed only if he prefers
  one stone everywhere. `vault_brick` and the ground textures are new assets (≈ 170 KB in all, loaded through `ar91Img`).
- **Night:** 189's grade runs after the layers, so the substructure darkens with everything else; nothing extra is needed. 409's torch
  pools/AO do not reach it. A follow-up could add a few torches in the arches.
- **Ludus** (pen / exhibitions) and **Naumachia:** skipped. **Light board (lite84) / Lighting Off:** plain fills, no brick in the vaults,
  no velarium.
- Kill switch `flavius_sub110off=1`. No rules, no `rand()`, nothing in S, saves or the online hash, and no text (no i18n).

## Draw cost (VISUAL POLISH RULE)

- **Per frame: 0.** The `under` layer is blitted every frame already, so the cached frame is unchanged.
- **Per re-bake** (resize, zoom step, turn, day/night, image load). Desk 1×, median of 9, on a shared 4-core box under load ≈ 14 with
  software rendering, so treat these as relative:

  | | Extra JS inside the bake | Whole re-bake frame |
  |---|---|---|
  | Today | n/a | ≈ 70 ms |
  | A | 0.7 ms | ≈ 88 ms |
  | B | 1.9 ms | ≈ 118 ms |
  | C | 3.5 ms | ≈ 176 ms |

  The extra rasterising of large textured faces is what costs. The separate `sub` layer above removes it from every re-bake except its own
  key changes. Phones should bake it at half resolution (soft background, no loss).
- Tests to keep green: tv91r (clarity + draw cost), tv92p, tv93l (layer order, orderErr 0), tv100r (277 kill switch pixel-identical
  needs the new kill switch too), tv66/tv88 (390 px), tv108l (night), tv86/tv87l (no text, should stay clean). New: tv110s (sub layer
  cached: hits on a steady frame, re-bake only on key change; kill switch = today's pixels).

## Estimated work

- A: ½ day (module, sub-layer, kill switch, test).
- B: +1 day (façade, pilasters, end piers, haze; checking the top corner behind Flavius on all 12 arenas + grand 4-tier).
- C: +1 day (gates, stairs to the ground, velarium; the stairs need care on turned boards).
- Per-arena stone through ar91Fill: included. Credits tab entries (CC0, optional): ¼ day.

## My pick

**B, plus C's middle vomitorium gates.** B gives the amphitheatre its body: arches under the near stands, a façade behind the far ones,
and ground to stand on. The haze keeps it behind the play. The gates are cheap and make the stairways go somewhere. The **velarium**
should be skipped, or kept for the grand arenas only (Roma, Capua, invitationals, finals) as a "big day" cue. Its red strips compete with
the benches. The corner stairs to the ground can wait until he plays zoomed out.
