/* v0.99: Rivalry Week — pick which of your fighters you command */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.a=await pg.evaluate(async()=>{openManager();await new Promise(r=>setTimeout(r,600));newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();
  w.week=w.week+(10-wkOf(w.week));makeNight(); /* v1.04: letter week 10, Rivalry Week 11 */MGR.tab='ludus';MGR_REDRAW();const btn=document.querySelector('[data-rivcommit]');if(btn)btn.click();
  w.week++;makeNight();const meId=me().id;const isMine=id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===meId};
  const bi=w.night.bouts.findIndex(b=>b.rivalry&&b.ents.filter(isMine).length>=2);
  if(bi<0)return {err:'no bout'};const bt=w.night.bouts[bi];const mine=bt.ents.filter(isMine);
  for(let i=0;i<bi;i++)await runBoutSim(i);
  watchBout(bi,true);await new Promise(r=>setTimeout(r,300));
  const btns=[...document.querySelectorAll('.pick99bg [data-pick99]')].filter(x=>x.dataset.pick99!=='');
  const shown=btns.length;btns[1].click();
  const t0=Date.now();while(Date.now()-t0<20000&&!(S&&S.players&&S.players.length&&S.phase&&S.phase!=='setup'&&S.mgrCtx))await new Promise(r=>setTimeout(r,100));
  const humans=S.players.filter(p=>!p.cpu).map(p=>p.mgrGid);const cpuMine=S.players.filter(p=>p.cpu&&mine.includes(p.mgrGid)).length;
  return {bi,shown,want:mine[1],humans,cpuMine,gone:!document.querySelector('.pick99bg'),n:mine.length}});
ok(o.a.shown===2&&o.a.humans&&o.a.humans.length===1&&String(o.a.humans[0])===String(o.a.want)&&o.a.cpuMine===1&&o.a.gone,'picker');
/* play to the end: all seats CPU, the sim finishes, both of his fighters' records update */
o.b=await pg.evaluate(async(BI)=>{const w=W_();const bt=w.night.bouts[BI];const ids=bt.ents.map(gById).filter(Boolean);const before=ids.map(g=>(g.wins||0)+(g.losses||0)+(g.bouts||0)+(g.fights||0));
  S.players.forEach(p=>{p.cpu=true});
  simToEnd(true);const t0=Date.now();while(Date.now()-t0<150000&&!(W_().night.bouts[BI].done)){if(CUR_MODAL)CUR_MODAL.done(null);for(const x of document.querySelectorAll('#modal button.primary'))x.click();await new Promise(r=>setTimeout(r,250))}
  return {done:!!W_().night.bouts[BI].done,res:!!W_().night.bouts[BI].res}},o.a.bi);
ok(o.b.done,'bout done');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length)process.exit(1)})();
