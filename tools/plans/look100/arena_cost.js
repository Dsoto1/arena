/* arena_cost.js — steadier draw costs: configs interleaved over 4 rounds, medians; desktop 1440×900 (dpr 1) + phone 844×390 (dpr 2) */
const L=require('./arena_lib');const fs=require('fs');const D=__dirname+'/';const SRC=fs.readFileSync(D+'arena_proto.js','utf8');
const CF=[['before',null,null],['bronze','bronze',null],['balus','balus',null],['parapet','parapet',null],['trav',null,'trav'],['sand',null,'sand'],['marble',null,'marble'],['trav+bronze','bronze','trav'],['sand+balus','balus','sand'],['marble+parapet','parapet','marble']];
async function run(pg,label){await pg.evaluate(SRC);
  const tex=await pg.evaluate(()=>{const o={};for(const s of ['trav','sand','marble']){PR100.T={};PR100.texMs=0;PR100.set({stone:s});o[s]=+PR100.texMs.toFixed(1)}PR100.set({stone:null});return o});
  const acc={};for(let round=0;round<4;round++)for(const [n,r,s] of CF){const c=await pg.evaluate(([r,s])=>{PR100.set({rail:r,stone:s});return PR100.cost(8)},[r,s]);(acc[n]=acc[n]||[]).push(c)}
  const med=a=>{a=a.slice().sort((x,y)=>x-y);return +a[a.length>>1].toFixed(1)};const out={texBuildMs:tex};
  for(const [n] of CF)out[n]={cachedMs:med(acc[n].map(c=>c.cached)),rebuildMs:med(acc[n].map(c=>c.rebuild)),underBakeMs:med(acc[n].map(c=>c.under)),topBakeMs:med(acc[n].map(c=>c.top))};
  return out}
(async()=>{const {b,pg}=await L.open();await L.startAt(pg,6,4);const desk=await run(pg);
  const ph=await L.open({browser:b,phone:true});await L.startAt(ph.pg,6,4);const phone=await run(ph.pg);
  fs.writeFileSync(D+'arena_costs.json',JSON.stringify({note:'ms, headless Chromium software canvas; cached = one draw() with every layer baked; rebuild = one draw() after AR91.ver++ (under/deco/top/light re-baked)',desktop1440:desk,phone844x390dpr2:phone},null,1));
  console.log(JSON.stringify({desk,phone}));await b.close()})();
