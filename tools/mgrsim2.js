/* mgrsim2.js — Manager ECONOMY re-measure (v1.12 E1a–E5a, tools/plans/econ111/REPORT.md). Successor of tools/mgrsim.js + tools/balance100/mgrecon.js.
   Plays whole Manager careers headless with a scripted lanista through the game's OWN functions and writes one JSON row per run per season.
   No game change: everything here is sim-side (stubs for windows/toasts, a coin tag on the rival houses, optional --patch for tuning studies).

   Usage: node tools/mgrsim2.js <page.html> [--profiles careful,spendthrift,mimic] [--seeds 1-12] [--seasons 5] [--out rows.jsonl]
            [--par 2] [--start new|pre:<key>] [--ls '{"flavius_v109aoff":"1"}'] [--patch '<js run in the page before the world>'] [--tag name] [--skip-done] [--buy]
            --buy: the house also buys rival fighters with coin through 23's 1-for-1 offer (Trades 2 study)
            --skip-done: skip (profile, seed) runs already in --out with this --tag (resume after a crash/restart)
   Fixes over mgrsim/mgrecon:
     1 AWAY WEEKS: the house sets off the game's way (35 travelState/travelClick 'travelpay' or 'traveldeal', 360 mw105Go) before any bout, so 397's
       bt106Locked never skips bouts; a week that still cannot play (no coin for the road) is counted (travelStuck) and the lock is lifted by
       setting off unpaid (what a broke player would have to do: the week cannot end otherwise).
     2 RECRUITING through the v1.05 paths: Recruiter hours (249 rec98Act watch/cup/study/trial, 272 rec99Left), the week's recruiting hours (w.hours)
       and one-of-each-action gates (17 recGate/recMark) for pitch (249 PITCH98 rule, as its click handler), feast (doVisit) and gift (doGiftFighter),
       offers through 17 offerVerdict → signGlad (every later wrapper runs: 363 renown, 378 settling-in, 249 truth). In-season renewals = 17's
       'extend' rule (morale 35+, interest 25+, 8 weeks at the ask); off-season raises/leave asks = 348 po104Answer (the rows 386/413 show).
     3 WINTER QUARTERS: 413 wqSeal (the Quaestor's Ledger), 414 a109Ensure (intake + goals), a109Promote (the free promotion), a109Gen intake
       signings, a109Camp, winter works (facBuild), 415 wc109Answer in/out + wc109Finish (Days I–III, 416's Saturnalia), 380/416 rudis asks
       settled ('stay'), then endWeek (= ▶ Begin). Renown is logged by wrapping renown105 (sim-side), perk points from m.perkPts.
     4 SEEDS: every run is a fresh page booted with tools/tests/_wait.js (mulberry32 Math.random, fixed world id, seeded dice) → same seed, same run.
     5 PROFILES: careful (reserve-first), spendthrift (spends whenever it can), mimic (the CPU houses' own rules: 17 cpuLeagueWeek signing,
       23 aiLanistaWeek drills/care/morale/building, 225 arm94AutoShop, 318 care101Cpu, 348 renew-if-coin≥8 weeks).
   Money: the PLAYER's from 413's ledger w.led109 (per season, the game's own categories); the actual contract wages paid are summed separately.
   RIVALS: a coin accessor on each rival house tags every change by the first named function on the stack (sim-side), summed per category.
   Row (one per run per season): {tag,profile,seed,season,start,end,curve[[label,coin]],min,red,bankrupt,led{cat:{i,o}},spend,wages,wageShareLed,
     wageShare,roster,deaths,retired,freed,walked,signed,renown{lv,src,pts},perk,wc{st,fin,champ},rank,pts,rivals{min,lt30,lt0,minWk,lt30wk,led},diag}. */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const T=require('./tests/_wait.js');
const argv=process.argv.slice(2);const PAGE=path.resolve(argv[0]||'flavius-arena.html');
const opt=k=>{const i=argv.indexOf('--'+k);return i>=0?argv[i+1]:null};
const PROFILES=(opt('profiles')||'careful,spendthrift,mimic').split(',');
const SEEDS=(()=>{const s=opt('seeds')||'1-12';const out=[];for(const part of s.split(',')){const m=part.match(/^(\d+)-(\d+)$/);if(m)for(let i=+m[1];i<=+m[2];i++)out.push(i);else out.push(+part)}return out})();
const SEASONS=+(opt('seasons')||5),PAR=Math.max(1,Math.min(2,+(opt('par')||1))),OUT=opt('out'),START=opt('start')||'new',TAG=opt('tag')||'main';
const LS=JSON.parse(opt('ls')||'{}'),PATCH=opt('patch')||'',SIMK=JSON.parse(opt('simk')||'{}');const BUY=argv.includes('--buy');const REALTIME=argv.includes('--realtime');
const DONE=new Set();if(argv.includes('--skip-done')&&OUT&&fs.existsSync(OUT)){for(const l of fs.readFileSync(OUT,'utf8').split('\n')){if(!l.trim())continue;try{const r=JSON.parse(l);if(r.tag===TAG&&!r.err)DONE.add(r.profile+':'+r.seed)}catch(e){}}}
const jobs=[];for(const p of PROFILES)for(const s of SEEDS)if(!DONE.has(p+':'+s))jobs.push({p,s});
const outF=OUT?fs.openSync(OUT,'a'):null;const say=s=>process.stderr.write(s+'\n');

/* ------------------------------------------------------------------ the page side ------------------------------------------------------------------ */
/* VIRTUAL TIME (init script, before the game loads): setTimeout / setInterval / requestAnimationFrame run from one queue ordered by
   (virtual due time, order of scheduling), one per macrotask; performance.now and Date.now read the virtual clock. Real-time races (crowd
   reactions, bubbles, heartbeats, audio drawing rand() — the live event's dice — while a bout runs) then happen in the same order every run,
   so a seed replays the same career. Cosmetic delays cost nothing. --realtime turns it off. */
const VTIME=function(epoch){if(window.__VT)return;const VT=window.__VT={now:0,seq:0,q:[],run:false,n:0};const P=window.performance;
  const ch=new MessageChannel();const kick=()=>{if(!VT.run&&VT.q.length){VT.run=true;ch.port2.postMessage(0)}};
  ch.port1.onmessage=()=>{VT.run=false;if(!VT.q.length)return;let bi=0;const q=VT.q;for(let i=1;i<q.length;i++){const a=q[i],b=q[bi];if(a.t<b.t||(a.t===b.t&&a.s<b.s))bi=i}
    const T=q[bi];if(T.iv){T.t=Math.max(VT.now,T.t)+T.iv;T.s=++VT.seq}else q.splice(bi,1);VT.now=Math.max(VT.now,T.iv?T.t-T.iv:T.t);VT.n++;
    try{T.fn.apply(window,T.a)}catch(e){setTimeout0(e)}kick()};
  const setTimeout0=e=>{try{console.error(e)}catch(x){}};
  const add=(fn,ms,a,iv)=>{if(typeof fn!=='function'){const src=String(fn);fn=()=>(0,eval)(src)}const id=++VT.seq;VT.q.push({id,fn,a,t:VT.now+Math.max(0,+ms||0),s:id,iv:iv?Math.max(4,+ms||0):0});kick();return id};
  const del=id=>{const i=VT.q.findIndex(x=>x.id===id);if(i>=0)VT.q.splice(i,1)};
  window.setTimeout=(fn,ms,...a)=>add(fn,ms,a,false);window.clearTimeout=del;window.setInterval=(fn,ms,...a)=>add(fn,ms,a,true);window.clearInterval=del;
  window.requestAnimationFrame=fn=>add(()=>fn(VT.now),16,[],false);window.cancelAnimationFrame=del;
  window.requestIdleCallback=fn=>add(()=>fn({didTimeout:false,timeRemaining:()=>8}),1,[],false);window.cancelIdleCallback=del;
  try{P.now=()=>(VT.now+=0.002)}catch(e){}Date.now=()=>epoch+Math.floor(VT.now)};
const SIM=async({profile,seed,SEASONS,START,PATCH,BUY,SIMK})=>{window.__SIMK=Object.assign({},SIMK||{},window.__SIMK||{});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));const has=k=>{try{return typeof (0,eval)(k)!=='undefined'}catch(e){return false}};
  if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await sleep(300);
  window.modal=async(t,b,btns)=>{const p=(btns||[]).find(x=>x.primary)||(btns||[])[0];return p?p.value:null};window.mToast=()=>{};window.say=()=>{};
  if(typeof ask76==='function')window.ask76=async()=>true;SPEED='snap';
  /* determinism: 138's multi-tab sweep draws Math.random on a 500 ms timer — off (one page, one tab); the stream is re-seeded every week below */
  try{if(typeof TAB84!=='undefined')TAB84.bc=null}catch(e){}
  /* determinism II: one Math.random stream PER CALLING FUNCTION, re-seeded every week — async chains that run side by side (crowd reactions,
     bubbles, wagers vs the turn loop) then cannot steal each other's draws, so the same seed replays the same career */
  const mb=x=>{let t=x>>>0;return()=>{t=t+0x6D2B79F5|0;let r=Math.imul(t^t>>>15,1|t);r=r+Math.imul(r^r>>>7,61|r)^r;return((r^r>>>14)>>>0)/4294967296}};
  const KR={base:1,map:new Map()};const keyedRandom=b=>{KR.base=b>>>0;KR.map.clear();if(window.__VT&&PATCH.indexOf('/*KEYED*/')<0){const g=mb(b^0x2545F491);const f=()=>g();f._kr=1;Math.random=f;return}if(Math.random._kr)return;const f=function(){const L=Error.stackTraceLimit;Error.stackTraceLimit=5;let st='';try{st=new Error().stack||''}catch(e){}Error.stackTraceLimit=L;
      const fr=st.split('\n');let key='';for(let i=2;i<fr.length&&i<6;i++){const mm=fr[i].match(/at (?:async )?([^\s(]+)/);const n=mm?mm[1]:'?';key+=n+'<';if(!/^(rand|rnd|pickOne|Array\.sort|Array\.forEach|Array\.map|Array\.filter|Object\.|file:)/.test(n)&&i>2)break}let g=KR.map.get(key);if(!g){let h=KR.base^0x9E3779B9;for(let i=0;i<key.length;i++)h=Math.imul(h^key.charCodeAt(i),16777619);g=mb(h);KR.map.set(key,g)}return g()};f._kr=1;Math.random=f};
  /* determinism III: every bout's dice seed from the run seed + season + week + bout (not _wait's page-wide newState counter, which any other
     newState caller shifts) */
  {const base=boutCfg;window.boutCfg=boutCfg=function(bout){const c=base.apply(this,arguments);try{const w=W_();if(c&&c.seed==null){const bi=w.night.bouts.indexOf(bout);let h=(seed*2654435761)>>>0;for(const v of [w.season,w.week,bi,(bout.wc109&&bout.wc109.d)||0,(bout.wc109&&bout.wc109.fs)||0])h=Math.imul(h^(v+0x9E37),16777619)>>>0;c.seed=h||7}if(window.__DBGC){const w=W_();const k=w.season+':'+w.week+':'+w.night.bouts.indexOf(bout);let j='';try{j=JSON.stringify(c,(kk,v)=>typeof v==='function'?undefined:v)}catch(e){j='x'}__DBGC[k]=j}}catch(e){}return c}}
  const NS={n:0};{const base=newState;window.newState=newState=function(cfg){try{if(cfg&&cfg.seed==null){const w=W_();let h=(seed*40503+0x51ED)>>>0;for(const v of [w?w.season:0,w?w.week:0,++NS.n])h=Math.imul(h^(v+0x9E37),16777619)>>>0;cfg.seed=h||9}}catch(e){}return base.apply(this,arguments)}}
  /* determinism V: no sound — the Web Audio voices run on real-time timers and some draw rand(), i.e. the live event's dice */
  for(const k of ['sfx','audInit','audTick','audStep','audNote','audNoise','audDrum','audKick','audGroove','audTheme','audLive','audWant','audSwitch','audPlayTrack','audStab','audBossSting','audBossStep','audLeadNote','audFinalOn','audClap','audHat'])
    try{if(typeof (0,eval)(k)==='function')(0,eval)(k+'=function(){}')}catch(e){}
  /* the empire crowd is seeded 3.5 s after load by a timer (25753): seed it again here from the run seed, so fans/attendance start the same */
  try{keyedRandom((seed*31+7)>>>0);(0,eval)('RNG=null');if(typeof seedEmpireCrowd==='function'){CROWD_CACHE=[];await seedEmpireCrowd()}}catch(e){}
  const DBG=PATCH.indexOf('/*DBGR*/')>=0?{wk:{},cur:'0'}:null;if(DBG)window.__DBGC={};if(DBG){const wrap=()=>{const mr=Math.random;if(mr._dbg)return;const f=function(){let st='';try{st=new Error().stack.split('\n').slice(2,4).map(x=>x.trim().split(' ')[1]).join('<')}catch(e){}const W=DBG.wk[DBG.cur]=DBG.wk[DBG.cur]||{};W[st]=(W[st]||0)+1;return mr()};f._dbg=1;Math.random=f};DBG.wrap=wrap}
  if(PATCH){try{(0,eval)(PATCH)}catch(e){return {err:'patch: '+e.message}}}
  /* renown log (sim-side wrapper; the game's own renown105 still does the work) */
  const REN={s:{}};{const base=renown105;window.renown105=renown105=function(m,key,n){const r=base.apply(this,arguments);try{const w=W_();if(m&&m.isPlayer){const amt=n==null?REN105.amt[key]||0:n;const S=REN.s[w.season]=REN.s[w.season]||{};S[key]=(S[key]||0)+amt}}catch(e){}return r}}
  /* the world */
  const P0={ambition:50,cunning:50,honor:50,greed:50,show:50,discipline:50,risk:50};
  if(START==='new')newWorld({type:'custom',mgr:{name:'Sim Lanista',ludus:'Ludus Simulatus',city:'Capua',color:'#888888',p:{...P0}}});
  else newWorld({type:'pre',key:START.split(':')[1]||'proculus'});
  MGR.view=null;MGR.tab='night';const w=W_(),m=me();w.welc99=1;
  /* determinism IV: a virtual clock — new fighters' ids are 'g'+Date.now() (17 genGlad) and ids seed careers (349), scouting noise (249), deals…;
     a real clock gave the same seed different fighters. Every call moves it 7 ms; elapsed-time checks still see time pass. */
  if(!window.__VT){let V=1790000000000+seed*1e9;Date.now=()=>(V+=7)}
  {let N=0;const base=genGlad;window.genGlad=genGlad=function(){const g=base.apply(this,arguments);try{if(g&&g.id&&!(window.Math.random&&!Math.random._kr&&!Math.random._dbg)){g.id='gs'+(seed*100000+(++N)).toString(36)}}catch(e){}return g}}
  const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;const ros=()=>rosterOf(m);const wagesOf=mm=>rosterOf(mm).reduce((a,g)=>a+((g.contract&&g.contract.mgr===mm.id&&g.contract.wage)||0),0);
  const rivals=()=>w.mgrs.filter(x=>!x.isPlayer&&!x.dead&&!x.sica);
  /* rival coin tags (first named frame; the line for the two mixed functions) */
  const RL={};const RMIN={};const RIV_INST=new WeakSet();
  const tagOf=d=>{let st='';try{st=String(new Error().stack||'')}catch(e){}for(const f of st.split('\n').slice(1)){const mm=f.match(/^\s*at (?:async )?([^\s(]+)/);if(!mm)continue;let n=mm[1].split('.').pop();if(n==='set'||n==='tagOf'||n==='Object'||n==='<anonymous>'||/^led109/.test(n))continue;
      if(n==='aiLanistaWeek'||n==='endWeek')n+=d>0?'+':'-';else if(/^(pay|get|apply|call|w|f|eval|fn|run|go|do|base)$/.test(n)){const ln=f.match(/:(\d+):\d+\)?\s*$/);if(ln)n+='@'+ln[1]}return n}return '?'};
  const rivInstall=()=>{for(const x of w.mgrs){if(x.isPlayer||RIV_INST.has(x))continue;RIV_INST.add(x);let v=x.coin||0;
    Object.defineProperty(x,'coin',{configurable:true,enumerable:true,get(){return v},set(nv){const d=(+nv||0)-v;v=nv;if(!d)return;const S=w.season;const t=tagOf(d);const L=(RL[S]=RL[S]||{});const e=L[t]=L[t]||{i:0,o:0,n:0};if(d>0)e.i+=d;else e.o-=d;e.n++;
      const R=(RMIN[S]=RMIN[S]||{});R[x.id]=Math.min(R[x.id]==null?1e9:R[x.id],v)}})}};
  rivInstall();
  /* the player's raw tags too (diagnosis of 413's categories; wraps 413's accessor, keeps its _led109 mark) */
  const PL={};const plInstall=()=>{try{if(typeof led109Install==='function')led109Install(w);const d=Object.getOwnPropertyDescriptor(m,'coin');if(!d||!d.get||d.get._sim2)return;const g0=d.get,s0=d.set;
    const get=function(){return g0.call(this)};get._led109=1;get._sim2=1;Object.defineProperty(m,'coin',{configurable:true,enumerable:true,get,set(nv){const old=g0.call(this);s0.call(this,nv);const dd=(+nv||0)-old;if(!dd)return;
      const L=(PL[w.season]=PL[w.season]||{});const t=tagOf(dd)+(LED109&&LED109.act&&Date.now()-LED109.actT<2500?'#'+LED109.act:'');const e=L[t]=L[t]||{i:0,o:0,n:0};if(dd>0)e.i+=dd;else e.o-=dd;e.n++}})}catch(e){}};
  plInstall();
  /* a clicked action's tag for 413's ledger (LED109.act, as 17's / 23's click handlers set it) — cleared right after the action, since
     virtual time would otherwise keep it alive for the rest of the week */
  const act=a=>{try{LED109.act=a;LED109.actT=Date.now()}catch(e){}};const unact=()=>{try{LED109.act=null}catch(e){}};
  const D={travelStuck:0,locked:0,stall:0,errs:[],signed:0,sicaMin:null};const err=(k,e)=>{if(D.errs.length<12)D.errs.push(k+': '+String(e&&e.message||e).slice(0,160))};
  /* ------------------------------------------------ profile knobs ------------------------------------------------ */
  const PR={careful:{size:(window.__CSIZE||[5,6,6,6,6]),wageX:[1,1.1],bonus:0,reserveWk:6,train:'std',trainRes:8,build:12,buildOrder:['stands','stables','yard','barracks','valet','armory'],visit:false,gift:true,bets:0,specials:false,ptrain:0,renewX:1.35,lend:true,blood:'value',camp:'str',wcIn:true,classicPick:'best'},
    spendthrift:{size:[6,7,8,8,8],wageX:[1.2,1.4],bonus:10,reserveWk:0,train:'hard',trainRes:0,build:0,buildOrder:['yard','stands','armory','barracks','valet','stables'],visit:true,gift:true,bets:0.1,specials:true,ptrain:1,renewX:99,lend:false,blood:'always',camp:'wpn',wcIn:true,classicPick:'best'},
    mimic:{cpu:true,camp:'mend',wcIn:true,classicPick:'best'}}[profile];
  /* deaths112 lanista knobs (--simk JSON, or window.__SIMK set by --patch; all unset = the econ111 behaviour):
     blood 'value' (default: OVR >= 58 above the reserve; the CPU rule for mimic) | 'always' (whenever the coin is there) | 'smart' (any fighter
       but the roster's worst when > 4, if coin >= price + 2 weeks' wages) | 'never' . bypass: true = also court fame-gated recruits at 17's
       fameBypassX x ask . entFit: how far below a tier's floor a fighter may be entered (default 4 = T.lo - 4, as 17 makeNight) . entMax:
       entries a week (default 3) . entCpu: true = enter like a rival house (17 makeNight: main first, one a night, a second 50% of the time,
       each with p 0.62 + risk/250) . entFat: skip fighters above this fatigue . entMorale: skip at or below this morale (default 15) */
  const K=window.__SIMK||{};if(K.reserveWk!=null&&PR&&!PR.cpu)PR.reserveWk=K.reserveWk; /* reserveWk: weeks of wages the careful house keeps (6) */
  const sIdx=()=>Math.max(0,Math.min(4,w.season-(w.startSeason||1)));
  const reserve=()=>PR.cpu?30:wagesOf(m)*(PR.reserveWk||0)+(PR.reserveWk?20:0);
  /* ------------------------------------------------ recruiting (the v1.05 paths) ------------------------------------------------ */
  const recOpen=()=>{try{return !(typeof mw105RecLocked==='function'&&mw105RecLocked(w))}catch(e){return true}};
  const hrsLeft=()=>w.hours||0;
  /* 357 B27 (his h2a, v1.04 b2 / v1.05 b27a): pitch 1 h · gift 2 h · feast 4 h of the RECRUITER's week, +1 h per action already taken on him */
  const woo=(g,a)=>{try{if(typeof woo104H!=='function')return true;if(woo104Why(g,a,w))return false;woo104Pay(g,a,w);return true}catch(e){return true}};
  const pitchOne=g=>{try{if(recGate(g,'pitch')[0]||pitchesLeft()<=0||hrsLeft()<1)return 0;const b=rec98BestPitch(g,m);const P=b?PITCH98.find(x=>x.k===b.k):null;if(!P)return 0;if(!woo(g,'pitch'))return 0;
      recMark(g,'pitch');w.pitchN={wk:w.week,n:(w.pitchN&&w.pitchN.wk===w.week?w.pitchN.n:0)+1};w.hours--;const r=rec98PGain(g,m,P,false);const b0=interestOf(g,m);g.interest[m.id]=capInterest(g,m,b0+r.n);return g.interest[m.id]-b0}catch(e){err('pitch',e);return 0}};
  const scout=g=>{for(const a of ['watch','cup','study']){try{if(rec98Can(g,a)[0])rec98Act(g,a)}catch(e){err('scout',e)}}};
  const giftOne=g=>{try{if(hrsLeft()<2||m.coin<giftCost(g)+reserve())return;if(g.giftWk&&g.giftWk[m.id]&&w.week-g.giftWk[m.id]<2)return;if(!woo(g,'gift'))return;w.hours-=2;act('gift2');doGiftFighter(g);unact()}catch(e){err('gift',e)}};
  const visitOne=g=>{try{if(hrsLeft()<4||m.coin<visitCost(g)+reserve())return;if(g.visits&&g.visits[m.id]&&w.week-g.visits[m.id]<3)return;if(!woo(g,'visit'))return;act('visit');const vv=doVisit(g);unact();if(vv!=null)w.hours-=4}catch(e){err('visit',e)}};
  const tryOffer=(g,xs,bonus)=>{for(const x of xs){const wage=Math.ceil(askWage(g)*x);if(hrsLeft()<1)return false;try{const v=offerVerdict(g,wage,12,bonus||0,false);if(v.ok){w.hours--;act('sign');signGlad(g,wage,12,bonus||0,false);unact();D.signed++;return true}}catch(e){err('offer',e);return false}}return false};
  const val=g=>{try{return (typeof rec98Ovr==='function'?rec98Ovr(g).v:estOvr(g).v)}catch(e){return effOvr(g)}};
  const recruit=(pool)=>{if(!recOpen())return;const want=PR.cpu?2+Math.round(m.p.ambition/28):PR.size[sIdx()];const n0=ros().length;
    if(n0>=want&&n0>=4)return;
    const L=(pool||freeAgents()).filter(g=>g.alive!==false&&!g.contract&&!g.inj&&askWage(g)<=Math.max(6,(m.coin-reserve())/(PR.cpu?4:6)));
    if(PR.cpu){/* the CPU houses' own signing rules, applied to the player's house (they sign without offerVerdict, as the CPU does):
        23 aiLanistaWeek — a thin barracks (< 3) is refilled from the free agents it can afford (ask × 3 ≤ max(30, coin)), best rating − 0.8 × ask;
        17 cpuLeagueWeek — below want (2 + ambition/28) and coin > 30: court the best value it can afford (+8 + show/12 interest, free), sign at the ask
        when it is his top suitor at 50+, or — kept out by fame — half the time at ask × fameBypassX */
      let guard=0;while(ros().length<3&&guard++<3){const fa=freeAgents().filter(g=>!g.inj&&askWage(g)*3<=Math.max(30,m.coin)).sort((a,b)=>(effOvr(b)-askWage(b)*0.8)-(effOvr(a)-askWage(a)*0.8))[0];if(!fa)break;
        act('sign');try{signGlad(fa,askWage(fa),6+rnd(7),0,false)}catch(e){err('sign',e)}unact();D.signed++}
      if(!(ros().length<want&&m.coin>30))return;
      const c=freeAgents().filter(g=>(m.fame>=reqFame(g)||m.coin>askWage(g)*fameBypassX(g,m)*10)&&askWage(g)*4<m.coin).sort((a,b)=>(val(b)*(1+m.p.ambition/100)-askWage(b))-(val(a)*(1+m.p.ambition/100)-askWage(a)))[0];if(!c)return;
      c.interest[m.id]=capInterest(c,m,interestOf(c,m)+8+Math.round(m.p.show/12));const top=suitors(c)[0];const nil=m.fame<reqFame(c);
      if((top.m===m&&interestOf(c,m)>=50)||(nil&&Math.random()<.5)){act('sign');try{signGlad(c,nil?Math.ceil(askWage(c)*fameBypassX(c,m)):askWage(c),6+rnd(7),0,false)}catch(e){err('sign',e)}unact();D.signed++}
      return}
    const key=profile==='spendthrift'?(g=>val(g)):(g=>val(g)-askWage(g)*0.9+(g.pot||0)*0.05);
    /* only recruits who would consider this house (17 offerVerdict's fame rule) */
    const gated=g=>m.fame<reqFame(g);const bx=g=>gated(g)?fameBypassX(g,m):1;
    const cand=L.filter(g=>m.fame>=reqFame(g)||(K.bypass&&askWage(g)*fameBypassX(g,m)<=Math.max(6,(m.coin-reserve())/6))).sort((a,b)=>key(b)-key(a)).slice(0,want-ros().length+2);
    for(const g of cand){if(ros().length>=want)break;scout(g);pitchOne(g);
      if(gated(g)){const xs=[1,1.1].map(x=>x*bx(g));const wage=Math.ceil(askWage(g)*xs[1]);if(m.coin<wage*(PR.reserveWk||1)+wagesOf(m)*(PR.reserveWk||0)&&ros().length>=4)continue;if(tryOffer(g,xs,0)&&window.__DX)window.__DX.byp++;continue}
      const wage=Math.ceil(askWage(g)*PR.wageX[PR.wageX.length-1]);if(m.coin-(PR.bonus||0)<wage*(PR.reserveWk||1)+wagesOf(m)*(PR.reserveWk||0)&&ros().length>=4)continue;
      if(tryOffer(g,PR.wageX,PR.bonus))continue;
      let why='';try{why=offerVerdict(g,wage,12,PR.bonus||0,false).why||''}catch(e){}
      if(profile==='spendthrift'||/interested|leaning/.test(why)){if(PR.gift)giftOne(g);if(PR.visit)visitOne(g);tryOffer(g,PR.wageX,PR.bonus)}}
    /* an empty barracks earns nothing: below 3 fighters, sign the cheapest willing hands even out of the reserve (every human does) */
    if(ros().length<3){const E=(pool||freeAgents()).filter(g=>g.alive!==false&&!g.contract&&!g.inj&&m.fame>=reqFame(g)&&askWage(g)<=Math.max(8,m.coin/4)).sort((a,b)=>(val(b)-askWage(b)*2)-(val(a)-askWage(a)*2));
      for(const g of E){if(ros().length>=3)break;scout(g);pitchOne(g);if(!tryOffer(g,[1,1.15,1.3])){giftOne(g);tryOffer(g,[1,1.15,1.3])}}}};
  /* in-season renewals (17's 'extend' rule) and releases */
  const renew=()=>{const R=ros().slice().sort((a,b)=>effOvr(b)-effOvr(a));const med=R.length?effOvr(R[Math.floor(R.length/2)]):0;
    for(const g of R){const c=g.contract;if(!c||c.mgr!==m.id||g.loanFrom||c.weeks>1)continue;const need=askWage(g);
      if(PR.cpu){if(!(g.morale>=35&&m.coin>=need*2&&Math.random()<.75))continue}
      else if(profile==='careful'&&R.length>4&&effOvr(g)<med-6)continue;
      if(g.morale>=35&&interestOf(g,m)>=25){c.weeks=Math.max(0,c.weeks)+8;c.wage=Math.max(c.wage,need);c.expired=0}}
    if(PR.cpu){const want=2+Math.round(m.p.ambition/28);const L=ros().filter(g=>!g.loanFrom);if(L.length>want+1){const cut=L.sort((a,b)=>effOvr(a)-effOvr(b))[0];cut.contract=null;cut.interest[m.id]=15}}};
  /* care: the Medicus / surgeon through 318's care101Do (Medicus hours, half coin) */
  /* a fighter sponsorship offer (150 pat87 letter, after a win streak): the careful and the spendthrift take it, as its 'yes' button does */
  const sponsors=()=>{if(PR.cpu||typeof pat87Live!=='function')return;for(const x of w.letters||[]){if(!x||!x.pt87||x.done87||!pat87Live(w,x))continue;x.done87=1;x.read=true;const g=gById(x.pt87.gid);
    (w.pat87=(w.pat87||[]).filter(p=>p.gid!==g.id)).push({gid:g.id,from:x.pt87.from,pay:x.pt87.pay,until:w.week+x.pt87.weeks-1});D.spons=(D.spons||0)+1}};
  const care=()=>{
    /* healed fighters leave their beds (the Infirmary page does this on every draw; 108 bedsClean76) */
    try{if(typeof bedsClean76==='function')bedsClean76(w)}catch(e){}
    /* a serious wound needs a bed before any cure (318 care101Why; the bed itself is free: 108/151 bed76 click) */
    try{if(typeof serious76==='function')for(const g of ros())if(g.inj&&!g.inj.war&&serious76(g)&&!inBed76(g)){if(typeof bedsClean76==='function')bedsClean76(w);if(typeof bedFree76==='function'&&!bedFree76(w))break;(w.beds76=w.beds76||[]).push(g.id)}}catch(e){err('bed',e)}
    /* a lost limb only Hygeia regrows (318 'heal'); a fighter missing one cannot be entered (319 r101Block) — the CPU rule: coin > 60 + 20 a limb */
    for(const g of ros())if((g.severed||[]).length){const ok=PR.cpu?m.coin>60+20*g.severed.length:profile==='careful'?m.coin>=HYGEIA+reserve()/2:m.coin>=HYGEIA;if(!ok)continue;
      try{const r=care101Do(g,'heal',{auto:1});if(!r||!r.ok)D.careNo=(D.careNo||0)+1}catch(e){err('heal',e)}}
    for(const g of ros())if(g.inj&&!g.inj.war){const req=injReq(g.inj);const k=req==='surgeon'?'surgeon':'medic';
      if(PR.cpu){if(!(m.coin>30&&Math.random()<.35+m.p.honor/300))continue;if(k==='surgeon'&&m.coin<=50)continue}
      else if(profile==='careful'){if(k==='medic'&&m.coin<reserve()+MEDICUS)continue;if(k==='surgeon'&&m.coin<SURGEON)continue}
      try{if(typeof care101Do==='function'){const r=care101Do(g,k,{auto:1});if(!r||!r.ok)D.careNo=(D.careNo||0)+1}}catch(e){err('care',e)}}};
  /* deaths112 knob fameBuy: N = buy fame toward N with 17's own Spectacle buttons (sponsor2: 18 coin +2 fame once a week; feast2: 10 coin, 2 h, +1 fame,
     only with 6+ hours left) while coin stays above fameRes x the reserve (default 0.5) — what a player does to open the fame gate */
  const fameBuy=()=>{const T=K.fameBuy;if(!T||PR.cpu||m.fame>=T)return;const keep=reserve()*(K.fameRes??0.5);
    if(m.sponWk!==w.week&&m.coin>=18+keep){act('sponsor2');m.coin-=18;unact();m.sponWk=w.week;m.fame=clamp(m.fame+2,0,100);for(const m2 of w.mgrs)if(!m2.isPlayer&&Math.random()<.3)bumpRival(m2,3);D.fameBuy=(D.fameBuy||0)+18}
    if(m.fame<T&&m.feastWk!==w.week&&w.hours>=6&&m.coin>=10+keep){act('feast2');w.hours-=2;m.coin-=10;unact();m.feastWk=w.week;m.fame=clamp(m.fame+1,0,100);D.fameBuy=(D.fameBuy||0)+10}};
  /* morale: a shared meal for the low-spirited (17 'meal', 1 h, 3 coin) */
  const morale=()=>{for(const g of ros().filter(g=>g.morale<45).slice(0,PR.cpu?1:2)){if(PR.cpu&&Math.random()>=.5)continue;if(w.hours<1||m.coin<3+(PR.cpu?20:reserve()))continue;if(g.mealWk===w.week)continue;
    act('meal');w.hours--;m.coin-=3;unact();g.mealWk=w.week;g.morale=clamp(g.morale+6,0,100);g.loyB=clamp((g.loyB||0)+2,0,25)}};
  /* the yard */
  const yard=()=>{let reg;if(PR.cpu)reg=m.p.discipline>70?'hard':m.p.discipline>45?'std':'light';else{const R=TRAIN_REGIMES[PR.train];reg=m.coin>=R.c+reserve()+wagesOf(m)*(PR.trainRes?1:0)?PR.train:m.coin>=6+reserve()?'light':'off'}
    w.train=reg;try{const P=thPlan(w);let left=thLeft(w);for(const g of ros().filter(g=>!g.inj).sort((a,b)=>gFat(a)-gFat(b))){if(gFat(g)>60){g.restWk=w.week;continue}
      for(const k2 of ['str','spd']){const h=Math.min(2,left);if(h<=0)break;P.g[g.id]=P.g[g.id]||{};P.g[g.id][k2]=(P.g[g.id][k2]||0)+h;left-=h}}}catch(e){err('yard',e)}
    if(PR.ptrain)for(const g of ros().slice().sort((a,b)=>effOvr(b)-effOvr(a)).slice(0,PR.ptrain))if(m.coin>PTRAIN_COST+20)g.ptrain=1};
  /* facilities (23 facBuild; 351 makes a level take weeks; one project at a time) */
  const busy=()=>(typeof bp104Of==='function'&&bp104Of(m))||m.facWk===w.week;
  const build=()=>{if(busy())return;
    if(PR.cpu){if(Math.random()<.14+m.p.ambition/700){const ks=Object.keys(FAC).filter(k=>facLvl(m,k)<3).sort((a,b)=>facLvl(m,a)-facLvl(m,b));const k=m.p.discipline>60&&ks.includes('yard')?'yard':m.p.show>60&&ks.includes('stands')?'stands':ks[0];
      if(k&&m.coin>FAC_COST[facLvl(m,k)]*2.2){act('build');facBuild(m,k);unact()}}return}
    const k=PR.buildOrder.find(k=>facLvl(m,k)<3);if(!k)return;const c=FAC_COST[facLvl(m,k)];if(m.coin>=c+wagesOf(m)*PR.build+(PR.build?60:50)){act('build');try{facBuild(m,k)}catch(e){err('build',e)}unact()}};
  /* loans of fighters (343): careful lends a fit bench fighter in a good market week, 3 weeks */
  const lend=(used)=>{if(!PR.lend)return;try{if(typeof loan102Best!=='function'||(typeof lk106Past==="function"&&lk106Past(w)))return;const out=ros().filter(g=>g.loanFrom&&g.loanFrom.mid===m.id).length;if(out>=1)return;
    const bench=ros().filter(g=>!g.inj&&!g.loanFrom&&!used.has(g.id)&&!w.night.bouts.some(b=>b.ents.includes(g.id))).sort((a,b)=>effOvr(a)-effOvr(b));
    if(ros().length<=5)return;for(const g of bench){const B=loan102Best(w,g);if(B&&B.good&&B.fee>=6){act('loan');lendTo(g,B.m,B.fee,3);unact();break}}}catch(e){err('lend',e)}};
  /* --buy (Trades 2 study): once a week before the deadline, buy the best rival fighter the treasury can pay for through 23's own 1-for-1
     offer (ludusClick 'tradego' with every later wrapper: 378 settling-in, 393 deadline, 426 values + its one trade-in every 4 weeks, skipped while t112Wait>0): give my least valuable fighter + the
     coin gap (need − give) × 6 + 1, computed with the game's own tradeVal (given the house: 426's 3a) / opinion / greed rule; never a settling-in fighter (426's 4a). careful keeps its reserve; spendthrift none. */
  const buy=()=>{if(!BUY||PR.cpu)return;try{if(typeof lk106Past==='function'&&lk106Past(w))return;if(typeof t112Wait==='function'&&t112Wait(w)>0)return;/* 426: one trade-in every 4 weeks (the button is disabled; ludusClick would refuse) */const mine=ros().filter(g=>!g.loanFrom&&g.contract&&g.contract.mgr===m.id&&!(typeof set105Left==='function'&&set105Left(g)>0));if(!mine.length)return;
      const gm=mine.slice().sort((a,b)=>tradeVal(a)-tradeVal(b))[0];const budget=m.coin-(profile==='careful'?reserve():0);if(budget<=0)return;let best=null;
      for(const x of rivals()){if(x.envoyWk===w.week)continue;const R=rosterOf(x);const top=R.slice().sort((a,b)=>effOvr(b)-effOvr(a))[0];const op=opinionOf(x).v;const mult=1.06+(op<40?.18:0)-(op>=70?.06:0)+(x.p.greed-50)/400;
        for(const gt of R){if(gt.inj||gt.loanFrom||gt.lanista||gt.alive===false)continue;if(typeof set105Left==='function'&&set105Left(gt)>0)continue;if(R.length<=2&&top&&effOvr(gt)>=effOvr(top))continue;
          if(effOvr(gt)<effOvr(gm)+5)continue;const coin=Math.max(0,Math.ceil((tradeVal(gt)*mult-tradeVal(gm,x))*6)+1);if(coin>budget)continue;
          const sc=effOvr(gt)*100-coin/10;if(!best||sc>best.sc)best={x,gt,coin,sc}}}
      if(!best)return;let box=document.getElementById('sim2trade');if(!box){box=document.createElement('div');box.id='sim2trade';box.style.display='none';document.body.appendChild(box)}
      box.innerHTML=`<select id="trMine"><option value="${gm.id}" selected></option></select><select id="trTheirs"><option value="${best.gt.id}" selected></option></select><input id="trCoin" value="${best.coin}">`;
      const c0=m.coin,o0=effOvr(gm),o1=effOvr(best.gt),wg0=(gm.contract||{}).wage||0,wg1=(best.gt.contract||{}).wage||0;act('tradego');const p=ludusClick('tradego',best.x.id,null,{redraw:()=>{},say:()=>{}});unact();
      Promise.resolve(p).then(()=>{const okT=best.gt.contract&&best.gt.contract.mgr===m.id;(D.buys=D.buys||[]).push({s:w.season,wk:w.week,ok:okT?1:0,coin:okT?c0-m.coin:0,ask:best.coin,in:o1,out:o0,wIn:wg1,wOut:wg0});if(okT)known.set(best.gt.id,best.gt)}).catch(e=>err('buy',e));
      box.innerHTML=''}catch(e){err('buy',e)}};
  /* the money loan (66: Sica's syndicate, only in the red) */
  const loan=()=>{try{if(m.coin<0&&w.loanAsk&&!w.loan){const S=loanSizes(m);const amt=S.find(a=>m.coin+a>=wagesOf(m)*2)||S[S.length-1];act('loan');const L9=loanLender();w.loan={amt,base:amt,name:L9.name,kind:L9.kind,mgr:L9.mgr,wk:w.week};w.loanAsk=0;m.coin+=amt;unact();D.loans=(D.loans||0)+1}
    if(w.loan&&w.loan.amt>0){const need=(w.loan.due||0)-(w.loan.paid||0);const free=m.coin-wagesOf(m)*2;const pay=Math.min(w.loan.amt,free>=w.loan.amt?w.loan.amt:Math.max(need,0),Math.max(0,free));
      if(pay>0){act('loanpay');m.coin-=pay;unact();w.loan.amt-=pay;w.loan.paid=(w.loan.paid||0)+pay;if(w.loan.amt<=0){w.loan=null;w.loanDone=(w.loanDone||0)+1}}}}catch(e){err('loan',e)}};
  /* entries: my best fit fighter into each league bout it fits (replacing an unsigned entrant), as the old sim */
  const enter=()=>{const used=new Set();let nEnt=0;const eMax=K.entCpu?(Math.random()<.5?2:1):(K.entMax??3);const eFit=K.entFit??4;const eMor=K.entMorale??15;const TO=['main','feature','under'];
    for(const bo of [...w.night.bouts].sort((a,b)=>K.entCpu?TO.indexOf(a.tier)-TO.indexOf(b.tier):0)){if(bo.done||bo.po104||bo.wc109||(typeof any100Sp==='function'&&any100Sp(bo)))continue;const T=TIERS[bo.tier];if(!T)continue;
      if(bo.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id})){bo.ents.forEach(id=>used.add(id));continue}
      if(nEnt>=eMax)continue;if(K.entCpu&&Math.random()>=0.62+50/250)continue;
      const g=ros().filter(g=>!g.inj&&g.morale>eMor&&!(K.entFat!=null&&typeof gFat==='function'&&gFat(g)>K.entFat)&&!used.has(g.id)&&!g.loanFrom&&!bo.ents.includes(g.id)&&!(typeof r101Block==='function'&&r101Block(g))&&effOvr(g)>=T.lo-eFit&&effOvr(g)<=T.hi+2&&!(typeof inBed76==='function'&&inBed76(g))).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(!g)continue;
      const out=bo.ents.map(gById).filter(x=>x&&!x.contract).sort((x,y)=>effOvr(x)-effOvr(y))[0];if(!out)continue;bo.ents[bo.ents.indexOf(out.id)]=g.id;used.add(g.id);nEnt++}
    for(const bo of w.night.bouts)for(const id of bo.ents)used.add(id);return used};
  const specials=used=>{if(!PR.specials||typeof any100Book!=='function')return;w.night.bouts.forEach((bo,bi)=>{try{if(!any100Sp(bo)||bo.done||bo.ents.some(id=>any100Own(id,m)))return;
    const g=ros().filter(g=>!used.has(g.id)&&g.morale>15&&!any100Cur(w,g.id)&&!any100Why(w,bo,g)).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(!g||m.coin<bo.any100.fee*2+20)return;
    const mate=any100Team(bo)?ros().filter(x=>x.id!==g.id&&!used.has(x.id)&&!any100Cur(w,x.id)&&!any100Why(w,bo,x))[0]:null;
    if(any100Book(bi,g.id,any100Team(bo)?(mate?{k:'mine',gid:mate.id}:{k:'ed'}):null).ok){used.add(g.id);if(mate)used.add(mate.id)}}catch(e){err('any',e)}})};
  /* wagers (17 'bet' handler): the spendthrift stakes a share of the treasury on his own entrant */
  const bets=()=>{if(!PR.bets)return;w.night.bouts.forEach((bo,bi)=>{try{if(bo.done||bo.rig)return;const i=bo.ents.findIndex(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id});if(i<0)return;
    const odds=boutOdds(bo)[i];const st=Math.min(betMaxStake(odds,m.coin),Math.floor(m.coin*PR.bets));if(st<2)return;act('bet');m.coin-=st;unact();
    bo.bets.push({gid:bo.ents[i],stake:st,odds,bid:typeof betRec==='function'?betRec({src:'mgr',ev:`m:${w.id}:${w.week}`,season:w.season,week:w.week,dayOff:0,min:600,city:LOCATIONS[w.night.loc].n,who:m.name,kind:'you',on:'sim',stake:st,odds}):null})}catch(e){err('bet',e)}})};
  /* the road (35 + 360): pay or take the deal, then set off — the week's bouts are locked until then (397) */
  const travel=()=>{try{const t=typeof travelState==='function'?travelState(w):null;if(!t||!(t.cost>0)||t.gone)return;
    if(!t.paid&&t.offer&&!PR.cpu){const dg=gById(t.offer.gid);if(dg&&w.night.bouts.some(b=>!b.done&&b.ents.includes(dg.id)))travelClick('traveldeal');else if(profile==='careful'&&m.coin<t.cost+reserve()&&dg&&!dg.inj){/* take the deal and put him in */const bo=w.night.bouts.find(b=>!b.done&&!b.po104&&!b.wc109&&TIERS[b.tier]&&b.ents.some(id=>{const x=gById(id);return x&&!x.contract}));if(bo){const o=bo.ents.map(gById).filter(x=>x&&!x.contract)[0];bo.ents[bo.ents.indexOf(o.id)]=dg.id;travelClick('traveldeal')}}}
    if(!t.paid&&m.coin>=t.cost)travelClick('travelpay');
    if(t.paid){if(typeof mw105Go==='function')mw105Go(w);else t.gone=true}
    if(typeof bt106Locked==='function'&&bt106Locked()){D.travelStuck++;t.gone=true}}catch(e){err('travel',e)}};
  /* the pending verdicts (17 catchUpWeeks' rule; blood by profile) */
  const settle=()=>{let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];const g=gById(P.gid);try{
      if(P.t==='thumb')settlePending(0,null,{d6:1+Math.floor(Math.random()*6),d12:1+Math.floor(Math.random()*12)});
      else if(P.t==='blood'){let pay=PR.blood==='always'?m.coin>=P.price:PR.cpu?(g&&effOvr(g)>=58&&m.coin>=P.price+20):(g&&effOvr(g)>=58&&m.coin>=P.price+reserve());
        if(K.blood==='always')pay=m.coin>=P.price;else if(K.blood==='never')pay=false;
        else if(K.blood==='smart'){const R=ros().slice().sort((a,b)=>effOvr(a)-effOvr(b));const worst=R.length>4&&R[0]===g;pay=!!g&&!worst&&m.coin>=P.price+wagesOf(m)*2}
        settlePending(0,pay?'pay':'let')}
      else settlePending(0,'stay')}catch(e){err('pend',e);w.pend.shift()}}};
  /* ------------------------------------------------ Winter Quarters ------------------------------------------------ */
  const winter=async()=>{const r={};try{if(typeof a109Ensure==='function')a109Ensure(w)}catch(e){err('a109Ensure',e)}
    try{if(typeof wqSeal==='function'){const t=wqSeal(w,m);r.seal=t}}catch(e){err('seal',e)}
    /* 348 raises / leave asks */
    try{const P=po104P(w);for(const x of (P&&P.ren||[]).filter(x=>!x.st)){const g=gById(x.gid);if(!g)continue;let yes;
      if(x.kind==='raise'){if(PR.cpu)yes=m.coin>=x.wage*8;else if(profile==='spendthrift')yes=true;else{const R=ros().slice().sort((a,b)=>effOvr(b)-effOvr(a));const rank=R.indexOf(g);yes=(rank<4||R.length<=4)&&x.wage<=Math.max(8,x.old*PR.renewX)&&m.coin>=x.wage*4}}
      else{const R=ros().slice().sort((a,b)=>effOvr(b)-effOvr(a));yes=R.indexOf(g)>=4||(profile==='careful'&&R.length>5)}
      po104Answer(w,P,g.id,!!yes)}}catch(e){err('ren',e)}
    /* the free promotion */
    try{if(typeof a109Promote==='function')for(const k of ['recruiter','doctore','medicus','clerk','consilium','barracks'])if(a109Promote(w,k)){r.promo=k;break}}catch(e){err('promo',e)}
    /* the camp */
    try{if(typeof a109Camp==='function'){const c=a109Camp(w,PR.camp);if(!c&&typeof a109S==='function')a109S(w).focus=PR.camp;r.camp=!!c}}catch(e){err('camp',e)}
    /* winter works */
    try{build()}catch(e){err('wbuild',e)}
    /* the winter market (a109Gen intake), then the open market */
    try{const I=typeof a109Intake==='function'?a109Intake(w):[];r.intake=I.length;const n0=D.signed;recruit(I.length?I:null);recruit();r.signedW=D.signed-n0}catch(e){err('wmarket',e)}
    try{care()}catch(e){err('wcare',e)}
    /* the Winter Classic */
    try{if(typeof wcEnsure==='function'||typeof window.wc109Ensure==='function'){const C=window.wc109Ensure(w);if(C)r.wcSt=C.st;if(C&&!C.st){r.wcSt0=C.st;if(PR.wcIn){const el=po104Fits(w,m,new Set());r.wcFits=el.length;r.wcRos=ros().length;r.wcFrozen=ros().filter(g=>typeof lk106OnRoster==='function'&&typeof lk106Past==='function'&&lk106Past(w)&&!lk106OnRoster(w,m,g)).length;const g=el.slice().sort((a,b)=>effOvr(b)-effOvr(a))[0];if(g)window.wc109Answer(w,'in',g.id);else window.wc109Answer(w,'out')}else window.wc109Answer(w,'out')}
      await window.wc109Finish(w);const C2=window.wc109Ensure(w)||w.wc109;if(C2){const mk='m:'+m.id;const seat=(C2.seats||[]).findIndex(s=>s.k===mk);r.wc={st:C2.st,fin:!!(C2.fin&&C2.fin.includes(seat)),champ:C2.champ!=null&&C2.champ===seat&&seat>=0,paid:C2.paid}}}}catch(e){err('classic',e)}
    settle();return r};
  /* ------------------------------------------------ the loop ------------------------------------------------ */
  const rows=[];const s0=w.season;let cur=null;const known=new Map();
  const newSeason=()=>{cur={season:w.season,start:m.coin,curve:[],wages:0,min:m.coin,red:0,deaths:0,retired:0,freed:0,walked:0,signed0:D.signed,perk0:m.perkPts||0,ent:0,fw:0,wc:null,rank:null,pts:null,winter:null,rivWk:{}}};
  newSeason();for(const g of ros())known.set(g.id,g);
  /* ------------------------------------------------ deaths112 logging (sim-side wrappers; the game's functions still do the work) ------------------------------------------------
     row.dx per season: fr = every league Fate call [house P/C/F, tier (under/feature/main/spec/wc), OVR, CF, final verdict, alive on the sand 0/1, rookie 0/1, morale]
       (P verdicts settle later: p-thumb/p-blood are rewritten to spared/bought/killed) · dl = the player's deaths {wk,tier,ev,cf,path,ovr,fame,ev#,price,coin,res,why}
       · pend = the player's thumb/blood tallies · rivD = rival deaths by path · ent = entries {P, C (all rivals), cw (rival-weeks)} · join = new fighters
       {P:[[ovr,stars,req,houseFame,how]], C:{stars:n}} · byp = fame-gate bypass signings · rr = weekly roster rating (top-5 mean) {me, riv (mean of rivals)} */
  const DXmk=()=>({fr:[],dl:[],pend:{thumb:0,spared:0,down:0,blood:0,pay:0,let:0,payCoin:0},rivD:{},ent:{P:0,C:0,cw:0},join:{P:[],C:{}},byp:0,rr:{me:0,riv:0,n:0},rivFame:0});
  const DX=()=>{if(!cur.dx)cur.dx=DXmk();window.__DX=cur.dx;return cur.dx};
  const kindOf=mg=>mg?(mg.isPlayer?'P':(mg.sica?'S':'C')):'F';
  const PCTX=new Map();let FCTX=null;const KILLED=new Set();
  {const base=leagueFate;leagueFate=function(glad,row,mgr,bout,boutIdx,opt){const k=kindOf(mgr);const tier=bout?(bout.wc109?'wc':(TIERS[bout.tier]?bout.tier:'spec')):'spec';
    const c={k,tier,ev:bout?bout.ev:'',cf:(row&&row.f)||0,ovr:effOvr(glad),fame:glad.fame||0,n:(glad.rec&&glad.rec.ev)||0,mor:Math.round(glad.morale||0),wk:w.week};
    const prev=FCTX;FCTX=c;let r;try{r=base.apply(this,arguments)}finally{FCTX=prev}
    try{const d=DX();const i=d.fr.push([k,tier,c.ovr,c.cf,(r&&r.vd)||'',row&&row.alive===false?0:1,c.n<=3?1:0,c.mor])-1;if(k==='P'&&r&&/^p-(thumb|blood)$/.test(r.vd))PCTX.set(glad.id,{...c,fi:i,d,path:r.vd==='p-thumb'?'thumb':'cond'})}catch(e){err('dxFate',e)}
    return r};window.leagueFate=leagueFate}
  {const base=settlePending;settlePending=function(pi,choice,extra){const P=(w.pend||[])[pi];const g=P?gById(P.gid):null;const coin0=m.coin;const C=P&&g?PCTX.get(g.id):null;
    const r=base.apply(this,arguments);
    try{if(P&&g&&(P.t==='thumb'||P.t==='blood')){const d=C?C.d:DX();
      if(P.t==='thumb'){d.pend.thumb++;const nb=(w.pend||[]).find(x=>x.t==='blood'&&x.gid===g.id);if(nb){d.pend.down++;if(C)C.path='thumb'}else{d.pend.spared++;if(C){d.fr[C.fi][4]='spared';PCTX.delete(g.id)}}}
      else{d.pend.blood++;if(g.alive!==false){d.pend.pay++;d.pend.payCoin+=coin0-m.coin;if(C){d.fr[C.fi][4]='bought';PCTX.delete(g.id)}}
        else{d.pend.let++;if(C){d.fr[C.fi][4]='killed';const R=ros().slice().sort((a,b)=>effOvr(a)-effOvr(b));
          d.dl.push({wk:C.wk,tier:C.tier,ev:C.ev,cf:C.cf,path:C.path==='thumb'?'thumb':'cond',ovr:C.ovr,fame:C.fame,n:C.n,price:P.price,coin:coin0,res:Math.round(reserve()),why:choice==='pay'?'pay-refused':(coin0<P.price?'no-coin':effOvr(g)<58?'ovr<58':'reserve')});PCTX.delete(g.id)}}}}}catch(e){err('dxPend',e)}
    return r};window.settlePending=settlePending}
  {const base=killFighter;killFighter=function(glad,mgr){const k=kindOf(mgr);try{KILLED.add(glad.id);if(k==='C'||k==='S'){const d=DX();const t=FCTX?FCTX.tier:'other';d.rivD['bout:'+t]=(d.rivD['bout:'+t]||0)+1}}catch(e){}return base.apply(this,arguments)};window.killFighter=killFighter}
  /* the player's signings through 17 signGlad: rating, stars, the fame gate and the house's fame at the time */
  {const base=signGlad;signGlad=function(glad,wage){try{const d=DX();d.join.P.push([effOvr(glad),starsOf(effOvr(glad)),reqFame(glad),Math.round(m.fame||0),wage>=askWage(glad)*1.3&&m.fame<reqFame(glad)?'bypass':'sign'])}catch(e){}return base.apply(this,arguments)};window.signGlad=signGlad}
  /* the week's snapshot: every house's roster (deaths that skip killFighter: festering wounds, flight from the infirmary, the war) */
  let SNAP=new Map();
  const dxWeekStart=()=>{DX();SNAP=new Map();for(const x of w.mgrs){if(x.dead)continue;for(const g of rosterOf(x))SNAP.set(g.id,{g,k:kindOf(x)})}};
  const dxAfterBouts=()=>{try{const d=DX();const R=rivals();d.ent.cw+=R.length;for(const b of w.night.bouts){if(!b.done||b.wc109)continue;for(const id of b.ents){const g=gById(id);const c=g&&(g.contract||(g.fallen105?{mgr:g.fallen105.mgr}:null));if(!c)continue;const x=mgrById(c.mgr);if(!x)continue;const k=kindOf(x);if(k==='P')d.ent.P++;else if(k==='C')d.ent.C++}}}catch(e){err('dxEnt',e)}};
  const pathOf=g=>{const t=((g.hist||[])[0]||{}).txt||'';return /untreated/.test(t)?'untreated':/fled the infirmary/.test(t)?'fled':/war/.test(t)?'war':/died at|condemned|Fate|·/.test(t)?'bout':'other'};
  const dxWeekEnd=()=>{try{const d=DX();
      for(const [id,{g,k}] of SNAP){if(g.alive!==false||g.freed2||g.retired)continue;if(KILLED.has(id))continue;
        const p=pathOf(g);if(k==='P')d.dl.push({wk:w.week,tier:'-',path:p,ovr:effOvr(g),fame:g.fame||0,n:(g.rec&&g.rec.ev)||0});else if(k==='C')d.rivD[p]=(d.rivD[p]||0)+1}
      KILLED.clear();
      for(const x of w.mgrs){if(x.dead)continue;const k=kindOf(x);if(k!=='C')continue;for(const g of rosterOf(x))if(!SNAP.has(g.id)){const st=starsOf(effOvr(g));d.join.C[st]=(d.join.C[st]||0)+1}}
      const R=rivals();if(R.length){d.rr.me+=rosterRating(m);d.rr.riv+=R.reduce((a,x)=>a+rosterRating(x),0)/R.length;d.rr.n++;d.rivFame=Math.round(R.reduce((a,x)=>a+(x.fame||0),0)/R.length)}}catch(e){err('dxEnd',e)}};
  const roll=()=>{for(const [id,g] of known){if(g.contract&&g.contract.mgr===m.id)continue;if(g.loanFrom&&g.loanFrom.mid===m.id)continue;known.delete(id);
      if(g.alive===false){if(g.freed2)cur.freed++;else if(g.retired||g.c104ret)cur.retired++;else cur.deaths++}else cur.walked++}
    for(const g of ros())known.set(g.id,g)};
  const t0=Date.now();let k=0,fails=0;
  while(w.season<s0+SEASONS&&k++<SEASONS*24){if(w.dead||m.dead)break;rivInstall();plInstall();try{keyedRandom((seed*7919+w.season*131+w.week*17+k)>>>0);(0,eval)('RNG=null')}catch(e){}if(DBG){DBG.cur=w.season+':'+k;DBG.wrap()}NS.n=0;if(DBG){DBG.gs=DBG.gs||{};DBG.gs[w.season+':'+k+'0']=w.glads.map(g=>[g.id,g.ovr,g.morale,g.fat,g.inj&&g.inj.until,g.contract&&[g.contract.mgr,g.contract.wage,g.contract.weeks],g.alive,Math.round((statOvr(g)||0)*100)].join(',')).join(';')}try{LED109.act=null}catch(e){}
    const ph=typeof po104Ph==='function'?po104Ph(w):'';const off=ph==='off';const label=off?'W':ph==='r1'?'P1':ph==='sf'?'P2':ph==='fin'?'P3':String(typeof wkOf==='function'?wkOf(w.week):w.week);
    if(off&&cur.rank==null){try{const L=leagueSort(w.mgrs.filter(x=>!x.dead&&!x.sica),cur.season);cur.rank=L.indexOf(m)+1;cur.houses=L.length;cur.pts=(msp(m,cur.season)||{}).pts||0}catch(e){err('rank',e)}}
    let used=new Set();dxWeekStart();
    try{if(off){cur.winter=await winter()}else{
      loan();renew();fameBuy();recruit();buy();care();morale();sponsors();if(typeof arm94AutoShop==='function'){/* the game's own shopping rule (the rivals' too); the careful house shops only above its reserve (225's playerReserve knob) */const pr0=ARM94.playerReserve;if(profile==='careful')ARM94.playerReserve=Math.max(pr0,reserve());act('repair');try{arm94AutoShop(w,m,{player:true})}finally{unact();ARM94.playerReserve=pr0}}yard();build();
      used=enter();specials(used);lend(used);travel();bets();
      if(w.special&&!w.special.done&&typeof specAutoRun==='function'){try{await specAutoRun()}catch(e){err('spec',e)}}
      const seq=typeof any100Seq==='function'?any100Seq(w.night):w.night.bouts.map((b,i)=>i);for(const i of seq)if(!w.night.bouts[i].done){try{await runBoutSim(i)}catch(e){err('bout',e)}}
      if(w.night.bouts.some(b=>!b.done))D.locked++;D.off=(D.off||0)+w.night.bouts.filter(b=>b.done&&!b.res).length;D.bouts=(D.bouts||0)+w.night.bouts.length;settle();dxAfterBouts()}}catch(e){err('week',e)}
    cur.wages+=wagesOf(m);
    {const mine=new Set(ros().map(g=>g.id));const e=w.night.bouts.filter(b=>b.done).reduce((t,b)=>t+b.ents.filter(id=>mine.has(id)).length,0);cur.ent+=e;cur.fw+=mine.size;}
    /* let the bouts' async tails unwind before the week's end (13-sim does the same between sims) */
    for(let i=0;i<3;i++)await sleep(0);await sleep(15);
    const fpk=w.season+':'+k;const GS=()=>w.glads.map(g=>[g.id,g.ovr,g.morale,g.fat,g.inj&&g.inj.until,g.contract&&[g.contract.mgr,g.contract.wage,g.contract.weeks],g.alive,Math.round((statOvr(g)||0)*100)].join(',')).join(';');if(DBG){DBG.fp=DBG.fp||{};DBG.gs=DBG.gs||{};DBG.gs[fpk+'a']=GS();DBG.fp[fpk]={pre:JSON.stringify({b:w.night.bouts.map(b=>[b.ev,b.ents,b.res&&b.res.rows&&b.res.rows.map(r=>[r.gid,r.place,r.f,r.vd])]),c:w.mgrs.map(x=>x.coin),n:w.glads.length,fa:freeAgents().length,pend:(w.pend||[]).length})}}
    if(DBG)DBG.gs[fpk+'b']=GS();
    let ok=false;try{ok=await endWeek()}catch(e){err('endWeek',e)}
    if(DBG){DBG.fp[fpk].post=JSON.stringify({c:w.mgrs.map(x=>x.coin),n:w.glads.length,a:w.glads.filter(g=>g.alive).length,fa:freeAgents().length,ros:w.mgrs.map(x=>rosterOf(x).length)})}
    if(ok===false){settle();try{for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i)}catch(e){}settle();try{ok=await endWeek()}catch(e){err('endWeek2',e)}}
    if(ok===false){fails++;D.stall++;if(fails>=3){err('stall','endWeek refused 3x at '+label+' '+JSON.stringify({pend:(w.pend||[]).map(p=>p.t),left:w.night.bouts.filter(b=>!b.done).length,spec:!!(w.special&&!w.special.done),lock:typeof bt106Locked==='function'&&bt106Locked()}));break}continue}fails=0;
    roll();dxWeekEnd();cur.curve.push([label,m.coin,ros().length]);cur.min=Math.min(cur.min,m.coin);if(m.coin<0)cur.red++;
    for(const x of rivals()){const v=cur.rivWk[x.id];cur.rivWk[x.id]=v==null?x.coin:Math.min(v,x.coin)}
    {const sc=w.mgrs.find(x=>x.sica);if(sc)D.sicaMin=D.sicaMin==null?sc.coin:Math.min(D.sicaMin,sc.coin)}
    if(w.season!==cur.season||w.dead){const S=cur.season;
      const L=w.led109&&w.led109.s===S?w.led109:(w.led109h||[]).find(x=>x.s===S);
      cur.led=L?JSON.parse(JSON.stringify(L.c)):null;cur.ledPart=L?L.part:null;
      cur.end=m.coin;cur.roster=ros().length;cur.signed=D.signed-cur.signed0;cur.perk=(m.perkPts||0)-cur.perk0;cur.renownLv=(m.renown||{}).lv||0;cur.ren=REN.s[S]||{};cur.ptag=PL[S]||{};
      const RM=RMIN[S]||{};const ids=rivals().map(x=>x.id);const mins=ids.map(id=>Math.min(RM[id]==null?1e9:RM[id],cur.rivWk[id]==null?1e9:cur.rivWk[id]));const wk=ids.map(id=>cur.rivWk[id]==null?1e9:cur.rivWk[id]);
      cur.rivals={n:ids.length,min:Math.min(...mins),lt30:mins.filter(v=>v<30).length,lt0:mins.filter(v=>v<0).length,minWk:Math.min(...wk),lt30wk:wk.filter(v=>v<30).length,lt0wk:wk.filter(v=>v<0).length,avgEnd:Math.round(avg(rivals().map(x=>x.coin))),led:RL[S]||{}};
      cur.bankrupt=w.dead?{s:w.dead.season,wk:w.dead.week,why:w.dead.why}:null;cur.facSum=facSum(m);cur.fame=m.fame;cur.wins=m.wins;
      const {rivWk,...row}=cur;rows.push(row);if(w.dead)break;newSeason()}}
  /* the 413 ledger for the season that was still running when the run stopped (bankrupt / stall) */
  if(cur&&cur.curve.length&&!rows.some(r=>r.season===cur.season)){const L=w.led109&&w.led109.s===cur.season?w.led109:null;cur.led=L?JSON.parse(JSON.stringify(L.c)):null;cur.ptag=PL[cur.season]||{};cur.roster=ros().length;cur.end=m.coin;cur.partial=1;cur.bankrupt=w.dead?{s:w.dead.season,wk:w.dead.week,why:w.dead.why}:null;const {rivWk,...row}=cur;rows.push(row)}
  return {rows,diag:{...D,ms:Date.now()-t0,weeks:k,dbg:DBG?DBG.wk:undefined,fp:DBG?DBG.fp:undefined,cfg:DBG?window.__DBGC:undefined,gs:DBG?DBG.gs:undefined}}};

/* ------------------------------------------------------------------ the node side ------------------------------------------------------------------ */
(async()=>{const t0=Date.now();let done=0;const times=[];
  const worker=async wi=>{let b=await chromium.launch();try{while(jobs.length){const J=jobs.shift();const ts=Date.now();
      if(!b.isConnected()){say(`[w${wi}] browser gone, relaunching`);b=await chromium.launch()}const ctx=await b.newContext();const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const perr=[];pg.on('pageerror',e=>perr.push(e.message));
      let res;try{if(!REALTIME)await pg.addInitScript(VTIME,1790000000000+J.s*1e9);await T.boot(pg,{seed:J.s,ls:{flavius_lfpool:'0',...LS}});await pg.goto('file://'+PAGE,{timeout:120000});await T.ready(pg,120000);await pg.waitForFunction(()=>typeof CROWD_CACHE!=='undefined'&&CROWD_CACHE.length>=140,null,{timeout:15000}).catch(()=>{});
        res=await pg.evaluate(SIM,{profile:J.p,seed:J.s,SEASONS,START,PATCH,BUY,SIMK})}catch(e){res={err:String(e.message||e).slice(0,300)}}
      try{await ctx.close()}catch(e){say(`ctx.close: ${String(e.message||e).slice(0,120)}`)}const ms=Date.now()-ts;times.push(ms);done++;
      if(res.err||!res.rows){say(`ERR ${J.p} seed ${J.s}: ${res.err}`);if(outF)fs.writeSync(outF,JSON.stringify({tag:TAG,profile:J.p,seed:J.s,err:res.err})+'\n');continue}
      for(const r of res.rows){const row={tag:TAG,profile:J.p,seed:J.s,...r,diag:{...res.diag,perr:perr.slice(0,3)}};if(outF)fs.writeSync(outF,JSON.stringify(row)+'\n');else console.log(JSON.stringify(row))}
      const last=res.rows[res.rows.length-1]||{};say(`[w${wi}] ${done} ${J.p} seed ${J.s}: ${res.rows.length} season(s) end ${last.end} min ${Math.min(...res.rows.map(r=>r.min))} rank ${res.rows.map(r=>r.rank).join('/')} · ${(ms/1000).toFixed(0)} s · stuck ${res.diag.travelStuck} locked ${res.diag.locked} stall ${res.diag.stall} errs ${res.diag.errs.length}${res.diag.errs.length?' '+res.diag.errs[0]:''}`)}}
    finally{try{await b.close()}catch(e){}}};
  await Promise.all(Array.from({length:PAR},(_,i)=>worker(i)));
  say(`DONE ${done} run(s) in ${((Date.now()-t0)/60000).toFixed(1)} min · avg ${(times.reduce((a,b)=>a+b,0)/Math.max(1,times.length)/1000).toFixed(0)} s/run`);if(outF)fs.closeSync(outF)})();
