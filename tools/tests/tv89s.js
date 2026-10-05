/* v0.89 Play Now seats dealt at random (165-v89seats): distinct printed classes at load, re-dealt on a fresh New event, a seat changed by hand stops the dealing. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o=await pg.evaluate(async()=>{const r={};const cls=()=>CFG.seats.map(s=>s.cls);
  r.load=cls();r.distinct=new Set(r.load).size===r.load.length&&r.load.every(c=>BASE_CLS.includes(c));
  const seen=new Set([r.load[0]]);for(let i=0;i<12;i++){seats89Deal();seen.add(CFG.seats[0].cls)}r.varies=seen.size>2;
  CFG.seats[1].cls=CFG.seats[1].cls==='hero'?'soldier':'hero';const kept=cls();seats89Deal();r.kept=JSON.stringify(cls())===JSON.stringify(kept);
  return r});
const miss=[];if(!o.distinct)miss.push('distinct at load '+o.load);if(!o.varies)miss.push('seat 1 varies');if(!o.kept)miss.push('hand change kept');
console.log(JSON.stringify({o,miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
