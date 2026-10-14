/* v1.0 276-v100gear — THE 3D GEAR LOOK IN THE GAME: a soldier-kit Studio character holding an OLD (T93_VER 1) token is re-converted
   ONCE in the background with the PRE-BAKED printed pieces (assets/gear100.js loaded on demand, no sculptor in the bundle, the bake made
   from today's sources), its pieces merged into one mesh, the armed stand (sword 15°, straight wrist), the sheet inside its bounds,
   saved once and not again; the scutum passes the round-8 shield check in all 8 facings; the board draws the sheet at the minis' size
   rule whatever height a caller asks. Prints the conversion time. SHOT=dir saves screenshots.
   v1.0 follow-up (his 2a 3a 4a): the BODY comes pre-baked too, simplified like the pieces (assets/body100.js from today's sources, worn
   without a fresh build); the bow's
   STRING is drawn (tip → draw hand → tip in the armed stand, straight when the hand is away); BEST FIT — every printed class kit + the max load,
   every preset pose, all 8 facings: nothing reaches past the tile (half a tile either side, the lowest corner), the base stays 0.8 tile, and
   real sheets agree pixel for pixel with the measure; every class's armed stand keeps ≥70% of its size (spears/tridents stand upright).
   v1.0 (his 2b + BUG note): EVERY printed class kit × every preset keeps ≥70% (the max load ≥60%: its scutum, not a shaft) (a long shaft is raised toward the diagonal, then shortened,
   display only); no elbow bends the wrong way in any kit × preset; the archer (armed stand + Aim): bow arm nearly straight with a slight
   outward bend, the draw elbow back and out at shoulder height behind the head, in all 8 facings.
   v1.0 (his Aim note: the draw arm went through his body): the draw hand at the cheek, forearm within 35° of the arrow, and NO ARM through
   the torso / neck / head (armClash) in every kit × preset × 8 facings. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const ROOT=path.dirname(path.resolve(process.argv[2]));
/* the bake on disk: today's sources, ≤ ~300 KB, and the sculptor is not shipped in the bundle */
const {srcHash}=require(path.join(ROOT,'tools/art/rig92/mkgear.js'));const gtxt=fs.readFileSync(path.join(ROOT,'assets/gear100.js'),'utf8');const ttxt=fs.readFileSync(path.join(ROOT,'assets/tok93.js'),'utf8');
const gsrc=(/"src":"(\w+)"/.exec(gtxt)||[])[1];
ok(gsrc===srcHash(),'assets/gear100.js made from today\'s rig92 sources (re-run node tools/art/rig92/mkgear.js) '+JSON.stringify({file:gsrc,now:srcHash()}));
ok(gtxt.length<=320000&&gtxt.length>=100000,'pre-baked file 100–320 KB '+gtxt.length);
ok(!/function sculptHelm|function fieldOf/.test(ttxt)&&/function loadBaked/.test(ttxt)&&/MeshoptDecoder/.test(ttxt),'tok93.js: decoder + loader, no sculptor');
const btxt=fs.readFileSync(path.join(ROOT,'assets/body100.js'),'utf8');const bsrc=(/"src":"(\w+)"/.exec(btxt)||[])[1];
ok(bsrc===srcHash()&&/window\.BODY100=/.test(btxt),'assets/body100.js made from today\'s rig92 sources '+JSON.stringify({file:bsrc,now:srcHash()}));
const bnv=+((/"nv":(\d+)/.exec(btxt)||[])[1]||0);
ok(btxt.length<=420000&&btxt.length>=150000&&bnv>=15000&&bnv<=60000,'pre-baked body simplified like the pieces (his 2a): 150–420 KB, 15k–60k vertices '+JSON.stringify({bytes:btxt.length,nv:bnv}));
ok(ttxt.length<=260000&&/function loadBody8/.test(ttxt),'tok93.js stays lean (+ the body loader) '+ttxt.length);
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
    body:api.bodyBaked,bodyWhy:api.bodyWhy,stats:api.stats&&{verts:api.stats.verts,ms:api.stats.ms},
    puts:window.__puts,v:t.v,pk:t.pk,meta:t.meta,len:(t.sheet||'').length,webp:/^data:image\/(webp|png)/.test(t.sheet||''),pose:t.pose,h:t.h,hNow:t93Hash(c,t.pose),gear,cloth:t.parts&&t.parts.look&&t.parts.look.cloth,
    armed:api.standFor?api.standFor(gear)===t.pose:false,presets:!!plain,wr:gear.wR}});
const M=A.meta||[];
console.log('CONVERT',JSON.stringify({ms:A.ms,buildMs:A.buildMs,sheetMs:A.sheetMs,gearMs:A.gearMs,baked:A.baked,body:A.body,stats:A.stats,len:A.len,meta:M}));
ok(A.body&&A.body.verts>=15000&&!A.bodyWhy&&A.stats&&A.stats.ms&&A.stats.ms.core!=null&&A.stats.ms.weights==null,'the body is worn from the bake (no field, no weights on the device) '+JSON.stringify({body:A.body,why:A.bodyWhy,ms:A.stats&&A.stats.ms}));
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
/* 2b. his 3a: the bow string (drawn in the armed stand: tip → right hand → tip; straight when the hand is away) */
const BW=await pg.evaluate(()=>{const api=T93.api;const g={head:{t:'galea'},wR:{t:'bow',k:'bow'}};const bowOf=()=>{let b=null;api.B.group.traverse(o=>{if(o.userData&&o.userData.w4&&o.userData.w4.k==='bow')b=o});return b};
  const n=()=>{let k=0;api.B.group.traverse(o=>{if(o.name==='bowstring')k++});return k};
  api.apply({gear:g,pose:api.standFor(g)});api.facings(64);const a=Object.assign({},(bowOf()||{userData:{}}).userData.string);
  api.apply({gear:g,pose:api.presets.find(p=>p[0]==='salute')[2]});api.facings(64);const b=Object.assign({},(bowOf()||{userData:{}}).userData.string);
  const ns=n();api.apply({gear:{head:{t:'galea'},wR:{t:'sword',k:'gladius'}}});return {a,b,ns,after:n()}});
ok(BW.ns===4&&BW.after===0&&BW.a.drawn===true&&BW.b.drawn===false,'bow string: drawn to the hand in the armed stand, straight in a salute, gone with the bow '+JSON.stringify(BW));
/* 2b'. his BUG note: the archer's elbows — bow arm nearly straight with a slight outward bend, the draw elbow back and out at shoulder
   height behind the head; in the armed stand and the Aim preset, all 8 facings */
const EL=await pg.evaluate(()=>{const api=T93.api;const g={head:{t:'galea'},wR:{t:'bow',k:'bow'}};api.apply({gear:g,pose:api.standFor(g)});const a=api.elbows();const ac=api.clash();api.facings(64);
  let bow=null;api.B.group.traverse(o=>{if(o.userData&&o.userData.w4&&o.userData.w4.k==='bow')bow=o});const str=Object.assign({},bow.userData.string);
  api.apply({gear:g,pose:api.presets.find(p=>p[0]==='aim')[2]});const b=api.elbows();const bc=api.clash();api.apply({gear:{head:{t:'galea'},wR:{t:'sword',k:'gladius'}}});
  return {stand:{ok:a.bowOk&&ac.ok,n:a.rows.length,R:a.rows[0].R,L:a.rows[0].L,cl:ac.worst},aim:{ok:b.bowOk&&bc.ok,n:b.rows.length,R:b.rows[0].R,L:b.rows[0].L,cl:bc.worst},str}});
ok(EL.stand.ok&&EL.aim.ok&&EL.stand.n===8&&EL.aim.n===8&&EL.str.drawn===true,'archer: elbows bend naturally, draw hand at the cheek, forearm along the arrow, no arm through the body (armed stand + Aim, 8 facings), string still drawn '+JSON.stringify(EL));
/* 2c. his 4a: BEST FIT — every printed class kit + max load × every preset × 8 facings stays inside its tile (the measure); the base is untouched */
const FIT=await pg.evaluate(async()=>{const api=T93.api;const kits=[['max load',{head:{t:'murmillo'},chest:{t:'thorax'},belt:{t:'balteus'},arm:{R:{upper:{t:'galerus'},lower:{t:'bracers'}},L:{upper:{t:'manica'},wraps:1}},leg:{L:{upper:{t:'thighplate'},lower:{t:'cnemis'}},R:{upper:{t:'thighplate'},lower:{t:'ocrea'}}},wR:{t:'sword',k:'gladius'},wL:{t:'scutum',k:'scutum'}}]];
  for(const k of ['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio']){const c=blankChar();charFromClass(c,k);c.classRef='cls:'+k;kits.push([k,t93Parts(c).gear,t93Parts(c).look])}
  const rows=[],anatBad=[],clashBad=[];let worst=null,minF=1,base0=api.baseG.scale.x,shafts=0;
  for(const [k,g,look] of kits){api.apply({look:look||{},gear:g});const stand=api.standFor(g);
    for(const [pk,,pj] of api.presets){api.apply({pose:pk==='stand'?stand:pj});const f=api.fitTile({keep:true});const r=api.reach();f.restore();
      const el=api.elbows();if(!el.anatOk)anatBad.push(k+'/'+pk);const cl=api.clash();if(!cl.ok)clashBad.push(k+'/'+pk+' '+JSON.stringify(cl.worst));if(f.shaft)shafts++;
      const row={k,pk,f:f.f,sh:f.shaft&&[f.shaft.a,f.shaft.k],hw:+r.hw.toFixed(4),dn:+r.dn.toFixed(4),lim:+(r.tileHalf).toFixed(4)};rows.push(row);if(f.f<minF){minF=f.f;worst=row}}
    await new Promise(r=>setTimeout(r,0))}
  const bad=rows.filter(r=>r.hw>r.lim+1e-4||r.dn>r.lim/2+1e-4);const small=rows.filter(r=>r.k!=='max load'&&r.f<0.7),maxMin=Math.min(...rows.filter(r=>r.k==='max load').map(r=>r.f));
  const perPose={};for(const r of rows.filter(r=>r.k!=='max load'))perPose[r.pk]=Math.min(perPose[r.pk]==null?1:perPose[r.pk],r.f);
  return {n:rows.length,bad:bad.slice(0,5),small:small.slice(0,6),maxMin,anatBad,clashBad,shafts,perPose,minF,worst,base:api.baseG.scale.x===base0&&base0===1,
    spill:rows.filter(r=>r.f<0.999).length,kits:kits.length,presets:api.presets.length,stands:Object.fromEntries(rows.filter(r=>r.pk==='stand').map(r=>[r.k,r.f]))}});
console.log('FIT',JSON.stringify({n:FIT.n,spill:FIT.spill,shafts:FIT.shafts,minF:FIT.minF,worst:FIT.worst,stands:FIT.stands}));console.log('PERPOSE',JSON.stringify(FIT.perPose));
ok(FIT.n===FIT.kits*FIT.presets&&FIT.kits===9&&FIT.presets>=20&&!FIT.bad.length&&FIT.base&&FIT.minF>=0.6,'best fit: every class kit + max load × every preset inside the tile, base untouched '+JSON.stringify({n:FIT.n,bad:FIT.bad,minF:FIT.minF,base:FIT.base}));
/* his 2b: no pose shrinks a figure below 70% — a long shaft is raised toward the diagonal / shortened instead (display only) */
ok(!FIT.small.length&&FIT.shafts>0&&FIT.maxMin>=0.6,'every printed class kit × every preset keeps ≥70% of its size (long shafts raised/shortened); the max load (scutum, no shaft) ≥60% '+JSON.stringify({small:FIT.small,maxMin:FIT.maxMin,shafts:FIT.shafts}));
/* every elbow bends the natural way (the upper arm's own hinge) in every kit × preset × facing */
ok(!FIT.anatBad.length,'no elbow bent the wrong way '+JSON.stringify(FIT.anatBad.slice(0,6)));
/* his Aim note: no arm goes through the body — upper arm / forearm / hand of both arms vs chest, belly, neck, head (armClash), every kit × preset × 8 facings */
ok(!FIT.clashBad.length,'no arm passes through the torso, neck or head '+JSON.stringify(FIT.clashBad.slice(0,6)));
/* the armed stand (what a converted character wears by default) keeps at least 70% of its size in every class: long shafts stand upright */
ok(Object.keys(FIT.stands).length===9&&Object.values(FIT.stands).every(f=>f>=0.7),'armed stands fit without shrinking much '+JSON.stringify(FIT.stands));
/* … and real sheets agree in pixels: the max load in its worst pose and a spear held wide */
const PX=await pg.evaluate(async()=>{const api=T93.api;const out=[];const g={head:{t:'murmillo'},chest:{t:'thorax'},belt:{t:'balteus'},arm:{R:{upper:{t:'galerus'},lower:{t:'bracers'}},L:{upper:{t:'manica'},wraps:1}},leg:{L:{upper:{t:'thighplate'},lower:{t:'cnemis'}},R:{upper:{t:'thighplate'},lower:{t:'ocrea'}}},wR:{t:'sword',k:'gladius'},wL:{t:'scutum',k:'scutum'}};
  for(const [gg,pk] of [[g,'lunge'],[{wR:{t:'spear',k:'hasta'}},'throw']]){api.apply({gear:gg,pose:api.presets.find(p=>p[0]===pk)[2]});const s=await api.sheetAsync();out.push(Object.assign({pk},s.tile,{meta:s.meta}))}
  api.apply({gear:{},pose:api.presets[0][2]});return out});
ok(PX.every(t=>t.half<=t.limH+0.5&&t.below<=t.limD+0.5&&Math.abs(t.limH-49.9)<0.2),'real sheets inside the tile (px) '+JSON.stringify(PX));
if(SHOT)await pg.screenshot({path:SHOT+'/tv100g_studio.png'});
/* 3. the board: the minis' size rule whatever height a caller asks */
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,500));menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'cc_g100',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}})});
await until(()=>typeof S!=='undefined'&&S&&S.players&&S.players[0]&&S.players[0].cls==='cc_g100',30000);await pg.waitForTimeout(2500);
const D=await pg.evaluate(async()=>{for(let i=0;i<12&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300))}
  const p=S.players[0];const t=tokenForP(p);for(let i=0;i<30&&!(t.t93&&t93Img(t.t93));i++)await new Promise(r=>setTimeout(r,100));
  /* v1.01 G19 re-patches ctx.drawImage on use and calls BS101.nat: hook the native one it forwards to */const W=[];const hk=o=>function(){if(arguments.length===9)W.push(arguments[7]);return o.apply(this,arguments)};const G19=typeof bs101Patch==='function'&&typeof BS101!=='undefined';if(G19)bs101Patch();const di=G19?BS101.nat:ctx.drawImage;if(G19)BS101.nat=hk(di);else ctx.drawImage=hk(di);
  try{W.length=0;drawFigureTok(t,300,300,TW*1.3);const a=W.slice(-1)[0];W.length=0;drawFigureTok(t,300,300,TW*1.0);const c=W.slice(-1)[0];return {t93:!!t.t93,a,c,TW,want:t.t93.meta[0]*TW*MINI_BASE/25.4/MINI_PXMM}}finally{if(G19)BS101.nat=di;else ctx.drawImage=di}});
ok(D.t93&&D.a&&Math.abs(D.a-D.c)<0.01&&Math.abs(D.a-D.want)<0.5,'board size rule TW·MINI_BASE/(25.4·MINI_PXMM) '+JSON.stringify(D));
if(SHOT)await pg.screenshot({path:SHOT+'/tv100g_board.png'});
console.log('MISS',JSON.stringify(miss));if(miss.length)process.exitCode=1;console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close()})();
