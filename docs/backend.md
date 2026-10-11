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
`RID#<acct>` / `<rid>` (idempotency, ttl ~20 min). v0.94 adds `TOK#<char>` / `PIC` and `TOKUP#<char>` / `U#<up>` (token pictures, below). Items with a `ttl` (epoch seconds) are dropped by DynamoDB.
Shapes of rooms, gladiators, houses and pieces are built by `ONLC` (`newLobby`, `newChar`, `newDomus`, `pieceInfo` …).

## Token pictures (v0.94)

Online gladiators may wear a posable 3D token (the v0.93 modeller). The owner's browser renders the 8-facing sheet once and uploads it;
the server stores the picture and every screen downloads it by hash. Matches never run 3D and never hash the picture (drawing only).

- `char.tok {char, up, i, n, b, meta, pose, pk}` — one part of an upload. API Gateway WebSocket frames are at most **32 KB** and browsers
  never fragment a message, so a picture goes up in parts of **≤ 24000 base64 characters** (`ONLC.TOK94.PART`, ≤ 4 parts); each part is
  its own request with its own `rid` (`char.tok` is in `IDEM93`). Part 0 carries `meta` and the pose. The staging item
  `TOKUP#<char>` / `U#<up>` (ttl 1 h) collects the parts; the last one checks the whole picture and stores it, answering
  `{done, h, tok94, char}` (earlier parts answer `{got: i}`).
- `char.tok {char, off: 1}` — back to the sculpted token (deletes the picture, drops the reference).
- `tok.get {c, h?}` — `{c, h, b, meta, pose, pk}`, `{same: 1}` when the caller already holds `h`, `{none: 1}` when there is none. Guests may
  call it (`GUEST_OK`). One reply ≤ ~90 KB (API Gateway's message limit is 128 KB).
- **Limits** (shared: the v0.94 section of `111-onlcore`, `TOK94`): WebP only — `RIFF` + `WEBP` magic and a RIFF size that matches the
  length; ≤ **64 KB decoded** (`MAX`; the game's sheets are ~35–45 KB at quality 0.9 and the client steps the quality down until it fits,
  and 64 KB keeps the largest part plan at 4 frames and the download well under 128 KB); width exactly `8 × meta[0]` and height `meta[1]`,
  read from the VP8 / VP8L / VP8X header; meta = four numbers, cell 40–240 × 60–240 px, anchor inside the cell; pose JSON ≤ 600 B, preset
  key ≤ 16 `[a-z0-9]`; owner only; refused (`in_match`) while the lanista is in a waiting room or a live match (`busyIn`, like
  `char.edit`); ≤ `DAY_MAX` (12) pictures saved per account per online day (`ACCT … tq94`, `store.quota`); the general rate limit applies.
  Refusal codes: `tok_part` (order / part size), `tok_bad` (not WebP, wrong size, too big, bad meta/pose), `tok_day`, `in_match`.
- **Data**: `TOK#<char>` / `PIC` = `{owner, h, b (base64), meta, pose, pk, at, v}` — its own item, never inside `CHAR` / `ACCT` (those are
  read and rewritten all the time). The gladiator only carries `ch.tok94 = {h, at}`; `ONLC.kitOf` passes it on as `kit.look.t94 = {c, h}`
  (`h` = `tokHash94` of the bytes, the same in the page and the server), so rooms, seats and matches know what to fetch.
- **Abuse**: the server checks the type, size and dimensions, **not the content** — a modified client can upload any WebP of the right size
  (an offensive picture on a token). Mitigations today: owner only, the daily cap, one picture per gladiator (replacing it deletes the old
  one). If it is ever abused: a report/hide route, a manual `DeleteItem` on `TOK#<char>` (clients fall back to the sculpted token), or turning
  the feature off by making `tok.get` answer `{none:1}`.
- **Rollback**: an older server does not know `char.tok` / `tok.get` — the page shows "the server is older" on Save and draws sculpted tokens
  (a failed fetch is never retried for a minute and never blocks a match). `TOK#` / `TOKUP#` items and `ch.tok94` are ignored by older
  servers; `kit.look.t94` passes through older `cleanLook` callers untouched or is dropped (both are fine).

## Rooms, houses and ranks (v0.98)

Shared rules: the v0.98 section at the end of `111-onlcore`; routes: the "v0.98" block in `routes.js` (just before the rate limiter); mock: `252-v98onl`.
No protocol bump — an older page still works (it cannot set a password, and a 🔒 room refuses it with `pw_need`).

- **Passwords (Custom rooms only).** `lobby.create {pw}` or the host's `lobby.set {id, pw}` (`''` removes it). The hash lives in its own item
  `LOBBY#<id>` / `PW98` = `{s, h, ttl}` with `h = pwHash98(s, pw)` (SHA-256 of `flavius98|salt|password`, pure JS so the mock matches); the room item only
  carries `pw: 1`, so lists, pushes and members never see it. `lobby.join {id, pw}` → `pw_need` (none given), `pw_bad` (wrong), `slow` (more than
  `PW98.TRIES` tries in `PW98.WIN`; counted on `ACCT … pwq98`). Ranked → `pw_ranked`. An invitation (`lobby.accept`, `lobby.join {inv}`) needs no password;
  `quickPick` never picks a 🔒 room. Tickets are not gated.
- **Region.** `lobby.create` / `lobby.quick` may send `tz` (the browser's time zone); otherwise the presence entry's (`A.here.tz`). `regionOf98(tz)` → one of
  `REGIONS98` (`na sa eu af me as oc`) → `L.reg`. A lanista who hides from "Here now" (`priv89.hide`) opens rooms without a region. No IPs anywhere.
- **House card.** `house.card {acct | id | fid | name}` → `{domus (public row incl. dr98), glads [{id,name,cls,rank,glory}], fallen, best, last [≤6 {ev,loc,at,won,
  died,glad,ranked}], lan, fid, following, mine, now {st}, acct, inv}`. Guests may call it (`GUEST_OK`); the lookup limit is `look89`'s (FIND_MAX89 a minute).
  A hidden lanista's card says `now: {st:'off'}` and no `acct`.
- **Domus rank.** `drankScore98(chars)` = the 4 best living gladiators' Glory + 20% of every fallen gladiator's Glory. `DOMUS.dr98` keeps the best score ever
  (`drankKeep98` only raises it); it is recomputed on `domus.get`, `house.card`, after `settleMatch` (every player) and `match.abandon`. `domusRow` carries
  `dr98 = {s, k}` (tier key from `DRANKS98`). Room members / seats / the host carry `dr` (the tier key, set when they join through `groupOf` → `C.roomJoin`);
  `C.liteRow` keeps it for lists. Rollback: older servers ignore `dr98`, `reg`, `pw` and the `PW98` items (the ttl drops them).
- **Find me a fight is silent.** A room made by `lobby.quick` is marked `quick`, spends no crier call and is never announced (`announce` skips it).
- **More events, Custom only.** `EVENTS_CUSTOM98` (Ludus 2–4 seats, Golden Eagle 4–8 with teams) are in `C.EVENTS_ALL` / `C.EVENTS_TEAM` (new arrays — the internal
  lists, and so the weekly fixture, are unchanged). `newLobby` / `roomSet` refuse them for Ranked. Gauntlet is not online: it seats one, a match needs two lanistas.
- **Damnatio at creation only.** `classWhy` refuses a change into or out of Damnatio (`char.class`); other changes cost `CLASS_FEE89` as before.
- **Renamed bonuses.** Named pieces store their rolled name; `rename98(def)` rewrites the epithet from the def's affixes / unique (Gloriosus I/II, Acutus I/II,
  Velox I/II, Laudis; Tutus and Aegis unchanged), idempotent and gender-kept. New rolls and `cleanNamed*` use it; stored records keep the old text until a
  page shows them (the page renames every reply and push). Nothing is migrated in the table.

## Who's online (v1.0)

Shared rules: the "v1.0 WHO'S ONLINE" section at the end of `111-onlcore`; route: the "v1.0 WHO'S ONLINE" block in `routes.js` (just before the rate
limiter); page + mock: `287-v100who`. No protocol bump, no new table permission (no BatchGetItem — the Lambda role only has Get/Put/Delete/Update/Query/Scan).

- **`here.list {status?, region?, sort?, cursor?}`** → `{rows, n, next, at}`. One row per online lanista: `{id, ln, g, rk, dn, dom, dr, rg, st, rm?, m?, ni?, fo?,
  me?, hid?}` (lanista name, active gladiator + rank, house name + id, Domus-rank tier key, region key, status `idle | room | fight | watch`, the waiting room /
  the live match, `ni` = takes no invitation from the caller (`invWhy89`), `fo` = the caller follows the house, `me` = the caller's own row, always first,
  `hid` when the caller hides). Filters: `status` (one of the four), `region` (a `REGIONS98` key or `none`); sort `st` (default: fighting, in a room, watching,
  idle), `name`, `rank`, `region`. The caller's row survives every filter.
- **Cost.** One presence query (`here()`: GSI1 `ON`, the same cached list the map uses) + the rooms list (GSI1 `LOBBIES`) — no house reads: hello and `domus.get`
  store the house's tier on the account (`ACCT … dr100`); an account without it yet costs one `DOMUS` read (≤ 25 a request, cached 5 min in the container).
- **Status.** Seated in a `live` room → `fight` (`m` = its id); a member of a `waiting` room (sitting or standing) → `room`; `ACCT … w100 {id, at}` (set by
  `match.watch`, cleared by `match.unwatch`, ignored once that match is not live or after `WHO100.WATCH_MS`) → `watch`; else `idle`.
- **Privacy.** Hidden lanistas (`priv89.hide`), guests and bots are never listed. Guests may call it (`GUEST_OK`; rows carry no `ni`/`fo`).
- **Size.** ≤ `WHO100.MAX` (200) rows and ≤ `WHO100.BYTES` (60 000) bytes of JSON a page; `next` = the numeric cursor of the following page. Measured:
  200 rows ≈ 29 KB (server/test/v100w.test.js). The general per-account limiter (`RATE93`) applies like every request; the page asks every 30 s at most.
- **Rollback.** Older servers answer `unknown_req` — the page shows the refusal inside the panel and nothing else changes. `w100` / `dr100` are plain fields
  older code ignores.
## v1.0 turn timers

Shared rules: the "v1.0 TURN TIMERS" section at the end of `111-onlcore` (`TT100`, `ttOf100`, `dropNeed100`); routes: the "v1.0 TURN TIMERS" block in
`routes.js` (after the v0.98 block); page + mock: `290-v100tt`. Test `server/test/v100tt.test.js`, page `tonl100tt`.
**Protocol 8** (`C.VER` 7 → 8): one-button notices no longer travel as inputs and the server orders new inputs — a v0.99 page would wait for
inputs that never come, so it must reload (426).

- **The room's timer.** `L.turnT`: Custom = `0` (Off, the default), 30, 60, 90 or 120 (the host's `lobby.set {id, turnT}`; `roomSet` refuses anything else);
  Ranked = always 60 (locked). `ttOf100(L)` → `{t, d}` seconds: decisions get `TT100.DEC` (20 s) only when a timer is on. The match keeps the config in
  `META.tt100` (read from the room at the first clock report).
- **Why reports + ticks.** Lambda has no timers, so the server never wakes up by itself. Pages REPORT clocks and the server stamps them with ITS time;
  whenever a page asks (`match.clock` or `match.tick`) the server compares its own clock with the deadlines (`eval100`) and, when one has passed, orders an
  input in the lockstep stream. Pages send `match.tick` only when their own estimate of a deadline has passed (+ half the grace), at most every 1.2 s,
  plus one every 12 s while a clock runs; on the real server every fighter ticks (staggered 0.4 s by seat order) so a timed-out player's absence never
  stops the clock. No EventBridge / Step Functions: a match with no page left open has nobody to play to anyway (and `prune` closes it).
- **Requests.**
  - `match.clock {id, kind:'turn', t, seat}` — a human turn `t` began. First report wins (`CLK#t<t>` putNew); older turns are ignored. `META.tc100 = {t, seat, at, x, pz}`.
  - `match.clock {id, kind:'end', t}` — that turn ended (`tc100.end`): it can no longer time out.
  - `match.clock {id, kind:'dec', d, seat, t}` — decision window number `d` opened (`CLK#d<d>`, `META.dc100`). A window of ANOTHER seat inside the turn pauses the
    turn clock (`tc100.pz` = since when; the paused time goes to `tc100.x` when the window ends).
  - `match.tick {id}` — check now. Both answer `{on, t, d, tc:{t, seat, left, pz}, dc:{d, seat, left}, now}`; a new clock is also pushed to the match (`match.clock100`).
  - `match.vote100 {id, seat, yes}` — after `TT100.DROP_AFTER` (2) timeouts of that seat (`TOC#<seat>.n`), a majority of the OTHER live humans
    (`dropNeed100`) → one `{k:'drop', seat, tt:1, until}` (`TTDROP#<seat>` once; `META.dropped`; the 139 reclaim window opens as for an away drop). `tt_early` before that.
- **Server inputs.** `{k:'dto', seat, d}` at `dc.at + d + GRACE` (1.5 s) — lock `DEC#<d>`; `{k:'timeout', seat, t, n}` at `tc.at + t + x + GRACE`, not paused,
  not ended — lock `TO#<t>`. A page never sends either (`match.input` voids them, "That seat is not yours.").
- **The races.** A decision answer carries `d` and takes the same `DEC#<d>` lock: if the dto won, the answer becomes a `void` input and the reply says
  `{seq, late:1}` (the page takes the default). With clocks on, the page applies its OWN answer only when its seq comes round (`ONLM.ownq`), so an answer
  and a dto land in the same order on every screen. Turn moves (`tile`/`act`) carry `tn`; one of a timed-out turn of that seat → `void` + `late` (the
  page also stops sending `TT100.LOCK` = 1 s before its own deadline; a late one that slips through resyncs that page from another lanista).
- **On the pages** a `timeout` is a MARK applied at a wait point of that turn (S.tt100x, the seat CPU for the rest of THAT turn, its later windows take the
  default); the CPU finishes the turn at the next settled point; the seat is human again at the next turn. A `drop` with `tt` is a mark too (`ONLM.left`
  'tt100'): the CPU takes the seat at its next decision. Stale inputs (the turn already over) are no-ops everywhere.
- **Abuse.** Clock reports are not verified: a lanista could report a real upcoming turn early and shorten it (first report wins). Every honest page reports
  too, so the gain is small; the victim's page shows the server's deadline. Logged as an open question.
- **Rollback.** A protocol-7 server refuses protocol-8 pages (426) and the reverse, so roll back server and page together; the new items expire (ttl 2 days).

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
