/* node tools/plans/mock100/world_shot.js — world.html: desktop full page (all five tabs) + one shot per tab; phone League + Season (+ next season) */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const U='file://'+path.resolve(__dirname,'world.html');
const out=n=>path.resolve(__dirname,n+'.png');
let pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.goto(U);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(700);
await pg.screenshot({path:out('world_1440'),fullPage:true});
for(const id of ['news','league','imp','trophy','sched']){const el=await pg.$('#'+id);await el.screenshot({path:out('world_1440_'+id)})}
const wrap=await pg.evaluate(()=>[...document.querySelectorAll('.r>*,.pn b,.pn span,.wev b,.wev span,.wk .ct,.wk .ev,.tp b,.tp span,.cc .kv span')].filter(e=>e.offsetParent&&e.scrollWidth>e.clientWidth+1).map(e=>e.className+':'+e.textContent.slice(0,30)).slice(0,30));
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth);console.log('desktop cut',wrap.length,wrap,'hscroll',sw);
await pg.goto(U+'#sched-s2');await pg.waitForTimeout(500);await (await pg.$('#sched')).screenshot({path:out('world_1440_sched_s2')});await pg.close();
for(const [h,n] of [['phone-league','world_390'],['phone-sched','world_390_season'],['phone-sched-s2','world_390_season2']]){
 pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(U+'#'+h);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(600);
 await pg.screenshot({path:out(n)});await pg.screenshot({path:out(n+'_full'),fullPage:true});
 console.log(n,'hscroll',await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await pg.close()}
console.log('errs',errs);await b.close()})();
