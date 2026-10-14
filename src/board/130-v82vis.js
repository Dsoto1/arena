/* =====================================================================
   130-V82VIS · v0.82 — three visual fixes (Virgilante)
   =====================================================================
   1. Pillar shadows sit under the base: a soft ellipse about the base's width (≈1.05×), like the gladiators' and
      beasts' shadows. 3D minis: the pillar mini (MINI_PILLAR × MINI_PILLAR75) gets its own shadow from its real base
      footprint (94-v72's miniDraw sized it from the unscaled 30 mm base → twice too wide). Classic pillar (every other
      token style): the 07-ui pillar drawn here with a shadow the width of its plinth. PILLAR_SHADOW82 = the last
      shadow drawn {w, base} (px) for the tests.
   2. Floor spikes repainted in the arena palette: a dark iron plate with a bronze rim on a soft burn of shadow in the
      sand; four iron spikes lit bronze on one side, tips brighter while raised. Sinking (the post-show winches) fades the
      tips into the plate; fully down = a flat iron plate with four dark sockets. A colour picked in Settings → Furniture
      (THEME.spike) still tints the plate. SPIKE82 = the palette.
   3. Pieces face the way they attack: doAttack (players, chariots through it), tamedAttack and every blow that reaches
      defend (beasts on players, PvP) turn the attacker toward its target — the 3D minis' eight facings (102-minis73
      p._face, kept by _fr/_fc so the next step still turns it). Visual only: onlHash (113) never reads _face/_fr/_fc,
      and it is set from the same deterministic game events on every screen. Flat tokens have no mirrored art — skipped.
   ===================================================================== */

/* ---- 1. pillar shadows ---- */
const PILLAR_SH82=1.05; /* TWEAK: shadow width against the base width */
let PILLAR_SHADOW82=null;
function pillarShadow82(x,y,baseW){const rw=baseW*PILLAR_SH82/2;ctx.save();ctx.fillStyle='rgba(0,0,0,.32)';ell(x+1.5,y+2,rw,rw*0.48);ctx.fill();ctx.restore();PILLAR_SHADOW82={w:rw*2,base:baseW}}
/* the pillar mini: own shadow from the footprint actually drawn */
{const base=miniDraw;miniDraw=function(k,x,y,opt={}){if(k!=='pillar')return base.apply(this,arguments);const im=miniImg(k),a=MINI_A[k];if(!im||!a)return null;const s=miniScale(k);
  pillarShadow82(x,y,a[2]*MINI_PXMM*s);
  ctx.save();if(opt.dim)ctx.globalAlpha=opt.dim;if(opt.filter)ctx.filter=opt.filter;ctx.drawImage(im,x-a[0]*s,y-a[1]*s,im.naturalWidth*s,im.naturalHeight*s);ctx.restore();return y-a[1]*s}}
/* the classic pillar (figure / standee / cylinder / panel styles, and the minis' fallback while the image loads) */
function drawPillar82(pl){const m=center(pl.r,pl.c);const rx=TW*0.17,h=TW*0.95;
  pillarShadow82(m.x,m.y,TW*0.52);
  ctx.fillStyle=THEME.pillarBase||'#bdb3a0';ctx.fillRect(m.x-TW*0.26,m.y-TW*0.08,TW*0.52,TW*0.1);
  const pc=THEME.pillar||'#ece4d4';const g=ctx.createLinearGradient(m.x-rx,0,m.x+rx,0);g.addColorStop(0,shade(pc,-0.34));g.addColorStop(.45,pc);g.addColorStop(1,shade(pc,-0.27));
  ctx.fillStyle=g;ctx.fillRect(m.x-rx,m.y-h,rx*2,h-TW*0.06);
  ctx.strokeStyle='rgba(80,70,55,.4)';ctx.lineWidth=1;for(const f of [-.5,0,.5]){ctx.beginPath();ctx.moveTo(m.x+f*rx,m.y-h+4);ctx.lineTo(m.x+f*rx,m.y-TW*0.1);ctx.stroke()}
  ctx.fillStyle=shade(pc,-0.07);ctx.fillRect(m.x-TW*0.24,m.y-h-TW*0.09,TW*0.48,TW*0.1);
  let y=m.y-h-TW*0.09;pl.pots.forEach(()=>{drawPot(m.x,y,TW*0.46,false);y-=TW*0.44});
  if(pl.pots.length>1&&TW>28){ctx.fillStyle='#f0cf7d';ctx.font=`500 ${Math.round(TW*0.18)}px IBM Plex Mono, monospace`;ctx.fillText('×'+pl.pots.length,m.x+TW*0.34,m.y-h)}}
{const base=drawPillar;drawPillar=function(pl){if(!pl||pl.f76||pl.w76||!pl.pots)return base.apply(this,arguments);
  if(typeof miniOn==='function'&&miniOn()&&miniImg('pillar'))return base.apply(this,arguments);return drawPillar82(pl)}}

/* ---- 2. floor spikes ---- */
const SPIKE82={plate:'#3a3129',plateHi:'#54473a',rim:'#8a6a3a',dark:'#2a231d',lit:'#a8834d',tip:'#e6c88e',socket:'#17120e',burn:'rgba(45,28,12,.30)'}; /* TWEAK: iron and bronze */
function spikePlate82(){const t=THEME.spike;return !t||t==='#6d6862'?SPIKE82.plate:shade(t,-0.35)}
{const base=drawSpikeTile;drawSpikeTile=function(s,sh9){if(!s)return base.apply(this,arguments);
  const m=center(s.r,s.c),P=spikePlate82(),up=Math.max(0,Math.min(1,sh9));
  /* the sand darkens under the plate */
  tilePath(s.r,s.c,TW*0.05);ctx.fillStyle=SPIKE82.burn;ctx.fill();
  /* the iron plate, lit from the upper right, a bronze rim */
  tilePath(s.r,s.c,TW*0.13);const g=ctx.createLinearGradient(m.x-TW*0.4,m.y,m.x+TW*0.4,m.y);g.addColorStop(0,shade(P,-0.2));g.addColorStop(.6,P);g.addColorStop(1,P===SPIKE82.plate?SPIKE82.plateHi:shade(P,0.15));
  ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=SPIKE82.rim;ctx.globalAlpha=0.75;ctx.lineWidth=Math.max(1,TW*0.02);ctx.stroke();ctx.globalAlpha=1;
  /* back to front: the far spike first */
  for(const [dx,dy] of [[0,-.07],[-.14,0],[.14,0],[0,.07]]){const x=m.x+dx*TW,y=m.y+dy*TW,bw=TW*0.05;
    ctx.fillStyle=SPIKE82.socket;ell(x,y+1,bw*1.05,bw*0.5);ctx.fill();
    if(up<=0.03)continue;const ht=TW*0.2*up;
    ctx.fillStyle='rgba(20,12,4,.35)';ell(x+bw*0.9,y+2,bw*1.1,bw*0.4);ctx.fill();
    ctx.beginPath();ctx.moveTo(x-bw,y+1);ctx.lineTo(x,y-ht);ctx.lineTo(x,y+2);ctx.closePath();ctx.fillStyle=SPIKE82.dark;ctx.fill();
    ctx.beginPath();ctx.moveTo(x,y-ht);ctx.lineTo(x+bw,y+1);ctx.lineTo(x,y+2);ctx.closePath();ctx.fillStyle=SPIKE82.lit;ctx.fill();
    ctx.beginPath();ctx.moveTo(x-bw*0.3,y-ht*0.7);ctx.lineTo(x,y-ht);ctx.lineTo(x+bw*0.3,y-ht*0.7);ctx.closePath();ctx.globalAlpha=0.35+0.65*up;ctx.fillStyle=SPIKE82.tip;ctx.fill();ctx.globalAlpha=1}}}

/* ---- 3. facing the target ---- */
/* face82 — turns piece a toward b (anything with r,c) among the minis' eight facings; returns the facing index or null */
function face82(a,b){try{if(!a||!b||a.r==null||b.r==null)return null;const dr=b.r-a.r,dc=b.c-a.c;if(!dr&&!dc)return null;
  const ang=Math.atan2(dc-dr,dc+dr)*180/Math.PI;let best=0,bd=1e9;MINI_YAW.forEach((y,i)=>{const d=Math.abs(((ang-y)%360+540)%360-180);if(d<bd){bd=d;best=i}});
  a._face=best;a._fr=a.r;a._fc=a.c;return best}catch(e){return null}}
const tgtSpot82=t=>t&&(t.ref&&t.ref.r!=null&&t.kind!=='pot'&&t.kind!=='ship'?t.ref:t);
{const base=doAttack;doAttack=async function(player,source,target){face82(player,tgtSpot82(target));return base.apply(this,arguments)}}
{const base=tamedAttack;tamedAttack=async function(npc,player,target){face82(npc,tgtSpot82(target));return base.apply(this,arguments)}}
{const base=defend;defend=async function(victim,damage,location,pw,bonus,h,attackerName,attacker){if(attacker&&attacker!==victim)face82(attacker,victim);return base.apply(this,arguments)}}
