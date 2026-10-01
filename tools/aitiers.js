/* aitiers.js — the tier ladder check: does each mind beat the one below it?
   For each adjacent pair (Novice/Apprentice … Veteran/Master) it plays seeded Classic events with two seats of each tier
   (seats and classes rotated) and reports the upper tier's share of the wins (50% = no edge; the target is ~60%).
   Usage: node tools/aitiers.js flavius-arena.html [games per pair=240] [pages=3]   → prints a table; exit 1 if a step is ≤ 50%. */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const page=path.resolve(process.argv[2]);const G=+(process.argv[3]||240),NP=+(process.argv[4]||3);
const b=await chromium.launch();const pages=[];for(let i=0;i<NP;i++){const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());await pg.goto('file://'+page);await pg.waitForTimeout(1500);
  await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide()});pages.push(pg)}
const tiers=await pages[0].evaluate(()=>AI_TIERS.map(t=>[t.k,t.n]));let bad=0;const rows=[];
for(let t=0;t<tiers.length-1;t++){const lo=tiers[t][0],hi=tiers[t+1][0];const list=Array.from({length:G},(_,i)=>({seed:50000+t*100000+i*7919,ev:['democritus','egidious','cassian'][i%3],rot:i%4}));
  const per=Math.ceil(G/NP);const parts=await Promise.all(pages.map((pg,pi)=>pg.evaluate(async({lo,hi,list})=>{let up=0,down=0;
    for(const g of list){const cls=[...BASE_CLS].sort((a,b)=>((a.length*31+g.seed)%7)-((b.length*17+g.seed)%7)).slice(0,4);
      const who=[hi,hi,lo,lo].map((_,j,a)=>a[(j+g.rot)%4]);const seats=cls.map((c,j)=>({cls:c,cpu:true,diff:who[j]}));
      let r=null;try{r=await simEvent({ev:g.ev,loc:6,seed:g.seed,seats,opts:{...CFG.opts,spect:0}},{timeoutMs:60000})}catch(e){}
      if(!r||!r.rows)continue;r.rows.forEach((x,j)=>{if(x.won){if(who[j]===hi)up++;else down++}})}return {up,down}},{lo,hi,list:list.slice(pi*per,(pi+1)*per)})));
  const up=parts.reduce((a,x)=>a+x.up,0),down=parts.reduce((a,x)=>a+x.down,0);const sh=up/Math.max(1,up+down);if(sh<=0.5)bad++;
  rows.push(`${tiers[t+1][1].padEnd(10)} vs ${tiers[t][1].padEnd(10)}  ${(sh*100).toFixed(1)}% of wins  (${up}-${down})`)}
console.log(rows.join('\n'));await b.close();process.exit(bad?1:0)})();
