# K · Acta Diurna restyle — mock-up notes (v1.02)

Mock: `tools/plans/mock102/acta.html` (self-contained; art from `assets/`). States: default = a big week (Week III),
`#quiet` = a quiet week (Week II), `#week1`; the bottom-left MOCK bar switches between them, and ◀ ▶ (or the arrow keys)
walk the three stored editions. His picks followed: **1b** one page, reorganised · **2a** your house leads when anything
happened to it · **3a** last 12 editions browsable · **4a** papyrus, ink rules, drop caps, Roman serif heads, sepia
engraving, no emoji in headlines, stats strip shows only non-zero numbers.

Measured: 1440×900 = exactly one screen (scrollHeight 900, both states); 390×844 = one column, no sideways scroll
(~2.7 screens long). Fonts: Cinzel (headlines), IM Fell English (text), Marcellus SC (buttons) from Google Fonts with
serif fallbacks.

## What moves where (today → mock)

| Today (17-manager `paperHTML`) | Mock |
|---|---|
| Masthead: title + one subtitle line, "Start your next week →" button top-left | Masthead: ◀ Week III ▶ edition browser left · ACTA DIURNA centre (season/week/city under it) · price + omen right. The start button moves to the Next week ribbon at the bottom. |
| Numbers strip under the lead text, always 5 numbers (incl. zeros) | Strip under the masthead, full width, **only non-zero numbers** (bouts, purses, top CF, fallen, empire events, spectators). |
| Lead: portrait + figure token beside a headline + body | Lead: **sepia engraving** (oval frame, CSS filter + hatch overlay) · kicker (why it leads) · headline · italic deck · body in two ink-ruled columns with a drop cap · right "fact box" (event card + 3–4 facts: upset, purse, CF, odds). Empire lead → a map engraving instead of the portrait. |
| "Also this week" | Folded into the columns (your house / the arena results) — the second-best stories are now just rows there. |
| (no "your house" section; your fighters only marked "(yours)") | **Your House** column: each of your fighters' result this week (face, line, purse, WON/LOST), Signed, From the Training Yard, treasury + this week's change. |
| Obituaries (left column, long) | **The Arena** column: the rest of the card's results, then **In Memoriam** (centred, ✝, short). Empty → "No one fell this week." |
| The empire this week (list) | **The Empire** column: a map inset (map.jpg, numbered pins) + the numbered list with crowd effect lines. |
| Darwinius awards, Overheard, In brief, (284) Rabble-rousers printed under Darwinius | One **fun row**: Darwinius · Rabble-rousers · Overheard · In brief, side by side. |
| Ludus standings top X, Sand's finest top X, Swords for hire top V (right column) | **Classifieds** corner: Swords for hire top 3 → **Scout ▸** (Recruiting · Free agents), The League top 2 + your place → **League ▸**, Sand's finest top 5 (yours highlighted). |
| From the training yard (right column) | Into Your House (one line). |
| Next week (bottom block, several rows) | **Next week ribbon** (one porphyry band): week + city or Bye, the card (tier · event · purse · names), bad blood, and the sandstone primary **▶ Start next week**. |
| Footer joke | kept, one line. |

Nothing is removed except the long rows; the standings/finest/hire lists are cut from 10/10/5 rows to 3/5/3 (the full
tables live in League and Recruiting, which the links open).

## How the lead story is chosen (2a)

Score candidates as today (`composeWeekPaper` cands), but in two tiers. **Tier 1 — your house** (any candidate wins over
all of tier 2):

1. Your house wins the season (week 12 title) or a Grand Games / invitational title.
2. One of your fighters died (the most famous one).
3. One of your fighters won an **upset** (beat a field rated ≥8 above him, or odds ≥4 to 1) — the mock's case.
4. One of your fighters won the Main event.
5. A big signing (rated B or better, or the week's highest wage) / an Immortalis stamp.
6. Any other win by your fighters (best purse).

**Tier 2 — the league and the empire** (today's scoring): season title elsewhere → the most famous death → the Main event
winner → the biggest empire event (sev × 30 + mood + attendance) → "Trouble in the barracks" (a bad news line) →
"A quiet week on the sand". A loss alone is not a moment (the quiet mock: your fighters lost → the empire leads).
The kicker line says why the story leads ("Main event at Capua · your house", "The empire · Pompeii").

## Past editions (3a)

- Keep the **last 12** editions in the world (`w.acta102`, newest last; `w.lastPaper` = the newest stays for old code).
- Trim each before storing: plain text (no HTML, no `gArt`), fighter **ids** + names, lists cut to what the page shows
  (3 hire, 3 standings rows incl. yours, 5 finest, ≤3 empire, ≤3 Darwinius/Overheard/brief, rabble 3), no Next week
  block needed for old editions beyond one line — the ribbon on a past edition reads "As printed then" and its button is "Back to this week ▶" (mocked).
- Size: the mock's editions are 2.2–3.9 KB as JSON → **~3.5 KB × 12 ≈ 40 KB** a world (today's single lastPaper with HTML
  and top-10 lists is ~8–10 KB). No migration: old worlds start with one stored edition (their lastPaper).
- ◀ ▶ in the masthead + Left/Right keys; "edition N of M kept · up to 12". The Ludus Archives keep their own bound copies.

## Questions for him

1. **Classifieds links** — Scout ▸ opens: (a) Recruiting on the Free agents list (as mocked) · (b) the first hire's
   dossier directly · (c) both: each name opens his dossier, Scout ▸ the list.
2. **Your House on a bye / no bouts** — (a) show the week's yard, infirmary and money lines only · (b) hide the column
   and widen the other two · (c) print "Ludus Aquilae did not fight this week" + the yard line.
3. **Old editions** — (a) the same page, read-only, ribbon "As printed then" + Back to this week (mocked) · (b) a smaller
   "clipping" view (lead + results only) · (c) keep only the lead story of older editions to save space.
4. **Portrait engraving** — (a) the fighter's own game portrait (face99) run through the sepia/hatch filter · (b) his
   printed class card figure (as mocked, faceless) · (c) both: portrait in the oval, class card figure in the fact box.
5. **Where it opens** — (a) automatically after "End the week", as today, then ▶ Start next week · (b) only from News /
   Your ludus (a 📜 line on the desk) · (c) automatically only when your house leads.
