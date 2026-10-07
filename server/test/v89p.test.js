/* v0.89 L · THE LANISTA (contract tools/plans/onl89-profile.md): the lanista name (filter, unique, rename once in 30 days, "formerly" for 14,
   then released), the sign-in name never kept, privacy (Here now / Orbis, who may invite), the FID (made once, find, follow / invite by FID,
   rate limit), the read-only house visit (no purses / treasury / shelf), delete my account.
   node server/test/v89p.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');
const DAY=86400e3;

function rules(){C.setCatalog(catalog);
  assert.strictEqual(C.lnameWhy('Gaius Varro'),'');assert.match(C.lnameWhy('Ga'),/3–24/);assert.match(C.lnameWhy('x'.repeat(25)),/3–24/);assert.match(C.lnameWhy('Gaius shitface'),/another name/);assert.match(C.lnameWhy('R2D2 Unit'),/Letters only/);
  assert.strictEqual(C.lnameKey('  Gaius   VARRO '),'gaius varro');
  assert.strictEqual(C.fidClean('fid-ab3 xyz'),'AB3XYZ');assert.strictEqual(C.fidClean('AB3XYZ'),'AB3XYZ');assert.strictEqual(C.fidClean('AB0XYZ'),'','no look-alikes');assert.strictEqual(C.fidClean('ABC'),'');
  for(let i=0;i<50;i++){const f=C.fidMake();assert.ok(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(f),f)}assert.strictEqual(C.fidShow('AB3XYZ'),'FID-AB3XYZ');
  assert.strictEqual(C.invWhy89({},{domus:'D1'}),'');assert.match(C.invWhy89({priv89:{inv:'none'}},{domus:'D1'}),/no invitations/);
  assert.match(C.invWhy89({priv89:{inv:'follow'},follows:[{id:'D2'}]},{domus:'D1'}),/follow/);assert.strictEqual(C.invWhy89({priv89:{inv:'follow'},follows:[{id:'D1'}]},{domus:'D1'}),'');
  assert.deepStrictEqual(C.cleanPriv89({hide:1,inv:'bogus'},{inv:'follow'}),{hide:true,inv:'follow'});
  const A={lname:'Gaius',nameAt:1};assert.match(C.renameWhy(A,DAY),/30 days/);assert.strictEqual(C.renameWhy(A,31*DAY),'');
  const pub=C.domusPub89({id:'D1',name:'Vettii',treasury:900,gifts:[1],offers:['ap2'],led89:{since:1,in:{},out:{},by:{}}});assert.ok(!('treasury' in pub)&&!('gifts' in pub)&&!('offers' in pub)&&!('led89' in pub));assert.strictEqual(pub.name,'Vettii');
  const g=C.newChar({name:'Visit Me',cls:'hero'},'o','vm',0);g.wallet=77;g.offers=['ap2'];g.kits89=[{n:'x',items:[]}];const v=C.visitChar89(g);
  assert.ok(!('wallet' in v)&&!('offers' in v)&&!('kits89' in v));assert.strictEqual(v.name,'Visit Me');
  console.log('v0.89 L rules (name filter, FID, invite privacy, rename clock, public house + gladiator): all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=Date.UTC(2026,9,6,12);const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});
  let nc=0,rid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  const connect=async name=>{const conn='w'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);return conn};
  async function client(name,o={}){const cl={name,acct:'dev-'+name};cl.conn=await connect(name);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:'Real '+name+' Person',google:1});if(o.house!==false){cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:'hero'})}return cl}
  const ann=await client('ann'),bob=await client('bob'),carl=await client('carl'),dan=await client('dan');

  /* the first hello: no lanista name yet, an FID made once, the sign-in name gone */
  let H=await ann.req('hello',{all:1,tz:'America/New_York'});assert.ok(H.needLname&&H.lan89.need,'the name step');assert.match(H.lan89.fid,/^FID-[2-9A-HJ-NP-Z]{6}$/);
  assert.ok(!/Real ann/.test(JSON.stringify(H)),'the sign-in name is never sent back');const fidA=H.lan89.fid;assert.strictEqual((await ann.req('hello',{all:1})).lan89.fid,fidA,'the FID never changes');
  assert.ok(!/Real ann/.test(JSON.stringify((await db.get('ACCT#dev-ann','PROFILE')))),'nor kept');
  /* the name: filter, length, unique (case-insensitive) */
  await rejects(ann.req('lanista.name',{name:'Ga'}),'lname');await rejects(ann.req('lanista.name',{name:'Gaius Bitchface'}),'lname');
  let r=await ann.req('lanista.name',{name:'Gaius Varro'});assert.strictEqual(r.lan.name,'Gaius Varro');assert.ok(!(await ann.req('hello',{all:1})).needLname);
  assert.strictEqual((await ann.req('hello',{all:1})).me.name,'Gaius Varro','the rail name = the lanista name');
  await rejects(bob.req('lanista.name',{name:'gaius VARRO'}),'name_taken');await bob.req('lanista.name',{name:'Bobius Maximus'});
  await carl.req('lanista.name',{name:'Carlus Niger'});await dan.req('lanista.name',{name:'Danus Felix'});
  /* rename: refused inside 30 days, then once; the former name is held 14 days for its owner, shown on the profile, then released */
  await rejects(ann.req('lanista.name',{name:'Marcus Varro'}),'too_soon',/30 days/);T+=31*DAY;
  r=await ann.req('lanista.name',{name:'Marcus Varro'});assert.strictEqual(r.lan.name,'Marcus Varro');assert.strictEqual(r.lan.old,'Gaius Varro');
  await rejects(ann.req('lanista.name',{name:'Titus Varro'}),'too_soon');await rejects(bob.req('lanista.name',{name:'Gaius Varro'}),'name_taken');
  let P=await bob.req('domus.profile',{id:ann.domus.id});assert.strictEqual(P.lan.n,'Marcus Varro');assert.strictEqual(P.lan.old,'Gaius Varro');assert.strictEqual(P.fid,fidA);
  T+=15*DAY;P=await bob.req('domus.profile',{id:ann.domus.id});assert.ok(!P.lan.old,'formerly … gone after 14 days');
  T+=16*DAY;await bob.req('lanista.name',{name:'Gaius Varro'});
  /* lanista names for the room roster */
  const names=await ann.req('lanista.names',{ids:['dev-bob','dev-carl','bot1']});assert.strictEqual(names['dev-bob'].n,'Gaius Varro');assert.match(names['dev-carl'].fid,/^FID-/);assert.ok(!names.bot1);

  /* privacy: hidden from Here now and the Orbis glow, still counted */
  for(const c of [ann,bob,carl,dan])c.conn=await connect(c.name);
  for(const c of [ann,bob,carl,dan])await c.req('hello',{all:1,tz:c===carl?'Asia/Tokyo':'Europe/Rome'});
  let W=await ann.req('who.list');assert.ok(W.some(x=>x.id==='dev-carl'),'carl is here');assert.ok(W.find(x=>x.id==='dev-carl').lan==='Carlus Niger');
  H=await ann.req('hello',{all:1});assert.ok(H.here.zones.Asia_Tokyo||H.here.zones['Asia/Tokyo'],'carl glows in Tokyo');const n0=H.here.n;
  await carl.req('acct.priv',{hide:true});await carl.req('hello',{all:1,tz:'Asia/Tokyo'});
  W=await ann.req('who.list');assert.ok(!W.some(x=>x.id==='dev-carl'),'no pill');H=await ann.req('hello',{all:1});assert.ok(!H.here.zones.Asia_Tokyo&&!H.here.zones['Asia/Tokyo'],'no glow');assert.strictEqual(H.here.n,n0,'still counted');
  /* who may invite me */
  const room=await ann.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false});
  await carl.req('acct.priv',{inv:'none'});await rejects(ann.req('lobby.invite',{id:room.id,to:'dev-carl'}),null,/no invitations/);
  await carl.req('acct.priv',{inv:'follow'});await rejects(ann.req('lobby.invite',{id:room.id,to:'dev-carl'}),null,/houses they follow/);
  await carl.req('domus.follow',{fid:fidA});await ann.req('lobby.invite',{id:room.id,to:'dev-carl'});
  /* invite by FID (the pasted code) */
  const fidD=(await dan.req('hello',{all:1})).lan89.fid;T+=5000;await ann.req('lobby.invite',{id:room.id,to:fidD.toLowerCase()});
  await rejects(ann.req('lobby.invite',{id:room.id,to:'FID-ZZZZZZ'}),'no_fid');
  /* fid.find + follow by FID */
  const F=await bob.req('fid.find',{fid:' '+fidD.slice(4)+' '});assert.strictEqual(F.domus.name,'Domus dan');assert.strictEqual(F.lan.n,'Danus Felix');assert.ok(!('treasury' in F.domus));
  await rejects(bob.req('fid.find',{fid:'FID-ZZZZZZ'}),'no_fid',/No house with that FID/);
  const fl=await bob.req('domus.follow',{fid:fidD});assert.ok(fl.follows.some(f=>f.id===dan.domus.id));
  H=await bob.req('hello',{all:1});assert.strictEqual(H.follows.find(f=>f.id===dan.domus.id).lan,'Danus Felix','followed houses carry the lanista name');
  /* the visit: public face only */
  await db.put('DOMUS#'+dan.domus.id,'DOMUS',{...(await db.get('DOMUS#'+dan.domus.id,'DOMUS')),treasury:4321,offers:['ap2'],gear:['galea']});
  const ch=await db.get('CHAR#'+dan.ch.id,'CHAR');await db.put('CHAR#'+dan.ch.id,'CHAR',{...ch,wallet:987,gear:['galea','gladius'],equip:['galea','gladius'],offers:['cf1']});
  const V=await bob.req('domus.visit',{fid:fidD});const js=JSON.stringify(V);
  assert.strictEqual(V.domus.name,'Domus dan');assert.strictEqual(V.glads.length,1);assert.deepStrictEqual(V.glads[0].equip.slice().sort(),['galea','gladius']);assert.strictEqual(V.active,dan.ch.id);
  for(const k of ['wallet','treasury','"offers"','4321','987','kits89','led89'])assert.ok(!js.includes(k),'no '+k+' on a visit');
  assert.strictEqual(V.fid,fidD);assert.strictEqual(V.lan.n,'Danus Felix');assert.ok(!V.mine);
  assert.ok((await dan.req('domus.visit',{id:dan.domus.id})).mine);
  /* rate limit: 20 lookups a minute */
  T+=61e3;let slow=null;for(let i=0;i<25&&!slow;i++){try{await bob.req('fid.find',{fid:fidD})}catch(e){slow=e}}assert.ok(slow&&slow.code==='slow','the 21st lookup in a minute waits');T+=61e3;await bob.req('fid.find',{fid:fidD});

  /* delete my account: the house name to confirm; house, gladiators, names, FID gone; the name released */
  await rejects(dan.req('acct.delete',{confirm:'nope'}),'confirm');
  r=await dan.req('acct.delete',{confirm:'domus DAN'});assert.ok(r.deleted);
  assert.ok(!(await db.get('ACCT#dev-dan','PROFILE')));assert.ok(!(await db.get('DOMUS#'+dan.domus.id,'DOMUS')));assert.ok(!(await db.get('CHAR#'+dan.ch.id,'CHAR')));
  assert.ok(!(await db.get('DNAME#domus dan','DNAME')));assert.ok(!(await db.get('FID#'+fidD.slice(4),'FID')));
  await rejects(bob.req('fid.find',{fid:fidD}),'no_fid');H=await bob.req('hello',{all:1});assert.ok(!H.follows.some(f=>f.id===dan.domus.id),'a deleted house drops off the follow list');
  const eve=await client('eve');await eve.req('lanista.name',{name:'Danus Felix'});
  /* the dev sign-in box doubles as the lanista name when it is free */
  const fay={conn:await connect('fay')};fay.req=(t,d)=>ask(fay.conn,t,d);const fa=await fay.req('auth.signin',{name:'Faustus Rex'});assert.strictEqual(fa.lname,'Faustus Rex');assert.ok(!(await fay.req('hello',{all:1})).needLname);
  const gil={conn:await connect('gil')};gil.req=(t,d)=>ask(gil.conn,t,d);await gil.req('auth.signin',{name:'faustus rex'});assert.ok((await gil.req('hello',{all:1})).needLname,'taken → the step');
  /* a busy lanista cannot delete */
  await rejects(ann.req('acct.delete',{confirm:'Domus ann'}),'in_match');
  console.log('server v0.89 L (name step + unique + rename clock + formerly + release, sign-in name gone, roster names, privacy: Here now/Orbis/invites, FID: find/follow/invite/rate, visit public only, delete): all checks passed')}

rules();routes().catch(e=>{console.error(e);process.exit(1)});
