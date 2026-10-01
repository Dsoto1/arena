const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1500,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1200);
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});
const o={};
o.noHouse=await pg.evaluate(()=>{const w={mgrs:[],glads:[]};return houseOn('sotonium')});
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(800);
await pg.click('[data-mg="create"]');await pg.waitForTimeout(300);await pg.click('[data-mg="nmgo"]');await pg.waitForTimeout(800);
o.before=await pg.evaluate(()=>W_().mgrs.map(m=>m.key).filter(Boolean).includes('sotonium'));
o.on=await pg.evaluate(()=>{const r1=CHEATS[cheatKey('CHARD')].run();const r2=CHEATS[cheatKey('DUCKIO')].run();const w=W_();return {r1,r2,keys:w.mgrs.map(m=>m.key),kids:w.glads.filter(g=>g.starChild).map(g=>[g.name,g.childStart,g.sotoRetire,g.contract&&g.contract.mgr]),fame:houseMgr(w,'sotonium').fame}});
o.gate=await pg.evaluate(()=>{const w=W_();const z=w.glads.find(g=>g.starChild==='sotonium');let n=0,m=0;for(let i=0;i<400;i++){if(starChildFights(z,{tier:'main'},w))n++;if(starChildFights(z,{tier:'under'},w))m++}return [n,m]});
o.off=await pg.evaluate(()=>{CHEATS[cheatKey('CHARD')].run();const w=W_();return {keys:w.mgrs.map(m=>m.key),z:w.glads.find(g=>g.starChild==='sotonium').alive}});
o.rudis=await pg.evaluate(()=>[rudisReady({rec:{ev:5,w:1}}),rudisReady({rec:{ev:14,w:5}})]);
for(const t of ['infirm','practice']){await pg.click(`[data-mg="tab"][data-id="${t}"]`);await pg.waitForTimeout(500);await pg.screenshot({path:`room_${t}.png`})}
o.rooms=await pg.evaluate(()=>({reg:document.querySelectorAll('.regcard').length,drill:document.querySelectorAll('.drill').length}));
await pg.click('[data-mg="tab"][data-id="night"]');await pg.waitForTimeout(500);o.stake=await pg.evaluate(()=>document.querySelectorAll('.bstake').length);
// city square
await pg.evaluate(()=>{const w=W_();w.night.travel={cost:0,paid:true};openCitySquare(w.night.loc,{})});await pg.waitForTimeout(1500);
o.side=await pg.evaluate(()=>!!document.getElementById('citySideBody'));await pg.click('[data-cside="beasts"]');await pg.waitForTimeout(500);o.beasts=await pg.evaluate(()=>document.querySelectorAll('#citySideBody .brow').length);
await pg.screenshot({path:'city46.png'});
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,5));await b.close()})();
