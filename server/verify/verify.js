/* server/verify/verify.js — v1.01 wave 2 Phase E: THE SERVER CHECKS RANKED RESULTS (docs/backend.md "v1.01 Ranked verification").
   After a Ranked match settles, the verify Lambda (index.js here) replays it with the rules of the deployed build (rules.js, written by
   tools/node/mkbundle.js at deploy) and compares the end with what the lanistas agreed. POLICY (Virgilante, v1.01): LOG ONLY — nothing
   here touches the settlement, payouts, deaths or strikes; a mismatch is a VERIFY# record + an AUDIT# entry for a human to read.

   replayMatch(rules, {open, inputs, t0, deadline})  the game's own late-watcher path (113: onlmLoad + onlmWatchOn — what tools/node/replay.js
       proves against the Chromium goldens), rules mode (HEADLESS), the real gameOver (not 309's replay end): at gameOver the end hash is taken
       where the fighters take theirs (124's onlRepStart81), and once S.lastResult exists every seat's row is built by 124's onlRow81 (+ the
       v0.83/v0.84/v0.91 extras) — the same table a fighter reports. → {done, h, table, turns, ms, virtMs, inDiff, errors, why}
   compareResult(C, agreed, got, seats)  → null (the same) | {field, …} the first difference (end hash, then row by row, field by field).
   verifyMatch({store, id, rules, C, now, mode, log})  reads MATCH#<id> META / OPEN / IN#, writes VERIFY#<id> V once (+ AUDIT#<id> VERIFY on a
       mismatch). Skips (written as {skipped}): not Ranked, still live, void, no build on the match ('nobuild'), another build than the rules
       ('build'), no rules deployed ('nobundle'), no opening ('noopen'). mode 'off' = nothing at all; 'enforce' = TODO (behaves as 'log').
   No AWS here: the store is server/src/store.js's interface (memory in tests, dynamo in the Lambda). */
'use strict';
const VERIFY101={TTL_DAYS:90,DEADLINE_MS:100000,VIRT_MAX:6*3600e3,STALL_MS:60000,FIELDS:['won','place','f','coin','kills','survives','slew','brk','off','dmg','ks','kb','thumb','cpu']};

/* ---------------- the replay ---------------- */
async function replayMatch(rules,o){const t0=Date.now();const deadline=t0+(o.deadline||VERIFY101.DEADLINE_MS);
  const P=await rules.open({ls:{flavius_firstrun:'shown',flavius_replay0:'1',flavius_first100off:'1'},t0:o.t0||Date.now()});
  try{if(!(await P.until(()=>P.G.FLAVIUS_READY,60000)))return {done:false,why:'the page did not start',ms:Date.now()-t0,errors:P.errors.slice(0,8).map(String)};
    await P.until(()=>P.ev('typeof CROWD_CACHE!=="undefined"&&CROWD_CACHE.length>0'),6000);
    /* the page as tools/node/replay.js leaves it (proven against the Chromium goldens): menus away, no crowd memory, rule pop-ups seen, rules mode */
    P.ev(`CROWD_CACHE=[];menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');POPPED.add('mandata');SPEEDMUL.fast=0;window.__m=ERR92.n;HEADLESS=true;
      window.VF101={h:null,w:null};
      {const b=onlRepStart81;onlRepStart81=function(w){if(VF101.h==null&&S&&S.onl&&S.onl.vf101){VF101.h=typeof onlHash==='function'?onlHash():'';VF101.w=w}return b.apply(this,arguments)}}
      {const b=NET.req;NET.req=function(t,d){if(/^(match\\.|stands\\.|bet\\.|replay\\.)/.test(String(t)))return Promise.resolve(t==='match.get'?{open:null,inputs:[]}:{});return b.apply(this,arguments)}}`);
    P.G.__VF={open:o.open,inputs:(o.inputs||[]).map(x=>({...x}))};
    /* the late watcher (309's online playback without its replay end): the opening, every input in server order, then the first turn */
    P.ev(`SPEED='fast';{let o0={};try{o0=JSON.parse(__VF.open.S).onl||{}}catch(e){}const onl={...o0,lobby:'vf101',seat:-1,host:false,watch:true,opened:true,vf101:true};
      if(!onlmLoad({...__VF.open,log:''},onl))throw new Error('the opening did not load');const ins=__VF.inputs;const s0=ins.reduce((m,x)=>Math.min(m,x.seq|0),Infinity);
      onlmWatchOn(Number.isFinite(s0)?s0:0,ins);const G=S;later(()=>{if(S===G)beginTurn()},80)}`);
    const top=o.inputs.length?Math.max(...o.inputs.map(x=>x.seq|0)):-1;let stalled=false,late=false,since=-1;
    /* done = the end hash taken and the results known; a stall = every input applied, nothing resolving, a human seat waiting for a move that never comes */
    const done=await P.until(()=>{if(Date.now()>deadline){late=true;return true}
      if(P.ev('!!(VF101.h!=null&&S&&S.lastResult)'))return true;
      /* held for STALL_MS of page time (an abandoned seat turns CPU only at its next decision, a moment after its mark) */
      const w=P.ev(`!!(S&&!S.over&&ONLM.next>${top}&&!ONLM.q.length&&!ONLM.pend&&!S.busy&&!CUR_MODAL&&['choice','action','command'].includes(S.phase)&&cur()&&!cur().cpu)`);
      if(!w){since=-1;return false}if(since<0)since=P.now();if(P.now()-since>VERIFY101.STALL_MS){stalled=true;return true}return false},VERIFY101.VIRT_MAX);
    const r=P.ev(`({h:VF101.h,over:!!(S&&S.over),turns:S?S.turnNo:null,next:ONLM.next,hlog:ONLM.hlog||{},
      table:VF101.h!=null&&S&&S.lastResult?S.players.map(p=>onlRow81(S,p,VF101.w)):null,errs:errNew92(window.__m).map(e=>e.msg)})`);
    const res=JSON.parse(JSON.stringify(r));
    /* where the stream first left the fighters (diagnostic): the sender's pre-hash of an input vs ours when it was applied */
    let inDiff=null;for(const x of o.inputs){const g=String(res.hlog['s'+x.seq]||'').split('|')[0];if(x.h&&g&&g!=='g89'&&x.h!=='g89'&&g!==x.h){inDiff={seq:x.seq,k:x.k,seat:x.seat,want:x.h,got:g};break}}
    const ok=done&&!late&&!stalled&&res.table;
    return {done:!!ok,why:ok?'':late?'out of time':stalled?'the stream ended before the match did (a seat waits for a move)':res.over?'over without the results':'not finished',
      h:res.h,table:res.table,turns:res.turns,applied:res.next,inDiff,ms:Date.now()-t0,virtMs:Math.round(P.now()),errors:[...res.errs,...P.errors.map(e=>String(e&&e.message||e))].slice(0,8)}}
  finally{P.close()}}

/* ---------------- the comparison ---------------- */
function compareResult(C,agreed,got,seats){if(!got||!got.done)return {field:'end',got:got&&got.why||'no end'};
  if(String(agreed.hash||'')!==String(got.h||''))return {field:'hash',want:String(agreed.hash||''),got:String(got.h||'')};
  const fix=t=>C.tableFix101?C.tableFix101(t,seats):C.cleanTable(t);const A=fix(agreed.table),B=fix(got.table);
  for(let i=0;i<Math.max(A.length,B.length);i++){const a=A[i],b=B[i];if(!a||!b)return {field:'row',seat:(a||b).seat,want:a?'a row':'none',got:b?'a row':'none'};
    if(a.seat!==b.seat)return {field:'seat',want:a.seat,got:b.seat};
    for(const k of VERIFY101.FIELDS){const x=JSON.stringify(a[k]),y=JSON.stringify(b[k]);if(x!==y)return {field:k,seat:a.seat,want:a[k],got:b[k]}}}
  return null}

/* the agreed hash: the hash of the reports whose table won (agree() keeps the table, not the hash) */
function agreedHash(C,M){const A=M.agreed||{};const want=JSON.stringify(C.cleanTable(A.table));
  for(const r of Object.values(M.reports||{}))if(r&&JSON.stringify(C.cleanTable(r.table))===want)return String(r.hash||'');return ''}

/* ---------------- one match ---------------- */
async function verifyMatch({store,id,rules,C,now=()=>Date.now(),mode='log',log=()=>{}}){
  if(mode==='off')return {off:true};
  const MK='MATCH#'+id;const ttl=Math.floor(now()/1000)+VERIFY101.TTL_DAYS*86400;
  const prev=await store.get('VERIFY#'+id,'V');if(prev)return {...prev,again:true};   /* async invokes may retry: one verdict a match */
  const write=async v=>{const rec={id,...v,at:now(),mode,GSI1PK:'VERIFY',GSI1SK:now(),ttl};if(!(await store.putNew('VERIFY#'+id,'V',rec)))return {...(await store.get('VERIFY#'+id,'V')),again:true};
    try{log(JSON.stringify({verify101:id,ok:v.ok,skipped:v.skipped,ms:v.ms,firstDiff:v.firstDiff}))}catch(e){}return rec};
  const M=await store.get(MK,'META');
  if(!M)return write({skipped:'nomatch'});if(!M.ranked)return write({skipped:'custom'});if(M.status!=='done')return {skipped:'live'}; /* not written: a later call may verify it */
  const A=M.agreed;if(!A||A.void||!A.table)return write({skipped:'void'});
  if(!rules)return write({skipped:'nobundle'});
  if(!M.build)return write({skipped:'nobuild',build:rules.build});
  if(M.build!==rules.build)return write({skipped:'build',build:M.build,rules:rules.build});
  const O=await store.get(MK,'OPEN');if(!O||!O.snap)return write({skipped:'noopen',build:M.build});
  const inputs=(await store.query(MK,'IN#')).map(x=>x.in).filter(Boolean).sort((a,b)=>a.seq-b.seq);
  let seats=0;try{const L=await store.get('LOBBY#'+id,'LOBBY');seats=(L&&L.seats)|0}catch(e){}
  const hash=agreedHash(C,M);let t0=0;try{t0=Date.parse(O.snap.at)||0}catch(e){}
  let got;try{got=await replayMatch(rules,{open:O.snap,inputs,t0:t0||M.startAt||M.created||now()})}catch(e){got={done:false,why:'the replay crashed: '+String(e&&e.message||e).slice(0,200)}}
  const firstDiff=compareResult(C,{table:A.table,hash},got,seats||A.table.length);
  const v={ok:!firstDiff,build:M.build,ms:got.ms|0,virtMs:got.virtMs|0,inputs:inputs.length,turns:got.turns,unverified:!!A.unverified,humans:(M.players||[]).length,
    ...(firstDiff?{firstDiff,inDiff:got.inDiff||null,errors:got.errors||[]}:{})};
  const rec=await write(v);
  if(firstDiff&&!rec.again){try{await store.put('AUDIT#'+id,'VERIFY',{kind:'verify_mismatch',id,firstDiff,inDiff:got.inDiff||null,build:M.build,unverified:!!A.unverified,
      humans:(M.players||[]).length,ranked:true,at:now(),GSI1PK:'AUDIT',GSI1SK:now(),ttl});log('[verify101] MISMATCH '+id+' '+JSON.stringify(firstDiff))}catch(e){}}
  /* TODO(enforce): Virgilante decides after the first month of logs. An 'enforce' path would act here (e.g. void the match, refund, strike the
     minority) — NOT implemented: 'enforce' only logs, like 'log'. */
  return rec}

module.exports={VERIFY101,replayMatch,compareResult,agreedHash,verifyMatch};
