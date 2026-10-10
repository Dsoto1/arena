/* city chatter BEFORE + clean board crops + piece coordinates for the mock (bubbles_pos.json) */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');const OUT=__dirname;const page=path.resolve(__dirname,'../../../flavius-arena.html');
(async()=>{const b=await chromium.launch();const POS={};
for(const [W,H,tag] of [[1440,900,''],[390,844,'_390']]){
const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:W<600?2:1});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
if(!tag){const c=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  openCitySquare(1,{});for(let i=0;i<40;i++){await W8(400);if(CITY.npcs&&CITY.npcs.length>8)break}
  const L=['Did you hear? Capua lost two.','Bread and blood!','My coin is on the Thraex.'];(CITY.npcs||[]).slice(0,3).forEach((n,i)=>{n.say=L[i];n.sayUntil=performance.now()+600000});return CITY.open+' '+(CITY.npcs||[]).length});
  console.log('city',c);await pg.waitForTimeout(1500);await pg.screenshot({path:path.join(OUT,'bubbles_before_city.png')});
  await pg.evaluate(()=>{try{closeCitySquare()}catch(e){const o=document.getElementById('cityOv');if(o)o.remove();CITY.open=false}});}
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}
  startEvent({ev:'democritus',loc:0,seats:['venatore','soldier','royalty','hero'].map(c=>({cls:c,cpu:true})),opts:{spect:24}});
  for(let i=0;i<60;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);if(S&&S.turnNo>=3)break}
  SPEED='pause';while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}});
await pg.waitForTimeout(1500);
const pos=await pg.evaluate(()=>{S.bubbles=[];for(const id of ['bubbles','wbubs','cardShow'])(document.getElementById(id)||{}).innerHTML='';S.emotes=[];FLAV.line='';
  for(const id of ['cardShow','turnInd','caption'])(document.getElementById(id)||{style:{}}).style.visibility='hidden';
  for(const el of document.querySelectorAll('.canvas-wrap > button, .canvas-wrap .btn, #btnSeat, .ncdraw, [class*=drawn]'))el.style.visibility='hidden';
  draw();const wr=document.querySelector('.canvas-wrap').getBoundingClientRect();const cv=document.getElementById('cv').getBoundingClientRect();
  const o={wrap:{x:wr.x,y:wr.y,w:wr.width,h:wr.height},tw:TW,players:S.players.filter(p=>p.alive).map(p=>{const m=center(p.r,p.c);return {name:p.name,color:p.color,x:m.x,y:m.y}}),
    npcs:S.npcs.filter(n=>n.alive!==false&&n.r!=null).map(n=>{const m=center(n.r,n.c);return {t:n.t,x:m.x,y:m.y}}),
    spect:(S.spect||[]).filter(s=>s._x!=null).map(s=>({x:s._x,y:s._y,name:s.name}))};
  try{const f=flavXY89();o.flav={x:f.cx,y:f.cy,w:TW*1.55*flavK(),h:TW*1.2*flavK()}}catch(e){}return o});
POS[tag||'d']=pos;
await pg.screenshot({path:path.join(OUT,'bubbles_board_clean'+tag+'.png'),clip:{x:pos.wrap.x,y:pos.wrap.y,width:pos.wrap.w,height:pos.wrap.h}});
await pg.close()}
fs.writeFileSync(path.join(OUT,'bubbles_pos.json'),JSON.stringify(POS,null,1));await b.close()})();
