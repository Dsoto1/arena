/* v0.99 fix4 screenshots: node tools/plans/fix99b/shot.js <page> <outdir> <prefix> [w]
   Manager: Match Week (bout buttons + a pending verdict), Armory, Your ludus banner, Recruiting list. */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const page=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]),pre=process.argv[4]||'x',W=+(process.argv[5]||1600);fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:1000}});await ctx.route(/fonts\./,r=>r.abort());
 await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
 const pg=await ctx.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
 const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});
  const w=W_(),m=me();const R=w.mgrs.filter(x=>x!==m).flatMap(x=>rosterOf(x));w.pend=[{t:"blood",gid:R[0].id,fi:2,f:12,price:30},{t:"thumb",gid:R[1].id,f:18}];
  MGR.tab='night';MGR_REDRAW();await W8(800);return {tabs:document.querySelectorAll('#mgrBody .acts .btn').length}});
 console.log(JSON.stringify(info));await pg.screenshot({path:path.join(out,pre+'_night.png'),fullPage:true});
 for(const t of ['ludus','armory','recruit']){await pg.evaluate(async t=>{MGR.tab=t;MGR_REDRAW();await new Promise(r=>setTimeout(r,700))},t);await pg.screenshot({path:path.join(out,pre+'_'+t+'.png')})}
 await b.close()})();
