const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{$('#modal').hidden=true;startEvent({ev:'democritus',loc:6,seats:['soldier','hero'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:0}});SPEED='pause'});
await pg.waitForTimeout(2500);
await pg.evaluate(()=>{const m=document.getElementById('modal');if(CUR_MODAL)CUR_MODAL.done(null);S.ri=S.rounds?S.rounds.length-1:2;makeTruce(S.players[0],S.players[1]);flaviusTruceCheck()});
await pg.waitForTimeout(600);const t1=await pg.evaluate(()=>$('#mTitle').textContent+'|'+!$('#modal').hidden);
await pg.waitForTimeout(3600);const t2=await pg.evaluate(()=>({over:S.over,title:$('#mTitle').textContent,winners:S.lastResult&&S.lastResult.winners,fates:S.lastResult&&S.lastResult.rows.map(r=>r.fate),alive:S.lastResult&&S.lastResult.rows.map(r=>r.survives)}));
console.log(JSON.stringify({t1,t2}),errs.slice(0,3));await b.close()})();
