/* v1.0 REPLAYS: replay.put builds a Ranked match's replay from the server's own opening + inputs (never the client's), only for a human fighter,
   only once the match is settled, once a match, without account ids; replay.get for anyone (guests too); Custom matches are refused; the size cap.
   node server/test/v100rp.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');

function units(){
  assert.strictEqual(C.replayPutWhy100({id:'L1',h:'habc',v:'1.00'}),null);assert.ok(C.replayPutWhy100({id:'<x>'}),'bad id');assert.ok(C.replayPutWhy100({id:'L1',h:'x'.repeat(40)}),'long hash');
  assert.ok(C.replayPutWhy100(null)&&C.replayPutWhy100({}),'no id');
  assert.deepStrictEqual(C.replayAnon100({k:'tile',from:'dev-ann',seq:3,acct:'dev-ann'}),{k:'tile',from:'p',seq:3,acct:'p'},'account ids blanked');
  assert.strictEqual(C.replayAnon100({k:'drop',from:'server',seq:4}).from,'server','server inputs stay server inputs');
  const rp=C.replayPack100({id:'L1',v:'1.00',h:'h1',at:5,ev:'democritus',loc:6,open:{S:'{}'},inputs:[{seq:2,from:'a'},{seq:1,from:'server'}]});
  assert.deepStrictEqual(rp.inputs.map(x=>x.seq),[1,2],'server order');assert.ok(rp.ranked&&rp.id==='L1'&&rp.ev==='democritus');
  assert.ok(C.GUEST_OK.includes('replay.get')&&!C.GUEST_OK.includes('replay.put'),'guests read, never write');
  console.log('v1.0 replay units: all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=Date.UTC(2026,9,12,12);const db=store.memory();const sent=[];const live=new Set();let rs=7;
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,rnd:()=>{rs=(rs*16807)%2147483647;return rs/2147483647},log:()=>{}});let nc=0,mid=0;
  const raw=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);return m.msg};
  const ask=async(conn,t,d)=>{const m=await raw(conn,t,d);if(!m.ok){const e=new Error(m.err);e.code=m.code;throw e}return m.d};
  const rejects=async(p,code)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+code);if(code)assert.strictEqual(e.code,code,e.message);return e};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});await cl.req('domus.create',{name:'Domus '+name});cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1});return cl}
  const ann=await client('ann'),bob=await client('bob','slave'),cat=await client('cat');
  /* a guest (no sign-in) */
  const gconn='g1';live.add(gconn);await h({requestContext:{routeKey:'$connect',connectionId:gconn},queryStringParameters:{guest:'guestrp100',ver:String(C.VER)}});

  /* ── a Ranked match ── */
  const R0=await ann.req('lobby.create',{ev:'democritus',ranked:true,cry:false});await bob.req('lobby.join',{id:R0.id});
  const L=await ann.req('lobby.start',{id:R0.id});const id=L.id;const M0=await db.get('MATCH#'+id,'META');const sa=M0.seats[ann.acct],sb=M0.seats[bob.acct];
  const host=[ann,bob].find(c=>c.acct===M0.host)||ann;
  await host.req('match.open',{id,snap:{game:'flavius-match',S:'{"ev":"democritus","locIdx":6}',rng:7,uid:1}});
  await ann.req('match.input',{id,in:{k:'tile',r:1,c:2,seat:sa}});await bob.req('match.input',{id,in:{k:'act',d:{act:'end'},seat:sb}});
  await rejects(ann.req('replay.put',{id,h:'hX',v:'1.00'}),'replay_wait');
  const table=[{seat:sa,won:true,place:1,f:12,survives:true},{seat:sb,won:false,place:2,f:6,survives:true}];
  for(const cl of [ann,bob])await cl.req('match.result',{id,table,hash:'h'});
  await rejects(cat.req('replay.put',{id,h:'hX'}),'replay_bad');
  await rejects(ann.req('replay.put',{id:'<b>'}),'replay_bad');
  /* the client's own inputs are ignored: the server's are kept */
  const p1=await ann.req('replay.put',{id,h:'hEND',v:'1.00',inputs:[{k:'forged'}],open:{forged:1}});assert.deepStrictEqual(p1,{done:1,id});
  assert.strictEqual((await bob.req('replay.put',{id,h:'hOTHER'})).dup,1,'once a match');
  const X=await db.get('REPLAY#'+id,'R');assert.ok(X&&X.GSI1PK==='REPLAYS'&&X.ttl>T/1000+29*86400&&X.by===ann.acct,'stored with a 30-day ttl: '+JSON.stringify({g:X&&X.GSI1PK,t:X&&X.ttl}));
  const g=await cat.req('replay.get',{id});assert.strictEqual(g.h,'hEND');assert.strictEqual(g.v,'1.00');assert.strictEqual(g.ev,'democritus');
  assert.deepStrictEqual(g.open,{game:'flavius-match',S:'{"ev":"democritus","locIdx":6}',rng:7,uid:1},'the server\'s own opening');
  assert.deepStrictEqual(g.inputs.map(x=>x.k),['tile','act'],'the server\'s own inputs, in order');
  assert.ok(!/dev-(ann|bob)/.test(JSON.stringify(g)),'no account ids in a replay');assert.ok(!('ttl' in g)&&!('PK' in g)&&!('by' in g),'no keys');
  /* guests read it */
  await raw(gconn,'auth.guest',{tz:'Europe/Rome'});const gm=await raw(gconn,'replay.get',{id});assert.ok(gm.ok&&gm.d.id===id,'a guest reads a replay: '+JSON.stringify(gm).slice(0,200));
  await rejects(cat.req('replay.get',{id:'nope'}),'replay_none');
  /* ── a Custom match is not kept ── */
  const C0=await ann.req('lobby.create',{ev:'egidious',ranked:false,cry:false});await bob.req('lobby.join',{id:C0.id});const LC=await ann.req('lobby.start',{id:C0.id});
  await ann.req('match.open',{id:LC.id,snap:{S:'{}'}});const MC=await db.get('MATCH#'+LC.id,'META');
  for(const cl of [ann,bob])await cl.req('match.result',{id:LC.id,table:[{seat:MC.seats[ann.acct],won:true,place:1,f:3,survives:true},{seat:MC.seats[bob.acct],won:false,place:2,f:1,survives:true}],hash:'c'});
  await rejects(ann.req('replay.put',{id:LC.id}),'replay_custom');
  /* ── the size cap ── */
  const R2=await ann.req('lobby.create',{ev:'cassian',ranked:true,cry:false});await bob.req('lobby.join',{id:R2.id});const L2=await ann.req('lobby.start',{id:R2.id});const M2=await db.get('MATCH#'+L2.id,'META');
  const h2=[ann,bob].find(c=>c.acct===M2.host)||ann;await h2.req('match.open',{id:L2.id,snap:{S:'x'.repeat(290000)}});
  for(let i=0;i<30;i++)await db.put('MATCH#'+L2.id,'IN#'+String(i).padStart(8,'0'),{in:{k:'act',seq:i,from:'server',pad:'y'.repeat(3500)}});
  await db.set('MATCH#'+L2.id,'META',{status:'done',doneAt:T});
  await rejects(ann.req('replay.put',{id:L2.id}),'replay_big');
  console.log('v1.0 replay routes: all checks passed')}
units();routes().catch(e=>{console.error(e);process.exit(1)});
