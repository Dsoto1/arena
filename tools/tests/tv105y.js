/* tv105y — B72 (v1.05, 378-v105rec): Manager > Recruiting, a click on a recruit's action (ask around, watch, scout, pitch, gift, offer …) must not jitter.
   After each real mouse click the page is sampled every animation frame for 1.2 s: #mBody.scrollTop changes at most ONCE (no back-and-forth, no smooth scroll
   fighting a manual fix) and, in every frame where the options panel is on screen, its top stays within 2 px of where it was. Native scroll anchoring is off
   on #mBody while the hold runs and back on afterwards. Picking a recruit still brings the panel into view (B54, tv105o). Optional argv[3] unused. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const A='[data-rec98a],[data-rec74],[data-mg="pitch"],[data-mg="scout"],[data-mg="gift2"],[data-mg="visit"]';
for(const vw of [1440,700]){
  const pg=await b.newPage({viewport:{width:vw,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=5000;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    if(!w.night&&typeof makeNight==='function')makeNight();w.week=6;openManager();await W8(500);MGR.tab='recruit';MGR.view=null;MGR_REDRAW();await W8(600)});
  const rowPos=await pg.evaluate(async()=>{const rs=[...document.querySelectorAll('#mgrBody [data-mg="sel"]')];const r=rs[Math.min(rs.length-1,12)];r.scrollIntoView({block:'center'});await W8(200);const q=r.getBoundingClientRect();return {x:q.x+q.width/2,y:q.y+q.height/2}});
  await pg.mouse.click(rowPos.x,rowPos.y);await pg.waitForTimeout(1500);
  let clicks=0;
  for(let i=0;i<4;i++){
    const pos=await pg.evaluate(A=>{const bs=[...document.querySelectorAll('#mgrBody .card2')].flatMap(c=>[...c.querySelectorAll(A)]).filter(x=>!x.disabled);if(!bs.length)return null;const bt=bs[0],mb=document.getElementById('mBody');
      const q0=bt.getBoundingClientRect(),bb=mb.getBoundingClientRect();if(q0.top<bb.top+60||q0.bottom>bb.bottom-60)bt.scrollIntoView({block:'center'});return {n:bs.length}},A);
    if(!pos)break;await pg.waitForTimeout(400);
    const at=await pg.evaluate(A=>{const bs=[...document.querySelectorAll('#mgrBody .card2')].flatMap(c=>[...c.querySelectorAll(A)]).filter(x=>!x.disabled);const q=bs[0].getBoundingClientRect();
      const mb=document.getElementById('mBody');const pan=()=>{const b=document.querySelector('#mgrBody [data-rec98a],#mgrBody [data-rec74]');return b?b.closest('.card2'):null};
      window.__log=[];const t0=performance.now();(function f(){const p=pan(),r=p&&p.getBoundingClientRect();window.__log.push({t:performance.now()-t0,s:mb.scrollTop,top:r&&r.height>0?r.top:null});if(performance.now()-t0<1200)requestAnimationFrame(f)})();
      return {x:q.x+q.width/2,y:q.y+q.height/2}},A);
    await pg.waitForTimeout(60);await pg.mouse.click(at.x,at.y);clicks++;await pg.waitForTimeout(1500);
    const r=await pg.evaluate(()=>({log:window.__log,oa:getComputedStyle(document.getElementById('mBody')).overflowAnchor,mh:document.getElementById('mgrBody').style.minHeight}));
    const L=r.log;let sc=0,dir=0,flips=0;for(let k=1;k<L.length;k++){const d=L[k].s-L[k-1].s;if(Math.abs(d)>0.5){sc++;const dd=d>0?1:-1;if(dir&&dd!==dir)flips++;dir=dd}}
    const tops=L.map(x=>x.top).filter(x=>x!==null);const t0=tops[0];const drift=Math.max(...tops.map(x=>Math.abs(x-t0)));
    console.log('B72',vw,'click',i,'frames',L.length,'scrollChanges',sc,'flips',flips,'topDrift',Math.round(drift*10)/10);
    ok(sc<=1&&flips===0,vw+' click '+i+': scrollTop changes at most once ('+sc+' changes, '+flips+' reversals)');
    ok(tops.length>0&&drift<=2,vw+' click '+i+': the panel top stays within 2 px (drift '+drift+')');
    ok(r.oa==='auto'&&r.mh==='','anchoring and min-height are restored after the hold ('+r.oa+','+r.mh+')')}
  ok(clicks>=2,vw+': at least two action clicks were measured ('+clicks+')');
  await pg.close()}
await b.close();console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('MISS',miss);process.exit(1)}console.log('OK');process.exit(errs.length?1:0)})();
