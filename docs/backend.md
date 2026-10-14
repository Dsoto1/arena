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

- **`here.list {status?, region?, sort?, cursor?}`** → `{rows, n, next, at}`. One row per online lanista: `{id, ln, g, rk, dn, dom, dr, rg, st, rm?, m?, ab?, ni?, fo?,
  me?, hid?}` (lanista name, active gladiator + rank, house name + id, Domus-rank tier key, region key, status `idle | room | fight | watch`, the waiting room /
  the live match, `ni` = takes no invitation from the caller (`invWhy89`), `fo` = the caller follows the house, `me` = the caller's own row, always first,
  `hid` when the caller hides). Filters: `status` (one of the four), `region` (a `REGIONS98` key or `none`); sort `st` (default: fighting, in a room, watching,
  idle), `name`, `rank`, `region`. The caller's row survives every filter.
- **Cost.** One presence query (`here()`: GSI1 `ON`, the same cached list the map uses) + the rooms list (GSI1 `LOBBIES`) — no house reads: hello and `domus.get`
  store the house's tier on the account (`ACCT … dr100`); an account without it yet costs one `DOMUS` read (≤ 25 a request, cached 5 min in the container).
- **Status.** Seated in a `live` room → `fight` (`m` = its id); a member of a `waiting` room (sitting or standing) → `room`; `ACCT … w100 {id, at}` (set by
  `match.watch`, cleared by `match.unwatch`, ignored once that match is not live or after `WHO100.WATCH_MS`) → `watch`; else `idle`.
- **Per gladiator (2026-10-11).** `st` is the lanista's *current* activity. `match.abandon` (Custom only — a Ranked abandon is a recorded Fate) writes `ACCT … ab100 {m, at}`
  (it also clears the live-match flag `ACCT.match`). A row whose `ab100` match is still `live` costs ONE `MATCH#<m>/META` read (cached 10 s per match in the container,
  ≤ `WHO100.AB_READS` = 20 reads a request; rows beyond the cap just carry no mark) to confirm he is still abandoned (a reclaim clears it) → the row gets
  `ab {m, g}`: that gladiator is still fighting there even if the lanista sits in another room. Rows without the flag cost nothing (typical 0–3 reads).
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

## v1.0 server batch A

Shared rules: the "v1.0 SERVER BATCH A" section at the end of `111-onlcore`; routes: the "v1.0 SERVER BATCH A" block at the end of `routes.js`
(wrappers only); page + mock: `292-v100srvA`. Tests `server/test/v100a.test.js`, page `tonl100a`. **No protocol bump** (VER stays 8): every change is
either server-side or decided by the host's opening snapshot.

- **Ranked = equipped gear only.** `kitOf` always listed only what the gladiator wears/holds; the PAGE used to add the class weapons on top. Now a Ranked
  seat carries `seat.onl.rk` and `giveLoadout` skips the class weapons for it (Custom keeps the class loadout). The opening snapshot is the host's, so
  mixed page versions cannot disagree inside one match.
- **The Issued kit** (`market.kit {char, kit:'daily'}`). The list is `issueList100(cls)` = the old padding (`DAILY92`) + the class's Level 1 weapons
  (`ISSUE_W100`, a Level 1 stand-in where the printed weapon is Level 2: Royalty gladius, Amazonia mace, Damnatio stones). Once an online day a house
  (`D.kitDay92`); refused (`kit_none`, the day not used) when he already has every piece he can take. ONE set a house: the claim takes back every Issued
  piece the house holds on the shelf or on its other gladiators (they simply go — reply `back`); refused (`in_match`) while one of those is in a match.
  Armor only on bare points; weapons only when he holds no weapon of his own. Issued = `pcs[uid].iss`: `pieceInfo` value 0, `usedPrice` 0, `repairCost` 0
  and `gear.repair` refuses (`issued`), never in loot or the used market (`gearAfter` drops them from `carried`), and — new — the dead man's Issued
  pieces left at home vanish instead of going to the shelf (`out.left`). There is no player-to-player transfer of gear or sell route online, so the kit
  cannot become coin (audited: char.buy / market.buy / market.kit / auction / gift.open / lobby.send / loot / deadGear / domusAfter / offers / acct.delete).
- **Online wagers closed.** `betOK` always refuses; `bet.place` answers `{code:'wager_off'}` + the text code. Old bets (placed before v1.0) still settle and
  refund through the unchanged settlement; `wager.list` still reads the history.
- **Domus slots** (`domus.slot {}` — in `IDEM93`, so a replayed request pays once). `D.slots100` = slots opened; a house WITHOUT the field predates v1.0:
  on first touch (`domusGet` → `C.slotsMigrate100`, once, stored) it keeps one slot per LIVING gladiator (min 1); the rest are locked like a new house's. A new house (`C.newDomus`) opens with `SLOT100.start` = 1. Steps (`SLOT100.steps`, his numbers): slot 2 = 150 Glory + 200 coin,
  slot 3 = 600 + 500, slot 4 = 1500 + 1000. Glory = the house's best Domus-rank score (`D.dr98`, recomputed by `dr98Upd` before the check; it never
  drops). The coin leaves the treasury (ledger `upg`). `gladMax(D)` = slots (+1 only for a house that bought the coin-only 5th slot `UPG89.slot5` before it was REMOVED, 2026-10-11: no longer offered or bought — `domus.upgrade {k:'slot5'}` is refused with "The fifth gladiator slot is no longer sold." (stable mcode), no refund logic; max online = 4 for everyone else).
  `char.create` beyond the slots → `slot_full` naming the next step. `domusRow` carries `gmax`, `slots100`, `slotNext100` (not on the public row).
- **Watchers are not players.** `hereSummary`: a ticket holder in a live match is counted in `watch`, not `fight`. Who's online: a ticket holder is
  `watch` (live) / `room` (waiting). The table factor and `canStart` already counted only seated humans.
- **Taunts.** `QC_TEXT` lions / senate / garum (room), tickle / granny / yawn / sandal (match), bigger (after) — codes only, translated by the page.

### Security pass (v1.0, findings and what changed)

Read: `routes.js` (every route since v0.93), `store.js`, `jwt.js`, `index.js`, `harden93.js`.

| # | Finding | Status |
|---|---|---|
| 1 | `match.odd` counted ticket holders: two sock-puppet tickets + one fighter could strike an honest fighter. | **Fixed**: strikes count live FIGHTERS only (a ticket holder's vote returns `{spec:1}`). |
| 2 | `match.clock {kind:'end'}`: the lanista whose turn it is could mark his own turn ended and never time out (stalling). | **Fixed**: his own end report is ignored while another human fights. |
| 3 | `match.clock {kind:'turn'}` with a huge turn number made every real turn "older" — timers off for the match. | **Fixed**: a report more than `TURN_JUMP100` (24) turns ahead needs a second lanista's identical report. |
| 4 | Request ids (`d.id`, `d.char`) were used in keys without a type check (an object became "[object Object]"). | **Fixed**: any request with a non-string / over-80-character `id` or `char` → `bad_req`. |
| 5 | `domus.equip` accepted a dead gladiator or one of another house of the same account. | **Fixed**: living + own house. |
| 6 | New paying route needs idempotency. | `domus.slot` is in `IDEM93`. Every paying route since v0.94 checked: `char.tok` (no coin, daily quota; a replayed part is harmless), `lobby.set` pw / turnT (no coin). |
| 7 | Clock reports are trusted from any fighter (first report wins); a lying page can still name the wrong seat or invent decision windows to pause a turn. | **Open** — it can only stall timers, never move coin, gear or deaths. Real fix = server replay of Ranked matches (backlog "REAL RANKED VERIFICATION"). |
| 8 | Results are by agreement of the humans; a lone human vs CPUs is unverified. | **Open** (same backlog item). |
| 9 | Token pictures: any WebP of the right size is accepted (content not checked). Hidden info (Mandata) reaches every client. `match.get` is readable by anyone (free watching). | **Known, by decision** (v0.94 / v0.80). |
| 10 | Raw errors | None found: every refusal goes through `fail()` / `errReply` (internal errors → `server_error` + ref). |
| 11 | Rate limits | Every route goes through the general bucket (`RATE93`; `match.*` its own); the new route needs nothing more. |
| 12 | JWT | RS256 only, issuer, audience, `token_use=id`, expiry, key id checked; JWKS cached 1 h. Dev sign-in only with `DEV_NAMES=true`. OK. |

- **Rollback.** Older servers: `domus.slot` → `unknown_req` (the page shows the refusal), `slots100` is ignored (every house back to four), bets open
  again. No data shape needs undoing.
## v1.0 server batch B

Shared rules: the "v1.0 SERVER BATCH B" section at the end of `111-onlcore`; routes: the "v1.0 SERVER BATCH B" block in `routes.js` (after the turn
timers, before the rate limiter); page + mock: `293-v100srvB`. Tests `server/test/v100b.test.js`, page `tonl100b`. **No protocol bump** (VER stays 8): every
new request is optional, every new field is ignored by older code, and the new `match.clock` kinds are no-ops on an older server.

- **Hidden rating (Elo).** `ELO#<char> / E {r, n, at}` — never in a reply. Written once per settled Ranked match (`MATCH … ELO100` lock): pairwise Elo
  over the human seats by agreed place (an abandoned / dropped seat counts last), K = 40 for the first 10 rated bouts then 24, divided by the other
  humans; start 1000, clamp 100–3000 (`ELO100`). **Matchmaking:** `lobby.quick` (Ranked) keys the request (`qp100`) and the `groupOf` wrapper narrows its
  room list to waiting Ranked rooms of that event whose seated humans average within `ELO100.WIN` (150) of the group — only when such a room fits
  (`eloPrefer100`); otherwise the old pick stands (a queue never stalls). Cost: one `ELO#` read per seated human of each candidate room (cached 30 s).
- **Queue estimate.** `WORLD QETA#<ev>#<rank|c> {a, n}` = an EMA (0.3) of horns − creation of Find-me-a-fight rooms (folded by the `lobby.start` wrapper).
  `eta100(h, need, seats, free)` = history (90 s default) × open seats ÷ (seats − 1), ×2 when no free lanista of that rank is online, clamp 10–600 s.
  `lobby.quick` replies carry `eta100 {s, slow, need, free}`; `queue.eta {id}` (members only) recomputes it (the page asks every 30 s while the room shows).
- **Random seats.** `C.startRoom` is wrapped: a Ranked room that is not a team event shuffles `L.players` with the server's `rnd` (`C.seatRnd100`; the mock:
  `Math.random`) at the horns → seat = start corner and turn order; wagers on a seat follow their fighter (`L.bets[].seat` remapped); `L.shuf100 = 1`.
  `C.SEAT_RND100 = false` turns it off (`routes.test.js` reads fixed seats).
- **Ranked watchers one turn behind.** `match.watch` on a Ranked match moves a non-fighter from `META.watch` (live pushes) to `META.wd100 {acct: conn}`.
  `rel100` = the last seq they were given. When a newer turn clock is registered (`match.clock`/`match.tick` see `tc100.t` grow) or the match settles,
  every `IN#` with `rel100 < seq ≤ n − 1` is pushed to them as `match.input`. `match.get` gives them only `seq ≤ rel100`; `match.snapreq` from them and
  `match.snap` to them are refused (`ranked_delay`). CPU turns report no clock, so a watcher may lag across CPU turns until the next human turn.
- **Leavers.** `ACCT … lv100 [{k, at, m}]` (≤ 20, 7 days): a Ranked `match.abandon`, a Ranked away drop (`match.drop`) or timeout vote (`match.vote100` →
  dropped), and a seat that reached `TT100.DROP_AFTER` timeouts (counted once a match: `LVT#<seat>`). `LEAVE100`: 3 in 7 days → `house.card.leaver {n}`
  ("Often leaves"); 3 in 24 h → no Ranked for 15 min after the last one (`ranked_cd {until}` on lobby.create / quick / join / sit / accept / again).
- **Connection dots.** `match.conn100 {id}` (fighters, ticket holders, watchers) → `{seats: {seat: {st, slow?}}}`: `on`, `away` (META.away < `AWAY_MS`),
  `gone` (≥ `AWAY_MS`), `cpu` (dropped / abandoned); `slow` = timeouts this match (`TOC#<seat>`). One META read + one query. Pages ask every 15 s.
- **Season leaderboard.** Season = `seasonAt(t).season` (the Manager's 12-week calendar from 2026-10-01). After each settlement every positive `out.glory`
  goes to `SEASON#S<n> / G#<char> {g}` (atomic counter) and the versioned top list `WORLD STOP#S<n>` (≤ 50 rows `{c, n, cls, dn, dom, rk, alive, g}`).
  `season.board {season?}` (guests too) → `{key, season, now, wk, end, top[place], mine, tit}`. **Tituli** (`SEASON100.TITULI`: 1 Victor, 2–3 Podium, 4–10 Ten):
  the first `season.board` / settlement after a season ends writes `WORLD STIT#S<n>` (once) and appends `{s, k, n, place, c, glad}` to each top-10 house's
  `D.tit100` (≤ 20; names + flags only, no art yet); `house.card` returns the last 6 as `tit100`.
- **Reports.** `match.report100 {id, seat, reason, note?}` (fighters, ticket holders, watchers; live or ≤ 24 h after the end) → `REPORT#<match> / R#<acct>`
  (putNew: once a match per reporter; `GSI1PK 'REPORTS'` for a later review tool; ttl 90 days; note ≤ 200 chars, no `<>`); ≤ 10 a UTC-day per account
  (`rp100`). Also logged (`[report100]`). **No automatic penalty.** Review today: query GSI1 `REPORTS` in the console.
- **Turn clock fairness (online sidelining).** `match.clock {kind:'own', t, seat}` — only the turn owner: the clock restarts at the owner's own report, at most
  `FX100.OWN_MAX` (10 s) after the first report (`tc100.own`, once a turn) — another screen's Speed never shortens it. `match.clock {kind:'fx', t, k, i}` — only
  the turn owner: a cosmetic reveal adds `FX100.ms[k]` (chest / spawn / market 900 ms) to `tc100.x`, once per `FX#<t>#<i>`, ≤ `FX100.TURN_MAX` (5 s) a turn.
  Both push the new clock (`match.clock100`).
- **Abuse.** The owner can claim up to 5 s of reveal credit and 10 s of late start a turn by forging reports — bounded and logged as acceptable. Reports
  can be spammed within the daily cap; nothing acts on them automatically.
- **Rollback.** An older server answers `unknown_req` to the four new requests (the page shows nothing new) and ignores `own`/`fx`; the new items are
  plain records (season / Elo items have long ttls; match locks expire with the match).

## v1.0 lobby room

Shared rules: the "v1.0 LOBBY ROOM" section at the end of `111-onlcore`; route: the "v1.0 LOBBY ROOM" block in `routes.js` (after batch B, before the
rate limiter); page + mock: `302-v100lobby`. Tests `server/test/v100lobby.test.js`, page `tonl100lb`. **No protocol bump.**

- **Room code.** `C.roomCode100(id)` = `R-` + 5 letters (FNV-1a of `room:<id>` over the FID alphabet, no look-alikes). Derived from the id, so nothing is
  stored and every screen shows the same code. `codeParse100` reads `R-xxxxx` / `FID-xxxxxx` / a bare word (a 6-letter word starting with R may be either:
  the room is tried first, then the FID).
- **`lobby.code {code, pw?}`** — finds the newest waiting room with that code, or the waiting room the FID's lanista is in (refused when that lanista is
  hidden or takes no invitations from you), then runs **`lobby.join`** with it — so passwords (`pw_need` / `pw_bad`, the reply carries `room {id, ev, loc, host}`
  for the password window), kicks, Ranked rank rules, the busy rule and the Ranked cooldown are the old ones. Refusals: `code_bad`, `code_none`, `code_self`,
  `code_fid_none`, `code_live` (+ `{live, id}`: watch it instead), `testHouse` (a test house and a Ranked room). Every lookup counts against the FID quota
  (`look89`, `FIND_MAX89` a minute), so codes cannot be swept quickly. Cost: one `LOBBIES` index read (as `lobby.list`) + one `FID#` get for a FID.
- **`house.card`** gains `now.room`, `now.code`, `now.ev`, `now.seated`, `now.seats`, `now.ranked` while the house's lanista waits in a room (the page's ⚔ Join).
- **Taunts:** eight more room phrase codes in the batch A §7 list (`mlions` … `betme`); the page groups the room's phrases Room / Taunts.

## v1.0 replays

Shared rules: the "v1.0 REPLAYS" section at the end of `111-onlcore`; routes: the "v1.0 REPLAYS" block in `routes.js` (after the lobby room, before the
rate limiter); page + mock: `309-v100replay`. Tests `server/test/v100rp.test.js`, page `tv100rp`. **No protocol bump** (two new optional requests).

- **What a replay is.** The opening snapshot (`MATCH#<id> OPEN`, the host's `matchSnapshot` at the first turn) + the match's inputs in server order
  (`IN#…`) + the end hash (`onlHash` at gameOver) + the game version. The page replays it exactly as a late watcher does (`onlmLoad` + `onlmWatchOn`),
  so every die, CPU turn and beast re-derives from the seeded stream.
- **`replay.put {id, h, v}`** — a human fighter (`M.players`) of a **Ranked** match, once it is settled (`M.status` not `live`). The server builds the
  replay from **its own** opening + inputs; anything else the client sends is ignored, so a replay cannot be forged — it is the record a future Ranked
  check will replay. Stored once as `REPLAY#<match> R` (`putNew`; a second put answers `{done, dup}`) with `GSI1PK 'REPLAYS'`, `GSI1SK` = when (the
  most recent first) and `ttl` = `REPLAY100.DAYS` (30). Inputs are anonymised (`replayAnon100`: `from` → `server` or `p`, `acct` → `p`).
  Refusals: `replay_bad` (bad id / not your match), `replay_custom` (Custom is never kept server-side), `replay_wait` (not settled yet — the page
  retries after 6, 15, 40, 90 s), `replay_gone` (the opening expired: matches live 2 days), `replay_big` (over `REPLAY100.MAX` 380 000 bytes, under
  DynamoDB's 400 KB item).
- **`replay.get {id}`** — anyone, guests too (`GUEST_OK`): `{id, v, h, at, ranked, ev, loc, open, inputs}` without keys or the uploader; `replay_none`.
- Cost: a put = one META get, one REPLAY get, one OPEN get, one IN# query, one LOBBY get, one put; a get = one read. No new table permission.
- **The page.** Every finished match is kept locally (last 10 + ★ pinned, gzip in localStorage `flavius_rp100i` / `flavius_rp100.<id>`); online
  fighters fetch `match.get` at gameOver for their own copy. 293's 🔗 `#replay=<id>` opens the local copy first, else `replay.get`. Kill switch
  localStorage `flavius_replay100off=1`.
- **Rollback:** an older server answers `unknown_req`; the page then says "the server keeps no replays yet" (local replays still work).

## v1.0 balance

Shared rules: the "v1.0 BALANCE" section at the end of `111-onlcore` (`BAL100`); routes: the "v1.0 BALANCE" block in `routes.js` (after the
replays); page + mock: `316-v100balonl`. Tests `server/test/v100bal.test.js`. **No protocol bump.** Virgilante's picks O1–O3 from
`tools/plans/balance100/REPORT.md` (models: `tools/balance100/onlcoin.js`, `onlvariants.sh`).

- **O1 dented, not destroyed (Ranked).** A printed piece (L1–3, not named, not Issued) brought and no longer held at the end stays with the survivor
  as `pc.st 'damaged'`, `dmg 1` (in place, like the v0.91 dents: worn in Custom, stripped from Ranked kits until repaired). On a **Ranked death**
  (his follow-up) the human killer still takes ONE piece of his choice, printed or named (`gx.carried` = everything brought; `deadGear` / `lootMake`
  unchanged). Every printed piece nobody takes (`lootResolve`'s leftovers, or all of them when a beast / CPU / the Fate killed him) goes HOME to the
  dead man's house shelf dented: a `toMarket` wrapper routes a printed piece whose last history line is `fell` (`C.homeRoute100`) to the house found by
  its name (`DNAME#`) as `C.homeDent100(P)`; named pieces still go to Flavius's chest; the killer's own pick that fits neither him nor his house
  (`taken`) still goes to the used market. So the used market now only gets those rare picks — it stays thin. `out.dent100 [{item,key}]` = the
  survivor's lost pieces / the dead man's printed pieces (minus whatever the killer takes); the page toasts it. Named pieces keep their rules
  (Broken, repair ⅓, lost/looted at death); Issued pieces still vanish (`out.gone` / `out.vanish`). The mock mirrors it (`mockToMarket83` wrapper in
  316). Today's "what he lost" showcase still counts every piece brought.
- **Repair** of a printed piece (damaged, or an old broken one) = `ceil(value / 10)`, at least 1, however dented (`BAL100.repairK`).
- **Award ladder** (his pick, a rank-up never pays less): Tiro 24 · Novicius 30 · Gregarius 36 · Veteranus 42 · Primus Palus 50 · Summa Rudis 60 ·
  Rudiarius 70 · Invictus 80 (`BAL100.award`; win +50%, streak as before). `C.AWARD` itself changed, so `awardOf`, the result
  toast and the room lines agree; **gift coin keeps the old table** (`rollGift` runs on `AWARD_GIFT100`).
- **O2 rank Glory ×½:** Tiro 0 · Novicius 45 · Gregarius 90 · Veteranus 275 · Primus Palus 575 · Summa Rudis 1050 · Rudiarius 1750 · Invictus 2750
  (`RANKS[i].glory` changed in place). Never demoted (`ch.rankK`). Gladiators already past a new line show the higher rank at once (`rankFor`);
  no back-dated gifts (the next `applyResult` starts from the new rank). Everything gated by rank follows: market levels (`mkt`), named gear and Ludi
  Infames at Veteranus, the auction (Veteranus+), Ranked rooms of one rank, online Immortalis (Invictus + 25). The living-by-rank counters
  (`WORLD COUNTS`) are counted once more from a scan (`seeded100`).
- **O3 one rank-up gift a house a rank:** `D.rkg100` = the ranks the house got a gift for (seeded on first touch from the `…:rank:<k>` ids in
  `D.gifts` / `D.giftsOpened`). `giftsIn` drops a second `rank:<k>` gift; `C.after100(out,gx)` (in a `domusAfter` wrapper, and the mock's
  `mockAfter83`) takes it out of the result (`out.gifts`, `out.giftDup100`). Gifts every 5 Ranked bouts survived are unchanged.
- Switches for tests: `C.BAL100.dent` / `C.BAL100.home` (default on). **Rollback:** redeploy the previous server; dented pieces keep `st 'damaged'`
  and repair at the old `ceil(value × dmg)`; `D.rkg100` is simply ignored.

## v1.01

Shared rules: the "v1.01" section at the end of `111-onlcore`; routes: the "v1.01" block in `routes.js` (just before the general rate limit);
`index.js` (`requireGoogle`); page + mock: `322-v101onl`. Findings and status: `tools/plans/v101/SECURITY.md`. Tests `server/test/v101.test.js`,
`tools/tests/tonl101.js`. **No protocol bump** — a match's loadouts come from the host's opening snapshot, so v1.0 and v1.01 pages still share matches.

- **Kits follow the v1.0 loadouts** (315-v100bal): the Damnatio's class kit = Iron Helm + Belt I + padding (`CLASS_KITS92`; `kits92.json` rebuilt by
  `mkserver`); the page's online `giveLoadout` no longer puts the Falcata back on the Amazonia (322 makes `bal100Old` a plain call). The Issued kit
  (`ISSUE_W100`) already matched.
- **Snapshots (S1)**: `match.open` / `match.snap` refuse a state carrying markup that can run script (`C.snapBad101`, code `snap_bad`); the opening is
  written once (`{kept:1}` after that). **Inputs (S2)**: `match.input` refuses one (`C.inBad101`, code `in_bad`) before it takes a seq. The page cleans every
  state it loads and every other page's move anyway (`snap101Clean`, `onlmApply` wrapper; kill switch localStorage `flavius_snap101off=1`).
- **Results (S3)**: the reported table is cleaned against the room's seats (`C.tableFix101`); a settled Ranked table with flags (`C.tableFlags101`:
  `missing:<seat>`, `multi_win`, `all_won`, `f_high`) or accepted `unverified` with 2+ humans → `AUDIT#<match>` / `A` `{flags, ranked, humans, ev, at}`
  (GSI1PK `AUDIT`, ttl 90 days) + one `[audit101]` log line. Nothing is refused or paid differently.
- **Sign-in (S4)**: the template sets `AdminCreateUserConfig.AllowAdminCreateUserOnly` (no self sign-up through Cognito's API) and Lambda env
  `REQUIRE_GOOGLE` (`true` when Google is configured): `$connect` refuses an ID token without a Google identity (401).
- **Routes**: only the route table's own names are requests (`constructor`, `__proto__` … → `unknown_req`).
- **Rollback**: the previous server simply stops checking; `AUDIT#` items expire on their own; `AllowAdminCreateUserOnly` can stay.

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

## v1.01 domus records

A house keeps TWO records. RANKED = the existing top-level fields (`D.bouts/wins/lifeCF/survived/fallen`), written only for Ranked seats from v1.01 on. UNRANKED = `D.cu` `{bouts,wins,lifeCF,survived,fallen}` (Custom or any other non-ranked online event; `survived` counts survivors of non-ranked bouts too). Rules: the "v1.01 DOMUS RECORDS" section at the end of `src/111-onlcore.js` (`domusNote` override; routes.js `domusAfter` and the mock both call `C.domusNote`). History cannot be split: earlier totals (Custom matches included) stay in the top-level record. `D.split101` = time of the first write by the new code, `D.pre101` = bouts the house already had then. `domusRow` returns `cu` (zeros when none), `split101`, `pre101` (so `domusPub89`, `house.card`, `domus.get`, `domus.visit` carry them). Glory, Domus rank, ranks, coin and trophies do not read it. No protocol bump, no migration (old houses start with no `cu`). Page: `src/324-v101domrec.js`. Test: `server/test/v101rec.test.js`.
