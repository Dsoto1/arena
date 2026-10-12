/* v1.0 ONE BUBBLE FAMILY (303-v100bubbles) shots: the arena with the full cap up (speech, thought, Flavius's shout, wagers, chat, a crowd
   shout), the same zoomed (board layer), and the city square chatter — at 1440 and 390.  node tools/plans/bubbles100/shots.js [page] */
const {chromium}=require('playwright');const path=require('path');const OUT=__dirname;const page=path.resolve(process.argv[2]||path.join(__dirname,'../../../flavius-arena.html'));
(async()=>{const b=await chromium.launch();
for(const [W,H] of [[1440,900],[390,844]]){const cx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:W<500?2:1});const pg=await cx.newPage();
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+page,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:77,seats:['venatore','soldier','royalty','hero'].map(c=>({cls:c,cpu:true})),opts:{spect:10}});
    for(let i=0;i<150;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}SPEED='pause';await W8(400)});
  const fill=()=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const P=S.players;S.bubbles=[];BB100.set(true);
    S.bubbles.push({id:1,pid:P[1].id,text:'Nothing personal, friend.',mood:'say',at:Date.now()},{id:2,pid:P[2].id,text:'Patience. Let them bleed first.',mood:'think',at:Date.now()});renderBubbles();
    FLAV.until=0;flaviusMood('angry',60000,1);FLAV.lineUntil=performance.now()+60000;
    const m=center(P[3].r,P[3].c);wagerBubble(m.x,m.y-TW*1.1,10,'coin','You');onlBubble80(0,Object.keys(ONLC.QC_TEXT)[2]);
    const sp=(S.spect||[]).filter(x=>x._x!=null);if(sp[0])emote(sp[0],'😄','Ave!');if(sp[3])emote(sp[3],'😠','Coward!');draw();await W8(400);draw()});
  await fill();await pg.screenshot({path:path.join(OUT,`bubbles_arena_${W}.png`)});
  const box=await pg.evaluate(()=>{const r=cv.getBoundingClientRect();const f=flavXY89();return {x:Math.max(0,r.left+f.cx-260),y:Math.max(0,r.top),width:Math.min(innerWidth,520),height:Math.min(220,r.height)}});
  await pg.screenshot({path:path.join(OUT,`bubbles_shout_${W}.png`),clip:{...box,x:Math.min(box.x,W-box.width)}});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.zoomIn=true;CAM.z=null;for(let i=0;i<16;i++){draw();await W8(80)}});await fill();
  await pg.evaluate(async()=>{for(let i=0;i<6;i++){draw();await new Promise(r=>setTimeout(r,80))}});
  await pg.screenshot({path:path.join(OUT,`bubbles_zoom_${W}.png`)});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.zoomIn=false;try{gameOver&&0}catch(e){}SETTINGS.cityChatter=true;openCitySquare(1,{});await W8(5000);
    const C=CITY.npcs.filter(n=>n._x!=null&&['spec','filler','glad','soldier'].includes(n.kind));const L=CITY.chatter&&CITY.chatter.length?CITY.chatter:['Ave!','Did you see the lion?','Bread is dear this week.'];
    for(let i=0;i<Math.min(5,C.length);i++){C[i].say=L[i%L.length];C[i].sayUntil=performance.now()+60000}CITY.speed=0;await W8(600)});
  await pg.screenshot({path:path.join(OUT,`bubbles_city_${W}.png`)});await cx.close()}
await b.close()})();
