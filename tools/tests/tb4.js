const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1560,height:1000}});
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const out={};
// studio ready-to-create
await pg.evaluate(()=>document.getElementById('btnStudio').click());await pg.waitForTimeout(400);await pg.evaluate(()=>{ST.tab='chars';stReady();document.querySelector('#studio').innerHTML=studioHTML()});await pg.waitForTimeout(500);
out.studio=await pg.evaluate(()=>({view:ST.view,draft:!!ST.draft,list:!!document.querySelector('.stlist')}));
await pg.click('[data-st="tab"][data-v="npcs"]');await pg.waitForTimeout(200);
out.studioNpc=await pg.evaluate(()=>({view:ST.view,list:!!document.querySelector('.stlist')}));
await pg.click('[data-st="tab"][data-v="events"]');await pg.waitForTimeout(300);
out.studioEv=await pg.evaluate(()=>({view:ST.view,list:!!document.querySelector('.stlist')}));
await pg.screenshot({path:'shot_studio21.png'});
await pg.click('#mClose');await pg.waitForTimeout(200);
// save / load
await pg.evaluate(async()=>{await Store.put('customChars','cTEST',{name:'Saved Sam',custom:true});});
/* v0.84: Settings → 💾 Saves points at the Saves window; its Backups → "Restore or manage backups" opens the game-save shelf */
await pg.evaluate(()=>{openSettings()});await pg.waitForTimeout(300);await pg.click('#s98 [data-sv84]'); /* v0.98: no Saves tab; the footer opens 💾 Saves */await pg.waitForTimeout(700);
await pg.click('#hub76 [data-hubbk="manage"]');await pg.waitForTimeout(900);
await pg.fill('#saveName','T1');await pg.click('[data-gsave]');await pg.waitForTimeout(800);
out.slots=await pg.evaluate(()=>document.querySelectorAll('#saveList [data-gload]').length);
await pg.evaluate(async()=>{await Store.del('customChars','cTEST');await Store.put('customChars','cNEW',{name:'Later Lou',custom:true})});
await pg.click('#saveList [data-gload]');await pg.click('#saveList [data-gload]');
await pg.waitForTimeout(2500);
out.afterLoad=await pg.evaluate(async()=>{const L=await Store.list('customChars');return L.map(x=>x.name)});
console.log(JSON.stringify(out));console.log(errs.slice(0,5));await b.close();})();
