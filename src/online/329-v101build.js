/* 329-v101build — v1.01 wave 2 Phase E (the server checks Ranked results; docs/backend.md "v1.01 Ranked verification"):
   the host's match.open carries `build` = the first 12 hex of sha256(this page's main script), the SAME number tools/node/mkbundle.js
   prints (--hash) and stamps on the rules bundle the verify Lambda runs. The server keeps it on the match (META.build); a match played on
   another build than the deployed rules is skipped by the verifier (never judged by the wrong rules).
   How: document.currentScript at load = the one big inline script; its text = '\n' + the script mkbundle hashes (build.sh writes
   "<script>\n" + the code). Hashed once, lazily (crypto.subtle, https only — online pages are https; file:// and Node send no build).
   An optional field: an older server ignores it (no protocol bump). The mock server (112) stores it the same way. */
const BUILD101={el:(typeof document!=='undefined'&&document.currentScript)||null,h:null,p:null};
function build101(){if(BUILD101.h!=null)return Promise.resolve(BUILD101.h);if(BUILD101.p)return BUILD101.p;
  BUILD101.p=(async()=>{try{const el=BUILD101.el;const sub=typeof crypto!=='undefined'&&crypto.subtle;if(!el||!sub||el.src)return BUILD101.h='';
      let t=el.textContent||'';if(t.charAt(0)==='\n')t=t.slice(1);if(t.length<100000)return BUILD101.h='';
      const d=await sub.digest('SHA-256',new TextEncoder().encode(t));BUILD101.h=[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,12)}
    catch(e){BUILD101.h=''}return BUILD101.h})();return BUILD101.p}
if(typeof NET!=='undefined'){const base=NET.req;NET.req=function(t,d){if(t!=='match.open'||!d||typeof d!=='object'||d.build)return base.apply(this,arguments);const self=this;
    /* never holds the opening long: 2 s at most, then it goes without a build (the verifier then skips that match) */
    return Promise.race([build101(),new Promise(r=>setTimeout(()=>r(''),2000))]).then(b=>base.call(self,t,b?{...d,build:b}:d))}}
if(typeof MOCK_ROUTES!=='undefined'&&MOCK_ROUTES['match.open']){const base=MOCK_ROUTES['match.open'];MOCK_ROUTES['match.open']=function(w,d,me){const r=base.apply(this,arguments);
  try{const M=w.matches[d.id];if(M&&!M.build&&/^[0-9a-f]{12}$/.test(String(d.build||'')))M.build=d.build}catch(e){}return r}}
