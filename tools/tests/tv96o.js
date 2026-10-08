/* v0.97 ONLINE DOMUS fixes (237-v96domus) through the MOCK server: (1) 🏆 Trophies sits under the treasury count at the banner's bottom right,
   (2) the 🧪 Tester panel is gone from the Domus and lives in 👤 Profile & settings (only for a tester), (3) the worn-armor chips: >5 → first 4 +
   "＋N more ▾", open in place, "▴ less", remembered in localStorage flavius_dm96arm, data-d89off / data-d89homew kept; ≤5 shows all. SHOT=<dir> saves dm96_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0,{timeout:90000});
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_(onl(mock|report|over|match|tester)|dm96)/.test(k))localStorage.removeItem(k)});await P.reload({timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const W=ms=>P.waitForTimeout(ms);
const shot=async n=>{if(!SHOT)return;await P.screenshot({path:path.join(SHOT,`dm96_${n}.png`)})};
const world=(fn,arg)=>P.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const idle=()=>P.waitForFunction(()=>!ONL.busy,null,{timeout:15000}).then(()=>W(250)).catch(()=>{});
const open=async t=>{await P.evaluate(async t=>{if(!document.getElementById('onl')){onlineOpen(t);for(let i=0;i<150&&!document.getElementById('onl');i++)await new Promise(r=>setTimeout(r,200))}ONL.tab=t;ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw()},t);await idle()};
const ids=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Vettius'});ONL.domus=(await NET.req('domus.create',{name:'Vettiib'})).domus;
  const a=await NET.req('char.create',{name:'Gamma',cls:'hero'});return {a:a.id,dom:ONL.domus.id}});
const ARM=['galea','lgreaves','lorica','ocrea','legwrapsU','balteus1','steelhelm','centurion','provmanica'];
await world((w,[a,dom,arm])=>{const ch=w.chars[a];ch.wallet=377;ch.gear=arm.slice();ch.equip=arm.slice();w.domus82[dom].treasury=2210;w.domus82[dom].trophies=[{k:'first:democritus',n:ONLC.trophyName('first:democritus'),at:Date.now(),glad:ch.name,x:1}]},[ids.a,ids.dom,ARM]);
await P.evaluate(async id=>{await NET.req('char.active',{char:id})},ids.a);await open('char');
const worn=()=>P.evaluate(()=>{const l=document.querySelector('#onl .wr89-l');return {chips:l?l.querySelectorAll('.wr89').length:0,more:l&&l.querySelector('[data-wr96]')?l.querySelector('[data-wr96]').textContent.trim():'',off:l?l.querySelectorAll('[data-d89off]').length:0,home:l?l.querySelectorAll('[data-d89homew]').length:0,ls:localStorage.getItem('flavius_dm96arm')}});
const n0=await P.evaluate(()=>ONLC.equipOf(ONL.chars.find(c=>c.active)||ONL.char).filter(it=>{const I=ONL83.piece(ONL.char,it);return I&&I.kind==='a'}).length);
await shot('before_or_after_closed');
/* 1 */
const L=await P.evaluate(()=>{const t=document.querySelector('#onl .db89 .tr89b'),r=document.querySelector('#onl .db89-tre');if(!t||!r)return null;const a=t.getBoundingClientRect(),c=r.getBoundingClientRect();return {below:a.top>=c.bottom-2,right:Math.abs(a.right-c.right)<6,inBan:!!t.closest('.db89'),tro:t.dataset.d89}});
ok(L&&L.below&&L.right&&L.inBan&&L.tro==='tro','Trophies directly under the treasury, right aligned '+JSON.stringify(L));
await P.click('#onl .db89 .tr89b');await W(300);ok(await P.evaluate(()=>!!document.querySelector('.tr89pop,.pop83')),'Trophies still opens');await P.evaluate(()=>document.querySelectorAll('.pop83').forEach(e=>e.remove()));
/* 3 */
let w=await worn();ok(w.chips===4&&/2 more|＋\d+ more/.test(w.more)&&w.off===4,'closed: 4 chips + more '+JSON.stringify(w));
await P.click('#onl .wr89-l [data-d89off]');await idle();
const n1=await P.evaluate(()=>ONLC.equipOf(ONL.char).filter(it=>{const I=ONL83.piece(ONL.char,it);return I&&I.kind==='a'}).length);w=await worn();
ok(n1===n0-1&&n1<=5&&w.chips===n1&&!w.more,'<=5 shows all, no toggle '+JSON.stringify([n1,w]));
/* 2 */
ok(await P.evaluate(()=>!document.querySelector('#onl .tst83')),'no Tester panel on the Domus (not a tester)');await open('prof');ok(await P.evaluate(()=>!document.querySelector('#onl .tst83')),'no Tester panel in the profile for a non-tester');
await P.evaluate(()=>localStorage.setItem('flavius_onltester83','1'));await open('char');ok(await P.evaluate(()=>!document.querySelector('#onl .tst83')),'tester: still none on the Domus');
await open('prof');ok(await P.evaluate(()=>!!document.querySelector('#onl .pr89 .tst83')),'tester: the panel is in Profile & settings');await shot('profile');
await P.evaluate(()=>localStorage.removeItem('flavius_onltester83'));
await P.evaluate(()=>localStorage.setItem('flavius_dm96arm','1'));await P.reload({timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});ok(await P.evaluate(()=>DM96.open===true),'open state read back after reload');
console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
