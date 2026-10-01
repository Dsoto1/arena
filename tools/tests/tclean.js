const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
await pg.evaluate(()=>{$('#modal').hidden=true;SETTINGS.tokenStyle='figure';startEvent({ev:'democritus',loc:6,seats:['soldier','hero','slave','royalty'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:0}});SPEED='pause'});
await pg.waitForTimeout(1600);
// dress the sand: dead NPC corpse, displaced NPC, toppled pillar, empty pots, spikes, moved chest
await pg.evaluate(()=>{
  spawnNPC('wolf','Lupa',[2,8]);spawnNPC('bear','Ursa',[9,2]);
  const w=S.npcs.find(n=>n.t==='wolf');hurtNPC(w,99,S.players[0],'test');
  const bear=S.npcs.find(n=>n.t==='bear');bear.r=5;bear.c=5;
  const pl=S.pillars[1];S.pillars=S.pillars.filter(x=>x!==pl);(S.rubble=S.rubble||[]).push({r:pl.r,c:pl.c,dr:0,dc:1});
  S.pillars[0].pots=[];
  S.spikes.push({r:3,c:9},{r:4,c:9});
  S.chest.r=2;S.chest.c=3;
  // corpse states mid-match
  const p2=S.players[1];p2.hp.rarm=0;p2.hp.chest=0;eliminate(p2,{type:'player',p:S.players[0]});
  draw()});
await pg.waitForTimeout(600);await pg.evaluate(()=>draw());
await pg.screenshot({path:'cl_mid.png',clip:{x:100,y:60,width:1100,height:760}});
const mid=await pg.evaluate(()=>({piles:S.piles.filter(p=>p.corpse).length,deadNpc:S.npcs.filter(n=>!n.alive).length,blood:S.blood.length}));
// end the event: eliminate two more, leaving one winner; then stamp a Charun fate on the fallen hero
await pg.evaluate(()=>{eliminate(S.players[2],{type:'player',p:S.players[0]});eliminate(S.players[3],{type:'player',p:S.players[0]})});
await pg.waitForTimeout(1200);
await pg.evaluate(()=>{const r=S.lastResult&&S.lastResult.rows&&S.lastResult.rows.find(x=>x.id===1);if(r)r.fate='Fatal Charades · Charun'});
const over=await pg.evaluate(()=>({over:!!(S&&S.over),rows:S.lastResult?S.lastResult.rows.map(r=>r.fate):null}));
console.log('OVER',JSON.stringify(over));
// wait for the show to start (4.2s after gameOver) and shoot phases
await pg.waitForTimeout(4500);
await pg.evaluate(()=>{const m=document.getElementById('modal');if(m)m.hidden=true});
await pg.screenshot({path:'cl_ph1.png',clip:{x:100,y:60,width:1100,height:760}});
for(let i=0;i<10;i++){await pg.waitForTimeout(2600);
  const st=await pg.evaluate(()=>S.clean?{ph:CLEAN_ORDER[S.clean.phase],esc:S.clean.esc,ch:!!S.clean.ch}:null);
  console.log('tick',i,JSON.stringify(st));
  if(i===1)await pg.screenshot({path:'cl_ph2.png',clip:{x:100,y:60,width:1100,height:760}});
  if(i===3)await pg.screenshot({path:'cl_ph3.png',clip:{x:100,y:60,width:1100,height:760}});
  if(!st)break}
const fin=await pg.evaluate(()=>({clean:!!S.clean,blood:(S.blood||[]).length,corpses:S.piles.filter(p=>p.corpse&&!p.gone).length,
  deadShown:S.npcs.filter(n=>!n.alive&&!n.gone).length,rubble:(S.rubble||[]).length,pillars:S.pillars.length,pots0:S.pillars[0]?S.pillars[0].pots.length:-1,
  spikes:S.spikes.length,chest:S.chest?[S.chest.r,S.chest.c]:null,init:S.init&&S.init.chest,bearHome:(()=>{const b2=S.npcs.find(n=>n.t==='bear');return b2?[b2.r,b2.c,b2.sr,b2.sc]:null})(),
  standing:S.players.filter(p=>p.alive&&!p.exited).length,
  logTail:[...document.querySelectorAll('#log .thought,#log .big')].slice(-8).map(x=>x.textContent.slice(0,90))}));
await pg.screenshot({path:'cl_done.png',clip:{x:100,y:60,width:1100,height:760}});
console.log('MID',JSON.stringify(mid));console.log('FIN',JSON.stringify(fin,null,1));console.log('ERRS',errs.slice(0,6));
// scenario 2: interrupt the show with cleanFinishNow
await pg.evaluate(()=>{startEvent({ev:'democritus',loc:6,seats:['soldier','hero'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:0}});SPEED='pause'});
await pg.waitForTimeout(1400);
await pg.evaluate(()=>{eliminate(S.players[1],{type:'player',p:S.players[0]})});
await pg.waitForTimeout(4800);
const midShow=await pg.evaluate(()=>!!S.clean);
await pg.evaluate(()=>cleanFinishNow());
const fin2=await pg.evaluate(()=>({clean:!!S.clean,blood:(S.blood||[]).length,corpses:S.piles.filter(p=>p.corpse&&!p.gone).length,standing:S.players.filter(p=>p.alive&&!p.exited).length}));
console.log('MIDSHOW',midShow,'FIN2',JSON.stringify(fin2));console.log('ERRS2',errs.slice(0,6));
await b.close()})();