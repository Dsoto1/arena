
/* =====================================================================
   09-SPECIAL · CHARIOT RACING & NAUMACHIA
   =====================================================================
   The two events that bend the board:
   - Chariots: mount state p.ch {chariot card, horse token (two faces), wheel token},
     laps and gates, targeted attacks on wheel/horse, spares on the floor.
     Horse/wheel stats match the printed tokens (see HORSES/WHEELS in 02-data).
   - Naumachia: ships, floating doors, swimming, and the printed water-token bag
     (16 water, 8 crocodiles, sunken gear, armor upgrades) flipped in flipWaterToken().
   ===================================================================== */
/* ================= GENERIC REACH (movement for every board) ================= */
/* isChariot — true while the live event is Chariot Racing. */
const isChariot=()=>!!S&&EV().kind==='chariot';
/* isNaum — true while the live event is the Naumachia. */
const isNaum=()=>!!S&&EV().kind==='naumachia';
/* dijN — Dijkstra over arbitrary state keys: nbrs(key) gives [nextKey, cost] pairs; returns {dist, prev} Maps from start. */
function dijN(start,nbrs){
  const dist=new Map([[start,0]]),prev=new Map();const pq=[[0,start]];
  while(pq.length){let bi=0;for(let i=1;i<pq.length;i++)if(pq[i][0]<pq[bi][0])bi=i;
    const [d,k]=pq.splice(bi,1)[0];if(d>dist.get(k))continue;
    for(const [nk,c] of nbrs(k)){const nd=d+c;if(nd<(dist.has(nk)?dist.get(nk):1e9)){dist.set(nk,nd);prev.set(nk,k);pq.push([nd,nk])}}}
  return {dist,prev};
}
/* reach — every tile a player can reach this turn with its move cost, plus path(k) — dispatches to chReach / nReach on the special boards. */
function reach(player){
  if(isChariot())return chReach(player);
  if(isNaum())return nReach(player);
  const {dist,prev}=dijkstra(player.r,player.c,playerBlock(player));
  const tiles=new Map();for(let k=0;k<N*N;k++)if(dist[k]<1e9&&dist[k]>0)tiles.set(k,dist[k]);
  return {tiles,path:k=>{const pth=pathTo(prev,player.r*N+player.c,k);if(!pth)return null;let last=player.r*N+player.c;return pth.map(kk=>{const c=dist[kk]-dist[last];last=kk;return {k:kk,cost:c}})}};
}
/* statePath — walks dijN's prev map back from end to start; returns the steps [{...decode(key), cost}] or null when unreachable. */
function statePath(prev,dist,start,end,decode){
  const out=[];let k=end;while(k!==start){const pk=prev.get(k);if(pk==null)return null;out.unshift({...decode(k),cost:dist.get(k)-dist.get(pk)});k=pk}return out;
}

/* ================= CHARIOT RACING ================= */
/* CH_TH0 — angle of the chariot start line from the board center; chProg measures laps from it. */
const CH_TH0=Math.atan2(-(11-6),9.5-6);
/* chProg — how far round the track a tile is, 0..1, counter-clockwise from the start line. */
function chProg(r,c){let t=Math.atan2(-(r-6),c-6)-CH_TH0;while(t<0)t+=2*Math.PI;while(t>=2*Math.PI)t-=2*Math.PI;return t/(2*Math.PI)}
/* chFwdOK — whether a step (dr,dc) from r,c keeps a mounted chariot going forward on its stretch or corner of the track. */
function chFwdOK(r,c,dr,dc){
  if(r>=10&&c>=10)return dr<=0&&dc>=0;
  if(r<=2&&c>=10)return dr<=0&&dc<=0;
  if(r<=2&&c<=2)return dr>=0&&dc<=0;
  if(r>=10&&c<=2)return dr>=0&&dc>=0;
  if(c>=10)return dr===-1;
  if(r<=2)return dc===-1;
  if(c<=2)return dr===1;
  if(r>=10)return dc===1;
  return false;
}
/* mountedAt — the racer whose mounted chariot stands on r,c, if any. */
const mountedAt=(r,c)=>S.players.find(other=>other.alive&&other.ch&&other.ch.mounted&&other.r===r&&other.c===c);
/* chTrackOK — whether a mounted chariot may enter r,c: on the board, off the center, no pillar, tunnel or other chariot. */
function chTrackOK(r,c,self){return inB(r,c)&&!inPlayerZone(r,c)&&!pillarAt(r,c)&&!tunnelAt(r,c)&&!(mountedAt(r,c)&&mountedAt(r,c)!==self)}
/* chMv — movement for a racer: 3 + the horse face's bonus, −2 without a wheel, 1–7; on foot at most 3. TWEAK: the base 3, the −2 wheel penalty, the 1–7 clamp. */
function chMv(player){const ch=player.ch;if(!ch.mounted)return Math.min(3,mvMax(player));let m=3;if(ch.horse)m+=ch.horse.sides[ch.horse.face].mv;if(!ch.wheel)m-=2;return clamp(m,1,7)}
/* chReach — reachable tiles in a chariot race — forward-only along the track when mounted, free steps on foot (diagonals cost 2). Replaced by 76-chariot59. */
function chReach(player){
  const start=player.r*N+player.c;
  let nb;
  if(player.ch&&player.ch.mounted)nb=k=>{const r=Math.floor(k/N),c=k%N,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;if(!chFwdOK(r,c,dr,dc))continue;const nr=r+dr,nc=c+dc;if(!chTrackOK(nr,nc,player))continue;out.push([nr*N+nc,dr&&dc?2:1])}return out};
  else nb=k=>{const r=Math.floor(k/N),c=k%N,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(!inB(nr,nc)||pillarAt(nr,nc)||chHatched(nr,nc)||mountedAt(nr,nc)||(playerAt(nr,nc)&&playerAt(nr,nc)!==player))continue;out.push([nr*N+nc,dr&&dc?2:1])}return out};
  const {dist,prev}=dijN(start,nb);
  const tiles=new Map();for(const [k,d] of dist)if(d>0)tiles.set(k,d);
  return {tiles,path:k=>statePath(prev,dist,start,k,kk=>({k:kk}))};
}
/* drawChOffer — draws the next chariot offering from its own bag (refilled from CH_OFFERS when empty). */
function drawChOffer(){if(!S.chBag||!S.chBag.length)S.chBag=drawFromTable(CH_OFFERS,99);return S.chBag.pop()}
/* chStep — after a mounted racer moves: tramples racers on foot, counts laps (3 wins), and at a pillar gate flips the horse, draws an offering and grants a free step. Wrapped by 76-chariot59. */
async function chStep(player,fromR,fromC){
  const ch=player.ch;if(!ch||!ch.mounted)return;
  // trample anyone on foot
  const foot=S.players.find(other=>other!==player&&other.alive&&other.r===player.r&&other.c===player.c&&other.ch&&!other.ch.mounted);
  if(foot){log(`${nm(player)}'s chariot runs down ${nm(foot)} on foot. Bye, Felicius!`,'big');eliminate(foot,{type:'player',p:player})}
  const a=chProg(fromR,fromC),b=chProg(player.r,player.c);
  if(b>0.4&&b<0.6)ch.check=true;
  if(a>0.75&&b<0.25&&ch.check){ch.laps++;ch.check=false;log(`${nm(player)} completes lap ${ch.laps} of 3!`,'big');if(ch.laps>=3){S.raceWinner=player.id;checkEnd()}}
  if(CH_GATES.some(([r,c])=>r===player.r&&c===player.c)){
    log(`${nm(player)} passes through a pillar gate.`);
    if(ch.horse){ch.horse.face^=1;ch.horse.dmg=0;const f=ch.horse.sides[ch.horse.face];log(`${ch.horse.name||'The horse'}'s token flips: ${f.hp} HP, +${f.mv} movement.`)}
    const o=drawChOffer();
    if(o==='merc1'||o==='merc2'){const v=o==='merc1'?1:2;player.mv+=v;log(`Speed of Mercury: +${v} movement.`)}
    else if(o==='cf1'||o==='cf2'){const v=o==='cf1'?1:2;cfWhy('breaking pots');player.cf+=v;log(`The crowd roars: +${v} CF.`)}
    else if(o==='curse'){
      let pay;if(player.cpu)pay=player.cf>=6;else pay=player.cf>=3&&await modal('Curse Tablet','<p>Pay 3 CF, or roll a d6 and deal that much damage to both your horse and your wheel.</p>',[{label:'Pay 3 CF',value:1,primary:1},{label:'Roll the d6',value:0}]);
      if(pay){player.cf-=3;log(`${nm(player)} pays 3 CF to lift the Curse Tablet.`)}
      else{const d=d6();log(`Curse Tablet: ${nm(player)} rolls ${d}.`,'bad');chHitPart(player,'wheel',d);chHitPart(player,'horse',d)}
    }
    player.mv+=2;log(`${nm(player)} gains a free step beyond the gate.`);
  }
}
/* chHitPart — deals damage to a chariot's wheel (shatters at 0 HP) or horse (lost when its face's HP is used up). Wrapped by 76-chariot59. */
function chHitPart(player,part,damage){
  const ch=player.ch;
  if(part==='wheel'&&ch.wheel){ch.wheel.hp-=damage;if(ch.wheel.hp<=0){ch.wheel=null;log(`${nm(player)}'s ${ch.name?ch.name+"'s ":''}wheel shatters (−2 movement until replaced).`,'bad')}else log(`${nm(player)}'s ${ch.wheel.name||'wheel'}: ${ch.wheel.hp} HP left.`)}
  if(part==='horse'&&ch.horse){ch.horse.dmg+=damage;const f=ch.horse.sides[ch.horse.face];if(ch.horse.dmg>=f.hp){log(`${nm(player)}'s horse ${ch.horse.name||''} is lost!`,'bad');ch.horse=null}else log(`${nm(player)}'s ${ch.horse.name||'horse'}: ${f.hp-ch.horse.dmg} HP left on this face.`)}
}
/* chCanAttack — a racer may attack once per lap, from the first finished lap, in a PvP round with chariot PvP allowed. */
function chCanAttack(player){const ch=player.ch;return ch&&ch.laps>=1&&ch.attackLap!==ch.laps&&RD().pvp&&S.opts.chPvp!==false}
/* chAttack — a chariot attack: the attacker picks the wheel, the horse or a body location (CPU: horse, wheel, then the weakest location), 2 hit dice. */
async function chAttack(player,source,target){
  const q=target.ref,w=source.w,pw=srcPow(source);player.attacks=9;player.ch.attackLap=player.ch.laps;player.armUses[source.arm]++;
  if(w.ammo!=null)w.ammoLeft--;
  const parts=[];if(q.ch&&q.ch.wheel)parts.push('wheel');if(q.ch&&q.ch.horse)parts.push('horse');
  const locs=LOCS.filter(l=>q.hp[l]>0);
  let tgt;
  if(player.cpu)tgt=parts.includes('horse')?'horse':parts.includes('wheel')?'wheel':locs.sort((a,b)=>(q.hp[a]+q.ap[a])-(q.hp[b]+q.ap[b]))[0];
  else tgt=await modal(`Attack ${q.name}`,'<p>In a chariot race the attacker chooses the target: the wheel, the horse, or any body location.</p>',[...parts.map(x=>({label:x==='wheel'?`${q.ch.wheel.name||'Wheel'} (${q.ch.wheel.hp} HP)`:`${q.ch.horse.name||'Horse'} (${q.ch.horse.sides[q.ch.horse.face].hp-q.ch.horse.dmg} HP)`,card:x==='wheel'?'h:'+(q.ch.wheel.art||'wheel8'):'h:'+(q.ch.horse.sides[q.ch.horse.face].art||'saxoA'),value:x})),...locs.map(l=>({label:LOCN[l],sub:`AP ${q.ap[l]} · HP ${q.hp[l]}`,value:l}))]);
  const hits=rollHits(2),h=cnt(hits),dmg=h*pw+(h?(hasCestus(player,source.arm)?1:0):0);
  const pre=`${nm(player)} attacks ${nm(q)} with ${w.n} ${diceHtml(hits)} = ${dmg}`;
  if(tgt==='wheel'||tgt==='horse'){log(`${pre} → ${tgt}`);chHitPart(q,tgt,dmg)}
  else await hurt(q,tgt,dmg,{type:'player',p:player},pre);
  checkEnd();
}
/* chariotSetup — builds the chariot board: gate pillars, corner tunnels, spare wheels/horses on the floor, and each racer's chariot, wheel and horse. */
function chariotSetup(){
  S.pillars=CH_PILLARS.map(([r,c],i)=>({id:i,r,c,pots:[]}));
  S.tunnels=[[0,0],[0,12],[12,0],[12,12]].map(([r,c])=>({r,c}));
  S.npcs=[];S.chest=null;
  for(const [kind,r,c] of CH_SPARES)placeFloor(kind,kind,r,c,{part:kind==='wheel'?(w=>({name:w.n,art:w.art,hp:w.hp,max:w.hp}))(pickOne(WHEELS)):(H=>({name:H.n,sides:H.sides,face:0,dmg:0}))(pickOne(HORSES))});
  S.players.forEach((player,i)=>{[player.r,player.c]=CH_STARTS[i];player.start=[player.r,player.c];
    const W0=pickOne(WHEELS),H0=pickOne(HORSES),CN=chariotFor(player.color);player.ch={mounted:true,name:CN.n,art:CN.art,cr:player.r,cc:player.c,wheel:{name:W0.n,art:W0.art,hp:W0.hp,max:W0.hp},horse:{name:H0.n,sides:H0.sides,face:0,dmg:0},laps:0,check:false,attackLap:-1};if(!player.cpu)cardShow('g:'+CN.art,player);log(`${nm(player)} takes the reins of the <b data-card="g:${CN.art}">${CN.n}</b>, drawn by <b data-card="h:${H0.sides[0].art}">${H0.n}</b> (+${H0.sides[0].mv} speed, ${H0.sides[0].hp} HP) on a <span data-card="h:${W0.art}">${W0.n}</span> (${W0.hp} HP).`)});
}
/* chariotDraft — the chariot draft: head armor, chest armor and a level 1–2 weapon picked in turn; each racer gets 2 keys and 3 CF. Replaced by 76-chariot59. */
async function chariotDraft(){
  log('Chariot draft: every racer draws a chariot, a wheel and a horse, then drafts head armor, chest armor and a level 1-2 weapon.','hd');
  const heads=['galea','galea','cassis','crista','murmillo','cassis'],chests=['balteus','pectorale','pectorale','lorica','lorica','balteus'],weps=[...MARKET_W[1],...MARKET_W[2]];
  for(const [title,pool,kind] of [['Head armor',heads,'a'],['Chest armor',chests,'a'],['Weapon',weps,'w']]){
    const avail=[...pool];
    for(const p of S.players){
      let k;
      if(p.cpu)k=avail.sort((a,b)=>itemValue(kind,b)-itemValue(kind,a))[0];
      else{const i=await modal(`Draft · ${p.name} · ${title}`,'<p>Pick one.</p>',avail.map((x,i)=>({label:kind==='w'?W[x].n:ARM[x].n,sub:kind==='w'?wStats(mkW(x)):armorDesc(x),value:i})));k=avail[i??0]}
      avail.splice(avail.indexOf(k),1);
      if(kind==='w')p.wR=mkW(k);else equipPiece(p,k,ARM[k].slot);
      log(`${nm(p)} drafts ${kind==='w'?W[k].n:ARM[k].n}.`);
    }
  }
  for(const p of S.players){p.wL=mkW('chariotCard');if(p.ch)p.wL.gart='g:'+p.ch.art;p.keys=2;p.cf+=3} // the printed chariot card sits in the secondary slot
  log('Each racer receives an Arena Key token (2 keys) and 3 CF. The chariot card fills the secondary weapon slot.');
}
/* chRaceOrder — turn order for the next round: mounted racers from last to first place, then those on foot by CF. */
function chRaceOrder(){
  const mounted=S.players.filter(player=>player.alive&&player.ch&&player.ch.mounted).sort((a,b)=>(a.ch.laps+chProg(a.r,a.c))-(b.ch.laps+chProg(b.r,b.c)));
  const foot=S.players.filter(player=>player.alive&&player.ch&&!player.ch.mounted).sort((a,b)=>a.cf-b.cf);
  return [...mounted,...foot].map(player=>player.id);
}
/* cpuChariot — CPU racer: fetches a missing wheel or horse on foot, else drives as far round the track as it can (gates preferred), then attacks once if allowed. */
async function cpuChariot(player){
  const ch=player.ch;
  // a chariot missing a wheel or horse sends its driver on foot to the nearest spare, then back to the reins
  const need=['wheel','horse'].filter(k=>!ch[k]);
  const spare=need.length?S.floor.filter(f=>need.includes(f.kind)).sort((a,b)=>cheb(player,a)-cheb(player,b))[0]:null;
  if(ch.mounted&&spare&&cheb(player,spare)<=7&&player.diff!=='easy'){ch.mounted=false;player.mv=Math.min(player.mv,3);log(`${nm(player)} jumps down to fetch a spare ${spare.kind}.`);think(player,'I need that '+spare.kind+'!','think')}
  if(!ch.mounted){
    const goal=spare&&need.length?[spare.r,spare.c]:[ch.cr,ch.cc];
    for(let g=0;g<4&&player.mv>0&&player.alive;g++){
      if(player.r===goal[0]&&player.c===goal[1])break;
      const R=reach(player);let best=null;for(const [k,c] of R.tiles){if(c>player.mv)continue;const r=Math.floor(k/N),cc=k%N;const d=Math.max(Math.abs(r-goal[0]),Math.abs(cc-goal[1]));if(!best||d<best.d||(d===best.d&&c<best.c))best={k,d,c}}
      if(!best||best.k===player.r*N+player.c)break;const path=R.path(best.k);if(!path)break;await movePlayer(player,path);render();if(!player.alive||S.over||S.pending)return;
    }
    if(player.r===ch.cr&&player.c===ch.cc&&!['wheel','horse'].some(k=>!ch[k]&&S.floor.some(f=>f.kind===k&&cheb(player,f)<=7))){ch.mounted=true;log(`${nm(player)} remounts.`)}
    if(!ch.mounted)return;
  }
  for(let g=0;g<6&&player.alive&&player.mv>0;g++){
    const R=reach(player);let best=null;
    const cur=ch.laps+chProg(player.r,player.c);
    for(const [k,c] of R.tiles){if(c>player.mv)continue;const r=Math.floor(k/N),cc=k%N;if(ch.mounted&&mountedAt(r,cc))continue;
      let gain=(chProg(r,cc)-chProg(player.r,player.c)+1)%1;if(gain>0.5)gain-=1;
      let s=gain*100-c*0.01+(CH_GATES.some(([a,b])=>a===r&&b===cc)?3:0);
      if(!best||s>best.s)best={s,k}}
    if(!best||best.s<=0)break;
    const path=R.path(best.k);if(!path)break;
    await movePlayer(player,path);render();
    if(!player.alive||S.over||S.pending)return;
  }
  if(chCanAttack(player)){
    let best=null;for(const src of attackSources(player))for(const t of targetsFor(player,src))if(t.kind==='player'){const s=srcPow(src);if(!best||s>best.s)best={s,src,t}}
    if(best){await chAttack(player,best.src,best.t);render()}
  }
}

/* ================= NAUMACHIA ================= */
/* naumSetup — builds the Naumachia: ships per team with their pillars, floating doors, 16 face-down water tokens from the printed bag, the chest, and fighters placed on their own ships. Wrapped by 71-v58 and 75-naum59. */
function naumSetup(){
  S.npcs=[];S.pillars=[];S.tunnels=[];S.spikes=[];
  const teams=[...new Set(S.players.map(player=>player.team))];
  S.ships=SHIPS_DEF.map((d,i)=>({id:i,name:d.name,tiles:new Set(d.tiles.map(([r,c])=>r*N+c)),pillar:d.pillar,hp:12,team:teams[i%teams.length],sunk:false}));
  for(const sh of (S.ships||[]))S.pillars.push({id:100+sh.id,r:sh.pillar[0],c:sh.pillar[1],pots:[],ship:sh.id});
  S.doors=DOORS.map(([r,c],i)=>({id:i,r,c}));
  const water=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(nTerr(r,c)==='water'&&(r===6||c===6||Math.abs(r-6)+Math.abs(c-6)<=4))water.push([r,c]);
  shuffle(water);
  // the printed water-token set: 16 water tiles, 8 crocodiles, sunken weapons and armor of each level, and two armor upgrades — 16 are drawn face-down
  const bag=shuffle([...Array(16).fill('water'),...Array(8).fill('croc'),'wpn1','wpn2','wpn3','arm1','arm2','arm3','up2','up3']);
  S.waterTok=water.slice(0,16).map(([r,c],i)=>({r,c,kind:bag[i]}));
  S.chest={r:6,c:6,weapons:shuffle(['arcu','flavgl','jade']),held:null};
  for(const team of teams){const ships=S.ships.filter(s=>s.team===team);const tiles=shuffle(ships.flatMap(s=>[...s.tiles]).filter(k=>!S.pillars.some(pl=>pl.r*N+pl.c===k)));
    S.players.filter(player=>player.team===team).forEach((player,i)=>{const k=tiles[i];player.r=Math.floor(k/N);player.c=k%N;player.start=[player.r,player.c]})}
  log(`The arena floods. ${S.ships.map(s=>`${s.name} (Team ${s.team})`).join(', ')} drop anchor.`,'hd');
}
/* shipAt — the afloat ship covering r,c, if any. */
function shipAt(r,c){return S.ships&&S.ships.find(s=>!s.sunk&&s.tiles.has(r*N+c))}
/* doorAt — the floating door on r,c, if any. */
const doorAt=(r,c)=>S.doors&&S.doors.find(d=>d.r===r&&d.c===c);
/* nTerr — Naumachia terrain at r,c: ship, solid (the center) or water. */
function nTerr(r,c){if(shipAt(r,c))return 'ship';if(r===6&&c===6)return 'solid';return 'water'}
/* swimming — true when a player is in open water (not on a ship or a floating door). */
const swimming=player=>isNaum()&&nTerr(player.r,player.c)==='water'&&player.onDoor==null&&!doorAt(player.r,player.c);
/* nReach — Naumachia reach over (tile, on-a-door) states: wading costs extra, boarding a door costs 2. Replaced by 75-naum59. */
function nReach(player){
  const start=(player.r*N+player.c)*2+(player.onDoor!=null?1:0);
  const nb=key=>{const k=key>>1,onD=key&1,r=Math.floor(k/N),c=k%N,from=nTerr(r,c),out=[];
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(!inB(nr,nc)||pillarAt(nr,nc))continue;
      const u=unitAt(nr,nc);if(u&&u!==player)continue;
      const step=dr&&dc?2:1,to=nTerr(nr,nc),dAt=doorAt(nr,nc),nk=nr*N+nc;
      if(onD){ if(to==='water'&&!dAt)out.push([nk*2+1,step]); else if(dAt)out.push([nk*2+1,step]); else out.push([nk*2,step]); continue}
      if(dAt){out.push([nk*2+1,2]);continue}
      if(from==='water'&&!doorAt(r,c)){ if(to==='water')out.push([nk*2,step]); else out.push([nk*2,2]); continue}
      if(to==='water')out.push([nk*2,step+1]);else out.push([nk*2,step]);
    }return out};
  const {dist,prev}=dijN(start,nb);
  const tiles=new Map(),best=new Map();
  for(const [key,d] of dist){if(d<=0)continue;const k=key>>1;if(!tiles.has(k)||d<tiles.get(k)){tiles.set(k,d);best.set(k,key)}}
  return {tiles,path:k=>best.has(k)?statePath(prev,dist,start,best.get(k),key=>({k:key>>1,door:key&1})):null};
}
/* naumStep — after a Naumachia step: boards / rides / leaves a floating door, and flips a water token underfoot. Wrapped by 75-naum59. */
async function naumStep(player,step,fromR,fromC){
  // door riding
  const prevDoor=player.onDoor!=null?S.doors[player.onDoor]:null;
  const dHere=doorAt(player.r,player.c);
  if(step.door){
    if(dHere&&(!prevDoor||dHere!==prevDoor)){player.onDoor=dHere.id;log(`${nm(player)} boards a floating door.`)}
    else if(prevDoor&&!dHere){prevDoor.r=player.r;prevDoor.c=player.c}
  } else if(prevDoor){player.onDoor=null}
  const wt=S.waterTok.find(t=>t.r===player.r&&t.c===player.c);
  if(wt){S.waterTok=S.waterTok.filter(t=>t!==wt);await flipWaterToken(player,wt.kind)}
}

// the printed Naumachia water/offering tokens and what they do when flipped
async function flipWaterToken(player,kind){
  const show=k=>{cardShow('n:'+k,player,'🌊 Flipped')};
  if(kind==='croc'){show('croc');const l=rollLoc(player);log(`${nm(player)} flips a water token: <b data-card="n:croc">a crocodile!</b> It clamps down — the ${LOCN[l]} is reduced to 1 HP.`,'big');crowdReact('beastAttack',{});if(player.hp[l]>1)player.hp[l]=1;return}
  if(kind==='water'||kind==='calm'){log(`${nm(player)} flips a <span data-card="n:water">water token</span>: calm water.`);return}
  if(/^wpn/.test(kind)){const lv=+kind.slice(3);show(kind);
    const pool=Object.keys(W).filter(k=>W[k].lv===lv&&!W[k].limb&&!W[k].lyre&&!W[k].noAtk);
    const k=pickOne(pool);const w=mkW(k);
    const free=['R','L'].find(a=>!player['w'+a]&&armAlive(player,a));
    if(free){player['w'+free]=w;log(`${nm(player)} flips a water token: a <b>Level ${lv} Weapon</b> — fishes a <b data-card="w:${k}">${w.n}</b> from the wreckage (${free==='R'?'right':'left'} hand).`,'big')}
    else{let pl=S.piles.find(x=>x.r===player.r&&x.c===player.c&&!x.corpse);if(!pl){pl={id:uid++,owner:-1,r:player.r,c:player.c,weapons:[],armor:[],coin:0,items:[]};S.piles.push(pl)}
      pl.weapons.push(w);log(`${nm(player)} flips a water token: a <b>Level ${lv} Weapon</b> — a <b data-card="w:${k}">${w.n}</b> surfaces at ${tl(player.r,player.c)} (hands full: loot it from this tile).`,'big')}
    return}
  if(/^arm/.test(kind)){const lv=+kind.slice(3);show(kind);
    const pool=Object.keys(ARM).filter(k=>ARM[k].lv===lv&&!ARM[k].flav);
    const k=pickOne(pool);const A=ARM[k];
    let pl=S.piles.find(x=>x.r===player.r&&x.c===player.c&&!x.corpse);if(!pl){pl={id:uid++,owner:-1,r:player.r,c:player.c,weapons:[],armor:[],coin:0,items:[]};S.piles.push(pl)}
    pl.armor.push({key:k,n:A.n,ap:A.ap,from:A.slot==='arm'?'rarm':A.slot==='leg'?'rleg':A.slot});
    log(`${nm(player)} flips a water token: <b>Level ${lv} Armor</b> — a <b data-card="a:${k}">${A.n}</b> washes up at their feet (loot it from this tile).`,'big');return}
  if(/^up/.test(kind)){const n=+kind.slice(2);show(kind);
    log(`${nm(player)} flips a water token: an <b data-card="n:${kind}">Armor Upgrade</b> — +${n} AP to distribute.`,'big');
    await distributeAP(player,n,'the Armor Upgrade token');return}
}
/* shipTargets — the enemy ship a player stands on, as an attack target (once per turn). */
function shipTargets(player){
  if(!isNaum())return [];const sh=shipAt(player.r,player.c);if(!sh||sh.team===player.team)return [];
  if(player.hitTargets.has('s'+sh.id))return [];return [{kind:'ship',ref:sh,key:'s'+sh.id,r:sh.pillar[0],c:sh.pillar[1]}];
}
/* sinkShip — sinks a ship: its pillar goes, its riders fall in, and a team with no ships left is eliminated. */
function sinkShip(ship,player){
  ship.sunk=true;S.pillars=S.pillars.filter(pl=>pl.ship!==ship.id);
  log(`The ${ship.name} (Team ${ship.team}) sinks!${player?` ${nm(player)} is credited.`:''}`,'big');
  for(const q of S.players)if(q.alive&&ship.tiles.has(q.r*N+q.c))log(`${nm(q)} falls into the water.`);
  if(!S.ships.some(s=>s.team===ship.team&&!s.sunk)){log(`Team ${ship.team} has no ships left and is eliminated.`,'big');for(const q of S.players)if(q.alive&&q.team===ship.team){q.alive=false;S.elims++}}
  checkEnd();
}
/* cpuNaum — Naumachia CPU: attacks (ships first), opens the chest, loots, then moves toward enemy ships, firing spots or loose weapons, avoiding open water. TWEAK: the target scores (ship 14, player 12) and the move priorities. */
async function cpuNaum(player){
  // Naumachia CPU: never throw weapons into the water, fight from solid footing, board enemy ships and smash their pillars.
  const G9=S; // v0.42: a simulation's last turn must stop the moment the live board is restored
  for(let g=0;g<18&&player.alive&&!S.over&&S===G9;g++){
    if(S.pending){await settle();if(S.over||S!==G9)return}
    let best=null;
    for(const src of attackSources(player)){if(src.thr)continue;
      for(const t of [...targetsFor(player,src),...shipTargets(player)]){const s=(t.kind==='ship'?14:t.kind==='player'?12-(t.ref.hp.head+t.ref.hp.chest)/6:3)+srcPow(src);if(!best||s>best.s)best={s,src,t}}}
    if(best){await doAttack(player,best.src,best.t);if(S!==G9)return;render();await sleep(300);continue}
    if(canOpenChest(player)){await openChest(player);if(S!==G9)return;render();continue}
    const arms=armsAttached(player);const freeHand=arms.some(a=>!player['w'+a]);const minW=arms.length?Math.min(...arms.map(a=>wScore(player['w'+a]))):99;
    const lo=lootOptions(player).filter(o=>o.t==='fw'?o.val>minW:(!player.looted&&(o.t!=='w'||o.val>minW)));
    if(lo.length){await doLoot(player,lo.sort((a,b)=>b.val-a.val)[0]);if(S!==G9)return;render();continue}
    if(player.mv<=0)break;
    const R=reach(player);
    const armed=arms.some(a=>player['w'+a]&&!player['w'+a].noAtk&&!player['w'+a].lyre);
    const range=Math.max(1,...arms.map(a=>player['w'+a]&&!player['w'+a].noAtk?player['w'+a].r:1));
    const wet=k=>{const r=Math.floor(k/N),c=k%N;return nTerr(r,c)==='water'&&!doorAt(r,c)};
    const prio=new Map();const add=(k,v)=>{if(!prio.has(k)||v<prio.get(k))prio.set(k,v)};
    for(const sh of (S.ships||[]))if(!sh.sunk&&sh.team!==player.team)for(const k of sh.tiles)add(k,0);
    for(const q of activePlayers().filter(other=>other.team!==player.team&&!other.underground))
      for(let r=q.r-range;r<=q.r+range;r++)for(let c=q.c-range;c<=q.c+range;c++){if(!inB(r,c))continue;const k=r*N+c;const eff=range-(wet(k)?1:0);if(eff<1||Math.max(Math.abs(r-q.r),Math.abs(c-q.c))>eff)continue;if(!los({r,c},q))continue;add(k,armed?1:3)}
    if(freeHand)for(const f of S.floor)if(f.kind==='weapon')add(f.r*N+f.c,0);
    let gk=-1,gs=1e9;
    for(const [k,v] of prio){const d=R.tiles.get(k);if(d==null)continue;const sc=d+v*3+(wet(k)?2:0);if(sc<gs){gs=sc;gk=k}}
    if(gk<0){let bs=1e9;const ens=S.ships.filter(s=>!s.sunk&&s.team!==player.team);for(const [k,c] of R.tiles){if(c>player.mv)continue;const r=Math.floor(k/N),cc=k%N;const sc=Math.min(99,...ens.map(sh=>Math.max(Math.abs(r-sh.pillar[0]),Math.abs(cc-sh.pillar[1]))))*3+c;if(sc<bs){bs=sc;gk=k}}}
    if(gk<0)break;
    const path=R.path(gk);if(!path||!path.length||path[0].cost>player.mv)break;
    const before=player.r*N+player.c;
    await movePlayer(player,path);if(S!==G9)return;render();
    if(player.r*N+player.c===before)break;
  }
}
