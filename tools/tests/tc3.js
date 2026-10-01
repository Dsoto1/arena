const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.evaluate(()=>{window.travelOK=()=>true;window.travelBlock=()=>false});await pg.click('#mClose');
const out=await pg.evaluate(async()=>{newWorld({type:'pre',key:MGR_PRE[0].key});me().coin=400;
  const ident=specIdentity(new Set());const r={...ident,city:LOCATIONS[W_().night.loc].n,visits:3,mem:[]};CROWD_CACHE.push(r);
  openCitySquare(W_().night.loc,{});await new Promise(rs=>setTimeout(rs,1200));
  const n=CITY.npcs.find(x=>x.kind==='spec'&&x.reg===r);if(!n)return {noSpec:CITY.npcs.filter(x=>x.kind==='spec').length};
  citySelect(n);await new Promise(rs=>setTimeout(rs,150));
  const o={panel:!!document.querySelector('#cityPanel [data-spact="treat"]')};
  document.querySelector('#cityPanel [data-spact="treat"]').click();await new Promise(rs=>setTimeout(rs,300));
  o.used=r.wkAct&&Object.keys(r.wkAct.u);o.toast=(document.getElementById('mToast')||{}).textContent||'';
  document.querySelector('#cityPanel [data-spact="treat"]')?.click();await new Promise(rs=>setTimeout(rs,250));
  o.toast2=(document.getElementById('mToast')||{}).textContent||'';
  for(const k of ['ban','ticket']){const b2=document.querySelector(`#cityPanel [data-spact="${k}"]`);if(b2)b2.click();await new Promise(rs=>setTimeout(rs,250))}
  const b3=document.querySelector('#cityPanel [data-spact="sign"]');if(b3)b3.click();await new Promise(rs=>setTimeout(rs,250));
  o.toast3=(document.getElementById('mToast')||{}).textContent||'';o.usedAll=r.wkAct&&Object.keys(r.wkAct.u);
  return o});
console.log(JSON.stringify(out),errs.slice(0,4));await b.close()})();
