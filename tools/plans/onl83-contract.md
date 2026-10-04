# v0.83 Online — the server contract (ranks · gear levels · treasury · offerings · gear loss + loot · gifts · named weapons · countdown · trophies · follow · wagers tab)

Protocol **VER 6** (src/111-onlcore.js). VER 5 clients get **426** on `$connect`. The server is server/src (routes.js, index.js, store.js);
the shared rules are ONLC (src/111-onlcore.js → server/src/onlcore.js by `node tools/mkserver.js`, which also rewrites server/src/catalog.json —
**weapons now carry their stats**, see §7). The mock server mirrors every route in **src/133-v83onl.js** (same ONLC calls).
Tests: `cd server && npm test` (suite "server v0.83" = server/test/v83.test.js), `node tools/smartreg.js tonl83`.
Client hooks for the UI live in **133-v83onl.js** under the global **`ONL83`** (§13). Nothing here draws a screen.

Replies/refusals as v0.82: `{re, ok:true, d}` | `{re, ok:false, err, code?, ...extra}`. New codes:

| code | when | extra |
|---|---|---|
| `in_match` | (as v0.82) also offer.bring, gear.repair (holder seated), gift.open | — |
| `no_coin` | gear.repair / domus.buy / market.buy cannot be paid | `cost` |
| `sold` | market.buy: someone bought it first | — |
| `loot_done` | loot.pick after the pick was made (by you or by the default) | `picked` (index) |
| `no_domus` | domus.profile / domus.follow: no such house | — |
| `count_wait` | lobby.start {go:1} before `startAt` | `startAt`, `now` |
| `count_stopped` | lobby.start {go:1} when the countdown was stopped (✕ Hold or a line-up change) | — |
| `notTester` | admin.grant from an account that is not a tester (§15) | — |
| `testHouse` | a TEST house (or a party with one) asks for a Ranked room: lobby.create / quick {ranked}, lobby.join / accept / sit / again on a Ranked room | — |

## 1. EIGHT RANKS (Glory)
`ONLC.RANKS` = Tiro 0 · **Novicius 90** · Gregarius 180 · Veteranus 550 · Primus Palus 1150 · Summa Rudis 2100 · **Rudiarius 3500** · **Invictus 5500**
(keys `tiro novicius gregarius veteranus primus summa rudiarius invictus`; each has `n`, `glory`, `mkt`, `ic`). Never demoted (`ch.rankK`, unchanged).
`rankIdx` moved: **Veteranus is index 3** — use `rankIdx('veteranus')`, never a number. Hall of the Fallen: died at Veteranus+ (unchanged rule).
`AWARD = {tiro:8, novicius:10, gregarius:12, veteranus:18, primus:25, summa:35, rudiarius:45, invictus:60}`; win +50%, streak, table factor unchanged.
`hello.rankCounts` / `world.news.rankCounts` carry all 8 keys. The server re-seeds WORLD COUNTS once from a scan (marker `seeded6`), so gladiators
whose Glory already passed 90 / 3500 / 5500 are counted at their new rank. Ranked matchmaking = equal rank key (now 8 buckets).
Rank pins to show: `ONLC.RANKS[i].ic` (🪵 🌿 🛡 ⚔ 🏛 👑 🗡 🦅).

## 2. GEAR LEVELS — wear vs buy
- Levels 1–3 = printed system gear; level 4 = **named** pieces (generated chest weapons, §7). `RANKS[].mkt` now means *the highest level the rank may
  WEAR / bring / carry*: 3 for Tiro, Novicius, Gregarius; 4 from Veteranus up.
- **No rank gate on BUYING** (`canBuy` checks only price, "Already yours" for a non-stacking piece, the dead). Any rank holds and brings printed L1–3.
- Named pieces: `domus.move` onto a gladiator below Veteranus → "Named pieces wait in the Storeroom until Veteranus." (they stay on the house shelf);
  `domus.equip {on:true}` / `char.edit {equip}` refuse a named piece below Veteranus and any broken piece with the reason (`ONLC.wearWhy`).
  `ONLC.equipOf` (what is brought) silently skips both.
- Helper: `ONLC.canWearNamed(ch)`.

## 3. PIECES (item ids) — read this before drawing gear
A gladiator's (`ch.gear`) or house shelf's (`domus.get` → `gear`) list holds **item ids**:
- `'galea'` — a printed piece, whole, no history (as before);
- `'galea#<uid>'` — a printed piece with a state or a history;
- `'nw#<uid>'` — a **named weapon**.
State lives in **`pcs`** on the holder (`ch.pcs`, `domus.get → pcs`): `pcs[uid] = {st:'whole'|'broken', hist:[{house, glad, when, how}], rar?, w?}`
(`how` = `'taken'` by a killer · `'fell'` with its owner). `w` = the named weapon's full def.
**Always** go through `ONLC.pieceOf(holder, item, catalog)` (client: `ONL83.piece(holder, item)`) →
`{item, base, key (engine key), named, kind 'w'|'a', lv, n, ap, stack, st, hist, rar, w, val}`.
- `ONLC.valueOf(I)` = `I.val`: printed = `priceOf(catalog)`; named = `L4_PRICE (1500) × RARITY.mult` (Common ×1 · Rare ×2 · Epic ×4 · Legendary ×8).
  Show it "everywhere value is shown" (cards, gear score, stakes, loot, history). Named pieces are never bought or sold.
- `ONLC.repairCost(I)` = ⌈value / 3⌉. `ONLC.isBroken(h, item)`, `ONLC.itemBase`, `ONLC.itemUid`, `ONLC.isNamed`, `ONLC.engineKey`
  (`'nw#u'` → `'nw_u'`, the key in `W` during a match).
- `domus.move {item, from, to}` keeps the piece's state and history (the reply's house side now carries `pcs`).

## 4. THE KIT (what a seat brings) — `ONLC.kitOf(ch)`
`{cls, name, stats, look, gear:[engine keys], items:[item ids, parallel to gear], named:[full weapon defs, key 'nw_<uid>'], offer:[≤2 keys], cfb}`.
`gear` keeps working for old readers (printed keys are unchanged; named ones are `nw_…`, not in the catalog — use `ONL83.kitPieces(kit)`).
`cfb` = extra STARTING CF (a gift, §6) — applied only in a **Ranked** match (as carried-in CF), spent at its settlement.
Kits are captured when a lanista joins a room (unchanged); gear/offerings/gifts are locked while the gladiator is seated (`in_match`).

## 5. HOUSE TREASURY
- `applyResult` → `out.award` (the whole flat award, as v0.82's pay), **`out.cut` = round(award × 0.2)** to the house treasury,
  **`out.pay` = award − cut** to the gladiator's wallet. `ONLC.TREASURY_CUT = 0.2`.
- `domusRow` (hello.domus, domus.get, profile…) gains **`treasury`** and **`trophyN`** (trophy count). The treasury and the shelf outlive any gladiator.
- **`domus.buy {item}`** — the treasury buys a printed catalog piece onto the shelf → `{domus, gear, pcs}`; refusal `no_coin {cost}`.
- **`gear.repair {holder: <gladiator id>|'house', item, pay: 'treasury'|<gladiator id>}`** — default pay: the treasury for a shelf piece, the holder's
  wallet for a gladiator's. → `{cost, item, holder (gladiator or {house, gear, pcs}), domus, payer?}`. Refusals: not broken, `no_coin {cost}`, `in_match`.
- On a Ranked death, the dead gladiator's **un-brought** pieces go onto the house shelf (with their state).

## 6. ARMORY OFFERINGS + FLAVIUS'S GIFTS
Offerings: `ONLC.PRICE_OFF = {elix2:40, ap2:40, merc1:40, cf1:40, elix4:120, ap3:120, merc2:120, cf2:120}` (`OFFERS83`; never spiders / curse).
A gladiator's satchel `ch.offers` (≤ `OFF_MAX` 10); `ch.offerEq` = the ones to bring (≤ `OFF_CARRY` 2; absent → the first two; `ONLC.offersBrought`).
- **`offer.buy {char, key}`** → the gladiator (wallet − price). **`offer.bring {char, keys:[≤2]}`** → the gladiator (`in_match` while seated).
- In the match they are in the hand (seat `festItems`, log "carries … a boon"); **cf1/cf2 are playable from the hand** (+1/+2 CF, when CF is allowed).
- After the match (any mode): brought offerings leave the satchel; those still in hand at the end (`row.off`) come back to a survivor (`out.offBack`).
  A Ranked death loses the satchel.
Gifts: `ch.gifts = [{id, why: 'rank:<k>'|'surv:<n>', at}]` (≤20), earned in `applyResult` for **every rank reached** and **every 5 Ranked bouts
survived** (`out.gifts` lists the new ones; `out.ranks` the ranks crossed). Unopened gifts die with the gladiator.
- **`gift.open {char, gift}`** (`in_match` while seated) → `{reward, to:'glad'|'house', char, domus?, gear?, pcs?}`. `reward` =
  `{k:'coin', v}` · `{k:'cf', v}` (adds to `ch.cfb`, ≤12) · `{k:'off', key}` (satchel full → half its price in coin, `sold`) ·
  `{k:'gear', item, lv, piece}` (a printed L1 (uncommon) / L2–L3 (rare) piece onto the gladiator) · `{k:'named', rar, piece}` (very rare; goes to the
  gladiator from Veteranus up, else onto the house shelf: `to:'house'`). Table: `ONLC.GIFT_W` (coin 55 · cf 15 · off 15 · l1 9 · l23 4 · named 2),
  rarities `ONLC.RAR_W` (common 50 · rare 30 · epic 15 · legendary 5). A named gift may come from the CHEST pool (a fallen's named piece, history kept).

## 7. GENERATED NAMED WEAPONS
The server rolls `ONLC.rollNamed(rnd, catalog, rarity, takenUniques)` and stores the piece as `'nw#<uid>'` with `pcs[uid].w` = the FULL weapon def:
`{key:'nw_<uid>', base, n, lv:4, p, r, img, ammo?, throw?{p,r,n}, shield?, absorb?, uses?, cfw?, soul?, both?, atkUses?, stones?, pierce?, uq?, rar, aff:[…], named83:1}`.
- Base = a printed market weapon (the catalog now carries `p r ammo throw shield absorb uses cfw soul both atkUses stones img` for weapons).
- Rarity: Common 0 affixes · Rare 1 · Epic 2 · Legendary 2 + one **unique effect**. `ONLC.AFFIX`: `dmg` +1 power (≤5, thrown too) · `rng` +1 range (≤5) ·
  `use` +1 ammo / throw / shield use / attack use · `pierce` armor-piercing 1 · `crowd` +1 CF a hit. ("+1 hit die" is not possible: `rollHits` is a const arrow.)
- `ONLC.UNIQUES` (each claimed ONCE in the world: WORLD `UNIQ#<k>`; when all are taken a Legendary roll becomes Epic):
  sanguis (heal 1 HP per bloody hit on a gladiator) · gloria (+2 CF a hit on a gladiator) · fortuna (+2 coin a hit on a gladiator) · ferox (+1 damage vs beasts) ·
  venator (+3 CF a beast slain) · aegis (first hit taken each rotation −1) · ultor (+1 damage vs the last gladiator who hit the wielder) ·
  messor (+3 CF a limb severed) · regius (+1 CF at the start of each of the wielder's turns) · percussor (armor-piercing 2). Shields roll only aegis/regius.
- Names: Latin noun of the base + adjective of the first affix (Common: Fidus/Ferreus/Vetus), Epic + a god's genitive ("Hasta Cruenta Martis"),
  Legendary noun + the unique's epithet ("Gladius Ultor"). Icon = the base weapon's icon (`img`) tinted by `rar` (UI).
- **Every client builds it identically**: the lobby kit carries `named` defs; 133 registers `W['nw_<uid>'] = ONLC.cleanNamed(def)` (no `custom` flag, so
  gearRebuild never deletes it; never in the market or the chest) when seats are built (`onlSeatsFor`) and again after a snapshot load (`onlmLoad`,
  from `p._nw83`), then puts the weapon in hand like a bought one. Engine hooks (133): `hurt` (pierce, ultor, aegis, sanguis, gloria, fortuna, messor),
  `hurtNPC` (ferox, venator), `resetTurn` (regius). All deterministic — lockstep-safe.
- **Ludi Infames**: a room flag `inf` (`lobby.create {inf:1}`, `lobby.quick {inf:1}` — the quick pointer is per flag; `lobby.again` keeps it) open to
  **Veteranus and above** only (`canJoin`: "Ludi Infames: Veteranus and above."). The playlist where named gear is the point; rules otherwise unchanged.

## 8. RANKED GEAR LOSS + LOOT (results by agreement carry what's needed)
**Result rows** (every human reports the whole table; `ONLC.cleanRow` — the majority compares them) gain:
`brk` (sorted engine keys of pieces this seat BROUGHT and no longer holds at the end), `off` (sorted brought offering keys still in hand),
`ks` (seat that eliminated it, −1), `kb` (`g` gladiator · `b` beast · `a` the arena · `r` retired · `''` standing), `thumb` (spared by the Thumb of Flavius),
`slew` now may hold `tholo` too. 133 fills them (wraps `onlRow81`, and `eliminate` records `S.elimOrder[].bySeat/kb`). Rule (deterministic, end state):
a brought armor piece not on the body at the end (its location hit 0 AP, severed, Falls Apart, taken off) and a brought weapon not in hand at the end
(shield/uses spent, thrown and not picked up, dropped, Falls Apart) come out **BROKEN**.
At settlement (`out.broken` = new item ids, `out.offBack`):
- **Ranked survivor**: the `brk` pieces become broken (`'key#uid'`, `st:'broken'`, unticked); a broken piece cannot be brought until `gear.repair`.
- **Ranked death**: everything brought is lost to the gladiator; un-brought pieces → the house shelf. If `kb==='g'` and seat `ks` is a **human whose
  gladiator survived the match** → a **loot window** for that killer: push **`loot.offer`** `{id (match), seat (dead), until (now + LOOT_MS 90 s),
  dead:{acct,char,name,cls,domus}, killer:{seat}, pieces:[{item, n, kind, lv, st, rar, val, hist}]}`; **`loot.pick {id, seat, item}`** → `{id, seat, got:{item,n,kind,lv,st,rar,val},
  to:'glad'|'house'|'market', char}` (+ push **`loot.done`** with the same). Untaken by `until` → the most valuable (`ONLC.lootBest`) at the next sweep
  (every hello, `loot.list`, `market.list`). The killer's piece gets a history line `{house, glad, when, how:'taken'}`; if he cannot carry it (a named
  piece below Veteranus, a second non-stacking piece) it goes to his house shelf. **`loot.list {}`** → the open windows (also `hello.loot`).
  Everything else (no human killer: beast, CPU, arena, Fate, abandon) → **the market** with a `fell` history line: printed pieces to the used market,
  named pieces back to the **CHEST pool** (a later gift may draw them, history kept).
- **`market.list {}`** → `{used:[{id, item, base, n, kind, lv, st, price, at, from:{house,glad}, hist}]}` (60 newest; price = catalog price, ⅔ when broken).
  **`market.buy {char, id}`** → `{char}` (the piece keeps its state/history; `sold`, `no_coin`).

## 9. START COUNTDOWN (server-side, every client agrees)
- **`lobby.start {id}`** (host) → the room with **`startAt`** (= now + `ONLC.COUNTDOWN_MS` 10 s), `startBy`, `startSig` (+ `now` = server clock); pushed as
  `lobby.update` with `count:startAt`. Calling it again before `startAt` returns the room unchanged.
- **`lobby.start {id, go:1}`** at/after `startAt` → the horns (status live, as before). The host sends it; any seated lanista may from `startAt + 5 s`
  (host gone). Early → `count_wait {startAt, now}`; stopped → `count_stopped`.
- **`lobby.hold {id}`** (host, ✕ Hold) → the room, `startAt:null` (push `lobby.update` with `held:1`).
- **Any line-up change stops it**: every room write runs `ONLC.countCheck(L)` (signature `ONLC.lineupSig` = event, seats, teams, ranked, host,
  seated players + teams). Tickets, bets, ready marks and phrases do not stop it. `ONLC.countLeft(L, now)` → ms left or null.
- 133's `NET.req('lobby.start')` wrapper already waits for `startAt` and sends `go:1` (so old callers still resolve with the live room); `ONL83.hold(id)`.
- The room shows the line-up + what is at stake: `ONL83.stakes(L)` (§13). Test knobs: `makeRoutes({countdown:0})` / `makeHandler({countdown:0})` start at
  once; the mock reads localStorage `flavius_onlcd83` (ms).

## 10. TROPHY ROOM
On the DOMUS: `D.trophies = [{k, n, at, glad, x}]` (≤60; `x` = count for repeatable ones), `D.recent` (last 10 matches:
`{id, ev, loc, at, ranked, glad, cls, won, died, cf, place}`). Awarded at settlement (`ONLC.trophiesFrom`): `first:<ev>` (first Ranked win per playlist),
`rank:<k>` (each rank reached), `slew:commodus`, `slew:tholo`, `surv10`, `surv25` (a gladiator's Ranked bouts survived), `thumb` (spared by the Thumb);
`vday` = **Victor of the Day** (repeatable; yesterday's best win by CF, awarded once by the first hello/world.news of the next UTC day: WORLD `VDAY#<day>`;
Today's entries now carry `dom` = the house id). Names: `ONLC.trophyName(k)`. `domus.get` returns `trophies` and `recent`.

## 11. PROFILE + ★ FOLLOW + share link
- **`domus.profile {id}` or `{name}`** (guests too) → `{domus: row + {archived, trophies, recent}, glads:[{id,name,cls,rank,glory,bouts,wins,survived,look:{token,color}}],
  rank (best living), link ('#domus=<id>'), following, mine, now:{id,name,st:'off'|'free'|'room'|'fight', room?, match?, glad?, acct?}}`. `no_domus` if unknown.
- **`domus.follow {id, on}`** (on:false unfollows; ≤ `FOLLOW_MAX` 100; not your own) → `{follows}`. Stored on the account as `[{id,name}]`.
- **`hello.follows`** = `[{id, name, st, room?, match?, glad?, acct?}]` — `st` from presence: `off` · `free` (Invite: `acct`) · `room` (Join) · `fight` (👁 Watch `match`).
- Share link: `ONLC.domusLink(id)` → `'#domus=<id>'`; `ONLC.domusFromHash(location.hash)` → id or null. (The client opens the profile from it.)

## 12. WAGERS TAB
- **`wager.list {}`** (guests: no `mine`) → `{open:[{id, ev, loc, status, ranked, seats, players:[{seat,name,domus,cls}], pool, pot, seats:[{seat, stake, bets, odds}]}],
  mine:[≤30 {id, room, ev, loc, ranked, seat, amt, target, at, res:'open'|'won'|'lost'|'refund', pay}], top:[≤10 {name, domus, dom, net, won, staked}], week}`.
  `odds` = payout multiple if that seat wins (pool + pot − 5%) ÷ stake on it (`ONLC.oddsOf(L)` for a full room too).
- Storage: each bet → `BETS#<acct> B#<ts13>#<room>#<r>` (the lobby's bet entry carries `bk`), its outcome written at settlement (`ONLC.betResults`, the same
  arithmetic as `settle`) or `refund` when a game is called off; the week's tally `WAGERWK#<W…> A#<acct>` {staked, net, won, name, domus, dom} (`ONLC.weekKey`).

## 13. CLIENT HOOKS (133-v83onl.js) — for the UI agent
- `ONL83.piece(holder, item)` → `ONLC.pieceOf` with `onlCatalog()`; `ONL83.value(I)`, `ONL83.repairCost(I)`; `ONL83.kitPieces(kit)` → piece infos of a lobby kit;
  `ONL83.kitValue(kit)`; `ONL83.stakes(L)` → per seat `{seat, name, domus, value, pieces, offer, ranked}` (what is at stake at the horns).
- `ONL83.regNamed(defs)` registers named defs into `W` (done automatically for seats and snapshots); `ONL83.rarCol[rar]` tint colours
  (common #b9b2a0 · rare #4f8fd6 · epic #9a5bd0 · legendary #e0a530).
- `ONL83.countLeft(L)` (server clock: `ONL80F.skew`), `ONL83.hold(id)`, `ONL83.follow(id,on)`, `ONL83.profile(idOrName)`, `ONL83.share(id)` (the link text).
- Pushes to listen for: `loot.offer`, `loot.done`, `lobby.update` (`count`, `held`).
- Engine: `S.elimOrder[].bySeat/kb`; `onlRow81` rows carry brk/off/ks/kb/thumb; offerings from the kit in hand; cf offerings playable; named weapons + uniques.

## 14. STORAGE (server/src/store.js header) and deploy
DOMUS + treasury, trophies, recent, pcs (shelf states) · CHAR + pcs, pcsN, offers, offerEq, cfb, gifts, giftsOpened · ACCT + follows ·
`LOOT#<match> S#<seat6>` (GSI1PK 'LOOT' → 'LOOT_DONE', ttl 3 days) · `MARKET U#…` (ttl 14 days) · `CHEST P#<uid>` · `WORLD UNIQ#<k>`, `WORLD VDAY#<day>`,
`WORLD COUNTS seeded6` · `BETS#<acct> B#…` (ttl 30 days) · `WAGERWK#<week> A#<acct>`. **No new index or permission**: template.yaml unchanged
(LOOT uses the existing GSI1; queries are on PKs). Deploy the server (protocol 6, `node tools/mkserver.js` first: catalog with weapon stats) with the client.

## 15. HIS CALLS AFTER THE SERVER HALF (v0.83 client batch): gifts belong to the DOMUS · shelf offerings · tester grants
**Gifts + freebies belong to the house** (guest passes and free tickets already were per house / per room).
- `applyResult` still names new gifts on the gladiator (`out.gifts`), but `gearAfter` moves them out (`gx.gifts`, each `{id, why, at, glad}`) and the
  settlement puts them on the house: `ONLC.giftsIn(D, gs)` → `D.gifts` (≤ `GIFT_HOUSE` 40; `D.giftsOpened` keeps an opened id from coming back).
  They survive any death. `domusRow` gains `gifts` (count), `offers` (count) and `test` (when set); `domus.get` returns `gifts:[…]` and `offers:[…]`.
- **`gift.open {gift}`** opens a HOUSE gift for the account's **active** gladiator (coin / CF bonus / offering / gear to him; a named piece below
  Veteranus → the shelf, `to:'house'`). With **no living gladiator** it goes into the house (`ONLC.applyGiftHouse`): coin → treasury, a CF bonus →
  coin (`CFB_COIN` 8 a point, `reward.coin`), offering / gear / named → the shelf. A gift still on a gladiator from before (`{char, gift}`) opens as before.
  Reply: `{reward, to:'glad'|'house', char|null, domus, gear?, pcs?, gifts}`.
- **Offerings on a Ranked death**: the brought ones die with him; the un-brought satchel goes onto the house shelf (`gx.offLeft` → `ONLC.offersIn` →
  `D.offers`, ≤ `OFF_SHELF` 30; overflow sold at half price into the treasury).
- **`offer.move {key, from, to}`** (`'house'` | gladiator id): one offering between the shelf and a satchel (≤ `OFF_MAX`), never for a seated
  gladiator (`in_match`) → `{from, to (gladiator or {house, offers}), domus}`. Helpers `ONLC.offerMoveWhy / offerMove`.

**Online tester grants** (server-side only; nothing usable from the client by others).
- Deploy: `TESTERS='a@gmail.com,b@gmail.com' sh deploy.sh …` → template parameter **`Testers`** (NoEcho, default '') → Lambda env `TESTERS`.
  Left out of a later deploy, the stack keeps its list; `TESTERS=none` clears it. **A template change → full stack deploy.**
- `$connect`: the verified ID token's `email` (a Google identity) is compared case-insensitively; only `tester:true` is stored on the CONN item
  (`ctx.tester`) — the e-mail is never stored or sent. Dev stacks/tests: `?dev=<name>&email=<e-mail>`; `makeHandler({testers})`.
- `hello` → `tester:true` for testers (the client then shows the folded 🧪 Tester panel on the Domus).
- **`admin.grant {coin?, gift?, gear?:[catalog keys], offering?:[keys], glory?}`** → testers only (`notTester`), only their OWN house and active
  gladiator (coin/gear/offerings/Glory to him; with none, coin → treasury and the rest → the shelf; gifts → the house). Caps: coin ≤100000,
  gifts ≤10, Glory ≤10000, ≤10 gear / offerings. Logged in `ADMIN log` `{list:[{at, acct, domus, glad, what}]}` (≤500).
  → `{domus, char|null, gifts, gear, pcs, offers}`.
- A granted house is a **TEST house for good**: `D.test`, the account's `dtest`, every gladiator `ch.test` (and new ones). Custom only (`testHouse`,
  "Test houses play Custom only."), never in Today (its seats are left out of `dayFromMatch` / `dayFell`), the rank counts (decremented once at the
  first grant, `countRank` skips `ch.test`, the seeding scan too), the wagers' top list, Victor of the Day. Room players carry `test:1`;
  the client draws a **TEST** chip beside the house name.
- Mock: `localStorage flavius_onltester83 = '1'` makes the mock's accounts testers (the mock only; AWS ignores it).
