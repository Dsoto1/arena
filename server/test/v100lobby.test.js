/* v1.0 LOBBY ROOM: lobby.code (join by ROOM CODE R-XXXXX or by FID — the room that lanista is in), through lobby.join's rules
   (password, kicks, busy, Ranked rank), refusals (bad, none, own FID, hidden / no-invitations lanista, a started room), the FID quota,
   house.card's now.room + now.code, the new taunt codes. node server/test/v100lobby.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');

function units(){
  const a=C.roomCode100('L1'),b=C.roomCode100('L2');assert.ok(/^R-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{5}$/.test(a),'shape '+a);assert.notStrictEqual(a,b,'two rooms, two codes');
  assert.strictEqual(C.roomCode100('L1'),a,'the same id → the same code on every screen');
  assert.deepStrictEqual(C.codeParse100(' r-'+a.slice(2).toLowerCase()+' '),{room:a},'lower case + spaces');
  assert.deepStrictEqual(C.codeParse100('FID-ab3xyz'),{fid:'AB3XYZ'},'a FID');
  assert.deepStrictEqual(C.codeParse100('RABCDE'),{room:'R-ABCDE',fid:'RABCDE'},'a bare R word may be either');
  assert.strictEqual(C.codeParse100('hello world'),null);assert.strictEqual(C.codeParse100('R-0O1I0'),null,'look-alike letters are never in a code');assert.strictEqual(C.codeParse100(''),null);
  const list=[{id:'L1',status:'live',created:1},{id:'L1',status:'waiting',created:2},{id:'L2',status:'waiting',created:3}];
  assert.strictEqual(C.roomByCode100(list,a).created,2,'only waiting rooms');assert.strictEqual(C.roomByCode100(list,'R-22222'),null);
  for(const k of ['mlions','flwatch','damna','helmet','slaves','bucket','gate','betme'])assert.ok(C.phraseOK('room',k)&&C.QC_TEXT[k],'taunt '+k);
  console.log('v1.0 lobby units: all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=C.SEASON_EPOCH+5*C.WEEK_MS+3600e3;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const mk=limits=>makeHandler({limits,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{}});const h=mk(false);let nc=0,mid=0;
  const raw=async(H,conn,t,d)=>{T+=10;const id=++mid;await H({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);return m.msg};
  const ask=async(conn,t,d,H)=>{const m=await raw(H||h,conn,t,d);if(!m.ok){const e=new Error(m.err);e.code=m.code;e.extra=m.extra||m;throw e}return m.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'should be refused: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.ok(re.test(e.message),e.message);return e};
  async function client(name,tz){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.lan=(await cl.req('lanista.name',{name:'Lanista '+name})).lan;await cl.req('domus.create',{name:'Domus '+name});
    cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:'hero'});await cl.req('hello',{all:1,tz});return cl}
  const ann=await client('ann','Europe/Rome'),bob=await client('bob','America/New_York'),cat=await client('cat','Asia/Tokyo'),dan=await client('dan','Europe/Paris'),eve=await client('eve','Europe/Paris');
  const fids=await ann.req('lanista.names',{ids:[ann.acct,bob.acct,cat.acct,dan.acct,eve.acct]});for(const c of [ann,bob,cat,dan,eve])c.lan={fid:fids[c.acct].fid};
  assert.ok(/^FID-/.test(ann.lan.fid),'ann has a FID '+ann.lan.fid);
  const R=await ann.req('lobby.create',{ev:'democritus',cry:false});const code=C.roomCode100(R.id);
  /* refusals */
  await rejects(bob.req('lobby.code',{code:'nothing here'}),'code_bad');
  await rejects(bob.req('lobby.code',{code:'R-22222'}),'code_none');
  await rejects(ann.req('lobby.code',{code:ann.lan.fid}),'code_self');
  await rejects(bob.req('lobby.code',{code:cat.lan.fid}),'code_fid_none');
  /* by room code */
  const J=await bob.req('lobby.code',{code:code.toLowerCase()});assert.strictEqual(J.id,R.id,'joined by code');assert.ok(J.players.some(p=>p.id===bob.acct),'and sat down');
  const again=await bob.req('lobby.code',{code});assert.strictEqual(again.id,R.id,'already in it: the room comes back');
  /* by FID: the room that lanista is in */
  const J2=await cat.req('lobby.code',{code:ann.lan.fid.replace('FID-','fid ')});assert.strictEqual(J2.id,R.id,'joined by the host\'s FID');
  /* a hidden lanista / one who takes no invitations is not findable by FID */
  await ann.req('acct.priv',{hide:true});
  await rejects(dan.req('lobby.code',{code:ann.lan.fid}),'code_fid_none');await ann.req('acct.priv',{hide:false});
  await bob.req('acct.priv',{inv:'none'});await rejects(dan.req('lobby.code',{code:bob.lan.fid}),'code_fid_none');await bob.req('acct.priv',{inv:'all'});
  /* kicks still hold */
  await ann.req('lobby.kick',{id:R.id,who:cat.acct});
  await rejects(cat.req('lobby.code',{code}),null,/./);
  /* a password: asked, then accepted */
  const P=await dan.req('lobby.create',{ev:'cassian',pw:'Roma 77',cry:false});const pc=C.roomCode100(P.id);
  await rejects(eve.req('lobby.code',{code:pc}),'pw_need');await rejects(eve.req('lobby.code',{code:pc,pw:'nope'}),'pw_bad');
  const JP=await eve.req('lobby.code',{code:pc,pw:'Roma 77'});assert.strictEqual(JP.id,P.id,'with the password');
  /* house.card names the room + its code while the lanista waits in it */
  const dA=(await db.get('ACCT#'+ann.acct,'PROFILE')).domus;const hc=await dan.req('house.card',{id:dA});assert.ok(hc.now&&hc.now.st==='room'&&hc.now.room===R.id&&hc.now.code===code,'house card: '+JSON.stringify(hc.now));
  /* a started room: watch it, not join */
  const S=await ann.req('lobby.start',{id:R.id});assert.strictEqual(S.status,'live');const lv=await rejects(dan.req('lobby.code',{code}),'code_live');
  /* the FID quota caps guessing */
  const hl=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{}});let capped=null;
  for(let i=0;i<C.FIND_MAX89+3&&!capped;i++){try{await ask(eve.conn,'lobby.code',{code:'R-2222'+'23456789ABCDEFGHJKMNPQRSTUVWXYZ'[i%31]},hl)}catch(e){if(e.code!=='code_none')capped=e}}
  assert.ok(capped,'lookups are capped a minute');
  console.log('server v1.0 LOBBY ROOM (lobby.code by room code + FID, password, kicks, privacy, started rooms, house card, quota): all checks passed')}

units();routes().catch(e=>{console.error(e);process.exit(1)});
