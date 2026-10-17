# v1.05 — Match Week rework + Your Read (planned: v104/NOTES.md N1 N2 N3, mw1, x1a)

## Carried from v1.04 (shipped 2026-10-16)
- B27 his answer b27a (2026-10-16): keep pitch 1 h, note 1 h, gift 2 h, feast 4 h, +1 h per repeat that week; the 8 h cap stays scouting-only.
- RECHECK on the v1.05 beta: B30 double booking (not reproduced), B32 white mark over a token (not reproduced), B35d stake row → N2.

## His go (2026-10-16): "b27a, go to build 1.05"
- F1 (his screenshot, Manager rail): the "16 h" chip on Recruiting sits right after the label, and the Infirmary ✓ too — every rail
  count / hours chip / ✓ goes to the RIGHT edge of its row (like Your ludus 4, Training Yard 8 h, Lanista 16).

## Build plan v1.05 (workstreams)
- A  N2 Match Week rework (mock-up https://claude.ai/artifact/8ZvV1U2SAfnTUW557hMy5h) + picks 1–9 + B35d stake in the Bet button +
     mw1 (Recruiting locks at set-off; reminders at set-off; End-the-week confirm names only the bouts it simulates) — 360-v105mw
- B  N3 Your read (s1a s2a s3a r1a r2a): read data + walk the sand + recruiting rough look + watch-live look — 361-v105read
- C  N1 League season picker (table, Superbus bracket, awards per past season) + F1 rail chips — 362-v105league
- D  x1a Renown bar (perk points from one bar) — 363-v105renown
- Beta 1 (2026-10-17): "new manager careers start in season 5" — by design since v0.22 (careers join the shared empire calendar). His q1a:
  new careers start at Season 1 week 1 on their own count; the empire calendar is separate (built as 365-v105cal).
- B36 (beta 1 screenshot, 2026-10-17; B31/B32 not fixed): the ACTIVE gladiator on his move (orange "1" move tiles shown, 3D mini, beside a
  pillar at the arena edge) — the seat disc (grey disc, dark ring, gold rim) draws OVER his shins/feet. 359 moved the glide/target/truce rings;
  this path is still drawn after the figure (likely the move-phase / selection overlay or the seat disc itself). Find it by recording the draw
  order at that cell, put every floor mark under the figure.
- B37 (beta 1 screenshot, 2026-10-17): with the token BASE toggled off (346), a gladiator's beige base disc still shows — intermittently.
  Likely the same path as B36 (one draw path ignores the toggle and the floor order). Sent to the B36 builder (366-v105fixb3).
- B38 (beta 2, 2026-10-17): the main menu show uses old tokens — 282's pre-rendered strips (assets/mm100_*.webp, rendered for v1.0) predate
  336 (80% of a pillar, weapon grip), 346 (smaller beasts) and 323 (attacks); and when the strips take > 1.5 s to load the visit falls back
  to the old FLAT show. His a: re-render the strips from today's figures + never fall back to the flat show (hold a still 3D frame, then play).
- B39 (beta 2 screenshot, B29 follow-up): Play Now action row still not one set — the 🎲 and Begin Event are cut off at the TOP (their tops
  hidden under the header edge), the 🏛 Home tile sits lower and to the right, outside the row, over the scrollbar, and it MOVES on its own
  (stays put while the panel scrolls / is positioned separately). Fix: the three in ONE flex row inside the same container, same top, same
  height, nothing clipped, Home scrolls with the row (no fixed/absolute placement), check 1440 / 1000 / 760 / 390 px and while scrolling.
- B40 (beta 2 screenshot): the stands fan's flag (321, "first fan of each gladiator holds his flag") floats beside the pole — a gap between
  the pole and the cloth. Fix: the flag's hoist edge sits on the pole near its top (both facings, every zoom, the 3D crowd 313 too).
- B41 (beta 2 screenshot): a netted snake's NET (the bell/dome cage) is drawn over a gladiator standing on the tile in front of it — the cage
  crosses his body. Fix: draw the net with the netted piece in depth order (behind pieces in front of its tile, in front of pieces behind),
  never in a late overlay pass.
- B42 (his ask, beta 2): attacking a blessing pot with too little damage (04-rules doAttack: "the pot holds (needs 2)" only in the log) shows
  nothing on the board. Add a short readout ABOVE the pot (the same family as the hit readouts, 277/303): e.g. "Holds · 1 of 2" (and
  "Miss" when no hit); a small shake of the pot; Reduce motion / Animations Off = the text only. Small feedback, not a rule change.
- B43 (beta 2 screenshot, Recruiting · ✉ Private note popup): 357's B27 "⏳ 1 h" chips are injected into each tone row (Praise / Promise /
  Plain truth) and sit ON TOP of the tone names, plus a fourth stray chip under the list. Fix: the hours shown ONCE, in the card's title line
  ("✉ Private note · once a week · ⏳ 1 h"), the rows untouched (name | effect); check the other wooing popups (pitch, gift, feast) the same way.
- B44 Training Yard (his walk-through, beta 2): own sessions (training hours) + Lock in all, then 2 Doctore drill tiles still selectable with
  0 Doctore hours and Intensity None — backwards. His answers (2026-10-17):
  t1a the Doctore row on top of the week's plan: his hours + Intensity + ONE TEAM DRILL picked there; every fit fighter does it (tap a fighter to
      sit him out); 0 hours = no team drill (drill + Intensity greyed "Give the Doctore time to run a drill"); per-fighter drill tiles go.
  t2a 1 h opens the Lv 1 drills, each 2 more hours one level up; the Yard level raises his cap + the drill bonus; Intensity = team gains/fatigue,
      only with hours.  t3a in v1.05 (beta 3). Bug either way: after Lock in all nothing stays choosable.
  REPLACES v0.92 213 (per-fighter Doctore drills; level = 1 + Yard + hours/2) and part of v1.04 B13 d1a (hours lock with a fighter's drill →
  they lock with the team drill).
  His layout asks: ⚔ Trials of the Yard (213 y92trials / 269 sticky right column) to a more main spot — maybe ONE tile cycling between the
  trials (spar / exhibition / beast pen); the Tabula + Doctore section to use the space better; TIME larger and more prominent. → mock-up first.
- B44 mock-up published 2026-10-17: https://claude.ai/artifact/1b6VF1sbtfKs3aUi3Y7mkq (clickable). Banner with the week's TIME big; the
  Doctore row (face · TIME with him big − N h + with the level ladder · Intensity, greyed without time · ONE team-drill tile cycled ‹ › ·
  sit-out chips); the squad · the fighter's own sessions · ⚔ Trial of the Yard as ONE tile cycled ‹ › (spar / exhibition / beast pen);
  the Tabula strip at the bottom with Same as last week + Lock in all (locks everything). Waiting for his ok / changes.
- B44 y1a (2026-10-17): the Doctore's hours come from the same weekly training hours (one number in the banner).
- B38 follow-up (2026-10-17, his answer, then simplified): the menu show ALWAYS draws its figures without bases (soft contact shadow) — no setting.
- B45 (beta 2 screenshots, Match Week banner, 360-v105mw): too tall and wasteful — a big empty middle (the city art) while the content
  crowds the left; the "Your week at <city>" box is tall; the pop-up chips ("On the road from … · trip 12", "🔒 Yard, Infirmary and Recruiting
  shut until the week ends") are oversized ovals with the text sitting high (not vertically centred) and the second one runs over the scenery.
  Fix: a SLIM banner (roughly half today's height): row 1 = city name + "Match Week · week N of 12" + the chips inline (pill height = text,
  centred, one line, ellipsis); row 2 = map inset + day tabs + Walk the city square + temple/gate links; the Your-week box compact
  (tiles in one row of 6 or 3×2 at ~half height, buttons beside); no overlap at 1440/1280/1000; phones stack.
- B46 (his call, beta 2): the Golden Eagle is in play in almost every Match Week bout (17-manager boutSpec opts.eaglePot:true on every bout,
  shown as "🦅 Golden Eagle in play"). Wanted: AT MOST ONE bout a week has the Eagle (some weeks none). REPLACES the always-on eaglePot in
  Manager bouts (v0.6x; backlog #5 only highlighted it).
- B47 (beta 2 screenshot, City Square): a house (tiled roof, white walls) is drawn UNDER/over the arena's outer wall — it sits inside the
  arena's footprint. Fix: no building overlaps the arena (layout or depth), every city.
- B48 (his call, beta 2): remove the BUILD/buy options from the Infirmary ward (he misclicked Hygeia and bought it). Building happens only
  from My Ludus (the rooms/building screens); the ward shows what is built, and what is not built shows "Build it in My Ludus" (a link),
  never a purchase button. REPLACES the in-ward build buttons (318/351 ward plates).
- F2 (his call, beta 2 screenshots): the Your ludus week banner's review chips (−268 treasury (now 62) · 0 fame · 0/0 wins/bouts · 0 fallen ·
  4 this week) repeat the top bar and confuse; the Clerk's (Quaestor's) ledger report already explains the week's money in/out. REMOVE the
  chip row from the banner (17 weekReviewHTML .chron.mini and whatever re-renders it in the banner, 294/297/317). Keep last week's bout
  results list + the Acta button where they are. REPLACES the v0.x "week in review" stat chips.
- B49 (beta 2 screenshot, Recruiter letter): "Agrippa 'Pugnax' Verus chose Ludus S…" carries "ANSWER BY WEEK 7" + "Go to the Recruiting board",
  and the text both says he took Severianus's terms AND advises raising the wage next week. Fix: a recruit who signed elsewhere = a plain
  NOTICE (no deadline badge, no action button, no advice): "<name> signed with <house> (their terms beat yours)." It files itself.
- B50 (his ask): no offers on a newly signed fighter for a burn-in period — no rival bid / trade ask / Sica poach / player offer on a
  fighter who signed recently. Length + scope asked (P1).
- P1a (2026-10-17): burn-in = 4 weeks from signing for EVERY offer kind (rival bids, trade asks, Sica's poaching, the player's offers on a
  rival's new signing); a "🆕 settling in · N wk" tag. REPLACES: no protection (Sica poach any unhappy fighter, trade asks any time).
- B51 (his ask): a weekly task / letter suggesting a BARGAIN recruit clears itself as soon as that recruit is on your Recruiting board
  (already there, or put there later) — like the other tasks. Builds on v1.04 B10/B17 (353 l104Sweep).
- B52 (his ask): the Your ludus mail panel hides itself when no letters are left; it comes back when one arrives (with B49–B51, 378).
- B53 (his ask): Match Week flow — after a bout completes it COLLAPSES and the next opens; when all 3–4 are done all collapse and the page
  scrolls back to the top (week results). REPLACES 360 pick-2's "result card + next bout both open". (with B45, 374)
- D1/D2 trade deadline + late-season locks: proposed 2026-10-17 (D1a deadline end of week 8; D2 1 free agents only into empty spots, 2 Superbus
  roster freeze, 3 no releases in the playoff weeks). HIS ANSWER d1a d2-1,2,3 (2026-10-17) — built in v1.06 (new rules).
- B54 (his ask): Recruiting keeps the selected recruit's options in view — no jump to the top after scouting/pitching/offers; selecting a recruit scrolls his options panel into view (with B49–B52, 378).
- B55 (beta 2): accepted a loan request (2 weeks + a coin sum) from its LETTER, but the fighter stayed on his roster, not lent out. Investigate the letter's accept path vs 47 offyes / lendTo (+ the 343/345/350 wrappers that can refuse silently).
- B56 (his call): gladiators ask for the RUDIS (their freedom) only in the OFF-SEASON — after the Winter festival once it exists (v1.07
  Winter Classic); until then in the off-season (348/349, with the renewals). No rudis requests during the 12 weeks or the playoffs.
  REPLACES rudis asks at any week (17/157/351 paths).
- B57 (beta 2): the week-9 Consilium Superbus letter (357 B33) shows ANSWER BY WEEK 11 with nothing to answer. Rule: the badge only on letters that ask for a decision; info letters never (with B49–B54, 378).
- M1a (2026-10-17): TASKS = actionable only (button to the place, clear themselves when done, only they carry Answer-by); MAIL = information only (no badges/buttons, files itself, hides when empty); a decision letter appears once, as a task. REPLACES v0.99's Lanista's desk (270, mail + checklist in one list). (with B49–B57, 378)
- B58 (beta 2 screenshots, week 10): League shows Corvus 6th (9 pts, tied with #2–#5) while the week-9 Consilium letter says "seed #4,
  Istrian Pens just above (#3)". Causes: (1) the letter is a week-9 snapshot (written before week 9's bouts) and was still showing in week 10;
  (2) Sica's Syndicate sits in the table but takes NO playoff seed (348 po104Seeds skips m.sica), so seeds ≠ table places. Fix: a SEED
  column/marker in the League table (Sica "—, wildcard only"), the tie-break order in the header tooltip (points → win rate → fame), the letter
  dated ("after week 8's games") and gone from mail at the week's end (M1a), the Match Week banner's seed chip always live.
- B59 (beta 2): '<name> asks for a fight' task stayed after he was entered — clears as soon as he is in any bout this week (M1a case; with 378).
- B60 (beta 2): in an away week the host city's City Square / temple / walk the sand opened before setting off. Fix: those open the 'Set off for <city>?' window first (mw1); home weeks unchanged (with B45/B53, 374).
- B48 follow-up (his call): an UNBUILT building is not shown in the Infirmary at all (no plate, no link, no price) — buildings come from the advisors / building upgrades in My Ludus only. Built ones show as today.
- B61 (his call): a recruit's "home city" want (157 WANTS88, glad.city, 17 baseInterest home bonus) must name a city WITH AN ARENA (LOCATIONS).
  A recruit from a town without one (e.g. Alexandria) wants the NEAREST arena city to his town instead ("from Alexandria — wants Thysdrus"),
  everywhere it shows and in the interest maths.
- C1a (2026-10-17): keep the Council Doctore advisor's free levels on the Yard ladder, labelled ("+1 from <advisor>").
- B62 (his call): Rivalry Week (week 11, Familia 2v2 vs the rival) costs NO travel — the trip is paid by the organisers. REPLACES the travel fee that week.
- B63 (beta 2): in Rivalry Week his house was on NO card — is the house always set up in its rivalry bout? It must be: the rivalry bout
  always seats the player's house (auto-picked pair, editable until set-off) unless he has fewer than 2 fit fighters (then a clear warning +
  the Familia forfeit rule). Investigate why it was empty.
- B64 (beta 2): the task "Match Week: only 2 of your 3 starters are fit…" counts the OLD 3-starter depth (47 depthOf n=3) while the v1.04 roster has
  4 First-team slots (350) and he had 3 of 4 filled, each set to a bout. Fix: the warning checks THIS WEEK's bouts — a task only when a bout
  you are entered for (or must fill) has no fit fighter, named per bout; no task when every bout has its fighter.
- B65 (beta 2): eliminated from the Superbus, in the semifinal week a Consilium task said 'None of your fighters is on this week's card' + Enter button. Rule: entry/fitness tasks only for bouts the house CAN enter (eliminated / bye / unseeded / not drawn = none). (with B64, 384)
- B66 (beta 2): a gladiator KILLED in a Match Week bout shows up as a FREE AGENT right away. Rule: he stays with his house (marked fallen) until the week ends, then goes to the grave/annals — never the free-agent pool. Investigate where his contract is cleared.
- B67 (his ask): off-season contract renewals show each fighter's overall rating (OVR, grade colour), season record (W-L) and recent form (the last 5 results dots, like the League).
- Answers (2026-10-17): H1a (care bookings stay one click) · Antiochia/Londinium hand-mapped (Londinium → Nemausus, Antiochia → Syracusae) ·
  buy-freedom asks stay off-season only · the building-project chip stays in the Your ludus banner.
- B68 (his report): weekly task "Faustus "Fulmen" Invictus fights with bare hands" for a RESERVE. Fix: the empty-hand tasks (225 weekChecklist)
  only for fighters who fight this week (starters / entered in a bout); reserves never get it.
- B69 (his call, with 4yes): each page banner shows its own building's project chip: the Infirmary's on the Infirmary banner, the Yard's on the
  Yard banner, Recruiting's on Recruiting, etc. (.bp104c, 351) — the Your ludus banner keeps the ludus-wide one.
- B70 (his beta-3 screenshot, Training Yard): too much empty space — the Doctore block (padding above/below), the gap between "Time with him" and
  Intensity, the Team drill card (empty right half); the Lock-in button sits below the fold (must scroll). Also seen: the Beast pen "Needs 2 hours"
  tooltip overlaps its own text. REPLACES part of the B44 layout (the approved y1a mock-up, built in 373).
- B71 (his aside): the Armory, Recruiting and Training Yard page banners = the slim Infirmary/Roster banner (same height + look).
- B72 (his beta-3 report): Recruiting — the screen jitters/flickers when clicking a recruit's buttons (scouting etc.). Likely the B54 keep-in-view watcher (378 rec105Watch/rec105Show: scrollTop fixes per redraw + smooth scrollIntoView fighting). Fix, keep the panel steady.
- Answers B70–B71 (2026-10-17): Y1a (Yard: one top band — Doctore face/name/level | Time −/+ and the level ladder | the four Intensity
  buttons, shorter — then ONE row: the Team drill card shrunk to its content (‹ › kept) + the "Who drills" chips filling the right half; the squad /
  own sessions / Trial move up) · Y2a (Lock in sits in the banner beside the hours, always visible) · Y3 ok (drop the Beast pen's duplicate
  "Needs 2 hours" tooltip) · Y4a (Armory, Recruiting, Training Yard banners = the slim Infirmary/Roster banner: same height, face left, title +
  one line; the Yard's big "0 of 10 h" plate and Recruiting's counters become chips in the banner).
- B73 (his ask): the Lanista (me) and the five World tab banners (290-v100world: news, league, imp, trophy, sched) slimmer + compact like the Infirmary/Roster banner (extends Y4a). Would REPLACE the v1.0 World painted banners (his W picks 2026-10-11): the League podium and the Tituli trophy plinths live in those banners today.
