/* tv105u — v1.05 B64 (384-v105start): the Match Week warning reads THIS WEEK's card · 3 of the 4 First-team places filled, each in a bout = no warning ·
   one entered bout whose fighter is hurt = a warning naming that bout (and the banner) · fixing it clears it · a bye week = none · kill switch
   flavius_v105startoff=1 gives the old "only N of your M starters" wording back. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('console',m=>{if(/^DBG/.test(m.text()))console.log(m.text())});pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105startoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=5000;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    if(!w.night&&typeof makeNight==='function')makeNight();w.week=6;MGR.tab='ludus';MGR_REDRAW();await W8(600)});return pg};
/* put three fit starters into bouts I-III, a fourth fit one in the First team */
const SET=`window.setup105=()=>{const w=W_(),pm=me();for(const g of rosterOf(pm)){g.inj=null;delete g.restWk;delete g.home104}
  for(const g of rosterOf(pm)){delete g.slot95}
  const R=rosterOf(pm).slice(0,4);R.forEach((g,i)=>{g.tm104='A';if(i<3)g.slot95=i+1});
  w.night.bye=false;w.night.selfBye=false;const used=new Set(w.night.bouts.flatMap(b=>b.ents));
  w.night.bouts.forEach((bo,i)=>{bo.done=false;bo.ents=bo.ents.filter(id=>!rosterOf(pm).some(g=>g.id===id));if(i<3)bo.ents.push(R[i].id)});return R}`;
{const pg=await open(false);await pg.evaluate(SET);
  const r=await pg.evaluate(async()=>{const out={};const w=W_(),pm=me();const R=setup105();
    out.full=mq104Warn(w,pm);
    R[1].inj={until:w.week+3,label:'a cut',pen:1,wk102:w.week};
    for(const g of rosterOf(pm).filter(x=>x!==R[0]&&x!==R[2]))g.inj={until:w.week+3,label:'a cut',pen:1,wk102:w.week};
    out.hurt=mq104Warn(w,pm);MGR.tab='ludus';MGR_REDRAW();await W8(400);out.banner=!!document.querySelector('#mgrBody .mq104w');out.dbg=[MGR.view,MGR.tab,!!document.querySelector('#mgrBody'),!!document.querySelector('.mq104w'),(mgrHTML()||'').includes('mq104w'),(mgrHTML()||'').includes('lu100ban'),typeof w104UI==='function'&&!!w104UI(),mq104Warn(w,pm).length];if(!out.banner){MGR.tab='night';MGR_REDRAW();await W8(500);out.banner=!!document.querySelector('#mgrBody .mq104w');out.tab='night:'+!!document.querySelector('.lu100ban')}
    const lab=mw105Lab(w.night.bouts[1]);out.lab=lab;
    for(const x of rosterOf(pm))x.inj=null;MGR_REDRAW();await W8(400);out.fixed=mq104Warn(w,pm);out.banner2=!!document.querySelector('#mgrBody .mq104w');
    R[1].inj={until:w.week+3,label:'a cut',pen:1,wk102:w.week};w.night.bye=true;out.bye=mq104Warn(w,pm);w.night.bye=false;
    R[1].inj=null;return out});
  ok(r.full==='','3 of 4 filled, each in a bout: none ('+r.full+')');
  ok(/has no fit fighter/.test(r.hurt)&&r.hurt.includes(r.lab)&&!/starters are fit/.test(r.hurt),'hurt entered fighter names the bout ('+r.hurt+')');
  ok(r.banner,'banner shown');ok(r.fixed===''&&!r.banner2,'fixed clears the warning and the banner');ok(r.bye==='','bye week none');
  /* B65: Superbus weeks */
  const q=await pg.evaluate(async()=>{const out={};const w=W_(),pm=me();const R=setup105();const o=w.mgrs.filter(m=>!m.isPlayer&&!m.sica).slice(0,2);const keep=w.night;
    const todo=()=>JSON.stringify(ludusTodos()).includes("None of your fighters")+'|'+JSON.stringify(weekChecklist().filter(x=>!x.done)).includes("None of your fighters");
    const mk=(r,k,ents)=>({week:w.week,loc:keep.loc,grand:false,po104:r,omen:keep.omen,world:[],travel:{cost:0,paid:true,po104:1},bouts:[{tier:'sb104',ev:'cassian',purse:100,ents,done:false,res:null,bets:[],po104:{r,i:0,k}}]});
    const hired=o.map(m=>rosterOf(m)[0]&&rosterOf(m)[0].id).filter(Boolean);
    w.night=mk('sf',['m:'+o[0].id,'m:'+o[1].id],hired);out.elimWarn=mq104Warn(w,pm);out.elimCan=st105Can(w,pm);out.elimTodo=todo();
    for(const g of rosterOf(pm))g.inj={until:w.week+3,label:'a cut',pen:1,wk102:w.week};
    w.night=mk('fin',['m:'+pm.id,'m:'+o[0].id],[R[0].id,hired[0]]);out.finWarn=mq104Warn(w,pm);out.finCan=st105Can(w,pm);
    for(const g of rosterOf(pm))g.inj=null;out.finOk=mq104Warn(w,pm);
    w.night=keep;return out});
  ok(q.elimWarn===''&&q.elimCan===false,'eliminated house: no warning ('+q.elimWarn+')');
  ok(q.elimTodo==='false|false','eliminated house: no "None of your fighters" task ('+q.elimTodo+')');
  ok(/has no fit fighter/.test(q.finWarn)&&q.finCan,'seeded in the final: unfit fighter warns ('+q.finWarn+')');ok(q.finOk==='','final with a fit fighter: none');
  await pg.close()}
{const pg=await open(true);await pg.evaluate(SET);
  const r=await pg.evaluate(()=>{const w=W_(),pm=me();setup105();return {off:mq104Warn(w,pm)}});
  ok(typeof r.off==='string','kill switch runs the old check');await pg.close()}
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
