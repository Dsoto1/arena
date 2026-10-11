/* v1.0 (his pick a, 2026-10-11): a free agent's surgeon wound never festers — the city physician closes it on its due week (17-manager endWeek).
   A contracted fighter's untreated surgeon wound still festers. No new entries in the error log. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const mark=await pg.evaluate(()=>ERR92.n);
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();const o={};
  const fa=freeAgents().find(g=>g.alive&&!g.inj);const mine=rosterOf(m)[0];o.have=!!fa&&!!mine;
  const wound=()=>({label:'Deep gash',pen:3,req:'surgeon',until:w.week});
  fa.inj=wound();mine.inj=wound();o.faReq=injReq(fa.inj);
  
  for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);w.pend=[];if(w.special)w.special.done=true;
  fa.inj=wound();mine.inj=wound();o.wk0=w.week;
  try{o.ended=await Promise.race([endWeek(),W8(60000)])}catch(e){o.err=String(e)}o.wk1=w.week;
  await W8(300);while(CUR_MODAL){CUR_MODAL.done(null);await W8(200)}
  o.faHealed=fa.alive&&!fa.inj;o.faHist=JSON.stringify(fa.hist||'').includes('physician');
  o.mineFesters=!!(mine.inj&&mine.inj.neglect>=1);return o});
ok(r.have,'a free agent and a fighter of mine');ok(r.faReq==='surgeon','the wound needs the surgeon');
ok(r.faHealed,'free agent healed at the week end '+JSON.stringify(r));ok(r.faHist,'history line names the city physician');
ok(r.mineFesters,'my contracted fighter still festers without a surgeon '+JSON.stringify(r));
const ne=await pg.evaluate(m=>ERR92.n-m,mark);ok(ne===0,'no new errors in the log '+ne);
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS','ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
