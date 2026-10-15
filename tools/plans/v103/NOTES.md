# v1.03 — his v1.02 notes (102notes.pdf, 2026-10-15)

## Fixes (straight into the build)
G1 square ✕/🏛 · G2 Market disabled in a no-CF round 3 (+why) · G3 🔴 challenge start: briefing over the menu, Enter → menu, nothing loads
G4 abandoning a challenge says what it costs (attempt counted, daily's scored attempt spent, weekly attempts left)
M1 "Week 13" review in season 3 without the Superbus win · M2 "Superbus Week" on rail/banner (not Match Week 4) + regal Superbus card
M3 🔴 rivalry week: no other bouts enterable (broke pairings, withdraw filled by a free agent); no specials/invitationals that week
M4 🔴 no offers past the roster cap (25 recruits all signed at once) · M5 no lending/borrowing injured fighters
M6 Armory starters' gold border stays when another fighter is selected · M7 🔴 trade requests that give nothing
M8 Infirmary "Treated ✓" this week · M9 top bar: new record format, drop "N fighters"
T1 bears/lions/wolves smaller, lions slimmer (re-render) · T2 Tholo (+Commodus, custom humanoids) base shown with bases off
T3 thinner class/team ring on thin bases · T4 disabled tunnel says "missing a limb" · T5 Telemachus: attack hover says why
T6 blurry gladiator edges zoomed (measure: sheet drawn at board size then scaled) · S1 Gear designers get the new tab look

## Features — his answers
N1a spectators switch section once a match (CPU crowd too), crowd spread at the start
N2a one off-season week after the Superbus: Season in Review letter (in/out, finances, record, titles, fallen, band-ups); contracts expire/renew, buildings finish, recruiting open, no bouts
N3a fame follows results (scaled by win rate, drifts down after a losing season; Superbus seats top houses by league points) · N3(advisors)a each level needs more, ~one a season
N4a recruiting: fewer hours, rising cost per extra action on one recruit a week, offers answered NEXT week, refusals / rival signings / lowball scares, trial needs 2+ earlier actions on an earlier week; board cap 6 + Recruiter level
N5 cap a (start 8 → 15 via Barracks + Barracks master) · starters a (4 First team + 4 Second team, rest Rostered, Lent out apart) · layout a (one sortable list: tier, name, OVR, W-L, wage, fatigue, weeks; group headers; ⋯/drag; right side = selected gladiator only, Keeping him inside the tabula) · order a (OVR within group, bout chip)
N6a loan contract: lump sum + wage under his terms; 2+ wins on loan → borrower may offer a buy-out at the end
N7a Medicus queue: one click treats in order with this week's hours; warning before Match Week when healthy starters can't fill bouts
N8 Vulso's cart = a Recruiter letter with "Go to the Recruiting board"; bottom bar removed (no objection)
N9a swap Armory/Promote tiles; bigger advisor faces, compact council card; Promote/Upgrade School popups with art tiles, current + next-level look, Build only if affordable; one illustration per building, richer per level
N10a build time = the new level in weeks, one project at a time, on the banner
N11a beast corpse models on the sand (cleared by the crew) + HIS ADD: only the new 3D models shown — no switch back to the old token on damage / severed limbs — unless Settings says otherwise
N12a one sun upper left, silhouette shadows cast lower right, pillars cast long; Off + Light board paths; ≤16 ms frame
N11 add-on: a — never fall back to the old token: 2+ lost limbs rendered on the device, the plain 3D class set while a render/load is pending; Settings "Token style: 3D always / classic" brings the old ones back.

## Round 2 (2026-10-15)
X1a over-cap careers: nobody released; no signing/borrowing until under the cap; desk "Over the cap 23/12" + Release/Lend/Trade; wages above the cap +25%
X2 running loans finish on the old terms · X3 mgrsim 3 seasons before/after, numbers to him before release · X4 lessons + first hour updated · X5 rivals on the same rules
E1a trade bundles (2+ for 1, counter-offer letters) · E2a league awards in the off-season → Tituli · E4a contract renewals at the off-season (raises, bench-time asks to leave)
E3b AGE + RETIREMENT, his twist: prime ranges differ per gladiator; very rare "Tom Brady" = 20+ seasons at peak; very rare meteor = better than that but a 2-season window;
    scoutable: see when a gladiator is in top form / in his prime (design questions asked)
E5a shadows on everything (beasts, pillars, pots, chest, rubble), night = away from the rim torches
E6a sharp pieces everywhere, NOT only zoomed — blurry edges in classic view too
E7 section-switch button shows "1 switch left" / used (incl. online ticket holders)
E8a Superbus week end to end (regal card, trophy banner, entrants letter the week before, podium → off-season) + HIS ADD: an extra bye week right before the Superbus

## Round 3 (2026-10-15)
E3 kinds: he wants MORE THAN 3 (less disparity; "half as good TB12s") → proposed 5: Common, Steady (half Ageless), Blazer (half Meteor), Ageless, Meteor — odds pending his ok
A1a every fighter gets an age + curve at the first off-season, nobody fades before a season passed · A2 rarity depends on the new kinds · A3a a retired great may stay as Doctore/Barracks master (advisor lv 3) · A4a Manager only
A5 HIS IDEA: move one in-season bye to sit directly before the Superbus → byes 4 & 12, rivalry week moves 12 → 11 (rival lock letter 11 → 10); season stays 12 weeks; from the next season in running careers
E3 kinds: a — Meteor 1/100 (2 seasons, +8, steep) · Blazer 1/10 (3–4, +4, fast) · Common ~3/4 (4–6) · Steady 1/10 (8–12, slow) · Ageless 1/150 (15–25, very slow); per-fighter spread, late bloomers; scouting names the kind (rough read = long / short bright)

## RELEASE SPLIT (his ok 2026-10-15: "lets try it your way")
- **v1.03 = fixes + small changes:** G1–G4, M1–M9, T1–T6 (T1 re-render), S1, E7 (switch button), N8 (Vulso letter), N1a (switch once a match),
  N9a tiles swap + bigger advisor faces (popup art → v1.04), M2 Superbus Week name + regal card. Played on the beta first.
- **v1.04 = the Manager season rework:** N2a off-season + E2a awards + E4a renewals + E8a Superbus week end to end + A5 byes 4 & 12 / rivalry 11 ·
  N3a fame + Superbus entry + advisor pace · N4a recruiting · N5 roster (cap, 4+4, list, order) + X1a · N6a loans + X2 · E1a trade bundles ·
  N7a Medicus queue · N9a popup art · N10a build weeks · E3 age + five career kinds (A1a A3a A4a) · X3 mgrsim report · X4 lessons · X5 rivals.
- **v1.05 = board visuals:** N11a beast bodies + always 3D · N12a + E5a shadows · E6a sharp pieces everywhere (if T6 does not already cover it).
