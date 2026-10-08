/* v0.97 prep — Armory banner (243-v96armban): its own scene (not the roster's), title/subtitle, count chip, 1440 + 390 no sideways scroll, no new errors.
   SHOT=dir saves screenshots of Armory next to the Roster and Recruiting banners. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W=ms=>pg.waitForTimeout(ms);const SHOT=process.env.SHOT||'';
const mark=await pg.evaluate(()=>ERR92.n);
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;me().coin=3000;MGR.tab='armory';MGR_REDRAW();await W8(500)});
const shot=async n=>{if(SHOT)await pg.screenshot({path:SHOT+'/'+n+'.png',clip:{x:0,y:0,width:pg.viewportSize().width,height:330}})};
const r=await pg.evaluate(()=>{const o={};const h=document.querySelector('.b73-armory');o.has=!!h;o.title=h&&h.querySelector('.roomttl b').textContent;o.sub=h&&h.querySelector('.roomttl span').textContent;
  o.own=!!(h&&h.querySelector('.ab96glow'));o.same=roomScene73('armory')!==roomScene73('roster');o.svg=!!(h&&h.querySelector('svg')&&h.querySelector('svg').getBoundingClientRect().height>40);
  const m=me();const H=arm94H(m);H.sh.push({id:'zz1',t:'w',k:'gladius'});o.stat1=tabStat73('armory');MGR_REDRAW();o.chip=!!document.querySelector('.b73-armory .roomstat');H.sh.pop();return o});
ok(r.has&&/Armory/.test(r.title),'armory banner titled '+r.title);ok(r.sub&&r.sub.length<60,'short subtitle');ok(r.own&&r.same&&r.svg,'own scene '+JSON.stringify(r));ok(r.chip&&r.stat1&&/shelf|repair/.test(r.stat1[1]),'count chip '+JSON.stringify(r.stat1));
await shot('armory_1440');
await pg.evaluate(()=>{MGR.tab='roster';MGR_REDRAW()});await W(400);await shot('roster_1440');
await pg.evaluate(()=>{MGR.tab='recruit';MGR_REDRAW()});await W(400);await shot('recruit_1440');
await pg.setViewportSize({width:390,height:800});await pg.evaluate(()=>{MGR.tab='armory';MGR_REDRAW()});await W(600);
ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'390 no sideways scroll');await shot('armory_390');
await pg.evaluate(()=>{MGR.tab='roster';MGR_REDRAW()});await W(400);await shot('roster_390');
const n2=await pg.evaluate(m=>ERR92.n-m,mark);ok(n2===0,'no new errors '+n2);
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length?1:0)})();
