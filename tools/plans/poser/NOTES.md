# 3D character poser + equipment rendering overhaul — his brief (2026-10-17), not yet scheduled
His brief: tools/plans/poser/BRIEF.md (verbatim, complete).

## What exists (for the brief's §1 audit)
- rig92 (tools/art/rig92 → assets/three93.js + tok93.js, three.js loaded on demand) = the body, gear and poser. Printed classes: sheets baked at
  build time (tools/art/anim100/make.js, 8 facings, move/act sheets, cells ≈ 70×104 px at pxmm 2.6 → a face is ~8–10 px on the board).
  Studio/Online characters: baked on the device (222 tok93, ANIM100_LIB in 311), ~35–45 KB per sheet, pose JSON ≤ 600 B.
- No portrait → 3D step: the token's look comes from the character's look fields (skin, hair, hairstyle, beard, gladiatrix, colour);
  painted portraits/faces are separate 2D art (263/268 faces). The poser has 24 presets in 4 groups, a joints tab, feet IK, grips (336, v1.02).
- v1.06a (decided) re-bakes every sheet with the sun/fill/rim lights + baked shadow sheets.

## My pushback / suggestions (sent to him 2026-10-17)
1. Visible size decides the value: on the board a figure is ~85 px tall. Silhouette, stance, grip, armor fit and weapon/shield read there;
   face anatomy, rivets, buckles, muscle groups mostly do not. Face + fine detail only pay off in close-ups (the poser, character cards,
   maybe a new close-up view) — decide where those exist first.
2. "Preserve portrait identity": the pipeline has no portrait input. Be honest: improve the look parameters (face shape, age, scars, brow,
   nose) and their mapping, or add a portrait-matching step as its own project.
3. Body types (lean/athletic/muscular/stocky/heavy) need a new look field (Studio + save migration + online tokens + re-bake).
4. Pose library: 24 presets + the printed classes' animation sheets exist — AUDIT and fix (balance, weight shift, joint limits, grip) instead of
   adding; every pose change re-bakes the animation sheets too.
5. Order vs v1.06: lighting doesn't depend on geometry, so keep v1.06 as decided; this overhaul later = one more automated re-bake.
6. Split into releases: A grip/fit/framing fixes (cheap, visible on the board) → B pose audit + combat mechanics → C anatomy + body types →
   D face + close-up view → E armor detail + materials.
7. Measurable checks instead of adjectives: automated (in node with the rig) hand-to-grip distance, armor/body penetration (raycasts),
   feet on the ground, framing (no cropped crest/weapon tip) for every class × weapon × pose; a contact sheet per release for his eye;
   budgets: sheet size ≤ 60 KB, device bake time per character ≤ X s on a phone (measure today first).

## His answers (2026-10-17): p1a p2a p3a p4a p5a p6a
- P1a a close-up view (character card / after a victory) so face + fine detail are seen; the board shows silhouette, stance, grip, fit.
- P2a body types as a new look option (lean, athletic, muscular, stocky, heavy); each printed class a fixed one (Studio field + SAVE_MIGRATIONS
  + online tokens + re-bake).
- P3a more face parameters (face shape, age, brow, nose, scars) mapped well; portrait → 3D matching out of scope.
- P4a order: 1 grip + armor fit + framing → 2 pose audit + combat body mechanics → 3 anatomy + body types → 4 face + close-up view →
  5 armor detail + materials (REPLACES the brief's §11 order anatomy-first).
- P5a each step its own small release + beta, after v1.06 (lighting) and v1.07 (Winter Quarters).
- P6a each release opens with ONE class before/after + the automated check numbers (hand↔grip, armor/body penetration, feet on ground,
  framing) + a contact sheet; his ok → bake all (REPLACES the brief's "no mock-ups"; the checkpoint is real output, not a design doc).
