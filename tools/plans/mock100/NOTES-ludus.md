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
