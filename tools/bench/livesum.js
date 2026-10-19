/* tools/bench/livesum.js — the median over several tools/bench/live.js --json runs, as a Markdown table (v1.07, tools/plans/v107/PERF.md).
   node tools/bench/livesum.js after1.json after2.json … [--vs before1.json before2.json …]
   Per config: whole frame (rAF interval) p50 / p95, frames over 50 ms (share), board paint js p50 / p95 / max, and — when the runs were made with
   --cpu — the main thread's CPU (thread) time per frame (robust when other jobs share the box). With --vs: before → after for each. */
const fs=require('fs');const A=process.argv.slice(2);const i=A.indexOf('--vs');const load=f=>JSON.parse(fs.readFileSync(f));
const runs=(i<0?A:A.slice(0,i)).map(load),vs=i<0?null:A.slice(i+1).map(load);
const med=a=>{a=a.filter(v=>v!=null&&!isNaN(v));if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2};
const get=(R,key,f)=>med(R.map(r=>{const x=r.runs.find(y=>y.key===key);return x?f(x):null}));
const M={f50:x=>x.frame.p50,f95:x=>x.frame.p95,o50:x=>100*x.over50/Math.max(1,x.n),fps:x=>x.fps,j50:x=>x.js.p50,j95:x=>x.js.p95,jmax:x=>x.js.max,cpu:x=>x.cpu?x.cpu.mainPerFrame:null,long:x=>x.longMs};
const keys=[...new Set(runs.flatMap(r=>r.runs.map(x=>x.key)))];const f=v=>v==null?'–':v.toFixed(1);
const loads=R=>R.map(r=>`${r.load0.l1}→${r.load1.l1}`).join(', ');
const out=[`runs: ${runs.length}${vs?' (before: '+vs.length+')':''} · load1 before→after: ${loads(runs)}${vs?' · before: '+loads(vs):''}`];
const cols=['fps','f50','f95','o50','j50','j95','jmax','cpu','long'],names={fps:'fps',f50:'frame p50',f95:'frame p95',o50:'% frames >50 ms',j50:'js p50',j95:'js p95',jmax:'js max',cpu:'main CPU/frame',long:'long tasks ms'};
out.push('| config | '+cols.map(c=>names[c]).join(' | ')+' |');out.push('|---|'+cols.map(()=>'---').join('|')+'|');
for(const k of keys){out.push(`| ${k} | `+cols.map(c=>{const a=get(runs,k,M[c]);if(!vs)return f(a);const b=get(vs,k,M[c]);return `${f(b)} → ${f(a)}`}).join(' | ')+' |')}
console.log(out.join('\n'));
