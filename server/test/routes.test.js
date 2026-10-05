/* Local test of the server's requests on the in-memory store: node server/test/routes.test.js */
'use strict';
const assert=require('assert');const path=require('path');const crypto=require('crypto');
const {makeRoutes}=require('../src/routes.js');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');const {verify}=require('../src/jwt.js');
(async()=>{
  const db=store.memory();const pushed=[];let t=1700000000000;
  const route=makeRoutes({store:db,push:async(a,ty,d)=>pushed.push([a,ty,d]),catalog,now:()=>(t+=1000),dev:true,countdown:0});
  const A={acct:'dev-a'},B={acct:'dev-b'};
  /* v0.82: every lanista founds a house before any gladiator */
  const sign=async(ctx,name)=>{await route('auth.signin',{name},ctx);await route('domus.create',{name:'Domus '+name},ctx)};
  await sign(A,'Alpha');await sign(B,'Beta');
  const ca=await route('char.create',{name:'Alpha the Bold',cls:'hero',stats:{spd:99,str:99,int:99,lck:99,cha:99}},A);
  assert.deepStrictEqual(ca.stats,C.START_STATS,'everyone starts at the same low ratings');assert.strictEqual(ca.wallet,0);
  /* v0.79: up to 3 living gladiators, one active; edits only between events */
  const Z={acct:'dev-z'};await sign(Z,'Zeta');const z1=await route('char.create',{name:'Zeta One',cls:'hero'},Z);const z2=await route('char.create',{name:'Zeta Two',cls:'slave'},Z);await route('char.create',{name:'Zeta Three',cls:'soldier'},Z);await route('char.create',{name:'Zeta Four',cls:'veteranus'},Z);
  await assert.rejects(route('char.create',{name:'Zeta Five',cls:'hero'},Z),/Up to 4/,'v0.82: four gladiators a house');assert.strictEqual((await route('hello',{all:1},Z)).active,z1.id,'the first gladiator is active');
  await route('char.active',{char:z2.id},Z);assert.strictEqual((await route('hello',{all:1},Z)).active,z2.id);
  /* v0.89: the class changes only in the Domus (char.class, 100 coin from the treasury); a look may still be set once on a gladiator from before the sculpted tokens */
  await assert.rejects(route('char.edit',{char:z2.id,cls:'amazonia'},Z),/Change class in the Domus/);
  const z2e=await route('char.edit',{char:z2.id,cls:'slave',name:'Zeta Swift',look:{portrait:{skin:'#c58c5c',helm:'galea<script>'},color:'#123456',token:{c1:'#ff0000',sc:1}}},Z);
  await assert.rejects(route('char.edit',{char:z2.id,look:{color:'#654321',token:{c1:'#00ff00',sc:1}}},Z),/look is set/,'v0.89: then the look is locked');
  assert.strictEqual(z2e.cls,'slave');assert.strictEqual(z2e.name,'Zeta Swift');assert.strictEqual(z2e.look.portrait.helm,'galeascript','looks are cleaned');assert.deepStrictEqual(z2e.stats,C.START_STATS,'ratings stay');
  await assert.rejects(route('char.edit',{char:z2.id,cls:'dragon'},Z),/Change class in the Domus/);
  const ZL=await route('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false},Z);await assert.rejects(route('char.edit',{char:z2.id,name:'Busy'},Z),/Finish or leave/);
  await assert.rejects(route('lobby.start',{id:ZL.id},Z),/at least 2/,'no online match with one human');
  await assert.rejects(route('lobby.chat',{id:ZL.id,text:'Ave'},Z),/Quick chat only/,'v0.80: no free text online');
  await route('lobby.set',{id:ZL.id,abandon:'fate',standsOff:true},Z);assert.strictEqual((await db.get('LOBBY#'+ZL.id,'LOBBY')).abandon,'fate');await route('lobby.leave',{id:ZL.id},Z);
  const cb=await route('char.create',{name:'Beta the Grim',cls:'soldier'},B);
  await assert.rejects(route('char.buy',{char:ca.id,item:'gladius'},A),/Costs 60 coin/);
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
  assert.strictEqual(rb.char.wallet,30+5+10,'v0.82: the Tiro award ×1.5 for the win, ×0.5 at two lanistas (no coin carried out) + the pool back; v0.83: 1 of the 6 to the house treasury');
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
  const Cc={acct:'dev-c'},Dd={acct:'dev-d'};await sign(Cc,'Gamma');await sign(Dd,'Delta');
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
  const G={acct:'dev-g'},H={acct:'dev-h'};await sign(G,'Gaius');await sign(H,'Helva');const cg=await route('char.create',{name:'Gaius Brave',cls:'hero'},G);const chH=await route('char.create',{name:'Helva Bold',cls:'slave'},H);
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
  await v80();console.log('server v0.80 (rooms, quick chat, Praeco, Forum, presence, resync): all checks passed');
  await v80b();console.log('server v0.80 review (races, busy rule, names, mutes, odd push, Today in the arena): all checks passed');
  await v82();console.log('server v0.82 (domus, coin, prices, guests, invites, stands group turn, free seats, guest pass + Fame, patrons, rank-count seeding): all checks passed')})().catch(e=>{console.error(e);process.exit(1)});

/* ── v0.80 through the real handler (index.js makeHandler): presence, rooms, quick chat, the Praeco, the Forum, resync helpers ── */
async function v80(){
  const {makeHandler}=require('../src/index.js');
  let T=1800000000000;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});
  let nc=0,rid=0;
  const connect=async name=>{const conn='c'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);return conn};
  const disconnect=async conn=>{live.delete(conn);await h({requestContext:{routeKey:'$disconnect',connectionId:conn}})};
  const mark=()=>sent.length;
  async function client(name,o={}){const cl={name,acct:'dev-'+name};cl.conn=await connect(name);
    cl.req=async(t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:cl.conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===cl.conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);if(!m.msg.ok)throw new Error(m.msg.err);return m.msg.d};
    cl.got=(t,since=0)=>sent.slice(since).filter(x=>x.conn===cl.conn&&x.msg.push===t).map(x=>x.msg.d);
    cl.reconnect=async()=>{cl.conn=await connect(name)};
    await cl.req('auth.signin',{name:o.acctName||name.toUpperCase()+' Account'});if(o.domus!==false)cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;if(o.glad!==false&&o.domus!==false)cl.ch=await cl.req('char.create',{name:o.glad||name[0].toUpperCase()+name.slice(1)+' Gladius',cls:o.cls||'hero'});
    if(o.tz!==undefined)await cl.req('hello',{all:1,tz:o.tz});return cl}
  const prof=a=>db.get('ACCT#'+a,'PROFILE');const getL=id=>db.get('LOBBY#'+id,'LOBBY');
  /* presence: $connect marks the account 'ON'; hello stores {glad,rank,tz} and sums the zones */
  const ann=await client('ann',{tz:'Europe/Rome'}),bob=await client('bob',{tz:'America/New_York'}),cat=await client('cat',{tz:'Europe/Rome'});
  let P=await prof(ann.acct);assert.strictEqual(P.GSI1PK,'ON');assert.strictEqual(P.conn,ann.conn);assert.deepStrictEqual(P.here,{glad:'Ann Gladius',rank:'tiro',tz:'Europe/Rome',domus:'Domus ann'},'v0.82: the house name rides along');
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

/* ── v0.80 review fixes: requests at once never double-spend or double-pay, the busy rule, names, mutes, the odd push, Today in the arena ── */
async function v80b(){
  const {makeHandler}=require('../src/index.js');
  let T=1800000000000;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});
  let nc=0,rid=0;const mark=()=>sent.length;
  const connect=async name=>{const conn='k'+(++nc);live.add(conn);await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER)}});return conn};
  async function client(name,o={}){const cl={name,acct:'dev-'+name};cl.conn=await connect(name);
    cl.req=async(t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:cl.conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===cl.conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);if(!m.msg.ok)throw new Error(m.msg.err);return m.msg.d};
    cl.got=(t,since=0)=>sent.slice(since).filter(x=>x.conn===cl.conn&&x.msg.push===t).map(x=>x.msg.d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});await cl.req('domus.create',{name:'Domus '+name});if(o.glad!==false)cl.ch=await cl.req('char.create',{name:o.glad||name[0].toUpperCase()+name.slice(1)+' Gladius',cls:o.cls||'hero'});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const ok=r=>r.status==='fulfilled';
  /* the name filter (gladiator names are what everyone sees) */
  const ann=await client('ann'),bob=await client('bob'),cat=await client('cat'),dan=await client('dan');
  await assert.rejects(ann.req('char.create',{name:'Shithead',cls:'hero'}),/Pick another name/);await assert.rejects(ann.req('char.edit',{char:ann.ch.id,name:'Big Fucker'}),/Pick another name/);
  /* parties show gladiator names, never sign-in names */
  const pt=await ann.req('party.create',{});assert.strictEqual(pt.names[ann.acct],'Ann Gladius');const pj=await bob.req('party.join',{code:pt.code});assert.strictEqual(pj.names[bob.acct],'Bob Gladius');
  assert.ok(!JSON.stringify(pj).includes('Account'),'no sign-in names');await bob.req('party.leave',{});await ann.req('party.leave',{});
  /* two buys at once over one wallet: one wins, the other is told to try again */
  await setC(ann.ch.id,{wallet:C.PRICE[1]});const buys=await Promise.allSettled([ann.req('char.buy',{char:ann.ch.id,item:'gladius'}),ann.req('char.buy',{char:ann.ch.id,item:'mace'})]);
  assert.strictEqual(buys.filter(ok).length,1,'one buy');let ch=await getC(ann.ch.id);assert.strictEqual(ch.wallet,0);assert.strictEqual(ch.gear.length,1);
  /* a ticket given back twice at once is refunded once; a ticket holder cannot join the room */
  let L=await bob.req('lobby.create',{ev:'democritus',cry:false});await bob.req('lobby.set',{id:L.id,ticket:10});await setC(cat.ch.id,{wallet:30});
  await cat.req('lobby.ticket',{id:L.id});assert.strictEqual((await getC(cat.ch.id)).wallet,20);await assert.rejects(cat.req('lobby.join',{id:L.id}),/hold a ticket/);
  const lv=await Promise.allSettled([cat.req('lobby.leave',{id:L.id}),cat.req('lobby.leave',{id:L.id})]);assert.ok(lv.every(ok));assert.strictEqual((await getC(cat.ch.id)).wallet,30,'refunded once');
  /* the Forum keeps tiny room rows; every room line says the free seats */
  const fl=(await db.query('FORUM','L#')).map(x=>x);let m0=mark();await cat.req('lobby.create',{ev:'cassian'});const fl2=(await db.query('FORUM','L#')).slice(fl.length);
  assert.strictEqual(fl2.length,1);assert.deepStrictEqual(Object.keys(fl2[0].row).sort(),['ev','id','loc','n','rank','ranked','seats','team'].sort(),'tiny rows');assert.strictEqual(fl2[0].need,3);
  await cat.req('lobby.leave',{id:(await cat.req('lobby.list',{})).find(x=>x.ev==='cassian').id});
  /* a match of four: mutes, the odd push, results at once settle once, Today in the arena */
  for(const x of [ann,cat,dan])await x.req('lobby.join',{id:L.id});L=await bob.req('lobby.start',{id:L.id});const id=L.id;const seat=x=>C.seatOf(L,x.acct);
  await assert.rejects(ann.req('lobby.create',{ev:'cassian',cry:false}),/still fighting/,'busy until the match ends or is abandoned');
  await assert.rejects(ann.req('lobby.ticket',{id:'x'}),/still fighting/);let hl=await ann.req('hello',{all:1});assert.strictEqual(hl.live.id,id);assert.strictEqual(hl.live.ev,'democritus');assert.ok(!hl.live.dropped);
  await cat.req('forum.mute',{who:dan.acct,on:true});m0=mark();await dan.req('match.say',{id,q:'truce'});assert.strictEqual(cat.got('match.say',m0).length,0,'muted bubbles never arrive');assert.strictEqual(ann.got('match.say',m0).length,1);
  m0=mark();await ann.req('match.odd',{id,seat:seat(dan)});assert.strictEqual(dan.got('match.youodd',m0).length,0,'one vote is not a majority');await bob.req('match.odd',{id,seat:seat(dan)});
  let yo=dan.got('match.youodd',m0);assert.strictEqual(yo.length,0,'2 of 4 is not a majority');await cat.req('match.odd',{id,seat:seat(dan)});yo=dan.got('match.youodd',m0);
  assert.strictEqual(yo.length,1,'the odd lanista is told');assert.deepStrictEqual(yo[0].voters.sort(),[ann.acct,bob.acct,cat.acct].sort());
  /* ranks at the horns: Ann Tiro, Bob Primus Palus, Cat Gregarius; Ann wins with 34 CF → an upset */
  await setC(bob.ch.id,{survived:40,lifeCF:800,bouts:40,rank:'primus'});await setC(cat.ch.id,{survived:7,lifeCF:100,bouts:7,rank:'gregarius'});
  await setC(bob.ch.id,{wallet:0});
  const table=[0,1,2,3].map(i=>({seat:i,won:i===seat(ann),place:i===seat(ann)?1:2,f:i===seat(ann)?34:i===seat(bob)?20:8,coin:10,survives:true}));
  const rs=await Promise.allSettled([ann,bob,cat,dan].map(x=>x.req('match.result',{id,table,hash:'h'})));assert.ok(rs.every(ok),rs.filter(r=>!ok(r)).map(r=>r.reason&&r.reason.message).join());
  for(const x of [ann,bob,cat,dan])assert.strictEqual((await getC(x.ch.id)).bouts,x===bob?41:x===cat?8:1,'one result each: '+x.name);
  assert.ok(!(await ann.req('hello',{all:1})).live,'free again');
  let td=(await dan.req('hello',{all:1})).today;assert.strictEqual(td.day,'today');assert.strictEqual(td.wins[0].name,'Ann Gladius');assert.strictEqual(td.wins[0].cf,34);assert.strictEqual(td.wins[0].ev,'democritus');assert.strictEqual(td.wins[0].rank,'tiro');
  assert.strictEqual(td.upsets.length,1);assert.deepStrictEqual([td.upsets[0].w.name,td.upsets[0].l.name,td.upsets[0].l.rank,td.upsets[0].gap],['Ann Gladius','Bob Gladius','primus',4]);assert.deepStrictEqual(td.fallen,[]);
  /* Ranked: a death by the Fate, then an abandoned Ranked gladiator (Damnatio) — the best rank first */
  const eve=await client('eve'),fay=await client('fay'),gus=await client('gus');
  let R=await eve.req('lobby.create',{ranked:true,ev:'cassian',cry:false});await fay.req('lobby.join',{id:R.id});await gus.req('lobby.join',{id:R.id});R=await eve.req('lobby.start',{id:R.id});
  const rt=R.players.map((p,i)=>({seat:i,won:p.id===eve.acct,place:p.id===eve.acct?1:3,f:p.id===eve.acct?25:p.id===fay.acct?12:5,survives:p.id!==fay.acct}));
  m0=mark();const ab=await gus.req('match.abandon',{id:R.id});assert.ok(ab.out&&ab.out.died);
  await eve.req('match.result',{id:R.id,table:rt,hash:'r'});assert.ok(!(await eve.req('hello',{all:1})).live,'reported: free (the others may still confirm)');
  const ev2=await eve.req('lobby.create',{ev:'cassian',cry:false});await eve.req('lobby.leave',{id:ev2.id});assert.ok((await fay.req('hello',{all:1})).live,'not yet reported: still fighting');
  await fay.req('match.result',{id:R.id,table:rt,hash:'r'});assert.ok((await fay.req('hello',{all:1})).now,'hello carries the server clock');
  td=(await dan.req('hello',{all:1})).today;assert.deepStrictEqual(td.fallen.map(f=>[f.name,f.how]).sort(),[['Fay Gladius','fate'],['Gus Gladius','damnatio']]);assert.ok(td.fallen[0].look,'faces kept');
  assert.deepStrictEqual(td.wins.map(w=>w.name),['Ann Gladius','Eve Gladius'],'most CF first');
  /* a dropped seat is still the lanista's match: Rejoin / Abandon until it ends */
  const hal=await client('hal'),ida=await client('ida');let D=await hal.req('lobby.create',{ev:'egidious',cry:false});await ida.req('lobby.join',{id:D.id});D=await hal.req('lobby.start',{id:D.id});
  await db.put('MATCH#'+D.id,'META',{...(await db.get('MATCH#'+D.id,'META')),away:{[ida.acct]:T-C.AWAY_MS-1}});await hal.req('match.drop',{id:D.id,seat:C.seatOf(D,ida.acct)});
  hl=await ida.req('hello',{all:1});assert.strictEqual(hl.live.id,D.id);assert.ok(hl.live.dropped,'a CPU holds the seat');await assert.rejects(ida.req('lobby.quick',{ev:'cassian'}),/still fighting/);
  await ida.req('match.abandon',{id:D.id});assert.ok(!(await ida.req('hello',{all:1})).live,'abandoned: free');
  /* tomorrow the board shows yesterday's until a new day has its own */
  T+=86400e3;td=(await dan.req('hello',{all:1})).today;assert.strictEqual(td.day,'yesterday');assert.strictEqual(td.wins[0].name,'Ann Gladius');
  T+=86400e3;td=(await dan.req('hello',{all:1})).today;assert.strictEqual(td.day,'today');assert.deepStrictEqual([td.wins.length,td.fallen.length,td.upsets.length],[0,0,0]);
  /* Find me a fight: two presses whose new rooms the (eventually consistent) room index cannot show yet still meet in one room */
  {const db2=store.memory();const lag={...db2,byIndex:async g=>g==='LOBBIES'?[]:db2.byIndex(g)};const sent2=[];const live2=new Set();
    const h2=makeHandler({db:lag,send:async(conn,msg)=>{if(!live2.has(conn))return true;sent2.push({conn,msg});return false},dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});let r2=0;
    const cl2=async name=>{const conn='q'+name;live2.add(conn);await h2({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER)}});
      const req=async(t,d)=>{T+=10;const id=++r2;await h2({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent2.find(x=>x.conn===conn&&x.msg.re===id);if(!m.msg.ok)throw new Error(m.msg.err);return m.msg.d};
      await req('auth.signin',{name});await req('domus.create',{name:'Domus '+name});await req('char.create',{name:name+' Gladius',cls:'hero'});return req};
    const qa=await cl2('qa'),qb=await cl2('qb'),qc=await cl2('qc');const [x1,x2]=await Promise.all([qa('lobby.quick',{ev:'cassian'}),qb('lobby.quick',{ev:'cassian'})]);
    assert.strictEqual(x1.lobby.id,x2.lobby.id,'one room through the pointer');const x3=await qc('lobby.quick',{ev:'cassian'});assert.strictEqual(x3.lobby.id,x1.lobby.id,'the next press finds it too');
    assert.strictEqual((await db2.get('LOBBY#'+x1.lobby.id,'LOBBY')).players.length,3)}
  /* the record stays small however big the faces are */
  const big={portrait:Object.fromEntries(Array.from({length:40},(_,i)=>['p'+i,'x'.repeat(40)])),token:Object.fromEntries(Array.from({length:30},(_,i)=>['t'+i,'y'.repeat(40)])),color:'#123456'};
  let DD={};for(let i=0;i<12;i++)DD=C.dayFromMatch(DD,{id:'M'+i,ev:'democritus',loc:1,at:i,seats:[{acct:'a'+i,ch:{name:'A'+i,cls:'hero',look:big},before:'tiro',row:{won:true,f:10+i}},{acct:'b'+i,ch:{name:'B'+i,cls:'hero',look:big},before:'summa',row:{won:false,f:1},out:{died:true}}]});
  assert.ok(JSON.stringify(DD).length<=C.DAY_MAX,'≤ DAY_MAX');assert.strictEqual(DD.wins.length,5);assert.strictEqual(DD.wins[0].cf,21);
}

/* ── v0.82 (protocol 5) through the real handler: the Domus, the coin rework, prices by AP, guests, invites that die with the room,
   the stands group turn ── */
async function v82(){
  const {makeHandler}=require('../src/index.js');
  let T=1900000000000;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});
  let nc=0,rid=0;const mark=()=>sent.length;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;e.reply=m.msg;throw e}return m.msg.d};
  const got=(conn,t,since=0)=>sent.slice(since).filter(x=>x.conn===conn&&x.msg.push===t).map(x=>x.msg.d);
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  const connect=async name=>{const conn='v'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);return conn};
  async function client(name,o={}){const cl={name,acct:'dev-'+name};cl.conn=await connect(name);cl.req=(t,d)=>ask(cl.conn,t,d);cl.got=(t,s)=>got(cl.conn,t,s);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});if(o.domus!==false)cl.domus=(await cl.req('domus.create',{name:o.domus||'Domus '+name})).domus;
    if(o.glad!==false&&o.domus!==false)cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:o.cls||'hero'});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const getD=id=>db.get('DOMUS#'+id,'DOMUS');
  /* old protocol: refused */
  {const r=await h({requestContext:{routeKey:'$connect',connectionId:'old'},queryStringParameters:{dev:'x',ver:'4'}});assert.strictEqual(r.statusCode,426,'protocol 4 clients reload');assert.ok(C.VER>=5)}

  /* ── 1. DOMUS ── */
  const lan=await client('lan',{domus:false,glad:false});let hl=await lan.req('hello',{all:1});assert.strictEqual(hl.needDomus,true);assert.strictEqual(hl.domus,null);
  await rejects(lan.req('char.create',{name:'Lan Gladius',cls:'hero'}),'need_domus',/Name your house/);await rejects(lan.req('lobby.create',{ev:'democritus'}),'need_domus');
  await rejects(lan.req('char.buy',{char:'x',item:'gladius'}),'need_domus');await rejects(lan.req('forum.say',{q:'ave'}),'need_domus');await lan.req('lobby.list',{});await lan.req('forum.get',{});
  await rejects(lan.req('domus.create',{name:'ab'}),'domus_name',/3–24/);await rejects(lan.req('domus.create',{name:'x'.repeat(25)}),'domus_name',/3–24/);
  await rejects(lan.req('domus.create',{name:'House of Shit'}),'domus_name',/another name/);await rejects(lan.req('domus.rename',{name:'Domus Prima'}),'need_domus');
  let dm=await lan.req('domus.create',{name:'  Domus   Aurea '});assert.strictEqual(dm.domus.name,'Domus Aurea');assert.strictEqual(dm.domus.bouts,0);assert.ok(dm.domus.founded);
  const mob=await client('mob',{domus:false,glad:false});await rejects(mob.req('domus.create',{name:'domus AUREA'}),'name_taken');
  dm=await lan.req('domus.rename',{name:'Domus Argentea'});assert.strictEqual(dm.domus.name,'Domus Argentea','renamed while it has no gladiators');
  await mob.req('domus.create',{name:'Domus Aurea'});await lan.req('domus.rename',{name:'domus argentea'});
  /* a new house while the current one never had a gladiator: the old one is archived and its name freed */
  const first=(await lan.req('domus.get',{})).domus;dm=await lan.req('domus.create',{name:'Domus Nova'});assert.notStrictEqual(dm.domus.id,first.id);
  let dg=await lan.req('domus.get',{});assert.strictEqual(dg.archived.length,1);assert.strictEqual(dg.archived[0].id,first.id);assert.ok((await getD(first.id)).archived);
  await mob.req('domus.rename',{name:'Domus Argentea'});
  const lc=await lan.req('char.create',{name:'Lan Gladius',cls:'hero'});assert.strictEqual(lc.domus,dm.domus.id,'the gladiator belongs to the house');
  dg=await lan.req('domus.get',{});assert.strictEqual(dg.glads,1);await rejects(lan.req('domus.rename',{name:'Domus Other'}),'domus_locked');await rejects(lan.req('domus.create',{name:'Domus Other'}),'domus_locked');
  hl=await lan.req('hello',{all:1});assert.strictEqual(hl.needDomus,false);assert.strictEqual(hl.domus.name,'Domus Nova');assert.strictEqual(hl.me.here.domus,'Domus Nova');
  /* four gladiators a house */
  for(const n of ['Two','Three','Four'])await lan.req('char.create',{name:'Lan '+n,cls:'slave'});await rejects(lan.req('char.create',{name:'Lan Five',cls:'slave'}),null,/Up to 4/);
  /* an account from before houses: its gladiators wait (no data lost), everything else waits for the name */
  const old=await client('old',{domus:false,glad:false});
  await db.put('CHAR#gold1','CHAR',{...C.newChar({name:'Old Faithful',cls:'soldier'},old.acct,'gold1',T-9e6),bouts:9,wins:3,survived:8,lifeCF:120,GSI1PK:'OWNER#'+old.acct,GSI1SK:T-9e6});
  await db.put('CHAR#gold2','CHAR',{...C.newChar({name:'Old Fallen',cls:'hero'},old.acct,'gold2',T-8e6),alive:false,bouts:4,wins:0,survived:3,lifeCF:40,GSI1PK:'OWNER#'+old.acct,GSI1SK:T-8e6});
  hl=await old.req('hello',{all:1});assert.strictEqual(hl.needDomus,true);assert.strictEqual(hl.chars.length,2,'the old gladiators are still there');
  await rejects(old.req('lobby.quick',{ev:'cassian'}),'need_domus');await rejects(old.req('lobby.join',{id:'x'}),'need_domus');await rejects(old.req('char.active',{char:'gold1'}),'need_domus');
  dm=await old.req('domus.create',{name:'Domus Vetus'});assert.strictEqual(dm.joined,2);assert.deepStrictEqual([dm.domus.bouts,dm.domus.wins,dm.domus.survived,dm.domus.fallen,dm.domus.lifeCF,dm.domus.glads],[13,3,11,1,160,2],'the record from its gladiators');
  assert.strictEqual((await getC('gold1')).domus,dm.domus.id);await rejects(old.req('domus.rename',{name:'Domus Nuova'}),'domus_locked');
  /* the house name rides beside the gladiator's: rooms, lists, who.list, the Forum, invites */
  const nan=await client('nan');let R0=await lan.req('lobby.create',{ev:'democritus',cry:false});assert.strictEqual(R0.players[0].domus,'Domus Nova');assert.strictEqual(R0.players[0].name,'Lan Gladius');
  const row=(await nan.req('hello',{all:1})).lobbies.find(x=>x.id===R0.id);assert.ok(row.lite);assert.strictEqual(row.players[0].domus,'Domus Nova');assert.strictEqual(row.members[0].domus,'Domus Nova');
  assert.strictEqual((await nan.req('who.list',{})).find(w=>w.id===lan.acct).domus,'Domus Nova');T+=C.RATE.forum;assert.strictEqual((await nan.req('forum.say',{q:'ave'})).line.domus,'Domus nan');
  /* the house keeps the record of a settled Ranked match; the coin rework pays the award only */
  await lan.req('lobby.leave',{id:R0.id});
  let RR=await lan.req('lobby.create',{ev:'cassian',ranked:true,cry:false});await nan.req('lobby.join',{id:RR.id});RR=await lan.req('lobby.start',{id:RR.id});
  const actL=(await lan.req('hello',{all:1})).active;await setC(actL,{streak:3,wallet:5});const w0=(await getC(nan.ch.id)).wallet;
  const rt=RR.players.map((p,i)=>({seat:i,won:p.id===lan.acct,place:p.id===lan.acct?1:2,f:p.id===lan.acct?30:7,coin:60,survives:true}));
  for(const x of [lan,nan])await x.req('match.result',{id:RR.id,table:rt,hash:'d'});
  const aw=Math.round(8*1.5*1.3*0.5);assert.strictEqual((await getC(actL)).wallet,5+aw-Math.round(aw*0.2),'Tiro win with a streak of 3, two lanistas: 8 ×1.5 ×1.3 ×0.5 (carried coin is never paid); v0.83: 20% to the treasury');assert.strictEqual((await getC(nan.ch.id)).wallet,w0+3,'Tiro survivor, two lanistas: 8 ×0.5, one to the treasury');
  assert.strictEqual((await getC(nan.ch.id)).glory,(7+12)*0.5,'Glory at the table factor: (7 CF + 12 survived) ×0.5');assert.strictEqual((await getC(actL)).glory,(30+12+8)*0.5,'a win adds 8');
  const hd=(await lan.req('domus.get',{})).domus;assert.deepStrictEqual([hd.bouts,hd.wins,hd.survived,hd.fallen,hd.lifeCF],[1,1,1,0,30],'the house record');
  /* Custom pays no coin */
  let CR=await lan.req('lobby.create',{ev:'egidious',cry:false});await nan.req('lobby.join',{id:CR.id});CR=await lan.req('lobby.start',{id:CR.id});const w1=(await getC(nan.ch.id)).wallet;
  const ct=CR.players.map((p,i)=>({seat:i,won:p.id===nan.acct,place:1,f:20,coin:50,survives:true}));for(const x of [lan,nan])await x.req('match.result',{id:CR.id,table:ct,hash:'c'});
  assert.strictEqual((await getC(nan.ch.id)).wallet,w1,'Custom: no coin, even for the winner');assert.strictEqual((await nan.req('domus.get',{})).domus.bouts,2,'but the house counts the bout');

  /* ── 2. the award table (ONLC) ── */
  const mk=(rank,o)=>({...C.newChar({name:'Tester',cls:'hero'},'x','t',0),rank,...o});
  const pay=(rank,row,ranked,o)=>C.applyResult(mk(rank,o),{place:1,f:10,coin:99,survives:true,...row},ranked).award; /* v0.83: award = the gladiator's pay + the treasury's cut */
  assert.deepStrictEqual(['tiro','gregarius','veteranus','primus','summa'].map(r=>C.awardOf(r,false,0)),[8,12,18,25,35]);
  assert.strictEqual(pay('tiro',{won:false},true),8);assert.strictEqual(pay('tiro',{won:true},true),12,'+50% for a win');
  assert.strictEqual(pay('gregarius',{won:true},true,{survived:6,lifeCF:90,streak:3}),Math.round(12*1.5*1.3),'the streak is kept');
  assert.strictEqual(pay('summa',{won:true},true,{survived:60,lifeCF:1200,streak:15}),Math.round(35*1.5*2),'the streak caps at +100%');
  assert.strictEqual(pay('primus',{won:true},false,{survived:35,lifeCF:650}),0,'Custom pays nothing');assert.strictEqual(pay('tiro',{won:false,survives:false},true),0,'the dead are not paid');
  assert.ok(!('PURSE' in C),'the old purse table is gone');
  /* ── 2b. GLORY, no demotion, the table-size factor, living counts by rank ── */
  assert.deepStrictEqual(C.RANKS.map(r=>r.glory),[0,90,180,550,1150,2100,3500,5500]);assert.deepStrictEqual([2,3,4,5].map(C.tableFactor),[0.5,0.75,1,1]);
  const gl=C.newChar({name:'Glory Seeker',cls:'hero'},'x','gs',0);assert.strictEqual(C.gloryOf(gl),0);assert.strictEqual(C.rankFor(gl).k,'tiro');
  let go=C.applyResult(gl,{won:true,place:1,f:40,survives:true},true,{humans:3});assert.strictEqual(go.award,Math.round(12*0.75),'Tiro win at three lanistas');assert.strictEqual(gl.glory,(40+12+8)*0.75);assert.strictEqual(go.glory,45);
  gl.glory=179.5;go=C.applyResult(gl,{won:false,place:2,f:0,survives:true},false,{humans:4});assert.strictEqual(gl.glory,179.5,'Custom with no CF adds nothing');assert.strictEqual(C.rankFor(gl).k,'novicius');
  go=C.applyResult(gl,{won:false,place:2,f:1,survives:true},false,{humans:2});assert.strictEqual(gl.glory,180);assert.strictEqual(go.rankUp,'gregarius');assert.strictEqual(gl.rankK,'gregarius');
  gl.glory=50;assert.strictEqual(C.rankFor(gl).k,'gregarius','never demoted');assert.strictEqual(C.rankProgress(gl),0);
  const og=C.newChar({name:'Old Timer',cls:'hero'},'x','ot',0);delete og.glory;delete og.rwins;delete og.rankK;Object.assign(og,{survived:20,lifeCF:300,wins:5,rank:'veteranus'});
  assert.strictEqual(C.gloryOf(og),300+240+40,'old gladiators start from their record');assert.strictEqual(C.rankByGlory(580).k,'veteranus');og.lifeCF=100;assert.strictEqual(C.rankFor(og).k,'veteranus','an old rank is kept when the new formula is lower');
  const fate=C.newChar({name:'Fated',cls:'hero'},'x','fa',0);const fo=C.applyResult(fate,{won:false,place:4,f:3,survives:false},true,{humans:2});assert.ok(fo.died,'the Fate applies in full');assert.strictEqual(fo.pay,0);
  const rc=(await nan.req('hello',{all:1})).rankCounts;assert.ok(rc&&Number.isInteger(rc.tiro)&&rc.tiro>=2&&'summa' in rc,'hello carries living counts by rank');
  assert.deepStrictEqual(Object.keys((await nan.req('world.news',{})).rankCounts),C.RANKS.map(r=>r.k));

  /* ── 3. PRICES by level (weapons) and by AP (armor) ── */
  const arm=Object.entries(catalog).filter(([k,v])=>v.kind==='a');assert.ok(arm.length>10&&arm.every(([k,v])=>Number.isInteger(v.ap)&&v.ap>0),'the catalog carries every armor piece’s AP');
  for(const [k,v] of Object.entries(catalog))assert.strictEqual(C.priceOf(v),v.kind==='w'?{1:60,2:250,3:750}[v.lv]:{1:15,2:55,3:150}[v.lv]*v.ap,k);
  assert.strictEqual(C.priceOf({kind:'a',lv:2,ap:4}),220);assert.strictEqual(C.priceOf({kind:'a',lv:3,ap:5}),750);
  const gal=catalog.galea;await setC(nan.ch.id,{wallet:C.priceOf(gal)-1});await rejects(nan.req('char.buy',{char:nan.ch.id,item:'galea'}),null,new RegExp('Costs '+C.priceOf(gal)+' coin'));
  await setC(nan.ch.id,{wallet:C.priceOf(gal)+60});let bc=await nan.req('char.buy',{char:nan.ch.id,item:'galea'});assert.strictEqual(bc.wallet,60);bc=await nan.req('char.buy',{char:nan.ch.id,item:'mace'});assert.strictEqual(bc.wallet,0,'a level-1 weapon costs 60');

  /* ── 3b. THE STOREROOM: move pieces between the house's gladiators and the house; tick to bring; locked in a match ── */
  const n2=await nan.req('char.create',{name:'Nan Secunda',cls:'slave'});
  let mv=await nan.req('domus.move',{item:'galea',from:nan.ch.id,to:n2.id});assert.ok(mv.to.gear.includes('galea')&&!mv.from.gear.includes('galea'),'moved to the second gladiator');
  mv=await nan.req('domus.move',{item:'galea',from:n2.id,to:'house'});assert.deepStrictEqual(mv.to.gear,['galea']);assert.deepStrictEqual((await nan.req('domus.get',{})).gear,['galea'],'the house keeps it');
  mv=await nan.req('domus.move',{item:'galea',from:'house',to:nan.ch.id});assert.ok(mv.to.gear.includes('galea'));
  const nD=(await nan.req('domus.get',{})).domus;const DD=await getD(nD.id);DD.gear=['cassis'];await db.put('DOMUS#'+nD.id,'DOMUS',DD);
  mv=await nan.req('domus.move',{item:'cassis',from:'house',to:n2.id});assert.ok(mv.to.gear.includes('cassis'),'v0.83: any rank carries (and brings) printed pieces of every level');await rejects(nan.req('domus.move',{item:'galea',from:n2.id,to:'house'}),null,/not there/);
  let eqc=await nan.req('domus.equip',{char:nan.ch.id,item:'galea',on:false});assert.ok(!C.equipOf(eqc).includes('galea')&&eqc.gear.includes('galea'),'untick: stays home');
  eqc=await nan.req('domus.equip',{char:nan.ch.id,item:'galea',on:true});assert.ok(C.equipOf(eqc).includes('galea'),'tick: brought');
  const actN=(await nan.req('hello',{all:1})).active;const SR=await nan.req('lobby.create',{ev:'democritus',cry:false});
  await rejects(nan.req('domus.move',{item:'galea',from:actN,to:'house'}),'in_match');await rejects(nan.req('domus.equip',{char:actN,item:'galea',on:false}),'in_match');
  assert.deepStrictEqual((await nan.req('domus.get',{})).busy,[actN],'the seated gladiator is busy');await nan.req('lobby.leave',{id:SR.id});

  /* ── 5. INVITES die with the room ── */
  const iv={};for(const n of ['iva','ivb','ivc','ivd','ive','ivf','ivg','ivh','ivi','ivj','ivk','ivl','ivm'])iv[n]=await client(n);
  const inviteAs=async(by,room,to)=>{T+=C.RATE.invGap;const m=mark();await by.req('lobby.invite',{id:room,to:to.acct});return to.got('lobby.invite',m)[0]};
  let IA=await iv.iva.req('lobby.create',{ev:'democritus',cry:false});const inv1=await inviteAs(iv.iva,IA.id,iv.ivb);assert.strictEqual(inv1.room,IA.id);assert.strictEqual(inv1.fromDomus,'Domus iva');
  assert.strictEqual((await db.query('INVITE#'+iv.ivb.acct,'R#')).length,1,'the invitation is kept');
  await rejects(iv.ivk.req('lobby.accept',{id:IA.id}),'no_invite');
  let m0=mark();IA=await iv.ivb.req('lobby.accept',{id:IA.id});assert.ok(C.seatOf(IA,iv.ivb.acct)>=0);assert.strictEqual(iv.ivb.got('invite.gone',m0).length,0,'the room you join is simply used');
  assert.strictEqual((await db.query('INVITE#'+iv.ivb.acct,'R#')).length,0);
  /* started: the invitation dies (live: you can watch) */
  await inviteAs(iv.iva,IA.id,iv.ivc);m0=mark();IA=await iv.iva.req('lobby.start',{id:IA.id});
  assert.deepStrictEqual(iv.ivc.got('invite.gone',m0),[{rooms:[IA.id],why:'started',live:true}]);
  let e=await rejects(iv.ivc.req('lobby.accept',{id:IA.id}),'room_gone',/started/);assert.strictEqual(e.reply.live,true);assert.strictEqual(e.reply.why,'started');
  /* filled: no free seat left */
  const IB=await iv.ivd.req('lobby.create',{ev:'egidious',cry:false});await inviteAs(iv.ivd,IB.id,iv.ive);await iv.ivf.req('lobby.join',{id:IB.id});await iv.ivg.req('lobby.join',{id:IB.id});
  m0=mark();await iv.ivh.req('lobby.join',{id:IB.id});assert.deepStrictEqual(iv.ive.got('invite.gone',m0),[{rooms:[IB.id],why:'full'}]);e=await rejects(iv.ive.req('lobby.join',{id:IB.id,inv:1}),'room_gone',/filled/);assert.ok(!e.reply.live);
  /* the inviter left (the room lives on under a new host) */
  const IC=await iv.ivi.req('lobby.create',{ev:'cassian',cry:false});await iv.ivj.req('lobby.join',{id:IC.id});await inviteAs(iv.ivi,IC.id,iv.ivk);
  m0=mark();await iv.ivi.req('lobby.leave',{id:IC.id});assert.deepStrictEqual(iv.ivk.got('invite.gone',m0),[{rooms:[IC.id],why:'left'}]);await rejects(iv.ivk.req('lobby.accept',{id:IC.id}),'room_gone',/left/);
  /* invited by two: one leaving keeps it alive */
  await iv.ivi.req('lobby.join',{id:IC.id});await inviteAs(iv.ivi,IC.id,iv.ivl);T+=C.RATE.invGap;await iv.ivj.req('lobby.invite',{id:IC.id,to:iv.ivl.acct});
  m0=mark();await iv.ivi.req('lobby.leave',{id:IC.id});assert.strictEqual(iv.ivl.got('invite.gone',m0).length,0,'another inviter is still there');
  /* closed: the last lanista leaves */
  const ID=await iv.ivm.req('lobby.create',{ev:'democritus',cry:false});await inviteAs(iv.ivm,ID.id,iv.ivf);m0=mark();await iv.ivm.req('lobby.leave',{id:ID.id});
  assert.deepStrictEqual(iv.ivf.got('invite.gone',m0),[{rooms:[ID.id],why:'closed'}]);await rejects(iv.ivf.req('lobby.accept',{id:ID.id}),'room_gone',/closed/);
  /* joining another room drops every pending invitation (ivl holds two: IC and IE) */
  const IE=await iv.ivm.req('lobby.create',{ev:'democritus',cry:false});await inviteAs(iv.ivm,IE.id,iv.ivl);assert.strictEqual((await db.query('INVITE#'+iv.ivl.acct,'R#')).length,3,'two invitations to IC, one to IE');
  m0=mark();await iv.ivl.req('lobby.create',{ev:'egidious',cry:false});
  const gone=iv.ivl.got('invite.gone',m0);assert.strictEqual(gone.length,1);assert.deepStrictEqual(gone[0].rooms.sort(),[IC.id,IE.id].sort());assert.strictEqual(gone[0].why,'joined');assert.strictEqual((await db.query('INVITE#'+iv.ivl.acct,'R#')).length,0);
  await rejects(iv.ivl.req('lobby.accept',{id:IE.id}),'no_invite');

  /* ── 6. THE STANDS GROUP TURN ── */
  const sa=await client('sta'),sb=await client('stb'),sc=await client('stc'),sd=await client('std');
  let SL=await sa.req('lobby.create',{ev:'democritus',cry:false});await sa.req('lobby.set',{id:SL.id,ticket:5});await sb.req('lobby.join',{id:SL.id});
  for(const x of [sc,sd]){await setC(x.ch.id,{wallet:20});await x.req('lobby.ticket',{id:SL.id})}SL=await sa.req('lobby.start',{id:SL.id});await sa.req('match.open',{id:SL.id,snap:{S:'{}'}});
  const MS=await db.get('MATCH#'+SL.id,'META');assert.deepStrictEqual([MS.seats[sc.acct],MS.seats[sd.acct]],[4,5]);
  await rejects(sb.req('match.stands.open',{id:SL.id,rot:1}),null,/Only the host/);
  m0=mark();const op=await sa.req('match.stands.open',{id:SL.id,rot:1});assert.deepStrictEqual(op.holders,[4,5]);assert.strictEqual(op.until,T+C.STANDS_MS);
  assert.deepStrictEqual(sc.got('stands.window',m0).map(w=>[w.rot,w.seat,w.until]),[[1,4,op.until]]);assert.deepStrictEqual(sd.got('stands.window',m0).map(w=>[w.rot,w.seat]),[[1,5]]);
  assert.strictEqual(sa.got('stands.window',m0).length+sb.got('stands.window',m0).length,0,'only ticket holders get the window');
  await rejects(sa.req('match.stands.open',{id:SL.id,rot:1}),'stands_twice');await rejects(sb.req('match.stands.pick',{id:SL.id,rot:1,pick:{a:'pass'}}),null,/Only ticket holders|you can watch, not throw/);
  await rejects(sc.req('match.stands.pick',{id:SL.id,rot:1,pick:{a:'stone'}}),null,/Throw at a tile/);await rejects(sc.req('match.stands.pick',{id:SL.id,rot:1,pick:{a:'fireball'}}),null,/No such action/);
  m0=mark();let pk=await sc.req('match.stands.pick',{id:SL.id,rot:1,pick:{a:'stone',r:3,c:4,junk:{x:1}}});assert.ok(pk.ok&&!pk.closed);
  assert.ok(!sent.slice(m0).some(x=>x.msg.push),'a pick is private: nothing is pushed');await rejects(sc.req('match.stands.pick',{id:SL.id,rot:1,pick:{a:'pass'}}),'stands_twice');
  m0=mark();pk=await sd.req('match.stands.pick',{id:SL.id,rot:1,pick:{a:'offer',r:5,c:6}});assert.ok(pk.closed,'everyone answered: the window closes');
  for(const x of [sa,sb,sc]){const ins=x.got('match.input',m0).map(u=>u.in);assert.strictEqual(ins.length,1,x.name);assert.strictEqual(ins[0].k,'stands.result');assert.strictEqual(ins[0].from,'server');
    assert.deepStrictEqual(ins[0].picks,[{seat:4,pick:{a:'stone',r:3,c:4}},{seat:5,pick:{a:'offer',r:5,c:6}}],'tiles locked in the pick');assert.deepStrictEqual(ins[0].missed,[])}
  await rejects(sc.req('match.stands.pick',{id:SL.id,rot:1,pick:{a:'pass'}}),'stands_closed');
  /* rotation 2: one answers; a fighter may not close early; the host closes; the missed seat is named; closing twice adds nothing */
  await sa.req('match.stands.open',{id:SL.id,rot:2});await sc.req('match.stands.pick',{id:SL.id,rot:2,pick:{a:'pass'}});
  await rejects(sb.req('match.stands.close',{id:SL.id,rot:2}),null,/still choosing/);await rejects(sc.req('match.stands.close',{id:SL.id,rot:2}),null,/Only the host/);
  m0=mark();const cl=await sa.req('match.stands.close',{id:SL.id,rot:2});assert.ok(cl.closed);const r2=sb.got('match.input',m0)[0].in;assert.deepStrictEqual([r2.picks,r2.missed],[[{seat:4,pick:{a:'pass'}}],[5]]);
  assert.deepStrictEqual(await sa.req('match.stands.close',{id:SL.id,rot:2}),{closed:false});
  const sins=(await sa.req('match.get',{id:SL.id,from:0})).inputs.filter(x=>x.k==='stands.result');assert.deepStrictEqual(sins.map(x=>x.rot),[1,2],'one result input a rotation, in the ordered stream');
  /* rotation 3: nobody answers; after 25 s any fighter may close */
  await sa.req('match.stands.open',{id:SL.id,rot:3});T+=C.STANDS_MS+5000;assert.ok((await sb.req('match.stands.close',{id:SL.id,rot:3})).closed);
  /* a speared ticket holder: the fighters report it; a strict majority → the ticket price back once (stands.refund) */
  await rejects(sc.req('match.speared',{id:SL.id,seat:4}),null,/Only the fighters/);await rejects(sa.req('match.speared',{id:SL.id,seat:1}),null,/No ticket holder/);
  const wSc=(await getC(sc.ch.id)).wallet;let sp=await sa.req('match.speared',{id:SL.id,seat:4});assert.deepStrictEqual(sp,{votes:1,need:2,refunded:0});
  sp=await sa.req('match.speared',{id:SL.id,seat:4});assert.strictEqual(sp.votes,1,'one vote a fighter');
  m0=mark();sp=await sb.req('match.speared',{id:SL.id,seat:4});assert.strictEqual(sp.refunded,5);assert.deepStrictEqual(sc.got('stands.refund',m0),[{id:SL.id,seat:4,amt:5}]);
  assert.strictEqual((await getC(sc.ch.id)).wallet,wSc+5,'the price back');const LP=await db.get('LOBBY#'+SL.id,'LOBBY');assert.strictEqual(LP.pot,5);assert.strictEqual(LP.stands.find(x=>x.id===sc.acct).paid,0);
  sp=await sa.req('match.speared',{id:SL.id,seat:4});assert.strictEqual(sp.refunded,0,'refunded once');assert.strictEqual((await getC(sc.ch.id)).wallet,wSc+5);
  /* stands off, or nobody in them: no window */
  const sx=await client('stx'),sy=await client('sty');let SO=await sx.req('lobby.create',{ev:'egidious',cry:false,standsOff:true});await sy.req('lobby.join',{id:SO.id});SO=await sx.req('lobby.start',{id:SO.id});
  await rejects(sx.req('match.stands.open',{id:SO.id,rot:1}),'no_stands');

  /* ── 7. STANDS FOR THE POOR: free seats, Flavius's guest pass (+1 house Fame), the house + patron look on stands entries ── */
  const fa=await client('fra'),fb=await client('frb'),fc=await client('frc'),fd=await client('frd'),fe=await client('fre'),ff=await client('frf');
  /* the patron look: cleaned (plain short values), kept on the house, null = the generated default */
  await rejects(fc.req('domus.patron',{look:'pileus'}),null,/Not a look/);await rejects(fc.req('domus.patron',{look:{a:'x'.repeat(5000)}}),null,/too large/);
  let pt=await fc.req('domus.patron',{look:{skin:'#c58c5c',hat:'pileus',beard:true,c1:'#7a2230',evil:'<b>x</b>',junk:{x:1},'bad key':1}});
  assert.deepStrictEqual(pt.domus.patron,{skin:'#c58c5c',hat:'pileus',beard:true,c1:'#7a2230',evil:'bx/b'},'the patron is cleaned');
  assert.ok(!('patron' in (await fc.req('domus.patron',{look:null})).domus),'null: back to the default');pt=await fc.req('domus.patron',{look:{skin:'#c58c5c',hat:'pileus',c1:'#7a2230'}});
  assert.deepStrictEqual((await fc.req('domus.get',{})).domus.patron,{skin:'#c58c5c',hat:'pileus',c1:'#7a2230'});assert.strictEqual((await fc.req('hello',{all:1})).domus.patron.hat,'pileus','hello carries it');
  /* free seats: 0 = no tickets until the host says free */
  let FL=await fa.req('lobby.create',{ev:'democritus',cry:false});assert.strictEqual(FL.free,false);await rejects(fc.req('lobby.ticket',{id:FL.id}),null,/sells no tickets/);
  await rejects(fb.req('lobby.set',{id:FL.id,free:1}),null,/Only the host/);FL=await fa.req('lobby.set',{id:FL.id,free:1});assert.deepStrictEqual([FL.free,FL.ticket],[true,0]);
  await setC(fc.ch.id,{wallet:0});let ft=await fc.req('lobby.ticket',{id:FL.id});const tc=ft.lobby.stands.find(x=>x.id===fc.acct);
  assert.deepStrictEqual([tc.paid,tc.free,tc.domus,tc.name],[0,1,'Domus frc','Frc Gladius'],'a free seat');assert.deepStrictEqual(tc.patron,{skin:'#c58c5c',hat:'pileus',c1:'#7a2230'},'the patron rides on the entry');
  assert.strictEqual(ft.char.wallet,0);assert.strictEqual(ft.lobby.pot,0);
  const lrow=(await ff.req('lobby.list',{})).find(x=>x.id===FL.id);assert.ok(lrow.lite&&lrow.free);assert.deepStrictEqual(lrow.stands,[{id:fc.acct,name:'Frc Gladius',domus:'Domus frc'}],'lists: the house, no look');
  /* the guest pass: a thin purse, once a day a house, a room selling seats */
  await setC(fd.ch.id,{wallet:15});await rejects(fd.req('lobby.pass',{id:FL.id}),null,/thin purses — under 15/);await setC(fd.ch.id,{wallet:3});
  const SO2=await fb.req('lobby.create',{ev:'egidious',cry:false,standsOff:true});await rejects(fd.req('lobby.pass',{id:SO2.id}),null,/sells no tickets/);
  const NT=await ff.req('lobby.create',{ev:'cassian',cry:false});await rejects(fd.req('lobby.pass',{id:NT.id}),null,/sells no tickets/,'no tickets, no pass');
  await rejects(ff.req('lobby.pass',{id:FL.id}),null,/thin purses|Leave your room/);await fb.req('lobby.leave',{id:SO2.id});await ff.req('lobby.leave',{id:NT.id});
  const day=C.dayKey(T);let ps=await fd.req('lobby.pass',{id:FL.id});const td=ps.lobby.stands.find(x=>x.id===fd.acct);
  assert.deepStrictEqual([td.paid,td.pass,td.domus],[0,1,'Domus frd'],'a pass seat');assert.strictEqual(ps.domus.passDay,day);assert.strictEqual(ps.char.wallet,3,'the pass costs nothing');
  assert.ok(await db.get('DOMUS#'+ps.domus.id,'PASS#'+day),'the day’s marker');
  const FL2=await fb.req('lobby.create',{ev:'egidious',cry:false,ticket:2});await fb.req('lobby.leave',{id:FL2.id});
  /* a price again: free ends; a paying ticket carries its house; a pass in a priced room is still free */
  FL=await fa.req('lobby.set',{id:FL.id,ticket:5});assert.deepStrictEqual([FL.free,FL.ticket],[false,5]);await setC(ff.ch.id,{wallet:10});ft=await ff.req('lobby.ticket',{id:FL.id});
  assert.deepStrictEqual((({paid,domus,free})=>[paid,domus,free])(ft.lobby.stands.find(x=>x.id===ff.acct)),[5,'Domus frf',undefined]);assert.strictEqual(ft.char.wallet,5);
  await setC(fe.ch.id,{wallet:0});await fe.req('lobby.pass',{id:FL.id});
  {const R2=await fb.req('lobby.create',{ev:'cassian',cry:false,ticket:1});await rejects(fd.req('lobby.pass',{id:R2.id}),null,/One guest pass a day/);await fb.req('lobby.leave',{id:R2.id})}
  FL=await fa.req('lobby.set',{id:FL.id,ticket:0});assert.deepStrictEqual([FL.free,FL.ticket],[false,0],'none: no more seats sold');FL=await fa.req('lobby.set',{id:FL.id,free:1,standsOff:true});assert.deepStrictEqual([FL.free,FL.ticket],[false,0],'stands off ends free');
  FL=await fa.req('lobby.set',{id:FL.id,standsOff:false,free:1});assert.strictEqual(FL.free,true);
  /* the horns; fe leaves the stands early; the result settles: fd's house +1 Fame, nobody else's */
  await fb.req('lobby.join',{id:FL.id});FL=await fa.req('lobby.start',{id:FL.id});assert.strictEqual(FL.stands.length,4);
  const MF=await db.get('MATCH#'+FL.id,'META');assert.deepStrictEqual(MF.specs.sort(),[fc.acct,fd.acct,fe.acct,ff.acct].sort());
  const wt2=await fe.req('match.watch',{id:FL.id});assert.ok(wt2.lobby.stands.find(x=>x.id===fc.acct).patron,'watchers get the patrons');
  await fe.req('match.unwatch',{id:FL.id});assert.ok((await db.get('MATCH#'+FL.id,'META')).left[fe.acct],'left the stands');
  const ftb=FL.players.map((p,i)=>({seat:i,won:i===0,place:i+1,f:5,coin:0,survives:true}));for(const x of [fa,fb])await x.req('match.result',{id:FL.id,table:ftb,hash:'f'});
  const fameOf=async x=>(await x.req('domus.get',{})).domus.fame;
  assert.deepStrictEqual([await fameOf(fd),await fameOf(fe),await fameOf(fc),await fameOf(ff)],[1,0,0,0],'only the pass sat through earns Fame');
  assert.strictEqual((await db.get('LOBBY#'+FL.id,'LOBBY')).stands.find(x=>x.id===fd.acct).fame,1);assert.strictEqual((await fd.req('hello',{all:1})).domus.fame,1,'hello shows the Fame');
  /* the next UTC day: a new pass; away for AWAY_MS at the end → no Fame */
  T+=86400e3;await setC(fd.ch.id,{wallet:3});let FM=await fa.req('lobby.create',{ev:'democritus',cry:false,free:1});assert.strictEqual(FM.free,true,'free at creation');
  await fd.req('lobby.pass',{id:FM.id});await fb.req('lobby.join',{id:FM.id});FM=await fa.req('lobby.start',{id:FM.id});await db.set('MATCH#'+FM.id,'META',{away:{[fd.acct]:T-C.AWAY_MS-1}});
  for(const x of [fa,fb])await x.req('match.result',{id:FM.id,table:FM.players.map((p,i)=>({seat:i,won:i===0,place:i+1,f:5,coin:0,survives:true})),hash:'g'});
  assert.strictEqual(await fameOf(fd),1,'away at the end: no Fame');

  /* ── 8. rankCounts: seeded ONCE from a scan of the living (gladiators made before the counters), then counted ── */
  const scanCount=async()=>{const o={};for(const R of C.RANKS)o[R.k]=0;for(const c of await db.scan('CHAR#','CHAR'))if(c.alive)o[C.rankFor(c).k]++;return o};
  await db.put('WORLD','COUNTS',{tiro:1});await db.put('CHAR#pre1','CHAR',{...C.newChar({name:'Pre Deploy',cls:'hero'},old.acct,'pre1',T),glory:600,rank:'veteranus',rankK:'veteranus',GSI1PK:'OWNER#zz',GSI1SK:T});
  const want=await scanCount();assert.ok(want.veteranus>=1&&want.tiro>5);assert.deepStrictEqual((await fa.req('hello',{all:1})).rankCounts,want,'seeded from the scan');assert.ok((await db.get('WORLD','COUNTS')).seeded);
  await db.put('CHAR#pre2','CHAR',{...C.newChar({name:'Pre Two',cls:'hero'},old.acct,'pre2',T),GSI1PK:'OWNER#zz',GSI1SK:T});
  assert.deepStrictEqual((await fa.req('world.news',{})).rankCounts,want,'seeded once: no second scan');
  assert.strictEqual(await db.putUnless('WORLD','COUNTS',{tiro:0},'seeded'),false,'the conditional write keeps the first seeding');
  await db.del('WORLD','COUNTS');await fa.req('hello',{all:1});await mob.req('char.create',{name:'Mob Gladius',cls:'hero'});
  const w2=await scanCount();assert.deepStrictEqual((await fa.req('hello',{all:1})).rankCounts,w2,'a missing item seeds again, then the counters follow');

  /* ── 4. GUESTS ── */
  const gconn=async gid=>{const conn='g'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{guest:gid,ver:String(C.VER)}});return {conn,status:r.statusCode,body:r.body}};
  const G1=await gconn('guestone1');assert.strictEqual(G1.status,200);assert.strictEqual((await gconn('short')).status,401,'a guest id needs 8+ letters');
  const g=(t,d)=>ask(G1.conn,t,d);const ga=await g('auth.guest',{tz:'Asia/Tokyo'});assert.strictEqual(ga.guest,true);assert.strictEqual(ga.id,'guest-guestone1');assert.strictEqual(ga.until,ga.first+C.GUEST_MS);
  const gh=await g('hello',{all:1});assert.strictEqual(gh.me,null);assert.strictEqual(gh.guest.id,'guest-guestone1');assert.ok(gh.lobbies.length&&gh.lobbies.every(x=>x.lite));assert.ok(gh.forum.length>0,'guests read the Forum');assert.ok(gh.today);
  assert.strictEqual(gh.here.guests,1);assert.deepStrictEqual(gh.here.gzones,{'Asia/Tokyo':1});const signedHere=(await nan.req('hello',{all:1})).here;assert.strictEqual(signedHere.guests,1,'lanistas see the guest count too');assert.strictEqual(signedHere.n,gh.here.n,'guests are not lanistas');
  assert.strictEqual(signedHere.zones['Asia/Tokyo'],undefined,'guests glow apart');
  await g('lobby.list',{});await g('forum.get',{});await g('hall.list',{});assert.strictEqual((await g('world.news',{})).guests,1);
  await rejects(g('forum.say',{q:'ave'}),'guest',/Sign in to speak in the Forum/);await rejects(g('lobby.create',{ev:'democritus'}),'guest',/Sign in to play/);await rejects(g('lobby.join',{id:'x'}),'guest');
  await rejects(g('char.create',{name:'Ghost',cls:'hero'}),'guest');await rejects(g('bet.place',{id:'x',seat:0,amt:1}),'guest',/wager/);await rejects(g('domus.create',{name:'Domus Umbra'}),'guest');await rejects(g('lobby.ticket',{id:'x'}),'guest');
  await rejects(g('match.input',{id:SL.id,in:{k:'act',seat:0}}),'guest');await rejects(g('match.stands.pick',{id:SL.id,rot:4,pick:{a:'pass'}}),'guest');await rejects(g('match.say',{id:SL.id,q:'ha'}),'guest');
  /* a guest watches a live match and hears its moves */
  const wt=await g('match.watch',{id:SL.id});assert.ok(wt.players.includes(sa.acct));m0=mark();await sa.req('match.input',{id:SL.id,in:{k:'act',a:'end',seat:0}});assert.strictEqual(got(G1.conn,'match.input',m0).length,1,'the guest hears the move');
  await g('match.get',{id:SL.id,from:0});await g('match.unwatch',{id:SL.id});m0=mark();await sa.req('match.input',{id:SL.id,in:{k:'act',a:'end',seat:0}});assert.strictEqual(got(G1.conn,'match.input',m0).length,0);
  /* a second guest; one leaves; the map counts the rest */
  const G2=await gconn('guesttwo2');await ask(G2.conn,'auth.guest',{tz:'Europe/Rome'});assert.deepStrictEqual((await g('hello',{})).here.gzones,{'Asia/Tokyo':1,'Europe/Rome':1});
  live.delete(G2.conn);await h({requestContext:{routeKey:'$disconnect',connectionId:G2.conn}});assert.strictEqual((await g('hello',{})).here.guests,1,'a closed guest socket leaves the map');
  /* two hours from the first connect: refused, also on a new socket with the same guest id; another id is fresh */
  T=ga.first+C.GUEST_MS+1000;await rejects(g('hello',{}),'guest_expired',/two hours/);await rejects(g('lobby.list',{}),'guest_expired');
  const G3=await gconn('guestone1');assert.strictEqual(G3.status,403,'the same guest cannot reconnect for more time');assert.match(G3.body,/sign in/);
  const G4=await gconn('guestfour4');assert.strictEqual(G4.status,200);assert.strictEqual((await ask(G4.conn,'hello',{})).here.guests,1,'the expired guest is not counted');
}
