/* v0.99 fix4 board shot: Zora (figure style) + tunnel exits highlighted. node tools/plans/fix99b/board.js <page> <out.png> [tokenStyle] */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
 await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
 const pg=await ctx.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
 const r=await pg.evaluate(async(st)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(80)}try{menuHide()}catch(e){}
  if(st){SETTINGS.tokenStyle=st;try{applySettings()}catch(e){}}
  SETTINGS.briefing=false;SPEED='fast';startEvent({ev:'democritus',loc:6,seats:['soldier','hero','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<300;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';const p=cur();const t=S.tunnels[0];const o={tunnels:S.tunnels.length};if(t){const near=[[0,1],[1,0],[0,-1],[-1,0],[1,1]].map(([a,c])=>[t.r+a,t.c+c]).find(([r,c])=>r>=0&&c>=0&&r<N&&c<N&&!unitAt(r,c)&&!pillarAt(r,c));if(near){p.r=near[0];p.c=near[1]}}
  p.keys=1;try{if(typeof spawnZora==='function')spawnZora(p)}catch(e){o.zerr=String(e)}S.mode='tunnel';computeHL();o.exits=[...HL.values()].filter(h=>h.t==='tunnel').length;render();draw();await W8(800);draw();return o},process.argv[4]||'');
 console.log(JSON.stringify(r));await pg.screenshot({path:process.argv[3]});await b.close()})();
