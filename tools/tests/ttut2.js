const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.click('[data-mm82="tut"]');await pg.waitForTimeout(200);await pg.click('[data-mm="learn"]');await pg.waitForTimeout(2200);
const tour=[];for(let i=0;i<7;i++){tour.push(await pg.evaluate(()=>({step:TUT_STEPS[TUT.step].id,spot:(document.querySelector('.tutspot')||{}).id||(document.querySelector('.tutspot')||{}).className||null,speed:SPEED})));if(i===1)await pg.screenshot({path:'tut_tour.png'});await pg.evaluate(()=>document.querySelector('[data-tut="next"]').click());await pg.waitForTimeout(250)}
const after=await pg.evaluate(()=>({step:TUT_STEPS[TUT.step].id,speed:SPEED,npcs:S.npcs.map(n=>n.t),simBtn:!document.getElementById('btnSimEnd').hidden,ticket:!document.getElementById('btnTicket').hidden,chip:!!document.querySelector('[data-seat]')}));
// round threshold
const rt=await pg.evaluate(()=>{S.npcKills=2;checkEnd();return S.pending&&S.pending.reason});
// exit tutorial
await pg.evaluate(()=>{S.pending=null;document.querySelector('[data-tut="exit"]').click()});await pg.waitForTimeout(400);
await pg.evaluate(()=>{const b=document.querySelector('#mBtns button.primary');b&&b.click()});await pg.waitForTimeout(1600);
const ex=await pg.evaluate(()=>({menu:!document.getElementById('mainMenu').hidden,tut:TUT.on,over:S.over,coach:!!document.getElementById('tutCoach')}));
console.log(JSON.stringify({tour,after,rt,ex}),errs.slice(0,3));await b.close()})();
