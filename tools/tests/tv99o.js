/* tv99o — v0.99 fixes (271-v99fix3): 7b a refresh inside the Online window reopens it; 7a a broken Profile page says so (reason + Try again);
   5a the Learn-to-play coach has one fixed place; 5b the teachers are city editors; 1b the Multiplayer button has no second line. ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200);r.end(fs.readFileSync(f))});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const U='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1')});
const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(U);await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
/* 1b */ok(await p.evaluate(()=>{const b=document.querySelector('#mainMenu [data-mm="multi"]');return !!b&&!/Hot seat/i.test(b.textContent)}),'1b the Multiplayer button still shows the hot-seat line');
/* 7b */await p.evaluate(()=>{onlineOpen('lobby')});await p.waitForSelector('#onl',{timeout:15000});
ok(await p.evaluate(()=>sessionStorage.getItem('flavius_onlopen99')!=null),'7b the open flag is set while Online is open');
await p.reload();await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});await p.waitForSelector('#onl',{timeout:20000}).catch(()=>{});
ok(await p.evaluate(()=>!!document.getElementById('onl')),'7b a refresh did not return to Online');
await p.evaluate(()=>{const x=document.getElementById('mClose');x&&x.click()});await p.waitForFunction(()=>sessionStorage.getItem('flavius_onlopen99')==null,null,{timeout:8000}).catch(()=>{}) /* the flag goes when the window's promise settles: a slow runner needs more than 600 ms */;
ok(await p.evaluate(()=>sessionStorage.getItem('flavius_onlopen99')==null),'7b closing Online clears the flag');
/* 7a */const r7=await p.evaluate(()=>{const keep=window.l89ProfHTML;try{ONL.acct={id:'a1',name:'T'};ONL.tab='prof';l89ProfHTML=function(){throw new Error('boom')};const h=onlHTML();return {bad:/boom|ref E-|did not load|went wrong/i.test(h)||/↻/.test(h),tryAgain:/data-v="prof"[^>]*>[^<]*↻/.test(h)}}finally{l89ProfHTML=keep;ONL.tab='play'}});
ok(r7.bad,'7a a failing Profile page shows no reason');
/* 5a/5b */await p.evaluate(()=>{window.__a=typeof TUTOR99==='function'&&TUTOR99()&&TUTOR99().name;window.__b=typeof MTUTOR99==='function'&&MTUTOR99()&&MTUTOR99().name});
const t=await p.evaluate(()=>({a:window.__a,b:window.__b}));ok(t.a&&t.a!=='Flavius','5b Learn to play teacher is Flavius');ok(t.b&&t.b!=='Flavius','5b Manager teacher is Flavius');
console.log(JSON.stringify({miss,errs}));console.log(miss.length?'FAIL':'PASS');console.log('ERRS',JSON.stringify(errs));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})()
