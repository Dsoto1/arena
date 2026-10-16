# v1.04 — the Manager season rework (decided items: tools/plans/v103/NOTES.md "RELEASE SPLIT" v1.04 line + Superbus playoffs)

## New notes (2026-10-16)
R1 RECOVERY BACK TO THE INFIRMARY: now that the Infirmary has Medicus hours (318, v1.01), move the yard's "Recovery" section (rub-down, Care routine,
   Rest week — moved onto the Doctore side of the Training Yard in v1.01 318) back into the Infirmary, paid from Medicus hours; raise Medicus hours and
   lower training hours if needed. REPLACES the v1.01 placement (318). Questions asked 2026-10-16.
His answers (2026-10-16): 1a (rub-down, Care routine and Rest week all move) · 2a (rub-down 1 h, Care routine 1 h a week while it runs, Rest week 0 h)
 · 3a (Medicus +3 h a week, training hours − about 2) · 4 LAYOUT (no mock — build from this, "logical placement, readability, usability"):
 one building, two wings. Banner: Medicus face + ONE week hours bar split wound care / recovery. Left list in two groups: 🩸 Wounded (wound or lost limb —
 what the rail count tracks) and 💤 Weary (healthy, fatigue Tired/Worn); rows keep HP + fatigue mini-bars and Treated ✓ / Rested ✓. Centre: the marble
 statue (wounds) or the statue with a fatigue gauge Fresh/Tired/Worn + next week's band if recovery is booked. Right: plate tabs ⚕ Ward (Medicus, surgeon,
 Hygeia, beds, Asclepius) | ♨ Baths (bathhouse, rub-down in the oiling room 1 h, Care routine 1 h/wk, Rest week 0 h on a "bench" plate); opens on the tab
 that fits the fighter; every plate shows hours + effect ("−20 fatigue", "fit week 6 → 5"). Bottom: the week's tabula (booked care, hours used/left, the
 Medicus's ★ suggested order). REPLACES: the Training Yard's Recovery section (yard keeps only training) and the separate bathhouse block.

## R2 · his answers to the X3 sim report (2026-10-16): s1a s2a c1a
- s1a: playoff seeding stays as built (seeds 1–4 rest a round; any house can win; no extra edge for top seeds).
- s2a: a house with no bout in a playoff week gets its FULL wages back from the Senate (348; was half). REPLACES the half refund (59's bye rule) for playoff weeks.
- c1a: the First-team reserve (350, tm104 'A', not in Bouts I–III) can be lent out; only the three bout starters are locked.
- Advisor pace (his answer 2026-10-16): one level a season is enough for now; no extra cost per level.

## Beta 1 · his notes (2026-10-16) — fixes into v1.04 (not built until his go)
- B1 Manager · Keeping him: only 6 options (the 7th/8th wrap to a new row); keep the best; the tray EXPANDED by default.
  Found: 8 plates today — meal, private word, family tickets, bonus, raise, promise, Personal trainer (doctore), Medicus.
  Personal trainer duplicates the Training Yard's "⚒ Own doctore"; Medicus duplicates the Infirmary.
- B2 Manager · the roster list view is slightly too wide.
- B3 Play Now · the random-event 🎲 button aligned + scaled to sit with Begin event.
- His answers (2026-10-16): B1a — drop Personal trainer + Medicus from Keeping him (they stay in the Training Yard / Infirmary), 6 left
  (meal, word, family tickets, bonus, raise, promise), tray open by default. B2 — he sent a screenshot (did not reach the session; ask again
  when building). B3 — it is the HOME button/icon in Play Now (not the 🎲): align + scale it to sit with Begin event.
- Still testing; collect further notes here, build on his go.
- B2 screenshot (received 2026-10-16, 2000 px wide window): the scribble marks the EMPTY GAP between the name and the tier column — the
  name column stretches to fill the list. Fix: the name column sized to its content (with a sensible max + ellipsis), tier/OVR/W–L/wage/
  fatigue/weeks/⋯ packed after it, and the list column narrower so the selected-gladiator side gets the room.

## Beta 1 · his notes, part 2 (2026-10-16) — sorted, not built
FIXES (v1.04):
- B4 League > Standings during Superbus week: the records are wiped (looks like the next season started early); past seasons not viewable (→ N1).
- B5 never saw the off-season: simmed the Superbus (not a participant), awards, Acta, then straight to S2 W1; a Rivalry Week letter and the
  "week 12 in review" letter were still there. LEAD'S READ: every symptom (not a participant, rivalry letter, week-12 review, no off-season)
  is the OLD calendar — a career started on the v1.03 beta is switched by SAVE_MIGRATIONS '1.04' at its NEXT season (cal104 = season 2),
  so its season 1 ran the v1.03 Superbus. To confirm with him; then a letter when a career switches ("from next season: playoffs …").
- B6 Roster: drop the First/Second/Rostered + Bout I–III/Reserve buttons under the portrait; keep them in ⋯; show the player how to set teams.
- B7 Recruiting: the list ends too short — extend it to the bottom of "Where he stands".
- B8 Promote the ludus popup: the old font → the current one; use the coin icon.
- B9 Armory: an item from Spares equipped on a gladiator still listed as a spare to sell.
- B10 Letters/tasks from the previous season stay unread (Rivalry Week, week 12 in review) — clear them at the new season unless still valid.
- B11 Vulso's cart: let the player dismiss it.
FEATURES (v1.05, own release):
- N1 past seasons in the League (tables, Superbus bracket, awards per season).
- N2 Match Week rework: bout cards turn into result cards as each bout ends; the separate "🏁 Match Week results" block (17 nightres)
  folds into them; "This week at <city>" (296 any100wk) and the End-the-week confirm placement rethought. Lead's proposal sent 2026-10-16.
- Bracket view: already exists (#po104br — League banner, Match Week banner, playoff card; projected seeds from week 9) on the NEW calendar.
- His answers (2026-10-16): B6a (hint line over the list + group headers light up while dragging; the buttons under the portrait go, ⋯ keeps
  them) · B10a (at a new season keep only letters still needing an answer and still valid; file the rest) · N1 yes (League season picker:
  that season's table, Superbus bracket, awards) — v1.05 · N2a: clickable MOCK-UP first — v1.05.
- N2 item 6, his point: once the house leaves for the city (travel, or the first bout fought) the Training Yard + Infirmary are locked
  (108-v76 roadLocked76), so the End-the-week confirm must NOT ask about untreated wounded / unspent hours. Those reminders belong at the
  moment of leaving ("Set off for <city>"/first bout); the end-of-week confirm only names bouts that will be simulated.
- b5 (old calendar on a v1.03-beta career?) still to confirm with him.
- N2 mock-up published 2026-10-16: https://claude.ai/artifact/8ZvV1U2SAfnTUW557hMy5h (clickable: plan → Set off (reminders) → Fight/
  Watch/Simulate turns each bout card into its result card with a bout log → week ledger → End the week = one line). Open question: does
  recruiting lock too once the house sets off (today 108-v76 locks only the Yard + Infirmary)?

## Beta 1 · his notes, part 3 (2026-10-16) — Training Yard
- B12 "🗣 Care" on a fighter's plan card (213-v92yard data-y92care): 1 TRAINING hour = morale talk +5 and gear care (+1 AP next bout).
  OVERLAPS the Infirmary/Baths "📋 Care routine" (351: 1 Medicus h a week, standing order, −fatigue +5 morale + gear care) and Keeping him's
  "A private word" (+3 morale). Lead's proposal: remove the Yard's Care (REPLACED by the Care routine in the Baths).
- B13 the Doctore panel (Volero Asper: level, stars, drills +10%, Yard 0/3, hours with him 0/4; Intensity None/Light/Normal/Hard; Time ±;
  Study the card) → into the Yard banner? and his hours must be LOCKED IN like the fighters' sessions (today P.doc is free to change).
- His answers (2026-10-16): B12a a (remove the Yard's 🗣 Care; the Baths' Care routine replaces it) · B13a a (Doctore face + summary in the
  Yard banner; Intensity + Time as the top row of this week's plan; locked by Lock in all) · B13b a (v1.04) · b5: may have been an older
  career — he starts a fresh one to test.
- mw1 (his principle): THE WEEK MOVES FORWARD. The first part of the week is all the lanista work (recruit, train, treat, deals); Match Week is
  only the bouts — nothing back at the ludus. Once the house sets off, Recruiting locks too (with the Yard + Infirmary). v1.05 with N2.
- N2 mock-up v2 wanted: NOT a new idea — the information Match Week already shows, laid out more elegantly, visually pleasing and easier to read.

## N2 · Match Week (v1.05) — mock-up rounds + his picks (2026-10-16)
- Mock-up rounds: stake inside the Bet button (small window: −/+, 5·10·25·50, pays, Place bet); bout details as tiles with visuals
  (tickets bar, coin, scales, laurel) in the open bout; "Your week at <city>" in the banner's upper right WITHOUT the treasury (it is in the
  Manager header); slim banner; day tabs in the banner. Appearance fee shown once (was twice).
- mw2 he picked 1 2 3 4 5 6 7 8 9:
  1 your fighter's HP / fatigue / morale on the bout row + wound warning · 2 the next bout opens itself · 3 "what changed" (table places,
  rating growth, weeks out) ONLY in the week's summary — later bouts move the table, so not per bout · 4 one Watch button (Spectate's seat
  fee only when you have no fighter on the card) — REPLACES the separate Spectate · 5 rival chip in the betting table · 6 value / trap as a
  badge on the odds + the best value bet marked · 7 greyed buttons say why · 8 bracket spot in the banner during the playoffs · 9 phone:
  the betting table as one card per fighter.
- N3 "Your scouts" column (17-manager betting table): it reads each fighter's RECRUITING scout level (g.scout), so rivals' fighters show
  "not scouted" almost always, and the word clashes with Recruiting. To be renamed and fed by the existing "🗺 Walk the sand at the arena
  gate" (185-v90week wsand90: today +1 AP +1 coin, sky, omen, crowd temper, a tip).
- His answers (2026-10-16): s1a column renamed "Your read" (tooltip names the source: walked the sand / your recruiting dossier) — REPLACES
  "Your scouts" · s2a walking the sand (185 wsand90) reads EVERY fighter on this week's card; fighters already scouted as recruits keep their
  read without a walk · s3a the read is rough (± a few %) unless the Recruiter level is high · r1a a gate read = ONE ROUGH LOOK in Recruiting
  (as the first scouting session; counts toward 351's "two earlier looks" before a trial bout; never past rough) · r2a watching a bout live
  to the end gives the same rough look on everyone in it. With these, value / trap (pick 6) can show on every read fighter.
- B14 Recruiting (351 offers answered next week): after making an offer, leaving the recruit (another recruit or tab) and coming back shows
  the Offer button enabled again; pressing it says the offer is already made. Fix: while an offer is out, the Offer button stays disabled and
  the card keeps the "offer made · answer next week" info (terms + Withdraw), every time it is drawn.
- B15 Vulso's cart (goes with B11): once the 2 fighters the cart allows are taken, the cart closes by itself and its task/to-do line and
  rail count clear too.
- B16 Your ludus (the week's to-do / tasks): the "Week N in review" report (202-v91ludus details.rev91, on the desk 270-v99desk) always
  starts COLLAPSED; the player opens it.
- B13 detail, his answers d1a d2a (2026-10-16): the Doctore's hours (213 P.doc; level = 1 + Yard level + ½ per hour, max 6; drills
  Footwork/Iron Lv1, Showman 2, Blood and Sand 3, Veteran 4, Parade 5) LOCK as soon as a fighter's card locks with a drill that needs that
  level, and always with Lock in all; after that they can go up, never down, that week (closes today's gap: add hours → pick a drill →
  take the hours back). A locked drill tile says how to unlock it: "🔒 Lv 2 · 2 more hours with <Doctore>, or Yard II".
- B17 The Recruiter's "A bargain: <name>" letter (138-v84 recruiter84) stays after that fighter is signed. Fix: it files itself once he is
  signed, an offer to him is out, or he signs elsewhere; same rule for the other council letters that point at one fighter or one action
  (goes with B10: a letter stays only while it still asks for something valid).
- B18 Medicus hire, his answers m1a m2a m3a (2026-10-16): the hired house medicus (108-v76 w.medicus76; +2 Medicus h per skill point,
  limb help at skill 3+, may be lured away) is renamed CAPSARIUS (no clash with the Council's Medicus whose face is in the banner) —
  REPLACES the name "house medicus"; a STAFF SLOT in the Infirmary banner beside the Medicus face (empty: "Capsarius · empty · +2–6 h a week ·
  Hire"; hired: face, name, skill stars, wage with the coin icon, his hours as their own colour on the hours bar, Let go) — REPLACES the small
  button at the top of the patient list (332 M8); the hire popup in the newer picker style (three candidate tiles: portrait, stars, wage +
  coin, effect chips, Hire; square close). v1.04.
- B19 (asked) Roster: an "Injured" group above Lent out for fighters who cannot fight (bed, missing limb, hurt — 319 M13 already bars them
  from every card), auto-filled by the reserve then the Second team.
- B19 his answers i1a i2a i3a (2026-10-16): roster group "🩸 Injured" above Lent out; a fighter who cannot fight (bed, missing limb, hurt)
  moves there by himself with his wound + weeks to fit; the First-team reserve steps in, then the best of the Second team; healed, he goes back
  to his old place by himself; the v1.01 M13 rule stays (no bed / limb / hurt on a card); a worn fighter can be fielded with a warning
  ("Worn: fights weaker, wounds more easily").
- B20 Infirmary row chips: "Treated ✓" / "Rested ✓" (345-v103mgr's Treated ✓, 351's Rested ✓) read as finished, but the care completes at the
  week's end. Wording while booked: "Receiving treatment" / "Resting" (no ✓); a ✓ only on the report after the week turns. REPLACES the
  v1.03 "Treated ✓" chip text.
- x1a (2026-10-16): lanista perk points from ONE "Renown" bar (wins, podiums, playoff rounds, sold-out crowds, kept pledges, fighters
  improving, good signings; levels give points; the bar lists the sources) — REPLACES the free +1 a week and the scattered +1s (17-manager
  perkPend). Advisors, buildings, gladiators keep their own growth. v1.05 or later.
- B21 Superbus bracket (348 #po104br): hard to find; bland; not laid out as a playoff tree; Superbus Week / the off-season should show it and
  past seasons' results stay viewable.
- B21 his answer b21a: the bracket as a real tree (R1 bouts A/B → Semi I/II → the Superbus final, connector lines, seed + flag + name +
  place per house, gold = through, faded = out, your house outlined, laurel at the end, projected seeds grey before week 11); shown OPEN at
  the top of Match Week during the playoffs, on Superbus Week + the off-season page, and in a League "Superbus" tab (this season in v1.04;
  past seasons with N1's picker in v1.05). REPLACES the #po104br overlay look.
- B21 add-on (2026-10-16): with the bracket shown open on the page, REMOVE the extra bracket buttons on that same screen (he saw two on the
  Match Week page above the bouts: the banner's and the playoff card's). A bracket button stays only where the bracket itself is not shown
  (e.g. the League banner before the Superbus tab exists / weeks 9–11 projection).
- B22 BUG (rules): he could enter his own gladiator into the Superbus final / a playoff bout his house is not in. 348 promises "no entering /
  withdrawing" for sb104 bouts — some picker still offers it (check 296 any100 "Enter a fighter ▾", the specials picker, 17's classic bout
  picker, 350's ⋯ "bout" menu, drag to a bout). Fix: a sb104 bout takes only the houses the bracket put in it (one fighter each, chosen on
  the playoff card); every other entry path refuses it with the reason ("Your house is out of the Superbus" / "not in this round"). Test it.
- B23 the off-season is easy to miss: the Acta Diurna opens first and covers it. v1.04 fix: the off-season page opens FIRST (the Acta after,
  or as its own tab on that page).
- B24 Acta Diurna after the final reads "week 11, edition 12 of 12" — 348's frozen playoff weeks keep w.week at 11. Fix the masthead:
  name the playoff editions ("Superbus · Round 1 / Semifinals / Final") and the off-season edition, not "week 11".
- N4 (his idea, 2026-10-16) THE OFF-SEASON as a formal end of the season — today: a few summaries + the renewals list, and season N+1
  starts at once. Lead's proposal sent: "Winter quarters" (Hiberna) + Saturnalia, a stepper of rooms that gathers the season-level systems
  (awards night, the Quaestor's accounts, Council review + advisor promotion, Renown/perks, facilities, personnel/contracts/rudis, the
  winter market of tirones, a winter training camp, next season's schedule + goals) and takes that busywork OUT of the weekly tasks/letters.
- N4 his answers (2026-10-16): o1a (all rooms) with room 9 = a WINTER FESTIVAL TOURNAMENT: every fighter granted clemency (no deaths, no
  severe losses), free limb regrowth for any limb lost, does NOT count toward league points or lifetime records; its own trophy handed to
  the winning house and passed on to each new winner (a la the Stanley Cup). The off-season LEADS INTO the festival. o2a mock-up first ·
  o3a its own release v1.06 (after v1.05 Match Week).
- N4 Winter festival, his answers (2026-10-16): w1a Superbus-shaped knockout (one fighter per house, 4-house bouts, top 2 on) · w2a every house
  invited, optional, sitting out costs nothing · w3a a travelling cup, engraved list in the Hall, permanent replica after 3 wins — NAME: "THE
  WINTER CLASSIC" · the FINALE = a FESTIVAL SATURNALIA (10-meta FEST_KINDS saturnalia: +4 coin between events) of three events: Carmina
  (Fescennina), a chariot race (no PvP), a Classic Democritus. All fighters under clemency, free limb regrowth, no league points, no
  lifetime records. Extra houses: 12 houses = the Superbus shape exactly; empty seats → invited free agents (the Superbus rule); Sica's
  Syndicate only as a wildcard in an empty seat (asked: seeding).
- N4 w4a: the Winter Classic winner gets the Cup + a small purse + morale and loyalty for the whole house + Renown (once x1a exists).
  w5a (2026-10-16): seeded by the season's final league table, like the Superbus.

## Beta 1 fixes — BUILD (his go 2026-10-16)
Four builders, one module each (after 351 in build.sh), each with its own test:
- 352-v104fixr (roster): B1 B2 B6 B19            · test tv104e
- 353-v104fixl (ludus, recruiting, letters, popups): B5 B7 B8 B9 B10 B11 B14 B15 B16 B17 · test tv104f
- 354-v104fixw (Infirmary + Training Yard): B12 B13 B18 B20 · test tv104g
- 355-v104fixs (Superbus + off-season + Play Now): B22 B21 B23 B24 B4 B3 · test tv104h
- B25 Board (his screenshot 2026-10-16): the gold active ring / seat disc under a mini paints OVER the figure's feet and legs (its front arc
  is drawn after the figure). Fix: every floor mark (seat/active ring, shadow disc, highlight) is drawn in the floor pass BEFORE any figure,
  so a figure always stands in front of ground marks. Must keep tv91r / tv92p draw cost, Reduce motion, 3D + 2D tokens. → fifth builder
  356-v104fixb (board) after the first pair.

## Beta 2 · his notes (2026-10-16)
- B26 Roster (352 B2): the rows' grid now packs to its content (name fit-content + the columns) but the list BOX keeps its column width
  (minmax(440px, min(540px,46%))), so an empty strip is left right of the ⋯ column (his screenshot, 1 fighter). Fix: the list box sizes to
  its rows (fit-content, with the 440 px floor for the narrow layout only) and the selected-gladiator side takes the rest; header + group
  rows span the same width.
- B27 (REPLACES the h1a note — its premise was wrong: the lanista's hours were removed in v0.87, 150-v87mgr HRS87; pitches, notes,
  gifts, visits cost no hours, only coin / weekly limits). His answer h2a (2026-10-16): the wooing actions — pitch, private note, gift,
  visit/feast — draw on the RECRUITER's hours (one pool for recruiting) and follow 351's +1 h for each further action on the same recruit
  that week; coin costs stay; every recruiting button shows its hours. Keeping him (own fighters) stays as it is (coin / weekly limits).- B28 Your ludus checklist (88-v68): "No drills set for the week" shows when the Doctore's Intensity (w.train regime) is None, even after
  the week's plan is LOCKED IN. Fix: the item is done once the Training Yard plan is locked (Lock in all, or every fit fighter's card
  locked); a plan locked with Intensity None counts as a choice. Only an unplanned / unlocked yard keeps the task.
