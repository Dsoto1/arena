/* =====================================================================
   124-V81ONL · ONLINE v0.81 (client only — the server and 111-onlcore are untouched)
   =====================================================================
   RESULTS
   • The fingerprint (onlHash) is taken the moment gameOver is called, before the clean-up crew walks anyone off the sand,
     and the report (the whole table + that hash) is sent as soon as the results are known — not when the results window
     closes. A copy waits in localStorage flavius_onlreport81.<account> {id, acct, payload} until the server answers; it is sent again
     after a failure (back-off), on net.back, on every hello and once after a reload. The server keeps the first report of an
     account, so a resend is harmless; 'No such match' / 'Not your match' drop the copy.
   • A bout that is over on this screen is OVER (localStorage flavius_onlover81.<account>): it is never entered, rejoined or watched
     again (onlEnter / onlAttach / onlWatch / the auto-enter), the main-menu live record (flavius_onlmatch80) ignores it, the
     Online card says "⏳ Waiting for the others to confirm the result", and 🚪 Abandon never reaches the server for it
     (no Damnatio once the bout is over: the popup says the bout is over and you simply leave).
   • #onlWait ("… is on the move") and body.onl-off only while the arena is on screen (not over the Online window or the
     main menu); leaving cleans up a half-entered match (ONLM state, banner, a pending join to the host's opening).
   INVITES: no timer — an invite dies with its room. Before the popup and before ⚔ Join the room is read (lobby.list): started,
     full, closed or you already sit in another room → no popup / "That room closed before you got there" (👁 Watch when live).
     An open popup is re-checked every 10 s.
   CF online wears the wheat (ICO.wheat): stage, My Gladiators, Hall, result toast, abandon popup, Today, Forum results.
   SIGN-IN: the "Online server" box shows only after a word of power (localStorage flavius_onlsrv81); "Other players see only
     your gladiator's name".
   LANDING (Option 1): Orbis Terrarum is the dimmed backdrop of your stage (the whole world, no oval, glows breathing, a click
     opens the large map); the Forum sits in the right column under This week, the empire's headlines are 📰 lines in its
     feed (the online count shows once, on the stage); Today is a slim Victor | Fallen ribbon under the stage ("The sand
     waits." on a quiet day; + more → the full lists); the Playlists close the page — bordered per event (Democritus
     bronze-gold, Egidious deep red, Cassian steel blue, Familia olive) and sideways-scrolling on narrow screens.
     Phone: one column — stage → Today → Playlists → Forum → This week.
   ===================================================================== */
const ONL81={over:{},hashAt:{},sentAt:{},sending:false,tries:0,retryT:0,joinTok:0,invChk:false,listAt:0,list:null,noteAt:{}};
const onlW81=()=>typeof ICO!=='undefined'&&ICO.wheat?ICO.wheat:'🌾';
const onlWheat81=h=>String(h).replace(/⭐ ?/g,onlW81()+' ');

/* ---------------- over matches ---------------- */
const OVER81_KEY='flavius_onlover81',REP81_KEY='flavius_onlreport81';
/* per account (flavius_onlover81.<acct>): another lanista in another window of this browser is not over */
function onlOverAll81(acct){let o={};try{o=JSON.parse(localStorage.getItem(OVER81_KEY+'.'+acct)||'{}')||{}}catch(e){}return o}
function onlOver81(id,acct){if(!id)return false;if(ONL81.over[id])return true;acct=acct||onlRepMe81();
  const keys=acct?[OVER81_KEY+'.'+acct]:(()=>{const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(OVER81_KEY+'.')===0)out.push(k)}}catch(e){}return out})();
  for(const k of keys){const o=onlOverAll81(k.slice(OVER81_KEY.length+1));if(o[id]&&Date.now()-o[id]<3*864e5)return true}return false}
function onlOverMark81(id){if(!id)return;ONL81.over[id]=Date.now();const acct=onlRepMe81()||'?';const o=onlOverAll81(acct);o[id]=Date.now();
  const keep=Object.entries(o).filter(([,t])=>Date.now()-t<3*864e5).sort((a,b)=>b[1]-a[1]).slice(0,30);try{localStorage.setItem(OVER81_KEY+'.'+acct,JSON.stringify(Object.fromEntries(keep)))}catch(e){}}
function onlOverNote81(id){if(Date.now()-(ONL81.noteAt[id]||0)<4000)return;ONL81.noteAt[id]=Date.now();onlToast80(_T('⏳ Your bout is over — waiting for the others to confirm the result.'))}

/* ---------------- the report: frozen at the end, kept until the server has it ---------------- */
/* one saved report per account (flavius_onlreport81.<acct>): two windows of one browser are two lanistas in the mock */
function onlRepKeys81(){const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(REP81_KEY+'.')===0)out.push(k)}}catch(e){}return out}
function onlRepRead81(k){try{const x=JSON.parse(localStorage.getItem(k)||'null');if(x&&x.id&&x.payload&&Date.now()-(x.at||0)<2*864e5)return x;localStorage.removeItem(k)}catch(e){}return null}
function onlRepMe81(){return (ONL.acct&&ONL.acct.id)||(NET.mode==='mock'&&typeof mockMe==='function'&&mockMe())||null}
function onlRepGet81(){const me=onlRepMe81();if(me)return onlRepRead81(REP81_KEY+'.'+me);return onlRepKeys81().map(onlRepRead81).filter(Boolean).sort((a,b)=>b.at-a.at)[0]||null}
function onlRepPut81(x){try{localStorage.setItem(REP81_KEY+'.'+(x.acct||'?'),JSON.stringify(x))}catch(e){}}
function onlRepClear81(id,acct){for(const k of onlRepKeys81()){if(acct&&k!==REP81_KEY+'.'+acct)continue;const x=onlRepRead81(k);if(x&&(!id||x.id===id))try{localStorage.removeItem(k)}catch(e){}}}
function onlRow81(G,p,winners){const LR=G.lastResult||{};const row=(LR.rows||[]).find(x=>x.id===p.id)||{};const won=(winners||[]).some(w=>(w&&w.id)===p.id);
  const order=(G.elimOrder||[]).map(o=>o.id);const out=order.indexOf(p.id);const place=won?1:out<0?Math.min(G.players.length,2):Math.max(2,G.players.length-out);
  return {seat:G.players.indexOf(p),won,place,f:row.f|0,coin:p.coin|0,kills:(p.trophies||[]).filter(t=>t.pk==='player').length,survives:row.survives!==false,slew:(p.trophies||[]).some(t=>/commodus/i.test(String(t.k||t.n||'')))?['commodus']:[]}}
/* at gameOver, before anything moves: who reports, and the fingerprint */
function onlRepStart81(winners){const G=S;if(!G||!G.onl||G.overShown)return null;const id=G.onl.lobby;
  try{if(typeof onlLive80Clear==='function')onlLive80Clear(id)}catch(e){}onlOverMark81(id);
  const L=ONL.live;if(G.onl.watch||!L||L.id!==id||!G.players[L.seat]||(ONL.leftMatch||{})[id]||!ONL.acct)return null;
  const h=typeof onlHash==='function'?onlHash():'';ONL81.hashAt[id]=h;L.reported=true;return {G,id,winners,h,seat:L.seat,char:L.char,acct:ONL.acct.id}}
/* the table as soon as the results are known (S.lastResult), then send */
async function onlRepFinish81(R){for(let i=0;i<400&&!R.G.lastResult;i++)await new Promise(r=>setTimeout(r,40));if(!R.G.lastResult)return;
  const table=R.G.players.map(p=>onlRow81(R.G,p,R.winners));
  onlRepPut81({id:R.id,acct:R.acct,at:Date.now(),payload:{id:R.id,char:R.char,seat:R.seat,table,hash:R.h}});
  /* the mock world is one localStorage item shared by the windows: reports landing in the same moment could overwrite each other */
  if(NET.mode==='mock'&&R.seat>0)await new Promise(r=>setTimeout(r,R.seat*300));onlRepSend81('end')}
async function onlRepSend81(why){const x=onlRepGet81();if(!x||ONL81.sending)return;if(ONL.acct&&x.acct&&ONL.acct.id!==x.acct)return;
  ONL81.sending=true;clearTimeout(ONL81.retryT);let res;
  try{res=await NET.req('match.result',x.payload)}
  catch(e){ONL81.sending=false;const m=String(e&&e.message||e);if(/No such match|Not your match/i.test(m)){onlRepClear81(x.id,x.acct);return}
    ONL81.tries++;ONL81.retryT=setTimeout(()=>onlRepSend81('retry'),Math.min(60000,2000*2**Math.min(5,ONL81.tries-1)));return}
  ONL81.sending=false;ONL81.tries=0;ONL81.sentAt[x.id]=Date.now();if(ONL.live&&ONL.live.id===x.id)ONL.live.reported=true;
  /* the server has it. Pending: the copy stays (acked) until the match settles or hello stops listing it — a resend is harmless */
  try{if(res&&res.pending){const first=!x.acked;if(onlRepGet81())onlRepPut81({...x,acked:Date.now()});ONL.waitSettle=x.id;
      if(first){if(why==='end')setTimeout(()=>onlToast80(_T('⏳ Waiting for the other lanistas to confirm the result…')),2500);ONL81.retryT=setTimeout(()=>onlRepSend81('check'),NET.mode==='mock'?2500:8000)}}
    else{onlRepClear81(x.id,x.acct);if(res&&(ONL.waitSettle===x.id||why!=='check'))onlSettled(res);if(ONL.waitSettle===x.id)ONL.waitSettle=null}}catch(e){console.error(e)}
  try{if(document.getElementById('onl'))onlRedraw()}catch(e){}}
NET.on('match.settled',d=>{if(d&&d.id&&(!d.to||!ONL.acct||d.to===ONL.acct.id))onlRepClear81(d.id,ONL.acct&&ONL.acct.id)});
{const base=gameOver;gameOver=async function(winners){let R=null;try{if(S&&S.onl)R=onlRepStart81(winners)}catch(e){console.error(e)}
  const pr=base.apply(this,arguments);if(R)onlRepFinish81(R).catch(e=>console.error(e));return pr}}
/* every older caller (112 after the window, 121 on leaving) goes through the saved report */
onlReport=async function(winners){const L=ONL.live;if(!L)return;L.reported=true;if(onlRepGet81())return onlRepSend81('again');
  if(ONL81.sentAt[L.id]||ONL81.hashAt[L.id]!=null)return;if(!S||!S.players[L.seat]||!ONL.acct)return;
  const R={G:S,id:L.id,winners,h:typeof onlHash==='function'?onlHash():'',seat:L.seat,char:L.char,acct:ONL.acct.id};return onlRepFinish81(R)};
/* the outcome, with the wheat */
onlSettled=function(res){if(res.char)ONL.char=res.char.alive?res.char:null;const o=res.out;let msg;
  if(res.void)msg=_T('⚖ The lanistas did not agree on the result — the match is void: no pay, no deaths.');
  else if(!o)msg=_T('⚖ The match is settled.');
  else msg=o.died?(o.hall?_T`🪦 <b>${esc2(res.char.name)}</b> is dead. The Hall of the Fallen keeps the name.`:_T`🌫 <b>${esc2(res.char.name)}</b> is dead — and forgotten.`)
    :_T`${coinAmt87('+'+(o.pay))} · ${onlW81()} +${o.cf} lifetime CF${o.rankUp?_T` · ⚔ now <b>${esc2(onlRank(o.rankUp).n)}</b>`:''}`;
  setTimeout(()=>onlToast80(msg),2500)};
/* resend: on hello, when the socket comes back, once after a reload; an invitation's room is read before joining */
ONL81.invRooms=new Set();NET.on('lobby.invite',d=>{if(d&&d.row&&d.row.id)ONL81.invRooms.add(d.row.id)});
const ONL_DEAD81=_T('That room closed before you got there.');
{const base=NET.req;NET.req=function(t,d){
  /* 🚪 after the bout: nothing to abandon — the result was sent */
  if(t==='match.abandon'&&d&&onlOver81(d.id))return Promise.resolve({done:1,over:1});
  if(t==='lobby.join'&&d&&d.id){const self=this,args=arguments;return (async()=>{const inv=ONL81.invRooms.has(d.id);const c=await onlRoomCheck81(d.id,true);
    if(!c.ok&&(c.why==='closed'||c.why==='started'||(c.why==='full'&&inv))){if(c.why==='started')onlDeadPop81(c);throw new Error(ONL_DEAD81)}
    try{return await base.apply(self,args)}catch(err){if(/gone|under way/i.test(String(err.message))){const c2=await onlRoomCheck81(d.id,true);if(c2.why==='started')onlDeadPop81(c2);throw new Error(ONL_DEAD81)}throw err}})()}
  const p=base.apply(this,arguments);
  if(t==='hello'&&p&&typeof p.then==='function')p.then(r=>{if(!r||!r.me)return;const x=onlRepGet81();if(!x)return;
    if(!x.acked||(r.live&&r.live.id===x.id))setTimeout(()=>onlRepSend81('hello'),50);else if(d&&d.all)onlRepClear81(x.id,x.acct)}).catch(()=>{});return p}}
NET.on('net.back',()=>{if(onlRepGet81())onlRepSend81('back')});
setTimeout(async()=>{try{if(!onlRepGet81()||!(typeof ONL_ON==='function'&&ONL_ON()))return;if(typeof onlLive80Net==='function'&&!(await onlLive80Net()))return;
  await onlRepSend81('load');setTimeout(()=>{try{netIdleClose()}catch(e){}},2000)}catch(e){}},1500);

/* ---------------- an over match is never entered again ---------------- */
{const base=onlEnter;onlEnter=function(L){if(L&&onlOver81(L.id)){onlOverNote81(L.id);return}return base.apply(this,arguments)}}
{const base=onlAttach;onlAttach=async function(L,role){if(L&&onlOver81(L.id)){onlOverNote81(L.id);return}return base.apply(this,arguments)}}
{const base=onlWatch;onlWatch=async function(L){if(L&&onlOver81(L.id)){onlToast80(_T('⌛ That bout is over.'));return}return base.apply(this,arguments)}}
{const base=onlLive80Get;onlLive80Get=function(){const x=base.apply(this,arguments);return x&&onlOver81(x.id,x.acct)?null:x}}
/* the raw record is removed by id (the Get above hides over matches) */
{const base=onlLive80Clear;onlLive80Clear=function(id){try{const x=JSON.parse(localStorage.getItem('flavius_onlmatch80')||'null');if(x&&(!id||x.id===id))localStorage.removeItem('flavius_onlmatch80')}catch(e){}return base.apply(this,arguments)}}
{const base=onlLive80Put;onlLive80Put=function(x){if(x&&onlOver81(x.id,x.acct)){try{onlLive80Menu()}catch(e){}return}return base.apply(this,arguments)}}
/* the Online card of a match over on this screen: waiting for the others */
{const base=onlRoomTop80;onlRoomTop80=function(){const L=onlMyLobby();const me=onlMe80();
  if(L&&L.status==='live'&&L.players.some(p=>p.id===me)&&onlOver81(L.id)&&!(ONL.unseated80&&Date.now()<ONL.unseated80.until))
    return `<div class="card2 onl-mine onl-wait81" id="onlWait81">${_T`<b>${esc2(onlEvName(L.ev))}</b> at ${esc2(onlCityName(L.loc))} · ${L.ranked?_T('⚔ Ranked'):_T('Custom')}`}<div class="ow81">${_T`⏳ Waiting for the others to confirm the result`}</div>${_T`<small class="rc-sub">Your bout is over and your result was sent. Pay, CF and the Fate land when the others confirm.</small>`}</div>`;
  return base.apply(this,arguments)}}
{const base=onlLobbyHTML;onlLobbyHTML=function(){let h=base.apply(this,arguments);for(const L of ONL.lobbies||[])if(L.status==='live'&&onlOver81(L.id))
  h=h.replace(new RegExp(`<button[^>]*data-onl="rejoin" data-v="${String(L.id).replace(/[^\w-]/g,'')}"[^>]*>[^<]*</button>`),_T('<span class="badge" title="Waiting for the others to confirm the result">⏳ Confirming</span>'));return h}}
/* the abandon popup after the bout: no Damnatio, you just leave */
{const base=onlStakeHTML80;onlStakeHTML80=function(o){let h=onlWheat81(base.apply(this,arguments));
  if(o&&o.over){const nm=esc2((o.char||{}).name||_T('Your gladiator'));h=h.replace(/<div class="stk80-(warn|ok)">[\s\S]*?<\/div>(?=<p class="rc-sub")/,`<div class="stk80-ok">${_T`<b>The bout is over.</b> Your result was sent — leaving changes nothing for ${nm}: pay, CF and the Fate come from the result.`}</div>`)
    .replace(TX('You may come back to watch, but not to fight.'),_T('You simply leave.'))}return h}}
onlAbandonAsk80=function(o){o=o||{};if(!o.over&&S&&S.onl&&S.over&&!S.onl.watch&&onlOver81(S.onl.lobby))o={...o,over:true};
  return o.over?ask76(_T('🚪 Leave the match?'),onlStakeHTML80(o),_T('🚪 Leave'),_T('Stay')):ask76(_T('🚪 Abandon the match?'),onlStakeHTML80(o),_T('🚪 Abandon'),o.dropped?_T('Let the CPU fight on'):_T('Stay'))};

/* ---------------- "… is on the move" only over the arena; leaving cleans up ---------------- */
function onlArenaShown81(){if(!onlmOn())return false;if(document.getElementById('onl'))return false;const m=document.getElementById('mainMenu');if(m&&!m.hidden&&getComputedStyle(m).display!=='none')return false;return true}
function onlWaitGuard81(){const vis=onlArenaShown81();document.body.classList.toggle('onlnoarena81',!vis);if(!vis){document.body.classList.remove('onl-off');const el=document.getElementById('onlWait');if(el)el.hidden=true}}
{const base=onlmWaitShow;onlmWaitShow=function(){const r=base.apply(this,arguments);setTimeout(onlWaitGuard81,100);return r}}
setInterval(()=>{try{onlWaitGuard81()}catch(e){}},300);
{const base=onlExit;onlExit=function(){ONL81.joinTok++;const r=base.apply(this,arguments);try{ONLM.on=false;ONLM.q=[];ONLM.pend=null;ONLM.me=-1;ONLM.resyncing=false;ONLM.override=null;
  const el=document.getElementById('onlWait');if(el)el.hidden=true;document.body.classList.remove('onl-off')}catch(e){}return r}}
/* the wait for the host's opening stops when you leave, or when the bout is over */
onlJoinMatch=async function(L,onl){const tok=++ONL81.joinTok;const gone=()=>tok!==ONL81.joinTok||onlOver81(L.id);onlToast80(_T('⚔ Waiting for the host to open the arena…'));let g=null;
  for(let i=0;i<150&&!(g&&g.open);i++){if(gone())return;try{g=await NET.req('match.get',{id:L.id,from:0})}catch(e){}if(!(g&&g.open))await new Promise(r=>setTimeout(r,400))}
  if(gone())return;if(!g||!g.open){onlToast80(_T('⚠ The host never opened the arena.'));return}
  onlmLoad(g.open,{...onl,opened:true});ONLM.on=true;ONLM.me=onl.seat;ONLM.owners=onl.owners;ONLM.next=0;ONLM.q=[];ONLM.pend=null;ONLM.sent=0;ONLM.own=new Set();
  for(const inp of g.inputs||[])if(inp.from!==ONL.acct.id)ONLM.q.push(inp);
  try{if(typeof menuHide==='function')menuHide()}catch(e){}S.startedAt=Date.now();later(()=>beginTurn(),60)};

/* ---------------- invites die with their room ---------------- */
async function onlRoomCheck81(id,fresh){if(fresh||!ONL81.list||Date.now()-ONL81.listAt>3000){try{const rows=await NET.req('lobby.list');if(Array.isArray(rows)){ONL81.list=rows;ONL81.listAt=Date.now();ONL.lobbies=rows}}catch(e){return {ok:true}}}
  const mine=onlMyLobby();if(mine&&mine.status==='waiting'&&mine.id!==id)return {ok:false,why:'other'};
  const L=(ONL81.list||[]).find(x=>x.id===id);if(!L||L.status==='done')return {ok:false,why:'closed'};if(L.status==='live')return {ok:false,why:'started',L};
  if(L.players.length>=L.seats)return {ok:false,why:'full',L};return {ok:true,L}}
{const base=onlInvitePop80;onlInvitePop80=function(it){if(ONL81.invChk){ONLF.invq.unshift(it);return}ONL81.invChk=true;
  onlRoomCheck81(it.row&&it.row.id).then(c=>{ONL81.invChk=false;if(!c.ok||onlPopOpen80()||onlInMatch80()||!document.getElementById('onl'))return;base.call(this,it);
    for(const p of document.querySelectorAll('.inv80bg'))p.dataset.room81=it.row.id}).catch(()=>{ONL81.invChk=false})}}
/* an open invitation is checked again; joining another room ends every invitation */
setInterval(()=>{try{const mine=onlMyLobby();if(mine&&mine.status==='waiting'){ONLF.invq=[];for(const p of document.querySelectorAll('.inv80bg'))p.remove();return}
  const p=document.querySelector('.inv80bg[data-room81]');if(!p||Date.now()-(+p.dataset.chk81||+p.dataset.at81||0)<10000){if(p&&!p.dataset.at81)p.dataset.at81=Date.now();return}p.dataset.chk81=Date.now();
  onlRoomCheck81(p.dataset.room81,true).then(c=>{if(!c.ok&&p.isConnected)p.remove()})}catch(e){}},1000);
/* a room that started before you got there: 👁 Watch (a closed one is the join's own message) */
function onlDeadPop81(c){if(!c||!c.L||c.L.status!=='live')return;for(const o of document.querySelectorAll('.dead81bg'))o.remove();
  const bg=document.createElement('div');bg.className='veraskbg onl80pop dead81bg';
  bg.innerHTML=`<div class="card2 verask" role="dialog" aria-modal="true">${_T`<b>🚪 That room closed before you got there</b>`}<div style="margin:6px 0 10px" class="rc-sub">${_T`The horns already sounded — you may watch the bout for free.`}</div>
    <div class="acts"><button type="button" class="btn primary" data-onl81="dwatch" data-v="${esc2(c.L.id)}">${_T`👁 Watch`}</button><button type="button" class="btn" data-onl81="dclose">${_T`Close`}</button></div></div>`;
  bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()});document.body.appendChild(bg)}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.dead81bg [data-onl81],#onl [data-onl81],.td81pop [data-onl81]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const a=b.dataset.onl81,v=b.dataset.v;
  if(a==='dclose'||a==='tdx'){onlPopClose80(b);return}
  if(a==='dwatch'){onlPopClose80(b);const L=(ONL.lobbies||[]).find(x=>x.id===v);if(L)onlDo(()=>onlWatch({...L,status:'live'}));return}
  if(a==='today'){onlTodayPop81();return}},true);

/* ---------------- CF wears the wheat ---------------- */
{const base=onlCharHTML;onlCharHTML=function(){return onlWheat81(base.apply(this,arguments))}}
{const base=onlHallHTML;onlHallHTML=function(){return base.apply(this,arguments).replace(/<small>(\d+) CF ·/g,`<small>${onlW81()} $1 CF ·`)}}
{const base=onlFeedHTML80;onlFeedHTML80=function(){let h=base.apply(this,arguments).replace(/ — (\d+) CF<\/div>/g,` — ${onlW81()}$1 CF</div>`);
  const news=(ONL.news||[]).slice(0,3).map(([,t])=>`<div class="news81">📰 ${esc2(t)}</div>`).join('');if(!news)return h;
  return /The Forum is quiet/.test(h)?news:news+h}}

/* ---------------- sign-in: the server box only after the word ---------------- */
const onlSrvOn81=()=>{try{return localStorage.getItem('flavius_onlsrv81')==='1'}catch(e){return false}};
cheatRegister('h2944489914',()=>{try{localStorage.setItem('flavius_onlsrv81','1')}catch(e){}try{if(document.getElementById('onl'))onlRedraw()}catch(e){}return _T('🌐 The <b>Online server</b> box shows on the Online sign-in screen.')},_T('Online server box'));
CHEAT_SHOW.push([[86,85,83,90,89,93],_T('🌐 Shows the "Online server" box on the Online sign-in screen (for test servers)')]);
{const base=onlSignInHTML;onlSignInHTML=function(){let h=base.apply(this,arguments);
  h=h.replace(TX('Signing in shares your Google name and e-mail with the arena.'),_T('Signing in shares your Google name and e-mail with the arena. Other players see only your gladiator’s name.'));
  if(!onlSrvOn81())h=h.replace(/<details class="onl-srv">[\s\S]*?<\/details>/,'');return h}}

/* ---------------- the landing: your gladiator on the world ---------------- */
function onlStageMap81(){return `<div class="smap81" id="onlStageMap81" data-onl="omap" role="button" tabindex="0" title="${_T`Open the map`}"><div class="omap-in"></div><div class="omap-dots" aria-hidden="true">${onlDots80(.85)}</div></div>`}
function onlStageCap81(){return `<div class="scap81">🌍 <span id="omapCap">${onlCap80()}</span><button type="button" class="btn tksm" data-onl="omap" title="${_T`Open the map`}">🔍</button></div>`}
function onlStage81(ch){const map=onlStageMap81(),cap=onlStageCap81();
  if(!ch)return `<div class="onl-stage onl-stage81 ng81">${map}<div class="ng81in">${onlNoGladHTML(_T('Make one to fight, host, wager or buy a ticket.'))}</div>${cap}</div>`;
  let h=onlWheat81(onlStageHTML(ch));const pre='<div class="onl-stage">';
  if(h.startsWith(pre)&&h.endsWith('</div>'))return `<div class="onl-stage onl-stage81">${map}${h.slice(pre.length,-6)}${cap}</div>`;return h}
function onlForum81(){const q=onlQuiet80();
  return `<div class="ofor81" id="onlForum81"><div class="ow-h">${_T`📯 The Forum`}<span class="f80-ctl"><button type="button" class="btn tksm" data-onl="who" title="${_T`Who is here`}">${_T`👥 Here now`}</button><button type="button" class="btn tksm ${q?'on':''}" data-onl="quiet" title="${q?_T('Quiet: no banners or invite pop-ups'):_T('Banners and invites pop up')}">${q?_T('🔕 Quiet'):'🔔'}</button></span></div>
    <div class="ofor"><div class="ofor-feed" id="onlFeed80">${onlFeedHTML80()}</div><div class="ofor-chips">${ONLC.QC.forum.map(x=>`<button type="button" data-onl="fsay" data-v="${x}">${esc2(onlQ80(x))}</button>`).join('')}</div></div></div>`}
const ONL_PLTONE81={democritus:'bronze',egidious:'red',cassian:'steel',familia:'olive'};
onlPlayHTML=function(){const ch=ONL.char;const S9=ONL.stats||{};const ch3=S9.challenges||[];
  const lists=ONLC.EVENTS_ALL.map(k=>{const open=(ONL.lobbies||[]).filter(L=>L.ev===k&&L.status==='waiting');const tm=ONLC.EVENTS_TEAM.includes(k);
    return `<div class="onl-pl pl81 pl81-${ONL_PLTONE81[k]||'bronze'} ${tm?'team':''}" data-pl81="${k}"><div class="onl-plart">${typeof cardHTML==='function'?cardHTML('e:'+k,'sm'):''}</div><div class="onl-plb">${_T`<b>${esc2(onlEvName(k))}</b>${tm?'<span class="badge gold">👥 Teams · 4–8 seats</span>':''}<small>${open.length} open · ${open.filter(L=>L.ranked).length} ranked</small>`}
      <div class="acts"><button type="button" class="btn primary tksm" data-onl="quick" data-v="${k}|1">${_T`⚔ Ranked`}</button><button type="button" class="btn tksm" data-onl="quick" data-v="${k}|0">${_T`Custom`}</button></div></div></div>`}).join('');
  return `${onlRoomTop80()}<div class="onl-play onl-play81"><div class="a81-stage">${onlStage81(ch)}</div>
    <div class="a81-week card2">${_T`<b>⚡ This week</b>${ch3.map(([t])=>`<div class="onl-ch">◻ ${esc2(t)}</div>`).join('')}`}</div>
    <div class="a81-forum">${onlForum81()}</div>
    <div class="a81-today">${onlTodayHTML80()}</div>
    <div class="a81-pls"><h3 class="onl-h">${_T`Playlists`} <span class="rc-sub">${_T`Ranked pairs your rank only · Custom is anyone, no Fate deaths`}</span></h3><div class="onl-pls onl-pls81">${lists}</div></div></div>`};
onlPatchMap80=function(){const c=document.getElementById('omapCap');if(c)c.innerHTML=onlCap80();for(const d of document.querySelectorAll('#onlStageMap81 .omap-dots,#onlRow80 .omap-dots'))d.innerHTML=onlDots80(d.closest('#onlStageMap81')?.85:1)};
/* sideways playlists: a vertical wheel scrolls them sideways while they can move */
document.addEventListener('wheel',e=>{const r=e.target.closest&&e.target.closest('.onl-pls81');if(!r||r.scrollWidth<=r.clientWidth+2||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
  const max=r.scrollWidth-r.clientWidth;if((e.deltaY>0&&r.scrollLeft>=max-1)||(e.deltaY<0&&r.scrollLeft<=0))return;e.preventDefault();r.scrollLeft+=e.deltaY},{passive:false});

/* ---------------- ☀ Today: a slim Victor | Fallen ribbon ---------------- */
const ONL_TODAYFULL81=onlTodayHTML80;
onlTodayHTML80=function(){const T=ONL80F.today;const yd=T&&T.day==='yesterday';const WN=(T&&T.wins)||[],F=(T&&T.fallen)||[],U=(T&&T.upsets)||[];
  if(!WN.length&&!F.length&&!U.length)return `<div class="td81 quiet" id="onlToday80">${_T`The sand waits.`}</div>`;
  const where=e=>_T`${esc2(onlEvName(e.ev))} at ${esc2(onlCityName(e.loc))}`;
  const card=(e,k,h,line)=>`<div class="td81-c ${k}"><span class="td81-art">${onl80Face(e,'sm')}<span class="td81-tok">${onlFig(e.cls,e.look,40)}</span></span><span class="td81-t"><small>${h}</small><b>${esc2(e.name)}</b><span>${line}</span></span></div>`;
  const w=WN[0];const c1=w?card(w,'win',_T`🏆 Victor ${yd?_T('yesterday'):_T('of the day')}`,_T`Won ${where(w)} with ${onlW81()}<b>${cfAmt87(w.cf|0)}</b>`):`<div class="td81-c win none">${_T`<small>🏆 No victor yet</small>`}</div>`;
  let c2;const f=F[0];if(f)c2=card(f,'fall',_T`🪦 Fallen ${yd?_T('yesterday'):_T('today')}`,f.how==='damnatio'?_T`Abandoned ${where(f)} — <b>Damnatio</b>`:_T`Fell to the Fate in ${where(f)}`);
  else if(U.length){const u=U[0];c2=card({...u.l},'fall',_T('⚔ Humbled'),_T`by <b>${esc2(u.w.name)}</b> in ${where(u)}`)}else c2=`<div class="td81-c fall none">${_T`<small>🪦 No one fell ${yd?_T('yesterday'):_T('today')}</small>`}</div>`;
  const more=Math.max(0,WN.length-1)+Math.max(0,F.length-(f?1:0))+Math.max(0,U.length-(f?0:1));
  return `<div class="td81" id="onlToday80">${c1}${c2}${more?`<button type="button" class="td81-more" data-onl81="today" title="${_T`The day's lists`}">${_T`+${more} more`}</button>`:''}</div>`};
function onlTodayPop81(){for(const o of document.querySelectorAll('.td81pop'))o.remove();const h=ONL_TODAYFULL81();if(!h)return;
  const bg=document.createElement('div');bg.className='veraskbg onl80pop td81pop';
  bg.innerHTML=`<div class="card2 verask td81box" role="dialog" aria-modal="true">${h.replace('id="onlToday80"','').replace(/<b>(\d+) CF<\/b>/g,`${onlW81()}<b>$1 CF</b>`).replace(/ · (\d+) CF · /g,` · ${onlW81()}$1 CF · `)}<div class="acts"><button type="button" class="btn" data-onl81="tdx">${_T`Close`}</button></div></div>`;
  bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()});document.body.appendChild(bg)}

{const st=document.createElement('style');st.textContent=`
body.onlnoarena81 #onlWait{display:none!important}
.onl-wait81 .ow81{font:700 16px Georgia,serif;color:var(--gold,#e8c96a);margin:6px 0 2px}
.dead81bg .verask .acts .btn{flex:1 1 100px}
.onl-play81{display:grid;grid-template-columns:minmax(0,1fr) 300px;grid-template-areas:"stage week" "stage forum" "today forum" "pls pls";grid-template-rows:auto 1fr auto auto;gap:12px 14px;align-items:stretch}
.a81-stage{grid-area:stage;min-width:0}.a81-week{grid-area:week;align-self:start}.a81-forum{grid-area:forum;min-width:0;display:flex}.a81-today{grid-area:today;min-width:0}.a81-pls{grid-area:pls;min-width:0}
.a81-stage>.onl-stage{height:100%;box-sizing:border-box}
.onl-stage81{isolation:isolate;background:radial-gradient(ellipse 40% 70% at 82% 70%,rgba(255,214,140,.26),transparent 70%),linear-gradient(180deg,#1d150d,#120c07)}
.onl-stage81>*:not(.smap81){position:relative;z-index:1}
.onl-stage81 .onl-light{display:none}
.smap81{position:absolute!important;left:0;right:0;top:0;z-index:0;aspect-ratio:2400/853;cursor:zoom-in;
  -webkit-mask-image:linear-gradient(to bottom,#000 50%,transparent 100%),linear-gradient(to right,transparent 0,#000 10%,#000 90%,transparent 100%);-webkit-mask-composite:source-in;
  mask-image:linear-gradient(to bottom,#000 50%,transparent 100%),linear-gradient(to right,transparent 0,#000 10%,#000 90%,transparent 100%);mask-composite:intersect}
.smap81 .omap-in,.smap81 .omap-dots{position:absolute;inset:0}.smap81 .omap-in{filter:sepia(.45) saturate(.8) brightness(.42) contrast(1.05)}
.smap81:hover .omap-in{filter:sepia(.4) saturate(.85) brightness(.52) contrast(1.05)}.smap81:focus-visible{outline:2px solid #f0c060;outline-offset:-2px}
.onl-stage81 .onl-plate{padding:8px 12px 8px 0;border-radius:10px;background:linear-gradient(90deg,rgba(18,12,7,.78),rgba(18,12,7,.45) 70%,transparent);pointer-events:none}.onl-stage81 .onl-plate *{pointer-events:auto}
.onl-stage81 .onl-pname{text-shadow:0 2px 8px #000}
.scap81{grid-column:1;display:flex;align-items:center;gap:6px;font-size:13px;color:#bfae88;margin-top:2px}.scap81 b{color:#f0c060}.scap81 .btn{padding:1px 7px;min-width:0}
.onl-stage81.ng81{display:flex;flex-direction:column;justify-content:flex-end;gap:8px}.ng81in .onl-noglad{background:rgba(20,14,8,.82)}
.a81-week .onl-ch{font-size:13px}
.ofor81{display:flex;flex-direction:column;flex:1;min-width:0}.ofor81 .ow-h{margin:0 0 6px}.ofor81 .ofor{min-height:0;flex:1}
.ofor81 .ofor-feed{position:static;height:200px;flex:1 1 200px;max-height:none}
.ofor-feed .news81{color:#c9b98f;font-style:italic;border-bottom:1px dashed rgba(255,255,255,.07);padding-bottom:4px}
.td81{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:10px;align-items:stretch}
.td81.quiet{display:block;padding:8px 12px;border:1px dashed #4a3a26;border-radius:10px;color:var(--muted);font-style:italic;font-size:13px;text-align:center}
.td81-c{display:flex;gap:10px;align-items:center;padding:6px 10px;border:1px solid #c9a24f;border-radius:10px;background:linear-gradient(90deg,rgba(201,162,79,.14),rgba(33,25,19,.6));min-width:0;min-height:62px}
.td81-c.fall{border-color:#7a3a2a;background:linear-gradient(90deg,rgba(122,58,42,.2),rgba(27,19,17,.6))}.td81-c.none{border-style:dashed;opacity:.7;justify-content:center;color:var(--muted)}
.td81-art{position:relative;flex:none;width:40px}.td81-art .portrait{width:40px!important;height:56px!important;border-radius:6px;overflow:hidden;border:1px solid #6b5532;display:block}
.td81-c.fall .td81-art .portrait{filter:grayscale(.55) sepia(.2)}.td81-tok{position:absolute;right:-12px;bottom:-6px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}.td81-tok img,.td81-tok svg{max-height:34px}
.td81-t{display:flex;flex-direction:column;min-width:0;padding-left:8px;font-size:12.5px;line-height:1.3}.td81-t small{color:#bfae88;font-size:11px}.td81-t b{font:700 15px Georgia,serif;color:var(--bone,#eee);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.td81-t>span{color:#eadbb8;overflow:hidden;text-overflow:ellipsis}.td81-t>span b{font:600 12.5px system-ui,sans-serif;color:#f3d58a}
.td81-more{all:unset;cursor:pointer;align-self:center;padding:6px 10px;border:1px solid #6b5532;border-radius:999px;font-size:12px;color:#eadbb8;white-space:nowrap}.td81-more:hover{border-color:#c9a24f}
.td81pop .td81box{width:min(820px,96vw)!important;max-height:92vh;overflow-y:auto}.td81pop .td80{margin-top:0}
.onl-pl.pl81{border-width:2px}.onl-pl.pl81-bronze{border-color:#b08a3a;background:linear-gradient(180deg,rgba(176,138,58,.12),rgba(255,255,255,.02))}.onl-pl.pl81-red{border-color:#8e2a22;background:linear-gradient(180deg,rgba(142,42,34,.14),rgba(255,255,255,.02))}
.onl-pl.pl81-steel{border-color:#4f6f8f;background:linear-gradient(180deg,rgba(79,111,143,.14),rgba(255,255,255,.02))}.onl-pl.pl81-olive{border-color:#6b7a32;background:linear-gradient(180deg,rgba(107,122,50,.15),rgba(255,255,255,.02))}
.onl-pl.pl81:hover{border-color:var(--gold,#e8c96a)}
.onl-pls81{grid-template-columns:repeat(auto-fit,minmax(225px,1fr))}.onl-pl.pl81{grid-template-columns:62px minmax(0,1fr)}.onl-pls81 .onl-plb b{font-size:17px}
@media(max-width:760px){
 .onl-play81{grid-template-columns:minmax(0,1fr);grid-template-areas:"stage" "today" "pls" "forum" "week";grid-template-rows:none}
 .onl-pls81{display:flex;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;gap:10px;padding:2px 2px 8px;scrollbar-width:thin;
   -webkit-mask-image:linear-gradient(to right,transparent 0,#000 12px,#000 calc(100% - 26px),transparent 100%);mask-image:linear-gradient(to right,transparent 0,#000 12px,#000 calc(100% - 26px),transparent 100%)}
 .onl-pls81>.onl-pl{flex:0 0 min(82%,300px);scroll-snap-align:start}.onl-pls81 .onl-plb b{font-size:16px}
 .ofor81 .ofor-feed{height:150px;flex-basis:150px}
 .td81{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.td81-more{grid-column:1/-1;justify-self:center}
}
@media(max-width:560px){
 .onl-stage{grid-template-columns:minmax(0,1fr)!important;justify-items:center;text-align:center;padding:14px 12px}
 .onl-fig79{grid-column:1!important;grid-row:auto!important;justify-self:center;margin:0!important}
 .onl-stage .onl-plate{grid-column:1!important;grid-row:auto!important;justify-items:center}.onl-stage81 .onl-plate{background:radial-gradient(ellipse at center,rgba(18,12,7,.55),rgba(18,12,7,.15) 75%,transparent);padding:8px 10px}
 .onl-stage .onl-slot{width:64px;height:78px}.onl-stage .onl-slot .onl-mini{height:50px!important}.onl-stage .onl-party{gap:6px}
 .onl-stage81 .onl-plate{order:1}.onl-stage81 .onl-fig79{order:2}.onl-stage81 .scap81{order:3}.onl-stage81 .onl-party{order:4}
 .onl-stage .onl-party{grid-column:1;justify-content:center}.onl-pstats{justify-content:center}.onl-bar{margin:0 auto}
 .scap81{justify-content:center;flex-wrap:wrap}.onl-pname{font-size:24px}
 .td81{grid-template-columns:minmax(0,1fr)}
}`;document.head.appendChild(st)}
