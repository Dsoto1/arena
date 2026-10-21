/* =====================================================================
   404-v107corpse — v1.07 beta-2 note 3 (his, with screenshot, 2026-10-19): the CORPSES on the sand (N11a — the fallen lie where they
   fell until the crew carts them out) are the 3D figure, never the old token minis tipped over. REPLACES 07's drawCorpseFig picture
   (the v0.33 token laid on its side, drained of colour) for the printed classes + the system beasts. DISPLAY ONLY: rules, dice (RNG), S,
   the log and the online hash are untouched — no rand(), nothing sent; 07 still decides WHO lies WHERE (piles / dead NPCs, gore, retired).
   • BEASTS (Tholo, bears, wolves, lions, snakes, Zora, Commodus …, 312's bst100Key): the LAST frame of the beast's die row (312's
     beast100_<k>_act sheet, die4) in the facing it fell (312's ghost face, else miniFace at its death), drawn by 312's bst100Cell (its
     cached pre-scaled cell). While 312's ghost plays the die row the corpse waits (the ghost then holds die4 and fades over it).
   • GLADIATORS: 321 already keeps the last fall frame when 311's ghost fell (CORPSE101) — left as it is. Every other corpse pile of a
     printed class (no ghost: Fast/To the end/Animations Off when he fell, a resumed match, the act sheet still loading) draws the last
     frame of 311's fall row (an100Cell, the facing he had when eliminated) — one lost limb = that limb's severed set.
   • FALLBACK (standalone download — mkshare skips anim100_* / beast100_*; no sheet yet; a load failed; two lost limbs): a LYING POSE made
     from 400's still sheet (still107_<cls> / still107_b_<beast>) — the idle cell in its facing, laid on its side (humanoids) or flattened
     low (four-legged beasts), drained a little; built ONCE per (key, facing, scale) into a cached canvas (LRU 64). Nothing loaded yet →
     only the contact disc this frame (the sheet's onload redraws). Custom (Studio) beasts / boar / croc kinds keep today's picture.
   • LIGHT: the contact disc through fl104Sh (399's contact rule for figures; MINI_CUR is null in 'decals' → a plain contact disc).
     Same place and layer as 07's corpse ('decals', where 07 calls drawCorpseFig); the crew's cart (238) is untouched.
   • COST: one cached bitmap blit per corpse a frame, no filter per frame (the drained look is baked into the lying canvas).
   • beta 4 (his note: a bear corpse 2–3 tiles big): every corpse is checked against the LIVING scale — the die frame's cut once per
     (kind, facing), its drawn size (and a gladiator's fall frame) every frame; a mismatch → the lying still (see "beta 4" below).
   Kill switch localStorage flavius_v107corpseoff=1 → 07's corpse exactly. Test tv107g.
   ===================================================================== */
/* the upright beasts (lie on their side like a gladiator); every other system beast is four-legged or a snake (flattened low) */
const CV107_UP=['tholo','commodus','zora'];
const CV107={on:true,face:new WeakMap(),gface:new Map(),used:new Set(),frame:0,lie:new Map(),lieMax:64,stats:{d3:0,g3:0,lie:0,wait:0,none:0,base:0,built:0}};
try{if(localStorage.getItem('flavius_v107corpseoff')==='1')CV107.on=false}catch(e){}
/* the facing a beast / gladiator had when it died (kept, so a corpse never turns) */
function cv107BeastFace(n,k){let f=CV107.face.get(n);if(f!=null)return f;
  try{const g=typeof BST100!=='undefined'&&BST100.ghosts.find(x=>x.n===n);f=g?g.face:(typeof miniFace==='function'?miniFace(n,k):0)}catch(e){f=0}
  CV107.face.set(n,f||0);return f||0}
/* the dead NPC this drawCorpseFig call is for: a dead NPC on that tile not yet drawn this frame (07 walks S.npcs in order) */
function cv107Npc(m){try{for(const n of S.npcs||[]){if(n.alive||n.gone||CV107.used.has(n))continue;const c=center(n.r,n.c);
  if(Math.abs(c.x-m.x)<0.5&&Math.abs(c.y-m.y)<0.5){CV107.used.add(n);return n}}}catch(e){}return null}
function cv107Pile(m,col){try{for(const pl of S.piles||[]){if(!pl.corpse||pl.gone||CV107.used.has(pl))continue;const c=center(pl.r,pl.c);
  if(Math.abs(c.x-m.x)<0.5&&Math.abs(c.y-m.y)<0.5&&(!col||pl.color===col)){CV107.used.add(pl);return pl}}}catch(e){}return null}
/* the screen device ratio (cached canvases at device size, like 311's an100CellCanvas) */
function cv107DS(){try{const t=ctx.getTransform();return Math.max(0.25,Math.hypot(t.a,t.b)||1)}catch(e){return 1}}
/* cv107Lie — the lying canvas of one still cell: im/sx/sy/w/h = the cell, ax/ay = its anchor (base centre / top), s = screen px per cell px,
   side ±1, B = the base in cell px {rx, ry, cy, rim}. flat (four-legged, snakes): the whole cell, base and all, pressed low (like 312's die
   frames, which keep the base). Upright (gladiators, Tholo, Commodus, Zora): the base is painted flat in its own colours (sampled from the
   cell once) and the body — the base and the shins over it erased, its cut end on the base centre — laid across it on its side, like 311's last fall frame.
   Returns {c, mx, my, k}: (mx, my) = the canvas point that goes on the tile centre, k = cell px → canvas px. */
function cv107Lie(key,im,sx,sy,w,h,ax,ay,s,flat,side,B){const ds=cv107DS(),q=Math.round(Math.log(s*ds)*33),sq=Math.exp(q/33),id=key+'|'+sx+'|'+q+'|'+side+(flat?'f':'h');
  let e=CV107.lie.get(id);if(e){CV107.lie.delete(id);CV107.lie.set(id,e);return e}
  const t=document.createElement('canvas');t.width=Math.max(1,Math.ceil(w));t.height=Math.max(1,Math.ceil(h));const tg=t.getContext('2d',{willReadFrequently:true});tg.drawImage(im,sx,sy,w,h,0,0,w,h);
  let top=null,rim=null;
  if(!flat&&B){const px=(x,y)=>{try{const d=tg.getImageData(Math.max(0,Math.min(w-1,Math.round(x))),Math.max(0,Math.min(h-1,Math.round(y))),1,1).data;return d[3]>200?'rgb('+d[0]+','+d[1]+','+d[2]+')':null}catch(x){return null}};
    const tc=(x,y)=>{try{const d=tg.getImageData(Math.max(0,Math.min(w-1,Math.round(x))),Math.max(0,Math.min(h-1,Math.round(y))),1,1).data;return d[3]>200?[d[0],d[1],d[2]]:null}catch(x){return null}};
    const T0=tc(ax-B.rx*0.75,B.cy)||tc(ax+B.rx*0.75,B.cy)||[217,196,154],R0=tc(ax,B.cy+B.ry+B.rim*0.55)||[90,70,50];top='rgb('+T0+')';rim='rgb('+R0+')';
    tg.save();tg.globalCompositeOperation='destination-out';tg.beginPath();tg.ellipse(ax,B.cy,B.rx+3,B.ry+3,0,0,Math.PI*2);tg.rect(0,B.cy,w,h-B.cy);tg.fill();tg.restore();
}
  const ang=flat?0.06*side:1.4*side,F=flat?0.66:0.85;   /* TWEAK: tilt (rad) and the squash of the lying body */
  const ca=Math.cos(ang),sa=Math.sin(ang);const T=(x,y)=>[(x*ca-y*sa)*sq,(x*sa+y*ca)*F*sq];const by=top?Math.max(0,B.cy-B.ry-3):ay;
  const P=[T(-ax,-by),T(w-ax,-by),T(-ax,h-by),T(w-ax,h-by)];if(top){const bx=(B.rx+2)*sq;P.push([-bx,(B.cy-ay-B.ry-2)*sq],[bx,(B.cy-ay+B.ry+B.rim+2)*sq])}
  const x0=Math.min(...P.map(p=>p[0])),x1=Math.max(...P.map(p=>p[0])),y0=Math.min(...P.map(p=>p[1])),y1=Math.max(...P.map(p=>p[1]));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(x1-x0)+2);c.height=Math.max(1,Math.ceil(y1-y0)+2);const g=c.getContext('2d');
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  if(top){/* the base, flat: rim then top (B.cy = its top centre, relative to the anchor) */const ox=1-x0,oy=1-y0+(B.cy-ay)*sq;
    g.fillStyle=rim;g.beginPath();g.ellipse(ox,oy+B.rim*sq,B.rx*sq,B.ry*sq,0,0,Math.PI);g.lineTo(ox-B.rx*sq,oy);g.ellipse(ox,oy,B.rx*sq,B.ry*sq,0,Math.PI,0,true);g.fill();
    g.fillStyle=top;g.beginPath();g.ellipse(ox,oy,B.rx*sq,B.ry*sq,0,0,Math.PI*2);g.fill()}
  g.setTransform(sq,0,0,F*sq,1-x0,1-y0);g.rotate(ang);
  try{g.filter='saturate(.6) brightness(.82)'}catch(x){}   /* TWEAK: the drained look, baked once */
  g.drawImage(t,-ax,-by,w,h);
  /* on the tile centre: the base (upright) or the body's middle (flat) */
  const mid=top?[0,0]:T(w/2-ax,h*0.62-by);e={c,mx:mid[0]+1-x0,my:mid[1]+1-y0,k:sq};CV107.stats.built++;CV107.lie.set(id,e);while(CV107.lie.size>CV107.lieMax)CV107.lie.delete(CV107.lie.keys().next().value);return e}
function cv107Disc(x,y,rx,ry){try{ctx.save();ctx.fillStyle='rgba(0,0,0,.3)';if(typeof fl104Sh==='function')fl104Sh(x+2,y+3,rx,ry);else{ell(x,y,rx,ry);ctx.fill()}ctx.restore()}catch(e){}}
function cv107DrawLie(e,m,s,rx,ry){cv107Disc(m.x,m.y,rx,ry);const k=s/e.k;ctx.drawImage(e.c,m.x-e.mx*k,m.y-e.my*k,e.c.width*k,e.c.height*k)}

/* ---------------- beta 4 · the corpse at the LIVING beast's size (his note: a bear corpse drawn 2–3 tiles big) ----------------
   Measured in Chromium (tv107g 5, every system beast, zoom 1 / 1.4 / 2, DPR 1 / 2, bases on / off, sheets / stills): the die4 cell is drawn
   at exactly the living beast's px per sheet px, its visible body 0.8–1.0 × the living one, centred on its tile. Two checks keep it so on any
   browser / wrapper, both cheap: (1) SANE — once per (beast, facing) the die4 cell cut from the act sheet is compared with the idle cell cut
   from the move sheet (the same cut 312 makes, native size): a lying body has 0.7–1.0 × the standing one's visible pixels; a cut that
   is not that (a mis-decoded / mis-cut sheet: a zoomed-in part of it fills the cell) never draws — the lying still does; (2) SIZE — the
   die4 cell's draw call this frame is measured (device px): off the living scale (aw × bst100Scale × the screen ratio) by more than
   15–18 % → that beast kind uses the lying still from the next frame on (CV107.bad). CV107.stats.insane / .bad count them. */
CV107.bad=new Set();CV107.sane=new Map();CV107.stats.insane=0;CV107.stats.bad=0;CV107.lastSz=null;
function cv107Alpha(im,x,y,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,x,y,w,h,0,0,w,h);
  const d=g.getImageData(0,0,w,h).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>=128)n++;return n}
function cv107Sane(k,face){const id=k+'|'+face;let v=CV107.sane.get(id);if(v!=null)return v;v=true;
  try{const M=BEAST100_META[k],ia=bst100Img(k,1),im=bst100Img(k,0),r=M.ar.indexOf('die4'),r0=Math.max(0,M.ir.indexOf('idle0'));
    if(ia&&im&&r>=0){const a=cv107Alpha(ia,face*M.aw[0],r*M.aw[1],M.aw[0],M.aw[1]),b=cv107Alpha(im,face*M.iw[0],r0*M.iw[1],M.iw[0],M.iw[1]);
      const lin=b?Math.sqrt(a/b):0;v=a>0&&lin>0.6&&lin<1.45;   /* TWEAK: the sheets give 0.84–0.99 */
      if(!v){CV107.stats.insane++;console.warn('404: the '+k+' die frame (facing '+face+') does not match its idle frame ('+lin.toFixed(2)+'×): the lying still is drawn')}}}
  catch(e){v=true}   /* unreadable (file://): 312's cell as before */
  CV107.sane.set(id,v);return v}
/* the biggest image fn draws on ctx (device px), r = fn's result */
/* (measured on ctx's own drawImage AND at 321's native call: 321's bs101Patch, run inside an100Cell, puts its own drawImage in place) */
function cv107Size(fn){const own=Object.prototype.hasOwnProperty.call(ctx,'drawImage'),prev=ctx.drawImage,B=typeof BS101!=='undefined'?BS101:null,nat=B&&B.nat;let w=0,h=0;
  const see=(g,A)=>{try{const img=A[0];if(g!==ctx||!img||img._l106)return;   /* 399's shadow sprites are not the body */
    const n=A.length,dw=n>=9?A[7]:n>=5?A[3]:img.width,dh=n>=9?A[8]:n>=5?A[4]:img.height,t=g.getTransform(),k=Math.hypot(t.a,t.b);if(dw*k>w){w=dw*k;h=dh*k}}catch(e){}};
  ctx.drawImage=function(){see(this,arguments);return prev.apply(this,arguments)};
  if(nat)B.nat=function(){see(this,arguments);return nat.apply(this,arguments)};
  let r=null;try{r=fn()}finally{if(nat)B.nat=nat;if(own)ctx.drawImage=prev;else delete ctx.drawImage}return {r,w,h}}
function cv107Check(k,sz,exp){CV107.lastSz={k,w:sz.w,exp};if(!(exp>0)||!(sz.w>0))return;const q=sz.w/exp;
  if(q<0.85||q>1.18){CV107.bad.add(k);CV107.stats.bad++;console.warn('404: the '+k+' corpse drew at '+q.toFixed(2)+'× the living scale: the lying still from now on')}}   /* TWEAK: tolerance */

/* ---------------- beasts ---------------- */
function cv107Beast(n,m){const k=typeof bst100Key==='function'?bst100Key(n):null;if(!k||!BEAST100_META[k]||!BEAST100_META[k].ar)return false;const M=BEAST100_META[k];
  const face=cv107BeastFace(n,k);
  /* 312's ghost still plays the die row → it draws the body */
  try{const g=BST100.ghosts.find(x=>x.n===n&&x.S===S);if(g){const st=BST100.step*bst100K(),ai=BST100.img[k+'_act'];
    if(g.t0?performance.now()-g.t0<st*5:!(ai&&ai._bad)){CV107.stats.wait++;return true}}}catch(e){}   /* its sheet failed → the still below */
  const can3=typeof BST100!=='undefined'&&BST100.on&&!HEADLESS;
  if(can3&&bst100Img(k,0)&&bst100Img(k,1)&&!CV107.bad.has(k)&&cv107Sane(k,face)){const L=M.base?Math.min(M.base[0]*TW*MINI_BASE/25.4,TW*MINI_FIT)*0.55:TW*MINI_BASE*0.55;
    cv107Disc(m.x,m.y,L,L*(M.base?(M.base[1]/M.base[0])*0.75:0.5));
    const sz=cv107Size(()=>bst100Cell(k,face,{act:true,name:'die4'},m.x,m.y,null));
    if(sz.r!=null){cv107Check(k,sz,M.aw[0]*bst100Scale(M)*cv107DS());CV107.stats.d3++;return true}}
  /* the still, lying */
  const im=typeof st107Img==='function'&&typeof ST107!=='undefined'&&ST107.on?st107Img(k):null;const M1=typeof BST108X1!=='undefined'&&BST108X1[k]||M,me=M1.iw,s=bst100Scale(M1);   /* v1.08b: the still is cut from the 1× sheet (410 may hold the 2× meta) */
  const flat=!CV107_UP.includes(k);const rx=flat?TW*0.42:TW*0.34;
  const bw=M1.base||[25.4,25.4],B=M1.base?{rx:bw[0]/2*M1.px,ry:bw[1]/4*M1.px,cy:me[3],rim:BST100_BASE_MM*M1.px}:null;
  if(!im){cv107Disc(m.x,m.y,rx,rx*0.4);CV107.stats.none++;return true}
  const lf=flat&&face%4===0?face+2:face;   /* a four-legged body seen side-on (front / back views read as standing) */
  const e=cv107Lie('b:'+k,im,lf*me[0],0,me[0],me[1],me[2],me[3],s,flat,face<4?1:-1,B);cv107DrawLie(e,m,s,rx,rx*0.4);CV107.stats.lie++;return true}

/* ---------------- gladiators ---------------- */
const cv107Lost=pl=>pl&&pl.sev?['rarm','larm','rleg','lleg'].filter(l=>pl.sev[l]):[];
function cv107Glad(pl,m,sp){let cls=pl.cls;try{if(typeof st107ClsOf==='function')cls=st107ClsOf({cls:pl.cls})}catch(e){}if(!cls||typeof ANIM100_META==='undefined'||!ANIM100_META[cls])return false;
  const gf=CV107.gface.get(pl.owner);const face=gf&&gf.S===S?gf.face:0;const lost=cv107Lost(pl);
  if(typeof AN100!=='undefined'&&AN100.on&&!HEADLESS&&lost.length<=1&&typeof an100Printed==='function'){const src=an100Printed(cls,lost[0]||'');
    const R=src&&src.act&&src.act.meta.rows.fall;if(R&&!CV107.bad.has('g:'+cls)&&an100Bm(src,'act','fall')){const keep=AN100.cur;AN100.cur={color:null};
      try{const sz=cv107Size(()=>an100Cell(src,{set:'act',name:'fall',i:R.length-1},face,m.x,m.y,null));
        if(sz.r!=null){cv107Check('g:'+cls,sz,R[R.length-1][1]*TW*MINI_BASE/25.4/src.act.meta.pxmm*cv107DS());CV107.stats.g3++;return true}}finally{AN100.cur=keep}}}
  const im=typeof st107Img==='function'&&typeof ST107!=='undefined'&&ST107.on?st107Img(cls):null;const Mv=ANIM100_META[cls].move,r=Mv.rows.idle[0];
  if(!im){cv107Disc(m.x,m.y,TW*0.34,TW*0.13);CV107.stats.none++;return true}
  const s=TW*MINI_BASE/25.4/Mv.pxmm;const e=cv107Lie('g:'+cls,im,face*r[1],0,r[1],r[2],r[3],r[4],s,false,face<4?1:-1,{rx:12.75*Mv.pxmm,ry:6.4*Mv.pxmm,cy:r[4]-2.5*Mv.pxmm,rim:2.8*Mv.pxmm});cv107DrawLie(e,m,s,TW*0.34,TW*0.13);CV107.stats.lie++;return true}

if(CV107.on){
  {const base=draw;draw=function(){CV107.used.clear();CV107.frame++;return base.apply(this,arguments)}}
  {const base=drawCorpseFig;drawCorpseFig=function(m,sp,col){try{if(!HEADLESS&&typeof S!=='undefined'&&S&&m){
      if(col){const pl=cv107Pile(m,col);if(pl&&!pl.retiredOut){
          /* 321 keeps the 3D fall frame of a gladiator whose ghost fell → its own drawing (it skips this one) */
          if(typeof CORPSE101!=='undefined'&&CORPSE101.some(g=>g.S===S&&g.r===pl.r&&g.c===pl.c&&g.src&&g.src.act&&g.src.act.meta.rows.fall))return base.apply(this,arguments);
          if(cv107Glad(pl,m,sp))return}}
      else{const n=cv107Npc(m);if(n&&cv107Beast(n,m))return}}}catch(e){console.error(e)}
    CV107.stats.base++;return base.apply(this,arguments)}}
  if(typeof BUS!=='undefined'){
    BUS.on('hit',e=>{try{if(!e||e.sim||!e.target||!e.target.npc||!S)return;const n=S.npcs.find(x=>x.id===e.target.id);if(n&&!n.alive&&typeof bst100Key==='function'){const k=bst100Key(n);if(k)cv107BeastFace(n,k)}}catch(x){}});
    BUS.on('elim',e=>{try{if(!e||e.sim||!e.victim||!S)return;const v=S.players.find(p=>p.id===e.victim.id);if(v)CV107.gface.set(v.id,{S,face:typeof miniFace==='function'?miniFace(v,'t93'):0})}catch(x){}});
    BUS.on('event.start',()=>{CV107.gface.clear()});
  }
}
