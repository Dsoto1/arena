const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:950}});
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1200);
const st=()=>pg.evaluate(()=>({menu:!document.getElementById('mainMenu').hidden,modal:!document.getElementById('modal').hidden,full:document.getElementById('modal').classList.contains('full'),title:(document.getElementById('mTitle')||{}).textContent.slice(0,40)}));
const out={};
for(const k of ['play','annals','manager','studio']){
  await pg.click(`[data-mm="${k}"]`);await pg.waitForTimeout(2000);out[k+'_open']=await st();
  await pg.click('#mClose');await pg.waitForTimeout(1200);out[k+'_closed']=await st();}
await pg.click('[data-mm="rules"]');await pg.waitForTimeout(900);out.rules=await st();await pg.click('#mClose');await pg.waitForTimeout(700);out.rules_closed=await st();
out.loadMovedUnderPlayNow=await pg.evaluate(()=>!document.querySelector('[data-mm="load"]'));
// top-bar manager is full screen too
await pg.evaluate(()=>menuHide());await pg.waitForTimeout(600);out.cont=await st();out.noContinue=await pg.evaluate(()=>!document.querySelector('[data-mm="continue"]'));
out.topMgrHidden=await pg.evaluate(()=>document.getElementById('btnManager').hidden);
// frozen photo: frame at 12s and 16s identical
await pg.evaluate(()=>{if(document.getElementById('mainMenu').hidden)document.getElementById('btnMenu').click();else menuShow()});await pg.waitForTimeout(12500);
const f1=await pg.evaluate(()=>document.getElementById('mmCv').toDataURL().length);await pg.waitForTimeout(3000);
const f2=await pg.evaluate(()=>document.getElementById('mmCv').toDataURL());const f1b=await pg.evaluate(()=>0);
await pg.screenshot({path:'mm35_frozen.png'});
out.frozen=(f2.length===f1);
console.log(JSON.stringify(out,null,0));console.log('ERRS',errs.slice(0,5));await b.close()})();
