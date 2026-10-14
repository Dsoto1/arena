/* v1.01 wave 2 Phase E — THE SERVER CHECKS RANKED RESULTS (server/verify; docs/backend.md "v1.01 Ranked verification"). Plain node, no browser.
   1 · routes: match.open keeps the host page's build on META (first opening only, hex only); a settled Ranked match calls verify(id) once
       (Custom and void never); admin.verify is testers only and lists VERIFY# / AUDIT#.
   2 · the verifier on the in-memory store: the rules bundle (tools/node/mkbundle.js → a temp dir) replays a recorded online match
       (tools/replay/golden/online-mock.json.gz: the host's opening + the lockstep stream, both lanistas then handing their seats to CPUs so the
       match runs to its end) — the agreed result → ok; a tampered table / end hash → a mismatch logged (VERIFY# + AUDIT# VERIFY), the settlement
       untouched; another build → skipped 'build'; no bundle, Custom, void, live, VERIFY_MODE=off, a second call (one verdict a match).
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
  fs.rmSync(dir,{recursive:true,force:true});
  console.log('verify (replay of a recorded match with the rules bundle: ok, tampered CF / winner / end hash logged, build / bundle / Custom / void / live / off skipped, one verdict): all checks passed')}

(async()=>{await routes();await verifier();console.log('verify.test: '+((Date.now()-T0)/1000).toFixed(1)+' s');process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
