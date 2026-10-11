/* v1.0 SERVER BATCH A (routes.js "v1.0 SERVER BATCH A", the "v1.0 SERVER BATCH A" section of onlcore): Domus slots bought with Glory + coin
   (one at the start, pre-v1.0 houses keep four, a replayed request pays once, the 5th slot after the four), the Issued kit (one set a house,
   refilled once a day, worth nothing: never repaired, sold or looted, gone with the dead), Ranked kits = what he wears, online wagers closed
   (code wager_off + a text code), watchers not counted as fighters, goofy taunts, and the security pass (fighters-only strikes, no stalling a
   turn clock, far-ahead turn reports need a second lanista, short ids only, domus.equip for the living). node server/test/v100a.test.js */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');const catalog=require('../src/catalog.json');

function units(){
  assert.strictEqual(C.SLOT100.start,1);assert.deepStrictEqual(C.SLOT100.steps.map(s=>[s.n,s.glory,s.coin]),[[2,150,200],[3,600,500],[4,1500,1000]],'his numbers');
  const D=C.newDomus('Domus Nova','o','D1',1);assert.strictEqual(D.slots100,1,'a new house: one slot');assert.strictEqual(C.gladMax(D),1);
  assert.strictEqual(C.gladMax({id:'old'}),4,'a house from before v1.0 keeps four');assert.strictEqual(C.domusRow({id:'old',name:'Old',owner:'o'}).gmax,4);
  assert.match(C.slotWhy100(D,100),/opens at 150 Glory — your house has 100/);assert.match(C.slotWhy100({...D,treasury:10},150),/treasury needs 200/);
  const D2={...D,treasury:250};C.slotBuy100(D2,160,5);assert.ok(D2.slots100===2&&D2.treasury===50&&C.gladMax(D2)===2,'slot 2 bought');assert.strictEqual(D2.led89.out.upg,200,'the ledger');
  assert.match(C.upgWhy({...D2,treasury:5000},'slot5'),/no longer sold/);assert.match(C.upgWhy({id:'old',treasury:5000},'slot5'),/no longer sold/,'nobody buys the fifth');assert.strictEqual(C.gladMax({id:'old',upg89:{slot5:1}}),5,'an old fifth slot stays');
  /* the Issued kit */
  const ch=C.newChar({name:'Issa',cls:'amazonia'},'o','g1',1);ch.gear=[];ch.equip=[];const p=C.issuePlan100(ch,catalog);
  assert.deepStrictEqual(p.buy,[...C.DAILY92,'mace'],'padding + the Level 1 stand-in for the axe');assert.ok(p.buy.every(b=>catalog[b]&&(catalog[b].kind==='a'||catalog[b].lv===1)),'Level 1 weapons only');
  for(const [cls,ws] of Object.entries(C.ISSUE_W100))for(const w of ws)assert.ok(catalog[w]&&catalog[w].kind==='w'&&catalog[w].lv===1,cls+': '+w+' is a Level 1 weapon');
  ch.gear=['gladius'];ch.equip=['gladius'];assert.ok(!C.issuePlan100(ch,catalog).buy.includes('mace'),'his own weapon in hand: no issued weapon');
  const I=C.pieceInfo({item:'galea#u1',pc:{st:'whole',iss:1}},catalog);assert.ok(I.iss&&I.val===0&&C.usedPrice(I)===0&&C.repairCost(I)===0,'worth nothing');
  const dead=C.newChar({name:'Gone',cls:'slave'},'o','g2',1);dead.gear=['galea#u2','wraps'];dead.pcs={u2:{st:'whole',iss:1}};dead.equip=[];
  const gx=C.gearAfter(dead,{gear:[],items:[]},{survives:false},true);assert.deepStrictEqual(gx.left.map(P=>P.item),['wraps'],'the dead man’s Issued piece left at home vanishes');assert.ok(gx.vanish.includes('galea'));
  /* wagers, taunts, kits, watchers */
  assert.match(C.betOK({status:'waiting'},'a',0,5,100),/closed/);
  for(const [sc,k] of [['room','lions'],['match','tickle'],['match','granny'],['after','bigger']])assert.ok(C.phraseOK(sc,k)&&C.QC_TEXT[k],'taunt '+k);
  const hs=C.hereSummary([{id:'f',match:'M'},{id:'t',match:'M'},{id:'i'}],[{id:'M',status:'live',players:[{id:'f'}],stands:[{id:'t'}]}],[]);assert.ok(hs.fight===1&&hs.watch===1,'a ticket holder is watching, not fighting: '+JSON.stringify(hs));
  const maps=C.whoMaps100([{id:'M',status:'live',players:[{id:'f',name:'F'}],stands:[{id:'t'}]},{id:'R',status:'waiting',members:[{id:'h'}],players:[{id:'h'}],stands:[{id:'s'}]}],10);
  assert.deepStrictEqual([C.whoStatus100({id:'f'},maps).st,C.whoStatus100({id:'t'},maps).st,C.whoStatus100({id:'s'},maps).st],['fight','watch','room'],'who’s online: the ticket holder watches');
  console.log('v1.0 server batch A units: all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=Date.UTC(2026,9,12,12);const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{}});let nc=0,mid=0;
  const raw=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);return m.msg};
  const ask=async(conn,t,d)=>{const m=await raw(conn,t,d);if(!m.ok){const e=new Error(m.err);e.code=m.code;e.reply=m;throw e}return m.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const getD=async cl=>{const A=await db.get('ACCT#'+cl.acct,'PROFILE');return db.get('DOMUS#'+A.domus,'DOMUS')};const setD=async(cl,f)=>{const D=await getD(cl);Object.assign(D,f);await db.put('DOMUS#'+D.id,'DOMUS',D)};
  const ann=await client('ann','amazonia'),bob=await client('bob','slave'),cat=await client('cat','soldier');

  /* ── 5 · DOMUS SLOTS ── */
  let D=await getD(ann);assert.strictEqual(D.slots100,1,'a new house opens with one slot');
  await rejects(ann.req('char.create',{name:'Ann Two',cls:'hero'}),'slot_full',/open slot 2 in the Domus \(150 Glory \+ 200 coin\)/);
  await rejects(ann.req('domus.slot',{}),'slot_locked',/opens at 150 Glory/);
  await setC(ann.ch.id,{glory:170});await setD(ann,{treasury:150});await rejects(ann.req('domus.slot',{}),'no_coin',/treasury needs 200/);
  await setD(ann,{treasury:260});const r1=await ann.req('domus.slot',{rid:'slotrid100a'});assert.ok(r1.slot===2&&r1.cost===200&&r1.domus.gmax===2&&r1.domus.slots100===2,'slot 2 opens: '+JSON.stringify(r1));
  const r1b=await ann.req('domus.slot',{rid:'slotrid100a'});assert.strictEqual(r1b.slot,2,'a replay gets the stored reply');assert.strictEqual((await getD(ann)).treasury,60,'paid once');
  assert.deepStrictEqual(r1.domus.slotNext100,{n:3,glory:600,coin:500},'the next step rides on the house row');
  const a2=await ann.req('char.create',{name:'Ann Two',cls:'hero'});assert.ok(a2&&a2.alive,'the second gladiator');
  await rejects(ann.req('domus.upgrade',{k:'slot5'}),null,/no longer sold/);
  /* a house from before v1.0 (no slots100) keeps one slot per LIVING gladiator, once, on first touch */
  const unslot=async cl=>{const X=await getD(cl);delete X.slots100;await db.put('DOMUS#'+X.id,'DOMUS',X)};
  await setD(cat,{slots100:4});const cc2=await cat.req('char.create',{name:'Cat Two',cls:'hero'});const cc3=await cat.req('char.create',{name:'Cat Three',cls:'hero'});await setC(cc3.id,{alive:false});await unslot(cat);
  {const r=(await cat.req('domus.get',{})).domus;assert.ok(r.gmax===2&&r.slots100===2,'2 living + 1 fallen: 2 open slots '+JSON.stringify([r.gmax,r.slots100]));assert.deepStrictEqual(r.slotNext100,{n:3,glory:600,coin:500},'slot 3 is locked with its price');
    assert.strictEqual((await getD(cat)).slots100,2,'stored once on the house');}
  await rejects(cat.req('char.create',{name:'Cat Four',cls:'hero'}),'slot_full',/open slot 3 in the Domus/);
  await setC(cc2.id,{alive:false});assert.strictEqual((await cat.req('domus.get',{})).domus.gmax,2,'never shrinks after the first touch');
  const dan=await client('dan','hero');await setD(dan,{slots100:4});await setC(dan.ch.id,{alive:false});await unslot(dan);
  assert.strictEqual((await dan.req('domus.get',{})).domus.gmax,1,'an old house with no living gladiator keeps one slot');

  /* ── 2 · THE ISSUED KIT ── */
  await setC(ann.ch.id,{gear:[],equip:[]});await setC(a2.id,{gear:[],equip:[]});
  const k1=await ann.req('market.kit',{char:ann.ch.id,kit:'daily'});assert.ok(k1.issued&&k1.cost===0,'free');assert.deepStrictEqual(k1.bought,[...C.DAILY92,'mace'],'padding + an issued weapon for empty hands');
  let c1=await getC(ann.ch.id);assert.ok(c1.gear.length===4&&c1.gear.every(it=>C.isIss100(c1,it)),'every piece Issued');assert.ok(C.equipOf(c1).some(it=>/^mace#/.test(it)),'he holds the mace');
  await rejects(ann.req('market.kit',{char:a2.id,kit:'daily'}),'kit_day',/tomorrow/);
  /* never repaired */
  {const x=await getC(ann.ch.id);C.damageItem91(x,x.gear.find(it=>/^galea/.test(it)),0.5);await db.put('CHAR#'+x.id,'CHAR',x)}c1=await getC(ann.ch.id);
  await setD(ann,{treasury:500});await rejects(ann.req('gear.repair',{holder:ann.ch.id,item:c1.gear.find(it=>C.pcOf(c1,it)&&C.pcOf(c1,it).st==='damaged')}),'issued');
  /* the next day, for the other gladiator: ONE set a house — the first one's Issued pieces are taken back */
  T+=86400e3;const k2=await ann.req('market.kit',{char:a2.id,kit:'daily'});assert.ok(k2.back.length===4,'taken back: '+JSON.stringify(k2.back));
  c1=await getC(ann.ch.id);assert.strictEqual(c1.gear.filter(it=>C.isIss100(c1,it)).length,0,'the first gladiator holds none now');
  const c2=await getC(a2.id);assert.strictEqual(c2.gear.filter(it=>C.isIss100(c2,it)).length,k2.bought.length,'one set: on the second');
  T+=86400e3;await rejects(ann.req('market.kit',{char:a2.id,kit:'daily'}),'kit_none',/already has all/,'nothing missing: the day is not used up');
  /* in a match, the set cannot be called back */
  await setC(ann.ch.id,{gear:[],equip:[]});

  /* ── 1 · RANKED KIT = what he wears ── */
  {const k=C.kitOf(await getC(a2.id));assert.ok(k.items.every(it=>C.isIss100(c2,it)),'his kit is what he holds — no class weapon added on the server');}

  /* ── 3 · WAGERS CLOSED ── */
  const RF=await bob.req('lobby.create',{ev:'egidious',loc:3,cry:false});
  const we=await rejects(cat.req('bet.place',{id:RF.id,seat:0,amt:5}),'wager_off',/wagers are closed/);assert.ok(we.reply.mcode,'a text code for the page: '+JSON.stringify(we.reply));
  await bob.req('lobby.leave',{id:RF.id});

  /* ── 6 / 8 · a live match: a ticket holder never votes a strike; clocks ── */
  const L0=await ann.req('lobby.create',{ev:'democritus',loc:4,cry:false});await ann.req('lobby.set',{id:L0.id,turnT:30,ticket:5});await bob.req('lobby.join',{id:L0.id});
  await setD(cat,{treasury:50});await cat.req('lobby.ticket',{id:L0.id});const L=await ann.req('lobby.start',{id:L0.id});const id=L.id;const sa=C.seatOf(L,ann.acct),sb=C.seatOf(L,bob.acct);
  for(const cl of [ann,bob,cat]){cl.conn='w'+(++nc);live.add(cl.conn);await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:cl.name,ver:String(C.VER)}})} /* presence after the days skipped above */
  const hl=await bob.req('hello',{all:1});assert.ok(hl.here&&hl.here.fight===2&&hl.here.watch===1,'the landing counts 2 fighting + 1 watching: '+JSON.stringify(hl.here));
  const od=await cat.req('match.odd',{id,seat:sa});assert.ok(od.spec&&!od.struck,'a ticket holder does not vote');
  /* clocks: Ann cannot mark her own turn ended while Bob fights; Bob can */
  await ann.req('match.clock',{id,kind:'turn',t:1,seat:sa});await ann.req('match.clock',{id,kind:'end',t:1});assert.ok(!(await db.get('MATCH#'+id,'META')).tc100.end,'no stalling: her own end report does not count');
  await bob.req('match.clock',{id,kind:'end',t:1});assert.ok((await db.get('MATCH#'+id,'META')).tc100.end,'the other lanista ends it');
  await ann.req('match.clock',{id,kind:'turn',t:500,seat:sb});assert.strictEqual((await db.get('MATCH#'+id,'META')).tc100.t,1,'a far-ahead turn alone does not move the clock');
  await bob.req('match.clock',{id,kind:'turn',t:500,seat:sb});assert.strictEqual((await db.get('MATCH#'+id,'META')).tc100.t,500,'a second lanista confirms it');
  await ann.req('match.clock',{id,kind:'turn',t:502,seat:sa});assert.strictEqual((await db.get('MATCH#'+id,'META')).tc100.t,502,'a near turn: the first report as before');

  /* ── 8 · input checks ── */
  await rejects(ann.req('char.buy',{char:{$ne:1},item:'gladius'}),'bad_req');await rejects(ann.req('lobby.get',{id:'x'.repeat(200)}),'bad_req');
  await setC(c1.id,{alive:false});await rejects(ann.req('domus.equip',{char:c1.id,item:'x',on:true}),null,/Not yours/);
  console.log('server v1.0 batch A (slots, Issued kit, wagers closed, watchers, strikes, clocks, input checks): all checks passed')}

(async()=>{units();await routes()})().catch(e=>{console.error(e);process.exit(1)});
