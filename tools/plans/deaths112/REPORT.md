# Deaths, blood money and the fame gate (his 2a of 2026-10-23) — REPORT

Measured 2026-10-31 on v1.14b (patron stipend P1, rival floor P6 and Trades 2 in the game) with `tools/mgrsim2.js`.

**Report only: nothing here is in the game.** Every "G" fix is a game-rule patch applied only inside the sim (`--patch`, `patches/G*.js`);
every "S" batch only changes how the scripted lanista plays (`--simk`).

**Setup:** a founded house on Normal, careful profile, 12 seeds × 5 seasons, same seeds in every batch. 15 batches ≈ 2.6 h.
Raw rows + logs: `out/*.jsonl`, `out/*.log` · per-season tables + the Fate funnel: `python3 dsum.py out/X.jsonl` · the §3 table:
`python3 dcmp2.py out/*.jsonl` · re-run/resume: `sh runbatches.sh <batches>` (`--skip-done` counts a seed with any row as done).

## 1. In one paragraph
The careful house loses 2.4 fighters a season (3.1 in S1, 2.0 by S5) and ranks 10.5 of 13. Every rival house loses 2.5 a season too: the
deaths are the league's normal rate. The difference is who dies and why the house stays weak: its barracks is a revolving door of 1★ tirones,
roster rating 45 against the rivals' 67 (the rivals climb 63 → 71 over five seasons). Deaths and the low rank both come from the weak roster.
Cutting deaths (G35) does not move the rank.

## 2. Causes, ranked (baseline S0base)
1. **Weak roster → low Crowd Favor → condemned.** Player fighters average OVR 42, rival undercard 55; CF 13.8 vs 19.3; condemned after 74% of
   bouts (rivals 61%), beaten 86% (68%). Same OVR band → same death rate (under 45: 33% vs 33%): no player-specific lethality. 87% of the
   player's bouts are fought by rookies (≤ 3 bouts); 80% of deaths are in the undercard. (17 `makeNight`, the fight AI, 17 `fateRow`.)
2. **The editor kills 80% of the unpaid condemned.** `RULES_DEF.death` 80 (20% clemency), rookies spared half the time (`rookmercy` 50).
   Player: condemned 74% → clemency 53% → 35% of bouts end in death. Deaths per bout 0.29 vs rivals 0.21. (17 `leagueFate`, v0.21.)
3. **Blood money is never paid.** 168 asks, 0 paid: the dead are OVR 44 (median), price 46, treasury 209. The careful rule buys back only
   OVR ≥ 58; for a free-to-replace tiro refusing is rational. 51-v49 `newcomerHouse` half price needs ≤ 2 fighters and < 120 coin — never met.
4. **The fame trap.** −2 fame a death, 1.1 wins a season: fame stays 4–7 all career (rivals 46 → 68), under the 2★ gate (5) most weeks, never
   near 3★ (18). 329 of 345 signings were 1★. (17 `killFighter`, `STAR_FAME`, `reqFame`, `fameBypassX`.)
5. **Coin for wages.** Even with the gate open (G4), a house keeping 6 weeks of wages can't pay a 2–3★ ask (≈10 a week to spare). Rivals get
   ≈750 a season from their patron and build. (The sim's reserve rule, 23 `aiLanistaWeek`, 427.)
- Not causes: wounds carried into bouts, morale (23 of 483 bouts), war/untreated wounds/flight (1 death in 60 seasons), the thumb (11 of 17 down).

## 3. Baseline against every proposal (12 seeds × 5 seasons)
Noise: standard error ≈ 0.4–0.7 on rank, ≈ 0.2 on deaths → a rank difference under ≈ 1.2 places is noise.

| batch | what changes | deaths/season | rank | top-7 | coin end (med) | blood money/season | fame | wins/season | roster me/rivals | collapses | rival deaths/house |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S0base | nothing (the game today) | 2.37 | 10.5 | 12/60 | 248 | 0 | 6 | 1.1 | 45/67 | 0 | 2.46 |
| S1blood | sim: buys back all but the worst if coin ≥ price + 2 weeks' wages | 1.02 | 9.8 | 15/60 | 197 | 98 | 10 | 1.5 | 45/67 | 0 | 2.46 |
| S2fame | sim: buys fame toward 18, pays the gate wage | 2.45 | 9.1 | 18/60 | 274 | 18 | 17 | 1.8 | 50/67 | 0 | 2.51 |
| S3both | sim: S1 + S2 | 1.65 | 10.8 | 11/60 | 170 | 71 | 8 | 1.0 | 45/67 | 0 | 2.47 |
| S4ent | sim: ≤ 2 bouts a week, only fighters in a tier's range | 2.35 | 9.6 | 15/60 | 328 | 9 | 10 | 1.6 | 48/67 | 0 | 2.43 |
| S5player | sim: S2 + a 3-week reserve | 2.45 | 8.8 | 20/60 | 180 | 23 | 17 | 2.1 | 47/67 | 0 | 2.50 |
| S6real | sim: S1 + S5 | 2.05 | 10.2 | 13/60 | 142 | 48 | 13 | 1.5 | 47/67 | 0 | 2.51 |
| G1clem | game: 40% clemency under fame 18 | 1.88 | 10.1 | 14/60 | 245 | 22 | 9 | 1.3 | 46/67 | 0 | 2.44 |
| G3half | game: half-price blood money under fame 18 (+ S1 rule) | 0.75 | 10.8 | 5/58 | 194 | 51 | 6 | 1.1 | 45/67 | 1 | 2.39 |
| G4gate | game: STAR_FAME [0,0,0,10,28,50] | 2.40 | 10.7 | 12/60 | 253 | 4 | 6 | 1.2 | 47/67 | 0 | 2.40 |
| G5fame | game: no −2 fame for a death under fame 18 | 2.05 | 10.2 | 13/60 | 262 | 8 | 8 | 1.2 | 47/68 | 0 | 2.36 |
| G6med | game: each Medicus level −10 lethality, every house | 1.85 | 10.5 | 11/60 | 230 | 7 | 5 | 1.0 | 45/68 | 0 | 1.71 |
| G4S5 | G4 + S5player | 2.26 | 9.3 | 22/56 | 200 | 40 | 17 | 1.7 | 48/67 | 1 | 2.44 |
| G35 | G3 + G5 (+ S1 rule) | 0.47 | 10.1 | 15/59 | 238 | 77 | 13 | 1.4 | 47/67 | 1 | 2.36 |
| PKG | G3 + G4 + G5 with S6real | 1.81 | 9.7 | 14/58 | 178 | 57 | 15 | 1.6 | 47/67 | 1 | 2.43 |

- **Deaths are easy to cut:** G35 → 0.47 a season (0.2–0.6 in S2–S5) at a median price of 24; fame 6 → 13–16. G3 alone 0.75; just paying
  under today's rules (S1) 1.0.
- **No game rule moved the rank beyond noise** (9.7–10.8); the roster stays 45–48 vs 67.
- **Only play style moves the rank, close to noise:** S5player 8.8, S2fame 9.1 (coin on fame + wages); S6real (+ buy-backs) back to 10.2.
- **The fame gate doesn't limit signings:** G4 brings 40 2★ signings in S1 but they die or walk, roster +2. G4S5 ≈ +1 place (noise), more
  feature/main-event deaths.
- **Everything at once (PKG) dies more than G35** (1.8 vs 0.5): coin goes to fame and wages, less for blood money.

## 4. Side effects
- Rivals: G1/G3/G5 leave them unchanged (deaths 2.36–2.46 a house, end coin 291–310; a rival below 0 at week's end in 1–5 of 60 seasons in
  every batch). **G6 changes the whole league:** rivals die 30% less (2.46 → 1.71), so the league gets stronger.
- Economy: blood money costs 50–100 a season; season-end treasury 248 → 194–238. G3half, G35, G4S5, PKG each have 1 collapse in 12 runs
  (baseline 0), in S2–S5, from seeds that paid blood money into the red. No inflation.
- Feel: with G35 the tirones survive; the median OVR of the dead drops 44 → 37 (only fighters the house chose not to save). G1 hides the
  decision; G3 keeps the player's choice and makes it cheaper.

## 5. What each fix would REPLACE
- G3: 51-v49 `newcomerHouse`'s condition (v0.49: ≤ 2 fighters and < 120 coin) → "fame under 18" (or either).
- G5: 17 `killFighter`'s −2 fame per death (docs/economy.md §6) → 0 while under fame 18.
- G1: `RULES_DEF.death` 80 (v0.21) → 60 under fame 18.
- G4: `STAR_FAME [0,0,5,18,36,56]` in 17.
- G6: gives the Medicus (256; 318/351 treat injuries only) a second job at the Fate, for every house.
- The S batches change nothing in the game (at most, advice).

## 6. Caveats
- The game's AI fights every bout, the player's too; a human wins more, so the rank here is pessimistic.
- The careful lanista enters its best fit fighter per bout (≤ 3 a week), keeps 6 weeks of wages, buys back only OVR ≥ 58 unless a batch
  says otherwise, never takes the Debtor's Gambit.
- 12 seeds: a deaths difference ≥ 0.4 is real; a rank difference under ≈ 1.2 is not.
- G35 hit the runner's time limit; its two half-written seeds were dropped and re-run.
