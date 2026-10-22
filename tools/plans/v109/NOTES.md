# v1.09 — Winter Quarters (Hiberna) · his N4 idea 2026-10-16 · mock-up tools/plans/v109/MOCKUP.md (prototype 411-v109wqproto, flag flavius_v109wq)
His answer 2026-10-21: "Go" on the mock-up page (no letters given) → taken as ALL MY PICKS (W1a–W21a; W11 = a fresh intake of tirones).
W1a the Classic final IS the Saturnalia (4 finalists play its 3 events; best festival finish takes the Cup) · W2a Carmina = opening ceremony
before the race · W3a Sica's wildcard takes the empty seat's seed · W4a contracts in room 6; rudis asks come after the Saturnalia, answered
in room 10 (keeps the 2026-10-17 rudis decision) · W5a any room order, Begin needs only the Classic answered · W6a a house sitting out still
goes to the camp · W7a one "Winter Quarters are open" letter; Season in review kept as the archive copy · W8a a per-season money ledger by
category · W9a one free advisor promotion a winter for one who met his record · W10a one winter project ready at week 1; room 5 = the same
Your ludus card (keeps "buildings in My Ludus") · W11 a fresh intake of tirones each winter · W12a one camp focus for the house, no drill
injuries · W13a camp gains land after the ageing turn · W14a three Consilium goals paid in Renown, Milestones stay · W15a Cup + 60 coin +
5 morale/loyalty + 20 Renown · W16a a rival sits out when its best fighter is hurt or its purse is low (hash, not dice) · W17a Classic
played like Match Week bouts on Days I–III · W18a lives on the Match Week tab · W19a room 1 replaces the Awards screen in the off-season,
Acta from its banner · W20a the Cup on a Tituli plinth, 3-win replica = its own titulus · W21a bye extras kept.
Releases (his go on the split): v1.09 shell + rooms 1 Awards, 2 Accounts (category ledger starts counting), 6 Personnel, 10 Next season,
retires the off-season page + its letters · v1.09a rooms 3, 4, 5, 7, 8 + goals · v1.09b THE WINTER CLASSIC · v1.09c the Saturnalia finale +
rudis asks after it.
- 2026-10-21 his follow-up "1a (for now) 2a" (read as W1a, W2a): W1a = the Classic final IS the Saturnalia — FOR NOW; re-ask him before
  building v1.09b/v1.09c. W2a Carmina = opening ceremony before the race. Other W answers stay all-picks.

## Build (2026-10-21) — HELD until v1.08c ships (roadmap Q1B)
Commit 1439f82 (412-v109wq, tv109w; prototype 411 retired) kept as tools/plans/v109/wq109.bundle (branch worktree-agent-a1427da292d7f2094).
Merge: `git fetch tools/plans/v109/wq109.bundle worktree-agent-a1427da292d7f2094:v109 && sh tools/ci/merge.sh v109`.
Review before merging (builder's doubts): (1) the money ledger books coin changes by call-stack function name + line calibration —
Chromium-verified; on Safari (his browser) unrecognised changes fall into "Senate & other" (sum stays exact) → test on his Safari beta, or
replace with explicit booking at the ~200 coin sites over time; (2) the Ledger now pays in the winter (seal / Begin), so the off-season
week's own wages leave the 10% tax-back; (3) Begin seals an unsealed Ledger; (4) stepper numbers 1–4 (rooms 1, 2, 6, 10); (5) room 1 =
league top 3 + Superbus champion line; (6) fanfare on the first visit to room 1.

## v1.09 shipped 2026-10-21 (release/v1.09). v1.09a — his "go ahead with v1.09a" 2026-10-21
Builder (lead's model) on 414-v109a: rooms 3 Council (W9a), 4 Renown, 5 Facilities (W10a), 7 Winter market (W11c fresh intake),
8 Winter camp (W12a W13a), Consilium goals in room 10 (W14a); kill switch flavius_v109aoff; test tv109a.
v1.09a shipped 2026-10-22 (release/v1.09a). Next: v1.09b THE WINTER CLASSIC — re-ask W1 ("for now": the Classic final IS the Saturnalia) first.
2026-10-22 W1 re-asked before v1.09b → his "OK next" = W1a CONFIRMED (no longer "for now"): the Classic final IS the Saturnalia.
v1.09b builder started (415-v109b): entry, seeding W3a, rivals W16a, Days I–II as Match Week bouts W17a, clemency, prizes W15a, the Cup +
Hall plates + replica W20a; Day III provisional until v1.09c brings the Saturnalia.
v1.09b shipped 2026-10-22 (release/v1.09b). Next: v1.09c the Saturnalia finale (W1a W2a W4a) — waits for his go.
2026-10-22 his "go ahead with v1.09c" → builder started (416-v109c): W1a Saturnalia = Day III, W2a Carmina ceremony, W4a rudis asks after it in room 10.
