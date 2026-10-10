/* node tools/plans/mock100/bubbles_before.js — BEFORE shots of today's bubble systems (and a clean board for the mock). */
const {chromium}=require('playwright');const path=require('path');const OUT=__dirname;const page=path.resolve(__dirname,'../../../flavius-arena.html');
(async()=>{const b=await chromium.launch();
for(const [W,H,tag] of [[1440,900,''],[390,844,'_390']]){
const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:W<600?2:1});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const ok=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}
  const seats=['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:true}));
  startEvent({ev:'democritus',loc:0,seats,opts:{spect:24}});
  for(let i=0;i<60;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);if(S&&S.turnNo>=3)break}
  SPEED='pause';while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}
  S.bubbles=[];document.getElementById('bubbles').innerHTML='';draw();return !!S});
console.log('started',ok);await pg.waitForTimeout(1200);
await pg.evaluate(()=>{S.bubbles=[];document.getElementById('bubbles').innerHTML='';(document.getElementById('wbubs')||{}).innerHTML='';S.emotes=[];FLAV.line='';draw()});
await pg.screenshot({path:path.join(OUT,'bubbles_board'+tag+'.png')});
/* force every bubble kind at once */
const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};THOUGHTS=true;
  const ps=S.players.filter(p=>p.alive);
  S.bubbles=[];const now=Date.now();let id=9000;
  const push=(p,text,mood)=>S.bubbles.push({id:id++,pid:p.id,text,mood,at:now});
  push(ps[0],'Patience. Let them bleed first.','think');push(ps[1],'Nothing personal, friend.','say');if(ps[2])push(ps[2],'Take it. You need it more than I do.','gift');if(ps[3])push(ps[3],'Coward!','angry');
  renderBubbles();
  /* wager bubbles on two spectators */
  const sp=(S.spect||[]).filter(s=>s._x!=null);o.spect=sp.length;
  if(sp[0])wagerBubble(sp[0]._x,sp[0]._y-TW*0.5,4,'cf',sp[0].name);
  {const m=center(ps[0].r,ps[0].c);wagerBubble(m.x+TW*1.2,m.y-TW*0.6,10,'coin',ps[0].name)}
  /* spectator emote + shout */
  if(sp[3]){S.emotes=[];S.emotes.push({sid:sp[3].id,emo:'😡',text:'Murderer!',t0:performance.now()})}
  if(sp[8])S.emotes.push({sid:sp[8].id,emo:'😄',text:'',t0:performance.now()});
  /* Flavius */
  FLAV.mood='angry';FLAV.until=performance.now()+60000;FLAV.line='My spectators are not targets!';FLAV.lineUntil=FLAV.until;
  /* online quick chat (match bubble) */
  try{onlBubble80(ps[1]?S.players.indexOf(ps[1]):0,'truce');o.onl=true}catch(e){o.onlErr=e.message}
  draw();return o});
console.log(tag,JSON.stringify(info));
await pg.waitForTimeout(350);await pg.evaluate(()=>{draw()});
await pg.screenshot({path:path.join(OUT,'bubbles_before_arena'+tag+'.png')});
/* crop around the board for the desktop */
if(!tag){const r=await pg.evaluate(()=>{const c=document.querySelector('.canvas-wrap').getBoundingClientRect();return {x:c.x,y:c.y,width:c.width,height:c.height}});
  await pg.screenshot({path:path.join(OUT,'bubbles_before_arena_crop.png'),clip:r})}
/* city square chatter */
if(!tag){const c=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));try{S.over=true}catch(e){}try{openCitySquare(0,{});}catch(e){return 'err '+e.message}await W8(4000);return 'ok'});
  console.log('city',c);await pg.waitForTimeout(4000);await pg.screenshot({path:path.join(OUT,'bubbles_before_city.png')})}
await pg.close()}
await b.close()})();
