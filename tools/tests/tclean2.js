const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
await pg.evaluate(()=>{$('#modal').hidden=true;SETTINGS.tokenStyle='figure';startEvent({ev:'democritus',loc:6,seats:['soldier','hero'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:24}});SPEED='pause'});
await pg.waitForTimeout(2200);
await pg.evaluate(()=>{const m=document.getElementById('modal');if(m)m.hidden=true;
  placeFloor('offer','elix2',5,7);placeFloor('key','key',7,9);
  S.piles.push({id:9999,owner:0,color:'#e07b9a',name:'Dropped kit',corpse:false,r:8,c:3,weapons:[mkW('gladius')],armor:[],coin:3,items:[]});
  S.ri=2; // late round: the zone ropes are up
  eliminate(S.players[1],{type:'player',p:S.players[0]});
  draw()});
await pg.waitForTimeout(3500);
const before=await pg.evaluate(()=>({floor:S.floor.length,piles:S.piles.filter(p=>!p.gone&&(p.corpse||!pileEmpty(p))).length,spect:S.spect.filter(x=>!x.gone).length,zoneFull:!!S.zoneFull}));
// run the show to the end (speed it up by ticking manually? just wait — ~25s worst case)
let fin=null;
for(let i=0;i<30;i++){await pg.waitForTimeout(2000);fin=await pg.evaluate(()=>({clean:!!S.clean,ph:S.clean?CLEAN_ORDER[S.clean.phase]:null,floor:S.floor.length,spectLeft:S.spect.filter(x=>!x.gone).length,zoneFull:!!S.zoneFull}));
  if(!fin.clean)break}
const final=await pg.evaluate(()=>({floor:S.floor.length,lootPiles:S.piles.filter(p=>!p.gone&&!p.corpse&&!pileEmpty(p)).length,corpses:S.piles.filter(p=>p.corpse&&!p.gone).length,spectLeft:S.spect.filter(x=>!x.gone).length,zoneFull:!!S.zoneFull}));
await pg.screenshot({path:'cl2_done.png',clip:{x:100,y:60,width:1100,height:760}});
console.log('BEFORE',JSON.stringify(before));console.log('FIN',JSON.stringify(fin),'FINAL',JSON.stringify(final));console.log('ERRS',errs.slice(0,5));
await b.close()})();
