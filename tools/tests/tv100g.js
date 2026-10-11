/* v1.0 276-v100gear — THE 3D GEAR LOOK IN THE GAME: a soldier-kit Studio character holding an OLD (T93_VER 1) token is re-converted
   ONCE in the background with the PRE-BAKED printed pieces (assets/gear100.js loaded on demand, no sculptor in the bundle, the bake made
   from today's sources), its pieces merged into one mesh, the armed stand (sword 15°, straight wrist), the sheet inside its bounds,
   saved once and not again; the scutum passes the round-8 shield check in all 8 facings; the board draws the sheet at the minis' size
   rule whatever height a caller asks. Prints the conversion time. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const ROOT=path.dirname(path.resolve(process.argv[2]));
/* the bake on disk: today's sources, ≤ ~300 KB, and the sculptor is not shipped in the bundle */
const {srcHash}=require(path.join(ROOT,'tools/art/rig92/mkgear.js'));const gtxt=fs.readFileSync(path.join(ROOT,'assets/gear100.js'),'utf8');const ttxt=fs.readFileSync(path.join(ROOT,'assets/tok93.js'),'utf8');
const gsrc=(/"src":"(\w+)"/.exec(gtxt)||[])[1];
ok(gsrc===srcHash(),'assets/gear100.js made from today\'s rig92 sources (re-run node tools/art/rig92/mkgear.js) '+JSON.stringify({file:gsrc,now:srcHash()}));
ok(gtxt.length<=320000&&gtxt.length>=100000,'pre-baked file 100–320 KB '+gtxt.length);
ok(!/function sculptHelm|function fieldOf/.test(ttxt)&&/function loadBaked/.test(ttxt)&&/MeshoptDecoder/.test(ttxt),'tok93.js: decoder + loader, no sculptor');
const pg=await b.newPage({viewport:{width:1440,height:950}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','1')});
await pg.goto('file://'+process.argv[2],{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const until=async(fn,ms=240000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:250});return true}catch(e){return false}};
/* 1. a soldier-kit character with a v0.93 token (T93_VER 1) → remade once with the bake */
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();const c=blankChar();c.id='g100';c.name='Miles Sculptus';charFromClass(c,'soldier');c.classRef='cls:soldier';
  c.portrait.bs='full';c.portrait.hs='crop';c.portrait.fem=false;c.created='2026-10-11';c.status='active';
  c.tok93={v:1,mode:'3d',pose:'{"p":[0,0,0],"j":{},"f":{}}',pk:'stand',parts:{},h:'oldhash',sheet:'data:image/png;base64,iVBORw0KGgo=',meta:[60,100,30,90],at:'2026-10-01'};
  await Store.put('customChars',c.id,c);await loadCustoms();
  window.__puts=0;const P=Store.put.bind(Store);Store.put=function(col,i){if(col==='customChars'&&i==='g100')window.__puts++;return P.apply(Store,arguments)};
  window.__g0=!!window.GEAR100;window.__t0=performance.now();openStudio('chars')});
const conv=await until(()=>{const c=CUSTOM.chars.find(x=>x.id==='g100');return c&&c.tok93&&c.tok93.v===2&&c.tok93.sheet&&c.tok93.sheet.length>2000});
const A=await pg.evaluate(async()=>{const ms=Math.round(performance.now()-window.__t0);await new Promise(r=>setTimeout(r,600));const c=CUSTOM.chars.find(x=>x.id==='g100'),t=c.tok93||{},api=T93.api||{};
  const plain=api.presets&&JSON.parse(JSON.stringify(api.presets.map(p=>p[0])));const gear=t93Parts(c).gear;
  return {ms,buildMs:T93.buildMs,sheetMs:T93.ms.slice(-1)[0],g0:window.__g0,g:!!window.GEAR100,gearMs:G100.ms,baked:api.baked,why:api.bakeWhy,sculpted:api.sculpted&&api.sculpted(),
    puts:window.__puts,v:t.v,pk:t.pk,meta:t.meta,len:(t.sheet||'').length,webp:/^data:image\/(webp|png)/.test(t.sheet||''),pose:t.pose,h:t.h,hNow:t93Hash(c,t.pose),gear,cloth:t.parts&&t.parts.look&&t.parts.look.cloth,
    armed:api.standFor?api.standFor(gear)===t.pose:false,presets:!!plain,wr:gear.wR}});
const M=A.meta||[];
console.log('CONVERT',JSON.stringify({ms:A.ms,buildMs:A.buildMs,sheetMs:A.sheetMs,gearMs:A.gearMs,baked:A.baked,len:A.len,meta:M}));
ok(conv&&!A.g0&&A.g&&A.baked&&A.baked.keys>=30&&!A.why,'the bake loads on demand and is worn '+JSON.stringify({conv,g0:A.g0,g:A.g,baked:A.baked,why:A.why}));
ok(['centurion','balteus','wrapsL','wrapsR','legwrapsUL','legwrapsUR'].every(k=>(A.sculpted||[]).includes(k)),'soldier kit = the sculpted printed pieces '+JSON.stringify(A.sculpted));
ok(A.puts===1&&A.v===2&&A.h===A.hNow&&A.pk==='stand','re-converted once on T93_VER 2 '+JSON.stringify({puts:A.puts,v:A.v,pk:A.pk}));
ok(A.armed&&A.pose.length<=600&&A.wr&&A.wr.k==='gladius','the armed stand with his gladius '+JSON.stringify({armed:A.armed,pose:A.pose.length,wr:A.wr}));
ok(A.cloth==='#7a1c14','loincloth per printed class '+A.cloth);
ok(M.length===4&&M[0]>=50&&M[0]<=240&&M[1]>=90&&M[1]<=240&&Math.abs(M[2]-M[0]/2)<=2&&M[3]>M[1]*0.6&&M[3]<M[1]&&A.webp&&A.len<=120000,'sheet bounds '+JSON.stringify({M,len:A.len}));
/* reopen: no second conversion */
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);const s=document.getElementById('studio');if(s&&typeof closeStudio==='function')try{closeStudio()}catch(e){}await new Promise(r=>setTimeout(r,500));openStudio('chars')});await pg.waitForTimeout(5000);
const B2=await pg.evaluate(()=>({puts:window.__puts,need:t93Needs(CUSTOM.chars.find(x=>x.id==='g100'))}));
ok(B2.puts===1&&!B2.need,'idempotent: saved once '+JSON.stringify(B2));
/* 2. the scutum + the gladius in the armed stand: shield check (8 facings) + straight wrists */
const C=await pg.evaluate(()=>{const api=T93.api;const g={head:{t:'murmillo'},chest:{t:'thorax'},belt:{t:'balteus'},arm:{R:{wraps:1},L:{upper:{t:'manica'},wraps:1}},leg:{L:{lower:{t:'ocrea'}},R:{lower:{t:'ocrea'}}},wR:{t:'sword',k:'gladius'},wL:{t:'scutum',k:'scutum'}};
  api.apply({gear:g,pose:api.standFor(g)});const sc=api.shieldCheck();const w=api.wrists();const tris=(()=>{let n=0;api.B.group.traverse(o=>{if(o.name==='s8_merged')n=o.userData.tris});return n})();
  const h={head:{t:'thrachelm'},wR:{t:'sica',k:'sica'},wL:{t:'parma',k:'thracian'}};api.apply({gear:h,pose:api.standFor(h)});const sc2=api.shieldCheck();
  return {ok:sc&&sc.ok,ang:sc&&sc.angMax,along:sc&&sc.alongMax,front:sc&&sc.frontMax,n:sc&&sc.facings.length,ok2:sc2&&sc2.ok,w,tris}});
ok(C.ok&&C.n===8&&C.ok2,'shield check: scutum + Thracian, 8 facings '+JSON.stringify(C));
ok(Math.abs(C.w.R.flex)<=15&&Math.abs(C.w.R.dev)<=10,'sword wrist straight '+JSON.stringify(C.w.R));
ok(C.tris>0,'one merged mesh for the sculpted pieces '+C.tris);
if(SHOT)await pg.screenshot({path:SHOT+'/tv100g_studio.png'});
/* 3. the board: the minis' size rule whatever height a caller asks */
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,500));menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'cc_g100',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}})});
await until(()=>typeof S!=='undefined'&&S&&S.players&&S.players[0]&&S.players[0].cls==='cc_g100',30000);await pg.waitForTimeout(2500);
const D=await pg.evaluate(async()=>{for(let i=0;i<12&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300))}
  const p=S.players[0];const t=tokenForP(p);for(let i=0;i<30&&!(t.t93&&t93Img(t.t93));i++)await new Promise(r=>setTimeout(r,100));
  const W=[];const di=ctx.drawImage;ctx.drawImage=function(){if(arguments.length===9)W.push(arguments[7]);return di.apply(this,arguments)};
  try{W.length=0;drawFigureTok(t,300,300,TW*1.3);const a=W.slice(-1)[0];W.length=0;drawFigureTok(t,300,300,TW*1.0);const c=W.slice(-1)[0];return {t93:!!t.t93,a,c,TW,want:t.t93.meta[0]*TW*MINI_BASE/25.4/MINI_PXMM}}finally{ctx.drawImage=di}});
ok(D.t93&&D.a&&Math.abs(D.a-D.c)<0.01&&Math.abs(D.a-D.want)<0.5,'board size rule TW·MINI_BASE/(25.4·MINI_PXMM) '+JSON.stringify(D));
if(SHOT)await pg.screenshot({path:SHOT+'/tv100g_board.png'});
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close()})();
