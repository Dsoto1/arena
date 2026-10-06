/* 196-v91srv — v0.91 THE ONLINE SERVER'S VERSION (his ask 2026-10-06, after "Unknown request: domus.look" — the page was newer than the
   server running on AWS). hello now carries build {v, hash} (server/src/build.json, stamped by tools/srvstamp.js); this page knows the
   server it expects (SRV_EXPECT91, generated into 195-v91srvexp.js).
   • A small chip at the bottom left of every Online screen: "Server v0.91" (muted) — or amber "⚠ Server v0.89 · this page needs v0.91" when
     the hashes differ, "⚠ Server older than v0.91" when the server sends no build at all; the practice (mock) server says so.
   • A request the server does not know no longer toasts "Unknown request: x" — it says the server needs updating (and the chip turns amber). */
const SRV91={build:undefined,mode:null,unknown:null};
{const base=NET.req;NET.req=function(t,d){const p=base.apply(this,arguments);
  return Promise.resolve(p).then(r=>{if(t==='hello'&&r){SRV91.build=r.build||null;SRV91.mode=r.mode||null;srv91Chip()}return r},
    e=>{const m=String(e&&e.message||e||'');if(/^Unknown request: /.test(m)){SRV91.unknown=t;srv91Chip();
      throw new Error(_T`The online server is older than this page and can't do that yet (${t}). It needs an update.`)}throw e})}}
/* the mock answers like the page's own server */
{const base=MOCK_ROUTES['hello'];if(base)MOCK_ROUTES['hello']=function(){const o=base.apply(this,arguments);try{if(o&&typeof SRV_EXPECT91!=='undefined')o.build={...SRV_EXPECT91}}catch(e){}return o}}
function srv91State(){const X=typeof SRV_EXPECT91!=='undefined'?SRV_EXPECT91:{};const B=SRV91.build;
  if(SRV91.mode==='mock')return {k:'mock',txt:_T('Server: practice (this browser)')};
  if(B===undefined)return null;
  if(!B)return {k:'old',txt:_T`⚠ Server older than v${X.v||'?'} — some actions won't work until it's updated`};
  if(X.hash&&B.hash!==X.hash)return {k:'old',txt:_T`⚠ Server v${B.v} · this page needs v${X.v} — some actions won't work until it's updated`};
  if(SRV91.unknown)return {k:'old',txt:_T`⚠ Server v${B.v} is missing "${SRV91.unknown}" — it needs an update`};
  return {k:'ok',txt:_T`Server v${B.v}`}}
function srv91Chip(){let c=document.getElementById('srv91');const on=!!document.getElementById('onl');const st=on?srv91State():null;
  if(!st){if(c)c.remove();return}
  if(!c){c=document.createElement('div');c.id='srv91';c.setAttribute('translate','no');document.body.appendChild(c)}
  c.className='srv91 '+st.k;if(c.textContent!==st.txt)c.textContent=st.txt;c.title=st.k==='ok'?_T('The online server is up to date with this page.'):''}
setInterval(srv91Chip,1000);
{const st=document.createElement('style');st.textContent=`
#srv91{position:fixed;left:10px;bottom:8px;z-index:9000;font:12px/1.3 system-ui,sans-serif;padding:3px 9px;border-radius:999px;pointer-events:auto;max-width:min(560px,70vw);
  background:rgba(20,14,10,.72);color:#bfae90;border:1px solid rgba(191,174,144,.35)}
#srv91.old{background:rgba(70,40,6,.92);color:#ffd27a;border-color:#e0a030}
#srv91.mock{color:#9fb7c8;border-color:rgba(159,183,200,.4)}
body.onlarena #srv91{display:none}`;document.head.appendChild(st)}
