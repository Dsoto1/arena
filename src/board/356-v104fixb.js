/* =====================================================================
   356-v104fixb.js — v1.04 beta fix B25 (his screenshot): the gold active-turn ring, the seat ring, the dark shadow disc and the seat colour on the
   base rim painted OVER a figure's feet and lower legs (the rim's front arc was drawn after the figure; a piece in front drew its rings over the
   feet of the piece behind it). Kill switch: localStorage flavius_v104boff=1 (everything goes back to v1.03). Test: tv104i.
   THE FLOOR PASS: the 'pieces' layer (07-ui) now calls `floor104(alphaFor)` once BEFORE its depth-sorted figures and `floor104End()` after. For
   every still piece (not gliding / pushed / walking / swimming / mounted) the pass paints, in this order, at the piece's own see-through opacity:
     • 227's team ring (bit 32) · the gold ring on whoever's turn it is (1) · the seat ring + 07's thin team ring (2) · a tamed beast's ring (4) ·
       a Raged beast's ring (8) · the shadow disc (64).
     • The seat colour on the base rim (311 / 222: an arc drawn after the figure, over its feet) is now a full ring OUTSIDE the base's wall on the
       floor (bit 16): the arc is skipped (`fl104Rim`) and the gold ring steps out beyond it. Pieces without a base keep 07's seat ring (moved here).
   The drawers of 07 / 227 skip a mark the pass drew (`fl104Has(piece,bit)`); a piece the pass skipped (moving) draws everything inline as before.
   SHADOW DISCS live inside the figure drawers (311 / 312 / 222 / 102 / 94): they call `fl104Sh` instead of drawing; it records the disc per piece,
   and when the floor pass painted the same disc this frame (recorded one frame earlier at the same place) the in-cell draw is skipped — a moved
   figure paints its disc inline for that one frame, then the pass takes over. No new layer, no extra drawImage, a handful of ellipses.
   Reduce motion / Animations Off: nothing here animates (static marks). `FL104.st` = {passes, pieces, ms, last}. */
const FL104={off:(()=>{try{return localStorage.getItem('flavius_v104boff')==='1'}catch(e){return false}})(),done:new Map(),sh:new WeakMap(),rim:new WeakMap(),active:false,st:{passes:0,pieces:0,ms:0,last:null}};

/* fl104Has — did the floor pass already paint this mark of this piece in the frame being drawn? */
function fl104Has(p,bit){if(!FL104.active)return false;const d=FL104.done.get(p);return !!(d&&(d&bit))}
/* Records are kept RELATIVE to the piece's cell centre in tile-width units (a figure's geometry scales with TW), so a camera / zoom change does not
   invalidate them: the pass paints the same marks the drawer would, whatever the previous frame's camera was (deterministic, cached or not). */
function fl104Rel(p,r,x,y){const m=center(p.r,p.c);r.dx=(x-m.x)/TW;r.dy=(y-m.y)/TW;r.pr=p.r;r.pc=p.c}
function fl104Abs(p,r){if(!r||!r.ok||r.pr!==p.r||r.pc!==p.c)return null;const m=center(p.r,p.c);return {x:m.x+r.dx*TW,y:m.y+r.dy*TW}}
/* fl104Rim — a figure drawer's seat-colour rim arc: records the base (centre, radius, width) for the pass; true = skip the arc (the ring is on the floor) */
function fl104Rim(x,y,rx,w){if(FL104.off)return false;const p=typeof MINI_CUR!=='undefined'?MINI_CUR:null;if(!p)return false;
  let r=FL104.rim.get(p);if(!r){r={};FL104.rim.set(p,r)}
  fl104Rel(p,r,x,y);r.kr=rx/12.75/TW;r.w=w;r.ok=true;return fl104Has(p,16)}
function fl104RimAbs(p){const r=FL104.rim.get(p),a=fl104Abs(p,r);if(!a)return null;const k=r.kr*TW;let w=r.w;
  if(typeof rim103==='function'){try{const R=rim103(k);if(!R)return null;if(R.w>0)w=R.w}catch(e){}}else w=Math.max(1.5,2.3*k);
  return {x:a.x,y:a.y,rx:12.75*k,w}}
/* fl104Sh — a figure drawer's shadow disc (fillStyle already set by the caller) */
function fl104Sh(x,y,rx,ry){const p=FL104.off||typeof MINI_CUR==='undefined'?null:MINI_CUR;
  if(p&&FL104.active){let r=FL104.sh.get(p);if(!r){r={};FL104.sh.set(p,r)}
    const fs=ctx.fillStyle,a=fl104Abs(p,r),same=!!(a&&Math.abs(a.x-x)<0.6&&Math.abs(a.y-y)<0.6&&Math.abs(r.rx*TW-rx)<0.6&&Math.abs(r.ry*TW-ry)<0.6&&r.fs===fs);
    fl104Rel(p,r,x,y);r.rx=rx/TW;r.ry=ry/TW;r.fs=fs;r.ok=true;
    if(same&&fl104Has(p,64))return}
  ell(x,y,rx,ry);ctx.fill()}

/* a piece the pass leaves to its own drawers: it is moving (glide, shove, walk), swimming, mounted, or not a board figure */
function fl104Moving(p,isNpc){try{
  if(typeof PUSH100!=='undefined'&&(PUSH100.live.size||PUSH100.wob.size)&&(PUSH100.live.has(p)||PUSH100.wob.has(p)))return true;
  if(isNpc){if(typeof bst100Walks==='function'&&bst100Walks(p))return true;return false}
  if(typeof AN100!=='undefined'&&AN100.on&&typeof an100On==='function'&&an100On()&&typeof an100Glide==='function'&&an100Glide(p))return true;
  return false}catch(e){return true}}
function fl104Ring(x,y,rx,ry,col,lw){ctx.strokeStyle=col;ctx.lineWidth=lw;ell(x,y,rx,ry);ctx.stroke()}
function fl104Shadow(p,m){const r=FL104.sh.get(p),a=fl104Abs(p,r);if(!a)return 0;
  ctx.fillStyle=r.fs;ell(a.x,a.y,r.rx*TW,r.ry*TW);ctx.fill();return 64}

function floor104(alphaFor){if(FL104.off||HEADLESS||!S||typeof ctx==='undefined')return;const t0=performance.now();
  FL104.done.clear();FL104.active=true;FL104.st.passes++;let n=0;
  try{if(typeof isChariot==='function'&&isChariot())return;
    const ev=EV(),teams=!!(ev&&(ev.teams||ev.coop)),curP=S.over?null:S.players[S.cur];
    ctx.save();
    if(!DRAW_EMPTY)for(const p of S.players){if(!p.alive||p.exited||p.underground||p._onlSc||p._onlTok)continue;if(swimming(p)||(p.ch&&p.ch.mounted))continue;if(fl104Moving(p,false))continue;
      const m=center(p.r,p.c);ctx.globalAlpha=alphaFor?alphaFor('player',p.r,p.c):1;let bits=0;
      const sk=standeeKeyCls(p.cls),useFig=wantFigure(hasCustomToken(p.cls)),fig=useFig?tokenImg(tokenForP(p)):sk&&standeesOn()&&standeeImg(sk);
      const rim=fig?fl104RimAbs(p):null,hasRim=!!rim;
      if(teams&&p.team&&fig){const col=teamColor(p.team),cvd=(SETTINGS.cvdMode||'off')!=='off'||!!SETTINGS.cvd;
        ctx.save();ctx.fillStyle=col;ctx.globalAlpha*=0.2;ell(m.x,m.y+TW*0.03,TW*0.42,TW*0.21);ctx.fill();ctx.globalAlpha=(alphaFor?alphaFor('player',p.r,p.c):1)*0.95;
        ctx.strokeStyle='rgba(10,6,4,.7)';ctx.lineWidth=6;ell(m.x,m.y+TW*0.03,TW*0.42,TW*0.21);ctx.stroke();
        ctx.strokeStyle=col;ctx.lineWidth=4;if(cvd&&typeof TEAMDASH95!=='undefined')ctx.setLineDash((TEAMDASH95[p.team]||[]).map(v=>v*Math.max(0.6,TW/55)));
        ell(m.x,m.y+TW*0.03,TW*0.42,TW*0.21);ctx.stroke();ctx.restore();bits|=32}
      if(curP===p){const gx=hasRim?rim.rx+rim.w+1.5:TW*0.4;fl104Ring(m.x,m.y,gx,gx*0.5,'#f0cf7d',2.5);bits|=1}
      if(fig){if(hasRim){const rr=rim.rx+rim.w/2;fl104Ring(rim.x,rim.y,rr,rr*0.5,p.color,rim.w);bits|=16}
        else fl104Ring(m.x,m.y+TW*0.03,TW*0.3,TW*0.15,p.color,3);
        if(teams)fl104Ring(m.x,m.y+TW*0.03,TW*0.36,TW*0.18,teamColor(p.team),1.5);bits|=2;
        bits|=fl104Shadow(p,m)}
      if(bits){FL104.done.set(p,bits);n++}}
    if(!DRAW_EMPTY)for(const q of S.npcs){if(!q.alive||q.out||q.t==='zora')continue;if(fl104Moving(q,true))continue;
      const m=center(q.r,q.c),T=NPCT[q.t];if(!T)continue;ctx.globalAlpha=alphaFor?alphaFor('npc',q.r,q.c):1;let bits=0;
      const big=['tholo','lion','bear','commodus'].includes(q.t)||T.custom&&T.hp>=12,rx=TW*(big?0.27:0.22);
      if(q.tamedBy!=null&&S.players[q.tamedBy]){fl104Ring(m.x,m.y,rx*1.35,rx*0.68,S.players[q.tamedBy].color,2.5);bits|=4}
      if(q.alive&&npcStats(q).state==='Raged'){fl104Ring(m.x,m.y,rx*1.25,rx*0.62,'rgba(230,70,50,.85)',2);bits|=8}
      bits|=fl104Shadow(q,m);if(bits){FL104.done.set(q,bits);n++}}
    ctx.restore()}
  catch(e){console.error(e);FL104.done.clear()}
  finally{FL104.st.pieces+=n;FL104.st.ms+=performance.now()-t0;FL104.st.last={n,done:FL104.done.size}}}
function floor104End(){FL104.active=false;FL104.done.clear()}
