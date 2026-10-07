/* v0.93 BACKEND HARDENING, phase 1 (the shared numbers live in onlcore.js: IDEM93, IDEM_MS93, RATE93, limiter93).
   • idem(store, ctx, t, d, run) — IDEMPOTENCY: a request in C.IDEM93 that carries a client request id `rid` is answered once.
       RID#<acct> / <rid>  {st:'busy'|'done', t, at, out (the reply as JSON), ttl}  — kept IDEM_MS93 (10 min; DynamoDB TTL drops it later).
       A replay of a done rid gets the stored reply (nothing runs twice); a rid still running → 'rid_busy'; the same rid for another
       request → 'rid_reuse'; a request that FAILS forgets its rid (a failed request changed nothing, so asking again is safe).
   • textCode(msg) → {mcode, vals}: the English text matched against texts93.json (tools/i18n/srvtext93.js) — the client turns the
       code back into its own language; the English `err` still rides along (old clients, and texts without a code).
   • errReply(e, log) — the refusal as the reply carries it. Internal failures (a TypeError, a DynamoDB error, anything that reads
       like code) never reach the player: they get "The arena hit a snag — try again (ref S-XXXX)." and the full error goes to the
       log (CloudWatch) under that ref. */
'use strict';
const crypto=require('crypto');
const C=require('./onlcore.js');
let TEXTS={};try{TEXTS=require('./texts93.json')}catch(e){}
function fail(code,msg,extra){const e=new Error(msg);e.code=code;if(extra)e.extra=extra;return e}

/* ── server texts → stable codes ── */
let IDX=null;
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function textIndex(){if(IDX)return IDX;const exact=new Map(),pats=[];
  for(const [code,k] of Object.entries(TEXTS)){if(!/\{\d+\}/.test(k)){exact.set(k,code);continue}
    const parts=k.split(/\{\d+\}/);const idx=(k.match(/\{(\d+)\}/g)||[]).map(x=>+x.slice(1,-1));const lit=parts.join('').trim().length;if(lit<4)continue;
    pats.push({re:new RegExp('^'+parts.map(reEsc).join('([\\s\\S]+?)')+'$'),idx,code,lit})}
  pats.sort((a,b)=>b.lit-a.lit);return IDX={exact,pats}}
function textCode(msg){const t=String(msg||'').trim();if(!t)return null;const I=textIndex();const c=I.exact.get(t);if(c)return {mcode:c,vals:[]};
  for(const P of I.pats){const m=P.re.exec(t);if(!m)continue;const vals=[];P.idx.forEach((n,i)=>{vals[n]=m[i+1]});return {mcode:P.code,vals}}return null}

/* ── what may reach a player ── */
const RAW=/\b(TypeError|ReferenceError|SyntaxError|RangeError|is not a function|is not defined|is not iterable|Cannot read|Cannot set|Cannot destructure|undefined|NaN|Unexpected token|JSON|ECONN\w*|ETIMEDOUT|\w+Exception|ValidationError|AccessDenied|Throttl\w*)\b|\[object |^\s*[{[]|\bat \S+ \(|\.js:\d+/;
function internal(e){if(e==null)return true;if(typeof e==='string')return RAW.test(e);if(!(e instanceof Error))return true;
  if(e.$metadata||e.$fault||typeof e.code==='string'&&/^[A-Z][A-Z0-9_]+$/.test(e.code))return true;if(e.code&&typeof e.code==='string'&&/^[a-z][A-Za-z_0-9]*$/.test(e.code)&&e.constructor===Error)return false;
  if(e.constructor!==Error||(e.name&&e.name!=='Error'))return true;return !textCode(e.message)&&RAW.test(String(e.message||''))}
const newRef=()=>'S-'+crypto.randomBytes(3).toString('hex').toUpperCase().slice(0,5);
function errReply(e,log){
  if(internal(e)){const ref=newRef();try{(log||console.error)('['+ref+']',e&&e.stack||e)}catch(x){}
    const msg=`The arena hit a snag — try again (ref ${ref}).`;const tc=textCode(msg);return {err:msg,code:'server_error',ref,...(tc||{})}}
  const msg=String(e.message||e);const tc=textCode(msg);
  return {...(e.extra||{}),err:msg.slice(0,200),...(e.code?{code:e.code}:{}),...(tc?{mcode:tc.mcode,vals:tc.vals.map(v=>String(v).slice(0,120))}:{})}}

/* ── idempotency ── */
function replay(X){if(X.big)throw fail('rid_done','That was already done — refresh to see it.');return X.out==null?{}:JSON.parse(X.out)}
async function idem(store,ctx,t,d,run,now){
  const acct=ctx&&ctx.acct;if(!acct||!C.IDEM93.includes(t)||!d||!C.ridOK93(d.rid))return run();
  const pk='RID#'+acct,sk=String(d.rid),T=now();const fresh=x=>!!x&&T-(x.at||0)<C.IDEM_MS93;const ttl=Math.floor(T/1000)+Math.ceil(C.IDEM_MS93/1000)+600;
  let X=await store.get(pk,sk);
  if(fresh(X)){if(X.t!==t)throw fail('rid_reuse','That request id was used for something else — try again.');
    if(X.st==='done')return replay(X);if(T-(X.at||0)<C.RID_BUSY_MS93)throw fail('rid_busy','Still working on that — a moment.')}
  const claim={st:'busy',t,at:T,ttl};
  if(X)await store.put(pk,sk,claim);
  else if(!(await store.putNew(pk,sk,claim))){X=await store.get(pk,sk);if(X&&X.st==='done'&&X.t===t)return replay(X);throw fail('rid_busy','Still working on that — a moment.')}
  let out;try{out=await run()}catch(e){try{await store.del(pk,sk)}catch(x){}throw e}
  try{const j=JSON.stringify(out===undefined?{}:out);await store.put(pk,sk,{st:'done',t,at:T,ttl,...(j.length<350000?{out:j}:{big:1})})}catch(e){}
  return out}

module.exports={idem,textCode,errReply,internal,TEXTS:()=>TEXTS};
