const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const out={};
// custom char lifecycle
out.kaeso=await pg.evaluate(async()=>{
  ST.tab='chars';ST.draft={name:'Kaeso Corvina Strabo',city:'Roma',color:'#8a5cc0',pers:{aggression:50,hunt:50,cf:50,coin:50,survival:50,loyalty:50},abil:'none',weak:'none',portrait:{skin:'#e0ac7e',hair:'#4a2c17'},hp:{},loadout:{}};
  let d;try{d=await stSaveDraft()}catch(e){return 'save failed '+e.message}
  const c=CUSTOM.chars.find(x=>x.id===d.id);const r={newIsDesign:!onRolls(c),inSetup:allowedClasses(EVENTS.democritus).includes('cc_'+c.id)};
  c.rolls=true;r.afterAdd=allowedClasses(EVENTS.democritus).includes('cc_'+c.id);
  // simulate a death being logged
  S={...(S||{}),locIdx:6,evKey:'democritus',exhib:false};const x={p:{cls:'cc_'+c.id,coin:0,trophies:[],stats:{}},f:4,won:false,fate:['Damnatio · Ad Memoriae','']};
  await logCustomChars([x]);r.status=c.status;r.gone=!allowedClasses(EVENTS.democritus).includes('cc_'+c.id);
  newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});
  r.notInLeague=!W_().glads.some(g=>g.srcId===c.id);return r});
// post-match windows via peek
await pg.reload();await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{SPEED='fast';SPEEDMUL.fast=0;startEvent({ev:'egidious',loc:2,seats:[{cls:'soldier',cpu:true,diff:'hard'},{cls:'hero',cpu:true,diff:'hard'},{cls:'slave',cpu:true,diff:'hard'},{cls:'venatore',cpu:true,diff:'hard'}],opts:{mods:true,mandata:true,optOffers:true,eaglePot:true,spect:'auto'}});SPEED='fast'});
for(let i=0;i<150;i++){await pg.waitForTimeout(1000);if(await pg.evaluate(()=>S.over&&!$('#modal').hidden))break}
out.closeX=await pg.evaluate(()=>!$('#mClose').hidden);out.mt=await pg.evaluate(()=>$('#mTitle').textContent);console.log('MT',out.mt,out.closeX);
await pg.click('#mClose');await pg.waitForTimeout(400);await pg.evaluate(()=>document.getElementById('btnDrawS').click());await pg.waitForTimeout(700);out.imperiumOverResults=await pg.evaluate(()=>!!document.querySelector('#standsHubBody'));
await pg.click('#mClose');await pg.waitForTimeout(300);
await pg.evaluate(()=>{openMenagerie()});await pg.waitForTimeout(700);out.menag=await pg.evaluate(()=>!!document.querySelector('#menagBody'));
await pg.click('#mClose');await pg.waitForTimeout(300);
await pg.click('#btnGraph');await pg.waitForTimeout(700);out.graphVisible=await pg.evaluate(()=>{const g=$('#rtab-graph');return !!g&&!g.hidden&&!!g.querySelector('svg')});
console.log(JSON.stringify({out,errs:errs.slice(0,4)},null,1));await b.close()})();
