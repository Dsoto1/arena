/* v1.11d — the jug speckles stay on the jug (425-v111dpot). drawPot is called for the same jug under three cameras (different OX/OY pans,
   a different zoom TW) with the 2D context's fillRect recorded: the speckle rects, relative to the jug (÷ its size s), are the same every time
   (positions within 0.02 s, sizes scale with s); the old screen seed gives a different pattern for a pan. Kill switch flavius_v111dpotoff=1 =
   the old behaviour (a pan changes the pattern). Two jugs stacked on one tile differ. 371's shake (POT105.dx) does not move the pattern.
   node tools/tests/tv111pot.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,500))};
const open=async ls=>{const c=await b.newContext({viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await c.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return pg};
/* the pattern of one jug: fillRect calls (small ones, inside the body clip) relative to (x,y) and s */
const PROBE=()=>{const rec=(x,y,s,tw,ox,oy,dx)=>{const out=[],f=ctx.fillRect;ctx.fillRect=function(a,b,w,h){out.push([a,b,w,h]);return f.apply(this,arguments)};
    const keep={tw:TW,ox:OX,oy:OY,dx:POT105.dx};TW=tw;OX=ox;OY=oy;POT105.dx=dx||0;
    try{ctx.save();drawPot(x,y,s,false);ctx.restore()}finally{ctx.fillRect=f;TW=keep.tw;OX=keep.ox;OY=keep.oy;POT105.dx=keep.dx}
    return out.filter(r=>r[2]<s*0.05&&r[3]<s*0.05).map(r=>[(r[0]-x-(dx||0))/s,(r[1]-y)/s,r[2]/s])};
  /* a jug at board offset (u,v) tiles from the origin, drawn at zoom z with the camera origin at (ox,oy) */
  const at=(u,v,z,ox,oy,k,dx)=>{const tw=112*z;return rec(ox+u*tw,oy+v*tw-(k||0)*0.44*tw,tw*0.46,tw,ox,oy,dx)};
  const A=at(1.5,2.25,1,600,100),B=at(1.5,2.25,1,431.7,-37.3),C=at(1.5,2.25,1.8,222,64),D=at(1.5,2.25,1,600,100,1),E2=at(1.5,2.25,1,600,100,0,7);
  const same=(P,Q)=>P.slice(0,Math.min(P.length,Q.length)).every((r,i)=>Math.abs(r[0]-Q[i][0])<0.02&&Math.abs(r[1]-Q[i][1])<0.02&&Math.abs(r[2]-Q[i][2])<0.004);
  return {on:POT111D.on,n:A.length,pan:same(A,B),zoom:same(A,C),stack:same(A,D),shake:same(A,E2),zoomN:C.length}};
try{
  {const pg=await open();await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(null)});
    const r=await pg.evaluate(PROBE);ok(r.on&&r.n>60,'speckles drawn on '+JSON.stringify(r));
    ok(r.pan,'a pan (different OX/OY): the same speckles on the jug '+r.pan);ok(r.zoom,'a different zoom: the same speckles on the jug (scaled) '+r.zoom);
    ok(!r.stack,'a jug stacked on the same tile has its own pattern');ok(r.shake,'371 shake does not move the pattern')}
  {const pg=await open({flavius_v111dpotoff:'1'});await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(null)});
    const r=await pg.evaluate(PROBE);ok(!r.on&&r.n>60&&!r.pan,'kill switch: old screen seed, a pan changes the pattern '+JSON.stringify(r))}
}catch(e){errs.push(String(e&&e.stack||e).slice(0,400))}
console.log('ERRS',JSON.stringify(errs.slice(0,3)));await b.close();process.exit(miss.length||errs.length?1:0)})();
