# v1.16 (proposed) — "how would you improve it today" (2026-11-06)

Source: his question 2026-11-06 ("looking over my flavius rule game, how would you improve it today"); the lead's 7-point assessment and
his answers the same day: **1 not yet · 2a · 3a · 4 explain more · 5a · 6a · 7 go**. NOTHING built yet — wait for his go on the release.
Measured on the checkout that day: built page 10.6 MB (3.8 MB gzipped), 464 modules, 5 325 globals, headless boot to ready 4.8 s from disk
on a fast machine, 450 tests, 5 Safari-only open reports (all fixed blind since 2026-10-20), 0 online players at the last status.

## His answers
1. **Outside testers on the beta + a 1-line feedback button** → NOT YET (his call). Parked; not in the backlog until he says.
2. **2a WebKit in CI.** Playwright ships WebKit: one CI shard runs the board tests that cover the open Safari reports (tv91r, tv100p, the
   shadow / corpse / sheet tests: tv106*, tv108*, tv110*) on WebKit, capped at 10 GitHub minutes, smart mode only when those files change.
   No game change. Tooling: .github/workflows/regression.yml + tools/ci/plan.js. Budget: inside tools/ci/budget.json (5 000 min/month).
   Replaces nothing (adds to the Chromium shards). Open: a WebKit failure on a test that passes in Chromium = a real Safari bug → known-issues,
   never a blind fix again.
3. **3a Measure load time on phones first.** Add "time to main menu" on a throttled 390 px profile (CPU ×4, Slow 4G) to the frame-target
   rule (CLAUDE.md §1 VISUAL POLISH): a test that prints it (no gate yet). If it is over ≈3 s on the mid-phone profile → ask him about 3b
   (split the build into core + lazy chunks for Manager / Studio / Online; build.sh + mkshare.py change). Nothing split without that number.
4. **One parked v1.0 feature** → he asked for a fuller explanation (given 2026-11-06 in chat, summary below). No pick yet.
5. **5a Debt rule.** New work = one module per feature in its topic folder, listening on the bus; no more cross-topic fix-round files
   (batches/). docs/architecture.md gets a list of the 10 most-wrapped functions (so a bug hunt starts there). Written into CLAUDE.md §4.
6. **6a Online frozen; "play a friend" link.** Online feature work (stakes, referee replay, more events, reclaim a seat, Online Ludus draft)
   is PARKED until the arena has players — docs/decisions.md 2026-11-06. One small addition: a share-a-link invite = a URL
   (`#join=<room>`) that lands a newcomer in that lobby room after sign-in (today ✉ lobby.invite needs both lanistas already in the lobby).
   Costs nothing per month (same lobby route). Server: a public room token in lobby.list / lobby.accept — a server change → the beta skips its
   online part (CLAUDE.md §6). Replaces nothing.
7. **Housekeeping (go):** HANDOFF.md re-written to today's state (v1.15c built, release state, the right branch); docs/known-issues.md: the
   FIXED items under "Game — open" move to docs/history.md. Sonnet agent, ~1 hour, no game change.

## CORRECTION 2026-11-06 — 4a already exists
The lead's assessment read a stale backlog line: animated gladiator tokens SHIPPED in v1.0 (311-v100anim): idle, walk, attack, block, hit,
limp, cower, push, topple, knock, fall, sever for the 8 printed classes (pre-rendered sheets) and for Studio / online tokens (rendered on the
device, cached in IndexedDB), figure + standee styles, Off path for Animations Off / Reduce motion / Fast CPUs. Slice shown to him from the
live v1.15c build (walk + attack frames, scratch only). Backlog line marked BUILT. So point 4 = **4b only** (any-event entry) or 4c, unless he
wants one of the still-parked v1.0 look items: 3D armor/weapons on the tokens (16/17), gem/dud signing (13), Fortuna's Bounty (8), spiders
(15), 3D spectators (20), rete throw — each has look-test pictures in tools/plans/look100/.

## Point 4 explained (for his pick) — as first written
The parked v1.0 list (tools/plans/backlog.md) has two candidates with a visible payoff:
- **a) Animated tokens in the arena** (his 8a of 2026-10-08, never built): today a figure slides from tile to tile and flashes on a hit. The plan
  renders walk / attack / hit / die poses from the rig92 3D token ONCE into a flat sheet per character (like 238-v96clean's clean-up crew),
  and the board picks the frame by the move / attack / hurt / eliminate moments. Cost: one drawImage per piece as today, decode once, ≤ ~150 KB
  a sheet; the same sheet for Studio and online tokens (uploaded like the token pictures). Off path = the still sheet (Animations Off, Reduce
  motion, Fast, HEADLESS). Gate: tv91r draw time and tv92p idle unchanged, 60/30 fps rule kept. Size: a big release (2–3 weeks of builder
  time, art + board + online upload + tests). Risk: Safari sheet memory (the 2× sheet problem of v1.08–v1.10) → do 2a first.
- **b) Enter your fighter in any event + rank-restricted events** (his 22 of 2026-10-09, open design): in Manager the week's card today
  offers classic bouts only; the headline special events (Familia, Juggernaut, Orpheus…) are rival-only. The build lets your gladiator enter
  any event on the card; Triumviratus stays undercard-only (v0.99); every few weeks ONE event is rank-restricted (rank = rating grade,
  his 22a). Needs a small design: how the card shows a special event's slot, entry fee / reward, what a loss costs. Size: a small release
  (days). Risk: balance (the deaths study's numbers move again → one mgrsim2 run).
- c) neither this month.
My pick: **4b first** (cheap, Manager depth, measurable with mgrsim2), **4a as its own release after 2a** gives Safari coverage.

## Release shape (lead's proposal, waiting on him)
v1.16 = 2a + 3a + 5a + 7 (no game change except the measuring test) → no beta needed; ships with the next full run.
6a's invite link = v1.16a (server change) or rides with 4b. 4a / 4b: his pick.

## Catch-up 2026-11-06 (lead, after his "get caught up" ask)
- v1.15c (wheel zoom, 433) : full run 41623129499 GREEN 2026-11-03; release/v1.15c and main both at ccf6a70 → shipped (step 4 done), but
  step 5 never ran: no v1.15c entry in CLAUDE.md §7 / docs/history.md (CLAUDE.md still says "current v1.15b"). Whether he ran
  `bash flavius.sh release` for it is not visible from the repo → ASK.
- tools/plans/HANDOFF.md is stale (2026-10-28: v1.14b live, old work branch). docs/known-issues.md carries FIXED items under "open".
- His checklist Artifact (E6zWGfwbuCjcM3r8RmeKZt) is not reachable from this account (404) → his notes there unread; ask him to paste.
- Project Control Center brain still says patron stipend 10 + 0.3×fame (REPLACED by v1.15b 22 + 0.6×fame) → session summary proposes the fix.
- Work branch for this session: claude/flavius-game-improvements-yg8qx0 (branched from main = v1.15c).

## Build log 2026-11-06 (his go: N, C1 C2 C3; 4 void — 4a = 311-v100anim, 4b = 296-v100any, both v1.0)
- N1–N3 merged (a0ffd87 + fixes): v1.15c step 5 done, HANDOFF rewritten, known-issues cleaned, backlog lines 4a/4b marked BUILT.
- C2 tv116load (390 px, CPU ×4, Slow 4G 1.6 Mbit/s, gzip served): menu 27.5–28.7 s, ready 29.7–30.8 s (4 runs); un-throttled menu 1.6 s,
  ready 4.6 s. Page 10.6 MB / 3.86 MB gz. → QUESTION 3b to him (a split the build · b Brotli + loading bar first · c accept). Lead's pick 3b-a.
  tv116load is slow (≈30 s a run): keep it out of the smart shards unless its own file changes (check tools/ci/plan.js).
- C3 tools/wrapped.js + docs/architecture.md table: 2 444 wraps of 968 functions; top mgrHTML 73, endWeek 55, modal 36, render 26, applyBout 25.
- C1 .github/workflows/webkit.yml (own job, dispatch + paths + Monday cron, ≤15 min), tools/ci/webkit.txt (8: tv91r tv100p tv100an tv101z
  tv106d tv106f tv108x tv110a), tools/tests/_browser.js (PW_BROWSER env; Chromium path byte-identical), docs/testing.md "Running on WebKit".
  WebKit could not be installed in the sandbox (cdn.playwright.dev blocked) → first proof = GitHub run 42219983348.
- CI INFRA BUG found by the first smart run (42219587445, 96 fails "Executable doesn't exist"): the Chromium cache key pw-1.56.1-chromium had
  expired and `playwright install --with-deps chromium` aborts on ubuntu-26.04 BEFORE downloading, so a cold cache = no browser. Fix a83b8a4:
  a plain `playwright install chromium` fallback loop. Known-issues line to add once the fixed run is green.

## His answer 2026-11-06 on 3b: "I'll take your recs" = 3b-b first (Brotli + loading bar), then 3b-a (build split) as its own release, beta first.
Shape: v1.16 = this tooling release (no game change) · v1.16a = 3b-b (Brotli = flavius.sh deploy/CloudFront, loading bar = 01-head boot cover;
needs a full run, no beta) · v1.17 = 3b-a build split (beta first). Nothing of 3b built yet; v1.16 goes first.
- CI RUNNER BUG, real cause (2026-11-06 13:00): `ubuntu-latest` = ubuntu-26.04 and Playwright 1.56.1 says "does not support chromium/webkit
  on ubuntu26.04-x64" for ANY install → the old runs lived off the actions cache. Fix 3b808f9: regression.yml / webkit.yml / webkit-bench.yml
  pinned to ubuntu-24.04. Smart run 42222057749 on the pin: GREEN (the first clean run on this branch). Known-issues line written.
- WebKit job on the pin: download + deps now 34 s (plain download first, bounded install-deps). First test run (42223229945) HUNG 8.6 min
  under smartreg -j 2 with no output → the step now runs one test at a time, bounded 200 s, printing each result (6975a2a); dispatched
  with tv91r tv101z to see whether the page boots on Linux WebKit at all. Result pending.
- WebKit probe 42225921373 (deps skipped): the per-test loop works; both tests fail at LAUNCH — the 24.04 image lacks ~40 WebKit libraries
  (libgst*, libflite*, libGLESv2, libx264 …) → install-deps is required (default again, bounded 600 s; apt took 34 s once, >420 s once).
  Next probe: tv91r tv101z with deps.
- WebKit probe 42227120761 (deps installed, 47 s): tv91r PASS (175 s); tv101z FAIL only on check 4: 2 of 592 670 px differ >24 levels =
  WebKit canvas anti-aliasing, not a layer bug → tv101z tolerates ≤ 8 such px when PW_BROWSER=webkit (8caaca1), Chromium stays at 0.
  ≈3 min a test on Linux WebKit → job 35 min / tests step 26 min. Full 8-test dispatch started 13:47; result in HANDOFF when read.
- RELEASE: `sh tools/release.sh 1.16` clean (hygiene, idscan, site line, advert shot); commit 8f589b9 "[full]" pushed 13:48 → full run.
  The SHIP step (release/v1.16 + main, then his `bash flavius.sh release`) is left to the next agent on his word.
- FULL WEBKIT RUN 42228304630 (8 tests, 18 min): PASS tv91r 187 s · tv100p 45 s · tv101z 148 s · tv106f 113 s. FAIL tv100an (200 s bound,
  needs ~400) · tv106d (touch tap never selects on WebKit: aim figs/tmap empty — CANDIDATE REAL Safari/iPad bug) · tv108x · tv110a (both
  expect Chromium's immediate 2× / dpr 2 where WebKit is capped by design → test expectations to split). Written to docs/known-issues.md.
  Bound raised to 400 s a test (job 45 min). The job itself works end to end: this is the first Safari-side signal without his Mac.
