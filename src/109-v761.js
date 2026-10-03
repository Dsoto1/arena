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

/* ---------- Studio fixes (after v0.76, Virgilante):
   • custom armor comes in ONE level (the level boxes act as a choice; an older multi-level piece keeps its first level when edited)
   • system armor and weapons are examples only — no Copy & edit, no printed pieces in "Start from": sculpt your own
   • the class designer's system classes show his printed class cards ---------- */
document.addEventListener('change',e=>{const c=e.target.closest&&e.target.closest('input[data-calv="on"]');if(!c||typeof ST==='undefined'||!ST.ca)return;const d=ST.ca;caLevelsInit(d);const n=+c.dataset.n;
  if(!c.checked){e.stopImmediatePropagation();c.checked=true;return}for(const k of [1,2,3])if(k!==n&&d.levels[k])d.levels[k].on=0},true);
{const base=caLevelsInit;caLevelsInit=function(ca){const r=base.apply(this,arguments);try{if(ca&&ca.levels){const on=[1,2,3].filter(n=>ca.levels[n]&&ca.levels[n].on);for(const n of on.slice(1))ca.levels[n].on=0}}catch(e){}return r}}
{const base=caLevelsHTML;caLevelsHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(/(<div class="sect" style="margin:4px 0">Levels <span class="rc-sub">)[^<]*/,'$1pick its level · AP 1 point each above the first · bonus AP 2 · stackable 1').replace(/type="checkbox" data-calv="on"/g,'type="radio" name="calv76" data-calv="on"')}catch(e){}return h}}
const sysExample76=h=>h.replace(/<button class="btn tksm" type="button" disabled title="System sets are locked[^"]*">Edit<\/button><button class="btn tksm primary" type="button" data-gs="c[aw]sys" data-id="[^"]*">⧉ Copy &amp; edit<\/button>/g,'')
  .replace(/title="System sets are locked so the defaults are always there — copy one to make it yours">🔒 System/g,'title="The printed set — shown as examples">🔒 Example');
{const base=armSetsHTML;armSetsHTML=function(){let h=base.apply(this,arguments);try{h=sysExample76(h).replace('Nothing forged yet — save a piece above, or copy a printed one.','Nothing forged yet — sculpt your own above.').replace(/(<h4>🔒 System armor · \d+ <span class="rc-sub">)the printed pieces/,'$1examples · the printed pieces')}catch(e){}return h}}
{const base=wpnSetsHTML;wpnSetsHTML=function(){let h=base.apply(this,arguments);try{h=sysExample76(h).replace(/(<h4>🔒 System weapons · \d+)/,'$1 <span class="rc-sub">examples · make your own above</span>')}catch(e){}return h}}
{const base=caStartHTML;caStartHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(/<label>Start from<select data-caf="start">[\s\S]*?<\/select><\/label>/,'')}catch(e){}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-gs="casys"],[data-gs="cwsys"]');if(b){e.preventDefault();e.stopImmediatePropagation()}},true);
{const base=classStudioHTML;classStudioHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(/(<div class="lrow" style="--pc:[^"]*" data-card="k:(\w+)">)[\s\S]*?(<div class="t">)/g,(m0,a,k,t)=>a+`<span class="clscard76">${cardHTML('k:'+k,'sm')}</span>`+t)}catch(e){console.error(e)}return h}}
(()=>{const st=document.createElement('style');st.textContent=`.clscard76{flex:none;width:92px;display:block}.clscard76 .cimg,.clscard76 img{width:92px!important;height:auto}`;document.head.appendChild(st)})();
/* the system class rows quote his printed cards (ability + weakness); where the digital game pays it through a rating, say which */
const CLS_CARD_TXT76={soldier:'+1 damage on every successful round 1 attack.',royalty:'1 coin each turn — here, from Luck.',hero:'1 CF each turn — here, from Charisma.',slave:'1 extra movement each turn — here, from Speed.',
  veteranus:'1 coin or 1 CF each turn — here, from Luck and Charisma. Weakness: weapons, armor and CF purchases cost 1 more.',amazonia:'None. Weakness: never receives CF from Blessings.',
  venatore:'Declare Zora and place her mini into play. Weakness: can never use tunnels.',damnatio:'Gain 1 stone each turn; +10 CF to the final score if they win any event. Weakness: pelted with 1 stone (1 damage) each turn in phase 1.'};
{const base=classStudioHTML;classStudioHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(/(data-card="k:(\w+)">[\s\S]*?<div class="t">[\s\S]*?<\/span>)<small>[^<]*<\/small>/g,(m0,a,k)=>CLS_CARD_TXT76[k]?a+`<small>${esc(CLS_CARD_TXT76[k])}</small>`:m0)}catch(e){console.error(e)}return h}}
