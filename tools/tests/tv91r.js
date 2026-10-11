/* tv91r (was the arena agent's tv91a) — v0.91 THE ARENA LOOK (192-v91arena): a classic event by day, at night and turned (all four quarter turns), Naumachia, Chariot
   Racing and a beast-pen fight — no page errors; the two far walls stand on the sides at the BACK of the screen with the right
   tile names (rows A–L or columns 1–12, · in the middle) for every turn; the baked stone layers never change a tile centre, a
   piece or a near spectator (same pixels with and without them); Roma is a grand arena (4 tiers), Syracusae has 3; the
   Blessing pots are jugs and the Golden Eagle is a token round; zoomed in, Flavius's box leaves its podium for the top
   centre at its normal size; ar91Drains gives 8 grates ([] with the look off); the ludus wears its plaster look; draw time
   stays in budget. SHOT=dir saves screenshots. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const out={};const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  /* the helpers the checks share */
  window.T91={W8,
    start:async(ev,loc,night,human)=>{startEvent({ev,loc,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==(human||0)})),opts:{spect:'auto',night:!!night}});
      for(let i=0;i<200;i++){await W8(120);if(CUR_MODAL){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];
          if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}else if(S&&S.phase!=='setup'&&i>6)break}
      SPEED='pause';for(let i=0;i<50&&((typeof fxRAF!=='undefined'&&fxRAF)||S.busy||(S.anims&&S.anims.length));i++)await W8(100); /* v0.92: measure a still board (a CPU's walk interpolates by time) */try{menuHide()}catch(e){}S.zoomIn=false;if(typeof CAM!=='undefined')CAM.z=null;if(typeof DUEL!=='undefined'){DUEL.z=1;DUEL.on=false}
      for(const id of ['cardShow','bubbles'])(document.getElementById(id)||{}).innerHTML='';
      /* wait for the stone texture + the flags */
      for(let i=0;i<40;i++){draw();if(AR91TEX[ar91Mat().n])break;await W8(100)}await W8(400);draw()},
    /* the far walls: which grid sides are at the back, and the names their banners carry */
    walls:()=>{const n=N-1,mid=ar91Mid();const sides=[{k:'top',p:center(-0.5,n/2),L:COLL},{k:'bottom',p:center(n+0.5,n/2),L:COLL},{k:'left',p:center(n/2,-0.5),L:ROWL},{k:'right',p:center(n/2,n+0.5),L:ROWL}];
      /* each wall: the side it stands on (nearest side middle) and its names in screen order, left to right */
      const tiles=k=>{const out=[];for(let i=0;i<N;i++){const p=k==='top'?center(-0.5,i):k==='bottom'?center(n+0.5,i):k==='left'?center(i,-0.5):center(i,n+0.5);out.push({t:(k==='top'||k==='bottom')?COLL[i]:ROWL[i],x:p.x})}return out.sort((a,b)=>a.x-b.x).map(o=>o.t).join(',')};
      const far=sides.filter(s=>s.p.y<mid.y);const want=far.map(s=>tiles(s.k)).sort();
      const got=(AR91.walls||[]).map(w=>{const wm={x:(w.a.x+w.b.x)/2,y:(w.a.y+w.b.y)/2};const sd=sides.slice().sort((p,q)=>Math.hypot(p.p.x-wm.x,p.p.y-wm.y)-Math.hypot(q.p.x-wm.x,q.p.y-wm.y))[0];
        return {side:sd.k,ok:far.includes(sd),names:w.labels.join(',')}});const gotN=got.map(g=>g.names).sort();
      const back=(AR91.walls||[]).every(w=>(w.a.y+w.b.y)/2<mid.y);return {n:(AR91.walls||[]).length,want,got:gotN,same:JSON.stringify(want)===JSON.stringify(gotN)&&got.every(g=>g.ok),back}},
    /* tile centres, pieces and near spectators: the same pixels with and without the baked stone */
    cover:()=>{const g=cv.getContext('2d');const dpr=window.devicePixelRatio||1;const px=(x,y)=>Array.from(g.getImageData(Math.round(x*dpr),Math.round(y*dpr),1,1).data).join(',');
      const pts=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){const m=center(r,c);pts.push(['tile',m.x,m.y])}
      for(const p of S.players)if(p.alive&&!p.exited&&!p.underground){const m=center(p.r,p.c);for(const dy of [0.15,0.35,0.55])pts.push(['piece',m.x,m.y-TW*dy])}
      for(const n of S.npcs||[])if(n.alive&&!n.out){const m=center(n.r,n.c);pts.push(['beast',m.x,m.y-TW*0.2])}
      const mid=ar91Mid();for(const sp of S.spect||[])if(!sp.gone&&sp._x!=null&&sp._y>mid.y)pts.push(['spect',sp._x,sp._y-TW*0.3],['spect',sp._x,sp._y-TW*0.1]);
      const calm=SETTINGS.calm;SETTINGS.calm=true; /* the night flames hold still */const ch92=typeof CHEER92!=="undefined"&&CHEER92.on;if(ch92)CHEER92.on=false; /* v0.92: no cheer burst ending between the draws */
      AR91.noStatic=true;draw();const A=pts.map(p=>px(p[1],p[2]));DRAW_EMPTY=true;draw();const En=pts.map(p=>px(p[1],p[2]));DRAW_EMPTY=false;AR91.noStatic=false;draw();const B=pts.map(p=>px(p[1],p[2]));DRAW_EMPTY=true;draw();const E=pts.map(p=>px(p[1],p[2]));DRAW_EMPTY=false;draw();SETTINGS.calm=calm;if(ch92)CHEER92.on=true;
      const far=(u,v)=>{const a=u.split(',').map(Number),c=v.split(',').map(Number);return Math.max(Math.abs(a[0]-c[0]),Math.abs(a[1]-c[1]),Math.abs(a[2]-c[2]))>10}; /* blending noise of a unit or two is not cover */
      /* a piece (or a spectator sprite) is covered when it shows without the stone but has vanished with it — a sample on a sprite's anti-aliased edge sees stone behind it either way; v1.0: the piece pixel must also CHANGE with the stone (A vs B) — a gold piece over the new gilt band matched the empty stone pixel by colour alone, yet drew identically */
      const bad=pts.filter((p,i)=>(p[0]==='piece'||p[0]==='beast'||p[0]==='spect')?(far(A[i],En[i])&&!far(B[i],E[i])&&far(A[i],B[i])):far(A[i],B[i])).map((p,i)=>p[0]+'@'+Math.round(p[1])+','+Math.round(p[2]));const kinds={};for(const p of pts)kinds[p[0]]=(kinds[p[0]]||0)+1;return {n:pts.length,kinds,bad}},
    ms:()=>{draw();const t0=performance.now();for(let i=0;i<15;i++)draw();const on=(performance.now()-t0)/15;AR91.on=false;draw();const t1=performance.now();for(let i=0;i<15;i++)draw();const off=(performance.now()-t1)/15;AR91.on=true;draw();return {on,off}}}});

/* ======== 1. a classic event by day (Roma, grand) ======== */
{const R=await pg.evaluate(async()=>{await T91.start('democritus',6,false,0);const r={on:ar91On(),tiers:ar91Tiers(),loc:S.locIdx,rot:ROT89.k,walls:T91.walls(),cover:T91.cover(),fires:(AR91.fires||[]).length,ms:T91.ms(),drains:ar91Drains().length};
  /* the pots: jugs; the eagle: a token round (its gold amphora neck stays unpainted) */
  AR91.cnt.jug=0;draw();r.jugs=AR91.cnt.jug;r.pots=S.pillars.reduce((a,p)=>a+((p.pots||[]).length),0);
  const g=cv.getContext('2d');const dpr=window.devicePixelRatio||1;const x=40,y=cv.clientHeight-20,s=TW*0.46;const nk=()=>Array.from(g.getImageData(Math.round(x*dpr),Math.round((y-s*0.85)*dpr),1,1).data).join(',');
  for(let i=0;i<30&&!tok90Canvas('eagle');i++)await T91.W8(100);const e0=AR91.cnt.eagle;const before=nk();drawPot(x,y,s,true);r.eagle=AR91.cnt.eagle-e0;r.neck=before===nk();r.eagleTok=!!tok90Canvas('eagle');
  /* zoomed: the box detaches at its normal size */
  const F0=flavXY89();S.zoomIn=true;for(let i=0;i<30;i++){draw();await T91.W8(60)}const F1=flavXY89();r.zoom={z:AR91.z,det:AR91.det,w0:F0.w,w1:F1.w,cy:F1.cy,cx:F1.cx,wd:cv.clientWidth};
  S.zoomIn=false;for(let i=0;i<30;i++){draw();await T91.W8(60)}r.back=!AR91.det;
  AR91.on=false;r.drainsOff=ar91Drains().length;AR91.on=true;draw();return r});
  out.day=R;ok(R.on,'1 the look is on');ok(R.tiers===4,'1 Roma is grand: 4 tiers');ok(R.walls.n===2&&R.walls.same&&R.walls.back,'1 two far walls with the right names '+JSON.stringify(R.walls));
  ok(R.cover.bad.length===0,'1 no stone over a tile, piece or near spectator '+JSON.stringify(R.cover));ok(R.cover.kinds.spect>0,'1 near spectators sampled');
  ok(R.fires===4,'1 four fires (two towers, two bowls)');ok(R.drains===4&&R.drainsOff===0,'1 four drain grates (the far gully only), none with the look off');
  ok(R.pots>0&&R.jugs>=R.pots,`1 the pots are jugs (${R.jugs}/${R.pots})`);ok(R.eagle===1&&R.neck,'1 the eagle is a token round '+JSON.stringify([R.eagle,R.neck,R.eagleTok]));
  ok(R.zoom.det&&Math.abs(R.zoom.w1-R.zoom.w0)<1&&R.zoom.cy<R.zoom.w1&&Math.abs(R.zoom.cx-R.zoom.wd/2)<2,'1 zoomed: the box sits at the top centre at its normal size '+JSON.stringify(R.zoom));ok(R.back,'1 zoomed out: back on the podium');
  ok(R.ms.on<R.ms.off+12,`1 draw time ${R.ms.on.toFixed(1)} ms (look off ${R.ms.off.toFixed(1)} ms)`);
  if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv91a_day.png')})}

/* ======== 2. every quarter turn: walls at the back, the right names, nothing over the sand ======== */
{const R=await pg.evaluate(()=>{const want=rot89Want;const res=[];for(let k=0;k<4;k++){rot89Want=()=>k;draw();res.push({k:ROT89.k,walls:T91.walls(),bad:T91.cover().bad})}rot89Want=want;draw();return res});
  out.turns=R;ok(R.every(r=>r.walls.n===2&&r.walls.same&&r.walls.back&&r.bad.length===0),'2 every turn: far walls + names + clear sand '+JSON.stringify(R.map(r=>[r.k,r.walls.got,r.walls.same,r.bad])))}

/* ======== 3. a small arena at night, turned by its human seat ======== */
{const R=await pg.evaluate(async()=>{await T91.start('egidious',1,true,2);return {night:night91On(),tiers:ar91Tiers(),rot:ROT89.k,walls:T91.walls(),bad:T91.cover().bad,fires:(AR91.fires||[]).length,ms:T91.ms()}});
  out.night=R;ok(R.night,'3 a night event');ok(R.tiers===3,'3 Syracusae: 3 tiers');ok(R.rot!==0,'3 the view is turned ('+R.rot+')');
  ok(R.walls.same&&R.walls.back,'3 night + turned: walls and names '+JSON.stringify(R.walls));ok(R.bad.length===0,'3 night: nothing over the sand '+R.bad);ok(R.fires===4,'3 night: four fires');
  ok(R.ms.on<R.ms.off+12,`3 night draw time ${R.ms.on.toFixed(1)} ms (off ${R.ms.off.toFixed(1)})`);
  if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv91a_night.png')})}

/* ======== 4. Naumachia and Chariot Racing ======== */
for(const ev of ['naumachia','chariot']){const R=await pg.evaluate(async(ev)=>{await T91.start(ev,12,false,0);return {ev:S.evKey,on:ar91On(),walls:T91.walls(),bad:T91.cover().bad}},ev);
  out[ev]=R;ok(R.ev===ev&&R.on,'4 '+ev+' runs with the look');ok(R.walls.same&&R.walls.back,'4 '+ev+' walls '+JSON.stringify(R.walls));ok(R.bad.length===0,'4 '+ev+': nothing over the sand '+R.bad);
  if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv91a_'+ev+'.png')})}

/* ======== 5. a beast-pen fight: the ludus look ======== */
{const R=await pg.evaluate(async()=>{const W8=T91.W8;openManager();await W8(600);newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_(),m=me();m.coin=300;w.night.travel=null;w.tplan=null;for(const g of rosterOf(m))g.inj=null;
    MGR.pen76={gid:rosterOf(m)[0].id,t:'wolf'};penGo76();for(let i=0;i<60;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(null);else if(S&&S.pen76&&S.phase!=='setup'&&i>10)break}
    SPEED='pause';S.zoomIn=false;if(typeof CAM!=='undefined')CAM.z=null;if(typeof DUEL!=='undefined'){DUEL.z=1;DUEL.on=false}for(let i=0;i<30;i++){draw();await W8(50)}
    const r={pen:!!S.pen76,lud:ar91Lud(),mat:ar91Mat().n,tiers:ar91Tiers(),walls:T91.walls(),fires:(AR91.fires||[]).length,bad:T91.cover().bad};
    S.zoomIn=true;for(let i=0;i<40;i++){draw();await W8(50)}r.z=AR91.z;r.badZoom=T91.cover().bad;return r});
  out.pen=R;ok(R.pen&&R.lud&&R.mat==='Plaster','5 the pen wears plaster');ok(R.tiers===3,'5 the ludus: 3 tiers');ok(R.walls.same,'5 pen walls '+JSON.stringify(R.walls));
  ok(R.fires===0,'5 no fires at the ludus');ok(R.bad.length===0,'5 pen: nothing over the sand '+R.bad);ok(R.z>1.05&&R.badZoom.length===0,'5 pen zoomed: the temple stays off the sand '+R.z+' '+R.badZoom);
  if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv91a_pen.png')})}

console.log(JSON.stringify(out,null,1).slice(0,4000));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
