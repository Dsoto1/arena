/* v0.97 240-v96pulse (mock, two windows): hosting a WAITING room pulses the Lobby Browser rail tab (.pu96) and gives my list row a static
   gold outline (.pu96row, no animation); a new lanista joining flashes the tab green (.pu96g), the new seat and name in the room screen,
   and toasts "<name> joined your room" when the room screen is not showing. ERRS []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P={};for(const n of ['A','B']){P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message))}
await P.A.goto(URL0,{timeout:90000});await P.A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over)/.test(k))localStorage.removeItem(k)});
await P.B.goto(URL0,{timeout:90000});for(const n of ['A','B'])await P[n].waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const {A,B}=P;const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});window.__toasts=[];const bt=mToast;mToast=function(h){window.__toasts.push(String(h));return bt.apply(this,arguments)}},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');
const until=async(p,fn,arg,ms=20000)=>{const t0=Date.now();let v;while(Date.now()-t0<ms){v=await p.evaluate(fn,arg).catch(()=>null);if(v)return v;await p.waitForTimeout(100)}return v};
for(const p of [A,B])p.evaluate(()=>{onlineOpen('play')}).catch(()=>{});for(const p of [A,B])await p.waitForSelector('#onl',{timeout:30000}).catch(()=>{});
const idB=await B.evaluate(()=>ONL.acct.id);
await A.click('#onl [data-onl="tab"][data-v="lobby"]');await A.waitForSelector('#onl [data-onl="mkroom"][data-v="0"]');await A.click('#onl [data-onl="mkroom"][data-v="0"]');
const rid=await until(A,()=>{const L=onlMyLobby();return L&&L.id});
/* hosting: pulse on the tab, static outline on the row */
out.tab=await until(A,()=>{const t=document.querySelector('#onl .onl-rail [data-v="lobby"]');return t&&t.classList.contains('pu96')});ok(out.tab,'rail tab pulses while I host');
out.anim=await A.evaluate(()=>getComputedStyle(document.querySelector('#onl .onl-rail [data-v="lobby"]')).animationName);ok(/pu96p/.test(out.anim),'tab animation '+out.anim);
await A.evaluate(()=>{ONL.tab='lobby';onlRedraw()});
out.row=await A.evaluate(id=>{const r=document.querySelector(`#onl tr[data-row="${id}"]`);return r?{cls:r.className,an:getComputedStyle(r.querySelector('td')).animationName}:null},rid);
ok(out.row&&/pu96row/.test(out.row.cls)&&!/pu96g/.test(out.row.cls)&&out.row.an==='none','row = static outline only '+JSON.stringify(out.row));
/* join while A looks at the lobby list (not the room screen): green tab + toast */
await B.evaluate(async id=>{await NET.req('lobby.join',{id})},rid);
out.flash=await until(A,()=>{const t=document.querySelector('#onl .onl-rail [data-v="lobby"]');return t&&t.classList.contains('pu96g')},null,8000);ok(out.flash,'tab flashes green on a join');
out.rowFlash=await A.evaluate(id=>{const r=document.querySelector(`#onl tr[data-row="${id}"]`);return !!r&&/pu96g/.test(r.className)},rid);ok(!out.rowFlash,'row does not flash');
out.toast=await until(A,()=>window.__toasts.some(t=>/Beta.*joined your room/.test(t)),null,5000);ok(out.toast,'toast names the joiner '+JSON.stringify(await A.evaluate(()=>window.__toasts)));
out.gone=await until(A,()=>{const t=document.querySelector('#onl .onl-rail [data-v="lobby"]');return t&&!t.classList.contains('pu96g')},null,4000);ok(out.gone,'flash ends');
/* second joiner seen from the room screen: seat + name flash, no toast */
await B.evaluate(async id=>{await NET.req('lobby.leave',{id})},rid);await A.waitForTimeout(6000);
await A.evaluate(()=>{ONL.tab='play';window.__toasts.length=0;onlRedraw()});await A.waitForSelector('#onlRoom80');
await B.evaluate(async id=>{await NET.req('lobby.join',{id})},rid);
out.seat=await until(A,id=>!!document.querySelector(`#onlRoom80 .r80-seat.pu96g [data-bub96="${id}"]`),idB,8000);ok(out.seat,'new member’s seat flashes in the room screen');
out.name=await A.evaluate(id=>!!document.querySelector(`#onlRoom80 [data-u96="${id}"].pu96g`),idB);ok(out.name,'new member’s name row flashes');
out.noToast=await A.evaluate(()=>!window.__toasts.some(t=>/joined your room/.test(t)));ok(out.noToast,'no toast while looking at the room');
/* host leaves: pulse gone */
/* host leaves with B still present: the pulse stops at once */
await A.evaluate(async id=>{await NET.req('lobby.leave',{id})},rid);
out.off0=await until(A,()=>{const t=document.querySelector('#onl .onl-rail [data-v="lobby"]');return t&&!t.classList.contains('pu96')},null,2000);ok(out.off0,'pulse stops at once when the host leaves with others present');
await B.evaluate(async id=>{await NET.req('lobby.leave',{id})},rid);await A.waitForTimeout(500);
out.off=await until(A,()=>{onlRedraw();const t=document.querySelector('#onl .onl-rail [data-v="lobby"]');return t&&!t.classList.contains('pu96')},null,8000);ok(out.off,'pulse stops when the room is gone');
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',errs);await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
