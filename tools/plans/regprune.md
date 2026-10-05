# Regression prune candidates (old version tests) — evidence, nothing deleted

Source: `tools/regmap.json` as of 2026-10-05 (each test's executed functions at its last pass; `fi` = function text hashes,
`names` = named functions) and `tools/regstate.json` times (seconds, measured under `-j 3`). 180 of 189 tests have a map
(no map: tv66, t12 — t12's coverage was empty because it closes its pages before the browser; fixed in regcov.js).

Caveats before retiring anything:
- Coverage says which functions RAN, not what was ASSERTED. A test whose functions all run elsewhere can still be the only
  one checking a result (a label, a number, a rule). Read the superset test's assertions before retiring.
- `fi` hashes come from different builds (a map is refreshed only when that test passes), so a strict hash subset is
  understated; the name-based check below is build-independent but ignores anonymous functions.
- Savings are small: the candidates below total ~1.5 min of serial time (~30 s at -j 3).

## 1. Strict subset (strongest)

| test | time | evidence | covered by |
|---|---|---|---|
| **tarena51** | 16 s | function-hash set (1306) ⊂ tanim51 (1423) and ⊂ tv71 (1521); named functions (534) ⊂ tanim51, tv59, tv71, tv81a; 0 functions of its own | tanim51 (same v0.51 module, same Democritus start with the same seats) |

tarena51 checks the fighter panel (board name, warm chips, trophies tip, roster click → `.boardback` swap and back, 3 viewport
sizes via argv). tanim51 starts the identical event but asserts the corpse crew / animations. Merging = move tarena51's
`o.board / o.swap / o.home` checks into tanim51 (one browser, one event) and retire tarena51.

## 2. Near subset (≤ 7 named functions missing from ONE other test)

| test | time | best single superset | missing named functions (what only it adds vs that test) |
|---|---|---|---|
| tv62 | 7 s | tb9 (699/703 names, 99.5% of hashes) | audStop hintsMaster menuHide settingsLive |
| tv51 | 8 s | tmtut46 (463/469) | femCog83 migrateWorld milestoneCard snapshotAll verNotes79 whatsNewHTML |
| tver51 | 10 s | tv50 (645/650) | done mgrMigrate verAsk verLabel verOf — verAsk/verLabel run in NO other test → keep |
| tv60b | 8 s | tb1 (551/558) | bar88Hold hsPillUpdate hsSecret hsTable hsYou menuHide truceWho — truceWho is unique → keep |
| tv65 | 9 s | tv87x (757/764) | absDate absSW audBarsSync specDef specPickSid starsHTML why |

tv62 (five minds: AI tiers, tier chip, seat picker values) and tv51 / tv65 are merge candidates: their missing names are
menu/settings plumbing that other tests run; their unique value is in the assertions (AI tier table, save versioning,
yard hours cards) — fold those assertions into tb9 / tv50 / tv87x respectively if retiring.

## 3. No function of their own (every named function they run also runs in some other test — a union, not one superset)

tv50 (14 s), tv52 (11 s), temp53 (8 s), tv53 (21 s), tv58 (13 s), tv61 (17 s), tv62 (7 s), tv65 (9 s), tv51 (8 s), tarena51 (16 s).

These are the version tests whose CODE is fully exercised elsewhere; they only pay for their assertions. Lowest-value first
by time × overlap: tarena51, tv62, tv51, tv65, then tv58 (ships — tnaum/tnaum2 cover 692/736 names), tv61 (screens —
tmenu3 496/515).

## 4. Keep (old tests with functions nobody else runs)

| test | unique named functions |
|---|---|
| tv64 | advanceMissio markFallen missioCfg missioFromLudus missioHero missioNoCF newMissio startMissio (the only missio test) |
| tanim51 | crewPos gateRC sidelineRC walk |
| tv60 | ludusTip summonToSetup wait |
| t53s | blankLanista lanistaStudioClick lanistaStudioHTML |
| t54a | freeTile toggleMine |
| tv57 | houseTakeRows recallFee |
| tv59 | chTok protoHTML |
| tver51 | verAsk verLabel |
| tv30, tv55, tv56, tstat55, tv60b, tv63 | loanLender · npcRatings · loanSizes · allyOpts · truceWho · cvdSet84 |

**Decided 2026-10-05 (Virgilante):** tarena51 REMOVED (it printed but asserted nothing; tanim51 + tv71 run every function it ran). The rest stay for now.
