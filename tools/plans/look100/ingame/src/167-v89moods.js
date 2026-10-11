/* 167-v89moods — v0.89 FLAVIUS'S MOOD FACES (his picks 2026-10-05).
   • Flavius in the box = HIS PAINTED FACE from the Mandata Flavi card back: eleven moods made by tools/art/flavmoods89/make.py
     (calm pleased smug cheer laugh shock angry bored weep facepalm really) → assets/flavmood_<mood>.webp. flavFace draws the painting
     (cover-fit) inside his framed box for Flavius (no sponsor / SPONSOR_FLAVIUS); the frame, label, curtain and speech slip stay.
     flavFaceURL (HTML windows: the Thumb ritual, tutorials, Settings → Editors) follows, since it calls flavFace. Until an image has
     loaded the old drawn face shows; the cached portraits are dropped when it arrives. On a file:// page a painted canvas cannot be
     read back (tainted), so flavFaceURL then hands out the painting's own URL.
   • NEW 11th MOOD 'really' (his Picard "what was THAT?" picture): brow up, mouth mid-sentence, an open palm held out. FLAV_PRI/
     FLAV_LINES + every sponsor voice; flaviusReact uses it for truces, misses / no attack, tunnels, gifts to rivals and a spared
     thumb (sometimes — the old moods keep their share). The spear scowl (129) is untouched.
   • SPONSORS (city editors + Studio-made) keep their own looks (skin, hair, beard, headgear, robe, accessory) but are drawn with more
     detail in the card's style: ink outlines, cel shading (lit left, shadow right), nose, cheekbones, ears, eyes with whites, shaped
     hair and beards, and bigger mood changes (lifted cheeks, a smirk with one brow up, heavy lids + head tilt, the open palm, a hand
     over the eyes). The Studio preview row shows 'really' too. No new creator parts were needed. */

/* FLAVM89 — the painted moods: Image objects by mood. TWEAK: the list must match make.py's MOODS. */
const FLAVM89_SRC={calm:'assets/flavmood_calm.webp',pleased:'assets/flavmood_pleased.webp',smug:'assets/flavmood_smug.webp',
  cheer:'assets/flavmood_cheer.webp',laugh:'assets/flavmood_laugh.webp',shock:'assets/flavmood_shock.webp',angry:'assets/flavmood_angry.webp',
  bored:'assets/flavmood_bored.webp',weep:'assets/flavmood_weep.webp',facepalm:'assets/flavmood_facepalm.webp',really:'assets/flavmood_really.webp'};
const FLAVM89={img:{},url:{},n:0};
/* flavM89Url — the usable URL of a painted mood (a data URI in the standalone build, else assets/ through assetURL). */
const flavM89Url=p=>String(p).startsWith('data:')?p:(typeof assetURL==='function'?assetURL(String(p).slice(7)):p);
if(typeof Image!=='undefined')for(const [m,p] of Object.entries(FLAVM89_SRC)){const im=new Image();FLAVM89.url[m]=flavM89Url(p);
  im.onload=()=>{FLAVM89.n++;for(const k of Object.keys(FLAV_IMG))if(k.startsWith('flavius:'))delete FLAV_IMG[k]};im.src=FLAVM89.url[m];FLAVM89.img[m]=im}
/* flavM89Ready — the painted image of a mood when it has loaded (else null). */
function flavM89Ready(mood){const im=FLAVM89.img[mood]||FLAVM89.img.calm;return im&&im.complete&&im.naturalWidth?im:null}
/* flavIsFlavius — whether a sponsor object stands for Flavius himself. */
const flavIsFlavius=sp=>!sp||!sp.id||sp.id==='flavius';

/* the 'really' mood: priority + lines (Flavius and every sponsor voice). */
FLAV_PRI.really=2;
FLAV_LINES.really=[_T('Really?'),_T('What was THAT?'),_T('I paid for this?'),_T('Is this a joke? Am I laughing?'),_T('Explain that to my treasurer.')];
if(typeof SPONSOR_VOICES!=='undefined'){const RV={
  merchant:[_T('Really? At these prices?'),_T('What was THAT? I want an invoice.')],
  noble:[_T('Really, darling?'),_T('What on earth was that?')],
  soldier:[_T('What was THAT, recruit?'),_T('Really? On my sand?')],
  priest:[_T('Really? Before the gods?'),_T('What omen was THAT?')],
  poet:[_T('Really? That is your line?'),_T('What was THAT? Strike it from the scroll.')],
  showman:[_T('Really? THAT is the show?'),_T('What was THAT, folks?')],
  crone:[_T('Really, dearie?'),_T('What was THAT? Even the eels laughed.')]};
  for(const [k,v] of Object.entries(RV))if(SPONSOR_VOICES[k])SPONSOR_VOICES[k].really=v}

/* flaviusReact: 'really' for truces, misses, tunnels, gifts and a spared thumb. TWEAK: the chances. */
{const base=flaviusReact;flaviusReact=function(kind,info={}){
  if(!HEADLESS){const R=(ch,dur,say)=>{if(Math.random()<ch){flaviusMood('really',dur,say);return true}return false};
    if(kind==='truce'&&R(.3,3600,.75))return;
    if(kind==='nohit'&&R(.35,3200,.65))return;
    if(kind==='tunnel'&&R(.45,3000,.6))return;
    if(kind==='gift'&&R(.5,2600,.45))return;
    if(kind==='spare'){if(typeof FLAV!=='undefined')FLAV.until=0;flaviusMood('really',3600,.8);return}}
  return base.apply(this,arguments)}}
/* the Thumb of Flavius: a spared gladiator sometimes gets "Really?" instead of the cheer (he wanted blood). */
let THUMB89=false;
{const base=thumbStageHTML;thumbStageHTML=function(stage){
  if(stage&&stage.mood==='cheer'&&stage.fate===_T('👍 Spared · Ludus Flavius')){THUMB89=Math.random()<.5;if(THUMB89)stage={...stage,mood:'really'}}
  return base.call(this,stage)}}
{const base=thumbRitual;thumbRitual=async function(){THUMB89=false;const r=await base.apply(this,arguments);
  try{if(r&&r.spared&&THUMB89)flaviusReact('spare')}catch(e){}return r}}

/* ---------- drawing helpers (the card's ink + cel style) ---------- */
const SP89_INK='#170e0a';
/* sp89Mix — mixes a #hex colour toward black (k<0) or white (k>0). */
function sp89Mix(hex,k){let h=String(hex||'#888').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');
  const n=parseInt(h.slice(0,6),16);if(isNaN(n))return hex;let r=n>>16&255,g=n>>8&255,b=n&255;const t=k<0?0:255,a=Math.abs(k);
  r=Math.round(r+(t-r)*a);g=Math.round(g+(t-g)*a);b=Math.round(b+(t-b)*a);return `rgb(${r},${g},${b})`}
/* sp89Lip — a lip colour from the skin. */
function sp89Lip(skin){let h=String(skin||'#d9a07a').replace('#','');const n=parseInt(h.slice(0,6),16)||0xd9a07a;
  const r=n>>16&255,g=n>>8&255,b=n&255;return `rgb(${Math.round(r*.78+150*.22)},${Math.round(g*.62+40*.38)},${Math.round(b*.6+40*.4)})`}

/* sponFace89 — a sponsor's portrait (no box): drawn in unit space (1 = u px) around the face centre. */
function sponFace89(c,cx,cy,w,h,mood,sp){
  const u=h/11,fy=cy+u*0.9,hy=fy-u*1.2;
  const skin=sp.skin||'#d9a07a',hair=sp.hair||'#2a1c12',robe=sp.robe||'#5a3566',trim=sp.trim||'#e8dcc0',gem=sp.gem||'#c0433a';
  const skL=sp89Mix(skin,.22),skD=sp89Mix(skin,-.26),skDD=sp89Mix(skin,-.45),hL=sp89Mix(hair,.28),hD=sp89Mix(hair,-.35);
  const hg=sp.head||'laurel';const bd=sp.beard===undefined?'full':sp.beard;
  const open=mood==='laugh'||mood==='cheer'||mood==='shock'||mood==='really';
  const lw=Math.max(1,u*0.17);
  const E=(x,y,rx,ry,r=0)=>{c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),r,0,Math.PI*2)};
  const ink=(wd)=>{c.strokeStyle=SP89_INK;c.lineWidth=(wd||lw)/u;c.lineJoin='round';c.lineCap='round';c.stroke()};
  const fillInk=(col,wd)=>{c.fillStyle=col;c.fill();ink(wd)};
  /* ---- the robe and shoulders (box coordinates) ---- */
  c.save();
  c.beginPath();c.moveTo(cx-w/2+5,cy+h/2-4);c.quadraticCurveTo(cx-u*3.4,fy+u*1.6,cx,fy+u*2.2);c.quadraticCurveTo(cx+u*3.4,fy+u*1.6,cx+w/2-5,cy+h/2-4);c.closePath();
  c.fillStyle=robe;c.fill();c.save();c.clip();
  c.fillStyle=sp89Mix(robe,-.3);c.beginPath();c.moveTo(cx+u*0.8,fy+u*2.2);c.quadraticCurveTo(cx+u*3.6,fy+u*2.4,cx+w/2,cy+h/2);c.lineTo(cx+u*0.4,cy+h/2);c.closePath();c.fill();
  c.fillStyle=sp89Mix(robe,.18);c.beginPath();c.moveTo(cx-w/2,cy+h/2-u*1.2);c.quadraticCurveTo(cx-u*3.6,fy+u*1.9,cx-u*2.2,fy+u*2.0);c.lineTo(cx-u*2.6,fy+u*2.6);c.quadraticCurveTo(cx-u*4.2,fy+u*2.8,cx-w/2,cy+h/2);c.closePath();c.fill();
  c.strokeStyle=sp89Mix(robe,-.5);c.lineWidth=Math.max(1,u*0.12);for(const [x0,x1] of [[-2.8,-3.3],[2.4,2.9],[3.6,4.4]]){c.beginPath();c.moveTo(cx+u*x0,fy+u*2.6);c.quadraticCurveTo(cx+u*(x0+x1)/2+u*.3,fy+u*3.4,cx+u*x1,cy+h/2);c.stroke()}
  c.restore();
  c.strokeStyle=SP89_INK;c.lineWidth=lw;c.lineJoin='round';c.beginPath();c.moveTo(cx-w/2+5,cy+h/2-4);c.quadraticCurveTo(cx-u*3.4,fy+u*1.6,cx,fy+u*2.2);c.quadraticCurveTo(cx+u*3.4,fy+u*1.6,cx+w/2-5,cy+h/2-4);c.stroke();
  /* toga fold (trim) + a brooch */
  c.beginPath();c.moveTo(cx-u*1.4,fy+u*2.4);c.quadraticCurveTo(cx,fy+u*1.5,cx+u*1.6,fy+u*2.6);c.lineTo(cx+u*1.2,fy+u*3.2);c.quadraticCurveTo(cx,fy+u*2.4,cx-u*1.4,fy+u*3);c.closePath();
  c.fillStyle=trim;c.fill();c.strokeStyle=SP89_INK;c.lineWidth=lw;c.stroke();
  c.fillStyle=sp89Mix(trim,-.25);c.beginPath();c.moveTo(cx+u*0.2,fy+u*2.05);c.quadraticCurveTo(cx+u*1.0,fy+u*2.15,cx+u*1.5,fy+u*2.62);c.lineTo(cx+u*1.25,fy+u*3.0);c.quadraticCurveTo(cx+u*0.8,fy+u*2.5,cx+u*0.1,fy+u*2.35);c.closePath();c.fill();
  E(cx-u*1.9,fy+u*2.55,u*0.42,u*0.42);c.fillStyle='#d9b45a';c.fill();c.stroke();E(cx-u*1.9,fy+u*2.55,u*0.2,u*0.2);c.fillStyle=gem;c.fill();
  c.restore();
  /* ---- the head, in unit space ---- */
  c.save();c.translate(cx,hy);c.scale(u,u);
  const tilt={bored:.15,laugh:-.08,facepalm:.2,really:-.07,smug:-.05,weep:.06}[mood]||0;
  if(tilt){c.translate(0,4);c.rotate(tilt);c.translate(0,-4)}
  if(mood==='facepalm')c.translate(0,.25);
  /* hood (back) and long hair fall behind */
  if(hg==='hood'){c.beginPath();c.moveTo(-3.3,5);c.bezierCurveTo(-3.6,0,-3.4,-4.4,0,-4.5);c.bezierCurveTo(3.4,-4.4,3.6,0,3.3,5);c.closePath();fillInk(sp89Mix(robe,-.35))}
  if(sp.long){c.beginPath();c.moveTo(-2.3,-2.2);c.bezierCurveTo(-3.6,-1,-3.6,3,-3.1,5.2);c.lineTo(-1.6,4.2);c.lineTo(1.6,4.2);c.lineTo(3.1,5.2);c.bezierCurveTo(3.6,3,3.6,-1,2.3,-2.2);c.closePath();fillInk(hD);
    c.strokeStyle=hair;c.lineWidth=.14;for(const s of [-1,1])for(const k of [0,1]){c.beginPath();c.moveTo(s*(2.6+k*.4),-.6);c.quadraticCurveTo(s*(3.2+k*.2),2,s*(2.8+k*.2),4.6);c.stroke()}}
  /* neck */
  c.beginPath();c.moveTo(-1.05,2);c.lineTo(-1.15,4.6);c.lineTo(1.15,4.6);c.lineTo(1.05,2);c.closePath();fillInk(skD);
  c.fillStyle=skDD;c.beginPath();c.moveTo(-1.05,2.2);c.quadraticCurveTo(0,3.4,1.05,2.2);c.lineTo(1.1,3);c.quadraticCurveTo(0,3.7,-1.1,3);c.closePath();c.fill();
  /* ears */
  if(hg!=='hood'&&hg!=='helm')for(const s of [-1,1]){E(s*2.42,.25,.36,.66);fillInk(s<0?skin:skD);c.beginPath();c.arc(s*2.42,.25,.2,s<0?Math.PI*.6:-Math.PI*.4,s<0?Math.PI*1.4:Math.PI*.4);c.strokeStyle=skDD;c.lineWidth=.1;c.stroke()}
  /* the face */
  const jd=open?.25:0;
  const face=()=>{c.beginPath();c.moveTo(0,-3);c.bezierCurveTo(1.6,-3,2.45,-2,2.45,-.6);c.bezierCurveTo(2.45,.6,2.1,1.6+jd,1.4,2.3+jd);c.bezierCurveTo(.9,2.8+jd,.45,3+jd,0,3+jd);
    c.bezierCurveTo(-.45,3+jd,-.9,2.8+jd,-1.4,2.3+jd);c.bezierCurveTo(-2.1,1.6+jd,-2.45,.6,-2.45,-.6);c.bezierCurveTo(-2.45,-2,-1.6,-3,0,-3);c.closePath()};
  face();c.fillStyle=skin;c.fill();
  c.save();face();c.clip();
  /* cel shade: shadow side right, lit forehead + left cheek */
  c.fillStyle=skD;c.beginPath();c.moveTo(.9,-3.4);c.bezierCurveTo(1.7,-1.6,1.15,.2,1.55,1.1);c.bezierCurveTo(1.7,2,.8,2.8,.2,3.6);c.lineTo(3,3.6);c.lineTo(3,-3.4);c.closePath();c.fill();
  c.fillStyle=skL;c.beginPath();c.moveTo(-1.9,-1.7);c.quadraticCurveTo(-1,-2.75,.4,-2.5);c.quadraticCurveTo(-.6,-2.1,-1.3,-1.4);c.closePath();c.fill();
  c.beginPath();c.moveTo(-2.05,.15);c.quadraticCurveTo(-1.6,.95,-1.0,.9);c.quadraticCurveTo(-1.5,.4,-1.6,-.05);c.closePath();c.fill();
  /* cheekbone shadows */
  c.strokeStyle=skDD;c.globalAlpha=.55;c.lineWidth=.1;for(const s of [-1,1]){c.beginPath();c.moveTo(s*2.1,.55);c.quadraticCurveTo(s*1.75,1.15,s*1.3,1.2);c.stroke()}c.globalAlpha=1;
  /* blush / flush */
  if(mood==='angry'||mood==='pleased'||mood==='laugh'){const a=mood==='angry'?.38:.18;for(const s of [-1,1]){const g=c.createRadialGradient(s*1.45,.95,0,s*1.45,.95,1.2);g.addColorStop(0,`rgba(200,40,30,${a})`);g.addColorStop(1,'rgba(200,40,30,0)');c.fillStyle=g;c.fillRect(s*1.45-1.3,-.4,2.6,2.8)}
    if(mood==='angry'){const g=c.createLinearGradient(0,-3,0,-1);g.addColorStop(0,'rgba(190,30,20,.3)');g.addColorStop(1,'rgba(190,30,20,0)');c.fillStyle=g;c.fillRect(-2.5,-3,5,2.2)}}
  c.restore();
  face();ink();
  /* beards (drawn before the mouth, the mouth sits on top) */
  if(bd&&bd!=='none'){const low=bd==='long'?5.1:bd==='short'?3.2:3.75;const bt=bd==='short'?.9:.45;
    c.beginPath();c.moveTo(-2.42,bt);c.bezierCurveTo(-2.45,1.8,-1.7,low-.4+jd,0,low+jd);c.bezierCurveTo(1.7,low-.4+jd,2.45,1.8,2.42,bt);
    c.bezierCurveTo(2.1,1.0,1.7,1.25,1.2,1.35);c.quadraticCurveTo(0,1.1,-1.2,1.35);c.bezierCurveTo(-1.7,1.25,-2.1,1,-2.42,bt);c.closePath();
    if(bd==='short'){c.globalAlpha=.55;c.fillStyle=hair;c.fill();c.globalAlpha=1;c.strokeStyle=hD;c.lineWidth=.08;c.stroke()}
    else{c.fillStyle=hair;c.fill();c.save();c.clip();c.fillStyle=hD;c.beginPath();c.moveTo(.6,1.2);c.quadraticCurveTo(1.4,2.8,.2,low+jd+.4);c.lineTo(3,low+1);c.lineTo(3,0);c.closePath();c.fill();
      c.strokeStyle=hL;c.lineWidth=.1;for(let i=-4;i<=4;i++){const x=i*.42;c.beginPath();c.moveTo(x,1.8+Math.abs(i)*.05);c.quadraticCurveTo(x*1.05+.12,(1.8+low)/2+.2,x*.85,low+jd-.15-Math.abs(i)*.12);c.stroke()}c.restore();ink()}
    /* moustache */
    c.beginPath();c.moveTo(-1.3,1.95+(open?.1:0));c.quadraticCurveTo(-.7,1.25,0,1.48);c.quadraticCurveTo(.7,1.25,1.3,1.95+(open?.1:0));c.quadraticCurveTo(.7,1.7,0,1.78);c.quadraticCurveTo(-.7,1.7,-1.3,1.95+(open?.1:0));c.closePath();
    if(bd==='short'){c.fillStyle=hair;c.fill()}else fillInk(hair,lw*.8)}
  /* nose: bridge line, shadow plane, nostril */
  c.fillStyle=skD;c.beginPath();c.moveTo(.12,-.15);c.quadraticCurveTo(.35,.7,.42,1.12);c.quadraticCurveTo(.2,1.3,.05,1.22);c.closePath();c.fill();
  c.beginPath();c.moveTo(-.05,-.2);c.quadraticCurveTo(.05,.6,-.18,1.05);c.quadraticCurveTo(0,1.32,.4,1.2);c.strokeStyle=SP89_INK;c.lineWidth=lw*.8/u;c.lineCap='round';c.stroke();
  c.beginPath();c.arc(.3,1.08,.12,Math.PI*.2,Math.PI*1.1);c.lineWidth=.08;c.stroke();
  /* eyes */
  const eye=(s,o)=>{const x=s*1.0,y=.05;o=o||{};const rx=o.rx||.5,ry=o.ry||.25;
    if(o.closed){c.beginPath();c.arc(x,y+(o.up?.15:-.05),rx*.9,o.up?Math.PI*1.15:Math.PI*.15,o.up?Math.PI*1.85:Math.PI*.85);c.strokeStyle=SP89_INK;c.lineWidth=lw*1.1/u;c.stroke();return}
    c.save();E(x,y,rx,ry);c.fillStyle='#f4ead8';c.fill();c.clip();
    const ix=x+(o.lx||.05),iy=y+(o.ly||.03);E(ix,iy,o.ir||.2,o.ir||.2);c.fillStyle=sp.eye||'#4a2c18';c.fill();E(ix,iy,(o.ir||.2)*.5,(o.ir||.2)*.5);c.fillStyle='#0c0806';c.fill();
    E(ix-.06,iy-.07,.05,.05);c.fillStyle='#fff';c.fill();
    if(o.lid){c.fillStyle=skD;c.fillRect(x-rx-.1,y-ry-.1,rx*2+.2,(ry*2+.1)*o.lid);c.beginPath();c.moveTo(x-rx,y-ry+(ry*2+.1)*o.lid);c.lineTo(x+rx,y-ry+(ry*2+.1)*o.lid);c.strokeStyle=SP89_INK;c.lineWidth=lw/u;c.stroke()}
    if(o.cut){c.fillStyle=skD;c.beginPath();c.moveTo(x-s*rx*1.2,y-ry-.2);c.lineTo(x-s*rx*1.2,y+ry*.1);c.lineTo(x+s*rx*1.2,y-ry*.6);c.lineTo(x+s*rx*1.2,y-ry-.2);c.closePath();c.fill()}
    if(o.low){c.fillStyle=skin;E(x,y+ry*1.55,rx*1.15,ry*1.1);c.fill()}
    c.restore();
    c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI*1.02,Math.PI*1.98);c.strokeStyle=SP89_INK;c.lineWidth=lw*1.15/u;c.stroke();
    c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI*.15,Math.PI*.85);c.lineWidth=.06;c.stroke();
    if(o.low){c.beginPath();c.ellipse(x,y+ry*1.55,rx*1.05,ry*1.0,0,Math.PI*1.15,Math.PI*1.85);c.lineWidth=.09;c.stroke()}
    if(o.wet){c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI*.1,Math.PI*.9);c.strokeStyle='#8cc4ee';c.lineWidth=.1;c.stroke()}};
  const EO={
    calm:[{},{}],pleased:[{low:1},{low:1}],cheer:[{rx:.55,ry:.33},{rx:.55,ry:.33}],laugh:[{closed:1,up:1},{closed:1,up:1}],
    shock:[{rx:.5,ry:.46,ir:.13},{rx:.5,ry:.46,ir:.13}],angry:[{cut:1,ir:.17},{cut:1,ir:.17}],bored:[{lid:.62,ly:.08},{lid:.62,ly:.08}],
    smug:[{lid:.35,lx:.15},{lid:.5,lx:.15}],weep:[{wet:1,ly:-.06},{wet:1,ly:-.06}],really:[{lid:.4,lx:-.08},{rx:.52,ry:.36,lx:-.08}],facepalm:[{closed:1},{closed:1}]}[mood]||[{},{}];
  eye(-1,EO[0]);eye(1,EO[1]);
  /* brows: inner y, outer y, arch (per side) */
  const BR={calm:[[-.55,-.6,.15],[-.55,-.6,.15]],pleased:[[-.62,-.7,.18],[-.62,-.7,.18]],cheer:[[-.85,-.85,.25],[-.85,-.85,.25]],laugh:[[-.7,-.75,.2],[-.7,-.75,.2]],
    shock:[[-.95,-1,.3],[-.95,-1,.3]],angry:[[-.2,-.78,-.05],[-.2,-.78,-.05]],bored:[[-.42,-.45,.05],[-.42,-.45,.05]],smug:[[-.45,-.48,.05],[-.75,-1.05,.3]],
    weep:[[-.95,-.45,.0],[-.95,-.45,.0]],really:[[-.38,-.45,.05],[-.85,-1.25,.38]],facepalm:[[-.45,-.5,.1],[-.45,-.5,.1]]}[mood]||[[-.55,-.6,.15],[-.55,-.6,.15]];
  for(const [i,s] of [[0,-1],[1,1]]){const [yi,yo,ar]=BR[i];const xi=s*.42,xo=s*1.62,mx=(xi+xo)/2,my=(yi+yo)/2-ar;
    c.beginPath();c.moveTo(xi,yi+.1);c.quadraticCurveTo(mx,my-.1,xo,yo);c.quadraticCurveTo(mx,my+.12,xi,yi+.24);c.closePath();fillInk(hair,lw*.6)}
  /* forehead lines for big brows */
  if(mood==='shock'||mood==='really'||mood==='weep'){c.strokeStyle=skDD;c.lineWidth=.08;for(const yy of [-1.75,-2.05]){c.beginPath();c.moveTo(-.9,yy);c.quadraticCurveTo(0,yy-.15,.9,yy);c.stroke()}}
  if(mood==='angry'){c.strokeStyle=skDD;c.lineWidth=.09;c.beginPath();c.moveTo(-.12,-.6);c.lineTo(-.18,-1.0);c.moveTo(.12,-.6);c.lineTo(.18,-1.0);c.stroke()}
  /* mouth (my = 1.95) */
  const lip=sp89Lip(skin),dark='#3a120e';const my=1.98;
  const lowLip=(x,y,rx)=>{E(x,y,rx,.16);c.fillStyle=lip;c.fill()};
  c.lineCap='round';
  if(mood==='laugh'||mood==='cheer'||mood==='angry'||mood==='shock'||mood==='really'){
    c.beginPath();
    if(mood==='laugh'){c.moveTo(-.9,my-.25);c.quadraticCurveTo(0,my-.05,.9,my-.25);c.quadraticCurveTo(.7,my+1.15,0,my+1.1);c.quadraticCurveTo(-.7,my+1.15,-.9,my-.25)}
    else if(mood==='cheer')c.ellipse(0,my+.25,.62,.55,0,0,Math.PI*2);
    else if(mood==='shock')c.ellipse(0,my+.3,.32,.48,0,0,Math.PI*2);
    else if(mood==='really')c.ellipse(.12,my+.15,.38,.26,-.1,0,Math.PI*2);
    else{c.moveTo(-.75,my-.05);c.lineTo(.75,my-.05);c.lineTo(.6,my+.45);c.lineTo(-.6,my+.45);c.closePath()}
    c.save();c.fillStyle=dark;c.fill();c.clip();
    if(mood!=='shock'){c.fillStyle='#efe6d4';if(mood==='angry'){c.fillRect(-.8,my-.1,1.6,.55);c.strokeStyle='#8a7a68';c.lineWidth=.05;c.beginPath();c.moveTo(-.8,my+.2);c.lineTo(.8,my+.2);for(const xx of [-.4,0,.4]){c.moveTo(xx,my-.1);c.lineTo(xx,my+.45)}c.stroke()}
      else{c.fillRect(-1,my-.35,2,mood==='really'?.2:.3)}}
    if(mood==='laugh'||mood==='cheer'){c.fillStyle='#b8444a';E(0,my+(mood==='laugh'?.95:.72),.45,.28);c.fill()}
    c.restore();ink(lw*.9);
    if(mood==='angry'){c.strokeStyle=SP89_INK;c.lineWidth=.1;c.beginPath();c.moveTo(-.75,my-.05);c.lineTo(-.95,my+.25);c.moveTo(.75,my-.05);c.lineTo(.95,my+.25);c.stroke()}}
  else{
    let pts;
    if(mood==='pleased')pts=[[-.8,my-.25],[0,my+.42],[.8,my-.25]];
    else if(mood==='smug')pts=[[-.55,my+.05],[.15,my+.12],[.8,my-.32]];
    else if(mood==='weep')pts=[[-.6,my+.22],[0,my-.15],[.6,my+.22]];
    else if(mood==='bored')pts=[[-.55,my+.08],[.05,my+.05],[.6,my+.16]];
    else if(mood==='facepalm')pts=[[-.55,my+.12],[0,my-.02],[.55,my+.12]];
    else pts=[[-.58,my+.03],[0,my-.04],[.58,my+.05]];
    lowLip((pts[0][0]+pts[2][0])/2,pts[1][1]+.17+(mood==='pleased'?-.12:0),.38);
    c.beginPath();c.moveTo(...pts[0]);c.quadraticCurveTo(...pts[1],...pts[2]);c.strokeStyle=SP89_INK;c.lineWidth=lw*1.05/u;c.stroke();
    if(mood==='pleased'){c.lineWidth=.08;c.strokeStyle=skDD;for(const s of [-1,1]){c.beginPath();c.arc(s*1.2,my-.55,.55,s<0?Math.PI*.15:Math.PI*.35,s<0?Math.PI*.65:Math.PI*.85);c.stroke()}}
    if(mood==='smug'){c.lineWidth=.08;c.beginPath();c.moveTo(.82,my-.42);c.quadraticCurveTo(.98,my-.3,.92,my-.12);c.stroke()}}
  /* tears */
  if(mood==='weep'){c.strokeStyle='#8cc4ee';c.lineWidth=.16;for(const s of [-1,1]){c.beginPath();c.moveTo(s*.9,.32);c.quadraticCurveTo(s*1.05,1.1,s*.85,1.75);c.stroke();E(s*.84,1.88,.12,.17);c.fillStyle='#bfe0f6';c.fill();c.strokeStyle=SP89_INK;c.lineWidth=.05;c.stroke();c.strokeStyle='#8cc4ee';c.lineWidth=.16}}
  /* hair on top */
  if(hg!=='hood'&&hg!=='helm'){
    c.beginPath();c.moveTo(-2.5,-.4);c.bezierCurveTo(-2.75,-2.2,-2.1,-3.55,0,-3.62);c.bezierCurveTo(2.1,-3.55,2.75,-2.2,2.5,-.4);
    c.bezierCurveTo(2.35,-1.0,2.2,-1.5,1.85,-1.75);c.quadraticCurveTo(1.2,-2.05,.6,-2.0);c.quadraticCurveTo(0,-2.3,-.6,-2.0);c.quadraticCurveTo(-1.2,-2.05,-1.85,-1.75);c.bezierCurveTo(-2.2,-1.5,-2.35,-1.0,-2.5,-.4);c.closePath();
    c.fillStyle=hair;c.fill();c.save();c.clip();c.fillStyle=hD;c.beginPath();c.moveTo(.6,-3.8);c.quadraticCurveTo(2.0,-2.6,1.4,-1.6);c.lineTo(3,-1);c.lineTo(3,-3.8);c.closePath();c.fill();
    c.strokeStyle=hL;c.lineWidth=.09;for(const [x0,y0,x1,y1] of [[-1.9,-2.3,-1.0,-3.3],[-1.2,-2.1,-.2,-3.4],[-.4,-2.2,.6,-3.35],[.5,-2.1,1.4,-3.1],[-2.3,-1.2,-1.9,-2.6]]){c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo((x0+x1)/2-.25,(y0+y1)/2,x1,y1);c.stroke()}
    c.restore();ink();
}
  /* headgear */
  if(hg==='laurel'||hg==='flowers'){c.strokeStyle=hg==='flowers'?'#3f6a2e':'#4e7a2e';c.lineWidth=.22;c.beginPath();c.arc(0,-.8,2.75,Math.PI*1.08,Math.PI*1.92);c.stroke();
    for(let i=0;i<=8;i++){const a=Math.PI*(1.1+i*.1);const x=Math.cos(a)*2.75,y=-.8+Math.sin(a)*2.75;
      if(hg==='flowers'&&i%2===0){const col=['#e07b9a','#f0cf7d','#9aa6ff'][i%3];for(let p=0;p<5;p++){const pa=p*Math.PI*2/5;E(x+Math.cos(pa)*.2,y+Math.sin(pa)*.2,.16,.16);c.fillStyle=col;c.fill()}E(x,y,.1,.1);c.fillStyle='#f6e27a';c.fill();continue}
      for(const sd of [-1,1]){E(x+Math.cos(a+sd*1.2)*.28,y+Math.sin(a+sd*1.2)*.28,.36,.15,a+sd*.9);c.fillStyle=sd<0?'#7fae4a':'#5f8a3a';c.fill();c.strokeStyle='#1e3010';c.lineWidth=.06;c.stroke()}}}
  else if(hg==='diadem'){c.beginPath();c.moveTo(-2.3,-1.75);c.quadraticCurveTo(0,-2.75,2.3,-1.75);c.lineTo(2.25,-1.35);c.quadraticCurveTo(0,-2.3,-2.25,-1.35);c.closePath();fillInk('#e6b93a',lw*.7);
    c.strokeStyle='#fff3c0';c.lineWidth=.07;c.beginPath();c.moveTo(-1.8,-1.82);c.quadraticCurveTo(-.6,-2.35,0,-2.38);c.stroke();
    c.beginPath();c.moveTo(-.4,-2.2);c.lineTo(0,-2.95);c.lineTo(.4,-2.2);c.closePath();fillInk('#e6b93a',lw*.6);E(0,-2.25,.24,.24);fillInk(gem,lw*.5);E(-.07,-2.32,.07,.07);c.fillStyle='#fff';c.fill()}
  else if(hg==='hood'){c.beginPath();c.moveTo(-3.3,5);c.bezierCurveTo(-3.6,0,-3.4,-4.4,0,-4.5);c.bezierCurveTo(3.4,-4.4,3.6,0,3.3,5);c.lineTo(2.5,5);c.bezierCurveTo(2.6,1.5,2.9,-3.3,0,-3.35);c.bezierCurveTo(-2.9,-3.3,-2.6,1.5,-2.5,5);c.closePath();
    c.fillStyle=robe;c.fill();c.save();c.clip();c.fillStyle=sp89Mix(robe,-.3);c.fillRect(1.2,-5,3,10);c.fillStyle=sp89Mix(robe,.18);c.fillRect(-3.6,-5,.7,10);c.restore();ink();
    c.strokeStyle=sp89Mix(robe,-.45);c.lineWidth=.1;c.beginPath();c.moveTo(-2.9,-2.3);c.quadraticCurveTo(-3.2,1,-2.9,4.4);c.moveTo(2.9,-2.3);c.quadraticCurveTo(3.2,1,2.9,4.4);c.stroke()}
  else if(hg==='helm'){c.beginPath();c.moveTo(-2.65,-.5);c.bezierCurveTo(-2.9,-3.4,-1.5,-4.2,0,-4.2);c.bezierCurveTo(1.5,-4.2,2.9,-3.4,2.65,-.5);c.lineTo(2.2,-.5);c.quadraticCurveTo(2.0,-1.6,1.6,-1.7);c.lineTo(-1.6,-1.7);c.quadraticCurveTo(-2.0,-1.6,-2.2,-.5);c.closePath();
    c.fillStyle='#a9aeb5';c.fill();c.save();c.clip();c.fillStyle='#7a8088';c.fillRect(.9,-4.5,3,4.2);c.fillStyle='#d8dde2';c.fillRect(-2.2,-3.6,.5,2.5);c.restore();ink();
    for(const s of [-1,1]){c.beginPath();c.moveTo(s*2.2,-.6);c.lineTo(s*2.65,-.5);c.lineTo(s*2.5,1.6);c.quadraticCurveTo(s*2.05,1.7,s*1.9,1.1);c.closePath();fillInk(s<0?'#b7bcc2':'#858b93',lw*.7)}
    c.beginPath();c.moveTo(-1.6,-1.7);c.lineTo(1.6,-1.7);c.strokeStyle='#5d636b';c.lineWidth=.22;c.stroke();
    c.beginPath();c.moveTo(-.25,-4.1);c.lineTo(-.25,-5.1);c.lineTo(.25,-5.1);c.lineTo(.25,-4.1);c.closePath();fillInk('#c9a458',lw*.6);
    c.beginPath();c.moveTo(-2.1,-4.6);c.quadraticCurveTo(0,-6.3,2.1,-4.6);c.quadraticCurveTo(0,-5.2,-2.1,-4.6);c.closePath();fillInk(gem,lw*.7);
    c.strokeStyle=sp89Mix(gem,-.35);c.lineWidth=.07;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*.5,-5.35+Math.abs(i)*.12);c.lineTo(i*.55,-4.85+Math.abs(i)*.05);c.stroke()}}
  else if(hg==='turban'){const cl=sp.gem||'#e8dcc0';c.beginPath();c.moveTo(-2.6,-1.1);c.bezierCurveTo(-3.0,-3.8,-1.3,-4.4,0,-4.35);c.bezierCurveTo(1.3,-4.4,3.0,-3.8,2.6,-1.1);c.quadraticCurveTo(0,-2.2,-2.6,-1.1);c.closePath();
    c.fillStyle=cl;c.fill();c.save();c.clip();c.fillStyle=sp89Mix(cl,-.25);c.fillRect(.9,-4.6,2.2,3.6);c.strokeStyle=sp89Mix(cl,-.4);c.lineWidth=.1;
    for(let i=0;i<4;i++){c.beginPath();c.moveTo(-2.8,-1.4-i*.65);c.quadraticCurveTo(0,-2.2-i*.75+(i%2?.3:-.2),2.8,-1.9-i*.5);c.stroke()}c.restore();ink();
    E(0,-2.15,.26,.3);fillInk(sp.gem&&sp.gem!==cl?'#c0433a':'#5fc7c0',lw*.5)}
  /* hands: 'really' = an open palm held out; facepalm = a hand over the eyes */
  const palm=(x,y,rot,sc,overEyes)=>{c.save();c.translate(x,y);c.rotate(rot);c.scale(sc,sc);
    /* sleeve + forearm */
    c.beginPath();c.moveTo(-.55,.4);c.lineTo(.55,.4);c.lineTo(.75,4.2);c.lineTo(-.75,4.2);c.closePath();fillInk(skD);
    c.beginPath();c.moveTo(-.95,2.0);c.lineTo(.95,2.0);c.lineTo(1.25,5);c.lineTo(-1.25,5);c.closePath();fillInk(robe);c.beginPath();c.moveTo(-.95,2.0);c.lineTo(.95,2.0);c.strokeStyle=trim;c.lineWidth=.22;c.stroke();
    /* palm */
    c.beginPath();c.moveTo(-.75,.5);c.quadraticCurveTo(-.95,-.5,-.75,-1.05);c.lineTo(.8,-1.05);c.quadraticCurveTo(1.0,-.4,.7,.5);c.closePath();fillInk(skin);
    c.fillStyle=skD;c.beginPath();c.moveTo(.3,-.9);c.quadraticCurveTo(.75,-.3,.55,.4);c.lineTo(.7,.4);c.quadraticCurveTo(1.0,-.4,.8,-1.0);c.closePath();c.fill();
    /* fingers spread */
    const F=[[-.62,-1.0,-.35,1.15],[-.2,-1.05,-.1,1.35],[.22,-1.05,.12,1.3],[.62,-1.0,.36,1.05]];
    for(const [fx,fy2,ang,len] of F){c.save();c.translate(fx,fy2);c.rotate(ang);c.beginPath();c.moveTo(-.17,0);c.lineTo(-.15,-len+.15);c.quadraticCurveTo(0,-len-.08,.15,-len+.15);c.lineTo(.17,0);c.closePath();fillInk(skin,lw*.7);
      c.beginPath();c.moveTo(-.12,-len*.45);c.lineTo(.12,-len*.45);c.strokeStyle=skDD;c.lineWidth=.05;c.stroke();c.restore()}
    /* thumb */
    c.save();c.translate(-.75,-.1);c.rotate(-1.1);c.beginPath();c.moveTo(-.18,0);c.lineTo(-.16,-.85);c.quadraticCurveTo(0,-1.05,.16,-.85);c.lineTo(.18,0);c.closePath();fillInk(skin,lw*.7);c.restore();
    if(!overEyes){c.strokeStyle=skDD;c.lineWidth=.07;c.beginPath();c.moveTo(-.55,-.2);c.quadraticCurveTo(0,.15,.5,-.5);c.stroke()}
    c.restore()};
  if(mood==='facepalm')palm(.35,-.15,.55,1.05,true);
  c.restore();
  /* the open palm sits low on the left of the box, in box space (the hand of a man asking "really?") */
  if(mood==='really'){c.save();c.translate(cx-u*3.9,fy+u*2.1);c.scale(u,u);c.rotate(-.25);
    const s=1.3;c.scale(s,s);
    c.beginPath();c.moveTo(-.7,1.2);c.lineTo(2.6,3.4);c.lineTo(2.0,4.6);c.lineTo(-1.2,2.4);c.closePath();fillInk(robe);
    c.beginPath();c.moveTo(-.6,.2);c.lineTo(.55,.2);c.lineTo(.6,1.6);c.lineTo(-.65,1.6);c.closePath();fillInk(skD);
    /* palm up: a cupped palm with fingers spread up-left and the thumb out */
    c.beginPath();c.moveTo(-1.0,.35);c.quadraticCurveTo(-1.1,-.6,-.7,-.9);c.lineTo(.85,-.9);c.quadraticCurveTo(1.15,-.3,.8,.35);c.closePath();fillInk(skin);
    c.fillStyle=sp89Mix(skin,.18);E(-.05,-.35,.55,.3);c.fill();c.strokeStyle=skDD;c.lineWidth=.07;c.beginPath();c.moveTo(-.7,-.25);c.quadraticCurveTo(0,0,.6,-.55);c.stroke();
    for(const [fx,ang,len] of [[-.62,-.45,1.0],[-.22,-.18,1.2],[.2,.05,1.15],[.6,.3,.9]]){c.save();c.translate(fx,-.85);c.rotate(ang);c.beginPath();c.moveTo(-.16,0);c.lineTo(-.14,-len+.14);c.quadraticCurveTo(0,-len-.07,.14,-len+.14);c.lineTo(.16,0);c.closePath();fillInk(skin,lw*.7);c.restore()}
    c.save();c.translate(.85,-.15);c.rotate(1.05);c.beginPath();c.moveTo(-.17,0);c.lineTo(-.15,-.8);c.quadraticCurveTo(0,-1.0,.15,-.8);c.lineTo(.17,0);c.closePath();fillInk(skin,lw*.7);c.restore();
    c.restore()}
  /* the raised accessory on a cheer (outlined), held in a fist */
  if(mood==='cheer'){const ac=sp.acc||'goblet';c.save();c.lineWidth=lw;c.strokeStyle=SP89_INK;c.lineJoin='round';const ax=cx+w/2-u*2.15,ay=fy-u*3.0;
    c.beginPath();c.moveTo(ax-u*.55,ay+u*.4);c.lineTo(ax+u*.6,ay+u*.4);c.lineTo(ax+u*1.3,cy+h/2);c.lineTo(ax-u*.5,cy+h/2);c.closePath();c.fillStyle=robe;c.fill();c.stroke();
    if(ac==='goblet'){c.beginPath();c.moveTo(ax-u*.95,ay-u*1.4);c.lineTo(ax+u*.95,ay-u*1.4);c.quadraticCurveTo(ax+u*.8,ay-u*.5,ax+u*.18,ay-u*.35);c.lineTo(ax+u*.18,ay+u*.1);c.lineTo(ax-u*.18,ay+u*.1);c.lineTo(ax-u*.18,ay-u*.35);c.quadraticCurveTo(ax-u*.8,ay-u*.5,ax-u*.95,ay-u*1.4);c.closePath();c.fillStyle='#d9b45a';c.fill();c.stroke();
      c.fillStyle='#7a1f2a';c.beginPath();c.ellipse(ax,ay-u*1.4,u*.95,u*.25,0,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#fff3c0';c.lineWidth=Math.max(1,u*.1);c.beginPath();c.moveTo(ax-u*.6,ay-u*1.15);c.quadraticCurveTo(ax-u*.5,ay-u*.7,ax-u*.2,ay-u*.55);c.stroke()}
    else if(ac==='scroll'){c.fillStyle='#e8dcc0';c.fillRect(ax-u*.75,ay-u*2.2,u*1.5,u*2.2);c.strokeRect(ax-u*.75,ay-u*2.2,u*1.5,u*2.2);c.fillStyle='#a88a5a';for(const yy of [ay-u*2.35,ay-u*.15]){c.fillRect(ax-u*.95,yy,u*1.9,u*.35);c.strokeRect(ax-u*.95,yy,u*1.9,u*.35)}
      c.strokeStyle='#8a6a3a';c.lineWidth=Math.max(1,u*.08);for(let i=0;i<4;i++){c.beginPath();c.moveTo(ax-u*.5,ay-u*(1.8-i*.4));c.lineTo(ax+u*.5,ay-u*(1.8-i*.4));c.stroke()}}
    else if(ac==='fan'){c.fillStyle=gem;c.beginPath();c.moveTo(ax,ay);c.arc(ax,ay,u*2,Math.PI*1.2,Math.PI*1.8);c.closePath();c.fill();c.stroke();c.strokeStyle=sp89Mix(gem,-.35);c.lineWidth=Math.max(1,u*.08);for(let i=1;i<6;i++){const a=Math.PI*(1.2+i*.1);c.beginPath();c.moveTo(ax,ay);c.lineTo(ax+Math.cos(a)*u*2,ay+Math.sin(a)*u*2);c.stroke()}}
    else if(ac==='coins'){for(let i=0;i<4;i++){c.beginPath();c.ellipse(ax+(i%2)*u*.6-u*.3,ay-u*.6-i*u*.55,u*.5,u*.5,0,0,Math.PI*2);c.fillStyle='#e6b93a';c.fill();c.strokeStyle=SP89_INK;c.lineWidth=lw;c.stroke()}}
    c.beginPath();c.ellipse(ax,ay+u*.15,u*.62,u*.55,0,0,Math.PI*2);c.fillStyle=skin;c.fill();c.strokeStyle=SP89_INK;c.lineWidth=lw;c.stroke();
    c.strokeStyle=skDD;c.lineWidth=Math.max(1,u*.07);for(const k of [-.15,.1]){c.beginPath();c.moveTo(ax-u*.5,ay+u*k);c.lineTo(ax+u*.2,ay+u*k);c.stroke()}
    c.restore()}
}

/* flavFace: Flavius = his painting in the box; sponsors = the detailed drawn portrait. */
{const base=flavFace;flavFace=function(c2d,cx,cy,w,h,mood,label=true,sp=null){
  sp=sp||(typeof curSponsor==='function'?curSponsor():null)||{};
  const isF=flavIsFlavius(sp);const im=isF?flavM89Ready(mood):null;
  if(isF&&!im)return base.call(this,c2d,cx,cy,w,h,mood,label,sp);
  c2d.save();
  c2d.fillStyle='#1c1410';c2d.strokeStyle='#c9a458';c2d.lineWidth=2;
  c2d.beginPath();c2d.rect(cx-w/2,cy-h/2,w,h);c2d.fill();c2d.stroke();
  c2d.strokeStyle='rgba(201,164,88,.4)';c2d.lineWidth=1;c2d.strokeRect(cx-w/2+3,cy-h/2+3,w-6,h-6);
  const x0=cx-w/2+4,y0=cy-h/2+4,iw=w-8,ih=h-8;
  if(isF){c2d.fillStyle='#0a0706';c2d.fillRect(x0,y0,iw,ih);
    const s=Math.max(iw/im.naturalWidth,ih/im.naturalHeight),dw=im.naturalWidth*s,dh=im.naturalHeight*s;
    c2d.save();c2d.beginPath();c2d.rect(x0,y0,iw,ih);c2d.clip();c2d.imageSmoothingEnabled=true;try{c2d.imageSmoothingQuality='high'}catch(e){}
    c2d.drawImage(im,cx-dw/2,y0+(ih-dh)/2,dw,dh);c2d.restore()}
  else{const grd=c2d.createLinearGradient(cx,y0,cx,y0+ih);grd.addColorStop(0,sp.bg||'#4a2a52');grd.addColorStop(1,sp.bg2||'#2a1830');c2d.fillStyle=grd;c2d.fillRect(x0,y0,iw,ih);
    const vg=c2d.createRadialGradient(cx,cy-h*.1,Math.min(iw,ih)*.2,cx,cy,Math.max(iw,ih)*.7);vg.addColorStop(0,'rgba(255,240,210,.10)');vg.addColorStop(1,'rgba(0,0,0,.35)');c2d.fillStyle=vg;c2d.fillRect(x0,y0,iw,ih);
    c2d.save();c2d.beginPath();c2d.rect(x0,y0,iw,ih);c2d.clip();
    try{sponFace89(c2d,cx,cy,w,h,mood,sp)}catch(e){console.error(e)}
    c2d.restore()}
  c2d.fillStyle='rgba(245,232,204,.75)';c2d.font=`600 ${Math.max(8,Math.round(TW*0.17))}px IBM Plex Mono, monospace`;c2d.textAlign='center';c2d.textBaseline='middle';
  if(label)c2d.fillText(String(sp.short||sp.name||'FLAVIUS').toUpperCase().slice(0,14),cx,cy+h/2+TW*0.16);
  c2d.restore()}}

/* flavFaceURL: Flavius's painted portrait (cached once the image is in; a tainted file:// canvas hands out the painting itself). */
{const base=flavFaceURL;flavFaceURL=function(mood,sp){
  const s2=sp||(typeof SPONSOR_FLAVIUS!=='undefined'?SPONSOR_FLAVIUS:{});
  if(flavIsFlavius(s2)&&flavM89Ready(mood)){const key='flavius:'+mood+':p89';if(FLAV_IMG[key])return FLAV_IMG[key];
    try{const cv2=document.createElement('canvas');cv2.width=156;cv2.height=124;const c=cv2.getContext('2d');flavFace(c,78,62,152,120,mood,false,s2);return (FLAV_IMG[key]=cv2.toDataURL())}
    catch(e){return (FLAV_IMG[key]=FLAVM89.url[mood]||FLAVM89.url.calm)}}
  return base.apply(this,arguments)}}

/* the sponsor designer's preview: every mood, 'really' included. */
sponPrevHTML=function(draft){draft.v=(draft.v||0)+1;return `<div class="sponmoods">${['calm','pleased','smug','cheer','laugh','shock','angry','bored','weep','facepalm','really'].map(m=>`<div><img src="${flavFaceURL(m,{...draft,id:draft.id+'p'})}" alt="${m}"><span class="rc-sub">${m}</span></div>`).join('')}</div><div class="rc-sub" style="text-align:center;margin-top:4px">${esc(draft.name||_T('Unnamed sponsor'))}</div>`};
{const st=document.createElement('style');st.textContent='.sponmoods{grid-template-columns:repeat(4,1fr)}';document.head.appendChild(st)}
