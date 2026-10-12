/* analyze_classes.js — tables from tools/balance100/classes.js raw output.
   Usage: node tools/balance100/analyze_classes.js raw.json [more.json …] > summary.json ; prints Markdown tables on stderr.
   Per event family and class: seats, win rate with a 95% Wilson interval, fair share (= the family's mean win rate per seat: wins / seats),
   relative gap, flag when the gap is outside ±20% of the fair share AND the interval excludes the fair share; elimination rate (not alive at the end),
   Fate survival (survives), killed by a beast share, gladiator kills and beast kills per seat. Seat-position bias per seat index.
   Families: classics = democritus+egidious+cassian; every other event is its own family. */
const fs=require('fs');
const files=process.argv.slice(2);const games=[];for(const f of files)games.push(...JSON.parse(fs.readFileSync(f,'utf8')).games);
const fam=ev=>['democritus','egidious','cassian'].includes(ev)?'classics':ev;
const wil=(k,n)=>{if(!n)return [0,0];const z=1.96,p=k/n,d=1+z*z/n,c=p+z*z/(2*n),e=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n));return [(c-e)/d,(c+e)/d]};
const P=x=>(x*100).toFixed(1);
const out={};let md='';
const fams=[...new Set(games.map(g=>fam(g.ev)))];
for(const F of fams){const G=games.filter(g=>fam(g.ev)===F);const rows=G.flatMap(g=>g.s.map(s=>({...s,ev:g.ev})));
  const fair=rows.reduce((a,x)=>a+x.w,0)/rows.length;const by={};
  for(const x of rows){const o=by[x.c]=by[x.c]||{n:0,w:0,el:0,sv:0,beast:0,kp:0,kn:0,f:0};o.n++;o.w+=x.w;o.el+=x.a?0:1;o.sv+=x.sv;o.beast+=(x.el||'').startsWith('beast')?1:0;o.kp+=x.kp||0;o.kn+=x.kn||0;o.f+=x.f||0}
  const cls={};for(const [c,o] of Object.entries(by)){const r=o.w/o.n,[lo,hi]=wil(o.w,o.n),rel=fair?r/fair-1:0;
    cls[c]={n:o.n,win:+P(r),lo:+P(lo),hi:+P(hi),rel:+(rel*100).toFixed(0),flag:Math.abs(rel)>0.2&&(lo>fair||hi<fair),elim:+P(o.el/o.n),fateSurv:+P(o.sv/o.n),byBeast:+P(o.beast/o.n),kp:+(o.kp/o.n).toFixed(2),kn:+(o.kn/o.n).toFixed(2),cf:+(o.f/o.n).toFixed(1)}}
  const seat={};for(const x of rows){const o=seat[x.j]=seat[x.j]||{n:0,w:0};o.n++;o.w+=x.w}
  const seats={};for(const [j,o] of Object.entries(seat)){const [lo,hi]=wil(o.w,o.n);seats[j]={n:o.n,win:+P(o.w/o.n),lo:+P(lo),hi:+P(hi)}}
  const bk={};for(const g of G)for(const [k,v] of Object.entries(g.bk||{}))bk[k]=(bk[k]||0)+v;for(const k in bk)bk[k]=+(bk[k]/G.length).toFixed(3);
  const elimBy={};for(const x of rows){if(!x.el)continue;const k=x.el.startsWith('beast:')?x.el:x.el.split(':')[0];elimBy[k]=(elimBy[k]||0)+1}for(const k in elimBy)elimBy[k]=+(elimBy[k]/G.length).toFixed(3);
  out[F]={games:G.length,seats:rows.length,fair:+P(fair),turns:+(G.reduce((a,g)=>a+g.turns,0)/G.length).toFixed(1),cls,seatsBias:seats,beastKillsByBeastPerGame:bk,elimPerGame:elimBy};
  md+=`\n### ${F} — ${G.length} games, fair share ${P(fair)}% a seat, ${out[F].turns} turns\n\n| Class | Seats | Win % (95% CI) | vs fair | Flag | Eliminated % | Survives Fate % | Killed by beast % | Glad kills | Beast kills | CF |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for(const [c,o] of Object.entries(cls).sort((a,b)=>b[1].win-a[1].win))md+=`| ${c} | ${o.n} | ${o.win} (${o.lo}–${o.hi}) | ${o.rel>0?'+':''}${o.rel}% | ${o.flag?'**⚑**':''} | ${o.elim} | ${o.fateSurv} | ${o.byBeast} | ${o.kp} | ${o.kn} | ${o.cf} |\n`;
  md+=`\nSeats: ${Object.entries(seats).map(([j,o])=>`#${+j+1} ${o.win}% (${o.lo}–${o.hi})`).join(' · ')}\n`;
  md+=`Eliminations per game: ${Object.entries(elimBy).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+v).join(' · ')}\n`;
  if(Object.keys(bk).length)md+=`Beasts slain by beasts per game: ${Object.entries(bk).map(([k,v])=>k+' '+v).join(' · ')}\n`}
process.stderr.write(md);console.log(JSON.stringify(out));
