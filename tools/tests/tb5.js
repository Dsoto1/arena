const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1560,height:1000}});
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const out={};
out.loc=await pg.evaluate(()=>document.querySelector('#calChip').textContent);
// auto-pause
await pg.evaluate(()=>{startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:true},{cls:'hero',cpu:true},{cls:'slave',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:12}})});
await pg.waitForTimeout(800);
await pg.evaluate(()=>{const m=document.querySelector('#modal');if(m&&!m.hidden){const c=document.querySelector('#mClose');if(c&&!c.hidden)c.click()}});await pg.waitForTimeout(300);
await pg.evaluate(()=>setSpeedUI('normal'));
out.locLive=await pg.evaluate(()=>document.querySelector('#calChip').textContent);
await pg.click('#btnRules');await pg.waitForTimeout(300);
out.pausedOpen=await pg.evaluate(()=>SPEED);
await pg.click('#mClose');await pg.waitForTimeout(400);
out.resumed=await pg.evaluate(()=>SPEED);
out.wager=await pg.evaluate(()=>({betsHiddenOutsideManager:document.querySelector('#btnBets').hidden}));
await pg.screenshot({path:'shot_exch.png'});
await pg.evaluate(()=>{const c=document.querySelector('#mClose');if(c&&!c.hidden)c.click()});await pg.waitForTimeout(300);
// manager landing
await pg.evaluate(()=>{S.over=true});
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(400);
out.mgr=await pg.evaluate(async()=>{const c0=calNow();newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});const w=W_(),m=me();m.coin=300;
  const r={calStart:[c0.season,c0.week],world:[w.season,w.week]};const fa=freeAgents().slice(0,3);fa.forEach(g=>{g.contract={mgr:m.id,wage:5,weeks:20,since:1};g.scout=2});
  r.ages=w.glads.map(g=>g.age).sort((a,b)=>b-a).slice(0,6);r.oldVet=w.glads.filter(g=>g.age>=40).map(g=>g.cls);
  for(let i=0;i<w.night.bouts.length;i++)await runBoutSim(i);let guard=0;while((w.pend||[]).length&&guard++<25){const P=w.pend[0];if(P.t==='thumb')settlePending(0,null,{d6:5,d12:6});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}
  await endWeek();MGR.tab='ludus';document.querySelector('#mgrBody').innerHTML=mgrHTML();
  const pane=document.querySelector('#mgrPane');r.review=!!pane.querySelector('.revbox');r.todos=pane.querySelectorAll('.todo').length;
  r.runningBeforeRoster=pane.innerHTML.indexOf('Running the ludus')<pane.innerHTML.indexOf('<th>Fighter</th>');
  r.more=pane.querySelectorAll('details.more').length;r.calAfter=[calNow().season,calNow().week];r.worldAfter=[w.season,w.week];
  r.flagPortrait=pane.innerHTML.includes('image href="data:image/svg');r.laurel=pane.innerHTML.includes('ico');
  const jb=w.night.bouts.find(b=>EVENTS[b.ev].teams);r.teamBout=jb?EVENTS[jb.ev].n:null;
  // force a team event on a bout to check the sides line
  w.night.bouts[2].ev='juggernaut';MGR.tab='night';document.querySelector('#mgrBody').innerHTML=mgrHTML();r.sides=!!document.querySelector('#mgrPane .sides');r.exch=!!document.querySelector('#mgrPane .exch');
  r.ledger=betlogLoad().length;return r});
await pg.screenshot({path:'shot_night22.png'});
await pg.evaluate(()=>{MGR.tab='ludus';document.querySelector('#mgrBody').innerHTML=mgrHTML()});await pg.screenshot({path:'shot_ludus22.png'});
await pg.click('#mClose');await pg.waitForTimeout(200);
await pg.evaluate(()=>document.getElementById('btnStudio').click());await pg.waitForTimeout(500);await pg.click('[data-st="tab"][data-v="all"]');await pg.waitForTimeout(300);
out.all=await pg.evaluate(()=>!!document.querySelector('.tally.compact'));
console.log(JSON.stringify(out,null,0));console.log(errs.slice(0,5));await b.close();})();
