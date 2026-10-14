/* v1.02 PROGRESSION (routes.js "v1.02 PROGRESSION", the "v1.02 PROGRESSION" section of onlcore): XP decided at settlement only (Ranked full,
   Custom half ≤ 300 a day, nothing when he falls), levels 1–100 (+1 to the weakest automatically + 1 point to place), no more silent grow(),
   char.lvup (idempotent, refused at 99 / no point / in a room), the tally (last102 + m/ev/loc, char.seen102), class only at creation (class_fixed),
   char.release (typed name, gear to the shelf, Issued pieces vanish, Hall only when worthy) and the rudis (100 coin, always a plaque),
   the level on kits / lists / the house card, released gladiators in the Domus rank only when Hall-worthy. node server/test/v102prog.test.js */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');const catalog=require('../src/catalog.json');C.setCatalog(catalog);

function units(){
  /* the curve */
  assert.strictEqual(C.xpNeed102(1),42);assert.strictEqual(C.xpNeed102(99),101);assert.strictEqual(C.xpNeed102(100),0,'no level past 100');
  assert.strictEqual(C.xpTotal102(100),7069,'7069 XP to level 100');
  const at=b=>C.lvOf102(b*44).lv;assert.deepStrictEqual([at(10),at(50),at(150)],[10,41,95],'levels after 10 / 50 / 150 typical Ranked bouts');
  /* match XP */
  assert.strictEqual(C.xpGain102({f:24,survives:true},true,1),44,'a typical survived Ranked bout');
  assert.strictEqual(C.xpGain102({f:23,won:true},true,1),58,'a win with 23 CF');
  assert.strictEqual(C.xpGain102({f:90,won:true},true,1),75,'CF counts up to 40');
  assert.strictEqual(C.xpGain102({f:24},true,0.5),22,'the table factor (2 humans)');
  assert.strictEqual(C.xpGain102({f:24},false,1),22,'Custom = half');
  assert.strictEqual(C.xpGain102({f:30,survives:false},true,1),0,'he fell: nothing');
  /* applyResult: no more grow(); a level = +1 weakest + 1 point */
  const ch=C.newChar({name:'Marcus',cls:'soldier'},'a','g1',1);assert.deepStrictEqual([ch.lv,ch.xp,ch.pts],[1,0,0]);
  ch.stats={spd:60,str:55,int:58,lck:57,cha:59};
  const o=C.applyResult(ch,{won:false,f:0,survives:true},true,{humans:4,now:Date.UTC(2026,9,14)});
  assert.strictEqual(o.xp102.gain,20);assert.deepStrictEqual(ch.stats,{spd:60,str:55,int:58,lck:57,cha:59},'20 XP: no level, and no silent growth');
  const o2=C.applyResult(ch,{won:true,f:24,survives:true},true,{humans:4,now:Date.UTC(2026,9,14)});
  assert.deepStrictEqual([ch.lv,ch.pts,ch.stats.str],[2,1,56],'level 2: +1 to the weakest (Strength) + one point');assert.deepStrictEqual(o2.xp102.auto,['str']);
  assert.ok(ch.last102&&ch.last102.lv0===1&&ch.last102.lv1===2&&ch.last102.pts===1&&ch.last102.gain===59&&ch.last102.cf===24&&ch.last102.won,'the tally: '+JSON.stringify(ch.last102));
  /* lvup */
  assert.match(C.lvupWhy102(ch,'xx'),/five ratings/);C.lvup102(ch,'cha',5);assert.deepStrictEqual([ch.stats.cha,ch.pts],[60,0]);assert.deepStrictEqual(ch.lvlog,[[2,'cha',5]]);
  assert.match(C.lvupWhy102(ch,'cha'),/No point/);
  ch.pts=1;ch.stats.spd=99;assert.match(C.lvupWhy102(ch,'spd'),/at 99/);
  /* Custom cap 300 a UTC day */
  const cu=C.newChar({name:'Cus',cls:'slave'},'a','g2',1);const t=Date.UTC(2026,9,14,10);let got=0;
  for(let i=0;i<9;i++)got+=C.applyResult(cu,{won:true,f:40,survives:true},false,{humans:4,now:t}).xp102.gain;assert.strictEqual(got,300,'Custom ≤ 300 a day');
  assert.strictEqual(C.applyResult(cu,{won:true,f:40,survives:true},false,{humans:4,now:t+86400e3}).xp102.gain,38,'a new UTC day');
  /* a death earns nothing */
  const dd=C.newChar({name:'Dead',cls:'hero'},'a','g3',1);const od=C.applyResult(dd,{won:false,f:20,survives:false},true,{humans:4});assert.ok(od.died&&od.xp102.gain===0&&dd.lv===1);
  /* the cap: all at 99 → no points */
  const top=C.newChar({name:'Top',cls:'hero'},'a','g4',1);top.stats={spd:99,str:99,int:99,lck:99,cha:98};top.xp=C.xpTotal102(50);top.lv=50;C.xpAdd102(top,500);
  assert.strictEqual(top.stats.cha,99,'the last rating fills');assert.strictEqual(top.pts,0,'no point that nothing can take');
  const mx=C.newChar({name:'Max',cls:'hero'},'a','g5',1);C.xpAdd102(mx,99999);assert.strictEqual(mx.lv,100,'capped at 100');assert.ok(C.xpBar102(mx).max);
  /* class only at creation */
  assert.strictEqual(C.classWhy(ch,'hero'),C.CLASS_FIXED102);assert.throws(()=>C.editChar(ch,{cls:'hero'},catalog),e=>e.code==='class_fixed');
  /* level on kits + lists */
  assert.strictEqual(C.kitOf(ch).lv,2);const lr=C.liteRow({id:'L',players:[{id:'a',name:'A',rank:'tiro',kit:C.kitOf(ch)}],members:[{id:'a',name:'A',kit:C.kitOf(ch)}],stands:[]});
  assert.strictEqual(lr.players[0].lv,2);assert.strictEqual(lr.members[0].lv,2);
  /* release + the Domus rank */
  const rel=C.newChar({name:'Rel',cls:'hero'},'a','g6',1);rel.glory=500;rel.gear=['gladius','galea#u1'];rel.pcs={u1:{st:'whole',iss:1}};rel.offers=['elix2'];
  assert.match(C.releaseWhy102(rel,'rex',false,0),/Type Rel/);assert.strictEqual(C.releaseWhy102(rel,'  rEL ',false,0),'','the name, any case');assert.match(C.releaseWhy102(rel,'Rel',true,50),/100 coin/);
  const G=C.releaseGear102(rel);assert.deepStrictEqual(G.shelf.map(P=>P.item),['gladius']);assert.deepStrictEqual(G.vanish,['galea']);assert.deepStrictEqual(G.offers,['elix2']);
  const mk=C.releaseMark102(rel,false,9);assert.ok(!rel.alive&&rel.rel102&&!mk.hall&&!mk.plaque,'not Hall-worthy: erased');
  assert.strictEqual(C.drankScore98([rel]),0,'a released, unworthy gladiator never counts');
  const great=C.newChar({name:'Great',cls:'hero'},'a','g7',1);great.glory=1000;great.lifeCF=600;C.releaseMark102(great,true,9);assert.ok(great.rel102.hall);
  assert.strictEqual(C.drankScore98([great]),200,'Hall-worthy: 20% like the fallen');
  const he=C.hallEntry102(great,'rudis',9);assert.match(he.why,/Rudiarius — freed/);assert.strictEqual(he.rel,'rudis');
  console.log('v1.02 progression units: all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');C.SLOT100.start=4;
  let T=Date.UTC(2026,9,14,12);const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{}});let nc=0,mid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='p'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const getD=id=>db.get('DOMUS#'+id,'DOMUS');const setD=async(id,f)=>{const D=await getD(id);Object.assign(D,f);await db.put('DOMUS#'+id,'DOMUS',D)};
  async function bout(a,b,ranked,ra,rb){const L0=await a.req('lobby.create',{ev:'cassian',ranked,cry:false});await b.req('lobby.join',{id:L0.id});const L=await a.req('lobby.start',{id:L0.id});
    const sa=C.seatOf(L,a.acct),sb=C.seatOf(L,b.acct);const tb=[0,1,2,3].map(i=>({seat:i,f:3,...(i===sa?ra:i===sb?rb:{})}));
    for(const x of [a,b])await x.req('match.result',{id:L.id,table:tb,hash:'h'+L.id});return L}
  const ann=await client('ann'),bob=await client('bob','soldier');
  const s0={...(await getC(ann.ch.id)).stats};
  /* a Ranked bout, 2 humans (×0.5): Ann wins with 30 CF → round(0.5 × (30 + 20 + 15)) = 33 XP; no level, no silent growth */
  const L1=await bout(ann,bob,true,{f:30,won:true},{f:10});
  let a=await getC(ann.ch.id);assert.strictEqual(a.xp,33,'XP decided on the server');assert.deepStrictEqual(a.stats,s0,'no silent grow()');
  assert.ok(a.last102&&a.last102.m===L1.id&&a.last102.ev==='cassian'&&a.last102.ranked&&a.last102.gain===33&&a.last102.coin>0,'the tally carries its match: '+JSON.stringify(a.last102));
  /* the client never sends XP: a report with xp fields changes nothing */
  const L2=await bout(ann,bob,true,{f:30,won:true,xp:9999,lv:99},{f:10});a=await getC(ann.ch.id);assert.strictEqual(a.xp,66);assert.strictEqual(a.lv,2,'level 2 after 66 XP');assert.strictEqual(a.pts,1);
  assert.strictEqual(a.last102.m,L2.id,'the newest match');
  /* seen → cleared */
  const sn=await ann.req('char.seen102',{id:ann.ch.id});assert.ok(!sn.char.last102);assert.ok(!(await getC(ann.ch.id)).last102);
  /* lvup: refused in a room; idempotent */
  const Lr=await ann.req('lobby.create',{ev:'cassian',ranked:false,cry:false});await rejects(ann.req('char.lvup',{id:ann.ch.id,k:'str',rid:'lv102room'}),'in_match');
  await ann.req('lobby.leave',{id:Lr.id});
  await rejects(ann.req('char.lvup',{id:ann.ch.id,k:'zzz'}),'lvup_bad',/five ratings/);
  const st0=(await getC(ann.ch.id)).stats.str;const u1=await ann.req('char.lvup',{id:ann.ch.id,k:'str',rid:'lvup102aa'});assert.strictEqual(u1.char.stats.str,st0+1);assert.strictEqual(u1.char.pts,0);
  const u1b=await ann.req('char.lvup',{id:ann.ch.id,k:'str',rid:'lvup102aa'});assert.strictEqual(u1b.char.stats.str,st0+1,'a replayed request runs once');
  await rejects(ann.req('char.lvup',{id:ann.ch.id,k:'str',rid:'lvup102bb'}),'lvup_bad',/No point/);
  await setC(ann.ch.id,{pts:1,stats:{...(await getC(ann.ch.id)).stats,lck:99}});await rejects(ann.req('char.lvup',{id:ann.ch.id,k:'lck'}),'lvup_bad',/at 99/);
  /* Custom: half XP */
  const xb=(await getC(bob.ch.id)).xp|0;await bout(ann,bob,false,{f:10},{f:20,won:true});assert.strictEqual((await getC(bob.ch.id)).xp-xb,Math.round(0.5*0.5*(20+20+15)),'Custom = half (×0.5 table)');
  /* class only at creation */
  await rejects(ann.req('char.class',{char:ann.ch.id,cls:'slave'}),'class_fixed',/never changes/);
  await rejects(ann.req('char.edit',{char:ann.ch.id,cls:'slave'}),'class_fixed');
  /* the level everywhere */
  const hc=await bob.req('house.card',{acct:ann.acct});assert.strictEqual(hc.glads[0].lv,2,'the house card');
  const hl=await ann.req('hello',{all:1});const A=await db.get('ACCT#'+ann.acct,'PROFILE');assert.strictEqual(A.here.lv,2,'the presence entry (Who’s online)');void hl;
  const Lq=await ann.req('lobby.create',{ev:'cassian',ranked:false,cry:false});const ls=await bob.req('lobby.list',{});const row=(Array.isArray(ls)?ls:ls.lobbies||[]).find(x=>x.id===Lq.id);
  assert.ok(row&&row.players[0].lv===2,'the lobby list row: '+JSON.stringify(row&&row.players));
  /* release: refused in a room, by a wrong name; then done */
  const two=await ann.req('char.create',{name:'Spurius Minor',cls:'slave'});
  await setC(two.id,{gear:['gladius','galea#u9'],pcs:{u9:{st:'whole',iss:1}},equip:['gladius'],offers:['elix2']});
  await rejects(ann.req('char.release',{id:ann.ch.id,name:'Ann Gladius'}),'in_match');
  await ann.req('lobby.leave',{id:Lq.id});
  await rejects(ann.req('char.release',{id:two.id,name:'Spurius'}),'release_bad',/Type Spurius Minor/);
  const shelf0=((await getD(ann.domus.id)).gear||[]).length;const hall0=((await db.get('WORLD','HALL'))||{list:[]}).list.length;
  const rr=await ann.req('char.release',{id:two.id,name:'spurius minor',rid:'release102a'});
  assert.ok(!rr.char.alive&&rr.char.rel102.k==='released'&&!rr.hall,'released, erased: '+JSON.stringify(rr.char.rel102));assert.deepStrictEqual(rr.vanish,['galea'],'the Issued piece vanishes');
  const Dx=await getD(ann.domus.id);assert.strictEqual((Dx.gear||[]).length,shelf0+1,'his gladius → the house shelf');assert.ok((Dx.offers||[]).includes('elix2'),'his offering → the shelf');
  assert.strictEqual(((await db.get('WORLD','HALL'))||{list:[]}).list.length,hall0,'no Hall plaque');
  const rr2=await ann.req('char.release',{id:two.id,name:'spurius minor',rid:'release102a'});assert.strictEqual(rr2.kind,'released','a replay gets the stored reply');
  await rejects(ann.req('char.lvup',{id:two.id,k:'str'}),null,/Not yours/);
  /* the rudis: 100 coin, always a plaque */
  const three=await ann.req('char.create',{name:'Verus',cls:'hero'});await setD(ann.domus.id,{treasury:40});
  await rejects(ann.req('char.release',{id:three.id,name:'Verus',rudis:true}),'no_coin',/100 coin/);
  await setD(ann.domus.id,{treasury:150});const rd=await ann.req('char.release',{id:three.id,name:'Verus',rudis:true,rid:'release102b'});
  assert.ok(rd.hall&&rd.kind==='rudis');const D3=await getD(ann.domus.id);assert.strictEqual(D3.treasury,50,'paid 100');assert.strictEqual(D3.led89.out.rudis,100,'the ledger');
  const H=(await db.get('WORLD','HALL')).list[0];assert.ok(H&&H.name==='Verus'&&/Rudiarius — freed/.test(H.why)&&H.rel==='rudis','the Hall plaque: '+JSON.stringify(H));
  assert.ok((D3.memo89||[]).some(m=>m.name==='Verus'&&m.by&&m.by.k==='rudis'),'the memorial wall');
  /* the Domus rank: neither released gladiator was Hall-worthy → nothing */
  const all=(await db.byIndex('OWNER#'+ann.acct));assert.strictEqual(C.drankScore98(all.filter(c=>!c.alive)),0);
  const hc2=await bob.req('house.card',{acct:ann.acct});assert.strictEqual(hc2.fallen,0,'the released are not counted as fallen');assert.strictEqual(hc2.released,2);
  console.log('server v1.02 progression (XP at settlement, no grow, lvup, tally, class fixed, level everywhere, release + the rudis): all checks passed')}

units();routes().catch(e=>{console.error(e);process.exit(1)});
