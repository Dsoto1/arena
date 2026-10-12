# v1.0 balance pass — Play Now classes · Manager economy · Online coin

Measure and propose only: no game file changed. All-CPU headless sims of flavius-arena.html at 0a5c073 (seats on the Fighter mind).
Scripts tools/balance100/, raw output tools/plans/balance100/raw/ (full tables: raw/classes_tables.md, raw/mgr_tables.md, raw/onlcoin_*.md).

## 1. Play Now classes (13,000 events; 3,000 Classics)
Win % (gap vs the family's fair share per seat); **bold** = beyond ±20% and the 95% CI excludes fair.

| Family (fair) | Sol | Roy | Hero | Slave | Vet | Ama | Ven | Dam |
|---|---|---|---|---|---|---|---|---|
| Classics (25) | 28.4 | 27.6 | 27.1 | 26.1 | 26.7 | **32.6 +30%** | 24.0 | **7.4 −71%** |
| Triumviratus (33.3) | 30.3 | **25.7** | 39.4 | 28.2 | **44.0** | **44.8** | 30.0 | **24.6** |
| Familia (41.6) | 43.9 | 43.1 | **50.5** | 37.4 | 49.3 | **52.3** | 43.4 | **13.6** |
| Ludus (25) | 29.0 | **15.9** | **30.9** | 23.3 | 22.9 | 26.5 | 26.9 | 23.8 |
| Golden Eagle (37.5) | 40.7 | 31.0 | 40.8 | 36.6 | 37.5 | 43.6 | **51.0** | **19.5** |
| Orpheus (18.8) | 21.2 | 19.2 | 19.6 | 20.2 | 19.1 | **22.8** | 21.8 | **6.7** |
| Juggernaut (38.1) | 37.4 | **30.1** | 37.5 | 41.3 | 38.6 | 39.7 | 44.4 | 35.5 |
| Gauntlet (28.6) | 31.0 | **38.8** | 32.1 | **20.1** | **39.7** | **38.5** | banned | **0.0** |
| Commodus co-op (49.4) | 48.7 | 49.7 | 50.6 | 47.0 | 49.9 | 52.4 | 56.9 | **39.5** |
Naumachia all within ±5%, Chariot within ±13%.

Seat bias: Chariot seat 1 37.8% vs seat 4 12.0% (turn order = seat order); Orpheus seat 1 10.6% vs ~21%; Golden Eagle team A 30% vs B 45%;
Naumachia team A 47.4 vs B 40.6; Classics fine. Beasts: 14% of Classic eliminations; in Golden Eagle and Orpheus the bear eliminates more than gladiators.

What-if (Classics, 1,200 each): Damnatio as is 7.2% (Fate survival 10.8) · pelted every other Resolve 11.8 · never pelted 11.9 · + Galea + Belt I 11.7 ·
**every other pelt + Galea + Belt I 15.8 (21.5)**. Amazonia as is 34.2 · nobody jumps the order 34.0 · no Greaves 30.2 · Lorica for her chest 32.4 · **no Falcata 28.1**.

## 2. Manager economy (2 seasons, mgrsim base)
| Config | Runs | Wins | Treasury w24 | Rival avg | Rivals <0 / run | Rivals dead |
|---|---|---|---|---|---|---|
| v1.0 as shipped | 20 | 12.2 | 1711 | 206 | 0.2 | 0 |
| ANY100=play | 17 | 14.1 | 1942 | 201 | 0.3 | 0 |
| ANY100=off | 20 | 11.7 | 1765 | 162 | 0.8 | 0 |
| Advisor effects off | 20 | 12.0 | 1444 | 194 | 0.3 | 0 |
| Armory off | 16 | 12.0 | 2003 | 225 | 0.3 | 0 |
| Rivals keep a build reserve (RIVRES=8) | 12 | 14.8 | 2056 | 404 | 0.4 | 0 |
Advisors +267 coin; every special booked ≈ coin-neutral (+1.9 wins, +0.8 fighters lost). Player coin does not pile up (facility tree 16,400);
rivals run thin (100–200) on a patron stipend + bouts, spending ~1,000 on builds. ANY100=play run 18 stalled >25 min (killed; not reproduced).

## 3. Online coin (2,000 Ranked Classic sims → 120-day house model)
Death 64% a bout; survivors keep 8% of brought weapons and 35% of armor → a class kit is fielded in only 1–2% of bouts; Issued-kit houses bank
2,000–6,300 by day 90 with nothing durable to buy; Veteranus reached by 0–19% of houses in 120 days. Coin ≈ 5/bout at Tiro + gifts (+45%, mostly
rank-up gifts every new gladiator earns again).
What-if: gear home damaged + repair ⅒ + Tiro–Gregarius awards ×3 → kit fielded 30–46%; Glory thresholds ×0.5 → Veteranus 87–100%;
rank-up gift once per house per rank → gift coin −71%, day-90 treasury 2,022 → 1,470.

## Proposals (none applied — waiting for Virgilante)
Play Now: P1 Damnatio pelted every other Resolve + Galea + Belt I (digital house rule) · P2 Amazonia loses the Falcata · P3 seeded lots for Chariot
turn order, Orpheus corners, Golden Eagle's first team.
Manager: M1 (optional) rivals build only with cost + 8 weeks' wages in hand (league gets easier: player +344 coin, +2.6 wins) · M2 keep advisors +
specials · M3 look at the ANY100=play stall.
Online (server): O1 printed gear comes home damaged (repair ⅒) incl. on a Ranked death + Tiro–Gregarius awards ×3 · O2 halve rank Glory thresholds ·
O3 rank-up gifts once per house per rank (pair with O2).

Caveats: CPUs on the Fighter mind only; scripted Manager lanista never builds/trains/bets; Manager noise ±1 win / ±150 coin.
