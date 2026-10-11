# v1.0 mock-ups: Your ludus + Signing day (mock only, nothing built)

His PDF mock: `ludus_img/his_mock.png` (mockludusmanager, 2026-10-09). Today's screen: `before_ludus_1440.png`,
`before_ludus_1440_full.png`, `before_ludus_390.png`, `before_signing_1440.png` / `_390.png` (scripts `ludus_before.js`, `signing_before.js`;
run `sh build.sh` first). Data comes from a real week-3 career (Ludus Crispinus, Capua; this week's games are in Pompeii).

## ludus.html: states `#week` `#bye` `#mail` `#phone`
Shots: `ludus_week_1440.png`, `ludus_bye_1440.png`, `ludus_mail_1440.png`, `ludus_week_390.png` (+ `_full`), `ludus_bye_390.png`, `ludus_phone_1440.png`
(`node ludus_shot.js`).

### Changes vs today (v0.99 desk, 270-v99desk)
| Today | Mock |
|---|---|
| Rail "⚔ Match Week" | **⚔ Fight Night** (the three bouts). "Match Week" now means the days before it, and appears only in the banner title ("Week 3 · Match Week"). |
| Banner "Your ludus" + ledger chips + "N this week" box | **Week banner**: laurel medallion (week in Roman numerals), "Pre-match · Fight Night in Pompeii", the same ledger chips (✝ fallen kept: the v0.99 count fix), a big red **⚔ FIGHT NIGHT** button (city, bouts, Fri/Sat/Sun). The art is the city's own Match Week banner (cityScene75), so the button and the Fight Night room look alike. Bye week: the house scene with a stone **No Fight Night** plate showing the next fixture. |
| The Lanista's desk (task rows + letters in one long list) | **Weekly tasks** on parchment: 7 thematic rows (circle, icon tile, title, one-line why, count N/M, ›), a progress bar N/7, an "Already in order" line for the done checklist items, and Flavius' quote at the foot. The rows are desk99's rows (deskItems99) reworded as tasks. Each row's › is the same button the desk row has today (Enter them, Set drills, Plan hours, Spend, See in Recruiting). Rows that need an answer (offers, invitations) keep 270's "Decide ▾" fold inside the row (not drawn here). |
| Letters listed under the desk | **📬 Letters N** button in the tasks header opens a **letters drawer** on the right (`#mail`): the open letter with the advisor's face, unread letters, past letters, Acta. Week in review stays the first letter. Letters that need an answer still show up as tasks. |
| Council cards + "Running the ludus" tiles + Promote card, further down the page | **5 painted tiles** (below). The council and the Promote card move behind their tiles. |
| "Save & quit", grey End the week | "Save and Exit", **red End the week** at the bottom of the rail with a one-line reason ("Fight Night first — 3 bouts in Pompeii"), as in his mock. |
| Phone: desk rows, bottom pill row | Same pill row (Fight Night pill in red), Fight Night button full width under the banner, tasks, tiles 2×2 + Advisors full width. |

The task list changes with the week. Week 3: letters, fighters who want a fight (this week), fill the card ✓, drills, hours, perk points,
the Recruiter's pick. Bye week (4): letters, rest the worn, tend the wounded, drill harder (+4 h), court a recruit (Recruiter's hours),
programmata while the sand is quiet, perk points. Planned rule: always 7 rows, filled by tier (required → card → deadline → care → planning),
using desk99's tiers.

### What each tile opens (art = a crop of the room's own banner, so tile and room match)
| Tile | Art | Opens | Status chips |
|---|---|---|---|
| 🛡 **Your Team** | roster helmets (roomScene73 'roster') | Roster tab (Armory, Infirmary and Training Yard stay on the rail) | fighters · on the card · hurt/worn |
| 📯 **Promote Team** | the criers' wall (roomScene73 'news') | the Promote the ludus panel (Feast, sponsor, criers, programmata), today's promoteCardHTML | fame + tier · fan cities |
| 🏛 **Upgrade School** | the Training Yard posts (roomScene 'yard') | facility building (FAC: yard, valetudinarium, barracks, armory, stands, stables; ludus grade) | grade · levels built of 18 |
| ⚒ **Facilities** | the anvil and racks (armoryScene96) | the house's rooms as one hub: Armory shelf + repairs, infirmary beds, yard posts | shelf pieces · to repair |
| 🏛 **Advisors** (wide) | the house hall (roomScene73 'ludus') + the 6 council faces | the Council (six cards, levels, ⬆ Train) | n new counsel; the latest advice is quoted on the art |

The scenes are the game's flat SVG banners zoomed in. They are much plainer than his painted tiles. No new art is planned (his call: reuse
the banners).

## signing.html: states `#pre` `#gem` `#dud` `#fair` `#static` (+ `?still` = the final frame)
Shots: `signing_pre_1440.png`, `signing_gem_1440_t1500.png` (mid flip), `signing_gem_1440.png`, `signing_dud_1440.png`, `signing_dud_1440_t3200.png`,
`signing_fair_1440.png`, `signing_static_1440.png`, `signing_gem_390.png`, `signing_dud_390.png`.
- Replaces today's small "✍ Signed" popup (signCard73) with a full card over the dimmed Manager: the portrait in an arch with a class-colour
  ring, name, class, age, home city, contract (wage/week, weeks, signing fee), clause and want.
- **The truth**: one row per rating. The scouted grade tablet (parchment, with "how sure" pips from g.sc98 precision; "?" = never scouted) →
  a sealed tablet that flips one by one (0.25 s apart) to the real grade + number → a delta (▲ n grades up / ▼ down / = as scouted).
  The Overall row flips last.
- Verdict line with the Recruiter's face and a remark (his level shown, since level drives accuracy):
  - **GEM** (real overall ≥ 2 grades above scouted): a gold ray burst behind the card, sparks, a laurel around the portrait, gold border, "✦ A gem!".
  - **DUD** (≥ 2 grades below): dust puffs, a cracked overall tablet, the portrait desaturated, grey tablets, "A dud." + a wry line.
  - **FAIR** (within 1 grade): a calm green line "As scouted."
- **Reduce motion** (`#static`, the OS setting or SETTINGS.calm / Animations Off): no flip, burst, sparks or dust; the final frame is shown
  straight away (scouted and real side by side). `#pre` shows an optional "🔓 Break the seal" step.
- Buttons: 🛡 See him in the Roster · Welcome to the ludus. This card would also hold 249's "The truth" block (g.truth98).

---
## ROUND 2 (his answers D1–D7, 2026-10-10). This section replaces the tile table and states above where they differ.
States now: `#week` (4 tasks) · `#bye` (6 tasks) · `#mail` · `#team-a` · `#team-b` · `#rooms` · `#phone`.
Shots: `ludus_week_1440/390`, `ludus_bye_1440/390`, `ludus_mail_1440`, `ludus_team-a_1440`, `ludus_team-b_1440/390`, `ludus_rooms_1440`, `ludus_phone_1440`.
- **D1 tiles = one weekly job each.** (1) **Your Team**: the people (roster + ward + yard). (2) **Promote**: feast, sponsors, criers, programmata.
  (3) **Upgrade School**: the BUILDINGS (yard, barracks, beds/valetudinarium, kitchen, shrine, stands), with 3 level pips each on the tile and the
  next build + price in the caption. (4) **Armory** (his "Facilities — better gear"): shelf, repairs, City Square stalls. (5) **Advisors**: wide tile, council.
- **D5b richer scenes** (`ludus_scenes.js`, `SCENE99(key,'tile'|'banner')`): one painted SVG per room with gradients, grain, stone texture, light
  from the upper left, cast shadows to the lower right and a vignette. The subjects are the old banners' subjects: helmets and shields on the barracks wall; the forum
  wall with red programmata and a crier; the ludus colonnades with scaffolding and a treadwheel crane over the sand yard; the forge with
  anvil, brazier, racks and round shields; the council hall with drapes, columns, a long table and candles. The SAME picture is the tile and the
  room's banner (`#rooms` shows all five as banners; `#team-a/b` use the team one). The bye-week banner uses the school scene. Fight Night keeps
  the city banner.
- **D2: what "Roster" vs "team hub" means.**
  - `#team-a`: the Your Team tile opens today's Roster tab, and the rail is unchanged (Roster · Armory · Recruiting · Infirmary · Training Yard).
    + Nothing to relearn, and every room is one click from anywhere. − The tile is only a shortcut, and the rail stays long (6 Ludus entries).
  - `#team-b`: ONE screen, "Your Team", with tabs Roster · Armory · Infirmary · Training Yard across the top. The same fighter stays selected on
    every tab, with the same card on the right. The rail drops those four and keeps a single "Your Team" entry. In this option the Armory tile opens the hub on its Armory tab.
    + Shorter rail (3 Ludus entries), and you follow one fighter through his gear, wounds and drills. − Infirmary and Yard are one click deeper, their
    rail counts merge into one, and the lesson steps and checklist buttons have to be re-pointed.
- **D3: as many tasks as needed**, progress N/M. `#week` has 4 tasks (1/4; drills and hours merged into "Set the week's training"). When the
  list is short, the left column shows a "This Fight Night" card (day, bout, event, your fighter, fatigue) under it. `#bye` has 6 (0/6).
- **D4a**: letters drawer, as before. **D6a**: GEM/DUD = 2+ grades off on Overall. **D7a**: the reveal plays by itself (signing.html unchanged).

## ROUND 3 (2026-10-11)
- `#week-b`: like `#week` but without the "This Fight Night" card. The parchment stretches to the tiles' height, the rows get roomier, and a dashed "Coming up" line fills the gap (next week's bye, next Fight Night, a contract ending). Compare with `#week`.
- `#advisors`: the council room that opens from the Advisors tile. The painted council-hall banner sits on top, then a 3×2 grid of cards with the real council83 faces. Each card has the name, role, a level badge with a progress bar toward the next level, ⬆ Train on the Recruiter only (coin), what the advisor does in one line, and their latest advice as a parchment quote (NEW when unread).
- `#mail-open`: the 📬 drawer with one letter read in full: the sender's wax seal, title, an "answer by" deadline, the body, the trade boxes and a signature. Underneath, the Clerk's face gives her advice, then File it away / Decline / Accept. Below that come Unread, Read this week and Past letters. "‹ All letters" goes back to `#mail`.
Shots: `ludus_week-b_1440/390`, `ludus_advisors_1440/390`, `ludus_mail-open_1440/390`.

## ROUND 4 (2026-10-11): advisors stay on the My Ludus screen
- **The `#advisors` room is SUPERSEDED and removed** (its shots are deleted).
- **Advisors tile = a MARBLE RELIEF frieze.** Six clipeus heads (an imago clipeata roundel each). Each head is made from that advisor's real council face, which was captured from the game as `ludus_img/face_N.png`; the stone version is `ludus_img/marble_N.png` (greyscale, emboss from the upper left, warm marble tint, soft chisel edge).
  - The panel itself is CSS: a cream marble ground with veining from SVG noise, plus a dentil moulding on top and a fillet at the bottom.
  - Names are carved in square capitals with V for U (KAESO, GNAEVS, QVINTVS…), and each role is carved smaller below the name.
  - A red wax seal sits on a head when that advisor has new advice (here the Consilium and the Recruiter). The caption line quotes the newest advice.
- **Tapping a head opens a popover anchored above it** (`#advisor-pop`; on a phone it becomes a bottom sheet with a scrim). It shows:
  - the face in colour, name, role, the level badge, and a progress bar toward the next level;
  - what he does in one line, and his latest advice with a link;
  - the upgrade line.
- **The upgrade line follows the game's rules** (256-v98adv + 249 REC98):
  - Coin trains any advisor only up to level 2 (`REC98.up[1]` = 60 coin). Levels 3–5 are EARNED by deeds (`adv98Req`, for example "5 graded signings + fame 50" for Recruiter level 4).
  - `#advisor-pop` shows this career's Recruiter at Lv 3: "⬆ Level 4 is earned · sign 5 recruits graded on all five ratings · fame 50 ✓ — Level 4 gives +4 recruiter's hours (32 h) · grades ~27% sharper" (lvK .62 → .45).
  - `#advisor-train` shows a new house's Recruiter at Lv 1: "⬆ Train to level 2 · 60 coin — +4 recruiter's hours (24 h) · grades 20% sharper. Levels 3–5 are earned by deeds."
  - **Other advisors:** in the game today only the Recruiter's level changes play. Their popovers would show the same earn-line (for example Doctore "rating band-ups 0/10 · fame 50") with "the level shows on the card; no game effect yet". Virgilante should say whether those levels should start doing something in v1.0.
Shots: `ludus_advisor-pop_1440.png`, `ludus_advisor-pop_390.png`, `ludus_advisor-train_1440.png`, plus a re-take of `ludus_week_*`, `ludus_week-b_*` and `ludus_bye_*`.
