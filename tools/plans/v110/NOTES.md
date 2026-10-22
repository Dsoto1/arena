# v1.10 — Arena Foundation (roadmap tools/plans/ROADMAP.md "v1.10") · his answers 2026-10-22: 1a 2a 3a 4a 5a 6a go
1a split: v1.10 = Auto quality + the Safari fixes · v1.10a = cache invalidation design (docs/render-caches.md proposal) + perf/memory
   budgets · wrapper consolidation afterwards in small batches.
2a Auto may change: board render scale/DPR, 1×/2× figure sheets, shadow + lighting detail, crowd/secondary animation (not effects).
3a Settings: a new "Quality: Auto / High / Medium / Low" first; Lighting (Full/Light/Off) stays as an advanced choice under it.
   REPLACES: Lighting as the first/only quality choice (v1.06); 406 W1's own Safari drop rule and 410's deviceMemory gate become inputs of Auto.
4a Safari 2× sheets: Auto decides; Safari starts at 1× until runtime evidence says the device keeps up.
5a Safari shadows missing after load (known-issues 2026-10-21): fix blind — 399 l106Build allocates a fresh layer canvas per build
   (kill switch), no repro needed.
6a phones at DPR 3: Auto caps the board at 2× when zoomed.
Queued inputs (known-issues/BASELINE): createImageBitmap(canvas) ≈16 ms on Safari (412 copies); Safari z1 ≈45 ms raster frames;
phone@3 zoomed js 23–27 ms vs 3.5–5 at @2; 2× sheets ≈711 MB decoded.
Build follow-up questions 2026-10-22, his 1a 2a 3a 4a go: (1a) on desktops Auto stops at Medium (Low only when picked) · (2a) phones with
DPR ≥3 capped at 2× ALWAYS (REPLACES 6a's "only when zoomed") · (3a) lite84 "Light board for older phones" folded into Low (REPLACES the
separate setting) · (4a) Quality stays the first card of Board & pieces.

## His beta notes 2026-10-22 (with a Chariot Racing screenshot)
- Safari 20–40 fps (60 when quiet) vs Chrome ~120 → asked: WebGL board renderer spike (Q1–Q3 open).
- FIX: Chariot Racing — the gladiators/tokens on the chariots still use the old pieces (not the v1.07 3D stills).
- FIX: bottom (front) stands — bench planks show through the seated spectators.
- 🆕 "try and get some free assets to clean this arena up" (he added domains + keys to the cloud env). Reachable CC0 sources checked:
  Poly Haven (api + dl), ambientCG, Kenney, Quaternius, Freesound. Not reachable: OpenGameArt, Sketchfab, Pixabay, Pexels, Unsplash,
  Wikimedia. New env keys are not visible in this running session (needs a new session).
2026-10-22 his 1a 2a 3a (+ 2 Safari recordings, tools/plans/v110/perf/): v1.10 shipped; WebGL spike next. Recordings: Auto stayed High
(webkit start, DPR 1.5, 1× sheets): Lighting Full 31 fps p95 92 ms — cells/clean ≈73 ms/s + device sheet baking in the match (311 grab/halve/
alphaBox/shadowRow: 336 getImageData ≈740 ms/10 s); Lighting Off 53 fps p95 40. Auto did not step (late share under 60%). Q4–Q7 (assets) open.
2026-10-22 his 4a 5a 6 7a: (4a) clean up floor, walls and benches with real stone/sand/brick/wood textures, painted over to keep the
illustrated look · (5a) before/after mock-up page first, he picks, then a beta · (6) CC-BY is fine too — credits go in a new tab on the
Credits page · (7a) v1.10a = F1 chariot pieces + F2 front-stand benches + the art clean-up; WebGL (v1.11) after.
2026-10-22 his clarification of 4: the clean-up means fleshing out the EMPTY SPACES BEHIND AND UNDER THE STANDS — real structure and depth
(substructure arches, outer façade, stairs, ground around the base) — not retexturing floor/walls/benches. REPLACES this morning's 4a scope.
2026-10-22 his concept image (tools/plans/v110/ref/arena-concept.jpg, not committed — images under tools/plans are gitignored; copy kept in the
scratchpad): a full amphitheatre around the board — multi-level travertine arcades on all sides, upper seating tiers with crowd, red banners
with gold eagles, torches/braziers everywhere, Flavius's box with two guards and braziers, a central stair at the front flanked by lions,
storage bays under the stands (crates, barrels, weapon racks, cages), corner towers with lion heads; warm torchlit palette. He crossed out
the seated people in the low front corners (ignore those). "This is what I was imagining." → REPLACES mock-up options A/B/C (Q8–Q10).
2026-10-22 his 11a 12a 13a 14a 15a + "fewer torches and lights — tasteful; borrow heavily but don't overdo it; compare the render to the
image after each pass and try again (max 5)": the Amphitheatre = an offline three.js bake at the board's exact camera (code-built
architecture + CC0 props/textures), day + night layers drawn around the board; inner live spectators stay, upper tiers baked crowd; one
design recoloured per arena; own release after v1.10a with a first render for his ok; before the WebGL decision.
