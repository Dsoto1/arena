/* v1.0 BALANCE (the "v1.0 BALANCE" section of onlcore + its block in routes.js; his picks O1 O2 O3 from tools/plans/balance100/REPORT.md):
   O1 printed gear lost in a Ranked bout comes home dented (repair a tenth of its value); a Ranked death: the human killer still takes one piece of
   his choice, the printed pieces nobody takes go home to the dead man's house shelf dented (not the used market), named ones to Flavius's chest;
   the survival award ladder 24/30/36/42/50/60/70/80 (gift coin keeps the old table);
   O2 rank Glory thresholds halved (never demoted); O3 a rank-up gift once per house per rank. node server/test/v100bal.test.js */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');const catalog=require('../src/catalog.json');

function units(){C.setCatalog(catalog);
  /* O2 the thresholds */
  assert.deepStrictEqual(C.RANKS.map(r=>[r.k,r.glory]),[['tiro',0],['novicius',45],['gregarius',90],['veteranus',275],['primus',575],['summa',1050],['rudiarius',1750],['invictus',2750]]);
  assert.strictEqual(C.rankByGlory(274).k,'gregarius');assert.strictEqual(C.rankByGlory(275).k,'veteranus');
  const old=C.newChar({name:'Never Down',cls:'hero'},'o','nd',0);old.glory=10;old.rankK='veteranus';assert.strictEqual(C.rankFor(old).k,'veteranus','never demoted');
  const vt=C.newChar({name:'Vet Now',cls:'hero'},'o','vn',0);vt.glory=300;assert.ok(C.canWearNamed(vt),'named gear at Veteranus = 275 Glory');vt.glory=270;assert.ok(!C.canWearNamed(vt));
  /* the award ladder (a rank-up never pays less); the gift coin keeps the old table */
  assert.deepStrictEqual(C.RANKS.map(r=>C.AWARD[r.k]),[24,30,36,42,50,60,70,80]);for(let i=1;i<C.RANKS.length;i++)assert.ok(C.AWARD[C.RANKS[i].k]>C.AWARD[C.RANKS[i-1].k],'never less after a rank-up');assert.deepStrictEqual([C.AWARD_GIFT100.tiro,C.AWARD_GIFT100.gregarius,C.AWARD_GIFT100.veteranus],[8,12,18]);
  const ch=C.newChar({name:'Award Taker',cls:'hero'},'o','at',0);const o=C.applyResult(ch,{won:false,f:2,survives:true},true,{humans:4,now:1});assert.strictEqual(o.award,24);assert.strictEqual(o.cut,24,'into the treasury');
  {const seq=[0,0.5];const rnd=()=>seq.length?seq.shift():0.5;const g=C.rollGift(rnd,catalog,'tiro');assert.strictEqual(g.k,'coin');
    const lo=C.GIFT_COIN89[0],hi=C.GIFT_COIN89[1];assert.strictEqual(g.v,Math.round(8*(lo+0.5*(hi-lo))),'gift coin on the old Tiro award (8)');assert.strictEqual(C.AWARD.tiro,24,'the table is back after the roll')}
  /* O1 repairs */
  const P=(it,pc)=>C.pieceInfo({item:it,pc},catalog);
  assert.strictEqual(C.repairCost(P('galea#a',{st:'damaged',dmg:0.3})),Math.ceil(C.priceOf(catalog.galea)/10),'a tenth, however dented');
  assert.strictEqual(C.repairCost(P('charun#b',{st:'broken'})),Math.ceil(C.priceOf(catalog.charun)/10),'an old broken printed piece too');
  assert.strictEqual(C.repairCost({named:true,st:'broken',val:3000}),1000,'named keep a third');assert.strictEqual(C.repairCost(P('galea#c',{st:'damaged',dmg:1,iss:1})),0,'Issued: nothing');
  /* O1 a survivor: lost printed → dented in place (still with him), lost named → broken, lost Issued → vanishes */
  const s=C.newChar({name:'Survivor',cls:'hero'},'o','sv',0);s.gear=['galea','gladius','wraps'];s.equip=s.gear.slice();
  const nw=C.namedPiece(C.rollNamed(()=>0.3,catalog,'rare',[]),s);C.putPiece(s,nw,true);s.glory=400;
  for(const p of C.kitPieces92(s,['legwraps'],true))C.putPiece(s,p,true);const iss=s.gear.find(x=>/^legwraps#/.test(x));
  const k=C.kitOf(s);const nkey=C.engineKey(nw.item);assert.ok(k.gear.includes(nkey));
  const gx=C.gearAfter(s,k,C.cleanRow({survives:true,brk:['gladius','galea',nkey,'legwraps']}),true);
  assert.deepStrictEqual(gx.dent100.map(x=>x.key).sort(),['galea','gladius']);for(const x of gx.dent100){assert.ok(s.gear.includes(x.item)&&C.isDamaged91(s,x.item),'dented, still his');assert.strictEqual(C.pcOf(s,x.item).dmg,1)}
  assert.ok(s.equip.some(x=>C.itemBase(x)==='galea'),'still worn (Custom wears it; Ranked kits strip it)');assert.deepStrictEqual(C.kitOf(s).dmgd.map(C.itemBase).sort(),['galea','gladius']);
  assert.strictEqual(gx.broken.length,1);assert.ok(C.isBroken(s,gx.broken[0]),'the named piece breaks as before');assert.ok(!s.gear.includes(iss)&&gx.vanish.includes('legwraps'),'the Issued piece vanishes');assert.deepStrictEqual(gx.gone,['legwraps']);
  assert.ok(s.gear.includes('wraps')&&!C.isDamaged91(s,'wraps'),'what he kept is untouched');
  /* Custom: nothing */
  const cu=C.newChar({name:'Custom',cls:'hero'},'o','cu',0);cu.gear=['galea'];cu.equip=['galea'];const cx=C.gearAfter(cu,C.kitOf(cu),{survives:true,brk:['galea']},false);assert.deepStrictEqual([cx.dent100,cu.gear],[[],['galea']]);
  /* O1 a Ranked death: everything brought stays loot (the killer's pick); printed pieces nobody takes are routed home dented, named → chest, Issued → gone */
  const d=C.newChar({name:'Fallen',cls:'hero'},'o','fl',0);d.glory=400;d.gear=['galea','gladius','mace'];d.equip=['galea','gladius'];const dn=C.namedPiece(C.rollNamed(()=>0.6,catalog,'rare',[]),d);C.putPiece(d,dn,true);
  for(const p of C.kitPieces92(d,['wraps'],true))C.putPiece(d,p,true);
  const dx=C.gearAfter(d,C.kitOf(d),{survives:false},true);
  assert.deepStrictEqual(dx.carried.map(x=>C.itemBase(x.item)),['galea','gladius','nw'],'every piece brought is loot (the killer picks one)');assert.deepStrictEqual(dx.left.map(x=>x.item),['mace']);
  assert.ok(dx.vanish.includes('wraps'),'Issued vanish');assert.deepStrictEqual(dx.dent100.map(x=>x.key),['galea','gladius'],'the printed ones go home unless taken');
  const fell=P=>C.histAdd(C.tagPiece(P,d),{house:'H',glad:'Fallen',when:1,how:'fell'}),took=P=>C.histAdd(C.tagPiece(P,d),{house:'H',glad:'Fallen',when:1,how:'taken'});
  const [pg,,pn]=dx.carried;assert.ok(C.homeRoute100(fell(pg)),'a printed piece nobody took goes home');assert.ok(!C.homeRoute100(fell(pn)),'a named one does not');assert.ok(!C.homeRoute100(took(pg)),'the killer’s own pick never goes to the dead man’s house');
  const hd=C.homeDent100(fell(pg));assert.ok(hd.pc.st==='damaged'&&hd.pc.dmg===1&&C.itemUid(hd.item)&&hd.pc.hist.length,'dented, with its history');
  /* the switches */
  C.BAL100.home=false;assert.ok(!C.homeRoute100(fell(pg)),'switched off: the old used-market way');C.BAL100.home=true;
  /* O3 once per house per rank */
  const D={id:'D1',gifts:[]};const a1=[{id:'g1:rank:novicius',why:'rank:novicius'},{id:'g1:surv:5',why:'surv:5'}];C.giftsIn(D,a1);assert.deepStrictEqual(D.gifts.map(g=>g.id),['g1:rank:novicius','g1:surv:5']);assert.deepStrictEqual(D.rkg100,['novicius']);
  const a2=[{id:'g2:rank:novicius',why:'rank:novicius'},{id:'g2:rank:gregarius',why:'rank:gregarius'},{id:'g2:surv:5',why:'surv:5'}];C.giftsIn(D,a2);
  assert.deepStrictEqual(D.gifts.map(g=>g.id),['g1:rank:novicius','g1:surv:5','g2:rank:gregarius','g2:surv:5'],'the second novicius gift is dropped; every-5 gifts stay');assert.deepStrictEqual(a2.drop100,['g2:rank:novicius']);
  const out={gifts:a2.slice()};C.after100(out,{gifts:a2});assert.deepStrictEqual(out.gifts.map(g=>g.id),['g2:rank:gregarius','g2:surv:5']);assert.strictEqual(out.giftDup100,1);
  const OD={id:'D2',gifts:[],giftsOpened:['x9:rank:veteranus','x9:surv:5']};C.giftsIn(OD,[{id:'y:rank:veteranus',why:'rank:veteranus'}]);assert.deepStrictEqual([OD.gifts,OD.rkg100],[[],['veteranus']],'seeded from the gifts it already opened');
  console.log('v1.0 balance units (ranks ×½, the award ladder, gift coin unchanged, repair ⅒, dented gear, the dead\'s printed gear home, one rank gift a house): all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');C.SLOT100.start=4;
  let T=Date.UTC(2026,9,12,12);const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{}});let nc=0,mid=0;const mark=()=>sent.length;
  const ask=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const got=(conn,t,since=0)=>sent.slice(since).filter(x=>x.conn===conn&&x.msg.push===t).map(x=>x.msg.d);
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='b'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);cl.got=(t,s)=>got(cl.conn,t,s);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const getD=id=>db.get('DOMUS#'+id,'DOMUS');const setD=async(id,f)=>{const D=await getD(id);Object.assign(D,f);await db.put('DOMUS#'+id,'DOMUS',D)};
  async function bout(a,b,o){const L0=await a.req('lobby.create',{ev:'cassian',ranked:true,cry:false});await b.req('lobby.join',{id:L0.id});const L=await a.req('lobby.start',{id:L0.id});
    const sa=C.seatOf(L,a.acct),sb=C.seatOf(L,b.acct);const tb=[0,1,2,3].map(i=>({seat:i,f:3,...(i===sa?o.a(sa,sb):i===sb?o.b(sa,sb):{})}));
    for(const x of [a,b])await x.req('match.result',{id:L.id,table:tb,hash:'h'+L.id});return {L,sa,sb,M:await db.get('MATCH#'+L.id,'META')}}
  const ann=await client('ann'),bob=await client('bob','soldier');
  /* O3: Ann's first gladiator reaches Novicius → a gift; her second reaches Novicius → none (the house had it) */
  await setC(ann.ch.id,{glory:40});
  let r=await bout(ann,bob,{a:()=>({won:true,survives:true,f:20}),b:()=>({survives:true})});let oa=r.M.outs[ann.acct];
  assert.deepStrictEqual(oa.ranks,['novicius']);assert.ok(oa.gifts.some(g=>g.why==='rank:novicius'),'the first Novicius of the house: a gift');assert.strictEqual(oa.award,Math.round(C.awardOf('tiro',true,0)*0.5),'Tiro ×3, two lanistas');
  let AD=await getD(ann.domus.id);assert.deepStrictEqual(AD.rkg100,['novicius']);const n0=AD.gifts.length;
  const a2=await ann.req('char.create',{name:'Ann Secunda',cls:'hero'});await ann.req('char.active',{char:a2.id});await setC(a2.id,{glory:40});
  let m0=mark();r=await bout(ann,bob,{a:()=>({won:true,survives:true,f:20}),b:()=>({survives:true})});oa=r.M.outs[ann.acct];
  assert.deepStrictEqual(oa.ranks,['novicius'],'she reached it');assert.ok(!oa.gifts.some(g=>/^rank:/.test(g.why)),'… but the house had that gift');assert.strictEqual(oa.giftDup100,1);
  AD=await getD(ann.domus.id);assert.strictEqual(AD.gifts.length,n0,'no new gift on the house');const st=ann.got('match.settled',m0);assert.ok(st.length===0||!st.some(x=>x.out&&(x.out.gifts||[]).some(g=>/^rank:/.test(g.why))));
  /* O1: Bob (soldier) loses his galea and survives → dented, with him; repair a tenth from the treasury */
  const same=async()=>{const A2=await getC(a2.id);await setC(bob.ch.id,{glory:A2.glory,rankK:C.rankFor(A2).k})};await same();
  await setD(bob.domus.id,{treasury:500});await bob.req('char.buy',{char:bob.ch.id,item:'galea'});
  r=await bout(ann,bob,{a:()=>({survives:true}),b:()=>({survives:true,brk:['galea']})});const ob=r.M.outs[bob.acct];
  assert.deepStrictEqual(ob.gone,[]);assert.deepStrictEqual(ob.dent100.map(x=>x.key),['galea'],'the result says it came home dented');
  let B=await getC(bob.ch.id);const it=B.gear.find(x=>/^galea#/.test(x));assert.ok(it&&C.isDamaged91(B,it));
  const t0=(await getD(bob.domus.id)).treasury;const rp=await bob.req('gear.repair',{holder:bob.ch.id,item:it});assert.strictEqual(rp.cost,Math.ceil(C.priceOf(catalog.galea)/10));assert.strictEqual((await getD(bob.domus.id)).treasury,t0-rp.cost);
  /* O1: Bob dies by Ann's hand carrying a galea + a mace → Ann takes the galea (whole), the mace goes home to Bob's house shelf dented */
  await same();await bob.req('char.buy',{char:bob.ch.id,item:'mace'});B=await getC(bob.ch.id);assert.ok(C.kitOf(B).gear.includes('mace')&&C.kitOf(B).gear.includes('galea'));
  m0=mark();r=await bout(ann,bob,{a:()=>({won:true,survives:true}),b:sa=>({survives:false,kb:'g',ks:sa})});assert.ok(r.M.outs[bob.acct].died);
  const lo=ann.got('loot.offer',m0);assert.strictEqual(lo.length,1,'the killer’s window, as before');const lk=lo[0].pieces.map(p=>C.itemBase(p.item));assert.ok(lk.includes('galea')&&lk.includes('mace'),'printed pieces are loot: '+lk);
  const gi=lo[0].pieces.find(p=>/^galea#/.test(p.item)).item;const pk=await ann.req('loot.pick',{id:r.L.id,seat:r.sb,item:gi});assert.ok(pk.to==='glad'||pk.to==='house');
  const AK=pk.to==='glad'?await getC((await ann.req('hello',{all:1})).active):await getD(ann.domus.id);assert.ok(AK.gear.includes(gi)&&!C.isDamaged91(AK,gi),'the pick is his, whole');
  const BD=await getD(bob.domus.id);const mi=BD.gear.find(x=>/^mace#/.test(x));assert.ok(mi&&BD.pcs[C.itemUid(mi)].st==='damaged','the rest goes home dented: '+JSON.stringify(BD.gear));assert.ok(!BD.gear.includes(gi),'not the piece the killer took');
  let mk=(await ann.req('market.list',{})).used;assert.ok(!mk.some(x=>/^(mace|galea)#/.test(x.item)),'nothing went to the used market');
  /* O1: Cid falls to a beast carrying a gladius → no window, it goes home dented */
  const cid=await client('cid','soldier');await setD(cid.domus.id,{treasury:500});await cid.req('char.buy',{char:cid.ch.id,item:'gladius'});const A2=await getC(a2.id);await setC(cid.ch.id,{glory:A2.glory,rankK:C.rankFor(A2).k});
  m0=mark();r=await bout(ann,cid,{a:()=>({survives:true,won:true}),b:()=>({survives:false,kb:'b'})});assert.strictEqual(ann.got('loot.offer',m0).length,0,'a beast: no window');
  const CD=await getD(cid.domus.id);const gl=CD.gear.find(x=>/^gladius#/.test(x));assert.ok(gl&&CD.pcs[C.itemUid(gl)].st==='damaged','home dented: '+JSON.stringify(CD.gear));
  mk=(await ann.req('market.list',{})).used;assert.ok(!mk.some(x=>/^gladius#/.test(x.item)));
  /* the rank counts are counted once more after the thresholds moved */
  await db.put('WORLD','COUNTS',{seeded:1,seeded6:1,tiro:99});const rc=(await ann.req('hello',{all:1})).rankCounts;assert.ok(rc.tiro<99,'recounted');assert.ok((await db.get('WORLD','COUNTS')).seeded100);
  console.log('server v1.0 balance (one rank gift a house, dented gear + repair ⅒, the killer\'s pick + the dead\'s printed leftovers home, a beast kill, rank counts recounted): all checks passed')}

units();routes().catch(e=>{console.error(e);process.exit(1)});
