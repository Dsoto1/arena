/* =====================================================================
   366-v105fixb3.js — v1.05 beta-1 fix B36 (B25 / B31 / B32 follow-up): the seat disc over the ACTIVE gladiator's shins on his move, and the
   base-sized disc that came and went with "Show token bases" off. Kill switch: localStorage flavius_v105b3off=1 (back to 356 + 359). Test: tv105f.
   B36 ROOT CAUSE (reproduced, draw order recorded): nothing is painted after the figure. 07-ui's 'pieces' layer fades a figure in See-through
   'auto' (the default) when a focus tile behind it falls inside its sprite box — and the focus tiles are the hover tile AND every highlighted
   tile (HL). On his move the active piece stands in the middle of his own orange move tiles, so the tiles behind him always fade HIM to 0.45:
   his legs turn see-through and the floor marks under him (356's shadow disc, seat ring, gold turn ring) and his own base show through his
   shins and feet — it reads as the disc painted over the legs. Tests ran with XRAY='off' (tv104i / tv104l), so they never saw it.
     FIX: in See-through 'auto' the piece whose turn it is is never faded by the focus tiles (his own move fan, hover): the floor pass gets an
     alphaFor that keeps him at 1 (his marks) and his drawPlayer runs at full opacity (only inside the 'pieces' layer). Pillars and other pieces
     still fade in front of his tiles; See-through 'on' (the player's own pick: everything faded) is unchanged.
   BASES OFF (his second screenshot): the shadow disc is recorded by the figure drawers (fl104Sh) INSIDE 321's base wrapper, where 321's `ell`
   shrinks it ×0.62 with bases off — but 356's floor pass repaints the record outside that wrapper, so the pass drew it at the FULL base size
   (≈ 0.9 tile), and the inline frames (a piece the pass skipped, the first frame after a move) drew it small: a base-sized disc that came and
   went. FIX: the record keeps the scale it was drawn at; the pass paints it at that scale. A beast's disc (312, drawn outside 321's wrapper)
   shrinks the same way with bases off — it stayed base-sized under a base-less beast.
   Cost: one comparison per piece, no layer, no drawImage, no ctx wrapper. Deterministic (display only; RNG / S untouched). Reduce motion /
   Animations Off: nothing here animates. `B3105.st` = {passes, kept, shrunk}.
   ===================================================================== */
const B3105={off:(()=>{try{return localStorage.getItem('flavius_v105b3off')==='1'}catch(e){return false}})(),act:null,inPieces:false,bst:false,st:{passes:0,kept:0,shrunk:0}};
/* the piece kept opaque this frame: whose turn it is, See-through 'auto' only */
function b3105Act(){try{if(B3105.off||HEADLESS||!S||S.over||XRAY!=='auto')return null;const p=S.players[S.cur];return p&&p.alive&&!p.exited&&!p.underground?p:null}catch(e){return null}}
{const base=floor104;floor104=function(alphaFor){B3105.act=b3105Act();B3105.inPieces=!B3105.off;if(B3105.off)return base.apply(this,arguments);B3105.st.passes++;
  const a=B3105.act,af=a&&alphaFor?(kind,r,c)=>kind==='player'&&r===a.r&&c===a.c?1:alphaFor(kind,r,c):alphaFor;
  return base.call(this,af)}}
{const base=floor104End;floor104End=function(){B3105.inPieces=false;B3105.act=null;return base.apply(this,arguments)}}
{const base=drawPlayer;drawPlayer=function(p){if(B3105.inPieces&&p&&p===B3105.act&&ctx.globalAlpha<1){ctx.globalAlpha=1;B3105.st.kept++}return base.apply(this,arguments)}}
/* bases off: the shadow record keeps the scale 321's ell drew it at */
const b3105Off=()=>{try{return typeof bs101Mode==='function'&&bs101Mode()===2}catch(e){return false}};
{const base=fl104Sh;fl104Sh=function(x,y,rx,ry){if(B3105.off)return base.apply(this,arguments);
  const off=b3105Off(),inW=off&&typeof BS101!=='undefined'&&!!BS101.f; /* inside 321's wrapper its ell shrinks; a 312 beast (base flooded away by 334/346) shrinks here */
  const r=off&&!inW&&B3105.bst?base.call(this,x,y,rx*0.62,ry*0.62):base.apply(this,arguments);
  try{const p=typeof MINI_CUR!=='undefined'?MINI_CUR:null,rec=p&&FL104.sh.get(p);if(rec)rec.k105=inW?0.62:1}catch(e){}return r}}
{const base=fl104Shadow;fl104Shadow=function(p,m){if(B3105.off)return base.apply(this,arguments);const r=FL104.sh.get(p);
  if(!r||!(r.k105<1))return base.apply(this,arguments);const a=fl104Abs(p,r);if(!a)return 0;
  ctx.fillStyle=r.fs;ell(a.x,a.y,r.rx*TW*r.k105,r.ry*TW*r.k105);ctx.fill();B3105.st.shrunk++;return 64}}
if(typeof bst100Piece==='function'){const base=bst100Piece;bst100Piece=function(){const was=B3105.bst;
  B3105.bst=false;try{const n=typeof MINI_CUR!=='undefined'?MINI_CUR:null;if(n&&!n.cls&&n.t&&NPCT[n.t]&&bst100Mode()!=='off'){const k=bst100Key(n);B3105.bst=!!(k&&bst100Img(k,0))}}catch(e){} /* the 3D sheet path only (334/346 flood its base away) */
  try{return base.apply(this,arguments)}finally{B3105.bst=was}}}
