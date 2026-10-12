/* v1.0 THE FIRST HOUR (308-v100first): a fresh profile gets the guided welcome; the first match starts with the friendly setup
   (Democritus, Soldier vs three Novice CPUs, seed 100); a tip shows at your first turn, once; Got it / No more tips; the resume card on the
   main menu; the first Manager week (Easy start picked, tips on create → desk → Match Week → End the week → Week in review);
   a returning player sees nothing; the kill switch gives the old welcome; phone 390. Shots → tools/plans/first100/ when SHOT is set. */
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const PAGE=path.resolve(process.argv[2]);const SHOT=process.env.SHOT||'';if(SHOT)fs.mkdirSync(SHOT,{recursive:true});
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m)};const errs=[];
const open=async(w,h,init)=>{const ctx=await b.newContext({viewport:{width:w,height:h}});await ctx.addInitScript(i=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});if(i)for(const [k,v] of Object.entries(i))localStorage.setItem(k,v)},init||null);
  const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.goto('file://'+PAGE);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});return pg};
const welcome=pg=>pg.waitForFunction(()=>CUR_MODAL&&/Welcome/.test(document.getElementById('mTitle').textContent),null,{timeout:20000}).then(()=>true,()=>false);
const btnVals=pg=>pg.evaluate(()=>[...document.querySelectorAll('#mBtns button')].map(x=>x.textContent.trim()));
const pick=(pg,v)=>pg.evaluate(v=>CUR_MODAL.done(v),v);
const tip=pg=>pg.evaluate(()=>{const e=document.getElementById('fh100');const st=JSON.parse(localStorage.getItem('flavius_first100')||'null');return {on:!!e,k:FH100.cur&&FH100.cur.k,txt:e?e.textContent:'',seen:st&&st.seen||[],st,r:e?e.getBoundingClientRect().toJSON():null,vw:innerWidth}});
const waitTip=(pg,k,ms)=>pg.waitForFunction(k=>FH100.cur&&FH100.cur.k===k&&document.getElementById('fh100'),k,{timeout:ms||60000}).then(()=>true,()=>false);
const closeBrief=pg=>pg.evaluate(()=>{if(CUR_MODAL&&document.getElementById('modal').classList.contains('bf100'))CUR_MODAL.done(1)});

/* ---- A: fresh profile → the offer → the guided first match ---- */
{const pg=await open(1440,900);ok(await welcome(pg),'A welcome shown');
  const bv=await btnVals(pg);ok(bv.some(t=>/first match/.test(t))&&bv.some(t=>/first ludus/.test(t))&&bv.some(t=>/^Skip/.test(t)),'A three choices '+JSON.stringify(bv));
  ok(await pg.evaluate(()=>!!document.getElementById('frhAll')),'A hint switches kept');
  if(SHOT)await pg.screenshot({path:SHOT+'/welcome_1440.png'});
  await pick(pg,'fh_match');
  await pg.waitForFunction(()=>S&&S.evKey==='democritus'&&S.seed===100&&S.players.length===4,null,{timeout:20000}).catch(()=>{});
  const su=await pg.evaluate(()=>({ev:S.evKey,seed:S.seed,me:S.players.filter(p=>!p.cpu).map(p=>p.cls),cpu:S.players.filter(p=>p.cpu).map(p=>p.tier!=null?AI_TIERS[p.tier].k:p.diff),menu:!document.getElementById('mainMenu').hidden,m:JSON.parse(localStorage.getItem('flavius_first100')).m}));
  ok(su.ev==='democritus'&&su.seed===100&&su.me.join()==='soldier'&&su.cpu.length===3&&su.cpu.every(k=>k==='novice')&&!su.menu&&su.m==='match','A friendly setup '+JSON.stringify(su));
  for(let i=0;i<40&&!(await pg.evaluate(()=>document.getElementById('modal').classList.contains('bf100'))) ;i++)await pg.waitForTimeout(250);
  ok(!(await tip(pg)).on,'A no tip over the briefing');
  await closeBrief(pg);await pg.evaluate(()=>{SPEED='fast'});
  ok(await waitTip(pg,'turn'),'A tip at your first turn');
  const t1=await tip(pg);ok(/Your turn/.test(t1.txt)&&t1.seen.includes('turn'),'A turn tip text '+t1.txt.slice(0,80));
  if(SHOT)await pg.screenshot({path:SHOT+'/match_turn_1440.png'});
  const cov=await pg.evaluate(()=>{const t=document.getElementById('fh100').getBoundingClientRect();return [...document.querySelectorAll('#actions button')].filter(b=>{const r=b.getBoundingClientRect();return r.width&&r.left<t.right&&r.right>t.left&&r.top<t.bottom&&r.bottom>t.top}).map(b=>b.textContent.trim().slice(0,20))});ok(!cov.length,'A tip covers no action button '+JSON.stringify(cov));
  await pg.click('#fh100 [data-fh100="ok"]');await pg.waitForTimeout(300);ok(!(await tip(pg)).on,'A Got it closes');
  /* the Choice, then the Action → the move tip; the turn tip never comes back */
  await pg.evaluate(()=>{const b=document.querySelector('#actions [data-act="coin"]');if(b)b.click()});
  const mv=await pg.waitForFunction(()=>FH100.cur&&['move','attack','beast'].includes(FH100.cur.k),null,{timeout:20000}).then(()=>true,()=>false);ok(mv,'A action tip after the choice');
  const t2=await tip(pg);ok(t2.seen.filter(k=>k==='turn').length===1&&t2.k!=='turn','A turn tip once '+JSON.stringify(t2.seen));
  /* No more tips */
  await pg.click('#fh100 [data-fh100="off"]');await pg.waitForTimeout(1500);const t3=await tip(pg);ok(!t3.on&&t3.st.off===1,'A tips off '+JSON.stringify(t3.st));
  /* tips back on; the match ends → the Fate tip; Got it finishes the guided match */
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('flavius_first100'));s.off=0;localStorage.setItem('flavius_first100',JSON.stringify(s));S.over=true});
  ok(await waitTip(pg,'fate',10000),'A Fate tip at the end');if(SHOT)await pg.screenshot({path:SHOT+'/match_fate_1440.png'});
  await pg.click('#fh100 [data-fh100="ok"]');await pg.waitForTimeout(300);ok(await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('flavius_first100'));return s.mDone===1&&s.m===null}),'A guided match done');
  await pg.evaluate(()=>{S.over=true;menuShow()});await pg.waitForTimeout(400);
  const nx=await pg.evaluate(()=>{const e=document.getElementById('fh100mm');return e?e.textContent:''});ok(/Next/.test(nx)&&/ludus/.test(nx),'A next: the guided ludus offered '+nx);
  await pg.evaluate(()=>menuHide());
  /* resume card on the main menu (as if the match had been left unfinished) */
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('flavius_first100'));s.mDone=0;s.m='match';localStorage.setItem('flavius_first100',JSON.stringify(s));menuShow()});await pg.waitForTimeout(500);
  const mc=await pg.evaluate(()=>{const e=document.getElementById('fh100mm');return e?{t:e.textContent,vis:e.getBoundingClientRect().width>0}:null});ok(mc&&/first match/.test(mc.t)&&mc.vis,'A resume card '+JSON.stringify(mc));
  if(SHOT)await pg.screenshot({path:SHOT+'/menu_resume_1440.png'});
  await pg.click('#fh100mm [data-fh100m="x"]');await pg.waitForTimeout(300);ok(await pg.evaluate(()=>!document.getElementById('fh100mm')&&JSON.parse(localStorage.getItem('flavius_first100')).off===1),'A resume card ✕ closes the guide');
  await pg.context().close()}

/* ---- B: the first Manager week ---- */
{const pg=await open(1440,900);ok(await welcome(pg),'B welcome');await pick(pg,'fh_mgr');
  const cr=await pg.waitForFunction(()=>document.getElementById('mgrBody')&&MGR.view==='create'&&typeof NEWMGR!=='undefined'&&NEWMGR&&NEWMGR.diff==='easy',null,{timeout:20000}).then(()=>true,()=>false);ok(cr,'B create view, Easy picked');
  ok(await waitTip(pg,'g_create',8000),'B create tip');if(SHOT)await pg.screenshot({path:SHOT+'/mgr_create_1440.png'});
  await pg.evaluate(()=>document.querySelector('#mgrBody [data-mg="nmgo"]').click());
  await pg.waitForFunction(()=>MGR.world&&!MGR.world.tutorial&&document.getElementById('mgrBody'),null,{timeout:20000}).catch(()=>{});
  ok(await waitTip(pg,'g_desk',8000),'B desk tip');const d=await tip(pg);ok(d.st.cid&&d.st.w0!=null,'B tied to the career '+JSON.stringify(d.st));
  ok(await pg.evaluate(()=>me().coin>=200&&rosterOf(me()).length>=2),'B Easy start (coin, two fighters)');
  if(SHOT)await pg.screenshot({path:SHOT+'/mgr_desk_1440.png'});
  await pg.click('#fh100 [data-fh100="ok"]');await pg.waitForTimeout(600);
  ok(await pg.evaluate(()=>!!document.querySelector('#mgrBody [data-mg="tab"][data-id="recruit"].fh100spot')),'B next tab outlined');
  await pg.evaluate(()=>document.querySelector('#mgrBody [data-mg="tab"][data-id="recruit"]').click());ok(await waitTip(pg,'g_recruit',8000),'B recruit tip');
  await pg.evaluate(()=>document.querySelector('#mgrBody [data-mg="tab"][data-id="practice"]').click());ok(await waitTip(pg,'g_yard',10000),'B yard tip');
  await pg.evaluate(()=>document.querySelector('#mgrBody [data-mg="tab"][data-id="night"]').click());
  const nt=await pg.waitForFunction(()=>FH100.cur&&['g_night','g_sim'].includes(FH100.cur.k),null,{timeout:10000}).then(()=>true,()=>false);ok(nt,'B Match Week tip');
  if(SHOT)await pg.screenshot({path:SHOT+'/mgr_night_1440.png'});
  /* enter a fighter, simulate the card */
  await pg.evaluate(()=>{const ids=rosterOf(me()).filter(g=>!g.inj).map(g=>g.id);for(const i of [0,1,2]){const s=document.getElementById('ent'+i);if(!s)continue;const o=[...s.options].find(o=>ids.includes(o.value));if(o){s.value=o.value;document.querySelector(`[data-mg="enter"][data-id="${i}"]`).click();return}}});
  await pg.waitForTimeout(800);
  ok(await waitTip(pg,'g_sim',10000),'B sim tip after entering');
  await pg.evaluate(()=>{const b=document.querySelector('#mgrBody [data-mg="simall"]');if(b)b.click()});
  await pg.waitForFunction(()=>!MGR.busy&&MGR.world.night.bouts.every(b=>b.done),null,{timeout:60000}).catch(()=>{});
  /* settle verdicts the way the lesson test does (Thumb etc.) */
  for(let i=0;i<6;i++){const more=await pg.evaluate(()=>{const w=MGR.world;if(!(w.pend||[]).length)return false;const b=document.querySelector('#mgrBody [data-mg="pthumb"],#mgrBody [data-mg="pblood"],#mgrBody [data-mg="prudis"]');if(b)b.click();return true});if(!more)break;await pg.waitForTimeout(1200);await pg.evaluate(()=>{if(CUR_MODAL&&!document.getElementById('mgrBody')){const bt=document.querySelector('#mBtns button');if(bt)bt.click()}});await pg.waitForTimeout(600)}
  ok(await waitTip(pg,'g_end',15000),'B end-the-week tip');
  await pg.evaluate(()=>{const b=document.querySelector('#mgrBody [data-mg="endask"]');if(b)b.click()});await pg.waitForTimeout(500);
  await pg.evaluate(()=>{const b=document.querySelector('[data-mg="endweek"]');if(b)b.click()});
  await pg.waitForFunction(()=>MGR.world&&MGR.world.week>JSON.parse(localStorage.getItem('flavius_first100')).w0,null,{timeout:40000}).catch(()=>{});
  for(let i=0;i<20;i++){const done=await pg.evaluate(()=>FH100.cur&&FH100.cur.k==='g_review');if(done)break;
    await pg.evaluate(()=>{if(document.getElementById('mgrBody')&&!document.getElementById('modal').hidden){if(MGR.tab!=='ludus'){const t=document.querySelector('#mgrBody [data-mg="tab"][data-id="ludus"]');if(t)t.click()}}else if(CUR_MODAL){const bt=document.querySelector('#mBtns button');if(bt)bt.click()}});await pg.waitForTimeout(700)}
  ok(await waitTip(pg,'g_review',5000),'B week in review tip');if(SHOT)await pg.screenshot({path:SHOT+'/mgr_review_1440.png'});
  await pg.click('#fh100 [data-fh100="ok"]');await pg.waitForTimeout(300);ok(await pg.evaluate(()=>JSON.parse(localStorage.getItem('flavius_first100')).gDone===1),'B guide done');
  await pg.context().close()}

/* ---- C: a returning player sees nothing ---- */
{const pg=await open(1440,900,{flavius_firstrun:'shown',flavius_settings:'{}'});await pg.waitForTimeout(3500);
  ok(!(await pg.evaluate(()=>CUR_MODAL&&/Welcome/.test(document.getElementById('mTitle').textContent))),'C no welcome');
  await pg.evaluate(()=>{menuHide();SPEED='fast';startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'slave',cpu:true},{cls:'amazonia',cpu:true},{cls:'veteranus',cpu:true}],opts:{...CFG.opts}})});
  await pg.waitForTimeout(6000);await closeBrief(pg);await pg.waitForTimeout(4000);ok(!(await tip(pg)).on&&!(await pg.evaluate(()=>!!document.getElementById('fh100mm'))),'C no tips, no card');
  await pg.context().close()}

/* ---- D: kill switch → the old welcome ---- */
{const pg=await open(1440,900,{flavius_firstrun:'pending',flavius_first100off:'1'});ok(await welcome(pg),'D old welcome shown');
  const bv=await btnVals(pg);ok(!bv.some(t=>/first match/.test(t))&&bv.some(t=>/Learn to Play/.test(t)),'D old buttons '+JSON.stringify(bv));await pg.context().close()}

/* ---- E: phone 390 ---- */
{const pg=await open(390,844);ok(await welcome(pg),'E welcome on a phone');
  const wr=await pg.evaluate(()=>{const r=document.getElementById('mboxEl').getBoundingClientRect();return {l:r.left,r:r.right,sw:document.documentElement.scrollWidth}});ok(wr.l>=0&&wr.r<=391&&wr.sw<=391,'E welcome fits '+JSON.stringify(wr));
  if(SHOT)await pg.screenshot({path:SHOT+'/welcome_390.png'});
  await pick(pg,'fh_match');for(let i=0;i<40&&!(await pg.evaluate(()=>document.getElementById('modal').classList.contains('bf100')));i++)await pg.waitForTimeout(250);await closeBrief(pg);await pg.evaluate(()=>{SPEED='fast'});
  ok(await waitTip(pg,'turn'),'E tip on a phone');const t=await tip(pg);ok(t.r&&t.r.left>=0&&t.r.right<=391&&t.r.bottom<=845,'E tip on screen '+JSON.stringify(t.r));
  if(SHOT)await pg.screenshot({path:SHOT+'/match_turn_390.png'});await pg.context().close()}

console.log(fails.length?'FAIL '+JSON.stringify(fails):'OK first hour: offer, guided match, tips once, off, resume, Manager week, returning player, kill switch, phone');
console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();process.exit(fails.length||errs.length?1:0)})();
