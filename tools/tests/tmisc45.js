const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1500,height:980}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.click('[data-mm="manager"]');await pg.waitForTimeout(350);await pg.screenshot({path:'load45.png'});await pg.waitForTimeout(1500);
await pg.click('#mClose');await pg.waitForTimeout(1500);
// guide cheats
await pg.click('[data-mm="rules"]');await pg.waitForTimeout(800);await pg.click('[data-rul="guide"]');await pg.waitForTimeout(300);
const o={};o.cheatHidden=await pg.evaluate(()=>document.querySelector('.cheatlist').hidden);await pg.evaluate(()=>{const d=document.querySelector('[data-cheatshow]').closest('details');if(d)d.open=true});await pg.click('[data-cheatshow]');await pg.waitForTimeout(200);
o.cheats=await pg.evaluate(()=>[...document.querySelectorAll('.cheatrow code')].map(c=>c.textContent));
await pg.click('#mClose');await pg.waitForTimeout(800);
// event with offers in hand
await pg.evaluate(()=>{menuHide();POPPED.add('firstTurn');SETTINGS.briefing=false;SPEED='pause';
  const seats=[{cls:'soldier',cpu:false,name:'Me'},{cls:'slave',cpu:true,diff:'easy',name:'A'}].map(s=>({...s,pers:finalPers(s)}));
  startEvent({ev:'democritus',loc:4,seats,opts:{...CFG.opts}});});
await pg.waitForTimeout(1500);
await pg.evaluate(()=>{const p=S.players[0];for(const k of ['mw2','ap3','elix2','key'])p.items.push(mkOffer(k));render()});await pg.waitForTimeout(500);
o.toks=await pg.evaluate(()=>document.querySelectorAll('#board .rtok').length);
await pg.evaluate(()=>{openMenagerie()});await pg.waitForTimeout(800);o.men=await pg.evaluate(()=>document.querySelectorAll('#mBody .rtok').length);await pg.screenshot({path:'men45.png'});
console.log(JSON.stringify(o));console.log('ERRS',errs.slice(0,5));await b.close()})();
