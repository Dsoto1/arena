/* 376-v105city (v1.05 B47, his beta-2 screenshot: a house sat UNDER the arena's grey outer wall in the City Square; display only, no rules/dice/saves)
   ROOT CAUSE: the ring of outer houses (172 outer89, procedural, seeded by the city name, NOT hand-placed) only kept a block out of the
   amphitheatre ellipse by testing 5 points of its footprint, and nothing looked at the SCREEN: the baked ground layer (houses) is painted
   first and the arena sprite always on top, so a tall house standing NEARER the camera than the arena's rim (blocks beside/in front of the
   arena's right and left flank) was painted over by the wall: the building looked placed inside the arena.
   FIX: outer89 is wrapped (it is a function, so wrappable; the base still draws every rnd() so every other block keeps its look and place) and
   drops a block when (1) any point of its footprint lies inside the arena ellipse widened by 0.6 tile, (1b) its foot (ground footprint) lies inside the arena's screen silhouette, i.e. the wall hides the base of the house behind it and only the roof peeks out (the white-walled house in his screenshot), or (2) its screen silhouette
   (footprint at ground + roof height) overlaps the arena's silhouette and it stands nearer the camera than the rim at that spot (the case
   the wall used to hide). A block behind the arena may still rise above the rim: that is the skyline, and the arena is correctly in front.
   Deterministic per city (pure geometry of the seeded layout, never the dice). The result is kept in CITY105.last[cityName] for tests.
   Kill switch: localStorage flavius_v105cityoff=1 (the old layout). */
const CITY105={on:true,margin:0.6,last:{}};
try{if(localStorage.getItem('flavius_v105cityoff')==='1')CITY105.on=false}catch(e){}
/* city105Hull — convex hull (monotone chain) of [x,y] points */
function city105Hull(p){p=p.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[];for(const q of p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
  const up=[];for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}up.pop();lo.pop();return lo.concat(up)}
/* city105Overlap — do two convex polygons overlap (separating-axis test) */
function city105Overlap(a,b){for(const P of [a,b])for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];const nx=q[1]-p[1],ny=p[0]-q[0];
    let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;for(const s of a){const d=s[0]*nx+s[1]*ny;if(d<a0)a0=d;if(d>a1)a1=d}for(const s of b){const d=s[0]*nx+s[1]*ny;if(d<b0)b0=d;if(d>b1)b1=d}
    if(a1<=b0||b1<=a0)return false}return true}
/* screen units of one tile width T: x = (c-r)/2, y = (c+r)/4 - z*ZK89 (same as P89/UV89) */
function city105Scr(r,c,z){return [(c-r)/2,(c+r)/4-z*ZK89]}
function city105ArenaHull(){const A=ARENA89,pts=[];for(let k=0;k<48;k++){const t=k/48*Math.PI*2;const u=A.u0+A.a*Math.cos(t),v=A.v0+A.b*Math.sin(t);for(const z of [0,A.H+1.4])pts.push([u/2,v/4-z*ZK89])}return city105Hull(pts)}
/* city105Hit — why a block must go: 'footprint' (inside the widened ellipse), 'under' (its foot lies inside the arena's screen silhouette: the wall hides the base of the house and only the roof shows), 'front' (its silhouette overlaps the arena's and it stands nearer the camera), or null */
function city105Hit(O,margin){const A=ARENA89,m=margin==null?CITY105.margin:margin;const R0=O.r0-0.5,R1=O.r1+0.5,C0=O.c0-0.5,C1=O.c1+0.5;
  for(let r=R0;r<=R1+1e-9;r+=0.125)for(let c=C0;c<=C1+1e-9;c+=0.125){const u=c-r,v=c+r;if(((u-A.u0)/(A.a+m))**2+((v-A.v0)/(A.b+m))**2<=1)return 'footprint'}
  const base=[];for(const [r,c] of [[R0,C0],[R0,C1],[R1,C1],[R1,C0]])base.push(city105Scr(r,c,0));
  if(city105Overlap(city105Hull(base),city105ArenaHull()))return 'under'; /* its foot is hidden by the wall */
  const top=(O.h||1)+0.9,pts=[];for(const [r,c] of [[R0,C0],[R0,C1],[R1,C1],[R1,C0]])for(const z of [0,top])pts.push(city105Scr(r,c,z));
  if(!city105Overlap(city105Hull(pts),city105ArenaHull()))return null;
  const uc=(C0+C1)/2-(R0+R1)/2,vc=(C0+C1)/2+(R0+R1)/2,du=(uc-A.u0)/A.a;const rim=A.v0+(Math.abs(du)<1?A.b*Math.sqrt(1-du*du):0);
  return vc>rim-1?'front':null}
{const base=outer89;outer89=function(seed){const out=base.apply(this,arguments);if(!CITY105.on)return out;
  try{const keep=[],cut=[];for(const O of out){const why=city105Hit(O);if(why)cut.push({r0:O.r0,r1:O.r1,c0:O.c0,c1:O.c1,why});else keep.push(O)}
    CITY105.last[seed]={kept:keep,cut};return keep}catch(e){console.error(e);return out}}}
/* city105Placed — the blocks the square draws for a city (name or index), as tests read them */
function city105Placed(n){if(typeof n==='number')n=LOCATIONS[n].n;return outer89(hash89(n))}
