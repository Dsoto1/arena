const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1200);
await pg.click('[data-mm="play"]');await pg.waitForTimeout(800);
const sub=await pg.evaluate(()=>[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.trim().slice(0,14)));await pg.click('#mBtns button');await pg.waitForTimeout(1500);
const btns=await pg.evaluate(()=>[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.trim().slice(0,30)));
await pg.evaluate(()=>{document.getElementById('goBtn').click()});
const tl=[];for(let i=0;i<30;i++){tl.push(await pg.evaluate(()=>(!document.getElementById('mainMenu').hidden?'M':'-')+(!document.getElementById('modal').hidden?'W':'-')+(S&&!S.over&&S.phase!=='setup'?'E':'-')+':'+(document.getElementById('mTitle').textContent.slice(0,14))));await pg.waitForTimeout(100)}
console.log(JSON.stringify(sub),JSON.stringify(btns),[...new Set(tl)].join(' | '),errs.slice(0,3));await b.close()})();
