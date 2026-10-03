# Online v0.80 plan — the Praeco (quick chat + matchmaking), built TOGETHER with ROOMS

Status: agreed with Virgilante 2026-10-03, NOT built. Wait for his "go". One batch with the ROOMS spec (CLAUDE.md §8),
one server redeploy (protocol VER 4, server-8, AUTH_DOMAIN=none until the custom-domain swap).

## His decisions
- NO free text anywhere online. The v0.79 room text box is replaced by phrases. Nothing to filter or report.
- Phrases (codes, never text from the client):
  - room before the horns: Ave! · ✓ Ready (also marks ready) · ⏳ 2 min · ▶ Sound the horns? · ⇄ Swap teams? · 🪑 One more seat? · Good luck · Vale
  - after the match: Well fought · ⚔ Again? · Vale
  - DURING the match (yes, a short set): Truce? · Well struck! · Mercy! · Ha! — a bubble over the gladiator; never game state
    (not a lockstep input: no seq, no hash; its own route match.say → toMatch push), muted lanistas' bubbles hidden.
  - one phrase per 3 s per lanista (store.rate on ACCT, not per-container memory, not CONN).
- Names shown in calls, invites, phrases: the ACTIVE GLADIATOR's name, never the Google account name.
- NO horn: nothing listens while you play offline; calls/invites reach you only while the Online window is open
  (drop the netIdleClose wrapper, ping keepalive and #onlHorn chip from the notes below).
- Moderation = 🔇 Mute (server drops their phrases, calls, invites) + 🔕 Quiet (no banners) + the existing strike split.
  Drop forum.say / free Forum line / report / hush / flavius.sh reports from the notes below.
- The landing feed keeps only structured lines: 📣 calls and results (k:cry/res), no say lines. FMETER guards cries only.

## Fixes bundled (found by the design panel, verified in code)
- AWS hello sends no online count → the landing shows 0 (world.news returns online:0; the mock fakes +37).
- Twin games: 112's 'quick' searches the client's stale ONL.lobbies → server-side lobby.quick (= the ROOMS playlist rule).
- Room chat waste: each line rewrites the whole LOBBY item (+ its GSI1 copy, projection ALL) and every lobby.update makes
  every member's ONL_SUB re-read lobby.list; onlChatSend also calls lobby.list. → chat lines in their own CHAT# items,
  pushes carry the line / the lobby, clients upsert, no lobby.list storm.
- hello/lobby.list return full lobbies (chat, kits, looks): breaks the 128 KB WebSocket frame past ~12 lobbies → liteRow.

## Cost (panel estimate, with the old DynamoDB prices — real ones are about half)
~$0.10/month at 10 players (less than today's room chat); ~$5–8/month at 200 concurrent.

## Design-panel engineering notes (free-text Forum and horn parts are OVERRIDDEN above)

BASE = the Praeco design. Grafts: the Forum's sibling-panel mount + line-in-push idea, Ad Arma's chips-as-codes, conditional rate updates, FMETER and notify-only horn, Again/Iterum. DROPPED: auto-seating answers / standing CALL records (unsafe: socket held open while the player is offline → canStart counts them as connected, 116 auto-enter needs #onl, M.away is set only in $disconnect → stalled Ranked match ending in a Fate); porticoes/shards, busiest hours, recently-here, @-autocomplete, automatic 3-report hush (a third of the population at early-access size); per-container in-memory rate maps (Lambda containers don't share memory); CONN-item rate fields (they reset on every reconnect).

PROTOCOL: ONLC.VER 3 → 4. Deploy server-8 (CloudShell deploy.sh, AUTH_DOMAIN=none until the custom-domain swap) BEFORE page + version.json. Copy 111 with node tools/mkserver.js.

SHARED RULES (src/111-onlcore.js):
- CRY={max:3,gap:120000,fan:40}, INVITE={gap:4000,same:120000,hour:15}, FORUM={gap:10000,slowGap:15000,slowAt:12,keep:30,lineLen:200,meterDay:100000}.
- liteRow(L) = strip(L) minus chat/kits/bets/seed/looks; players→{id,name,rank,team,ready}; lite:1 (~400 B).
- quickPick(list,group,ev,ranked,hereSet): moved out of 112's 'quick' handler (112 line ~259), so the mock and the Lambda agree. Skips the other strike flag, lobbies with no room for the group (seatGroup on a clone), and hosts not in hereSet. Prefers more humans, then the oldest.
- QUICK chip table {code:{params whitelist, scope:'room'|'forum'}} + quickOK(q,p). cleanForum(t) = cleanChat + links/e-mails→[link] + zero-width/bidi stripped + 4+ repeats squashed.
- Under ROOMS: quickPick = the playlist rule (free seat → sit; otherwise the room is not a hit). Cries go out only while a seat is open; Take a seat = lobby.join (sit if free, else stand, per ROOMS).

STORE (server/src/store.js, memory + dynamo):
- query(pk,prefix,{limit,desc}) via ScanIndexForward/Limit.
- clearConn(acct,conn): UpdateCommand SET conn=null, offAt=:t REMOVE GSI1PK,GSI1SK, condition conn=:c.
- rate(pk,sk,field,gapMs): SET #f=:now with condition attribute_not_exists(#f) OR #f<:cut, returns false when limited. Used on ACCT#<acct>/PROFILE (per account, survives reconnects, 1 WRU, targeted SET, so it is never a full put).

PRESENCE (no new table or index):
- ACCT PROFILE gets GSI1PK='ON', GSI1SK=connect-ms. Set in index.js $connect (line ~16, the existing a.conn=conn put) and in the auth.signin branch.
- $disconnect (line ~18) and the push()/pushConn Gone branch call clearConn instead of the full put.
- Readers ignore entries with GSI1SK older than 2 h 5 min (API Gateway's connection cap).
- Known race: routes' read-modify-write ACCT puts can re-add a stale conn, same as today; the conditional clear limits the damage.
- hello (when it already calls liveChar) writes A.here={rank,cls,glad} only when changed, via a targeted SET. Fan-out then filters by rank and the strike flag without CHAR reads.
- routes.js here() = byIndex('ON'), cached 20 s in Lambda memory.
- hello returns online:{n,free,list≤40}; world.news online = here().length (today it is 0). free = no A.match and not seated in a waiting lobby (from the LOBBIES list hello already loads).

ROUTES (all mirrored in MOCK_ROUTES):
- lobby.quick {ev,ranked}: groupOf refactored to return its LOBBIES scan → C.quickPick. A hit runs seatGroup+putLobby+toLobby (as lobby.join). A miss runs the lobby.create path + cry. Returns {lobby,made}. 112's data-onl="quick" is routed here by a window-capture handler that runs after 116's ONL_NEEDS_GLAD guard.
- lobby.create: cry unless d.cry===false; L.cry=[now] set before putLobby.
- lobby.call {id}: caller seated, status waiting, seat open, L.cry.length<CRY.max, gap ≥120 s. Errors: 'Every seat is taken.' / 'The crier has called three times.' / 'The crier needs a breath — N s.' Returns {left}.
- cry(L,by) fans out over here() with pushConn 'forum.cry' {row:liteRow(L),by,at}. Filters: has conn, ≠by, no A.match, not in L.players/L.stands, (strikes≥STRIKES_OUT)===!!L.flag, Ranked → A.here.rank===L.rank, recipient's mutes ∌ by. Newest CRY.fan, Promise.all in batches of 10, Gone → clearConn. Never use push(acct) here: it reads ACCT per recipient and sends one at a time.
- lobby.invite {id,to}: the target must be in here() ('Not in the arena now.'), no T.match ('Fighting right now.'), not already in L, same flag, Ranked same rank, T.mutes ∌ me. Limits via store.rate on ACCT (ivAt 4 s, iv_<to> 2 min, hourly counter ≤15). One pushConn 'lobby.invite' {row,from,fromId}.
- who.list: here() + a 10 s cached LOBBIES read → ≤40 {id,name,rank,cls,st:free|room|fight}; called only when the Invite popup opens.
- lobby.again {lobbyId}: create with the same ev/loc/ranked (cry:false) + invite each other human from the settled match; canJoin refuses dead Ranked gladiators.
- CHAT MOVES OUT OF THE LOBBY ITEM: lobby.chat writes LOBBY#id / CHAT#<ts13>#<acct> {by,name,text|q,p,at,ttl:+1 day}; rate is ACCT chatAt at 1 s via store.rate. Then toLobby(L,'lobby.update',{id,line}); returns {line}. Chips {q,p} pass quickOK; the ✓ Ready chip also calls lobby.ready. lobby.chatlog {id} (members only) = query(...,'CHAT#',{limit:CHAT_KEEP,desc:true}) reversed. newLobby keeps chat:[] unused.
- Lobby pushes carry state: join/leave/ready push {id,lobby:strip(L)} to members (≤8, one message each under 32 KB). Clients upsert it, so there is no lobby.list storm.
- Same batch, 128 KB fix: hello and lobby.list return liteRow for every lobby except your own (strip() today keeps chat and kits; the list breaks past ~12 full lobbies).
- Forum line: FORUM | L#<ts13>#<acct4> {k:say|chip|cry|res,by,name,text|q,p,at,ttl:+1 day}. forum.say needs a gladiator with ≥1 finished bout, no A.hush, rate fAt 10 s (15 s when here()≥FORUM.slowAt). Fan-out to here() minus fighters, quiet accounts and muters. forum.get = query('FORUM','L#',{limit:30,desc:true}); also inlined in hello{all}.
- Cries and settle results also write a FORUM line (k:cry/res) so the feed has memory.
- WORLD|FMETER via store.counter per pushed line; above meterDay, say lines are stored but not pushed (pulled on forum.get) and a banner reads 'The Forum is hoarse until dawn'. Cries, invites and quick are always pushed.
- forum.mute {who,on} → ACCT.mutes (≤50, targeted SET).
- forum.quiet {on} → ACCT.quiet.
- forum.report {line} → REPORT#<acct> | <ts>#<by> (ttl 30 d). No auto-hush.
- server/flavius.sh gains `reports`, `hush <name> <hours>`, `unhush <name>` (sets A.hush).
- ping → {} (horn keepalive).

CLIENT: new module src/117-onl80.js, inserted in build.sh after 116-onl79 and before 08-setup. Header comment. Wrappers only, except two small edits noted below.
- ONLF={here,lines,cries,last,quiet,muted}.
- localStorage (try/catch): flavius_onlquiet80, flavius_onlmute80 (mirror of the server list), flavius_onlhorn80.
- Mount: #onlForum <aside> as a SIBLING of #onl inside #mBody, inserted by an onlineOpen wrapper (outside 114's) with a short poll like 116's #onlLoad watcher. Shown on the play/lobby tabs (synced after onlRedraw). Reason: onlRedraw (112 line ~152) replaces #onl.innerHTML on every update, which would wipe a panel inside it.
- 116's ONL_NEEDS_GLAD capture selector is '#onl [data-onl]', so add a twin listener for '#onlForum [data-onl]'. Add cry/invite/cryjoin/say/again to the set.
- NET.emit wrapper: lobby.update with {line} appends to ONL.chat[id] and redraws only the log; with {lobby} it upserts ONL.lobbies and redraws. Both return WITHOUT running ONL_SUB (112 line ~155: lobby.list on every push). Other pushes fall through.
- onlChatSend (116 line ~121) replaced: no lobby.list after sending.
- onlMyLobbyHTML wrapper: chip row before .onl-chatrow; 📣 Call (left/cooldown from L.cry; hidden when full) and ✉ Invite in .acts; the log is drawn from ONL.chat filled by lobby.chatlog once per room.
- Room news (sat/left/ready) is derived locally by diffing the old and new L.players: tagged .sys, no server cost.
- forum.cry handler: drop it if the caller is muted, !ONLC.canJoin(row,me), S.onl&&!S.over, or you are seated. Otherwise upsert the row and add it to ONLF.cries (≤6, 3-minute expiry). The #onlCry banner shows for 15 s unless Quiet or an .ask76bg is open.
- lobby.invite handler: ask76 only when no .ask76bg exists (ask76 removes an open one WITHOUT resolving, which would orphan onlNeedGlad's prompt); otherwise queue it as a feed line or badge. The 🔇 Mute link in the body needs a window CAPTURE listener, because ask76's backdrop stops propagation.
- Horn (opt-in): a netIdleClose wrapper (114 line ~49) keeps the socket while flavius_onlhorn80 is on AND you are not seated in a waiting room. Leaving Online while seated → lobby.leave first, so nobody absent can be seated or started.
- Horn timers: a 9-minute 'ping' interval; the #onlHorn chip is kept in sync by a 500 ms sweep like onlBarSync, hidden under body.onlarena and while #onl is up. Click → onlineOpen('play') through the screen manager. It never opens ask76 or modal() over an offline event; it only pulses with sfx.
- gameOver/onlReport wrapper stores ONL.lastTable (other humans' ids and names) → Invite lists it first, and the ⚔ Again button calls lobby.again.
- Small edit in 112: the mock hello/world.news '+37' becomes the real count; the empire card's online number reads ONLF.here.n.
- Mock: MOCK_ROUTES gains lobby.quick/call/invite/again, who.list, lobby.chatlog, forum.get/say/mute/quiet/report, ping. w.chats[id] and w.forum.lines ≤60. Presence: mockReq stamps w.accounts[me].seen + a 20 s ping while #onl is up; online = seen <60 s. Cries go through mockPush with a skip list, each window filtering by mockMe(). Seeded bot hosts never post lines.
- No Math.random in game logic; no code words. Never modal() over the Online window.

TESTS:
- server/test/routes.test.js:
  - presence on/off through makeHandler $connect/$disconnect, with the conditional clear not clobbering a newer conn;
  - quickPick never makes twins and keeps parties together;
  - cry filters (members, fighters, flag, rank, mutes) and the fan cap;
  - call limits 3/120 s/full;
  - invite refusals and store.rate;
  - chat writes one CHAT# item, the push carries the line, chatlog returns the last 40;
  - liteRow under 1 KB; hello under 128 KB with 30 full lobbies;
  - forum.say gates, slow mode and FMETER hoarse;
  - no auto-hush.
- tools/tests/tonl80.js (mock, windows A/B/C):
  - A presses a Ranked playlist → room + cry; idle B sees the banner → Take a seat; A shows 'Beta sat down';
  - B taps ✓ Ready with zero lobby.list (spy on NET.req);
  - C invited → popup → Mute → the second invite is dropped; Quiet stops the banner;
  - 📣 stops at 3;
  - Forum line typed half-way survives an onlRedraw;
  - ⚔ Again invites;
  - horn chip outside Online.
  - ERRS [].
- tonlws80: cry, invite and forum.say through the real handler (test/localws.js).
- Update tonl79 (it reads L.chat → chatlog) and tonl78 selectors if the markup moves.
- Release: full suite via tools/release.sh; MILESTONES entry; no SAVE_MIGRATIONS (no world data change); review the new shared writes (none client-side; all server).
## Orbis Terrarum — the online map (agreed 2026-10-03, same batch)
- A world map in the style of his empire map (assets/map.jpg: tan parchment land, orange halftone coast band, blue sea with darker
  halftone shallows, black ink outline), darkened/sepia to blend into the Online landing under the Playlists, edges faded into the
  window colour. Heading like the Playlists one: "Orbis Terrarum  N lanistas online · M fighting · K waiting". Soft ember glows per
  region, size by count; gentle breathing (off with calm / reduce motion). NO interaction (aria-hidden, pointer-events none), no names.
- Location = the browser's time zone (Intl…resolvedOptions().timeZone) sent in hello; stored on the presence entry (cleared with it);
  hello/world.news return only aggregates {n,fight,wait,zones:{tz:count}}. Client maps tz → lat/lon with a built-in table from the
  public-domain tz database (zone1970.tab coordinates, ~8 KB); unknown zones still count, no dot. Small cosmetic jitter (Math.random).
- Refresh with hello / the landing's existing refresh, at most once a minute while the Play tab is up. Cost ≈ $0.05/month at 10
  players, $1–1.50 at 200.
- Art: tools/plans/orbis/proj.js (world-atlas land-50m, ISC; Natural Earth public domain; lat 76…-52, equirectangular) +
  render.py (numpy + cv2) → ship as assets/orbis.webp (~90 KB at 1200 wide). mock.css/mock.js = the preview injected into the landing.
- Privacy page (website, not git): add one line — the time-zone region shown as an anonymous dot while you are online.
