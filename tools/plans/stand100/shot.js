/* before/after shots of the standing crowd: node tools/plans/stand100/shot.js <page> */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'egidious',loc:0,seats:['royalty','soldier','hero','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:120}});
  for(let i=0;i<80;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>6)break}SPEED='pause';for(const sp of S.spect)sp.mood=80;STAND100.burst=0;for(const sp of S.spect){sp._sa100=null;sp._cu92=0}await W8(900);draw()});
const dir=path.join(__dirname);
await pg.screenshot({path:dir+'/before.png'});
await pg.evaluate(async()=>{crowdReact('elim',{v:S.players[1],killer:S.players[0]});await new Promise(r=>setTimeout(r,800));draw()});
await pg.screenshot({path:dir+'/after.png'});
await pg.evaluate(()=>{STAND100.stag=0;for(const sp of S.spect)sp._cu92=0});
await b.close()})();
