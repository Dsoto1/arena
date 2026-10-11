/* =====================================================================
   75-NAUM59 · v0.59
   =====================================================================
   NAUMACHIA BY THE RULEBOOK (pp.48-49):
   - LAYOUT: top-left hull lies east-west (rows 1-3, cols 1-5), top-right north-south (rows 1-5, cols 9-11),
     bottom-right east-west (rows 9-11, cols 7-11), bottom-left north-south (rows 7-11, cols 1-3); the art's bows chase
     each other clockwise. Each hull's 4 cut corners are water (not deck): 10 deck tiles + the pillar.
   - BOARDING: from the water (or a floating door) a player boards only from a valid boarding tile — the three tiles
     beside each long side's middle and the one off each end — onto any adjacent or diagonal deck tile. Water costs
     2 movement to board; a door costs the normal step. Leaving a ship is free to any water tile.
   - WATER TOKENS: the 16 lie in the printed pinwheel — one on each side of the chest, then an arm of three (every
     other tile) running out from each, offset one row or column — their contents still drawn from the bag.
   - A boarding shows a grapple line and "⚓ Aboard!"; swimmers sit waist-deep in the water (07-ui drawPlayer).
   ===================================================================== */
const SHIP_LAYOUT59=[{r0:1,c0:1,rows:3,cols:5,pillar:[2,3],rot:1},{r0:1,c0:9,rows:5,cols:3,pillar:[3,10],rot:2},{r0:9,c0:7,rows:3,cols:5,pillar:[10,9],rot:3},{r0:7,c0:1,rows:5,cols:3,pillar:[9,2],rot:0}];
/* deck tiles of a box: everything but the four corners */
function shipDeck(B){const t=[];for(let r=B.r0;r<B.r0+B.rows;r++)for(let c=B.c0;c<B.c0+B.cols;c++){const er=r===B.r0||r===B.r0+B.rows-1,ec=c===B.c0||c===B.c0+B.cols-1;if(er&&ec)continue;t.push([r,c])}return t}
/* valid boarding tiles: beside the long sides' middle three, and one off each end */
function shipBoarding(B){const t=[];const vert=B.rows>B.cols;
  if(vert){for(let r=B.r0+1;r<=B.r0+3;r++){t.push([r,B.c0-1]);t.push([r,B.c0+B.cols])}t.push([B.r0-1,B.c0+1]);t.push([B.r0+B.rows,B.c0+1])}
  else{for(let c=B.c0+1;c<=B.c0+3;c++){t.push([B.r0-1,c]);t.push([B.r0+B.rows,c])}t.push([B.r0+1,B.c0-1]);t.push([B.r0+1,B.c0+B.cols])}
  return t.filter(([r,c])=>r>=0&&c>=0&&r<N&&c<N)}
SHIPS_DEF.forEach((d,i)=>{const L=SHIP_LAYOUT59[i];if(!L)return;d.box={...L};d.tiles=shipDeck(L);d.pillar=L.pillar;d.board=shipBoarding(L)});
const WATER_TOK59=[[5,6],[6,5],[6,7],[7,6],[4,7],[2,7],[0,7],[5,4],[5,2],[5,0],[7,8],[7,10],[7,12],[8,5],[10,5],[12,5]];
{const base=naumSetup;naumSetup=function(){const r=base.apply(this,arguments);try{
  for(const sh of S.ships||[]){const d=SHIPS_DEF[sh.id];if(d){sh.box={...d.box};sh.board=new Set(d.board.map(([a,b])=>a*N+b))}}
  (S.waterTok||[]).forEach((t,i)=>{const p=WATER_TOK59[i];if(p){t.r=p[0];t.c=p[1]}});
  /* more teams than ships (a bad seat list): the stranded find a free deck tile on any ship */
  const used=new Set(S.players.filter(p=>Number.isFinite(p.r)).map(p=>p.r*N+p.c));
  for(const p of S.players){if(Number.isFinite(p.r))continue;const k=S.ships.flatMap(s=>[...s.tiles]).find(k=>!used.has(k)&&!S.pillars.some(pl=>pl.r*N+pl.c===k));
    if(k==null)continue;used.add(k);p.r=Math.floor(k/N);p.c=k%N;p.start=[p.r,p.c]}}catch(e){console.error(e)}return r}}
/* the ship whose hull box covers (r,c) — corners included (for the art) */
const shipBoxAt=(r,c)=>S&&S.ships&&S.ships.find(s=>!s.sunk&&s.box&&r>=s.box.r0&&r<s.box.r0+s.box.rows&&c>=s.box.c0&&c<s.box.c0+s.box.cols);
const canBoard=(r,c,nr,nc)=>{const sh=shipAt(nr,nc);return !!(sh&&sh.board&&sh.board.has(r*N+c))};
nReach=function(p){
  const start=(p.r*N+p.c)*2+(p.onDoor!=null?1:0);
  const nb=key=>{const k=key>>1,onD=key&1,r=Math.floor(k/N),c=k%N,from=nTerr(r,c),out=[];
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(!inB(nr,nc)||pillarAt(nr,nc))continue;
      const u=unitAt(nr,nc);if(u&&u!==p)continue;
      const step=dr&&dc?2:1,to=nTerr(nr,nc),dAt=doorAt(nr,nc),nk=nr*N+nc;
      if(to==='ship'&&from!=='ship'&&!canBoard(r,c,nr,nc))continue; /* v0.59: boarding only from a valid boarding tile */
      if(onD){ if(to==='water'&&!dAt)out.push([nk*2+1,step]); else if(dAt)out.push([nk*2+1,step]); else out.push([nk*2,step]); continue}
      if(dAt){out.push([nk*2+1,2]);continue}
      if(from==='water'&&!doorAt(r,c)){ if(to==='water')out.push([nk*2,step]); else out.push([nk*2,2]); continue}
      if(to==='water')out.push([nk*2,step+1]);else out.push([nk*2,step]);
    }return out};
  const {dist,prev}=dijN(start,nb);
  const tiles=new Map(),best=new Map();
  for(const [key,d] of dist){if(d<=0)continue;const k=key>>1;if(!tiles.has(k)||d<tiles.get(k)){tiles.set(k,d);best.set(k,key)}}
  return {tiles,path:k=>best.has(k)?statePath(prev,dist,start,best.get(k),key=>({k:key>>1,door:key&1})):null};
};
/* the deck art covers the whole hull box (the cut corners show water through the art) */
drawShipTile=function(r,c){if(!shipLive())return;if(S.drainLine!=null&&r+c<=S.drainLine){if(r===N-1&&c===N-1)drawShipBows();return}
  const sh=shipBoxAt(r,c);const img=shipImg();
  if(sh&&img){ctx.save();tilePath(r,c);ctx.fillStyle=(r+c)%2?'#4f8f97':'#46838b';ctx.fill();ctx.clip();ctx.transform(...shipXform(sh.box));ctx.drawImage(img,0,0);ctx.restore()}
  if(r===N-1&&c===N-1)drawShipBows()};
/* boarding: a grapple line from where they came, "⚓ Aboard!", and a line in the log */
{const base=naumStep;naumStep=async function(p,step,or,oc){const was=or!=null?nTerr(or,oc):null;const r=await base.apply(this,arguments);
  try{const sh=shipAt(p.r,p.c);if(sh&&was&&was!=='ship'){fxLine({r:or,c:oc},{r:p.r,c:p.c},'#d8b878');fx(p.r,p.c,_T('⚓ Aboard!'),'#f0cf7d',{big:1});
    log(_T`${nm(p)} ${sh.team===p.team?_T('climbs back aboard'):_T('storms aboard')} the <b>${esc(sh.name)}</b>.`,sh.team===p.team?'':'big')}}catch(e){}return r}}
