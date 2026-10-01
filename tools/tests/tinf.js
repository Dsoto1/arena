const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_();const bt=w.night.bouts[0];$('#modal').hidden=true;SPEED='fast';SPEEDMUL.fast=0;startEvent(boutCfg(bt,true));SPEED='fast'});
for(let t=0;t<150;t++){await pg.waitForTimeout(1000);if(await pg.evaluate(()=>S.over&&S.result))break}
await pg.waitForTimeout(3000);
const r=await pg.evaluate(async()=>{const inf=(await Store.list('infamis')).map(x=>[x.name,x.cf,x.mo,x.event]);const lt=await Store.getDoc('hall','latest');
 return {players:S.players.map(p=>[p.name,p.cls,p.cf,p.cpu]),rows:S.result.rows.map(r=>[r.id,r.f,r.won]),mo:monthKey(),inf,latest:lt&&[lt.name,lt.cf,lt.status,lt.manager],ev:S.evKey,exhib:!!S.exhib,custom:!!EV().custom}});
console.log(JSON.stringify(r),errs.slice(0,2));await b.close()})();
