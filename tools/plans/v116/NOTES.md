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

## Point 4 explained (for his pick)
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
