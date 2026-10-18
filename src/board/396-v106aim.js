/* =====================================================================
   396-v106aim.js — v1.06 TARGET CLARITY (his u1c u2a, tools/plans/v106/NOTES.md "Target clarity"; decisions 2026-10-17).
   DISPLAY / INPUT ONLY: no rule, dice, S or online-protocol change (rand() is never called; nothing is sent).
   • U1c HOVER PREVIEW: while the active human has an attack chosen (HL holds 'atk' / a tamed beast's 'catk' tiles), the valid target under the
     pointer gets a red ring on its tile (highlights layer, under the figures; it pulses for ~1.5 s after it is picked, then stays still),
     a soft red outline round the figure (drawn in the figure's own depth slot right after it; the outline sprite is built ONCE from the
     figure's drawn images and cached by frame, no per-frame blur), a crosshair cursor and a tag "Name · NN%" (overlays layer).
     NN% = the chance that at least one hit die lands: 1 − (1 − HIT_CHANCE)^dice, dice as doAttack / chAttack / tamedAttack roll them
     (4 vs a beast or in the endgame, else 2). No helper existed; aim106Chance mirrors those counts.
   • BODY FIRST: while aiming, the target figures' drawImage calls are recorded (only theirs, only while aiming); the pointer is tested
     against those images' alpha, front-most by draw order, before the tile under it. pick() returns the tile of that body, so the
     07-ui click (and the hover text) hits exactly what is shown. Tainted images (file://) fall back to the drawn image's rectangle.
   • U2a TOUCH (pointerType touch): first tap on a valid target = select (same ring / outline / tag), a second tap on the SAME target
     strikes, a tap anywhere else cancels the selection.
   • Settings → General → "Confirm attacks" (SETTINGS.confirmAtk106, off by default): a strike first asks "Strike <name>?" Yes / No (ask76).
     OFFLINE ONLY (his follow-up 2026-10-17): in an Online match the row is hidden and the setting ignored; hover + two-tap work there.
   • Reduce motion / Animations Off: no pulse, a static ring.
   Kill switch: localStorage flavius_v106aimoff=1 (every wrapper passes through; no Settings row). Test: tv106d.
   ===================================================================== */
const AIM106={off:(()=>{try{return localStorage.getItem('flavius_v106aimoff')==='1'}catch(e){return false}})(),
  rec:false,tmap:new Map(),figs:[],cur:null,hov:null,sel:null,t0:0,pulseMs:1500,timer:0,raf:0,mx:0,my:0,lastPT:'',
  asking:false,go:false,px:null,ids:new WeakMap(),nid:0,oc:new Map(),stats:{rec:0,built:0,hit:0,taint:0}};
/* active: a live, painted event with attack tiles in HL */
function aim106Live(){try{return !AIM106.off&&!HEADLESS&&!window.FLAVIUS_NODE&&typeof S!=='undefined'&&!!S&&!S.over&&!S.sim&&!S.snap}catch(e){return false}}
function aim106Online(){try{return (typeof onlmOn==='function'&&onlmOn())||!!(S&&S.onl)||!!(typeof ONLM!=='undefined'&&ONLM&&ONLM.on)}catch(e){return false}}
function aim106Calm(){try{return (typeof reduceMotion==='function'&&reduceMotion())||(typeof ANIM88==='function'&&ANIM88()==='off')||(typeof SETTINGS!=='undefined'&&SETTINGS.fx===false)}catch(e){return true}}
/* the target map: HL key → HL entry, for attack tiles only */
function aim106Map(){const m=new Map();if(!aim106Live()||typeof HL==='undefined')return m;for(const [k,h] of HL)if(h&&(h.t==='atk'||h.t==='catk')&&h.target)m.set(k,h);return m}
function aim106Name(h){const t=h.target;if(!t)return '';if(t.kind==='pot')return _T('Pot');return t.ref&&t.ref.name?String(t.ref.name):tl(t.r,t.c)}
/* the hit chance shown on the tag: at least one hit die lands. Mirrors the dice counts of doAttack (4 vs a beast or in the endgame, else 2),
   chAttack (2) and tamedAttack (2). Display only. */
function aim106Chance(h){try{const p=typeof HIT_CHANCE==='number'?HIT_CHANCE:0.5;let n=2;
  if(h.t==='atk'&&!(typeof isChariot==='function'&&isChariot()&&h.target.kind==='player'))n=S.endgame?4:h.target.kind==='npc'?4:2;
  return Math.round(100*(1-Math.pow(1-p,n)))}catch(e){return null}}
/* the figure an entry stands for (players / beasts); pots and ships have none */
const aim106Fig=h=>h&&h.target&&(h.target.kind==='player'||h.target.kind==='npc')?h.target.ref:null;
/* the target shown now: a touch selection wins over the hover */
function aim106Shown(){const a=AIM106.sel||AIM106.hov;if(!a)return null;const h=AIM106.tmap.get(a.k);if(!h||h.target.ref!==a.ref)return null;return {...a,h}}
function aim106Same(a,b){return !!a&&!!b&&a.k===b.k&&a.ref===b.ref}

/* ---------- recording the target figures' images (only while aiming) ---------- */
function aim106Id(img){let i=AIM106.ids.get(img);if(!i){i=++AIM106.nid;AIM106.ids.set(img,i)}return i}
function aim106Rec(base,self,args,u){
  if(!AIM106.rec||!u)return base.apply(self,args);
  const k=u.r*N+u.c,h=AIM106.tmap.get(k);if(!h||h.target.ref!==u)return base.apply(self,args);
  if(typeof bs101Patch==='function'&&!AIM106.inRec)try{bs101Patch()}catch(e){}
  const ops=[],prev=ctx.drawImage;AIM106.inRec=true;
  ctx.drawImage=function(img,a,b,c,d,e,f,g,hh){try{if(img&&arguments.length>=3){let sx=0,sy=0,sw,sh,dx,dy,dw,dh;const W=img.width||img.naturalWidth||0,H=img.height||img.naturalHeight||0;
      if(arguments.length>=9){sx=a;sy=b;sw=c;sh=d;dx=e;dy=f;dw=g;dh=hh}else if(arguments.length>=5){sw=W;sh=H;dx=a;dy=b;dw=c;dh=d}else{sw=W;sh=H;dx=a;dy=b;dw=W;dh=H}
      if(sw>0&&sh>0&&dw&&dh){const m=this.getTransform();ops.push({img,sx,sy,sw,sh,dx,dy,dw,dh,m:[m.a,m.b,m.c,m.d,m.e,m.f]})}}}catch(err){}
    return prev.apply(this,arguments)};
  let r;try{r=base.apply(self,args)}finally{ctx.drawImage=prev;AIM106.inRec=false}
  AIM106.stats.rec++;
  const fig={u,k,ops,bb:aim106BB(ops)};AIM106.figs.push(fig);
  try{const s=aim106Shown();if(s&&s.ref===u&&ops.length)aim106Outline(fig)}catch(e){console.error(e)}
  return r}
/* device-pixel bounds of the recorded images */
function aim106BB(ops){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const o of ops){const m=o.m;
    for(const [x,y] of [[o.dx,o.dy],[o.dx+o.dw,o.dy],[o.dx,o.dy+o.dh],[o.dx+o.dw,o.dy+o.dh]]){const X=m[0]*x+m[2]*y+m[4],Y=m[1]*x+m[3]*y+m[5];
      if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y}}
  return ops.length?{x0,y0,x1,y1}:null}
/* is the device point (X,Y) on an opaque pixel of this figure? */
function aim106Body(fig,X,Y){
  for(let i=fig.ops.length-1;i>=0;i--){const o=fig.ops[i],m=o.m,det=m[0]*m[3]-m[1]*m[2];if(!det)continue;
    const px=X-m[4],py=Y-m[5],ux=(m[3]*px-m[2]*py)/det,uy=(-m[1]*px+m[0]*py)/det;
    const fx=(ux-o.dx)/o.dw,fy=(uy-o.dy)/o.dh;if(fx<0||fy<0||fx>=1||fy>=1)continue;
    const sx=Math.floor(o.sx+fx*o.sw),sy=Math.floor(o.sy+fy*o.sh);
    try{if(!AIM106.px){const c=document.createElement('canvas');c.width=c.height=1;AIM106.px=c.getContext('2d',{willReadFrequently:true})}
      const g=AIM106.px;g.clearRect(0,0,1,1);g.drawImage(o.img,sx,sy,1,1,0,0,1,1);if(g.getImageData(0,0,1,1).data[3]>40)return true}
    catch(e){AIM106.stats.taint++;return true} /* tainted (file://): the image's rectangle counts */
  }
  return false}

/* ---------- pointer → target ---------- */
function aim106Dev(e){const b=cv.getBoundingClientRect();if(!b.width||!b.height)return null;return {X:(e.clientX-b.left)*cv.width/b.width,Y:(e.clientY-b.top)*cv.height/b.height}}
/* the target under the pointer: the front-most target BODY first, then an attack tile under the pointer (t = the plain picked tile) */
function aim106At(e,t){if(!aim106Live()||!AIM106.tmap.size)return null;const d=aim106Dev(e);
  if(d)for(let i=AIM106.figs.length-1;i>=0;i--){const f=AIM106.figs[i],bb=f.bb;if(!bb||d.X<bb.x0||d.X>bb.x1||d.Y<bb.y0||d.Y>bb.y1)continue;
    const h=AIM106.tmap.get(f.k);if(!h||h.target.ref!==f.u)continue;
    if(aim106Body(f,d.X,d.Y)){AIM106.stats.hit++;return {k:f.k,r:f.u.r,c:f.u.c,ref:f.u,body:true}}}
  if(t){const k=t.r*N+t.c,h=AIM106.tmap.get(k);if(h)return {k,r:t.r,c:t.c,ref:h.target.ref,body:false}}
  return null}
if(typeof pick==='function'){const base=pick;pick=function(e){const t=base.apply(this,arguments);if(AIM106.off||!e||e.clientX==null)return t;
  try{const a=aim106At(e,t);return a?{r:a.r,c:a.c}:t}catch(err){return t}}}
function aim106Cursor(on){try{cv.style.cursor=on?'crosshair':''}catch(e){}}
function aim106SetHov(a){const was=AIM106.hov;if(aim106Same(was,a)||(!was&&!a))return false;AIM106.hov=a;if(a&&!aim106Same(a,AIM106.sel))AIM106.t0=performance.now();aim106Cursor(!!a);return true}
/* mouse / pen hover, one test per animation frame; redraw only when the hovered target changed */
if(typeof cv!=='undefined'&&cv&&!AIM106.off){
  cv.addEventListener('pointerdown',e=>{AIM106.lastPT=e.pointerType||''},true);
  cv.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;AIM106.mx=e.clientX;AIM106.my=e.clientY;if(AIM106.raf)return;
    AIM106.raf=requestAnimationFrame(()=>{AIM106.raf=0;try{const a=aim106At({clientX:AIM106.mx,clientY:AIM106.my},(()=>{try{const b=cv.getBoundingClientRect();return aim106Tile(AIM106.mx-b.left,AIM106.my-b.top)}catch(err){return null}})());
      if(aim106SetHov(a))draw()}catch(err){console.error(err)}})});
  cv.addEventListener('pointerleave',()=>{if(aim106SetHov(null))draw()});
  /* touch: tap = select, tap the same target again = strike, tap elsewhere = cancel. Runs before 07-ui's click (window, capture). */
  window.addEventListener('click',e=>{try{if(e.target!==cv||!aim106Live())return;const pt=e.pointerType||AIM106.lastPT;if(pt!=='touch')return;
    const a=AIM106.tmap.size?aim106At(e,(()=>{const b=cv.getBoundingClientRect();return aim106Tile(e.clientX-b.left,e.clientY-b.top)})()):null;
    if(a){e.stopImmediatePropagation();e.preventDefault();
      if(aim106Same(a,AIM106.sel)){AIM106.sel=null;aim106Cursor(false);hoverTile={r:a.r,c:a.c};onTile(a.r,a.c);draw();return}
      AIM106.sel=a;AIM106.t0=performance.now();hoverTile={r:a.r,c:a.c};try{$('#hover').innerHTML=describeTile(hoverTile)}catch(err){}draw();return}
    if(AIM106.sel){AIM106.sel=null;draw()}}catch(err){console.error(err)}},true)}
/* the plain tile under a canvas point (07-ui pick's inverse iso + 168's view turn), without the body test */
function aim106Tile(x,y){const fr=((y-OY)/(TH/2)-(x-OX)/(TW/2))/2,fc=((x-OX)/(TW/2)+(y-OY)/(TH/2))/2;let r=Math.floor(fr),c=Math.floor(fc);if(!inB(r,c))return null;
  if(typeof ROT89!=='undefined'&&ROT89.k&&typeof rot89==='function'){const v=rot89(r,c,4-ROT89.k);r=v[0];c=v[1]}return {r,c}}

/* ---------- painting ---------- */
function aim106Pulse(){if(aim106Calm())return 1;const el=performance.now()-AIM106.t0;if(el>AIM106.pulseMs)return 1;return 0.6+0.4*(0.5+0.5*Math.cos(el/AIM106.pulseMs*Math.PI*6))}
/* the outline sprite: the figure's images drawn once into a canvas, ringed in red, the body punched out; cached by what was drawn */
function aim106Outline(fig){const ops=fig.ops,o0=ops[0].m,dpr=window.devicePixelRatio||1;
  const key=ops.map(o=>[aim106Id(o.img),o.sx,o.sy,o.sw,o.sh,o.dx.toFixed(1),o.dy.toFixed(1),o.dw.toFixed(1),o.dh.toFixed(1),o.m.slice(0,4).map(v=>v.toFixed(3)).join(','),(o.m[4]-o0[4]).toFixed(1),(o.m[5]-o0[5]).toFixed(1),(o0[4]%1).toFixed(1),(o0[5]%1).toFixed(1)].join(':')).join('|');
  let sp=AIM106.oc.get(key);
  if(!sp){const bb=fig.bb,pad=Math.ceil(3*dpr)+2,w=Math.ceil(bb.x1-bb.x0)+2*pad,h=Math.ceil(bb.y1-bb.y0)+2*pad;if(w<=0||h<=0||w>4096||h>4096)return;
    const ox=Math.floor(bb.x0)-pad,oy=Math.floor(bb.y0)-pad;
    const sil=document.createElement('canvas');sil.width=w;sil.height=h;const g=sil.getContext('2d');
    for(const o of ops){g.setTransform(o.m[0],o.m[1],o.m[2],o.m[3],o.m[4]-ox,o.m[5]-oy);try{g.drawImage(o.img,o.sx,o.sy,o.sw,o.sh,o.dx,o.dy,o.dw,o.dh)}catch(e){}}
    g.setTransform(1,0,0,1,0,0);
    let ty=0;try{const d=g.getImageData(0,0,w,h).data;let y=0;for(;y<h;y++){let hit=false;for(let x=0,i=y*w*4+3;x<w;x++,i+=4)if(d[i]>40){hit=true;break}if(hit)break}ty=y<h?y:0}catch(e){} /* the body's real top (the cell has headroom), for the tag */
    const out=document.createElement('canvas');out.width=w;out.height=h;const q=out.getContext('2d');const R=Math.max(1.5,2*dpr);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;q.drawImage(sil,Math.cos(a)*R,Math.sin(a)*R)}
    q.globalCompositeOperation='source-in';q.fillStyle='rgba(255,64,44,0.9)';q.fillRect(0,0,w,h);
    q.globalCompositeOperation='destination-out';q.drawImage(sil,0,0);q.globalCompositeOperation='source-over';
    sp={cv:out,ox:ox-o0[4],oy:oy-o0[5],ty};AIM106.oc.set(key,sp);AIM106.stats.built++;if(AIM106.oc.size>8)AIM106.oc.delete(AIM106.oc.keys().next().value)}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.85*aim106Pulse();ctx.drawImage(sp.cv,Math.round(o0[4]+sp.ox),Math.round(o0[5]+sp.oy));ctx.restore();
  fig.outlined=true;fig.top=o0[5]+sp.oy+sp.ty}
/* the red ring on the shown target's tile (under the figures) */
function aim106Ring(){const s=aim106Shown();if(!s)return;const a=aim106Pulse(),m=center(s.r,s.c);
  ctx.save();ctx.globalAlpha=a;tilePath(s.r,s.c,1);ctx.strokeStyle='#ff3b2a';ctx.lineWidth=Math.max(2,TW*0.05);ctx.stroke();
  ctx.lineWidth=Math.max(2.5,TW*0.06);ell(m.x,m.y,TW*0.4,TW*0.2);ctx.stroke();ctx.restore()}
/* the tag "Name · NN%" over the shown target */
function aim106Tag(){const s=aim106Shown();if(!s)return;const dpr=window.devicePixelRatio||1;const pct=aim106Chance(s.h);
  const txt=aim106Name(s.h)+(pct!=null?' · '+pct+'%':'');AIM106.tag=txt;
  const fig=AIM106.figs.find(f=>f.u===s.ref&&f.bb);let X,Y;
  if(fig){X=(fig.bb.x0+fig.bb.x1)/2;Y=fig.top!=null?fig.top:fig.bb.y0}else{const m=center(s.r,s.c),T=ctx.getTransform();const y=m.y-TW*0.55;X=T.a*m.x+T.c*y+T.e;Y=T.b*m.x+T.d*y+T.f}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);const fs=Math.round(12*dpr);ctx.font=`600 ${fs}px Alegreya Sans, sans-serif`;
  const tw=ctx.measureText(txt).width,pw=6*dpr,bh=fs+6*dpr,bw=tw+2*pw;let x=X-bw/2,y=Y-bh-4*dpr;
  x=Math.max(2,Math.min(cv.width-bw-2,x));y=Math.max(2,y);
  ctx.globalAlpha=0.92;ctx.fillStyle='rgba(22,12,8,.88)';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,bw,bh,4*dpr);else ctx.rect(x,y,bw,bh);ctx.fill();
  ctx.globalAlpha=1;ctx.strokeStyle='#ff3b2a';ctx.lineWidth=Math.max(1,dpr);ctx.stroke();
  ctx.fillStyle='#f4ecdb';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(txt,x+pw,y+bh/2+0.5);ctx.restore()}
/* a pulse frame is drawn only while the ring pulses (≈1.5 s after a pick), never under Reduce motion / Animations Off */
function aim106Tick(){if(AIM106.timer||aim106Calm()||!aim106Shown())return;const el=performance.now()-AIM106.t0;if(el>AIM106.pulseMs+50)return;
  AIM106.timer=setTimeout(()=>{AIM106.timer=0;try{if(aim106Shown())draw()}catch(e){}},90)}
if(typeof drawLayers93==='function'){const base=drawLayers93;drawLayers93=function(layers){if(AIM106.off||!Array.isArray(layers))return base.apply(this,arguments);
  const m=aim106Map();AIM106.tmap=m;AIM106.figs=[];AIM106.rec=m.size>0;
  if(!m.size){if(AIM106.hov||AIM106.sel){AIM106.hov=null;AIM106.sel=null;aim106Cursor(false)}return base.apply(this,arguments)}
  if(AIM106.hov&&!(m.get(AIM106.hov.k)&&m.get(AIM106.hov.k).target.ref===AIM106.hov.ref)){AIM106.hov=null;aim106Cursor(false)}
  if(AIM106.sel&&!(m.get(AIM106.sel.k)&&m.get(AIM106.sel.k).target.ref===AIM106.sel.ref))AIM106.sel=null;
  const L=layers.map(l=>{if(!Array.isArray(l))return l;
    if(l[0]==='highlights'){const f=l[1];return [l[0],function(){const r=f.apply(this,arguments);try{aim106Ring()}catch(e){console.error(e)}return r},...l.slice(2)]}
    if(l[0]==='overlays'){const f=l[1];return [l[0],function(){const r=f.apply(this,arguments);try{aim106Tag();aim106Tick()}catch(e){console.error(e)}return r},...l.slice(2)]}
    return l});
  try{return base.call(this,L)}finally{AIM106.rec=false}}}
/* 321's bs101Patch re-installs its ctx.drawImage when it is not the one in place: not while a figure is being recorded */
if(typeof bs101Patch==='function'){const base=bs101Patch;bs101Patch=function(){if(AIM106.inRec)return;return base.apply(this,arguments)}}
{const base=drawPlayer;drawPlayer=function(p){return aim106Rec(base,this,arguments,p)}}
{const base=drawNPC;drawNPC=function(n){return aim106Rec(base,this,arguments,n)}}

/* ---------- Confirm attacks (offline only) ---------- */
{const base=onTile;onTile=function(r,c){
  if(AIM106.off||AIM106.go||typeof SETTINGS==='undefined'||!SETTINGS.confirmAtk106||aim106Online())return base.apply(this,arguments);
  try{if(typeof RPP!=='undefined'&&RPP&&RPP.applying)return base.apply(this,arguments)}catch(e){}
  if(!S||S.over||typeof HL==='undefined')return base.apply(this,arguments);
  const h=HL.get(r*N+c);if(!h||(h.t!=='atk'&&h.t!=='catk')||!h.target)return base.apply(this,arguments);
  if(h.t==='atk'&&!(humanTurn()&&S.phase==='action'))return base.apply(this,arguments);
  if(h.t==='catk'&&!(S.phase==='command'&&S.cmd&&!S.cmd.lock))return base.apply(this,arguments);
  if(AIM106.asking||typeof ask76!=='function')return;AIM106.asking=true;const pct=aim106Chance(h);
  ask76(_T`Strike ${esc(aim106Name(h))}?`,pct!=null?_T`${pct}% to hit`:'',_T('Yes'),_T('No')).then(ok=>{AIM106.asking=false;if(!ok)return;
    AIM106.go=true;try{onTile(r,c)}finally{AIM106.go=false}}).catch(()=>{AIM106.asking=false})}}
/* Settings → General: the row (hidden in an Online match and with the kill switch) */
if(typeof settingsHTML==='function'){const base=settingsHTML;settingsHTML=function(tab){const h=base.apply(this,arguments);
  try{if(AIM106.off||typeof h!=='string'||(tab&&tab!=='general')||aim106Online())return h;const i=h.indexOf('data-set="ctxMenu"');if(i<0)return h;const j=h.indexOf('</label>',i);if(j<0)return h;
    const row=`<label class="setrow"><input type="checkbox" data-set="confirmAtk106" ${SETTINGS.confirmAtk106?'checked':''}><span>${_T`<b>⚔ Confirm attacks</b>`}<br><span class="hint" style="margin:0">${_T`Ask “Strike …?” before each attack. Not in Online matches.`}</span></span></label>`;
    return h.slice(0,j+8)+row+h.slice(j+8)}catch(e){return h}}}
