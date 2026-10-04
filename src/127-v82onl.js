/* =====================================================================
   127-V82ONL · ONLINE v0.82, the client half (contract tools/plans/onl82-contract.md, protocol 5)
   =====================================================================
   DOMUS • A signed-in lanista without a house sees "🏛 Found your house" first (name 3–24 letters, word-filtered, unique; hello.needDomus);
     everything else in the window is greyed with the reason until it is named. Old accounts with gladiators get the same card — their
     gladiators join the house with their record. The rail's 🛡 My Gladiators is now 🏛 Domus: house name, record (bouts, wins, survived,
     fallen, lifetime CF, Fame), 4 gladiator slots (ONLC.GLAD_MAX), one active; rename / a new house only while it never had a gladiator.
     The house name rides beside gladiator names: rooms, lobby rows, the Forum, invitations, the who list, the stage.
   GLORY • Ranks by Glory (ONLC.gloryOf), never demoted. The Domus screen's right side holds the RANK BAR: Tiro at the bottom → Summa Rudis
     at the top, thresholds, the live count of living gladiators at each rank (hello.rankCounts), the house's gladiators' tokens at
     their Glory, filled up to the active one (phones: a strip above the slots). The pre-match room names the table-size factor.
   PATRON • An optional patron look on the Domus screen (the stands' face: skin, hair, hat, beard, tunic, mantle + a seat cushion in the
     house colours), generated from the account by default. Saved on the house (domus.patron {look}, ≤1 KB); every stands entry carries
     {domus, patron}, so every screen draws the chosen look (learned from rooms: ONL82.pat). localStorage flavius_patron82.<acct> is only the
     editor's unsaved draft. A ticket holder is "🎟 Patron of House <domus>" everywhere in the
     match (stands, spear list, log, wager bubbles): the host names them when seating the stands; everyone else loads that snapshot.
   COIN • Prices by ONLC.priceOf (weapons by level, armor by AP) in the Armory and the buy confirmation; the result toast shows the flat award
     (rank × win × streak × table) or "Custom bout — no purse".
   GUESTS • "👁 Watch as a guest" on the sign-in card: a guest connection (random id in sessionStorage flavius_onlguest82, ?guest=…,
     auth.guest {tz}); the landing read-only, the lobby list, Watch, the Forum (read), Today, the Hall; every other control says "Sign in
     to …"; the two hours run out → a notice. The map glows guests in their own colour; the count reads "N lanistas · G guests".
   INVITES • Accepted through lobby.accept; room_gone → the room's fate (👁 Watch when it started); invite.gone removes those invitations.
   FREE TICKETS + GUEST PASS (server + mock: L.free via lobby.set {free}, lobby.pass): the host may sell seats for free; a daily
     "🎟 Flavius's guest pass" card on the landing only while the wallet is under 15 coin and some room sells seats (named on the card);
     one tap seats you free; sitting through that match gives the house +1 Fame (leaving the stands early sends match.unwatch → no Fame).
   MOCK: domus.*, need_domus / guest gating, guests' presence, invites stored + lobby.accept + invite.gone, free tickets, lobby.pass, Fame,
     the house in rooms / who / Forum / invites / stands, rankCounts, as the server does (server/src/routes.js).
   ===================================================================== */
const ONL82={dom:{},until:0,expired:false,dg:null,dgAt:0,pre:null,ferr:'',draft:'',whoAt:0,gnote:0,rc:null};
const GUEST82_KEY='flavius_onlguest82',GMODE82='flavius_onlguestmode82';
const PASS82=ONLC.PASS;
const onlGuestOn82=()=>{try{return sessionStorage.getItem(GMODE82)==='1'}catch(e){return false}};
function onlGuestSet82(on){try{if(on)sessionStorage.setItem(GMODE82,'1');else sessionStorage.removeItem(GMODE82)}catch(e){}}
function onlGuestId82(){let v=null;try{v=sessionStorage.getItem(GUEST82_KEY)}catch(e){}
  if(!v||!/^[a-z0-9_-]{8,40}$/.test(v)){v='g';const a=crypto.getRandomValues(new Uint8Array(14));for(const b of a)v+=(b%36).toString(36);try{sessionStorage.setItem(GUEST82_KEY,v)}catch(e){}}return v}
const onlIsGuest82=()=>!!(ONL.acct&&ONL.acct.guest);
const onlHouse82=n=>{n=String(n||'').trim();return !n?'':/^(house|domus|ludus|familia|gens)\b/i.test(n)?n:'House '+n};
const onlDomChip82=n=>n?` <small class="dom82c">🏛 ${esc2(onlHouse82(n))}</small>`:'';
const onlPatronName82=(name,domus)=>domus?`🎟 Patron of ${onlHouse82(domus)}`:`🎟 Patron · ${name||'a lanista'}`;
function onlErr82(msg,code,extra){const e=new Error(msg);if(code)e.code=code;if(extra)e.extra=extra;return e}
const onlDay82=()=>ONLC.dayKey(Date.now()+((typeof ONL80F!=='undefined'&&ONL80F.skew)||0));
function onlH32(s){let h=2166136261;for(const c of String(s||''))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
const onlNow82=()=>Date.now()+((typeof ONL80F!=='undefined'&&ONL80F.skew)||0);

/* ---------------- houses learned from every room, line, invitation and who row ---------------- */
function onlLearn82(x,d){d=d|0;if(!x||typeof x!=='object'||d>5)return;if(Array.isArray(x)){for(const y of x.slice(0,200))onlLearn82(y,d+1);return}
  if(typeof x.domus==='string'&&x.domus){const id=typeof x.id==='string'&&x.name!=null?x.id:typeof x.by==='string'?x.by:null;if(id)ONL82.dom[id]=x.domus}
  if(typeof x.dname==='string'&&typeof x.id==='string')ONL82.dom[x.id]=x.dname;if(x.patron&&typeof x.patron==='object'&&typeof x.id==='string'&&x.paid!=null)(ONL82.pat=ONL82.pat||{})[x.id]=x.patron;if(x.fromId&&x.fromDomus)ONL82.dom[x.fromId]=x.fromDomus;
  for(const k of ['players','members','stands','lobbies','lobby','row','line','forum','me','host'])if(x[k]&&typeof x[k]==='object')onlLearn82(x[k],d+1)}
const onlDomOf82=id=>id?ONL82.dom[id]||null:null;
const onlMyDomus82=()=>(ONL.domus&&ONL.domus.name)||onlDomOf82(ONL.acct&&ONL.acct.id);

/* ---------------- the transport: refusals keep their code; the guest socket ---------------- */
function onl82Msg(self,e){let m;try{m=JSON.parse(e.data)}catch(err){return}
  if(m.re!=null&&self.wait[m.re]){const w=self.wait[m.re];delete self.wait[m.re];clearTimeout(w.t);if(m.ok)w.res(m.d);else{const er=new Error(m.err||'The server said no.');if(m.code)er.code=m.code;er.extra=m;w.rej(er)}}
  else if(m.push)NET.emit(m.push,m.d)}
{const base=NETWS.connect;NETWS.connect=async function(){
  if(!onlGuestOn82()){const r=await base.apply(this,arguments);const ws=this.ws;if(ws&&!ws._v82){ws._v82=1;ws.onmessage=e=>onl82Msg(this,e)}return r}
  if(this.ws&&this.ws.readyState<=1)return this.open;const c=await this.config();if(!c)throw new Error('No online server is set.');
  const q=`ver=${ONLC.VER}&guest=${encodeURIComponent(onlGuestId82())}`;
  this.open=new Promise((res,rej)=>{const ws=new WebSocket(c.ws+(c.ws.includes('?')?'&':'?')+q);ws._v82=1;this.ws=ws;let opened=false;
    ws.onopen=()=>{opened=true;this.tries=0;res(ws)};ws.onmessage=e=>onl82Msg(this,e);
    ws.onclose=e=>{const late=e.code===4403||(ONL82.until&&onlNow82()>ONL82.until);
      if(!opened)rej(late?onlErr82('Your two hours as a guest are up — sign in to keep watching.','guest_expired'):new Error('The arena turned the connection away.'));
      for(const k of Object.keys(this.wait)){this.wait[k].rej(new Error('Connection lost.'));delete this.wait[k]}
      if(opened&&!this.closedFor&&!late){const dl=Math.min(15000,800*2**this.tries++);setTimeout(()=>{this.connect().then(()=>{NET.emit('net.back',{});if(typeof onlmOn==='function'&&onlmOn())onlmCatchUp()}).catch(()=>{})},dl)}};
    ws.onerror=()=>{}});
  return this.open}}

/* ---------------- requests: hello, accepts, learning ---------------- */
const ONL_SKIP82=/^match\.(snap|open|get|input)$/;
{const base=NET.req;NET.req=function(t,d){
  /* an invitation is accepted through lobby.accept (it dies with its room) */
  if(t==='lobby.join'&&d&&d.id&&!d.inv&&typeof ONL81!=='undefined'&&ONL81.invRooms.has(d.id)&&ONL.acct&&!onlIsGuest82()){const self=this,args=arguments;return (async()=>{
    try{const r=await base.call(self,'lobby.accept',{id:d.id});ONL81.invRooms.delete(d.id);return r}
    catch(e){if(e&&e.code==='no_invite'){ONL81.invRooms.delete(d.id);return base.apply(self,args)}
      if(e&&e.code==='room_gone'){ONL81.invRooms.delete(d.id);onlInvGone82([d.id]);const x=e.extra||{};if(x.live){const L=(ONL.lobbies||[]).find(l=>l.id===d.id)||{id:d.id,ev:'democritus',loc:6,players:[],seats:4};onlDeadPop81({L:{...L,status:'live'}})}const er=new Error(ONL_DEAD81);er.code=e.code;er.extra=e.extra;throw er}throw e}})()}
  const p=base.apply(this,arguments);
  if(!ONL_SKIP82.test(t)&&p&&typeof p.then==='function')p.then(r=>{try{onlLearn82(r);
    if(t==='hello'&&r){if(r.me){ONL.needDomus=!!r.needDomus;ONL.domus=r.domus||null;if(r.me.dname)ONL82.dom[r.me.id]=r.me.dname}if(r.guest&&r.guest.until)ONL82.until=r.guest.until}
    if((t==='hello'||t==='world.news')&&r&&r.rankCounts)ONL82.rc=r.rankCounts;
    if(t==='domus.get'&&r){ONL82.dg=r;ONL.domus=r.domus||null;ONL.needDomus=!!r.needDomus}}catch(e){}}).catch(()=>{});
  return p}}
{const base=NET.emit;NET.emit=function(t,d){if(t==='lobby.update'||t==='forum.line'||t==='lobby.invite'||t==='lobby.say')try{onlLearn82(d)}catch(e){}return base.apply(this,arguments)}}
/* a refusal that says the house is missing or the guest's hours are up */
{const base=onlDo;onlDo=async function(fn){return base.call(this,async()=>{try{await fn()}catch(e){if(e&&e.code==='need_domus')ONL.needDomus=true;if(e&&e.code==='guest_expired')ONL82.expired=true;throw e}})}}
/* the catalog carries armor AP (the price is by AP) */
{const base=onlCatalog;onlCatalog=function(){const c=base.apply(this,arguments);for(const [k,it] of Object.entries(c))if(it.kind==='a'&&it.ap==null&&ARM[k])it.ap=ARM[k].ap|0;return c}}

/* =========================== THE MOCK SERVER (v0.82) =========================== */
const MOCK_G82='flavius_onlmock_guests82';
function mockGuests82(){try{return JSON.parse(localStorage.getItem(MOCK_G82)||'{}')||{}}catch(e){return {}}}
function mockGuestSave82(g){try{localStorage.setItem(MOCK_G82,JSON.stringify(g))}catch(e){}}
const mockIsGuest82=me=>!!me&&/^guest-/.test(me);
/* a guest window is the guest, even when another window of this browser signed in */
{const base=mockMe;mockMe=function(){if(onlGuestOn82()&&!(()=>{try{return sessionStorage.getItem('flavius_onlacct')}catch(e){return null}})())return 'guest-'+onlGuestId82();return base.apply(this,arguments)}}
const NEED_DOMUS82=new Set(['char.create','char.buy','char.edit','char.active','lobby.create','lobby.join','lobby.accept','lobby.quick','lobby.sit','lobby.ticket','lobby.invite','lobby.call','lobby.again','lobby.say','bet.place','party.create','party.join','forum.say','lobby.pass','domus.move','domus.equip']);
const GUEST_WHY82={'forum.say':'speak in the Forum','bet.place':'wager','lobby.ticket':'buy a ticket','char.create':'raise gladiators','domus.create':'found a house'};
{const base=mockReq;mockReq=async function(t,d){const me=mockMe();
  if(mockIsGuest82(me)){const G=mockGuests82();const g=G[me]||(G[me]={first:Date.now()});g.seen=Date.now();if(t==='auth.guest'&&d&&d.tz!=null)g.tz=ONLC.cleanTz(d.tz);mockGuestSave82(G);
    if(Date.now()-g.first>ONLC.GUEST_MS)throw onlErr82('Your two hours as a guest are up — sign in to keep watching.','guest_expired');
    if(!ONLC.GUEST_OK.includes(t))throw onlErr82(`Sign in to ${GUEST_WHY82[t]||'play'}.`,'guest')}
  else if(me&&NEED_DOMUS82.has(t)){const w=mockLoad();const A=w.accounts[me];if(A&&!A.domus)throw onlErr82('Name your house first — every lanista needs a Domus.','need_domus')}
  return base.apply(this,arguments)}}
function mockDomus82(w,id){w.domus82=w.domus82||{};return id?w.domus82[id]||null:null}
function mockGlads82(w,D){if(!D)return 0;return Math.max(D.glads|0,Object.values(w.chars).filter(c=>c.domus===D.id).length)}
const mockDRow82=D=>ONLC.domusRow(D);
const mockGuestsLive82=()=>{const t=Date.now();return Object.values(mockGuests82()).filter(g=>t-(g.seen||0)<60000&&t-(g.first||0)<ONLC.GUEST_MS).map(g=>({tz:g.tz||''}))};
const mockHereSum82=w=>ONLC.hereSummary(mockHere80(w),Object.values(w.lobbies),mockGuestsLive82());
function mockRankCounts82(w){const o={};for(const R of ONLC.RANKS)o[R.k]=0;for(const c of Object.values(w.chars))if(c.alive)o[ONLC.rankFor(c).k]++;return o}
/* invitations: stored per invitee, they die with the room */
const GONE82={closed:'That room has closed.',started:'That game has started — you can watch it.',full:'That room has filled up.',left:'The lanista who invited you has left the room.'};
function mockDead82(L,to){if(!L||L.status==='done')return {why:'closed'};if(L.status==='live')return {why:'started',live:true};if(L.players.length>=L.seats)return {why:'full'};
  const by=(L.invited||[]).filter(x=>x.to===to).map(x=>x.by);if(by.length&&!by.some(b=>ONLC.memberOf(L,b)))return {why:'left'};return null}
function mockDrop82(w,to,room){w.invites82=w.invites82||{};const xs=w.invites82[to]||[];const out=xs.filter(x=>!room||x.room===room);w.invites82[to]=xs.filter(x=>room&&x.room!==room);return out}
function mockSweep82(w,L){if(!L||(L.status==='done'&&L.started&&L.swept82))return;if(L.status==='live')L.swept82=1;const seen=new Set();
  for(const {to} of L.invited||[]){if(seen.has(to))continue;seen.add(to);const dead=mockDead82(L,to);if(!dead)continue;if(mockDrop82(w,to,L.id).length)mockTo([to],'invite.gone',{rooms:[L.id],why:dead.why,...(dead.live?{live:true}:{})})}}
function mockCancel82(w,ids,joined){for(const a of ids){const xs=mockDrop82(w,a);const rooms=[...new Set(xs.map(x=>x.room))].filter(r=>r!==joined);if(rooms.length)mockTo([a],'invite.gone',{rooms,why:'joined'})}}
const mockParty82=(w,me)=>{const a=w.accounts[me];const P=a&&a.party&&w.parties&&w.parties[a.party];return P?P.members.slice():[me]};
{const base=mockUpd80;mockUpd80=function(w,L){const r=base.apply(this,arguments);try{mockSweep82(w,L)}catch(e){}return r}}
{const base=mockClose;mockClose=function(w,L){const r=base.apply(this,arguments);try{mockSweep82(w,L)}catch(e){}return r}}
{const base=mockRoomOut80;mockRoomOut80=function(){const y=base.apply(this,arguments);if(y)delete y.invited;return y}}
{const base=mockInvite80;mockInvite80=function(w,me,L,to,soft){const n=MOCK_OUT.length;const why=base.apply(this,arguments);if(why)return why;
  const sent=MOCK_OUT.slice(n).filter(p=>p.t==='lobby.invite');if(!sent.length)return '';for(const p of sent){p.d.room=L.id;p.d.fromDomus=(w.accounts[me]||{}).dname||null}
  w.invites82=w.invites82||{};w.invites82[to]=(w.invites82[to]||[]).filter(x=>!(x.room===L.id&&x.by===me)).concat([{room:L.id,by:me,at:Date.now()}]);
  L.invited=(L.invited||[]).filter(x=>!(x.to===to&&x.by===me)).concat([{to,by:me}]).slice(-60);return ''}}
/* a room's people carry their house */
{const base=mockGroup;mockGroup=function(w,me){const g=base.apply(this,arguments);
  for(const x of g){const A=w.accounts[x.id];if(!A||!A.domus)throw onlErr82(x.id===me?'Name your house first.':'Someone in your party has no house yet.','need_domus');x.domus=A.dname}return g}}
Object.assign(MOCK_ROUTES,{
  'auth.guest':(w,d,me)=>{if(!mockIsGuest82(me))throw new Error('You are signed in.');const G=mockGuests82()[me]||{first:Date.now()};return {guest:true,id:me,first:G.first,until:G.first+ONLC.GUEST_MS,now:Date.now()}},
  'domus.get':(w,d,me)=>{const A=w.accounts[me];if(!A)throw new Error('Sign in first.');const D=mockDomus82(w,A.domus);const mine=Object.values(w.chars).filter(c=>c.owner===me&&c.alive);
    return {domus:mockDRow82(D),needDomus:!D,glads:mockGlads82(w,D),archived:(A.domusOld||[]).map(x=>mockDRow82(mockDomus82(w,x))).filter(Boolean),gear:(D&&D.gear)||[],busy:mine.filter(c=>mockCharBusy82(w,c.id)).map(c=>c.id)}},
  /* 🗄 the storeroom (as the server: domus.move / domus.equip) */
  'domus.move':(w,d,me)=>{const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);if(!D)throw onlErr82('Name your house first.','need_domus');const item=String(d.item||'');
    const side=x=>{if(x==='house'){D.gear=D.gear||[];return D}const ch=w.chars[x];if(!ch||ch.owner!==me||ch.domus!==D.id)throw new Error('Not of your house.');if(mockCharBusy82(w,ch.id))throw onlErr82(`${ch.name} is in a match — the storeroom waits.`,'in_match');return ch};
    const src=side(d.from),dst=side(d.to);if(d.from===d.to)throw new Error('Pick where it goes.');ONLC.gearMove(src,dst,item,onlCatalog());const out=x=>x.cls?x:{house:true,gear:x.gear};return {from:out(src),to:out(dst)}},
  'domus.equip':(w,d,me)=>{const ch=w.chars[d.char];if(!ch||ch.owner!==me)throw new Error('Not yours.');if(mockCharBusy82(w,ch.id))throw onlErr82(`${ch.name} is in a match — the storeroom waits.`,'in_match');return ONLC.gearEquip(ch,String(d.item||''),!!d.on)},
  'domus.create':(w,d,me)=>{const A=w.accounts[me];if(!A)throw new Error('Sign in first.');const why=ONLC.domusWhy(d.name);if(why)throw onlErr82(why,'domus_name');
    const cur=mockDomus82(w,A.domus);if(cur&&mockGlads82(w,cur)>0)throw onlErr82('Your house already has gladiators — it stands as it is.','domus_locked');
    w.dnames82=w.dnames82||{};const name=ONLC.cleanName(d.name);const k=ONLC.domusKey(name);if(w.dnames82[k])throw onlErr82('Another lanista’s house has that name.','name_taken');
    const D=ONLC.newDomus(name,me,'D'+(w.seq++),Date.now());const old=Object.values(w.chars).filter(c=>c.owner===me&&!c.domus);ONLC.domusFromChars(D,old);for(const c of old)c.domus=D.id;
    w.domus82[D.id]=D;w.dnames82[k]=D.id;if(cur){cur.archived=true;cur.archivedAt=Date.now();const ck=ONLC.domusKey(cur.name);if(w.dnames82[ck]===cur.id)delete w.dnames82[ck];A.domusOld=[...(A.domusOld||[]),cur.id].slice(-10)}
    A.domus=D.id;A.dname=D.name;return {domus:mockDRow82(D),needDomus:false,joined:old.length}},
  'domus.rename':(w,d,me)=>{const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);if(!D)throw onlErr82('Name your house first.','need_domus');
    if(mockGlads82(w,D)>0)throw onlErr82('A house with gladiators keeps its name.','domus_locked');const why=ONLC.domusWhy(d.name);if(why)throw onlErr82(why,'domus_name');
    w.dnames82=w.dnames82||{};const name=ONLC.cleanName(d.name);const k=ONLC.domusKey(name),ok=ONLC.domusKey(D.name);if(k!==ok){if(w.dnames82[k])throw onlErr82('Another lanista’s house has that name.','name_taken');w.dnames82[k]=D.id;if(w.dnames82[ok]===D.id)delete w.dnames82[ok]}
    D.name=name;A.dname=name;return {domus:mockDRow82(D)}},
  'lobby.accept':(w,d,me)=>{const L=w.lobbies[d.id];const dead=mockDead82(L,me);if(dead){mockDrop82(w,me,d.id);throw onlErr82(GONE82[dead.why],'room_gone',{why:dead.why,...(dead.live?{live:true}:{})})}
    if(!((w.invites82||{})[me]||[]).some(x=>x.room===d.id))throw onlErr82('That invitation is gone.','no_invite');return MOCK_ROUTES['lobby.join'](w,{id:d.id},me)},
  /* 🎟 Flavius's guest pass (as the server): once a UTC day a house, while the wallet is thin, a free seat in a room selling seats */
  'lobby.pass':(w,d,me)=>{const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);if(!D)throw onlErr82('Name your house first.','need_domus');
    if(mockLive80(w,me))throw new Error('Your gladiator is still fighting a match — go back to it (⚔ Rejoin) or abandon it first.');const ch=onlMockChar(w,me);
    if(!ch)throw new Error('The pass seats a gladiator’s house — make a gladiator first.');const day=ONLC.dayKey(Date.now());
    const L=w.lobbies[d.id];if(!L)throw new Error('That game is gone.');const why=ONLC.passOK(L,me,ch.wallet,D.passDay,day);if(why)throw new Error(why);
    if(Object.values(w.lobbies).some(X=>X.status==='waiting'&&ONLC.memberOf(X,me)))throw new Error('Leave your room first.');
    D.passDay=day;(L.stands=L.stands||[]).push(mockStand82(w,me,0,{pass:1}));L.tickets=L.stands.length;mockUpd80(w,L);return {lobby:mockRoomOut80(w,L),char:ch,domus:mockDRow82(D)}},
  /* the house's patron look (as the server: cleaned, ≤1 KB; null = the default) */
  'domus.patron':(w,d,me)=>{const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);if(!D)throw onlErr82('Name your house first.','need_domus');
    if(d.look!=null&&(typeof d.look!=='object'||Array.isArray(d.look)))throw new Error('Not a look.');const p=ONLC.cleanPatron(d.look);if(Object.keys(p).length)D.patron=p;else delete D.patron;return {domus:mockDRow82(D)}}});
/* a seat in the stands carries the house and its patron look */
function mockStand82(w,me,paid,extra){const A=w.accounts[me]||{};const D=mockDomus82(w,A.domus);return {id:me,name:mockName80(w,me),paid,...(A.dname?{domus:A.dname}:{}),...(D&&D.patron?{patron:D.patron}:{}),...(extra||{})}}
const mockCharBusy82=(w,cid)=>Object.values(w.lobbies).some(L=>(L.status==='waiting'||L.status==='live')&&(L.players||[]).some(p=>p.char===cid));
{const base=MOCK_ROUTES['hello'];MOCK_ROUTES['hello']=(w,d,me)=>{
  if(mockIsGuest82(me)){const G=mockGuests82()[me]||{first:Date.now()};const rows=Object.values(w.lobbies).filter(L=>L.status!=='done'&&!L.flag).sort((a,b)=>b.created-a.created).map(ONLC.liteRow);
    const here=mockHereSum82(w);return {ver:ONLC.VER,mode:'mock',me:null,guest:{id:me,until:(G.first||Date.now())+ONLC.GUEST_MS},now:Date.now(),lobbies:rows,here,online:here.n,forum:w.forum.slice(-30),news:w.news.slice(0,8),challenges:ONLC.weekChallenges(Date.now()),today:mockToday80(w),rankCounts:mockRankCounts82(w)}}
  const o=base(w,d,me);const a=me&&w.accounts[me];if(a){o.needDomus=!a.domus;o.domus=mockDRow82(mockDomus82(w,a.domus));o.me={...o.me,dname:a.dname||null};if(o.here)o.here=mockHereSum82(w);o.rankCounts=mockRankCounts82(w)}return o}}
{const base=MOCK_ROUTES['world.news'];MOCK_ROUTES['world.news']=(w,d,me)=>{const o=base(w,d,me);o.here=mockHereSum82(w);o.guests=o.here.guests;o.rankCounts=mockRankCounts82(w);return o}}
{const base=MOCK_ROUTES['char.create'];MOCK_ROUTES['char.create']=(w,d,me)=>{const ch=base(w,d,me);const A=w.accounts[me];ch.domus=A&&A.domus||null;const D=mockDomus82(w,ch.domus);if(D)D.glads=(D.glads|0)+1;return ch}}
{const base=MOCK_ROUTES['who.list'];MOCK_ROUTES['who.list']=(w,d,me)=>base(w,d,me).map(r=>({...r,domus:(w.accounts[r.id]||{}).dname||null}))}
{const base=MOCK_ROUTES['forum.say'];MOCK_ROUTES['forum.say']=(w,d,me)=>{const r=base(w,d,me);if(r&&r.line)r.line.domus=(w.accounts[me]||{}).dname||null;return r}}
for(const k of ['lobby.join','lobby.create','lobby.quick']){const base=MOCK_ROUTES[k];MOCK_ROUTES[k]=(w,d,me)=>{if(k==='lobby.join'&&d&&d.inv)return MOCK_ROUTES['lobby.accept'](w,{id:d.id},me);
  const r=base(w,d,me);try{const L=r&&(r.lobby||r);mockCancel82(w,mockParty82(w,me),L&&L.id)}catch(e){}return r}}
{const base=MOCK_ROUTES['lobby.accept'];MOCK_ROUTES['lobby.accept']=(w,d,me)=>{const r=base(w,d,me);try{mockCancel82(w,mockParty82(w,me),d.id)}catch(e){}return r}}
/* free tickets (ONLC: lobby.set {free}, ticketOK); a seat carries the house and the patron (as the server) */
{const base=MOCK_ROUTES['lobby.ticket'];MOCK_ROUTES['lobby.ticket']=(w,d,me)=>{const L=w.lobbies[d.id];if(L&&mockLive80(w,me))throw new Error('Your gladiator is still fighting a match — go back to it (⚔ Rejoin) or abandon it first.');
  const r=base(w,d,me);const i=L?(L.stands||[]).findIndex(s=>s.id===me):-1;if(i>=0){const t=L.stands[i];L.stands[i]=mockStand82(w,me,t.paid|0,t.paid?null:{free:1});if(r&&r.lobby)r.lobby=mockRoomOut80(w,L)}return r}}
/* a ticket holder leaving the stands before the end (no Fame for a guest pass) */
{const base=MOCK_ROUTES['match.unwatch'];MOCK_ROUTES['match.unwatch']=(w,d,me)=>{const r=base(w,d,me);const M=w.matches[d.id],L=w.lobbies[d.id];if(M&&M.status!=='done'&&L&&L.status==='live'&&(L.stands||[]).some(t=>t.id===me))(M.left=M.left||{})[me]=Date.now();return r}}
/* the house record follows every settled result; a guest pass sat through → +1 Fame */
{const base=MOCK_ROUTES['match.result'];MOCK_ROUTES['match.result']=(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];const was=M&&M.status;const before=new Set(Object.keys((M&&M.outs)||{}));
  const r=base(w,d,me);
  try{if(L&&M&&M.status==='done'&&was!=='done'){const A=ONLC.agree(M.reports||{});
    for(const [a,out] of Object.entries(M.outs||{})){if(before.has(a))continue;const i=L.players.findIndex(p=>p.id===a);const ch=i>=0&&w.chars[L.players[i].char];const D=ch&&mockDomus82(w,ch.domus);
      if(D)ONLC.domusNote(D,(A.table||[]).find(x=>x.seat===i)||{},out,!!L.ranked)}
    if(!A.void)for(const s of L.stands||[])if(s.pass&&!(M.dropped||{})[s.id]&&!(M.abandoned||{})[s.id]&&!(M.left||{})[s.id]){const D=mockDomus82(w,(w.accounts[s.id]||{}).domus);if(D){D.fame=(D.fame|0)+PASS82.fame;s.fame=PASS82.fame}}}}catch(e){console.error(e)}
  return r}}
{const base=MOCK_ROUTES['match.abandon'];MOCK_ROUTES['match.abandon']=(w,d,me)=>{const r=base(w,d,me);try{if(r&&r.out){const L=w.lobbies[d.id];const p=L&&L.players.find(x=>x.id===me);const ch=p&&w.chars[p.char];const D=ch&&mockDomus82(w,ch.domus);if(D)ONLC.domusNote(D,{won:false},r.out,true)}}catch(e){}return r}}

/* =========================== THE CLIENT =========================== */
/* ---------------- guests ---------------- */
async function onlGuestRefresh82(){try{if(NET.mode==='aws')await netPick();
    const g=await NET.req('auth.guest',{tz:onlTz80()});ONL.acct={id:g.id,name:'Guest',guest:true};ONL82.until=g.until||ONL82.until;
    const h=await NET.req('hello',{all:1});ONL.lobbies=h.lobbies||[];ONL.news=h.news||[];ONL.stats={challenges:h.challenges||[],online:(h.here||{}).n||h.online||0};ONL.chars=[];ONL.char=null;ONL.party=null;ONL.needDomus=false;ONL82.expired=false}
  catch(e){if(e&&e.code==='guest_expired'){ONL82.expired=true;ONL.acct={id:'guest-'+onlGuestId82(),name:'Guest',guest:true};ONL.chars=[];ONL.char=null}else ONL.err=e.message}}
{const base=onlRefresh;onlRefresh=async function(){if(onlGuestOn82())return onlGuestRefresh82();const r=await base.apply(this,arguments);if(ONL.needDomus)ONL.newGlad=false;return r}}
const GUEST_ACTS82=new Set(['tab','refresh','watch','omap','quiet','wwatch','uwatch','cryx','ino','wx','google','mocksign','srvset','srvclear']);
const GWHY82={quick:'fight in a playlist',join:'join a room',take:'take a seat',mkroom:'open a room',newgame:'open a room',ticket:'buy a ticket',bet:'wager',betgo:'wager',fsay:'speak in the Forum',
  who:'see who is here',gnew:'raise gladiators',pinvite:'form a party',pjoin:'join a party',rejoin:'fight',enter:'fight',leave:'leave a room',buy:'buy gear'};
function onlGuestLeft82(){const ms=Math.max(0,ONL82.until-onlNow82());const m=Math.ceil(ms/60000);return m>=60?`${Math.floor(m/60)} h ${m%60} min`:`${m} min`}
function onlGuestCard82(){return `<div class="card2 onl-noglad g82card"><div class="onl-ngfig">👁</div><div><b>Watching as a guest</b><p class="rc-sub" style="margin:4px 0 8px">Live bouts, the Forum, Today and the Hall are open for <b id="g82left">${onlGuestLeft82()}</b>. Sign in to found a house, raise gladiators, wager and fight.</p>
  <button type="button" class="btn primary" data-onl82="gsignin">Sign in</button></div></div>`}
function onlGuestHTML82(){const tabs=[['play','⚔ Play'],['lobby','📜 Lobby Browser'],['spect','👁 Spectate'],['hall','🪦 Hall of the Fallen']];if(!tabs.some(t=>t[0]===ONL.tab))ONL.tab='play';
  const exp=ONL82.expired||(ONL82.until&&onlNow82()>ONL82.until);
  const main=exp?`<div class="onl-sign"><div class="onl-sign-card"><h2>⌛ Your two hours as a guest are up</h2><p>Sign in to keep watching — and to found a house of your own.</p><button type="button" class="btn primary" data-onl82="gsignin">Sign in</button></div></div>`
    :({play:onlPlayHTML,lobby:onlLobbyHTML,spect:onlSpectHTML,hall:onlHallHTML}[ONL.tab])();
  const h=`<div class="onl-wrap g82"><nav class="onl-rail">${tabs.map(([k,l])=>`<button type="button" data-onl="tab" data-v="${k}" class="${ONL.tab===k?'on':''}">${l}</button>`).join('')}
    <div class="onl-acct"><span>👁 Guest</span><small>${exp?'time is up':`${onlGuestLeft82()} left`}</small><button type="button" class="btn tksm primary" data-onl82="gsignin">Sign in</button></div></nav><main class="onl-main">${main}</main></div>`;
  return h.replace(/data-onl="([\w-]+)"/g,(m,a)=>GUEST_ACTS82.has(a)?m:`data-g82="${a}" aria-disabled="true" title="Sign in to ${GWHY82[a]||'play'}"`)}
{const base=onlNoGladHTML;onlNoGladHTML=function(){return onlIsGuest82()?onlGuestCard82():base.apply(this,arguments)}}
{const base=onlSignInHTML;onlSignInHTML=function(){const h=base.apply(this,arguments);const g=`<div class="g82in"><button type="button" class="btn" data-onl82="guest">👁 Watch as a guest</button><small class="rc-sub">No sign-in: watch live bouts and read the Forum, Today and the Hall for two hours.</small></div>`;
  const i=h.lastIndexOf('</div></div>');return i<0?h+g:h.slice(0,i)+g+h.slice(i)}}
async function onlGuestStart82(){onlGuestSet82(true);onlGuestId82();ONL.tab='play';await onlGuestRefresh82();onlRedraw()}
async function onlSignIn82(){onlGuestSet82(false);ONL.acct=null;ONL82.expired=false;try{if(NET.mode==='aws'){NETWS.close();await netPick();if(!(NETWS.cfg&&NETWS.cfg.dev))return netSignIn()}}catch(e){}onlRedraw()}
/* the hours run out while the window is up */
setInterval(()=>{try{if(!onlIsGuest82()||!ONL82.until)return;const el=document.getElementById('g82left');if(el)el.textContent=onlGuestLeft82();
  if(onlNow82()>ONL82.until&&!ONL82.gnote){ONL82.gnote=1;ONL82.expired=true;onlToast80('⌛ Your two hours as a guest are up — sign in to keep watching.');if(document.getElementById('onl'))onlRedraw()}}catch(e){}},15000);
/* the map: guests glow apart; the count names them */
{const base=onlCap80;onlCap80=function(){const H=ONLF.here||{};const n=H.n|0,g=H.guests|0;return `<b>${n}</b> lanista${n===1?'':'s'} · <b>${g}</b> guest${g===1?'':'s'} · ${H.fight|0} fighting · ${H.wait|0} waiting`}}
{const base=onlDots80;onlDots80=function(k){const z=(ONLF.here||{}).gzones||{};let h=base.apply(this,arguments);
  for(const [tz,c] of Object.entries(z)){const xy=typeof onlTzXY==='function'?onlTzXY(tz):null;if(!xy)continue;const s=(8+Math.sqrt(c|0)*7)*k;
    h+=`<i class="omap-dot g82" style="left:${(xy[0]*100+0.8).toFixed(2)}%;top:${Math.max(1.5,Math.min(98.5,xy[1]*100+1)).toFixed(2)}%;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px"></i>`}return h}}

/* ---------------- 🏛 Found your house ---------------- */
const GENS82=['Vettii','Aemilii','Cornelii','Iunii','Licinii','Valerii','Fabii','Claudii','Sempronii','Domitii','Antonii','Caecilii','Sulpicii','Postumii','Marcii','Calpurnii'];
function onlFoundHTML82(full){const live=(ONL.chars||[]).length;
  const card=`<div class="card2 dom82-found"><div class="dom82-crest">🏛</div><div class="dom82-fb"><h2>Found your house</h2>
    <p>Every lanista online keeps a <b>Domus</b>. Its name stands beside your gladiators’ names — in rooms, invitations and the Forum.${live?` Your ${live} gladiator${live===1?'':'s'} join${live===1?'s':''} it with their record.`:''}</p>
    <div class="dom82-row"><input class="tin" id="dom82Name" maxlength="${ONLC.DOMUS_MAX}" placeholder="e.g. Vettii" value="${esc2(ONL82.draft||'')}"><button type="button" class="btn" data-onl82="dice" title="A Roman house name">🎲</button><button type="button" class="btn primary" data-onl82="found">🏛 Found the house</button></div>
    <small class="rc-sub">${ONLC.DOMUS_MIN}–${ONLC.DOMUS_MAX} letters · no two houses share a name · it can change only until your first gladiator.</small><div class="pat82found">${onlPatronHTML82()}</div>${ONL82.ferr?`<p class="onl-err">${esc2(ONL82.ferr)}</p>`:''}</div></div>`;
  let h=full.replace(/data-onl="([\w-]+)"/g,(m,a)=>a==='signout'||a==='google'?m:`data-d82="${a}" aria-disabled="true" title="Found your house first"`);
  const a=h.indexOf('<main class="onl-main">');const b=h.lastIndexOf('</main>');if(a<0||b<0)return card+h;
  return h.slice(0,a)+'<main class="onl-main">'+card+'<div class="dom82-grey" aria-disabled="true" title="Found your house first">'+h.slice(a+23,b)+'</div>'+h.slice(b)}
{const base=onlHTML;onlHTML=function(){if(onlIsGuest82())return onlGuestHTML82();
  if(ONL.acct&&ONL.needDomus){ONL.newGlad=false;const keep=ONL.tab;if(ONL.tab==='char'||ONL.tab==='armory')ONL.tab='play';let h;try{h=base.apply(this,arguments)}finally{ONL.tab=keep}return onlFoundHTML82(h.replace('>🛡 My Gladiators<','>🏛 Domus<'))}
  return base.apply(this,arguments).replace('>🛡 My Gladiators<','>🏛 Domus<').replace('set in 🛡 My Gladiators','set in 🏛 Domus')}}

/* ---------------- the house beside names (rooms, lobby rows, the Forum) ---------------- */
let MK82=[];const mk82=(name,id)=>{if(!id||!onlDomOf82(id))return name;if(MK82.length>4000)MK82=[];return `${name}⟦${MK82.push(id)-1}⟧`};
function unmk82(h){h=String(h).replace(/<[^>]*>/g,tag=>tag.replace(/⟦(\d+)⟧/g,(m,i)=>{const d=onlDomOf82(MK82[+i]);return d?' · '+esc2(onlHouse82(d)):''}));return h.replace(/⟦(\d+)⟧/g,(m,i)=>onlDomChip82(onlDomOf82(MK82[+i])))}
const onlNameDom82=(name,id)=>{const d=onlDomOf82(id);return d?`${name} · ${onlHouse82(d)}`:name};
function onlMarkRoom82(L){if(!L)return L;const y={...L,players:(L.players||[]).map(p=>({...p,name:mk82(p.name,p.id)})),members:(L.members||[]).map(m=>({...m,name:mk82(m.name,m.id)}))};
  if(L.host)y.host={...L.host,name:mk82(L.host.name,L.host.id)};return y}
{const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){let h=unmk82(base.call(this,onlMarkRoom82(L),grey));
  try{const host=L.host&&ONL.acct&&L.host.id===ONL.acct.id;
    /* table size: fewer lanistas, smaller rewards */
    const n=(L.players||[]).length;if(L.status==='waiting'&&n>=2&&n<4){const tx=`<p class="tbl82">⚖ ${n===2?'2 lanistas: half rewards':'3 lanistas: three-quarter rewards'} · seat 4 for the full purse</p>`;h=h.replace('<div class="acts r80-go">',tx+'<div class="acts r80-go">')}
    if(L.status==='waiting'){if(host&&!grey){h=h.replace(/(<select class="tin" data-onlrs="ticket"[^>]*>)([\s\S]*?)(<\/select>)/,(m,a,o,c)=>a+(L.free?o.replace(' selected',''):o)+`<option value="free" ${L.free?'selected':''}>free</option>`+c)}
      else if(L.free)h=h.replace('Ticket: none','Ticket: free')}}catch(e){}return h}}
{const base=onlLobbyHTML;onlLobbyHTML=function(){const keep=ONL.lobbies;ONL.lobbies=(keep||[]).map(onlMarkRoom82);let h;try{h=base.apply(this,arguments)}finally{ONL.lobbies=keep}h=unmk82(h);
  if(!onlIsGuest82())for(const L of keep||[])if(L.free&&L.status==='waiting'&&!L.ticket&&!(L.stands||[]).some(s=>s.id===onlMe80())&&!(L.members||[]).some(m=>m.id===onlMe80())){const id=String(L.id).replace(/[^\w-]/g,'');
    h=h.replace(new RegExp(`(data-row="${id}">[\\s\\S]*?<td class="acts">)`),`$1<button type="button" class="btn tksm" data-onl="ticket" data-v="${id}" title="A free seat in the stands until the horns">🎟 Free</button>`)}return h}}
{const base=onlSpectHTML;onlSpectHTML=function(){const keep=ONL.lobbies;ONL.lobbies=(keep||[]).map(L=>L.free&&!L.ticket?{...L,ticket:'free'}:L);try{return base.apply(this,arguments)}finally{ONL.lobbies=keep}}}
{const base=onlFeedHTML80;onlFeedHTML80=function(){const kl=ONLF.lines,kc=ONLF.local;const m=l=>({...l,name:l.name?mk82(l.name,l.by):l.name,from:l.from?mk82(l.from,l.by):l.from});
  ONLF.lines=(kl||[]).map(m);ONLF.local=(kc||[]).map(m);try{return unmk82(base.apply(this,arguments))}finally{ONLF.lines=kl;ONLF.local=kc}}}
{const base=onlInvitePop80;onlInvitePop80=function(it){return base.call(this,it&&{...it,from:onlNameDom82(it.from,it.fromId)})}}
{const base=onlCryBanner80;onlCryBanner80=function(l){return base.call(this,l&&{...l,name:onlNameDom82(l.name,l.by)})}}
{const base=onlWho80;onlWho80=async function(){const r=await base.apply(this,arguments);try{for(const row of document.querySelectorAll('.w80r[data-who]')){const b=row.querySelector('b');const d=onlDomOf82(row.dataset.who);if(b&&d&&!row.querySelector('.dom82c'))b.insertAdjacentHTML('afterend',onlDomChip82(d))}}catch(e){}return r}}
/* the stage: the house under the gladiator's name; Glory and the next rank */
{const base=onlStageHTML;onlStageHTML=function(ch){let h=base.apply(this,arguments);const d=onlMyDomus82();
  if(d)h=h.replace(/(<div class="onl-pname">[^<]*<\/div>)/,`$1<div class="dom82-pl">🏛 ${esc2(onlHouse82(d))}</div>`);
  const N=ONLC.nextRank(ch);const g=Math.round(ONLC.gloryOf(ch));h=h.replace(/<small>Next: [^<]*<\/small>/,N?`<small>Next: ${esc2(N.n)} at ${N.glory} Glory · now ${g}</small>`:`<small>${g} Glory</small>`);return h}}

/* ---------------- 🏛 the Domus screen ---------------- */
function onlDomusLoad82(){if(Date.now()-ONL82.dgAt<20000||!ONL.acct||onlIsGuest82())return;ONL82.dgAt=Date.now();const k0=JSON.stringify([ONL.domus,ONL82.rc]);
  NET.req('domus.get',{}).then(()=>NET.req('world.news',{})).then(()=>{if(ONL.tab==='char'&&document.getElementById('onl')&&JSON.stringify([ONL.domus,ONL82.rc])!==k0&&!onlFocus80())onlRedraw()}).catch(()=>{})}
function onlRankBar82(){const R=ONLC.RANKS;const rc=ONL82.rc||{};const live=(ONL.chars||[]).filter(c=>c.alive);const act=ONL.char;const top=R[R.length-1].glory*1.3;
  /* each rank owns an equal band; a gladiator sits inside its band by Glory */
  const pos=c=>{const g=ONLC.gloryOf(c);const i=ONLC.rankIdx(ONLC.rankFor(c).k);const lo=R[i].glory,hi=(R[i+1]||{glory:top}).glory;return Math.max(0,Math.min(99,(i+Math.max(0,Math.min(1,(g-lo)/Math.max(1,hi-lo))))/R.length*100))};
  const fill=act?pos(act):0;
  const bands=R.map((r,i)=>`<div class="rb82-band" style="--b:${i}"><b>${r.ic} ${esc2(r.n)}</b><small>${r.glory} Glory</small><span class="rb82-n" title="Living gladiators at this rank, every house">● ${rc[r.k]|0} living</span></div>`).reverse().join('');
  /* tokens close together step aside (left/right) so none hides another */
  const pl=live.map(c=>({c,p:Math.max(3,pos(c))})).sort((a,b)=>a.p-b.p);let run=0;pl.forEach((x,i)=>{run=i&&x.p-pl[i-1].p<6?run+1:0;x.dx=[0,-15,15,-30,30][run%5]});
  const toks=pl.map(({c,p,dx})=>`<span class="rb82-tok ${act&&c.id===act.id?'act':''}" style="--p:${p.toFixed(1)};--dx:${dx}px" title="${esc2(c.name)} · ${Math.round(ONLC.gloryOf(c))} Glory">${onlFig(c.cls,c.look,34)}<i>${Math.round(ONLC.gloryOf(c))}</i></span>`).join('');
  return `<aside class="rb82" aria-label="Ranks by Glory"><div class="rb82-h">Glory</div><div class="rb82-body"><div class="rb82-bands">${bands}</div><div class="rb82-tube"><i style="--p:${fill.toFixed(1)}"></i>${toks}</div></div></aside>`}
function onlDomusHTML82(){onlDomusLoad82();const D=ONL.domus||{};const G=ONL82.dg||{};const glads=Math.max(D.glads|0,G.glads|0,(ONL.chars||[]).length);const locked=glads>0;const W=onlW81();
  const rec=[['Bouts',D.bouts|0],['Won',D.wins|0],['Survived',D.survived|0],['Fallen',D.fallen|0],['Lifetime CF',`${W} ${D.lifeCF|0}`],['Fame',`✦ ${D.fame|0}`],['Purses',`${typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙'} ${(ONL.chars||[]).filter(c=>c.alive).reduce((t,c)=>t+((ONL.char&&c.id===ONL.char.id?ONL.char:c).wallet|0),0)}`]];
  const since=D.founded?new Date(D.founded).toLocaleDateString():'';
  return `<div class="dom82"><div class="dom82-head"><div class="dom82-crest">🏛</div><div class="dom82-ttl"><h3>${esc2(onlHouse82(D.name||''))}</h3><small class="rc-sub">${since?`founded ${esc2(since)} · `:''}${glads} gladiator${glads===1?'':'s'} raised</small></div></div>
   <div class="dom82-rec">${rec.map(([k,v])=>`<div><b>${v}</b><small>${k}</small></div>`).join('')}</div>
   ${locked?`<p class="rc-sub dom82-lock">🔒 A house with gladiators keeps its name.</p>`:`<div class="dom82-row"><input class="tin" id="dom82Ren" maxlength="${ONLC.DOMUS_MAX}" value="${esc2(D.name||'')}"><button type="button" class="btn" data-onl82="drename">✎ Rename</button><button type="button" class="btn" data-onl82="dnew" title="The old house is archived with its record">🏛 Found a new house</button></div><small class="rc-sub">Only until your first gladiator.</small>`}
   ${ONL82.ferr&&ONL.tab==='char'?`<p class="onl-err">${esc2(ONL82.ferr)}</p>`:''}${`<details class="pat82d" ${ONL82.patOpen?'open':''}><summary>✎ Patron <small class="rc-sub">your seat in the stands</small></summary>${onlPatronHTML82()}</details>`}</div>`}
{const base=onlCharHTML;onlCharHTML=function(){let g=base.apply(this,arguments).replace('🛡 My Gladiators','⚔ Gladiators');
  for(const c of ONL.chars||[])g=g.replace(`<b>${esc2(c.name)}</b><small>`,`<b>${esc2(c.name)}</b><small class="gl82">✦ ${Math.round(ONLC.gloryOf(c))} Glory</small><small>`);
  return `<div class="dom82-wrap"><div class="dom82-main">${onlDomusHTML82()}${g}${onlStoreHTML82()}</div>${onlRankBar82()}</div>`}}

/* ---------------- 🗄 the Storeroom: every piece the house owns ---------------- */
function onlBusy82(){const me=onlMe80();const out=new Set((ONL82.dg&&ONL82.dg.busy)||[]);for(const L of ONL.lobbies||[])if(L.status==='waiting'||L.status==='live')for(const p of L.players||[])if(p.id===me&&p.char)out.add(p.char);return out}
function onlStoreHTML82(){if(!ONL.acct||onlIsGuest82())return '';const cat=onlCatalog();const live=(ONL.chars||[]).map(c=>ONL.char&&c.id===ONL.char.id?ONL.char:c).filter(c=>c.alive).sort((a,b)=>a.born-b.born);const busy=onlBusy82();const sel=ONL82.srSel||'all';
  const house={house:true,name:onlHouse82(onlMyDomus82()||'the house'),gear:(ONL82.dg&&ONL82.dg.gear)||[]};const rows=[];
  for(const c of live){const eq=ONLC.equipOf(c).slice();for(const k of c.gear||[]){const i=eq.indexOf(k);const on=i>=0;if(on)eq.splice(i,1);rows.push({k,o:c,on})}}
  for(const k of house.gear)rows.push({k,o:house,on:false});
  const shown=rows.filter(r=>sel==='all'||(sel==='house'?r.o.house:r.o.id===sel));
  const chip=(v,l,n)=>`<button type="button" class="sr82-chip ${sel===v?'on':''}" data-onl82="srsel" data-v="${esc2(v)}">${l} <small>${n}</small></button>`;
  const dest=r=>[...live.filter(c=>c!==r.o).map(c=>{const why=busy.has(c.id)?'in a match':ONLC.gearMoveWhy({gear:[r.k]},c,r.k,cat);return `<option value="${esc2(c.id)}" ${why?'disabled':''}>→ ${esc2(c.name)}${why?` (${esc2(why.replace(/\.$/,''))})`:''}</option>`}),r.o.house?'':'<option value="house">→ the storeroom shelf</option>'].join('');
  const row=r=>{const it=cat[r.k]||{n:r.k,lv:'?'};const lock=!r.o.house&&busy.has(r.o.id);const art=typeof cardHTML==='function'?cardHTML((it.kind==='w'?'w:':'a:')+r.k,'sm'):'';const from=r.o.house?'house':r.o.id;
    return `<div class="sr82-it ${lock?'lock':''}" data-sr82="${esc2(r.k)}"><div class="sr82-art">${art}</div><div class="sr82-b"><b>${esc2(it.n)}</b><small>Level ${it.lv}${it.kind==='a'?` · ${it.ap|0} AP`:''}</small>
      <small class="sr82-who">${r.o.house?'🗄 on the shelf':`with <b>${esc2(r.o.name)}</b>`}</small>${lock?'<small class="sr82-lk">🔒 In a match</small>':''}</div>
      <div class="sr82-c">${r.o.house?'':`<label class="chk"><input type="checkbox" data-sr82eq="${esc2(r.o.id)}|${esc2(r.k)}" ${r.on?'checked':''} ${lock?'disabled':''}> Bring</label>`}
      <select class="tin" data-sr82mv="${esc2(from)}|${esc2(r.k)}" ${lock?'disabled':''}><option value="">Move…</option>${dest(r)}</select></div></div>`};
  return `<div class="sr82" id="sr82"><div class="onl-lbtop"><h3>🗄 Storeroom <span class="rc-sub">${rows.length} piece${rows.length===1?'':'s'} · tick to bring · move between your gladiators</span></h3></div>
   <div class="sr82-chips">${chip('all','All',rows.length)}${live.map(c=>chip(c.id,`${busy.has(c.id)?'🔒 ':''}${esc2(c.name)}`,rows.filter(r=>r.o===c).length)).join('')}${chip('house','🗄 Shelf',house.gear.length)}</div>
   <div class="sr82-grid">${shown.map(row).join('')||'<p class="rc-sub">Nothing here yet — the Armory sells to your gladiators.</p>'}</div></div>`}
async function onlStoreAfter82(r){if(r&&r.from&&r.from.cls)onlCharPut82(r.from);if(r&&r.to&&r.to.cls)onlCharPut82(r.to);if(r&&r.cls)onlCharPut82(r);ONL82.dgAt=0;try{await NET.req('domus.get',{})}catch(e){}ONL82.dgAt=Date.now()}
function onlCharPut82(c){const i=(ONL.chars||[]).findIndex(x=>x.id===c.id);if(i>=0)ONL.chars[i]=c;if(ONL.char&&ONL.char.id===c.id)ONL.char=c;if(ONL.ged&&ONL.ged.id===c.id)ONL.ged=null}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;
  if(t.dataset.sr82eq){const [cid,item]=t.dataset.sr82eq.split('|');e.stopPropagation();return onlDo(async()=>{await onlStoreAfter82(await NET.req('domus.equip',{char:cid,item,on:t.checked}))})}
  if(t.dataset.sr82mv&&t.value){const [from,item]=t.dataset.sr82mv.split('|');const to=t.value;e.stopPropagation();return onlDo(async()=>{const r=await NET.req('domus.move',{item,from,to});await onlStoreAfter82(r);
    const nm=to==='house'?'the shelf':((ONL.chars||[]).find(c=>c.id===to)||{}).name;onlToast80(`🗄 ${esc2((onlCatalog()[item]||{}).n||item)} → ${esc2(nm||'')}`)})}},true);

/* ---------------- the patron (the stands' face) ---------------- */
const PAT82_KEY='flavius_patron82.';const PAT_COL82=['#7a2230','#2f4a6b','#3f5a3a','#a86a2a','#4b2a5a','#8a3b1c','#35606a','#c9b27a','#5a4636','#1e5a8a','#8e2a22','#6b7a32'];
function onlPatronDef82(id,domus){const h=onlH32(id||'x'),k=onlH32(domus||id||'y');return {skin:SKINS[h%SKINS.length],hair:HAIRS[(h>>>4)%10],beard:!!((h>>>9)&1),long:!!((h>>>10)&1)&&!((h>>>9)&1),hat:['','','pileus','straw','hood'][(h>>>11)%5],
  tunic:'#e8dcc0',robe:PAT_COL82[k%PAT_COL82.length],c1:PAT_COL82[k%PAT_COL82.length],c2:PAT_COL82[(k>>>5)%PAT_COL82.length]===PAT_COL82[k%PAT_COL82.length]?'#d6ab4c':PAT_COL82[(k>>>5)%PAT_COL82.length]}}
/* the look: the house's saved patron (domus.patron; others' from their stands entries), else the generated one. Your own screen shows
   the editor's unsaved draft (localStorage) until the server has it. */
function onlPatronDraft82(id){try{const x=JSON.parse(localStorage.getItem(PAT82_KEY+id)||'null');return x&&typeof x==='object'?x:null}catch(e){return null}}
function onlPatronGet82(id,domus){const d=onlPatronDef82(id,domus);if(!id)return d;let x=(ONL82.pat||{})[id]||null;
  if(ONL.acct&&id===ONL.acct.id)x=onlPatronDraft82(id)||(ONL.domus&&ONL.domus.patron)||x;return x?{...d,...x}:d}
/* keep the draft, save it to the house a moment later (p null = back to the generated default) */
function onlPatronPut82(p){const id=ONL.acct&&ONL.acct.id;if(!id)return;try{if(p)localStorage.setItem(PAT82_KEY+id,JSON.stringify(p));else localStorage.removeItem(PAT82_KEY+id)}catch(e){}
  if(onlIsGuest82()||ONL.needDomus)return;clearTimeout(ONL82.patT);ONL82.patT=setTimeout(async()=>{try{const r=await NET.req('domus.patron',{look:p||null});if(r&&r.domus){ONL.domus=r.domus;(ONL82.pat=ONL82.pat||{})[id]=r.domus.patron||null;
      const now=onlPatronDraft82(id);if(!p||JSON.stringify(now)===JSON.stringify(p))localStorage.removeItem(PAT82_KEY+id)}}catch(e){}},p?600:0)}
function onlPatronFace82(p,sz){return specFaceSVG(p).replace('width="20" height="20"',`width="${sz}" height="${sz}"`)}
function onlCushion82(p,w){return `<svg width="${w}" height="${Math.round(w*.42)}" viewBox="0 0 50 21" aria-hidden="true"><ellipse cx="25" cy="11" rx="23" ry="9" fill="${p.c1}" stroke="rgba(0,0,0,.45)"/><path d="M4 11h42" stroke="${p.c2}" stroke-width="3"/><circle cx="25" cy="11" r="2.4" fill="${p.c2}"/></svg>`}
function onlPatronHTML82(){if(!ONL.acct)return '';const d=onlMyDomus82();const p=onlPatronGet82(ONL.acct.id,d);const sel=(f,opts,v)=>`<select class="tin" data-pat82="${f}">${opts.map(([x,l])=>`<option value="${esc2(x)}" ${String(v||'')===String(x)?'selected':''}>${esc2(l)}</option>`).join('')}</select>`;
  const col=(f,l)=>`<label>${l}<input type="color" data-pat82="${f}" value="${esc2(p[f])}"></label>`;
  return `<div class="pat82"><div class="pat82-prev" id="pat82Prev">${onlPatronFace82(p,72)}${onlCushion82(p,70)}</div><div class="pat82-f"><b>Your patron</b> <small class="rc-sub">sits in the stands when you hold a ticket — “${esc2(onlPatronName82('',d))}”</small>
    <div class="formgrid pat82-g"><label>Skin${sel('skin',SKINS.map((v,i)=>[v,(typeof SKIN_NAMES!=='undefined'&&SKIN_NAMES[i])||'Tone '+(i+1)]),p.skin)}</label><label>Hair${sel('hair',HAIRS.map((v,i)=>[v,(typeof HAIR_NAMES!=='undefined'&&HAIR_NAMES[i])||'Shade '+(i+1)]),p.hair)}</label>
     <label>Hat${sel('hat',[['','None'],...Object.keys(SPEC_HATS).map(k=>[k,k[0].toUpperCase()+k.slice(1)])],p.hat)}</label><label>Beard${sel('beard',[['','No'],['1','Yes']],p.beard?'1':'')}</label>
     ${col('tunic','Tunic')}${col('robe','Mantle')}${col('c1','Cushion')}${col('c2','Cushion trim')}</div>
    <div class="mbtns"><button type="button" class="btn tksm" data-onl82="prand">🎲 New patron</button><button type="button" class="btn tksm" data-onl82="pdef">↺ The house default</button></div></div></div>`}
function onlPatronPrev82(){const el=document.getElementById('pat82Prev');if(!el||!ONL.acct)return;const p=onlPatronGet82(ONL.acct.id,onlMyDomus82());el.innerHTML=onlPatronFace82(p,72)+onlCushion82(p,70)}
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.pat82==null||!ONL.acct)return;const p=onlPatronGet82(ONL.acct.id,onlMyDomus82());const f=t.dataset.pat82;p[f]=f==='beard'?!!t.value:t.value;onlPatronPut82(p);onlPatronPrev82()},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.pat82!=null)t.dispatchEvent(new Event('input',{bubbles:true}))},true);

/* ---------------- 🛒 the Armory: prices by level (weapons) and AP (armor), a confirmation ---------------- */
{const base=onlArmoryHTML;onlArmoryHTML=function(){const ch=ONL.char;if(!ch||onlIsGuest82())return base.apply(this,arguments);const R=ONLC.rankFor(ch);const cat=onlCatalog();const f=ONL.mkt||'w';const coin=typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙';
  const items=Object.entries(cat).filter(([k,it])=>it.kind===f).sort((a,b)=>a[1].lv-b[1].lv||ONLC.priceOf(a[1])-ONLC.priceOf(b[1])||a[1].n.localeCompare(b[1].n));
  return `<div class="onl-lbtop"><h3>🛒 Armory &amp; Market</h3><div class="rc-sub">Wallet ${coin} <b>${ch.wallet}</b> · ${esc2(R.n)} buys up to level ${R.mkt} · weapons ${ONLC.PRICE[1]} / ${ONLC.PRICE[2]} / ${ONLC.PRICE[3]} · armor ${ONLC.PRICE_AP[1]} / ${ONLC.PRICE_AP[2]} / ${ONLC.PRICE_AP[3]} a point of AP</div></div>
   <div class="seg" style="margin-bottom:8px"><button type="button" data-onl="mkt" data-v="w" class="${f==='w'?'on':''}">⚔ Weapons</button><button type="button" data-onl="mkt" data-v="a" class="${f==='a'?'on':''}">🛡 Armor</button></div>
   <div class="onl-mkgrid">${items.map(([k,it])=>{const why=ONLC.canBuy(ch,k,cat);const own=(ch.gear||[]).includes(k);const art=typeof cardHTML==='function'?cardHTML((it.kind==='w'?'w:':'a:')+k,'sm'):'';const pr=ONLC.priceOf(it);
     return `<div class="onl-it ${why&&!own?'no':''} ${own?'own':''}" data-it82="${k}">${art}<b>${esc2(it.n)}</b><small>Level ${it.lv}${it.kind==='a'?` · ${it.ap|0} AP`:''} · <b class="pr82">${pr} coin</b></small>${own&&!it.stack?'<span class="badge gold">Yours</span>':`<button type="button" class="btn tksm ${why?'':'primary'}" data-onl82="buy" data-v="${k}" ${why?`disabled title="${esc2(why)}"`:''}>Buy · ${pr}</button>`}</div>`}).join('')}</div>`}}

/* ---------------- the result: the flat award ---------------- */
onlSettled=function(res){if(res.char)ONL.char=res.char.alive?res.char:null;const o=res.out;const P=ONL82.pre||{};let msg;const W=onlW81();
  if(res.void)msg='⚖ The lanistas did not agree on the result — the match is void: no pay, no deaths.';
  else if(!o)msg='⚖ The match is settled.';
  else if(o.died)msg=o.hall?`🪦 <b>${esc2(res.char.name)}</b> is dead. The Hall of the Fallen keeps the name.`:`🌫 <b>${esc2(res.char.name)}</b> is dead — and forgotten.`;
  else{const up=o.rankUp?` · ⚔ now <b>${esc2(onlRank(o.rankUp).n)}</b>`:'';const gl=o.glory!=null?` · ✦ +${o.glory} Glory`:'';const f=o.factor!=null?o.factor:1;const tb=f<1?` · ${f===0.5?'half':'¾'} for a small table`:'';
    if(P.ranked===false||(!o.pay&&P.ranked!==true))msg=`⚖ Custom bout — no purse · ${W} +${o.cf} lifetime CF${gl}${tb}${up}`;
    else{const rk=P.rank||'tiro';const st=P.streak|0;const aw=o.award!=null?o.award:o.pay;const won=aw===Math.round(ONLC.awardOf(rk,true,st)*f)&&aw!==Math.round(ONLC.awardOf(rk,false,st)*f); /* v0.83: the award before the house's cut */
      msg=`💰 +${o.pay} coin <small>(${esc2(onlRank(rk).n)} ${ONLC.AWARD[rk]}${won?' · win +50%':''}${st?` · ${st} in a row +${Math.min(100,st*10)}%`:''}${f<1?` · ${f===0.5?'×½':'×¾'} table`:''})</small> · ${W} +${o.cf} lifetime CF${gl}${up}`}}
  setTimeout(()=>onlToast80(msg),2500)};
/* the rank and streak at the horns, for the award line */
function onlPre82(L){try{const me=ONL.acct&&ONL.acct.id;const p=L&&(L.players||[]).find(x=>x.id===me);const ch=(ONL.chars||[]).find(c=>p&&c.id===p.char)||ONL.char;
  if(p&&ch)ONL82.pre={id:L.id,ranked:!!L.ranked,rank:ONLC.rankFor(ch).k,streak:ch.streak|0}}catch(e){}}

/* ---------------- 🎟 the patrons in the stands ---------------- */
function onlStandsNamed82(L){if(!L||!(L.stands||[]).length)return L;for(const t of L.stands)if(t&&t.patron&&t.id)(ONL82.pat=ONL82.pat||{})[t.id]=t.patron;return {...L,stands:L.stands.map(t=>/^🎟/.test(t.name||'')?t:{...t,name:onlPatronName82(t.name,t.domus||onlDomOf82(t.id))})}}
{const base=onlEnter;onlEnter=function(L){onlPre82(L);return base.apply(this,[onlStandsNamed82(L)].concat([].slice.call(arguments,1)))}}
{const base=onlAttach;onlAttach=async function(L,role){if(role==='seat')onlPre82(L);return base.apply(this,[onlStandsNamed82(L)].concat([].slice.call(arguments,1)))}}
{const base=onlWatch;onlWatch=async function(L){return base.apply(this,[onlStandsNamed82(L)].concat([].slice.call(arguments,1)))}}
function onlPatronize82(){if(!S||!S.onl||!Array.isArray(S.spect))return;for(const s of S.spect){if(!s.ticket||!s.rid||!/^onl:/.test(s.rid))continue;const id=s.rid.slice(4);const d=onlDomOf82(id);
    if(!/^🎟/.test(s.name||''))s.name=onlPatronName82(s.name,d);const p=onlPatronGet82(id,d);if(!s.look||!s.look.pat82||(ONL.acct&&id===ONL.acct.id)||((ONL82.pat||{})[id]&&s.look.pat82!==2)){s.look={skin:p.skin,hair:p.hair,beard:p.beard,long:p.long,hat:p.hat,tunic:p.tunic,robe:p.robe,pat82:(ONL82.pat||{})[id]?2:1}}s.cush82=[p.c1,p.c2]}
  for(const t of S.onl.stands||[])if(!/^🎟/.test(t.name||''))t.name=onlPatronName82(t.name,onlDomOf82(t.id))}
{const base=onlSeatStands;onlSeatStands=function(onl){const r=base.apply(this,arguments);try{onlPatronize82()}catch(e){}return r}}
{const base=beginTurn;beginTurn=async function(){try{if(S&&S.onl)onlPatronize82()}catch(e){}return base.apply(this,arguments)}}
{const base=drawStands;drawStands=function(){const r=base.apply(this,arguments);try{if(S&&S.onl&&!HEADLESS)for(const sp of S.spect||[]){if(!sp.cush82||sp.gone||sp._x==null)continue;
  ctx.fillStyle=sp.cush82[0];ctx.beginPath();ctx.ellipse(sp._x,sp._y+TW*0.035,TW*0.14,TW*0.05,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=sp.cush82[1];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sp._x-TW*0.12,sp._y+TW*0.035);ctx.lineTo(sp._x+TW*0.12,sp._y+TW*0.035);ctx.stroke()}}catch(e){}return r}}
/* a ticket holder leaving the stands before the end tells the server (a guest pass then earns no Fame) */
{const base=onlExit;onlExit=function(){try{if(S&&S.onl&&!S.over&&S.onl.lobby&&S.onl.seat>=(S.onl.fighters||S.players.length)&&(S.onl.stands||[]).some(t=>ONL.acct&&t.id===ONL.acct.id))
  NET.req('match.unwatch',{id:S.onl.lobby}).catch(()=>{})}catch(e){}return base.apply(this,arguments)}}

/* ---------------- invitations die with the room ---------------- */
function onlInvGone82(rooms){const R=new Set(rooms||[]);if(!R.size)return;ONLF.invq=(ONLF.invq||[]).filter(x=>!R.has(x.row&&x.row.id));ONLF.local=(ONLF.local||[]).filter(l=>!(l.k==='inv'&&R.has((l.row||{}).id)));
  for(const r of R)ONL81.invRooms.delete(r);for(const p of document.querySelectorAll('.inv80bg'))if(R.has(p.dataset.room81)||[...R].some(r=>p.querySelector(`[data-v="${r}"]`)))p.remove();try{onlPatchFeed80()}catch(e){}}
NET.on('invite.gone',d=>{if(!d||!ONL.acct)return;onlInvGone82(d.rooms)});

/* ---------------- 🎟 Flavius's guest pass (the landing) ---------------- */
function onlPassRoom82(){if(onlIsGuest82()||!ONL.char||ONL.needDomus||(ONL.char.wallet|0)>=PASS82.wallet)return null;const D=ONL.domus||{};if(D.passDay&&D.passDay===onlDay82())return null;
  const me=onlMe80();const mine=onlMyLobby();if(mine)return null;
  return (ONL.lobbies||[]).find(L=>L.status==='waiting'&&!L.standsOff&&(L.ticket>0||L.free)&&(L.stands||[]).length<ONLC.STANDS_MAX&&!L.players.some(p=>p.id===me)&&!(L.members||[]).some(m=>m.id===me))||null}
function onlPassHTML82(){const L=onlPassRoom82();if(!L)return '';
  return `<div class="card2 pass82" id="pass82"><div class="pass82-t">🎟</div><div><b>Flavius's guest pass</b><div>A free seat in the stands at <b>${esc2(onlEvName(L.ev))}</b> · ${esc2(onlCityName(L.loc))} <span class="rc-sub">(${esc2(L.host.name)}’s room${L.free?'':` · ${L.ticket|0} coin for others`})</span></div>
    <small class="rc-sub">Once a day while your purse is thin. Sit through the bout: +${PASS82.fame} Fame for ${esc2(onlHouse82(onlMyDomus82()||'your house'))}.</small></div><button type="button" class="btn primary" data-onl82="pass" data-v="${esc2(L.id)}">🎟 Take the seat</button></div>`}
{const base=onlPlayHTML;onlPlayHTML=function(){const h=base.apply(this,arguments);const p=onlPassHTML82();if(!p)return h;const i=h.indexOf('<div class="onl-play');return i<0?p+h:h.slice(0,i)+p+h.slice(i)}}

/* ---------------- the controls ---------------- */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-onl82],#onl [data-g82],#onl [data-d82],.onl80pop [data-g82]');if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.g82){onlToast80(`👁 ${esc2(b.title||'Sign in to play.')} — <b>Sign in</b> on the left.`);return}
  if(b.dataset.d82){onlToast80('🏛 Found your house first — name it above.');const i=document.getElementById('dom82Name');if(i)i.focus();return}
  const a=b.dataset.onl82,v=b.dataset.v;
  if(a==='srsel'){ONL82.srSel=v;onlRedraw();return}
  if(a==='guest')return onlGuestStart82();
  if(a==='gsignin')return onlSignIn82();
  if(a==='dice'){const i=document.getElementById('dom82Name');const n=GENS82[Math.floor(Math.random()*GENS82.length)];if(i){i.value=n;ONL82.draft=n}return}
  if(a==='found'||a==='dnew'||a==='drename'){const i=document.getElementById(a==='found'?'dom82Name':'dom82Ren');const name=(i&&i.value||'').trim();ONL82.draft=name;
    const why=ONLC.domusWhy(name);if(why){ONL82.ferr=why;onlRedraw();return}
    return onlDo(async()=>{ONL82.ferr='';try{const r=await NET.req(a==='drename'?'domus.rename':'domus.create',{name});ONL.domus=r.domus;ONL.needDomus=false;ONL82.dgAt=0;ONL82.draft='';if(a==='found'){const dr=onlPatronDraft82(ONL.acct.id);if(dr)onlPatronPut82(dr)}
        await onlRefresh();const live=(ONL.chars||[]).filter(c=>c.alive).length;if(a==='found'&&!live){ONL.newGlad=true;ONL.creating=null}
        onlToast80(a==='drename'?`✎ Your house is now <b>${esc2(onlHouse82(r.domus.name))}</b>.`:`🏛 <b>${esc2(onlHouse82(r.domus.name))}</b> is founded${r.joined?` — ${r.joined} gladiator${r.joined===1?'':'s'} joined with their record`:live?'':' — now your first gladiator'}.`)}
      catch(err){ONL82.ferr=err.message;throw err}})}
  if(a==='prand'||a==='pdef'){if(!ONL.acct)return;if(a==='pdef')onlPatronPut82(null);else{const r=onlPatronDef82(ONL.acct.id+Math.random(),onlMyDomus82()+Math.random());onlPatronPut82(r)}onlRedraw();return}
  if(a==='buy'){const cat=onlCatalog();const it=cat[v];const ch=ONL.char;if(!it||!ch)return;const pr=ONLC.priceOf(it);
    return ask76('🛒 Buy this piece?',`<p style="margin:0">Buy <b>${esc2(it.n)}</b> (level ${it.lv}${it.kind==='a'?` · ${it.ap|0} AP`:''}) for <b>${pr} coin</b>?</p><p class="rc-sub" style="margin:6px 0 0">Wallet ${ch.wallet} → ${ch.wallet-pr}.</p>`,`Buy · ${pr}`,'Not now')
      .then(ok=>{if(ok)onlDo(async()=>{ONL.char=await NET.req('char.buy',{char:ch.id,item:v});onlCharPut82(ONL.char);onlToast80(`🛒 Bought ${esc2(it.n)} for ${pr} coin.`)})})}
  if(a==='pass')return onlDo(async()=>{const r=await NET.req('lobby.pass',{id:v});if(r.lobby)onlUpsert80(r.lobby);if(r.char)ONL.char=r.char;if(r.domus)ONL.domus=r.domus;
    onlToast80(`🎟 Flavius's guest pass — a free seat at ${esc2(onlCityName(r.lobby.loc))}. Sit through the bout for +${PASS82.fame} Fame.`)})},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='dom82Name'){e.preventDefault();const b=document.querySelector('[data-onl82="found"]');if(b)b.click()}},true);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='dom82Name')ONL82.draft=e.target.value},true);
/* the host's ticket select: "free" */
window.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('#onl select[data-onlrs="ticket"]'))return;const L=onlMyLobby();if(!L)return;
  if(t.value==='free'){e.stopImmediatePropagation();onlDo(async()=>{await onlReq80('lobby.set',{id:L.id,free:1})});return}
  if(L.free){e.stopImmediatePropagation();onlDo(async()=>{await onlReq80('lobby.set',{id:L.id,free:0,ticket:+t.value})})}},true);
/* the creator: the purse wording */
{const base=onlCreatorHTML;onlCreatorHTML=function(){return base.apply(this,arguments).replace('Earn coin and CF to rank up; buy gear between bouts.','Surviving Ranked bouts pays a purse by rank; Glory (CF, bouts survived, wins) raises the rank; buy gear between bouts.')}}

{const st=document.createElement('style');st.textContent=`
.g82in{display:grid;gap:4px;justify-items:center;margin-top:4px}.g82card .onl-ngfig{font-size:48px;display:grid;place-items:center;width:96px}
#onl [data-g82]{opacity:.55;cursor:not-allowed}#onl [data-d82]{cursor:not-allowed}#onl .onl-rail [data-d82]{opacity:.42}
.omap-dot.g82{background:radial-gradient(circle,rgba(170,215,255,.95) 0,rgba(110,170,240,.5) 30%,rgba(80,140,230,0) 70%)}
.dom82-found{display:flex;gap:16px;align-items:flex-start;padding:18px 20px;margin:0 0 14px;border:2px solid var(--gold,#e8c96a)!important;background:radial-gradient(ellipse at top left,rgba(232,201,106,.14),transparent 70%)}
.dom82-found h2{margin:0 0 4px;font:700 26px Georgia,serif;color:var(--gold,#e8c96a)}.dom82-fb{flex:1;min-width:0;display:grid;gap:8px}.dom82-fb p{margin:0}
.dom82-crest{font-size:46px;line-height:1;flex:none}.dom82-row{display:flex;gap:6px;flex-wrap:wrap}.dom82-row .tin{flex:1 1 200px;max-width:320px;font-size:16px}
.dom82-grey{filter:grayscale(.85);opacity:.38;pointer-events:none;user-select:none}
.dom82c{font:600 11.5px system-ui,sans-serif;color:#c9b07a;margin-left:4px;white-space:nowrap}.dom82-pl{font:600 14px Georgia,serif;color:#d9c08a;margin-top:-2px}
.dom82-wrap{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:16px;align-items:start}.dom82-main{min-width:0}
.dom82{display:grid;gap:8px;padding:12px 14px;margin:0 0 14px;border:1px solid #6b5636;border-radius:12px;background:linear-gradient(#2a2017,#1c150e)}
.dom82-head{display:flex;gap:12px;align-items:center}.dom82-head .dom82-crest{font-size:36px}.dom82-ttl h3{margin:0;font:700 24px Georgia,serif;color:var(--gold,#e8c96a)}
.dom82-rec{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.dom82-rec>div{display:grid;justify-items:center;padding:6px 4px;border:1px solid #4a3a26;border-radius:8px;text-align:center}
.dom82-rec b{font-size:17px;color:#fff}.dom82-rec b img,.dom82-rec b svg{height:15px;vertical-align:-2px}.dom82-rec small{font-size:11px;color:var(--muted)}.dom82-lock{margin:0}
.gl82{color:#e9c46a!important}
.pat82{display:flex;gap:14px;align-items:flex-start;padding-top:8px;border-top:1px solid rgba(255,255,255,.07)}.pat82-prev{display:grid;justify-items:center;gap:2px;flex:none;width:84px}
.pat82-f{flex:1;min-width:0;display:grid;gap:6px}.pat82-g{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))!important;gap:4px 8px}.pat82-g label{display:grid;gap:2px;font-size:12px;color:var(--muted)}.pat82-g input[type=color]{width:100%;height:28px;padding:0;border:0;background:none}
.rb82{position:sticky;top:0;border:1px solid #6b5636;border-radius:12px;padding:10px;background:linear-gradient(#241a10,#18110b)}.rb82-h{font:700 16px Georgia,serif;color:var(--gold,#e8c96a);margin-bottom:6px;text-align:center}
.rb82-body{display:grid;grid-template-columns:minmax(0,1fr) 46px;gap:8px;height:440px}.rb82-bands{display:flex;flex-direction:column}
.rb82-band{flex:1;display:flex;flex-direction:column;justify-content:center;gap:1px;padding:0 4px;border-bottom:1px dashed rgba(255,255,255,.1);font-size:12.5px}.rb82-band:last-child{border-bottom:0}
.rb82-band b{font:700 13px Georgia,serif;color:#eadbb8}.rb82-band small{color:var(--muted);font-size:11px}.rb82-n{color:#9fd18f;font-size:11px}
.rb82-tube{position:relative;border-radius:23px;background:rgba(255,255,255,.05);border:2px solid #6b5636;overflow:visible}
.rb82-tube>i{position:absolute;left:5px;right:5px;bottom:5px;height:calc((100% - 10px) * var(--p) / 100);border-radius:18px;background:linear-gradient(0deg,#8a3a1c,#e8a040 70%,#f3d58a)}
.rb82-tok{position:absolute;left:calc(50% + var(--dx,0px));bottom:calc(var(--p) * 1%);transform:translate(-50%,50%);display:grid;justify-items:center;z-index:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))}
.rb82-tok img,.rb82-tok svg{max-height:34px}.rb82-tok i{font:700 10px var(--mono);font-style:normal;color:#fff;background:rgba(0,0,0,.6);border-radius:6px;padding:0 3px}.rb82-tok.act i{background:#a3281f}
.sr82{margin-top:16px}.sr82-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}.sr82-chip{all:unset;cursor:pointer;padding:3px 10px;border:1px solid #6b5636;border-radius:999px;font-size:13px}.sr82-chip.on{border-color:var(--gold,#e8c96a);color:var(--gold,#e8c96a);background:rgba(232,201,106,.08)}.sr82-chip small{opacity:.7}
.sr82-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}.sr82-it{display:grid;grid-template-columns:56px minmax(0,1fr);gap:4px 10px;padding:8px;border:1px solid #5a4428;border-radius:10px;background:rgba(255,255,255,.025)}
.sr82-art{grid-row:1 / span 2;width:56px}.sr82-art img,.sr82-art .cardimg,.sr82-art>*{max-width:100%}.sr82-b{display:grid;gap:1px;min-width:0}.sr82-b small{color:var(--muted);font-size:12px}.sr82-who b{color:#eadbb8}.sr82-lk{color:#f0cf7d!important}
.sr82-c{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.sr82-c select{flex:1;min-width:0;width:auto}.sr82-it.lock{opacity:.5;filter:grayscale(.6)}
.tbl82{margin:8px 0 0;font-size:13px;color:#f0cf7d}
.pass82{display:flex;gap:14px;align-items:center;margin:0 0 12px;padding:10px 14px;border:2px solid #c9a24f!important;background:linear-gradient(90deg,rgba(201,162,79,.18),rgba(33,25,19,.6))}
.pass82-t{font-size:34px}.pass82>div:nth-child(2){flex:1;min-width:0;display:grid;gap:2px}.pass82 .btn{flex:none}
@media(max-width:760px){.dom82-wrap{grid-template-columns:1fr}.rb82{order:-1;position:static}.dom82-main{order:1}
 .rb82-body{grid-template-columns:none;grid-template-rows:auto 46px;height:auto}.rb82-bands{flex-direction:row-reverse}.rb82-band{border-bottom:0;border-right:1px dashed rgba(255,255,255,.1);text-align:center;padding:2px}
 .rb82-tube>i{bottom:5px;top:5px;left:5px;height:auto;width:calc((100% - 10px) * var(--p) / 100);right:auto;background:linear-gradient(90deg,#8a3a1c,#e8a040 70%,#f3d58a)}
 .rb82-tok{left:calc(var(--p) * 1%);bottom:calc(50% - var(--dx,0px) * .6);transform:translate(-50%,50%)}.dom82-rec{grid-template-columns:repeat(3,minmax(0,1fr))}.pat82{flex-wrap:wrap}.pass82{flex-wrap:wrap}}`;document.head.appendChild(st)}

document.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('pat82d'))ONL82.patOpen=e.target.open},true);
