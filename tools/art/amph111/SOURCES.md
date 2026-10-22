# amph111 — sources of the amphitheatre bake (v1.11 art, tools/plans/v111/AMPH.md)

**Nothing new was downloaded for this bake.** Every shape is built in code (scene.js, props.js: arches, piers, vaults, rows, stairs,
cornices, towers, Flavius's box, crates, barrels, rack, cage, gates, braziers, banners, lions, guards, the seated crowd) and rendered
with the game's own three.js build. Props from Kenney / Quaternius and Poly Haven models were considered and not used: at the bake's size
(a barrel is ~20 px on a 1440 desktop) primitive shapes in the game's flat colours read better than scanned or low-poly models, and they
need no licence bookkeeping. Poly Haven's model list was checked (lion_head, marble_bust_01, wooden_crate_01, Barrel_01, wine_barrel_01,
kite_shield — all CC0) — none used.

| Used for | File | Source · author · licence | Changes |
|---|---|---|---|
| renderer | assets/three93.js | three.js r169 · three.js authors · MIT (already shipped with the game) | none |
| stone (all architecture, lions) | assets/stone100_6_roma.webp | the game's own Roma travertine (v1.0, 277-v100arena) | converted to luminance in the bake page (base 231, texture contrast ×0.8) and tinted per arena in the game |
| bench slabs | assets/stone100_6_roma.webp | as above | luminance, contrast ×0.3 (a near-flat seat), tinted with the arena's bench colour |
| crates, barrels | assets/stands_wood81.webp | the game's own bench wood (v0.81) | tinted #c79a66 |
| vault + bay linings | tools/art/arena110/vault_brick.webp | Poly Haven "Medieval Red Brick" · Rob Tuytel · **CC0** · https://polyhaven.com/a/medieval_red_brick (prepared in v1.10a, see tools/art/arena110/SOURCES.md) | darkened #8c7a70 |
| ground / plaza | tools/art/arena110/ground_paving.webp | Poly Haven "Stone Pavers" · Amal Kumar · **CC0** · https://polyhaven.com/a/stone_pavers (prepared in v1.10a) | darkened #6f665a, slabs ×1.5 larger |
| the eagle on the banners | drawn in code (amph111.html eagleCanvas) | — | gold eagle with spread wings in a laurel ring |

Outputs: assets/amph111_{stone,bench,cloth,fixed,fire,glow}.webp + assets/amph111.json (the frame), written by make.js --assets (enc.py).
