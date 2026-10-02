/* v0.76 follow-up: an older build never writes over what a newer one saved (flavius_newestver / a newer world.ver), and the update bar */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const r=await pg.evaluate(async()=>{const r={};r.stamp=localStorage.getItem('flavius_newestver')===GAME_VER;
  await Store.put('hall','tu1',{a:1});r.ok=!!(await Store.getDoc('hall','tu1'));
  localStorage.setItem('flavius_newestver','9.99');await Store.put('hall','tu2',{a:1});r.blocked=!(await Store.getDoc('hall','tu2'))&&matchSlotPut('3',{v:GAME_VER})===false;
  const bar=document.getElementById('upd76');r.bar=!!bar&&!bar.hidden&&/9\.99/.test(bar.textContent);
  localStorage.setItem('flavius_newestver',GAME_VER);await Store.put('hall','tu3',{a:1});r.back=!!(await Store.getDoc('hall','tu3'));return r});
const miss=Object.entries(r).filter(([k,v])=>!v).map(([k])=>k);
console.log(JSON.stringify(r));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
