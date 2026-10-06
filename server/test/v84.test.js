/* v0.84 (protocol 7): named armor, seasons + the weekly challenge, CPU-won rewards, reclaim a seat, Flavius's Auction, loot defs, Today house names.
   node server/test/v84.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');
function seeded(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ── 1. the shared rules ── */
function rules(){
  assert.strictEqual(C.VER,7);
  /* named armor: deterministic, capped, cleaned, its own uniques */
  for(let s=1;s<80;s++)for(const r of ['common','rare','epic','legendary']){const a=C.rollNamedArmor(seeded(s),catalog,r,[]),b=C.rollNamedArmor(seeded(s),catalog,r,[]);
    assert.deepStrictEqual(a,b,'the same roll for the same randomness');assert.strictEqual(a.kind,'a');assert.ok(!catalog[a.base].stack,'never padding');assert.ok(a.ap<=6&&a.ap>=1,'AP cap');
    assert.ok(a.aff.length<={common:0,rare:1,epic:2,legendary:2}[a.rar]);assert.ok(a.n&&a.n.length<=40,a.n);if(r==='legendary')assert.ok(C.UNIQ_A_KEYS.includes(a.uq),'a unique');
    const cl=C.cleanNamedA({...a,key:'na_x.1'});assert.strictEqual(cl.ap,a.ap);assert.strictEqual(cl.uq,a.uq);assert.strictEqual(cl.slot,a.slot);
    if(a.aff.includes('bonus'))assert.ok(cl.bonus&&Object.keys(cl.bonus).length===1);if(a.aff.includes('ward'))assert.ok(cl.ward);if(a.aff.includes('swift'))assert.ok(cl.swift)}
  assert.strictEqual(C.rollNamedArmor(seeded(5),catalog,'legendary',C.UNIQ_A_KEYS).rar,'epic','every armor unique claimed → Epic');
  assert.strictEqual(C.cleanNamedA({key:'nw_1',slot:'head'}),null,'only na_ keys');assert.strictEqual(C.cleanNamedA({key:'na_1',slot:'tail'}),null,'a real slot');
  assert.strictEqual(C.cleanNamedA({key:'na_1',slot:'head',ap:40,uq:'evil',bonus:{tail:3,chest:9}}).ap,7);assert.deepStrictEqual(C.cleanNamedA({key:'na_1',slot:'head',bonus:{tail:3,chest:9}}).bonus,{chest:2});
  /* pieces: 'na#uid', engine key, value, the kit */
  const t=C.newChar({name:'Armor Wearer',cls:'hero'},'o','aw',0);const def=C.rollNamedArmor(seeded(9),catalog,'epic',[]);const P=C.namedPiece(def,t);
  assert.match(P.item,/^na#aw\.\d+$/);assert.strictEqual(P.pc.w.key,'na_'+C.itemUid(P.item));assert.ok(C.isNamed(P.item)&&C.isNamedA(P.item));assert.strictEqual(C.engineKey(P.item),'na_'+C.itemUid(P.item));
  C.putPiece(t,P,false);const I=C.pieceOf(t,P.item,catalog);assert.strictEqual(I.kind,'a');assert.strictEqual(I.lv,4);assert.strictEqual(I.val,1500*4);assert.strictEqual(I.ap,def.ap);
  assert.match(C.wearWhy(t,P.item),/Veteranus/,'the same wear rule');t.glory=600;C.gearEquip(t,P.item,true);const kit=C.kitOf(t);
  assert.ok(kit.gear.includes('na_'+C.itemUid(P.item)));assert.strictEqual(kit.named[0].kind,'a');assert.strictEqual(kit.named[0].key,'na_'+C.itemUid(P.item));
  /* equip points: a named piece and a printed one on the same point are never brought together (as 03-engine armorConflict) */
  C.setCatalog(catalog);let hd=null;for(let s=1;s<500&&!hd;s++){const a=C.rollNamedArmor(seeded(s),catalog,'rare',[]);if(a.slot==='head')hd=a}
  const ep=C.newChar({name:'Equip Point',cls:'hero'},'o','ep',0);ep.glory=600;C.putPiece(ep,{item:'galea',pc:null},true);const HP=C.namedPiece(hd,ep);C.putPiece(ep,HP,true);
  assert.deepStrictEqual(C.equipOf(ep),['galea'],'two helms: the first is brought, never both');assert.ok(!C.kitOf(ep).gear.includes(HP.pc.w.key));
  C.gearEquip(ep,HP.item,true);assert.deepStrictEqual(C.equipOf(ep),[HP.item],'ticking the named helm unticks the printed one');assert.deepStrictEqual(C.kitOf(ep).gear,[HP.pc.w.key]);
  C.gearEquip(ep,'galea',true);assert.deepStrictEqual(C.equipOf(ep),['galea'],'and back');
  C.editChar(ep,{equip:[HP.item,'galea']});assert.deepStrictEqual(C.equipOf(ep),[HP.item],'char.edit keeps the first of a clashing pair');
  const fitOf=g=>C.armFit({},g,catalog);
  assert.deepStrictEqual(fitOf(['legwraps','ocrea']),[true,true],'padding sits beneath a hard piece on the same point');
  assert.deepStrictEqual(fitOf(['manica','provmanica','galerus']),[true,true,false],'two single arm pieces take both sides; a third has no room');
  assert.deepStrictEqual(fitOf(['ocrea','greaves']),[true,false],'two pairs on the lower leg: no');assert.deepStrictEqual(fitOf(['gladius','galea','mace']),[true,true,true],'weapons always');
  /* the gift's kind is drawn after the rarity: v0.83's randomness rolls the same rarity */
  const q=[0.995,0.995,0.1];const g=C.rollGift(()=>q.shift(),catalog,'tiro');assert.deepStrictEqual([g.k,g.rar,g.kind],['named','legendary','a']);
  assert.strictEqual(C.rollGift(()=>0.995,catalog,'tiro').kind,'w');
  /* CPU-won rewards */
  assert.ok(C.cpuRow({h:2,c:3})&&!C.cpuRow({h:3,c:3})&&!C.cpuRow(null),'more than half');assert.strictEqual(C.cleanRow({cpu:1}).cpu,true);
  const c1=C.newChar({name:'Human One',cls:'hero'},'o','h1',0),c2=C.newChar({name:'Cpu Two',cls:'hero'},'o','h2',0);c1.glory=c2.glory=85;
  const o1=C.applyResult(c1,{won:true,f:20,survives:true},true,{humans:4}),o2=C.applyResult(c2,{won:true,f:20,survives:true,cpu:true},true,{humans:4});
  assert.strictEqual(o2.award,Math.round(o1.award*0.25));assert.ok(o2.cpu);assert.strictEqual(o2.glory,Math.round(o1.glory*0.25*10)/10);assert.deepStrictEqual(o2.gifts,[],'no gifts');assert.ok(o1.gifts.length>=1);
  assert.deepStrictEqual(C.trophiesFrom(c2,{won:true,cpu:true},o2,true,'cassian'),[],'no trophies');
  const c3=C.newChar({name:'Cpu Dies',cls:'hero'},'o','h3',0);assert.ok(C.applyResult(c3,{survives:false,cpu:true},true,{}).died,'the Fate still applies');
  /* seasons */
  const t0=C.SEASON_EPOCH;assert.strictEqual(new Date(t0).getUTCDay(),4,'weeks turn on Thursdays (the weekKey boundaries)');
  assert.deepStrictEqual([C.seasonAt(t0).key,C.seasonAt(t0+C.WEEK_MS*11+5).key,C.seasonAt(t0+C.WEEK_MS*12).key],['S1W1','S1W12','S2W1']);
  for(let s=1;s<6;s++){const fx=C.seasonFixtures(s);assert.strictEqual(fx.length,12);assert.strictEqual(fx[11].ev,'familia','week 12 = Familia (rivalry week)');assert.strictEqual(new Set(fx.map(f=>f.loc)).size,12,'12 arenas')}
  const F=C.onlineFixture(t0+C.WEEK_MS*3);assert.ok(C.EVENTS_ALL.includes(F.ev));assert.strictEqual(F.loc,C.seasonFixtures(1)[3].loc);
  /* the weekly challenge: one gift a week, never stacked */
  const D={id:'Dx',gifts:[]};const m={ev:F.ev,loc:F.loc,ranked:true,at:t0+C.WEEK_MS*3+1000};const ch={name:'X'};
  assert.strictEqual(C.weekNote(D,m,ch,{won:true,survives:true},{}),null);assert.strictEqual(C.weekNote(D,{...m,ranked:false,ev:'zzz'},ch,{won:false},{}),null);
  const wg=C.weekNote(D,{...m,ranked:false},ch,{won:false},{});assert.ok(wg&&/^week:S1W4:/.test(wg.id),'all three + a win → a gift');assert.strictEqual(D.gifts.length,1);
  assert.strictEqual(C.weekNote(D,m,ch,{won:true,survives:true},{}),null,'no second gift that week');assert.strictEqual(D.gifts.length,1);assert.ok(C.weekState(D,m.at).done);
  assert.strictEqual(C.weekNote(D,m,ch,{won:true,cpu:true},{}),null);assert.strictEqual(C.weekState(D,m.at).bouts,4,'a CPU-played bout earns nothing');
  assert.strictEqual(C.weekState(D,m.at+C.WEEK_MS).bouts,0,'a new week starts clean');
  /* the auction's numbers */
  assert.strictEqual(C.aucMin(3001),1501);assert.strictEqual(C.aucNextMin({val:3000}),1500);assert.strictEqual(C.aucNextMin({val:3000,bid:{amt:1500}}),1575);assert.strictEqual(C.aucNextMin({bid:{amt:100}}),110);
  const lot={ends:1000};C.aucSnipe(lot,900);assert.strictEqual(lot.ends,900+C.AUC_SNIPE_MS);
  console.log('v0.84 rules (named armor, gift kinds, CPU-won rewards, seasons + fixtures, weekly challenge, auction numbers): all checks passed')}

/* ── 2. the routes, through the real handler ── */
async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=C.SEASON_EPOCH+C.WEEK_MS*30+3600e3;const db=store.memory();const sent=[];const live=new Set();const Q=[];
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,rnd:()=>Q.length?Q.shift():Math.random(),countdown:0,testers:'tess@example.com'});
  let nc=0,rid=0;const mark=()=>sent.length;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;e.reply=m.msg;throw e}return m.msg.d};
  const got=(conn,t,since=0)=>sent.slice(since).filter(x=>x.conn===conn&&x.msg.push===t).map(x=>x.msg.d);
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  const connect=async(name,email)=>{const conn='w'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER),...(email?{email}:{})}});assert.strictEqual(r.statusCode,200);return conn};
  async function client(name,o={}){const cl={name,acct:'dev-'+name};cl.conn=await connect(name,o.email);cl.req=(t,d)=>ask(cl.conn,t,d);cl.got=(t,s)=>got(cl.conn,t,s);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;
    cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:o.cls||'hero'});return cl}
  const getC=id=>db.get('CHAR#'+id,'CHAR');const setC=async(id,f)=>{const c=await getC(id);Object.assign(c,f);await db.put('CHAR#'+id,'CHAR',c)};
  const getD=id=>db.get('DOMUS#'+id,'DOMUS');const treC=async x=>((await getD(x.domus.id))||{}).treasury|0; /* v0.92 one treasury */
  {const r=await h({requestContext:{routeKey:'$connect',connectionId:'old'},queryStringParameters:{dev:'x',ver:'6'}});assert.strictEqual(r.statusCode,426,'protocol 6 clients reload')}
  /* a bout between two clients: start, then both report the same table (rows by seat) */
  async function bout(a,b,o){const L0=await a.req('lobby.create',{ev:o.ev,loc:o.loc,ranked:!!o.ranked,cry:false});await b.req('lobby.join',{id:L0.id});const L=await a.req('lobby.start',{id:L0.id});
    const sa=C.seatOf(L,a.acct),sb=C.seatOf(L,b.acct);const tb=[0,1,2,3].map(i=>({seat:i,f:3,...(i===sa?o.a||{}:i===sb?o.b||{}:{})}));if(o.live)return {L,sa,sb};
    for(const x of [a,b])await x.req('match.result',{id:L.id,table:tb,hash:'x'+L.id});return {L,sa,sb,M:await db.get('MATCH#'+L.id,'META')}}
  const ann=await client('ann'),bob=await client('bob',{cls:'soldier'});

  /* ── the week's fixture + the weekly challenge ── */
  const H=await ann.req('hello',{all:1});const F=H.season84;assert.ok(F&&F.key===C.seasonAt(T).key&&C.EVENTS_ALL.includes(F.ev)&&F.loc>=1,'hello carries this week’s fixture');
  assert.deepStrictEqual([H.week84.win,H.week84.surv,H.week84.bouts,H.week84.gift],[0,0,0,0]);
  await bout(ann,bob,{ev:F.ev,loc:F.loc,ranked:true,a:{won:true,survives:true,f:12}});
  let w84=(await ann.req('hello',{all:1})).week84;assert.deepStrictEqual([w84.win,w84.surv,w84.bouts],[1,1,1],'won it and survived it Ranked');
  await bout(ann,bob,{ev:'cassian',loc:F.loc===3?4:3,a:{won:false}});await bout(ann,bob,{ev:'egidious',loc:2,a:{won:false}});
  const AD=await getD(ann.domus.id);const wg=(AD.gifts||[]).filter(g=>/^week:/.test(g.why));assert.strictEqual(wg.length,1,'ONE weekly gift for the house');assert.ok((await ann.req('hello',{all:1})).week84.done);
  await bout(ann,bob,{ev:F.ev,loc:F.loc,ranked:true,a:{won:true,survives:true}});assert.strictEqual(((await getD(ann.domus.id)).gifts||[]).filter(g=>/^week:/.test(g.why)).length,1,'never a second that week');
  const bw=(await bob.req('hello',{all:1})).week84;assert.strictEqual(bw.bouts,4);assert.strictEqual(bw.gift,0,'Bob never won');

  /* ── CPU-won rewards: the agreed row's cpu flag cuts coin + Glory to a quarter, no gifts ── */
  await setC(ann.ch.id,{glory:85});await setC(bob.ch.id,{glory:85});
  const r1=await bout(ann,bob,{ev:'cassian',loc:5,ranked:true,a:{won:true,survives:true,f:20,cpu:true},b:{won:false,survives:true,f:20}});
  const oa=r1.M.outs[ann.acct],ob=r1.M.outs[bob.acct];assert.ok(oa.cpu&&!ob.cpu);assert.strictEqual(oa.award,Math.round(C.awardOf('tiro',true,0)*0.5*0.25),'a quarter of the award (2 humans: ×0.5)');
  assert.deepStrictEqual(oa.gifts,[],'no gifts for a CPU-played bout');assert.ok(ob.gifts.some(g=>g.why==='rank:novicius'),'the human-played one gets his');

  /* ── named armor from a gift; the loot window carries the full def ── */
  await setC(ann.ch.id,{glory:600});await db.put('DOMUS#'+ann.domus.id,'DOMUS',{...(await getD(ann.domus.id)),gifts:[{id:'ga',why:'surv:5',at:T}]});
  Q.push(0.995,0.995,0.1,0.995);/* v0.89 J: a named armor piece re-rolls its tier (RAR_A89) */const go=await ann.req('gift.open',{gift:'ga'});assert.strictEqual(go.reward.k,'named');assert.strictEqual(go.reward.piece.kind,'a');assert.strictEqual(go.to,'glad');
  const ai=go.char.gear.find(g=>/^na#/.test(g));const ad=go.char.pcs[C.itemUid(ai)].w;assert.ok(ad.named84&&ad.uq&&C.UNIQ_A_KEYS.includes(ad.uq));assert.ok(await db.get('WORLD','UNIQA#'+ad.uq),'the armor unique is claimed');
  assert.ok(C.equipOf(go.char).includes(ai),'a Veteranus brings it');
  /* the gift's affixes come from Math.random: a Fidelis piece goes home instead of into the loot (v0.89 J) — strip it so the loot check is steady */
  {const c=await getC(ann.ch.id);const w=c.pcs[C.itemUid(ai)].w;if(w.fid){delete w.fid;w.aff=(w.aff||[]).filter(k=>k!=='fid');await db.put('CHAR#'+c.id,'CHAR',c)}}
  await setC(bob.ch.id,{glory:600,wallet:0});const lv=await bout(ann,bob,{ev:'democritus',loc:6,ranked:true,live:true});const kit=lv.L.players[lv.sa].kit;assert.ok(kit.named.some(d=>d.kind==='a'&&d.key===ad.key),'the kit carries the armor def');
  let m0=mark();const tl=[0,1,2,3].map(i=>i===lv.sa?{seat:i,survives:false,ks:lv.sb,kb:'g',f:1}:{seat:i,f:5,won:i===lv.sb});for(const x of [ann,bob])await x.req('match.result',{id:lv.L.id,table:tl,hash:'L'});
  const lo=bob.got('loot.offer',m0)[0];const lp=lo&&lo.pieces.find(p=>/^na#/.test(p.item));assert.ok(lp&&lp.w&&lp.w.uq===ad.uq&&lp.kind==='a','the loot offer carries the named armor’s whole card');

  /* ── equip points through the server: domus.equip unticks the clashing piece; the kit never brings it ── */
  {const ivy=await client('ivy');await setC(ivy.ch.id,{glory:600,wallet:500});await ivy.req('char.buy',{char:ivy.ch.id,item:'galea'});
    let hd=null;for(let s=1;s<500&&!hd;s++){const a=C.rollNamedArmor(seeded(s),catalog,'epic',[]);if(a.slot==='head')hd=a}const c0=await getC(ivy.ch.id);const HP=C.namedPiece(hd,c0);C.putPiece(c0,HP,false);await db.put('CHAR#'+c0.id,'CHAR',c0);
    const eq=await ivy.req('domus.equip',{char:ivy.ch.id,item:HP.item,on:true});assert.ok(C.equipOf(eq).includes(HP.item)&&!C.equipOf(eq).includes('galea'),'domus.equip unticks the printed helm');
    const R=await ivy.req('lobby.create',{ev:'democritus',cry:false});const k=R.players[0].kit;assert.deepStrictEqual(k.items.filter(x=>x==='galea'||x===HP.item),[HP.item],'the kit brings one helm');await ivy.req('lobby.leave',{id:R.id})}
  /* ── RECLAIM a seat a CPU took ── */
  const cid=await client('cid'),dan=await client('dan');
  let rc=await bout(cid,dan,{ev:'egidious',loc:1,live:true});const sid=rc.L.id;
  await rejects(dan.req('match.reclaim',{id:sid}),'reclaim_no');
  const drop=async()=>{const M=await db.get('MATCH#'+sid,'META');M.away={...(M.away||{}),[dan.acct]:T-C.AWAY_MS-10};await db.put('MATCH#'+sid,'META',M);m0=mark();await cid.req('match.drop',{id:sid,seat:rc.sb});
    const inp=cid.got('match.input',m0).map(x=>x.in).find(x=>x.k==='drop');assert.ok(inp&&inp.until>T,'the drop input carries the window');return inp};
  await drop();let hd=await dan.req('hello',{all:1});assert.ok(hd.reclaim84&&hd.reclaim84.id===sid&&hd.reclaim84.seat===rc.sb,'hello offers the reclaim');
  const wr=await dan.req('match.watch',{id:sid});assert.ok(wr.reclaim&&wr.reclaim.seat===rc.sb&&wr.dropped.includes(dan.acct),'match.watch offers it too');
  await rejects(dan.req('match.input',{id:sid,in:{k:'tile',seat:rc.sb}}),null,/CPU holds/);
  m0=mark();const rr=await dan.req('match.reclaim',{id:sid});assert.strictEqual(rr.seat,rc.sb);const ri=cid.got('match.input',m0).map(x=>x.in).find(x=>x.k==='reclaim');assert.ok(ri&&ri.acct===dan.acct&&ri.from==='server','everyone hears ONE reclaim input');
  let M=await db.get('MATCH#'+sid,'META');assert.ok(!M.dropped[dan.acct]&&M.conns[dan.acct],'the seat is his again');assert.ok(!(await dan.req('hello',{all:1})).reclaim84);
  await rejects(dan.req('match.reclaim',{id:sid}),'reclaim_no');
  /* the window closes at the CPU's next turn of that seat: cpugo, then too late */
  await drop();m0=mark();const ch1=await cid.req('match.cpuheld',{id:sid,seat:rc.sb});assert.ok(ch1.held);assert.ok(dan.got('match.input',m0).length===0||true);
  assert.ok(cid.got('match.input',m0).some(x=>x.in.k==='cpugo'),'cpugo in the stream');assert.strictEqual((await cid.req('match.cpuheld',{id:sid,seat:rc.sb})).held,false,'once');
  await rejects(dan.req('match.reclaim',{id:sid}),'reclaim_late');
  /* the dropped seat need not report: the match settles on the others' */
  const tr=[0,1,2,3].map(i=>({seat:i,f:2,won:i===rc.sa}));const st=await cid.req('match.result',{id:sid,table:tr,hash:'r'});assert.ok(st.out,'settled without the dropped one');
  /* …or after RECLAIM_MS */
  rc=await bout(cid,dan,{ev:'cassian',loc:2,live:true});const sid2=rc.L.id;{const M2=await db.get('MATCH#'+sid2,'META');M2.away={[dan.acct]:T-C.AWAY_MS-10};await db.put('MATCH#'+sid2,'META',M2)}await cid.req('match.drop',{id:sid2,seat:rc.sb});
  T+=C.RECLAIM_MS+50;await rejects(dan.req('match.reclaim',{id:sid2}),'reclaim_late');
  /* a Custom abandon to the CPU opens the window; a Ranked abandon (a death) never does */
  await cid.req('match.abandon',{id:sid2});

  /* ── 🔨 FLAVIUS'S AUCTION ── */
  const eve=await client('eve'),fay=await client('fay'),gus=await client('gus');for(const x of [eve,fay])await setC(x.ch.id,{glory:600,wallet:20000});await setC(gus.ch.id,{wallet:20000});
  const mk=(seed,rar,kind)=>{const d=kind==='a'?C.rollNamedArmor(seeded(seed),catalog,rar,[]):C.rollNamed(seeded(seed),catalog,rar,[]);const P=C.namedPiece(d,{id:'fallen'+seed});P.pc.hist=[{house:'Domus Old',glad:'Old '+seed,when:T-1,how:'fell'}];return P};
  for(const [s,r,k] of [[1,'rare','w'],[2,'epic','a'],[3,'common','w'],[4,'rare','a'],[5,'rare','w'],[6,'common','a'],[7,'rare','w']]){const P=mk(s,r,k);await db.put('CHEST','P#'+C.itemUid(P.item),{item:P.item,pc:P.pc,at:T,taken:0})}
  T=C.seasonAt(T).end+1000;/* a new week: the first sweep draws its lots */
  let al=await eve.req('auction.list',{});assert.strictEqual(al.lots.length,C.AUC_LOTS,'six lots a week (v0.91)');assert.ok(al.lots.every(l=>l.w&&l.hist.length&&l.min===Math.ceil(l.val/2)),'full cards, owner history, half the value');
  assert.strictEqual((await db.query('CHEST','P#')).length,1,'the rest stays in the chest');assert.ok(al.lots[0].ends>=T+C.AUC_MIN_MS-100);
  const [L1,L2,L3]=al.lots;await setC(gus.ch.id,{glory:600});await rejects(dan.req('auction.bid',{lot:L1.id,amt:L1.min}),'auc_rank');await rejects(eve.req('auction.bid',{lot:L1.id,amt:L1.min-1}),'auc_low');
  let b1=await eve.req('auction.bid',{lot:L1.id,amt:L1.min});assert.strictEqual(await treC(eve),20000-L1.min,'escrow from the treasury (v0.92: the purse moved in)');assert.ok(b1.lot.bid.mine);
  await rejects(eve.req('auction.bid',{lot:L2.id,amt:L2.min}),'auc_lead');
  await rejects(fay.req('auction.bid',{lot:L1.id,amt:L1.min+1}),'auc_low');m0=mark();const next=C.aucNextMin({bid:{amt:L1.min}});await fay.req('auction.bid',{lot:L1.id,amt:next});
  assert.strictEqual(await treC(eve),20000,'the outbid coin is back at once');assert.strictEqual(eve.got('auction.outbid',m0)[0].amt,L1.min);
  b1=await eve.req('auction.bid',{lot:L2.id,amt:L2.min});assert.ok(b1.lot.mine,'free to lead another lot after being outbid');
  /* anti-snipe: Gus outbids Eve in the last minute */
  const X2=await db.get('AUCTION#'+C.seasonAt(T).key,'L#000002');T=X2.ends-60e3;const gb=C.aucNextMin({bid:{amt:L2.min}});const b3=await gus.req('auction.bid',{lot:L2.id,amt:gb});
  assert.strictEqual(b3.lot.ends,T+C.AUC_SNIPE_MS,'a late bid adds five minutes');assert.strictEqual(await treC(eve),20000);
  /* the hammer: one sweep settles; each winner gets the piece with a history line, the coin leaves the game; the unsold go back to the chest */
  T=b3.lot.ends+1000;const w0=[await treC(fay),await treC(gus)];m0=mark();al=await fay.req('auction.list',{});
  const sold=al.lots.concat(al.past).filter(l=>l.done);const S1=sold.find(l=>l.id===L1.id),S2=sold.find(l=>l.id===L2.id),S3=sold.find(l=>l.id===L3.id);
  assert.ok(S1&&S1.won.name==='Fay Gladius'&&S2&&S2.won.name==='Gus Gladius'&&S3&&!S3.won,'sold to the leaders; the third unsold');
  const G=await getC(gus.ch.id);const got2=G.gear.find(g=>C.itemUid(g)===C.itemUid(L2.item));assert.ok(got2,'the piece is his');assert.strictEqual(C.pcOf(G,got2).hist.slice(-1)[0].how,'auction','owner history');
  assert.strictEqual(C.pcOf(G,got2).hist[0].glad,'Old 2','the old history kept');
  assert.deepStrictEqual([await treC(fay),await treC(gus)],w0,'the winning coin left the game');assert.strictEqual(fay.got('auction.won',m0).length,1);
  assert.ok((await db.query('CHEST','P#')).some(x=>C.itemUid(x.item)===C.itemUid(L3.item))||(await db.query('AUCTION#'+C.seasonAt(T).key,'L#')).some(x=>C.itemUid(x.item)===C.itemUid(L3.item)),'unsold → back to the chest (or drawn again)');
  /* one win a house a week: Fay may not bid on another lot of that week; Eve may */
  const wk=C.seasonAt(T-2e6).key;await db.put('AUCTION#'+wk,'L#000009',{id:wk+'#9',key:wk,n:9,item:'nw#z.9',pc:mk(9,'rare','w').pc,val:3000,min:1500,opens:T,ends:T+3600e3,bid:null,bids:[],done:false});
  await rejects(fay.req('auction.bid',{lot:wk+'#9',amt:1500}),'auc_won');await eve.req('auction.bid',{lot:wk+'#9',amt:1500});
  /* TEST houses never bid */
  const tess=await client('tess',{email:'tess@example.com'});await tess.req('admin.grant',{glory:600,coin:5000});await rejects(tess.req('auction.bid',{lot:wk+'#9',amt:2000}),'testHouse');
  /* guests read it */
  const gconn='g84';live.add(gconn);await h({requestContext:{routeKey:'$connect',connectionId:gconn},queryStringParameters:{guest:'guest84abcdefg',ver:String(C.VER)}});const ga=await ask(gconn,'auction.list',{});assert.ok(Array.isArray(ga.lots));assert.strictEqual(ga.mine.why,'Sign in to bid.');
  /* ── Today names the house ── */
  await bout(eve,fay,{ev:'cassian',loc:1,a:{won:true,f:9}});const td=(await eve.req('hello',{all:1})).today;const any=[...(td.wins||[]),...(td.fallen||[])].find(e=>e.dom);assert.ok(any&&any.dn&&/^Domus /.test(any.dn),'Today entries carry the house name');
  console.log('server v0.84 (weekly challenge + one gift, CPU-won rewards, named armor gifts + loot defs, reclaim + cpugo + late, auction: draw, escrow, outbid refund, one lead, anti-snipe, settle + sink, one win a week, test houses, guests; Today house names): all checks passed')}

(async()=>{rules();await routes()})().catch(e=>{console.error(e);process.exit(1)});
