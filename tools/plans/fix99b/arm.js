/* v0.99 fix4 shots: welcome scroll, Armory (damaged + spares sell), ludus banner fallen. node tools/plans/fix99b/arm.js <page> <outdir> */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const out=process.argv[3];const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:950}});await ctx.route(/fonts\./,r=>r.abort());
 await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_welc99on','1')});
 const pg=await ctx.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
 await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});MGR.tab='ludus';MGR_REDRAW();await W8(900)});
 await pg.screenshot({path:out+'/welcome.png'});
 await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const s=document.querySelector('[data-welc99]');if(s)s.click();const w=W_(),m=me();
  const fa=freeAgents().sort((a,b)=>effOvr(b)-effOvr(a)).slice(0,2);for(const g of fa)g.contract={mgr:m.id,wage:5,weeks:20,since:w.week};arm94Ensure(w);
  const E=fa[0].eq94;if(E.a[0])E.a[0].dmg=1;const H=arm94H(m);const d=arm94New(w,'a','manica');d.dmg=1;H.sh.push(d,arm94New(w,'w','gladius'),arm94New(w,'a','balteus1'));
  MGR.tab='armory';MGR_REDRAW();await W8(800);const c=document.querySelector('#ar96dmg');if(c)c.scrollIntoView({block:'start'});await W8(300)});
 await pg.screenshot({path:out+'/armory.png'});
 await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_(),m=me();m.fallen99=7;w.review={wk:w.week,season:w.season,coinD:-20,coin:m.coin,fameD:1,winsD:1,boutsD:3,results:[],dead:['X'],training:[],seen:false};MGR.tab='ludus';MGR_REDRAW();await W8(800);document.getElementById('mBody').scrollTop=0;await W8(200)});
 await pg.screenshot({path:out+'/ludus.png'});await b.close()})();
