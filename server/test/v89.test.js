/* v0.89 ROOMS WHEN LANISTAS GO (server half): a dropped socket marks the lanista in their waiting room (L.off, "reconnecting…"),
   coming back clears it, after the grace the room takes them out with roomLeave — any member; the host's room passes on; an empty room
   closes with its tickets and wagers back; lists hide a room whose host is away; lobby.get (the room screens' 30 s ask) prunes.
   node server/test/v89.test.js */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');

function rules(){
  const L=C.newLobby({ev:'democritus',loc:6,seats:4},{id:'a',name:'A'},'L1',1000);C.roomJoin(L,[{id:'a',name:'A'}],1000);C.roomJoin(L,[{id:'b',name:'B'}],2000);C.roomJoin(L,[{id:'c',name:'C'}],3000);
  assert.ok(C.roomOffMark(L,'b',5000),'a member is marked');assert.ok(!C.roomOffMark(L,'b',6000),'once');assert.strictEqual(L.off.b,5000);assert.ok(!C.roomOffMark(L,'zz',5000),'only members');
  assert.deepStrictEqual(C.roomGoneIds(L,5000+C.ROOM_GRACE,null),[],'not before the grace');assert.deepStrictEqual(C.roomGoneIds(L,5001+C.ROOM_GRACE,null),['b'],'after it');
  assert.deepStrictEqual(C.roomGoneIds(L,100000,null,{c:1000}),['b','c'],'a lanista found without a socket counts from their own drop time');
  assert.ok(!C.roomHostAway(L));C.roomOffMark(L,'a',7000);assert.ok(C.roomHostAway(L),'the host is away');
  assert.ok(C.roomOffClear(L,'a'));assert.ok(!C.roomHostAway(L));C.roomLeave(L,'b',9000);assert.ok(!L.off,'leaving clears the mark');
  assert.strictEqual(C.ROOM_GRACE,60000,'his pick: 60 s');}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=Date.parse('2026-10-05T12:00:00Z');const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});
  let nc=0,rid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const connect=async name=>{const conn='v'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);return conn};
  const drop=async cl=>{live.delete(cl.conn);await h({requestContext:{routeKey:'$disconnect',connectionId:cl.conn}})};
  const back=async cl=>{cl.conn=await connect(cl.name)};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn=await connect(name);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});return cl}
  const pushesTo=(cl,since)=>sent.slice(since).filter(x=>x.conn===cl.conn&&x.msg.push==='lobby.update').map(x=>x.msg.d);
  const ann=await client('ann'),bob=await client('bob','soldier'),cal=await client('cal','slave'),dan=await client('dan','amazonia');
  const R=await ann.req('lobby.create',{ev:'democritus',loc:6,cry:false});await bob.req('lobby.join',{id:R.id});T+=1000;await cal.req('lobby.join',{id:R.id});
  const room=async()=>{const L=await db.get('LOBBY#'+R.id,'LOBBY');return L};
  /* (2) a member's socket drops: the room marks them "reconnecting…" and the others hear it */
  let s0=sent.length;await drop(bob);let L=await room();assert.ok(L.off&&L.off[bob.acct],'Bob is marked away');
  assert.ok(pushesTo(ann,s0).some(d=>d.lobby&&d.lobby.off&&d.lobby.off[bob.acct]),'Ann is told (the seat dims)');
  T+=30e3;await dan.req('lobby.list',{});assert.ok(C.memberOf(await room(),bob.acct),'inside the grace he stays');
  /* back within the grace: the mark clears */
  s0=sent.length;await back(bob);bob.req=(t,d)=>ask(bob.conn,t,d);L=await room();assert.ok(!(L.off||{})[bob.acct],'back: no mark');assert.ok(pushesTo(ann,s0).some(d=>d.lobby&&!(d.lobby.off||{})[bob.acct]),'Ann sees him back');
  /* gone past the grace: the room's 30 s ask (lobby.get) takes him out — any member, not only the host */
  await drop(bob);T+=C.ROOM_GRACE+1000;s0=sent.length;const g=await cal.req('lobby.get',{id:R.id});
  assert.ok(g.lobby&&!C.memberOf(g.lobby,bob.acct),'Bob is out after the grace');assert.strictEqual(g.lobby.status,'waiting');assert.strictEqual(g.lobby.host.id,ann.acct,'the host keeps the room');
  assert.ok(pushesTo(ann,s0).some(d=>d.lobby&&!C.memberOf(d.lobby,bob.acct)),'the room hears it');
  /* the host drops: lists outside the room hide it during the grace; then the room passes to the longest-waiting lanista (Cal) */
  await drop(ann);T+=5000;let rows=await dan.req('lobby.list',{});assert.ok(!rows.some(x=>x.id===R.id),'a room whose host is away is not listed');
  rows=await cal.req('lobby.list',{});assert.ok(rows.some(x=>x.id===R.id),'its own members still see it');
  T+=C.ROOM_GRACE;const hh=await dan.req('hello',{all:1});L=await room();assert.strictEqual(L.host.id,cal.acct,'hello pruned: Cal hosts now');assert.ok(L.players.some(p=>p.id===cal.acct),'and sits');
  assert.ok(!C.memberOf(L,ann.acct),'Ann is out');assert.ok((hh.lobbies||[]).some(x=>x.id===R.id),'listed again: its host is here');
  /* nobody left: closed, tickets and wagers back */
  const trO=async a=>{const P=await db.get('ACCT#'+a,'PROFILE');return ((await db.get('DOMUS#'+P.domus,'DOMUS'))||{}).treasury|0}; /* v0.92 one treasury */
  const eve=await client('eve','venatore');const ec=await db.get('CHAR#'+eve.ch.id,'CHAR');ec.wallet=30;await db.put('CHAR#'+eve.ch.id,'CHAR',ec);
  const dc=await db.get('CHAR#'+dan.ch.id,'CHAR');dc.wallet=40;await db.put('CHAR#'+dan.ch.id,'CHAR',dc);
  const R2=await dan.req('lobby.create',{ev:'egidious',loc:3,cry:false,ticket:5});await dan.req('lobby.set',{id:R2.id,ticket:5});await eve.req('lobby.ticket',{id:R2.id});
  assert.strictEqual(await trO(eve.acct),25,'Eve paid her ticket (v0.92: from the treasury)');await dan.req('bet.place',{id:R2.id,seat:0,amt:10});assert.strictEqual(await trO(dan.acct),30,'Dan backed himself');
  await drop(dan);T+=C.ROOM_GRACE+1000;await eve.req('lobby.get',{id:R2.id});
  const L2=await db.get('LOBBY#'+R2.id,'LOBBY');assert.strictEqual(L2.status,'done','the empty room closed');
  assert.strictEqual(await trO(eve.acct),30,'the ticket came back');assert.strictEqual(await trO(dan.acct),40,'the wager came back');
  assert.ok((await eve.req('lobby.get',{id:R2.id})).gone,'lobby.get says it is gone');
  /* old rooms still close after 3 hours */
  const R3=await eve.req('lobby.create',{ev:'cassian',loc:2,cry:false});T+=3*3600e3+1000;await eve.req('lobby.list',{});assert.strictEqual((await db.get('LOBBY#'+R3.id,'LOBBY')).status,'done','3 hours: closed');
  console.log('server v0.89 rooms (reconnecting marks, back within the grace, any member out after 60 s, host passes on, hidden while the host is away, empty → closed with refunds, lobby.get prunes, 3 h close): all checks passed')}

(async()=>{rules();console.log('server v0.89 rules (roomOffMark / roomGoneIds / roomHostAway): all checks passed');await routes()})().catch(e=>{console.error(e);process.exit(1)});
