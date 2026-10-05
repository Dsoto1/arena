const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1500,height:1000}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.click('[data-mm="studio"]');await pg.waitForTimeout(1800);
const o={};
// specials
await pg.click('[data-st="tab"][data-v="specials"]');await pg.waitForTimeout(600);
o.sx0=await pg.evaluate(()=>({inv:!!document.querySelector('.sxinv'),sys:document.querySelectorAll('[data-sx="copysys"]').length,psys:document.querySelectorAll('[data-px="copysys"]').length}));
await pg.click('[data-sx="copysys"][data-v="leptis"]');await pg.waitForTimeout(400);
await pg.evaluate(()=>{const b=document.querySelector('[data-sxpair="sys_androcles"]');if(b)b.click();else if(ST.sxd)ST.sxd.pairs=['sys_androcles']});await pg.waitForTimeout(300);
await pg.selectOption('[data-sxf="freq"]','headliner');await pg.waitForTimeout(300);
await pg.click('[data-sx="save"]');await pg.waitForTimeout(500);
o.sx1=await pg.evaluate(()=>({n:CUSTOM.specials.length,sp:CUSTOM.specials[0],def:specDef('cs:'+CUSTOM.specials[0].id)}));
// cohort (v0.47: its own tab)
await pg.click('[data-st="tab"][data-v="cohorts"]');await pg.waitForTimeout(500);
await pg.selectOption('[data-pxf="type"]','handler');await pg.waitForTimeout(300);
await pg.evaluate(()=>{ST.pxd.members[0]='cls:venatore';studioRedraw()});await pg.waitForTimeout(200);
await pg.selectOption('[data-pxm="1"]','npc:bear');await pg.waitForTimeout(200);
await pg.fill('[data-pxf="name"]','Bear Keeper');
await pg.click('[data-px="save"]');await pg.waitForTimeout(500);
o.px=await pg.evaluate(()=>({n:CUSTOM.pairings.length,P:CUSTOM.pairings[0],card:!!CARDS['pair_'+CUSTOM.pairings[0].id]}));
await pg.click('[data-cr="rolls"][data-k="px"]');await pg.waitForTimeout(400);
o.deck=await pg.evaluate(()=>({deck:CUSTOM.pairings[0].deck,cards:pairDeckCards({})}));
await pg.screenshot({path:'st_special.png',fullPage:false});
// roster
await pg.click('[data-st="tab"][data-v="rosters"]');await pg.waitForTimeout(500);
await pg.click('[data-rs77new]');await pg.waitForTimeout(300); /* v0.77: roster sets as a deck builder */
await pg.click('[data-rs77all="pairs"]');await pg.waitForTimeout(300);
await pg.fill('[data-rsf="name"]','Test set');
await pg.click('[data-rs="save"]');await pg.waitForTimeout(400);
o.rs=await pg.evaluate(()=>({n:CUSTOM.rosters.length,sel:CUSTOM.rosters[0].sel.pairs.length}));
await pg.screenshot({path:'st_roster.png'});
await pg.click(`[data-rs="useplay"][data-v="${await pg.evaluate(()=>CUSTOM.rosters[0].id)}"]`);await pg.waitForTimeout(300);
o.gate=await pg.evaluate(()=>({cfg:CFG.roster,cards:pairDeckCards({}).length,classic:(()=>{CFG.roster='classic';ROSTER_ACTIVE=null;return pairDeckCards({}).length})()}));
// event designer SR
await pg.click('[data-st="tab"][data-v="events"]');await pg.waitForTimeout(500);
/* v0.63: guided steps hide the classic sub-tabs; the Summa Rudis lives on step 6, Finish */
await pg.click('.edsteps [data-edstep="5"]');await pg.waitForTimeout(400);
await pg.click('[data-srx="make"]');await pg.waitForTimeout(400);
o.sr=await pg.evaluate(()=>({srp:!!ST.draft.srp,img:!!document.querySelector('#srPrev img'),sel:document.querySelectorAll('[data-f^="srp."]').length}));
await pg.selectOption('[data-f="srp.helm"]','crested');await pg.waitForTimeout(400);
o.sr2=await pg.evaluate(()=>ST.draft.srp.helm);
await pg.screenshot({path:'st_sr.png'});
await pg.click('.edsteps [data-edstep="4"]');await pg.waitForTimeout(400);
/* v0.54: cohorts come from the Beasts & cohorts picker */
await pg.evaluate(()=>{const t=document.querySelector('[data-hubtab="cohorts"]');if(t)t.click()});await pg.waitForTimeout(300);o.edp=await pg.evaluate(()=>document.querySelectorAll('[data-hub="cohort"]').length);await pg.click('[data-hub="cohort"][data-v="sys_romulus"]');await pg.waitForTimeout(200);o.edp2=await pg.evaluate(()=>ST.draft.pairs);
await pg.click('[data-st="save"]');await pg.waitForTimeout(500);
o.card=await pg.evaluate(()=>cardHTML('e:ce_'+CUSTOM.events[0].id,'sm').includes('data:image/svg'));
// banners
await pg.click('[data-st="tab"][data-v="flags"]');await pg.waitForTimeout(400);
await pg.click('[data-pbfmt="portrait"]');await pg.waitForTimeout(400);
o.pb=await pg.evaluate(()=>({fmt:ST.fd.fmt,crop:!!document.querySelector('.pbcrop'),face:!!document.querySelector('.pbface svg')}));
await pg.screenshot({path:'st_pb.png'});
await pg.click('[data-fda="save"]');await pg.waitForTimeout(400);
o.pb2=await pg.evaluate(()=>({n:CUSTOM.flags.length,fmt:CUSTOM.flags[0].fmt,rack:flagPickerHTML(null,1,'X').includes('✦')}));
await pg.click('[data-st="tab"][data-v="all"]');await pg.waitForTimeout(400);
o.all=await pg.evaluate(()=>[...document.querySelectorAll('.tally td:nth-child(3)')].map(x=>x.textContent));
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,5));await b.close()})();
