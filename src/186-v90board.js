/* =====================================================================
   186-V90BOARD · v0.90 part B (Virgilante, 2026-10-05/06)
   =====================================================================
   1. THOLO AND THE LIONS HUNT THE CLOSEST LIVING THING (his card: "A Tholo that is not aggro scans the arena for the
      closest living player to start each resolve phase" — he: the closest living THING, beasts included).
      (v0.92, his rule: beasts act only on their target's turn — see npcTrigger below.)
      At the start of EVERY gladiator's Resolve phase a non-aggro, untamed, un-lyred Tholo, Leo or Leaena (NPCT tholo /
      lion; other scan beasts keep 04's rule) finds the closest living target by Chebyshev distance: gladiators (not
      underground / exited) and other beasts (not itself, not its own kind — a lion never hunts a lion, HUNT90.sameKind —
      and never the Golden Eagle). TIES: a gladiator before a beast; among gladiators the one whose turn is now or comes
      next (closestPlayer's order from S.cur); among beasts the first in S.npcs. Then it acts: vs a gladiator = 04 npcAct
      on THAT gladiator (it may not be the one resolving); vs a beast = walk next to it and strike with the same dice and
      attack power through hurtNPC (byNpc = the hunter, so the kill is his). When Tholo kills a beast its coin reward
      (NPCT[t].coin, + its own hoard) joins Tholo's hoard (players' coin already does) — his killer earns 12 + hoard.
      Aggro, adjacency and zones are untouched (they fire first, as before). Deterministic: seeded dice only, inside the
      engine. HUNT90.on = false gives back the old rule (the sims' "before"; tools/huntsim.js).
      (Knob if too deadly — NOT built: scan every Resolve but strike at most once per rotation.)
   2. CROWD FAVOR action tile: disabled when nothing in the Crowd Favor window can be paid (every CF buy costs more than
      the CF on hand, no 10-coin throw, no spear target), or while Commodus blocks CF — with the reason in its sub-line.
   3. BLESSINGS ON PILLARS AS TOKEN ROUNDS (Settings → On the board → "Blessings on pillars": Clay pots / Token rounds;
      SETTINGS.pots90, per viewer): token mode draws each pillar's Blessings as a small stack of his round tokens,
      BLESSING FACE UP (rtok 'blessing'), so the offering stays hidden; a broken one flips to its OFFERING face (the
      offering's medallion, 48 ftCanvas) and drops to where the offering lands (or rises and fades for spiders / curse /
      CF, which never touch the sand) — in place of the pot picture (03 breakPot's fx 'blessing'). Rules/dice/log as before.
   4. HOT-SEAT TURNING BOARD (Settings → On the board, SETTINGS.hsTurn90, off by default): with 2+ humans on one screen
      the board turns (168 ROT89) to the active human's start corner at the start of each human's turn; CPU turns keep
      the last human's view. A short eased spin (continuous turn through iso), or an instant cut with Reduce motion /
      Animations Off. Never Chariot, Naumachia, lessons, online, sims. Display only.
   ===================================================================== */

/* ---------- 1. the hunters ---------- */
const HUNT90={on:true,sameKind:false,seq:0,live:null,map:new WeakMap()}; /* TWEAK: on = the v0.90 rule; sameKind = lions may hunt lions */
/* hunter90 — a beast that hunts the closest living thing (Tholo, Leo, Leaena) */
const hunter90=n=>!!(n&&(n.t==='tholo'||n.t==='lion'));
/* closestThing90 — the hunter's prey: {kind:'player'|'npc',ref,d} or null (ties: gladiators first, from S.cur on) */
function closestThing90(n){let best=null,bd=1e9;
  for(let i=0;i<S.players.length;i++){const q=S.players[(S.cur+i)%S.players.length];if(!q||!q.alive||q.underground||q.exited)continue;
    const d=cheb(n,q);if(d<bd){bd=d;best={kind:'player',ref:q,d}}}
  for(const m of S.npcs){if(!m||m===n||!m.alive||m.t==='zora')continue;if(!HUNT90.sameKind&&m.t===n.t)continue;
    const d=cheb(n,m);if(d<bd){bd=d;best={kind:'npc',ref:m,d}}}
  return best}
{const base=resolvePhase;resolvePhase=async function(player){const keep=HUNT90.live;HUNT90.live=player;HUNT90.seq++;
  try{return await base.apply(this,arguments)}finally{HUNT90.live=keep}}}
{const base=npcTrigger;npcTrigger=function(npc,player){const why=base.apply(this,arguments);
  if(!HUNT90.on||!hunter90(npc)||HUNT90.live!==player)return why;
  HUNT90.map.delete(npc);
  if(why==='aggro'||why==='opportunist'||why==='adjacent'||why==='zone')return why;
  if(!npc.alive||npc.tamedBy!=null||npc.lyred!=null||npc.aggro!=null)return why;
  const prey=closestThing90(npc);if(!prey)return null;
  /* v0.92 (his rule): a beast acts only on its target's turn — a gladiator prey is struck in HIS OWN Resolve (else the hunter
     waits; someone stepping closer or hitting it changes that); a beast prey (beasts have no turn) is struck in the Resolve of
     the gladiator closest to the hunter (ties: lowest seat), so once a rotation */
  if(prey.kind==='player')return prey.ref===player?'scan':null;
  if(nearestGlad92(npc)!==player)return null;
  HUNT90.map.set(npc,{prey,seq:HUNT90.seq});return 'scan'}}
/* nearestGlad92 — the living gladiator closest to a beast (ties: lowest seat — stateless, the same all rotation) */
function nearestGlad92(n){let best=null,bd=1e9;for(const q of S.players){if(!q||!q.alive||q.underground||q.exited)continue;const d=cheb(n,q);if(d<bd){bd=d;best=q}}return best}  /* a WeakMap: nothing new on the beast (saves, snapshots, the online hash) */
{const base=npcAct;npcAct=async function(npc,player,stay){const h=npc&&typeof npc==='object'?HUNT90.map.get(npc):null;
  if(!h||!HUNT90.live||h.seq!==HUNT90.seq)return base.apply(this,arguments);
  HUNT90.map.delete(npc);let prey=h.prey;
  if(!(prey.kind==='player'?prey.ref.alive&&!prey.ref.exited&&!prey.ref.underground:prey.ref.alive))prey=closestThing90(npc);
  if(!prey)return;
  if(prey.kind==='player')return base.call(this,npc,prey.ref,prey.ref===player?stay:false);
  return huntBeast90(npc,prey.ref)}}
/* huntBeast90 — the hunter walks next to a beast and strikes it with its own dice and attack power */
async function huntBeast90(npc,m){const st=npcStats(npc);
  log(_T`${nm(npc)} hunts the closest prey: ${nm(m)}.`);
  if(cheb(npc,m)>st.rng){if(npc.netted){log(_T`${nm(npc)} struggles in the net.`);npc.netted=false}else await npcWalk(npc,adjTiles(m),st.mv)}
  if(!npc.alive||!m.alive||cheb(npc,m)>st.rng)return;
  const hits=rollHits(2);const h=cnt(hits);const dmg=h*st.ap;
  fxLine(npc,m,'#ffa04a');if(!dmg)fx(m.r,m.c,'miss','#b8b0a4');
  const coin=((NPCT[m.t]&&NPCT[m.t].coin)||0)+(m.hoard||0);
  hurtNPC(m,dmg,null,_T`${nm(npc)}${st.state&&st.state!=='Initial'?' ('+st.state+')':''} attacks ${diceHtml(hits)} ${h}×${st.ap} = ${dmg}`,null,npc);
  if(!m.alive){HUNT90.kills=(HUNT90.kills||0)+1;
    if(npc.t==='tholo'&&coin>0){npc.hoard=(npc.hoard||0)+coin;if(m.hoard)m.hoard=0;log(_T`Tholo hoards ${coinAmt87(coin)} from the kill.`)}}
  /* v0.91 (his rule, NPC vs NPC): a beast that survives the strike counter-attacks AT ONCE — its own 2 hit dice × its attack power, if the hunter is in its reach */
  else if(npc.alive){const ms=npcStats(m);if(cheb(npc,m)<=Math.max(1,ms.rng||1)){const ch=rollHits(2);const cd=cnt(ch)*ms.ap;fxLine(m,npc,'#ffa04a');if(!cd)fx(npc.r,npc.c,'miss','#b8b0a4');
    const coin2=((NPCT[npc.t]&&NPCT[npc.t].coin)||0)+(npc.hoard||0);
    hurtNPC(npc,cd,null,_T`${nm(m)} counter-attacks ${diceHtml(ch)} ${cnt(ch)}×${ms.ap} = ${cd}`,null,m);
    if(!npc.alive){HUNT90.kills=(HUNT90.kills||0)+1;if(m.t==='tholo'&&coin2>0){m.hoard=(m.hoard||0)+coin2;if(npc.hoard)npc.hoard=0;log(_T`Tholo hoards ${coinAmt87(coin2)} from the kill.`)}}}}}

/* ---------- 2. the Crowd Favor tile ---------- */
/* crowdCan90 — can the Crowd Favor window sell this player anything right now? */
function crowdCan90(p){try{const cfOK=cfAllowed();const spear=typeof spearTargets==='function'&&spearTargets(p).length>0;if(spear)return true;if(!cfOK)return false;
  if(p.cf>=5)return true;
  if(p.cf>=3&&!p.market&&!(EV()&&EV().noMarket))return true;
  return false /* his call (2026-10-06): CF only — throwing 10 coin for 2 CF no longer lights the tile */}catch(e){return true}}
{const base=render;render=function(){const r=base.apply(this,arguments);try{
  const b=document.querySelector('#actions [data-act="crowd"]');const p=S&&!S.over&&typeof cur==='function'?cur():null;if(!b||!p)return r;
  const cmd=RD().cf&&typeof commodusIn==='function'&&commodusIn();
  if(cmd||!crowdCan90(p)){b.disabled=true;b.classList.add('off90');const sm=b.querySelector('small');
    if(sm)sm.innerHTML=cmd?_T('Commodus blocks CF'):cfAllowed()?_T`${cfAmt87(p.cf)} · not enough`:sm.innerHTML}}catch(e){}return r}}

/* ---------- 3. Blessings as token rounds ---------- */
const TOK90={fly:[],last:null,land:null,cv:{}};
const pots90On=()=>SETTINGS.pots90==='tokens';
/* tok90Canvas — one round token from rtok.webp as a 128 px canvas (null while the sprite loads) */
function tok90Canvas(name){if(TOK90.cv[name])return TOK90.cv[name];const spr=typeof ftSprite==='function'?ftSprite():null;if(!spr)return null;
  const i=RTOK_NAMES.indexOf(name);if(i<0)return null;const cv=document.createElement('canvas');cv.width=cv.height=128;
  cv.getContext('2d').drawImage(spr,(i%RTOK_COLS)*128,Math.floor(i/RTOK_COLS)*128,128,128,0,0,128,128);TOK90.cv[name]=cv;return cv}
/* face90 — the offering's face (its medallion, else the struck ring) */
const face90=k=>typeof ftCanvas==='function'?ftCanvas(k):null;
/* drawTokStack90 — n tokens stacked on the pillar top at (x,y), the top one blessing face up */
function drawTokStack90(x,y,n){const face=tok90Canvas('blessing');const rx=TW*0.22,sq=0.6,th=Math.max(2,TW*0.045);
  ctx.save();ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+1,y+1,rx*1.04,rx*sq*1.04,0,0,Math.PI*2);ctx.fill();
  for(let i=0;i<n;i++){const ox=(((i*37)%7)-3)*TW*0.006,yy=y-i*th; /* a slightly uneven stack (cosmetic, never the dice) */
    ctx.fillStyle='#3e2810';ctx.beginPath();ctx.ellipse(x+ox,yy,rx,rx*sq,0,0,Math.PI);ctx.lineTo(x+ox-rx,yy-th);ctx.ellipse(x+ox,yy-th,rx,rx*sq,0,Math.PI,0,true);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#b8843e';ctx.lineWidth=Math.max(0.6,TW*0.006);ctx.beginPath();ctx.ellipse(x+ox,yy-th*0.5,rx,rx*sq,0,0.05*Math.PI,0.95*Math.PI);ctx.stroke();
    ctx.save();ctx.translate(x+ox,yy-th);ctx.scale(1,sq);
    if(face&&i===n-1)ctx.drawImage(face,-rx,-rx,rx*2,rx*2);
    else{ctx.fillStyle='#8a5f2c';ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill()}
    ctx.restore()}
  ctx.restore()}
{const base=drawPillar;drawPillar=function(pl){if(!pots90On()||!pl||!pl.pots||!pl.pots.length||pl.f76||pl.w76)return base.apply(this,arguments);
  const keep=drawPot;let at=null;drawPot=function(x,y,s,eagle){if(eagle)return keep.apply(this,arguments);if(!at)at={x,y}};
  try{base.apply(this,arguments)}finally{drawPot=keep}
  if(at)drawTokStack90(at.x,at.y+TW*0.02,pl.pots.length)}}
/* the broken Blessing: remember which offering left the pillar and where it lands */
{const base=breakPot;breakPot=async function(pillar,player,land,all){if(!pots90On()||HEADLESS||!pillar||!pillar.pots)return base.apply(this,arguments);
  const arr=pillar.pots;Object.defineProperty(arr,'pop',{value:function(){const v=Array.prototype.pop.call(this);TOK90.last=v;return v},configurable:true,writable:true,enumerable:false});
  TOK90.land=typeof TOP81!=='undefined'&&TOP81?[TOP81.r,TOP81.c]:land;
  try{return await base.apply(this,arguments)}finally{try{delete arr.pop}catch(e){}TOK90.last=null;TOK90.land=null}}}
{const base=fx;fx=function(r,c,text,color,opt){
  if(opt&&opt.img==='blessing'&&pots90On()&&!HEADLESS&&TOK90.last){const k=TOK90.last;TOK90.last=null;
    const floor=!['spiders','curse','cf1','cf2'].includes(k)&&TOK90.land;
    TOK90.fly.push({r,c,k,to:floor?[TOK90.land[0],TOK90.land[1]]:null,t0:performance.now(),dur:SPEED==='fast'?800:1300});
    return base.call(this,r,c,'',color,{...opt,img:'tok90'})}  /* an invisible fx entry keeps the animation loop running */
  return base.apply(this,arguments)}}
{const base=drawFX;drawFX=function(){const r=base.apply(this,arguments);try{drawFly90()}catch(e){}return r}}
/* drawFly90 — the token leaves the pillar top blessing face up, flips to its offering, and drops onto its tile (or fades) */
function drawFly90(){const now=performance.now();const sq=0.56;
  for(let i=TOK90.fly.length-1;i>=0;i--){const f=TOK90.fly[i];const k=(now-f.t0)/f.dur;if(k>=1){TOK90.fly.splice(i,1);continue}if(k<0)continue;
    const a=center(f.r,f.c);const ay=a.y-TW*1.15;let x=a.x,y=ay;
    if(f.to){const b=center(f.to[0],f.to[1]);x=a.x+(b.x-a.x)*k;y=ay+(b.y-ay)*k-Math.sin(k*Math.PI)*TW*0.7}else y=ay-TW*0.9*k;
    const flip=Math.cos(Math.min(1,k/0.5)*Math.PI);const face=flip>0?tok90Canvas('blessing'):face90(f.k);if(!face)continue;
    const s=TW*0.5;ctx.save();ctx.globalAlpha=!f.to&&k>0.6?(1-k)/0.4:1;ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=8;
    ctx.translate(x,y);ctx.scale(Math.max(0.06,Math.abs(flip)),f.to&&k>0.85?sq+(1-sq)*(1-k)/0.15:1);ctx.drawImage(face,-s/2,-s/2,s,s);ctx.restore()}}

/* ---------- 4. the hot-seat turning board ---------- */
const SPIN90={from:0,to:0,t0:0,dur:650,on:false,raf:0}; /* TWEAK: spin length (ms) */
/* hsTable90 — 2+ humans at one screen, in an event where the board may turn */
function hsTable90(){try{if(!SETTINGS.hsTurn90||!S||HEADLESS||!S.players||!S.players.length||S.sim||S.snap||S.onl)return false;
  if(typeof isChariot==='function'&&isChariot())return false;if(typeof isNaum==='function'&&isNaum())return false;
  if(S.tutorial||S.tutShow||(typeof TUT!=='undefined'&&TUT&&TUT.on))return false;
  if(S.mgrCtx&&typeof MGR!=='undefined'&&MGR.world&&MGR.world.tutorial)return false;
  const hum=S.players.filter(q=>q&&!q.cpu);return !!S.hotseat&&hum.length>0||hum.length>1&&!S.mgrCtx}catch(e){return false}}
/* cornerK90 — quarter turns that put this player's start corner at the bottom (168's scoring) */
function cornerK90(p){const st=p.start&&p.start.length===2?p.start:[p.r,p.c];if(st[0]==null||st[1]==null)return 0;
  let best=0,bs=-1e9;for(let k=0;k<4;k++){const [a,b]=rot89(st[0],st[1],k);const sc=(a+b)*100-Math.abs(a-b);if(sc>bs+1e-9){bs=sc;best=k}}return best}
{const base=rot89Want;rot89Want=function(){if(!hsTable90())return base.apply(this,arguments);
  try{const c=typeof cur==='function'?cur():null;if(c&&!c.cpu)S._hs90=c.id;
    let p=S._hs90!=null?S.players.find(q=>q.id===S._hs90):null;if(!p)p=S.players.find(q=>!q.cpu);return p?cornerK90(p):0}catch(e){return 0}}}
{const base=rot89Now;rot89Now=function(){const old=ROT89.k;const k=base.apply(this,arguments);
  const same=SPIN90.s===S;SPIN90.s=S;
  if(k!==old&&same&&hsTable90()&&S&&S.phase!=='setup'){const calm=(typeof reduceMotion==='function'&&reduceMotion())||(typeof ANIM88==='function'&&ANIM88()==='off');
    if(!calm){const cur0=SPIN90.on?spinAt90():old;SPIN90.from=cur0;SPIN90.to=k;SPIN90.t0=performance.now();SPIN90.on=true;spinLoop90()}else SPIN90.on=false}
  return k}}
/* spinAt90 — the view's turn right now, in quarter turns (fractional while spinning) */
function spinAt90(){let d=((SPIN90.to-SPIN90.from)%4+4)%4;if(d===3)d=-1;const t=Math.min(1,(performance.now()-SPIN90.t0)/SPIN90.dur);const e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;return SPIN90.from+d*e}
function spinLoop90(){if(SPIN90.raf)return;SPIN90.raf=requestAnimationFrame(()=>{SPIN90.raf=0;if(!SPIN90.on)return;
  if(performance.now()-SPIN90.t0>=SPIN90.dur)SPIN90.on=false;try{draw()}catch(e){}if(SPIN90.on)spinLoop90()})}
/* iso: while spinning, turn the tile by the remaining fraction (a continuous turn about the board centre) */
{const base=iso;iso=function(r,c){if(!SPIN90.on)return base.apply(this,arguments);
  const q=spinAt90()-ROT89.k;if(Math.abs(q)<1e-4)return base.apply(this,arguments);
  const M=(N-1)/2,x=r-M,y=c-M,f=q*Math.PI/2,co=Math.cos(f),si=Math.sin(f);return base.call(this,M+x*co+y*si,M-x*si+y*co)}}

/* ---------- Settings → On the board: two rows ---------- */
{const base=settingsHTML;settingsHTML=function(tab){const h=base.apply(this,arguments);if(typeof h!=='string'||tab&&tab!=='general')return h;
  try{const T=document.createElement('template');T.innerHTML=h;const g=T.content.querySelector('.setgrid');if(!g)return h;
    const mk=s=>{const t=document.createElement('template');t.innerHTML=s.trim();return t.content.firstElementChild};
    const tok=pots90On(),seg=(k,l,on)=>`<button type="button" data-pots90="${k}" class="${on?'on':''}">${l}</button>`;
    const potRow=mk(`<div class="setrow"><span>${_T`<b>Blessings on pillars</b>`}<br><span class="hint" style="margin:0">${_T`Clay pots, or his round tokens stacked blessing face up.`}</span></span><div class="seg">${seg('pots',_T('Clay pots'),!tok)}${seg('tokens',_T('Token rounds'),tok)}</div></div>`);
    const hsRow=mk(`<label class="setrow"><input type="checkbox" data-set="hsTurn90" ${SETTINGS.hsTurn90?'checked':''}><span>${_T`<b>Hot seat: turn the board</b>`}<br><span class="hint" style="margin:0">${_T`With two or more players on one screen, each player's corner turns to the bottom on their turn.`}</span></span></label>`);
    const heads=[...g.querySelectorAll(':scope > h4')];const hd=heads.find(x=>x.textContent.trim()===_T('On the board'));
    let at=null;if(hd){at=hd.nextElementSibling;while(at&&at.tagName!=='H4')at=at.nextElementSibling}
    g.insertBefore(potRow,at);g.insertBefore(hsRow,at);return T.innerHTML}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pots90]');if(!b)return;SETTINGS.pots90=b.dataset.pots90;applySettings();
  b.parentElement.querySelectorAll('[data-pots90]').forEach(x=>x.classList.toggle('on',x===b));try{if(S)draw()}catch(e){}});
