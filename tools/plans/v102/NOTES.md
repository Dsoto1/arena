# v1.02 — his v1.01 notes (2026-10-14, tools/plans/v102/101notes.pdf text below), his answers 1a 2a 3a 4a 5(house hours?) 6a 7a 8a 9a 10a 11all

Every module goes in its topic folder, listed in build.sh before src/core/08-setup.js; header comment lists the items (ids below).
Each agent: own new test tools/tests/tv102<x>.js (added to tools/runreg.sh DEFAULT), run it + `sh build.sh` (SYNTAX_OK) locally only;
never the full suite. New player text through _T (no translations — the lead runs tools/i18n after merging). Kill switch localStorage
flavius_v102<x>off=1 where it is a display change. Commit on your worktree branch; the lead merges with tools/ci/merge.sh.

## A · Manager fixes (src/manager/332-v102mgrfix.js, test tv102a)
- M1 Regrow a lost limb (Hygeia / surgeon regrow): ONE limb a week per fighter; the limb is back only when that week ENDS (endWeek);
  the following week +20 fatigue per limb regrown (operation). The cure UI says so.
- M2 No 5-bout Match Week: an invitational/special may not be placed on a day already holding a special (296 any100 days + specWeekStart /
  invitationals). At most 4 bouts a week (3 classics + 1 special).
- M3 Opening Your ludus (tab ludus, by rail or any path) always shows the main view: close the Letters drawer (.lu100mail), the advisor
  popover (#lu100pop), the run panel (LU100.panel), any Promote popup.
- M4 League → Schedule (Season tab billing, 290 wd100bill / cm_set): specials/invitationals can NOT be billed there — only through the
  invitation letter / invitationals list. Classic bouts unchanged.
- M7 Care routine (183 data-care90 / ROUT87 'care'): the button says what it costs: "2 of the Training Yard's hours a week, no drills".
  (He asked "house hours?" — the lead answers him; keep the wording plain: "Training Yard hours".)
- M8 Infirmary: "Hire a medicus" (banner) and Hygeia's Blessing move ABOVE the patient list on the left, laid out properly.
- M14 Infirmary "Build Valetudinarium" care option: disabled (with the reason) when the treasury can't pay.
- M17 Leather Tasset (legwrapsU) art faces the wrong way in the Armory/market tiles + thumbnails (his shots: the pair reads Λ, should
  match the other leg pairs). Check armthumb81_legwrapsU / ARM_LEFTART / armSideArt91 and every place the thumb shows.
- M18 Match Week, entering a fighter in an event with an entry fee (296 any100 specials, Naumachia etc.): fighters can't be picked when the
  treasury can't pay; unlocks as soon as it can (same week).
- M19 The enter-an-event fighter picker (#any100pk + classic bout picker): beside fatigue, show 🛏 in bed / 💤 resting (and why greyed).
- M20 Naumachia (team special): after earning coin he could not take a seat — "cannot bump a rival house seat, only a free agent" while 2
  free agents sat in it. Any free-agent seat must be takeable when the fee is affordable. Reproduce + fix (any100Enter / side logic).

## B · Manager changes (src/manager/333-v102mgr.js, test tv102b)
- M5 (3a) League points: 1st 3 · 2nd 2 · 3rd 1 · else 0; a podium counts ONLY if the fighter survived the bout. Standings show the record as
  podiums "🥇2 🥈1 🥉3 · 7 bouts" instead of W-L; points ⓘ (LP100_TIP) updated; League prizes follow points. SAVE_MIGRATIONS if stored.
  Rivals the same. Check 231 standings, 290 League view, 17 table.
- M6 (4a) Recruiting balance: Trial bout 8 h + 15 coin and needs at least one cheaper action on that recruit first; cheaper actions give
  more precision per hour (slow scouting = cheaper, takes weeks); the advisor's ★ only from Recruiter level 3+, chosen by value for cost
  (estimated grade, asking price, hours left, roster need). Check with a quick sim/script that a typical recruit takes 2–3 weeks cheap or
  1 week expensive.
- M9 (6a) Team-event purse: split among the WINNING side's survivors by CF earned in that bout (not equal); a hired partner's share still
  goes to the hirer (296 any100).
- M10 (7a) The Council: only two words remain — "The Council" (the frieze/tile) and "Consilium" (the advisor); "counsel"/"The Consilium's
  counsel" gone everywhere (UI + letters). Consilium's face moves to the BOTTOM LEFT of the strip in place of the building icon; the other
  advisors spread along it. His popover loses the Buildings section (it is a My Ludus tile already). His warnings (debt, wage runway, loan
  due, rival challenge — 297 lu2Counsel) become ONE "Consilium's report" row in Weekly tasks (desk 270/294) + a letter only when urgent.
  Lesson (36-mtutor) + tests that read the old words updated.
- M12 Recruiting list fits without horizontal scroll (vertical scroll ok) at 1280–1920 widths.
- M13 Recruiting Compare (MGR.cmp / data-reccmp) = side by side with the new visuals: portraits, Stats Tablet, personality cards, map
  inset, chips.
- M15 (8a) Mail dismiss: a quiet "File away ✓" text button at the bottom right of EVERY letter (incl. Week in review); the ✕ (w.rev99 etc.) goes.
- M16 A letter that has been READ no longer counts on the 📬 Letters button / rail oval, filed or not (league standings letter case).

## C · UI fixes (src/batches/334-v102fix.js, test tv102c)
- O1 Online Season tab banner (293 season.board, rail 🏆 Season): text misaligned, font colours hard to read; lay it out properly with room.
- O5 Online "Leave the Online arena" button (#btnOnlLeave and the landing's leave) = sandstone (306 sd100CSS).
- G7 Online armor art on auction lots (239 auc96Fix) + market/Domus tiles: scale the picture to fit its box keeping its aspect (no stretch).
- E1 Error log: 307-v100tituli online adapter (mode 'online', D.onl) does O.glads.reduce / .find while O.glads is not an array (Manager
  mode, Safari). Normalise (Array.isArray else Object.values / []).
- P1 Remove the "How the Blessings bag works" text (find it).
- P3 Play Now → Challenges tab (310 dc100Open, 321 G18 pn-tabs button): opens over the Play Now page (not the arena); its ✕ / Back return to
  Play Now, not the main menu.
- P4 The Challenges popup only as large as its content.
- S1 Creator Studio class designer: changing ANY option (padded wraps, etc.), Save, flickers (other tab contents visible for a moment) —
  likely 247 st98Apply re-tagging after studioRedraw; patch so the hidden sections never show (apply before paint / morph).
- S2 Character designer: updating an option flickers the nav counts (st77Counts .st77c, e.g. "Classes 3").
- S3 Custom class ability box titled "Extra"; remove the ability-name text box.
- S5 Studio Names → ✎ Use opens the character designer on its Basic tab.
- S6 Character designer: remove "Start a fresh one" (bottom right).
- S7 "Exit Creator Studio" button sandstone.
- G1 Manager mode "Manage saves" window and G2 main menu 💾 Saves window (108 savesHub76) restyled to the v1.0 look (sandstone buttons,
  card rows, the 300/306 look).
- G4 ONE sandstone ✕ for every window (the round stone stud of 300's .sand100 #mClose) — #mClose everywhere + the Studio/Manager/Online/
  Settings full-screen closers.
- G5 Coin and trophies fly to their counters like CF (277 hit100 .h100fly); a beast kill shows coin, CF and the trophy flying in.
- G6 Token-base switch (321 BS101 SETTINGS.bases101) also for BEAST tokens (312 beast100 sheets + minis); with bases off every model is
  drawn down so its feet touch the tile floor (no float).

## D · Designer restyle (src/studio/335-v102studio.js, test tv102d) — S4 (10a, all now)
The class designer + Beasts, Cohorts, Tokens, Tournament, Invitationals, Editors, Spectators tabs get the character designer's look
(262/247: larger tabs, font, the validator/checks panel, the same frame). Re-home controls (keep ids / data-* / handlers), like 262 did.

## E · 3D tokens (src/board/336-v102tok.js + tools/art/rig92 + anim100 re-render, test tv102e)
- D2 (9a) ONE fixed figure size all game, ~55% of a pillar's height on the board; never shrinks for weapons/armor/pose (retire the
  per-render shrink: game.js reach/fitTile/shaftFit scale-down). Long weapons are ANGLED (shaftFit rotation) and only the weapon may reach
  past the tile. Studio tokens (222/t93), online pictures (226), printed anim100 sheets (re-render with tools/art/anim100/make.js in the
  background, sev sets too) and minis all at that size. Watch the tok93.js 260 KB cap (tv100g).
- D1 The 3D poser (#t93m): adjust the held weapon/shield — rotate it about the grip (and slide along it), per hand, stored in the pose
  JSON (≤600 B), used by the sheet render.

## F · Resume after refresh (src/match/337-v102resume.js, test tv102f) — G3
Refreshing during a Play Now event (also mid CPU turn) or a hot-seat game brings the player back into it where it was: autosave at each
settled point (beginTurn / decision answered) into the existing Autosave slot (38-matchsave / 214 auto92 tab rules), and on load (boot)
a live autosave younger than N hours resumes straight in (like online's 234 auto96) — with a main-menu "⚔ Back to your match" fallback.
Online already returns (keep). Not for lessons, challenges keep their rules (attempt already counted), replays, e94 test play.

## Parked for design answers (lead asks him first)
- P2 Drafts for every Play Now event (he offered the draft-rules PDF).
- M11 Manager gear loop in step with online.
- O2/O3/O4 Online progression (class change, ratings growth via XP, release a gladiator, XP tally screen) — mock-up first, server change.
