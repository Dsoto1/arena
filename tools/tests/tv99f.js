/* v0.99 ONE FACE (263-v99face phase 1 + 268-v99face2 phase 2). Phase 1 kept: Portrait detail Off = busts byte-identical to the old painter chain
   (FACE99.geom); adapters pure + deterministic (no Math.random / dice RNG, inputs untouched); every kind paints through face99; spectators / advisors
   / patrons are the bust CROPPED (head ≤39 px, chip ≥40 px); FACE1 fits the online look (3 KB) / patron (16 keys, 1 KB) limits; the Settings row.
   Phase 2: the painterly tiers (≤32 shapes only · 33–47 lite · 48–119 · ≥120 textures, grain ≥150; Light = lite everywhere); the RASTER cache (one
   picture per spec+frame+tier+px, hits after the first, a bitmap swapped into the page, the live banner draft stays vector); the variety key fx
   (generated looks + crowd roll deterministically from their own content, never Math.random; stored looks keep today's shapes; patrons too); fx
   passes the online cleanLook / cleanPatron; the 🧬 Features card in the Character / Studio lanista / new-career designers writes fx and a saved
   character keeps it; Keep hair colour; kill switch flavius_face99off=1 = phase 1 untouched; no new errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','0')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const mark=await pg.evaluate(()=>ERR92.n);
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}const o={};
  /* 1 · Off = busts byte-identical to the old chain (seeded looks, every legacy boolean) */
  SETTINGS.face99='off';face99Clear();
  let h=777;const nx=n=>{h=(Math.imul(h,1103515245)+12345)>>>0;return (h>>>8)%n};const pk=a=>a[nx(a.length)];let diff=0;
  for(let i=0;i<300;i++){const p={skin:pk(SKINS),hair:pk(HAIRS),helm:pk(HELMS)[0],fem:nx(3)===0,beard:nx(2)===0,long:nx(4)===0,smile:nx(3)===0,scar:nx(3)===0,paint:nx(5)===0,bg:pk(BGS)};
    if(nx(2)){p.hs=pk(HAIRSTYLES)[0];p.bs=pk(BEARDS.concat([['none']]))[0];p.mark=pk(MARKS)[0];p.garb=pk(GARBS)[0];p.ear=pk(EARRINGS.concat([[true]]))[0];p.neck=pk(NECKS)[0];p.face=pk(FACES)[0];p.eyes=pk(EYES)[0]}
    const c=pk(Object.values(CLASSES).map(x=>x.color));if(FACE99.geom(p,c)!==portraitSVG(p,c))diff++;
    if(FACE99.geom(face99Geo(faceNorm99(p)),c)!==FACE99.geom(p,c))diff++}
  o.diff=diff;o.offInline=!/<image data-f99/.test(portraitHTML({name:'a',portrait:gladPortrait('g_9','hero')},'md'))&&/<path/.test(portraitHTML({name:'a',portrait:gladPortrait('g_9','hero')},'md'));
  SETTINGS.face99='full';face99Clear();
  /* 2 · adapters: deterministic, pure, no randomness (fx included) */
  const mr=Math.random;let rnd=0;Math.random=()=>{rnd++;return mr()};
  const g={id:'g_401',name:'Varro',cls:'soldier'};const look={skin:'#e6cfa8',hair:'#4a2c17',beard:true,hat:'pileus',tunic:'#e8dcc0',robe:'#7a2230'};
  const adv=council83Make('career-x')[0];const pat=onlPatronDef82('acc1','House');const onl={portrait:{skin:SKINS[3],hs:'curly',bs:'goatee',helm:'thraex'},color:'#7a3a9a'};
  const rec={name:'Spartacus',cls:'slave'};const lan=MGR_PRE[0];
  const ins=[g,look,adv,pat,onl,rec,lan].map(x=>JSON.stringify(x));
  const run=()=>[fromGlad99(g),fromSpect99(look),fromCouncil99(adv),fromPatron99(pat),fromOnlLook99(onl,'hero'),fromRecord99(rec),fromLanista99(lan),faceNorm99({beard:true,scar:true,paint:true,long:true})].map(x=>JSON.stringify(x));
  const A=run(),B=run();o.det=A.every((s,i)=>s===B[i]);o.pure=[g,look,adv,pat,onl,rec,lan].every((x,i)=>JSON.stringify(x)===ins[i]);
  o.idem=A.every(s=>{const f=JSON.parse(s);return JSON.stringify(faceNorm99(f))===s});
  o.glad=JSON.stringify(fromGlad99(g))===JSON.stringify(faceNorm99({...gladPortrait('g_401','soldier'),color:CLASSES.soldier.color}));
  o.marks=(()=>{const f=faceNorm99({scar:true,paint:true});return f.mark==='scar'&&f.mark2==='paint'})();
  /* 3 · fx: generated looks roll from their own content (same fighter → same face on every path), crowd rolls, stored looks / patrons keep today's shapes */
  let rolled=0,same=0;for(let i=0;i<60;i++){const gp=gladPortrait('gx'+i,'hero');const a=faceNorm99(gp).fx;if(a)rolled++;
    const via=[faceNorm99({...gp}).fx,faceNorm99(JSON.parse(JSON.stringify(gp))).fx,fromGlad99({id:'gx'+i,cls:'hero',look:gp}).fx,faceNorm99({...gp,color:'#123456'}).fx];if(via.every(x=>x===a))same++}
  o.fxGen={rolled,same};o.fxGenFem=faceNorm99({...gladPortrait('gx1','amazonia'),fem:true}).fx===faceNorm99({...gladPortrait('gx1','amazonia'),fem:true}).fx;
  o.fxStored=faceNorm99({skin:SKINS[1],hair:HAIRS[1],helm:'none',hs:'crop',bs:'',fem:false}).fx===''&&faceNorm99(MGR_PRE[0].portrait||{helm:'laurel'}).fx===''&&faceNorm99(onl.portrait).fx==='';
  o.fxKeep=faceNorm99({hs:'long',fx:'31'}).fx==='31'&&faceNorm99({hs:'long',ns:'brk'}).fx===fx99Pack({ns:'brk'});
  o.fxCrowd=fromSpect99(look).fx!==''&&fromSpect99(look).fx===fromSpect99({...look}).fx&&fromCouncil99(adv).fx===fromCouncil99(adv).fx;
  o.fxPatron=fromPatron99(pat).fx==='';o.noRand=rnd===0;Math.random=mr;
  const P0={fs:'sq',jw:'str',ck:'hi',br:'uni',ey:'hod',es:'close',ns:'brk',lp:'smk',ea:'caul',nk:'bul',ag:'old',ln:'fc',kh:true};const pk2=fx99Pack(P0),un=fx99Unpack(pk2);
  o.pack={s:pk2,len:pk2.length,round:Object.keys(P0).every(k=>un[k]===P0[k]),empty:fx99Pack({})===''};
  /* 4 · every kind paints through face99 */
  const real=face99;let n=0;face99=function(){n++;return real.apply(this,arguments)};const cnt=fn=>{const n0=n;let s='';try{s=fn()}catch(e){s='ERR '+e.message}return {n:n-n0,svg:/<svg/.test(s)}};
  o.kinds={portraitSVG:cnt(()=>portraitSVG({helm:'galea'},'#c0433a')),portraitHTML:cnt(()=>portraitHTML({name:'a',portrait:{}},'md')),
    mgrPortrait:cnt(()=>mgrPortrait(lan,'sm')),gladFace:cnt(()=>gladFace({name:'x',cls:'hero',portrait:gladPortrait('x','hero')},'sm')),
    pArt:cnt(()=>pArt({name:'Crixus',cls:'soldier',color:'#c0433a',id:3},'sm')),onl80Face:cnt(()=>onl80Face({name:'o',cls:'hero',look:onl},'md')),
    specFaceSVG:cnt(()=>specFaceSVG(look)),face83:cnt(()=>face83(adv,58)),patron:cnt(()=>onlPatronFace82(pat,72))};
  face99=real;o.allKinds=Object.values(o.kinds).every(k=>k.n>=1&&k.svg);
  /* 5 · the crop */
  o.headCrop=/viewBox="12 28 76 76"/.test(specFaceSVG(look))&&/class="sface"/.test(specFaceSVG(look))&&/width="20" height="20"/.test(specFaceSVG(look));
  o.chipCrop=/viewBox="6 30 88 88"/.test(face83(adv,58))&&/width="58"/.test(face83(adv,58))&&/viewBox="6 30 88 88"/.test(onlPatronFace82(pat,72));
  o.smallAdv=/viewBox="12 28 76 76"/.test(face83(adv,30));o.bustFrame=/viewBox="0 0 100 140"/.test(portraitHTML({portrait:{}},'sm'));
  o.mantle=/stroke="#7a2230" stroke-width="9"/.test(face2Build(fromSpect99(look),{frame:'head',color:'#7a2230',T:0}));
  /* 6 · tiers: shapes only ≤32 · lite 33–47 · 48–119 · ≥120 textures · grain ≥150; Light = lite everywhere */
  o.tier=[26,40,54,110,170].map(px=>face2Tier(px,'full')).join('')+'/'+[26,170].map(px=>face2Tier(px,'light')).join('');
  const B0=k=>face2Build(faceNorm99(gladPortrait('g_tier','hero')),{frame:'bust',color:'#c0433a',...k});
  const t0s=B0({T:0}),t1s=B0({T:1}),t2s=B0({T:2}),t3s=B0({T:3}),t3g=B0({T:3,grain:true});
  o.tiers={t0:!/radialGradient/.test(t0s),t1:/radialGradient/.test(t1s)&&t1s.length<t2s.length,t2:!/t99skin|t99canvas/.test(t2s)&&t2s.length<t3s.length,t3:/id="t99skin"/.test(t3s)&&!/url\(#t99canvas\)/.test(t3s),grain:/id="t99canvas"/.test(t3g),kb:[t0s,t1s,t2s,t3s,t3g].map(s=>Math.round(s.length/1024))};
  o.noDom=!/DOMParser|XMLSerializer/.test(String(F2B.strong99)+String(F2V.prePass));
  /* 7 · the raster cache: one build per spec+frame+tier+px, then hits; the bitmap reaches the page; the live draft stays vector */
  const s0={...R99.stats};const who={name:'c',portrait:{helm:'crested',hs:'curly',fx:'2'},color:'#4f7fc4'};
  const h1=portraitHTML(who,'lg'),h2=portraitHTML(who,'lg');o.cache={miss:R99.stats.miss-s0.miss,hit:R99.stats.hit-s0.hit,same:h1===h2,img:/<image data-f99="f\d+" href="data:image\/svg\+xml,/.test(h1)};
  const box=document.createElement('div');box.style.cssText='position:fixed;left:0;top:0;z-index:9';box.innerHTML=h1;document.body.appendChild(box);
  for(let i=0;i<120&&(R99.q.length||R99.busy);i++)await W8(100);const e=[...R99.map.values()].pop();const im=box.querySelector('image');
  o.bitmap={png:R99.png,swapped:!!im&&!!e&&im.getAttribute('href')===e.url,isBitmap:!!e&&e.url!==e.svgUrl};box.remove();
  const k0=R99.map.size;const d1=portraitSVG({bg:'flag:c:__draft'},'#8a1c1c');o.draft=R99.map.size===k0&&/<path/.test(d1)&&!/data-f99/.test(d1);
  const v1=srCardSVG({srp:{},srName:'X',rounds:[]});o.srVec=!/data-f99/.test(v1);
  const t1=performance.now();for(let i=0;i<2000;i++)portraitHTML(who,'lg');o.hitMs=(performance.now()-t1)/2000;
  const t2=performance.now();for(let i=0;i<10;i++)face2Build(faceNorm99(gladPortrait('gb'+i,'hero')),{frame:'bust',color:'#c0433a',T:3,grain:true,uid:'q'});o.buildMs=(performance.now()-t2)/10;
  SETTINGS.face99='light';const sL=R99.stats.miss;portraitHTML({name:'L',portrait:{hs:'long',fx:'5'}},'xl');o.lightKey=[...R99.map.keys()].pop().startsWith('bust|1|')&&R99.stats.miss===sL+1;SETTINGS.face99='full';
  /* 8 · FACE1 + fx fits the online limits; cleanLook / cleanPatron keep fx (no server change) */
  const big=faceNorm99({skin:SKINS[3],hair:HAIRS[2],eyes:EYES[2][0],hs:'twinbraid',bs:'longbeard',mark:'tattoo',scar:true,paint:true,helm:'thraex',garb:'lorica',ear:'pearl',neck:'torque',face:'nosering',bg:'flag:'+Object.keys(FLAGS)[0],color:'#123456',smile:1,fem:false,fx:pk2});
  const L=face99Out(big,'look');o.lookB=JSON.stringify({portrait:L,color:'#123456'}).length;o.lookKeys=Object.keys(L).every(k=>/^[a-zA-Z0-9_]{1,16}$/.test(k))&&Object.keys(L).length<=40;
  const P=face99Out({...fromPatron99(pat),fx:pk2},'patron');o.patK=Object.keys({...P,c1:pat.c1,c2:pat.c2}).length;o.patB=JSON.stringify({...P,c1:pat.c1,c2:pat.c2}).length;
  o.srv={look:(ONLC.cleanLook({portrait:L,color:'#123456'}).portrait||{}).fx===pk2,patron:ONLC.cleanPatron({...P,c1:pat.c1,c2:pat.c2}).fx===pk2};
  /* 9 · Settings → Board & pieces → Portrait detail */
  openSettings('pieces');await W8(700);const sb=document.getElementById('setBody');const bt=sb&&sb.querySelector('[data-face99="light"]');o.setRow=!!bt;
  if(bt){bt.click();await W8(150)}o.setVal=SETTINGS.face99;const b2=sb&&sb.querySelector('[data-face99="full"]');if(b2){b2.click();await W8(150)}o.setBack=SETTINGS.face99;
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}
  /* 10 · the 🧬 Features card: Studio character (writes fx, the preview follows, a saved character keeps it), Studio lanista, Manager new career */
  menuHide();openStudio();await W8(800);ST.tab='chars';ST.draft=blankChar();ST.draft.name='Faces Test';ST.view='edit';DF99.jump=Date.now();studioRedraw();await W8(500);DF99.tab(document.querySelector('.df99'),'look');await W8(200);
  const card=()=>document.querySelector('#studio .df99pane[data-df99p="look"] .fx99card');o.cardChar=!!card()&&card().querySelectorAll('[data-fx99p]').length===12;
  const pv0=(document.querySelector('#stPortrait image')||{getAttribute:()=>''}).getAttribute('href');
  card().querySelector('[data-fx99p="ns"]').click();await W8(150);o.thumbs=card().querySelectorAll('[data-fx99o^="ns:"]').length===6&&card().querySelectorAll('.fx99o svg image').length===6;
  card().querySelector('[data-fx99o="ns:brk"]').click();await W8(150);card().querySelector('[data-fx99p="ag"]').click();await W8(100);card().querySelector('[data-fx99o="ag:old"]').click();await W8(100);
  const kh=card().querySelector('[data-fx99kh]');kh.click();await W8(150);
  const u=fx99Unpack(ST.draft.portrait.fx);o.draftFx={fx:ST.draft.portrait.fx,ns:u.ns,ag:u.ag,kh:u.kh};o.preview=(document.querySelector('#stPortrait image')||{getAttribute:()=>''}).getAttribute('href')!==pv0;
  o.greyKept=face2Build(faceNorm99({hair:'#4a2c17',fx:fx99Pack({ag:'old',kh:true})}),{frame:'bust',color:'#c0433a',T:0}).includes('#4a2c17')&&!face2Build(faceNorm99({hair:'#4a2c17',fx:fx99Pack({ag:'old'})}),{frame:'bust',color:'#c0433a',T:0}).includes('fill="#4a2c17"');
  const sv=document.querySelector('#studio [data-st="save"]');if(sv)sv.click();await W8(900);const saved=(CUSTOM.chars||[]).find(c=>c.name==='Faces Test');o.saved=saved?saved.portrait.fx:null;
  document.querySelector('#studio [data-st="tab"][data-v="lanistas"]').click();await W8(600);DF99.tab(document.querySelector('.df99'),'look');await W8(200);
  const cl=document.querySelector('#studio .df99pane[data-df99p="look"] .fx99card');o.cardLan=!!cl;if(cl){cl.querySelector('[data-fx99r]').click();await W8(150)}o.lanFx=!!(ST.lnd&&ST.lnd.portrait&&ST.lnd.portrait.fx);
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}menuHide();openManager();await W8(1000);const cr=document.querySelector('[data-mg="create"]');if(cr)cr.click();await W8(900);
  const cm=document.querySelector('.df99pane[data-df99p="look"] .fx99card');o.cardMgr=!!cm;if(cm){cm.querySelector('[data-fx99p="fs"]').click();await W8(100)}
  const cm2=document.querySelector('.fx99card [data-fx99o="fs:rd"]');if(cm2){cm2.click();await W8(150)}o.mgrFx=NEWMGR&&NEWMGR.portrait?fx99Unpack(NEWMGR.portrait.fx).fs:null;
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}
  return o});
ok(r.diff===0&&r.offInline,'Off: busts byte-identical to the old painter chain, inline SVG '+r.diff+' '+r.offInline);
ok(r.det&&r.pure&&r.noRand&&r.idem&&r.glad&&r.marks,'adapters deterministic, pure, no Math.random, idempotent '+JSON.stringify({det:r.det,pure:r.pure,noRand:r.noRand,idem:r.idem,glad:r.glad,marks:r.marks}));
ok(r.fxGen.rolled>=50&&r.fxGen.same===60&&r.fxGenFem&&r.fxStored&&r.fxKeep&&r.fxCrowd&&r.fxPatron,'fx: generated + crowd faces roll deterministically, stored looks / patrons keep today\'s shapes '+JSON.stringify({g:r.fxGen,f:r.fxGenFem,s:r.fxStored,k:r.fxKeep,c:r.fxCrowd,p:r.fxPatron}));
ok(r.pack.len<=13&&r.pack.round&&r.pack.empty,'fx packs into ≤13 chars and back '+JSON.stringify(r.pack));
ok(r.allKinds,'every kind paints through face99 '+JSON.stringify(r.kinds));
ok(r.headCrop&&r.chipCrop&&r.smallAdv&&r.bustFrame&&r.mantle,'spectator/advisor/patron = the bust cropped '+JSON.stringify({h:r.headCrop,c:r.chipCrop,s:r.smallAdv,b:r.bustFrame,m:r.mantle}));
ok(r.tier==='01223/11'&&Object.values(r.tiers).slice(0,5).every(Boolean)&&r.noDom,'polish tiers by size, Light = lite, no DOMParser '+JSON.stringify({t:r.tier,...r.tiers,noDom:r.noDom}));
ok(r.cache.miss===1&&r.cache.hit===1&&r.cache.same&&r.cache.img&&r.draft&&r.srVec&&r.lightKey,'raster cache: one build then hits; draft + Summa Rudis card vector; Light key '+JSON.stringify({...r.cache,draft:r.draft,sr:r.srVec,light:r.lightKey}));
ok(!r.bitmap.png||(r.bitmap.swapped&&r.bitmap.isBitmap),'the bitmap is swapped into the page '+JSON.stringify(r.bitmap));
ok(r.lookB<3000&&r.lookKeys&&r.patK<=16&&r.patB<1000&&r.srv.look&&r.srv.patron,'FACE1 + fx fits look 3 KB / patron 16 keys 1 KB, cleanLook/cleanPatron keep fx '+JSON.stringify({lookB:r.lookB,patK:r.patK,patB:r.patB,srv:r.srv}));
ok(r.setRow&&r.setVal==='light'&&r.setBack==='full','Settings: Portrait detail sets SETTINGS.face99 '+JSON.stringify({row:r.setRow,v:r.setVal,b:r.setBack}));
ok(r.cardChar&&r.thumbs&&r.draftFx.ns==='brk'&&r.draftFx.ag==='old'&&r.draftFx.kh&&r.preview&&r.greyKept,'character designer: 🧬 Features writes fx, thumbnails, preview, keep hair colour '+JSON.stringify({c:r.cardChar,t:r.thumbs,d:r.draftFx,p:r.preview,g:r.greyKept}));
ok(r.saved===r.draftFx.fx,'a saved character keeps fx '+JSON.stringify({saved:r.saved,draft:r.draftFx.fx}));
ok(r.cardLan&&r.lanFx&&r.cardMgr&&r.mgrFx==='rd','lanista designers: Studio + new career write fx '+JSON.stringify({l:r.cardLan,lf:r.lanFx,m:r.cardMgr,mf:r.mgrFx}));
const ne=await pg.evaluate(m=>ERR92.n-m,mark);ok(ne===0,'no new errors in the log '+ne);
/* kill switch: flavius_face99off=1 → the old painters, no phase 2 */
const p2=await b.newPage({viewport:{width:1200,height:800}});await p2.route(/fonts\./,r=>r.abort());p2.on('pageerror',e=>errs.push('off: '+String(e.message)));
await p2.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_face99off','1')});
await p2.goto('file://'+process.argv[2],{timeout:90000});await p2.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const k=await p2.evaluate(()=>({on:FACE2.on,same:portraitSVG(gladPortrait('g1','hero'),'#c0433a')===FACE99.geom(gladPortrait('g1','hero'),'#c0433a'),noImg:!/data-f99/.test(portraitHTML({name:'a',portrait:{}},'lg'))}));
ok(!k.on&&k.same&&k.noImg,'kill switch flavius_face99off=1: old painters '+JSON.stringify(k));
console.log('perf: raster hit',r.hitMs.toFixed(4),'ms · full-tier build',r.buildMs.toFixed(2),'ms · KB per tier',JSON.stringify(r.tiers.kb));
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS','ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
