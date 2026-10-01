const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1440,height:950}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1200);
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await pg.waitForTimeout(300);
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(800);
await pg.click('[data-mg="create"]');await pg.waitForTimeout(300);await pg.click('[data-mg="nmgo"]');await pg.waitForTimeout(800);
const o={};
o.soto=await pg.evaluate(()=>{const w=W_();const m=w.mgrs.find(x=>x.key==='sotonium');const z=w.glads.find(g=>g.sotonium);return {m:!!m,n:w.mgrs.length,z:z&&{name:z.name,cls:z.cls,ovr:z.ovr,fame:z.fame,mgr:z.contract&&z.contract.mgr,ret:z.sotoRetire},ros:m?rosterOf(m).length:0,poach:z?poachVerdict(z,50):null}});
// fate: clemency
o.fate=await pg.evaluate(()=>{const w=W_();const z=w.glads.find(g=>g.sotonium);try{const r=typeof mgrVerdict==='function'?null:null;return typeof fateOf}catch(e){return String(e)}});
// trophy stack
o.tro=await pg.evaluate(()=>{const w=W_();const t=TROPHY_LIB[0].id;earnTrophy(w,t,{why:'a',who:'X'});earnTrophy(w,t,{why:'b',who:'Y'});return {n:w.trophies.length,c:w.trophies[0].count,h:w.trophies[0].hist.length}});
// training yard tab
await pg.click('[data-mg="tab"][data-id="practice"]');await pg.waitForTimeout(500);o.yard=await pg.evaluate(()=>({regime:!!document.querySelector('#mgrPane [data-mg="regime"]'),lbl:document.querySelector('[data-mg="tab"][data-id="practice"]').textContent}));
// ludus tab: no regime there
await pg.click('[data-mg="tab"][data-id="ludus"]');await pg.waitForTimeout(500);o.ludus=await pg.evaluate(()=>({regime:!!document.querySelector('#mgrPane [data-mg="regime"]'),stables:!!document.querySelector('[data-mg="build"][data-id="stables"]')||JSON.stringify(Object.keys(FAC))}));
// city gate
o.gate=await pg.evaluate(()=>{const w=W_();const other=(w.night.loc+1)%12||1;return {other:citySquareGate(other),here:citySquareGate(w.night.loc),cost:travelCost(w)}});
o.stab=await pg.evaluate(()=>{const m=me();const c0=travelCost(W_());m.fac=m.fac||{};m.fac.stables=2;const c1=travelCost(W_());return [c0,c1]});
// week sim a couple weeks to check no crash
o.after=await pg.evaluate(()=>{const w=W_();const z=w.glads.find(g=>g.sotonium);return {wk:w.week,house:!!z,alive:z?z.alive:null,mgr:z&&z.contract&&z.contract.mgr}});
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,6));await b.close()})();
