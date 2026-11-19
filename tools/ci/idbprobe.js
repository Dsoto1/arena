/* IndexedDB probe (2026-11-19, tv100an 10/12c fail on webkit.yml over file:// AND http, runs 44536060087 / 44543221342): can WebKit store a
   plain object and a Blob in IndexedDB, in a throwaway context (b.newContext = an ephemeral session, like Private Browsing) vs a persistent
   profile (launchPersistentContext = a normal Safari window)? 311 an100DBPut ends on tx.onerror silently, so this prints the real errors.
   Run on GitHub: webkit.yml dispatch, tests = "../ci/idbprobe". Prints the table and exits 1 on purpose (the job then shows the lines). */
const {chromium,engine}=require('../tests/_browser');const path=require('path'),os=require('os'),fs=require('fs');
const page=path.resolve(process.argv[2]||'flavius-arena.html');
const probe=()=>new Promise(done=>{const out={};const r=indexedDB.open('idbprobe',1);
  r.onupgradeneeded=()=>r.result.createObjectStore('s',{keyPath:'key'});r.onerror=()=>done({open:String(r.error)});
  r.onsuccess=async()=>{const db=r.result;
    const put=(rec)=>new Promise(ok=>{let tx;try{tx=db.transaction('s','readwrite');const q=tx.objectStore('s').put(rec);q.onerror=()=>ok('put error: '+(q.error&&q.error.name+': '+q.error.message))}catch(e){return ok('throw: '+e.name+': '+e.message)}
      tx.oncomplete=()=>ok('ok');tx.onerror=()=>ok('tx error: '+(tx.error&&tx.error.name+': '+tx.error.message));tx.onabort=()=>ok('tx abort: '+(tx.error&&tx.error.name+': '+tx.error.message))});
    const get=(key)=>new Promise(ok=>{try{const q=db.transaction('s').objectStore('s').get(key);q.onsuccess=()=>ok(q.result);q.onerror=()=>ok(null)}catch(e){ok(null)}});
    out.object=await put({key:'o',v:1});const go=await get('o');out.objectBack=!!(go&&go.v===1);
    out.blob=await put({key:'b',b:new Blob([new Uint8Array([1,2,3])],{type:'image/webp'})});const gb=await get('b');out.blobBack=!!(gb&&gb.b&&gb.b.size===3);
    out.buffer=await put({key:'a',a:new Uint8Array([1,2,3]).buffer});const ga=await get('a');out.bufferBack=!!(ga&&ga.a&&ga.a.byteLength===3);
    db.close();done(out)}});
(async()=>{const rows=[];
  const b=await chromium.launch();const cx=await b.newContext();const p1=await cx.newPage();await p1.goto('file://'+page,{waitUntil:'domcontentloaded',timeout:180000});
  rows.push(['ephemeral context (b.newContext)',await p1.evaluate(probe)]);await b.close();
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'idbprobe-'));const pc=await chromium.launchPersistentContext(dir,{});const p2=pc.pages()[0]||await pc.newPage();
  await p2.goto('file://'+page,{waitUntil:'domcontentloaded',timeout:180000});rows.push(['persistent profile (launchPersistentContext)',await p2.evaluate(probe)]);await pc.close();
  for(const [k,v] of rows)console.log('IDBPROBE '+engine+' · '+k+': '+JSON.stringify(v));
  console.log('MISS ["probe: exits 1 on purpose"]');console.log('ERRS []');process.exit(1)})().catch(e=>{console.log('IDBPROBE error '+e.message);process.exit(1)});
