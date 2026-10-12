# Feature backlog (parked — nothing here is built until Virgilante pulls it into a release)

From v0.95 releases are STABILIZATION releases: fixes + changes to established features. New feature ideas land here.
Each line: idea · where it came from · date.

## Parked features
- Token modeller polish: severed limbs on the 3D token, a female body, hands that grip weapons, emblem/damage/wraps/lacing extras in 3D,
  3D token ~20% shorter than flat tokens (may be a fix — check in play) · v0.93 follow-ups · 2026-10-07 → **v1.0** (his call 2026-10-10)
- Online: pose step inside the online creator; Domus showcase/slot cards show the 3D token · v0.94 report · 2026-10-07 → **v1.0** (his call 2026-10-10)
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

## HIS ANSWERS 2026-10-09 (to the 28-item list) — still NOTHING built/tested/mocked
1a  keep: only Hygeia regrows a limb (no rest regrow).
2b  recruits start bare; the house provides gear. He asks: can managers buy every L1-3 piece somewhere across the city centers (stock per city/week: CITY94 sz3 Roma+Capua all levels, sz2 sometimes one L3, sz1 no L3; SPEC94 specialties x3)? -> check coverage when building (every printed piece must be buyable in at least one city, L3 in the sz2/3 ones).
3   Why so much gear: a dead fighter's gear returns to the shelf (v0.94 rule 2a), signing brings the class loadout as owned pieces (g.k94), damaged pieces stay home until repaired. HIS RULE: when a gladiator is eliminated for good, his STARTER KIT (class loadout, issued) does NOT return; bought/won pieces do. (Open: weapons too? release/sell/retire too?) + auto-unequip damaged after a bout + easier selling (3b/3c).
7   Golden Eagle token / CF in a no-CF round: you may EARN CF during the match (and hold it for the end-of-match payout); only SPENDING CF is blocked.
11  test it (manager gear -> arena) when building.
12  yes: tame picker shows the beast token round; tamed beasts get move AND attack (either order, some need no move).
13  yes: gem/dud signing celebration (v1.0 with mock).
21  yes: welcome popup with ledger-seal dismiss; no special-event invitations in season 1.
22  yes: Triumviratus never a main event, only an UNDERCARD bout. "Any event": he is unsure what it meant -> ask again (can your fighter enter the week's headline special events, e.g. Familia/Juggernaut/Orpheus, instead of only classic bouts?).
28  his pick = mine, thematic: Roma Royalty (imperial capital) · Capua Slave (Spartacus' school) · Syracusae Hero (Greek heroes) · Leptis Magna Venatore (African beasts) · Thysdrus Amazonia (Libyan Amazons) · Arles Veteranus (colony of legion veterans) · Verona Soldier (legion garrison road); Pompeii/Puteoli/Nemausus/Uthina/Pola neutral. A city's class ~40% of free agents there. Damnatio only via Vulso + the auction block.

## HIS ANSWERS 2026-10-09 (round 2) — still nothing built
3   Starter kits (class loadout, weapons AND armor) are ISSUED: just to get a fighter into the arena, never a profit source -> worth 0, cannot be sold, vanish when the fighter dies/leaves/loses them (like the online Issued kit); bought or won pieces still return to the shelf. (Assumption to confirm when building: a fighter who is released alive also takes/loses his issued kit.)
22  Your gladiator may enter ANY event on the card, incl. the week's headline special events (Familia, Juggernaut, Orpheus...). Triumviratus stays undercard-only. Plus: every so often ONE event / special event is RANK-RESTRICTED (only gladiators of a given rank may enter). OPEN: what "rank" means in Manager — rating band (grade A/B/C...), medal-ladder grade, or wins/fame tiers?

## BUILT 2026-10-10 for v0.99 (272-v99fix4, test tv99q) — his "build all for .99 if it makes sense"
Built: 3a 3 3b 3c 4 5 6 7 9 10 11(test) 12 14 18 21 22(Triumviratus undercard-only) 23 24 25 26 28 + the fallen-count banner bug.
Notes: 10 = his TTS Zora was already the 3D-minis render (same bundle); the figure styles used the old crop → assets/zora99.webp. 2b: city stalls stock
per city/week (Roma/Capua carry all levels; over the weeks every printed L1-3 piece shows up there) — no change made. Welcome scroll skips headless test
browsers unless localStorage flavius_welc99on=1.
STILL v1.0 (not built): 22 "enter your gladiator into ANY event" + occasional rank-restricted events (rank = rating grade, 22a) — needs a design for how
the card offers special events; 8 Fortuna's Bounty animation, 13 gem/dud signing celebration, 15 spiders, 16/17 3D armor + weapons, 19 expressive animation,
20 3D spectators; Fight Night rename + My ludus mock layout; server security pass + real ranked verification.

## v1.0 MOCKS round 1 answers (2026-10-10; mocks in tools/plans/mock100/)
A1a A2a A3 (lead: strip + 1.5 s "your turn" ribbon) A4 (lead: centred desktop, bottom sheet phones) A5 carbon-black danger slab (not basalt).
B1 explain canvas vs HTML more · B2 same box for thought/speech, thoughts in italics · B3 lead's pick asked (plate when 2+ bubbles) · B4a B5b B6a.
C1a · C2a (asked why needed) · C3a + show 8 seats, compact · C4a medals like the online gladiator ranks.
D1 tiles: finalise with lead's input (Team · Promote · Upgrade School = buildings · Armory · Advisors) · D2 show Roster vs Team hub · D4a D5b D6a D7a (gem reveal approved look).
E1 uniform text, no wrapping rows · E2 show chart examples · E3a E4a.

## HIS v0.99 TEST NOTES (2026-10-10) — sorted, NOTHING built yet (wait for go)
FIX: main menu online version chip off · zoom mid-action → rest of event stutters · city center crowd loads frozen then all move at once (stutter) ·
Manager +AP start bonus only onto locations with armor · fighter trained while in an infirmary bed · Focus CARD = pick the location in a popup (no roll) ·
Mandata Flavi cards + round tokens look faded (he sends better PNGs).
CHANGE: League standings + Points column, banner tooltip on how points are earned · Trials of the Yard: better layout/location · Acta Diurna: 3-4 rabble-rouser
spectators of the week (portraits) under the Darwinius awards.
NEW?: who's-online list (Orbis?) · Rete (net) throw animation · ONE banner system (online banners as the standard offline).
QUESTIONS: how free agents heal after surviving an event · do Manager/online gladiators bring their equipped gear (answer from code).

## v1.0 MOCKS round 2 answers (2026-10-11)
B1 bubbles in the page, except while zoomed (then drawn on the board) · Da Your Team opens today's Roster (the mock used a stand-in, the build uses the real Roster cards/art)
E stats = grade rows, no chart · Recruiting round 3: newly painted mural-like art from in-house painters, portrait only (no avatar), more compact → recruit3.html
Lobby: user list stretched to the bottom (aligned with table settings) + goofy quick chats (server phrase codes → deploy + translations)
Banners: ONE designer (flag/banner/pennant/tapestry/crest = kinds of one design), dr98 quality as the standard offline → banner.html mock
Online gear: asked (today class weapons are added on top of the equipped kit; class armor replaced)

## His answers 2026-10-11 (round 3)
ONLINE GEAR (a): Ranked = equipped only (no class weapons on top); safety net = daily Issued kit (worth 0: no sell, no auction, no gift/send, no repair, never looted, vanishes when lost — must not become a coin source); Custom keeps the class loadout. Server batch v1.0.
BANNERS: 1a 2a 3a 4a 5c ("Heraldry" — Roman alternatives offered); make it ANCIENT ROMAN (vexillum, signum, parma/scutum emblem, velarium, tabula ansata; meander/clavi/clipeus patterns), not medieval → mock round 2.
RECRUITING r3 approved so far; Offer right side → contract tablet (was decoration).
BUBBLES: only if performance does not suffer — build gated on tv91r draw time + a zoom frame test, bubbles on vs off.
MY LUDUS: unsure about the Fight Night card → compare variant; show Advisors room + an opened letter.
BANNERS round 2 answers: 1a Insignia · 2a Parma chip · 3a Flavius box = locked system Flammula · 4a house picks the Signum top (eagle only Domus Aurea) · 5a bronze plaque · 6a bold Colosseum stripes on the Velarium.
ADVISORS: no separate room — marble relief frieze of the six heads on My Ludus; click a head → popover (level, advice, train/upgrade text + cost). Mock round 4.
ONLINE ISSUED KIT (his pick: per house): one Issued set per house; the daily claim only refills missing pieces (no stacking, no hoarding).

## v1.0 EXTRAS (his picks 2026-10-11): 1 first hour (guided first match + first Manager week) · 2 achievements UNIFIED across all modes (merge Manager trophy case, online trophies, Immortalis, Annals feats → one "Tituli" set) · 3 replays (asked: whose — each player locally vs server) · 4 daily/weekly fixed-seed challenges offline · 5 sound pass · 8 balance pass with sims · 9 release hygiene (phones, a11y, 9 languages, help/Tactics). Not picked: 6 photo mode, 7 desktop build.
Advisor levels for the other five: asked (a one effect each / b Recruiter only).
Replays (c): each player's last 10 locally (all modes) + server keeps recent Ranked (also feeds ranked verification). Advisor levels (a): one clear effect each for the other five.
3D look tests started (tools/plans/look100/): gear on tokens + female body/gripping hands/severed; animation strip (his notes: walk/attack/hit/die, push, pillars, pots, block, limbs, injured, scared, breathing; Fortuna's Bounty; spiders not bats; rete) + 3D stands spectators.
My Ludus: Fight Night card dropped → bout chips in the banner carry face/name/fatigue; frieze contrast variants a/b/c.

## 3D answers (2026-10-11)
GEAR: 1a female head · 2a per-body skeleton · 3 tokens +15% AND scale pillars/pots/chest to match · 4b fused fist · 5a sheet per severed set · 6 class loadouts first, then all printed · 7a shading pass toward his minis.
His fixes: tokens bigger than the tile, base on the raised railing → keep inside the tile; shield still mis-placed.
ANIM: full frame set (memory measured) · 8 printed classes get 3D stand-ins · 3D crowd everywhere (benches, shading) · same 3D people walk in the city forum · modelled spider · painted rete · stepped poses + glide.
MY LUDUS: frieze c bronze; an advisor with news lights up into his colour portrait (no seals); long task lists scroll inside the parchment.
SPEED × ANIMATION (his pick a): Slow/Normal full animation; Fast = CPU tokens still + glide + hit flash, YOUR OWN moves still animate; To the end/sims draw nothing; Animations Off/Reduce motion = still always; online per viewer (display only). Advisor glow pulse: keep.
ROOMS: Roster / Training Yard / Infirmary in the recruit3 style → mock rooms.html (Infirmary body = marble statue, his pick).
WEBSITE (v1.0): update the site pages for 1.0 (play.html text + what's new + screenshots) and make sure play.html shows the CURRENT advert shot.
  Facts: play.html <img src="play/arena_shot.webp"> (fallback siteart/arena_shot.webp); release.sh retakes tools/deploy/arena_shot.webp (last 2026-10-10), flavius.sh uploads it + invalidates /play/arena_shot.webp. He sees an old one → check: cache (browser/CloudFront), or the fallback firing, or the site's play.html is older than the v0.82 zip.
WEBSITE FIX (2026-10-11): the live site was older than the v0.82 site zip (Contact still in the menu; play.html loading the fixed siteart/arena_shot.webp). New full site zip website/flavius-site-v0.99.zip (not in git): Media + Contact off every page's menu, play.html → play/arena_shot.webp (retaken each release), siteart fallback = the v0.99 shot. He deploys: bash flavius.sh site flavius-site-v0.99.zip.
ANIM MEMORY (his pick): load only what is needed — idle+walk always, other actions decoded when used, sheets at drawn size; no mirroring (shield hand).
3D (his pick a): look-test round 4 — every armor piece modelled from his art (helmets, cuirasses, tassets as strips, shaped greaves, segmented plates) + every weapon from his card art with correct grip/orientation/stance per weapon type; then build.
3D (his pick A+C, no TTS files): round 5 — straight wrists (clamped, elbow takes the angle); helmets + cuirasses sculpted ourselves as SDF meshes with baked AO + painted textures; the rest refined in code.
3D round 5 answers (his 1a2b3c4b): full-detail sculpts, painted metal highlights, refine the six then sculpt the rest, sword 15° out of the fist → round 6 running.
3D round 6 answers (his 1b2c3b4a): trim Reinforced Chest ~55k, drop engraving that can't read on the board, loincloth/sash per class from his minis, sculpt belts + limb pieces → round 7. NEW (his ask): 3D beasts + animations (quadruped/snake/spider rigs, Tholo/Commodus humanoid) → beast look test.
PUSH ANIMATION (his question 2026-10-11): today doPush (05-flow) moves the target/pillar and the pusher instantly — no animation. v1.0: pusher plays the push pose (look-test row exists), the pushed piece/pillar slides one tile with a short stagger + a little dust/scrape; spikes → the hit after the slide; Off path = today's jump.
MAIN MENU SHOW (his question 2026-10-11): today mmFig/mmShow2 (08-setup) slide/tilt FLAT token images (tokenImg) — beasts 'carry off' gladiators by moving pictures, Commodus swaps a raised-sword image, the duel is a dust cloud. v1.0: same story with the 3D animated tokens (gladiators idle/flex, beasts walk/pounce/drag, Commodus strides + raises sword, the duel = attack/hit/fall frames); eagle stays painted; still pictures with Reduce motion/Animations Off; keep MM95 preload. Preview clip after the beasts look test.
BRIEFING (his 1c 2a 3a 4a 5a): portrait + token round, new Flavius opening lines, rule cards always shown BUT no digital-only rules there (they stay in Tactics), reopen = same window with NOW/done rounds, "Enter the arena".
ARENA LOOK (his notes 2026-10-11): a railing along the near stands (the faint black line), new stone textures to fit the v1.0 looks → arena look test (tools/plans/look100/arena_*).
3D round 7 answers (his 1a2b3a4b): tassets stay, merge meshes per figure, hide old harness belt under sculpted belts, next = in-game token modeller pipeline (round 8 = preview build, not merged). BUG his: scutum rotated again + elbow through → fix + automatic check in make.
Tassets: his change — DO update (three plates on straps, gap at the bottom) in round 8.
BEASTS (his answers 2026-10-11): 1 brand-new RIG per system beast (his joint mock tools/plans/look100/ref_beast_rigs.jpg — head red, shoulder/chest orange, spine yellow, elbow/knee green, paw/foot/wing tip blue, tail purple; fewer joints is fine); Tholo + Commodus on the humanoid rig · 2c base ≤1.1 tile, figure +30% · 3a render at drawn size · 4a 23 frames all · 5a Tholo +13% with tunic AND cape · 6a spiders = swarm effect only.
ARENA (his answers): railing good — corner towers must connect the rail on both sides; ALL 3 rail styles used across arenas (matched to stone); 2d a stone family per arena, unique where possible; 3a matched sets; 4a no switch; 5b ship textures as small webp files.
ARENA THEMES (his ok): update THEMES99 palettes where needed to match the new arena stone (AA contrast, default Arena theme stays brown).
RULE (his, 2026-10-11): NO achievement/trophy may use a basic emoji icon as its art. Found: online trophies TROPHY_IC83 (137-v83onlui) = 🏆 🦁(reads as a teddy bear) 👑 💀 🛡 👍 ☀ 🏅. Fix in v1.0 with the unified Tituli plaques: each title gets real in-house art (Tholo / Commodus = their token rounds or card art, first win = the event's Summa Rudis medallion, rank = the rank medal, Thumb = the Fate card art, Victor of the Day = laurel crown, bouts survived = scutum). Audit the Manager trophy case, Annals feats, Immortalis too.
Round 8 answers (his): 1b tassets ~30k · 3a real integration for v1.0 (file list in NOTES-look-gear.md Round 8) · Q2 conversion cost: (c) — his pick 2026-10-11 ("C works"): printed pieces + class kits are sculpted ONCE at build time and shipped as one pre-baked file (~150–300 KB, loaded on demand); only custom extras build on the device · online trophy art fix ships with 1.0.

## v1.0 HIT FEEDBACK (his picks 2026-10-11) — BUILT: 277-v100hit, test tv100h, shots tools/plans/hit100/
Problem: every point change pops its own floating number (#fx95) — noise without cause or place.
- Q1b: numbers land ON THE FIGHTER-PANEL AVATAR over the piece/location hit (grey −N armor AP, red −N health), settle into the existing
  cracks/dims; severed = a word. On the board: a small 6-zone body pip (head/chest/arms/legs) beside the token lights the struck zone + one total.
  When someone else is hit, the panel shows their avatar briefly, then snaps back to yours.
- One action = one readout (cause icon from weapon/medallion art first: "🗡 4 → chest: 2 armor, 2 health"), readouts queue, never stack on a tile.
- Saves/blocks as words: Blocked / Absorbed N / Saved / Missed.
- Q2b: other fighters' far-off exchanges = faded small marks (full readout only for yours + your target). Setting Full / Mine / Quiet (default Full).
- Q3a: hits taken between your turns stay as tick marks on your avatar until your turn; hover = "Leo: −3 left leg".
- Q4a: coin/CF never pop on the board — the icon flies to its counter and the counter ticks (like cf95Fly).
- Fast: no pop-ups; avatar marks + log carry it. Reduce motion / Off honoured; online = display only (no S/hash).

## v1.0 LOOK ANSWERS (his picks 2026-10-11)
ARENA round 2: 1a piers only at the ends · 2b accent band on ALL 12 arenas · 3b Capua gets the gilt parapet (grand arena) · 4a all four
palette changes · 5a bronze rail colour per arena (gilt Roma, bronze Arles, dark Nemausus, verdigris Pola). Build into the game with v1.0.
BEASTS round 2: 1a Leo idle+walk split from the actions · 2 (no letter; keep render sizes) — SNAKE far too thick ("like a turd"): much
slimmer profile · 3a bigger lighter mane locks framing the face · 4a Commodus lion-pelt hood + segmented armour · 5a Tholo cape = cloth
that swings with the walk · 6a Zora smaller + perched like his mini. → beasts round 3.
3D GEAR integration: 1a keep the ~300 KB simplified bake · 2a pre-bake the body the same way · 3a bow string drawn · 4a base 0.8 tile
("best fit": keep 0.8 but nothing may spill out of the tile — check every class/pose/facing).
FREE AGENT HEALING (his pick a, 2026-10-11): BUILT — free agents' surgeon wounds close on their due week (city physician), never fester; test tv100f.
BABYLON.JS (his call 2026-10-11): KEEP the current 2D canvas + render-once 3D approach. A look-only Babylon.js arena prototype is being built in tools/plans/babylon100/ (live 3D board, tokens, day/night, speed + size measured) — not in the game.
CITY CROWD STUTTER: FIXED (279-v100city, tv100c). Open: the city walkers ignore Reduce motion (pre-existing).
CITY SQUARE CROWD (his change 2026-10-11): crowd = ambient life only (walk/stand), figures NOT clickable/hoverable (performance); every spectator action via the right sidebar; stalls/buildings/gate stay clickable. Added to the city Reduce-motion fix.

## BEAST 3D MODELS — his note (2026-10-11), applies to every beast round and the real integration
Each species its own skeleton + animation config. Essential joints:
Bear / Wolf: root, spine, neck, head, 4 shoulders/hips, 4 elbows/knees, 4 paws · Lion: like the wolf + a SEPARATE mane mesh ·
Snake: root, head, neck + a chain of spine segments · Eagle (Zora): root, neck, head, shoulders, wing joints, elbows, wrists, tail, legs, talons.
Performance: reuse geometry + materials; share animation logic between similar quadrupeds adapted to proportions; skeletal animation (no
per-part updates); shadows/transparency/dynamic lights limited; lower-detail models for distant/small creatures; never a new mesh or
material per turn. (Board today = render-once sheets, so most of this governs the sheet renderer + the Babylon prototype.)

## CLEAN LAYERS — his picks (2026-10-11): 1a after v1.0 · 2b INCLUDING the server Ranked check (phases 0, A, B, C, D1, E; not D2) · 3c mismatches only logged the first month, then decide · 4c CPUs make NO truce/trade offers to humans online (Familia is the legit team-up) — FIX, next build. Plan: tools/plans/layers100/PLAN.md.
TAME BOND (his rule 2026-10-11): Meat Lure breaks a tame bond (any beast except Commodus / humanoid beasts / human NPCs); Ursa/Brutum "charges you" arena cards break a tamed BEAR's bond only. Building (tv100t). Open: Tholo (printed lure card says it works on him).
CROWD CHEERS: today's sculpted crowd (193/209) cheers in bursts (arms up, fist shake) but never stands. The 3D token crowd (look tests only, not in the game yet) MUST keep the cheers AND stand up from the seat on big moments.

## ONLINE TURN FLOW + TIMERS (his picks 2026-10-11; mock-up first, then his go; server change)
1a only real decisions open a window; notices → toast / log line · 2b a run of windows = ONE panel that steps through them ·
3a others see a small "<name> is choosing…" line · 4a Ranked turn 60 s · 5b+c timeout → the CPU finishes that turn; repeated timeouts
let the others drop the seat to a CPU (like the 3-min away rule) · 6a decision windows have their own short clock (~20 s) then the default
answer · 7a Custom: host setting Off/30/60/90/120 s (default Off) · 8c ring around the active face + bar in the turn panel + big countdown in
the last 10 s + a SOFT tick in the last 5 s ("marble coasters lightly clapping").
Timeouts must be SERVER-ordered inputs (lockstep: the server, not a client clock, says time ran out; same moment on every screen).

## His answers 2026-10-11 (v1.0 summary + tame)
1 Turn timers: the last-seconds countdown must NEVER block the arena view (no big number over the board; keep it off the sand) — build on his go.
2a EVERYTHING in one v1.0 · 3 Fight Night rename: asked for my recommendation · 4a "enter any event": mock-up first · 5 who's-online list in v1.0 ·
6 sharper Mandata/round token PNGs coming from him · 7 Tholo CAN be Meat-lured ("a strange beast") · 8 I draft the website What's New.
Tame: 1a Tholo lurable · 2a Ursa/Brutum break the bond whoever owns the bear · 3a card text names Tholo again.
FIGHT NIGHT: 3a keep "Match Week" (no rename).
TURN TIMERS: GO (2026-10-11) — with his change: the last-seconds countdown never sits over the board (turn panel + face ring + thin red screen-edge glow).
WHO'S ONLINE (his 1c 2b 3a): a panel beside the Orbis on the Online landing AND a Lobby Browser tab; rows = house banner, lanista, active gladiator + rank,
status (idle / in a room / fighting), time-zone region; actions Invite · Watch · House card · ★ Follow; hidden lanistas never listed. Building.
QUEUE (2026-10-11): v0.99 fixes started now (tv100x). SERVER BATCH starts after the turn-timers + who's-online branches merge (same routes.js / onlcore, one deploy). Then waves: My Ludus+advisors → Recruiting+rooms → Play Now+briefing → lobby+bubbles → Insignia → Tituli/first hour/replays/daily → 3D animation (after beasts final) → sound/balance/translations/release.
ENTER ANY EVENT (mock tools/plans/mock100/anyevent.html; his picks 2026-10-11): 1a specials ADDED on top of Bouts I–III · 2b specials cost an ENTRY FEE you pay, bigger purse ·
3a one event per fighter a week (entering moves him off his bout) · 4a team partner = your fighter / hired free agent / editor's pick · 5a one event about every 3 weeks
rank-restricted at random · 6b restrictions "X and above" AND "X and below" (rookie bouts) · 7 cards mostly FILLED early (you see who is entered); when you TRAVEL,
every remaining empty seat on every bout is filled so the full card shows before final decisions · 8 (banner ★ chips) not answered yet. Build in the Manager wave.
ENTER ANY EVENT 8a: ★ chip per special on its day in the banner tracker.
RANKED/ONLINE IMPROVEMENTS (his 2a: ALL 8, with the server batch): 1 hidden skill rating (Elo-style) per gladiator for matchmaking + queue ETA + server-random seats/turn order ·
2 Ranked watchers one turn behind · 3 leaver mark on the house card + short Ranked cooldown after repeated drops/timeouts · 4 connection dot per seat ·
5 per-season leaderboard by Glory gained + Tituli season rewards · 6 Report a player (logs the match for review) · 7 after-match summary with replay link + ⚔ Again ·
8 server-checked results (after v1.0, clean layers phase E).
ONLINE SIDELINING (his 3a, all four): cosmetic pauses (clean-up show, chest/spawn/market reveals) short, same length on every screen, never counted against a timer ·
turn clock independent of each viewer's Speed · (NO "Digital rules" label in rooms — his correction 2026-10-11: every digital game, online or offline, uses the digital rules; they are only referenced in Tactics) · Fortuna's Bounty / stands actions only ticket holders in the timed group turn;
Tactics online-rules page lists what is offline-only (missio, festivals, tournaments, hot seat, lessons).
MANAGER WORLD TABS (his 1a 2a 3a 4a, 2026-10-11): mock first (tools/plans/mock100/world.html) — one shell; News = Forum Wall with the Acta pinned; League = Standings with all columns
+ house card; Imperium = clickable map + city cards; Trophies = Tituli hall; Season = Calendar of 12 week tablets + LOOK UP TO TWO SEASONS AHEAD (his add).
FIX (his 2026-10-11): recruiting cards always say "his/him" — use the fighter's sex everywhere in Manager (whole strings per sex for i18n). Building (tv100g2).

## His answers 2026-10-11 (later)
v0.99 fixes: Focus card — unsure (keep 1a; he re-tests in the build) · rabble-rousers fictional regulars OK (satire) · +AP start bonus: 3b a DIALOG to choose, limited to armored locations.
WHO'S ONLINE: 1a struck shown normally · 2c no-house lanistas only on the full tab · 3 per-GLADIATOR status: a gladiator in a live match stays "fighting" until it ends or his
Fate is recorded, while his lanista (who abandoned) may already be in another room with another gladiator — show the lanista's current activity + the gladiator still fighting ·
4a count listed only. CHANGES: NO who's-online panel on the Online landing (Lobby Browser tab only); the follow-house search leaves the landing → Profile & Settings;
Acta of the day merged INTO the biggest winner / biggest loser boxes; re-fit the landing.
WORLD TABS: W1–W9 all a. Calendar: more contrast between the schedule tablets and the light background; the current week ALWAYS clearly highlighted. Build in the Manager wave.
WORLD TABS: city card = information only (his 'a for now', 2026-10-11) — no Plan a trip; Walk the square only when reachable this week.
PERF (his B, 2026-10-11): cheap low-risk batch building (menu paused under windows, 21 animations → opacity/transform, no forced layout in draw, t12 via sims, condition waits). LATER: Manager morph-patching, script split (external file), arena panel render rate, wrapper-drop review.
MAP INTEGRATION (his "all 7", 2026-10-11): small map insets inside existing flows — 1 Match Week travel strip · 2 world letters · 3 recruit home city + city filter ·
4 the Annals Road (Play Now) box drawn on the real empire map: 12 arenas in Road order, won ones ticked, next lit, gladiator token on his city (his a) · 5 League house card · 6 programmata city picking · 7 Calendar hover. Imperium tab stays optional.
SPECTATE → LOBBY BROWSER (his a): sub-tabs ⚔ Rooms · 👁 Live matches · 👥 Online now; the Spectate tab goes; Live = every match in progress with 👁 Watch / 🎟 Ticket.
BABYLON: whatever the prototype shows, any Babylon work is a LATER release (his note 2026-10-11).
QUEUE wave 5 (Play Now) explicitly includes: the sandstone mock A1–A5 AND the event card CAROUSEL for the event chooser (V99 2b) — confirmed in line (his note 2026-10-11).
FPS TARGET (his a, 2026-10-11): 60 laptop / 30+ phone (rule in CLAUDE.md VISUAL POLISH RULE) + an FPS meter switch in Settings (building).
FOUNDATIONS = v1.01 (his ok 2026-10-11): after v1.0 ships, first job: replay tests → folder regrouping by topic → clean layers A–C → card/beast effects as data → rules in Node → server Ranked check → Manager morph + rendering items. Tray buttons use Play Now's porphyry red + gold letters (his note).
TURN TIMER ANSWERS (his 2026-10-11): 1a hide the decision-dock timer row when timers are off · 2a page-reported clocks accepted in v1.0, checked by the server Ranked check after v1.0 · 3a vote takeover and the 3-min away drop stay separate · 4a timeout turns count toward the CPU-won cut. Abandoned-but-fighting lanista can't switch active gladiator: keep (busy rule).
TURN PANEL (his note 2026-10-11): the full #tt100 panel pushed the avatar down → a SLIM draining bar (≤24 px, number on the right) above the avatar; the full panel moves to a "⏳ Turn" side tab (online only); click the bar opens it (building).
ONLINE BATCH A/B ANSWERS (his 2026-10-11): B1a only ticket holders act online, Fortuna's Bounty card unchanged · B2a leavers Ranked only · B3a random seats every non-team Ranked room · B4a no clean-up show online · B5a reveal credit 900 ms ≤5 s, owner clock ≤10 s late = fine · A1 NO to keeping all four: pre-v1.0 houses keep slots = living gladiators (≥1), the rest unlock like new (my reading of "no", building) · A2 coin-only 5th slot: he asked for thoughts (proposal: also needs Domus rank Ludus Magnus 3000) · A3 yes, L1 stand-ins (Royalty gladius, Amazonia mace, Damnatio stones).
MENU SHOW (his a, 2026-10-11): after the 3D show ends the main menu keeps idling (no freeze) — today's behaviour, no change.
WAVE 3 STARTED (2026-10-11): Manager map insets (all 7) + ENTER ANY EVENT (1a 2b 3a 4a 5a 6b 7 8a).
BABYLON (his 2026-10-11): pushed to the side — no Babylon work planned; prototype stays in tools/plans/babylon100/ for reference.
3D GEAR Aim pose (his yes): the bow stands upright in the Aim pose like the armed stand (wrist turned) — building.
BEASTS ROUND 3 ANSWERS (his 2026-10-11): 1a split Tholo + Commodus like Leo · 2c bronze shoulder clasp AND the cape IVORY WHITE (not red) · 3a bigger lion face on Commodus's hood ·
4 Zora perches on a BROKEN CHUNK OF PILLAR ROCK · 5 snake THINNER (his word after seeing it). → round 4 look test.
MY LUDUS ANSWERS: 1a advisor effects as built · FACILITIES (FAC 250/600/1200 builds under the advisors) go INTO the advisors — each building under the advisor who runs it, built from
his popover · 2b Clerk's rebate shown in the header wages badge · 3a Roster + Armory banners swap to the new scenes now · 4b Consilium's counsel + Ledger links move where they belong
thematically (counsel → Consilium's popover, Ledger → the Clerk's popover / money badge).
ENTER ANY EVENT built (296-v100any, merged). HIS ANSWERS: 1a 2a (own days) 3a 4a 5b (Gauntlet out + never the Commodus event as a special) 6a — building. Was: 1 specials bookable before travel (bouts need the road paid) ok? · 2 all specials on Sunday after the Main event, or own days (mock had Familia Sat)? ·
3 restrictions only on specials ok? · 4 invitationals stay separate ok? · 5 Gauntlet in the pool (survives ~1 in 6 sims)? · 6 fee/purse first guess: solo fee = purse/10, purse = main ×1.8.
BEASTS ROUND 4 ANSWERS (his 2026-10-11): 1b Tholo's cape closer to the back + a darker linen colour · 2b bigger clasp discs, no chain · 3a Commodus: lion's jaw higher so his face shows ·
4a Zora's pillar chunk as is · 5a split other beasts only if memory is needed later. → round 5 look test.
MY LUDUS ROUND 2 ANSWERS: Consilium lights only on a warning or a decision (loan due, risky entry, rival challenge); the Armory building moves to the Barracks master (Barracks, Shrine, Armory; Clerk = Stables + Ledger).
BEASTS ROUND 5 ANSWERS (his 2026-10-11): 1a clasps as is · 2a cape stands off in swings as is · 3a Commodus: lift the lion head higher so it sits like a hat and his eyes show — NO MOCK NEEDED (apply directly in the look files; the beasts are then FINAL for the 3D-animation integration wave).
GO (his 2026-10-12): after the 3 run-25 fixes merge AND a full GitHub run is clean → Wave 4 (Manager rooms Roster/Yard/Infirmary + Recruiting to mock + signing day gem/dud) and Wave 5 (Play Now sandstone + event carousel + briefing) IN PARALLEL. Then 6 online lobby/bubbles/Insignia · 7 Tituli/first hour/replays/daily · 8 3D in game · release prep.
ROOMS ANSWERS (his 2026-10-12): 1a Trials = the mock's big plates · 2a Renew = existing Extend contract, starter tablets keep Change…/Bench · 3a Infirmary plates reuse existing scenes, his art later.
ACCEPTED FOR v1.0 (his): truncated names in the new list columns (Rooms/Recruiting/Match Week), rooms taller than one screen, reused art — revisit in v1.01 if needed.
PN/BRIEF/RECRUIT ANSWERS (his 2026-10-12): A1b event picker = plain sideways-scrolling row (not the ring) · A2a Follow off by default · A3a sandstone only on the big doors for v1.0 — his follow-up: SPREAD TO EVERY WINDOW'S MAIN BUTTON NOW in v1.0 (306-v100sand) · B1b online: every player sees the briefing before the first turn (local, never holds the match) · B2a my special-event wording stays · C1a board under the dossier · C2b dossier = one step at a time (Scout / Court / Offer tabs) · C3b gem/dud only for a whole grade or more of difference · C4a Recruiter lines kept.
GO (his 2026-10-12): Wave 7 (Tituli · first hour · replays · daily/weekly challenges) starts once the tv93a fix is merged and a full GitHub run is green.
TITULI ANSWERS (his 2026-10-12): 1a Latin titles kept · 2a Democritus medallion (first win) + Leo token (Beast Whisperer) kept · 3a season tituli shown earned on his own Domus (domus.get returns tit100 — server, release deploy).
FIRST HOUR ANSWERS (his 2026-10-12): 1a Choice tip as built (2 coin or an arena card) · 2a full three-round Democritus · 3a fixed Soldier vs Slave/Amazonia/Veteranus.
REPO PUBLIC (his call 2026-10-12): Actions minutes free → budget.json public:true (no skips). WAVE 8 STARTED (2026-10-12): 311-v100anim gladiators · 312-v100beasts beasts + spiders/rete/Bounty · 313-v100crowd 3D crowd + forum (three agents, worktrees).
WAVE 8 MERGED (2026-10-12): 311-v100anim (tv100an) · 312-v100beasts (tv100bs) · 313-v100crowd (tv100cr). Open from the builders: forum gladiators could use 311's class sheets (313 rendered its own stand-ins); boar/croc not rendered (not NPCT); Commodus spawn-strike has no attack pose; wrapped net drawn in the fx layer (over pieces in front); no severed stand-in sheets (maimed keep today's token); sheets on the site ≈ 11 MB (anim 6.2 + beasts 4.0 + crowd 0.8) — maybe lower quality; on-device Studio/online sheets not tried on a real GPU/Safari.
3D FIGURES GEAR (his pick c, 2026-10-12): render each animated figure on device at MATCH START from the gladiator's real loadout (Manager owned gear, online kit, Studio gear, Play Now kit); kit-equal seats use the prebuilt sheets; mid-match gear changes ignored except a lost limb (severed variant = loadout minus that limb's gear; per-class prebuilt severed sheets when the loadout is the class kit, else rendered on device). Online 3D-token figures now carry their real kit (supersedes the old "tokens carry no gear" for the animated figure — his yes 2026-10-12).
WAVE 8 GREEN (2026-10-12): run 43 (74d4233) — all 327 tests, every shard passed. Includes severed sheets + gear-true figures (his c), 311 cell cache, beasts on 311's breathing clock (idle board 3 draws/s). Next: release prep (sound pass, balance pass, translations ~1,237 keys + restore check93/tv86 ceilings, hygiene, version bump to 1.0, final full run).
RELEASE PREP (2026-10-12): translations DONE (part-111, 1380 keys × 7, ceilings restored: missing ≤400, tv86 LEFT_MAX 60). His picks: SOUND = audit + new SFX (314-v100sound, agent); BALANCE = Play Now classes + Manager economy + Online coin — report + proposals only (tools/plans/balance100/REPORT.md), he approves tweaks. Then hygiene, 1.0 bump, final full run.
