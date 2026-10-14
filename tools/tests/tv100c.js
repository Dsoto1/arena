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
ok(o.imgs.total>=8&&o.imgs.ready===o.imgs.total,'every figure image decoded at reveal '+JSON.stringify(o.imgs));
ok(o.coverGone,'cover lifted');
const d=o.due.slice().sort((a,b)=>a-b);
ok(new Set(d.map(x=>Math.round(x/100))).size>=8,'start phases differ '+d.join(','));
ok(d.length&&d[0]<=300,'a walker is due within 300 ms of the reveal: '+d[0]);
ok(d.length&&d[d.length-1]-d[0]>=600,'phases spread over time');
ok(o.firstMove!=null&&o.firstMove<=3000,'a figure moved soon after reveal: '+o.firstMove);
ok(o.over100<=1&&o.maxLoop<=250,'no long loop frame after the reveal (>100 ms at most once, none >250): '+o.maxLoop+' x'+o.over100);
const B=await run(true);
ok(B.o.shown&&B.o.cut,'Reduce motion: cover cuts, square still opens '+JSON.stringify({s:B.o.shown,c:B.o.cut}));
/* 280-v100citycalm: Reduce motion = a still crowd, your own walk still lands (as a jump); off again = figures move */
async function calmRun(){
  const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(()=>{try{localStorage.flavius_firstrun='shown'}catch(e){}});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000}).catch(()=>{});await pg.waitForTimeout(600);
  await pg.evaluate(()=>{window.travelOK=()=>true;window.travelBlock=()=>false});await pg.click('#mClose').catch(()=>{});
  const o=await pg.evaluate(async()=>{
    newWorld({type:'pre',key:MGR_PRE[0].key});SETTINGS.calm=true;
    openCitySquare(W_().night.loc,{prematch:true});
    for(let i=0;i<400&&!CITY.shown100;i++)await new Promise(r=>setTimeout(r,25));
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const snap=()=>JSON.stringify([CITY.npcs.filter(n=>!n.leaving).map(n=>[n.r,n.c,n._dr,n._dc,!!n.say]),(CITY.anim89||[]).map(a=>[a.r,a.c])]);
    const R={};await sleep(300);const s0=snap();await sleep(3000);R.still=snap()===s0;R.sayNone=!CITY.npcs.some(n=>n.say);
    /* the player walks: lands, with no glide */
    const P=CITY.player;let tgt=null;for(const d of [[0,1],[1,0],[0,-1],[-1,0],[0,2],[2,0]]){const r=P.r+d[0],c=P.c+d[1];if(!cityBlocked(r,c)&&!CITY.npcs.some(n=>n.r===r&&n.c===c)){tgt=[r,c];break}}
    CITY.path=cityBFS([P.r,P.c],tgt)||[];if(CITY.path.length&&CITY.path[0][0]===P.r&&CITY.path[0][1]===P.c)CITY.path.shift();CITY.stepT=0;
    await sleep(900);R.landed=P.r===tgt[0]&&P.c===tgt[1];R.jump=P._dr===P.r&&P._dc===P.c;
    /* crowd figures are ambient: no hit-test, no hover, no panel; the gate still answers; the sidebar carries their actions */
    {const rc=CITY.cv.getBoundingClientRect();const n=CITY.npcs.find(x=>x._x!=null&&!x.static&&x.kind!=='auct');
      const ev=n?{clientX:rc.left+n._x,clientY:rc.top+n._y-CITY.TW*0.45}:null;R.figFound=!!n;
      if(n){const h=cityAt(ev);R.figNoHit=!h.npc;cityMove(ev);R.figNoHover=!CITY.hover;const had=!document.getElementById('cityPanel').hidden;cityClick(ev);R.figNoPanel=(document.getElementById('cityPanel').hidden||!had)&&!(CITY.sel&&CITY.sel.kind&&CITY.sel.kind!=='bldg'&&CITY.sel.id===n.id)}
      const gp=P89(CITY_GATE[0],CITY_GATE[1],0);const gh=cityAt({clientX:rc.left+gp.x,clientY:rc.top+gp.y});R.gate=!gh.npc&&(gh.b89==='arena'||(gh.r===CITY_GATE[0]&&gh.c===CITY_GATE[1]));
      const side=document.getElementById('citySide');R.sideHasPeople=!!side&&/people/i.test(side.innerHTML);
      const pb=document.getElementById('citySideBody');R.sideTabs=side?side.querySelectorAll('.cbar89tabs button').length:0}
    /* off again: the crowd moves */
    SETTINGS.calm=false;const s1=snap();let moved=false;for(let i=0;i<400&&!moved;i++){await sleep(25);moved=snap()!==s1}R.movedAfter=moved;
    return R});
  await pg.close();return {o,errs}}
const C=await calmRun();
ok(C.o.still,'calm: no crowd figure changes position over 3 s');ok(C.o.sayNone,'calm: no chatter bubbles');
ok(C.o.landed&&C.o.jump,'calm: the player walk still lands, as a jump '+JSON.stringify(C.o));
ok(C.o.figFound&&C.o.figNoHit&&C.o.figNoHover&&C.o.figNoPanel,'crowd figures: no hit, hover or panel '+JSON.stringify(C.o));ok(C.o.gate&&C.o.sideTabs>=3,'gate still answers; sidebar tabs up '+JSON.stringify(C.o));
ok(C.o.movedAfter,'calm off again: the crowd moves');
const errs=A.errs.concat(B.errs,C.errs);
console.log(JSON.stringify({warm:o.warmMs,maxLoop:o.maxLoop,firstMove:o.firstMove,due:d.slice(0,6),imgs:o.imgs,fails}),'ERRS',JSON.stringify(errs.slice(0,5)));
await b.close();process.exit(fails.length||errs.length?1:0)})();
