# Known issues — what is still open (his E1a, 2026-10-17)

One list of problems not yet fixed, accepted limitations, flaky tests and items waiting on Virgilante. Each line: date · where · status.
Keep it current every release: a fixed item moves to docs/history.md with the release; a new report lands here the day it is seen.
Planned FEATURES are not here (tools/plans/vX.YY/NOTES.md, tools/plans/backlog.md); his decisions are in docs/decisions.md.

## Game — open
- 2026-10-17 · a beast drawn as a flat dark silhouette on a grey disc (beta 2 screenshot) · not diagnosed; pending render or missing render ·
  checked in v1.06 (tools/plans/v106/NOTES.md).
- 2026-10-17 · 3D minis, beasts and crowd look soft/blurry (not drawn at devicePixelRatio) · v1.06 (E6a).

## Game — accepted limitations
- 2026-10-17 · Recruiting (B72, 378): after an action the options panel stays put; its bottom edge can end a few px below the view when a
  result line grows it. Keeping the foot visible costs a second scroll (the jitter he reported).
- 2026-10-17 · Rivalry Week (383): a house with fewer than 2 fighters who can actually be entered loses 8 fame and the editor seats free
  agents (the printed forfeit rule); before beta 3 the injury sweep swapped in a free agent without the fame loss.
- 2026-10-17 · balance numbers in tools/plans/balance100/REPORT.md predate v1.02–v1.05 (wages, recruiting costs, kit repair, loans, travel) ·
  re-measured with docs/economy.md after v1.05 ships (his E2a).

## Tests + tooling
- tv93a (contrast + a11y): one local run in 8 failed "focus did not return to btnRules" — likely Escape vs the 40 ms close debounce in the
  a11y93 focus return under load; not proven, not changed · watch in CI.
- tv104d: failed once in several builder runs ("buildings promote", "recruiting scared"); the scared-offer sizing was fixed (beta 3) ·
  watch in CI.
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
