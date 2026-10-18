/* =====================================================================
   398-v106b1b — v1.06 beta-1 fixes G5 + G4 (his beta-1 notes, answers g4a g5a; tools/plans/v106/NOTES.md). Kill switch localStorage
   flavius_v106b1boff=1 (everything below back to v1.06a). Test tv106f.
   G5a NO RINGS UNDER FIGURES (REPLACES the v1.0 team rings at the mini bases, thinned in v1.03 346, moved to the floor in v1.04 356/359):
     • the gold turn ring (bit 1), the seat ring + 07's thin team ring (2), a tamed beast's owner ring (4), a Raged beast's red ring (8), the
       seat colour on the base rim (16, 311/222's arc + 356's floor ring), 227's team ring + tint (32), the truce dashed ring (128): 356's
       `fl104Has` answers "already drawn" for those bits, so 07 / 227 / 311 / 222 / 78-v60 skip them everywhere; inside 356's floor pass
       `fl104Ring` paints nothing and, in team events, its inline team ring + tint are muted by a gated stroke / fill set once on the board
       context; the shadow disc (fl104Shadow) and 359's extras (b2Extra: the attack / net target rings and the Guide's suggestion ring —
       tactical marks) stay; its truce ring goes.
     • KEPT: the move / attack highlights, 396's aim ring on hover, the hover tile, the pennant over the head, the tamed beast's blue HP
       bar, the Raged colour filter. NEW: the tile under the piece whose turn it is is highlighted (gold, the 'highlights' layer, under
       every figure) — the turn cue the gold ring was.
     • Team events (Familia 2v2, team1 end …): with the rings gone the board had no team cue (the pennant is the SEAT colour), so a small
       team-colour chip with the team letter rides beside the pennant (drawn with the figure, so it follows glides / shoves).
   G5 SPECKS + DASHED RINGS + DARK RING UNDER THE BEARS: leftovers of the base flood ("Show token bases" off) on the 3D beast sheets — 334's
     g6Proc (wolves, bears, lions, Zora), 346's b103Wall (snakes: the yellow rim band → the "dashed ring") and b103Proc (Tholo, Commodus)
     leave pixel islands of the base's rim / wood around the feet; the v1.06a re-lit sheets left more of them. Not the v1.06a shadow sheets
     (their alpha has no stray low-alpha pixels; tv106f scans them). FIX `cl398`, once per processed cell: a 3×3 opening inside the base's
     rim band (thin rim / wall strokes still touching a foot), then connected pieces (alpha ≥ 24, 8-neighbours) cleared when small (< 6 % of
     the biggest piece) in the base's footprint, or a band piece (< 15 %, ≥ 70 % of it in the rim band), then faint orphans there.
   G5 FLAT DARK BEAST: Moechus (the second wolf) — his sculpt's fur #5c5856 rendered at ~55/255 with almost no shading, a flat black
     silhouette on the sand (on a grey disc with Lighting Off). Re-rendered with fur #8c8884 (tools/plans/look100/beast5_rig.js;
     `node tools/art/anim100b/make.js l106 moechus`, his baked shadow sheets kept: the silhouette did not change). No code here.
   G4a MATCH WEEK: a fought bout's box on the right of its row (360's mw105ResTag) shows OUR fighter: face (gArt), name, Won / Lost / Fell
     and the purse he brought home (319's house101.by); none of ours → the winner's face + name. A verdict still waiting keeps its line.
   Display only: never S, rand(), the log, a save or the online hash. Reduce motion / Animations Off: nothing here animates.
   ===================================================================== */
const B1B106={off:(()=>{try{return localStorage.getItem('flavius_v106b1boff')==='1'}catch(e){return false}})(),
  RING:1|2|4|8|16|32|128,mute:0,allow:0,inX:0,curP:null,st:{clean:0,px:0,isl:0,tile:0,chip:0,muted:0}};

/* ---------------- G5a · no rings under figures ---------------- */
if(!B1B106.off&&typeof fl104Has==='function'){const base=fl104Has;fl104Has=function(p,bit){if(bit&B1B106.RING)return true;return base.apply(this,arguments)}}
/* the floor pass: 356's rings (fl104Ring) are not painted; in a team event its team ring + tint (drawn inline there) are muted by a gated
   stroke / fill on the board's context, installed ONCE per context (never added / removed per frame — that would re-shape ctx every draw);
   the shadow disc (fl104Shadow) and 359's target rings (b2Extra) are let through */
if(!B1B106.off&&typeof fl104Ring==='function'){const base=fl104Ring;fl104Ring=function(){if(B1B106.mute&&!B1B106.allow)return;return base.apply(this,arguments)}}
function b1bGate(c){if(!c||(c.stroke&&c.stroke._b1b))return;const P=CanvasRenderingContext2D.prototype,hs=Object.prototype.hasOwnProperty;
  const S0=hs.call(c,'stroke')?c.stroke:null,F0=hs.call(c,'fill')?c.fill:null;
  const s=function(){if(B1B106.mute===2&&!B1B106.allow){B1B106.st.muted++;return}return (S0||P.stroke).apply(this,arguments)};
  const f=function(){if(B1B106.mute===2&&!B1B106.allow){B1B106.st.muted++;return}return (F0||P.fill).apply(this,arguments)};
  s._b1b=f._b1b=1;c.stroke=s;c.fill=f;B1B106.st.gate=(B1B106.st.gate||0)+1}
if(!B1B106.off&&typeof floor104==='function'){const base=floor104;floor104=function(){if(HEADLESS||typeof ctx==='undefined')return base.apply(this,arguments);
  let m=1;try{if(b1bTeams()){b1bGate(ctx);m=2}}catch(e){}B1B106.mute=m;B1B106.allow=0;try{return base.apply(this,arguments)}finally{B1B106.mute=0;B1B106.allow=0}}}
if(!B1B106.off&&typeof fl104Shadow==='function'){const base=fl104Shadow;fl104Shadow=function(){const a=B1B106.allow;B1B106.allow=1;try{return base.apply(this,arguments)}finally{B1B106.allow=a}}}
if(!B1B106.off&&typeof b2Extra==='function'){const base=b2Extra;b2Extra=function(){const a=B1B106.allow;B1B106.allow=1;B1B106.inX=1;try{return base.apply(this,arguments)}finally{B1B106.allow=a;B1B106.inX=0}}}
if(!B1B106.off&&typeof truceViewer==='function'){const base=truceViewer;truceViewer=function(){if(B1B106.inX)return null;return base.apply(this,arguments)}}

/* the tile under the piece whose turn it is (the 'highlights' layer: under every figure, under the move fan) */
function b1bActive(){try{if(B1B106.off||!S||S.over||!S.players)return null;if(typeof isChariot==='function'&&isChariot())return null;const p=S.players[S.cur];
  if(!p||!p.alive||p.exited||p.underground||p.r==null||p.c==null)return null;return p}catch(e){return null}}
function b1bTile(){const p=b1bActive();if(!p||typeof tilePath!=='function')return;ctx.save();try{
  tilePath(p.r,p.c,2);ctx.globalAlpha=1;ctx.fillStyle='rgba(240,207,125,.30)';ctx.fill();ctx.strokeStyle='rgba(240,207,125,.95)';ctx.lineWidth=Math.max(1.5,TW*0.03);ctx.stroke();B1B106.st.tile++}
  catch(e){console.error(e)}finally{ctx.restore()}}
if(!B1B106.off&&typeof drawLayers93==='function'){const base=drawLayers93;drawLayers93=function(layers){if(!Array.isArray(layers))return base.apply(this,arguments);
  const L=layers.map(l=>{if(!Array.isArray(l)||l[0]!=='highlights'||typeof l[1]!=='function')return l;const f=l[1];return [l[0],function(){try{b1bTile()}catch(e){}return f.apply(this,arguments)},...l.slice(2)]});
  return base.call(this,L)}}

/* team events: a team-colour chip beside the pennant */
function b1bTeams(){try{const ev=EV();return !!(ev&&(ev.teams||ev.coop))}catch(e){return false}}
function b1bInk(col){try{const m=/^#?([0-9a-f]{6})$/i.exec(String(col).trim());if(!m)return '#14100c';const v=parseInt(m[1],16),r=v>>16,g=(v>>8)&255,bl=v&255;return (r*299+g*587+bl*114)/1000>140?'#14100c':'#fff4e0'}catch(e){return '#14100c'}}
function b1bChip(p,x,top){if(top==null||!isFinite(top)||!p||!p.team||!b1bTeams())return;const col=typeof teamColor==='function'?teamColor(p.team):'#888';
  try{if(ctx.getTransform().d<0)return}catch(e){} /* 193's mirrored figures */
  const t0=String(p.team).slice(0,2),w=Math.max(t0.length>1?17:12,TW*(t0.length>1?0.26:0.19)),h=Math.max(11,TW*0.15),x0=x+6.5,y0=top-5.5-h/2;ctx.save();try{ctx.globalAlpha=1;ctx.filter='none';ctx.shadowColor='transparent';
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x0,y0,w,h,2.5);else ctx.rect(x0,y0,w,h);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='rgba(10,6,4,.85)';ctx.lineWidth=1.2;ctx.stroke();
    const t=t0;{ctx.fillStyle=b1bInk(col);ctx.font=`700 ${Math.round(h*0.8)}px IBM Plex Mono, monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x0+w/2,y0+h/2+0.5)}
    B1B106.st.chip++}catch(e){console.error(e)}finally{ctx.restore()}}
if(!B1B106.off){
  {const base=drawPlayer;drawPlayer=function(p){const was=B1B106.curP;B1B106.curP=p||null;try{return base.apply(this,arguments)}finally{B1B106.curP=was}}}
  for(const nm of ['drawFigureTok','drawStandee']){try{const base=eval(nm);if(typeof base!=='function')continue;
    const wr=function(sp,x,y){const p=B1B106.curP;B1B106.curP=null;let r;try{r=base.apply(this,arguments)}finally{B1B106.curP=p}
      if(p&&!HEADLESS)try{b1bChip(p,x,r)}catch(e){}return r};
    if(nm==='drawFigureTok')drawFigureTok=wr;else drawStandee=wr}catch(e){console.error(e)}}}

/* ---------------- G5 · base-flood leftovers on the beast sheets ---------------- */
function cl398(c,M,me,face){if(!c||c._cl398||!c.width)return c;c._cl398=1;try{
  const W=c.width,H=c.height,cx=me[2],cy=me[3],g=c.getContext('2d');const id=g.getImageData(0,0,W,H),d=id.data;
  let inB=()=>true,inRim=()=>false;
  if(typeof g6Geom==='function'&&M&&M.base){const G=g6Geom(M,face||0),T=G.T,m=1.3;const q=(dx,dy)=>{const u=G.inv[0][0]*dx+G.inv[0][1]*dy,v=G.inv[1][0]*dx+G.inv[1][1]*dy;return u*u+v*v};
    inB=(x,y)=>{const dx=x+0.5-cx,dy=y+0.5-cy;if(dy<-Math.hypot(G.A[1][0],G.A[1][1])*m)return false;for(let f=0;f<=1.001;f+=0.25)if(q(dx,dy-T*f)<=m*m)return true;return false};
    inRim=(x,y)=>inB(x,y)&&q(x+0.5-cx,y+0.5-cy)>0.8*0.8}   /* the base's rim band + wall: outside 80 % of its top */
  const SOL=24,lab=new Int32Array(W*H),comps=[];let n=0;const st=[];let cut=0;
  /* thin rim / wall strokes still touching a foot: an opening (3×3) inside the rim band takes lines under 3 px off */
  {const sol=i=>d[i*4+3]>=SOL;const E=new Uint8Array(W*H);
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(!sol(i))continue;let all=true;for(let a=-1;a<=1&&all;a++)for(let b=-1;b<=1;b++)if(!sol(i+a*W+b)){all=false;break}if(all)E[i]=1}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!sol(i)||!inRim(x,y))continue;let o=false;
      for(let a=-1;a<=1&&!o;a++)for(let b=-1;b<=1;b++){const X=x+b,Y=y+a;if(X<0||Y<0||X>=W||Y>=H)continue;if(E[Y*W+X]){o=true;break}}
      if(!o){d[i*4+3]=0;cut++}}}
  for(let i=0;i<W*H;i++){if(lab[i]||d[i*4+3]<SOL)continue;n++;let size=0,sx=0,sy=0;st.push(i);lab[i]=n;const px=[];
    while(st.length){const j=st.pop();px.push(j);size++;const x=j%W,y=(j/W)|0;sx+=x;sy+=y;
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)continue;const k=Y*W+X;if(lab[k]||d[k*4+3]<SOL)continue;lab[k]=n;st.push(k)}}
    comps.push({n,size,cx:sx/size,cy:sy/size,px})}
  if(!comps.length)return c;let big=0;for(const k of comps)big=Math.max(big,k.size);
  for(const k of comps){let rim=0;if(k.size<big*0.15)for(const j of k.px)if(inRim(j%W,(j/W)|0))rim++;
    const drop=(k.size<Math.max(4,big*0.06)&&inB(k.cx,k.cy))||(k.size<big*0.15&&rim>=k.size*0.7); /* a small piece, or a band piece lying in the rim / wall */
    if(!drop)continue;for(const j of k.px){d[j*4+3]=0;lab[j]=-1}cut+=k.size;B1B106.st.isl++}
  /* faint pixels in the footprint with no solid neighbour left */
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;const al=d[i*4+3];if(!al||al>=SOL||!inB(x,y))continue;let keep=false;
    for(let a=-2;a<=2&&!keep;a++)for(let b=-2;b<=2;b++){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)continue;if(lab[Y*W+X]>0){keep=true;break}}
    if(!keep){d[i*4+3]=0;cut++}}
  if(cut){g.putImageData(id,0,0);B1B106.st.px+=cut}B1B106.st.clean++}catch(e){}return c}
if(!B1B106.off){for(const nm of ['g6Proc','b103Wall','b103Proc']){try{const base=eval(nm);if(typeof base!=='function')continue;
  const wr=function(im,M,me,face){const c=base.apply(this,arguments);return c?cl398(c,M,me,face):c};
  if(nm==='g6Proc')g6Proc=wr;else if(nm==='b103Wall')b103Wall=wr;else b103Proc=wr}catch(e){console.error(e)}}}

/* ---------------- G4a · Match Week: our fighter in the result box ---------------- */
function b1bRes(w,b){const R=b&&b.res;if(!R)return null;let mine=new Set();try{mine=new Set(rosterOf(me()).map(g=>g.id))}catch(e){}
  const own=b.ents.filter(id=>{try{return typeof mw105Own==='function'?mw105Own(w,b,id,mine):mine.has(id)}catch(e){return mine.has(id)}});
  const rowOf=id=>(R.rows||[]).find(x=>x.gid===id)||null;const by=R.house101&&R.house101.by||{};
  if(own.length){return own.map(id=>{const g=gById(id),r=rowOf(id);const dead=!!(r&&(r.vd==='killed'||(g&&g.alive===false)));
    const res=r&&r.won?'won':dead?'fell':'lost';return {g,id,res,purse:typeof by[id]==='number'?by[id]:null,mine:true}})}
  const win=(R.winners||[]).map(id=>({g:gById(id),id,res:'won',purse:null,mine:false})).filter(x=>x.g);return win}
function b1bResTagHTML(w,b,vd){const L=b1bRes(w,b);if(!L)return null;
  const lab={won:_T('Won'),lost:_T('Lost'),fell:_T('Fell')};
  const rows=L.map(x=>{const art=typeof gArt==='function'&&x.g?gArt(x.g,'xs'):'';
    const pu=x.mine?(x.purse!=null?`<em class="mw398pu">${_T`purse ${(x.purse>=0?'+':'−')+coinAmt87(Math.abs(x.purse))}`}</em>`:`<em class="mw398pu">${_T('no purse')}</em>`):'';
    return `<span class="mw398f ${x.res}" data-mw398="${esc(x.id)}">${art}<span><b>${esc(x.g?x.g.name:'?')}</b><small>${x.mine?`<i class="mw398r">${lab[x.res]}</i>${pu}`:`<i class="mw398r">${_T('🏆 Won the bout')}</i>`}</small></span></span>`}).join('');
  const sub=vd?`<small class="mw398v">${_T('A verdict waits on your fighter')}</small>`:'';
  const fell=L.some(x=>x.mine&&x.res==='fell');
  return `<div class="mw105rt mw398${vd?' vd':fell?' mw398x':''}">${rows||`<b>${_T('No winner')}</b>`}${sub}</div>`}
if(!B1B106.off&&typeof mw105ResTag==='function'){const base=mw105ResTag;mw105ResTag=function(w,b,vd){try{const h=b1bResTagHTML(w,b,vd);if(h)return h}catch(e){console.error(e)}return base.apply(this,arguments)}
  try{const st=document.createElement('style');st.id='mw398-css';st.textContent=`.mw105rt.mw398{gap:4px}.mw398f{display:flex;align-items:center;gap:7px}.mw398f>span{display:flex;flex-direction:column;gap:1px;min-width:0}
.mw398f b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px}.mw398f small{display:flex;gap:6px;align-items:baseline}
.mw398r{font-style:normal;font-weight:700}.mw398f.won .mw398r{color:var(--gold2,#f0cf7d)}.mw398f.lost .mw398r{color:#d9cba9}.mw398f.fell .mw398r{color:var(--blood2,#e0604c)}
.mw398pu{font-style:normal;color:#d9cba9}.mw105rt.mw398x{border-color:#8a3a2c;background:#2a1712}.mw398v{font-size:12px;color:#f0b8a8}`;document.head.appendChild(st)}catch(e){}}
