/* v0.63: rail to-do borders (recruit/infirmary/practice, Match Week light purple), training hours (plan, limits, exhibitions, resolve at week end),
   the Training Yard layout (hours plan beside the practice arena), the free-agent list fills its column, lanista home cities = the 12 arenas,
   accessibility (reduce motion, colour-blind palette + token letters, text size), the CPU caption names the mind */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.m=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await new Promise(r=>setTimeout(r,700));newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
  const w=W_(),m=me();const ros=rosterOf(m);const g=ros[0],h=ros[1];g.inj={until:w.week+3,label:'test',pen:2};const until0=g.inj.until;
  MGR.tab='practice';MGR_REDRAW();await new Promise(r=>setTimeout(r,900));
  const cls=k=>(document.querySelector(`.mtabs [data-mg="tab"][data-id="${k}"]`)||{}).className||'';
  const rail={rec:/recpend/.test(cls('recruit')),inf:/infpend/.test(cls('infirm')),tr:/trpend/.test(cls('practice'))};
  const nightCss=getComputedStyle(document.querySelector('.mtabs [data-id="night"]')).backgroundImage;
  const layout=!!document.querySelector('.yardtop .card2 [data-tp="doc|1"]')&&!!document.querySelector('.yardtop #exMine');
  const head=/Training hours 10\/10/.test(document.getElementById('mgrBody').textContent);
  const P=thPlan(w);P.g[g.id]={rehab:2};P.g[h.id]={str:4};P.doc=2;
  const capped=(()=>{const before=JSON.stringify(P.g[h.id]);const btn=document.querySelector(`[data-tp="g|${h.id}|spd|1"]`);MGR_REDRAW();return before})();
  const left=thLeft(w);const sxp0=JSON.stringify((h.sxp||{}));const st0=gStats(h).str;
  const exh=needTHrs(w,EXHIB_HOURS)[0];
  MGR.tab='recruit';MGR_REDRAW();await new Promise(r=>setTimeout(r,1000));const rt=document.getElementById('recTable');const g2=rt.closest('.mgrid');const col=[...g2.children].find(c=>!c.contains(rt));
  const fa=rt.clientHeight>=Math.round(innerHeight*0.62)&&Math.abs(rt.getBoundingClientRect().bottom-col.getBoundingClientRect().bottom)<4;MGR.tab='practice';MGR_REDRAW();
  const wk=w.week;for(const b2 of w.night.bouts)b2.done=true;w.pend=[];await endWeek();
  return {rail,nightCss,layout,head,left,exh,fa,rehab:g.inj?g.inj.until:null,until0,grew:JSON.stringify(h.sxp||{})!==sxp0||gStats(h).str>st0,newWeek:W_().week===wk+1,fresh:thLeft(W_())===thMax(),yard:(me().fac||{}).yard||0,
    cities:LANISTA_CITIES().length,citiesOk:LANISTA_CITIES().every(c=>LOCATIONS.slice(1).some(L=>L.n===c))}});
ok(o.m.rail.rec&&o.m.rail.inf&&o.m.rail.tr,'rail borders');ok(o.m.nightCss==='none','match week no fill');ok(o.m.layout&&o.m.head,'yard layout + header');
ok(o.m.left===2&&o.m.exh===true,'hours accounting');ok(o.m.fa===true,'free-agent list fills the column');ok(o.m.rehab===null||o.m.rehab===o.m.until0-1,'rehab');ok(o.m.grew,'drill growth');
ok(o.m.newWeek&&o.m.fresh&&o.m.yard===0,'week rollover');ok(o.m.cities===12&&o.m.citiesOk,'lanista cities');
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await pg.waitForTimeout(600);
await pg.evaluate(()=>openSettings('general'));await pg.waitForTimeout(700);
await pg.click('[data-set="cvd"]');await pg.click('[data-set="calm"]');await pg.click('[data-tscale="115"]');await pg.waitForTimeout(300);
o.a=await pg.evaluate(async()=>{const r={body:document.body.className,col:CLASSES.soldier.color,rm:reduceMotion(),anim:animOn(),saved:JSON.parse(localStorage.getItem('flavius_settings')).tscale};
  if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r2=>setTimeout(r2,400));menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore'},{cls:'hero',cpu:true,diff:'master'},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  await new Promise(r2=>setTimeout(r2,1500));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r3=>setTimeout(r3,100))}
  r.statsUp=!!document.querySelector('#board .pb-head>.statrow')&&!document.querySelector('#board>.statrow');r.mind=/CPU (Novice|Apprentice|Fighter|Veteran|Master)/.test(document.getElementById('roster').textContent);
  {const f=document.querySelector('#board .ratfold');f.click();await new Promise(r2=>setTimeout(r2,100));const sr=document.querySelector('#board .statrow');r.fold=sr.classList.contains('shut')&&[...sr.children].filter(c=>getComputedStyle(c).display!=='none').length===1;render();await new Promise(r2=>setTimeout(r2,100));r.foldKept=document.querySelector('#board .statrow').classList.contains('shut');document.querySelector('#board .ratfold').click()}
  r.anim2=animOn();SETTINGS.cvd=false;applySettings();r.col2=CLASSES.soldier.color;return r});
ok(/cvd/.test(o.a.body)&&/calm/.test(o.a.body)&&/ts115/.test(o.a.body),'a11y classes');ok(o.a.col==='#D55E00'&&o.a.col2==='#c0433a','cvd palette');ok(o.a.rm&&!o.a.anim2&&o.a.saved===115,'reduce motion + saved');ok(o.a.statsUp,'ratings in panel header');ok(o.a.fold&&o.a.foldKept,'ratings fold');ok(o.a.mind,'roster names the mind');
await pg.evaluate(()=>{S&&(S.over=true);openStudio('events')});await pg.waitForTimeout(1200);
await pg.evaluate(()=>{const b=document.querySelector('[data-st="new"]');b&&b.click()});await pg.waitForTimeout(800);
o.ed=[];for(let i=0;i<6;i++){o.ed.push(await pg.evaluate(()=>{const p=document.getElementById('edPane');const vis=[...p.children].filter(c=>getComputedStyle(c).display!=='none');
  return {step:(document.querySelector('.edsteps .cur')||{}).textContent,sub:ST.sub,vis:vis.length,all:p.children.length,name:!!vis.find(c=>c.querySelector&&c.querySelector('[data-f="name"]')),trophy:!!vis.find(c=>c.querySelector&&c.querySelector('[data-f="trophy"]'))}}));
  await pg.evaluate(()=>{const n=document.querySelector('[data-edgo="1"]');n&&n.click()});await pg.waitForTimeout(400)}
ok(o.ed[0].step==='1 Basics'&&o.ed[0].name&&!o.ed[0].trophy&&o.ed[1].sub==='board'&&o.ed[4].sub==='roster'&&o.ed[5].trophy&&!o.ed[5].name&&o.ed[2].vis<o.ed[2].all,'designer steps');
o.edAll=await pg.evaluate(async()=>{document.querySelector('[data-edall]').click();await new Promise(r=>setTimeout(r,400));const p=document.getElementById('edPane');const r={all:[...p.children].every(c=>getComputedStyle(c).display!=='none'),tabs:getComputedStyle([...document.querySelectorAll('.seg[role="tablist"]')].find(s=>s.querySelector('[data-st="sub"]'))).display!=='none'};
  document.querySelector('[data-edall]').click();await new Promise(r2=>setTimeout(r2,300));return r});
ok(o.edAll.all&&o.edAll.tabs,'all sections');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
