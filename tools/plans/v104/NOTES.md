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
