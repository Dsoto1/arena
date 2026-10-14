/* v0.65: Training Yard order (regime first), the hours planner (tiles add, pips remove, preview), rail hour chips + soft outlines,
   Infirmary treatment plans + timeline, fatigue (bout/regime/drills raise it; rest clears it) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.y=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await new Promise(r=>setTimeout(r,700));newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
  const w=W_();const ros=rosterOf(me());const g=ros[1],hurt=ros[0];hurt.inj={until:w.week+3,label:'a torn shoulder',pen:3};MGR.tab='practice';MGR.yd87='all';MGR_REDRAW();await new Promise(r=>setTimeout(r,900));
  const body=document.getElementById('mgrBody').innerHTML;const order=document.querySelector('.rm100-yard')?!!document.querySelector('.rm100y1 .y92doc .y92rgs'):body.indexOf('y92rgs')>0&&body.indexOf('y92rgs')<body.indexOf('y92grid'); /* v1.0 298: the Doctore (with the intensity) sits beside the fighter's card in the dossier */ /* v0.92: the regime (intensity) sits in the Doctore panel above the fighter cards (213) */
  document.querySelector(`[data-y92s="${g.id}|spd|1"]`).click();await new Promise(r=>setTimeout(r,200));document.querySelector(`[data-y92s="${g.id}|spd|1"]`).click();await new Promise(r=>setTimeout(r,200));
  const two=((thPlan(w).y92||{})[g.id]||{Q:{}}).Q.spd===2;const prev=/→ \d/.test(document.querySelector(`[data-y92c="${g.id}"] [data-y92k="spd"] .y92v`).textContent);
  document.querySelector(`[data-y92s="${g.id}|spd|-1"]`).click();await new Promise(r=>setTimeout(r,200));const one=thPlan(w).y92[g.id].Q.spd===1;
  document.querySelector(`[data-y92lock="${g.id}"]`).click();await new Promise(r=>setTimeout(r,200));
  const hurtTiles=!document.querySelector(`[data-y92s="${hurt.id}|spd|1"]`)&&!!document.querySelector(`[data-tp="g|${hurt.id}|rehab|1"]`);
  await new Promise(r=>setTimeout(r,900));const chip=(document.querySelector('.mtabs [data-id="practice"] .mcount.c73')||{}).textContent;
  const rb=document.querySelector('.mtabs [data-mg="tab"][data-id="practice"]'); /* v0.87: Recruiting has no hours outline; the yard's training-hours outline */const css={borderTopWidth:getComputedStyle(rb).borderTopWidth,boxShadow:getComputedStyle(rb).boxShadow,cls:rb.className};
  MGR.tab='infirm';MGR_REDRAW();await new Promise(r=>setTimeout(r,500));
  const plans=document.querySelectorAll('.plantile').length,tl=!!document.querySelector('.rtimeline'),fatrows=document.querySelectorAll('.iv90row .iv90mb.ft').length; /* v0.90: every fighter's line in the Infirmary list carries a fatigue bar */
  MGR.tab='practice';MGR_REDRAW();await new Promise(r=>setTimeout(r,300)); /* v1.01: the yard first — its render may seat starters (st95Fill) */
  const rester=ros.slice(2).find(x=>!(typeof onCard==='function'&&onCard(x)))||ros[2]; /* v0.97: starters sit on this week's cards (st95Fill) and a carded fighter can't rest — pick one who isn't */MGR.tr92=rester.id;MGR.tab='practice';MGR_REDRAW();await new Promise(r=>setTimeout(r,400)); /* v1.01: Rest week lives in the Training Yard's Recovery block (318) */document.querySelector(`.v101rec2 [data-rest="${rester.id}"]`).click();await new Promise(r=>setTimeout(r,200));
  g.fat=0;rester.fat=60;w.train='hard';for(const b2 of w.night.bouts)b2.done=true;w.pend=[];await endWeek();
  return {order,two,prev,one,hurtTiles,chip,border:css.borderTopWidth,glow:css.boxShadow,plans,tl,fatrows,gfat:g.fat,rfat:rester.fat,rw:rester.restWk,wk:W_().week,oc:ros.map(x=>onCard(x)?1:0).join(""),n:ros.length}});
ok(o.y.order,'regime above the fighter cards');ok(o.y.two&&o.y.one&&o.y.prev,'+ / − sessions with a preview');ok(o.y.hurtTiles,'hurt fighter: rehab only');
ok(/h$/.test(o.y.chip||''),'hours chip on the rail');ok(o.y.border==='1px'&&o.y.glow==='none','soft outline');
ok(o.y.plans>=3&&o.y.tl&&o.y.fatrows>=1,'infirmary plans, timeline, fatigue');ok(o.y.gfat>0&&o.y.rfat<=10,'fatigue: work raises, rest clears');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
