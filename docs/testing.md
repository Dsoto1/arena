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
