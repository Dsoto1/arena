/* tv105e — v1.05 (365-v105cal, his q1a): a NEW Manager career starts at Season 1, week 1 even when the empire calendar is at season 5 week 7
   (pre-made house and custom house); the week-1 fixture/night exists, no lag banner, cal104 consistent; one endWeek -> week 2 and the empire
   calendar stays at season 5 week 7; kill switch flavius_v105caloff=1 restores the old join. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async off=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');
    localStorage.setItem('flavius_calendar',JSON.stringify({season:5,week:7,epoch:new Date().toISOString().slice(0,10),sched:{},frozen:1}));if(o)localStorage.setItem('flavius_v105caloff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const prep=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500)});

const pg=await open(false);await prep(pg);
out.pre0=await pg.evaluate(()=>{const c=calNow();return [c.season,c.week]});ok(out.pre0[0]===5&&out.pre0[1]===7,'empire starts at S5 W7 '+out.pre0);
for(const kind of ['pre','custom']){
  out[kind]=await pg.evaluate(async kind=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
    const info=()=>{const w=W_();const c=calNow();return {s:w.season,wk:w.week,ss:w.startSeason,sw:w.startWk,own:!!w.ownCal,cal104:w.cal104,nightWeek:w.night&&w.night.week,lag:calLag(),banner:lagBannerHTML(),empire:[c.season,c.week],fxOk:!!(w.night&&w.night.bouts&&w.night.bouts.length)}};
    if(kind==='pre')newWorld({type:'pre',key:MGR_PRE[0].key});
    else newWorld({type:'custom',spectOK:true,rules:{},festPick:'ludi',mgr:{name:'Tester',ludus:'Ludus Probus',city:'Roma',color:'#3a6bc0',p:{...MGR_PRESETS.balanced[1]},portrait:{skin:SKINS[1],hair:HAIRS[1],helm:'none',beard:false,bg:sysBG()}}});
    MGR.view=null;const w=W_();w.welc99=1;const i0=info();
    const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);
    for(const g of rosterOf(me())){g.inj=null;g.contract.weeks=Math.max(g.contract.weeks,30)}
    if(w.special&&!w.special.done)await specAutoRun();for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k);
    let g=0;while((w.pend||[]).length&&g++<30){const P=w.pend[0];try{if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
    let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(150);
    return {i0,i1:info(),rr}},kind);
  const o=out[kind];
  ok(o.i0.s===1&&o.i0.wk===1&&o.i0.ss===1&&o.i0.sw===1,kind+' starts S1 W1 '+JSON.stringify(o.i0));
  ok(o.i0.fxOk&&o.i0.nightWeek===1,kind+' week-1 night exists '+JSON.stringify(o.i0));
  ok(o.i0.lag===0&&o.i0.banner==='',kind+' no lag banner');
  ok(o.i0.own===true,kind+' ownCal');
  ok(o.i0.cal104===1,kind+' cal104 = 1 '+o.i0.cal104);
  ok(o.i0.empire[0]===5&&o.i0.empire[1]===7,kind+' empire untouched at creation '+o.i0.empire);
  ok(o.i1.s===1&&o.i1.wk===2,kind+' endWeek -> week 2 '+JSON.stringify(o.i1)+' rr='+o.rr);
  ok(o.i1.empire[0]===5&&o.i1.empire[1]===7,kind+' empire still S5 W7 after a week '+o.i1.empire);
  ok(o.i1.banner==='',kind+' no banner after a week');
}
await pg.close();
/* kill switch: the old join on the empire calendar */
const pk=await open(true);await prep(pk);
out.off=await pk.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();return {s:w.season,wk:w.week,own:!!w.ownCal}});
ok(out.off.s===5&&out.off.wk===7&&!out.off.own,'kill switch: old join S5 W7 '+JSON.stringify(out.off));
await b.close();
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})();
