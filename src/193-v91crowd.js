/* =====================================================================
   193-V91CROWD · v0.91 THE CROWD (Virgilante's approved spectators, 2026-10-06). Display only — no rules, no seeded dice
   (Math.random / hashes only), nothing written to S or to a spectator except the old sp._x/_y seat point; not in onlHash.
   • SCULPTED SPECTATORS: every seated spectator is a small sculpted figure in the lit token look (176): light from the upper
     left (each shape shaded with its own gradient, darker right side, warm rim on the lit edge), a contact shadow on the
     bench. Head with a face, hair / long hair / beard / hat from sp.look, shoulders and tunic folds in the home-city wool
     (tunicOf), the allegiance sash across the chest (allegCol, else the robe — robeOf), seated with hands on the lap.
     Each look is painted ONCE per (look, mood, facing, pose, laurel, pixel-size bucket) to an offscreen canvas (CR91_CV,
     LRU-capped) and stamped with one drawImage per frame.
   • FACING: the stands on the two screen-FRONT sides (below the board's middle on screen — turned boards included, 168
     ROT89, because the test is done on the turned screen positions) face the sand, so we see them FROM BEHIND (back of the
     head, hair, shoulders, the sash across the back). The far stands face the camera.
   • MOOD ON THE FACE (the coloured head ring is gone): delighted (≥40) big open smile · pleased (≥10) smile · neutral flat ·
     annoyed (≤ −15) frown · furious (≤ −45) open shouting mouth, red cheeks, brows down. From behind the mood is the posture:
     delighted = both arms up, furious = a fist shaken in the air; the rest sit still. Emotes are unchanged (16 drawEmotes).
   • HUMAN SPECTATORS (you, online ticket holders): a gold ring at the feet like a token base (no ring round the body).
     Online cushions (127) are drawn here under the figure (127's own pass sees no spectators while ours draws them).
   • REGULARS wear a small gold laurel. THE RULE (reg91): a known face = a Studio-made regular (CROWD_CACHE r.custom), one of
     the old named regulars (SPECT_NAMES) back for a 3rd+ visit, the kin of a fighter (r.kin), or anyone with REG91.visits+ events in the tiers. Never a human spectator. Hovering a spectator names them
     in the hover line (#hover): name, "regular · N visits", the section, the mood, whom they cheer.
   • EVEN SEATING: each section is a grid of benches (rows = 3, or the grand arenas' AR91ROWS / ar91Rows() from 192) × 8
     seats, every other row offset half a seat. A fixed per-section ORDER of those seats (farthest-point sampling from the
     middle — a low-discrepancy fill) is used: the first spectator sits in the middle, the next ones fill the largest
     gaps, alternating rows. A spectator keeps their seat (SEAT91, a WeakMap — never on the spectator) until they leave
     or change section; a newcomer takes the first free seat in the order. seatPos (16) is wrapped to the same geometry
     (the 30-spectate seat map follows).
   • WALK-IN AT ROTATION 1: at the start of an event (S.ri 0, S.rotation 1) the spectators arrive from off-screen up the
     stairways at the section ends and walk along their bench to the seat, staggered, all seated within WALK91.maxMs (and
     at once when rotation 1 ends). Clock starts at the first frame the board shows without a window over it; a hidden tab
     pauses it. A light rAF redraw (≤30 fps) runs only while someone is walking. Reduce motion / Animations Off / Light
     board / sims / HEADLESS / a loaded match past rotation 1 → everyone already seated. sp._x/_y are ALWAYS the seat
     (stones, spears, emotes, tests); only the drawn position walks (crowd91Drawn(sp) reads it).
   • SCULPTED FIGURES FACE THE SAND: the sculpted board tokens (drawFigureTok, 176 lit look) right of the board's middle
     on screen are drawn mirrored so every gladiator looks toward the middle (the weapon hand points inward). The mirrored
     figure is lit from the upper left too (its part lights are mirrored back in the SVG: azimuth 315 inside the flipped
     group); the sand shadow keeps falling to the lower right. Arrows stuck in it (132) flip with it; HP bars stay centred.
   ===================================================================== */
const CR91={on:true,maxCv:420,hits:0,miss:0,frames:0,ms:0,last:0}; /* TWEAK: on = the whole look; maxCv = cached sprites */
const REG91={visits:8,top:4}; /* TWEAK: events in the tiers that make a regular a known face (laurel) */
const SIZE91=0.5; /* TWEAK: a spectator's height (head top to bench) in tile widths */
const SEATS91={cols:8,d0:1.35,tier:0.47,lift:0.08}; /* bench geometry, the same as 16-crowd drawStands' tiers */
const WALK91={speed:2.2,maxMs:7000,stagger:260,fps:30}; /* TWEAK: tiles a second, all seated by, ms between arrivals in a section */

/* crowdRows91 — benches per section: 192's grand arenas may add a 4th row (ar91Rows() or AR91ROWS), else 3 */
function crowdRows91(){try{if(typeof ar91Rows==='function'){const v=+ar91Rows();if(v>=1)return Math.min(6,v|0)}}catch(e){}
  try{if(typeof AR91ROWS!=='undefined'){const v=+(typeof AR91ROWS==='function'?AR91ROWS():AR91ROWS);if(v>=1)return Math.min(6,v|0)}}catch(e){}return 3}
/* the seat grid of a section in board units: {row, d (distance out from the rim), al (along the edge)} */
function seatGrid91(R){const C=SEATS91.cols,out=[];const len=6.15,step=(len-0.9)/(C-0.5);
  for(let row=0;row<R;row++)for(let col=0;col<C;col++)out.push({row,col,d:SEATS91.d0+(row+0.52)*SEATS91.tier,al:0.45+(col+(row%2?0.5:0))*step});return out}
/* seatOrder91 — the fill order: farthest-point sampling from the middle seat (rows weighted a little more, so rows alternate) */
const ORDER91={};
function seatOrder91(R){if(ORDER91[R])return ORDER91[R];const G=seatGrid91(R);const n=G.length;const mid=G.reduce((b,s,i)=>{const d=Math.abs(s.row-(R-1)/2)*2+Math.abs(s.al-3.07);return d<b[0]?[d,i]:b},[1e9,0])[1];
  const ord=[mid],dmin=G.map(s=>Infinity);const upd=i=>{for(let j=0;j<n;j++){const a=G[i],b=G[j];const dd=Math.hypot((a.d-b.d)*1.9,a.al-b.al);if(dd<dmin[j])dmin[j]=dd}};upd(mid);
  while(ord.length<n){let best=-1,bv=-1;for(let j=0;j<n;j++){if(ord.includes(j))continue;const v=dmin[j]-j*1e-6;if(v>bv){bv=v;best=j}}ord.push(best);upd(best)}
  return ORDER91[R]={G,ord}}
/* edge mapping: (d, along) in a section → board (r,c) */
function secRC91(si,d,al){const s=SECTIONS[si];const a=s.half?6.6:0.25;const A=a+al;
  return s.edge==='top'?[-d,A]:s.edge==='bottom'?[N-1+d,A]:s.edge==='left'?[A,-d]:[A,N-1+d]}
/* seatXY91 — the screen point of a seat (k = place in the fill order; beyond the grid: a second pass a third of a seat over) */
function seatXY91(si,k){const R=crowdRows91();const {G,ord}=seatOrder91(R);const n=G.length;const s=G[ord[k%n]];const extra=Math.floor(k/n);
  const p=pt(...secRC91(si,s.d,s.al+(extra?((extra%2?1:-1)*0.23*Math.ceil(extra/2)):0)));return {x:p.x,y:p.y-s.row*TW*SEATS91.lift,row:s.row,al:s.al,d:s.d}}
{const base=seatPos;seatPos=function(si,k){try{if(CR91.on&&!HEADLESS&&SECTIONS[si])return seatXY91(si,k|0)}catch(e){}return base.apply(this,arguments)}}

/* ---------- who sits where (stable) ---------- */
const SEAT91=new WeakMap(); /* sp → {sec, slot, R} */
function assignSeats91(){const R=crowdRows91();const used={};const list=[];
  for(const sp of S.spect||[]){if(sp.gone)continue;const a=SEAT91.get(sp);if(a&&a.sec===sp.sec&&a.R===R){(used[sp.sec]=used[sp.sec]||new Set()).add(a.slot);list.push(sp)}else list.push(sp)}
  for(const sp of list){const a=SEAT91.get(sp);if(a&&a.sec===sp.sec&&a.R===R)continue;const U=used[sp.sec]=used[sp.sec]||new Set();let k=0;while(U.has(k))k++;U.add(k);SEAT91.set(sp,{sec:sp.sec,slot:k,R})}
  return list}

/* ---------- regulars ---------- */
const RC91={m:null,n:-1};
function regOf91(rid){if(!rid||typeof CROWD_CACHE==='undefined')return null;if(RC91.n!==CROWD_CACHE.length||RC91.src!==CROWD_CACHE){RC91.m=new Map(CROWD_CACHE.map(r=>[r.id,r]));RC91.n=CROWD_CACHE.length;RC91.src=CROWD_CACHE}return RC91.m.get(rid)||null}
/* the laurel stays rare (lead's tweak): Studio-made regulars and fighters' kin always; otherwise only the house's REG91.top best-known
   faces (most visits, at least REG91.visits — or a named old regular on a 3rd+ visit) — so a long career never laurels the whole stands */
function reg91(sp){if(!sp||sp.human)return false;const r=regOf91(sp.rid);if(r&&(r.custom||r.kin))return true;
  const L=S&&S.spect||[];if(REG91._n!==L.length||REG91._s!==S){REG91._n=L.length;REG91._s=S;
    const known=x=>!x.human&&!x.gone&&((x.visits||0)>=REG91.visits||(typeof SPECT_NAMES!=='undefined'&&SPECT_NAMES.includes(x.name)&&(x.visits||0)>=3));
    REG91._set=new Set(L.filter(known).sort((a,b)=>(b.visits||0)-(a.visits||0)).slice(0,REG91.top).map(x=>x.id))}
  return REG91._set.has(sp.id)}
/* mood buckets: 0 furious · 1 annoyed · 2 neutral · 3 pleased · 4 delighted (16 moodCol's thresholds) */
const moodLv91=m=>m>=40?4:m>=10?3:m>-15?2:m>-45?1:0;

/* ---------- near / far: is the section below the board's middle on screen? ---------- */
function nearSec91(si){const c=pt((N-1)/2,(N-1)/2);const m=seatXY91(si,0);return m.y>c.y+TW*0.5}

/* ---------- the sprite ---------- */
const cmix91=(c,f)=>typeof sc3dMix==='function'?sc3dMix(c,f):c;
/* paint91 — one spectator in a 64×104 unit box, base (the bench point) at 32,94. o = {skin,hair,long,beard,fem,hat,tunic,sash,mood,back,laurel} */
function paint91(g,o){const X=32,Y=94;const ink='rgba(28,16,8,.78)';const rim='rgba(255,238,206,.55)';
  const skin=o.skin||'#e6cfa8',hair=o.hair||'#4a2c17',tun=o.tunic||'#e8dcc0',sash=o.sash||'#8f8474';
  const lin=(x0,y0,x1,y1,c,lo=0.22,hi=-0.38)=>{const G=g.createLinearGradient(x0,y0,x1,y1);G.addColorStop(0,cmix91(c,lo));G.addColorStop(0.45,c);G.addColorStop(1,cmix91(c,hi));return G};
  const rad=(cx,cy,r,c)=>{const G=g.createRadialGradient(cx-r*0.38,cy-r*0.42,r*0.1,cx,cy,r*1.08);G.addColorStop(0,cmix91(c,0.28));G.addColorStop(0.55,c);G.addColorStop(1,cmix91(c,-0.4));return G};
  const S_=(w=1)=>{g.lineWidth=w;g.strokeStyle=ink;g.stroke()};
  const up=o.back?(o.mood===4?2:o.mood===0?1:0):(o.mood===4?2:o.mood===0?1:0); /* 2 both arms up, 1 one fist up */
  /* contact shadow on the bench (light upper left → a little to the right) */
  {const G=g.createRadialGradient(X+3,Y,2,X+3,Y,24);G.addColorStop(0,'rgba(12,6,2,.5)');G.addColorStop(1,'rgba(12,6,2,0)');g.fillStyle=G;g.beginPath();g.ellipse(X+3,Y,24,6,0,0,Math.PI*2);g.fill()}
  /* long hair behind the shoulders */
  if(o.long&&!o.back){g.fillStyle=lin(14,30,50,62,hair,0.12,-0.45);g.beginPath();g.moveTo(15,32);g.quadraticCurveTo(12,52,17,62);g.lineTo(47,62);g.quadraticCurveTo(52,52,49,32);g.closePath();g.fill();S_(0.8)}
  /* arms raised (drawn behind the body) */
  const arm=(sx,sy,hx,hy)=>{g.lineCap='round';g.strokeStyle=ink;g.lineWidth=8.4;g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo((sx+hx)/2+(hx<X?-4:4),(sy+hy)/2,hx,hy);g.stroke();
    g.strokeStyle=lin(sx-8,hy,sx+8,sy,tun,0.2,-0.3);g.lineWidth=6.6;g.stroke();g.fillStyle=rad(hx,hy,4,skin);g.beginPath();g.arc(hx,hy,3.9,0,Math.PI*2);g.fill();S_(0.7)};
  if(up===2){arm(17,58,9,16);arm(47,58,55,16)}else if(up===1){arm(47,58,52,14)}
  /* torso: tunic, rounded shoulders, a little wider at the lap */
  g.beginPath();g.moveTo(13,90);g.lineTo(12,70);g.quadraticCurveTo(11,55,20,52);g.quadraticCurveTo(32,48,44,52);g.quadraticCurveTo(53,55,52,70);g.lineTo(51,90);g.quadraticCurveTo(32,95,13,90);g.closePath();
  g.fillStyle=lin(14,50,52,92,tun);g.fill();S_(1);
  g.save();g.clip();
  /* folds */
  g.strokeStyle=cmix91(tun,-0.32);g.lineWidth=1.1;g.globalAlpha=.7;g.beginPath();
  if(o.back){g.moveTo(25,60);g.quadraticCurveTo(28,74,26,89);g.moveTo(38,60);g.quadraticCurveTo(36,75,39,89)}else{g.moveTo(23,74);g.quadraticCurveTo(27,82,25,90);g.moveTo(41,74);g.quadraticCurveTo(37,82,40,90);g.moveTo(30,80);g.lineTo(32,90)}
  g.stroke();g.globalAlpha=1;
  /* the sash (allegiance): front = viewer's left shoulder → right hip; back = the other diagonal */
  g.beginPath();if(o.back){g.moveTo(42,49);g.lineTo(52,54);g.lineTo(24,92);g.lineTo(13,88)}else{g.moveTo(14,54);g.lineTo(24,49);g.lineTo(52,86);g.lineTo(44,93)}g.closePath();
  g.fillStyle=lin(14,48,52,92,sash,0.25,-0.42);g.fill();g.strokeStyle='rgba(20,10,4,.55)';g.lineWidth=0.8;g.stroke();
  g.strokeStyle=cmix91(sash,0.35);g.globalAlpha=.6;g.lineWidth=0.8;g.beginPath();if(o.back){g.moveTo(44,52);g.lineTo(17,88)}else{g.moveTo(19,53);g.lineTo(47,88)}g.stroke();g.globalAlpha=1;
  /* core shadow on the right side */
  {const G=g.createLinearGradient(30,0,54,0);G.addColorStop(0,'rgba(0,0,0,0)');G.addColorStop(1,'rgba(10,4,0,.32)');g.fillStyle=G;g.fillRect(0,40,64,60)}
  g.restore();
  /* rim light on the left shoulder */
  g.strokeStyle=rim;g.lineWidth=1.1;g.beginPath();g.moveTo(12.6,72);g.quadraticCurveTo(11.6,56,20,52.6);g.quadraticCurveTo(26,50.4,31,50);g.stroke();
  /* arms resting: sleeves at the sides, hands on the lap (front only; from behind just the sleeves) */
  if(up!==2){const L=[[14,1]];if(up!==1)L.push([50,-1]);for(const [sx] of L){g.fillStyle=lin(sx-4,58,sx+4,80,tun,0.15,-0.35);g.beginPath();g.ellipse(sx,68,4.2,11,sx<32?0.12:-0.12,0,Math.PI*2);g.fill();S_(0.8)}
    if(!o.back){g.fillStyle=rad(25,84,4,skin);g.beginPath();g.arc(25,84,3.6,0,Math.PI*2);g.fill();S_(0.7);if(up!==1){g.fillStyle=rad(39,84,4,skin);g.beginPath();g.arc(39,84,3.6,0,Math.PI*2);g.fill();S_(0.7)}}}
  /* neck */
  g.fillStyle=lin(27,40,37,52,skin,0.1,-0.35);g.fillRect(27,40,10,11);
  /* head */
  const hx=32,hy=32,hr=14.5;
  if(o.hat==='hood'||o.hat==='veil'){g.fillStyle=lin(14,16,50,58,o.hat==='veil'?'#efe6d2':'#5a4a3a',0.18,-0.4);g.beginPath();g.moveTo(14,56);g.quadraticCurveTo(10,16,32,14);g.quadraticCurveTo(54,16,50,56);g.closePath();g.fill();S_(0.8)}
  g.fillStyle=rad(hx,hy,hr,skin);g.beginPath();g.arc(hx,hy,hr,0,Math.PI*2);g.fill();S_(1);
  if(o.back){
    /* ears, then hair over most of the back of the head */
    g.fillStyle=rad(17.4,34,3,skin);g.beginPath();g.ellipse(17.6,34,2.6,4,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(46.4,34,2.6,4,0,0,Math.PI*2);g.fill();
    g.save();g.beginPath();g.arc(hx,hy,hr-0.3,0,Math.PI*2);g.clip();g.fillStyle=rad(hx,hy-2,hr+2,hair);g.beginPath();
    if(o.long||o.fem){g.rect(0,0,64,60)}else{g.moveTo(14,40);g.quadraticCurveTo(32,46,50,40);g.lineTo(50,0);g.lineTo(14,0);g.closePath()}g.fill();
    g.strokeStyle=cmix91(hair,-0.35);g.lineWidth=0.7;g.globalAlpha=.7;g.beginPath();for(let i=0;i<5;i++){g.moveTo(22+i*5,20);g.quadraticCurveTo(21+i*5.5,32,22+i*5,42)}g.stroke();g.globalAlpha=1;g.restore();
    if(o.long||o.fem){g.fillStyle=lin(18,40,46,64,hair,0.1,-0.45);g.beginPath();g.moveTo(19,40);g.quadraticCurveTo(16,58,22,64);g.lineTo(42,64);g.quadraticCurveTo(48,58,45,40);g.closePath();g.fill();S_(0.8)}
  }else{
    /* hair cap + fringe */
    g.save();g.beginPath();g.arc(hx,hy,hr-0.3,0,Math.PI*2);g.clip();g.fillStyle=rad(hx,hy-4,hr,hair);g.beginPath();g.moveTo(14,30);g.quadraticCurveTo(18,14,32,15);g.quadraticCurveTo(46,14,50,30);
    g.quadraticCurveTo(45,22,38,23);g.quadraticCurveTo(32,21,26,23.5);g.quadraticCurveTo(19,23,14,30);g.closePath();g.fill();g.restore();
    if(o.long||o.fem){g.fillStyle=lin(14,24,20,52,hair,0.15,-0.4);g.beginPath();g.moveTo(17.4,26);g.quadraticCurveTo(14,40,16.4,52);g.lineTo(20.6,50);g.quadraticCurveTo(18.6,38,20.4,28);g.closePath();g.fill();
      g.beginPath();g.moveTo(46.6,26);g.quadraticCurveTo(50,40,47.6,52);g.lineTo(43.4,50);g.quadraticCurveTo(45.4,38,43.6,28);g.closePath();g.fill()}
    /* beard */
    if(o.beard&&!o.fem){g.fillStyle=lin(20,34,44,48,hair,0.1,-0.4);g.beginPath();g.moveTo(18.4,33);g.quadraticCurveTo(20,47,32,47.6);g.quadraticCurveTo(44,47,45.6,33);g.quadraticCurveTo(42,40,32,40.4);g.quadraticCurveTo(22,40,18.4,33);g.closePath();g.fill()}
    /* the face: brows, eyes, nose, cheeks, mouth by mood */
    const m=o.mood;g.lineCap='round';
    if(m===0){g.fillStyle='rgba(214,52,32,.42)';g.beginPath();g.arc(22.6,37,3.4,0,Math.PI*2);g.arc(41.4,37,3.4,0,Math.PI*2);g.fill()}
    else if(m===4){g.fillStyle='rgba(226,110,90,.24)';g.beginPath();g.arc(22.4,37,3,0,Math.PI*2);g.arc(41.6,37,3,0,Math.PI*2);g.fill()}
    g.strokeStyle='#2a1a10';g.lineWidth=1.5;g.beginPath();
    const br=m===0?[[22.5,26.4,28.8,29.6],[41.5,26.4,35.2,29.6]]:m===1?[[22.5,27.6,28.6,28.8],[41.5,27.6,35.4,28.8]]:m===4?[[22.4,25.6,28.4,25.2],[41.6,25.6,35.6,25.2]]:[[22.6,27,28.4,26.8],[41.4,27,35.6,26.8]];
    for(const [a,b,c,d] of br){g.moveTo(a,b);g.lineTo(c,d)}g.stroke();
    g.fillStyle='#1a100a';for(const ex of [25.6,38.4]){g.beginPath();if(m===4)g.ellipse(ex,31,1.9,1.1,0,Math.PI,0);else g.ellipse(ex,31.2,1.5,1.8,0,0,Math.PI*2);g.fill()}
    g.strokeStyle=cmix91(skin,-0.35);g.lineWidth=1.1;g.beginPath();g.moveTo(32.6,31.5);g.quadraticCurveTo(34.4,36,32.4,37.2);g.stroke();
    g.strokeStyle='#4a1a10';g.lineWidth=1.4;g.beginPath();
    if(m===4){g.moveTo(25.2,39.6);g.quadraticCurveTo(32,48.4,38.8,39.6);g.closePath();g.fillStyle='#4a140c';g.fill();g.stroke();g.fillStyle='#f6eee0';g.fillRect(27.4,39.8,9.2,1.6)}
    else if(m===3){g.moveTo(26.4,40);g.quadraticCurveTo(32,44.6,37.6,40);g.stroke()}
    else if(m===2){g.moveTo(27.4,41.4);g.lineTo(36.6,41.4);g.stroke()}
    else if(m===1){g.moveTo(26.6,43.4);g.quadraticCurveTo(32,38.8,37.4,43.4);g.stroke()}
    else{g.ellipse(32,42.2,3.4,4.2,0,0,Math.PI*2);g.fillStyle='#3a0c06';g.fill();g.stroke()}
  }
  /* rim light on the head's lit edge */
  g.strokeStyle=rim;g.lineWidth=1.2;g.beginPath();g.arc(hx,hy,hr-0.6,Math.PI*1.05,Math.PI*1.55);g.stroke();
  /* hats */
  const hat=o.laurel&&o.hat==='wreath'?null:o.hat;
  if(hat==='pileus'){g.fillStyle=lin(18,10,46,26,'#d9ccb0');g.beginPath();g.moveTo(17.6,24);g.quadraticCurveTo(18,9,32,8);g.quadraticCurveTo(46,9,46.4,24);g.quadraticCurveTo(32,20,17.6,24);g.closePath();g.fill();S_(0.8)}
  else if(hat==='straw'){g.fillStyle=lin(4,16,60,26,'#d8b86a',0.2,-0.3);g.beginPath();g.ellipse(32,22,27,5.6,0,0,Math.PI*2);g.fill();S_(0.8);g.fillStyle=lin(20,8,44,22,'#e0c47a');g.beginPath();g.moveTo(21,21);g.quadraticCurveTo(22,9,32,9);g.quadraticCurveTo(42,9,43,21);g.closePath();g.fill();S_(0.8)}
  else if(hat==='hood'){g.fillStyle=lin(14,12,50,30,'#5a4a3a',0.18,-0.4);g.beginPath();g.moveTo(15,34);g.quadraticCurveTo(13,14,32,13);g.quadraticCurveTo(51,14,49,34);g.quadraticCurveTo(46,20,32,20);g.quadraticCurveTo(18,20,15,34);g.closePath();g.fill();S_(0.8)}
  else if(hat==='veil'){g.fillStyle=lin(14,12,50,30,'#efe6d2',0.1,-0.3);g.beginPath();g.moveTo(15.4,36);g.quadraticCurveTo(13,14,32,13);g.quadraticCurveTo(51,14,48.6,36);g.quadraticCurveTo(46,21,32,21);g.quadraticCurveTo(18,21,15.4,36);g.closePath();g.fill();S_(0.7)}
  else if(hat==='helm'){g.fillStyle=lin(16,8,48,28,'#a9b2ba',0.3,-0.4);g.beginPath();g.moveTo(16,28);g.quadraticCurveTo(16,8,32,8);g.quadraticCurveTo(48,8,48,28);g.lineTo(44,28);g.quadraticCurveTo(43,18,32,18);g.quadraticCurveTo(21,18,20,28);g.closePath();g.fill();S_(0.8)}
  else if(hat==='turban'){g.fillStyle=lin(16,8,48,26,'#e8e0cc',0.15,-0.32);g.beginPath();g.moveTo(16.6,25);g.quadraticCurveTo(15,8,32,8);g.quadraticCurveTo(49,8,47.4,25);g.quadraticCurveTo(32,19,16.6,25);g.closePath();g.fill();S_(0.8);if(!o.back){g.fillStyle='#3a6ad0';g.beginPath();g.arc(32,15,1.8,0,Math.PI*2);g.fill()}}
  else if(hat==='wreath'){g.strokeStyle='#6f9a3a';g.lineWidth=3;g.setLineDash([2.6,1.4]);g.beginPath();g.arc(32,30,15.2,Math.PI*1.08,Math.PI*1.92);g.stroke();g.setLineDash([])}
  /* the regular's gold laurel: leaves along a band over the brow */
  if(o.laurel){const leaf=(a,s)=>{const x=32+Math.cos(a)*15.4,y=29+Math.sin(a)*15.4;g.save();g.translate(x,y);g.rotate(a+Math.PI/2*s);g.beginPath();g.ellipse(0,0,3.6,1.6,0,0,Math.PI*2);
      const G=g.createLinearGradient(-3,-2,3,2);G.addColorStop(0,'#fff0a8');G.addColorStop(.5,'#e6b93a');G.addColorStop(1,'#8a6414');g.fillStyle=G;g.fill();g.strokeStyle='rgba(70,46,6,.85)';g.lineWidth=0.6;g.stroke();g.restore()};
    for(let i=0;i<5;i++){leaf(Math.PI*(1.12+i*0.07),1);leaf(Math.PI*(1.88-i*0.07),-1)}}
}
/* the sprite cache: one canvas per look + device-pixel bucket */
const CR91_CV=new Map();const CR91_STEPS=[];for(let v=14;v<520;v=Math.round(v*1.22))CR91_STEPS.push(v);
function sprite91(o,pxH){const px=CR91_STEPS.find(v=>v>=pxH)||CR91_STEPS[CR91_STEPS.length-1];
  const key=[o.skin,o.hair,o.long?1:0,o.beard?1:0,o.fem?1:0,o.hat||'',o.tunic,o.sash,o.mood,o.back?1:0,o.laurel?1:0,px].join('|');
  let c=CR91_CV.get(key);if(c){CR91.hits++;CR91_CV.delete(key);CR91_CV.set(key,c);return c}
  CR91.miss++;const k=px/100;c=document.createElement('canvas');c.width=Math.ceil(64*k);c.height=Math.ceil(104*k);const g=c.getContext('2d');g.scale(k,k);
  try{paint91(g,o)}catch(e){console.error(e)}c._k=k;CR91_CV.set(key,c);while(CR91_CV.size>CR91.maxCv)CR91_CV.delete(CR91_CV.keys().next().value);return c}
function look91(sp,back){const lk=sp.look||{};const reg=regOf91(sp.rid);
  return {skin:lk.skin||'#e6cfa8',hair:lk.hair||'#4a2c17',long:!!lk.long,beard:!!lk.beard,fem:!!lk.fem,hat:lk.hat||'',tunic:tunicOf(lk,reg&&reg.city),
    sash:sp.fav!=null||sp.favCls?allegCol(sp):robeOf(lk),mood:moodLv91(sp.mood||0),back:!!back,laurel:reg91(sp)}}

/* ---------- the walk-in ---------- */
const WALKS91=new WeakMap(); /* S → {t0, last, done} */
const DRAWN91=new WeakMap(); /* sp → {x,y} drawn this frame */
function crowd91Drawn(sp){return DRAWN91.get(sp)||null}
function walkOK91(){try{if(HEADLESS||!S||S.sim||S.snap||S.over)return false;if(typeof animOn==='function'&&!animOn())return false;if(typeof reduceMotion==='function'&&reduceMotion())return false;
  if(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')return false;if(typeof lite84On==='function'&&lite84On())return false;return true}catch(e){return false}}
function walkState91(){if(!S)return null;let W=WALKS91.get(S);if(!W){W={t0:null,last:0,done:false};WALKS91.set(S,W)}
  if(W.done)return W;if(!walkOK91()||(S.ri|0)>0||(S.rotation|0)>1){W.done=true;return W}
  const now=performance.now();const shown=!(typeof CUR_MODAL!=='undefined'&&CUR_MODAL)&&!(document.getElementById('mainMenu')&&!document.getElementById('mainMenu').hidden&&document.getElementById('mainMenu').offsetParent)&&document.visibilityState!=='hidden';
  if(W.t0==null){if(shown){W.t0=now;W.last=now}return W}
  if(now-W.last>500)W.t0+=now-W.last-16;W.last=now; /* a hidden tab or a stall pauses the walk */
  if(now-W.t0>WALK91.maxMs+400)W.done=true;return W}
/* the drawn point of a walker: off-screen at the section end's stairway → up to the bench → along it to the seat */
function walkPos91(sp,si,seat,slot,idx,el){const R=crowdRows91();const s=SECTIONS[si];const a=s.half?6.6:0.25,len=6.15;
  const endAl=seat.al<len/2?-0.35:len+0.35;
  const out=SEATS91.d0+R*SEATS91.tier+1.6;const P=(d,al,row)=>{const p=pt(...secRC91(si,d,al));return {x:p.x,y:p.y-row*TW*SEATS91.lift}};
  const P0=P(out,endAl,R),P1=P(seat.d,endAl,seat.row),P2={x:seat.x,y:seat.y};
  const L1=Math.hypot(out-seat.d,0)+0.001,L2=Math.abs(endAl-seat.al)+0.001;
  let dur=(L1+L2)/WALK91.speed*1000;const h=(hashStr(String(sp.id)+'w91')%1000)/1000;let delay=idx*WALK91.stagger+h*700;
  if(delay+dur>WALK91.maxMs-150){dur=Math.min(dur,WALK91.maxMs*0.45);delay=Math.max(0,Math.min(delay,WALK91.maxMs-150-dur))}
  const t=el-delay;if(t<=0)return {x:P0.x,y:P0.y,hidden:true,walking:true};if(t>=dur)return null;
  const u=t/dur,f1=L1/(L1+L2);let x,y;if(u<f1){const v=u/f1;x=P0.x+(P1.x-P0.x)*v;y=P0.y+(P1.y-P0.y)*v}else{const v=(u-f1)/(1-f1);x=P1.x+(P2.x-P1.x)*v;y=P1.y+(P2.y-P1.y)*v}
  const bob=Math.abs(Math.sin(t/95))*TW*0.035;return {x,y:y-bob,walking:true,alpha:Math.min(1,t/260)}}
let WALK91_RAF=null,WALK91_LAST=0;
function walkLoop91(){if(WALK91_RAF||HEADLESS)return;WALK91_RAF=requestAnimationFrame(()=>{WALK91_RAF=null;const W=S&&WALKS91.get(S);if(!W||W.done)return;
  const now=performance.now();if(now-WALK91_LAST>=1000/WALK91.fps-2&&(typeof fxRAF==='undefined'||!fxRAF)){WALK91_LAST=now;try{draw()}catch(e){}}walkLoop91()})}

/* ---------- the stands: benches by the base, spectators by us ---------- */
{const base=drawStands;drawStands=function(){
  if(!CR91.on||HEADLESS||!S||!S.spect||typeof ctx==='undefined')return base.apply(this,arguments);
  const sv=S.spect;let r;S.spect=[];try{r=base.apply(this,arguments)}finally{S.spect=sv}
  const t0=performance.now();try{draw91()}catch(e){console.error(e)}const dt=performance.now()-t0;CR91.frames++;CR91.ms+=dt;CR91.last=dt;return r}}
function draw91(){const list=assignSeats91();const T=ctx.getTransform();CR91.T=T;const sc=Math.max(1,Math.hypot(T.a,T.b))||1;
  const W=walkState91();const el=W&&!W.done&&W.t0!=null?performance.now()-W.t0:null;const pre=W&&!W.done&&W.t0==null;let walking=false;
  const near={};for(let si=0;si<8;si++)near[si]=nearSec91(si);
  const idxIn={};const items=[];
  for(const sp of list){const a=SEAT91.get(sp);const si=sp.sec;if(!SECTIONS[si])continue;const seat=seatXY91(si,a.slot);sp._x=seat.x;sp._y=seat.y;
    let pos={x:seat.x,y:seat.y};if(pre){pos=null;walking=true}else if(el!=null){const i=idxIn[si]=(idxIn[si]==null?0:idxIn[si]+1);const w=walkPos91(sp,si,seat,a.slot,i,el);if(w){walking=true;pos=w.hidden?null:w}}
    if(!pos){DRAWN91.set(sp,{x:NaN,y:NaN,hidden:true});continue}DRAWN91.set(sp,{x:pos.x,y:pos.y,walking:!!pos.walking});items.push({sp,si,pos,back:near[si]})}
  if(walking)walkLoop91();else if(W&&!W.done&&W.t0!=null)W.done=true;
  items.sort((a,b)=>a.pos.y-b.pos.y);
  const H=TW*SIZE91,u=H/100;const onl=S.onl;const seen=CR91.seen=[];
  for(const it of items){const {sp,pos}=it;const x=pos.x,y=pos.y;ctx.save();if(pos.alpha!=null&&pos.alpha<1)ctx.globalAlpha=pos.alpha;
    if(onl&&sp.cush82){ctx.fillStyle=sp.cush82[0];ctx.beginPath();ctx.ellipse(x,y+TW*0.035,TW*0.14,TW*0.05,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=sp.cush82[1];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-TW*0.12,y+TW*0.035);ctx.lineTo(x+TW*0.12,y+TW*0.035);ctx.stroke()}
    if(sp.human){ctx.fillStyle='rgba(240,207,125,.18)';ctx.beginPath();ctx.ellipse(x,y+TW*0.01,TW*0.17,TW*0.06,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f0cf7d';ctx.lineWidth=Math.max(1.4,TW*0.035);ctx.stroke()}
    const o=look91(sp,it.back);seen.push({id:sp.id,sec:it.si,back:o.back,laurel:o.laurel,mood:o.mood,human:!!sp.human,x,y});const c=sprite91(o,H*sc);const k=u;ctx.drawImage(c,x-32*k,y-94*k,64*k,104*k);ctx.restore()}}

/* ---------- hover: name the spectator under the pointer ---------- */
const HOV91={sp:null};
function spectAt91(e){if(!S||!S.spect||!CR91.T||!STANDS)return null;const R=cv.getBoundingClientRect();if(!R.width)return null;
  const px=(e.clientX-R.left)*cv.width/R.width,py=(e.clientY-R.top)*cv.height/R.height;let p;try{p=CR91.T.inverse().transformPoint(new DOMPoint(px,py))}catch(er){return null}
  let best=null,bd=1e9;for(const sp of S.spect){if(sp.gone||sp._x==null)continue;const D=DRAWN91.get(sp);const x=D&&Number.isFinite(D.x)?D.x:sp._x,y=D&&Number.isFinite(D.y)?D.y:sp._y;
    const dx=Math.abs(p.x-x),dy=p.y-(y-TW*SIZE91*0.45);if(dx>TW*0.17||Math.abs(dy)>TW*SIZE91*0.55)continue;const d=dx*dx+dy*dy;if(d<bd){bd=d;best=sp}}return best}
function spectLine91(sp){const reg=reg91(sp);const sec=SECTIONS[sp.sec];const fav=sp.fav!=null&&S.players[sp.fav]?S.players[sp.fav]:null;
  const bits=[`🏟 <b>${esc(sp.name)}</b>`];if(sp.human)bits.push(_T('you, in the stands'));else if(reg)bits.push(sp.visits?_T`a regular · ${sp.visits} visits`:_T('a regular'));
  if(sec)bits.push(esc(sec.n));bits.push(moodEmo(sp.mood||0));if(fav)bits.push(_T`cheers for ${esc(fav.name)}`);return bits.join(' · ')}
if(typeof cv!=='undefined'&&cv&&cv.addEventListener){
  cv.addEventListener('mousemove',e=>{try{const sp=spectAt91(e);const h=document.getElementById('hover');if(!h)return;
    if(sp){if(HOV91.sp!==sp){HOV91.sp=sp;h.innerHTML=spectLine91(sp)}}else if(HOV91.sp){HOV91.sp=null;h.innerHTML=describeTile(typeof hoverTile!=='undefined'?hoverTile:null)}}catch(er){}});
  cv.addEventListener('mouseleave',()=>{HOV91.sp=null})}

/* ---------- the sculpted board tokens face the middle of the sand ---------- */
const MIR91={on:true,img:new Map(),last:false,log:[]}; /* TWEAK: on = mirror the right-hand figures */
function mirImg91(spec,key){let im=MIR91.img.get(key);if(!im){im=new Image();im.onload=()=>{try{draw()}catch(e){}};let lit;SC3D_THICK=true;try{lit=sc3dSVG(figureSVG(spec))}finally{SC3D_THICK=false}
    lit=lit.replace(/(<g transform="translate\(50 157\) scale\()([-\d.e]+)( )/,(m,a,s,b)=>a+(-(+s))+b).replace('azimuth="225"','azimuth="315"');
    im.src='data:image/svg+xml,'+encodeURIComponent(lit.replace('viewBox="0 0 100 170" width="100" height="170"','viewBox="0 0 100 '+SC3D_VH+'" width="100" height="'+SC3D_VH+'"'));MIR91.img.set(key,im);
    if(MIR91.img.size>240)MIR91.img.delete(MIR91.img.keys().next().value)}
  return im}
const midX91=()=>{try{return center((N-1)/2,(N-1)/2).x}catch(e){return 0}};
if(typeof drawFigureTok==='function'&&typeof sc3dCanvas==='function'){const base=drawFigureTok;drawFigureTok=function(sp,x,y,h,opt={}){MIR91.last=false;
  try{if(MIR91.on&&SC3D.on&&!HEADLESS&&sp&&S&&x>midX91()+TW*0.3){const key='M91|'+JSON.stringify(sp);const im=mirImg91(sp,key);
      if(im.complete&&im.naturalWidth){if(SC3D_IMG.get(key)!==im)SC3D_IMG.set(key,im);const T=ctx.getTransform();const sc=Math.max(1,Math.hypot(T.a,T.b))||1;const c=sc3dCanvas(sp,key,sc3dBucket(h*sc));
        if(c){const k=h/c._px;const w=h*100/170,top=y-h*(157/170);ctx.save();if(opt&&opt.filter)ctx.filter=opt.filter;ctx.drawImage(c,x-w/2-c._pad*k,top,c.width*k,c.height*k);ctx.restore();
          MIR91.last=true;if(MIR91.log.length<64)MIR91.log.push({x,mid:midX91()});const t=top+h*0.12;try{TOP83=t}catch(e){}return t}}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* arrows stuck in a mirrored figure flip with it (the "+N" count stays readable) */
if(typeof drawStuckOn83==='function'){const base=drawStuckOn83;drawStuckOn83=function(q,m){if(!MIR91.last||!m)return base.apply(this,arguments);
  const ft=ctx.fillText,st=ctx.strokeText;ctx.save();ctx.translate(m.x,0);ctx.scale(-1,1);ctx.translate(-m.x,0);
  const un=f=>function(t,X,Y){this.save();this.translate(X,Y);this.scale(-1,1);const r=f.call(this,t,0,0);this.restore();return r};ctx.fillText=un(ft);ctx.strokeText=un(st);
  try{return base.apply(this,arguments)}finally{ctx.fillText=ft;ctx.strokeText=st;ctx.restore()}}}
{const base=drawPlayer;drawPlayer=function(){MIR91.last=false;return base.apply(this,arguments)}}
{const base=drawNPC;drawNPC=function(){MIR91.last=false;return base.apply(this,arguments)}}
