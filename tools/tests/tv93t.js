/* tv93t — v0.93 Manager lesson end to end (36-mtutor): every step's lit spot exists and is visible, the coach is on screen,
   the Armory look (v0.94), the Training Yard steps (card, + session under the weekly cap, 🔒 Lock in, the Doctore's drill, his panel, Trials of the Yard)
   are taught and done for real, the guard rails still block a stray click, and the lesson finishes with nothing saved.
   SHOTS=dir writes a screenshot per step. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1500,height:980}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const SH=process.env.SHOTS;
const careers0=await pg.evaluate(async()=>(await Store.list('mgrCareers')).length);
await pg.click('[data-mm82="tut"]');await pg.waitForTimeout(200);await pg.click('[data-mm="learnmgr"]');
await pg.waitForFunction(()=>MTUT.on&&document.getElementById('mtutCoach'),null,{timeout:15000});
const until=async(fn,arg,ms=20000)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:150});return true}catch(e){return false}};
const K=()=>pg.evaluate(()=>MTUT.on?(MTUT_STEPS[MTUT.step]||{}).k||'?':null);
const clk=async sel=>{const ok=await pg.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return false;e.click();return true},sel);return ok};
const next=()=>clk('[data-mt="next"]');
const fails=[];const seen=[];let guard=null,yard=null,lastK=null,same=0;
for(let iter=0;iter<200;iter++){
  await pg.waitForTimeout(450);
  const k=await K();if(k===null)break;
  if(k===lastK){if(++same>14){fails.push('stuck at '+k);if(SH)await pg.screenshot({path:SH+'/stuck.png'});break}}else{same=0;lastK=k;
    /* the step's spot must exist and be visible (arena steps: once the window is down); the coach must show its text */
    await pg.waitForTimeout(350);
    const info=await pg.evaluate(()=>{const st=MTUT_STEPS[MTUT.step];const el=mtEl(st.spot);const r=el&&el.getBoundingClientRect();const c=document.getElementById('mtutCoach');
      return {spot:!!el,vis:!!(r&&r.width>0&&r.height>0),coach:!!(c&&c.textContent.length>20),arena:!!st.arena}});
    seen.push(k);if(SH)await pg.screenshot({path:`${SH}/${String(seen.length).padStart(2,'0')}_${k}.png`});
    if(!info.coach)fails.push('no coach at '+k);
    if(!info.arena&&!['enter0','enter2','watch','verdict','verdict2','acta'].includes(k)&&!(info.spot&&info.vis))fails.push('spot missing at '+k+' '+JSON.stringify(info));}
  switch(k){
   case 'welcome':case 'tabs':case 'morale':case 'armory':case 'interest':case 'bouts':case 'city':case 'results':case 'impinfo':case 'schedinfo':case 'ycard':case 'ydoc':case 'ytrials':await next();break;
   case 'roster':guard=await pg.evaluate(()=>{document.querySelector('[data-mg="tab"][data-id="recruit"]').click();return MGR.tab});await clk('[data-mg="tab"][data-id="roster"]');break;
   case 'lsel':await pg.evaluate(()=>document.querySelector(`tr[data-mg="lsel"][data-id="${MTUT.B}"], .rm100list [data-mg="lsel"][data-id="${MTUT.B}"]`).click() /* v1.0: 298's list row */);break;
   case 'meal':await pg.evaluate(()=>document.querySelector(`[data-mg="meal"][data-id="${MTUT.B}"]`).click());break;
   case 'recruit':await clk('[data-mg="tab"][data-id="recruit"]');break;
   case 'fa':await pg.evaluate(()=>{const r=[...document.querySelectorAll('#mgrPane tr[data-mg="sel"]')];(r[2]||r[0]).click()});break;
   case 'scout':await clk('#mgrPane [data-rec98a]:not([disabled])');await until(()=>!MGR.busy);break;
   case 'pitch':await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mgrPane [data-rec98p], #mgrPane [data-mg="pitch"]')].find(x=>!x.disabled&&!x.dataset.dis);b&&b.click()});break;
   case 'infirm':await clk('[data-mg="tab"][data-id="infirm"]');break;
   case 'medic':await pg.evaluate(()=>{const b=document.querySelector(`[data-mg="medic"][data-id="${MTUT.A}"]`);b&&b.click()});break;
   case 'ludus':await clk('[data-mg="tab"][data-id="ludus"]');break;
   case 'fac':await pg.evaluate(()=>{const e=mtEl(MTUT_STEPS[MTUT.step].spot);e&&e.click()});break; /* v1.0 (297): the head that holds the Stables, or the old Facilities tile */
   case 'stables':await clk('[data-mg="build"][data-id="stables"]');break;
   case 'school':await clk('[data-mg="run"][data-id="school"]');break;
   case 'perk':await clk('#mgrPane [data-mg="perk"]:not([disabled])');break;
   case 'yard':await clk('[data-mg="tab"][data-id="practice"]');break;
   case 'yplus':{const r=await pg.evaluate(()=>{const b=document.querySelector(`#mgrPane [data-y92c="${MTUT.B}"] [data-y92s$="|1"]:not([disabled])`);if(!b)return null;b.click();return b.dataset.y92s});
     yard={plus:r};break}
   case 'ylock':case 'ydlock':await pg.evaluate(()=>{const b=document.querySelector(`#mgrPane [data-y92lock="${MTUT.B}"]`);b&&b.click()});break;
   case 'ydrill':{await pg.evaluate(()=>{const b=document.querySelector(`#mgrPane [data-y92c="${MTUT.B}"] .y92pb:not([disabled]), #mgrPane .rm100drills [data-y92pre^="${MTUT.B}|"]:not([disabled])`) /* v1.0: 298's drill plates */;b&&b.click()});
     yard.after=await pg.evaluate(()=>{const P=thPlan(mtW());const y=P.y92&&P.y92[MTUT.B];return y?{L:y92Sum(y.L),Q:y92Sum(y.Q),pre:!!y.pre}:null});break}
   case 'night':await clk('[data-mg="tab"][data-id="night"]');break;
   case 'enter0':await pg.evaluate(()=>{const s=document.getElementById('ent0');if(s){s.value=MTUT.A;document.querySelector('[data-mg="enter"][data-id="0"]').click()}});break;
   case 'watch':await clk('[data-mg="watch"][data-id="0"]');await until(()=>S&&S.mgrCtx&&!S.over);break;
   case 'sim':{await pg.evaluate(()=>{const m=document.getElementById('modal');if(!m.hidden&&!/Sim to end/.test(document.getElementById('mTitle').textContent)){const b=document.querySelector('#mBtns button');b&&b.click()}});await pg.waitForTimeout(300);
     await pg.evaluate(()=>{const b=document.getElementById('btnSimEnd');b&&b.click()});
     if(await until(()=>!document.getElementById('modal').hidden&&/Sim to end/.test(document.getElementById('mTitle').textContent),null,4000))await pg.evaluate(()=>document.querySelector('#mBtns button.primary').click());
     await until(()=>S&&S.over,null,60000);break}
   case 'ret':await until(()=>[...document.querySelectorAll('#mBtns button')].some(b=>/Return to Match Week/.test(b.dataset.en84||b.textContent)),null,20000);
     await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(b=>/Return to Match Week/.test(b.dataset.en84||b.textContent));b&&b.click()});break;
   case 'verdict':case 'verdict2':{await pg.evaluate(()=>{const b=document.querySelector('#pendbox [data-mg="pthumb"],#pendbox [data-mg="pblood"],#pendbox [data-mg="prudis"]');b&&b.click()});
     /* the thumb's ritual has its own roll button inside the verdict box */
     for(let j=0;j<30;j++){await pg.waitForTimeout(500);const left=await pg.evaluate(()=>{if(!(mtW().pend||[]).length&&!MGR.busy)return 0;
       const b=[...document.querySelectorAll('#pendbox button')].find(x=>!x.disabled&&!x.dataset.mg&&x.offsetParent);if(b)b.click();
       const m=document.getElementById('modal');if(!m.hidden&&!document.getElementById('mgrBody')){const c=document.querySelector('#mBtns button');c&&c.click()}return 1});if(!left)break}
     break}
   case 'stake':await clk('#mgrPane [data-stk="1|5"]');break;
   case 'bet':await pg.evaluate(()=>{const e=mtBetPick();e&&e.click()});break;
   case 'sim1':await clk('[data-mg="sim"][data-id="1"]');await until(()=>!MGR.busy&&mtBout(1)&&mtBout(1).done);break;
   case 'enter2':await pg.evaluate(()=>{const s=document.getElementById('ent2');if(!s)return;s.value=MTUT.B;document.querySelector('[data-mg="enter"][data-id="2"]').click()});break;
   case 'simall':await clk('[data-mg="simall"]');await until(()=>!MGR.busy&&mtW().night.bouts.every(b=>b.done),null,30000);break;
   case 'league':await clk('[data-mg="tab"][data-id="league"]');break;
   case 'rival':{const id=await pg.evaluate(()=>mtRivalId());const has=await pg.evaluate(id=>!!document.querySelector(`#mgrPane [data-lg90box="${id}"] [data-mg="team"]`),id);
      if(!has){await pg.evaluate(id=>{const row=document.querySelector(`#mgrPane [data-wd100h="${id}"]`);if(row)row.click()},id);await pg.waitForTimeout(350)} /* v1.0: click the house row, then 🏛 Team screen on its card */
      await pg.evaluate(id=>{const box=document.querySelector(`#mgrPane [data-lg90box="${id}"] [data-mg="team"]`);if(box){box.click();return}const e=document.querySelector(`tr[data-mg="team"][data-id="${id}"]`);e&&e.click()},id);break}
   case 'envoy':await pg.evaluate(()=>{const e=document.querySelector(`[data-mg="envoy"][data-id="${mtRivalId()}|gift"]`);e&&e.click()});break;
   case 'imp':await clk('[data-mg="tab"][data-id="imp"]');break;
   case 'sched':await clk('[data-mg="tab"][data-id="sched"]');break;
   case 'endask':await clk('[data-mg="endask"]');break;
   case 'endweek':await clk('[data-mg="endweek"]');await until(()=>mtW()&&mtW().week>MTUT.w0,null,30000);break;
   case 'acta':await pg.waitForTimeout(800);await pg.evaluate(()=>{const b=document.querySelector('[data-mt="finish"]');if(b){b.click();return}const t=document.querySelector('#mgrPane [data-mg="tab"][data-id="ludus"]')||document.querySelector('[data-mg="tab"][data-id="ludus"]');t&&t.click()});await pg.waitForTimeout(1500);break;
   default:await pg.waitForTimeout(400);}
}
await pg.waitForTimeout(800);
const fin=await pg.evaluate(async()=>({on:MTUT.on,title:document.getElementById('mTitle').textContent,world:!!(MGR.world&&MGR.world.tutorial),done:localStorage.getItem('flavius_mtutDone'),careers:(await Store.list('mgrCareers')).length}));
const need=['yard','ycard','yplus','ylock','ydrill','ydoc','ytrials','acta'];for(const k of need)if(!seen.includes(k))fails.push('never reached '+k);
if(guard!=='roster'&&guard!=='ludus')fails.push('guard let a stray tab click through: '+guard);
if(!yard||!yard.plus)fails.push('no + session button');if(!yard||!yard.after||yard.after.L<1||!yard.after.pre)fails.push('yard plan not done '+JSON.stringify(yard));
if(fin.on||fin.world||fin.done!=='1'||!/Tutorial completed/.test(fin.title)||fin.careers!==careers0)fails.push('finish '+JSON.stringify(fin));
console.log('steps',seen.length,seen.join(' '));console.log('yard',JSON.stringify(yard));console.log('fin',JSON.stringify(fin));
console.log(fails.length?'FAIL '+JSON.stringify(fails):'OK lesson walked end to end');
console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();process.exit(fails.length?1:0)})();
