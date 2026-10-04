/* =====================================================================
   72-V59 · v0.59
   =====================================================================
   SMOOTH HAND-OFFS — Play (or ⚔ as CPU) on a Ludus Flavius gladiator and "Walk stage N" on the Road of Flavius close
   their window and open Play Now's setup a beat later (it loads the Ludus, missios, customs and crowd first). Opened
   from the main menu, that beat showed the menu (mmAfterClose) before the setup appeared. Now the click raises the
   loading curtain, holds the menu back until the setup window is up, then hands the menu-return duty back.
   ===================================================================== */
const HANDOFF_SEL='[data-summon],[data-summoncpu],[data-road="go"]';
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest(HANDOFF_SEL);if(!b||HEADLESS)return;
  const held=MM.fromMenu;MM.fromMenu=false;
  const t=transitEl();transitLabel(_T('Loading Play now…'));t.classList.add('on');clearTimeout(t._t);
  const t0=Date.now();const wait=()=>{const up=window.SETUP_OPEN&&!$('#modal').hidden&&CUR_MODAL;
    if(up||Date.now()-t0>15000){if(held){MM.fromMenu=true;MM.launchedAt=Date.now()}setTimeout(transitUncover,120);
      if(!up&&held&&$('#modal').hidden&&!CUR_MODAL&&!(S&&!S.over&&S.phase!=='setup'))menuShow();return}
    setTimeout(wait,50)};setTimeout(wait,50)},true);
/* ---------- SOUND: no floating "held back" chip; a mute button beside Settings on the main menu ----------
   The browser still needs one tap before it plays sound; any tap (including this button) unlocks it (68-fix55). */
audChip=function(){const c=document.getElementById('audChip');if(c)c.remove()};audChip();
function mmMuteUI(){const b=document.getElementById('mmMute');if(!b)return;const on=audSet().on;b.textContent=on?'🔊':'🔇';b.classList.toggle('muted',!on);b.title=on?_T('Mute all sound'):_T('Sound is off — click to turn it on');b.setAttribute('aria-label',b.title)}
function mmMuteInstall(){const st=document.querySelector('#mainMenu .mmbtns [data-mm="settings"]');if(!st||document.getElementById('mmMute'))return;
  const row=document.createElement('div');row.className='mmrow';st.replaceWith(row);row.appendChild(st);
  const m=document.createElement('button');m.type='button';m.className='btn';m.id='mmMute';row.appendChild(m);mmMuteUI()}
mmMuteInstall();
{const base=audMuteUI;audMuteUI=function(){const r=base.apply(this,arguments);mmMuteUI();return r}}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#mmMute'))audToggleMute()});
{const st=document.createElement('style');st.textContent=`.mmbtns .mmrow{display:flex;gap:7px}.mmbtns .mmrow [data-mm="settings"]{flex:1}
.mmbtns #mmMute{flex:0 0 64px;padding:10px 0;font-size:19px}.mmbtns #mmMute.muted{opacity:.7;border-color:var(--blood2,#a33)}`;document.head.appendChild(st)}
/* ---------- A CLEAN SAND FOR EACH TURN: the previous turn's card pop-ups (bottom left) and thought bubbles leave the moment
   the next turn begins, so they never cover the new player's view or read as theirs. (They stay in the log and the Stands.) */
function turnSweep(){if(HEADLESS)return;for(const id of ['cardShow','bubbles']){const box=document.getElementById(id);if(!box)continue;
  for(const el of [...box.children]){if(el.classList.contains('sweep'))continue;el.classList.add('sweep');setTimeout(()=>el.remove(),160)}}}
{const base=beginTurn;beginTurn=async function(){try{if(S&&!S.over&&!S.sim)turnSweep()}catch(e){}return base.apply(this,arguments)}}
{const st=document.createElement('style');st.textContent=`#cardShow .sweep,#bubbles .sweep{opacity:0!important;transition:opacity .15s ease!important}`;document.head.appendChild(st)}
/* ---------- MENU LAUNCHES WAIT FOR THE MODE: the curtain (transitRun) gave up after ~2.2 s and the watchdog brought the
   menu back at 3 s — with the shared Store over the network, Manager mode (loading the careers) can take longer, so the
   empty arena flashed first. Now, while a launched mode is still opening (MM.launchPending), transitUncover keeps the curtain up (15 s cap)
   and the watchdog waits for it to finish before deciding anything. */
{const base=transitUncover;transitUncover=function(){const ready=!$('#modal').hidden||!document.getElementById('mainMenu').hidden||(S&&!S.over&&S.phase!=='setup')||(typeof CITY!=='undefined'&&CITY.open);
  if(MM.launchPending&&!ready&&TRANSIT&&TRANSIT.classList.contains('on')&&Date.now()-(MM.launchedAt||0)<15000){clearTimeout(TRANSIT._hold);TRANSIT._hold=setTimeout(transitUncover,100);return}
  return base.apply(this,arguments)}}
{const base=mmLaunch;mmLaunch=function(fn,label){const t0=MM.launchedAt;
  const f=function(){const r=fn.apply(this,arguments);if(r&&r.then){MM.launchPending=true;r.then(()=>{MM.launchPending=false},()=>{MM.launchPending=false})}return r};
  base.call(this,f,label);const t1=MM.launchedAt;if(t1===t0)return;
  setTimeout(()=>{if(MM.launchedAt!==t1||!MM.launchPending)return;MM.launchedAt=t1+1; /* the built-in watchdog stands down; this one waits */
    const t2=Date.now();const w=()=>{if(MM.launchPending&&Date.now()-t2<15000)return setTimeout(w,100);
      const m=$('#mainMenu');if(!m||!m.hidden||!$('#modal').hidden||!$('#mReturn').hidden||CUR_MODAL)return;if(typeof CITY!=='undefined'&&CITY.open)return;if(S&&!S.over&&S.phase!=='setup')return;
      MM.fromMenu=false;menuShow()};w()},2900)}}
/* ---------- THE LUDUS CUT (rulebook tie-break, as Virgilante set it): the top two by CF go to the duel; a tie at the cut is
   broken by the most coin, and if still tied, the tied gladiators roll a d12 against each other until one is higher. ---------- */
function ludusRank(list,cut=2){const L=[...list].sort((a,b)=>b.cf-a.cf||(b.coin||0)-(a.coin||0));if(L.length<=cut)return L;
  const edge=L[cut-1],same=p=>p.cf===edge.cf&&(p.coin||0)===(edge.coin||0);const tied=L.filter(same);if(tied.length<2||!tied.some(p=>L.indexOf(p)>=cut))return L;
  const rollOff=pool=>{if(pool.length<2)return pool;const rs=pool.map(p=>({p,r:1+Math.floor(rand()*12)}));
    log(_T`🎲 Ludus tie (${edge.cf} CF, ${edge.coin||0} coin) — d12: ${rs.map(x=>`${nm(x.p)} ${x.r}`).join(', ')}.`);
    const vals=[...new Set(rs.map(x=>x.r))].sort((a,b)=>b-a);return vals.flatMap(v=>rollOff(rs.filter(x=>x.r===v).map(x=>x.p)))};
  const i0=L.findIndex(same);return [...L.slice(0,i0),...rollOff(tied),...L.slice(i0+tied.length)]}
/* ---------- "Sim to end" lives in the Speed tray, right of Fast (it is the last pace, after all); the same #btnSimEnd element
   moves there (always shown beside the active pace when it applies), so its click, its show/hide in render() and the Manager lesson's pointer all still work ---------- */
{const se=document.getElementById('btnSimEnd'),seg=document.querySelector('#speedTray .speedseg');
  if(se&&seg){se.classList.remove('btn');se.textContent=_T('⏭ To the end');se.title=_T('Resolve the rest of the event at once — straight to the results');seg.appendChild(se);
    se.addEventListener('click',()=>setTimeout(()=>seg.classList.remove('open'),0))}
  const st=document.createElement('style');st.textContent=`#speedTray #btnSimEnd[hidden]{display:none!important}.speedtray .seg:not(.open) #btnSimEnd:not([hidden]){display:inline-block}#speedTray #btnSimEnd{border-left:1px solid var(--line2)}`;document.head.appendChild(st)}
