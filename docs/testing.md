# Testing

Two kinds: **Playwright** tests of the built page (`tools/tests/*.js`, one test per file, each takes the page path as argv[2])
and **node** suites of the server (`server/test/*.test.js`). The rules for running them (who may run the full suite, when)
are in CLAUDE.md §5 — read those first.

## The page

```sh
sh build.sh                                # must print SYNTAX_OK
node tools/smartreg.js tv93i tonl92        # named tests only (the normal way while building)
node tools/smartreg.js --dry               # what a change-aware run would pick (prints, never runs, writes nothing)
REGJ=1 node tools/smartreg.js <names>      # one worker (online tests are steadier alone; same as -j 1)
sh tools/runreg.sh                         # the plain full runner (the lead, at release)
```

- `smartreg` tests a snapshot (`.regpage.html`), so you can keep building; it re-runs a failure alone (FLAKY when it then
  passes), and keeps its state in `tools/regstate.json` / `tools/regmap.json.gz` (v1.08c: gzipped; a plain regmap.json is read
  only when there is no .gz). A CI FULL run commits both back to the branch ("regression state from run N [skip ci]", the absorb
  job + tools/ci/absorb.js), so pull before your next push; locally, `git checkout tools/regstate.json tools/regmap.json.gz` before
  a commit.
- `--dry` prints the plan, why a test runs (`changed by: …` names the file), and `FULL because: …` when a plan run would be full
  (no full run recorded, no coverage map, a src file removed, the build order of existing files changed — nothing else). A test not
  run for 7+ days is `stale` (the oldest few join a run); it no longer turns every run into a full one. build.sh and smartreg.js are
  not global deps (a new module reaches the tests through its own top-level shape).
- **Test slots (v1.08c, replaces tools/testslot.sh):** every test process smartreg starts holds one of `REGSLOTS` (default 2) slots
  shared by every smartreg on the box (`flock` on /tmp/flavius-reg-slot-N, held by a tiny holder process; the kernel frees it when
  the runner dies, even by SIGKILL). Over that limit a worker waits ("waiting for a test slot … slot 0: pid P tv… since …") and
  gives up after `REGSLOTWAIT` s (default 1200, exit 75). `REGSLOTS=0` = no limit. Every test also runs under `timeout -s KILL`.
- **CI by name:** Actions → regression → Run workflow with `tests` (names) and `repeat` (N): only those tests, each shard running
  its share N times; the report prints `REPEAT <test> p/N` and fails on any first-try failure (the 20× flaky proof).

## Waits and seeded worlds (tools/tests/_wait.js, v1.08c)

A test never sleeps a fixed time before reading state; it waits for the state, and a wait that times out says which state it waited
for: `WAIT <what> timed out after N ms {dump}` (S phase/turn/busy, SPEED, modal, PACE96, CAM, Z99F/Z100, AIM106 figs/tmap/raf,
V108, A93 sync, MGR tab, the element at the point).

```js
const T=require('./_wait');
await T.boot(pg,{seed:1});        // before goto: webdriver/firstrun init (menu:false leaves that to the test) + in-page __W
await T.turnReady(pg);            // a human turn in action/choice, no window, not busy
await T.boardIdle(pg);            // nothing pending: PACE96 depth/dirty/raf, CAM.raf, Z99F, Z100 settle, V108 torch build, AIM106 rAF
await T.aimReady(pg,['__A','__B'],[pt]);   // the targets recorded in AIM106.figs (+ tmap) after the last drawLayers93, canvas on top at pt
await T.popupSettled(pg);         // no window / ask dialog, the 40 ms a11y93 sync has run
const m=await T.saveMark(pg); …; await T.saveDone(pg,m,'career');   // BUS 'save' since the mark
await T.spritesReady(pg); await T.mgrDrawn(pg,'#mgrBody');
/* inside pg.evaluate: await __W.mgrDrawn(), __W.turnReady(), __W.boardIdle(), __W.frames(2), __W.until(()=>cond,'what',ms) */
```

**Seeded worlds (R1, his 1a — test side only):** with `seed` set, `boot` seeds `Math.random` and wraps `newWorld` once the game
script has run: during the call `Date.now` returns a fixed epoch (world id `c…` and fighter ids fixed), `Math.random` is a fresh
seeded stream and the event dice RNG is put aside → the SAME world every run, whatever ran before. An event started without a seed
gets one from the boot seed. A test that needs a later step deterministic (a week end) seeds `Math.random` itself around it (tv95c,
tv104d). `seed:false` = waits only. A new Manager test boots with a seed; when a seeded world lacks what a test needs, pick the
fighter / house by a property (as tv85f does), never by `[0]` of a random list.
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
The online golden also needs `--update` when the lockstep input format changes (v1.01 question port: window answers carry
`kd`/`ds` and their hashes include them); it was recorded with `ONL_N=70` so the stream holds window answers (defend, shield, card).

## The rules in Node: no browser (tools/node, v1.01 D1)

```sh
node tools/node/replay.js [page] [--mode rules|screen|both] [names…]   # every golden (or some) replayed in Node, both modes by default
node tools/node/sim.js <event|all> [seed] [--reps N] [--json]           # headless simEvent(s), t12's CPU seats; prints hash + ms
node tools/node/mkbundle.js [page] [--out dir] [--hash]                 # server/verify/rules.js = the rules of this build
node tools/tests/tnode101.js flavius-arena.html                         # the suite test (plain node, ~1 min)
```

`tnode101` replays all 15 goldens in Node and must meet what Chromium recorded: rules mode (HEADLESS — end hash, RNG.s, results,
per-turn hashes, every online input's pre-hash) and screen mode (+ every log line, the log hash); runs a headless sim of every printed
event; builds the bundle into a temp dir and replays + sims from it. Under smartreg it writes the script's function coverage itself
(`REGCOV`, the same {len, offs} as tools/regcov.js). A Node-only failure with a browser pass means the stub differs from a browser
somewhere the rules can see — find the first differing dice call (wrap `RNG.next` and compare stacks in both, as done for the sort
order) and fix the stub, not the rules. Debug: `NODE_VERBOSE=1` prints page errors as they happen; `NODE_TRACE=file` logs every timer
callback the virtual clock runs.

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

## Bake check (v1.08c)

`node tools/art/bakecheck.js` (about 2–5 minutes; `sh build.sh` first) re-renders a small sample with the real bake scripts in their
`--check` mode and compares it with the committed assets: one class move sheet (`anim100/make.js x2 soldier move --check`) and one beast
(`anim100b/make.js l106 moechus --check`). Nothing committed is touched: sheets, encoder output and copies of the META blocks go to
`tools/art/anim100/out/check/` and `tools/art/anim100b/out/check/` (ignored by the repo). Pass = META exactly equal AND pixels within a
tolerance (the encoders are lossy and version-dependent; `BAKE_TOL_MEAN` 1.0, `BAKE_TOL_MAX` 64 per channel; bytes are not the goal,
his 6a). `--twice` renders each sample twice and compares run 1 with run 2 (is the bake deterministic?); `--compare` only compares what
is in out/check; `--versions` only rewrites `tools/art/BAKE_VERSIONS.json` (node, Playwright, Chromium, WebGL renderer, three.js, PIL,
libwebp, numpy, commit). Run it before any re-bake and after a Playwright / Chromium / PIL bump; commit the versions file when it changes.
Result on 2026-10-21 (Playwright 1.56.1, Chromium 141, SwiftShader, PIL 12.3.0 / libwebp 1.6.0): the class sheet and the lit beast sheets
re-render PIXEL-IDENTICAL (max diff 0) and run 1 equals run 2 — the bake is deterministic here. The 2026-10-18 shadow-sheet difference
was NOT `crop()` and not nondeterminism: see the note at the top of `tools/art/anim100b/l106.js` (`shadowCell` sized its renderer only when
the WIDTH differed, and a new renderer's canvas is already 300 wide).

## Visual checks

`node tools/shot_arena.js <page> <width> <out.png>`, or a short Playwright script that screenshots, then look at it. The
visual-polish rule (CLAUDE.md §1) lists the tests every visual change must keep passing.
