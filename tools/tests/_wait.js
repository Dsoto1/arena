/* v1.08c helper (NOTES item 1, his 1a): seeded test worlds + semantic waits, TEST-SIDE only (no game change).
   A "_" file is a helper, not a test (testlist.js lists t*.js only); smartreg's depsOf re-runs every test that requires it.

   const T=require('./_wait');
   await T.boot(pg,{seed:1});            init script: navigator.webdriver=false, flavius_firstrun='shown' (+ ls; menu:false = leave those
                                         two to the test's own init script), the in-page __W,
                                         Math.random seeded (mulberry32), and once the game script has run: newWorld() gets a fixed
                                         world id (Date.now frozen to a fixed epoch during the call; the seeded event dice RNG put aside)
                                         and a fresh seeded Math.random for the call → the same world every run; after it a fresh
                                         seeded stream again (or the test's own Math.random when it installed one, e.g. tv95c);
                                         newState without a seed gets one derived from the boot seed. Async gaps let cosmetic draws in:
                                         a test that needs a later step fixed calls __W.seed(n) (and puts RNG aside for rnd(), tv104e).
                                         seed:false = waits only, nothing seeded.
   await T.ready(pg)                     FLAVIUS_READY after goto
   await T.until(pg,'what',fn,arg,ms)    poll fn(arg) in the page; true, or false after printing
                                         "WAIT <what> timed out after N ms {state dump}" (S, SPEED, modal, PACE96, camera, AIM106, V108, A93…)
   Predicates (node side, each = until with a name):  T.turnReady(pg,{human})  T.boardIdle(pg)  T.drawSettled(pg)  T.aimReady(pg,['__A','__B'],pts)
     T.popupSettled(pg)  T.saveMark(pg) → T.saveDone(pg,mark,kind)  T.spritesReady(pg)  T.mgrDrawn(pg,sel)
   In the page (inside pg.evaluate): await __W.until(()=>cond,'what',ms) · __W.turnReady() · __W.boardIdle() · __W.frames(n)
     · __W.popupSettled() · __W.mgrDrawn(sel) · __W.saveMark()/__W.saveDone(mark,kind) · __W.seed(n) · __W.dump(). A timeout inside
     the page prints the same WAIT line (boot forwards it from the page console). */
const PAGE=function(o){
  if(window.__W)return; /* boot() twice on one page: the first one stands */
  if(o.menu!==false)try{Object.defineProperty(navigator,'webdriver',{get:()=>false})}catch(e){}
  try{if(o.menu!==false)localStorage.setItem('flavius_firstrun','shown');for(const k in (o.ls||{}))localStorage.setItem(k,o.ls[k])}catch(e){}
  const W={log:[],k:0,ev:0,seeded:o.seed!==false&&o.seed!=null};window.__W=W;
  const mb=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const base=W.seeded?(o.seed>>>0)||1:0;
  W.seed=n=>{if(!W.seeded)return;Math.random=W.mine=mb((n>>>0)||1)};
  if(W.seeded)W.seed(base);
  const G=k=>{try{return (0,eval)(k)}catch(e){return undefined}},has=k=>{try{return (0,eval)('typeof '+k)!=='undefined'}catch(e){return false}};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  W.dump=pt=>{const d={};const t=(k,f)=>{try{d[k]=f()}catch(e){d[k]='?'}};
    t('S',()=>{const S=G('S');return S?{ev:S.evKey,phase:S.phase,turnNo:S.turnNo,cur:S.cur,busy:!!S.busy,over:!!S.over,mode:S.mode,human:G('humanTurn')()}:null});
    t('speed',()=>G('SPEED'));t('modal',()=>{const m=G('CUR_MODAL');const el=document.getElementById('modal');return {cur:!!m,title:m&&m.title||null,hidden:el?el.hidden:null,ask:!!document.querySelector('.ask76bg')}});
    t('pace',()=>has('PACE96')?{depth:G('PACE96').depth,dirty:G('PACE96').dirty,raf:G('PACE96').raf}:null);
    t('cam',()=>has('CAM')?{raf:G('CAM').raf,z:G('CAM').z}:null);t('z99f',()=>has('Z99F')?{...G('Z99F')}:null);t('z100',()=>has('Z100')?{st:G('Z100').st,fr:G('Z100').fr}:null);
    t('aim',()=>{if(!has('AIM106'))return null;const A=G('AIM106');return {off:A.off,figs:A.figs.length,tmap:A.tmap&&A.tmap.size,raf:A.raf,hov:A.hov&&A.hov.ref&&A.hov.ref.name,sel:A.sel&&A.sel.ref&&A.sel.ref.name,lastPT:A.lastPT}});
    t('tip',()=>has('TT')?G('TT').stack.length:null);t('v108',()=>has('V108')?{tb:!!G('V108').tb,tl:!!G('V108').tl}:null);t('a93',()=>has('A93')?{syncT:G('A93').syncT,stack:G('A93').stack.length,active:document.activeElement&&(document.activeElement.id||document.activeElement.tagName)}:null);
    t('mgr',()=>has('MGR')?{tab:G('MGR').tab,view:G('MGR').view,world:!!G('MGR').world}:null);t('dpr',()=>devicePixelRatio);
    if(pt)t('at',()=>{const e=document.elementFromPoint(pt.x,pt.y);return e?(e.id||e.tagName)+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''):null});
    return d};
  W.until=async(fn,what,ms=15000,every=40)=>{const t0=performance.now();for(;;){let v;try{v=fn()}catch(e){v=false}if(v)return v;
    if(performance.now()-t0>ms){const line='WAIT '+(what||'condition')+' timed out after '+ms+' ms '+JSON.stringify(W.dump());W.log.push(line);console.log(line);return false}
    await sleep(every)}};
  W.frames=(n=2)=>new Promise(r=>{let k=0;const f=()=>++k>=n?r():requestAnimationFrame(f);requestAnimationFrame(f)});
  W.isTurnReady=human=>{const S=G('S');if(!S||S.over||S.busy||G('CUR_MODAL'))return false;if(!(S.phase==='action'||S.phase==='choice'))return false;return human===false||G('humanTurn')()};
  W.isIdle=()=>{const P=has('PACE96')?G('PACE96'):{},C=has('CAM')?G('CAM'):{},F=has('Z99F')?G('Z99F'):{},Z=has('Z100')?G('Z100'):{},V=has('V108')?G('V108'):{},A=has('AIM106')?G('AIM106'):{};
    return !P.depth&&!P.dirty&&!P.raf&&!C.raf&&!F.raf&&!F.inFrame&&!Z.st&&!V.tb&&!A.raf};
  W.turnReady=(human,ms)=>W.until(()=>W.isTurnReady(human),human===false?'turn ready':'human turn ready',ms);
  W.boardIdle=async ms=>{const r=await W.until(W.isIdle,'board idle (PACE96/CAM/Z99F/Z100/V108/AIM106 nothing pending)',ms);if(r)await W.frames(2);return r};
  W.isPopupSettled=()=>{const el=document.getElementById('modal');return !G('CUR_MODAL')&&(!el||el.hidden)&&!document.querySelector('.ask76bg')&&!(has('A93')&&G('A93').syncT)};
  W.popupSettled=ms=>W.until(W.isPopupSettled,'popup settled (no window, a11y sync done)',ms);
  W.mgrDrawn=(sel,ms)=>W.until(()=>!!G('MGR')&&!!document.querySelector(sel||'#mgrBody')&&!(has('A93')&&G('A93').syncT),'manager drawn '+(sel||'#mgrBody'),ms);
  W.saves=[];W.saveMark=()=>W.saves.length;
  W.saveDone=(mark,kind,ms)=>W.until(()=>W.saves.slice(mark).some(s=>!kind||s.kind===kind),'save '+(kind||'any')+' after mark '+mark,ms);
  const install=()=>{if(W.inst)return;W.inst=true;
    try{if(has('BUS'))G('BUS').on('save',d=>W.saves.push(d||{}))}catch(e){}
    if(!W.seeded)return;
    try{const nw=G('newWorld');if(typeof nw==='function'){window.__W_nw=function(){W.k++;const mr=Math.random;Math.random=mb((base^Math.imul(W.k,0x9E3779B1))>>>0||1);const dn=Date.now,R=G('RNG');const at=1790000000000+W.k*86400000;Date.now=()=>at;(0,eval)('RNG=null');
        try{return nw.apply(this,arguments)}finally{if(mr===W.mine)W.seed((base^Math.imul(W.k,0x85EBCA77))>>>0);else Math.random=mr;Date.now=dn;window.__W_R=R;(0,eval)('RNG=window.__W_R')}};(0,eval)('newWorld=window.__W_nw')}}catch(e){console.log('WAIT seed: newWorld not wrapped '+e)}
    try{const ns=G('newState');if(typeof ns==='function'){window.__W_ns=function(cfg){if(cfg&&cfg.seed==null){W.ev++;cfg.seed=(Math.imul(base^0x51ED,W.ev+1)>>>0)||7}return ns.apply(this,arguments)};(0,eval)('newState=window.__W_ns')}}catch(e){console.log('WAIT seed: newState not wrapped '+e)}};
  if(document.readyState!=='loading')install();else document.addEventListener('DOMContentLoaded',install)};

const boot=async(pg,o={})=>{const seed=o.seed===undefined?1:o.seed;
  if(!pg.__wLog){pg.__wLog=true;pg.on('console',m=>{const t=m.text();if(t.startsWith('WAIT '))console.log(t)})}
  await pg.addInitScript(PAGE,{seed,ls:o.ls||{},menu:o.menu});return pg};
const ready=(pg,ms=60000)=>pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:ms});
async function until(pg,what,fn,arg,ms=15000){
  try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:40});return true}
  catch(e){let d=null;try{d=await pg.evaluate(p=>window.__W?__W.dump(p):null,arg&&arg.pt||null)}catch(x){d=String(x).slice(0,120)}
    console.log('WAIT '+what+' timed out after '+ms+' ms '+JSON.stringify(d));return false}}
const call=(pg,expr,what,ms)=>until(pg,what,new Function('return ('+expr+')'),null,ms);
module.exports={boot,ready,until,PAGE,
  turnReady:(pg,o={})=>until(pg,o.human===false?'turn ready':'human turn ready',h=>window.__W.isTurnReady(h),o.human===false?false:true,o.ms),
  boardIdle:async(pg,ms)=>{const r=await call(pg,'window.__W.isIdle()','board idle (PACE96/CAM/Z99F/Z100/V108/AIM106 nothing pending)',ms);if(r)await pg.evaluate(()=>__W.frames(2));return r},
  drawSettled:async(pg,ms)=>{const r=await call(pg,'window.__W.isIdle()','draw settled',ms);if(r)await pg.evaluate(()=>__W.frames(2));return r},
  /* every named target (window[key]) recorded in AIM106.figs (with bounds) and in tmap, no hover frame pending; pts: points that must hit the canvas */
  aimReady:(pg,keys,pts,ms)=>until(pg,'aim ready ('+keys.join(',')+' in AIM106.figs + tmap, no rAF'+(pts?', canvas on top':'')+')',a=>{if(typeof AIM106==='undefined')return false;const A=AIM106;if(A.raf)return false;
    for(const k of a.keys){const u=window[k];if(!u||!A.figs.some(f=>f.u===u&&f.bb))return false;if(![...A.tmap.values()].some(h=>h.target&&h.target.ref===u))return false}
    for(const p of a.pts||[])if(p&&document.elementFromPoint(p.x,p.y)!==cv)return false;return true},{keys,pts:pts||null,pt:pts&&pts[0]||null},ms),
  popupSettled:(pg,ms)=>call(pg,'window.__W.isPopupSettled()','popup settled (no window, a11y sync done)',ms),
  saveMark:pg=>pg.evaluate(()=>__W.saveMark()),
  saveDone:(pg,mark,kind,ms)=>until(pg,'save '+(kind||'any')+' after mark '+mark,a=>__W.saves.slice(a[0]).some(s=>!a[1]||s.kind===a[1]),[mark,kind||null],ms),
  /* figure sheets: no 1×/2× sheet still loading (311 AN100.src per-sheet o.loading, which 410's 2× load also sets) */
  spritesReady:(pg,ms)=>call(pg,'typeof AN100==="undefined"||![...AN100.src.values()].some(s=>(s.move&&s.move.loading)||(s.act&&s.act.loading))','sprites ready',ms),
  mgrDrawn:(pg,sel,ms)=>until(pg,'manager drawn '+(sel||'#mgrBody'),s=>typeof MGR!=='undefined'&&!!document.querySelector(s)&&!(typeof A93!=='undefined'&&A93.syncT),sel||'#mgrBody',ms)};
