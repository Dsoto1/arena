# Card / beast effects as data — audit + what moved (v1.01 wave 2 Foundations)

Module: `src/core/328-v101fx.js` (last before 08-setup). Test: `tools/tests/tv101s.js` (+ fixture `tv101s_old.js` = the old dispatch, verbatim).
Gate: dice, log and S unchanged — `treplay101` goldens not re-recorded.

## 1. Audit — where effects lived before

| Area | Data | Where the effect was coded | Shape |
|---|---|---|---|
| Arena deck `CARDS` (02-data) | 58 printed keys: 28 instant · 14 declare · 6 anytime · 5 active · 5 npc; generated `pia_cc_*` (64, 33), `spawn_cn_*` (129), `pair_*` (44) | **drawn**: 04-rules `resolveDrawn` = `C.cls` branch (dead — 64 wrapped it) + `C.loc` branch + a 24-label switch + `pair_` tail; wrappers 64 (Piacula by identity), 129 (Studio spawn cards), 152 (card87 mark), 312 (Fortuna toss fx); 126 wraps drawArena (unique beasts) | switch + 4 wrappers |
| | | **played**: 04-rules `useItem` = 22-label switch; wrappers 133 (CF offerings), 179 (Choose card — base case dead), 199 (elixirs + free rolls — base branches dead), 310 (daily "noheal" twist) | switch + 4 wrappers |
| | | **reactions**: Minerva / Fidelis in 04 `defend` (~87-132), Omnia in 04 attack (~237) + 06-ai + 232 wrapper; numbers in CARDS (hp, mv, ap, dmg, lv, bear, loc, flip) | inline in the attack code |
| Offerings `OFFER` (18 keys) + `BLESSING_TABLE` / `OPTIONAL_TABLE` | bag counts are data | 03 `revealOffering` (3 instant if-branches + landing), wrappers 78 (CF lands, pays on pickup), 122 (pillar landing rules); `useItem` offer if-chain (7 branches) + 133/199; `pickupAt` (+78); `breakPot` 2 coin + 1 CF literals | if-chains spread over 6 modules |
| Mandata Flavi `MANDATA` | 15 entries, each with its own `test` / `declare` / `reward` | already rows with handlers; 17 `MANDATA[…]` reads in 6 files (06-ai matches some by NAME) | data + per-row functions |
| Fate | `FATES` 12 rows | `fateFor` (02) + 177 wrapper | already data |
| Market / chest items | `W`, `ARM`, `MARKET_W/A`, `CHEST_W` | `marketBuy75`, `pick89`, `openChest` (05-flow), drafts (122/179) | data + bespoke flows |
| Class abilities / weaknesses | 7 `abil` codes, 4 `CLASS_WEAK` flags (`WEAKNESSES`) | 30 `abil === '…'` tests in 13 files; 16 `weak(p,'…')` calls in 10 files | per-key if-tests scattered |
| Beasts | `NPCT` 7 types = the STAT table (hp/ap/mv/rng/coin/cf/states + scan/tameable/fly/huntCF) | **behaviour by name**: 65 `n.t === '…'` tests in ~25 files (tholo 20, zora 24, commodus 8, wolf 5, bear 3, snake 3, lion 2); rules ones: 04 (lure, aggro, Commodus' pick, chest scoop ×2, tame ×2), 03 (hoard, chest drop), 186 HUNT90 (hunter, prey, hoard ×2) | name tests |
| Spectators | costs inline (stone 2 CF, offering 8, move 3, Tholo chant 3 × 4 quadrants) | 16-crowd `spectatorsAct` / `spectStone` / `humanSpectatorTurn`, 128 online group turn | interleaved with seeded `rand()` gates |

**Parameter variations** (same code, other numbers / targets): Wealth 3/5 · weapon loss R/L · armor loss ×6 locations · Mercury 1/2 (draw) and 1/2 (offering) · Ursa/Brutum · market armor L1/L2 · Telonium · Telemachus/Restless · Leo/Leaena/Tholo spawns · elixirs 2/4 (card + offering) · Forge 2/3 + AP 2/3 · Hercules 1/2 · Ward/Focus/% Off (a flag on the gladiator) · free rolls mw1-3/ma1-3 · CF offerings 1/2 (pot + hand) · the five reaction cards' "played as a reaction" note · beast behaviour flags.
**Genuinely bespoke**: Fortuna, Lashings, Spikes, Flavius Rule, Boar, Commodus' spawn, Piaculum (identity), Studio spawn card, cohort card, Hygeia, Rete, Meat Lure, Lyre/Tame, Ammo, Zora, Choose, Golden Eagle, Spiders, Curse, the 15 Mandata, Omnia/Minerva/Fidelis reactions, class abilities, spectator AI.

## 2. What moved (328-v101fx)

ONE lookup `fx101Row(kind, key)`: `card` → `{draw, use}`, `offer` → `{reveal, use}`, `beast` → `fx101Beast(t)`, `mf` → Mandata row.
Generated keys by pattern: `C.cls` → piaculum, `spawn_cn_*` → spawnCustom, `pair_*` → pair, any `C.loc` → stripLoc.
Engine entries are now thin: `resolveDrawn → fx101Drawn`, `useItem → fx101Use`, `revealOffering → fx101Reveal`.

**Families (table rows, one interpreter each)** — 21: coin, loseHand, stripLoc, stripAll, moveTurn, moveRound, bearAggro, marketPick, tax,
activeRule, spawn · heal, apUp, freeRoll, moveCap, crowdCF, mark, reaction · limbBite, curse, potCF.
Rows: 38 drawn-card rows (+7 printed Piacula), 25 use-card rows, 18 offering rows (9 reveal / 15 use).

**Registered handlers (bespoke code, same lookup)** — 17: fortuna, lashings, spikes, endgame, boar, spawnCommodus, pair, piaculum (64's code),
spawnCustom (129's code), hygeia, rete, lure, tame (Lyre + Tame), ammo, zora, mchoice (179's code), eagle. Mandata: rows point at `MANDATA[i].reward`.

Moved wrappers (deleted where they were, same code in the table): 64 Piaculum, 129 spawn_cn, 133 CF offerings, 179 Choose, 199 elixirs + free rolls.
Dead branches removed: 04's class-key Piaculum, 04's mchoice case, 04's elixir/free-roll offering branches (199 always answered first).

**Beasts**: `FX101.beast` adds the behaviour NPCT did not hold — hunt (Tholo, lions), prey (Zora 0), hoard + chest (Tholo), picksCF (Commodus;
Studio beasts via NPCT.huntCF), lure (Zora/Commodus 0, Tholo 1, else not a humanoid via 228 hum95ally). `fx101Beast(t)` merges it with NPCT
(scan, tame, fly), so a Studio beast (`cn_<id>`, NPCT row from 15 npcType) uses the same profile. Converted name tests (13): 04 lureOK100,
setAggro, resolvePhase Commodus pick, npcWalk chest ×2, tameable, lyreControl; 03 hurt hoard, hurtNPC chest drop; 186 hunter90, prey, hoard ×2.

## 3. Left as code (and why)

- Reaction cards Omnia / Minerva / Fidelis: their effect sits inside the attack/defend roll sequence (04 ~87-237, 232) — moving it means
  reordering dice calls. Rows exist (use = 'reaction' note), effect stays bespoke in place.
- Landing of offerings (78, 122, pickupAt CF pay): where an offering falls, not what it does; kept as wrappers.
- breakPot (2 coin + 1 CF), spectator costs, class abilities (30 tests) and weaknesses (16 calls): parameter-like but read inside turn flow
  with interleaved `rand()`; untouched in this step (candidates for the next pass; zero dice risk only with a full replay).
- Display/AI name tests (07-ui, 312, 132, 16-crowd, 06-ai, 29-guide; ~44): not rules; left.
- Texts "Tholo scoops up / drops / hoards" stay literal (a row with chest/hoard on another beast would still say Tholo — goldens keep the text).
- Market/chest (W, ARM, openChest) and Fate (FATES) were already data tables.
