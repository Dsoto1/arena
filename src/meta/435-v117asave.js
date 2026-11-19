/* 435-v117asave — v1.17a SAVES NEVER FAIL SILENTLY (his F1 F2 F3 F5, 2026-11-19; the audit is tools/plans/v117/AUDIT-saves.md). Store.put / Store.del
   never threw: on the live site every write is a localStorage.setItem inside an empty catch, so a full browser (Safari ~5 MB) stopped ALL saving
   without a word. This module WRAPS (nothing in the old modules changes except one line in 11-extra, see F3):
   • DETECT: Storage.prototype.setItem is wrapped to COUNT failures of flavius_* keys (it rethrows exactly as before). Store.put / Store.del
     (outermost wrapper, so the deliberate no-ops of RPP / hot seat / daily / designer-test / online guards, which return before any setItem, can
     never count) compare that count for their own key before and after: a real failure = F1. A shared-DB write that fell back to this browser
     and was stored there is NOT a failure (the fallback setItem succeeded). Store.lastError = {col,id,op,at,err}; BUS.emit('saveFail',{col,id,err}).
   • F1 ONE banner per page session (#save117a, "could not be saved — storage is full") with "Download a backup" (downloadSnapshot(snapshotAll()))
     and ✕. The previous data stays (setItem leaves it). matchAutosave / r102Write (resume pointer) are wrapped the same way (match slot or pointer
     key failing). matchSaveDialog / Settings "Save now" keep their own messages (handled well, not touched).
   • F2 loadSnapshot is re-implemented: write every backup doc first and check each; only when all succeeded delete the docs not in the backup,
     then the flavius_* keys, then reload. Any failure stops (no further deletes, no reload) with one line; no banner on top of it.
   • F3 mToast is wrapped: a "saved / is in your careers / is in slot k / off the press / forged …" toast within 3 s after a saveFail is dropped
     (the banner already says it): covers the Studio saves, saveUpload, Save-now toasts without touching each site. ONE direct edit: 11-extra
     gladiatorRecord sets row.p.saved only when the write did not fail (Store.lastError.at >= start).
   • F5 snapshotAll refuses (one line + throws) when listing a collection failed instead of exporting it empty. pagehide / visibilitychange→hidden
     flush a pending saveWorld debounce (saveWorld(true)).
   Kill switch: localStorage flavius_v117asaveoff=1 = today's behaviour exactly (read each call; set before load for the setItem counter). */
const SAVE117A=(()=>{
const off=()=>{try{return localStorage.getItem('flavius_v117asaveoff')==='1'}catch(e){return false}};
const FC={},FE={};let FAILAT=0,quiet=0,banned=false,pendingW=false;
if(!off()){try{const si=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){try{return si.apply(this,arguments)}catch(e){
  try{if(this===localStorage&&String(k).indexOf('flavius_')===0){FC[k]=(FC[k]|0)+1;FE[k]=e}}catch(x){}throw e}}}catch(e){}}
const cnt=k=>FC[k]|0;
/* the banner: once per page session */
function banner(){if(banned||quiet||typeof document==='undefined'||!document.body)return;banned=true;
  try{if(!document.getElementById('save117astyle')){const st=document.createElement('style');st.id='save117astyle';st.textContent=`#save117a{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:100002;width:min(560px,calc(100vw - 32px));display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 12px;border:1px solid #c9a24e;border-radius:8px;background:#3a1a10;color:#f1e4c4;box-shadow:0 6px 24px rgba(0,0,0,.5);font-size:14px}#save117a b{flex:1 1 220px}#save117a .btn{white-space:nowrap}`;document.head.appendChild(st)}
    const d=document.createElement('div');d.id='save117a';d.setAttribute('role','alert');
    d.innerHTML=`<b>${esc(_T('Your progress could not be saved — this browser\'s storage is full.'))}</b><button type="button" class="btn primary" data-s117dl>${esc(_T('Download a backup'))}</button><button type="button" class="btn" data-s117x aria-label="${esc(_T('Close'))}">✕</button>`;
    d.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;if(t.hasAttribute('data-s117x')){d.remove();return}
      if(t.hasAttribute('data-s117dl')){try{await downloadSnapshot(await snapshotAll())}catch(err){if(!(err&&err.refused))mToastSafe(_T('⚠ The backup could not be made here.'))}}});
    document.body.appendChild(d)}catch(e){}}
function fail(col,id,op,err){FAILAT=Date.now();const e=err||FE['flavius_'+col]||null;Store.lastError={col,id,op,at:FAILAT,err:e};
  try{BUS.emit('saveFail',{col,id,err:e})}catch(x){}banner()}
/* Store.put / Store.del */
{const sp=Store.put,sd=Store.del;
  Store.put=function(col,id){if(off())return sp.apply(this,arguments);const k='flavius_'+col,n0=cnt(k);if(col==='mgrCareers')pendingW=false;
    const r=sp.apply(this,arguments);const chk=v=>{if(v!==true&&cnt(k)>n0)fail(col,id,'put');return v};return r&&r.then?r.then(chk):chk(r)};
  Store.del=function(col,id){if(off())return sd.apply(this,arguments);const k='flavius_'+col,n0=cnt(k);
    const r=sd.apply(this,arguments);const chk=v=>{if(cnt(k)>n0)fail(col,id,'del');return v};return r&&r.then?r.then(chk):chk(r)}}
/* match autosave + resume pointer */
{const b=matchAutosave;matchAutosave=function(){if(off())return b.apply(this,arguments);const k=MSAVE_KEY('auto'),n0=cnt(k);const r=b.apply(this,arguments);if(cnt(k)>n0)fail('matchSave','auto','put');return r}}
{const b=r102Write;r102Write=function(kind){if(off())return b.apply(this,arguments);let slot='auto';try{slot=r102Slot()}catch(e){}
  const k1=MSAVE_KEY(slot),k2=R102.KEY,n1=cnt(k1),n2=cnt(k2);const r=b.apply(this,arguments);
  if(cnt(k1)>n1||cnt(k2)>n2){fail('matchSave',slot,'put');return false}return r}}
/* F3: a "saved" toast right after a failed save is not shown */
{const mt=mToast;mToast=function(h){if(!off()&&FAILAT&&Date.now()-FAILAT<3000&&/saved|your careers|in slot|off the press|forged|hammered|stored/i.test(String(h)))return;return mt.apply(this,arguments)}}
/* F2: a restore that cannot lose the player's progress */
{const b=loadSnapshot;loadSnapshot=async function(snap){if(off()||!snap||snap.game!=='flavius-rule'||!snap.cols)return b.apply(this,arguments);
  mToastSafe(_T('Restoring the save…'));quiet++;
  const stop=()=>{quiet--;mToastSafe(_T('The restore stopped — this browser could not store the save. Nothing of yours was deleted.'));return false};
  try{const drop=[];
    for(const c of SAVE_COLS){const want=snap.cols[c]||[];const ids=new Set(want.map(d=>d.id));let cur=[];try{cur=await Store.list(c)}catch(e){}
      for(const d of cur)if(!ids.has(d.id))drop.push([c,d.id]);
      for(const d of want){const {id,...rest}=d;const k='flavius_'+c,n0=cnt(k);const r=await Store.put(c,id,rest);if(r!==true&&cnt(k)>n0)return stop()}}
    for(const [c,id] of drop){const k='flavius_'+c,n0=cnt(k);await Store.del(c,id);if(cnt(k)>n0)return stop()}
    try{for(const [k,v] of Object.entries(snap.ls||{}))localStorage.setItem(k,v)}catch(e){return stop()}
  }catch(e){return stop()}
  quiet--;setTimeout(()=>location.reload(),400)}}
/* F5: no empty collection in a backup */
{const b=snapshotAll;snapshotAll=async function(){if(off())return b.apply(this,arguments);const fails=[];const l=Store.list;
  Store.list=async function(c){try{return await l.apply(this,arguments)}catch(e){if(SAVE_COLS.includes(c))fails.push(c);throw e}};
  let r;try{r=await b.apply(this,arguments)}finally{Store.list=l}
  if(fails.length){mToastSafe(_T('The backup was refused — part of your saves could not be read.'));const e=new Error('backup refused: '+fails.join(','));e.refused=1;throw e}return r}}
/* F5: flush the pending saveWorld debounce when the page goes away */
{const b=saveWorld;saveWorld=function(now=false){if(!off()&&!now)pendingW=true;return b.apply(this,arguments)};
  const flush=()=>{if(off()||!pendingW)return;pendingW=false;try{saveWorld(true)}catch(e){}};
  addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()})}
return {FC,banner,fail}})();
