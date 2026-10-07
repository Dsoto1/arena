/* =====================================================================
   31-SCULPT · ONE SCULPTOR FOR EVERY DESIGNER (v0.39)
   =====================================================================
   The Token Designer's shape bench — add, select, drag on the preview (with a grab offset), nudge,
   reorder, duplicate, delete, color / outline / width / height / rotation / opacity, then 🔨 bake
   (commit) or unbake — is now ONE component, identical in every designer that sculpts:
       tok · the Token Designer (gladiators and beasts)
       w   · the Weapon forge (its large art canvas)
       a   · the Armor forge (the piece on its own, or on the avatar)
       t   · the Trophy designer
       f   · the Banner press
   Data: every sculptable object carries `layers` (live, editable) and `baked` (committed; drawn
   first, underneath). A layer is {t,x,y,w,h,r,c,o,st} rendered by shapeSVG (20-tokens).
   Each designer declares its preview element with data-scbprev="<kind>" and its coordinate space.
   ===================================================================== */
/* SCB — the shared bench's state: the live layer array per designer, undo/redo stacks, the last slider burst. */
const SCB={editL:{},lastKind:null,hist:{},redo:{},lastIn:{}};
/* v0.45 undo / redo: a snapshot of {layers,baked} before every change (sliders: once per burst) */
/* scbSnap — pushes an undo snapshot of an object's layers and baked shapes (clears redo). TWEAK: 60 steps kept. */
function scbSnap(kind,obj){const h=SCB.hist[kind]=SCB.hist[kind]||[];h.push(JSON.stringify({l:obj.layers||[],b:obj.baked||[]}));if(h.length>60)h.shift();SCB.redo[kind]=[]}
/* scbRestore — undo or redo: moves the newest snapshot from one stack to the other and restores it. */
function scbRestore(kind,obj,from,to){const st=from[kind]||[];if(!st.length)return false;(to[kind]=to[kind]||[]).push(JSON.stringify({l:obj.layers||[],b:obj.baked||[]}));const d=JSON.parse(st.pop());obj.layers=d.l;obj.baked=d.b;SCB.editL[kind]=obj.layers;scbSelSet(kind,-1);return true}
/* SCB_KIND — each designer that sculpts: its object, preview viewBox, where new shapes go, its preview element, an optional pointer→object mapping, and how to refresh it. */
const SCB_KIND={
  tok:{obj:()=>ST.tokS,vb:[100,170],add:{x:50,y:90},el:()=>document.querySelector('#tokPrev svg'),
    toV:(vx,vy)=>{const sp=ST.tokS;const sz=sp.kind==='beast'?(sp.size||1):(sp.scale||1);return [50+(vx-50)/sz,157+(vy-157)/sz]},
    refresh:()=>{const pv=document.getElementById('tokPrev');if(pv)pv.innerHTML=figureHTML(ST.tokS,230,null,{selLayer:scbSelGet('tok')})}},
  w:{obj:()=>ST.cw&&ST.cw.art,vb:[100,100],add:{x:50,y:50},el:()=>document.querySelector('#cwArt svg'),refresh:()=>cwArtRefresh()},
  a:{obj:()=>ST.ca,vb:[100,100],add:{x:50,y:50},el:()=>document.querySelector('#caPiece svg'),refresh:()=>caPrevRefresh()},
  t:{obj:()=>ST.trd,vb:[100,134],add:{x:50,y:60},el:()=>document.querySelector('#trPrev svg'),refresh:()=>{const pv=document.getElementById('trPrev');if(pv&&ST.trd){const sv=pv.querySelector('svg');if(sv)sv.outerHTML=trophySVG({...ST.trd,name:ST.trd.name||'Trophy'},170)}}},
  f:{obj:()=>ST.fd,vb:[100,340/6],add:{x:50,y:28},el:()=>document.getElementById('fdPrev'),refresh:()=>{const pv=document.getElementById('fdPrev');if(pv&&ST.fd)pv.src=houseFlagURI(ST.fd)}}};
/* selection: the token keeps its old ST.tokL; everything else lives in ST.scbSel[kind] (reset when the object changes) */
/* scbSelGet — the selected layer index of a designer (-1 when none, or when the object changed). */
function scbSelGet(kind){if(kind==='tok')return ST.tokL??-1;const o=SCB_KIND[kind].obj();ST.scbSel=ST.scbSel||{};const s=ST.scbSel[kind];return s&&s.o===o?s.i:-1}
/* scbSelSet — sets the selected layer index of a designer. */
function scbSelSet(kind,index){if(kind==='tok'){ST.tokL=index;return}ST.scbSel=ST.scbSel||{};ST.scbSel[kind]={o:SCB_KIND[kind].obj(),i:index}}
/* is layer i of this array the one being edited right now? (only the live editor copy ever highlights) */
/* scbIsSel — is layer index of this array selected in the live editor right now? */
function scbIsSel(layers,index){for(const k in SCB.editL)if(SCB.editL[k]===layers&&scbSelGet(k)===index)return true;return false}
/* draw an object's baked shapes, then its live ones (the selected one outlined) */
/* v0.45 ✂ CUT SHAPES: a layer marked `cut` is an eraser — it carves its outline out of everything drawn beneath it
   (earlier layers and, where the designer passes it, the base art). While it is being edited it shows as a red outline. */
/* SCB_MID — counter for unique cut-mask ids. */
let SCB_MID=0;
/* scbStack — draws a list of layers over a base: cut layers become masks over everything beneath, the rest are drawn in order. */
function scbStack(base,items){let acc=base||'';
  for(const it of items){const L=it.L;if(!L||L.hid)continue;const wrap=s2=>it.tf?`<g transform="${it.tf}">${s2}</g>`:s2;
    if(L.cut){const id='scm'+(++SCB_MID)+'_'+Math.floor(Math.random()*1e6).toString(36);
      acc=`<mask id="${id}" maskUnits="userSpaceOnUse" x="-600" y="-600" width="1400" height="1400"><rect x="-600" y="-600" width="1400" height="1400" fill="#fff"/>${wrap(shapeSVG({...L,c:'#000',st:'',o:1}))}</mask><g mask="url(#${id})">${acc}</g>`;
      if(it.live)acc+=wrap(shapeSVG({...L,c:'none',st:'#ff6b5a',o:.9},it.sel))}
    else acc+=wrap(shapeSVG(L,it.sel))}
  return acc}
/* scbLayersSVG — an object's baked shapes, then its live ones (the selected one outlined), over base art. */
function scbLayersSVG(obj,base){if(!obj)return base||'';const live=Object.values(SCB.editL).includes(obj.layers);
  return scbStack(base||'',[...(obj.baked||[]).map(L=>({L})),...(obj.layers||[]).map((L,i)=>({L,sel:scbIsSel(obj.layers,i),live}))])}
/* scbBenchHTML — the sculpt bench for a designer: add buttons, the layer list, the selected shape's controls, undo/redo, bake/unbake. */
function scbBenchHTML(kind,opt={}){const o=SCB_KIND[kind].obj();if(!o)return '';o.layers=o.layers||[];const Ls=o.layers;SCB.editL[kind]=Ls;
  const li=scbSelGet(kind);const L=Ls[li];const nb=(o.baked||[]).length;const K=`data-k="${kind}"`;
  return `<div class="card2 tkshapes scbench" style="${opt.inGrid===false?'':'grid-column:1/-1;'}"><div class="sect" style="margin-top:0">${_T`✏️ Sculpt`} <span class="rc-sub">${_T`add a shape, <b>drag it on the preview</b>, resize, rotate — then 🔨 commit to bake it in`}</span></div>
    <div class="acts" style="gap:4px">${SHAPES.map(([t,l])=>`<button type="button" class="btn" data-scb="add" ${K} data-v="${t}" style="padding:3px 8px;flex:0 1 auto">${l}</button>`).join('')}</div>
    ${Ls.length?`<div class="scblayers" role="list"><div class="scblhd">${_T`Layers`} <span class="rc-sub">${_T`top of the list is drawn on top · click to select · 👁 hide · 🔒 lock`}</span></div>${Ls.map((x,i)=>i).reverse().map(i=>{const x=Ls[i];return `<div class="scbl ${i===li?'on':''}${x.hid?' hid':''}${x.lk?' lk':''}" role="listitem"><button type="button" class="scblsel" data-scb="sel" ${K} data-v="${i}"><span class="sw" style="background:${x.cut?'transparent;border:1px dashed #ff6b5a':x.c}"></span>${(SHAPES.find(q=>q[0]===x.t)||['',x.t])[1]}${x.cut?' <b style="color:#ff8a7a">✂ cut</b>':''} <span class="rc-sub">#${i+1}</span></button><button type="button" class="scbli" data-scb="hide" ${K} data-v="${i}" title="${_T`${x.hid?_T('Show'):_T('Hide')} this layer`}">${x.hid?'🚫':'👁'}</button><button type="button" class="scbli" data-scb="lock" ${K} data-v="${i}" title="${_T`${x.lk?_T('Unlock'):_T('Lock')} this layer — a locked layer cannot be dragged`}">${x.lk?'🔒':'🔓'}</button></div>`}).join('')}</div>`:''}
    ${L?`<div class="formgrid tkgrid" style="margin-top:6px"><label>${_T`Color`}<input type="color" data-scbl="c" ${K} value="${L.c||'#e6b93a'}" style="width:44px;height:28px;border:0;background:none;padding:0"></label><label>${_T`Outline`}<select class="tin" data-scbl="st" ${K}><option value="">${_T`None`}</option><option value="#1a120c" ${L.st?'selected':''}>${_T`Dark`}</option></select></label>
      <label>${_T`Width`}<span class="slider" style="grid-template-columns:1fr 32px"><input type="range" data-scbl="w" ${K} min="2" max="70" value="${L.w??12}"><output>${L.w??12}</output></span></label><label>${_T`Height`}<span class="slider" style="grid-template-columns:1fr 32px"><input type="range" data-scbl="h" ${K} min="2" max="70" value="${L.h??12}"><output>${L.h??12}</output></span></label>
      <label>${_T`Rotate`}<span class="slider" style="grid-template-columns:1fr 32px"><input type="range" data-scbl="r" ${K} min="-180" max="180" value="${L.r||0}"><output>${L.r||0}</output></span></label><label>${_T`Opacity`}<span class="slider" style="grid-template-columns:1fr 32px"><input type="range" data-scbl="o" ${K} min="0.2" max="1" step="0.05" value="${L.o??1}"><output>${L.o??1}</output></span></label></div>
      <div class="acts" style="gap:4px;margin-top:4px"><button type="button" class="btn tksm" data-scb="nudge" ${K} data-v="0,-2">↑</button><button type="button" class="btn tksm" data-scb="nudge" ${K} data-v="0,2">↓</button><button type="button" class="btn tksm" data-scb="nudge" ${K} data-v="-2,0">←</button><button type="button" class="btn tksm" data-scb="nudge" ${K} data-v="2,0">→</button><button type="button" class="btn tksm" data-scb="order" ${K} data-v="1">${_T`Bring forward`}</button><button type="button" class="btn tksm" data-scb="order" ${K} data-v="-1">${_T`Send back`}</button><button type="button" class="btn tksm" data-scb="dup" ${K}>${_T`Duplicate`}</button><button type="button" class="btn tksm" data-scb="mirror" ${K} title="${_T`A mirrored copy on the other side of the centre line`}">${_T`⇋ Mirror copy`}</button><button type="button" class="btn tksm" data-scb="flip" ${K} title="${_T`Flip this shape left–right in place`}">${_T`↔ Flip`}</button><button type="button" class="btn tksm" data-scb="del" ${K}>${_T`Delete`}</button></div>
      <label class="scbcut ${L.cut?'on':''}"><input type="checkbox" data-scb="cut" ${K} ${L.cut?'checked':''}> ${_T`<b>✂ Cut</b>`} <span class="rc-sub">${_T`this shape becomes an eraser — it carves its outline out of everything drawn beneath it (move it up or down the list to choose what it cuts)`}</span></label>`:`<p class="rc-sub" style="margin:6px 0 0">${_T`Add a shape, then click it in the list (or drag it on the preview).`}</p>`}
    <div class="acts" style="gap:4px;margin-top:6px"><button type="button" class="btn tksm" data-scb="undo" ${K} ${(SCB.hist[kind]||[]).length?'':'disabled'} title="${_T`Undo the last sculpt change`}">${_T`⟲ Undo`}</button><button type="button" class="btn tksm" data-scb="redo" ${K} ${(SCB.redo[kind]||[]).length?'':'disabled'} title="${_T`Redo`}">${_T`⟳ Redo`}</button><button type="button" class="btn tksm" data-scb="clearL" ${K} ${Ls.length?'':'disabled'} title="${_T`Remove every live (unbaked) shape`}">${_T`🧹 Clear shapes`}</button></div>
    <div class="acts" style="gap:4px;margin-top:6px"><button type="button" class="btn primary" data-scb="bake" ${K} ${Ls.length?'':'disabled'}>${_T`🔨 Commit shapes<small>bake them in</small>`}</button><button type="button" class="btn" data-scb="unbake" ${K} ${nb?'':'disabled'}>${_T`Unbake<small>${nb} baked</small>`}</button></div></div>`}
/* scbClick — handles the bench buttons (undo/redo, mirror, flip, cut, clear, add, hide, lock, select, nudge, order, duplicate, delete, bake, unbake); true when handled. */
function scbClick(btn,redraw){const k=btn.dataset.k;const D=SCB_KIND[k];if(!D)return false;const o=D.obj();if(!o)return true;o.layers=o.layers||[];const Ls=o.layers;const a=btn.dataset.scb;const li=scbSelGet(k);
  if(a==='undo'||a==='redo'){scbRestore(k,o,a==='undo'?SCB.hist:SCB.redo,a==='undo'?SCB.redo:SCB.hist);if(k==='w'||k==='a'){try{bumpGearPreview(k)}catch(e){}}redraw();return true}
  if(['add','hide','lock','nudge','order','dup','del','bake','unbake','mirror','flip','cut','clearL'].includes(a))scbSnap(k,o);
  if(a==='mirror'){const L=Ls[li];if(L){Ls.push({...L,x:D.vb[0]-L.x,r:-(L.r||0)});scbSelSet(k,Ls.length-1)}}
  else if(a==='flip'){const L=Ls[li];if(L){L.x=D.vb[0]-L.x;L.r=-(L.r||0);L.fx=L.fx?0:1}}
  else if(a==='cut'){const L=Ls[li];if(L){L.cut=L.cut?0:1;if(!L.cut)delete L.cut}}
  else if(a==='clearL'){o.layers=[];SCB.editL[k]=o.layers;scbSelSet(k,-1)}
  else if(a==='add'){const n=Ls.length%6;Ls.push({t:btn.dataset.v,x:D.add.x+(n%3-1)*10,y:D.add.y+(Math.floor(n/3)*2-1)*8+(n>=3?4:0),w:14,h:14,r:0,c:scbPickColor95(Ls),o:1});scbSelSet(k,Ls.length-1)} /* v0.42: each new shape lands beside the last, in its own color */
  else if(a==='hide'){const L=Ls[+btn.dataset.v];if(L){L.hid=L.hid?0:1;if(!L.hid)delete L.hid}}
  else if(a==='lock'){const L=Ls[+btn.dataset.v];if(L){L.lk=L.lk?0:1;if(!L.lk)delete L.lk}}
  else if(a==='sel')scbSelSet(k,+btn.dataset.v);
  else if(a==='nudge'){const L=Ls[li];if(L){const [dx,dy]=btn.dataset.v.split(',').map(Number);L.x+=dx;L.y+=dy;scbClamp(k,L)}}
  else if(a==='order'){const j=li+(+btn.dataset.v);if(Ls[li]&&j>=0&&j<Ls.length){[Ls[li],Ls[j]]=[Ls[j],Ls[li]];scbSelSet(k,j)}}
  else if(a==='dup'){const L=Ls[li];if(L){Ls.push({...L,x:L.x+4,y:L.y+4});scbSelSet(k,Ls.length-1)}}
  else if(a==='del'){if(Ls[li])Ls.splice(li,1);scbSelSet(k,-1)}
  else if(a==='bake'){o.baked=[...(o.baked||[]),...Ls];o.layers=[];scbSelSet(k,-1);if(typeof mToast==='function')mToast(_T('🔨 Shapes baked in — save to keep them'))}
  else if(a==='unbake'){o.layers=[...Ls,...(o.baked||[])];o.baked=[]}
  else return false;
  if(k==='w'||k==='a'){try{bumpGearPreview(k)}catch(e){}}
  redraw();return true}
/* scbInput — handles a bench slider/colour on the selected shape (one undo snapshot per burst of 1.2 s). */
function scbInput(input){const k=input.dataset.k;const D=SCB_KIND[k];if(!D)return false;const o=D.obj();const L=o&&(o.layers||[])[scbSelGet(k)];if(!L)return true;const f=input.dataset.scbl;
  {const key=scbSelGet(k)+':'+f;const now=Date.now();if(SCB.lastIn[k]!==key||now-(SCB.lastInT||0)>1200)scbSnap(k,o);SCB.lastIn[k]=key;SCB.lastInT=now}
  L[f]=['w','h','r','o'].includes(f)?+input.value:input.value;if(f==='st'&&!input.value)delete L.st;
  if(input.nextElementSibling&&input.nextElementSibling.tagName==='OUTPUT')input.nextElementSibling.textContent=input.value;
  D.refresh();if(k==='w'||k==='a'){try{bumpGearPreview(k)}catch(e){}}return true}
/* v0.46: shapes stay on the canvas — the centre is kept so that at least half of the shape (or its middle, for
   shapes bigger than the canvas) remains inside the preview's own space (the object's space, for tokens) */
/* scbClamp — keeps a shape's centre on the canvas so at least half of it stays inside (round previews clamp to their circle). */
function scbClamp(kind,layer){const D=SCB_KIND[kind];if(!D||!layer)return;if(D.round){const [cx,cy,R]=D.round;const lim=Math.max(0,R-Math.min(layer.w||12,layer.h||12)/4);const dx=layer.x-cx,dy=layer.y-cy,d=Math.hypot(dx,dy);if(d>lim){layer.x=Math.round((cx+dx/d*lim)*10)/10;layer.y=Math.round((cy+dy/d*lim)*10)/10}return}let x0=0,y0=0,x1=D.vb[0],y1=D.vb[1];
  if(D.toV){const a=D.toV(0,0),b=D.toV(D.vb[0],D.vb[1]);x0=Math.min(a[0],b[0]);y0=Math.min(a[1],b[1]);x1=Math.max(a[0],b[0]);y1=Math.max(a[1],b[1])}
  const hw=Math.min((layer.w||12)/2,(x1-x0)/2)*0.5,hh=Math.min((layer.h||12)/2,(y1-y0)/2)*0.5;
  layer.x=Math.round(Math.max(x0+hw,Math.min(x1-hw,layer.x))*10)/10;layer.y=Math.round(Math.max(y0+hh,Math.min(y1-hh,layer.y))*10)/10}
/* drag on any declared preview: pointer → the preview's own space (→ the object's space, for tokens) */
/* scbWire — wires dragging on any declared preview: grabs the topmost shape under the pointer (else the nearest within 9), moves it with the grab offset. */
function scbWire(box,redraw){if(box._scbWired)return;box._scbWired=1;let drag=null;
  /* toV — pointer event → the preview's own space (→ the object's space, for tokens). */
  const toV=(k,e)=>{const D=SCB_KIND[k];const el=D.el();if(!el)return null;const r=el.getBoundingClientRect();if(!r.width)return null;
    const vx=(e.clientX-r.left)/r.width*D.vb[0],vy=(e.clientY-r.top)/r.height*D.vb[1];return D.toV?D.toV(vx,vy):[vx,vy]};
  box.addEventListener('pointerdown',e=>{const host=e.target.closest('[data-scbprev]');if(!host)return;const k=host.dataset.scbprev;const D=SCB_KIND[k];const o=D&&D.obj();if(!o)return;
    if(k==='a'&&ST.caAvatar)return; // on the avatar the whole piece moves (armor fit), handled below — the forge says so under the preview
    const Ls=o.layers||[];if(!Ls.length)return;const v=toV(k,e);if(!v)return;
    // v0.42: the TOPMOST visible, unlocked shape under the pointer; failing that the nearest within reach; empty canvas deselects
    let best=-1;for(let i=Ls.length-1;i>=0;i--){const L=Ls[i];if(L.hid||L.lk)continue;const core=Math.min(L.w||12,L.h||12)/2;if(Math.hypot(L.x-v[0],L.y-v[1])<=core){best=i;break}}
    if(best<0){let bd=1e9;Ls.forEach((L,i)=>{if(L.hid||L.lk)return;const d=Math.hypot(L.x-v[0],L.y-v[1]);if(d<bd){bd=d;best=i}});if(bd>9)best=-1}
    if(best<0){if(scbSelGet(k)>=0){scbSelSet(k,-1);D.refresh();redraw()}return}
    scbSelSet(k,best);drag={k,i:best,dx:Ls[best].x-v[0],dy:Ls[best].y-v[1]};D.refresh();e.preventDefault()});
  /* v0.46: moves are followed on the whole window, so a shape dragged past the edge stops at the edge */
  window.addEventListener('pointermove',e=>{if(!drag)return;const v=toV(drag.k,e);if(!v)return;const D=SCB_KIND[drag.k];const L=(D.obj().layers||[])[drag.i];if(!L)return;
    L.x=Math.round((v[0]+drag.dx)*10)/10;L.y=Math.round((v[1]+drag.dy)*10)/10;scbClamp(drag.k,L);D.refresh()});
  window.addEventListener('pointerup',()=>{if(drag){const k=drag.k;drag=null;if(k==='w'||k==='a'){try{bumpGearPreview(k)}catch(e){}}redraw()}})}

/* ---------------- the Weapon forge: the weapon large, its card below ---------------- */
/* cwArtSVG — the weapon art on its own 100×100 canvas. */
function cwArtSVG(art){return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${wpnArt(art)}</svg>`}
/* cwArtRefresh — redraws the weapon forge's large art. */
function cwArtRefresh(){const pv=document.getElementById('cwArt');if(pv&&ST.cw)pv.innerHTML=cwArtSVG(ST.cw.art)}
/* bumpGearPreview — refreshes the weapon card or the armor preview after a bench change. */
function bumpGearPreview(kind){if(kind==='w'){const pv=document.getElementById('cwPrev');if(pv&&ST.cw)pv.innerHTML=cwCardSVG(ST.cw)}else caPrevRefresh()}

/* ---------------- the Armor forge: the piece alone, or worn on the avatar ---------------- */
/* CA_FIT_DEF — where a piece sits on the avatar by slot (centre x,y and width s) before it is fitted by hand. */
const CA_FIT_DEF={head:{x:75,y:30,s:44},chest:{x:75,y:96,s:62},arm:{x:35,y:118,s:48},leg:{x:62,y:236,s:52}};
/* caFit — a piece's placement on the avatar: its own fit for its slot, else the slot default. */
function caFit(ca){const d=CA_FIT_DEF[ca.slot]||CA_FIT_DEF.chest;const f=ca.fit&&ca.fit.slot===ca.slot?ca.fit:null;return {x:f?f.x:d.x,y:f?f.y:d.y,s:f?f.s:d.s}}
/* a worn piece on a 150×332 avatar: centred at fit, s units wide (the art's 100-box scaled to s); mirrored for the left side */
/* caOnBodySVG — a piece worn on the 150×332 avatar at its fit (mirrored for the left side). */
function caOnBodySVG(ca,key,mirror){const F=caFit(ca);const sc=F.s/100;const x=mirror?150-F.x:F.x;
  const inner=armSVG(key||'ca_preview',ca).replace(/^<svg[^>]*>|<\/svg>$/g,'');
  return `<g transform="translate(${x} ${F.y})${mirror?' scale(-1 1)':''} scale(${sc}) translate(-50 -50)">${inner}</g>`}
/* caAvatarSVG — the avatar with clickable slot zones and the piece worn (both sides for a pair of limbs). */
function caAvatarSVG(ca){const img=typeof assetURL==='function'?assetURL('avatar.png'):'assets/avatar.png';const pair=ca.pair&&(ca.slot==='arm'||ca.slot==='leg');
  const zones={head:'M58 24a17 23 0 1 1 34 0a17 23 0 1 1 -34 0z',chest:'M47 60h56l-3 40-4 35H54l-4-35z',arm:'M22 64h26l-2 56-6 55H24l-2-55z',leg:'M51 175h22l-1 63 1 62H53l-2-62z'};
  return `<svg viewBox="0 0 150 332" xmlns="http://www.w3.org/2000/svg"><image href="${img}" x="7" y="6" width="136" height="301" opacity=".9"/>
    ${Object.entries(zones).map(([k,d])=>`<path d="${d}" fill="${ca.slot===k?'rgba(240,207,125,.16)':'rgba(0,0,0,0)'}" stroke="${ca.slot===k?'#f0cf7d':'rgba(240,207,125,.25)'}" stroke-dasharray="3 3" data-caslot="${k}" style="cursor:pointer"/>`).join('')}
    ${caOnBodySVG(ca)}${pair?caOnBodySVG(ca,null,true):''}</svg>`}
/* caPrevRefresh — redraws the armor preview (the piece alone or on the avatar). */
function caPrevRefresh(){const d=ST.ca;if(!d)return;const pv=document.getElementById('caPiece');if(pv)pv.innerHTML=ST.caAvatar?caAvatarSVG({...d}):armSVG('ca_preview',{...d})}
/* dragging the whole piece on the avatar; the wheel (or the Size slider) scales it */
/* caAvatarWire — wires dragging the whole piece on the avatar, or clicking another zone to change its slot. */
function caAvatarWire(box,redraw){if(box._caWired)return;box._caWired=1;let drag=null;
  /* pt — pointer event → avatar coordinates. */
  const pt=e=>{const sv=document.querySelector('#caPiece svg');if(!sv)return null;const r=sv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*150,(e.clientY-r.top)/r.height*332]};
  box.addEventListener('pointerdown',e=>{if(!ST.caAvatar||!e.target.closest('#caPiece'))return;const z=e.target.closest('[data-caslot]');const d=ST.ca;const p=pt(e);if(!p)return;
    const F=caFit(d);const inside=Math.abs(p[0]-F.x)<F.s*0.6&&Math.abs(p[1]-F.y)<F.s*0.6;
    if(!inside&&z&&z.dataset.caslot!==d.slot){d.slot=z.dataset.caslot;d.fit=null;redraw();return}
    d.fit={slot:d.slot,...F};drag={dx:F.x-p[0],dy:F.y-p[1]};e.preventDefault()});
  box.addEventListener('pointermove',e=>{if(!drag)return;const p=pt(e);if(!p)return;const d=ST.ca;d.fit.x=Math.round(p[0]+drag.dx);d.fit.y=Math.round(p[1]+drag.dy);caPrevRefresh()});
  window.addEventListener('pointerup',()=>{if(drag){drag=null;redraw()}})}
