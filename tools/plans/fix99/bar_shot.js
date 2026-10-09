/* node tools/plans/fix99/bar_shot.js <page> <before|after> : shots of the Attack rows (hasta throwable + gladius) at 1440, 390, 844x390 */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]);const tag=process.argv[3]||'after';
(async()=>{const b=await chromium.launch();
for(const [w,h,mob] of [[1440,900,0],[390,844,1],[844,390,1]]){
 const ctx=await b.newContext(mob?{viewport:{width:w,height:h},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:w,height:h},deviceScaleFactor:2});await ctx.route(/fonts\./,r=>r.abort());
 await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
 const pg=await ctx.newPage();await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
 await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';startEvent({ev:'democritus',loc:6,seats:['venatore','hero','royalty','soldier'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break;
   else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';const p=cur();S.ri=1;p.wR=mkW('hasta');p.wL=mkW('gladius');p.attacks=0;p.armUses={R:0,L:0};p.hitTargets=new Set();p.mv=5;p.focusRoll=false;S.mode='move';render();await W8(400)});
 await pg.screenshot({path:`tools/plans/fix99/bar_icons_${tag}_${w}.png`});
 const A=await pg.$('#actions');const bb=A&&await A.boundingBox();
 if(bb&&bb.width>0&&bb.height>0)await A.screenshot({path:`tools/plans/fix99/bar_icons_${tag}_${w}_bar.png`}).catch(()=>{});
 if(mob){await pg.evaluate(()=>{const bt=document.querySelector('#actions .wb98[data-st98]');if(bt){const r=bt.getBoundingClientRect();const el=document.createElement('div');el.id='lp98';el.style.cssText='';document.body.appendChild(el);el.innerHTML=window.b98LpHTML?window.b98LpHTML(bt):'';el.style.left=(r.left+r.width/2)+'px';el.style.top=Math.max(4,r.top-30)+'px'}});
  await pg.screenshot({path:`tools/plans/fix99/bar_icons_${tag}_${w}_lp.png`})}
 await ctx.close()}
await b.close()})();
