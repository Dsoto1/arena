/* mgrsim.js — Manager-mode balance study: plays whole seasons headless with a scripted lanista and compares strategies.
   Usage: node tools/mgrsim.js flavius-arena.html [seasons=2] [runs=4] [strategies=base,yard,cheap] [gear=on|off|old|rkN (repair 1/N)]  (off = ARM94.disabled, bouts use the class kits)
   Strategies (the player house; rival houses play as the game plays them):
     base  — no drills, no training hours; enters its best fighters; heals with the Medicus
     yard  — the same + Brutal drills, every training hour on Speed/Strength, rest weeks above fatigue 60
     cheap — yard + in weeks 1-3 signs every free agent asking ≤ 12 with potential ≥ 60 (up to 12 fighters)
   Reports per strategy: wins, league rank among the 12 houses (by wins), roster rating (avg effOvr) vs the rival average,
   rating gained over the run, treasury, fighters lost, injuries, rival houses' average treasury, league deaths (v0.94) and, with the Manager
   Armory (225-v94armory), arm94Stats: pieces owned / damaged / lost / bought / coin spent on gear. Prints JSON lines + a table. */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const page=path.resolve(process.argv[2]);const SEASONS=+(process.argv[3]||2),RUNS=+(process.argv[4]||4);const STRATS=(process.argv[5]||'base,yard,cheap').split(',');const GEARM=process.argv[6]||'on';const GEAR=GEARM==='off';
const b=await chromium.launch();const pg=await b.newPage();if(process.env.ANY100==='off')await pg.addInitScript(()=>localStorage.setItem('flavius_any100off','1'));if(process.env.V104B==='off')await pg.addInitScript(()=>localStorage.setItem('flavius_v104boff','1')); /* v1.04: careers off (before/after) */await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_lfpool','0')});
await pg.goto('file://'+page);await pg.waitForTimeout(2000);
if(process.env.ADV98)await pg.evaluate(o=>{for(const [k,v] of Object.entries(o.ADV98R||{}))ADV98R[k]=v;for(const [k,v] of Object.entries(o.REC98||{}))REC98[k]=v},JSON.parse(process.env.ADV98)); /* tuning study: ADV98='{"ADV98R":{"start":[[55,5],[35,4],[0,3]]}}' */
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await new Promise(r=>setTimeout(r,800));
  /* the sim never waits on windows or animations */
  window.modal=async(t,b,btns)=>{const p=(btns||[]).find(x=>x.primary)||(btns||[])[0];return p?p.value:null};window.mToast=()=>{};window.say=()=>{};SPEED='snap'});
const rows=[];
for(const strat of STRATS)for(let run=0;run<RUNS;run++){
  const r=await pg.evaluate(async({strat,run,SEASONS,GEAR,GEARM,ANYM,G102})=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));
    ARM94.disabled=GEAR;if(G102&&typeof GR102!=='undefined')Object.assign(GR102,G102); /* v1.02 tuning: GEAR102='{"start":150}' */
    const LN={earn:0,ent:0,fee:0,feeN:0,feeMax:0,good:0};if(/^rk\d+$/.test(GEARM))ARM94.repK=1/+GEARM.slice(2);if(GEARM==='old'){ARM94.repK=1/3;ARM94.sellK=0.4;ARM94.sellMax=999;ARM94.mkHome=true}newWorld({type:'pre',key:MGR_PRE[run%MGR_PRE.length].key});MGR.view=null;const w=W_(),m=me();
    const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;const rivals=()=>w.mgrs.filter(x=>!x.isPlayer&&!x.dead);
    const start={mine:avg(rosterOf(m).map(effOvr)),riv:avg(rivals().flatMap(x=>rosterOf(x).map(effOvr)))};const CR={s:w.season,n:0,rows:[]};let injWk=0,rivInjWk=0,nCard=0,bare=0,miss=0,sev=0,injuries=0,lost=0,c6=null,c12=null,c24=null,minCoin=1e9,collapsed=0;const n0=rosterOf(m).length;
    const weeks=SEASONS*12;
    for(let k=0;k<weeks;k++){
      const yard=strat!=='base';const ros=()=>rosterOf(m);
      /* signings */
      if(strat==='cheap'&&wkOf(w.week)<=3){for(const g of freeAgents().filter(g=>askWage(g)<=12&&(g.pot||effOvr(g))>=60).sort((a,b)=>(b.pot||0)-(a.pot||0))){if(ros().length>=12)break;
        if(m.coin<askWage(g)*4)break;for(const x of [1,1.25,1.5]){const wage=Math.ceil(askWage(g)*x);if(offerVerdict(g,wage,12,0,false).ok){signGlad(g,wage,12,0,false);break}}}}
      /* every lanista keeps at least 4 fighters: replace the fallen with the best free agent they can afford (8 weeks of wages) */
      while(ros().length<4){const g=freeAgents().filter(g=>!g.inj&&askWage(g)*8<=m.coin).sort((a,b)=>estOvr(b).v-estOvr(a).v) /* v0.98: the recruiter's estimate, not the hidden truth */[0];if(!g)break;let done=false;
        for(const x of [1,1.25,1.5]){const wage=Math.ceil(askWage(g)*x);if(offerVerdict(g,wage,12,0,false).ok){signGlad(g,wage,12,0,false);done=true;break}}if(!done){g.favd=false;g.interest[m.id]=0;break}}
      /* renewals: the game's own extend rule (morale 35+, interest 25+), at the current ask */
      for(const g of ros())if(g.morale<45&&m.coin>25){m.coin-=5;g.morale=Math.min(100,g.morale+8)} /* an attentive lanista: a feast for the low-spirited (same for every strategy) */
      for(const g of ros())if(g.contract&&g.contract.weeks<=2&&g.morale>=35){g.contract.weeks=Math.max(0,g.contract.weeks)+8;g.contract.wage=Math.max(g.contract.wage,askWage(g));g.contract.expired=0}
      /* care */
      for(const g of ros())if(g.inj&&!g.inj.war){const req=injReq(g.inj);
        if(typeof care101Do==='function'&&typeof V101B!=='undefined'&&V101B.on){if(m.coin>=(req==='surgeon'?SURGEON:MEDICUS)/2+20)care101Do(g,req==='surgeon'?'surgeon':'medic',{auto:1})} /* v1.02: the game's own care rules (Medicus hours, half coin; 341 books the cure to the week's end) */
        else if(req==='surgeon'&&m.coin>=SURGEON+20){m.coin-=SURGEON;delete g.inj}else if(req!=='surgeon'&&m.coin>=MEDICUS+20){m.coin-=MEDICUS;delete g.inj}}
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
      /* v1.0 ENTER ANY EVENT (296-v100any): ANY100=off → no specials (the old week); ANY100=play → the scripted lanista also books every special with
         his best fighter left over (a team special takes a second one of his, else the editor's pick) while the treasury keeps 60 coin above the fee */
      if(ANYM==='play'&&typeof any100Book==='function')w.night.bouts.forEach((bo,bi)=>{if(!any100Sp(bo)||bo.done||bo.ents.some(id=>any100Own(id,m)))return;
        const g=ros().filter(g=>!used.has(g.id)&&g.morale>15&&!any100Cur(w,g.id)&&!any100Why(w,bo,g)).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(!g||m.coin<bo.any100.fee*2+60)return;
        const mate=any100Team(bo)?ros().filter(x=>x.id!==g.id&&!used.has(x.id)&&!any100Cur(w,x.id)&&!any100Why(w,bo,x))[0]:null;
        if(any100Book(bi,g.id,any100Team(bo)?(mate?{k:'mine',gid:mate.id}:{k:'ed'}):null).ok){used.add(g.id);if(mate)used.add(mate.id)}});
      /* gear audit: fighters on the card with an empty hand, and the armor pieces they are missing against the class kit */
      if(typeof arm94Issues==='function'&&!ARM94.disabled){for(const bo of w.night.bouts){if(bo.done)continue;for(const id of bo.ents){const g=gById(id);if(!g||!g.contract||g.contract.mgr!==m.id||!g.eq94)continue;nCard++;if(arm94Issues(g).empty.length)bare++;
        const K=arm94Kit(g.cls);miss+=Math.max(0,K.a.length-g.eq94.a.filter(P=>!P.dmg).length)}}}
      if(w.special&&!w.special.done&&typeof specAutoRun==='function'){try{await specAutoRun()}catch(e){}}
      const inj0=ros().filter(g=>g.inj).length;
      injWk+=ros().filter(g=>g.inj&&!g.inj.war).length;{const RV=rivals();if(RV.length)rivInjWk+=RV.reduce((t,x)=>t+rosterOf(x).filter(g=>g.inj&&!g.inj.war).length,0)/RV.length} /* v1.02: fighter-weeks hurt at entry time */
      /* v1.02 loans: what the loan market would pay for the house's bench this week (343-v102loans) */
      if(typeof loan102Best==='function'){for(const g of ros().filter(g=>!g.slot95&&!g.inj&&!g.loanFrom)){const B=loan102Best(w,g);if(B){LN.fee+=B.fee;LN.feeN++;LN.feeMax=Math.max(LN.feeMax,B.fee);if(B.good)LN.good++}}}
      for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done){try{await runBoutSim(i)}catch(e){}}
      /* what a starter earns the house fighting (319's b.res.house101: the house's coin from each bout, per fighter of ours entered) */
      for(const bo of w.night.bouts){const mineN=(bo.ents||[]).filter(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id}).length;if(!mineN||!bo.done)continue;LN.ent+=mineN;LN.earn+=Math.max(0,((bo.res||{}).house101||{}).tot||0)}
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];const g=gById(P.gid);try{if(P.t==='thumb')settlePending(0,null,{d6:1+Math.floor(Math.random()*6),d12:1+Math.floor(Math.random()*12)});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
      const alive0=ros().length;let ok=true;try{ok=await endWeek()}catch(e){ok=false}if(ok===false)break;
      injuries+=Math.max(0,ros().filter(g=>g.inj).length-inj0);lost+=Math.max(0,alive0-ros().length);
      if(w.season!==CR.s){const al=w.glads.filter(g=>g.alive);const R=(w.c104rev&&w.c104rev.n!==CR.n?w.c104rev:null);if(R)CR.n=R.n;const ph={rise:0,prime:0,fade:0};if(typeof c104Phase==='function')for(const g of al)ph[c104Phase(g).ph]++;
        CR.rows.push({s:CR.s,alive:al.length,age:+avg(al.map(gAge)).toFixed(1),min:Math.min(...al.map(gAge)),max:Math.max(...al.map(gAge)),over33:al.filter(g=>gAge(g)>=33).length,ret:R?R.ret.length:0,mine:R?R.ret.filter(x=>x.mine).length:0,great:R?R.ret.filter(x=>x.great).length:0,retAge:R&&R.ret.length?+avg(R.ret.map(x=>x.age)).toFixed(1):0,fame:R?R.fame.length:0,ph,myFame:m.fame});CR.s=w.season} /* v1.04 (349): careers per season */
      const wk=k+1;if(wk===6)c6=m.coin;if(wk===12)c12=m.coin;if(wk===24)c24=m.coin;minCoin=Math.min(minCoin,m.coin);
      if(m.dead||w.dead||(!ros().length&&m.coin<0)){collapsed=wk;break}}
    const table=w.mgrs.filter(x=>!x.dead).map(x=>({p:x.isPlayer,wins:x.wins||0})).sort((a,b)=>b.wins-a.wins);
    return {careers:CR.rows,strat,run,injWk,rivInjWk:+rivInjWk.toFixed(1),rivWins:+avg(rivals().map(x=>x.wins||0)).toFixed(1),wins:m.wins||0,rank:table.findIndex(x=>x.p)+1,wage:rosterOf(m).reduce((a,g)=>a+(g.contract?g.contract.wage:0),0),houses:table.length,mine:+avg(rosterOf(m).map(effOvr)).toFixed(1),riv:+avg(rivals().flatMap(x=>rosterOf(x).map(effOvr))).toFixed(1),
      gain:+(avg(rosterOf(m).map(effOvr))-start.mine).toFixed(1),rivGain:+(avg(rivals().flatMap(x=>rosterOf(x).map(effOvr)))-start.riv).toFixed(1),coin:m.coin,c6,c12,c24,minCoin,collapsed,fighters:rosterOf(m).length,n0,injuries,lost,weeks:w.week,rivLv:typeof advLvM==="function"?+avg(rivals().map(x=>advLvM(x,"recruiter"))).toFixed(2):0,rivCoin:Math.round(avg(rivals().map(x=>x.coin))),deaths:w.glads.filter(g=>!g.alive&&!g.retired&&g.debut).length,nCard,bare,miss,sev:rosterOf(m).reduce((a,g)=>a+(g.severed||[]).length,0),gear:typeof arm94Stats==='function'?arm94Stats(w):null,rivMin:Math.min(...rivals().map(x=>x.coin)),rivBroke:rivals().filter(x=>x.coin<30).length,shelf:avg(w.mgrs.filter(x=>!x.dead).map(x=>(x.arm94?x.arm94.sh.length:0))),loan:{earnPerBout:LN.ent?+(LN.earn/LN.ent).toFixed(1):0,fee:LN.feeN?+(LN.fee/LN.feeN).toFixed(1):0,feeMax:LN.feeMax,good:LN.good,benchWeeks:LN.feeN}}},{strat,run,SEASONS,GEAR,GEARM,ANYM:process.env.ANY100||'',G102:process.env.GEAR102?JSON.parse(process.env.GEAR102):null});
  rows.push(r);process.stderr.write(JSON.stringify(r)+'\n')}
const by={};for(const r of rows)(by[r.strat]=by[r.strat]||[]).push(r);const A=(a,k)=>(a.reduce((s,x)=>s+x[k],0)/a.length).toFixed(1);
console.log('strategy   wins  rank/12  myOvr  rivOvr  myGain  rivGain  coin  roster  injuries  lost  coin@6  coin@12  coin@24  lowest  collapsed  rivCoin  deaths');
for(const [s,a] of Object.entries(by))console.log(`${s.padEnd(9)} ${A(a,'wins').padStart(5)} ${A(a,'rank').padStart(7)} ${A(a,'mine').padStart(6)} ${A(a,'riv').padStart(7)} ${A(a,'gain').padStart(7)} ${A(a,'rivGain').padStart(8)} ${A(a,'coin').padStart(5)} ${A(a,'fighters').padStart(7)} ${A(a,'injuries').padStart(9)} ${A(a,'lost').padStart(5)} ${A(a.filter(x=>x.c6!=null),'c6').padStart(7)} ${A(a.filter(x=>x.c12!=null),'c12').padStart(8)} ${A(a.filter(x=>x.c24!=null),'c24').padStart(8)} ${A(a,'minCoin').padStart(7)} ${a.filter(x=>x.collapsed).length}/${a.length}  ${A(a,'rivCoin').padStart(7)} ${A(a,'deaths').padStart(7)}`);
for(const r of rows)if(r.gear)console.log('gear',r.strat,r.run,JSON.stringify(r.gear));
/* v0.94 gear flows: per strategy, player (p) and rivals (r, per house per run), averaged over the runs */
{const keys=['rep','repN','buy','buyN','loot','lootN','skip','skipN','sell','sellN','lost','lostN'];console.log('audit (avg per run): fighters on card '+A(by[Object.keys(by)[0]],'nCard')+' · bare-handed '+A(by[Object.keys(by)[0]],'bare')+' · armor pieces missing '+A(by[Object.keys(by)[0]],'miss')+' · severed limbs at end '+A(by[Object.keys(by)[0]],'sev'));console.log('flows (avg per run; r = all rivals together)   side '+keys.join(' ')+'  wins deaths treasury rivMin rivBroke shelf');
 for(const [s2,a] of Object.entries(by)){for(const side of ['p','r']){const f=k=>(a.reduce((t,x)=>t+(((x.gear&&x.gear.fl&&x.gear.fl[side])||{})[k]||0),0)/a.length).toFixed(0);
   console.log(`${s2.padEnd(9)} ${side} ${keys.map(f).join(' ')}  ${A(a,'wins')} ${A(a,'deaths')} ${A(a,'coin')} ${A(a,'rivMin')} ${A(a,'rivBroke')} ${A(a,'shelf')}`)}}}
for(const [s2,a] of Object.entries(by))console.log(`${s2} rival avg Recruiter level ${A(a,'rivLv')}`);
for(const [s2,a] of Object.entries(by))console.log(`${s2} injury weeks (fighter-weeks hurt at entry): player ${A(a,'injWk')} · per rival house ${A(a,'rivInjWk')} · rival wins/house ${A(a,'rivWins')}`); /* v1.02 (341) */
for(const [s2,a] of Object.entries(by)){const L=a.map(x=>x.loan).filter(x=>x&&x.benchWeeks);if(L.length)console.log(`${s2} loans: a starter earns ${(a.reduce((t,x)=>t+((x.loan||{}).earnPerBout||0),0)/a.length).toFixed(1)} coin a bout for the house · a bench fighter's best loan fee ${(L.reduce((t,x)=>t+x.fee,0)/L.length).toFixed(1)}/wk (max ${Math.max(...L.map(x=>x.feeMax))}) · good-market bench weeks ${(L.reduce((t,x)=>t+x.good,0)/L.length).toFixed(1)} of ${(L.reduce((t,x)=>t+x.benchWeeks,0)/L.length).toFixed(1)}`)}
for(const r of rows)for(const c of r.careers||[])console.log(`careers ${r.strat} run ${r.run} season ${c.s}: ${c.alive} alive · age avg ${c.age} (${c.min}-${c.max}) · 33+ ${c.over33} · retired ${c.ret} (yours ${c.mine}, greats ${c.great}, avg age ${c.retAge}) · houses drifting ${c.fame} · rising/prime/fading ${c.ph.rise}/${c.ph.prime}/${c.ph.fade} · your fame ${c.myFame}`); /* v1.04 (349) */
if(errs.length)console.log('page errors:',errs.slice(0,3));await b.close()})();
