/* =====================================================================
   288-v100perf · v1.0 CHEAP PERFORMANCE ITEMS (tools/plans/perf100/AUDIT.md §3.2-3.6; display only — S, dice, log, saves untouched)
   =====================================================================
   1 · THE MENU UNDER FULL-SCREEN WINDOWS: #mainMenu stays un-hidden behind Online / Manager / Studio / Settings (they are #modal.full and
       cover it entirely). While one is up the menu show (08-setup mmLoop, 60 fps) stops, the show's clock is held so it carries on where
       it was when the menu is uncovered, and body.mm100cov pauses the menu's CSS animations. Small pop-ups (not .full) do not cover it.
   2 · REPAINT-FREE GLOWS: 21 looping animations in the audit moved box-shadow / text-shadow / background-position / left every frame
       (a main-thread paint + commit per frame). The same keyframe NAMES are redefined here (the later @keyframes wins) so every user keeps
       its selector and timing: the glow is a `filter: drop-shadow` pulse (a compositor animation, no paint) on top of the element's own
       static shadow; the dots' halo is a ::before ring that scales and fades; the shine bars are translated pseudo layers.
       NOT converted (SVG attributes / a clip that cannot move): flow, glow90, injp (SVG paint), holo84sheen (its ::after is the clip).
       gift83glow is already a filter animation. body.idle92 / body.calm / reduce motion cover the new pseudo elements (they match * ::before).
   3 · NO FORCED LAYOUT IN draw(): 163's bar keeper (bar88Hold) measured the top bar on every board draw (getBoundingClientRect right after
       the panels changed). Its ResizeObserver already fires when the bar changes size, so the measuring happens THERE (layout is clean) and
       the draw-time call returns at once once the observer has delivered its first size. 230's FIT95 already caches fitReserve with its own
       observers; the sizes and the layout are the same as before. Kill switch: localStorage flavius_perf100off=1 (CSS + all JS).
   ===================================================================== */
const PERF100={off:(()=>{try{return localStorage.getItem('flavius_perf100off')==='1'}catch(e){return false}})()};
const MM100={cov:false,at:0};
{const st=document.createElement('style');st.id='perf100css';st.textContent=PERF100.off?'':`
/* 1 · the menu under a full-screen window */
body.mm100cov #mainMenu,body.mm100cov #mainMenu *,body.mm100cov #mainMenu *::before,body.mm100cov #mainMenu *::after{animation-play-state:paused!important}
/* 2 · glows as compositor-only filter pulses (the static box-shadow / text-shadow of each element stays as it was) */
@keyframes mmglow{0%,100%{filter:drop-shadow(0 0 0 rgba(240,207,125,0))}50%{filter:drop-shadow(0 0 9px rgba(240,207,125,.45))}}
@keyframes gglow{0%,100%{filter:drop-shadow(0 0 3px rgba(240,207,125,.3))}50%{filter:drop-shadow(0 0 10px rgba(240,207,125,.85))}}
@keyframes ludbeat{0%,100%{filter:drop-shadow(0 0 0 rgba(127,192,216,0))}15%{filter:drop-shadow(0 0 7px rgba(127,192,216,.5))}}
@keyframes nightbeat{0%,100%{filter:drop-shadow(0 0 0 rgba(240,207,125,0))}12%{filter:drop-shadow(0 0 8px rgba(240,207,125,.55))}24%{filter:drop-shadow(0 0 1px rgba(240,207,125,.1))}36%{filter:drop-shadow(0 0 6px rgba(240,207,125,.45))}}
@keyframes perkpulse{0%,100%{filter:drop-shadow(0 0 0 rgba(240,207,125,0))}50%{filter:drop-shadow(0 0 14px rgba(240,207,125,.85))}}
@keyframes chestGlow82{0%,100%{filter:drop-shadow(0 0 0 rgba(240,190,70,0))}50%{filter:drop-shadow(0 0 10px rgba(240,190,70,.8))}}
@keyframes chestSheen82{0%{transform:translateX(0)}60%,100%{transform:translateX(475%)}}
@keyframes nw83leg{0%,100%{filter:drop-shadow(0 0 0 transparent)}50%{filter:drop-shadow(0 0 20px var(--rc))}}
@keyframes onlplay89{0%,100%{filter:drop-shadow(0 0 0 rgba(232,180,90,0))}50%{filter:drop-shadow(0 0 12px rgba(232,180,90,.6))}}
@keyframes pu96p{0%,100%{filter:drop-shadow(0 0 0 rgba(232,170,60,0))}50%{filter:drop-shadow(0 0 8px rgba(232,170,60,.8))}}
@keyframes sug96{0%,100%{filter:drop-shadow(0 0 0 rgba(240,207,125,0))}50%{filter:drop-shadow(0 0 6px rgba(240,207,125,.55))}}
@keyframes sugpulse{0%,100%{filter:drop-shadow(0 0 0 rgba(240,207,125,0))}50%{filter:drop-shadow(0 0 12px rgba(240,207,125,.8))}}
@keyframes leadflip{0%{transform:scale(2.2);filter:drop-shadow(0 0 4px rgba(240,207,125,.7))}100%{transform:scale(1);filter:none}}
/* the dots' halo: a ring that grows and fades (was a box-shadow spread) */
@keyframes pulse{0%{transform:scale(1);opacity:1}70%,100%{transform:scale(2.5);opacity:0}}
.leaddot,.turnind .dot{animation:none;position:relative}
.leaddot::before,.turnind .dot::before{content:'';position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 2.5px rgba(240,207,125,.6);pointer-events:none;animation:pulse 1.6s infinite}
.leaddot.flip{animation:leadflip .9s ease-out}
.leaddot.flip::before{animation-delay:.9s;opacity:0}
/* the progress bar's moving stripes: a translated layer instead of background-position */
.cu98bar i{background:none;position:relative;overflow:hidden}
.cu98bar i::before{content:'';position:absolute;top:0;bottom:0;left:-28px;right:0;background:repeating-linear-gradient(45deg,#f0cf7d 0 10px,#c9a14a 10px 20px);background-size:28px 28px;animation:cu100s 1s linear infinite}
@keyframes cu100s{to{transform:translateX(28px)}}
/* grade A: the gold chip keeps its gradient still; the shine is a band that sweeps across (was background-position) */
.grade.A{animation:none;position:relative;overflow:hidden;isolation:isolate;background-position:50% 0}
.grade.A::before{content:'';position:absolute;top:0;bottom:0;left:0;width:60%;z-index:-1;pointer-events:none;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);animation:gshine100 2.8s linear infinite}
@keyframes gshine100{from{transform:translateX(-100%)}to{transform:translateX(170%)}}
@media (prefers-reduced-motion:reduce){.grade.A::before,.leaddot::before,.turnind .dot::before{animation:none}}
`;document.head.appendChild(st)}

/* ---- 1 · the menu show under a covering window ---- */
function mm100Covered(){const m=document.getElementById('mainMenu');if(!m||m.hidden)return false;const md=document.getElementById('modal');return !!(md&&!md.hidden&&md.classList.contains('full'))}
function mm100Sync(){if(PERF100.off)return;const cov=mm100Covered();if(cov===MM100.cov)return;MM100.cov=cov;document.body.classList.toggle('mm100cov',cov);const now=performance.now();
  if(cov){if(typeof MM!=='undefined'&&MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0;MM100.at=now}}
  else if(MM100.at){const was=MM100.at;MM100.at=0;if(typeof MM!=='undefined'){MM.t0+=now-was;const m=document.getElementById('mainMenu');
    if(m&&!m.hidden&&!MM.raf&&MM.plan&&(now-MM.t0)/1000<MM.plan.tEnd)MM.raf=requestAnimationFrame(mmLoop)}}}
{const base=mmLoop;mmLoop=function(){if(!PERF100.off&&MM100.cov){MM.raf=0;if(!MM100.at)MM100.at=performance.now();return}return base.apply(this,arguments)}}
{const mo=new MutationObserver(()=>mm100Sync());const a=document.getElementById('modal'),b=document.getElementById('mainMenu');
  if(a)mo.observe(a,{attributes:true,attributeFilter:['hidden','class']});if(b)mo.observe(b,{attributes:true,attributeFilter:['hidden']});mm100Sync()}

/* ---- 3 · the top bar keeper measures where layout is clean (its ResizeObserver), not inside draw() ---- */
const BAR100={seen:false,clean:false};
if(!PERF100.off&&typeof bar88Hold==='function'&&typeof ResizeObserver==='function'){
  const base=bar88Hold;
  bar88Hold=function(){if(BAR100.seen&&!BAR100.clean)return;return base.apply(this,arguments)};
  const bar=document.querySelector('.bar');
  const run=()=>{BAR100.clean=true;try{base()}finally{BAR100.clean=false}};
  if(bar)new ResizeObserver(()=>{BAR100.seen=true;requestAnimationFrame(run)}).observe(bar) /* next frame: the keeper may resize the bar, which inside the observer ends in "loop completed with undelivered notifications" */;
  addEventListener('resize',()=>{if(bar)requestAnimationFrame(run);else BAR100.seen=false})}
