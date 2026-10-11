/* shots of 277-v100hit: node tools/plans/hit100/shot.js flavius-arena.html → tools/plans/hit100/*.png (desktop 1440, phone 390, phone sideways) */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const out=__dirname;
(async()=>{const b=await chromium.launch();
for(const [nm,vp,mob] of [['desktop',{width:1440,height:900},false],['phone',{width:390,height:844},true],['phoneL',{width:844,height:390},true]]){
  const cx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const pg=await cx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:777,seats:['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
    for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}
    SPEED='pause';H100.k=8;const P=S.players;const me=P[0];
    /* between-turn ticks on your own avatar */
    S.cur=1;me.ap.larm=0;await hurt(me,'larm',2,{type:'npc',n:{name:'Leo'}},'');me.ap.rleg=0;await hurt(me,'rleg',1,{type:'player',p:P[3],w:P[3].wR},'');S.cur=0;H100.list.length=0;draw()});
  await pg.waitForTimeout(300);
  await pg.evaluate(async()=>{const P=S.players;const me=P[0],q=P[1];q.ap.chest=2;q.hp.chest=7;hurt(q,'chest',4,{type:'player',p:me,w:me.wR},'');
    const x=P[2],y=P[3];x.ap.head=0;hurt(x,'head',2,{type:'player',p:y,w:y.wR},'');hurt(P[3],'chest',1,{type:'env',spect:{name:'Cato'}},'');H100.tgt=q;hurt(q,'lleg',1,{type:'npc',n:{t:'lion',name:'Leo',id:1}},'');fx(me.r,me.c,'+2 CF','#f0cf7d')});
  await pg.evaluate(()=>{SPEED='pause'});await pg.waitForTimeout(2500);await pg.screenshot({path:path.join(out,nm+'_hit.png')});
  await pg.evaluate(()=>{H100.k=1;H100.peek=null;H100.list.length=0;document.querySelectorAll('.h100n').forEach(e=>e.remove());render();draw()});await pg.waitForTimeout(2000);await pg.screenshot({path:path.join(out,nm+'_ticks.png')});
  await cx.close()}
await b.close()})();
