const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const r=await pg.evaluate(()=>{newWorld({type:'custom',mgr:{name:'T',ludus:'L',city:'Roma',color:'#c00',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});const w=W_();const cnt={};
  for(let wk=0;wk<12;wk++){makeNight();for(const b of w.night.bouts)for(const id of b.ents){const g=gById(id);const m=g&&g.contract?mgrById(g.contract.mgr):null;const k=m?m.ludus:'free';cnt[k]=(cnt[k]||0)+1}
    w.week++;}
  return {houses:w.mgrs.filter(m=>!m.isPlayer).length,cnt}});
console.log(JSON.stringify(r),errs.slice(0,3));await b.close()})();
