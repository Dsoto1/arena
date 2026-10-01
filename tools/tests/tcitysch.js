const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);
const r=await pg.evaluate(()=>{const out={};const old={w:CITY.w,li:CITY.li};
  CITY.w=null;for(let li=1;li<LOCATIONS.length;li++){CITY.li=li;out['free'+li]=/Next games/.test(cityNextEventLine())}
  newWorld({type:'custom',mgr:{name:'T',ludus:'L',city:'Roma',color:'#c00',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});CITY.w=W_();
  for(let li=1;li<LOCATIONS.length;li++){CITY.li=li;out['mgr'+li]=/Next games|Tonight/.test(cityNextEventLine())}
  CITY.w=old.w;CITY.li=old.li;return out});
const bad=Object.entries(r).filter(([k,v])=>!v);console.log('cities',Object.keys(r).length,'missing',JSON.stringify(bad),errs.slice(0,3));await b.close()})();
