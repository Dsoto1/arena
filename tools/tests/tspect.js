const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(async()=>{$('#modal').hidden=true;await quickLanista();$('#modal').hidden=true;});
await pg.waitForTimeout(500);
const coin0=await pg.evaluate(async()=>(await getPurse()).coin);
await pg.evaluate(()=>{startEvent({ev:'democritus',loc:6,seats:['soldier','hero','slave'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:'auto'}});SPEED='fast'});
await pg.waitForTimeout(3000);
const vis=await pg.evaluate(()=>({btn:!$('#btnTicket').hidden,txt:$('#btnTicket').textContent,ok:ticketOK()}));
await pg.click('#btnTicket');await pg.waitForTimeout(600);
const mt=await pg.evaluate(()=>$('#mTitle').textContent);
await pg.screenshot({path:'seatmap.png'});await pg.evaluate(()=>{const b=document.querySelector('[data-seatsec]:not([disabled])');b.click()});
await pg.waitForTimeout(700);
const favT=await pg.evaluate(()=>document.getElementById('mTitle').textContent);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')][0];b&&b.click()});await pg.waitForTimeout(600);
const after=await pg.evaluate(async()=>({me:S.spect.filter(s=>s.human).map(s=>[s.name,s.sec,s.cf]),coin:(await getPurse()).coin,btn:!$('#btnTicket').hidden,betNet:(await activeMgr()).betNet}));
// wait for the spectator's own upkeep window
let up=null;for(let i=0;i<80;i++){up=await pg.evaluate(()=>!$('#modal').hidden&&/Spectator upkeep/.test($('#mTitle').textContent)?$('#mTitle').textContent:null);if(up)break;await pg.waitForTimeout(250)}
await pg.screenshot({path:'spect_a.png'});
console.log(JSON.stringify({coin0,vis,mt,favT,after,fav:await pg.evaluate(()=>S.spect.find(s=>s.human).fav),up}),errs.slice(0,4));await b.close()})();
