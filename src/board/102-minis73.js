/* =====================================================================
   102-MINIS73 · v0.73 — the 3D minis turn to face where they move (Virgilante)
   =====================================================================
   Each mini has eight renders (assets/minis8_<key>.webp, one row of cells: toward the camera, then every 45° clockwise).
   A piece faces the way it last stepped (MINI_FACE on the player / beast); a new piece faces the camera (gladiators) or
   three-quarters (beasts on long bases). Panels keep the single front view (mini_<key>.webp). */
const MINI8_URL={hero:'assets/minis8_hero.webp',veteranus:'assets/minis8_veteranus.webp',amazonia:'assets/minis8_amazonia.webp',damnatio:'assets/minis8_damnatio.webp',royalty:'assets/minis8_royalty.webp',soldier:'assets/minis8_soldier.webp',slave:'assets/minis8_slave.webp',venatore:'assets/minis8_venatore.webp',commodus:'assets/minis8_commodus.webp',tholo:'assets/minis8_tholo.webp',arenosus:'assets/minis8_arenosus.webp',glykon:'assets/minis8_glykon.webp',moechus:'assets/minis8_moechus.webp',valencia:'assets/minis8_valencia.webp',zora:'assets/minis8_zora.webp',ursa:'assets/minis8_ursa.webp',brutum:'assets/minis8_brutum.webp',leo:'assets/minis8_leo.webp',leaena:'assets/minis8_leaena.webp'};
const MINI8={hero:[106,115,52.8,95.1],veteranus:[80,124,40.2,104.5],amazonia:[111,136,55.6,116.0],damnatio:[80,125,40.2,105.0],royalty:[82,130,41.2,110.5],soldier:[95,129,47.3,109.4],slave:[138,133,68.8,113.3],venatore:[105,128,52.3,107.8],commodus:[97,161,48.4,141.3],tholo:[123,140,61.6,119.9],arenosus:[80,62,40.2,42.3],glykon:[80,65,40.2,45.1],moechus:[81,82,40.7,62.1],valencia:[90,82,45.1,62.1],zora:[86,72,42.9,52.2],ursa:[207,166,103.4,125.9],brutum:[207,166,103.4,125.9],leo:[170,152,85.2,112.7],leaena:[161,133,80.3,93.5]}; /* key → [cell width, cell height, anchor x, anchor y] in sheet px */
const MINI_YAW=[0,45,90,135,180,-135,-90,-45];
const MINI8_IMG={};
function mini8Img(k){if(HEADLESS||!MINI8_URL[k])return null;let im=MINI8_IMG[k];if(!im){im=new Image();im.onload=()=>{try{draw()}catch(e){}};im.src=MINI8_URL[k];MINI8_IMG[k]=im}return im.complete&&im.naturalWidth?im:null}
let MINI_CUR=null;
/* the facing index of piece p from its last step (dr,dc on the grid → a yaw on screen) */
function miniFace(p,k){if(!p)return 0;if(p._fr==null){p._fr=p.r;p._fc=p.c;p._face=['ursa','brutum','leo','leaena'].includes(k)?1:0}
  const dr=p.r-p._fr,dc=p.c-p._fc;if(dr||dc){const a=Math.atan2(dc-dr,dc+dr)*180/Math.PI;let best=0,bd=1e9;MINI_YAW.forEach((y,i)=>{let d=Math.abs(((a-y)%360+540)%360-180);if(d<bd){bd=d;best=i}});p._face=best;p._fr=p.r;p._fc=p.c}
  return p._face||0}
{const base=drawPlayer;drawPlayer=function(p){MINI_CUR=p;try{return base.apply(this,arguments)}finally{MINI_CUR=null}}}
{const base=drawNPC;drawNPC=function(n){MINI_CUR=n;try{return base.apply(this,arguments)}finally{MINI_CUR=null}}}
{const base=miniDraw;miniDraw=function(k,x,y,opt={}){const M=MINI8[k];const im=M&&MINI_CUR?mini8Img(k):null;if(!im||!MINI_A[k])return base.apply(this,arguments);
  const i=miniFace(MINI_CUR,k);const s=miniScale(k);const a=MINI_A[k];
  ctx.save();ctx.fillStyle='rgba(0,0,0,.32)';const rw=Math.min(a[2]*TW*MINI_BASE/25.4,TW*MINI_FIT)*0.55;fl104Sh(x+2,y+3,rw,rw*0.5);
  if(opt.dim)ctx.globalAlpha=opt.dim;if(opt.filter)ctx.filter=opt.filter;ctx.drawImage(im,i*M[0],0,M[0],M[1],x-M[2]*s,y-M[3]*s,M[0]*s,M[1]*s);ctx.restore();return y-M[3]*s}}
