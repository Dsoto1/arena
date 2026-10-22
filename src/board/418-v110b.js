/* =====================================================================
   418-v110b — v1.10a TWO VISUAL FIXES (owner screenshots, tools/plans/v110/NOTES.md). DISPLAY ONLY: no rand(), no S writes, nothing sent.
   F1 · CHARIOT RIDERS ARE THE 3D FIGURES NOW. 311's an100On() has said "no" to Chariot Racing since v1.00 (the glide / rotation
      work was never checked on the chariot board), so AN100.cur stayed null while a racer was drawn: 311's drawFigureTok wrapper and 400's
      still (st107DrawP) both need AN100.cur, and the rider fell through to the OLD flat figure (07-ui drawFigureTok). an100On() now
      answers yes in Chariot Racing too (same gates: AN100.on, not HEADLESS, not a sim, not the editor), so every racer goes through
      311's drawPlayer wrapper → 311 animated figure when its sheet is loaded, 400's still (the idle cell facing the rider) when it is
      not. The chariot token (chtok.webp disc under the rider, 76 / 84), the horse and wheel tokens and the rider's tile are untouched
      (no new art exists for the chtok discs — they stay). ST110.stats.riders counts the racer draws that went through the figure path.
   F2 · SEATED SPECTATORS COVER THEIR BENCH (all 8 sections; first the 4 front ones, then the back stands too). 409's bench plank seams are baked into 192's LIGHT layer, which 192's night91Sand wrapper
      lays over EVERYTHING drawn before it with source-atop — including the spectators 16-crowd / 193 / 313 draw in the 'stands' layer —
      so on the screen-front stands the dark seams ran across the seated figures. The seams of the FRONT sections (193's nearSec91) are
      now painted live in drawStands, right after the benches and the deco (ar91Deco) and before the spectators (a wrapper on ar91Deco);
      409's baked pass skips those sections (one small direct edit: st110Front(si)). FOLLOW-UP: the back stands had the same bug, so ALL 8 sections are live now and 409 bakes no seams (measured cost in the test report).
      Same strokes, colours and widths as 409 (V108K.plank; the nosing in the day tone — at night the grade dims it with the scene).
      Cost: ~12 clipped quads of ≈14 strokes a frame (≈0.1 ms, ST110.stats.ms), nothing cached, nothing new to invalidate.
   Kill switch: localStorage flavius_v110boff=1 → v1.10 exactly (old riders, baked seams over the front spectators). Test tv110b.
   ===================================================================== */
const ST110={on:true,disc:0.98,stats:{riders:0,planks:0,ms:0,last:[]},trace:null};
try{if(localStorage.getItem('flavius_v110boff')==='1')ST110.on=false}catch(e){}

/* ---------------- F1 · the racers through the figure path ---------------- */
if(typeof an100On==='function'){const base=an100On;an100On=function(){if(base.apply(this,arguments))return true;
  try{if(!ST110.on||typeof AN100==='undefined'||!AN100.on||HEADLESS||typeof S==='undefined'||!S||S.sim||S.ed94)return false;return typeof isChariot==='function'&&!!isChariot()}catch(e){return false}}}
/* the mini's own round base (0.8 tile) would hide the 0.86-tile chariot disc: with the figure on it the disc is drawn a little wider, so the chariot's colour
   and art stay a plate round the rider's base (0.98 tile = the largest flat disc that still fits the tile's diamond) */
if(typeof chRideTok==='function'&&typeof chTokFlat==='function'){const base=chRideTok;chRideTok=function(p,m){
  try{if(ST110.on&&!HEADLESS&&p&&p.ch&&p.cls&&typeof an100On==='function'&&an100On()){const art=CHTOK_IDX[p.ch.art]!=null?p.ch.art:'chRed';return chTokFlat(art,m.x,m.y,TW*ST110.disc)}}catch(e){}
  return base.apply(this,arguments)}}
{const base=drawPlayer;drawPlayer=function(p){try{if(ST110.on&&p&&p.cls&&typeof isChariot==='function'&&isChariot()&&typeof AN100!=='undefined'){
    const n=AN100.stats.draws+(typeof ST107!=='undefined'?ST107.stats.p:0);const r=base.apply(this,arguments);
    if(AN100.stats.draws+(typeof ST107!=='undefined'?ST107.stats.p:0)>n){ST110.stats.riders++;if(ST110.trace)ST110.trace.push({rider:p.id})}return r}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* ---------------- F2 · the front stands' plank seams under the spectators ---------------- */
/* st110Front — section si has its seams painted live (ALL 8 sections since the follow-up: the back stands had the same bug; the name stays) */
function st110Front(si){try{if(!ST110.on||HEADLESS)return false;
  if(typeof v108Item!=='function'||!v108Item('mat')||!v108Arena()||v108Lud())return false;return si>=0&&si<8}catch(e){return false}}
/* st110Planks — 409's section 3 "plank seams + lit nosing" for all sections, drawn live (clipped to each bench tier) */
function st110Planks(){if(!ST110.on||HEADLESS||typeof SECTIONS==='undefined'||typeof secQuad!=='function'||typeof ctx==='undefined')return;
  if(typeof v108Item!=='function'||!v108Item('mat')||!v108Arena()||v108Lud())return;const t0=performance.now();
  const tiers=typeof ar91Tiers==='function'?ar91Tiers():3;let n=0;
  for(let si=0;si<8;si++){if(!st110Front(si))continue;
    for(let t=0;t<tiers;t++){const d0=1.35+t*0.47,d1=d0+0.47;const Q=secQuad(si,d0,d1).map(([r,c])=>{const p=pt(r,c);return {x:p.x,y:p.y-t*TW*0.08}});
      ctx.save();v108Poly(ctx,Q);ctx.clip();ctx.lineWidth=Math.max(0.7,TW*0.014);ctx.strokeStyle=`rgba(28,10,6,${V108K.plank})`;ctx.beginPath();
      for(const f of [1/3,2/3]){const A=v108Lerp(Q[0],Q[3],f),B=v108Lerp(Q[1],Q[2],f);ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y)}
      for(let row=0;row<3;row++){const f0=row/3,f1=(row+1)/3;for(let u=(row%2?0.55:0.15)+((si*3+t)%4)*0.07;u<1;u+=0.24){const A=v108Lerp(v108Lerp(Q[0],Q[1],u),v108Lerp(Q[3],Q[2],u),f0),B=v108Lerp(v108Lerp(Q[0],Q[1],u),v108Lerp(Q[3],Q[2],u),f1);ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y)}}
      ctx.stroke();const A=v108Lerp(Q[0],Q[3],0.05),B=v108Lerp(Q[1],Q[2],0.05);ctx.strokeStyle='rgba(255,214,180,.26)';ctx.lineWidth=Math.max(0.8,TW*0.018);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();ctx.restore();n++}}
  const ms=performance.now()-t0;ST110.stats.planks=n;ST110.stats.ms=ms;if(ST110.trace)ST110.trace.push({planks:n});return n}
if(typeof ar91Deco==='function'){const base=ar91Deco;ar91Deco=function(){const r=base.apply(this,arguments);try{st110Planks()}catch(e){console.error(e)}return r}}
if(typeof draw91==='function'){const base=draw91;draw91=function(){if(ST110.trace)ST110.trace.push({crowd:1});return base.apply(this,arguments)}}
