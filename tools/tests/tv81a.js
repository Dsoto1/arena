/* v0.81 art: his sharper armor files (avatar + cards), V-cut pair leg thumbnails, round-3 fits baked, one fit for the Manica and the
   'spaulder' alias, Belt I over the chest plate, the Thracian Helm (Hero, L2 market, fit tool), the Veteranus' Forged Chest Armor,
   data-only TTS pieces, class token rounds for drops (printed + a generated custom round), the wooden stands.
   Optional argv[3] = a folder for screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const bad=[];pg.on('requestfailed',r=>{if(!/fonts\./.test(r.url()))bad.push(r.url())});pg.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);const SHOT=process.argv[3];
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();const r={};
  /* every new asset loads */
  const files=[...Object.values(ART81).map(a=>a.f),...Object.values(THUMB81),...PTOK81_CLS.map(c=>'ptok81_'+c+'.webp'),...PTOK81_CLS.map(c=>'ptokf81_'+c+'.webp'),'ptokring81.webp',STANDS81.f];
  const load=f=>new Promise(res=>{const i=new Image();i.onload=()=>res(i.naturalWidth>0);i.onerror=()=>res(false);i.src=assetURL(f)});r.assets=(await Promise.all(files.map(load))).every(Boolean);r.nAssets=files.length;
  /* fits */
  r.baked=ARM_FIT.galea.w===35&&ARM_FIT.galea.dy===-7&&ARM_FIT.thorax.w===107&&ARM_FIT.thorax.dy===-2&&ARM_FIT.lgreaves.L.dy===-8&&ARM_FIT.balteus1.dy===4&&ARM_FIT.balteus1.at==='belt'&&ARM_FIT.steelhelm.w===38&&ARM_FIT.amazon.r===-1&&ARMFIT_BAKED>='2026-10-03T19:57:17.883Z';
  ARM_FIT_OVR.provmanica={dx:5};const A1=armBox('provmanica','larm'),A2=armBox('spaulder','larm');delete ARM_FIT_OVR.provmanica;r.alias=A1.cx===A2.cx&&A1.w===A2.w;
  /* avatar uses the file; cards use the file; pair thumbs re-cut */
  const pl=(arm)=>{const p={id:'t81',name:'t',hp:{},ap:{},pieces:{}};for(const l of LOCS){p.hp[l]=5;p.ap[l]=0;p.pieces[l]=[]}for(const [k,l] of arm){p.pieces[l].push({key:k,n:ARM[k].n,ap:ARM[k].ap});p.ap[l]+=ARM[k].ap}return p};
  const sv=avatarSVG(pl([['thorax','chest'],['balteus1','chest'],['thrachelm','head'],['greaves','rleg']]));r.avFile=sv.includes('arm81_thorax.webp')&&sv.includes('arm81_thracian.webp')&&sv.includes('arm81_greaves.webp');
  const z=sv.indexOf('arm81_thorax.webp'),zb=sv.search(/clip-path="url\(#acp\w*balteus1\)"/);r.beltTop=zb>z;
  r.cards=/arm81_crista/.test(cardStyle('a:crista'))&&/arm81_thracian/.test(cardStyle('a:thrachelm'))&&/armthumb81_ocrea/.test(cardStyle('a:ocrea'))&&/armthumb81_greaves/.test(cardStyle('a:greaves'))&&/armor2/.test(cardStyle('a:bracers'))&&/armor2/.test(cardStyle('a:galea'));
  /* Thracian Helm + classes + market + data-only pieces */
  const T=ARM.thrachelm;r.thr=T&&T.n==='Thracian Helm'&&T.lv===2&&T.slot==='head'&&T.ap===4&&!!ARM_FIT.thrachelm&&ARM_FIT.thrachelm.w===ARM_FIT.crista.w;
  r.hero=CLASSES.hero.armor.some(a=>a[0]==='thrachelm')&&!CLASSES.hero.armor.some(a=>a[0]==='murmillo');r.vet=CLASSES.veteranus.armor.some(a=>a[0]==='musculata'&&a[1]==='chest')&&!CLASSES.veteranus.armor.some(a=>a[0]==='flavchest');
  gearRebuild();r.market=MARKET_A[2].includes('thrachelm')&&MARKET_A[1].includes('steelhelm')&&MARKET_A[2].includes('ornate');
  r.tts=ARM.chestarm81&&ARM.chestarm81.ap===4&&ARM.chestarm81.lv===2&&ARM.rarmarm81.ap===3&&ARM.rarmarm81.lv===3&&ARM.rarmarm81.pt==='lower'&&!Object.keys(ARM).includes('chestarm81');
  /* the fit tool lists it */
  localStorage.setItem('flavius_armfit_on','1');ST.gearSub='a';ST.ca=blankCA();openStudio('gear');await W8(900);const f3=document.querySelector('[data-afit3]');if(f3){f3.click();await W8(500)}
  const sel=document.querySelector('[data-afkey]');r.fitTool=!!sel&&[...sel.options].some(x=>x.value==='thrachelm');r.designer=!!document.querySelector('#stBody, #mBody')&&document.body.innerHTML.includes('Thracian Helm');
  localStorage.removeItem('flavius_armfit_on');if(CUR_MODAL)CUR_MODAL.done(null);await W8(400);
  /* the Hero in play wears it */
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'veteranus',cpu:true},{cls:'soldier',cpu:true}],opts:{spect:6}});await W8(2500);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(150)}
  const H=S.players.find(p=>p.cls==='hero'),V=S.players.find(p=>p.cls==='veteranus');r.heroPlay=(H.pieces.head||[]).some(x=>x.key==='thrachelm');r.vetPlay=(V.pieces.chest||[]).some(x=>x.key==='musculata');
  /* drops: printed round, custom generated round */
  CLASSES.cc_t81={...CLASSES.soldier,name:'Teal',color:'#1e8a8a',custom:true};const C3=S.players.find(p=>p.cls==='soldier');C3.cls='cc_t81';
  for(const p of [H,C3]){const P=pileFor(p);P.weapons.push({...W.gladius,key:'gladius'})}
  PTOK81_DRAWN.n=0;for(let i=0;i<8&&!(PTOK81_GEN['#1e8a8a']);i++){draw();await W8(250)}draw();r.drops=PTOK81_DRAWN.n>=2;const G=PTOK81_GEN['#1e8a8a'];r.custom=!!G&&G.width>0;
  STANDS81.drawn=0;draw();r.stands=STANDS81.drawn>0&&!!STANDS81.pat;
  window._t81={h:H.r+','+H.c,c:C3.r+','+C3.c};return r});
if(SHOT){await pg.evaluate(()=>{for(let i=0;i<4&&CUR_MODAL;i++)CUR_MODAL.done(null)});await pg.waitForTimeout(400);
  await pg.screenshot({path:SHOT+'/art_stands_drops.png'});
  const box=await pg.evaluate(()=>{const cv=document.querySelector('canvas');const R=cv.getBoundingClientRect();const k=R.width/cv.width;const out=[];for(const p of S.players){const m=center(p.r,p.c);out.push({x:R.left+(m.x+TW*0.18)*k,y:R.top+m.y*k})}return out});
  for(let i=0;i<2;i++){const c=box[i===0?0:2];await pg.screenshot({path:SHOT+'/art_drop'+i+'.png',clip:{x:Math.max(0,c.x-120),y:Math.max(0,c.y-100),width:240,height:180}})}}
const a=o.a;ok(a.assets&&!bad.length,'new assets load');ok(a.baked,'round-3 fits baked');ok(a.alias,'Manica + spaulder share one fit');ok(a.avFile,'avatar wears the sharp files');ok(a.beltTop,'Belt I over the chest plate');
ok(a.cards,'cards: files + V pair thumbs');ok(a.thr&&a.hero&&a.heroPlay,'Thracian Helm on the Hero');ok(a.vet&&a.vetPlay,'Veteranus Forged Chest');ok(a.market,'market pools');ok(a.tts,'TTS data pieces');
ok(a.fitTool,'fit tool lists the Thracian Helm');ok(a.drops,'drops use token rounds');ok(a.custom,'custom round generated');ok(a.stands,'stands texture drawn');
console.log(JSON.stringify(o));console.log('BAD',bad.slice(0,4));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
