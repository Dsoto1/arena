/* simguide.js — the Play Now guide's numbers: N all-CPU Classic events (Democritus, Egidious, Cassian), four gladiators
   each, printed classes with rolled ratings and personalities. Prints SIM JSON (the shape of SIM50 in 53-guide50.js,
   plus "perk": win rates by rating perk).  Usage: node tools/simguide.js flavius-arena.html [games=600] > sim.json */
const {chromium}=require('playwright');
(async()=>{const page=process.argv[2];const N=+(process.argv[3]||600);
const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());
await pg.goto('file://'+require('path').resolve(page));await pg.waitForTimeout(2000);
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide()});
const rows=[];const games=[];
for(let i=0;i<N;i++){
  const r=await pg.evaluate(async()=>{const evs=['democritus','egidious','cassian'];const ev=evs[Math.floor(Math.random()*3)];
    const cls=[...BASE_CLS].sort(()=>Math.random()-.5).slice(0,4);
    const seats=cls.map(c=>({cls:c,cpu:true,pers:rollPersonality(c),stats:rollStats(leanOf(c),70,Math.random)}));
    let res;try{res=await simEvent({ev,loc:1+Math.floor(Math.random()*12),seats,opts:{...CFG.opts,spect:0}},{timeoutMs:60000})}catch(e){return {err:String(e&&e.message||e)}}
    return {ev,turns:res.turns,npcKills:res.npcKills||0,rows:res.rows.map((x,j)=>({cls:x.cls,f:x.f,won:x.won,fate:x.fate,kn:x.kn,buys:x.buys,pots:x.pots,cards:x.cards,pers:seats[j].pers,st:seats[j].stats}))}});
  if(r.err){process.stderr.write('err '+r.err+'\n');continue}
  games.push(r);rows.push(...r.rows);if(i%50===49)process.stderr.write(`${i+1}/${N}\n`)}
await b.close();
const pct=(a,n)=>n?Math.round(a/n*100):0,avg=(a,n)=>n?Math.round(a/n*10)/10:0;
const ludus=x=>!x.won&&/Ludus|Rudis|spared|Survival/i.test(x.fate||'');
const grp=(f)=>{const o={};for(const x of rows){const k=f(x);if(k==null)continue;const g=o[k]=o[k]||{n:0,w:0,cf:0,lu:0};g.n++;g.w+=x.won?1:0;g.cf+=x.f;g.lu+=x.won||ludus(x)?1:0}
  for(const k in o){const g=o[k];o[k]={win:pct(g.w,g.n),cf:avg(g.cf,g.n),ludus:pct(g.lu,g.n),n:g.n}}return o};
const band2=v=>v>=96?2:v>=76?1:0,band3=v=>v>=96?3:v>=87?2:v>=76?1:0,bi=v=>v>=96?'hard':v>=76?'normal':'easy';
const comp=k=>{const hi=rows.filter(x=>x[k]>=2),lo=rows.filter(x=>!x[k]);return {hiWin:pct(hi.filter(x=>x.won).length,hi.length),hiLudus:pct(hi.filter(x=>x.won||ludus(x)).length,hi.length),loWin:pct(lo.filter(x=>x.won).length,lo.length),loLudus:pct(lo.filter(x=>x.won||ludus(x)).length,lo.length),hiN:hi.length,loN:lo.length}};
const bins=[-1e9,0,10,20,30,40,50,60,1e9];const labels=['<0','0–9','10–19','20–29','30–39','40–49','50–59','60+'];
const hist={labels,all:labels.map((_,i)=>rows.filter(x=>x.f>=bins[i]&&x.f<bins[i+1]).length),win:labels.map((_,i)=>rows.filter(x=>x.won&&x.f>=bins[i]&&x.f<bins[i+1]).length)};
const winners=rows.filter(x=>x.won);const evT={};for(const g of games){(evT[g.ev]=evT[g.ev]||[]).push(g.turns)}
const bold=rows.filter(x=>x.pers.survival<=30),caut=rows.filter(x=>x.pers.survival>=70);
const S={ver:process.env.SIMVER||'0.56',games:games.length,gladiators:rows.length,winCF:Math.round(winners.reduce((a,x)=>a+x.f,0)/Math.max(1,winners.length)),
  ludusPct:pct(rows.filter(x=>ludus(x)).length,rows.length),avgTurns:Math.round(games.reduce((a,g)=>a+g.turns,0)/Math.max(1,games.length)),
  evTurns:Object.fromEntries(Object.entries(evT).map(([k,v])=>[k,Math.round(v.reduce((a,b)=>a+b,0)/v.length)])),
  potWin:pct(rows.filter(x=>x.pots>0&&x.won).length,rows.filter(x=>x.pots>0).length),noPotWin:pct(rows.filter(x=>!x.pots&&x.won).length,rows.filter(x=>!x.pots).length),
  cls:grp(x=>x.cls),pers:grp(x=>Object.entries(x.pers).sort((a,b)=>b[1]-a[1])[0][0]),
  comp:{kn:comp('kn'),buys:comp('buys'),pots:comp('pots'),cards:comp('cards')},
  ends:{won:winners.length,ludus:rows.filter(x=>ludus(x)).length,fell:rows.filter(x=>!x.won&&!ludus(x)).length,freed:0},hist,
  bold:{cf:avg(bold.reduce((a,x)=>a+x.f,0),bold.length),win:pct(bold.filter(x=>x.won).length,bold.length)},caut:{cf:avg(caut.reduce((a,x)=>a+x.f,0),caut.length),win:pct(caut.filter(x=>x.won).length,caut.length)},
  kills:avg(games.reduce((a,g)=>a+g.npcKills,0),games.length),
  perk:{mv:grp(x=>band2(x.st.spd)),dmg:grp(x=>band3(x.st.str)),coin:grp(x=>band2(x.st.lck)),cf:grp(x=>band2(x.st.cha)),int:grp(x=>bi(x.st.int)),
    count:grp(x=>Math.min(3,band2(x.st.spd)+band3(x.st.str)+band2(x.st.lck)+band2(x.st.cha)))}};
console.log(JSON.stringify(S));
})();
