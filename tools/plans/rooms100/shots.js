/* node tools/plans/rooms100/shots.js <page> [tag] [off] — the three Manager rooms (roster / practice / infirm) at 1440x900 and 390x844
   (full page) → tools/plans/rooms100/<tag>_<tab>_<W>.png. off=1 sets the kill switch flavius_rooms100off=1. */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const tag=process.argv[3]||'after';const off=process.argv[4]==='1';
for(const [W,H] of [[1440,900],[390,844]]){
 const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.route(/fonts\./,r=>r.abort());
 await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_rooms100off','1')},off?1:0);
 await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
 await pg.evaluate(async()=>{let sd=7;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=400;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
  const ros=rosterOf(pm);if(ros[3]){ros[3].inj={until:w.week+3,label:'a gashed chest',pen:3};ros[3].fat=64;ros[3].severed=['larm']}
  if(ros[4]){ros[4].inj={until:w.week+2,label:'a torn shoulder',pen:2};ros[4].fat=41}if(ros[2])ros[2].fat=66;menuHide();openManager('roster');await W8(900);MGR.view=null});
 for(const t of ['roster','practice','infirm']){await pg.evaluate(async t=>{if(!document.querySelector('#mgrBody'))openManager(t);MGR.tab=t;MGR_REDRAW();await new Promise(r=>setTimeout(r,900))},t);
  const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||[...document.querySelectorAll('#mgrBody,#mBody')].some(e=>e.scrollWidth>e.clientWidth+1));
  await pg.screenshot({path:path.resolve(__dirname,`${tag}_${t}_${W}.png`),fullPage:false});
  if(W<600){/* the Manager window scrolls inside #mBody: shoot its slices */const sh=await pg.evaluate(()=>{let e=document.querySelector('#mgrPane');while(e&&!(e.scrollHeight>e.clientHeight+4&&/auto|scroll/.test(getComputedStyle(e).overflowY)))e=e.parentElement;window.__sc=e||document.scrollingElement;return window.__sc.scrollHeight});
   for(let y=H-120,k=2;y<sh&&k<9;y+=H-120,k++){await pg.evaluate(y=>{window.__sc.scrollTop=y},y);await pg.waitForTimeout(700);await pg.screenshot({path:path.resolve(__dirname,`${tag}_${t}_${W}_${k}.png`)})}
   await pg.evaluate(()=>{window.__sc.scrollTop=0})}
  console.log(tag,t,W,'sideways',sw)}
 console.log('ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();
