const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1560,height:1000}});
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const out={};
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(400);
out.m=await pg.evaluate(async()=>{newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});const w=W_(),m=me();m.coin=300;
  const fa=freeAgents().slice(0,3);fa.forEach(g=>{g.contract={mgr:m.id,wage:5,weeks:20,since:1};g.scout=2});const r={};
  const R=t=>{MGR.tab=t;document.querySelector('#mgrBody').innerHTML=mgrHTML();return document.querySelector('#mgrPane')};
  let p=R('ludus');r.ludusNoRoster=!p.innerHTML.includes('<th>Fighter</th><th>Rating</th><th>Record</th><th>Morale</th>');r.ledgerInRun=!!p.querySelector('.runL .ledgers');r.rulesGone=!p.querySelector('.rulesbox');
  p=R('recruit');r.rosterInRecruit=p.innerHTML.includes('Your roster');
  p=R('me');r.rulesInMe=!!p.querySelector('.rulesbox');
  p=R('exch');r.exch=!!p.querySelector('.haven')&&!!p.querySelector('.exch,.rc-sub');
  p=R('night');r.simall=!!p.querySelector('.btn.simall');r.walk=p.innerHTML.includes('Walk the sand');
  for(let i=0;i<w.night.bouts.length;i++)await runBoutSim(i);p=R('night');r.results=!!p.querySelector('#nightRes');r.resRows=p.querySelectorAll('#nightRes tr').length;
  let guard=0;while((w.pend||[]).length&&guard++<25){const P=w.pend[0];if(P.t==='thumb')settlePending(0,null,{d6:5,d12:6});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}
  await endWeek();p=R('paper');r.top10=p.innerHTML.includes('TOP X')||!!p.querySelector('.ak102cls') /* v1.02 342: the Classifieds corner */;r.overheard=/OVERHEARD/i.test(p.innerHTML);
  r.tabs=[...document.querySelectorAll('.tabs button')].map(b=>b.textContent.trim()).join('|');return r});
await pg.screenshot({path:'shot_paper23.png'});
await pg.evaluate(()=>{MGR.tab='exch';document.querySelector('#mgrBody').innerHTML=mgrHTML()});await pg.screenshot({path:'shot_exch23.png'});
await pg.evaluate(()=>{MGR.tab='ludus';document.querySelector('#mgrBody').innerHTML=mgrHTML()});await pg.screenshot({path:'shot_ludus23.png',fullPage:false});
console.log(JSON.stringify(out));console.log(errs.slice(0,5));await b.close();})();
