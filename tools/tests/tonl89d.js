/* v0.89 THE ONLINE DOMUS, REBUILT (175-v89domus, part H) through the MOCK server: the banner (🏆 Trophies on top, the treasury with its
   ledger ⓘ, no purses), the showcase (weapons in full, the avatar, the purse, the stake), the equipment bar (click and drag to wear, drag
   back to take off, the compare line "+N AP … · replaces X"), the offerings tab (shelf ↔ satchel), the class change for 100 coin from the
   treasury (refused in a room), the look locked, tester grants into the house (treasury + shelf), the ledger by source and by gladiator,
   keep home (out of a Ranked kit, in a Custom one), repair from the bar, saved loadouts, the memorial wall, colours + crest, the upgrades
   (5th slot), and phones (390x844, 844x390). SHOT=<dir> saves d89_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0);
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester)|^flavius_dombar89/.test(k))localStorage.removeItem(k)});await P.reload();await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const W=ms=>P.waitForTimeout(ms);
const shot=async n=>{if(!SHOT)return;await P.screenshot({path:path.join(SHOT,`d89_${n}.png`)})};
const world=(fn,arg)=>P.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const peek=(fn,arg)=>P.evaluate(([fn,arg])=>(0,eval)('('+fn+')')(mockLoad(),arg),[fn.toString(),arg]);
const open=async()=>{await P.evaluate(async()=>{if(!document.getElementById('onl')){onlineOpen('char');await new Promise(r=>setTimeout(r,900))}ONL.tab='char';ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw()});await W(400)};
const idle=()=>P.waitForFunction(()=>!ONL.busy,null,{timeout:15000}).then(()=>W(250)).catch(()=>{});
const tile=k=>P.evaluate(k=>{const B=V89D.bar||[];const i=B.findIndex(x=>ONLC.itemBase(x.it)===k);return i<0?null:`#onl .dom89 [data-p89="${i}"]`},k);
const center=async sel=>{const r=await P.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'nearest'});const b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}},sel);return r};
const drag=async(from,to)=>{const a=await center(from);const z=await center(to);if(!a||!z)return false;await P.mouse.move(a.x,a.y);await P.mouse.down();await P.mouse.move(a.x+12,a.y-8,{steps:3});
  const c=await center(to);await P.mouse.move(c.x,c.y,{steps:8});await P.mouse.up();return true};

/* a house: Alpha (hero, Leather Greaves + a helm) and Beta (an unworn axe); the shelf: Ocrea, Lorica, a Falcata, a broken Cassis; offerings */
const ids=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Vettius'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;
  const a=await NET.req('char.create',{name:'Alpha',cls:'hero'});const b2=await NET.req('char.create',{name:'Beta',cls:'soldier'});return {a:a.id,b:b2.id,dom:ONL.domus.id,acct:ONL.acct.id}});
await world((w,[a,b,dom])=>{const ch=w.chars[a];ch.wallet=377;ch.gear=['galea','lgreaves'];ch.equip=['galea','lgreaves'];ch.offers=['elix2'];w.chars[b].gear=['axe'];w.chars[b].equip=[];
  const D=w.domus82[dom];D.treasury=2210;D.gear=['ocrea','lorica','falcata','cassis'];D.offers=['merc1','cf1'];ONLC.breakItem(D,'cassis');
  D.trophies=[{k:'first:democritus',n:ONLC.trophyName('first:democritus'),at:Date.now(),glad:ch.name,x:1}]},[ids.a,ids.b,ids.dom]);
await P.evaluate(async id=>{await NET.req('char.active',{char:id})},ids.a);await open();

/* ── 1 · the layout ── */
const L1=await P.evaluate(()=>{const o=document.getElementById('onl');const q=s=>o.querySelector(s);const ban=q('.db89');
  return {ban:!!ban,tro:!!q('.db89 [data-d89="tro"]'),tre:(q('.db89-tre')||{}).textContent||'',banTxt:ban?ban.textContent:'',show:(q('.sc89 .sc89-n')||{}).textContent||'',purse:(q('.sc89 .mon89')||{}).textContent||'',
    stake:(q('.sc89 .stk89')||{}).textContent||'',wp:o.querySelectorAll('.sc89 .wp89').length,wcard:o.querySelectorAll('.sc89 .wp89 .cimg').length,av:!!q('.sc89 .av89 svg'),
    tiles:o.querySelectorAll('.eb89 [data-p89]').length,cards:o.querySelectorAll('.gc89-row .gc89').length,act:(q('.gc89.act b')||{}).textContent||'',
    editors:o.querySelectorAll('[data-onlgp],[data-onlgt],[data-onl="gcls"],[data-onl="grlook"],input[type=checkbox][data-sr82eq],#sr82').length,rb:!!q('.rb82'),
    buy:o.querySelectorAll('.dom89 [data-onl82="buy"],.dom89 [data-onl83="dbuy"],.dom89 .buy83').length}});
ok(L1.ban&&L1.tro&&/Treasury/i.test(L1.tre)&&/2,?210/.test(L1.tre),'the banner: 🏆 Trophies, the treasury '+JSON.stringify(L1.tre));ok(!/377/.test(L1.banTxt),'no gladiator purse on the banner');
ok(/Alpha/.test(L1.show)&&/377/.test(L1.purse),'the showcase: Alpha and his purse');ok(L1.wp===2&&L1.wcard>=1&&L1.av,'weapon cards in full + the avatar '+JSON.stringify([L1.wp,L1.wcard,L1.av]));
ok(/stake/i.test(L1.stake),'the Ranked stake');ok(L1.tiles===5,'the Gear bar: the shelf (4) + Beta’s unworn axe = 5, got '+L1.tiles);
ok(L1.cards===4&&/Alpha/.test(L1.act),'four gladiator cards, Alpha active '+JSON.stringify([L1.cards,L1.act]));ok(L1.editors===0,'no look editors, no checkboxes, no old Storeroom ('+L1.editors+')');ok(L1.rb,'the rank bar stays');ok(L1.buy===0,'no buying in the Domus');
await shot('desk_1400');
/* the compare line: Ocrea over Leather Greaves */
const cmp=await P.evaluate(()=>{const B=V89D.bar;const i=B.findIndex(x=>x.it==='ocrea');const t=document.querySelector(`#onl [data-p89="${i}"] .cm89`);return t?t.textContent:''});
ok(/\+1 AP each leg/.test(cmp)&&/replaces Leather Greaves/.test(cmp),'compare: '+cmp);
const cmpB=await P.evaluate(()=>{const B=V89D.bar;const i=B.findIndex(x=>/^cassis/.test(x.it));const t=document.querySelector(`#onl [data-p89="${i}"]`);return {why:t?t.querySelector('.cm89').textContent:'',rep:!!(t&&t.querySelector('[data-d89rep]')),no:!!(t&&t.classList.contains('no89')),brk:!!(t&&t.querySelector('.crk89'))}});
ok(/Broken/.test(cmpB.why)&&cmpB.rep&&cmpB.no&&cmpB.brk,'a broken piece: cracked, dimmed, 🔨 '+JSON.stringify(cmpB));
/* hover: the large card + the compare */
{const s=await tile('ocrea');await P.hover(s);await W(250);const hv=await P.evaluate(()=>{const f=document.getElementById('cmp89');return f&&!f.hidden?f.textContent:''});ok(/Fits Alpha/.test(hv)&&/replaces Leather Greaves/.test(hv),'the hover card: '+hv.slice(0,120))}

/* ── 2 · click to wear: the Ocrea; the Leather Greaves go to the shelf ── */
await P.click(await tile('ocrea'));await idle();
let A=await peek((w,a)=>({eq:ONLC.equipOf(w.chars[a]),gear:w.chars[a].gear,shelf:Object.values(w.domus82)[0].gear}),ids.a);
ok(A.eq.includes('ocrea')&&!A.gear.includes('lgreaves')&&A.shelf.includes('lgreaves')&&!A.shelf.includes('ocrea'),'click: Ocrea on, Leather Greaves → the shelf '+JSON.stringify(A));
/* ── 3 · drag onto the avatar: the Lorica ── */
ok(await drag(await tile('lorica'),'#onl .sc89 .av89'),'drag started');await idle();
A=await peek((w,a)=>({eq:ONLC.equipOf(w.chars[a])}),ids.a);ok(A.eq.includes('lorica'),'drag onto the avatar: Lorica on '+JSON.stringify(A.eq));
/* drag a weapon onto the right hand */
ok(await drag(await tile('falcata'),'#onl .sc89 .wp89[data-dz89="wR"]'),'weapon drag');await idle();
A=await peek((w,a)=>({eq:ONLC.equipOf(w.chars[a])}),ids.a);ok(A.eq.includes('falcata'),'drag onto a hand: Falcata on '+JSON.stringify(A.eq));
ok(await P.evaluate(()=>/Falcata/.test((document.querySelector('#onl .sc89 .wp89[data-dz89="wR"]')||{}).textContent||'')),'the Falcata in the right hand');
/* drag the Lorica back to the bar: off */
ok(await drag('#onl .sc89 [data-d89off="lorica"]','#onl .eb89'),'drag off');await idle();
A=await peek((w,a)=>({eq:ONLC.equipOf(w.chars[a]),shelf:Object.values(w.domus82)[0].gear}),ids.a);ok(!A.eq.includes('lorica')&&A.shelf.includes('lorica'),'drag back to the bar: Lorica → the shelf');
/* click a worn piece: off */
await P.click('#onl .sc89 [data-d89off="falcata"]');await idle();A=await peek((w,a)=>({eq:ONLC.equipOf(w.chars[a])}),ids.a);ok(!A.eq.includes('falcata'),'click a worn weapon: off');
/* from another gladiator: Beta's unworn axe */
await P.click(await tile('axe'));await idle();A=await peek((w,[a,b])=>({eq:ONLC.equipOf(w.chars[a]),beta:w.chars[b].gear}),[ids.a,ids.b]);ok(A.eq.includes('axe')&&!A.beta.includes('axe'),'a piece from Beta: moved and worn '+JSON.stringify(A));

/* ── 4 · offerings: shelf → satchel (click), satchel → shelf (drag) ── */
await P.click('#onl [data-eb89="offs"]');await W(150);ok(await P.evaluate(()=>!document.querySelector('#onl [data-eb89p="offs"]').hidden&&document.querySelector('#onl [data-eb89p="gear"]').hidden),'the Offerings tab');
await P.click('#onl [data-d89of="0"]');await idle();A=await peek((w,a)=>({off:w.chars[a].offers,shelf:Object.values(w.domus82)[0].offers}),ids.a);ok(A.off.includes('merc1')&&!A.shelf.includes('merc1'),'shelf → satchel '+JSON.stringify(A));
ok(await drag('#onl .sat89 [data-d89so="0"]','#onl .eb89'),'satchel drag');await idle();A=await peek((w,a)=>({off:w.chars[a].offers,shelf:Object.values(w.domus82)[0].offers}),ids.a);ok(!A.off.includes('elix2')&&A.shelf.includes('elix2'),'satchel → shelf by drag '+JSON.stringify(A));
await P.click('#onl [data-eb89="gear"]');await W(150);

/* ── 5 · the class: 100 coin from the treasury; refused in a room ── */
await P.click('#onl [data-d89="cls"]');await W(250);ok(await P.evaluate(()=>document.querySelectorAll('.cls89pop [data-cls89]').length>=8),'the class popup');await shot('class_pop');
await P.click('.cls89pop [data-cls89="soldier"]');await idle();
A=await peek((w,[a,dom])=>({cls:w.chars[a].cls,t:w.domus82[dom].treasury,led:ONLC.ledgerOf(w.domus82[dom])}),[ids.a,ids.dom]);ok(A.cls==='soldier'&&A.t===2110&&A.led.out.class===100,'class changed for 100 from the treasury '+JSON.stringify([A.cls,A.t]));
const inRoom=await P.evaluate(async id=>{const L=await NET.req('lobby.create',{ev:'cassian',cry:false});let r='';try{await NET.req('char.class',{char:id,cls:'hero'})}catch(e){r=e.code||e.message}await NET.req('lobby.leave',{id:(L.lobby||L).id});return r},ids.a);ok(inRoom==='in_match','refused while in a room ('+inRoom+')');
/* the look is locked */
const lk=await P.evaluate(async id=>{try{await NET.req('char.edit',{char:id,look:{color:'#010203',token:{sc:1,c1:'#00ff00'}}});return 'ok'}catch(e){return e.message}},ids.a);
const lk2=await P.evaluate(async id=>{try{await NET.req('char.edit',{char:id,look:{color:'#040506',token:{sc:1,c1:'#ff00ff'}}});return 'ok'}catch(e){return e.message}},ids.a);
ok(/look is set/.test(lk2),'the look is locked after creation ('+lk+' / '+lk2+')');

/* ── 7 · keep home: never in a Ranked kit ── */
await P.click('#onl .sc89 [data-d89homew="galea"]');await idle();
const hk=await P.evaluate(async()=>{const it=ONLC.equipOf(ONL.char).find(x=>/^galea/.test(x));const R=await NET.req('lobby.create',{ev:'cassian',ranked:true,cry:false});const LR=R.lobby||R;const kr=LR.players[0].kit.items;await NET.req('lobby.leave',{id:LR.id});
  const C2=await NET.req('lobby.create',{ev:'cassian',cry:false});const LC=C2.lobby||C2;const kc=LC.players[0].kit.items;await NET.req('lobby.leave',{id:LC.id});return {it,home:ONLC.isHome(ONL.char,it),kr,kc}});
ok(hk.home&&!hk.kr.includes(hk.it)&&hk.kc.includes(hk.it),'kept home: out of the Ranked kit, in the Custom one '+JSON.stringify(hk));
ok(await P.evaluate(()=>!!document.querySelector('#onl .sc89 .hm89.on')),'the 🔒 shows on the worn piece');
/* ── 6 · tester grants into the house; the ledger ⓘ ── */
await P.evaluate(()=>localStorage.setItem('flavius_onltester83','1'));
const g=await P.evaluate(async()=>{const r=await NET.req('admin.grant',{coin:300,gear:['manica'],offering:['ap2']});return {w:(r.char||{}).wallet,t:r.domus.treasury,gear:r.gear,offs:r.offers,cg:(r.char||{}).gear}});
ok(g.w===377&&g.t===2410&&g.gear.includes('manica')&&!(g.cg||[]).includes('manica')&&g.offs.includes('ap2'),'grant: coin → treasury, gear + offering → the shelf '+JSON.stringify(g));
/* a settled Ranked bout (the mock's settlement step) and a death: the cut by gladiator, the memorial */
await world((w,[a,b])=>{const L={id:'Lx',ev:'cassian',loc:3,ranked:true,players:[{id:'me',char:a,name:'Alpha'},{id:'k',char:'zz',name:'Spiculus'},{id:'me2',char:b,name:'Beta'}]};
  mockAfter83(w,L,{},'me',0,{won:true,survives:true},{cut:7,pay:28,award:35},{left:[]});
  w.chars[b].alive=false;w.chars[b].died={rank:'tiro',at:Date.now()};mockAfter83(w,L,{},'me2',2,{won:false,survives:false,kb:'g',ks:1},{died:true},{left:[]})},[ids.a,ids.b]);
await open();
await P.hover('#onl [data-d89="led"]');await W(250);
const led=await P.evaluate(()=>{const f=document.getElementById('led89');return f&&!f.hidden?f.textContent:''});
ok(/Tester grants/.test(led)&&/300/.test(led)&&/Class changes/.test(led)&&/cut/.test(led)&&/Alpha/.test(led)&&/since v0\.89/.test(led),'the ledger ⓘ: by source + by gladiator '+led.slice(0,200));
await shot('ledger');await P.mouse.move(5,5);await P.click('#onl .sc89-n');await W(100);
const mw=await P.evaluate(()=>(document.querySelector('#onl .mw89')||{}).textContent||'');ok(/Beta/.test(mw)&&/Spiculus/.test(mw)&&/D·M/.test(mw),'the memorial wall: '+mw.slice(0,160));

/* ── 8 · repair from the bar (the treasury pays) ── */
const t0=await peek((w,dom)=>w.domus82[dom].treasury,ids.dom);const rc=await P.evaluate(()=>{const x=(V89D.bar||[]).find(x=>/^cassis/.test(x.it));return x?ONLC.repairCost(x.I):0});
await P.click(await P.evaluate(()=>{const i=(V89D.bar||[]).findIndex(x=>/^cassis/.test(x.it));return `#onl [data-d89rep="${i}"]`}));await idle();
A=await peek((w,dom)=>{const D=w.domus82[dom];const it=D.gear.find(x=>/^cassis/.test(x));return {t:D.treasury,brk:ONLC.isBroken(D,it),rep:ONLC.ledgerOf(D).out.repair}},ids.dom);ok(rc>0&&A.t===t0-rc&&!A.brk&&A.rep===rc,'repaired from the bar '+JSON.stringify([rc,t0,A]));

/* ── 9 · loadouts: save what he wears, take a piece off, wear the loadout again ── */
await P.click('#onl [data-d89="kitsave"]');await W(200);await P.fill('#ask89i','Ranked');await P.click('.kit89pop [data-ask89="ok"]');await idle();
A=await peek((w,a)=>({k:w.chars[a].kits89,eq:ONLC.equipOf(w.chars[a])}),ids.a);ok(A.k&&A.k[0]&&A.k[0].n==='Ranked'&&A.k[0].items.length===A.eq.length,'the loadout saved '+JSON.stringify(A.k));
await P.click('#onl .sc89 [data-d89off="ocrea"]');await idle();ok(!(await peek((w,a)=>ONLC.equipOf(w.chars[a]),ids.a)).includes('ocrea'),'the Ocrea off');
await P.click('#onl [data-d89kit="0"]');await idle();ok((await peek((w,a)=>ONLC.equipOf(w.chars[a]),ids.a)).includes('ocrea'),'▶ the loadout puts it back');

/* ── 10 · colours + crest ── */
await P.evaluate(()=>{const d=document.querySelector('#onl [data-fd89="look"]');d.open=true});await W(150);await P.click('#onl [data-crest89="wolf"]');await W(200);await P.click('#onl [data-d89="look"]');await idle();
A=await peek((w,dom)=>w.domus82[dom].look89,ids.dom);ok(A&&A.crest==='wolf'&&/^#[0-9a-f]{6}$/.test(A.c1),'colours + crest saved '+JSON.stringify(A));
ok(await P.evaluate(()=>/^data:image/.test((document.querySelector('#onl .db89-crest')||{}).src||'')&&!!document.querySelector('#onl .db89').style.getPropertyValue('--hc1')),'the banner wears them');
/* ── 11 · upgrades: the fifth slot ── */
await P.evaluate(()=>{const d=document.querySelector('#onl [data-fd89="upg"]');d.open=true});await W(150);await P.click('#onl [data-upg89="slot5"]');await idle();
A=await peek((w,dom)=>({u:w.domus82[dom].upg89,t:w.domus82[dom].treasury}),ids.dom);ok(A.u&&A.u.slot5,'the fifth slot built '+JSON.stringify(A));
const five=await P.evaluate(async()=>{for(const n of ['Gamma','Delta','Epsilon','Zeta'])await NET.req('char.create',{name:n,cls:'slave'}).catch(()=>null);let r='';try{await NET.req('char.create',{name:'Eta',cls:'slave'})}catch(e){r=e.message}return r});
await open();const nC=await P.evaluate(()=>document.querySelectorAll('#onl .gc89-row .gc89:not(.empty)').length);ok(/Up to 5/.test(five)&&nC===5,'five living gladiators, no sixth ('+five+', '+nC+')');
await shot('desk_full');
/* ── 12 · phones ── */
for(const [vw,vh,n] of [[390,844,'phone_390'],[844,390,'phone_land']]){await P.setViewportSize({width:vw,height:vh});await W(400);await P.evaluate(()=>onlRedraw());await W(300);
  const ph=await P.evaluate(()=>{const r=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect():null};const mb=document.querySelector('#mBody');const sc=r('#onl .sc89'),bar=r('#onl .eb89'),gc=r('#onl .gc89-row');
    return {wide:mb?mb.scrollWidth-mb.clientWidth:0,sc:!!sc&&sc.width<=window.innerWidth+1,order:!!(sc&&bar&&gc)&&sc.top<bar.top&&bar.top<gc.top,av:r('#onl .av89 svg')?r('#onl .av89 svg').width:0,tile:r('#onl .pt89')?r('#onl .pt89').width:0}});
  ok(ph.wide<=2&&ph.sc&&ph.order&&ph.av>50&&ph.tile>80,n+': fits, no squash '+JSON.stringify(ph));
  if(ph.wide>2)console.log('DBG',await P.evaluate(()=>{const mb=document.querySelector('#mBody');const W=mb.getBoundingClientRect().right;const out=[];for(const e of mb.querySelectorAll('*')){const r=e.getBoundingClientRect();if(r.right>W+1&&r.width>0)out.push(String(e.className&&e.className.baseVal===undefined?e.className:e.tagName)+':'+Math.round(r.right-W))}let e=document.querySelector('#onl .gc89-row');const anc=[];while(e&&e.id!=='mBody'){const r=e.getBoundingClientRect();anc.push((e.className||e.id||e.tagName)+':'+Math.round(r.width)+':'+getComputedStyle(e).display+':'+e.scrollWidth);e=e.parentElement}return JSON.stringify(anc)}));
  await P.evaluate(()=>{const e=document.querySelector('#onl .sc89');if(e)e.scrollIntoView()});await W(150);await shot(n);await P.evaluate(()=>{const e=document.querySelector('#onl .eb89');if(e)e.scrollIntoView()});await W(150);await shot(n+'_bar')}
console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
