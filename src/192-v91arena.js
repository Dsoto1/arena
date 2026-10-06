/* =====================================================================
   192-V91ARENA · v0.91 — THE ARENA LOOK (Virgilante's approved mock-up, 2026-10-06)
   =====================================================================
   DISPLAY ONLY: no rules, no dice (no rand/pickOne/rnd — hashes and fixed seeds only), never in the online hash.
   Every token style, offline / hot seat / online, turned boards (168-v89rotate): the far walls are always the two
   sides at the BACK of the screen (picked by screen y each bake), and their banners carry the real tile names of
   the rows/columns beside them (grid points through the turned center()/pt(), so the names turn with the board).
   ar91On() = the look is up: AR91.on, the stands on (STANDS), a live drawn event (not HEADLESS).

   WHAT IS DRAWN, in draw() order
   1. drawStands wrapper (before the benches) — layer 'under' (baked):
      • the STONE FOUNDATION: a ring round the sand out past the stands, near corner cut to a triangle; side faces;
        3D stairs at the left & right corners (treads, risers, closed stepped ends), a straight flight with low cheek
        walls at the near corner; stairways in the middle gap of each side;
      • near sides: the stone floor flush with the sand + the CUT-DOWN NEAR WALLS (0.16 TW, sliced red top) — all of it
        UNDER the benches, so spectators are never covered (the mock's ar91NearUnder fix).
      Ludus (beast pen S.pen76 / exhibitions S.exhib): plaster, black foundation sides, pale plaster benches (THEME
      standA/B swapped for the call, standsTex81 skipped — no wood grain).
   2. ar91Deco() — called by drawStands (16-crowd) after the benches, before the spectators — layer 'deco' (baked):
      a coloured border on the top bench of every section (its seating-chart colour) + on each FAR section a TAPESTRY
      on two poles (gold border, fringe) showing the house flag of the gladiator it cheers for (ar91FlagSrc: Manager =
      his house's flag; Play Now = the Studio character's new optional "Banner" (customChars .banner91 = 'flag:<city>'
      or 'flag:c:<id>', picked in the character designer, saved on the character — nothing new in SAVE_COLS); online =
      my own Domus colours + crest (175 d89Look/d89Crest) for my seat; everyone else / CPUs = a flag generated from the
      class colour + a device (flagURI, device by name hash)). None at the ludus.
   3. night91Sand wrapper (07-ui calls it right after the tiles) — layer 'top' (baked) + live flames:
      • the GULLY: a sunken stone channel ring 0..0.17, darkest at the wall, pale lip at the sand, 2 iron drain grates
        a side (ar91Drains() = their screen points + grid r/c in the current view, [] when the look is off);
      • the two FAR WALLS (ring 0.19, 0.36 TW, stone of this arena, thin red cap) with the letter/number BANNERS hanging
        from the cap (red, gold band, dark ink); the middle (·) slot = the FR mark on its own long dark drape with a
        full gold frame. Ludus: white plaster, a red band low on the walls, a wooden lattice rail on top with painted
        letters instead of banners;
      • FIRE TOWERS where the far walls end at the left/right corners (stone, bronze bowl) — timber-framed plaster
        wing walls at the ludus;
      • FLAVIUS'S PODIUM from the arena's top corner (stone block, cornice, SPQR hanging) with two short stone columns
        crowned by bronze fire bowls — at the ludus a small temple (red tiled roof, pediment, columns, red interior,
        lattice gate) instead;
      • faint SOOT on the stone above/behind every fire (towers and the podium's bowls; none at the ludus);
      • DAY: a blue-to-haze sky with the sun upper left and faint clouds ('destination-over', behind everything; its own
        layer keyed on the canvas size only, so zooming never re-bakes it; clouds painted at 1/8 and stretched — a canvas
        blur filter cost ~0.5 s without a GPU), a dark floor under the sand/stands gap (first thing in the 'under' layer),
        and the sun's light on the sand (warm upper left, soft shade at the rim, worn tile edges) 'source-atop'.
        NIGHT: the layers are painted BEFORE 189's grade so they take the night colour; 189 then paints its sky/torches.
      • the flames (towers + podium bowls) are drawn live AFTER the grade, flickering with 189's night91F, with a warm
        halo at night.
   4. drawFlavius wrapper: the purple banner in a stone frame behind his portrait running down into a pennant, his
      name in GOLD (flavFace's own label is turned off for the call). ZOOMED (duelCam > 1.05: pen, final duel, pinch,
      🔍) the box detaches: top centre of the canvas at its NORMAL size (TW/zoom for the call), banner but no podium.
   5. drawPot wrapper (supersedes 191's matte/chain wrapper): the Blessing pot = a squat terracotta-grey jug (pear body,
      short neck, pinched spout, one handle, incised band with ticks, matte grain — none on the Light board). The
      Golden Eagle (drawPot(..., eagle=true)) = a flat token round with the eagle medallion face (186 tok90Canvas).
   SEAT ROWS: 3 tiers; 4 in GRAND arenas (ar91Grand): Roma (loc 6, also the Superbus), Capua (loc 4), invitationals
   (S.specCtx) and tournament finals (S.tourn.final). The foundation, stairs and tapestries move out with the 4th tier.
   PER-ARENA STONE (AR91MAT by S.locIdx, custom events use their location, fallback travertine): a filter over
   assets/stone_wall.webp (soft: low contrast + a slight blur) + the cap colour; white quartz gets a light sparkle.
   VIEW: ar91View (07-ui draw) — the arena ~9% larger (6% on phones) and 0.4 TW lower; the canvas never grows past the
   space the old formula gave it, so the outer stairs may crop at the bottom.
   BAKING: the three static layers are painted once into offscreen canvases per key (canvas size, dpr, TW, origin,
   turn, N, stone, tiers, ludus, night, image loads, flags) — a frame only blits them. The Light board (lite84On)
   skips clouds, the pot grain and the quartz sparkle.
   SMALL DIRECT EDITS (wrapping impossible — values inside draw()/drawStands()): 07-ui draw() (ar91View for TW/OY/Hd;
   the floating ROWL/COLL labels skipped while ar91On()), 16-crowd drawStands (tier count ar91Tiers(), the old section
   ovals + Q1–Q4 labels skipped while ar91On(), the ar91Deco() hook before the spectators).
   ===================================================================== */
const AR91={on:true,L:{},ver:0,z:1,fires:[],walls:[],det:false,ms:[],cnt:{jug:0,eagle:0},noStatic:false /* tests: skip the baked stone layers */};
/* AR91MAT — each arena's stone: a canvas filter over his stone texture + the cap colour (q = quartz sparkle) */
const AR91MAT={1:{n:'Greek limestone',f:'sepia(.25) saturate(.8) brightness(1.2) contrast(.6)',cap:'#e3d9c2'},
  2:{n:'Rose marble',f:'sepia(.45) saturate(1.3) hue-rotate(-28deg) brightness(1.08) contrast(.6)',cap:'#e2c3b6'},
  3:{n:'Honey raw sienna',f:'sepia(.75) saturate(1.7) hue-rotate(-4deg) brightness(.98) contrast(.62)',cap:'#d9b77c'},
  4:{n:'Dark basalt',f:'grayscale(1) brightness(.66) contrast(.8)',cap:'#7a7672'},
  5:{n:'Burnt sienna',f:'sepia(.85) saturate(2.1) hue-rotate(-22deg) brightness(.7) contrast(.72)',cap:'#a5674a'},
  6:{n:'Travertine',f:'sepia(.38) saturate(.95) brightness(1.14) contrast(.58)',cap:'#e4d6b8'},
  7:{n:'Grey-green stone',f:'grayscale(.6) sepia(.3) hue-rotate(55deg) saturate(.8) brightness(.95) contrast(.65)',cap:'#b7bba6'},
  8:{n:'Volcanic ash',f:'grayscale(.85) sepia(.15) brightness(.78) contrast(.7)',cap:'#9d958b'},
  9:{n:'White quartz',f:'grayscale(.95) brightness(1.34) contrast(.52)',cap:'#efebe3',q:1},
  10:{n:'Red sandstone',f:'sepia(.8) saturate(2) hue-rotate(-35deg) brightness(.85) contrast(.68)',cap:'#c08070'},
  11:{n:'Sea-bleached limestone',f:'grayscale(.75) sepia(.1) brightness(1.28) contrast(.55)',cap:'#e6e4dc'},
  12:{n:'Yellow tuff',f:'sepia(.7) saturate(1.5) hue-rotate(8deg) brightness(1.05) contrast(.6)',cap:'#dccb8c'}};
const AR91LUD={n:'Plaster',f:'grayscale(1) brightness(1.75) contrast(.3)',cap:'#efe9dd'};
const AR91RED='#a8322c',AR91GOLD='#d8b25a';
/* ar91On — is the arena look up for the event on screen? */
function ar91On(){try{return !!(AR91.on&&typeof S!=='undefined'&&S&&!HEADLESS&&STANDS)}catch(e){return false}}
/* ar91Lud — a private ludus bout (beast pen / exhibition): the plaster variant */
function ar91Lud(){return typeof S!=='undefined'&&!!S&&!!(S.pen76||S.exhib)}
/* ar91Grand — the great arenas: 4 tiers of benches */
function ar91Grand(){try{if(!S||ar91Lud())return false;const li=S.locIdx;if(li===6||li===4)return true;if(S.specCtx)return true;if(S.tourn&&S.tourn.final)return true;return false}catch(e){return false}}
/* ar91Tiers — rows of benches (16-crowd drawStands) */
function ar91Tiers(){return ar91On()&&ar91Grand()?4:3}
const ar91Ex=()=>ar91Tiers()>3?0.47:0;
/* ar91Mat — this arena's stone */
function ar91Mat(){if(ar91Lud())return AR91LUD;let k=null;try{k=S&&S.locIdx}catch(e){}return AR91MAT[k]||AR91MAT[6]}
/* ar91View — the board's size and place (07-ui draw); null = the old formula */
function ar91View(mob){if(!ar91On())return null;return {kw:mob?1.06:1.09,kh:1.08,dy:0.4,hd:(oy,fitH)=>{const full=Math.ceil(oy+N*TW/2+TW*2.1);const old=Math.ceil(TW*10.9);return Math.min(full,Math.max(old,Math.ceil(fitH)))}}}
/* the duel camera's zoom, remembered for the box (draw() asks duelCam once a frame) */
if(typeof duelCam==='function'){const base=duelCam;duelCam=function(){const z=base.apply(this,arguments);AR91.z=z||1;return z}}

/* ---------- images ---------- */
const AR91IMG={};
function ar91Img(src){let im=AR91IMG[src];if(!im){im=new Image();im.onload=()=>{AR91.ver++;try{if(!HEADLESS)draw()}catch(e){}};im.src=src;AR91IMG[src]=im}return im.complete&&im.naturalWidth?im:null}
const ar91Asset=f=>typeof assetURL==='function'?assetURL(f):'assets/'+f;
/* ar91Tex — this stone as a filtered texture canvas (null while the image loads) */
const AR91TEX={};
function ar91Tex(){const M=ar91Mat();const lite=typeof lite84On==='function'&&lite84On();const k=M.n+(lite?'|l':'');if(AR91TEX[k])return AR91TEX[k];
  const im=ar91Img(ar91Asset('stone_wall.webp'));if(!im)return null;const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');
  try{g.filter=M.f+' blur(.8px)'}catch(e){}g.drawImage(im,0,0);try{g.filter='none'}catch(e){}
  if(M.q&&!lite){let q=7;const rn=()=>{q=(q*16807)%2147483647;return q/2147483647};for(let i=0;i<150;i++){g.fillStyle=`rgba(255,255,255,${(0.25+rn()*0.35).toFixed(2)})`;g.fillRect(rn()*c.width,rn()*c.height,1.2,1.2)}}
  AR91TEX[k]=c;return c}

/* ---------- drawing helpers (g = the layer's context) ---------- */
let AR91PAT=null; /* the pattern of the layer being painted */
function ar91Fill(g,scale){if(AR91PAT){try{AR91PAT.setTransform(new DOMMatrix().scale((scale||1)*TW*0.9/170))}catch(e){}g.fillStyle=AR91PAT}else g.fillStyle=ar91Mat().cap}
function ar91Path(g,Q){g.beginPath();Q.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath()}
function ar91Stone(g,Q,shadeA,scale){ar91Path(g,Q);ar91Fill(g,scale);g.fill();if(shadeA){g.fillStyle=shadeA;g.fill()}}
function ar91Ring(k){const P=center;const n=N-1,e0=-0.5,e1=n+0.5;return [P(e0-k,e0-k),P(e0-k,e1+k),P(e1+k,e1+k),P(e1+k,e0-k)]}
function ar91Mid(){const n=N-1,a=center(0,0),b=center(n,n);return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
/* ar91Edges — the four sides at ring k, with which are far (upper on screen) */
function ar91Edges(k){const C=ar91Ring(k),mid=ar91Mid();return [[0,1],[1,2],[2,3],[3,0]].map(([a,b])=>({a:C[a],b:C[b],ia:a,ib:b,my:(C[a].y+C[b].y)/2,mx:(C[a].x+C[b].x)/2,far:(C[a].y+C[b].y)/2<mid.y}))}
/* ar91Soot — a soft dark smudge on the stone above and behind a fire (baked) */
function ar91Soot(g,x,y,r){const gr=g.createRadialGradient(x,y-r*0.55,0,x,y-r*0.55,r);gr.addColorStop(0,'rgba(18,12,8,.26)');gr.addColorStop(.55,'rgba(18,12,8,.1)');gr.addColorStop(1,'rgba(18,12,8,0)');
  g.save();g.translate(x,y-r*0.55);g.scale(0.7,1);g.translate(-x,-(y-r*0.55));g.fillStyle=gr;g.fillRect(x-r,y-r*1.6,r*2,r*2.1);g.restore()}

/* ---------- layer 'under': the foundation + the near sides (under the benches) ---------- */
function ar91Under(g){if(!night91On())ar91Floor(g);const Pq=pt;const n=N-1;const EX=ar91Ex();const lud=ar91Lud();const lo=-2.95-EX,hi=n+2.95+EX,inn=-0.62,inn2=n+0.62;
  const O=[Pq(lo,lo),Pq(lo,hi),Pq(hi,hi),Pq(hi,lo)],I=[Pq(inn,inn),Pq(inn,inn2),Pq(inn2,inn2),Pq(inn2,inn)];
  const bi=O.reduce((b,p,i)=>p.y>O[b].y?i:b,0);const cIn=I[bi];const cMid={x:(O[bi].x+cIn.x)/2,y:(O[bi].y+cIn.y)/2};
  const cut=(p,q)=>{const t=(cMid.y-p.y)/(q.y-p.y);return {x:p.x+(q.x-p.x)*t,y:cMid.y}};
  const prev=O[(bi+3)%4],next=O[(bi+1)%4];const OO=[];O.forEach((p,i)=>{if(i===bi)OO.push(cut(prev,p),cut(next,p));else OO.push(p)});
  /* the side faces under the front edges */
  const h=TW*0.3;for(let i=0;i<OO.length;i++){const p=OO[i],q=OO[(i+1)%OO.length];if(Math.max(p.y,q.y)<cMid.y-TW*2&&!(Math.abs(p.y-q.y)<1))continue;
    const F=[p,q,{x:q.x,y:q.y+h},{x:p.x,y:p.y+h}];if(lud){g.fillStyle='#1c1a18';ar91Path(g,F);g.fill();continue}
    ar91Stone(g,F,Math.abs(p.y-q.y)<1?'rgba(30,20,10,.35)':(p.x<q.x)===(p.y<q.y)?'rgba(30,20,10,.42)':'rgba(30,20,10,.22)',0.8)}
  /* stairs at the left and right corners: treads, risers, closed stepped ends */
  {const cx0=(O[0].x+O[2].x)/2;const nst=5,dh=h/nst,run=TW*0.12;
    const li=OO.reduce((b,p,i)=>p.x<OO[b].x?i:b,0),ri=OO.reduce((b,p,i)=>p.x>OO[b].x?i:b,0);
    for(const vi of [li,ri]){const V=OO[vi],A=OO[(vi+OO.length-1)%OO.length],B=OO[(vi+1)%OO.length];const W=TW*1.5;const ox=Math.sign(V.x-cx0);
      const u=P2=>{const d=Math.hypot(P2.x-V.x,P2.y-V.y)||1;return {x:(P2.x-V.x)/d,y:(P2.y-V.y)/d}};const e1=u(A),e2=u(B);
      const at=(k,lv)=>{const dx=ox*run*k,dy=dh*lv;return [{x:V.x+e1.x*W+dx,y:V.y+e1.y*W+dy},{x:V.x+dx,y:V.y+dy},{x:V.x+e2.x*W+dx,y:V.y+e2.y*W+dy}]};
      for(const side of [0,2]){const prof=[];for(let k=0;k<=nst;k++){const a=at(k,k)[side];if(k>0)prof.push(at(k,k-1)[side]);prof.push(a)}
        const e=side===0?e1:e2;const foot={x:V.x+e.x*W,y:V.y+e.y*W+h};ar91Stone(g,[...prof,foot],'rgba(30,20,10,.38)',0.6)}
      for(let k=1;k<=nst;k++){const t0=at(k-1,k-1),t1=at(k,k-1),r1=at(k,k);
        ar91Stone(g,[t0[0],t0[1],t0[2],t1[2],t1[1],t1[0]],'rgba(255,248,230,.08)',0.6);
        ar91Stone(g,[t1[0],t1[1],r1[1],r1[0]],'rgba(30,20,10,.34)',0.6);ar91Stone(g,[t1[1],t1[2],r1[2],r1[1]],'rgba(30,20,10,.2)',0.6);
        g.strokeStyle='rgba(40,28,16,.4)';g.lineWidth=1;g.beginPath();g.moveTo(t1[0].x,t1[0].y);g.lineTo(t1[1].x,t1[1].y);g.lineTo(t1[2].x,t1[2].y);g.stroke()}}
    /* the near (cut) corner: a straight flight with low cheek walls */
    {const p0=OO[bi],q0=OO[(bi+1)%OO.length];const p=p0.x<q0.x?p0:q0,q=p0.x<q0.x?q0:p0;const ns=4,dep=TW*0.09,ris=h/ns;let y=p.y-TW*0.02;const xl=p.x+TW*0.35,xr=q.x-TW*0.35;
      for(let k=0;k<ns;k++){const y1=y+dep;
        ar91Stone(g,[{x:xl,y},{x:xr,y},{x:xr,y:y1},{x:xl,y:y1}],'rgba(255,250,236,.3)',0.6);
        ar91Stone(g,[{x:xl,y:y1},{x:xr,y:y1},{x:xr,y:y1+ris},{x:xl,y:y1+ris}],'rgba(30,20,10,.5)',0.6);
        g.strokeStyle='rgba(40,28,16,.5)';g.lineWidth=1;g.beginPath();g.moveTo(xl,y1);g.lineTo(xr,y1);g.stroke();y=y1+ris}
      const yb=y;for(const [x0,sg] of [[xl,-1],[xr,1]]){ar91Stone(g,[{x:x0,y:p.y-TW*0.04},{x:x0+sg*TW*0.12,y:p.y+TW*0.02},{x:x0+sg*TW*0.12,y:yb+TW*0.06},{x:x0,y:yb}],'rgba(30,20,10,.3)',0.6);
        ar91Stone(g,[{x:x0,y:p.y-TW*0.1},{x:x0+sg*TW*0.12,y:p.y-TW*0.04},{x:x0+sg*TW*0.12,y:p.y+TW*0.02},{x:x0,y:p.y-TW*0.04}],'rgba(255,250,236,.2)',0.6)}}}
  /* the top: the ring between the outline and the sand's surround */
  g.save();g.beginPath();OO.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();I.slice().reverse().forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();
  ar91Fill(g,1);g.fill('evenodd');g.fillStyle='rgba(60,45,30,.10)';g.fill('evenodd');g.restore();
  /* stairways in the middle gap of each side */
  const A0=6.28,A1=6.72,D0=-0.62,D1=-2.95-EX;
  for(const q of [(d,a)=>[d,a],(d,a)=>[n-d,a],(d,a)=>[a,d],(d,a)=>[a,n-d]])for(let k=0;k<=10;k++){const d=D0+(D1-D0)*k/10;const p0=Pq(...q(d,A0-0.15)),p1=Pq(...q(d,A1+0.15));
    g.strokeStyle='rgba(60,44,28,.38)';g.lineWidth=Math.max(1,TW*0.025);g.beginPath();g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y);g.stroke();
    g.strokeStyle='rgba(255,250,236,.3)';g.lineWidth=1;g.beginPath();g.moveTo(p0.x,p0.y-1.5);g.lineTo(p1.x,p1.y-1.5);g.stroke()}
  /* the near sides: the stone floor flush with the sand out to the stands, then the cut-down near walls */
  const mid=ar91Mid();const Ci=ar91Ring(0.2),Co=ar91Ring(0.95);
  for(const [i,j] of [[0,1],[1,2],[2,3],[3,0]]){if((Ci[i].y+Ci[j].y)/2<mid.y)continue;ar91Stone(g,[Ci[i],Ci[j],Co[j],Co[i]],'rgba(60,45,30,.12)')}
  const Hc=TW*0.16;for(const E of ar91Edges(0.19).filter(E=>!E.far)){let a=E.a,b=E.b;if(a.x>b.x){const t=a;a=b;b=t}const left=E.mx<mid.x;
    ar91Stone(g,[{x:a.x,y:a.y},{x:b.x,y:b.y},{x:b.x,y:b.y+Hc},{x:a.x,y:a.y+Hc}],left?'rgba(255,248,230,.04)':'rgba(40,28,16,.28)');
    if(lud){g.fillStyle=AR91RED;ar91Path(g,[{x:a.x,y:a.y+Hc*0.45},{x:b.x,y:b.y+Hc*0.45},{x:b.x,y:b.y+Hc},{x:a.x,y:a.y+Hc}]);g.fill()}
    const ia={x:a.x+(mid.x-a.x)*0.012,y:a.y+(mid.y-a.y)*0.012},ib={x:b.x+(mid.x-b.x)*0.012,y:b.y+(mid.y-b.y)*0.012};
    g.fillStyle='#a8352f';ar91Path(g,[ia,ib,b,a]);g.fill();
    g.strokeStyle='rgba(255,248,230,.45)';g.lineWidth=1;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
    g.strokeStyle='rgba(30,20,10,.5)';g.beginPath();g.moveTo(a.x,a.y+Hc);g.lineTo(b.x,b.y+Hc);g.stroke()}}

/* ---------- layer 'deco': section borders + tapestries (after the benches, under the spectators) ---------- */
const AR91GEN={};
/* ar91FlagSrc — the banner image source for the gladiator a section cheers for */
function ar91FlagSrc(si){const p=typeof secPlayer==='function'?secPlayer(si):null;const col=p&&CLASSES[p.cls]&&CLASSES[p.cls].color||secColor(si);
  try{if(p&&p.mgrGid&&typeof gById==='function'&&typeof MGR!=='undefined'&&MGR.world){const gl=gById(p.mgrGid);const m=gl&&gl.contract&&typeof mgrById==='function'?mgrById(gl.contract.mgr):null;if(m){const u=houseFlagURI(mgrFlagOf(m));if(u)return u}}}catch(e){}
  try{if(p&&String(p.cls).startsWith('cc_')&&typeof CUSTOM!=='undefined'){const ch=(CUSTOM.chars||[]).find(c=>'cc_'+c.id===p.cls);const k=ch&&ch.banner91;if(k&&String(k).startsWith('flag:')){const u=flagURIk(String(k).slice(5));if(u)return u}}}catch(e){}
  try{if(p&&S.onl&&S.onl.seat===p.id&&typeof d89Look==='function'&&typeof ONL!=='undefined'&&ONL.domus){const u=d89Crest(d89Look());if(u)return u}}catch(e){}
  const k=(p?p.name:'s'+si)+'|'+col;if(AR91GEN[k])return AR91GEN[k];
  const sh=FLAG_SHAPES[Math.abs(hashStr(k))%FLAG_SHAPES.length];try{return (AR91GEN[k]=flagURI(shade(col,-0.15),'#f3dc9a','',sh))}catch(e){return null}}
function ar91DecoKey(){if(ar91Lud())return 'lud';let s='';for(let si=0;si<8;si++){const u=ar91FlagSrc(si)||'';s+=u.length+':'+hashStr(u.slice(-200))+',';}return s}
function ar91DecoPaint(g){if(ar91Lud())return;const n=N-1;const mid=pt(n/2,n/2);const T4=ar91Tiers()>3;
  for(let si=0;si<8;si++){const S8=SECTIONS[si];const col=secColor(si);
    const TT=T4?3:2;const Q=secQuad(si,1.35+TT*0.47,1.82+TT*0.47).map(([r,c])=>pt(r,c)).map(p=>({x:p.x,y:p.y-TT*TW*0.08}));
    g.save();g.strokeStyle='rgba(20,12,6,.6)';g.lineWidth=Math.max(3,TW*0.085);g.lineCap='butt';g.beginPath();g.moveTo(Q[2].x,Q[2].y);g.lineTo(Q[3].x,Q[3].y);g.stroke();
    g.strokeStyle=col;g.lineWidth=Math.max(2,TW*0.06);g.beginPath();g.moveTo(Q[2].x,Q[2].y);g.lineTo(Q[3].x,Q[3].y);g.stroke();g.restore();
    const a0=S8.half?6.8:0.45,a1=S8.half?12.55:6.2;const at=(d,a)=>S8.edge==='top'?pt(-d,a):S8.edge==='bottom'?pt(n+d,a):S8.edge==='left'?pt(a,-d):pt(a,n+d);
    if(at(2,(a0+a1)/2).y>mid.y)continue;
    const am=(a0+a1)/2,w=1.25;const dT=T4?3.39:2.92;const pL=at(dT,am-w/2),pR=at(dT,am+w/2);const up=TW*1.05;
    g.save();g.strokeStyle='#4a321c';g.lineWidth=Math.max(1.5,TW*0.035);for(const p of [pL,pR]){g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x,p.y-up);g.stroke();g.fillStyle='#c9a24e';g.beginPath();g.arc(p.x,p.y-up,TW*0.035,0,Math.PI*2);g.fill()}
    g.strokeStyle='#5a3e22';g.lineWidth=Math.max(1.5,TW*0.03);g.beginPath();g.moveTo(pL.x,pL.y-up*0.95);g.lineTo(pR.x,pR.y-up*0.95);g.stroke();
    const A={x:pL.x+(pR.x-pL.x)*0.06,y:pL.y+(pR.y-pL.y)*0.06-up*0.93},B={x:pL.x+(pR.x-pL.x)*0.94,y:pL.y+(pR.y-pL.y)*0.94-up*0.93};const len=up*0.62;
    g.translate(A.x,A.y);g.transform((B.x-A.x)/100,(B.y-A.y)/100,0,1,0,0);
    g.fillStyle=shade(col,-0.35);g.fillRect(0,0,100,len);g.fillStyle='#c9a24e';g.fillRect(3,3,94,len-6);g.fillStyle=shade(col,-0.1);g.fillRect(7,7,86,len-14);
    for(let k=0;k<6;k++){g.fillStyle=shade(col,-0.35);g.beginPath();g.arc(5,8+k*(len-16)/5,1.6,0,Math.PI*2);g.fill();g.beginPath();g.arc(95,8+k*(len-16)/5,1.6,0,Math.PI*2);g.fill()}
    const src=ar91FlagSrc(si);const fl=src?ar91Img(src):null;if(fl){const fw=76,fh=Math.min(len-22,fw*fl.naturalHeight/fl.naturalWidth);g.drawImage(fl,12,11,fw,fh)}
    g.strokeStyle='#c9a24e';g.lineWidth=0.9;for(let x=4;x<=96;x+=4){g.beginPath();g.moveTo(x,len);g.lineTo(x,len+4);g.stroke()}
    g.restore()}}

/* ---------- layer 'top': gully, far walls + banners, towers, podium / temple, soot ---------- */
function ar91Banner(g,x,y,w,h,txt){g.save();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(x-w/2+2,y+2);g.lineTo(x+w/2+2,y+2);g.lineTo(x+w/2+2,y+h-w/2+2);g.arc(x+2,y+h-w/2+2,w/2,0,Math.PI);g.closePath();g.fill();
  const gr=g.createLinearGradient(x-w/2,0,x+w/2,0);gr.addColorStop(0,'#c0473f');gr.addColorStop(.5,'#a8322c');gr.addColorStop(1,'#7e211d');
  g.fillStyle=gr;g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x+w/2,y);g.lineTo(x+w/2,y+h-w/2);g.arc(x,y+h-w/2,w/2,0,Math.PI);g.closePath();g.fill();
  g.strokeStyle='rgba(40,8,6,.7)';g.lineWidth=1;g.beginPath();g.moveTo(x-w/2,y+1);g.lineTo(x-w/2,y+h-w/2);g.arc(x,y+h-w/2,w/2,Math.PI,0,true);g.lineTo(x+w/2,y+1);g.stroke();
  g.fillStyle=AR91GOLD;g.fillRect(x-w/2,y+h*0.13,w,Math.max(1.5,h*0.06));
  g.fillStyle='#2a0d0a';g.font=`700 ${Math.round(w*(String(txt).length>1?0.5:0.62))}px "Marcellus SC", serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,x,y+h*0.58);g.restore()}
function ar91Drape(g,x,y,w,h){g.save();g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x-w/2+2,y+2,w,h);
  const gr=g.createLinearGradient(x-w/2,0,x+w/2,0);gr.addColorStop(0,'#2b1f1a');gr.addColorStop(.5,'#1a1210');gr.addColorStop(1,'#120c0a');g.fillStyle=gr;
  g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x+w/2,y);g.lineTo(x+w/2,y+h);g.lineTo(x+w*0.18,y+h-w*0.12);g.lineTo(x,y+h);g.lineTo(x-w*0.18,y+h-w*0.12);g.lineTo(x-w/2,y+h);g.closePath();g.fill();
  g.strokeStyle='#c9a24e';g.lineWidth=Math.max(1,w*0.05);g.stroke();g.fillStyle='#c9a24e';g.fillRect(x-w/2,y,w,Math.max(2,w*0.09));
  const im=ar91Img(ar91Asset('fr_icon.png'));if(im){const s2=w*0.76,ly=y+w*0.2;g.fillStyle='#0d0907';g.fillRect(x-s2/2-1,ly-1,s2+2,s2+2);g.drawImage(im,x-s2/2,ly,s2,s2);g.strokeStyle=AR91GOLD;g.lineWidth=Math.max(1.2,w*0.05);g.strokeRect(x-s2/2-w*0.04,ly-w*0.04,s2+w*0.08,s2+w*0.08)}g.restore()}
/* ar91Labels — the tile names on each side, at their grid points (turned with the board) */
function ar91Labels(){const P=center;const n=N-1,e0=-0.5,e1=n+0.5;const lab=[];for(let r=0;r<N;r++)lab.push({t:ROWL[r],p:P(r,e0-0.3)},{t:ROWL[r],p:P(r,e1+0.3)});for(let c=0;c<N;c++)lab.push({t:COLL[c],p:P(e0-0.3,c)},{t:COLL[c],p:P(e1+0.3,c)});return lab}
/* ar91DrainsAt — the grates (grid r/c in the gully) */
function ar91DrainsAt(){const n=N-1,m0=0.085;return [[-0.5-m0,n*0.25,1],[-0.5-m0,n*0.75,1],[n+0.5+m0,n*0.25,1],[n+0.5+m0,n*0.75,1],[n*0.25,-0.5-m0,0],[n*0.75,-0.5-m0,0],[n*0.25,n+0.5+m0,0],[n*0.75,n+0.5+m0,0]]}
/* ar91Drains — the drain grates in the current view: [{x,y,r,c}] (screen point, real grid r/c); [] when the look is off */
function ar91Drains(){if(!ar91On())return [];return ar91DrainsAt().map(([r,c])=>{const m=center(r,c);return {x:m.x,y:m.y,r,c}})}
function ar91Tower(g,x,y,fires){const lud=ar91Lud();if(lud){const s=TW*0.42,hh=TW*0.55;const L=[{x:x-s,y:y-s*0.5},{x,y},{x,y:y-hh},{x:x-s,y:y-s*0.5-hh}],R=[{x:x+s,y:y-s*0.5},{x,y},{x,y:y-hh},{x:x+s,y:y-s*0.5-hh}];
    const m=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
    for(const [Q,sh] of [[L,'#e9e2d2'],[R,'#cfc6b2']]){g.fillStyle=sh;ar91Path(g,Q);g.fill();g.strokeStyle='#7a5532';g.lineWidth=Math.max(1.5,TW*0.04);g.stroke();g.lineWidth=Math.max(1,TW*0.028);g.beginPath();
      for(const t of [1/3,2/3]){const p0=m(Q[0],Q[1],t),p1=m(Q[3],Q[2],t);g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y)}const h0=m(Q[0],Q[3],.5),h1=m(Q[1],Q[2],.5);g.moveTo(h0.x,h0.y);g.lineTo(h1.x,h1.y);g.stroke()}
    g.fillStyle='#d9cfb8';ar91Path(g,[{x,y:y-hh},{x:x+s,y:y-s*0.5-hh},{x,y:y-s-hh},{x:x-s,y:y-s*0.5-hh}]);g.fill();return}
  const s=TW*0.24,hh=TW*0.72;
  g.fillStyle='rgba(20,12,4,.28)';g.save();g.translate(x+TW*0.2,y+TW*0.06);g.scale(1,0.42);g.beginPath();g.arc(0,0,s*1.4,0,Math.PI*2);g.fill();g.restore();
  const L=[{x:x-s,y:y-s*0.5},{x,y},{x,y:y-hh},{x:x-s,y:y-s*0.5-hh}],R=[{x:x+s,y:y-s*0.5},{x,y},{x,y:y-hh},{x:x+s,y:y-s*0.5-hh}];
  ar91Stone(g,L,'rgba(255,248,230,.05)',0.7);ar91Stone(g,R,'rgba(40,28,16,.3)',0.7);
  const ct=y-hh-s*0.5;ar91Soot(g,x,ct+TW*0.02,TW*0.32);
  g.strokeStyle='rgba(40,30,20,.4)';g.lineWidth=1;for(const Q of [L,R]){ar91Path(g,Q);g.stroke()}
  g.fillStyle=ar91Mat().cap;ar91Path(g,[{x,y:ct+s*0.5+TW*0.02},{x:x+s*1.1,y:ct},{x,y:ct-s*0.55},{x:x-s*1.1,y:ct}]);g.fill();g.strokeStyle='rgba(40,30,20,.45)';g.stroke();
  const bw=s*0.72,by=ct-TW*0.04;const bg=g.createLinearGradient(x-bw,0,x+bw,0);bg.addColorStop(0,'#c9944a');bg.addColorStop(.5,'#9c6a2c');bg.addColorStop(1,'#5a3a16');
  g.fillStyle=bg;g.beginPath();g.moveTo(x-bw,by);g.quadraticCurveTo(x,by+TW*0.2,x+bw,by);g.closePath();g.fill();g.fillStyle='#2a1808';g.beginPath();g.ellipse(x,by,bw,TW*0.05,0,0,Math.PI*2);g.fill();
  fires.push({x,y:by,h:TW*0.34,w:TW*0.13})}
/* ar91Podium — Flavius's stone podium with its column fire bowls (attached box only) */
function ar91Podium(g,fires){if(typeof flavXY89!=='function')return;const F=flavXY89();const bx=F.cx,y=F.cy,w=F.w,h=F.h;
  const base=isoFix(-1.4,-1.4);const by=base.y+TH/2;const top=y+h/2+TW*0.3;const s2=w*0.62;if(by<top+TW*0.2)return;
  const L=[{x:bx-s2,y:by-s2*0.5},{x:bx,y:by},{x:bx,y:top+s2*0.5},{x:bx-s2,y:top}],R=[{x:bx+s2,y:by-s2*0.5},{x:bx,y:by},{x:bx,y:top+s2*0.5},{x:bx+s2,y:top}];
  ar91Stone(g,L,'rgba(255,248,230,.05)',0.7);ar91Stone(g,R,'rgba(40,28,16,.3)',0.7);g.strokeStyle='rgba(40,30,20,.45)';g.lineWidth=1;for(const Q of [L,R]){ar91Path(g,Q);g.stroke()}
  g.fillStyle=ar91Mat().cap;ar91Path(g,[{x:bx-s2*1.04,y:top-1},{x:bx,y:top+s2*0.52},{x:bx+s2*1.04,y:top-1},{x:bx+s2*1.04,y:top+TW*0.05},{x:bx,y:top+s2*0.52+TW*0.06},{x:bx-s2*1.04,y:top+TW*0.05}]);g.fill();g.stroke();
  const hw=w*0.24,hy=top+s2*0.5+TW*0.08,hl=Math.min(by-hy-TW*0.15,h*0.9);if(hl>TW*0.3){g.fillStyle='#4a1d44';ar91Path(g,[{x:bx-hw,y:hy},{x:bx+hw,y:hy},{x:bx+hw,y:hy+hl},{x:bx,y:hy+hl+hw*0.5},{x:bx-hw,y:hy+hl}]);g.fill();
    g.strokeStyle='#c9a24e';g.lineWidth=Math.max(1.2,TW*0.035);g.stroke();if(hw*0.9>=7){g.fillStyle=AR91GOLD;g.font=`700 ${Math.round(hw*0.9)}px "Marcellus SC", serif`;g.textAlign="center";g.textBaseline="middle";g.fillText("SPQR",bx,hy+hl*0.42)}}
  for(const sx of [-1,1]){const cx=bx+sx*(w/2+TW*0.17),cw=TW*0.085,c0=top+TW*0.02,ch=h*0.62;
    ar91Stone(g,[{x:cx-cw,y:c0},{x:cx+cw,y:c0},{x:cx+cw,y:c0-ch},{x:cx-cw,y:c0-ch}],null,0.5);
    const gr=g.createLinearGradient(cx-cw,0,cx+cw,0);gr.addColorStop(0,'rgba(255,250,240,.18)');gr.addColorStop(.5,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(30,20,10,.35)');g.fillStyle=gr;g.fillRect(cx-cw,c0-ch,cw*2,ch);
    g.fillStyle=ar91Mat().cap;g.fillRect(cx-cw*1.5,c0-ch-TW*0.05,cw*3,TW*0.06);g.fillRect(cx-cw*1.5,c0-TW*0.03,cw*3,TW*0.05);
    const ey=c0-ch-TW*0.05,bw=TW*0.13;ar91Soot(g,cx,ey,TW*0.22);
    const bg=g.createLinearGradient(cx-bw,0,cx+bw,0);bg.addColorStop(0,'#c9944a');bg.addColorStop(.5,'#9c6a2c');bg.addColorStop(1,'#5a3a16');
    g.fillStyle=bg;g.beginPath();g.moveTo(cx-bw,ey);g.quadraticCurveTo(cx,ey+TW*0.13,cx+bw,ey);g.closePath();g.fill();g.fillStyle='#2a1808';g.beginPath();g.ellipse(cx,ey,bw,TW*0.03,0,0,Math.PI*2);g.fill();
    fires.push({x:cx,y:ey,h:TW*0.24,w:TW*0.09})}}
/* ar91Temple — the ludus's little temple where the emperor's box would be */
/* ar91Anchor — where the box would sit on its podium: flavXY89 unzoomed; zoomed, the same spot carried with the board (world) */
function ar91Anchor(){const k=typeof flavK==='function'?flavK():1;if(!ar91Zoomed()&&typeof flavXY89==='function')return flavXY89();
  const w=TW*1.55*k,h=TW*1.2*k;const a=isoFix(0,0);return {cx:a.x,cy:a.y-TW*2.7+h/2+6*(AR91.z||1),w,h}}
function ar91Temple(g){const F=ar91Anchor();const x=F.cx,w=F.w*0.9,h=F.h*0.8,y=F.cy+F.h*0.35;const top=y+h/2+TW*0.12;
  const gw=w*0.3,gy=top+TW*0.05,gh=TW*0.5;g.fillStyle='#efe9dd';g.fillRect(x-w*0.62,top-TW*0.02,w*1.24,gh+TW*0.12);g.fillStyle=AR91RED;g.fillRect(x-w*0.62,gy+gh*0.55,w*1.24,gh*0.45+TW*0.07);
  g.fillStyle='#3a2a1c';g.fillRect(x-gw,gy,gw*2,gh);g.strokeStyle='#8a6a44';g.lineWidth=1;g.beginPath();for(let i=-3;i<=3;i++){g.moveTo(x+i*gw/3.5,gy);g.lineTo(x+i*gw/3.5,gy+gh)}for(let j=1;j<4;j++){g.moveTo(x-gw,gy+j*gh/4);g.lineTo(x+gw,gy+j*gh/4)}g.stroke();
  const tw2=w*0.62,ty0=y-h/2-TW*0.08;g.fillStyle='#8f2a24';g.fillRect(x-tw2,ty0,tw2*2,top-ty0);
  for(const sx of [-1,1]){const cx=x+sx*(tw2-TW*0.06);g.fillStyle='#f3eee2';g.fillRect(cx-TW*0.06,ty0,TW*0.12,top-ty0);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(cx+TW*0.01,ty0,TW*0.05,top-ty0)}
  const py=ty0-TW*0.04,ph=TW*0.42;g.fillStyle='#e6dfcf';ar91Path(g,[{x:x-tw2-TW*0.1,y:py},{x:x+tw2+TW*0.1,y:py},{x,y:py-ph}]);g.fill();g.strokeStyle='#8f8676';g.lineWidth=1.2;g.stroke();
  g.fillStyle='#c9bfa8';for(const dx of [-0.35,0,0.35]){g.beginPath();g.arc(x+dx*tw2,py-ph*0.32,TW*0.05,0,Math.PI*2);g.fill()}
  g.fillStyle='#9a3a2c';ar91Path(g,[{x:x-tw2-TW*0.18,y:py+TW*0.02},{x,y:py-ph-TW*0.12},{x:x+tw2+TW*0.18,y:py+TW*0.02},{x:x+tw2+TW*0.1,y:py-TW*0.04},{x,y:py-ph-TW*0.03},{x:x-tw2-TW*0.1,y:py-TW*0.04}]);g.fill();
  g.fillStyle='#e8e2d4';g.fillRect(x-tw2-TW*0.12,py-TW*0.02,tw2*2+TW*0.24,TW*0.05)}
function ar91TopPaint(g,out){const lud=ar91Lud();const ring=ar91Ring;const mid=ar91Mid();
  /* the gully */
  g.save();ar91Path(g,ring(0.17));const R0=ring(0).slice().reverse();R0.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();ar91Fill(g,1);g.fill('evenodd');g.fillStyle='rgba(22,15,8,.58)';g.fill('evenodd');g.restore();
  g.save();ar91Path(g,ring(0.17));ring(0.1).slice().reverse().forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.fillStyle='rgba(10,6,2,.35)';g.fill('evenodd');
  g.strokeStyle='rgba(255,244,220,.28)';g.lineWidth=1;ar91Path(g,ring(0.01));g.stroke();
  for(const [r,c,hz] of ar91DrainsAt()){const Lp=hz?[[r,c-0.32],[r,c+0.32]]:[[r-0.32,c],[r+0.32,c]];const a=center(...Lp[0]),b=center(...Lp[1]);const ux=b.x-a.x,uy=b.y-a.y;
    g.fillStyle='#120c07';ar91Path(g,[{x:a.x,y:a.y-TW*0.025},{x:b.x,y:b.y-TW*0.025},{x:b.x,y:b.y+TW*0.025},{x:a.x,y:a.y+TW*0.025}]);g.fill();
    g.strokeStyle='rgba(120,110,96,.7)';g.lineWidth=Math.max(0.8,TW*0.014);for(let k=1;k<6;k++){const x=a.x+ux*k/6,y=a.y+uy*k/6;g.beginPath();g.moveTo(x-TW*0.012,y-TW*0.022);g.lineTo(x+TW*0.012,y+TW*0.022);g.stroke()}}g.restore();
  /* the far walls */
  const C2=ring(0.31);const lab=ar91Labels();const H=TW*0.36;
  for(const E of ar91Edges(0.19).filter(E=>E.far)){const left=E.mx<mid.x;let a=E.a,b=E.b,a2=C2[E.ia],b2=C2[E.ib];if(a.x>b.x){let t=a;a=b;b=t;t=a2;a2=b2;b2=t}
    const L=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/L,uy=(b.y-a.y)/L;
    g.save();g.translate(a.x,a.y);g.transform(ux,uy,0,1,0,0);
    ar91Fill(g,1);g.fillRect(0,-H,L,H);g.fillStyle=left?'rgba(40,30,20,.22)':'rgba(255,248,230,.06)';g.fillRect(0,-H,L,H);
    const sh=g.createLinearGradient(0,-H,0,0);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(30,20,10,.25)');g.fillStyle=sh;g.fillRect(0,-H,L,H);
    if(lud){g.fillStyle=AR91RED;g.fillRect(0,-H*0.5,L,H*0.36);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(0,-H*0.5,L,1.5)}
    const capH=TW*0.032;g.fillStyle=AR91RED;g.fillRect(0,-H-capH+TW*0.01,L,capH);g.fillStyle='rgba(30,22,14,.4)';g.fillRect(0,-H+TW*0.01,L,TW*0.012);
    const mine=lab.filter(l=>Math.abs((b.x-a.x)*(a.y-l.p.y)-(a.x-l.p.x)*(b.y-a.y))/L<=TW*0.25).map(l=>({t:l.t,u:(l.p.x-a.x)*ux+(l.p.y-a.y)*uy}));
    if(lud){const rh=TW*0.3,y0=-H-TW*0.06;g.strokeStyle='#6b4a2c';g.lineWidth=Math.max(1.5,TW*0.035);
      g.beginPath();g.moveTo(0,y0-rh);g.lineTo(L,y0-rh);g.moveTo(0,y0);g.lineTo(L,y0);g.stroke();g.lineWidth=Math.max(1,TW*0.022);
      const st=TW*0.22;g.beginPath();for(let x=0;x<L;x+=st){g.moveTo(x,y0);g.lineTo(x+st,y0-rh);g.moveTo(x+st,y0);g.lineTo(x,y0-rh)}g.stroke();
      g.lineWidth=Math.max(2,TW*0.05);g.beginPath();for(let x=0;x<=L;x+=st*4){g.moveTo(x,y0+1);g.lineTo(x,y0-rh-TW*0.08)}g.stroke();
      g.fillStyle='#3a2a1c';g.font=`700 ${Math.round(TW*0.24)}px "Marcellus SC", serif`;g.textAlign='center';g.textBaseline='middle';for(const l of mine)if(l.t!=='·')g.fillText(l.t,l.u,-H*0.62)}
    else for(const l of mine){if(l.t==='·')ar91Drape(g,l.u,-H-TW*0.02,TW*0.4,H+TW*0.02);else ar91Banner(g,l.u,-H+TW*0.01,TW*0.36,H*0.86,l.t)}
    g.restore();out.walls.push({a,b,H,labels:mine.slice().sort((p,q)=>p.u-q.u).map(l=>l.t)}); /* names in screen order, left to right */
    /* the cap's narrow top face, running back */
    const cY=TW*0.022,k2=0.35;const A2={x:a.x+(a2.x-a.x)*k2,y:a.y+(a2.y-a.y)*k2},B2={x:b.x+(b2.x-b.x)*k2,y:b.y+(b2.y-b.y)*k2};
    g.fillStyle='#b53a33';ar91Path(g,[{x:a.x,y:a.y-H-cY},{x:b.x,y:b.y-H-cY},{x:B2.x,y:B2.y-H-cY},{x:A2.x,y:A2.y-H-cY}]);g.fill()}
  /* the towers at the far walls' ends (left and right corners) */
  const R2=ring(0.5);const Lt=R2.reduce((b,p)=>p.x<b.x?p:b),Rt=R2.reduce((b,p)=>p.x>b.x?p:b);
  for(const p of [Lt,Rt])ar91Tower(g,p.x,p.y+TW*0.02,out.fires);
  /* the emperor's podium (attached box) or the ludus temple */
  if(lud)ar91Temple(g);else if(!AR91.det&&!(typeof SETTINGS!=='undefined'&&SETTINGS.flavius===false))ar91Podium(g,out.fires)}

/* ---------- the day sky + the sun on the sand ---------- */
function ar91SkyPaint(s,Wd,Hd){const lite=typeof lite84On==='function'&&lite84On();const U=Math.max(20,Math.min(Wd/15,Hd/10)); /* the sky never depends on the board (zooming never re-bakes it) */
  const sg=s.createLinearGradient(0,0,0,Hd);sg.addColorStop(0,'#6f9fcf');sg.addColorStop(.45,'#a9c6df');sg.addColorStop(.8,'#e3dccb');sg.addColorStop(1,'#eadcc0');s.fillStyle=sg;s.fillRect(0,0,Wd,Hd);
  const sx=Math.max(U*1.3,Wd*0.1),sy=Math.max(U*1.0,Hd*0.1),sr=Math.max(11,U*0.45);
  const gl=s.createRadialGradient(sx,sy,sr*0.5,sx,sy,Math.max(Wd,Hd)*0.75);gl.addColorStop(0,'rgba(255,244,214,.75)');gl.addColorStop(.18,'rgba(255,232,186,.32)');gl.addColorStop(.5,'rgba(255,226,180,.08)');gl.addColorStop(1,'rgba(255,226,180,0)');s.fillStyle=gl;s.fillRect(0,0,Wd,Hd);
  s.fillStyle='#fffbea';s.beginPath();s.arc(sx,sy,sr,0,Math.PI*2);s.fill();
  /* faint clouds: painted small and stretched (the stretch is the blur — a canvas blur filter costs ~0.5 s without a GPU) */
  if(!lite){const K=8,c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(Wd/K));c.height=Math.max(1,Math.ceil(Hd/K));const q2=c.getContext('2d');q2.scale(1/K,1/K);
    let q=24681;const rn=()=>{q=(q*1103515245+12345)&0x7fffffff;return q/0x7fffffff};
    for(let i=0;i<7;i++){const cx=Wd*(0.28+rn()*0.7),cy=Hd*(0.05+rn()*0.22),w=U*(2.5+rn()*3);q2.fillStyle='rgba(255,255,255,'+(0.35+rn()*0.25).toFixed(2)+')';
      for(let k=0;k<4;k++){q2.beginPath();q2.ellipse(cx+(k-1.5)*w*0.35,cy+(k%2)*U*0.15,w*0.38,w*0.13,0,0,Math.PI*2);q2.fill()}}
    s.save();s.imageSmoothingEnabled=true;try{s.imageSmoothingQuality='high'}catch(e){}s.drawImage(c,0,0,c.width*K,c.height*K);s.restore()}}
/* ar91Floor — the arena's own dark floor under the gap between the sand and the stands (the sky only shows outside) */
function ar91Floor(s){const k=1.45+ar91Ex(),d=1.7;const G=[[-k,-k+d],[-k,N+k-d],[-k+d,N+k],[N+k-d,N+k],[N+k,N+k-d],[N+k,-k+d],[N+k-d,-k],[-k+d,-k]].map(([r,c])=>isoFix(r,c));
  s.fillStyle='#24180f';night91Path(s,G);s.fill()}
function ar91LightPaint(g,Wd,Hd){const D=night91Dia(0);
  g.save();night91Path(g,D);g.clip();const lg=g.createLinearGradient(D[3].x-TW,D[0].y-TW,D[1].x+TW,D[2].y+TW);lg.addColorStop(0,'rgba(255,236,190,.13)');lg.addColorStop(.5,'rgba(255,236,190,0)');lg.addColorStop(1,'rgba(40,26,12,.14)');g.fillStyle=lg;g.fillRect(0,0,Wd,Hd);g.restore();
  g.save();night91Path(g,D);g.clip();g.beginPath();g.rect(-Wd,-Hd,Wd*3,Hd*3);D.slice().reverse().forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();
  g.shadowColor='rgba(50,32,14,.55)';g.shadowBlur=TW*0.9;g.shadowOffsetX=TW*0.15;g.shadowOffsetY=TW*0.12;g.fillStyle='#000';g.fill('evenodd');g.restore();
  const cx=(D[0].x+D[2].x)/2,cy=(D[0].y+D[2].y)/2,R=(D[1].x-D[3].x)/2;g.save();night91Path(g,D);g.clip();g.translate(cx,cy);g.scale(1,0.5);
  const vg=g.createRadialGradient(0,0,R*0.35,0,0,R*1.05);vg.addColorStop(0,'rgba(255,248,230,.06)');vg.addColorStop(1,'rgba(70,46,20,.12)');g.fillStyle=vg;g.fillRect(-R*1.2,-R*1.2,R*2.4,R*2.4);g.restore();
  g.save();night91Path(g,D);g.clip();g.lineWidth=Math.max(1,TW*0.03);
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){const P=[isoFix(r,c),isoFix(r,c+1),isoFix(r+1,c+1),isoFix(r+1,c)];const tc={x:(P[0].x+P[2].x)/2,y:(P[0].y+P[2].y)/2};
    for(let i=0;i<4;i++){const a=P[i],b=P[(i+1)%4];const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const lit=(-(mx-tc.x)-(my-tc.y)*2)>0;
      g.strokeStyle=lit?'rgba(255,250,236,.20)':'rgba(70,48,26,.16)';const ix=(tc.x-mx)*0.04,iy=(tc.y-my)*0.04;g.beginPath();g.moveTo(a.x+ix,a.y+iy);g.lineTo(b.x+ix,b.y+iy);g.stroke()}}
  g.restore()}

/* ---------- baking ---------- */
/* ar91Layer — the named layer's offscreen canvas for this key, painted once */
function ar91Layer(name,key,paint){let L=AR91.L[name];if(L&&L.key===key)return L;
  if(!L)L=AR91.L[name]={cv:document.createElement('canvas'),key:''};const dpr=window.devicePixelRatio||1;
  if(L.cv.width!==cv.width||L.cv.height!==cv.height){L.cv.width=cv.width;L.cv.height=cv.height}
  const g=L.cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,L.cv.width,L.cv.height);g.setTransform(dpr,0,0,dpr,0,0);
  const tex=ar91Tex();AR91PAT=tex?g.createPattern(tex,'repeat'):null;L.out={fires:[],walls:[]};
  try{paint(g,L.out)}catch(e){console.error(e)}finally{AR91PAT=null}
  L.key=key;L.tex=!!tex;return L}
function ar91Blit(L,op){if(AR91.noStatic&&!op)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);if(op)ctx.globalCompositeOperation=op;ctx.drawImage(L.cv,0,0);ctx.restore()}
function ar91Key(){const dpr=window.devicePixelRatio||1;return [cv.width,cv.height,dpr,TW.toFixed(3),OX.toFixed(2),OY.toFixed(2),typeof ROT89!=='undefined'?ROT89.k:0,N,ar91Mat().n,ar91Tiers(),ar91Lud()?1:0,night91On()?1:0,AR91.ver,AR91TEX[ar91Mat().n]?1:0,typeof lite84On==='function'&&lite84On()?1:0].join('|')}

/* the drawStands wrapper: foundation + near sides first; plaster benches at the ludus */
{const base=drawStands;drawStands=function(){if(!ar91On())return base.apply(this,arguments);const t0=performance.now();
  try{const L=ar91Layer('under',ar91Key(),g=>ar91Under(g));ar91Blit(L)}catch(e){console.error(e)}
  AR91.ms[0]=performance.now()-t0;
  const lud=ar91Lud();const T0={a:THEME.standA,b:THEME.standB};if(lud){THEME.standA='#e7e0d0';THEME.standB='#d8cfbc'}
  try{return base.apply(this,arguments)}finally{THEME.standA=T0.a;THEME.standB=T0.b}}}
if(typeof standsTex81==='function'){const base=standsTex81;standsTex81=function(){if(ar91On()&&ar91Lud())return;return base.apply(this,arguments)}}
/* ar91Deco — called by drawStands (16-crowd) after the benches, under the spectators */
function ar91Deco(){if(!ar91On()||ar91Lud())return;try{const L=ar91Layer('deco',ar91Key()+'|'+ar91DecoKey(),g=>ar91DecoPaint(g));ar91Blit(L)}catch(e){console.error(e)}}

/* the flames, live: after 189's grade at night (flickering, with a warm halo), at once by day */
function ar91Flames(fires,night){const fl=night&&typeof night91Flick==='function'&&night91Flick();const t=fl?(performance.now()-NIGHT91.t0)/1000:0;
  fires.forEach((f,i)=>{const k=night?night91F(20+i,t):0.95;const sway=fl?Math.sin(t*5.1+i*2.3)*TW*0.012:0;
    if(night){ctx.save();ctx.globalCompositeOperation='lighter';const hr=f.h*1.6*k,hy=f.y-f.h*0.35;const hg=ctx.createRadialGradient(f.x,hy,0,f.x,hy,hr);hg.addColorStop(0,'rgba(255,170,70,.32)');hg.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=hg;ctx.fillRect(f.x-hr,hy-hr,hr*2,hr*2);ctx.restore()}
    night91Fire(f.x,f.y,f.h,f.w,k,sway)})}
/* night91Sand wrapper (07-ui calls it after the tiles): the walls etc., then the day light/sky or the night grade, then the flames */
{const base=night91Sand;night91Sand=function(Wd,Hd){if(!ar91On())return base.apply(this,arguments);const t0=performance.now();const nt=night91On();let top=null;
  try{top=ar91Layer('top',ar91Key()+'|'+(AR91.det?1:0),(g,out)=>ar91TopPaint(g,out));ar91Blit(top);AR91.fires=top.out.fires;AR91.walls=top.out.walls}catch(e){console.error(e)}
  if(!nt){try{const L=ar91Layer('light',ar91Key(),g=>ar91LightPaint(g,Wd,Hd));ar91Blit(L,'source-atop');const K=ar91Layer('sky',[cv.width,cv.height,window.devicePixelRatio||1,typeof lite84On==='function'&&lite84On()?1:0].join('|'),g=>ar91SkyPaint(g,Wd,Hd));ar91Blit(K,'destination-over')}catch(e){console.error(e)}}
  const r=base.apply(this,arguments);
  try{if(top)ar91Flames(top.out.fires,nt)}catch(e){console.error(e)}
  AR91.ms[1]=performance.now()-t0;return r}}

/* ---------- Flavius's box: the purple banner, his name in gold; detached when zoomed ---------- */
function ar91Zoomed(){return (AR91.z||1)>1.05}
{const base=flavXY89;flavXY89=function(){if(!ar91On()||!ar91Zoomed()||ar91Lud())return base.apply(this,arguments);
  const z=AR91.z||1;const k=typeof flavK==='function'?flavK():1;const T0=AR91.gold?TW:TW/z; /* inside drawFlavius TW is already the unzoomed size */const w=T0*1.55*k,h=T0*1.2*k;
  const wrap=typeof cv!=='undefined'&&cv&&cv.parentElement;const Wd=wrap&&wrap.clientWidth?wrap.clientWidth:OX*2;return {cx:Wd/2,cy:h/2+6,w,h}}}
function ar91Pennant(F,T1){const T0=T1*(typeof flavK==='function'?flavK():1);const x=F.cx,y=F.cy,w=F.w,h=F.h;const px0=x-w/2-T0*0.09,px1=x+w/2+T0*0.09,py0=y-h/2-T0*0.05,py1=y+h/2+T0*0.32,tip=py1+T0*0.32;
  ctx.save();ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.moveTo(px0+2,py0+2);ctx.lineTo(px1+2,py0+2);ctx.lineTo(px1+2,py1+2);ctx.lineTo(x+2,tip+2);ctx.lineTo(px0+2,py1+2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3d1838';ctx.beginPath();ctx.moveTo(px0,py0);ctx.lineTo(px1,py0);ctx.lineTo(px1,py1);ctx.lineTo(x,tip);ctx.lineTo(px0,py1);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(201,162,78,.75)';ctx.lineWidth=Math.max(1,T0*0.025);ctx.beginPath();ctx.moveTo(px0+3,py0+3);ctx.lineTo(px1-3,py0+3);ctx.lineTo(px1-3,py1-1);ctx.lineTo(x,tip-4);ctx.lineTo(px0+3,py1-1);ctx.closePath();ctx.stroke();
  ctx.fillStyle=ar91Mat().cap;ctx.fillRect(px0-T0*0.02,py0-T0*0.05,px1-px0+T0*0.04,T0*0.06);ctx.strokeStyle='rgba(40,30,20,.45)';ctx.lineWidth=1;ctx.strokeRect(px0-T0*0.02,py0-T0*0.05,px1-px0+T0*0.04,T0*0.06);ctx.restore()}
{const base=drawFlavius;drawFlavius=function(){if(!ar91On()||ar91Lud()||!S||HEADLESS||(typeof SETTINGS!=='undefined'&&SETTINGS.flavius===false))return base.apply(this,arguments);
  const z=ar91Zoomed()?AR91.z:1;const TW0=TW,TH0=TH;if(z!==1){TW=TW/z;TH=TW/2}
  try{try{ar91Pennant(flavXY89(),TW)}catch(e){}AR91.gold=true;return base.apply(this,arguments)}finally{AR91.gold=false;TW=TW0;TH=TH0}}}
{const base=flavFace;flavFace=function(c2d,cx,cy,w,h,mood,label=true,sp=null){if(!AR91.gold||c2d!==ctx||!label)return base.apply(this,arguments);
  const r=base.call(this,c2d,cx,cy,w,h,mood,false,sp);try{const s2=sp||(typeof curSponsor==='function'?curSponsor():null)||{};
    ctx.save();ctx.fillStyle='#e8c66a';ctx.font=`700 ${Math.max(5,Math.round(Math.min(TW*0.17,w*0.15)))}px "Marcellus SC", serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(String(s2.short||s2.name||'FLAVIUS').toUpperCase().slice(0,14),cx,cy+h/2+TW*0.16);ctx.restore()}catch(e){}return r}}
/* the box detaches while zoomed: the podium layer is keyed on it */
{const base=draw;draw=function(){const r=base.apply(this,arguments);try{const d=ar91On()&&ar91Zoomed();if(d!==AR91.det){AR91.det=d;if(!HEADLESS)base.apply(this,arguments)}}catch(e){}return r}}

/* ---------- the pots: a squat terracotta-grey jug; the Golden Eagle as a token round ---------- */
{const base=drawPot;drawPot=function(x,y,s,eagle){if(HEADLESS||!AR91.on)return base.apply(this,arguments);
  if(eagle){const f=typeof tok90Canvas==='function'?tok90Canvas('eagle'):null;const rx=s*0.3,th=Math.max(2,s*0.05),y0=y-s*0.06;ctx.save();
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+1,y0+2,rx*1.04,rx*0.62,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#3e2810';ctx.beginPath();ctx.ellipse(x,y0,rx,rx*0.6,0,0,Math.PI);ctx.lineTo(x-rx,y0-th);ctx.ellipse(x,y0-th,rx,rx*0.6,0,Math.PI,0,true);ctx.closePath();ctx.fill();
    ctx.save();ctx.beginPath();ctx.ellipse(x,y0-th,rx,rx*0.6,0,0,Math.PI*2);ctx.clip();if(f)ctx.drawImage(f,x-rx,y0-th-rx*0.6,rx*2,rx*1.2);else{ctx.fillStyle='#d9b44a';ctx.fill();ctx.fillStyle='#5c3f0c';ctx.font=`700 ${Math.round(rx*0.8)}px Marcellus SC, serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('E',x,y0-th)} /* the gold round until the token sprite is in */
    ctx.restore();ctx.restore();AR91.cnt.eagle++;return}
  if(!(s>4))return base.apply(this,arguments);
  AR91.cnt.jug++;ctx.save();const body='#9c6f5c',lite='#c49a85',dark='#583a2e',ink='rgba(30,22,16,.85)';
  ctx.fillStyle='rgba(0,0,0,.26)';ell(x+s*0.05,y+1,s*0.32,s*0.11);ctx.fill();
  const path=()=>{ctx.beginPath();ctx.moveTo(x-s*0.12,y);ctx.bezierCurveTo(x-s*0.44,y-s*0.04,x-s*0.42,y-s*0.5,x-s*0.12,y-s*0.62);ctx.lineTo(x-s*0.1,y-s*0.76);
    ctx.quadraticCurveTo(x-s*0.18,y-s*0.81,x-s*0.16,y-s*0.86);ctx.quadraticCurveTo(x-s*0.02,y-s*0.82,x+s*0.14,y-s*0.86);ctx.quadraticCurveTo(x+s*0.13,y-s*0.79,x+s*0.1,y-s*0.76);
    ctx.lineTo(x+s*0.12,y-s*0.62);ctx.bezierCurveTo(x+s*0.42,y-s*0.5,x+s*0.44,y-s*0.04,x+s*0.12,y);ctx.closePath()};
  const gr=ctx.createLinearGradient(x-s*0.42,0,x+s*0.42,0);gr.addColorStop(0,lite);gr.addColorStop(.35,body);gr.addColorStop(1,dark);path();ctx.fillStyle=gr;ctx.fill();
  ctx.save();path();ctx.clip();
  if(!(typeof lite84On==='function'&&lite84On())){let q=(Math.round(x*7)*73856093^Math.round(y*7)*19349663)>>>0;const rn=()=>{q=(q*1103515245+12345)>>>0;return (q>>>8)/16777216};
    const d=Math.max(0.7,s*0.011);for(let i=0;i<Math.min(140,s*2.2);i++){ctx.fillStyle=rn()<0.5?'rgba(255,248,236,.10)':'rgba(30,22,16,.14)';ctx.fillRect(x+(rn()-0.5)*s*0.9,y-rn()*s,d,d)}}
  ctx.strokeStyle='rgba(40,30,22,.6)';ctx.lineWidth=Math.max(0.7,s*0.018);for(const dy of [0.42,0.3]){ctx.beginPath();ctx.ellipse(x,y-s*dy,s*0.38,s*0.06,0,0.05*Math.PI,0.95*Math.PI);ctx.stroke()}
  ctx.lineWidth=Math.max(0.6,s*0.012);for(let i=-3;i<=3;i++){const xx=x+i*s*0.075;ctx.beginPath();ctx.moveTo(xx-s*0.02,y-s*0.395);ctx.lineTo(xx+s*0.02,y-s*0.33);ctx.stroke()}
  ctx.restore();path();ctx.strokeStyle=ink;ctx.lineWidth=Math.max(0.8,s*0.028);ctx.stroke();
  ctx.fillStyle='#2a1e14';ell(x-s*0.01,y-s*0.835,s*0.1,s*0.025);ctx.fill();
  ctx.strokeStyle=dark;ctx.lineWidth=Math.max(1,s*0.055);ctx.beginPath();ctx.moveTo(x+s*0.11,y-s*0.8);ctx.bezierCurveTo(x+s*0.36,y-s*0.86,x+s*0.38,y-s*0.64,x+s*0.2,y-s*0.56);ctx.stroke();
  ctx.strokeStyle=ink;ctx.lineWidth=Math.max(0.6,s*0.015);ctx.stroke();
  ctx.restore()}}

/* ---------- the Studio: a character's Banner (flies on the stands' tapestry in Play Now) ---------- */
{const base=charEditorHTML;charEditorHTML=function(){let h=base.apply(this,arguments);try{const c=ST.draft;if(!c||typeof h!=='string'||/data-f="banner91"/.test(h))return h;
    const opts=[['',_T('Auto (from the class colour)')]].concat(typeof FLAGS!=='undefined'?Object.entries(FLAGS).map(([k,F])=>['flag:'+k,_T('🏳 City banner · ')+F.n]):[]).concat((CUSTOM.flags||[]).filter(f=>f.fmt!=='portrait').map(f=>['flag:c:'+f.id,_T('✦ Your banner · ')+(f.name||_T('untitled'))]));
    const u=c.banner91&&String(c.banner91).startsWith('flag:')?flagURIk(String(c.banner91).slice(5)):null;
    const lab=`<label title="${_T`The house flag on the stands' tapestry when this character fights`}">${_T`Banner`}<span style="display:flex;gap:4px;align-items:center">${fSel('banner91',opts,c.banner91||'')}${u?`<img src="${u}" alt="" style="height:30px;border-radius:2px">`:''}</span></label>`;
    let i=h.indexOf('data-f="city"');if(i<0)i=h.indexOf('data-f="color"');if(i<0)return h; /* beside the home city */const j=h.indexOf('</label>',i);if(j<0)return h;h=h.slice(0,j+8)+lab+h.slice(j+8)}catch(e){}return h}}
