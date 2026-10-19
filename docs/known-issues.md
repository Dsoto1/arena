# Known issues — what is still open (his E1a, 2026-10-17)

One list of problems not yet fixed, accepted limitations, flaky tests and items waiting on Virgilante. Each line: date · where · status.
Keep it current every release: a fixed item moves to docs/history.md with the release; a new report lands here the day it is seen.
Planned FEATURES are not here (tools/plans/vX.YY/NOTES.md, tools/plans/backlog.md); his decisions are in docs/decisions.md.

## Game — open
- 2026-10-17 · a beast drawn as a flat dark silhouette on a grey disc (beta 2 screenshot) · FIXED for v1.06 beta 2 (398): Moechus's near-black
  fur (#5c5856) re-rendered grey; the grey disc is the Lighting Off shadow disc · moves to history with v1.06.
- 2026-10-18 · bases off: a beige base top under the figure when zoomed / on a 2× screen · FIXED for v1.06 beta 2 (321 bs101Off margins scale
  with the cell, base colours from a ring of probes; test tv106h, every class at zoom 1/1.4/2 × DPR 1/2) · moves to history with v1.06.
- 2026-10-18 · tools/art/anim100b/make.js l106 run today bakes DIFFERENT beast shadow sheets than the committed v1.06a ones (moechus/valencia:
  cell 56×18, anchor y 47 vs 58×28, y 11 — the shadow sits above its anchor); the lit sheets come out byte-identical. Check l106.js's shadow
  crop before any beast re-bake (398 kept the committed shadow sheets).
- 2026-10-17 · 3D minis, beasts and crowd look soft/blurry (not drawn at devicePixelRatio) · v1.06 (E6a).

## Game — accepted limitations
- 2026-10-17 · Recruiting (B72, 378): after an action the options panel stays put; its bottom edge can end a few px below the view when a
  result line grows it. Keeping the foot visible costs a second scroll (the jitter he reported).
- 2026-10-17 · Rivalry Week (383): a house with fewer than 2 fighters who can actually be entered loses 8 fame and the editor seats free
  agents (the printed forfeit rule); before beta 3 the injury sweep swapped in a free agent without the fame loss.
- 2026-10-17 · balance numbers in tools/plans/balance100/REPORT.md predate v1.02–v1.05 (wages, recruiting costs, kit repair, loans, travel) ·
  re-measured with docs/economy.md after v1.05 ships (his E2a).

## Tests + tooling
- 2026-10-18 · tv85f "Face → ad bestias runs to the end": under CPU throttle 4 the rival case once ended "bribed" instead of "face" (1 of 10) · timing; watch in CI.
- 2026-10-18 · tv101z (pre-baked board vs old paint) now runs with Lighting Off: with Full the shadow layer adds ~9.5k px of ≤24-level anti-alias differences between the two paths (none >24) · not a visual bug; revisit if the pre-bake ever draws shadows itself.
- tv93a (contrast + a11y): one local run in 8 failed "focus did not return to btnRules" — likely Escape vs the 40 ms close debounce in the
  a11y93 focus return under load; not proven, not changed · watch in CI.
- tv104d / tv92t (2026-10-19): made deterministic — tv104d holds Math.random off over its week ends (worn-down injury, Mors Omnibus) and pads
  rival barracks; tv92t waits for the tab-ownership message instead of a fixed 400 ms · watch in CI.
- Playwright "Execution context was destroyed" with no navigation = Chromium collected the awaited promise during a heavy sync step
  (tv102e, fixed by deferring t93Open). Other tests that await a long sync WebGL step inside page.evaluate can hit the same · fix the same
  way when one shows up.
- tools/testslot.sh (the 2-at-a-time wrapper) hangs / exits 144 · builders run `node tools/smartreg.js -j 1` instead.
- `node tools/smartreg.js --dry` sometimes starts a full run instead of printing the plan; smartreg runs of 5+ tests have hit 10-minute
  agent timeouts · run smaller groups.
- tonl100a timed out at 100 s once when run by hand (passes in CI).
- tools/i18n/prep.sh wraps code in 362-v105league.js and 364-v105contrast.js (also 373, 382 and an Error message in 311 — check every prep) ·
  after every prep: `git diff src` and revert the wrong wraps.
- A commit that only touches tools/deploy (e.g. release.sh's advert shot) starts no regression run · dispatch the full run by hand.

## Waiting on him
- v1.05 shipped 2026-10-18 (release/v1.05 + main) → he runs `bash flavius.sh release`.
- Infirmary rail tab shows "⚕ N" (fighters needing care), not Medicus hours — asked whether it should show hours.
