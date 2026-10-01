const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:+(process.argv[3]||1440),height:+(process.argv[4]||950)},isMobile:!!process.argv[5],hasTouch:!!process.argv[5]});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
await pg.evaluate(()=>{menuHide();startEvent({ev:'democritus',loc:6,seats:[{cls:'slave',cpu:false,diff:'normal'},{cls:'soldier',cpu:true,diff:'normal'},{cls:'venatore',cpu:true,diff:'normal'},{cls:'hero',cpu:true,diff:'normal'}],opts:{}})});
for(let k=0;k<12;k++){await pg.waitForTimeout(700);await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(x=>/To the sand|Got it/.test(x.textContent));if(b)b.click()})}
await pg.evaluate(()=>{SPEED='fast';S.players[0].wR=mkWeapon?mkWeapon('hasta'):S.players[0].wR;render()}).catch(()=>{});
const o={};o.board=await pg.evaluate(()=>({name:(document.querySelector('#board b')||{}).textContent,warm:document.querySelectorAll('#board .warm').length,tip:!!document.querySelector('#board [data-act="trophies"][data-tip]'),cur:cur().name}));
await pg.evaluate(()=>{const c=document.querySelector('#roster .rc[data-pid="2"]');c.click()});await pg.waitForTimeout(300);
o.swap=await pg.evaluate(()=>({back:!!document.querySelector('.boardback'),modal:!document.getElementById('modal').hidden}));
await pg.screenshot({path:'shot_a51_'+(process.argv[3]||1440)+'.png'});
await pg.evaluate(()=>{document.querySelector('.boardback button').click()});o.home=await pg.evaluate(()=>!document.querySelector('.boardback'));
o.mvlog=await pg.evaluate(()=>[...document.querySelectorAll('#log li.mv')].length);
console.log(JSON.stringify(o));console.log('ERRS',errs.slice(0,4));await b.close()})();
