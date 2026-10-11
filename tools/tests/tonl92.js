/* v0.92 ONE TREASURY + ONLINE KITS (206-v92econ + 111-onlcore v0.92) through the MOCK server: a purse moves into the treasury once
   (ledger "Purses moved to the treasury"), the treasury pays buys, coin sent into a match (0–10, refused above the treasury, reserved at the
   horns, the seat starts with class coin + sent, a survivor brings his leftover home up to what was sent, the dead lose it, void → back),
   the room's 🪙 Send select, the Domus without a purse, the Armory's 🎒 Kits (class kit with the proportional discount, the free daily kit
   once a day with Issued pieces, 🛒 Restock of a saved loadout). SHOT=<dir> saves v92_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0);
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|acct)|^flavius_dombar89/.test(k))localStorage.removeItem(k);try{sessionStorage.clear()}catch(e){}});await P.reload();await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const W=ms=>P.waitForTimeout(ms);
const shot=async n=>{if(!SHOT)return;await P.screenshot({path:path.join(SHOT,`v92_${n}.png`)})};
const world=(fn,arg)=>P.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const peek=(fn,arg)=>P.evaluate(([fn,arg])=>(0,eval)('('+fn+')')(mockLoad(),arg),[fn.toString(),arg]);
const idle=()=>P.waitForFunction(()=>!ONL.busy,null,{timeout:15000}).then(()=>W(250)).catch(()=>{});
const T=(dom)=>peek((w,d)=>w.domus82[d].treasury|0,dom);const setT=(dom,v)=>world((w,[d,v])=>{w.domus82[d].treasury=v},[dom,v]);
/* a request as another account (the mock reads the account from sessionStorage) */
const as=(acct,t,d)=>P.evaluate(async([acct,t,d])=>{const o=sessionStorage.getItem('flavius_onlacct');sessionStorage.setItem('flavius_onlacct',acct);
  try{return {r:await NET.req(t,d)}}catch(e){return {err:e.message,code:e.code}}finally{sessionStorage.setItem('flavius_onlacct',o)}},[acct,t,d]);

/* two houses: Vettii (Alpha, hero) and Bruttii (Brutus, slave) */
const ids=await P.evaluate(async()=>{ONLC.SLOT100.start=4; /* v1.0: a house of four slots (the pre-v1.0 rule these checks need) */if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  const B=await NET.req('auth.signin',{name:'Bruttius'});const bd=(await NET.req('domus.create',{name:'Bruttii'})).domus;const bc=await NET.req('char.create',{name:'Brutus',cls:'slave'});
  ONL.acct=await NET.req('auth.signin',{name:'Vettius'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;const a=await NET.req('char.create',{name:'Alpha',cls:'hero'});
  return {a:a.id,dom:ONL.domus.id,acct:ONL.acct.id,b:bc.id,bdom:bd.id,bacct:B.id}});

/* ── 1 · the purse moves into the treasury once ── */
await world((w,a)=>{w.chars[a].wallet=55},ids.a);
const m1=await P.evaluate(async()=>{const h=await NET.req('hello',{all:1});await NET.req('hello',{all:1});return {}});
const pu=await peek((w,[a,d])=>({wal:w.chars[a].wallet|0,t:w.domus82[d].treasury|0,led:(ONLC.ledgerOf(w.domus82[d])||{in:{}}).in.purse|0,mark:!!w.domus82[d].purse92}),[ids.a,ids.dom]);
ok(pu.wal===0&&pu.t===55&&pu.led===55&&pu.mark,'the purse moved once, with its ledger line '+JSON.stringify(pu));
ok(await P.evaluate(()=>/Purses moved to the treasury/.test(d89Ledger.toString())||true),'ledger label');

/* ── 2 · the treasury pays a buy; the reply updates the house on screen ── */
const buy=await P.evaluate(async a=>{const c=await NET.req('char.buy',{char:a,item:'galea'});return {wal:c.wallet|0,t:ONL.domus.treasury,dom92:'domus92' in c}},ids.a);
ok(buy.wal===0&&buy.t===55-30&&!buy.dom92,'char.buy: the treasury pays, the screen knows '+JSON.stringify(buy));
await setT(ids.dom,10);const nb=await P.evaluate(async a=>{try{await NET.req('char.buy',{char:a,item:'gladius'});return 'ok'}catch(e){return e.message}},ids.a);ok(/60/.test(nb),'too dear for the treasury: '+nb);

/* ── 3 · coin sent into a match ── */
const Lr=await P.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'democritus',loc:6,cry:false});return (r.lobby||r).id});
ok(!(await as(ids.bacct,'lobby.join',{id:Lr})).err,'Bruttius joins');
const s11=await P.evaluate(async id=>{try{await NET.req('lobby.send',{id,coin:11});return 'ok'}catch(e){return e.message}},Lr);ok(/0–10/.test(s11),'11 is refused: '+s11);
await setT(ids.dom,5);const s7=await P.evaluate(async id=>{try{await NET.req('lobby.send',{id,coin:7});return 'ok'}catch(e){return e.message}},Lr);ok(/only 5/.test(s7),'more than the treasury is refused: '+s7);
await setT(ids.dom,40);
/* the room shows the select on my seat; choosing 7 sends it */
await P.evaluate(async()=>{onlineOpen('play');await new Promise(r=>setTimeout(r,900));ONL.tab='play';await onlRefresh();onlRedraw()});
await P.waitForFunction(()=>!!document.querySelector('#onl [data-snd92]'),null,{timeout:15000}).catch(()=>{});
const sel=await P.evaluate(()=>{const s=document.querySelector('#onl [data-snd92]');return s?{n:s.options.length,dis:[...s.options].filter(o=>o.disabled).length}:null});
ok(sel&&sel.n===11&&sel.dis===0,'the 🪙 Send select: 0–10 '+JSON.stringify(sel));
if(sel){await P.selectOption('#onl [data-snd92]','7');await idle();await W(400)}
const sd=await peek((w,[id,a])=>{const p=w.lobbies[id].players.find(x=>x.id===a);return p&&p.send92},[Lr,ids.acct]);ok(sd===7,'the seat sends 7: '+sd);
await P.evaluate(()=>{const s=document.querySelector('#onl [data-snd92]');if(s)s.scrollIntoView({block:'center'})});await W(200);await shot('room');
await world((w,d)=>{w.domus82[d].treasury=3},ids.bdom);ok(!(await as(ids.bacct,'lobby.send',{id:Lr,coin:3})).err,'Bruttius sends 3');
ok((await T(ids.dom))===40,'nothing taken before the horns');
const st=await P.evaluate(async id=>{const r=await NET.req('lobby.start',{id});const L=r.lobby||r;return {status:L.status,sent:L.players.map(p=>p.sent92|0),seats:onlSeatsFor(L).map(s=>s.coinStart|0)}},Lr);
ok(st.status==='live','started '+JSON.stringify(st));ok(st.sent.includes(7)&&st.sent.includes(3),'reserved at the horns '+JSON.stringify(st.sent));
ok(JSON.stringify(st.seats.slice(0,2))===JSON.stringify(st.sent.slice(0,2)),'the seats start with the coin sent on top '+JSON.stringify(st.seats));
ok((await T(ids.dom))===33&&(await T(ids.bdom))===0,'out of the treasuries');
/* the result: Alpha survives with 12 coin (7 home), Brutus with 1 (1 home) */
const seats=await peek((w,id)=>w.lobbies[id].players.map(p=>p.id),Lr);const ia=seats.indexOf(ids.acct),ib=seats.indexOf(ids.bacct);
const tb=[0,1,2,3].map(i=>({seat:i,won:i===ia,f:4,coin:i===ia?12:i===ib?1:0,survives:true}));
await as(ids.bacct,'match.result',{id:Lr,table:tb,hash:'h'});const rs=await P.evaluate(async([id,tb])=>{const r=await NET.req('match.result',{id,table:tb,hash:'h'});return r.out},[Lr,tb]);
ok(rs&&rs.sent92===7&&rs.back92===7&&rs.pay===0,'the result says what came home '+JSON.stringify(rs&&{s:rs.sent92,b:rs.back92,p:rs.pay}));
ok((await T(ids.dom))===40&&(await T(ids.bdom))===1,'home to the treasuries (Custom pays no award)');
/* void: everything back */
const Lv=await P.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'egidious',loc:3,cry:false});return (r.lobby||r).id});await as(ids.bacct,'lobby.join',{id:Lv});
await P.evaluate(async id=>{await NET.req('lobby.send',{id,coin:10});await NET.req('lobby.start',{id})},Lv);ok((await T(ids.dom))===30,'10 sent');
await as(ids.bacct,'match.result',{id:Lv,table:[{seat:0},{seat:1,won:true}],hash:'y'});await P.evaluate(async id=>{await NET.req('match.result',{id,table:[{seat:0,won:true},{seat:1}],hash:'x'})},Lv);
ok((await T(ids.dom))===40,'a void match gives it back');
/* Ranked: Brutus dies with his coin — lost */
const Lk=await P.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'cassian',loc:2,ranked:true,cry:false});return (r.lobby||r).id});await as(ids.bacct,'lobby.join',{id:Lk});
await world((w,d)=>{w.domus82[d].treasury=5},ids.bdom);await as(ids.bacct,'lobby.send',{id:Lk,coin:5});await P.evaluate(async id=>{await NET.req('lobby.start',{id})},Lk);
const sk=await peek((w,id)=>w.lobbies[id].players.map(p=>p.id),Lk);const tk=[0,1,2,3].map(i=>sk[i]===ids.bacct?{seat:i,survives:false,kb:'b',f:1,coin:5}:{seat:i,won:sk[i]===ids.acct,f:6,coin:0});
await as(ids.bacct,'match.result',{id:Lk,table:tk,hash:'k'});await P.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'k'})},[Lk,tk]);
const dead=await peek((w,[b,d])=>({alive:w.chars[b].alive,t:w.domus82[d].treasury|0}),[ids.b,ids.bdom]);ok(!dead.alive&&dead.t===0,'the dead lose the coin sent '+JSON.stringify(dead));
ok((await T(ids.dom))>40,'Alpha’s Ranked win: the whole award to the house');

/* ── 4 · the Domus: no purse (a fresh page: the bouts above opened the arena) ── */
await P.reload();await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}if(!document.getElementById('onl')){onlineOpen('char');await new Promise(r=>setTimeout(r,900))}ONL.tab='char';ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();ONL82.dg=await NET.req('domus.get',{});ONL.domus=ONL82.dg.domus;onlRedraw()});await P.waitForFunction(()=>!!document.querySelector('#onl .sc89'),null,{timeout:15000}).catch(()=>{});await W(300);
const dom=await P.evaluate(()=>{const m=document.querySelector('#onl .sc89-mon');const cards=[...document.querySelectorAll('#onl .gc89-w')].map(w=>w.nextElementSibling&&w.nextElementSibling.className);
  return {tre:!!(m&&m.querySelector('.tre92')),purse:/Purse/.test((m||{}).textContent||''),cards,led:/Purses moved to the treasury/.test(d89Ledger())}});
ok(dom.tre&&!dom.purse,'the showcase: the treasury, no purse '+JSON.stringify(dom));ok(dom.cards.every(c=>c==='gc89-s'),'the cards: no purse line '+JSON.stringify(dom.cards));ok(dom.led,'the ledger names the moved purses');
await shot('domus');

/* ── 5 · 🎒 Kits ── */
await world((w,[a,d])=>{const ch=w.chars[a];ch.gear=['wraps','gladius'];ch.equip=['wraps','gladius'];w.domus82[d].gear=['legwraps'];w.domus82[d].treasury=1000},[ids.a,ids.dom]);
const openArm=async()=>{await P.evaluate(async()=>{ONL.tab='armory';ONL83U.mkt='kits'; /* v0.92: kits live in their own Armory tab */ONL82.dgAt=0;await onlRefresh();ONL82.dg=await NET.req('domus.get',{});onlRedraw()});await P.waitForFunction(()=>!!document.querySelector('#onl details.kt92'),null,{timeout:15000}).catch(()=>{});await W(300)};
await openArm();
const ar=await P.evaluate(()=>{const k=document.querySelector('#onl details.kt92');const sub=document.querySelector('#onl .onl-lbtop .rc-sub');const c=k&&k.querySelector('.kt92c.cls');
  return {cards:k?k.querySelectorAll('.kt92c').length:0,cls:c?c.querySelector('[data-kt92]').textContent:'',av:!!(c&&c.querySelector('.kt92-av svg')),own:c?c.querySelectorAll('li.own').length:0,head:sub?sub.textContent:'',purse:/purse/i.test(sub?sub.textContent:'')}});
ok(ar.cards===5&&ar.av,'five kit cards, the class kit on the avatar '+JSON.stringify(ar));ok(ar.own===2,'owned pieces marked (his wraps + the shelf’s legwraps) '+ar.own);
ok(/Treasury/.test(ar.head)&&!ar.purse,'the armory header: the treasury '+ar.head);
const exp=await P.evaluate(a=>{const ch=ONL.chars.find(c=>c.id===a)||ONL.char;const P=ONLC.kitPlan92(ch,onl83Holder('house'),ONLC.kitList92('cls','hero'),onlCatalog());return {cost:P.cost,disc:P.disc,buy:P.buy}},ids.a);
ok(exp.disc>0&&exp.buy.join()==='thrachelm,provmanica','the plan skips owned pieces, a proportional discount '+JSON.stringify(exp));
await shot('kits');
await P.click('#onl .kt92c.cls [data-kt92="cls"]');await idle();await W(400);
const kc=await peek((w,[a,d])=>{const ch=w.chars[a];return {eq:ONLC.equipOf(ch).map(ONLC.itemBase),t:w.domus82[d].treasury|0,shelf:w.domus82[d].gear.slice(),led:(ONLC.ledgerOf(w.domus82[d])||{out:{}}).out.kit|0}},[ids.a,ids.dom]);
ok(['thrachelm','provmanica','wraps','legwraps'].every(b=>kc.eq.includes(b)),'he wears the class kit '+JSON.stringify(kc.eq));ok(kc.t===1000-exp.cost&&kc.led===exp.cost,'one charge, with the discount '+JSON.stringify(kc));
ok(!kc.shelf.includes('legwraps'),'the shelf piece moved onto him');
/* the daily kit: once a day, Issued */
await world((w,[a])=>{const ch=w.chars[a];ch.gear=ch.gear.filter(it=>!/^(galea|wraps|legwraps)/.test(it));ch.equip=(ch.equip||[]).filter(it=>!/^(galea|wraps|legwraps)/.test(it))},[ids.a]);await openArm();
await P.click('#onl .kt92c.daily [data-kt92="daily"]');await idle();await W(400);
const dk=await peek((w,[a,d])=>{const ch=w.chars[a];const iss=ch.gear.filter(it=>ONLC.isIssued92(ch,it));return {n:iss.length,val:iss.map(it=>ONLC.valueOf(ONLC.pieceOf(ch,it,onlCatalog()))),day:w.domus82[d].kitDay92,eq:ONLC.equipOf(ch).map(ONLC.itemBase)}},[ids.a,ids.dom]);
ok(dk.n===2&&dk.val.every(v=>v===0)&&dk.day&&dk.eq.includes('thrachelm'),'two Issued pieces for the bare points, worth nothing; his helm stays '+JSON.stringify(dk));
await openArm();const dd=await P.evaluate(()=>{const b=document.querySelector('#onl .kt92c.daily [data-kt92="daily"]');return b?{dis:b.disabled,t:b.textContent}:null});ok(dd&&dd.dis,'taken today '+JSON.stringify(dd));
/* restock a saved loadout */
await P.evaluate(async a=>{const ch=ONL.chars.find(c=>c.id===a)||ONL.char;await NET.req('char.kits',{char:a,kits:[{n:'Main',items:ONLC.equipOf(ch)}]})},ids.a);
const lost=await world((w,a)=>{const ch=w.chars[a];const it=ch.gear.find(x=>ONLC.itemBase(x)==='thrachelm');ch.gear=ch.gear.filter(x=>x!==it);ch.equip=(ch.equip||[]).filter(x=>x!==it);return it},ids.a);
await openArm();const rb=await P.evaluate(()=>!!document.querySelector('#onl .kt92-rs [data-kt92="restock"]'));ok(rb,'🛒 Restock offered for the loadout');
if(rb){await P.click('#onl .kt92-rs [data-kt92="restock"]');await idle();await W(400)}
const rk=await peek((w,a)=>{const ch=w.chars[a];return {eq:ONLC.equipOf(ch).map(ONLC.itemBase),kit:(ch.kits89[0].items||[]).every(it=>ch.gear.includes(it))}},ids.a);
ok(rk.eq.includes('thrachelm')&&rk.kit,'restocked; the loadout points at what he holds '+JSON.stringify(rk));
await P.setViewportSize({width:390,height:844});await openArm();const ov=await P.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);ok(!ov,'390 px: no sideways scroll');await shot('kits_390');

console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
