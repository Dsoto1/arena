/* v1.10a TWO VISUAL FIXES (418-v110b). Checks:
   (1) F1 Chariot Racing: an100On() is true, every racer's draw goes through the figure path (311 animated figure or 400's still:
       ST110.stats.riders counts them, the trace carries each racer id), 311's AN100 draw counter grows, the chariot disc under a rider is
       drawn wider than the old 0.86 tile (the mini's base would hide it), the horse / wheel token drawers are untouched; a normal
       event is unchanged (no riders counted, an100On true as before);
   (2) F2 all stands: st110Front() is true for ALL 8 sections; one draw paints every bench's plank seams live BEFORE the crowd
       (trace: planks then crowd, tiers of all 8 sections), 409's baked pass paints 0 seam strokes with 418 on (a re-bake with 418 off paints many);
   (3) the draw stays in budget (the live seams ≈ 0.1 ms);
   (4) kill switch flavius_v110boff=1: an100On false in the chariot, st110Front false, no live seams = v1.10 exactly.
   Phone width (390 px) runs the same checks. */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{const root=path.dirname(path.resolve(process.argv[2]||'flavius-arena.html')),page=path.basename(process.argv[2]||'flavius-arena.html');
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[],miss=[],out={};const ok=(c,n)=>{if(!c)miss.push(n)};
async function open(w,kill){const ctx=await b.newContext({viewport:{width:w,height:w<500?800:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(k=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(k)localStorage.setItem('flavius_v110boff','1')},!!kill);
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    window.T110={W8,start:async(ev,loc)=>{startEvent({ev,loc,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:'auto',night:false}});
      for(let i=0;i<200;i++){await W8(120);if(CUR_MODAL){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];
        if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}else if(S&&S.phase!=='setup'&&i>6)break}
      SPEED='pause';for(let i=0;i<50&&((typeof fxRAF!=='undefined'&&fxRAF)||S.busy||(S.anims&&S.anims.length));i++)await W8(100);try{menuHide()}catch(e){}
      for(let i=0;i<40;i++){draw();if(AR91TEX[ar91Mat().n])break;await W8(100)}await W8(1500);draw()}}});
  return pg}
for(const w of [1440,390]){
  const pg=await open(w,false);
  /* ---- a normal event: front / back sections, the order of one draw, the baked pass ---- */
  out['n'+w]=await pg.evaluate(async()=>{await T110.start('democritus',6);
    const fr=[0,1,2,3,4,5,6,7].map(si=>!!st110Front(si));
    ST110.trace=[];const r0=ST110.stats.riders;draw();const tr=ST110.trace;ST110.trace=null;
    const iP=tr.findIndex(e=>e.planks!=null),iC=tr.findIndex(e=>e.crowd);
    /* the baked pass: count the seam strokes a re-bake paints with 418 on and off (a recording 2d context) */
    const count=()=>{let n=0;const g=document.createElement('canvas').getContext('2d');const ms=g.stroke;g.stroke=function(){if(/^rgba\(28, 10, 6/.test(g.strokeStyle))n++;return ms.apply(this,arguments)};try{v108Static(g,false)}catch(e){}return n};
    const on=count();const k=ST110.on;ST110.on=false;const off=count();ST110.on=k;
    /* the draw time */
    const t=[];for(let i=0;i<25;i++){const a=performance.now();draw();t.push(performance.now()-a)}t.sort((a,b)=>a-b);
    return {fr,planks:tr.find(e=>e.planks!=null)||null,order:iP>=0&&iC>=0&&iP<iC,iP,iC,riders:ST110.stats.riders-r0,on,off,med:t[12],p90:t[22],liveMs:ST110.stats.ms,an:an100On(),evKey:S.evKey}});
  const n=out['n'+w];
  ok(n.fr.length===8&&n.fr.every(x=>x),w+' all 8 sections are live ('+n.fr+')');
  ok(n.planks&&n.planks.planks>=8*3,w+' live seams painted for all 8 sections\' tiers '+JSON.stringify(n.planks));
  ok(n.order,w+' the front benches\' seams come before the crowd (trace '+n.iP+' < '+n.iC+')');
  ok(n.off>n.on&&n.on===0,w+' the baked pass paints 0 seam strokes with 418 on (strokes '+n.on+', off '+n.off+')');
  ok(n.riders===0&&n.an===true,w+' a classic event: no chariot riders counted, an100On true');
  ok(n.med<16&&n.liveMs<1.5,w+' draw median '+n.med.toFixed(1)+' ms, live seams '+n.liveMs.toFixed(2)+' ms');
  /* ---- Chariot Racing ---- */
  out['c'+w]=await pg.evaluate(async()=>{await T110.start('chariot',12);AN100.trace=[];ST110.trace=[];const r0=ST110.stats.riders,d0=AN100.stats.draws+ST107.stats.p;
    const wide=[];const bt=chTokFlat;chTokFlat=function(art,x,y,wd){wide.push(+(wd/TW).toFixed(2));return bt.apply(this,arguments)};
    draw();chTokFlat=bt;const trace=ST110.trace.filter(e=>e.rider!=null).map(e=>e.rider);ST110.trace=null;
    const ids=S.players.filter(p=>p.alive&&p.ch&&p.ch.mounted).map(p=>p.id);
    const on=an100On();const tr=AN100.trace.length;AN100.trace=null;
    return {ev:S.evKey,on,riders:ST110.stats.riders-r0,drawn:AN100.stats.draws+ST107.stats.p-d0,ids,trace,wide,still:ST107.stats.p>0,tr,
      tok:typeof chTok==='function'&&typeof chRideTok==='function'&&typeof chFloorTok==='function'}});
  const c=out['c'+w];
  ok(c.ev==='chariot'&&c.on===true,w+' an100On in Chariot Racing');
  ok(c.ids.length>=3&&c.trace.length>=c.ids.length&&c.ids.every(i=>c.trace.includes(i)),w+' every racer drawn via the figure path '+JSON.stringify([c.ids,c.trace]));
  ok(c.drawn>=c.ids.length,w+' 311 / 400 figure draws grew by '+c.drawn);
  ok(c.wide.length>=c.ids.length&&c.wide.some(x=>x>0.9),w+' the chariot disc is drawn wider than the mini base '+JSON.stringify(c.wide));
  ok(c.tok,w+' chariot / horse / wheel token drawers still there');
  await pg.context().close()}
/* ---- kill switch ---- */
{const pg=await open(1440,true);out.kill=await pg.evaluate(async()=>{await T110.start('chariot',12);ST110.trace=[];const r0=ST110.stats.riders;draw();const tr=ST110.trace;ST110.trace=null;
  return {on:ST110.on,an:an100On(),fr:[0,1,2,3,4,5,6,7].some(si=>st110Front(si)),planks:tr.some(e=>e.planks!=null),riders:ST110.stats.riders-r0}});
  const k=out.kill;ok(k.on===false&&k.an===false&&!k.fr&&!k.planks&&k.riders===0,'kill switch = v1.10 exactly '+JSON.stringify(k));await pg.context().close()}
await b.close();srv.close();console.log(JSON.stringify(out).slice(0,3500));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(errs.length||miss.length?1:0)})();
