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
  await assert.rejects(route('char.create',{name:'Second',cls:'hero'},A),/One living gladiator/);
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
  let chA=(await route('char.mine',{},A)).find(c=>c.alive);chA.wallet=20;await db.put('CHAR#'+chA.id,'CHAR',{...chA,GSI1PK:'OWNER#dev-a',GSI1SK:chA.born});
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
  /* JWT: a token signed by the pool's key passes; a forged one does not */
  const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});const jwk={...publicKey.export({format:'jwk'}),kid:'k1',alg:'RS256'};
  const enc=o=>Buffer.from(JSON.stringify(o)).toString('base64url');const mk=(body,key=privateKey)=>{const h=enc({alg:'RS256',kid:'k1'}),b=enc(body);return h+'.'+b+'.'+crypto.sign('RSA-SHA256',Buffer.from(h+'.'+b),key).toString('base64url')};
  const cfg={region:'us-east-1',poolId:'us-east-1_X',clientId:'cli'};const body={iss:'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_X',aud:'cli',token_use:'id',sub:'abc',exp:Math.floor(Date.now()/1000)+600,name:'Virgilante'};
  assert.strictEqual((await verify(mk(body),cfg,async()=>[jwk])).sub,'abc');
  await assert.rejects(verify(mk(body,crypto.generateKeyPairSync('rsa',{modulusLength:2048}).privateKey),cfg,async()=>[jwk]),/Bad signature/);
  await assert.rejects(verify(mk({...body,aud:'other'}),cfg,async()=>[jwk]),/Wrong audience/);
  console.log('server routes: all checks passed')})().catch(e=>{console.error(e);process.exit(1)});
