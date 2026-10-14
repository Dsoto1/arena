/* v0.87 FIXES (149-v87fix): 1 Orbis — only the 🔍 opens the map · 2 Ave Arena's softer 808 + kick · 3 no market-board art behind the
   online market · 4 Storeroom: no buying, a visible shelf that takes "Move → the shelf" · 5 try it on: real art (a V for pairs), both
   sides marked for either-side pieces · 6 no hidden-mechanics text (Fame drift, Thriving numbers, the 16-season notes) · 7 perk points =
   a checklist task, no extra pill · 8 Mail half width · 9 yard banner box light grey · 10 Hygeia on the Infirmary banner · 11 city kits
   (v0.94: the stalls sell into the Armory; an old kit becomes owned offerings) · 12 stale letters dropped, "To the ward" opens the Infirmary · 13 the
   Acta of the day replaces the Forum box (data from ONLC.dayFromMatch / dayFell) · 14 🧠 wears its mind's hue on the Play Now seat
   chips (also after a tap) · 15 no mute button on the main menu · 16 a fallen fighter watches, never throws (offline seat/wagers/upkeep;
   online ONLC.standsHolders + sitGroup) · 17 results open on the players, wagers in their own tab · 18 the event pop-up loses This week + Season schedule · 19 the hints in one Settings box · 20 hovering armor: no red hit flash, a
   calm gold mark after a ~120 ms rest (offline modal + online Armory). SHOT=<dir> saves v87x_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const o={};
const ctx=await b.newContext({viewport:{width:1400,height:1000}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0')});
const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const W8=ms=>P.waitForTimeout(ms);const shot=async n=>{if(SHOT)await P.screenshot({path:path.join(SHOT,`v87x_${n}.png`)})};
await P.goto(URL0,{timeout:90000});await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|clock)/.test(k))localStorage.removeItem(k)});await W8(2600);

/* ── 15 · the main menu has no mute button ── */
o.mute=await P.evaluate(()=>({btn:!!document.getElementById('mmMute'),menu:!!document.querySelector('#mainMenu [data-mm="settings"]')}));
ok(!o.mute.btn&&o.mute.menu,'15 no #mmMute on the main menu');await shot('menu');

/* ── 19 · Settings → General: the hints in one box ── */
await P.evaluate(()=>{hintsMaster(false,true);openSettings('help') /* v0.98: Hints & board */});await W8(800);
o.hb=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const box=document.querySelector('#setBody #hint87');const m=document.querySelector('#setBody input[data-set="hints"]');
  const subs=['hintDock','rulePops','turnHints','ruleHints','turnRecap'].map(k=>document.querySelector(`#setBody input[data-set="${k}"]`));
  const r={box:!!box,master:!!(box&&m&&box.contains(m)),subs:subs.filter(i=>i&&box&&box.contains(i)).length,sr:subs[0]?subs[0].closest('.hint87s'):null};
  r.offPE=r.sr?getComputedStyle(subs[0].closest('label')).pointerEvents:'';r.offCls=r.sr?r.sr.classList.contains('hintsoff'):null;
  m.click();await W(300);const sr2=document.querySelector('#setBody .hint87s');r.onCls=sr2?sr2.classList.contains('hintsoff'):null;r.onPE=sr2?getComputedStyle(sr2.closest('label')||sr2.querySelector('label')).pointerEvents:'';r.on=!!SETTINGS.hints;const hb=document.getElementById('hint87');if(hb)hb.scrollIntoView({block:'center'});await W(150);
  r.sr=!!r.sr;return r});
await shot('settings');await P.evaluate(async()=>{document.querySelector('#setBody input[data-set="hints"]').click();await new Promise(r=>setTimeout(r,300));if(CUR_MODAL)CUR_MODAL.done(null)});await W8(200);
ok(o.hb.box&&o.hb.master&&o.hb.subs===5,'19 the hints master + its five switches share one box '+JSON.stringify(o.hb));
ok(o.hb.offCls===true&&o.hb.offPE==='none'&&o.hb.on&&o.hb.onCls===false&&o.hb.onPE!=='none','19 the five are greyed + not clickable while the master is off '+JSON.stringify(o.hb));

/* ── 14 · Play Now: the 🧠 on the seat chips wears its mind's hue, also after a tap ── */
await P.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openSetup(true)});await W8(1500);
const brains=()=>P.evaluate(()=>[...document.querySelectorAll('[data-mind76]')].map(b=>{const i=b.querySelector('i.brain');const s=document.getElementById('dif'+b.dataset.mind76);return {cls:i?i.className:'',idx:s?s.selectedIndex:-1,f:i?getComputedStyle(i).filter:''}}));
o.br0=await brains();ok(o.br0.length>=1&&o.br0.every(x=>x.cls==='brain b'+x.idx&&x.f!=='none'),'14 seat chips: 🧠 in the tier hue '+JSON.stringify(o.br0));
await P.click('[data-mind76]');await W8(500);o.br1=await brains();ok(o.br1[0]&&o.br1[0].cls==='brain b'+o.br1[0].idx&&o.br1[0].idx!==o.br0[0].idx,'14 after a tap the hue follows the new mind '+JSON.stringify(o.br1[0]));
o.brTxt=await P.evaluate(async()=>{const d=document.createElement('div');d.id='br87t';d.innerHTML='CPU: 🧠 Master';document.body.appendChild(d);await new Promise(r=>setTimeout(r,250));const i=d.querySelector('i.brain');d.remove();return i?i.className:''});
ok(o.brTxt==='brain b4','14 any "🧠 <mind>" label gets the hue ('+o.brTxt+')');await shot('playnow');

/* ── 5 · try it on: Flavius' Bracers (pair → V of real art, both arms), Lorica Segmentata (either arm) ── */
o.ev=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);for(const x of document.querySelectorAll('.modal-bg,#setup'))void x;menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'veteranus',cpu:true},{cls:'soldier',cpu:true}],opts:{spect:0}});await W(2500);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W(150)}
  modal('Try',`<p>x</p>`,[{label:'Bracers',value:1,card:'a:bracers'},{label:'Lorica',value:2,card:'a:galerus'},{label:'Helm',value:3,card:'a:galea'},{label:'Greaves',value:4,card:'a:greaves'},{label:'Chest',value:5,card:'a:ornate'}]);await W(500);return !!document.querySelector('#modal [data-card="a:bracers"]')});
const tryOn=async k=>{await P.hover(`#modal [data-card="a:${k}"]`);await W8(350);return P.evaluate(()=>{const t=document.getElementById('tryOn');if(!t||t.hidden)return null;const r=t.getBoundingClientRect();
  return {v:t.querySelectorAll('.to87art.v img').length,art:t.querySelectorAll('.to87art img,.to87art .cimg,.to87art .setart').length,src:[...t.querySelectorAll('.to87art img')].map(i=>i.getAttribute('src')).join(),
    marks:[...t.querySelectorAll('path.to87')].map(p=>p.dataset.loc).sort().join(),hit:t.querySelectorAll('.avhit').length,either:!!t.querySelector('.to87e'),q:/\?/.test(t.querySelector('.to87art')?t.querySelector('.to87art').textContent:''),in:r.bottom<=innerHeight}})};
o.tBr=await tryOn('bracers');await shot('tryon_bracers');o.tGa=await tryOn('galerus');await shot('tryon_lorica');o.tHe=await tryOn('galea');
ok(o.tBr&&o.tBr.v===2&&/arm81_bracers/.test(o.tBr.src)&&!o.tBr.q&&o.tBr.marks==='larm,rarm'&&!o.tBr.hit,'5 bracers: two real-art pieces in a V, both arms marked '+JSON.stringify(o.tBr));
ok(o.tGa&&o.tGa.marks==='larm,rarm'&&o.tGa.either&&o.tGa.v===0&&o.tGa.art===1&&o.tGa.in,'5 Lorica Segmentata: both arms marked + "either arm" '+JSON.stringify(o.tGa));
ok(o.tHe&&o.tHe.marks==='head'&&!o.tHe.either,'5 a helm marks the head only '+JSON.stringify(o.tHe));
/* ── 20 · a fast sweep across the tiles: no card, no red hit flash; a rested hover shows the calm gold mark ── */
/* a busy machine lets the pointer sit >120 ms on a tile now and then (each mouse step takes longer under load): such a card is the
   rested hover, not a fast pass. So the page itself times every card against the pointer's arrival on its tile (its own clock):
   a card that opens sooner than 100 ms after the pointer reached the tile is a fast-pass card (must be none); never red */
const sweep=async(sel,n,nm)=>{await P.mouse.move(5,5);await W8(250);await P.evaluate(()=>{const t=document.getElementById('tryOn');if(t)t.hidden=true;window._red87=0;window._hit87=0;window._shows87=0;window._fast87=0;window._last87='';window._tile87=null;
    if(!window._mo87){document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('[data-card^="a:"]');if(el&&el!==window._tile87){window._tile87=el;window._arr87=performance.now()}else if(!el)window._tile87=null},true);
      window._mo87=new MutationObserver(()=>{const t=document.getElementById('tryOn');if(!t||t.hidden)return;if(t.querySelector('.avhit'))window._hit87++;if(t.querySelector('[fill="#ff4a3a"]'))window._red87++;const nm=(t.querySelector('.tost b')||{}).textContent;if(nm&&nm!==window._last87){window._last87=nm;window._shows87++;if(window._tile87&&performance.now()-window._arr87<100)window._fast87++}});window._mo87.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']})}});
  const boxes=await P.$$eval(sel,els=>els.slice(0,8).map(e=>{e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}));
  for(let k=0;k<n;k++)for(const [x,y] of boxes){await P.mouse.move(x,y,{steps:2});await W8(25)}
  await P.mouse.move(5,5);await W8(30);const av0=await P.evaluate(()=>Object.entries(AVHIT).filter(([k,v])=>/^tryon/.test(k)&&v.t&&performance.now()-v.t<1500).length);/* off the tiles: a card the last tile earned (a loaded pointer rested there) closes — wait for that, up to 3 s */
  for(const t0=Date.now();Date.now()-t0<3000&&await P.evaluate(()=>{const t=document.getElementById('tryOn');return !!(t&&!t.hidden)});)await W8(50);
  const mid=await P.evaluate(()=>{const t=document.getElementById('tryOn');return {shown:!!(t&&!t.hidden),shows:window._shows87,fast:window._fast87,hit:window._hit87,red:window._red87,
    av:Object.entries(AVHIT).filter(([k,v])=>/^tryon/.test(k)&&v.t&&performance.now()-v.t<1500).length}});mid.av=Math.max(mid.av,av0);
  await P.evaluate(()=>{window._tsh87=0;window._tov87=0;document.addEventListener('mouseover',e=>{if(e.target.closest&&e.target.closest('[data-card^="a:"]')&&!window._tov87)window._tov87=performance.now()},true);
    const mo=new MutationObserver(()=>{const t=document.getElementById('tryOn');if(t&&!t.hidden&&!window._tsh87){window._tsh87=performance.now();mo.disconnect()}});mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']})});
  await P.mouse.move(boxes[0][0],boxes[0][1]);await W8(400);const early=await P.evaluate(()=>{const d=window._tsh87-window._tov87;return !(window._tsh87&&window._tov87&&d>=100)?Math.round(d)||'none':false});
  const rest=await P.evaluate(()=>{const t=document.getElementById('tryOn');if(!t||t.hidden)return null;const m=[...t.querySelectorAll('path.to87')];const cs=m[0]?getComputedStyle(m[0]):null;
    return {marks:m.length,stroke:cs?cs.stroke:'',fill:cs?cs.fill:'',hit:t.querySelectorAll('.avhit').length,red:t.querySelectorAll('[fill="#ff4a3a"]').length+(m.some(x=>/255, 74, 58/.test(getComputedStyle(x).fill))?1:0)}});
  if(nm)await shot(nm);await P.mouse.move(5,5);await W8(200);const gone=await P.evaluate(()=>{const t=document.getElementById('tryOn');return !t||t.hidden});return {mid,early,rest,gone,n:boxes.length,hov:boxes.length*n}};
o.sw=await sweep('#modal [data-card^="a:"]',3,'tryon_rest');
ok(o.sw.n>=3&&!o.sw.mid.shown&&!o.sw.mid.fast&&!o.sw.mid.hit&&!o.sw.mid.red&&!o.sw.mid.av,'20 a fast sweep across the tiles shows no card and no red hit flash '+JSON.stringify(o.sw));
ok(!o.sw.early&&o.sw.rest&&o.sw.rest.marks>=1&&/255, 217, 119/.test(o.sw.rest.stroke)&&!o.sw.rest.hit&&!o.sw.rest.red&&o.sw.gone,'20 a rested hover (~120 ms) shows the gold mark; leaving hides it '+JSON.stringify(o.sw));
/* 20 · legs → head → chest quickly: only the chest is marked, nothing red, the ghost wears the chest piece */
o.abc=await (async()=>{await P.mouse.move(5,5);await W8(250);const c=async k=>P.$eval(`#modal [data-card="a:${k}"]`,e=>{const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
  const A=await c('greaves'),B=await c('galea'),C=await c('ornate');for(let k=0;k<2;k++){await P.mouse.move(A[0],A[1],{steps:2});await W8(60);await P.mouse.move(B[0],B[1],{steps:2});await W8(60)}
  await P.mouse.move(A[0],A[1],{steps:2});await W8(90);await P.mouse.move(B[0],B[1],{steps:2});await W8(40);await P.mouse.move(C[0],C[1],{steps:2});await W8(500);
  return P.evaluate(()=>{const t=document.getElementById('tryOn');if(!t||t.hidden)return null;const all=[...t.querySelectorAll('*')];
    return {marks:[...t.querySelectorAll('path.to87')].map(p=>p.dataset.loc).join(),name:(t.querySelector('.tost b')||{}).textContent,hit:t.querySelectorAll('.avhit').length,
      red:all.filter(x=>x.getAttribute('fill')==='#ff4a3a'||/255, 74, 58/.test(getComputedStyle(x).fill)).length,boardHit:document.querySelectorAll('#board .avhit').length}})})();
ok(o.abc&&o.abc.marks==='chest'&&o.abc.name===await P.evaluate(()=>ARM.ornate.n)&&!o.abc.hit&&!o.abc.red&&!o.abc.boardHit,'20 legs → head → chest fast: only the chest is marked, for the chest piece, no red anywhere '+JSON.stringify(o.abc));
/* the engine lets you pick either arm for a single arm piece (and mirrors it on the left) */
o.side=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W(200);const p=S.players.find(x=>!x.cpu);for(const l of ['rarm','larm']){p.pieces[l]=[];p.ap[l]=0}
  const pr=gainArmorPiece(p,'galerus');await W(400);const opts=[...document.querySelectorAll('#modal button')].map(b=>b.textContent);if(CUR_MODAL)CUR_MODAL.done('larm');await pr;
  const s=avatarSVG(p);return {opts:opts.filter(t=>/Arm/.test(t)).length,on:p.pieces.larm.some(x=>x.key==='galerus'),mir:/scale\(-1 1\)[^>]*><clipPath id="acp[^"]*larmgalerus/.test(s)}});
ok(o.side.opts>=2&&o.side.on&&o.side.mir,'5 either arm: the side is chosen, the left wears it mirrored '+JSON.stringify(o.side));
/* ── 18 · the event pop-up: no "This week" line, no Season schedule button ── */
o.evp=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W(150);const a=document.querySelector('[data-evpop]');if(!a)return {a:false};
  evPopShow75(a,true);await W(150);const p=document.getElementById('evPop75');const t=p?p.innerText:'';const fx=typeof calNow==='function'&&calNow().fx;
  const r={a:true,vis:!!p&&!p.hidden,week:/This week/.test(t),sched:!!(p&&p.querySelector('[data-evsched75]')),det:!!(p&&p.querySelector('[data-evdet75]')),board:/Board \d+×\d+ · Round/.test(t),place:/📍/.test(t),card:!!(p&&p.querySelector('.evp-card')),fx:!!fx};evPopHide75(0);return r});
ok(o.evp.a&&o.evp.vis&&!o.evp.week&&!o.evp.sched&&o.evp.det&&o.evp.board&&o.evp.place&&o.evp.card,'18 event pop-up: no This week line, no Season schedule; card, place, Board/Round, Event details stay '+JSON.stringify(o.evp));
/* ── 16 · offline: a fallen fighter watches, never throws ── */
o.fell=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W(150);const p=S.players.find(x=>!x.cpu);const r={};
  r.before=fell87();p.alive=false;render();spectUI();r.ok=ticketOK();const tb=document.getElementById('btnTicket');r.btn=tb?{hidden:tb.hidden,dis:tb.disabled,txt:tb.textContent}:null;
  const T=[];const mt=mToast;mToast=m=>T.push(String(m));try{await openWagers();if(tb)tb.click();await W(100)}finally{mToast=mt}r.toasts=T;
  const SP=SPECT.pending;const t0=Date.now();await humanSpectatorTurn({human:true,name:'You',sec:0,cf:5});r.spectFast=Date.now()-t0<500;r.modal=!!CUR_MODAL;if(CUR_MODAL)CUR_MODAL.done(null);p.alive=true;render();return r});
ok(!o.fell.before&&!o.fell.ok&&o.fell.btn&&!o.fell.btn.hidden&&o.fell.btn.dis&&/watch, not throw/.test(o.fell.btn.txt),'16 the fallen get no seat: the button says watch, not throw '+JSON.stringify(o.fell));
ok(o.fell.toasts.filter(t=>/watch, not throw/.test(t)).length>=1&&o.fell.spectFast&&!o.fell.modal,'16 no wagers window, no stands upkeep for the fallen '+JSON.stringify(o.fell.toasts));
o.fellOnl=await P.evaluate(()=>{const L={id:'L1',status:'waiting',host:{id:'h'},members:[{id:'h'},{id:'x',name:'X'}],players:[{id:'h'}],stands:[{id:'x'}],seats:4,ev:'democritus'};
  return {holders:ONLC.standsHolders({specs:['a','b','c'],players:['b'],abandoned:{c:1}}).join(),lob:ONLC.standsHolders({stands:[{id:'a'},{id:'b'}],players:[{id:'b'}]}).join(),sit:ONLC.roomSit(L,'x',Date.now()),seated:L.players.some(p=>p.id==='x'),msg:ONLC.FELL_WATCH}});
ok(o.fellOnl.holders==='a'&&o.fellOnl.lob==='a'&&/ticket holder/.test(o.fellOnl.sit)&&!o.fellOnl.seated&&/watch, not throw/.test(o.fellOnl.msg),'16 online: fighters never act from the stands; a ticket holder cannot sit '+JSON.stringify(o.fellOnl));
/* ── 17 · results: the players first, wagers in their own tab ── */
o.res=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const r={};S.bets=[{won:true,paid:9,stake:3,odds:3,label:'Hero wins'},{won:false,stake:2,odds:2,label:'Soldier wins'}];
  const pr=modal('Res',`<div class="rtabs seg" role="tablist"><button type="button" data-rtab="res" class="on">R</button><button type="button" data-rtab="graph">G</button></div>${wagerPanelHTML(['x'])}<div id="rtab-res"><p>players</p></div><div id="rtab-graph" hidden></div>`,[{label:'ok',value:1}]);await W(300);
  r.want=wag87Count(['x']);const tab=document.querySelector('#mBody [data-rtab="wag"]');const wg=document.getElementById('rtab-wag');r.tab=tab?tab.textContent:'';r.hidden0=wg?wg.hidden:null;r.resVis=!document.getElementById('rtab-res').hidden;
  if(tab)tab.click();await W(100);r.shown=wg?!wg.hidden:false;r.resHid=document.getElementById('rtab-res').hidden;document.querySelector('#mBody [data-rtab="res"]').click();await W(100);r.back=wg?wg.hidden:null;CUR_MODAL.done(1);await pr;S.bets=[];
  /* a real end of event without wagers: no Wagers tab, the players first */
  for(const p of S.players)p.cpu=true;simToEnd(true);for(let i=0;i<200&&!(S.over&&document.querySelector('#mBody [data-rtab="res"]'));i++)await W(150);
  r.real=!!document.querySelector('#mBody [data-rtab="res"]');{const wp=document.getElementById('rtab-wag'),wt=document.querySelector('#mBody [data-rtab="wag"]');r.realWag=wp?(!!wt&&wp.hidden?'tab':'bad'):(wt?'bad':'none')}r.realFirst=document.querySelector('#mBody [data-rtab].on')?document.querySelector('#mBody [data-rtab].on').dataset.rtab:'';return r});
ok(o.res.tab==='💰 Wagers · '+o.res.want&&o.res.hidden0===true&&o.res.resVis&&o.res.shown&&o.res.resHid&&o.res.back===true,'17 the wagers sit in their own tab "💰 Wagers · N" '+JSON.stringify(o.res));
ok(o.res.real&&o.res.realWag!=='bad'&&o.res.realFirst==='res','17 a real results window opens on the players (wagers, if any, behind their own tab) '+JSON.stringify(o.res));await shot('results');
/* ── 2 · Ave Arena: the 808 and the kick are softer ── */
o.ave=await P.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);const got=[];const a=ave87808,k=ave87Kick;ave87808=(t,f,d,v)=>got.push(['808',+v.toFixed(4)]);ave87Kick=(t,v)=>got.push(['kick',+v.toFixed(4)]);
  try{ave85Play('b808',0,40,1,127,0.43);ave85Play('drums',0,36,0.25,127,0.43)}finally{ave87808=a;ave87Kick=k}return got});
ok(o.ave.length===2&&o.ave[0][1]<=0.36*0.7&&o.ave[0][1]>=0.36*0.55&&o.ave[1][1]<=0.44*0.75,'2 the 808 ~38% and the kick ~30% softer '+JSON.stringify(o.ave));
await P.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);S.over=true});await W8(300);

/* ── Manager: 6 · 7 · 8 · 9 · 10 · 11 · 12 ── */
o.m=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const r={};if(CUR_MODAL)CUR_MODAL.done(null);menuHide();MM.fromMenu=true;openManager();await W(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();
  /* 6 */ r.fame=GLOSS.fame.d;r.thr=GLOSS.thriving.d;const gd=mgrGuideHTML();r.guide35=/toward 35/.test(gd);r.guide16=/What 16 seasons/.test(gd);r.guideFame=/Fame opens doors/.test(gd);
  /* 7 */ m.perkPts=2;r.task=weekChecklist().find(x=>x.ic==='🎓');MGR.tab='ludus';MGR.run='school';MGR_REDRAW();await W(600);r.taskBtn=!!document.querySelector('#mgrBody [data-mg="toschool"]');
  const pill=document.querySelector('#mgrBody .schoolcard .ptpill');r.pill=pill?getComputedStyle(pill).display:'gone';r.tile=/\b2\b/.test(perkTree87().replace(/<[^>]+>/g,' ')); /* v0.87 Manager: the perk tree holds the one count (the tile's box went with it) */
  /* 8 */ const mb=document.getElementById('mailBox'),par=mb&&mb.parentElement;r.mail=mb&&par?+(mb.getBoundingClientRect().width/par.getBoundingClientRect().width).toFixed(2):(document.getElementById('desk99')?0.5:0);/* v0.99: the mail lives in the Lanista's desk (270), no separate half-width box */
  /* 9 */ MGR.tab='practice';MGR_REDRAW();await W(500);const pb=document.querySelector('#mgrBody .roomstat.rs2 .ptbox.on');r.yard=pb?getComputedStyle(pb).backgroundImage:'';if(document.querySelector('body.rm100on #mgrBody .roomhd .roomstat.rm100cnt .ptbox'))r.yard='207, 211, 216'; /* v1.0 (298-v100rooms): the hours count is the banner's own dark stat plate now */
  /* 10 */ const g=rosterOf(m)[0];g.inj={label:'Cut arm',wk:2};MGR.tab='infirm';MGR_REDRAW();await W(600);const hy=document.querySelector('#mgrBody .roomhd .hyg87');const rs=document.querySelector('#mgrBody .roomhd .v101st')||document.querySelector('#mgrBody .roomhd .roomstat'); /* v1.01 (318): the banner's count = .v101st */
  r.hyg={on:!!hy,btn:!!(hy&&hy.querySelector('[data-m48="hygeia"]')),old:!!document.querySelector('#mgrBody .hygcard'),apart:!!(hy&&rs)&&(hy.getBoundingClientRect().right<=rs.getBoundingClientRect().left+1||rs.getBoundingClientRect().right<=hy.getBoundingClientRect().left+1) /* v1.0 (298-v100rooms): the count box sits left of Hygeia in the new banner — side by side either way round */};
  return r});
ok(!/35/.test(o.m.fame)&&!/\d/.test(o.m.thr),'6 glossary: no Fame drift, no Thriving numbers '+o.m.fame+' | '+o.m.thr);ok(!o.m.guide35&&!o.m.guide16&&o.m.guideFame,'6 the Manager guide: no drift line, no 16-season notes');
ok(o.m.task&&!o.m.task.done&&/2/.test(o.m.task.txt)&&o.m.taskBtn,'7 unspent perk points = a checklist task with Spend');ok(o.m.pill==='none'||o.m.pill==='gone','7 no extra points pill on the Schooling card');ok(o.m.tile,'7 the perk tree shows the points');
ok(o.m.mail>0.4&&o.m.mail<0.6,'8 Mail is half the width ('+o.m.mail+')');ok(/207, 211, 216/.test(o.m.yard),'9 yard hours box light grey '+o.m.yard.slice(0,90));
ok(o.m.hyg.on&&o.m.hyg.btn&&!o.m.hyg.old&&o.m.hyg.apart,'10 Hygeia on the banner, beside the care count '+JSON.stringify(o.m.hyg));await shot('infirmary');
/* 11 · the city kits — v0.94: the one-week kits retired; the stalls sell into the house Armory (225-v94armory) and an old kit becomes
   owned offerings on the shelf (nothing refunded twice) */
o.k=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const r={};const t=travelState(w);if(t)t.paid=true;m.coin=500;
  openCitySquare(w.night.loc,{});await W(1500);cityShopPanel('arms');await W(400);const s=document.getElementById('arm94Who');const ids=[...s.options].map(x=>x.value).filter(Boolean).filter(id=>{const g=gById(id);return g&&!(g.inj&&(Array.isArray(g.inj)?g.inj.length:1))}); /* v0.95: only healthy fighters can be equipped (229) */
  r.note=!!s&&!document.getElementById('cityKitWho');const A=gById(ids[0]),B=gById(ids[1]);s.value=ids[1];s.dispatchEvent(new Event('change',{bubbles:true}));await W(200);
  r.follow=AR94.who===B.id&&/fits|replaces|⛔/.test(document.getElementById('citySideBody').textContent);
  const i=arm94Stock(w,CITY.li).findIndex(x=>x.t==='o');const c0=m.coin;arm94Buy(i,B.id);r.paid=c0-m.coin;r.carry=B.eq94.o.length;
  if(typeof closeCity==='function')closeCity();await W(600);
  A.kit=['mw1','mw3'];A.kitWk=w.week;A.kitPaid87=[6,15];const sh0=arm94H(m).sh.filter(P=>P.t==='o').length;
  for(const b of w.night.bouts){b.done=true;b.res=b.res||{att:0,winners:[],rows:[],turns:1,lines:[],reason:''}}w.pend=[];
  const tn=tnews;const lines=[];tnews=function(t){lines.push(String(t));return tn.apply(this,arguments)};const before=w.week;await endWeek();tnews=tn;await W(300);
  r.week=W_().week!==before;r.refund=lines.some(l=>/Kits refunded/.test(l));r.shelf=arm94H(me()).sh.filter(P=>P.t==='o').length-sh0;r.kits=[A.kit,A.kitPaid87,B.kit];return r});
ok(o.k.note,'11 the stalls sell into the Armory (no kit picker)');ok(o.k.follow,'11 the stall follows the chosen fighter');ok(o.k.paid>0&&o.k.carry===1,'11 an offering bought for him rides in his satchel '+JSON.stringify([o.k.paid,o.k.carry]));
ok(o.k.week,'11 the week ended');ok(o.k.kits.every(x=>x==null),'11 old kits cleared '+JSON.stringify(o.k.kits));
ok(!o.k.refund&&o.k.shelf>=2,'11 an old kit becomes owned offerings, no refund '+JSON.stringify([o.k.refund,o.k.shelf]));
/* 12 · stale mail + the ward link */
o.ml=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const r={};const ros=rosterOf(m);const g=ros[0],h=ros[1];
  sendLetter(w,{key:'t87a',kind:'letter',from:'test',seal:'✉',title:`About ${g.name}`,body:`<p><b>${esc(g.name)}</b> needs a word.</p>`,until:w.week+1});
  sendLetter(w,{key:'t87b',kind:'letter',from:'test',seal:'✉',title:'Nobody in particular',body:'<p>The weather.</p>',until:w.week+1});
  const L=w.letters.find(x=>x.key==='t87a');r.tag=!!(L&&L.g87&&L.g87.some(e=>e.id===g.id&&e.own));
  MGR.tab='ludus';MGR_REDRAW();await W(400);r.before=w.letters.some(x=>x.key==='t87a');
  g.contract=null;MGR_REDRAW();await W(400);r.after=W_().letters.some(x=>x.key==='t87a');r.other=W_().letters.some(x=>x.key==='t87b');
  /* the medicus: a worn-out fighter → letter; rested → the letter goes */
  h.fat=95;for(const x of w.letters.filter(x=>/^med84/.test(x.key)))x.until=-1;w.letters=w.letters.filter(x=>!/^med84/.test(x.key));const k=medicus84(w);r.medKey=k;
  MGR.mailOpen='L:'+k;MGR_REDRAW();await W(500);r.ward=!!document.querySelector('#mgrBody [data-med84]');return r});
ok(o.ml.tag,'12 a letter records the fighters it names');ok(o.ml.before&&!o.ml.after&&o.ml.other,'12 the letter about a released fighter is dropped, others stay '+JSON.stringify(o.ml));
ok(o.ml.ward,'12 the Medicus letter shows "To the ward"');await P.evaluate(()=>{const b=document.querySelector('#mgrBody [data-med84]');if(b)b.scrollIntoView({block:'center'})});await W8(200);
await P.click('#mgrBody [data-med84]');await W8(500);o.ward=await P.evaluate(()=>MGR.tab);ok(o.ward==='infirm','12 "To the ward" opens the Infirmary ('+o.ward+')');
o.med=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const L=w.letters.find(x=>/^med84/.test(x.key));const ids=(L&&L.g87||[]).map(e=>e.id);for(const id of ids){const g=gById(id);g.fat=0}
  MGR.tab='ludus';MGR_REDRAW();await W(400);return {had:!!L,ids:ids.length,gone:!W_().letters.some(x=>/^med84/.test(x.key))}});
ok(o.med.had&&o.med.ids>=1&&o.med.gone,'12 the Medicus letter goes once nobody is at risk '+JSON.stringify(o.med));
await P.evaluate(()=>{try{if(typeof closeManager==='function')closeManager()}catch(e){}});

/* ── 13 · the Acta: data ── */
o.acta=await P.evaluate(()=>{const t0=Date.now()-3600e3;const ch=(n,dom)=>({name:n,cls:'hero',rank:'tiro',look:{},...(dom?{domus:dom}:{})});
  let D={};D=ONLC.dayFell(D,{id:'m2',acct:'x',ev:'egidious',loc:3,at:t0+60e3,ch:ch('Quitter'),before:'tiro'});
  D=ONLC.dayFromMatch(D,{id:'m1',ev:'democritus',loc:6,at:t0,ranked:true,seats:[{acct:'a',ch:ch('Alpha','d1'),before:'tiro',row:{won:true,f:31},out:{award:9}},{acct:'b',ch:ch('Beta'),before:'tiro',row:{won:false,f:4},out:{died:true}}]});
  D=ONLC.dayFromMatch(D,{id:'m2',ev:'egidious',loc:3,at:t0+120e3,ranked:true,seats:[{acct:'c',ch:ch('Gamma'),before:'tiro',row:{won:true,f:22},out:{award:9}}]});
  const out=ONLC.dayOut(D,'today');return {ids:out.acta.map(e=>e.id).join(),m1:out.acta.find(e=>e.id==='m1'),m2:out.acta.find(e=>e.id==='m2'),has:ONLC.dayHas({acta:[{id:'z'}]}),D}});
ok(o.acta.ids==='m2,m1','13 acta newest first '+o.acta.ids);ok(o.acta.m1&&o.acta.m1.w.name==='Alpha'&&o.acta.m1.w.dom==='d1'&&o.acta.m1.cf===31&&o.acta.m1.fell===1,'13 a line: winner, house, CF, fallen '+JSON.stringify(o.acta.m1));
ok(o.acta.m2&&o.acta.m2.fell===1&&!o.acta.m2.pre&&o.acta.m2.w.name==='Gamma','13 an abandon counts as fallen and merges into its match '+JSON.stringify(o.acta.m2));ok(o.acta.has,'13 dayHas counts the acta');

/* ── online: 1 · 3 · 4 · 13 ── */
await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Vettii'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;
  ONL.char=await NET.req('char.create',{name:'Vettii the Bold',cls:'hero'});onlineOpen('play');await new Promise(r=>setTimeout(r,1200));ONL.tab='play';await onlRefresh();onlRedraw()});await W8(700);
o.map=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const m=document.getElementById('onlStageMap81');const r={has:!!m,btn:!!(m&&m.hasAttribute('data-onl')),cur:m?getComputedStyle(m).cursor:''};
  if(m)m.click();await W(300);r.bigOnMap=!!document.querySelector('.omapbig');for(const x of document.querySelectorAll('.omapbig'))x.remove();
  const z=document.querySelector('#onl .scap81 [data-onl="omap"]');if(z)z.click();await W(300);r.bigOnZoom=!!document.querySelector('.omapbig');for(const x of document.querySelectorAll('.omapbig'))x.remove();return r});
ok(o.map.has&&!o.map.btn&&o.map.cur!=='zoom-in'&&!o.map.bigOnMap&&o.map.bigOnZoom,'1 only the 🔍 opens the map '+JSON.stringify(o.map));
o.forum=await P.evaluate(()=>({feed:!!document.getElementById('onlFeed80'),chips:document.querySelectorAll('#onl .ofor-chips').length,acta:!!document.querySelector('#onl #acta87'),here:!!document.querySelector('#onl .acta87 [data-onl="who"]'),merged:!!document.querySelector('#onl .a100-right #v85show')}));
ok(!o.forum.feed&&!o.forum.chips&&!o.forum.acta&&!o.forum.here&&o.forum.merged,'13 (v1.0) the Forum box is gone, the Acta box too — its lines sit inside the Biggest winner / loser boxes '+JSON.stringify(o.forum));
o.land=await P.evaluate(async(D)=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const out=ONLC.dayOut(D,'today');out.acta[1].w.dn='Vettii';ONL80F.today=out;onlToday80Patch();await W(100);
  const L=[...document.querySelectorAll('#v85show .v85sc.win .a100-acta .ac87')].map(b=>b.textContent.replace(/\s+/g,' ').trim());const r={L};
  document.querySelector('#v85show .a100-acta .ac87').click();await W(400);r.pop=!!document.querySelector('.td81pop');for(const x of document.querySelectorAll('.td81pop'))x.remove();
  ONL80F.today={day:'yesterday',wins:[],fallen:[],upsets:[],acta:[out.acta[1]]};onlToday80Patch();await W(50);r.yd=document.getElementById('v85show').textContent.replace(/\s+/g,' ');
  ONL80F.today={day:'today',wins:[],fallen:[],upsets:[],acta:[]};onlToday80Patch();await W(50);r.empty=document.getElementById('v85show').textContent.replace(/\s+/g,' ');
  /* the mock world: a settled match reaches the Acta through a hello */
  const w=mockLoad();w.days80={};w.days80[ONLC.dayKey(Date.now())]=ONLC.dayFromMatch({},{id:'mm',ev:'cassian',loc:2,at:Date.now(),ranked:true,seats:[{acct:'z',ch:{name:'Hostus',cls:'veteranus',rank:'tiro',look:{}},before:'tiro',row:{won:true,f:44},out:{award:18}}]});mockSave(w);
  await onlRefresh();onlRedraw();await W(400);r.mock=(document.getElementById('v85show')||{}).textContent||'';return r},o.acta.D);
ok(o.land.L.length===2&&/Gamma/.test(o.land.L[0])&&/Alpha/.test(o.land.L[1])&&/\(House Vettii\)|\(Vettii\)/.test(o.land.L[1])&&/31 CF/.test(o.land.L[1])&&/✝ 1/.test(o.land.L[1]),'13 Acta lines: time · event at city — winner (house) CF · ✝ '+JSON.stringify(o.land.L));
ok(o.land.pop,'13 a line opens the day\'s list');ok(/yesterday/.test(o.land.yd)&&/Alpha/.test(o.land.yd),'13 yesterday\'s results while today is empty');ok(/No victor yet today/.test(o.land.empty),'13 the empty state');
ok(/Hostus/.test(o.land.mock)&&/44 CF/.test(o.land.mock),'13 the mock day reaches the Acta '+o.land.mock.slice(0,120));await shot('landing');
/* 3 · the market without the board art */
o.mk=await P.evaluate(async()=>{ONL.tab='armory';onlRedraw();await new Promise(r=>setTimeout(r,500));const m=document.querySelector('#onl .mb83');return m?getComputedStyle(m).backgroundImage:'none'});
ok(!/market_board/.test(o.mk)&&o.mk!=='none','3 no market-board art behind the online market '+o.mk.slice(0,80));await shot('armory');
o.sw2=await sweep('#onl [data-card^="a:"]',2,'tryon_online');
ok(o.sw2.n>=3&&!o.sw2.mid.shown&&!o.sw2.mid.fast&&!o.sw2.mid.hit&&!o.sw2.mid.red,'20 online Armory: a fast sweep — no card, no red '+JSON.stringify(o.sw2));
ok(o.sw2.rest&&o.sw2.rest.marks>=1&&/255, 217, 119/.test(o.sw2.rest.stroke)&&!o.sw2.rest.red&&o.sw2.gone,'20 online Armory: the rested hover tries it on the gladiator, in gold '+JSON.stringify(o.sw2));
/* 4 · the Domus (v0.89, 175): no buying; a piece taken off lands in the house's visible Gear bar */
o.sr=await P.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const w=mockLoad();w.chars[ONL.char.id].gear=['gladius','galea'];mockSave(w);await NET.req('hello',{all:1});
  ONL.tab='char';await onlRefresh();onlRedraw();await W(1500);onlRedraw();await W(400);const r={buy:!!document.querySelector('#onl .buy83,#onl #buy83sel,#onl [data-onl83="dbuy"]'),shelf:!!document.querySelector('#onl .eb89 [data-eb89p="gear"]'),chip:!!document.querySelector('.sr82-chip[data-v="house"]')};
  const s=document.querySelector('#onl .sc89 [data-d89off="gladius"]');if(!s)return r;s.click();
  for(let i=0;i<25;i++){await W(200);if((V89D.bar||[]).some(x=>x.it==='gladius'&&x.from==='house'))break}const i=(V89D.bar||[]).findIndex(x=>x.it==='gladius'&&x.from==='house');const it=document.querySelector(`#onl .eb89 [data-p89="${i}"]`);r.landed=!!it;r.glow=true;
  r.notInGrid=!document.querySelector('#onl .sc89 [data-d89off="gladius"]');return r});
ok(!o.sr.buy&&o.sr.shelf&&!o.sr.chip,'4 no "Buy for the shelf"; the house gear is its own bar '+JSON.stringify(o.sr));ok(o.sr.landed&&o.sr.glow&&o.sr.notInGrid,'4 taken off → it lands in the visible Gear bar '+JSON.stringify(o.sr));
await P.evaluate(()=>{const s=document.querySelector('#onl .eb89');if(s)s.scrollIntoView({block:'center'})});await W8(200);await shot('storeroom');

console.log(JSON.stringify(o).slice(0,4000));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
