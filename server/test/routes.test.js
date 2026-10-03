/* Local test of the server's requests on the in-memory store: node server/test/routes.test.js */
'use strict';
const assert=require('assert');const path=require('path');const crypto=require('crypto');
const {makeRoutes}=require('../src/routes.js');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');const {verify}=require('../src/jwt.js');
(async()=>{
  const db=store.memory();const pushed=[];let t=1700000000000;
  const route=makeRoutes({store:db,push:async(a,ty,d)=>pushed.push([a,ty,d]),catalog,now:()=>(t+=1000),dev:true});
  const A={acct:'dev-a'},B={acct:'dev-b'};
  await route('auth.signin',{name:'Alpha'},A);await route('auth.signin',{name:'Beta'},B);
  const ca=await route('char.create',{name:'Alpha the Bold',cls:'hero',stats:{spd:99,str:99,int:99,lck:99,cha:99}},A);
  assert.deepStrictEqual(ca.stats,C.START_STATS,'everyone starts at the same low ratings');assert.strictEqual(ca.wallet,0);
  /* v0.79: up to 3 living gladiators, one active; edits only between events */
  const Z={acct:'dev-z'};await route('auth.signin',{name:'Zeta'},Z);const z1=await route('char.create',{name:'Zeta One',cls:'hero'},Z);const z2=await route('char.create',{name:'Zeta Two',cls:'slave'},Z);await route('char.create',{name:'Zeta Three',cls:'soldier'},Z);
  await assert.rejects(route('char.create',{name:'Zeta Four',cls:'hero'},Z),/Up to 3/);assert.strictEqual((await route('hello',{all:1},Z)).active,z1.id,'the first gladiator is active');
  await route('char.active',{char:z2.id},Z);assert.strictEqual((await route('hello',{all:1},Z)).active,z2.id);
  const z2e=await route('char.edit',{char:z2.id,cls:'amazonia',name:'Zeta Swift',look:{portrait:{skin:'#c58c5c',helm:'galea<script>'},color:'#123456',token:{c1:'#ff0000'}}},Z);
  assert.strictEqual(z2e.cls,'amazonia');assert.strictEqual(z2e.name,'Zeta Swift');assert.strictEqual(z2e.look.portrait.helm,'galeascript','looks are cleaned');assert.deepStrictEqual(z2e.stats,C.START_STATS,'ratings stay');
  await assert.rejects(route('char.edit',{char:z2.id,cls:'dragon'},Z),/eight printed/);
  const ZL=await route('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false},Z);await assert.rejects(route('char.edit',{char:z2.id,name:'Busy'},Z),/Finish or leave/);
  await assert.rejects(route('lobby.start',{id:ZL.id},Z),/at least 2/,'no online match with one human');
  await assert.rejects(route('lobby.chat',{id:ZL.id,text:'Ave'},Z),/Quick chat only/,'v0.80: no free text online');
  await route('lobby.set',{id:ZL.id,abandon:'fate',standsOff:true},Z);assert.strictEqual((await db.get('LOBBY#'+ZL.id,'LOBBY')).abandon,'fate');await route('lobby.leave',{id:ZL.id},Z);
  const cb=await route('char.create',{name:'Beta the Grim',cls:'soldier'},B);
  await assert.rejects(route('char.buy',{char:ca.id,item:'gladius'},A),/Costs 15 coin/);
  const L=await route('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:true},A);assert.strictEqual(L.rank,'tiro');
  await route('lobby.join',{id:L.id},B);
  /* wagers: a fighter backs only themselves; the pool is escrowed */
  let ch=await db.get('CHAR#'+cb.id,'CHAR');ch.wallet=40;await db.put('CHAR#'+cb.id,'CHAR',ch);
  await assert.rejects(route('bet.place',{id:L.id,seat:0,amt:10},B),/only back themselves/);
  const bet=await route('bet.place',{id:L.id,seat:1,amt:10},B);assert.strictEqual(bet.char.wallet,30);assert.strictEqual(bet.lobby.pool,10);
  await assert.rejects(route('lobby.start',{id:L.id},B),/Only the host/);
  const L2=await route('lobby.start',{id:L.id},A);assert.strictEqual(L2.status,'live');assert.ok(Number.isInteger(L2.seed));
  await assert.rejects(route('bet.place',{id:L.id,seat:1,amt:5},B),/Bets close/);
  await route('match.open',{id:L.id,snap:{S:'{}',rng:1}},A);
  /* inputs get one server order; a move may only speak for the sender's seat */
  const s0=await route('match.input',{id:L.id,in:{k:'act',a:'coin',seat:0}},A);const s1=await route('match.input',{id:L.id,in:{k:'act',a:'end',seat:0}},A);const s2=await route('match.input',{id:L.id,in:{k:'tile',r:3,c:4,seat:1}},B);
  assert.deepStrictEqual([s0.seq,s1.seq,s2.seq],[0,1,2]);
  await assert.rejects(route('match.input',{id:L.id,in:{k:'act',a:'end',seat:0}},B),/not yours/,'B cannot move for seat 0');
  const g=await route('match.get',{id:L.id,from:1},B);assert.deepStrictEqual(g.inputs.map(x=>x.seq),[1,2,3]);assert.strictEqual(g.inputs[2].k,'void','the refused move burns its seq as a void');assert.ok(g.open);
  assert.ok(pushed.some(([a,ty])=>a==='dev-b'&&ty==='match.input'),'inputs are pushed to the other player');
  assert.ok(!pushed.some(([a,ty,d])=>a==='dev-a'&&ty==='match.input'&&d.in.from==='dev-a'),'no echo of your own move');
  /* drop: refused while B is connected */
  await assert.rejects(route('match.drop',{id:L.id,seat:1},A),/Still here/);
  /* results by agreement: both report the same table → B wins and survives, A dies at Tiro (forgotten); B's wager pays */
  const table=[{seat:0,won:false,place:2,f:6,coin:4,survives:false},{seat:1,won:true,place:1,f:40,coin:12,survives:true},{seat:2,won:false,place:3,f:9},{seat:3,won:false,place:4,f:2}];
  const ra=await route('match.result',{id:L.id,table,hash:'h1'},A);assert.ok(ra.pending,'waits for the other report');
  const rb=await route('match.result',{id:L.id,table,hash:'h1'},B);
  assert.ok(!rb.void);assert.ok(!rb.out.died);assert.strictEqual(rb.char.survived,1);assert.strictEqual(rb.char.streak,1);assert.strictEqual(rb.char.stats.spd+rb.char.stats.str+rb.char.stats.int+rb.char.stats.lck+rb.char.stats.cha,275+2,'+1 survived, +1 won');
  assert.strictEqual(rb.char.wallet,30+(10+6)+10,'purse + half the coin kept + the pool back');
  assert.ok(pushed.some(([a,ty,d])=>a==='dev-a'&&ty==='match.settled'&&d.out&&d.out.died),'A hears the verdict');
  assert.ok(!(await db.get('CHAR#'+ca.id,'CHAR')).alive,'A is dead');assert.strictEqual((await route('hall.list',{},A)).length,0,'a fallen Tiro is forgotten');
  assert.strictEqual((await db.get('LOBBY#'+L.id,'LOBBY')).status,'done');
  /* two humans who disagree: void — nobody paid, nobody dies, both get a strike */
  const ca2=await route('char.create',{name:'Alpha Again',cls:'slave'},A);const M2=await route('lobby.create',{ev:'egidious',loc:3,seats:2,ranked:true},A);await route('lobby.join',{id:M2.id},B);await route('lobby.start',{id:M2.id},A);
  const w0=(await db.get('CHAR#'+cb.id,'CHAR')).wallet;
  await route('match.result',{id:M2.id,table:[{seat:0,won:true,survives:true},{seat:1,won:false,survives:false}],hash:'x'},A);
  const vd=await route('match.result',{id:M2.id,table:[{seat:0,won:false,survives:false},{seat:1,won:true,survives:true}],hash:'y'},B);
  assert.ok(vd.void,'void');assert.ok((await db.get('CHAR#'+cb.id,'CHAR')).alive&&(await db.get('CHAR#'+ca2.id,'CHAR')).alive,'no deaths');assert.strictEqual((await db.get('CHAR#'+cb.id,'CHAR')).wallet,w0,'no pay');
  assert.strictEqual((await db.get('ACCT#dev-a','PROFILE')).strikes,1);assert.strictEqual((await db.get('ACCT#dev-b','PROFILE')).strikes,1);
  /* three strikes: only meets other struck accounts */
  const P=await db.get('ACCT#dev-b','PROFILE');P.strikes=3;await db.put('ACCT#dev-b','PROFILE',P);const L3=await route('lobby.create',{ev:'cassian',loc:2,seats:2,ranked:false},A);
  assert.ok(!(await route('lobby.list',{},B)).some(x=>x.id===L3.id),'a struck account does not see clean lobbies');await assert.rejects(route('lobby.join',{id:L3.id},B),/gone/);
  /* a player who disconnects is dropped after 3 minutes, at an agreed point in the move order */
  P.strikes=0;await db.put('ACCT#dev-b','PROFILE',P);await route('lobby.leave',{id:L3.id},A);
  const L5=await route('lobby.create',{ev:'democritus',loc:6,seats:2,ranked:false},A);await route('lobby.join',{id:L5.id},B);await route('lobby.start',{id:L5.id},A);
  const {away}=require('../src/routes.js');await away(db,'dev-b',t);await assert.rejects(route('match.drop',{id:L5.id,seat:1},A),/Still here/,'not before 3 minutes');
  t+=C.AWAY_MS+1000;const dr=await route('match.drop',{id:L5.id,seat:1},A);assert.ok(dr.done);const g5=await route('match.get',{id:L5.id,from:0},A);assert.deepStrictEqual(g5.inputs.map(x=>x.k),['drop']);
  await assert.rejects(route('match.input',{id:L5.id,in:{k:'act',a:'end',seat:1}},B),/CPU holds your seat/);
  const r5=await route('match.result',{id:L5.id,table:[{seat:0,won:true,survives:true},{seat:1,won:false,survives:true}],hash:'z'},A);assert.ok(!r5.pending,'a dropped player is not waited for');assert.ok(r5.out&&!r5.out.died);
  /* a Veteranus who falls is remembered */
  const v=C.newChar({name:'Old Crixus',cls:'veteranus'},'dev-a','gv',t);v.survived=20;v.lifeCF=320;v.rank='veteranus';const o=C.applyResult(v,{won:false,place:3,f:10,survives:false},true);assert.ok(o.hall);
  /* parties + team events: a party of two sits on one team; only the leader picks the game */
  const Cc={acct:'dev-c'},Dd={acct:'dev-d'};await route('auth.signin',{name:'Gamma'},Cc);await route('auth.signin',{name:'Delta'},Dd);
  const cc=await route('char.create',{name:'Gamma Rex',cls:'amazonia'},Cc);const cd=await route('char.create',{name:'Delta Pax',cls:'venatore'},Dd);
  const Pt=await route('party.create',{},Cc);assert.strictEqual(Pt.code.length,5);await route('party.join',{code:Pt.code.toLowerCase()},Dd);
  await assert.rejects(route('lobby.create',{ev:'familia',loc:5,ranked:false},Dd),/leader picks/);
  const F=await route('lobby.create',{ev:'familia',loc:5,ranked:false,ticket:5},Cc);assert.ok(F.team);assert.strictEqual(F.seats,4);
  assert.deepStrictEqual(F.players.map(p=>[p.id,p.team]),[['dev-c','A'],['dev-d','A']],'the party fights on one team');
  const ga=await route('char.create',{name:'Alpha Third',cls:'royalty'},A).catch(()=>null);
  await route('lobby.join',{id:F.id},B);assert.strictEqual((await db.get('LOBBY#'+F.id,'LOBBY')).players.find(p=>p.id==='dev-b').team,'B');
  /* tickets: before the horns only, never for a fighter; the coin goes into the pot */
  const actA=(await route('hello',{all:1},A)).active;let chA=(await route('char.mine',{},A)).find(c=>c.id===actA);chA.wallet=20;await db.put('CHAR#'+chA.id,'CHAR',{...chA,GSI1PK:'OWNER#dev-a',GSI1SK:chA.born});
  await assert.rejects(route('lobby.ticket',{id:F.id},B),/Fighters take the sand/);
  const tk=await route('lobby.ticket',{id:F.id},A);assert.strictEqual(tk.char.wallet,15);assert.strictEqual(tk.lobby.pot,5);assert.strictEqual(tk.lobby.stands[0].id,'dev-a');
  await route('lobby.start',{id:F.id},Cc);await assert.rejects(route('lobby.ticket',{id:F.id},A),/until the horns/);
  const MF=await db.get('MATCH#'+F.id,'META');assert.strictEqual(MF.seats['dev-a'],4,'the ticket holder sits after the four fighters');assert.ok(!MF.players.includes('dev-a'));
  await route('match.open',{id:F.id,snap:{S:'{}',rng:1}},Cc);
  const sp=await route('match.input',{id:F.id,in:{k:'modal',v:'pass',seat:4}},A);assert.ok(Number.isInteger(sp.seq),'a ticket holder decides their own upkeep');
  /* 👁 watching: a stranger hears every move */
  const Ee={acct:'dev-e'};await route('auth.signin',{name:'Epsilon'},Ee);const wt=await route('match.watch',{id:F.id},{...Ee,conn:'cE'});assert.deepStrictEqual(wt.players.sort(),['dev-b','dev-c','dev-d']);
  pushed.length=0;await route('match.input',{id:F.id,in:{k:'act',a:'end',seat:0}},Cc);assert.ok(pushed.some(([a,ty])=>a==='dev-e'&&ty==='match.input'),'the watcher hears the move');
  await assert.rejects(route('match.input',{id:F.id,in:{k:'act',a:'end',seat:0}},Ee),/Not your match/,'a watcher cannot move');
  /* team A wins: the pot (no bets) goes to the winning fighters */
  const ft=[{seat:0,won:true,survives:true},{seat:1,won:true,survives:true},{seat:2,won:false,survives:true},{seat:3,won:false,survives:true}];
  const wc0=(await db.get('CHAR#'+cc.id,'CHAR')).wallet;for(const X of [Cc,Dd,B])await route('match.result',{id:F.id,table:ft,hash:'f'},X);
  const wc1=(await db.get('CHAR#'+cc.id,'CHAR')).wallet;assert.ok(wc1>=wc0+2,'the ticket pot is split by the winning team');
  await route('party.leave',{},Dd);assert.deepStrictEqual((await route('party.get',{},Cc)).members,['dev-c']);
  /* settle: winning bets share bets + pot; void refunds bets and tickets */
  const st=C.settle([{by:'x',seat:0,amt:10},{by:'y',seat:1,amt:10}],[0],{pot:20});assert.strictEqual(st.payouts.x,38);
  const sv=C.settle([{by:'x',seat:0,amt:10}],[0],{pot:5,tix:[{by:'t',amt:5}],void:true});assert.deepStrictEqual(sv.payouts,{x:10,t:5});
  /* 🚪 abandon in Ranked: Damnatio now; the last human leaving shuts the match down */
  const G={acct:'dev-g'},H={acct:'dev-h'};await route('auth.signin',{name:'Gaius'},G);await route('auth.signin',{name:'Helva'},H);const cg=await route('char.create',{name:'Gaius Brave',cls:'hero'},G);const chH=await route('char.create',{name:'Helva Bold',cls:'slave'},H);
  const RL=await route('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:true},G);await route('lobby.join',{id:RL.id},H);await route('lobby.start',{id:RL.id},G);
  const ab=await route('match.abandon',{id:RL.id},H);assert.strictEqual(ab.rule,'fate');assert.ok(ab.out&&ab.out.died,'an abandoned Ranked gladiator dies');assert.ok(!(await db.get('CHAR#'+chH.id,'CHAR')).alive);
  const gi=await route('match.get',{id:RL.id,from:0},G);assert.strictEqual(gi.inputs.slice(-1)[0].k,'abandon');await assert.rejects(route('match.input',{id:RL.id,in:{k:'act',a:'end',seat:1}},H),/Not your match|left this match/);
  await route('match.abandon',{id:RL.id},G);assert.strictEqual((await db.get('LOBBY#'+RL.id,'LOBBY')).status,'done','the last human leaving shuts it down');
  /* JWT: a token signed by the pool's key passes; a forged one does not */
  const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});const jwk={...publicKey.export({format:'jwk'}),kid:'k1',alg:'RS256'};
  const enc=o=>Buffer.from(JSON.stringify(o)).toString('base64url');const mk=(body,key=privateKey)=>{const h=enc({alg:'RS256',kid:'k1'}),b=enc(body);return h+'.'+b+'.'+crypto.sign('RSA-SHA256',Buffer.from(h+'.'+b),key).toString('base64url')};
  const cfg={region:'us-east-1',poolId:'us-east-1_X',clientId:'cli'};const body={iss:'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_X',aud:'cli',token_use:'id',sub:'abc',exp:Math.floor(Date.now()/1000)+600,name:'Virgilante'};
  assert.strictEqual((await verify(mk(body),cfg,async()=>[jwk])).sub,'abc');
  await assert.rejects(verify(mk(body,crypto.generateKeyPairSync('rsa',{modulusLength:2048}).privateKey),cfg,async()=>[jwk]),/Bad signature/);
  await assert.rejects(verify(mk({...body,aud:'other'}),cfg,async()=>[jwk]),/Wrong audience/);
  console.log('server routes: all checks passed');
  await v80();console.log('server v0.80 (rooms, quick chat, Praeco, Forum, presence, resync): all checks passed')})().catch(e=>{console.error(e);process.exit(1)});

/* ── v0.80 through the real handler (index.js makeHandler): presence, rooms, quick chat, the Praeco, the Forum, resync helpers ── */
async function v80(){
  const {makeHandler}=require('../src/index.js');
  let T=1800000000000;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0});
  let nc=0,rid=0;
  const connect=async name=>{const conn='c'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);return conn};
  const disconnect=async conn=>{live.delete(conn);await h({requestContext:{routeKey:'$disconnect',connectionId:conn}})};
  const mark=()=>sent.length;
  async function client(name,o={}){const cl={name,acct:'dev-'+name};cl.conn=await connect(name);
    cl.req=async(t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:cl.conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===cl.conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);if(!m.msg.ok)throw new Error(m.msg.err);return m.msg.d};
    cl.got=(t,since=0)=>sent.slice(since).filter(x=>x.conn===cl.conn&&x.msg.push===t).map(x=>x.msg.d);
    cl.reconnect=async()=>{cl.conn=await connect(name)};
    await cl.req('auth.signin',{name:o.acctName||name.toUpperCase()+' Account'});if(o.glad!==false)cl.ch=await cl.req('char.create',{name:o.glad||name[0].toUpperCase()+name.slice(1)+' Gladius',cls:o.cls||'hero'});
    if(o.tz!==undefined)await cl.req('hello',{all:1,tz:o.tz});return cl}
  const prof=a=>db.get('ACCT#'+a,'PROFILE');const getL=id=>db.get('LOBBY#'+id,'LOBBY');
  /* presence: $connect marks the account 'ON'; hello stores {glad,rank,tz} and sums the zones */
  const ann=await client('ann',{tz:'Europe/Rome'}),bob=await client('bob',{tz:'America/New_York'}),cat=await client('cat',{tz:'Europe/Rome'});
  let P=await prof(ann.acct);assert.strictEqual(P.GSI1PK,'ON');assert.strictEqual(P.conn,ann.conn);assert.deepStrictEqual(P.here,{glad:'Ann Gladius',rank:'tiro',tz:'Europe/Rome'});
  const hc=await cat.req('hello',{all:1,tz:'Europe/Rome'});assert.strictEqual(hc.here.n,3);assert.strictEqual(hc.online,3);assert.deepStrictEqual(hc.here.zones,{'Europe/Rome':2,'America/New_York':1});assert.deepStrictEqual(hc.forum,[]);
  assert.strictEqual((await cat.req('hello',{all:1,tz:'Not a zone!'})).here.zones['Not a zone!'],undefined,'bad zones are dropped');await cat.req('hello',{all:1,tz:'Europe/Rome'});
  /* a reconnect, then the OLD socket closes: the newer connection is kept (conditional clear) */
  const old=ann.conn;await ann.reconnect();await disconnect(old);P=await prof(ann.acct);assert.strictEqual(P.conn,ann.conn,'the old socket never clears the new one');assert.strictEqual(P.GSI1PK,'ON');
  await disconnect(ann.conn);P=await prof(ann.acct);assert.strictEqual(P.conn,null);assert.strictEqual(P.GSI1PK,undefined);assert.strictEqual(P.offAt,T);
  assert.strictEqual((await bob.req('hello',{all:1})).here.n,2,'gone from the map');assert.strictEqual((await bob.req('world.news',{})).online,2,'world.news counts the lanistas here');
  await ann.reconnect();assert.strictEqual((await bob.req('hello',{all:1})).here.n,3);
  /* a silently dead socket: the first push that finds it gone clears the presence */
  live.delete(cat.conn);await ann.req('forum.say',{q:'ave'});P=await prof(cat.acct);assert.strictEqual(P.conn,null,'a gone push clears the connection');assert.strictEqual(P.GSI1PK,undefined);await cat.reconnect();

  /* ROOMS: a classic always has 4 seats; the rest stand */
  const dan=await client('dan'),eve=await client('eve'),fay=await client('fay');
  let L=await ann.req('lobby.create',{ranked:false,seats:2,cry:false});assert.strictEqual(L.seats,4,'classics are always 4 seats');assert.deepStrictEqual(L.members.map(m=>m.id),[ann.acct]);assert.strictEqual(L.players[0].name,'Ann Gladius','names are gladiator names');
  L=await ann.req('lobby.set',{id:L.id,seats:3});assert.strictEqual(L.seats,4);
  for(const x of [bob,cat,dan])await x.req('lobby.join',{id:L.id});let m0=mark();L=await eve.req('lobby.join',{id:L.id});
  assert.ok(C.memberOf(L,eve.acct)&&C.seatOf(L,eve.acct)<0,'the fifth lanista stands');assert.strictEqual(ann.got('lobby.update',m0).slice(-1)[0].lobby.members.length,5,'the push carries the changed room');
  await assert.rejects(eve.req('lobby.sit',{id:L.id}),/Every seat is taken/);await assert.rejects(ann.req('lobby.stand',{id:L.id}),/host keeps a seat/);
  await bob.req('lobby.stand',{id:L.id});L=await eve.req('lobby.sit',{id:L.id});assert.ok(C.seatOf(L,eve.acct)>=0);await assert.rejects(bob.req('lobby.sit',{id:L.id}),/Every seat/);
  await assert.rejects(eve.req('char.edit',{char:eve.ch.id,name:'Busy Eve'}),/Finish or leave/,'members wait to edit');
  await assert.rejects(bob.req('lobby.set',{id:L.id,ev:'familia'}),/Only the host/);
  /* Familia: 4–8 seats; fewer seats → the last to sit stand up; settings reset ready */
  L=await ann.req('lobby.set',{id:L.id,ev:'familia',seats:6});assert.ok(L.team);assert.strictEqual(L.seats,6);assert.ok(L.players.every(p=>p.team));
  L=await bob.req('lobby.sit',{id:L.id});assert.strictEqual(L.players.length,5);L=await ann.req('lobby.set',{id:L.id,seats:9});assert.strictEqual(L.seats,8);
  await ann.req('lobby.ready',{id:L.id,ready:true});L=await ann.req('lobby.set',{id:L.id,seats:4});assert.strictEqual(L.seats,4);assert.ok(C.seatOf(L,bob.acct)<0,'bob sat last and stands up');assert.ok(L.players.every(p=>!p.ready),'ready resets');
  L=await ann.req('lobby.set',{id:L.id,seats:3});assert.strictEqual(L.seats,4,'Familia has at least 4 seats');
  /* teams (Custom): yourself, or the host moves you */
  L=await cat.req('lobby.team',{id:L.id,team:'B'});assert.strictEqual(L.players[C.seatOf(L,cat.acct)].team,'B');
  await assert.rejects(dan.req('lobby.team',{id:L.id,who:cat.acct,team:'A'}),/Only the host moves/);L=await ann.req('lobby.team',{id:L.id,who:dan.acct,team:'A'});assert.strictEqual(L.players[C.seatOf(L,dan.acct)].team,'A');
  /* 👑 Give Host: the unseated new host takes the old host's seat (and team) */
  await fay.req('lobby.join',{id:L.id});L=await getL(L.id);const annSeat=C.seatOf(L,ann.acct),annTeam=L.players[annSeat].team;
  L=await ann.req('lobby.host',{id:L.id,to:bob.acct});assert.strictEqual(L.host.id,bob.acct);assert.strictEqual(C.seatOf(L,bob.acct),annSeat);assert.strictEqual(L.players[annSeat].team,annTeam);assert.ok(C.seatOf(L,ann.acct)<0,'the old host stands');
  /* kick: removed, told so, blocked for 5 minutes */
  m0=mark();L=await bob.req('lobby.kick',{id:L.id,who:fay.acct});assert.ok(!C.memberOf(L,fay.acct));assert.ok(fay.got('lobby.update',m0).some(u=>u.kicked===1&&u.id===L.id),'the removed hears it');
  await assert.rejects(fay.req('lobby.join',{id:L.id}),/removed you/);T+=C.KICK_MS+1000;await fay.req('lobby.join',{id:L.id});
  /* the host leaves: the earliest joiner still there gets the room and a seat */
  await bob.req('lobby.leave',{id:L.id});L=await getL(L.id);assert.strictEqual(L.host.id,ann.acct);assert.ok(C.seatOf(L,ann.acct)>=0);assert.strictEqual(L.status,'waiting');
  const hw=await fay.req('hello',{all:1});assert.ok(hw.here.wait>=5,'waiting lanistas counted');assert.ok(!hw.lobbies.find(x=>x.id===L.id).lite,'your own room comes whole');
  assert.ok((await bob.req('hello',{all:1})).lobbies.find(x=>x.id===L.id).lite,'other rooms come as lite rows');
  /* the horns: the unseated leave the room with a push */
  m0=mark();L=await ann.req('lobby.start',{id:L.id});assert.strictEqual(L.status,'live');assert.deepStrictEqual(L.unseated,[fay.acct]);assert.ok(!C.memberOf(L,fay.acct));
  assert.ok(fay.got('lobby.update',m0).some(u=>u.started===1&&u.unseated===1),'started without you');assert.ok(cat.got('lobby.update',m0).some(u=>u.lobby&&u.lobby.status==='live'));
  const fid=L.id;const hf=await fay.req('hello',{all:1});assert.strictEqual(hf.here.fight,4);
  const who=await fay.req('who.list',{});assert.strictEqual(who.find(w=>w.id===cat.acct).st,'fight');assert.strictEqual(who.find(w=>w.id===bob.acct).st,'free');assert.strictEqual(who.find(w=>w.id===cat.acct).name,'Cat Gladius');assert.ok(!who.some(w=>w.id===fay.acct));
  /* in the match: 💬 phrases (never inputs), hash relays, out-of-step votes */
  m0=mark();await cat.req('match.say',{id:fid,q:'truce'});const ms=ann.got('match.say',m0)[0];assert.deepStrictEqual([ms.q,ms.by,ms.seat],['truce',cat.acct,C.seatOf(L,cat.acct)]);assert.strictEqual(cat.got('match.say',m0).length,0,'no echo');
  await assert.rejects(cat.req('match.say',{id:fid,q:'struck'}),/Slow down/);T+=C.RATE.say;assert.ok(await cat.req('match.say',{id:fid,q:'well'}),'farewells while live: your bout may end on your screen first');T+=C.RATE.say;await assert.rejects(cat.req('match.say',{id:fid,q:'ave'}),/Quick chat only/,'room phrases are not match phrases');
  await assert.rejects(fay.req('match.say',{id:fid,q:'ha'}),/Not your match/);assert.strictEqual((await db.query('MATCH#'+fid,'IN#')).length,0,'phrases are never inputs');
  m0=mark();await ann.req('match.hashq',{id:fid,seq:5});for(const x of [cat,dan,eve])assert.deepStrictEqual(x.got('match.hashq',m0)[0],{id:fid,seq:5,from:ann.acct});assert.strictEqual(ann.got('match.hashq',m0).length,0);
  m0=mark();await cat.req('match.hasha',{id:fid,seq:5,to:ann.acct,h:'abc'});assert.deepStrictEqual(ann.got('match.hasha',m0)[0],{id:fid,seq:5,from:cat.acct,seat:C.seatOf(L,cat.acct),h:'abc'});assert.strictEqual(dan.got('match.hasha',m0).length,0);
  await assert.rejects(fay.req('match.hashq',{id:fid,seq:1}),/Not your match/);
  const eveSeat=C.seatOf(L,eve.acct);await assert.rejects(eve.req('match.odd',{id:fid,seat:eveSeat}),/No one/);
  let od=await cat.req('match.odd',{id:fid,seat:eveSeat});assert.deepStrictEqual([od.votes,od.need,od.struck],[1,3,false]);od=await dan.req('match.odd',{id:fid,seat:eveSeat});assert.ok(!od.struck);
  od=await dan.req('match.odd',{id:fid,seat:eveSeat});assert.strictEqual(od.votes,2,'one vote a voter');od=await ann.req('match.odd',{id:fid,seat:eveSeat});assert.ok(od.struck);
  od=await ann.req('match.odd',{id:fid,seat:eveSeat});assert.ok(!od.struck,'a strike once a match');assert.strictEqual((await prof(eve.acct)).strikes,1);
  /* the result: a 'res' line in the Forum; after-match phrases for 10 minutes */
  const ft=L.players.map((p,i)=>({seat:i,won:p.team==='A',f:p.team==='A'?20+i:5,survives:true}));m0=mark();for(const x of [ann,cat,dan,eve])await x.req('match.result',{id:fid,table:ft,hash:'q'});
  const fg=await fay.req('forum.get',{});const res=fg.slice(-1)[0];assert.strictEqual(res.k,'res');assert.strictEqual(res.ev,'familia');assert.deepStrictEqual(res.win.sort(),L.players.filter(p=>p.team==='A').map(p=>p.name).sort());
  assert.strictEqual(res.cf,Math.max(...ft.filter(r=>r.won).map(r=>r.f)));assert.ok(fay.got('forum.line',m0).some(x=>x.line.k==='res'),'free lanistas hear the result');assert.ok(!ann.got('forum.line',m0).some(x=>x.line.k==='res'),'fighters get match.settled instead');
  T+=C.RATE.say;await ann.req('match.say',{id:fid,q:'well'});await assert.rejects(dan.req('match.say',{id:fid,q:'truce'}),/Quick chat only/);T+=11*60e3;await assert.rejects(dan.req('match.say',{id:fid,q:'vale'}),/quiet/);
  /* ⚔ Again: a room like the last one, the others invited, no Praeco line */
  m0=mark();const ag=await ann.req('lobby.again',{id:fid});assert.strictEqual(ag.lobby.ev,'familia');assert.strictEqual(ag.lobby.loc,L.loc);assert.deepStrictEqual(ag.invited.sort(),[cat.acct,dan.acct,eve.acct].sort());
  const iv=cat.got('lobby.invite',m0)[0];assert.strictEqual(iv.from,'Ann Gladius');assert.strictEqual(iv.fromId,ann.acct);assert.ok(iv.row.lite);assert.ok(!sent.slice(m0).some(x=>x.msg.push==='forum.line'),'Again cries nothing');
  await assert.rejects(fay.req('lobby.again',{id:fid}),/Not your match/);await ann.req('lobby.leave',{id:ag.lobby.id});
  /* the Praeco: lobby.quick never makes twin rooms; opening a room cries it to free lanistas who fit */
  const gus=await client('gus'),hal=await client('hal'),ida=await client('ida'),jon=await client('jon'),kim=await client('kim');
  await kim.req('forum.mute',{who:gus.acct,on:true});m0=mark();const q1=await gus.req('lobby.quick',{ev:'cassian'});assert.ok(q1.made);
  const op=hal.got('forum.line',m0).map(x=>x.line).find(l=>l.k==='open');assert.ok(op&&op.row.id===q1.lobby.id&&op.name==='Gus Gladius','free lanistas hear the opening');assert.ok(JSON.stringify(op.row).length<1024,'a lite row is small');
  assert.ok(!kim.got('forum.line',m0).length,'muted: no cries');assert.strictEqual((await fay.req('forum.get',{})).slice(-1)[0].k,'open','the opening is kept in the Forum');
  const q2=await hal.req('lobby.quick',{ev:'cassian'});assert.ok(!q2.made);assert.strictEqual(q2.lobby.id,q1.lobby.id,'the playlist joins the waiting room');
  const [q3,q4]=await Promise.all([ida.req('lobby.quick',{ev:'egidious'}),jon.req('lobby.quick',{ev:'egidious'})]);
  const eg=(await db.byIndex('LOBBIES')).filter(x=>x.ev==='egidious'&&x.status==='waiting');assert.strictEqual(eg.length,1,'no twin rooms');assert.strictEqual(eg[0].players.length,2);assert.strictEqual(q3.lobby.id,q4.lobby.id);
  assert.ok((await db.byIndex('LOBBIES_DONE')).some(x=>x.closed==='merged'&&x.ev==='egidious'),'both pressed at once: the later twin folded into the earlier');
  /* 📣 calls: the opening counts, 3 a room, 2 minutes apart, only with a free seat */
  await assert.rejects(gus.req('lobby.call',{id:q1.lobby.id}),/needs a breath — 120 s/);T+=C.RATE.cryGap;m0=mark();assert.strictEqual((await gus.req('lobby.call',{id:q1.lobby.id})).left,1);
  assert.ok(bob.got('forum.line',m0).some(x=>x.line.k==='call'&&x.line.need===2&&x.line.row.id===q1.lobby.id),'the call says the free seats');assert.strictEqual(kim.got('forum.line',m0).length,0,'muted');assert.strictEqual(hal.got('forum.line',m0).length,0,'not to the room itself');
  await assert.rejects(hal.req('lobby.call',{id:q1.lobby.id}),/breath/);T+=C.RATE.cryGap;await hal.req('lobby.call',{id:q1.lobby.id});T+=C.RATE.cryGap;await assert.rejects(gus.req('lobby.call',{id:q1.lobby.id}),/three times/);
  await assert.rejects(bob.req('lobby.call',{id:q1.lobby.id}),/Join the room/);
  /* the fan-out: at most RATE.fanCap free lanistas, the newest first; struck accounts never hear clean rooms; nobody fighting */
  for(let i=0;i<45;i++){const c='cf'+i;live.add(c);await db.put('ACCT#dev-f'+i,'PROFILE',{id:'dev-f'+i,name:'F'+i,conn:c,GSI1PK:'ON',GSI1SK:T+i,here:{glad:'F'+i,rank:'tiro',tz:''}})}
  live.add('csx');await db.put('ACCT#dev-sx','PROFILE',{id:'dev-sx',name:'SX',conn:'csx',GSI1PK:'ON',GSI1SK:T+99,strikes:3});
  live.add('cfx');await db.put('ACCT#dev-fx','PROFILE',{id:'dev-fx',name:'FX',conn:'cfx',GSI1PK:'ON',GSI1SK:T+98,match:'Lsomewhere'});
  m0=mark();const ql=await kim.req('lobby.create',{ev:'democritus'});const heard=sent.slice(m0).filter(x=>x.msg.push==='forum.line');
  assert.strictEqual(heard.length,C.RATE.fanCap,'the fan-out stops at the cap');assert.ok(heard.some(x=>x.conn==='cf44')&&!heard.some(x=>x.conn==='cf0'),'newest first');
  assert.ok(!heard.some(x=>x.conn==='csx'),'struck accounts are kept apart');assert.ok(!heard.some(x=>x.conn==='cfx'),'fighters are not called');
  /* ✉ invites: rules, rates, mutes */
  await assert.rejects(kim.req('lobby.invite',{id:ql.id,to:'dev-nobody'}),/Not in the arena/);await assert.rejects(kim.req('lobby.invite',{id:ql.id,to:'dev-sx'}),/cannot join/);
  await assert.rejects(kim.req('lobby.invite',{id:ql.id,to:'dev-fx'}),/Fighting right now/);await assert.rejects(bob.req('lobby.invite',{id:ql.id,to:fay.acct}),/Join the room/);
  m0=mark();await kim.req('lobby.invite',{id:ql.id,to:bob.acct});const bi=bob.got('lobby.invite',m0)[0];assert.strictEqual(bi.from,'Kim Gladius');assert.strictEqual(bi.row.id,ql.id);
  await assert.rejects(kim.req('lobby.invite',{id:ql.id,to:fay.acct}),/Slow down/);T+=C.RATE.invGap;await assert.rejects(kim.req('lobby.invite',{id:ql.id,to:bob.acct}),/invited them already/);
  await bob.req('forum.mute',{who:kim.acct,on:true});T+=C.RATE.invSame;m0=mark();await kim.req('lobby.invite',{id:ql.id,to:bob.acct});assert.strictEqual(bob.got('lobby.invite',m0).length,0,'a muting lanista never hears it');
  assert.deepStrictEqual((await bob.req('forum.mute',{who:kim.acct,on:false})).mutes,[]);
  T=Math.ceil(T/3600e3)*3600e3+1000;let ok=0;for(let i=0;i<20;i++){T+=C.RATE.invGap;try{await kim.req('lobby.invite',{id:ql.id,to:'dev-f'+i});ok++}catch(e){assert.match(e.message,/this hour/);break}}assert.strictEqual(ok,C.RATE.invHour,'15 invitations an hour');
  T+=3600e3;await kim.req('lobby.invite',{id:ql.id,to:'dev-f30'});
  await bob.req('lobby.join',{id:ql.id});T+=C.RATE.invSame;await assert.rejects(kim.req('lobby.invite',{id:ql.id,to:bob.acct}),/Already in the room/);
  /* Ranked: the same rank only (calls and invites) */
  const Pd=await prof(fay.acct);Pd.here={...Pd.here,rank:'gregarius'};await db.put('ACCT#'+fay.acct,'PROFILE',Pd);
  const rq=await eve.req('lobby.create',{ranked:true,ev:'cassian',cry:false});await assert.rejects(eve.req('lobby.invite',{id:rq.id,to:fay.acct}),/Ranked: Tiro only/);
  const F44=await prof('dev-f44');F44.here.rank='gregarius';await db.put('ACCT#dev-f44','PROFILE',F44);
  T+=C.RATE.cryGap;m0=mark();await eve.req('lobby.call',{id:rq.id});const rh=sent.slice(m0).filter(x=>x.msg.push==='forum.line').map(x=>x.conn);
  assert.ok(!rh.includes('cf44')&&rh.includes('cf43'),'Ranked calls reach the same rank only');
  /* 💬 room phrases: codes only, 3 s apart, their own CHAT# items, ✓ Ready marks the seat, the last 40 kept */
  T+=C.RATE.say;m0=mark();const sy=await kim.req('lobby.say',{id:ql.id,q:'ave'});assert.deepStrictEqual([sy.line.q,sy.line.name],['ave','Kim Gladius']);assert.strictEqual(bob.got('lobby.say',m0)[0].line.q,'ave');assert.strictEqual(kim.got('lobby.say',m0).length,0);
  await assert.rejects(kim.req('lobby.say',{id:ql.id,q:'luck'}),/Slow down/);await assert.rejects(bob.req('lobby.say',{id:ql.id,q:'Ave you fools'}),/Quick chat only/);await assert.rejects(bob.req('lobby.say',{id:ql.id,q:'truce'}),/Quick chat only/,'match phrases stay in matches');
  await assert.rejects(fay.req('lobby.say',{id:ql.id,q:'ave'}),/Join the game/);
  await bob.req('lobby.say',{id:ql.id,q:'ready'});assert.ok((await getL(ql.id)).players.find(p=>p.id===bob.acct).ready,'✓ Ready marks the seat');
  await kim.req('forum.mute',{who:bob.acct,on:true});T+=C.RATE.say;m0=mark();await bob.req('lobby.say',{id:ql.id,q:'luck'});assert.strictEqual(kim.got('lobby.say',m0).length,0,'muted phrases are dropped');
  for(let i=0;i<42;i++){T+=C.RATE.say;await kim.req('lobby.say',{id:ql.id,q:C.QC.room[i%C.QC.room.length]})}
  const log=await bob.req('lobby.chatlog',{id:ql.id});assert.strictEqual(log.length,C.CHAT_KEEP);assert.ok(log[0].at<log[39].at,'oldest first');assert.strictEqual(log[39].by,kim.acct);
  assert.deepStrictEqual((await getL(ql.id)).chat||[],[],'phrases never rewrite the room');await assert.rejects(fay.req('lobby.chatlog',{id:ql.id}),/Join the game/);
  /* the Forum: phrases from lanistas with a gladiator, 10 s apart, the last 30, mutes, the daily meter */
  const nog=await client('nog',{glad:false});await assert.rejects(nog.req('forum.say',{q:'ave'}),/Make a gladiator/);await assert.rejects(fay.req('forum.say',{q:'Free text!'}),/Quick chat only/);
  T+=C.RATE.forum;m0=mark();const fs1=await fay.req('forum.say',{q:'anyc'});assert.strictEqual(fs1.line.name,'Fay Gladius');assert.ok(nog.got('forum.line',m0).some(x=>x.line.q==='anyc'&&x.line.k==='say'));assert.ok(!fay.got('forum.line',m0).length,'no echo');
  await assert.rejects(fay.req('forum.say',{q:'vale'}),/Slow down/);
  const stale=(await nog.req('hello',{all:1})).here.n;await bob.reconnect();assert.strictEqual((await nog.req('hello',{all:1})).here.n,stale+1,'a socket older than 2 h 05 is not counted until it reconnects');
  await nog.req('forum.mute',{who:fay.acct,on:true});T+=C.RATE.forum;m0=mark();await fay.req('forum.say',{q:'vale'});assert.ok(!nog.got('forum.line',m0).length,'muted');assert.ok(bob.got('forum.line',m0).length,'others still hear it');
  const day=new Date(T).toISOString().slice(0,10);await db.put('WORLD','FMETER#'+day,{n:C.RATE.meterDay});T+=C.RATE.forum;m0=mark();await fay.req('forum.say',{q:'well'});
  assert.ok(!sent.slice(m0).some(x=>x.msg.push==='forum.line'),'over the daily meter: no pushes');const fl=await nog.req('forum.get',{});assert.strictEqual(fl.slice(-1)[0].q,'well','but the line is kept');assert.ok(fl.length<=30);
  for(let i=0;i<35;i++)await db.put('FORUM','L#'+String(T+i).padStart(13,'0')+'#x',{k:'say',by:'x',q:'ave',at:T+i});const f30=await nog.req('forum.get',{});assert.strictEqual(f30.length,30);assert.ok(f30[0].at<f30[29].at,'newest last');
  assert.strictEqual((await nog.req('hello',{all:1})).forum.length,30,'hello carries the Forum');
  /* Ranked Familia: teams are balanced at the horns, a party stays together */
  const r1=await client('rua'),r2=await client('rub'),r3=await client('ruc'),r4=await client('rud');
  const pt=await r1.req('party.create',{});await r2.req('party.join',{code:pt.code});await assert.rejects(r2.req('lobby.quick',{ev:'familia'}),/leader picks/);
  const RF=await r1.req('lobby.create',{ranked:true,ev:'familia',cry:false});assert.ok(RF.autoBal);assert.strictEqual(RF.members.length,2,'the party comes in together');
  await r3.req('lobby.join',{id:RF.id});await r4.req('lobby.join',{id:RF.id});await assert.rejects(r3.req('lobby.team',{id:RF.id,team:'A'}),/Ranked teams are balanced/);
  const RS=await r1.req('lobby.start',{id:RF.id});const tm=Object.fromEntries(RS.players.map(p=>[p.id,p.team]));assert.strictEqual(tm[r1.acct],tm[r2.acct],'the party fights together');assert.notStrictEqual(tm[r3.acct],tm[r1.acct]);assert.strictEqual(tm[r3.acct],tm[r4.acct]);
  /* hello stays well under the 128 KB frame with 30 full rooms (lite rows) */
  const big={portrait:Object.fromEntries(Array.from({length:30},(_,i)=>['k'+i,'x'.repeat(30)]))};
  for(let i=0;i<30;i++){const X=C.newLobby({ev:'democritus'},{id:'dev-b'+i,name:'B'+i,char:'c'+i,rank:'tiro'},'LB'+i,T);
    for(let k=0;k<4;k++)C.roomJoin(X,[{id:'dev-b'+i+'x'+k,name:'B'+k,char:'c',rank:'tiro',kit:{cls:'hero',name:'B',stats:{...C.START_STATS},gear:['gladius'],look:big}}],T);await db.put('LOBBY#'+X.id,'LOBBY',{...X,GSI1PK:'LOBBIES',GSI1SK:T,ttl:9e9})}
  const hb=await nog.req('hello',{all:1});const hbs=JSON.stringify(hb).length;assert.ok(hbs<128*1024,'hello < 128 KB: '+hbs);const lb=hb.lobbies.filter(x=>x.id.startsWith('LB'));assert.strictEqual(lb.length,30);
  assert.ok(lb.every(x=>x.lite&&JSON.stringify(x).length<1024),'lite rows < 1 KB');assert.ok(JSON.stringify(C.newLobby({},{id:'x',name:'x'},'x',T)).length>0);
}
