/* v0.70: Virgilante's fits baked into ARM_FIT; the fit tool behind its code word (hidden by default, 🔒 hides it again);
   Right/Left fitting (the left keeps its own fit, the drag follows the pointer); single pieces on one side in the tool;
   turning mirrors on the left; legs mirror one art (no pair halves); Provocator Manica = lower arm; Leather Upper Leg Armor;
   studio avatars sit lower; older saved fits are ignored */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.removeItem('flavius_armfit_on')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2000);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  const r={baked:ARM_FIT.galea.w===39&&ARM_FIT.thorax.w===111&&ARM_FIT.provmanica.at==='fore',data:ARM.provmanica.pt==='lower'&&ARM.legwrapsU.n==='Leather Upper Leg Armor',
    noPairs:!Object.keys(ARM_PAIR).length,legMirror:armBox('femoralia','lleg').mirror===true&&armBox('femoralia','rleg').mirror===false,
    turn:(()=>{ARM_FIT_OVR.manica={r:20};const a=armBox('manica','rarm'),c=armBox('manica','larm');delete ARM_FIT_OVR.manica;return a.r===20&&c.r===20&&a.side===false&&c.side===true})()};
  ST.gearSub='a';ST.ca=blankCA();openStudio('gear');await W8(900);r.hidden=!document.querySelector('.afit');r.vb=(document.querySelector('#caAv svg').getAttribute('viewBox')||'').startsWith('0 -18');
  CHEATS['h3828236272'].run();await W8(500);r.shown=!!document.querySelector('.afit #afPrev2');
  const pick=async k=>{const s=document.querySelector('[data-afkey]');s.value=k;s.dispatchEvent(new Event('change',{bubbles:true}));await W8(300)};
  await pick('spaulder');const sv=document.querySelector('#afPrev2 svg').innerHTML;r.one=(sv.match(/class="armpc"/g)||[]).length===1;r.noChips=!/r="9"/.test(sv);
  await pick('ocrea');r.pairBoth=(document.querySelector('#afPrev2 svg').innerHTML.match(/class="armpc"/g)||[]).length===2;
  document.querySelector('[data-afside="L"]').click();await W8(300);const i=document.querySelector('[data-afit2="dx"]');i.value=-12;i.dispatchEvent(new Event('input',{bubbles:true}));await W8(200);
  r.left=!!ARM_FIT_OVR.ocrea&&ARM_FIT_OVR.ocrea.L&&ARM_FIT_OVR.ocrea.L.dx===-12&&!('dx' in ARM_FIT_OVR.ocrea)&&armBox('ocrea','lleg').cx===EQ_L.shin[0]+12&&armBox('ocrea','rleg').cx===EQ.shin[0]+(ARM_FIT.ocrea.dx||0);
  document.querySelector('[data-afact2="reset"]').click();await W8(300);r.leftReset=!ARM_FIT_OVR.ocrea||!ARM_FIT_OVR.ocrea.L;
  document.querySelector('[data-afhide]').click();await W8(300);r.hid=!document.querySelector('.afit')&&localStorage.getItem('flavius_armfit_on')!=='1';
  r.cheatHidden=!document.documentElement.innerHTML.includes(String.fromCharCode(65,82,77,79,82,70,73,84));return r});
/* drag on the left side moves it the way the pointer goes */
await pg.evaluate(async()=>{CHEATS['h3828236272'].run();await new Promise(r=>setTimeout(r,500));const s=document.querySelector('[data-afkey]');s.value='cnemis';s.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,300));document.querySelector('[data-afside="L"]').click();await new Promise(r=>setTimeout(r,300));document.querySelector('.afit').scrollIntoView()});
const x0=await pg.evaluate(()=>armBox('cnemis','lleg').cx);const bx=await pg.locator('#afPrev2 svg').boundingBox();
await pg.mouse.move(bx.x+bx.width*0.6,bx.y+bx.height*0.8);await pg.mouse.down();await pg.mouse.move(bx.x+bx.width*0.7,bx.y+bx.height*0.8,{steps:4});await pg.mouse.up();await pg.waitForTimeout(300);
o.drag=await pg.evaluate(x0=>{const x1=armBox('cnemis','lleg').cx;delete ARM_FIT_OVR.cnemis;afitSave();localStorage.removeItem('flavius_armfit_on');return x1>x0+5},x0);
const a=o.a;ok(a.baked&&a.data,'baked fits + data');ok(a.noPairs&&a.legMirror,'legs mirror one art');ok(a.turn,'turn by side');ok(a.vb,'avatar sits lower');
ok(a.hidden&&a.shown&&a.hid&&a.cheatHidden,'fit tool behind its code');ok(a.one&&a.noChips&&a.pairBoth,'tool preview');ok(a.left&&a.leftReset,'left side fit');ok(o.drag,'drag follows the pointer');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
