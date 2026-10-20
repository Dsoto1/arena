# v1.08b — one figure re-bake: metal material + sharper sheets (after v1.08a sounds)
Origin: his 7a on the v1.08 mock-up (metal = sheet re-bake, not a runtime pass) + his beta note 2026-10-20 "the resolution of the 3d models is
still fuzzy" (his screenshot was Safari). Cause: sheets baked ≈70×104 px a cell (pxmm 2.6); a figure ≈85 css px tall needs ≈170 device px on
Retina → ×1.8 upscale at normal zoom, ×3.5 zoomed; on Safari the board itself runs at 1× (406 W1 auto-drop).
His answers 2026-10-20: 1b (Safari) · 2a sheets 2× for laptops/desktops, 1× kept for phones (≈ +35 MB of sheets, fetched on big screens
only) · 3a the download carries the 1× sheets only · 4b Safari board: try 1.5× after v1.08b and measure on his Mac (answers the open 406
sharpness a/b/c: REPLACES "shipped with a" = cap 1.5 → 1 when slow) · 5a order kept: v1.08 → v1.08a → v1.08b.
R4: a re-bake ships alone — v1.08b is only the re-bake (+ its loader for 2×/1× and the metal material), nothing else.
Plan: bake both sizes in tools/art/anim100/make.js (2× = pxmm 5.2), loader picks 2× when (screen ≥ ~900 px wide and not phone) and memory
allows, falls back to 1×; budgets: decode time per sheet off-thread (401), memory, draw cost tv91r/tv92p; then the Safari 1.5× trial.
