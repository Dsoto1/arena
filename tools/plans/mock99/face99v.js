/* PROTOTYPE ONLY (v0.99 proposal, not game code) — FACE VARIETY parts for the ONE-FACE spec (FACE1), drawn by the STRONG PAINTERLY
   painter (face99b.js). Loaded into the running game page by variety.js after face99b.js.
   New FACE1 parts (each a short key + a small value list; '' = today's shape, so a face without them is drawn byte-identically):
     fs face shape  '' oval · sq square · rd round · lg long · ht heart · dm diamond
     jw jaw         '' · nar narrow · wid wide · str strong (square angle + chin cleft)
     ck cheekbones  '' · hi high · flat
     br brows       '' · thk thick · thn thin · arc arched · str straight · scr scar-split · uni unibrow
     ey eyes        '' · alm almond · rnd round · hod hooded · nar narrow · dep deep-set
     es eye set     '' · wide · close
     ns nose        '' · rom roman · brd broad · btn button · lng long · brk broken
     lp lips        '' · thn thin · ful full · wid wide · sml small · dwn downturned · smk smirk   (beside smile)
     ea ears        '' · sml small · lrg large · pro protruding · caul cauliflower
     nk neck        '' · sht short-thick · lng long-slim · bul bull
     ag age         '' · yng young · wth weathered · old (old also greys hair, brows and beard)
     ln lines       '' · f forehead · c cheek · fc both
   Stored PACKED as one key  fx: one base-36 char per part in the order above ('0' = default), trailing zeros dropped
   (e.g. {fs:'sq',ns:'brk',ag:'wth'} → fx:"100000050020" → "10000005002"). ≤12 chars, one key → fits cleanPatron's 16-key limit.
   faceV(spec, opt) = face99b with the parts: the bust is reshaped BEFORE the paint pass (opt.pre), and the paint pass gets shape-aware
   hooks (opt.geo: face planes, eyes, ears, neck, brow light) so the modelled planes follow the new shape. */
(function(){
const PARTS=[
 ['fs','Face shape',['','sq','rd','lg','ht','dm'],['Oval (today)','Square','Round','Long','Heart','Diamond']],
 ['jw','Jaw',['','nar','wid','str'],['Today','Narrow','Wide','Strong']],
 ['ck','Cheekbones',['','hi','flat'],['Today','High','Flat']],
 ['br','Brows',['','thk','thn','arc','str','scr','uni'],['Today','Thick','Thin','Arched','Straight','Scar-split','Unibrow']],
 ['ey','Eyes',['','alm','rnd','hod','nar','dep'],['Today','Almond','Round','Hooded','Narrow','Deep-set']],
 ['es','Eye set',['','wide','close'],['Today','Wide-set','Close-set']],
 ['ns','Nose',['','rom','brd','btn','lng','brk'],['Today','Roman','Broad','Button','Long straight','Broken']],
 ['lp','Lips',['','thn','ful','wid','sml','dwn','smk'],['Today','Thin','Full','Wide','Small','Downturned','Smirk']],
 ['ea','Ears',['','sml','lrg','pro','caul'],['Today','Small','Large','Protruding','Cauliflower']],
 ['nk','Neck',['','sht','lng','bul'],['Today','Short-thick','Long-slim','Bull']],
 ['ag','Age',['','yng','wth','old'],['Today','Young','Weathered','Old']],
 ['ln','Lines',['','f','c','fc'],['None','Forehead','Cheeks','Both']]];
window.PARTS99V=PARTS;
const f2=v=>Math.round(v*100)/100;
/* ---------- packing ---------- */
window.vPack=function(o){let s='';for(const [k,,vals] of PARTS){const i=Math.max(0,vals.indexOf(o[k]||''));s+=i.toString(36)}return s.replace(/0+$/,'')};
window.vUnpack=function(s){const o={};s=String(s||'');PARTS.forEach(([k,,vals],i)=>{const n=parseInt(s[i]||'0',36);o[k]=vals[n]||''});return o};
const partsOf=spec=>{const o=spec&&spec.fx?vUnpack(spec.fx):{};for(const [k] of PARTS)if(spec&&spec[k])o[k]=spec[k];return o};
const anyPart=o=>PARTS.some(([k])=>o[k]);
/* ---------- colour helpers ---------- */
function rgb(c){c=String(c||'');if(c[0]!=='#')return [128,128,128];let h=c.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return [n>>16,n>>8&255,n&255]}
const hex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,t)=>{const A=rgb(a),B=rgb(b);return hex(A.map((v,i)=>v+(B[i]-v)*t))};
/* ---------- face profiles (male units; right half: offsets from x=50) ---------- */
const OVAL={top:31,tw:19.3,cw:21.9,jw:16.4,jy:76,chw:7.2,chy:83.5,bot:85};
const SHAPES={'':OVAL,sq:{top:31,tw:20.2,cw:21.6,jw:20.6,jy:77.5,chw:11.6,chy:84.4,bot:85.6},rd:{top:31.5,tw:20.6,cw:23.4,jw:18.8,jy:74,chw:9.6,chy:81.6,bot:83.4},
  lg:{top:30,tw:18.4,cw:19.8,jw:15.4,jy:79,chw:6.8,chy:87,bot:88.6},ht:{top:31,tw:21.4,cw:21.2,jw:13.6,jy:76.5,chw:4.4,chy:83.9,bot:85.8},
  dm:{top:31.4,tw:16.6,cw:23.2,jw:14.8,jy:76,chw:5,chy:84.2,bot:86}};
function profile(P){const S={...(SHAPES[P.fs]||OVAL)};
  if(P.jw==='nar'){S.jw-=2.6;S.chw=Math.max(3.6,S.chw-1.8)}if(P.jw==='wid'){S.jw+=2.6;S.chw+=1.6}if(P.jw==='str'){S.jw+=1.8;S.chw+=3;S.bot+=.6;S.chy+=.4}
  if(P.ck==='hi'){S.cw+=1.1}if(P.ck==='flat'){S.cw-=.7}
  return S}
const hwAt=(S,y)=>{const pts=[[S.top,0],[S.top+4.5,S.tw*.62],[45,S.tw],[60,S.cw],[S.jy,S.jw],[S.chy,S.chw],[S.bot,0]];
  if(y<=pts[0][0])return 0;for(let i=1;i<pts.length;i++)if(y<=pts[i][0]){const [y0,x0]=pts[i-1],[y1,x1]=pts[i];return x0+(x1-x0)*(y-y0)/(y1-y0)}return 0};
/* closed Catmull-Rom through the profile, mirrored; fem = narrowed like today's 20×26.5 ellipse */
function faceD(S,fem,dx,dy){dx=dx||0;dy=dy||0;const R=[[0,S.top],[S.tw*.62,S.top+4.5],[S.tw,45],[S.cw,60],[S.jw,S.jy],[S.chw,S.chy],[0,S.bot]];
  const loop=[...R.map(([x,y])=>[50+x,y]),...R.slice(1,-1).reverse().map(([x,y])=>[50-x,y])];
  const P=loop.map(([x,y])=>fem?[50+(x-50)*.909+dx,58+(y-58)*.981+dy]:[x+dx,y+dy]);const n=P.length;let d=`M${f2(P[0][0])} ${f2(P[0][1])}`;
  for(let i=0;i<n;i++){const p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];
    d+=`C${f2(p1[0]+(p2[0]-p0[0])/6)} ${f2(p1[1]+(p2[1]-p0[1])/6)} ${f2(p2[0]-(p3[0]-p1[0])/6)} ${f2(p2[1]-(p3[1]-p1[1])/6)} ${f2(p2[0])} ${f2(p2[1])}`}
  return d+'Z'}
/* ---------- an affine path rewriter (x' = ax·x + bx, y' = ay·y + by), abs + rel commands ---------- */
function xformD(d,ax,bx,ay,by){const t=String(d).match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+)(?:e-?\d+)?/g)||[];let i=0,out='',cmd='';
  const N={M:2,L:2,T:2,H:1,V:1,C:6,S:4,Q:4,A:7,Z:0};
  while(i<t.length){if(/[a-zA-Z]/.test(t[i])){cmd=t[i++];out+=cmd;if(cmd.toUpperCase()==='Z')continue}
    const C=cmd.toUpperCase(),rel=cmd!==C,n=N[C];if(!n){i++;continue}const a=[];for(let k=0;k<n;k++)a.push(parseFloat(t[i++]));
    let b;if(C==='H')b=[rel?a[0]*ax:a[0]*ax+bx];else if(C==='V')b=[rel?a[0]*ay:a[0]*ay+by];
    else if(C==='A')b=[a[0]*ax,a[1]*ay,a[2],a[3],a[4],rel?a[5]*ax:a[5]*ax+bx,rel?a[6]*ay:a[6]*ay+by];
    else b=a.map((v,k)=>k%2===0?(rel?v*ax:v*ax+bx):(rel?v*ay:v*ay+by));
    out+=b.map(f2).join(' ')+' ';if(C==='M')cmd=rel?'l':'L'}
  return out.trim()}
function xformEl(e,ax,bx,ay,by){const g=k=>parseFloat(e.getAttribute(k)||0),s=(k,v)=>e.setAttribute(k,f2(v));const t=e.tagName;
  if(t==='path')e.setAttribute('d',xformD(e.getAttribute('d'),ax,bx,ay,by));
  else if(t==='ellipse'){s('cx',g('cx')*ax+bx);s('cy',g('cy')*ay+by);s('rx',g('rx')*ax);s('ry',g('ry')*ay)}
  else if(t==='circle'){s('cx',g('cx')*ax+bx);s('cy',g('cy')*ay+by)}
  else if(t==='rect'){s('x',g('x')*ax+bx);s('y',g('y')*ay+by);s('width',g('width')*ax);s('height',g('height')*ay)}}
function bbox(e){const g=k=>parseFloat(e.getAttribute(k)||0);const t=e.tagName;
  if(t==='ellipse')return {x0:g('cx')-g('rx'),y0:g('cy')-g('ry'),x1:g('cx')+g('rx'),y1:g('cy')+g('ry')};
  if(t==='circle')return {x0:g('cx')-g('r'),y0:g('cy')-g('r'),x1:g('cx')+g('r'),y1:g('cy')+g('r')};
  if(t==='rect')return {x0:g('x'),y0:g('y'),x1:g('x')+g('width'),y1:g('y')+g('height')};
  if(t==='path'){const n=(e.getAttribute('d').match(/-?(?:\d*\.\d+|\d+)/g)||[]).map(Number);const X=[],Y=[];
    /* rough: absolute pairs only (enough to class shapes) */
    const toks=e.getAttribute('d').match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+)/g)||[];let cmd='',k=0,cx=0,cy=0;
    for(let i=0;i<toks.length;i++){const v=toks[i];if(/[a-zA-Z]/.test(v)){cmd=v;k=0;continue}const num=+v;const C=cmd.toUpperCase();const rel=cmd!==C;
      if(C==='H'){cx=rel?cx+num:num;X.push(cx);Y.push(cy);continue}if(C==='V'){cy=rel?cy+num:num;X.push(cx);Y.push(cy);continue}
      if(k%2===0){X.push(rel?cx+num:num)}else{Y.push(rel?cy+num:num)}k++;
      const per={M:2,L:2,T:2,C:6,S:4,Q:4,A:7}[C]||2;if(k%per===0&&X.length&&Y.length){cx=X[X.length-1];cy=Y[Y.length-1]}}
    if(!X.length)return null;return {x0:Math.min(...X),y0:Math.min(...Y),x1:Math.max(...X),y1:Math.max(...Y)}}
  return null}
/* ---------- part geometry (male units) ---------- */
const EYE={'':{rx:3,ry:2.2,rot:0},alm:{rx:3.5,ry:1.7,rot:7},rnd:{rx:2.9,ry:2.75,rot:0},hod:{rx:3.1,ry:2.05,rot:0,hood:1},nar:{rx:3.35,ry:1.3,rot:2},dep:{rx:2.8,ry:2,rot:0,deep:1}};
const LIP={'':{W:5.4,u:1,l:1,cl:0,cr:0},thn:{W:5.1,u:.45,l:.5,cl:0,cr:0},ful:{W:5.9,u:1.45,l:1.45,cl:0,cr:0},wid:{W:7.2,u:.95,l:1,cl:0,cr:0},
  sml:{W:4,u:1.05,l:.95,cl:0,cr:0},dwn:{W:5.4,u:.95,l:1,cl:1.3,cr:1.3},smk:{W:5.5,u:.9,l:.95,cl:.25,cr:-1.6}};
/* nose: base line + its plane parameters (default = today's numbers) */
const NOSE={'':{line:'M50 60L47 70L52 70',side:'M50.7 61Q52 65 52.9 69.3L50.9 69.8Q50.2 65 50.7 61Z',wing:'M52.4 67.1Q54.1 68.6 52.9 70.4',bridge:'M49.4 57.8Q48.7 62.6 48.4 66.4',tip:[49.5,68.3,1.25],nos:[48.3,51.8,70.6,.95],under:[50.4,71.7,3.7]},
  rom:{line:'M50 59.2Q52.4 62.2 50.8 65L47.2 70.3L52.3 70.2',side:'M51.3 60.6Q53.6 63.4 52.4 66L53.2 69.6L51 70Q50.6 66.4 51.3 60.6Z',wing:'M52.6 67.3Q54.4 68.8 53.1 70.5',
    bridge:'M49.6 57.6Q51.6 61.2 50.4 63.4M49.8 64.4L48.3 67',tip:[49.2,68.6,1.2],nos:[48.2,51.8,70.8,.95],under:[50.3,71.9,3.8],bump:[51.4,62.2]},
  brd:{line:'M50 60L48.2 68.6M45.4 70.3Q46.6 69.2 48.4 70.2Q50 71 51.6 70.2Q53.4 69.2 54.6 70.3',side:'M50.8 61Q52.6 65 54 69L51.2 70Q50.3 65 50.8 61Z',wing:'M53.2 66.6Q56.2 68.4 54.6 71',
    bridge:'M49.4 57.8Q48.9 62.6 48.6 66',tip:[49.7,68.2,1.75],nos:[47.4,52.6,70.7,1.25],under:[50.2,72,5],wingL:'M47 66.8Q44.2 68.5 45.6 71'},
  btn:{line:'M50 62.6L48.6 67.6Q50 69.2 51.6 67.8',side:'M50.6 63Q51.8 65.4 52.3 67.4L50.8 68.2Q50.2 65.6 50.6 63Z',wing:'M52 66.2Q53.6 67.4 52.4 69',bridge:'M49.5 58.4Q49.1 62 48.9 64.6',
    tip:[49.8,67.2,1.5],nos:[48.6,51.5,68.9,.8],under:[50.3,70,3.2]},
  lng:{line:'M50 59L47.4 72.2L52.4 72.2',side:'M50.7 61Q52.2 66 53.3 71.4L51.1 71.9Q50.2 66 50.7 61Z',wing:'M52.6 69.2Q54.3 70.7 53.1 72.5',bridge:'M49.4 57.6Q48.5 63.4 48.1 68.2',
    tip:[49.4,70.3,1.3],nos:[48.2,51.9,72.7,.95],under:[50.3,73.8,3.6]},
  brk:{line:'M50 60L51.1 63.4Q49.9 65.8 48.3 67.9L47.5 70.3L52.3 70.1',side:'M52 63.6Q53.6 66.4 53.2 69.4L51.2 70Q50.6 66.6 52 63.6Z',wing:'M52.6 67.2Q54.3 68.7 53.1 70.5',bridge:'M49.6 58Q50.6 60.6 51.2 62.8M50.4 64.4L48.6 67',
    tip:[49.1,68.4,1.2],nos:[48.2,51.9,70.7,.95],under:[50.3,71.8,3.7],bump:[51.6,63.2],scar:1}};
/* ---------- the reshaping pre-pass (on the bust SVG, before the paint pass) ---------- */
function prePass(svg,G){const NS='http://www.w3.org/2000/svg';const fixed=svg.includes('xmlns=')?svg:svg.replace('<svg ',`<svg xmlns="${NS}" `);
  const doc=new DOMParser().parseFromString(fixed,'image/svg+xml');const root=doc.documentElement;
  const all=[...root.querySelectorAll('path,ellipse,circle,rect')];const A=(e,k)=>e.getAttribute(k);const ds=(e,pre)=>e.tagName==='path'&&(A(e,'d')||'').startsWith(pre);
  const fem=G.fem;const E=(tag,a)=>{const e=doc.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);return e};
  const face=all.find(e=>e.tagName==='ellipse'&&A(e,'cx')==='50'&&A(e,'cy')==='58');
  const ears=all.filter(e=>e.tagName==='ellipse'&&A(e,'cy')==='62'&&['28','72','30','70'].includes(A(e,'cx')));
  const eyes=all.filter(e=>e.tagName==='ellipse'&&A(e,'cy')==='58'&&A(e,'rx')==='3'&&['41','59'].includes(A(e,'cx'))&&e.parentNode===root);
  const brows=all.find(e=>ds(e,'M35 52L46 53'));const nose=all.find(e=>ds(e,'M50 60L47 70'));const mouth=all.find(e=>ds(e,'M44 77Q50'));
  const neck=all.find(e=>e.tagName==='rect'&&A(e,'y')==='78');
  const bodyO=all.find(e=>ds(e,'M6 140C8 110')||ds(e,'M12 140C14 112'));const bodyI=all.find(e=>ds(e,'M20 140C22 117 34 107 50 107S')||ds(e,'M24 140C26 118'));
  const hair=G.hair;const skin=G.skin;
  const tag=(e,k)=>e&&e.setAttribute('data-v',k);
  /* torso (shoulders up/down for the neck), scaled about the frame's bottom edge so the frame stays filled */
  if(G.tk!==1){const k=G.tk,by=140*(1-k);
    for(const e of all){if(e===face||ears.includes(e)||e===neck)continue;const b=bbox(e);if(!b)continue;
      if(e===bodyO||e===bodyI||(b.y0>=95.5&&b.y1>100&&e.parentNode===root))xformEl(e,1,0,k,by)}}
  /* beard follows the jaw */
  if(G.bk){const [kx,ky]=G.bk;for(const e of all){if(e===brows)continue;const f=A(e,'fill'),s=A(e,'stroke');const hc=(f&&f.toLowerCase()===hair.toLowerCase())||(s&&s.toLowerCase()===hair.toLowerCase())||(e.parentNode!==root&&(A(e.parentNode,'fill')||'').toLowerCase()===hair.toLowerCase());
    if(!hc)continue;const b=bbox(e);if(!b)continue;const cx=(b.x0+b.x1)/2;if(b.y0>=56&&cx>34&&cx<66&&b.x1-b.x0>5)xformEl(e,kx,50*(1-kx),ky,62*(1-ky))}}
  /* face */
  if(face){tag(face,'face');if(G.faceD){const p=E('path',{d:G.faceD,fill:A(face,'fill'),'data-v':'face'});face.parentNode.replaceChild(p,face)}}
  /* ears */
  const ec=G.earX,eS=G.earS;
  ears.forEach((e,i)=>{const left=+A(e,'cx')<50;const cx=left?ec:100-ec;const rx=+A(e,'rx')*eS[0],ry=+A(e,'ry')*eS[1];
    let n;if(G.caul){const k=left?-1:1;const pts=[[0,-ry],[k*rx*.85,-ry*.62],[k*rx*1.12,-ry*.08],[k*rx*.92,ry*.34],[k*rx*1.06,ry*.62],[k*rx*.5,ry*.98],[-k*rx*.5,ry*.82],[-k*rx*.9,0],[-k*rx*.6,-ry*.8]];
      const P=pts.map(([x,y])=>[cx+x,62+y]);const m=P.length;let d=`M${f2(P[0][0])} ${f2(P[0][1])}`;for(let j=0;j<m;j++){const p0=P[(j-1+m)%m],p1=P[j],p2=P[(j+1)%m],p3=P[(j+2)%m];d+=`C${f2(p1[0]+(p2[0]-p0[0])/6)} ${f2(p1[1]+(p2[1]-p0[1])/6)} ${f2(p2[0]-(p3[0]-p1[0])/6)} ${f2(p2[1]-(p3[1]-p1[1])/6)} ${f2(p2[0])} ${f2(p2[1])}`}
      n=E('path',{d:d+'Z',fill:A(e,'fill'),'data-v':'ear'})}
    else n=E('ellipse',{cx:f2(cx),cy:62,rx:f2(rx),ry:f2(ry),fill:A(e,'fill'),'data-v':'ear',...(G.earRot?{transform:`rotate(${left?-G.earRot:G.earRot} ${f2(cx)} 62)`}:{})});
    e.parentNode.replaceChild(n,e)});
  /* earrings ride with the ear lobe */
  const ex0=fem?30:28;const dEx=ec-ex0,dEy=8*(eS[1]-1)*(fem?7/8:1);
  if(dEx||dEy)for(const e of all){if(!e.parentNode)continue;const f=(A(e,'fill')||'').toLowerCase(),s=(A(e,'stroke')||'').toLowerCase();if(!['#e8c86a','#f2efe6','#b8b0a0'].some(c=>c===f||c===s))continue;
    const b=bbox(e);if(!b||b.x1-b.x0>10)continue;const cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;if(cy<64||cy>82)continue;
    if(Math.abs(cx-ex0)<5)xformEl(e,1,dEx,1,dEy);else if(Math.abs(cx-(100-ex0))<5)xformEl(e,1,-dEx,1,dEy)}
  /* eyes */
  const eS2=EYE[G.ey]||EYE[''];
  eyes.forEach((e,i)=>{const cx=i===0?G.eL:G.eR;e.setAttribute('cx',f2(cx));e.setAttribute('cy',f2(G.eyY));e.setAttribute('rx',eS2.rx);e.setAttribute('ry',eS2.ry);
    if(eS2.rot)e.setAttribute('transform',`rotate(${i===0?eS2.rot:-eS2.rot} ${f2(cx)} ${f2(G.eyY)})`);tag(e,'eye')});
  /* marks + lashes that sit by the eyes */
  const dl=G.eL-41,dr=G.eR-59;
  for(const e of all){if(!e.parentNode)continue;const d=A(e,'d')||'';
    if(d==='M37 55l-3 -2M45 55l3 -2M55 55l-3 -2M63 55l3 -2'){const y=f2(G.eyY-eS2.ry-.6);e.setAttribute('d',`M${f2(G.eL-4)} ${y}l-3 -2M${f2(G.eL+4)} ${y}l3 -2M${f2(G.eR-4)} ${y}l-3 -2M${f2(G.eR+4)} ${y}l3 -2`)}
    else if(d.startsWith('M37 56.5Q41 54'))e.setAttribute('d',`M${f2(G.eL-4)} 56.5Q${f2(G.eL)} ${f2(57.5-eS2.ry*1.6)} ${f2(G.eL+4)} 56.5L${f2(G.eL+7)} 55M${f2(G.eR-4)} 56.5Q${f2(G.eR)} ${f2(57.5-eS2.ry*1.6)} ${f2(G.eR+4)} 56.5L${f2(G.eR+7)} 55`);
    else if(d==='M40 61v8M60 61v8')e.setAttribute('d',`M${f2(40+dl)} 61v8M${f2(60+dr)} 61v8`);
    else if(e.tagName==='circle'&&A(e,'cy')==='70'&&A(e,'fill')==='#2f4f8a')xformEl(e,1,+A(e,'cx')<50?dl:dr,1,0);
    else if(e.tagName==='ellipse'&&A(e,'cx')==='41'&&A(e,'cy')==='60')xformEl(e,1,dl,1,0);
    else if(e.tagName==='ellipse'&&A(e,'cx')==='59'&&A(e,'cy')==='58'&&A(e,'rx')==='5')xformEl(e,1,dr,1,0);
    else if(e.tagName==='circle'&&A(e,'cx')==='64'&&A(e,'cy')==='52')xformEl(e,1,dr,1,G.bdy)}
  /* brows */
  if(brows){const col=A(brows,'stroke');const g=E('g',{'data-v':'brows'});
    const frag=new DOMParser().parseFromString(`<svg xmlns="${NS}">${G.browSVG(col)}</svg>`,'image/svg+xml');
    [...frag.documentElement.childNodes].forEach(c=>{const n=doc.importNode(c,true);if(n.setAttribute)n.setAttribute('data-v','brows');g.appendChild(n)});
    brows.parentNode.replaceChild(g,brows)}
  /* nose + mouth */
  if(nose){nose.setAttribute('d',G.nose.line);tag(nose,'nose')}
  if(mouth){mouth.setAttribute('d',G.mouthD);tag(mouth,'mouth')}
  /* neck */
  if(neck){if(G.neckD){const p=E('path',{d:G.neckD,fill:A(neck,'fill'),'data-v':'neck'});neck.parentNode.replaceChild(p,neck)}
    else{neck.setAttribute('x',f2(50-G.nw));neck.setAttribute('width',f2(G.nw*2));neck.setAttribute('height',f2(G.nh));tag(neck,'neck')}}
  tag(bodyO,'bodyO');tag(bodyI,'bodyI');
  return new XMLSerializer().serializeToString(root)}
/* ---------- the geometry + paint hooks ---------- */
function geo(P,spec){const fem=!!spec.fem;const S=profile(P);const shaped=!!(P.fs||P.jw||P.ck);
  const es=P.es==='wide'?1.8:P.es==='close'?-1.6:0;const eS=EYE[P.ey]||EYE[''];
  const G={fem,skin:spec.skin,hair:spec.hair,S,P};
  G.faceD=shaped?faceD(S,fem):null;
  G.crescent=shaped?faceD(S,false)+faceD(S,false,-3.4,-2.8):null;
  /* ears */
  const baseOff=fem?20:22;const off=(hwAt(S,62)-hwAt(OVAL,62))*(fem?.909:1)+baseOff;
  const eSz=P.ea==='sml'?[.8,.8]:P.ea==='lrg'?[1.2,1.22]:P.ea==='pro'?[1.18,1.08]:P.ea==='caul'?[1.12,1.02]:[1,1];
  G.earS=eSz;G.earX=50-off-(P.ea==='pro'?2.4:0);G.earRot=P.ea==='pro'?10:0;G.caul=P.ea==='caul';
  /* eyes */
  G.eL=41-es;G.eR=59+es;G.eyY=58+(eS.deep?.4:0);G.bdy=(eS.deep?1.2:0)+(P.br==='str'?.5:0);
  /* beard: follow jaw width + chin depth */
  const kx=Math.max(.8,Math.min(1.2,(S.jw+S.chw)/(OVAL.jw+OVAL.chw))),ky=(S.bot-62)/(OVAL.bot-62);G.bk=shaped&&(Math.abs(kx-1)>.01||Math.abs(ky-1)>.01)?[kx,ky]:null;
  /* neck: width, length (the shoulders move), bull flare */
  const nw0=fem?8:9;const nk=P.nk;const dyS=nk==='sht'?-3:nk==='lng'?4:nk==='bul'?-2:0;const top=fem?101:99;G.tk=(140-(top+dyS))/(140-top);G.shY=top+dyS;
  G.nw=nk==='sht'?nw0+2.4:nk==='lng'?nw0-1.8:nw0;G.nh=Math.max(26,G.shY-78+6);
  G.neckD=nk==='bul'?`M${50-nw0-2} 79Q${50-nw0-2.4} 90 ${50-nw0-5.5} ${G.shY+2}Q50 ${G.shY+8} ${50+nw0+5.5} ${G.shY+2}Q${50+nw0+2.4} 90 ${50+nw0+2} 79Z`:null;
  /* nose, lips */
  G.nose=NOSE[P.ns]||NOSE[''];const L={...(LIP[P.lp]||LIP[''])};G.lip=L;
  const sm=spec.smile?4:0;G.mouthD=`M${f2(50-L.W-.6)} ${f2(77+L.cl)}Q50 ${f2(78+sm+(L.cl+L.cr)/2)} ${f2(50+L.W+.6)} ${f2(77+L.cr)}`;
  /* brows: left = outer→inner; right mirrored around the eyes */
  G.browSVG=col=>{const sides=[[G.eL,-1],[G.eR,1]];const by=G.bdy+(P.ag==='old'?.4:0);let s='';
    const pts=(cx,sg)=>{const xo=cx+sg*6,xi=cx-sg*5;return {xo,xi,yo:52+by+(P.ag==='old'?.5:0),yi:53+by}};
    const t=P.br||'';
    if(t==='uni'){const a=pts(G.eL,-1),b=pts(G.eR,1);return `<path d="M${f2(a.xo)} ${a.yo}L${f2(a.xi)} ${a.yi}M${f2(b.xi)} ${b.yi}L${f2(b.xo)} ${b.yo}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/><path d="M${f2(a.xi)} ${a.yi}Q50 ${f2(a.yi+.9)} ${f2(b.xi)} ${b.yi}" fill="none" stroke="${col}" stroke-width="1.7" stroke-linecap="round" opacity=".9"/>`}
    for(const [cx,sg] of sides){const {xo,xi,yo,yi}=pts(cx,sg);const xm=(xo+xi)/2;
      if(t==='thk')s+=`<path d="M${f2(xo)} ${f2(yo+.7)}Q${f2(xm)} ${f2(yo-2.3)} ${f2(xi)} ${f2(yi-1.7)}L${f2(xi+sg*.3)} ${f2(yi+1.5)}Q${f2(xm)} ${f2(yo+.6)} ${f2(xo)} ${f2(yo+.7)}Z" fill="${col}"/>`;
      else if(t==='thn')s+=`<path d="M${f2(xo)} ${f2(yo+.3)}Q${f2(xm)} ${f2(yo-1.4)} ${f2(xi)} ${f2(yi-.2)}" fill="none" stroke="${col}" stroke-width="1.15" stroke-linecap="round"/>`;
      else if(t==='arc')s+=`<path d="M${f2(xo)} ${f2(yo+1)}Q${f2(xm+sg*1.2)} ${f2(yo-4)} ${f2(xi)} ${f2(yi-.4)}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`;
      else if(t==='str')s+=`<path d="M${f2(xo)} ${f2(yi-1.3)}L${f2(xi)} ${f2(yi-1.3)}L${f2(xi)} ${f2(yi+1.1)}L${f2(xo)} ${f2(yi+.5)}Z" fill="${col}"/>`;
      else if(t==='scr'&&sg===1){const gx=xm+.6;s+=`<path d="M${f2(xi)} ${yi}L${f2(gx-1.4)} ${f2(yi-(yi-yo)*.45)}M${f2(gx+1.4)} ${f2(yi-(yi-yo)*.6)}L${f2(xo)} ${yo}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/><path d="M${f2(gx-.9)} ${f2(yo-3.2)}L${f2(gx+.7)} ${f2(yo+3.4)}" stroke="#c98478" stroke-width=".9" stroke-linecap="round" opacity=".9"/>`}
      else s+=`<path d="M${f2(xo)} ${yo}L${f2(xi)} ${yi}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`}
    return s};
  G.browHL=(()=>{const by=G.bdy;const t=P.br||'';if(t==='thn')return '';const lift=t==='arc'?1.6:t==='thk'?.9:0;
    return `<path d="M${f2(G.eL-5.4)} ${f2(51.3+by-lift)}L${f2(G.eL+4.6)} ${f2(52.3+by-lift*.4)}M${f2(G.eR-4.6)} ${f2(52.3+by-lift*.4)}L${f2(G.eR+5.4)} ${f2(51.3+by-lift)}" stroke="#fff4e0" stroke-opacity=".28" stroke-width=".7" stroke-linecap="round"/>`})();
  /* ear detail: today's helix/concha drawing, scaled; cauliflower lumps */
  G.ear=(cx,mir,lit,o)=>{const {ltSkin,shSkin}=o;const s=`scale(${f2((fem?.88:1)*eSz[0])} ${f2((fem?.86:1)*eSz[1])})`;const rot=G.earRot?`rotate(${mir?G.earRot:-G.earRot})`:'';const t=`translate(${f2(cx)} 62) ${mir?'scale(-1 1)':''} ${rot} ${s} translate(-28 -62)`;
    let m=`<g transform="${t}" fill="none" stroke-linecap="round"><path d="M27.6 55.4Q23.3 56.6 23.6 62Q24 67.4 27.6 69.3" stroke="${lit?ltSkin:shSkin}" stroke-opacity="${lit?.55:.4}" stroke-width=".85"/><path d="M28.6 58Q25.9 59.2 26.1 62.4Q26.4 65.6 28.7 66.6" stroke="${shSkin}" stroke-opacity=".6" stroke-width=".8"/><ellipse cx="27.7" cy="62.6" rx="1.5" ry="2.7" fill="${o.mix(shSkin,'#000',.2)}" stroke="none" opacity="${lit?.38:.5}"/><circle cx="26.4" cy="68.1" r=".7" fill="${ltSkin}" stroke="none" opacity="${lit?.5:.2}"/>`;
    if(G.caul)m+=`<g stroke="none"><circle cx="24.6" cy="58.4" r="1.6" fill="${ltSkin}" opacity=".45"/><circle cx="25.4" cy="58.9" r="1.3" fill="${shSkin}" opacity=".35"/><circle cx="24.2" cy="64.2" r="1.8" fill="${ltSkin}" opacity=".4"/><circle cx="25" cy="64.9" r="1.4" fill="${shSkin}" opacity=".4"/><path d="M26.8 57.2Q25.3 60 26.9 61.6M26 63.4Q24.9 65.8 26.5 67.4" fill="none" stroke="${o.mix(shSkin,'#4a1830',.35)}" stroke-opacity=".6" stroke-width=".7"/><circle cx="27" cy="60.6" r="1" fill="#7a3a4a" opacity=".22"/></g>`;
    return m+'</g>'};
  /* neck muscles + collar AO + old-age lines */
  G.neckM=o=>{const {clip,shSkin,ltSkin,ink,T,mix}=o;const hw=nk==='bul'?nw0+1.5:G.nw;const yb=G.shY+4;
    let s=`<g clip-path="${clip}" fill="none" stroke-linecap="round"><path d="M${f2(50-hw+2.5)} 88Q${f2(50-hw+5)} ${f2(yb-8)} 48 ${f2(yb)}M${f2(50+hw-2.5)} 88Q${f2(50+hw-5)} ${f2(yb-8)} 52 ${f2(yb)}" stroke="${shSkin}" stroke-opacity="${nk==='bul'?.5:.38}" stroke-width="${nk==='bul'?1.1:.8}"/><path d="M${f2(50-hw+1.6)} 89Q${f2(50-hw+4)} ${f2(yb-8)} 47 ${f2(yb)}" stroke="${ltSkin}" stroke-opacity=".3" stroke-width=".7"/>`;
    if(nk==='bul')s+=`<path d="M${f2(50-hw-1)} ${f2(G.shY-4)}Q${f2(50-hw-4)} ${f2(G.shY-1)} ${f2(50-hw-7)} ${f2(G.shY+2)}M${f2(50+hw+1)} ${f2(G.shY-4)}Q${f2(50+hw+4)} ${f2(G.shY-1)} ${f2(50+hw+7)} ${f2(G.shY+2)}" stroke="${shSkin}" stroke-opacity=".45" stroke-width="1"/>`;
    if(nk==='lng')s+=`<ellipse cx="51" cy="${f2(G.shY-6)}" rx="1.5" ry="1" fill="${ltSkin}" stroke="none" opacity=".35"/>`;
    if(P.ag==='old')s+=`<path d="M${f2(50-hw+3)} 91Q50 92.4 ${f2(50+hw-3)} 91M${f2(50-hw+3.5)} 94.5Q50 95.6 ${f2(50+hw-3.5)} 94.5" stroke="${shSkin}" stroke-opacity=".4" stroke-width=".55"/>`;
    s+=`<ellipse cx="50" cy="${f2(yb+1)}" rx="${f2(hw*.78)}" ry="2.6" fill="${mix(shSkin,'#000',.3)}" stroke="none" opacity=".45"/>`;
    if(ink&&T>=2)s+=`<rect x="${f2(50+hw-4)}" y="78" width="6" height="${f2(G.nh)}" fill="${shSkin}" opacity=".35"/>`;
    return s+'</g>'};
  /* eyes: iris clipped to the eye, lids by eye type */
  G.eye=(e,i,o)=>{const {p,T,X,INK,shSkin,ltSkin,lum,mix,mul}=o;const cx=+e.getAttribute('cx'),cy=+e.getAttribute('cy');const t=EYE[P.ey]||EYE[''];const rx=t.rx,ry=t.ry;
    const blind=i===1&&p.mark==='blind',patch=i===1&&p.mark==='patch';if(patch)return '';const rot=t.rot?(i===0?t.rot:-t.rot):0;
    const ec=p.eyes||'#1a120c';const irisC=lum(ec)<.12?'#6a4428':mix(ec,'#fff',.12);let m='';
    if(T>=2&&!blind){const ig=X.grad('iris'+irisC,j=>{const g=X.E('radialGradient',{id:j,cx:'.5',cy:'.62',r:'.6'},X.defs);X.stops(g,[[0,mix(irisC,'#fff2c8',.35)],[.6,irisC],[1,mul(irisC,.45)]])});
      const ir=Math.min(1.85,ry*.95+.35);m+=`<g clip-path="${X.clip([e])}"><circle cx="${f2(cx+.2)}" cy="${f2(cy+.1+(t.hood?.3:0))}" r="${f2(ir)}" fill="${ig}"/><circle cx="${f2(cx+.2)}" cy="${f2(cy+.1+(t.hood?.3:0))}" r="${f2(ir*.46)}" fill="#0a0604"/>${ry<1.6?`<rect x="${cx-4}" y="${f2(cy-ry)}" width="8" height="${f2(ry*.7)}" fill="#000" opacity=".25"/>`:''}</g>`}
    if(blind)m+=`<ellipse cx="${cx}" cy="${cy}" rx="${f2(rx*.8)}" ry="${f2(ry*.77)}" fill="#eef0ee" opacity=".7"/>`;
    m+=`<circle cx="${f2(cx-.75)}" cy="${f2(cy-Math.min(.75,ry*.4))}" r="${T>=2?(ry<1.6?.45:.62):.75}" fill="#fff" opacity=".95"/>`;
    if(T>=2){const lw=rx+.4,lp=ry*1.41,cw=rx+.1;
      m+=`<circle cx="${f2(cx+.95)}" cy="${f2(cy+Math.min(.7,ry*.3))}" r=".3" fill="#fff" opacity=".55"/>`;
      let lid=`<path d="M${f2(cx-lw)} ${f2(cy-.1)}Q${f2(cx)} ${f2(cy-lp)} ${f2(cx+lw)} ${f2(cy-.1)}" fill="none" stroke="${INK}" stroke-opacity=".85" stroke-width="${t.hood?1.25:1.05}" stroke-linecap="round"/>`;
      if(P.ey==='alm')lid+=`<path d="M${f2(cx+(i===0?-lw:lw))} ${f2(cy-.1)}l${i===0?-1.3:1.3} -.7" stroke="${INK}" stroke-opacity=".7" stroke-width=".7" stroke-linecap="round"/>`;
      let crease=`<path d="M${f2(cx-cw)} ${f2(cy-ry-.1+(t.deep?.6:0))}Q${f2(cx)} ${f2(cy-ry-2.5)} ${f2(cx+cw+.3)} ${f2(cy-ry+.1)}" fill="none" stroke="${shSkin}" stroke-opacity="${t.deep?.8:.6}" stroke-width="${t.deep?.8:.55}"/>`;
      if(t.hood)crease=`<path d="M${f2(cx-rx-1)} ${f2(cy-ry*.35)}Q${f2(cx)} ${f2(cy-ry-2.4)} ${f2(cx+rx+1.2)} ${f2(cy-ry*.2)}Q${f2(cx)} ${f2(cy-ry*.75)} ${f2(cx-rx-1)} ${f2(cy-ry*.35)}Z" fill="${p.skin||SKINS[1]}"/><path d="M${f2(cx-rx-.6)} ${f2(cy-ry*.38)}Q${f2(cx)} ${f2(cy-ry*.85)} ${f2(cx+rx+.8)} ${f2(cy-ry*.25)}" fill="none" stroke="${mix(shSkin,'#000',.3)}" stroke-opacity=".7" stroke-width=".7"/><path d="M${f2(cx-rx)} ${f2(cy-ry-1.3)}Q${f2(cx)} ${f2(cy-ry-2.1)} ${f2(cx+rx)} ${f2(cy-ry-1)}" fill="none" stroke="${ltSkin}" stroke-opacity=".5" stroke-width=".6"/>`;
      if(t.deep)crease+=`<path d="M${f2(cx-rx-1.2)} ${f2(cy-ry-1.6)}Q${f2(cx)} ${f2(cy-ry-3.6)} ${f2(cx+rx+1.2)} ${f2(cy-ry-1.4)}" fill="none" stroke="${mix(shSkin,'#000',.35)}" stroke-opacity=".45" stroke-width="1.6"/>`;
      m+=lid+crease+`<path d="M${f2(cx-rx+.4)} ${f2(cy+ry-.25)}Q${f2(cx)} ${f2(cy+ry+.8)} ${f2(cx+rx-.4)} ${f2(cy+ry-.25)}" fill="none" stroke="${ltSkin}" stroke-opacity=".7" stroke-width=".5"/>`;
      if(P.ag==='old'||P.ag==='wth')m+=`<path d="M${f2(cx-rx+.6)} ${f2(cy+ry+1.6)}Q${f2(cx)} ${f2(cy+ry+3.1)} ${f2(cx+rx-.2)} ${f2(cy+ry+1.5)}" fill="none" stroke="${shSkin}" stroke-opacity="${P.ag==='old'?.55:.32}" stroke-width=".55"/>`}
    return rot?`<g transform="rotate(${rot} ${f2(cx)} ${f2(cy)})">${m}</g>`:m};
  /* the face planes (today's planes with every position read from the shape) */
  G.planes=o=>{const {li,ao,wm,shSkin,ltSkin,sm,k,fem,lipU,lipL,T,ink,mix}=o;let m='';const N=G.nose,Lp=G.lip,W=Lp.W,eL=G.eL,eR=G.eR,ag=P.ag,ln=P.ln||'';
    const cwx=S.cw*.612,hol=(S.cw+S.jw)/2*.757,holY=S.jy-5.4;
    const ckK=P.ck==='hi'?1.45:P.ck==='flat'?.5:1,ckY=P.ck==='hi'?-1.2:0;
    const holK=(P.ck==='hi'?2:P.ck==='flat'?.55:1)*(P.fs==='dm'?1.4:1)*(ag==='old'?1.6:ag==='yng'?.6:1);
    const sock=EYE[P.ey]&&EYE[P.ey].deep?1.35:1;const yE=G.eyY;
    const cr=(d,op,w)=>`<path d="${d}" fill="none" stroke="${shSkin}" stroke-opacity="${f2(op)}" stroke-width="${w||.55}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${ltSkin}" stroke-opacity="${f2(op*.8)}" stroke-width="${f2((w||.55)*.8)}" stroke-linecap="round" transform="translate(0 .65)"/>`;
    if(T>=2){m+=`<ellipse cx="44" cy="${f2(42-(S.top-31))}" rx="10" ry="6" fill="${li}" opacity=".55"/><ellipse cx="${f2(eL-1)}" cy="${f2(50.4+G.bdy)}" rx="4.5" ry="1.3" fill="${li}" opacity=".4"/><ellipse cx="${f2(50+S.tw+.7)}" cy="50" rx="5" ry="9" fill="${ao}" opacity="${P.fs==='dm'?.6:.45}"/>`
      +`<ellipse cx="${f2(eL)}" cy="${f2(yE-1.4)}" rx="6.8" ry="${f2(4.5*Math.sqrt(sock))}" fill="${ao}" opacity="${f2(.6*sock)}"/><ellipse cx="${f2(eR)}" cy="${f2(yE-1.4)}" rx="6.8" ry="${f2(4.5*Math.sqrt(sock))}" fill="${ao}" opacity="${f2(Math.min(.95,.72*sock))}"/>`
      +`<ellipse cx="${f2(50-cwx)}" cy="${f2(63.4+ckY)}" rx="5.6" ry="2.4" fill="${li}" opacity="${f2(.55*ckK)}" transform="rotate(-18 ${f2(50-cwx)} ${f2(63.4+ckY)})"/><ellipse cx="${f2(50+cwx+.1)}" cy="${f2(63.4+ckY)}" rx="4" ry="1.8" fill="${li}" opacity="${f2(.22*ckK)}" transform="rotate(18 ${f2(50+cwx+.1)} ${f2(63.4+ckY)})"/>`
      +`<ellipse cx="${f2(50-hol)}" cy="${f2(holY+.2)}" rx="5.5" ry="2.6" fill="${ao}" opacity="${f2(Math.min(.8,.22*k*holK))}"/><ellipse cx="${f2(50+hol+.5)}" cy="${f2(holY-.2)}" rx="5.5" ry="3" fill="${ao}" opacity="${f2(Math.min(.9,.36*k*holK))}"/>`
      +`<ellipse cx="${f2(50-cwx*.95)}" cy="68.6" rx="6" ry="4" fill="${wm}" opacity="${ag==='yng'?.62:ag==='old'?.3:.5}"/><ellipse cx="${f2(50+cwx*.95)}" cy="68.6" rx="5.6" ry="3.8" fill="${wm}" opacity="${ag==='yng'?.5:ag==='old'?.24:.4}"/><circle cx="50" cy="${f2(N.tip[1]+.1)}" r="2.4" fill="${wm}" opacity="${P.ag==='wth'?.5:.35}"/>`
      /* nose by type */
      +`<path d="${N.side}" fill="${shSkin}" opacity=".26"/><path d="${N.wing}" fill="none" stroke="${shSkin}" stroke-opacity=".5" stroke-width=".55"/>${N.wingL?`<path d="${N.wingL}" fill="none" stroke="${ltSkin}" stroke-opacity=".45" stroke-width=".5"/>`:''}`
      +`<path d="${N.bridge}" fill="none" stroke="${ltSkin}" stroke-opacity=".7" stroke-width=".95" stroke-linecap="round"/><circle cx="${N.tip[0]}" cy="${N.tip[1]}" r="${N.tip[2]}" fill="${li}"/>`
      +(N.bump?`<ellipse cx="${N.bump[0]}" cy="${N.bump[1]}" rx="1.1" ry="1.5" fill="${li}" opacity=".8"/>`:'')+(N.scar?`<path d="M48.6 62.2L52.4 61.4" stroke="#b86a5e" stroke-opacity=".7" stroke-width=".55" stroke-linecap="round"/>`:'')
      +`<ellipse cx="${N.nos[0]}" cy="${N.nos[2]}" rx="${N.nos[3]}" ry="${f2(N.nos[3]*.47)}" fill="${mix(shSkin,'#000',.45)}" opacity=".55"/><ellipse cx="${N.nos[1]}" cy="${N.nos[2]}" rx="${N.nos[3]}" ry="${f2(N.nos[3]*.47)}" fill="${mix(shSkin,'#000',.45)}" opacity=".5"/><ellipse cx="${N.under[0]}" cy="${N.under[1]}" rx="${N.under[2]}" ry="1.2" fill="${ao}" opacity=".8"/>`
      /* philtrum, nasolabial, lips */
      +`<path d="M49.2 ${f2(N.under[1]+.6)}L49 75.4M51.3 ${f2(N.under[1]+.6)}L51.5 75.4" stroke="${shSkin}" stroke-opacity=".14" stroke-width=".5"/><ellipse cx="50.2" cy="74" rx=".8" ry="1.4" fill="${li}" opacity=".35"/>`;
      const nlK=ag==='yng'?0:ag==='wth'?1.9:ag==='old'?2.6:/c/.test(ln)?2:1;
      if(nlK&&(!fem||nlK>1)){const a=W*.81+.2,b=W*1.15;m+=`<path d="M${f2(50-a)} 70.9Q${f2(50-b-.4)} 73.4 ${f2(50-b)} 76.3M${f2(50+a)} 70.9Q${f2(50+b+.4)} 73.4 ${f2(50+b)} 76.3" fill="none" stroke="${shSkin}" stroke-opacity="${f2(.2*nlK)}" stroke-width="${nlK>1?.7:.55}"/>`;
        if(nlK>1)m+=`<path d="M${f2(50-a+.6)} 71.6Q${f2(50-b+.3)} 73.6 ${f2(50-b+.5)} 76" fill="none" stroke="${ltSkin}" stroke-opacity=".3" stroke-width=".5"/>`}
      const u=Lp.u,l=Lp.l,cl=Lp.cl,crr=Lp.cr,w2=W*.537;
      m+=`<path d="M${f2(50-W)} ${f2(77.1+cl)}Q${f2(50-w2)} ${f2(77.1-1.9*u+sm*.6)} 50 ${f2(77.1-1*u+sm*.8)}Q${f2(50+w2)} ${f2(77.1-1.9*u+sm*.6)} ${f2(50+W)} ${f2(77.1+crr)}Q50 ${f2(77.8+sm+(cl+crr)/2)} ${f2(50-W)} ${f2(77.1+cl)}Z" fill="${lipU}"/><path d="M${f2(50-W+.7)} ${f2(77.4+cl)}Q50 ${f2(77.4+4.2*l+sm+(cl+crr)/2)} ${f2(50+W-.7)} ${f2(77.4+crr)}Q50 ${f2(78.5+sm+(cl+crr)/2)} ${f2(50-W+.7)} ${f2(77.4+cl)}Z" fill="${lipL}"/>`
        +`<ellipse cx="49.4" cy="${f2(77.4+2.1*l+sm+(cl+crr)/2)}" rx="${f2(2.2*W/5.4)}" ry="${f2(.55*Math.max(.6,l))}" fill="#fff4ea" opacity=".45"/><ellipse cx="50" cy="${f2(77.4+4.4*l+sm+(cl+crr)/2)}" rx="${f2(3.4*W/5.4)}" ry="1" fill="${ao}" opacity=".75"/><circle cx="${f2(50-W-.4)}" cy="${f2(77.1+cl)}" r=".6" fill="${mix(shSkin,'#000',.4)}" opacity=".5"/><circle cx="${f2(50+W+.4)}" cy="${f2(77.1+crr)}" r=".6" fill="${mix(shSkin,'#000',.4)}" opacity=".5"/>`;
      if(P.lp==='smk')m+=`<path d="M${f2(50+W+.8)} ${f2(76.4+crr)}Q${f2(50+W+1.9)} ${f2(77.3+crr)} ${f2(50+W+1.2)} ${f2(78.6+crr)}" fill="none" stroke="${shSkin}" stroke-opacity=".55" stroke-width=".6"/>`;
      if(P.lp==='dwn'||ag==='old')m+=`<path d="M${f2(50-W-.5)} ${f2(78+cl)}Q${f2(50-W-1.2)} 80.6 ${f2(50-W-.6)} 82.6M${f2(50+W+.5)} ${f2(78+crr)}Q${f2(50+W+1.2)} 80.6 ${f2(50+W+.6)} 82.6" fill="none" stroke="${shSkin}" stroke-opacity="${ag==='old'?.42:.3}" stroke-width=".6"/>`;
      /* chin, jaw */
      const sq=P.fs==='sq'||P.jw==='str'||P.jw==='wid';
      m+=`<ellipse cx="49" cy="${f2(S.bot-2)}" rx="${f2(Math.max(2.4,Math.min(5.2,3.6*Math.sqrt(S.chw/OVAL.chw))))}" ry="1.7" fill="${li}" opacity=".5"/><path d="M${f2(50-(S.cw-2.5))} 66Q${f2(50-(S.jw+2))} ${f2(S.jy)} ${f2(50-(S.chw+4.8))} ${f2(S.bot-3)}" fill="none" stroke="${ltSkin}" stroke-opacity=".3" stroke-width="1.4"/><path d="M${f2(50+S.chw+2.8)} ${f2(S.bot-1.4)}Q${f2(50+S.jw-.4)} ${f2(S.jy+4.6)} ${f2(50+S.cw-1.9)} 72" fill="none" stroke="${shSkin}" stroke-opacity=".35" stroke-width="1.6"/>`;
      if(sq)m+=`<path d="M${f2(50+S.jw-2.6)} ${f2(S.jy-3)}Q${f2(50+S.jw-1)} ${f2(S.jy+1.2)} ${f2(50+S.chw+1)} ${f2(S.chy+.4)}" fill="none" stroke="${shSkin}" stroke-opacity=".38" stroke-width="2.2"/><path d="M${f2(50-S.jw+2.2)} ${f2(S.jy-3)}Q${f2(50-S.jw+.6)} ${f2(S.jy+1.4)} ${f2(50-S.chw-1)} ${f2(S.chy+.2)}" fill="none" stroke="${ltSkin}" stroke-opacity=".3" stroke-width="1.2"/>`;
      if(P.jw==='str')m+=`<path d="M50.3 ${f2(S.bot-3.6)}L50.2 ${f2(S.bot-.6)}" stroke="${shSkin}" stroke-opacity=".45" stroke-width=".8" stroke-linecap="round"/>`;
      if(ag==='old')m+=`<path d="M${f2(50-S.jw+.4)} ${f2(S.jy+1)}Q${f2(50-S.jw+2.6)} ${f2(S.jy+5)} ${f2(50-S.chw-2)} ${f2(S.chy)}M${f2(50+S.jw-.4)} ${f2(S.jy+1)}Q${f2(50+S.jw-2.6)} ${f2(S.jy+5)} ${f2(50+S.chw+2)} ${f2(S.chy)}" fill="none" stroke="${shSkin}" stroke-opacity=".3" stroke-width=".8"/>`;
      /* age + lines (painted creases: a dark line with a light line under it) */
      const fh=ag==='old'?3:ag==='wth'||/f/.test(ln)?2:0;const fy=42-(S.top-31)*.5;
      for(let j=0;j<fh;j++){const y=fy+j*2.9-(fh-1)*1.2;const w=10.5-j*1.6;m+=cr(`M${f2(50-w)} ${f2(y+.5)}Q50 ${f2(y-.9)} ${f2(50+w)} ${f2(y+.5)}`,ag==='old'?.42:.32,.55)}
      if(ag==='old'||ag==='wth'){const n=ag==='old'?3:2;for(const [cx,sg] of [[eL,-1],[eR,1]])for(let j=0;j<n;j++){const x=cx+sg*(EYE[P.ey]||EYE['']).rx+sg*1.3,y=yE-1+j*1.4;m+=cr(`M${f2(x)} ${f2(y)}l${f2(sg*2.1)} ${f2(-.6+j*.6)}`,ag==='old'?.42:.3,.45)}}
      if(/c/.test(ln)||ag==='old')m+=cr(`M${f2(50-cwx-1)} 66Q${f2(50-cwx-2.4)} 70 ${f2(50-cwx-1.4)} 73.4`,.28,.5)+cr(`M${f2(50+cwx+1)} 66Q${f2(50+cwx+2.4)} 70 ${f2(50+cwx+1.4)} 73.4`,.32,.5);
      if(ag==='old')m+=`<path d="M${f2(eL-2.4)} ${f2(yE+4.6)}Q${f2(eL)} ${f2(yE+6)} ${f2(eL+2.8)} ${f2(yE+4.4)}M${f2(eR-2.8)} ${f2(yE+4.4)}Q${f2(eR)} ${f2(yE+6)} ${f2(eR+2.4)} ${f2(yE+4.6)}" fill="none" stroke="${shSkin}" stroke-opacity=".35" stroke-width=".6"/><path d="M47.5 ${f2(G.bdy+50.6)}L47.8 ${f2(G.bdy+54)}" stroke="${shSkin}" stroke-opacity=".38" stroke-width=".55"/>`;
      if(ag==='wth')m+=`<rect x="20" y="28" width="60" height="62" fill="#8a4a2a" opacity=".07"/>`;
      if(ag==='yng')m+=`<ellipse cx="${f2(50-cwx)}" cy="67" rx="5" ry="3.4" fill="${li}" opacity=".25"/>`}
    else{m+=`<ellipse cx="${f2(eR)}" cy="${f2(yE-1.4)}" rx="6" ry="4" fill="${ao}" opacity="${f2(.45*sock)}"/><path d="${N.side}" fill="${shSkin}" opacity=".45"/><ellipse cx="${N.under[0]}" cy="${N.under[1]}" rx="${N.under[2]}" ry="1.2" fill="${ao}" opacity=".6"/><path d="M${f2(50-W+.4)} ${f2(77.4+Lp.cl)}Q50 ${f2(77.4+3.6*Lp.l+(Lp.cl+Lp.cr)/2)} ${f2(50+W-.4)} ${f2(77.4+Lp.cr)}Z" fill="${lipL}"/>`;
      if(P.fs||P.jw)m+=`<path d="M${f2(50+S.chw+2.8)} ${f2(S.bot-1.4)}Q${f2(50+S.jw-.4)} ${f2(S.jy+4.6)} ${f2(50+S.cw-1.9)} 72" fill="none" stroke="${shSkin}" stroke-opacity=".35" stroke-width="1.8"/>`;
      if(ag==='old')m+=cr(`M41 ${f2(42-(S.top-31)*.5)}Q50 40.6 59 ${f2(42-(S.top-31)*.5)}`,.45,.8)}
    return m};
  return G}
/* ---------- the painter ---------- */
window.faceV=function(spec,opt){opt=opt||{};spec=spec||{};const P=partsOf(spec);if(!anyPart(P))return face99b(spec,opt);
  let s2={...spec};if(P.ag==='old'){const h=spec.hair||HAIRS[1];s2.hair=mixc(h,'#c9c6bf',.58)}if(P.ag==='wth'){const k=spec.skin||SKINS[1];s2.skin=mixc(k,'#9a5a40',.07)}
  if(!s2.skin)s2.skin=SKINS[1];if(!s2.hair)s2.hair=HAIRS[1];
  const G=geo(P,s2);
  return face99b(s2,{...opt,geo:G,pre:s=>prePass(s,G)})};
window.vParts=partsOf;
})();
