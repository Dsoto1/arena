# Roster · Training Yard · Infirmary: round 4 mock (`rooms.html`)

States: `#roster` `#yard` `#infirmary` (1440×900, each one screen) and `#phone-roster` `#phone-yard` `#phone-infirmary` (390, one column).
Shots: `rooms_<state>_1440.png`, `rooms_phone-<room>_390*.png` (scrolled).
Look: the recruit3 style (`rooms_base.css` is a copy of its CSS): a fresco banner strip, a portrait-only dossier, one-line rows, painted plates and wax tablets.

**Art** (pipeline reused from recruit3 plus three new steps):
- **Fighter portraits:** `rooms_art.js` renders `img3/r4_f0-6.png` (seven fighters, one per printed class except Damnatio) with `gArt` → `face99` from the built game.
- **Marble statue:** `rooms_art.py` turns `assets/avatar.png` into white marble with veins (`r4_marble.png`).
- **Bronze Doctore:** `rooms_art.py` casts the Doctore's painted council face in bronze with patina (`r4_doctore_bronze.png`).
- **Wound placement:** `rooms_crop.py` cuts the wide banner plates and copies SEV92 (src/211-v92sev.js) into `rooms_sev.js`, which places the statue's wound glow and broken-off limb.
- **Plates:**
  - Pictures: city square, arena and SCENE99 (team/armory/school), as in recruit3.
  - Figures: his 3D minis (`mini_<class>`, `mini_leo` in the beast pen).
  - Faces: council faces (Clerk, Doctore, Medicus, Barracks) and crowd faces.

## Roster (229-v95mgr, 143-v84roster)
| Element | Status |
|---|---|
| Barracks-wall banner (SCENE99 team) + count | restyle (banner exists) |
| Three starter tablets: Bout I Undercard · II Feature · III Main, each with a face, class, rating, fatigue dot and day/city | restyle of g.slot95 / TIERS (today a depth card) |
| List: slot I/II/III/B/L · face · name · Ovr · W–L · fatigue dot · wound mark · weeks left | restyle (columns new: fatigue dot, wound, weeks) |
| Dossier: portrait, ratings as numbers with bars, personality, record, scars, last bout | restyle (fighter card exists). The scars row is NEW (g.hist scars) |
| Bench & loans rows with Promote / Ward / Recall | exists (Promote/Bench/Lend, Loans tab) as one list |
| CONTRACT wax tablet: wage, weeks left, clauses (cl76 win bonus / no Naumachia), renewal ask, Renew · Lend · Release | NEW layout. Renew asks the wage-raise flow (exists), Lend (exists), Release (exists) |

## Training Yard (213-v92yard, 184-v90yard)
| Element | Status |
|---|---|
| Yard banner (city training ground) + house hours | restyle |
| List: sessions ●●○ · lock state · fatigue | restyle (squad rows exist) |
| Dossier: portrait + Speed/Strength/Tactics/Crowd with value → planned value in green and −/+ session counters, Luck read-only, the drill line | exists (y92Card bars + y92Sim previews), restyled |
| Doctore as a BRONZE head: level, drill, doctore hours, Intensity None/Light/Normal/Hard | restyle (y92DocHTML). The bronze head is NEW art |
| Drill plates: Footwork, Iron, The Showman, Blood and Sand, The Veteran, The Parade (Y92_PRE: two ratings, 2 h, one a fighter a week, level-locked) | restyle with fresco art. They are one-a-week picks, not counters (the counters are the rating sessions in the dossier) |
| TRIALS OF THE YARD: a full-width strip, one large plate each for Spar / Exhibition / Beast pen, with who's entered, cost, what it pays and the button | restyle, much bigger (data-yb76). The pay texts are approximate |
| Week's-plan wax tablet: per fighter, sessions + lock state, house hours, ↻ Same as last week, Care, gold 🔒 Lock in all | NEW layout (Lock all / Same as last week / Care exist) |

## Infirmary (183-v90ward, 151-v87ward)
| Element | Status |
|---|---|
| Valetudinarium banner (Roma baths) + beds | restyle |
| List: hurt and tired with six-segment HP bar (red wound, violet lost) + fatigue bar + status | exists (iv90list), restyled |
| Dossier: portrait, HP and fatigue bars, wound cards | exists, restyled |
| MARBLE STATUE in a niche: the wounded location glowing red (SEV92 chest), the lost arm broken off (masked, violet dashed outline + cut line) | NEW art (replaces injuryAvatar74's look; same SEV92 outlines) |
| Care plates: A bed · Medicus 10 · Surgeon 18 · The baths 5 · Hygeia's temple 20 · Rest week, each with cost, time and fix ("planned" marks) | exists (planTiles / bedTiles87 / data-bath / data-rest / heal), restyled as plates |
| Road-back wax tablet: fit by week per choice (bench W11, bed W9, bed + Medicus W7, Asclepius W7), Hygeia for the arm, the third-limb warning, rest week | NEW (today fitWeekOf on each tile + the .rtimeline). The weeks shown are mock values |

Open points:
- Roster still has about 60 px empty at the bottom at 1440.
- The bed plate uses the barracks scene, since the game has no bed art.
- The trials' payout texts and the infirmary's fit weeks are illustrative, not computed.
- **Fix (4b):** the lost left arm is now cut from the statue's own pixels (avatar alpha, split on SEV92's shoulder line).
  - The statue ends in a jagged break with a darker rim at the shoulder.
  - The missing arm shows at full size as a faint fill with a dashed outline (`r4_marble_lost.png` + `r4_ghost_larm.png`). Before, the shrunken SEV92 shape was masked out.
  - The chest wound glows only on a small soft spot with a gash mark, no longer over the whole torso.
  - No other state has a severed limb.
