const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const r=await pg.evaluate(async()=>{$('#modal').hidden=true;
  newWorld({type:'custom',spectOK:true,mgr:{name:'Test',ludus:'Ludus T',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});
  const w=W_();const m=me();m.fame=20;const g=rosterOf(m)[0];
  startEvent({ev:'democritus',loc:6,seats:['soldier','hero','slave'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:'auto'}});SPEED='pause';
  await new Promise(r=>setTimeout(r,1500));
  S.mgrCtx={cid:w.id,week:w.week,bout:0,name:m.name};S.players[0].mgrGid=g.id;
  const price=ticketPrice();
  spectHelpCheck('offer',S.players[1]); // not mine: no cost
  const f1=m.fame;
  spectHelpCheck('offer',S.players[0]);spectHelpCheck('stone',S.players[1]);spectHelpCheck('stone',S.players[2]);spectHelpCheck('offer',S.players[0]);
  return {spectOK:w.spectOK,price,f1,f2:m.fame,hit:SPECT.fameHit}});
// the creation form toggle
await pg.evaluate(()=>{S.over=true;openManager()});await pg.waitForTimeout(800);
const h=await pg.evaluate(()=>{const out={};try{const w=W_();if(!w.night&&typeof ensureNight==="function")ensureNight();out.night=/data-mg="spect"/.test(nightHTML());out.nightHas=!!w.night}catch(e){out.err=String(e)}MGR.view="create";NEWMGR={name:"a",ludus:"b",city:"Roma",color:"#c00",p:{...MGR_PRESETS.balanced[1]},portrait:{}};try{out.create=/data-nmspect/.test(startHTML())}catch(e){out.err2=String(e)}return out});console.log(JSON.stringify(h));
console.log(JSON.stringify(r),errs.slice(0,4));await b.close()})();
