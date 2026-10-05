# v0.89 L — THE ONLINE PROFILE + LANISTA NAME + FID + THE HOUSE VISIT — the contract

Approved by Virgilante 2026-10-05 (+ his additions the same day: the FID, search by FID, "view other player's Domus").
**No protocol bump** (VER stays 7): new routes, new fields, wrappers. Old clients keep working (they simply never show the name step).

Where the code lives:
- shared rules: `src/111-onlcore.js`, block **"v0.89 L · THE LANISTA"** after the Domus/affix blocks (`node tools/mkserver.js` copies it)
- server: `server/src/routes.js`, block **"v0.89 L"** at the end of `makeRoutes` (after "end of v0.89 THE DOMUS REBUILD"); test `server/test/v89p.test.js` (in `npm test`)
- server `server/src/index.js`: ONE edited line — a verified token's name is no longer read (`name='Lanista'`); the Google name is never stored
- mock + client: `src/180-v89profile.js` (MOCK_ROUTES for every route below + the UI); test `tools/tests/tonl89p.js` (in runreg DEFAULT)

**Edits to existing lines: only index.js (above).** In routes.js `fitFor` and `inviteOne` are function bindings that the L block re-points
(privacy wrappers); `hello`, `who.list`, `domus.follow`, `lobby.invite`, `domus.profile`, `auth.signin` are wrapped in the L block.

## 1. Fields
| item | field | meaning |
|---|---|---|
| ACCT PROFILE | `lname` | the lanista name (public) |
| | `name` | = `lname` (or 'Lanista' before one is chosen). hello rewrites an old Google name once. Sent only to its owner. |
| | `nameAt` | when the name was chosen / last changed (the 30-day clock) |
| | `lold {n, until}` | the former name, shown "formerly n" until `until` (14 days) |
| | `priv89 {hide, inv}` | `hide` = no Here-now pill / no Orbis glow (still counted); `inv` ∈ `all · follow · none` |
| | `fid` | the Flavius ID code (6 letters of `23456789ABCDEFGHJKMNPQRSTUVWXYZ`), shown `FID-XXXXXX`, never changes |
| | `fq89 {h, n}` | lookups this minute (rate limit) |
| `LNAME#<lower name>` `LNAME` | `{acct, name, until?}` | a claimed lanista name (putNew); `until` = a former name held for its owner, free after |
| `FID#<code>` `FID` | `{acct}` | FID → account (made once, lazily on hello / any lookup) |
| GUEST#<gid> GUEST | `fq89` | a guest's lookups |

## 2. Rules (ONLC)
- `lnameWhy(s)`: 3–24 letters (`LNAME_MIN89/MAX89`), letters, spaces, `.` and `-` only, `nameBad` word filter. Unique case-insensitively (`lnameKey`).
- `RENAME_MS89` = 30 days between changes (the FIRST naming starts the clock too); `LOLD_MS89` = 14 days for "formerly" and the hold.
- `invWhy89(T, {domus})`: `none` → "They take no invitations."; `follow` → only houses T follows.
- `fidClean(s)` accepts `FID-ab3xyz`, ` ab3 xyz `, any case; `fidShow(c)` → `FID-C`. `FIND_MAX89` = 20 lookups a minute.
- `domusPub89(D)` = `domusRow` minus treasury, gifts, offers, passDay, led89, upg89, smax, patron.
- `visitChar89(ch)` = id, name, cls, look, rank, rankK, glory, bouts, wins, survived, lifeCF, born, and ONLY what he wears (`gear` = `equip` =
  `equipOf`, `pcs` of those pieces without the `home` flag). Never wallet, offers, offerEq, kits89, cfb, gifts.
- `GUEST_OK` += `fid.find`, `domus.visit`.

## 3. Routes (new)
| route | in | out | refusals (code) |
|---|---|---|---|
| `lanista.name` | `{name}` | `{lan:{name, need, fid, next, old, priv}}` | `lname` (filter/length), `name_taken`, `too_soon {next}` |
| `lanista.names` | `{ids:[acct] ≤16}` | `{<acct>:{n, fid, old?}}` (bots / unnamed left out) | — |
| `acct.priv` | `{hide?, inv?}` | `{priv}` | — (hide also blanks the stored time zone) |
| `fid.find` | `{fid}` | `{fid, domus: public row, lan}` | `slow`, `no_fid` "No house with that FID." (deleted accounts too) |
| `domus.visit` | `{id \| name \| fid}` | `{domus (public + trophies, recent, archived), glads:[visitChar], active, memo, fallen:[{id,name,cls,rank,at}], lan, fid, following, mine, now, acct?, inv}` | `slow`, `no_fid`, `no_domus` |
| `acct.delete` | `{confirm}` = the house name (any case), or the lanista name without a house | `{deleted:true}` | `confirm`, `in_match` (in a room or a live match) |

`domus.visit.acct` = the owner's account id only when he is free AND may be invited by the asker (`inv` = the reason otherwise) → ✉ Invite.
`now` is `off` for a hidden lanista. Guests may call `fid.find` / `domus.visit` (same limit per guest id).

**acct.delete** removes: the ACCT item, every CHAR (living ones leave the rank counts), the DOMUS (+ archived ones) and their DNAME, the LNAME items
(current + held former), FID#, BETS#<acct>, INVITE#<acct>, this week's WAGERWK row, party membership (party.leave). Today/Acta (DAY# of today and
the day before): entries keep the gladiators' names, their `dom` link is removed. Others' follow lists drop the house lazily (hello).
The open socket stays; the client signs out.

## 4. Wrapped routes
- `hello` (signed in): makes the FID once; rewrites `name` to the lanista name; a hidden lanista's time zone is sent as '' (no Orbis glow);
  adds `lan89 {name, need, fid, next, old, priv}` + `needLname`; `follows[]` gain `lan` (the house's lanista), a deleted house drops off,
  a hidden house shows `off`.
- `who.list`: hidden lanistas are left out; rows gain `lan` and `noinv:1` when the asker may not invite them.
- `domus.follow {fid}` → follows that FID's house (rate-limited lookup); `{id}` as before.
- `lobby.invite {to: FID}` (or `{fid}`) → resolved to the account (rate-limited); then `inviteOne`, which now checks `invWhy89` first (also for `lobby.again`).
- `fitFor` (📣 lobby.call, the 'open' line): lanistas whose `inv` refuses the caller are left out.
- `domus.profile`: + `lan {n, old?}`, `fid`; `now` off for a hidden lanista.
- `auth.signin` (dev stacks / the mock only): a valid, free sign-in name is claimed as the lanista name at once (old tests and the mock box);
  `{google:1}` keeps the real path (the name step).

## 5. Client (180)
- Name step (V89L.need): replaces the main area before "Found your house"; the rail is greyed (only Sign out); 🎲 random praenomen + nomen
  (Math.random). The rail account box shows the lanista name.
- 👤 Profile & Settings tab (`ONL.tab 'prof'`, after the Hall): Name + FID 📋 + Rename (disabled with the next date), 🔍 Find a house by FID +
  ★ Follow by FID, 🔒 Privacy (checkbox + radio), ⚙ Account (Sign out, 🗑 Delete: two popups, the second takes the house name). Guests: a note + the search.
- Visit (`ONL.tab 'visit'`, `V89L.visit`): "Visiting House X" strip (★ Follow, ✉ Invite, FID 📋, ← Back to your Domus), banner (crest, colours,
  record, 🏆 Trophies popup), showcase (avatar in his armor, weapon cards, worn armor, rank, record — no purse/stake), gladiator cards (click =
  show him), memorial wall. Opened by: FID search, any other house chip / followed house (`[data-onl83="prof"]`, `.dom82c`, `.dom84c` —
  window-capture, your own house keeps its popup), 🏛 Visit on the 137 profile popup, links `#fid=FID-XXXXXX`.
- Followed houses card: the lanista name per row + the Find/Follow-by-FID box. Room seats: the lanista name under the gladiator, hover =
  "Lanista X · FID-…" (`lanista.names`, cached); ✉ Invite by FID row in a waiting room.
