# Economy — every coin source and sink (Manager mode; Online at the end)

Written for the v1.12 economy re-measure (his E1a–E5a, 2026-10-23; tools/plans/v112/NOTES.md, last lines of docs/decisions.md).
Measured with `tools/mgrsim2.js`; results and tuning proposals in `tools/plans/econ111/REPORT.md`. Keep this file current when a
module adds, removes or re-prices a coin flow (grep the module name in docs/modules.md first).

**Kill switch** = localStorage key set to `1` (— = none; the older economy modules have no switch). **Set by** = the version + the note
or decision that fixed the number (decisions.md lines win over module headers when they disagree). Coins are `m.coin` on a house
(`me()` = the player). Every number below is the shipped constant at v1.11d plus the v1.12 work (426, 427) (grep the constant to retune it).

## 1. The week's order (who touches the treasury, and when)

1. **Before Match Week is played** (the player's clicks): recruiting (scouting coin, gifts, feasts, signing bonuses), care, gear,
   facilities, programmata, temple offerings, the road (travel), bets, special-event fees. 397 locks every bout of an AWAY week until
   the house **sets off** (35 travel paid or the deal taken, 360 `mw105Go`); after set-off Recruiting, the Yard and the Infirmary close.
2. **Bouts** (17 `applyBout` + wrappers): appearance fees, purses, wager payouts, blood money, Superbus purses, Renown.
3. **endWeek** (17 + ~54 wrappers): the player's patron (427, first) → gate share (87) → wages + training regime + personal trainers (17) → walk-out if the treasury is
   below 0 → rival care → facilities' income (23 facWeek) → rivals' week (17 cpuLeagueWeek, 23 aiLanistaWeek incl. their patron
   stipend + 427's backer floor, 88 rivalTrain) → fighters' purses (28) → the syndicate loan's interest (66) → bankruptcy count → season turn (every 12th
   calendar week, held for the Superbus by 348) → sponsorships (150) → bye/playoff wage refunds (59/348) → loan fees (47/350).
4. **The off-season week (Winter Quarters, 413–416)**: the Quaestor's Ledger is sealed (paid), raises are answered, the free promotion,
   the winter market, winter works, the camp, the Winter Classic + Saturnalia, rudis asks; ▶ Begin = that week's endWeek.

## 2. Player income

| Source | Rule (amount) | Module | Kill switch | Set by |
|---|---|---|---|---|
| **Patron stipend** | every in-season week end (not the off-season week): **+10 + 0.3 × fame** (rounded, `E112.pat`), paid at the start of endWeek (before wages); ledger category **Patron**, line "💼 Your patron: +N coin" | 427-v112econ | flavius_v112econoff | v1.12 his 1a (P1, 2026-10-23) |
| Starting treasury | founded house: Normal 125 / Easy 250 / Hard 50 (`START_DIFF`) + 100 (`ECON.startBonus`) + 100 (`GR102.start`) = **325** on Normal; a taken-over preset: its `MGR_PRE.coin` + 200 | 70-v57, 87-v67, 339-v102gear | — / — / flavius_v102hoff | v0.57 difficulty; v0.68 ECON tuning; v1.02 H (his M11 2a) |
| Appearance fees | per fighter entered: undercard 12 · feature 24 · main 40 (`ECON.fees`, overwrites `TIERS.fee` 4/8/15) | 17 applyBout, 87-v67 | — | v0.68 "an attentive lanista roughly breaks even without winning" |
| Purses | winner's house: `purse × (0.5 + greed/300)` minus a tenth to the fighter's purse; purses 30 / 70 / 160 (`TIERS`); ×(upset ≤2, streak +25%/win ≤2, combined ≤3) extra (`WIN87`) | 17, 28-purses, 150-v87mgr | — | v0.36 purses; v0.87 win rewards (decisions "WIN REWARDS" 2026-10-05) |
| Gate share | every house every week: `5 + fame/4`, max 30 (`ECON.gateBase/gatePerFame/gateMax`); none on a self-bye | 87-v67 | — | v0.68 ECON |
| Practice stands | +10 a week per Stands level (`facWeek`) | 23-ludus | — | v0.28 facilities |
| Bye weeks | the Senate pays back **half** the week's wages (byes = weeks 4 and 12 of the 348 calendar) | 59-bye, 348 | flavius_v104aoff (calendar) | v0.52; v1.04 calendar |
| Superbus weeks without a bout | the Senate pays **all** that week's wages | 348-v104season | flavius_v104aoff | decided 2026-10-16 (REPLACED half wages for playoff weeks) |
| Superbus prizes | semifinal +40 · final +80 · champion +250 (+fame 2/4/10), round purses 70/100/150 (`V104A.prize/purse`) | 348 | flavius_v104aoff | v1.04 A (his E3 a / s1a) |
| League prize | final table 1st 120 (+5 fame) · 2nd 80 · 3rd 50 · 4th 25 · 5th–6th 10 (`LP90`), paid by qsClose | 185-v90week | — | v0.90 A3 "the league's stakes" |
| The Quaestor's Ledger | once a season: Senate stipend 30 (none if thriving) + 10% of wages paid + 12% of tax on lost wagers + 12 per new signing + 3 per fame gained + 2 per 1K new fans + 4 × (houses − position); **cap 120 + 3 × fame** | 47-mgr47 quaestorLedger; sealed in Winter Quarters room 2 (413 `wqSeal`) | flavius_v109wqoff (old letter) | v0.47; v1.09 W8a (sealed, not double paid) |
| Advisors' coin | Consilium +2 per bout per level above 1 · Clerk 3% of wages per level above 1 (`ADV100`) | 294-v100ludus | flavius_ludus100off | v1.0 advisors |
| Sponsorships | after a win streak (`WIN87.patStreak` 3) a patron offers +N a week for 4 weeks to one fighter (letter; you accept) | 150-v87mgr | — | v0.87 (his v0.86 notes) |
| Winter Classic | the Cup's house: **+60 coin**, +5 morale/loyalty, **+20 Renown**, a plate (`WC109`) | 415-v109b (Day III = 416's Saturnalia) | flavius_v109boff / flavius_v109coff | v1.09b W15a; v1.09c W1a |
| Trophies & invitationals | `earnTrophy` coin + fame; invitational purses/appearance (`specRecord`), a billed fighter +10, the billing bonus 15% | 22-trophies, 296-v100any | flavius_any100off (specials) | v0.27 invitationals; v1.0 any event |
| Wagers | stake × bookmaker odds (`boutOdds`, house edge `HOUSE` 1.12), 10% tax on winnings, a slip pays at most `BET_MAXPAY` | 17 'bet', 10-meta betPay | — | v0.22 exchange |
| Fighter loans (lending) | the borrower pays the weekly fee (`loanFee` × the week's market `loan102Demand`, ≤ 0.8 of a starter's earnings); 350's lump-sum loans | 47 loansWeek, 343-v102loans, 350-v104roster | flavius_v102loff / flavius_v104coff | v0.47; v1.02 L; v1.04 C; **deadline end of week 8** (393, decided 2026-10-17) |
| Sales | coin offers / swaps from rivals (394 motives), a rival's buy-out of your fighter, the CPU poaching your fighter (you get the buy-out), a fighter buying his freedom (pays you his price) | 47 offerAccept, 350 c104Swap/BuyOut, 17 cpuLeagueWeek, 28/380 | flavius_v106troff (motives), flavius_v106lockoff | v0.47; v1.04 C; v1.06 t1a; v1.05 B56 (rudis in winter) |
| Gear sales / undo | sell a piece (`ARM94.sellK` 0.3, ≤3 a week), undo a city buy 70% | 225-v94armory, 272-v99fix4 | — | v0.94 armory |
| Small ones | a friendly house's purse (66), Sica's bribe if your fighter loses (100, you accept), programmata gate (+20% of gate, 140), the Darling of the Arena +6 (108), rivalry challenge purses (108), the beast pen win (108 penApply76), pay-to-join recruits (64), the Debtor's Gambit (treasury set to 25/60, 17) | as listed | — | v0.34–v0.84 |

## 3. Player spending

| Sink | Rule (amount) | Module | Kill switch | Set by |
|---|---|---|---|---|
| **Wages** | every contract, every week: `askWage` = (3 + (OVR−40)×0.55 + fame×0.05) × star premium × **0.85** (`WAGE_MUL`) at signing; raises at renewal (17 'extend' = the current ask, 8 weeks; off-season asks +5–40% by win rate, 12 weeks, 348 po104Renewals) | 17 endWeek, 87-v67, 348 | — | v0.68 (−15%); v1.04 A renewals |
| Treasury below 0 at the week's end | the best-paid fighter **walks out**; 3 week-ends in a row in the red (`BANKRUPT_WEEKS`) or a season ended in debt = **collapse** (one Debtor's Gambit per career) | 17 endWeek / collapseLudus | — | v0.21 / v0.34 / v0.49 |
| Training | team regime a week: light 6 · standard 15 · brutal 30 (`TRAIN_REGIMES`); personal trainer 8 a fighter (`PTRAIN_COST`) | 17 endWeek | — | v0.16 |
| Recruiting | scouting: 249 Recruiter hours (20 h + 4 a level, ≤8 h a recruit; the trial bout 4 coin); wooing costs the Recruiter's hours (357 B27: pitch 1 · gift 2 · feast 4, +1 per repeat) and coin: gift `4 + 3×stars`, feast `8 + 6×stars`; signing bonus (offer); Vulso's cart / city lots (2-coin fighters); scout report (`scoutCost` 2+2×stars) | 17, 249-v98rec, 357-v104fixm, 50-v48, 25-city | flavius_v105recoff (378's rules) | v0.98 D; v1.04 b2 h2a; v1.05 b27a |
| Advisor training | ⬆ Train to level 2 = 60 (`REC98.up`; coin teaches only to 2, levels 3–5 are earned — one free promotion a winter, 414) | 249, 256, 414 | flavius_v109aoff (promotion) | v0.98 "coin teaches, deeds earn"; v1.09a W9a |
| Facilities | level I/II/III = 250 / 600 / 1200 (`FAC_COST`); level N takes N weeks (351), one project at a time; winter works ready at week 1 (414) | 23-ludus, 351-v104ward, 414 | flavius_v104doff / flavius_v109aoff | v0.28; v1.04 D N10a; v1.09a W12a |
| Care | Medicus 10 · surgeon 18 · Hygeia (a limb) 20 · bath 5 · Asclepius 25, since v1.01 **half coin + Medicus hours** (4 + 3/Valetudinarium level); a serious wound needs a bed first (108 beds76); cures close at the week's end (341) | 318-v101ward, 341-v102care, 108-v76 | flavius_v101boff / flavius_v102joff | v1.01 B1 (his 5a); v1.02 J |
| Gear | Armory buys (weapons 12/30/60/150 by level, armor by piece), repairs (⅕ of the price), 339's Issued kit (free) + upgrades (`g102Upgrade`), city kits; the CPU shopping rule `arm94AutoShop` keeps `ARM94.playerReserve` 60 for the player | 225-v94armory, 339-v102gear, 25-city | flavius_v102hoff | v0.94; v1.02 H (M11 2a) |
| Travel | away weeks: `3 + distance × 24`, clamped 3–15, −15% a Stables level (`travelCost`); a deal (another house pays) repaid **double** if its fighter does not fight; Rivalry Week's trip is free (383); bouts locked until set-off (397) | 35-travel, 383-v105riv, 389-v105sq, 397-v106b1 | flavius_v105rivoff / flavius_v105sqoff / flavius_v106b1off | v0.42; v1.05 B62/B74; v1.06 G1 |
| Blood money | `bloodPrice` = (30 Damnatio / 22 Fatal Charades / 18) + OVR×0.35 + fame×0.2 to buy back a condemned fighter | 17 buyBack | — | v0.18 Fates |
| Morale & promotion | meal 3 · win bonus `giftCost` · family tickets 4 · feast for the city 10 (+1 fame) · sponsor the games 18 (+2 fame) · criers 6 · programmata 8 a city a week (140) · temple offerings 6–8 (108/172, −25% a shrine level) | 17, 140-v84prog, 108-v76, 172 | — | v0.33–v0.89 |
| Specials (enter any event) | the special's entry fee + a hired hand's fee (`any100Book`); refunds on a pull-out | 296-v100any | flavius_any100off | v1.0 his 1a… |
| Over the roster cap | the fighters above the cap cost their wage again (`if(ex){pm.coin-=ex`) | 350-v104roster | flavius_v104coff | v1.04 C N5 |
| Money loan | Sica's syndicate lends only to a house in the red (`loanSizes` 30/60/100% of 60 + 4×fame + 8×wins, 80–800), **12% a week**, minimum `max(8, 15%)`, 3 short weeks = a spear at your best fighter | 66-mgr55 | — | v0.55 |
| Buying with coin (Trades 2) | your 1-for-1 / bundle offers: coin counts **1:1** against 394's tr106Val (rating ×2.2 + fame ×1.2 + age/career/potential − wage ×2), a house never sells under 20 × its opinion/greed factor; REPLACES coin/6 against 23's tradeVal. A fighter of yours the house receives counts **50%** when he is below the median rating of its roster (3a); a settling-in fighter can't be offered at all (4a). Before 3a: a 73-OVR star for a 44-OVR tiro + ~70 coin in week 2 (REPORT.md §5) | 426-v112trade | flavius_v112tradeoff | v1.12 T2a; 3a 4a (2026-10-23) |
| Envoys, city, misc | envoy gift 25, pact 30 (23); city bath 8, tavern 6, lupanar 10, spectator tickets (25/30); road bandits 3–8 (108); bribes (141 faith); a caught rig −40 and −12 fame (17); a poaching buy-out (`buyout`) | as listed | — | various |

## 4. Season turn and winter (what lands once a season)

* **Season turn** (week 12 of the calendar, held by 348 until the Superbus final): fame ×0.92 for every house; ages +1; 349's careers turn
  (retirements, the next season's curves); 47's Quaestor's Ledger is built (paid at the WQ seal); 185's league prize; the league table
  podium gives Renown (363). A house that ends the season in debt collapses (17, a newcomer's first partial season is forgiven).
* **Winter Quarters** (413): the Ledger seals (W8a), raise / leave asks (348 rows, 386 lines) answered or lapsed, 349's farewells;
  414: one free advisor promotion (record met), facilities as winter works, the winter market (`a109Gen`: 8–12 tirones aged 18–20, same
  world = same intake), the camp (str / wpn / mend / bond, no coin), the Consilium's goals for next season (Renown 15–20 each, paid at the
  next winter); 415/416: the Winter Classic (free to enter; clemency — no deaths, wounds or records; prize above).
* **Rudis asks** wait for the end of the Saturnalia (380 rudis105Window, 416 W4a) and block ▶ Begin until answered.

## 5. Rival houses (what the CPU houses have that the player does not)

| Flow | Rule | Module |
|---|---|---|
| **Patron stipend** | every rival, every week: **22 + 0.6 × fame** (≈ 30–60 a week; ≈ 750 a house a season) | 23 aiLanistaWeek |
| **Backer floor** | after its week, a rival below **40** is topped up toward 40 by at most one more stipend (22 + 0.6 × fame), **once a season** per house (`m.e112top`) | 427-v112econ (flavius_v112econoff) |
| Bail-out | a rival below **−60** is bought by a new backer: treasury set to 120, −8 fame | 23 aiLanistaWeek |
| Training | regime by Discipline (`rivalTrain`, 88): 6/15/30 a week | 88-v68 |
| Care | Medicus/surgeon by chance (.35 + honor/300) when coin > 30/50 (318 `care101Cpu`: Medicus hours + half coin); limbs when coin > 60 + 20 a limb | 23, 17, 318 |
| Gear | `arm94AutoShop`: repairs above `rivFloor` 40, buys up to `rivMax` 80 a week | 225, 339 |
| Building | chance .14 + ambition/700 a week, only with **2.2 × the cost** in hand | 23 aiLanistaWeek |
| Recruiting | sign the best value it can afford (ask × 4 < coin) when below `2 + ambition/28` fighters; a thin barracks (< 3) refilled at ask × 3 ≤ max(30, coin); over the fame gate at ask × fameBypassX (1.35+) | 17 cpuLeagueWeek, 23 |
| Morale / promotion | tickets 4, meals 3, bonuses, feeding a city 10, criers 6, sponsoring 18 | 23 |
| Advisors | rival councils train with coin (`adv98RivalWeek`) | 256-v98adv |
| Renewals | at contract end: stay if morale ≥ 35 and coin ≥ 2 × ask (75%); off-season raises signed when coin ≥ 8 × the new wage | 17, 348 |

Rivals pay the same wages, travel nothing (the road is the player's), and earn the same fees, purses, gate and prizes.

## 6. Renown, perk points and fame (Manager)

* **Perk points come only from Renown** (363, decided 2026-10-16: REPLACES the free +1 a week). A level costs `REN105.cost(lv)` =
  6 + 2 × ⌊lv / 12⌋ Renown and pays 1 perk point. Kill switch flavius_v105doff (old +1 a week).
* **Renown sources** (`REN105.amt`): a bout won 10 · a kept pledge 15 · 2+ fighters improving in a training week 10 · an exhibition 5 ·
  a signing with OVR ≥ 62 or potential ≥ 75 10 · a full house (≥ 90% capacity) 10 · a Superbus round played 15, won 15, the final won 30 ·
  the final table podium 50 / 35 / 20 · **Winter Classic Cup 20** (415) · **Consilium goals** 20 (top N) / 15 (wins) / 20 (a fighter
  +4 OVR) / 20 (a tiro wins) (414 `A109_GREN`, paid when the next Winter Quarters open). Renown is muted inside Classic bouts.
* **Fame** (gates recruits' interest `reqFame`, the gate share, the Quaestor's cap, rivals' patrons): +2/4/8 a win by tier (× show),
  Superbus 2/4/10, league 1st +5, feeds/sponsoring +1/+2, a death −2, a caught rig −12; ×0.92 at every season turn.

## 7. The ledger (413, w.led109) — what its categories really hold

413 books every change of the player's coin by the first function on the stack (`LED109_FN`), a few lines found by text
(`LED109_LN`), else the last clicked `data-mg` action (2.5 s), else **Senate & other**. Found while measuring (tools/mgrsim2.js `ptag`):
* `wages` = everything inside endWeek without its own function: wages **and** the training regime, personal trainers, the syndicate's
  interest. Contract wages alone are 95–100% of it for a house on Standard drills.
* `repairs` holds the Armory's buys (225's inner `pay`/`get` closures carry no table name; the clicked action decides).
* `sales` holds blood money (`buyBack`, `settlePending`).
* Paying the syndicate 50 (`loanpay`) is not in `LED109_ACT` → Senate & other (only "pay it all" is booked as Loans).
* `patron` (v1.12, 427) holds the player's weekly patron stipend only.
* `senate` holds the Quaestor's Ledger, the Senate's wage refunds for byes / bout-less playoff weeks, the advisors' coin and the
  Debtor's Gambit; the weekly gate share is booked as `purses`.

## 8. Online (separate economy — no Manager coin crosses over)

Online houses keep one **house treasury** (v0.92 ONE TREASURY, decisions 2026-10-06: purses replaced, every survival award 100% to the
house). Sources: survival awards by rank (server `onlcore`, 111-onlcore shared rules), wagers, ticket prices to the host/pot, rank-up gifts,
auction sales; sinks: gear repairs (v0.91 ONLINE ECONOMY II, 197-v91econ), market buys, auction bids (the winning coin leaves the game),
tickets, restock. Rules live in `src/online/111-onlcore.js` (copied to `server/src/onlcore.js` by tools/mkserver.js) and `server/src/routes.js`;
the last balance pass is tools/plans/balance100/REPORT.md §3 (Issued-kit houses bank 2,000–6,300 by day 90 with little to buy).

## 9. Measuring

`node tools/mgrsim2.js flavius-arena.html --profiles careful,spendthrift,mimic --seeds 1-12 --seasons 5 --par 2 --out rows.jsonl`
plays whole careers through the game's own functions (set-off + travel, v1.05 recruiting + Recruiter/woo hours, Winter Quarters, the
Classic, rudis asks) and writes one JSON row per run per season (curve, the 413 ledger, wages, Renown, rivals' lows). `--ls` sets kill
switches, `--patch` applies a sim-only tuning (never committed to the game). See tools/plans/econ111/REPORT.md for the latest numbers.
