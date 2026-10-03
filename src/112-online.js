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
cheatRegister('h2982904736',()=>{try{localStorage.setItem('flavius_online77','1')}catch(e){}try{onlMenuBtn()}catch(e){}return '🌐 <b>Online</b> is open — Multiplayer → 🌐 Online (a mock server until the AWS template is deployed).'},'Online (preview)');
CHEAT_SHOW.push([[83,86,73,73,96,62,62],'🌐 Opens Multiplayer → Online before it ships (a preview against a mock server)']);

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
const MOCK_HOSTS=[['Marcus of Capua','hero'],['Thrax the Patient','slave'],['Iulia Ferox','amazonia'],['Old Crixus','veteranus'],['Nerva the Bold','soldier'],['Gaia Lupa','venatore']];
function mockSeedWorld(w){if(w.seeded)return;w.seeded=1;const now=Date.now();
  MOCK_HOSTS.forEach(([n,cls],i)=>{const id='bot'+i;w.accounts[id]={id,name:n,bot:1};const ch=ONLC.newChar({name:n,cls,stats:{spd:75,str:75,int:75,lck:75,cha:75}},id,'bc'+i,now);
    ch.survived=[0,2,8,20,1,40][i];ch.lifeCF=[10,60,150,320,30,700][i];ch.rank=ONLC.rankFor(ch).k;ch.wallet=20+i*9;w.chars[ch.id]=ch;
    if(i<4){const L=ONLC.newLobby({ev:ONLC.EVENTS3[i%3],loc:[3,6,9,1][i],ranked:i%2===0,seats:4,ticket:i===1?5:0},{id,name:n,char:ch.id,rank:ch.rank},'L'+(w.seq++),now-i*60000);L.mock=1;L.ping=40+i*23;if(i===3){L.status='live';L.players.push({id:'bot4',name:'Nerva the Bold',rank:'tiro'},{id:'bot5',name:'Gaia Lupa',rank:'primus'})}w.lobbies[L.id]=L}});
  w.hall.push({name:'Spartacus of Thrace',cls:'slave',rank:'summa',lifeCF:1450,survived:71,diedAt:now-86400000*12,why:'Summa Rudis'},{name:'Flamma the Syrian',cls:'veteranus',rank:'primus',lifeCF:880,survived:34,diedAt:now-86400000*3,why:'Primus Palus'});
  w.news=[['🏛','The Colosseum games are on — Capua fills its tiers.'],['⚔','Old Crixus reached Veteranus after 20 bouts.'],['🪦','Flamma the Syrian fell at Pompeii. The Hall remembers.']]}
const MOCK_ROUTES={
  'hello':(w,d,me)=>{const a=me&&w.accounts[me]||null;const o={ver:ONLC.VER,mode:'mock',me:a};if(d.all&&a){o.chars=Object.values(w.chars).filter(c=>c.owner===me).sort((x,y)=>y.born-x.born);o.lobbies=MOCK_ROUTES['lobby.list'](w);
    o.news=w.news.slice(0,8);o.online=Object.keys(w.accounts).length+37;o.challenges=ONLC.weekChallenges(Date.now())}return o},
  'auth.signin':(w,d)=>{const name=ONLC.cleanName(d.name);if(name.length<2)throw new Error('Your name: 2–24 letters.');const id='u'+(w.seq++)+Math.random().toString(36).slice(2,6);
    w.accounts[id]={id,name,since:Date.now()};try{sessionStorage.setItem('flavius_onlacct',id);localStorage.setItem('flavius_onlacct',id)}catch(e){}return w.accounts[id]},
  'auth.signout':(w,d,me)=>{try{sessionStorage.removeItem('flavius_onlacct');localStorage.removeItem('flavius_onlacct')}catch(e){}return {}},
  'char.mine':(w,d,me)=>Object.values(w.chars).filter(c=>c.owner===me).sort((a,b)=>b.born-a.born),
  'char.create':(w,d,me)=>{if(!me)throw new Error('Sign in first.');if(Object.values(w.chars).some(c=>c.owner===me&&c.alive))throw new Error('One living gladiator at a time.');
    const ch=ONLC.newChar(d,me,'g'+(w.seq++),Date.now());w.chars[ch.id]=ch;return ch},
  'char.buy':(w,d,me)=>{const ch=w.chars[d.char];if(!ch||ch.owner!==me)throw new Error('Not yours.');ONLC.buy(ch,d.item,onlCatalog());return ch},
  'lobby.list':(w)=>Object.values(w.lobbies).filter(L=>L.status!=='done').sort((a,b)=>b.created-a.created),
  'lobby.create':(w,d,me)=>{const ch=onlMockChar(w,me);if(d.ranked&&!ch)throw new Error('Ranked needs a living gladiator.');
    for(const L of Object.values(w.lobbies))if(L.status==='waiting'&&L.players.some(p=>p.id===me))throw new Error('You are already in a lobby.');
    const L=ONLC.newLobby(d,{id:me,name:w.accounts[me].name,char:ch&&ch.id,rank:ch?ONLC.rankFor(ch).k:'tiro',kit:ONLC.kitOf(ch)},'L'+(w.seq++),Date.now());L.ping=12;w.lobbies[L.id]=L;return L},
  'lobby.join':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error('That game is gone.');const ch=onlMockChar(w,me);const who={id:me,name:w.accounts[me].name,char:ch&&ch.id,rank:ch?ONLC.rankFor(ch).k:'tiro'};
    const why=ONLC.canJoin(L,who);if(why)throw new Error(why);if(!L.players.some(p=>p.id===me))L.players.push({...who,kit:ONLC.kitOf(ch),ready:false});return L},
  'lobby.leave':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)return {};L.players=L.players.filter(p=>p.id!==me);if(!L.players.length||L.host.id===me)L.status='done';return L},
  'lobby.ready':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error('That game is gone.');const p=L.players.find(p=>p.id===me);if(p)p.ready=!!d.ready;return L},
  'lobby.start':(w,d,me)=>{const L=w.lobbies[d.id];if(!L||L.host.id!==me)throw new Error('Only the host starts the game.');if(L.status!=='waiting')throw new Error('Already under way.');
    L.status='live';L.seed=(Math.random()*2**31)>>>0;L.started=Date.now();w.matches[L.id]={id:L.id,seed:L.seed,inputs:[],results:{},open:null};return L},
  'match.open':(w,d,me)=>{const M=w.matches[d.id];const L=w.lobbies[d.id];if(!M||!L)throw new Error('No such match.');if(L.host.id!==me)throw new Error('Only the host opens the match.');M.open=d.snap;mockPush('match.open',{id:d.id});return {}},
  'match.get':(w,d)=>{const M=w.matches[d.id];if(!M)throw new Error('No such match.');return {open:M.open,inputs:M.inputs.slice(d.from|0),seed:M.seed}},
  'match.input':(w,d,me)=>{const M=w.matches[d.id];const L=w.lobbies[d.id];if(!M||!L)throw new Error('No such match.');if(!L.players.some(p=>p.id===me))throw new Error('Not your match.');
    const inp={...d.in,from:me,seq:M.inputs.length};M.inputs.push(inp);mockPush('match.input',{id:d.id,in:inp});return {seq:inp.seq}},
  'match.snapreq':(w,d,me)=>{mockPush('match.snapreq',{id:d.id,to:d.to,from:me,seq:d.seq});return {}},
  'match.snap':(w,d,me)=>{mockPush('match.snap',{id:d.id,to:d.to,snap:d.snap,seq:d.seq,from:me});return {}},
  'lobby.watch':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error('That game is gone.');L.watchers=(L.watchers||0)+1;return L},
  'lobby.ticket':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error('That game is gone.');const ch=onlMockChar(w,me);if(!ch)throw new Error('Tickets are paid from a gladiator’s wallet.');
    if((ch.wallet||0)<L.ticket)throw new Error(`A ticket costs ${L.ticket} coin.`);ch.wallet-=L.ticket;L.tickets=(L.tickets||0)+1;L.pot=(L.pot||0)+L.ticket;return {lobby:L,char:ch}},
  'bet.place':(w,d,me)=>{const L=w.lobbies[d.id];if(!L)throw new Error('That game is gone.');const ch=onlMockChar(w,me);if(!ch)throw new Error('Wagers are paid from a living gladiator’s wallet.');
    const amt=d.amt|0,seat=d.seat|0;const why=ONLC.betOK(L,me,seat,amt,ch.wallet);if(why)throw new Error(why);ch.wallet-=amt;(L.bets=L.bets||[]).push({by:me,char:ch.id,seat,amt});L.pool=(L.pool||0)+amt;return {lobby:L,char:ch}},
  'match.result':(w,d,me)=>{const L=w.lobbies[d.id];const ch=w.chars[d.char];if(!ch||ch.owner!==me)throw new Error('Not yours.');if(!ch.alive)throw new Error('The dead do not report.');
    const M=w.matches[d.id]||(w.matches[d.id]={id:d.id,results:{}});if(M.results[me])return {char:ch,out:M.results[me].out,dup:1};
    const out=ONLC.applyResult(ch,d.row,!!(L&&L.ranked));M.results[me]={row:d.row,hash:d.hash||'',out};
    if(out.died){const e={name:ch.name,cls:ch.cls,rank:ch.died.rank,lifeCF:ch.lifeCF,survived:ch.survived,diedAt:Date.now(),why:out.hall?onlHallWhy(ch):''};if(out.hall)w.hall.unshift(e);
      w.news.unshift(out.hall?['🪦',`${ch.name} fell. The Hall of the Fallen keeps the name.`]:['🌫',`${ch.name} fell and is forgotten.`])}
    if(out.rankUp)w.news.unshift(['⚔',`${ch.name} is now ${ONLC.RANKS[ONLC.rankIdx(out.rankUp)].n}.`]);w.news=w.news.slice(0,12);
    M.results[me].seat=d.seat|0;
    if(L&&Object.keys(M.results).length>=L.players.filter(p=>!/^bot/.test(p.id)).length){L.status='done';
      if((L.bets||[]).length){const wins=Object.values(M.results).filter(r=>r.row&&r.row.won).map(r=>r.seat);const st=ONLC.settle(L.bets,wins);
        for(const [by,v] of Object.entries(st.payouts)){const c=onlMockChar(w,by);if(c)c.wallet+=v}const hc=onlMockChar(w,L.host.id);if(hc&&st.cut)hc.wallet+=st.cut;L.settled=st}}
    return {char:w.chars[ch.id],out}},
  'hall.list':(w)=>w.hall.slice(0,60),
  'world.news':(w)=>({news:w.news.slice(0,8),online:Object.keys(w.accounts).length+37,challenges:ONLC.weekChallenges(Date.now())})};
function onlMockChar(w,me){return Object.values(w.chars).find(c=>c.owner===me&&c.alive)||null}
const onlHallWhy=ch=>ONLC.hallWhy(ch);
async function mockReq(t,d){const R=MOCK_ROUTES[t];if(!R)throw new Error('Unknown request: '+t);await new Promise(r=>setTimeout(r,30+Math.random()*60));
  const w=mockLoad();mockSeedWorld(w);const me=mockMe();const out=R(w,d,me);mockSave(w);if(/^lobby\./.test(t)&&t!=='lobby.list'||t==='match.result')mockPush('lobby.update',{id:d.id||(out&&out.id)});return JSON.parse(JSON.stringify(out===undefined?{}:out))}
/* the gear catalog: every printed weapon and armor piece the market sells, by level (the server ships the same list) */
function onlCatalog(){if(ONL.cat)return ONL.cat;const c={};for(const lv of [1,2,3]){for(const k of (typeof MARKET_W0!=='undefined'?MARKET_W0:MARKET_W)[lv]||[])if(W[k]&&!W[k].custom)c[k]={kind:'w',lv,n:W[k].n};
  for(const k of (typeof MARKET_A0!=='undefined'?MARKET_A0:MARKET_A)[lv]||[])if(ARM[k]&&!ARM[k].custom)c[k]={kind:'a',lv,n:ARM[k].n,stack:!!ARM[k].stack}}return ONL.cat=c}

/* ---------------- the menu: 🌐 Online opens behind the word ---------------- */
function onlMenuBtn(){const b=document.querySelector('#mainMenu [data-mm="online"]');if(!b)return;if(ONL_ON()){b.disabled=false;b.title='';const s=b.querySelector('small');if(s)s.textContent='preview · mock server'}}
{const base=menuShow;menuShow=function(){const r=base.apply(this,arguments);try{setTimeout(onlMenuBtn,0)}catch(e){}return r}}
document.addEventListener('click',e=>{const b=e.target.closest('#mainMenu [data-mm="multi"]');if(b)setTimeout(onlMenuBtn,0);const o=e.target.closest('#mainMenu [data-mm="online"]');if(!o||o.disabled)return;e.stopPropagation();
  if(typeof modalBusy==='function'&&modalBusy())return;mmLaunch(()=>onlineOpen(),'Online')},true);

/* ---------------- the window ---------------- */
const esc2=s=>typeof esc==='function'?esc(s):String(s);
function onlRank(k){return ONLC.RANKS[ONLC.rankIdx(k)]||ONLC.RANKS[0]}
function onlRankChip(k){const R=onlRank(k);return `<span class="onl-rk onl-rk-${R.k}" title="${esc2(R.n)}">${R.ic} ${esc2(R.n)}</span>`}
function onlMini(cls,h=220){const src=typeof MINI_URL!=='undefined'&&MINI_URL[cls];return src?`<img class="onl-mini" src="${typeof assetURL==='function'?assetURL(src.replace(/^assets\//,'')):src}" alt="" style="height:${h}px">`:`<span style="font-size:${h/3}px">🛡</span>`}
function onlEvName(k){return (EVENTS[k]||{}).n||k}
function onlCityName(i){return (LOCATIONS[i]||{}).n||'—'}
async function onlRefresh(){try{const h=await NET.req('hello',{all:1});ONL.acct=h.me;ONL.mode=h.mode;
    if(h.chars&&h.me){ONL.chars=h.chars;ONL.char=h.chars.find(c=>c.alive)||null;ONL.lobbies=h.lobbies||[];ONL.news=h.news||[];ONL.stats={challenges:h.challenges||[],online:h.online||0};return}}catch(e){ONL.err=e.message}
  if(ONL.acct){try{ONL.chars=await NET.req('char.mine');ONL.char=ONL.chars.find(c=>c.alive)||null}catch(e){}}
  try{ONL.lobbies=await NET.req('lobby.list')}catch(e){}try{const n=await NET.req('world.news');ONL.news=n.news;ONL.stats=n}catch(e){}}
function onlRedraw(){const r=document.getElementById('onl');if(!r)return;const sc=($('#mBody')||{}).scrollTop||0;r.innerHTML=onlHTML();const b=$('#mBody');if(b)b.scrollTop=sc}
let ONL_SUB=null;
async function onlineOpen(tab){if(typeof modalBusy==='function'&&modalBusy())return;ONL.tab=tab||ONL.tab||'play';await onlRefresh();
  if(!ONL_SUB)ONL_SUB=NET.on('lobby.update',async()=>{if(!document.getElementById('onl'))return;try{ONL.lobbies=await NET.req('lobby.list')}catch(e){}onlRedraw();if(typeof onlLobbyTick==='function')onlLobbyTick()});
  const v=await modal('🌐 Online',`<div id="onl">${onlHTML()}</div>`,[{label:'Close',value:'close'}],{wide:1,full:1,close:'close',onOpen:()=>{const x=$('#mClose');if(x){x.textContent='✖ Leave the Online arena';x.classList.add('saveq')}}});
  if(typeof v==='string'&&v.startsWith('play:'))onlPlay(v.slice(5))}
function onlHTML(){if(!ONL.acct)return onlSignInHTML();if(!ONL.char&&ONL.tab!=='hall')return onlCreatorHTML();
  const tabs=[['play','⚔ Play'],['lobby','📜 Lobby Browser'],['spect','👁 Spectate'],['armory','🛒 Armory & Market'],['char','🛡 Character'],['hall','🪦 Hall of the Fallen']];
  return `<div class="onl-wrap"><nav class="onl-rail">${tabs.map(([k,l])=>`<button type="button" data-onl="tab" data-v="${k}" class="${ONL.tab===k?'on':''}">${l}</button>`).join('')}
    <div class="onl-acct"><span>${esc2(ONL.acct.name)}</span><small>${ONL.mode==='mock'?'mock server · preview':'signed in'}</small><button type="button" class="btn tksm" data-onl="signout">Sign out</button></div></nav>
   <main class="onl-main">${({play:onlPlayHTML,lobby:onlLobbyHTML,spect:onlSpectHTML,armory:onlArmoryHTML,char:onlCharHTML,hall:onlHallHTML}[ONL.tab]||onlPlayHTML)()}</main></div>`}
function onlSignInHTML(){return `<div class="onl-sign"><div class="onl-sign-card"><h2>🌐 The Online Arena</h2><p>Fight real lanistas' gladiators. In Ranked, the Fate table is final: the dead stay dead.</p>
   <button type="button" class="btn primary onl-google" data-onl="google"><b>G</b> Sign in with Google</button>
   ${NET.mode==='mock'?`<div class="onl-mocknote"><b>Mock server.</b> Until the AWS template is deployed, sign in with a name. Open a second window to play yourself.<div style="display:flex;gap:6px;margin-top:6px"><input class="tin" id="onlName" maxlength="24" placeholder="Your lanista name"><button type="button" class="btn" data-onl="mocksign">Enter</button></div></div>`:''}</div></div>`}
/* the creator: name, class card, look, ratings */
function onlCreatorHTML(){const d=ONL.creating||(ONL.creating={name:typeof genName==='function'?genName():'',cls:'hero',look:{portrait:typeof randomPortrait==='function'?randomPortrait():null}});
  const L={spd:'Speed',str:'Strength',int:'Intelligence',lck:'Luck',cha:'Charisma'};const dead=ONL.chars.filter(c=>!c.alive)[0];
  return `<div class="onl-create"><div class="onl-cstage">${onlMini(d.cls,260)}<div class="onl-cname">${esc2(d.name||'Nameless')}</div><div class="rc-sub">${esc2((CLASSES[d.cls]||{}).name||'')} · ${onlRankChip('tiro')}</div></div>
   <div class="onl-cform"><h3>${dead?`${esc2(dead.name)} is gone. A new gladiator steps forward.`:'Your online gladiator'}</h3>
    <p class="rc-sub">Starts with the recruit kit (the class's weapons, no armor) and an empty wallet. Earn coin and CF to rank up; buy gear between bouts. Nothing carries over from a fallen gladiator.</p>
    <label>Name<span style="display:flex;gap:4px"><input class="tin" id="onlCName" data-onlf="name" value="${esc2(d.name)}" maxlength="24">${typeof diceBtn==='function'?diceBtn('#onlCName'):''}</span></label>
    <div class="sect">Class</div><div class="onl-clsgrid">${ONLC.CLASSES8.map(k=>`<button type="button" class="onl-cls ${d.cls===k?'on':''}" data-onl="cls" data-v="${k}">${typeof cardHTML==='function'?cardHTML('k:'+k,'sm'):''}<span>${esc2(CLASSES[k].name)}</span></button>`).join('')}</div>
    <div class="sect">Ratings <span class="rc-sub">every recruit starts the same</span></div>
    <div class="onl-st0">${ONLC.STAT_KEYS.map(k=>`<span><b>${ONLC.START_STATS[k]}</b> ${L[k]}</span>`).join('')}</div><p class="rc-sub" style="margin:0">They grow only by surviving: +1 to your lowest rating for every bout you live through, +1 more for a win.</p>
    <div class="mbtns"><button type="button" class="btn primary" data-onl="create">⚔ Enter the arena as a Tiro</button><button type="button" class="btn" data-onl="face">🎲 New face</button>${ONL.chars.length?'<button type="button" class="btn" data-onl="tab" data-v="hall">🪦 Hall of the Fallen</button>':''}</div>
    ${ONL.err?`<p class="onl-err">${esc2(ONL.err)}</p>`:''}</div></div>`}
function onlStageHTML(ch){const R=onlRank(ONLC.rankFor(ch).k),N=ONLC.nextRank(ch),pg=Math.round(ONLC.rankProgress(ch)*100);
  return `<div class="onl-stage"><div class="onl-light"></div>${onlMini(ch.cls,250)}<div class="onl-plate"><div class="onl-pname">${esc2(ch.name)}</div><div>${esc2((CLASSES[ch.cls]||{}).name||'')} · ${onlRankChip(R.k)}</div>
    <div class="onl-pstats"><span title="Wallet">${typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙'} ${ch.wallet}</span><span title="Lifetime Crowd Favor">⭐ ${ch.lifeCF} CF</span><span title="Ranked bouts survived">🛡 ${ch.survived} survived</span><span title="Bouts">⚔ ${ch.bouts} bouts · ${ch.wins} won</span></div>
    ${N?`<div class="onl-next"><div class="onl-bar"><i style="width:${pg}%"></i></div><small>Next: ${esc2(N.n)} — ${N.bouts} ranked bouts survived and ${N.cf} lifetime CF</small></div>`:'<div class="onl-next"><small>The highest rank there is.</small></div>'}</div>
    <div class="onl-party"><div class="onl-slot me">${onlMini(ch.cls,70)}<small>You</small></div><div class="onl-slot" title="Parties come with the team events">＋<small>Invite</small></div><div class="onl-slot" title="Parties come with the team events">＋<small>Invite</small></div></div></div>`}
function onlPlayHTML(){const ch=ONL.char;const S9=ONL.stats||{};const ch3=S9.challenges||[];
  const lists=ONLC.EVENTS3.map(k=>{const open=ONL.lobbies.filter(L=>L.ev===k&&L.status==='waiting');return `<div class="onl-pl"><div class="onl-plart">${typeof cardHTML==='function'?cardHTML('e:'+k,'sm'):''}</div><div class="onl-plb"><b>${esc2(onlEvName(k))}</b><small>${open.length} open · ${open.filter(L=>L.ranked).length} ranked</small>
    <div class="acts"><button type="button" class="btn primary tksm" data-onl="quick" data-v="${k}|1">⚔ Ranked</button><button type="button" class="btn tksm" data-onl="quick" data-v="${k}|0">Custom</button></div></div></div>`}).join('');
  return `<div class="onl-play">${onlStageHTML(ch)}<div class="onl-side"><div class="card2"><b>⚡ This week</b>${ch3.map(([t])=>`<div class="onl-ch">◻ ${esc2(t)}</div>`).join('')}</div>
    <div class="card2"><b>📰 The empire</b>${(ONL.news||[]).map(([i,t])=>`<div class="onl-news">${i} ${esc2(t)}</div>`).join('')}<small class="rc-sub">${S9.online||0} lanistas online</small></div></div></div>
   <h3 class="onl-h">Playlists <span class="rc-sub">Ranked pairs your rank only · Custom is anyone, no Fate deaths</span></h3><div class="onl-pls">${lists}</div>${onlMyLobbyHTML()}`}
function onlMyLobbyHTML(){const me=ONL.acct&&ONL.acct.id;const L=ONL.lobbies.find(x=>x.status!=='done'&&x.players.some(p=>p.id===me));if(!L)return '';const host=L.host.id===me;
  return `<div class="card2 onl-mine"><b>Your game:</b> ${esc2(onlEvName(L.ev))} at ${esc2(onlCityName(L.loc))} · ${L.ranked?'⚔ Ranked':'Custom'} · ${L.players.length}/${L.seats} seated
   <div class="onl-seats">${Array.from({length:L.seats},(_,i)=>{const p=L.players[i];return `<span class="onl-seat ${p?'on':''}">${p?`${esc2(p.name)} ${onlRankChip(p.rank)}${p.ready?' ✓':''}`:'open — a CPU if empty'}</span>`}).join('')}</div>
   <div class="acts">${L.status==='waiting'?(host?`<button type="button" class="btn primary" data-onl="start" data-v="${L.id}">▶ Start now</button>`:`<button type="button" class="btn" data-onl="ready" data-v="${L.id}">✓ Ready</button>`):''}${L.status==='live'?`<button type="button" class="btn primary" data-onl="enter" data-v="${L.id}">⚔ Enter the sand</button>`:''}<button type="button" class="btn" data-onl="leave" data-v="${L.id}">Leave</button></div></div>`}
function onlLobbyHTML(){const me=ONL.acct.id;const rows=ONL.lobbies;const st=L=>L.status==='waiting'?'<span class="badge gold">Waiting</span>':'<span class="badge">In progress</span>';
  return `<div class="onl-lbtop"><h3>📜 Lobby Browser <span class="rc-sub">${rows.length} games</span></h3><div class="acts"><button type="button" class="btn" data-onl="refresh">↻ Refresh</button><button type="button" class="btn primary" data-onl="newgame">＋ Create</button></div></div>
   ${ONL.mkgame?onlCreateGameHTML():''}${ONL.betting?onlBetHTML():''}${onlMyLobbyHTML()}
   <table class="tally onl-lb"><tr><th>Host</th><th>Event</th><th>City</th><th>Seats</th><th>Rank</th><th>Ping</th><th>Status</th><th></th></tr>${rows.map(L=>{const mine=L.players.some(p=>p.id===me);
     return `<tr class="${mine?'mine':''}"><td><b>${esc2(L.host.name)}</b></td><td>${esc2(onlEvName(L.ev))}</td><td>${esc2(onlCityName(L.loc))}</td><td>${L.players.length}/${L.seats}</td><td>${L.ranked?onlRankChip(L.rank):'<span class="rc-sub">Custom · any</span>'}</td><td>${L.ping||'—'} ms</td><td>${st(L)}</td>
      <td class="acts">${L.status==='waiting'&&!mine?`<button type="button" class="btn tksm primary" data-onl="join" data-v="${L.id}">Join</button>`:''}${L.status==='waiting'?`<button type="button" class="btn tksm" data-onl="bet" data-v="${L.id}" title="Wager from your wallet">🎲${L.pool?' '+L.pool:''}</button>`:''}<button type="button" class="btn tksm" data-onl="watch" data-v="${L.id}" title="Watch for free">👁</button>${L.ticket?`<button type="button" class="btn tksm" data-onl="ticket" data-v="${L.id}" title="A seat in the stands: stones, offerings, wagers, cheers">🎟 ${L.ticket}</button>`:''}</td></tr>`}).join('')||'<tr><td colspan="8" class="rc-sub">No games hosted. Create one.</td></tr>'}</table>`}
function onlCreateGameHTML(){const g=ONL.mkgame;return `<div class="card2 onl-mk"><b>Host a game</b><div class="formgrid">
   <label>Event<select data-onlg="ev">${ONLC.EVENTS3.map(k=>`<option value="${k}" ${g.ev===k?'selected':''}>${esc2(onlEvName(k))}</option>`).join('')}</select></label>
   <label>City<select data-onlg="loc">${LOCATIONS.map((L,i)=>L?`<option value="${i}" ${+g.loc===i?'selected':''}>${esc2(L.n)}</option>`:'').join('')}</select></label>
   <label>Seats<select data-onlg="seats">${[2,3,4].map(n=>`<option ${+g.seats===n?'selected':''}>${n}</option>`).join('')}</select></label>
   <label>Mode<select data-onlg="ranked"><option value="1" ${g.ranked?'selected':''}>⚔ Ranked — your rank only, Fate is final</option><option value="0" ${g.ranked?'':'selected'}>Custom — anyone, no deaths</option></select></label>
   <label>Ticket to the stands<select data-onlg="ticket">${[0,2,5,10,20].map(n=>`<option value="${n}" ${+g.ticket===n?'selected':''}>${n?n+' coin':'no tickets'}</option>`).join('')}</select></label></div>
   <div class="acts"><button type="button" class="btn primary" data-onl="host">Host it</button><button type="button" class="btn" data-onl="nogame">Cancel</button></div></div>`}
function onlBetHTML(){const L=ONL.lobbies.find(x=>x.id===ONL.betting.id);if(!L)return '';const me=ONL.acct.id;const mine=L.players.findIndex(p=>p.id===me);
  const opts=Array.from({length:L.seats},(_,i)=>{const p=L.players[i];return mine>=0&&i!==mine?'':`<option value="${i}">${esc2(p?p.name:'Seat '+(i+1)+' (open)')}</option>`}).join('');
  return `<div class="card2 onl-mk"><b>🎲 Wager on ${esc2(onlEvName(L.ev))}</b> <span class="rc-sub">pool ${L.pool||0} coin · winners split it, 5% to the host · ${mine>=0?'a fighter may only back themselves':'bets close when the match starts'}</span>
   <div class="formgrid"><label>Back<select id="onlBetSeat">${opts}</select></label><label>Stake<input class="tin" id="onlBetAmt" type="number" min="${ONLC.WAGER.min}" max="${Math.min(ONLC.WAGER.max,ONL.char.wallet)}" value="${Math.min(10,ONL.char.wallet)}"></label></div>
   <div class="acts"><button type="button" class="btn primary" data-onl="betgo" data-v="${L.id}">Place the wager</button><button type="button" class="btn" data-onl="nobet">Cancel</button></div></div>`}
function onlSpectHTML(){const live=ONL.lobbies.filter(L=>L.status==='live');return `<h3>👁 Spectate</h3><p class="rc-sub">Watch any live game for free, or buy a ticket for a seat in the stands — throw stones, make offerings, wager and cheer. Ticket money goes to the pot.</p>
   <div class="onl-spgrid">${live.map(L=>`<div class="card2 onl-sp">${typeof cardHTML==='function'?cardHTML('e:'+L.ev,'sm'):''}<div><b>${esc2(onlEvName(L.ev))}</b> · ${esc2(onlCityName(L.loc))}<div class="rc-sub">${L.players.map(p=>esc2(p.name)).join(' · ')}</div><div class="rc-sub">👁 ${L.watchers||0} watching · 🎟 ${L.tickets||0} in the stands</div>
     <div class="acts"><button type="button" class="btn tksm" data-onl="watch" data-v="${L.id}">👁 Watch</button>${L.ticket?`<button type="button" class="btn tksm primary" data-onl="ticket" data-v="${L.id}">🎟 Ticket · ${L.ticket}</button>`:''}</div></div></div>`).join('')||'<p class="rc-sub">Nothing live right now.</p>'}</div>`}
function onlArmoryHTML(){const ch=ONL.char;const R=ONLC.rankFor(ch);const cat=onlCatalog();const f=ONL.mkt||'w';
  const items=Object.entries(cat).filter(([k,it])=>it.kind===f).sort((a,b)=>a[1].lv-b[1].lv||a[1].n.localeCompare(b[1].n));
  return `<div class="onl-lbtop"><h3>🛒 Armory &amp; Market</h3><div class="rc-sub">Wallet ${typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙'} <b>${ch.wallet}</b> · ${esc2(R.n)} buys up to level ${R.mkt}</div></div>
   <div class="seg" style="margin-bottom:8px"><button type="button" data-onl="mkt" data-v="w" class="${f==='w'?'on':''}">⚔ Weapons</button><button type="button" data-onl="mkt" data-v="a" class="${f==='a'?'on':''}">🛡 Armor</button></div>
   <div class="onl-mkgrid">${items.map(([k,it])=>{const why=ONLC.canBuy(ch,k,cat);const own=(ch.gear||[]).includes(k);const art=typeof cardHTML==='function'?cardHTML((it.kind==='w'?'w:':'a:')+k,'sm'):'';
     return `<div class="onl-it ${why&&!own?'no':''} ${own?'own':''}">${art}<b>${esc2(it.n)}</b><small>Level ${it.lv} · ${ONLC.PRICE[it.lv]} coin</small>${own&&!it.stack?'<span class="badge gold">Yours</span>':`<button type="button" class="btn tksm ${why?'':'primary'}" data-onl="buy" data-v="${k}" ${why?`disabled title="${esc2(why)}"`:''}>Buy</button>`}</div>`}).join('')}</div>`}
function onlCharHTML(){const ch=ONL.char;const cat=onlCatalog();const kit=((CLASSES[ch.cls]||{}).weapons||[]).map(k=>(W[k]||{}).n).filter(Boolean);
  return `<div class="onl-cprof">${onlStageHTML(ch)}<div class="card2"><b>Record</b><table class="tally compact"><tr><td>Bouts</td><td>${ch.bouts}</td></tr><tr><td>Won</td><td>${ch.wins}</td></tr><tr><td>Ranked bouts survived</td><td>${ch.survived}</td></tr><tr><td>Lifetime CF</td><td>${ch.lifeCF}</td></tr><tr><td>Kills</td><td>${ch.kills}</td></tr></table>
   <b>Kit</b><p class="rc-sub">Recruit kit: ${esc2(kit.join(', ')||'the class weapons')}${(ch.gear||[]).length?' · bought: '+esc2(ch.gear.map(k=>(cat[k]||{}).n||k).join(', ')):''}</p>
   <b>Ratings</b><p class="rc-sub">${ONLC.STAT_KEYS.map(k=>`${k.toUpperCase()} ${ch.stats[k]}`).join(' · ')}</p></div></div>`}
async function onlHallLoad(){try{ONL.hall=await NET.req('hall.list')}catch(e){}onlRedraw()}
function onlHallHTML(){if(!ONL.hallAt||Date.now()-ONL.hallAt>20000){ONL.hallAt=Date.now();setTimeout(onlHallLoad,0)}
  return `<h3>🪦 The Hall of the Fallen</h3><p class="rc-sub">Only the great are remembered: those who fell at Veteranus or above, or with a legendary feat. The rest suffer damnatio memoriae.</p>
   <div class="onl-hall">${(ONL.hall||[]).map(e=>`<div class="onl-tomb">${onlMini(e.cls,90)}<b>${esc2(e.name)}</b>${onlRankChip(e.rank)}<small>${e.lifeCF} CF · ${e.survived} survived</small><small class="rc-sub">${esc2(e.why||'')}</small></div>`).join('')||'<p class="rc-sub">No one yet worthy of the Hall.</p>'}</div>
   ${!ONL.char&&ONL.acct?'<div class="mbtns"><button type="button" class="btn primary" data-onl="tab" data-v="play">⚔ Make a new gladiator</button></div>':''}`}

/* ---------------- the controls ---------------- */
async function onlDo(fn){if(ONL.busy)return;ONL.busy=true;ONL.err='';try{await fn()}catch(e){ONL.err=e.message;if(typeof mToast==='function')mToast('⚠ '+esc2(e.message))}finally{ONL.busy=false;onlRedraw()}}
document.addEventListener('click',e=>{const b=e.target.closest('#onl [data-onl]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.onl,v=b.dataset.v;
  if(a==='tab'){ONL.tab=v;onlRedraw();return}
  if(a==='google'){if(NET.mode==='aws'&&typeof netSignIn==='function')return netSignIn();if(typeof mToast==='function')mToast('Google sign-in opens once the AWS template is deployed. Use a name for now.');return}
  if(a==='mocksign')return onlDo(async()=>{ONL.acct=await NET.req('auth.signin',{name:($('#onlName')||{}).value});await onlRefresh()});
  if(a==='signout')return onlDo(async()=>{await NET.req('auth.signout');ONL.acct=null;ONL.char=null});
  if(a==='cls'){ONL.creating.cls=v;onlRedraw();return}
  if(a==='face'){ONL.creating.look={portrait:typeof randomPortrait==='function'?randomPortrait():null};onlRedraw();return}
  if(a==='create')return onlDo(async()=>{const d=ONL.creating;d.name=($('#onlCName')||{}).value||d.name;ONL.char=await NET.req('char.create',d);ONL.creating=null;ONL.chars.unshift(ONL.char);ONL.tab='play';if(typeof mToast==='function')mToast(`⚔ <b>${esc2(ONL.char.name)}</b> enters the arena — a Tiro with an empty purse.`)});
  if(a==='refresh')return onlDo(onlRefresh);
  if(a==='newgame'){ONL.mkgame={ev:'democritus',loc:6,seats:4,ranked:true,ticket:0};onlRedraw();return}
  if(a==='nogame'){ONL.mkgame=null;onlRedraw();return}
  if(a==='host')return onlDo(async()=>{await NET.req('lobby.create',ONL.mkgame);ONL.mkgame=null;ONL.lobbies=await NET.req('lobby.list')});
  if(a==='quick'){const [ev,rk]=v.split('|');return onlDo(async()=>{const me=ONL.acct.id;const R=ONLC.rankFor(ONL.char).k;
    const L=ONL.lobbies.find(L=>L.status==='waiting'&&L.ev===ev&&!!L.ranked===(rk==='1')&&!ONLC.canJoin(L,{id:me,rank:R,char:ONL.char.id})&&!L.players.some(p=>p.id===me));
    if(L)await NET.req('lobby.join',{id:L.id});else await NET.req('lobby.create',{ev,loc:6,seats:4,ranked:rk==='1',ticket:0});ONL.lobbies=await NET.req('lobby.list')})}
  if(a==='join')return onlDo(async()=>{await NET.req('lobby.join',{id:v});ONL.lobbies=await NET.req('lobby.list')});
  if(a==='leave')return onlDo(async()=>{await NET.req('lobby.leave',{id:v});ONL.lobbies=await NET.req('lobby.list')});
  if(a==='ready')return onlDo(async()=>{await NET.req('lobby.ready',{id:v,ready:true});ONL.lobbies=await NET.req('lobby.list')});
  if(a==='start')return onlDo(async()=>{const L=await NET.req('lobby.start',{id:v});onlEnter(L)});
  if(a==='enter'){const L=ONL.lobbies.find(x=>x.id===v);if(L)onlEnter(L);return}
  if(a==='watch')return onlDo(async()=>{const L=await NET.req('lobby.watch',{id:v});if(typeof mToast==='function')mToast(`👁 Watching ${esc2(onlEvName(L.ev))} — live views arrive with the AWS server.`)});
  if(a==='ticket')return onlDo(async()=>{const r=await NET.req('lobby.ticket',{id:v});ONL.char=r.char;if(typeof mToast==='function')mToast(`🎟 A seat in the stands at ${esc2(onlCityName(r.lobby.loc))}.`)});
  if(a==='bet'){ONL.betting={id:v};ONL.tab='lobby';onlRedraw();return}
  if(a==='nobet'){ONL.betting=null;onlRedraw();return}
  if(a==='betgo')return onlDo(async()=>{const r=await NET.req('bet.place',{id:v,seat:+($('#onlBetSeat')||{}).value,amt:+($('#onlBetAmt')||{}).value});ONL.char=r.char;ONL.betting=null;ONL.lobbies=await NET.req('lobby.list');if(typeof mToast==='function')mToast('🎲 Wager placed.')});
  if(a==='mkt'){ONL.mkt=v;onlRedraw();return}
  if(a==='buy')return onlDo(async()=>{ONL.char=await NET.req('char.buy',{char:ONL.char.id,item:v});if(typeof mToast==='function')mToast(`🛒 Bought ${esc2((onlCatalog()[v]||{}).n||v)}.`)})},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#onl'))return;
  if(t.dataset.onlf&&ONL.creating){ONL.creating[t.dataset.onlf]=t.value;const n=document.querySelector('.onl-cname');if(n)n.textContent=t.value||'Nameless'}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.onlg==null||!ONL.mkgame)return;const k=t.dataset.onlg;ONL.mkgame[k]=k==='ranked'?t.value==='1':k==='ev'?t.value:+t.value},true);

/* ---------------- into the sand (phase 1: the lobby plays here; empty and remote seats are CPUs) ---------------- */
function onlSeatsFor(L){const seats=[];const used=new Set();
  L.players.forEach(p=>{const bot=/^bot/.test(p.id);const k=p.kit||{};let cls=k.cls&&!used.has(k.cls)?k.cls:(ONLC.CLASSES8.find(x=>!used.has(x))||'soldier');used.add(cls);
    seats.push({cls,cpu:bot,name:k.name||p.name,stats:k.stats?{...k.stats}:undefined,onl:{id:p.id,char:p.char||null,gear:bot?null:(k.gear||[])}})});
  while(seats.length<L.seats){const cls=ONLC.CLASSES8.find(k=>!used.has(k))||'soldier';used.add(cls);seats.push({cls,cpu:true})}return seats}
function onlEnter(L){if(!ONL.char)return;const seats=onlSeatsFor(L);const mine=seats.findIndex(s=>s.onl&&s.onl.id===ONL.acct.id);const host=L.host.id===ONL.acct.id;
  const owners=seats.map(s=>s.onl&&!s.cpu?s.onl.id:null);const onl={lobby:L.id,ranked:!!L.ranked,seat:mine,owners,host};
  ONL.live={id:L.id,ranked:!!L.ranked,seat:mine,char:ONL.char.id,seed:L.seed};if(CUR_MODAL)CUR_MODAL.done('enter');
  setTimeout(()=>{try{menuHide()}catch(e){}if(host||typeof onlJoinMatch!=='function')startEvent({ev:L.ev,loc:L.loc,seats,seed:L.seed,opts:{spect:0},onl});else onlJoinMatch(L,onl)},120)}
{const base=startEvent;startEvent=function(cfg){const r=base.apply(this,arguments);try{if(cfg&&cfg.onl&&S){S.onl={...cfg.onl};if(ONL.live)ONL.live.started=Date.now()}}catch(e){}return r}}
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
  const order=(S.elimOrder||[]).map(o=>o.id);const alive=S.players.filter(q=>q.alive&&!q.exited).length;const out=order.indexOf(p.id);
  const place=won?1:out<0?Math.min(S.players.length,2):Math.max(2,S.players.length-out);
  return {won,place,f:row.f|0,coin:p.coin|0,kills:(p.trophies||[]).filter(t=>t.pk==='player').length,survives:row.survives!==false,slew:(p.trophies||[]).some(t=>/commodus/i.test(String(t.k||t.n||'')))?['commodus']:[]}}
async function onlReport(winners){const L=ONL.live;L.reported=true;const p=S.players[L.seat];if(!p)return;const row=onlRow(p,winners);
  const res=await NET.req('match.result',{id:L.id,char:L.char,seat:L.seat,row,hash:typeof onlHash==='function'?onlHash():''});ONL.char=res.char;const o=res.out;
  const msg=o.died?(o.hall?`🪦 <b>${esc2(res.char.name)}</b> is dead. The Hall of the Fallen keeps the name.`:`🌫 <b>${esc2(res.char.name)}</b> is dead — and forgotten.`)
    :`💰 +${o.pay} coin · ⭐ +${o.cf} lifetime CF${o.rankUp?` · ⚔ now <b>${esc2(onlRank(o.rankUp).n)}</b>`:''}`;
  setTimeout(()=>{if(typeof mToast==='function')mToast(msg)},2500)}

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
.onl-err{color:#f0a090}.onl-st0{display:flex;flex-wrap:wrap;gap:8px}.onl-st0 span{padding:4px 10px;border:1px solid #5a4428;border-radius:8px;font-size:13px}.onl-st0 b{color:var(--gold,#e8c96a)}
@media(max-width:760px){.onl-wrap,.onl-play,.onl-create,.onl-cprof{grid-template-columns:1fr}.onl-rail{position:static;flex-direction:row;flex-wrap:wrap}.onl-stage{grid-template-columns:1fr;justify-items:center;text-align:center}}
`;document.head.appendChild(st)}
/* no sim in online matches (the other seats are people); tests may set S.onl.testSim */
{const base=simToEnd;simToEnd=function(){if(S&&S.onl&&!S.onl.testSim){if(typeof mToast==='function')mToast('⏭ No simming online — the other seats are people.');return}return base.apply(this,arguments)}}
