/* =====================================================================
   370-v105net.js — v1.05 B41: a netted piece's NET sits in the piece's own depth slot. Kill switch: localStorage flavius_v105netoff=1
   (back to 312's late pass). Test: tv105i.
   ROOT CAUSE: 312's bst100NetsPaint wraps every netted piece with its dome of cords (bst100NetWrap) from drawFX, i.e. AFTER every figure of the
   'pieces' layer. A gladiator on the tile in front of a netted snake was crossed by the snake's cage.
   FIX: while 312's pass runs, bst100NetWrap does nothing (NET105.skip); drawNPC / drawPlayer (wrapped last, outside every other wrapper) draw
   the same wrap right after the piece's figure, so the objs depth sort puts it behind pieces in front of the tile and over pieces behind it.
   Same look, same geometry, same animation: the thrown net (wind-up, flight, the drop's flat disc) stays in 312's FX pass, only the wrapped
   dome moves; the drop's wrap fades in with the piece. Both the 3D figure path and the classic token path go through drawNPC / drawPlayer.
   Animations Off (bst100Mode 'off'): nothing is drawn, as before. Cost: one dome per netted piece, as before; no layer, no ctx wrapper.
   NET105.rec (test only, null by default) collects {k:'fig'|'net',u} in call order.
   ===================================================================== */
const NET105={off:(()=>{try{return localStorage.getItem('flavius_v105netoff')==='1'}catch(e){return false}})(),skip:false,rec:null};
/* the piece's wrap, drawn right after its figure */
function net105Own(u){
  if(NET105.off||!u||!u.netted||!u.alive||u.exited||u.underground||typeof BST100==='undefined'||typeof bst100Mode!=='function'||bst100Mode()==='off'||!S)return;
  const N0=BST100.net,k=bst100K(),now=performance.now();let a=0.95,drop=false;
  for(const x of BST100.nets){if(x.u!==u)continue;const el=now-x.t0,T=(N0.wind+N0.fly+N0.drop)*k;if(el>=T)continue;
    if(el<(N0.wind+N0.fly)*k)return;/* still in the air: 312's FX paints the flight */
    a=(el-(N0.wind+N0.fly)*k)/(N0.drop*k);drop=true;break}
  const m=center(u.r,u.c);let dx=0,dy=0,zr=0;
  if(!drop){let off=null;if(!u.cls)off=bst100Off(u,BST100.anim.get(u),now);zr=u.t==='zora'&&pillarAt(u.r,u.c)?TW*1.05:0;if(off){dx=off.dx;dy=off.dy}}
  const was=NET105.skip;NET105.skip=false;
  try{bst100NetWrap(m.x+dx,m.y+dy-zr,bst100UnitH(u)*1.05,TW*0.36,a,0);if(!drop)BST100.stats.wraps=(BST100.stats.wraps||0)+1;if(NET105.rec)NET105.rec.push({k:'net',u})}
  finally{NET105.skip=was}}
{const base=bst100NetWrap;bst100NetWrap=function(){if(NET105.skip&&!NET105.off)return;return base.apply(this,arguments)}}
{const base=bst100NetsPaint;bst100NetsPaint=function(){if(NET105.off)return base.apply(this,arguments);NET105.skip=true;try{return base.apply(this,arguments)}finally{NET105.skip=false}}}
{const base=drawNPC;drawNPC=function(n){const r=base.apply(this,arguments);if(NET105.rec)NET105.rec.push({k:'fig',u:n});try{net105Own(n)}catch(e){console.error(e)}return r}}
{const base=drawPlayer;drawPlayer=function(p){const r=base.apply(this,arguments);if(NET105.rec)NET105.rec.push({k:'fig',u:p});try{net105Own(p)}catch(e){console.error(e)}return r}}
