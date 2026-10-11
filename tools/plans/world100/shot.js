/* node tools/plans/world100/shot.js [page] — v1.0 Manager World tabs (290-v100world): a taken-over house, 7 simulated weeks, then one desktop shot per
   tab (1440) + phone shots (390) into tools/plans/world100/. ONLY=league,sched limits the tabs; LS='{"k":"v"}' sets localStorage first. */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'../../../flavius-arena.html'));const OUT=__dirname;
const ONLY=(process.env.ONLY||'news,league,imp,trophy,sched').split(',');
async function world(pg){return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}
  openManager();await W8(500);newWorld({type:'pre',key:MGR_PRE[4].key});const w=W_(),m=me();
  for(let k=0;k<7;k++){if(w.night.bye){await endWeek();continue}const ros=rosterOf(m).filter(g=>!g.inj);
    w.night.bouts.forEach((b,i)=>{const g=ros[i%Math.max(1,ros.length)];if(g&&!w.night.bouts.some(x=>x.ents.includes(g.id)))b.ents[0]=g.id});
    for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);
    let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood'){m.coin=Math.max(m.coin,(P.price||0)+50);settlePending(0,'pay')}else settlePending(0,'stay')}
    if(!await endWeek())break}
  earnTrophy(w,'tiro',{who:(rosterOf(m)[0]||{}).name||m.name,why:'shot'});earnTrophy(w,'horn',{who:m.ludus,why:'shot'});const R=w.mgrs.find(x=>!x.isPlayer&&!x.sica);R.rivalry=48;MGR.lg90=R.id;return w.week})}
(async()=>{const b=await chromium.launch();const errs=[];
  for(const [vw,vh,tag] of [[1440,+(process.env.VH||1500),'1440'],[390,844,'390']]){const pg=await b.newPage({viewport:{width:vw,height:vh},deviceScaleFactor:vw<500?2:1});
    await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const [k,v] of Object.entries(ls))localStorage.setItem(k,v)},JSON.parse(process.env.LS||'{}'));
    pg.on('pageerror',e=>errs.push(e.message));await pg.goto('file://'+PAGE);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
    await world(pg);
    for(const t of ONLY){await pg.evaluate(async t=>{MGR.tab=t;if(t==='imp')WD100.city=4;MGR_REDRAW();await new Promise(r=>setTimeout(r,700));document.querySelector('#mBody').scrollTop=0},t);
      await pg.waitForTimeout(500);await pg.screenshot({path:path.join(OUT,`world_${tag}_${t}.png`)});
      if(tag==='390'){await pg.evaluate(()=>{const p=document.querySelector('#mgrPane');const B=document.querySelector('#mBody');if(p&&B)B.scrollTop=p.offsetTop+(document.querySelector('.wd100cal,.wd100wall,.wd100rows,.wd100map,.wd100tit')||p).offsetTop-60});await pg.waitForTimeout(300);await pg.screenshot({path:path.join(OUT,`world_${tag}_${t}_2.png`)})}}
    await pg.close()}
  console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close()})();
