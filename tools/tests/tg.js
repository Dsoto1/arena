const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
await pg.evaluate(()=>{openStudio('gear')});await pg.waitForTimeout(700);await pg.screenshot({path:'g_w.png'});
const out=await pg.evaluate(async()=>{const o={};
  // save a weapon on the rolls
  ST.cw=blankCW();Object.assign(ST.cw,{name:'Fang of Verona'});ST.cw.stats={...ST.cw.stats,p:2,r:2,thrN:1,thrP:2,thrR:4};ST.cw.rolls={market:true,loadout:true};
  await gearStudioClick({dataset:{gs:'wsave'}}, ()=>{});o.w=W['cw_'+ST.cw.id];o.mk2=MARKET_W[o.w.lv].includes('cw_'+ST.cw.id);
  o.opts=weaponOpts(3).some(([k])=>k==='cw_'+ST.cw.id);
  o.card=cardHTML('w:cw_'+ST.cw.id,'md').includes('background-image');
  // armor
  ST.ca=blankCA();Object.assign(ST.ca,{name:'Lionheart Cuirass',shape:'muscle',ap:5,lv:3});ST.ca.rolls={market:true};
  await gearStudioClick({dataset:{gs:'asave'}},()=>{});o.a=ARM['ca_'+ST.ca.id];o.mka=MARKET_A[3].includes('ca_'+ST.ca.id);
  o.armCard=cardHTML('a:galea','md').includes('armdrawn');
  return o});
await pg.evaluate(()=>{ST.gearSub='a';document.querySelector('#studio').innerHTML=studioHTML()});await pg.waitForTimeout(500);await pg.screenshot({path:'g_a.png'});
console.log(JSON.stringify(out),errs.slice(0,4));await b.close()})();
