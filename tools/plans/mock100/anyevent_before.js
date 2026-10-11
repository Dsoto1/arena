/* BEFORE shot of today's Match Week tab: node tools/plans/mock100/anyevent_before.js flavius-arena.html */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');(async()=>{const b=await chromium.launch();const out=__dirname;
for(const W of [1440,390]){
const pg=await b.newPage({viewport:{width:W,height:W>500?900:844},deviceScaleFactor:W>500?1:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
 newWorld({type:'pre',key:MGR_PRE[0].key});for(let k=0;k<6&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(300)}
 menuHide();openManager('night');await W8(1000);MGR.view=null;MGR.tab='night';MGR_REDRAW();await W8(900);
 const w=W_();return {wk:w.week,sched:seasonSchedule(w.season).map(f=>f.ev+'@'+(LOCATIONS[f.loc]||{}).n),
  bouts:w.night&&w.night.bouts.map(x=>({t:x.tier,ev:(EVENTS[x.ev]||{}).n,n:x.ents.length,size:boutSize(x),purse:x.purse,fee:x.fee,ents:x.ents.map(id=>{const g=gById(id);return g&&(g.name+' '+g.cls+' '+Math.round(effOvr(g))+' '+(g.contract&&mgrById(g.contract.mgr)?mgrById(g.contract.mgr).ludus:'FA'))})})),
  ros:rosterOf(me()).map(g=>({n:g.name,c:g.cls,o:Math.round(effOvr(g)),slot:g.slot95,fat:g.fat,inj:!!g.inj})),ludus:me().ludus,loc:LOCATIONS[w.night.loc].n}});
if(W===1440)fs.writeFileSync(out+'/anyevent_before_info.json',JSON.stringify(info,null,1));
await pg.screenshot({path:out+`/anyevent_before_${W}.png`});
console.log(W,'ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();
