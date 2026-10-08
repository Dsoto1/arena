/* v0.99 ONE FACE phase 1 (263-v99face): every human face paints through face99; busts byte-identical to the old painter chain
   (FACE99.geom); adapters pure + deterministic (no Math.random / dice RNG, inputs untouched); the draw cache hits; spectators /
   advisors / patrons are the bust CROPPED (head ≤39 px, chip ≥40 px); FACE1 fits the online look (3 KB) / patron (16 keys, 1 KB)
   limits; Settings → Board & pieces → Portrait detail sets SETTINGS.face99; no new errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const mark=await pg.evaluate(()=>ERR92.n);
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}const o={};
  /* 1 · busts byte-identical to the old chain (seeded looks, every legacy boolean) */
  let h=777;const nx=n=>{h=(Math.imul(h,1103515245)+12345)>>>0;return (h>>>8)%n};const pk=a=>a[nx(a.length)];let diff=0;
  for(let i=0;i<300;i++){const p={skin:pk(SKINS),hair:pk(HAIRS),helm:pk(HELMS)[0],fem:nx(3)===0,beard:nx(2)===0,long:nx(4)===0,smile:nx(3)===0,scar:nx(3)===0,paint:nx(5)===0,bg:pk(BGS)};
    if(nx(2)){p.hs=pk(HAIRSTYLES)[0];p.bs=pk(BEARDS.concat([['none']]))[0];p.mark=pk(MARKS)[0];p.garb=pk(GARBS)[0];p.ear=pk(EARRINGS.concat([[true]]))[0];p.neck=pk(NECKS)[0];p.face=pk(FACES)[0];p.eyes=pk(EYES)[0]}
    const c=pk(Object.values(CLASSES).map(x=>x.color));if(FACE99.geom(p,c)!==portraitSVG(p,c))diff++;
    if(FACE99.geom(face99Geo(faceNorm99(p)),c)!==FACE99.geom(p,c))diff++}
  o.diff=diff;
  /* 2 · adapters: deterministic, pure, no randomness */
  const mr=Math.random;let rnd=0;Math.random=()=>{rnd++;return mr()};const seed0=typeof rngState==='function'?rngState():null;
  const g={id:'g_401',name:'Varro',cls:'soldier'};const look={skin:'#e6cfa8',hair:'#4a2c17',beard:true,hat:'pileus',tunic:'#e8dcc0',robe:'#7a2230'};
  const adv=council83Make('career-x')[0];const pat=onlPatronDef82('acc1','House');const onl={portrait:{skin:SKINS[3],hs:'curly',bs:'goatee',helm:'thraex'},color:'#7a3a9a'};
  const rec={name:'Spartacus',cls:'slave'};const lan=MGR_PRE[0];
  const ins=[g,look,adv,pat,onl,rec,lan].map(x=>JSON.stringify(x));
  const run=()=>[fromGlad99(g),fromSpect99(look),fromCouncil99(adv),fromPatron99(pat),fromOnlLook99(onl,'hero'),fromRecord99(rec),fromLanista99(lan),faceNorm99({beard:true,scar:true,paint:true,long:true})].map(x=>JSON.stringify(x));
  const A=run(),B=run();o.det=A.every((s,i)=>s===B[i]);o.pure=[g,look,adv,pat,onl,rec,lan].every((x,i)=>JSON.stringify(x)===ins[i]);o.noRand=rnd===0;Math.random=mr;
  o.idem=A.every(s=>{const f=JSON.parse(s);return JSON.stringify(faceNorm99(f))===s});
  o.glad=JSON.stringify(fromGlad99(g))===JSON.stringify(faceNorm99({...gladPortrait('g_401','soldier'),color:CLASSES.soldier.color}));
  o.marks=(()=>{const f=faceNorm99({scar:true,paint:true});return f.mark==='scar'&&f.mark2==='paint'})();
  /* 3 · every kind paints through face99 */
  const real=face99;let n=0;face99=function(){n++;return real.apply(this,arguments)};const cnt=fn=>{const n0=n;let s='';try{s=fn()}catch(e){s='ERR '+e.message}return {n:n-n0,svg:/<svg/.test(s)}};
  const w=null;o.kinds={portraitSVG:cnt(()=>portraitSVG({helm:'galea'},'#c0433a')),portraitHTML:cnt(()=>portraitHTML({name:'a',portrait:{}},'md')),
    mgrPortrait:cnt(()=>mgrPortrait(lan,'sm')),gladFace:cnt(()=>gladFace({name:'x',cls:'hero',portrait:gladPortrait('x','hero')},'sm')),
    pArt:cnt(()=>pArt({name:'Crixus',cls:'soldier',color:'#c0433a',id:3},'sm')),onl80Face:cnt(()=>onl80Face({name:'o',cls:'hero',look:onl},'md')),
    specFaceSVG:cnt(()=>specFaceSVG(look)),face83:cnt(()=>face83(adv,58)),patron:cnt(()=>onlPatronFace82(pat,72))};
  face99=real;o.allKinds=Object.values(o.kinds).every(k=>k.n>=1&&k.svg);
  /* 4 · the crop */
  o.headCrop=/viewBox="12 28 76 76"/.test(specFaceSVG(look))&&/class="sface"/.test(specFaceSVG(look))&&/width="20" height="20"/.test(specFaceSVG(look));
  o.chipCrop=/viewBox="6 30 88 88"/.test(face83(adv,58))&&/width="58"/.test(face83(adv,58))&&/viewBox="6 30 88 88"/.test(onlPatronFace82(pat,72));
  o.smallAdv=/viewBox="12 28 76 76"/.test(face83(adv,30));o.bustFrame=/viewBox="0 0 100 140"/.test(portraitHTML({portrait:{}},'sm'));
  o.mantle=/stroke="#7a2230" stroke-width="9"/.test(specFaceSVG(look));
  /* 5 · cache */
  face99Clear();const s0={...FACE99.stats};portraitHTML({name:'c',portrait:{helm:'crested',hs:'curly'},color:'#4f7fc4'},'lg');portraitHTML({name:'c',portrait:{helm:'crested',hs:'curly'},color:'#4f7fc4'},'lg');
  o.cache={miss:FACE99.stats.miss-s0.miss,hit:FACE99.stats.hit-s0.hit,size:FACE99.cache.size};
  const t0=performance.now();for(let i=0;i<2000;i++)portraitSVG({helm:'galea',hs:'crop'},'#c0433a');o.hitMs=(performance.now()-t0)/2000;
  const t1=performance.now();for(let i=0;i<2000;i++)FACE99.geom({helm:'galea',hs:'crop'},'#c0433a');o.geomMs=(performance.now()-t1)/2000;
  o.draftNoCache=(()=>{const k=FACE99.cache.size;portraitSVG({bg:'flag:c:__draft'},'#8a1c1c');return FACE99.cache.size===k})();
  /* 6 · FACE1 fits the online limits */
  const big=faceNorm99({skin:SKINS[3],hair:HAIRS[2],eyes:EYES[2][0],hs:'twinbraid',bs:'longbeard',mark:'tattoo',scar:true,paint:true,helm:'thraex',garb:'lorica',ear:'pearl',neck:'torque',face:'nosering',bg:'flag:'+Object.keys(FLAGS)[0],color:'#123456',smile:1,fem:false});
  const L=face99Out(big,'look');o.lookB=JSON.stringify({portrait:L,color:'#123456'}).length;o.lookKeys=Object.keys(L).every(k=>/^[a-zA-Z0-9_]{1,16}$/.test(k))&&Object.keys(L).length<=40;
  const P=face99Out(fromPatron99(pat),'patron');o.patK=Object.keys({...P,c1:pat.c1,c2:pat.c2}).length;o.patB=JSON.stringify({...P,c1:pat.c1,c2:pat.c2}).length;
  o.outRound=portraitSVG(face99Out(big,'look'),'#123456')===portraitSVG(big,'#123456');
  /* 7 · Settings → Board & pieces → Portrait detail */
  openSettings('pieces');await W8(700);const sb=document.getElementById('setBody');const bt=sb&&sb.querySelector('[data-face99="light"]');o.setRow=!!bt;
  if(bt){bt.click();await W8(150)}o.setVal=SETTINGS.face99;const b2=sb&&sb.querySelector('[data-face99="full"]');if(b2){b2.click();await W8(150)}o.setBack=SETTINGS.face99;
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}
  return o});
ok(r.diff===0,'busts byte-identical to the old painter chain '+r.diff);
ok(r.det&&r.pure&&r.noRand&&r.idem&&r.glad&&r.marks,'adapters deterministic, pure, no Math.random, idempotent '+JSON.stringify({det:r.det,pure:r.pure,noRand:r.noRand,idem:r.idem,glad:r.glad,marks:r.marks}));
ok(r.allKinds,'every kind paints through face99 '+JSON.stringify(r.kinds));
ok(r.headCrop&&r.chipCrop&&r.smallAdv&&r.bustFrame&&r.mantle,'spectator/advisor/patron = the bust cropped '+JSON.stringify({h:r.headCrop,c:r.chipCrop,s:r.smallAdv,b:r.bustFrame,m:r.mantle}));
ok(r.cache.miss===1&&r.cache.hit===1&&r.draftNoCache,'draw cache: one miss then a hit; the live banner draft is never cached '+JSON.stringify(r.cache));
ok(r.lookB<3000&&r.lookKeys&&r.patK<=16&&r.patB<1000&&r.outRound,'FACE1 fits look 3 KB / patron 16 keys 1 KB '+JSON.stringify({lookB:r.lookB,patK:r.patK,patB:r.patB,round:r.outRound}));
ok(r.setRow&&r.setVal==='light'&&r.setBack==='full','Settings: Portrait detail sets SETTINGS.face99 '+JSON.stringify({row:r.setRow,v:r.setVal,b:r.setBack}));
const ne=await pg.evaluate(m=>ERR92.n-m,mark);ok(ne===0,'no new errors in the log '+ne);
console.log('perf: cached bust',r.hitMs.toFixed(4),'ms · old painter',r.geomMs.toFixed(4),'ms');
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS','ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
