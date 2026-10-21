/* tools/bench/readback.js — v1.08c: the main-thread pixel read-backs of a live board. An all-CPU Play Now match (Democritus at Pompeii,
   seed 4242, 8 CPU seats), Normal speed, Settings → Show token bases OFF (--bases on to keep them), --warm s of play, then --secs s counted:
   getImageData calls / ms by who asked (bs101Off, sh103Sharpen, g6Proc, cl398, b103Wall, cv107…), BS101.stats, RB108.st (412), draws.
   The WebKit path in Chromium: --ls flavius_v107safariforce=1,flavius_v107dpr=1.5 (406 W1's cap held; without it a slow box drops to 1×).
     node tools/bench/readback.js <page> [--dpr 2] [--z 1|1.4|2] [--secs 10] [--warm 6] [--light light|full|off] [--bases off|on] [--ls k=v,…] [--json FILE]
   Chromium's read-back is cheap (≈0.1 ms); on Safari each costs ≈28 ms (his recordings) — compare CALLS here, ms on his Mac. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]);const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
const LS={flavius_light106auto:'0',flavius_light106:opt('light','light'),flavius_firstrun:'shown',flavius_first100off:'1'};
for(const kv of String(opt('ls','')).split(',').filter(Boolean)){const i=kv.indexOf('=');LS[kv.slice(0,i)]=kv.slice(i+1)}
(async()=>{const serve=require(path.resolve(path.dirname(PAGE),'tools/perf95/serve.js'));const url=await serve(PAGE);
 const b=await chromium.launch();const cx=await b.newContext({viewport:{width:+opt('w',1440),height:+opt('h',900)},deviceScaleFactor:+opt('dpr',2)});
 await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});for(const k in ls)localStorage.setItem(k,ls[k])},LS);
 const pg=await cx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
 const r=await pg.evaluate(async o=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;SETTINGS.bases101=o.bases;applySettings();try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  const cls=['soldier','hero','royalty','venatore','amazonia','veteranus','slave','damnatio'];
  startEvent({ev:'democritus',loc:6,seed:4242,seats:cls.map(c=>({cls:c,cpu:true})),opts:{}});SPEED=o.speed;
  for(let i=0;i<200;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6)break}setInterval(close,300);
  if(o.z>1)S.zoomIn=true;if(o.z>=1.9)CAM.z=o.z;await W8(o.warm*1000);
  const P=CanvasRenderingContext2D.prototype,gi=P.getImageData;const by={};let n=0,ms=0;
  const who=()=>{const s=String(new Error().stack);const m=s.match(/\b(bs101Off|sh103Sharpen|g6Proc|cl398|b103Wall|b103Proc|alphaBox|shadowRow|aim106Body|aim106Outline|cv107Alpha|cv107Lie|cv107Sane)\b/);return m?m[1]:'?'};
  P.getImageData=function(){const t=performance.now();try{return gi.apply(this,arguments)}finally{const d=performance.now()-t;n++;ms+=d;const w=who();const e=by[w]||(by[w]={n:0,ms:0});e.n++;e.ms+=d}};
  window.__bsMiss=[];const ids=new WeakMap();let idn=0;const bp=bs101Proc;window.__bp=function(img,sx,sy,sw,sh,f,ax,ay,ppm,mode){const m=BS101.cache.get(img);const key=mode+'|'+sx+'|'+sy+'|'+sw+'|'+sh+'|'+f.fam+'|'+ax.toFixed(1)+'|'+ay.toFixed(1)+'|'+ppm.toFixed(3);
   if(!m||!m.has(key)){if(!ids.has(img))ids.set(img,++idn);window.__bsMiss.push({t:Math.round(performance.now()),img:(img.constructor&&img.constructor.name)+'#'+ids.get(img)+' '+img.width+'x'+img.height+(img._sh103?' sh':''),had:!!m,n:m?m.size:0,key})}return bp.apply(this,arguments)};(0,eval)('bs101Proc=window.__bp');
  const s0={...BS101.stats};const x0=typeof RB108!=='undefined'?{...RB108.st}:null;const t0=performance.now();let draws=0;const dr=draw;draw=function(){draws++;return dr.apply(this,arguments)};
  await W8(o.secs*1000);P.getImageData=gi;draw=dr;const s1={...BS101.stats};const el=performance.now()-t0;
  const d={};for(const k in s1)d[k]=s1[k]-(s0[k]||0);let rb=null;if(x0){rb={};for(const k in RB108.st)rb[k]=RB108.st[k]-(x0[k]||0)}
  return {secs:+(el/1000).toFixed(1),draws,getImageData:{n,ms:+ms.toFixed(1),by:Object.fromEntries(Object.entries(by).map(([k,v])=>[k,{n:v.n,ms:+v.ms.toFixed(1)}]))},bs101:d,rb108:rb,dpr:devicePixelRatio,tw:TW,
    webkit:typeof P107S!=='undefined'&&P107S.webkit,miss:(window.__bsMiss||[]).slice(-60)}},{bases:opt('bases','off')!=='off',speed:opt('speed','normal'),z:+opt('z',1),warm:+opt('warm',6),secs:+opt('secs',10)});
 console.log(JSON.stringify(r));if(opt('json',''))fs.writeFileSync(opt('json',''),JSON.stringify(r,null,1));console.log('ERRS',JSON.stringify(errs));await b.close()})().catch(e=>{console.error(e);process.exit(2)});
