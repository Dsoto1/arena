/* v1.11c THE CPU SPEED IS REMEMBERED (424-v111speed). Checks: (1) first run: an event starts on Slow; (2) Fast pressed on the arena bar →
   a second event starts on Fast (also across a reload); (3) the Settings CPU-speed switch is remembered too; (4) Pause (a real press or a
   window's automatic pause) is not remembered; (5) a lesson (S.tutorial) and an online-flagged start stay on Slow; (6) kill switch
   flavius_v111speedoff=1 → Slow again and nothing stored.
   node tools/tests/tv111sp.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n)};
const c=await b.newContext({viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());
await c.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});if(!localStorage.getItem('t111sp')){localStorage.setItem('t111sp','1');localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1')}});
const load=async()=>{const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}try{menuHide()}catch(e){}});return pg};
/* start an all-CPU event, return the speed it begins on (and the lit bar button) */
const begin=(pg,extra)=>pg.evaluate(async x=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent(Object.assign({ev:'democritus',loc:6,seed:77,seats:['soldier','hero'].map(c=>({cls:c,cpu:true})),opts:{spect:0}},x||{}));await W8(50);
  const on=document.querySelector('[data-speed].on');const r={speed:SPEED,on:on&&on.dataset.speed,onl:!!S.onl,tut:!!S.tutorial};S.over=true;return r},extra);
let pg=await load();
ok((await pg.evaluate(()=>localStorage.getItem('flavius_speed111')))===null,'first run: nothing stored');
let r=await begin(pg);ok(r.speed==='slow'&&r.on==='slow','first run: event starts on Slow');
await pg.evaluate(()=>document.querySelector('[data-speed="fast"]').click());
ok((await pg.evaluate(()=>localStorage.getItem('flavius_speed111')))==='fast','Fast pressed → stored');
r=await begin(pg);ok(r.speed==='fast'&&r.on==='fast','next event starts on Fast (bar lit)');
await pg.close();pg=await load();r=await begin(pg);ok(r.speed==='fast','after a reload the event starts on Fast');
/* Settings switch */
await pg.evaluate(async()=>{openSettings();await new Promise(r=>setTimeout(r,300));document.querySelector('[data-sspeed="normal"]').click();await new Promise(r=>setTimeout(r,100));try{CUR_MODAL&&CUR_MODAL.done(null)}catch(e){}});
ok((await pg.evaluate(()=>localStorage.getItem('flavius_speed111')))==='normal','Settings CPU speed Normal → stored');
r=await begin(pg);ok(r.speed==='normal','next event starts on Normal');
/* pause is not remembered */
await pg.evaluate(()=>document.querySelector('[data-speed="pause"]').click());
ok((await pg.evaluate(()=>localStorage.getItem('flavius_speed111')))==='normal','Pause pressed → not stored');
await pg.evaluate(()=>{SPEED='normal';setSpeedUI('pause')});
r=await begin(pg);ok(r.speed==='normal','event after a Pause starts on Normal, not paused');
/* exceptions */
r=await begin(pg,{tutorial:true});ok(r.speed==='slow','lesson-flagged start stays on Slow');
r=await begin(pg,{onl:{lobby:'x',fighters:2,stands:[],me:0}});ok(r.speed==='slow','online-flagged start stays on Slow');
await pg.close();
/* kill switch */
const c2=await b.newContext({viewport:{width:1440,height:900}});await c2.route(/fonts\./,r=>r.abort());
await c2.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_v111speedoff','1');localStorage.setItem('flavius_speed111','fast')});
const p2=await c2.newPage();p2.on('pageerror',e=>errs.push(e.message));await p2.goto(URL0);await p2.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
await p2.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}try{menuHide()}catch(e){}});
r=await begin(p2);ok(r.speed==='slow','kill switch: starts on Slow');
await p2.evaluate(()=>document.querySelector('[data-speed="normal"]').click());
ok((await p2.evaluate(()=>localStorage.getItem('flavius_speed111')))==='fast','kill switch: nothing written');
console.log('ERRS',JSON.stringify(errs));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
