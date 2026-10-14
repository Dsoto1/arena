/* 223-v93harden — v0.93 BACKEND + I18N HARDENING, phase 1 (the client half; the server half is server/src/harden93.js, the shared numbers
   are the v0.93 section of 111-onlcore: IDEM93, IDEM_MS93, RATE93, limiter93).
   • REQUEST IDS: NET.req gives every request in ONLC.IDEM93 (buys, kits, bids, tickets, repairs, gifts, coin sent …) a fresh `rid`;
     its own retries reuse it, so the server answers a replay with the stored reply and nothing is paid twice. Retries: a lost connection /
     no answer (Online on AWS, paying requests only) → once more after a reconnect; 'rid_busy' (the first try still running) → wait 1 s;
     'rate_limit' → wait what the server said (any request, at most 3 times).
   • SERVER TEXTS AS CODES: a refusal carrying {mcode, vals} becomes the sentence of SRV_TEXT93[mcode] (223a, generated) in the player's
     language (LANG_DICT[template], plural forms included; each value that is itself a server text is translated too). No code (an older
     server) → the English text as before (148's TXP pattern match). 'unknown_req' → plain words.
   • NOTHING RAW ON SCREEN: every rejection leaves NET.req as player text (errText92 in 00c: raw errors become "Something went wrong.
     (ref E-XXXX)" and go to the 🐞 Error log); mToast refuses raw-looking text the same way (a last line of defence).
   • THE MOCK mirrors the server: the same rate limit (per account, per tab) and the same rid replay (localStorage flavius_onlrid93,
     10 minutes, ≤40 replies). */
const V93={inflight:new Set(),lim:(typeof ONLC!=='undefined'&&ONLC.limiter93)?ONLC.limiter93():null,retries:0};
const v93Sleep=ms=>new Promise(r=>setTimeout(r,ms));
function v93Rid(){return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,9)}
/* a coded server text in the player's language (null when the code is unknown) */
function srvText93(code,vals){const tpl=typeof SRV_TEXT93!=='undefined'?SRV_TEXT93[code]:null;if(!tpl)return null;
  const v=(Array.isArray(vals)?vals:[]).map(x=>{const s=String(x==null?'':x);try{return typeof TX==='function'?TX(s):s}catch(e){return s}});
  try{if(typeof LANG_DICT!=='undefined'&&LANG_DICT){const r=langLook86(tpl,v,true);if(r!=null)return r}}catch(e){}
  return tpl.replace(/\{(\d+)\}/g,(m,n)=>v[+n]!=null?v[+n]:m)}
/* a transport failure (the request may or may not have reached the server) */
const v93Lost=e=>!!e&&!e.extra&&!e.code&&[_T('Connection lost.'),_T('The server did not answer.'),_T('The server closed the door.')].includes(e.message);
/* the rejection a caller sees: coded text → words; raw → plain + ref */
function v93Err(e,t){if(!e||typeof e!=='object'||!(e instanceof Error)){const x=new Error(typeof e==='string'?e:'');if(e&&typeof e==='object'){x.code=e.code;x.extra=e.extra}e=x}
  try{const ex=e.extra||{};if(ex.mcode){const m=srvText93(ex.mcode,ex.vals);if(m)e.message=m}
    /* a request the server does not know: plain words, never the request's name (196 already lit the server chip) */
    if(e.code==='unknown_req'||/^Unknown request: /.test(e.message||'')||String(e.message||'').startsWith(_T('Unknown request: '))||(t&&typeof SRV91!=='undefined'&&SRV91.unknown===t&&String(e.message||'').includes('('+t+')')))e.message=_T('The online server is older than this page — try again once it has updated.');
    if(!errSafe92(e,e.message))e.message=errText92(e)}catch(x){}
  return e}
{const base=NET.req;NET.req=function(t,d){const self=this;const idem=!!(typeof ONLC!=='undefined'&&ONLC.IDEM93&&ONLC.IDEM93.includes(t));
  if(idem){if(!d||typeof d!=='object')d={};if(!d.rid)d={...d,rid:v93Rid()}}
  const go=async n=>{try{return await base.call(self,t,d)}catch(e){const code=e&&e.code;const ex=(e&&e.extra)||{};
      if(code==='rate_limit'&&n<5){V93.retries++;await v93Sleep(Math.min(4000,Math.max(150,(ex.wait|0)||700)));return go(n+1)}
      if(code==='rid_busy'&&n<4){V93.retries++;await v93Sleep(1000);return go(n+1)}
      if(idem&&NET.mode==='aws'&&n<1&&v93Lost(e)){V93.retries++;await v93Sleep(900);return go(n+1)}
      throw v93Err(e,t)}};
  return go(0)}}
/* ── the mock: the same rate limit and the same rid replay as the server ── */
const RID93_KEY='flavius_onlrid93';
function rid93Load(){try{const o=JSON.parse(localStorage.getItem(RID93_KEY)||'{}');return o&&typeof o==='object'?o:{}}catch(e){return {}}}
function rid93Save(o){try{const now=Date.now();const ks=Object.keys(o).filter(k=>now-(o[k].at||0)<ONLC.IDEM_MS93).sort((a,b)=>o[b].at-o[a].at).slice(0,40);const p={};for(const k of ks)p[k]=o[k];localStorage.setItem(RID93_KEY,JSON.stringify(p))}catch(e){}}
if(typeof mockReq==='function'){const base=mockReq;mockReq=async function(t,d){const me=typeof mockMe==='function'?mockMe():null;
  if(V93.lim&&MOCK_ROUTES[t]){const w=V93.lim(me||'anon',t,Date.now());if(w)throw onlErr82(_T('Too many requests — wait a moment.'),'rate_limit',{wait:w})}
  if(!me||!ONLC.IDEM93.includes(t)||!d||!ONLC.ridOK93(d.rid))return base.apply(this,arguments);
  const k=me+'|'+d.rid;const X=rid93Load()[k];
  if(X&&Date.now()-(X.at||0)<ONLC.IDEM_MS93){if(X.t!==t)throw onlErr82(_T('That request id was used for something else — try again.'),'rid_reuse');return JSON.parse(X.out)}
  if(V93.inflight.has(k))throw onlErr82(_T('Still working on that — a moment.'),'rid_busy');
  V93.inflight.add(k);try{const out=await base.apply(this,arguments);try{const j=JSON.stringify(out===undefined?{}:out);if(j.length<60000){const M=rid93Load();M[k]={t,at:Date.now(),out:j};rid93Save(M)}}catch(e){}return out}
  finally{V93.inflight.delete(k)}}}
/* ── a last line of defence: a toast never shows raw error text ── */
if(typeof mToast==='function'){const base=mToast;mToast=function(h){try{if(typeof h==='string'){const txt=h.replace(/<[^>]+>/g,'');if(ERR_RAW93.test(txt))h='⚠ '+esc(errText92(new Error(txt)))}}catch(e){}return base.apply(this,[h,...[].slice.call(arguments,1)])}}
