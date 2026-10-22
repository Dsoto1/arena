# arena110 — substructure mock-up textures (v1.10a, tools/plans/v110/ART.md)

All four textures come from Poly Haven and are **CC0** (public domain, no attribution required). They are listed for the planned
Credits tab anyway. Each source is the 1k diffuse JPG (`https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/<id>/<id>_diff_1k.jpg`).
They were reworked by `prep.py` in this folder (`SP=<dir with assets-polyhaven/> python3 -I prep.py <out>`). Every filter is wrap-aware,
so the results still tile.

| File | Used for | Source (name · author · licence · URL) | What was changed |
|---|---|---|---|
| `stone_ashlar.webp` (512², 32 KB) | substructure + façade faces | Sandstone Blocks 08 · Rob Tuytel · CC0 · https://polyhaven.com/a/sandstone_blocks_08 | tiled 2×2 → 512 px (8 courses of 64 px, today's Roma course height); median 5 + blur 0.8 ("painted over"); big stains removed (high-pass); posterised to 6 steps; gradient-mapped to the Roma travertine palette |
| `vault_brick.webp` (512², 75 KB) | brick lining inside the arches (drawn darkened) | Medieval Red Brick · Rob Tuytel · CC0 · https://polyhaven.com/a/medieval_red_brick | 1k → 512 px (~26 courses); median 3; high-pass; posterised to 7 steps; gradient-mapped to Roman brick red with cream mortar |
| `ground_paving.webp` (512², 40 KB) | plaza around the base (options B, C) | Stone Pavers · Amal Kumar · CC0 · https://polyhaven.com/a/stone_pavers | 1k → 512 px; median 5 + blur; high-pass; posterised to 6 steps; warm grey-brown map (darker than the arena stone so the building reads above it) |
| `ground_sand.webp` (512², 56 KB) | sand ground (option A) | Gravelly Sand · Dario Barresi · CC0 · https://polyhaven.com/a/gravelly_sand | 1k → 512 px; median 3; high-pass; posterised to 6 steps; sand palette |

Looked at and not used (all CC0, Poly Haven unless noted): sand_02, sand_03, dense_sand, sandstone_cracks, large_sandstone_blocks(_01),
red_brick_03, large_red_bricks, castle_brick_02_red, white_sandstone_bricks, weathered_planks, old_planks_02, wood_planks_grey,
brown_planks_07, raw_plank_wall, worn_planks, rectangular_paving, large_square_pattern_01; ambientCG Travertine009 (CC0). These were from the
first brief (floor/wall/bench textures), which was dropped when the scope changed to the substructure. No Kenney or Quaternius props
were needed; the arches, gates, stairs and velarium are painted procedurally.
