/* round-2 shots of My Ludus (297-v100ludus2): node tools/plans/ludus100/shot2.js flavius-arena.html [outdir] → r2_*.png */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const out=process.argv[3]||path.join(__dirname);const page=path.resolve(process.argv[2]);const errs=[];
const open=async(W,H)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me();w.welc99=1;pm.coin=900;council83(w).find(x=>x.k==='clerk').lv=3;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('ludus');await W8(1000);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(1500)});return pg};
const shot=async(pg,name)=>{await pg.waitForTimeout(600);await pg.screenshot({path:path.join(out,'r2_'+name+'.png')})};
for(const [W,H,s] of [[1440,900,'1440'],[390,844,'390']]){const pg=await open(W,H);
  await shot(pg,'week_'+s);
  await pg.evaluate(async()=>{me().coin=-5;MGR_REDRAW();await new Promise(r=>setTimeout(r,600))});await shot(pg,'warn_'+s);await pg.evaluate(()=>{me().coin=900;MGR_REDRAW()});
  for(const k of ['consilium','doctore','clerk','barracks']){await pg.evaluate(async k=>{LU100.pop=k;MGR_REDRAW();await new Promise(r=>setTimeout(r,500));const p=document.getElementById('lu100pop');if(p&&innerWidth>600)p.scrollIntoView({block:'center'})},k);await shot(pg,k+'_'+s)}
  await pg.evaluate(async()=>{LU100.pop=null;MGR.tab='roster';MGR_REDRAW();await new Promise(r=>setTimeout(r,800));const m=document.querySelector('#mBody');if(m)m.scrollTop=0});await shot(pg,'roster_'+s);
  await pg.evaluate(async()=>{MGR.tab='armory';MGR_REDRAW();await new Promise(r=>setTimeout(r,800))});await shot(pg,'armory_'+s);
  await pg.close()}
console.log('ERRS',JSON.stringify(errs));await b.close()})();
