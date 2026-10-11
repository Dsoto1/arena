const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [w,h,n] of [[1440,900,'desk'],[844,390,'phoneL']]){const p=await b.newPage({viewport:{width:w,height:h}});
await p.addInitScript(()=>{try{localStorage.flavius_firstrun='shown'}catch(e){}Object.defineProperty(navigator,'webdriver',{get:()=>false})});
await p.goto('file://'+process.cwd()+'/flavius-arena.html');await p.waitForFunction('window.FLAVIUS_READY',null,{timeout:30000});
await p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:false},{cls:'hero',cpu:true},{cls:'slave',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:'auto',mandata:true}});await W8(2800);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}await W8(800)});
await p.waitForSelector('#status .roundmk',{timeout:20000}).catch(()=>{});
await p.waitForTimeout(800);
const el=await p.$('#status');if(el)await el.screenshot({path:`tools/plans/round100/status_${n}.png`});
await p.screenshot({path:`tools/plans/round100/full_${n}.png`});
console.log(n,await p.evaluate(()=>{const m=document.querySelector('.roundmk');return m&&[m.getBoundingClientRect().width,m.getBoundingClientRect().height,m.parentElement.getBoundingClientRect().height]}))}
await b.close()})()
