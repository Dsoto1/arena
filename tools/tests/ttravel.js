const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const r=await pg.evaluate(async()=>{newWorld({type:'custom',mgr:{name:'T',ludus:'L',city:'Pola',color:'#c00',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});const w=W_();const m=me();
  const t=travelState(w);const coin0=m.coin;const html=nightHTML();
  const blocked=travelBlock('enter fighters');
  travelClick('travelpay');return {loc:LOCATIONS[w.night.loc].n,home:m.city,cost:t.cost,paid:t.paid,coin:[coin0,m.coin],card:/The road to/.test(html),blocked,after:travelOK(w)}});
await pg.evaluate(()=>{MGR.tab='night';openManager('night')});await pg.waitForTimeout(1200);await pg.screenshot({path:'travel.png'});
// offer path
const r2=await pg.evaluate(()=>{const w=W_();w.night.travel=null;let offered=null;for(let i=0;i<30&&!offered;i++){w.night.travel=null;const t=travelState(w);if(t.offer)offered=t.offer}
  if(!offered)return 'no offer';travelClick('traveldeal');const t=w.night.travel;const pend=t.paid&&!!t.deal;const c0=me().coin;travelWeekEnd(w);return {pend,repaid:c0-me().coin}});
console.log(JSON.stringify({r,r2}),errs.slice(0,3));await b.close()})();
