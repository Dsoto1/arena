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
  const t=transitEl();transitLabel('Loading Play now…');t.classList.add('on');clearTimeout(t._t);
  const t0=Date.now();const wait=()=>{const up=window.SETUP_OPEN&&!$('#modal').hidden&&CUR_MODAL;
    if(up||Date.now()-t0>15000){if(held){MM.fromMenu=true;MM.launchedAt=Date.now()}setTimeout(transitUncover,120);
      if(!up&&held&&$('#modal').hidden&&!CUR_MODAL&&!(S&&!S.over&&S.phase!=='setup'))menuShow();return}
    setTimeout(wait,50)};setTimeout(wait,50)},true);
/* ---------- SOUND: no floating "held back" chip; a mute button beside Settings on the main menu ----------
   The browser still needs one tap before it plays sound; any tap (including this button) unlocks it (68-fix55). */
audChip=function(){const c=document.getElementById('audChip');if(c)c.remove()};audChip();
function mmMuteUI(){const b=document.getElementById('mmMute');if(!b)return;const on=audSet().on;b.textContent=on?'🔊':'🔇';b.classList.toggle('muted',!on);b.title=on?'Mute all sound':'Sound is off — click to turn it on';b.setAttribute('aria-label',b.title)}
function mmMuteInstall(){const st=document.querySelector('#mainMenu .mmbtns [data-mm="settings"]');if(!st||document.getElementById('mmMute'))return;
  const row=document.createElement('div');row.className='mmrow';st.replaceWith(row);row.appendChild(st);
  const m=document.createElement('button');m.type='button';m.className='btn';m.id='mmMute';row.appendChild(m);mmMuteUI()}
mmMuteInstall();
{const base=audMuteUI;audMuteUI=function(){const r=base.apply(this,arguments);mmMuteUI();return r}}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#mmMute'))audToggleMute()});
{const st=document.createElement('style');st.textContent=`.mmbtns .mmrow{display:flex;gap:7px}.mmbtns .mmrow [data-mm="settings"]{flex:1}
.mmbtns #mmMute{flex:0 0 64px;padding:10px 0;font-size:19px}.mmbtns #mmMute.muted{opacity:.7;border-color:var(--blood2,#a33)}`;document.head.appendChild(st)}
