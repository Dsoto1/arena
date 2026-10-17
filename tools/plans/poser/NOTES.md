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

## His anatomy reference (2026-10-17): "athletic build"
A three-view sculpt sheet (¾ front, front, back; grey briefs, neutral A-ish stance). Third-party art from the web → NOT committed (only these
measurements, taken from the front view; keep his original if a builder needs to look again):
- ≈ 7.9 heads tall (heroic; a real adult ≈ 7–7.5); legs (crotch → sole) ≈ 48% of the height.
- Shoulders (deltoid to deltoid) ≈ 2.5 head heights wide; waist ≈ 1.3; hips ≈ 1.35 → a strong V-taper.
- Reads from the forms, not lines: pecs over the rib cage, deltoids capping the shoulders, serratus + obliques, a defined 8-pack, large
  traps/lats in the back, teardrop vastus medialis, long calves; forearms full, wrists/ankles slim; hands open, feet planted with arches.
- Skin: matte, warm, tonal shift (cooler/pinker lower legs); muscle separation from shading only — no outlines. Matches his brief §2.
My notes: this is the top of the range (closer to "muscular" than "athletic" by the brief's own "avoid superhero anatomy"). Proposal for P2a:
use it as the MUSCULAR type; ATHLETIC = same skeleton at ~7.5 heads, shoulders ≈ 2.2, softer separation; historical gladiators (hordearii,
"barley men") often carried a fat layer → STOCKY/HEAVY types matter for the Roman look. Ask him when release 3 (anatomy) starts.

## His follow-up (2026-10-17)
- Body types: he likes the variations (muscular = the reference; athletic softer; lean; stocky + heavy for the hordearii look). The reference is
  "the extreme".
- His priority order: 1 base human model (proportions, joints, muscle groups, hands, head) → 2 fighter-quality poses ("ten excellent poses beat
  fifty random ones", equipment-aware: feet, hips, torso, shoulders, weapon tell one story) → 3 armor + weapon integration (fit, joints, grips;
  fixing clipping beats decoration) → 4 facial identity + materials → 5 final render polish (key/fill, contact shadows, AO, roughness, framing,
  export). Compare the SAME character / pose / armor / weapon before and after each stage. Inspect before rebuilding anything.
- His technical table, answered from the code (tools/art/rig92): the body is PROCEDURAL — ~150 anatomical primitives (muscle ellipsoids, round
  cones, smooth unions, subtracted eye sockets/mouth/ears/navel) → a field on a 4 mm grid → surface nets → ONE skinned mesh on a skeleton
  (rig.js, two-bone IK for arms/feet). Armor = shells LIFTED OFF THE SKIN with the same skin weights (gear.js shellFrom, masked per equip point)
  + rigid helmets/shields/weapons; grips via hold.js. No portrait input. Materials today: TOON shading + INK OUTLINE (body.js).
  → rows that apply: "procedurally generated body" (better primitives, smooth transitions, proportion parameters = body types) and "mostly
  procedural armor/weapons" (profiles, bevels, attachment rules). Because the shells follow the skin, a better body improves armor fit by itself
  → his body-first order is right (it REPLACES p4a's fit-first order, pending his confirm).
- Limits found: a 4 mm grid can't hold eyelids/nostrils/lips → the close-up view needs a finer sculpt (≈ 2 mm, only for close-ups);
  the toon + ink look vs the reference's soft matte shading is an art-direction call.
