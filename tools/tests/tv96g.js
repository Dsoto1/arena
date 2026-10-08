/* v0.96 grow (245-v96grow): each contracted fighter-week has a 10% chance of +0.2 to ONE of Speed/Strength/Intelligence/Charisma (beside the +0.2 Luck),
   deterministic from (world id, fighter id, absolute week); every house; shows in "From your Doctores"; no new entries in the error log. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const mark=await pg.evaluate(()=>ERR92.n);
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();const o={};
  const cg=w.glads.filter(g=>g.alive&&g.contract);o.houses=new Set(cg.map(g=>g.contract.mgr)).size;
  let n=0,hit=0;const by={};for(let wk=1;wk<=60;wk++)for(const g of cg){n++;const k=grow96Roll(w,g,wk);if(k){hit++;by[k]=(by[k]||0)+1}}
  o.rate=hit/n;o.by=by;o.noLck=!by.lck;o.det=cg.every(g=>[3,17,40].every(wk=>grow96Roll(w,g,wk)===grow96Roll(w,g,wk)));
  o.diffWorld=cg.some(g=>[...Array(30).keys()].some(wk=>grow96Roll({id:'zz'},g,wk+1)!==grow96Roll(w,g,wk+1)));
  const mine=rosterOf(m)[0];let wk=1;while(!grow96Roll(w,mine,wk)&&wk<500)wk++;o.wk=wk;const key=grow96Roll(w,mine,wk);o.key=key;
  const before=gStats(mine)[key]+((mine.sxp||{})[key]||0);w.week=wk;w.sgain={};w.sup95={};
  const rivals=cg.filter(g=>g.contract.mgr!==m.id);const rb=rivals.map(g=>[g,gStats(g)[g.id?'spd':'spd']+0]);
  const snap=new Map(rivals.map(g=>[g.id,Object.assign({},gStats(g),{x:JSON.stringify(g.sxp||{})})]));
  weeklyGrowth(w);const after=gStats(mine)[key]+((mine.sxp||{})[key]||0);o.gain=Math.round((after-before)*100)/100;o.sg=w.sgain[mine.id]&&w.sgain[mine.id][key];
  o.lck=w.sgain[mine.id]&&w.sgain[mine.id].lck;
  let moved=0;for(const g of rivals){const k2=grow96Roll(w,g,wk);if(k2){const s=snap.get(g.id);if(JSON.stringify(g.sxp||{})!==s.x||gStats(g)[k2]!==s[k2])moved++}}o.rivalMoved=moved;
  growSnap95(w);const html=growHTML95(w);const ic=(STATS.find(s=>s[0]===key)||[])[2]||'';o.row=html.includes('gr95r')&&html.includes('+0.2')&&html.includes(ic);
  o.rowInSnap=w.growth95.rows.some(r=>r.id===mine.id&&r.d.some(x=>x.k===key&&x.gain>=0.2));
  return o});
ok(r.houses>=2,'rival houses have contracted fighters '+JSON.stringify(r));ok(r.rate>0.08&&r.rate<0.12,'about 10% of fighter-weeks '+r.rate);ok(r.noLck&&Object.keys(r.by).length===4,'only Speed/Strength/Intelligence/Charisma, all four seen '+JSON.stringify(r.by));
ok(r.det&&r.diffWorld,'deterministic per world');ok(r.gain>=0.15,'weeklyGrowth adds the +0.2 '+r.gain);ok(r.sg>=0.2&&r.lck>=0.2,'player sgain has the stat and Luck');ok(r.row&&r.rowInSnap,'shown in From your Doctores with +0.2');
const ne=await pg.evaluate(m=>ERR92.n-m,mark);ok(ne===0,'no new errors in the log '+ne);
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS','ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
