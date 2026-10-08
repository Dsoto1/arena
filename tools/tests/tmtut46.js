const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1500,height:980}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.click('[data-mm82="tut"]');await pg.waitForTimeout(200);await pg.click('[data-mm="learnmgr"]');await pg.waitForTimeout(1500);
const step=()=>pg.evaluate(()=>MTUT.on?MTUT.step:-1);
const clk=async sel=>{const ok=await pg.evaluate(sel=>{const e=typeof sel==='string'?document.querySelector(sel):null;if(!e)return false;e.click();return true},sel);await pg.waitForTimeout(600);return ok};
const next=()=>clk('[data-mt="next"]');
const log=[];let guard=null;
for(let iter=0;iter<140;iter++){const s=await step();if(s<0)break;
  const info=await pg.evaluate(()=>({tab:MGR.tab,modal:document.getElementById('mTitle').textContent,mgr:!!document.getElementById('mgrBody'),ph:S?S.phase:null,mc:!!(S&&S.mgrCtx)}));
  log.push(s+':'+info.tab+(info.mgr?'':'/arena:'+info.modal.slice(0,20)));
  switch(s){
   case 0:case 1:case 5:case 10:case 18:case 20:case 21:await next();break;
   case 2:{guard=await pg.evaluate(()=>{document.querySelector('[data-mg="tab"][data-id="recruit"]').click();return MGR.tab});await pg.waitForTimeout(300);await clk('[data-mg="tab"][data-id="roster"]');break}
   case 3:await pg.evaluate(()=>document.querySelector(`tr[data-mg="lsel"][data-id="${MTUT.B}"]`).click());await pg.waitForTimeout(600);break;
   case 4:await pg.evaluate(()=>document.querySelector(`[data-mg="meal"][data-id="${MTUT.B}"]`).click());await pg.waitForTimeout(600);break;
   case 6:await clk('[data-mg="tab"][data-id="recruit"]');break;
   case 7:await pg.evaluate(()=>document.querySelectorAll('#mgrPane tr[data-mg="sel"]')[2].click());await pg.waitForTimeout(600);break;
   case 8:await clk('#mgrPane [data-rec98a]:not([disabled])');await pg.waitForTimeout(800);break;
   case 9:await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mgrPane [data-rec98p], #mgrPane [data-mg="pitch"]')].find(x=>!x.disabled&&!x.dataset.dis);b&&b.click()});await pg.waitForTimeout(600);break;
   case 11:await clk('[data-mg="tab"][data-id="infirm"]');break;
   case 12:await pg.evaluate(()=>document.querySelector(`[data-mg="medic"][data-id="${MTUT.A}"]`).click());await pg.waitForTimeout(600);break;
   case 13:await clk('[data-mg="tab"][data-id="ludus"]');break;
   case 14:await clk('[data-mg="run"][data-id="fac"]');break;
   case 15:await clk('[data-mg="build"][data-id="stables"]');break;
   case 16:await clk('[data-mg="run"][data-id="school"]');break;
   case 17:await clk('#mgrPane [data-mg="perk"]');break;
   case 19:await clk('[data-mg="tab"][data-id="night"]');break;
   case 22:await pg.evaluate(()=>{const s=document.getElementById('ent0');s.value=MTUT.A;document.querySelector('[data-mg="enter"][data-id="0"]').click()});await pg.waitForTimeout(600);break;
   case 23:await clk('[data-mg="watch"][data-id="0"]');await pg.waitForTimeout(2500);break;
   case 24:{await pg.evaluate(()=>{if(!document.getElementById('modal').hidden){const b=document.querySelector('#mBtns button');b&&b.click()}});await pg.waitForTimeout(400);
     await pg.evaluate(()=>{const b=document.getElementById('btnSimEnd');b&&!b.hidden&&b.click()});await pg.waitForTimeout(800);
     await pg.evaluate(()=>{const t=document.getElementById('mTitle').textContent;if(!document.getElementById('modal').hidden&&/Sim|end|rest/i.test(t)){const b=document.querySelector('#mBtns button.primary')||document.querySelector('#mBtns button');b&&b.click()}});await pg.waitForTimeout(2500);break}
   case 25:{await pg.screenshot({path:'mt_res.png'});await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(b=>/Return to Match Week/.test(b.textContent));if(b)b.click();else{const c=document.querySelector('#mBtns button');c&&c.click()}});await pg.waitForTimeout(2500);break}
   case 26:await pg.screenshot({path:'mt_pend.png'});await clk('[data-mg="pthumb"]');await pg.waitForTimeout(1500);await clk('#pendbox button');await pg.waitForTimeout(6000);break;
   case 27:await clk('#mgrPane [data-stk="1|5"]');break;
   case 28:await pg.evaluate(()=>{const e=mtBetPick();e&&e.click()});await pg.waitForTimeout(600);break;
   case 29:await clk('[data-mg="sim"][data-id="1"]');await pg.waitForTimeout(3500);break;
   case 30:await pg.evaluate(()=>{const s=document.getElementById('ent2');if(!s)return;s.value=MTUT.B;document.querySelector('[data-mg="enter"][data-id="2"]').click()});await pg.waitForTimeout(600);break;
   case 31:await clk('[data-mg="simall"]');await pg.waitForTimeout(4000);break;
   case 32:await next();break;
   case 33:await clk('#pendbox [data-mg]');await pg.waitForTimeout(1500);await clk('#pendbox button');await pg.waitForTimeout(6000);break;
   case 34:await clk('[data-mg="tab"][data-id="league"]');break;
   case 35:await pg.evaluate(()=>{const e=document.querySelector(`tr[data-mg="team"][data-id="${mtRivalId()}"]`);e&&e.click()});await pg.waitForTimeout(600);break;
   case 36:await pg.evaluate(()=>{const e=document.querySelector(`[data-mg="envoy"][data-id="${mtRivalId()}|gift"]`);e&&e.click()});await pg.waitForTimeout(600);break;
   case 37:await clk('[data-mg="tab"][data-id="imp"]');break;
   case 38:case 40:await next();break;
   case 39:await clk('[data-mg="tab"][data-id="sched"]');break;
   case 41:await clk('[data-mg="endask"]');break;
   case 42:await clk('[data-mg="endweek"]');await pg.waitForTimeout(3000);break;
   case 43:await pg.screenshot({path:'mt_paper.png'});await clk('#mgrPane [data-mg="tab"][data-id="ludus"]');await pg.waitForTimeout(1200);break;
   default:await pg.waitForTimeout(500);}
  if(log.length>3&&log.slice(-4).every(x=>x===log[log.length-1])){await pg.screenshot({path:'mt_stuck.png'});break}
}
const fin=await pg.evaluate(()=>({on:MTUT.on,title:document.getElementById('mTitle').textContent,btns:[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.slice(0,25)),done:localStorage.getItem('flavius_mtutDone')}));
console.log(log.join(' | '));console.log('guard(tab after blocked click):',guard);console.log(JSON.stringify(fin));console.log('ERRS',errs.slice(0,6));await b.close()})();
