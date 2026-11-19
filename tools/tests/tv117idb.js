/* v1.17 FIGURE CACHE STORES ARRAYBUFFERS (434-v117idb): in an EPHEMERAL context (b.newContext = Safari Private Browsing on WebKit) 1 an100DBPut of a record
   holding Blobs (move / act / shadow sheets) then an100DBGet returns usable Blobs of the same size + type; 2 the stored shape is {ab,type} (no Blob inside); 3 an OLD
   Blob-shaped record written straight into the store still reads (where the engine stores Blobs: Chromium; WebKit private cannot, so it is skipped there);
   4 the kill switch flavius_v117idboff=1 restores 311's behaviour (Blobs stored; on WebKit-ephemeral the write is the old silent failure); 5 a forced failing put
   logs ONCE (console.warn + the error log, kind 'idb') and does not throw; 6 AN100.dbMax pruning still holds; no page errors.
   Runs on Chromium; with PW_BROWSER=webkit also on WebKit (tools/ci/webkit.txt). */
const {chromium,engine,url}=require('./_browser');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const miss=[],errs=[],warns=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const cx=await b.newContext({viewport:{width:1440,height:900}});const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='warning'&&/figure cache/.test(m.text()))warns.push(m.text())});
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto(url('file://'+page),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
const R={};
/* 1 + 2: a Blob record round-trips; the stored record holds ArrayBuffers */
R.a=await pg.evaluate(async()=>{const mk=(n,t)=>new Blob([new Uint8Array(n).fill(7)],{type:t});const m=mk(40,'image/webp'),a=mk(25,'image/png'),sh=mk(9,'image/webp');
  await an100DBPut({key:'tv117a',v:AN100L.VER,at:Date.now(),move:{b:m,m:{rows:{idle:[[0,1]]}},sh:{b:sh,m:{k:1}}},act:{b:a,m:{rows:{}},sh:null}});
  const r=await an100DBGet('tv117a');const raw=await new Promise(ok=>{const q=indexedDB.open('flavius_anim100',1);q.onsuccess=()=>{const g=q.result.transaction('sheets').objectStore('sheets').get('tv117a');g.onsuccess=()=>ok(g.result);g.onerror=()=>ok(null)}});
  const txt=r&&r.move&&r.move.b instanceof Blob?await r.move.b.arrayBuffer().then(x=>new Uint8Array(x).every(v=>v===7)):false;
  return {got:!!r,move:r&&r.move.b instanceof Blob&&r.move.b.size===40&&r.move.b.type==='image/webp',act:r&&r.act.b instanceof Blob&&r.act.b.size===25&&r.act.b.type==='image/png',
    sh:r&&r.move.sh.b instanceof Blob&&r.move.sh.b.size===9,meta:r&&r.move.m.rows.idle[0][1]===1,bytes:txt,
    rawAB:!!(raw&&raw.move.b&&raw.move.b.ab instanceof ArrayBuffer&&!(raw.move.b instanceof Blob)&&raw.act.b.type==='image/png'),callerBlob:m.size===40}});
ok(R.a.got&&R.a.move&&R.a.act&&R.a.sh&&R.a.meta&&R.a.bytes,'1 a record with Blobs round-trips as usable Blobs (size, type, bytes, meta) '+JSON.stringify(R.a));
ok(R.a.rawAB&&R.a.callerBlob,'2 the store holds {ab,type}, not a Blob; the caller\'s Blob is untouched '+JSON.stringify(R.a));
/* 3: an old Blob-shaped record still reads (the engine must be able to store it: Chromium; an ephemeral WebKit refuses Blobs, which is the bug) */
R.c=await pg.evaluate(async()=>{const blob=new Blob([new Uint8Array(5)],{type:'image/webp'});
  const w=await new Promise(ok=>{const q=indexedDB.open('flavius_anim100',1);q.onsuccess=()=>{try{const tx=q.result.transaction('sheets','readwrite');tx.objectStore('sheets').put({key:'tv117old',v:AN100L.VER,at:1,move:{b:blob,m:{}}});tx.oncomplete=()=>ok('ok');tx.onerror=()=>ok('err');tx.onabort=()=>ok('err')}catch(e){ok('err')}}});
  const r=await an100DBGet('tv117old');return {w,read:!!(r&&r.move.b instanceof Blob&&r.move.b.size===5)}});
if(R.c.w==='ok')ok(R.c.read,'3 an old Blob record still reads '+JSON.stringify(R.c));else console.log('NOTE 3 skipped: this engine refuses a Blob in an ephemeral store ('+engine+')');
/* 5: a put that cannot be stored (a function is not cloneable) does not throw and logs once */
const w0=warns.length;
R.f=await pg.evaluate(async()=>{const n0=ERR92.n;let threw=false;try{await an100DBPut({key:'tv117bad',v:AN100L.VER,at:Date.now(),move:{b:new Blob([new Uint8Array(3)]),f:function(){}}});await an100DBPut({key:'tv117bad2',v:AN100L.VER,at:Date.now(),f:function(){}})}catch(e){threw=true}
  const r=await an100DBGet('tv117bad');return {threw,none:r===null,logged:ERR92.list.slice(-Math.max(1,ERR92.n-n0)).filter(e=>e.kind==='idb').length}});
await pg.waitForTimeout(200);
ok(!R.f.threw&&R.f.none,'5a a failing put does not throw and stores nothing '+JSON.stringify(R.f));
ok(R.f.logged===1&&warns.length-w0===1,'5b …and is logged ONCE (error log kind idb + one console.warn) '+JSON.stringify(R.f)+' warns '+(warns.length-w0));
/* 6: pruning to AN100.dbMax */
R.p=await pg.evaluate(async()=>{const max=AN100.dbMax;for(let i=0;i<max+4;i++)await an100DBPut({key:'tv117p'+i,v:AN100L.VER,at:1000+i,move:{b:new Blob([new Uint8Array(2)],{type:'image/webp'}),m:{}}});
  const n=await new Promise(ok=>{const q=indexedDB.open('flavius_anim100',1);q.onsuccess=()=>{const g=q.result.transaction('sheets').objectStore('sheets').count();g.onsuccess=()=>ok(g.result)}});
  const last=await an100DBGet('tv117p'+(max+3)),first=await an100DBGet('tv117p0');return {max,n,last:!!last,first:!!first}});
ok(R.p.n<=R.p.max&&R.p.last&&!R.p.first,'6 the cache is pruned to AN100.dbMax, oldest first '+JSON.stringify(R.p));
/* 4: the kill switch = 311's behaviour exactly (a fresh page, so nothing is cached in module state) */
const pg2=await cx.newPage();pg2.on('pageerror',e=>errs.push(e.message));await pg2.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg2.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v117idboff','1')});
await pg2.goto(url('file://'+page),{timeout:180000});await pg2.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
R.k=await pg2.evaluate(async()=>{const blob=new Blob([new Uint8Array(6)],{type:'image/webp'});let threw=false;try{await an100DBPut({key:'tv117k',v:AN100L.VER,at:Date.now(),move:{b:blob,m:{}}})}catch(e){threw=true}
  const raw=await new Promise(ok=>{const q=indexedDB.open('flavius_anim100',1);q.onsuccess=()=>{const g=q.result.transaction('sheets').objectStore('sheets').get('tv117k');g.onsuccess=()=>ok(g.result);g.onerror=()=>ok(null)}});
  return {threw,raw:raw?(raw.move.b instanceof Blob?'blob':'other'):'none'}});
/* Chromium stores Blobs: the old way keeps a Blob. An ephemeral WebKit: the old silent failure (nothing stored). */
ok(!R.k.threw&&(engine==='webkit'?(R.k.raw==='none'||R.k.raw==='blob'):R.k.raw==='blob'),'4 kill switch: 311 writes Blobs exactly as before '+JSON.stringify(R.k)+' ('+engine+')');
console.log(engine,JSON.stringify(R));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.log('FAIL',e.message);console.log('MISS ["crash"]');console.log('ERRS []');process.exit(1)});
