/* v0.91 ONLINE ECONOMY II (197-v91econ + 111-onlcore v0.91) through the MOCK server: the result row's dmg from the lockstep state (pieces
   + location AP), a Ranked survivor's dented helm comes home 🩹 Damaged (mock settlement), the Domus shows "🩹 Damaged · repair N" with the
   🔨 button and the repair mends it, the 🔒 shows only on named pieces (printed refused), the auction shows six lots of the same size at
   1440×900 and 390 px. SHOT=<dir> saves v91e_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0);
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|acct)|^flavius_dombar89/.test(k))localStorage.removeItem(k);try{sessionStorage.clear()}catch(e){}});await P.reload();await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const W=ms=>P.waitForTimeout(ms);
const shot=async n=>{if(!SHOT)return;await P.screenshot({path:path.join(SHOT,`v91e_${n}.png`)})};
const world=(fn,arg)=>P.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const peek=(fn,arg)=>P.evaluate(([fn,arg])=>(0,eval)('('+fn+')')(mockLoad(),arg),[fn.toString(),arg]);
const idle=()=>P.waitForFunction(()=>!ONL.busy,null,{timeout:15000}).then(()=>W(250)).catch(()=>{});
const open=async()=>{await P.evaluate(async()=>{if(!document.getElementById('onl')){onlineOpen('char');await new Promise(r=>setTimeout(r,900))}ONL.tab='char';ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw()});
  await P.waitForFunction(()=>!!document.querySelector('#onl .sc89'),null,{timeout:15000}).catch(()=>{});await W(300)};

/* ── 1 · the row: printed armor brought and still worn, AP lost on its location (a pair: its worst leg); named / weapons left out ── */
const row=await P.evaluate(()=>{const p={pieces:{head:[{key:'galea',ap:2}],chest:[{key:'lorica',ap:3}],rarm:[],larm:[],rleg:[{key:'lgreaves',ap:2}],lleg:[{key:'lgreaves',ap:2}]},
    ap:{head:1,chest:3,rarm:0,larm:0,rleg:2,lleg:1},_kit83:{gear:['gladius','galea','lorica','lgreaves','na_x.1']}};return onl91Dmg(p)});
ok(JSON.stringify(row)===JSON.stringify([['galea',0.5],['lgreaves',0.5]]),'row.dmg from the pieces + AP: '+JSON.stringify(row));
ok(await P.evaluate(()=>JSON.stringify(ONLC.cleanRow({seat:0,dmg:[['galea',0.5]]}).dmg)==='[["galea",0.5]]'),'cleanRow keeps it');

/* a house: Alpha (Veteranus) wears a galea and a named helm-less kit; the treasury pays repairs */
const ids=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Vettius'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;
  const a=await NET.req('char.create',{name:'Alpha',cls:'hero'});return {a:a.id,dom:ONL.domus.id,acct:ONL.acct.id}});
const named=await world((w,[a,dom])=>{const ch=w.chars[a];ch.glory=600;ch.wallet=300;ch.gear=['galea','gladius'];ch.equip=['galea','gladius'];
  let x=11;const r=()=>(x=(x*9301+49297)%233280)/233280;let d=null;for(let i=0;i<400&&!d;i++){const t=ONLC.rollNamedArmor(r,onlCatalog(),'rare',[]);if(t&&t.slot==='chest')d=t}
  const NP=ONLC.namedPiece(d,ch);ONLC.putPiece(ch,NP,true);const D=w.domus82[dom];D.treasury=500;D.gear=['ocrea'];return NP.item},[ids.a,ids.dom]);
await P.evaluate(async id=>{await NET.req('char.active',{char:id})},ids.a);

/* ── 2 · a Ranked bout settles: the helm comes home damaged (the mock's settlement = the server's) ── */
const st=await world((w,[a,acct])=>{const ch=w.chars[a];const kit=ONLC.kitOf(ch);const gx=ONLC.gearAfter(ch,kit,ONLC.cleanRow({seat:0,survives:true,won:true,f:9,dmg:[['galea',0.5]]}),true);
  const it=ch.gear.find(g=>/^galea#/.test(g));return {dmg:gx.dmg,it,st:ONLC.pcOf(ch,it).st,worn:ch.equip.includes(it)}},[ids.a,ids.acct]);
ok(st.st==='damaged'&&st.worn&&st.dmg.length===1,'a Ranked survivor’s dented helm comes home damaged, still worn '+JSON.stringify(st));
const kits=await P.evaluate(async it=>{const R=await NET.req('lobby.create',{ev:'cassian',ranked:true,cry:false});const LR=R.lobby||R;const kr=LR.players[0].kit.items;await NET.req('lobby.leave',{id:LR.id});
  const C2=await NET.req('lobby.create',{ev:'cassian',cry:false});const LC=C2.lobby||C2;const kc=LC.players[0].kit.items;await NET.req('lobby.leave',{id:LC.id});return {r:!kr.includes(it),c:kc.includes(it)}},st.it);
ok(kits.r&&kits.c,'not in a Ranked kit, worn in Custom '+JSON.stringify(kits));

/* ── 3 · the Domus: the damaged mark + repair, the lock on named pieces only ── */
await open();
const dm=await P.evaluate(it=>{const o=document.getElementById('onl');const w=[...o.querySelectorAll('.sc89 .wr89')];const dw=w.find(x=>x.querySelector(`[data-d91rep="${it}"]`));
  return {rep:dw?dw.querySelector('[data-d91rep]').textContent:'',cls:!!(dw&&dw.classList.contains('dmg91')),locks:[...o.querySelectorAll('.sc89 [data-d89homew]')].map(x=>x.dataset.d89homew),
    tip:((o.querySelector('.sc89 [data-d89homew]')||{}).title||''),barLocks:o.querySelectorAll('.eb89 [data-d89home]').length,cost:ONLC.repairCost(ONL83.piece(ONL.char,it))}},st.it);
ok(dm.cls&&/🔨\s*\d+/.test(dm.rep)&&+dm.rep.replace(/\D/g,'')===dm.cost,'the worn helm shows 🩹 + 🔨 '+JSON.stringify(dm));
ok(dm.cost===await P.evaluate(()=>Math.ceil(ONLC.priceOf(onlCatalog().galea)/10)),'v1.0: repair = a tenth of the price');
ok(dm.locks.length===1&&dm.locks[0]===named,'the 🔒 only on the named piece '+JSON.stringify(dm.locks));ok(/safe from loss and loot, still worn in Custom/.test(dm.tip),'its one-line tip');
ok(dm.barLocks===0,'no 🔒 on the printed shelf piece');
const pr=await P.evaluate(async()=>{try{await NET.req('gear.home',{holder:ONL.char.id,item:'gladius',on:true});return 'ok'}catch(e){return e.code||e.message}});ok(pr==='home_named','a printed piece is refused: '+pr);
/* a damaged shelf tile */
await world((w,dom)=>{const D=w.domus82[dom];D.gear=['ocrea'];ONLC.damageItem91(D,'ocrea',0.25)},ids.dom);await open();
const tile=await P.evaluate(()=>{const t=[...document.querySelectorAll('#onl .eb89 .pt89')].find(x=>x.classList.contains('dmg91'));return t?{txt:(t.querySelector('.dm91')||{}).textContent||'',rep:!!t.querySelector('[data-d89rep]')}:null});
ok(tile&&/Damaged · repair \d+/.test(tile.txt)&&tile.rep,'the shelf tile: 🩹 Damaged · repair N + 🔨 '+JSON.stringify(tile));
await shot('domus');
const t0=await peek((w,dom)=>w.domus82[dom].treasury,ids.dom);
await P.click(`#onl .sc89 [data-d91rep="${st.it}"]`);await idle();await W(300);
const fx=await peek((w,[a,dom,it])=>({st:ONLC.pcOf(w.chars[a],it).st,t:w.domus82[dom].treasury,led:(ONLC.ledgerOf(w.domus82[dom])||{out:{}}).out.repair|0}),[ids.a,ids.dom,st.it]);
ok(fx.st==='whole'&&fx.t===t0-dm.cost&&fx.led===dm.cost,'🔨 mends it (the treasury pays, the ledger books it) '+JSON.stringify(fx));

/* ── 4 · the auction: six lots, every card the same size ── */
await world((w,a)=>{w.auc84={};w.aucwin84={};w.chest83=[];w.chars[a].wallet=20000},ids.a);
await P.evaluate(async()=>{ONL.tab='auction';ONL84.aucAt=0;ONL84.auc=null;onlRedraw()});await P.waitForFunction(()=>document.querySelectorAll('#onl .au84-grid .au84-lot').length>=6,null,{timeout:15000}).catch(()=>{});await W(500);
const au=async()=>P.evaluate(()=>{const L=[...document.querySelectorAll('#onl .au84-grid:not(.past) .au84-lot')];const hs=L.map(l=>Math.round(l.getBoundingClientRect().height)),ws=L.map(l=>Math.round(l.getBoundingClientRect().width));
  const arts=L.map(l=>{const a=l.querySelector('.nw83');return a?Math.round(a.getBoundingClientRect().height):0});const lots=(ONL84.auc&&ONL84.auc.lots)||[];
  return {n:L.length,hs,ws,arts,kinds:lots.map(x=>x.kind),rars:lots.map(x=>x.rar),over:document.documentElement.scrollWidth>window.innerWidth+1}});
let A1=await au();
ok(A1.n===6,'six lots: '+A1.n);ok(new Set(A1.hs).size===1&&new Set(A1.ws).size===1,'every card the same size '+JSON.stringify([A1.hs,A1.ws]));ok(new Set(A1.arts).size===1,'the art the same size '+JSON.stringify(A1.arts));
ok(A1.kinds.filter(k=>k==='a').length>=2&&A1.kinds.filter(k=>k==='w').length>=2&&A1.rars.some(r=>r==='legendary'||r==='epic'),'the guarantees '+JSON.stringify([A1.kinds,A1.rars]));
await P.evaluate(()=>{const g=document.querySelector('#onl .au84-grid');if(g)g.scrollIntoView({block:'start'})});await W(300);await shot('auction_1440');
await P.setViewportSize({width:390,height:844});await P.evaluate(()=>onlRedraw());await W(600);
A1=await au();ok(A1.n===6,'390 px: six lots (v0.97 card: art on top, height follows the bonuses)');ok(!A1.over,'390 px: no sideways scroll');
await P.evaluate(()=>{const g=document.querySelector('#onl .au84-grid');if(g)g.scrollIntoView({block:'start'})});await W(300);await shot('auction_390');

console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
