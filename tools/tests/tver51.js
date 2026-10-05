const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});const o={};
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(800);await pg.click('[data-mg="create"]');await pg.waitForTimeout(300);await pg.click('[data-mg="nmgo"]');await pg.waitForTimeout(900);
o.v=await pg.evaluate(async()=>{const w=W_();await saveWorld(true);const d=await Store.getDoc('mgrCareers',w.id);const ver=JSON.parse(d.world).ver;const ww=JSON.parse(d.world);ww.ver='0.43';delete ww.founded;d.world=JSON.stringify(ww);await Store.put('mgrCareers',d.id,d);return ver});
await pg.evaluate(async()=>{MGR.world=null;MGR.careers=(await Store.list('mgrCareers'));MGR.view='load';MGR_REDRAW()});await pg.waitForTimeout(500);
o.btn=await pg.evaluate(()=>document.querySelectorAll('[data-mg="load"]').length);
if(o.btn){await pg.click('[data-mg="load"]');await pg.waitForTimeout(400);o.ask=await pg.evaluate(()=>(document.querySelector('.verask')||{}).textContent||null);
 await pg.screenshot({path:'shot_ver51.png'});
 if(o.ask){await pg.click('[data-verask="yes"]');await pg.waitForTimeout(800);o.loaded=await pg.evaluate(()=>({w:!!W_(),ver:W_()&&W_().ver,founded:W_()&&W_().founded}))}}
console.log(JSON.stringify(o));console.log('ERRS',errs.slice(0,4));await b.close()})();
