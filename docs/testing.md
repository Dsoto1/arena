# Testing

Two kinds: **Playwright** tests of the built page (`tools/tests/*.js`, one test per file, each takes the page path as argv[2])
and **node** suites of the server (`server/test/*.test.js`). The rules for running them (who may run the full suite, when)
are in CLAUDE.md §5 — read those first.

## The page

```sh
sh build.sh                                # must print SYNTAX_OK
node tools/smartreg.js tv93i tonl92        # named tests only (the normal way while building)
node tools/smartreg.js --dry               # what a change-aware run would pick
REGJ=1 node tools/smartreg.js <names>      # one worker (online tests are steadier alone)
sh tools/runreg.sh                         # the plain full runner (the lead, at release)
```

- `smartreg` tests a snapshot (`.regpage.html`), so you can keep building; it re-runs a failure alone (FLAKY when it then
  passes), and keeps its state in `tools/regstate.json` / `tools/regmap.json` (commit them with a release).
- A new test goes into `tools/tests/` and into the `DEFAULT` list of `tools/runreg.sh`.
- Pass = the test prints `ERRS []` and exits 0. Convention: collect failed expectations in `MISS [...]`, page errors in `ERRS [...]`.
- Tests that need the main menu set `navigator.webdriver=false` and `localStorage flavius_firstrun='shown'` in an init script,
  then wait for `window.FLAVIUS_READY` after `goto` (never a fixed sleep).
- Online tests run against the in-page mock (`localStorage flavius_online77='1'` opens Online); two windows = two players
  (the account id is in sessionStorage). `tonlws*` need `cd server && npm i` (the ws package).
- `ERR92` / `errNew92(mark)` (00c) let a test assert that nothing new was logged.

## Replays: same inputs → same game (tools/replay, v1.01)

The safety net for refactors that must not change the rules (regrouping src/, layers, effects as data, rules in Node).
`tools/replay/golden/*.json.gz` holds 15 recordings: every printed event all-CPU, three with a scripted human in seat 0
(Democritus, Cassian, Gauntlet), and one 2-seat online mock lockstep match. Each recording = the seed + seats/config, 309's replay
record (opening snapshot at the first beginTurn + every human input), and what the match ended with, read by the test-only probe
`src/match/325-v101replay0.js` (on only with `localStorage flavius_replay0=1`): `onlHash` at the start of EVERY turn, the final
`onlHash`, `RNG.s`, turns/round/rotation, winners + reason, each seat's result, the beasts, every log line since the opening.
The online recording keeps the server's input stream and both windows' pre-hash at every input.

```sh
node tools/replay/check.js flavius-arena.html [names…]     # replay all (or some), first divergence per recording
node tools/tests/treplay101.js flavius-arena.html          # the suite test (same thing, ERRS [] on pass)
node tools/replay/record.js flavius-arena.html [names…]    # record MISSING goldens only
node tools/replay/record.js --update flavius-arena.html …  # re-record (overwrites)
```

`REPLAYJ=N` = matches at once (default 3), `ONLINE=0` skips the online one. A failure prints the first turn whose opening hash
differs, the first differing log line (the event), and how far 309's player got. Playback is 309's own `rp100Play`, one fresh
browser context per recording, so state read from outside S (localStorage, Math.random, wall clock) shows up as a divergence.

**When to re-record:** only after a DELIBERATE rule or AI change (new card text, balance, a fixed rule bug) — say so in the
commit. A refactor, a visual change or a perf change must replay unchanged; if it doesn't, the change is wrong, not the golden.
Changing what the probe or `onlHash` reads also needs `--update`.

## The server

```sh
cd server && npm test        # every suite (memory store, fake clock)
node test/v93.test.js        # one suite
```

Suites build the real handler with a memory store and a fake clock (`now: () => T`), connect dev accounts, and send requests
through `$default` exactly like the WebSocket would. `limits: false` turns off the general rate limit.
v93.test.js shows the patterns for authorization, replays (`rid`), races (`Promise.allSettled` on one account), and failure
injection (wrap `db.putRev` / `db.put` to throw like DynamoDB once).

## Translations

`node tools/i18n/check93.js` (keys across every language) and `tools/tests/tv93i.js` (pseudolocalized walk) — see [i18n.md](i18n.md).

## Visual checks

`node tools/shot_arena.js <page> <width> <out.png>`, or a short Playwright script that screenshots, then look at it. The
visual-polish rule (CLAUDE.md §1) lists the tests every visual change must keep passing.
