/* mgrsim.js — Manager-mode balance study: plays whole seasons headless with a scripted lanista and compares strategies.
   Usage: node tools/mgrsim.js flavius-arena.html [seasons=2] [runs=4] [strategies=base,yard,cheap]
   Strategies (the player house; rival houses play as the game plays them):
     base  — no drills, no training hours; enters its best fighters; heals with the Medicus
     yard  — the same + Brutal drills, every training hour on Speed/Strength, rest weeks above fatigue 60
     cheap — yard + in weeks 1-3 signs every free agent asking ≤ 12 with potential ≥ 60 (up to 12 fighters)
   Reports per strategy: wins, league rank among the 12 houses (by wins), roster rating (avg effOvr) vs the rival average,
   rating gained over the run, treasury, fighters lost, injuries, rival houses' average treasury, league deaths (v0.94) and, with the Manager
   Armory (225-v94armory), arm94Stats: pieces owned / damaged / lost / bought / coin spent on gear. Prints JSON lines + a table. */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const page=path.resolve(process.argv[2]);const SEASONS=+(process.argv[3]||2),RUNS=+(process.argv[4]||4);const STRATS=(process.argv[5]||'base,yard,cheap').split(',');
const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_lfpool','0')});
await pg.goto('file://'+page);await pg.waitForTimeout(2000);
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await new Promise(r=>setTimeout(r,800));
  /* the sim never waits on windows or animations */
  window.modal=async(t,b,btns)=>{const p=(btns||[]).find(x=>x.primary)||(btns||[])[0];return p?p.value:null};window.mToast=()=>{};window.say=()=>{};SPEED='snap'});
const rows=[];
for(const strat of STRATS)for(let run=0;run<RUNS;run++){
  const r=await pg.evaluate(async({strat,run,SEASONS})=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));
    newWorld({type:'pre',key:MGR_PRE[run%MGR_PRE.length].key});MGR.view=null;const w=W_(),m=me();
    const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;const rivals=()=>w.mgrs.filter(x=>!x.isPlayer&&!x.dead);
    const start={mine:avg(rosterOf(m).map(effOvr)),riv:avg(rivals().flatMap(x=>rosterOf(x).map(effOvr)))};let injuries=0,lost=0,c6=null,c12=null,c24=null,minCoin=1e9,collapsed=0;const n0=rosterOf(m).length;
    const weeks=SEASONS*12;
    for(let k=0;k<weeks;k++){
      const yard=strat!=='base';const ros=()=>rosterOf(m);
      /* signings */
      if(strat==='cheap'&&wkOf(w.week)<=3){for(const g of freeAgents().filter(g=>askWage(g)<=12&&(g.pot||effOvr(g))>=60).sort((a,b)=>(b.pot||0)-(a.pot||0))){if(ros().length>=12)break;
        if(m.coin<askWage(g)*4)break;for(const x of [1,1.25,1.5]){const wage=Math.ceil(askWage(g)*x);if(offerVerdict(g,wage,12,0,false).ok){signGlad(g,wage,12,0,false);break}}}}
      /* every lanista keeps at least 4 fighters: replace the fallen with the best free agent they can afford (8 weeks of wages) */
      while(ros().length<4){const g=freeAgents().filter(g=>!g.inj&&askWage(g)*8<=m.coin).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(!g)break;let done=false;
        for(const x of [1,1.25,1.5]){const wage=Math.ceil(askWage(g)*x);if(offerVerdict(g,wage,12,0,false).ok){signGlad(g,wage,12,0,false);done=true;break}}if(!done){g.favd=false;g.interest[m.id]=0;break}}
      /* renewals: the game's own extend rule (morale 35+, interest 25+), at the current ask */
      for(const g of ros())if(g.morale<45&&m.coin>25){m.coin-=5;g.morale=Math.min(100,g.morale+8)} /* an attentive lanista: a feast for the low-spirited (same for every strategy) */
      for(const g of ros())if(g.contract&&g.contract.weeks<=2&&g.morale>=35){g.contract.weeks=Math.max(0,g.contract.weeks)+8;g.contract.wage=Math.max(g.contract.wage,askWage(g));g.contract.expired=0}
      /* care */
      for(const g of ros())if(g.inj&&!g.inj.war){const req=injReq(g.inj);if(req==='surgeon'&&m.coin>=SURGEON+20){m.coin-=SURGEON;delete g.inj}else if(req!=='surgeon'&&m.coin>=MEDICUS+20){m.coin-=MEDICUS;delete g.inj}}
      /* v0.94 the Armory: an attentive lanista keeps his fighters armed (repairs, empty hands, missing class pieces) — the rivals' own shopping rule */
      if(typeof arm94AutoShop==='function')arm94AutoShop(w,m,{player:true});
      /* the yard */
      w.train=yard&&m.coin>60?'hard':yard?'std':'off';
      if(yard){const P=thPlan(w);let left=thLeft(w);for(const g of ros().filter(g=>!g.inj).sort((a,b)=>(gFat(a))-(gFat(b)))){if(gFat(g)>60){g.restWk=w.week;continue}
          for(const k2 of ['str','spd']){const h=Math.min(2,left);if(h<=0)break;P.g[g.id]=P.g[g.id]||{};P.g[g.id][k2]=(P.g[g.id][k2]||0)+h;left-=h}}}
      /* entries: my best fit fighter into each bout it fits */
      const used=new Set();for(const bo of w.night.bouts){if(bo.done)continue;const T=TIERS[bo.tier];
        const g=ros().filter(g=>!g.inj&&g.morale>15&&!used.has(g.id)&&!bo.ents.includes(g.id)&&effOvr(g)>=T.lo-4&&effOvr(g)<=T.hi+2).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(!g)continue;
        const out=bo.ents.map(gById).filter(x=>x&&!x.contract).sort((x,y)=>effOvr(x)-effOvr(y))[0];if(!out)continue;bo.ents[bo.ents.indexOf(out.id)]=g.id;used.add(g.id)}
      if(w.special&&!w.special.done&&typeof specAutoRun==='function'){try{await specAutoRun()}catch(e){}}
      const inj0=ros().filter(g=>g.inj).length;
      for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done){try{await runBoutSim(i)}catch(e){}}
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];const g=gById(P.gid);try{if(P.t==='thumb')settlePending(0,null,{d6:1+Math.floor(Math.random()*6),d12:1+Math.floor(Math.random()*12)});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
      const alive0=ros().length;let ok=true;try{ok=await endWeek()}catch(e){ok=false}if(ok===false)break;
      injuries+=Math.max(0,ros().filter(g=>g.inj).length-inj0);lost+=Math.max(0,alive0-ros().length);
      const wk=k+1;if(wk===6)c6=m.coin;if(wk===12)c12=m.coin;if(wk===24)c24=m.coin;minCoin=Math.min(minCoin,m.coin);
      if(m.dead||w.dead||(!ros().length&&m.coin<0)){collapsed=wk;break}}
    const table=w.mgrs.filter(x=>!x.dead).map(x=>({p:x.isPlayer,wins:x.wins||0})).sort((a,b)=>b.wins-a.wins);
    return {strat,run,wins:m.wins||0,rank:table.findIndex(x=>x.p)+1,wage:rosterOf(m).reduce((a,g)=>a+(g.contract?g.contract.wage:0),0),houses:table.length,mine:+avg(rosterOf(m).map(effOvr)).toFixed(1),riv:+avg(rivals().flatMap(x=>rosterOf(x).map(effOvr))).toFixed(1),
      gain:+(avg(rosterOf(m).map(effOvr))-start.mine).toFixed(1),rivGain:+(avg(rivals().flatMap(x=>rosterOf(x).map(effOvr)))-start.riv).toFixed(1),coin:m.coin,c6,c12,c24,minCoin,collapsed,fighters:rosterOf(m).length,n0,injuries,lost,weeks:w.week,rivCoin:Math.round(avg(rivals().map(x=>x.coin))),deaths:w.glads.filter(g=>!g.alive&&!g.retired&&g.debut).length,gear:typeof arm94Stats==='function'?arm94Stats(w):null}},{strat,run,SEASONS});
  rows.push(r);process.stderr.write(JSON.stringify(r)+'\n')}
const by={};for(const r of rows)(by[r.strat]=by[r.strat]||[]).push(r);const A=(a,k)=>(a.reduce((s,x)=>s+x[k],0)/a.length).toFixed(1);
console.log('strategy   wins  rank/12  myOvr  rivOvr  myGain  rivGain  coin  roster  injuries  lost  coin@6  coin@12  coin@24  lowest  collapsed  rivCoin  deaths');
for(const [s,a] of Object.entries(by))console.log(`${s.padEnd(9)} ${A(a,'wins').padStart(5)} ${A(a,'rank').padStart(7)} ${A(a,'mine').padStart(6)} ${A(a,'riv').padStart(7)} ${A(a,'gain').padStart(7)} ${A(a,'rivGain').padStart(8)} ${A(a,'coin').padStart(5)} ${A(a,'fighters').padStart(7)} ${A(a,'injuries').padStart(9)} ${A(a,'lost').padStart(5)} ${A(a.filter(x=>x.c6!=null),'c6').padStart(7)} ${A(a.filter(x=>x.c12!=null),'c12').padStart(8)} ${A(a.filter(x=>x.c24!=null),'c24').padStart(8)} ${A(a,'minCoin').padStart(7)} ${a.filter(x=>x.collapsed).length}/${a.length}  ${A(a,'rivCoin').padStart(7)} ${A(a,'deaths').padStart(7)}`);
for(const r of rows)if(r.gear)console.log('gear',r.strat,r.run,JSON.stringify(r.gear));
if(errs.length)console.log('page errors:',errs.slice(0,3));await b.close()})();
