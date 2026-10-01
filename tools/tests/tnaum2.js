const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
await pg.evaluate(()=>{$('#modal').hidden=true;startEvent({ev:'naumachia',loc:6,seats:['soldier','hero','slave','royalty','amazonia','veteranus'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:0}});SPEED='pause'});
await pg.waitForTimeout(3500);await pg.mouse.click(620,600);
const pre=await pg.evaluate(()=>({naum:isNaum(),wt:(S.waterTok||[]).length,ph:S.phase}));
await pg.evaluate(()=>{const m=document.getElementById('modal');if(m)m.hidden=true;const a=S.players.filter(p=>p.alive);const t0=a[0].team;for(const q of a)if(q.team!==t0)eliminate(q,{type:'player',p:a[0]})});
await pg.waitForTimeout(3000);await pg.evaluate(()=>{const bb=[...document.querySelectorAll('#mBtns .btn')].find(x=>/Look at the board/.test(x.textContent));if(bb)bb.click()});
let shot=0;const seen=[];
for(let i=0;i<170;i++){await pg.waitForTimeout(700);const st=await pg.evaluate(()=>S.clean?{ph:CLEAN_ORDER[S.clean.phase],wt:(S.waterTok||[]).length,dl:S.drainLine,dr:!!S.drained}:null);
  if(st&&!seen.includes(st.ph))seen.push(st.ph);
  if(st&&st.ph==='drain'&&!shot){shot=1;await pg.screenshot({path:'naum_drain.png',clip:{x:100,y:60,width:1100,height:760}})}
  if(!st&&i>3)break}
await pg.screenshot({path:'naum_done.png',clip:{x:100,y:60,width:1100,height:760}});
const fin=await pg.evaluate(()=>({pillars:S.pillars.map(p=>p.r+','+p.c+':'+p.pots.length).join(' '),chest:S.chest&&[S.chest.r,S.chest.c],cleanDone:!!S.cleanDone,drained:!!S.drained,wt:(S.waterTok||[]).length,zone:!!S.zoneFull}));
console.log(JSON.stringify({pre,seen,fin}),errs.slice(0,4));await b.close()})();
