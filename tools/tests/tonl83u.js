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
const errs=[];const pg=async n=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0);return p};
const A=await pg('A');await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester)/.test(k))localStorage.removeItem(k)});await A.reload();
const B=await pg('B'),C=await pg('C');await A.waitForTimeout(2500);
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const shot=async(p,n,w)=>{if(!SHOT)return;for(const vw of w===390?[390]:[1300,390]){await p.setViewportSize({width:vw,height:vw===390?844:900});await p.waitForTimeout(350);await p.screenshot({path:path.join(SHOT,`u83_${n}_${vw}.png`)})}await p.setViewportSize({width:1300,height:900});await p.waitForTimeout(200)};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});ONL.domus=(await NET.req('domus.create',{name:name})).domus;
  ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});return {ch:ONL.char.id,dom:ONL.domus.id}},[name,cls]);
const sa=await setup(A,'Vettii','hero'),sb=await setup(B,'Aemilii','soldier'),sc=await setup(C,'Fabii','slave');
const world=(p,fn,arg)=>p.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const open=async(p,tab)=>{await p.evaluate(async t=>{if(!document.getElementById('onl')){onlineOpen(t);await new Promise(r=>setTimeout(r,900))}ONL.tab=t;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw()},tab);await p.waitForTimeout(500)};
const redraw=async p=>{await p.evaluate(async()=>{await onlRefresh();ONL82.dgAt=0;await NET.req('domus.get',{});onlRedraw()});await p.waitForTimeout(300)};

/* ── house state for Alpha (Vettii): treasury, trophies, a named piece (Tiro → locked), a broken helm, 2 house gifts ── */
await world(A,(w,[cid,did])=>{const ch=w.chars[cid];ch.wallet=900;const D=w.domus82[did];D.treasury=321;
  D.trophies=[{k:'first:democritus',n:ONLC.trophyName('first:democritus'),at:Date.now()-864e5*3,glad:ch.name,x:1},{k:'rank:novicius',n:ONLC.trophyName('rank:novicius'),at:Date.now()-864e5,glad:ch.name,x:1},{k:'slew:tholo',n:ONLC.trophyName('slew:tholo'),at:Date.now(),glad:ch.name,x:1},{k:'vday',n:ONLC.trophyName('vday'),at:Date.now(),glad:ch.name,x:2}];
  let s=7;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};const def=ONLC.rollNamed(rnd,onlCatalog(),'epic',[]);ONLC.putPiece(ch,ONLC.namedPiece(def,ch),false);
  ONLC.putPiece(ch,{item:'galea',pc:null},true);ONLC.breakItem(ch,'galea');D.gifts=[{id:'hg1',why:'rank:novicius',at:Date.now(),glad:ch.name},{id:'hg2',why:'surv:5',at:Date.now(),glad:ch.name}]},[sa.ch,sa.dom]);

/* ── 1 + 3 + 10 · the Domus: 8 ranks with living counts, treasury, trophies, gifts chest ── */
await open(A,'char');
const dm=await A.evaluate(()=>({bands:document.querySelectorAll('#onl .rb83 .rb82-band').length,living:[...document.querySelectorAll('#onl .rb83 .rb82-n')].every(x=>/living/.test(x.textContent)),top:(document.querySelector('#onl .rb83 .rb82-band b')||{}).textContent||'',
  tre:(document.querySelector('#onl .tre83')||{}).textContent||'',tro:document.querySelectorAll('#onl .tr83-t').length,gift:(document.querySelector('#onl .gift83.dom.on .gift83n')||{}).textContent||''}));
ok(dm.bands===8&&dm.living&&/Invictus/.test(dm.top),'rank bar: 8 ranks, Invictus on top, living counts ('+JSON.stringify(dm)+')');ok(/321/.test(dm.tre),'the treasury on the Domus record');ok(dm.tro===4,'the trophy shelf');ok(dm.gift==='2','the gift chest glows with its count');
/* ── 2 · gear levels: the named piece is locked for a Tiro; 5 · the broken helm has 🔧 Repair ── */
const gl=await A.evaluate(()=>{const nw=document.querySelector('#onl .sr83.named83');const ck=nw&&nw.querySelector('input[data-sr82eq]');const geq=[...document.querySelectorAll('#onl input[data-onlgeq]')];
  return {nw:!!nw,lock:!!nw&&/Veteranus\+/.test(nw.textContent),dis:!!ck&&ck.disabled,geqDis:geq.some(i=>i.disabled&&/Veteranus/.test(i.closest('label').textContent)),rep:(document.querySelector('#onl .rep83')||{}).textContent||'',brk:!!document.querySelector('#onl .sr83.brk83')}});
ok(gl.nw&&gl.lock&&gl.dis&&gl.geqDis,'a named piece: 🔒 Veteranus+, no Bring (Storeroom + My Gladiators) '+JSON.stringify(gl));ok(gl.brk&&new RegExp('Repair · '+await A.evaluate(()=>ONLC.repairCost(ONLC.pieceInfo({item:'galea'},onlCatalog())))).test(gl.rep),'broken helm: 🔧 Repair · cost ('+gl.rep+')');
await A.evaluate(()=>{const s=document.querySelector('#sr82');if(s)s.scrollIntoView()});await shot(A,'domus_store');await A.evaluate(()=>{document.querySelector('#mBody')&&(document.querySelector('#mBody').scrollTop=0)});await shot(A,'domus');
await A.click('#onl .rep83');await A.waitForTimeout(300);await shot(A,'repair',390);await A.click('.rep83pop [data-rep83="treasury"]');await A.waitForTimeout(800);
const rp=await A.evaluate(()=>({brk:ONLC.isBroken(ONL.char,ONL.char.gear.find(g=>/^galea/.test(g))),t:ONL.domus.treasury}));ok(!rp.brk&&rp.t===321-10,'repaired from the treasury ('+JSON.stringify(rp)+')');
/* ── 7 · the gift reveal: a Legendary named weapon ── */
await A.evaluate(()=>{window._r=Math.random;Math.random=()=>0.995});await A.click('#onl .gift83.dom');await A.waitForTimeout(2300);await A.evaluate(()=>{Math.random=window._r});
const gf=await A.evaluate(()=>({nw:!!document.querySelector('.gift83pop .pz83.named .nw83.r-legendary'),uq:(document.querySelector('.gift83pop .nw83-uq')||{}).textContent||'',val:(document.querySelector('.gift83pop .nw83-val')||{}).textContent||'',next:!!document.querySelector('.gift83pop [data-g83="next"]')}));
ok(gf.nw&&gf.uq.length>10&&/12000/.test(gf.val)&&gf.next,'the reveal: a Legendary named card, unique effect, value 12000, the next gift ('+JSON.stringify(gf)+')');await shot(A,'gift');
await A.click('.gift83pop [data-g83="x"]');await A.waitForTimeout(400);
/* ── 4 · the market board: offerings row above weapons | armor; buy an offering; the Used tab ── */
await world(A,w=>{w.market83=[{id:'U#0000000000001#a',item:'cassis#x.1',pc:{st:'broken',hist:[{house:'Aemilii',glad:'Old Marcus',when:Date.now()-864e5,how:'fell'}]},base:'cassis',n:'Cassis',kind:'a',lv:2,st:'broken',price:Math.round(ONLC.priceOf(onlCatalog().cassis)*2/3),at:Date.now(),from:{house:'Aemilii',glad:'Old Marcus'}}]});
await A.evaluate(()=>{ONL.tab='armory';ONL83U.mkt='board';onlRedraw()});await A.waitForTimeout(400);
const mb=await A.evaluate(()=>({of:document.querySelectorAll('#onl .mb83-offs .mb83-of').length,w:document.querySelectorAll('#onl .mb83-half.w .mb83-row').length,a:document.querySelectorAll('#onl .mb83-half.a .mb83-row').length,above:(()=>{const o=document.querySelector('#onl .mb83-offs'),h=document.querySelector('#onl .mb83-halves');return !!o&&!!h&&o.getBoundingClientRect().bottom<=h.getBoundingClientRect().top+1})()}));
ok(mb.of===8&&mb.w===3&&mb.a===3&&mb.above,'the market board: 8 offerings above weapons | armor by level ('+JSON.stringify(mb)+')');await shot(A,'market');
await A.click('#onl .mb83-of[data-v="elix2"]');await A.waitForTimeout(300);await A.click('.ask76bg .btn.primary');await A.waitForTimeout(700);
ok(await A.evaluate(()=>(ONL.char.offers||[]).includes('elix2')),'an offering bought into the satchel');
await A.click('#onl [data-onl83="mkt"][data-v="used"]');await A.waitForTimeout(900);
const us=await A.evaluate(()=>({n:document.querySelectorAll('#onl .us83-it').length,brk:!!document.querySelector('#onl .us83-it.brk83 .brk83t'),hist:/Old Marcus/.test((document.querySelector('#onl .us83-it')||{}).textContent||'')}));
ok(us.n===1&&us.brk&&us.hist,'the Used tab: a broken piece at ⅔ with its history '+JSON.stringify(us));await shot(A,'used');
/* ── 6 · the loot popup: pick one ── */
await world(A,(w,[kc])=>{const k=w.chars[kc];w.loot83=w.loot83||{};const X={match:'Lfake',seat:2,dead:{acct:'x',char:'cx',name:'Gaius the Doomed',cls:'soldier',domus:'Fabii'},killer:{acct:k.owner,char:kc,seat:0},until:Date.now()+90000,done:false,
  pieces:[{item:'pectorale#d.1',pc:{st:'whole',hist:[]},n:'Pectorale',kind:'a',lv:1,st:'whole',rar:null,val:ONLC.priceOf(onlCatalog().pectorale)},{item:'axe#d.2',pc:{st:'whole',hist:[]},n:'Axe',kind:'w',lv:2,st:'whole',rar:null,val:ONLC.priceOf(onlCatalog().axe)}]};
  w.loot83['Lfake#2']=X},[sa.ch]);await A.evaluate(async()=>{await NET.req('hello',{all:1})});await A.waitForTimeout(900);
const lp=await A.evaluate(()=>({pop:!!document.querySelector('.loot83pop'),n:document.querySelectorAll('.loot83pop .loot83-it').length,cd:+((document.getElementById('loot83s')||{}).textContent||0)}));
ok(lp.pop&&lp.n===2&&lp.cd>80,'the loot popup with its countdown '+JSON.stringify(lp));await shot(A,'loot');
await A.click('.loot83pop .loot83-it[data-loot83^="pectorale"]');await A.waitForTimeout(900);
ok(await A.evaluate(()=>ONL.char.gear.some(g=>/^pectorale#/.test(g))),'the pick is the killer’s');

/* ── 11 · ★ follow + the profile + the share link ── */
await open(B,'play');await B.evaluate(id=>onl83Profile(id),sa.dom);await B.waitForTimeout(800);
const pf=await B.evaluate(()=>({pop:!!document.querySelector('.pf83pop'),tro:document.querySelectorAll('.pf83pop .tr83-t').length,g:document.querySelectorAll('.pf83pop .pf83-g').length}));ok(pf.pop&&pf.tro===4&&pf.g===1,'the profile: trophies, gladiators '+JSON.stringify(pf));await shot(B,'profile');
await B.click('.pf83pop [data-pf83="follow"]');await B.waitForTimeout(900);ok(await B.evaluate(()=>/Following/.test((document.querySelector('.pf83pop [data-pf83="follow"]')||{}).textContent||'')),'★ Following');
await B.click('.pf83pop [data-pf83="share"]');await B.waitForTimeout(300);const link=await B.evaluate(()=>ONL83U.lastShare||'');ok(link.endsWith('#domus='+sa.dom),'the share link ('+link+')');
await B.click('.pf83pop [data-pf83="x"]');await redraw(B);
const fl=await B.evaluate(()=>[...document.querySelectorAll('#onl .fl83-r')].map(r=>r.textContent));ok(fl.length===1&&/Vettii/.test(fl[0]),'the followed list on the landing '+JSON.stringify(fl));
/* the landing: the gift chest, the followed list, Ludi Infames */
const ld=await A.evaluate(async()=>{ONL.tab='play';await onlRefresh();onlRedraw();return {gift:!!document.querySelector('#onl .a81-stage .gift83.stage'),inf:!!document.querySelector('#onl .inf83'),infLock:!!document.querySelector('#onl .inf83.locked')}});
ok(ld.gift&&ld.inf&&ld.infLock,'the landing: chest + Ludi Infames (locked for a Tiro) '+JSON.stringify(ld));
await world(A,(w,[cid,did])=>{w.domus82[did].gifts=[{id:'hg3',why:'surv:10',at:Date.now()}];w.chars[cid].glory=600},[sa.ch,sa.dom]);await redraw(A);await redraw(B);await shot(B,'landing_follow');await shot(A,'landing');await A.evaluate(()=>{const x=document.querySelector('#onl .inf83');if(x)x.scrollIntoView({block:'center'})});if(SHOT)await A.screenshot({path:path.join(SHOT,'u83_landing_pls_1300.png')});
/* a page opened with #domus=<id> opens Online on that profile */
const P2=await ctx.newPage();P2.on('pageerror',e=>errs.push('P2:'+e.message));await P2.goto(URL0+'#domus='+sa.dom);let hp=false;for(let i=0;i<40&&!hp;i++){await P2.waitForTimeout(400);hp=await P2.evaluate(()=>!!document.querySelector('.pf83pop'))}ok(hp,'#domus=… opens the profile');await P2.close();

/* ── 9 · the countdown + ✕ Hold; 12 · the Wagers tab ── */
await A.evaluate(()=>localStorage.setItem('flavius_onlcd83','60000'));
const L1=await A.evaluate(async()=>(await onlReq80('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,cry:false})));await B.evaluate(async id=>await NET.req('lobby.join',{id}),L1.id);
await world(C,(w,cid)=>{w.chars[cid].wallet=100},sc.ch);await C.evaluate(async id=>{await NET.req('bet.place',{id,seat:0,amt:12})},L1.id);
await A.evaluate(()=>{ONL.tab='play';onlRedraw()});await A.waitForTimeout(300);await A.evaluate(id=>{NET.req('lobby.start',{id}).catch(()=>{})},L1.id);for(let i=0;i<30&&!(await A.evaluate(()=>!!document.getElementById('cd83')));i++){await A.waitForTimeout(400);await redraw(A)}
const cd=await A.evaluate(()=>({box:!!document.getElementById('cd83'),n:+((document.getElementById('cd83n')||{}).textContent||0),seats:document.querySelectorAll('#cd83 .cd83-s').length,hold:!!document.querySelector('#cd83 [data-onl83="hold"]'),gear:/Cassis|Galea|Pectorale|recruit/i.test((document.getElementById('cd83')||{}).textContent||'')}));
ok(cd.box&&cd.n>30&&cd.seats===4&&cd.hold,'the countdown with the line-up and ✕ Hold '+JSON.stringify(cd));await shot(A,'countdown');
await A.click('#cd83 [data-onl83="hold"]');for(let i=0;i<20&&!(await A.evaluate(()=>!!document.querySelector('.cd83.stop')));i++){await A.waitForTimeout(300);await redraw(A)}ok(await A.evaluate(()=>!document.getElementById('cd83')&&!!document.querySelector('.cd83.stop'))," '⏸ Countdown stopped' after ✕ Hold");
await A.evaluate(()=>localStorage.setItem('flavius_onlcd83','0'));
await open(C,'wagers');await C.waitForTimeout(800);await C.evaluate(()=>onlRedraw());
const wg=await C.evaluate(()=>({tab:!!document.querySelector('#onl .onl-rail [data-v="wagers"].on'),pots:document.querySelectorAll('#onl .wg83-pot').length,odds:(document.querySelector('#onl .wg83-odds')||{}).textContent||'',mine:document.querySelectorAll('#onl .wg83-side tr').length}));
ok(wg.tab&&wg.pots===1&&/×/.test(wg.odds)&&wg.mine>=1,'the Wagers tab: open pot with odds, my bets '+JSON.stringify(wg));await shot(C,'wagers');
await A.evaluate(async id=>{await NET.req('lobby.leave',{id})},L1.id).catch(()=>{});await B.evaluate(async id=>{try{await NET.req('lobby.leave',{id})}catch(e){}},L1.id);

/* ── 13 · gifts outlive a gladiator: Gamma (Fabii) holds a house gift and falls in a Ranked bout ── */
await world(C,(w,did)=>{w.domus82[did].gifts=[{id:'cg1',why:'rank:novicius',at:Date.now()}]},sc.dom);await world(C,(w,cid)=>{w.chars[cid].offers=['merc1','ap2'];w.chars[cid].offerEq=['ap2']},sc.ch);
const L2=await B.evaluate(async()=>await NET.req('lobby.create',{ev:'cassian',loc:3,seats:4,ranked:true,cry:false}));await C.evaluate(async id=>await NET.req('lobby.join',{id}),L2.id);
const L2s=await B.evaluate(async id=>await NET.req('lobby.start',{id}),L2.id);const xb=L2s.players.findIndex(p=>p.char===sb.ch),xc=L2s.players.findIndex(p=>p.char===sc.ch);
const t2=[0,1,2,3].map(i=>i===xb?{seat:i,won:true,place:1,f:20,survives:true}:i===xc?{seat:i,won:false,place:4,f:1,survives:false,kb:'b'}:{seat:i,won:false,place:2,f:4,survives:true});
for(const p of [B,C])await p.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'u'})},[L2.id,t2]);await C.waitForTimeout(500);
const gd=await C.evaluate(async()=>{const g=await NET.req('domus.get',{});const c=(await NET.req('char.mine',{})).find(x=>x.alive);return {gifts:(g.gifts||[]).map(x=>x.id),offers:g.offers||[],alive:!!c}});
ok(!gd.alive&&gd.gifts.includes('cg1')&&gd.offers.join()==='merc1','his call: the gift stays with the house, the un-brought offering goes to the shelf '+JSON.stringify(gd));
await C.waitForTimeout(2500);await C.evaluate(()=>{try{onlExit()}catch(e){}});await C.waitForTimeout(2000);await open(C,'char');ok(await C.evaluate(()=>(document.querySelector('#onl .gift83.on .gift83n')||{}).textContent==='1'),'the chest still glows after the death');
await C.evaluate(()=>{window._r=Math.random;Math.random=()=>0.1});await C.click('#onl .gift83');await C.waitForTimeout(2300);await C.evaluate(()=>{Math.random=window._r});
const gc=await C.evaluate(()=>({coin:/treasury/i.test((document.querySelector('.gift83pop .pz83')||{}).textContent||''),t:ONL.domus.treasury}));ok(gc.coin&&gc.t>0,'opened with no gladiator: coin into the treasury '+JSON.stringify(gc));
await C.evaluate(()=>{const x=document.querySelector('.gift83pop [data-g83]');if(x)x.click()});

/* ── 14 · tester grants ── */
const nt=await B.evaluate(async()=>{try{await NET.req('admin.grant',{coin:10});return 'ok'}catch(e){return e.code}});ok(nt==='notTester','a non-tester is refused ('+nt+')');
await B.evaluate(()=>localStorage.setItem('flavius_onltester83','1'));await open(B,'char');ok(await B.evaluate(()=>!!document.querySelector('#onl .tst83')),'the 🧪 Tester panel for a tester');
const rc0=await B.evaluate(async()=>(await NET.req('hello',{all:1})).rankCounts);
await B.evaluate(()=>{document.querySelector('#onl .tst83').open=true;document.getElementById('tst83coin').value='250';document.getElementById('tst83gift').value='1'});await B.click('#onl [data-onl83="grant"]');await B.waitForTimeout(1200);
const tg=await B.evaluate(async()=>{const h=await NET.req('hello',{all:1});let r='';try{await NET.req('lobby.create',{ev:'democritus',ranked:true,cry:false})}catch(e){r=e.code}return {test:!!h.domus.test,rc:h.rankCounts,refused:r,chip:!!document.querySelector('#onl .dom82-ttl .test83'),wallet:ONL.char.wallet}});
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
