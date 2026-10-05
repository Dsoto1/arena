/* =====================================================================
   176-V89SCULPT3D · v0.89 part I (Virgilante): the SCULPTED figure tokens (20-tokens figureSVG — the 'figure' token style,
   every custom creation in 'standee' style, online gladiators' p._onlSc (128), Tholo's sculpt (126)) read as 3D on the board.
   • LIGHT FROM THE UPPER LEFT on every part: each part of the figure (body, limbs, head, helm, shield, weapon, every sculpted
     shape) gets its own lighting filter (SC3D_FILTER: a soft bump from the part's own outline → diffuse light at azimuth 225°
     → a lit upper-left edge, a darker lower-right underside/core shadow, a warm highlight on the lit rim). Each part keeps its
     own colours (the light only multiplies them, ±). Thin ink details (eyes, mouth lines, tiny dots) and see-through sheens are
     left flat so faces stay crisp. Sculpted shapes are lit in the figure's space (a rotated shape is still lit from the upper left).
   • A THICK BEVELLED BASE like a real token: a side band under the top face (lit left, shaded right), a top face lit from the
     upper left, a bevel ring (bright upper-left lip, dark lower-right lip). Same geometry as before (viewBox 100×170, base
     centre 50,157) so feet, HP bars, arrows (132) and the Studio drag mapping are untouched.
   • A SOFT SHADOW ON THE SAND: a tight contact shadow under the rim + a soft cast shadow falling to the lower right
     (replaces drawFigureTok's flat ellipse).
   • FAST: the lit SVG → one Image per spec (SC3D_IMG), then one offscreen canvas per spec + device-pixel size bucket (SC3D_CV,
     shadow baked in, LRU-capped) — one drawImage per token per frame.
   • Board only: drawFigureTok is wrapped (falls back to the original until the lit image has loaded, and when HEADLESS).
     (v0.89 later, his ask: figureHTML + tokenImg everywhere are lit too — see EVERYWHERE below; figureSVG itself stays plain.) Was:
     the two Studio sculpt previews (Token creator #tokPrev, online bench #onlScPrev — figureHTML with extra.selLayer) which
     show the new look. Printed tokens (standees/minis) and cylinders never pass through here.
   • No direct edits to older modules. Cosmetic only: no RNG at all.
   ===================================================================== */
const SC3D={on:true,maxCv:160,hits:0,miss:0}; /* TWEAK: on = the whole look; maxCv = cached canvases kept */
/* TWEAK: the light. az = azimuth (225 = upper left in SVG's y-down space), el = elevation, blur = edge softness (figure units),
   wide = the broad roundness blur, k = bump height, lo = the darkest shade multiplier, hi = rim highlight strength */
const SC3D_F={blur:9,k:13,lo:0.5}; /* his pick (row 3 of the mock-up): deeper */ /* TWEAK: the whole-figure roundness (blur/height) and its darkest shade */
const SC3D_L={az:225,el:36,blur:1.2,wide:5.5,k:7.5,lo:0.3,hi:1.15};
/* sc3dRGB — [r,g,b] from #rgb/#rrggbb or rgb(); null if unreadable */
function sc3dRGB(c){c=String(c||'').trim();let m=/^#([0-9a-f]{3})$/i.exec(c);if(m)return m[1].split('').map(h=>parseInt(h+h,16));
  m=/^#([0-9a-f]{6})$/i.exec(c);if(m)return [0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16));m=/^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/i.exec(c);return m?[+m[1],+m[2],+m[3]]:null}
/* sc3dMix — a colour lightened (f>0) or darkened (f<0) by |f| */
function sc3dMix(c,f){const v=sc3dRGB(c)||[58,46,36];const t=f<0?0:255,a=Math.abs(f);return `rgb(${v.map(x=>Math.round((t-x)*a+x)).join(',')})`}
/* the per-part lighting filter (userSpaceOnUse: thin / straight parts with an empty bounding box still render) */
function sc3dFilter(id){const L=SC3D_L;const flat=Math.sin(L.el*Math.PI/180);
  /* shade = lo..1 multiplier (flat ground ≈ 1), rim = the lit-edge highlight (0 on flat ground and in shadow) */
  const shSlope=((1-L.lo)/flat).toFixed(3),hiSlope=(1/(1-flat)).toFixed(3),hiIc=(-flat/(1-flat)).toFixed(3);
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="-160" y="-160" width="420" height="500" color-interpolation-filters="sRGB">`
   +`<feGaussianBlur in="SourceAlpha" stdDeviation="${L.blur}" result="b1"/><feGaussianBlur in="SourceAlpha" stdDeviation="${L.wide}" result="b2"/>`
   +`<feComposite in="b1" in2="b2" operator="arithmetic" k2=".45" k3=".55" result="bump"/>`
   +`<feDiffuseLighting in="bump" surfaceScale="${L.k}" diffuseConstant="1" lighting-color="#fff" result="d"><feDistantLight azimuth="${L.az}" elevation="${L.el}"/></feDiffuseLighting>`
   +`<feComponentTransfer in="d" result="sh"><feFuncR type="linear" slope="${shSlope}" intercept="${L.lo}"/><feFuncG type="linear" slope="${shSlope}" intercept="${L.lo}"/><feFuncB type="linear" slope="${shSlope}" intercept="${L.lo}"/></feComponentTransfer>`
   +`<feComposite in="SourceGraphic" in2="sh" operator="arithmetic" k1="1" result="lit"/>`
   +`<feComponentTransfer in="d" result="rim"><feFuncR type="linear" slope="${hiSlope}" intercept="${hiIc}"/><feFuncG type="linear" slope="${hiSlope}" intercept="${hiIc}"/><feFuncB type="linear" slope="${(hiSlope*0.86).toFixed(3)}" intercept="${(hiIc*0.86).toFixed(3)}"/></feComponentTransfer><feColorMatrix in="rim" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 0 0 0 0" result="rimA"/>`
   +`<feComposite in="rimA" in2="SourceAlpha" operator="arithmetic" k1="1" result="rim2"/>`
   +`<feComposite in="lit" in2="rim2" operator="arithmetic" k2="1" k3="${L.hi}"/></filter>`}
/* the whole-figure form light: a very soft bump of the silhouette — the figure reads round, its right side in core shadow */
function sc3dForm(id){const L=SC3D_L;const flat=Math.sin(L.el*Math.PI/180);const lo=SC3D_F.lo,sl=((1-lo)/flat).toFixed(3);
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="-160" y="-160" width="420" height="500" color-interpolation-filters="sRGB">`
   +`<feGaussianBlur in="SourceAlpha" stdDeviation="${SC3D_F.blur}" result="b"/>`
   +`<feDiffuseLighting in="b" surfaceScale="${SC3D_F.k}" diffuseConstant="1" lighting-color="#fff" result="d"><feDistantLight azimuth="${L.az}" elevation="${L.el}"/></feDiffuseLighting>`
   +`<feComponentTransfer in="d" result="sh"><feFuncR type="linear" slope="${sl}" intercept="${lo}"/><feFuncG type="linear" slope="${sl}" intercept="${lo}"/><feFuncB type="linear" slope="${sl}" intercept="${lo}"/></feComponentTransfer>`
   +`<feComposite in="SourceGraphic" in2="sh" operator="arithmetic" k1="1"/></filter>`}
/* sc3dWorth — whether a leaf element gets lit: solid fills and thick strokes; not thin ink lines, tiny dots or faint sheens */
function sc3dWorth(attrs){const g=n=>{const m=new RegExp('\\s'+n+'="([^"]*)"').exec(attrs);return m?m[1]:null};
  const op=g('opacity');if(op!=null&&+op<0.6)return false;
  const fill=g('fill'),sw=+(g('stroke-width')||1);
  if(fill==='none'||fill==null&&/\sstroke=/.test(attrs)&&!/\sfill=/.test(attrs))return sw>=3.2;
  const r=+(g('r')||0),rx=+(g('rx')||0),ry=+(g('ry')||0),w=+(g('width')||0),h=+(g('height')||0);
  if(r&&r<2.7)return false;if(/^<ellipse/.test(attrs)&&rx&&ry&&rx<2.6&&ry<2.6)return false;if(w&&h&&Math.min(w,h)<1.6)return false;
  return true}
/* sc3dBase — the thick bevelled base (replaces 20-tokens' baseSVG; same centre and top face) */
function sc3dBase(base,ring,rw,id){const lit=sc3dMix(base,0.2),mid=sc3dMix(base,-0.12),dk=sc3dMix(base,-0.6),top0=sc3dMix(base,0.3),top2=sc3dMix(base,-0.34);
  return `<defs><linearGradient id="${id}s" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${lit}"/><stop offset=".28" stop-color="${mid}"/><stop offset=".72" stop-color="${sc3dMix(base,-0.42)}"/><stop offset="1" stop-color="${dk}"/></linearGradient>`
   +`<radialGradient id="${id}t" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${top0}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${top2}"/></radialGradient>`
   +`<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6e0" stop-opacity=".8"/><stop offset=".42" stop-color="#fff6e0" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>`
   +`<linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff2d6" stop-opacity=".5"/><stop offset=".5" stop-color="#fff2d6" stop-opacity=".08"/><stop offset="1" stop-color="#fff2d6" stop-opacity="0"/></linearGradient></defs>`
   /* side band: 157 → 162 (the bottom rim reaches the box's edge at 170) */
   +`<path d="M19 157L19 ${SC3D_THICK?167:163}A31 7 0 0 0 81 ${SC3D_THICK?167:163}L81 157A31 9 0 0 1 19 157Z" fill="url(#${id}s)"/>`
   +`<path d="M19.4 ${SC3D_THICK?166.8:162.8}A30.6 6.8 0 0 0 80.6 ${SC3D_THICK?166.8:162.8}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width=".9"/>`
   +`<path d="M19.6 157.6A30.4 8.6 0 0 0 50 166" fill="none" stroke="url(#${id}l)" stroke-width=".9"/>`
   /* top face + ring, then the bevel */
   +`<ellipse cx="50" cy="157" rx="31" ry="9" fill="url(#${id}t)" stroke="${ring}" stroke-width="${rw}"/>`
   +`<ellipse cx="50" cy="157" rx="28.4" ry="7.8" fill="none" stroke="url(#${id}b)" stroke-width="2.2"/>`
   +`<path d="M19.6 156.2A31 9 0 0 1 56 148.2" fill="none" stroke="#fff4dc" stroke-opacity=".55" stroke-width=".8" stroke-linecap="round"/>`
   +`<ellipse cx="47" cy="155.6" rx="20" ry="4.2" fill="#fff6e0" opacity=".07"/>`}
/* sc3dSVG — a figureSVG output, lit: the thick base and the per-part light. idp = a prefix for the ids (inline HTML use). */
const SC3D_BASE_RE=/<ellipse cx="50" cy="160" rx="31" ry="9" fill="[^"]*"\/><ellipse cx="50" cy="157" rx="31" ry="9" fill="([^"]*)" stroke="([^"]*)" stroke-width="([^"]*)"\/><ellipse cx="50" cy="156" rx="24" ry="5\.5" fill="[^"]*" opacity="\.6"\/>/;
const SC3D_PART_RE=/<(mask|clipPath|defs|filter|linearGradient|radialGradient)\b[\s\S]*?<\/\1>|(<g transform="translate\([^"]*\)"(?: opacity="[^"]*")?>)((?:<(?:path|rect|circle|ellipse|polygon)\b[^>]*\/>)+?)(<rect[^>]*stroke-dasharray[^>]*\/>)?<\/g>|<(?:path|rect|circle|ellipse|polygon|polyline)\b[^>]*\/>/g;
function sc3dSVG(svg,idp='s3'){if(typeof svg!=='string')return svg;try{
  const fid=idp+'f';let out=svg.replace(SC3D_BASE_RE,(m,base,ring,rw)=>sc3dBase(base,ring,rw,idp));
  const a=out.indexOf('<g transform="translate(50 157)');if(a<0)return out;const z=out.lastIndexOf('</g></svg>');if(z<a)return out;
  const head=out.slice(0,a),body=out.slice(a,z),tail=out.slice(z);
  const lit=body.replace(SC3D_PART_RE,(m,blk,gOpen,leaves,selR)=>{
    if(blk)return m;
    if(gOpen){const flat=/opacity="0?\.[0-5]/.test(gOpen);const inner=gOpen+leaves+'</g>';return (flat?inner:`<g filter="url(#${fid})">${inner}</g>`)+(selR?gOpen+selR+'</g>':'')}
    return sc3dWorth(m)?`<g filter="url(#${fid})">${m}</g>`:m});
  return head.replace(/(<svg\b[^>]*>)/,`$1<defs>${sc3dFilter(fid)}${sc3dForm(fid+'o')}</defs>`)+`<g filter="url(#${fid}o)">`+lit+'</g>'+tail}catch(e){console.error(e);return svg}}

/* ---------------- the board: one lit Image per spec, one canvas per spec + pixel size ---------------- */
const SC3D_IMG=new Map(),SC3D_CV=new Map();
let SC3D_THICK=false; /* the thick base only where the image is 176 tall (the board); 170-tall views (HTML, tokenImg) keep the 163 band */
const SC3D_VH=176; /* the board image is 6 units taller than figureSVG's 170 so the thick base's lower rim (to 174) is not clipped */
/* sc3dImg — the lit figure as an Image (null until loaded; redraws the board when it arrives) */
function sc3dImg(spec,key){let im=SC3D_IMG.get(key);if(!im){im=new Image();im.onload=()=>{try{draw()}catch(e){}};let lit;SC3D_THICK=true;try{lit=sc3dSVG(figureSVG(spec))}finally{SC3D_THICK=false}im.src='data:image/svg+xml,'+encodeURIComponent(lit.replace('viewBox="0 0 100 170" width="100" height="170"','viewBox="0 0 100 '+SC3D_VH+'" width="100" height="'+SC3D_VH+'"'));SC3D_IMG.set(key,im);
    if(SC3D_IMG.size>240)SC3D_IMG.delete(SC3D_IMG.keys().next().value)}
  return im.complete&&im.naturalWidth?im:null}
/* sc3dCanvas — the figure + its sand shadow rendered once at pxH device pixels tall */
/* sc3dBucket — the render height for a needed device-pixel height: steps of ×1.25 (rendered at the step at or above it, drawn
   scaled down), so a camera zoom touches only a handful of sizes per figure */
const SC3D_STEPS=[];for(let v=40;v<760;v=Math.round(v*1.25))SC3D_STEPS.push(v);
const sc3dBucket=px=>SC3D_STEPS.find(v=>v>=px)||SC3D_STEPS[SC3D_STEPS.length-1];
/* at most SC3D.budget new renders per frame; past it, any cached size of the same figure stands in (else the flat figure) */
const SC3D_FR={t:0,n:0};SC3D.budget=2;
function sc3dCanvas(spec,key,pxH){const ck=key+'|'+pxH;let c=SC3D_CV.get(ck);if(c){SC3D.hits++;SC3D_CV.delete(ck);SC3D_CV.set(ck,c);return c}
  const now=performance.now();if(now-SC3D_FR.t>12){SC3D_FR.t=now;SC3D_FR.n=0}
  if(SC3D_FR.n>=SC3D.budget){let best=null;for(const [k2,c2] of SC3D_CV)if(k2.startsWith(key+'|')&&(!best||Math.abs(c2._px-pxH)<Math.abs(best._px-pxH)))best=c2;
    if(!SC3D_FR.raf)SC3D_FR.raf=requestAnimationFrame(()=>{SC3D_FR.raf=0;try{draw()}catch(e){}});return best}
  const im=sc3dImg(spec,key);if(!im)return null;SC3D.miss++;SC3D_FR.n++;
  const w=pxH*100/170,pad=Math.ceil(w*0.3),W=Math.ceil(w+pad*2),H=Math.ceil(pxH*SC3D_VH/170+pad*0.5);
  c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const bx=W/2,by=pxH*157/170;
  /* soft cast shadow, falling to the lower right (the light is upper left) */
  g.save();g.translate(bx+w*0.13,by+w*0.05);g.scale(1,0.38);let rg=g.createRadialGradient(0,0,0,0,0,w*0.52);
  rg.addColorStop(0,'rgba(20,10,4,.42)');rg.addColorStop(.55,'rgba(20,10,4,.24)');rg.addColorStop(1,'rgba(20,10,4,0)');g.fillStyle=rg;g.beginPath();g.arc(0,0,w*0.52,0,Math.PI*2);g.fill();g.restore();
  /* tight contact shadow right under the rim */
  g.save();g.translate(bx+w*0.03,by+w*0.035);g.scale(1,0.3);rg=g.createRadialGradient(0,0,w*0.22,0,0,w*0.36);
  rg.addColorStop(0,'rgba(10,5,2,.5)');rg.addColorStop(1,'rgba(10,5,2,0)');g.fillStyle=rg;g.beginPath();g.arc(0,0,w*0.36,0,Math.PI*2);g.fill();g.restore();
  /* the longer, darker cast shadow (his pick) */
  g.save();g.translate(bx+w*0.2,by+w*0.07);g.scale(1,0.36);rg=g.createRadialGradient(0,0,0,0,0,w*0.6);rg.addColorStop(0,'rgba(20,10,4,.38)');rg.addColorStop(1,'rgba(20,10,4,0)');g.fillStyle=rg;g.beginPath();g.arc(0,0,w*0.6,0,Math.PI*2);g.fill();g.restore();
  g.drawImage(im,pad,0,w,pxH*SC3D_VH/170);
  c._pad=pad;c._w=w;c._px=pxH;SC3D_CV.set(ck,c);while(SC3D_CV.size>SC3D.maxCv)SC3D_CV.delete(SC3D_CV.keys().next().value);return c}
/* drawFigureTok wrapper: same contract (base centred on x,y; h px tall; returns a y near the top for HP bars) */
{const base=drawFigureTok;drawFigureTok=function(sp,x,y,h,opt={}){
  if(!SC3D.on||HEADLESS||!sp||typeof document==='undefined')return base.apply(this,arguments);
  let c=null;try{const T=ctx.getTransform();const sc=Math.max(1,Math.hypot(T.a,T.b))||1;const pxH=sc3dBucket(h*sc);
    c=sc3dCanvas(sp,JSON.stringify(sp),pxH);if(c){const k=h/c._px;const w=h*100/170,top=y-h*(157/170);
      ctx.save();if(opt&&opt.filter)ctx.filter=opt.filter;ctx.drawImage(c,x-w/2-c._pad*k,top,c.width*k,c.height*k);ctx.restore();
      const t=top+h*0.12;try{TOP83=t}catch(e){}return t}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* EVERYWHERE (his ask, 2026-10-05): every figureHTML (Studio previews and lists, custom characters, Play Now seats, Ludus,
   Domus, online creator…) and every tokenImg (city square, corpses, menus — canvas images) show the lit figure. Unique id
   prefixes per HTML figure (gradients carry the base colour); tiny chips (< 28 px) stay flat (the light would not show). */
let SC3D_HN=0;
{const base=figureHTML;figureHTML=function(spec,height,ring,extra){const h=base.apply(this,arguments);
  if(!SC3D.on||(height||60)<28)return h;if(extra&&extra.selLayer!=null){try{return h.replace(/<svg[\s\S]*<\/svg>/,s=>sc3dSVG(s,'s3p'))}catch(e){return h}}
  try{const id='s3h'+(++SC3D_HN).toString(36);return h.replace(/<svg[\s\S]*<\/svg>/,s=>sc3dSVG(s,id))}catch(e){return h}}}
const TOKEN_IMG3={};
{const base=tokenImg;tokenImg=function(spec){if(!SC3D.on||HEADLESS||!spec)return base.apply(this,arguments);const key=JSON.stringify(spec);let im=TOKEN_IMG3[key];
  if(!im){im=new Image();im.onload=()=>{try{draw()}catch(e){}};im.src='data:image/svg+xml,'+encodeURIComponent(sc3dSVG(figureSVG(spec),'s3i'));TOKEN_IMG3[key]=im}
  return im.complete&&im.naturalWidth?im:null}}

/* lit89 — any figureSVG output, lit, with ids of its own (card art, avatar badges, beast cards: his rule — every place a
   character token shows wears the look). Falls back to the plain SVG when the look is off or HEADLESS. */
let SC3D_LN=0;
function lit89(svg){try{return SC3D.on&&!HEADLESS&&typeof svg==='string'?sc3dSVG(svg,'s3l'+(++SC3D_LN).toString(36)):svg}catch(e){return svg}}
