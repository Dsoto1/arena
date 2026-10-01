/* aitune.js — tunes the CPU attack weights (AIW in 06-ai / 80-aitiers) by self-play, headless.
   A (1+λ) evolution strategy: each generation mutates the incumbent weights λ times; every candidate plays the same seeded
   games as one Master-tier seat against three Master seats on the incumbent weights (seat rotated). The best candidate must
   then beat the incumbent again on fresh seeds before it is accepted — so a lucky streak never sticks.
   Usage: node tools/aitune.js flavius-arena.html [generations=8] [lambda=6] [games=180] [pages=3]
   Writes tools/aitune.out.json: {tuned, base, log}. Paste `tuned` into AIW_TUNED in src/80-aitiers.js (only keys that moved). */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const page=path.resolve(process.argv[2]);const GEN=+(process.argv[3]||8),LAM=+(process.argv[4]||6),G=+(process.argv[5]||180),NP=+(process.argv[6]||3);
const b=await chromium.launch();const pages=[];for(let i=0;i<NP;i++){const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());await pg.goto('file://'+page);await pg.waitForTimeout(1500);
  await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide()});pages.push(pg)}
const base=await pages[0].evaluate(()=>({...AIW_BASE}));const KEYS=Object.keys(base);
let rng=12345;const rnd=()=>{rng=(rng*1103515245+12345)%2147483648;return rng/2147483648};const gauss=()=>Math.sqrt(-2*Math.log(rnd()+1e-9))*Math.cos(2*Math.PI*rnd());
const games=(n,seed0)=>Array.from({length:n},(_,i)=>({seed:seed0+i*7919,ev:['democritus','egidious','cassian'][i%3],seat:i%4}));
/* plays a list of games for (cand, inc): returns the candidate's win share (wins / games; 0.25 = even) */
async function evalW(cand,inc,list){const per=Math.ceil(list.length/NP);const parts=await Promise.all(pages.map((pg,pi)=>pg.evaluate(async({cand,inc,list})=>{let w=0,n=0;
  for(const g of list){const cls=[...BASE_CLS].sort((a,b)=>((a.length*31+g.seed)%7)-((b.length*17+g.seed)%7)).slice(0,4);
    const seats=cls.map((c,j)=>({cls:c,cpu:true,diff:'master',aiw:j===g.seat?cand:inc}));
    let r=null;try{r=await simEvent({ev:g.ev,loc:6,seed:g.seed,seats,opts:{...CFG.opts,spect:0}},{timeoutMs:60000})}catch(e){}
    if(!r||!r.rows)continue;n++;if(r.rows[g.seat]&&r.rows[g.seat].won)w++}return {w,n}},{cand,inc,list:list.slice(pi*per,(pi+1)*per)})));
  const w=parts.reduce((a,x)=>a+x.w,0),n=parts.reduce((a,x)=>a+x.n,0);return n?w/n:0}
const mutate=W=>{const o={...W};for(const k of KEYS)if(rnd()<0.4)o[k]=+(W[k]*Math.exp(gauss()*0.25)).toFixed(4);return o};
let inc={...base};const log=[];let seed=1000;
for(let gen=1;gen<=GEN;gen++){const list=games(G,seed);seed+=G*7919+13;const cands=Array.from({length:LAM},()=>mutate(inc));let best=null;
  for(const c of cands){const s=await evalW(c,inc,list);if(!best||s>best.s)best={c,s}}
  const conf=await evalW(best.c,inc,games(G*2,seed));seed+=G*2*7919+13;const ok=best.s>0.29&&conf>0.28;
  log.push({gen,best:+best.s.toFixed(3),confirm:+conf.toFixed(3),accepted:ok});process.stderr.write(`gen ${gen}: best ${best.s.toFixed(3)} confirm ${conf.toFixed(3)} ${ok?'ACCEPT':'keep'}\n`);
  if(ok)inc=best.c}
/* the final check: tuned vs hand-set, fresh seeds, both directions */
const fin=await evalW(inc,base,games(G*3,seed));seed+=G*3*7919;const rev=await evalW(base,inc,games(G*3,seed));
process.stderr.write(`final: tuned seat wins ${(fin*100).toFixed(1)}% vs 3 hand-set (25% = even); hand-set seat vs 3 tuned ${(rev*100).toFixed(1)}%\n`);
fs.writeFileSync(path.join(__dirname,'aitune.out.json'),JSON.stringify({tuned:inc,base,final:{tunedVsBase:fin,baseVsTuned:rev},log},null,1));await b.close()})();
