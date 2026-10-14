/* v1.02 E 336-v102tok — 3D TOKENS: D2 one fixed figure size (rig92 FIG_SCALE; no shrink for weapons / armor / pose; long weapons angled about
   the grip, only the weapon may reach past the tile; the drawn head about 55% of a pillar on the board for every printed class's animated
   sheet; stored Studio tokens and this device's animated sets re-render once); D1 the grip in the poser (⚔ Weapon tab: turn about the grip
   and slide along it, per hand, in the pose JSON ≤ 600 B, used by the sheet); tok93.js under its 260 KB cap; no new errors. SHOT=dir. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const ROOT=path.dirname(path.resolve(process.argv[2]));
const ttxt=fs.readFileSync(path.join(ROOT,'assets/tok93.js'),'utf8');
ok(ttxt.length<=260000&&/FIG_SCALE\s*=\s*0\.\d+/.test(ttxt)&&/function applyGrip/.test(ttxt),'tok93.js: fixed figure scale + grip, under the 260 KB cap '+ttxt.length);
const pg=await b.newPage({viewport:{width:1440,height:950}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]),{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
const until=async(fn,ms=150000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:150});return true}catch(e){return false}};
/* 1. D2 in the engine: every printed class kit + a max load × every preset × 8 facings: the figure keeps FIG_SCALE (f 1), the body (weapons
      left out) stays inside the tile; long weapons get an angle instead of a shrink */
const F=await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);const api=await t93Load();const kits=[['max load',{head:{t:'murmillo'},chest:{t:'thorax'},belt:{t:'balteus'},arm:{R:{upper:{t:'galerus'},lower:{t:'bracers'}},L:{upper:{t:'manica'},wraps:1}},leg:{L:{upper:{t:'thighplate'},lower:{t:'cnemis'}},R:{upper:{t:'thighplate'},lower:{t:'ocrea'}}},wR:{t:'sword',k:'gladius'},wL:{t:'scutum',k:'scutum'}}],['naked',{}],['spear',{wR:{t:'spear',k:'hasta'}}]];
  for(const k of ['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio']){const c=blankChar();charFromClass(c,k);c.classRef='cls:'+k;kits.push([k,t93Parts(c).gear,t93Parts(c).look])}
  const S0=api.B.group.scale.x,rows=[],out=[],shafts=[];
  for(const [k,g,look] of kits){api.apply({look:look||{},gear:g});const stand=api.standFor(g);
    for(const [pk,,pj] of api.presets){api.apply({pose:pk==='stand'?stand:pj});const f=api.fitTile({keep:true});const sc=api.B.group.scale.x;const r=api.reach();f.restore();
      const row={k,pk,f:f.f,sc:+sc.toFixed(4),hw:f.hw,dn:f.dn,lim:+r.tileHalf.toFixed(4),sh:f.shaft&&f.shaft.a};rows.push(row);if(f.shaft)shafts.push(k+'/'+pk+':'+f.shaft.a);
      if(f.f!==1||Math.abs(sc-S0)>1e-6||f.hw>row.lim+0.03||f.dn>row.lim/2+0.03)out.push(row)}
    await new Promise(r=>setTimeout(r,0))}
  api.apply({gear:{},pose:api.presets[0][2]});
  return {S0,n:rows.length,out:out.slice(0,6),nOut:out.length,shafts:shafts.length,shaftEx:shafts.slice(0,4),worstBody:rows.reduce((a,r)=>Math.max(a,r.hw/r.lim,2*r.dn/r.lim),0)}});
console.log('FIT',JSON.stringify(F));
ok(Math.abs(F.S0-0.69)<1e-6&&F.n>=200,'the token is built at the fixed figure scale '+JSON.stringify({S0:F.S0,n:F.n}));
ok(F.nOut===0,'no kit × preset changes the figure size; its body stays inside the tile '+JSON.stringify(F.out));
ok(F.shafts>0,'long weapons are angled instead '+JSON.stringify(F.shaftEx));
/* the real sheet: same figure scale with and without the gear (anchor-to-feet unchanged), the spear may reach past the tile */
const SZ=await pg.evaluate(async()=>{const api=T93.api;const one=async g=>{api.apply({gear:g,pose:api.standFor(g)});const s=await api.sheetAsync();return {meta:s.meta,tile:s.tile,sc:api.B.group.scale.x}};
  const a=await one({}),c=await one({head:{t:'murmillo'},chest:{t:'thorax'},wR:{t:'sword',k:'gladius'},wL:{t:'scutum',k:'scutum'}});api.apply({gear:{},pose:api.presets[0][2]});return {a,c}});
ok(SZ.a.sc===SZ.c.sc&&SZ.a.tile.f===1&&SZ.c.tile.f===1,'a sheet never shrinks the figure '+JSON.stringify(SZ));
/* 2. D1 the grip: turn + slide move the held weapon about its grip, ride in the pose JSON (≤ 600 B), round-trip, reset on a pose without it */
const G=await pg.evaluate(async()=>{const api=T93.api;const g={wR:{t:'sword',k:'gladius'},wL:{t:'scutum',k:'scutum'}};api.apply({gear:g,pose:api.standFor(g)});
  const T=window.THREE93;const wpn=()=>{let m=null;api.B.group.traverse(o=>{if(o.userData&&o.userData.w4&&!m)m=o});return m};
  const tip=()=>{const m=wpn();m.updateMatrixWorld(true);return m.localToWorld(new T.Vector3(0,0.5,0)).toArray().map(v=>+v.toFixed(4))},grip=()=>{const m=wpn();return m.localToWorld(new T.Vector3(0,0,0)).toArray().map(v=>+v.toFixed(4))};
  const h=api.holds();const t0=tip(),g0=grip();const p0=api.pose();
  api.setGrip('R',[60,0]);const t1=tip(),g1=grip();api.setGrip('R',[60,40]);const g2=grip();api.setGrip('L',[-30,20]);
  const pj=api.pose();const big=JSON.parse(pj);
  /* the longest pose a player can make: every joint at its limit + both grips */
  const s1=await api.sheetAsync();const u1=s1.canvas.toDataURL();
  api.setPose(p0);const back=api.grip();const s0=await api.sheetAsync();const u0=s0.canvas.toDataURL();
  api.setPose(pj);const again=api.grip();api.apply({pose:api.presets[0][2]});const cleared=api.grip();
  const J={};for(const k of ['pe','sp','ch','ne','he','sL','eL','wL','sR','eR','wR','hL','kL','aL','hR','kR','aR'])J[k]=[-179,-179,-179];
  const long=JSON.stringify({v:JSON.parse(p0).v,p:[-450,-450,-450],j:J,f:{L:[-450,-450,-179],R:[-450,-450,-179]},g:{R:[-180,-150],L:[-180,-150]}});api.setPose(long);const lp=api.pose();
  api.apply({gear:{},pose:api.presets[0][2]});
  const d=(a,c)=>Math.hypot(a[0]-c[0],a[1]-c[1],a[2]-c[2]);
  return {h,turnMoved:d(t0,t1),gripStay:d(g0,g1),slide:d(g1,g2),g:big.g,len:pj.length,back,again,cleared,diff:u0!==u1,lp:lp.length}});
console.log('GRIP',JSON.stringify(G));
ok(G.h.R==='gladius'&&G.h.L==='shield','holds: gladius right, shield left '+JSON.stringify(G.h));
ok(G.turnMoved>0.05&&G.gripStay<0.002&&Math.abs(G.slide-0.04*0.69)<0.004,'turn swings the blade about the grip, slide moves it along '+JSON.stringify({t:G.turnMoved,g:G.gripStay,s:G.slide}));
ok(JSON.stringify(G.g)==='{"R":[60,40],"L":[-30,20]}'&&G.len<=600&&G.lp<=600,'the grip rides in the pose JSON (≤ 600 B, even the longest pose) '+JSON.stringify({g:G.g,len:G.len,lp:G.lp}));
ok(G.diff&&JSON.stringify(G.again)==='{"R":[60,40],"L":[-30,20]}'&&JSON.stringify(G.cleared)==='{}','the sheet uses it; it round-trips; a pose without one clears it '+JSON.stringify({diff:G.diff,again:G.again,cleared:G.cleared}));
if(SHOT){const H=await pg.evaluate(()=>{const api=T93.api;const g={wR:{t:'spear',k:'hasta'},wL:{t:'scutum',k:'scutum'}};const out=[];
    for(const gr of [{},{R:[-60,80],L:[45,-40]}]){api.apply({gear:g,pose:api.standFor(g),grip:gr});out.push(api.hero({w:360,h:420,yaw:35}).toDataURL('image/png'))}
    api.apply({gear:{},pose:api.presets[0][2]});return out});
  H.forEach((u,i)=>fs.writeFileSync(SHOT+'/tv102e_grip'+i+'.png',Buffer.from(u.split(',')[1],'base64')))}
/* 3. the poser's ⚔ Weapon tab: a soldier character; sliders change the grip, Save stores it in the token's pose */
await pg.evaluate(async()=>{await loadCustoms();const c=blankChar();c.id='v102e';c.name='Miles Tenax';charFromClass(c,'soldier');c.classRef='cls:soldier';c.created='2026-10-14';c.status='active';
  await Store.put('customChars',c.id,c);await loadCustoms();openStudio('chars');await new Promise(r=>setTimeout(r,800));ST.draft=JSON.parse(JSON.stringify(CUSTOM.chars.find(x=>x.id==='v102e')));ST.view='edit';studioRedraw();
  await new Promise(r=>setTimeout(r,300));t93Open()});
const ui=await until(()=>document.querySelector('#t93m [data-v102g="R:0"]')&&T93.ui,120000);
if(SHOT){await pg.click('#t93m [data-t93tab="grip"]');await pg.waitForTimeout(400);await pg.screenshot({path:SHOT+'/tv102e_poser_tab.png'})}
const U=await pg.evaluate(async()=>{const ov=document.getElementById('t93m');ov.querySelector('[data-t93tab="grip"]').click();await new Promise(r=>setTimeout(r,100));
  const pane=ov.querySelector('[data-t93pane="grip"]');const shown=!pane.hidden;const hands=[...ov.querySelectorAll('[data-v102h]')].map(e=>e.dataset.v102h);
  const r=ov.querySelector('[data-v102g="R:0"]');r.value='45';r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));
  ov.querySelector('[data-v102n="R:1:1"]').click();ov.querySelector('[data-v102n="R:1:1"]').click();await new Promise(r=>setTimeout(r,50));
  const g=T93.api.grip();const out=ov.querySelector('[data-v102o="R:0"]').textContent;
  T93.ui.go(-1);await new Promise(r=>setTimeout(r,50));const undone=T93.api.grip();T93.ui.go(1);await new Promise(r=>setTimeout(r,50));
  ov.querySelector('[data-t93m="save"]').click();
  for(let i=0;i<300&&document.getElementById('t93m');i++)await new Promise(r=>setTimeout(r,200));
  const c=CUSTOM.chars.find(x=>x.id==='v102e');const t=c&&c.tok93||{};
  return {shown,hands,g,out,undone,saved:!document.getElementById('t93m'),pose:t.pose,v:t.v,meta:t.meta}});
console.log('POSER',JSON.stringify(U));
ok(ui&&U.shown&&U.hands.includes('R'),'the ⚔ Weapon tab lists the hands that hold something '+JSON.stringify({ui,shown:U.shown,hands:U.hands}));
ok(JSON.stringify(U.g.R)==='[45,20]'&&U.out==='45°'&&JSON.stringify(U.undone.R)==='[45,10]','sliders and nudges set the grip; undo steps back '+JSON.stringify({g:U.g,out:U.out,undone:U.undone}));
let gp={};try{gp=JSON.parse(U.pose||'{}').g||{}}catch(e){}
ok(U.saved&&JSON.stringify(gp.R)==='[45,20]'&&U.v===3&&(U.pose||'').length<=600,'Save stores the grip in the token pose (T93_VER 3) '+JSON.stringify({saved:U.saved,g:gp,v:U.v,meta:U.meta}));
/* the animated sets this device renders for that token carry the grip (own cache key) */
const K=await pg.evaluate(()=>{const c=CUSTOM.chars.find(x=>x.id==='v102e');const t=c.tok93;const p=an100Parts({cls:'cc_v102e'},t);const q=an100Parts({cls:'cc_v102e'},t);
  const plain=Object.assign({},t,{pose:'{"v":1}'});const r=an100Parts({cls:'cc_v102e'},plain);
  return {grip:p&&p.grip,same:p===q,key:an100DevKey(p)!==an100DevKey(r),ver:AN100L.VER}});
ok(K.grip&&JSON.stringify(K.grip.R)==='[45,20]'&&K.same&&K.key&&K.ver===3,'device-rendered animated sets carry the grip (own key; ANIM100_LIB VER 3) '+JSON.stringify(K));
/* 4. the board: the drawn head (bare body, the fixed scale) about 55% of the pillar mini; every printed class's animated sheet re-rendered at
      that scale (meta v 3) — a soldier / hero (helmet, no weapon over the head) a little over half a pillar */
const P=await pg.evaluate(async()=>{const TWx=56;const pil=MINI_A.pillar[1]*(TWx*MINI_BASE/25.4/MINI_PXMM*Math.min(1,TWx*MINI_FIT/(30*TWx*MINI_BASE/25.4))*MINI_PILLAR*MINI_PILLAR75);const out={},v={};
  for(const k of Object.keys(ANIM100_META)){const M=ANIM100_META[k].move;const r=M.rows.idle[0];out[k]=+(r[4]*TWx*MINI_BASE/25.4/M.pxmm/pil).toFixed(3);v[k]=M.v}
  const api=await t93Load();api.apply({look:{},gear:{},pose:api.presets[0][2]});const s=await api.sheetAsync({pxmm:2.6});const body=+(s.meta[3]*TWx*MINI_BASE/25.4/2.6/pil).toFixed(3);
  return {pil:+(pil/TWx).toFixed(3),body,out,v}});
console.log('HEIGHT',JSON.stringify(P));
ok(Math.abs(P.pil-1.27)<0.01&&P.body>=0.5&&P.body<=0.6,'the bare figure stands about 55% of a pillar on the board '+JSON.stringify({pil:P.pil,body:P.body}));
ok(Object.keys(P.v).length===8&&Object.values(P.v).every(x=>x===3),'every printed class sheet was re-rendered at the fixed scale (meta v 3) '+JSON.stringify(P.v));
ok(P.out.soldier>=0.55&&P.out.soldier<=0.7&&P.out.hero>=0.55&&P.out.hero<=0.7,'soldier / hero sheets a little over half a pillar '+JSON.stringify(P.out));
const E=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);
ok(!E.length,'no new errors '+JSON.stringify(E).slice(0,300));
console.log('MISS',JSON.stringify(miss));if(miss.length)process.exitCode=1;console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close()})();
