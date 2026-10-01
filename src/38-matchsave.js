/* =====================================================================
   38-MATCHSAVE · SAVING A MATCH MID-BOUT (v0.45)
   =====================================================================
   A Play now / New event match can be saved on YOUR move (action phase, nothing resolving,
   no window open) into one of three slots, and the game keeps an automatic save once per
   rotation. The whole board goes in: every token, wound, coin, card, beast, spectator and the
   dice stream itself — a loaded match continues roll for roll. Manager-mode bouts, tutorials,
   tournaments and exhibitions are not saved this way (their careers keep their own saves).
   Slots live in this browser (flavius_match_1..3, flavius_match_auto), so a full game save or
   download carries them along. */
const MSAVE_SLOTS=['1','2','3','auto'];
const MSAVE_KEY=k=>'flavius_match_'+k;
function matchSaveOK(){return !!(S&&!S.over&&!HEADLESS&&(S.phase==='action'||S.phase==='choice')&&!S.busy&&typeof humanTurn==='function'&&humanTurn()&&!S.mgrCtx&&!S.specCtx&&!S.tutorial&&!S.sim&&!S.tourn&&!S.exhib&&!S.pending&&!CUR_MODAL&&$('#modal').hidden)}
function matchSnapshot(name){
  const txt=JSON.stringify(S,(k,v)=>v instanceof Set?{__set:[...v]}:v instanceof Map?{__map:[...v]}:v);
  const lis=[...$('#log').children].slice(0,400).map(li=>li.outerHTML).join('');
  const ev=EV();const loc=LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:'Roma';
  return {game:'flavius-match',v:'0.45',at:new Date().toISOString(),name:name||`${ev.short||ev.n} · ${loc} · rotation ${S.rotation}`,
    summary:`${ev.short||ev.n} at ${loc} · round ${S.ri+1}/${ev.rounds.length} · rotation ${S.rotation} · ${S.players.filter(p=>p.alive&&!p.exited).length}/${S.players.length} standing`,
    S:txt,rng:RNG?RNG.s:0,uid,log:lis,speed:SPEED}}
function matchSlotGet(k){try{const t=localStorage.getItem(MSAVE_KEY(k));return t?JSON.parse(t):null}catch(e){return null}}
function matchSlotPut(k,snap){try{localStorage.setItem(MSAVE_KEY(k),JSON.stringify(snap));return true}catch(e){return false}}
function matchSlotDel(k){try{localStorage.removeItem(MSAVE_KEY(k))}catch(e){}}
function matchAutosave(){if(!matchSaveOK()||S._autoRot===S.rotation)return;S._autoRot=S.rotation;matchSlotPut('auto',matchSnapshot(null))}
/* the slot picker: fromMenu → leave for the menu once saved */
async function matchSaveDialog(fromMenu){
  if(!matchSaveOK()){mToastSafe('💾 A match can be saved on your own move — when nothing is resolving and no window is open.');return false}
  const snapNow=matchSnapshot(null);MSAVE_NAME=snapNow.name;
  const rows=MSAVE_SLOTS.filter(k=>k!=='auto').map(k=>{const sv=matchSlotGet(k);return {label:`Slot ${k}${sv?' · overwrite':' · empty'}`,sub:sv?`${sv.name} · ${new Date(sv.at).toLocaleString()}`:'save the match here',value:'s'+k}});
  const v=await modal('💾 Save this match',`<p>Saves <b>${esc(snapNow.summary)}</b> exactly as it stands. Load it later from <b>Play now → Load game</b> on the main menu.</p><label style="display:block;margin:6px 0">Name <input type="text" id="msName" value="${esc(snapNow.name)}" style="width:100%"></label>`,
    [...rows,{label:'Cancel',value:null}],{close:null});
  if(!v)return false;
  const snap=matchSnapshot((MSAVE_NAME||'').trim()||snapNow.name);
  const ok=matchSlotPut(v.slice(1),snap);
  mToastSafe(ok?`💾 Match saved to slot ${v.slice(1)}${fromMenu?' — see you back on the sand.':''}`:'This browser would not keep the save (storage full?).');
  return ok}
/* the name field lives inside the modal, which is gone once a button is clicked — remember it as it changes */
document.addEventListener('input',e=>{if(e.target&&e.target.id==='msName')MSAVE_NAME=e.target.value});
let MSAVE_NAME=null;
async function matchLoad(k){const snap=matchSlotGet(k);if(!snap||snap.game!=='flavius-match'){mToastSafe('That slot is empty.');return false}
  const fresh=JSON.parse(snap.S,(key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?(v.__set?new Set(v.__set):v.__map?new Map(v.__map):v):v);
  if(S&&!S.over)S.over=true; // whatever was running stops here
  try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}
  for(const p of fresh.players){const c=p._cf!=null?p._cf:(p.cf||0);delete p.cf;p._cf=c;cfTrack(p)}
  fresh.over=false;fresh.busy=false;fresh.shelved=false;fresh.startedAt=Date.now();fresh._autoRot=fresh.rotation;
  S=fresh;RNG=mulberry32(0);RNG.s=snap.rng>>>0;uid=snap.uid||uid;
  if(typeof AUD!=='undefined'){AUD.manual=null;AUD.paused=false}
  SPEED=snap.speed&&snap.speed!=='pause'?snap.speed:'slow';document.querySelectorAll('[data-speed]').forEach(x=>x.classList.toggle('on',x.dataset.speed===SPEED));
  $('#log').innerHTML=snap.log||'';
  if(typeof SETTINGS!=='undefined'&&SETTINGS.locFlavor!==false&&typeof LOC_THEMES!=='undefined'&&LOC_THEMES[S.locIdx])try{applyTheme({...(typeof USER_THEME!=='undefined'&&USER_THEME||THEME),...LOC_THEMES[S.locIdx].v},false)}catch(e){}
  if(typeof CURTAIN!=='undefined'){CURTAIN.v=0;CURTAIN.to=0}
  try{if(typeof menuHide==='function')menuHide()}catch(e){}if(typeof MM!=='undefined')MM.fromMenu=false;
  window.SETUP_OPEN=false;
  log(`💾 The match resumes from “${esc(snap.name)}” — ${esc(snap.summary)}.`,'big');
  render();window.scrollTo(0,0);try{if(typeof audTick==='function')audTick()}catch(e){}
  return true}
function matchSavesHTML(mode){const L=MSAVE_SLOTS.map(k=>({k,sv:matchSlotGet(k)})).filter(x=>mode!=='load'||x.sv);
  return `${mode?'':'<h4 class="secth" style="margin-top:0">⚔ Match saves <span class="rc-sub">Play now / New event, saved mid-bout — three slots and an automatic save each rotation</span></h4>'}
  <div class="list">${L.map(({k,sv})=>`<div class="item"><span>${k==='auto'?'🔁 <b>Autosave</b>':`💾 <b>Slot ${k}</b>`}<em>${sv?`${esc(sv.name)} · ${esc(new Date(sv.at).toLocaleString())} · ${esc(sv.summary||'')}`:'empty'}</em></span><span style="display:flex;gap:4px">${sv&&mode!=='manage'?`<button class="btn primary" type="button" data-mload="${k}">▶ Load</button>`:''}${sv&&mode!=='load'?`<button class="btn" type="button" data-mren="${k}" title="Rename">✎</button><button class="btn" type="button" data-mdl="${k}" title="Download this save">⬇</button><button class="btn" type="button" data-mdel="${k}">🗑</button>`:''}${k!=='auto'&&matchSaveOK()?`<button class="btn" type="button" data-msave="${k}">Save here</button>`:''}</span></div>`).join('')}</div>
  ${!L.length?'<p class="rc-sub">No saved matches yet — save one on your move with 💾 Save match in the arena.</p>':''}<p class="rc-sub" style="margin:4px 0 14px">${matchSaveOK()?'You are on your move: the match can be saved now.':'Save a match on your own move in the arena (💾 on the canvas toolbar, or when leaving for the main menu).'}</p>`}
document.addEventListener('click',async e=>{
  const ld=e.target.closest('[data-mload]');if(ld){const c=CUR_MODAL;if(c)c.done('x');setTimeout(()=>matchLoad(ld.dataset.mload),150);return}
  const dl=e.target.closest('[data-mdel]');if(dl){if(!dl.dataset.armed){dl.dataset.armed=1;dl.textContent='Confirm delete';return}matchSlotDel(dl.dataset.mdel);const box=dl.closest('.list');if(box)box.parentElement.querySelector('[data-mdel]');dl.closest('.item').querySelector('em').textContent='empty';dl.remove();return}
  const rn=e.target.closest('[data-mren]');if(rn){const k=rn.dataset.mren;const sv0=matchSlotGet(k);if(!sv0)return;const it=rn.closest('.item');const em=it.querySelector('em');em.innerHTML=`<input type="text" class="tin" value="${esc(sv0.name)}" style="width:70%"> <button class="btn tksm" type="button">Save name</button>`;const inp=em.querySelector('input');inp.focus();em.querySelector('button').onclick=()=>{sv0.name=inp.value.trim()||sv0.name;matchSlotPut(k,sv0);em.textContent=`${sv0.name} · ${new Date(sv0.at).toLocaleString()} · ${sv0.summary||''}`};return}
  const md=e.target.closest('[data-mdl]');if(md){const sv0=matchSlotGet(md.dataset.mdl);if(sv0&&typeof downloadSnapshot==='function'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(sv0)],{type:'application/json'}));a.download=`flavius-match-${String(sv0.name).replace(/[^\w-]+/g,'-').slice(0,40)}.json`;document.body.appendChild(a);a.click();a.remove()}return}
  const sv=e.target.closest('[data-msave]');if(sv){if(!matchSaveOK())return;const ok=matchSlotPut(sv.dataset.msave,matchSnapshot(null));mToastSafe(ok?`💾 Saved to slot ${sv.dataset.msave}`:'This browser would not keep the save.');const em=sv.closest('.item').querySelector('em');if(em&&ok)em.textContent='saved just now';return}
  if(e.target.closest('#btnMSave')){matchSaveDialog(false)}});
function matchSaveUI(){if(HEADLESS)return;const b=document.getElementById('btnMSave');if(!b)return;const show=!!(S&&!S.over&&S.phase!=='setup'&&!S.mgrCtx&&!S.specCtx&&!S.tutorial&&!S.tourn&&!S.exhib);b.hidden=!show;const ok=matchSaveOK();b.classList.toggle('dim',!ok);b.title=ok?'Save this match exactly as it stands — three slots, plus an automatic save every rotation':'Saving waits for your own move (a CPU is acting, or a window is open)';
  if(show)setTimeout(matchAutosave,30)}
/* v0.46: the button's state follows the game even between renders (a CPU finishing, a window closing) */
setInterval(()=>{try{matchSaveUI()}catch(e){}},600);
