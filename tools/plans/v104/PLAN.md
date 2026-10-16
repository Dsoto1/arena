# v1.04 build plan — the Manager season rework (his answers: tools/plans/v103/NOTES.md + tools/plans/v104/NOTES.md)

Four builders, one module each (last before 08-setup, in this build order). Shared hooks below — use them, don't reach into another builder's module.

## A · 348-v104season (src/manager) — the season's shape
- Calendar: byes weeks 4 & 12 (BYE_WKS), Rivalry Week 11 (77 rivalLock letter → week 10). Running careers switch at their next season start (SAVE_MIGRATIONS '1.04').
- SUPERBUS PLAYOFFS (replaces "top 4 seated in the final"): seeds by league points. Week 12 = bye for seeds 1–4 (their rest) + ROUND 1 for seeds 5–12 as two
  Classic 4-player events; top 2 of each by the event's own ranking advance (his 1a). Week 13 = two SEMIFINALS (2 bye houses + 2 qualifiers each), top 2 advance.
  Week 14 = the SUPERBUS FINAL (4 houses). Each house sends one gladiator per round, chosen each round (2a); prize grows each round survived, champion takes
  the Superbus (3a); knocked-out / unqualified houses watch + bet (4a). The player's bouts are played like Match Week bouts (watch / simulate).
- BRACKET VIEW: during the playoff weeks AND late season (from week 9) as projected seeds "if the season ended today". Reachable from League + Match Week.
- SUPERBUS WEEK end to end (E8a): regal card (345's .sb103c), trophy banner, entrants letter the week before, podium screen after the final → off-season.
- OFF-SEASON WEEK after the final (N2a): no bouts; Season in Review letter (who came/went, finances, record, titles, the fallen, band-ups); LEAGUE AWARDS
  (E2a: Gladiator of the Year, Best Record, Rookie of the Year, Most Feared, + coin/fame, → Tituli); CONTRACT RENEWALS (E4a: expiring fighters ask for a raise
  by record; benched + unhappy may ask to leave); buildings finish (D's hook); retirements (B's hook); recruiting open. Then week 1.
- HOOKS it provides: `OFF104.on(fn)` — fn(w, ctx) runs during the off-season week, in order; `OFF104.active(w)`; BUS 'season.offseason' {w}.

## B · 349-v104careers (src/manager) — age, careers, fame
- AGE + FIVE CAREER KINDS (E3; his a): Meteor 1/100 (prime 2, +8 OVR, steep fade) · Blazer 1/10 (3–4, +4, fast) · Common ~3/4 (4–6) · Steady 1/10 (8–12, slow)
  · Ageless 1/150 (15–25, very slow); per-fighter spread, some late bloomers; from a hash of the fighter id (never the dice). 1 season = 1 year, new fighters
  18–30. Rising (bonus growth) / prime (hold) / fading (loss per season, Speed first, Intelligence last; training slows it). Applies to every fighter in the world.
- SCOUTING: free agent card "Form: Rising/Prime/Fading · prime ~N seasons left", sharpens with scouting like the grades; the kind is named only on a sure read
  (a rough read = "long career" / "short, bright career"). Own fighters: the Doctore's level sharpens the read.
- RETIREMENT at the off-season (OFF104.on): faded veterans may retire (older + lower = likelier); farewell letter, Annals line, Hall plaque if great.
  A retired GREAT may stay as Doctore or Barracks master (that advisor at level 3) (A3a).
- EXISTING CAREERS (A1a): every fighter gets an age + curve at their first off-season; nobody fades before one season has passed. Manager only (A4a).
- FAME FOLLOWS RESULTS (N3a): fame gain scaled by win rate; a losing season drifts fame down; the playoff seeding by league points means a losing house
  can't take the Superbus. ADVISOR PACE (N3a 2nd a): each advisor level needs more — about one level a season.

## C · 350-v104roster (src/manager) — roster, loans, trades
- ROSTER CAP grows (N5 cap a): start 8, up to the hard cap 15 by Barracks level + Barracks master level. REPLACES 345's flat MGR_CAP103=15 (read the cap from
  one function `cap104(m)` and make 345's checks use it). Over-cap careers (X1a): nobody released, no signing/borrowing until under, desk row, wages ABOVE the
  cap cost 25% more.
- 4 + 4 (N5 starters a): First team = 4 starters (Bouts I–III + the 4th covers injuries/specials), Second team = 4 bench; the rest Rostered; Lent out apart.
  REPLACES 229's 3 starter tablets (g.slot95 stays for Bouts I–III; add the 4th first-team slot).
- THE ROSTER PAGE (N5 layout a + order a): ONE sortable list left (tier chip, name, OVR, W–L, wage, fatigue, contract weeks; sort by any column; group headers
  First team / Second team / Rostered / Lent out; Promote/Bench/Lend from a row ⋯ menu or drag between groups; within a group sorted by OVR, bout number as a
  chip). RIGHT side = ONLY the selected gladiator: portrait, ratings, record, then the contract tabula with the "Keeping him" actions folded inside it.
  REPLACES 298's starter tablets + bench/loans list + the separate Keeping-him block.
- LOAN CONTRACT (N6a): lump sum up front + wage under his terms; after 2+ wins on the loan the borrower may make a buy-out offer at the end (you accept/refuse).
  Running loans finish on the old terms (X2). REPLACES 343's weekly fee for new loans.
- TRADE BUNDLES (E1a): from a rival's team page offer 2+ of yours for 1 of theirs; once a week; a declined offer with interest returns as a counter-offer
  letter next week.
- Rivals obey the cap, 4+4, loan contracts (X5).

## D · 351-v104ward (src/manager) — recruiting, infirmary, buildings
- RECRUITING (N4a): fewer Recruiter's hours; each extra action on the same recruit in one week costs more; OFFERS ANSWERED NEXT WEEK; recruits can refuse,
  sign with a rival, or be scared off by a lowball; the trial bout needs 2+ earlier actions on an earlier week; board holds 6 + Recruiter level. Rivals too.
- INFIRMARY, TWO WINGS (R1, his 1a 2a 3a 4): banner Medicus face + ONE week hours bar split wound care / recovery; left list 🩸 Wounded / 💤 Weary (rows: HP +
  fatigue mini-bars, Treated ✓ / Rested ✓); centre the marble statue (+ fatigue gauge Fresh/Tired/Worn and next week's band when recovery is booked); right
  plate tabs ⚕ Ward (Medicus, surgeon, Hygeia, beds, Asclepius) | ♨ Baths (bathhouse, rub-down 1 h, Care routine 1 h/week while it runs, Rest week 0 h on a
  "bench" plate), opening on the tab that fits the fighter; each plate shows hours + effect; bottom: the week's tabula (booked care, hours used/left, ★ order).
  Medicus +3 h a week; training hours −2. REPLACES the Training Yard's Recovery section (318) and the separate bathhouse block. Readable, logical, usable.
- MEDICUS QUEUE (N7a): one click treats the wounded in the suggested order with this week's hours; a warning before Match Week when the healthy starters
  can't fill your bouts.
- BUILDINGS TAKE WEEKS (N10a): level N takes N weeks; one project at a time, shown on the banner; finishes at week end (and OFF104 week).
  Promote / Upgrade School popups get art tiles (N9a): the building now and its next level (scene100 / existing art), Build only if affordable.

## After the builders (lead)
- Merge, X3 mgrsim 3 seasons before/after (treasury, wins, fame, titles, roster sizes, can a 10–22 house win) → report to him BEFORE release.
- X4 lessons (36-mtutor) + first hour (308) follow the new rules. Translations. Full GitHub run. Beta. Release.
