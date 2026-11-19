/* v1.17a SAVES NEVER FAIL SILENTLY (435-v117asave, his F1 F2 F3 F5): an init script makes localStorage.setItem throw QuotaExceededError for flavius_* keys
   while window.__LSFAIL is set (a regexp source matched against the key). 1 F1: a failing Store.put -> Store.lastError + BUS 'saveFail' + exactly ONE banner
   (#save117a, Download a backup button) and the previous career data intact; 2 a deliberate no-op put (RPP) does not trigger it; 3 F2 loadSnapshot with a failing
   write: no deletes, no reload, one line, no banner; with working storage it restores and reloads; 4 F3 saveUpload's "is in your careers" toast is not shown on
   failure; 5 F5 snapshotAll with a failing list is refused, a healthy one is not; 6 F5 pagehide flushes a pending saveWorld debounce; 7 the kill switch
   flavius_v117asaveoff=1 = old behaviour (no banner, no lastError). */
const {chromium,url}=require('./_browser');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const miss=[],errs=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const open=async(ls)=>{const cx=await b.newContext({viewport:{width:1280,height:900}});const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(l=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown');for(const k in l)localStorage.setItem(k,l[k])}catch(e){}
    window.__LSFAIL=null;const si=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(window.__LSFAIL&&this===localStorage&&new RegExp(window.__LSFAIL).test(k)){const e=new Error('quota');e.name='QuotaExceededError';throw e}return si.apply(this,arguments)}},ls||{});
  await pg.goto(url('file://'+page),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});return pg};
const raw=(pg,k)=>pg.evaluate(k=>localStorage.getItem(k),k);
const R={};
/* 1 + 2 */
{const pg=await open();
  await pg.evaluate(async()=>{window.__ev=[];BUS.on('saveFail',d=>window.__ev.push(d.col));await Store.put('mgrCareers','c1',{name:'A',world:'{"x":1}'})});
  R.a=await pg.evaluate(async()=>{window.__LSFAIL='^flavius_';await Store.put('mgrCareers','c1',{name:'B'});const n1=document.querySelectorAll('#save117a').length;await Store.put('mgrCareers','c1',{name:'C'});
    return {n1,n2:document.querySelectorAll('#save117a').length,btn:!!document.querySelector('#save117a [data-s117dl]'),ev:window.__ev.slice(),le:!!(Store.lastError&&Store.lastError.col==='mgrCareers'),txt:(document.getElementById('save117a')||{}).textContent}});
  ok(R.a.n1===1&&R.a.n2===1&&R.a.btn,'1a exactly one banner with the backup button '+JSON.stringify(R.a));
  ok(R.a.ev.length===2&&R.a.le,'1b saveFail emitted per failure + Store.lastError '+JSON.stringify(R.a));
  await pg.evaluate(()=>{window.__LSFAIL=null});const old=JSON.parse(await raw(pg,'flavius_mgrCareers'));ok(old.length===1&&old[0].name==='A','1c previous career data intact '+JSON.stringify(old));
  await pg.close();
  const p2=await open();
  R.b=await p2.evaluate(async()=>{window.__ev=[];BUS.on('saveFail',d=>window.__ev.push(d.col));window.__LSFAIL='^flavius_';RPP.on=true;await Store.put('mgrCareers','c9',{name:'Z'});await Store.del('mgrCareers','c9');RPP.on=false;
    return {banner:document.querySelectorAll('#save117a').length,ev:window.__ev.length,le:!!Store.lastError}});
  ok(R.b.banner===0&&R.b.ev===0&&!R.b.le,'2 a deliberate no-op put/del is not a failure '+JSON.stringify(R.b));await p2.close()}
/* 3 */
{const pg=await open();
  await pg.evaluate(async()=>{window.__mark=1;await Store.put('mgrCareers','c1',{name:'A'});await Store.put('mgrCareers','c2',{name:'B'})});
  R.c=await pg.evaluate(async()=>{window.__LSFAIL='^flavius_mgrCareers$';const r=await loadSnapshot({game:'flavius-rule',cols:{mgrCareers:[{id:'n1',name:'N'}]},ls:{}});await new Promise(x=>setTimeout(x,900));
    return {r,mark:window.__mark===1,toast:(document.getElementById('mToast')||{}).textContent,banner:document.querySelectorAll('#save117a').length}});
  ok(R.c.r===false&&R.c.mark&&/stopped/.test(R.c.toast||'')&&R.c.banner===0,'3a a failing restore stops: no reload, one line, no banner '+JSON.stringify(R.c));
  await pg.evaluate(()=>{window.__LSFAIL=null});const l=JSON.parse(await raw(pg,'flavius_mgrCareers'));ok(l.length===2&&l.some(x=>x.id==='c1')&&l.some(x=>x.id==='c2'),'3b nothing deleted '+JSON.stringify(l.map(x=>x.id)));
  const nav=pg.waitForNavigation({timeout:8000}).then(()=>1,()=>0);await pg.evaluate(()=>{loadSnapshot({game:'flavius-rule',cols:{crowd:[{id:'n1',name:'N'}]},ls:{}})});
  ok(await nav,'3c a healthy restore reloads');await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.waitForFunction(()=>{try{return JSON.parse(localStorage.getItem('flavius_crowd')||'[]').some(x=>x.id==='n1')}catch(e){return false}},null,{timeout:10000}).catch(()=>{});const l2=JSON.parse(await raw(pg,'flavius_crowd')||'[]'),l3=JSON.parse(await raw(pg,'flavius_mgrCareers')||'[]');ok(l2.length===1&&l2[0].id==='n1'&&l3.length===0,'3d healthy restore wrote the new doc and deleted the old ones '+JSON.stringify(l2.map(x=>x.id)));await pg.close()}
/* 4 */
{const pg=await open();
  R.d=await pg.evaluate(async()=>{window.__LSFAIL='^flavius_';const w={id:'wup1',x:1,ver:GAME_VER};const f=new File([JSON.stringify({ludus:'Upl',world:JSON.stringify(w)})],'c.json');await saveUpload(f);
    return {toast:(document.getElementById('mToast')||{}).textContent||'',banner:document.querySelectorAll('#save117a').length}});
  ok(!/your careers/.test(R.d.toast)&&R.d.banner===1,'4 no "is in your careers" toast on failure, one banner '+JSON.stringify(R.d));await pg.close()}
/* 5 */
{const pg=await open();
  R.e=await pg.evaluate(async()=>{const l=Store.list;Store.list=async c=>{if(c==='hall')throw new Error('x');return l.call(Store,c)};let refused=false;try{await snapshotAll()}catch(e){refused=!!e.refused}Store.list=l;
    let good=false;try{const s=await snapshotAll();good=!!(s&&s.cols)}catch(e){}return {refused,good,toast:(document.getElementById('mToast')||{}).textContent}});
  ok(R.e.refused&&R.e.good&&/refused/.test(R.e.toast||''),'5 snapshotAll refuses on an unreadable collection, works when healthy '+JSON.stringify(R.e));await pg.close()}
/* 6 */
{const pg=await open();
  R.f=await pg.evaluate(async()=>{newWorld({type:'pre',key:MGR_PRE[0].key});const m=me();m.coin=12345;saveWorld();dispatchEvent(new Event('pagehide'));await new Promise(x=>setTimeout(x,60));
    const arr=JSON.parse(localStorage.getItem('flavius_mgrCareers')||'[]');const d=arr.find(x=>x.id===MGR.world.id);return {saved:!!d&&d.coin===12345}});
  ok(R.f.saved,'6 pagehide flushed the pending saveWorld '+JSON.stringify(R.f));await pg.close()}
/* 7 */
{const pg=await open({flavius_v117asaveoff:'1'});
  R.g=await pg.evaluate(async()=>{window.__LSFAIL='^flavius_';await Store.put('mgrCareers','c1',{name:'B'});return {banner:document.querySelectorAll('#save117a').length,le:!!Store.lastError}});
  ok(R.g.banner===0&&!R.g.le,'7 kill switch: no banner, no lastError '+JSON.stringify(R.g));await pg.close()}
console.log(JSON.stringify(R));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.log('FATAL',e.stack);process.exit(1)});
