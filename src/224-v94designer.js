/* =====================================================================
   224-V94DESIGNER · v0.94 THE EVENT DESIGNER AS THE ARENA VIEW (his picks 2026-10-07, §8 "v0.94 GO" 1)
   =====================================================================
   The Event Designer's Board step (83-edsteps; "All sections" → Board tab) becomes a match-like screen:
   1. BOARD IN THE MIDDLE = the real arena drawing: draw() paints a designer-only state (e94State: the draft layout as
      pillars/pots/spikes/tunnels/chest/beasts/floor items, phase 'setup', no players, the selected round's zone) into
      #cv parked in an off-screen box, the picture is copied to the designer's own canvas #e94cv, then S, RNG, uid, the
      camera and the main canvas go back exactly as they were (one synchronous swap — never the dice: RNG is null while
      it paints, so any rand() is Math.random). Never turned (no players → rot89Want 0), no duel zoom (zoomOut).
      Cached by a key (layout + round + width); hover, start corners, zone outlines, the check flash, the keyboard
      cursor and the drag ghost are cheap overlays on top. Tile names on hover (tl) in the line under the board.
   2. PALETTE (right column, like Fighter/Field/Stands in a match), three tabs:
      Terrain = pillar, Blessings pot (content), spikes, tunnel door, chest (+ its Level 4 weapons), floor items the
      layout already holds (offering, Golden Eagle, Arena Key, weapon, armor, coin), eraser, the pillars' Blessings list +
      🎲, Classic / Clear / Random layouts · Pieces = start corners 1..max (team colours A/B in team events = the setup's
      default split), printed + custom beasts (behaviour), Zora · Zones = each round's playing area in its colour
      (the layout holds three sizes: 13×13 / 9×9 / 5×5; tapping the board picks the ring you tap).
      Water and doors are NOT offered: custom events have no field for them (saved events keep their shape).
   3. TOOLS (bottom, where the log is): the round strip (R1..R3 cards: name, area, PvE/PvP/CF/CA, end + N, reward;
      click = show its zone; add / remove / ◀ ▶ reorder), the deck slots (129 ed82HTML), the music select (64), a live
      CHECKS list (eventErrors + start on spikes/tunnel/chest/outside round 1, beasts on starts, round order…; click →
      the tile flashes), ↶ Undo / ↷ Redo (whole-draft snapshots, Ctrl+Z / Ctrl+Y).
   4. INTERACTION: desktop — drag a palette item onto a tile, drag a piece on the board to move it, right-click removes;
      a click on an item selects it as a stamp (click tiles). Touch — tap an item, tap tiles to stamp, long-press a tile
      removes, drag a piece to move it. Keyboard — the board is a Tab stop: arrows move a gold cursor (screen directions,
      as 220-v93a11y), Enter/Space stamps, Delete removes, Escape drops the stamp; buttons carry aria labels; Reduce
      motion = no flash pulse. Phones (≤760 px): one column (board, palette, tools), round strip scrolls inside its box.
   5. ▶ TEST PLAY (his ask, added mid-batch): an all-CPU game of the draft as it stands, unsaved — the draft is copied into a hidden
      EVENTS.__e94t (not enumerable, never stored), the Studio closes, startEvent runs it with CPU seats; the test S carries
      e94test: no records, Annals, Hall, trophies, crowd memory, Ludus, wagers, autosave, calendar or music unlock (the same
      record functions 119 guards online + every Store write), the results window offers only ◀ Back to the designer, and a
      #e94back button leaves at any time. Coming back reopens the Studio on the arena with the draft, round, palette and
      the undo/redo history exactly as they were.
   Off: localStorage flavius_ed94off=1 → the old grid. NO mirror switch, NO test play (his call). Test: tv94d.
   ===================================================================== */
const E94={on:true,tab:'terrain',tool:null,opt:{beh:'auto',offer:'elix4',weapon:'gladius',armor:'galea',coin:5,pot:'?'},round:0,hover:null,flash:null,flashT:0,
  undo:[],redo:[],ref:null,cv:null,base:null,baseKey:'',geo:null,press:null,drag:null,cursor:null,kbd:false,raf:0,def:null,noClick:0};
try{if(localStorage.getItem('flavius_ed94off')==='1')E94.on=false}catch(e){}
const E94_RC=['#f0cf7d','#5fc7c0','#e07b9a'];
const E94_TEAM={A:'#c0433a',B:'#4f7fc4'};
/* e94Live — the arena view is on screen for an event draft */
function e94Live(){return E94.on&&typeof ST!=='undefined'&&ST&&ST.tab==='events'&&ST.view==='edit'&&!!ST.draft&&!!ST.draft.layout}
/* the hidden event the board paints as (never listed: not enumerable) */
try{Object.defineProperty(EVENTS,'__e94',{configurable:true,enumerable:false,get(){return E94.def}})}catch(e){}
const e94At=(r,c)=>x=>!!x&&x[0]===r&&x[1]===c;
const e94Zone=(z,r,c)=>{const q=ZONES[+z]||ZONES[1];return r>=q[0]&&r<=q[1]&&c>=q[0]&&c<=q[1]};
function e94Seat(i){const d=ST.draft;if(d.mode==='teams'){const t=i%2?'B':'A';return {col:E94_TEAM[t],lab:t+(Math.floor(i/2)+1)}}return {col:(typeof PALETTE!=='undefined'?PALETTE:E94_RC)[i%8],lab:'P'+(i+1)}}
/* ---------- the designer state draw() paints ---------- */
function e94State(d){const L=d.layout;const ri=Math.max(0,Math.min(d.rounds.length-1,E94.round));
  const s={evKey:'__e94',locIdx:+d.loc||6,opts:{},players:[],npcs:[],pillars:[],tunnels:(L.tunnels||[]).map(([r,c])=>({r,c})),
    chest:L.chest?{r:L.chest[0],c:L.chest[1],weapons:[],held:null}:null,active:{},hist:{},spikes:(L.spikes||[]).map(([r,c])=>({r,c})),floor:[],piles:[],
    ri,cur:0,rotation:1,turnNo:0,phase:'setup',mode:'move',npcKills:0,elims:0,deck:[],round2:[],market:null,over:false,busy:false,pending:null,
    truces:new Set(),spect:[],exits:[],teamPts:{},capture:null,zoomOut:true,ed94:true,startedAt:0,seed:1,npcHpMul:(+d.npcHp||100)/100,limits:{},bag:[]};
  S=s;
  s.pillars=(L.pillars||[]).map((p,i)=>({id:i,r:p.r,c:p.c,pots:p.pot?[p.pot==='?'?'elix2':p.pot]:[]}));
  for(const n of L.npcs||[]){const NT=NPCT[n.t];if(!NT)continue;const beh=n.beh||(NT.scan?'hunt':NT.huntCF?'cf':'zone');let z=null;try{z=beh==='zone'?zoneAround(n.t,n.r,n.c,n.name):null}catch(e){}
    s.npcs.push(mkNPC(n.t,n.name,n.r,n.c,{home:beh==='zone'?[n.r,n.c]:null,zone:z}))}
  for(const it of L.items||[]){
    if(it.kind==='offer'||it.kind==='key')s.floor.push({id:uid++,kind:it.kind,key:it.kind==='key'?'key':it.key,r:it.r,c:it.c});
    else{let pl=s.piles.find(x=>x.r===it.r&&x.c===it.c);if(!pl){pl={id:uid++,owner:-1,color:'#e8dcc0',name:'the arena',r:it.r,c:it.c,corpse:false,weapons:[],armor:[],coin:0,items:[]};s.piles.push(pl)}
      if(it.kind==='weapon'&&W[it.key])pl.weapons.push(mkW(it.key));if(it.kind==='armor'&&ARM[it.key])pl.armor.push({key:it.key,n:ARM[it.key].n,ap:ARM[it.key].ap,from:'drop'});if(it.kind==='coin')pl.coin+=+it.key||3}}
  return s}
/* e94Base — the real arena picture for the draft (cached by key); geo = the tile frame used for picks and overlays */
function e94Base(w,maxH){const d=ST.draft;const dpr=window.devicePixelRatio||1;
  const key=JSON.stringify([d.layout,d.loc,d.npcHp,E94.round,d.rounds.map(r=>r.zone),w,maxH,dpr]);if(key===E94.baseKey&&E94.base)return true;
  const home=cv.parentElement,next=cv.nextSibling;const box=document.createElement('div');box.style.cssText=`position:fixed;left:-30000px;top:0;width:${w}px;visibility:hidden;pointer-events:none`;document.body.appendChild(box);
  const sv={S,RNG,uid,fit:SETTINGS.fit,camz:typeof CAM!=='undefined'?CAM.z:null,ht:hoverTile,rk:typeof ROT89!=='undefined'?ROT89.k:0};let ok=false;
  try{RNG=null;E94.def=eventDef(d);e94State(d);SETTINGS.fit=false;if(typeof CAM!=='undefined')CAM.z=null;hoverTile=null;box.appendChild(cv);draw();
    let Hd=cv.height/dpr;if(maxH&&Hd>maxH){box.style.width=Math.max(160,Math.floor(w*maxH/Hd))+'px';draw();Hd=cv.height/dpr}
    const off=E94.base&&E94.base.getContext?E94.base:document.createElement('canvas');off.width=cv.width;off.height=cv.height;const ox=off.getContext('2d');ox.setTransform(1,0,0,1,0,0);ox.clearRect(0,0,off.width,off.height);ox.drawImage(cv,0,0);
    E94.base=off;E94.geo={OX,OY,TW,TH,w:cv.width/dpr,h:Hd,dpr};E94.baseKey=key;ok=true}
  catch(e){console.error(e)}
  finally{S=sv.S;RNG=sv.RNG;uid=sv.uid;SETTINGS.fit=sv.fit;if(typeof CAM!=='undefined')CAM.z=sv.camz;hoverTile=sv.ht;if(typeof ROT89!=='undefined')ROT89.k=sv.rk;
    try{if(next&&next.parentNode===home)home.insertBefore(cv,next);else if(home)home.appendChild(cv)}catch(e){}box.remove();try{draw()}catch(e){}}
  return ok}
/* nothing to highlight while the designer state paints (no players, no turn) */
{const base=computeHL;computeHL=function(){if(S&&S.ed94){HL=new Map();return}return base.apply(this,arguments)}}
/* tile frame helpers on the designer canvas */
function e94C(r,c){const g=E94.geo;return {x:g.OX+(c-r)*g.TW/2,y:g.OY+(c+r)*g.TH/2+g.TH/2}}
function e94Pick(x,y){const g=E94.geo;if(!g)return null;const u=(x-g.OX)/(g.TW/2),v=(y-g.OY-g.TH/2)/(g.TH/2);const c=Math.round((u+v)/2),r=Math.round((v-u)/2);return r>=0&&r<N&&c>=0&&c<N?[r,c]:null}
function e94Diamond(x,r,c,inset){const g=E94.geo;const m=e94C(r,c);const w=g.TW/2-(inset||0),h=g.TH/2-(inset||0)/2;x.beginPath();x.moveTo(m.x,m.y-h);x.lineTo(m.x+w,m.y);x.lineTo(m.x,m.y+h);x.lineTo(m.x-w,m.y);x.closePath()}
/* e94Paint — base picture + overlays */
function e94Paint(){E94.raf=0;const c=E94.cv;if(!c||!c.isConnected||!e94Live())return;const host=c.parentElement;const w=Math.max(220,Math.floor(host.clientWidth||0));
  const maxH=Math.max(240,Math.min(innerHeight*0.66,innerWidth<=760?innerHeight*0.5:9999));
  if(!e94Base(w,maxH)||!E94.base)return;const g=E94.geo;
  if(c.width!==E94.base.width)c.width=E94.base.width;if(c.height!==E94.base.height)c.height=E94.base.height;c.style.width=g.w+'px';c.style.height=g.h+'px';
  const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);x.drawImage(E94.base,0,0);x.setTransform(g.dpr,0,0,g.dpr,0,0);
  const d=ST.draft,L=d.layout;
  /* round areas: the selected round always, every round on the Zones tab */
  d.rounds.forEach((rd,i)=>{if(i!==E94.round&&E94.tab!=='zones')return;const q=ZONES[+rd.zone]||ZONES[1];const a=e94C(q[0],q[0]),b=e94C(q[0],q[1]),cc=e94C(q[1],q[1]),dd=e94C(q[1],q[0]);const k=g.TW/2+1+i*2.5,h=g.TH/2+0.5+i*1.25;
    x.save();x.setLineDash(i===E94.round?[]:[6,4]);x.lineWidth=i===E94.round?2.5:1.6;x.strokeStyle=E94_RC[i%3];x.beginPath();x.moveTo(a.x,a.y-h);x.lineTo(b.x+k,b.y);x.lineTo(cc.x,cc.y+h);x.lineTo(dd.x-k,dd.y);x.closePath();x.stroke();x.restore()});
  /* start corners */
  (L.starts||[]).forEach((s,i)=>{if(!s)return;const sd=e94Seat(i);e94Diamond(x,s[0],s[1],3);x.save();x.globalAlpha=0.38;x.fillStyle=sd.col;x.fill();x.globalAlpha=1;x.lineWidth=2;x.strokeStyle=sd.col;x.stroke();
    const m=e94C(s[0],s[1]);x.font=`700 ${Math.max(9,Math.round(g.TW*0.26))}px var(--mono),monospace`;x.textAlign='center';x.textBaseline='middle';x.lineWidth=3;x.strokeStyle='rgba(10,6,3,.9)';x.strokeText(sd.lab,m.x,m.y);x.fillStyle='#fff';x.fillText(sd.lab,m.x,m.y);x.restore()});
  const ring=(t,col,wd,dash)=>{if(!t)return;e94Diamond(x,t[0],t[1],1);x.save();if(dash)x.setLineDash(dash);x.lineWidth=wd;x.strokeStyle=col;x.stroke();x.restore()};
  if(E94.flash&&performance.now()-E94.flashT<2600){const calm=typeof reduceMotion==='function'&&reduceMotion();const a=calm?1:0.55+0.45*Math.sin((performance.now()-E94.flashT)/120);x.save();x.globalAlpha=a;ring(E94.flash,'#ff5a3c',4);x.restore();if(!calm)e94Soon()}
  if(E94.kbd&&E94.cursor&&document.activeElement===c)ring(E94.cursor,'#f2c75c',2.5,[5,3]);
  if(E94.hover&&!E94.drag)ring(E94.hover,'rgba(255,255,255,.85)',1.6);
  if(E94.drag&&E94.drag.tile){const okk=e94CanPlace(E94.drag,E94.drag.tile);ring(E94.drag.tile,okk?'#7fe08a':'#ff6a5a',3)}}
function e94Soon(){if(!E94.raf)E94.raf=requestAnimationFrame(e94Paint)}
/* ---------- what sits on a tile ---------- */
function e94What(r,c){const L=ST.draft.layout,at=e94At(r,c),out=[];
  const pl=L.pillars.find(p=>p.r===r&&p.c===c);if(pl)out.push(_T('Pillar')+(pl.pot?' · '+(pl.pot==='?'?_T('Blessings pot (random)'):_T`Blessings pot (${OFFER[pl.pot]?OFFER[pl.pot].n:pl.pot})`):''));
  if(L.spikes.some(at))out.push(_T('Spikes'));if(L.tunnels.some(at))out.push(_T('Tunnel door'));if(L.chest&&at(L.chest))out.push(_T('Arena Chest'));
  L.starts.forEach((s,i)=>{if(at(s))out.push(_T`Start ${i+1}`)});
  for(const n of L.npcs)if(n.r===r&&n.c===c&&NPCT[n.t])out.push(`${n.name} (${NPCT[n.t].n})`);
  for(const it of L.items)if(it.r===r&&it.c===c)out.push(it.kind==='offer'?(OFFER[it.key]?OFFER[it.key].n:it.key):it.kind==='key'?_T('Arena Key'):it.kind==='weapon'?(W[it.key]?W[it.key].n:it.key):it.kind==='armor'?(ARM[it.key]?ARM[it.key].n:it.key):_T`${it.key} coin`);
  return out}
function e94Hov(t){const el=document.getElementById('e94hov');if(!el)return;if(!t){el.textContent=E94.tool?_T`Stamp: ${e94ToolName(E94.tool)} — tap tiles · long-press or right-click removes`:_T('Drag from the palette onto the sand · drag a piece to move it · right-click removes');return}
  const w=e94What(t[0],t[1]);el.textContent=tl(t[0],t[1])+(w.length?' · '+w.join(' · '):_T(' · empty sand'))}
/* ---------- placing, removing, moving (the old designer's data shapes) ---------- */
function e94Snap(){const s=JSON.stringify(ST.draft);if(E94.undo[E94.undo.length-1]!==s){E94.undo.push(s);if(E94.undo.length>80)E94.undo.shift()}E94.redo=[];E94.ref=ST.draft}
function e94Change(fn){const before=JSON.stringify(ST.draft);let ok=false;try{ok=fn()!==false}catch(e){console.error(e)}
  if(!ok||JSON.stringify(ST.draft)===before)return false;E94.undo.push(before);if(E94.undo.length>80)E94.undo.shift();E94.redo=[];E94.ref=ST.draft;e94Redraw();return true}
function e94Redraw(){if(typeof studioRedraw==='function')studioRedraw()}
function e94ToolName(t){if(!t)return '';const m={pillar:_T('Pillar'),pot:_T('Blessings pot'),spike:_T('Spikes'),tunnel:_T('Tunnel door'),chest:_T('Arena Chest'),offer:_T('Offering'),eagle:_T('Golden Eagle'),key:_T('Arena Key'),weapon:_T('Weapon'),armor:_T('Armor'),coin:_T('Coin pile'),erase:_T('Eraser')};
  if(t.k==='start')return _T`Start ${t.v+1}`;if(t.k==='npc')return String(t.v).startsWith('cn:')?((CUSTOM.npcs.find(n=>n.id===t.v.slice(3))||{}).name||_T('Beast')):t.v;return m[t.k]||t.k}
function e94Toast(h){if(typeof mToast==='function')mToast(h)}
function e94CanPlace(t,tile){if(!t||!tile)return false;const [r,c]=tile;const L=ST.draft.layout;const pl=L.pillars.find(p=>p.r===r&&p.c===c);
  if(t.move){const m=t.move;if(m.what==='pillar')return !pl||pl===m.ref;return !pl}
  if(t.k==='pot')return !!pl;if(t.k==='erase'||t.k==='tunnel'||t.k==='chest')return true;if(t.k==='pillar')return !pl&&L.pillars.length<12&&!L.starts.some(e94At(r,c));return !pl}
function e94Place(t,r,c){const d=ST.draft,L=d.layout,at=e94At(r,c),pl=L.pillars.find(p=>p.r===r&&p.c===c),o=E94.opt;
  const clearUnits=()=>{L.npcs=L.npcs.filter(n=>!(n.r===r&&n.c===c))};
  switch(t.k){
    case 'pillar':if(pl)return false;if(L.pillars.length>=12){e94Toast(_T('🏛 At most 12 pillars.'));return false}if(L.starts.some(at)){e94Toast(_T('🏛 A start tile cannot hold a pillar.'));return false}
      clearUnits();L.spikes=L.spikes.filter(x=>!at(x));L.items=L.items.filter(x=>!(x.r===r&&x.c===c));L.pillars.push({r,c,pot:null});return true;
    case 'pot':if(!pl){e94Toast(_T('🏺 A Blessings pot sits on a <b>pillar</b> — place a pillar there first.'));return false}pl.pot=o.pot||'?';return true;
    case 'spike':if(pl)return false;if(L.spikes.some(at))return false;L.spikes.push([r,c]);return true;
    case 'tunnel':if(L.tunnels.some(at))return false;L.tunnels.push([r,c]);return true;
    case 'chest':L.chest=[r,c];return true;
    case 'start':{if(pl){e94Toast(_T('A start tile cannot sit on a pillar.'));return false}const s=+t.v||0;for(let j=0;j<L.starts.length;j++)if(j!==s&&at(L.starts[j]))L.starts[j]=null;while(L.starts.length<s)L.starts.push(null);L.starts[s]=[r,c];e94TrimStarts(L);return true}
    case 'npc':{if(pl)return false;const ch=t.v;let def;
      if(String(ch).startsWith('cn:')){const id=ch.slice(3);const cn=CUSTOM.npcs.find(x=>x.id===id);if(!cn)return false;const cnt=L.npcs.filter(x=>x.t==='cn_'+id).length;def={key:'cn_'+id+'_'+cnt,t:'cn_'+id,name:cnt?`${cn.name} ${['II','III','IV','V','VI'][cnt-1]||cnt+1}`:cn.name}}
      else{const b=BASE_NPCS.find(x=>x.name===ch);const sp=SPAWN_NPCS.find(x=>x[0]===ch);if(!b&&!sp)return false;def={key:ch,t:b?b.t:sp[1],name:ch};L.npcs=L.npcs.filter(n=>n.name!==ch)}
      if(!NPCT[def.t])return false;clearUnits();L.npcs.push({...def,r,c,beh:o.beh&&o.beh!=='auto'?o.beh:NPCT[def.t].scan?'hunt':NPCT[def.t].huntCF?'cf':'zone'});return true}
    case 'offer':if(pl)return false;L.items.push({kind:'offer',key:o.offer||'elix4',r,c});return true;
    case 'eagle':if(pl)return false;L.items.push({kind:'offer',key:'eagle',r,c});return true;
    case 'key':if(pl)return false;L.items.push({kind:'key',key:'key',r,c});return true;
    case 'weapon':if(pl)return false;L.items.push({kind:'weapon',key:o.weapon||'gladius',r,c});return true;
    case 'armor':if(pl)return false;L.items.push({kind:'armor',key:o.armor||'galea',r,c});return true;
    case 'coin':if(pl)return false;L.items.push({kind:'coin',key:+(o.coin||5),r,c});return true;
    case 'erase':return e94Remove(r,c,true)}
  return false}
function e94TrimStarts(L){while(L.starts.length&&!L.starts[L.starts.length-1])L.starts.pop()}
/* e94Top — the topmost removable/movable thing on a tile */
function e94Top(r,c){const L=ST.draft.layout,at=e94At(r,c);
  const n=L.npcs.find(x=>x.r===r&&x.c===c);if(n)return {what:'npc',ref:n};
  const its=L.items.filter(x=>x.r===r&&x.c===c);if(its.length)return {what:'item',ref:its[its.length-1]};
  const si=L.starts.findIndex(at);if(si>=0)return {what:'start',i:si};
  if(L.chest&&at(L.chest))return {what:'chest'};
  const pl=L.pillars.find(p=>p.r===r&&p.c===c);if(pl)return {what:'pillar',ref:pl};
  const sp=L.spikes.find(at);if(sp)return {what:'spike',ref:sp};
  const tu=L.tunnels.find(at);if(tu)return {what:'tunnel',ref:tu};return null}
function e94Remove(r,c,all){const L=ST.draft.layout,at=e94At(r,c);
  if(all){const n0=JSON.stringify(L);L.pillars=L.pillars.filter(p=>!(p.r===r&&p.c===c));L.spikes=L.spikes.filter(x=>!at(x));L.tunnels=L.tunnels.filter(x=>!at(x));if(L.chest&&at(L.chest))L.chest=null;
    L.npcs=L.npcs.filter(n=>!(n.r===r&&n.c===c));L.items=L.items.filter(x=>!(x.r===r&&x.c===c));L.starts=L.starts.map(s=>at(s)?null:s);e94TrimStarts(L);return JSON.stringify(L)!==n0}
  const t=e94Top(r,c);if(!t)return false;
  if(t.what==='npc')L.npcs=L.npcs.filter(x=>x!==t.ref);else if(t.what==='item')L.items=L.items.filter(x=>x!==t.ref);
  else if(t.what==='start'){L.starts[t.i]=null;e94TrimStarts(L)}else if(t.what==='chest')L.chest=null;else if(t.what==='pillar')L.pillars=L.pillars.filter(x=>x!==t.ref);
  else if(t.what==='spike')L.spikes=L.spikes.filter(x=>x!==t.ref);else if(t.what==='tunnel')L.tunnels=L.tunnels.filter(x=>x!==t.ref);return true}
function e94Move(m,r,c){const L=ST.draft.layout,at=e94At(r,c);const pl=L.pillars.find(p=>p.r===r&&p.c===c);
  if(m.what==='pillar'){if(pl)return false;L.spikes=L.spikes.filter(x=>!at(x));L.npcs=L.npcs.filter(n=>!(n.r===r&&n.c===c));m.ref.r=r;m.ref.c=c;return true}
  if(pl)return false;
  if(m.what==='npc'){L.npcs=L.npcs.filter(n=>n===m.ref||!(n.r===r&&n.c===c));m.ref.r=r;m.ref.c=c;return true}
  if(m.what==='item'){m.ref.r=r;m.ref.c=c;return true}
  if(m.what==='start'){for(let j=0;j<L.starts.length;j++)if(j!==m.i&&at(L.starts[j]))L.starts[j]=null;L.starts[m.i]=[r,c];e94TrimStarts(L);return true}
  if(m.what==='chest'){L.chest=[r,c];return true}
  if(m.what==='spike'||m.what==='tunnel'){const arr=m.what==='spike'?L.spikes:L.tunnels;if(arr.some(at))return false;m.ref[0]=r;m.ref[1]=c;return true}return false}
function e94ZoneAt(r,c){const ring=Math.min(r,c,N-1-r,N-1-c);return ring<2?1:ring<4?2:3}
/* ---------- checks ---------- */
function e94Checks(d){const L=d.layout,out=[];const add=(lvl,txt,tile,round)=>out.push({lvl,txt,tile:tile||null,round:round==null?null:round});
  try{for(const t of eventErrors(d))add('err',t)}catch(e){}
  const z1=d.rounds[0]?d.rounds[0].zone:1;
  L.starts.forEach((s,i)=>{if(!s||i>=+d.max)return;const at=e94At(s[0],s[1]);const nm=_T`Start ${i+1}`;
    if(L.spikes.some(at))add('warn',_T`${nm} is on spikes`,s);if(L.tunnels.some(at))add('warn',_T`${nm} is on a tunnel`,s);if(L.chest&&at(L.chest))add('warn',_T`${nm} is on the chest`,s);
    if(L.npcs.some(n=>at([n.r,n.c])))add('warn',_T`A beast stands on ${nm} — it will step aside`,s);
    if(!e94Zone(z1,s[0],s[1]))add('warn',_T`${nm} is outside Round 1's area`,s,0)});
  for(const n of L.npcs){if(!NPCT[n.t])add('err',_T`${n.name}: this beast no longer exists`,[n.r,n.c]);else if(!e94Zone(z1,n.r,n.c))add('warn',_T`${n.name} starts outside Round 1's area`,[n.r,n.c],0)}
  d.rounds.forEach((rd,i)=>{if(!END_CONDS.some(x=>x[0]===rd.end))add('warn',_T`Round ${i+1} has no end`,null,i);
    if(i>0&&+rd.zone<+d.rounds[i-1].zone)add('warn',_T`Round ${i+1}'s area is bigger than Round ${i}'s`,null,i);
    if(!rd.pve&&!rd.pvp)add('warn',_T`Round ${i+1} has no fighting (PvE and PvP off)`,null,i)});
  return out}
/* ---------- the view ---------- */
{const st=document.createElement('style');st.id='e94css';st.textContent=`
.ed94{display:grid;gap:8px;min-width:0}
.e94main{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,300px);gap:10px;align-items:start;min-width:0}
.e94board{background:#120c08;border:1px solid var(--line2);border-radius:8px;padding:4px;min-width:0;overflow:hidden}
#e94Host{display:flex;justify-content:center;min-height:220px}
#e94cv{display:block;touch-action:none;cursor:crosshair;max-width:100%;border-radius:6px}
#e94cv.grab{cursor:grabbing}
.e94hov{min-height:1.5em;font:12px var(--mono);color:#cbb898;padding:3px 6px;overflow-wrap:anywhere}
.e94pal,.e94box{border:1px solid var(--line2);border-radius:8px;padding:8px;background:rgba(0,0,0,.18);min-width:0}
.e94pal{max-height:min(78vh,760px);overflow:auto}
.e94tabs{display:flex;gap:4px;margin-bottom:8px}.e94tabs button{flex:1;border:1px solid var(--line2);background:none;color:#d8c8a8;border-radius:14px;padding:4px 6px;cursor:pointer;font-size:13px}
.e94tabs button[aria-selected="true"]{border-color:var(--gold);color:var(--gold2);background:rgba(240,207,125,.1)}
.e94h{font:600 11px var(--mono);letter-spacing:.08em;color:#cbb898;text-transform:uppercase;margin:8px 0 4px}
.e94grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(62px,1fr));gap:4px}
.e94it{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 2px;border:1px solid var(--line2);border-radius:6px;background:rgba(255,255,255,.04);color:var(--text);font-size:11px;line-height:1.15;cursor:grab;min-height:54px;text-align:center;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.e94it[aria-pressed="true"]{border-color:var(--gold);background:rgba(240,207,125,.16);box-shadow:0 0 0 1px var(--gold) inset}
.e94it .ic{font-size:20px;line-height:1;display:grid;place-items:center;width:30px;height:30px}.e94it .ic svg,.e94it .ic img{max-width:30px;max-height:30px}
.e94it .sw{width:22px;height:22px;border-radius:50%;border:2px solid #fff3;display:grid;place-items:center;font:700 10px var(--mono);color:#fff}
.e94opt{display:grid;gap:4px;margin-top:6px}.e94opt label{display:grid;gap:2px;font-size:12px}
.e94zr{display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;margin:4px 0;padding:4px;border-radius:6px;border:1px solid transparent}
.e94zr.sel{border-color:var(--line2);background:rgba(255,255,255,.04)}.e94zr .seg{display:flex;gap:3px;flex-wrap:wrap}
.e94zr .seg button{border:1px solid var(--line2);background:none;color:#d8c8a8;border-radius:12px;padding:2px 8px;cursor:pointer;font-size:12px}
.e94zr .seg button[aria-pressed="true"]{border-color:var(--zc);color:#fff;background:color-mix(in srgb,var(--zc) 35%,transparent)}
.e94dot{width:14px;height:14px;border-radius:50%;background:var(--zc);display:inline-block}
.e94tools{display:grid;gap:8px;min-width:0}
.e94rounds{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;max-width:100%}
.e94rc{flex:0 0 228px;border:1px solid var(--line2);border-top:3px solid var(--rc);border-radius:6px;padding:6px;background:rgba(255,255,255,.03);display:grid;gap:4px;font-size:12px;cursor:pointer}
.e94rc.sel{box-shadow:0 0 0 2px var(--rc)}
.e94rc .hd{display:flex;gap:4px;align-items:center}.e94rc .hd b{color:var(--rc);font-family:var(--mono)}.e94rc .hd input{flex:1;min-width:0}
.e94rc .tin{padding:2px 4px;font-size:12px}.e94rc .ln{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
.e94rc .ln input[type=number]{width:46px}.e94rc .ln select{width:auto;max-width:100%}
.e94sm{border:1px solid var(--line2);background:none;color:#d8c8a8;border-radius:5px;padding:1px 6px;cursor:pointer;font-size:12px;min-width:24px}
.e94sm[aria-pressed="true"]{border-color:var(--gold);color:var(--gold2);background:rgba(240,207,125,.12)}.e94sm:disabled{opacity:.4;cursor:default}
.e94add{flex:0 0 80px;border:1px dashed var(--line2);border-radius:6px;background:none;color:#d8c8a8;cursor:pointer}
.e94row2{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr) minmax(0,1.15fr);gap:8px;min-width:0}
.e94row2 .slot82row{flex-wrap:wrap}.e94row2 h4{margin:0 0 4px}
.e94chk{list-style:none;margin:0;padding:0;display:grid;gap:3px;max-height:220px;overflow:auto}
.e94chk button{width:100%;text-align:left;border:1px solid transparent;background:rgba(255,255,255,.03);color:var(--text);border-radius:5px;padding:3px 6px;cursor:pointer;font-size:12px}
.e94chk .err{color:#ff9c86}.e94chk .warn{color:#f0cf7d}.e94chk .ok{color:#8fd694}
.e94ur{display:flex;gap:6px;flex-wrap:wrap}
.e94ghost{position:fixed;pointer-events:none;z-index:2147483000;font-size:26px;transform:translate(-50%,-70%);filter:drop-shadow(0 2px 3px #000)}
@media (max-width:760px){.e94main{grid-template-columns:minmax(0,1fr)}.e94row2{grid-template-columns:minmax(0,1fr)}.e94pal{max-height:none}.e94rc{flex-basis:200px}
  .e94grid{grid-template-columns:repeat(auto-fill,minmax(56px,1fr))}}`;document.head.appendChild(st)}
function e94Btn(k,v,ic,lab,extra){const t={k,v};const on=E94.tool&&E94.tool.k===k&&String(E94.tool.v??'')===String(v??'');
  return `<button type="button" class="e94it" data-e94tool="${esc(k)}" data-v="${esc(v??'')}" aria-pressed="${on?'true':'false'}" aria-label="${esc(lab)}" title="${esc(lab)}">${extra||`<span class="ic" aria-hidden="true">${ic}</span>`}<span>${esc(lab)}</span></button>`}
function e94Sel(o,opts,val,lab){return `<label>${lab}<select class="tin" data-e94o="${o}">${opts.map(([v,l])=>`<option value="${esc(v)}" ${String(val)===String(v)?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`}
function e94PalHTML(){const d=ST.draft,L=d.layout,o=E94.opt,t=E94.tool;
  const tabs=`<div class="e94tabs" role="tablist" aria-label="${_T`Palette`}">${[['terrain',_T('Terrain')],['pieces',_T('Pieces')],['zones',_T('Zones')]].map(([k,l])=>`<button type="button" role="tab" data-e94="tab" data-v="${k}" aria-selected="${E94.tab===k}">${l}</button>`).join('')}</div>`;
  let body='';
  if(E94.tab==='terrain'){
    const offers=Object.entries(OFFER).filter(([k])=>k!=='key'&&k!=='eagle').map(([k,v])=>[k,`${v.n} (${v.s})`]);
    let opt='';const tk=t&&t.k;
    if(tk==='pot')opt=e94Sel('pot',[['?',_T('Random blessing from the bag')],...offers],o.pot,_T('Pot holds'));
    if(tk==='offer')opt=e94Sel('offer',offers,o.offer,_T('Offering'));
    if(tk==='weapon')opt=e94Sel('weapon',weaponOpts(4).slice(1),o.weapon,_T('Weapon'));
    if(tk==='armor')opt=e94Sel('armor',armorOpts(()=>true).slice(1),o.armor,_T('Armor token'));
    if(tk==='coin')opt=e94Sel('coin',[[3,'3'],[5,'5'],[8,'8'],[12,'12']],o.coin,_T('Coin in the pile'));
    const pots=L.pillars.length?`<div class="potlist" id="potList">${L.pillars.map((p,i)=>`<label class="potrow"><span>🏛 ${tl(p.r,p.c)}</span><select class="tin" data-potsel="${i}" aria-label="${_T`Blessings pot on the pillar at ${tl(p.r,p.c)}`}">${[['',_T('— no pot —')],['?',_T('🏺 Random blessing')],...offers].map(([k,l])=>`<option value="${k}" ${(p.pot||'')===k?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`).join('')}</div>`:`<p class="rc-sub" style="margin:4px 0">${_T`Place pillars first — each can carry one Blessings pot.`}</p>`;
    body=`<div class="e94h">${_T`Terrain`}</div><div class="e94grid">${e94Btn('pillar','','🏛',_T('Pillar'))}${e94Btn('pot','','🏺',_T('Blessings pot'))}${e94Btn('spike','','▲',_T('Spikes'))}${e94Btn('tunnel','','◙',_T('Tunnel door'))}${e94Btn('chest','','🧰',_T('Arena Chest'))}${e94Btn('erase','','🧽',_T('Eraser'))}</div>
     <div class="e94h">${_T`On the sand`}</div><div class="e94grid">${e94Btn('offer','','✚',_T('Offering'))}${e94Btn('eagle','','🦅',_T('Golden Eagle'))}${e94Btn('key','','🔑',_T('Arena Key'))}${e94Btn('weapon','','🗡',_T('Weapon'))}${e94Btn('armor','','🛡',_T('Armor'))}${e94Btn('coin','','¢',_T('Coin pile'))}</div>
     ${opt?`<div class="e94opt">${opt}</div>`:''}
     <div class="e94h">${_T`Blessings on the pillars · ${L.pillars.filter(p=>p.pot).length}/${L.pillars.length}`}</div>${pots}
     <div class="bslip" style="margin-top:4px"><select class="tin" style="width:auto" id="edRandN" aria-label="${_T`How many pillars get a blessing`}">${Array.from({length:Math.min(12,L.pillars.length)+1},(_,i)=>`<option ${i===Math.min(12,L.pillars.length)?'selected':''}>${i}</option>`).join('')}</select><button type="button" class="btn tksm" data-st="randpots">${_T`🎲 Randomize blessings`}</button></div>
     ${fChk('eaglePot',d.eaglePot,_T('Guarantee a Golden Eagle among the random pots'))}
     ${L.chest?`<div class="e94h">${_T`Chest holds (level 4)`}</div><div class="chkgrid">${['labrys','psykhe','achilles','lyre'].filter(k=>W[k]).map(k=>`<label class="chk"><input type="checkbox" data-chestw="${k}" ${(L.chestW||[]).includes(k)?'checked':''}> ${W[k].n}</label>`).join('')}</div>`:''}
     <div class="e94h">${_T`Layout`}</div><div class="e94ur"><button type="button" class="btn tksm" data-st="classic">${_T`Classic arena`}</button><button type="button" class="btn tksm" data-st="clearboard">${_T`Clear the board`}</button><button type="button" class="btn tksm" data-st="randboard">${_T`🎲 Random arena`}</button></div>`}
  else if(E94.tab==='pieces'){
    const n=Math.max(4,Math.min(8,+d.max||4));
    const starts=Array.from({length:n},(_,i)=>{const sd=e94Seat(i);const placed=!!L.starts[i];return e94Btn('start',i,'',_T`Start ${i+1}`+(placed?' ✓':''),`<span class="ic" aria-hidden="true"><span class="sw" style="background:${sd.col}">${sd.lab}</span></span>`)}).join('');
    const bt=(nm,tt)=>{const NT=NPCT[tt];if(!NT)return '';const tok=typeof npcTokHTML==='function'?npcTokHTML({t:tt,name:nm},28):'';const on=L.npcs.some(x=>x.name===nm);return e94Btn('npc',nm,'',nm+(on?' ✓':''),`<span class="ic" aria-hidden="true">${tok||esc(NT.g||'?')}</span>`)};
    const printed=[...BASE_NPCS.map(b=>bt(b.name,b.t)),...SPAWN_NPCS.filter(x=>x[1]!=='zora').map(x=>bt(x[0],x[1]))].join('');
    const mine=(CUSTOM.npcs||[]).map(cn=>{const tok=typeof cnTokHTML==='function'?cnTokHTML(cn,28):'';return e94Btn('npc','cn:'+cn.id,'',cn.name+' ✦',`<span class="ic" aria-hidden="true">${tok}</span>`)}).join('');
    const zo=SPAWN_NPCS.find(x=>x[1]==='zora');
    body=`<div class="e94h">${_T`Start corners`}${d.mode==='teams'?_T(' · teams A / B (setup can change them)'):''}</div><div class="e94grid">${starts}</div>
     <div class="e94h">${_T`Beasts`}</div><div class="e94grid">${printed}</div>
     ${mine?`<div class="e94h">${_T`Your beasts ✦`}</div><div class="e94grid">${mine}</div>`:''}
     ${zo?`<div class="e94h">${_T`Zora`}</div><div class="e94grid">${bt(zo[0],'zora')}</div>`:''}
     <div class="e94opt">${e94Sel('beh',[['auto',_T('Default for this beast')],['zone',_T('Guards a zone')],['hunt',_T('Hunts the closest gladiator')],['cf',_T('Hunts the most CF')]],o.beh,_T('Next beast placed'))}</div>`}
  else{
    body=`<p class="rc-sub" style="margin:0 0 6px">${_T`Pick a round, then tap the board: the ring you tap sets its playing area.`}</p>`+d.rounds.map((rd,i)=>`<div class="e94zr ${i===E94.round?'sel':''}" style="--zc:${E94_RC[i%3]}"><button type="button" class="e94sm" data-e94="round" data-v="${i}" aria-pressed="${i===E94.round}" aria-label="${_T`Round ${i+1}`}"><span class="e94dot"></span> R${i+1}</button><div class="seg">${[[1,'13×13'],[2,'9×9'],[3,'5×5']].map(([z,l])=>`<button type="button" data-e94="zone" data-v="${i}|${z}" aria-pressed="${+rd.zone===z}" aria-label="${_T`Round ${i+1} area ${l}`}">${l}</button>`).join('')}</div></div>`).join('')}
  return `<aside class="e94pal" aria-label="${_T`Palette`}">${tabs}${body}</aside>`}
function e94RoundsHTML(){const d=ST.draft;const last=d.rounds.length-1;
  const card=(rd,i)=>{const p=_T`rounds.${i}.`;const rw=rd.reward||{};const needN=['npc','rot','cf','survive'].includes(rd.end);
    return `<div class="e94rc ${i===E94.round?'sel':''}" style="--rc:${E94_RC[i%3]}" data-e94="round" data-v="${i}" role="group" aria-label="${_T`Round ${i+1}`}">
     <div class="hd"><b>R${i+1}</b><input class="tin" data-e94f="${p}n" value="${esc(rd.n||'')}" maxlength="24" aria-label="${_T`Round ${i+1} name`}">
      <button type="button" class="e94sm" data-e94="rleft" data-v="${i}" ${i?'':'disabled'} aria-label="${_T`Move round ${i+1} earlier`}">◀</button><button type="button" class="e94sm" data-e94="rright" data-v="${i}" ${i<last?'':'disabled'} aria-label="${_T`Move round ${i+1} later`}">▶</button>
      <button type="button" class="e94sm" data-e94="rmround" data-v="${i}" ${last?'':'disabled'} aria-label="${_T`Remove round ${i+1}`}">✕</button></div>
     <div class="ln">${_T`Area`} <select class="tin" data-e94f="${p}zone" data-num="1" aria-label="${_T`Round ${i+1} area`}">${[[1,'13×13'],[2,'9×9'],[3,'5×5']].map(([z,l])=>`<option value="${z}" ${+rd.zone===z?'selected':''}>${l}</option>`).join('')}</select></div>
     <div class="ln">${['pve','pvp','cf','ca'].map(f=>`<button type="button" class="e94sm" data-e94="flag" data-v="${i}|${f}" aria-pressed="${rd[f]?'true':'false'}" aria-label="${_T`Round ${i+1}`} ${f.toUpperCase()}">${({pve:'PvE',pvp:'PvP',cf:'CF',ca:'CA'})[f]}</button>`).join('')}</div>
     <div class="ln"><select class="tin" data-e94f="${p}end" style="max-width:100%" aria-label="${_T`Round ${i+1} end condition`}">${(END_CONDS.some(x=>x[0]===rd.end)?'':`<option value="" selected>${_T`— no end —`}</option>`)+END_CONDS.map(([k,l])=>`<option value="${esc(k)}" ${rd.end===k?'selected':''}>${esc(l)}</option>`).join('')}</select>${needN?`N <input type="number" class="tin" data-e94f="${p}endN" data-num="1" min="1" max="${rd.end==='cf'?60:30}" value="${+rd.endN||4}" aria-label="${_T`Round ${i+1} N`}">`:''}</div>
     <div class="ln">${i<last?`${_T`Reward`} <input type="number" class="tin" data-e94f="${p}reward.coin" data-num="1" min="0" max="10" value="${+rw.coin||0}" aria-label="${_T`Round ${i+1} reward coin`}">${_T`coin`} <input type="number" class="tin" data-e94f="${p}reward.cf" data-num="1" min="0" max="10" value="${+rw.cf||0}" aria-label="${_T`Round ${i+1} reward CF`}">CF <input type="number" class="tin" data-e94f="${p}reward.cards" data-num="1" min="0" max="4" value="${+rw.cards||0}" aria-label="${_T`Round ${i+1} reward cards`}">${_T`cards`}`:_T`Winner: ${+d.win||0} CF`}</div></div>`};
  return `<div class="e94rounds" role="list" aria-label="${_T`Rounds`}">${d.rounds.map(card).join('')}${d.rounds.length<3?`<button type="button" class="e94add" data-e94="addround" aria-label="${_T`Add a round`}">＋ ${_T`Round`}</button>`:''}</div>`}
function e94ChecksHTML(){const cs=e94Checks(ST.draft);E94.checks=cs;
  return `<ul class="e94chk" aria-label="${_T`Checks`}">${cs.length?cs.map((c,i)=>`<li><button type="button" data-e94="check" data-v="${i}" class="${c.lvl}">${c.lvl==='err'?'✖':'⚠'} ${esc(c.txt)}${c.tile?` <span class="rc-sub">· ${tl(c.tile[0],c.tile[1])}</span>`:''}</button></li>`).join(''):`<li><span class="ok">${_T`✓ Nothing to fix`}</span></li>`}</ul>`}
function e94HTML(){const d=ST.draft;if(E94.ref!==ST.draft&&E94.refId!==(d.id||'new')){E94.undo=[];E94.redo=[];E94.round=0}E94.ref=ST.draft;E94.refId=d.id||'new';
  E94.round=Math.max(0,Math.min(d.rounds.length-1,E94.round));
  let music='';try{if(typeof edMusicOpts==='function'){const opts=edMusicOpts();music=`<label style="display:grid;gap:4px">${_T`🎶 Arena music`}<select class="tin" data-edmusic="1">${opts.map(([k,l])=>`<option value="${esc(k)}" ${(d.music||'')===k?'selected':''} ${k&&typeof musicUnlocked==='function'&&!musicUnlocked(k)?'disabled':''}>${esc(l)}</option>`).join('')}</select></label>`}}catch(e){}
  let deck='';try{deck=d.deck&&typeof ed82HTML==='function'?ed82HTML(d):`<p class="rc-sub">${_T`The arena deck is off (Rules).`}</p>`}catch(e){}
  return `<div class="ed94" id="ed94">
   <div class="e94main"><div class="e94board"><div id="e94Host"></div><div class="e94hov" id="e94hov" aria-live="off"></div></div>${e94PalHTML()}</div>
   <div class="e94tools"><div class="e94box"><div class="e94h" style="margin-top:0">${_T`Rounds`}</div>${e94RoundsHTML()}</div>
    <div class="e94row2"><div class="e94box">${deck}</div><div class="e94box">${music}<div class="e94h">${_T`Undo · test`}</div><div class="e94ur"><button type="button" class="btn tksm" data-e94="undo" ${E94.undo.length?'':'disabled'} aria-label="${_T`Undo`}">${_T`↶ Undo`}</button><button type="button" class="btn tksm" data-e94="redo" ${E94.redo.length?'':'disabled'} aria-label="${_T`Redo`}">${_T`↷ Redo`}</button><button type="button" class="btn tksm" data-e94="test" aria-label="${_T`Test play: watch CPUs play this event`}">${_T`▶ Test play`}</button></div><p class="rc-sub" style="margin:4px 0 0">${_T`CPUs play the event as it stands — nothing is saved or recorded.`}</p></div>
     <div class="e94box"><div class="e94h" style="margin-top:0">${_T`Checks`}</div>${e94ChecksHTML()}</div></div></div></div>`}
/* the Board step = the arena view */
{const base=edBoardHTML;edBoardHTML=function(){if(!E94.on||!ST||!ST.draft||!ST.draft.layout)return base.apply(this,arguments);try{return e94HTML()}catch(e){console.error(e);return base.apply(this,arguments)}}}
try{if(typeof ED_STEPS!=='undefined'&&ED_STEPS[1]&&E94.on)ED_STEPS[1][1]=_T('🏟 Arena')}catch(e){}
/* mount the canvas whenever the view is (re)rendered */
function e94Mount(){const host=document.getElementById('e94Host');if(!host||!e94Live())return;if(!E94.cv){const c=document.createElement('canvas');c.id='e94cv';c.tabIndex=0;c.setAttribute('role','application');
    c.setAttribute('aria-label',_T('Arena board. Arrow keys move the cursor, Enter places the selected piece, Delete removes.'));E94.cv=c;e94WireCanvas(c)}
  if(E94.cv.parentElement!==host){const foc=document.activeElement===E94.cv;host.appendChild(E94.cv);if(foc)try{E94.cv.focus({preventScroll:true})}catch(e){}}e94Hov(E94.hover);e94Soon()}
new MutationObserver(()=>{const h=document.getElementById('e94Host');if(h&&(!E94.cv||E94.cv.parentElement!==h))e94Mount()}).observe(document.body,{childList:true,subtree:true});
addEventListener('resize',()=>{if(e94Live()&&E94.cv&&E94.cv.isConnected)e94Soon()});
/* ---------- the board: drag, stamp, remove, keyboard ---------- */
function e94XY(e){const b=E94.cv.getBoundingClientRect();return [e.clientX-b.left,e.clientY-b.top]}
function e94Ghost(ic,x,y){let g=document.getElementById('e94ghost');if(!ic){if(g)g.remove();return}if(!g){g=document.createElement('div');g.id='e94ghost';g.className='e94ghost';document.body.appendChild(g)}if(g.dataset.ic!==ic){g.innerHTML=ic;g.dataset.ic=ic}g.style.left=x+'px';g.style.top=y+'px'}
function e94ToolIc(t){const m={pillar:'🏛',pot:'🏺',spike:'▲',tunnel:'◙',chest:'🧰',offer:'✚',eagle:'🦅',key:'🔑',weapon:'🗡',armor:'🛡',coin:'¢',erase:'🧽'};if(t.k==='start')return `<b style="font:700 16px var(--mono);color:${e94Seat(+t.v).col}">${e94Seat(+t.v).lab}</b>`;if(t.k==='npc')return '🐾';return m[t.k]||'•'}
function e94MoveIc(m){if(m.what==='npc')return '🐾';if(m.what==='item')return '✚';if(m.what==='start')return `<b style="font:700 16px var(--mono);color:${e94Seat(m.i).col}">${e94Seat(m.i).lab}</b>`;return {chest:'🧰',pillar:'🏛',spike:'▲',tunnel:'◙'}[m.what]||'•'}
function e94Apply(r,c){if(!E94.tool){if(E94.tab==='zones')return e94Change(()=>{const rd=ST.draft.rounds[E94.round];if(!rd)return false;rd.zone=e94ZoneAt(r,c);return true});return false}
  const t=E94.tool;return e94Change(()=>e94Place(t,r,c))}
function e94WireCanvas(c){
  c.addEventListener('contextmenu',e=>{e.preventDefault();if(!E94.geo)return;const t=e94Pick(...e94XY(e));if(t)e94Change(()=>e94Remove(t[0],t[1]))});
  c.addEventListener('pointerdown',e=>{if(e.button===2||!E94.geo)return;E94.kbd=false;const [x,y]=e94XY(e);const t=e94Pick(x,y);if(!t)return;
    const top=e94Top(t[0],t[1]);E94.press={x:e.clientX,y:e.clientY,t,top,pt:e.pointerType,id:e.pointerId,done:false,lp:0};
    try{c.setPointerCapture(e.pointerId)}catch(err){}
    if(e.pointerType!=='mouse')E94.press.lp=setTimeout(()=>{const p=E94.press;if(!p||p.moved)return;p.done=true;if(e94Change(()=>e94Remove(p.t[0],p.t[1]))){try{navigator.vibrate&&navigator.vibrate(30)}catch(err){}}},550)});
  c.addEventListener('pointermove',e=>{if(!E94.geo)return;const [x,y]=e94XY(e);const t=e94Pick(x,y);const p=E94.press;
    if(p&&!p.done&&!p.moved&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>7){p.moved=true;clearTimeout(p.lp);if(p.top&&!(E94.tool&&E94.tool.k!=='erase'&&p.pt!=='mouse')){E94.drag={move:p.top,tile:t};c.classList.add('grab')}}
    if(E94.drag&&E94.drag.move){E94.drag.tile=t;e94Ghost(e94MoveIc(E94.drag.move),e.clientX,e.clientY);e94Soon();return}
    const k=t?t.join(','):'';if(k!==(E94.hover?E94.hover.join(','):'')){E94.hover=t;e94Hov(t);e94Soon()}});
  const end=e=>{const p=E94.press;E94.press=null;if(p)clearTimeout(p.lp);c.classList.remove('grab');e94Ghost(null);
    if(E94.drag&&E94.drag.move){const m=E94.drag.move,t=E94.drag.tile;E94.drag=null;if(t&&!(t[0]===p.t[0]&&t[1]===p.t[1])){if(!e94Change(()=>e94Move(m,t[0],t[1])))e94Toast(_T('That piece cannot go there.'))}e94Soon();return}
    if(!p||p.done||p.moved||e.type==='pointercancel')return;e94Apply(p.t[0],p.t[1])};
  c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
  c.addEventListener('pointerleave',()=>{if(!E94.press&&E94.hover){E94.hover=null;e94Hov(null);e94Soon()}});
  c.addEventListener('focus',()=>{if(!E94.cursor)E94.cursor=[6,6];e94Soon()});c.addEventListener('blur',()=>e94Soon());
  c.addEventListener('keydown',e=>{const D={ArrowUp:[-1,0],ArrowRight:[0,1],ArrowDown:[1,0],ArrowLeft:[0,-1]};const k=e.key;if(e.ctrlKey||e.metaKey||e.altKey)return;
    const cu=E94.cursor||(E94.cursor=[6,6]);
    if(D[k]){e.preventDefault();e.stopPropagation();E94.kbd=true;E94.cursor=[Math.max(0,Math.min(N-1,cu[0]+D[k][0])),Math.max(0,Math.min(N-1,cu[1]+D[k][1]))];E94.hover=E94.cursor;e94Hov(E94.cursor);e94Say(document.getElementById('e94hov').textContent);e94Soon();return}
    if(k==='Enter'||k===' '){e.preventDefault();e.stopPropagation();E94.kbd=true;e94Apply(cu[0],cu[1]);setTimeout(()=>{e94Hov(E94.cursor);e94Say(document.getElementById('e94hov')&&document.getElementById('e94hov').textContent)},60);return}
    if(k==='Delete'||k==='Backspace'){e.preventDefault();e.stopPropagation();E94.kbd=true;e94Change(()=>e94Remove(cu[0],cu[1]));return}
    if(k==='Escape'&&E94.tool){e.preventDefault();e.stopPropagation();E94.tool=null;e94Redraw()}})}
function e94Say(t){try{if(typeof a11ySay93==='function'&&t)a11ySay93(t)}catch(e){}}
/* palette: drag an item onto the sand (mouse/pen) — a click selects it as a stamp */
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('[data-e94tool]');if(!b||!e94Live()||e.button!==0||e.pointerType==='touch')return;
  E94.palPress={x:e.clientX,y:e.clientY,t:{k:b.dataset.e94tool,v:b.dataset.e94tool==='start'?+b.dataset.v:b.dataset.v||undefined}}},true);
document.addEventListener('pointermove',e=>{const p=E94.palPress;if(!p)return;if(!E94.drag&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>7){E94.drag={place:p.t,tile:null}}
  if(E94.drag&&E94.drag.place){const c=E94.cv;let t=null;if(c&&c.isConnected){const b=c.getBoundingClientRect();if(e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom)t=e94Pick(e.clientX-b.left,e.clientY-b.top)}
    E94.drag.tile=t;e94Ghost(e94ToolIc(p.t),e.clientX,e.clientY);e94Soon()}},true);
document.addEventListener('pointerup',e=>{const p=E94.palPress;E94.palPress=null;if(!p)return;if(E94.drag&&E94.drag.place){const t=E94.drag.tile,tool=E94.drag.place;E94.drag=null;e94Ghost(null);E94.noClick=performance.now();
    if(t){const keep=E94.tool;E94.tool=tool;if(!e94Change(()=>e94Place(tool,t[0],t[1])))e94Soon();E94.tool=keep}else e94Soon()}},true);
/* clicks: palette tabs/items, rounds, zones, checks, undo/redo */
document.addEventListener('click',e=>{if(!e94Live())return;const ti=e.target.closest('[data-e94tool]');
  if(ti){e.preventDefault();e.stopPropagation();if(performance.now()-E94.noClick<300)return;const t={k:ti.dataset.e94tool,v:ti.dataset.e94tool==='start'?+ti.dataset.v:ti.dataset.v||undefined};
    E94.tool=E94.tool&&E94.tool.k===t.k&&String(E94.tool.v??'')===String(t.v??'')?null:t;e94Redraw();return}
  const b=e.target.closest('[data-e94]');if(!b)return;const a=b.dataset.e94,v=b.dataset.v;const d=ST.draft;
  if(a==='round'){if(e.target.closest('input,select'))return;e.stopPropagation();if(E94.round!==+v){E94.round=+v;e94Redraw()}return}
  e.preventDefault();e.stopPropagation();
  if(a==='tab'){E94.tab=v;if(v==='zones')E94.tool=null;e94Redraw();return}
  if(a==='zone'){const [i,z]=v.split('|').map(Number);E94.round=i;if(!e94Change(()=>{d.rounds[i].zone=z;return true}))e94Redraw();return}
  if(a==='flag'){const [i,f]=v.split('|');E94.round=+i;e94Change(()=>{const rd=d.rounds[+i];rd[f]=rd[f]?0:1;return true});return}
  if(a==='addround'){e94Change(()=>{if(d.rounds.length>=3)return false;d.rounds.push({n:[_T('Bestiarii'),_T('Royale'),_T('Duel')][d.rounds.length],zone:Math.min(3,d.rounds.length+1),pve:1,pvp:1,cf:1,ca:1,end:'alive1',endN:1,reward:{coin:2,cf:2,cards:0}});E94.round=d.rounds.length-1;return true});return}
  if(a==='rmround'){const i=+v;e94Change(()=>{if(d.rounds.length<2)return false;d.rounds.splice(i,1);E94.round=Math.max(0,Math.min(E94.round,d.rounds.length-1));return true});return}
  if(a==='rleft'||a==='rright'){const i=+v,j=i+(a==='rleft'?-1:1);e94Change(()=>{if(j<0||j>=d.rounds.length)return false;[d.rounds[i],d.rounds[j]]=[d.rounds[j],d.rounds[i]];E94.round=j;return true});return}
  if(a==='check'){const c=(E94.checks||[])[+v];if(!c)return;if(c.round!=null&&c.round!==E94.round){E94.round=c.round;e94Redraw()}if(c.tile){E94.flash=c.tile;E94.flashT=performance.now();E94.hover=c.tile;e94Hov(c.tile);e94Soon()}return}
  if(a==='test'){e94Test();return}
  if(a==='undo'||a==='redo')e94UndoRedo(a==='undo')},true);
function e94UndoRedo(undo){const from=undo?E94.undo:E94.redo,to=undo?E94.redo:E94.undo;if(!from.length)return false;to.push(JSON.stringify(ST.draft));ST.draft=JSON.parse(from.pop());E94.ref=ST.draft;E94.round=Math.max(0,Math.min(ST.draft.rounds.length-1,E94.round));e94Redraw();return true}
document.addEventListener('keydown',e=>{if(!e94Live()||!document.getElementById('ed94'))return;if(!(e.ctrlKey||e.metaKey)||e.altKey)return;const k=e.key.toLowerCase();if(e.target.closest&&e.target.closest('input,textarea,select'))return;
  if(k==='z'&&!e.shiftKey){e.preventDefault();e.stopPropagation();e94UndoRedo(true)}else if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault();e.stopPropagation();e94UndoRedo(false)}},true);
/* fields on the round cards and the tool options */
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!e94Live())return;
  if(t.dataset.e94o){e.stopPropagation();E94.opt[t.dataset.e94o]=t.value;return}
  if(t.dataset.e94f){e.stopPropagation();const path=t.dataset.e94f;let v=t.dataset.num?+t.value:t.value;if(t.dataset.num&&!isFinite(v))return;
    if(/\.endN$/.test(path))v=Math.max(1,v);if(/reward\./.test(path))v=Math.max(0,v);
    const m=path.match(/^rounds\.(\d+)\./);if(m)E94.round=+m[1];e94Change(()=>{setPath(ST.draft,path,v);if(/\.end$/.test(path)){const rd=ST.draft.rounds[+m[1]];if(['npc','rot','cf','survive'].includes(v)&&!rd.endN)rd.endN=4}return true});return}
  /* the old designer's own controls inside the view: keep them undoable (snapshot before their handlers run) */
  if(t.closest&&t.closest('#ed94')&&(t.dataset.potsel!=null||t.dataset.chestw||t.dataset.ed82!=null||t.dataset.edmusic||(t.dataset.f&&!t.dataset.f.startsWith('@'))))e94Snap()},true);
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.e94f&&e94Live())e.stopPropagation()},true);
document.addEventListener('click',e=>{if(!e94Live())return;const b=e.target.closest&&e.target.closest('#ed94 [data-st]');if(b&&['classic','clearboard','randboard','randpots'].includes(b.dataset.st))e94Snap()},true);
/* editing a saved event lands on the arena */
document.addEventListener('click',e=>{if(!E94.on)return;const b=e.target.closest&&e.target.closest('[data-st="edit"],[data-st="allopen"]');if(!b)return;
  setTimeout(()=>{if(typeof ST!=='undefined'&&ST.tab==='events'&&ST.draft&&ST.draft.id&&typeof edGoStep==='function'&&!(typeof ED_ALL!=='undefined'&&ED_ALL)){E94.tool=null;edGoStep(1)}},20)},true);

/* ---------- ▶ TEST PLAY: CPUs play the draft, nothing is kept ---------- */
const E94T={snap:null,pending:false,ending:false};
try{Object.defineProperty(EVENTS,'__e94t',{configurable:true,enumerable:false,get(){return E94T.def}})}catch(e){}
const e94Testing=()=>!!(E94T.live&&typeof S!=='undefined'&&S&&S.e94test);
{const base=newState;newState=function(){const r=base.apply(this,arguments);try{if(E94T.pending&&S){S.e94test=true;E94T.pending=false}}catch(e){}return r}}
for(const nm of ['recordEvent','achievementsAfterEvent','logCustomChars','updateCrowdAfterEvent','bestiaryTally','saveGladiator','markFallen','claimFreedom','hallTrophy','rivalTrophy',
  'sponsorAfterEvent','roadAfterEvent','infirmaryTick','achGrant','betRec','betSettle','matchAutosave','advanceMissio','calAdvance']){
  try{const base=eval(nm);if(typeof base!=='function')continue;const isAsync=base.constructor&&base.constructor.name==='AsyncFunction';
    const w=function(){if(e94Testing())return isAsync?Promise.resolve(null):null;return base.apply(this,arguments)};eval(`${nm}=w`)}catch(e){}}
{const base=careerHoldsClock;careerHoldsClock=async function(){if(e94Testing())return true;return base.apply(this,arguments)}}
{const base=matchSaveOK;matchSaveOK=function(){return e94Testing()?false:base.apply(this,arguments)}}
{const put=Store.put,del=Store.del;Store.put=function(){if(e94Testing())return Promise.resolve(false);return put.apply(this,arguments)};Store.del=function(){if(e94Testing())return Promise.resolve();return del.apply(this,arguments)}}
/* the results window: only the way back */
{const base=modal;modal=function(title,body,buttons,opt){if(e94Testing()&&S.over&&Array.isArray(buttons)&&buttons.some(b=>b&&(b.value==='new'||b.value==='replay'||b.value==='saveall')))
  buttons=[{label:_T('◀ Back to the designer'),sub:_T('nothing from this test is kept'),value:'e94back',primary:1}];return base.call(this,title,body,buttons,opt)}}
{const base=gameOver;gameOver=async function(){const G=S;try{return await base.apply(this,arguments)}finally{if(G&&G.e94test&&G===S)setTimeout(()=>e94TestEnd(),50)}}}
function e94BackBtn(on){let b=document.getElementById('e94back');if(!on){if(b)b.remove();return}
  if(!b){b=document.createElement('button');b.id='e94back';b.type='button';b.className='btn primary';b.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9000;box-shadow:0 4px 14px #000a';
    b.textContent=_T('◀ Back to the designer');b.setAttribute('aria-label',_T('Stop the test play and go back to the Event Designer'));b.onclick=()=>e94TestEnd();document.body.appendChild(b)}}
async function e94Test(){const d=ST.draft;let errs=[];try{errs=eventErrors(d)}catch(e){}
  if(errs.length){e94Toast(_T`Fix this first: ${esc(errs[0])}`);return false}
  const copy=JSON.parse(JSON.stringify(d));if(!copy.id)copy.id='e94test';
  E94T.snap={draft:JSON.stringify(d),undo:[...E94.undo],redo:[...E94.redo],round:E94.round,tab:E94.tab,tool:E94.tool,opt:{...E94.opt},step:ST.edStep,seen:ST.edSeen};
  E94T.def=eventDef(copy);E94T.def.n=E94T.def.short=(copy.name||_T('Custom event'))+_T(' (test)');E94T.def.trophy=null;E94T.def.sponsor=null;E94T.def.nofates=true;
  const def=E94T.def;const pool=(copy.classes&&copy.classes.length?copy.classes:BASE_CLS).filter(k=>CLASSES[k]);const n=Math.max(def.min,Math.min(def.max,Math.max(4,(copy.layout&&copy.layout.starts||[]).filter(Boolean).length)));
  const bag=[...pool];const seats=Array.from({length:n},(_,i)=>{if(!bag.length)bag.push(...pool);const cls=bag.splice(Math.floor(Math.random()*bag.length),1)[0];
    return {cls,cpu:true,diff:'normal',team:def.coop?'A':def.teams?(i%2?'B':'A'):undefined}});
  if(CUR_MODAL)CUR_MODAL.done('e94test');await new Promise(r=>setTimeout(r,250));
  try{if(typeof menuHide==='function')menuHide()}catch(e){}
  E94T.pending=true;E94T.live=true;E94T.ending=false;e94BackBtn(true);
  try{await startEvent({ev:'__e94t',loc:def.loc,seats,opts:{spect:0,eaglePot:copy.eaglePot!==false}})}catch(e){console.error(e);E94T.pending=false;e94TestEnd();return false}
  return true}
async function e94TestEnd(){if(E94T.ending||!E94T.snap)return;E94T.ending=true;e94BackBtn(false);E94T.pending=false;
  try{if(S&&S.e94test){S.overShown=true;}if(S&&S.e94test&&!S.over){S.over=true;for(let i=0;i<60&&S.busy;i++)await new Promise(r=>setTimeout(r,100))}}catch(e){}
  for(let i=0;i<10&&CUR_MODAL;i++){try{CUR_MODAL.done(null)}catch(e){}await new Promise(r=>setTimeout(r,120))}
  try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}
  E94T.live=false; /* the test is over: the Store writes again (its results were never recorded; overShown keeps a late gameOver out) */
  const sn=E94T.snap;openStudio('events');
  for(let i=0;i<80&&!document.getElementById('studio');i++)await new Promise(r=>setTimeout(r,100));
  try{ST.tab='events';ST.draft=JSON.parse(sn.draft);ST.view='edit';ST.sub='board';ST.edStep=1;ST.edSeen=sn.seen||{};
    E94.undo=sn.undo;E94.redo=sn.redo;E94.round=sn.round;E94.tab=sn.tab;E94.tool=sn.tool;E94.opt=sn.opt;E94.ref=ST.draft;E94.refId=ST.draft.id||'new';
    if(typeof studioRedraw==='function')studioRedraw()}catch(e){console.error(e)}
  E94T.snap=null;E94T.ending=false}
