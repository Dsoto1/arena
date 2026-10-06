/* 207-v92extras — v0.92 ARMOR EXTRAS in the 2D Armor designer (his picks 2026-10-06).
   • Printed pieces stay one fused unit. A custom piece gets click-to-add EXTRAS, all COSMETIC (no AP, no rules): neck guard
     (galerus), Manica plates, studs, spikes, fur trim, an emblem (a Studio banner or the Manager house banner when there is one,
     else eagle / laurel / star / crescent), damage (dents / scratches / cracks), wraps (rope / cloth), lacing (lace / strap and
     buckle), a trim band, paint (wash / stripe / band).
   • The Extras tray sits in the designer's form under the sculpt bench: a row of add buttons, a large preview of the piece where
     a click selects an extra and a drag moves it (the wheel sizes it, Shift+wheel turns it), the list of extras, and for the
     selected one: style, Size, Turn, Colour, ✕ Remove. Up to X92_MAX per piece.
   • Stored small on the armor record: ca.x92 = [{k,x,y,s,r,c,v?,f?,fid?}] in the piece's own 100×100 box (x,y = centre, s = size %,
     r = turn°, c = colour, v = style, f = a banner's {bg,fg,txt,shape} copied in). It rides along with save / load / copy /
     roster sets / the Store (it is part of the custom armor record; no new collection).
   • Drawn wherever the piece is drawn: armSVG (cards, thumbnails, the designer preview, the levels row, lists) appends the extras
     inside the piece's 100-box; caOnBodySVG for a piece wearing the printed art (97-armor73) lays them over the art with the
     art's own placement, turn and mirror. Everything else (the avatar on the board, the mock-up, Ludus records) goes through those.
   • Every value is cleaned when drawn (kinds and styles whitelisted, colours #rrggbb, numbers clamped) — records may come from the
     shared Store. */
const X92_MAX=12;
const X92_INK='#20160d';
/* the kinds: label, default colour, default spot in the piece box, default size, styles */
const X92_K={
  galerus:{n:_T('Neck guard'),c:'#b8925a',x:50,y:18,s:70,at:['sho']},
  manica:{n:_T('Manica plates'),c:'#a9aeb5',x:50,y:52,s:100,at:['sho','fore']},
  studs:{n:_T('Studs'),c:'#d8c27a',x:50,y:34,s:100},
  spikes:{n:_T('Spikes'),c:'#c9d0d6',x:50,y:26,s:90},
  fur:{n:_T('Fur trim'),c:'#8a6a44',x:50,y:72,s:100},
  emblem:{n:_T('Emblem'),c:'#c9a458',x:50,y:46,s:80,v:[['eagle',_T('Eagle')],['laurel',_T('Laurel')],['star',_T('Star')],['crescent',_T('Crescent')]]},
  dmg:{n:_T('Damage'),c:'#2a1c10',x:60,y:40,s:80,v:[['dent',_T('Dents')],['scratch',_T('Scratches')],['crack',_T('Cracks')]]},
  wrap:{n:_T('Wraps'),c:'#c9b8a0',x:50,y:60,s:100,v:[['rope',_T('Rope')],['cloth',_T('Cloth')]]},
  lace:{n:_T('Lacing'),c:'#6a4428',x:50,y:62,s:70,v:[['lace',_T('Lacing')],['strap',_T('Strap and buckle')]]},
  trim:{n:_T('Trim band'),c:'#c9a458',x:50,y:78,s:100},
  paint:{n:_T('Paint'),c:'#7a2230',x:50,y:50,s:120,v:[['wash',_T('Wash')],['stripe',_T('Stripe')],['band',_T('Band')]]}};
const x92Col=(c,d)=>/^#[0-9a-f]{6}$/i.test(String(c||''))?String(c):d;
const x92Num=(v,lo,hi,d)=>{v=+v;return Number.isFinite(v)?Math.max(lo,Math.min(hi,Math.round(v))):d};
function x92CleanOne(e){if(!e||!X92_K[e.k])return null;const K=X92_K[e.k];
  const o={k:e.k,x:x92Num(e.x,-20,120,K.x),y:x92Num(e.y,-20,120,K.y),s:x92Num(e.s,20,250,K.s),r:x92Num(e.r,-180,180,0),c:x92Col(e.c,K.c)};
  if(K.v)o.v=(K.v.some(([k])=>k===e.v)||(e.k==='emblem'&&e.v==='flag'&&e.f))?e.v:K.v[0][0];
  if(o.v==='flag'){const f=e.f||{};o.f={bg:x92Col(f.bg,'#6e1414'),fg:x92Col(f.fg,'#e2b64a'),txt:String(f.txt||'').replace(/[^A-Za-z0-9 .·]/g,'').slice(0,8),shape:/^[a-z0-9]{1,16}$/i.test(String(f.shape||''))?f.shape:'none'};
    if(/^[\w-]{1,32}$/.test(String(e.fid||'')))o.fid=e.fid}
  return o}
const x92Clean=L=>Array.isArray(L)?L.slice(0,X92_MAX).map(x92CleanOne).filter(Boolean):[];
/* one extra, drawn around (0,0) at about ±20 units (size 100) */
function x92Shape(e){const c=e.c,I=X92_INK,D=shade(c,-0.38),L=shade(c,0.32);const sw=(w)=>`stroke="${I}" stroke-width="${w}" stroke-linejoin="round"`;
  switch(e.k){
    case 'galerus':return `<path d="M-20 12Q-22 -6 -8 -20L8 -20Q22 -6 20 12Q0 5 -20 12Z" fill="${c}" ${sw(1.3)}/><path d="M-14 6Q-15 -6 -5 -15" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round" opacity=".8"/><path d="M-18 9Q0 2 18 9" fill="none" stroke="${D}" stroke-width="1.2"/>${[-12,0,12].map(x=>`<circle cx="${x}" cy="${x?7.4:5.4}" r="1.6" fill="${L}" ${sw(.6)}/>`).join('')}`;
    case 'manica':{let g='';for(let i=3;i>=0;i--){const y=-17+i*8;g+=`<path d="M-15 ${y}Q0 ${y+5} 15 ${y}L15 ${y+10}Q0 ${y+15} -15 ${y+10}Z" fill="${i%2?c:shade(c,0.1)}" ${sw(1.1)}/><path d="M-12 ${y+2.4}Q0 ${y+6.6} 12 ${y+2.4}" fill="none" stroke="${L}" stroke-width="1.2" opacity=".8"/><circle cx="-11" cy="${y+5}" r="1" fill="${D}"/><circle cx="11" cy="${y+5}" r="1" fill="${D}"/>`}return g}
    case 'studs':return [-16,-8,0,8,16].map(x=>`<circle cx="${x+.8}" cy=".9" r="2.9" fill="#000" opacity=".3"/><circle cx="${x}" cy="0" r="2.8" fill="${c}" ${sw(.8)}/><circle cx="${x-.9}" cy="-.9" r="1" fill="#fff" opacity=".55"/>`).join('');
    case 'spikes':return `<rect x="-18" y="4" width="36" height="6" rx="2" fill="${D}" ${sw(1)}/>`+[-12,0,12].map(x=>`<path d="M${x-5} 5L${x} -16L${x+5} 5Z" fill="${c}" ${sw(1.1)}/><path d="M${x} -16L${x+5} 5L${x+1} 5Z" fill="${D}" opacity=".6"/>`).join('');
    case 'fur':{let top='',bot='';for(let i=0;i<8;i++){const x=-20+i*5;top+=`Q${x+1} -10 ${x+2.5} -8Q${x+4} -10 ${x+5} -3`;}for(let i=7;i>=0;i--){const x=-20+i*5;bot+=`Q${x+4} 10 ${x+2.5} 8Q${x+1} 10 ${x} 3`}
      return `<path d="M-20 -3${top}L20 3${bot}Z" fill="${c}" ${sw(1)}/>`+[-16,-9,-2,5,12].map(x=>`<path d="M${x} -5l2 4M${x+3} 1l2 4" stroke="${D}" stroke-width=".8" stroke-linecap="round"/>`).join('')+`<path d="M-18 -1Q0 1 18 -1" fill="none" stroke="${L}" stroke-width="1" opacity=".6"/>`}
    case 'emblem':{if(e.v==='flag'&&e.f&&typeof flagURI==='function'){let u='';try{u=flagURI(e.f.bg,e.f.fg,e.f.txt,e.f.shape)}catch(er){}
        return `<rect x="-12.6" y="-8.6" width="27" height="18" fill="#000" opacity=".3"/><image href="${esc(u)}" x="-13.5" y="-9" width="27" height="18" preserveAspectRatio="none"/><rect x="-13.5" y="-9" width="27" height="18" fill="none" ${sw(1.2)}/>`}
      const disc=`<circle r="12.5" fill="${c}" ${sw(1.2)}/><circle r="10" fill="none" stroke="${D}" stroke-width="1"/><path d="M-8 -6A10 10 0 0 1 4 -9.4" fill="none" stroke="${L}" stroke-width="1.4" opacity=".8"/>`;
      if(e.v==='laurel'){let g='';for(const s of [-1,1]){g+=`<path d="M0 10Q${s*11} 5 ${s*7} -9" fill="none" stroke="${D}" stroke-width="1.3"/>`;for(const [x,y,a] of [[7,6,-30],[9.6,1,-10],[9.4,-4,10],[7,-8.4,30]])g+=`<ellipse cx="${s*x}" cy="${y}" rx="3.4" ry="1.5" transform="rotate(${s*a+90*s} ${s*x} ${y})" fill="${c}" ${sw(.6)}/>`}return g}
      if(e.v==='star'){const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?3.4:8;p.push((Math.cos(a)*r).toFixed(1)+' '+(Math.sin(a)*r).toFixed(1))}return disc+`<path d="M${p.join('L')}Z" fill="${L}" ${sw(.7)}/>`}
      if(e.v==='crescent')return disc+`<path d="M3 -7A7.5 7.5 0 1 0 3 7A6 6 0 1 1 3 -7Z" fill="${L}" ${sw(.7)}/>`;
      return disc+`<path d="M0 -5L-9 -8L-6 -3L-10 -1L-4 1L-2 6L0 9L2 6L4 1L10 -1L6 -3L9 -8Z" fill="${D}" ${sw(.6)}/><circle cy="-6" r="2" fill="${D}" ${sw(.5)}/>`}
    case 'dmg':
      if(e.v==='scratch')return `<path d="M-14 -6L12 2M-12 0L14 7M-8 -11L9 -5" stroke="${c}" stroke-width="1" opacity=".6" stroke-linecap="round"/><path d="M-14 -6L12 2M-12 0L14 7M-8 -11L9 -5" transform="translate(.6 .7)" stroke="#fff" stroke-width=".6" opacity=".35" stroke-linecap="round"/>`;
      if(e.v==='crack'){const d='M-14 -10L-6 -3L-9 2L0 6L-2 11M-6 -3L3 -6L10 -12M0 6L8 5';return `<path d="${d}" fill="none" stroke="#fff" stroke-width=".8" opacity=".3" transform="translate(.8 .6)"/><path d="${d}" fill="none" stroke="${c}" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>`}
      return `<ellipse rx="7" ry="5" fill="${c}" opacity=".3"/><path d="M-6 3Q0 7 6 3" stroke="#fff" opacity=".45" stroke-width="1.2" fill="none"/><path d="M-5 -2Q0 -5 5 -2" stroke="${c}" opacity=".45" stroke-width="1" fill="none"/>`;
    case 'wrap':
      if(e.v==='cloth')return [-10,0,10].map(y=>`<path d="M-18 ${y-3}Q0 ${y+1} 18 ${y-3}L18 ${y+3}Q0 ${y+7} -18 ${y+3}Z" fill="${c}" ${sw(.9)}/><path d="M-10 ${y+.5}Q-4 ${y+2.6} 2 ${y+1.6}" fill="none" stroke="${D}" stroke-width=".7"/>`).join('');
      return [0,1,2,3].map(i=>`<g transform="translate(${-12+i*8} 0) rotate(-25)"><rect x="-2.6" y="-16" width="5.2" height="32" rx="2.6" fill="${c}" ${sw(.9)}/><path d="M-2 -12l4 3M-2 -6l4 3M-2 0l4 3M-2 6l4 3" stroke="${D}" stroke-width=".7"/></g>`).join('');
    case 'lace':
      if(e.v==='strap')return `<rect x="-20" y="-4" width="40" height="8" rx="1.5" fill="${c}" ${sw(1)}/><path d="M-19 -2.4H19M-19 2.4H19" stroke="${L}" stroke-width=".5" stroke-dasharray="1.5 1.2" opacity=".8"/><rect x="-4" y="-6" width="8" height="12" rx="1.5" fill="none" stroke="${I}" stroke-width="3"/><rect x="-4" y="-6" width="8" height="12" rx="1.5" fill="none" stroke="#d8c27a" stroke-width="1.6"/><path d="M-4 0H3" stroke="#d8c27a" stroke-width="1.2"/>${[8,12,16].map(x=>`<circle cx="${x}" r=".9" fill="${I}"/>`).join('')}`;
      {const ys=[-15,-7.5,0,7.5,15];let x='';for(let i=0;i<4;i++)x+=`M-5 ${ys[i]}L5 ${ys[i+1]}M5 ${ys[i]}L-5 ${ys[i+1]}`;
       return `<path d="${x}" stroke="${I}" stroke-width="2.6" stroke-linecap="round"/><path d="${x}" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>`+ys.map(y=>`<circle cx="-5" cy="${y}" r="1.5" fill="${L}" ${sw(.6)}/><circle cx="5" cy="${y}" r="1.5" fill="${L}" ${sw(.6)}/>`).join('')}
    case 'trim':return `<rect x="-20" y="-3.5" width="40" height="7" rx="1.5" fill="${c}" ${sw(1)}/><path d="M-19 -1.6H19M-19 1.6H19" stroke="${D}" stroke-width=".6"/>`+[-15,-9,-3,3,9,15].map(x=>`<circle cx="${x}" r=".9" fill="${L}"/>`).join('');
    case 'paint':
      if(e.v==='stripe')return `<rect x="-4" y="-22" width="8" height="44" rx="2" fill="${c}" opacity=".7"/>`;
      if(e.v==='band')return `<rect x="-22" y="-5" width="44" height="10" rx="2" fill="${c}" opacity=".7"/>`;
      return `<ellipse rx="20" ry="17" fill="${c}" opacity=".42" style="mix-blend-mode:multiply"/>`}
  return ''}
/* the extras of a piece as one <g> in its 100-box; sel = the selected index (designer preview only: hit boxes + a ring) */
function x92SVG(list,opt){opt=opt||{};const L=x92Clean(list);if(!L.length)return '';
  return `<g class="x92">${L.map((e,i)=>{const t=`translate(${e.x} ${e.y}) rotate(${e.r}) scale(${(e.s/100).toFixed(2)})`;
    const hit=opt.edit?`<circle r="22" fill="#000" opacity="0" data-x92i="${i}"/>`:'';
    const ring=opt.edit&&opt.sel===i?`<circle r="23" fill="none" stroke="#f0cf7d" stroke-width="1.6" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>`:'';
    return `<g class="x92e" data-k="${e.k}" transform="${t}">${x92Shape(e)}${ring}${hit}</g>`}).join('')}</g>`}
let X92_OFF=0;
const x92Of=(key,ca)=>{const A=(typeof ARM!=='undefined'&&ARM[key])||{};const cu=ca&&typeof ca==='object'?ca:(A.caId?(CUSTOM.armor||[]).find(c=>c.id===A.caId):null);return cu&&Array.isArray(cu.x92)&&cu.x92.length?cu.x92:null};
/* cards, thumbnails, lists, the designer preview: inside the piece's own 100-box */
{const base=armSVG;armSVG=function(key,ca){const s=base.apply(this,arguments);if(X92_OFF)return s;try{const L=x92Of(key,ca);if(!L)return s;const i=s.lastIndexOf('</svg>');if(i<0)return s;return s.slice(0,i)+x92SVG(L)+s.slice(i)}catch(e){console.error(e)}return s}}
/* a piece wearing the printed art: the art's box (97-armor73's placement), the extras' 100-box = the art's longer side */
function x92ArtBox(ca,mirror){if(typeof caArtOn!=='function'||!caArtOn(ca)||!ca.eq||!EQ[ca.eq])return null;const P=ARM[ca.art];const c=P&&ARM_CROP[P.img];if(!c)return null;
  const f0=caF2(ca);const f=mirror&&ca.f2&&ca.f2.L?{...f0,...ca.f2.L}:f0;const p=mirror?(EQ_L[ca.eq]||[150-EQ[ca.eq][0],EQ[ca.eq][1]]):EQ[ca.eq];
  const w=f.s/CA_S_K,h=w*c[3]/c[2];return {cx:mirror?p[0]-f.dx:p[0]+f.dx,cy:p[1]+f.dy,w,h,r:f.r||0,crop:c,side:!!mirror,mirror:!!mirror!==(!!ARM_LEFTART[ca.art]!==!!f.flip)}}
function x92OverArt(B,list){const m=Math.max(B.w,B.h);const tr=`${B.mirror?`translate(${2*B.cx} 0) scale(-1 1) `:''}${B.r?`rotate(${B.r*(B.mirror?-1:1)*(B.side?-1:1)} ${B.cx} ${B.cy})`:''}`;
  return `<g transform="${tr}"><g transform="translate(${(B.cx-m/2).toFixed(2)} ${(B.cy-m/2).toFixed(2)}) scale(${(m/100).toFixed(4)})">${x92SVG(list)}</g></g>`}
{const base=caOnBodySVG;caOnBodySVG=function(ca,key,mirror){const s=base.apply(this,arguments);try{if(ca&&Array.isArray(ca.x92)&&ca.x92.length){const B=x92ArtBox(ca,mirror);if(B)return s+x92OverArt(B,ca.x92)}}catch(e){console.error(e)}return s}}
/* ---------- the tray ---------- */
const x92Sel=()=>{const L=ST.ca&&ST.ca.x92;const i=ST.x92sel;return L&&i!=null&&L[i]?i:null};
/* the piece alone in its 100-box, without extras (the tray draws them itself with hit boxes) */
function x92PieceSVG(d){const B0=x92ArtBox(d,false);
  if(B0){const m=Math.max(B0.w,B0.h);const B={cx:50,cy:50,w:100*B0.w/m,h:100*B0.h/m,r:0,crop:B0.crop,side:false,mirror:false,gold:d.art==='bracers'};return {g:armPieceSVG(B,d.art,1,null,'x92p'),mir:B0.mirror}}
  X92_OFF=1;let s='';try{s=armSVG('ca_preview',{...d})}finally{X92_OFF=0}return {g:s.replace(/^<svg[^>]*>|<\/svg>$/g,''),mir:!!caF2(d).flip}}
function x92PrevSVG(d){const P=x92PieceSVG(d);return `<svg viewBox="-10 -10 120 120" xmlns="http://www.w3.org/2000/svg"><g${P.mir?' transform="translate(100 0) scale(-1 1)"':''}>${P.g}${x92SVG(d.x92||[],{edit:1,sel:x92Sel()})}</g></svg>`}
function x92AddIcon(k){const K=X92_K[k];return `<svg viewBox="-24 -24 48 48" width="26" height="26" aria-hidden="true">${x92Shape(x92CleanOne(k==='dmg'?{k,v:'crack',c:'#e8d8b8'}:{k,x:0,y:0,s:100,c:K.c}))}</svg>`}
function x92Flags(){const out=[];try{const m=typeof me==='function'&&typeof W_==='function'&&W_()?me():null;const f=m&&typeof mgrFlagOf==='function'?mgrFlagOf(m):null;if(f)out.push(['house',_T('Your house banner'),f])}catch(e){}
  for(const f of ((typeof CUSTOM!=='undefined'&&CUSTOM.flags)||[]).filter(f=>f&&f.fmt!=='portrait'))out.push(['fl:'+f.id,f.name||_T('Banner'),f]);return out}
function x92CtlHTML(d){const L=d.x92||[];const i=x92Sel();const e=i!=null?x92CleanOne(L[i]):null;
  const chips=L.map((x,j)=>{const K=X92_K[x.k];return K?`<span class="x92chip${j===i?' on':''}"><button type="button" class="x92pick" data-x92sel="${j}">${x92AddIcon(x.k)}<span>${esc(K.n)}</span></button><button type="button" class="x92del" data-x92del="${j}" title="${_T`Remove`}" aria-label="${_T`Remove`}">✕</button></span>`:''}).join('');
  let ctl='';
  if(e){const K=X92_K[e.k];const sl=(k,l,min,max)=>`<label class="rc-sub x92sl">${l} <b>${e[k]}</b><input type="range" min="${min}" max="${max}" step="1" value="${e[k]}" data-x92f="${k}"></label>`;
    let vs='';if(K.v){const fl=e.k==='emblem'?x92Flags():[];const cur=e.v==='flag'?(e.fid?'fl:'+e.fid:'house'):e.v;
      vs=`<label class="rc-sub">${_T`Style`}<select data-x92f="v">${K.v.map(([k,l])=>`<option value="${k}" ${cur===k?'selected':''}>${l}</option>`).join('')}${fl.map(([k,l])=>`<option value="${esc(k)}" ${cur===k?'selected':''}>🚩 ${esc(l)}</option>`).join('')}</select></label>`}
    ctl=`<div class="x92sel"><b>${esc(K.n)}</b>${vs}${sl('s',_T('Size'),20,250)}${sl('r',_T('Turn'),-180,180)}${e.v==='flag'?'':`<label class="rc-sub x92col">${_T`Colour`}<input type="color" data-x92f="c" value="${e.c}"></label>`}<button type="button" class="btn tksm" data-x92del="${i}">${_T`✕ Remove`}</button></div>`}
  else ctl=`<div class="rc-sub x92hint">${L.length?_T('Click an extra on the piece or in the list to change it.'):_T('Click an extra above to add it to the piece.')}</div>`;
  return `<div class="x92list">${chips}</div>${ctl}`}
/* v0.92 (his note): arm-only extras (neck guard, Manica plates) are offered only on an arm piece (upper arm / lower arm) */
function x92Fits(k,d){const at=X92_K[k]&&X92_K[k].at;return !at||at.includes(d&&d.eq)}
function x92TrayHTML(d){const n=(d.x92||[]).length;
  return `<div class="x92" id="x92Tray"><div class="sect" style="margin:4px 0">${_T`Extras`} <span class="rc-sub">${_T`cosmetic only · no AP · click to add, drag on the piece to move, the wheel sizes it (Shift turns it)`}</span> <b class="x92n">${n}/${X92_MAX}</b></div>
    <div class="x92add">${Object.keys(X92_K).filter(k=>x92Fits(k,d)).map(k=>`<button type="button" class="btn tksm x92addb" data-x92add="${k}" ${n>=X92_MAX?'disabled':''}>${x92AddIcon(k)}<span>${esc(X92_K[k].n)}</span></button>`).join('')}</div>
    <div class="x92body"><div class="x92prev scart" id="x92Prev">${x92PrevSVG(d)}</div><div class="x92ctl" id="x92Ctl">${x92CtlHTML(d)}</div></div></div>`}
{const base=gearAHTML;gearAHTML=function(){let h=base.apply(this,arguments);try{const d=ST.ca;if(!d)return h;if(x92Sel()==null)ST.x92sel=null;
  const t=x92TrayHTML(d);let i=h.indexOf('<div class="calevels"');if(i<0)i=h.indexOf('<div style="grid-column:1/-1" class="rc-sub crnote">');
  if(i>=0)h=h.slice(0,i)+t+h.slice(i)}catch(e){console.error(e)}return h}}
/* live refresh: the tray preview, its controls (unless a slider is being dragged), the piece preview and the mock-up */
function x92Refresh(ctl){const d=ST.ca;if(!d)return;const pv=document.getElementById('x92Prev');if(pv)pv.innerHTML=x92PrevSVG(d);
  if(ctl){const c=document.getElementById('x92Ctl');if(c)c.innerHTML=x92CtlHTML(d);const n=(d.x92||[]).length;const nb=document.querySelector('#x92Tray .x92n');if(nb)nb.textContent=n+'/'+X92_MAX;document.querySelectorAll('[data-x92add]').forEach(b=>b.disabled=n>=X92_MAX)}
  try{caPrevRefresh()}catch(e){}}
function x92Add(k){const d=ST.ca;const K=X92_K[k];if(!d||!K||!x92Fits(k,d))return;d.x92=Array.isArray(d.x92)?d.x92:[];if(d.x92.length>=X92_MAX){mToast(_T`A piece holds up to ${X92_MAX} extras.`);return}
  const same=d.x92.filter(x=>x.k===k).length;const e={k,x:K.x+same*6,y:K.y+same*6,s:K.s,r:0,c:K.c};
  if(K.v)e.v=K.v[0][0];
  if(k==='emblem'){const fl=x92Flags()[0];if(fl){e.v='flag';e.f={bg:fl[2].bg,fg:fl[2].fg,txt:fl[2].txt,shape:fl[2].shape};if(fl[0].startsWith('fl:'))e.fid=fl[0].slice(3)}}
  d.x92.push(x92CleanOne(e));ST.x92sel=d.x92.length-1;x92Refresh(true)}
function x92Del(i){const d=ST.ca;if(!d||!Array.isArray(d.x92)||!d.x92[i])return;d.x92.splice(i,1);if(!d.x92.length)delete d.x92;ST.x92sel=null;x92Refresh(true)}
document.addEventListener('click',e=>{const a=e.target.closest('[data-x92add]');if(a&&ST.ca){e.preventDefault();x92Add(a.dataset.x92add);return}
  const dl=e.target.closest('[data-x92del]');if(dl&&ST.ca){e.preventDefault();x92Del(+dl.dataset.x92del);return}
  const s=e.target.closest('[data-x92sel]');if(s&&ST.ca){e.preventDefault();ST.x92sel=+s.dataset.x92sel;x92Refresh(true)}});
document.addEventListener('input',e=>{const t=e.target.closest('[data-x92f]');if(!t||!ST.ca)return;const i=x92Sel();if(i==null)return;const x=ST.ca.x92[i];const f=t.dataset.x92f;
  if(f==='s'||f==='r'){x[f]=+t.value;const b=t.parentElement.querySelector('b');if(b)b.textContent=t.value;x92Refresh(false)}
  else if(f==='c'){x.c=x92Col(t.value,x.c);x92Refresh(false)}});
document.addEventListener('change',e=>{const t=e.target.closest('select[data-x92f="v"]');if(!t||!ST.ca)return;const i=x92Sel();if(i==null)return;const x=ST.ca.x92[i];const v=t.value;
  if(v==='house'||v.startsWith('fl:')){const fl=x92Flags().find(f=>f[0]===v);if(fl){x.v='flag';x.f={bg:fl[2].bg,fg:fl[2].fg,txt:fl[2].txt,shape:fl[2].shape};if(v.startsWith('fl:'))x.fid=v.slice(3);else delete x.fid}}
  else{x.v=v;delete x.f;delete x.fid}ST.ca.x92[i]=x92CleanOne(x);x92Refresh(true)});
/* drag on the tray preview: a click picks the extra under the pointer, a drag moves it; wheel = size, Shift+wheel = turn */
(()=>{let drag=null;const pt=(e,el,mir)=>{const sv=el.querySelector('svg');if(!sv)return null;const r=sv.getBoundingClientRect();let x=-10+(e.clientX-r.left)/r.width*120,y=-10+(e.clientY-r.top)/r.height*120;
    if(mir)x=100-x;return [x,y]};
  document.addEventListener('pointerdown',e=>{const el=e.target.closest('#x92Prev');if(!el||!ST.ca)return;const hs=document.elementsFromPoint(e.clientX,e.clientY).filter(n=>n.dataset&&n.dataset.x92i!=null);const cur=x92Sel();const h=hs.find(n=>+n.dataset.x92i===cur)||hs[0]||e.target.closest('[data-x92i]');
    if(h){ST.x92sel=+h.dataset.x92i;const x=ST.ca.x92[ST.x92sel];const mir=x92PieceSVG(ST.ca).mir;const p=pt(e,el,mir);if(p&&x)drag={el,mir,p0:p,x0:x.x,y0:x.y};x92Refresh(true);e.preventDefault()}
    else if(x92Sel()!=null){ST.x92sel=null;x92Refresh(true)}});
  document.addEventListener('pointermove',e=>{if(!drag||!ST.ca)return;const i=x92Sel();if(i==null)return;const p=pt(e,drag.el,drag.mir);if(!p)return;const x=ST.ca.x92[i];
    x.x=x92Num(drag.x0+p[0]-drag.p0[0],-20,120,50);x.y=x92Num(drag.y0+p[1]-drag.p0[1],-20,120,50);x92Refresh(false)});
  window.addEventListener('pointerup',()=>{if(drag){drag=null;x92Refresh(false)}});
  document.addEventListener('wheel',e=>{const el=e.target.closest('#x92Prev');if(!el||!ST.ca)return;const i=x92Sel();if(i==null)return;e.preventDefault();const x=ST.ca.x92[i];
    if(e.shiftKey)x.r=x92Num(x.r+(e.deltaY<0?5:-5),-180,180,0);else x.s=x92Num(x.s+(e.deltaY<0?5:-5),20,250,100);x92Refresh(true)},{passive:false})})();
/* the piece preview of a copy wearing the printed art shows the art cut-out with its extras (97 shows the plain art cell) */
function x92ArtPrevHTML(d){const P=x92PieceSVG(d);return `<div class="caartprev"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:200px;height:200px"><g${P.mir?' transform="translate(100 0) scale(-1 1)"':''}>${P.g}${x92SVG(d.x92)}</g></svg></div>`}
const x92ArtPrevOn=d=>d&&Array.isArray(d.x92)&&d.x92.length&&typeof caArtOn==='function'&&caArtOn(d)&&!!x92ArtBox(d,false);
{const base=caPrevRefresh;caPrevRefresh=function(){const r=base.apply(this,arguments);try{const d=ST.ca;if(x92ArtPrevOn(d)){const pv=document.getElementById('caPiece');if(pv)pv.innerHTML=x92ArtPrevHTML(d)}}catch(e){console.error(e)}return r}}
{const base=gearAHTML;gearAHTML=function(){let h=base.apply(this,arguments);try{const d=ST.ca;if(x92ArtPrevOn(d))h=h.replace(/(<div class="scart[^"]*" id="caPiece"[^>]*>)<div class="caartprev">[\s\S]*?<\/div>(<\/div>)/,(m,a,b)=>a+x92ArtPrevHTML(d)+b)}catch(e){console.error(e)}return h}}
/* a fresh piece starts with no extras and nothing selected; "Start from" keeps the ones already added */
{const base=blankCA;blankCA=function(){const d=base.apply(this,arguments);ST.x92sel=null;return d}}
(()=>{const st=document.createElement('style');st.textContent=`
.x92{grid-column:1/-1;border:1px solid var(--line2);border-radius:8px;padding:6px 8px;background:var(--panel2)}
.x92 .x92n{float:right;font:600 13px var(--mono);color:var(--gold2)}
.x92add{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 6px}.x92addb{display:inline-flex!important;align-items:center;gap:4px;padding:2px 8px 2px 4px!important}.x92addb svg{flex:none}
.x92body{display:grid;grid-template-columns:minmax(170px,260px) 1fr;gap:10px;align-items:start}
.x92prev{aspect-ratio:1;width:100%;min-height:0!important;height:auto!important;touch-action:none;cursor:grab}.x92prev svg{width:100%;height:100%;display:block}
.x92list{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
.x92chip{display:inline-flex;align-items:center;border:1px solid var(--line2);border-radius:14px;background:rgba(0,0,0,.18)}.x92chip.on{border-color:var(--gold);background:rgba(240,207,125,.12)}
.x92pick,.x92del{background:none;border:0;color:var(--bone);cursor:pointer;display:inline-flex;align-items:center;gap:3px;font-size:12px;padding:1px 4px}.x92pick svg{width:20px;height:20px}.x92del{color:var(--muted,#a99);padding:1px 6px 1px 2px}
.x92sel{display:grid;gap:6px}.x92sel>b{color:var(--gold2)}.x92sl input{width:100%}.x92col{display:flex!important;flex-direction:row!important;align-items:center;gap:8px}.x92col input{width:48px!important;height:26px}
.x92hint{padding:8px 0}
@media (max-width:600px){.x92body{grid-template-columns:1fr}.x92prev{max-width:240px;justify-self:center}}`;document.head.appendChild(st)})();
