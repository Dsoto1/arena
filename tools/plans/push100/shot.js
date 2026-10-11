/* push100 strip: node tools/plans/push100/shot.js flavius-arena.html → tools/plans/push100/f0..f7.png (then cropped into strip.webp).
   The slide is slowed (PUSH100.ms) so screenshots can follow it; a hero shoves a soldier onto a spike, then a pillar. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const OUT=__dirname;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:860}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
const box=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'hero'},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';
  for(let i=0;i<200&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}SPEED='normal';
  const P=S.players[0],Q=S.players[1];for(const u of [...S.players,...S.npcs])if(u!==P&&u!==Q&&u.alive&&u.r>=5&&u.r<=9&&u.c<=5){u.r=0;u.c=12-S.players.indexOf(u)}
  S.pillars=S.pillars.filter(p=>!(p.r>=5&&p.r<=9&&p.c<=5));S.spikes=S.spikes.filter(s=>!(s.r>=5&&s.r<=9&&s.c<=5));
  P.r=6;P.c=2;Q.r=6;Q.c=3;S.spikes.push({r:6,c:4});P.mv=20;HL.clear&&HL.clear();render();draw();await W8(400);
  const a=center(6,3),r=cv.getBoundingClientRect();return {x:Math.max(0,r.left+a.x-190),y:Math.max(0,r.top+a.y-170),width:380,height:250}});
await pg.evaluate(()=>{PUSH100.ms=16000;window.__go=doPush(S.players[0],pushTargets(S.players[0]).find(t=>t.u===S.players[1]))});
for(let i=0;i<8;i++){await pg.screenshot({path:path.join(OUT,'f'+i+'.png'),clip:box});await pg.waitForTimeout(1500)}
await pg.evaluate(()=>window.__go);await b.close()})();
