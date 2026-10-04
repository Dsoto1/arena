/* =====================================================================
   139-V84ONL · ONLINE v0.84 (protocol 7, contract tools/plans/onl84-contract.md): the rules every client runs the same way, the MOCK, the screens
   =====================================================================
   NAMED ARMOR • 'na#uid' pieces (engine key 'na_uid'): a kit's armor defs register ARM['na_uid'] = the printed base's look + the def's stats
     (ONLC.cleanNamedA) on every client when seats are built and after a snapshot (p._na84), worn like a bought piece. Engine hooks, all
     deterministic: hurt (ward, invicta, vindex, gloriosa), mvMax (swift, mercurialis), resetTurn (regalis, restituta).
   HOLOGRAPHIC CARDS • nw83Card draws armor too; Rare / Epic / Legendary cards get .holo84 (an animated sheen in the rarity colours; still under
     body.calm and prefers-reduced-motion).
   SEASONS • hello.season84 = this week's fixture (the Manager schedule, ONLC.onlineFixture) → the landing's "This week" challenge card and the first
     playlist card "⭐ This week: <event> at <city>"; hello.week84 = the house's progress (win it · survive it Ranked · 3 bouts → one gift a week).
   YOUR TURN • a hidden / unfocused tab: the title flashes, a horn (the game's mute applies), a desktop notice only if allowed from ⚔🔔 Turn alerts.
   RECLAIM • drop / abandon inputs with `until` open a window on that seat (p._cpu84). Every client HALTS at the start of that seat's next CPU turn
     until ONE server input says 'reclaim' (the lanista is back: p.cpu=false, the reclaimer's client becomes that fighter) or 'cpugo' (the CPU
     plays on). Both are state-neutral marks when they arrive; the swap happens at the halt — the same engine state on every screen.
     A 🔌 bar offers "Take it back" while the server says it can (hello.reclaim84, match.watch reclaim, my own drop input).
   CPU-WON REWARDS • p._t84 {h,c} counts each seat's turns at resetTurn; result rows carry cpu (ONLC.cpuRow) → the server cuts the rewards.
   AUCTION • a rail tab 🔨 Auction (auction.list / auction.bid): lot cards, countdown, the leader, the next minimum, my lead/win, last week.
   FOLLOW-UPS • TEST chip on in-match names (fighter panel + log), Today's house chips, the loot popup's full named cards.
   MOCK • every v0.84 route as server/src/routes.js (localStorage flavius_onlclock84 = a clock offset in ms for tests).
   ===================================================================== */
const ONL84={rcl:null,want:null,auc:null,aucAt:0,season:null,week:null,flash:0,mineWas:false,title0:'',halt:null};
const onl84Clock=()=>{try{return +(localStorage.getItem('flavius_onlclock84')||0)||0}catch(e){return 0}};
const mockT84=()=>Date.now()+onl84Clock();

/* =========================== NAMED ARMOR: the catalog, ARM, the kit =========================== */
/* the catalog's armor carries slot / pt / pair / bonus (the server rolls named armor from them) */
{const base=onlCatalog;onlCatalog=function(){const c=base.apply(this,arguments);
  for(const [k,it] of Object.entries(c))if(it.kind==='a'&&it.slot==null&&ARM[k]){const A=ARM[k];it.slot=A.slot;it.pt=A.pt||'';if(A.pair)it.pair=1;if(A.bonus&&Object.keys(A.bonus).length)it.bonus={...A.bonus}}return c}}
ONL84.regArmor=function(defs){for(const d0 of defs||[]){const d=ONLC.cleanNamedA(d0);if(!d)continue;const B=ARM[d.base]||{};
  const A={...B,n:d.n,lv:4,slot:d.slot,pt:d.pt||B.pt,ap:d.ap,named84:1,rar:d.rar,aff:d.aff.slice(),base:d.base};delete A.custom;delete A.stack;delete A.bonus;delete A.ward;delete A.swift;delete A.uq;
  if(d.bonus)A.bonus={...d.bonus};if(d.ward)A.ward=1;if(d.swift)A.swift=1;if(d.uq)A.uq=d.uq;if(d.pair)A.pair=1;
  if(ARM[d.key]&&JSON.stringify(ARM[d.key])===JSON.stringify(A))continue;ARM[d.key]=A;try{if(typeof ARM_FIT!=='undefined'&&ARM_FIT[d.base]&&!ARM_FIT[d.key])ARM_FIT[d.key]=ARM_FIT[d.base]}catch(e){}}};
{const base=onlSeatsFor;onlSeatsFor=function(L){const seats=base.apply(this,arguments);
  try{(L.players||[]).forEach((p,i)=>{const s=seats[i];if(!s||!s.onl)return;if(p.test)s.onl.test=1;if(s.cpu||/^bot/.test(p.id))return;const k=p.kit||{};
    const A=(k.named||[]).filter(d=>d&&/^na_/.test(d.key||'')).map(ONLC.cleanNamedA).filter(Boolean);if(A.length){ONL84.regArmor(A);s.onl.namedA=A}})}catch(e){console.error(e)}return seats}}
{const base=mkPlayer;mkPlayer=function(i,seat){const p=base.apply(this,arguments);
  try{if(seat&&seat.onl){if(seat.onl.test)p._test84=1;if((seat.onl.namedA||[]).length&&!seat.cpu)p._na84=seat.onl.namedA.map(d=>({...d}))}}catch(e){console.error(e)}return p}}
const ONL84_LOCS=d=>d.slot==='head'?['head']:d.slot==='chest'||d.slot==='belt'?['chest']:d.slot==='arm'?['rarm','larm']:['rleg','lleg'];
{const base=giveLoadout;giveLoadout=function(p){const r=base.apply(this,arguments);
  try{if(p&&p._onlKit&&p.pieces)for(const k of p._onlKit){if(!/^na_/.test(k)||!ARM[k])continue;const d=ARM[k];const locs=ONL84_LOCS(d).filter(l=>p.pieces[l]);
    if(d.pair){for(const l of locs)equipPiece(p,k,l)}else for(const l of locs)if(equipPiece(p,k,l))break}}catch(e){console.error(e)}return r}}
{const base=onlmLoad;onlmLoad=function(){const r=base.apply(this,arguments);try{if(S&&S.players)for(const p of S.players)if(p._na84)ONL84.regArmor(p._na84)}catch(e){}return r}}
/* a lobby kit's pieces (named weapons AND named armor from kit.named) */
ONL83.kitPieces=function(kit){if(!kit)return [];const cat=onlCatalog();const nm=Object.fromEntries((kit.named||[]).map(d=>[d.key,d]));
  return (kit.gear||[]).map((k,i)=>{const it=(kit.items||[])[i]||k;if(/^n[wa]_/.test(k)){const d=nm[k];return d?ONLC.pieceInfo({item:it,pc:{st:'whole',rar:d.rar,w:d}},cat):null}return ONLC.pieceInfo({item:it,pc:null},cat)}).filter(Boolean)};

/* ---------------- the engine hooks (named armor while WORN; deterministic) ---------------- */
function na84On(p,f){if(!p||!p.pieces)return null;for(const l of Object.keys(p.pieces))for(const pc of p.pieces[l]||[]){const A=ARM[pc.key];if(A&&A.named84&&f(A,pc,l))return {A,pc,l}}return null}
const na84Unhurt=p=>!!p&&!!p.hp&&Object.keys(BASE_HP).every(l=>(p.hp[l]|0)>=BASE_HP[l]);
{const base=hurt;hurt=async function(victim,location,damage,source,prefix,opts){
  const pvp=!!(victim&&victim.cls&&victim.pieces);if(!pvp||!(damage>0))return base.apply(this,arguments);
  const direct=!!(opts&&opts.direct);const att=source&&source.type==='player'&&source.p&&source.p!==victim?source.p:null;let d=damage;
  try{if(att&&att.lastHitBy===victim.id){const v=na84On(att,A=>A.uq==='vindex');if(v){d++;log(`${nm(att)}'s ${v.A.n} remembers the blow: +1 damage.`)}}
    if(!direct&&S){const w=na84On(victim,A=>A.ward);const k=S.ri+':'+S.rotation;if(w&&victim._ward84!==k&&d>0){victim._ward84=k;d--;log(`${nm(victim)}'s ${w.A.n} turns 1 damage aside.`)}}
    if(!direct&&d>=2){const iv=na84On(victim,(A,pc,l)=>A.uq==='invicta'&&l===location);if(iv){d--;log(`${nm(victim)}'s ${iv.A.n} holds: −1 damage.`)}}}catch(e){console.error(e)}
  const glo=att?na84On(victim,A=>A.uq==='gloriosa'):null;const hp0=victim.hp[location];
  const r=await base.call(this,victim,location,d,source,prefix,opts);
  try{if(glo&&d>0&&victim.alive&&victim.hp[location]===hp0&&cfAllowed()){cfWhy('a legendary armor');victim.cf+=1;log(`${nm(victim)}'s ${glo.A.n}: the blow rings off — the crowd roars (+1 CF).`)}}catch(e){}
  return r}}
{const base=mvMax;mvMax=function(player){let m=base.apply(this,arguments);
  try{if(player&&player.cls&&player.pieces){let x=0;if(na84On(player,A=>A.uq==='mercurialis'))x++;if(na84On(player,A=>A.swift)&&na84Unhurt(player))x++;if(x)m=Math.max(0,Math.min(7,m+x))}}catch(e){}return m}}
{const base=resetTurn;resetTurn=function(player){const r=base.apply(this,arguments);
  try{if(player&&player.cls&&S&&S.onl){const t=player._t84||(player._t84={h:0,c:0});if(player.cpu)t.c++;else t.h++}
    if(player&&player.alive&&player.pieces){const g=na84On(player,A=>A.uq==='regalis');if(g&&cfAllowed()){cfWhy('a legendary armor');player.cf+=1;log(`${nm(player)}'s ${g.A.n}: +1 CF.`)}
      const rs=na84On(player,A=>A.uq==='restituta');if(rs){const l=rs.l;const cap=Math.min(7,(player.pieces[l]||[]).reduce((a,pc)=>a+(pc.ap|0),0));if(player.ap[l]>0&&player.ap[l]<cap){player.ap[l]++;log(`${nm(player)}'s ${rs.A.n} mends: +1 AP.`)}}}}catch(e){console.error(e)}
  return r}}

/* ---------------- CPU-won rewards + the TEST chip in the match ---------------- */
{const base=onlRow81;onlRow81=function(G,p){const row=base.apply(this,arguments);try{row.cpu=ONLC.cpuRow(p&&p._t84)}catch(e){}return row}}
if(typeof seatChipHTML==='function'){const base=seatChipHTML;seatChipHTML=function(p){const h=base.apply(this,arguments);return p&&p._test84?'<i class="test83">TEST</i>'+h:h}}
{const base=log;log=function(html,cls){try{if(S&&S.onl&&typeof html==='string'&&S.players)for(const p of S.players)if(p._test84&&p.name){const a=`>${p.name}</b>`;if(html.includes(a)&&!html.includes(a+'<i class="test83">'))html=html.split(a).join(a+'<i class="test83">TEST</i>')}}catch(e){}return base.call(this,html,cls)}}

/* =========================== RECLAIM: the halt, the marks, the swap =========================== */
/* a window opens with the server's drop / abandon input (until); the CPU takes the seat as before */
{const base=onlmDrop;onlmDrop=function(inp){const was=ONLM.owners[inp.seat]||null;const r=base.apply(this,arguments);
  try{const p=S.players[inp.seat];if(p&&inp.until&&was){p._cpu84={acct:was,until:inp.until,res:null};if(ONL.acct&&was===ONL.acct.id)ONL84.rcl={id:S.onl.lobby,seat:inp.seat,until:inp.until}}}catch(e){}return r}}
{const base=onlmAbandonMark;onlmAbandonMark=function(inp){const was=ONLM.owners[inp.seat]||null;const r=base.apply(this,arguments);
  try{const p=S.players[inp.seat];if(p&&inp.until&&inp.rule==='cpu'&&was&&!p._cpu84){p._cpu84={acct:was,until:inp.until,res:null};if(ONL.acct&&was===ONL.acct.id)ONL84.rcl={id:S.onl.lobby,seat:inp.seat,until:inp.until}}}catch(e){}return r}}
/* 'reclaim' / 'cpugo' (server only) are marks: always ready, no state change until the halt */
{const base=onlmReady;onlmReady=function(inp){if(inp&&(inp.k==='reclaim'||inp.k==='cpugo'))return !!S&&!S.over;return base.apply(this,arguments)}}
{const base=onlmApply;onlmApply=function(inp){if(inp&&(inp.k==='reclaim'||inp.k==='cpugo')){try{onl84Mark(inp)}catch(e){console.error(e)}setTimeout(onlmPump,30);return}return base.apply(this,arguments)}}
function onl84Mark(inp){if(inp.from!=='server')return;const p=S.players[inp.seat];if(!p||!p._cpu84||p._cpu84.res)return;p._cpu84.res=inp.k==='reclaim'?'human':'cpu';if(inp.acct)p._cpu84.acct=inp.acct;
  if(ONL84.rcl&&ONL84.rcl.seat===inp.seat&&ONL84.rcl.id===S.onl.lobby&&inp.k==='cpugo'){ONL84.rcl=null;onl84Bar()}
  if(inp.k==='cpugo')log(`🔌 The CPU fights on in <b>${esc(p.name)}</b>’s seat.`,'thought');
  const H=ONL84.halt;if(H&&H.seat===inp.seat){ONL84.halt=null;H.res()}}
/* the swap at the halt: the seat is human again; the reclaimer's own screen becomes that fighter */
function onl84Swap(p){const i=S.players.indexOf(p);const acct=p._cpu84&&p._cpu84.acct;delete p._cpu84;if(i<0)return;p.cpu=false;ONLM.owners[i]=acct;
  if(ONLM.left){delete ONLM.left[i]}if(ONLM.leftDone)delete ONLM.leftDone[i];
  log(`⚔ <b>${esc(p.name)}</b>’s lanista takes the seat back from the CPU.`,'big');
  if(ONL.acct&&acct===ONL.acct.id){const id=S.onl.lobby;ONLM.me=i;S.onl.watch=false;S.onl.seat=i;const L=(ONL.lobbies||[]).find(x=>x.id===id)||{};
    ONL.live={id,ranked:!!S.onl.ranked,seat:i,char:((L.players||[])[i]||{}).char||null,seed:L.seed};ONL.entered=ONL.entered||{};ONL.entered[id]=1;ONL.watching=null;
    if(ONL.leftMatch)delete ONL.leftMatch[id];ONL84.rcl=null;ONL84.want=null;try{if(typeof onlLive80Enter==='function'&&L.players)onlLive80Enter(L)}catch(e){}onl84Bar();
    if(typeof mToast==='function')mToast('⚔ Your seat is yours again — fight on!')}
  onlmWaitShow()}
/* every client stops at the start of a reclaimable seat's next CPU turn until the server decides */
function onl84Halt(p){const i=S.players.indexOf(p);return new Promise(res=>{ONL84.halt={seat:i,res,at:Date.now()};
  const ask=()=>{const H=ONL84.halt;if(!H||H.seat!==i||!onlmOn())return;if(ONLM.me>=0&&ONLM.me<onlmFighters()&&!S.onl.watch)NET.req('match.cpuheld',{id:S.onl.lobby,seat:i}).catch(()=>{});H.t=setTimeout(ask,8000)};
  log(`⏳ <b>${esc(p.name)}</b>’s turn comes round — will the lanista take the seat back?`,'thought');ask();setTimeout(onlmPump,30)})}
{const base=beginTurn;beginTurn=async function(){try{if(S&&S.onl&&ONLM.on&&!S.over){const p=cur();
      if(p&&p.alive&&!p.exited&&p.cpu&&p._cpu84){const G=S;if(!p._cpu84.res){await onl84Halt(p);if(G!==S||!S||S.over)return}
        if(p._cpu84&&p._cpu84.res==='human')onl84Swap(p)}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* what the server says about my own seat */
function onl84Learn(t,r,d){if(!r||typeof r!=='object')return;
  if(t==='hello'){if(r.season84)ONL84.season=r.season84;ONL84.week=r.week84||null;const X=r.reclaim84||(r.live&&r.live.reclaim?{id:r.live.id,...r.live.reclaim}:null);if(X)ONL84.rcl={id:X.id,seat:X.seat,until:X.until};else if(ONL84.rcl&&!(S&&S.onl&&S.onl.lobby===ONL84.rcl.id))ONL84.rcl=null;onl84Bar()}
  if(t==='world.news'&&r.season84)ONL84.season=r.season84;
  if(t==='match.watch'&&r.reclaim&&d&&d.id){ONL84.rcl={id:d.id,seat:r.reclaim.seat,until:r.reclaim.until};onl84Bar()}}
{const base=NET.req;NET.req=function(t,d){const p=base.apply(this,arguments);if(p&&typeof p.then==='function'&&(t==='hello'||t==='world.news'||t==='match.watch'))p.then(r=>{try{onl84Learn(t,r,d)}catch(e){}}).catch(()=>{});return p}}
/* the 🔌 bar: "A CPU holds your seat — ⚔ Take it back · m:ss" */
function onl84Bar(){let el=document.getElementById('rcl84');const X=ONL84.rcl;const back=X&&S&&S.onl&&S.onl.lobby===X.id&&ONLM.me===X.seat;const left=X?X.until-(Date.now()+((typeof ONL80F!=='undefined'&&ONL80F.skew)||0)):0;
  if(!X||back||left<=0||!NET.mode){if(el)el.remove();if(X&&left<=0)ONL84.rcl=null;return}
  if(!el){el=document.createElement('div');el.id='rcl84';el.setAttribute('role','status');document.body.appendChild(el)}
  const s=Math.ceil(left/1000);const txt=`<span>🔌 A CPU holds your seat${ONL84.want?' — asking Flavius…':''}</span><button type="button" class="btn primary tksm" data-rcl84="go" ${ONL84.want?'disabled':''}>⚔ Take it back · ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}</button><button type="button" class="btn tksm" data-rcl84="x" title="Hide">✕</button>`;
  if(el.dataset.k!==txt){el.innerHTML=txt;el.dataset.k=txt}}
setInterval(()=>{try{onl84Bar();const W=ONL84.want;if(W&&!W.sent&&S&&S.onl&&S.onl.lobby===W.id&&ONLM.on&&!ONL.watching){W.sent=1;onl84Ask(W.id)}}catch(e){}},500);
async function onl84Ask(id){try{await NET.req('match.reclaim',{id});if(typeof mToast==='function')mToast('🔌 Flavius hears you — your seat is yours at its next turn.')}
  catch(e){ONL84.want=null;if(e&&e.code==='reclaim_late')ONL84.rcl=null;if(typeof mToast==='function')mToast('⚠ '+esc(e.message||'Too late.'));onl84Bar()}}
async function onl84ReclaimGo(){const X=ONL84.rcl;if(!X||ONL84.want)return;ONL84.want={id:X.id,sent:0};onl84Bar();
  if(S&&S.onl&&S.onl.lobby===X.id&&ONLM.on&&!S.over){ONL84.want.sent=1;return onl84Ask(X.id)}
  /* not on that sand yet: watch it first (a CPU holds the seat), then ask */
  try{let L=(ONL.lobbies||[]).find(x=>x.id===X.id);if(!L){const ls=await NET.req('lobby.list',{});L=(ls||[]).find(x=>x.id===X.id)}
    if(!L||L.status!=='live'){ONL84.want=null;ONL84.rcl=null;onl84Bar();if(typeof mToast==='function')mToast('⌛ That match is over.');return}
    if(ONL.leftMatch)delete ONL.leftMatch[X.id];await onlAttach(L,'seat')}catch(e){ONL84.want=null;onl84Bar();if(typeof mToast==='function')mToast('⚠ '+esc(e.message||String(e)))}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rcl84]');if(!b)return;e.preventDefault();e.stopPropagation();if(b.dataset.rcl84==='x'){const el=document.getElementById('rcl84');if(el)el.remove();ONL84.rcl=null;return}onl84ReclaimGo()},true);

/* =========================== "YOUR TURN" NOTICES (in the browser only) =========================== */
const onl84AlertsOn=()=>{try{return localStorage.getItem('flavius_onlturn84')!=='off'}catch(e){return true}};
function onl84Mine(){try{return onlmOn()&&!S.onl.watch&&ONLM.me>=0&&onlmMine()&&(!!CUR_MODAL||(!S.busy&&['choice','action','command'].includes(S.phase)))}catch(e){return false}}
function onl84Away(){return document.hidden||(typeof document.hasFocus==='function'&&!document.hasFocus())}
function onl84Alert(){if(!onl84AlertsOn())return;const ev=(S&&S.onl&&typeof EV==='function'&&EV()&&EV().n)||'the arena';const me=S&&S.players&&S.players[ONLM.me];
  if(!ONL84.flash){ONL84.title0=document.title;let k=0;ONL84.flash=setInterval(()=>{k++;document.title=k%2?`⚔ Your turn — ${ev}`:ONL84.title0},900);document.title=`⚔ Your turn — ${ev}`}
  try{if(typeof sfx==='function')sfx('horn')}catch(e){}
  try{if('Notification' in window&&Notification.permission==='granted'){const n=new Notification('⚔ Your turn',{body:`${ev}${me?' — '+me.name+' waits for your word':''}`,tag:'flavius-turn'});n.onclick=()=>{try{window.focus();n.close()}catch(e){}}}}catch(e){}
  ONL84.alerts=(ONL84.alerts|0)+1}
function onl84FlashOff(){if(ONL84.flash){clearInterval(ONL84.flash);ONL84.flash=0;document.title=ONL84.title0||document.title.replace(/^⚔ Your turn — .*/,'Flavius Rule Arena')}}
ONL84.turnTick=function(){const mine=onl84Mine();if(mine&&!ONL84.mineWas&&onl84Away())onl84Alert();if(!mine||!onl84Away())onl84FlashOff();ONL84.mineWas=mine};
setInterval(()=>{try{ONL84.turnTick()}catch(e){}},700);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)onl84FlashOff()});window.addEventListener('focus',onl84FlashOff);
function onl84AlertsPop(){const on=onl84AlertsOn();const N='Notification' in window;const perm=N?Notification.permission:'unsupported';
  const bg=onl83Pop('al84pop',`<h3 class="pop83h">⚔🔔 Turn alerts</h3><p class="rc-sub">When it is your decision in an online match and this tab is hidden or in the background.</p>
    <label class="chk"><input type="checkbox" data-al84="on" ${on?'checked':''}> Flash the tab title + a horn <small class="rc-sub">(the game’s mute applies)</small></label>
    <p>Desktop notice: <b>${perm==='granted'?'allowed':perm==='denied'?'blocked by the browser':perm==='unsupported'?'not in this browser':'not asked yet'}</b></p>
    <div class="acts">${N&&perm==='default'?'<button type="button" class="btn primary" data-al84="ask">Allow desktop notices</button>':''}<button type="button" class="btn" data-al84="x">Close</button></div>`);
  bg.addEventListener('click',async e=>{const b=e.target.closest('[data-al84]');if(!b)return;const a=b.dataset.al84;
    if(a==='on'){try{localStorage.setItem('flavius_onlturn84',b.checked?'on':'off')}catch(err){}return}
    if(a==='ask'){try{await Notification.requestPermission()}catch(err){}bg.remove();onl84AlertsPop();return}if(a==='x')bg.remove()})}

/* =========================== THE MOCK (as server/src/routes.js v0.84) =========================== */
/* named armor from a gift: the mock's gift.open rolls a named weapon; with kind 'a' the roll is armor */
{const base=MOCK_ROUTES['gift.open'];MOCK_ROUTES['gift.open']=(w,d,me)=>{const rg=ONLC.rollGift,rn=ONLC.rollNamed;let kind='w';
  ONLC.rollGift=function(){const r=rg.apply(this,arguments);if(r&&r.k==='named')kind=r.kind||'w';return r};
  ONLC.rollNamed=function(rnd,cat,rar,taken){return kind==='a'?ONLC.rollNamedArmor(rnd,cat,rar,taken):rn.apply(this,arguments)};
  try{return base(w,d,me)}finally{ONLC.rollGift=rg;ONLC.rollNamed=rn}}}
/* reclaim: the server's lock between 'reclaim' and 'cpugo' */
const mockRclWin84=(w,L,M,acct)=>{const seat=L.players.findIndex(p=>p.id===acct);if(seat<0||!M||M.status==='done'||L.status!=='live')return null;const dr=(M.dropped||{})[acct],ab=(M.abandoned||{})[acct];
  if(!dr&&ab!=='cpu')return null;if(ab&&L.ranked)return null;const at=(M.dropAt84||{})[acct];if(!at)return null;return {seat,at,until:at+ONLC.RECLAIM_MS,lock:seat+'#'+at}};
const mockRclOpen84=(M,W)=>!!W&&W.until>Date.now()&&!(M.rclx84||{})[W.lock];
function mockRclMark84(w,L,M,acct,seat,until){M.dropAt84={...(M.dropAt84||{}),[acct]:until-ONLC.RECLAIM_MS};const A=w.accounts[acct];if(A)A.rcl84={id:L.id,seat,until}}
{const base=MOCK_ROUTES['match.drop'];MOCK_ROUTES['match.drop']=(w,d,me)=>{const r=base(w,d,me);try{const L=w.lobbies[d.id],M=w.matches[d.id];const inp=M.inputs[M.inputs.length-1];
  if(inp&&inp.k==='drop'&&inp.until){const p=L.players[inp.seat];if(p)mockRclMark84(w,L,M,p.id,inp.seat,inp.until)}}catch(e){}return r}}
{const base=MOCK_ROUTES['match.abandon'];MOCK_ROUTES['match.abandon']=(w,d,me)=>{const r=base(w,d,me);try{const L=w.lobbies[d.id],M=w.matches[d.id];const inp=(M.inputs||[]).filter(x=>x.k==='abandon'&&x.seat===L.players.findIndex(p=>p.id===me)).pop();
  if(inp&&inp.until)mockRclMark84(w,L,M,me,inp.seat,inp.until)}catch(e){}return r}}
{const base=MOCK_ROUTES['match.watch'];MOCK_ROUTES['match.watch']=(w,d,me)=>{const r=base(w,d,me);const L=w.lobbies[d.id],M=w.matches[d.id];
  r.abandoned=Object.keys(M.abandoned||{}).filter(a=>M.abandoned[a]);r.dropped=Object.keys(M.dropped||{}).filter(a=>M.dropped[a]);const W=mockRclWin84(w,L,M,me);if(mockRclOpen84(M,W))r.reclaim={seat:W.seat,until:W.until};return r}}
{const base=MOCK_ROUTES['match.input'];MOCK_ROUTES['match.input']=(w,d,me)=>{if(d&&d.in&&['reclaim','cpugo','void','drop','abandon'].includes(d.in.k))throw new Error('That seat is not yours.');return base(w,d,me)}}
Object.assign(MOCK_ROUTES,{
  'match.reclaim':(w,d,me)=>{const L=w.lobbies[d.id],M=w.matches[d.id];if(!L||!M)throw onlErr82('That match is over.','reclaim_no');const W=mockRclWin84(w,L,M,me);if(!W)throw onlErr82('There is no seat of yours to take back.','reclaim_no');
    if(Date.now()>W.until)throw onlErr82('Too late — the CPU has fought on in your seat. You may watch.','reclaim_late',{until:W.until});const ch=w.chars[L.players[W.seat].char];if(!ch||!ch.alive)throw onlErr82('Your gladiator is gone.','reclaim_no');
    M.rclx84=M.rclx84||{};if(M.rclx84[W.lock])throw onlErr82('Too late — the CPU has begun your next turn. You may watch.','reclaim_late',{until:W.until});M.rclx84[W.lock]='reclaim';
    if(M.dropped)delete M.dropped[me];if(M.abandoned)delete M.abandoned[me];if(M.dropAt84)delete M.dropAt84[me];const A=w.accounts[me];if(A)A.rcl84=null;
    const inp={k:'reclaim',seat:W.seat,acct:me,from:'server',seq:M.inputs.length};M.inputs.push(inp);mockPush('match.input',{id:d.id,in:inp});return {seq:inp.seq,seat:W.seat}},
  'match.cpuheld':(w,d,me)=>{const L=w.lobbies[d.id],M=w.matches[d.id];if(!L||!M)throw new Error('No such match.');const seat=d.seat|0;const p=L.players[seat];if(!p||p.id===me)throw new Error('No one to name.');
    const W=mockRclWin84(w,L,M,p.id);if(!W)return {held:false};M.rclx84=M.rclx84||{};if(M.rclx84[W.lock])return {held:false};M.rclx84[W.lock]='cpugo';const A=w.accounts[p.id];if(A)A.rcl84=null;
    const inp={k:'cpugo',seat,from:'server',seq:M.inputs.length};M.inputs.push(inp);mockPush('match.input',{id:d.id,in:inp});return {held:true,seq:inp.seq}}});

/* the weekly challenge at settlement (never for an abandon), the Today house names */
{const base=mockAfter83;mockAfter83=function(w,L,M,a,i,row,out,gx){const r=base.apply(this,arguments);
  try{const ch=w.chars[L.players[i].char];const D=ch&&mockDomus82(w,ch.domus);if(D&&!(out&&out.abandoned))ONLC.weekNote(D,{id:L.id,ev:L.ev,loc:L.loc,at:mockT84(),ranked:!!L.ranked},ch,row,out)}catch(e){console.error(e)}return r}}
function mockDn84(w){const D=w.days80||{};for(const X of Object.values(D))for(const k of ['wins','fallen'])for(const e of (X&&X[k])||[])if(e&&e.dom&&!e.dn){const H=mockDomus82(w,e.dom);if(H)e.dn=H.name}}
for(const t of ['match.result','match.abandon']){const base=MOCK_ROUTES[t];MOCK_ROUTES[t]=(w,d,me)=>{const r=base(w,d,me);try{mockDn84(w)}catch(e){}return r}}

/* 🔨 the auction (w.auc84[key] = {lots:[…]}; w.aucwin84[key][dom] = lot id) */
const mockAucOut84=(X,me)=>{const I=ONLC.pieceInfo({item:X.item,pc:X.pc},onlCatalog())||{};return {id:X.id,item:X.item,kind:I.kind||'w',n:I.n||'',rar:I.rar||null,lv:I.lv||4,ap:I.ap,val:X.val|0,min:X.min|0,next:ONLC.aucNextMin(X),opens:X.opens,ends:X.ends,
  bid:X.bid?{name:X.bid.name,dname:X.bid.dname||null,amt:X.bid.amt|0,at:X.bid.at,...(me&&X.bid.acct===me?{mine:true}:{})}:null,bids:(X.bids||[]).map(b=>({name:b.name,dname:b.dname||null,amt:b.amt|0,at:b.at})),
  hist:(X.pc&&X.pc.hist)||[],w:(X.pc&&X.pc.w)||null,done:!!X.done,won:X.won?{name:X.won.name,dname:X.won.dname||null,amt:X.won.amt|0,to:X.won.to||null}:null,mine:!!(me&&X.bid&&X.bid.acct===me)}};
function mockAucDraw84(w,t){const S=ONLC.seasonAt(t);w.auc84=w.auc84||{};if(w.auc84[S.key])return;const A=w.auc84[S.key]={lots:[]};w.chest83=w.chest83||[];const ends=ONLC.aucEnds(t);
  while(A.lots.length<ONLC.AUC_LOTS&&w.chest83.length){const x=w.chest83.shift();const I=ONLC.pieceInfo({item:x.item,pc:x.pc},onlCatalog());if(!I||!I.named)continue;const n=A.lots.length+1;
    A.lots.push({id:S.key+'#'+n,key:S.key,n,item:x.item,pc:x.pc||null,val:ONLC.valueOf(I),min:ONLC.aucMin(ONLC.valueOf(I)),opens:t,ends,bid:null,bids:[],done:false,won:null,from:x.from||null})}}
function mockAucSettle84(w,X,t){if(X.done||t<=X.ends)return;X.done=true;const b=X.bid;let P={item:X.item,pc:X.pc||null};w.chest83=w.chest83||[];
  if(!b){w.chest83.push({item:P.item,pc:P.pc,at:t,from:X.from||null});return}P=ONLC.histAdd(P,{house:b.dname||null,glad:b.name,when:t,how:'auction'});let to='house';const c=w.chars[b.char];
  if(c&&c.alive&&ONLC.canWearNamed(c)){ONLC.putPiece(c,P,true);to='glad'}else{const D=mockDomus82(w,b.dom);if(D)ONLC.putPiece(D,P,false);else{w.chest83.push({item:P.item,pc:P.pc,at:t});to='chest'}}
  X.pc=P.pc;X.won={name:b.name,dname:b.dname||null,amt:b.amt|0,acct:b.acct,dom:b.dom,to};w.aucwin84=w.aucwin84||{};(w.aucwin84[X.key]=w.aucwin84[X.key]||{})[b.dom]=X.id;
  const I=ONLC.pieceInfo(P,onlCatalog())||{};mockTo([b.acct],'auction.won',{lot:X.id,n:I.n,amt:b.amt|0,to,char:to==='glad'?c:null});w.news.unshift(['🔨',`${b.name} won ${I.n||'a named piece'} at Flavius’s auction.`])}
function mockAucSweep84(w){const t=mockT84();mockAucDraw84(w,t);for(const A of Object.values(w.auc84||{}))for(const X of A.lots||[])mockAucSettle84(w,X,t)}
function mockAucWhy84(w,A,D,ch,key){if(!D)return 'Name your house first.';if(D.test||(A&&A.dtest))return 'Test houses may not bid.';if(!ch||ONLC.rankIdx(ONLC.rankFor(ch).k)<ONLC.rankIdx('veteranus'))return 'Flavius sells to Veteranus and above.';
  if(((w.aucwin84||{})[key]||{})[D.id])return 'Your house already won a lot this week.';return ''}
Object.assign(MOCK_ROUTES,{
  'auction.list':(w,d,me)=>{mockAucSweep84(w);const t=mockT84();const S=ONLC.seasonAt(t);const prevK=S.n>0?ONLC.seasonKeyOf(S.n-1):null;const cur=((w.auc84||{})[S.key]||{}).lots||[];const past=prevK?(((w.auc84||{})[prevK]||{}).lots||[]):[];
    const lots=cur.concat(past.filter(x=>!x.done)).map(x=>mockAucOut84(x,me));const mine={lead:null,won:null,why:''};
    if(me&&!mockIsGuest82(me)){const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);const ch=onlMockChar(w,me);mine.why=mockAucWhy84(w,A,D,ch,S.key);mine.lead=(lots.find(l=>l.mine&&!l.done)||{}).id||null;mine.won=D?(((w.aucwin84||{})[S.key]||{})[D.id]||null):null}else mine.why='Sign in to bid.';
    return {week:{key:S.key,season:S.season,wk:S.wk,ends:S.end},lots,past:past.filter(x=>x.done).map(x=>mockAucOut84(x,me)),mine,now:t}},
  'auction.bid':(w,d,me)=>{mockAucSweep84(w);const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);if(!D)throw onlErr82('Name your house first.','need_domus');if(D.test||A.dtest)throw onlErr82('Test houses may not bid at Flavius’s auction.','testHouse');
    const m=/^(S\d+W\d+)#(\d+)$/.exec(String(d.lot||''));if(!m)throw onlErr82('No such lot.','auc_closed');const key=m[1];const X=(((w.auc84||{})[key]||{}).lots||[]).find(x=>x.id===d.lot);const t=mockT84();const amt=d.amt|0;
    if(!X||X.done||t>X.ends)throw onlErr82('The hammer has fallen on that lot.','auc_closed');const ch=onlMockChar(w,me);if(!ch||ONLC.rankIdx(ONLC.rankFor(ch).k)<ONLC.rankIdx('veteranus'))throw onlErr82('Flavius sells to Veteranus and above.','auc_rank');
    if(((w.aucwin84||{})[key]||{})[D.id])throw onlErr82('Your house already won a lot this week.','auc_won');
    const lead=w.auc84[key].lots.find(L=>!L.done&&L.bid&&L.bid.dom===D.id&&L.id!==X.id);if(lead)throw onlErr82('Your house already leads another lot — one win a house a week.','auc_lead',{lot:lead.id});
    if(X.bid&&X.bid.dom===D.id)throw onlErr82('Your house leads this lot already.','auc_lead',{lot:X.id});const why=ONLC.aucBidWhy(X,amt,t);if(why)throw onlErr82(why,'auc_low',{min:ONLC.aucNextMin(X)});
    if((ch.wallet|0)<amt)throw onlErr82(`${ch.name}’s purse holds less than ${amt} coin.`,'no_coin',{cost:amt});ch.wallet-=amt;const prev=X.bid;
    X.bid={acct:me,char:ch.id,dom:D.id,dname:D.name,name:ch.name,amt,at:t};X.bids=[...(X.bids||[]),{name:ch.name,dname:D.name,amt,at:t,dom:D.id}].slice(-12);ONLC.aucSnipe(X,t);
    if(prev){const c=w.chars[prev.char];let to='house';if(c&&c.alive){c.wallet=(c.wallet|0)+(prev.amt|0);to='glad'}else{const PD=mockDomus82(w,prev.dom);if(PD)PD.treasury=(PD.treasury|0)+(prev.amt|0)}mockTo([prev.acct],'auction.outbid',{lot:X.id,amt:prev.amt|0,to,char:to==='glad'?c:null})}
    return {lot:mockAucOut84(X,me),char:ch}}});
/* hello: this week's fixture + the house's challenge + an open reclaim window; the sweeps */
{const base=MOCK_ROUTES['hello'];MOCK_ROUTES['hello']=(w,d,me)=>{try{mockAucSweep84(w)}catch(e){}const o=base(w,d,me);const t=mockT84();o.season84=ONLC.onlineFixture(t);
  if(me&&!mockIsGuest82(me)&&o.me){const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);if(D)o.week84=ONLC.weekState(D,t);
    const X=A&&A.rcl84;if(X&&X.until>Date.now()){const L=w.lobbies[X.id],M=w.matches[X.id];const W=L&&M&&mockRclWin84(w,L,M,me);if(mockRclOpen84(M,W)){o.reclaim84={id:X.id,seat:W.seat,until:W.until,ev:L.ev,loc:L.loc,ranked:!!L.ranked};if(o.live&&o.live.id===X.id)o.live.reclaim={seat:W.seat,until:W.until}}}}
  return o}}
{const base=MOCK_ROUTES['market.list'];MOCK_ROUTES['market.list']=(w,d,me)=>{try{mockAucSweep84(w)}catch(e){}return base(w,d,me)}}
{const base=MOCK_ROUTES['world.news'];MOCK_ROUTES['world.news']=(w,d,me)=>({...base(w,d,me),season84:ONLC.onlineFixture(mockT84())})}
{const base=mockReq;mockReq=async function(t,d){const me=mockMe();if(me&&mockIsGuest82(me)&&t==='auction.bid')throw onlErr82('Sign in to bid.','guest');return base.apply(this,arguments)}}

/* =========================== THE SCREENS =========================== */
/* ---------------- named cards: armor too; the holographic sheen ---------------- */
const SLOT84={head:'Head',chest:'Chest',belt:'Belt',arm:'Arm',leg:'Leg'};
const LOCN84={head:'head',chest:'chest',larm:'left arm',rarm:'right arm',lleg:'left leg',rleg:'right leg'};
function na84Card(I,o){o=o||{};const a=I.w||{};const R=ONLC.rarOf(I.rar||a.rar);const col=ONL83.rarCol[R.k];const U=a.uq?ONLC.UNIQUES_A.find(u=>u.k===a.uq):null;const base=a.base||'';const B=(typeof ARM!=='undefined'&&ARM[base])||{};
  const art=typeof cardHTML==='function'&&B.n?cardHTML('a:'+base,'sm'):'🛡';const brk=I.st==='broken';const holo=R.k!=='common';
  const aff=(a.aff||[]).map(k=>k==='bonus'&&a.bonus?`+1 AP to the ${Object.keys(a.bonus).map(l=>LOCN84[l]||l).join(', ')}`:(ONLC.AFFIX_A[k]||{}).n||k);
  return `<div class="nw83 na84 ${holo?'holo84':''} r-${R.k} ${brk?'brk83':''} ${o.sm?'sm':''}" style="--rc:${col}" title="${esc2(a.n||I.n)} · ${R.n}">
    <div class="nw83-art">${art}<i class="nw83-tint"></i><span class="nw83-gem">${R.n}</span></div>
    <div class="nw83-b"><b class="nw83-n">${esc2(a.n||I.n)}</b><small class="nw83-base">${esc2(B.n||base)} · ${SLOT84[a.slot]||'Armor'}${a.pair?' (pair)':''} · <b>${a.ap|0} AP</b></small>
     ${aff.length?`<div class="nw83-aff">${aff.map(x=>`<span>✦ ${esc2(x)}</span>`).join('')}</div>`:''}
     ${U?`<p class="nw83-uq"><b>${esc2(U.n)}</b> — ${esc2(U.d)}</p>`:''}
     <small class="nw83-val">${brk?'💔 Broken · ':''}Value ${c83()} <b>${ONLC.valueOf(I)}</b></small>${o.hist?onl83Hist(I.hist):''}</div></div>`}
{const base=nw83Card;nw83Card=function(I,o){if(I&&(I.kind==='a'||(I.w&&I.w.kind==='a')||ONLC.isNamedA(I.item)))return na84Card({...I,kind:'a'},o);
  const h=base.apply(this,arguments);const R=ONLC.rarOf((I&&(I.rar||(I.w&&I.w.rar)))||'common');return R.k==='common'?h:h.replace('<div class="nw83 ','<div class="nw83 holo84 ')}}
/* the owner history knows the auction */
{const base=onl83Hist;onl83Hist=function(h){if(!(h||[]).some(x=>x&&x.how==='auction'))return base.apply(this,arguments);
  return `<div class="hist83">${h.slice(-4).map(x=>`<small>${x.how==='auction'?'🔨 won at Flavius’s auction by':x.how==='taken'?'⚔ taken from':'🪦 fell with'} <b>${esc2(x.glad||'?')}</b>${x.house?` · ${esc2(onlHouse82(x.house))}`:''} · ${esc2(date83(x.when))}</small>`).join('')}</div>`}}

/* ---------------- the landing: this week's challenge + the weekly playlist card; turn alerts beside Quiet ---------------- */
const onl84Fx=()=>ONL84.season||ONLC.onlineFixture(Date.now());
function onl84Left(end){const ms=Math.max(0,end-Date.now());const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4);return d?`${d}d ${h}h`:h?`${h}h ${m}m`:`${m}m`}
function onl84WeekCard(){const F=onl84Fx();const X=ONL84.week||{};const ev=esc2(onlEvName(F.ev)),city=esc2(onlCityName(F.loc));const raw=F.evRaw&&F.evRaw!==F.ev?((typeof EVENTS!=='undefined'&&EVENTS[F.evRaw]&&EVENTS[F.evRaw].n)||F.evRaw):null;
  const rows=[['win',`Win ${ev} at ${city}`,X.win?1:0,1],['surv',`Survive ${ev} at ${city} in a Ranked bout`,X.surv?1:0,1],['bouts','Finish 3 bouts',Math.min(3,X.bouts|0),3]];
  const all=rows.every(r=>r[2]>=r[3]);
  return `<div class="card2 wk84" id="wk84"><div class="wk84-h"><b>⭐ This week: ${ev} at ${city}</b><small class="rc-sub">Season ${F.season} · week ${F.wk} of 12 · ends in ${onl84Left(F.end)}${raw?` · the schedule names ${esc2(raw)}`:''}</small></div>
    ${rows.map(([k,t,v,n])=>`<div class="wk84-c ${v>=n?'ok':''}" data-wk84="${k}"><span>${v>=n?'☑':'◻'}</span><span>${t}</span>${n>1?`<small>${v}/${n}</small>`:''}</div>`).join('')}
    <div class="wk84-g ${X.gift?'got':all?'':'wait'}">${X.gift?'🎁 Flavius’s gift for the week is in your house.':all?'🎁 All done — a gift comes with your next win.':'🎁 All three (with a win) earn ONE Flavius gift a week.'}</div></div>`}
function onl84PlCard(){const F=onl84Fx();const ok=!!ONL.char&&!onlIsGuest82();
  return `<div class="onl-pl pl81 pl84" data-pl81="week84"><div class="onl-plart">${typeof cardHTML==='function'?cardHTML('e:'+F.ev,'sm'):''}<span class="pl84-star">⭐</span></div><div class="onl-plb"><b>This week: ${esc2(onlEvName(F.ev))}</b><span class="badge gold">at ${esc2(onlCityName(F.loc))}</span><small>The weekly challenge · season ${F.season}, week ${F.wk}</small>
    <div class="acts">${ok?`<button type="button" class="btn primary tksm" data-onl84="wk" data-v="1">⚔ Ranked</button><button type="button" class="btn tksm" data-onl84="wk" data-v="0">Custom</button>`:'<small class="rc-sub">Raise a gladiator to play</small>'}</div></div></div>`}
{const base=onlPlayHTML;onlPlayHTML=function(){let h=base.apply(this,arguments);try{
    const wk=onl84WeekCard();const re=/<div class="card2 wk83"><b>⚡ This week<\/b>(?:<div class="onl-ch">[\s\S]*?<\/div>)*<\/div>/;
    if(re.test(h))h=h.replace(re,wk);else h=h.replace(/<div class="a81-week card2">[\s\S]*?<\/div>(\s*<div class="a81-forum">)/,`<div class="a81-week">${wk}</div>$1`);
    h=h.replace('<div class="onl-pls onl-pls81">','<div class="onl-pls onl-pls81">'+onl84PlCard());
    h=h.replace(/(<button type="button" class="btn tksm[^"]*" data-onl="quiet"[^>]*>[^<]*<\/button>)/,`$1<button type="button" class="btn tksm" data-onl84="alerts" title="Your-turn alerts">⚔🔔</button>`);
    h=onl84TodayChips(h)}catch(e){console.error(e)}return h}}
/* the weekly playlist: a waiting room of this week's event at this week's city with a free seat, else a new one there */
async function onl84WeekGo(ranked){const F=onl84Fx();const R=ONL.char?ONLC.rankFor(ONL.char).k:'tiro';
  const L=(ONL.lobbies||[]).find(x=>x.status==='waiting'&&x.ev===F.ev&&(x.loc|0)===F.loc&&!!x.ranked===ranked&&!x.inf&&(x.players||[]).length<(x.seats|0)&&(!ranked||x.rank===R));
  if(L){await onlReq80('lobby.join',{id:L.id});onlToast80(`⭐ You joined this week’s ${esc2(onlEvName(F.ev))} at ${esc2(onlCityName(F.loc))}.`)}
  else{await onlReq80('lobby.create',{ev:F.ev,loc:F.loc,ranked});onlToast80(`⭐ A room for this week’s challenge: ${esc2(onlEvName(F.ev))} at ${esc2(onlCityName(F.loc))}.`)}
  if(ONL.tab!=='lobby')ONL.tab='play';onlRedraw()}
/* Today: the house chip beside each name (opens the profile) */
function onl84TodayChips(h){const T=typeof ONL80F!=='undefined'?ONL80F.today:null;if(!T)return h;for(const e of [...(T.wins||[]),...(T.fallen||[])]){if(!e||!e.dom||!e.dn)continue;const a=`<b>${esc2(e.name)}</b>`;
    const chip=`<button type="button" class="dom84c" data-onl83="prof" data-v="${esc2(e.dom)}" title="Open the house">🏛 ${esc2(onlHouse82(e.dn))}</button>`;const i=h.indexOf(a);if(i>=0&&h.slice(i+a.length,i+a.length+80).indexOf('dom84c')<0)h=h.slice(0,i+a.length)+chip+h.slice(i+a.length)}return h}
{const base=onlTodayHTML80;onlTodayHTML80=function(){const h=base.apply(this,arguments);try{return onl84TodayChips(h)}catch(e){return h}}}

/* ---------------- 🔨 the AUCTION tab ---------------- */
function onl84Auction(){if(!ONL84.auc||Date.now()-ONL84.aucAt>10000){ONL84.aucAt=Date.now();NET.req('auction.list',{}).then(r=>{ONL84.auc=r;ONL84.aucSkew=(r.now||Date.now())-Date.now();if(ONL.tab==='auction'&&document.getElementById('onl')&&!onlFocus80())onlRedraw()}).catch(e=>{ONL84.auc=ONL84.auc||{lots:[],past:[],mine:{},err:e.message}})}
  const X=ONL84.auc;if(!X)return '<h3>🔨 Flavius’s Auction</h3><p class="rc-sub">The auctioneer unrolls his lists…</p>';const M=X.mine||{};const now=Date.now()+(ONL84.aucSkew||0);
  const lot=(L,past)=>{const I={item:L.item,named:true,kind:L.kind,rar:L.rar,w:L.w||{n:L.n,rar:L.rar},val:L.val,st:'whole',hist:L.hist||[]};const left=L.ends-now;
    const lead=L.bid?`<div class="au84-lead ${L.bid.mine?'me':''}">🏛 <b>${esc2(L.bid.name)}</b>${L.bid.dname?` · ${esc2(onlHouse82(L.bid.dname))}`:''} leads with ${c83()} <b>${L.bid.amt}</b></div>`:`<div class="au84-lead none">No bid yet · opens at ${c83()} <b>${L.min}</b></div>`;
    const can=!past&&!L.done&&!M.why&&!L.mine&&(!M.lead||M.lead===L.id)&&!M.won;
    return `<div class="card2 au84-lot ${L.mine?'mine':''} ${past?'past':''}" data-au84="${esc2(L.id)}">${nw83Card(I,{sm:1,hist:1})}
      ${past?`<div class="au84-lead">${L.won?`🔨 Sold to <b>${esc2(L.won.name)}</b>${L.won.dname?` · ${esc2(onlHouse82(L.won.dname))}`:''} for ${c83()} <b>${L.won.amt}</b>`:'Unsold — back to Flavius’s chest'}</div>`
      :`${lead}<div class="au84-cd" data-ends="${L.ends}">⏳ <span>${onl84Left(L.ends-(ONL84.aucSkew||0))}</span>${left<ONLC.AUC_SNIPE_MS?' <b class="au84-snipe">a late bid adds 5 minutes</b>':''}</div>
       <div class="au84-bid">${can?`<input class="tin" type="number" min="${L.next}" step="1" value="${L.next}" data-au84amt="${esc2(L.id)}" aria-label="Your bid"><button type="button" class="btn primary tksm" data-onl84="bid" data-v="${esc2(L.id)}">🔨 Bid</button><small class="rc-sub">at least ${L.next}</small>`
        :L.mine?'<small class="au84-me">★ Your house leads — the coin waits in escrow.</small>':`<small class="rc-sub">${esc2(M.why||(M.won?'Your house won a lot this week.':M.lead?'Your house leads another lot — one win a week.':''))}</small>`}</div>`}
      ${(L.bids||[]).length?`<details class="au84-bids"><summary>${L.bids.length} bid${L.bids.length===1?'':'s'}</summary>${L.bids.slice().reverse().map(b=>`<small>${c83()} ${b.amt} · ${esc2(b.name)}${b.dname?` (${esc2(onlHouse82(b.dname))})`:''}</small>`).join('')}</details>`:''}</div>`};
  const wk=X.week||{};
  return `<div class="onl-lbtop"><h3>🔨 Flavius’s Auction <span class="rc-sub">season ${wk.season||'—'}, week ${wk.wk||'—'}</span></h3><div class="acts"><button type="button" class="btn tksm" data-onl84="aur">↻</button></div></div>
   <p class="rc-sub au84-intro">Only Flavius sells: named pieces of the fallen, back from his chest, with every owner they had. Veteranus and above bid; your coin waits in escrow and comes back the moment you are outbid. One win a house a week; the winning coin goes to Flavius.</p>
   ${M.won?'<div class="card2 au84-won">🔨 Your house won a lot this week — it is in the Storeroom.</div>':''}
   <div class="au84-grid">${(X.lots||[]).map(L=>lot(L,false)).join('')||'<p class="rc-sub">No lots this week — Flavius’s chest holds no fallen named pieces yet.</p>'}</div>
   ${(X.past||[]).length?`<h4 class="onl-h">Last week</h4><div class="au84-grid past">${X.past.map(L=>lot(L,true)).join('')}</div>`:''}`}
setInterval(()=>{try{for(const el of document.querySelectorAll('.au84-cd[data-ends]')){const s=el.querySelector('span');const t=onl84Left(+el.dataset.ends-(ONL84.aucSkew||0));if(s&&s.textContent!==t)s.textContent=t}}catch(e){}},1000);
{const base=onlHTML;onlHTML=function(){const want=ONL.tab==='auction';if(want)ONL.tab='hall';let h;try{h=base.apply(this,arguments)}finally{if(want)ONL.tab='auction'}
  try{if(ONL.acct&&h.includes('class="onl-rail"')&&!ONL.newGlad){const btn=`<button type="button" data-onl="tab" data-v="auction" class="${want?'on':''}">🔨 Auction</button>`;
      if(/<button type="button" data-[a-z0-9]+="tab" data-v="wagers"/.test(h))h=h.replace(/(<button type="button" data-[a-z0-9]+="tab" data-v="wagers")/,btn+'$1');else h=h.replace(/(<button type="button" data-[a-z0-9]+="tab" data-v="hall")/,btn+'$1');
      if(want){h=h.replace(/(<button type="button" data-[a-z0-9]+="tab" data-v="hall" class=")on(")/,'$1$2');const a=h.indexOf('<main class="onl-main">'),b=h.lastIndexOf('</main>');if(a>=0&&b>a)h=h.slice(0,a+23)+onl84Auction()+h.slice(b)}}}catch(e){console.error(e)}return h}}
NET.on('auction.outbid',d=>{ONL84.aucAt=0;if(d&&d.char)onl83Put(d.char);onlToast80(`🔨 Outbid at Flavius’s auction — ${c83()} ${d&&d.amt|0} back ${d&&d.to==='house'?'in the treasury':'in the purse'}.`);if(ONL.tab==='auction'&&document.getElementById('onl'))onlRedraw()});
NET.on('auction.won',d=>{ONL84.aucAt=0;if(d&&d.char)onl83Put(d.char);onlToast80(`🔨 Sold to your house: <b>${esc2((d&&d.n)||'the lot')}</b> for ${c83()} ${d&&d.amt|0}.`);ONL82.dgAt=0});

/* ---------------- the controls ---------------- */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-onl84]');if(!b||!b.closest('#onl,.onl80pop'))return;e.preventDefault();e.stopPropagation();const a=b.dataset.onl84,v=b.dataset.v;
  if(a==='wk')return onlDo(()=>onl84WeekGo(v==='1'));
  if(a==='alerts')return onl84AlertsPop();
  if(a==='aur'){ONL84.aucAt=0;onlRedraw();return}
  if(a==='bid'){const inp=document.querySelector(`[data-au84amt="${CSS.escape(v)}"]`);const amt=Math.floor(+((inp&&inp.value)||0));
    return onlDo(async()=>{try{const r=await NET.req('auction.bid',{lot:v,amt});if(r.char)onl83Put(r.char);ONL84.aucAt=0;onlToast80(`🔨 Your bid of ${c83()} ${amt} leads — the coin waits in escrow.`)}
      catch(err){if(err&&err.code==='auc_low'){ONL84.aucAt=0;onlToast80('🔨 '+esc2(err.message));onlRedraw();return}throw err}})}},true);
/* the result toast: the CPU played most of it */
{const base=onlSettled;onlSettled=function(res){const r=base.apply(this,arguments);try{const o=res&&res.out;if(o&&o.cpu&&!res.void)setTimeout(()=>onlToast80('🤖 The CPU fought most of that bout in your seat — Flavius pays a quarter, and no gifts.'),6200);ONL82.dgAt=0}catch(e){}return r}}

{const st=document.createElement('style');st.textContent=`
.nw83.holo84{position:relative;isolation:isolate}
.nw83.holo84::before{content:"";position:absolute;inset:-2px;border-radius:12px;padding:2px;pointer-events:none;z-index:2;
  background:conic-gradient(from var(--h84,0deg),var(--rc),#fff7e0 8%,var(--rc) 16%,#7fe3ff 26%,var(--rc) 36%,#ff9ad5 48%,var(--rc) 60%,#fff2b0 72%,var(--rc) 86%,var(--rc));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);animation:holo84spin 5s linear infinite;opacity:.9}
.nw83.holo84::after{content:"";position:absolute;inset:0;border-radius:10px;pointer-events:none;z-index:1;mix-blend-mode:screen;
  background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.14) 42%,color-mix(in srgb,var(--rc) 35%,transparent) 48%,rgba(160,240,255,.12) 54%,transparent 66%) 0 0/250% 100%;animation:holo84sheen 3.6s ease-in-out infinite}
.nw83.holo84.r-rare::before{opacity:.45;animation-duration:9s;background:conic-gradient(from var(--h84,0deg),var(--rc),#dff1ff 20%,var(--rc) 40%,var(--rc))}
.nw83.holo84.r-rare::after{animation-duration:7s;opacity:.6}
.nw83.holo84.r-epic::before{animation-duration:5s}
.nw83.holo84.r-legendary::before{animation-duration:3.2s;opacity:1}
.nw83.holo84.r-legendary::after{animation-duration:2.6s}
@property --h84{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes holo84spin{to{--h84:360deg}}
@keyframes holo84sheen{0%{background-position:120% 0}60%,100%{background-position:-60% 0}}
body.calm .nw83.holo84::before,body.calm .nw83.holo84::after{animation:none}
@media (prefers-reduced-motion:reduce){.nw83.holo84::before,.nw83.holo84::after{animation:none}}
.wk84{display:grid;gap:5px;border-color:#c9a14a;background:linear-gradient(180deg,rgba(201,161,74,.14),rgba(255,255,255,.02))}
.wk84-h{display:grid;gap:1px}.wk84-h b{font:700 15px Georgia,serif;color:var(--gold,#e8c96a)}
.wk84-c{display:grid;grid-template-columns:20px 1fr auto;gap:4px;align-items:center;font-size:13px}.wk84-c.ok{color:#bfe3a3}.wk84-c small{color:var(--muted)}
.wk84-g{font-size:12px;color:#d9c08a;border-top:1px dashed rgba(201,161,74,.4);padding-top:4px}.wk84-g.got{color:#c9a6ff}
.onl-pl.pl84{border-color:#e0a530;background:linear-gradient(180deg,rgba(224,165,48,.22),rgba(255,255,255,.03));box-shadow:0 0 18px -6px #e0a530}
.pl84 .onl-plart{position:relative}.pl84-star{position:absolute;top:2px;left:4px;font-size:20px;filter:drop-shadow(0 1px 3px #000)}
.dom84c{font:600 11px system-ui,sans-serif;color:#e8d6a8;background:rgba(0,0,0,.3);border:1px solid rgba(232,201,106,.4);border-radius:6px;padding:0 5px;margin-left:5px;cursor:pointer}
.dom84c:hover{border-color:var(--gold,#e8c96a)}
#rcl84{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9500;display:flex;gap:8px;align-items:center;padding:8px 12px;border-radius:999px;background:rgba(20,14,8,.95);border:1px solid #e0a530;color:#f3e6c4;box-shadow:0 6px 24px rgba(0,0,0,.6);max-width:calc(100vw - 32px);flex-wrap:wrap;justify-content:center}
.au84-intro{max-width:760px}.au84-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;align-items:start}
.au84-lot{display:grid;gap:6px}.au84-lot.mine{border-color:#e0a530}.au84-lot.past{opacity:.85}
.au84-lead{font-size:13px}.au84-lead.none{color:var(--muted)}.au84-lead.me b{color:var(--gold,#e8c96a)}
.au84-cd{font:600 12px var(--mono,monospace);color:#d9c08a}.au84-snipe{color:#ffb38a;font-weight:600}
.au84-bid{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.au84-bid input{width:110px}.au84-me{color:var(--gold,#e8c96a)}
.au84-bids small{display:block;color:var(--muted)}.au84-won{border-color:#c9a6ff}
@media (max-width:600px){.au84-grid{grid-template-columns:1fr}#rcl84{bottom:70px}}`;document.head.appendChild(st)}
