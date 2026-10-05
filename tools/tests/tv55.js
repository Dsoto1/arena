/* v0.55: ratings (Play Now + Manager growth), letters, the syndicate loan and spear, home games, grades, the rail fold, pay-to-join placement */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};
/* Play Now: every seat walks out rated; the printed abilities moved to the ratings */
o.play=await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();SPEED='fast';SPEEDMUL.fast=0;
  startEvent({ev:'democritus',loc:6,seats:[{cls:'slave',cpu:true},{cls:'soldier',cpu:true,diff:'hard'},{cls:'royalty',cpu:true,diff:'easy'},{cls:'hero',cpu:true}],opts:{spect:0}});
  const P=S.players;const rated=P.every(p=>p.st&&STAT_KEYS.every(k=>p.st[k]>=50&&p.st[k]<=99));
  const p=P[0];p.st={spd:96,str:96,int:80,lck:80,cha:76};const c0=p.coin,f0=p.cf;p.mv=3;statTurn(p);
  return {rated,abil:P.map(x=>x.abil),diff:[P[1].diff,P[2].diff],coin:p.coin-c0,cf:p.cf-f0,mv:p.mv,dmg:statDmgB(p),bands:[band3(75),band3(76),band3(87),band3(95),band3(96),band2(95),band2(96)],ab:CLASSES.slave.ab}});
o.npc=await pg.evaluate(()=>({lion:npcRatings('lion'),snake:npcRatings('snake'),zora:npcRatings('zora')}));
await pg.evaluate(()=>{S.over=true});
/* Manager */
o.mgr=await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_();const all=w.glads.filter(g=>g.alive);
  return {rated:all.every(g=>g.stats&&g.st0!=null),n:all.length}});
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(1000);
o.card=await pg.evaluate(()=>{const g=rosterOf(me())[0];MGR.tab='recruit';MGR.rsel=g.id;const h=detailHTML(g);return {ratings:h.includes('ratgrid'),before:h.indexOf('ratgrid')<h.indexOf('Career chronicle')||!h.includes('Career chronicle')}});
o.grow=await pg.evaluate(async()=>{const w=W_();const g=rosterOf(me())[0];const s0={...g.stats};const o0=effOvr(g);
  for(let i=0;i<30;i++)statGain(g,'str',1);const st=g.stats.str;g.stats.spd=99;statGain(g,'spd',5);
  return {str:[s0.str,st],cap:g.stats.spd,ovrUp:effOvr(g)-o0,news:(w.tlog||[]).some(t=>/reaches Strength/.test(t.text))}});
o.bout=await pg.evaluate(async()=>{const w=W_();const b=w.night.bouts[0];const pm=me();const g=rosterOf(pm).find(x=>!x.inj);if(g&&!b.ents.includes(g.id))b.ents[0]=g.id;
  const sx=JSON.stringify(g.sxp);await runBoutSim(0);return {done:b.done,grew:JSON.stringify(g.sxp)!==sx,sg:!!(w.sgain&&w.sgain[g.id])}});
/* letters: the Consilium writes when the region turns sour */
o.letter=await pg.evaluate(()=>{const w=W_();const base=worldImpact;worldImpact=()=>({att:-0.3,mood:-14,list:[{i:'🦠',n:'Plague in the port',city:'Ostia',k:1,att:-0.3,mood:-14}]});
  try{adviseWeek(w)}finally{worldImpact=base}MGR.tab='ludus';MGR_REDRAW();const inLudus=!!document.querySelector('.letter');MGR.tab='news';MGR_REDRAW();const inNews=!!document.querySelector('.letter');
  MGR.tab='night';MGR_REDRAW();const inNight=!!document.querySelector('.letter');return {inLudus,inNews,inNight}});
/* the syndicate: no garnish, a weekly minimum, three short weeks and the spear */
o.loan=await pg.evaluate(()=>{const w=W_(),pm=me();w.loan={amt:100,base:100,name:"Sica's syndicate",kind:'synd',mgr:null,wk:w.week};const c0=pm.coin;
  loanWeek(w,pm);const a1={amt:w.loan.amt,due:w.loan.due,coin:pm.coin-c0};loanWeek(w,pm);loanWeek(w,pm);const warned=(w.letters||[]).some(l=>l.key==='synd-warn');loanWeek(w,pm);
  return {a1,missed:w.loan.missed,warned,spear:!!(w.syndSpear&&!w.syndSpear.done),card:loanCardHTML().includes('minimum')}});
o.spear=await pg.evaluate(async()=>{const w=W_();const bi=w.night.bouts.findIndex(b=>!b.done);if(bi<0)return 'nobout';const b=w.night.bouts[bi];const pm=me();
  const g=rosterOf(pm).find(x=>!x.inj&&!w.night.bouts.some(bb=>bb.ents.includes(x.id)));if(g)b.ents[0]=g.id;
  const cfg=boutCfg(b,false);return {carried:cfg.syndSpear===g.id,done:w.syndSpear.done}});
o.spearRun=await pg.evaluate(async()=>{const seats=[{cls:'soldier',cpu:true,mgrGid:'gx'},{cls:'hero',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}];
  const res=await simEvent({ev:'democritus',loc:6,seats,opts:{spect:0},syndSpear:'gx'});const r=res.rows.find(x=>x.mgrId==='gx')||{};return {alive:r.alive,turns:res.turns,elim:r.elimTurn}});
/* home games, grades, the rail fold, pay-to-join only where it belongs */
o.home=await pg.evaluate(()=>{const w=W_(),pm=me();pm.city=LOCATIONS[w.night.loc].n;MGR.tab='sched';MGR_REDRAW();const sched=document.querySelector('#mgrPane').innerHTML.includes('🏠 Home</b> ·');
  const b=w.night.bouts.find(x=>!x.done)||w.night.bouts[0];const g=rosterOf(pm)[0];b.ents[1]=g.id;const cfg=boutCfg(b,false);return {sched,seat:cfg.seats.some(s=>s.homeHouse===pm.ludus)}});
o.grade=await pg.evaluate(()=>({head:!!document.querySelector('.badges.mhead .grade'),chip:gradeChip('A+').includes('grade A'),col:gradeCol('A')}));
o.rail=await pg.evaluate(async()=>{const h=[...document.querySelectorAll('[data-railg]')].find(x=>/World/.test(x.textContent));if(!h)return 'nohdr';h.click();await new Promise(r=>setTimeout(r,100));const shut=h.parentElement.classList.contains('shut');h.click();return {shut,open:!h.parentElement.classList.contains('shut')}});
o.pj=await pg.evaluate(()=>{const w=W_(),pm=me();const g=freeAgents()[0];w.payJoin={gid:g.id,pay:5,until:w.week+1};MGR.tab='league';MGR_REDRAW();const inLeague=!!document.querySelector('.payjoin');MGR.tab='recruit';MGR_REDRAW();const inRec=!!document.querySelector('.payjoin');w.payJoin=null;return {inLeague,inRec}});
o.week=await pg.evaluate(async()=>{const w=W_();for(const b of w.night.bouts)b.done=true;w.pend=[];const wk=w.week;await endWeek();return {adv:W_().week===wk+1}});
await pg.screenshot({path:'v55.png'});
console.log(JSON.stringify(o));console.log('ERRS',errs.slice(0,4));await b.close()})();
