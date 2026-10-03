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
  /* inputs get one server order */
  const s0=await route('match.input',{id:L.id,in:{k:'act',a:'coin',seat:0}},A);const s1=await route('match.input',{id:L.id,in:{k:'act',a:'end',seat:0}},A);const s2=await route('match.input',{id:L.id,in:{k:'tile',r:3,c:4,seat:1}},B);
  assert.deepStrictEqual([s0.seq,s1.seq,s2.seq],[0,1,2]);const g=await route('match.get',{id:L.id,from:1},B);assert.deepStrictEqual(g.inputs.map(x=>x.seq),[1,2]);assert.ok(g.open);
  assert.ok(pushed.some(([a,ty])=>a==='dev-b'&&ty==='match.input'),'inputs are pushed to the other player');
  /* results: B wins and survives, A dies at Tiro (forgotten); B's wager pays out */
  const ra=await route('match.result',{id:L.id,char:ca.id,seat:0,row:{won:false,place:2,f:6,coin:4,survives:false},hash:'h1'},A);assert.ok(ra.out.died);assert.ok(!ra.out.hall);
  const rb=await route('match.result',{id:L.id,char:cb.id,seat:1,row:{won:true,place:1,f:40,coin:12,survives:true},hash:'h1'},B);
  assert.ok(!rb.out.died);assert.strictEqual(rb.char.survived,1);assert.strictEqual(rb.char.streak,1);assert.strictEqual(rb.char.stats.spd+rb.char.stats.str+rb.char.stats.int+rb.char.stats.lck+rb.char.stats.cha,275+2,'+1 survived, +1 won');
  assert.strictEqual(rb.char.wallet,30+(10+6)+10,'purse + half the coin kept + the whole pool back (only bettor, no cut on a sole winner… 5% cut of 10 rounds to 0)');
  assert.strictEqual((await route('hall.list',{},A)).length,0,'a fallen Tiro is forgotten');
  const done=await db.get('LOBBY#'+L.id,'LOBBY');assert.strictEqual(done.status,'done');
  /* a Veteranus who falls is remembered */
  const v=C.newChar({name:'Old Crixus',cls:'veteranus'},'dev-a','gv',t);v.survived=20;v.lifeCF=320;v.rank='veteranus';const o=C.applyResult(v,{won:false,place:3,f:10,survives:false},true);assert.ok(o.hall);
  /* JWT: a token signed by the pool's key passes; a forged one does not */
  const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});const jwk={...publicKey.export({format:'jwk'}),kid:'k1',alg:'RS256'};
  const enc=o=>Buffer.from(JSON.stringify(o)).toString('base64url');const mk=(body,key=privateKey)=>{const h=enc({alg:'RS256',kid:'k1'}),b=enc(body);return h+'.'+b+'.'+crypto.sign('RSA-SHA256',Buffer.from(h+'.'+b),key).toString('base64url')};
  const cfg={region:'us-east-1',poolId:'us-east-1_X',clientId:'cli'};const body={iss:'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_X',aud:'cli',token_use:'id',sub:'abc',exp:Math.floor(Date.now()/1000)+600,name:'Virgilante'};
  assert.strictEqual((await verify(mk(body),cfg,async()=>[jwk])).sub,'abc');
  await assert.rejects(verify(mk(body,crypto.generateKeyPairSync('rsa',{modulusLength:2048}).privateKey),cfg,async()=>[jwk]),/Bad signature/);
  await assert.rejects(verify(mk({...body,aud:'other'}),cfg,async()=>[jwk]),/Wrong audience/);
  console.log('server routes: all checks passed')})().catch(e=>{console.error(e);process.exit(1)});
