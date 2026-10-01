
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
const isChariot=()=>!!S&&EV().kind==='chariot';
const isNaum=()=>!!S&&EV().kind==='naumachia';
function dijN(start,nbrs){
  const dist=new Map([[start,0]]),prev=new Map();const pq=[[0,start]];
  while(pq.length){let bi=0;for(let i=1;i<pq.length;i++)if(pq[i][0]<pq[bi][0])bi=i;
    const [d,k]=pq.splice(bi,1)[0];if(d>dist.get(k))continue;
    for(const [nk,c] of nbrs(k)){const nd=d+c;if(nd<(dist.has(nk)?dist.get(nk):1e9)){dist.set(nk,nd);prev.set(nk,k);pq.push([nd,nk])}}}
  return {dist,prev};
}
function reach(p){
  if(isChariot())return chReach(p);
  if(isNaum())return nReach(p);
  const {dist,prev}=dijkstra(p.r,p.c,playerBlock(p));
  const tiles=new Map();for(let k=0;k<N*N;k++)if(dist[k]<1e9&&dist[k]>0)tiles.set(k,dist[k]);
  return {tiles,path:k=>{const pth=pathTo(prev,p.r*N+p.c,k);if(!pth)return null;let last=p.r*N+p.c;return pth.map(kk=>{const c=dist[kk]-dist[last];last=kk;return {k:kk,cost:c}})}};
}
function statePath(prev,dist,start,end,decode){
  const out=[];let k=end;while(k!==start){const pk=prev.get(k);if(pk==null)return null;out.unshift({...decode(k),cost:dist.get(k)-dist.get(pk)});k=pk}return out;
}

/* ================= CHARIOT RACING ================= */
const CH_TH0=Math.atan2(-(11-6),9.5-6);
function chProg(r,c){let t=Math.atan2(-(r-6),c-6)-CH_TH0;while(t<0)t+=2*Math.PI;while(t>=2*Math.PI)t-=2*Math.PI;return t/(2*Math.PI)}
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
const mountedAt=(r,c)=>S.players.find(q=>q.alive&&q.ch&&q.ch.mounted&&q.r===r&&q.c===c);
function chTrackOK(r,c,self){return inB(r,c)&&!inPlayerZone(r,c)&&!pillarAt(r,c)&&!tunnelAt(r,c)&&!(mountedAt(r,c)&&mountedAt(r,c)!==self)}
function chMv(p){const ch=p.ch;if(!ch.mounted)return Math.min(3,mvMax(p));let m=3;if(ch.horse)m+=ch.horse.sides[ch.horse.face].mv;if(!ch.wheel)m-=2;return clamp(m,1,7)}
function chReach(p){
  const start=p.r*N+p.c;
  let nb;
  if(p.ch&&p.ch.mounted)nb=k=>{const r=Math.floor(k/N),c=k%N,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;if(!chFwdOK(r,c,dr,dc))continue;const nr=r+dr,nc=c+dc;if(!chTrackOK(nr,nc,p))continue;out.push([nr*N+nc,dr&&dc?2:1])}return out};
  else nb=k=>{const r=Math.floor(k/N),c=k%N,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(!inB(nr,nc)||pillarAt(nr,nc)||chHatched(nr,nc)||mountedAt(nr,nc)||(playerAt(nr,nc)&&playerAt(nr,nc)!==p))continue;out.push([nr*N+nc,dr&&dc?2:1])}return out};
  const {dist,prev}=dijN(start,nb);
  const tiles=new Map();for(const [k,d] of dist)if(d>0)tiles.set(k,d);
  return {tiles,path:k=>statePath(prev,dist,start,k,kk=>({k:kk}))};
}
function drawChOffer(){if(!S.chBag||!S.chBag.length)S.chBag=drawFromTable(CH_OFFERS,99);return S.chBag.pop()}
async function chStep(p,or,oc){
  const ch=p.ch;if(!ch||!ch.mounted)return;
  // trample anyone on foot
  const foot=S.players.find(q=>q!==p&&q.alive&&q.r===p.r&&q.c===p.c&&q.ch&&!q.ch.mounted);
  if(foot){log(`${nm(p)}'s chariot runs down ${nm(foot)} on foot. Bye, Felicius!`,'big');eliminate(foot,{type:'player',p})}
  const a=chProg(or,oc),b=chProg(p.r,p.c);
  if(b>0.4&&b<0.6)ch.check=true;
  if(a>0.75&&b<0.25&&ch.check){ch.laps++;ch.check=false;log(`${nm(p)} completes lap ${ch.laps} of 3!`,'big');if(ch.laps>=3){S.raceWinner=p.id;checkEnd()}}
  if(CH_GATES.some(([r,c])=>r===p.r&&c===p.c)){
    log(`${nm(p)} passes through a pillar gate.`);
    if(ch.horse){ch.horse.face^=1;ch.horse.dmg=0;const f=ch.horse.sides[ch.horse.face];log(`${ch.horse.name||'The horse'}'s token flips: ${f.hp} HP, +${f.mv} movement.`)}
    const o=drawChOffer();
    if(o==='merc1'||o==='merc2'){const v=o==='merc1'?1:2;p.mv+=v;log(`Speed of Mercury: +${v} movement.`)}
    else if(o==='cf1'||o==='cf2'){const v=o==='cf1'?1:2;cfWhy('breaking pots');p.cf+=v;log(`The crowd roars: +${v} CF.`)}
    else if(o==='curse'){
      let pay;if(p.cpu)pay=p.cf>=6;else pay=p.cf>=3&&await modal('Curse Tablet','<p>Pay 3 CF, or roll a d6 and deal that much damage to both your horse and your wheel.</p>',[{label:'Pay 3 CF',value:1,primary:1},{label:'Roll the d6',value:0}]);
      if(pay){p.cf-=3;log(`${nm(p)} pays 3 CF to lift the Curse Tablet.`)}
      else{const d=d6();log(`Curse Tablet: ${nm(p)} rolls ${d}.`,'bad');chHitPart(p,'wheel',d);chHitPart(p,'horse',d)}
    }
    p.mv+=2;log(`${nm(p)} gains a free step beyond the gate.`);
  }
}
function chHitPart(p,part,dmg){
  const ch=p.ch;
  if(part==='wheel'&&ch.wheel){ch.wheel.hp-=dmg;if(ch.wheel.hp<=0){ch.wheel=null;log(`${nm(p)}'s ${ch.name?ch.name+"'s ":''}wheel shatters (−2 movement until replaced).`,'bad')}else log(`${nm(p)}'s ${ch.wheel.name||'wheel'}: ${ch.wheel.hp} HP left.`)}
  if(part==='horse'&&ch.horse){ch.horse.dmg+=dmg;const f=ch.horse.sides[ch.horse.face];if(ch.horse.dmg>=f.hp){log(`${nm(p)}'s horse ${ch.horse.name||''} is lost!`,'bad');ch.horse=null}else log(`${nm(p)}'s ${ch.horse.name||'horse'}: ${f.hp-ch.horse.dmg} HP left on this face.`)}
}
function chCanAttack(p){const ch=p.ch;return ch&&ch.laps>=1&&ch.attackLap!==ch.laps&&RD().pvp&&S.opts.chPvp!==false}
async function chAttack(p,src,t){
  const q=t.ref,w=src.w,pw=srcPow(src);p.attacks=9;p.ch.attackLap=p.ch.laps;p.armUses[src.arm]++;
  if(w.ammo!=null)w.ammoLeft--;
  const parts=[];if(q.ch&&q.ch.wheel)parts.push('wheel');if(q.ch&&q.ch.horse)parts.push('horse');
  const locs=LOCS.filter(l=>q.hp[l]>0);
  let tgt;
  if(p.cpu)tgt=parts.includes('horse')?'horse':parts.includes('wheel')?'wheel':locs.sort((a,b)=>(q.hp[a]+q.ap[a])-(q.hp[b]+q.ap[b]))[0];
  else tgt=await modal(`Attack ${q.name}`,'<p>In a chariot race the attacker chooses the target: the wheel, the horse, or any body location.</p>',[...parts.map(x=>({label:x==='wheel'?`${q.ch.wheel.name||'Wheel'} (${q.ch.wheel.hp} HP)`:`${q.ch.horse.name||'Horse'} (${q.ch.horse.sides[q.ch.horse.face].hp-q.ch.horse.dmg} HP)`,card:x==='wheel'?'h:'+(q.ch.wheel.art||'wheel8'):'h:'+(q.ch.horse.sides[q.ch.horse.face].art||'saxoA'),value:x})),...locs.map(l=>({label:LOCN[l],sub:`AP ${q.ap[l]} · HP ${q.hp[l]}`,value:l}))]);
  const hits=rollHits(2),h=cnt(hits),dmg=h*pw+(h?(hasCestus(p,src.arm)?1:0):0);
  const pre=`${nm(p)} attacks ${nm(q)} with ${w.n} ${diceHtml(hits)} = ${dmg}`;
  if(tgt==='wheel'||tgt==='horse'){log(`${pre} → ${tgt}`);chHitPart(q,tgt,dmg)}
  else await hurt(q,tgt,dmg,{type:'player',p},pre);
  checkEnd();
}
function chariotSetup(){
  S.pillars=CH_PILLARS.map(([r,c],i)=>({id:i,r,c,pots:[]}));
  S.tunnels=[[0,0],[0,12],[12,0],[12,12]].map(([r,c])=>({r,c}));
  S.npcs=[];S.chest=null;
  for(const [kind,r,c] of CH_SPARES)placeFloor(kind,kind,r,c,{part:kind==='wheel'?(w=>({name:w.n,art:w.art,hp:w.hp,max:w.hp}))(pickOne(WHEELS)):(H=>({name:H.n,sides:H.sides,face:0,dmg:0}))(pickOne(HORSES))});
  S.players.forEach((p,i)=>{[p.r,p.c]=CH_STARTS[i];p.start=[p.r,p.c];
    const W0=pickOne(WHEELS),H0=pickOne(HORSES),CN=chariotFor(p.color);p.ch={mounted:true,name:CN.n,art:CN.art,cr:p.r,cc:p.c,wheel:{name:W0.n,art:W0.art,hp:W0.hp,max:W0.hp},horse:{name:H0.n,sides:H0.sides,face:0,dmg:0},laps:0,check:false,attackLap:-1};if(!p.cpu)cardShow('g:'+CN.art,p);log(`${nm(p)} takes the reins of the <b data-card="g:${CN.art}">${CN.n}</b>, drawn by <b data-card="h:${H0.sides[0].art}">${H0.n}</b> (+${H0.sides[0].mv} speed, ${H0.sides[0].hp} HP) on a <span data-card="h:${W0.art}">${W0.n}</span> (${W0.hp} HP).`)});
}
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
function chRaceOrder(){
  const mounted=S.players.filter(p=>p.alive&&p.ch&&p.ch.mounted).sort((a,b)=>(a.ch.laps+chProg(a.r,a.c))-(b.ch.laps+chProg(b.r,b.c)));
  const foot=S.players.filter(p=>p.alive&&p.ch&&!p.ch.mounted).sort((a,b)=>a.cf-b.cf);
  return [...mounted,...foot].map(p=>p.id);
}
async function cpuChariot(p){
  const ch=p.ch;
  // a chariot missing a wheel or horse sends its driver on foot to the nearest spare, then back to the reins
  const need=['wheel','horse'].filter(k=>!ch[k]);
  const spare=need.length?S.floor.filter(f=>need.includes(f.kind)).sort((a,b)=>cheb(p,a)-cheb(p,b))[0]:null;
  if(ch.mounted&&spare&&cheb(p,spare)<=7&&p.diff!=='easy'){ch.mounted=false;p.mv=Math.min(p.mv,3);log(`${nm(p)} jumps down to fetch a spare ${spare.kind}.`);think(p,'I need that '+spare.kind+'!','think')}
  if(!ch.mounted){
    const goal=spare&&need.length?[spare.r,spare.c]:[ch.cr,ch.cc];
    for(let g=0;g<4&&p.mv>0&&p.alive;g++){
      if(p.r===goal[0]&&p.c===goal[1])break;
      const R=reach(p);let best=null;for(const [k,c] of R.tiles){if(c>p.mv)continue;const r=Math.floor(k/N),cc=k%N;const d=Math.max(Math.abs(r-goal[0]),Math.abs(cc-goal[1]));if(!best||d<best.d||(d===best.d&&c<best.c))best={k,d,c}}
      if(!best||best.k===p.r*N+p.c)break;const path=R.path(best.k);if(!path)break;await movePlayer(p,path);render();if(!p.alive||S.over||S.pending)return;
    }
    if(p.r===ch.cr&&p.c===ch.cc&&!['wheel','horse'].some(k=>!ch[k]&&S.floor.some(f=>f.kind===k&&cheb(p,f)<=7))){ch.mounted=true;log(`${nm(p)} remounts.`)}
    if(!ch.mounted)return;
  }
  for(let g=0;g<6&&p.alive&&p.mv>0;g++){
    const R=reach(p);let best=null;
    const cur=ch.laps+chProg(p.r,p.c);
    for(const [k,c] of R.tiles){if(c>p.mv)continue;const r=Math.floor(k/N),cc=k%N;if(ch.mounted&&mountedAt(r,cc))continue;
      let gain=(chProg(r,cc)-chProg(p.r,p.c)+1)%1;if(gain>0.5)gain-=1;
      let s=gain*100-c*0.01+(CH_GATES.some(([a,b])=>a===r&&b===cc)?3:0);
      if(!best||s>best.s)best={s,k}}
    if(!best||best.s<=0)break;
    const path=R.path(best.k);if(!path)break;
    await movePlayer(p,path);render();
    if(!p.alive||S.over||S.pending)return;
  }
  if(chCanAttack(p)){
    let best=null;for(const src of attackSources(p))for(const t of targetsFor(p,src))if(t.kind==='player'){const s=srcPow(src);if(!best||s>best.s)best={s,src,t}}
    if(best){await chAttack(p,best.src,best.t);render()}
  }
}

/* ================= NAUMACHIA ================= */
function naumSetup(){
  S.npcs=[];S.pillars=[];S.tunnels=[];S.spikes=[];
  const teams=[...new Set(S.players.map(p=>p.team))];
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
    S.players.filter(p=>p.team===team).forEach((p,i)=>{const k=tiles[i];p.r=Math.floor(k/N);p.c=k%N;p.start=[p.r,p.c]})}
  log(`The arena floods. ${S.ships.map(s=>`${s.name} (Team ${s.team})`).join(', ')} drop anchor.`,'hd');
}
function shipAt(r,c){return S.ships&&S.ships.find(s=>!s.sunk&&s.tiles.has(r*N+c))}
const doorAt=(r,c)=>S.doors&&S.doors.find(d=>d.r===r&&d.c===c);
function nTerr(r,c){if(shipAt(r,c))return 'ship';if(r===6&&c===6)return 'solid';return 'water'}
const swimming=p=>isNaum()&&nTerr(p.r,p.c)==='water'&&p.onDoor==null&&!doorAt(p.r,p.c);
function nReach(p){
  const start=(p.r*N+p.c)*2+(p.onDoor!=null?1:0);
  const nb=key=>{const k=key>>1,onD=key&1,r=Math.floor(k/N),c=k%N,from=nTerr(r,c),out=[];
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(!inB(nr,nc)||pillarAt(nr,nc))continue;
      const u=unitAt(nr,nc);if(u&&u!==p)continue;
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
async function naumStep(p,step,or,oc){
  // door riding
  const prevDoor=p.onDoor!=null?S.doors[p.onDoor]:null;
  const dHere=doorAt(p.r,p.c);
  if(step.door){
    if(dHere&&(!prevDoor||dHere!==prevDoor)){p.onDoor=dHere.id;log(`${nm(p)} boards a floating door.`)}
    else if(prevDoor&&!dHere){prevDoor.r=p.r;prevDoor.c=p.c}
  } else if(prevDoor){p.onDoor=null}
  const wt=S.waterTok.find(t=>t.r===p.r&&t.c===p.c);
  if(wt){S.waterTok=S.waterTok.filter(t=>t!==wt);await flipWaterToken(p,wt.kind)}
}

// the printed Naumachia water/offering tokens and what they do when flipped
async function flipWaterToken(p,kind){
  const show=k=>{cardShow('n:'+k,p,'🌊 Flipped')};
  if(kind==='croc'){show('croc');const l=rollLoc(p);log(`${nm(p)} flips a water token: <b data-card="n:croc">a crocodile!</b> It clamps down — the ${LOCN[l]} is reduced to 1 HP.`,'big');crowdReact('beastAttack',{});if(p.hp[l]>1)p.hp[l]=1;return}
  if(kind==='water'||kind==='calm'){log(`${nm(p)} flips a <span data-card="n:water">water token</span>: calm water.`);return}
  if(/^wpn/.test(kind)){const lv=+kind.slice(3);show(kind);
    const pool=Object.keys(W).filter(k=>W[k].lv===lv&&!W[k].limb&&!W[k].lyre&&!W[k].noAtk);
    const k=pickOne(pool);const w=mkW(k);
    const free=['R','L'].find(a=>!p['w'+a]&&armAlive(p,a));
    if(free){p['w'+free]=w;log(`${nm(p)} flips a water token: a <b>Level ${lv} Weapon</b> — fishes a <b data-card="w:${k}">${w.n}</b> from the wreckage (${free==='R'?'right':'left'} hand).`,'big')}
    else{let pl=S.piles.find(x=>x.r===p.r&&x.c===p.c&&!x.corpse);if(!pl){pl={id:uid++,owner:-1,r:p.r,c:p.c,weapons:[],armor:[],coin:0,items:[]};S.piles.push(pl)}
      pl.weapons.push(w);log(`${nm(p)} flips a water token: a <b>Level ${lv} Weapon</b> — a <b data-card="w:${k}">${w.n}</b> surfaces at ${tl(p.r,p.c)} (hands full: loot it from this tile).`,'big')}
    return}
  if(/^arm/.test(kind)){const lv=+kind.slice(3);show(kind);
    const pool=Object.keys(ARM).filter(k=>ARM[k].lv===lv&&!ARM[k].flav);
    const k=pickOne(pool);const A=ARM[k];
    let pl=S.piles.find(x=>x.r===p.r&&x.c===p.c&&!x.corpse);if(!pl){pl={id:uid++,owner:-1,r:p.r,c:p.c,weapons:[],armor:[],coin:0,items:[]};S.piles.push(pl)}
    pl.armor.push({key:k,n:A.n,ap:A.ap,from:A.slot==='arm'?'rarm':A.slot==='leg'?'rleg':A.slot});
    log(`${nm(p)} flips a water token: <b>Level ${lv} Armor</b> — a <b data-card="a:${k}">${A.n}</b> washes up at their feet (loot it from this tile).`,'big');return}
  if(/^up/.test(kind)){const n=+kind.slice(2);show(kind);
    log(`${nm(p)} flips a water token: an <b data-card="n:${kind}">Armor Upgrade</b> — +${n} AP to distribute.`,'big');
    await distributeAP(p,n,'the Armor Upgrade token');return}
}
function shipTargets(p){
  if(!isNaum())return [];const sh=shipAt(p.r,p.c);if(!sh||sh.team===p.team)return [];
  if(p.hitTargets.has('s'+sh.id))return [];return [{kind:'ship',ref:sh,key:'s'+sh.id,r:sh.pillar[0],c:sh.pillar[1]}];
}
function sinkShip(sh,p){
  sh.sunk=true;S.pillars=S.pillars.filter(pl=>pl.ship!==sh.id);
  log(`The ${sh.name} (Team ${sh.team}) sinks!${p?` ${nm(p)} is credited.`:''}`,'big');
  for(const q of S.players)if(q.alive&&sh.tiles.has(q.r*N+q.c))log(`${nm(q)} falls into the water.`);
  if(!S.ships.some(s=>s.team===sh.team&&!s.sunk)){log(`Team ${sh.team} has no ships left and is eliminated.`,'big');for(const q of S.players)if(q.alive&&q.team===sh.team){q.alive=false;S.elims++}}
  checkEnd();
}
async function cpuNaum(p){
  // Naumachia CPU: never throw weapons into the water, fight from solid footing, board enemy ships and smash their pillars.
  const G9=S; // v0.42: a simulation's last turn must stop the moment the live board is restored
  for(let g=0;g<18&&p.alive&&!S.over&&S===G9;g++){
    if(S.pending){await settle();if(S.over||S!==G9)return}
    let best=null;
    for(const src of attackSources(p)){if(src.thr)continue;
      for(const t of [...targetsFor(p,src),...shipTargets(p)]){const s=(t.kind==='ship'?14:t.kind==='player'?12-(t.ref.hp.head+t.ref.hp.chest)/6:3)+srcPow(src);if(!best||s>best.s)best={s,src,t}}}
    if(best){await doAttack(p,best.src,best.t);if(S!==G9)return;render();await sleep(300);continue}
    if(canOpenChest(p)){await openChest(p);if(S!==G9)return;render();continue}
    const arms=armsAttached(p);const freeHand=arms.some(a=>!p['w'+a]);const minW=arms.length?Math.min(...arms.map(a=>wScore(p['w'+a]))):99;
    const lo=lootOptions(p).filter(o=>o.t==='fw'?o.val>minW:(!p.looted&&(o.t!=='w'||o.val>minW)));
    if(lo.length){await doLoot(p,lo.sort((a,b)=>b.val-a.val)[0]);if(S!==G9)return;render();continue}
    if(p.mv<=0)break;
    const R=reach(p);
    const armed=arms.some(a=>p['w'+a]&&!p['w'+a].noAtk&&!p['w'+a].lyre);
    const range=Math.max(1,...arms.map(a=>p['w'+a]&&!p['w'+a].noAtk?p['w'+a].r:1));
    const wet=k=>{const r=Math.floor(k/N),c=k%N;return nTerr(r,c)==='water'&&!doorAt(r,c)};
    const prio=new Map();const add=(k,v)=>{if(!prio.has(k)||v<prio.get(k))prio.set(k,v)};
    for(const sh of (S.ships||[]))if(!sh.sunk&&sh.team!==p.team)for(const k of sh.tiles)add(k,0);
    for(const q of activePlayers().filter(q=>q.team!==p.team&&!q.underground))
      for(let r=q.r-range;r<=q.r+range;r++)for(let c=q.c-range;c<=q.c+range;c++){if(!inB(r,c))continue;const k=r*N+c;const eff=range-(wet(k)?1:0);if(eff<1||Math.max(Math.abs(r-q.r),Math.abs(c-q.c))>eff)continue;if(!los({r,c},q))continue;add(k,armed?1:3)}
    if(freeHand)for(const f of S.floor)if(f.kind==='weapon')add(f.r*N+f.c,0);
    let gk=-1,gs=1e9;
    for(const [k,v] of prio){const d=R.tiles.get(k);if(d==null)continue;const sc=d+v*3+(wet(k)?2:0);if(sc<gs){gs=sc;gk=k}}
    if(gk<0){let bs=1e9;const ens=S.ships.filter(s=>!s.sunk&&s.team!==p.team);for(const [k,c] of R.tiles){if(c>p.mv)continue;const r=Math.floor(k/N),cc=k%N;const sc=Math.min(99,...ens.map(sh=>Math.max(Math.abs(r-sh.pillar[0]),Math.abs(cc-sh.pillar[1]))))*3+c;if(sc<bs){bs=sc;gk=k}}}
    if(gk<0)break;
    const path=R.path(gk);if(!path||!path.length||path[0].cost>p.mv)break;
    const before=p.r*N+p.c;
    await movePlayer(p,path);if(S!==G9)return;render();
    if(p.r*N+p.c===before)break;
  }
}
