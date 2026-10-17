/* =====================================================================
   367-v105menu · v1.05 B38 · THE MAIN MENU SHOW NEVER FALLS BACK TO THE FLAT SHOW (his a, 2026-10-17; tools/plans/v105/NOTES.md B38)
   =====================================================================
   282 held the show while this visit's strips decoded, at most 1.5 s (MM100S.cap), then played the OLD FLAT show for the visit when
   they were late (a slow line, a cold cache). Now (display only — S, dice, saves untouched):
     • the visit WAITS for its strips however long they take: a quiet backdrop (the show's sand glow, nothing else) at once, then the
       STILL GROUP PHOTO in 3D (the formation, idle frame — 282's still picture) as soon as the gladiators' strips (their idle cells)
       are decoded (they are asked for first), then the 3D show from its start when every strip of the visit is in;
     • 282's own cap timer stands down (its visit token goes stale), so the flat show is never chosen; a strip that fails to load is
       asked for once more after 2 s, after that the still group photo (or the backdrop) stays — never the flat show;
     • Reduce motion / Animations Off: the same wait, then 282's still group photo in 3D (no loop).
   Draw cost while waiting: one canvas draw per strip that arrives (no animation loop runs). MM105.st counts backdrops / stills / starts.
   The flat show stays only behind 282's kill switch localStorage flavius_mm100off=1. Kill switch localStorage flavius_v105moff=1 →
   282's old behaviour (the 1.5 s cap, then the flat show). Test tv105g.
   ===================================================================== */
const MM105={off:(()=>{try{return localStorage.getItem('flavius_v105moff')==='1'}catch(e){return false}})(),wait:false,retry:0,st:{backdrop:0,still:0,start:0,retry:0}};
/* the gladiators' strips: their idle cells make the still group photo */
function mm105GKeys(){return mm100Cls().map(c=>'g_'+c).filter(k=>MM100_META.a[k])}
/* mm105Backdrop — the show's sand glow only (as 282 mm100Loop draws under the figures) */
function mm105Backdrop(){const cv=$('#mmCv');if(!cv)return;const c2=cv.getContext('2d'),W9=cv.width,H9=cv.height;c2.clearRect(0,0,W9,H9);
  const g=c2.createRadialGradient(W9/2,H9*0.78,40,W9/2,H9*0.78,W9*0.55);g.addColorStop(0,'rgba(196,164,116,.35)');g.addColorStop(.7,'rgba(150,120,84,.18)');g.addColorStop(1,'rgba(0,0,0,0)');
  c2.fillStyle=g;c2.beginPath();c2.ellipse(W9/2,H9*0.78,W9*0.52,H9*0.34,0,0,Math.PI*2);c2.fill();MM105.st.backdrop++}
/* mm105Go — every strip of the visit is in: the 3D show from its start (or 282's still picture under Reduce motion / Animations Off) */
function mm105Go(tok,L0){if(tok!==MM100S.tok||!MM105.wait)return;MM105.wait=false;MM100S.loadMs=Math.round(performance.now()-L0);MM100S.hold=false;MM100S.on=true;MM105.st.start++;
  const m=$('#mainMenu');if(!m||m.hidden)return;if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}MM.t0=performance.now();MM.raf=requestAnimationFrame(mmLoop)}
/* mm105Wait — waits for the visit's strips; a failed one is asked for once more (2 s later), then the still stays */
function mm105Wait(keys,tok,L0){mm100Load(keys).then(()=>{if(tok!==MM100S.tok||!MM105.wait)return;if(keys.every(mm100Ok))return mm105Go(tok,L0);
  if(MM105.retry++<1){MM105.st.retry++;setTimeout(()=>{if(tok!==MM100S.tok||!MM105.wait)return;for(const k of keys)if(!mm100Ok(k))delete MM100S.img[k];mm105Wait(keys,tok,L0)},2000)}})}
if(!MM105.off&&typeof MM100S!=='undefined'&&!MM100S.off&&typeof mm100Loop==='function'){
/* while waiting, 282's loop draws its still picture (the formation, idle0) */
{const base=mm100Still;mm100Still=function(){if(MM105.wait)return true;return base.apply(this,arguments)}}
/* mmLoop while waiting: the still photo in 3D once the gladiators are decoded, else the backdrop — one draw, no loop; never the flat show */
{const base=mmLoop;mmLoop=function(){if(!MM105.wait)return base.apply(this,arguments);MM.raf=0;const m=$('#mainMenu');if(!m||m.hidden)return;
  try{if(mm105GKeys().every(mm100Ok)){mm100Loop();MM.raf&&cancelAnimationFrame(MM.raf);MM.raf=0;MM105.st.still++}else mm105Backdrop()}catch(e){console.error(e);mm105Backdrop()}}}
/* menuShow: after 282's wrapper — when the strips are not all decoded yet, take the wait over (282's cap → flat show stands down) */
{const base=menuShow;menuShow=function(){const r=base.apply(this,arguments);
  try{if(typeof HEADLESS!=='undefined'&&HEADLESS)return r;const m=$('#mainMenu');if(!m||m.hidden)return r;
    const keys=mm100Keys(MM.plan);MM105.wait=false;if(keys.every(mm100Ok))return r;
    const tok=++MM100S.tok;MM105.wait=true;MM105.retry=0;MM100S.on=false;MM100S.hold=true;if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}const L0=performance.now();
    const paint=()=>{if(tok===MM100S.tok&&MM105.wait)mmLoop()};paint();
    mm100Load(mm105GKeys()).then(paint);mm105Wait(keys,tok,L0)}
  catch(e){console.error(e);MM105.wait=false;MM100S.hold=false}return r}}
}
