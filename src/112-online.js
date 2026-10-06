/* =====================================================================
   112-ONLINE · MULTIPLAYER → ONLINE (phase 1: the landing space, against a mock server)
   =====================================================================
   • Reach: the menu's 🌐 Online stays "coming soon" for players; the word of power opens it (localStorage flavius_online77).
   • NET: one request/push interface. NET.req(type,data) → Promise; NET.on(type,fn) for pushes. Transports:
       mock — runs the server's routes in this page over a shared localStorage world, BroadcastChannel pushes between tabs
              (two windows of the same browser are two players: the account id lives in sessionStorage);
       aws  — a WebSocket to the API Gateway URL (113-onlnet; set in Settings once the template is deployed).
     The mock routes (MOCK_ROUTES) mirror server/handlers.js one for one.
   • The window (onlineOpen): sign in → make an online gladiator (no living one) → the landing space:
     left rail Play · Lobby Browser · Spectate · Armory & Market · Character · Hall of the Fallen;
     Play = the stage (your gladiator lit, rank, wallet, lifetime CF, bouts survived, party slots), event playlists
     (Ranked / Custom), weekly challenges, empire news. Lobby Browser = every hosted game (host, event, city, seats, rank,
     ping, status) with Join · Create · 👁 Watch · 🎟 Ticket.
   • Matches: phase 1 plays the lobby locally (empty seats → CPUs) and reports the result to the server, which pays the
     wallet, adds lifetime CF, ranks up, and — in Ranked — applies the Fate (death, Hall of the Fallen). Phase 2 (114) turns
     the other humans' seats into live remote players.
   ===================================================================== */
const ONL={tab:'play',acct:null,char:null,chars:[],lobbies:[],hall:[],news:[],stats:{},sel:null,creating:null,mkt:null,busy:false};
const ONL_ON=()=>{try{return localStorage.getItem('flavius_online77')==='1'}catch(e){return false}};
cheatRegister('h2982904736',()=>{try{localStorage.setItem('flavius_online77','1')}catch(e){}try{onlMenuBtn()}catch(e){}return _T('🌐 <b>Online</b> is open — Multiplayer → 🌐 Online (a mock server until the AWS template is deployed).')},_T('Online (preview)'));
CHEAT_SHOW.push([[83,86,73,73,96,62,62],_T('🌐 Opens Multiplayer → Online before it ships (a preview against a mock server)')]);

/* ---------------- NET: one interface, two transports ---------------- */
const NET={mode:'mock',seq:0,wait:{},subs:{},conn:'c'+Math.random().toString(36).slice(2,10),
  on(t,fn){(this.subs[t]=this.subs[t]||[]).push(fn);return ()=>{this.subs[t]=(this.subs[t]||[]).filter(f=>f!==fn)}},
  emit(t,d){for(const f of this.subs[t]||[])try{f(d)}catch(e){console.error(e)}for(const f of this.subs['*']||[])try{f(t,d)}catch(e){}},
  req(t,d){if(this.mode==='aws'&&typeof NETWS!=='undefined')return NETWS.req(t,d);return mockReq(t,d||{})}};

/* ---------------- the mock server ---------------- */
const MOCK_KEY='flavius_onlmock';
function mockLoad(){try{const w=JSON.parse(localStorage.getItem(MOCK_KEY)||'null');if(w&&w.v===1)return w}catch(e){}return {v:1,seq:1,accounts:{},chars:{},lobbies:{},hall:[],news:[],matches:{}}}
function mockSave(w){try{localStorage.setItem(MOCK_KEY,JSON.stringify(w))}catch(e){}}
const MOCK_BC=(()=>{try{return new BroadcastChannel('flavius_onl')}catch(e){return null}})();
if(MOCK_BC)MOCK_BC.onmessage=e=>{const m=e.data||{};if(m&&m.t)NET.emit(m.t,m.d)};
function mockPush(t,d){NET.emit(t,d);try{MOCK_BC&&MOCK_BC.postMessage({t,d})}catch(e){}}
function mockMe(){try{return sessionStorage.getItem('flavius_onlacct')||localStorage.getItem('flavius_onlacct')||null}catch(e){return null}}
const MOCK_HOSTS=[[_T('Marcus of Capua'),'hero'],[_T('Thrax the Patient'),'slave'],[_T('Iulia Ferox'),'amazonia'],[_T('Old Crixus'),'veteranus'],[_T('Nerva the Bold'),'soldier'],[_T('Gaia Lupa'),'venatore']];
function mockSeedWorld(w){if(w.seeded)return;w.seeded=1;const now=Date.now();
  MOCK_HOSTS.forEach(([n,cls],i)=>{const id='bot'+i;w.accounts[id]={id,name:n,bot:1};const ch=ONLC.newChar({name:n,cls,stats:{spd:75,str:75,int:75,lck:75,cha:75}},id,'bc'+i,now);
    ch.survived=[0,2,8,20,1,40][i];ch.lifeCF=[10,60,150,320,30,700][i];ch.rank=ONLC.rankFor(ch).k;ch.wallet=20+i*9;w.chars[ch.id]=ch;
    if(i<4){const L=ONLC.newLobby({ev:ONLC.EVENTS3[i%3],loc:[3,6,9,1][i],ranked:i%2===0,seats:4,ticket:i===1?5:0},{id,name:n,char:ch.id,rank:ch.rank},'L'+(w.seq++),now-i*60000);ONLC.seatGroup(L,[{id,name:n,char:ch.id,rank:ch.rank}]);L.mock=1;L.ping=40+i*23;if(i===3){L.status='live';L.players.push({id:'bot4',name:'Nerva the Bold',rank:'tiro'},{id:'bot5',name:'Gaia Lupa',rank:'primus'})}w.lobbies[L.id]=L}});
  w.hall.push({name:'Spartacus of Thrace',cls:'slave',rank:'summa',lifeCF:1450,survived:71,diedAt:now-86400000*12,why:_T('Summa Rudis')},{name:'Flamma the Syrian',cls:'veteranus',rank:'primus',lifeCF:880,survived:34,diedAt:now-86400000*3,why:_T('Primus Palus')});
  w.news=[['🏛',_T('The Colosseum games are on — Capua fills its tiers.')],['⚔',_T('Old Crixus reached Veteranus after 20 bouts.')],['🪦',_T('Flamma the Syrian fell at Pompeii. The Hall remembers.')]]}
const MOCK_ROUTES={
  'hello':(w,d,me)=>{const a=me&&w.accounts[me]||null;const o={ver:ONLC.VER,mode:'mock',me:a};if(d.all&&a){o.chars=Object.values(w.chars).filter(c=>c.owner===me).sort((x,y)=>y.born-x.born);o.lobbies=MOCK_ROUTES['lobby.list'](w);
    o.news=w.news.slice(0,8);o.online=Object.keys(w.accounts).length+37;o.challenges=ONLC.weekChallenges(Date.now());o.active=(onlMockChar(w,me)||{}).id||null;o.party=a.party&&w.parties&&w.parties[a.party]||null}return o},
  'auth.signin':(w,d)=>{const name=ONLC.cleanName(d.name);if(name.length<2)throw new Error(_T('Your name: 2–24 letters.'));const id='u'+(w.seq++)+Math.random().toString(36).slice(2,6);
    w.accounts[id]={id,name,since:Date.now()};try{sessionStorage.setItem('flavius_onlacct',id);localStorage.setItem('flavius_onlacct',id)}catch(e){}return w.accounts[id]},
  'auth.signout':(w,d,me)=>{try{sessionStorage.removeItem('flavius_onlacct');localStorage.removeItem('flavius_onlacct')}catch(e){}return {}},
  'char.mine':(w,d,me)=>Object.values(w.chars).filter(c=>c.owner===me).sort((a,b)=>b.born-a.born),
  'char.create':(w,d,me)=>{if(!me)throw new Error(_T('Sign in first.'));const live=Object.values(w.chars).filter(c=>c.owner===me&&c.alive);if(live.length>=ONLC.GLAD_MAX)throw new Error(_T`Up to ${ONLC.GLAD_MAX} living gladiators.`);
    const ch=ONLC.newChar(d,me,'g'+(w.seq++),Date.now());w.chars[ch.id]=ch;const A=w.accounts[me];if(A&&!live.some(c=>c.id===A.active))A.active=ch.id;return ch},
  'char.active':(w,d,me)=>{const ch=w.chars[d.char];if(!ch||ch.owner!==me||!ch.alive)throw new Error(_T('Not yours.'));if(mockBusy(w,me))throw new Error(_T('Finish or leave your game first.'));w.accounts[me].active=ch.id;return ch},
  'char.edit':(w,d,me)=>{const ch=w.chars[d.char];if(!ch||ch.owner!==me)throw new Error(_T('Not yours.'));if(mockBusy(w,me))throw new Error(_T('Finish or leave your game first.'));ONLC.editChar(ch,d,onlCatalog());return ch},
  'char.buy':(w,d,me)=>{const ch=w.chars[d.char];if(!ch||ch.owner!==me)throw new Error(_T('Not yours.'));ONLC.buy(ch,d.item,onlCatalog());if(Array.isArray(ch.equip))ch.equip.push(d.item);return ch},
  'lobby.list':(w)=>{for(const L of Object.values(w.lobbies))if(L.status==='waiting'&&!L.mock&&Date.now()-(L.created||0)>3*3600e3)mockClose(w,L,'old');return Object.values(w.lobbies).filter(L=>L.status!=='done').sort((a,b)=>b.created-a.created)},
  'lobby.chat':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error(_T('That game is gone.'));if(L.status!=='waiting')throw new Error(_T('The chat closes when the horns sound.'));
    if(!L.players.some(p=>p.id===me)&&!(L.stands||[]).some(t=>t.id===me))throw new Error(_T('Join the game to talk.'));const text=ONLC.cleanChat(d.text);if(!text)return L;
    const last=(L.chat||[]).filter(m=>m.by===me).slice(-1)[0];if(last&&Date.now()-last.at<1000)throw new Error(_T('Slow down.'));L.chat=[...(L.chat||[]),{by:me,name:w.accounts[me].name,text,at:Date.now()}].slice(-ONLC.CHAT_KEEP);return L},
  'lobby.set':(w,d,me)=>{const L=w.lobbies[d.id];if(!L||L.host.id!==me)throw new Error(_T('Only the host changes the game.'));if(L.status!=='waiting')throw new Error(_T('Already under way.'));
    if(d.abandon!=null&&!L.ranked)L.abandon=d.abandon==='fate'?'fate':'cpu';if(d.standsOff!=null)L.standsOff=!!d.standsOff;return L},
  'lobby.create':(w,d,me)=>{const g=mockGroup(w,me);const m=g[0];if(d.ranked&&!m.char)throw new Error(_T('Ranked needs a living gladiator.'));
    const L=ONLC.newLobby(d,{id:me,name:m.name,char:m.char,rank:m.rank},'L'+(w.seq++),Date.now());const why=ONLC.seatGroup(L,g);if(why)throw new Error(why);L.ping=12;w.lobbies[L.id]=L;return L},
  'lobby.join':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error(_T('That game is gone.'));const why=ONLC.seatGroup(L,mockGroup(w,me));if(why)throw new Error(why);return L},
  'lobby.leave':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)return {};const t=(L.stands||[]).find(s=>s.id===me);
    if(t&&L.status==='waiting'){L.stands=L.stands.filter(s=>s!==t);L.tickets=L.stands.length;L.pot=Math.max(0,(L.pot|0)-(t.paid|0));const ch=onlMockChar(w,me);if(ch)ch.wallet+=t.paid|0;return L}
    if(L.status!=='waiting')return L;L.players=L.players.filter(p=>p.id!==me);
    if(!L.players.length||L.host.id===me){L.status='done';const st=ONLC.settle(L.bets||[],[],{tix:(L.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),void:true});for(const [by,v] of Object.entries(st.payouts)){const c=onlMockChar(w,by);if(c)c.wallet+=v}L.bets=[];L.pool=0;L.pot=0}return L},
  'party.create':(w,d,me)=>{w.parties=w.parties||{};const a=w.accounts[me];if(a.party&&w.parties[a.party])return w.parties[a.party];
    const P={id:'P'+(w.seq++),code:ONLC.partyCode(Math.random),leader:me,members:[me],names:{[me]:a.name}};w.parties[P.id]=P;a.party=P.id;return P},
  'party.join':(w,d,me)=>{w.parties=w.parties||{};const code=String(d.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');const P=Object.values(w.parties).find(x=>x.code===code);if(!P)throw new Error(_T('No party with that code.'));
    const a=w.accounts[me];if(a.party&&a.party!==P.id)throw new Error(_T('Leave your party first.'));if(!P.members.includes(me)){if(P.members.length>=ONLC.PARTY_MAX)throw new Error(_T('That party is full.'));P.members.push(me);P.names[me]=a.name}a.party=P.id;mockPush('party.update',{id:P.id});return P},
  'party.leave':(w,d,me)=>{w.parties=w.parties||{};const a=w.accounts[me];const P=a.party&&w.parties[a.party];a.party=null;if(!P)return {};P.members=P.members.filter(m=>m!==me);delete P.names[me];
    if(!P.members.length){delete w.parties[P.id];return {}}if(P.leader===me)P.leader=P.members[0];mockPush('party.update',{id:P.id});return {}},
  'party.get':(w,d,me)=>{const a=w.accounts[me];return a&&a.party&&w.parties&&w.parties[a.party]||null},
  'lobby.ready':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error(_T('That game is gone.'));const p=L.players.find(p=>p.id===me);if(p)p.ready=!!d.ready;return L},
  'lobby.start':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error(_T('That game is gone.'));const why=ONLC.canStart(L,me);if(why)throw new Error(why);
    L.status='live';L.seed=(Math.random()*2**31)>>>0;L.started=Date.now();w.matches[L.id]={id:L.id,seed:L.seed,inputs:[],results:{},open:null,watch:{},abandoned:{},abandon:ONLC.abandonRule(L),standsOff:!!L.standsOff};return L},
  'match.abandon':(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));const seat=L.players.findIndex(p=>p.id===me);if(seat<0)throw new Error(_T('Not your match.'));
    M.abandoned=M.abandoned||{};if(M.abandoned[me]||M.status==='done')return {done:1};const rule=M.abandon||ONLC.abandonRule(L);M.abandoned[me]=rule;
    const inp={k:'abandon',seat,rule,from:'server',seq:M.inputs.length,...(rule==='cpu'&&!L.ranked&&typeof ONLC.RECLAIM_MS==='number'?{until:Date.now()+ONLC.RECLAIM_MS}:{})}; /* v0.84 the reclaim window */M.inputs.push(inp);mockPush('match.input',{id:d.id,in:inp});let out=null;
    if(L.ranked){const ch=w.chars[L.players[seat].char];if(ch&&ch.alive){out=ONLC.applyResult(ch,{won:false,place:L.seats,f:0,coin:0,survives:false},true);out.abandoned=1;M.outs=M.outs||{};M.outs[me]=out;
      if(out.hall)w.hall.unshift({name:ch.name,cls:ch.cls,rank:ch.died.rank,lifeCF:ch.lifeCF,survived:ch.survived,diedAt:Date.now(),why:onlHallWhy(ch)});w.news.unshift(['🌫',_T`${ch.name} abandoned the sand — Damnatio.`])}}
    const left=L.players.filter(p=>!/^bot/.test(p.id)&&!M.abandoned[p.id]&&!(M.dropped||{})[p.id]);if(!left.length)mockClose(w,L,'empty');return {done:1,out,rule}},
  'match.watch':(w,d,me)=>{const M=w.matches[d.id];const L=w.lobbies[d.id];if(L&&L.mock)throw new Error(_T('A sample game of the preview — nothing to watch.'));if(!M||!L||L.status!=='live')throw new Error(_T('That match is over.'));M.watch=M.watch||{};M.watch[me]=1;L.watchers=(L.watchers||0)+1;
    return {lobby:L,players:L.players.filter(p=>!/^bot/.test(p.id)).map(p=>p.id),specs:(L.stands||[]).map(s=>s.id),seed:M.seed,abandoned:Object.keys(M.abandoned||{}),dropped:Object.keys(M.dropped||{})}},
  'match.unwatch':(w,d,me)=>{const M=w.matches[d.id];if(M&&M.watch)delete M.watch[me];return {}},
  'match.open':(w,d,me)=>{const M=w.matches[d.id];const L=w.lobbies[d.id];if(!M||!L)throw new Error(_T('No such match.'));if(L.host.id!==me)throw new Error(_T('Only the host opens the match.'));M.open=d.snap;mockPush('match.open',{id:d.id});return {}},
  'match.get':(w,d)=>{const M=w.matches[d.id];if(!M)throw new Error(_T('No such match.'));return {open:M.open,inputs:M.inputs.slice(d.from|0),seed:M.seed}},
  'match.input':(w,d,me)=>{const M=w.matches[d.id];const L=w.lobbies[d.id];if(!M||!L)throw new Error(_T('No such match.'));if(mockSeat(L,me)<0)throw new Error(_T('Not your match.'));
    if((d.in.seat|0)!==mockSeat(L,me)||d.in.k==='drop'||d.in.k==='abandon')throw new Error(_T('That seat is not yours.'));if((M.abandoned||{})[me])throw new Error(_T('You left this match.'));
    const inp={...d.in,from:me,seq:M.inputs.length};M.inputs.push(inp);mockPush('match.input',{id:d.id,in:inp});return {seq:inp.seq}},
  'match.snapreq':(w,d,me)=>{mockPush('match.snapreq',{id:d.id,to:d.to,from:me,seq:d.seq});return {}},
  'match.snap':(w,d,me)=>{mockPush('match.snap',{id:d.id,to:d.to,snap:d.snap,seq:d.seq,from:me});return {}},
  'lobby.watch':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error(_T('That game is gone.'));L.watchers=(L.watchers||0)+1;return L},
  'lobby.ticket':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error(_T('That game is gone.'));const ch=onlMockChar(w,me);if(!ch)throw new Error(_T('Tickets are paid from a gladiator’s wallet.'));
    const why=ONLC.ticketOK(L,me,ch.wallet);if(why)throw new Error(why);ch.wallet-=L.ticket;(L.stands=L.stands||[]).push({id:me,name:w.accounts[me].name,paid:L.ticket});L.tickets=L.stands.length;L.pot=(L.pot||0)+L.ticket;return {lobby:L,char:ch}},
  'bet.place':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error(_T('That game is gone.'));const ch=onlMockChar(w,me);if(!ch)throw new Error(_T('Wagers are paid from a living gladiator’s wallet.'));
    const amt=d.amt|0,seat=d.seat|0;const why=ONLC.betOK(L,me,seat,amt,ch.wallet);if(why)throw new Error(why);ch.wallet-=amt;(L.bets=L.bets||[]).push({by:me,char:ch.id,seat,amt});L.pool=(L.pool||0)+amt;return {lobby:L,char:ch}},
  'match.result':(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));const humans=L.players.filter(p=>!/^bot/.test(p.id)).map(p=>p.id);if(!humans.includes(me))throw new Error(_T('Not your match.'));
    M.reports=M.reports||{};if(!M.reports[me])M.reports[me]={table:ONLC.cleanTable(d.table),hash:String(d.hash||'')};M.dropped=M.dropped||{};
    M.abandoned=M.abandoned||{};if(M.status!=='done'&&humans.filter(a=>!M.dropped[a]&&!M.abandoned[a]).every(a=>M.reports[a])){const A=ONLC.agree(M.reports);M.status='done';M.outs=M.outs||{};
      for(const a of A.minority){const P=w.accounts[a];if(P)P.strikes=(P.strikes||0)+1}
      if(!A.void)L.players.forEach((p,i)=>{if(!humans.includes(p.id)||M.abandoned[p.id])return;const ch=w.chars[p.char];if(ch&&!ch.alive)return;const row=A.table.find(r=>r.seat===i);if(!ch||!row)return;const out=ONLC.applyResult(ch,row,!!L.ranked,{humans:humans.length});M.outs[p.id]=out;
        if(out.died){const e={name:ch.name,cls:ch.cls,rank:ch.died.rank,lifeCF:ch.lifeCF,survived:ch.survived,diedAt:Date.now(),why:out.hall?onlHallWhy(ch):''};if(out.hall)w.hall.unshift(e);
          w.news.unshift(out.hall?['🪦',_T`${ch.name} fell. The Hall of the Fallen keeps the name.`]:['🌫',_T`${ch.name} fell and is forgotten.`])}
        if(out.rankUp)w.news.unshift(['⚔',_T`${ch.name} is now ${ONLC.RANKS[ONLC.rankIdx(out.rankUp)].n}.`])});
      w.news=w.news.slice(0,12);L.status='done';
      if((L.bets||[]).length||L.pot){const wins=A.void?[]:A.table.filter(r=>r.won).map(r=>r.seat);const seatAcct={};L.players.forEach((p,i)=>{seatAcct[i]=p.id});const st=ONLC.settle(L.bets||[],wins,{pot:L.pot|0,tix:(L.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),seatAcct,void:!!A.void});for(const [by,v] of Object.entries(st.payouts)){const c=onlMockChar(w,by);if(c)c.wallet+=v}const hc=onlMockChar(w,L.host.id);if(hc&&st.cut)hc.wallet+=st.cut;L.settled=st}
      for(const a of humans)if(a!==me)mockPush('match.settled',{id:d.id,to:a,void:!!A.void,out:M.outs[a]||null,char:Object.values(w.chars).filter(c=>c.owner===a).sort((x,y)=>y.born-x.born)[0]||null})}
    const mine=Object.values(w.chars).filter(c=>c.owner===me).sort((x,y)=>y.born-x.born)[0]||null;if(M.status==='done')return {char:mine,out:(M.outs||{})[me]||null,void:!!(M.outs&&!Object.keys(M.outs).length&&L.status==='done'&&ONLC.agree(M.reports).void)};return {pending:true}},
  'match.drop':(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));const sq=d.seat|0;const p=sq<L.seats?L.players[sq]:(L.stands||[])[sq-L.seats];if(!p||p.id===me)throw new Error(_T('No one to drop.'));
    M.dropped=M.dropped||{};if(M.dropped[p.id])return {done:1};M.dropped[p.id]=true;const inp={k:'drop',seat:d.seat|0,from:'server',seq:M.inputs.length,...(sq<L.seats&&typeof ONLC.RECLAIM_MS==='number'?{until:Date.now()+ONLC.RECLAIM_MS}:{})}; /* v0.84 the reclaim window */M.inputs.push(inp);mockPush('match.input',{id:d.id,in:inp});return {done:1}},
  'hall.list':(w)=>w.hall.slice(0,60),
  'world.news':(w)=>({news:w.news.slice(0,8),online:Object.keys(w.accounts).length+37,challenges:ONLC.weekChallenges(Date.now())})};
/* the lanista and their party (the leader picks), as lobby seats */
function mockGroup(w,me){const a=w.accounts[me];const P=a&&a.party&&w.parties&&w.parties[a.party];if(P&&P.leader!==me)throw new Error(_T('Your party leader picks the game.'));
  const out=(P?P.members:[me]).map(m=>{const ch=onlMockChar(w,m);return {id:m,name:w.accounts[m].name,char:ch&&ch.id,rank:ch?ONLC.rankFor(ch).k:'tiro',kit:ONLC.kitOf(ch),party:P?P.id:undefined}});
  for(const L of Object.values(w.lobbies))if(L.status==='waiting'&&L.players.some(p=>out.some(x=>x.id===p.id)))throw new Error(out.length>1?_T('Someone in your party is already in a lobby.'):_T('You are already in a lobby.'));return out}
/* a lanista's seat in a match: fighters first, then the ticket holders */
function mockSeat(L,me){const i=L.players.findIndex(p=>p.id===me);if(i>=0)return i;const k=(L.stands||[]).findIndex(s=>s.id===me);return k>=0?L.seats+k:-1}
/* the account's ACTIVE gladiator (v0.79: up to 3 living, one active) */
function onlMockChar(w,me){const all=Object.values(w.chars).filter(c=>c.owner===me&&c.alive).sort((a,b)=>b.born-a.born);if(!all.length)return null;const A=w.accounts[me];return all.find(c=>A&&c.id===A.active)||all[all.length-1]}
function mockBusy(w,me){return Object.values(w.lobbies).find(L=>(L.status==='waiting'||L.status==='live')&&L.players.some(p=>p.id===me))||null}
function mockClose(w,L,why){const M=w.matches[L.id];if(M)M.status='done';const st=ONLC.settle(L.bets||[],[],{tix:(L.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),void:true});
  for(const [by,v] of Object.entries(st.payouts)){const c=onlMockChar(w,by);if(c)c.wallet+=v}L.status='done';L.closed=why;L.bets=[];L.pool=0;L.pot=0;mockPush('lobby.update',{id:L.id,closed:why})}
const onlHallWhy=ch=>ONLC.hallWhy(ch);
async function mockReq(t,d){const R=MOCK_ROUTES[t];if(!R)throw new Error(_T('Unknown request: ')+t);await new Promise(r=>setTimeout(r,30+Math.random()*60));
  const w=mockLoad();mockSeedWorld(w);const me=mockMe();const out=R(w,d,me);mockSave(w);if(/^lobby\./.test(t)&&t!=='lobby.list'||t==='match.result'||t==='match.watch'||t==='match.abandon')mockPush('lobby.update',{id:d.id||(out&&out.id)});return JSON.parse(JSON.stringify(out===undefined?{}:out))}
/* the gear catalog: every printed weapon and armor piece the market sells, by level (the server ships the same list) */
function onlCatalog(){if(ONL.cat)return ONL.cat;const c={};for(const lv of [1,2,3]){for(const k of (typeof MARKET_W0!=='undefined'?MARKET_W0:MARKET_W)[lv]||[])if(W[k]&&!W[k].custom)c[k]={kind:'w',lv,n:W[k].n};
  for(const k of (typeof MARKET_A0!=='undefined'?MARKET_A0:MARKET_A)[lv]||[])if(ARM[k]&&!ARM[k].custom)c[k]={kind:'a',lv,n:ARM[k].n,stack:!!ARM[k].stack}}return ONL.cat=c}

/* ---------------- the menu: 🌐 Online opens behind the word ---------------- */
function onlMenuBtn(){const b=document.querySelector('#mainMenu [data-mm="online"]');if(!b)return;if(ONL_ON()){b.disabled=false;b.title='';const s=b.querySelector('small');if(s)s.textContent=_T('preview · mock server')}}
{const base=menuShow;menuShow=function(){const r=base.apply(this,arguments);try{setTimeout(onlMenuBtn,0)}catch(e){}return r}}
document.addEventListener('click',e=>{const b=e.target.closest('#mainMenu [data-mm="multi"]');if(b)setTimeout(onlMenuBtn,0);const o=e.target.closest('#mainMenu [data-mm="online"]');if(!o||o.disabled)return;e.stopPropagation();
  if(typeof modalBusy==='function'&&modalBusy())return;mmLaunch(()=>onlineOpen(),_T('Online'))},true);

/* ---------------- the window ---------------- */
const esc2=s=>typeof esc==='function'?esc(s):String(s);
function onlRank(k){return ONLC.RANKS[ONLC.rankIdx(k)]||ONLC.RANKS[0]}
function onlRankChip(k){const R=onlRank(k);return `<span class="onl-rk onl-rk-${R.k}" title="${esc2(R.n)}">${R.ic} ${esc2(R.n)}</span>`}
function onlMini(cls,h=220){const src=typeof MINI_URL!=='undefined'&&MINI_URL[cls];return src?`<img class="onl-mini" src="${typeof assetURL==='function'?assetURL(src.replace(/^assets\//,'')):src}" alt="" style="height:${h}px">`:`<span style="font-size:${h/3}px">🛡</span>`}
function onlEvName(k){return (EVENTS[k]||{}).n||k}
function onlCityName(i){return (LOCATIONS[i]||{}).n||'—'}
async function onlRefresh(){try{const h=await NET.req('hello',{all:1});ONL.acct=h.me;ONL.mode=h.mode;
    if(h.chars&&h.me){ONL.chars=h.chars;ONL.active=h.active||null;ONL.char=h.chars.find(c=>c.alive&&c.id===h.active)||h.chars.find(c=>c.alive)||null;ONL.lobbies=h.lobbies||[];ONL.news=h.news||[];ONL.stats={challenges:h.challenges||[],online:h.online||0};ONL.party=h.party||null;return}}catch(e){ONL.err=e.message}
  if(ONL.acct){try{ONL.chars=await NET.req('char.mine');ONL.char=ONL.chars.find(c=>c.alive&&c.id===ONL.active)||ONL.chars.find(c=>c.alive)||null}catch(e){}}
  try{ONL.lobbies=await NET.req('lobby.list')}catch(e){}try{const n=await NET.req('world.news');ONL.news=n.news;ONL.stats=n}catch(e){}}
function onlRedraw(){const r=document.getElementById('onl');if(!r)return;const sc=($('#mBody')||{}).scrollTop||0;if(typeof morph91==='function')morph91(r,onlHTML());else r.innerHTML=onlHTML(); /* v0.91: patched in place (198), no flicker */const b=$('#mBody');if(b)b.scrollTop=sc}
let ONL_SUB=null;
async function onlineOpen(tab){if(typeof modalBusy==='function'&&modalBusy())return;ONL.tab=tab||'play';ONL.newGlad=false;await onlRefresh();
  if(!ONL_SUB)ONL_SUB=NET.on('lobby.update',async()=>{if(!document.getElementById('onl'))return;try{ONL.lobbies=await NET.req('lobby.list')}catch(e){}onlRedraw();if(typeof onlLobbyTick==='function')onlLobbyTick()});
  const v=await modal(_T('🌐 Online'),`<div id="onl">${onlHTML()}</div>`,[{label:_T('Close'),value:'close'}],{wide:1,full:1,close:'close',onOpen:()=>{const x=$('#mClose');if(x){x.textContent=_T('✖ Leave the Online arena');x.classList.add('saveq')}}});
  if(typeof v==='string'&&v.startsWith('play:'))onlPlay(v.slice(5))}
function onlHTML(){if(!ONL.acct)return onlSignInHTML();if(ONL.newGlad&&ONL.tab!=='hall')return onlCreatorHTML();
  const tabs=[['play',_T('⚔ Play')],['lobby',_T('📜 Lobby Browser')],['spect',_T('👁 Spectate')],['armory','🛒 Armory & Market'],['char',_T('🛡 My Gladiators')],['hall',_T('🪦 Hall of the Fallen')]];
  return `<div class="onl-wrap"><nav class="onl-rail">${tabs.map(([k,l])=>`<button type="button" data-onl="tab" data-v="${k}" class="${ONL.tab===k?'on':''}">${l}</button>`).join('')}
    <div class="onl-acct"><span>${esc2(ONL.acct.name)}</span><small>${ONL.mode==='mock'?_T('mock server · preview'):_T('signed in')}</small><button type="button" class="btn tksm" data-onl="signout">${_T`Sign out`}</button></div></nav>
   <main class="onl-main">${({play:onlPlayHTML,lobby:onlLobbyHTML,spect:onlSpectHTML,armory:onlArmoryHTML,char:onlCharHTML,hall:onlHallHTML}[ONL.tab]||onlPlayHTML)()}</main></div>`}
function onlSignInHTML(){return `<div class="onl-sign"><div class="onl-sign-card"><h2>${_T`🌐 The Online Arena`}</h2><p>${_T`Fight real lanistas' gladiators. In Ranked, the Fate table is final: the dead stay dead.`}</p>
   <button type="button" class="btn primary onl-google" data-onl="google">${_T`<b>G</b> Sign in with Google`}</button>
   <small class="rc-sub">${_T`Signing in shares your Google name and e-mail with the arena.`} <a href="https://flaviusrule.com/privacy.html" target="_blank" rel="noopener noreferrer">${_T`Privacy policy`}</a></small>
   ${NET.mode==='mock'?`<div class="onl-mocknote">${_T`<b>Mock server.</b> Until the AWS template is deployed, sign in with a name. Open a second window to play yourself.`}<div style="display:flex;gap:6px;margin-top:6px"><input class="tin" id="onlName" maxlength="24" placeholder="${_T`Your lanista name`}"><button type="button" class="btn" data-onl="mocksign">${_T`Enter`}</button></div></div>`:''}</div></div>`}
/* the creator: name, class card, look, ratings */
function onlCreatorHTML(){const d=ONL.creating||(ONL.creating={name:typeof genName==='function'?genName():'',cls:'hero',look:{portrait:typeof randomPortrait==='function'?randomPortrait():null}});
  const L={spd:_T('Speed'),str:_T('Strength'),int:_T('Intelligence'),lck:_T('Luck'),cha:_T('Charisma')};const dead=ONL.chars.filter(c=>!c.alive)[0];
  return `<div class="onl-create"><div class="onl-cstage">${typeof portraitHTML==='function'&&d.look&&d.look.portrait?portraitHTML({name:d.name,portrait:d.look.portrait,color:(CLASSES[d.cls]||{}).color},'lg'):''}<div class="onl-cmini">${onlMini(d.cls,110)}</div><div class="onl-cname">${esc2(d.name||_T('Nameless'))}</div><div class="rc-sub">${esc2((CLASSES[d.cls]||{}).name||'')} · ${onlRankChip('tiro')}</div></div>
   <div class="onl-cform"><h3>${dead?_T`${esc2(dead.name)} is gone. A new gladiator steps forward.`:_T('Your online gladiator')}</h3>
    <p class="rc-sub">${_T`Starts with the recruit kit (the class's weapons, no armor) and an empty wallet. Earn coin and CF to rank up; buy gear between bouts. Nothing carries over from a fallen gladiator.`}</p>
    <label>${_T`Name`}<span style="display:flex;gap:4px"><input class="tin" id="onlCName" data-onlf="name" value="${esc2(d.name)}" maxlength="24">${typeof diceBtn==='function'?diceBtn('#onlCName'):''}</span></label>
    <div class="sect">${_T`Class`}</div><div class="onl-clsgrid">${ONLC.CLASSES8.map(k=>`<button type="button" class="onl-cls ${d.cls===k?'on':''}" data-onl="cls" data-v="${k}">${typeof cardHTML==='function'?cardHTML('k:'+k,'sm'):''}<span>${esc2(CLASSES[k].name)}</span></button>`).join('')}</div>
    <div class="sect">${_T`Ratings`} <span class="rc-sub">${_T`every recruit starts the same`}</span></div>
    <div class="onl-st0">${ONLC.STAT_KEYS.map(k=>`<span><b>${ONLC.START_STATS[k]}</b> ${L[k]}</span>`).join('')}</div><p class="rc-sub" style="margin:0">${_T`They grow only by surviving: +1 to your lowest rating for every bout you live through, +1 more for a win.`}</p>
    <div class="mbtns"><button type="button" class="btn primary" data-onl="create">${_T`⚔ Enter the arena as a Tiro`}</button><button type="button" class="btn" data-onl="face">${_T`🎲 New face`}</button><button type="button" class="btn" data-onl="nonew">${_T`Back`}</button></div>
    <p class="rc-sub" style="margin:0">${_T`Up to ${ONLC.GLAD_MAX} living gladiators; the active one fights. Their look, token and class are set in 🛡 My Gladiators.`}</p>
    ${ONL.err?`<p class="onl-err">${esc2(ONL.err)}</p>`:''}</div></div>`}
function onlStageHTML(ch){const R=onlRank(ONLC.rankFor(ch).k),N=ONLC.nextRank(ch),pg=Math.round(ONLC.rankProgress(ch)*100);
  return `<div class="onl-stage"><div class="onl-light"></div>${onlMini(ch.cls,250)}<div class="onl-plate"><div class="onl-pname">${esc2(ch.name)}</div><div>${esc2((CLASSES[ch.cls]||{}).name||'')} · ${onlRankChip(R.k)}</div>
    <div class="onl-pstats"><span title="${_T`Wallet`}">${typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙'} ${ch.wallet}</span><span title="${_T`Lifetime Crowd Favor`}">${cfAmt87(ch.lifeCF)}</span><span title="${_T`Ranked bouts survived`}">${_T`🛡 ${ch.survived} survived`}</span><span title="${_T`Bouts`}">${_T`⚔ ${ch.bouts} bouts · ${ch.wins} won`}</span></div>
    ${N?`<div class="onl-next"><div class="onl-bar"><i style="width:${pg}%"></i></div>${_T`<small>Next: ${esc2(N.n)} — ${N.bouts} ranked bouts survived and ${N.cf} lifetime CF</small>`}</div>`:`<div class="onl-next">${_T`<small>The highest rank there is.</small>`}</div>`}</div>
    ${onlPartyHTML()}</div>`}
/* the party: share a code, the leader picks the game, everyone sits down together (one team in team events) */
function onlPartyHTML(){const P=ONL.party;const me=ONL.acct.id;const others=P?P.members.filter(m=>m!==me):[];const lead=!P||P.leader===me;
  const slots=[`<div class="onl-slot me">${_T`${onlMini(ONL.char.cls,70)}<small>You${P&&P.leader===me?' · leader':''}</small>`}</div>`];
  for(const m of others)slots.push(`<div class="onl-slot on"><b>${esc2((P.names||{})[m]||_T('Lanista'))}</b><small>${P.leader===m?'leader':'party'}</small></div>`);
  for(let i=slots.length;i<ONLC.PARTY_MAX;i++)slots.push(`<button type="button" class="onl-slot" data-onl="pinvite" title="${_T`Invite a friend: they enter your party code`}">${_T`＋<small>Invite</small>`}</button>`);
  return `<div class="onl-party">${slots.join('')}<div class="onl-pbox">${P?`<div>${_T`Party code <b class="onl-code">${esc2(P.code)}</b> <small class="rc-sub">${lead?_T('you pick the game — your party sits with you'):_T('your leader picks the game')}</small>`}</div><button type="button" class="btn tksm" data-onl="pleave">${_T`Leave the party`}</button>`
    :`<div class="rc-sub">${_T`Friends join with your party code. In team events your party fights on one side.`}</div><div style="display:flex;gap:4px"><input class="tin" id="onlPCode" maxlength="6" placeholder="${_T`Code`}" style="width:90px;text-transform:uppercase"><button type="button" class="btn tksm" data-onl="pjoin">${_T`Join a party`}</button></div>`}</div></div>`}
function onlPlayHTML(){const ch=ONL.char;const S9=ONL.stats||{};const ch3=S9.challenges||[];
  const lists=ONLC.EVENTS_ALL.map(k=>{const open=ONL.lobbies.filter(L=>L.ev===k&&L.status==='waiting');const tm=ONLC.EVENTS_TEAM.includes(k);return `<div class="onl-pl ${tm?'team':''}"><div class="onl-plart">${typeof cardHTML==='function'?cardHTML('e:'+k,'sm'):''}</div><div class="onl-plb">${_T`<b>${esc2(onlEvName(k))}</b>${tm?_T('<span class="badge gold">👥 Team · 2 v 2</span>'):''}<small>${open.length} open · ${open.filter(L=>L.ranked).length} ranked</small>`}
    <div class="acts"><button type="button" class="btn primary tksm" data-onl="quick" data-v="${k}|1">${_T`⚔ Ranked`}</button><button type="button" class="btn tksm" data-onl="quick" data-v="${k}|0">${_T`Custom`}</button></div></div></div>`}).join('');
  return `<div class="onl-play">${onlStageHTML(ch)}<div class="onl-side"><div class="card2">${_T`<b>⚡ This week</b>${ch3.map(([t])=>`<div class="onl-ch">◻ ${esc2(t)}</div>`).join('')}`}</div>
    <div class="card2">${_T`<b>📰 The empire</b>${(ONL.news||[]).map(([i,t])=>`<div class="onl-news">${i} ${esc2(t)}</div>`).join('')}<small class="rc-sub">${S9.online||0} lanistas online</small>`}</div></div></div>
   <h3 class="onl-h">${_T`Playlists`} <span class="rc-sub">${_T`Ranked pairs your rank only · Custom is anyone, no Fate deaths`}</span></h3><div class="onl-pls">${lists}</div>${onlMyLobbyHTML()}`}
function onlMyLobbyHTML(){const me=ONL.acct&&ONL.acct.id;const L=ONL.lobbies.find(x=>x.status!=='done'&&(x.players.some(p=>p.id===me)||(x.stands||[]).some(t=>t.id===me)));if(!L)return '';const host=L.host.id===me;
  const fan=!L.players.some(p=>p.id===me);const tm=ONLC.seatTeams(L);
  const seat=i=>{const p=L.players[i];const t=tm?`<i class="onl-team t${tm[i]}">${tm[i]}</i>`:'';return `<span class="onl-seat ${p?'on':''}">${t}${p?`${esc2(p.name)} ${onlRankChip(p.rank)}${p.ready?' ✓':''}`:_T('open — a CPU if empty')}</span>`};
  return `<div class="card2 onl-mine">${_T`<b>${fan?_T('🎟 Your seat in the stands:'):_T('Your game:')}</b> ${esc2(onlEvName(L.ev))} at ${esc2(onlCityName(L.loc))} · ${L.ranked?_T('⚔ Ranked'):_T('Custom')}${L.team?_T(' · 👥 Team A vs Team B'):''} · ${L.players.length}/${L.seats} seated`}
   <div class="onl-seats">${Array.from({length:L.seats},(_,i)=>seat(i)).join('')}</div>
   ${(L.stands||[]).length?`<div class="rc-sub">${_T`🎟 In the stands: ${L.stands.map(t=>esc2(t.name)).join(', ')} · pot ${coinAmt87(L.pot||0)}`}</div>`:''}
   <div class="acts">${L.status==='waiting'&&!fan?(host?`<button type="button" class="btn primary" data-onl="start" data-v="${L.id}">${_T`▶ Start now`}</button>`:`<button type="button" class="btn" data-onl="ready" data-v="${L.id}">${_T`✓ Ready`}</button>`):''}${L.status==='live'?`<button type="button" class="btn primary" data-onl="enter" data-v="${L.id}">${fan?_T('🎟 Take your seat'):_T('⚔ Enter the sand')}</button>`:''}${L.status==='waiting'?`<button type="button" class="btn" data-onl="leave" data-v="${L.id}">${fan?_T('Give back the ticket'):_T('Leave')}</button>`:''}</div></div>`}
function onlLobbyHTML(){const me=ONL.acct.id;const rows=ONL.lobbies;const st=L=>L.status==='waiting'?_T('<span class="badge gold">Waiting</span>'):_T('<span class="badge">In progress</span>');
  return `<div class="onl-lbtop"><h3>${_T`📜 Lobby Browser`} <span class="rc-sub">${_T`${rows.length} games`}</span></h3><div class="acts"><button type="button" class="btn" data-onl="refresh">${_T`↻ Refresh`}</button><button type="button" class="btn primary" data-onl="newgame">${_T`＋ Create`}</button></div></div>
   ${ONL.mkgame?onlCreateGameHTML():''}${ONL.betting?onlBetHTML():''}${onlMyLobbyHTML()}
   <table class="tally onl-lb"><tr><th>${_T`Host`}</th><th>${_T`Event`}</th><th>${_T`City`}</th><th>${_T`Seats`}</th><th>${_T`Rank`}</th><th>${_T`Ping`}</th><th>${_T`Status`}</th><th></th></tr>${rows.map(L=>{const mine=L.players.some(p=>p.id===me)||(L.stands||[]).some(t=>t.id===me);
     return `<tr class="${mine?'mine':''}"><td><b>${esc2(L.host.name)}</b></td><td>${esc2(onlEvName(L.ev))}${L.team?' <span class="badge">👥 2v2</span>':''}</td><td>${esc2(onlCityName(L.loc))}</td><td>${L.players.length}/${L.seats}${(L.stands||[]).length?` <small class="rc-sub">🎟${L.stands.length}</small>`:''}</td><td>${L.ranked?onlRankChip(L.rank):'<span class="rc-sub">Custom · any</span>'}</td><td>${_T`${L.ping||'—'} ms`}</td><td>${st(L)}</td>
      <td class="acts">${L.status==='waiting'&&!mine?`<button type="button" class="btn tksm primary" data-onl="join" data-v="${L.id}">${_T`Join`}</button>`:''}${L.status==='waiting'?`<button type="button" class="btn tksm" data-onl="bet" data-v="${L.id}" title="${_T`Wager from your wallet`}">💰${L.pool?' '+L.pool:''}</button>`:''}${L.status==='live'?(L.players.some(p=>p.id===me)&&!(ONL.leftMatch||{})[L.id]?`<button type="button" class="btn tksm primary" data-onl="rejoin" data-v="${L.id}" title="${_T`Back to your match`}">${_T`⚔ Rejoin`}</button>`:`<button type="button" class="btn tksm" data-onl="watch" data-v="${L.id}" title="${_T`Watch for free`}">👁</button>`):''}${L.ticket&&L.status==='waiting'&&!mine?`<button type="button" class="btn tksm" data-onl="ticket" data-v="${L.id}" title="${_T`A seat in the stands until the horns: stones, offerings, cheers. The coin goes into the wager pot.`}">🎟 ${L.ticket}</button>`:''}</td></tr>`}).join('')||`<tr><td colspan="8" class="rc-sub">${_T`No games hosted. Create one.`}</td></tr>`}</table>`}
function onlCreateGameHTML(){const g=ONL.mkgame;return `<div class="card2 onl-mk">${_T`<b>Host a game</b>`}<div class="formgrid">
   <label>${_T`Event`}<select data-onlg="ev">${ONLC.EVENTS_ALL.map(k=>`<option value="${k}" ${g.ev===k?'selected':''}>${esc2(onlEvName(k))}${ONLC.EVENTS_TEAM.includes(k)?_T(' — teams 2 v 2'):''}</option>`).join('')}</select></label>
   <label>${_T`City`}<select data-onlg="loc">${LOCATIONS.map((L,i)=>L?`<option value="${i}" ${+g.loc===i?'selected':''}>${esc2(L.n)}</option>`:'').join('')}</select></label>
   <label>${_T`Seats`}<select data-onlg="seats" ${ONLC.EVENTS_TEAM.includes(g.ev)?'disabled':''}>${[2,3,4].map(n=>`<option ${(ONLC.EVENTS_TEAM.includes(g.ev)?4:+g.seats)===n?'selected':''}>${n}</option>`).join('')}</select></label>
   <label>${_T`Mode`}<select data-onlg="ranked"><option value="1" ${g.ranked?'selected':''}>${_T`⚔ Ranked — your rank only, Fate is final`}</option><option value="0" ${g.ranked?'':'selected'}>${_T`Custom — anyone, no deaths`}</option></select></label>
   <label>${_T`Ticket to the stands`}<select data-onlg="ticket">${[0,2,5,10,20].map(n=>`<option value="${n}" ${+g.ticket===n?'selected':''}>${n?n+_T(' coin (into the wager pot)'):_T('no tickets')}</option>`).join('')}</select></label></div>
   <div class="acts"><button type="button" class="btn primary" data-onl="host">${_T`Host it`}</button><button type="button" class="btn" data-onl="nogame">${_T`Cancel`}</button></div></div>`}
function onlBetHTML(){const L=ONL.lobbies.find(x=>x.id===ONL.betting.id);if(!L)return '';const me=ONL.acct.id;const mine=L.players.findIndex(p=>p.id===me);
  const opts=Array.from({length:L.seats},(_,i)=>{const p=L.players[i];return mine>=0&&i!==mine?'':`<option value="${i}">${esc2(p?p.name:_T('Seat ')+(i+1)+' (open)')}</option>`}).join('');
  return `<div class="card2 onl-mk">${_T`<b>💰 Wager on ${esc2(onlEvName(L.ev))}</b>`} <span class="rc-sub">${_T`pool ${coinAmt87(L.pool||0)} · winners split it, 5% to the host · ${mine>=0?_T('a fighter may only back themselves'):_T('bets close when the match starts')}`}</span>
   <div class="formgrid"><label>${_T`Back`}<select id="onlBetSeat">${opts}</select></label><label>${_T`Stake`}<input class="tin" id="onlBetAmt" type="number" min="${ONLC.WAGER.min}" max="${Math.min(ONLC.WAGER.max,ONL.char.wallet)}" value="${Math.min(10,ONL.char.wallet)}"></label></div>
   <div class="acts"><button type="button" class="btn primary" data-onl="betgo" data-v="${L.id}">${_T`Place the wager`}</button><button type="button" class="btn" data-onl="nobet">${_T`Cancel`}</button></div></div>`}
function onlSpectHTML(){const me=ONL.acct.id;const live=ONL.lobbies.filter(L=>L.status==='live'&&!L.players.some(p=>p.id===me));const soon=ONL.lobbies.filter(L=>L.status==='waiting'&&L.ticket&&!L.players.some(p=>p.id===me));
  const card=(L,btns)=>`<div class="card2 onl-sp">${typeof cardHTML==='function'?cardHTML('e:'+L.ev,'sm'):''}<div><b>${esc2(onlEvName(L.ev))}</b> · ${esc2(onlCityName(L.loc))}${L.team?' · 👥 2v2':''}<div class="rc-sub">${L.players.map(p=>esc2(p.name)).join(' · ')}</div><div class="rc-sub">${_T`👁 ${L.watchers||0} watching · 🎟 ${(L.stands||[]).length} in the stands · pot ${coinAmt87((L.pool||0)+(L.pot||0))}`}</div><div class="acts">${btns}</div></div></div>`;
  return `<h3>${_T`👁 Spectate`}</h3><p class="rc-sub">${_T`Watch any live game for free, move by move. A ticket, bought before the horns, gives you a seat in the stands: each rotation you earn ${cfAmt87(1)} to throw stones, make offerings, change sections or chant. Ticket coin goes into the wager pot.`}</p>
   <h4 class="onl-h">${_T`Live now`}</h4><div class="onl-spgrid">${live.map(L=>card(L,`<button type="button" class="btn tksm primary" data-onl="watch" data-v="${L.id}">${_T`👁 Watch`}</button>${(L.stands||[]).some(t=>t.id===me)?`<button type="button" class="btn tksm" data-onl="enter" data-v="${L.id}">${_T`🎟 Take your seat`}</button>`:''}`)).join('')||`<p class="rc-sub">${_T`Nothing live right now.`}</p>`}</div>
   <h4 class="onl-h">${_T`Tickets on sale`}</h4><div class="onl-spgrid">${soon.map(L=>card(L,(L.stands||[]).some(t=>t.id===me)?_T('<span class="badge gold">🎟 Yours</span>'):`<button type="button" class="btn tksm primary" data-onl="ticket" data-v="${L.id}">${_T`🎟 Ticket · ${L.ticket}`}</button>`)).join('')||`<p class="rc-sub">${_T`No game is selling tickets yet. A host sets a price when making the game.`}</p>`}</div>`}
function onlArmoryHTML(){const ch=ONL.char;const R=ONLC.rankFor(ch);const cat=onlCatalog();const f=ONL.mkt||'w';
  const items=Object.entries(cat).filter(([k,it])=>it.kind===f).sort((a,b)=>a[1].lv-b[1].lv||a[1].n.localeCompare(b[1].n));
  return `<div class="onl-lbtop"><h3>${_T`🛒 Armory &amp; Market`}</h3><div class="rc-sub">${_T`Wallet ${typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙'} <b>${ch.wallet}</b> · ${esc2(R.n)} buys up to level ${R.mkt}`}</div></div>
   <div class="seg" style="margin-bottom:8px"><button type="button" data-onl="mkt" data-v="w" class="${f==='w'?'on':''}">${_T`⚔ Weapons`}</button><button type="button" data-onl="mkt" data-v="a" class="${f==='a'?'on':''}">${_T`🛡 Armor`}</button></div>
   <div class="onl-mkgrid">${items.map(([k,it])=>{const why=ONLC.canBuy(ch,k,cat);const own=(ch.gear||[]).includes(k);const art=typeof cardHTML==='function'?cardHTML((it.kind==='w'?'w:':'a:')+k,'sm'):'';
     return `<div class="onl-it ${why&&!own?'no':''} ${own?'own':''}">${_T`${art}<b>${esc2(it.n)}</b><small>Level ${it.lv} · ${coinAmt87(ONLC.PRICE[it.lv])}</small>${own&&!it.stack?_T('<span class="badge gold">Yours</span>'):`<button type="button" class="btn tksm ${why?'':'primary'}" data-onl="buy" data-v="${k}" ${why?_T`disabled title="${esc2(why)}"`:''}>${_T`Buy`}</button>`}`}</div>`}).join('')}</div>`}
function onlCharHTML(){const ch=ONL.char;const cat=onlCatalog();const CK=CLASSES[ch.cls]||{};const kit=[CK.R,CK.L].filter(Boolean).map(k=>(W[k]||{}).n).filter(Boolean);
  return `<div class="onl-cprof">${onlStageHTML(ch)}<div class="card2">${_T`<b>Record</b>`}<table class="tally compact"><tr><td>${_T`Bouts`}</td><td>${ch.bouts}</td></tr><tr><td>${_T`Won`}</td><td>${ch.wins}</td></tr><tr><td>${_T`Ranked bouts survived`}</td><td>${ch.survived}</td></tr><tr><td>${_T`Lifetime CF`}</td><td>${ch.lifeCF}</td></tr><tr><td>${_T`Kills`}</td><td>${ch.kills}</td></tr></table>
   ${_T`<b>Kit</b>`}<p class="rc-sub">${_T`Recruit kit: ${esc2(kit.join(', ')||_T('the class weapons'))}${(ch.gear||[]).length?' · bought: '+esc2(ch.gear.map(k=>(cat[k]||{}).n||k).join(', ')):''}`}</p>
   ${_T`<b>Ratings</b>`}<p class="rc-sub">${ONLC.STAT_KEYS.map(k=>`${k.toUpperCase()} ${ch.stats[k]}`).join(' · ')}</p></div></div>`}
async function onlHallLoad(){try{ONL.hall=await NET.req('hall.list')}catch(e){}onlRedraw()}
function onlHallHTML(){if(!ONL.hallAt||Date.now()-ONL.hallAt>20000){ONL.hallAt=Date.now();setTimeout(onlHallLoad,0)}
  return `<h3>${_T`🪦 The Hall of the Fallen`}</h3><p class="rc-sub">${_T`Only the great are remembered: those who fell at Veteranus or above, or with a legendary feat. The rest suffer damnatio memoriae.`}</p>
   <div class="onl-hall">${(ONL.hall||[]).map(e=>`<div class="onl-tomb">${_T`${onlMini(e.cls,90)}<b>${esc2(e.name)}</b>${onlRankChip(e.rank)}<small>${cfAmt87(e.lifeCF)} · ${e.survived} survived</small><small class="rc-sub">${esc2(e.why||'')}</small>`}</div>`).join('')||`<p class="rc-sub">${_T`No one yet worthy of the Hall.`}</p>`}</div>
   ${!ONL.char&&ONL.acct?`<div class="mbtns"><button type="button" class="btn primary" data-onl="tab" data-v="play">${_T`⚔ Make a new gladiator`}</button></div>`:''}`}

/* ---------------- the controls ---------------- */
async function onlDo(fn){if(ONL.busy)return;ONL.busy=true;ONL.err='';try{await fn()}catch(e){ONL.err=e.message;if(typeof mToast==='function')mToast('⚠ '+esc2(e.message))}finally{ONL.busy=false;onlRedraw()}}
document.addEventListener('click',e=>{const b=e.target.closest('#onl [data-onl]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.onl,v=b.dataset.v;
  if(a==='tab'){ONL.tab=v;onlRedraw();return}
  if(a==='google'){if(NET.mode==='aws'&&typeof netSignIn==='function')return netSignIn();if(typeof mToast==='function')mToast(_T('Google sign-in opens once the AWS template is deployed. Use a name for now.'));return}
  if(a==='mocksign')return onlDo(async()=>{ONL.acct=await NET.req('auth.signin',{name:($('#onlName')||{}).value});await onlRefresh()});
  if(a==='signout')return onlDo(async()=>{await NET.req('auth.signout');ONL.acct=null;ONL.char=null});
  if(a==='cls'){ONL.creating.cls=v;onlRedraw();return}
  if(a==='face'){ONL.creating.look={portrait:typeof randomPortrait==='function'?randomPortrait():null};onlRedraw();return}
  if(a==='nonew'){ONL.newGlad=false;ONL.creating=null;onlRedraw();return}
  if(a==='create')return onlDo(async()=>{const d=ONL.creating;d.name=($('#onlCName')||{}).value||d.name;const made=await NET.req('char.create',d);ONL.creating=null;ONL.newGlad=false;await onlRefresh();ONL.tab=ONL.chars.filter(c=>c.alive).length>1?'char':'play';ONL.gsel=made.id;ONL.char=ONL.char||made;if(typeof mToast==='function')mToast(_T`⚔ <b>${esc2(ONL.char.name)}</b> enters the arena — a Tiro with an empty purse.`)});
  if(a==='refresh')return onlDo(onlRefresh);
  if(a==='newgame'){ONL.mkgame={ev:'democritus',loc:6,seats:4,ranked:true,ticket:0};onlRedraw();return}
  if(a==='nogame'){ONL.mkgame=null;onlRedraw();return}
  if(a==='host')return onlDo(async()=>{await NET.req('lobby.create',ONL.mkgame);ONL.mkgame=null;ONL.lobbies=await NET.req('lobby.list')});
  if(a==='quick'){const [ev,rk]=v.split('|');return onlDo(async()=>{const me=ONL.acct.id;const R=ONLC.rankFor(ONL.char).k;
    const n=ONL.party?ONL.party.members.length:1;
    const L=ONL.lobbies.find(L=>L.status==='waiting'&&L.ev===ev&&!!L.ranked===(rk==='1')&&!ONLC.canJoin(L,{id:me,rank:R,char:ONL.char.id})&&!L.players.some(p=>p.id===me)&&L.players.length+n<=L.seats&&(!L.team||['A','B'].some(t=>L.players.filter(p=>p.team===t).length+n<=L.seats/2)));
    if(L)await NET.req('lobby.join',{id:L.id});else await NET.req('lobby.create',{ev,loc:6,seats:4,ranked:rk==='1',ticket:0});ONL.lobbies=await NET.req('lobby.list')})}
  if(a==='join')return onlDo(async()=>{await NET.req('lobby.join',{id:v});ONL.lobbies=await NET.req('lobby.list')});
  if(a==='leave')return onlDo(async()=>{await NET.req('lobby.leave',{id:v});ONL.lobbies=await NET.req('lobby.list')});
  if(a==='ready')return onlDo(async()=>{await NET.req('lobby.ready',{id:v,ready:true});ONL.lobbies=await NET.req('lobby.list')});
  if(a==='start')return onlDo(async()=>{const L=await NET.req('lobby.start',{id:v});onlEnter(L)});
  if(a==='enter'){const L=ONL.lobbies.find(x=>x.id===v);if(L)onlEnter(L);return}
  if(a==='watch'){const L=ONL.lobbies.find(x=>x.id===v);if(!L||L.status!=='live'){if(typeof mToast==='function')mToast(_T('👁 Watching opens when the horns sound.'));return}return onlDo(()=>onlWatch(L))}
  if(a==='ticket')return onlDo(async()=>{const r=await NET.req('lobby.ticket',{id:v});ONL.char=r.char;ONL.lobbies=await NET.req('lobby.list');if(typeof mToast==='function')mToast(_T`🎟 A seat in the stands at ${esc2(onlCityName(r.lobby.loc))} — it opens when the horns sound.`)});
  if(a==='pinvite')return onlDo(async()=>{ONL.party=await NET.req('party.create');try{navigator.clipboard&&navigator.clipboard.writeText(ONL.party.code).catch(()=>{})}catch(e){}if(typeof mToast==='function')mToast(_T`👥 Your party code: <b>${esc2(ONL.party.code)}</b> — send it to a friend.`)});
  if(a==='pjoin')return onlDo(async()=>{ONL.party=await NET.req('party.join',{code:($('#onlPCode')||{}).value});if(typeof mToast==='function')mToast(_T('👥 You joined the party.'))});
  if(a==='pleave')return onlDo(async()=>{await NET.req('party.leave');ONL.party=null});
  if(a==='bet'){ONL.betting={id:v};ONL.tab='lobby';onlRedraw();return}
  if(a==='nobet'){ONL.betting=null;onlRedraw();return}
  if(a==='betgo')return onlDo(async()=>{const r=await NET.req('bet.place',{id:v,seat:+($('#onlBetSeat')||{}).value,amt:+($('#onlBetAmt')||{}).value});ONL.char=r.char;ONL.betting=null;ONL.lobbies=await NET.req('lobby.list');if(typeof mToast==='function')mToast(_T('💰 Wager placed.'))});
  if(a==='mkt'){ONL.mkt=v;onlRedraw();return}
  if(a==='buy')return onlDo(async()=>{ONL.char=await NET.req('char.buy',{char:ONL.char.id,item:v});if(typeof mToast==='function')mToast(_T`🛒 Bought ${esc2((onlCatalog()[v]||{}).n||v)}.`)})},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#onl'))return;
  if(t.dataset.onlf&&ONL.creating){ONL.creating[t.dataset.onlf]=t.value;const n=document.querySelector('.onl-cname');if(n)n.textContent=t.value||_T('Nameless')}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.onlg==null||!ONL.mkgame)return;const k=t.dataset.onlg;ONL.mkgame[k]=k==='ranked'?t.value==='1':k==='ev'?t.value:+t.value;if(k==='ev'){if(ONLC.EVENTS_TEAM.includes(t.value))ONL.mkgame.seats=4;onlRedraw()}},true);
NET.on('party.update',async()=>{if(!ONL.acct||!document.getElementById('onl'))return;try{ONL.party=await NET.req('party.get')}catch(e){}onlRedraw()});

/* ---------------- into the sand (phase 1: the lobby plays here; empty and remote seats are CPUs) ---------------- */
function onlSeatsFor(L){const seats=[];const used=new Set();const tm=ONLC.seatTeams(L);
  L.players.forEach(p=>{const bot=/^bot/.test(p.id);const k=p.kit||{};let cls=k.cls&&!used.has(k.cls)?k.cls:(ONLC.CLASSES8.find(x=>!used.has(x))||'soldier');used.add(cls);
    seats.push({cls,cpu:bot,name:k.name||p.name,stats:k.stats?{...k.stats}:undefined,onl:{id:p.id,char:p.char||null,gear:bot?null:(k.gear||[])}})});
  while(seats.length<L.seats){const cls=ONLC.CLASSES8.find(k=>!used.has(k))||'soldier';used.add(cls);seats.push({cls,cpu:true})}
  if(tm)seats.forEach((s,i)=>{s.team=tm[i]});return seats}
/* owners of every decision seat: the fighters (null = a CPU), then the ticket holders in the stands */
function onlOwnersFor(L,seats){return seats.map(s=>s.onl&&!s.cpu?s.onl.id:null).concat((L.stands||[]).map(t=>t.id))}
function onlEnter(L){if(!ONL.char)return;const seats=onlSeatsFor(L);let mine=seats.findIndex(s=>s.onl&&s.onl.id===ONL.acct.id);const host=L.host.id===ONL.acct.id;
  const tk=(L.stands||[]).findIndex(t=>t.id===ONL.acct.id);if(mine<0&&tk>=0)mine=L.seats+tk;
  const owners=onlOwnersFor(L,seats);const onl={lobby:L.id,ranked:!!L.ranked,seat:mine,owners,host,stands:(L.stands||[]).map(t=>({id:t.id,name:t.name})),fighters:L.seats,team:!!L.team};
  ONL.live={id:L.id,ranked:!!L.ranked,seat:mine,char:ONL.char.id,seed:L.seed};if(CUR_MODAL)CUR_MODAL.done('enter');
  setTimeout(()=>{try{menuHide()}catch(e){}if(host||typeof onlJoinMatch!=='function')startEvent({ev:L.ev,loc:L.loc,seats,seed:L.seed,opts:{spect:0},onl});else onlJoinMatch(L,onl)},120)}
{const base=startEvent;startEvent=function(cfg){const r=base.apply(this,arguments);try{if(cfg&&cfg.onl&&S){S.onl={...cfg.onl};if(ONL.live)ONL.live.started=Date.now();onlSeatStands(cfg.onl)}}catch(e){console.error(e)}return r}}
/* ticket holders sit in the stands as human spectators (the host seats them before the opening snapshot; everyone else loads it) */
function onlSeatStands(onl){if(!onl.stands||!onl.stands.length||!S.spect||EV().noSpect)return;
  onl.stands.forEach((t,k)=>{const id=S.spect.length?Math.max(...S.spect.map(s=>s.id))+1:0;
    S.spect.push({id,rid:'onl:'+t.id,name:t.name,taste:'cf',temper:'loyal',look:{skin:SKINS[k%SKINS.length],hair:HAIRS[(k*3)%HAIRS.length],beard:k%2===1,long:false},mem:[],visits:0,grudgeName:null,isNew:false,trouble:0,
      cf:0,sec:SEAT_SEC[(k*3)%SEAT_SEC.length],fav:undefined,favCls:null,mood:20,grudge:null,bet:null,human:true,onlIdx:onl.fighters+k,gone:false,log:[],ticket:1})});
  S.attendance=S.spect.length}
/* the gladiator's own kit: the class weapons, no class armor, plus what the wallet bought (seat.onl.gear) */
{const base=mkPlayer;mkPlayer=function(i,seat){const p=base.apply(this,arguments);try{if(seat&&seat.onl&&seat.onl.gear)p._onlKit=seat.onl.gear.slice()}catch(e){}return p}}
{const base=giveLoadout;giveLoadout=function(p){if(!p||!p._onlKit)return base.apply(this,arguments);const C=CLASSES[p.cls];const keep=C.armor;C.armor=[];let r;try{r=base.apply(this,arguments)}finally{C.armor=keep}
  const cat=onlCatalog();const LOC={head:['head'],chest:['chest'],belt:['chest'],arm:['rarm','larm'],leg:['rleg','lleg']};
  for(const k of p._onlKit){const it=cat[k];if(!it)continue;
    if(it.kind==='a'){const sl=(ARM[k]||{}).slot;for(const loc of LOC[sl]||[sl])if(p.pieces&&p.pieces[loc]&&equipPiece(p,k,loc))break}
    else if(it.kind==='w'){const w=mkW(k);if(!p.wR)p.wR=w;else if(!p.wL&&!p.wR.both)p.wL=w;else p.wR=w;try{marketPull(k)}catch(e){}}}
  return r}}
{const base=gameOver;gameOver=async function(winners,reason){const on=S&&S.onl;const r=await base.apply(this,arguments);try{if(on&&ONL.live&&!ONL.live.reported)await onlReport(winners)}catch(e){console.error(e)}return r}}
function onlRow(p,winners){const LR=S.lastResult||{};const row=(LR.rows||[]).find(x=>x.id===p.id)||{};const won=(winners||[]).some(w=>(w&&w.id)===p.id);
  const order=(S.elimOrder||[]).map(o=>o.id);const out=order.indexOf(p.id);const place=won?1:out<0?Math.min(S.players.length,2):Math.max(2,S.players.length-out);
  return {seat:S.players.indexOf(p),won,place,f:row.f|0,coin:p.coin|0,kills:(p.trophies||[]).filter(t=>t.pk==='player').length,survives:row.survives!==false,slew:(p.trophies||[]).some(t=>/commodus/i.test(String(t.k||t.n||'')))?['commodus']:[]}}
/* ANTI-CHEAT: report the WHOLE table (every seat); the server pays out from the table the players agree on */
async function onlReport(winners){const L=ONL.live;L.reported=true;if(!S.players[L.seat])return;const table=S.players.map(p=>onlRow(p,winners));
  const res=await NET.req('match.result',{id:L.id,char:L.char,seat:L.seat,table,hash:typeof onlHash==='function'?onlHash():''});if(res.pending){ONL.waitSettle=L.id;setTimeout(()=>{if(typeof mToast==='function')mToast(_T('⏳ Waiting for the other lanistas to confirm the result…'))},2500);return}
  onlSettled(res)}
function onlSettled(res){if(res.char)ONL.char=res.char.alive?res.char:null;const o=res.out;let msg;
  if(res.void)msg=_T('⚖ The lanistas did not agree on the result — the match is void: no pay, no deaths.');
  else if(!o)msg=_T('⚖ The match is settled.');
  else msg=o.died?(o.hall?_T`🪦 <b>${esc2(res.char.name)}</b> is dead. The Hall of the Fallen keeps the name.`:_T`🌫 <b>${esc2(res.char.name)}</b> is dead — and forgotten.`)
    :_T`${coinAmt87('+'+(o.pay))} · ⭐ +${o.cf} lifetime CF${o.rankUp?_T` · ⚔ now <b>${esc2(onlRank(o.rankUp).n)}</b>`:''}`;
  setTimeout(()=>{if(typeof mToast==='function')mToast(msg)},2500)}
NET.on('match.settled',d=>{if(!d||!ONL.acct||(d.to&&d.to!==ONL.acct.id))return;if(ONL.waitSettle!==d.id)return;ONL.waitSettle=null;onlSettled(d)});

{const st=document.createElement('style');st.textContent=`
#onl{min-height:70vh}.onl-wrap{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px}
.onl-rail{display:flex;flex-direction:column;gap:4px;position:sticky;top:0;align-self:start}.onl-rail button{all:unset;cursor:pointer;padding:10px 12px;border-radius:8px;border:1px solid transparent;font-size:15px}
.onl-rail button:hover{background:rgba(255,255,255,.05)}.onl-rail button.on{background:rgba(232,201,106,.12);border-color:var(--gold,#e8c96a);color:var(--gold,#e8c96a)}
.onl-acct{margin-top:14px;padding:10px;border-top:1px solid var(--line,#4a3a28);display:grid;gap:4px}.onl-acct small{color:var(--muted)}
.onl-rk{display:inline-block;padding:1px 8px;border-radius:999px;font:600 11px var(--mono);border:1px solid #6b5636;background:rgba(0,0,0,.25)}
.onl-rk-gregarius{border-color:#7c8a99}.onl-rk-veteranus{border-color:#b0802c;color:#e8c96a}.onl-rk-primus{border-color:#c0433a;color:#f0a090}.onl-rk-summa{border-color:#e8c96a;color:#fff;background:linear-gradient(90deg,#6b4a12,#a8781c)}
.onl-play{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px}
.onl-stage{position:relative;display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:end;padding:18px 20px 16px;border-radius:12px;overflow:hidden;min-height:300px;
  background:radial-gradient(ellipse 55% 70% at 22% 40%,rgba(255,214,140,.28),transparent 70%),linear-gradient(180deg,#2a1d12,#140d08);border:1px solid #5a4428}
.onl-stage .onl-mini{filter:drop-shadow(0 18px 12px rgba(0,0,0,.6))}.onl-plate{display:grid;gap:6px;align-self:center}.onl-pname{font:700 30px Georgia,serif;color:var(--gold,#e8c96a)}
.onl-pstats{display:flex;flex-wrap:wrap;gap:12px;font-size:14px}.onl-pstats img{height:16px;vertical-align:-3px}
.onl-bar{height:8px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;max-width:360px}.onl-bar i{display:block;height:100%;background:linear-gradient(90deg,#8a6a2a,#e8c96a)}
.onl-party{grid-column:1/-1;display:flex;gap:10px}.onl-slot{width:84px;height:96px;border:1px dashed #6b5636;border-radius:10px;display:grid;place-items:center;font-size:22px;color:var(--muted)}.onl-slot.me{border-style:solid;border-color:var(--gold,#e8c96a)}.onl-slot small{font-size:11px}
.onl-side{display:grid;gap:10px;align-content:start}.onl-ch,.onl-news{font-size:13px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.onl-h{margin:16px 0 8px}.onl-pls{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
.onl-pl{display:grid;grid-template-columns:110px 1fr;gap:10px;padding:10px;border:1px solid #5a4428;border-radius:10px;background:rgba(255,255,255,.03)}.onl-pl:hover{border-color:var(--gold,#e8c96a)}.onl-plart img,.onl-plart .cardimg{max-width:100%}.onl-plb{display:grid;gap:4px;align-content:start}.onl-plb b{font:700 18px Georgia,serif}
.onl-mine{margin-top:14px;border-color:var(--gold,#e8c96a)!important}.onl-seats{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.onl-seat{padding:4px 10px;border-radius:8px;border:1px dashed #6b5636;font-size:13px;color:var(--muted)}.onl-seat.on{border-style:solid;color:inherit}
.onl-lbtop{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.onl-lb td,.onl-lb th{padding:6px 8px}.onl-lb tr.mine td{background:rgba(232,201,106,.07)}.onl-lb .acts{display:flex;gap:4px;justify-content:flex-end}
.onl-spgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px}.onl-sp{display:grid;grid-template-columns:90px 1fr;gap:10px}
.onl-mkgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.onl-it{display:grid;gap:4px;justify-items:center;text-align:center;padding:8px;border:1px solid #5a4428;border-radius:10px}.onl-it.no{opacity:.55}.onl-it.own{border-color:var(--gold,#e8c96a)}
.onl-cprof{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:14px}
.onl-hall{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}.onl-tomb{display:grid;justify-items:center;gap:4px;padding:12px;border:1px solid #4a4a4a;border-radius:10px;background:linear-gradient(180deg,#2a2622,#191512);text-align:center}
.onl-sign{display:grid;place-items:center;min-height:60vh}.onl-sign-card{max-width:460px;text-align:center;display:grid;gap:12px;padding:28px;border:1px solid #5a4428;border-radius:14px;background:radial-gradient(ellipse at top,rgba(255,214,140,.12),transparent 70%)}
.onl-google{font-size:16px;padding:10px 18px}.onl-google b{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#fff;color:#4285f4;margin-right:8px}
.onl-mocknote{font-size:13px;color:var(--muted);text-align:left;padding:10px;border:1px dashed #6b5636;border-radius:8px}
.onl-create{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px}.onl-cstage{display:grid;justify-items:center;align-content:start;gap:6px;padding:18px;border-radius:12px;background:radial-gradient(ellipse 60% 60% at 50% 40%,rgba(255,214,140,.25),transparent 70%),#1a120b;border:1px solid #5a4428}
.onl-cname{font:700 24px Georgia,serif;color:var(--gold,#e8c96a)}.onl-cform{display:grid;gap:8px;align-content:start}
.onl-clsgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}.onl-cls{all:unset;cursor:pointer;display:grid;justify-items:center;gap:4px;padding:6px;border:1px solid #5a4428;border-radius:8px;font-size:12px;opacity:.7}.onl-cls.on{opacity:1;border-color:var(--gold,#e8c96a);background:rgba(232,201,106,.1)}.onl-cls img{max-width:100%}
.onl-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px}.onl-stats label{display:grid;grid-template-columns:1fr auto;gap:2px 8px}.onl-stats input{grid-column:1/-1}
.onl-err{color:#f0a090}.onl-party{align-items:center;flex-wrap:wrap}.onl-slot.on{border-style:solid;font-size:12px;text-align:center;padding:4px}button.onl-slot{cursor:pointer;background:none;font:inherit}button.onl-slot:hover{border-color:var(--gold,#e8c96a);color:var(--gold,#e8c96a)}
.onl-pbox{display:grid;gap:6px;font-size:13px;margin-left:6px}.onl-pbox .btn{justify-self:start}.onl-code{font:700 18px var(--mono);letter-spacing:2px;color:var(--gold,#e8c96a)}.onl-pl.team{border-color:#3a6a9a}
.onl-team{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:4px;margin-right:6px;font:700 11px var(--mono);font-style:normal;color:#fff}.onl-team.tA{background:#a83a2c}.onl-team.tB{background:#2c5ea8}.onl-st0{display:flex;flex-wrap:wrap;gap:8px}.onl-st0 span{padding:4px 10px;border:1px solid #5a4428;border-radius:8px;font-size:13px}.onl-st0 b{color:var(--gold,#e8c96a)}
@media(max-width:760px){.onl-wrap,.onl-play,.onl-create,.onl-cprof{grid-template-columns:1fr}.onl-rail{position:static;flex-direction:row;flex-wrap:wrap}.onl-stage{grid-template-columns:1fr;justify-items:center;text-align:center}}
`;document.head.appendChild(st)}
/* no sim in online matches (the other seats are people); tests may set S.onl.testSim */
{const base=simToEnd;simToEnd=function(){if(S&&S.onl&&!S.onl.testSim){if(typeof mToast==='function')mToast(_T('⏭ No simming online — the other seats are people.'));return}return base.apply(this,arguments)}}
