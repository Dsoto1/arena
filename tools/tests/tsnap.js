const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{POPPED.add('firstTurn');const seats=[{cls:'soldier',cpu:false,name:'Me'},{cls:'hero',cpu:true,name:'B'},{cls:'slave',cpu:true,name:'C'}].map(s=>({...s,pers:finalPers(s)}));startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:0}})});
for(let i=0;i<40;i++){if(await pg.evaluate(()=>S.phase==='choice'&&humanTurn()))break;await pg.waitForTimeout(300);await pg.evaluate(()=>{const m=document.getElementById('modal');if(!m.hidden){const b=document.querySelector('#mBtns button');b&&b.click()}})}
// hand me to the CPU from my board
const chip=await pg.evaluate(()=>{const c=document.querySelector('[data-seat="0"]');return c&&c.textContent});
await pg.click('[data-seat="0"]');await pg.waitForTimeout(1500);
const handed=await pg.evaluate(()=>({cpu:S.players[0].cpu,cur:cur().name}));
// take back a different gladiator
const c1=await pg.evaluate(()=>{S.players[1].cpu;return !!document.querySelector('#pboard')});
await pg.evaluate(()=>seatToggle(S.players[1]));await pg.waitForTimeout(300);
const took=await pg.evaluate(()=>S.players[1].cpu);
// snap
const t0=Date.now();await pg.evaluate(()=>{try{localStorage.setItem('flavius_ctopen','1');ctSync()}catch(e){}}).then(()=>pg.click('#btnSimEnd'));await pg.waitForTimeout(300);await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(x=>/Sim to end/.test(x.textContent));b&&b.click()});
let done=false;for(let i=0;i<120;i++){done=await pg.evaluate(()=>S.over);if(done)break;await pg.waitForTimeout(250)}
const ms=Date.now()-t0;const fin=await pg.evaluate(()=>({over:S.over,snap:S.snap,title:document.getElementById('mTitle').textContent.slice(0,40),speed:SPEED}));
console.log(JSON.stringify({chip,handed,took,ms,fin}),errs.slice(0,3));await b.close()})();
