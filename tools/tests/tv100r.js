/* tv100r — v1.0 THE ARENA LOOK, ROUND 2 (277-v100arena): each arena loads ITS stone texture once (on demand, nothing else); the rail ends
   on piers with no gap and no overlap at the towers, the stair openings and the near corner (geometric check from A100X.last, all 12
   arenas, turned, zoomed 2.4×, at night and on a 390 px phone); the band is painted on all 12; Capua wears the gilt parapet; the four
   palette changes are in and every arena preset keeps its text pairs WCAG AA (the default Arena theme untouched); the sand's near
   edge shows the same pixels with the look on and off (the rail never shows over the sand); kill switch flavius_arena100off=1 =
   the bare 192 functions, pixel-identical baked layers; the cached frame stays within the draw-time budget. SHOT=dir saves shots. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const out={};const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
async function open(o={}){const ctx=await b.newContext(o.phone?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');try{performance.setResourceTimingBufferSize(5000)}catch(e){}for(const [k,v] of Object.entries(ls||{}))localStorage.setItem(k,v)},o.ls||{});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    window.T100={W8,
      start:async(loc,night)=>{if(S&&!S.over)S.over=true;startEvent({ev:'democritus',loc,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto',night:!!night}});
        for(let i=0;i<200;i++){await W8(120);if(CUR_MODAL){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}else if(S&&S.phase!=='setup'&&i>6)break}
        SPEED='pause';for(let i=0;i<50&&((typeof fxRAF!=='undefined'&&fxRAF)||S.busy||(S.anims&&S.anims.length));i++)await W8(100);try{menuHide()}catch(e){}S.zoomIn=false;CAM.z=null;
        for(const id of ['cardShow','bubbles','wbubs'])(document.getElementById(id)||{}).innerHTML='';for(let i=0;i<60;i++){draw();if(AR91TEX[ar91Mat().n])break;await W8(100)}await W8(300);draw()},
      settle:async()=>{for(let i=0;i<20;i++){draw();await W8(50)}draw()},
      /* the rail geometry of the last 'under' bake: every run end lies inside a pier (no gap) and inside its span (no overlap past it) */
      geo:()=>{AR91.ver++;draw();const G=A100X.last;if(!G)return {ok:false,why:'no geometry'};const bad=[];const E2=G.edges;
        if(E2.length!==2)bad.push('edges '+E2.length);
        for(const E of E2){if(E.runs.length!==2)bad.push('runs '+E.runs.length);
          const tp=E.piers.filter(p=>p.kind==='tower'),sp=E.piers.filter(p=>p.kind==='stair'),cp=E.piers.filter(p=>p.kind==='corner');
          if(tp.length!==1||sp.length!==2||cp.length!==1)bad.push('piers '+[tp.length,sp.length,cp.length]);
          const face=E.xt;if(tp[0]&&Math.abs((E.left?tp[0].x0:tp[0].x1)-face)>0.6)bad.push('tower pier off the tower face');
          if(E.plinth){if(Math.abs((E.left?E.plinth.x1:E.plinth.x0)-face)>0.6)bad.push('plinth edge');}else bad.push('no plinth');
          if(cp[0]&&Math.abs(cp[0].x-E.corner)>0.6)bad.push('corner pier off the corner');
          for(const [px,qx] of E.runs)for(const x of [px,qx]){const P=E.piers.find(p=>x>=p.x0-0.01&&x<=p.x1+0.01);if(!P)bad.push('run end '+x.toFixed(1)+' not on a pier')}
          for(const [px,qx] of E.runs)if(px<E.gap[1]-0.5&&qx>E.gap[0]+0.5)bad.push('run across the stair opening');
          for(const P of sp)if(Math.abs(P.x-E.gap[0])>0.6&&Math.abs(P.x-E.gap[1])>0.6)bad.push('stair pier not at the opening')}
        return {ok:!bad.length,bad,n:E2.reduce((a,E)=>a+E.piers.length,0)}},
      hash:names=>{const o={};for(const n of names){const L=AR91.L[n];if(!L){o[n]=null;continue}const d=L.cv.getContext('2d').getImageData(0,0,L.cv.width,L.cv.height).data;let h=2166136261;for(let i=0;i<d.length;i++){h^=d[i];h=Math.imul(h,16777619)}o[n]=(h>>>0).toString(16)}return o},
      ms:n=>{const med=a=>a.sort((x,y)=>x-y)[a.length>>1];const A=[];for(let i=0;i<n;i++){draw();const t=performance.now();draw();A.push(performance.now()-t)}return med(A)}}});
  return {ctx,pg}}
const files=pg=>pg.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name.split('/').pop()).filter(n=>n.startsWith('stone100_')));

/* ======== 1. desktop: textures on demand, all 12 arenas: geometry, band, Capua ======== */
const D=await open();
{await D.pg.evaluate(()=>T100.start(6));const f1=await files(D.pg);out.f1=f1;ok(f1.length===1&&f1[0]==='stone100_6_roma.webp','1 only Roma\'s texture loaded at Roma '+JSON.stringify(f1));
  const per={};for(const k of [1,2,3,4,5,6,7,8,9,10,11,12]){const r=await D.pg.evaluate(async k=>{await T100.start(k);await T100.settle();A100X.cnt.band=0;const g=T100.geo();
      return {k,mat:ar91Mat().n,tex:!!AR91TEX[ar91Mat().n],geo:g,band:A100X.cnt.band,rail:A100[k].rail,metal:A100[k].metal,cap:ar91Mat().cap}},k);per[k]=r;
    ok(r.geo.ok,`1 arena ${k}: rail ends on piers ${JSON.stringify(r.geo.bad)}`);ok(r.band>=4,`1 arena ${k}: band painted (${r.band})`);ok(r.tex&&/^stone100 /.test(r.mat),`1 arena ${k}: its own stone ${r.mat}`);
    if(SHOT)await D.pg.screenshot({path:path.join(SHOT,'tv100r_'+k+'.png')})}
  out.per=per;ok(per[4].rail==='parapet'&&per[4].metal==='gilt','1 Capua has the gilt parapet');
  ok(per[6].metal==='gilt'&&per[3].metal==='bronze'&&per[7].metal==='dark'&&per[11].metal==='verd','1 bronze per arena (gilt Roma, bronze Arles, dark Nemausus, verdigris Pola)');
  const f2=await files(D.pg);const cnt={};for(const n of f2)cnt[n]=(cnt[n]||0)+1;out.f2=cnt;ok(Object.keys(cnt).length===12&&Object.values(cnt).every(c=>c===1),'1 each texture loaded once '+JSON.stringify(cnt));
  /* turned, zoomed 2.4×, night */
  const t=await D.pg.evaluate(async()=>{const r={};await T100.start(9);for(const k of [1,2,3]){ROT89.k=k;await T100.settle();r['rot'+k]=T100.geo()}ROT89.k=0;
    CAM.z=2.4;S.zoomIn=true;await T100.settle();r.zoom=T100.geo();CAM.z=null;S.zoomIn=false;await T100.start(2,true);await T100.settle();r.night=T100.geo();r.nightOn=night91On();return r});out.turn=t;
  for(const [n,g] of Object.entries(t))if(g&&typeof g==='object')ok(g.ok,`1 ${n}: rail ends on piers ${JSON.stringify(g.bad)}`);ok(t.nightOn,'1 night is on');
  /* the near sand edge: the same pixels with the look on and off (Roma: no palette change) */
  const cl=await D.pg.evaluate(async()=>{await T100.start(6);await T100.settle();const g=cv.getContext('2d'),dpr=window.devicePixelRatio||1;const n=N-1,mid=ar91Mid();const pts=[];
    for(let i=0;i<N;i++)for(const [r,c] of [[n,i],[i,n],[0,i],[i,0]]){const m=center(r,c);if(m.y>mid.y)for(const f of [0,0.3])pts.push([m.x,m.y+TW*0.25*f])}
    const calm=SETTINGS.calm;SETTINGS.calm=true;const px=()=>{draw();return pts.map(([x,y])=>Array.from(g.getImageData(Math.round(x*dpr),Math.round(y*dpr),1,1).data).join(','))};
    const A=px();A100X.set(false);const B=px();A100X.set(true);const C=px();SETTINGS.calm=calm;
    const far=(u,v)=>{const a=u.split(',').map(Number),c=v.split(',').map(Number);return Math.max(...[0,1,2].map(i=>Math.abs(a[i]-c[i])))>6};
    return {n:pts.length,bad:pts.filter((p,i)=>far(A[i],B[i])).length,again:pts.filter((p,i)=>far(A[i],C[i])).length}});out.clear=cl;ok(cl.n>20&&cl.bad===0&&cl.again===0,'1 the near sand edge is untouched '+JSON.stringify(cl));
  /* palettes: the four changes + WCAG AA for every arena preset; the default Arena theme untouched */
  const pal=await D.pg.evaluate(()=>{const lum=h=>{h=h.replace('#','');const c=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
    const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};const low=[];
    for(let k=1;k<=12;k++){const v=THEME_PRESETS['loc'+k].v;for(const [f,bg] of [['bone','panel'],['muted','panel'],['gold','panel'],['bone','panel2'],['muted','panel2'],['bone','blood'],['bone','ink']]){const r=cr(v[f],v[bg]);if(!(r>=4.5))low.push(k+':'+f+'/'+bg+'='+r.toFixed(2))}}
    const P=k=>THEME_PRESETS['loc'+k].v;return {low,cap:P(4).standA+P(4).standB,thy:P(5).standA+P(5).standB,pom:P(8).standA+P(8).standB,lep:[P(9).blood,P(9).line2,P(9).rim,P(9).grid].join(),loc9:LOC_THEMES[9].v.rim,base:JSON.stringify(BASE_THEME)}});
  out.pal=pal;ok(pal.low.length===0,'1 every arena preset AA '+JSON.stringify(pal.low));
  ok(pal.cap==='#3a2622#4a302a'&&pal.thy==='#5a3416#6c4220'&&pal.pom==='#5e2a24#70342c'&&pal.lep==='#3f6b4c,#5f6e58,#3f5446,#9a9c80'&&pal.loc9==='#3f5446','1 the four palette changes are in '+JSON.stringify(pal));
  /* draw time: the cached frame, look on vs off (interleaved medians) */
  const ms=await D.pg.evaluate(async()=>{await T100.start(6);await T100.settle();const on=[],off=[];for(let i=0;i<3;i++){A100X.set(true);T100.ms(3);on.push(T100.ms(12));A100X.set(false);T100.ms(3);off.push(T100.ms(12))}A100X.set(true);
    const med=a=>a.sort((x,y)=>x-y)[1];AR91.ver++;draw();return {on:med(on),off:med(off),under:AR91.ms[0],top:AR91.ms[1]}});out.ms=ms;
  ok(ms.on<=ms.off*1.3+2,'1 cached frame within budget '+JSON.stringify(ms))}

/* ======== 2. kill switch: the bare 192 functions, pixel-identical baked layers; palettes as 266 left them ======== */
{const K=await open({ls:{flavius_arena100off:'1'}});
  const r=await K.pg.evaluate(async()=>{const o={};o.on=A100X.on;o.blood=THEME_PRESETS.loc9.v.blood;o.base=JSON.stringify(BASE_THEME);const res=[];
    for(const [loc,rot] of [[6,0],[4,1],[9,0]]){await T100.start(loc);ROT89.k=rot;await T100.settle();AR91.ver++;draw();const A=T100.hash(['under','top','light','deco']);
      const W={};for(const [n,f] of [['ar91Mat','mat'],['ar91Tex','tex'],['ar91Fill','fill'],['ar91Face','face'],['ar91TopPaint','top'],['ar91Under','under']]){W[n]=window[n];window[n]=A100X.B[f]}
      AR91.ver++;draw();const B=T100.hash(['under','top','light','deco']);for(const n in W)window[n]=W[n];
      res.push({loc,rot,same:JSON.stringify(A)===JSON.stringify(B),A,B})}ROT89.k=0;o.res=res;o.mat=ar91Mat().n;return o});
  out.kill=r;ok(!r.on,'2 kill switch read');ok(r.blood==='#7e6526','2 palettes as 266 left them');ok(r.base===out.pal.base,'2 the default Arena theme is the same with and without the look');
  for(const x of r.res)ok(x.same,`2 arena ${x.loc} turn ${x.rot}: layers identical to the bare 192 functions ${JSON.stringify([x.A,x.B])}`);ok(!/^stone100/.test(r.mat),'2 the old stone');
  await K.ctx.close()}

/* ======== 3. phone 390 px ======== */
{const Ph=await open({phone:true});const r=await Ph.pg.evaluate(async()=>{await T100.start(5);await T100.settle();return {geo:T100.geo(),w:document.documentElement.scrollWidth,vw:innerWidth}});out.phone=r;
  ok(r.geo.ok,'3 phone: rail ends on piers '+JSON.stringify(r.geo.bad));ok(r.w<=r.vw+1,'3 phone: no horizontal scroll');if(SHOT)await Ph.pg.screenshot({path:path.join(SHOT,'tv100r_phone.png')});await Ph.ctx.close()}

console.log(JSON.stringify({f1:out.f1,f2:out.f2,ms:out.ms,clear:out.clear,phone:out.phone&&out.phone.geo,kill:out.kill&&out.kill.res.map(x=>x.same)}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
