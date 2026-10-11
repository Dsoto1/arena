/* v1.0 ONLINE SERVER BATCH A (292-v100srvA + the "v1.0 SERVER BATCH A" section of 111-onlcore; mock, two windows):
   5 · DOMUS SLOTS: a new house has one slot; a second gladiator is refused (slot_full); the Domus shows the locked slot with its Glory + coin, opens it
       (domus.slot) once the house has the Glory and the coin; then the second gladiator is raised.
   2 · THE ISSUED KIT: free once a day for the house — padding + his class's Level 1 weapons for empty hands; a second claim the same day is refused.
   3 · WAGERS GONE: no 💰 Wagers rail tab, the mock refuses bet.place (wager_off).
   1 · RANKED = EQUIPPED ONLY: in a Ranked match Beta's soldier holds only the mace he bought — no class gladius on top (Custom would add it).
   4 · RESULTS FOR EVERY PLAYER: both windows end the match; each results window opens with "Your match" (#onr100), fills in when it is settled
       (coin to the treasury, lifetime CF) and lists every seat; Custom wording says no coin is paid.
   SHOT=<dir> saves the screenshots (tools/plans/online100a/). ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of Object.entries({A,B}))p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid|auto)/.test(k))localStorage.removeItem(k)});
await B.goto(URL0,{timeout:90000});for(const p of [A,B])await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
/* HAND-OFF (as tonl78): the mock world is one localStorage item; a window waits until it holds the last writer's copy before it acts */
const HAND={last:null,on:true};for(const p of [A,B]){const ev=p.evaluate.bind(p);p.evaluate=async(...a)=>{const L=HAND.last;
  if(HAND.on&&L&&L!==p&&!L.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await L.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
    if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
  const r=await ev(...a);HAND.last=p;return r};p.__ev=ev}
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const shot=async(p,n)=>{if(SHOT){fs.mkdirSync(SHOT,{recursive:true});await p.screenshot({path:path.join(SHOT,n)})}};
const until=async(p,fn,arg,ms=20000)=>{const t0=Date.now();let v;while(Date.now()-t0<ms){v=await p.evaluate(fn,arg).catch(()=>null);if(v)return v;await p.waitForTimeout(200)}return v};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');
const err=(p,t,d)=>p.evaluate(async([t,d])=>{try{await NET.req(t,d);return 'ok'}catch(e){return e.code||e.message}},[t,d]);

/* ── 5 · DOMUS SLOTS ── */
out.slot0=await A.evaluate(()=>{const w=mockLoad();const D=mockDomus82(w,w.accounts[ONL.acct.id].domus);return D?{s:D.slots100,g:ONLC.gladMax(D)}:null});
ok(out.slot0&&out.slot0.s===1&&out.slot0.g===1,'a new house: one slot '+JSON.stringify(out.slot0));
out.full=await err(A,'char.create',{name:'Alpha Two',cls:'slave'});ok(out.full==='slot_full','a second gladiator waits for slot 2 ('+out.full+')');
out.lock=await err(A,'domus.slot',{});ok(out.lock==='slot_locked','no Glory yet: slot_locked ('+out.lock+')');
/* the house earns its Glory (a gladiator with 180 Glory) and the coin */
await A.evaluate(()=>{const w=mockLoad();w.chars[ONL.char.id].glory=180;const D=mockDomus82(w,w.accounts[ONL.acct.id].domus);D.treasury=320;mockSave(w)});
await A.evaluate(async()=>{onlineOpen('char');await new Promise(r=>setTimeout(r,900));ONL.tab='char';ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();ONL82.dg=await NET.req('domus.get',{});ONL.domus=ONL82.dg.domus;onlRedraw()});
out.card=await until(A,()=>{const c=document.querySelector('#onl .gc89.sl100');return c?{can:c.classList.contains('can'),txt:c.textContent.replace(/\s+/g,' ').trim()}:null});
ok(out.card&&out.card.can&&/Slot 2/.test(out.card.txt)&&/180 \/ 150 Glory/.test(out.card.txt),'the Domus shows slot 2 ready to open '+JSON.stringify(out.card));
await shot(A,'domus_slot_locked.png');
await A.evaluate(()=>document.querySelector('#onl .gc89.sl100').click());await A.waitForSelector('.ask76bg [data-ask76="1"]',{timeout:10000});await A.click('.ask76bg [data-ask76="1"]');
out.opened=await until(A,()=>ONL.domus&&ONL.domus.slots100===2?{gmax:ONL.domus.gmax,t:ONL.domus.treasury,next:ONL.domus.slotNext100}:null);
ok(out.opened&&out.opened.gmax===2&&out.opened.t===120&&out.opened.next&&out.opened.next.n===3,'slot 2 opened for 200 coin '+JSON.stringify(out.opened));
out.two=await err(A,'char.create',{name:'Alpha Two',cls:'slave'});ok(out.two==='ok','the second gladiator is raised ('+out.two+')');
await A.evaluate(async()=>{ONL82.dgAt=0;await onlRefresh();ONL82.dg=await NET.req('domus.get',{});ONL.domus=ONL82.dg.domus;onlRedraw()});await A.waitForTimeout(600);
out.after=await A.evaluate(()=>{const c=document.querySelector('#onl .gc89.sl100');return c?c.textContent.replace(/\s+/g,' ').trim():''});ok(/Slot 3/.test(out.after)&&/600 Glory/.test(out.after),'the next locked slot: 3 at 600 Glory '+out.after);
await shot(A,'domus_slot_opened.png');

/* ── 2 · THE ISSUED KIT ── */
/* (back to a Tiro for the Ranked room below: Ranked pairs equal ranks; the house keeps its best Domus-rank score) */
await A.evaluate(()=>{const w=mockLoad();Object.assign(w.chars[ONL.char.id],{glory:0,rankK:'tiro',rank:'tiro'});mockSave(w)});
await A.evaluate(()=>{const w=mockLoad();const c=w.chars[ONL.char.id];c.gear=[];c.equip=[];c.pcs={};mockSave(w)});
out.kit=await A.evaluate(async()=>{const r=await NET.req('market.kit',{char:ONL.char.id,kit:'daily'});return {b:r.bought,iss:r.issued,cost:r.cost}});
ok(out.kit&&out.kit.iss&&out.kit.cost===0&&out.kit.b.join()===['galea','wraps','legwraps','sica','thracian'].join(),'the Issued kit: padding + the Hero’s Level 1 sica and shield '+JSON.stringify(out.kit));
out.kit2=await A.evaluate(async()=>{try{await NET.req('market.kit',{char:ONL.char.id,kit:'daily'});return 'ok'}catch(e){return e.code}});ok(out.kit2==='kit_day','once a day for the house ('+out.kit2+')');
out.val=await A.evaluate(()=>{const w=mockLoad();const c=w.chars[ONL.char.id];return c.gear.map(it=>ONLC.pieceInfo({item:it,pc:ONLC.pcOf(c,it)},onlCatalog()).val)});ok(out.val.length===5&&out.val.every(v=>v===0),'Issued pieces are worth 0 '+JSON.stringify(out.val));

/* ── 3 · WAGERS GONE ── */
out.bet=await err(B,'bet.place',{id:'x',seat:0,amt:5});ok(out.bet==='wager_off','bet.place refused ('+out.bet+')');
out.tabs=await A.evaluate(()=>[...document.querySelectorAll('#onl [data-v="wagers"]')].length);ok(out.tabs===0,'no Wagers rail tab');

/* ── 1 · RANKED = EQUIPPED ONLY ── */
await B.evaluate(()=>{const w=mockLoad();const c=w.chars[ONL.char.id];c.gear=['mace'];c.equip=['mace'];mockSave(w)});
const L=await A.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'democritus',loc:5,ranked:true,cry:false});return r.lobby||r});
const bid=await B.evaluate(()=>ONL.acct.id);
for(let k=0;k<10;k++){await B.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);let j=false;
  for(const t0=Date.now();Date.now()-t0<4000&&!j;){j=await A.evaluate(([id,x])=>(mockLoad().lobbies[id].players||[]).some(p=>p.id===x),[L.id,bid]);if(!j)await A.waitForTimeout(200)}if(j)break}
const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await B.evaluate(L=>onlEnter(L),L2);HAND.on=false;
/* drive the opening windows (briefing, draft…) on whichever window owns them, until the arena is up */
const drive=p=>p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const b=document.querySelector('#modal .mbtns .primary:not([disabled])')||document.querySelector('#modal .mbtns button:not([disabled])');if(b){b.click();return 'm'}
    const lit=document.querySelector('#modal [data-mi]:not(.dim):not([disabled])');if(lit){lit.click();return 'p'}}return ''}).catch(()=>'');
let up=false;for(const t0=Date.now();Date.now()-t0<90000&&!up;){await drive(A);await drive(B);await A.waitForTimeout(250);up=await A.evaluate(()=>!!(ONLM.on&&S&&S.players&&S.phase&&S.phase!=='setup'&&!CUR_MODAL)).catch(()=>false)&&await B.evaluate(()=>!!(ONLM.on&&S&&S.players&&S.phase!=='setup'&&!CUR_MODAL)).catch(()=>false)}
ok(up,'the Ranked match is up');
out.kits=await A.evaluate(bid=>{const seat=S.onl.owners.indexOf(bid);const p=S.players[seat];const me=S.players[S.onl.seat];return {b:[p.wR&&p.wR.key,p.wL&&p.wL.key],a:[me.wR&&me.wR.key,me.wL&&me.wL.key],cls:p.cls}},bid);
ok(out.kits.b[0]==='mace'&&!out.kits.b[1],'Ranked: Beta’s soldier holds only his mace — no class gladius '+JSON.stringify(out.kits));
ok(out.kits.a[0]==='sica'&&out.kits.a[1]==='thracian','Ranked: Alpha holds his Issued sica + shield '+JSON.stringify(out.kits));
await A.evaluate(bid=>{const seat=S.onl.owners.indexOf(bid);if(typeof SIDE!=='undefined')SIDE.view=seat;try{render()}catch(e){}},bid);await A.waitForTimeout(800);await shot(A,'ranked_kit.png');

/* ── 4 · RESULTS FOR EVERY PLAYER ── */
for(const t0=Date.now();Date.now()-t0<20000;){await drive(A);await drive(B);if(await A.evaluate(()=>!CUR_MODAL&&!S.busy)&&await B.evaluate(()=>!CUR_MODAL&&!S.busy))break;await A.waitForTimeout(250)}
await Promise.all([A,B].map(p=>p.evaluate(()=>{try{gameOver([S.players[0]],'test')}catch(e){}})));
out.card0=await Promise.all([A,B].map(p=>until(p,()=>{const c=document.getElementById('onr100');return c?c.textContent.replace(/\s+/g,' ').trim():null},null,30000)));
ok(out.card0.every(t=>t&&/Your Ranked match/.test(t)),'both windows open "Your match" '+JSON.stringify(out.card0.map(t=>(t||'').slice(0,80))));
out.done=await Promise.all([A,B].map(p=>until(p,()=>{const c=document.getElementById('onr100');const t=c&&c.textContent.replace(/\s+/g,' ').trim();return t&&/Settled|Void/.test(t)?{t,rows:c.querySelectorAll('tr').length-1}:null},null,40000)));
ok(out.done.every(x=>x&&x.rows===4),'each card lists every seat '+JSON.stringify(out.done.map(x=>x&&x.rows)));
ok(out.done.every(x=>x&&(/to the house treasury|nothing is paid|void/i.test(x.t))&&/lifetime CF|void/i.test(x.t)),'each card shows the coin / CF after settling '+JSON.stringify(out.done.map(x=>x&&x.t.slice(0,220))));
await A.waitForTimeout(1500);await shot(A,'results_A.png');await shot(B,'results_B.png');
/* the forced end above is often judged void (the windows end at slightly different moments); the screenshot of a settled Ranked card uses a settlement reply */
await A.evaluate(()=>{ONR100.res={out:{earn92:9,award:9,cf:15,glory:23,factor:0.5}};ONR100.lines=['💔 1 piece came back broken — 🔧 repair in the Storeroom'];onr100Paint()});
out.settled=await A.evaluate(()=>{const t=document.getElementById('onr100').textContent;const t2=t.replace(/\s+/g,' ');return /9( coin)? to the house treasury/.test(t2)&&/\+15 lifetime CF/.test(t2)&&/\+23 Glory/.test(t2)?true:t2.slice(0,200)});ok(out.settled===true,'a settled Ranked card: coin to the treasury, lifetime CF, Glory');
await A.waitForTimeout(300);await shot(A,'results_settled.png');
out.cw=await A.evaluate(()=>{const r=S.onl.ranked;S.onl.ranked=false;const h0=ONR100.res;ONR100.res={out:{cf:6,glory:6}};const h=onr100HTML();S.onl.ranked=r;ONR100.res=h0;return /Custom bout — no coin is paid/.test(h)&&!/to the house treasury/.test(h)});
ok(out.cw,'Custom: "no coin is paid"');
/* without the Ranked flag the class loadout stays: a CPU seat holds its class weapon */
out.cpu=await A.evaluate(()=>{const p=S.players.find(x=>x.cpu);return p?[p.cls,p.wR&&p.wR.key,CLASSES[p.cls].R]:null});
ok(out.cpu&&out.cpu[1]===out.cpu[2],'a seat without the Ranked flag keeps the class weapon '+JSON.stringify(out.cpu));
console.log(JSON.stringify(out).slice(0,1600));console.log('SETTLED',JSON.stringify(out.settled));console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
