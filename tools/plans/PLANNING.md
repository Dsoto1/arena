# Planning context (what the .md files do not say)

Read after CLAUDE.md + HANDOFF.md + backlog.md. This is the "why" and the working style for planning fixes and mock-ups with Virgilante.

## How he works
- He sends numbered note lists (often a PDF, e.g. NotesV99.pdf). Read them, SORT into: fixes (go straight in) / new features (ask questions first) / mocks (draw first, he approves). Keep HIS numbering in questions and summaries. Answer his direct questions inside the list.
- He answers in short codes ("1a 2a 3yes 4a ... 10 you choose"). Multiple choice with a recommendation first works best. Where he says "you choose", pick and tell him in one line.
- Mock-ups: self-contained HTML in tools/plans/mockNN/ + Playwright screenshots; he approves, THEN it is built. After he refines a mock, do not re-invent it; keep what exists and change only what he asked.
- Concise and technical. In-game wording short. He is cost-conscious: no sub-agents / CI runs without asking.
- Visual changes must keep the game readable, fast, localized, phone-friendly (VISUAL POLISH RULE in CLAUDE.md).

## His V99 decisions and the reasoning
- v0.99 = fixes + everything already built (face phase 2, desk, themes, yard, poser presets). New features and mocks wait for v1.0. He does not want a pile of new features in a stabilization release.
- Online wagers: REMOVE for now (4a). Reason: ranked/economy trust is not there yet; touches server + many tests, so it is a v1.0 server batch.
- Ranked verification: backlog; interim safeguard = every human must report the same result (9g). He noticed a test house could start a Ranked lobby; server already blocks that and pays nothing for Custom (the CF/coin he saw were match values, not payouts).
- Offline events: autosave + a Resume button on the main menu (6a/13a).
- Custom beast guard zones are drawn RELATIVE to the gold start tile (3a-3d); walls cut the zone; parts outside the arena are ignored.
- Spectators: watch live via a button; people not seated at the horns are NOT counted as players/lobby count (10i). Today: free watchers <=30, ticket holders <=8.
- Lesson editors: Gaius Tolosanus teaches Learn to Play; Lady Aurelia of Verona teaches Manager (my choice, he said "save us both time").
- Domus slots: one at the start, more bought with a Ranked threshold (slot 2 150 Glory + 200 coin, 3 = 600 + 500, 4 = 1500 + 1000); existing houses keep theirs.

## Mocks he is waiting on (v1.0, draw first)
- Play Now: map right of the event card, Follow schedule moved into Options, rounds stacked; sandstone Play Now / Manager pop-ups; menu background shift; Hot Seat on the same layout (1a/1c/1d/1e).
- Sandstone "Begin Event" button, then reuse that button style across the UI, incl. lesson-complete buttons (2a, 5d).
- ONE speech/thought bubble system for everything (4).
- Lobby banner: FID, call the crier, close lobby, no Invite button (10a); static 8-row player list, wider; seat = portrait + token + name + rank (10e-10g).
- Features after mocks: event card carousel (2b), Options example cards (Carmina, Mandata, Golden Eagle, Zora token rounds) + class modifiers (2c/2d), animated arena tokens (8a).

## Open / unanswered
- Studio designers frame job (267-v99designers): restart now or v1.0?
- Match Week "This week" card with 3 bout tiles: asked in v0.98, never answered (walk button + road strip built instead).
- Online Ludus stays off online until a real per-lanista draft exists (his pick C, v0.98).
- Trade bundles 2+-for-1 + counter-offer letters: parked (q4a).
- Online 9b/9c: re-test with two real windows after the release.
- Profile page blank in his build: could not reproduce here; it now shows a reason + ref code.

## Where the context lives
Distilled decisions: CLAUDE.md sections 1, 3, 8. Full v0.99 plans/shots: tools/plans/mock99, fix99, desk99, face99, themes99, body99, pose99.
