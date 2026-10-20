/* tools/bench/v108costs.js — costs.json + the markdown tables of the v1.08 mock-up from tools/bench/v108ab.js (ab.json) and
   tools/bench/v108shots.js (shots.json). node tools/bench/v108costs.js <ab.json> <shots.json> <costs.json> [whole-run dir (v108cost.sh)] */
const fs=require('fs');const [AB,SH,OUT,WR]=process.argv.slice(2);const ab=JSON.parse(fs.readFileSync(AB,'utf8')),sh=JSON.parse(fs.readFileSync(SH,'utf8'));
const rows=ab.rows.filter(r=>r.mode);const cfgs=[...new Set(rows.map(r=>r.view+' '+r.mode+' '+r.pass))];
const out={method:{ab:'tools/bench/v108ab.js: one page per variant × view, the forged v1.06 bench scene; 407\'s per-frame work flipped on/off EVERY frame (A B B A), '+
  (ab.blocks*ab.n/2)+' pairs per row; Δ = median of (on − off) of neighbouring frames, ms per draw(). js = the draw() call; flush = + a 1-px getImageData (this box\'s CPU raster; no GPU). '+
  'Baked parts ride in layers blitted anyway (0 per frame by construction); their one-time re-bake is listed under bake.',
  box:'4 vCPU container, no GPU, headless Chromium (software 2D canvas); load during the runs in each row'},at:ab.at,delta:{},bake:{},contrast:{},flicker:sh.still,metal:{}};
for(const r of rows){((out.delta[r.variant]=out.delta[r.variant]||{})[r.view+' '+r.mode+' '+r.pass])={delta:r.delta,dMean:r.dMean,off:r.off,on:r.on,off95:r.off95,on95:r.on95,pairs:r.n,load:r.load};
  const b=out.bake[r.variant]=out.bake[r.variant]||{};for(const k in r.bake)b[k]=Math.max(b[k]||0,+(+r.bake[k]).toFixed(2))}
for(const s of sh.shots){((out.contrast[s.view+' '+s.mode]=out.contrast[s.view+' '+s.mode]||{})[s.variant])={mean:s.contrast.mean,min:s.contrast.min};
  if(s.v108&&s.v108.metal)out.metal[s.variant+' '+s.view]={cells:s.v108.metal,ms:+s.v108.metalMs.toFixed(1),msPerCell:+(s.v108.metalMs/s.v108.metal).toFixed(2)}}
if(WR&&fs.existsSync(WR)){out.wholeRun='tools/bench/v108cost.sh (whole-run medians, 2 rounds, 1-min load 1.2–10.5): rejected as the measure — today vs today moved ±3–10 ms between runs; kept in '+WR}
fs.writeFileSync(OUT,JSON.stringify(out,null,1));
const V=['torch','mat','depth','all','safari'];const f=x=>x==null?'–':(x>0?'+':'')+x;
console.log('| config | '+V.join(' | ')+' |');console.log('|'+'---|'.repeat(V.length+1));
for(const c of cfgs.sort((a,b)=>(a.endsWith('flush')-b.endsWith('flush'))||a.localeCompare(b))){console.log(`| ${c} | ${V.map(v=>out.delta[v]&&out.delta[v][c]?f(out.delta[v][c].delta):'–').join(' | ')} |`)}
console.log('\nbaseline (off) ms per draw, median:');for(const c of cfgs){const a=out.delta.all&&out.delta.all[c],s=out.delta.safari&&out.delta.safari[c];console.log(c,'today',a?a.off:'–','→ all',a?a.on:'–','| safari path today',s?s.off:'–','→',s?s.on:'–')}
console.log('\nbake (one-time, ms):',JSON.stringify(out.bake));console.log('metal pass:',JSON.stringify(out.metal));
console.log('\ncontrast (mean/min):');for(const k in out.contrast)console.log(k,Object.entries(out.contrast[k]).map(([v,c])=>v+' '+c.mean+'/'+c.min).join(' · '));
console.log('\nflicker:',JSON.stringify(sh.still.map(s=>s.variant+' '+s.view+' normal-same '+s.normal.same+' calm-same '+s.reduceMotion.same)));
