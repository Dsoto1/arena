# v0.80 Online — the build contract (rooms · quick chat · the Praeco · Forum · Orbis Terrarum · online rules)

Owner decisions: tools/plans/onl80-praeco.md (quick chat, Praeco, map) and CLAUDE.md §8 "Online ROOMS — agreed spec" and
"Online — agreed for the next online batch". This file is the interface every builder codes against. Protocol **VER 4**
(already set in src/111-onlcore.js). Shared rules live in **src/111-onlcore.js (ONLC)** — already written; use them, never
re-implement them (server and mock must call the same ONLC functions so they agree).

## 0. Ground rules (all builders)
- One global script; modules concatenated by build.sh (`sh build.sh` must print SYNTAX_OK). Wrap, don't edit old modules, except
  small edits where wrapping is impossible. Never code after `//` on a line (use `/* */`). Never call seeded rand()/pickOne()/rnd()
  from UI code (Math.random is fine in UI). Never modal() over the Online window — use small centred popups (ask76-style).
  Never put cheat/code words in plain text. In-game wording short, Roman flavour.
- Names shown online = the ACTIVE GLADIATOR's name (fallback: account name). Never show Google account names for others.
- No free text anywhere online. `lobby.chat` is gone; phrases are codes (ONLC.QC / ONLC.QC_TEXT / ONLC.phraseOK).
- Cost: push only what changed, to whom it concerns. Never make every client re-read lobby.list on a push.

## 1. ONLC (src/111-onlcore.js) — available now
Constants: VER=4, ROOM_MAX=8, KICK_MS, TEAM_KEYS A..H, EV_SEATS {democritus/egidious/cassian:[4,4], familia:[4,8]}, QC, QC_TEXT, RATE
{say:3000, forum:10000, cryMax:3, cryGap:120000, invGap:4000, invSame:120000, invHour:15, fanCap:40, meterDay:100000}.
Room fields (L = LOBBY item): id, host{id,name,char}, ev, team(bool), teams(2..8), autoBal, loc, ranked, rank, seats, players[] (SEATED,
index = match seat; {id,name,char,rank,kit,ready,sat,team?,party?}), members[] (everyone in the room, join order;
{id,name,char,rank,kit,at,party?}), kicked{acct:until}, cry[] (call times), stands[], watchers, tickets, pot, ticket, abandon,
standsOff, status waiting|live|done, created, seed, flag, started, unseated[] (set at the horns), closed.
Functions (pure; return '' or a player-facing reason; mutate L):
- newLobby(spec,host,id,now) — defaults: democritus, Roma (6), 4 seats; spec.ranked fixed for life.
- canJoin(L,who,now) · roomJoin(L,whos,now) (members; a group sits together if seats for all, else all stand) · seatGroup = roomJoin
- roomSit(L,who,now) · roomStand(L,who) (host can't) · roomLeave(L,who,now) → {closed} (host → earliest joiner, who sits)
- roomGiveHost(L,by,to,now) (unseated new host takes the old host's seat; old host stands) · roomKick(L,by,who,now) (5-min block)
- roomSet(L,by,d,now) — d: ev, loc, seats, ticket, abandon, standsOff, teams, autoBal; fewer seats → last to sit stand up; ready reset
- roomTeam(L,by,who,team) (Custom: self or host; Ranked refused) · autoBalance(L) · seatTeams(L) · strengthOf(p)
- canStart(L,who,conn) (host, ≥2 humans seated, connected; team events need 2 teams unless auto-balance) · startRoom(L) → unseated ids
- quickPick(list,group,ev,ranked,flag,now) → room or null (fullest, then oldest; whole group must fit)
- liteRow(L) (no kits/looks/chat/bets/seed) · phraseOK(scope,q) scopes room|after|match|forum · cleanTz(tz) · hereSummary(here,rooms)
After editing 111, the server copy is refreshed with `node tools/mkserver.js` (server/src/onlcore.js + catalog.json).

## 2. Server (server/src) + the mock (MOCK_ROUTES) — the SAME requests and answers
Group (`groupOf` / `mockGroup`): entries {id, name: active gladiator's name || account name, char, rank, kit, party, strikes}.
A party: only the leader acts; the whole party joins/sits together.

### Presence (server)
- $connect: ACCT PROFILE gets conn + `GSI1PK:'ON'`, `GSI1SK:<ms>`. $disconnect and a Gone push: `store.clearConn(acct,conn,now)` =
  conditional update (only if conn matches): conn=null, offAt=now, REMOVE GSI1PK, GSI1SK. Memory store: same semantics.
- `here()` = byIndex('ON') where conn set and GSI1SK within 2 h 05 min; may cache ~20 s in prod (makeRoutes option; tests use 0).
- hello {all, tz}: stores A.here={glad, rank, tz:cleanTz(tz)} (write only when changed). Returns as today plus
  `here:{n,fight,wait,zones}` (ONLC.hereSummary over here() + the lobby list), `online:n`, `forum:[last 30 lines]`,
  `lobbies`: liteRow for every room except the caller's own room (full). world.news online = n.
- store.rate(pk,sk,field,gapMs,now) → true if allowed (conditional SET field=now when absent or older than now-gap). Used on the
  caller's ACCT PROFILE: sayAt (3 s), fAt (10 s), ivAt (4 s), iv_<to> (2 min); hourly invite counter ivH {h,n} ≤ 15.

### Rooms
| request | does | answer | pushes |
|---|---|---|---|
| lobby.create {ranked, ev?, loc?, seats?, ticket?, abandon?, standsOff?, cry?} | newLobby + roomJoin(group); flag from strikes; a Praeco 'open' line unless cry===false | full room | members: lobby.update{id,lobby}; forum.line 'open' to free lanistas who fit |
| lobby.join {id} | roomJoin(group) | full room | members: lobby.update{id,lobby} |
| lobby.sit {id} / lobby.stand {id} | roomSit / roomStand | full room | lobby.update |
| lobby.leave {id} | stands: ticket refund (as today); member: roomLeave; closed → bets/tickets refunded (as today) | full room | lobby.update (closed when empty) |
| lobby.host {id,to} | roomGiveHost | full room | lobby.update |
| lobby.kick {id,who} | roomKick | full room | lobby.update to members; to the removed: lobby.update{id,kicked:1} |
| lobby.set {id,...} | roomSet (fields above) | full room | lobby.update |
| lobby.team {id,who,team} | roomTeam | full room | lobby.update |
| lobby.ready {id,ready} | as today, plus ready reset rules | full room | lobby.update |
| lobby.start {id} | canStart(conn) → startRoom → as today (MATCH META etc.) | full room | members: lobby.update{id,lobby}; the unseated: lobby.update{id,started:1,unseated:1} |
| lobby.quick {ev,ranked} | quickPick over waiting rooms (server-side: no twin rooms) → roomJoin; miss → lobby.create path + 'open' line | {lobby, made} | as join/create |
| lobby.call {id} | 📣 member of a waiting room with a free seat; ≤ RATE.cryMax per room, RATE.cryGap apart | {left} | forum.line 'call' to free lanistas who fit |
| lobby.invite {id,to} | caller in the room; target in here(), not fighting, not a member, not muting caller, same flag, Ranked same rank; rates | {} | to target: lobby.invite{row:liteRow(L),from:<name>,fromId} |
| lobby.again {id} | after a match the caller fought in: a new room, same ev/loc/ranked/seats (no 'open' line), invites the other humans of that match (same rules) | {lobby, invited} | invites |
| lobby.say {id,q} | member or ticket holder; phraseOK('room',q); RATE.say; 'ready' also sets ready; stored as CHAT#<ts13>#<acct> under LOBBY#id (ttl 1 day) | {line} | members+stands: lobby.say{id,line:{by,name,q,at}} |
| lobby.chatlog {id} | members/stands: last 40 lines | [lines] | — |
| lobby.list | liteRow rows (own room full) | rows | — |
| who.list | here() minus me: ≤40 {id,name,rank,st:'free'\|'room'\|'fight'} | rows | — |

"Free lanistas who fit" (fan-out of 'open'/'call'): in here(), not the caller, not a member of that room, not fighting (A.match),
same strike flag, Ranked → A.here.rank === L.rank, not muting the caller; newest RATE.fanCap by connect time; pushConn in batches.

### Forum (the landing's 📯 panel)
- FORUM item: PK 'FORUM', SK 'L#<ts13>#<acct4>' {k, by?, name?, q?, row?, need?, ev?, loc?, win?, cf?, void?, at, ttl:+1 day}.
  k = 'say' (a lanista's phrase) | 'open' (a room opened: row) | 'call' (📣: row + need = free seats) | 'res' (a match settled:
  ev, loc, win:[gladiator names], cf: the winner's CF, void).
- forum.get → last 30 lines (newest last). forum.say {q}: needs a gladiator; phraseOK('forum',q); RATE.forum; pushes forum.line to
  everyone in here() who is not fighting and not muting the speaker. FMETER: WORLD|FMETER counter per UTC day; above RATE.meterDay
  pushes stop (lines are still stored and shown on forum.get).
- settleMatch writes a 'res' line (and pushes it to free lanistas). forum.mute {who,on} → A.mutes (≤50); muted senders' phrases,
  calls and invites are never pushed to you. 🔕 Quiet is client-only (localStorage flavius_onlquiet80): no banners/popups.

### Matches
- match.say {id,q}: fighters + ticket holders (inMatch); phraseOK('match',q) while live, phraseOK('after',q) when done (≤10 min);
  RATE.say; toMatch push match.say{id,seat,q,by} (not to the sender). Never an input; never touches game state.
- match.hashq {id,seq} → push match.hashq{id,seq,from} to the other live humans (fighters + ticket holders, not dropped/abandoned).
- match.hasha {id,seq,to,h} → push match.hasha{id,seq,from,seat,h} to `to`.
- match.odd {id,seat} → a vote that seat's lanista is out of step with the majority; strike once per match when
  floor(n/2)+1 distinct voters agree (n = live humans ≥ 3).
- lobby.chat is removed (throws 'Quick chat only.').

## 3. Client modules (load order 117 → 118 → 119, all before 08-setup)
- **117-onltz.js** (art): `ONL_TZ` {zone:[lat,lon]} from tzdata zone1970.tab (+ common aliases), `onlTzLL(tz)` → [lat,lon]|null.
- **assets/orbis.webp** (art): the world map in the empire-map style, equirectangular, lat 76 … -52, 2400×853 rendered → ship ~1600 wide
  webp ≤ 200 KB; generator in tools/art/orbis/ (proj.js, render.py, README). Map x = (lon+180)/360, y = (76-lat)/128.
- **118-onl80.js** (client + mock): MOCK_ROUTES for everything in §2 except match.hashq/hasha/odd; mockGroup names; mock presence
  (accounts[me].seen + tz; online = seen < 60 s; seeded bot hosts count as present); the lobby.update fix (upsert the pushed room,
  no lobby.list refetch); the room screen; Lobby Browser rooms + "＋ Ranked room" / "＋ Custom room"; playlists → lobby.quick;
  landing row: Orbis Terrarum oval (gold border, ends cropped, click → large view) + 📯 The Forum (feed + phrase chips + 👥 N here →
  who list: ✉ Invite / ⚔ Join / 👁 Watch / 🔇 Mute + 🔕 Quiet); 📣 call banner; invite popup (queued; never over another popup);
  'started without you' greyed room with a 10 s countdown + 👁 Watch; in-match 💬 phrases in the online bar + bubbles over the
  gladiator; after the match: Well fought · ⚔ Again? · Vale + ⚔ Again (lobby.again). Reference look: tools/plans/orbis/mock2.*.
- **119-onl80rules.js** (rules): printed gear only online (no custom chest weapons / roster-set gear / custom anything enters an
  online match; restore after); online results never write offline records (Annals/Hall, achievements, crowd memory, music unlocks,
  wallets of offline modes); Ranked: hints, strategy panel, Focus suggestions, win odds off (Custom keeps them); no pause online;
  MAJORITY RESYNC (client) + its mock routes (match.hashq/hasha/odd).

## 4. Tests
- server/test/routes.test.js (npm test in server/): every route above, presence connect/disconnect (conditional clear), no twin rooms,
  limits, liteRow size, forum meter, odd votes. Keep the old assertions working or update them where the rules changed.
- tools/tests/tonl80.js (mock, 3 windows): rooms flow, quick chat, Forum, call banner, invite, started-without-you, Again, map zones.
- tools/tests/tonl80r.js (mock, 3 windows): majority resync (tamper one client), printed gear, Ranked hints off, no pause, no records.
- Update tonl77/78/79 where the API changed (lobby.chat → lobby.say; classics always 4 seats). Add new tests to tools/runreg.sh DEFAULT.
