/* v0.91 ONLINE ECONOMY II: damaged printed armor (row.dmg → st 'damaged', repair = ceil(value × dmg), kept out of Ranked kits, fine in
   Custom), keep home = named pieces only (printed refused / an old printed flag ignored), the auction's six lots and their guarantees
   (≥1 top tier, ≥2 armor, ≥2 weapons, deterministic).
   node server/test/v91.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');

function rules(){C.setCatalog(catalog);
  /* the row field: cleaned, clamped, sorted, ≤16 */
  const r=C.cleanRow({seat:0,dmg:[['galea',0.5049],['bad key!',0.3],['ocrea',1.7],['manica',-1],['x',NaN],'junk']});
  assert.deepStrictEqual(r.dmg,[['galea',0.5],['ocrea',1]]);assert.deepStrictEqual(C.cleanRow({seat:0}).dmg,[]);
  assert.strictEqual(C.cleanRow({dmg:Array.from({length:30},(_,i)=>['k'+i,0.1])}).dmg.length,16);
  /* gearAfter: a Ranked survivor's worn printed piece comes home damaged; Custom / named / the dead do not */
  const mk=()=>{const ch=C.newChar({name:'Dent Body',cls:'hero'},'o','db',0);ch.gear=['galea','gladius','ocrea'];ch.equip=ch.gear.slice();return ch};
  let ch=mk();let kit=C.kitOf(ch);const g=C.gearAfter(ch,kit,{survives:true,dmg:[['galea',0.5]]},true);
  assert.strictEqual(g.dmg.length,1);const it=g.dmg[0].item;assert.match(it,/^galea#/);assert.ok(ch.equip.includes(it)&&ch.gear.includes(it),'still worn, same place');
  assert.strictEqual(ch.gear.indexOf(it),0,'in place');const I=C.pieceOf(ch,it,catalog);assert.strictEqual(I.st,'damaged');assert.strictEqual(I.dmg,0.5);
  assert.strictEqual(C.repairCost(I),Math.ceil(C.priceOf(catalog.galea)*0.5),'repair = ceil(price × dmg)');
  assert.strictEqual(C.repairCost({...I,dmg:0.07,val:100}),7,'no float creep');assert.strictEqual(C.repairCost({...I,dmg:0.01,val:15}),1,'at least 1');
  assert.strictEqual(C.wearWhy(ch,it),'','worn in Custom');assert.ok(C.equipOf(ch).includes(it));
  kit=C.kitOf(ch);assert.deepStrictEqual(kit.dmgd,[it]);
  const who=k=>[{id:'a',name:'A',char:'db',rank:'tiro',kit:{...k}}];
  const LR=C.newLobby({ev:'cassian',ranked:true},{id:'a',name:'A',char:'db',rank:'tiro'},'L1',1),LC=C.newLobby({ev:'cassian'},{id:'a',name:'A',char:'db',rank:'tiro'},'L2',1);
  C.roomJoin(LR,who(kit),1);C.roomJoin(LC,who(kit),1);const kr=(LR.players[0]||LR.members[0]).kit,kc=(LC.players[0]||LC.members[0]).kit;
  assert.ok(!kr.items.includes(it)&&kr.items.includes('gladius')&&kr.gear.length===kr.items.length,'Ranked leaves the damaged piece');assert.ok(kc.items.includes(it),'Custom brings it');
  C.repairItem(ch,it);assert.strictEqual(C.pcOf(ch,it).st,'whole');assert.ok(!('dmg' in C.pcOf(ch,it)));assert.ok(!C.kitOf(ch).dmgd);
  ch=mk();C.gearAfter(ch,C.kitOf(ch),{survives:true,dmg:[['galea',0.5]]},false);assert.deepStrictEqual(ch.gear,['galea','gladius','ocrea'],'Custom: no damage');
  ch=mk();const gd=C.gearAfter(ch,C.kitOf(ch),{survives:false,dmg:[['galea',0.5]]},true);assert.ok(!gd.dmg.length,'the dead: no damage');
  /* a lost piece is gone, a held one damaged, in the same bout */
  ch=mk();const gb=C.gearAfter(ch,C.kitOf(ch),{survives:true,brk:['ocrea'],dmg:[['galea',0.25]]},true);assert.deepStrictEqual(gb.gone,['ocrea']);assert.strictEqual(gb.dmg[0].dmg,0.25);
  /* named pieces keep their own rule: damage is ignored */
  ch=mk();ch.glory=600;const NA=C.namedPiece(C.rollNamedArmor(()=>0.4,catalog,'rare',[]),ch);C.putPiece(ch,NA,true);const k2=C.kitOf(ch);const nk=k2.gear[k2.items.indexOf(NA.item)];
  const gn=C.gearAfter(ch,k2,{survives:true,dmg:[[nk,0.5]]},true);assert.ok(!gn.dmg.length&&C.pcOf(ch,NA.item).st==='whole');
  /* keep home: named only */
  assert.throws(()=>C.homeSet(ch,'galea',true),/named/);assert.strictEqual(C.homeSet(ch,NA.item,true),NA.item);assert.ok(C.isHome(ch,NA.item));
  ch.pcs={...ch.pcs,'old.1':{st:'whole',home:1}};ch.gear.push('ocrea#old.1');assert.ok(!C.isHome(ch,'ocrea#old.1'),'an old printed flag is ignored');
  assert.ok(!(C.kitOf(ch).home||[]).includes('ocrea#old.1'));
  /* the auction plan */
  assert.strictEqual(C.AUC_LOTS,6);
  const P0=C.aucPlan91([],6,[],[]);assert.strictEqual(P0.filter(o=>o.kind==='a').length,2);assert.strictEqual(P0.filter(o=>o.kind==='w').length,2);assert.strictEqual(P0.filter(o=>o.rar==='legendary').length,1);
  const allW=C.UNIQUES.map(u=>u.k),allA=C.UNIQ_A_KEYS;assert.strictEqual(C.aucPlan91([],6,allW,allA).filter(o=>o.rar==='epic').length,1,'no uniques left → Epic');
  assert.ok(!C.aucPlan91([{kind:'w',rar:'legendary'}],5,[],[]).some(o=>o.rar),'a chest Legendary is the top piece');
  assert.ok(C.aucPlan91([{kind:'w',rar:'epic'}],5,[],[]).some(o=>o.rar==='legendary'),'a chest Epic is not top while uniques are free');
  assert.ok(!C.aucPlan91([{kind:'w',rar:'epic'}],5,allW,[]).some(o=>o.rar),'… but is once its kind has none left');
  const P3=C.aucPlan91([{kind:'a',rar:'rare'},{kind:'a',rar:'rare'},{kind:'a',rar:'rare'},{kind:'a',rar:'common'}],2,[],[]);assert.deepStrictEqual(P3.map(o=>o.kind),['w','w'],'two weapons when the chest gave armor');
  /* forced options: deterministic; the kind and the floor tier hold for many weeks */
  for(let i=0;i<300;i++){const key=C.seasonKeyOf(i),n=1+i%6;
    for(const o of [{kind:'a'},{kind:'w'},{rar:'legendary'},{kind:'a',rar:'epic'},{kind:'w',rar:'legendary',cap:'epic'}]){const a=C.vaultLot89(key,n,catalog,[],[],{at:0,...o}),b=C.vaultLot89(key,n,catalog,[],[],{at:0,...o});
      assert.deepStrictEqual(a,b,'deterministic');if(o.kind)assert.strictEqual(a.kind,o.kind);if(o.cap)assert.strictEqual(a.rar,'epic');else if(o.rar==='legendary')assert.strictEqual(a.rar,'legendary');else if(o.rar==='epic')assert.ok(a.rar==='epic'||a.rar==='legendary')}}
  /* no options: the same piece as before v0.91 */
  assert.deepStrictEqual(C.vaultLot89('S1W3',1,catalog,[],[],{at:5}),C.vaultLot89('S1W3',1,catalog,[],[],{at:5,kind:undefined,rar:undefined}));
  console.log('v0.91 rules (row dmg, damaged pieces + repair cost, Ranked kits strip them, named keep their rule, keep home = named only, auction plan + forced lots): all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=C.SEASON_EPOCH+9*C.WEEK_MS+3600e3;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});let nc=0,rid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  async function client(name){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:'hero'});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const ann=await client('ann'),bob=await client('bob');
  await setC(ann.ch.id,{gear:['galea','gladius'],equip:['galea','gladius'],wallet:500});
  /* a Ranked bout: Ann survives with her helm half dented */
  const L0=await ann.req('lobby.create',{ev:'democritus',loc:6,ranked:true,cry:false});await bob.req('lobby.join',{id:L0.id});const L=await ann.req('lobby.start',{id:L0.id});
  const sa=C.seatOf(L,ann.acct),sb=C.seatOf(L,bob.acct);assert.ok(L.players[sa].kit.items.includes('galea'));
  const tb=[0,1,2,3].map(i=>({seat:i,f:3,won:i===sa,...(i===sa?{dmg:[['galea',0.5]]}:{})}));for(const x of [ann,bob])await x.req('match.result',{id:L.id,table:tb,hash:'h'});
  const M=await db.get('MATCH#'+L.id,'META');assert.strictEqual((M.outs[ann.acct].dmg||[]).length,1,'the result names the damaged piece');
  let c=await getC(ann.ch.id);const it=c.gear.find(g=>/^galea#/.test(g));assert.ok(it&&c.equip.includes(it),'still worn');const I=C.pieceOf(c,it,catalog);assert.strictEqual(I.st,'damaged');assert.strictEqual(I.dmg,0.5);
  /* Ranked rooms leave it home; Custom brings it */
  let R=await ann.req('lobby.create',{ev:'cassian',ranked:true,cry:false});assert.ok(!R.players[0].kit.items.includes(it)&&R.players[0].kit.items.includes('gladius'),'not in a Ranked kit');await ann.req('lobby.leave',{id:R.id});
  R=await ann.req('lobby.create',{ev:'cassian',cry:false});assert.ok(R.players[0].kit.items.includes(it),'fine in Custom');await ann.req('lobby.leave',{id:R.id});
  /* repair: the purse pays ceil(value × dmg) */
  const cost=Math.ceil(C.priceOf(catalog.galea)*0.5);const w0=(await getC(ann.ch.id)).wallet;
  const rp=await ann.req('gear.repair',{holder:ann.ch.id,item:it});assert.strictEqual(rp.cost,cost);c=await getC(ann.ch.id);assert.strictEqual(c.wallet,w0-cost);assert.strictEqual(C.pcOf(c,it).st,'whole');
  await rejects(ann.req('gear.repair',{holder:ann.ch.id,item:it}),null,/whole/);
  /* the treasury may pay instead (ledger: repair) */
  C.damageItem91(c,it,0.4);await db.put('CHAR#'+c.id,'CHAR',c);await rejects(ann.req('gear.repair',{holder:ann.ch.id,item:it,pay:'treasury'}),'no_coin');
  const D=await db.get('DOMUS#'+ann.domus.id,'DOMUS');await db.put('DOMUS#'+D.id,'DOMUS',{...D,treasury:100});
  const rt=await ann.req('gear.repair',{holder:ann.ch.id,item:it,pay:'treasury'});assert.strictEqual(rt.domus.treasury,100-rt.cost);assert.strictEqual(rt.domus.led89.out.repair,rt.cost);
  /* keep home: printed refused */
  await rejects(ann.req('gear.home',{holder:ann.ch.id,item:'gladius',on:true}),'home_named');
  /* the auction: six lots with the guarantees, the same on another instance */
  const al=await ann.req('auction.list',{});assert.strictEqual(al.lots.length,6);
  assert.ok(al.lots.filter(l=>l.kind==='a').length>=2&&al.lots.filter(l=>l.kind==='w').length>=2&&al.lots.some(l=>l.rar==='legendary'||l.rar==='epic'));
  console.log('server v0.91 (a Ranked dent comes home damaged, out of Ranked kits, Custom keeps it, purse / treasury repair at ceil(value × dmg), printed keep-home refused, six lots with the guarantees): all checks passed')}

(async()=>{rules();await routes()})().catch(e=>{console.error(e);process.exit(1)});
