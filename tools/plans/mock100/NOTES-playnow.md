# v1.0 mock — Play Now, sandstone submenus, sandstone buttons

Mock: `tools/plans/mock100/playnow.html` (hashes `#1a` `#hotseat` `#1c` `#1c-mgr` `#1d` `#buttons`; `#menu`, `#1d-mid` are frames for 1d).
Shots: `sh tools/plans/mock100/pn_shots.sh` → `pn_<hash>.png` (1440×900), `pn_<hash>_390.png` (390×844), `pn_1a_full.png`, `pn_hotseat_full.png`.
Today's game for comparison: `pn_before_*.png` (menu, Play Now pop-up, Play Now setup; 1440 + 390).

## What changes vs today
- **1a Where + What merge into one "The event" panel:** event strip on top, then event card | MAP (right of the card, city select + 🎲 + class modifiers under it) | name, one-line blurb and the **rounds table** (one row each: Ⅰ/Ⅱ/Ⅲ, name, zone, PvE/PvP/CF/CA chips — off = struck through, "Ends when", reward with coin icon). Replaces the one-line `R1 … · R2 …` chip row.
- **Follow the schedule** leaves the top bar: it is the first row of Options (switch + "this week: Democritus in Roma" + 📅 Season schedule). The top bar keeps only the date chip.
- Options = one compact 3-column grid (shorter labels; Roma's modifiers greyed when the city has none).
- **Begin Event** = the sandstone primary button (2a) in the upper-right group (summary · 🎲 · Begin Event).
- **1e Hot seat** = the same page: title "Hot Seat" + 🪑 ONE SCREEN tag, no Festival/Missio/Tournament tabs, a blue "Pass the device" strip (Mandata face down, hold 👁 to peek; the existing "Turn the board to each player" switch, SETTINGS.hsTurn90), seats tagged 👤 PLAYER N with a name field and Human/CPU switch, blue outline on human seats.
- **1c submenus** (Play Now, Manager): plain modals → a carved sandstone tablet: engraved title, round stone ✕ stud, a recessed dark well holding sandstone slabs; the main choice (New event / Continue) is the porphyry + gold-leaf slab; Back is a small slab bottom-left. Same buttons and values as today (incl. 🛡 Your Play Now Gladiators).
- **1d background shift:** on open the menu dims to 50%, blurs 3.5 px, scales 1.045 and drops 14 px (leans toward the tablet), warm glow behind the tablet; 320 ms in / 220 ms out. Reduce motion / Calm = dim only; phones skip the blur.
- **2a sandstone button** (`.sb`): one style, three kinds (Primary porphyry + gold, Secondary plain sandstone, Danger basalt + red-gold) × three sizes (58/46/34 px); states rest / hover-focus (lift + gold rim) / pressed (sinks 3 px, edge gone) / disabled (greyed). Only for big doors — panel controls keep today's dark style.
- **5d lesson complete:** "Back to menu" (secondary) + "Next lesson ▸" (primary) as large slabs.

## His answers (built in the mock)
- A1a rounds table always open.
- A2a Follow the schedule ON locks event + city: dashed 🔒 bar "Following the schedule" with Unlock · switch off, other event cards greyed, map dimmed with "🔒 Roma · this week", city select + 🎲 greyed (#1a and #hotseat).
- A3 (lead's pick) hot seat keeps the pass-the-device strip + a slim "👤 Marcus — your turn" ribbon that slides over the top bar for ~1.5 s at each human turn, never over the board (#hotseat).
- A4 (lead's pick) submenus: centred tablet on desktop/tablet; on phones a bottom sheet that slides up (grab handle, rounded top, safe-area padding; menu dims + lifts, no blur) (#1c / #1c-mgr at 390).
- A5 danger = CARBON-BLACK slab (matte black, faint weave + soot noise, red-gold letters, red rim on hover), not basalt; #buttons has its own Danger states row.
