/* v1.01 wave 2 Phase E — THE SERVER CHECKS RANKED RESULTS (server/verify; docs/backend.md "v1.01 Ranked verification"). Plain node, no browser.
   1 · routes: match.open keeps the host page's build on META (first opening only, hex only); a settled Ranked match calls verify(id) once
       (Custom and void never); admin.verify is testers only and lists VERIFY# / AUDIT#.
   2 · the verifier on the in-memory store: the rules bundle (tools/node/mkbundle.js → a temp dir) replays a recorded online match
       (tools/replay/golden/online-mock.json.gz: the host's opening + the lockstep stream, both lanistas then handing their seats to CPUs so the
       match runs to its end) — the agreed result → ok; a tampered table / end hash → a mismatch logged (VERIFY# + AUDIT# VERIFY), the settlement
       untouched; another build → skipped 'build'; no bundle, Custom, void, live, VERIFY_MODE=off, a second call (one verdict a match).
   3 · v1.12 RANKED CHECK (VerifyMode enforce; docs/backend.md "v1.12 Ranked check"): gated() — routes with a fake verifier that writes VERIFY#
       like the real one: held until the verdict ({pending, check112}), ok / a forged table (the replay's table, the liar struck) / a lone human vs
       CPUs / a forged opening (host struck, his row stripped; alone → void) / the 60 s fallback (hello, match.get, the lobby list) / unjudged
       skips / the verifier down / retries and duplicate invokes settle once / admin.verify counts / enforce off. With the rules: the opening
       field check (honest, 9 forgeries), a forged opening end to end (the real verifier, the Lambda's tell → the arena), an unfinished replay →
       unjudged, a crashed check still tells the arena, the gated record carries the replay's table, the choice audit (an off-menu answer).
   Needs the built page (flavius-arena.html at the repo root). node server/test/verify.test.js */
'use strict';
const assert=require('assert'),path=require('path'),fs=require('fs'),os=require('os'),zlib=require('zlib');
const store=require('../src/store.js');const C=require('../src/onlcore.js');const catalog=require('../src/catalog.json');
const V=require('../verify/verify.js');
const ROOT=path.resolve(__dirname,'..','..');const PAGE=path.join(ROOT,'flavius-arena.html');const T0=Date.now();

async function routes(){
  const {makeHandler}=require('../src/index.js');C.SLOT100.start=4;C.setCatalog(catalog);
  let T=Date.UTC(2026,9,14,12);const db=store.memory();const sent=[];const live=new Set();const calls=[];
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{},testers:'tess@x.com',verifyMatch:async id=>{calls.push(id)}});let nc=0,mid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  async function client(name,cls,email){const cl={name,acct:'dev-'+name};cl.conn='c'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER),...(email?{email}:{})}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});await cl.req('domus.create',{name:'Domus '+name});cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1});return cl}
  const ann=await client('ann','hero'),bob=await client('bob','soldier'),tess=await client('tess','slave','tess@x.com');
  const good={game:'flavius-match',S:JSON.stringify({ev:'cassian',players:[{name:'Ann'}]}),rng:5,log:''};
  /* a Ranked match: the build rides on the first opening only */
  const L0=await ann.req('lobby.create',{ev:'cassian',ranked:true,cry:false});await bob.req('lobby.join',{id:L0.id});const L=await ann.req('lobby.start',{id:L0.id});
  const host=[ann,bob].find(c=>c.acct===L.host.id);
  await host.req('match.open',{id:L.id,snap:good,build:'abcdef012345'});assert.strictEqual((await db.get('MATCH#'+L.id,'META')).build,'abcdef012345','META.build');
  const again=await host.req('match.open',{id:L.id,snap:good,build:'999999999999'});assert.strictEqual(again.kept,1);
  assert.strictEqual((await db.get('MATCH#'+L.id,'META')).build,'abcdef012345','the first opening\'s build stays');
  /* settles (Bob abandons, Ann's lone report) → verify(id) once */
  await bob.req('match.abandon',{id:L.id});const M0=await db.get('MATCH#'+L.id,'META');const sa=M0.seats[ann.acct];
  const r=await ann.req('match.result',{id:L.id,table:[0,1,2,3].map(i=>({seat:i,won:i===sa,survives:true})),hash:'h1'});assert.ok(r.out,'settled');
  assert.deepStrictEqual(calls,[L.id],'verify called once for the Ranked match');assert.ok((await db.get('MATCH#'+L.id,'META')).vq101,'marked');
  await ann.req('match.result',{id:L.id,table:[],hash:'h1'});assert.deepStrictEqual(calls,[L.id],'a late report does not call it again');
  /* a Custom match: never; a build that is not 12 hex: not kept */
  const K0=await ann.req('lobby.create',{ev:'cassian',ranked:false,cry:false});await bob.req('lobby.join',{id:K0.id});const K=await ann.req('lobby.start',{id:K0.id});
  const kh=[ann,bob].find(c=>c.acct===K.host.id);await kh.req('match.open',{id:K.id,snap:good,build:'<b>x</b>'});assert.ok(!(await db.get('MATCH#'+K.id,'META')).build,'only 12 hex');
  await bob.req('match.abandon',{id:K.id});const MK=await db.get('MATCH#'+K.id,'META');await ann.req('match.result',{id:K.id,table:[0,1,2,3].map(i=>({seat:i,won:i===MK.seats[ann.acct]})),hash:'h'});
  assert.deepStrictEqual(calls,[L.id],'Custom: no verify');
  /* admin.verify: testers only */
  try{await ann.req('admin.verify',{});throw new Error('expected a refusal')}catch(e){assert.strictEqual(e.code,'notTester')}
  await db.put('VERIFY#x1','V',{id:'x1',ok:true,GSI1PK:'VERIFY',GSI1SK:5});await db.put('VERIFY#x2','V',{id:'x2',ok:false,firstDiff:{field:'f'},GSI1PK:'VERIFY',GSI1SK:6});
  await db.put('AUDIT#x2','VERIFY',{kind:'verify_mismatch',GSI1PK:'AUDIT',GSI1SK:6});
  const A=await tess.req('admin.verify',{limit:5});assert.deepStrictEqual(A.verify.map(x=>x.id),['x2','x1'],'newest first');assert.strictEqual(A.ok,1);assert.strictEqual(A.bad,1);
  assert.ok(A.audit.some(x=>x.match==='x2'&&x.kind==='verify_mismatch'),'the audit list');assert.ok(!('PK' in A.verify[0])&&!('ttl' in A.verify[0]),'keys stripped');
  console.log('verify routes (build on the opening, one verify call per settled Ranked match, none for Custom, admin.verify): all checks passed')}

/* ---------------- v1.12 RANKED CHECK (enforce): the gated settle, routes only (a fake verifier writes VERIFY# like the real one) ---------------- */
async function gated(){
  const {makeHandler}=require('../src/index.js');C.SLOT100.start=4;C.setCatalog(catalog);
  let T=Date.UTC(2026,9,15,12);const db=store.memory();const sent=[];const live=new Set();const calls=[];let failInvoke=false;
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const mk=mode=>makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{},testers:'tess@x.com',verifyMode:mode,
    verifyMatch:async(id,o)=>{if(failInvoke)throw new Error('Rate exceeded');calls.push({id,gate:!!(o&&o.gate)})}});
  let h=mk('enforce');let nc=0,mid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  async function client(name,cls,email){const cl={name,acct:'dev-'+name};cl.conn='g'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER),...(email?{email}:{})}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});await cl.req('domus.create',{name:'Domus '+name});cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1});return cl}
  const ann=await client('gann','hero'),bob=await client('gbob','soldier'),cat=await client('gcat','amazonia'),tess=await client('gtess','slave','tess@x.com');
  const strikes=async c=>((await db.get('ACCT#'+c.acct,'PROFILE')).strikes|0);
  const meta=id=>db.get('MATCH#'+id,'META');
  const good={game:'flavius-match',S:JSON.stringify({ev:'cassian',players:[{name:'A'}]}),rng:5,log:''};
  /* a started Ranked room of these clients (2+ humans), the host opened */
  let gen=0;async function room(cls){
    /* a Ranked abandon kills: a new gladiator for a lanista whose last one fell */
    for(const c of cls)await db.set('ACCT#'+c.acct,'PROFILE',{strikes:0}); /* three strikes would flag a lanista (flagged rooms only) */
    for(const c of cls)if(!(await db.byIndex('OWNER#'+c.acct)).some(x=>x.alive))await c.req('char.create',{name:c.name[1].toUpperCase()+c.name.slice(2)+' '+'IVX'[(gen++)%3],cls:'veteranus'});
    /* Ranked rooms take one rank: everyone at the top rank (wins in earlier cases moved some up) */
    for(const c of cls)for(const x of await db.byIndex('OWNER#'+c.acct))if(x.alive)await db.set('CHAR#'+x.id,'CHAR',{rankK:C.RANKS[C.RANKS.length-1].k});
    const L0=await cls[0].req('lobby.create',{ev:'cassian',ranked:true,cry:false});for(const c of cls.slice(1))await c.req('lobby.join',{id:L0.id});
    const L=await cls[0].req('lobby.start',{id:L0.id});const host=cls.find(c=>c.acct===L.host.id);await host.req('match.open',{id:L.id,snap:good,build:'abcdef012345'});
    const M=await meta(L.id);return {L,host,seat:c=>M.seats[c.acct]}}
  const table=(R,win,o={})=>[0,1,2,3].map(i=>({seat:i,won:i===win,survives:true,f:o[i]||0}));
  const verdict=async(id,v)=>{await db.putNew('VERIFY#'+id,'V',{id,...v,GSI1PK:'VERIFY',GSI1SK:T});return h.internal({verify112:'done',id})};
  const settledPush=(c,id)=>sent.filter(x=>x.conn===c.conn&&x.msg.push==='match.settled'&&x.msg.d&&x.msg.d.id===id);

  /* 1 · two humans, one report each: held for the check (not settled), the verifier asked once with gate */
  {const R=await room([ann,bob]);const t=table(R,R.seat(ann),{[R.seat(ann)]:9});
    const r1=await ann.req('match.result',{id:R.L.id,table:t,hash:'h1'});assert.ok(r1.pending&&!r1.check112,'one of two: plain pending');assert.strictEqual(calls.length,0);
    const r2=await bob.req('match.result',{id:R.L.id,table:t,hash:'h1'});assert.deepStrictEqual(r2,{pending:true,check112:1},'both in: held for the scribes');
    let M=await meta(R.L.id);assert.strictEqual(M.status,'live','not settled yet');assert.ok(M.g112&&M.vq101,'gated');assert.deepStrictEqual(calls,[{id:R.L.id,gate:true}],'the check is asked once, gated');
    const r3=await bob.req('match.result',{id:R.L.id,table:t,hash:'h1'});assert.ok(r3.pending&&r3.check112,'a re-sent report still waits');assert.strictEqual(calls.length,1,'and asks no second check');
    await ann.req('hello',{all:1});assert.strictEqual((await meta(R.L.id)).status,'live','hello before the verdict and before 60 s: still waiting');
    const ab=await bob.req('match.abandon',{id:R.L.id});assert.ok(ab.done&&ab.held,'🚪 Abandon while held: the bout is over');
    assert.ok((await db.byIndex('OWNER#'+bob.acct)).some(x=>x.alive&&x.id===bob.ch.id)&&!((await meta(R.L.id)).abandoned||{})[bob.acct],'no Ranked Damnatio for a held match');
    /* the verdict: the replay agrees → ok, settled with the replay's table, no strike, both told */
    const s0=[await strikes(ann),await strikes(bob)];const out=await verdict(R.L.id,{ok:true,gate:1,table:t,h:'h1'});assert.ok(out.settled,'settled by the verdict '+JSON.stringify(out));
    M=await meta(R.L.id);assert.strictEqual(M.status,'done');assert.strictEqual(M.j112.k,'ok');assert.deepStrictEqual(M.agreed.table,C.tableFix101(t,4));assert.ok(!M.ov112,'the override is not kept');
    assert.deepStrictEqual([await strikes(ann),await strikes(bob)],s0,'ok: no strike');assert.ok(settledPush(ann,R.L.id).length===1&&settledPush(bob,R.L.id).length===1,'both lanistas get match.settled');
    assert.ok(!(await db.get('AUDIT#'+R.L.id,'J112')),'ok: no audit');assert.ok((await db.get('VERIFY#'+R.L.id,'J')).k==='ok');
    /* retries: the same verdict again, a duplicate invoke, a late report → nothing twice */
    const outs=JSON.stringify(M.outs);await h.internal({verify112:'done',id:R.L.id});await h.internal({verify112:'done',id:R.L.id});const r4=await ann.req('match.result',{id:R.L.id,table:t,hash:'h1'});
    M=await meta(R.L.id);assert.strictEqual(JSON.stringify(M.outs),outs,'settled once');assert.ok(r4.out,'a late report gets its outcome');assert.strictEqual(settledPush(bob,R.L.id).length,1,'one push');
    assert.deepStrictEqual([await strikes(ann),await strikes(bob)],s0)}

  /* 2 · a forged table: Bob reports more CF for himself; the replay has Ann's table → bad: the replay's table, Bob struck */
  {const R=await room([ann,bob]);const honest=table(R,R.seat(ann),{[R.seat(ann)]:6});const forged=table(R,R.seat(bob),{[R.seat(bob)]:40});
    await ann.req('match.result',{id:R.L.id,table:honest,hash:'h2'});const r=await bob.req('match.result',{id:R.L.id,table:forged,hash:'hX'});assert.ok(r.check112);
    const s0=[await strikes(ann),await strikes(bob)];await verdict(R.L.id,{ok:false,gate:1,table:honest,h:'h2'});
    const M=await meta(R.L.id);assert.strictEqual(M.status,'done');assert.strictEqual(M.j112.k,'bad');assert.deepStrictEqual(M.agreed.table,C.tableFix101(honest,4),'the REPLAY\'s table pays');
    assert.ok(M.agreed.table.find(x=>x.seat===R.seat(ann)).won,'Ann won (the replay), not Bob (his report)');
    assert.deepStrictEqual([await strikes(ann),await strikes(bob)],[s0[0],s0[1]+1],'only the differing report is struck');
    const au=await db.get('AUDIT#'+R.L.id,'J112');assert.ok(au&&au.kind==='judge_bad'&&au.minority.includes(bob.acct),'AUDIT judge_bad '+JSON.stringify(au))}

  /* 3 · a lone human vs CPUs (Bob abandons): his report is not trusted — the replay is the result, his differing report struck */
  {const R=await room([ann,bob]);await bob.req('match.abandon',{id:R.L.id});const mine=table(R,R.seat(ann),{[R.seat(ann)]:30});const real=table(R,(R.seat(ann)+2)%4,{[R.seat(ann)]:3});
    const r=await ann.req('match.result',{id:R.L.id,table:mine,hash:'h3'});assert.ok(r.pending&&r.check112,'a lone human waits for the check too');
    assert.strictEqual((await meta(R.L.id)).status,'live');const s0=await strikes(ann);await verdict(R.L.id,{ok:false,gate:1,table:real,h:'h3r'});
    const M=await meta(R.L.id);assert.strictEqual(M.j112.k,'bad');assert.ok(!M.agreed.unverified,'checked, not "unverified"');assert.ok(!M.agreed.table.find(x=>x.seat===R.seat(ann)).won,'the replay: Ann did not win');
    assert.strictEqual(await strikes(ann),s0+1,'his false report: a strike');assert.ok(settledPush(ann,R.L.id).length===1)}

  /* 4 · a forged opening: the host is struck; the others' agreement with the host's row stripped of its reward */
  {const R=await room([ann,bob,cat]);const others=[ann,bob,cat].filter(c=>c!==R.host);const hs=R.seat(R.host);const t=table(R,hs,{[hs]:25});
    for(const c of [ann,bob,cat])await c.req('match.result',{id:R.L.id,table:t,hash:'h4'});const sH=await strikes(R.host),sO=await Promise.all(others.map(strikes));
    await verdict(R.L.id,{ok:false,forged:true,gate:1,openDiff:{field:'hp',seat:hs,want:{head:5},got:{head:50}}});
    const M=await meta(R.L.id);assert.strictEqual(M.status,'done');assert.strictEqual(M.j112.k,'forged');const hr=M.agreed.table.find(x=>x.seat===hs);
    assert.ok(hr&&!hr.won&&hr.coin===0&&hr.f===0,'the host\'s row: no reward '+JSON.stringify(hr));assert.strictEqual(await strikes(R.host),sH+1,'the host is struck');
    assert.deepStrictEqual(await Promise.all(others.map(strikes)),sO,'the others are not');
    const au=await db.get('AUDIT#'+R.L.id,'J112');assert.ok(au&&au.kind==='judge_forged'&&au.host===R.host.acct&&au.diff.field==='hp');
    await h.internal({verify112:'done',id:R.L.id});assert.strictEqual(await strikes(R.host),sH+1,'struck once')}
  /* … and a host alone (the other abandoned): nobody else to agree → void */
  {const R=await room([ann,bob]);const other=R.host===ann?bob:ann;await other.req('match.abandon',{id:R.L.id});await R.host.req('match.result',{id:R.L.id,table:table(R,R.seat(R.host)),hash:'h5'});
    await verdict(R.L.id,{ok:false,forged:true,gate:1,openDiff:{field:'st'}});const M=await meta(R.L.id);assert.ok(M.status==='done'&&M.agreed.void&&M.j112.k==='forged','a forging host alone: void')}

  /* 5 · TIMEOUT FALLBACK (R4a): no verdict in 60 s → today's agreement, flagged unjudged — by hello's sweep; a verdict after it is ignored */
  {const R=await room([ann,bob]);const t=table(R,R.seat(bob),{[R.seat(bob)]:7});await ann.req('match.result',{id:R.L.id,table:t,hash:'h6'});await bob.req('match.result',{id:R.L.id,table:t,hash:'h6'});
    T+=30000;await ann.req('hello',{all:1});assert.strictEqual((await meta(R.L.id)).status,'live','30 s: still waiting');
    T+=31000;await ann.req('hello',{all:1});let M=await meta(R.L.id);assert.strictEqual(M.status,'done','60 s: settled by the sweep');assert.strictEqual(M.j112.k,'unjudged');assert.strictEqual(M.j112.why,'timeout');
    assert.deepStrictEqual(M.agreed.table,C.cleanTable(t),'by agreement');const au=await db.get('AUDIT#'+R.L.id,'J112');assert.ok(au&&au.kind==='judge_unjudged'&&au.why==='timeout','flagged');
    const outs=JSON.stringify(M.outs);await verdict(R.L.id,{ok:false,gate:1,table:table(R,R.seat(ann)),h:'zz'});M=await meta(R.L.id);assert.strictEqual(JSON.stringify(M.outs),outs,'a late verdict changes nothing');assert.strictEqual(M.j112.k,'unjudged')}
  /* … the sweep on match.get and on the lobby list (prune) too */
  {const R=await room([ann,bob]);const t=table(R,R.seat(ann));await ann.req('match.result',{id:R.L.id,table:t,hash:'h7'});await bob.req('match.result',{id:R.L.id,table:t,hash:'h7'});
    T+=61000;await cat.req('match.get',{id:R.L.id,from:0}).catch(()=>{});assert.strictEqual((await meta(R.L.id)).status,'done','match.get sweeps')}
  {const R=await room([ann,bob]);const t=table(R,R.seat(ann));await ann.req('match.result',{id:R.L.id,table:t,hash:'h8'});await bob.req('match.result',{id:R.L.id,table:t,hash:'h8'});
    assert.ok((await db.get('LOBBY#'+R.L.id,'LOBBY')).g112,'the room is marked');T+=61000;await cat.req('hello',{all:1});assert.strictEqual((await meta(R.L.id)).status,'done','another lanista\'s lobby list sweeps it')}
  /* 6 · unjudgeable at once: the verifier skipped (an old page without a build / the build changed) → agreement + flag, no 60 s wait; the verifier down → the same */
  {const R=await room([ann,bob]);const t=table(R,R.seat(ann));await ann.req('match.result',{id:R.L.id,table:t,hash:'h9'});await bob.req('match.result',{id:R.L.id,table:t,hash:'h9'});
    await verdict(R.L.id,{skipped:'build',gate:1});const M=await meta(R.L.id);assert.ok(M.status==='done'&&M.j112.k==='unjudged'&&M.j112.why==='build','skipped build → unjudged at once')}
  {failInvoke=true;const R=await room([ann,bob]);const t=table(R,R.seat(ann));await ann.req('match.result',{id:R.L.id,table:t,hash:'h10'});const r=await bob.req('match.result',{id:R.L.id,table:t,hash:'h10'});failInvoke=false;
    const M=await meta(R.L.id);assert.ok(r.out!==undefined||r.char,'the verifier could not be asked: settled in the same request');assert.ok(M.status==='done'&&M.j112.k==='unjudged'&&M.j112.why==='noverify')}
  /* 7 · admin.verify: the counts and the decisions */
  {const A=await tess.req('admin.verify',{limit:50});assert.ok(A.decided.ok>=1&&A.decided.bad>=2&&A.decided.forged>=2&&A.decided.unjudged>=4,'decided '+JSON.stringify(A.decided));
    assert.ok(A.forged>=2&&A.unjudged>=4&&A.mode==='enforce','counts '+JSON.stringify({ok:A.ok,bad:A.bad,skipped:A.skipped,forged:A.forged,unjudged:A.unjudged,mode:A.mode}));assert.ok(A.judged.every(x=>!('agree' in x)&&!('PK' in x)))}
  /* 8 · ENFORCE OFF (VERIFY_MODE=log, the rollback): settles at once by agreement, the check after it (v1.01); a match left gated settles at the next sweep */
  {const R=await room([ann,bob]);const t=table(R,R.seat(ann));await ann.req('match.result',{id:R.L.id,table:t,hash:'h11'});await bob.req('match.result',{id:R.L.id,table:t,hash:'h11'});
    assert.strictEqual((await meta(R.L.id)).status,'live');h=mk('log');calls.length=0;
    await ann.req('hello',{all:1});const M=await meta(R.L.id);assert.ok(M.status==='done'&&!M.j112&&M.agreed.table,'the gate off: a held match settles by agreement at once');
    const R2=await room([ann,bob]);await ann.req('match.result',{id:R2.L.id,table:t,hash:'h12'});const r=await bob.req('match.result',{id:R2.L.id,table:t,hash:'h12'});
    assert.ok(r.out!==undefined&&!r.pending,'log mode: settled in the request');assert.deepStrictEqual(calls,[{id:R2.L.id,gate:false}],'log mode: the check after the settle')}
  console.log('verify gated (enforce: held until the verdict, the replay\'s table + strikes, forged opening, lone human, 60 s fallback via hello / match.get / lobby list, unjudged skips, verifier down, retries once, admin.verify counts, enforce off): all checks passed')}

async function verifier(){
  assert.ok(fs.existsSync(PAGE),'the built page (flavius-arena.html) is needed: sh build.sh');
  const {bundle}=require(path.join(ROOT,'tools','node','mkbundle.js'));const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vf101-'));
  const meta=bundle(PAGE,dir);const rules=require(path.join(dir,'rules.js'));assert.strictEqual(rules.build,meta.build);assert.ok(/^[0-9a-f]{12}$/.test(rules.build));
  /* the recorded match + both lanistas handing their seats to CPUs (the server's abandon input, Custom rule 'cpu', no reclaim window) */
  const G=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT,'tools','replay','golden','online-mock.json.gz'))));
  const ins=G.inputs.map(x=>({...x}));let s=ins[ins.length-1].seq;ins.push({k:'abandon',seat:0,rule:'cpu',from:'server',seq:++s},{k:'abandon',seat:1,rule:'cpu',from:'server',seq:++s});
  /* the reference: one replay (what the fighters' pages compute — checked against Chromium when this test was written) */
  const ref=await V.replayMatch(rules,{open:G.open,inputs:ins,t0:Date.parse(G.at)});
  assert.ok(ref.done,'the match runs to its end: '+ref.why+' '+JSON.stringify(ref.errors));assert.ok(/^h\d+$/.test(ref.h),'end hash '+ref.h);assert.strictEqual(ref.table.length,4);
  assert.strictEqual(ref.inDiff,null,'every input met its sender\'s pre-hash');assert.ok(ref.table.some(r=>r.won),'a winner');
  console.log(`  replay: ${ins.length} inputs, ${ref.turns} turns, end ${ref.h}, ${ref.ms} ms (page ${Math.round(ref.virtMs/1000)} s)`);
  const T=Date.UTC(2026,9,14,12);const now=()=>T;const logs=[];const log=x=>logs.push(String(x));
  const db=store.memory();
  async function match(id,o={}){const table=C.cleanTable(o.table||ref.table);const rep={table,hash:o.hash!=null?o.hash:ref.h};
    await db.put('MATCH#'+id,'META',{id,ranked:o.ranked!==false,status:o.status||'done',build:o.build===undefined?rules.build:o.build,players:['a1','a2'],seats:{a1:0,a2:1},
      agreed:o.void?{table:null,void:true,minority:[]}:{table,void:false,minority:[]},reports:{a1:rep,a2:rep},startAt:Date.parse(G.at)});
    await db.put('MATCH#'+id,'OPEN',{snap:G.open});for(const x of ins)await db.put('MATCH#'+id,'IN#'+String(x.seq).padStart(8,'0'),{in:x});await db.put('LOBBY#'+id,'LOBBY',{id,seats:4})}
  const run=(id,o={})=>V.verifyMatch({store:db,id,rules:o.rules===undefined?rules:o.rules,C,now,mode:o.mode||'log',log});
  /* ok */
  await match('m-ok');const ok=await run('m-ok');assert.strictEqual(ok.ok,true,'ok: '+JSON.stringify(ok).slice(0,400));assert.strictEqual(ok.build,rules.build);assert.ok(!ok.firstDiff);
  const vr=await db.get('VERIFY#m-ok','V');assert.ok(vr&&vr.ok&&vr.GSI1PK==='VERIFY'&&vr.ttl>T/1000,'VERIFY# written');assert.ok(!(await db.get('AUDIT#m-ok','VERIFY')),'no audit');
  const ok2=await run('m-ok');assert.ok(ok2.again&&ok2.ok,'one verdict a match (async invokes may retry)');
  /* a tampered table: the CF of a seat */
  const bad=ref.table.map(r=>({...r}));bad[2].f+=5;await match('m-f',{table:bad});const before=JSON.stringify(await db.get('MATCH#m-f','META'));
  const vf=await run('m-f');assert.strictEqual(vf.ok,false);assert.deepStrictEqual(vf.firstDiff,{field:'f',seat:2,want:bad[2].f,got:ref.table[2].f});
  const au=await db.get('AUDIT#m-f','VERIFY');assert.ok(au&&au.kind==='verify_mismatch'&&au.GSI1PK==='AUDIT','AUDIT# written: '+JSON.stringify(au));
  assert.strictEqual(JSON.stringify(await db.get('MATCH#m-f','META')),before,'log only: the settlement is untouched');assert.ok(logs.some(l=>/MISMATCH m-f/.test(l)));
  /* a tampered winner, then a tampered end hash */
  const bw=ref.table.map(r=>({...r,won:!r.won}));await match('m-w',{table:bw});const vw=await run('m-w');assert.strictEqual(vw.firstDiff.field,'won');
  await match('m-h',{hash:'h123'});const vh=await run('m-h');assert.deepStrictEqual(vh.firstDiff,{field:'hash',want:'h123',got:ref.h});
  /* skipped: another build, none on the match, no bundle, Custom, void, still live; VERIFY_MODE=off */
  await match('m-b',{build:'000000000000'});const vb=await run('m-b');assert.strictEqual(vb.skipped,'build');assert.strictEqual(vb.rules,rules.build);assert.ok(!(await db.get('AUDIT#m-b','VERIFY')));
  await match('m-nb',{build:null});assert.strictEqual((await run('m-nb')).skipped,'nobuild');
  await match('m-nr');assert.strictEqual((await run('m-nr',{rules:null})).skipped,'nobundle');
  await match('m-c',{ranked:false});assert.strictEqual((await run('m-c')).skipped,'custom');
  await match('m-v',{void:true});assert.strictEqual((await run('m-v')).skipped,'void');
  await match('m-l',{status:'live'});assert.strictEqual((await run('m-l')).skipped,'live');assert.ok(!(await db.get('VERIFY#m-l','V')),'a live match is not written (verified later)');
  await match('m-o');assert.ok((await run('m-o',{mode:'off'})).off);assert.ok(!(await db.get('VERIFY#m-o','V')),'off: nothing written');
  /* the Lambda's handler module loads (no AWS call without an id) */
  const L=require('../verify/index.js');assert.deepStrictEqual(await L.handler({}),{skipped:'noid'});
  process.env.VERIFY_MODE='off';assert.deepStrictEqual(await L.handler({id:'m-ok'}),{off:true});delete process.env.VERIFY_MODE;
  /* ---------------- v1.12 with the real rules: the opening field check (E2), the choice audit (E3), the gated record, the Lambda's tell ---------------- */
  {const {makeHandler}=require('../src/index.js');const VI=require('../verify/index.js');
    let TT=Date.UTC(2026,9,16,12);const rdb=store.memory();const sent=[];const live=new Set();const queue=[];
    const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
    const told=[];const hh=makeHandler({limits:false,db:rdb,send,dev:true,verifyCfg:{},now:()=>TT,hereMs:0,countdown:0,log:()=>{},verifyMode:'enforce',
      verifyMatch:async(id,o)=>{queue.push(()=>VI.handle({id,gate:!!(o&&o.gate)},{db:rdb,rules,now:()=>TT,log,arena:'flavius-arena',invoke:async(fn,ev)=>{told.push(ev);return hh.internal(ev)}}))}});
    let nc=0,mid=0;const ask=async(conn,t,d)=>{TT+=10;const id=++mid;await hh({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
    async function client(name,cls,gear){const cl={name,acct:'dev-'+name};cl.conn='r'+(++nc);live.add(cl.conn);await hh({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});
      cl.req=(t,d)=>ask(cl.conn,t,d);await cl.req('auth.signin',{name});await cl.req('domus.create',{name:'Domus '+name});cl.ch=await cl.req('char.create',{name:name+' Gladius',cls});
      if(gear)await rdb.set('CHAR#'+cl.ch.id,'CHAR',{gear});await cl.req('hello',{all:1});return cl}
    const ra=await client('rann','hero',['gladius','galea','manica']),rb=await client('rbob','soldier',['hasta','scutum']);
    async function room(){const L0=await ra.req('lobby.create',{ev:'democritus',ranked:true,cry:false});await rb.req('lobby.join',{id:L0.id});const L=await ra.req('lobby.start',{id:L0.id});
      const LB=await rdb.get('LOBBY#'+L.id,'LOBBY');const host=[ra,rb].find(c=>c.acct===L.host.id);return {L:LB,host,other:host===ra?rb:ra}}
    const R1=await room();const B=await V.rebuildOpen112(rules,R1.L,{t0:R1.L.started});assert.ok(B.S&&B.snap,'the opening rebuilt from the room '+JSON.stringify(B.error||''));
    const hs=R1.L.players.findIndex(p=>p.id===R1.L.host.id);const S0=B.S;
    assert.deepStrictEqual(S0.players[hs]._onlKit.slice().sort(),R1.L.players[hs].kit.gear.slice().sort(),'the rebuild carries the room\'s kit');
    /* honest → ok; each forgery → its field */
    const chk=async S=>V.openCheck112(rules,{...B.snap,S:JSON.stringify(S)},R1.L,{t0:R1.L.started});
    const c0=await chk(S0);assert.ok(c0.ok,'the honest opening passes '+JSON.stringify(c0));
    const forge=f=>{const S=JSON.parse(JSON.stringify(S0));f(S);return S};
    const cases=[['hp',S=>{S.players[hs].hp.chest+=4}],['st',S=>{S.players[hs].st.str=99}],['ap',S=>{S.players[hs].ap.head+=3}],['cpus',S=>{S.players[2].cpu=false}],['ev',S=>{S.evKey='cassian'}],
      ['kit',S=>{S.players[hs]._onlKit.push('lorica')}],['cf',S=>{S.players[hs].cf+=6}],['n',S=>{S.players.pop()}],['cls',S=>{S.players[hs].cls='veteranus'}]];
    for(const [want,f] of cases){const r=await chk(forge(f));assert.ok(r.forged,want+': forged '+JSON.stringify(r));assert.strictEqual(r.diff.field,want,want+' → '+JSON.stringify(r.diff))}
    assert.ok((await V.openCheck112(rules,B.snap,{id:'x',seats:4})).skipped==='nolobby','a room without seats: not checked');
    console.log(`  opening check: rebuilt in ${B.ms} ms, honest ok, ${cases.length} forgeries caught`);
    /* E2 end to end: the host opens a FORGED arena (+20 Strength on his own seat); both report → the real verifier (gated) → forged → host struck */
    const forged=forge(S=>{S.players[hs].st.str=Math.min(99,S.players[hs].st.str+20)});
    await R1.host.req('match.open',{id:R1.L.id,snap:{...B.snap,S:JSON.stringify(forged)},build:rules.build});
    const tb=[0,1,2,3].map(i=>({seat:i,won:i===hs,survives:true}));await ra.req('match.result',{id:R1.L.id,table:tb,hash:'hf'});const rr=await rb.req('match.result',{id:R1.L.id,table:tb,hash:'hf'});
    assert.ok(rr.pending&&rr.check112,'held');assert.strictEqual(queue.length,1,'the verifier asked once');const sH=((await rdb.get('ACCT#'+R1.host.acct,'PROFILE')).strikes|0);
    const vr=await queue.shift()();assert.ok(vr.forged,'the verifier: forged '+JSON.stringify(vr));assert.deepStrictEqual(told,[{verify112:'done',id:R1.L.id}],'the arena told');
    const MF=await rdb.get('MATCH#'+R1.L.id,'META');assert.ok(MF.status==='done'&&MF.j112.k==='forged','settled as forged');assert.strictEqual(((await rdb.get('ACCT#'+R1.host.acct,'PROFILE')).strikes|0),sH+1,'the host is struck');
    assert.ok(!MF.agreed.table.find(x=>x.seat===hs).won,'the forger\'s row has no win');assert.ok((await rdb.get('AUDIT#'+R1.L.id,'VERIFY')).kind==='verify_forged');
    /* a retried invoke: told again, settled once */
    await VI.handle({id:R1.L.id,gate:true},{db:rdb,rules,now:()=>TT,log,arena:'flavius-arena',invoke:async(fn,ev)=>{told.push(ev);return hh.internal(ev)}});assert.strictEqual(told.length,2);
    assert.strictEqual(((await rdb.get('ACCT#'+R1.host.acct,'PROFILE')).strikes|0),sH+1,'struck once');
    /* an honest opening with no moves in the stream: the replay cannot finish → unjudged → the agreement */
    const R2=await room();const B2=await V.rebuildOpen112(rules,R2.L,{t0:R2.L.started});await R2.host.req('match.open',{id:R2.L.id,snap:B2.snap,build:rules.build});
    await ra.req('match.result',{id:R2.L.id,table:tb,hash:'hh'});await rb.req('match.result',{id:R2.L.id,table:tb,hash:'hh'});const v2=await queue.shift()();
    const V2=await rdb.get('VERIFY#'+R2.L.id,'V');assert.ok(V2.open==='ok'&&V2.done===false&&V2.gate,'opening ok, replay unfinished '+JSON.stringify({open:V2.open,done:V2.done,why:V2.why,ms:v2.ms}));
    const M2=await rdb.get('MATCH#'+R2.L.id,'META');assert.ok(M2.status==='done'&&M2.j112.k==='unjudged'&&/^end/.test(M2.j112.why),'unjudged → agreement '+JSON.stringify(M2.j112));
    /* the Lambda tells the arena whatever happened: no bundle, a crash */
    const R3=await room();await R3.host.req('match.open',{id:R3.L.id,snap:B2.snap,build:rules.build});await ra.req('match.result',{id:R3.L.id,table:tb,hash:'h'});await rb.req('match.result',{id:R3.L.id,table:tb,hash:'h'});queue.length=0;
    const n0=told.length;await VI.handle({id:R3.L.id,gate:true},{db:{...rdb,get:async()=>{throw new Error('Dynamo down')},putNew:rdb.putNew},rules,log,arena:'x',invoke:async(fn,ev)=>{told.push(ev);return hh.internal(ev)}});
    assert.strictEqual(told.length,n0+1,'a crash still tells the arena');const M3=await rdb.get('MATCH#'+R3.L.id,'META');assert.ok(M3.status==='done'&&M3.j112.k==='unjudged'&&M3.j112.why==='error','a crashed check: unjudged '+JSON.stringify(M3.j112))}
  /* the gated record on the recorded match: the replay's own table + hash ride in VERIFY# (the arena settles with them); the choice audit */
  {const gm=async(id,o={})=>{const tb=C.cleanTable(o.table||ref.table);const rep={table:tb,hash:ref.h};
      await db.put('MATCH#'+id,'META',{id,ranked:true,status:'live',g112:T,build:rules.build,players:['a1','a2'],seats:{a1:0,a2:1},host:'a1',reports:{a1:rep,a2:o.rep2||rep},startAt:Date.parse(G.at)});
      await db.put('MATCH#'+id,'OPEN',{snap:G.open});for(const x of (o.ins||ins))await db.put('MATCH#'+id,'IN#'+String(x.seq).padStart(8,'0'),{in:x});await db.put('LOBBY#'+id,'LOBBY',{id,seats:4})};
    await gm('g-ok');const g1=await run('g-ok',{mode:'enforce'});assert.ok(g1.ok&&g1.gate===1,'gated ok '+JSON.stringify(g1).slice(0,300));assert.deepStrictEqual(g1.table,C.cleanTable(ref.table),'the replay\'s table in the record');
    assert.strictEqual(g1.h,ref.h);assert.strictEqual(g1.open,'skip:nolobby');assert.deepStrictEqual(g1.choice,{n:2,open:0,flags:0},'two window answers, both on the menu');
    /* a void agreement (two lanistas disagree) is still replayed when gated */
    const other=ref.table.map(r=>({...r,f:r.f+1}));await gm('g-void',{rep2:{table:C.cleanTable(other),hash:'hzz'}});const g2=await run('g-void',{mode:'enforce'});assert.ok(Array.isArray(g2.table)&&!g2.skipped,'a void agreement is replayed');
    /* E3: an answer that was not on the menu (999 for a yes/no window) → AUDIT#<id> CHOICE (the verdict itself stands) */
    const odd=ins.map(x=>({...x}));odd[odd.findIndex(x=>x.k==='modal')].v=999;await gm('g-choice',{ins:odd});const g3=await run('g-choice',{mode:'enforce'});
    assert.strictEqual(g3.choice.flags,1,'one off-menu answer '+JSON.stringify(g3.choice));const ac=await db.get('AUDIT#g-choice','CHOICE');
    assert.ok(ac&&ac.kind==='offmenu_answer'&&ac.flags[0].v==='999'&&ac.flags[0].kd==='shieldRaise'&&ac.flags[0].offered.includes('1'),'AUDIT CHOICE '+JSON.stringify(ac));
    console.log('verify v1.12 (rules: the opening check honest / forged ×'+9+', forged end to end → host struck, unfinished → unjudged, the Lambda tells the arena on a crash, the gated record, the choice audit): all checks passed')}
  fs.rmSync(dir,{recursive:true,force:true});
  console.log('verify (replay of a recorded match with the rules bundle: ok, tampered CF / winner / end hash logged, build / bundle / Custom / void / live / off skipped, one verdict): all checks passed')}

(async()=>{await routes();await gated();await verifier();console.log('verify.test: '+((Date.now()-T0)/1000).toFixed(1)+' s');process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
