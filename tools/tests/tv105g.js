/* tv105g — v1.05 B38 (367-v105menu + the re-rendered assets/mm100_*.webp): the main menu show never falls back to the FLAT show.
   Slow strips (each mm100 image's load held back > 1.5 s — page.route for http pages, the img src setter for this file:// page):
   a quiet backdrop at once, the still 3D group photo when the gladiators' strips are in, then the 3D show — mmFig (the flat token) is
   never drawn; Animations Off waits the same way and ends on the still 3D photo; the kill switch flavius_v105moff=1 = the old 1.5 s cap
   → flat show. The strips match the board: a gladiator's crown ≈ 0.8 of a pillar (as 311's sheets), each beast at 312's size against
   him, MM100_BOOST 1. No bases (B38, his call 2026-10-17): nothing under the figures' feet but a soft contact shadow; frame < 16 ms. */
const {chromium}=require('playwright');const mm100ClsN=()=>['soldier','hero','slave','royalty','amazonia','veteranus','venatore','damnatio'];(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(o)=>{const ctx=await b.newContext({viewport:o.vw||{width:1400,height:900}});
  await ctx.route(/mm100_.*\.webp/,async r=>{await new Promise(z=>setTimeout(z,o.delay||3000));r.continue()});
  await ctx.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');
    if(o.off)localStorage.setItem('flavius_v105moff','1');
    if(o.animoff){const s=JSON.parse(localStorage.getItem('flavius_settings')||'{}');s.anim88='off';localStorage.setItem('flavius_settings',JSON.stringify(s))}
    /* hold back every mm100 strip: g_* (the gladiators) after o.gd ms, the rest after o.delay ms */
    window.__mmD={g:o.gd||o.delay||3000,o:o.delay||3000,n:0};const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
    Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,get(){return d.get.call(this)},set(v){const m=/mm100_(g_)?/.exec(String(v));
      if(m&&window.__mmD){window.__mmD.n++;const me=this;setTimeout(()=>d.set.call(me,v),m[1]?window.__mmD.g:window.__mmD.o)}else d.set.call(this,v)}})},o);
  const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.goto('file://'+process.argv[2],{timeout:90000,waitUntil:'domcontentloaded'});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  /* count the flat token (08 mmFig) from here on */
  await pg.evaluate(()=>{window.__flat=0;const base=mmFig;mmFig=function(){window.__flat++;return base.apply(this,arguments)}});return {ctx,pg}};
const st=pg=>pg.evaluate(()=>({off:typeof MM105!=='undefined'&&MM105.off,wait:typeof MM105!=='undefined'&&MM105.wait,on:MM100S.on,hold:MM100S.hold,raf:!!MM.raf,flat:window.__flat,drawn:MM100S.drawn,still:MM100S.still,
  st:typeof MM105!=='undefined'?Object.assign({},MM105.st):null,ok:mm100Keys(MM.plan).filter(mm100Ok).length,n:mm100Keys(MM.plan).length,asked:window.__mmD.n}));
/* a fresh visit: forget the strips, show the menu again (g_* after gd ms, the rest after delay ms) */
const visit=(pg,gd,delay)=>pg.evaluate(([gd,delay])=>{window.__mmD.g=gd;window.__mmD.o=delay;MM100S.img={};MM100S.drawn=0;window.__flat=0;menuHide();menuShow();return 1},[gd,delay]);

/* 1 · slow strips on the first visit and on a fresh visit: backdrop → still 3D photo → the 3D show; never mmFig */
{const {ctx,pg}=await open({delay:3500,gd:3500});
  out.boot=await st(pg);ok(out.boot.st&&!out.boot.on&&out.boot.flat===0,'boot with slow strips: waiting, no flat show '+JSON.stringify(out.boot));
  await pg.waitForTimeout(1200);out.boot2=await st(pg);ok(out.boot2.flat===0&&!out.boot2.on,'boot, past the old 1.5 s cap: still waiting, no flat show '+JSON.stringify(out.boot2));
  await pg.waitForFunction(()=>MM100S.on&&!MM105.wait,null,{timeout:15000}).catch(()=>{});await pg.waitForTimeout(500);
  out.boot3=await st(pg);ok(out.boot3.on&&out.boot3.raf&&out.boot3.drawn>0&&out.boot3.flat===0&&out.boot3.st.start>=1,'boot: the 3D show starts once loaded '+JSON.stringify(out.boot3));
  await visit(pg,1000,6000);await pg.waitForTimeout(250);out.v0=await st(pg);
  ok(out.v0.wait&&!out.v0.on&&out.v0.st.backdrop>out.boot3.st.backdrop&&out.v0.drawn===0&&out.v0.flat===0,'fresh visit, nothing decoded: the backdrop only '+JSON.stringify(out.v0));
  await pg.waitForFunction(()=>mm100Cls().every(k=>mm100Ok('g_'+k)),null,{timeout:8000}).catch(()=>{});await pg.waitForTimeout(150);out.v1=await st(pg);
  ok(out.v1.wait&&!out.v1.on&&out.v1.st.still>out.v0.st.still&&out.v1.drawn>=8&&out.v1.flat===0&&!out.v1.raf,'gladiators in: the still 3D group photo, no loop '+JSON.stringify(out.v1));
  await pg.waitForFunction(()=>MM100S.on&&!MM105.wait,null,{timeout:15000}).catch(()=>{});await pg.waitForTimeout(800);out.v2=await st(pg);
  ok(out.v2.on&&out.v2.raf&&out.v2.st.start>out.v1.st.start&&out.v2.flat===0&&out.v2.ok===out.v2.n,'all strips in: the 3D show plays '+JSON.stringify(out.v2));
  /* frame cost of the waiting still and of the busiest show moments (≈16 ms target) */
  out.ms=await pg.evaluate(()=>{const r={};const run=(t)=>{const t0=performance.now();for(let i=0;i<20;i++){MM.t0=performance.now()-t*1000;mmLoop();if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}}return +((performance.now()-t0)/20).toFixed(2)};
    r.show=[14.5,17.0,28.6].map(run);MM105.wait=true;r.still=run(0);MM105.wait=false;return r});
  ok(Math.max(...out.ms.show,out.ms.still)<16,'menu frame under 16 ms '+JSON.stringify(out.ms));
  /* 1b · NO BASES (B38, his call 2026-10-17): the strips carry no base — under each standing figure's feet the band where the base's wall
     was (its outer ring, 3 px under the feet down to the base's thickness) is empty (the old strips with bases: 100% covered); the
     figures draw the soft contact shadow (mm100Shadow) instead */
  {const fs=require('fs'),path=require('path');const dir=path.join(path.dirname(process.argv[2]),'assets');const M=await pg.evaluate(()=>MM100_META);
    ok(M.nb===1,'MM100_META.nb = 1 (strips without bases)');
    const pick={commodus:['walk0','idle','raise'],tholo:['walk0'],wolf:['walk0','atk0'],snake:['walk0','atk0'],lion:['walk0']};
    for(const k of mm100ClsN())pick['g_'+k]=['walk0','idle0','idle1','flex'],pick['d_'+k]=['atk0'];
    out.band={};for(const [k,cells] of Object.entries(pick)){const a=M.a[k];if(!a){if(k!=='d_damnatio')ok(false,'strip '+k+' in the meta');continue}
      const url='data:image/webp;base64,'+fs.readFileSync(path.join(dir,'mm100_'+k+'.webp')).toString('base64');
      out.band[k]=await pg.evaluate(async([url,a,px,cells])=>{const im=new Image();im.src=url;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);
        const d=g.getImageData(0,0,c.width,c.height).data;const p=a.px||px,R=12.7*p,bt=3.2*Math.cos(Math.PI/6)*p,r={};
        for(const n of cells){const [x0,w,h,ax,ay]=a.c[n];let n1=0,n0=0;
          for(let y=Math.round(ay+3);y<=Math.round(ay+bt);y++)for(let x=Math.round(ax-R*0.95);x<=Math.round(ax+R*0.95);x++){if(Math.abs(x-ax)/R<0.55)continue;n0++;if(x<0||x>=w||y<0||y>=h)continue;if(d[(y*c.width+x0+x)*4+3]>40)n1++}
          r[n]=+(n1/n0).toFixed(3)}return r},[url,a,M.px,cells]);
      for(const [n,f] of Object.entries(out.band[k]))ok(f<0.1,'no base under '+k+' '+n+' (band '+f+')')}
    out.sh=await pg.evaluate(()=>{let n=0;const base=mm100Shadow;mm100Shadow=function(){n++;return base.apply(this,arguments)};MM105.wait=true;MM.t0=performance.now();mmLoop();MM105.wait=false;mm100Shadow=base;if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}return n});
    ok(out.sh>=8,'the still photo draws a contact shadow per figure ('+out.sh+')')}
  /* 2 · the strips match the board's proportions */
  out.prop=await pg.evaluate(()=>{const pil=1.27*25.4/MINI_BASE;const r={glad:{},beast:{}};const M=MM100_META;
    /* no bases (B38): the cell's anchor is the feet, the board's is the base bottom — its base thickness (3.2 mm at 30°) is added back */
    for(const k of mm100Cls()){const a=M.a['g_'+k],an=ANIM100_META[k]&&ANIM100_META[k].move;if(!a||!an)continue;
      r.glad[k]=[+((a.c.idle0[4]+(M.nb?3.2*Math.cos(Math.PI/6)*(a.px||M.px):0))/(a.px||M.px)/pil).toFixed(3),+(an.rows.idle[0][4]/an.pxmm/pil).toFixed(3)]}
    const per=TW*MINI_BASE/25.4;for(const [mk,bk] of [['lion','leo'],['bear','ursa'],['wolf','valencia'],['snake','glykon'],['tholo','tholo'],['commodus','commodus']]){const B=BEAST100_META[bk],a=M.a[mk];if(!B||!a)continue;
      r.beast[mk]=[+(a.px/M.px).toFixed(3),+(B.px*bst100Scale(B)/per).toFixed(3)]}
    r.boost=Object.values(MM100_BOOST);r.px=M.px;r.v=M.v;return r});
  /* the board's idle cell is the union of 8 facings (its top = the highest of them, a raised spear included): the menu's front cell sits at or under it */
  for(const [k,[m,bd]] of Object.entries(out.prop.glad))ok(m>0.72&&m<0.9&&m<=bd+0.01&&(m>=bd-0.12||/slave|venatore/.test(k)),'gladiator '+k+' crown/pillar '+m+' ≈ the board '+bd);
  ok(Object.keys(out.prop.glad).length===8,'eight classes measured '+JSON.stringify(out.prop.glad));
  for(const [k,[m,bd]] of Object.entries(out.prop.beast))ok(Math.abs(m/bd-1)<0.03,'beast '+k+' scale vs the gladiator '+m+' ≈ the board '+bd);
  ok(Object.keys(out.prop.beast).length===6,'six beasts measured '+JSON.stringify(out.prop.beast));
  ok(out.prop.boost.every(x=>x===1)&&out.prop.v>=2&&out.prop.px>0,'MM100_BOOST 1, meta v2 with px '+JSON.stringify(out.prop));
  await ctx.close()}
/* 3 · Animations Off with slow strips: the same wait, then the still 3D photo (no loop), never mmFig */
{const {ctx,pg}=await open({delay:3000,gd:3000,animoff:1});await visit(pg,800,2500);await pg.waitForTimeout(400);out.a0=await st(pg);
  await pg.waitForFunction(()=>MM100S.on&&!MM105.wait,null,{timeout:15000}).catch(()=>{});await pg.waitForTimeout(600);out.a1=await st(pg);
  ok(out.a0.wait&&out.a0.flat===0&&out.a1.on&&out.a1.still&&!out.a1.raf&&out.a1.drawn>=8&&out.a1.flat===0,'Animations Off: wait, then the still 3D photo '+JSON.stringify([out.a0,out.a1]));
  await ctx.close()}
/* 4 · kill switch flavius_v105moff=1: 282's old cap — the flat show after 1.5 s */
{const {ctx,pg}=await open({delay:4000,gd:4000,off:1});await visit(pg,4000,4000);await pg.waitForTimeout(2300);out.k=await st(pg);
  ok(out.k.off&&!out.k.on&&!out.k.hold&&out.k.flat>0,'kill switch: the old fallback (flat show after the cap) '+JSON.stringify(out.k));await ctx.close()}
/* 5 · phone 390 px: waits, then the 3D show, no flat */
{const {ctx,pg}=await open({delay:2500,gd:2500,vw:{width:390,height:844}});await pg.waitForFunction(()=>MM100S.on&&!MM105.wait,null,{timeout:15000}).catch(()=>{});await pg.waitForTimeout(500);
  out.p=await st(pg);out.pw=await pg.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
  ok(out.p.on&&out.p.flat===0&&out.p.drawn>0&&out.pw[0]<=out.pw[1]+1,'390 px: the 3D show, no flat, no side scroll '+JSON.stringify([out.p,out.pw]));await ctx.close()}
console.log(JSON.stringify(out,null,1).slice(0,5000));
console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('MISS',JSON.stringify(miss,null,1));await b.close();process.exit(1)}
await b.close();process.exit(errs.length?1:0)})();
