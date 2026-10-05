const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1500,height:1000}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.click('[data-mm="studio"]');await pg.waitForTimeout(1800);
const o={};
await pg.click('[data-st="tab"][data-v="npcs"]');await pg.waitForTimeout(600);
o.beast=await pg.evaluate(()=>({face:!!document.querySelector('#bfPrev svg'),card:!!document.querySelector('.bfcard'),letter:!!document.querySelector('[data-f="glyph"]'),myth:document.querySelectorAll('.mythcard').length,boar:[...document.querySelectorAll('.mythcard b')].some(b=>/Calydonian/.test(b.textContent))}));
await pg.selectOption('[data-f="face.species"]','bovine');await pg.waitForTimeout(400);
o.sp=await pg.evaluate(()=>ST.draft.face.species);
await pg.screenshot({path:'st_face.png'});
await pg.click('[data-bf="rand"]');await pg.waitForTimeout(300);
for(const s of ['feline','canine','ursine','boar','cervine','serpent','avian','reptile','arachnid','giant']){await pg.evaluate(s=>{ST.draft.face.species=s},s)}
o.allsp=await pg.evaluate(()=>BF_SPECIES.map(([k])=>beastFaceSVG({species:k}).length>300).every(Boolean));
await pg.evaluate(()=>document.querySelector('.mythgrid').scrollIntoView());await pg.waitForTimeout(300);await pg.screenshot({path:'st_myth2.png'});
await pg.click('.mythcard >> text=Calydonian');await pg.waitForTimeout(400);o.cal=await pg.evaluate(()=>({n:ST.draft.name,base:ST.draft.rtok.base,face:ST.draft.face.species}));
await pg.click('[data-st="save"]');await pg.waitForTimeout(500);o.tok=await pg.evaluate(()=>tokenOfNpc(CUSTOM.npcs[0]).c1===CUSTOM.npcs[0].face.c1);
// cohorts tab
await pg.click('[data-st="tab"][data-v="cohorts"]');await pg.waitForTimeout(600);
o.co=await pg.evaluate(()=>({h:!!document.querySelector('.sxh3'),inv:!!document.querySelector('.sxinv'),opts:[...document.querySelectorAll('[data-pxm="0"] optgroup')].map(g=>g.label),sys:document.querySelectorAll('[data-px="copysys"]').length}));
await pg.screenshot({path:'st_cohort.png'});
await pg.evaluate(()=>{ST.pxd.members=['cls:soldier','cls:hero'];studioRedraw()});await pg.waitForTimeout(300);await pg.click('[data-px="save"]');await pg.waitForTimeout(400);o.saved=await pg.evaluate(()=>CUSTOM.pairings.map(p=>p.members));
await pg.click('[data-st="tab"][data-v="specials"]');await pg.waitForTimeout(500);
o.sx=await pg.evaluate(()=>({pairsHere:!!document.querySelector('.sxh3'),custom:[...document.querySelectorAll('[data-sxpair]')].length,badge:!!document.querySelector('label.chk .cbadge')}));
// event designer save guard
await pg.click('[data-st="tab"][data-v="events"]');await pg.waitForTimeout(500);
o.ev=await pg.evaluate(()=>{ST.draft.rounds[0].pvp=0;ST.draft.rounds[0].end='alive1';ST.draft.layout.npcs=[];return eventErrors(ST.draft)});
// roster indicator
await pg.click('[data-st="tab"][data-v="rosters"]');await pg.waitForTimeout(500);o.rs=await pg.evaluate(()=>!!document.querySelector('.rsloaded'));
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,5));await b.close()})();
