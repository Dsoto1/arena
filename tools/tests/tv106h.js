/* tv106h — v1.06 beige base disc (321 bs101Off; docs/known-issues.md 2026-10-18, his B36 / B37 / G5). With the token bases OFF a gladiator's base
   must be gone at EVERY zoom step and device pixel ratio, not only at 1× unzoomed. 321's flood margins were fixed pixels tuned on a 22 px base; on an
   up-scaled cell (zoom / 2× screen) they missed the cream top (a beige disc stayed), and its colour probes could land on the figure's skin and eat the
   shins. Checks, for EVERY printed class (8), its move + act rows (two facings) and its four severed sets, at zoom 1× / 1.4× / 2× and DPR 1 / 2
   (the very cells the board draws: an100Cell → bs101Proc → bs101Off, bases off):
   1  no base-coloured pixel band: in the base's footprint (outside the middle of the top, where the feet stand) the pixels of the base's cream / wall
      colours (modes measured on the source cell) stay under 4% of the footprint (a leftover disc is 50% +), no ring sliver arcs;
   2  the figure is not eaten: the cell stays ONE body (feet joined to the legs and the torso: at most 2 parts of 12 px² × scale² or more) — the old
      probes cut the shins out;
   3  every cell was processed by the flood (bs101Off true, not the thin fallback);
   4  the kill switch (flavius_board101off... = bases fall back to the old cells) is not needed; the cost: the clean runs once per cached cell (the cache
      serves a second pass: BS101.stats.proc does not grow) — never per frame.
   Device tokens (Studio / Online) take the same an100Cell path; headless has no on-device 3D (AN100 dev converter off), so the printed rig sheets
   stand in for them.
   node tools/tests/tv106h.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const MT={'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,600))};
const open=async(dsf)=>{const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dsf});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1')});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}try{menuHide()}catch(e){}});return pg};
/* a paused 4-seat match with the given classes, bases off */
const start=(pg,classes)=>pg.evaluate(async(classes)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  SETTINGS.bases101=false;applySettings();
  startEvent({ev:'democritus',seed:777,seats:classes.map((cls,i)=>({cls,cpu:i>0})),opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='normal';render();for(let i=0;i<6;i++){draw();await W8(60)}
  return {mode:bs101Mode(),cls:S.players.map(p=>p.cls)}},classes);
/* measure every cell of every class at zoom z (the page's own DPR): returns the worst figures */
const measure=(pg,z,classes)=>pg.evaluate(async({z,classes})=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
  if(z>1){S.zoomIn=true;CAM.z=z}else{S.zoomIn=false;CAM.z=null}for(let i=0;i<8;i++){draw();await W8(60)}
  const out={z,dpr:window.devicePixelRatio,TW,cells:0,flood:0,worst:0,worstAt:'',bodyMax:0,bodyAt:'',bad:[],proc0:0,proc1:0,hit1:0,rx:0};
  const mode=L=>{if(L.length<3)return null;const h=new Map();for(const p of L){const k=(p[0]>>4)*256+(p[1]>>4)*16+(p[2]>>4);let e=h.get(k);if(!e){e={n:0,r:0,g:0,b:0};h.set(k,e)}e.n++;e.r+=p[0];e.g+=p[1];e.b+=p[2]}
    let best=null;for(const e of h.values())if(!best||e.n>best.n)best=e;return best.n>=Math.max(3,L.length*0.3)?[best.r/best.n,best.g/best.n,best.b/best.n]:null};
  let tag='',mine=false;const bo=bs101Off;
  bs101Off=function(sg,src,c,g,W,H,cx,cyT,rx,ry,Tp){const sd=sg.getImageData(0,0,W,H).data;const r=bo.apply(this,arguments);if(!mine)return r;out.cells++;if(r)out.flood++;out.rx=rx;
    if(!r){let op=0;for(let i=3;i<sd.length;i+=4)if(sd[i]>200)op++;/* a near-empty cell (the first draw of a sheet, before its bitmap is in: ~900 opaque px, no base to remove) is not a figure */if(op<1500){out.cells--;return r}out.bad.push(tag+' nofloor');return r}
    const u=Math.max(1,rx/22.5);const px=(d,x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return null;const i=(y*W+x)*4;return d[i+3]>200?[d[i],d[i+1],d[i+2]]:null};
    const tp=[];for(let k=0;k<24;k++){const t=k/24*Math.PI*2;for(const f of [0.78,0.9]){const q=px(sd,cx+f*rx*Math.cos(t),cyT+f*ry*Math.sin(t));if(q)tp.push(q)}}
    const wp=[];for(const fx of [-0.9,-0.7,-0.5,-0.3,0.3,0.5,0.7,0.9]){const e=cyT+ry*Math.sqrt(1-fx*fx);for(const q of [0.3,0.5,0.7]){const v=px(sd,cx+fx*rx,e+Tp*q);if(v)wp.push(v)}}
    const tm=mode(tp),wm=mode(wp);if(!tm){return r}
    const od=c.getContext('2d').getImageData(0,0,W,H).data;
    const near=(i,p,t)=>{const a=od[i]-p[0],b2=od[i+1]-p[1],e=od[i+2]-p[2];return a*a+b2*b2+e*e<=t*t};
    /* the footprint: inside the cylinder (+2u), outside the middle of the top (q < 0.5) where the feet stand */
    let zone=0,base=0;const inC=(x,y)=>{const dx=x+0.5-cx,dy=y+0.5-cyT,a=rx+2*u,b2=ry+2*u;if(Math.abs(dx)>a)return false;if((dx/a)**2+(dy/b2)**2<=1)return true;if((dx/a)**2+((dy-Tp)/b2)**2<=1)return true;return dy>=0&&dy<=Tp};
    const y0=Math.max(0,Math.floor(cyT-ry-3*u)),y1=Math.min(H,Math.ceil(cyT+ry+Tp+3*u));
    for(let y=y0;y<y1;y++)for(let x=0;x<W;x++){if(!inC(x,y))continue;const dx=x+0.5-cx,dy=y+0.5-cyT;if((dx/rx)**2+(dy/ry)**2<0.5)continue;zone++;const i=(y*W+x)*4;if(od[i+3]<128)continue;
      if(near(i,tm,14)||(wm&&near(i,wm,18)))base++}
    const frac=base/Math.max(1,zone);if(frac>out.worst&&!/:(rarm|larm|rleg|lleg)/.test(tag)||frac>0.1){out.worst=frac;out.worstAt=tag+' '+base+'/'+zone}
    /* a severed limb is skin, the cream's own colour: it lies in the footprint and matches by itself, so its limit is looser */const lim=/:(rarm|larm|rleg|lleg)/.test(tag)?0.1:0.04;if(frac>lim)out.bad.push(tag+' '+base+'/'+zone);
    /* parts: 8-connected opaque components of at least 12 u² px */
    const lab=new Int32Array(W*H);let parts=0;for(let j=0;j<W*H;j++){if(lab[j]||od[j*4+3]<128)continue;const st=[j];lab[j]=1;let n=0;while(st.length){const k=st.pop();n++;const X=k%W,Y=(k/W)|0;for(let a=-1;a<=1;a++)for(let b2=-1;b2<=1;b2++){const XX=X+b2,YY=Y+a;if(XX<0||YY<0||XX>=W||YY>=H)continue;const kk=YY*W+XX;if(lab[kk]||od[kk*4+3]<128)continue;lab[kk]=1;st.push(kk)}}if(n>=12*u*u)parts++}
    if(parts>out.bodyMax){out.bodyMax=parts;out.bodyAt=tag}if(parts>2)out.bad.push(tag+' parts '+parts);
    return r};
  try{BS101.cache=new WeakMap();const p0=BS101.stats.proc;
    const cellsOf=async(s,rowsBySet)=>{const want=[];for(const set of ['move','act']){const rows=s[set]&&s[set].meta&&s[set].meta.rows;if(!rows)continue;for(const name of Object.keys(rows)){if(rowsBySet&&!rowsBySet.includes(name))continue;if(/fall|die|dead|lie|topple|knock/.test(name))continue;want.push([set,name])}}
      for(let t=0;t<200;t++){let all=true;for(const [set,name] of want){an100Sheet(s,set);if(!an100Bm(s,set,name))all=false}if(all)break;await W8(50)}return want};
    const lbl=s=>s.cls+(s.limb?':'+s.limb:'');
    for(const cls of classes){for(const limb of ['','rarm','larm','rleg','lleg']){const s=an100Printed(cls,limb);if(!s){out.bad.push(cls+':'+limb+' no source');continue}
        for(let t=0;t<200&&!an100Sheet(s,'move');t++)await W8(50);
        const want=await cellsOf(s,limb?['idle','walk','attack','hit','fall']:null);
        for(const [set,name] of want){const o=an100Bm(s,set,name);if(!o)continue;
          for(const face of limb?[0]:[0,3]){tag=lbl(s)+' '+set+'/'+name+' f'+face;mine=true;ctx.save();try{an100Cell(s,{set,name,i:0},face,600,500,{})}finally{ctx.restore();mine=false}}}}}
    out.proc0=BS101.stats.proc-p0;
    /* the clean runs once per cached cell: the same cells again are all cache hits */
    const pr=BS101.stats.proc;out.cells2=0;const c2=out.cells;
    for(const cls of classes){const s=an100Printed(cls,'');tag='again';mine=true;ctx.save();try{an100Cell(s,{set:'move',name:'idle',i:0},0,600,500,{})}finally{ctx.restore();mine=false}}
    out.proc1=BS101.stats.proc-pr;out.cells2=out.cells-c2}
  finally{bs101Off=bo}
  return out},{z,classes});

const CL1=['soldier','royalty','hero','slave'],CL2=['veteranus','amazonia','venatore','damnatio'];
const all={};
for(const dsf of [1,2]){const pg=await open(dsf);
  for(const [i,classes] of [CL1,CL2].entries()){const st=await start(pg,classes);ok(st.mode===2&&st.cls.join()===classes.join(),'0 dpr '+dsf+' bases off, seats '+st.cls.join());
    for(const z of [1,1.4,2]){const r=await measure(pg,z,classes);all[dsf+'/'+z+'/'+i]=r;
      const tagS='dpr '+dsf+' zoom '+z+' '+classes.join(',');
      ok(r.cells>=60&&r.flood===r.cells,'3 '+tagS+': every cell cleaned by the flood '+JSON.stringify({cells:r.cells,flood:r.flood,rx:r.rx,TW:r.TW,bad:r.bad.filter(x=>/nofloor/.test(x)).slice(0,3)}));
      ok(r.worst<=0.04&&!r.bad.some(x=>!/parts|nofloor/.test(x)),'1 '+tagS+': no base-coloured band under the feet (worst share '+r.worst.toFixed(3)+' at '+r.worstAt+') '+JSON.stringify(r.bad.filter(x=>!/parts|nofloor/.test(x)).slice(0,4)));
      ok(!r.bad.some(x=>/ parts /.test(x)),'2 '+tagS+': the figure stays one body (most parts '+r.bodyMax+' at '+r.bodyAt+') '+JSON.stringify(r.bad.filter(x=>/ parts /.test(x)).slice(0,4)));
      ok(r.proc1===0,'4 '+tagS+': the clean ran once per cached cell ('+r.proc0+' new cells, 0 on the second pass: '+r.proc1+')')}}
  await pg.context().close()}
/* the kill switch of the whole base module (flavius_board101off) leaves the old cells: bases drawn; no error */
{const pg=await open(1);await pg.evaluate(()=>localStorage.setItem('flavius_board101off','1'));await pg.reload();await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  const k=await pg.evaluate(()=>({off:typeof B101!=='undefined'&&B101.off,mode:typeof bs101Mode==='function'?bs101Mode():null}));ok(k.off&&k.mode===0,'K1 kill switch flavius_board101off: the base module is off '+JSON.stringify(k));await pg.context().close()}
await b.close();srv.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
