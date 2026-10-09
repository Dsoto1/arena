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

## v1.0 SERVER + SECURITY (his ask 2026-10-09)
- **Security pass on the online backend:** read-through of routes.js, template.yaml IAM + throttles, rate limits, abuse paths (token-picture content, hidden Mandata info, WAF layer?), then fix what it finds. Report first; fixes with his go.
- **REAL RANKED VERIFICATION (server replay):** today results = agreement of the humans (ONLC.agree) + end hashes; a lone human vs CPUs is unverified. Goal: the server re-plays a Ranked match from its seed + the stored input log (the lockstep inputs already carry seq/seat/hash) on a headless engine (HEADLESS exists for sims) and compares winners/deaths/CF to the reports; mismatch -> void + strike. Needs: the engine separated from DOM/screen code (or a jsdom-free headless build), run in a Lambda or queue worker after the match ends, cost check, interim = every human must report the same result. Do before wagers/Ranked rewards matter at scale.

## v1.0 MANAGER "MY LUDUS" MOCK (his PDF mockludusmanager 2026-10-09)
- His mock: rail + banner "WEEK N PRE-MATCH" with a Match Week button + parchment WEEKLY TASKS list (progress N/7, per-task counts) + 5 painted tiles (Your Team, Promote Team, Upgrade School, Facilities, Advisors). Rename Match Week -> **Fight Night** (Match Week = what the manager does before it); tasks list changes by the week's needs and stays thematic.
- BUG: the My ludus banner does not track the fallen correctly (record 1-8, many lost in bouts, also simulated ones) -> count every death incl. sims.

## HIS DECISIONS 2026-10-09 (late)
- My ludus: the fallen-count BANNER BUG goes in v0.99 (count every death, simulated bouts too). The Fight Night rename + the mock layout = v1.0.
- Tile art for the 5 My ludus tiles: reuse the SAME banners (roomScene73/banner73 scenes), cropped per tile, so the user associates tile and room. No new painted images needed.
- Server (v1.0): security pass + REAL ranked verification (server replay), see above.

## NOTES LIST 2026-10-09 (28 items, numbered in his order; NOTHING BUILT — waiting for his go + answers)
STATUS KEY: FIX = clear, v0.99 candidate on his go · ASK = needs his answer first · V1 = v1.0 (mock first) 
1 ASK  Infirmary: can a lost limb regrow by resting? (today only Hygeia, in a bed; 3rd lost limb = 1-week deadline). Options: keep / long bed rest regrows one.
2 ASK  Recruits come without armor/weapons; the house provides (today: class loadout free on first signing = g.k94). a) keep, recruit card shows no gear; b) bare-handed, buy at stalls.
3a FIX Armory repair hammer shows a coin icon with the price.
3b ASK Damaged armor must not stay equipped after a bout (-> shelf automatically).
3c ASK Easier selling: "Sell damaged / Sell all damaged" in Armory + City Square; today 30%/15% damaged, cap 3 sales a week (should damaged skip the cap?).
4  FIX Match Week bout buttons too large (esp. wide screens) -> the compact AAA button look/layout.
5  FIX Golden Eagle pot IS on in Manager bouts (eaglePot) -> highlight it on the bout card.
6  FIX Psyche soul steal: auto-add the HP to limbs on a kill (no manual add) so the results screen shows.
7  ASK Golden Eagle token in round 3: "CF cannot be redeemed" -> earn CF allowed, only spending blocked?
8  V1  Fortuna's Bounty: offerings thrown from the stands onto the tiles (animation).
9  FIX Veteranus "Pay old debts" = +1 per market purchase paid in coin or CF; reword so it is clear.
10 FIX Zora still the old image crop: assets/mini_zora.webp exists but 74-zora STANDEE_SRC.zoraMini still the old data URI -> wire the new mini.
11 ASK Manager gear enters the arena like online (already v0.94 seat.gear94) -> verify with a test / his repro.
12 ASK Lyre of Orpheus tame picker shows the beast token round; tamed beasts get move AND attack (either order, some need no move).
13 V1  Signing a recruit: celebratory screen with gem / dud effects (gem = true rating well above scouted grade).
14 FIX Tunnel action highlights usable tunnels; none under a standing pillar or a token.
15 V1  Spiders animation looks like bats -> redraw to the new spider look.
16 V1  3D armor on the 3D tokens (system pieces rebuilt from the armor art; designer upgraded).
17 V1  3D weapons on the 3D tokens (system pieces rebuilt from the weapon art; designer upgraded).
18 FIX 3D token base slightly large for the tile -> scale the model down a little.
19 V1  Frame-by-frame expressive animation for gameplay (push, pillars, knock pots, attack, block, limbs, injured, scared, breathing/weight shifts).
20 V1  3D spectators seated/standing + cheering in the arena square.
21 ASK New career: welcome letter becomes a thematic popup dismissed by the ledger seal; no special-event invitations in season 1.
22 ASK Triumviratus never a main event; enter your fighter in any event, not only classic bouts.
23 FIX First week: roster-light letter but no green "20h" recruiting count on the nav bar (trace).
24 FIX Recruiting list: Ask column shows the coin icon per week.
25 FIX Mail: "The week in review" can be dismissed.
26 FIX Recruiting: reopening a recruit lands on his active stage (scout/court/offer).
27 FIX Match Week elimination verdict buttons/card too large -> smaller card.
28 ASK 7 cities each specialise in one of the 7 non-Damnatio classes (more of that class comes from there); Damnatio only via Vulso + the auction block.
