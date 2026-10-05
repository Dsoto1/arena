const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_();const log=[];
 for(let k=0;k<8&&wkOf(w.week)!==4;k++){for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);w.pend=[];if(w.special)w.special.done=true;const r=await endWeek();log.push(wkOf(w.week)+':'+r)}
 return {wk:wkOf(w.week),bye:w.night.bye,bouts:w.night.bouts.length,hours:w.hours,cart:!!w.cart,loc:LOCATIONS[w.night.loc].n,city:me().city,log}});
console.log(JSON.stringify(o));
await pg.evaluate(()=>{openManager();});await pg.waitForTimeout(1200);await pg.evaluate(()=>{MGR.tab='night';MGR_REDRAW()});await pg.waitForTimeout(500);
await pg.screenshot({path:'bye1.png'});
await pg.evaluate(()=>{MGR.tab='sched';MGR_REDRAW()});await pg.waitForTimeout(500);await pg.screenshot({path:'bye2.png'});
const e=await pg.evaluate(async()=>{const w=W_();const c0=me().coin;const r=await endWeek();return {r,wk:wkOf(w.week),bye:!!w.night.bye,dc:me().coin-c0}});console.log(JSON.stringify(e));
console.log(errs.slice(0,4));await b.close()})();
