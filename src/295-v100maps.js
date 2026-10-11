/* v1.0 MAP INSETS (295-v100maps; his "all 7", tools/plans/backlog.md "MAP INTEGRATION") — small empire-map insets inside existing flows.
   ONE helper `mapInset100(o)` → cached HTML: an <svg> whose viewBox crops assets/map.jpg (900×909, the same frame as 18-world's MAP_PX / 290's
   Imperium pins: city x,y in 0..1 of the map) around the cities it marks; pins, a route line, labels and an optional token drawn over it.
   Background = one cached RASTER per crop + size (`MI100.ras`: canvas cut → blob URL, made once in the idle time, http(s)/blob only — a file://
   page cannot read pixels back, so it keeps the full map scaled by the viewBox); the standalone's data: map becomes ONE blob URL (`mi100Src`),
   never repeated in the DOM. HTML strings cached per key (`MI100.html`, ≤ 240). Display only — no rules, dice, S or save change.
     1 · Match Week travel strip (244's .travelcard.strip96): home city → this week's host, curved route, host lit (`.mi100tr`).
     2 · World letters (mailLive items: the Consilium's counsel, edicts, programmata — keys `MI100_LETTERS` — or any letter carrying loc96):
         a small inset marking the city(ies) the letter names (`.mi100let`, floats right, drops under the text on phones).
     3 · Recruiting: the selected fighter's home city on his/her card (`.mi100rcard`, "Lugdunum · her home"; birthplaces beyond the 12 arenas
         use `MI100_XTRA` approximate spots; off the map = an edge arrow) + a home-city filter on the list (`select[data-rc100]`, MGR.rc100,
         rows removed like 87's MGR.rf).
     4 · The Annals Road (roadVisualHTML wrapper): the painted road svg is replaced by the REAL map — the 12 arenas in HALL_ORDER joined by the
         road, won stops ✓ green, the next one lit gold, the gladiator's token on the last arena he won (start: beside Arles); keeps id roadSvg +
         .roadtok/data-to, so 48's slide still runs; a numbered stop list beside it (`.mi100road`).
     5 · League house card (290's .wd100hc): the house's home city (`.mi100hc`).
     6 · Programmata (140 pg84SetupHTML wrapper): a map of the 12 arenas whose pins ARE city buttons (`data-pg84="city"` on svg groups → 140's
         own click handler; data-dis when three are picked); chosen pins lit, ⚔ where the league fights; the old city buttons stay.
     7 · Calendar hover (290's .wd100wk tablets, Season tab): hovering/focusing a week shows `#mi100tip` with that week's host city (fine pointers
         only; one element, moved, never per frame).
   Reduce motion / calm: the host glow does not pulse (`.mi100still`); idle92 pauses it anyway. Phones (≤600 px): insets shrink or drop under text.
   Kill switch localStorage flavius_maps100off=1. Test tv100mp; shots tools/plans/maps100/shots.js. */
const MI100={html:new Map(),ras:new Map(),rasOff:false,src:null,img:null,q:[],busy:false,
  off(){try{return localStorage.getItem('flavius_maps100off')==='1'}catch(e){return false}}};
/* birthplaces beyond the twelve arenas: approximate spots on this map (0..1; outside = beyond its edge) */
const MI100_XTRA={Carthago:[.47,.70],Ostia:[.618,.272],Neapolis:[.728,.322],Massilia:[.30,.222],Tarentum:[.905,.33],Brundisium:[.95,.31],Lugdunum:[.272,.075],
  Gades:[-.35,.66],Emerita:[-.3,.48],Corinth:[1.25,.5],Alexandria:[1.6,1.05],Antiochia:[1.9,.62],Cyrene:[1.2,.98],Londinium:[.12,-.7]};
const MI100_LETTERS=/^(consil-|fa85|pg84|emp|clos|wev|world|edict)/;
function mi100Idx(n){if(n==null)return -1;if(typeof n==='number')return LOCATIONS[n]?n:-1;return LOCATIONS.findIndex(L=>L&&L.n===n)}
/* a place → {x,y (0..1), n, off} */
function mi100Pt(p){if(p==null)return null;const i=mi100Idx(p);if(i>0){const L=LOCATIONS[i];return {x:L.x,y:L.y,n:L.n,i}}
  const X=MI100_XTRA[p];if(!X)return null;return {x:X[0],y:X[1],n:p,off:X[0]<0||X[0]>1||X[1]<0||X[1]>1}}
function mi100Src(){if(MI100.src)return MI100.src;let s=typeof assetURL==='function'?assetURL('map.jpg'):'assets/map.jpg';
  if(/^data:/.test(s)){try{const m=s.match(/^data:([^;,]+)?(;base64)?,(.*)$/);const bin=atob(m[3]);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    s=URL.createObjectURL(new Blob([u],{type:m[1]||'image/jpeg'}))}catch(e){}}
  return MI100.src=s}
/* the background: a cached raster of exactly this crop at this size, else the whole map cropped by the viewBox */
function mi100Bg(c,pw,ph){const k=[c.x,c.y,c.w,c.h,pw,ph].map(v=>Math.round(v)).join(',');const r=MI100.ras.get(k);
  if(r){MI100.ras.delete(k);MI100.ras.set(k,r);return `<image href="${r}" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" preserveAspectRatio="none"/>`}
  mi100Queue(k,c,pw,ph);return `<image href="${mi100Src()}" width="${MAPW}" height="${MAPH}"/>`}
function mi100RasOK(){if(MI100.rasOff||typeof HEADLESS!=='undefined'&&HEADLESS)return false;const s=mi100Src();return /^(blob:|data:)/.test(s)||/^https?:$/.test(location.protocol)}
function mi100Queue(k,c,pw,ph){if(!mi100RasOK()||MI100.q.some(x=>x.k===k))return;MI100.q.push({k,c,pw,ph});if(MI100.q.length>24)MI100.q.shift();mi100Pump()}
function mi100Pump(){if(MI100.busy||!MI100.q.length)return;MI100.busy=true;const go=()=>{const it=MI100.q.shift();if(!it){MI100.busy=false;return}
    const done=()=>{MI100.busy=false;if(MI100.q.length)setTimeout(mi100Pump,60)};
    try{const img=MI100.img;if(!img||!img.complete||!img.naturalWidth){if(!img){MI100.img=new Image();MI100.img.decoding='async';MI100.img.onload=()=>{MI100.busy=false;mi100Pump()};MI100.img.onerror=()=>{MI100.rasOff=true};MI100.img.src=mi100Src()}else MI100.busy=false;MI100.q.unshift(it);return}
      const d=Math.min(2,Math.max(1,window.devicePixelRatio||1));const cv=document.createElement('canvas');cv.width=Math.max(8,Math.round(it.pw*d));cv.height=Math.max(8,Math.round(it.ph*d));
      const sx=img.naturalWidth/MAPW,sy=img.naturalHeight/MAPH;const g=cv.getContext('2d');g.imageSmoothingQuality='high';
      g.drawImage(img,it.c.x*sx,it.c.y*sy,it.c.w*sx,it.c.h*sy,0,0,cv.width,cv.height);
      cv.toBlob(b=>{if(b){MI100.ras.set(it.k,URL.createObjectURL(b));while(MI100.ras.size>64){const [k0,u0]=MI100.ras.entries().next().value;MI100.ras.delete(k0);try{URL.revokeObjectURL(u0)}catch(e){}}}done()},'image/jpeg',.86)}
    catch(e){MI100.rasOff=true;MI100.busy=false}};
  if(window.requestIdleCallback)requestIdleCallback(go,{timeout:800});else setTimeout(go,30)}
/* the crop (map px) framing the points, at aspect pw/ph */
function mi100Crop(pts,pw,ph,pad,minW){const P=pts.length?pts:[{x:.5,y:.5}];const cl=v=>Math.max(0,Math.min(1,v));
  let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;for(const p of P){const x=cl(p.x)*MAPW,y=cl(p.y)*MAPH;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  const a=pw/ph;let w=Math.max(x1-x0,minW)*(1+pad*2),h=Math.max(y1-y0,minW/a)*(1+pad*2);if(w/h<a)w=h*a;else h=w/a;
  if(w>MAPW){w=MAPW;h=w/a}if(h>MAPH){h=MAPH;w=h*a}
  let cx=(x0+x1)/2-w/2,cy=(y0+y1)/2-h/2;cx=Math.max(0,Math.min(MAPW-w,cx));cy=Math.max(0,Math.min(MAPH-h,cy));return {x:cx,y:cy,w,h}}
const MI100_COL={host:'#f0cf7d',home:'#7fc7ff',sel:'#e0503a',won:'#8fc25a',next:'#f0cf7d',pin:'#ffd27a',dim:'#2a1e12',off:'#ffd27a'};
/* mapInset100(o) → HTML. o: {pts:[{p (city name|index) | x,y, k:'host'|'home'|'sel'|'won'|'next'|'pin'|'dim', lab, n (number in the pin), attrs, ic}],
   route:[place,…] (curved line through them) · roadK:'road' · frame:[places] (default: the points) · w,h (css px) · pad · minW (map px) · cls · id ·
   label (aria) · extra (raw svg over the pins) · key (cache key; default from o) · role ('img' | 'group') · labels (show names) */
function mapInset100(o){if(MI100.off())return '';o=o||{};const w=o.w||120,h=o.h||80;const still=typeof reduceMotion==='function'&&reduceMotion();
  const key=o.key?o.key+'|'+w+'x'+h+'|'+still:JSON.stringify([o.pts,o.route,o.frame,w,h,o.pad,o.minW,o.cls,o.id,o.label,o.roadK,o.labels,o.extra&&o.extra.length,still]);
  const hit=MI100.html.get(key);if(hit&&!o.extra)return hit;
  const pts=(o.pts||[]).map(q=>{const p=q.x!=null?{x:q.x,y:q.y,n:q.n||''}:mi100Pt(q.p);return p?{...q,...p,n:p.n}:null}).filter(Boolean);
  const fr=(o.frame?o.frame.map(mi100Pt).filter(Boolean):pts).filter(p=>!p.off);
  const c=mi100Crop(fr.length?fr:pts,w,h,o.pad==null?.35:o.pad,o.minW||150);const U=c.w/w;/* map px per css px */
  const XY=p=>[Math.max(0,Math.min(1,p.x))*MAPW,Math.max(0,Math.min(1,p.y))*MAPH];
  /* the route: one smooth curve through its places */
  let route='';const R=(o.route||[]).map(mi100Pt).filter(Boolean);
  if(R.length>1){const P=R.map(XY);let d=`M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
    for(let i=1;i<P.length;i++){const [x0,y0]=P[i-1],[x1,y1]=P[i];const mx=(x0+x1)/2,my=(y0+y1)/2,dx=x1-x0,dy=y1-y0;const bend=R.length===2?.18:.08;d+=` Q${(mx-dy*bend).toFixed(1)} ${(my+dx*bend).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`}
    route=o.roadK==='road'?`<path d="${d}" fill="none" stroke="#3a2a18" stroke-width="${(5*U).toFixed(1)}" stroke-linecap="round" opacity=".85"/><path d="${d}" fill="none" stroke="#e8d4a0" stroke-width="${(2.2*U).toFixed(1)}" stroke-linecap="round" stroke-dasharray="${(5*U).toFixed(1)} ${(4*U).toFixed(1)}"/>`
      :`<path d="${d}" fill="none" stroke="#1a120c" stroke-width="${(4*U).toFixed(1)}" stroke-linecap="round" opacity=".8"/><path d="${d}" fill="none" stroke="#ffe6a8" stroke-width="${(2*U).toFixed(1)}" stroke-linecap="round" stroke-dasharray="${(4*U).toFixed(1)} ${(3*U).toFixed(1)}"/>`}
  const pin=q=>{const [x,y]=XY(q);const col=MI100_COL[q.k]||MI100_COL.pin;const lit=q.k==='host'||q.k==='next'||q.k==='sel'||q.k==='pin';const r=(q.n!=null&&q.num!=null?6.5:q.k==='dim'?3.6:4.6)*U;
    let g='';if(q.off){/* beyond the map: an arrow at the edge pointing at it */const cx=c.x+c.w/2,cy=c.y+c.h/2;const tx=q.x*MAPW,ty=q.y*MAPH;const ang=Math.atan2(ty-cy,tx-cx);
      const ex=Math.max(c.x+9*U,Math.min(c.x+c.w-9*U,cx+Math.cos(ang)*c.w)),ey=Math.max(c.y+9*U,Math.min(c.y+c.h-9*U,cy+Math.sin(ang)*c.h));const s=6*U;
      g=`<g class="mi100p off"><path d="M${(ex+Math.cos(ang)*s).toFixed(1)} ${(ey+Math.sin(ang)*s).toFixed(1)} L${(ex+Math.cos(ang+2.4)*s).toFixed(1)} ${(ey+Math.sin(ang+2.4)*s).toFixed(1)} L${(ex+Math.cos(ang-2.4)*s).toFixed(1)} ${(ey+Math.sin(ang-2.4)*s).toFixed(1)}Z" fill="${col}" stroke="#1a120c" stroke-width="${(1.2*U).toFixed(1)}"/></g>`;
      return g}
    g=`<g class="mi100p k-${q.k||'pin'}"${q.attrs?' '+q.attrs:''}>${q.tip?`<title>${esc(q.tip)}</title>`:''}${lit&&!still?`<circle class="mi100glow" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r*2.3).toFixed(1)}" fill="${col}" opacity=".35"/>`:lit?`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r*2).toFixed(1)}" fill="${col}" opacity=".3"/>`:''}`+
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${col}" stroke="#1a120c" stroke-width="${(1.3*U).toFixed(1)}"/>`+
      (q.num!=null?`<text x="${x.toFixed(1)}" y="${(y+r*.42).toFixed(1)}" text-anchor="middle" font-size="${(r*1.15).toFixed(1)}" font-family="IBM Plex Mono, monospace" font-weight="700" fill="#1a120c">${q.num}</text>`:'')+
      (q.ic?`<g class="mi100i"><circle cx="${(x+r*1.5).toFixed(1)}" cy="${(y-r*1.3).toFixed(1)}" r="${(5.5*U).toFixed(1)}" fill="#1a120c" stroke="#f0cf7d" stroke-width="${(.9*U).toFixed(1)}"/><text x="${(x+r*1.5).toFixed(1)}" y="${(y-r*1.3+3*U).toFixed(1)}" text-anchor="middle" font-size="${(8.5*U).toFixed(1)}" fill="#f0cf7d">${q.ic}</text></g>`:'')+
      (q.lab?`<text class="mi100l" x="${Math.max(c.x+q.lab.length*3.2*U,Math.min(c.x+c.w-q.lab.length*3.2*U,x)).toFixed(1)}" y="${(y-r-3*U-10*U<c.y?y+r+11*U:y-r-3*U).toFixed(1)}" text-anchor="middle" font-size="${(10.5*U).toFixed(1)}" stroke-width="${(3*U).toFixed(1)}">${esc(q.lab)}</text>`:'')+`</g>`;return g};
  const order={dim:0,won:1,home:2,pin:3,sel:3,next:4,host:4};const ps=pts.slice().sort((a,b)=>(order[a.k]||3)-(order[b.k]||3));
  const html=`<span class="mi100${o.cls?' '+o.cls:''}${still?' mi100still':''}" style="--mw:${w}px;--mh:${h}px"${o.role==='group'?` role="group" aria-label="${esc(o.label||'')}"`:''}>`+
    `<svg${o.id?` id="${o.id}"`:''} class="mi100s${o.svgCls?' '+o.svgCls:''}" viewBox="${c.x.toFixed(1)} ${c.y.toFixed(1)} ${c.w.toFixed(1)} ${c.h.toFixed(1)}" preserveAspectRatio="xMidYMid slice"${o.role==='group'?'':` role="img" aria-label="${esc(o.label||(pts.map(p=>p.n).join(', ')))}"`}>`+
    `${mi100Bg(c,w,h)}<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="#1a120c" opacity=".12"/>${route}${ps.map(pin).join('')}${o.extra?o.extra(c,U,XY):''}</svg></span>`;
  if(!o.extra){MI100.html.set(key,html);if(MI100.html.size>240)MI100.html.delete(MI100.html.keys().next().value)}
  return html}

/* ---------- 1 · 3 · 5 · the Manager pages (a final mgrHTML wrapper over the finished HTML) ---------- */
function mi100Strip(T,w,m){const strip=T.content.querySelector('.travelcard.strip96,.card2.strip96');if(!strip||!w.night||w.night.bye||!LOCATIONS[w.night.loc])return;
  const host=LOCATIONS[w.night.loc].n,home=m.city;const same=!home||home===host;
  const ins=mapInset100({w:116,h:74,cls:'mi100tr',minW:120,label:same?_T`${host}: the games are at home this week`:_T`From ${home} to ${host}`,
    pts:[...(same?[]:[{p:home,k:'home',tip:_T`${home} · home`}]),{p:host,k:'host',lab:host,tip:_T`${host} · this week's games`}],route:same?null:[home,host]});
  if(ins)strip.insertAdjacentHTML('afterbegin',ins)}
function mi100Recruit(T,w,m){const rows=[...T.content.querySelectorAll('tr[data-mg="sel"][data-id]')];
  /* the home-city filter */
  if(MGR.filter!=='mine'&&rows.length){const fa=typeof freeAgents==='function'?freeAgents():[];const cnt={};for(const g of fa)if(g.city)cnt[g.city]=(cnt[g.city]||0)+1;
    const sel=MGR.rc100||'';if(sel&&!cnt[sel])MGR.rc100='';
    if(MGR.rc100)for(const r of rows){const g=gById(r.dataset.id);if(g&&!g.signed&&fa.includes(g)&&g.city!==MGR.rc100)r.remove()}
    const q=T.content.querySelector('#recQ');const opts=Object.keys(cnt).sort((a,b)=>a.localeCompare(b));
    const html=`<select class="tin mi100rc" data-rc100="" aria-label="${_T`Home city`}" title="${_T`Show fighters from one home city`}"><option value="">${_T`🗺 Every home city`}</option>${opts.map(c=>`<option value="${esc(c)}"${c===MGR.rc100?' selected':''}>${esc(c)} · ${cnt[c]}</option>`).join('')}</select>`;
    if(q)q.insertAdjacentHTML('beforebegin',html)}
  /* the card: the selected fighter's home city */
  const g=MGR.sel&&gById(MGR.sel);if(!g||!g.city)return;const col=T.content.querySelector('.mgrid > div:nth-child(2) > .card2');if(!col)return;
  const top=col.firstElementChild;if(!top||col.querySelector('.mi100rcard'))return;const P=mi100Pt(g.city);if(!P)return;
  const near=P.off?[]:LOCATIONS.map((L,i)=>L&&i).filter(i=>i&&Math.hypot(LOCATIONS[i].x-P.x,LOCATIONS[i].y-P.y)<.12);
  const ins=mapInset100({w:112,h:84,minW:170,label:_T`${g.city}: ${sx(g,_T('his'),_T('her'))} home city`,frame:P.off?[6,1,5]:[g.city],
    pts:[...near.filter(i=>LOCATIONS[i].n!==g.city).map(i=>({p:i,k:'dim'})),{p:g.city,k:'home',lab:P.off?'':g.city,tip:g.city}]});
  if(!ins)return;const box=document.createElement('div');box.className='mi100rcard';
  box.innerHTML=ins+`<small>${P.off?_T`${esc(g.city)} · beyond the map`:sx(g,_T`${esc(g.city)} · his home`,_T`${esc(g.city)} · her home`)}</small>`;
  if(top.style&&/flex/.test(top.getAttribute('style')||''))top.appendChild(box);else col.insertBefore(box,col.firstChild)}
function mi100House(T,w){const hc=T.content.querySelector('.wd100hc[data-lg90box]');if(!hc)return;const m=mgrById(hc.getAttribute('data-lg90box'));if(!m||!m.city)return;
  const ins=mapInset100({w:104,h:70,minW:150,cls:'mi100hc',label:_T`${m.ludus}: home city ${m.city}`,pts:[{p:m.city,k:'home',lab:m.city,tip:m.city}]});if(!ins)return;
  const top=hc.querySelector('.top2')||hc;top.insertAdjacentHTML('beforeend',`<div class="mi100hcw">${ins}</div>`)}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||MI100.off())return h;const tab=MGR.tab;
  if(tab!=='night'&&tab!=='recruit'&&tab!=='league')return h;const w=W_(),m=me();if(!w||!m)return h;
  if(tab==='night'&&h.indexOf('strip96')<0)return h;if(tab==='league'&&h.indexOf('wd100hc')<0)return h;
  const T=document.createElement('template');T.innerHTML=h;
  if(tab==='night')mi100Strip(T,w,m);else if(tab==='recruit')mi100Recruit(T,w,m);else mi100House(T,w);
  return T.innerHTML}catch(e){console.error(e);return h}}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('select[data-rc100]'))return;MGR.rc100=t.value;if(typeof MGR_REDRAW==='function')MGR_REDRAW()});

/* ---------- 2 · world letters ---------- */
function mi100LetterCities(L){const txt=String(L.title||'')+' '+String(L.body||'').replace(/<[^>]*>/g,' ');const out=[];
  if(L.loc96!=null&&LOCATIONS[L.loc96])out.push(LOCATIONS[L.loc96].n);
  for(const C of LOCATIONS)if(C&&!out.includes(C.n)&&new RegExp('(^|[^\\p{L}])'+C.n.replace(/ /g,'\\s+')+'($|[^\\p{L}])','u').test(txt))out.push(C.n);return out.slice(0,3)}
{const base=mailLive;mailLive=function(){const out=base.apply(this,arguments);try{if(MI100.off()||!out||!out.items)return out;
  for(const it of out.items){const L=it.letter;if(!L||it.mi100||!(MI100_LETTERS.test(L.key||'')||L.loc96!=null))continue;const cs=mi100LetterCities(L);if(!cs.length)continue;
    const ins=mapInset100({w:112,h:76,minW:170,label:_T`Map: ${cs.join(', ')}`,pts:cs.map((c,i)=>({p:c,k:i?'pin':'host',lab:c,tip:c})),route:null});
    if(ins){it.html=`<div class="mi100let">${ins}</div>`+it.html;it.mi100=1}}}catch(e){console.error(e)}return out}}

/* ---------- 4 · the Annals Road on the real map ---------- */
{const base=roadVisualHTML;roadVisualHTML=function(R,cand,old){const h=base.apply(this,arguments);try{if(MI100.off()||typeof h!=='string'||h.indexOf('id="roadSvg"')<0)return h;
  const live=R&&!R.over;const step=live?R.step:R&&R.over==='complete'?12:0;const g=R&&typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE.find(x=>x.id===R.gid):null;
  let shown=0;try{shown=+(localStorage.getItem('flavius_roadShown_'+(R&&R.gid))||0)}catch(e){}
  const order=HALL_ORDER.filter(li=>LOCATIONS[li]);const at=i=>i<0?{x:LOCATIONS[order[0]].x-.05,y:LOCATIONS[order[0]].y+.06}:LOCATIONS[order[Math.min(order.length-1,i)]];
  /* he stands on the last arena he won (start: beside the first) */
  const to=at((live?step:step)-1),from=at(Math.min(shown,live?step:step)-1);
  const face=g?portraitSVG(g.portrait,(CLASSES[g.cls]||CLASSES.soldier).color):'';
  const tok=!g?null:(c,U,XY)=>{const r=13*U;const [tx,ty]=XY(to),[fx,fy]=XY(from);return `<defs><clipPath id="mi100rf"><circle cx="0" cy="0" r="${(r*.88).toFixed(1)}"/></clipPath></defs><g class="roadtok mi100rt" data-to="${tx.toFixed(1)},${(ty-r*1.4).toFixed(1)}" style="transform:translate(${fx.toFixed(1)}px,${(fy-r*1.4).toFixed(1)}px)"><ellipse cx="0" cy="${(r*1.35).toFixed(1)}" rx="${(r*.7).toFixed(1)}" ry="${(r*.25).toFixed(1)}" fill="rgba(0,0,0,.45)"/><circle cx="0" cy="0" r="${r.toFixed(1)}" fill="#1a120c" stroke="#f0cf7d" stroke-width="${(2*U).toFixed(1)}"/><g clip-path="url(#mi100rf)"><svg x="${(-r*.88).toFixed(1)}" y="${(-r*1.05).toFixed(1)}" width="${(r*1.76).toFixed(1)}" height="${(r*2.46).toFixed(1)}" viewBox="0 0 100 140">${face.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg></g></g>`};
  const pts=order.map((li,i)=>({p:li,k:i<step?'won':live&&i===step?'next':'dim',num:i<step?'✓':i+1,n:1,tip:_T`${i+1}. ${LOCATIONS[li].n} · ${(EVENTS[LOCATIONS[li].ev]||{}).n||''}`}));
  for(const q of pts)if(q.k==='dim'){q.k='pin2'}
  const svg=mapInset100({w:300,h:330,pad:.09,minW:300,cls:'mi100rd',id:'roadSvg',svgCls:'roadsvg mi100rs',key:'road|'+(R&&R.gid)+'|'+step+'|'+shown,
    label:_T`The Road of Flavius on the map: twelve arenas, in order`,pts,route:order,roadK:'road',extra:tok});
  if(!svg)return h;
  const list=`<ol class="mi100rl">${order.map((li,i)=>{const L=LOCATIONS[li];const k=i<step?'done':live&&i===step?'next':'';return `<li class="${k}"><span class="n">${i<step?'✓':i+1}</span><b>${esc(L.n)}</b><small>${esc((EVENTS[L.ev]||{}).n||'')}</small></li>`}).join('')}</ol>`;
  const T=document.createElement('template');T.innerHTML=h;const old2=T.content.querySelector('svg#roadSvg');if(!old2)return h;
  const box=document.createElement('div');box.className='mi100road';box.innerHTML=svg+list;old2.replaceWith(box);return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- 6 · programmata: pick cities on the map ---------- */
if(typeof pg84SetupHTML==='function'){const base=pg84SetupHTML;pg84SetupHTML=function(){const h=base.apply(this,arguments);try{if(MI100.off()||typeof h!=='string')return h;
  const w=W_();const U=pg84UI();const n=U.weeks;const fx={};for(let k=0;k<n;k++){const f=pg84Fx(w,w.week+k);if(f&&!f.bye&&LOCATIONS[f.loc])fx[f.loc]=1}
  const full=U.cities.length>=PROG84.maxCities;
  const pts=LOCATIONS.map((L,i)=>L?i:null).filter(i=>i!=null).map(li=>{const on=U.cities.includes(li);
    return {p:li,k:on?'sel':'pin2',lab:on?LOCATIONS[li].n:'',ic:fx[li]?'⚔':'',tip:LOCATIONS[li].n+(fx[li]?' · ⚔':''),attrs:`data-pg84="city" data-v="${li}" role="button" style="cursor:pointer"${!on&&full?` data-dis="${_T`Three cities at most.`}"`:''}`}});
  const ins=mapInset100({w:230,h:250,pad:.05,minW:300,cls:'mi100pg',role:'group',label:_T`Pick cities on the map`,pts});if(!ins)return h;
  const T=document.createElement('template');T.innerHTML=h;const cs=T.content.querySelector('.pg84cities');if(!cs)return h;
  const wrap=document.createElement('div');wrap.className='mi100pgw';cs.replaceWith(wrap);wrap.insertAdjacentHTML('afterbegin',ins);wrap.appendChild(cs);return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- 7 · calendar hover: the week's host city ---------- */
const MI100T={el:null,at:null};
function mi100TipHide(){if(MI100T.el)MI100T.el.hidden=true;MI100T.at=null}
function mi100TipShow(wk){if(MI100.off())return;const ct=wk.querySelector('.ct');const city=ct&&ct.textContent.trim();const P=city&&mi100Pt(city);if(!P||P.off)return mi100TipHide();
  if(MI100T.at===wk&&MI100T.el&&!MI100T.el.hidden)return;MI100T.at=wk;
  let el=MI100T.el;if(!el||!el.isConnected){el=MI100T.el=document.createElement('div');el.id='mi100tip';el.setAttribute('role','tooltip');document.body.appendChild(el)}
  const host=wk.classList.contains('now');const home=me&&me()?me().city:null;
  el.innerHTML=mapInset100({w:150,h:110,minW:220,label:city,pts:[...(home&&home!==city?[{p:home,k:'home',tip:home}]:[]),{p:city,k:'host',lab:city,tip:city}]})+`<small>${esc(city)}${home===city?_T(' · your home'):''}</small>`;
  el.hidden=false;const r=wk.getBoundingClientRect();const tw=158,th=134;let x=r.left+r.width/2-tw/2,y=r.top-th-8;if(y<6)y=r.bottom+8;
  x=Math.max(6,Math.min(window.innerWidth-tw-6,x));el.style.left=x+'px';el.style.top=y+'px';el.classList.toggle('now',host)}
document.addEventListener('mouseover',e=>{const t=e.target;if(!t||!t.closest)return;const wk=t.closest('#mgrBody .wd100wk');if(wk){if(!matchMedia('(hover: hover)').matches&&!window.__mi100hover)return;mi100TipShow(wk)}else if(MI100T.at)mi100TipHide()},{passive:true}); // i18n:skip
document.addEventListener('focusin',e=>{const t=e.target;const wk=t&&t.closest&&t.closest('#mgrBody .wd100wk');if(wk)mi100TipShow(wk);else if(MI100T.at)mi100TipHide()});
document.addEventListener('scroll',()=>{if(MI100T.at)mi100TipHide()},{passive:true,capture:true});
if(typeof BUS!=='undefined'&&BUS.on)BUS.on('window.close',()=>mi100TipHide());

{const st=document.createElement('style');st.textContent=`
.mi100{display:inline-block;position:relative;width:var(--mw);height:var(--mh);max-width:100%;flex:none;border-radius:6px;overflow:hidden;line-height:0;vertical-align:middle;
  box-shadow:0 0 0 1px #c9a458,0 2px 6px #0007;background:#2a1e12}
.mi100 .mi100s{width:100%;height:100%;display:block}
.mi100 .mi100l{fill:#fff6dc;stroke:#1a120c;paint-order:stroke;font-family:var(--display,Georgia),serif;letter-spacing:.02em}
.mi100 .mi100glow{animation:mi100glow 1.8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
.mi100.mi100still .mi100glow,body.calm .mi100 .mi100glow{animation:none}
@keyframes mi100glow{from{opacity:.15}to{opacity:.55}}
@media (prefers-reduced-motion:reduce){.mi100 .mi100glow{animation:none}}
#mgrBody .strip96 .mi100tr{margin:-2px 4px -2px -6px!important}
.mi100let{float:right;margin:0 0 6px 10px;line-height:0}
.mi100rcard{display:flex;flex-direction:column;align-items:center;gap:3px;margin-left:auto;flex:none}
.mi100rcard small{font-size:11.5px;color:var(--dim,#a3907a);white-space:nowrap;line-height:1.2}
#mgrBody select.mi100rc{max-width:190px;margin-right:6px}
.mi100hcw{margin-left:auto;align-self:center;line-height:0}
.mi100road{display:flex;gap:12px;align-items:flex-start;margin:4px 0}
.mi100road .mi100rd{width:min(300px,52%);height:auto;aspect-ratio:300/330}
.mi100road .mi100rt{transition:transform 1.1s ease-in-out}
body.calm .mi100road .mi100rt{transition:none}
.mi100rl{list-style:none;margin:0;padding:0;columns:2;column-gap:14px;flex:1;min-width:0;font-size:13px}
.mi100rl li{display:flex;align-items:baseline;gap:6px;padding:2px 0;break-inside:avoid;white-space:nowrap;overflow:hidden}
.mi100rl li .n{display:inline-block;min-width:20px;text-align:center;border-radius:10px;background:#2a1e12;color:#fff3d8;font:600 11px var(--mono,monospace);padding:1px 4px;border:1px solid #c9a458}
.mi100rl li.done .n{background:#4f6a24}.mi100rl li.next .n{background:#f0cf7d;color:#1a120c}.mi100rl li.next b{color:var(--gold2,#e0b95a)}
.mi100rl li small{color:var(--dim,#a3907a);overflow:hidden;text-overflow:ellipsis}
.mi100 .k-pin2>circle{fill:#d8c39a}
.mi100pgw{display:flex;gap:10px;align-items:flex-start}
.mi100pgw .pg84cities{flex:1;min-width:0}
.mi100pg [data-pg84]:hover>circle{stroke:#fff}

#mi100tip{position:fixed;z-index:9000;width:150px;padding:4px;border-radius:8px;background:#1f1711;border:1px solid #c9a458;box-shadow:0 6px 18px #000a;pointer-events:none;text-align:center}
#mi100tip small{display:block;font:13px var(--display,Georgia);color:#fff1cf;line-height:1.5;margin-top:2px}
#mi100tip .mi100{width:100%;height:auto;aspect-ratio:150/110}
@media (max-width:600px){
 #mgrBody .strip96 .mi100tr{--mw:84px;--mh:54px}
 .mi100let{float:none;display:block;margin:6px 0 0}
 .mi100rcard .mi100{--mw:84px;--mh:62px}
 .mi100road{flex-direction:column}.mi100road .mi100rd{width:100%;max-width:320px;align-self:center}.mi100rl{columns:2;width:100%}
 .mi100pgw{flex-direction:column}.mi100pg{--mw:100%;width:100%;height:auto;aspect-ratio:230/250;max-width:300px;align-self:center}
 .mi100hcw .mi100{--mw:84px;--mh:56px}}`;document.head.appendChild(st)}
