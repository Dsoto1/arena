const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.evaluate(()=>{window.travelOK=()=>true;window.travelBlock=()=>false});await pg.click('#mClose');
await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});me().coin=500;openCitySquare(W_().night.loc,{prematch:true})});
await pg.waitForTimeout(2500);await pg.evaluate(()=>{CITY.beastT=0});await pg.waitForTimeout(1500);await pg.screenshot({path:'c_sq.png'});
// click an npc: pick a spec npc coords
const out={};out.n=await pg.evaluate(()=>CITY.npcs.length);
await pg.evaluate(()=>{const n=CITY.npcs.find(x=>x.kind==='spec')||CITY.npcs[0];citySelect(n)});await pg.waitForTimeout(300);await pg.screenshot({path:'c_spec.png'});
await pg.evaluate(()=>citySelect({kind:'auction'}));await pg.waitForTimeout(300);await pg.screenshot({path:'c_auc.png'});
out.lot=await pg.evaluate(()=>cityAuctionLot().map(g=>[g.name,g.woe,g.price,!!g.gemHid]));
out.buy=await pg.evaluate(()=>{const g=cityAuctionLot()[0];if(g){cityBuyLot(g.id);return [g.name,!!g.contract,me().coin]}return null});
await pg.evaluate(()=>cityShopPanel('arms'));await pg.waitForTimeout(250);await pg.screenshot({path:'c_arms.png'});
out.kit=await pg.evaluate(()=>{cityBuyKit('mw2',12);const g=rosterOf(me()).sort((a,b)=>effOvr(b)-effOvr(a))[0];return [g.name,g.kit,me().coin]});
out.seat=await pg.evaluate(()=>{const g=rosterOf(me()).sort((a,b)=>effOvr(b)-effOvr(a))[0];const st=seatFor(g);return st.festItems});
await pg.evaluate(()=>cityHorns());await pg.waitForTimeout(2600);await pg.screenshot({path:'c_horns.png'});
await pg.evaluate(()=>cityEnterArena());await pg.waitForTimeout(1200);out.after=await pg.evaluate(()=>({open:CITY.open,tab:typeof MGR!=='undefined'?MGR.tab:null,modal:!$('#modal').hidden}));
await pg.waitForTimeout(600);await pg.screenshot({path:'c_arena.png'});
console.log(JSON.stringify(out),errs.slice(0,5));await b.close()})();
