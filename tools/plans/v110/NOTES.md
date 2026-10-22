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
