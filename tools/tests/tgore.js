const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
await pg.evaluate(()=>{$('#modal').hidden=true;SETTINGS.tokenStyle='figure';startEvent({ev:'democritus',loc:6,seats:['soldier','hero','slave','royalty'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:0}});SPEED='pause'});
await pg.waitForTimeout(1500);
await pg.evaluate(async()=>{const [p1,p2,p3]=S.players;
  p1.hp.rarm=0;p2.hp.rleg=0;p2.hp.lleg=0;p3.hp.larm=0;p3.hp.rleg=0;
  bloodAt(p1.r,p1.c,'limb');bloodAt(p2.r,p2.c,'limb');bloodAt(4,4,'elim');bloodAt(4,5,'drop');bloodAt(5,5,'drop');bloodAt(6,5,'drop');
  draw()});
await pg.waitForTimeout(600);await pg.evaluate(()=>draw());await pg.screenshot({path:'go_board.png',clip:{x:100,y:120,width:1000,height:700}});
// clean crew
await pg.evaluate(()=>{S.over=true;startCleanCrew()});await pg.waitForTimeout(2500);await pg.screenshot({path:'go_clean.png',clip:{x:100,y:120,width:1000,height:700}});
const left=await pg.evaluate(()=>S.blood.length);
await pg.waitForTimeout(4500);const after=await pg.evaluate(()=>({blood:S.blood.length,crew:!!S.clean}));
console.log(JSON.stringify({left,after}),errs.slice(0,4));await b.close()})();
