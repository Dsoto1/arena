# v0.84 Online — the server contract (named armor · holographic cards · seasons + the weekly challenge · your-turn notices · reclaim a seat · CPU-won rewards · Flavius's Auction · small v0.83 follow-ups)

Protocol **VER 7** (src/111-onlcore.js). VER 6 clients get **426** on `$connect`. Server: server/src (routes.js, store.js unchanged API, index.js unchanged);
shared rules: ONLC (src/111-onlcore.js → server/src/onlcore.js by `node tools/mkserver.js`, which also rewrites server/src/catalog.json — **armor now
carries `slot pt pair bonus`**, see §1). The mock mirrors every route in **src/139-v84onl.js** (same ONLC calls); the screens live there too.
Tests: `cd server && npm test` (suite "server v0.84" = server/test/v84.test.js), `node tools/smartreg.js tonl84`.

Decisions marked **DEFAULT** are mine (Virgilante may change them); each names the constant that holds it.

New refusal codes:

| code | when | extra |
|---|---|---|
| `reclaim_late` | match.reclaim after the window (3 min, or the CPU already began that seat's next turn) | `until` |
| `reclaim_no` | match.reclaim: not your dropped / CPU-abandoned seat (or a Ranked abandon — that gladiator is dead) | — |
| `auc_closed` | auction.bid on a lot that has ended or does not exist | — |
| `auc_low` | auction.bid below the lot's next minimum | `min` |
| `auc_rank` | auction.bid by a gladiator below Veteranus (or none) | — |
| `auc_lead` | auction.bid while your house already leads another lot this week | `lot` |
| `auc_won` | auction.bid when your house already won a lot this week | — |
| `testHouse` | auction.bid from a TEST house (v0.83 code reused) | — |
| `no_coin` | auction.bid the active gladiator cannot pay | `cost` |

## 1. NAMED ARMOR (like the named weapons)
- Item id **`'na#<uid>'`**; engine key **`'na_<uid>'`** (in `ARM` during a match). `ONLC.NAMED_A='na'`; `ONLC.isNamed` is true for `nw` and `na`;
  `ONLC.isNamedA(it)`; `ONLC.engineKey('na#u') → 'na_u'`. `pieceInfo` → `{named:true, kind:'a', lv:4, ap, w:<def>, rar, val}` (`w` = the def for both kinds).
- Def (server-rolled, `ONLC.rollNamedArmor(rnd, catalog, rar, takenA)`):
  `{key:'na_<uid>', kind:'a', base, n, lv:4, slot, pt, ap, pair?, bonus?{loc:n}, ward?, swift?, uq?, rar, aff:[…], named84:1}`.
  Base = a printed armor piece of the catalog, never stackable padding/belts (`stack:false`). Clients copy the base's look (`ARM[base]`: img, thumb,
  art81, flags such as `greaves`/`cestus`) and its avatar fit (`ARM_FIT[base]`) and take the stats from the def (`ONLC.cleanNamedA`).
- Rarity as weapons: Common 0 affixes · Rare 1 · Epic 2 · Legendary 2 + one **unique**. Value = 1500 × 1/2/4/8 (unchanged `L4_PRICE`, `RARITY`).
- `ONLC.AFFIX_A` (caps keep it sane; all deterministic engine hooks in 139):
  `ap` +1 AP on the piece (piece ≤ 6, location cap 7 as always) · `bonus` +1 AP to another location (head/arm/leg/belt pieces → chest, chest pieces → head;
  only when the base has no bonus) · `ward` the first hit each **rotation** on the wearer loses 1 damage (any source; once per rotation like the weapons'
  Aegis — DEFAULT "round" read as rotation, `S.ri:S.rotation`) · `swift` +1 movement while unhurt (every location at its starting HP).
- `ONLC.UNIQUES_A` (each claimed ONCE in the world: WORLD `UNIQA#<k>`; all taken → the Legendary roll becomes Epic):
  `regalis` +1 CF at the start of each of the wearer's turns · `invicta` a hit of 2+ on the location it guards loses 1 damage · `gloriosa` +1 CF when a
  gladiator's hit on the wearer is stopped by armor (no HP lost) · `mercurialis` +1 movement · `vindex` +1 damage against the gladiator who last hit the
  wearer · `restituta` at the start of the wearer's turns its location regains 1 AP (up to the pieces' own AP; nothing once the location's armor broke).
  Effects last while the piece is WORN (a location at 0 AP sheds its pieces — the effect ends with it). Movement stays capped at 7.
- Names: Latin noun by slot (Galea / Lorica / Balteus / Manica / Ocrea) + the first affix's adjective (Common: Fida/Ferrea/Vetus), Epic + a god's
  genitive, Legendary noun + the unique's genitive ("Galea Mercurii", "Lorica Phoenicis").
- Sources: `rollGift`'s named branch now carries `kind` — **DEFAULT 40% armor / 60% weapons** (`NAMED_ARMOR_SHARE`; the kind is drawn after the rarity,
  so v0.83 rolls are unchanged for the same randomness). The CHEST pool (a fallen's unlooted named piece) may hold either kind. Same wear rule (Veteranus+).
- Kits: `kit.named` carries both kinds (armor defs have `kind:'a'`, key `na_…`); `kit.gear` the engine keys. Every client registers `ARM['na_<uid>']`
  when seats are built and again after a snapshot load (`p._na84`), and wears it like a bought piece (a pair covers both sides).
- **Loot** (`loot.offer` pieces) and the market/loot/profile cards now carry **`w`** = the full def of a named piece (weapon or armor) — the popup shows
  the whole card (§8).

- **Equip points (follow-up):** a kit never brings two armor pieces that cannot be worn together — one per equip point (`pt`) and layer
  (stackable padding vs hard) per location; head/chest (belts too) one location, arm/leg one side each, a pair both sides (the rule of 03-engine
  `armorConflict`). `ONLC.armFit(holder, items, catalog)`; `ONLC.equipOf` keeps the first of a clashing pair (so nothing comes out "broken" for
  being unworn); `ONLC.gearEquip(on)` (domus.equip, server + mock) unticks whatever shares the new piece's point; `char.edit {equip}` keeps the
  first; My Gladiators' Bring ticks untick the clashing box at once. The server passes its catalog with `ONLC.setCatalog`; the page uses `onlCatalog()`.
- Ward / Invicta apply to every source; ONE log line per hit, only when damage was actually turned aside.

## 2. HOLOGRAPHIC SHIMMER (client only)
Named cards (`nw83Card`, now also drawing armor) get **`holo84`** for Rare / Epic / Legendary: an animated sheen in the rarity colours over the border
(Rare: a faint slow sheen; Epic: violet conic shimmer; Legendary: gold-amber conic shimmer + glint). `body.calm` (Settings → reduce motion) and
`prefers-reduced-motion` keep a still sheen (no animation).

## 3. SEASONS = THE SYSTEM SCHEDULE + THE WEEKLY CHALLENGE
- Online weeks run on the server clock: `ONLC.SEASON_EPOCH` = 2026-10-01 00:00 UTC (a Thursday, the same boundaries as `weekKey`); week n since then →
  **season ⌊n/12⌋+1, week n mod 12 + 1** (`ONLC.seasonAt(t)` → `{season, wk, n, key:'S<s>W<w>', start, end}`).
- The fixture is the Manager's: `ONLC.seasonFixtures(season)` re-implements 19-calendar `seasonSchedule` (mulberry32(hashStr('sched'+season)), the same
  SCHED_WEIGHTS, the 12 arenas, no two specials in a row, week 12 = Familia from 77-rivalry). `ONLC.onlineFixture(t)` → `{season, wk, key, ev, evRaw, loc,
  start, end}`. **DEFAULT**: a special the online arena cannot hold yet (Golden Eagle, Juggernaut…) becomes **Democritus at the same city** (`evRaw` keeps
  the scheduled one). (The page's own `seasonSchedule` sorts with a random comparator; V8 — Chrome/Edge and the Node server — agree; the online card always
  shows the SERVER's fixture from `hello.season84`.)
- `hello.season84` = the fixture; `hello.week84` = the house's progress `{key, win, surv, bouts, wins, gift, done}` (signed-in with a house).
- **Challenges** (`ONLC.CH84`, every house, the week's fixture): ① **win** the fixture event at the fixture city (Ranked or Custom) · ② **survive** it in a
  Ranked bout (event + city) · ③ **finish 3 bouts** (any). Counted at settlement for every gladiator of the house (`ONLC.weekNote(D, m, ch, row, out)` →
  `D.wk84`), never for a seat the CPU mostly played (§6). All three done **and a win this week** → **ONE Flavius Gift** to the house
  (`{id:'week:<key>:<domus>', why:'week:<key>'}`); **DEFAULT cap: at most 1 challenge gift per house per week, no stacking** (`WEEK_GIFTS84 = 1`; the gift id
  is per week so it can never come twice; existing gift sources unchanged). Test houses can never finish ② (Custom only).
- Client: the landing's "This week" box is the challenge card — "This week: <event> at <city>" (season · week n of 12 · ends in …), the three challenges with
  ticks, the gift state; and the FIRST playlist card is **"⭐ This week: <event> at <city>"** (Ranked / Custom quick buttons → `lobby.quick {ev, loc}` — the
  quick room uses that city).

## 4. "YOUR TURN" NOTICES (client only, DEFAULT in-browser)
When it becomes your decision in a live online match (`onlmMine()` turns true) and the tab is hidden or unfocused: the tab title flashes
"⚔ Your turn — <event>", a short horn (`sfx('horn')`, so the game's mute applies), and a desktop `Notification` if the player allowed it. Permission is
asked only from the Forum header's **⚔🔔 Turn alerts** popup (never automatically); localStorage `flavius_onlturn84` = `off` turns title + horn off. No Web
Push / service worker in this batch.

## 5. RECLAIM A SEAT A CPU TOOK
- Who: a lanista whose seat a CPU took — **dropped** (away 3 min) in any mode, or **abandoned with rule 'cpu'** (Custom). A Ranked abandon is a death: never.
- **DEFAULT window: 3 minutes (`ONLC.RECLAIM_MS`) OR one full rotation, whichever comes first.** `match.drop` / `match.abandon` inputs carry
  `until` (server ms) when the seat can be reclaimed; META `dropAt84[acct]`, ACCT `rcl84 {id, seat, until}`.
- **Lockstep**: every client HALTS at the start of that seat's next CPU turn (= one full rotation after the CPU took it) and waits for ONE server input
  about that seat: **`{k:'reclaim', seat, acct}`** (the lanista is back) or **`{k:'cpugo', seat}`** (the window closed, the CPU plays on). Both are
  state-neutral MARKS when they arrive (always ready, applied in stream order); the swap happens at the halt — the same engine state on every screen.
  The halted live fighters send **`match.cpuheld {id, seat}`** (retried every 8 s); the server writes `cpugo` unless a reclaim came first.
  One lock a window (MATCH `RCLX#<seat>#<dropAt>`, putNew) makes `reclaim` and `cpugo` exclusive.
- **`match.reclaim {id}`** → `{seq, seat}`; refusals `reclaim_late {until}` (time, or the lock taken by `cpugo`), `reclaim_no`. On success the server
  clears `dropped/abandoned[acct]`, sets the connection, and orders the `reclaim` input. At the halt the seat's `p.cpu=false`, its owner is restored;
  the reclaimer's client turns from watcher into that fighter (`ONLM.me = seat`, `ONL.live`).
- Clients send `reclaim` / `cpugo` never: `match.input` refuses those kinds.
- `match.watch` replies and `hello.live` carry `reclaim:{seat, until}` while it is possible. Client: a 🔌 bar on the match ("A CPU holds your seat —
  ⚔ Take it back · m:ss") and on the main menu's live card; the button watches first (if needed) and then asks.

## 6. CPU-WON REWARDS
Every client counts each seat's turns at `resetTurn`: `p._t84 = {h, c}` (CPU vs human, deterministic, kept in snapshots). Result rows gain **`cpu`**
(true when **c > h — DEFAULT more than 50% of that seat's turns**, `ONLC.CPU_SHARE`), agreed like every other field (`cleanRow`).
`applyResult` with `row.cpu`: **DEFAULT ×0.25** (`ONLC.CPU_CUT`) on the coin award and on the Glory gained; **no gifts** (rank / survival); `trophiesFrom` → none;
no weekly challenge credit; the Fate still applies in Ranked. `out.cpu = true` (the result toast says so).

## 7. FLAVIUS'S AUCTION (only Flavius sells)
- Lots = named pieces from the CHEST pool (unlooted named pieces of the fallen), with their whole owner history. **DEFAULT 3 lots a week** (`AUC_LOTS`),
  drawn by the first sweep of the week (marker `AUCTION#<key> META`, putNew); a lot ends at the week's end, **DEFAULT at least 24 h after it opened**
  (`AUC_MIN_MS`). No pool → no lots that week.
- Bids: **Veteranus+** active gladiator; the coin leaves his wallet into ESCROW (the lot); the previous leader is **refunded at once** (to the gladiator, or
  the house treasury if he has died) + push `auction.outbid`. Minimum = **⌈value / 2⌉**; then **DEFAULT +5% (at least 10 coin)** over the leader
  (`ONLC.aucNextMin`). **Anti-snipe**: a bid in the last 5 min moves the end to now + 5 min (`AUC_SNIPE_MS`).
- **One win per house per week**: a house may LEAD only one lot at a time (`auc_lead`) and never bids after winning one that week (`AUCWIN#<key> D#<dom>`).
- Settlement in the existing sweeps (hello, auction.list, market.list — no timers): an ended lot with a bid → the piece goes to the winning gladiator
  (Veteranus+, alive) else his house shelf, with a history line `{how:'auction'}`; **the winning coin leaves the game** (a sink); push `auction.won`. No bid →
  the piece goes back to the chest pool. TEST houses may not bid (`testHouse`).
- Storage: `AUCTION#<key> L#<n>` the lot `{id, key, n, item, pc, val, min, opens, ends, bid:{acct,char,dom,dname,name,amt,at}|null, bids:[≤12], done, won}`
  (versioned: putRev), `AUCTION#<key> META`, `AUCWIN#<key> D#<dom>`. No new index, no new permission: **template.yaml unchanged**.
- **`auction.list {}`** (guests too, read-only) → `{week:{key,ends}, lots:[lot], past:[lot of last week], mine:{lead, won, why}, now}`;
  lot = `{id, item, kind, n, rar, val, min, next, ends, bid:{name,dname,amt,at}|null, bids:[{name,dname,amt,at}], hist, w, mine, done, won}`.
- **`auction.bid {lot, amt}`** → `{lot, char}`.
- Client: rail tab **🔨 Auction**: lot cards (named card + shimmer, owner history), countdown, the leader, the next minimum + Bid, my lead/win, last week's results.

## 8. SMALL v0.83 FOLLOW-UPS
- The TEST chip on in-match names (the fighter panel header and the log), from the room's `test` flag (`seat.onl.test` → `p._test84`).
- Today cards carry the house chip (🏛 House …) that opens its profile: Today entries gain `dn` (the house name; the server fills it in `today()`).
- The loot popup shows the full named card (pieces carry `w`).

## 9. STORAGE + DEPLOY
DOMUS + `wk84` · MATCH META + `dropAt84 {acct:ms}`, `held84 {seat:ms}` · `AUCTION#<key> L#<n>` / `META` · `AUCWIN#<key> D#<dom>` · WORLD `UNIQA#<k>`.
No new index or permission (template.yaml unchanged). Deploy: `node tools/mkserver.js` (catalog with armor slots) → server zip (protocol 7) → the game.
