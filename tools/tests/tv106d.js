/* v1.06 TARGET CLARITY (396-v106aim, his u1c u2a): (1) mouse over a valid target → red ring + tag "name · NN% to wound · ~N dmg" + crosshair cursor;
   (2) the head of a target standing over the tile behind still picks that target (body before tile); (3) an overlapping pair: the FRONT
   body wins where both bodies are, the back one where only it is; (4) the click strikes exactly the shown target; (5) touch: tap selects,
   a tap elsewhere cancels, tap + tap again strikes; (6) Confirm attacks on → "Strike …?" dialog first (No = nothing, Yes = strike);
   Online → the row is hidden and the setting ignored; (7) Reduce motion: no pulse timer; (8) draw cost hover on vs off ≤ +1 ms;
   (9) kill switch flavius_v106aimoff=1.
   v1.08c (NOTES item 1, class B): no fixed sleeps around the pointer. AIM106.figs is refilled by every drawLayers93 and the hover
   test reads the LAST frame's figures, so before each pointer step the test waits for aimReady (both targets recorded with bounds +
   in tmap, no hover rAF pending, the canvas on top at the points — tools/tests/_wait.js) and after it for the expected shown /
   selected target; a timeout prints "WAIT … timed out" with the state (figs, tmap, raf, element at the point, PACE96, V108…). */
const http=require('http'),fs=require('fs'),path=require('path');
const T=require('./_wait');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(ls,touch)=>{const c=await b.newContext({viewport:{width:1440,height:900},hasTouch:!!touch});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await T.boot(pg,{menu:false,seed:false});
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide()});return pg};
/* a human soldier at F-? (6,4) with an attack chosen; two CPU targets: A in front (6,5), B on the tile behind it on screen (5,4) */
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  XRAY='off';const pl=[[6,4],[11,11],[12,11],[11,12]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1]});
  /* round 1 is beasts only: the two targets are beasts (A in front, B on the tile behind it on screen); the others stay out of reach */
  const bs=S.npcs.filter(n=>n.alive&&!n.out&&n.t!=='zora'&&n.tamedBy==null);window.__A=bs[0];window.__B=bs[1];
  bs[0].r=6;bs[0].c=5;bs[1].r=5;bs[1].c=4;bs[0].hp=bs[1].hp=99;const away=[[0,0],[12,12],[0,1],[1,0],[12,0]];bs.slice(2).forEach((n,i)=>{n.r=away[i][0];n.c=away[i][1]});
  for(const n of S.npcs)if(n.t==='zora'){n.r=0;n.c=12}
  const p=cur();p.attacks=0;p.hitTargets=new Set();p.armUses={R:0,L:0};const src=attackSources(p)[0];S.mode='atk'+src.arm+(src.thr?'T':'');
  render();for(let i=0;i<20;i++){draw();await W8(50)}
  return {human:humanTurn(),mode:S.mode,hl:[...HL.values()].filter(h=>h.t==='atk').map(h=>h.target.ref&&h.target.ref.name),on:typeof AIM106!=='undefined'&&!AIM106.off}});
const rearm=pg=>pg.evaluate(async()=>{const A=window.__A,B=window.__B;for(const [n,r,c] of [[A,6,5],[B,5,4]]){n.alive=true;n.hp=99;n.r=r;n.c=c}const p=cur();p.r=6;p.c=4;p.attacks=0;p.hitTargets=new Set();p.armUses={R:0,L:0};p.focusRoll=false;const src=attackSources(p)[0];S.mode='atk'+src.arm+(src.thr?'T':'');S.busy=false;
  render();for(let i=0;i<6;i++){draw();await new Promise(r=>setTimeout(r,40))}return S.mode});
/* page-space points: the centre of a target's body; a point on A and B both; a point on B only; an empty far tile */
const pts=pg=>pg.evaluate(()=>{const R=cv.getBoundingClientRect(),k=cv.width/R.width;const toP=(X,Y)=>({x:R.left+X/k,y:R.top+Y/k});
  const A=window.__A,B=window.__B;const fa=AIM106.figs.find(f=>f.u===A),fb=AIM106.figs.find(f=>f.u===B);if(!fa||!fb)return {err:'no figs '+AIM106.figs.length};
  const body=(f,X,Y)=>aim106Body(f,X,Y);let both=null,onlyB=null,headA=null;
  for(let Y=fb.bb.y0;Y<fb.bb.y1&&!(both&&onlyB);Y+=2)for(let X=fb.bb.x0;X<fb.bb.x1;X+=2){const ia=body(fa,X,Y),ib=body(fb,X,Y);if(ia&&ib&&!both)both=[X,Y];if(ib&&!ia&&!onlyB&&Y<fa.bb.y0)onlyB=[X,Y]}
  for(let Y=fa.bb.y0;Y<fa.bb.y1&&!headA;Y+=2)for(let X=fa.bb.x0;X<fa.bb.x1;X+=2){if(!body(fa,X,Y)||body(fb,X,Y))continue;const P=toP(X,Y);const t=aim106Tile(P.x-R.left,P.y-R.top);if(t&&!(t.r===A.r&&t.c===A.c)&&!(t.r===B.r&&t.c===B.c)){headA=[X,Y];break}}
  const far=center(1,11);
  return {A:toP((fa.bb.x0+fa.bb.x1)/2,(fa.bb.y0*0.4+fa.bb.y1*0.6)),both:both&&toP(...both),onlyB:onlyB&&toP(...onlyB),headA:headA&&toP(...headA),far:{x:R.left+far.x,y:R.top+far.y},
    names:[A.name,B.name],taint:AIM106.stats.taint}});
const state=pg=>pg.evaluate(()=>{const s=aim106Shown();return {shown:s?s.ref.name:null,sel:AIM106.sel?AIM106.sel.ref.name:null,cursor:cv.style.cursor,tag:AIM106.tag||'',
  hits:[...cur().hitTargets],aKey:'n'+window.__A.id}});
const W=ms=>new Promise(r=>setTimeout(r,ms));
/* semantic waits (v1.08c): the targets recorded (+ the canvas on top at the points) before a pointer step; the expected target after it */
const ready=(pg,pts)=>T.aimReady(pg,['__A','__B'],pts&&pts.filter(Boolean),8000);
const shownIs=(pg,nm,what)=>T.until(pg,what,n=>{const s=aim106Shown();return !AIM106.raf&&(n===null?!s:!!s&&s.ref.name===n)},nm,4000);
const selIs=(pg,nm,what)=>T.until(pg,what,n=>!AIM106.raf&&(n===null?!AIM106.sel:!!AIM106.sel&&AIM106.sel.ref.name===n),nm,4000);
const noWin=pg=>T.until(pg,'no window open',()=>!CUR_MODAL&&!document.querySelector('.ask76bg'),null,4000);

const diag106=async(pg,tag,P)=>{const dg=await pg.evaluate(async()=>{let n=0;const b=draw;draw=function(){n++;return b.apply(this,arguments)};await new Promise(r=>setTimeout(r,1000));draw=b;
  return {draws1s:n,figs:AIM106.figs.length,tmap:AIM106.tmap&&AIM106.tmap.size,hov:!!AIM106.hov,rec:AIM106.rec,st:AIM106.stats,v108:typeof V108!=='undefined'?{st:V108.st,tb:!!V108.tb,tl:!!V108.tl}:null,l106:typeof l106Mode==='function'?l106Mode():null,night:night91On(),pace:{depth:PACE96.depth,dirty:PACE96.dirty},mode:S.mode,speed:SPEED,dpr:devicePixelRatio,ua:navigator.userAgent.slice(-40)}});const at=P&&P.A?await pg.evaluate(([x,y])=>{try{const R=cv.getBoundingClientRect();const t=typeof aim106Tile==='function'?aim106Tile(x-R.left,y-R.top):null;return {tile:t,figs:AIM106.figs.map(f=>({k:f.k,ops:f.ops.length,bb:f.bb&&[f.bb.x0,f.bb.y0,f.bb.x1,f.bb.y1].map(Math.round)}))}}catch(e){return {err:String(e)}}},[P.A.x,P.A.y]):null;console.log('DIAG106D '+tag+' '+JSON.stringify(dg)+' AT '+JSON.stringify(at))};
let pg=await open();const st=await start(pg);ok(st.human&&st.on&&/^atk/.test(st.mode)&&st.hl.length>=2,'0 human aims at two targets '+JSON.stringify(st));
await ready(pg);let P=await pts(pg);ok(!P.err&&P.A&&P.both&&P.onlyB,'0b points found '+JSON.stringify(P));
/* 1 · hover */
await ready(pg,[P.far,P.A]);await pg.mouse.move(P.far.x,P.far.y);await shownIs(pg,null,'1 far tile: nothing shown');
await ready(pg,[P.A]);await pg.mouse.move(P.A.x,P.A.y);await shownIs(pg,P.names[0],'1 hover A shown');
let s1=await state(pg);if(s1.shown!==P.names[0])await diag106(pg,'1',P);ok(s1.shown===P.names[0]&&s1.cursor==='crosshair'&&s1.tag.startsWith(P.names[0]+' · ')&&/\d+% to wound/.test(s1.tag),'1 hover A: shown + crosshair + tag '+JSON.stringify(s1));
ok(/ · 94% to wound · ~\d+ dmg$/.test(s1.tag),'1b chance to wound a beast (4 dice, no defences) = 1-(1/2)^4 = 94% + the likely damage '+s1.tag);
ok(await pg.evaluate(()=>aim106Line({p:0,avg:0,notes:[],minerva:true})===`0% to wound · Minerva`&&aim106Line({p:62,avg:3,notes:[]})===`62% to wound · ~3 dmg`),'1c M1a: Minerva in the target’s hand → 0% and her name');
const ringDrawn=await pg.evaluate(()=>{let n=0;const o=CanvasRenderingContext2D.prototype.stroke;CanvasRenderingContext2D.prototype.stroke=function(){if(String(this.strokeStyle)==='#ff3b2a')n++;return o.apply(this,arguments)};try{draw()}finally{CanvasRenderingContext2D.prototype.stroke=o}return n});
ok(ringDrawn>=2,'1c red ring strokes painted '+ringDrawn);
const outl=await pg.evaluate(()=>({o:AIM106.figs.some(f=>f.outlined),built:AIM106.stats.built}));ok(outl.o&&outl.built>=1,'1d outline drawn on the figure '+JSON.stringify(outl));
await ready(pg,[P.far]);await pg.mouse.move(P.far.x,P.far.y);await shownIs(pg,null,'1e leaving clears');let s0=await state(pg);ok(!s0.shown&&s0.cursor==='','1e leaving clears '+JSON.stringify(s0));
/* 2 · head over the tile behind */
if(P.headA){await ready(pg,[P.headA]);await pg.mouse.move(P.headA.x,P.headA.y);await shownIs(pg,P.names[0],'2 A shown from the head point');const s2=await state(pg);ok(s2.shown===P.names[0],'2 A\'s head over another tile still picks A '+JSON.stringify(s2))}else ok(false,'2 no head point');
/* 3 · overlap */
await ready(pg,[P.both]);await pg.mouse.move(P.both.x,P.both.y);await shownIs(pg,P.names[0],'3a A shown on the overlap');const s3=await state(pg);ok(s3.shown===P.names[0],'3a where both bodies are, the front one (A) wins '+JSON.stringify(s3));
await ready(pg,[P.onlyB]);await pg.mouse.move(P.onlyB.x,P.onlyB.y);await shownIs(pg,P.names[1],'3b B shown on B only');const s3b=await state(pg);ok(s3b.shown===P.names[1],'3b on B only → B '+JSON.stringify(s3b));
/* 4 · click strikes what is shown (the overlap point → A) */
const logs=await pg.evaluate(()=>{window.__l106=[];BUS.on('log',d=>window.__l106.push(String(d.html)));return 1});
await ready(pg,[P.both]);await pg.mouse.move(P.both.x,P.both.y);await shownIs(pg,P.names[0],'4 A shown before the click');await pg.mouse.click(P.both.x,P.both.y);
await pg.waitForFunction(()=>cur().hitTargets.size>0,null,{timeout:8000}).catch(()=>{});await T.until(pg,'4 the strike is logged',n=>(window.__l106||[]).join(' ').includes(n),P.names[0],4000);
const s4=await pg.evaluate(()=>({hits:[...cur().hitTargets],A:'n'+window.__A.id,log:(window.__l106||[]).join(' | ').replace(/<[^>]+>/g,'').slice(0,300)}));
ok(s4.hits.length===1&&s4.hits[0]===s4.A&&s4.log.includes(P.names[0]),'4 the click struck A (the shown body) '+JSON.stringify(s4));
/* 6 · Confirm attacks */
await pg.evaluate(()=>{for(let i=0;i<4&&CUR_MODAL;i++)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)});await noWin(pg);
await rearm(pg);await ready(pg);P=await pts(pg);
const row=await pg.evaluate(()=>/data-set="confirmAtk106"/.test(settingsHTML('general')));ok(row,'6a Settings row present offline');
await pg.evaluate(()=>{SETTINGS.confirmAtk106=true});
await ready(pg,[P.A]);await pg.mouse.move(P.A.x,P.A.y);await shownIs(pg,P.names[0],'6b A shown before the click');await pg.mouse.click(P.A.x,P.A.y);await T.until(pg,'6b the Strike dialog',()=>!!document.querySelector('.ask76bg'),null,4000);
const d1=await pg.evaluate(()=>{const bg=document.querySelector('.ask76bg');return {dlg:!!bg,txt:bg?bg.textContent:'',hits:cur().hitTargets.size}});
ok(d1.dlg&&d1.txt.includes('Strike '+P.names[0]+'?')&&d1.hits===0,'6b dialog before the strike '+JSON.stringify(d1));
await pg.click('.ask76bg [data-ask76="0"]');await noWin(pg);ok(await pg.evaluate(()=>cur().hitTargets.size===0),'6c No → no strike');
await pg.mouse.click(P.A.x,P.A.y);await T.until(pg,'6d the Strike dialog again',()=>!!document.querySelector('.ask76bg'),null,4000);await pg.click('.ask76bg [data-ask76="1"]');
await pg.waitForFunction(()=>cur().hitTargets.size>0,null,{timeout:8000}).catch(()=>{});
ok(await pg.evaluate(()=>cur().hitTargets.has('n'+window.__A.id)),'6d Yes → strike');
await pg.evaluate(()=>{for(let i=0;i<4&&CUR_MODAL;i++)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)});await noWin(pg);
await rearm(pg);await ready(pg);P=await pts(pg);
/* online: row hidden, setting ignored (no dialog) */
const on=await pg.evaluate(()=>{ONLM.on=true;return {row:/data-set="confirmAtk106"/.test(settingsHTML('general')),onl:aim106Online()}});
await ready(pg,[P.A]);await pg.mouse.click(P.A.x,P.A.y);
/* the strike first (a dialog would hold it), then: no dialog was shown */
await pg.waitForFunction(()=>cur().hitTargets.size>0||!!document.querySelector('.ask76bg'),null,{timeout:8000}).catch(()=>{});
const d2=await pg.evaluate(()=>({dlg:!!document.querySelector('.ask76bg')}));
const d2h=await pg.evaluate(()=>{ONLM.on=false;SETTINGS.confirmAtk106=false;return cur().hitTargets.size});
ok(on.onl&&!on.row&&!d2.dlg&&d2h===1,'6e Online: row hidden, no dialog, strike goes through '+JSON.stringify({on,d2,d2h}));
await pg.evaluate(()=>{for(let i=0;i<4&&CUR_MODAL;i++)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)});await noWin(pg);
/* 7 · Reduce motion: no pulse timer */
await rearm(pg);await ready(pg);P=await pts(pg);
const rm=await pg.evaluate(async()=>{SETTINGS.calm=true;AIM106.hov=null;return 1});await ready(pg,[P.far]);await pg.mouse.move(P.far.x,P.far.y);await shownIs(pg,null,'7 far: nothing shown');await ready(pg,[P.A]);await pg.mouse.move(P.A.x,P.A.y);await shownIs(pg,P.names[0],'7 A shown (Reduce motion)');
const rm2=await pg.evaluate(()=>({timer:AIM106.timer,pulse:aim106Pulse(),shown:!!aim106Shown()}));ok(rm2.shown&&!rm2.timer&&rm2.pulse===1,'7 Reduce motion: static ring, no pulse timer '+JSON.stringify(rm2));
await pg.evaluate(()=>{SETTINGS.calm=false});
/* 8 · draw cost: hover on vs the module bypassed, same aiming state */
const cost=await pg.evaluate(async()=>{const keep={...AIM106.hov};const on=[],off=[];const med=a=>a.sort((x,y)=>x-y)[a.length>>1];
  for(let i=0;i<4;i++)draw();
  for(let k=0;k<3;k++){for(let i=0;i<20;i++){AIM106.off=true;const t=performance.now();draw();off.push(performance.now()-t)}
    for(let i=0;i<20;i++){AIM106.off=false;AIM106.hov=keep;AIM106.t0=0;const t=performance.now();draw();on.push(performance.now()-t)}}
  AIM106.off=false;return {on:+med(on).toFixed(2),off:+med(off).toFixed(2),built:AIM106.stats.built,rec:AIM106.stats.rec}});
ok(cost.on-cost.off<=1,'8 draw cost hover on vs off ≤ +1 ms '+JSON.stringify(cost));console.log('DRAWCOST',JSON.stringify(cost));
await pg.context().close();
/* 5 · touch */
pg=await open({},true);const st5=await start(pg);await ready(pg);P=await pts(pg);ok(st5.on&&P.A,'5 touch setup');
await ready(pg,[P.A,P.far]);await pg.touchscreen.tap(P.A.x,P.A.y);await selIs(pg,P.names[0],'5a first tap selects A');let t1=await state(pg);if(t1.sel!==P.names[0])await diag106(pg,'5a',P);ok(t1.sel===P.names[0]&&t1.shown===P.names[0]&&t1.hits.length===0,'5a first tap selects (no strike) '+JSON.stringify(t1));
await ready(pg,[P.far]);await pg.touchscreen.tap(P.far.x,P.far.y);await selIs(pg,null,'5b tap elsewhere cancels');let t2=await state(pg);ok(!t2.sel&&t2.hits.length===0,'5b tap elsewhere cancels '+JSON.stringify(t2));
await ready(pg,[P.A]);await pg.touchscreen.tap(P.A.x,P.A.y);await selIs(pg,P.names[0],'5c first tap selects A again');await ready(pg,[P.A]);await pg.touchscreen.tap(P.A.x,P.A.y);
await pg.waitForFunction(()=>cur().hitTargets.size>0,null,{timeout:8000}).catch(()=>{});const t3=await state(pg);
ok(t3.hits.length===1&&t3.hits[0]===t3.aKey,'5c second tap on the same target strikes it '+JSON.stringify(t3));
await pg.context().close();
/* 9 · kill switch */
pg=await open({flavius_v106aimoff:'1'});const st9=await start(pg);
const k9=await pg.evaluate(()=>({off:AIM106.off,row:/data-set="confirmAtk106"/.test(settingsHTML('general')),figs:AIM106.figs.length}));
await pg.mouse.move(700,450);await pg.evaluate(()=>__W.frames(3));const k9b=await pg.evaluate(()=>({cursor:cv.style.cursor,hov:!!AIM106.hov}));
ok(k9.off&&!k9.row&&k9.figs===0&&!k9b.hov&&k9b.cursor==='','9 kill switch: nothing recorded, no row, no hover '+JSON.stringify({k9,k9b}));
await pg.context().close();
await b.close();srv.close();
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
