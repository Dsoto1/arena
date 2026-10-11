/* v1.0 WHO'S ONLINE: here.list (the online lanistas: status idle / room / fight / watch, house + Domus-rank tier, region from the time zone,
   your own row first), hidden lanistas never listed, guests read it (no invite / follow marks), filters + sort + the cursor + the size cap,
   one presence query (no house reads once dr100 is known), the general rate limit. node server/test/v100w.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');

function units(){
  const maps=C.whoMaps100([{id:'L1',status:'waiting',members:[{id:'a'},{id:'b'}],players:[{id:'a'}]},{id:'L2',status:'live',players:[{id:'c'},{id:'bot1'}]},{id:'L3',status:'done',players:[{id:'d'}]}],1000);
  assert.strictEqual(C.whoStatus100({id:'a'},maps).st,'room');assert.strictEqual(C.whoStatus100({id:'b'},maps).rm,'L1','standing counts as in the room');
  assert.deepStrictEqual(C.whoStatus100({id:'c'},maps),{st:'fight',m:'L2'});assert.strictEqual(C.whoStatus100({id:'d'},maps).st,'idle','a finished match is idle');
  assert.deepStrictEqual(C.whoStatus100({id:'e',w100:{id:'L2',at:900}},maps),{st:'watch',m:'L2'});
  assert.strictEqual(C.whoStatus100({id:'e',w100:{id:'L3',at:900}},maps).st,'idle','watching an ended match → idle');
  assert.strictEqual(C.whoStatus100({id:'e',w100:{id:'L2',at:1000-C.WHO100.WATCH_MS-1}},maps).st,'idle','a stale watch mark');
  const V={id:'me',domus:'dV',follows:[{id:'dA'}]};
  const A={id:'a',lname:'Marcus',dname:'Domus Alba',domus:'dA',here:{glad:'Alba Gladius',rank:'veteranus',tz:'Europe/Rome'}};
  const r=C.whoRow100(A,maps,{dr:'ludus',viewer:V});
  assert.deepStrictEqual(r,{id:'a',ln:'Marcus',g:'Alba Gladius',rk:'veteranus',dn:'Domus Alba',dom:'dA',dr:'ludus',rg:'eu',st:'room',rm:'L1',fo:1},'the row');
  assert.strictEqual(C.whoRow100({...A,priv89:{inv:'none'}},maps,{viewer:V}).ni,1,'takes no invitations');
  assert.strictEqual(C.whoRow100({...A,here:{rank:'nonsense'}},maps,{dr:'<b>'}).rk,'tiro');assert.strictEqual(C.whoRow100(A,maps,{dr:'<b>'}).dr,'','tier keys only');
  const mine=C.whoRow100({id:'me',priv89:{hide:true},here:{}},maps,{viewer:{id:'me'}});assert.ok(mine.me===1&&mine.hid===1,'my own row, marked hidden');
  assert.ok(!C.whoListed100({id:'h',priv89:{hide:true}},'me')&&C.whoListed100({id:'me',priv89:{hide:true}},'me')&&!C.whoListed100({id:'bot3'},'me'),'hidden + bots never listed, my own row always');
  const rows=[{id:'1',ln:'b',st:'idle',rk:'tiro',rg:'eu'},{id:'2',ln:'a',st:'fight',rk:'tiro',rg:'na'},{id:'3',ln:'c',st:'room',rk:'invictus',rg:''},{id:'9',ln:'z',st:'idle',rk:'tiro',me:1}];
  assert.deepStrictEqual(C.whoSort100(rows,'st').map(x=>x.id),['9','2','3','1'],'me first, then fighting, in a room, idle');
  assert.deepStrictEqual(C.whoSort100(rows,'name').map(x=>x.id),['9','2','1','3']);assert.deepStrictEqual(C.whoSort100(rows,'rank').map(x=>x.id),['9','3','2','1']);
  assert.deepStrictEqual(C.whoKeep100(rows,{status:'idle'}).map(x=>x.id),['1','9'],'status filter keeps my row');assert.deepStrictEqual(C.whoKeep100(rows,{region:'na'}).map(x=>x.id),['2','9']);
  assert.deepStrictEqual(C.whoKeep100(rows,{region:'none'}).map(x=>x.id),['3','9']);assert.strictEqual(C.whoKeep100(rows,{status:'<x>'}).length,4,'unknown filters ignored');
  const many=[];for(let i=0;i<450;i++)many.push({id:'a'+i,ln:'L'+i,g:'G'.repeat(40),dn:'D'.repeat(40),st:'idle',rk:'tiro'});
  const p1=C.whoPage100(many);assert.ok(p1.rows.length<=C.WHO100.MAX&&JSON.stringify(p1.rows).length<=C.WHO100.BYTES&&p1.next&&p1.n===450,'a capped page '+p1.rows.length);
  const p2=C.whoPage100(many,p1.next);assert.strictEqual(p2.rows[0].id,'a'+p1.rows.length,'the cursor continues');
  let seen=0,cur=null;do{const p=C.whoPage100(many,cur);seen+=p.rows.length;cur=p.next}while(cur);assert.strictEqual(seen,450,'every row once');
  /* per gladiator: ab = a match still fighting after the lanista abandoned it */
  const m2=C.whoMaps100([{id:'L2',status:'live',name:'x',players:[{id:'c',name:'Gaius'},{id:'z',name:'Zed'}]},{id:'L4',status:'live',players:[{id:'c',name:'Cato Two'}]}],1000);
  assert.deepStrictEqual(C.whoStatus100({id:'z'},m2,{m:'L2'}),{st:'idle'},'the abandoned match is not his current activity');
  assert.deepStrictEqual(C.whoStatus100({id:'c'},m2,{m:'L2'}),{st:'fight',m:'L4'},'another live match (another gladiator) still is');
  const abM={id:'L2',status:'live',abandoned:{z:'cpu'}};const ab=C.whoAb100({id:'z'},abM,m2,false);assert.deepStrictEqual(ab,{m:'L2',g:'Zed'});
  assert.strictEqual(C.whoAb100({id:'z'},abM,m2,true),null,'Ranked abandon = a recorded Fate, nothing fights on');assert.strictEqual(C.whoAb100({id:'c'},abM,m2,false),null,'not abandoned');
  assert.strictEqual(C.whoAb100({id:'z'},{...abM,status:'done'},m2,false),null,'match over');assert.strictEqual(C.whoAb100({id:'z'},{...abM,reports:{z:1}},m2,false),null,'reported');
  const rz=C.whoRow100({id:'z',lname:'Z',here:{glad:'Zed Two',rank:'tiro'}},m2,{ab});assert.ok(rz.st==='idle'&&rz.ab.m==='L2'&&rz.ab.g==='Zed','the row carries ab');
  assert.ok(!('ab' in C.whoRow100({id:'z',here:{}},m2,{ab:{m:'L9',g:'x'}})),'ab for a match that is not live is dropped');
  console.log('v1.0 who units: all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=C.SEASON_EPOCH+5*C.WEEK_MS+3600e3;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const mk=limits=>makeHandler({limits,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{}});const h=mk(false);let nc=0,mid=0;
  const raw=async(H,conn,t,d)=>{T+=10;const id=++mid;await H({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);return m.msg};
  const ask=async(conn,t,d,H)=>{const m=await raw(H||h,conn,t,d);if(!m.ok){const e=new Error(m.err);e.code=m.code;throw e}return m.d};
  async function client(name,tz){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});await cl.req('lanista.name',{name:'Lanista '+name});await cl.req('domus.create',{name:'Domus '+name});
    cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:'hero'});await cl.req('hello',{all:1,tz});return cl}
  const ann=await client('ann','Europe/Rome'),bob=await client('bob','America/New_York'),cat=await client('cat','Asia/Tokyo'),dan=await client('dan','Australia/Sydney'),eve=await client('eve','Europe/Paris');
  /* cat hides himself */
  await cat.req('acct.priv',{hide:true});
  const list=async(cl,d)=>(await cl.req('here.list',d||{}));
  let L0=await list(ann);const byId=Object.fromEntries(L0.rows.map(r=>[r.id,r]));
  assert.strictEqual(L0.rows[0].id,ann.acct,'my own row first');assert.strictEqual(L0.rows[0].me,1);
  assert.ok(!byId[cat.acct],'a hidden lanista is never listed');assert.ok(byId[bob.acct]&&byId[dan.acct]&&byId[eve.acct],'the others are');
  const b0=byId[bob.acct];assert.ok(b0.ln==='Lanista bob'&&b0.g==='Bob Gladius'&&b0.rk==='tiro'&&b0.dn==='Domus bob'&&b0.dom&&b0.dr==='tugurium'&&b0.rg==='na'&&b0.st==='idle','bob\'s row '+JSON.stringify(b0));
  assert.strictEqual(byId[dan.acct].rg,'oc');assert.ok(!/PROFILE|conn|GSI|wallet|treasury|follows|mutes/.test(JSON.stringify(L0)),'only the row fields');
  /* the tier comes from the account (dr100), not a house read */
  assert.strictEqual((await db.get('ACCT#'+bob.acct,'PROFILE')).dr100,'tugurium','hello stores the tier');
  /* the hidden lanista sees himself, marked */
  const Lc=await list(cat);assert.ok(Lc.rows[0].id===cat.acct&&Lc.rows[0].hid===1,'my row says I am hidden');
  /* status: a room, a live match, watching */
  const R=await bob.req('lobby.create',{ev:'democritus',cry:false});
  let SL=await dan.req('lobby.create',{ev:'cassian',cry:false});await eve.req('lobby.join',{id:SL.id});SL=await dan.req('lobby.start',{id:SL.id});assert.strictEqual(SL.status,'live');
  await ann.req('match.watch',{id:SL.id});
  L0=await list(ann);const st=Object.fromEntries(L0.rows.map(r=>[r.id,r]));
  assert.ok(st[bob.acct].st==='room'&&st[bob.acct].rm===R.id,'bob is in a room');assert.ok(st[dan.acct].st==='fight'&&st[dan.acct].m===SL.id&&st[eve.acct].st==='fight','dan and eve fight');
  assert.ok(st[ann.acct].st==='watch'&&st[ann.acct].m===SL.id,'ann watches');
  assert.deepStrictEqual(L0.rows.map(r=>r.st),[ 'watch','fight','fight','room'],'me first, then by status');
  /* filters */
  assert.deepStrictEqual((await list(bob,{status:'fight'})).rows.map(r=>r.id).sort(),[bob.acct,dan.acct,eve.acct].sort(),'status filter (+ me)');
  assert.deepStrictEqual((await list(bob,{region:'eu'})).rows.map(r=>r.id).sort(),[ann.acct,bob.acct,eve.acct].sort(),'region filter (+ me)');
  /* invite / follow marks for the asker */
  await ann.req('domus.follow',{id:(await db.get('ACCT#'+bob.acct,'PROFILE')).domus});await bob.req('acct.priv',{inv:'none'});
  const fb=(await list(ann)).rows.find(r=>r.id===bob.acct);assert.ok(fb.fo===1&&fb.ni===1,'following + takes no invitations '+JSON.stringify(fb));
  /* unwatch → idle */
  await ann.req('match.unwatch',{id:SL.id});assert.strictEqual((await list(ann)).rows[0].st,'idle','unwatched');
  /* PER GLADIATOR (his pick 3): eve abandons the Custom match (a CPU takes the seat) and opens a room with ANOTHER gladiator — her row says "in a room", a second
     mark names the one still fighting; dan, who stayed, is unmarked; once the match ends the mark goes */
  {const before=(await list(ann)).rows.find(r=>r.id===eve.acct);assert.ok(before.st==='fight'&&!before.ab,'before: fighting, no mark');
   const rd=await eve.req('match.abandon',{id:SL.id});assert.ok(rd.done&&!rd.out,'abandoned a Custom match');
   assert.ok((await db.get('ACCT#'+eve.acct,'PROFILE')).ab100.m===SL.id,'the abandoned-match flag is set');
   const r1=(await list(ann)).rows.find(r=>r.id===eve.acct);assert.ok(r1.st==='idle'&&r1.ab&&r1.ab.m===SL.id&&r1.ab.g==='Eve Gladius','abandoned: idle now, Eve Gladius still fighting '+JSON.stringify(r1));
   assert.ok(!(await list(ann)).rows.find(r=>r.id===dan.acct).ab,'the one who stayed has no mark');
   let opened=null;try{const R2=await eve.req('lobby.create',{ev:'egidious',cry:false});opened=R2.id||(R2.lobby&&R2.lobby.id)}catch(e){console.log('  open failed:',e.message)}
   if(opened){const r2=(await list(ann)).rows.find(r=>r.id===eve.acct);assert.ok(r2.st==='room'&&r2.rm===opened&&r2.ab&&r2.ab.m===SL.id,'in a room, while the abandoned match still has a mark '+JSON.stringify(r2));
     await eve.req('lobby.leave',{id:opened})}
   const mine=(await list(eve)).rows[0];assert.ok(mine.me===1&&mine.ab&&mine.ab.g==='Eve Gladius','my own row carries the mark too');
   /* a reclaim clears the abandoned mark on the match record → the mark goes */
   const M=await db.get('MATCH#'+SL.id,'META');await db.set('MATCH#'+SL.id,'META',{abandoned:{...M.abandoned,[eve.acct]:null}});
   await new Promise(r=>setTimeout(r,0));T+=C.WHO100.AB_TTL+1000;assert.ok(!(await list(ann)).rows.find(r=>r.id===eve.acct).ab,'reclaimed → no mark')}
  /* a lanista who goes offline drops out */
  await h({requestContext:{routeKey:'$disconnect',connectionId:eve.conn}});live.delete(eve.conn);assert.ok(!(await list(ann)).rows.some(r=>r.id===eve.acct),'gone offline → not listed');
  /* guests read it, without marks */
  const gc='g'+(++nc);live.add(gc);assert.strictEqual((await h({requestContext:{routeKey:'$connect',connectionId:gc},queryStringParameters:{guest:'guestwho100',ver:String(C.VER)}})).statusCode,200);
  await ask(gc,'auth.guest',{tz:'Asia/Tokyo'});const G=await ask(gc,'here.list',{});assert.ok(G.rows.length>=3&&G.rows.every(r=>!r.me&&!r.fo&&!r.ni),'a guest reads the list');
  assert.ok(!G.rows.some(r=>/^guest/.test(r.id)),'guests are never listed');
  /* the size cap + cursor with many lanistas */
  for(let i=0;i<230;i++){const id='dev-x'+i;await db.put('ACCT#'+id,'PROFILE',{id,lname:'L'+i,dname:'Domus '+i,domus:'dx'+i,dr100:'taberna',conn:'cx'+i,GSI1PK:'ON',GSI1SK:T,here:{glad:'G'.repeat(30),rank:'tiro',tz:'Europe/Rome'}})}
  const P1=await list(ann);assert.ok(P1.rows.length===C.WHO100.MAX&&P1.next&&P1.n>230&&JSON.stringify(P1).length<=C.WHO100.BYTES+200,'capped: '+P1.rows.length+' rows, '+JSON.stringify(P1).length+' B');
  const P2=await list(ann,{cursor:P1.next});assert.ok(P2.rows.length===P1.n-P1.rows.length&&!P2.next,'the next page');
  console.log('here.list sizes: '+P1.rows.length+' rows = '+JSON.stringify(P1).length+' B (page 1 of '+P1.n+')');
  /* the general rate limit applies */
  const hl=mk({burst:3,per:0.001});let refused=null;for(let i=0;i<6&&!refused;i++){try{await ask(ann.conn,'here.list',{},hl)}catch(e){refused=e}}assert.ok(refused&&refused.code==='rate_limit','rate-limited like every request');
  console.log('server v1.0 WHO\'S ONLINE (here.list, status, privacy, guests, filters, cursor, cap, rate limit): all checks passed')}

units();routes().catch(e=>{console.error(e);process.exit(1)});
