/* tv100c — the City Square opens with the crowd ready and walking out of step (279-v100city) */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const fails=[];const ok=(c,m)=>{if(!c)fails.push(m)};
async function run(calm){
  const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(()=>{try{localStorage.flavius_firstrun='shown'}catch(e){}});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000}).catch(()=>{});await pg.waitForTimeout(600);
  await pg.evaluate(()=>{window.travelOK=()=>true;window.travelBlock=()=>false});await pg.click('#mClose').catch(()=>{});
  const o=await pg.evaluate(async(calm)=>{
    newWorld({type:'pre',key:MGR_PRE[0].key});if(calm)SETTINGS.calm=true;
    const R={cover:false,lt:[],loop:[],pos0:null,moved:false,first:{}};
    const lb=cityLoop;cityLoop=function(){const t=performance.now();const r=lb.apply(this,arguments);if(CITY.shown100)R.loop.push(performance.now()-t);return r};
    openCitySquare(W_().night.loc,{prematch:true});
    R.cover=document.getElementById('cityFade').classList.contains('hold100');
    const key=()=>CITY.npcs.map(n=>n.r+','+n.c).join('|');
    let k0=null;
    for(let i=0;i<400&&!CITY.shown100;i++){await new Promise(r=>setTimeout(r,25));if(k0===null)k0=key()}
    R.shown=!!CITY.shown100;R.warmMs=CITY.warmMs100;R.movedDuringWarm=k0!==null&&!CITY.shown100?false:undefined;
    const im=city100Imgs();R.imgs=im;
    const now=performance.now();const due=CITY.npcs.filter(n=>!n.static&&!n.leaving).map(n=>Math.round((n.t0||0)+(n.wt||0)-now));
    R.due=due;R.coverGone=!document.getElementById('cityFade')||!document.getElementById('cityFade').classList.contains('hold100');R.cut=document.getElementById('cityFade')&&document.getElementById('cityFade').classList.contains('cut100');
    const p0=key();const t0=performance.now();let mv=null;
    for(let i=0;i<120;i++){await new Promise(r=>setTimeout(r,25));if(key()!==p0){mv=Math.round(performance.now()-t0);break}}
    R.firstMove=mv;await new Promise(r=>setTimeout(r,1500));
    R.maxLoop=Math.round(Math.max(0,...R.loop));R.over100=R.loop.filter(x=>x>100).length;R.n=CITY.npcs.length;
    return R},calm);
  await pg.close();return {o,errs}}
const A=await run(false);const o=A.o;
ok(o.cover,'cover (hold100) is up when the square opens');ok(o.shown,'square revealed');
ok(o.imgs.total>=15&&o.imgs.ready===o.imgs.total,'every figure image decoded at reveal '+JSON.stringify(o.imgs));
ok(o.coverGone,'cover lifted');
const d=o.due.slice().sort((a,b)=>a-b);
ok(new Set(d.map(x=>Math.round(x/100))).size>=8,'start phases differ '+d.join(','));
ok(d.length&&d[0]<=300,'a walker is due within 300 ms of the reveal: '+d[0]);
ok(d.length&&d[d.length-1]-d[0]>=600,'phases spread over time');
ok(o.firstMove!=null&&o.firstMove<=3000,'a figure moved soon after reveal: '+o.firstMove);
ok(o.over100<=1&&o.maxLoop<=250,'no long loop frame after the reveal (>100 ms at most once, none >250): '+o.maxLoop+' x'+o.over100);
const B=await run(true);
ok(B.o.shown&&B.o.cut,'Reduce motion: cover cuts, square still opens '+JSON.stringify({s:B.o.shown,c:B.o.cut}));
const errs=A.errs.concat(B.errs);
console.log(JSON.stringify({warm:o.warmMs,maxLoop:o.maxLoop,firstMove:o.firstMove,due:d.slice(0,6),imgs:o.imgs,fails}),'ERRS',JSON.stringify(errs.slice(0,5)));
await b.close();process.exit(fails.length||errs.length?1:0)})();
