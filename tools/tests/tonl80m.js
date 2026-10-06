/* online v0.80 (Virgilante's asks): a Ranked match, B reloads → the main menu shows "⚔ Back to your match" + "🚪 Abandon"; the abandon
   popup shows the gladiator at stake (face + token, record, ratings, the gear brought, Damnatio); Stay keeps it; ⚔ Back to your match
   puts B on the sand again; B abandons from the arena bar (the popup also shows the bout so far) → dies by Damnatio, the record clears;
   A wins → the Online landing's showcases name the biggest winner (with CF) and the biggest loser (Damnatio).
   SHOT=<dir> saves screenshots (menu, popup, landing). */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{localStorage.removeItem('flavius_onlmock');localStorage.removeItem('flavius_onlmatch80')});await B.goto(URL0,{timeout:90000});for(const P of [A,B])await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
/* HAND-OFF: the mock world is ONE localStorage item that every window reads, changes and writes back; a window whose copy is still
   behind (cross-window storage lags under load) would undo the last window's write (a lost house, a lost room). Before a window acts
   after another one did, it waits (≤15 s) until it holds that window's copy. */
const HAND={last:null,on:true};const handOff=pages=>{for(const p of pages){const ev=p.evaluate.bind(p);p.__ev=ev;p.evaluate=async(...a)=>{const L=HAND.last;
  if(HAND.on&&L&&L!==p&&!L.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await L.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
    if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
  const r=await ev(...a);HAND.last=p;return r}}};
handOff([A,B]);
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');
/* Beta has a record, a purse and gear to lose */
await B.evaluate(async()=>{const w=mockLoad();const c=w.chars[ONL.char.id];Object.assign(c,{wins:3,bouts:5,survived:4,lifeCF:150,wallet:120,gear:['gladius','galea','wraps'],stats:{spd:61,str:58,int:55,lck:57,cha:60}});
  c.look={portrait:{skin:'#c68e5f',helm:'galea'},color:'#2255aa',token:{c1:'#2255aa',helm:'crested',shield:'scutum'}};mockSave(w);await onlRefresh()});
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:true}));
/* pv: poll a read until the state its check needs is there (3 tests at once stretch timers and storage sync); returns the last read */
const pv=async(p,fn,pred,arg,ms=30000)=>{const t0=Date.now();let v;for(;;){v=await p.evaluate(fn,arg).catch(()=>null);if((v!=null&&pred(v))||Date.now()-t0>ms)return v;await p.waitForTimeout(200)}};
/* the mock world is one localStorage item: a join can be lost to the other window's write — join until A sees two lanistas */
for(let k=0;k<8;k++){await B.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);if(await pv(A,id=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=2,x=>x,L.id,5000))break}
const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await B.evaluate(L=>onlEnter(L),L2);
const drive=async p=>p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const b=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(b)b.click();return}
  if(!S||S.over||!ONLM.on||!onlmMine()||S.busy)return;if(S.phase==='choice'){const c=document.querySelector('[data-act="coin"]');if(c)c.click();return}if(S.phase==='action'){const e=document.querySelector('[data-act="end"]');if(e)e.click()}}).catch(()=>{});
const run=async(ms,also)=>{const t0=Date.now();while(Date.now()-t0<ms){await drive(A);if(also)await drive(B);await A.waitForTimeout(250);if(await A.evaluate(()=>!S||S.over))break}};
await run(6000,true);
const rec0=await B.evaluate(()=>{const x=JSON.parse(localStorage.getItem('flavius_onlmatch80')||'null');return x&&{id:x.id,name:x.char&&x.char.name,gear:x.kit&&x.kit.gear}});
/* B reloads: the main menu offers the match back */
await B.reload({timeout:90000});await B.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const menu=await B.evaluate(()=>{const r=document.getElementById('mmLive80');const m=document.getElementById('mainMenu');return {menu:!!(m&&!m.hidden),row:!!r,txt:r?r.textContent.replace(/\s+/g,' ').trim():'',btns:r?[...r.querySelectorAll('button')].map(b=>b.textContent.trim()):[]}});
if(SHOT)await B.screenshot({path:path.join(SHOT,'m80_menu.png')});
/* 🚪 Abandon from the menu: the gladiator at stake; Stay keeps everything */
await B.click('#mmLive80 [data-mml80="abandon"]').catch(()=>{});
const pop=await pv(B,()=>{const p=document.querySelector('.ask76bg .stk80');const box=p&&p.closest('.verask');return box?{txt:box.textContent.replace(/\s+/g,' '),face:!!box.querySelector('.stk80-art .portrait'),tok:!!box.querySelector('.stk80-tok *'),stats:box.querySelectorAll('.stk80-st').length}:null},v=>v.face&&v.tok&&v.stats===5&&/Damnatio/.test(v.txt));
if(SHOT)await B.screenshot({path:path.join(SHOT,'m80_popup.png')});
await B.click('.ask76bg [data-ask76="0"]').catch(()=>{});const stayed=await pv(B,()=>!!localStorage.getItem('flavius_onlmatch80')&&!document.querySelector('.ask76bg'),x=>x);
/* ⚔ Back to your match */
await B.click('#mmLive80 [data-mml80="back"]').catch(()=>{});
const t1=Date.now();let back=null;while(Date.now()-t1<30000){await drive(A);await A.waitForTimeout(300);back=await B.evaluate(()=>({on:ONLM.on,me:ONLM.me,lobby:S&&S.onl&&S.onl.lobby}));if(back.on&&back.me===1)break}
await run(3000,true);
/* 🚪 from the arena bar: the popup shows the bout so far; Abandon → Damnatio */
await B.evaluate(()=>{if(CUR_MODAL&&ONLM.info>0)CUR_MODAL.done(null)});await B.evaluate(()=>{ONLM.uiAt=Date.now();const x=document.getElementById('btnOnlLeave');if(x)x.click()});
const pop2=await pv(B,()=>{const p=document.querySelector('.ask76bg .stk80');const box=p&&p.closest('.verask');return box?box.textContent.replace(/\s+/g,' '):''},v=>/On the sand now/.test(v));
await B.click('.ask76bg [data-ask76="1"]').catch(()=>{});
const gone=await pv(B,id=>{const w=mockLoad();const c=Object.values(w.chars).find(x=>x.name==='Beta the Bold');return {alive:c&&c.alive,rec:!!localStorage.getItem('flavius_onlmatch80'),left:!!(ONL.leftMatch||{})[id]}},v=>v.alive===false&&!v.rec&&v.left,L.id);
/* A wins with CF → Today in the arena */
await A.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);S.players[0].cf=34;setTimeout(()=>gameOver([S.players[0]],'The editor calls the bout.'),10)});await A.waitForTimeout(2500);
await A.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done('close')});
const recA=await pv(A,()=>!!localStorage.getItem('flavius_onlmatch80'),v=>v===false);
await A.evaluate(()=>{onlExit()});
const today=await pv(A,()=>{const t=document.getElementById('v85show') /* v0.85: the landing's showcases (146-v85land) */;if(t)t.scrollIntoView();return t?{txt:t.textContent.replace(/\s+/g,' '),faces:t.querySelectorAll('.portrait').length}:null},v=>/Alpha the Bold/.test(v.txt)&&/\d+\s*CF/.test(v.txt)&&/Beta the Bold/.test(v.txt)&&/Damnatio/.test(v.txt)&&v.faces>=2);
await A.waitForTimeout(400);if(SHOT)await A.screenshot({path:path.join(SHOT,'m80_today.png')});
console.log(JSON.stringify({rec0,menu,pop,stayed,back,pop2:pop2.slice(0,200),gone,recA,today}));
const miss=[];if(!rec0||rec0.name!=='Beta the Bold'||!(rec0.gear||[]).includes('gladius'))miss.push('live record on entering');
if(!menu.menu||!menu.row||!/Beta the Bold is still on the sand/.test(menu.txt)||menu.btns.length!==2)miss.push('main-menu row');
if(!pop||!pop.face||!pop.tok||pop.stats!==5||!/Damnatio/.test(pop.txt)||!/Gladius/i.test(pop.txt)||!/3 won/.test(pop.txt)||!/120/.test(pop.txt))miss.push('popup shows the gladiator at stake');
if(!stayed)miss.push('Stay keeps the match');if(!back||!back.on||back.me!==1)miss.push('Back to your match');
if(!/On the sand now/.test(pop2)||!/Damnatio/.test(pop2))miss.push('arena popup');if(gone.alive!==false||gone.rec||!gone.left)miss.push('abandon → Damnatio, record cleared');
if(recA)miss.push('record cleared at the end');
if(!today||!/Alpha the Bold/.test(today.txt)||!/\d+\s*CF/.test(today.txt)||!/Beta the Bold/.test(today.txt)||!/Damnatio/.test(today.txt)||today.faces<2)miss.push('Today in the arena');
console.log('MISS',miss);console.log('ERRS',errs);await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
