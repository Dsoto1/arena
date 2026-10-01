const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1500,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(3000);
const o={};
// the coach must not appear in a normal event
await pg.evaluate(()=>{TUT.on=true;TUT.step=20;menuHide();const seats=[{cls:'slave',cpu:false,name:'Me'},{cls:'soldier',cpu:true,name:'B'},{cls:'royalty',cpu:true,name:'C'},{cls:'hero',cpu:true,name:'D'}];startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:0}})});
await pg.waitForTimeout(2500);o.coachInPlayNow=await pg.evaluate(()=>({on:TUT.on,el:!!document.getElementById('tutCoach')}));
// the end of the lesson
await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:1);S.over=true;S.tutorial=true;S.result={winners:[0]};TUT.p=S.players[0];tutAfterShow()});
await pg.waitForTimeout(2600);o.done=await pg.evaluate(()=>({title:document.getElementById('mTitle').textContent,btns:[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.slice(0,22)),coach:!!document.getElementById('tutCoach')}));
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(b=>/Main menu/.test(b.textContent));b&&b.click()});await pg.waitForTimeout(1800);
o.menu=await pg.evaluate(()=>({menu:!document.getElementById('mainMenu').hidden,coach:!!document.getElementById('tutCoach')}));
console.log(JSON.stringify(o,null,1));console.log(errs.slice(0,3));await b.close()})();
