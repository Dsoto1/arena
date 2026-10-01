const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');const out={};
out.a=await pg.evaluate(async()=>{newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_(),m=me();m.coin=3000;
  // recruiting gates
  const fa=freeAgents().sort((a,b)=>effOvr(b)-effOvr(a))[0];const r={ask:askWage(fa),stars:starsOf(effOvr(fa)),bypass:Math.ceil(askWage(fa)*fameBypassX(fa,m))};
  r.v1=offerVerdict(fa,askWage(fa),8,0).why||'ok';r.v2=offerVerdict(fa,Math.ceil(askWage(fa)*2.6),8,0).why||'ok';
  recMark(fa,'pitch');r.gate=recGate(fa,'pitch')[0];
  // facilities & grade
  facBuild(m,'yard');facBuild(m,'valet');r.grade=ludusGrade(m);r.cap=repCap();
  // a week of AI life
  for(let i=0;i<4;i++)aiLanistaWeek();r.logs=w.mgrs.filter(x=>!x.isPlayer).map(x=>(x.log||[]).length);
  r.op=opinionOf(w.mgrs.find(x=>!x.isPlayer)).v;r.pay=betPay(100,8);r.maxStake=betMaxStake(8,1000);
  return r});
await pg.evaluate(()=>{MGR.tab='league';openManager()});await pg.waitForTimeout(700);
await pg.click('tr.lrowlink:not(.me)');await pg.waitForTimeout(400);await pg.screenshot({path:'shot_team.png'});
await pg.evaluate(()=>{const m=mgrById(MGR.teamId);m.relB=60;document.querySelector('#mgrBody').innerHTML=mgrHTML()});await pg.click('[data-mg="envoy"][data-id$="|trade"]');await pg.waitForTimeout(300);
await pg.click('[data-mg="tradego"]');await pg.waitForTimeout(300);await pg.screenshot({path:'shot_trade.png'});
out.tradeMsg=await pg.evaluate(()=>MGR.trade?MGR.trade.msg:'done');
await pg.evaluate(()=>{MGR.tab='ludus';MGR.run='fac';$('#mgrBody').innerHTML=mgrHTML()});await pg.waitForTimeout(300);
await pg.evaluate(()=>document.querySelector('.faccard').scrollIntoView());await pg.waitForTimeout(200);await pg.screenshot({path:'shot_fac.png'});
await pg.evaluate(()=>{MGR.tab='sched';$('#mgrBody').innerHTML=mgrHTML();$('#mBody').scrollTop=0});await pg.waitForTimeout(300);await pg.screenshot({path:'shot_season.png'});
await pg.evaluate(()=>{const fa=freeAgents()[0];MGR.tab='recruit';MGR.rsel=fa.id;MGR.sel=fa.id;$('#mgrBody').innerHTML=mgrHTML()});await pg.waitForTimeout(300);await pg.screenshot({path:'shot_recruit.png'});
console.log(JSON.stringify(out,null,1),errs.slice(0,5));await b.close()})();
