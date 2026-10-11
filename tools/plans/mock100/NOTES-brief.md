# v1.0 mock — the Event Briefing (after Begin Event)

Mock: `tools/plans/mock100/brief.html` — `#classic` (Democritus, Roma), `#special` (Golden Eagle, Leptis Magna, night, 2 teams),
`#phone` (two 390 px phone frames on a wide screen; at 390 px it is the classic phone layout).
Shots: `sh tools/plans/mock100/brief_shots.sh` → `brief_<state>.png` (1440×900) + `brief_<state>_390.png` + `brief_classic_390_full.png`.
Today's game: `brief_before_classic/special(_390).png` (`node tools/plans/mock100/brief_before.js`; SETTINGS.briefing forced on).

## What changes vs today (07-ui briefingHTML / eventBriefing, 93-v71 .brsr)
- Plain modal ("📋 The briefing", full-width red "⚔ To the sand") → its own framed window that fits ONE screen at 1440×900 (no scroll).
- HEADER: event card · kicker (CLASSIC / TEAMS · round I of III / SPECIAL EVENT) · big name · Summa Rudis medallion as a chip beside the
  name (classics only) · meta pills (📍 city · 📅 date · ☀ Day / ☾ Night · gladiators/teams · stands) · gold "How to win" bar with the wheat icon.
- FLAVIUS in the top right: his painted mood face (smug / pleased) + one spoken line in a bubble.
- ROUNDS = the Play Now rounds table: Ⅰ/Ⅱ/Ⅲ, name, zone size, PvE/PvP/CF/CA chips (not-allowed = red, struck through; hover = the
  rule), "⏱ Ends when", reward with the coin and wheat icons; the round about to start is marked FIRST (later: NOW / done).
- RULES & CONDITIONS (new): compact cards, two columns — event rules gold-edged, printed ones plain, digital ones purple with ◆ DIGITAL
  (Focus needs 3 movement, Focus on a Blessing +1, chest pickup costs 1 movement, eagle/CF offerings pay in no-CF rounds).
- ON THE SAND: one card per seat — token round, name, class in its colour, YOU / CPU · mind, team chip (A blue / B orange), mini on the right.
- FOOTER: "Reopen any time: 📋 Event" + one sandstone primary "Enter the arena" (2a style).
- The bottom line "🚫 marks what is not allowed…" becomes a one-line legend under the rounds.
- PHONE: card thumb + title, Flavius as a slim bubble row, rounds stacked, first 3 rule cards + "＋ N more rules ▾", seats swipe sideways,
  "Enter the arena" fixed at the bottom.
- Also fixed in the Play Now mock: round zones now read 13×13 / 9×9 / 5×5 (from the game's own briefing).

## Placeholders in the mock
- Seat circles show the class token rounds (ptokf81_*); the game would show each gladiator's own portrait (face99) there.
- Flavius's opening lines ("Rome is watching. Do not bore me.", "Gold for the swift. Sand for the slow.") are new text — no opening-line pool exists today.
