# Manager economy re-measure (v1.12 E1a–E5a) — REPORT

Measured 2026-10-23 on v1.11d (and the Trades 2 work branch for §5) with `tools/mgrsim2.js`. **Report only (his E5a): nothing here is
in the game; every tuning below was a sim-only `--patch`, he approves each one.** Every coin flow: docs/economy.md.

Files here: `targets.md` (the pass/fail table for every batch), `main-summary.md`, `winter-pre-summary.md`, `proposals-summary.md`,
`trade-summary.md` (per-season tables: coin p25/med/p75, ledger, wages, rivals, Renown, Classic, deaths), and the scripts
`summarize.py`, `targets.py`, `chart.py`, `page.py` (the self-contained chart page). The raw rows (≈ 800 JSON lines) are not committed;
re-create them with the commands in §8.

## 1. Targets (his 2026-10-23 line) — the game now

Founded house, Normal start (325 coin), 12 seeds per profile, up to 5 seasons; a run stops when the house collapses.

| target | careful | spendthrift | mimic (the CPU's own rules) |
|---|---|---|---|
| **E1a** in the black (no collapse, no red week) S1–3 | **fail** 3/12 runs (5/12 collapse by S3, 7/12 by S5) | **fail** 0/12 (all collapse in S1) | **fail** 0/12 (10/12 collapse by S3) |
| E1a small reserve after S1 (end-S1 coin, median) | pass 216 | fail (collapsed) | fail 48 |
| E1a mid-table by S3 (median rank of 13) | **fail** 13 (the survivors' S3: 10) | fail | fail |
| **E2a** no rival < 0 at a week's end | **fail** 77% of seasons clean | 83% | 65% |
| E2a ≤ 1 rival < 30 at a week's end | **fail** 32% of seasons | 50% | 26% |
| **E3a** wages 50–65% of spending | **pass** 65% (S1 56%, S2–3 67–69%) | 40% | 56% |
| **E4a** ≈ 1 perk point / 4 weeks | ≈ median 1.07 (mean 1.59; S1 only 0.27–0.58) | 0 | 2.1 |
| E4a winter ≈ 20% of Renown | 28% (S2–5) | — | 0% |

**Reading it:** the careful house does not run dry slowly — it bleeds ≈ 15 coin a week (wages ≈ 28/wk + gear + travel vs ≈ 25/wk in
fees, gate and purses) and is saved twice a season by lump sums (week 11's Superbus/league money, the Quaestor's Ledger sealed in
Winter). A season with few wins → three week-ends in the red → collapse (every collapse in every batch was "3 weeks in the red — the
Debtor's Gambit went unfought"; the sim never takes the Gambit, a human gets it once per career). The rivals have a patron stipend of
22 + 0.6 × fame **a week** (≈ 755 a house a season, as much as their purses); the player's nearest equivalent is the once-a-season
Ledger (≈ 190).

## 2. Coin curves

Chart page: `python3 tools/plans/econ111/page.py <raw dir> out.html` (self-contained; this run's copy is econ111.html in the session
scratchpad). Median treasury per week-end (weeks 1–11, Superbus P1–P3, Winter W), careful band p25–p75:
* careful: 325 → ≈ 95 by week 11 of S1 → 196–245 after the Winter seal; S2–S3 the same saw-tooth one notch lower (lowest median −8 in S3).
  The 5 survivors to S5 are the seeds that won early (S5 median end 890; seed 12 ends on 2,281 = one runaway house).
* spendthrift: below 0 by week 2–4 in 12/12, collapsed in S1 (bets, hard drills, 6–8 fighters on 1.2–1.4× wages).
* mimic (the CPU's rules without the patron): first red week 3–8 of S1 in 12/12 — the CPU's rules only work with the stipend.

## 3. Where the coin goes (careful, ledger 413, mean per season)

| | S1 in | S1 out | S2–5 in | S2–5 out |
|---|---|---|---|---|
| purses (+ gate share, fees) | 366 | | 530 | |
| senate (Ledger, bye/playoff refunds, advisors) | 192 | 1 | 217 | 16 |
| wages (+ drills, trainers, loan interest) | | 359 | | 517 |
| repairs (= Armory buys + repairs) | | 172 | | 95 |
| travel | | 82 | | 77 |
| recruiting | | 20 | | 12 |
| facilities / sales (blood money) / loans | | — | 17 / — / 45 in | 31 / 29 / — |

Contract wages alone are 95–100% of the `wages` line. Rivals per house per season: purses 782, **patron 755**, gate 373 in; wages 778,
**building 516**, drills 164, Armory ≈ 160, blood money 86, advisors 56 out. Rivals dip mostly in the week they build (the 2.2 × cost rule).

**Rivals (E2a):** lowest rival at a week's end, median 15 (min −26); a rival < 0 at a week's end in 23% of seasons; > 1 rival < 30 in 68%.
Mid-week (any moment) almost every season has ≈ 4 houses briefly < 0 (wages land before income in endWeek) — the target is read at
the week's end.

## 4. Winter Quarters, Renown, people

* **What each Winter piece adds** (careful × 12 seeds × 5 seasons, kill switches): collapsed by S3 — now 5, 109a off 3, 109b off 3,
  109c off 4 (by S5: 7 / 6 / 6 / **12**). Perk points / 4 weeks (median) 1.07 → 0.53 with any piece off. The Winter pieces move little
  coin (the Classic pays 60 only to the Cup); they carry Renown (Consilium goals = 655 of 2,370 Renown in S1–5, 28%).
  With 12 seeds ±2 collapses is noise (§7); the clear effect is 109c off (Saturnalia) → 12/12 collapsed by S5.
* **Winter Classic** (founded house): entered 6 of 40 winters, 0 finals, 0 Cups — not seeded 12, no eligible fighter 22 (21 of those =
  the frozen deadline roster held no fit fighter). A taken-over preset (pre:proculus): 13/41 entered, 7 finals, 4 Cups.
* **Renown sources** (careful): wins 960, Consilium goals 655, podium 305, signings 290, Superbus 150. Perk points: S1 1, S2 6, S3 2,
  S4 8, S5 13 (median per season; grows with wins) → ≈ 1 a month on the median but S1 gets ≈ 0.3–0.6 a month.
* **Deaths / retirements / walk-outs** a season (careful, mean): 2.8 / 0.7 / 0.7 in S1, ≈ 2 / 1.5 / 1.5 later — with a roster of 4–5,
  half the barracks dies every season (the sim buys blood money only for OVR ≥ 58 above its reserve). This, not coin, keeps the house
  bottom-table (median rank 12–13 in S1–3).
* A taken-over preset (pre:proculus, 200 + its coin): S1 end 416, rank 7, but wages 75% of spending and still 5/12 collapsed by S3.

## 5. Trades 2 coin rate (426-v112trade, branch claude/cloud-credits-usage-vq4w63, merged here for the study)

`--buy`: once a week before the deadline the house buys the best rival fighter its treasury can pay for through 23's own 1-for-1 offer
(ludusClick 'tradego' with every wrapper: 378 settling-in, 393 deadline, 426 values), giving its least valuable fighter + exactly the coin
gap the game's rule asks. careful keeps its reserve, spendthrift none. 12 seeds × 3 seasons each; t112 = Trades 2, t111 = the same build
with `flavius_v112tradeoff=1` (the old rule).

| careful | buys (all accepted) | coin paid (med) | OVR in / given | wage +/wk | first buy | collapsed by S3 | runs in the black | S3 rank | S1 end coin |
|---|---|---|---|---|---|---|---|---|---|
| no buying (t112base) | — | — | — | — | — | 1/12 | 3/12 | 12.5 | 205 |
| **Trades 2** | 57 (2.8 a run in S1) | **73** | **73 / 44** | +14 | week 2 | 2/12 | 5/12 | 10.5 | 251 |
| old rule | 34 (1.3 in S1) | 130 | 63.5 / 45.5 | +10 | week 1 | 3/12 | 4/12 | 13 | 316 |
| spendthrift, Trades 2 | 29 | 86 | 70 / 48 | +13 | week 2 | 12/12 | 0/12 | — | — |

**Finding:** not a coin exploit (no house got rich by trading; the spendthrift still collapses; deaths rise to 4.6 a season because the
stars fight the main event), but it IS a cheap-strength shortcut: in week 2 a founded house with ≈ 250 coin turns a 44-OVR tiro + ≈ 70
coin into a 73-OVR star — ≈ 2.5 coin per rating point gained (old rule ≈ 7), past the fame gate that keeps such fighters out of the free
market, and again every week until the deadline (one offer per house a week). Why: under T2a the house values what it RECEIVES at full
tr106Val too, so a worthless tiro still counts ≈ 90 "coin" (OVR × 2.2 − wage × 2). Options for him (not built): (a) a house values a
fighter it receives at ≈ 50% when he would sit below its own roster's median OVR (he would not fight for them); (b) 394's coin floor
scales with the star's tier (e.g. 20 / 60 / 120 for 1–2★ / 3★ / 4★+); (c) one bought fighter per 4 weeks for the player. (a) keeps
coin 1:1 honest.

## 6. Tuning proposals (sim-only; careful × 12 seeds × 5 seasons each, the same seeds as "now")

| # | what (module, sim patch) | collapsed by S3 | by S5 | runs in the black S1–3 | S1 end | S3 rank | rival-seasons < 0 | ≤1 rival < 30 | perk / 4 wk (mean) |
|---|---|---|---|---|---|---|---|---|---|
| now | v1.11d | 5/12 | 7/12 | 3/12 | 216 | 13 | 11/47 | 32% | 1.59 |
| **P1** | the player's house gets a small **patron**: +10 + 0.3 × fame a week in season (23 aiLanistaWeek's rule at ≈ 45%, ≈ 130–170 a season; a line in 87's endWeek wrapper) | **0/12** | **0/12** | **12/12** | 256 | 12 | 10/60 | 50% | 1.29 |
| P2 | appearance fees +25%: 15 / 30 / 50 (87 `ECON.fees`, every house) | 1/12 | 6/12 | 6/12 | 260 | 10.5 | 11/55 | 47% | 1.38 |
| P3 | gate share base 5 → 10 (87 `ECON.gateBase`, every house) | 0/12 | 1/12 | 7/12 | 249 | 12 | 4/59 | 61% | 1.15 |
| P4 | wage asks −12% (87 `ECON.wage` 0.85 → 0.75) | 3/12 | 7/12 | 3/12 | 246 | 12.5 | 8/52 | 63% | 1.23 |
| P5 | Renown per level 6 → 4 (363 `REN105.base`) | 3/12 | 8/12 | 5/12 | 208 | 12.5 | 10/52 | 44% | 1.54 (S1 1.24) |
| **P6** | rivals' **backer floor**: a rival below 40 after its week is topped up toward 40 by at most one more stipend (23 aiLanistaWeek) | 4/12 | 10/12 | 2/12 | 190 | 12.5 | **0/47** | **81%** | 1.03 |
| P7 | P1 + P5 + P6 together | 1/12 | 1/12 | 11/12 | 290 | 11.5 | **0/58** | 79% | 2.14 (too many) |

My picks: **P1 for E1a** (the only lever that kept the careful house out of collapse in all 12 seeds and out of the red in 10/12 over
5 seasons; it gives the player a small version of what every rival already has) and **P6 for E2a** (no rival < 0 at a week's end in any
season; ≤ 1 under 30 in 81% of seasons — the rest are one-week dips the week a house builds). P3 is the cheaper all-houses alternative
to P1 (0/12 collapsed by S3, 1/12 by S5, rivals better too) but leaves red weeks in 5/12 runs. P2 / P4 help little; P5 is not needed
(E4a is already ≈ 1 a month on the median; only S1 is slow) and with P1 + P6 it overshoots (P7: 2.1 a month). Even with P1 + P6 the house
is solvent but **not mid-table by S3** (rank 11.5): that target is about deaths (§4) and the fame gate on recruits, not coin — a
separate study (blood-money price, the careful sim's entries). P6 alone made the player's runs worse (10/12 collapsed by S5): solvent
rivals keep their fighters and gear — read P6 together with P1.

## 7. Caveats (the scripted lanista)

* The bouts are fought by the game's AI for every side, the player's included (no human tactics); entries = the best fit fighter per
  bout. A human wins more, so E1a and the S3 rank are pessimistic.
* The sim never takes the **Debtor's Gambit** (a human gets one per career) — every collapse here was 3 week-ends in the red.
* careful: blood money only for OVR ≥ 58 above its reserve; Standard drills; no specials, no bets; spendthrift bets 10% of the treasury,
  hard drills, 1.2–1.4× wages; mimic = the CPU's rules without their patron.
* Same seed = same career (virtual clock, per-function random streams), but any rule change sends a career elsewhere — compare
  distributions, not seeds. With 12 seeds ±2 collapses is noise; P1's 0/12 vs 5/12 and P6's 0 vs 11 rival-seasons < 0 are not.
* The Trades 2 numbers come from the work-branch build (its own baseline t112base; its seeds differ from "now").
* Perk points = `m.perkPts` gained (the sim never spends them).

## 8. Runs and times

| batch | runs | seasons | wall time (2 browsers) |
|---|---|---|---|
| main (careful, spendthrift, mimic × 12) | 36 | ≤ 5 | ≈ 25 min (+ 1 run resumed after the container restart) |
| 109a / 109b / 109c off (careful × 12) | 36 | ≤ 5 | 10.4 + 9.8 + 10.1 min |
| pre:proculus (careful × 12) | 12 | ≤ 5 | ≈ 8 min |
| Trades 2 (base / buy / old-rule buy; careful + spendthrift × 12) | 72 | ≤ 3 | 8.7 + 7.6 + 8.1 min |
| proposals P1–P7 (careful × 12) | 84 | ≤ 5 | 10–14 min each |

240 runs. A careful 5-season run ≈ 95–140 s, a spendthrift run ≈ 15 s (collapses in S1). Command:
`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/mgrsim2.js flavius-arena.html --profiles careful,spendthrift,mimic --seeds 1-12 --seasons 5 --par 2 --tag main --skip-done --out rows.jsonl`
(`--ls '{"flavius_v109aoff":"1"}'`, `--patch "$(cat P1.js)"`, `--buy`, `--start pre:proculus` for the others). The patches:
* P1 `{const b=endWeek;endWeek=async function(){try{const w=W_(),m=me();if(w&&!w.dead&&m&&w._p1!==w.season*100+w.week&&!(typeof po104Ph==='function'&&po104Ph(w)==='off')){w._p1=w.season*100+w.week;m.coin+=Math.round(10+(m.fame||0)*0.3)}}catch(e){}return b.apply(this,arguments)}}`
* P2 `TIERS.under.fee=15;TIERS.feature.fee=30;TIERS.main.fee=50;` · P3 `ECON.gateBase=10;` · P4 `WAGE_MUL=0.75;` · P5 `REN105.base=4;`
* P6 `{const b=aiLanistaWeek;aiLanistaWeek=function(){const r=b.apply(this,arguments);try{for(const x of W_().mgrs){if(x.isPlayer||x.dead||x.sica)continue;if(x.coin<40)x.coin+=Math.min(40-x.coin,Math.round(22+(x.fame||0)*0.6))}}catch(e){}return r}}`

mgrsim2 changes this round: `--skip-done` (resume), a dead browser is relaunched, a failed context close no longer kills the batch
(the crash at the restart), `--buy` (the Trades 2 study).
