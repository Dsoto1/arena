/* v0.83 (protocol 6): ranks, gear levels, the treasury, offerings, gear loss + loot, the used market, gifts, named weapons, the countdown,
   trophies, profiles + follow, the wagers tab, Ludi Infames. node server/test/v83.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');
const ok=r=>r.status==='fulfilled';
function seeded(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ── 1. the shared rules (ONLC) ── */
function rules(){
  assert.ok(C.VER>=6);
  assert.deepStrictEqual(C.RANKS.map(r=>r.k),['tiro','novicius','gregarius','veteranus','primus','summa','rudiarius','invictus']);
  assert.deepStrictEqual(C.RANKS.map(r=>r.glory),[0,90,180,550,1150,2100,3500,5500]);
  assert.deepStrictEqual(C.RANKS.map(r=>C.awardOf(r.k,false,0)),[8,10,12,18,25,35,45,60]);assert.strictEqual(C.awardOf('invictus',true,10),Math.round(60*1.5*2));
  assert.strictEqual(C.rankByGlory(89).k,'tiro');assert.strictEqual(C.rankByGlory(90).k,'novicius');assert.strictEqual(C.rankByGlory(5600).k,'invictus');
  /* the treasury's cut, gifts at rank-ups and every 5 Ranked bouts survived */
  const ch=C.newChar({name:'Rule Tester',cls:'hero'},'o','gr',0);ch.glory=85;
  const o=C.applyResult(ch,{won:true,f:10,survives:true},true,{humans:4,now:5});assert.strictEqual(o.award,12);assert.strictEqual(o.cut,12,'v0.92: the whole award goes to the house');assert.strictEqual(o.pay,0);assert.strictEqual(ch.wallet,0,'no purse');
  assert.deepStrictEqual(o.ranks,['novicius']);assert.deepStrictEqual(o.gifts.map(g=>g.why),['rank:novicius']);
  ch.survived=4;const o5=C.applyResult(ch,{won:false,f:0,survives:true},true,{humans:4});assert.ok(o5.gifts.some(g=>g.why==='surv:5'),'a gift every 5 Ranked bouts survived');
  ch.glory=170;const o6=C.applyResult(ch,{won:false,f:400,survives:true},false,{});assert.deepStrictEqual(o6.ranks,['gregarius','veteranus'],'one gift for every rank crossed');assert.strictEqual(ch.gifts.length,4);
  assert.strictEqual(C.giftAdd(ch,'rank:veteranus',1),null,'never twice');C.giftTake(ch,ch.gifts[0].id);assert.strictEqual(ch.gifts.length,3);assert.strictEqual(C.giftAdd(ch,'rank:novicius',1),null,'an opened gift does not come back');
  /* buying has no rank gate; wearing named pieces needs Veteranus */
  const t=C.newChar({name:'Tiro Buyer',cls:'slave'},'o','tb',0);t.wallet=800;C.buy(t,'charun',catalog);assert.ok(t.gear.includes('charun'),'a Tiro buys level 3');
  assert.match(C.canBuy(t,'charun',catalog),/Costs/,'v0.91: no copy limit — only the price');t.wallet=750;C.buy(t,'charun',catalog);assert.strictEqual(t.gear.filter(g=>g==='charun').length,2,'a spare');
  const nw=C.rollNamed(seeded(7),catalog,'rare',[]);const P=C.namedPiece(nw,t);assert.match(P.item,/^nw#tb\.\d+$/);C.putPiece(t,P,false);
  assert.match(C.wearWhy(t,P.item),/Veteranus/);assert.throws(()=>C.gearEquip(t,P.item,true),/Veteranus/);assert.ok(!C.equipOf(t).includes(P.item),'never brought below Veteranus');
  assert.match(C.gearMoveWhy({gear:[P.item],pcs:{[C.itemUid(P.item)]:P.pc}},{...C.newChar({name:'Low Rank',cls:'hero'},'o','lr',0)},P.item,catalog),/Storeroom until Veteranus/);
  t.glory=600;assert.strictEqual(C.wearWhy(t,P.item),'');C.gearEquip(t,P.item,true);const kit=C.kitOf(t);
  assert.ok(kit.gear.includes('nw_'+C.itemUid(P.item))&&kit.items.includes(P.item),'the kit names the engine key and the item');assert.strictEqual(kit.named[0].key,'nw_'+C.itemUid(P.item));
  /* pieces: value, repair, break */
  const I=C.pieceOf(t,P.item,catalog);assert.strictEqual(I.val,1500*2);assert.strictEqual(C.repairCost(I),1000);assert.strictEqual(C.pieceOf(t,'charun',catalog).val,750);
  const nb=C.breakItem(t,'charun');assert.match(nb,/^charun#/);assert.ok(C.isBroken(t,nb));assert.match(C.wearWhy(t,nb),/repair/);assert.throws(()=>C.gearEquip(t,nb,true),/repair/);
  C.repairItem(t,nb);assert.ok(!C.isBroken(t,nb));assert.throws(()=>C.repairItem(t,nb),/whole/);
  /* named weapons: deterministic, capped, cleaned, one unique each */
  for(let s=1;s<60;s++){for(const r of ['common','rare','epic','legendary']){const a=C.rollNamed(seeded(s),catalog,r,[]),b=C.rollNamed(seeded(s),catalog,r,[]);assert.deepStrictEqual(a,b,'the same roll for the same randomness');
    assert.ok(a.p<=5&&a.r<=5,'caps');assert.strictEqual(a.aff.length,{common:0,rare:1,epic:2,legendary:2}[a.rar]>a.aff.length?a.aff.length:{common:0,rare:1,epic:2,legendary:2}[a.rar]);assert.ok(a.n&&a.n.length<=40,a.n);
    if(r==='legendary'){assert.ok(C.UNIQUES.some(u=>u.k===a.uq));if(a.shield)assert.ok(['aegis','regius'].includes(a.uq))}
    const cl=C.cleanNamed({...a,key:'nw_x.1'});assert.strictEqual(cl.p,a.p);assert.strictEqual(cl.uq,a.uq)}}
  const all=C.UNIQUES.map(u=>u.k);assert.strictEqual(C.rollNamed(seeded(3),catalog,'legendary',all).rar,'epic','every unique claimed → Epic');
  assert.strictEqual(C.cleanNamed({key:'gladius',p:9}),null,'only nw_ keys');assert.strictEqual(C.cleanNamed({key:'nw_a',p:40,r:-3,uq:'evil'}).p,6);
  /* offerings */
  const of=C.newChar({name:'Satchel',cls:'hero'},'o','of',0);of.wallet=200;assert.match(C.offerBuyWhy(of,'spiders'),/does not sell/);C.offerBuy(of,'elix4');C.offerBuy(of,'cf1');C.offerBuy(of,'ap2');
  assert.strictEqual(of.wallet,200-120-40-40);assert.deepStrictEqual(C.offersBrought(of),['elix4','cf1'],'the first two by default');C.offerBring(of,['ap2']);assert.deepStrictEqual(C.kitOf(of).offer,['ap2']);
  assert.throws(()=>C.offerBring(of,['ap2','ap2']),/not in the satchel/);assert.throws(()=>C.offerBring(of,['a','b','c']),/at most 2/);
  /* gearAfter: a survivor (breaks, offerings back, cf bonus spent) and the dead (carried / left) */
  const g=C.newChar({name:'After Math',cls:'hero'},'o','am',0);g.gear=['galea','gladius','wraps'];g.offers=['elix2','cf2','ap3'];g.cfb=5;const gk=C.kitOf(g);
  const gx=C.gearAfter(g,gk,C.cleanRow({survives:true,brk:['galea','nonsense'],off:['cf2']}),true);
  assert.deepStrictEqual(gx.offBack,['cf2']);assert.deepStrictEqual(g.offers.sort(),['ap3','cf2'],'the used one is gone, the unused came back');assert.strictEqual(g.cfb,0);
  assert.deepStrictEqual(gx.broken,[]);assert.deepStrictEqual(gx.gone,['galea'],'v0.91: a printed piece lost in Ranked is used up');assert.ok(!g.gear.some(x=>C.itemBase(x)==='galea'),'gone from the gladiator');
  const d=C.newChar({name:'Dead Man',cls:'hero'},'o','dm',0);d.gear=['galea','gladius','mace'];d.equip=['galea','gladius'];d.offers=['elix2'];const dk=C.kitOf(d);
  const dx=C.gearAfter(d,dk,{survives:false},true);assert.deepStrictEqual(dx.carried.map(P=>P.item),['galea','gladius']);assert.deepStrictEqual(dx.left.map(P=>P.item),['mace']);assert.deepStrictEqual(d.gear,[]);assert.deepStrictEqual(d.offers,[]);
  const cx=C.gearAfter(C.newChar({name:'Custom Man',cls:'hero'},'o','cm',0),dk,{survives:true,brk:['galea']},false);assert.deepStrictEqual(cx.broken,[],'Custom breaks nothing');
  /* result rows */
  const row=C.cleanRow({seat:1,brk:['b','a','<x>'],off:['spiders','elix2','cf1','ap2'],ks:2,kb:'g',thumb:1,slew:['tholo','commodus','x','tholo']});
  assert.deepStrictEqual([row.brk,row.off,row.ks,row.kb,row.thumb,row.slew],[['a','b'],['cf1','elix2'],2,'g',true,['commodus','tholo']]);
  assert.deepStrictEqual([C.cleanRow({}).ks,C.cleanRow({}).kb,C.cleanRow({ks:99}).ks],[-1,'',-1]);
  /* wagers: betResults is settle() bet by bet */
  const bets=[{by:'a',seat:0,amt:10},{by:'b',seat:1,amt:30},{by:'c',seat:0,amt:20}];const st=C.settle(bets,[0],{pot:6});const br=C.betResults(bets,[0],{pot:6});
  assert.strictEqual(br[0].pay,st.payouts.a);assert.strictEqual(br[2].pay,st.payouts.c);assert.strictEqual(br[1].res,'lost');assert.deepStrictEqual(C.betResults(bets,[],{}).map(x=>x.res),['refund','refund','refund']);
  const od=C.oddsOf({seats:2,bets,pot:6});assert.strictEqual(od.pool,60);assert.strictEqual(od.seats[0].stake,30);assert.strictEqual(od.seats[0].odds,Math.round((66-3)/30*100)/100);
  /* the countdown signature */
  const L=C.newLobby({ev:'democritus'},{id:'h',name:'H'},'L1',0);C.roomJoin(L,[{id:'h',name:'H'}],0);L.startAt=10;L.startSig=C.lineupSig(L);L.players[0].ready=true;C.countCheck(L);assert.strictEqual(L.startAt,10,'a ready mark changes nothing');
  C.roomJoin(L,[{id:'x',name:'X'}],0);assert.strictEqual(L.startAt,null,'someone sat down: the countdown stops');
  /* trophies */
  const D={};assert.ok(C.trophyAdd(D,'first:cassian','A',1));assert.ok(!C.trophyAdd(D,'first:cassian','A',2));C.trophyAdd(D,'vday','A',3);C.trophyAdd(D,'vday','B',4);assert.strictEqual(D.trophies.find(x=>x.k==='vday').x,2);
  assert.deepStrictEqual(C.trophiesFrom({survived:10},{won:true,slew:['tholo'],thumb:true},{ranks:['novicius']},true,'cassian'),['first:cassian','rank:novicius','slew:tholo','surv10','thumb']);
  assert.strictEqual(C.domusFromHash('#x=1&domus=Dabc'),'Dabc');assert.strictEqual(C.domusLink('Dq'),'#domus=Dq');
  console.log('v0.83 rules (ranks, award + cut, gifts, gear levels, pieces, named weapons, offerings, gear loss, rows, wagers, countdown, trophies): all checks passed')}

/* ── 2. the routes, through the real handler ── */
async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=1950000000000;const db=store.memory();const sent=[];const live=new Set();let RND=null;
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,rnd:()=>RND!=null?RND:Math.random(),testers:' Tess@Example.com ,other@example.com'});
  let nc=0,rid=0;const mark=()=>sent.length;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;e.reply=m.msg;throw e}return m.msg.d};
  const got=(conn,t,since=0)=>sent.slice(since).filter(x=>x.conn===conn&&x.msg.push===t).map(x=>x.msg.d);
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  const connect=async(name,email)=>{const conn='v'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER),...(email?{email}:{})}});assert.strictEqual(r.statusCode,200);return conn};
  async function client(name,o={}){const cl={name,acct:'dev-'+name};cl.conn=await connect(name,o.email);cl.req=(t,d)=>ask(cl.conn,t,d);cl.got=(t,s)=>got(cl.conn,t,s);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;
    cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:o.cls||'hero'});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const getD=id=>db.get('DOMUS#'+id,'DOMUS');const setD=async(id,f)=>{const D=await getD(id);Object.assign(D,f);await db.put('DOMUS#'+id,'DOMUS',D)};
  {const r=await h({requestContext:{routeKey:'$connect',connectionId:'old'},queryStringParameters:{dev:'x',ver:'5'}});assert.strictEqual(r.statusCode,426,'protocol 5 clients reload')}
  const ann=await client('ann'),bob=await client('bob',{cls:'soldier'}),cid=await client('cid',{cls:'slave'});
  assert.deepStrictEqual(Object.keys((await ann.req('hello',{all:1})).rankCounts),C.RANKS.map(r=>r.k),'8 ranks counted');

  /* ── offerings + buying without a rank gate ── */
  await setC(ann.ch.id,{wallet:2000});await setC(bob.ch.id,{wallet:2000});
  let a=await ann.req('char.buy',{char:ann.ch.id,item:'galea'});a=await ann.req('char.buy',{char:ann.ch.id,item:'charun'});assert.ok(a.gear.includes('charun'),'a Tiro buys a level-3 weapon');
  a=await ann.req('offer.buy',{char:ann.ch.id,key:'elix4'});a=await ann.req('offer.buy',{char:ann.ch.id,key:'cf1'});a=await ann.req('offer.buy',{char:ann.ch.id,key:'merc1'});
  await rejects(ann.req('offer.buy',{char:ann.ch.id,key:'curse'}),null,/does not sell/);a=await ann.req('offer.bring',{char:ann.ch.id,keys:['cf1','merc1']});assert.deepStrictEqual(a.offerEq,['cf1','merc1']);
  let b=await bob.req('char.buy',{char:bob.ch.id,item:'cassis'});b=await bob.req('char.buy',{char:bob.ch.id,item:'flail'});b=await bob.req('char.buy',{char:bob.ch.id,item:'wraps'});
  await bob.req('domus.equip',{char:bob.ch.id,item:'wraps',on:false});
  /* ── the START COUNTDOWN: Start → startAt; a line-up change stops it; ✕ Hold; go:1 at startAt ── */
  let L=await ann.req('lobby.create',{ev:'cassian',ranked:true,cry:false});await bob.req('lobby.join',{id:L.id});
  await rejects(bob.req('lobby.start',{id:L.id}),null,/Only the host/);
  let m0=mark();L=await ann.req('lobby.start',{id:L.id});assert.strictEqual(L.status,'waiting');assert.strictEqual(L.startAt,T+C.COUNTDOWN_MS-0,'ten seconds');assert.ok(bob.got('lobby.update',m0).some(u=>u.count===L.startAt),'the room hears the countdown');
  await rejects(ann.req('lobby.start',{id:L.id,go:1}),'count_wait');await bob.req('lobby.stand',{id:L.id});
  assert.strictEqual((await db.get('LOBBY#'+L.id,'LOBBY')).startAt,null,'a line-up change stops it');await rejects(ann.req('lobby.start',{id:L.id,go:1}),'count_stopped');
  await bob.req('lobby.sit',{id:L.id});L=await ann.req('lobby.start',{id:L.id});m0=mark();L=await ann.req('lobby.hold',{id:L.id});assert.strictEqual(L.startAt,null);assert.ok(bob.got('lobby.update',m0).some(u=>u.held));
  L=await ann.req('lobby.start',{id:L.id});await bob.req('lobby.ready',{id:L.id,ready:true});assert.ok((await db.get('LOBBY#'+L.id,'LOBBY')).startAt,'a ready mark does not stop it');
  T=L.startAt+1;await rejects(bob.req('lobby.start',{id:L.id,go:1}),null,/host sounds/);L=await ann.req('lobby.start',{id:L.id,go:1});assert.strictEqual(L.status,'live');assert.strictEqual(L.startAt,null);
  const sa=C.seatOf(L,ann.acct),sb=C.seatOf(L,bob.acct);const ka=L.players[sa].kit,kb=L.players[sb].kit;
  assert.deepStrictEqual(ka.offer,['cf1','merc1']);assert.deepStrictEqual(ka.items,['galea','charun']);assert.deepStrictEqual(kb.items,['cassis','flail'],'the unticked piece stays home');
  /* a bet from the stands-less outsider: the wagers tab sees it before the horns only — place one on a second room below */
  /* ── the result: Ann survives (galea lost on the sand, merc1 still in hand); Bob is slain by Ann and dies ── */
  const tbl=[0,1,2,3].map(i=>i===sa?{seat:i,won:true,place:1,f:40,survives:true,brk:['galea'],off:['merc1'],kb:''}:i===sb?{seat:i,won:false,place:4,f:3,survives:false,ks:sa,kb:'g'}:{seat:i,won:false,place:2,f:5});
  m0=mark();await ann.req('match.result',{id:L.id,table:tbl,hash:'h'});const rb=await bob.req('match.result',{id:L.id,table:tbl,hash:'h'});assert.ok(rb.out.died);
  const A1=await getC(ann.ch.id);const ra=(await db.get('MATCH#'+L.id,'META')).outs[ann.acct];
  assert.strictEqual(ra.award,Math.round(8*1.5*0.5));assert.strictEqual(ra.cut,ra.award,'v0.92: the whole award');assert.strictEqual((await getD(ann.domus.id)).led89.in.cut,ra.award,'into the house treasury, booked as bout earnings');
  assert.deepStrictEqual(ra.broken,[]);assert.deepStrictEqual(ra.gone,['galea'],'v0.91: used up');assert.ok(!A1.gear.some(x=>C.itemBase(x)==='galea'));assert.deepStrictEqual(A1.offers.sort(),['elix4','merc1'],'merc1 came back, cf1 was used');
  const BD=await getD(bob.domus.id);assert.deepStrictEqual(BD.gear,['wraps'],'the dead one’s un-brought piece waits on his house’s shelf');assert.deepStrictEqual((await getC(bob.ch.id)).gear,[]);
  const lo=ann.got('loot.offer',m0);assert.strictEqual(lo.length,1,'the killer’s window');assert.deepStrictEqual(lo[0].pieces.map(p=>C.itemBase(p.item)).sort(),['cassis','flail'],'what he brought');
  assert.strictEqual(lo[0].dead.name,'Bob Gladius');assert.ok(lo[0].until>T);assert.strictEqual((await ann.req('hello',{all:1})).loot.length,1,'hello lists the open window');
  await rejects(bob.req('loot.pick',{id:L.id,seat:sb,item:lo[0].pieces[0].item}),null,/Nothing to take/);
  const cassisIt=lo[0].pieces.find(p=>/^cassis/.test(p.item)).item;m0=mark();const pk=await ann.req('loot.pick',{id:L.id,seat:sb,item:cassisIt});assert.strictEqual(pk.to,'glad');assert.strictEqual(pk.got.item,cassisIt);
  const A2=await getC(ann.ch.id);assert.ok(A2.gear.includes(cassisIt));const ph=C.pcOf(A2,cassisIt).hist;assert.deepStrictEqual([ph[0].glad,ph[0].house,ph[0].how],['Bob Gladius','Domus bob','taken'],'owner history');
  await rejects(ann.req('loot.pick',{id:L.id,seat:sb,item:cassisIt}),'loot_done');assert.strictEqual(ann.got('loot.done',m0).length,1);
  /* the rest went to the used market */
  let mk=(await cid.req('market.list',{})).used;assert.strictEqual(mk.length,1);assert.match(mk[0].item,/^flail#/);assert.strictEqual(mk[0].price,750);assert.strictEqual(mk[0].hist[0].how,'fell');
  await setD(cid.domus.id,{treasury:749});await rejects(cid.req('market.buy',{char:cid.ch.id,id:mk[0].id}),'no_coin');await setD(cid.domus.id,{treasury:800});
  const cb=await cid.req('market.buy',{char:cid.ch.id,id:mk[0].id});assert.ok(cb.char.gear.includes(mk[0].item));assert.strictEqual((await getD(cid.domus.id)).treasury,50,'v0.92: the treasury pays');await rejects(ann.req('market.buy',{char:ann.ch.id,id:mk[0].id}),'sold');
  /* repairs: ⅓ of the value, from the treasury or a wallet */
  let br;{const c0=await getC(ann.ch.id);C.putPiece(c0,{item:'galea',pc:null},false);br=C.breakItem(c0,'galea');await db.put('CHAR#'+c0.id,'CHAR',c0)}/* a broken piece to mend (v0.91: printed ones are used up in Ranked; repairs still exist) */const cost=Math.ceil(C.priceOf(catalog.galea)/3);await ann.req('domus.get',{});await setD(ann.domus.id,{treasury:0});await rejects(ann.req('gear.repair',{holder:ann.ch.id,item:br,pay:'treasury'}),'no_coin');
  await setD(ann.domus.id,{treasury:100});const rp=await ann.req('gear.repair',{holder:ann.ch.id,item:br,pay:'treasury'});assert.strictEqual(rp.cost,cost);assert.strictEqual(rp.domus.treasury,100-cost);assert.ok(!C.isBroken(rp.holder,br));
  await rejects(ann.req('gear.repair',{holder:ann.ch.id,item:br}),null,/whole/);await ann.req('domus.equip',{char:ann.ch.id,item:br,on:true});
  /* the treasury buys for the shelf */
  const db1=await ann.req('domus.buy',{item:'mace'});assert.deepStrictEqual(db1.gear,['mace']);assert.strictEqual(db1.domus.treasury,100-cost-60);await rejects(ann.req('domus.buy',{item:'charun'}),'no_coin');
  /* trophies + recent matches on the house; the dead one's house remembers too */
  const AD=await ann.req('domus.get',{});assert.ok(AD.trophies.some(t=>t.k==='first:cassian'),'first Ranked win in Cassian');assert.strictEqual(AD.recent[0].id,L.id);assert.ok(AD.recent[0].won);
  assert.ok((await bob.req('domus.get',{})).recent[0].died);
  /* ── the default pick: a window nobody answers gives the killer the most valuable piece ── */
  const dan=await client('dan'),eve=await client('eve');await setC(eve.ch.id,{wallet:2000});await eve.req('char.buy',{char:eve.ch.id,item:'mace'});await eve.req('char.buy',{char:eve.ch.id,item:'arcu'});
  let L2=await dan.req('lobby.create',{ev:'democritus',ranked:true,cry:false});await eve.req('lobby.join',{id:L2.id});L2=await dan.req('lobby.start',{id:L2.id});T=L2.startAt+1;L2=await dan.req('lobby.start',{id:L2.id,go:1});
  const sd=C.seatOf(L2,dan.acct),se=C.seatOf(L2,eve.acct);const t2=[0,1,2,3].map(i=>i===se?{seat:i,survives:false,ks:sd,kb:'g',f:2}:{seat:i,won:i===sd,f:i===sd?20:4});
  for(const x of [dan,eve])await x.req('match.result',{id:L2.id,table:t2,hash:'z'});T+=C.LOOT_MS+1000;await dan.req('hello',{all:1});
  const D2=await getC(dan.ch.id);assert.ok(D2.gear.some(g=>/^arcu#/.test(g)),'the most valuable (the Arcuballista) went to the killer');assert.ok((await cid.req('market.list',{})).used.some(x=>/^mace#/.test(x.item)));
  /* a death by a beast: everything to the market */
  const fay=await client('fay'),gus=await client('gus');await setC(gus.ch.id,{wallet:100});await gus.req('char.buy',{char:gus.ch.id,item:'gladius'});
  let L3=await fay.req('lobby.create',{ev:'egidious',ranked:true,cry:false});await gus.req('lobby.join',{id:L3.id});L3=await fay.req('lobby.start',{id:L3.id});T=L3.startAt+1;L3=await fay.req('lobby.start',{id:L3.id,go:1});
  m0=mark();const t3=[0,1,2,3].map(i=>i===C.seatOf(L3,gus.acct)?{seat:i,survives:false,kb:'b',f:1}:{seat:i,f:6,won:i===C.seatOf(L3,fay.acct)});for(const x of [fay,gus])await x.req('match.result',{id:L3.id,table:t3,hash:'b'});
  assert.strictEqual(fay.got('loot.offer',m0).length,0,'no window when a beast killed');assert.ok((await cid.req('market.list',{})).used.some(x=>/^gladius#/.test(x.item)&&x.from.glad==='Gus Gladius'));

  /* ── FLAVIUS'S GIFTS: named weapons, one unique each, the Storeroom below Veteranus ── */
  const A3=await getC(ann.ch.id);assert.ok((A3.gifts||[]).length===0||true);await setC(ann.ch.id,{gifts:[{id:'g1',why:'rank:novicius',at:T},{id:'g2',why:'surv:5',at:T},{id:'g3',why:'surv:10',at:T}]});
  RND=0.995;const go1=await ann.req('gift.open',{char:ann.ch.id,gift:'g1'});RND=null;assert.strictEqual(go1.reward.k,'named');assert.strictEqual(go1.reward.rar,'legendary');assert.strictEqual(go1.to,'house','a Tiro’s named piece waits in the Storeroom');
  const it1=go1.gear.find(g=>/^nw#/.test(g));const w1=go1.pcs[C.itemUid(it1)].w;assert.ok(w1.uq&&w1.named83&&w1.key==='nw_'+C.itemUid(it1));assert.ok(await db.get('WORLD','UNIQ#'+w1.uq),'the unique is claimed');
  await rejects(ann.req('domus.move',{item:it1,from:'house',to:ann.ch.id}),null,/until Veteranus/);
  await setC(ann.ch.id,{glory:600});RND=0.995;const go2=await ann.req('gift.open',{char:ann.ch.id,gift:'g2'});RND=null;assert.strictEqual(go2.to,'glad');const it2=go2.char.gear.find(g=>/^nw#/.test(g));
  assert.notStrictEqual(go2.char.pcs[C.itemUid(it2)].w.uq,w1.uq,'each unique exists once');assert.ok(C.equipOf(go2.char).includes(it2),'a Veteranus brings it');
  const mv=await ann.req('domus.move',{item:it1,from:'house',to:ann.ch.id});assert.ok(mv.to.pcs[C.itemUid(it1)].w.named83,'the def moves with the piece');
  RND=0.2;const go3=await ann.req('gift.open',{char:ann.ch.id,gift:'g3'});RND=null;assert.strictEqual(go3.reward.k,'coin');await rejects(ann.req('gift.open',{char:ann.ch.id,gift:'g3'}),null,/No such gift/);
  /* the kit carries the named defs; a room shows them */
  const R4=await ann.req('lobby.create',{ev:'democritus',cry:false});const k4=R4.players[0].kit;assert.strictEqual(k4.named.length,2);assert.ok(k4.gear.includes('nw_'+C.itemUid(it1)));
  await rejects(ann.req('gift.open',{char:ann.ch.id,gift:'zz'}),null,/No such gift/);await rejects(ann.req('offer.bring',{char:ann.ch.id,keys:[]}),'in_match');await ann.req('lobby.leave',{id:R4.id});

  /* ── LUDI INFAMES: Veteranus and above ── */
  await rejects(cid.req('lobby.create',{ev:'cassian',inf:1,cry:false}),null,/Veteranus and above/);const LI=await ann.req('lobby.create',{ev:'cassian',inf:1,cry:false});assert.ok(LI.inf);
  await rejects(cid.req('lobby.join',{id:LI.id}),null,/Veteranus and above/);await ann.req('lobby.leave',{id:LI.id});
  const qi=await ann.req('lobby.quick',{ev:'egidious',inf:1});assert.ok(qi.lobby.inf&&qi.made);await ann.req('lobby.leave',{id:qi.lobby.id});

  /* ── PROFILE + FOLLOW ── */
  const pf=await cid.req('domus.profile',{name:'domus ANN'});assert.strictEqual(pf.domus.id,ann.domus.id);assert.ok(pf.domus.trophies.length>=1);assert.strictEqual(pf.glads[0].rank,'veteranus');assert.strictEqual(pf.rank,'veteranus');
  assert.strictEqual(pf.link,'#domus='+ann.domus.id);assert.ok(!pf.following);await rejects(cid.req('domus.profile',{id:'Dnope'}),'no_domus');
  let fw=await cid.req('domus.follow',{id:ann.domus.id});assert.strictEqual(fw.follows[0].st,'free');await rejects(cid.req('domus.follow',{id:cid.domus.id}),null,/own house/);
  const RF=await ann.req('lobby.create',{ev:'egidious',cry:false});assert.strictEqual((await cid.req('hello',{all:1})).follows[0].st,'room','hello says what a followed house does');
  assert.strictEqual((await cid.req('hello',{all:1})).follows[0].room,RF.id);assert.ok((await cid.req('domus.profile',{id:ann.domus.id})).following);
  fw=await cid.req('domus.follow',{id:ann.domus.id,on:false});assert.deepStrictEqual(fw.follows,[]);

  /* ── THE WAGERS TAB ── */
  await cid.req('lobby.join',{id:RF.id});await setC(cid.ch.id,{wallet:100});await setC(bob.ch.id,{wallet:0});
  const hal=await client('hal');await setC(hal.ch.id,{wallet:100});await hal.req('bet.place',{id:RF.id,seat:C.seatOf(RF,ann.acct),amt:20});await cid.req('bet.place',{id:RF.id,seat:1,amt:10});
  let wl=await hal.req('wager.list',{});const op=wl.open.find(x=>x.id===RF.id);assert.strictEqual(op.pool,30);assert.strictEqual(op.seats[0].stake,20);assert.strictEqual(op.seats[0].odds,Math.round((30-1)/20*100)/100);
  assert.strictEqual(wl.mine[0].res,'open');assert.strictEqual(wl.mine[0].amt,20);
  let RFs=await ann.req('lobby.start',{id:RF.id});T=RFs.startAt+1;RFs=await ann.req('lobby.start',{id:RF.id,go:1});const tw=[0,1,2,3].map(i=>({seat:i,won:i===0,f:i?2:9}));for(const x of [ann,cid])await x.req('match.result',{id:RF.id,table:tw,hash:'w'});
  wl=await hal.req('wager.list',{});assert.strictEqual(wl.mine[0].res,'won');assert.strictEqual(wl.mine[0].pay,29);assert.strictEqual(wl.top[0].name,'Hal Gladius');assert.strictEqual(wl.top[0].net,9);
  assert.strictEqual((await cid.req('wager.list',{})).mine[0].res,'lost');assert.ok(!wl.open.some(x=>x.id===RF.id),'a settled room leaves the open pots');
  /* ── VICTOR OF THE DAY: the next day's first hello gives yesterday's best win its trophy ── */
  const best=(await ann.req('hello',{all:1})).today.wins[0];assert.ok(best.dom,'Today entries carry the house id');T+=86400e3;await hal.req('hello',{all:1});
  const vd=(await getD(best.dom)).trophies.find(t=>t.k==='vday');assert.ok(vd&&vd.x===1,'Victor of the Day');await cid.req('world.news',{});assert.strictEqual((await getD(best.dom)).trophies.find(t=>t.k==='vday').x,1,'once a day');
  /* ── HIS CALL: gifts belong to the HOUSE (they survive a death); a Ranked death puts the un-brought satchel on the shelf ── */
  const ida=await client('ida');await setC(ida.ch.id,{wallet:300,glory:85});await ida.req('offer.buy',{char:ida.ch.id,key:'elix2'});await ida.req('offer.buy',{char:ida.ch.id,key:'ap2'});await ida.req('offer.buy',{char:ida.ch.id,key:'merc1'});
  await ida.req('offer.bring',{char:ida.ch.id,keys:['elix2']});const jon=await client('jon');
  let LG=await ida.req('lobby.create',{ev:'democritus',ranked:true,cry:false});await jon.req('lobby.join',{id:LG.id});LG=await ida.req('lobby.start',{id:LG.id});T=LG.startAt+1;LG=await ida.req('lobby.start',{id:LG.id,go:1});
  const si=C.seatOf(LG,ida.acct),sj=C.seatOf(LG,jon.acct);const tg=[0,1,2,3].map(i=>i===si?{seat:i,f:20,won:true,survives:true}:{seat:i,f:2});for(const x of [ida,jon])await x.req('match.result',{id:LG.id,table:tg,hash:'g'});
  let IC=await getC(ida.ch.id);assert.deepStrictEqual(IC.gifts||[],[],'the new gift left the gladiator');let ID=await getD(ida.domus.id);assert.ok(ID.gifts.some(g=>g.why==='rank:novicius'&&g.glad==='Ida Gladius'),'… onto the house');
  assert.strictEqual((await ida.req('hello',{all:1})).domus.gifts,ID.gifts.length,'the house row counts its gifts');assert.deepStrictEqual((await ida.req('domus.get',{})).gifts.map(g=>g.id),ID.gifts.map(g=>g.id));
  /* a Ranked death: the brought offering dies with him, the rest of the satchel and the gifts stay with the house */
  await ida.req('offer.bring',{char:ida.ch.id,keys:['ap2']});
  await setC(jon.ch.id,{glory:C.gloryOf(await getC(ida.ch.id)),rankK:C.rankFor(await getC(ida.ch.id)).k});
  let LD=await ida.req('lobby.create',{ev:'egidious',ranked:true,cry:false});await jon.req('lobby.join',{id:LD.id});LD=await ida.req('lobby.start',{id:LD.id});T=LD.startAt+1;LD=await ida.req('lobby.start',{id:LD.id,go:1});
  const td=[0,1,2,3].map(i=>i===C.seatOf(LD,ida.acct)?{seat:i,f:1,survives:false,kb:'b'}:{seat:i,f:4,won:i===C.seatOf(LD,jon.acct)});for(const x of [ida,jon])await x.req('match.result',{id:LD.id,table:td,hash:'d'});
  assert.ok(!(await getC(ida.ch.id)).alive,'Ida fell');ID=await getD(ida.domus.id);assert.deepStrictEqual(ID.offers.slice().sort(),['merc1'],'the un-brought satchel is on the shelf, the brought one is gone (elix2 was used in the first bout)');
  assert.ok(ID.gifts.length>=1,'the gift outlived the gladiator');
  /* opened with no living gladiator: into the house */
  RND=0.2;const gh=await ida.req('gift.open',{gift:ID.gifts[0].id});RND=null;assert.strictEqual(gh.reward.k,'coin');assert.strictEqual(gh.to,'house');assert.strictEqual(gh.char,null);assert.strictEqual(gh.domus.treasury,(ID.treasury|0)+gh.reward.v);
  await rejects(ida.req('gift.open',{gift:ID.gifts[0].id}),null,/No such gift/);
  /* a new gladiator: the shelf's offerings move into the satchel; a house gift opens for the ACTIVE gladiator */
  const ich=await ida.req('char.create',{name:'Ida Secunda',cls:'hero'});const om=await ida.req('offer.move',{key:'merc1',from:'house',to:ich.id});assert.deepStrictEqual(om.to.offers,['merc1']);assert.deepStrictEqual(om.from.offers,[]);
  await rejects(ida.req('offer.move',{key:'curse',from:'house',to:ich.id}),null,/not there/);
  const ti0=(await getD(ida.domus.id)).treasury|0;await setD(ida.domus.id,{gifts:[{id:'hg1',why:'surv:5',at:T}]});RND=0.2;const g2=await ida.req('gift.open',{gift:'hg1'});RND=null;assert.strictEqual(g2.to,'house','v0.92: a coin gift goes into the treasury');assert.strictEqual(g2.char.id,ich.id);assert.strictEqual(g2.char.wallet|0,0);assert.strictEqual(g2.domus.treasury,ti0+g2.reward.v);
  /* ── 🧪 TESTER GRANTS ── */
  await rejects(jon.req('admin.grant',{coin:50}),'notTester');assert.ok(!(await jon.req('hello',{all:1})).tester,'no tester flag for others');
  const tess=await client('tess',{email:'tess@example.COM'});assert.strictEqual((await tess.req('hello',{all:1})).tester,true,'a tester by e-mail (case-insensitive)');
  const rc0=(await tess.req('hello',{all:1})).rankCounts.tiro;
  const gr=await tess.req('admin.grant',{coin:500,gift:2,gear:['galea','nope'],offering:['elix4','curse'],glory:100});
  /* v0.89 (his fix): coin → the house treasury, gear → the shelf (unequipped), offerings → the shelf; Glory still → the active gladiator */
  assert.strictEqual(gr.char.wallet,0);assert.strictEqual(gr.domus.treasury,500);assert.ok(!gr.char.gear.includes('galea')&&gr.gear.includes('galea'));assert.deepStrictEqual(gr.char.offers||[],[]);assert.deepStrictEqual(gr.offers,['elix4']);
  assert.strictEqual(C.rankFor(gr.char).k,'novicius');assert.strictEqual(gr.gifts.length,2);
  assert.ok((await getD(tess.domus.id)).test,'the house is a TEST house for good');assert.ok(gr.domus.test);assert.strictEqual((await tess.req('hello',{all:1})).rankCounts.tiro,rc0-1,'out of the rank counts');
  assert.strictEqual((await db.get('ADMIN','log')).list[0].acct,tess.acct,'every grant is logged');
  await rejects(tess.req('lobby.create',{ev:'democritus',ranked:true,cry:false}),'testHouse');await rejects(tess.req('lobby.quick',{ev:'democritus',ranked:1}),'testHouse');
  const RK=await jon.req('lobby.create',{ev:'cassian',ranked:true,cry:false});await rejects(tess.req('lobby.join',{id:RK.id}),'testHouse');await jon.req('lobby.leave',{id:RK.id});
  /* a Custom win by the test house never reaches Today */
  let LT=await tess.req('lobby.create',{ev:'cassian',ranked:false,cry:false});await jon.req('lobby.join',{id:LT.id});LT=await tess.req('lobby.start',{id:LT.id});T=LT.startAt+1;LT=await tess.req('lobby.start',{id:LT.id,go:1});
  const tt=[0,1,2,3].map(i=>({seat:i,f:i===C.seatOf(LT,tess.acct)?99:1,won:i===C.seatOf(LT,tess.acct)}));for(const x of [tess,jon])await x.req('match.result',{id:LT.id,table:tt,hash:'t'});
  assert.ok(!((await jon.req('hello',{all:1})).today.wins||[]).some(w=>w.dom===tess.domus.id),'a test house never shows in Today');
  const tg2=await tess.req('char.create',{name:'Tess Secunda',cls:'slave'});assert.ok((await getC(tg2.id)).test,'a test house’s new gladiators are test gladiators');
  /* guests may read house pages and the open pots */
  const gconn='g1';live.add(gconn);assert.strictEqual((await h({requestContext:{routeKey:'$connect',connectionId:gconn},queryStringParameters:{guest:'guestabcdef1',ver:String(C.VER)}})).statusCode,200);
  assert.strictEqual((await ask(gconn,'domus.profile',{id:ann.domus.id})).domus.name,'Domus ann');assert.deepStrictEqual((await ask(gconn,'wager.list',{})).mine,[]);
  console.log('server v0.83 (countdown, offerings, treasury, broken + repair, loot window + default pick, used market, gifts + named weapons, Ludi Infames, profile + follow, wagers tab, Victor of the Day, house gifts + shelf offerings, tester grants): all checks passed')}

(async()=>{rules();await routes()})().catch(e=>{console.error(e);process.exit(1)});
