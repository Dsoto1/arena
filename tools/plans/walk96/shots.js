/* node tools/plans/walk96/shots.js <page> <prefix> : Match Week banner/strip in road / paid / home / bye at 1440 + 390 */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pre=process.argv[3]||'after';
for(const W of [1440,390]){const pg=await b.newPage({viewport:{width:W,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='night';MGR_REDRAW();await W8(600)});
for(const k of ['road','paid','home','bye']){
 await pg.evaluate(async(k)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),n=w.night,m=me();n.bye=false;delete n.selfBye;delete n.travel;n.scouted=k==='paid'?{wx:'x',world:[],att:0}:null;
  const home=travelHome(m);if(k==='home')n.loc=home;else if(n.loc===home)n.loc=home===6?5:6;
  if(k!=='home'&&k!=='bye'){const t=travelState(w);if(k==='paid'){t.paid=true}}
  const g=rosterOf(m)[0];g.wantFight={week:w.week};
  if(k==='bye')n.bye=true;
  MGR_REDRAW();await W8(900)},k);
 await pg.screenshot({path:`tools/plans/walk96/${pre}-${k}-${W}.png`,clip:{x:0,y:0,width:W,height:W>600?620:900}});}
await pg.close()}await b.close()})();
