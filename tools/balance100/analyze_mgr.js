/* analyze_mgr.js — tables from tools/balance100/mgrecon.js runs (the JSON rows it writes on stderr).
   Usage: node tools/balance100/analyze_mgr.js flavius-arena.html raw/mgr_<cfg>.jsonl … > summary.json  (Markdown on stderr)
   Per config: wins, rank, treasury at weeks 6/12/24, lowest, rivals' average/lowest treasury, rival houses that went below 0 / died,
   and the coin ledger: per tag (function@line of the built page → its src module by matching the line's text) coin in / out per run,
   for the player (p) and per rival house (r ÷ 12). LABELS maps the tags we know to plain words. */
const fs=require('fs');const path=require('path');
const html=fs.readFileSync(process.argv[2],'utf8').split('\n');const files=process.argv.slice(3);
const SRC=path.join(path.dirname(path.resolve(process.argv[2])),'src');const srcs=fs.readdirSync(SRC).filter(f=>/\.(js|html)$/.test(f)).map(f=>[f,fs.readFileSync(path.join(SRC,f),'utf8')]);
const modOf=n=>{const t=(html[n-1]||'').trim().slice(0,70);if(t.length<12)return '?';const hit=srcs.find(([,s])=>s.includes(t));return hit?hit[0].replace(/\.js$/,''):'?'};
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;const r1=x=>Math.round(x*10)/10;
const out={};let md='';const LEDALL={};
for(const f of files){const cfg=path.basename(f).replace(/^mgr_|\.jsonl$/g,'');const rows=fs.readFileSync(f,'utf8').split('\n').filter(l=>l.startsWith('{')).map(l=>JSON.parse(l));if(!rows.length)continue;
  const A=k=>r1(avg(rows.map(r=>r[k]).filter(v=>v!=null)));
  const s={runs:rows.length,wins:A('wins'),rank:A('rank'),c6:A('c6'),c12:A('c12'),c24:A('c24'),coin:A('coin'),minCoin:A('minCoin'),rivCoin:A('rivCoin'),rivMin:A('rivMin'),
    rivNegHouses:A('rivNeg'),rivDead:A('rivDead'),rivBroke:A('rivBroke'),deaths:A('deaths'),lost:A('lost'),mine:A('mine'),riv:A('riv'),shelf:A('shelf'),
    curve:Array.from({length:Math.max(...rows.map(r=>r.curve.length))},(_,i)=>Math.round(avg(rows.filter(r=>r.curve[i]!=null).map(r=>r.curve[i])))),
    rivLow:Array.from({length:Math.max(...rows.map(r=>r.rivCurve.length))},(_,i)=>Math.round(avg(rows.filter(r=>r.rivCurve[i]).map(r=>r.rivCurve[i][0])))),
    rivAvg:Array.from({length:Math.max(...rows.map(r=>r.rivCurve.length))},(_,i)=>Math.round(avg(rows.filter(r=>r.rivCurve[i]).map(r=>r.rivCurve[i][1])))),
    rivLowest:Math.min(...rows.map(r=>Math.min(...r.rivCurve.map(x=>x[0]))))};
  const led={p:{},r:{}};for(const side of ['p','r'])for(const r of rows)for(const [tag,v] of Object.entries(r.led[side]||{})){const ln=+tag.split('@')[1];const key=tag.split('@')[0]+' ['+modOf(ln)+']';
    const e=led[side][key]=led[side][key]||{in:0,out:0,tags:new Set()};e.in+=v.in/rows.length/(side==='r'?12:1);e.out+=v.out/rows.length/(side==='r'?12:1);e.tags.add(tag)}
  for(const side of ['p','r'])for(const k in led[side]){const e=led[side][k];e.in=Math.round(e.in);e.out=Math.round(e.out);e.tags=[...e.tags]}
  s.led=led;out[cfg]=s;
  md+=`\n### ${cfg} — ${rows.length} runs × ${rows[0].curve.length} weeks\n\nwins ${s.wins} · rank ${s.rank}/13 · treasury w6 ${s.c6} · w12 ${s.c12} · w24 ${s.c24} · lowest ${s.minCoin} · rivals avg ${s.rivCoin} (lowest single house ${s.rivLowest}, houses below 0 ${s.rivNegHouses}/run, dead ${s.rivDead}) · league deaths ${s.deaths} · fighters lost ${s.lost} · roster ovr ${s.mine} vs rivals ${s.riv} · rivals under 30 coin at the end ${s.rivBroke}\n`;
  md+=`treasury curve: ${s.curve.join(' ')}\nrival lowest/avg by week: ${s.rivLow.map((x,i)=>x+'/'+s.rivAvg[i]).join(' ')}\n`;
  for(const side of ['p','r']){md+=`\n${side==='p'?'Player house':'Per rival house'} — coin per run\n\n| Source / sink | In | Out | Net |\n|---|---|---|---|\n`;
    for(const [k,e] of Object.entries(led[side]).sort((a,b)=>Math.abs(b[1].in-b[1].out)-Math.abs(a[1].in-a[1].out)))if(e.in||e.out)md+=`| ${k} | ${e.in} | ${e.out} | ${e.in-e.out} |\n`}}
process.stderr.write(md);console.log(JSON.stringify(out));
