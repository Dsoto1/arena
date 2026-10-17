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
