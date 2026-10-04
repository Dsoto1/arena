/* v0.66: tutorial bumpers (tour = look-only, hands-on = play surfaces only, 🏛 asks to leave), phones in landscape (drawers,
   dock, actions open on your move, follow camera, pinch zoom), the portrait hint */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
{const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
 await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
 await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();startTutorial();await new Promise(r=>setTimeout(r,2500));for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}});
 await pg.waitForTimeout(800);
 o.tut=await pg.evaluate(async()=>{const r={on:tutLive(),tour:tutTourNow(),lock:document.body.classList.contains('tutlock')};
   const before=document.getElementById('modal').hidden;document.getElementById('btnRules').click();await new Promise(x=>setTimeout(x,500));r.rulesBlocked=document.getElementById('modal').hidden===before&&document.getElementById('modal').hidden;
   document.getElementById('btnMenu').click();await new Promise(x=>setTimeout(x,500));r.leaveAsk=/Leave the lesson/.test(document.getElementById('mTitle').textContent);if(CUR_MODAL)CUR_MODAL.done(0);await new Promise(x=>setTimeout(x,300));
   while(tutTourNow()&&TUT.step<30){tutNext();await new Promise(x=>setTimeout(x,60))}r.handsOn=!tutTourNow();
   const ev=new MouseEvent('click',{bubbles:true,cancelable:true});const a=document.querySelector('#actions');let passed=false;const h=()=>{passed=true};a.addEventListener('click',h);a.dispatchEvent(ev);a.removeEventListener('click',h);r.actionsOK=passed;
   let rp=false;const rb=document.getElementById('btnRules');const h2=()=>{rp=true};rb.addEventListener('click',h2);rb.click();rb.removeEventListener('click',h2);r.rulesStillBlocked=!rp;return r});
 ok(o.tut.on&&o.tut.tour&&o.tut.lock,'lesson on, tour, locked');ok(o.tut.rulesBlocked,'tour: highlighted nav is look-only');ok(o.tut.leaveAsk,'🏛 asks to leave');
 ok(o.tut.handsOn&&o.tut.actionsOK&&o.tut.rulesStillBlocked,'hands-on: play surfaces only');await pg.close()}
{const ctx=await b.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
 await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2000);
 o.ph=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore'},{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
   await new Promise(r=>setTimeout(r,1500));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,120))}SPEED='snap';
   for(let i=0;i<60&&!(humanTurn()&&S.phase==='action');i++){await new Promise(r=>setTimeout(r,250));if(CUR_MODAL)CUR_MODAL.done(null)}await new Promise(r=>setTimeout(r,700));
   const B=document.body;const r={cls:B.className,dock:!!document.querySelector('#plDock [data-pl="act"]'),fill:cv.getBoundingClientRect().height>=innerHeight-20,act:B.classList.contains('pl-act'),zoom:!!S.zoomIn};
   r.choiceOpen=S.phase!=='choice'||B.classList.contains('pl-act');if(S.phase==='choice'){takeChoice(cur(),'coin');for(let i=0;i<20&&S.phase!=='action';i++)await new Promise(x=>setTimeout(x,150));await new Promise(x=>setTimeout(x,400))}
   r.act=B.classList.contains('pl-act');r.ph2=S.phase;
   r.glow=!!document.querySelector('#plDock [data-pl="act"].glow82');
   document.querySelector('#plDock [data-pl="act"]').click();await new Promise(x=>setTimeout(x,400));r.open=B.classList.contains('pl-act');
   const ab=[...document.querySelectorAll('#actions [data-act]')].find(x=>!x.disabled&&/^(m:|atk|mv|move)/.test(x.dataset.act))||[...document.querySelectorAll('#actions [data-act]')].find(x=>!x.disabled&&x.dataset.act!=='end');
   r.ab=ab&&ab.dataset.act;if(ab)ab.click();await new Promise(x=>setTimeout(x,400));r.shut=!B.classList.contains('pl-act');
   const p=cur();const c1=iso(p.r,p.c);r.centred=Math.abs(c1.x-cv.clientWidth/2)<cv.clientWidth*0.2;
   document.querySelector('#plDock [data-pl="side"]').click();await new Promise(x=>setTimeout(x,300));r.side=B.classList.contains('pl-side')&&getComputedStyle(document.querySelector('aside.side')).transform==='none';
   CAM.z=2.2;draw();r.tw=TW;CAM.z=null;draw();r.tw0=TW;return r});
 ok(/phoneL/.test(o.ph.cls)&&o.ph.dock&&o.ph.fill,'landscape: arena fills, dock');ok(o.ph.choiceOpen,'choice: the drawer opens with its two buttons');ok(!o.ph.act&&o.ph.glow&&o.ph.zoom&&o.ph.centred,'your move: board clear (actions shut, ⚔ glows), camera on you');ok(o.ph.open&&o.ph.shut,'⚔ opens the actions; picking one shuts them (v0.82)');
 ok(o.ph.side,'side drawer');ok(o.ph.tw>o.ph.tw0,'pinch zoom level');await ctx.close()}
{const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());
 await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
 await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2000);
 o.port=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore'},{cls:'hero',cpu:true}],opts:{spect:0}});await new Promise(r=>setTimeout(r,1500));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,120))}await new Promise(r=>setTimeout(r,700));const el=document.getElementById('plRot');
   return {cls:document.body.className,hint:el?getComputedStyle(el).display:'none'}});
 ok(/phoneP2/.test(o.port.cls)&&o.port.hint==='none','portrait sheet replaces the hint (v0.73)');await ctx.close()}
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
