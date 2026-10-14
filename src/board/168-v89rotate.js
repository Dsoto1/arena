/* =====================================================================
   168-V89ROTATE · v0.89 — my corner at the bottom (Virgilante)
   =====================================================================
   A DISPLAY-ONLY turn of the board in 90° steps so the human's starting corner sits at the bottom of the
   screen, as at a real table where everyone sits at their own side. Rules, positions, tile names (A-1…),
   the log, saves and the online hash never see it — only drawing and the click/hover input turn.
   - ROT89.k = quarter turns (0-3), decided at every draw() from stable facts (rot89Want): the one human's
     start tile (p.start) offline, the own seat (S.onl.seat) online. So it never spins when turns change.
   - ON: one human at the table (Play Now, Manager bouts, missios, tournaments…) and online fighters.
     OFF: hot seat (S.hotseat, or 2+ humans outside a Manager bout), Chariot Racing, Naumachia, lessons
     (S.tutorial / tutShow / TUT.on / the Manager lesson league), online watchers and ticket holders,
     sims and all-CPU tables.
   - How: iso(r,c) (07-ui) projects the TURNED tile index (rot89 about the board centre (N-1)/2), so
     center/tilePath/pt (16-crowd stands) and every sprite follow. isoFix = the unturned projection for the
     square rim + centred zone ropes and Flavius. dep89 = draw depth (sort order) in the turned view.
     pick (screen → tile) turns back. camFocus returns the turned tile. Minis' facing index turns by 2 cells
     per quarter (miniFace; face89 for 132's stuck arrows). The beast pen fence (108) is redrawn in view.
   - Flavius's box: flavXY89 = always the top centre of the canvas (16-crowd, 56, 60, 93, 129 call it). */
const ROT89={k:0};
/* rot89 — tile index (r,c) turned k quarter turns about the board centre (fractional values allowed). */
function rot89(r,c,k){const M=N-1;switch(((k%4)+4)%4){case 1:return [c,M-r];case 2:return [M-r,M-c];case 3:return [M-c,r];default:return [r,c]}}
/* rot89Want — how many quarter turns put the viewer's own corner at the bottom (0 = the standard view). */
function rot89Want(){try{
  if(!S||HEADLESS||!S.players||!S.players.length)return 0;
  if(S.sim||S.snap)return 0;
  if(typeof isChariot==='function'&&isChariot())return 0;
  if(typeof isNaum==='function'&&isNaum())return 0;
  if(S.tutorial||S.tutShow||(typeof TUT!=='undefined'&&TUT&&TUT.on))return 0;
  if(S.mgrCtx&&typeof MGR!=='undefined'&&MGR.world&&MGR.world.tutorial)return 0;
  if(S.hotseat)return 0;
  let p=null;
  if(S.onl){const s=S.onl.seat;if(typeof s!=='number'||s<0||s>=S.players.length)return 0;p=S.players[s]}
  else{const hum=S.players.filter(q=>q&&!q.cpu);if(!hum.length)return 0;if(hum.length>1&&!S.mgrCtx)return 0;p=hum[0]}
  if(!p)return 0;const st=p.start&&p.start.length===2?p.start:[p.r,p.c];if(st[0]==null||st[1]==null)return 0;
  let best=0,bs=-1e9;for(let k=0;k<4;k++){const [a,b]=rot89(st[0],st[1],k);const sc=(a+b)*100-Math.abs(a-b);if(sc>bs+1e-9){bs=sc;best=k}}
  return best}catch(e){return 0}}
/* rot89Now — refreshes ROT89.k (draw and pick call it). */
function rot89Now(){ROT89.k=rot89Want();return ROT89.k}
/* iso: the turned view */
{const base=iso;iso=function(r,c){if(ROT89.k){const v=rot89(r,c,ROT89.k);return base(v[0],v[1])}return base(r,c)}}
/* dep89: depth in the turned view (07-ui sorts pieces by it) */
dep89=function(r,c){if(!ROT89.k)return r+c;const v=rot89(r,c,ROT89.k);return v[0]+v[1]};
/* draw: decide the turn first */
{const base=draw;draw=function(){rot89Now();return base.apply(this,arguments)}}
/* pick: the clicked/hovered view tile back to the real tile */
{const base=pick;pick=function(e){const t=base.apply(this,arguments);if(!t||!ROT89.k)return t;const v=rot89(t.r,t.c,4-ROT89.k);return {r:v[0],c:v[1]}}}
/* the follow camera centres on the turned tile */
if(typeof camFocus==='function'){const base=camFocus;camFocus=function(){const f=base.apply(this,arguments);if(!f||!ROT89.k)return f;const v=rot89(f.r,f.c,ROT89.k);return {...f,r:v[0],c:v[1]}}}
/* face89 — a mini's facing index (grid frame, 102/130) as seen in the turned view: −90° (2 cells) per quarter turn */
function face89(i){if(i==null||!ROT89.k)return i;return (((i-2*ROT89.k)%8)+8)%8}
/* a piece that has not stepped or turned yet keeps its screen default (gladiators toward the camera, long bases three-quarter) */
const FACE89_D=new WeakMap();
if(typeof miniFace==='function'){const base=miniFace;miniFace=function(p){const fresh=p&&p._fr==null;const i=base.apply(this,arguments);if(!p||typeof p!=='object')return face89(i);
  if(fresh)FACE89_D.set(p,[p.r,p.c,i]);const d=FACE89_D.get(p);if(d){if(d[0]===p.r&&d[1]===p.c&&d[2]===i)return i;FACE89_D.delete(p)}return face89(i)}}
/* the beast pen (108-v76): fence spans drawn from their turned grid points, sorted in the view */
/* gpt89 — a GRID POINT (tile corner) turned about N/2 (iso's turn is about the tile centres) */
const gpt89=(r,c,k)=>{const v=rot89(r-0.5,c-0.5,k);return [v[0]+0.5,v[1]+0.5]};
if(typeof penPieces76==='function'){const base=penPieces76;penPieces76=function(){const out=base.apply(this,arguments);const k=ROT89.k;if(!k)return out;
  const [a,b]=PEN76.box;const cs=[gpt89(a,a,k),gpt89(b+1,b+1,k)];const lo=Math.min(cs[0][0],cs[1][0]);
  for(const o of out)if(o.f76){const [i0,j0,i1,j1]=o.f76;const A=gpt89(i0,j0,k),B=gpt89(i1,j1,k);o.v89=[A[0],A[1],B[0],B[1]];
    const line=A[0]===B[0]?A[0]:A[1];const front=line>lo;o.d89=(A[0]+B[0]+A[1]+B[1])/2-(front?0.9:1);o.lo89=lo}
  return out}}
if(typeof penFence76==='function'&&typeof drawPillar==='function'){const base=drawPillar;drawPillar=function(pl){if(pl&&pl.f76&&pl.v89&&ROT89.k){
    const k=ROT89.k,b0=PEN76.box[0];ROT89.k=0;PEN76.box[0]=pl.lo89;try{return penFence76(pl.v89)}finally{ROT89.k=k;PEN76.box[0]=b0}}
  return base.apply(this,arguments)}}
/* flavXY89 — Flavius's box: the top centre of the arena canvas in every event, turned or not */
function flavXY89(){const k=typeof flavK==='function'?flavK():1;const w=TW*1.55*k,h=TW*1.2*k;
  const wrap=typeof cv!=='undefined'&&cv&&cv.parentElement;const Wd=wrap&&wrap.clientWidth?wrap.clientWidth:(typeof cv!=='undefined'&&cv?cv.clientWidth:0)||OX*2;
  const a=isoFix(0,0);const cy=STANDS?Math.max(h/2+6,a.y-TW*2.62-h/2):h/2+6;return {cx:Wd/2,cy,w,h}}
