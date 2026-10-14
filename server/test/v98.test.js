/* v0.98 PART E: Custom-room passwords (salted hash in its own item, pw_need / pw_bad / Ranked refuses / tries capped / Find me a fight skips
   🔒 rooms / the host sets and clears it), the room's region from the host's time zone, house.card (record, gladiators, fallen, best rank, last
   events, privacy), the DOMUS RANK (best 4 living + 20% of the fallen, never drops, members carry their tier), a silent Find me a fight,
   Golden Eagle as Custom only (Ludus refused: not online), Damnatio only at creation, the bonus renames. node server/test/v98.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');C.SLOT100.start=4; /* v1.0: these checks predate the Domus slots */const crypto=require('crypto');

function units(){
  for(const s of ['','abc','x'.repeat(55),'x'.repeat(56),'x'.repeat(64),'Ave, héllo 🔒'.repeat(11)])assert.strictEqual(C.sha256hex98(s),crypto.createHash('sha256').update(s,'utf8').digest('hex'),'sha256 '+s.length);
  assert.ok(C.pwWhy98('abc',true)&&C.pwWhy98('ab',false)&&!C.pwWhy98('abc',false)&&C.pwWhy98('x'.repeat(25),false),'password rules');
  assert.notStrictEqual(C.pwHash98('s1','pw'),C.pwHash98('s2','pw'),'salted');
  const R={'Europe/Rome':'eu','America/New_York':'na','America/Sao_Paulo':'sa','America/Argentina/Buenos_Aires':'sa','Africa/Lagos':'af','Asia/Dubai':'me','Europe/Istanbul':'me',
    'Asia/Tokyo':'as','Australia/Sydney':'oc','Pacific/Honolulu':'na','Atlantic/Reykjavik':'eu','UTC':'','<bad>':''};
  for(const [tz,k] of Object.entries(R))assert.strictEqual(C.regionOf98(tz),k,'region of '+tz);
  assert.strictEqual(C.REGIONS98.length,7,'seven regions');
  /* Domus rank */
  const ch=(g,alive)=>({glory:g,alive});
  assert.strictEqual(C.drankScore98([ch(100,1),ch(300,1),ch(50,1),ch(500,1),ch(20,1),ch(1000,0)]),950+200,'best 4 living + 20% fallen');
  assert.deepStrictEqual(C.DRANKS98.map(r=>r.at),[0,200,600,1500,3000,5500,9000,15000],'his thresholds');
  assert.deepStrictEqual(C.DRANKS98.map(r=>r.n),['Tugurium','Taberna','Ludus Minor','Ludus','Ludus Magnus','Familia Nota','Domus Illustris','Domus Aurea'],'his names');
  assert.strictEqual(C.drankOf98(1150).k,'ludusminor');assert.strictEqual(C.drankOf98(15000).k,'aurea');assert.strictEqual(C.drankOf98(0).k,'tugurium');
  const D={dr98:1150};assert.ok(!C.drankKeep98(D,750)&&D.dr98===1150,'never drops');assert.ok(C.drankKeep98(D,1200)&&D.dr98===1200,'rises');
  assert.deepStrictEqual(C.domusRow({id:'d',name:'X',dr98:3001.7}).dr98,{s:3001,k:'ludusmagnus'},'domusRow carries it');
  /* events */
  assert.ok(!C.EVENTS_ALL.includes('ludus')&&C.EVENTS_ALL.includes('goldenEagle')&&!C.EVENTS_ALL.includes('gauntlet')&&C.EVENTS_TEAM.includes('goldenEagle'),'the first wave');
  assert.ok(C.EVENTS3.every(k=>!C.customOnly98(k))&&!C.customOnly98('familia'),'Classics + Familia stay Ranked-able');
  for(let t=C.SEASON_EPOCH;t<C.SEASON_EPOCH+40*C.WEEK_MS;t+=C.WEEK_MS)assert.ok(!C.customOnly98(C.onlineFixture(t).ev),'the weekly fixture never becomes a Custom-only event');
  assert.throws(()=>C.newLobby({ev:'goldenEagle',ranked:true},{id:'a',name:'A'},'L1',1),/Custom only/);
  assert.throws(()=>C.newLobby({ev:'ludus'},{id:'a',name:'A'},'L1b',1),/not played online/,'Ludus is not online (his pick C)');
  const L=C.newLobby({ev:'democritus'},{id:'a',name:'A'},'L2',1);assert.match(C.roomSet(L,'a',{ev:'ludus'},1),/not played online/,'a room cannot switch to Ludus');
  assert.ok(!C.roomSet(L,'a',{ev:'goldenEagle'},2)&&L.team&&L.seats>=4&&L.ev==='goldenEagle','to Golden Eagle (teams)');
  assert.ok(!C.roomSet(L,'a',{seats:8},3)&&L.seats===8,'Golden Eagle seats 4–8');assert.ok(!C.roomSet(L,'a',{ev:'democritus'},4)&&L.ev==='democritus'&&!L.team&&L.seats===4,'back to a Classic');
  const RL=C.newLobby({ev:'democritus',ranked:true},{id:'a',name:'A',rank:'tiro'},'L3',1);assert.match(C.roomSet(RL,'a',{ev:'goldenEagle'},2),/Custom only/);
  /* Damnatio */
  const live=cls=>({alive:true,cls});const T={treasury:999};
  /* v1.02: the class is set at creation for every class (Damnatio included) */for(const [a,b] of [['hero','damnatio'],['damnatio','hero'],['hero','slave']])assert.strictEqual(C.classWhy(live(a),b,T),C.CLASS_FIXED102);

  /* renames */
  const U=k=>C.UNIQUES.find(u=>u.k===k).n,UA=k=>C.UNIQUES_A.find(u=>u.k===k).n;
  assert.deepStrictEqual([U('gloria'),U('percussor'),U('aegis'),UA('mercurialis'),UA('gloriosa')],['Gloriosus II','Acutus II','Aegis','Velox II','Laudis'],'unique names');
  const nw=(n,o)=>C.cleanNamed({n,key:'nw_t',base:'gladius',rar:'rare',p:2,r:1,...o});
  assert.strictEqual(nw('Gladius Gloriosus',{aff:['crowd']}).n,'Gladius Gloriosus I');assert.strictEqual(nw('Gladius Acutus Martis',{aff:['pierce','dmg']}).n,'Gladius Acutus I Martis');
  assert.strictEqual(nw('Gladius Cruentus',{aff:['dmg']}).n,'Gladius Cruentus','other affixes unchanged');
  assert.strictEqual(C.cleanNamed({n:'Clava Gloriae',key:'nw_c',base:'mace',rar:'legendary',uq:'gloria'}).n,'Clava Gloriosa II','gender kept');
  assert.strictEqual(C.cleanNamed({n:'Gladius Percussor',key:'nw_p',base:'gladius',rar:'legendary',uq:'percussor'}).n,'Gladius Acutus II');
  assert.strictEqual(C.cleanNamed({n:'Gladius Aegis',key:'nw_a',base:'gladius',rar:'legendary',uq:'aegis'}).n,'Gladius Aegis','Aegis keeps its name');
  const na=(n,o)=>C.cleanNamedA({n,key:'na_t',base:'x',slot:'head',ap:2,rar:'rare',...o});
  assert.strictEqual(na('Galea Velox',{aff:['swift']}).n,'Galea Velox I');assert.strictEqual(na('Galea Tuta',{aff:['ward']}).n,'Galea Tuta','Tutus keeps its name');
  assert.strictEqual(na('Galea Mercurii',{uq:'mercurialis'}).n,'Galea Velox II');assert.strictEqual(na('Lorica Gloriae',{uq:'gloriosa',slot:'chest'}).n,'Lorica Laudis');
  const deep={a:[{w:{n:'Gladius Gloriosus',aff:['crowd'],base:'gladius',named83:1}}],b:{n:'Galea Velox II',uq:'mercurialis',kind:'a',slot:'head',named84:1}};C.renameDeep98(deep);C.renameDeep98(deep);
  assert.strictEqual(deep.a[0].w.n,'Gladius Gloriosus I');assert.strictEqual(deep.b.n,'Galea Velox II','idempotent');
  /* rolled names come out new */
  let seen=0;for(let i=1;i<400;i++){let x=i*7919;const rnd=()=>{x=(x*48271)%2147483647;return x/2147483647};const w=C.rollNamed(rnd,{gladius:{kind:'w',lv:1,p:2,r:1},mace:{kind:'w',lv:1,p:2,r:1}},'legendary',[]);
    if(w&&w.uq==='gloria'){seen++;assert.match(w.n,/Glorios(us|a) II$/)}if(w&&w.uq==='percussor')assert.match(w.n,/Acut(us|a) II$/)}assert.ok(seen>0,'a rolled Gloriosus II');
  console.log('v0.98 units (sha256, regions, Domus rank, events, Damnatio, renames): all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=C.SEASON_EPOCH+5*C.WEEK_MS+3600e3;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{}});let nc=0,mid=0;
  const raw=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);return m.msg};
  const ask=async(conn,t,d)=>{const m=await raw(conn,t,d);if(!m.ok){const e=new Error(m.err);e.code=m.code;e.reply=m;throw e}return m.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);cl.raw=(t,d)=>raw(cl.conn,t,d);
    cl.got=(type,from)=>sent.slice(from||0).filter(x=>x.conn===cl.conn&&x.msg.push===type).map(x=>x.msg.d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});await cl.req('domus.create',{name:'Domus '+name});cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1,tz:cl.tz||'Europe/Rome'});return cl}
  const ann=await client('ann'),bob=await client('bob','slave'),cat=await client('cat'),dan=await client('dan');
  const leave=async(cl,id)=>{await cl.req('lobby.leave',{id})};

  /* ── 1 · passwords ── */
  await rejects(ann.req('lobby.create',{ev:'democritus',ranked:true,pw:'secret'}),'pw_ranked');
  await rejects(ann.req('lobby.create',{ev:'democritus',pw:'ab'}),'pw_bad');
  const L=await ann.req('lobby.create',{ev:'democritus',pw:'Secret 1',tz:'America/Sao_Paulo',cry:false});
  assert.ok(L.pw===1&&L.reg==='sa','the room is locked and from South America: '+JSON.stringify({pw:L.pw,reg:L.reg}));
  const item=await db.get('LOBBY#'+L.id,'PW98');assert.ok(item&&/^[0-9a-f]{64}$/.test(item.h)&&item.s&&item.h===C.pwHash98(item.s,'Secret 1'),'a salted hash in its own item');
  const roomTxt=JSON.stringify(await db.get('LOBBY#'+L.id,'LOBBY'));assert.ok(!/Secret 1|"h":"[0-9a-f]{64}"/.test(roomTxt),'nothing of it on the room');
  const row=(await bob.req('lobby.list',{})).find(x=>x.id===L.id);assert.ok(row&&row.pw===1&&row.reg==='sa'&&row.lite,'the list shows 🔒 + the region');
  assert.ok(!/Secret|PW98/.test(JSON.stringify(row)),'no secret in the list');
  await rejects(bob.req('lobby.join',{id:L.id}),'pw_need');await rejects(bob.req('lobby.join',{id:L.id,pw:'nope'}),'pw_bad');
  const J=await bob.req('lobby.join',{id:L.id,pw:'Secret 1'});assert.ok(J.members.some(m=>m.id===bob.acct),'the right password lets him in');
  for(let i=0;i<C.PW98.TRIES;i++)await rejects(cat.req('lobby.join',{id:L.id,pw:'guess'+i}),'pw_bad');
  await rejects(cat.req('lobby.join',{id:L.id,pw:'Secret 1'}),'slow');T+=C.PW98.WIN;
  /* Find me a fight never seats anyone in a 🔒 room */
  const q=await cat.req('lobby.quick',{ev:'democritus',ranked:false});assert.ok(q.made&&q.lobby.id!==L.id,'quick skipped the locked room');
  /* 5 · and it is silent: no first call, no Forum line, no push */
  assert.strictEqual((q.lobby.cry||[]).length,0,'no call spent');
  assert.ok(!(await dan.req('forum.get',{})).some(l=>l.k==='open'&&l.row&&l.row.id===q.lobby.id),'no Forum line for a playlist room');
  assert.ok(!dan.got('forum.line').some(x=>x.line&&x.line.row&&x.line.row.id===q.lobby.id),'no cry pushed');
  /* the host clears / sets it; only the host; never Ranked */
  await rejects(bob.req('lobby.set',{id:L.id,pw:''}),null,/Only the host/);
  const L2=await ann.req('lobby.set',{id:L.id,pw:''});assert.ok(!L2.pw&&!(await db.get('LOBBY#'+L.id,'PW98')),'cleared');
  const L3=await ann.req('lobby.set',{id:L.id,pw:'Other one',loc:4});assert.ok(L3.pw===1&&L3.loc===4,'set again, with another setting in the same request');
  await leave(bob,L.id);await leave(ann,L.id);await leave(cat,q.lobby.id);
  const RL=await ann.req('lobby.create',{ev:'democritus',ranked:true,cry:false});await rejects(ann.req('lobby.set',{id:RL.id,pw:'abcd'}),'pw_ranked');
  /* 6 · Golden Eagle is Custom only; Ludus is refused */
  await rejects(ann.req('lobby.set',{id:RL.id,ev:'goldenEagle'}),null,/Custom only/);await rejects(ann.req('lobby.set',{id:RL.id,ev:'ludus'}),null,/not played online/);await leave(ann,RL.id);
  await rejects(ann.req('lobby.create',{ev:'goldenEagle',ranked:true}),null,/Custom only/);await rejects(ann.req('lobby.quick',{ev:'goldenEagle',ranked:true}),null,/Custom only/);await rejects(ann.req('lobby.create',{ev:'ludus'}),null,/not played online/);
  const LU=await ann.req('lobby.create',{ev:'cassian',cry:false});assert.ok(LU.ev==='cassian'&&!LU.ranked,'a Custom room');
  const GE=await ann.req('lobby.set',{id:LU.id,ev:'goldenEagle',seats:6});assert.ok(GE.ev==='goldenEagle'&&GE.team&&GE.seats===6,'Golden Eagle with teams');
  await bob.req('lobby.join',{id:LU.id});const GL=(await bob.req("lobby.get",{id:LU.id})).lobby;assert.ok(GL.players.every(p=>p.team),'seated on teams');
  await leave(bob,LU.id);await leave(ann,LU.id);
  /* the region follows the presence time zone when the page sends none; a hidden lanista's room has none */
  const LR=await dan.req('lobby.create',{ev:'cassian',cry:false});assert.strictEqual(LR.reg,'eu','from hello\'s time zone');await leave(dan,LR.id);
  await dan.req('acct.priv',{hide:true});const LH=await dan.req('lobby.create',{ev:'cassian',tz:'Asia/Tokyo',cry:false});assert.ok(!LH.reg,'hidden: no region');await leave(dan,LH.id);await dan.req('acct.priv',{hide:false});

  /* ── 4 · the Domus rank ── */
  const setChar=async(id,f)=>{const c=await db.get('CHAR#'+id,'CHAR');f(c);await db.put('CHAR#'+id,'CHAR',c)};
  const more=[];for(let i=0;i<C.GLAD_MAX-1;i++)more.push(await ann.req('char.create',{name:'Ann Extra '+'ABC'[i],cls:'soldier'}));
  const ids=[ann.ch.id,...more.map(c=>c.id)];const gl=[100,300,50,500];for(let i=0;i<ids.length;i++)await setChar(ids[i],c=>{c.glory=gl[i]});
  let G=await ann.req('domus.get',{});assert.deepStrictEqual(G.domus.dr98,{s:950,k:'ludusminor'},'best 4 living');
  await setChar(ids[1],c=>{c.alive=false;c.died={at:T,rank:'summa'};c.glory=1000});
  G=await ann.req('domus.get',{});assert.deepStrictEqual(G.domus.dr98,{s:950,k:'ludusminor'},'a death: 650 living + 20% of 1000 = 850 — the best (950) is kept');
  await setChar(ids[3],c=>{c.glory=1400});G=await ann.req('domus.get',{});assert.deepStrictEqual(G.domus.dr98,{s:1750,k:'ludus'},'1550 living + 200 → Ludus');
  /* members carry their tier; the list shows it beside the host */
  const LD=await ann.req('lobby.create',{ev:'democritus',cry:false});assert.strictEqual(LD.members.find(m=>m.id===ann.acct).dr,'ludus','the member wears the tier');
  await bob.req('lobby.join',{id:LD.id});const lr=(await cat.req('lobby.list',{})).find(x=>x.id===LD.id);
  assert.ok(lr.host.dr==='ludus'&&lr.members.find(m=>m.id===ann.acct).dr==='ludus'&&lr.members.find(m=>m.id===bob.acct).dr==='tugurium','the list row: '+JSON.stringify(lr.members));
  await leave(bob,LD.id);await leave(ann,LD.id);

  /* ── 3 · the house card ── */
  const hc=await bob.req('house.card',{acct:ann.acct});
  assert.ok(hc.domus.name==='Domus ann'&&hc.domus.dr98.k==='ludus'&&!('treasury' in hc.domus),'public face only: '+JSON.stringify(hc.domus));
  assert.deepStrictEqual(hc.glads.map(g=>g.glory),[1400,100,50],'living, best first');assert.strictEqual(hc.fallen,1);assert.strictEqual(hc.best,'summa','the best rank ever (a fallen Summa Rudis)');
  assert.ok(Array.isArray(hc.last)&&hc.last.length<=6&&!hc.mine&&hc.lan&&/^FID-/.test(hc.fid),'last events, lanista, FID');
  assert.ok(['free','room','fight','off'].includes(hc.now.st),'now');assert.ok((await ann.req('house.card',{acct:ann.acct})).mine,'mine');
  await ann.req('acct.priv',{hide:true});const hh=await bob.req('house.card',{acct:ann.acct});assert.ok(hh.now.st==='off'&&!hh.acct,'a hidden lanista shows no "now"');await ann.req('acct.priv',{hide:false});
  assert.ok((await bob.req('house.card',{id:hc.domus.id})).domus.name==='Domus ann','by house id');await rejects(bob.req('house.card',{acct:'dev-nobody'}),'no_domus');
  assert.ok(C.GUEST_OK.includes('house.card'),'guests may look');
  /* recent events show W/L */
  await db.put('DOMUS#'+hc.domus.id,'DOMUS',{...(await db.get('DOMUS#'+hc.domus.id,'DOMUS')),recent:Array.from({length:9},(_,i)=>({id:'m'+i,ev:'democritus',loc:3,at:T-i,won:i%2===0,died:false,glad:'Ann',ranked:true}))});
  const hr=await bob.req('house.card',{acct:ann.acct});assert.ok(hr.last.length===6&&hr.last[0].won&&!hr.last[1].won,'the last six, W/L');

  /* ── 7 · Damnatio only at creation ── */
  const dm=await cat.req('char.create',{name:'Cat Damned',cls:'damnatio'});assert.strictEqual(dm.cls,'damnatio','a Damnatio may be raised');
  const DC=await db.get('DOMUS#'+(await cat.req('domus.get',{})).domus.id,'DOMUS');DC.treasury=900;await db.put('DOMUS#'+DC.id,'DOMUS',DC);
  await rejects(cat.req('char.class',{char:dm.id,cls:'hero'}),'class_fixed');await rejects(cat.req('char.class',{char:cat.ch.id,cls:'damnatio'}),'class_fixed');
  await rejects(cat.req('char.class',{char:cat.ch.id,cls:'slave'}),'class_fixed');
  assert.strictEqual((await db.get('DOMUS#'+DC.id,'DOMUS')).treasury,900,'nothing paid (v1.02)');
  /* ── 9 · OFFERINGS CAP 2 ── */
  assert.strictEqual(C.OFF_MAX,2);assert.deepStrictEqual(C.offersBrought({offers:['elix2','ap2'],offerEq:['ap2']}),['elix2','ap2'],'all he holds is brought, offerEq ignored');
  const eve=await client('eve');const EC=await db.get('CHAR#'+eve.ch.id,'CHAR'),ED=await db.get('DOMUS#'+eve.ch.domus,'DOMUS');
  await db.put('DOMUS#'+ED.id,'DOMUS',{...ED,treasury:100,offers:[]});
  await db.put('CHAR#'+EC.id,'CHAR',{...EC,offers:['elix2','ap2'],wallet:0});await db.put('DOMUS#'+ED.id,'DOMUS',{...(await db.get('DOMUS#'+ED.id,'DOMUS')),treasury:1000});
  await rejects(eve.req('offer.buy',{char:eve.ch.id,key:'cf1'}),null,/He carries at most 2 offerings\./);
  await db.put('DOMUS#'+ED.id,'DOMUS',{...(await db.get('DOMUS#'+ED.id,'DOMUS')),offers:['merc1']});
  await rejects(eve.req('offer.move',{key:'merc1',from:'house',to:eve.ch.id}),null,/He carries at most 2 offerings\./);
  /* an old gladiator holding 4: the first two stay, two go to the shelf */
  await db.put('CHAR#'+EC.id,'CHAR',{...(await db.get('CHAR#'+EC.id,'CHAR')),offers:['elix2','ap2','cf1','merc1'],offerEq:['merc1'],off98:undefined});
  await db.put('DOMUS#'+ED.id,'DOMUS',{...(await db.get('DOMUS#'+ED.id,'DOMUS')),offers:[],treasury:100});
  await eve.req('hello',{all:1});let E1=await db.get('CHAR#'+EC.id,'CHAR'),D1=await db.get('DOMUS#'+ED.id,'DOMUS');
  assert.deepStrictEqual(E1.offers,['elix2','ap2']);assert.ok(E1.off98);assert.deepStrictEqual(D1.offers.slice().sort(),['cf1','merc1']);assert.strictEqual(D1.treasury,100,'no refund while the shelf has room');
  await eve.req('domus.get',{});assert.deepStrictEqual((await db.get('CHAR#'+EC.id,'CHAR')).offers,['elix2','ap2'],'once: a second read changes nothing');assert.strictEqual((await db.get('DOMUS#'+ED.id,'DOMUS')).offers.length,2);
  /* the shelf full: the price paid is refunded to the treasury with a ledger line */
  const cap=C.shelfMax(D1);await db.put('CHAR#'+EC.id,'CHAR',{...(await db.get('CHAR#'+EC.id,'CHAR')),offers:['elix2','ap2','elix4','ap3'],off98:undefined});
  await db.put('DOMUS#'+ED.id,'DOMUS',{...(await db.get('DOMUS#'+ED.id,'DOMUS')),offers:Array(cap-1).fill('cf1'),treasury:100});
  await eve.req('hello',{all:1});E1=await db.get('CHAR#'+EC.id,'CHAR');D1=await db.get('DOMUS#'+ED.id,'DOMUS');
  assert.deepStrictEqual(E1.offers,['elix2','ap2']);assert.strictEqual(D1.offers.length,cap);assert.strictEqual(D1.treasury,100+C.PRICE_OFF.ap3,'the 2nd extra (ap3) refunded');assert.strictEqual(D1.led89.in.refund,C.PRICE_OFF.ap3,'ledger line');
}
(async()=>{units();await routes();console.log('v0.98 routes: all checks passed')})().catch(e=>{console.error(e);process.exit(1)});
