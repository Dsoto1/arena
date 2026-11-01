# Strength study (his 4a of 2026-10-31) — REPORT

Why the careful house stays at roster rating 45 while rivals climb 63 → 71. Measured 2026-10-31/11-01 on v1.14b with `tools/mgrsim2.js`.
**Report only: nothing here is in the game** — every F fix is a sim-only rule patch (`patches/`). Baseline B0 = the approved deaths fix
G3 + G5 + the smart buy-back rule, applied in every batch. Founded house, Normal, careful profile, 5 seasons; B0, F1, F13 on 24 seeds, the
rest 12. Read back: `python3 tools/plans/strength115/sx.py out/X.jsonl --diag --led`. mgrsim2 gained a read-only `row.sx` log and a `train` knob.

## 1. In one paragraph
The gap is set at signing: rivals sign at OVR ≈63.5 (mostly 2–3★, 92% from the free-agent pool), the house at 45 (442 of 484 signings 1★).
Growth after signing is equal (+6.0 player, +5.4 rival per stint), so fighters leave at 52 vs 69. The house is stuck at 1★ by fame (ends at 9,
under the 3★ gate 18), coin (a rival takes in ≈3.5×) and the Undercard (the tiro meets rival fighters ≈10 OVR stronger, wins 15% vs rivals'
29% → 1.2 wins a season, +2 fame each). Training and turnover are not causes.

## 2. Causes, ranked (B0, 24 seeds × 5 seasons)
1. **Who the house can sign.** Player 4.0 joins/season at OVR 44.9 (1–5★: 442/33/9/0/0); rivals 4.9 per house-season at 63.5
   (1432/1785/2632/810/377), rising 62.5 → 65.0. Join + growth = exit in both (45+6≈52, 63.5+5.4≈69).
   (17 `cpuLeagueWeek`, `STAR_FAME [0,0,5,18,36,56]`, `reqFame`, `offerVerdict`, `askWage`, `fameBypassX`.)
2. **Coin (≈3.5×) per house-season.** Rival in: patron 978 (23 `aiLanistaWeek` 22+0.6×fame, fame 47→69), bouts 912, endWeek 507; out:
   wages 999, building 693, drills 199. Player in: patron 174 (427 P1, 10+0.3×fame), purses 318, Senate 203; wages 468. The careful
   lanista's 6-week reserve means no building (yard 0 vs rivals 1.14), no drills in 91% of fighter-weeks, no 3★ wage.
3. **Undercard → no wins → no fame.** Player entries: 47.1 vs opponents 57.6 (max 62.1), 2.9 rival fighters a bout, wins 15%, CF 14.8.
   A rival's: 59.1 vs 57.0, wins 29%, CF 20.5. (17 `TIERS.under {lo:0,hi:62}`; 17 `makeNight` enters each rival's best fitting fighter
   T.lo−4…T.hi+2, so 55–62 fighters who miss a Feature seat land in the Undercard; 17 `applyBout` +2 fame a win.) → 1.2 wins, fame 9.
4. **Growth — not a cause.** Per fighter-week 0.44 vs 0.64 (rivals drill: 88 `rivalTrain`, 66 `TRAIN_STAT`), but player fighters stay
   15.6 weeks vs 10.2 → equal per stint. 40% of player fighter-weeks are at potential (1★ headroom ≈10, 17 `genGlad`). S1train and F6: no change.
5. **Turnover — not a cause.** Player exits 3.4/season (expired 1.18, retired 0.80, gone 0.63, dead 0.49, moved 0.17, walk-out 0.10);
   rivals 4.8 (dead 2.13, retired 0.93, moved 0.60, expired 0.58).
- Free-agent pool not the driver: ≈59 a week (≈54 fight-night fillers, 17 `fillNight`), 3★+ ≈8.6 a week. F8 cut 64+ fillers 7.8 → 4.9 a
  week; rivals still climbed 62 → 71.

## 3. Baseline against each candidate (rank SE in brackets)
Noise: B0 was 10.69 on seeds 1–12 and 9.90 on 13–24 → a rank difference under ≈1.2 is noise. Runs are not replayable (same seed, different
career), so batches are independent samples.

| batch | change (sim only) | seeds | rank | rank S5 | top-7 | roster me S1→S5 | rivals S1→S5 | deaths/season | coin end (med) | collapses | fame end | wins/season | rival deaths/house | rival end coin | rival seasons <0 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| B0 | G3 + G5 | 24 | 10.29 (0.23) | 9.6 | 21/119 | 45→45 | 63→71 | 0.50 | 200 | 1/24 | 9 | 1.2 | 2.38 | 295 | 8/120 |
| **F1under** | `TIERS.under.hi` 62→54 | 24 | **8.96 (0.39)** | 8.7 | 36/120 | 46→47 | 63→72 | 0.74 | 228 | 0/24 | 13 | 1.7 | 2.36 | 303 | 7/120 |
| F3patron | player patron 22+0.6×fame | 12 | 10.18 (0.58) | 10.0 | 11/60 | 46→52 | 63→71 | 0.63 | 411 | 0/12 | 12 | 1.4 | 2.46 | 296 | 1/60 |
| **F13** | F1 + F3 | 24 | **8.02 (0.44)** | **7.5** | 52/120 | 45→56 | 64→72 | 0.82 | 439 | 0/24 | 23 | 2.2 | 2.20 | 295 | 10/120 |
| F6tiro | 2nd +1 roll under 55, every house | 12 | 10.07 (0.28) | 9.2 | 13/60 | 46→46 | 63→70 | 0.78 | 199 | 0/12 | 7 | 1.4 | 2.43 | 306 | 5/60 |
| F8fill | fillers rated floor + 0..9 | 12 | 10.17 (0.67) | 10.0 | 14/60 | 44→48 | 62→71 | 0.68 | 206 | 0/12 | 13 | 1.4 | 2.43 | 312 | 2/60 |
| F10rivpat | rival patron 12+0.3×fame | 12 | 9.80 (0.70) | 10.0 | 14/60 | 45→47 | 62→68 | 0.55 | 222 | 0/12 | 11 | 1.5 | 2.79 | 205 | 32/60 |
| S1train | sim: Standard drills when affordable | 12 | 10.09 (0.42) | 9.6 | 12/55 | 45→44 | 63→71 | 0.58 | 208 | 0/11 | 8 | 1.2 | 2.42 | 299 | 4/55 |

- F1 is the only single rule that moves the rank (≈1.3 places, same on both seed halves); Undercard gap −10.5 → −4.1 OVR, wins 15% → 21%.
- F3 alone builds the roster (52) and doubles end coin, rank change is noise.
- **F13 (F1 + F3) is best:** ≈2.3 places (seed halves 7.47 / 8.57), S5 rank 7.5, top-7 in 43% of seasons (B0 18%); fame 23 (past the 3★
  gate in seasons 2–3); signings OVR 51.9 (75 of 591 3★+); roster 45 → 56 (gap 23 → 16). Rank by season (seeds 1–12): 8.4 7.4 8.3 7.2 5.9.
- No effect: F6, F8, S1train. F10 only weakens rivals (deaths 2.79, a rival below 0 in 32 of 60 seasons).

## 4. Side effects
- Deaths: B0 0.50, F1 0.74, F13 0.82 a season (still far below 2.4 before the deaths fix) — more Feature/Main entries (F13 3.1 + 1.2 vs
  B0 0.7 + 0.7), opponents there 8–10 OVR stronger.
- Rivals unchanged under F1/F13 (roster 72, end coin 295–303, deaths 2.20–2.36, below 0 in 7–10 of 120); their Undercard entries 2.3 →
  1.5–1.9; their 55–62 fighters move to the Feature (still win 29%).
- Economy: F3/F13 double the player's end coin (200 → 411–439), no collapses.
- Feel: the Undercard becomes a tirones' card a founded house can win; the Feature (56–77) is unchanged.

## 5. What each fix would REPLACE
- F1: 17 `TIERS.under.hi` 62 → 54 (early league, v0.1x; no line in docs/decisions.md). Moves with it: 17 `makeNight` (rivals ≤ 56),
  17 `fillNight` (fillers ≤ 57, new fillers 40), the player's entry checks in 296/319/17 (T.hi+6 → ≤ 60), 229's slot label "≤ 62", 145's tier pick.
- F3: REPLACES 427 P1 "player patron +10 + 0.3×fame a week" (v1.12, his 1a 2026-10-23) with 22 + 0.6×fame (the rivals' own, 23
  `aiLanistaWeek`, v0.29). docs/economy.md §2.
- F6 / F8 / F10: not recommended. STAR_FAME stays (his 3a 2026-10-31).

## 6. Caveats
- The AI fights every bout, the player's too; a human wins more → ranks pessimistic.
- The careful lanista hoards (6-week reserve, drills 9% of weeks, never builds, renews only ≥ roster median − 6); a real player would spend F3's coin.
- Not replayable; SE from per-seed mean ranks; F3/F6/F8/F10/S1train only 12 seeds.
- In the real game the player may enter up to 60 in the Undercard (T.hi + 6); the sim only up to 56.
- Playoff/Superbus weeks add Main entries the house didn't choose (B0 0.7 a season).
