/* shots of My Ludus (294-v100ludus): node tools/plans/ludus100/shot.js flavius-arena.html [outdir] */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const out=process.argv[3]||path.join(__dirname);const page=path.resolve(process.argv[2]);const errs=[];
const open=async(W,H)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me(),ros=rosterOf(pm);w.welc99=1;ros[0].inj={until:w.week+2,label:'a gashed thigh',pen:3};pm.perkPts=2;w.train='off';ros[1].fat=45;ros[2].fat=70;
    if(w.night&&w.night.bouts)w.night.bouts.forEach((b,i)=>{const g=ros[i+1];if(g&&!b.ents.includes(g.id))b.ents.push(g.id)});
    sendLetter(w,{key:'adv1',kind:'letter',from:'your recruiter',seal:'⭐',title:'Pick of the week',body:'<p>Galba Bone-Breaker. Soldier, ~B+, asks 38 a week. I would stake my eye on him.</p>',until:w.week});
    sendLetter(w,{key:'adv2',kind:'letter',from:'your clerk',seal:'📜',title:"A note on the wages",body:'<p>Two contracts end soon; the purse can carry one more.</p>',until:w.week});
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('ludus');await W8(1000);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(1500)});return pg};
const shot=async(pg,name,full)=>{await pg.waitForTimeout(500);await pg.screenshot({path:path.join(out,name+'.png'),fullPage:!!full})};
for(const [W,H,s] of [[1440,900,'1440'],[390,844,'390']]){const pg=await open(W,H);
  await shot(pg,'week_'+s);if(s==='390')await pg.evaluate(()=>{const m=document.querySelector('#mBody');if(m)m.scrollTop=700});if(s==='390')await shot(pg,'week_'+s+'_2');
  await pg.evaluate(()=>{const m=document.querySelector('#mBody');if(m)m.scrollTop=0;document.querySelector('[data-lu100mail="1"]').click()});await shot(pg,'mail_'+s);
  await pg.evaluate(async()=>{document.querySelector('[data-lu100mail="0"]').click();const h=document.querySelector('.c83p[data-c83="recruiter"]');h.click();await new Promise(r=>setTimeout(r,400));const p=document.getElementById('lu100pop');if(p&&innerWidth>600)p.scrollIntoView({block:'center'})});await shot(pg,'advisor_'+s);
  await pg.evaluate(async()=>{const a=council83(W_()).find(x=>x.k==='recruiter');a.lv=1;MGR_REDRAW();await new Promise(r=>setTimeout(r,400));const p=document.getElementById('lu100pop');if(p&&innerWidth>600)p.scrollIntoView({block:'center'})});await shot(pg,'advisor-train_'+s);
  await pg.evaluate(async()=>{LU100.pop=null;LU100.panel='fac';MGR.run='fac';MGR_REDRAW();await new Promise(r=>setTimeout(r,400));document.querySelector('.lu100panel').scrollIntoView({block:'start'})});await shot(pg,'school_'+s);
  /* a long list */
  await pg.evaluate(async()=>{const w=W_();LU100.panel=null;for(let i=0;i<9;i++)sendLetter(w,{key:'ln'+i,kind:'letter',from:'the tester',seal:'🧭',title:'Task '+i,body:'<p>x</p>',until:w.week,act:{ic:'🧭',line:'<b>Long task '+i+'</b> a row that needs you',tier:3}});MGR_REDRAW();await new Promise(r=>setTimeout(r,500));const m=document.querySelector('#mBody');if(m)m.scrollTop=0});await shot(pg,'week-long_'+s);
  /* bye */
  await pg.evaluate(async()=>{const w=W_();byeSetup(w);MGR_REDRAW();await new Promise(r=>setTimeout(r,600))});await shot(pg,'bye_'+s);
  await pg.close()}
console.log('ERRS',JSON.stringify(errs));await b.close()})();
