/* v1.01 (the "v1.01" section of onlcore + its block in routes.js + index.js REQUIRE_GOOGLE; tools/plans/v101/SECURITY.md):
   kits follow the v1.0 loadouts (Damnatio Iron Helm + Belt I, no Falcata anywhere), snapshots / inputs carrying markup refused, the opening written once,
   own routes only, result tables cleaned against the room + the audit item, Google-only sign-in when required. node server/test/v101.test.js */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');const catalog=require('../src/catalog.json');

function units(){C.setCatalog(catalog);
  /* 1 · kits */
  assert.deepStrictEqual(C.CLASS_KITS92.damnatio,['galea','balteus1','wraps','legwraps']);
  const K=require('../src/kits92.json');assert.deepStrictEqual(K.damnatio,['galea','balteus1','wraps','legwraps'],'kits92.json rebuilt from the v1.0 classes');
  assert.deepStrictEqual(K.amazonia,['amazon','cestus','greaves','legwraps'],'armor only — the Falcata was never in a kit');
  for(const k of C.CLASSES8){assert.ok(!(C.ISSUE_W100[k]||[]).includes('falcata'),'no Falcata issued');for(const b of K[k])assert.ok(catalog[b]&&catalog[b].kind==='a',k+': '+b)}
  C.setKits92(K);assert.deepStrictEqual(C.kitList92('cls','damnatio'),['galea','balteus1','wraps','legwraps']);
  /* 2 · snapshots */
  const S=o=>({game:'flavius-match',S:JSON.stringify(o),rng:1,uid:3,log:'<li class="lg"><b style="color:#c33">Leo</b> hits <span data-onl="x">Ann</span> &amp; more</li>'});
  assert.strictEqual(C.snapBad101(S({players:[{name:'Ann',color:'#d4b13c'}],note:'Hold on — 3 > 2, a < b'})),'','a plain opening passes');
  for(const bad of [S({players:[{name:'<img src=x onerror=alert(1)>'}]}),S({players:[{color:'red" onmouseover="alert(1)'}]}),{S:'{"x":"\\u003cscript\\u003ealert(1)\\u003c/script\\u003e"}'},
    S({a:'<a href="javascript:alert(1)">x</a>'}),S({a:'<a href="&#106;avascript:alert(1)">x</a>'}),S({['<svg onload=alert(1)>']:1}),{...S({}),log:'<li><img src=x onerror=alert(1)></li>'},
    S({a:'<iframe srcdoc="x"></iframe>'}),{...S({}),extra:{deep:[{x:'<object data="data:text/html,x">'}]}},S({a:'<math><mtext>x</mtext></math>'})])
    assert.ok(C.snapBad101(bad),'refused: '+JSON.stringify(bad).slice(0,90));
  assert.ok(C.snapBad101(null)&&C.snapBad101('x')&&C.snapBad101([]),'not an object');
  assert.strictEqual(C.snapBad101({S:'x'.repeat(1000)}),'','an unparsable S is only scanned');
  assert.strictEqual(C.inBad101({k:'modal',v:{a:1,b:'Yes'},t:'Trade'}),'');assert.ok(C.inBad101({k:'act',a:'buy',id:'x" onfocus="y'}));assert.ok(C.inBad101({k:'modal',v:['<img src=x onerror=1>']}));
  /* 3 · tables */
  const t=C.tableFix101([{seat:2,f:3},{seat:0,won:true,f:9},{seat:2,f:99},{seat:7,won:true},{seat:-1},{seat:1}],4);
  assert.deepStrictEqual(t.map(r=>[r.seat,r.f]),[[0,9],[1,0],[2,3]],'one row a seat, the first; seats beyond the room dropped');
  assert.deepStrictEqual(C.tableFlags101([{seat:0,won:true,f:10},{seat:1,won:true,f:200}],{team:false,humanSeats:[0,1,2]}),['missing:2','multi_win','all_won','f_high']);
  assert.deepStrictEqual(C.tableFlags101([{seat:0,won:true,f:10},{seat:1,won:true},{seat:2},{seat:3}],{team:true,humanSeats:[0,1]}),[],'a team win is fine');
  console.log('v1.01 units (kits, snapshot / input checks, tables): all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');C.SLOT100.start=4;
  let T=Date.UTC(2026,9,14,12);const db=store.memory();const sent=[];const live=new Set();const logs=[];
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:x=>logs.push(x)});let nc=0,mid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const rejects=async(p,code)=>{try{await p}catch(e){assert.strictEqual(e.code,code,e.message);return e}throw new Error('expected '+code)};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='c'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1});return cl}
  const getD=id=>db.get('DOMUS#'+id,'DOMUS');const setD=async(id,f)=>{const D=await getD(id);Object.assign(D,f);await db.put('DOMUS#'+id,'DOMUS',D)};
  const ann=await client('ann','damnatio'),bob=await client('bob','amazonia');
  /* 1 · the Damnatio's class kit: Iron Helm + Belt I + padding, bought by the treasury */
  await setD(ann.domus.id,{treasury:2000});const k=await ann.req('market.kit',{char:ann.ch.id,kit:'cls'});
  assert.deepStrictEqual(k.bought.slice().sort(),['balteus1','galea','legwraps','wraps']);assert.ok(['galea','balteus1'].every(b=>k.char.gear.includes(b)),'he holds them');
  /* own routes only */
  for(const t of ['constructor','__proto__','toString','hasOwnProperty'])await rejects(ann.req(t,{}),'unknown_req');
  /* 2 · a Ranked match: the opening and resyncs */
  const L0=await ann.req('lobby.create',{ev:'cassian',ranked:true,cry:false});await bob.req('lobby.join',{id:L0.id});const L=await ann.req('lobby.start',{id:L0.id});
  const host=[ann,bob].find(c=>c.acct===L.host.id),other=host===ann?bob:ann;
  await rejects(host.req('match.open',{id:L.id,snap:{S:JSON.stringify({players:[{name:'<img src=x onerror=alert(1)>'}]}),log:''}}),'snap_bad');
  assert.ok(!(await db.get('MATCH#'+L.id,'OPEN')),'nothing stored');
  const good={game:'flavius-match',S:JSON.stringify({ev:'cassian',players:[{name:'Ann'}]}),rng:5,log:'<li><b>start</b></li>'};
  await host.req('match.open',{id:L.id,snap:good});assert.strictEqual((await db.get('MATCH#'+L.id,'OPEN')).snap.rng,5);
  const again=await host.req('match.open',{id:L.id,snap:{...good,rng:9}});assert.strictEqual(again.kept,1);assert.strictEqual((await db.get('MATCH#'+L.id,'OPEN')).snap.rng,5,'the first opening stays');
  await rejects(other.req('match.open',{id:L.id,snap:good}).catch(e=>{e.code=e.code||'host';throw e}),'host');
  await rejects(host.req('match.snap',{id:L.id,to:other.acct,snap:{...good,log:'<li><img src=x onerror=alert(1)></li>'},seq:1}),'snap_bad');
  /* 2 · a move with markup never takes a seq */
  const M0=await db.get('MATCH#'+L.id,'META');const seat=M0.seats[ann.acct];
  await rejects(ann.req('match.input',{id:L.id,in:{k:'act',a:'buy',id:'x" onfocus="alert(1)',seat}}),'in_bad');
  assert.strictEqual((await db.get('MATCH#'+L.id,'META')).n,M0.n,'no seq burned');
  const ok=await ann.req('match.input',{id:L.id,in:{k:'tile',r:3,c:4,mode:'move',seat}});assert.strictEqual(ok.seq,M0.n);
  /* 3 · Bob abandons (Ranked: his Fate); Ann's lone report settles, cleaned against the room, and is put on the audit list */
  await bob.req('match.abandon',{id:L.id});const sa=M0.seats[ann.acct];
  const table=[{seat:sa,won:true,survives:true,f:12},{seat:sa,won:false,f:300},{seat:9,won:true,f:400},...[0,1,2,3].filter(i=>i!==sa).map(i=>({seat:i,survives:true}))];
  const r=await ann.req('match.result',{id:L.id,table,hash:'h1'});assert.ok(r.out,'settled');
  const M1=await db.get('MATCH#'+L.id,'META');assert.strictEqual(M1.status,'done');assert.ok(M1.agreed.unverified);
  assert.strictEqual(M1.agreed.table.length,4,'one row a seat, seat 9 gone');assert.strictEqual(M1.agreed.table.find(x=>x.seat===sa).f,12,'the first row of a seat counts');
  const AU=await db.get('AUDIT#'+L.id,'A');assert.ok(AU&&AU.flags.includes('unverified'),'audited: '+JSON.stringify(AU));assert.strictEqual(AU.GSI1PK,'AUDIT');
  console.log('server v1.01 routes (Damnatio kit, own routes only, opening checked + written once, snapshots and moves with markup refused, tables cleaned, audit): all checks passed')}

async function google(){
  const {makeHandler}=require('../src/index.js');const db=store.memory();const send=async()=>false;let who={sub:'g-1',identities:[{providerName:'Google'}]};
  const mk=req=>makeHandler({limits:false,db,send,dev:false,verifyCfg:{},verifyFn:async()=>who,now:()=>Date.UTC(2026,9,14),requireGoogle:req,log:()=>{}});
  const con=async(h,c)=>(await h({requestContext:{routeKey:'$connect',connectionId:c},queryStringParameters:{token:'t',ver:String(C.VER)}})).statusCode;
  assert.strictEqual(await con(mk(true),'k1'),200,'a Google sign-in');
  who={sub:'n-1'};assert.strictEqual(await con(mk(true),'k2'),401,'a pool user made through SignUp is refused');
  who={sub:'n-2',identities:[{providerName:'Cognito'}]};assert.strictEqual(await con(mk(true),'k3'),401);
  assert.strictEqual(await con(mk(false),'k4'),200,'stacks without Google keep working');
  console.log('server v1.01 sign-in (REQUIRE_GOOGLE): all checks passed')}

units();routes().then(google).catch(e=>{console.error(e);process.exit(1)});
