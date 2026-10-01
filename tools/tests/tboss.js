const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{$('#modal').hidden=true;startEvent({ev:'democritus',loc:6,seats:['soldier','hero'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:0}});SPEED='pause'});
await pg.waitForTimeout(1800);
const r=await pg.evaluate(()=>{const n1=spawnNPC('tholo','Tholo');const t1=S.npcs.find(n=>n.t==='tholo');t1.alive=false; // Tholo dies
  const n2=spawnNPC('tholo','Tholo'); // chant / card after death → refused
  spawnNPC('lion','Leo');spawnNPC('lion','Leaena');const l3=spawnNPC('lion','Leo');
  const c1=spawnNPC('commodus','Commodus');const c2=spawnNPC('commodus','Commodus');
  return {tholoFirst:!!n1,tholoSecond:!!n2,tholos:S.npcs.filter(n=>n.t==='tholo').length,lions:S.npcs.filter(n=>n.t==='lion').length,leoAgain:!!l3,commodus:S.npcs.filter(n=>n.t==='commodus').length,c2:!!c2}});
console.log(JSON.stringify(r),errs.slice(0,3));await b.close()})();
