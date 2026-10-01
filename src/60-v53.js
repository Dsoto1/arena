/* =====================================================================
   60-V53 · A QUIETER ARENA, TRUER RULES (v0.53)
   =====================================================================
   Tweakables are marked TWEAK.
   ===================================================================== */

/* ---------- the arena log on the sand starts OFF (once, for everyone) ---------- */
try{if(localStorage.getItem('flavius_capfeed53')!=='1'){localStorage.setItem('flavius_capfeed53','1');SETTINGS.capFeed=false;applySettings()}}catch(e){}

/* ---------- phases wear their colours wherever they are named ---------- */
const PHASE_LABEL={resolve:'Resolve',command:'Resolve',choice:'Choice',action:'Action',end:'End'};
/* phaseTag(phase): a small coloured chip for a phase name */
function phaseTag(phase){const key=phase==='command'?'resolve':phase;return `<span class="phtag ph-${key}">${PHASE_LABEL[phase]||phase}</span>`}
/* log headers like "Phase 2 · Choice: …" get the chip instead of the number */
{const baseLog=log;log=function(html,cls){if(typeof html==='string')html=html.replace(/^Phase \d · (Resolve|Choice|Action|End)(:?)/,(m,name,colon)=>phaseTag(name.toLowerCase())+colon);return baseLog(html,cls)}}

/* ---------- the turn indicator: a glowing dot, the name, the phase — the rest on hover ---------- */
renderTurnInd=function(){if(HEADLESS)return;const box=$('#turnInd');if(!box)return;
  if(!S||S.over||S.phase==='setup'||!S.players.length){box.hidden=true;return}
  const player=cur();box.hidden=false;const owner=typeof arenaOwner==='function'?arenaOwner():null;
  box.className='turnind slim'+(player.cpu?'':' you');box.style.setProperty('--pc',player.color);
  const details=`<b>${esc(player.name)}</b>${player.cpu?' (CPU)':' · your turn'}<br>Phase: ${PHASE_LABEL[S.phase]||S.phase}<br>Turn ${S.turnNo} · rotation ${S.rotation}${owner&&owner.k!=='play'?`<br>${owner.i} ${esc(owner.n)}`:''}${SPEED==='pause'?'<br>Speed: Paused':''}`;
  box.innerHTML=`<span class="dot" aria-hidden="true"></span><b class="tiname">${esc(player.name)}</b>${phaseTag(S.phase)}<span class="qi" data-tip="${esc(details)}">ⓘ</span>`;
  turnIndFit()};
/* keep the indicator clear of Flavius's box, like the caption on the left */
function turnIndFit(){const box=$('#turnInd'),canvas=$('#cv');if(!box||!canvas||typeof iso!=='function')return;
  const top=iso(0,0),boxW=TW*1.55;const flavOn=!(typeof SETTINGS!=='undefined'&&SETTINGS.flavius===false)&&STANDS;
  const flavRight=flavOn?top.x+boxW/2:0;const room=canvas.clientWidth-flavRight-22;
  box.style.maxWidth=Math.max(120,room)+'px'}

/* ---------- arena tools: the same ‹ drawer handle as the top bar; zoom any time ---------- */
{const baseSync=ctSync;ctSync=function(){baseSync();const handle=document.getElementById('ctTog');if(handle){const open=document.getElementById('cTools').classList.contains('open');handle.textContent=open?'›':'‹';handle.classList.add('navtog')}}}
setTimeout(()=>{try{ctSync()}catch(e){}},200);
const FREE_ZOOM=1.4; /* TWEAK: how far "Zoom in" leans in outside the final duel (the duel uses 1.75) */
duelCam=function(){if(HEADLESS)return 1;const duel=duelZoneOn();const want=duel?!S.zoomOut:!!(S&&S.zoomIn);const target=duel?1.75:FREE_ZOOM;
  if(want!==DUEL.on||DUEL.target!==target){DUEL.on=want;DUEL.target=target;DUEL.t0=performance.now();DUEL.from=DUEL.z}
  const k=Math.min(1,(performance.now()-DUEL.t0)/1100);const ease=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  DUEL.z=DUEL.from+((DUEL.on?target:1)-DUEL.from)*ease;
  if(k<1&&!DUEL.raf)DUEL.raf=requestAnimationFrame(()=>{DUEL.raf=0;try{draw()}catch(err){}});return DUEL.z};
{const baseVig=duelVignette;duelVignette=function(w,h){if(duelZoneOn())return baseVig(w,h)}}
duelUI=function(){const btn=document.getElementById('btnZoom');if(!btn)return;const live=!!(S&&!S.over&&S.phase!=='setup');btn.hidden=!live;if(!live)return;
  const zoomed=duelZoneOn()?!S.zoomOut:!!S.zoomIn;const label=zoomed?'🔍 Zoom out':'🔍 Zoom in';if(btn.textContent!==label)btn.textContent=label;btn.title=zoomed?'Pull the camera back':'Lean the camera in'};
document.addEventListener('click',e=>{if(!e.target.closest('#btnZoom')||!S||duelZoneOn())return;e.stopImmediatePropagation();S.zoomIn=!S.zoomIn;draw();duelUI()},true);
{const baseRender=render;render=function(){const r=baseRender.apply(this,arguments);try{duelUI()}catch(e){}return r}}

/* ---------- "look at the board" (👁) only while an event is actually on the sand ---------- */
{const baseModal=modal;modal=function(title,body,buttons,opt){
  if(title==='Rules & strategy'&&typeof body==='string'&&!body.includes('rulTab-gloss')){
    body=body.replace(/(data-rul="learn"[^>]*>🎓 Lessons<\/button>)/,'$1<button type="button" data-rul="gloss">📖 Glossary</button>').replace('<div id="rulTab-build"',`<div id="rulTab-gloss" hidden>${glossaryHTML()}</div><div id="rulTab-build"`)}
  const p=baseModal.apply(this,arguments.length>1?[title,body,buttons,opt]:arguments);
  try{const peek=$('#mPeek');const live=S&&!S.over&&S.phase!=='setup'&&$('#mainMenu').hidden;if(peek&&!live)peek.hidden=true}catch(e){}
  return p}}

/* ---------- tooltips cascade two levels at most; a term never links to itself ---------- */
const TT_MAX_DEPTH=2; /* TWEAK: how many tooltips can stack */
{const baseOpen=ttOpen;ttOpen=function(anchor){const level=TT.stack.findIndex(t=>t.el.contains(anchor))+1;if(level>=TT_MAX_DEPTH)return;baseOpen(anchor);
  try{const top=TT.stack[TT.stack.length-1];if(!top)return;const own=anchor.dataset.tt;
    top.el.querySelectorAll('.gl').forEach(term=>{if(level+1>=TT_MAX_DEPTH||term.dataset.tt===own)term.replaceWith(document.createTextNode(term.textContent))});
    ttPlace(top.el,anchor)}catch(e){}}}
/* the full glossary, in Rules & strategy */
function glossaryHTML(){const plain=s=>String(s).replace(/\[\[\w+\|([^\]]+)\]\]/g,'$1').replace(/\[\[(\w+)\]\]/g,(m,k)=>GLOSS[k]?GLOSS[k].t:k);
  return `<div class="glossary">${Object.values(GLOSS).sort((a,b)=>a.t.localeCompare(b.t)).map(G=>`<div class="glrow"><b>${esc(G.t)}</b><span>${esc(plain(G.d))}</span></div>`).join('')}</div>`}
document.addEventListener('click',e=>{const tab=e.target.closest('[data-rul]');if(!tab)return;const g=document.getElementById('rulTab-gloss');if(!g)return;g.hidden=tab.dataset.rul!=='gloss'});
