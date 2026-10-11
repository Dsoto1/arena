/* v1.0 MAIN MENU SHOW IN 3D (282-v100menu): the strips load and the 3D show draws (gladiators, beasts, Commodus, the duel),
   frames change over the show, still picture under Reduce motion + Animations Off (no loop), the flat show with the kill switch,
   288's cover pause still holds the 3D loop under a full-screen window. Shots → tools/plans/menu100/. */
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const out={};const errs=[];const page=process.argv[2];
fs.mkdirSync('tools/plans/menu100',{recursive:true});
async function open(init){const ctx=await b.newContext({viewport:{width:1400,height:950}});
  await ctx.addInitScript(init||(()=>{}));
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
  const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+page,{waitUntil:'domcontentloaded',timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000}).catch(()=>{});return {ctx,pg}}
/* draws the show at time t on its own clock (the duel forced on) and returns what was drawn */
const at=(pg,t)=>pg.evaluate(t=>{if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}MM.t0=performance.now()-t*1000;MM100S.drawn=0;mmLoop();if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}
  return {drawn:MM100S.drawn}},t);
const shot=async(pg,n)=>{const el=await pg.$('#mmCv');const buf=await el.screenshot({path:`tools/plans/menu100/${n}.png`});return require('crypto').createHash('md5').update(buf).digest('hex')};
/* 1 · the 3D show */
{const {ctx,pg}=await open();
  await pg.waitForFunction(()=>typeof MM100S!=='undefined'&&MM100S.on&&!MM100S.hold,null,{timeout:20000}).catch(()=>{});
  out.on=await pg.evaluate(()=>MM100S.on);
  await pg.evaluate(async()=>{MM.plan.duel=true;MM.plan.tEnd=34;await mm100Load(mm100Keys(MM.plan))});
  out.loaded=await pg.evaluate(()=>mm100Keys(MM.plan).filter(k=>!mm100Ok(k)));
  const T=[[1.5,'walkin'],[4.0,'photo'],[7.5,'escort'],[12.9,'bear'],[14.5,'wolves'],[17.0,'lion'],[18.6,'tholo'],[21.0,'commodus'],[23.0,'raise'],[28.6,'duel'],[29.4,'duel2'],[31.5,'fallen']];
  out.frames={};const urls=[];for(const [t,n] of T){const r=await at(pg,t);out.frames[n]=r.drawn;urls.push(await shot(pg,'show_'+t.toFixed(1)+'_'+n))}
  /* walk frames change between two moments a frame apart */
  const w1=await pg.evaluate(()=>mm100Walk(1.0,0)),w2=await pg.evaluate(()=>mm100Walk(1.13,0));out.walkMoves=w1!==w2;
  out.distinct=new Set(urls).size;
  /* the loop keeps running while the show plays, and stops at its end */
  await pg.evaluate(()=>{MM.t0=performance.now()-2000;MM.raf=requestAnimationFrame(mmLoop)});await pg.waitForTimeout(400);out.running=await pg.evaluate(()=>!!MM.raf&&MM100S.t>2);
  /* 288: a full-screen window over the menu pauses the 3D loop */
  out.cover=await pg.evaluate(async()=>{const md=document.getElementById('modal');md.hidden=false;md.classList.add('full');await new Promise(r=>setTimeout(r,300));const t1=MM100S.t;await new Promise(r=>setTimeout(r,500));
    const paused=!MM.raf&&MM100S.t===t1;md.classList.remove('full');md.hidden=true;await new Promise(r=>setTimeout(r,300));return {paused,resumed:!!MM.raf}});
  /* frame cost: the busiest moments */
  out.ms=await pg.evaluate(()=>{const ts=[14.5,17.0,28.6];const r=[];for(const t of ts){const t0=performance.now();for(let i=0;i<20;i++){MM.t0=performance.now()-t*1000;mmLoop();if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}}r.push(+((performance.now()-t0)/20).toFixed(2))}return r});
  await ctx.close()}
/* 2 · still picture: Reduce motion, and Animations Off */
for(const [tag,init] of [['calm',()=>{try{const s=JSON.parse(localStorage.getItem('flavius_settings')||'{}');s.calm=true;localStorage.setItem('flavius_settings',JSON.stringify(s))}catch(e){}}],
  ['animoff',()=>{try{const s=JSON.parse(localStorage.getItem('flavius_settings')||'{}');s.anim88='off';localStorage.setItem('flavius_settings',JSON.stringify(s))}catch(e){}}]]){
  const {ctx,pg}=await open(init);await pg.waitForFunction(()=>typeof MM100S!=='undefined'&&MM100S.on&&!MM100S.hold,null,{timeout:20000}).catch(()=>{});await pg.waitForTimeout(800);
  out[tag]=await pg.evaluate(()=>({on:MM100S.on,still:MM100S.still,raf:!!MM.raf,t:MM100S.t,drawn:MM100S.drawn}));await shot(pg,'still_'+tag);await ctx.close()}
/* 3 · kill switch: today's flat show */
{const {ctx,pg}=await open(()=>{try{localStorage.setItem('flavius_mm100off','1')}catch(e){}});await pg.waitForTimeout(1500);
  out.off=await pg.evaluate(()=>({off:MM100S.off,on:MM100S.on,img:Object.keys(MM100S.img).length,raf:!!MM.raf}));await ctx.close()}
const f=out.frames;const ok=out.on&&!out.loaded.length&&Object.values(f).every(n=>n>0)&&f.bear>=8&&f.duel>=3&&out.walkMoves&&out.distinct>=10&&out.running&&out.cover.paused&&out.cover.resumed
  &&out.calm.on&&out.calm.still&&!out.calm.raf&&out.calm.drawn>=8&&out.animoff.still&&!out.animoff.raf&&out.off.off&&!out.off.on&&out.off.img===0&&out.off.raf&&Math.max(...out.ms)<40;
console.log(JSON.stringify(out));console.log('ERRS',JSON.stringify(errs));console.log(ok&&!errs.length?'PASS':'FAIL');await b.close();process.exit(ok&&!errs.length?0:1)})();
