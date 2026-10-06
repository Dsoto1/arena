/* v0.92 ONE TREASURY + ONLINE KITS: no purse (awards, gifts, payouts → the house treasury; old purses moved once with a ledger line),
   coin sent into a match (0–10, reserved at the horns, a survivor's leftover home up to what was sent, the dead lose it, void → back),
   kits (class / tiers / restock; owned pieces skipped, shelf pieces moved, 15% × the share bought), the free daily kit (Issued: worth 0,
   never repaired, never looted, vanishes when lost).
   node server/test/v92.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');

function rules(){C.setCatalog(catalog);try{C.setKits92(require('../src/kits92.json'))}catch(e){}
  /* the award: whole to the house */
  const ch=C.newChar({name:'Purse Less',cls:'hero'},'o','pl',0);const o=C.applyResult(ch,{won:true,f:10,survives:true},true,{humans:4,now:5});
  assert.strictEqual(o.award,12);assert.strictEqual(o.cut,12);assert.strictEqual(o.pay,0);assert.strictEqual(o.earn92,12);assert.strictEqual(ch.wallet,0,'no purse');
  /* the class kits: a pair piece listed on both sides counts once */
  assert.deepStrictEqual(C.kitFromArmor92([['galea','head'],['wraps','rarm'],['wraps','larm'],['manica','larm'],['nope','head']],catalog),['galea','wraps','manica']);
  assert.deepStrictEqual(C.classKits92().hero,['thrachelm','provmanica','wraps','legwraps']);assert.deepStrictEqual(Object.keys(C.classKits92()).sort(),C.CLASSES8.slice().sort());
  for(const k of C.CLASSES8)for(const b of C.classKits92()[k])assert.ok(catalog[b]&&catalog[b].kind==='a',k+' kit: '+b);
  for(const [t,L] of Object.entries(C.KIT_TIERS92)){for(const b of L)assert.ok(catalog[b],t+': '+b);assert.ok(C.armFit({},L,catalog).every(Boolean),t+' fits on one body')}
  for(const k of C.CLASSES8)assert.ok(C.armFit({},C.classKits92()[k],catalog).every(Boolean),k+' kit fits on one body');
  /* the plan: owned pieces skipped (his, then the shelf's), the discount = 15% × the share of the kit bought */
  const P=b=>C.priceOf(catalog[b]);const hero=C.kitList92('cls','hero');const full=hero.reduce((a,b)=>a+P(b),0);
  let pl=C.kitPlan92({gear:[],pcs:{}},{gear:[],pcs:{}},hero,catalog);assert.deepStrictEqual(pl.buy,hero);assert.strictEqual(pl.full,full);assert.strictEqual(pl.disc,Math.round(full*0.15));assert.strictEqual(pl.cost,full-Math.round(full*0.15));
  const h2={id:'h2',gear:['wraps','gladius'],pcs:{}};const sh={gear:['legwraps','mace'],pcs:{}};pl=C.kitPlan92(h2,sh,hero,catalog);
  assert.deepStrictEqual(pl.have,['wraps']);assert.deepStrictEqual(pl.take,['legwraps']);assert.deepStrictEqual(pl.buy,['thrachelm','provmanica']);
  const part=P('thrachelm')+P('provmanica');assert.strictEqual(pl.part,part);assert.strictEqual(pl.disc,Math.round(part*0.15*part/full),'proportional to the share bought');assert.strictEqual(pl.cost,part-pl.disc);
  pl=C.kitPlan92({gear:['wraps'],pcs:{}},null,['wraps'],catalog);assert.strictEqual(pl.cost,0);assert.strictEqual(C.kitWhy92('scrap',pl,{},999,'d'),'He already has all of it.');
  /* a broken piece is not "owned"; a damaged one is (repair it) */
  const hb={id:'hb',gear:['wraps#x.1','legwraps#x.2'],pcs:{'x.1':{st:'broken'},'x.2':{st:'damaged',dmg:0.5}}};pl=C.kitPlan92(hb,null,['wraps','legwraps'],catalog);assert.deepStrictEqual(pl.buy,['wraps']);
  /* the treasury */
  pl=C.kitPlan92({gear:[]},null,['galea'],catalog);assert.match(C.kitWhy92('recruit',pl,{},pl.cost-1,'d'),/treasury needs/);assert.strictEqual(C.kitWhy92('recruit',pl,{},pl.cost,'d'),'');
  /* the daily kit: free, once a day, Issued */
  pl=C.kitPlan92({gear:[]},null,C.DAILY92,catalog,{free:true});assert.strictEqual(pl.cost,0);assert.match(C.kitWhy92('daily',pl,{kitDay92:'d1'},0,'d1'),/tomorrow/);assert.strictEqual(C.kitWhy92('daily',pl,{kitDay92:'d0'},0,'d1'),'');
  const iss={id:'is',gear:[],pcs:{}};const news=C.kitPieces92(iss,['galea','wraps'],true);for(const p of news)C.putPiece(iss,p,true);
  const I=C.pieceOf(iss,news[0].item,catalog);assert.ok(I.iss&&I.val===0,'Issued: worth nothing');assert.ok(C.isIssued92(iss,news[0].item));assert.strictEqual(C.valueOf(I),0);
  assert.deepStrictEqual(C.kitPieces92({id:'p'},['galea'],false),[{item:'galea',pc:null}],'bought pieces are plain');
  /* Issued pieces vanish: carried by the dead (no loot, no market), dented in a Ranked bout */
  const dd=C.newChar({name:'Issued Dead',cls:'hero'},'o','idd',0);for(const p of C.kitPieces92(dd,['galea'],true))C.putPiece(dd,p,true);dd.gear.push('wraps');
  let g=C.gearAfter(dd,C.kitOf(dd),{survives:false},true);assert.deepStrictEqual(g.carried.map(P=>C.itemBase(P.item)),['wraps'],'only the bought piece is carried');assert.deepStrictEqual(g.vanish,['galea']);
  const dt=C.newChar({name:'Issued Dent',cls:'hero'},'o','idt',0);for(const p of C.kitPieces92(dt,['galea'],true))C.putPiece(dt,p,true);
  g=C.gearAfter(dt,C.kitOf(dt),{survives:true,dmg:[['galea',0.5]]},true);assert.deepStrictEqual(g.dmg,[]);assert.deepStrictEqual(g.vanish,['galea']);assert.ok(!dt.gear.length,'gone');
  /* coin sent */
  for(const n of [-1,11,3.5,NaN])assert.match(C.sendWhy92(n,99),/0–10/);assert.match(C.sendWhy92(7,5),/only 5/);assert.strictEqual(C.sendWhy92(10,10),'');assert.strictEqual(C.sendWhy92(0,0),'');
  assert.strictEqual(C.sendBack92(7,{coin:12},{}),7);assert.strictEqual(C.sendBack92(7,{coin:3},{}),3);assert.strictEqual(C.sendBack92(7,{coin:12},{died:true}),0);assert.strictEqual(C.sendBack92(7,{coin:12},{abandoned:1}),0);
  /* restock: a loadout's printed pieces; the remap points it at what he holds */
  assert.deepStrictEqual(C.restockList92({items:['galea#a.1','nw#z.1','wraps']}),['galea','wraps']);
  const rk={id:'rk',gear:['galea','wraps'],kits89:[{n:'Main',items:['galea#gone.1','wraps','nw#lost.2']}]};C.kitRemap92(rk,0,['galea']);assert.deepStrictEqual(rk.kits89[0].items,['galea','wraps']);
  /* the guest pass and wagers speak of the treasury */
  const Lp=C.newLobby({ev:'democritus',ticket:5},{id:'h',name:'H'},'L',1);assert.match(C.passOK(Lp,'x',20,null,'d'),/thin treasuries — under 15/);
  assert.strictEqual(C.ledgerOf(C.ledAdd(C.ledAdd({},'purse',5),'kit',3)).tin,5);
  console.log('v0.92 rules (the award to the house, class kits from the class data, kit plans + proportional discount, the daily kit + Issued pieces, coin sent, restock): all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=C.SEASON_EPOCH+9*C.WEEK_MS+3600e3;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});let nc=0,rid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const getD=cl=>db.get('DOMUS#'+cl.domus.id,'DOMUS');const tre=async cl=>((await getD(cl))||{}).treasury|0;const setT=async(cl,v)=>{const D=await getD(cl);D.treasury=v;await db.put('DOMUS#'+D.id,'DOMUS',D)};
  const setShelf=async(cl,gear)=>{const D=await getD(cl);D.gear=gear;await db.put('DOMUS#'+D.id,'DOMUS',D)};
  const ann=await client('ann'),bob=await client('bob','slave');

  /* ── the purse moves into the treasury once (a ledger line), the reply carries the house ── */
  await setC(ann.ch.id,{wallet:70});let hl=await ann.req('hello',{all:1});assert.strictEqual(hl.domus.treasury,70,'moved on the first read');assert.strictEqual((await getC(ann.ch.id)).wallet,0);
  let D=await getD(ann);assert.strictEqual(D.led89.in.purse,70,'"Purses moved to the treasury"');assert.ok(D.purse92);
  hl=await ann.req('hello',{all:1});assert.strictEqual(hl.domus.treasury,70,'once');assert.strictEqual((await getD(ann)).led89.in.purse,70);
  /* buys: the treasury pays */
  const by=await ann.req('char.buy',{char:ann.ch.id,item:'galea'});assert.strictEqual(by.domus92.treasury,70-C.priceOf(catalog.galea));assert.strictEqual((await getD(ann)).led89.out.gear,C.priceOf(catalog.galea));
  await setT(ann,10);await rejects(ann.req('char.buy',{char:ann.ch.id,item:'gladius'}),'no_coin',/treasury needs 60 coin/);
  await rejects(ann.req('offer.buy',{char:ann.ch.id,key:'elix2'}),'no_coin',/treasury needs 40/);await setT(ann,40);const ob=await ann.req('offer.buy',{char:ann.ch.id,key:'elix2'});assert.deepStrictEqual(ob.offers,['elix2']);assert.strictEqual(await tre(ann),0);

  /* ── coin sent into a match ── */
  let L=await ann.req('lobby.create',{ev:'democritus',loc:6,ranked:true,cry:false});await bob.req('lobby.join',{id:L.id});
  await rejects(ann.req('lobby.send',{id:L.id,coin:11}),null,/0–10/);await setT(ann,5);await rejects(ann.req('lobby.send',{id:L.id,coin:7}),null,/only 5/);
  await setT(ann,40);L=await ann.req('lobby.send',{id:L.id,coin:7});assert.strictEqual(L.players.find(p=>p.id===ann.acct).send92,7);assert.strictEqual(await tre(ann),40,'not taken before the horns');
  await setT(bob,10);await bob.req('lobby.send',{id:L.id,coin:10});
  const cat=await client('cat');await rejects(cat.req('lobby.send',{id:L.id,coin:1}),null,/Sit down first/);
  await setT(bob,6);/* the treasury fell before the horns: he sends what is left */
  L=await ann.req('lobby.start',{id:L.id});const pa=L.players.find(p=>p.id===ann.acct),pb=L.players.find(p=>p.id===bob.acct);assert.deepStrictEqual([pa.sent92,pb.sent92],[7,6],'reserved at the horns');
  assert.deepStrictEqual([await tre(ann),await tre(bob)],[33,0]);assert.strictEqual((await getD(ann)).led89.out.sent,7);
  await rejects(ann.req('lobby.send',{id:L.id,coin:3}),null,/under way/);
  /* Ann survives with 12 coin (7 home), Bob dies with 20 (lost) */
  const sa=C.seatOf(L,ann.acct),sb=C.seatOf(L,bob.acct);const tb=[0,1,2,3].map(i=>i===sa?{seat:i,won:true,f:9,coin:12}:i===sb?{seat:i,survives:false,kb:'b',f:2,coin:20}:{seat:i,f:1,coin:3});
  for(const x of [ann,bob])await x.req('match.result',{id:L.id,table:tb,hash:'s'});
  const M=await db.get('MATCH#'+L.id,'META');assert.deepStrictEqual([M.outs[ann.acct].sent92,M.outs[ann.acct].back92],[7,7]);assert.strictEqual(M.outs[ann.acct].pay,0);assert.strictEqual(M.outs[ann.acct].cut,6);
  assert.strictEqual(await tre(ann),33+6+7,'the award + the coin home');assert.strictEqual((await getD(ann)).led89.in.back,7);assert.strictEqual((await getD(ann)).led89.in.cut,6);
  assert.strictEqual(await tre(bob),0,'the dead lose the coin sent');assert.ok(!(await getC(bob.ch.id)).alive);
  /* a survivor who spent most of it brings home only what is left */
  const bob2=await bob.req('char.create',{name:'Bob Secundus',cls:'slave'});
  let L2=await ann.req('lobby.create',{ev:'egidious',loc:3,cry:false});await bob.req('lobby.join',{id:L2.id});await setT(ann,20);await ann.req('lobby.send',{id:L2.id,coin:10});L2=await ann.req('lobby.start',{id:L2.id});
  const t2=[0,1,2,3].map(i=>({seat:i,f:2,coin:i===C.seatOf(L2,ann.acct)?4:0,won:i===C.seatOf(L2,bob.acct)}));for(const x of [ann,bob])await x.req('match.result',{id:L2.id,table:t2,hash:'c'});
  assert.strictEqual(await tre(ann),10+4,'Custom: no award; 4 of the 10 home');
  /* void: every coin sent goes back */
  let L3=await ann.req('lobby.create',{ev:'cassian',loc:2,cry:false});await bob.req('lobby.join',{id:L3.id});await ann.req('lobby.send',{id:L3.id,coin:5});L3=await ann.req('lobby.start',{id:L3.id});assert.strictEqual(await tre(ann),9);
  await ann.req('match.result',{id:L3.id,table:[{seat:0,won:true},{seat:1}],hash:'x'});const vd=await bob.req('match.result',{id:L3.id,table:[{seat:0},{seat:1,won:true}],hash:'y'});assert.ok(vd.void);
  assert.strictEqual(await tre(ann),14,'void → back');assert.strictEqual((await getD(ann)).led89.out.sent,7+10,'the ledger line undone');
  /* abandon: lost (the room closes when the last human leaves) */
  let L4=await ann.req('lobby.create',{ev:'democritus',loc:1,cry:false});await bob.req('lobby.join',{id:L4.id});await ann.req('lobby.send',{id:L4.id,coin:4});L4=await ann.req('lobby.start',{id:L4.id});
  await ann.req('match.abandon',{id:L4.id});await bob.req('match.abandon',{id:L4.id});assert.strictEqual((await db.get('LOBBY#'+L4.id,'LOBBY')).status,'done');assert.strictEqual(await tre(ann),10,'one who abandons loses it');

  /* ── 🎒 kits ── */
  await setC(ann.ch.id,{gear:['wraps','gladius'],equip:['wraps','gladius']});await setShelf(ann,['legwraps','mace']);
  const hero=C.classKits92().hero;const full=hero.reduce((a,b)=>a+C.priceOf(catalog[b]),0);const part=C.priceOf(catalog.thrachelm)+C.priceOf(catalog.provmanica);const cost=part-Math.round(part*0.15*part/full);
  await setT(ann,cost-1);await rejects(ann.req('market.kit',{char:ann.ch.id,kit:'cls'}),'no_coin',new RegExp('treasury needs '+cost));await setT(ann,cost+5);
  let kt=await ann.req('market.kit',{char:ann.ch.id,kit:'cls'});assert.strictEqual(kt.cost,cost);assert.deepStrictEqual(kt.bought,['thrachelm','provmanica']);assert.deepStrictEqual(kt.took,['legwraps']);
  let c=await getC(ann.ch.id);for(const b of hero)assert.ok(C.equipOf(c).some(it=>C.itemBase(it)===b),'wears '+b);assert.ok(C.equipOf(c).includes('gladius'),'his weapon stays');
  assert.deepStrictEqual(kt.gear,['mace'],'the legwraps left the shelf');assert.strictEqual(await tre(ann),5);assert.strictEqual((await getD(ann)).led89.out.kit,cost);
  await rejects(ann.req('market.kit',{char:ann.ch.id,kit:'cls'}),'kit_none',/already has/);await rejects(ann.req('market.kit',{char:ann.ch.id,kit:'bogus'}),null,/No such kit/);
  /* a tier kit replaces what sits on the same point: the old piece goes to the shelf */
  await setT(ann,5000);kt=await ann.req('market.kit',{char:ann.ch.id,kit:'champ'});c=await getC(ann.ch.id);assert.ok(C.equipOf(c).some(it=>C.itemBase(it)==='murmillo'));
  assert.ok(kt.gear.some(it=>C.itemBase(it)==='thrachelm'),'the class helm went to the shelf');
  /* restock: a saved loadout's lost piece is bought again; the loadout points at it */
  await ann.req('char.kits',{char:ann.ch.id,kits:[{n:'Plate',items:C.equipOf(c)}]});c=await getC(ann.ch.id);const gone=c.gear.find(it=>C.itemBase(it)==='bracers');
  await setC(ann.ch.id,{gear:c.gear.filter(x=>x!==gone),equip:c.equip.filter(x=>x!==gone)});const t0=await tre(ann);
  const rs=await ann.req('market.kit',{char:ann.ch.id,kit:'restock',i:0});assert.deepStrictEqual(rs.bought,['bracers']);c=await getC(ann.ch.id);
  assert.ok(C.equipOf(c).some(it=>C.itemBase(it)==='bracers'));assert.ok(c.kits89[0].items.every(it=>c.gear.includes(it)),'the loadout points at held pieces');
  const champ=C.KIT_TIERS92.champ.reduce((a,b)=>a+C.priceOf(catalog[b]),0);const bp=C.priceOf(catalog.bracers);assert.strictEqual(t0-await tre(ann),bp-Math.round(bp*0.15*bp/(C.restockList92({items:c.kits89[0].items}).reduce((a,b)=>a+C.priceOf(catalog[b]),0))));
  assert.ok(champ>0);await rejects(ann.req('market.kit',{char:ann.ch.id,kit:'restock',i:3}),null,/No such loadout/);
  /* the free daily kit: once an online day a house; Issued pieces */
  const bc=await getC(bob2.id);assert.ok(bc&&bc.alive);const dk=await bob.req('market.kit',{char:bob2.id,kit:'daily'});assert.strictEqual(dk.cost,0);assert.ok(dk.issued);assert.deepStrictEqual(dk.bought,C.DAILY92);
  c=await getC(bob2.id);const isd=c.gear.filter(it=>C.isIssued92(c,it));assert.strictEqual(isd.length,3,'three Issued pieces');assert.ok(isd.every(it=>C.equipOf(c).includes(it)),'worn');assert.strictEqual(dk.domus.kitDay92,C.dayKey(T));
  await rejects(bob.req('market.kit',{char:bob2.id,kit:'daily'}),'kit_day',/tomorrow/);
  /* Issued: never repaired */
  {const x=await getC(bob2.id);C.damageItem91(x,isd[0],0.5);await db.put('CHAR#'+x.id,'CHAR',x)}c=await getC(bob2.id);const dIt=c.gear.find(it=>C.isIssued92(c,it)&&C.pcOf(c,it).st==='damaged');
  await setT(bob,500);await rejects(bob.req('gear.repair',{holder:bob2.id,item:dIt}),'issued');
  /* Issued gear dies with him: no loot, no market */
  T+=86400e3;const bob3c=await getC(bob2.id);await setC(bob2.id,{gear:bob3c.gear.filter(it=>it!==dIt),equip:(bob3c.equip||[]).filter(it=>it!==dIt)});
  let L5=await bob.req('lobby.create',{ev:'democritus',loc:6,ranked:true,cry:false});
  await setC(ann.ch.id,{glory:0,rankK:'tiro',rank:'tiro'});await ann.req('lobby.join',{id:L5.id});L5=await bob.req('lobby.start',{id:L5.id});
  const s5a=C.seatOf(L5,ann.acct),s5b=C.seatOf(L5,bob.acct);assert.ok(L5.players[s5b].kit.items.some(it=>/#/.test(it)),'the Issued pieces go into the bout');
  const m0=sent.length;const t5=[0,1,2,3].map(i=>i===s5b?{seat:i,survives:false,kb:'g',ks:s5a,f:1}:{seat:i,won:i===s5a,f:5});for(const x of [ann,bob])await x.req('match.result',{id:L5.id,table:t5,hash:'k'});
  assert.ok(!sent.slice(m0).some(x=>x.conn===ann.conn&&x.msg.push==='loot.offer'),'nothing to loot');assert.ok(!(await ann.req('market.list',{})).used.some(u=>u.from&&u.from.glad==='Bob Secundus'),'nothing for the market');
  /* the daily kit again the next day (another gladiator) */
  const bob4=await bob.req('char.create',{name:'Bob Tertius',cls:'hero'});const dk2=await bob.req('market.kit',{char:bob4.id,kit:'daily'});assert.ok(dk2.issued);
  console.log('server v0.92 (the purse moved once, the treasury pays, coin sent: limits / reserved / home / lost / void / abandon, class + tier kits with the proportional discount, restock + remap, the daily kit: once a day, Issued never repaired or looted): all checks passed')}

(async()=>{rules();await routes()})().catch(e=>{console.error(e);process.exit(1)});
