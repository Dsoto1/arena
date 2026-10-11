/* 214-v92tabs — v0.92 TABS (his picks 2026-10-06).
   1. ONE LIVE ONLINE PER ACCOUNT: every tab connects with its own id (&tab=NET.conn, 114); when another tab of the same account connects,
      the server pushes 'session.replaced' to this one (server/src/index.js). This tab then covers itself — "Online is open in another
      tab · Use here" — and sends nothing more (NET.req refuses while covered). Use here reloads and reopens Online (a live match comes
      back through the usual rejoin), which takes Online back from the other tab. The same tab reconnecting is never a takeover.
   2. THE AUTOSAVE BELONGS TO ONE TAB (offline): the match Autosave slot and the hot-seat table slot are claimed by the tab that writes
      them (BroadcastChannel 'flavius_tabs', 138 TAB84); a tab that loses the claim stops autosaving and says so once ("Autosave moved to
      your other tab — 💾 save by hand to keep this one"). Starting or loading an event here claims it back. Hand slots are never touched. */
const TAB92={covered:false,auto:{},AUTO_SLOTS:['auto','table']};
/* ---------- 1 · online ---------- */
NET.on('session.replaced',()=>{if(NET.mode!=='aws'||TAB92.covered)return;TAB92.covered=true;tab92Cover()});
{const base=NET.req;NET.req=function(t){if(TAB92.covered&&NET.mode==='aws')return Promise.reject(new Error(_T('Online is open in another tab.')));return base.apply(this,arguments)}}
function tab92Cover(){if(HEADLESS)return;let c=document.getElementById('tab92');if(!c){c=document.createElement('div');c.id='tab92';c.setAttribute('role','alertdialog');document.body.appendChild(c)}
  c.innerHTML=`<div class="tab92b"><div class="tab92i">📑</div><b>${_T('Online is open in another tab')}</b><p>${_T('Only one tab can play Online at a time. This one has stopped.')}</p><div class="acts"><button type="button" class="btn primary" data-tab92="use">${_T('Use here')}</button><button type="button" class="btn" data-tab92="leave">${_T('Leave Online')}</button></div></div>`;c.hidden=false}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tab92]');if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.tab92==='use'){try{sessionStorage.setItem('flavius_onluse92','1')}catch(err){}location.reload();return}
  try{NETWS.close()}catch(err){}const c=document.getElementById('tab92');if(c)c.hidden=true;try{const o=document.getElementById('onl');if(o&&typeof onlClose==='function')onlClose()}catch(err){}
  try{if(typeof menuShow==='function')menuShow()}catch(err){}},true);
/* after "Use here": reopen Online once the page is up */
{let want=false;try{want=sessionStorage.getItem('flavius_onluse92')==='1';sessionStorage.removeItem('flavius_onluse92')}catch(e){}
  if(want&&!HEADLESS){const go=()=>{if(!window.FLAVIUS_READY){setTimeout(go,200);return}try{onlineOpen()}catch(e){console.error(e)}};setTimeout(go,300)}}
/* ---------- 2 · the autosave slots ---------- */
function auto92Claim(slot){if(TAB92.auto[slot]==='held')return;TAB92.auto[slot]='held';try{if(typeof tab84Post==='function')tab84Post({t:'auto92',slot})}catch(e){}}
{const base=tab84Msg;tab84Msg=function(m){if(m&&m.t==='auto92'&&m.from!==TAB84.id){if(TAB92.auto[m.slot]==='held'){TAB92.auto[m.slot]='lost';auto92Note(m.slot)}return}return base.apply(this,arguments)}}
{const base=matchSlotPut;matchSlotPut=function(slot,snap){if(TAB92.AUTO_SLOTS.includes(slot)){if(TAB92.auto[slot]==='lost')return false;auto92Claim(slot)}return base.apply(this,arguments)}}
/* a fresh or loaded event here takes the autosave back */
{const base=startEvent;startEvent=function(){for(const s of TAB92.AUTO_SLOTS)if(TAB92.auto[s]==='lost')delete TAB92.auto[s];const n=document.getElementById('auto92');if(n)n.hidden=true;return base.apply(this,arguments)}}
{const base=matchLoad;matchLoad=function(){for(const s of TAB92.AUTO_SLOTS)if(TAB92.auto[s]==='lost')delete TAB92.auto[s];const n=document.getElementById('auto92');if(n)n.hidden=true;return base.apply(this,arguments)}}
function auto92Note(slot){if(HEADLESS)return;const live=typeof S!=='undefined'&&S&&!S.over&&S.phase!=='setup'&&!S.onl;if(!live)return;
  let n=document.getElementById('auto92');if(!n){n=document.createElement('div');n.id='auto92';n.setAttribute('role','status');document.body.appendChild(n)}
  n.innerHTML=`<span>${slot==='table'?_T('🪑 The table’s autosave moved to your other tab — 💾 save by hand to keep this one.'):_T('Autosave moved to your other tab — 💾 save by hand to keep this one.')}</span><button type="button" class="btn tksm" data-auto92x aria-label="${_T('Close')}">✕</button>`;n.hidden=false}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-auto92x]');if(!b)return;const n=document.getElementById('auto92');if(n)n.hidden=true});
{const st=document.createElement('style');st.textContent=`
#tab92{position:fixed;inset:0;z-index:100000;background:rgba(10,6,3,.82);display:grid;place-items:center}
#tab92[hidden]{display:none}
#tab92 .tab92b{max-width:380px;margin:16px;padding:18px 20px;border:1px solid var(--gold,#c9a24e);border-radius:10px;background:#21170f;color:#e8dcc0;text-align:center}
#tab92 .tab92i{font-size:34px}#tab92 b{display:block;font:400 19px var(--display,serif);color:#f3e3b8;margin:4px 0}#tab92 p{margin:6px 0 12px;font-size:14px}
#tab92 .acts{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
#auto92{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9000;display:flex;gap:10px;align-items:center;padding:6px 10px;border:1px solid rgba(201,162,78,.5);border-radius:8px;background:#21170fee;color:#e8dcc0;font-size:13px;max-width:calc(100vw - 32px)}
#auto92[hidden]{display:none}`;document.head.appendChild(st)}
