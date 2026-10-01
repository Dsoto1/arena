const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const out=await pg.evaluate(async()=>{newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_(),m=me();const o={};
  // in-order enforcement
  o.order=[];await runBoutSim(1).then(()=>o.order.push('feature-ran')).catch(e=>o.order.push('err'));
  // via handler guard only (runBoutSim direct isn't gated) — check UI gating
  MGR.tab='night';document.body.insertAdjacentHTML('beforeend','<div id="mgrBody" hidden></div>');document.querySelector('#mgrBody').innerHTML=mgrHTML();
  o.waiting=(document.querySelector('#mgrBody').innerHTML.match(/Waiting its turn/g)||[]).length;
  // loans: force negative
  m.coin=-20;w.loanAsk=0;w.pend=[];for(const bt of w.night.bouts)bt.done=bt.done||true;
  for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);
  await endWeek();o.loanAsk=w.loanAsk;o.coin=m.coin;
  // take a syndicate loan via handler simulation
  const L9=loanLender();w.loan={amt:300,base:300,name:L9.name,kind:L9.kind,mgr:L9.mgr,wk:w.week};m.coin+=300;
  for(const bt of w.night.bouts)bt.done=true;w.pend=[];await endWeek();
  o.loanAfter=w.loan?{amt:w.loan.amt,name:w.loan.name}:null;
  // legacy
  m.wins=14;m.fameBest=55;w.trophies=[{tid:'flavian_cup'},{tid:'palm_roma'},{tid:'horn'}];w.rudisFreed=2;w.gemsFound=1;
  const Lg=legacyOf(w,m);o.legacy={score:Lg.score,grade:Lg.grade,tier:Lg.tier};
  MGR.tab='me';document.querySelector('#mgrBody').innerHTML=mgrHTML();o.legacyCard=document.querySelector('#mgrBody').innerHTML.includes('The legacy of');
  o.newsArc=(MGR.tab='news',document.querySelector('#mgrBody').innerHTML=mgrHTML(),document.querySelector('#mgrBody').innerHTML.includes('The Ludus Archives'));
  o.tabs=[...document.querySelectorAll('#mgrBody .mtabs button')].map(b=>b.textContent.trim()).join('|');
  return o});
console.log(JSON.stringify(out,null,1),errs.slice(0,5));await b.close()})();
