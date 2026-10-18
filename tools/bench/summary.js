/* tools/bench/summary.js — the median over several tools/bench/board.js --json runs, as a Markdown table.
   node tools/bench/summary.js run1.json run2.json run3.json [--vs base1.json base2.json base3.json]
   Each cell = the median of the runs' p50 / p95 (ms per draw); with --vs a second column group and the difference. */
const fs=require('fs');const A=process.argv.slice(2);const i=A.indexOf('--vs');const runs=(i<0?A:A.slice(0,i)).map(f=>JSON.parse(fs.readFileSync(f)));const vs=i<0?null:A.slice(i+1).map(f=>JSON.parse(fs.readFileSync(f)));
const med=a=>{const s=a.slice().sort((x,y)=>x-y);const n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2};
const pick=(R,key,f)=>R.map(r=>(r.runs.find(x=>x.key===key)||{})[f]).filter(v=>v!=null);
const keys=runs[0].runs.filter(r=>r.p50!=null).map(r=>r.key);
const loads=R=>R.map(r=>`${r.load0.l1}→${r.load1.l1}`).join(', ');
const out=[];out.push(`runs: ${runs.length} · load1 (before→after, ${runs[0].load0.cpus} CPUs): ${loads(runs)}`+(vs?` · baseline: ${loads(vs)}`:''));
out.push(vs?'| config | p50 | p95 | base p50 | base p95 | Δp50 | Δp95 | L106 ms/pass |':'| config | p50 | p95 | max (median) |');
out.push(vs?'|---|---|---|---|---|---|---|---|':'|---|---|---|---|');
for(const k of keys){const p50=med(pick(runs,k,'p50')),p95=med(pick(runs,k,'p95'));
  if(!vs){out.push(`| ${k} | ${p50.toFixed(1)} | ${p95.toFixed(1)} | ${med(pick(runs,k,'max')).toFixed(1)} |`);continue}
  const b50=med(pick(vs,k,'p50')),b95=med(pick(vs,k,'p95'));const l=runs.map(r=>((r.runs.find(x=>x.key===k)||{}).l106||{}).ms).filter(v=>v!=null);
  out.push(`| ${k} | ${p50.toFixed(1)} | ${p95.toFixed(1)} | ${b50.toFixed(1)} | ${b95.toFixed(1)} | ${(p50-b50>=0?'+':'')+(p50-b50).toFixed(1)} | ${(p95-b95>=0?'+':'')+(p95-b95).toFixed(1)} | ${l.length?med(l).toFixed(2):'–'} |`)}
console.log(out.join('\n'));
