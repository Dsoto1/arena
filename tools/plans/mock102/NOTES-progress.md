# v1.02 workstream I — online progression (mock: tools/plans/mock102/progress.html)

Open the file from the repo (assets load from ../../../assets/). Tabs: 1 Results tally (▶ Replay; scenarios
Victory · Survived · Custom · He fell) · 2 Level up · 3 Domus · XP bar · 4 Release · Notes (numbers).
Hashes for direct links: `#tally`, `#tally-survived`, `#tally-custom`, `#tally-fell`, `#levelup`, `#domus`,
`#release`, `#release-worthy`, `#notes`.

## What the mock proposes (numbers)
- **XP per match** = round( f × K × ( min(CF, 40) + 20 if survived + 15 if won ) ).
  f = today's table factor × CPU cut (2 humans ×0.5, 3 ×0.75, 4+ ×1; CPU-played seat ×0.25).
  K = 1 Ranked, 0.5 Custom, 0 if he fell. Custom XP ≤ 300 a UTC day per gladiator.
  A typical survived Ranked bout ≈ 44 XP; a win with 23 CF = 58 XP.
- **Level curve**: level n → n+1 costs 100 + 30·(n−1) XP; cap level 20 = 7,030 XP ≈ 160 survived Ranked bouts
  (level 5 ≈ 13 bouts, level 10 ≈ 45, level 15 ≈ 95).
- **Level-up**: +1 to one rating of his choice (Speed / Strength / Intelligence / Luck / Charisma, max 99); the
  card shows the band it reaches (76 / 87 / 96 …) and what it gives on the sand. Spent on the server one point at a
  time (request id), never while he is in a room or a live match. "Later" keeps the point (it glows on the Domus).
- **Results tally** on return to the Online menu: CF → coin (to the house treasury) → Glory (rank-up flourish) →
  XP (level-up flourish last), ≈ 5 s, click skips, Reduce motion = end state at once; Continue opens the level-up
  screen when a point was earned. Data = `char.last102`, shown once (route `char.seen102`).
- **Domus**: XP bar under the name, above Glory; the ＋1 button glows when a point waits; slot cards show "Lv N";
  the Change class button is removed ("🔒 class set at creation").
- **Release**: in the slot card's ⋯ menu; popup lists the gear going to the house shelf (Issued pieces vanish),
  the Hall verdict (hallWorthy → "Released" plaque, else damnatio memoriae = erased), and a typed-name confirm
  checked on the server. Refused in a room / live match.
- **Server shape**: `char.xp`, `char.lv`, `char.pts` (unspent), `char.lvlog` [[lv,stat,at]], `char.last102`;
  routes `char.lvup {id,k,rid}`, `char.release {id,name,rid}`, `char.seen102 {id}`; the class-change route refuses
  (`class_fixed`).

## Questions for Virgilante (multiple choice — my pick marked ★)

1. **Today every survived Ranked bout already gives +1 to the LOWEST rating (+1 more for a win), ≈ 190 points over
   150 bouts. Twenty levels at +1 is only 19 points. How should the two fit?**
   a) ★ Keep the automatic growth; the level point is extra, his own choice (nothing taken from today's gladiators).
   b) Levels REPLACE the automatic growth, +1 a level (growth becomes much slower: ~+19 over a career).
   c) Levels replace it, but each level gives more points to spread (e.g. +5 a level ≈ +95 by level 20).
   d) Levels replace it, +1 a level, and the curve is much shorter (≈ 1 level every 1.5 bouts, ~100 levels).

2. **Respec (move points back)?**
   a) ★ Never — choices are final (a respec lets a house re-tune for each event).
   b) Once per gladiator, free.
   c) Paid from the treasury (e.g. 100 coin a point), cooldown a week.

3. **After level 20?**
   a) ★ Cap at 20; XP keeps counting and the bar shows a laurel (prestige look only).
   b) No cap: +1 every 640 XP until all five ratings are 99.
   c) Cap at 20, extra XP turns into coin for the treasury.

4. **The Studio's "Poor below 60" (−1 movement / damage etc., your v0.95 answer 1a) is not online. Online ratings
   start at 55. Should it apply online?**
   a) ★ No — online keeps 50–99 with no penalty band (the level-up screen draws the 40–99 scale only for reference).
   b) Yes — new gladiators start Poor and the first level-ups climb out of it.

5. **A released gladiator and the Domus rank (best 4 living + 20% of all fallen Glory):**
   a) ★ Counts like the fallen only if he was Hall-worthy; otherwise nothing (release can never raise a house's rank).
   b) Always counts like the fallen.
   c) Never counts.

6. **Existing gladiators when v1.02 lands:**
   a) ★ Their XP is filled in from their record (CF ≤ 40 a bout, survived, wins) → their level; no back points
      (they already grew automatically).
   b) Same, plus the level-up points they would have earned, to spend now.
   c) Everyone starts at level 1.

7. **Custom matches and XP:**
   a) ★ Half XP, ≤ 300 a day per gladiator.
   b) Full XP.
   c) No XP (Ranked only).

8. **When does the results tally show?**
   a) ★ After every match he fought (Ranked and Custom), once, on the next Online menu — also after a reload or on
      another device.
   b) Ranked only.
   c) Only when something big happened (rank up, level up, a fall).

9. **Do other lanistas see the level?**
   a) ★ Yes — "Lv N" beside the rank on seats, the lobby list, Who's online and the house card.
   b) Only on the house card.
   c) No, it is private.

10. **Release while the gladiator owns named (chest) pieces:**
    a) ★ All of it goes to the house shelf (printed, named, offerings) — it never reaches Flavius's chest or the auction.
    b) Named pieces go back to Flavius's chest (like an unlooted death) — release costs something.

11. **The Hall plaque for a released great gladiator:**
    a) ★ "Released" plus the ratings chosen at each level (his lvlog).
    b) The same plaque as a gladiator who fell, no "Released" mark.

12. **Class change removed — what about houses that already paid 100 coin to change a class?**
    a) ★ Nothing to undo — the class they hold now is final.
    b) Refund the 100 coin to the treasury once.
