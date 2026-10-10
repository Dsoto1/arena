# Recruiting dossier: v1.0 mock (his concept `ref_recruit.jpg`)

Files: `recruit.html` (states `#scout` `#court` `#offer` `#phone`), shots `recruit_<state>_1440.png` (court also `_2` = lower half),
`recruit_<state>_390*.png` (phone, scrolled 1–5). BEFORE shots of the live v0.99 game: `before_recruit_step1-3_{1440,390}.png`.
Scripts: `recruit_before.js` (before shots), `recruit_extract.js` (real face, champion face, rival banners → `img/rec_*`), `recruit_shot.js`.
All data shapes are the real ones: 249-v98rec (REC98, PITCH98, DEAL98), 157 WANTS88, 17 MGR_KEYS/MOTIVES/suitors(), 105 TONES74.

## Slips in the AI picture, fixed in the mock
- Strength and Charisma were filed under "Personality traits", and a separate "Core attributes" block repeated the grades. The five **ratings**
  (Speed Strength Intelligence Luck Charisma) + Overall now live in the Stats Tablet only. **Personality** = Temper · Wants · Cares about · Dealbreaker.
- The tablet printed numbers (10, 15, 12). Recruiting III shows **no rating numbers before signing**, so the tablet shows grades + precision dots only.
- "Daily personal notes" → the note is **once a week** (TONES74, `g.note74`). Praise/Promise/Plain truth effects use the real wording.
- Typos ("Doctoze", "withan", "ats signing"), "Aurora … ♂", and "Honor A+" next to "Greed F" (a fresh house is all D) were replaced with a believable mid-career house.
- Feast/gift second numbers (120 / 160) had no meaning. They now show cost + cadence only (feast every 3 weeks, gift once a week).
- The image's grade-plus-gain on pitches is kept, and the gains follow REC98.pitch: e.g. Yard = Discipline B 6 × 2 (his wish: Rudis path) + Training 40% × 10 = **+16**.

## Element by element vs today
| Element | Today (v0.99) | Mock | Status |
|---|---|---|---|
| Laurel-framed portrait | `gArt` square | same face in a gold ring + laurel SVG | restyle |
| Name, class, age, city, fame, record, stars, street grade, laurels | card head | same | restyle |
| ⇄ Compare | button | same | exists |
| Wants | "🎯 Wants grade all five to learn" row | chip in the profile ("grade all five to learn" → the wants) | restyle |
| ⚖ Rival bid in N weeks | chip (157 court88) | red chip | exists |
| Grade blocks + precision dots | `.gs98` strip, 6 blocks | rows on a **Stats Tablet** beside a sepia sketch of avatar.png | restyle |
| Pentagon chart | — | grades as a polygon. A dashed band shows how sure each grade is (wider when rough). Ungraded axes = "?" | **NEW** |
| Personality (temper/wants/cares/dealbreaker) | `.pe98` rows / 🔒 lock | 4 framed cells. The lock names the next action | restyle |
| ① Scout ② Court ③ Offer | small pill tabs | 3 big buttons (gold / green / red), sticky on phones | restyle |
| Recruiter's hours (20/wk, ≤8 on one, pips) | header + pips | same + gold pips for hours spent on him | restyle |
| 5 scout actions (ask 1 h, watch 2 h, cup 2 h, study 3 h, trial 5 h + 4 coin) | buttons | cards with a small scene, "✓ this week", ★ ADVISED | restyle |
| House grades (7 lanista traits) | chips | chips. A **green outline** marks the ones he cares about (today `.hot`) | restyle |
| 6 pitches (PITCH98) | cards (grade, want, motive, projection) | same data + a vignette per pitch + gain badge | restyle |
| Win him over: feast / gift | 2 buttons | 2 cards with icon art + coin cost | restyle |
| Suitors | plain list (top 4 + you) | panel with house banners (`mgrFlagOf`), coloured bars, "you" divider | restyle |
| "He signs at about N · you are 3rd · X bids in 2 weeks" | parts in the verdict + chip | one line under Suitors | restyle (joins existing numbers) |
| Private note (Praise / Promise / Plain truth) | 3 buttons with fit | parchment scroll, 3 columns, fit badge, the best tone lit | restyle |
| Offer (wage slider, weeks, bonus, pledge, verdict, button) | as is | restyled only | exists |
| Free-agent list | wide table | narrowed list column (name, class·city, street grade, interest) | layout change |

## What it implies (new work)
1. **Stats chart** (pentagon + certainty band). Display only, from `rec98Est` + precision. It must not leak numbers: no axis scale, grades only.
2. **Dossier layout**: the card gets ~860 px. The list narrows to a 300 px column (rating, fit and ask columns fold into the row/hover).
3. **Scene vignettes**: 5 scout + 6 pitch + 2 win-over SVGs in the roomScene73 flat style (tiny, cached strings, an Off path under calm/idle is not needed — static).
4. **Suitors with banners**: `suitors()` already exists. Only the look + the "signs at ~N" line join it. Not a new mechanic.
5. **Send a gift** already exists (gift2, coin). Only a restyle, no new feature.
6. Phone: one column, sticky step buttons, tablet → chart under the rows, notes stack.

## Open questions for Virgilante
1. Layout at desktop: (a) dossier beside a narrowed list (mock) · (b) dossier as a full-width window over the list · (c) keep today's 3 columns, restyle only.
2. Pentagon chart: (a) yes, with the certainty band · (b) yes, without the band · (c) no chart, the tablet rows are enough.
3. The sketched figure on the tablet: (a) sepia avatar.png (mock) · (b) his class card art (cls_<key>.webp) · (c) the gladiator's 3D token/mini.
4. Pitch vignettes: (a) flat SVG scenes like the room banners (mock) · (b) crops of his own art when he sends some · (c) icons only.
5. Personality block placement: (a) always above the three steps (mock) · (b) inside ① Scout only · (c) inside ② Court beside the house grades.
6. Private notes: (a) parchment scroll at the bottom of Court (mock) · (b) a 4th small tab · (c) keep today's three buttons.
7. Feast/gift cards: (a) cost + cadence only (mock) · (b) also preview the interest they would win (like the pitch badges: new math on screen).

## Revision 2 (his answers E1–E4)
- **E1 uniform:** every card and row has a fixed height, and every label sits on one line (shorter wording; the full text is in a hover `title`).
  - Free-agent list: one line per row, fixed columns ★ · face · Name · Class · Grade · Int.
  - House grades: a 4-column grid with each chip right-aligned.
  - Pitches: 2 × 3 cards of the same height. Rows are title + gain / trait + chip at a fixed x / wish + motive slot ("no wish · no motive" when empty) / one-line projection; the scene sits right.
  - Scout actions: 122 px cards. Win-over cards: 76 px. Suitors rows: 28 px. Note columns: 84 px with the fit badge beside the title. Offer lines: one line each.
- **E2:** `#chart` shows the tablet three ways: (a) chart + certainty band, (b) chart without the band, (c) grade rows only. Each is shown for a barely scouted recruit (one ask around) and a fully graded one (watch + cup + study). Shots: `recruit_chart_1440.png`, `recruit_chart_390*.png`.
- **E3a** (sepia avatar sketch) and **E4a** (flat SVG scenes) are kept.
