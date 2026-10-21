# v1.09 — MOCK-UP: WINTER QUARTERS (Manager off-season) · for his ok, nothing ships from this

Source: tools/plans/v104/NOTES.md **N4** (his idea 2026-10-16) + his answers **o1a** (all rooms, room 9 = a winter festival tournament),
**o2a** (mock-up first), **o3a** (its own release — now v1.09, decided 2026-10-20), **w1a–w5a** (THE WINTER CLASSIC: Superbus-shaped
knockout, every house invited + optional, travelling cup + engraved Hall + replica after 3 wins, Cup + small purse + morale/loyalty +
Renown, seeded by the final league table; the finale = a FESTIVAL SATURNALIA of Carmina Fescennina, a chariot race, a Classic Democritus;
clemency, free limb regrowth, no league points, no lifetime records; empty seats → invited free agents; Sica only as a wildcard).
Also docs/decisions.md 2026-10-16/17 (Superbus seeding, advisors one level a season, rudis only in the off-season after the Winter festival,
tasks vs mail m1a, Doctore team drill, buildings in My Ludus only).

**Prototype:** `src/manager/411-v109wqproto.js` (in build.sh before 08-setup) — **OFF** unless localStorage `flavius_v109wq` = `1`.
With the flag unset the module only defines `window.WQ109` (everything else sits inside `if(WQ109.on)`), so the built game is unchanged.
Tests with the flag off: **tv104h tv105a pass 2 / fail 0** (`node tools/smartreg.js -j 2 tv104h tv105a`). With the flag on it only DRAWS: no world, Store or save writes
(every action button in a room is blocked with "❄ Mock-up — not live yet"; the screenshot run wraps saveWorld and counts: the one save it
sees is 378's existing `set105Sweep` on any Manager page draw, not the prototype).

**Pictures** (not committed): session scratchpad `…/scratchpad/v109wq/NN_room.png` (desktop 1440×900, full room height) and
`NN_room_phone.png` (390×844). The world is real: a new Manager career (`newWorld` preset 0) played through season 1, the Superbus
playoffs and into the off-season week by the game's own simulation (deaths turned off in the harness so the roster stays full).
Numbers, houses, names, awards, seeds, contracts, free agents are the game's; the mock spots are listed per room.

## Where it lives
The off-season week's Match Week tab: the rail item reads **❄ Winter Quarters**; its page = a **stepper strip** (❄ overview · 1–9 ·
✦ Saturnalia · 10; done rooms ✓, the current one gold; on phones it scrolls sideways and keeps the current room centred) + the room's
**slim v1.05 banner** (388 `.cp105ban`, the advisor's face from 298 `rm100Adv`, a winter sky behind, 1–2 counter chips) + the room +
**← Back / Next: … →** (the last room: **▶ Begin season N+1**). Shots: `00_overview`, `00b_rail_desktop`.

## The rooms — what each shows · what it REPLACES / absorbs today · new vs reuse
| # | Room (shot) | Shows | REPLACES / absorbs (module · decided) | Reuse / new / MOCK |
|---|---|---|---|---|
| 0 | Overview (`00_overview`) | the 10 rooms + ✦ as tiles with a one-line status each | **348 `po104OffHTML`, the whole off-season page** (v1.04 N2a, 2026-10-16) and its "📜 N contract asks wait on the off-season page" news; **348's End-the-week confirm** "⏭ End the off-season → season N+1?" (→ room 10's Begin) | new shell; tiles reuse the room data |
| 1 | Awards night (`01_awards`) | final table podium (I II III, flags), the Superbus champion, the full final table with each house's Superbus reach, the Flavian Awards (Flavian Cup, Superbus Cup, Aureus Gladius, Unbroken Tally, Tiro Laurel, Iron Thumb) | the off-season page's **podium + "Season N in review"** (348 E2a/N2a); the **Flavian Awards screen** opened from the off-season header (22 `awardShow`, 355 **B23** "🏆 The Flavian Awards" button, 2026-10-16); the finished bracket on the off-season page (355 **B21**) → the reach column | reuse `w.awardShow`, `leagueSort`, `msp`, `po104Reach`, `trophySVG`; the Acta button moves here (Q19) |
| 2 | The Quaestor's accounts (`02_accounts`) | money in / out by category (bars), treasury start → now, **the Quaestor's Ledger** lines + **✍ Seal the Ledger** | the **Quaestor's Ledger letter** (47 `quaestorLedger`, its Seal button; v0.48 timing) and the **Season-in-review letter's "Treasury" line** (348, from the Clerk); the header ledger badge / Your ludus "The books" (88/297) stay weekly | Ledger lines = 47's formula recomputed **read-only** (47 pays when called). **MOCK: the split by category** — only wages are tracked today (`w.qs.wages`); purses / wagers / gate / sponsors / gear / travel / medicus are a proportional split of the real net (Q8) |
| 3 | Council review (`03_council`) | the six advisors (faces, level, ★), a one-line report each, the next level's record progress (256 `adv98Req`), **⬆ Promote** (one a winter) | the **week-end level-up letters** (256 `adv98Check`, v0.98) and the council card's **⬆ Train** for the winter; 349's "advisors rise at most one level a season" (2026-10-16) is the rule shown; 349's **retired-great "could stay with the house" letter** ([data-c104adv]) belongs here | reuse council83 + adv98Req; **MOCK: the report lines** |
| 4 | Renown & perks (`04_renown`) | the Lanista perk card AS IS (363 Renown bar, this season's sources, 150 perk tree, house grades) | nothing removed — the same card as the Lanista tab, a second door (the **podium Renown** of 363's `season.offseason` handler shows in its sources) | reuse `perkTree87()` unchanged |
| 5 | Facilities (`05_facilities`) | "❄ Winter works" line + Your ludus' Facilities card AS IS | 23 `facilitiesHTML` ("One project a week") / 351 bp104 projects for the winter — see Q10: **decided 2026-10-17 "buildings are bought in My Ludus only"** → this room is a second door to the SAME card | reuse; **MOCK/NEW: the "winter works" rule** |
| 6 | Personnel (`06_personnel`) | contract asks (raise / leave) with OVR + W–L + form, **Sign <name>** / Refuse · Let him go / Keep him; the rudis asks; the contracts table (OVR, age, career phase, wage, weeks left; ≤ 8 weeks gold) | the off-season page's **"✍ Contract renewals"** (348 E4a + 386 B67 rows, 2026-10-16/17; names on the buttons per 2026-10-18 B76–B81); the **rudis verdicts** on the off-season page (380 B56 — its hook `rudis105Window` "move after the Winter festival", decided 2026-10-17 → Q4); 349's **retirement farewell letters** (season turn) | reuse `P.ren`, `ren105Line`, `c104Phase`; **MOCK: a rudis ask** when none is pending (the best record on the roster) |
| 7 | Winter market (`07_market`) | tirones (free agents ≤ 22) with class, age, grade, OVR, ask; the Recruiter's ★ pick; Scout / Offer | the off-season page's **"🤝 Recruiting is open"** row; the Recruiter's weekly **"A bargain: …" / "Pick of the week" letters/tasks** in that week (138 `recruiter84`, 378 B51) | reuse real free agents + `askWage`; Q11 (a fresh intake would be new) |
| 8 | Winter camp (`08_camp`) | 4 focus cards (Strength & stamina · Weapons · Mend & rest · Bond the house), who goes (the hurt stay in the ward), Doctore's line | the off-season week's **Training Yard team drill** (373/213; the Doctore's one team drill a week, decided 2026-10-17) and the page's "Training Yard" button | **NEW + MOCK: the camp and its effects** |
| 9 | THE WINTER CLASSIC (`09_classic_entry`, `09b_classic_bracket`, `09c_hall_cup`) | the rules as 4 chips, the prize line, your seed + fighter picker + ✍ Enter / Sit it out; the bracket (Day I Round 1 A 5·8·9·12 / B 6·7·10·11, seeds 1–4 rest → Day II semifinals → Day III the final = the Saturnalia → the Cup), drawn with **355's Superbus tree** (same boxes, connectors, laurels); wildcard / invited tags; a finished-bracket preview; **🏛 The Cup in the Hall** (the cup, holder, plates I–VI, "1 of 3 for the replica") | new (nothing today). Seeds = **348's `P.seeds`** (the final table, Sica out — 2026-10-16 s1a flat seeding). The Hall card would sit in **307 Tituli** (Q20) | reuse seeds + tree CSS + `lau103`; **MOCK: which 2 rivals sit out (hash), every result, the plates** |
| ✦ | Saturnalia (`10_saturnalia`) | I Carmina Fescennina → II Chariot Racing (no PvP) → III Classic · Democritus, the Saturnalia boon, the four finalists, Open / Watch / Simulate | new for Manager; Play Now's festival exists: **10-meta `startFestival` (chariot first, `chPvp:false`), `runCarmina`, FEST_KINDS.saturnalia** | reuse the festival engine; Q1 Q2 |
| 10 | Next season (`11_next_season`) | weeks 1–11 (bye 4, Rivalry Week 11) + Superbus 12–14 + ❄ Winter; the Consilium's 3 goals with Renown; **▶ Begin season N+1** | the off-season **End-the-week** (the season starts when the off-season week ends, 348); goals overlap the Lanista **Milestones** (17 `LEGACY_GOALS`) → Q14 | **MOCK: the goals**; the schedule when season N+1's fixtures are not cached yet (hashed city order) |

**Letters / tasks absorbed (decision m1a 2026-10-17: decision letters are tasks):** in Winter Quarters the rooms ARE the tasks. Gone for that
week: the weekly checklist (225 `weekChecklist` + 387's lines), the Season-in-review letter's role as the recap (Q7), the Quaestor's Ledger
letter, the contract-asks news, the rudis asks, advisor level-up letters, the retired-great letter, the Recruiter's bargain letter.

## Open questions (his numbering N4-W; ★ = my pick)
- **W1** The Winter Classic final and the Saturnalia ("the FINALE = a FESTIVAL SATURNALIA"): **a ★** the final IS the Saturnalia — the four
  finalists play its three events and the best festival finish takes the Cup (mocked so) · b a Day III final bout decides the Cup, then the
  Saturnalia for every house · c a final bout, then the Saturnalia for the four finalists only.
- **W2** Carmina Fescennina: **a ★** the festival's opening ceremony before the race (10-meta `runCarmina`, as in Play Now festivals; the
  crowd's favour carries over) · b its own scored event.
- **W3** Sica's wildcard seed (asked 2026-10-16, open): **a ★** Sica takes the seed of the empty seat it fills · b always seed 12 · c after
  every invited free agent (the lowest free seed).
- **W4** The rudis vs the room order — decided 2026-10-17 "rudis asks only after the Winter festival"; the rooms put Personnel (6) before the
  Classic (9): **a ★** contracts stay in room 6; rudis asks open after the Saturnalia and are answered in room 10 · b move all of Personnel
  after the Saturnalia · c rudis in room 6 (REPLACES the 2026-10-17 decision).
- **W5** Room order: **a ★** any order, ✓ on the stepper; ▶ Begin season only needs the Classic answered (Enter or Sit it out) · b strict
  order · c any order, nothing required.
- **W6** Sitting the Classic out: **a ★** a fighter who is in the ward or whose house sits out still goes to the camp · b a house that sits out
  skips the camp too.
- **W7** The season's letters: **a ★** ONE letter "❄ Winter Quarters are open" (link); the Season-in-review letter stays as the archive copy
  (Mail), all other off-season letters/tasks go · b keep every letter as well.
- **W8** The Quaestor's accounts by category needs a new per-season ledger (8 categories, counted from v1.09; older seasons show totals
  only): **a ★** yes · b show only wages + the Ledger + the total.
- **W9** Council promotion: **a ★** one promotion a winter, free, to an advisor who met his next level's record (coin still buys level 2
  any time) — the week-end level-ups go · b the promotion costs coin like ⬆ Train · c no promotion; the room only reports.
- **W10** Winter works: **a ★** one building project over the winter, ready at week 1; in-season projects stay as today; the room shows
  Your ludus' own Facilities card (one card, two doors; "bought in My Ludus only" stays true) · b building ONLY in the winter (REPLACES
  in-season projects, 351 bp104) · c no change, the room links to Your ludus.
- **W11** Winter market: **a** today's free agents ≤ 22 (mocked) · b all free agents · **c ★** a fresh intake of tirones each winter
  (8–12 new 18–20 year-olds; Recruiting stays open for everyone else).
- **W12** Winter camp: **a ★** one focus for the house, every fit fighter goes, no drill injuries · b a focus per fighter · c no camp, the
  Doctore's normal team drill.
- **W13** The camp vs the season turn (349 ageing / fading runs when the off-season opens): **a ★** the camp's gains land after the turn
  (you see both in room 8) · b the camp also slows fading like weeks drilled (`g.tr104`).
- **W14** Next season's goals overlap the Lanista Milestones (17 `LEGACY_GOALS`): **a ★** three Consilium goals a season paid in Renown;
  Milestones stay · b no goals, schedule only · c fold the Milestones into the goals.
- **W15** The Classic's purse/Renown numbers (w4a "small purse"): **a ★** Cup + 60 coin + 5 morale and loyalty for the house + 20 Renown
  (Renown table 363: a new source "Winter Classic") · b 150 coin · c the Cup only + the morale.
- **W16** Rivals and the Classic: **a ★** a rival sits out when its best fighter is hurt or its purse is low (hash of world + season, never
  the dice) · b every rival always enters (empty seats only from fallen houses).
- **W17** How the Classic is played: **a ★** like Match Week bouts (fight / watch / simulate / bet), Days I–III inside the off-season week
  (no extra frozen weeks) · b one click simulates the whole knockout.
- **W18** Where Winter Quarters lives: **a ★** the Match Week tab becomes "❄ Winter Quarters" in that week (mocked) · b its own rail item ·
  c a full-screen window.
- **W19** Awards night vs today's Flavian Awards screen: **a ★** room 1 replaces the Awards screen in the off-season (the ceremony's
  animation, if any, plays in room 1); the Acta Diurna off-season edition opens from room 1's banner · b keep the Awards screen first, then
  room 1.
- **W20** The Cup in the Hall: **a ★** a "Winter Classic" plinth on the Manager Tituli page (307) with the plates; the replica after 3 wins =
  a titulus of its own · b in the Annals/Hall (10-meta).
- **W21** The off-season week's bye extras (59: Vulso's cart, market day, +6 h, half wages from the Senate): **a ★** keep them (the City
  Square stays open in Winter Quarters) · b drop the cart and market day (the winter market replaces them).

## Proposed release split (SMALL RELEASES, his pick 2026-10-15; each one on the beta)
1. **v1.09 — fixes + THE SHELL** (days): any open Manager fixes first; the ❄ stepper in the off-season week with **rooms 1 Awards night,
   2 Accounts (W8 ledger starts counting), 6 Personnel, 10 Next season (schedule; Begin)**. Retires 348's off-season page, its letters (W7)
   and the off-season End-the-week. Mostly reuse; save change: the per-season ledger (new optional field, no migration).
2. **v1.09a — the house rooms**: 3 Council (W9), 4 Renown, 5 Facilities (W10), 7 Winter market (W11), 8 Winter camp (W12 W13), the
   Consilium goals in room 10 (W14).
3. **v1.09b — THE WINTER CLASSIC** (its own release): entry, seeding (W3), rivals (W16), Days I–II as Match Week bouts (W17), clemency +
   free regrowth + no points/records, prizes (W15), the Cup + Hall plates + replica (W20). Touches bout rules (clemency) → tonl* / replay
   goldens must stay untouched (Manager-only path).
4. **v1.09c — the SATURNALIA finale**: the festival in Manager (W1 W2; 10-meta `startFestival` / `runCarmina` reused), the rudis asks after
   it (W4).
Each release keeps a kill switch (`flavius_v109…off=1`) and its own test; the prototype 411 is deleted when v1.09 is built.

## Notes for the builder
- 47 `quaestorLedger(w,pm)` pays on call — room 2 must render from `w.qsDue` and pay only on Seal.
- 348 `OFF104.on` / BUS `season.offseason` stay the hooks; `rudis105Window` (380) is the one function to move (W4).
- The Classic needs a bout tier like 348's `sb104` (say `wc109`) with its own entry guard (355 B22's pattern: one fighter per house, chosen
  on the card) and a clemency flag read by `leagueFate` / the death roll (no deaths, no severe wounds, `regrow` free).
