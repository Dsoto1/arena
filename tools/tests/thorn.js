const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const out=[];
for(const delay of [300,1500,4000]){const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2500);
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await pg.waitForTimeout(500);
await pg.click('#mainMenu [data-mm="play"]');await pg.waitForTimeout(900);await pg.evaluate(()=>{[...document.querySelectorAll('#mBody button,#mBtns button')].find(b=>/New event/.test(b.textContent)).click()});await pg.waitForTimeout(delay);
const hasGo=await pg.evaluate(()=>!!document.getElementById('goBtn'));
if(!hasGo){const t=await pg.evaluate(()=>document.getElementById('mTitle').textContent);out.push('nogo '+t);const bs=await pg.evaluate(()=>[...document.querySelectorAll('#mBtns button,#mBody button')].slice(0,8).map(b=>b.textContent));out.push(JSON.stringify(bs));await pg.close();continue}
await pg.click('#goBtn');const tl=[];for(let i=0;i<20;i++){await pg.waitForTimeout(400);tl.push(await pg.evaluate(()=>{const r=(document.getElementById('mainMenu').hidden?'':'MENU ')+(S?S.phase:'-')+(document.getElementById('modal').hidden?'':'+'+document.getElementById('mTitle').textContent.slice(0,20));if(!document.getElementById('modal').hidden&&!document.getElementById('goBtn')){const b=document.querySelector('#mBtns button.primary')||document.querySelector('#mBtns button');b&&b.click()}return r}))}
out.push(delay+': '+tl.join(','));await pg.close()}
console.log(out.join('\n'));await b.close()})();
