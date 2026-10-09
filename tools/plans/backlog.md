# Feature backlog (parked — nothing here is built until Virgilante pulls it into a release)

From v0.95 releases are STABILIZATION releases: fixes + changes to established features. New feature ideas land here.
Each line: idea · where it came from · date.

## Parked features
- Token modeller polish: severed limbs on the 3D token, a female body, hands that grip weapons, emblem/damage/wraps/lacing extras in 3D,
  3D token ~20% shorter than flat tokens (may be a fix — check in play) · v0.93 follow-ups · 2026-10-07
- Online: pose step inside the online creator; Domus showcase/slot cards show the 3D token · v0.94 report · 2026-10-07
- Phase 2 hardening: server-side verification of Ranked results (engine separated from screen code, replay seed + inputs) · 2026-10-07
- Online: Stakes matches, referee replay, more events (only after the Classics play well online), reclaim a seat a CPU took (partly built v0.84) · v0.79+
- Event Designer: water / doors / more than 3 rounds / zone sizes other than 13·9·5 (the custom event data has no fields for them) · v0.94 report · 2026-10-07
- Hot seat: Guest in Manager bouts · tools/plans/hotseat-next.md
- Armor/avatar: bonus-AP links, severed-limb drop · open since v0.73
- Class cards: the 8 printed classes on the live template (needs his blank template + figures) · open
- Player listings in Flavius's Auction (only if the economy is healthy; cooldown, floor price, Flavius' cut) · v0.84 decision
- Event Designer full step-by-step wizard (deferred v0.54) · old
- Play Now setup: city/modifier header aligned to the map width · old

- **Trade bundles (his note 2026-10-08, parked q4a):** from a rival's team page offer 2+ of yours for 1 of theirs; once a week; a declined offer with interest comes back as a counter-offer letter the next week.
- Online Ludus: real per-lanista draft over the network before the horns (his pick C, v0.98) — Ludus is kept out of online until then · 2026-10-08
- **Animated tokens in the arena (his 8a: next release):** walk / attack / hit / die poses rendered from the rig92 token like the clean-up crew
  (238-v96clean: flat sheets rendered ONCE, one row per pose × 8 MINI_YAW cells), a per-token sheet per character (Studio + online 3D tokens;
  made beside the v0.93 minis8 sheet, cached by the look + pose hash, uploaded like 226's pictures online), frames picked by the board's
  move/attack/hurt/eliminate moments; perf budget (one drawImage per piece as today, decode once, ≤ ~150 KB a sheet, tv91r draw time + tv92p idle
  unchanged); Off path = the still sheet (Settings Animations Off, Reduce motion, Fast, HEADLESS/sims) · v0.99 pose batch · 2026-10-08

## V99 notes (his PDF 2026-10-09; answers 1a 2a 3yes 4a 5a 6a 7yes 8yes 10 mine) — for v1.0 (v0.99 = fixes + what is built)
- BUILT in v0.99 (271-v99fix3): 1b, 5a/6a/6b (fixed lesson coach), 5b (editors: Gaius Tolosanus = Learn to play, Lady Aurelia = Manager), 5c, 7a (shows why + ref),
  7b, 9a (no Hand to CPU online = the desync), 10b/10c, 11a, 12a/12b/12c, 13b.
- v1.0 MOCKS FIRST: 1a/1c/1d/1e (Play Now: map right of the event, Follow schedule into Options, rounds stacked; sandstone Play Now/Manager pop-ups; menu background shift;
  Hot Seat on the same layout), 2a (sandstone Begin Event + the button style reused across the UI; also 5d lesson-complete buttons), 4 (ONE speech/thought bubble system),
  10a (lobby banner: FID, call the crier, close lobby; no Invite), 10e–10g (static 8-row player list, wider, seat = portrait + token + name + rank).
- v1.0 FEATURES: 2b event card carousel, 2c/2d Options example cards (Carmina, Mandata, Golden Eagle, Zora token rounds) + class modifiers, 3a–3d custom beast guard zones
  (zone relative to the gold start tile, click/drag tile select, walls cut it, parts outside the arena ignored), 6a autosave offline events + Resume on the main menu (13a),
  8 Domus slots: ONE at the start, more bought with a Ranked threshold (slot 2 150 Glory + 200 coin · 3 600 + 500 · 4 1500 + 1000; existing houses keep theirs) = server,
  10i spectators: members not seated at the horns WATCH (button) and are not counted as players; free watchers ≤30 + ticket holders ≤8 today.
- v1.0 SERVER BATCH: 4a remove online wagers (client tab + buttons, server bet.place refuse, tests tonl77/83/83u/ws77/v82o/v87x + server suites), 9g ranked verification
  (backlog: server replay; interim = every human must report the same result), 9d/9e online results screen for every player with coin + CF (custom = nothing paid), cleanup wording.
- 9b/9c: the frozen client + results that waited for her were the Hand-to-CPU desync (fixed by 9a); re-test with two real windows after the release.
