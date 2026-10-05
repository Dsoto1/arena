/* v0.79 main menu: the version badge shows what is new; C opens the words of power (menu only); Multiplayer = two buttons */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const errs=[];const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+require('path').resolve(process.argv[2]));await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await p.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await p.waitForTimeout(300);
await p.click('#mainMenu .mmver');await p.waitForTimeout(600);const notes=await p.evaluate(()=>({t:(document.querySelector('#mTitle')||{}).textContent||'',card:!!document.querySelector('#modal .mstone')}));
await p.evaluate(()=>CUR_MODAL&&CUR_MODAL.done(null));await p.waitForTimeout(500);
await p.keyboard.press('c');await p.waitForTimeout(600);const cheat=await p.evaluate(()=>({modal:!!CUR_MODAL,t:(document.querySelector('#mTitle')||{}).textContent||''}));
await p.evaluate(()=>CUR_MODAL&&CUR_MODAL.done(null));await p.waitForTimeout(400);
await p.click('#mainMenu [data-mm="multi"]');await p.waitForTimeout(300);const row=await p.evaluate(()=>{const g=document.getElementById('mmMulti');return {n:g.querySelectorAll('.btn').length,cols:getComputedStyle(g).gridTemplateColumns.split(' ').length,sub:(document.querySelector('#mainMenu [data-mm="multi"]').outerHTML)}});
/* C is ignored while typing and while a window is open */
await p.evaluate(()=>{const i=document.createElement('input');i.id='tv79i';document.body.appendChild(i);i.focus()});await p.keyboard.press('c');await p.waitForTimeout(300);const typing=await p.evaluate(()=>!!CUR_MODAL);
console.log(JSON.stringify({notes,cheat,row,typing}));
const miss=[];if(!/What's new/.test(notes.t)||!notes.card)miss.push('version notes');if(!cheat.modal)miss.push('C opens the words');if(row.n!==2||row.cols!==2||/LAN/.test(row.sub))miss.push('two-button Multiplayer row');if(typing)miss.push('C while typing');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();if(miss.length||errs.length)process.exit(1)})();
