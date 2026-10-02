/* =====================================================================
   109-V761 · v0.76 follow-up — safe updates while people are playing
   =====================================================================
   • Update notice: on a hosted copy (http/https) the page asks for version.json beside it ({"v":"0.77"}) every
     5 minutes and when the tab comes back into view (no-store fetch; any failure is silent — file:// and the artifact
     simply never find it). A newer version shows a small bar: finish your match, then reload. It never reloads by
     itself; Reload during a live match asks first.
   • Newer-version guard: every page that runs writes the newest version it knows into localStorage flavius_newestver.
     An older page (a tab left open, a cached copy) that sees a newer number — or holds a Manager world saved by a
     newer version (w.ver) — refuses to write: Store.put, saveWorld and matchSlotPut are blocked and the bar says
     to reload. Saves are never overwritten by an older build.
   ===================================================================== */
const NEWEST76='flavius_newestver',VERPOLL76=5*60*1000;
(()=>{try{const n=localStorage.getItem(NEWEST76);if(!n||verCmp(n,GAME_VER)<0)localStorage.setItem(NEWEST76,GAME_VER)}catch(e){}})();
function newerSeen76(){let n=null;try{const v=localStorage.getItem(NEWEST76);if(v&&verCmp(v,GAME_VER)>0)n=v}catch(e){}
  try{const w=typeof W_==='function'&&W_();if(w&&w.ver&&verCmp(w.ver,GAME_VER)>0&&(!n||verCmp(w.ver,n)>0))n=w.ver}catch(e){}return n}
function updBar76(v,stale){if(typeof HEADLESS!=='undefined'&&HEADLESS)return;let b=document.getElementById('upd76');
  if(!b){b=document.createElement('div');b.id='upd76';b.setAttribute('role','status');document.body.appendChild(b)}
  if(b.dataset.v===v+(stale?'s':'')&&!b.hidden)return;b.dataset.v=v+(stale?'s':'');b.hidden=false;
  b.innerHTML=stale?`<span>🆕 <b>v${esc(v)}</b> is open in another tab or was saved there — this copy won't save until you reload.</span><button type="button" class="btn tksm primary" data-upd76="go">Reload</button>`
    :`<span>🆕 <b>v${esc(v)}</b> is out — finish your match, then reload.</span><button type="button" class="btn tksm primary" data-upd76="go">Reload</button><button type="button" class="btn tksm" data-upd76="x" aria-label="Later">Later</button>`}
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-upd76]');if(!b)return;e.preventDefault();e.stopPropagation();const bar=document.getElementById('upd76');
  if(b.dataset.upd76==='x'){if(bar)bar.hidden=true;return}
  const live=typeof S!=='undefined'&&S&&!S.over&&S.phase!=='setup';
  if(live&&typeof ask76==='function'&&!(await ask76('Reload now?','This match ends here unless it is saved.','Reload','Keep playing')))return;
  location.reload()},true);
async function verPoll76(){if(!/^https?:$/.test(location.protocol))return;try{const r=await fetch('version.json',{cache:'no-store'});if(!r.ok)return;const j=await r.json();const v=j&&String(j.v||'');
  if(v&&/^\d+\.\d+$/.test(v)&&verCmp(v,GAME_VER)>0){try{if(verCmp(localStorage.getItem(NEWEST76)||'0',v)<0)localStorage.setItem(NEWEST76,v)}catch(e){}updBar76(v,false)}}catch(e){}}
setTimeout(verPoll76,8000);setInterval(verPoll76,VERPOLL76);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')verPoll76()});
/* the guard: an older build never writes over what a newer one saved */
let blockSaid76=0;
function saveBlocked76(){const n=newerSeen76();if(!n)return false;updBar76(n,true);if(Date.now()-blockSaid76>20000&&typeof mToast==='function'){blockSaid76=Date.now();mToast(`🆕 A newer version (v${esc(n)}) is in use — reload to keep saving.`)}return true}
{const base=Store.put;Store.put=function(){if(saveBlocked76())return Promise.resolve(null);return base.apply(this,arguments)}}
{const base=saveWorld;saveWorld=function(){if(saveBlocked76())return Promise.resolve(null);return base.apply(this,arguments)}}
{const base=matchSlotPut;matchSlotPut=function(){if(saveBlocked76())return false;return base.apply(this,arguments)}}
(()=>{const st=document.createElement('style');st.textContent=`
#upd76{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:5000;display:flex;flex-wrap:wrap;gap:8px;align-items:center;max-width:calc(100vw - 32px);
  padding:8px 12px;background:var(--panel,#1f1711);border:1px solid var(--gold,#d6ab4c);border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.55);font-size:14px;color:var(--bone,#efe3cc)}
#upd76[hidden]{display:none}`;document.head.appendChild(st)})();

/* ---------- every delete of a custom creation asks first (a centred popup naming it; one answer — the old two-click
   "Confirm delete" buttons go straight through after it) ---------- */
const DEL76='[data-st="del"],[data-st="spdel"],[data-clsa="del"],[data-trs="del"],[data-sps="del"],[data-fda="del"],[data-gs="wdel"],[data-gs="adel"],[data-cr="del"],[data-rs="del"]';
function delName76(b){const box=b.closest('.lrow,.setcard,.card2,tr,li,.studcard,.row')||b.parentElement;const n=box&&box.querySelector('b,strong,.nm,.name');const t=(n&&n.textContent||'').trim();return t&&t.length<60?t:'this creation'}
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest(DEL76);if(!b||b.disabled)return;if(b.dataset.del76ok){delete b.dataset.del76ok;return}
  e.preventDefault();e.stopPropagation();const ok=await ask76(`🗑 Delete ${esc(delName76(b))}?`,'It is gone for good — this cannot be undone.','Delete','Keep it');if(!ok||!b.isConnected)return;
  b.dataset.del76ok='1';if(b.dataset.st)b.dataset.armed='1';b.click()},true);
