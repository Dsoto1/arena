/* 429-v112check — v1.12 RANKED CHECK, the page side (his picks R1a–R6a; docs/backend.md "v1.12 Ranked check"; server routes.js
   "v1.12 RANKED CHECK"). NO protocol bump.
   The server now holds every Ranked match until its replay is checked and answers match.result with {pending:true, check112:1} (the
   lanistas have all reported — nobody else is awaited). Then the waiting toast says so: "⏳ The scribes check the result…" (once a match)
   instead of "⏳ Waiting for the other lanistas to confirm the result…"; the match.settled push ends the wait as before (112 / 124).
   Pages before v1.12 simply show their old toast. Kill switch: localStorage flavius_check112off=1. */
const CHECK112={shown:{},cur:null,off:(()=>{try{return localStorage.getItem('flavius_check112off')==='1'}catch(e){return false}})()};
const check112Text=()=>_T('⏳ The scribes check the result…');
if(typeof NET!=='undefined'&&!CHECK112.off){const base=NET.req;NET.req=function(t,d){const p=base.apply(this,arguments);
  try{if(t==='match.result'&&d&&d.id&&p&&typeof p.then==='function')p.then(r=>{try{if(!r||!r.pending||!r.check112)return;const id=d.id;CHECK112.cur=id;
      if(!CHECK112.shown[id]){CHECK112.shown[id]=Date.now();setTimeout(()=>{if(CHECK112.cur===id&&typeof mToast==='function')mToast(check112Text())},2500)}}catch(e){}},()=>{})}catch(e){}
  return p}}
/* the old "waiting for the others" toast is not shown while the scribes check that match */
if(typeof mToast==='function'&&!CHECK112.off){const base=mToast;mToast=function(m){try{if(CHECK112.cur&&ONL.waitSettle===CHECK112.cur&&String(m)===_T('⏳ Waiting for the other lanistas to confirm the result…'))return}catch(e){}return base.apply(this,arguments)}}
if(typeof NET!=='undefined')NET.on('match.settled',d=>{if(d&&d.id&&d.id===CHECK112.cur)CHECK112.cur=null});
