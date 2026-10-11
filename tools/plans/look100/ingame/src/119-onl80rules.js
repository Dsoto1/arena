/* =====================================================================
   119-ONL80RULES · ONLINE v0.80: the online match rules + the majority resync
   =====================================================================
   • Printed gear only: an online match never sees the lanista's creations. The host starts it under the 'classic' roster
     (no custom weapons/armor in the market, no level 4 chest weapons in CHEST_W, no cohorts/specials), Flavius presides
     (no custom or city editor from this browser's Settings), the stands fill with strangers (no regulars, no custom
     spectators, no off-duty Manager gladiators) and the seed-opening memory is not used. Every client that loads the
     snapshot switches to the classic roster too. The lanista's own roster comes back when the match ends (gameOver, onlExit,
     the next offline event).
   • No offline records: while S.onl, the Annals/Hall (recordEvent → infamis, event records, Hall progress, editor and music
     unlocks, the Road, achievements), achievement grants, custom character sheets, the crowd's memories and arena ledgers,
     the bestiary ledgers, the empire calendar, the betting ledger, the Manager wallet (getPurse → none), the Ludus Flavius
     (Gate of Life, Save, Claim freedom, the fallen) and the match autosave are skipped. A Store guard blocks the offline
     collections while a match is live and just after it ends (belt and braces). ONL80R.skips counts what was skipped.
   • Ranked: hints, the strategy panel, Focus suggestions (showStrategy reads SETTINGS.hints) are off; the master switch is
     held off for the match and given back afterwards. Custom keeps them. The bookmaker's window (win odds) never opens online.
   • No pause online: the Pause and Step buttons are hidden and refused, Space never pauses, a stray pause/step is undone.
     Your own pace (Slow/Normal/Fast) stays.
   • MAJORITY RESYNC (protocol 4): when an input's pre-hash differs from mine and 3+ humans are live (fighters + ticket holders,
     not dropped/abandoned), I ask the others for their hash at that seq (match.hashq → match.hasha) and tally the votes
     (the mover's vote = the input's own pre-hash). A strict majority wins:
       – no majority, or the majority agrees with the mover → the old path (a snapshot from the mover);
       – I am in the majority and the mover is not → the input is skipped here and on every majority client; the seat is
         marked odd with the input's generation g (later inputs from that seat with g ≤ mark are skipped too); the majority
         member with the lowest seat sends the odd one a snapshot when settled; every majority client sends match.odd;
       – I am in a minority → a snapshot from the lowest majority seat.
     Every input carries g = ONLM.gen; loading any snapshot raises ONLM.gen (≥ Date.now(), so it also survives a reload).
     Odd marks travel inside snapshots (S._onlOdd), so a watcher or a resynced client keeps skipping the same inputs.
     Two humans (or fewer than 3 live): exactly the old path.
   ===================================================================== */
const ONL80R={saved:null,hints:null,starting:null,mid:null,V:null,hq:[],oddSent:{},oddSkips:0,votes:0,skips:{},blocked:0,overAt:0,pace:'slow'};
ONLM.gen=Date.now();ONLM.odd={};
const onl80Skip=k=>{ONL80R.skips[k]=(ONL80R.skips[k]||0)+1};
/* an online match is (or just was) on the sand here */
const onl80Live=()=>!!(typeof S!=='undefined'&&S&&S.onl&&!S.sim);
const onl80Start=()=>!!ONL80R.starting;
/* the record guard: the online match is live, or settling (its results window, or 20 s after it ended) — never later, so a
   lanista who goes on to Manager mode or the Studio with the old online S still in memory writes as usual */
function onl80Rec(){if(!onl80Live())return false;if(!S.over)return true;const t=Date.now()-ONL80R.overAt;return t<20000||(ONL80R.inOver&&t<600000)}

/* ---------------- 1 · printed gear only ---------------- */
function onl80Classic(){try{if(typeof rosterUse==='function'&&typeof ROSTER_SYS!=='undefined')rosterUse(ROSTER_SYS[0])}catch(e){console.error(e)}}
function onl80RulesOn(){if(!ONL80R.saved)ONL80R.saved={roster:typeof ROSTER_ACTIVE!=='undefined'?ROSTER_ACTIVE:null};onl80Classic();
  if(S&&S.onl&&S.onl.ranked)onl80HintsOff()}
function onl80RulesOff(){const sv=ONL80R.saved;if(sv){ONL80R.saved=null;try{ROSTER_ACTIVE=sv.roster;if(typeof gearRebuild==='function')gearRebuild()}catch(e){console.error(e)}}onl80HintsBack()}
/* a new online match: fresh marks and votes (ONLM.gen is never reset) */
function onl80Match(){const id=S&&S.onl&&S.onl.lobby;if(!id||ONL80R.mid===id)return;ONL80R.mid=id;ONLM.odd={};ONL80R.V=null;ONL80R.hq=[];ONL80R.oddSent={}}
{const base=startEvent;startEvent=function(cfg){
  if(!(cfg&&cfg.onl)){if(!(cfg&&cfg.sim))onl80RulesOff();return base.apply(this,arguments)}
  if(!ONL80R.saved)ONL80R.saved={roster:typeof ROSTER_ACTIVE!=='undefined'?ROSTER_ACTIVE:null};
  if(cfg.onl.ranked)onl80HintsOff(true);
  const keep=typeof CFG!=='undefined'?CFG.roster:undefined;if(typeof CFG!=='undefined')CFG.roster='classic';ONL80R.starting=cfg.onl;onl80Classic();
  let r;try{r=base.apply(this,arguments)}finally{if(typeof CFG!=='undefined')CFG.roster=keep;ONL80R.starting=null}
  try{onl80Classic();if(S&&S.onl){onl80Match();S.sponsorId='flavius'}}catch(e){console.error(e)}return r}}
/* the editor of an online match is always Flavius (a custom or unlocked editor is this browser's choice) */
{const base=sponsorStart;sponsorStart=function(cfg){if(cfg&&cfg.onl||onl80Start()){if(S)S.sponsorId='flavius';return}return base.apply(this,arguments)}}
/* the stands: strangers only — no regulars from this browser, no custom spectators, no off-duty Manager gladiators */
{const base=seatSpectators;seatSpectators=function(n,cfg){if(!(cfg&&cfg.onl)&&!onl80Start())return base.apply(this,arguments);
  const keep=CROWD_CACHE;CROWD_CACHE=[];try{return base.apply(this,arguments)}finally{CROWD_CACHE=keep}}}
{const base=seatOffDuty;seatOffDuty=function(){if(onl80Start()||onl80Live()){onl80Skip('seatOffDuty');return}return base.apply(this,arguments)}}
{const base=seedOpening;seedOpening=function(config){if(config&&config.onl||onl80Start()){onl80Skip('seedOpening');return}return base.apply(this,arguments)}}
/* every client that loads a snapshot plays under the same printed roster; odd marks travel with it */
{const base=onlmLoad;onlmLoad=function(snap,onl){const r=base.apply(this,arguments);
  try{if(S&&S.onl){onl80Match();ONLM.gen=Math.max((ONLM.gen||0)+1,Date.now());onl80RulesOn();const m=S._onlOdd;
    if(m&&typeof m==='object')for(const k of Object.keys(m))ONLM.odd[k]=Math.max(ONLM.odd[k]!=null?ONLM.odd[k]:-Infinity,+m[k])}}catch(e){console.error(e)}return r}}
{const base=matchSnapshot;matchSnapshot=function(){try{if(S&&S.onl)S._onlOdd=ONLM.odd&&Object.keys(ONLM.odd).length?{...ONLM.odd}:null}catch(e){}return base.apply(this,arguments)}}
/* the match ends: the lanista's own roster and hints come back */
{const base=gameOver;gameOver=async function(){const on=onl80Live();if(on){ONL80R.overAt=Date.now();ONL80R.inOver=true}try{return await base.apply(this,arguments)}finally{if(on){ONL80R.inOver=false;onl80RulesOff()}}}}
{const base=onlExit;onlExit=function(){const r=base.apply(this,arguments);try{onl80RulesOff()}catch(e){}return r}}

/* ---------------- 2 · online results never write offline records ---------------- */
for(const [nm,val] of [['recordEvent',undefined],['achievementsAfterEvent',undefined],['logCustomChars',undefined],['updateCrowdAfterEvent',undefined],
  ['bestiaryTally',undefined],['saveGladiator',null],['markFallen',undefined],['claimFreedom',undefined],['hallTrophy',undefined],['rivalTrophy',undefined],
  ['sponsorAfterEvent',undefined],['roadAfterEvent',undefined],['infirmaryTick',undefined],['achGrant',false],['setPurse',undefined],['getPurse',null],['betRec',null],['betSettle',undefined],
  ['matchAutosave',undefined],['advanceMissio',null]]){
  try{const base=eval(nm);if(typeof base!=='function')continue;const isAsync=base.constructor&&base.constructor.name==='AsyncFunction';
    const w=function(){if(onl80Rec()){onl80Skip(nm);return isAsync?Promise.resolve(val):val}return base.apply(this,arguments)};
    eval(`${nm}=w`)}catch(e){}}
/* the empire's calendar does not move for an online match (the clock reads as held, so gameOver never advances it) */
{const base=careerHoldsClock;careerHoldsClock=async function(){if(onl80Rec()){onl80Skip('calendar');return true}return base.apply(this,arguments)}}
{const base=matchSaveOK;matchSaveOK=function(){return onl80Live()?false:base.apply(this,arguments)}}
/* the bookmaker (win odds + the Manager wallet) never opens online */
{const base=openWagers;openWagers=async function(){if(onl80Live()&&!S.over){if(typeof mToast==='function')mToast(_T('💰 The bookmaker keeps no book online.'));return}return base.apply(this,arguments)}}
/* the results window: no Ludus Flavius (Save / Claim freedom / Save all) and no offline replay of an online match */
{const base=resultCard;resultCard=function(){const h=base.apply(this,arguments);if(!onl80Live()||typeof h!=='string')return h;
  return h.replace(/<button class="btn" type="button" data-(save|free)="[^"]*"[^>]*>[\s\S]*?<\/button>/g,'')}}
{const base=modal;modal=function(title,body,buttons,opt){if(onl80Live()&&S.over&&Array.isArray(buttons)&&buttons.some(b=>b&&(b.value==='saveall'||b.value==='replay')))
  buttons=buttons.filter(b=>!(b&&(b.value==='saveall'||b.value==='replay')));return base.call(this,title,body,buttons,opt)}}
/* belt and braces: the offline collections are not written while an online match is live or settling */
const ONL80_BLOCK=new Set(['hall','infamis','hallTrophies','gladiators','missios','wallet','mgrCareers','mgrArchives','crowd','arena','customChars']);
function onl80Guard(col){return ONL80_BLOCK.has(col)&&onl80Rec()}
{const put=Store.put,del=Store.del;
  Store.put=function(col){if(onl80Guard(col)){ONL80R.blocked++;return Promise.resolve(false)}return put.apply(this,arguments)};
  Store.del=function(col){if(onl80Guard(col)){ONL80R.blocked++;return Promise.resolve()}return del.apply(this,arguments)}}

/* ---------------- 3 · Ranked: no hints, no strategy panel, no Focus suggestions ---------------- */
function onl80HintsOff(quiet){if(ONL80R.hints)return;ONL80R.hints={H:HINTS,sh:SETTINGS.hints};HINTS=false;SETTINGS.hints=false;onl80HintsUI(quiet)}
function onl80HintsBack(){const h=ONL80R.hints;if(!h)return;ONL80R.hints=null;HINTS=h.H;SETTINGS.hints=h.sh;onl80HintsUI()}
function onl80HintsUI(quiet){try{document.querySelectorAll('[data-hints]').forEach(b=>b.classList.toggle('on',(b.dataset.hints==='on')===HINTS))}catch(e){}if(!quiet)try{if(S&&!S.sim)render()}catch(e){}}
/* a settings change while hints are held: the saved settings keep the lanista's own choice */
{const base=applySettings;applySettings=function(){const h=ONL80R.hints;if(!h)return base.apply(this,arguments);if(SETTINGS.hints===false)SETTINGS.hints=h.sh;
  let r;try{r=base.apply(this,arguments)}finally{h.H=HINTS;h.sh=SETTINGS.hints;HINTS=false;SETTINGS.hints=false}return r}}
for(const nm of ['setHints','hintsMaster']){try{const base=eval(nm);if(typeof base!=='function')continue;
  const w=function(){if(ONL80R.hints){if(typeof mToast==='function')mToast(_T('🧭 No hints in Ranked — they return after the match.'));return}return base.apply(this,arguments)};eval(`${nm}=w`)}catch(e){}}

/* ---------------- 4 · no pause online ---------------- */
const onl80NoPause=()=>!!(typeof S!=='undefined'&&S&&S.onl&&!S.over);
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-speed="pause"],[data-speed="step"],[data-sspeed="pause"],[data-sspeed="step"]');
  if(!b||!onl80NoPause())return;e.preventDefault();e.stopImmediatePropagation();if(e.isTrusted&&typeof mToast==='function')mToast(_T('⏩ The online arena never pauses — your own pace stays.'))},true);
window.addEventListener('keydown',e=>{if(e.code!=='Space'||!onl80NoPause())return;const t=document.activeElement;if(t&&(['INPUT','TEXTAREA','SELECT'].includes(t.tagName)||t.isContentEditable))return;
  if(typeof STEP!=='undefined'&&STEP.res)return;e.stopImmediatePropagation();if(!CUR_MODAL)e.preventDefault()},true);
setInterval(()=>{try{if(typeof SPEED==='undefined')return;if(!['pause','step','snap'].includes(SPEED))ONL80R.pace=SPEED;if(!onl80NoPause())return;
  const winOpen=!!CUR_MODAL||(typeof MODAL_PAUSE!=='undefined'&&MODAL_PAUSE!=null)||!document.getElementById('modal').hidden;
  if(SPEED==='step'||(SPEED==='pause'&&!winOpen))setSpeedUI(ONL80R.pace&&!['pause','step'].includes(ONL80R.pace)?ONL80R.pace:'normal')}catch(e){}},400);
{const st=document.createElement('style');st.textContent=`body.onlarena #speedTray [data-speed="pause"],body.onlarena #speedTray [data-speed="step"]{display:none!important}`;document.head.appendChild(st)}

/* ---------------- 5 · the majority resync ---------------- */
/* the live humans: fighters and ticket holders still at the table (not dropped, not abandoned) */
function onl80LiveSeats(){const out=[];(ONLM.owners||[]).forEach((a,i)=>{if(a&&!(ONLM.left&&ONLM.left[i]!=null))out.push(i)});return out}
/* an input from a seat judged out of step (and not yet back in step) */
function onl80IsOdd(inp){if(!inp||inp.from==='server'||!['tile','act','modal'].includes(inp.k))return false;const m=ONLM.odd&&ONLM.odd[inp.seat];return m!=null&&(+inp.g||0)<=m}
/* every input carries my generation; my own inputs' pre-hash is filed under their server seq */
{const base=NET.req;NET.req=function(t,d){if(t==='match.input'&&d&&d.in&&d.in.g==null)d.in.g=ONLM.gen||0;const p=base.apply(this,arguments);
  if(t==='match.input'&&d&&d.in&&p&&typeof p.then==='function'){const pre=d.in.k==='modal'?d.in.pre:d.in.h;p.then(r=>{if(r&&Number.isInteger(r.seq)&&pre)ONLM.hlog['s'+r.seq]=pre}).catch(()=>{})}return p}}
NET.on('match.input',d=>{if(!onlmOn()||!d||!d.in||d.id!==S.onl.lobby||d.in.from!==ONL.acct.id)return;const pre=d.in.k==='modal'?d.in.pre:d.in.h;if(pre&&Number.isInteger(d.in.seq)&&!ONLM.hlog['s'+d.in.seq])ONLM.hlog['s'+d.in.seq]=pre});
/* odd inputs are taken at once and never applied */
{const base=onlmReady;onlmReady=function(inp){if(S&&!S.over&&onl80IsOdd(inp))return true;return base.apply(this,arguments)}}
{const base=onlmApply;onlmApply=function(inp){if(onl80IsOdd(inp)){ONL80R.oddSkips++;setTimeout(onlmPump,30);return}return base.apply(this,arguments)}}
const ONL80_RESYNC0=onlmResync;
onlmResync=function(inp){
  if(onl80IsOdd(inp)){ONL80R.oddSkips++;setTimeout(onlmPump,30);return}
  const mine=inp.k==='modal'?onlmPendHash():onlHash();const theirs=inp.k==='modal'?inp.pre:inp.h;ONLM.hlog['s'+inp.seq]=mine;
  const live=onl80LiveSeats();
  /* a watcher with 3+ humans live: never trust the mover alone — ask a human who is not the mover */
  if(ONLM.me<0){if(live.length>=3&&onlmHuman(inp.seat)){const alt=live.find(i=>i!==inp.seat);if(alt!=null){ONLM.resyncs++;ONLM.resyncing=true;ONLM.needAt=inp.seq;
      NET.req('match.snapreq',{id:S.onl.lobby,to:ONLM.owners[alt],seq:inp.seq}).catch(()=>{});setTimeout(()=>{if(ONLM.resyncing){ONLM.resyncing=false;onlmPump()}},15000);return}}
    return ONL80_RESYNC0.apply(this,arguments)}
  if(live.length<3||!live.includes(inp.seat)||!live.includes(ONLM.me))return ONL80_RESYNC0.apply(this,arguments);
  /* the vote */
  ONLM.resyncing=true;ONL80R.votes++;const V={seq:inp.seq,inp,mine,theirs,live,votes:{[ONLM.me]:mine,[inp.seat]:theirs},at:Date.now(),done:false,lobby:S.onl.lobby};ONL80R.V=V;
  NET.req('match.hashq',{id:S.onl.lobby,seq:inp.seq}).catch(()=>{});V.t=setTimeout(()=>onl80Decide(V),20000);onl80Tally(V)};
function onl80Tally(V){if(V.done)return;if(V.live.every(i=>V.votes[i]!=null))onl80Decide(V)}
function onl80Decide(V){if(V.done)return;V.done=true;clearTimeout(V.t);if(ONL80R.V===V)ONL80R.V=null;if(!S||!S.onl||S.onl.lobby!==V.lobby||S.over){ONLM.resyncing=false;return}
  const n=V.live.length;const cnt={};for(const i of V.live){const h=V.votes[i];if(h!=null)cnt[h]=(cnt[h]||0)+1}
  const maj=Object.keys(cnt).find(h=>cnt[h]*2>n)||null;V.maj=maj;ONL80R.last={seq:V.seq,seat:V.inp.seat,n,cnt,maj:maj?(maj===V.mine?'me':maj===V.theirs?'mover':'other'):'none'};
  if(!maj||maj===V.theirs){ONLM.resyncing=false;onlmResyncBase(V.inp);return}
  const majSeats=V.live.filter(i=>V.votes[i]===maj).sort((a,b)=>a-b);
  if(maj===V.mine){
    /* the mover is out of step: skip its input here (already taken off the queue) and everything it sent on that state */
    const seat=V.inp.seat,g=+V.inp.g||0;ONLM.odd[seat]=Math.max(ONLM.odd[seat]!=null?ONLM.odd[seat]:-Infinity,g);ONL80R.oddSkips++;
    {const k=majSeats.indexOf(ONLM.me);setTimeout(()=>NET.req('match.odd',{id:V.lobby,seat}).catch(()=>{}),Math.max(0,k)*400)}
    try{log(_T`⚖ <b>${esc(onlmName(seat))}</b> was out of step with the others — the arena holds to the majority.`,'thought')}catch(e){}
    if(majSeats[0]===ONLM.me&&ONL80R.oddSent[seat]!==g){ONL80R.oddSent[seat]=g;onl80SendOdd(seat)}
    ONLM.resyncing=false;setTimeout(onlmPump,30);return}
  /* I am in a minority: the arena of the lowest majority seat */
  const src=majSeats.find(i=>i!==ONLM.me);ONLM.resyncs++;ONLM.lastResync={seq:V.seq,k:V.inp.k,minority:1};ONLM.needAt=V.seq;
  if(typeof mToast==='function')mToast(_T('🔄 Out of step with the others — fetching their arena…'));
  NET.req('match.snapreq',{id:V.lobby,to:ONLM.owners[src],seq:V.seq}).catch(()=>{});setTimeout(()=>{if(ONLM.resyncing){ONLM.resyncing=false;onlmPump()}},15000)}
/* the 113 resync (snapshot from the mover), kept for the cases that still use it */
function onlmResyncBase(inp){ONLM.resyncing=false;return ONL80_RESYNC0(inp)}
/* the lowest majority seat sends the odd lanista our arena, at a settled point */
function onl80SendOdd(seat){const to=ONLM.owners[seat];if(!to)return;const id=S.onl.lobby;const t0=Date.now();
  const send=()=>{if(!onlmOn()||S.onl.lobby!==id)return;if(!onlmSettled()&&Date.now()-t0<60000){setTimeout(send,150);return}
    NET.req('match.snap',{id,to,seq:ONLM.next,snap:matchSnapshot('online'),odd:1}).catch(()=>{})};setTimeout(send,60)}
/* answering the others: my hash before that seq (now, or as soon as I reach it) */
NET.on('match.hashq',d=>{if(!onlmOn()||!d||d.id!==S.onl.lobby||d.from===ONL.acct.id||ONLM.me<0)return;ONL80R.hq.push({seq:d.seq|0,to:d.from,at:Date.now()});onl80Answer()});
function onl80Answer(){if(!ONL80R.hq.length||!S||!S.onl)return;const keep=[];for(const q of ONL80R.hq){const h=ONLM.hlog['s'+q.seq];
    if(h){NET.req('match.hasha',{id:S.onl.lobby,seq:q.seq,to:q.to,h}).catch(()=>{});continue}if(Date.now()-q.at<60000)keep.push(q)}ONL80R.hq=keep}
setInterval(()=>{try{if(ONL80R.hq.length&&onlmOn())onl80Answer()}catch(e){}},250);
NET.on('match.hasha',d=>{const V=ONL80R.V;if(!V||V.done||!d||d.id!==V.lobby||(d.seq|0)!==V.seq)return;if(d.to&&ONL&&ONL.acct&&d.to!==ONL.acct.id)return;
  let seat=Number.isInteger(d.seat)?d.seat:(ONLM.owners||[]).indexOf(d.from);if(seat<0||!V.live.includes(seat)||seat===ONLM.me||seat===V.inp.seat)return;V.votes[seat]=String(d.h||'');onl80Tally(V)});

/* ---------------- the mock server: match.hashq / match.hasha / match.odd ---------------- */
function mockLiveHumans(L,M){const gone=a=>(M.dropped||{})[a]||(M.abandoned||{})[a];
  return L.players.filter(p=>!/^bot/.test(p.id)&&!gone(p.id)).map(p=>p.id).concat((L.stands||[]).map(s=>s.id).filter(a=>!gone(a)))}
Object.assign(MOCK_ROUTES,{
  'match.hashq':(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));if(mockSeat(L,me)<0)throw new Error(_T('Not your match.'));
    mockPush('match.hashq',{id:d.id,seq:d.seq|0,from:me,to:mockLiveHumans(L,M).filter(a=>a!==me)});return {}},
  'match.hasha':(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));const seat=mockSeat(L,me);if(seat<0)throw new Error(_T('Not your match.'));
    mockPush('match.hasha',{id:d.id,seq:d.seq|0,to:String(d.to||''),from:me,seat,h:String(d.h||'').slice(0,40)});return {}},
  'match.odd':(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));if(mockSeat(L,me)<0)throw new Error(_T('Not your match.'));
    const seat=d.seat|0;const acct=seat<L.seats?(L.players[seat]||{}).id:((L.stands||[])[seat-L.seats]||{}).id;if(!acct||acct===me||/^bot/.test(acct))throw new Error(_T('No one to judge.'));
    /* the votes keep their own item: the shared mock world is rewritten by every window, a vote must not be lost to that;
       each vote also gets its own key (v0.90 tests: two windows voting 400 ms apart under load rewrote the item over each other) */
    try{localStorage.setItem('flavius_onlmock_oddv80.'+d.id+'.'+acct+'.'+me,'1')}catch(e){}
    const O=mockOdd80();const m=O[d.id]=O[d.id]||{votes:{},struck:{}};const v=m.votes[acct]=m.votes[acct]||[];if(!v.includes(me))v.push(me);const n=mockLiveHumans(L,M).length;let struck=false;
    if(n>=3&&v.length>=Math.floor(n/2)+1&&!m.struck[acct]){m.struck[acct]=1;mockStrike80(w,acct,d.id);struck=true;
      /* the strike lands in the shared world, which another window may be rewriting at that moment: check it again shortly */
      for(const ms of [700,2500])setTimeout(()=>{const w2=mockLoad();if(mockStrike80(w2,acct,d.id))mockSave(w2)},ms)}
    try{localStorage.setItem('flavius_onlmock_odd80',JSON.stringify(O))}catch(e){}
    /* the other voter's key can reach this window late: judge again shortly (the server counts in one place, the mock cannot) */
    if(!m.struck[acct])for(const ms of [700,2500,6000])setTimeout(()=>{try{mockOddJudge80(d.id,acct,seat)}catch(e){}},ms);
    return {votes:v.length,struck}}});
function mockOddJudge80(mid,acct,seat){const w=mockLoad();const L=w.lobbies[mid],M=w.matches[mid];if(!L||!M)return;const O=mockOdd80();const m=O[mid];if(!m||m.struck[acct])return;
  const v=m.votes[acct]||[];const n=mockLiveHumans(L,M).length;if(!(n>=3&&v.length>=Math.floor(n/2)+1))return;
  m.struck[acct]=1;try{localStorage.setItem('flavius_onlmock_odd80',JSON.stringify(O))}catch(e){}if(mockStrike80(w,acct,mid))mockSave(w);
  mockPush('match.youodd',{id:mid,seat,voters:v.slice(),to:acct})}
/* one strike per match (true when it had to be written) */
function mockStrike80(w,acct,mid){const P=w.accounts[acct];if(!P)return false;P.oddStruck=P.oddStruck||{};if(P.oddStruck[mid])return false;P.oddStruck[mid]=1;P.strikes=(P.strikes||0)+1;return true}
function mockOdd80(){let O={};try{O=JSON.parse(localStorage.getItem('flavius_onlmock_odd80')||'{}')||{}}catch(e){}
  /* + the votes kept one key each (flavius_onlmock_oddv80.<match>.<judged>.<voter>) */
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||k.indexOf('flavius_onlmock_oddv80.')!==0)continue;const [mid,acct,by]=k.slice(23).split('.');if(!mid||!acct||!by)continue;
    const m=O[mid]=O[mid]||{votes:{},struck:{}};m.votes=m.votes||{};m.struck=m.struck||{};const v=m.votes[acct]=m.votes[acct]||[];if(!v.includes(by))v.push(by)}}catch(e){}
  return O}
