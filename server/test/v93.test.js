/* v0.93 BACKEND HARDENING, phase 1: idempotency (rid), the general rate limit, server texts as codes, internal errors only as a ref,
   authorization (another lanista's gladiator / room / seat), replays of every paying route (charged once), races between two requests
   of one account (no negative treasury, one winner), and failure recovery (a store write failing mid-request leaves no half state).
   node server/test/v93.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');
const H=require('../src/harden93.js');const TEXTS=require('../src/texts93.json');
{const e0=console.error;console.error=(...a)=>{if(/^\[soft93\]/.test(String(a[0])))return;e0(...a)}}

function units(){
  /* codes: every template has one, codes are unique, the server's own refusals match */
  const codes=Object.keys(TEXTS);assert.ok(codes.length>200,'server texts listed: '+codes.length);assert.strictEqual(new Set(Object.values(TEXTS)).size,codes.length,'one code per text');
  let t=H.textCode('The treasury needs 60 coin.');assert.ok(t&&TEXTS[t.mcode]==='The treasury needs {0} coin.');assert.deepStrictEqual(t.vals,['60']);
  t=H.textCode('Not yours.');assert.ok(t&&t.vals.length===0);assert.strictEqual(H.textCode('Something nobody ever wrote.'),null);
  /* internal failures never reach a player */
  for(const e of [new TypeError('x is not a function'),Object.assign(new Error('Rate exceeded'),{name:'ThrottlingException',$metadata:{}}),new Error("Cannot read properties of undefined (reading 'gear')"),
    Object.assign(new Error('socket hang up'),{code:'ECONNRESET'}),new Error('{"__type":"x"}')]){const r=H.errReply(e,()=>{});
    assert.strictEqual(r.code,'server_error',e.message);assert.match(r.err,/^The arena hit a snag — try again \(ref S-[0-9A-F]{5}\)\.$/);assert.ok(r.mcode&&r.vals[0]===r.ref,'the snag line has a code too')}
  const ok=H.errReply(Object.assign(new Error('The treasury needs 5 coin.'),{code:'no_coin',extra:{cost:5}}));
  assert.deepStrictEqual([ok.code,ok.cost,ok.err,ok.vals[0]],['no_coin',5,'The treasury needs 5 coin.','5']);assert.ok(ok.mcode);
  /* the bucket */
  const B={};let n=0;for(let i=0;i<60;i++)if(!C.bucket93(B,1000,40,10))n++;assert.strictEqual(n,40,'burst');assert.ok(C.bucket93(B,1000,40,10)>0,'then a wait');assert.strictEqual(C.bucket93(B,1100,40,10),0,'refilled at 10/s');
  assert.ok(C.ridOK93('r93abcdefg')&&!C.ridOK93('short')&&!C.ridOK93('bad id with spaces')&&!C.ridOK93(12345678));
  console.log('v0.93 units (text codes, internal errors as a ref, the bucket, rid shape): all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=C.SEASON_EPOCH+5*C.WEEK_MS+3600e3;const db=store.memory();const sent=[];const live=new Set();const logged=[];
  /* failure injection: the next matching write throws like DynamoDB would */
  let failOn=null;for(const fn of ['putRev','put']){const o=db[fn].bind(db);db[fn]=async function(pk,sk){if(failOn&&failOn(fn,pk,sk)){failOn=null;const e=new Error('The level of configured provisioned throughput for the table was exceeded.');e.name='ProvisionedThroughputExceededException';e.$metadata={httpStatusCode:400};throw e}return o.apply(null,arguments)}}
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:(...a)=>logged.push(a)});let nc=0,mid=0;
  const raw=async(conn,t,d,adv)=>{if(adv!==false)T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);return m.msg};
  const ask=async(conn,t,d,adv)=>{const m=await raw(conn,t,d,adv);if(!m.ok){const e=new Error(m.err);e.code=m.code;e.reply=m;throw e}return m.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d,adv)=>ask(cl.conn,t,d,adv);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const getD=cl=>db.get('DOMUS#'+cl.domus.id,'DOMUS');const tre=async cl=>((await getD(cl))||{}).treasury|0;const setD=async(cl,f)=>{const D=await getD(cl);Object.assign(D,f);await db.put('DOMUS#'+D.id,'DOMUS',D)};
  let ridN=0;const rid=()=>'r93test'+(++ridN).toString(36).padStart(4,'0');
  const ann=await client('ann'),bob=await client('bob','slave'),cat=await client('cat','amazonia');

  /* ── refusals carry the English text, the stable code and its values ── */
  await setD(ann,{treasury:10});const m0=await raw(ann.conn,'char.buy',{char:ann.ch.id,item:'gladius'});
  assert.ok(!m0.ok&&m0.code==='no_coin'&&m0.cost===60&&m0.err==='The treasury needs 60 coin.','old clients keep the English + code');
  assert.strictEqual(TEXTS[m0.mcode],'The treasury needs {0} coin.');assert.deepStrictEqual(m0.vals,['60']);
  const mu=await raw(ann.conn,'no.such.thing',{});assert.strictEqual(mu.code,'unknown_req');

  /* ── authorization: another lanista's gladiator, room, seat ── */
  await setD(bob,{treasury:5000});await setD(ann,{treasury:1000});
  await rejects(bob.req('char.buy',{char:ann.ch.id,item:'galea',rid:rid()}),null,/Not yours/);
  await rejects(bob.req('offer.buy',{char:ann.ch.id,key:'elix2'}),null,/Not yours/);
  await rejects(bob.req('market.kit',{char:ann.ch.id,kit:'cls'}),null,/Not yours/);
  await rejects(bob.req('char.edit',{char:ann.ch.id,name:'Stolen Name'}),null,/Not yours/);
  await rejects(bob.req('char.class',{char:ann.ch.id,cls:'slave'}),null,/Not yours/);
  await rejects(bob.req('gear.repair',{holder:ann.ch.id,item:'galea'}),null,/Not yours/);
  await rejects(bob.req('char.active',{char:ann.ch.id}),null,/Not yours/);
  assert.strictEqual(await tre(bob),5000,'nothing charged');assert.strictEqual(await tre(ann),1000);assert.deepStrictEqual((await getC(ann.ch.id)).gear,[]);
  let L=await ann.req('lobby.create',{ev:'democritus',loc:6,cry:false});await bob.req('lobby.join',{id:L.id});
  await rejects(bob.req('lobby.kick',{id:L.id,who:ann.acct}),null,null);await rejects(bob.req('lobby.set',{id:L.id,ticket:50}),null,null);await rejects(bob.req('lobby.host',{id:L.id,to:bob.acct}),null,null);
  L=await db.get('LOBBY#'+L.id,'LOBBY');assert.strictEqual(L.host.id,ann.acct,'still her room');assert.ok(!(L.ticket|0),'the ticket price untouched');
  await rejects(cat.req('lobby.send',{id:L.id,coin:3}),null,/Sit down first/);
  L=await ann.req('lobby.start',{id:L.id});const sa=C.seatOf(L,ann.acct),sb=C.seatOf(L,bob.acct);
  const n0=sent.length;await rejects(bob.req('match.input',{id:L.id,in:{k:'tile',seat:sa,r:1,c:1}}),null,/not yours/);
  const voids=sent.slice(n0).filter(x=>x.msg.push==='match.input'&&x.msg.d.in.k==='void');assert.ok(voids.length>=1&&voids.every(x=>x.msg.d.in.from==='server'),'a move for another seat → a server void');
  assert.ok(sent.slice(n0).every(x=>!(x.msg.push==='match.input'&&x.msg.d.in.k==='tile')),'the forged move never reached anyone');
  await rejects(cat.req('match.input',{id:L.id,in:{k:'tile',seat:0}}),null,/Not your match/);
  const ok1=await bob.req('match.input',{id:L.id,in:{k:'tile',seat:sb,r:1,c:1}});assert.ok(ok1.seq>=0,'his own seat is fine');
  await rejects(cat.req('match.open',{id:L.id,snap:{}}),null,/Only the host/);
  for(const x of [ann,bob])await x.req('match.abandon',{id:L.id});

  /* ── replays: the same rid is answered once, charged once ── */
  const once=async(cl,t,d,label,check)=>{const r=rid();const b0=await tre(cl);const a=await cl.req(t,{...d,rid:r});const b1=await tre(cl);
    const a2=await cl.req(t,{...d,rid:r});const b2=await tre(cl);assert.strictEqual(b2,b1,label+': charged once ('+b0+' → '+b1+' → '+b2+')');
    assert.deepStrictEqual(JSON.parse(JSON.stringify(a2)),JSON.parse(JSON.stringify(a)),label+': the replay gets the same reply');if(check)await check(a);return {a,cost:b0-b1}};
  await setD(ann,{treasury:20000});
  let x=await once(ann,'char.buy',{char:ann.ch.id,item:'galea'},'char.buy',async()=>{assert.strictEqual((await getC(ann.ch.id)).gear.filter(g=>C.itemBase(g)==='galea').length,1,'one galea')});assert.strictEqual(x.cost,C.priceOf(catalog.galea));
  x=await once(ann,'offer.buy',{char:ann.ch.id,key:'elix2'},'offer.buy',async()=>{assert.deepStrictEqual((await getC(ann.ch.id)).offers,['elix2'])});assert.strictEqual(x.cost,40);
  {const c=await getC(ann.ch.id);const it=c.gear.find(g=>C.itemBase(g)==='galea');C.damageItem91(c,it,0.5);await db.put('CHAR#'+c.id,'CHAR',c);const it2=c.gear.find(g=>C.itemBase(g)==='galea');
    x=await once(ann,'gear.repair',{holder:ann.ch.id,item:it2},'gear.repair');assert.ok(x.cost>0)}
  x=await once(ann,'market.kit',{char:ann.ch.id,kit:'scrap'},'market.kit');assert.ok(x.cost>0);
  {const U='U#'+String(T).padStart(13,'0')+'#a';await db.put('MARKET',U,{item:'gladius',pc:null,price:33,from:{glad:'Old Owner'},sold:0,ttl:0});
    x=await once(ann,'market.buy',{char:ann.ch.id,id:U},'market.buy');assert.strictEqual(x.cost,33)}
  x=await once(ann,'domus.upgrade',{k:'shelf'},'domus.upgrade');assert.strictEqual(x.cost,C.UPG89.shelf.cost);
  x=await once(ann,'char.class',{char:ann.ch.id,cls:'soldier'},'char.class');assert.strictEqual(x.cost,C.CLASS_FEE89);
  await setD(ann,{gifts:[{id:'gft93',why:'test',at:T}]});x=await once(ann,'gift.open',{gift:'gft93'},'gift.open',async()=>{assert.strictEqual(((await getD(ann)).gifts||[]).length,0,'opened once')});
  let L2=await bob.req('lobby.create',{ev:'egidious',loc:3,cry:false});await bob.req('lobby.set',{id:L2.id,ticket:7});await setD(cat,{treasury:500});
  x=await once(cat,'lobby.ticket',{id:L2.id},'lobby.ticket',async()=>{const Z=await db.get('LOBBY#'+L2.id,'LOBBY');assert.strictEqual((Z.stands||[]).length,1,'one seat');assert.strictEqual(Z.pot|0,7,'one ticket in the pot')});
  await setD(cat,{treasury:500});
  /* v1.0: online wagers are closed — a bet with a request id is refused, every time, and nothing is staked */
  {const T0=(await getD(cat)).treasury|0;for(let i=0;i<2;i++){let e=null;try{await cat.req('bet.place',{id:L2.id,seat:0,amt:9,rid:'betrid93x'})}catch(x){e=x}assert.ok(e&&e.code==='wager_off','bet.place refused')}
    assert.strictEqual((await getD(cat)).treasury|0,T0);assert.strictEqual(((await db.get('LOBBY#'+L2.id,'LOBBY')).bets||[]).length,0)}
  x=await once(bob,'lobby.send',{id:L2.id,coin:4},'lobby.send');
  /* the auction: the escrow is taken once */
  await setC(ann.ch.id,{glory:900,rankK:'veteranus',rank:'veteranus'});let al=await ann.req('auction.list',{});const lot=al.lots[0];
  x=await once(ann,'auction.bid',{lot:lot.id,amt:lot.min},'auction.bid');assert.strictEqual(x.cost,lot.min);
  /* a rid still running → rid_busy; a rid used for another request → rid_reuse; a refused request forgets its rid */
  const rb=rid();await db.put('RID#'+ann.acct,rb,{st:'busy',t:'char.buy',at:T});await rejects(ann.req('char.buy',{char:ann.ch.id,item:'gladius',rid:rb}),'rid_busy');
  T+=C.RID_BUSY_MS93+1000;const tb0=await tre(ann);await ann.req('char.buy',{char:ann.ch.id,item:'gladius',rid:rb});assert.strictEqual(tb0-await tre(ann),C.priceOf(catalog.gladius),'a stale busy rid runs');
  await rejects(ann.req('offer.buy',{char:ann.ch.id,key:'elix2',rid:rb}),'rid_reuse');
  const rf=rid();await setD(bob,{treasury:1});await rejects(bob.req('char.buy',{char:bob.ch.id,item:'gladius',rid:rf}),'no_coin');await setD(bob,{treasury:5000});
  await bob.req('char.buy',{char:bob.ch.id,item:'gladius',rid:rf});assert.strictEqual(await tre(bob),5000-C.priceOf(catalog.gladius),'a refused rid may be asked again');
  /* an old rid (past 10 minutes) runs again; requests without a rid are never cached */
  const ro=rid();const t1=await tre(bob);await bob.req('offer.buy',{char:bob.ch.id,key:'ap2',rid:ro});T+=C.IDEM_MS93+1000;await bob.req('offer.buy',{char:bob.ch.id,key:'ap2',rid:ro});assert.strictEqual(t1-await tre(bob),80,'expired: a new request');
  const t2=await tre(ann);await ann.req('offer.buy',{char:ann.ch.id,key:'cf1'});await ann.req('offer.buy',{char:ann.ch.id,key:'cf1'}).catch(()=>{});assert.ok(t2-await tre(ann)>=40);

  /* ── races: two requests of one account at once (different rids) ── */
  {await setD(cat,{treasury:C.priceOf(catalog.gladius)+10});const p=C.priceOf(catalog.gladius);
    const rs=await Promise.allSettled([cat.req('char.buy',{char:cat.ch.id,item:'gladius',rid:rid()},false),cat.req('char.buy',{char:cat.ch.id,item:'mace',rid:rid()},false)]);
    const won=rs.filter(r=>r.status==='fulfilled').length;assert.strictEqual(won,1,'one buy wins: '+rs.map(r=>r.status+(r.reason?':'+r.reason.code:'')).join());
    const tr=await tre(cat);assert.ok(tr>=0,'never negative');const g=(await getC(cat.ch.id)).gear;assert.strictEqual(g.length,1,'one piece');assert.strictEqual(tr,p+10-C.priceOf(catalog[C.itemBase(g[0])]))}
  {await setD(cat,{treasury:100});const rs=await Promise.allSettled([1,2,3,4].map(()=>cat.req('offer.buy',{char:cat.ch.id,key:'elix2',rid:rid()},false)));
    assert.strictEqual(rs.filter(r=>r.status==='fulfilled').length,2,'two of four fit the treasury');assert.strictEqual(await tre(cat),20);assert.strictEqual((await getC(cat.ch.id)).offers.length,2)}
  {/* the same rid twice at once: one runs, the other waits (rid_busy) or replays */const r=rid();await setC(cat.ch.id,{offers:[]});await setD(cat,{treasury:500});const t0=await tre(cat);
    const rs=await Promise.allSettled([cat.req('offer.buy',{char:cat.ch.id,key:'ap2',rid:r},false),cat.req('offer.buy',{char:cat.ch.id,key:'ap2',rid:r},false)]);
    assert.strictEqual(t0-await tre(cat),40,'charged once');assert.ok(rs.every(x=>x.status==='fulfilled'||x.reason.code==='rid_busy'),rs.map(x=>x.reason&&x.reason.code).join())}
  {/* two houses bid on one lot at once: one leads, the other gets its coin back */const b2=await client('dax');await setD(b2,{treasury:50000});await setC(b2.ch.id,{glory:900,rankK:'veteranus',rank:'veteranus'});await setD(bob,{treasury:50000});await setC(bob.ch.id,{glory:900,rankK:'veteranus',rank:'veteranus'});
    al=await bob.req('auction.list',{});const L3=al.lots.find(l=>l.id!==lot.id);const amt=L3.min;
    await Promise.allSettled([bob.req('auction.bid',{lot:L3.id,amt,rid:rid()},false),b2.req('auction.bid',{lot:L3.id,amt,rid:rid()},false)]);
    const paid=(50000-await tre(bob))+(50000-await tre(b2));const Z=await db.get(L3.id.replace(/#\d+$/,'').replace(/^/,'AUCTION#'),'L#'+String(+L3.id.split('#')[1]).padStart(6,'0'));
    assert.ok(Z&&Z.bid,'the lot has a leader');assert.strictEqual(paid,amt,'only the leader\'s coin is held')}

  /* ── failure recovery: a write that fails mid-request leaves no half state ── */
  {await setD(cat,{treasury:1000});const g0=(await getC(cat.ch.id)).gear.slice();failOn=(fn,pk)=>fn==='putRev'&&pk.startsWith('CHAR#');
    await rejects(cat.req('char.buy',{char:cat.ch.id,item:'galea',rid:rid()}),null,/try again/);assert.strictEqual(await tre(cat),1000,'the coin came back');assert.deepStrictEqual((await getC(cat.ch.id)).gear,g0,'no piece')}
  {failOn=(fn,pk)=>fn==='putRev'&&pk.startsWith('CHAR#');await rejects(cat.req('offer.buy',{char:cat.ch.id,key:'elix2'}),null,null);assert.strictEqual(await tre(cat),1000)}
  {failOn=(fn,pk)=>fn==='putRev'&&pk.startsWith('CHAR#');await rejects(cat.req('market.kit',{char:cat.ch.id,kit:'scrap'}),null,null);assert.strictEqual(await tre(cat),1000,'kit: the coin came back')}
  {const eve=await client('eve');let L4=await eve.req('lobby.create',{ev:'cassian',loc:2,cry:false});await eve.req('lobby.set',{id:L4.id,ticket:6});failOn=(fn,pk)=>fn==='putRev'&&pk.startsWith('LOBBY#');
    const e=await rejects(cat.req('lobby.ticket',{id:L4.id}),null,null);assert.ok(!/throughput|Exception/i.test(e.message),'no raw store error on screen: '+e.message);assert.strictEqual(await tre(cat),1000,'ticket: refunded');
    assert.strictEqual(((await db.get('LOBBY#'+L4.id,'LOBBY')).stands||[]).length,0)}
  {/* an unexpected failure: the player sees a ref, the log holds the error */failOn=(fn,pk)=>fn==='putRev'&&pk.startsWith('DOMUS#');const m=await raw(cat.conn,'domus.upgrade',{k:'shelf'});
    assert.ok(!m.ok&&m.code==='server_error'&&/ref S-/.test(m.err),JSON.stringify(m));assert.ok(!/throughput|Exception|stack/i.test(m.err));assert.ok(logged.some(a=>String(a[0]).includes(m.ref)),'logged under the ref');
    assert.strictEqual(await tre(cat),1000,'nothing spent')}
  {/* the reply is lost but the work is done: the client's retry with the same rid is answered from the store */const r=rid();failOn=null;const t0=await tre(cat);
    await cat.req('char.buy',{char:cat.ch.id,item:'galea',rid:r});live.delete(cat.conn);/* the next reply cannot be delivered */const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:cat.conn},body:JSON.stringify({t:'char.buy',id,d:{char:cat.ch.id,item:'galea',rid:r}})});
    live.add(cat.conn);await cat.req('char.buy',{char:cat.ch.id,item:'galea',rid:r});assert.strictEqual(t0-await tre(cat),C.priceOf(catalog.galea),'three tries, one charge')}

  /* ── the general rate limit (its own handler: the clock is ours) ── */
  {const db2=store.memory();const s2=[];let T2=1e12;const h2=makeHandler({limits:{burst:5,per:2,mburst:8,mper:4},db:db2,send:async(c,m)=>{s2.push({c,m});return false},dev:true,verifyCfg:{},now:()=>T2,hereMs:0,countdown:0});
    await h2({requestContext:{routeKey:'$connect',connectionId:'q1'},queryStringParameters:{dev:'quick',ver:String(C.VER)}});let id=0;
    const q=async(t,d,conn)=>{const i=++id;await h2({requestContext:{routeKey:'$default',connectionId:conn||'q1'},body:JSON.stringify({t,id:i,d:d||{}})});return s2.find(x=>x.m.re===i).m};
    await q('auth.signin',{name:'Quick'});const rs=[];for(let i=0;i<8;i++)rs.push(await q('lobby.list'));
    const lim=rs.filter(m=>!m.ok&&m.code==='rate_limit');assert.strictEqual(lim.length,4,JSON.stringify(rs.map(m=>m.ok?1:m.code))+'burst 5 (one went to the sign-in), then refused');assert.ok(lim[0].wait>0&&lim[0].wait<=500,'says how long to wait: '+lim[0].wait);assert.ok(lim[0].mcode,'a coded text');
    T2+=1000;assert.ok((await q('lobby.list')).ok,'two a second come back');
    /* match requests have their own bucket */
    let mm=0;for(let i=0;i<10;i++){const m=await q('match.get',{id:'nope'});if(m.code==='rate_limit')mm++}assert.strictEqual(mm,2,'match bucket: 8 then refused');
    /* another account is not slowed */
    await h2({requestContext:{routeKey:'$connect',connectionId:'q2'},queryStringParameters:{dev:'other',ver:String(C.VER)}});assert.ok((await q('auth.signin',{name:'Other'},'q2')).ok)}
  {/* normal play never trips the real limits: a lanista's busiest minute (landing, room, lockstep) */const db3=store.memory();let T3=2e12;const s3=[];const h3=makeHandler({db:db3,send:async(c,m)=>{s3.push(m);return false},dev:true,verifyCfg:{},now:()=>T3,hereMs:0,countdown:0});
    await h3({requestContext:{routeKey:'$connect',connectionId:'n1'},queryStringParameters:{dev:'norm',ver:String(C.VER)}});let id=0;const q=async(t,d)=>{const i=++id;await h3({requestContext:{routeKey:'$default',connectionId:'n1'},body:JSON.stringify({t,id:i,d:d||{}})});return s3.find(x=>x.re===i)};
    let tripped=0;for(const t of ['auth.signin','hello','lobby.list','domus.get','auction.list','wager.list','market.list','who.list','forum.get','world.news','hall.list','lobby.list','hello','domus.get'])if((await q(t,{name:'Norm'})).code==='rate_limit')tripped++;
    for(let s=0;s<60;s++){T3+=1000;for(let k=0;k<6;k++)if((await q(k<4?'match.input':'match.hasha',{id:'x'})).code==='rate_limit')tripped++;if(s%5===0&&(await q('lobby.get',{id:'x'})).code==='rate_limit')tripped++}
    assert.strictEqual(tripped,0,'normal play: never limited')}
  console.log('server v0.93 (codes + values on refusals, internal errors as a ref, authorization: gladiator/room/seat/match, replays of char.buy/offer.buy/market.kit/market.buy/gear.repair/domus.upgrade/char.class/gift.open/lobby.ticket/bet.place/lobby.send/auction.bid charged once, rid busy/reuse/expiry/refusal, races: one buy wins + no negative treasury + one lot leader, failure recovery: refunds + no raw store errors + a lost reply retried, the rate limit + normal play): all checks passed')}

(async()=>{units();await routes()})().catch(e=>{console.error(e);process.exit(1)});
