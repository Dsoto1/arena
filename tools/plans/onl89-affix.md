# v0.89 J — Online armor affixes II, the named-armor curve, the Ranked stone rule

Virgilante, 2026-10-05: armor bonuses online are **permanent only** (no market offerings for them — "drive the need for tokens and
luck"), with a properly rare drop curve, plus a Ranked stone rule. No protocol bump (old clients drop the new flags in cleanNamedA —
they would simply not apply them; ship the server and the game together).

## Where things live

| Piece | File | Hook |
|---|---|---|
| Affix defs, Latin forms, weights, tiers, rolls, odds | `src/111-onlcore.js` block "v0.89 J" (→ `server/src/onlcore.js` via `node tools/mkserver.js`) | extends `ONLC`: `AFFIX_A` += 8 keys; `rollNamedArmor`, `rollGift`, `cleanNamedA`, `gearAfter` replaced/wrapped; `affixOdds89`, `giftOdds89` |
| Engine effects + cards + ⓘ odds | `src/177-v89affix.js` | wrappers on `hurt`, `doAttack` (attack context), `finalCF` + `fateFor`, `ONL84.regArmor`, `na84Card`, `onl83Chest`; a Domus-bar `mouseover` |
| Server | no `routes.js` change | `gift.open` calls `C.rollGift` / `C.rollNamedArmor`; the settlement already puts `gx.left` on the Domus and gives `gx.carried` to the loot window / market |

## The affixes (named armor only)

| Key | Latin (m/f/n) | Effect | Fits | Rule |
|---|---|---|---|---|
| ap | Solidus | +1 AP | AP < 6 | unchanged |
| bonus | Amplus | +1 AP to another location | no bonus yet | unchanged |
| ward | Tutus | the first hit each rotation loses 1 damage | any | unchanged |
| swift | Velox | +1 movement while unhurt | any | unchanged |
| venat | Venatorius | −1 damage from beasts on this location (min 0) | any | `hurt`: `source.type==='npc'` |
| miss | Missilis | −1 damage from thrown/shot weapons on this location | head · chest · belt · arm | `hurt`: attacker's attack is thrown (`doAttack` source.thr), the weapon has ammo, or the attacker stands 2+ tiles away |
| firm | Firmus | floor spikes deal 0 to this leg | leg | `hurt`: prefix `_T('Floor spike')` / `_T('Pushed onto a floor spike')` on the covered leg |
| spin | Spinosus | a melee hit here costs the attacker 1 HP | chest · belt · arm | after a landed non-ranged player hit: 1 direct damage to the attacker's striking arm (other arm, then chest, when gone) |
| lapid | Lapidarius | stones from the stands deal 0 here | any (Rare+ by construction), ×2 weight on a helm | `hurt`: `source.spect` on the covered location |
| integ | Integer | never comes back Broken | any | `gearAfter`: its engine key is taken out of `row.brk` before the base runs |
| fid | Fidelis | cannot be looted: if the wearer falls it goes home | any | `gearAfter`: moved from `out.carried` to `out.left` (the house Storeroom), history line `how:'home'` — whoever killed him (human, beast, CPU, Fate) |
| fort | Fortunae | +1 on the wearer's Thumb of Flavius d6 | Legendary only (`FORT_LEG89` = ¼ of them) | `fateFor` (online, worn at the end): the same d6 the game rolls, +1; 4+ spared (`d6` shown = min(6, roll+1), `fort89` = the raw roll) |

**Ranked stone rule** (177 `hurt`): online Ranked only — a stone (`source.spect`) that would take a lethal location (head, chest, the
last arm) to 0 HP after armor stops at 1 HP; the log says "… reels at 1 HP — in Ranked the crowd wounds, Flavius kills." Custom and offline
unchanged. Deterministic: only `S.onl.ranked` and the game state.

All effects are lockstep-safe: no `Math.random`, no clocks — only the pieces worn, positions, HP/AP and the seeded dice.

## The curve (TWEAK in the "v0.89 J" block)

* Named ARMOR tiers `RAR_A89`: Common 60 / Rare 28 / Epic 10 / Legendary 2. Weapons keep `RAR_W` (50/30/15/5).
* `rollGift` keeps every v0.83/84 draw in the same order (coin · CF bonus · offering · gear · named → tier → kind); a named ARMOR piece then
  draws its tier again on `RAR_A89`. Chest-pool reuse in `gift.open` and the weekly auction lots are pieces already rolled — no new rolls.
* Affix draws are weighted (`AFF_W89`, only affixes that fit the piece take part): common ap 30, bonus 30 · uncommon ward / swift / venat /
  miss / firm 10 · rare spin / integ / fid 4, lapid 5 (×`LAPID_HELM89` = 2 on a helm) · Fortunae drawn apart: a Legendary has a ¼ chance
  that one of its two affixes is Fortunae. Affix counts unchanged: Rare 1, Epic 2, Legendary 2 + a unique.
* Lapidarius weight 5 was tuned with the simulator to hit "≈ 1 in 12 Rare-or-better pieces".

## Simulator — `node tools/affixsim.js [openings=400000] [seed=89]`

Exact numbers come from `ONLC.affixOdds89` / `giftOdds89` (enumeration, no sampling — the same functions the ⓘ odds card reads);
the Monte Carlo columns run the real `rollGift` + `rollNamedArmor`. Assumes every Legendary unique is unclaimed and every piece freshly rolled.

### 1 · A gift opening (exact, from ONLC.GIFT_W)

| Reward | Chance | Monte Carlo (400,000 openings) |
|---|---|---|
| coin | 55.0% | 54.9% |
| cf | 15.0% | 15.1% |
| off | 15.0% | 14.8% |
| l1 | 9.00% | 9.08% |
| l23 | 4.00% | 4.00% |
| named | 2.00% | 2.02% |
| → named ARMOR | 0.800% | 0.804% |
| → named weapon | 1.20% | 1.21% |

### 2 · Named armor tiers (RAR_A89)

| Tier | Chance | Monte Carlo | Affixes |
|---|---|---|---|
| Common | 60.0% | 59.4% | 0 |
| Rare | 28.0% | 28.3% | 1 |
| Epic | 10.0% | 10.4% | 2 |
| Legendary | 2.00% | 1.90% | 2 + a unique |

### 3 · Each affix: the chance a piece carries it (exact; per tier, then per named armor piece of any tier)

| Affix | Weight | Rare | Epic | Legendary | Any named armor piece | Monte Carlo (direct rolls R/E/L) |
|---|---|---|---|---|---|---|
| ap · Solidus | 30 | 26.1% | 48.2% | 42.7% | 13.0% | 26.1% / 48.4% / 42.8% |
| bonus · Amplus | 30 | 20.9% | 39.0% | 34.5% | 10.4% | 20.8% / 38.6% / 34.4% |
| ward · Tutus | 10 | 9.39% | 19.8% | 17.2% | 4.96% | 9.50% / 19.6% / 17.2% |
| swift · Velox | 10 | 9.39% | 19.8% | 17.2% | 4.96% | 9.35% / 19.9% / 17.1% |
| venat · Venatorius | 10 | 9.39% | 19.8% | 17.2% | 4.96% | 9.21% / 19.6% / 17.3% |
| miss · Missilis | 10 | 7.35% | 15.5% | 13.4% | 3.87% | 7.70% / 15.9% / 13.0% |
| firm · Firmus | 10 | 2.04% | 4.36% | 3.78% | 1.08% | 2.19% / 4.59% / 3.68% |
| spin · Spinosus | 4 | 1.72% | 3.74% | 3.24% | 0.921% | 1.67% / 3.75% / 3.33% |
| lapid · Lapidarius | 5 (×2 on a helm) | 6.22% | 13.3% | 11.6% | 3.31% | 5.93% / 13.3% / 11.4% |
| integ · Integer | 4 | 3.76% | 8.19% | 7.08% | 2.01% | 3.81% / 8.19% / 7.00% |
| fid · Fidelis | 4 | 3.76% | 8.19% | 7.08% | 2.01% | 3.79% / 8.28% / 7.25% |
| fort · Fortunae | Legendary only, 25.0% | 0.000% | 0.000% | 25.0% | 0.500% | 0.000% / 0.000% / 25.6% |

### 4 · Targets

| Measure | Exact | Monte Carlo | Target |
|---|---|---|---|
| Lapidarius among Rare-or-better armor | 1 in 12 (8.27%) | 1 in 11 | ≈ 1 in 12 |
| … on a Rare-or-better helm | 1 in 9 | 1 in 7 | twice the others |
| … on any other Rare-or-better piece | 1 in 15 | | |
| Fortunae among Legendary armor | 25.0% | 29.5% | ≈ 1 in 4 |

### 5 · How long (gift openings; every piece freshly rolled)

| Goal | Expected gift openings | Named armor pieces | Monte Carlo |
|---|---|---|---|
| One Lapidarius helm | 7,759 | 62 | 6,026 (64 found) |
| A full stone-proof set (Lapidarius head · chest · arm · leg) | 41,210 | 330 | |
| One Fortunae piece | 25,000 | 200 | 22,222 |

Reading it: a gladiator earns a gift at each new rank, every 5 Ranked bouts survived and one weekly challenge, so the stone-proof set is
a lifetime-of-the-server goal (as asked: "properly rare"); a single Lapidarius helm is one in ~62 named armor pieces.

## The ⓘ odds card

Beside the Arena Chest token (`onl83Chest`: the landing stage and the Domus banner). Hover (fine pointers) shows a floating card, a click
pins it (`onl83Pop('odds89pop')`). Every number is computed from the ONLC tables at open time (`giftOdds89`, `affixOdds89` on the live
catalog), each table's percentages rounded by largest remainder so they sum to 100.0%. The affix columns are "chance a piece of that
tier carries it" (they sum to the tier's affix count). One level only (the unique names carry a plain title).

## Tests

* `server/test/v89a.test.js` (in `npm test`): rolls deterministic + fits + names + clean, gift tiers by Monte Carlo, the exact curve within
  bounds + Monte Carlo agreement, Integer never broken, Fidelis to `out.left` → the house shelf, plain pieces unchanged, Custom breaks nothing.
  `server/test/v84.test.js` feeds one more scripted draw to keep its Legendary armor gift.
* `tools/tests/tonl89a.js`: two windows through the MOCK, a Ranked room, the same ARM flags on both screens, then each effect on window A's
  sand (stone rule Ranked vs Custom vs offline, lapid, miss, spin, venat, firm, fort), the card text, and the ⓘ on landing + Domus (hover,
  click, sums, = ONLC, fits 390 px).
