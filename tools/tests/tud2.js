const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\./,r=>r.abort());await pg.addInitScript(()=>{try{localStorage.setItem('flavius_v106b1off','1')}catch(e){}}); /* v1.06 G1: this test is not about the Set-off lock */
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});openManager()});await pg.waitForTimeout(600);
await pg.evaluate(()=>{const w=W_();me().coin=-40;w.underdog={armed:1,season:w.season,week:w.week};MGR.tab='night';MGR_REDRAW()});
await pg.waitForTimeout(300);
await pg.evaluate(async()=>{await runBoutSim(0);await runBoutSim(1);MGR_REDRAW()});
await pg.waitForTimeout(400);
await pg.evaluate(()=>{const s=document.getElementById('udAlly');if(s&&s.options.length>1)s.value=s.options[1].value});
await pg.click('[data-mg="underdog"]');
await pg.waitForTimeout(1500);await pg.evaluate(()=>{SPEED='pause'});
let snap=null;
for(let i=0;i<60;i++){snap=await pg.evaluate(()=>({ph:S&&S.phase,modal:!document.getElementById('modal').hidden,title:$('#mTitle').textContent.slice(0,50),busy:S&&S.busy}));
  if(snap.ph&&snap.ph!=='setup')break;
  if(snap.modal)await pg.evaluate(()=>{const bs=[...document.querySelectorAll('#mBtns .btn,#mBody .btn')].filter(x=>!x.disabled);const p2=bs.find(x=>x.classList.contains('primary'))||bs[0];if(p2)p2.click()});
  await pg.waitForTimeout(400)}
console.log('SNAP',JSON.stringify(snap));
const live=await pg.evaluate(()=>({ph:S.phase,truces:[...S.truces].length,lan:!!S.players.find(p=>!p.cpu)}));
console.log('LIVE2',JSON.stringify(live));
await pg.evaluate(()=>{const m=document.getElementById('modal');if(m)m.hidden=true;
  const lan=S.players.find(p=>!p.cpu);lan.hp.chest=0;eliminate(lan,{type:'player',p:S.players.find(p=>p.cpu&&p.alive)});
  const rest=S.players.filter(p=>p.alive);for(let i=1;i<rest.length;i++)eliminate(rest[i],{type:'player',p:rest[0]});});
await pg.waitForTimeout(4500);
const end=await pg.evaluate(()=>{const w=W_();return {over:S&&S.over,dead:w.dead&&w.dead.why,used:w.underdogUsed,ud:w.underdog}});
console.log('END',JSON.stringify(end));console.log('ERRS',errs.slice(0,6));
await b.close()})();
