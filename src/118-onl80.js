/* =====================================================================
   118-ONL80 · ONLINE v0.80: rooms, quick chat, the Praeco, the Forum, Orbis Terrarum (client + mock)
   =====================================================================
   • ROOMS (shared rules in 111 ONLC): a lobby is a room of up to 8 lanistas; the event's seats sit, the rest stand. Made with
     no setup (＋ Ranked room / ＋ Custom room, or a playlist → lobby.quick, which never makes a twin room). The host changes
     event, city, seats, teams, auto-balance, rules and ticket until the horns; 👑 Give host, ✕ Remove (5 min), team moves.
     ✓ Ready, ▶ Start (disabled with the reason), Leave, 📣 Call (3 a room), ✉ Invite (who.list).
   • QUICK CHAT: phrases only (ONLC.QC codes) — room chips (lobby.say + the room's log from lobby.chatlog), the Forum chips
     (forum.say), in a match the 💬 button in the online bar (match.say → a bubble over the gladiator), after the match
     Well fought · ⚔ Again? · Vale and ⚔ Again (lobby.again: a new room, the others invited).
   • THE PRAECO + FORUM (landing, under the Playlists): LEFT Orbis Terrarum — a gold oval map (assets/orbis.webp) with ember
     glows per time zone (hello.here.zones → onlTzLL, 117), click → the large view; RIGHT 📯 The Forum — opened rooms, 📣 calls
     with ⚔ Take a seat, results, lanistas' phrases; 👥 N here → who list (✉ Invite / ⚔ Join / 👁 Watch / 🔇 Mute); 🔕 Quiet
     (localStorage flavius_onlquiet80: no banners or popups). A 📣 banner (15 s) and an invite popup (queued, never over
     another popup) reach you only while the Online window is open and you are free.
   • PUSHES carry state: lobby.update {id,lobby} is upserted into ONL.lobbies — no lobby.list re-read on a push (112's ONL_SUB
     re-read it on every push). {id,kicked}, {id,started,unseated} (the greyed room, 10 s back to Online + 👁 Watch), {id,closed}.
   • MOCK: MOCK_ROUTES mirror the server (server/src/routes.js) for every v0.80 route except match.hashq/hasha/odd (119);
     targeted pushes (mockTo: only the named accounts' windows react); presence = accounts[me].seen (+ tz) stamped on every
     request and a 20 s ping while the Online window is open; online = seen < 60 s; the seeded bot hosts count as present.
   ===================================================================== */
const ONLF={here:{n:0,fight:0,wait:0,zones:{}},lines:[],local:[],jit:{},chat:{},chatFor:{},invq:[],helloAt:0,muted:new Set()};
const onlQuiet80=()=>{try{return localStorage.getItem('flavius_onlquiet80')==='1'}catch(e){return false}};
(function(){try{const m=JSON.parse(localStorage.getItem('flavius_onlmute80')||'[]');if(Array.isArray(m))for(const x of m)ONLF.muted.add(x)}catch(e){}})();
function onlMuteSave80(){try{localStorage.setItem('flavius_onlmute80',JSON.stringify([...ONLF.muted].slice(-50)))}catch(e){}}

/* =========================== THE MOCK SERVER (v0.80 routes) =========================== */
const MOCK_TZ80=['Europe/Rome','America/New_York','Asia/Tokyo','Europe/London','America/Sao_Paulo','Australia/Sydney'];
let MOCK_OUT=[];
/* a push for some accounts only (the server sends to their connections; here every window hears it and keeps its own) */
function mockTo(ids,t,d){ids=[...new Set((ids||[]).filter(x=>x&&!/^bot/.test(x)))];if(ids.length)MOCK_OUT.push({ids,t,d})}
function mockFlush80(q){for(const p of q){const me=mockMe();if(me&&p.ids.includes(me))setTimeout(()=>NET.emit(p.t,JSON.parse(JSON.stringify(p.d))),0);
  try{MOCK_BC&&MOCK_BC.postMessage({t:p.t,d:p.d,to:p.ids})}catch(e){}}}
if(MOCK_BC)MOCK_BC.onmessage=e=>{const m=e.data||{};if(!m||!m.t)return;if(m.to&&!m.to.includes(mockMe()))return;NET.emit(m.t,m.d)};
/* old mock worlds: members, bot time zones, the Forum */
function mock80Fix(w){w.forum=w.forum||[];w.chats=w.chats||{};
  MOCK_TZ80.forEach((z,i)=>{const a=w.accounts['bot'+i];if(a&&!a.tz)a.tz=z});
  for(const L of Object.values(w.lobbies)){if(!Array.isArray(L.members))L.members=(L.players||[]).map(p=>({id:p.id,name:p.name,char:p.char||null,rank:p.rank||'tiro',kit:p.kit||null,at:L.created||0}));
    if(!L.cry)L.cry=[];if(!L.kicked)L.kicked={};if(L.teams==null)L.teams=2}}
const mockNow=()=>Date.now();
function mockName80(w,id){const ch=onlMockChar(w,id);const a=w.accounts[id];return (ch&&ch.name)||(a&&a.name)||'A lanista'}
function mockFighting80(w,id){return Object.values(w.lobbies).some(L=>{if(L.status!=='live'||!L.players.some(p=>p.id===id))return false;const M=w.matches[L.id];return !(M&&((M.abandoned||{})[id]||(M.dropped||{})[id]))})}
function mockRoomOf80(w,id){return Object.values(w.lobbies).find(L=>L.status==='waiting'&&(L.members||[]).some(m=>m.id===id))||null}
function mockHere80(w){const now=mockNow();return Object.values(w.accounts).filter(a=>a.bot||(a.seen&&now-a.seen<60000)).map(a=>({id:a.id,tz:a.tz||'',match:mockFighting80(w,a.id),seen:a.bot?0:a.seen,bot:!!a.bot}))}
function mockFlag80(w,id){return ((w.accounts[id]||{}).strikes||0)>=ONLC.STRIKES_OUT}
function mockRate80(a,f,gap,now){if(a[f]&&now-a[f]<gap)return false;a[f]=now;return true}
/* who sees a room's lines and updates: its members and its ticket holders */
const mockAud80=L=>(L.members||[]).map(m=>m.id).concat((L.stands||[]).map(s=>s.id));
function mockRoomOut80(w,L){return JSON.parse(JSON.stringify(L))}
function mockUpd80(w,L,extra){if(L.status==='done')mockTo(mockAud80(L),'lobby.update',{id:L.id,closed:L.closed||'done'});else mockTo(mockAud80(L),'lobby.update',{id:L.id,lobby:mockRoomOut80(w,L),...(extra||{})})}
/* the room list: lite rows, your own room whole */
function mockList80(w,me){for(const L of Object.values(w.lobbies))if(L.status==='waiting'&&!L.mock&&mockNow()-(L.created||0)>3*3600e3)mockClose(w,L,'old');
  const f=mockFlag80(w,me);return Object.values(w.lobbies).filter(L=>L.status!=='done'&&!!L.flag===f).sort((a,b)=>b.created-a.created)
    .map(L=>(L.members||[]).some(m=>m.id===me)||(L.players||[]).some(p=>p.id===me)||(L.stands||[]).some(s=>s.id===me)?mockRoomOut80(w,L):ONLC.liteRow(L))}
/* the lanista and their party as room members: the active gladiator's name; one room at a time */
mockGroup=function(w,me){const a=w.accounts[me];if(!a)throw new Error('Sign in first.');const P=a.party&&w.parties&&w.parties[a.party];if(P&&P.leader!==me)throw new Error('Your party leader picks the game.');
  const out=(P?P.members:[me]).map(m=>{const ch=onlMockChar(w,m);return {id:m,name:mockName80(w,m),char:ch&&ch.id,rank:ch?ONLC.rankFor(ch).k:'tiro',kit:ONLC.kitOf(ch),party:P?P.id:undefined,strikes:(w.accounts[m]||{}).strikes||0}});
  for(const x of out)if(mockRoomOf80(w,x.id))throw new Error(out.length>1?'Someone in your party is already in a room.':'You are already in a room.');return out};
mockBusy=function(w,me){return Object.values(w.lobbies).find(L=>(L.status==='waiting'&&(L.members||[]).some(m=>m.id===me))||(L.status==='live'&&L.players.some(p=>p.id===me)))||null};
/* the Forum: a line is stored (≤60) and pushed to the free lanistas it concerns */
function mockLine80(w,line){line.at=line.at||mockNow();w.forum.push(line);if(w.forum.length>60)w.forum=w.forum.slice(-60);return line}
function mockFree80(w,by,L){const here=mockHere80(w).filter(h=>!h.bot&&h.id!==by&&!h.match);const fl=L?!!L.flag:mockFlag80(w,by);
  return here.filter(h=>{const A=w.accounts[h.id];if((A.mutes||[]).includes(by))return false;if(mockFlag80(w,h.id)!==fl)return false;
    if(L){if((L.members||[]).some(m=>m.id===h.id)||(L.stands||[]).some(s=>s.id===h.id))return false;if(mockRoomOf80(w,h.id))return false;
      if(L.ranked){const ch=onlMockChar(w,h.id);if(!ch||ONLC.rankFor(ch).k!==L.rank)return false}}return true}).sort((a,b)=>(b.seen||0)-(a.seen||0)).slice(0,ONLC.RATE.fanCap).map(h=>h.id)}
function mockCry80(w,L,by,k){const line=mockLine80(w,{k,by,name:mockName80(w,by),row:ONLC.liteRow(L),need:Math.max(0,L.seats-L.players.length),ev:L.ev,loc:L.loc});mockTo(mockFree80(w,by,L),'forum.line',{line});return line}
/* an invite under the rules (rates unless soft); '' or the reason */
function mockInvite80(w,me,L,to,soft){const A=w.accounts[me],T=w.accounts[to];const now=mockNow();if(!T||to===me)return 'No such lanista.';
  const here=mockHere80(w).find(h=>h.id===to&&!h.bot);if(!here)return 'Not in the arena now.';if(here.match)return 'Fighting right now.';
  if((L.members||[]).some(m=>m.id===to))return 'Already in the room.';if(mockFlag80(w,to)!==!!L.flag)return 'Not in the arena now.';
  if(L.ranked){const ch=onlMockChar(w,to);if(!ch||ONLC.rankFor(ch).k!==L.rank)return `Ranked: ${(ONLC.RANKS[ONLC.rankIdx(L.rank)]||{}).n} only.`}
  if(!soft){if(!mockRate80(A,'ivAt',ONLC.RATE.invGap,now))return 'One invite at a time.';if(A['iv_'+to]&&now-A['iv_'+to]<ONLC.RATE.invSame)return 'You invited them a moment ago.'}
  const hr=Math.floor(now/3600e3);A.ivH=A.ivH&&A.ivH.h===hr?A.ivH:{h:hr,n:0};if(A.ivH.n>=ONLC.RATE.invHour)return 'Enough invites for this hour.';
  A['iv_'+to]=now;A.ivH.n++;if((T.mutes||[]).includes(me))return '';mockTo([to],'lobby.invite',{row:ONLC.liteRow(L),from:mockName80(w,me),fromId:me});return ''}
const mockLobby80=(w,id)=>{const L=w.lobbies[id];if(!L)throw new Error('That room is gone.');return L};
const mockMember80=(L,me)=>{if(!(L.members||[]).some(m=>m.id===me))throw new Error('You are not in that room.')};
function mockCreate80(w,d,me,cry){const g=mockGroup(w,me);const m=g.find(x=>x.id===me)||g[0];if(d.ranked&&!m.char)throw new Error('Ranked needs a living gladiator.');const now=mockNow();
  const L=ONLC.newLobby(d,{id:me,name:m.name,char:m.char,rank:m.rank},'L'+(w.seq++),now);if(g.some(x=>x.strikes>=ONLC.STRIKES_OUT))L.flag=1;
  const why=ONLC.roomJoin(L,g,now);if(why)throw new Error(why);L.ping=12;w.lobbies[L.id]=L;if(cry){L.cry=[now];mockCry80(w,L,me,'open')}mockUpd80(w,L);return L}
Object.assign(MOCK_ROUTES,{
  'ping':()=>({}),
  'hello':((base)=>(w,d,me)=>{const a=me&&w.accounts[me];if(a&&d.tz!=null){const z=ONLC.cleanTz(d.tz);if(z)a.tz=z}const o=base(w,d,me);
    if(d.all&&a){o.lobbies=mockList80(w,me);const here=mockHere80(w);o.here=ONLC.hereSummary(here,Object.values(w.lobbies));o.online=here.length;o.forum=w.forum.slice(-30)}return o})(MOCK_ROUTES['hello']),
  'world.news':(w)=>{const here=mockHere80(w);return {news:w.news.slice(0,8),online:here.length,here:ONLC.hereSummary(here,Object.values(w.lobbies)),challenges:ONLC.weekChallenges(mockNow())}},
  'lobby.list':(w,d,me)=>mockList80(w,me),
  'lobby.chat':()=>{throw new Error('Quick chat only.')},
  'lobby.create':(w,d,me)=>mockRoomOut80(w,mockCreate80(w,d,me,d.cry!==false)),
  'lobby.join':(w,d,me)=>{const L=mockLobby80(w,d.id);const g=mockGroup(w,me);if(!!L.flag!==g.some(x=>x.strikes>=ONLC.STRIKES_OUT))throw new Error('That room is gone.');
    const why=ONLC.roomJoin(L,g,mockNow());if(why)throw new Error(why);mockUpd80(w,L);return mockRoomOut80(w,L)},
  'lobby.sit':(w,d,me)=>{const L=mockLobby80(w,d.id);const why=ONLC.roomSit(L,me,mockNow());if(why)throw new Error(why);mockUpd80(w,L);return mockRoomOut80(w,L)},
  'lobby.stand':(w,d,me)=>{const L=mockLobby80(w,d.id);mockMember80(L,me);const why=ONLC.roomStand(L,me);if(why)throw new Error(why);mockUpd80(w,L);return mockRoomOut80(w,L)},
  'lobby.leave':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)return {};const t=(L.stands||[]).find(s=>s.id===me);
    if(t&&L.status==='waiting'){L.stands=L.stands.filter(s=>s!==t);L.tickets=L.stands.length;L.pot=Math.max(0,(L.pot|0)-(t.paid|0));const ch=onlMockChar(w,me);if(ch)ch.wallet+=t.paid|0;mockUpd80(w,L);return mockRoomOut80(w,L)}
    if(L.status!=='waiting'||!(L.members||[]).some(m=>m.id===me))return mockRoomOut80(w,L);const aud=mockAud80(L);const r=ONLC.roomLeave(L,me,mockNow());
    if(r.closed){mockClose(w,L,'empty');mockTo(aud,'lobby.update',{id:L.id,closed:'empty'})}else mockUpd80(w,L);return mockRoomOut80(w,L)},
  'lobby.host':(w,d,me)=>{const L=mockLobby80(w,d.id);const why=ONLC.roomGiveHost(L,me,d.to,mockNow());if(why)throw new Error(why);mockUpd80(w,L);return mockRoomOut80(w,L)},
  'lobby.kick':(w,d,me)=>{const L=mockLobby80(w,d.id);const why=ONLC.roomKick(L,me,d.who,mockNow());if(why)throw new Error(why);mockUpd80(w,L);mockTo([d.who],'lobby.update',{id:L.id,kicked:1});return mockRoomOut80(w,L)},
  'lobby.set':(w,d,me)=>{const L=mockLobby80(w,d.id);const x={};for(const k of ['ev','loc','seats','ticket','abandon','standsOff','teams','autoBal'])if(d[k]!=null)x[k]=d[k];
    const why=ONLC.roomSet(L,me,x,mockNow());if(why)throw new Error(why);mockUpd80(w,L);return mockRoomOut80(w,L)},
  'lobby.team':(w,d,me)=>{const L=mockLobby80(w,d.id);const why=ONLC.roomTeam(L,me,d.who,d.team);if(why)throw new Error(why);mockUpd80(w,L);return mockRoomOut80(w,L)},
  'lobby.ready':(w,d,me)=>{const L=mockLobby80(w,d.id);if(L.status!=='waiting')throw new Error('Already under way.');const p=L.players.find(p=>p.id===me);if(p)p.ready=!!d.ready;mockUpd80(w,L);return mockRoomOut80(w,L)},
  'lobby.start':(w,d,me)=>{const L=mockLobby80(w,d.id);const conn={};const here=new Set(mockHere80(w).map(h=>h.id));for(const p of ONLC.humansOf(L))conn[p.id]=here.has(p.id);
    const why=ONLC.canStart(L,me,conn);if(why)throw new Error(why);const out=ONLC.startRoom(L);
    L.status='live';L.seed=(Math.random()*2**31)>>>0;L.started=mockNow();w.matches[L.id]={id:L.id,seed:L.seed,inputs:[],results:{},open:null,watch:{},abandoned:{},abandon:ONLC.abandonRule(L),standsOff:!!L.standsOff};
    mockUpd80(w,L);mockTo(out,'lobby.update',{id:L.id,started:1,unseated:1});return mockRoomOut80(w,L)},
  'lobby.quick':(w,d,me)=>{const g=mockGroup(w,me);const now=mockNow();const flag=g.some(x=>x.strikes>=ONLC.STRIKES_OUT);const ev=ONLC.EVENTS_ALL.includes(d.ev)?d.ev:'democritus';
    const L=ONLC.quickPick(Object.values(w.lobbies).filter(x=>!x.mock),g,ev,!!d.ranked,flag,now);
    if(L){const why=ONLC.roomJoin(L,g,now);if(why)throw new Error(why);mockUpd80(w,L);return {lobby:mockRoomOut80(w,L),made:false}}
    return {lobby:mockRoomOut80(w,mockCreate80(w,{ev,ranked:!!d.ranked},me,true)),made:true}},
  'lobby.call':(w,d,me)=>{const L=mockLobby80(w,d.id);mockMember80(L,me);if(L.status!=='waiting')throw new Error('Already under way.');if(L.players.length>=L.seats)throw new Error('Every seat is taken.');
    L.cry=L.cry||[];const now=mockNow();if(L.cry.length>=ONLC.RATE.cryMax)throw new Error('The crier has called three times.');const last=L.cry[L.cry.length-1]||0;
    if(now-last<ONLC.RATE.cryGap)throw new Error(`The crier needs a breath — ${Math.ceil((ONLC.RATE.cryGap-(now-last))/1000)} s.`);
    L.cry.push(now);mockCry80(w,L,me,'call');mockUpd80(w,L);return {left:ONLC.RATE.cryMax-L.cry.length}},
  'lobby.invite':(w,d,me)=>{const L=mockLobby80(w,d.id);mockMember80(L,me);if(L.status!=='waiting')throw new Error('Already under way.');const why=mockInvite80(w,me,L,d.to,false);if(why)throw new Error(why);return {}},
  'lobby.again':(w,d,me)=>{const O=mockLobby80(w,d.id);if(!O.players.some(p=>p.id===me)||O.status==='waiting')throw new Error('Fight in that match first.');
    const L=mockCreate80(w,{ev:O.ev,loc:O.loc,ranked:!!O.ranked,seats:O.seats,abandon:O.abandon,standsOff:O.standsOff,ticket:O.ticket},me,false);
    const invited=[];for(const p of O.players){if(/^bot/.test(p.id)||p.id===me)continue;if(!mockInvite80(w,me,L,p.id,true))invited.push(p.id)}return {lobby:mockRoomOut80(w,L),invited}},
  'lobby.say':(w,d,me)=>{const L=mockLobby80(w,d.id);const A=w.accounts[me];if(!mockAud80(L).includes(me))throw new Error('You are not in that room.');if(!ONLC.phraseOK('room',d.q))throw new Error('Quick chat only.');
    if(!mockRate80(A,'sayAt',ONLC.RATE.say,mockNow()))throw new Error('One phrase every 3 seconds.');const line={by:me,name:mockName80(w,me),q:d.q,at:mockNow()};
    const c=w.chats[L.id]=(w.chats[L.id]||[]);c.push(line);if(c.length>ONLC.CHAT_KEEP)c.splice(0,c.length-ONLC.CHAT_KEEP);
    mockTo(mockAud80(L).filter(x=>x!==me&&!((w.accounts[x]||{}).mutes||[]).includes(me)),'lobby.say',{id:L.id,line});
    if(d.q==='ready'&&L.status==='waiting'){const p=L.players.find(p=>p.id===me);if(p&&!p.ready){p.ready=true;mockUpd80(w,L)}}return {line}},
  'lobby.chatlog':(w,d,me)=>{const L=mockLobby80(w,d.id);if(!mockAud80(L).includes(me))throw new Error('You are not in that room.');return (w.chats[L.id]||[]).slice(-ONLC.CHAT_KEEP)},
  'who.list':(w,d,me)=>mockHere80(w).filter(h=>!h.bot&&h.id!==me).sort((a,b)=>(b.seen||0)-(a.seen||0)).slice(0,40).map(h=>{const ch=onlMockChar(w,h.id);
    return {id:h.id,name:mockName80(w,h.id),rank:ch?ONLC.rankFor(ch).k:'tiro',st:h.match?'fight':mockRoomOf80(w,h.id)?'room':'free'}}),
  'forum.get':(w)=>w.forum.slice(-30),
  'forum.say':(w,d,me)=>{if(!onlMockChar(w,me))throw new Error('Make a gladiator first.');if(!ONLC.phraseOK('forum',d.q))throw new Error('Quick chat only.');const A=w.accounts[me];const now=mockNow();
    if(A.fAt&&now-A.fAt<ONLC.RATE.forum)throw new Error(`The Forum heard you — ${Math.ceil((ONLC.RATE.forum-(now-A.fAt))/1000)} s.`);A.fAt=now;
    const line=mockLine80(w,{k:'say',by:me,name:mockName80(w,me),q:d.q});const day=Math.floor(now/864e5);w.fmeter=w.fmeter&&w.fmeter.d===day?w.fmeter:{d:day,n:0};
    if(w.fmeter.n<ONLC.RATE.meterDay){const to=mockHere80(w).filter(h=>!h.bot&&h.id!==me&&!h.match&&!((w.accounts[h.id]||{}).mutes||[]).includes(me)).map(h=>h.id);w.fmeter.n+=to.length;mockTo(to,'forum.line',{line})}return {line}},
  'forum.mute':(w,d,me)=>{const A=w.accounts[me];const m=new Set(A.mutes||[]);if(d.on)m.add(d.who);else m.delete(d.who);A.mutes=[...m].slice(-50);return {mutes:A.mutes}},
  'match.say':(w,d,me)=>{const L=mockLobby80(w,d.id);const M=w.matches[d.id];const seat=mockSeat(L,me);if(!M||seat<0)throw new Error('Not your match.');
    /* the closing phrases also pass while the others are still reporting the result (the bout ended on this screen first) */
    const done=L.status!=='live';if(!(ONLC.phraseOK('after',d.q)||!done&&ONLC.phraseOK('match',d.q)))throw new Error('Quick chat only.');if(done&&mockNow()-(M.doneAt||L.started||0)>600000)throw new Error('That match is long over.');
    if(!mockRate80(w.accounts[me],'sayAt',ONLC.RATE.say,mockNow()))throw new Error('One phrase every 3 seconds.');
    const to=L.players.map(p=>p.id).concat((L.stands||[]).map(s=>s.id),Object.keys(M.watch||{})).filter(x=>x!==me&&!((w.accounts[x]||{}).mutes||[]).includes(me));
    mockTo(to,'match.say',{id:L.id,seat,q:d.q,by:me});return {seat}}});
/* the old routes push the room they changed (no more lobby.list storms) */
for(const k of ['lobby.ticket','bet.place','lobby.watch','match.watch','match.abandon']){const base=MOCK_ROUTES[k];MOCK_ROUTES[k]=(w,d,me)=>{const r=base(w,d,me);const L=w.lobbies[d.id];
  /* a ticket holder is shown by the active gladiator's name too */
  if(k==='lobby.ticket'&&L){const t=(L.stands||[]).find(s=>s.id===me);if(t)t.name=mockName80(w,me);if(r&&r.lobby)r.lobby=mockRoomOut80(w,L)}
  if(L&&L.status!=='done')mockUpd80(w,L);return r}}
/* a party shows its members by their gladiators' names (never the account's) */
for(const k of ['party.create','party.join']){const base=MOCK_ROUTES[k];MOCK_ROUTES[k]=(w,d,me)=>{const P=base(w,d,me);if(P&&P.names)for(const id of P.members||[])if(P.names[id]!=null)P.names[id]=mockName80(w,id);return P}}
/* a settled match: a 'res' line in the Forum (the winners' names, the winner's CF), the room's update to its fighters */
{const base=MOCK_ROUTES['match.result'];MOCK_ROUTES['match.result']=(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];const was=M&&M.status;const r=base(w,d,me);
  if(L&&M&&M.status==='done'&&was!=='done'){M.doneAt=mockNow();const A=ONLC.agree(M.reports||{});const rows=(A.table||[]).filter(x=>x.won);
    const win=rows.map(x=>{const p=L.players[x.seat];return p?((p.kit&&p.kit.name)||p.name):'a CPU'});
    const line=mockLine80(w,{k:'res',ev:L.ev,loc:L.loc,win,cf:rows.length?Math.max(...rows.map(x=>x.f|0)):0,void:!!A.void});
    mockTo(mockHere80(w).filter(h=>!h.bot&&!h.match).map(h=>h.id),'forum.line',{line});mockTo(L.players.map(p=>p.id),'lobby.update',{id:L.id,lobby:mockRoomOut80(w,L)})}return r}}
/* a room closed for good: its people hear it (not the whole world) */
mockClose=function(w,L,why){const M=w.matches[L.id];if(M)M.status='done';const st=ONLC.settle(L.bets||[],[],{tix:(L.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),void:true});
  for(const [by,v] of Object.entries(st.payouts)){const c=onlMockChar(w,by);if(c)c.wallet+=v}L.status='done';L.closed=why;L.bets=[];L.pool=0;L.pot=0;
  mockTo(mockAud80(L).concat(L.players.map(p=>p.id)),'lobby.update',{id:L.id,closed:why})};
/* every request stamps presence; pushes leave after the world is saved (a window reading on a push sees the change) */
mockReq=async function(t,d){const R=MOCK_ROUTES[t];if(!R)throw new Error('Unknown request: '+t);await new Promise(r=>setTimeout(r,30+Math.random()*60));d=d||{};
  const w=mockLoad();mockSeedWorld(w);mock80Fix(w);const me=mockMe();if(me&&w.accounts[me])w.accounts[me].seen=mockNow();
  MOCK_OUT=[];let out;try{out=R(w,d,me)}catch(e){MOCK_OUT=[];throw e}mockSave(w);const q=MOCK_OUT;MOCK_OUT=[];mockFlush80(q);
  return JSON.parse(JSON.stringify(out===undefined?{}:out))};

/* =========================== THE CLIENT =========================== */
const onlTz80=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){return ''}};
const onlQ80=q=>ONLC.QC_TEXT[q]||'…';
const onlToast80=m=>{if(typeof mToast==='function')mToast(m)};
/* hello carries the browser's time zone; hello / world.news bring the presence counts and the Forum */
{const base=NET.req;NET.req=function(t,d){if(t==='hello')d={...(d||{}),tz:onlTz80()};const p=base.call(this,t,d);
  if(t==='hello'||t==='world.news')Promise.resolve(p).then(r=>{if(!r)return;if(r.here)ONLF.here=r.here;else if(r.online!=null)ONLF.here={...ONLF.here,n:r.online};if(Array.isArray(r.forum))ONLF.lines=r.forum.slice(-60);ONLF.helloAt=Date.now()}).catch(()=>{});return p}}
/* 112 re-read lobby.list on every push; the push now carries the room — never subscribe that */
ONL_SUB=()=>{};
ONL.unseated80=null;ONL.kicked80={};
const onlMe80=()=>ONL.acct&&ONL.acct.id;
/* your room: a member (seated or standing) or a ticket holder */
onlMyLobby=function(){const me=onlMe80();return (ONL.lobbies||[]).find(x=>x.status!=='done'&&((x.members||[]).some(m=>m.id===me)||x.players.some(p=>p.id===me)||(x.stands||[]).some(t=>t.id===me)))||null};
onlBusy=function(){const me=onlMe80();return (ONL.lobbies||[]).find(L=>(L.status==='waiting'&&(L.members||[]).some(m=>m.id===me))||(L.status==='live'&&L.players.some(p=>p.id===me)))||null};
const onlWaitRoom80=()=>{const L=onlMyLobby();return L&&L.status==='waiting'&&(L.members||[]).some(m=>m.id===onlMe80())?L:null};
const onlInMatch80=()=>!!(S&&S.onl&&!S.over);
/* the room's news, worked out here from the old and new copies (no server cost) */
function onlRoomNews80(o,L){const me=onlMe80();if(!o||!Array.isArray(o.members)||!Array.isArray(L.members)||L.status!=='waiting')return;
  const out=[];const nm=x=>x.id===me?'You':esc2(x.name);const om=new Set(o.members.map(m=>m.id)),nmS=new Set(L.members.map(m=>m.id));const op=new Map(o.players.map(p=>[p.id,p])),np=new Map(L.players.map(p=>[p.id,p]));
  for(const m of L.members)if(!om.has(m.id))out.push(`${nm(m)} entered the room`);for(const m of o.members)if(!nmS.has(m.id))out.push(`${nm(m)} ${(L.kicked||{})[m.id]&&!(o.kicked||{})[m.id]?'was removed':'left'}`);
  if(o.host.id!==L.host.id)out.push(`👑 ${L.host.id===me?'You host':esc2(L.host.name)+' hosts'} the room`);
  for(const p of L.players)if(om.has(p.id)&&!op.has(p.id))out.push(`${nm(p)} sat down`);for(const p of o.players)if(nmS.has(p.id)&&!np.has(p.id))out.push(`${nm(p)} stood up`);
  for(const p of L.players){const q=op.get(p.id);if(q&&p.ready&&!q.ready)out.push(`${nm(p)} ${p.id===me?'are':'is'} ready`);if(q&&p.team&&q.team&&p.team!==q.team)out.push(`${nm(p)} → Team ${esc2(p.team)}`)}
  if(o.ev!==L.ev||o.seats!==L.seats)out.push(`The game is now ${esc2(onlEvName(L.ev))} · ${L.seats|0} seats`);if(o.loc!==L.loc)out.push(`The games move to ${esc2(onlCityName(L.loc))}`);
  const c=ONLF.chat[L.id]=(ONLF.chat[L.id]||[]);for(const t of out)c.push({sys:1,text:t,at:Date.now()});if(c.length>60)c.splice(0,c.length-60)}
function onlUpsert80(L){if(!L||!L.id)return;ONL.lobbies=ONL.lobbies||[];const i=ONL.lobbies.findIndex(x=>x.id===L.id);const o=i>=0?ONL.lobbies[i]:null;
  if(L.status==='done'){if(i>=0)ONL.lobbies.splice(i,1);return}if(o&&o.status==='waiting'&&(o.members||[]).some(m=>m.id===onlMe80()))onlRoomNews80(o,L);
  if(i>=0)ONL.lobbies[i]=L;else ONL.lobbies.unshift(L)}
const onlUp80=()=>{if(document.getElementById('onl'))onlRedraw()};
NET.on('lobby.update',d=>{if(!d||!d.id||!ONL.acct)return;const me=onlMe80();ONL.lobbies=ONL.lobbies||[];const i=ONL.lobbies.findIndex(x=>x.id===d.id);const o=i>=0?ONL.lobbies[i]:null;
  if(d.lobby){onlUpsert80(d.lobby);onlUp80();return}
  if(d.kicked){if(i>=0)ONL.lobbies.splice(i,1);ONL.kicked80[d.id]=Date.now()+ONLC.KICK_MS;onlToast80('✕ The host removed you from the room.');onlUp80();return}
  if(d.started&&d.unseated){if(o){ONL.lobbies[i]={...o,status:'live',members:(o.members||[]).filter(m=>m.id!==me)};ONL.unseated80={L:o,id:d.id,until:Date.now()+10000};onlCountdown80()}onlUp80();return}
  if(d.closed){if(i>=0){ONL.lobbies.splice(i,1);if(o.status==='waiting'&&(o.members||[]).some(m=>m.id===me)&&d.closed!=='empty')onlToast80('🚪 The room closed.')}onlUp80()}});
/* 'started without you': a greyed room for 10 s, then back to Online (👁 Watch meanwhile) */
let ONL_CD80=0;
function onlCountdown80(){clearInterval(ONL_CD80);ONL_CD80=setInterval(()=>{const U=ONL.unseated80;if(!U){clearInterval(ONL_CD80);return}const left=Math.ceil((U.until-Date.now())/1000);
  const el=document.getElementById('r80cd');if(el)el.textContent=Math.max(0,left);if(left<=0){ONL.unseated80=null;clearInterval(ONL_CD80);onlUp80()}},250)}

/* ---------------- the room screen ---------------- */
const onlTeamChip80=t=>t?`<i class="onl-team t${esc2(t)}">${esc2(t)}</i>`:'';
function onlRoomLog80(L){const me=onlMe80();const c=(ONLF.chat[L.id]||[]).filter(l=>l.sys||!ONLF.muted.has(l.by)).slice(-40);
  return c.map(l=>l.sys?`<div class="sys">· ${l.text}</div>`:`<div><b>${l.by===me?'You':esc2(l.name)}</b> ${esc2(onlQ80(l.q))}</div>`).join('')||'<div class="rc-sub">Say ave to the room.</div>'}
function onlRoomHTML80(L,grey){const me=onlMe80();const host=L.host.id===me;const member=(L.members||[]).some(m=>m.id===me);const seated=L.players.some(p=>p.id===me);const fan=!member&&(L.stands||[]).some(t=>t.id===me);
  const tm=ONLC.seatTeams(L);const keys=L.team?ONLC.teamKeys(L):[];const free=L.players.length<L.seats;const custTeams=L.team&&!L.ranked;
  const ctl=id=>host&&id!==me&&!grey?`<span class="r80-ctl"><button type="button" class="btn tksm" data-onl="rhost" data-v="${esc2(id)}" title="Give the room to them">👑</button><button type="button" class="btn tksm" data-onl="rkick" data-v="${esc2(id)}" title="Remove from the room (5 minutes)">✕</button></span>`:'';
  const seat=i=>{const p=L.players[i];if(!p)return `<div class="r80-seat empty"><span class="onl-rq">🪑</span><div class="r80-who"><b>Open seat</b><small>a CPU if empty${tm?` · ${onlTeamChip80(tm[i])}`:''}</small></div>${member&&!seated&&!grey?`<button type="button" class="btn tksm primary" data-onl="rsit" data-v="${L.id}">🪑 Sit</button>`:''}</div>`;
    const k=p.kit;const t=tm&&tm[i];
    const move=custTeams&&!grey&&!L.autoBal&&(host||p.id===me)?`<span class="r80-tm">${keys.map(x=>`<button type="button" class="r80-tb ${x===t?'on':''}" data-onl="rteam" data-v="${esc2(p.id)}|${x}" title="Team ${x}">${x}</button>`).join('')}</span>`:'';
    return `<div class="r80-seat on ${p.id===me?'me':''}">${k?onlFig(k.cls,k.look,54):'<span class="onl-rq">?</span>'}<div class="r80-who">${onlTeamChip80(t)}<b>${esc2(p.id===me?'You':p.name)}</b>${p.id===L.host.id?' <span title="Host">👑</span>':''}${p.ready?' <span class="onl-rdy">✓</span>':''}
      <small>${k?esc2((CLASSES[k.cls]||{}).name||'')+' · ':''}${onlRankChip(p.rank)}</small>${move}</div>${ctl(p.id)}</div>`};
  const standing=(L.members||[]).filter(m=>!L.players.some(p=>p.id===m.id));
  const stand=standing.length?`<div class="r80-stand"><b>Standing</b>${standing.map(m=>`<span class="r80-sm ${m.id===me?'me':''}">${esc2(m.id===me?'You':m.name)} ${onlRankChip(m.rank)}${m.id===L.host.id?' 👑':''}${ctl(m.id)}</span>`).join('')}</div>`:'';
  const opt=(v,l,cur)=>`<option value="${v}" ${String(cur)===String(v)?'selected':''}>${esc2(l)}</option>`;const [lo,hi]=ONLC.seatRange(L.ev);const rule=ONLC.abandonRule(L);
  const set=host&&!grey?`<div class="r80-set"><label>Event<select class="tin" data-onlrs="ev">${ONLC.EVENTS_ALL.map(k=>opt(k,onlEvName(k)+(ONLC.EVENTS_TEAM.includes(k)?' · teams':''),L.ev)).join('')}</select></label>
     <label>City<select class="tin" data-onlrs="loc">${LOCATIONS.map((x,i)=>x?opt(i,x.n,L.loc):'').join('')}</select></label>
     <label>Seats<select class="tin" data-onlrs="seats" ${lo===hi?'disabled title="Classic events seat four"':''}>${Array.from({length:hi-lo+1},(_,j)=>opt(lo+j,lo+j,L.seats)).join('')}</select></label>
     ${L.team?`<label>Teams<select class="tin" data-onlrs="teams">${Array.from({length:Math.max(1,Math.min(8,L.seats)-1)},(_,j)=>opt(j+2,j+2,L.teams||2)).join('')}</select></label>`:''}
     ${custTeams?`<label class="chk"><input type="checkbox" data-onlrs="autoBal" ${L.autoBal?'checked':''}> ⚖ Auto-balance</label>`:''}
     ${!L.ranked?`<label>Leaving<select class="tin" data-onlrs="abandon">${opt('cpu','a CPU fights on',rule)}${opt('fate','eliminated',rule)}</select></label>`:''}
     <label>Stands<select class="tin" data-onlrs="standsOff">${opt(0,'act in round 1',L.standsOff?1:0)}${opt(1,'watch only',L.standsOff?1:0)}</select></label>
     <label>Ticket<select class="tin" data-onlrs="ticket" ${L.standsOff?'disabled':''}>${[0,2,5,10,20].map(n=>opt(n,n?n+' coin':'none',L.ticket|0)).join('')}</select></label></div>`
   :`<div class="r80-rules rc-sub">Leaving: ${L.ranked?'Damnatio':rule==='fate'?'eliminated':'a CPU fights on'} · Stands: ${L.standsOff?'watch only':'act in round 1'} · Ticket: ${L.ticket?(L.ticket|0)+' coin':'none'}${L.team?` · ${L.teams||2} teams${L.ranked||L.autoBal?' (balanced at the horns)':''}`:''}</div>`;
  const why=host?ONLC.canStart(L,me):'';const me0=L.players.find(p=>p.id===me);const cries=Math.max(0,ONLC.RATE.cryMax-(L.cry||[]).length);
  const go=grey||fan?'':`${host?`<button type="button" class="btn primary" data-onl="start" data-v="${L.id}" ${why?`disabled title="${esc2(why)}"`:''}>▶ Start</button>`:seated?`<button type="button" class="btn ${me0&&me0.ready?'':'primary'}" data-onl="rready" data-v="${me0&&me0.ready?0:1}">${me0&&me0.ready?'✓ Ready — undo':'✓ Ready'}</button><button type="button" class="btn" data-onl="rstand" data-v="${L.id}">Stand up</button>`:''}
     <button type="button" class="btn" data-onl="rcall" data-v="${L.id}" ${!free||!cries?`disabled title="${!free?'Every seat is taken.':'The crier has called three times.'}"`:'title="The crier calls free lanistas to your room"'}>📣 Call <small>${cries} left</small></button>
     <button type="button" class="btn" data-onl="rinvite" data-v="${L.id}">✉ Invite</button>`;
  const leave=grey?'':`<button type="button" class="btn" data-onl="leave" data-v="${L.id}">${fan?'Give back the ticket':'Leave'}</button>`;
  const chips=grey?'':ONLC.QC.room.map(q=>`<button type="button" data-onl="rsay" data-v="${q}">${esc2(onlQ80(q))}</button>`).join('');
  return `<div class="card2 onl-room80 ${grey?'grey':''}" id="onlRoom80" data-room="${L.id}"><div class="r80-head">${typeof cardHTML==='function'?`<div class="r80-ev">${cardHTML('e:'+L.ev,'sm')}</div>`:''}
     <div class="r80-ttl"><h3>${fan?'🎟 ':''}${esc2(onlEvName(L.ev))} <small>at ${esc2(onlCityName(L.loc))}</small></h3>
      <div class="r80-tags">${L.ranked?`<span class="badge gold">⚔ Ranked</span> ${onlRankChip(L.rank)}`:'<span class="badge">Custom</span>'}${L.team?`<span class="badge">👥 ${L.teams||2} teams</span>`:''}<span class="badge">🪑 ${L.players.length}/${L.seats} seated</span><span class="badge">👤 ${(L.members||[]).length}/${ONLC.ROOM_MAX} in the room</span>${(L.stands||[]).length?`<span class="badge">🎟 ${L.stands.length}</span>`:''}</div></div>
     <div class="r80-lv">${leave}</div></div>
   <div class="r80-body"><div class="r80-main"><div class="r80-seats">${Array.from({length:L.seats},(_,i)=>seat(i)).join('')}</div>${stand}${set}
     ${host&&why&&!grey?`<p class="onl-busy">⏳ ${esc2(why)}</p>`:''}<div class="acts r80-go">${go}</div></div>
    <div class="r80-talk"><div class="r80-log" id="r80Log">${onlRoomLog80(L)}</div><div class="ofor-chips">${chips}</div></div></div>
   ${grey?`<div class="r80-over"><b>The horns sounded without you.</b><span>Back to Online in <b id="r80cd">${Math.max(0,Math.ceil(((ONL.unseated80||{}).until-Date.now())/1000)||0)}</b> s</span><div class="acts"><button type="button" class="btn primary" data-onl="uwatch" data-v="${L.id}">👁 Watch</button><button type="button" class="btn" data-onl="uback">Back now</button></div></div>`:''}</div>`}
const ONL_ROOM79=onlMyLobbyHTML;
/* the room at the top of Play and the Lobby Browser; a live room keeps the v0.79 card (Rejoin / Watch / Take your seat) */
function onlRoomTop80(){const U=ONL.unseated80;if(U&&Date.now()<U.until)return onlRoomHTML80(U.L,true);const L=onlMyLobby();if(!L)return '';return L.status==='waiting'?onlRoomHTML80(L,false):ONL_ROOM79()}
onlMyLobbyHTML=function(){return ONL._play80?onlLandingHTML80():onlRoomTop80()};
{const base=onlPlayHTML;onlPlayHTML=function(){ONL._play80=1;let h;try{h=base.apply(this,arguments)}finally{ONL._play80=0}
  return onlRoomTop80()+h.replace('👥 Team · 2 v 2','👥 Teams · 4–8 seats')}}
/* the Lobby Browser: rooms, made in one click */
onlLobbyHTML=function(){const me=onlMe80();const rows=ONL.lobbies||[];const st=L=>L.status==='waiting'?'<span class="badge gold">Waiting</span>':'<span class="badge">In progress</span>';
  return `<div class="onl-lbtop"><h3>📜 Lobby Browser <span class="rc-sub">${rows.length} room${rows.length===1?'':'s'}</span></h3><div class="acts"><button type="button" class="btn" data-onl="refresh">↻ Refresh</button><button type="button" class="btn primary" data-onl="mkroom" data-v="1">＋ Ranked room</button><button type="button" class="btn" data-onl="mkroom" data-v="0">＋ Custom room</button></div></div>
   ${ONL.betting?onlBetHTML():''}${onlRoomTop80()}
   <table class="tally onl-lb"><tr><th>Host</th><th>Event</th><th>City</th><th>Lanistas</th><th>Seated</th><th>Rank</th><th>Status</th><th></th></tr>${rows.map(L=>{const mine=(L.members||[]).some(m=>m.id===me)||L.players.some(p=>p.id===me)||(L.stands||[]).some(t=>t.id===me);const kicked=ONL.kicked80[L.id]&&Date.now()<ONL.kicked80[L.id];
     return `<tr class="${mine?'mine':''}" data-row="${L.id}"><td><b>${esc2(L.host.name)}</b></td><td>${esc2(onlEvName(L.ev))}${L.team?` <span class="badge">👥 ${L.teams||2} teams</span>`:''}</td><td>${esc2(onlCityName(L.loc))}</td><td>${(L.members||L.players).length}/${ONLC.ROOM_MAX}</td><td>${L.players.length}/${L.seats}${(L.stands||[]).length?` <small class="rc-sub">🎟${L.stands.length}</small>`:''}</td><td>${L.ranked?onlRankChip(L.rank):'<span class="rc-sub">Custom · any</span>'}</td><td>${st(L)}</td>
      <td class="acts">${L.status==='waiting'&&!mine&&!kicked?`<button type="button" class="btn tksm primary" data-onl="join" data-v="${L.id}">${L.players.length<L.seats?'Join':'Join · stand'}</button>`:''}${L.status==='waiting'?`<button type="button" class="btn tksm" data-onl="bet" data-v="${L.id}" title="Wager from your wallet">🎲${L.pool?' '+L.pool:''}</button>`:''}${L.status==='live'?(L.players.some(p=>p.id===me)&&!(ONL.leftMatch||{})[L.id]?`<button type="button" class="btn tksm primary" data-onl="rejoin" data-v="${L.id}" title="Back to your match">⚔ Rejoin</button>`:`<button type="button" class="btn tksm" data-onl="watch" data-v="${L.id}" title="Watch for free">👁</button>`):''}${L.ticket&&L.status==='waiting'&&!mine?`<button type="button" class="btn tksm" data-onl="ticket" data-v="${L.id}" title="A seat in the stands until the horns. The coin goes into the wager pot.">🎟 ${L.ticket}</button>`:''}</td></tr>`}).join('')||'<tr><td colspan="8" class="rc-sub">No rooms open. Open one.</td></tr>'}</table>`};

/* ---------------- the landing row: Orbis Terrarum + the Forum ---------------- */
function onlCap80(){const H=ONLF.here||{};const n=H.n|0;return `<b>${n}</b> lanista${n===1?'':'s'} online · ${H.fight|0} fighting · ${H.wait|0} waiting`}
function onlDots80(k){const z=(ONLF.here||{}).zones||{};return Object.entries(z).map(([tz,c])=>{const ll=typeof onlTzLL==='function'?onlTzLL(tz):null;if(!ll)return '';
  const j=ONLF.jit[tz]||(ONLF.jit[tz]=[Math.random()-.5,Math.random()-.5,Math.random()*4]);const x=(ll[1]+180)/360*100+j[0]*.6,y=(76-ll[0])/128*100+j[1]*1.2;const s=(10+Math.sqrt(c|0)*9)*k;
  return `<i class="omap-dot" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;animation-delay:${j[2].toFixed(1)}s"></i>`}).join('')}
function onlOrbisHTML80(){return `<div class="ow-h">Orbis Terrarum<small id="omapCap">${onlCap80()}</small></div><div class="omap" data-onl="omap" role="button" tabindex="0" title="Open the map"><div class="omap-in"></div><div class="omap-dots" aria-hidden="true">${onlDots80(1)}</div></div>`}
function onlCanTake80(id,at){const R=onlMyLobby();if(R&&R.status==='waiting')return false;const L=(ONL.lobbies||[]).find(x=>x.id===id);return L?(L.status==='waiting'&&L.players.length<L.seats):Date.now()-(at||0)<30000}
function onlRowTxt80(r){if(!r)return '';return `${esc2(onlEvName(r.ev))} · ${r.ranked?'Ranked':'Custom'} · ${esc2(onlCityName(r.loc))}`}
function onlFeedHTML80(){const me=onlMe80();const L=[...(ONLF.lines||[]),...ONLF.local].filter(l=>!(l.by&&ONLF.muted.has(l.by))).sort((a,b)=>(a.at||0)-(b.at||0)).slice(-40);
  if(!L.length)return '<div class="rc-sub">The Forum is quiet. Say ave.</div>';
  return L.map(l=>{const who=l.by===me?'You':esc2(l.name||'A lanista');const r=l.row||{};const take=r.id&&l.by!==me&&onlCanTake80(r.id,l.at)?`<button type="button" class="take" data-onl="take" data-v="${esc2(r.id)}">⚔ Take a seat</button>`:'';
    if(l.k==='say')return `<div><span class="who">${who}:</span> ${esc2(onlQ80(l.q))}</div>`;
    if(l.k==='open')return `<div class="pr">📯 <b>${who}</b> opened ${onlRowTxt80(r)} — ${l.need|0} seat${l.need===1?'':'s'} free${take}</div>`;
    if(l.k==='call')return `<div class="pr">📣 <b>${who}</b> calls for ${l.need|0} more · ${onlRowTxt80(r)}${take}</div>`;
    if(l.k==='inv')return `<div class="pr">✉ <b>${esc2(l.from||'A lanista')}</b> invited you · ${onlRowTxt80(r)}${take}</div>`;
    if(l.k==='res')return l.void?`<div class="res">⚖ ${esc2(onlEvName(l.ev))} at ${esc2(onlCityName(l.loc))} — void, no result</div>`:`<div class="res">🏆 ${esc2((l.win||[]).join(' & ')||'Nobody')} won ${esc2(onlEvName(l.ev))} at ${esc2(onlCityName(l.loc))}${l.cf?` — ${l.cf|0} CF`:''}</div>`;
    return ''}).join('')}
function onlLandingHTML80(){const q=onlQuiet80();
  return `<div class="ow-row" id="onlRow80"><div class="ow-col ow-map">${onlOrbisHTML80()}</div>
   <div class="ow-col"><div class="ow-h">📯 The Forum<small>quick calls</small><span class="f80-ctl"><button type="button" class="btn tksm" data-onl="who" title="Who is here">👥 ${(ONLF.here||{}).n|0} here</button><button type="button" class="btn tksm ${q?'on':''}" data-onl="quiet" title="${q?'Quiet: no banners or invite pop-ups':'Banners and invites pop up'}">${q?'🔕 Quiet':'🔔'}</button></span></div>
    <div class="ofor"><div class="ofor-feed" id="onlFeed80">${onlFeedHTML80()}</div><div class="ofor-chips">${ONLC.QC.forum.map(x=>`<button type="button" data-onl="fsay" data-v="${x}">${esc2(onlQ80(x))}</button>`).join('')}</div></div></div></div>`}
/* small patches instead of a whole redraw */
function onlPatchFeed80(){const f=document.getElementById('onlFeed80');if(f){f.innerHTML=onlFeedHTML80();f.scrollTop=f.scrollHeight}}
function onlPatchLog80(){const g=document.getElementById('r80Log');const L=onlMyLobby();if(g&&L){g.innerHTML=onlRoomLog80(L);g.scrollTop=g.scrollHeight}}
function onlPatchMap80(){const c=document.getElementById('omapCap');if(c)c.innerHTML=onlCap80();const d=document.querySelector('#onlRow80 .omap-dots');if(d)d.innerHTML=onlDots80(1)}
function onlChatLoad80(L){if(!L||ONLF.chatFor[L.id])return;ONLF.chatFor[L.id]=1;NET.req('lobby.chatlog',{id:L.id}).then(ls=>{const c=ONLF.chat[L.id]=(ONLF.chat[L.id]||[]);
  for(const l of ls||[])if(!c.some(x=>!x.sys&&x.at===l.at&&x.by===l.by))c.push(l);c.sort((a,b)=>a.at-b.at);onlPatchLog80()}).catch(()=>{ONLF.chatFor[L.id]=0})}
{const base=onlRedraw;onlRedraw=function(){const r=base.apply(this,arguments);try{const f=document.getElementById('onlFeed80');if(f)f.scrollTop=f.scrollHeight;const g=document.getElementById('r80Log');if(g)g.scrollTop=g.scrollHeight;
  const L=onlMyLobby();if(L&&L.status==='waiting')onlChatLoad80(L);
  const sh=document.querySelector('#onlRow80 .ofor-chips');const fo=document.querySelector('#onlRow80 .ofor');if(sh&&fo)fo.style.setProperty('--chipsH',sh.offsetHeight+'px')}catch(e){}return r}}
/* the first draw of the window (onlineOpen's modal) gets the same touches */
{const base=onlineOpen;onlineOpen=async function(){const t0=Date.now();const iv=setInterval(()=>{if(document.getElementById('onl')){clearInterval(iv);try{onlRedraw()}catch(e){}}else if(Date.now()-t0>20000)clearInterval(iv)},150);return base.apply(this,arguments)}}
/* is the player busy with a field in the Online window (a redraw would close it)? */
function onlFocus80(){const f=document.activeElement;return !!(f&&f.closest&&f.closest('#onl')&&/SELECT|INPUT|TEXTAREA/.test(f.tagName))}
/* opening the Lobby Browser reads the list once (the player asked; pushes never do) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-onl="tab"][data-v="lobby"]');if(!b||!ONL.acct||Date.now()-(ONLF.listAt||0)<3000)return;ONLF.listAt=Date.now();
  NET.req('lobby.list').then(rows=>{if(Array.isArray(rows)){ONL.lobbies=rows;if(ONL.tab==='lobby')onlRedraw()}}).catch(()=>{})},true);
/* the large map: a centred view over everything (never a modal() over the Online window) */
function onlMapBig80(){for(const o of document.querySelectorAll('.omapbig'))o.remove();const o=document.createElement('div');o.className='omapbig onl80pop';
  o.innerHTML=`<button type="button" class="x">✕ Close</button><div class="cap">Orbis Terrarum<small>${onlCap80()}</small></div><div class="frame"><div class="omap-in"></div><div class="omap-dots" aria-hidden="true">${onlDots80(1.8)}</div></div>`;
  o.addEventListener('click',e=>{e.stopPropagation();o.remove()});document.body.appendChild(o)}

/* ---------------- the Forum and the Praeco: pushes ---------------- */
NET.on('forum.line',d=>{const l=d&&(d.line||d);if(!l||!l.k||!ONL.acct)return;if(l.by&&ONLF.muted.has(l.by))return;
  if(!(ONLF.lines||[]).some(x=>x.at===l.at&&x.by===l.by&&x.k===l.k)){ONLF.lines.push(l);if(ONLF.lines.length>60)ONLF.lines.splice(0,ONLF.lines.length-60)}
  /* a crier's line carries the room's row: the Lobby Browser learns of it without a list read */
  if(l.row&&l.row.id&&(l.k==='open'||l.k==='call')){const R=onlMyLobby();if(!R||R.id!==l.row.id){onlUpsert80(l.row);if(ONL.tab==='lobby'&&document.getElementById('onl')&&!onlFocus80())onlRedraw()}}onlPatchFeed80();
  if((l.k==='call'||l.k==='open')&&l.by!==onlMe80())onlCryBanner80(l)});
/* the 📣 banner: 15 s; not with Quiet, nor in a room or a fight, nor with the Online window shut */
function onlCryBanner80(l){if(onlQuiet80()||onlInMatch80()||onlWaitRoom80()||!document.getElementById('onl'))return;const r=l.row||{};if(!r.id||!onlCanTake80(r.id,Date.now()))return;
  let b=document.getElementById('onlCry80');if(!b){b=document.createElement('div');b.id='onlCry80';b.setAttribute('role','status');document.body.appendChild(b)}
  b.innerHTML=`<span>${l.k==='call'?'📣':'📯'} <b>${esc2(l.name||'A lanista')}</b> ${l.k==='call'?`calls for ${l.need|0} more`:'opened a room'} · ${onlRowTxt80(r)}</span><button type="button" class="btn tksm primary" data-onl="take" data-v="${esc2(r.id)}">⚔ Take a seat</button><button type="button" class="btn tksm" data-onl="cryx" title="Dismiss">✕</button>`;
  b.hidden=false;clearTimeout(ONLF.cryT);ONLF.cryT=setTimeout(()=>{const x=document.getElementById('onlCry80');if(x)x.hidden=true},15000)}
/* the banner never outlives the Online window */
setInterval(()=>{const b=document.getElementById('onlCry80');if(b&&!b.hidden&&(!document.getElementById('onl')||onlInMatch80()||onlWaitRoom80()))b.hidden=true},700);
NET.on('lobby.say',d=>{if(!d||!d.line||!ONL.acct)return;if(ONLF.muted.has(d.line.by))return;const c=ONLF.chat[d.id]=(ONLF.chat[d.id]||[]);if(!c.some(x=>!x.sys&&x.at===d.line.at&&x.by===d.line.by))c.push(d.line);if(c.length>60)c.splice(0,c.length-60);onlPatchLog80()});
/* invites: queued; a popup only when the Online window is up, you are free and nothing else is open; Quiet → a Forum line */
NET.on('lobby.invite',d=>{if(!d||!d.row||!ONL.acct)return;if(ONLF.muted.has(d.fromId))return;const it={row:d.row,from:d.from,fromId:d.fromId,at:Date.now()};
  if(onlQuiet80()){ONLF.local.push({k:'inv',from:d.from,by:d.fromId,row:d.row,at:Date.now()});onlPatchFeed80();return}ONLF.invq.push(it)});
function onlPopOpen80(){return !!document.querySelector('.ask76bg,.veraskbg,.onl80pop')}
setInterval(()=>{try{ONLF.invq=ONLF.invq.filter(x=>Date.now()-x.at<120000);if(!ONLF.invq.length||!document.getElementById('onl')||onlPopOpen80()||onlInMatch80())return;
  const it=ONLF.invq.shift();if(onlWaitRoom80()||onlQuiet80()){ONLF.local.push({k:'inv',from:it.from,by:it.fromId,row:it.row,at:it.at});onlPatchFeed80();return}onlInvitePop80(it)}catch(e){}},400);
function onlInvitePop80(it){const r=it.row;const bg=document.createElement('div');bg.className='veraskbg onl80pop inv80bg';
  bg.innerHTML=`<div class="card2 verask" role="dialog" aria-modal="true"><b>✉ ${esc2(it.from||'A lanista')} invites you</b><div style="margin:6px 0 10px">${onlRowTxt80(r)}<div class="rc-sub">${(r.players||[]).length}/${r.seats|0} seated · ${(r.members||[]).length}/${ONLC.ROOM_MAX} in the room</div></div>
   <div class="acts"><button type="button" class="btn primary" data-onl="ijoin" data-v="${esc2(r.id)}">⚔ Join</button><button type="button" class="btn" data-onl="ino">Not now</button><button type="button" class="btn" data-onl="imute" data-v="${esc2(it.fromId||'')}">🔇 Mute</button></div></div>`;
  bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()});document.body.appendChild(bg)}
/* the who list: lanistas here now */
async function onlWho80(){let rows=[];try{rows=await NET.req('who.list')}catch(e){onlToast80('⚠ '+esc2(e.message));return}for(const o of document.querySelectorAll('.w80bg'))o.remove();
  const room=onlWaitRoom80();const st={free:'free',room:'in a room',fight:'fighting'};
  const row=w=>{const R=(ONL.lobbies||[]).find(L=>L.status==='waiting'&&(L.members||[]).some(m=>m.id===w.id));const F=(ONL.lobbies||[]).find(L=>L.status==='live'&&L.players.some(p=>p.id===w.id));const mu=ONLF.muted.has(w.id);
    return `<div class="w80r" data-who="${esc2(w.id)}"><b>${esc2(w.name)}</b> ${onlRankChip(w.rank)} <span class="badge ${w.st==='free'?'gold':''}">${st[w.st]||esc2(w.st)}</span><span class="acts">
      ${room&&w.st!=='fight'&&!(room.members||[]).some(m=>m.id===w.id)?`<button type="button" class="btn tksm" data-onl="winv" data-v="${esc2(w.id)}">✉ Invite</button>`:''}
      ${!room&&R&&w.st==='room'?`<button type="button" class="btn tksm primary" data-onl="wjoin" data-v="${R.id}">⚔ Join</button>`:''}
      ${F&&w.st==='fight'?`<button type="button" class="btn tksm" data-onl="wwatch" data-v="${F.id}">👁 Watch</button>`:''}
      <button type="button" class="btn tksm" data-onl="wmute" data-v="${esc2(w.id)}" data-on="${mu?0:1}">${mu?'🔊 Unmute':'🔇 Mute'}</button></span></div>`};
  const bg=document.createElement('div');bg.className='veraskbg onl80pop w80bg';
  bg.innerHTML=`<div class="card2 verask w80" role="dialog" aria-modal="true"><div class="w80h"><b>👥 Lanistas here · ${rows.length}</b><button type="button" class="btn tksm" data-onl="wx">✕</button></div><div class="w80list">${rows.map(row).join('')||'<p class="rc-sub">Nobody else is here right now.</p>'}</div></div>`;
  bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()});document.body.appendChild(bg)}
const onlPopClose80=el=>{const p=el&&el.closest('.onl80pop');if(p)p.remove()};

/* ---------------- the controls ---------------- */
for(const a of ['mkroom','rsit','rready','take','fsay','rcall','rinvite','rsay','ijoin','wjoin','winv'])ONL_NEEDS_GLAD.add(a);
Object.assign(ONL_WHY,{mkroom:'to open a room',rsit:'to take a seat',rready:'to take a seat',take:'to take a seat',fsay:'to speak in the Forum',rcall:'to call lanistas',rinvite:'to invite lanistas',rsay:'to speak in the room',ijoin:'to join a room',wjoin:'to join a room',winv:'to invite lanistas'});
const ONL_ACTS80=new Set(['quick','join','leave','ready','ticket','betgo','mkroom','newgame','rsit','rstand','rready','rhost','rkick','rteam','rcall','rinvite','rsay','fsay','take','who','quiet','omap','cryx','ijoin','ino','imute','wjoin','winv','wwatch','wmute','wx','uwatch','uback']);
const onlReq80=async(t,d)=>{const r=await NET.req(t,d);if(r&&r.lobby)onlUpsert80(r.lobby);else if(r&&r.id&&r.players)onlUpsert80(r);return r};
const onlRoomId80=()=>(onlMyLobby()||{}).id;
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-onl],.onl80pop [data-onl],#onlCry80 [data-onl]');if(!b)return;const a=b.dataset.onl,v=b.dataset.v;if(!ONL_ACTS80.has(a))return;
  e.preventDefault();e.stopImmediatePropagation();const inOnl=!!b.closest('#onl');
  if(!inOnl&&ONL_NEEDS_GLAD.has(a)&&!ONL.char&&ONL.acct){onlPopClose80(b);onlNeedGlad(a==='ijoin'||a==='take'?'join':a);return}
  if(a==='omap'){onlMapBig80();return}
  if(a==='quiet'){try{localStorage.setItem('flavius_onlquiet80',onlQuiet80()?'0':'1')}catch(err){}onlToast80(onlQuiet80()?'🔕 Quiet — no banners or invite pop-ups.':'🔔 Banners and invites pop up again.');onlRedraw();return}
  if(a==='cryx'){const x=document.getElementById('onlCry80');if(x)x.hidden=true;return}
  if(a==='who'){onlWho80();return}
  if(a==='wx'||a==='ino'){onlPopClose80(b);return}
  if(a==='uback'){ONL.unseated80=null;onlRedraw();return}
  if(a==='uwatch'){const L=(ONL.lobbies||[]).find(x=>x.id===v);ONL.unseated80=null;if(L)return onlDo(()=>onlWatch({...L,status:'live'}));onlRedraw();return}
  if(a==='wwatch'){onlPopClose80(b);const L=(ONL.lobbies||[]).find(x=>x.id===v);if(L)onlDo(()=>onlWatch(L));return}
  if(a==='wmute'||a==='imute'){const on=a==='imute'||b.dataset.on==='1';if(a==='imute')onlPopClose80(b);if(!v)return;
    return onlDo(async()=>{await NET.req('forum.mute',{who:v,on});if(on)ONLF.muted.add(v);else ONLF.muted.delete(v);onlMuteSave80();ONLF.invq=ONLF.invq.filter(x=>x.fromId!==v);
      onlToast80(on?'🔇 Muted — no phrases, calls or invites from them.':'🔊 Unmuted.');if(a==='wmute'){const p=document.querySelector('.w80bg');if(p){p.remove();onlWho80()}}})}
  if(a==='quick'){const [ev,rk]=String(v).split('|');return onlDo(async()=>{const r=await onlReq80('lobby.quick',{ev,ranked:rk==='1'});
    onlToast80(r.made?`📯 A new ${esc2(onlEvName(ev))} room — the crier calls for lanistas.`:`⚔ You joined ${esc2(r.lobby.host.name)}’s room.`)})}
  if(a==='mkroom'||a==='newgame')return onlDo(async()=>{await onlReq80('lobby.create',{ranked:v==='1'||a==='newgame'});onlToast80('📯 Your room is open — the crier calls.')});
  if(a==='join'||a==='take'||a==='ijoin'||a==='wjoin'){onlPopClose80(b);if(a==='take'){const x=document.getElementById('onlCry80');if(x)x.hidden=true}
    return onlDo(async()=>{const L=await onlReq80('lobby.join',{id:v});if(ONL.tab!=='lobby')ONL.tab='play';const sat=L.players.some(p=>p.id===onlMe80());onlToast80(sat?`🪑 You sat down in ${esc2(L.host.name)}’s room.`:`👤 You stand in ${esc2(L.host.name)}’s room — every seat is taken.`)})}
  if(a==='leave')return onlDo(async()=>{await onlReq80('lobby.leave',{id:v})});
  if(a==='ready'||a==='rready')return onlDo(async()=>{await onlReq80('lobby.ready',{id:onlRoomId80()||v,ready:a==='ready'||v==='1'})});
  if(a==='rsit')return onlDo(async()=>{await onlReq80('lobby.sit',{id:v})});
  if(a==='rstand')return onlDo(async()=>{await onlReq80('lobby.stand',{id:v})});
  if(a==='rhost')return onlDo(async()=>{await onlReq80('lobby.host',{id:onlRoomId80(),to:v})});
  if(a==='rkick')return onlDo(async()=>{await onlReq80('lobby.kick',{id:onlRoomId80(),who:v})});
  if(a==='rteam'){const [who,team]=String(v).split('|');return onlDo(async()=>{await onlReq80('lobby.team',{id:onlRoomId80(),who,team})})}
  if(a==='rcall')return onlDo(async()=>{const r=await NET.req('lobby.call',{id:v});const L=onlMyLobby();if(L)L.cry=(L.cry||[]).concat(Date.now());onlToast80(`📣 The crier calls — ${r.left|0} call${r.left===1?'':'s'} left.`)});
  if(a==='rinvite'){onlWho80();return}
  if(a==='winv')return onlDo(async()=>{await NET.req('lobby.invite',{id:onlRoomId80(),to:v});onlToast80('✉ Invitation sent.');b.disabled=true;b.textContent='✉ Sent'});
  if(a==='rsay')return onlSayRoom80(v);
  if(a==='fsay')return onlDo(async()=>{const r=await NET.req('forum.say',{q:v});const l=r&&r.line;if(l&&!ONLF.lines.some(x=>x.at===l.at&&x.by===l.by))ONLF.lines.push(l)});
  if(a==='ticket')return onlDo(async()=>{const r=await onlReq80('lobby.ticket',{id:v});ONL.char=r.char;onlToast80(`🎟 A seat in the stands at ${esc2(onlCityName(r.lobby.loc))} — it opens when the horns sound.`)});
  if(a==='betgo')return onlDo(async()=>{const r=await onlReq80('bet.place',{id:v,seat:+($('#onlBetSeat')||{}).value,amt:+($('#onlBetAmt')||{}).value});ONL.char=r.char;ONL.betting=null;onlToast80('🎲 Wager placed.')})},true);
async function onlSayRoom80(q){const id=onlRoomId80();if(!id)return;try{const r=await NET.req('lobby.say',{id,q});const l=r&&r.line;if(l){const c=ONLF.chat[id]=(ONLF.chat[id]||[]);if(!c.some(x=>!x.sys&&x.at===l.at&&x.by===l.by))c.push(l)}onlPatchLog80()}
  catch(e){onlToast80('⚠ '+esc2(e.message))}}
/* the host's settings: one change → lobby.set → the room comes back */
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.onlrs)return;const L=onlMyLobby();if(!L)return;const k=t.dataset.onlrs;
  const v=k==='autoBal'?t.checked:k==='standsOff'?t.value==='1':k==='ev'||k==='abandon'?t.value:+t.value;onlDo(async()=>{await onlReq80('lobby.set',{id:L.id,[k]:v})})},true);
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.matches&&e.target.matches('#onl [data-onl="omap"]')){e.preventDefault();onlMapBig80()}
  if(e.key==='Escape'){const p=document.querySelector('.omapbig,.w80bg');if(p){e.stopPropagation();p.remove()}}},true);
/* presence: a ping every 20 s while the Online window is up (mock); the map's counts at most once a minute on Play */
setInterval(()=>{try{if(!document.getElementById('onl')||!ONL.acct)return;const now=Date.now();
  if(NET.mode==='mock'&&now-(ONLF.pingAt||0)>=20000){ONLF.pingAt=now;NET.req('ping').catch(()=>{})}
  if(ONL.tab==='play'&&now-(ONLF.helloAt||0)>60000){ONLF.helloAt=now;NET.req('hello',{all:1}).then(h=>{if(!h||!h.me)return;if(h.lobbies)ONL.lobbies=h.lobbies;if(h.online!=null)ONL.stats={...ONL.stats,online:h.online};
    if(onlFocus80()){onlPatchMap80();onlPatchFeed80()}else onlRedraw()}).catch(()=>{})}}catch(e){}},5000);
/* the empire card counts the lanistas here too */
{const base=onlRefresh;onlRefresh=async function(){const r=await base.apply(this,arguments);try{if(ONLF.here&&ONLF.here.n)ONL.stats={...(ONL.stats||{}),online:ONLF.here.n}}catch(e){}return r}}

/* ---------------- in the match: 💬 phrases, bubbles over the gladiator, ⚔ Again ---------------- */
function onlSeatName80(seat){const p=S&&S.players[seat];if(p)return p.name;const t=((S&&S.onl&&S.onl.stands)||[])[seat-((S&&S.onl&&S.onl.fighters)||0)];return t?t.name:'A lanista'}
function onlBubble80(seat,q){if(typeof HEADLESS!=='undefined'&&HEADLESS)return;if(!S)return;let box=document.getElementById('wbubs');if(!box){const cw=document.querySelector('.canvas-wrap');if(!cw)return;box=document.createElement('div');box.id='wbubs';cw.appendChild(box)}
  const p=S.players[seat];const el=document.createElement('div');el.className='qbub80';let x,y;
  if(p&&p.alive&&!p.exited&&p.r!=null){const m=center(p.r,p.c);x=m.x;y=m.y-TW*1.25;el.innerHTML=`${esc2(onlQ80(q))}`}else{x=box.clientWidth/2;y=48;el.innerHTML=`<small>${esc2(onlSeatName80(seat))}</small> ${esc2(onlQ80(q))}`;el.classList.add('far')}
  el.title=onlSeatName80(seat);el.dataset.seat=seat;el.style.left=x+'px';el.style.top=y+'px';box.appendChild(el);setTimeout(()=>el.remove(),3400);
  if(S.over&&CUR_MODAL)onlToast80(`💬 <b>${esc2(onlSeatName80(seat))}</b>: ${esc2(onlQ80(q))}`)}
NET.on('match.say',d=>{if(!d||!S||!S.onl||d.id!==S.onl.lobby)return;if(d.by&&(d.by===onlMe80()||ONLF.muted.has(d.by)))return;onlBubble80(d.seat|0,d.q)});
function onlSayable80(){return !!(S&&S.onl&&S.onl.seat>=0&&!S.onl.watch&&(ONLM.me>=0||S.over)&&!(ONL.leftMatch||{})[S.onl.lobby])}
function onlSayBar80(){const lv=document.getElementById('btnOnlLeave');let s=document.getElementById('btnOnlSay80');let ag=document.getElementById('btnOnlAgain80');
  if(!lv||!onlSayable80()){if(s)s.remove();if(ag)ag.remove();const p=document.getElementById('onlSay80');if(p)p.remove();return}
  if(!s){s=document.createElement('button');s.id='btnOnlSay80';s.type='button';s.className='btn';s.textContent='💬';s.title='Quick phrases';lv.after(s)}
  const fighter=S.onl.seat<(S.onl.fighters||S.players.length);
  if(S.over&&fighter){if(!ag){ag=document.createElement('button');ag.id='btnOnlAgain80';ag.type='button';ag.className='btn primary';ag.textContent='⚔ Again';ag.title='A new room with the same game — the others are invited';s.after(ag)}}else if(ag)ag.remove()}
setInterval(()=>{try{onlSayBar80()}catch(e){}},500);
function onlSayPop80(){let p=document.getElementById('onlSay80');if(p){p.remove();return}const b=document.getElementById('btnOnlSay80');if(!b)return;const r=b.getBoundingClientRect();
  p=document.createElement('div');p.id='onlSay80';const sc=S.over?'after':'match';p.innerHTML=ONLC.QC[sc].map(q=>`<button type="button" data-msay="${q}">${esc2(onlQ80(q))}</button>`).join('');
  p.style.left=Math.max(8,Math.min(innerWidth-260,r.left))+'px';p.style.top=(r.bottom+6)+'px';document.body.appendChild(p)}
async function onlMatchSay80(q){try{await NET.req('match.say',{id:S.onl.lobby,q});onlBubble80(S.onl.seat,q);return true}catch(err){onlToast80('⚠ '+esc2(err.message));return false}}
async function onlAgain80(){const id=S&&S.onl&&S.onl.lobby;if(!id)return;
  try{const r=await NET.req('lobby.again',{id});onlUpsert80(r.lobby);const n=(r.invited||[]).length;onlToast80(`⚔ A new room — ${n?n+' lanista'+(n===1?'':'s')+' invited':'the others are elsewhere'}.`);ONL.tab='play';onlExit();return r}
  catch(err){onlToast80('⚠ '+esc2(err.message));return null}}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
  if(t.closest('#btnOnlSay80')){e.preventDefault();e.stopPropagation();ONLM.uiAt=Date.now();onlSayPop80();return}
  const m=t.closest('#onlSay80 [data-msay]');if(m){e.preventDefault();e.stopPropagation();ONLM.uiAt=Date.now();const p=document.getElementById('onlSay80');if(p)p.remove();onlMatchSay80(m.dataset.msay);return}
  if(!t.closest('#onlSay80')){const p=document.getElementById('onlSay80');if(p)p.remove()}
  if(t.closest('#btnOnlAgain80')){e.preventDefault();e.stopPropagation();ONLM.uiAt=Date.now();onlAgain80()}},true);

{const st=document.createElement('style');st.textContent=`
.ow-row{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:22px;margin-top:18px;align-items:stretch}
.ow-h{font:700 18px/1.2 Georgia,serif;color:var(--bone,#eee);margin:0 0 10px;display:flex;align-items:baseline;flex-wrap:wrap;gap:0 6px}.ow-h small{font:600 13px system-ui,sans-serif;color:#bfae88;margin-left:6px}.ow-h small b{color:#f0c060}
.f80-ctl{margin-left:auto;display:flex;gap:4px;align-self:center}.f80-ctl .btn.on{border-color:#6b5532;color:#bfae88}
.omap{position:relative;width:100%;aspect-ratio:2.25/1;border-radius:50%;overflow:hidden;cursor:zoom-in;
  border:3px solid #c9a24f;box-shadow:0 0 0 1px #4a3416,0 0 0 6px rgba(201,162,79,.16),0 0 22px rgba(0,0,0,.6),inset 0 0 28px 6px rgba(0,0,0,.65)}
.omap .omap-in,.omap .omap-dots{position:absolute;top:50%;left:50%;width:132%;aspect-ratio:2400/853;transform:translate(-52.5%,-49%)}
.omap-in{background:url(assets/orbis.webp) center/100% 100% no-repeat}.omap .omap-in{filter:sepia(.3) saturate(.85) brightness(.68) contrast(1.05)}
.omap::after{content:'';position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 26px 8px rgba(20,14,9,.75);pointer-events:none}
.omap:focus-visible{outline:2px solid #f0c060;outline-offset:3px}
.omap-dot{position:absolute;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;
  background:radial-gradient(circle,rgba(255,224,160,.98) 0,rgba(255,175,75,.55) 30%,rgba(255,140,40,0) 70%);animation:omapB 4.5s ease-in-out infinite}
@keyframes omapB{0%,100%{opacity:.72}50%{opacity:1}}body.calm .omap-dot{animation:none}@media (prefers-reduced-motion:reduce){.omap-dot{animation:none}}
.ow-col{display:flex;flex-direction:column;min-height:0}
.ofor{position:relative;border:1px solid #4a3a26;border-radius:12px;background:linear-gradient(#2a2017,#211913);display:flex;flex-direction:column;flex:1;min-height:180px}
.ofor-feed{position:absolute;inset:0 0 auto 0;bottom:var(--chipsH,84px);overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:7px;font:13px/1.35 system-ui,sans-serif;color:#d8cbb0}
.ofor-feed .pr{color:#e9c46a}.ofor-feed .pr b{color:#f3d58a}.ofor-feed .who{color:#9fc0e6;font-weight:600}.ofor-feed .res{color:#a9b98f}
.ofor-feed .take{margin-left:6px;padding:1px 8px;border-radius:7px;border:1px solid #b33a2a;background:#8e2a1e;color:#fff;font-size:12px;cursor:pointer}
.ofor-chips{display:flex;flex-wrap:wrap;gap:6px;padding:9px 10px;border-top:1px solid #3d3020;margin-top:auto}
.ofor-chips button{padding:4px 10px;border-radius:14px;border:1px solid #6b5532;background:#2f2519;color:#eadbb8;font:600 12.5px system-ui,sans-serif;cursor:pointer}.ofor-chips button:hover{border-color:#c9a24f;color:#fff}
.omapbig{position:fixed;inset:0;z-index:4100;background:rgba(10,7,4,.9);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;cursor:zoom-out}
.omapbig .frame{position:relative;width:min(92vw,1240px);aspect-ratio:2400/853;border:4px solid #c9a24f;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px #4a3416,0 0 0 8px rgba(201,162,79,.14),0 20px 60px rgba(0,0,0,.7)}
.omapbig .frame .omap-in,.omapbig .frame .omap-dots{position:absolute;inset:0}.omapbig .frame .omap-in{filter:sepia(.15) brightness(.85)}
.omapbig .cap{font:700 20px Georgia,serif;color:#eee}.omapbig .cap small{font:600 14px system-ui,sans-serif;color:#bfae88;margin-left:8px}.omapbig .cap b{color:#f0c060}
.omapbig .x{position:absolute;top:18px;right:24px;font:600 15px system-ui;color:#eadbb8;border:1px solid #6b5532;border-radius:8px;padding:4px 12px;background:#2f2519;cursor:pointer}
.onl-room80{position:relative;margin:0 0 14px;border-color:var(--gold,#e8c96a)!important;padding:12px 14px}
.r80-head{display:flex;gap:12px;align-items:center}.r80-ev{width:62px;flex:none}.r80-ev img,.r80-ev .cardimg{max-width:100%}.r80-ttl{flex:1;min-width:0}.r80-ttl h3{margin:0 0 4px;font:700 22px Georgia,serif;color:var(--gold,#e8c96a)}.r80-ttl h3 small{font:600 14px system-ui,sans-serif;color:var(--muted)}
.r80-tags{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.r80-lv{align-self:flex-start}
.r80-body{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;margin-top:10px}
.r80-seats{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}
.r80-seat{display:flex;gap:8px;align-items:center;padding:6px 10px;border:1px dashed #6b5636;border-radius:10px;font-size:13px;min-height:66px}.r80-seat.on{border-style:solid;background:rgba(255,255,255,.025)}.r80-seat.me{border-color:var(--gold,#e8c96a)}
.r80-seat small{display:block;color:var(--muted)}.r80-seat .r80-who{flex:1;min-width:0}.r80-seat.empty{color:var(--muted)}.r80-seat.empty b{color:var(--bone,#ddd)}
.r80-ctl{display:flex;flex-direction:column;gap:3px}.r80-ctl .btn{padding:1px 6px;min-width:0}
.r80-tm{display:flex;gap:3px;margin-top:3px}.r80-tb{all:unset;cursor:pointer;width:18px;height:18px;display:grid;place-items:center;border-radius:4px;border:1px solid #6b5636;font:700 11px var(--mono);color:var(--muted)}.r80-tb.on{background:#6b5636;color:#fff}.r80-tb:hover{border-color:var(--gold,#e8c96a)}
.onl-team.tC{background:#2e8a4a}.onl-team.tD{background:#8a6a1e}.onl-team.tE{background:#7a3a9a}.onl-team.tF{background:#1e8a8a}.onl-team.tG{background:#9a4a6a}.onl-team.tH{background:#5a5a5a}
.r80-stand{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0;font-size:13px}.r80-stand>b{color:var(--muted);font-weight:600;margin-right:2px}
.r80-sm{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border:1px solid #5a4428;border-radius:999px}.r80-sm.me{border-color:var(--gold,#e8c96a)}.r80-sm .r80-ctl{flex-direction:row}
.r80-set{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px 10px;margin:10px 0 4px;padding:8px 10px;border:1px solid #4a3a26;border-radius:10px;font-size:13px}
.r80-set label{display:grid;gap:2px;color:var(--muted)}.r80-set label.chk{display:flex;align-items:center;gap:6px;align-self:end}.r80-set select{width:100%}.r80-rules{margin:8px 0 2px;font-size:13px}
.r80-go{margin-top:10px;flex-wrap:wrap}.r80-go .btn{flex:0 0 auto;min-width:96px}.r80-go .btn.primary{min-width:140px}.onl-lbtop .acts{flex-wrap:nowrap}.onl-lbtop .acts .btn{flex:0 0 auto}.w80r .acts .btn{flex:0 0 auto}.r80-go small{opacity:.75;font-size:11px}
.r80-talk{display:flex;flex-direction:column;border:1px solid #4a3a26;border-radius:10px;background:linear-gradient(#2a2017,#211913);min-height:200px;max-height:300px}
.r80-log{flex:1;overflow-y:auto;padding:8px 10px;font:13px/1.35 system-ui,sans-serif;display:flex;flex-direction:column;gap:3px;color:#d8cbb0}.r80-log b{color:#9fc0e6}.r80-log .sys{color:#a99a7a;font-style:italic}
.onl-room80.grey>*:not(.r80-over){filter:grayscale(1);opacity:.45;pointer-events:none}
.r80-over{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;background:rgba(15,10,6,.45);border-radius:inherit;font-size:15px}.r80-over>b{font:700 20px Georgia,serif;color:var(--gold,#e8c96a)}
#onlCry80{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:3500;display:flex;align-items:center;gap:8px;padding:8px 10px 8px 16px;border-radius:999px;background:rgba(36,26,16,.97);border:2px solid #c9a24f;color:#f3e6c4;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.6);max-width:calc(100vw - 24px)}
#onlCry80[hidden]{display:none}#onlCry80 b{color:#f3d58a}
.w80{width:min(520px,100%)!important}.w80h{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.w80list{display:grid;gap:4px;max-height:60vh;overflow-y:auto}
.w80r{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}.w80r .acts{margin-left:auto;display:flex;gap:4px}
.inv80bg .verask .acts .btn{flex:1 1 100px}
#btnOnlSay80{min-width:0}#onlSay80{position:fixed;z-index:3600;display:flex;flex-wrap:wrap;gap:6px;max-width:250px;padding:8px;border-radius:10px;background:#241a10;border:1px solid #c9a24f;box-shadow:0 10px 30px rgba(0,0,0,.6)}
#onlSay80 button{padding:5px 11px;border-radius:14px;border:1px solid #6b5532;background:#2f2519;color:#eadbb8;font:600 13px system-ui,sans-serif;cursor:pointer}#onlSay80 button:hover{border-color:#c9a24f}
.qbub80{position:absolute;transform:translate(-50%,-100%);padding:4px 11px;border-radius:12px;background:#f6ecd2;color:#2a1c06;border:2px solid #7a5a14;font:700 14px system-ui,sans-serif;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.55);pointer-events:none;animation:qbub80 3.4s ease-out forwards}
.qbub80::after{content:'';position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);border:6px solid transparent;border-top-color:#7a5a14}.qbub80 small{font-weight:600;color:#6b4a12;margin-right:4px}.qbub80.far::after{display:none}
@keyframes qbub80{0%{opacity:0;transform:translate(-50%,-80%) scale(.8)}10%{opacity:1;transform:translate(-50%,-100%) scale(1.05)}18%{transform:translate(-50%,-100%) scale(1)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-115%)}}
body.calm .qbub80{animation:none}
@media(max-width:760px){.ow-row{grid-template-columns:1fr;gap:14px}.ofor{min-height:240px}.r80-body{grid-template-columns:1fr}.r80-ev{display:none}.r80-seats{grid-template-columns:1fr}.r80-head{flex-wrap:wrap}}
`;document.head.appendChild(st)}
