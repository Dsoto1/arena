const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1560,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{localStorage.setItem('flavius_calendar',JSON.stringify({season:2,week:7,epoch:'2026-01-01',sched:{},frozen:1}))});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);
const r=await pg.evaluate(async()=>{const c0=calNow();newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});const w=W_();
 const fx=fixtureFor(c0.season,c0.week);
 return {cal:[c0.season,c0.week],world:[w.season,w.week,w.startSeason,w.startWk],night:w.night&&[LOCATIONS[w.night.loc].n,w.night.ev],fixture:[LOCATIONS[fx.loc].n,fx.ev],lag:calLag(),recs:w.mgrs.map(m=>m.wins+"-"+(m.bouts-m.wins)).join(" "),news:w.news.slice(0,3).map(n=>[n.s,n.wk,n.text.slice(0,80)])}});
console.log(JSON.stringify(r),errs);
await pg.evaluate(()=>{openManager&&openManager()}).catch(e=>console.log('om',e.message));await pg.waitForTimeout(800);await pg.screenshot({path:'shot_mid.png'});await b.close()})();
