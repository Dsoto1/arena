/* =====================================================================
   32-RAIL · THE FULL-SCREEN SPLIT (v0.40)
   =====================================================================
   Manager mode and the Creator Studio used to line up every tab in one long row (14 and 11 of them).
   In full-screen they now sit in a grouped LEFT RAIL — section headers, one tab per line — and the chosen
   tab fills the rest of the screen. In a normal window (or on a narrow screen) the same markup falls back
   to the familiar row of tabs. Match Week and the live bout are unchanged.
   ===================================================================== */
const MGR_GROUPS=[[_T('🏛 Ludus'),['ludus','roster','recruit','board','infirm','practice']],[_T('⚔️ Arena'),['night','exch']],[_T('🌍 World'),['news','league','imp','trophy','sched']],[_T('👤 Lanista'),['me']]];
const ST_GROUPS=[[_T('📋 Overview'),['all']],[_T('🛡 Fighters'),['classes','chars','lanistas','npcs','cohorts','tokens']],[_T('⚔ Gear'),['gear:w','gear:a','trophies','flags']],[_T('🏟 Arena'),['events','tourneys','specials','sponsors','spect']],[_T('🎲 Tools'),['rosters','names']]];
/* tabs: [[key,label,title?]], attr(k) → the button's data attributes */
function railTabs(tabs,groups,cur,attr,cls){const by=Object.fromEntries(tabs.map(t=>[t[0],t]));const used=new Set();
  const btn=t=>{used.add(t[0]);return `<button type="button" ${attr(t[0])} class="${cur===t[0]?'on':''}"${t[2]?` title="${esc(t[2])}"`:''}>${t[1]}</button>`};
  let h=groups.map(([g,ks])=>{const bs=ks.filter(k=>by[k]).map(k=>btn(by[k])).join('');return bs?`<div class="railgrp"><div class="railhd">${g}</div>${bs}</div>`:''}).join('');
  const rest=tabs.filter(t=>!used.has(t[0]));if(rest.length)h+=`<div class="railgrp"><div class="railhd">${_T`More`}</div>${rest.map(btn).join('')}</div>`;
  return `<div class="${cls} rail" role="tablist">${h}</div>`}

/* ---------------- v0.41 small conveniences ---------------- */
/* the logo: open FlaviusRule.com; if the host blocks new tabs, offer the address instead of failing silently */
{const a=document.getElementById('brandLink');if(a)a.addEventListener('click',e=>{const url=a.href;let w=null;try{w=window.open(url,'_blank','noopener,noreferrer')}catch(err){}
  if(w===null||w===undefined){e.preventDefault();if(typeof modal==='function'&&!(typeof modalBusy==='function'&&modalBusy()))modal(_T('Open the site'),`<p style="font:16px var(--mono)"><a href="${url}" target="_blank" rel="noopener">${url}</a></p>`,[{label:_T('Copy the address'),value:'copy',primary:1},{label:_T('Close'),value:null}],{close:null}).then(v=>{if(v==='copy'){try{navigator.clipboard.writeText(url);if(typeof mToast==='function')mToast(_T('Copied: ')+url)}catch(err){}}})}
  else e.preventDefault()})}
/* Space pauses the CPU (and resumes at the pace you had) — unless a Step is waiting, or you are typing */
let SPACE_PREV='normal';
document.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat)return;const t=document.activeElement;if(t&&(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(t.tagName)||t.isContentEditable))return;
  if(typeof STEP!=='undefined'&&STEP.res)return; // Step mode: Space means Next
  if(!S||S.over||S.phase==='setup'||!$('#modal').hidden)return;
  e.preventDefault();if(SPEED==='pause'){setSpeedUI(SPACE_PREV&&SPACE_PREV!=='pause'?SPACE_PREV:'normal');if(typeof mToast==='function')mToast(_T('▶ Resumed'))}else{SPACE_PREV=SPEED;setSpeedUI('pause');if(typeof mToast==='function')mToast(_T('⏸ Paused — Space to resume'))}});

/* ---------------- v0.41 SMOOTH PASSAGES between the big modes ----------------
   transitCover(): an instant black cover (nothing behind flashes); transitUncover(): it fades away.
   transitRun(fn): fade to black, run fn, and fade back in once the next screen has painted. */
let TRANSIT=null;
function transitEl(){if(!TRANSIT){TRANSIT=document.createElement('div');TRANSIT.className='transit';
    /* v0.45: the dark between screens is never empty — a Blessing token turns slowly, and the mode being opened is named */
    TRANSIT.innerHTML=`<div class="tspin" aria-hidden="true"><i style="background-image:url('${typeof assetURL==='function'?assetURL('blessing.png'):'assets/blessing.png'}')"></i></div><div class="tlbl" role="status"></div>`;document.body.appendChild(TRANSIT)}return TRANSIT}
function transitLabel(t){const el=transitEl().querySelector('.tlbl');if(el)el.textContent=t||''}
function transitCover(hold=1800){if(HEADLESS)return;const t=transitEl();transitLabel('');t.classList.add('instant','on');void t.offsetWidth;t.classList.remove('instant');clearTimeout(t._t);t._t=setTimeout(transitUncover,hold)}
function transitUncover(){if(!TRANSIT)return;clearTimeout(TRANSIT._t);TRANSIT.classList.remove('on')}
function transitRun(fn,label){if(HEADLESS){return fn()}const t=transitEl();transitLabel(label||'');t.classList.add('on');clearTimeout(t._t);const minT=label?650:0;
  setTimeout(()=>{let r;try{r=fn()}catch(e){console.error(e)}
    const t0=Date.now();const tick=()=>{const ready=!$('#modal').hidden||!document.getElementById('mainMenu').hidden||(S&&!S.over&&S.phase!=='setup')||(typeof CITY!=='undefined'&&CITY.open);
      if((ready&&Date.now()-t0>=minT)||Date.now()-t0>1600+minT)setTimeout(transitUncover,90);else setTimeout(tick,60)};tick();
    if(r&&r.catch)r.catch(e=>{console.error(e);transitUncover()})},230)}

/* v0.43: H toggles the master Hints switch anywhere outside a text field */
document.addEventListener('keydown',e=>{if(e.key!=='h'&&e.key!=='H')return;if(e.ctrlKey||e.metaKey||e.altKey)return;const t=document.activeElement;if(t&&(['INPUT','TEXTAREA','SELECT'].includes(t.tagName)||t.isContentEditable))return;
  if(typeof setHints!=='function')return;if(!document.getElementById('modal').hidden&&!document.getElementById('setBody'))return;const v=!SETTINGS.hints;hintsMaster(v);if(typeof mToast==='function')mToast(v?_T('💡 Hints on — H to hide them'):_T('💡 Hints off — H to bring them back'))});
