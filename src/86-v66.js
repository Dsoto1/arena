/* =====================================================================
   86-V66 · v0.66 TUTORIAL BUMPERS, PHONES IN LANDSCAPE
   =====================================================================
   BUMPERS (Play Now lesson; the Manager lesson already guards clicks in 36-mtutor): while the lesson runs, a capture-phase
   guard lets through only the coach, dialogs and — in a hands-on step — the play surfaces (actions, the sand, your board,
   the roster, hints). During the screen tour everything is look-only: the highlighted button shows, it does not open.
   🏛 asks to leave the lesson (Exit is always there); the rest of the top bar is dimmed. The Manager lesson dims what
   its guard blocks too.
   ===================================================================== */
const tutLive=()=>!!(typeof TUT!=='undefined'&&TUT.on&&S&&S.tutorial&&!S.over);
const tutTourNow=()=>{const st=typeof TUT_STEPS!=='undefined'&&TUT_STEPS[TUT.step];return !!(st&&(st.tour||st.info))};
const TUT_PLAY='#actions,#cv,#board,#roster,#hintDock,#ctxMenu,#bubbles,#stepBar,.speedseg,.collhd,#btnMute,#mmMute';
function tutGuard(e){if(!tutLive())return;const t=e.target;if(!t||!t.closest)return;
  if(t.closest('#tutCoach,#modal,#mClose,#tip,.tt[role="tooltip"]'))return;
  if(t.closest('#btnMenu')){e.preventDefault();e.stopPropagation();if(e.type==='click'&&typeof tutExit==='function')tutExit();return}
  if(!tutTourNow()&&t.closest(TUT_PLAY))return;
  if(!t.closest('button,a,select,input,textarea,summary,label,[data-act],[data-card],[role="button"],canvas'))return;
  e.preventDefault();e.stopPropagation();
  if(e.type==='click'&&typeof mToast==='function')mToast(tutTourNow()?'🎓 Just looking for now — press <b>Next ▶</b> on the coach.':'🎓 One thing at a time — follow the coach (✖ Exit is always there).')}
for(const ev of ['click','pointerdown','mousedown','touchstart'])document.addEventListener(ev,tutGuard,{capture:true,passive:false});
{const st=document.createElement('style');st.textContent=`
body.tutlock header.bar .navmid button,body.tutlock header.bar .navright button:not(#btnMenu):not(#btnMute),body.tutlock #arenaDrawer button,body.tutlock #btnSimEnd{opacity:.35;filter:grayscale(.6);cursor:not-allowed}
body.tutlock header.bar .tutspot{opacity:1!important;filter:none!important;cursor:help}
body.tuttour #actions button:not(.tutspot),body.tuttour #board button{cursor:help}`;document.head.appendChild(st)}
setInterval(()=>{try{const on=tutLive();document.body.classList.toggle('tutlock',on);document.body.classList.toggle('tuttour',on&&tutTourNow())}catch(e){}},300);
/* ---------- PHONES IN LANDSCAPE (phoneLand): the arena takes the whole screen; the top bar, actions, fighter board and log
   become drawers behind a small button dock (bottom left); the actions open by themselves when it is your move.
   In portrait during an event a one-line hint suggests turning the phone (the compact portrait mode is v0.67).
   CAMERA: zoomed in (🔍, or a pinch), the view follows whoever is acting — smoothly — instead of the middle of the sand;
   a pinch sets the zoom (1-2.4x). The final duel keeps its own camera. TWEAK: CAM_MAX, the 0.18 follow ease. ---------- */
const CAM={z:null,fx:null,fy:null,raf:0},CAM_MAX=2.4;
const isPhone=()=>Math.min(innerWidth,innerHeight)<=520&&(matchMedia('(pointer:coarse)').matches||Math.max(innerWidth,innerHeight)<=950);
function phoneLand(){return !HEADLESS&&isPhone()&&innerWidth>innerHeight&&!!S&&S.phase!=='setup'}
const phonePort=()=>!HEADLESS&&isPhone()&&innerHeight>innerWidth&&!!S&&!S.over&&S.phase!=='setup';
/* the camera: where the acting gladiator stands (screen point the zoomed board should put under them) */
function camFocus(Wd,Hd){if(!S||S.over||(typeof duelZoneOn==='function'&&duelZoneOn()))return null;const p=cur();if(!p||p.r==null)return null;
  const tx=Wd/2,ty=Hd*0.5;const r=p.r,c=p.c;if(CAM.fr==null){CAM.fr=r;CAM.fc=c}
  CAM.fr+=(r-CAM.fr)*0.18;CAM.fc+=(c-CAM.fc)*0.18;const moving=Math.abs(r-CAM.fr)>0.02||Math.abs(c-CAM.fc)>0.02;if(!moving){CAM.fr=r;CAM.fc=c}
  else if(!CAM.raf)CAM.raf=requestAnimationFrame(()=>{CAM.raf=0;try{draw()}catch(e){}});
  return {r:CAM.fr,c:CAM.fc,x:tx,y:ty}}
{const base=duelCam;duelCam=function(){const dz=typeof duelZoneOn==='function'&&duelZoneOn();if(!dz&&CAM.z&&S)return CAM.z;return base.apply(this,arguments)}}
document.addEventListener('click',e=>{if(e.target.closest('#btnZoom')){CAM.z=null}},true);
/* pinch on the sand */
{let pin=null;const d2=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
  document.addEventListener('touchstart',e=>{if(e.touches.length===2&&e.target===cv){pin={d:d2(e.touches),z:CAM.z||(typeof duelCam==='function'?duelCam():1)};e.preventDefault()}},{passive:false});
  document.addEventListener('touchmove',e=>{if(pin&&e.touches.length===2){e.preventDefault();CAM.z=Math.max(1,Math.min(CAM_MAX,pin.z*d2(e.touches)/pin.d));if(S)S.zoomIn=CAM.z>1.02;try{draw()}catch(err){}}},{passive:false});
  document.addEventListener('touchend',e=>{if(pin&&e.touches.length<2){pin=null;if(CAM.z&&CAM.z<1.03)CAM.z=null;try{duelUI()}catch(err){}}})}
/* the drawers and the dock */
{const st=document.createElement('style');st.textContent=`
body.phoneL{overflow:hidden}
body.phoneL header.bar{position:fixed;left:0;right:0;top:0;z-index:60;transform:translateY(-105%);transition:transform .2s;box-shadow:0 6px 18px rgba(0,0,0,.6)}
body.phoneL.pl-nav header.bar{transform:none}
body.phoneL main.layout{display:block!important;padding:0!important;margin:0!important;max-width:none!important}
body.phoneL .canvas-wrap{margin:0!important;border-radius:0!important;height:100vh;height:100dvh;overflow:hidden}
body.phoneL #cv{touch-action:none}
body.phoneL #actions,body.phoneL aside.side,body.phoneL .logbar{position:fixed!important;z-index:55;background:var(--panel,#1c140e);box-shadow:0 0 20px rgba(0,0,0,.7);overflow-y:auto;margin:0!important;transition:transform .2s}
body.phoneL #actions{right:8px;bottom:8px;width:min(360px,48vw);max-height:78vh;border-radius:10px;transform:translateY(calc(100% + 20px))}
body.phoneL.pl-act #actions{transform:none}
body.phoneL aside.side{right:0;top:0;bottom:0;width:min(380px,62vw);transform:translateX(105%)}body.phoneL.pl-side aside.side{transform:none}
body.phoneL .logbar{left:0;top:0;bottom:0;width:min(380px,62vw);transform:translateX(-105%)}body.phoneL.pl-log .logbar{transform:none}
#plDock{display:none}body.phoneL #plDock{display:flex;position:fixed;left:8px;bottom:8px;z-index:58;gap:6px;flex-direction:column}
#plDock button{width:42px;height:42px;border-radius:50%;border:1px solid var(--line2);background:rgba(28,20,14,.86);color:var(--text);font-size:18px;padding:0}
#plDock button.on{border-color:var(--gold);color:var(--gold2)}
#plRot{display:none}body.phoneP #plRot{display:flex;position:fixed;left:8px;right:8px;top:8px;z-index:58;gap:8px;align-items:center;justify-content:space-between;
  background:rgba(28,20,14,.94);border:1px solid var(--line2);border-radius:10px;padding:6px 10px;font-size:13px}
body.phoneP.pl-rotx #plRot{display:none}`;document.head.appendChild(st)}
function plBuild(){if(document.getElementById('plDock'))return;const d=document.createElement('div');d.id='plDock';
  d.innerHTML=`<button type="button" data-pl="nav" title="Top bar: speed, rules, menu">☰</button><button type="button" data-pl="act" title="Your actions">⚔</button><button type="button" data-pl="side" title="Fighter board and gladiators">🛡</button><button type="button" data-pl="log" title="Arena log">📜</button><button type="button" data-pl="zoom" title="Zoom (or pinch the sand)">🔍</button>`;
  document.body.appendChild(d);const r=document.createElement('div');r.id='plRot';r.innerHTML=`<span>↻ Turn your phone sideways for the full arena</span><button class="btn tksm" type="button" data-pl="rotx">✕</button>`;document.body.appendChild(r)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pl]');if(!b)return;e.preventDefault();const k=b.dataset.pl,B=document.body;
  if(k==='zoom'){if(S){S.zoomIn=!(S.zoomIn||CAM.z>1.02);CAM.z=null;try{draw();duelUI()}catch(err){}}return}
  if(k==='rotx'){B.classList.add('pl-rotx');return}
  const was=B.classList.contains('pl-'+k);for(const x of ['nav','side','log'])B.classList.remove('pl-'+x);if(k==='act'){B.classList.toggle('pl-act',!was);PL.actUser=!was}else B.classList.toggle('pl-'+k,!was);plSync()});
/* tapping the sand closes the side drawers */
document.addEventListener('pointerdown',e=>{if(!document.body.classList.contains('phoneL'))return;if(e.target===cv)for(const x of ['nav','side','log'])document.body.classList.remove('pl-'+x)},true);
const PL={on:false,turn:null,actUser:null};
function plSync(){const B=document.body;for(const k of ['nav','act','side','log']){const b=document.querySelector(`#plDock [data-pl="${k}"]`);if(b)b.classList.toggle('on',B.classList.contains('pl-'+k))}
  const z=document.querySelector('#plDock [data-pl="zoom"]');if(z)z.classList.toggle('on',!!(S&&(S.zoomIn||CAM.z>1.02)))}
function plTick(){try{const B=document.body;const on=phoneLand();
  if(on&&!PL.on){plBuild();if(S&&!S.over&&S.zoomIn==null)S.zoomIn=true}
  if(on!==PL.on){PL.on=on;B.classList.toggle('phoneL',on);if(!on)for(const x of ['nav','act','side','log'])B.classList.remove('pl-'+x);try{draw()}catch(e){}}
  B.classList.toggle('phoneP',phonePort());if(phonePort())plBuild();
  if(on&&S){/* your move: the actions slide in; a CPU's move: they slide away (unless you opened them yourself) */
    const mine=!S.over&&typeof humanTurn==='function'&&humanTurn()&&(S.phase==='action'||S.phase==='choice');const key=(S.turnNo||0)+':'+S.phase+':'+mine;
    if(key!==PL.turn){PL.turn=key;PL.actUser=null;B.classList.toggle('pl-act',mine)}plSync()}}catch(e){}}
setInterval(plTick,300);addEventListener('resize',()=>{plTick();try{draw()}catch(e){}});
