/* =====================================================================
   359-v104fixb2.js — v1.04 beta-2 fixes B31 + B32 (B25 follow-up): ground marks still painted OVER a figure. Kill switch:
   localStorage flavius_v104b2off=1 (back to 356's pass as shipped in beta 1). Test: tv104l.
   B31 ROOT CAUSE: 356's floor pass skipped every piece it judged "moving" (fl104Moving: a glide between tiles 311/an100Glide, a shove 294/PUSH100,
   a beast's walk). Such a piece drew everything inline as in v1.03 — including 311/222's seat-colour rim ARC, drawn after the figure (over the
   shins), and the gold turn ring beside it. The active piece is the one that walks, so the beta showed the gold ring/rim band over it.
     FIX: the pass now paints a moving piece's marks too — shifted by the piece's own screen offset (`fl104Offs`: the glide's A→B delta, the shove's
     dx/dy), under every figure. The drawers then skip them as for a still piece (fl104Has), so there is no inline arc left to cross the legs.
   B32 ROOT CAUSE: other marks painted around a piece's cell AFTER its figure:
     • the attack / net / catk target rings (TB.ring, 'overlays' layer) over the target's shins,
     • the Guide's suggestion-tile ring (29-guide, 'overlays' layer),
     • the truce dashed ring (78-v60 wrapper, after the figure).
     FIX: when a piece stands on that tile the same ring is painted in the floor pass, before any figure (bit 128 = the truce ring; the overlay
     loop / drawSugTile skip what the pass drew: `fl104HlDone`, the drawSugTile wrapper). A ring on an empty tile stays in 'overlays'. Rings that
     belong ABOVE a piece stay above it: the pennant, the truce dove badge, the netted / eagle marks, stuck arrows. The colour-blind letter (82-access)
     is an on-body identifier by design and is left alone.
   Cost: a handful of ellipses, no layer, no drawImage, no ctx wrapper. Reduce motion / Animations Off: nothing here animates (a still board has no
   offsets). Deterministic: offsets come from the same glide/shove state the drawers read.
   ===================================================================== */
const B2104={off:(()=>{try{return localStorage.getItem('flavius_v104b2off')==='1'}catch(e){return false}})(),hl:new Set(),stamp:-1,sug:-1,inFloor:false};
/* fl104Offs — the screen offset a moving piece is drawn at (null = unknown: leave it to its own drawers) */
function fl104Offs(p,isNpc){if(B2104.off||FL104.off)return null;try{let dx=0,dy=0;
  if(typeof PUSH100!=='undefined'&&(PUSH100.live.has(p)||PUSH100.wob.has(p))){const o=typeof push100At==='function'?push100At(p):null;if(o){dx=o.dx;dy=o.dy}}
  else if(!isNpc&&typeof AN100!=='undefined'&&AN100.on&&typeof an100On==='function'&&an100On()&&typeof an100Glide==='function'){const g=an100Glide(p);
    if(g){const A=center(g.r,g.c),B=center(p.r,p.c);dx=A.x-B.x;dy=A.y-B.y}}
  return {dx,dy}}catch(e){return null}}
/* fl104HlDone — did the floor pass already paint this highlight's target ring (the overlay loop skips it)? */
function fl104HlDone(k){return !B2104.off&&B2104.stamp===FL104.st.passes&&B2104.hl.has(k)}
function b2Piece(r,c){if(!S)return null;for(const p of S.players)if(p.alive&&!p.exited&&!p.underground&&p.r===r&&p.c===c)return p;
  for(const q of S.npcs)if(q.alive&&!q.out&&q.t!=='zora'&&q.r===r&&q.c===c)return q;return null}
/* the pass's extras: target rings, the suggestion ring, the truce ring */
function b2Extra(alphaFor){const ev=EV();ctx.save();
  try{
    for(const [k,h] of HL){if(h.t!=='atk'&&h.t!=='rete'&&h.t!=='catk')continue;const r=Math.floor(k/N),c=k%N,who=b2Piece(r,c);if(!who)continue;
      const m=center(r,c);let rx=TW*0.36;const isP=S.players.includes(who);
      if(isP){const rm=typeof fl104RimAbs==='function'?fl104RimAbs(who):null;if(rm)rx=Math.max(rx,rm.rx+rm.w+3.5)}else rx=Math.max(rx,TW*0.4);
      ctx.globalAlpha=1;ctx.strokeStyle=h.t==='rete'?'#62d0c0':TB.ring;ctx.lineWidth=2.5;ell(m.x,m.y,rx,rx*0.5);ctx.stroke();B2104.hl.add(k)}
    if(S.sugTile&&!S.over&&typeof drawSugTile==='function'&&b2Piece(S.sugTile.r,S.sugTile.c)){B2104.inFloor=true;try{drawSugTile()}finally{B2104.inFloor=false}B2104.sug=FL104.st.passes}
    if(typeof truceViewer==='function'&&typeof inTruce==='function'){const v=truceViewer();
      if(v)for(const p of S.players){if(v===p||!p.alive||p.exited||p.underground||!inTruce(v,p))continue;
        const mo=fl104Moving(p,false)?fl104Offs(p,false):null;if(fl104Moving(p,false)&&!mo)continue;const m=center(p.r,p.c);
        ctx.save();if(mo)ctx.translate(mo.dx,mo.dy);ctx.globalAlpha=alphaFor?alphaFor('player',p.r,p.c):1;ctx.setLineDash([5,4]);ctx.strokeStyle=v.color||'#fff';ctx.lineWidth=2;
        let rx=TW*0.42;const rm=typeof fl104RimAbs==='function'?fl104RimAbs(p):null;if(rm)rx=Math.max(rx,rm.rx+rm.w+4);
        ell(m.x,m.y+TW*0.03,rx,rx*0.5);ctx.stroke();ctx.restore();FL104.done.set(p,(FL104.done.get(p)||0)|128)}}
  }catch(e){console.error(e)}
  ctx.restore()}
{const base=floor104;floor104=function(alphaFor){B2104.hl.clear();B2104.stamp=-1;B2104.sug=-1;const r=base.apply(this,arguments);
  if(B2104.off||FL104.off||HEADLESS||!S||!FL104.active)return r;
  try{if(typeof isChariot==='function'&&isChariot())return r;B2104.stamp=FL104.st.passes;b2Extra(alphaFor)}catch(e){console.error(e)}return r}}
/* the Guide's suggestion ring: painted in the pass when a piece stands on the tile; the overlays call then does nothing (its redraw timer is kept) */
{const base=drawSugTile;drawSugTile=function(){if(B2104.off||B2104.inFloor)return base.apply(this,arguments);
  if(B2104.sug===FL104.st.passes&&B2104.sug>=0){try{if(typeof GUIDE!=='undefined'&&!GUIDE.raf&&S&&S.sugTile)GUIDE.raf=requestAnimationFrame(()=>{GUIDE.raf=0;try{if(S&&S.sugTile)draw()}catch(e){}})}catch(e){}return}
  return base.apply(this,arguments)}}
/* the records are CELL-RELATIVE (356), so they stay valid after the piece stepped to another tile: the first frame of a move paints the same
   rim / shadow under the figure instead of falling back to the inline arc (356 dropped them when the tile changed) */
{const base=fl104Abs;fl104Abs=function(p,r){if(B2104.off)return base.apply(this,arguments);if(!r||!r.ok)return null;const m=center(p.r,p.c);return {x:m.x+r.dx*TW,y:m.y+r.dy*TW}}}
