/* =====================================================================
   132-V83ARROWS · v0.83 — arrows and bolts that STICK (Virgilante)
   =====================================================================
   • A shot that lands stays in the body: Parthian Bow (and custom bows) leave ARROWS (wood shaft, feather fletching),
     the Arcuballista (and custom crossbows: a name with arcu/ballista/crossbow/bolt) leaves BOLTS (short, thick, dark, vanes).
     Tip buried, shaft out, each one turned a little differently (a hash, never the dice) — the same on every screen.
   • Where: the location the hit took (HP or AP lost there; a shield that caught it all leaves nothing). Shown on the
     player-board AVATAR (avatarSVG) and on the arena token / mini (drawPlayer); up to 3 per location, then a small "+N".
   • Beasts: in random spots on the token, or in the HEAD when the shot was Focus-aimed (Focus roll / Focus! card).
   • They stay through the rounds and go at the END of the event (gameOver; a new event has a new S anyway).
     A SEVERED limb takes its arrows with it.
   • State: S.stuck83 = {'p<id>'|'n<id>': [{l:loc|'body'|'head', k:'arrow'|'bolt', s:seed, a:screen angle to the shooter}]},
     S.stuck83n = counter. Plain JSON → match saves and online snapshots carry it; not in onlHash; no dice drawn.
   • Shooters aim like everyone: a normal shot rolls the location die (any living location), a Focus roll picks one of three
     rolled locations, Focus! / Flavius Rule picks ANY living location — ranged attacks go through the same doAttack path.
   • THOLO HOUSE RULE: a BOLT that hits Tholo in his Focus-aimed head kills him with any damage (≥1). The Arcuballista
     already did this in 04-rules; this extends it to every bolt weapon and names it "A bolt through the eye".
   ===================================================================== */
const STUCK83_MAX=2; /* v0.83: at most two per location on the board, then +N */
const STUCK83_K={standee:0.9,figure:1,cylinder:1}; /* TWEAK: arrow size per token style (the 3D minis are busier) */
let AT83=null,TOP83=null;
/* shotKind83 — 'arrow' | 'bolt' | null for a weapon */
function shotKind83(w){if(!w||w.punch||w.shield)return null;const k=w.key||'';
  if(k==='bow')return 'arrow';if(k==='arcu')return 'bolt';
  if(w.custom&&w.ammo&&!w.stones){const nm=String(w.n||'');if(/arcu|ballist|crossbow|bolt/i.test(nm))return 'bolt';const t=w.art&&w.art.type;if(t==='bow'||/bow|arrow|sagitt/i.test(nm))return 'arrow'}
  return null}
/* fr83 — a fixed 0..1 value from a seed and a slot (cosmetic variation, identical everywhere) */
function fr83(s,k){let h=Math.imul((s>>>0)^Math.imul(k+1,0x9e3779b1),0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;h^=h>>>16;return (h>>>0)/4294967296}
const stuckKey83=q=>q&&q.cls?'p'+q.id:'n'+(q&&q.id);
function stuckOf83(q){return S&&S.stuck83&&q?S.stuck83[stuckKey83(q)]||[]:[]}
function stuckAdd83(q,l,k,from){if(!S||!q)return;S.stuck83=S.stuck83||{};S.stuck83n=(S.stuck83n||0)+1;const key=stuckKey83(q);
  let a=null;if(from&&from.r!=null&&q.r!=null){const dr=from.r-q.r,dc=from.c-q.c;if(dr||dc)a=Math.round(Math.atan2((dc+dr)*0.5,dc-dr)*100)/100}
  (S.stuck83[key]=S.stuck83[key]||[]).push({l,k,s:hashStr(key+'|'+S.stuck83n+'|'+l+'|'+(S.turnNo||0)),a})}
/* a limb at 0 HP is gone, and its arrows with it */
function stuckPurge83(q){if(!S||!S.stuck83||!q||!q.hp||typeof q.hp!=='object')return;const key=stuckKey83(q);const L=S.stuck83[key];if(!L)return;
  const keep=L.filter(x=>!(['rarm','larm','rleg','lleg'].includes(x.l)&&(q.hp[x.l]||0)<=0));if(keep.length!==L.length)S.stuck83[key]=keep}
function stuckClear83(){if(S){S.stuck83={};S.stuck83n=0}}

/* ---------- the engine hooks ---------- */
{const base=doAttack;doAttack=async function(p,src,t,opt){const prev=AT83;
  AT83={p,focus:!!(p&&((opt&&opt.focusRoll&&p.mv>0)||p.focusNext))};
  try{return await base.apply(this,arguments)}finally{AT83=prev;
    /* the old quick lodged arrow/bolt of 55-anim is replaced by the one that stays */
    try{if(typeof STUCK!=='undefined')for(let i=STUCK.length-1;i>=0;i--){const s=STUCK[i];if(s.ref&&(s.kind==='arrow'||s.kind==='bolt')&&s.life<=900)STUCK.splice(i,1)}}catch(e){}}}}
{const base=hurt;hurt=async function(victim,location,damage,source){let kind=null,pre=0;
  try{if(S&&victim&&victim.hp&&source&&source.type==='player'&&damage>0){kind=shotKind83(source.w);if(kind)pre=(victim.hp[location]||0)+(victim.ap[location]||0)}}catch(e){kind=null}
  const r=await base.apply(this,arguments);
  try{if(kind&&victim&&LOCS.includes(location)){const now=(victim.hp[location]||0)+(victim.ap[location]||0);const lostLimb=location!=='head'&&location!=='chest'&&(victim.hp[location]||0)<=0;
      if(now<pre&&!lostLimb)stuckAdd83(victim,location,kind,source.p)}
    stuckPurge83(victim)}catch(e){console.error(e)}
  return r}}
{const base=hurtNPC;hurtNPC=function(npc,damage,player,prefix,weapon,byNpc){let kind=null,head=false;
  try{kind=weapon&&player&&player.cls?shotKind83(weapon):null;head=!!(kind&&AT83&&AT83.p===player&&AT83.focus);
    /* Tholo house rule: a bolt in his aimed head */
    if(kind==='bolt'&&head&&npc&&npc.alive&&npc.t==='tholo'&&damage>=1){if(damage<npc.hp)damage=npc.hp;prefix=_T('🎯 A bolt through the eye')}}catch(e){}
  const was=npc&&npc.alive;const r=base.call(this,npc,damage,player,prefix,weapon,byNpc);
  try{if(kind&&was&&damage>0)stuckAdd83(npc,head?'head':'body',kind,player)}catch(e){console.error(e)}
  return r}}
{const base=gameOver;gameOver=async function(){try{stuckClear83()}catch(e){}return base.apply(this,arguments)}}

/* ---------- the avatar (player board) ---------- */
/* tip spots by location in avatar units (viewBox 0 0 150 332): [x, y, spread x, spread y, shaft angle (deg, 0 = right), angle spread] */
const AV83={head:[75,36,8,9,-90,55],chest:[75,100,14,16,-90,70],rarm:[34,116,4,26,-150,22],larm:[116,116,4,26,-30,22],rleg:[61,222,4,30,-160,20],lleg:[89,222,4,30,-20,20]};
function arrowSVG83(k,x,y,ang){const bolt=k==='bolt';const L=bolt?15:24;let g=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})" class="stk83 stk83${bolt?'b':'a'}" pointer-events="none">`;
  g+=`<ellipse cx="0.6" cy="0" rx="2.3" ry="1.7" fill="#4a0c08" fill-opacity=".85"/>`;
  if(bolt){g+=`<line x1="0.5" y1="0" x2="${L}" y2="0" stroke="#140c07" stroke-width="4" stroke-linecap="round"/><line x1="1" y1="-0.5" x2="${L-1}" y2="-0.5" stroke="#5b3d22" stroke-width="1.4" stroke-linecap="round"/>`
    +`<rect x="3.2" y="-2.2" width="1.6" height="4.4" rx=".5" fill="#8d949b" stroke="#2b2e31" stroke-width=".4"/>`
    +`<path d="M${L-7} -1.4L${L+1} -5.4L${L+1.2} -1.4Z" fill="#5e2418" stroke="#1d0d08" stroke-width=".5"/><path d="M${L-7} 1.4L${L+1} 5.4L${L+1.2} 1.4Z" fill="#4b1c12" stroke="#1d0d08" stroke-width=".5"/>`}
  else{g+=`<line x1="0.5" y1="0" x2="${L+1}" y2="0" stroke="#2e1b0e" stroke-width="2.5" stroke-linecap="round"/><line x1="1" y1="-0.25" x2="${L}" y2="-0.25" stroke="#c08a4e" stroke-width="1.1" stroke-linecap="round"/>`
    +`<path d="M${L-10} -0.8Q${L-4} -4.6 ${L+1.2} -4.2L${L} -0.8Z" fill="#efe5cf" stroke="#7d6c52" stroke-width=".45"/><path d="M${L-10} 0.8Q${L-4} 4.6 ${L+1.2} 4.2L${L} 0.8Z" fill="#e2d6bc" stroke="#7d6c52" stroke-width=".45"/>`
    +`<rect x="${L-11.2}" y="-1.4" width="1.3" height="2.8" fill="#9b2a1c"/><circle cx="${L+1.3}" cy="0" r=".9" fill="#2a170b"/>`}
  return g+'</g>'}
function stuckAvatarSVG83(p){const L=stuckOf83(p);if(!L.length)return '';let s='';
  for(const l of LOCS){if((p.hp[l]||0)<=0)continue;const xs=L.filter(x=>x.l===l);if(!xs.length)continue;const A=AV83[l];
    xs.slice(0,STUCK83_MAX).forEach((x,i)=>{const ox=(fr83(x.s,1)*2-1)*A[2],oy=(fr83(x.s,2)*2-1)*A[3];
      let ang=A[4]+(fr83(x.s,3)*2-1)*A[5];if(l==='head'||l==='chest')ang=A[4]+(ox>=0?1:-1)*(25+fr83(x.s,3)*A[5]*0.6);
      s+=arrowSVG83(x.k,A[0]+ox,A[1]+oy,ang)});
    if(xs.length>STUCK83_MAX){const tx=l==='rarm'||l==='rleg'?A[0]-14:l==='larm'||l==='lleg'?A[0]+14:A[0]+24;const ty=l==='head'||l==='chest'?A[1]+14:A[1];
      s+=`<g class="stk83n" pointer-events="none"><rect x="${tx-8}" y="${ty-6}" width="16" height="11" rx="5.5" fill="#140f0b" fill-opacity=".82" stroke="#c9a458" stroke-width=".6"/><text x="${tx}" y="${ty+0.4}" fill="#f0cf7d" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" text-anchor="middle" dominant-baseline="middle">+${xs.length-STUCK83_MAX}</text></g>`}}
  return s}
const STUCK_AVATAR83=false; /* v0.83 (his call): arrows show on the arena token/mini only, never on the fighter-board avatar */
{const base=avatarSVG;avatarSVG=function(p){let s=base.apply(this,arguments);try{if(STUCK_AVATAR83&&p&&p.hp&&S&&S.stuck83&&S.players&&S.players.includes(p)){const a=stuckAvatarSVG83(p);if(a){const i=s.lastIndexOf('</svg>');if(i>=0)s=s.slice(0,i)+a+s.slice(i)}}}catch(e){console.error(e)}return s}}

/* ---------- the arena token / mini ---------- */
/* drawArrow83 — tip at (x,y), shaft out along ang (radians), length in px */
function drawArrow83(k,x,y,ang,len){const bolt=k==='bolt';const u=len/(bolt?15:24);ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(u,u);ctx.lineCap='round';const L=bolt?15:24;
  ctx.fillStyle='rgba(74,12,8,.85)';ctx.beginPath();ctx.ellipse(0.6,0,2.3,1.7,0,0,Math.PI*2);ctx.fill();
  const line=(x1,y1,x2,y2,c,w)=>{ctx.strokeStyle=c;ctx.lineWidth=Math.max(w,0.9/u);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
  if(bolt){line(0.5,0,L,0,'#140c07',4);line(1,-0.5,L-1,-0.5,'#5b3d22',1.4);ctx.fillStyle='#8d949b';ctx.fillRect(3.2,-2.2,1.6,4.4);
    ctx.lineWidth=0.5;ctx.strokeStyle='#1d0d08';for(const [sg,c] of [[-1,'#5e2418'],[1,'#4b1c12']]){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(L-7,sg*1.4);ctx.lineTo(L+1,sg*5.4);ctx.lineTo(L+1.2,sg*1.4);ctx.closePath();ctx.fill();ctx.stroke()}}
  else{line(0.5,0,L+1,0,'#2e1b0e',2.5);line(1,-0.25,L,-0.25,'#c08a4e',1.1);ctx.lineWidth=0.45;ctx.strokeStyle='#7d6c52';
    for(const [sg,c] of [[-1,'#efe5cf'],[1,'#e2d6bc']]){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(L-10,sg*0.8);ctx.quadraticCurveTo(L-4,sg*4.6,L+1.2,sg*4.2);ctx.lineTo(L,sg*0.8);ctx.closePath();ctx.fill();ctx.stroke()}
    ctx.fillStyle='#9b2a1c';ctx.fillRect(L-11.2,-1.4,1.3,2.8);ctx.fillStyle='#2a170b';ctx.beginPath();ctx.arc(L+1.3,0,0.9,0,Math.PI*2);ctx.fill()}
  ctx.restore()}
/* spots on a gladiator figure: [x in TW, height share] */
const TOK83={head:[0,0.9],chest:[0,0.66],rarm:[-0.15,0.58],larm:[0.15,0.58],rleg:[-0.06,0.24],lleg:[0.06,0.24]};
function drawStuckOn83(q,m,top,isNpc,sink){const L=stuckOf83(q);if(!L.length)return;const H=Math.max(TW*0.4,m.y-top);
  const groups=isNpc?['body','head']:LOCS;
  /* v0.83: on the 3D minis the arrows turn with the figure's facing (MINI_YAW); the body's sides swap when it turns round */
  let yk=1;try{if(!isNpc&&tokenStyle()==='standee'&&q._face!=null&&typeof MINI_YAW!=='undefined'){const c=Math.cos((MINI_YAW[q._face]||0)*Math.PI/180);yk=(Math.abs(c)<0.25?Math.sign(c||1)*0.25:c)*1.5}}catch(e){}
  for(const l of groups){if(!isNpc&&(q.hp[l]||0)<=0)continue;const xs=L.filter(x=>x.l===l);if(!xs.length)continue;
    if(sink&&!isNpc&&(l==='rleg'||l==='lleg'))continue;
    let lastX=0,lastY=0;
    xs.slice(0,STUCK83_MAX).forEach(x=>{let px,py;
      if(isNpc){if(l==='head'){const sd=q.t==='tholo'?0:(fr83(x.s,5)<0.5?-1:1);px=sd*0.15*TW+(fr83(x.s,1)*2-1)*0.04*TW;py=m.y-H*(q.t==='tholo'?0.86:0.72)+(fr83(x.s,2)*2-1)*0.03*TW}
        else{px=(fr83(x.s,1)*2-1)*0.2*TW;py=m.y-H*(0.3+fr83(x.s,2)*0.36)}}
      else{const T=TOK83[l];px=T[0]*TW*yk+(fr83(x.s,1)*2-1)*0.035*TW;py=m.y-H*T[1]+(fr83(x.s,2)*2-1)*0.03*TW}
      const side=px<-0.02*TW?-1:px>0.02*TW?1:(fr83(x.s,4)<0.5?-1:1);
      let ang=(x.a!=null?x.a:(side<0?Math.PI*1.12:-Math.PI*0.12))+(fr83(x.s,3)*2-1)*0.38;if(!isNpc&&yk<0)ang=Math.PI-ang;
      const X=m.x+px,Y=py;if(sink&&Y>m.y)return;drawArrow83(x.k,X,Y,ang,TW*(x.k==='bolt'?0.11:0.165)*(STUCK83_K[tokenStyle()]||1));lastX=X;lastY=Y});
    if(xs.length>STUCK83_MAX){const t='+'+(xs.length-STUCK83_MAX);ctx.save();ctx.font=`700 ${Math.max(8,Math.round(TW*0.12))}px IBM Plex Mono, monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(t,lastX,lastY-TW*0.09);ctx.fillStyle='#f0cf7d';ctx.fillText(t,lastX,lastY-TW*0.09);ctx.restore()}}}
{const base=drawStandee;drawStandee=function(){const t=base.apply(this,arguments);TOP83=t;return t}}
{const base=drawFigureTok;drawFigureTok=function(){const t=base.apply(this,arguments);TOP83=t;return t}}
{const base=drawZoraMini;drawZoraMini=function(){const t=base.apply(this,arguments);TOP83=t;return t}}
{const base=drawPlayer;drawPlayer=function(p){TOP83=null;const r=base.apply(this,arguments);
  try{if(p&&S&&S.stuck83&&p.alive&&!p.exited&&!p.underground&&stuckOf83(p).length){const m=center(p.r,p.c);const sw=typeof swimming==='function'&&swimming(p);
    const top=TOP83!=null?TOP83:m.y-TW*0.55-TW*0.12;drawStuckOn83(p,sw?{x:m.x,y:m.y+TW*0.36}:m,top,false,sw)}}catch(e){}
  return r}}
{const base=drawNPC;drawNPC=function(n){TOP83=null;const r=base.apply(this,arguments);
  try{if(n&&S&&S.stuck83&&n.alive&&stuckOf83(n).length){const m=center(n.r,n.c);const T=NPCT[n.t]||{};const big=['tholo','lion','bear','commodus'].includes(n.t)||T.custom&&T.hp>=12;
    const top=TOP83!=null?TOP83:m.y-TW*(big?0.34:0.24)-TW*0.08;drawStuckOn83(n,m,top,true,false)}}catch(e){}
  return r}}
