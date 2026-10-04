# v0.82 Online — the server contract (Domus · coin rework · prices by AP · guests · invites · the stands group turn)

Protocol **VER 5** (src/111-onlcore.js). Old clients (VER 4) get **426** on `$connect`, as today. The server is in server/src
(routes.js, index.js, store.js); the shared rules are ONLC (src/111-onlcore.js, copied to server/src/onlcore.js by
`node tools/mkserver.js`). The mock server (MOCK_ROUTES in 112/118) must answer the same requests the same way and call the same ONLC
functions. Tests: `cd server && npm test` (suite "server v0.82").

## 0. Replies and refusals
Reply: `{re, ok:true, d}` | `{re, ok:false, err, code?, ...extra}`. **New:** refusals may carry a stable `code` (and extra fields)
— read `code`, show `err` (player-facing, already worded). Codes used now:

| code | when | extra |
|---|---|---|
| `need_domus` | the account has no house and the request needs one (list in §1); also from a party member without a house | — |
| `domus_name` | bad house name (length / word filter) | — |
| `name_taken` | another house has that name (case-insensitive) | — |
| `domus_locked` | rename / new house while the house has (had) a gladiator | — |
| `guest` | a guest asked for something outside GUEST_OK | — |
| `guest_expired` | a guest's 2 hours are up | — |
| `room_gone` | lobby.accept / lobby.join{inv} on a dead room | `why`: started\|full\|left\|closed, `live:true` when started (watchable) |
| `no_invite` | lobby.accept with no pending invitation for that room (room still alive) | — |
| `no_stands` | stands window in a game with stands off / no ticket holder | — |
| `stands_twice` | a window already opened for that rotation, or a second pick | — |
| `stands_closed` | a pick after the window closed | — |

Other refusals keep plain text without a code (as before).

## 1. DOMUS (the online ludus)
ONLC: `DOMUS_MIN=3, DOMUS_MAX=24`, `domusWhy(name)` → '' or the reason (clean, 3–24 letters, `nameBad` filter), `domusKey(name)`
(lower case), `newDomus`, `domusNote(D,row,out,ranked)`, `domusFromChars(D,chars)`, `domusRow(D)` → `{id,name,founded,bouts,wins,
survived,fallen,lifeCF,glads}`. **GLAD_MAX = 4** living gladiators; one active (unchanged).

Requests:
- `domus.get {}` → `{domus: row|null, needDomus, glads (gladiators ever in it), archived:[row…]}`
- `domus.create {name}` → `{domus: row, needDomus:false, joined: n}`. Allowed when the account has no house, or when its current house
  has NEVER had a gladiator (then the old house is archived with its record and its name freed). Gladiators made before houses existed
  (no `domus` field) join the new house; its record is built from them (`joined` = how many). Errors: domus_name, name_taken, domus_locked.
- `domus.rename {name}` → `{domus: row}`. Only while the house has never had a gladiator (else domus_locked). need_domus without a house.
- `hello` (signed in) now always carries `needDomus` (true while the account has no house) and `domus` (row or null).
  `me.here.domus` = the house name. Old accounts with gladiators but no house: hello shows needDomus:true, `chars` as before — the client
  must ask for the house name before anything else.
- **Requests refused with `need_domus`** while the account has no house: char.create, char.buy, char.edit, char.active, lobby.create,
  lobby.join, lobby.accept, lobby.quick, lobby.sit, lobby.ticket, lobby.invite, lobby.call, lobby.again, lobby.say, bet.place,
  party.create, party.join, forum.say. Still allowed: hello, auth.*, domus.*, char.mine, lobby.list/leave/chatlog/watch, forum.get/mute,
  who.list, party.get/leave, hall.list, world.news, every match.* request (a match already under way finishes).
- Gladiators carry `domus: <house id>`. The house record follows every settled result (`domusNote`): bouts +1, wins, lifeCF += CF of the
  bout; survived +1 (Ranked, survived) or fallen +1 (died — also a Ranked abandon/Damnatio). Custom bouts count bouts/wins/CF.
- **Names stay the gladiator's**; the house name rides beside it as `domus` (a string) on: room `players[]` / `members[]` (full and lite
  rows), `who.list` rows, Forum `say` lines (`line.domus`), invitations (`fromDomus`). Absent / null when unknown.

## 2. Coin rework (ONLC.applyResult)
No pay-out of in-match coin (`row.coin` is ignored). `out.pay` = `awardOf(rankAtTheHorns, won, streakBeforeThisBout)` for a
**Ranked bout survived**, else 0 (Custom pays nothing; the dead are not paid).
`AWARD = {tiro:8, gregarius:12, veteranus:18, primus:25, summa:35}`, `WIN_BONUS = 0.5`, multiplier `1 + min(1, streak × 0.1)`,
rounded: `Math.round(AWARD[r] × (won ? 1.5 : 1) × mult)`. No cap. Wagers and tickets unchanged. `ONLC.PURSE` is gone — use `AWARD`/`awardOf`.

## 3. Prices (ONLC)
`PRICE = {1:60, 2:250, 3:750}` (weapons by level), `PRICE_AP = {1:15, 2:55, 3:150}` (armor, per AP at its level).
**Always use `ONLC.priceOf(catalogItem)`** (weapons: PRICE[lv]; armor: PRICE_AP[lv] × ap). `canBuy` / `buy` use it; the error text
is `Costs N coin.` **The catalog must carry `ap` for armor**: server/src/catalog.json does now. CLIENT TODO: `onlCatalog()` (112) must add
`ap: ARM[k].ap` to armor entries (`{kind:'a', lv, n, stack, ap}`) — otherwise the mock prices armor at 1 AP and the next
`node tools/mkserver.js` writes a catalog without `ap` (server armor would then cost 1 AP's price). Owned gear and wallets untouched.

## 4. Guests (read-only, no sign-in)
- Connect: `wss://…?guest=<client id>&ver=5` — the client keeps a random id (8–40 of `[a-z0-9_-]`) in localStorage
  (e.g. `flavius_onlguest82`). Refused with **403** (local server close code 4403) once 2 hours have passed since that guest id FIRST
  connected (the server remembers for a day); 401 for a bad id. A token or dev sign-in takes priority over `guest`.
- `auth.guest {tz}` → `{guest:true, id:'guest-<id>', first, until (= first + GUEST_MS), now}`; stores the time zone for the map.
- `hello` (guest) → `{ver, mode:'aws', me:null, guest:{id, until}, now, lobbies (lite rows), here, online, forum, news, challenges, today}`
  (no chars/party/live/needDomus).
- Allowed: `ONLC.GUEST_OK` = hello, auth.guest, lobby.list, match.watch, match.unwatch, match.get, match.snapreq (the watcher path),
  forum.get, hall.list, world.news. Everything else → code `guest`, err `Sign in to play.` (or: `Sign in to speak in the Forum.`,
  `…to wager.`, `…to buy a ticket.`, `…to raise gladiators.`, `…to found a house.`).
- After 2 h every request → code `guest_expired` ("Your two hours as a guest are up — sign in to keep watching."). The client shows its own
  notice from `until` (no push is sent).
- Watching: guests use the same `match.watch` (counted in the 30 free seats) and receive `match.input` / `match.open` pushes like
  any watcher. They never receive Forum pushes (they read `forum.get` / hello.forum).
- Presence: `hello.here` gains **`guests`** (count) and **`gzones`** `{tz: count}` — guests are NOT in `n` or `zones` (separate glow).
  `world.news` gains `guests`. ONLC `hereSummary(here, rooms, guests)` computes it.

## 5. Invitations die with the room
- `lobby.invite` / `lobby.again` store each invitation (INVITE#<to> R#<room>#<by>) and push **`lobby.invite`
  `{room, row (lite), from (gladiator name), fromId, fromDomus}`** (`room` is new).
- **`lobby.accept {id}`** (room id) — or `lobby.join {id, inv:1}` (same thing) — joins like lobby.join. Refused with code **`room_gone`**
  + `why` when the room started (`live:true`, offer 👁 Watch), filled (no free seat), closed, or every lanista who sent it left;
  code **`no_invite`** when there is no pending invitation (e.g. dropped because you joined elsewhere) and the room is still alive.
- Push **`invite.gone {rooms:[roomId…], why, live?}`** to the invitee when an invitation dies: why = started (live:true) | full | left |
  closed (sent with the room's own change), or **joined** (you joined/created/quick-joined another room — `rooms` lists every other
  room whose invitations were dropped; the room you joined is never listed). No timers on the server; the client removes the card.

## 6. The stands group turn (server side)
Ticket holders' seats are `M.seats[acct]` = fighters' seats + k (as v0.78). Requests:
- **`match.stands.open {id, rot}`** — host only, live match. One window a rotation (`rot` = any integer the host's client uses,
  e.g. the rotation number). Refused: not host · `no_stands` (stands off / no ticket holder left) · `stands_twice` (already opened).
  → `{rot, until (= now + ONLC.STANDS_MS, 20 s), holders:[seat…]}`. Push **`stands.window {id, rot, until, seat}`** to every ticket
  holder (not dropped/abandoned) — ONLY to them.
- **`match.stands.pick {id, rot, pick}`** — ticket holders of that window only, ONE pick each (`stands_twice` for a second),
  `stands_closed` once closed. `pick` is validated by `ONLC.standsPickOK`: `a` ∈ `STANDS_ACTS` = pass, stone, offer, tholo, move, cheer;
  `stone`/`offer` need integer tiles `r`,`c` in 0–12 (LOCKED to that tile); ≤ 600 chars. Stored as `ONLC.cleanPick(pick)` = `{a}` plus
  any of `r, c, seat, sec, v, tok` (numbers or ≤24-char strings). **Nothing is pushed** to anyone. → `{rot, ok:true}`; when this was the
  last holder to answer the window closes at once → `{rot, ok:true, closed:true, seq}`.
- **`match.stands.close {id, rot}`** — the host (any time, normally at 20 s); any other live fighter only 25 s after it opened
  (`STANDS_MS + 5000`, if the host is gone). Ticket holders cannot close. → `{closed:true, seq}` or `{closed:false}` (already closed).
- Closing (once, whoever triggers it) appends ONE server input to the match's ordered stream and pushes it as **`match.input`** to every
  fighter, ticket holder and watcher (no exception for the closer):
  `{k:'stands.result', rot, picks:[{seat, pick}…] (sorted by seat), missed:[seat…], from:'server', seq}`.
  Lockstep clients apply all picks at that seq: stones/offerings fire on their locked tiles (whoever stands there is hit / receives it).
  CF/coin are not known to the server — the engine refuses an unaffordable pick when applying (deterministically, on every client).

## 7. Unchanged
Rooms, quick chat, Praeco, Forum, presence for lanistas, Today, majority resync, results by agreement, wagers/tickets, abandon/drop.
Storage additions are listed at the top of server/src/store.js (DOMUS#, DNAME#, GUEST#, INVITE#, MATCH# STW#/STP#; ACCT domus/dname/domusOld;
CHAR domus; DOMUS fame/passDay/patron, DOMUS PASS#<day>; MATCH META left). **template.yaml: the Lambda's policy gains `dynamodb:Scan`** (the one-time
rankCounts seeding, §8) — redeploy the stack, not only the code. Deploy the server (protocol 5) together with the client.

## 8. GLORY and the table size (added with the client half)
- `ONLC.gloryOf(ch)` = lifetime CF + 12 × Ranked bouts survived + 8 × Ranked wins, every part gained at the match's **table factor**.
  Stored on the gladiator as `ch.glory` (fractional, 2 decimals) with `ch.rwins` (Ranked wins). Gladiators from before v0.82 start from their
  record (`rwins` unknown → all wins). `RANKS[].glory` thresholds: Tiro 0 · Gregarius 180 · Veteranus 550 · Primus Palus 1150 · Summa Rudis 2100
  (`bouts`/`cf` are gone). `rankFor` = the rank by Glory, but **never lower** than `ch.rankK` (highest reached) or the stored `ch.rank` (so old
  gladiators keep the rank they had). `nextRank` / `rankProgress` follow Glory. Market tiers still by rank (`mkt`).
- `ONLC.tableFactor(humans)`: 2 → 0.5 · 3 → 0.75 · 4+ → 1 (humans seated in the match; CPU fillers do not count; unknown → 1).
  `applyResult(ch, row, ranked, {humans})` multiplies the coin award AND the Glory gained; the Fate applies in full.
  `out` gains `factor` and `glory` (gained, 1 decimal). The server passes `{humans: M.players.length}`; the mock `{humans}` of non-bot players.
- **`rankCounts`** `{tiro:n, gregarius:n, …}` on `hello` (signed in and guest) and `world.news`: living gladiators at each rank in every house,
  from one item WORLD COUNTS kept by atomic counters (`store.counter`): char.create +1 · a rank-up −1/+1 · a death −1 (settled or abandoned).
  **Seeding:** when WORLD COUNTS is missing or has no `seeded` field, the server scans the living gladiators ONCE (`store.scan('CHAR#','CHAR')`,
  rank by `rankFor`) and writes the counts with `seeded:<ms>` through a conditional put (`store.putUnless(…,'seeded')`: only while the item
  has no `seeded`) — the first seeding wins, later requests read it; concurrent requests in one container share one scan. From then on the
  counters carry on. So gladiators made before the deploy are counted.

## 9. 🗄 THE STOREROOM
Every piece a house owns sits with one of its gladiators (`ch.gear`) or on the house's shelf (`DOMUS.gear`).
- `domus.get` gains `gear` (the shelf) and `busy` (ids of the caller's living gladiators seated in a waiting room or a live match).
- **`domus.move {item, from, to}`** — `from`/`to` = a gladiator id of the caller's house or `'house'`. Refused: `need_domus`; another house;
  code **`in_match`** when either gladiator is seated in a waiting room or a live match; `ONLC.gearMoveWhy`: the piece is not there, the
  receiver's rank may not carry its level (`mkt`), a second copy of a non-stacking piece, the dead. Versioned: taken out first, then put in
  (a failed put returns it). → `{from, to}` (a gladiator, or `{house:true, gear}`). A moved piece is ticked to bring when the receiver keeps an
  equip list; leaving a gladiator unticks it there.
- **`domus.equip {char, item, on}`** — tick / untick one copy to bring (`ONLC.gearEquip`); `in_match` while that gladiator is seated. → the gladiator.
- Both need a house (NEED_DOMUS). Death rules unchanged (a Ranked death loses the gladiator's gear).

## 10. A speared ticket holder (server route for 128-v82stands)
- **`match.speared {id, seat}`** — only from a live human FIGHTER of that live match; one vote per fighter (`MATCH#<id> SPR#<seat>#<acct>`, putNew).
  When a strict majority of the live human fighters voted for that ticket seat: the lobby copy is edited (versioned) — that ticket's `paid` → 0
  (`speared:1`), `L.pot` −amt — the holder's active gladiator is credited `amt` exactly once, and the holder gets the push
  **`stands.refund {id, seat, amt}`**. → `{votes, need, refunded}`. Settlement needs no change (the pot already lost it).

## 11. Stands for the poor + the patron (server and mock)
- **Free seats.** A room carries `free` (bool, ONLC.newLobby `{free}`; `lobby.set {free:1}` / `{free:0}`): `ticket 0 + free:true` = seats in the
  stands at no cost; `ticket 0 + free:false` = no tickets (as before). `lobby.set {ticket:N>0}` ends free; `{ticket:0}` without `free` ends it
  too ("none"); `standsOff` ends both. `ONLC.ticketOK` = `standsSeatWhy` (stands off / nothing sold, the horns, a fighter, already holding,
  ≤ `STANDS_MAX` 8) + the price. A free ticket is `{…, paid:0, free:1}`; refunds and `settle` are unchanged (0 paid, nothing in the pot).
- **🎟 `lobby.pass {id}`** — Flavius's guest pass (needs a house: `need_domus`). Refused while the lanista is still fighting a match, without a
  living gladiator, while the active gladiator's wallet is ≥ `ONLC.PASS.wallet` (15), when the house used its pass this UTC day, when the room
  sells no seats / started / is full (`ONLC.passOK(L, acct, wallet, D.passDay, dayKey)`), or while the lanista is in a waiting room
  ("Leave your room first."). One a day per house: the marker item **DOMUS#<id> PASS#<yyyy-mm-dd>** (putNew; ttl 3 days; removed again if the
  seat could not be taken). → `{lobby (the room), char, domus (row, passDay = today)}`; the stands entry is `{id, name, paid:0, pass:1, domus, patron?}`.
- **Fame.** At settlement (not void) every `pass` holder who stayed to the end — in `M.specs`, not dropped / abandoned, not in **`M.left`**
  (a ticket holder's `match.unwatch` while the match is live records `left[acct]`; the client sends it on 🚪 Leave), and not away for
  `AWAY_MS` (3 min) at that moment — gives the house `+ONLC.PASS.fame` (1) **`fame`**; the room's stands entry gets `fame:1`.
  `domusRow` (hello.domus, domus.get, domus.*) carries **`fame`**, **`passDay`** and **`patron`** (when set).
- **Houses + patrons in the stands.** Every stands entry (ticket, free, pass) carries **`domus`** (the house name) and **`patron`** (the house's
  look, when it has one). `liteRow` stands carry `{id, name, domus?, pass?}` (no look); the full room (members, ticket holders, match.watch) has both.
- **`domus.patron {look}`** → `{domus: row}`. `look` = a plain object (else "Not a look."; > 4 KB raw → "That look is too large."), cleaned by
  **`ONLC.cleanPatron`**: ≤16 keys `[a-zA-Z0-9_]{1,16}`, values boolean / number / string ≤40 chars (< > " ' backtick and backslash stripped), ≤1 KB after cleaning
  (else empty). `null` / an empty look removes it (every screen draws the generated default). Stands entries take the look when the seat is taken.
- Client (127): the free option in the host's ticket select, the 🎟 Free button in the lobby list and the guest-pass card now work on the server
  too; the patron editor keeps an unsaved draft in localStorage `flavius_patron82.<acct>` and saves it (domus.patron, 600 ms after the last
  change); other screens draw the look from the stands entries (learned into `ONL82.pat`), no who.list fallback.
