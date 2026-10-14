/* =====================================================================
   158-V88HS · THE HOT-SEAT TABLE, PROPERLY (v0.88 — the agreed batch, tools/plans/hotseat-next.md)
   =====================================================================
   His decisions: NO curtain — the Mandata Flavi of every player show the card back (your own too, with a 👁 hold-to-peek);
   the whose-move pill stays up all turn; table games stay out of the owner's records — only the players' books move.
   FIXES
   • Players' books (hsAfterEvent replaced): deaths, "Into the Ludus" and Freedom follow the Fate (aliveInUniverse), not
     who was standing at the horns; every row with a player counts — a seat handed to the CPU and ⏭ To the end included;
     a simmed event counts events and wins but grants no honours and no Road step.
   • Mandata Flavi: hidden for every human at the table (07-ui hsSecret); your own board carries a 👁 hold-to-peek.
   • Offer them the sword: hidden at the table, Math.random for the refusal (16-crowd edits), no crash without a world.
   • Taken-over CPU: 🎮 Take control asks which player takes the seat; the seat joins that player's book and wallet.
   • Hints stay off at the table: showStrategy (62 edit), applySettings / setHints and loaded saves.
   • Names: the horns wait until every player seat is named, each name once (case does not matter); profile ids from
     Math.random; the gladiator-name box no longer rewrites Play Now's remembered class name.
   • "Your turn" window: counts LIVING humans, never twice for the same player, opens after the new player's board and
     wallet are live; the last player is kept as an id (S.hsPrevId), never a live object.
   • Wallets: owner-only actions (the Ludus infirmary, Manager windows) bill the owner; 'Buy their cheers' names the player
     whose turn it is first (16-crowd edit); bets carry the player and settle into their wallet after the horns.
   • Labels: every human shows their player's name, not 'You' (07-ui / 10-meta edits); truce rings fall back to the last
     human who moved.
   • Online defend windows lose the couch line (62 edit: never with S.onl).
   • Profile delete: the centred ask-first popup naming the profile.
   • Phones: End turn stays on screen (sticky at the bottom of the actions drawer); the turn chip keeps the name.
   TABLE BASICS (proposal items)
   2  the whose-move pill (#hsPill88) in the player's colour, all turn, on every layout.
   4  own names: the gladiator keeps its name, the player shows beside it; per seat "fight under my own name" (s.hsOwn).
   5  CPU truce/trade offers and offers between players open as "🪑 Livia — …" (hsAsk around the reply windows, 06/07 edits).
   6  Flavius's truce decree asks each bound player by name; one "Fight on" breaks the truces.
   7  seat rules: hand only your own gladiator to the CPU, on your turn; Take control asks who; ⏭ To the end asks the table.
   11 resume: the table autosaves to its own 🪑 slot (flavius_match_table) naming the players and who is to move;
      Hot seat → ▶ Resume the table; a loaded table is back in hot-seat mode (CFG.hotseat, hints off, Replay).
   12 the table stays out of the owner's records: no Ludus saves / Gate of Life, no summoning Ludus gladiators, no Hall,
      Annals, Infamis, crowd memory, unlocks, sponsors, bestiary ledgers, calendar or bet log.
   ===================================================================== */
const HS88=1;
/* ---------- helpers ---------- */
function hsTable(){return !!(typeof S!=='undefined'&&S&&S.hotseat)}
function hsProf(pid){return pid&&typeof HS_PROFILES!=='undefined'?HS_PROFILES.find(x=>x.id===pid)||null:null}
/* hsWho — the player at the table behind a gladiator (their gladiator's name elsewhere) */
function hsWho(p){if(!p)return '';const P=hsTable()&&!p.cpu&&p.pid?hsProf(p.pid):null;return P?P.name:p.name}
/* hsYou — what a human's label reads: 'You' alone at a game, the player's name at a table */
function hsYou(p){if(hsTable()&&p&&p.pid){const P=hsProf(p.pid);if(P)return esc(P.name)}return _T('You')}
/* hsSecret — a human's Mandata Flavi stay face down at the table (the 👁 peek is on their own board) */
function hsSecret(p){return hsTable()&&!S.over&&!!p&&!p.cpu}
const hsLiveHumans=()=>S.players.filter(q=>!q.cpu&&q.pid&&q.alive&&!q.exited);
/* hsOrder88 — the acting player's gladiators first (the cheers picker) */
function hsOrder88(L){if(!hsTable()||!S.hsActive)return L;return [...L.filter(p=>p.pid===S.hsActive&&!p.cpu),...L.filter(p=>!(p.pid===S.hsActive&&!p.cpu))]}
/* whose purse: owner's (a Ludus / Manager window was just clicked), a settling player's, or the table default */
let HS_PURSE_PID=null,HS_OWNER_T=0;
function hsPidNow(){if(!hsTable())return undefined;if(Date.now()-HS_OWNER_T<5000)return null;if(HS_PURSE_PID)return HS_PURSE_PID;return undefined}
window.addEventListener('click',e=>{try{if(hsTable()&&e.target.closest&&e.target.closest('#ludusBody,#mgrBody,[data-ginfirm]'))HS_OWNER_T=Date.now()}catch(err){}},true);
/* hsAsk — a reply window addressed to the human who answers it (the 62 RESPONDER wrapper names them) */
async function hsAsk(q,f){if(!hsTable()||!q||q.cpu||typeof RESPONDER==='undefined')return f();const prev=RESPONDER;RESPONDER=q;try{return await f()}finally{RESPONDER=prev}}

/* ---------- the records: a table settles only into the players' books ---------- */
const HS_OVER={at:0,inOver:false};
/* hsRec — the table is live, or its results are settling (gameOver running, or the 20 s after it) */
function hsRec(){if(!hsTable())return false;if(!S.over)return true;const t=Date.now()-HS_OVER.at;return t<20000||(HS_OVER.inOver&&t<600000)}
{const base=gameOver;gameOver=async function(){const on=hsTable()&&!S.overShown;if(on){HS_OVER.at=Date.now();HS_OVER.inOver=true;try{hsTagBets(S.hsActive)}catch(e){}}try{return await base.apply(this,arguments)}finally{if(on)HS_OVER.inOver=false}}}
for(const [nm,val] of [['achievementsAfterEvent',undefined],['updateCrowdAfterEvent',undefined],['bestiaryTally',undefined],['saveGladiator',null],['markFallen',undefined],
  ['claimFreedom',undefined],['hallTrophy',undefined],['rivalTrophy',undefined],['sponsorAfterEvent',undefined],['roadAfterEvent',undefined],['infirmaryTick',undefined],
  ['achGrant',false],['betRec',null],['betSettle',undefined],['advanceMissio',null]]){
  try{const base=eval(nm);if(typeof base!=='function')continue;const sync=['bestiaryTally','betRec','betSettle'].includes(nm); /* the rest are awaited or .catch()ed (earlier wrappers hide their async) */
    const w=function(){if(hsRec())return sync?val:Promise.resolve(val);return base.apply(this,arguments)};
    eval(`${nm}=w`)}catch(e){}}
/* the empire's calendar holds still for a table */
{const base=careerHoldsClock;careerHoldsClock=async function(){if(hsRec())return true;return base.apply(this,arguments)}}
/* recordEvent: the Annals, Infamis, Hall and unlocks stay the owner's — only the books */
{const base=recordEvent;recordEvent=async function(rows){if(hsTable()){if(!S.sim)await hsAfterEvent(rows);return}return base.apply(this,arguments)}}
/* belt and braces: the owner's collections are not written while a table's results settle */
const HS88_BLOCK=new Set(['hall','infamis','hallTrophies','gladiators','missios','crowd','arena']);
{const put=Store.put,del=Store.del;
  Store.put=function(col){if(HS88_BLOCK.has(col)&&hsTable()&&S.over&&hsRec())return Promise.resolve(false);return put.apply(this,arguments)};
  Store.del=function(col){if(HS88_BLOCK.has(col)&&hsTable()&&S.over&&hsRec())return Promise.resolve();return del.apply(this,arguments)}}

/* ---------- the players' books follow the Fate ---------- */
hsAfterEvent=async function(rows){await hsLoad();const lines=[];const simmed=!!S.simmed;
  for(const x of rows){const p=x.p;if(!p||!p.pid)continue;const P=hsProf(p.pid);if(!P)continue;const got=[];
    const lives=x.fate&&typeof aliveInUniverse==='function'?aliveInUniverse(x):!!(p.alive&&!p.retired);
    P.events++;if(x.won)P.wins++;const f=Math.round(x.f||0);P.cfTotal+=f;P.cfBest=Math.max(P.cfBest,f);
    if(!lives)P.deaths++;if(f>=20&&lives)P.ludus++;if(f>=50&&lives)P.freed++;
    const coin=Math.max(0,Math.round(p.coin||0))+(x.won?25:0);P.coin+=coin;
    const give=k=>{if(!P.honors[k]){P.honors[k]=new Date().toISOString().slice(0,10);got.push(HS_HONORS.find(h=>h[0]===k)[1])}};
    if(!simmed){
      if(x.won){if(BASE_CLS.includes(p.cls)&&!P.classWins.includes(p.cls))P.classWins.push(p.cls);if(!P.locs.includes(S.locIdx))P.locs.push(S.locIdx);if(HALL_ORDER[P.road]===S.locIdx)P.road++}
      if(x.won)give('first');if(f>=20&&lives)give('ludus');if(f>=50&&lives)give('fifty');
      const killed=t=>S.npcs.some(n=>n.t===t&&!n.alive&&n.killedBy===p.name);if(killed('tholo'))give('tholo');if(killed('commodus'))give('commodus');
      if(BASE_CLS.every(c=>P.classWins.includes(c)))give('eightwins');if(P.locs.length>=12)give('twelve');if(P.events>=25)give('veteran');if(P.road>=12)give('road');if(P.coin>=300)give('rich')}
    await hsSave(P);
    lines.push(_T`<b>${esc(P.name)}</b> (${esc(p.name)}): ${x.won?'🏆 win · ':''}${cfAmt87(f)} · ${lives?_T('lives'):_T('✝ fell')} · ${coinAmt87('+'+coin)} (wallet ${coinAmt87(P.coin)}) · Road ${P.road}/12${got.length?` · 🏅 ${got.map(esc).join(', ')}`:''}`)}
  if(lines.length){log(`<div class="tiphint">${_T`<b>🪑 Hot seat — the players' books</b>${simmed?_T(' · simmed: no honours'):''}<br>${lines.join('<br>')}`}</div>`,'big');if(typeof mToast==='function')mToast(_T('🪑 Every player’s profile is updated — see the log.'))}};

/* ---------- wagers carry the player and settle into their wallet ---------- */
function hsTagBets(pid){if(!hsTable()||!pid)return;for(const b of S.bets||[])if(!b.hsPid)b.hsPid=pid}
{const base=settleWagers;settleWagers=async function(rows,wset){if(!hsTable()||!(S.bets||[]).length)return base.apply(this,arguments);
  const groups=new Map();for(const b of S.bets){const k=b.hsPid||S.hsActive||'';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(b)}
  const all=S.bets,sb=S.selfBets,sp=S.spect;let out=[];let first=true;
  try{for(const [pid,list] of groups){HS_PURSE_PID=pid||null;S.bets=list;if(!first){S.selfBets=[];S.spect=[]}
      const r=await base.call(this,rows,wset);out=out.concat(r||[]);first=false}}
  finally{HS_PURSE_PID=null;S.bets=all;S.selfBets=sb;S.spect=sp}
  return out}}

/* ---------- 2 · the whose-move pill ---------- */
function hsPillUpdate(){if(HEADLESS)return;let el=document.getElementById('hsPill88');
  const on=hsTable()&&!S.over&&S.phase!=='setup'&&!!cur();if(!on){if(el)el.hidden=true;return}
  const w=document.querySelector('.canvas-wrap');if(!w)return;
  if(!el||el.parentElement!==w){if(el)el.remove();el=document.createElement('div');el.id='hsPill88';el.className='hspill88';el.setAttribute('role','status');w.appendChild(el)}
  const p=cur();const P=!p.cpu&&p.pid?hsProf(p.pid):null;
  const html=P?_T`🪑 <b>${esc(P.name)}’s move</b><span>${esc(p.name)}</span>`:_T`🤖 <b>${esc(p.name)}</b><span>CPU</span>`;
  if(el._h!==html){el.innerHTML=html;el._h=html}el.style.setProperty('--pc',p.color||'#f0cf7d');el.classList.toggle('cpu',!P);el.hidden=false}
{const base=render;render=function(){const r=base.apply(this,arguments);try{hsPillUpdate()}catch(e){}return r}}

/* ---------- the turn: the new player first, then (when someone else moved) what happened while they were away ---------- */
{const base=beginTurn;beginTurn=async function(){try{if(S&&S.hotseat&&!S.over){const p=cur();hsTagBets(S.hsActive);
    if(p&&!p.cpu&&p.pid){S.hsActive=p.pid;S.boardPid=null}
    delete S.hsPrevP; /* an older save kept a live object here */
    if(p&&!HEADLESS&&!S.sim&&!S.snap){S.hsSnaps=S.hsSnaps||{};const prev=S.hsPrevId!=null?S.players[S.hsPrevId]:null;
      if(prev&&prev!==p&&!prev.cpu)S.hsSnaps[prev.id]=hsSnap(prev);S.hsPrevId=p.id;
      const a=S.hsSnaps[p.id];
      if(!p.cpu&&p.pid&&a&&hsLiveHumans().length>=2&&S.hsLastPid!==p.pid){S.hsLastPid=p.pid;try{render()}catch(e){}
        const P=hsProf(p.pid);
        await modal(_T`🪑 ${esc(P?P.name:p.name)} — your turn`,`<p class="rc-sub" style="margin:0 0 6px">${_T`${esc(p.name)} · since your last turn`}</p>${hsAwayHTML(p,a)}`,[{label:_T('Start my turn'),value:1,primary:1}],{close:1})}
      else if(!p.cpu&&p.pid)S.hsLastPid=p.pid}
    hsPillUpdate()}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* ---------- Mandata Flavi: 👁 hold to peek at your own ---------- */
{const base=boardHTML;boardHTML=function(player,interactive){let h=base.apply(this,arguments);
  try{if(hsSecret(player)&&player===cur()){const mf=(player.items||[]).filter(it=>it.kind==='mf');let i=0;
      h=h.replace(/(<div class="item mf">[\s\S]*?<\/em><\/span><\/span>)/g,(m0)=>{const it=mf[i++];if(!it)return m0;return m0+`<button type="button" class="mfpeek88" data-mfpeek="${it.id}" title="${_T`Hold to peek — only you`}" aria-label="${_T`Hold to peek at your Mandata Flavi`}">👁</button>`})}}catch(e){console.error(e)}
  return h}}
function hsPeek(b,on){let el=document.getElementById('mfPeek88');
  if(!on){if(el)el.hidden=true;return}
  const p=cur();if(!p||!hsSecret(p))return;const it=(p.items||[]).find(x=>String(x.id)===String(b.dataset.mfpeek));if(!it)return;
  if(!el){el=document.createElement('div');el.id='mfPeek88';el.className='mfpeek88pop card2';document.body.appendChild(el)}
  const I=itemInfo(it);el.innerHTML=`${cardHTML('m:'+it.idx,'md')}<div><b>${esc(I.n)}</b><div class="rc-sub">${I.t||''}${I.d?' · '+I.d:''}</div></div>`;el.hidden=false;
  const r=b.getBoundingClientRect();const W=Math.min(320,innerWidth-16);el.style.width=W+'px';el.style.left=Math.max(8,Math.min(innerWidth-W-8,r.left-W/2))+'px';
  el.style.top='0px';const H=el.offsetHeight;el.style.top=Math.max(8,r.top-H-8<8?r.bottom+8:r.top-H-8)+'px'}
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('[data-mfpeek]');if(!b)return;e.preventDefault();e.stopPropagation();hsPeek(b,true)},true);
for(const ev of ['pointerup','pointercancel','blur'])window.addEventListener(ev,()=>hsPeek(null,false),true);
document.addEventListener('pointerout',e=>{if(e.target.closest&&e.target.closest('[data-mfpeek]'))hsPeek(null,false)},true);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-mfpeek]')){e.preventDefault();e.stopPropagation()}},true);
document.addEventListener('keydown',e=>{const b=e.target.closest&&e.target.closest('[data-mfpeek]');if(b&&(e.key===' '||e.key==='Enter')){e.preventDefault();hsPeek(b,true)}},true);
document.addEventListener('keyup',e=>{if(e.target.closest&&e.target.closest('[data-mfpeek]'))hsPeek(null,false)},true);

/* ---------- 7 · seat rules ---------- */
{const base=seatCanToggle;seatCanToggle=function(p){const r=base.apply(this,arguments);if(!r||!hsTable())return r;if(p.cpu)return true;
  return p===cur()&&!(typeof RESPONDER!=='undefined'&&RESPONDER)}}
{const base=seatToggle;seatToggle=async function(p){if(!hsTable()||!p||!p.cpu||!seatCanToggle(p))return base.apply(this,arguments);
  if(typeof modalBusy==='function'&&modalBusy())return;
  const ids=[...new Set([p.pid,...S.hotseat.players.map(h=>h.pid)].filter(Boolean))];const profs=ids.map(hsProf).filter(Boolean);if(!profs.length)return;
  const pid=await modal(_T`🎮 Who takes ${esc(p.name)}?`,`<p>${_T`Pick the player who plays this gladiator from now on. Their wallet pays for it and the result goes in their book.`}</p>`,
    [...profs.map((P,i)=>({label:`🪑 ${esc(P.name)}`,value:P.id,primary:P.id===p.pid||(!p.pid&&i===0)})),{label:_T('Cancel'),value:null}],{close:null});
  if(!pid||!p.cpu||S.over)return;const P=hsProf(pid);
  p.pid=pid;const h=S.hotseat.players.find(x=>x.seat===p.id);if(h){h.pid=pid;h.name=P.name}else S.hotseat.players.push({seat:p.id,pid,name:P.name});
  p.cpu=false;p.simmed=false;if(cur()===p)S.hsActive=pid;
  log(_T`🎮 ${esc(P.name)} takes the reins of ${nm(p)}${cur()===p&&S.busy?_T(' — from their next turn'):''}.`,'big');render()}}
{const base=simToEnd;simToEnd=async function(){if(!hsTable()||!S||S.over||HEADLESS)return base.apply(this,arguments);
  if(typeof modalBusy==='function'&&modalBusy())return;const G=S;
  const pids=[...new Set(hsLiveHumans().map(q=>q.pid))];
  for(const pid of pids){const P=hsProf(pid);if(!P)continue;
    const v=await modal(_T`🪑 ${esc(P.name)} — ⏭ To the end?`,`<p>${_T`The whole table must agree: every gladiator goes to the CPU and the event resolves at once. It still counts in everyone's book, without honours.`}</p>`,
      [{label:_T('Agree'),value:1,primary:1},{label:_T('Keep playing'),value:0}],{close:0});
    if(G!==S||S.over)return;if(!v){log(_T`🪑 ${esc(P.name)} wants to play on — no simming.`,'thought');return}}
  return base.call(this,true)}}

/* ---------- 6 · Flavius's truce decree asks each bound player ---------- */
{const base=modal;modal=function(title,body,buttons,opt){
  if(hsTable()&&!S.over&&Array.isArray(buttons)&&buttons.some(b=>b&&b.value==='fight')&&buttons.some(b=>b&&b.value==='thumb')&&typeof RESPONDER!=='undefined'&&!RESPONDER){
    const self=this;return (async()=>{const seen=new Set();
      for(const q of hsLiveHumans()){if(seen.has(q.pid))continue;seen.add(q.pid);const prev=RESPONDER;RESPONDER=q;let v;
        try{v=await base.call(self,title,body,buttons,opt)}finally{RESPONDER=prev}
        if(v!=='thumb'){log(_T`⚔ ${esc(hsWho(q))} will not accept the thumb.`,'big');return 'fight'}}
      return seen.size?'thumb':base.call(self,title,body,buttons,opt)})()}
  return base.apply(this,arguments)}}

/* ---------- hints stay off at the table ---------- */
{const base=applySettings;applySettings=function(){const r=base.apply(this,arguments);try{if(hsTable()&&!S.over){if(HS_HINTS_SAVE==null)HS_HINTS_SAVE=HINTS;else HS_HINTS_SAVE=!!SETTINGS.hints;HINTS=false}}catch(e){}return r}}
{const base=setHints;setHints=function(on){const r=base.apply(this,arguments);try{if(hsTable()&&!S.over){HS_HINTS_SAVE=!!on;HINTS=false}}catch(e){}return r}}

/* ---------- names: one per player, the box for the gladiator, no junk profiles ---------- */
{const base=seatRows;seatRows=function(ev,n,cls){let h=base.apply(this,arguments);if(!CFG.hotseat||!window.HS_IN_SETUP)return h;
  try{h=h.replace(/<select id="(sav|lcp)\d"[\s\S]*?<\/select>/g,'').replace(/ ?<span style="font-size:11px;color:var\(--dim\);align-self:center"[^>]*>[^<]*<\/span>/g,'');
    const parts=h.split('<label class="hsname">');h=parts[0]+parts.slice(1).map(seg=>{const m=seg.match(/data-hsn="(\d+)"/);const i=m?+m[1]:-1;const s=CFG.seats[i];
      return '<label class="hsname">'+seg.replace(/(<span class="rc-sub">[^<]*<\/span><\/label>)/,`$1<label class="hsown88" title="${_T`Untick to keep the gladiator's own name beside yours`}"><input type="checkbox" data-hsown="${i}" ${s&&s.hsOwn?'checked':''}> ${_T`fight under my own name`}</label>`)}).join('')}catch(e){console.error(e)}
  return h}}
document.addEventListener('change',e=>{const t=e.target.closest&&e.target.closest('[data-hsown]');if(!t)return;const s=CFG.seats[+t.dataset.hsown];if(s)s.hsOwn=t.checked},true);
document.addEventListener('input',e=>{const t=e.target;if(!CFG.hotseat||!t||!/^nam\d$/.test(t.id||''))return;e.stopPropagation();const s=CFG.seats[+t.id.slice(3)];if(s)s.name=t.value.trim()},true);
/* hsSeatErr — why the horns cannot sound yet ('' when every player seat has its own name) */
function hsSeatErr(){if(!CFG.hotseat||CFG.mode!=='event')return '';const E=EVENTS[CFG.ev];const n=E?CFG.n:4;const seen=new Set();
  for(let i=0;i<n;i++){const s=CFG.seats[i];if(!s||s.cpu)continue;const nmx=String(s.hsName||'').trim();if(!nmx)return _T`Name every player — seat ${i+1} has no name (or make it a CPU).`;
    const k=nmx.toLowerCase();if(seen.has(k))return _T`Each player needs their own name — “${esc(nmx)}” sits at two seats.`;seen.add(k)}
  if(!seen.size)return _T('Seat at least one player.');return ''}
window.addEventListener('click',e=>{if(!CFG.hotseat)return;const b=e.target.closest&&e.target.closest('#goBtn');if(!b||!document.querySelector('#modal .hsbanner'))return;
  const m=hsSeatErr();if(m){e.preventDefault();e.stopPropagation();const el=document.getElementById('setupErr');if(el){el.innerHTML=m;el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');el.scrollIntoView({block:'center'})}if(typeof mToast==='function')mToast('⚠ '+m);return}
  for(const s of CFG.seats)if(s){s.saved=null}},true);

/* ---------- profile delete: the centred ask-first popup ---------- */
window.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-hsdel]');if(!b)return;e.preventDefault();e.stopPropagation();
  const id=b.dataset.hsdel;const P=hsProf(id);const ok=await ask76(_T`🗑 Delete ${esc(P?P.name:_T('this player'))}?`,_T('Their book, wallet and honours are gone for good — this cannot be undone.'),_T('Delete'),_T('Keep it'));if(!ok)return;
  HS_PROFILES=HS_PROFILES.filter(p=>p.id!==id);hsPersist();const box=document.querySelector('.hsbanner');if(box)box.outerHTML=hsBoardHTML()},true);

/* the results: survivors go into their player's book, not the Ludus Flavius */
{const base=resultCard;resultCard=function(){let h=base.apply(this,arguments);try{if(hsTable()&&typeof h==='string')h=h.split(_T('Survives to the Ludus Flavius: can be saved.')).join(_T('Survives — into the player’s book.')).split(_T('Free, or back for glory: can be saved in the Ludus.')).join(_T('Survives with 50+ CF — into the player’s book.'))}catch(e){}return h}}
/* ---------- truce rings: the last human who moved watches during CPU turns ---------- */
{const base=truceViewer;truceViewer=function(){const r=base.apply(this,arguments);if(r||!hsTable()||!S.hsActive)return r;return S.players.find(p=>p.pid===S.hsActive&&!p.cpu&&p.alive)||null}}

/* ---------- 11 · resume the table ---------- */
const HS_SLOT='table';
{const base=matchSnapshot;matchSnapshot=function(name){const snap=base.apply(this,arguments);try{if(hsTable()){const names=[...new Set(S.hotseat.players.map(h=>(hsProf(h.pid)||h).name))];const p=cur();const who=p&&!p.cpu?hsWho(p):'';
    if(!name)snap.name=_T`🪑 ${names.join(', ')} · ${EV().short||EV().n}`;snap.summary=snap.summary+(who?_T` · ${who} to move`:'');snap.hs=1}}catch(e){}return snap}}
{const base=matchAutosave;matchAutosave=function(){if(!hsTable())return base.apply(this,arguments);if(!matchSaveOK()||S._autoRot===S.rotation)return;S._autoRot=S.rotation;matchSlotPut(HS_SLOT,matchSnapshot(null))}}
function hsResumeSnap(){const sv=matchSlotGet(HS_SLOT);return sv&&sv.game==='flavius-match'?sv:null}
function hsAfterLoad(){if(!hsTable()||S.over)return;CFG.hotseat=true;CFG.mode='event';if(HS_HINTS_SAVE==null)HS_HINTS_SAVE=HINTS;HINTS=false;delete S.hsPrevP;
  try{if(S.hsCfg&&typeof LAST_CFG!=='undefined')LAST_CFG=JSON.parse(JSON.stringify(S.hsCfg))}catch(e){}
  try{hsLoad().then(()=>{try{render()}catch(e){}})}catch(e){}}
{const base=matchLoad;matchLoad=function(){const r=base.apply(this,arguments);try{hsAfterLoad()}catch(e){}try{Promise.resolve(r).then(()=>hsAfterLoad()).catch(()=>{})}catch(e){}return r}}
{const base=newState;newState=function(cfg){const r=base.apply(this,arguments);try{if(cfg&&cfg.hotseat&&S){S.hsCfg=JSON.parse(JSON.stringify(cfg))}}catch(e){}return r}}
{const base=matchSavesHTML;matchSavesHTML=function(mode){let h=base.apply(this,arguments);try{const sv=hsResumeSnap();if(!sv||mode==='save')return h;
  const row=`<div class="item"><span>${_T`🪑 <b>Hot-seat table</b>`}<em>${esc(sv.name)} · ${esc(new Date(sv.at).toLocaleString())} · ${esc(sv.summary||'')}</em></span><span style="display:flex;gap:4px">${mode!=='manage'?`<button class="btn primary" type="button" data-mload="${HS_SLOT}">${_T`▶ Load`}</button>`:''}${mode!=='load'?`<button class="btn" type="button" data-mdel="${HS_SLOT}">🗑</button>`:''}</span></div>`;
  h=h.replace('<div class="list">','<div class="list">'+row)}catch(e){}return h}}
{const base=hsBoardHTML;hsBoardHTML=function(){let h=base.apply(this,arguments);try{const sv=hsResumeSnap();if(sv)h=h.replace(/(<div class="sect" style="margin-top:0">[\s\S]*?<\/div>)/,`$1<div class="hsres88"><button type="button" class="btn primary" data-hsresume="1">${_T`▶ Resume the table`}<small>${esc(sv.summary||sv.name)}</small></button></div>`)}catch(e){}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-hsresume]');if(!b)return;e.stopPropagation();const c=CUR_MODAL;if(c)c.done('closed');setTimeout(()=>matchLoad(HS_SLOT),150)},true);

/* ---------- look ---------- */
(()=>{const st=document.createElement('style');st.textContent=`
.hspill88{position:absolute;left:10px;top:10px;z-index:6;display:flex;align-items:baseline;gap:8px;max-width:calc(100% - 20px);padding:5px 14px;border-radius:999px;
  background:color-mix(in srgb,var(--pc,#f0cf7d) 32%,rgba(20,14,10,.92));border:2px solid var(--pc,#f0cf7d);color:#fff;font:600 17px var(--display);white-space:nowrap;
  pointer-events:none;box-shadow:0 2px 12px rgba(0,0,0,.5)}
.hspill88[hidden]{display:none}.hspill88 b{flex-shrink:0}.hspill88 span{font:12px var(--mono);opacity:.85;overflow:hidden;text-overflow:ellipsis;min-width:0}
.hspill88.cpu{opacity:.8;font-size:14px}
body.phoneL .hspill88,body.phoneP .hspill88{font-size:14px;padding:3px 10px;top:6px;left:6px;max-width:38%}
body.phoneP .hspill88{top:auto;bottom:8px;left:50%;transform:translateX(-50%);max-width:70%}
body.phoneL #turnInd .tiname,body.phoneP2 #turnInd .tiname,body.phoneP #turnInd .tiname{flex-shrink:0;overflow:visible;max-width:none}
body.phoneL #actions [data-act="end"],body.phoneP2 #actions [data-act="end"],body.phoneP #actions [data-act="end"]{position:sticky;bottom:0;z-index:3;box-shadow:0 -6px 14px rgba(0,0,0,.55)}
.mfpeek88{margin-left:auto;padding:2px 8px;border-radius:6px;border:1px solid var(--line2,#5a4630);background:var(--ink,#1a120c);color:var(--bone,#efe3cc);cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;font-size:16px}
.mfpeek88:active{background:var(--gold,#d6ab4c);color:#000}
.mfpeek88pop{position:fixed;z-index:4000;display:flex;gap:10px;align-items:flex-start;padding:10px;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,.6)}
.mfpeek88pop[hidden]{display:none}.mfpeek88pop .rc-sub{margin-top:4px}
.hsown88{display:inline-flex;gap:4px;align-items:center;font-size:12px;color:var(--muted,#b9a98c);margin-left:6px}
.hsres88{margin:4px 0 8px}`;document.head.appendChild(st)})();
