/* v0.89 THE DOMUS REBUILD (part H, contract tools/plans/onl89-domus.md): the look locked + class from the treasury, dressing from the Domus,
   keep home (out of Ranked kits), saved loadouts, the treasury ledger, the memorial wall, colours + crest, upgrades, tester grants to the house.
   node server/test/v89d.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');

/* ── 1. the shared rules ── */
function rules(){C.setCatalog(catalog);
  assert.strictEqual(C.gladMax({}),4);assert.strictEqual(C.gladMax({upg89:{slot5:1}}),5);assert.strictEqual(C.shelfMax({}),30);assert.strictEqual(C.shelfMax({upg89:{shelf:1}}),34);
  /* the look is set at creation; the class only through char.class */
  const g=C.newChar({name:'Rule Keeper',cls:'hero',look:{token:{sc:1,c1:'#aa0000'}}},'o','rk',0);
  assert.throws(()=>C.editChar(g,{cls:'slave'}),/Change class in the Domus/);assert.throws(()=>C.editChar(g,{look:{token:{sc:1,c1:'#00aa00'}}}),/look is set/);
  C.editChar(g,{name:'Rule Bender',look:{token:{c1:'#aa0000',sc:1}},cls:'hero'});assert.strictEqual(g.name,'Rule Bender','the same look and class pass; the name changes');
  const old=C.newChar({name:'Old Token',cls:'hero',look:{color:'#112233'}},'o','ot',0);C.editChar(old,{look:{color:'#112233',token:{sc:1}}});assert.ok(old.look.token.sc,'the one-time sculpted conversion passes');
  assert.throws(()=>C.editChar(C.newChar({name:'Old Token',cls:'hero',look:{color:'#112233'}},'o','o2',0),{look:{color:'#445566'}}),/look is set/,'an old look without the conversion stays');
  assert.match(C.classWhy(g,'hero',{treasury:500}),/already/);assert.match(C.classWhy(g,'dragon',{treasury:500}),/eight printed/);assert.match(C.classWhy(g,'slave',{treasury:99}),/100 coin/);assert.strictEqual(C.classWhy(g,'slave',{treasury:100}),'');
  /* dressing: the incoming pieces, what he wears (≤2 bought weapons, one per point), the rest to the shelf */
  const d=C.newChar({name:'Dress Up',cls:'hero'},'o','du',0);d.gear=['gladius','galea','ocrea'];
  let r=C.dressApply(d,['galea','axe','gladius','mace','greaves','ocrea'],[{item:'axe',pc:null},{item:'mace',pc:null},{item:'greaves',pc:null}],catalog);
  assert.deepStrictEqual(r.eq,['galea','axe','gladius','greaves'],'two weapons, the first of the lower-leg pair wins');assert.deepStrictEqual(r.off.map(p=>p.item).sort(),['mace','ocrea']);assert.deepStrictEqual(d.gear.slice().sort(),['axe','galea','gladius','greaves']);
  r=C.dressApply(d,['gladius'],[],catalog);assert.deepStrictEqual(d.gear,['gladius']);assert.deepStrictEqual(d.equip,['gladius']);
  /* keep home: tagged, listed in the kit, stripped from a Ranked room only */
  /* v0.91: named pieces only — a printed piece is refused, an old printed flag is ignored */
  const h=C.newChar({name:'Home Body',cls:'hero'},'o','hb',0);h.glory=600;h.gear=['gladius'];h.equip=['gladius'];const NP=C.namedPiece(C.rollNamed(()=>0.3,catalog,'rare',[]),h);C.putPiece(h,NP,true);
  assert.throws(()=>C.homeSet(h,'gladius',true),/named/);
  const hid=C.homeSet(h,NP.item,true);
  assert.strictEqual(hid,NP.item);assert.ok(C.isHome(h,hid));assert.deepStrictEqual(C.equipOf(h),['gladius',hid],'still worn (Custom)');
  {const o=C.newChar({name:'Old Flag',cls:'hero'},'o','of',0);o.gear=['galea#of.1'];o.equip=['galea#of.1'];o.pcs={'of.1':{st:'whole',home:1}};assert.ok(!C.isHome(o,'galea#of.1'),'an old printed flag is ignored');
    const ko=C.kitOf(o);assert.ok(!ko.home&&ko.items.includes('galea#of.1'));assert.ok(C.kitStrip(ko).items.includes('galea#of.1'))}
  const kit=C.kitOf(h);assert.deepStrictEqual(kit.home,[hid]);const ks=C.kitStrip(kit);assert.deepStrictEqual(ks.items,['gladius']);assert.deepStrictEqual(ks.gear,['gladius']);assert.ok(!(ks.named||[]).length);assert.ok(!ks.home);
  const LR=C.newLobby({ev:'cassian',ranked:true},{id:'a',name:'A',char:'hb',rank:'tiro'},'L1',1),LC=C.newLobby({ev:'cassian'},{id:'a',name:'A',char:'hb',rank:'tiro'},'L2',1);const who=[{id:'a',name:'A',char:'hb',rank:'tiro',kit}];
  C.roomJoin(LR,who.map(x=>({...x,kit:{...kit}})),1);C.roomJoin(LC,who.map(x=>({...x,kit:{...kit}})),1);
  const kr=(LR.players[0]||LR.members[0]).kit,kc=(LC.players[0]||LC.members[0]).kit;assert.ok(!kr.items.includes(hid)&&kc.items.includes(hid),'Ranked leaves it home, Custom brings it');
  assert.strictEqual(C.homeSet(h,hid,false),hid);assert.ok(!C.isHome(h,hid));
  /* the ledger */
  const D={id:'D1',treasury:0};C.ledAdd(D,'cut',12,{id:'g1',name:'One'},5);C.ledAdd(D,'cut',8,{id:'g1',name:'One'});C.ledAdd(D,'cut',3,{id:'g2',name:'Two'});C.ledAdd(D,'grant',100);C.ledAdd(D,'class',100);C.ledAdd(D,'nope',5);
  const L=C.ledgerOf(D);assert.deepStrictEqual([L.in.cut,L.in.grant,L.out.class,L.tin,L.tout,L.since],[23,100,100,123,100,5]);assert.deepStrictEqual(L.by.map(x=>[x.id,x.v]),[['g1',20],['g2',3]]);
  const so={id:'D2',treasury:0,offers:[]};C.offersIn(so,Array(32).fill('elix2'));assert.strictEqual(so.offers.length,30);assert.strictEqual(so.treasury,40);assert.strictEqual(C.ledgerOf(so).in.sale,40,'offerings sold for a full shelf');
  {const GD={treasury:0};C.applyGiftHouse(GD,{k:'coin',v:30});C.applyGiftHouse(GD,{k:'cf',v:2});assert.strictEqual(C.ledgerOf(GD).in.gift,30+2*C.CFB_COIN,'house gifts into the ledger')}
  so.upg89={shelf:1};assert.strictEqual(C.offerMoveWhy({offers:['ap2'],cls:'hero',owner:'o'},so,'ap2'),'','the bigger shelf takes more');
  /* memorial, colours, loadouts */
  const m=C.memoEntry({id:'x',name:'Fallen One',cls:'hero',died:{rank:'gregarius'}},{ev:'cassian',loc:3,at:9},C.memoBy({kb:'g'},{},'Killer Bee'));assert.deepStrictEqual([m.rank,m.ev,m.loc,m.by.k,m.by.n,m.fa],['gregarius','cassian',3,'g','Killer Bee','p']);
  assert.deepStrictEqual(C.memoBy({kb:''},{abandoned:1}),{k:'abandon'});assert.deepStrictEqual(C.memoBy({kb:''},{}),{k:'fate'});
  const MD={};for(let i=0;i<70;i++)C.memoAdd(MD,{id:'m'+i});assert.strictEqual(MD.memo89.length,C.MEMO_MAX89);assert.strictEqual(MD.memo89[0].id,'m69');
  assert.throws(()=>C.cleanLook89({c1:'#123456',c2:'red',crest:'eagle'}),/colours/);assert.throws(()=>C.cleanLook89({c1:'#123456',c2:'#654321',crest:'dragonx'}),/printed crests/);
  assert.deepStrictEqual(C.cleanLook89({c1:'#ABCDEF',c2:'#654321',crest:'wolf'}),{c1:'#abcdef',c2:'#654321',crest:'wolf'});
  const kk=C.cleanKits(h,[{n:'Ranked <b>',items:['gladius','nothere','gladius']}]);assert.deepStrictEqual(kk,[{n:'Ranked b',items:['gladius']}]);assert.throws(()=>C.cleanKits(h,[1,2,3,4].map(()=>({n:'x',items:[]}))),/Up to 3/);
  console.log('v0.89 domus rules (look lock, class fee, dressing, keep home, ledger, shelf, memorial, colours, loadouts): all checks passed')}

/* ── 2. the routes, through the real handler ── */
async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=Date.UTC(2026,9,6,12);const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,testers:'tess@example.com'});
  let nc=0,rid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  const connect=async(name,email)=>{const conn='w'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER),...(email?{email}:{})}});assert.strictEqual(r.statusCode,200);return conn};
  async function client(name,o={}){const cl={name,acct:'dev-'+name};cl.conn=await connect(name,o.email);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;
    cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:o.cls||'hero'});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const getD=id=>db.get('DOMUS#'+id,'DOMUS');const setD=async(id,f)=>{const D=await getD(id);Object.assign(D,f);await db.put('DOMUS#'+id,'DOMUS',D)};
  async function bout(a,b,o){const L0=await a.req('lobby.create',{ev:o.ev||'democritus',loc:o.loc||6,ranked:!!o.ranked,cry:false});await b.req('lobby.join',{id:L0.id});const L=await a.req('lobby.start',{id:L0.id});
    const sa=C.seatOf(L,a.acct),sb=C.seatOf(L,b.acct);const tb=[0,1,2,3].map(i=>({seat:i,f:3,...(i===sa?o.a||{}:i===sb?o.b||{}:{})}));if(o.live)return {L,sa,sb};
    for(const x of [a,b])await x.req('match.result',{id:L.id,table:tb,hash:'x'+L.id});return {L,sa,sb,M:await db.get('MATCH#'+L.id,'META')}}
  const ann=await client('ann'),bob=await client('bob',{cls:'soldier'});

  /* ── the class from the treasury ── */
  await rejects(ann.req('char.class',{char:ann.ch.id,cls:'slave'}),'no_coin');await setD(ann.domus.id,{treasury:250});
  await rejects(ann.req('char.edit',{char:ann.ch.id,cls:'slave'}),null,/Change class in the Domus/);
  const cc=await ann.req('char.class',{char:ann.ch.id,cls:'slave'});assert.strictEqual(cc.char.cls,'slave');assert.strictEqual(cc.domus.treasury,150);assert.strictEqual(cc.domus.led89.out.class,100);
  await rejects(ann.req('char.class',{char:ann.ch.id,cls:'slave'}),null,/already/);
  const RM=await ann.req('lobby.create',{ev:'cassian',cry:false});await rejects(ann.req('char.class',{char:ann.ch.id,cls:'hero'}),'in_match');await ann.req('lobby.leave',{id:RM.id});
  /* the look stays */
  await setC(ann.ch.id,{look:{token:{sc:1,c1:'#aa0000'}}});await rejects(ann.req('char.edit',{char:ann.ch.id,look:{token:{sc:1,c1:'#00aa00'}}}),null,/look is set/);

  /* ── dressing from the Domus ── */
  await setD(ann.domus.id,{gear:['galea','gladius','ocrea']});await setC(ann.ch.id,{gear:['axe'],equip:['axe']});
  let dr=await ann.req('domus.dress',{char:ann.ch.id,equip:['galea','gladius','axe'],take:[{item:'galea',from:'house'},{item:'gladius',from:'house'}]});
  assert.deepStrictEqual(C.equipOf(dr.char),['galea','gladius','axe']);assert.deepStrictEqual(dr.gear,['ocrea']);
  dr=await ann.req('domus.dress',{char:ann.ch.id,equip:['galea','axe']});assert.deepStrictEqual(dr.char.gear.slice().sort(),['axe','galea'],'taken off → the shelf');assert.deepStrictEqual(dr.gear.slice().sort(),['gladius','ocrea']);
  await rejects(ann.req('domus.dress',{char:ann.ch.id,equip:[],take:[{item:'mace',from:'house'}]}),null,/not there/);
  {const def=C.rollNamed(()=>0.3,catalog,'rare',[]);const D0=await getD(ann.domus.id);const P=C.namedPiece(def,D0);C.putPiece(D0,P,false);await db.put('DOMUS#'+D0.id,'DOMUS',D0);
    await rejects(ann.req('domus.dress',{char:ann.ch.id,equip:[P.item],take:[{item:P.item,from:'house'}]}),null,/Veteranus/)}
  /* from another gladiator of the house; never from someone else's */
  const a2=await ann.req('char.create',{name:'Ann Secunda',cls:'hero'});await setC(a2.id,{gear:['manica'],equip:['manica']});
  dr=await ann.req('domus.dress',{char:ann.ch.id,equip:['galea','axe','manica'],take:[{item:'manica',from:a2.id}]});assert.ok(dr.char.gear.includes('manica')&&dr.from[0].id===a2.id&&!dr.from[0].gear.includes('manica'));
  await rejects(ann.req('domus.dress',{char:ann.ch.id,equip:[],take:[{item:'gladius',from:bob.ch.id}]}),null,/Not of your house/);

  /* ── keep home: worn in Custom, left home in Ranked ── */
  await rejects(ann.req('gear.home',{holder:ann.ch.id,item:'galea',on:true}),'home_named');
  /* v0.91: a named helm in place of the galea (Veteranus wears named pieces) */
  let NH=null;for(let sd=1;sd<400&&!NH;sd++){let x=sd*9301+49297;const r=()=>(x=(x*9301+49297)%233280)/233280;const a=C.rollNamedArmor(r,catalog,'rare',[]);if(a&&a.slot==='head')NH=a}
  {const c=await getC(ann.ch.id);const P=C.namedPiece(NH,c);c.gear=c.gear.map(g=>g==='galea'?P.item:g);c.equip=(c.equip||[]).map(g=>g==='galea'?P.item:g);c.pcs={...(c.pcs||{}),[C.itemUid(P.item)]:P.pc};c.glory=600;await db.put('CHAR#'+c.id,'CHAR',c)}
  const hm=await ann.req('gear.home',{holder:ann.ch.id,item:(await getC(ann.ch.id)).gear.find(g=>/^na#/.test(g)),on:true});assert.match(hm.item,/^na#/);assert.ok(hm.holder.pcs[C.itemUid(hm.item)].home);
  let LC=await ann.req('lobby.create',{ev:'cassian',cry:false});assert.ok(LC.players[0].kit.items.includes(hm.item),'Custom brings it');await ann.req('lobby.leave',{id:LC.id});
  let LR=await ann.req('lobby.create',{ev:'cassian',ranked:true,cry:false});assert.ok(!LR.players[0].kit.items.includes(hm.item)&&LR.players[0].kit.items.includes('axe'),'Ranked leaves it home');await ann.req('lobby.leave',{id:LR.id});
  await rejects(ann.req('gear.home',{holder:'house',item:'ocrea',on:true}),'home_named');

  /* ── saved loadouts ── */
  let kt=await ann.req('char.kits',{char:ann.ch.id,kits:[{n:'Ranked',items:[hm.item,'axe','manica','ghost']}]});assert.deepStrictEqual(kt.char.kits89,[{n:'Ranked',items:[hm.item,'axe','manica']}]);
  await ann.req('domus.dress',{char:ann.ch.id,equip:['axe']});/* galea + manica → the shelf */
  await setC(a2.id,{gear:[]});{const D0=await getD(ann.domus.id);const g=D0.gear.slice();g.splice(g.indexOf('manica'),1);await setD(ann.domus.id,{gear:g})}await setC(a2.id,{gear:['manica']});
  let ka=await ann.req('char.kitapply',{char:ann.ch.id,i:0});assert.deepStrictEqual(C.equipOf(ka.char).slice().sort(),[hm.item,'axe'].sort(),'the helm came back from the shelf');
  assert.deepStrictEqual(ka.skipped.map(s=>[s.item,s.why]),[['manica','with:Ann Secunda']],'the manica is with another gladiator');
  {const c0=await getC(ann.ch.id);C.breakItem(c0,'axe');await db.put('CHAR#'+c0.id,'CHAR',c0)}ka=await ann.req('char.kitapply',{char:ann.ch.id,i:0});assert.ok(ka.skipped.some(s=>s.why==='broken'||s.why==='gone'),'a broken piece is skipped');
  await rejects(ann.req('char.kitapply',{char:ann.ch.id,i:2}),null,/No such loadout/);

  /* ── upgrades ── */
  await setD(ann.domus.id,{treasury:100});await rejects(ann.req('domus.upgrade',{k:'slot5'}),'no_coin');await setD(ann.domus.id,{treasury:2000});
  let up=await ann.req('domus.upgrade',{k:'slot5'});assert.strictEqual(up.domus.gmax,5);assert.strictEqual(up.domus.treasury,500);await rejects(ann.req('domus.upgrade',{k:'slot5'}),null,/Already built/);
  up=await ann.req('domus.upgrade',{k:'shelf'});assert.strictEqual(up.domus.smax,34);assert.strictEqual(up.domus.led89.out.upg,1900);
  for(const n of ['Tertia','Quarta','Quinta'])await ann.req('char.create',{name:'Ann '+n,cls:'slave'});await rejects(ann.req('char.create',{name:'Ann Sexta',cls:'slave'}),null,/Up to 5/);
  await rejects(bob.req('char.create',{name:'Bob B',cls:'slave'}).then(()=>bob.req('char.create',{name:'Bob C',cls:'slave'})).then(()=>bob.req('char.create',{name:'Bob D',cls:'slave'})).then(()=>bob.req('char.create',{name:'Bob E',cls:'slave'})),null,/Up to 4/);

  /* ── colours + crest ── */
  await rejects(ann.req('domus.look',{c1:'#123456',c2:'#654321',crest:'unicorn'}),null,/printed crests/);const lk=await ann.req('domus.look',{c1:'#7a2230',c2:'#D6AB4C',crest:'wolf'});assert.deepStrictEqual(lk.domus.look89,{c1:'#7a2230',c2:'#d6ab4c',crest:'wolf'});
  assert.deepStrictEqual((await ann.req('hello',{all:1})).domus.look89.crest,'wolf');

  /* ── the ledger: the treasury buys + repairs, a Ranked cut by gladiator; the memorial ── */
  await setD(ann.domus.id,{treasury:1000});const by=await ann.req('domus.buy',{item:'gladius'});assert.strictEqual(by.domus.led89.out.gear,C.priceOf(catalog.gladius));
  {const D0=await getD(ann.domus.id);const it=C.breakItem(D0,'gladius');await db.put('DOMUS#'+D0.id,'DOMUS',D0);const rp=await ann.req('gear.repair',{holder:'house',item:it});assert.strictEqual(rp.domus.led89.out.repair,rp.cost)}
  const cid=await client('cid'),dan=await client('dan');for(const x of [cid,dan])await setC(x.ch.id,{glory:100});
  await bout(cid,dan,{ranked:true,a:{won:true,survives:true,f:10},b:{survives:true,f:3}});const DC=await getD(cid.domus.id);
  assert.ok(DC.led89&&DC.led89.in.cut>0&&DC.led89.by[cid.ch.id].v===DC.led89.in.cut,'the cut, by gladiator');assert.strictEqual(DC.treasury,DC.led89.in.cut);
  const lv=await bout(cid,dan,{ranked:true,live:true});const tl=[0,1,2,3].map(i=>i===lv.sb?{seat:i,survives:false,ks:lv.sa,kb:'g',f:1}:{seat:i,f:5,won:i===lv.sa});for(const x of [cid,dan])await x.req('match.result',{id:lv.L.id,table:tl,hash:'d'});
  const dg=await dan.req('domus.get',{});assert.strictEqual(dg.memo.length,1);const me=dg.memo[0];
  assert.deepStrictEqual([me.id,me.name,me.ev,me.loc,me.by.k,me.by.n],[dan.ch.id,'Dan Gladius','democritus',6,'g','Cid Gladius'],'the memorial names the bout and the killer');
  /* a Ranked abandon: Damnatio on the wall */
  const dn2=await dan.req('char.create',{name:'Dan Secunda',cls:'hero'});await dan.req('char.active',{char:dn2.id});await setC(dn2.id,{glory:100});await setC(cid.ch.id,{glory:100});const lv2=await bout(cid,dan,{ranked:true,live:true});await dan.req('match.abandon',{id:lv2.L.id});
  assert.strictEqual((await dan.req('domus.get',{})).memo[0].by.k,'abandon');

  /* ── tester grants: coin → the treasury, gear + offerings → the shelf ── */
  const tess=await client('tess',{email:'tess@example.com'});const gr=await tess.req('admin.grant',{coin:300,gear:['galea'],offering:['ap2']});
  assert.strictEqual(gr.char.wallet|0,0);assert.ok(!(gr.char.gear||[]).includes('galea'));assert.strictEqual(gr.domus.treasury,300);assert.strictEqual(gr.domus.led89.in.grant,300);assert.ok(gr.gear.includes('galea'));assert.deepStrictEqual(gr.offers,['ap2']);
  console.log('server v0.89 domus (class fee, look lock, dress from the shelf + another gladiator, named wait, keep home out of Ranked, loadouts + skips, upgrades + caps, colours + crest, ledger: class/upg/gear/repair/cut by gladiator/grant, memorial: killer + abandon, tester grants to the house): all checks passed')}

rules();routes().catch(e=>{console.error(e);process.exit(1)});
