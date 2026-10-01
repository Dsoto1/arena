const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});openManager()});await pg.waitForTimeout(600);
const li=await pg.evaluate(()=>{const w=W_();const other=[1,2,3,4,5,6,7,8,9,10,11,12].find(i=>i!==w.night.loc&&LOCATIONS[i]);return {host:w.night.loc,other}});
// visit a city that is NOT hosting
await pg.evaluate(o=>{const cm=document.getElementById('modal');if(CUR_MODAL)CUR_MODAL.done('close');setTimeout(()=>openCitySquare(o.other,{}),300)},li);
await pg.waitForTimeout(1500);
const a=await pg.evaluate(()=>({open:CITY.open,leave:document.getElementById('cityLeave').textContent,here:cityGamesHere()}));
await pg.evaluate(()=>cityShopPanel('arena'));await pg.waitForTimeout(300);
const b1=await pg.evaluate(()=>{const p=document.getElementById('cityPanel');return p&&!p.hidden?p.textContent.slice(0,160):null});
await pg.screenshot({path:'city_sealed.png'});
// walk onto the gate: must not enter
await pg.evaluate(()=>{CITY.path=[[CITY_GATE[0],CITY_GATE[1]]];CITY.stepT=0});await pg.waitForTimeout(800);
const c=await pg.evaluate(()=>({open:CITY.open,pr:CITY.player.r}));
// exit → ludus tab
await pg.evaluate(()=>cityExit());await pg.waitForTimeout(1800);
const d=await pg.evaluate(()=>({city:CITY.open,title:$('#mTitle').textContent.slice(0,20),tab:MGR.tab}));
// recruit card labels
const lbl=await pg.evaluate(()=>{const r=CROWD_CACHE[0];if(!r)return 'no regulars';const o={};r.recruited=1;o.yes=(spectInspectorHTML(r).match(/YES[^<]*/)||[''])[0];r.recruited=0;r.signAsked=1;o.no=(spectInspectorHTML(r).match(/NO[^<]*/)||[''])[0];r.signAsked=0;return o});
console.log(JSON.stringify({li,a,b1,c,d,lbl}),errs.slice(0,4));await b.close()})();
