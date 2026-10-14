const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1500,height:1000}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});const pg=require("./_st98").auto(await ctx.newPage());await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};o.roster=await pg.evaluate(async()=>{await loadLudus();return {max:ROSTER_MAX,act:LUDUS_CACHE.filter(g=>g.roster&&gladActive(g)).length}});
await pg.click('[data-mm="studio"]');await pg.waitForTimeout(1800);
await pg.click('[data-st="tab"][data-v="tourneys"]');await pg.waitForTimeout(600);
await pg.click('[data-tnsize="16"]');await pg.waitForTimeout(300);
await pg.click('[data-tnx="fill"]');await pg.waitForTimeout(300);
await pg.evaluate(()=>{const c=document.querySelector('[data-tnh="0"]');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))});await pg.waitForTimeout(300);
o.d=await pg.evaluate(()=>({size:ST.tnd.size,filled:ST.tnd.seats.filter(s=>s&&s.g).length,hum:ST.tnd.seats.filter(s=>s&&s.human).length,heats:document.querySelectorAll('.theat').length}));
await pg.screenshot({path:'st_tourn.png'});
await pg.click('[data-tnx="save"]');await pg.waitForTimeout(500);
o.saved=await pg.evaluate(()=>CUSTOM.tourneys.length);
// run a 32 system bracket fully simulated (no human)
o.run=await pg.evaluate(async()=>{const T=tourneyById('t_grand');const x=JSON.parse(JSON.stringify(T));x.id='tx';x.seats=[];CUSTOM.tourneys.push(x);
  CFG.tSid='tx';const mo=window.modal;window.modal=async()=>'close';tournStart(null,'tx');await new Promise(r=>setTimeout(r,300));
  const t0=Date.now();await tournSimRest(false);window.modal=mo;const T2=TOURN;return {v:T2&&T2.v,rounds:T2&&T2.rounds.map(r=>r.length),champ:T2&&T2.champ&&T2.champ.name,locs:T2&&T2.rounds[0].map(h=>h.loc),final:T2&&T2.rounds[T2.rounds.length-1][0].loc,evs:T2&&[...new Set(T2.rounds.flat().map(h=>h.ev))],ms:Date.now()-t0}});
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,5));await b.close()})();
