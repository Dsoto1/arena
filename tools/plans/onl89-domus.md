# v0.89 Online — THE DOMUS REBUILD (part H) — the contract

Approved by Virgilante 2026-10-05. **No protocol bump** (VER stays 7): every change is a new route or a new field; old clients keep working
(an old client's `char.edit` that sends a changed look or class is refused with a reason).

Where the code lives:
- shared rules: `src/111-onlcore.js`, the block **"v0.89 THE DOMUS REBUILD"** after the ONLC IIFE (it extends ONLC; `node tools/mkserver.js` copies it)
- server: `server/src/routes.js`, the block **"v0.89 THE DOMUS REBUILD"** at the end of `makeRoutes` (new routes + wrappers of existing ones), plus
  ONE edited line in `offer.move` (the shelf cap is `C.shelfMax(D)`); tests `server/test/v89d.test.js` (in `npm test`)
- mock + client: `src/175-v89domus.js` (MOCK_ROUTES for every route below, the new Domus screen); test `tools/tests/tonl89d.js`

Refusals keep the v0.83 shape `{ok:false, err, code?}`. New routes need a house (`need_domus`) and are never open to guests.

## 1. Prices (DEFAULTS — `ONLC.CLASS_FEE89`, `ONLC.UPG89`)
| what | cost | paid from | once |
|---|---|---|---|
| class change | **100** coin | the house TREASURY | any number of times |
| 5th gladiator slot (`slot5`) | **1500** coin | the treasury | once per house |
| bigger offerings shelf (`shelf`) +4 places (30 → 34) | **400** coin | the treasury | once per house |

Against the awards (Tiro 8 … Summa 35 … Invictus 60 a survived Ranked bout, 20% to the treasury): a class change ≈ 12 Tiro bouts' cuts …
2 Summa bouts' awards; the 5th slot is a long-term sink (≈ 40 Summa bouts of treasury cut).

## 2. Look locked · class from the treasury (his item A)
- `char.edit {char, name?, equip?, look?, cls?}` — **look**: refused unless it equals the stored look ("A gladiator's look is set when he is raised.")
  — the one exception is 128's one-time v0.82 conversion (a stored look WITHOUT a sculpted token `token.sc` → a look WITH one);
  **cls**: refused unless unchanged ("Change class in the Domus — 100 coin from the treasury."). Name + equip as before. (`ONLC.editChar` wrapped.)
- **`char.class {char, cls}`** → `{char, domus}`. Refused while the lanista is in a waiting room or a live match (`in_match`), with a living
  gladiator still fighting (`stillFighting`), same class, not one of the 8 printed, or the treasury short (`no_coin {cost}`). His gear stays his;
  the recruit kit (the class's own weapons) follows the new class at the next match. Ledger `out.class`.

## 3. Wearing gear from the Domus (items B2, B3, B4 of the screen)
Model since v0.89: a piece is either **worn** (on a gladiator AND in his `equip`) or **in the house** (the shelf `D.gear`). Pieces still on a gladiator
but not worn (from before) show in the house's Gear bar too and move to the shelf the first time that gladiator is dressed.
- **`domus.dress {char, equip:[item ids, in order], take:[{item, from:'house'|<gladiator id>}]}`** → `{char, domus, gear, pcs, from:[changed gladiators]}`.
  The `take` pieces (≤ 8) move onto `char` (history kept), then `char.equip` = `equip` filtered by `ONLC.dressApply`: held pieces only, no broken
  piece, no named piece below Veteranus, one copy of a non-stacking printed piece, armor by equip points (`armFit`, first wins), **at most 2 bought
  weapons** (`DRESS_W89`). **Every piece of `char` not in the final list goes to the shelf.** Refusals: `in_match` (char or a source gladiator seated),
  "Named pieces wait in the Storeroom until Veteranus." (a named piece taken by a gladiator below Veteranus), "That piece is not there.".
  The client computes the swap (the piece on the same point/hand comes off → shelf) and sends the whole list; a click on a worn piece sends the list without it.
- Old routes `domus.move` / `domus.equip` stay (old clients, tests); the new screen does not use them.

## 4. Keep home 🔒 (his item 2)
- **`gear.home {holder:'house'|<gladiator id>, item, on}`** → `{item (its id now), holder (gladiator or {house, gear, pcs})}`.
  The flag lives on the piece (`pcs[uid].home = 1`; a plain `'key'` is tagged `'key#uid'` first, so the id may change). It moves with the piece.
- **Friendlier rule (picked):** a kept-home piece may be worn and brought into **Custom** matches; for **Ranked** the kit leaves it at home —
  `ONLC.kitOf` lists it in `kit.home`, and `ONLC.roomJoin` / `seatGroup` / `startRoom` strip it from every kit of a Ranked room (`ONLC.kitStrip`).
  So it can never be lost, broken or looted in Ranked. The Domus shows 🔒 on the piece and leaves it out of the Ranked stake.

## 5. Saved loadouts (his item 4)
- **`char.kits {char, kits:[{n, items:[item ids]}]}`** → `{char}`. ≤ 3 kits (`KITS_MAX89`), names 1–20 letters (cleaned, word filter), ≤ 16 items;
  only pieces the gladiator **holds** at save time are kept. Stored on the gladiator: `ch.kits89`.
- **`char.kitapply {char, i}`** → `domus.dress`'s reply + `skipped:[{item, n, why}]`, `kit` (its name). Each saved piece: held → worn; on the shelf →
  taken back; with another gladiator → skipped ("with Beta"); broken → skipped; a named piece below Veteranus → skipped; gone (lost, looted, sold) →
  skipped. A printed piece whose id changed (tagged since) is matched by its base. Everything else he holds goes to the shelf.

## 6. The treasury ledger (item B4)
`D.led89 = {since, in:{cut, gift, sale, refund, grant}, out:{gear, repair, class, upg}, by:{<gladiator id>:{n, v}}}` (totals only, never a line list;
`by` ≤ 40 gladiators, only the 20% cut counts as "earned for the house"). Written from v0.89 on (`since`): the cut at every settlement, a house gift
opened into the treasury (coin, CF bonus as coin), offerings sold when the shelf is full (`sale`), an auction refund to the treasury (`refund`),
tester grants (`grant`); spending: `domus.buy` (`gear`), `gear.repair` paid by the treasury (`repair`), `char.class` (`class`), `domus.upgrade` (`upg`).
`domusRow` (hello.domus, domus.get, …) carries **`led89`** = `ONLC.ledgerOf(D)` `{since, in, out, by:[{id, n, v}] (highest first), tin, tout}`.

## 7. The memorial wall (item 7)
`D.memo89 = [{id, name, cls, rank, fa:'p'|'c', ev, loc, at, by:{k:'g'|'b'|'a'|'r'|'fate'|'abandon', n?}}]` newest first, ≤ 60 (`MEMO_MAX89`).
Appended when a gladiator of the house dies (Ranked: the settlement, a Ranked abandon). `by.n` = the killing gladiator's name when a seated lanista's
gladiator struck him (`row.kb 'g'` + `row.ks`); a CPU gladiator, a beast, the arena, the Thumb/Fate are named by kind. `domus.get` → **`memo`**.
The screen adds the house's earlier fallen (dead gladiators from before v0.89) without the bout line. Mark: ✝ for a Christian (`fa:'c'`, never
online today), else D·M.

## 8. Colours + crest (item 9)
**`domus.look {c1, c2, crest}`** → `{domus}`; `c1`/`c2` = `#rrggbb`, `crest` ∈ `ONLC.CREST89` (the 20 printed banner devices of 27-flags
`FLAG_SHAPES`: eagle horse mount tri olive croc tower goat sun lion wave moon wolf owl trident laurel boar ship thunder column). Never custom art.
`domusRow.look89 = {c1, c2, crest}`. Default (unset): the patron's cushion colours and a device picked from the house id.

## 9. Upgrades (item 10)
**`domus.upgrade {k:'slot5'|'shelf'}`** → `{domus}`; refusals: built already, `no_coin {cost}`. `domusRow.upg89 = {slot5?:t, shelf?:t}`,
`domusRow.gmax` = `ONLC.gladMax(D)` (4, or 5), `domusRow.smax` = `ONLC.shelfMax(D)` (30, or 34). `char.create` uses the house's `gladMax`;
`offer.move` / `offersIn` use `shelfMax`.

## 10. Tester grants, fixed (his item C)
`admin.grant {coin, gift, gear, offering, glory}`: **coin → the house TREASURY** (ledger `grant`), **gear → the house shelf, unequipped**,
**offerings → the house shelf** (`offersIn`), gifts → the house (as before), Glory → the active gladiator (as before; with none, ignored).
The reply keeps its shape `{domus, char, gifts, gear, pcs, offers}`.

## 11. Stake (client only, item 5)
Each gladiator card shows what he would risk in **Ranked**: the value (`ONLC.valueOf`, named pieces by rarity) of what he brings (`ONLC.equipOf`
minus kept-home pieces) + his purse. Red edge from **750** coin (`STAKE_HIGH89` in 175).
