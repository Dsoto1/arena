/* v0.84 (138-v84): A the Recruiter's and Medicus' letters (conditions, one a week, face when opened) · B blood fading by rotation,
   one dust puff per fallen gladiator (none with Reduce motion), rubble settling, the light board · C one tab per save (two pages:
   the second asks, Continue → the first stops saving; Cancel → the second lets go) · D the backup nudge (triggers, Remind me later,
   Back up now, the Backups tab) + the standalone's Online button · E a simulated browser translation (every text node wrapped in
   <font> and rewritten) clicking menu → Play Now → a turn → Manager → Studio · F no horizontal scroll at 390×844 / 844×390.
   SHOT=<dir> saves v84_*.png. Served over http (two pages share storage); the standalone check uses file://. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900},acceptDownloads:true});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const errs=[];const open=async n=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0);await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});return p};
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const shot=async(p,n,clip)=>{if(SHOT)await p.screenshot({path:path.join(SHOT,`v84_${n}.png`),...(clip?{clip}:{})})};
const A=await open('A');

/* ── A · the council speaks ── */
out.a=await A.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';const w=W_(),m=me();const r={};
  /* nothing to say: no coin → no ✓ fit, no affordable bargain */
  const coin0=m.coin;m.coin=0;r.quiet=recruiter84(w)===null;m.coin=99999;
  /* a bargain: one free agent asking far below his peers */
  /* v0.87: with random free agents the middle one may lack two peers of his level (no bargain → the ★ pick writes instead):
     try candidates from the middle outwards until the set-up really holds a bargain */
  const fa=freeAgents().filter(g=>!g.inj).sort((x,y)=>effOvr(y)-effOvr(x));const have=new Set(rosterOf(m).map(x=>x.cls));const mid=Math.floor(fa.length/2);
  const order=fa.map((x,i)=>[x,Math.abs(i-mid)]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);const fame0=new Map(fa.map(x=>[x,x.fame]));const cls0=new Map(fa.map(x=>[x,x.cls]));
  let g=order[0],k1=null,L1=null;
  for(const cand of order.slice(0,12)){for(const x of fa){x.fame=fame0.get(x);x.cls=cls0.get(x)}g=cand;
    g.cls=Object.keys(CLASSES).find(k=>!have.has(k)&&BASE_CLS.includes(k))||g.cls;g.fame=0;for(const x of fa)if(x!==g&&Math.abs(effOvr(x)-effOvr(g))<=4)x.fame=400;
    k1=recruiter84(w);L1=(w.letters||[]).find(l=>l.key===k1);if(L1&&/^A bargain: /.test(L1.title))break;
    if(k1)w.letters=w.letters.filter(l=>l.key!==k1);w.rec84={}}r.bargain=!!L1&&/^A bargain: /.test(L1.title)&&L1.adv==='recruiter'&&/asks <b>\d+<\/b> a week\. Fighters of that level ask about <b>\d+<\/b>/.test(L1.body);const bn=L1?L1.title.replace('A bargain: ',''):g.name;
  r.once=recruiter84(w)===null;
  w.week++;const k2=recruiter84(w);const L2=k2&&(w.letters||[]).find(l=>l.key===k2);r.next=!L2||!L2.title.includes(bn);w.week--;
  if(k2)w.letters=w.letters.filter(l=>l.key!==k2);
  /* the Medicus: nobody at risk → silent; a worn-out fighter → a letter */
  const ros=rosterOf(m);for(const x of ros){x.fat=0;x.inj=null;x.severed=[]}w.beds76=[];r.medQuiet=medicus84(w)===null;
  const f=ros[0];f.fat=82;f.restWk=null;const k3='med84-'+w.season+'-'+w.week;w.letters=(w.letters||[]).filter(l=>l.key!==k3);
  const km=medicus84(w);const LM=km&&w.letters.find(l=>l.key===km);r.med=!!LM&&LM.adv==='medicus'&&LM.body.includes(esc(f.name))&&/fatigue 82/.test(LM.body);r.medOnce=medicus84(w)===null;if(!r.med)r.medDbg={km,body:LM&&LM.body,name:f.name,risks:medicus84Risks(w).map(x=>x.k)};
  /* rest week clears that worry */
  w.letters=w.letters.filter(l=>l.key!==km);f.restWk=w.week;r.restOk=medicus84(w)===null;f.restWk=null;
  /* on the card while worn down → the card check (ludusTabHTML) writes */
  w.letters=w.letters.filter(l=>l.key!==k3);f.fat=55;const bt=w.night&&w.night.bouts&&w.night.bouts.find(x=>!x.done);if(bt&&!bt.ents.includes(f.id))bt.ents.push(f.id);
  MGR.tab='ludus';MGR_REDRAW();await W8(300);const LC=w.letters.find(l=>l.key===k3);r.card=!bt||(!!LC&&/on this week's card/.test(LC.body));
  /* opened: the faces */
  MGR.mailOpen='L:'+k1;MGR_REDRAW();await W8(500);const C=council83(w);const q=s=>document.querySelector(s);
  const d=q(`details.mail[data-mail="L:${k1}"]`);r.recFace=!!d&&d.open&&!!d.querySelector('.adv83 svg')&&d.querySelector('.adv83').textContent.includes(C.find(a=>a.k==='recruiter').name);
  r.btn=!!d&&!!d.querySelector('[data-rec84]');
  return r});
await A.evaluate(()=>{const d=document.querySelector('details.mail[open]');if(d)d.scrollIntoView({block:'start'})});await A.waitForTimeout(300);await shot(A,'letter_recruiter');
out.a2=await A.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const L=w.letters.find(l=>/^med84-/.test(l.key));MGR.mailOpen='L:'+L.key;MGR_REDRAW();await W8(500);
  const d=document.querySelector(`details.mail[data-mail="L:${L.key}"]`);if(d)d.scrollIntoView({block:'start'});const C=council83(w);
  const r={medFace:!!d&&d.open&&d.querySelector('.adv83').textContent.includes(C.find(a=>a.k==='medicus').name)};
  d.querySelector('[data-med84]').click();await W8(400);r.ward=MGR.tab==='infirm';MGR.tab='ludus';MGR_REDRAW();await W8(200);
  MGR.mailOpen='L:'+L.key;MGR_REDRAW();await W8(300);const d2=document.querySelector(`details.mail[data-mail="L:${L.key}"]`);if(d2)d2.scrollIntoView({block:'start'});return r});
await A.waitForTimeout(300);await shot(A,'letter_medicus');
const a=out.a;ok(a.quiet,'recruiter silent with nothing to say');ok(a.bargain,'recruiter bargain letter');ok(a.once,'recruiter ≤1 a week');ok(a.next,'next week another name');
ok(a.medQuiet&&a.med&&a.medOnce&&a.restOk,'medicus: silent / fatigue letter / once / rest clears');ok(a.card,'medicus: fighting worn down on the card');
ok(a.recFace&&a.btn&&out.a2.medFace,'faces in the opened letters');ok(out.a2.ward,'To the ward');
await A.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,500))});

/* ── B · board life ── */
out.b=await A.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:true},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{}});
  await W8(2600);for(const T_=Date.now();Date.now()-T_<15000&&CUR_MODAL;){CUR_MODAL.done(null);await W8(200)}S.over=true;await W8(1200);const r={};
  S.blood=[];S.rotation=5;bloodAt(6,6,'elim');const B=S.blood[0];r.stamp=B.rot84===5;const fa=[];for(let k=0;k<6;k++){S.rotation=5+k;fa.push(+bloodFade84(B).toFixed(3))}S.rotation=5;r.fades=fa;
  r.fall=fa[0]===1&&fa[1]<1&&fa[2]<fa[1]&&fa[3]<fa[2]&&fa[5]>=LIFE84.floor&&fa[5]<0.5;
  const rm=Math.random;let calls=0;Math.random=()=>{calls++;return rm()};const h0=onlHash();bloodFade84(B);bloodCol84('#8a1c14',0.5);Math.random=rm;r.cosmetic=calls===0&&onlHash()===h0;
  /* dust: once per fallen gladiator */
  const p=S.players[1];const n0=LIFE84.dust.length;eliminate(p,{type:'env'});r.dust1=LIFE84.dust.length===n0+1;eliminate(p,{type:'env'});r.dustOnce=LIFE84.dust.length===n0+1&&dust84(p.r,p.c,p.id)===false;
  SETTINGS.calm=true;applySettings();const q=S.players[2];r.calm=dust84(q.r,q.c,q.id)===false;SETTINGS.calm=false;applySettings();
  /* rubble: a topple settles, then lies */
  const pil=S.pillars[0];const tp=S.players[0];tp.alive=true;tp.r=pil.r;tp.c=pil.c-1>=0?pil.c-1:pil.c+1;tp.mv=9;const n1=(S.rubble||[]).length;try{doTopple(tp,pil)}catch(e){}
  const rb=S.rubble[n1];r.rub=!!rb&&rubbleSettle84(rb,0,0)>0;await W8(1400);r.rubSettled=!!rb&&rubbleSettle84(rb,0,0)===0&&rubbleSettle84(rb,2,4)===0;
  r.oldRub=rubbleSettle84({r:1,c:1,dr:0,dc:1},0,0)===0;
  /* the light board */
  SETTINGS.lite84='on';r.liteOn=lite84On();SETTINGS.lite84='off';r.liteOff=!lite84On();SETTINGS.lite84='auto';r.liteAuto=lite84On()===((window.devicePixelRatio||1)>2&&TW*N*(window.devicePixelRatio||1)>1600);
  const g0=SAND83.grain;SETTINGS.lite84='on';let seen=-1;const base=drawShipTile;drawShipTile=function(){seen=SAND83.grain;return base.apply(this,arguments)};draw();drawShipTile=base;SETTINGS.lite84='auto';r.liteDraw=seen===0&&SAND83.grain===g0;
  /* blood at 4 ages, side by side, for the eye */
  S.pillars=[];S.npcs=[];for(const q of S.players)q.r=12;const cap=document.getElementById('caption');if(cap)cap.style.visibility='hidden';S.blood=[];S.rotation=8;for(const [c,age] of [[3,0],[5,1],[7,2],[9,3]]){bloodAt(6,c,'elim');S.blood[S.blood.length-1].rot84=8-age}
  for(const pl of S.piles||[])pl.gone=true;LIFE84.dust.length=0;draw();const m=center(6,6);const cv0=document.getElementById('cv').getBoundingClientRect();r.clip={x:Math.max(0,cv0.left+m.x-TW*4),y:Math.max(0,cv0.top+m.y-TW*1.4),width:TW*8,height:TW*3.4};
  return r});
await shot(A,'blood_fade',out.b.clip);
const bb=out.b;ok(bb.stamp&&bb.fall,'blood fades with the rotations '+JSON.stringify(bb.fades));ok(bb.cosmetic,'blood fade: no RNG, no hash change');ok(bb.dust1&&bb.dustOnce,'one dust puff per fallen gladiator');ok(bb.calm,'no dust with Reduce motion');
ok(bb.rub&&bb.rubSettled&&bb.oldRub,'rubble settles then lies');ok(bb.liteOn&&bb.liteOff&&bb.liteAuto&&bb.liteDraw,'the light board');
/* the dust puff, mid-air */
const dclip=await A.evaluate(()=>{LIFE84.dustMs=6000;S.blood=[];const p=S.players[3];p.alive=true;p.r=8;p.c=4;eliminate(p,{type:'env'});FX.length=0;HITFX.length=0;const m=center(8,4);const c=document.getElementById('cv').getBoundingClientRect();return {x:Math.max(0,c.left+m.x-TW*2),y:Math.max(0,c.top+m.y-TW*1.5),width:TW*4,height:TW*2.5}});
await A.waitForTimeout(1200);await shot(A,'dust',dclip);await A.waitForTimeout(2400);await shot(A,'dust2',dclip);await A.evaluate(()=>{LIFE84.dustMs=1500});await A.evaluate(()=>{const cap=document.getElementById('caption');if(cap)cap.style.visibility=''});

/* ── C · one tab per save ── */
const cid=await A.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.over=true;if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;await saveWorld(true);await W8(900);return W_().id});
out.c0=false;for(const T_=Date.now();Date.now()-T_<22500&&!out.c0;){out.c0=await A.evaluate(id=>TAB84.held.has('career:'+id),cid);if(!out.c0)await A.waitForTimeout(300)}
const B=await open('B');
await B.evaluate(async id=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;MGR.pendingLoad=id;openManager()},cid);
let asked=false;for(const T_=Date.now();Date.now()-T_<30000&&!asked;){await B.waitForTimeout(300);asked=await B.evaluate(()=>!!document.querySelector('.ask76bg')&&/another tab/.test(document.querySelector('.ask76bg').textContent))}
await shot(B,'second_tab');
await B.click('.ask76bg [data-ask76="1"]');await B.waitForTimeout(900);
out.c=await A.evaluate(async()=>{const bar=document.getElementById('tab84');const r={bar:!!bar&&!bar.hidden&&/another tab/.test(bar.textContent),blocked:saveBlocked76()};
  r.put=(await Store.put('rosterSets','t84',{x:1}))===null;return r});
out.cb=await B.evaluate(id=>({held:TAB84.held.has('career:'+id),world:!!W_()&&W_().id===id,free:!saveBlocked76()}),cid);
/* Cancel: a third page asks for the same career and lets go */
const C3=await open('C');await C3.evaluate(async id=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;MGR.pendingLoad=id;openManager()},cid);
asked=false;for(const T_=Date.now();Date.now()-T_<30000&&!asked;){await C3.waitForTimeout(300);asked=await C3.evaluate(()=>!!document.querySelector('.ask76bg'))}
await C3.click('.ask76bg [data-ask76="0"]');await C3.waitForTimeout(900);
out.cc=await C3.evaluate(()=>({world:!!W_(),blocked:saveBlocked76()}));out.cb2=await B.evaluate(()=>({bar:!document.getElementById('tab84'),free:!saveBlocked76()}));
ok(out.c0,'first tab holds its career');ok(asked,'second tab asks');ok(out.c.bar&&out.c.blocked&&out.c.put,'the first tab shows the notice and stops saving');
ok(out.cb.held&&out.cb.world&&out.cb.free,'the second tab keeps the career');ok(!out.cc.world&&!out.cc.blocked&&out.cb2.bar&&out.cb2.free,'Cancel lets go, the holder keeps saving');
await C3.close();await A.close();

/* ── D · backups ── */
const D=B;await D.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,400))});
out.d=await D.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};const set=o=>localStorage.setItem('flavius_bk84',JSON.stringify(o));const now=Date.now();
  set({first:now});menuShow();await W8(200);r.none=!document.querySelector('#mainMenu #bk84');
  set({first:now,ev:9});bk84Bump('ev');menuShow();await W8(200);r.ev=!!document.querySelector('#mainMenu #bk84')&&/10 events/.test(document.querySelector('#bk84').textContent);
  r.offline=/Online lives on the server/.test(document.querySelector('#bk84').textContent);
  set({first:now-15*864e5,ev:0});menuShow();await W8(200);r.daysIdle=!document.querySelector('#mainMenu #bk84');
  set({first:now-15*864e5,ev:1});menuShow();await W8(200);r.days=!!document.querySelector('#mainMenu #bk84');
  set({first:now,season:1});menuShow();await W8(200);r.season=/season ended/.test((document.querySelector('#mainMenu #bk84')||{}).textContent||'');return r});
await shot(D,'nudge_menu');
await D.click('#mainMenu [data-bk84="later"]');await D.waitForTimeout(300);
out.d2=await D.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={gone:!document.querySelector('#mainMenu #bk84'),later:JSON.parse(localStorage.getItem('flavius_bk84')).later>Date.now()+2*864e5};
  menuShow();await W8(200);r.stays=!document.querySelector('#mainMenu #bk84');
  const o=JSON.parse(localStorage.getItem('flavius_bk84'));o.later=0;localStorage.setItem('flavius_bk84',JSON.stringify(o));savesHub76('backups');await W8(800);
  const hb=document.getElementById('hub76');r.hub=!!hb&&!!hb.querySelector('#bk84');r.last=/Last backup: never/.test(hb.textContent)&&/Online progress lives on the server/.test(hb.textContent)&&/Want to play offline\? Download the game/.test(hb.textContent);return r});
await shot(D,'nudge_saves');
const [dl]=await Promise.all([D.waitForEvent('download',{timeout:15000}).catch(()=>null),D.click('#hub76 [data-bk84="go"]')]);await D.waitForTimeout(800);
out.d3=await D.evaluate(()=>{const o=JSON.parse(localStorage.getItem('flavius_bk84'));return {last:o.last>Date.now()-60000,clear:!o.season&&!o.ev,gone:!document.querySelector('#hub76 #bk84'),date:!/Last backup: never/.test(document.getElementById('hub76').textContent)}});
out.d3.file=!!dl;
await D.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});
const d=out.d;ok(d.none&&d.ev&&d.daysIdle&&d.days&&d.season,'nudge triggers (events, days, season) '+JSON.stringify(d));ok(d.offline,'the nudge says offline only');
ok(out.d2.gone&&out.d2.later&&out.d2.stays,'Remind me later hides it');ok(out.d2.hub&&out.d2.last,'Saves: the nudge + last backup + offline lines');ok(out.d3.file&&out.d3.last&&out.d3.clear&&out.d3.gone&&out.d3.date,'Back up now downloads and resets '+JSON.stringify(out.d3));
/* the standalone (file://) */
const F=await ctx.newPage();F.on('pageerror',e=>errs.push('F:'+e.message));await F.goto('file://'+path.resolve(process.argv[2]));await F.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await F.evaluate(()=>{window._open=[];window.open=(u)=>{window._open.push(u);return null};if(CUR_MODAL)CUR_MODAL.done(null);menuShow()});await F.waitForTimeout(300);
await F.click('#mainMenu [data-mm="multi"]');await F.waitForTimeout(300);
out.f=await F.evaluate(()=>{const o=document.querySelector('#mainMenu [data-mm="online"]');return {txt:o&&o.textContent,dis:o&&o.disabled}});
await F.click('#mainMenu [data-mm="online"]');await F.waitForTimeout(400);out.f.opened=await F.evaluate(()=>window._open.slice());out.f.noOnl=await F.evaluate(()=>!document.getElementById('onl'));
ok(/Online plays at flaviusrule\.com\/play/.test(out.f.txt||'')&&!out.f.dis,'standalone: the Online button says where online plays');ok(out.f.opened[0]==='https://flaviusrule.com/play/'&&out.f.noOnl,'standalone: Online opens the site');
await F.close();

/* ── E · a simulated browser translation ── */
const T=await ctx.newPage();T.on('pageerror',e=>errs.push('T:'+e.message+' '+(e.stack||'').split('\n')[1]));
await T.addInitScript(()=>{const fake=s=>'«'+s.split(/\s+/).filter(Boolean).reverse().join(' ')+'»';
  const tr=root=>{const skip=n=>{const p=n.parentElement;return !p||/^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE|FONT)$/.test(p.tagName)||p.closest('[translate="no"],.notranslate,svg')};
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const L=[];let n;while((n=w.nextNode()))if(n.data.trim()&&!skip(n))L.push(n);
    for(const t of L){const f1=document.createElement('font');f1.style.verticalAlign='inherit';const f2=document.createElement('font');f2.style.verticalAlign='inherit';f2.textContent=fake(t.data);f1.appendChild(f2);t.replaceWith(f1)}};
  let tm=null;window.__tr={n:0};const go=()=>{tm=null;try{tr(document.body);window.__tr.n++}catch(e){}};
  document.addEventListener('DOMContentLoaded',()=>{new MutationObserver(()=>{if(!tm)tm=setTimeout(go,40)}).observe(document.body,{childList:true,subtree:true});setTimeout(go,300)})});
await T.goto(URL0);await T.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const step=async(n,fn)=>{try{await fn();return true}catch(e){errs.push('T step '+n+': '+e.message.split('\n')[0]);return false}};
out.e={};
out.e.menuTr=await T.evaluate(()=>!!document.querySelector('#mainMenu font')&&/«/.test(document.querySelector('#mainMenu .mmbtns').textContent));
out.e.play=await step('play',async()=>{await T.click('#mainMenu [data-mm="play"]');await T.waitForTimeout(1200);await T.click('[data-mi="0"]');await T.waitForTimeout(1800);await T.click('#goBtn')});
let turn=false;for(const T_=Date.now();Date.now()-T_<75000&&!turn;){await T.waitForTimeout(500);const st=await T.evaluate(()=>({m:!!CUR_MODAL&&!document.getElementById('modal').hidden,h:typeof humanTurn==='function'&&humanTurn()&&S.phase}));
  if(st.m)await T.evaluate(()=>{const b=document.querySelector('#mBtns button.primary')||document.querySelector('#mBtns button');if(b)b.click()});else if(st.h==='choice')turn=true}
out.e.turn=turn;
if(turn){const t0=await T.evaluate(()=>({who:S.turn,ph:S.phase,n:S.turnNo}));
  /* the translator rewrites the DOM all the time and End turn beats: never 'stable' for Playwright — force the real clicks; then wait for the
     phase/turn to move (answering any window) instead of a fixed pause (3 tests at once stretch every timer) */
  const answer=async(done,ms=30000)=>{for(const t1=Date.now();Date.now()-t1<ms;){if(await T.evaluate(done,t0))return true;const m=await T.evaluate(()=>!!CUR_MODAL&&!document.getElementById('modal').hidden);
    if(m)await T.evaluate(()=>{const b=document.querySelector('#mBtns button');if(b)b.click()});await T.waitForTimeout(300)}return false};
  await step('coin',()=>T.click('#actions [data-act="coin"]',{force:true}));await answer(()=>S.phase!=='choice'&&!S.busy&&!CUR_MODAL);
  const ph=await T.evaluate(()=>S.phase);await step('end',()=>T.click('#actions [data-act="end"]',{force:true}));await answer(t0=>S.turnNo!==t0.n||S.turn!==t0.who);
  for(const t1=Date.now();Date.now()-t1<10000;){const m=await T.evaluate(()=>!!CUR_MODAL&&!document.getElementById('modal').hidden);if(!m)break;await T.evaluate(()=>{const b=document.querySelector('#mBtns button');if(b)b.click()});await T.waitForTimeout(400)}
  out.e.ph=ph;out.e.turnMoved=await T.evaluate(t0=>S.turnNo!==t0.n||S.turn!==t0.who,t0);await shot(T,'translated')}
out.e.terms=await T.evaluate(()=>{const s=[...document.querySelectorAll('.gt84')];return {n:s.length,eng:s.length>0&&s.every(x=>!/«/.test(x.textContent))}});
out.e.names=await T.evaluate(()=>{const n=document.querySelector('#log b[style*="color"]');return !n||n.getAttribute('translate')==='no'});
out.e.mgr=await step('manager',async()=>{await T.evaluate(()=>{S.over=true;if(CUR_MODAL)CUR_MODAL.done(null);menuShow()});await T.waitForTimeout(800);await T.click('#mainMenu [data-mm="manager"]');await T.waitForTimeout(2500);
  const ok1=await T.evaluate(()=>!!document.querySelector('#mBody')&&!document.getElementById('modal').hidden);if(!ok1)throw new Error('manager did not open');
  await T.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await T.waitForTimeout(1200)});
out.e.studio=await step('studio',async()=>{await T.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuShow()});await T.waitForTimeout(600);await T.click('#mainMenu [data-mm="studio"]');await T.waitForTimeout(2200);
  const ok2=await T.evaluate(()=>!document.getElementById('modal').hidden&&!!document.querySelector('#mBody [data-st],#mBody [data-stab],#mBody .strail,#mBody nav'));if(!ok2)throw new Error('studio did not open');
  const tab=await T.$('#mBody [data-sttab]:not(.on),#mBody [data-st]');if(tab)await tab.click();await T.waitForTimeout(600);await T.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)})});
out.e.trRuns=await T.evaluate(()=>window.__tr.n);
ok(out.e.menuTr,'translation simulated (font-wrapped, rewritten)');ok(out.e.play&&out.e.turn,'translated: Play Now → the horns → your turn');ok(out.e.turnMoved,'translated: a turn played by its buttons');
ok(out.e.terms.n>0&&out.e.terms.eng,'game terms stay English '+JSON.stringify(out.e.terms));ok(out.e.names,'log names translate="no"');ok(out.e.mgr&&out.e.studio,'translated: Manager and Studio open');
await T.close();

/* ── F · phone widths ── */
const P=await open('P');const wide=async()=>P.evaluate(()=>({doc:document.documentElement.scrollWidth<=innerWidth+1,body:(()=>{const m=document.getElementById('mBody');if(!m||m.offsetParent===null||m.scrollWidth<=m.clientWidth+2)return true;const R=m.getBoundingClientRect().left+m.clientLeft+m.clientWidth;const bad=[...m.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();if(!r.width||r.right<=R+1)return false;let q=el.parentElement;while(q&&q!==m){if(getComputedStyle(q).overflowX!=='visible')return false;q=q.parentElement}return true}).slice(0,4).map(el=>el.tagName+'.'+String(el.className).slice(0,30)+':'+Math.round(el.getBoundingClientRect().right));return m.scrollWidth+'/'+m.clientWidth+' '+bad.join(',')})()}));
out.f2={};
for(const [w,h] of [[390,844],[844,390]]){await P.setViewportSize({width:w,height:h});await P.waitForTimeout(300);
  await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300));menuShow()});await P.waitForTimeout(400);out.f2['menu'+w]=await wide();
  await P.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));menuHide();MM.fromMenu=true;openManager();await W8(800);if(!W_()){newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null}MGR.tab='ludus';MGR_REDRAW();await W8(400)});out.f2['ludus'+w]=await wide();
  await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,400))})}
/* the Online market board and the Domus (mock server) */
await P.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);localStorage.setItem('flavius_online77','1');menuHide();
  ONL.acct=await NET.req('auth.signin',{name:'Vettii'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;ONL.char=await NET.req('char.create',{name:'Vettii the Bold',cls:'hero'});onlineOpen('armory');await W8(1000)});
for(const [w,h] of [[390,844],[844,390]]){await P.setViewportSize({width:w,height:h});await P.waitForTimeout(300);
  await P.evaluate(async()=>{ONL.tab='armory';ONL83U.mkt='board';await onlRefresh();onlRedraw()});await P.waitForTimeout(500);out.f2['market'+w]=await wide();if(w===390)await shot(P,'phone_market');
  await P.evaluate(async()=>{ONL.tab='char';ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw()});await P.waitForTimeout(500);out.f2['domus'+w]=await wide();if(w===390)await shot(P,'phone_domus')}
await P.evaluate(async()=>{try{onlExit()}catch(e){}await new Promise(r=>setTimeout(r,1500));if(CUR_MODAL)CUR_MODAL.done(null)});
await P.setViewportSize({width:390,height:844});await P.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));menuHide();MM.fromMenu=true;openManager();await W8(800);MGR.tab='ludus';MGR_REDRAW();await W8(300);const c=document.getElementById('council83');if(c)c.scrollIntoView()});await shot(P,'phone_council');
ok(Object.values(out.f2).every(x=>x.doc&&x.body===true),'no horizontal scroll at 390 / 844 '+JSON.stringify(out.f2));
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
