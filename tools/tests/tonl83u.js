/* online v0.83, the CLIENT SCREENS through the MOCK (three windows): the rank bar's 8 ranks, a named piece locked for a Tiro (Storeroom +
   My Gladiators), the treasury on the Domus, the market board (offerings row, weapons | armor) + the Used tab, a broken piece's 🔧 Repair,
   the loot popup (pick), the purple gift chest + its count + the reveal (a Legendary named weapon), the start countdown + ✕ Hold, the trophy
   shelf, a profile + ★ Follow + the share hash (#domus=…), the Wagers tab, gifts that outlive a gladiator (his call: they belong to the house),
   and the tester grants (refused for others, a TEST house: Custom only, out of the rank counts and Today).
   SHOT=<dir> saves screenshots u83_*.png at 1300 px and 390 px. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const pg=async n=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0,{timeout:90000});return p};
const A=await pg('A');await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester)/.test(k))localStorage.removeItem(k)});await A.reload({timeout:90000});
const B=await pg('B'),C=await pg('C');for(const P of [A,B,C])await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
/* HAND-OFF: the mock world is ONE localStorage item that every window reads, changes and writes back; a window whose copy is still
   behind (cross-window storage lags under load) would undo the last window's write (a lost house, a lost room). Before a window acts
   after another one did, it waits (≤15 s) until it holds that window's copy. */
const HAND={last:null,on:true};const handOff=pages=>{for(const p of pages){const ev=p.evaluate.bind(p);p.__ev=ev;p.evaluate=async(...a)=>{const L=HAND.last;
  if(HAND.on&&L&&L!==p&&!L.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await L.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
    if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
  const r=await ev(...a);HAND.last=p;return r}}};
handOff([A,B,C]);
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const shot=async(p,n,w)=>{if(!SHOT)return;for(const vw of w===390?[390]:[1300,390]){await p.setViewportSize({width:vw,height:vw===390?844:900});await p.waitForTimeout(350);await p.screenshot({path:path.join(SHOT,`u83_${n}_${vw}.png`)})}await p.setViewportSize({width:1300,height:900});await p.waitForTimeout(200)};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});ONL.domus=(await NET.req('domus.create',{name:name})).domus;
  ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});return {ch:ONL.char.id,dom:ONL.domus.id}},[name,cls]);
const sa=await setup(A,'Vettii','hero'),sb=await setup(B,'Aemilii','soldier'),sc=await setup(C,'Fabii','slave');
const world=(p,fn,arg)=>p.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
/* every read below polls until the state its check needs is on screen (the regression runs 3 tests at once: timers and storage sync stretch);
   pv(p,fn,pred,arg) returns the last read, so the check itself is unchanged */
const pv=async(p,fn,pred,arg,ms=30000)=>{const t0=Date.now();let v;for(;;){v=await p.evaluate(fn,arg).catch(()=>null);if((v!=null&&pred(v))||Date.now()-t0>ms)return v;await p.waitForTimeout(200)}};
const open=async(p,tab)=>{await p.evaluate(async t=>{if(!document.getElementById('onl')){onlineOpen(t);for(let i=0;i<150&&!document.getElementById('onl');i++)await new Promise(r=>setTimeout(r,200))}ONL.tab=t;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw()},tab);await p.waitForTimeout(500)};
const redraw=async p=>{await p.evaluate(async()=>{await onlRefresh();ONL82.dgAt=0;await NET.req('domus.get',{});onlRedraw()});await p.waitForTimeout(300)};

/* ── house state for Alpha (Vettii): treasury, trophies, a named piece (Tiro → locked), a broken helm, 2 house gifts ── */
await world(A,(w,[cid,did])=>{const ch=w.chars[cid];ch.wallet=900;const D=w.domus82[did];D.treasury=321;
  D.trophies=[{k:'first:democritus',n:ONLC.trophyName('first:democritus'),at:Date.now()-864e5*3,glad:ch.name,x:1},{k:'rank:novicius',n:ONLC.trophyName('rank:novicius'),at:Date.now()-864e5,glad:ch.name,x:1},{k:'slew:tholo',n:ONLC.trophyName('slew:tholo'),at:Date.now(),glad:ch.name,x:1},{k:'vday',n:ONLC.trophyName('vday'),at:Date.now(),glad:ch.name,x:2}];
  let s=7;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};const def=ONLC.rollNamed(rnd,onlCatalog(),'epic',[]);ONLC.putPiece(ch,ONLC.namedPiece(def,ch),false);
  ONLC.putPiece(ch,{item:'galea',pc:null},true);ONLC.breakItem(ch,'galea');D.gifts=[{id:'hg1',why:'rank:novicius',at:Date.now(),glad:ch.name},{id:'hg2',why:'surv:5',at:Date.now(),glad:ch.name}]},[sa.ch,sa.dom]);

/* ── 1 + 3 + 10 · the Domus: 8 ranks with living counts, treasury, trophies, gifts chest ── */
await open(A,'char');
const dm=await pv(A,()=>({bands:document.querySelectorAll('#onl .rb83 .rb82-band').length,living:[...document.querySelectorAll('#onl .rb83 .rb82-n')].every(x=>/living/.test(x.textContent)),top:(document.querySelector('#onl .rb83 .rb82-band b')||{}).textContent||'',
  tre:(document.querySelector('#onl .db89-tre')||document.querySelector('#onl .tre83')||{}).textContent||'',gift:(document.querySelector('#onl .gift83.dom.on .gift83n')||{}).textContent||''}),v=>v.bands===8&&v.living&&/Invictus/.test(v.top)&&/1221/.test(v.tre)&&v.gift==='2');
/* v0.89 (175): the trophies open from 🏆 at the top of the Domus */
await A.click('#onl [data-d89="tro"]');dm.tro=await pv(A,()=>document.querySelectorAll('.tr89pop .tr83-t').length,n=>n===4);await A.evaluate(()=>{const p=document.querySelector('.tr89pop');if(p)p.remove()});
ok(dm.bands===8&&dm.living&&/Invictus/.test(dm.top),'rank bar: 8 ranks, Invictus on top, living counts ('+JSON.stringify(dm)+')');ok(/1221/.test(dm.tre),'the treasury on the Domus record (v0.92: 321 + the 900 purse moved in)');ok(dm.tro===4,'the trophy shelf');ok(dm.gift==='2','the gift chest glows with its count');
/* ── 2 · gear levels: the named piece is locked for a Tiro; 5 · the broken helm has 🔧 Repair ── */
/* v0.89 (175): the equipment bar — the named piece dimmed with the reason, the broken helm cracked with 🔨 + its price (one click: the treasury pays) */
const gl=await A.evaluate(()=>{const nw=document.querySelector('#onl .eb89 .pt89.nm89');const brk=document.querySelector('#onl .eb89 .pt89.brk89');
  return {nw:!!nw,lock:!!nw&&nw.classList.contains('no89')&&/Veteranus/.test(nw.textContent),rep:brk?(brk.querySelector('[data-d89rep]')||{}).textContent||'':'',brk:!!brk}});
ok(gl.nw&&gl.lock,'a named piece: dimmed, waits until Veteranus '+JSON.stringify(gl));ok(gl.brk&&new RegExp('🔨 '+await A.evaluate(()=>ONLC.repairCost(ONLC.pieceInfo({item:'galea'},onlCatalog())))).test(gl.rep),'broken helm: 🔨 + cost ('+gl.rep+')');
await A.evaluate(()=>{const s=document.querySelector('#onl .eb89');if(s)s.scrollIntoView()});await shot(A,'domus_store');await A.evaluate(()=>{document.querySelector('#mBody')&&(document.querySelector('#mBody').scrollTop=0)});await shot(A,'domus');
await A.click('#onl .eb89 .pt89.brk89 [data-d89rep]');await A.waitForFunction(()=>!ONL.busy,null,{timeout:30000}).catch(()=>{});
const rp=await pv(A,()=>({brk:ONLC.isBroken(ONL.char,ONL.char.gear.find(g=>/^galea/.test(g))),t:ONL.domus.treasury}),v=>!v.brk&&v.t===1221-10);ok(!rp.brk&&rp.t===1221-10,'repaired from the treasury ('+JSON.stringify(rp)+')');
/* ── 7 · the gift reveal: a Legendary named weapon ── */
await A.evaluate(()=>{window._r=Math.random;Math.random=()=>0.995});await A.click('#onl .gift83.dom');await pv(A,()=>!!document.querySelector('.gift83pop .pz83'),x=>x);await A.waitForTimeout(300);await A.evaluate(()=>{Math.random=window._r});
const gf=await pv(A,()=>({nw:!!document.querySelector('.gift83pop .pz83.named .nw83.r-legendary'),uq:(document.querySelector('.gift83pop .nw83-uq')||{}).textContent||'',val:(document.querySelector('.gift83pop .nw83-val')||{}).textContent||'',next:!!document.querySelector('.gift83pop [data-g83="next"]')}),v=>v.nw&&v.uq.length>10&&/12000/.test(v.val)&&v.next);
ok(gf.nw&&gf.uq.length>10&&/12000/.test(gf.val)&&gf.next,'the reveal: a Legendary named card, unique effect, value 12000, the next gift ('+JSON.stringify(gf)+')');await shot(A,'gift');
await A.click('.gift83pop [data-g83="x"]');await A.waitForTimeout(400);
/* ── 4 · the market board: offerings row above weapons | armor; buy an offering; the Used tab ── */
await world(A,w=>{w.market83=[{id:'U#0000000000001#a',item:'cassis#x.1',pc:{st:'broken',hist:[{house:'Aemilii',glad:'Old Marcus',when:Date.now()-864e5,how:'fell'}]},base:'cassis',n:'Cassis',kind:'a',lv:2,st:'broken',price:Math.round(ONLC.priceOf(onlCatalog().cassis)*2/3),at:Date.now(),from:{house:'Aemilii',glad:'Old Marcus'}}]});
await A.evaluate(()=>{ONL.tab='armory';ONL83U.mkt='board';onlRedraw()});
const mb=await pv(A,()=>({of:document.querySelectorAll('#onl .mb83-offs .mb83-of').length,w:document.querySelectorAll('#onl .mb83-half.w .mk92t').length,a:document.querySelectorAll('#onl .mb83-half.a .mk92t').length,rows:document.querySelectorAll('#onl .mb83-half .mb83-row').length,kits:document.querySelectorAll('#onl details.kt92').length,ktab:!!document.querySelector('#onl .mk83seg [data-v="kits"]'),def:[...document.querySelectorAll('#onl .mk92t.on')].map(x=>x.dataset.mk92).join(),above:(()=>{const o=document.querySelector('#onl .mb83-offs'),h=document.querySelector('#onl .mb83-halves');return !!o&&!!h&&o.getBoundingClientRect().bottom<=h.getBoundingClientRect().top+1})()}),v=>v.of===8&&v.w===3&&v.a===3&&v.above);
ok(mb.of===8&&mb.w===3&&mb.a===3&&mb.rows===2&&mb.def==='w|1,a|1'&&mb.kits===0&&mb.ktab&&mb.above,'the market board: 8 offerings above weapons | armor, level tabs I–III with Level I open on each side, kits in their own tab (v0.92) ('+JSON.stringify(mb)+')');await shot(A,'market');
await A.click('#onl .mb83-of[data-v="elix2"]');await A.waitForTimeout(300);await A.click('.ask76bg .btn.primary');await A.waitForFunction(()=>(ONL.char.offers||[]).includes('elix2'),null,{timeout:30000}).catch(()=>{});
ok(await A.evaluate(()=>(ONL.char.offers||[]).includes('elix2')),'an offering bought into the satchel');
await A.click('#onl [data-onl83="mkt"][data-v="used"]');
const us=await pv(A,()=>({n:document.querySelectorAll('#onl .us83-it').length,brk:!!document.querySelector('#onl .us83-it.brk83 .brk83t'),hist:/Old Marcus/.test((document.querySelector('#onl .us83-it')||{}).textContent||'')}),v=>v.n===1&&v.brk&&v.hist);
ok(us.n===1&&us.brk&&us.hist,'the Used tab: a broken piece at ⅔ with its history '+JSON.stringify(us));await shot(A,'used');
/* ── 6 · the loot popup: pick one ── */
await world(A,(w,[kc])=>{const k=w.chars[kc];w.loot83=w.loot83||{};const X={match:'Lfake',seat:2,dead:{acct:'x',char:'cx',name:'Gaius the Doomed',cls:'soldier',domus:'Fabii'},killer:{acct:k.owner,char:kc,seat:0},until:Date.now()+90000,done:false,
  pieces:[{item:'pectorale#d.1',pc:{st:'whole',hist:[]},n:'Pectorale',kind:'a',lv:1,st:'whole',rar:null,val:ONLC.priceOf(onlCatalog().pectorale)},{item:'axe#d.2',pc:{st:'whole',hist:[]},n:'Axe',kind:'w',lv:2,st:'whole',rar:null,val:ONLC.priceOf(onlCatalog().axe)}]};
  w.loot83['Lfake#2']=X},[sa.ch]);await A.evaluate(async()=>{await NET.req('hello',{all:1})});
const lp=await pv(A,()=>({pop:!!document.querySelector('.loot83pop'),n:document.querySelectorAll('.loot83pop .loot83-it').length,cd:+((document.getElementById('loot83s')||{}).textContent||0)}),v=>v.pop&&v.n===2&&v.cd>80);
ok(lp.pop&&lp.n===2&&lp.cd>80,'the loot popup with its countdown '+JSON.stringify(lp));await shot(A,'loot');
await A.click('.loot83pop .loot83-it[data-loot83^="pectorale"]');
ok(await pv(A,()=>ONL.char.gear.some(g=>/^pectorale#/.test(g)),x=>x),'the pick is the killer’s');

/* ── 11 · ★ follow + the profile + the share link ── */
await open(B,'play');await B.evaluate(id=>onl83Profile(id),sa.dom);
const pf=await pv(B,()=>({pop:!!document.querySelector('.pf83pop'),tro:document.querySelectorAll('.pf83pop .tr83-t').length,g:document.querySelectorAll('.pf83pop .pf83-g').length}),v=>v.pop&&v.tro===4&&v.g===1);ok(pf.pop&&pf.tro===4&&pf.g===1,'the profile: trophies, gladiators '+JSON.stringify(pf));await shot(B,'profile');
await B.click('.pf83pop [data-pf83="follow"]');ok(await pv(B,()=>/Following/.test((document.querySelector('.pf83pop [data-pf83="follow"]')||{}).textContent||''),x=>x),'★ Following');
await B.click('.pf83pop [data-pf83="share"]');const link=await pv(B,()=>ONL83U.lastShare||'',x=>x.endsWith('#domus='+sa.dom));ok(link.endsWith('#domus='+sa.dom),'the share link ('+link+')');
await B.click('.pf83pop [data-pf83="x"]');await redraw(B);
const fl=await pv(B,()=>{ONL.tab='prof';onlRedraw();return [...document.querySelectorAll('#onl .pr98-fol > div')].map(r=>r.textContent)},v=>v.length===1&&/Vettii/.test(v[0]));ok(fl.length===1&&/Vettii/.test(fl[0]),'the followed list in Profile & Settings (v1.0: off the landing) '+JSON.stringify(fl));
await B.evaluate(()=>{ONL.tab='play';onlRedraw()});ok(await B.evaluate(()=>!document.querySelector('#onl .fl83')),'no followed-houses card on the landing');
/* the landing: the gift chest, the followed list, Ludi Infames */
const ld=await pv(A,async()=>{ONL.tab='play';await onlRefresh();onlRedraw();return {gift:!!document.querySelector('#onl .a81-stage .gift83.stage'),inf:!!document.querySelector('#onl .inf83'),infLock:!!document.querySelector('#onl .inf83.locked')}},v=>v.gift&&v.inf&&v.infLock);
ok(ld.gift&&ld.inf&&ld.infLock,'the landing: chest + Ludi Infames (locked for a Tiro) '+JSON.stringify(ld));
await world(A,(w,[cid,did])=>{w.domus82[did].gifts=[{id:'hg3',why:'surv:10',at:Date.now()}];w.chars[cid].glory=600},[sa.ch,sa.dom]);await redraw(A);await redraw(B);await shot(B,'landing_follow');await shot(A,'landing');await A.evaluate(()=>{const x=document.querySelector('#onl .inf83');if(x)x.scrollIntoView({block:'center'})});if(SHOT)await A.screenshot({path:path.join(SHOT,'u83_landing_pls_1300.png')});
/* a page opened with #domus=<id> opens Online on that profile */
const P2=await ctx.newPage();P2.on('pageerror',e=>errs.push('P2:'+e.message));await P2.goto(URL0+'#domus='+sa.dom,{timeout:90000});let hp=false;for(const t0=Date.now();Date.now()-t0<40000&&!hp;){await P2.waitForTimeout(100);hp=await P2.evaluate(()=>!!document.querySelector('.pf83pop'))}ok(hp,'#domus=… opens the profile');await P2.close();

/* ── 9 · the countdown + ✕ Hold; 12 · the Wagers tab ── */
await A.evaluate(()=>localStorage.setItem('flavius_onlcd83','60000'));
const L1=await A.evaluate(async()=>(await onlReq80('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,cry:false})));await B.evaluate(async id=>await NET.req('lobby.join',{id}),L1.id);
/* v1.0: online wagers are closed — the mock refuses bet.place (wager_off) like the server */
const bet100=await C.evaluate(async id=>{try{await NET.req('bet.place',{id,seat:0,amt:12});return 'ok'}catch(e){return e.code||e.message}},L1.id);ok(bet100==='wager_off','12 bet.place is refused ('+bet100+')');
await A.evaluate(()=>{ONL.tab='play';onlRedraw()});await A.waitForTimeout(300);await A.evaluate(id=>{NET.req('lobby.start',{id}).catch(()=>{})},L1.id);for(const t0=Date.now();Date.now()-t0<40000&&!(await A.evaluate(()=>!!document.getElementById('cd83')));){await A.waitForTimeout(400);await redraw(A)}
const cd=await A.evaluate(()=>({box:!!document.getElementById('cd83'),n:+((document.getElementById('cd83n')||{}).textContent||0),seats:document.querySelectorAll('#cd83 .cd83-s').length,hold:!!document.querySelector('#cd83 [data-onl83="hold"]'),gear:/Cassis|Galea|Pectorale|recruit/i.test((document.getElementById('cd83')||{}).textContent||'')}));
ok(cd.box&&cd.n>30&&cd.seats===4&&cd.hold,'the countdown with the line-up and ✕ Hold '+JSON.stringify(cd));await shot(A,'countdown');
await A.click('#cd83 [data-onl83="hold"]');for(const t0=Date.now();Date.now()-t0<30000&&!(await A.evaluate(()=>!!document.querySelector('.cd83.stop')));){await A.waitForTimeout(100);await redraw(A)}ok(await A.evaluate(()=>!document.getElementById('cd83')&&!!document.querySelector('.cd83.stop'))," '⏸ Countdown stopped' after ✕ Hold");
await A.evaluate(()=>localStorage.setItem('flavius_onlcd83','0'));
await open(C,'wagers');
/* v1.0: no Wagers tab — asking for it lands on Play; no wager buttons anywhere */
const wg=await C.evaluate(()=>({tab:ONL.tab,btn:document.querySelectorAll('#onl [data-v="wagers"],#onl [data-onl="bet"]').length}));
ok(wg.tab!=='wagers'&&wg.btn===0,'12 no Wagers tab, no wager buttons '+JSON.stringify(wg));await shot(C,'wagers');
await A.evaluate(async id=>{await NET.req('lobby.leave',{id})},L1.id).catch(()=>{});await B.evaluate(async id=>{try{await NET.req('lobby.leave',{id})}catch(e){}},L1.id);

/* ── 13 · gifts outlive a gladiator: Gamma (Fabii) holds a house gift and falls in a Ranked bout ── */
await world(C,(w,did)=>{w.domus82[did].gifts=[{id:'cg1',why:'rank:novicius',at:Date.now()}];w.domus82[did].offers=['merc1']},sc.dom);await world(C,(w,cid)=>{w.chars[cid].offers=['ap2'];w.chars[cid].offerEq=['ap2']},sc.ch);
const L2=await B.evaluate(async()=>await NET.req('lobby.create',{ev:'cassian',loc:3,seats:4,ranked:true,cry:false}));await C.evaluate(async id=>await NET.req('lobby.join',{id}),L2.id);
const L2s=await B.evaluate(async id=>await NET.req('lobby.start',{id}),L2.id);const xb=L2s.players.findIndex(p=>p.char===sb.ch),xc=L2s.players.findIndex(p=>p.char===sc.ch);
const t2=[0,1,2,3].map(i=>i===xb?{seat:i,won:true,place:1,f:20,survives:true}:i===xc?{seat:i,won:false,place:4,f:1,survives:false,kb:'b'}:{seat:i,won:false,place:2,f:4,survives:true});
for(const p of [B,C])await p.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'u'})},[L2.id,t2]);
const gd=await pv(C,async()=>{const g=await NET.req('domus.get',{});const c=(await NET.req('char.mine',{})).find(x=>x.alive);return {gifts:(g.gifts||[]).map(x=>x.id),offers:g.offers||[],alive:!!c}},v=>!v.alive&&v.gifts.includes('cg1')&&v.offers.join()==='merc1');
ok(!gd.alive&&gd.gifts.includes('cg1')&&gd.offers.join()==='merc1','his call: the gift stays with the house, the un-brought offering goes to the shelf '+JSON.stringify(gd));
await C.waitForTimeout(2500);await C.evaluate(()=>{try{onlExit()}catch(e){}});await C.waitForTimeout(2000);await open(C,'char');ok(await pv(C,()=>(document.querySelector('#onl .gift83.on .gift83n')||{}).textContent==='1',x=>x),'the chest still glows after the death');
await C.evaluate(()=>{window._r=Math.random;Math.random=()=>0.1});await C.click('#onl .gift83');await pv(C,()=>!!document.querySelector('.gift83pop .pz83'),x=>x);await C.waitForTimeout(300);await C.evaluate(()=>{Math.random=window._r});
const gc=await pv(C,()=>({coin:/treasury/i.test((document.querySelector('.gift83pop .pz83')||{}).textContent||''),t:ONL.domus.treasury}),v=>v.coin&&v.t>0);ok(gc.coin&&gc.t>0,'opened with no gladiator: coin into the treasury '+JSON.stringify(gc));
await C.evaluate(()=>{const x=document.querySelector('.gift83pop [data-g83]');if(x)x.click()});

/* ── 14 · tester grants ── */
const nt=await B.evaluate(async()=>{try{await NET.req('admin.grant',{coin:10});return 'ok'}catch(e){return e.code}});ok(nt==='notTester','a non-tester is refused ('+nt+')');
await B.evaluate(()=>localStorage.setItem('flavius_onltester83','1'));await open(B,'char');ok(await B.evaluate(()=>!document.querySelector('#onl .tst83')),'v0.97: no Tester panel on the Domus');await open(B,'prof');ok(await B.evaluate(()=>!!document.querySelector('#onl .tst83')),'the 🧪 Tester panel for a tester (Profile & settings)');
const rc0=await B.evaluate(async()=>(await NET.req('hello',{all:1})).rankCounts);
await B.evaluate(()=>{document.querySelector('#onl .tst83').open=true;document.getElementById('tst83coin').value='250';document.getElementById('tst83gift').value='1'});await B.click('#onl [data-onl83="grant"]');await pv(B,async()=>!!(await NET.req('hello',{all:1})).domus.test,x=>x);await open(B,'char');await pv(B,async()=>!!document.querySelector('#onl .db89-ttl .test83,#onl .dom82-ttl .test83'),x=>x);
const tg=await B.evaluate(async()=>{const h=await NET.req('hello',{all:1});let r='';try{await NET.req('lobby.create',{ev:'democritus',ranked:true,cry:false})}catch(e){r=e.code}return {test:!!h.domus.test,rc:h.rankCounts,refused:r,chip:!!document.querySelector('#onl .db89-ttl .test83,#onl .dom82-ttl .test83'),wallet:ONL.char.wallet}});
ok(tg.test&&tg.chip&&tg.refused==='testHouse','granted: a TEST house, Custom only '+JSON.stringify({t:tg.test,c:tg.chip,r:tg.refused}));
const sum=o=>Object.values(o||{}).reduce((a,v)=>a+(v|0),0);ok(sum(tg.rc)===sum(rc0)-1,'out of the rank counts');
await B.evaluate(()=>localStorage.removeItem('flavius_onltester83'));
/* a test house's Custom win never reaches Today */
const L3=await B.evaluate(async()=>await NET.req('lobby.create',{ev:'egidious',loc:2,seats:4,ranked:false,cry:false}));await A.evaluate(async id=>await NET.req('lobby.join',{id}),L3.id);
const L3s=await B.evaluate(async id=>await NET.req('lobby.start',{id}),L3.id);const yb=L3s.players.findIndex(p=>p.char===sb.ch);
const t3=[0,1,2,3].map(i=>({seat:i,won:i===yb,place:i===yb?1:2,f:i===yb?60:2,survives:true}));for(const p of [A,B])await p.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'v'})},[L3.id,t3]);
const td=await A.evaluate(async()=>{const h=await NET.req('hello',{all:1});return JSON.stringify(h.today||{})});ok(!/Aemilii the Bold/.test(td),'a test house never shows in Today');
console.log(JSON.stringify({dm,gl,rp,gf,mb,us,lp,pf,link,fl,ld,cd,wg,gd,gc,nt}));
console.log('MISS',miss);console.log('ERRS',errs);await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
