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
