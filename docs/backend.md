# The online backend

How to run, test, extend, deploy and roll back the Online Arena server. The protocol history and every decision behind
it are in CLAUDE.md (§3 "Online"); this page is the working manual.

## Pieces

```
server/
  template.yaml        the CloudFormation stack: WebSocket API, one Lambda (Node 24, arm64), one DynamoDB table (TTL on `ttl`),
                       Cognito (Google), the budget kill switch
  deploy.sh            package + deploy from AWS CloudShell
  src/index.js         the Lambda handler: $connect (token / dev / guest), $disconnect, $default → route(t, d, ctx)
  src/routes.js        every request (makeRoutes → route); the in-page mock mirrors it
  src/harden93.js      v0.93: idempotency (rid), server texts → codes, internal errors → a ref
  src/store.js         two stores with one interface: memory (tests) and dynamo
  src/jwt.js           Cognito ID-token check
  src/onlcore.js       GENERATED copy of src/111-onlcore.js (the shared rules) — never edit the copy
  src/catalog.json     the printed gear by level (tools/mkserver.js, from the built game)
  src/kits92.json      class kits (tools/mkserver.js)
  src/texts93.json     every player-facing server text with its stable code (tools/i18n/srvtext93.js)
  src/build.json       the server's version stamp (tools/srvstamp.js)
  test/*.test.js       node test suites (npm test); test/localws.js runs the handler on a local WebSocket
```

## Run and test locally

```sh
cd server && npm test                 # every suite, the memory store, a fake clock
node test/v93.test.js                 # one suite
cd server && npm i && node test/localws.js   # the real handler on ws://127.0.0.1 (needs the ws package)
```

The page talks to the **mock** (`MOCK_ROUTES` in `src/112-online.js` and later modules, saved in localStorage) unless
`play/online.json` (or the sign-in card's "Online server" box) names a server. Playwright tests `tonl*` use the mock;
`tonlws*` run the real handler through `server/test/localws.js`.

Test handlers are built with `makeHandler({db: store.memory(), send, dev: true, verifyCfg: {}, now: () => T, limits: false})`:
`limits: false` turns off the general rate limit (a fake clock runs hundreds of requests a second); `limits: {burst, per, mburst, mper}`
sets it for a test.

## A request

`{t, id, d}` in → `{re: id, ok: true, d}` or `{re: id, ok: false, err, code?, mcode?, vals?, …extra}` out. Pushes are `{push: t, d}`.

`route(t, d, ctx)` in order:
1. **rate limit** — one token bucket per account (guests by id, else the socket): `ONLC.RATE93` = 40 burst, 10/s; `match.*`
   has its own bucket (90 burst, 30/s). Over → `code: 'rate_limit'`, `wait` ms. The bucket lives in the Lambda container's
   memory (no database write per request); with several warm containers an abuser gets at most that many times the rate.
2. guests: only `C.GUEST_OK` requests, for 2 hours.
3. sign-in, `NEED_DOMUS`, test houses (Custom only).
4. **idempotency** — a request in `ONLC.IDEM93` with a `rid` (8–40 of `[A-Za-z0-9_-]`) runs once:
   `RID#<acct>` / `<rid>` = `{st: 'busy' | 'done', t, at, out}` kept 10 minutes. A replay gets the stored reply; a rid still running →
   `rid_busy`; the same rid for another request → `rid_reuse`; a request that fails forgets its rid (it changed nothing).
5. the route.

Refusals: `throw fail(code, msg, extra)` (a stable `code` the client can act on) or `throw new Error(msg)` (text only). The
handler turns every refusal into the reply with `harden93.errReply`:
- `err` = the English text (old clients), `code` as thrown, `mcode` + `vals` = the text's stable code and its values
  (from `texts93.json`), so the client shows it in the player's language;
- an **internal** failure (TypeError, a DynamoDB/AWS error, a Node system error, anything that reads like code) never reaches a
  player: `code: 'server_error'`, `err: "The arena hit a snag — try again (ref S-XXXXX)."`, and the full error goes to the log
  (CloudWatch) under that ref.

## Writing a new route

- Put it in `routes.js` (a new `Object.assign(R, {...})` block per version, with a header comment), and the same answer in the mock.
- Read-check-write with versioned writes: `store.putRev` / `editLobby` / `editChar` / `editDomus` retry on a lost race; never `put`
  over an item another request may be changing.
- Money: pay first (`pay92`, versioned), then the change; if the change fails, refund (`back92`). Wrap the change in `soft93(...)`
  so a store failure takes the refund path instead of leaving the coin gone (`errOf93(e)` for errors you turn into text).
- A request that spends, moves or claims something goes into `ONLC.IDEM93` (111-onlcore) — the page then sends a `rid` with it.
- Player text: write plain English in `fail()` / `new Error()`; run `node tools/i18n/srvtext93.js` (codes) and
  `node tools/i18n/srvkeys.js` (the translators' list, part-25) — then the lead translates.
- Tests: a `server/test/vNN.test.js` suite, added to `npm test` in `server/package.json`.

## Data

One table, single-table design; the item list (PK / SK / what) is the header of `server/src/store.js`. v0.93 adds
`RID#<acct>` / `<rid>` (idempotency, ttl ~20 min). Items with a `ttl` (epoch seconds) are dropped by DynamoDB.
Shapes of rooms, gladiators, houses and pieces are built by `ONLC` (`newLobby`, `newChar`, `newDomus`, `pieceInfo` …).

## Versions, deploy, rollout, rollback

- **Protocol** `ONLC.VER` (111-onlcore): `$connect` refuses another version with 426 ("reload"). Bump it only when old clients
  cannot work with the new server; most releases do not (v0.85–v0.93 kept 7).
- **Server stamp**: `node tools/srvstamp.js` writes `server/src/build.json` (game version + code hash) and the page's expected
  server (`src/195-v91srvexp.js`); the Online screens show a chip when they differ.
- **Release** (`sh tools/release.sh X.YY`, then commit + push): Virgilante runs `bash flavius.sh release` in CloudShell. It clones the
  newest release branch from GitHub, deploys the **server first** (only when its code hash changed), then the page, assets, the
  standalone download, and prints the live status.
- **Rollout order** is what keeps both sides working: the server is backwards compatible for one version (v0.93: new server + old
  page still gets `err` in English; new page + old server falls back to the English text), so the server goes first and pages
  update as players reload (the update notice asks them to).
- **Rollback**: `bash flavius.sh release 0.92` deploys that version's branch — its server (the hash differs, so it redeploys) and
  its page. Data stays: items written by the newer server (e.g. `RID#`) are ignored by the older one and expire on their own.
  A protocol bump cannot be rolled back while players hold the newer page — they would be refused until they reload.
- Zips (`flavius-server-N.zip` + game zip) remain the fallback when GitHub is unavailable (`bash flavius.sh server …`).
