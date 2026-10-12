/* node tools/plans/pn100/shots.js <page> [only,...] — the v1.0 Play Now screens (300-v100pn) at 1440×900 and 390×844 → tools/plans/pn100/*.png
   Compare with tools/plans/mock100/pn_*.png (the approved mock). OFF=1 shoots the kill-switch state (prefix off_). */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const page=path.resolve(process.argv[2]);const only=(process.argv[3]||'').split(',').filter(Boolean);const OUTD=__dirname;const pre=process.env.OFF?'off_':'';
const b=await chromium.launch();
const open=async(w,h)=>{const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:w<600?2:1});await pg.route(/fonts\.g/,r=>r.abort());
  pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.addInitScript(off=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(off)localStorage.setItem('flavius_pn100off','1')},!!process.env.OFF);
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}});return pg};
const S=[
 ['pn',1440,900,async pg=>{await pg.evaluate(()=>{openSetup(true)})}],
 ['pn_who',1440,900,async pg=>{await pg.evaluate(()=>{openSetup(true)});await pg.waitForTimeout(900);await pg.evaluate(()=>{const w=document.querySelector('#mBody .pn-who');if(w)w.scrollIntoView()})}],
 ['pn_lock',1440,900,async pg=>{await pg.evaluate(()=>{openSetup(true)});await pg.waitForTimeout(900);await pg.evaluate(()=>{const b=document.querySelector('#mBody [data-pn100follow="on"]');if(b)b.click()})}],
 ['pn_opts',1440,900,async pg=>{await pg.evaluate(()=>{openSetup(true)});await pg.waitForTimeout(900);await pg.evaluate(()=>{const b=document.querySelector('#mBody [data-pn100follow="on"]');if(b)b.click()});await pg.waitForTimeout(400);await pg.evaluate(()=>{const o=document.querySelector('#mBody .pn100opt');if(o)o.scrollIntoView()})}],
 ['hotseat',1440,900,async pg=>{await pg.evaluate(()=>{hotSeatOpen()})}],
 ['hotseat_who',1440,900,async pg=>{await pg.evaluate(()=>{hotSeatOpen()});await pg.waitForTimeout(900);await pg.evaluate(()=>{const w=document.querySelector('#mBody .pn-who');if(w)w.scrollIntoView()})}],
 ['submenu',1440,900,async pg=>{await pg.evaluate(()=>{playNowMenu()})}],
 ['submenu_mgr',1440,900,async pg=>{await pg.evaluate(async()=>{try{await Store.put('mgrCareers','shot100',{id:'shot100',ludus:'Ludus Aurelius',name:'Marcus',season:1,week:3,updated:'today'})}catch(e){}managerMenu()})}],
 ['pn_390',390,844,async pg=>{await pg.evaluate(()=>{openSetup(true)})}],
 ['pn_390b',390,844,async pg=>{await pg.evaluate(()=>{openSetup(true)});await pg.waitForTimeout(900);await pg.evaluate(()=>{const w=document.querySelector('#mBody .pn100what');if(w)w.scrollIntoView()})}],
 ['pn_390c',390,844,async pg=>{await pg.evaluate(()=>{openSetup(true)});await pg.waitForTimeout(900);await pg.evaluate(()=>{const w=document.querySelector('#mBody .pn-who');if(w)w.scrollIntoView()})}],
 ['hotseat_390',390,844,async pg=>{await pg.evaluate(()=>{hotSeatOpen()})}],
 ['submenu_390',390,844,async pg=>{await pg.evaluate(()=>{playNowMenu()})}],
 ['ribbon',1440,900,async pg=>{await pg.evaluate(()=>{hotSeatOpen()});await pg.waitForTimeout(1200);
   await pg.evaluate(async()=>{CFG.seats.forEach((s,i)=>{s.cpu=i>=2});pnRedraw75();await new Promise(r=>setTimeout(r,300));const I=document.querySelectorAll('#mBody [data-hsn]');
     ['Marcus','Livia'].forEach((n,k)=>{I[k].value=n;I[k].dispatchEvent(new Event('input',{bubbles:true}))});const mm=document.getElementById('mainMenu');if(mm)mm.hidden=true;document.getElementById('goBtn').click();
     for(let i=0;i<80;i++){await new Promise(r=>setTimeout(r,150));const r=document.getElementById('hs100rib');if(r&&r.classList.contains('show'))break;if(CUR_MODAL){const b=document.querySelector('#mBtns button:not([disabled])');if(b)b.click()}}
     clearTimeout(PN100.ribT);hs100Rib(cur()&&!cur().cpu?cur():S.players.find(q=>!q.cpu));clearTimeout(PN100.ribT)});
   await pg.waitForTimeout(450)}],
];
for(const [name,w,h,go] of S){if(only.length&&!only.includes(name))continue;const pg=await open(w,h);await go(pg);await pg.waitForTimeout(name==='ribbon'?0:1300);
  await pg.screenshot({path:path.join(OUTD,pre+name+'.png')});console.log('shot',pre+name);await pg.close()}
await b.close()})();
