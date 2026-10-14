/* v1.0 TURN TIMERS (routes.js "v1.0 TURN TIMERS", the v1.0 section of onlcore): the room's timer (Ranked 60/20 locked, Custom Off/30/60/90/120),
   clocks reported by pages but stamped and judged by the SERVER's clock, server-ordered 'timeout' / 'dto' inputs (once each: locks), late answers and
   late turn moves voided, a turn that ended in time never times out, another seat's window pauses the turn clock, clients cannot forge a timeout,
   two timeouts → a majority of the other humans hands the seat to a CPU (a 'drop' input with a reclaim window), Off rooms have no clocks,
   protocol 8. node server/test/v100tt.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');

function units(){
  assert.ok(C.VER>=8,'protocol 8 or later (v1.01: 9)');
  assert.deepStrictEqual(C.ttOf100({ranked:true}),{t:60,d:20},'Ranked 60 / 20');assert.deepStrictEqual(C.ttOf100({ranked:false}),{t:0,d:0},'Custom Off');
  assert.deepStrictEqual(C.ttOf100({ranked:false,turnT:90}),{t:90,d:20});assert.deepStrictEqual(C.ttOf100({turnT:45}),{t:0,d:0},'no odd values');assert.deepStrictEqual(C.ttOf100(null),{t:0,d:0});
  assert.deepStrictEqual([1,2,3,4].map(C.dropNeed100),[1,2,2,3],'a majority of the others');
  const L=C.newLobby({ev:'democritus'},{id:'a',name:'A'},'L1',1);assert.strictEqual(L.turnT,0,'a new Custom room: Off');
  assert.strictEqual(C.newLobby({ev:'democritus',turnT:60},{id:'a',name:'A'},'L1b',1).turnT,60,'created with a timer');
  assert.strictEqual(C.roomSet(L,'a',{turnT:120},2),'');assert.strictEqual(L.turnT,120);assert.match(C.roomSet(L,'a',{turnT:45},3),/Off, 30, 60, 90 or 120/);assert.match(C.roomSet(L,'b',{turnT:30},3),/Only the host/);
  assert.strictEqual(C.roomSet(L,'a',{turnT:0,loc:3},4),'');assert.ok(L.turnT===0&&L.loc===3,'with another setting');
  const RL=C.newLobby({ev:'democritus',ranked:true},{id:'a',name:'A',rank:'tiro'},'L2',1);assert.strictEqual(RL.turnT,60);assert.match(C.roomSet(RL,'a',{turnT:30},2),/always 60/);
  console.log('v1.0 turn timer units: all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=Date.UTC(2026,9,12,12);const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{}});let nc=0,mid=0;
  const raw=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);return m.msg};
  const ask=async(conn,t,d)=>{const m=await raw(conn,t,d);if(!m.ok){const e=new Error(m.err);e.code=m.code;throw e}return m.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    cl.got=(type,from)=>sent.slice(from||0).filter(x=>x.conn===cl.conn&&x.msg.push===type).map(x=>x.msg.d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});await cl.req('domus.create',{name:'Domus '+name});cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1});return cl}
  {const r=await h({requestContext:{routeKey:'$connect',connectionId:'old'},queryStringParameters:{dev:'x',ver:'7'}});assert.strictEqual(r.statusCode,426,'protocol 7 pages reload')}
  const ann=await client('ann'),bob=await client('bob','slave'),cat=await client('cat');
  /* the room */
  const RL=await ann.req('lobby.create',{ev:'democritus',ranked:true,cry:false});assert.strictEqual(RL.turnT,60,'a Ranked room: 60 s');
  await rejects(ann.req('lobby.set',{id:RL.id,turnT:30}),null,/always 60/);await ann.req('lobby.leave',{id:RL.id});
  const L0=await ann.req('lobby.create',{ev:'democritus',loc:4,cry:false});assert.strictEqual(L0.turnT,0,'Custom: Off');
  await rejects(ann.req('lobby.set',{id:L0.id,turnT:45}),null,/Off, 30/);await bob.req('lobby.join',{id:L0.id});await rejects(bob.req('lobby.set',{id:L0.id,turnT:30}),null,/Only the host/);
  const L1=await ann.req('lobby.set',{id:L0.id,turnT:30,loc:6});assert.ok(L1.turnT===30&&L1.loc===6,'the host sets it (with another setting)');
  assert.strictEqual((await bob.req('lobby.get',{id:L0.id})).lobby.turnT,30,'the room carries it');
  await cat.req('lobby.join',{id:L0.id});const L=await ann.req('lobby.start',{id:L0.id});const id=L.id;
  const seat=cl=>C.seatOf(L,cl.acct);const sa=seat(ann),sb=seat(bob),sc=seat(cat);assert.ok(sa>=0&&sb>=0&&sc>=0);
  const ins=async()=>(await ann.req('match.get',{id,from:0})).inputs;const srv=async k=>(await ins()).filter(x=>x.from==='server'&&(!k||x.k===k));
  const tick=cl=>cl.req('match.tick',{id});

  /* ── a turn clock: stamped by the server, judged by the server ── */
  let s=await ann.req('match.clock',{id,kind:'turn',t:3,seat:sb});assert.ok(s.on&&s.t===30&&s.d===20&&s.tc&&s.tc.seat===sb&&s.tc.left===30000,'the clock starts at the server\'s time: '+JSON.stringify(s));
  const p0=sent.length;await cat.req('match.clock',{id,kind:'turn',t:3,seat:sb});assert.strictEqual((await db.get('MATCH#'+id,'META')).tc100.at,T-10,'the first report wins (a later one never restarts it)');
  assert.ok(bob.got('match.clock100').length>=1,'the clock is pushed to the match');
  await cat.req('match.clock',{id,kind:'turn',t:2,seat:sa});assert.strictEqual((await db.get('MATCH#'+id,'META')).tc100.t,3,'an older turn never replaces it');
  T+=29000;await tick(cat);assert.strictEqual((await srv('timeout')).length,0,'not yet');
  T+=1000;await tick(cat);assert.strictEqual((await srv('timeout')).length,0,'the grace');
  T+=C.TT100.GRACE;const p1=sent.length;await tick(cat);let to=await srv('timeout');assert.strictEqual(to.length,1,'time ran out → one server input');
  assert.ok(to[0].seat===sb&&to[0].t===3&&to[0].n===1&&to[0].from==='server','{k:timeout, seat, t, n}: '+JSON.stringify(to[0]));
  assert.ok([ann,bob,cat].every(cl=>cl.got('match.input',p1).some(x=>x.in.k==='timeout')),'pushed to every lanista');
  await tick(ann);await tick(bob);assert.strictEqual((await srv('timeout')).length,1,'once (TO# lock)');
  /* a late move of that turn is voided; a move of another turn is not */
  const late=await bob.req('match.input',{id,in:{k:'act',a:'end',seat:sb,tn:3}});assert.ok(late.late&&Number.isInteger(late.seq),'late: '+JSON.stringify(late));
  assert.strictEqual((await ins()).find(x=>x.seq===late.seq).k,'void','a void in its place');
  const okm=await bob.req('match.input',{id,in:{k:'act',a:'end',seat:sb,tn:7}});assert.ok(!okm.late&&(await ins()).find(x=>x.seq===okm.seq).k==='act');
  /* nobody forges a timeout or a dto */
  await rejects(bob.req('match.input',{id,in:{k:'timeout',seat:sa,t:9}}),null,/not yours/);await rejects(bob.req('match.input',{id,in:{k:'dto',seat:sa,d:9}}),null,/not yours/);
  assert.ok((await ins()).slice(-2).every(x=>x.k==='void'),'their seqs are voids');

  /* ── a turn that ended in time never times out ── */
  await ann.req('match.clock',{id,kind:'turn',t:4,seat:sa});await cat.req('match.clock',{id,kind:'end',t:4});T+=60000;await tick(bob);
  assert.strictEqual((await srv('timeout')).length,1,'ended in time: no timeout');

  /* ── decision clocks: the answer and the dto race for one lock ── */
  await ann.req('match.clock',{id,kind:'dec',d:5,seat:sb,t:4});const a5=await bob.req('match.input',{id,in:{k:'modal',v:'L',t:'Pick',d:5,seat:sb}});assert.ok(!a5.late,'answered in time');
  T+=30000;await tick(ann);assert.strictEqual((await srv('dto')).length,0,'an answered window never times out');
  s=await ann.req('match.clock',{id,kind:'dec',d:6,seat:sb,t:4});assert.ok(s.dc&&s.dc.d===6&&s.dc.left===20000,'the decision clock: '+JSON.stringify(s.dc));
  T+=20000+C.TT100.GRACE;await tick(cat);let dto=await srv('dto');assert.ok(dto.length===1&&dto[0].d===6&&dto[0].seat===sb,'the dto: '+JSON.stringify(dto));
  const l6=await bob.req('match.input',{id,in:{k:'modal',v:'L',t:'Pick',d:6,seat:sb}});assert.ok(l6.late,'the answer after the dto is late');assert.strictEqual((await ins()).find(x=>x.seq===l6.seq).k,'void');
  await tick(cat);assert.strictEqual((await srv('dto')).length,1,'once');

  /* ── another seat's window pauses the turn clock ── */
  await ann.req('match.clock',{id,kind:'turn',t:8,seat:sa});T+=10000;s=await cat.req('match.clock',{id,kind:'dec',d:7,seat:sb,t:8});assert.ok(s.tc.pz&&s.tc.left==null,'paused: '+JSON.stringify(s.tc));
  T+=15000;await bob.req('match.input',{id,in:{k:'modal',v:'R',t:'Defend',d:7,seat:sb}});s=await tick(ann);assert.ok(!s.tc.pz&&Math.abs(s.tc.left-20000)<200,'runs on with the paused time added: '+JSON.stringify(s.tc));
  T+=19000;await tick(ann);assert.strictEqual((await srv('timeout')).length,1,'not before its (paused) deadline');T+=1000+C.TT100.GRACE;await tick(ann);to=await srv('timeout');
  assert.ok(to.length===2&&to[1].seat===sa&&to[1].n===1,'then the timeout (Ann\'s first)');

  /* ── two timeouts → the others hand the seat to a CPU ── */
  await rejects(ann.req('match.vote100',{id,seat:sb,yes:true}),'tt_early');
  await cat.req('match.clock',{id,kind:'turn',t:11,seat:sb});T+=30000+C.TT100.GRACE;await tick(cat);to=await srv('timeout');assert.ok(to.length===3&&to[2].seat===sb&&to[2].n===2,'Bob\'s second');
  await rejects(bob.req('match.vote100',{id,seat:sb,yes:true}),null,/No one/);
  let v=await ann.req('match.vote100',{id,seat:sb,yes:true});assert.deepStrictEqual([v.votes,v.need,v.dropped],[1,2,false],'one of two');
  v=await cat.req('match.vote100',{id,seat:sb,yes:false});assert.ok(!v.dropped&&v.votes===1,'a Wait is not a yes');
  v=await cat.req('match.vote100',{id,seat:sb,yes:true});assert.ok(v.dropped&&v.votes===2,'the majority');
  const dr=(await srv('drop'));assert.ok(dr.length===1&&dr[0].seat===sb&&dr[0].tt===1&&dr[0].until>T,'a drop with a reclaim window: '+JSON.stringify(dr));
  const M=await db.get('MATCH#'+id,'META');assert.ok(M.dropped[bob.acct],'Bob is dropped');await rejects(bob.req('match.input',{id,in:{k:'act',a:'x',seat:sb}}),null,/CPU holds your seat/);
  v=await ann.req('match.vote100',{id,seat:sb,yes:true});assert.ok(v.dropped&&(await srv('drop')).length===1,'never twice');
  const rc=await bob.req('match.reclaim',{id});assert.strictEqual(rc.seat,sb,'and he may take it back');
  /* a dropped lanista reports no clocks; an outsider neither */
  const dan=await client('dan');await rejects(dan.req('match.clock',{id,kind:'turn',t:99,seat:sa}),null,/Not your match/);await rejects(dan.req('match.tick',{id}),null,/Not your match/);

  /* ── an Off room has no clocks ── */
  for(const cl of [ann,bob,cat])try{await cl.req('match.abandon',{id})}catch(e){}
  const O0=await ann.req('lobby.create',{ev:'cassian',loc:3,cry:false});await dan.req('lobby.join',{id:O0.id});const O=await ann.req('lobby.start',{id:O0.id});
  s=await ann.req('match.clock',{id:O.id,kind:'turn',t:2,seat:C.seatOf(O,dan.acct)});assert.ok(s.off&&!s.on,'Off: '+JSON.stringify(s));T+=3600e3;await dan.req('match.tick',{id:O.id});
  assert.strictEqual((await ann.req('match.get',{id:O.id,from:0})).inputs.filter(x=>x.from==='server').length,0,'no server input in an hour');
  const mo=await dan.req('match.input',{id:O.id,in:{k:'modal',v:1,t:'x',d:3,seat:C.seatOf(O,dan.acct)}});assert.ok(!mo.late,'answers carry no lock without a timer');
  console.log('v1.0 turn timer routes: all checks passed')}
(async()=>{units();await routes()})().catch(e=>{console.error(e);process.exit(1)});
