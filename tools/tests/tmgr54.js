const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1800);
const o={};
o.take=await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_();return {line:w.qsLast&&w.qsLast.lines[0][0],start:w.startWeek===w.week}});
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(1200);
o.welcome=await pg.evaluate(()=>{const d=document.querySelector('.welcfold');return d?d.open:'none'});
o.tabs=await pg.evaluate(()=>[...document.querySelectorAll('[data-mg="tab"]')].map(b=>b.dataset.id).join(','));
await pg.evaluate(()=>{const w=W_();const fa=freeAgents().slice(0,3);fa.forEach(g=>g.favd=true);MGR.tab='recruit';MGR_REDRAW()});await pg.waitForTimeout(500);
o.fav=await pg.evaluate(()=>document.querySelectorAll('.favbox tr').length);o.sortVisible=await pg.evaluate(()=>[...document.querySelectorAll('.sorttray button')].filter(b=>getComputedStyle(b).display!=='none').length);
await pg.evaluate(()=>{document.querySelector('.sorttray button.on').click()});await pg.waitForTimeout(200);o.sortOpen=await pg.evaluate(()=>[...document.querySelectorAll('.sorttray button')].filter(b=>getComputedStyle(b).display!=='none').length);
await pg.screenshot({path:'mgr54.png'});
/* pay-to-join + bout coin to purse */
o.pj=await pg.evaluate(async()=>{const w=W_(),pm=me();pm.fame=20;const g=freeAgents().find(g=>effOvr(g)>=44&&effOvr(g)<=64);if(!g)return 'nog';g.unsigned=5;const R=Math.random;Math.random=()=>0.01;try{payJoinOffer(w,pm)}finally{Math.random=R}MGR.tab='ludus';MGR_REDRAW(); /* v0.56: the offer arrives as mail in Your ludus */await new Promise(r=>setTimeout(r,200));const card=!!document.querySelector('.payjoin');const c0=pm.coin;document.querySelector('[data-v54="payjoin-yes"]').click();await new Promise(r=>setTimeout(r,200));const gg=gById(w.payJoin?w.payJoin.gid:g.id);return {card,dc:pm.coin-c0,signed:!!(g.contract&&g.contract.mgr===pm.id)}});
o.purse=await pg.evaluate(async()=>{const w=W_();const b=w.night.bouts[0];const before={};for(const g of w.glads)before[g.id]=g.purse||0;await runBoutSim(0);const rows=[];for(const id of b.ents){const g=gById(id);rows.push([(g.purse||0)-before[id]])}return rows.flat()});
console.log(JSON.stringify(o));console.log(errs.slice(0,4));await b.close()})();
