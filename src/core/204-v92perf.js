/* 204-v92perf — v0.92 performance pass, part 2 (part 1 = 00b-perf, which files the UI sweeps in PERF92.tasks).
   Measured idle before (headless, 1440×900): ~150–200 ms of main-thread work every second on the menu, a match waiting for you,
   and the Manager — scripts only 3–15 ms of it; the rest was the endless CSS pulses/glows repainting every frame.
   • ONE HEARTBEAT (perf92Beat, ≤4 a second; 1 a second when idle). While the player is busy (input or activity in the last 10 s)
     every sweep keeps its own pace, all on that one timer. When quiet it runs a sweep only when something changed since its last run
     (perf92Mark: input, render, log, a window, a toast, beginTurn, MGR_REDRAW / studioRedraw / onlRedraw, the menu, or the cheap
     state signature perf92Sig — event, phase, round, rotation, over, the open window, the menu, Manager tab, the city) or when its
     longest wait ran out (2× its own delay, at least 1 s; 5 s when idle) — never more often than it asked for. Nothing runs while
     the tab is hidden (the clean return runs them all once).
   • IDLE (body.idle92): 2 min without input AND without game activity (a CPU turn, the log, a window, a redraw…). Every CSS
     animation pauses (they are the endless decorative pulses by then), sweeps slow to 1 a second, the city square stops
     walking its crowd, the night torches stop flickering. Any input or activity wakes it at once.
   • CLEAN RETURN (perf92Return): the tab comes back (visibilitychange) or the heartbeat finds a gap over 5 s (sleep, a frozen
     tab): stale board effects are dropped (no burst of old numbers/lines), one render + draw, the open Manager / Studio /
     Online window redrawn, every sweep once, a dead online socket reconnected (music: 54-v51 + 21-audio already resume it cleanly).
   • flavius_perf92off=1 → nothing here runs (00b did not patch the timers either). */
const PERF92_IDLE_MS=120000,PERF92_BUSY_MS=10000;
function perf92Mark(){PERF92.seq++;PERF92.lastAct=performance.now();if(PERF92.idle)perf92Wake()}
function perf92Input(){PERF92.lastInput=performance.now();perf92Mark()}
function perf92Sig(){let s='';try{s+=(typeof S!=='undefined'&&S?[S.seed,S.phase,S.ri,S.rotation,S.over?1:0,S.cur].join(','):'-')}catch(e){}
  try{s+='|'+(typeof CUR_MODAL!=='undefined'&&CUR_MODAL?1:0)+(document.getElementById('modal')||{}).hidden}catch(e){}
  try{const m=document.getElementById('mainMenu');s+='|'+(m?m.hidden:'')}catch(e){}
  try{if(typeof MGR!=='undefined'&&MGR)s+='|'+(MGR.world?MGR.world.id+':'+MGR.world.week:'')+':'+MGR.tab}catch(e){}
  try{if(typeof CITY!=='undefined'&&CITY)s+='|'+(CITY.open?1:0)}catch(e){}
  return s}
function perf92Run(t){t.last=performance.now();t.seq=PERF92.seq;t.runs++;PERF92.runs++;
  try{t.f.apply(window,t.a)}catch(e){setTimeout(()=>{throw e},0)}}  /* an error still reaches the page like a real timer's */
function perf92Idle(on){if(PERF92.idle===on)return;PERF92.idle=on;try{document.body.classList.toggle('idle92',on)}catch(e){}}
function perf92Wake(){perf92Idle(false);if(PERF92.beatT){PERF92.real.clearTimeout(PERF92.beatT);PERF92.beatT=0}PERF92.beatT=setTimeout(perf92Beat,0)}
function perf92Beat(manual){if(!manual)PERF92.beatT=0;const now=performance.now();const gap=PERF92.hbAt?now-PERF92.hbAt:0;PERF92.hbAt=now;
  try{if(gap>5000&&!document.hidden&&!manual)perf92Return('gap')}catch(e){console.error(e)}
  const sig=perf92Sig();if(sig!==PERF92.sig){PERF92.sig=sig;PERF92.seq++;PERF92.lastAct=now}
  PERF92.hidden=document.hidden;
  const quietFor=now-Math.max(PERF92.lastInput,PERF92.lastAct);perf92Idle(!PERF92.hidden&&quietFor>PERF92_IDLE_MS);
  /* busy (input or activity in the last 10 s): every sweep at its own pace · quiet: only after a change, else its longest wait · idle: ≤1 a second */
  const mode=PERF92.idle?'idle':quietFor<PERF92_BUSY_MS?'busy':'quiet';PERF92.mode=mode;let next=1000;
  if(!PERF92.hidden){
    for(const t of PERF92.tasks.slice()){if(t.dead)continue;const since=now-t.last;
      const minGap=mode==='idle'?Math.max(t.d,1000):t.d,maxGap=mode==='idle'?5000:mode==='busy'?t.d:Math.max(2*t.d,1000);
      if(since>=minGap-30&&(t.seq<PERF92.seq||since>=maxGap-30)){perf92Run(t);next=Math.min(next,minGap)}else next=Math.min(next,Math.max(minGap-since,mode==='busy'?maxGap-since:250))}}
  if(!manual)PERF92.beatT=setTimeout(perf92Beat,PERF92.idle||PERF92.hidden?1000:Math.max(250,Math.min(1000,next)))}  /* manual = the soak test's compressed hours */
/* the tab is back (or the page slept): one clean frame, no catch-up burst */
function perf92Return(why){PERF92.returns++;PERF92.lastReturn=why;const now=performance.now();
  try{for(const A of [typeof FX!=='undefined'?FX:null,typeof FXL!=='undefined'?FXL:null,typeof HITFX!=='undefined'?HITFX:null]){if(!A)continue;
    for(let i=A.length-1;i>=0;i--){const x=A[i];if(x&&x.t0!=null&&x.dur!=null&&x.t0+x.dur<now)A.splice(i,1)}}}catch(e){}
  try{if(typeof S!=='undefined'&&S&&S.tosses)S.tosses=S.tosses.filter(q=>!(q.t0!=null&&q.dur!=null&&q.t0+q.dur+50<now))}catch(e){}
  try{if(typeof S!=='undefined'&&S&&S.phase&&S.phase!=='setup'&&typeof render==='function')render()}catch(e){}
  try{if(typeof draw==='function')draw()}catch(e){}
  try{if(document.getElementById('mgrBody')&&typeof MGR_REDRAW==='function')MGR_REDRAW()
    else if(document.getElementById('studio')&&typeof studioRedraw==='function')studioRedraw()
    else if(document.getElementById('onl')&&typeof onlRedraw==='function')onlRedraw()}catch(e){}
  for(const t of PERF92.tasks.slice())if(!t.dead)perf92Run(t);
  /* music needs nothing here: 54-v51 suspends/resumes the context on visibility and 21-audio's v0.91 lookahead skips the hidden backlog */
  /* online: a socket that died while away (its own retries gave up) comes back the same way 114 reconnects */
  try{if(typeof NETWS!=='undefined'&&NET&&NET.mode==='ws'&&NETWS.ws&&NETWS.ws.readyState===3&&!NETWS.closedFor&&
    (document.getElementById('onl')||(typeof onlmOn==='function'&&onlmOn()))){NETWS.ws=null;NETWS.open=null;
      NETWS.connect().then(()=>{NET.emit('net.back',{});if(typeof onlmOn==='function'&&onlmOn()&&typeof onlmCatchUp==='function')onlmCatchUp()}).catch(()=>{})}}catch(e){}
  perf92Mark()}
if(!PERF92.off){
  /* activity signals (draw is NOT one: decorative loops call it) */
  {const base=render;render=function(){perf92Mark();return base.apply(this,arguments)}}
  {const base=log;log=function(){perf92Mark();return base.apply(this,arguments)}}
  {const base=modal;modal=function(){perf92Mark();return base.apply(this,arguments)}}
  {const base=beginTurn;beginTurn=function(){perf92Mark();return base.apply(this,arguments)}}
  {const base=mToast;mToast=function(){perf92Mark();return base.apply(this,arguments)}}
  {const base=studioRedraw;studioRedraw=function(){perf92Mark();return base.apply(this,arguments)}}
  {const base=onlRedraw;onlRedraw=function(){perf92Mark();return base.apply(this,arguments)}}
  {const base=menuShow;menuShow=function(){perf92Mark();return base.apply(this,arguments)}}
  {const base=menuHide;menuHide=function(){perf92Mark();return base.apply(this,arguments)}}
  /* MGR_REDRAW is a window property set each time the Manager opens */
  try{let cur=window.MGR_REDRAW;Object.defineProperty(window,'MGR_REDRAW',{configurable:true,enumerable:true,get(){return cur},
    set(v){cur=typeof v==='function'?function(){perf92Mark();return v.apply(this,arguments)}:v}});if(typeof cur==='function')window.MGR_REDRAW=cur}catch(e){}
  for(const ev of ['pointerdown','pointerup','keydown','keyup','wheel','touchstart','input','change','click','focusin'])document.addEventListener(ev,perf92Input,{capture:true,passive:true});
  {let pmT=0;document.addEventListener('pointermove',()=>{const n=performance.now();if(n-pmT<100)return;pmT=n;perf92Input()},{capture:true,passive:true})}
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){PERF92.hbAt=performance.now();perf92Return('visible');perf92Wake()}});
  /* idle: the city square holds still (its rAF keeps ticking, nothing moves or draws); the night torches stop flickering (189) */
  if(typeof cityLoop==='function'){const base=cityLoop;cityLoop=function(ts){if(PERF92.idle&&typeof CITY!=='undefined'&&CITY.open){CITY.lastT=performance.now();CITY.raf=requestAnimationFrame(cityLoop);return}return base.apply(this,arguments)}}
  PERF92.sig=perf92Sig();PERF92.beatT=setTimeout(perf92Beat,250);
  const st=document.createElement('style');st.textContent='body.idle92 *,body.idle92 *::before,body.idle92 *::after{animation-play-state:paused!important}';document.head.appendChild(st);
}
