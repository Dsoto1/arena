/* v0.65: Training Yard order (regime first), the hours planner (tiles add, pips remove, preview), rail hour chips + soft outlines,
   Infirmary treatment plans + timeline, fatigue (bout/regime/drills raise it; rest clears it) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.y=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await new Promise(r=>setTimeout(r,700));newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
  const w=W_();const ros=rosterOf(me());const g=ros[1],hurt=ros[0];hurt.inj={until:w.week+3,label:'a torn shoulder',pen:3};MGR.tab='practice';MGR_REDRAW();await new Promise(r=>setTimeout(r,900));
  const body=document.getElementById('mgrBody').innerHTML;const order=body.indexOf('yardreg')>0&&body.indexOf('yardreg')<body.indexOf('yardtop');
  document.querySelector(`[data-tp="g|${g.id}|spd|1"]`).click();await new Promise(r=>setTimeout(r,200));document.querySelector(`[data-tp="g|${g.id}|spd|1"]`).click();await new Promise(r=>setTimeout(r,200));
  const two=(thPlan(w).g[g.id]||{}).spd===2;const prev=/→ ~/.test(document.querySelector(`[data-tp="g|${g.id}|spd|1"]`).textContent);
  document.querySelector(`[data-tp="g|${g.id}|spd|-1"]`).click();await new Promise(r=>setTimeout(r,200));const one=(thPlan(w).g[g.id]||{}).spd===1;
  const hurtTiles=!document.querySelector(`[data-tp="g|${hurt.id}|spd|1"]`)&&!!document.querySelector(`[data-tp="g|${hurt.id}|rehab|1"]`);
  await new Promise(r=>setTimeout(r,900));const chip=(document.querySelector('.mtabs [data-id="practice"] .hrchip')||{}).textContent;
  const rb=document.querySelector('.mtabs [data-mg="tab"][data-id="recruit"]');const css={borderTopWidth:getComputedStyle(rb).borderTopWidth,boxShadow:getComputedStyle(rb).boxShadow,cls:rb.className};
  MGR.tab='infirm';MGR_REDRAW();await new Promise(r=>setTimeout(r,500));
  const plans=document.querySelectorAll('.plantile').length,tl=!!document.querySelector('.rtimeline'),fatrows=document.querySelectorAll('.fatrow').length;
  const rester=ros[2];document.querySelector(`[data-rest="${rester.id}"]`).click();await new Promise(r=>setTimeout(r,200));
  g.fat=0;rester.fat=60;w.train='hard';for(const b2 of w.night.bouts)b2.done=true;w.pend=[];await endWeek();
  return {order,two,prev,one,hurtTiles,chip,border:css.borderTopWidth,glow:css.boxShadow,plans,tl,fatrows,gfat:g.fat,rfat:rester.fat}});
ok(o.y.order,'regime above the hours plan');ok(o.y.two&&o.y.one&&o.y.prev,'tiles and pips');ok(o.y.hurtTiles,'hurt fighter: rehab only');
ok(/h$/.test(o.y.chip||''),'hours chip on the rail');ok(o.y.border==='1px'&&o.y.glow==='none','soft outline');
ok(o.y.plans>=3&&o.y.tl&&o.y.fatrows>=1,'infirmary plans, timeline, fatigue');ok(o.y.gfat>0&&o.y.rfat<=10,'fatigue: work raises, rest clears');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
