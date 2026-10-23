/* server/verify/verify.js — v1.01 wave 2 Phase E: THE SERVER CHECKS RANKED RESULTS (docs/backend.md "v1.01 Ranked verification").
   After a Ranked match settles, the verify Lambda (index.js here) replays it with the rules of the deployed build (rules.js, written by
   tools/node/mkbundle.js at deploy) and compares the end with what the lanistas agreed. v1.01 policy was LOG ONLY; since v1.12 (his call
   2026-10-23, VerifyMode enforce) the arena WAITS for this verdict and settles with the replay's table (routes.js "v1.12 RANKED CHECK") —
   this file still never writes a settlement itself: it writes VERIFY#<id> (+ AUDIT#) and the verify Lambda tells the arena it is there.

   replayMatch(rules, {open, inputs, t0, deadline})  the game's own late-watcher path (113: onlmLoad + onlmWatchOn — what tools/node/replay.js
       proves against the Chromium goldens), rules mode (HEADLESS), the real gameOver (not 309's replay end): at gameOver the end hash is taken
       where the fighters take theirs (124's onlRepStart81), and once S.lastResult exists every seat's row is built by 124's onlRow81 (+ the
       v0.83/v0.84/v0.91 extras) — the same table a fighter reports. → {done, h, table, turns, ms, virtMs, inDiff, errors, why}
   compareResult(C, agreed, got, seats)  → null (the same) | {field, …} the first difference (end hash, then row by row, field by field).
   verifyMatch({store, id, rules, C, now, mode, log})  reads MATCH#<id> META / OPEN / IN#, writes VERIFY#<id> V once (+ AUDIT#<id> VERIFY on a
       mismatch). Skips (written as {skipped}): not Ranked, still live, void, no build on the match ('nobuild'), another build than the rules
       ('build'), no rules deployed ('nobundle'), no opening ('noopen'). mode 'off' = nothing at all; 'enforce' = the same check, gated (below).
   v1.12: openCheck112 (E2, the opening vs the room), CHOICE112_JS (E3, off-menu window answers), the gated path (META.g112).
   No AWS here: the store is server/src/store.js's interface (memory in tests, dynamo in the Lambda). */
'use strict';
const VERIFY101={TTL_DAYS:90,DEADLINE_MS:100000,VIRT_MAX:6*3600e3,STALL_MS:60000,FIELDS:['won','place','f','coin','kills','survives','slew','brk','off','dmg','ks','kb','thumb','cpu']};
/* v1.12 (docs/backend.md "v1.12 Ranked check"): GATE_MS = how long a gated replay may run (the arena settles by agreement at 60 s anyway) */
const VERIFY112={GATE_MS:45000,REBUILD_MS:20000};

/* ---------------- v1.12 E3 CHOICE AUDIT (R6a, audit only) ----------------
   In rules mode every human window another seat answers waits in ONLM.pend (113's modal hook, 290's decision path). The outermost modal
   wrapper notes what that window offered (its button values + its close value + null); onlmApply's modal path (P.res(inp.v)) then flags an
   answer that was none of them. A window whose body carries its own controls (CUR_MODAL.done / onclick / a form field) or an onOpen hook
   can return values outside its buttons: it is counted as 'open' and never flagged. Nothing changes in the replay. */
const CHOICE112_JS=String.raw`window.VF112={n:0,open:0,flags:[],cur:null};
{const b=modal;modal=function(title,body,buttons,opt){const p0=ONLM.pend;let X=null;
  try{const bs=Array.isArray(buttons)?buttons:[];const html=typeof body==='string'?body:'';
    const free=!bs.length||/CUR_MODAL\.done|onclick=|<input|<select|<textarea|contenteditable/i.test(html)||!!(opt&&(opt.onOpen||opt.input||opt.form));
    const J=v=>JSON.stringify(v===undefined?null:v);X={free,vals:bs.map(x=>J(x&&x.value)).concat([J(opt&&('close' in opt)?opt.close:null),'null'])}}catch(e){}
  /* the answer can land INSIDE this call (the pend is made, the pump applies a queued answer at once): the offer is known before */
  const c0=VF112.cur;VF112.cur=X;let r;try{r=b.apply(this,arguments)}finally{VF112.cur=c0}
  try{const P=ONLM.pend;if(P&&P!==p0&&!P.vf112&&X)P.vf112=X}catch(e){}
  return r}}
{const b=onlmApply;onlmApply=function(inp){try{if(inp&&inp.k==='modal'&&ONLM.pend){const X=ONLM.pend.vf112||VF112.cur;VF112.n++;
    if(!X||X.free)VF112.open++;else{const v=JSON.stringify(inp.v===undefined?null:inp.v);if(!X.vals.includes(v))VF112.flags.push({seq:inp.seq,seat:inp.seat,kd:inp.kd||null,ds:inp.ds==null?null:inp.ds,v:String(v).slice(0,60),offered:X.vals.slice(0,8).map(s=>String(s).slice(0,30))})}}}catch(e){}
  return b.apply(this,arguments)}}`;

/* ---------------- v1.12 E2 OPENING FIELD CHECK (R3a) ----------------
   The host's opening (MATCH# OPEN.S) is the start of every replay, so a host could forge it (more HP, better stats, a CPU less, another
   event). rebuildOpen112 starts the same match from the ROOM (LOBBY#: the seats' kits, the event, the city, the seed, the teams) with the
   page's own onlSeatsFor + startEvent — NOT in rules mode: a host's page is not HEADLESS, and the start differs there (famousVisit: a famous
   visitor's CF / coin only comes outside HEADLESS) — and takes the snapshot exactly where a host's page sends match.open (113: the first
   beginTurn). openDiff112 compares the fields a forger would touch — event, city, seed, seat count, which seats are CPUs, and per seat: class,
   name, team, start tile, stats, HP and AP per location, CF, coin, weapons, armor pieces (key + AP), items in hand, the brought kit's engine
   keys; the beasts (kind + HP). Checked when built: Node and Chromium build the same values (only the figures' facing differs, not compared).
   Not a full rebuild (backlog: replay from the server's own opening). */
const SEAT112=['cls','cpu','name','team','r','c','st','hp','ap','cf','_cf','coin','w','pieces','items','kit'];
function seatView112(p){p=p||{};const keys=o=>Object.keys(o||{}).sort();
  const pieces={};for(const l of keys(p.pieces))pieces[l]=(p.pieces[l]||[]).map(x=>String(x&&x.key)+':'+((x&&x.ap)|0));
  const num=o=>{const y={};for(const k of keys(o))y[k]=+o[k]||0;return y};
  return {cls:p.cls||null,cpu:!!p.cpu,name:String(p.name||''),team:p.team==null?null:p.team,r:p.r|0,c:p.c|0,st:p.st?num(p.st):null,hp:num(p.hp),ap:num(p.ap),cf:p.cf|0,_cf:p._cf|0,coin:p.coin|0,
    w:[p.wR&&p.wR.key||null,p.wL&&p.wL.key||null],pieces,items:(p.items||[]).map(x=>String(x&&x.kind)+':'+String(x&&x.key)).sort(),kit:Array.isArray(p._onlKit)?p._onlKit.map(String).sort():null}}
function openView112(S){S=S||{};return {ev:S.evKey||null,loc:S.locIdx==null?null:S.locIdx|0,seed:S.seed==null?null:S.seed,n:(S.players||[]).length,
  cpus:(S.players||[]).filter(p=>p&&p.cpu).length,npcs:(S.npcs||[]).map(x=>String(x&&x.t)+':'+((x&&x.hp)|0)).sort(),seats:(S.players||[]).map(seatView112)}}
/* null = the same; else the first difference {field, seat?, want (the rebuild), got (the host's opening)} */
function openDiff112(open,built){const A=openView112(built),B=openView112(open);
  for(const k of ['ev','loc','seed','n','cpus','npcs'])if(JSON.stringify(A[k])!==JSON.stringify(B[k]))return {field:k,want:A[k],got:B[k]};
  for(let i=0;i<A.seats.length;i++)for(const k of SEAT112){const x=JSON.stringify(A.seats[i][k]),y=JSON.stringify(B.seats[i][k]);if(x!==y)return {field:k,seat:i,want:A.seats[i][k],got:B.seats[i][k]}}
  return null}
async function rebuildOpen112(rules,L,o={}){const t0=Date.now();const P=await rules.open({ls:{flavius_firstrun:'shown',flavius_replay0:'1',flavius_first100off:'1'},t0:o.t0||Date.now()});
  try{if(!(await P.until(()=>P.G.FLAVIUS_READY,60000)))return {error:'the page did not start'};
    await P.until(()=>P.ev('typeof CROWD_CACHE!=="undefined"&&CROWD_CACHE.length>0'),6000);P.G.__L112=JSON.parse(JSON.stringify(L));
    P.ev(`CROWD_CACHE=[];menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');POPPED.add('mandata');SPEEDMUL.fast=0;HEADLESS=false;window.OP112=null;
      {const b=NET.req;NET.req=function(t,d){if(t==='match.open'){OP112=d&&d.snap||null;return Promise.resolve({})}if(/^(match\\.|stands\\.|bet\\.|replay\\.)/.test(String(t)))return Promise.resolve({});return b.apply(this,arguments)}}
      {const L=__L112;const seats=onlSeatsFor(L);const me=L.players.findIndex(p=>p&&L.host&&p.id===L.host.id);
       const onl={lobby:L.id,ranked:!!L.ranked,seat:me,owners:onlOwnersFor(L,seats),host:true,stands:(L.stands||[]).map(t=>({id:t.id,name:t.name})),fighters:L.seats,team:!!L.team};
       SPEED='fast';startEvent({ev:L.ev,loc:L.loc,seats,seed:L.seed,opts:{spect:0},onl})}`);
    /* a window before the first turn (none today besides the briefing, switched off): its first button, as a host would click */
    const ok=await P.until(()=>P.ev(`!!OP112||(CUR_MODAL&&(()=>{const b=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(b)b.click();return false})())`),o.maxMs||VERIFY112.REBUILD_MS);if(!ok)return {error:'the rebuild never opened',errors:P.errors.slice(0,4).map(String)};
    const snap=JSON.parse(P.ev('JSON.stringify(OP112)'));return {S:JSON.parse(snap.S),snap,ms:Date.now()-t0}}
  catch(e){return {error:'the rebuild crashed: '+String(e&&e.message||e).slice(0,200)}}finally{P.close()}}
/* the check of one match: {ok:true} · {forged:true, diff} · {skipped:why} · {error} */
async function openCheck112(rules,open,L,o={}){if(!L||!Array.isArray(L.players)||!L.players.length||!L.ev)return {skipped:'nolobby'};
  let S;try{S=JSON.parse(open&&open.S)}catch(e){return {forged:true,diff:{field:'snapshot',got:'not readable'}}}
  const B=await rebuildOpen112(rules,L,o);if(B.error)return {error:B.error};const diff=openDiff112(S,B.S);return diff?{forged:true,diff,ms:B.ms}:{ok:true,ms:B.ms}}

/* ---------------- the replay ---------------- */
async function replayMatch(rules,o){const t0=Date.now();const deadline=t0+(o.deadline||VERIFY101.DEADLINE_MS);
  const P=await rules.open({ls:{flavius_firstrun:'shown',flavius_replay0:'1',flavius_first100off:'1'},t0:o.t0||Date.now()});
  try{if(!(await P.until(()=>P.G.FLAVIUS_READY,60000)))return {done:false,why:'the page did not start',ms:Date.now()-t0,errors:P.errors.slice(0,8).map(String)};
    await P.until(()=>P.ev('typeof CROWD_CACHE!=="undefined"&&CROWD_CACHE.length>0'),6000);
    /* the page as tools/node/replay.js leaves it (proven against the Chromium goldens): menus away, no crowd memory, rule pop-ups seen, rules mode */
    P.ev(`CROWD_CACHE=[];menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');POPPED.add('mandata');SPEEDMUL.fast=0;window.__m=ERR92.n;HEADLESS=true;
      window.VF101={h:null,w:null};
      {const b=onlRepStart81;onlRepStart81=function(w){if(VF101.h==null&&S&&S.onl&&S.onl.vf101){VF101.h=typeof onlHash==='function'?onlHash():'';VF101.w=w}return b.apply(this,arguments)}}
      {const b=NET.req;NET.req=function(t,d){if(/^(match\\.|stands\\.|bet\\.|replay\\.)/.test(String(t)))return Promise.resolve(t==='match.get'?{open:null,inputs:[]}:{});return b.apply(this,arguments)}}
      ${CHOICE112_JS}`);
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
    const r=P.ev(`({h:VF101.h,over:!!(S&&S.over),turns:S?S.turnNo:null,next:ONLM.next,hlog:ONLM.hlog||{},choice:window.VF112?{n:VF112.n,open:VF112.open,flags:VF112.flags.slice(0,8),more:Math.max(0,VF112.flags.length-8)}:null,
      table:VF101.h!=null&&S&&S.lastResult?S.players.map(p=>onlRow81(S,p,VF101.w)):null,errs:errNew92(window.__m).map(e=>e.msg)})`);
    const res=JSON.parse(JSON.stringify(r));
    /* where the stream first left the fighters (diagnostic): the sender's pre-hash of an input vs ours when it was applied */
    let inDiff=null;for(const x of o.inputs){const g=String(res.hlog['s'+x.seq]||'').split('|')[0];if(x.h&&g&&g!=='g89'&&x.h!=='g89'&&g!==x.h){inDiff={seq:x.seq,k:x.k,seat:x.seat,want:x.h,got:g};break}}
    const ok=done&&!late&&!stalled&&res.table;
    return {done:!!ok,why:ok?'':late?'out of time':stalled?'the stream ended before the match did (a seat waits for a move)':res.over?'over without the results':'not finished',
      h:res.h,table:res.table,turns:res.turns,applied:res.next,inDiff,choice:res.choice||null,ms:Date.now()-t0,virtMs:Math.round(P.now()),errors:[...res.errs,...P.errors.map(e=>String(e&&e.message||e))].slice(0,8)}}
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
/* v1.12 GATED (VerifyMode enforce, docs/backend.md "v1.12 Ranked check"): the arena holds a Ranked match at 'live' with META.g112 once every
   human has reported and asks for this check BEFORE it settles. Then the agreement is computed here from the reports (nothing is agreed yet,
   a void agreement is replayed too), the replay has VERIFY112.GATE_MS, and the record carries the replay's own table + end hash: the arena
   settles WITH that table (R1a). Every match also gets the opening field check (E2: a forged opening = {forged}, no replay — the replay of a
   forged start proves nothing) and the choice audit (E3: VERIFY# choice + AUDIT#<id> CHOICE, never a verdict). */
async function verifyMatch({store,id,rules,C,now=()=>Date.now(),mode='log',log=()=>{}}){
  if(mode==='off')return {off:true};
  const MK='MATCH#'+id;const ttl=Math.floor(now()/1000)+VERIFY101.TTL_DAYS*86400;
  const prev=await store.get('VERIFY#'+id,'V');if(prev)return {...prev,again:true};   /* async invokes may retry: one verdict a match */
  const write=async v=>{const rec={id,...v,at:now(),mode,GSI1PK:'VERIFY',GSI1SK:now(),ttl};if(!(await store.putNew('VERIFY#'+id,'V',rec)))return {...(await store.get('VERIFY#'+id,'V')),again:true};
    try{log(JSON.stringify({verify101:id,ok:v.ok,skipped:v.skipped,forged:v.forged||undefined,gate:v.gate||undefined,ms:v.ms,firstDiff:v.firstDiff}))}catch(e){}return rec};
  const M=await store.get(MK,'META');
  if(!M)return write({skipped:'nomatch'});if(!M.ranked)return write({skipped:'custom'});
  const gate=M.status==='live'&&!!M.g112;
  if(M.status!=='done'&&!gate)return {skipped:'live'}; /* not written: a later call may verify it */
  const A=gate?C.agree(M.reports||{}):M.agreed;const G=gate?{gate:1}:{};
  if(!gate&&(!A||A.void||!A.table))return write({skipped:'void'});
  if(!rules)return write({skipped:'nobundle',...G});
  if(!M.build)return write({skipped:'nobuild',build:rules.build,...G});
  if(M.build!==rules.build)return write({skipped:'build',build:M.build,rules:rules.build,...G});
  const O=await store.get(MK,'OPEN');if(!O||!O.snap)return write({skipped:'noopen',build:M.build,...G});
  const inputs=(await store.query(MK,'IN#')).map(x=>x.in).filter(Boolean).sort((a,b)=>a.seq-b.seq);
  let L=null;try{L=await store.get('LOBBY#'+id,'LOBBY')}catch(e){}const seats=(L&&L.seats)|0;
  let t0=0;try{t0=Date.parse(O.snap.at)||0}catch(e){}t0=t0||M.startAt||M.created||now();
  const t1=Date.now();const left=()=>gate?Math.max(5000,VERIFY112.GATE_MS-(Date.now()-t1)):VERIFY101.DEADLINE_MS;
  /* E2: the opening against the room */
  let oc;try{oc=await openCheck112(rules,O.snap,L,{t0:L&&L.started||t0,maxMs:Math.min(VERIFY112.REBUILD_MS,left())})}catch(e){oc={error:String(e&&e.message||e).slice(0,200)}}
  const open=oc.ok?'ok':oc.forged?'forged':oc.skipped?'skip:'+oc.skipped:'error';
  if(oc.forged){const rec=await write({ok:false,forged:true,open,openDiff:oc.diff,host:M.host||null,build:M.build,ms:Date.now()-t1,inputs:inputs.length,humans:(M.players||[]).length,...G});
    if(!rec.again){try{await store.put('AUDIT#'+id,'VERIFY',{kind:'verify_forged',id,openDiff:oc.diff,host:M.host||null,build:M.build,humans:(M.players||[]).length,ranked:true,at:now(),GSI1PK:'AUDIT',GSI1SK:now(),ttl});
      log('[verify112] FORGED OPENING '+id+' '+JSON.stringify(oc.diff))}catch(e){}}
    return rec}
  const hash=gate?agreedHashOf(C,A,M.reports):agreedHash(C,M);
  let got;try{got=await replayMatch(rules,{open:O.snap,inputs,t0,deadline:left()})}catch(e){got={done:false,why:'the replay crashed: '+String(e&&e.message||e).slice(0,200)}}
  const firstDiff=compareResult(C,{table:A&&A.table||[],hash},got,seats||((A&&A.table)||[]).length||(got.table||[]).length);
  const fin=!!(got&&got.done&&got.table);
  const v={ok:!firstDiff,build:M.build,ms:got.ms|0,virtMs:got.virtMs|0,inputs:inputs.length,turns:got.turns,unverified:!!(A&&A.unverified),humans:(M.players||[]).length,open,
    ...(oc.error?{openErr:oc.error}:{}),...(fin?{table:C.cleanTable(got.table),h:String(got.h||'')}:{done:false,why:got.why||'not finished'}),
    ...(got.choice?{choice:{n:got.choice.n|0,open:got.choice.open|0,flags:(got.choice.flags||[]).length+(got.choice.more|0)}}:{}),
    ...(firstDiff?{firstDiff,inDiff:got.inDiff||null,errors:got.errors||[]}:{}),...G};
  const rec=await write(v);
  if(firstDiff&&!rec.again){try{await store.put('AUDIT#'+id,'VERIFY',{kind:'verify_mismatch',id,firstDiff,inDiff:got.inDiff||null,build:M.build,unverified:!!(A&&A.unverified),
      humans:(M.players||[]).length,ranked:true,gate:!!gate,at:now(),GSI1PK:'AUDIT',GSI1SK:now(),ttl});log('[verify101] MISMATCH '+id+' '+JSON.stringify(firstDiff))}catch(e){}}
  /* E3: off-menu window answers (audit only) */
  if(!rec.again&&got.choice&&(got.choice.flags||[]).length){try{await store.put('AUDIT#'+id,'CHOICE',{kind:'offmenu_answer',id,flags:got.choice.flags,more:got.choice.more|0,build:M.build,ranked:true,at:now(),GSI1PK:'AUDIT',GSI1SK:now(),ttl});
    log('[verify112] OFF-MENU '+id+' '+JSON.stringify(got.choice.flags[0]))}catch(e){}}
  return rec}
/* the hash of the reports whose table the agreement kept (gated: nothing is agreed yet) */
function agreedHashOf(C,A,reports){if(!A||!A.table)return '';const want=JSON.stringify(C.cleanTable(A.table));
  for(const r of Object.values(reports||{}))if(r&&JSON.stringify(C.cleanTable(r.table))===want)return String(r.hash||'');return ''}

module.exports={VERIFY101,VERIFY112,replayMatch,compareResult,agreedHash,agreedHashOf,verifyMatch,openCheck112,openDiff112,rebuildOpen112,seatView112};
