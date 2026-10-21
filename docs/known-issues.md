# Known issues — what is still open (his E1a, 2026-10-17)

One list of problems not yet fixed, accepted limitations, flaky tests and items waiting on Virgilante. Each line: date · where · status.
Keep it current every release: a fixed item moves to docs/history.md with the release; a new report lands here the day it is seen.
Planned FEATURES are not here (tools/plans/vX.YY/NOTES.md, tools/plans/backlog.md); his decisions are in docs/decisions.md.

## Game — open
- 2026-10-21 · v1.08c [full] run 39636433284: shard 6 hung 45 min (job cancelled, no log reachable); the same 53 tests ran clean here.
  Fixed what we could: CI shards now run with REGSLOTS=0 (the slot limit is for shared boxes) and smartreg is bounded at 30 min, printing
  partial results + live processes if it hangs again. Re-run 39646409572: 423/423 pass, 0 flaky.
- 2026-10-21 · corpse leads checked for v1.08c (builder C + lead): the DPR-drop hypothesis is ruled out in Chromium (every cache keys on the
  device scale; tools/bench/dprdrop.js). 410's 1×/2× beast meta mix-up needs the bases setting toggled mid-visit, and the bug was already
  in v1.08 beta 4, BEFORE 410 existed → not the cause. Still unreproduced; his beta console data (CV107.stats, CV107.lastSz, "404:") decides.
- 2026-10-21 · open: Safari has no navigator.deviceMemory, so 410 loads the 2× sheets there (≈711 MB decoded for 16 sheets against 178 MB
  at 1×). Watch for Safari memory trouble on the beta (X108.why, X108.st); `flavius_x2off=1` turns it off.
- 2026-10-21 · CONFIRMED on live v1.08b (his screenshot, Mac Safari 26.6, DPR 2, zoomed, night): bear corpses 2–3 tiles big and blurry; the 404 size guard does not catch it. Suspect the WebKit path (406 W3 bitmap copies / 346 scaled cells / 410 2× beast meta) — fix in progress for v1.08c. Same screenshot: live figures soft when zoomed because Safari's board runs at 1× (406 W1); his 4 recordings (tools/plans/v107/perf/safari-v108b-*): 1.5× zoomed 30.5 fps p95 95 ms vs 1× zoomed 42.9 fps → keep the auto rule; retry 1.5× after v1.08c removes the bs101Off read-back (~28 ms each on Safari).
- 2026-10-20 · v1.08 beta (his screenshot, Safari, night, Lighting Full): round dark DISC shadows under some figures (spearman, small figure, horned helm); not reproduced in Chromium; 409 hardened (torch casts only from 399 shadow cells, paired by identity, others skipped → V108.st.figSkip). Untested path: custom-gear device-rendered shadows. Ask him: discs gone on Lighting Light? custom characters?
- 2026-10-20 · beta 4: "a bear corpse 2–3 tiles big" (his screenshot, Safari 26 / Mac / DPR 2) is NOT reproduced in Chromium — every
  system beast's corpse draws at the living scale (tv107g 5). 404 now checks the cut and the drawn size and falls back to the lying still
  (console warning "404: the … corpse drew at …×"); confirm on his Safari in the next beta.
  STILL OPEN on live v1.08b (his Safari 26.6, DPR 2, zoomed, night; bears). Not reproduced in Chromium even with flavius_v107safariforce=1 (+ dpr 1, +
  x2force; WebKit is not installed here, so the real Safari path is untested). v1.08c hardening (unconfirmed): 404's guard no longer passes a
  corpse it measured nothing for, and holds the body to an absolute size (CV107.maxTiles 2.6 / 3.2 tiles) besides the expected-scale test; flagged
  → the lying still. Needs his Safari's console ("404: …" warnings) or a screenshot with the page's CV107.stats / lastSz.
- 2026-10-18 · tools/art/anim100b/make.js l106 run today bakes DIFFERENT beast shadow sheets than the committed v1.06a ones (moechus/valencia:
  cell 56×18, anchor y 47 vs 58×28, y 11 — the shadow sits above its anchor); the lit sheets come out byte-identical. Check l106.js's shadow
  crop before any beast re-bake (398 kept the committed shadow sheets).
  CLASSIFIED + FIXED IN THE TOOL (v1.08c, tools/art/bakecheck.js): not crop(), not nondeterminism (two runs are identical, the lit sheets and
  the class sheets re-render pixel-identical). l106.js `shadowCell` called `R2.setSize` only when the canvas WIDTH differed; a new renderer's
  canvas is 300×150, so a cell with S = 300 (moechus, valencia) never got sized and rendered into 300×150. Now width AND height are tested;
  `l106 moechus --check` alone matches the committed sheets. No asset changed; the fix reaches the game at the next beast re-bake.
- 2026-10-17 · 3D minis, beasts and crowd look soft/blurry · figures + beasts: 2× sheets on big screens since v1.08b; Safari board still 1× when slow (1.5× trial waiting on his recordings); crowd + City walkers + Studio/online tokens stay 1×.

## Game — accepted limitations
- 2026-10-19 · City Square (402): beasts to the pens are only lion / bear / wolf / viper (the kinds with a 3D figure); a Studio character in
  the square shows its own 3D token WITH its base (222 sheet). (The standalone's flat townsfolk: fixed — his a, crowd100_* now inlined.)
- 2026-10-17 · Recruiting (B72, 378): after an action the options panel stays put; its bottom edge can end a few px below the view when a
  result line grows it. Keeping the foot visible costs a second scroll (the jitter he reported).
- 2026-10-17 · Rivalry Week (383): a house with fewer than 2 fighters who can actually be entered loses 8 fame and the editor seats free
  agents (the printed forfeit rule); before beta 3 the injury sweep swapped in a free agent without the fame loss.
- 2026-10-17 · balance numbers in tools/plans/balance100/REPORT.md predate v1.02–v1.05 (wages, recruiting costs, kit repair, loans, travel) ·
  re-measured with docs/economy.md after v1.05 ships (his E2a).

## Tests + tooling
- 2026-10-21 · v1.08c builder A: the flaky set (tv106d tv100z tv104d tv104e tv105o tv95c tv85f tv85r tv76 tv96g tv101c tv98d tv91n tv59
  tv93a) rewritten with tools/tests/_wait.js (seeded worlds + semantic waits); local proof (smartreg -j 2, first try only): 12 of 15 at 20/20,
  tv93a 19/20 → fixed → 20/20 + 8/8, tv95c 17/20 (+18/20) → fixed → 8/8 so far, tv100z 19/20 (the one miss = smartreg's 400 s kill under
  load) + 20/20 · the GitHub `tests`+`repeat 20` dispatch is the release proof (8a); the old per-test entries are folded in here (history: list them at release).
- 2026-10-21 · GAME (found by tv104e, not fixed — src/manager is v1.09's): B1's six Keeping-him plates fit one row only while the room
  column is ≥ 560 px (352's container query); at 1440 px the roster list column takes 495–512 px by name length → room 541–567 px → the
  plates wrap to 3 rows when a long name is on the roster. tv104e now seeds its recruits (names fixed), so the test no longer flips.
- 2026-10-21 · tv104d's GO helper still sleeps 500 ms after MGR_REDRAW (kept: a blanket MGR_REDRAW→mgrDrawn swap broke tv104e / tv105o
  layout reads — deferred scroll + layout passes after the redraw) · replace per call with a state wait when one is touched.
- 2026-10-21 · a CI FULL run commits tools/regstate.json + tools/regmap.json.gz back to the branch (absorb job, [skip ci]) → `git pull
  --rebase` before the next push from a session.
- 2026-10-18 · tv101z (pre-baked board vs old paint) now runs with Lighting Off: with Full the shadow layer adds ~9.5k px of ≤24-level anti-alias differences between the two paths (none >24) · not a visual bug; revisit if the pre-bake ever draws shadows itself.
- Playwright "Execution context was destroyed" with no navigation = Chromium collected the awaited promise during a heavy sync step
  (tv102e, fixed by deferring t93Open). Other tests that await a long sync WebGL step inside page.evaluate can hit the same · fix the same
  way when one shows up.
- 2026-10-19 · tv95p now budgets MAIN-THREAD image decodes (≤25/s) + a 90/s all-thread guard: 401 moved most decodes to worker threads, which the old all-thread count still charged.
- 2026-10-19 · tv105x and tv100l had checks that passed by chance (a fighter's name in an unrelated task; a digit somewhere in the banner) · narrowed.
- tonl100a timed out at 100 s once when run by hand (passes in CI).
- (fixed in v1.08c) tools/i18n/prep.sh wrapped code (Error text, shader, console concat, CSS/font/HTML fragments, SFX credits, home names,
  recorder keys): wrap.js now skips them and test ti18nwrap guards it. A NEW false-wrap shape → add a rule or an `i18n:skip-begin` /
  `i18n:skip-end` comment pair (or a DATA_TABLES / DEV_LITERALS entry in wrap.js for a file you must not edit) plus a case in ti18nwrap.
- A commit that only touches tools/deploy (e.g. release.sh's advert shot) starts no regression run · dispatch the full run by hand.

## Waiting on him
- Safari board sharpness (406 W1): built = cap 1.5× → 1× when slow; ANSWERED 2026-10-20 (4b): try 1.5× after the v1.08b sharper sheets, measure on his Mac. Figures fuzzy (his note 2026-10-20) → v1.08b. Safari CONFIRMED on his Mac 2026-10-20 (v1.07, Slow): 52.6 / 55 fps, p50 17 ms (was 4.5 fps); the auto-drop went to 1× (tools/plans/v107/perf/safari-v107-*).
