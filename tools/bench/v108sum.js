/* tools/bench/v108sum.js — summarise tools/bench/v108cost.sh runs: median of the rounds per variant × config, Δ vs today.
     node tools/bench/v108sum.js <dir> [--json costs.json] [--md]   */
const fs=require('fs'),path=require('path');const A=process.argv.slice(2);const DIR=A[0];const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
const med=a=>{const s=a.filter(v=>v!=null).sort((x,y)=>x-y);if(!s.length)return null;const m=s.length>>1;return +(s.length%2?s[m]:(s[m-1]+s[m])/2).toFixed(2)};
const runs={};const loads=[];
for(const f of fs.readdirSync(DIR).filter(f=>f.endsWith('.json'))){const m=/^(\w+)_r(\d+)\.json$/.exec(f);if(!m)continue;const j=JSON.parse(fs.readFileSync(path.join(DIR,f),'utf8'));
  loads.push({run:f,l0:j.load0&&j.load0.l1,l1:j.load1&&j.load1.l1});
  for(const r of j.runs){if(r.p50==null)continue;const k=r.key;((runs[m[1]]=runs[m[1]]||{})[k]=runs[m[1]][k]||[]).push(r)}}
const out={method:'tools/bench/board.js forged scene, ms per draw(); js = the draw() call, flush = + a 1-px getImageData (CPU raster, this box has no GPU); median of rounds',loads,variants:{}};
for(const v in runs){out.variants[v]={};for(const k in runs[v]){const L=runs[v][k];out.variants[v][k]={p50:med(L.map(r=>r.p50)),p95:med(L.map(r=>r.p95)),n:L.length,
  l106:med(L.map(r=>r.l106&&r.l106.ms)),walls:med(L.map(r=>r.layers&&r.layers.walls)),decals:med(L.map(r=>r.layers&&r.layers.decals)),stands:med(L.map(r=>r.layers&&r.layers.stands))}}}
const base={torch:'off',mat:'off',depth:'off',all:'off',safari:'safarioff'};
out.delta={};for(const v in base){if(!out.variants[v]||!out.variants[base[v]])continue;out.delta[v]={};for(const k in out.variants[v]){const a=out.variants[v][k],b=out.variants[base[v]][k];if(!b)continue;
  out.delta[v][k]={dp50:+(a.p50-b.p50).toFixed(2),dp95:+(a.p95-b.p95).toFixed(2),p50:a.p50,base50:b.p50}}}
if(opt('json',''))fs.writeFileSync(opt('json'),JSON.stringify(out,null,1));
const keys=[...new Set(Object.values(out.variants).flatMap(o=>Object.keys(o)))].sort((a,b)=>{const f=k=>(k.includes('flush')?1:0);return f(a)-f(b)||a.localeCompare(b)});
const vs=['off','torch','mat','depth','all','safarioff','safari'].filter(v=>out.variants[v]);
console.log('| config | '+vs.map(v=>v+' p50').join(' | ')+' | Δ all p50 | Δ all p95 | Δ safari p50 |');console.log('|'+'---|'.repeat(vs.length+4));
for(const k of keys){const c=v=>out.variants[v]&&out.variants[v][k]?out.variants[v][k].p50:'–';const d=(v,f)=>out.delta[v]&&out.delta[v][k]?out.delta[v][k][f]:'–';
  console.log(`| ${k} | ${vs.map(c).join(' | ')} | ${d('all','dp50')} | ${d('all','dp95')} | ${d('safari','dp50')} |`)}
console.log('loads',JSON.stringify(loads.map(l=>l.run+' '+l.l0+'→'+l.l1)));
