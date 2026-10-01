const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
// creation screen with flag picker
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(500);
await pg.evaluate(()=>{document.querySelector('[data-mg="create"]').click()});await pg.waitForTimeout(500);await pg.screenshot({path:'f_create.png'});
const out=await pg.evaluate(async()=>{const o={};
  const cell=document.querySelector('.flagcell');cell.click();await new Promise(r=>setTimeout(r,200));o.flag=NEWMGR.flag;
  // set a house rule at creation
  const sl=document.querySelector('[data-nmrule="death"]');if(sl){sl.value=50;sl.dispatchEvent(new Event('input',{bubbles:true}))}
  document.querySelector('[data-mg="nmgo"]').click();await new Promise(r=>setTimeout(r,600));
  const w=W_();o.rules=w.rules.death;o.mflag=!!me().flag;o.locked=!document.querySelector('[data-rule="death"]');
  // superfan flag in a watched bout: fake spectators with fav on my fighter
  return o});
await pg.screenshot({path:'f_mgr.png'});
// league flags + lanista flag rack
await pg.evaluate(()=>{MGR.tab='league';MGR_REDRAW()});await pg.waitForTimeout(400);await pg.screenshot({path:'f_league.png',clip:{x:40,y:180,width:1420,height:500}});
await pg.evaluate(()=>{MGR.tab='me';MGR.flagPick=true;MGR_REDRAW()});await pg.waitForTimeout(400);await pg.screenshot({path:'f_me.png'});
console.log(JSON.stringify(out),errs.slice(0,4));await b.close()})();
