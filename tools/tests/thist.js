const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{showRules('hist')});await pg.waitForTimeout(600);
const o=await pg.evaluate(()=>({order:[...document.querySelectorAll('#rulTab-hist .msv')].map(l=>l.textContent).slice(0,8),newTop:(document.querySelector('#rulTab-new .msv')||{}).textContent,full:document.getElementById('modal').classList.contains('full'),
  settingsTabs:(()=>{return null})()}));
await pg.click('#mClose');await pg.waitForTimeout(300);
await pg.evaluate(()=>{openSettings()});await pg.waitForTimeout(500);
o.tabs=await pg.evaluate(()=>[...document.querySelectorAll('[data-stab]')].map(x=>x.textContent));o.gore=await pg.evaluate(()=>!!document.querySelector('[data-set="gore"]'));
console.log(JSON.stringify(o),errs.slice(0,3));await b.close()})();
