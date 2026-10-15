const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
/* v1.03 S1: the Gear designers are in 335's tabbed frame — open the tab that holds a control first */
const tab103=(pg,sel)=>pg.evaluate(s=>{const e=document.querySelector(s);const p=e&&e.closest('.df99pane');if(p){const b=document.querySelector('[data-df99t="'+p.dataset.df99p+'"]');if(b)b.click()}},sel);
const ctx=await b.newContext({viewport:{width:1500,height:1000}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.click('[data-mm="studio"]');await pg.waitForTimeout(1800);
await pg.click('[data-st="tab"][data-v="chars"]');await pg.waitForTimeout(600);
const o={};o.chars=await pg.evaluate(()=>({top:!!document.querySelector('.chartop [data-st="new"]'),rand:!!document.querySelector('.chartop [data-st="random"]'),saveplay:!!document.querySelector('[data-st="saveplay"]'),budget:!!document.querySelector('.budgetcard'),flags:document.querySelectorAll('.bgflag').length,listNew:document.querySelectorAll('[data-st="new"]').length}));
await pg.click('.chartop [data-st="random"]');await pg.waitForTimeout(400);
await pg.evaluate(()=>{const b=document.querySelector('.df99 [data-df99t="look"]');if(b)b.click()});await pg.waitForTimeout(300);await pg.click('.bgflag:nth-child(3)');await pg.waitForTimeout(400);o.bg=await pg.evaluate(()=>ST.draft.portrait.bg);
await pg.click('[data-st="tab"][data-v="classes"]');await pg.waitForTimeout(500);await pg.evaluate(()=>{const c=document.querySelector('[data-f="sandbox"]');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))});await pg.waitForTimeout(400);
o.sbx=await pg.evaluate(()=>!!document.querySelector('.budgetcard .cbadge.sbx'));
await pg.screenshot({path:'st_char.png'});
await pg.click('[data-st="tab"][data-v="gear:a"]');await pg.waitForTimeout(600);
o.gear=await pg.evaluate(()=>({tab:ST.tab,sub:ST.gearSub,picks:document.querySelectorAll('[data-gs="casys"]').length,seg:!!document.querySelector('[data-gs="sub"]')}));
/* v0.76: system armor is shown as examples only (no copy button) — load the printed piece directly */
await pg.evaluate(()=>caFromSystem(ST.ca,'musculata'));await pg.waitForTimeout(300);o.fromsys=await pg.evaluate(()=>({n:ST.ca.name,ap:ST.ca.ap,slot:ST.ca.slot,shape:ST.ca.shape,base:ST.ca.base}));
// sculpt: add circle, cut it
await tab103(pg,'[data-scb="add"][data-k="a"][data-v="circle"]');await pg.waitForTimeout(200);await pg.click('[data-scb="add"][data-k="a"][data-v="circle"]');await pg.waitForTimeout(300);
await pg.click('[data-scb="cut"][data-k="a"]');await pg.waitForTimeout(300);
o.cut=await pg.evaluate(()=>({cut:ST.ca.layers[0].cut,mask:!!document.querySelector('#caPiece mask'),undo:!document.querySelector('[data-scb="undo"]').disabled}));
await pg.screenshot({path:'st_armor.png'});
await pg.click('[data-scb="undo"][data-k="a"]');await pg.waitForTimeout(300);o.undone=await pg.evaluate(()=>({cut:!!ST.ca.layers[0]&&!!ST.ca.layers[0].cut,n:ST.ca.layers.length}));
await pg.click('[data-scb="mirror"][data-k="a"]').catch(()=>{});
await pg.click('[data-st="tab"][data-v="gear:w"]');await pg.waitForTimeout(500);o.w=await pg.evaluate(()=>ST.gearSub);
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,5));await b.close()})();
