/* v1.0 INSIGNIA (the "v1.0 INSIGNIA" section of 111-onlcore): the online Domus look grows to the full house design minus sculpt (his 4a).
   cleanLook89 keeps c1/c2/crest as before and the optional c3, pat, ins, trim, wear, top; drops layers/baked and anything unknown;
   the inscription is cut as the Romans did and word-filtered; old looks pass unchanged; domus.look on the real handler stores it.
   node server/test/v100ins.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const C=require('../src/onlcore.js');

/* ── 1. the shared rules ── */
{const old={c1:'#7A2230',c2:'#d6ab4c',crest:'boar'};assert.deepStrictEqual(C.cleanLook89(old),{c1:'#7a2230',c2:'#d6ab4c',crest:'boar'},'an old look passes unchanged (colours lower-cased as before)');
  assert.throws(()=>C.cleanLook89(null),/Pick the colours and the crest/);assert.throws(()=>C.cleanLook89({c1:'red',c2:'#d6ab4c',crest:'boar'}),/Pick two colours/);
  assert.throws(()=>C.cleanLook89({c1:'#7a2230',c2:'#d6ab4c',crest:'dragon'}),/printed crests/);
  for(const k of ['bull','gladii','spqr','sym:eagle','sym:hut','medusa'])assert.strictEqual(C.cleanLook89({c1:'#7a2230',c2:'#d6ab4c',crest:k}).crest,k,'the Insignia emblems are crests now: '+k);
  const L=C.cleanLook89({c1:'#5b1a45',c2:'#e2b64a',crest:'bull',c3:'#B5832E',pat:'meander',ins:'domus juliae!!',trim:{gilt:false,tassels:true,fringe:'yes',fc:'creta',evil:'<x>'},wear:0.355,top:'manus',
    layers:[{t:'circle'}],baked:[{t:'star'}],name:'<script>'});
  assert.deepStrictEqual(L,{c1:'#5b1a45',c2:'#e2b64a',crest:'bull',c3:'#b5832e',pat:'meander',ins:'DOMVS IVLIAE',trim:{gilt:false,tassels:true,fc:'creta'},wear:0.36,top:'manus'},'the new fields kept, cleaned; sculpt + unknowns dropped');
  const D=C.cleanLook89({c1:'#5b1a45',c2:'#e2b64a',crest:'bull',pat:'plain',top:'emb',wear:0,ins:'',c3:'nope',trim:[1,2]});assert.deepStrictEqual(D,{c1:'#5b1a45',c2:'#e2b64a',crest:'bull'},'defaults are not stored');
  assert.strictEqual(C.cleanLook89({c1:'#5b1a45',c2:'#e2b64a',crest:'bull',pat:'tartan',top:'dragon',wear:9}).wear,1,'wear clamps to 1');
  assert.ok(!('pat' in C.cleanLook89({c1:'#5b1a45',c2:'#e2b64a',crest:'bull',pat:'tartan'})),'an unknown pattern is dropped');
  assert.strictEqual(C.insClean100('  s·p·q·r  '),'S·P·Q·R');assert.strictEqual(C.insClean100('abcdefghijklmnopq').length,C.INS_MAX100);
  /* the word filter: a name the server refuses is never painted on a house's cloth */
  let rude='';for(const w of ['merda','cunnus','fututor','asshole','fuck'])if(C.nameBad(w)){rude=w;break}
  if(rude)assert.ok(!('ins' in C.cleanLook89({c1:'#5b1a45',c2:'#e2b64a',crest:'bull',ins:rude})),'a rude inscription is dropped');
  assert.strictEqual(C.cleanLook100,C.cleanLook89,'one function')}

/* ── 2. the real handler stores it (domus.look → hello) ── */
(async()=>{const store=require('../src/store.js');const {makeHandler}=require('../src/index.js');
  let T=Date.UTC(2026,9,12,12);const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});let nc=0,rid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const conn='w'+(++nc);live.add(conn);const r0=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:'vale',ver:String(C.VER)}});assert.strictEqual(r0.statusCode,200);
  await ask(conn,'auth.signin',{name:'VALE Account'});await ask(conn,'domus.create',{name:'Domus Valeria'});
  const lk=await ask(conn,'domus.look',{c1:'#5b1a45',c2:'#e2b64a',crest:'gladii',pat:'clavi',ins:'valeria',trim:{tassels:true},wear:0.2,top:'palma',c3:'#b5832e',layers:[{t:'x'}],baked:[{t:'y'}]});
  assert.deepStrictEqual(lk.domus.look89,{c1:'#5b1a45',c2:'#e2b64a',crest:'gladii',c3:'#b5832e',pat:'clavi',ins:'VALERIA',trim:{tassels:true},wear:0.2,top:'palma'},'domus.look keeps the design, never the sculpt layers');
  assert.strictEqual((await ask(conn,'hello',{all:1})).domus.look89.pat,'clavi','hello carries it');
  let e=null;try{await ask(conn,'domus.look',{c1:'#5b1a45',c2:'#e2b64a',crest:'unicorn'})}catch(x){e=x}assert.ok(e&&/printed crests/.test(e.message),'an unknown crest is still refused');
  console.log('server v1.0 insignia (the full Domus design minus sculpt: rules + domus.look + hello) OK')})().catch(e=>{console.error(e);process.exit(1)});
