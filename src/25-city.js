/* =====================================================================
   25-CITY · THE CITY SQUARE (v0.30)
   =====================================================================
   Every arena city has a living square beside its amphitheater — an isometric, explorable pavilion in
   the same tile language as the arena. No fighting here: you stroll (click a tile; movement is free),
   talk, shop and watch the empire breathe. The crowd is REAL — the same named regulars who fill the
   stands (plus passers-by), gladiators from this week's card, patrolling soldiers, the local sponsor
   on their balcony, beasts being led into the arena, and an auction block where the unwanted go cheap.
   Before Match Week the square empties into the arena when the horns sound, and you follow through a
   JRPG fade. Entered from the Imperium (any city) or from Match Week (this week's host).
   ===================================================================== */
const CITY={open:false};
const CITY_N=14; // v0.32: one tile roomier
// per-city dressing: ground and awning hues, a landmark line, and what the square is called
const CITY_DRESS={
  Syracusae:{g1:'#b9a06e',g2:'#ad9464',aw:'#2f4a6b',land:'the harbor cranes swing behind the arena wall',sq:'the Harbor Square'},
  Verona:{g1:'#b3a273',g2:'#a79768',aw:'#7a2230',land:'cypress hills rise beyond the gate',sq:'the Piazza of the Two Rivers'},
  Arles:{g1:'#b7a476',g2:'#ab996c',aw:'#3f5a3a',land:'legion veterans dice in the shade',sq:'the Veterans’ Forum'},
  Capua:{g1:'#bda671',g2:'#b09a66',aw:'#4b2a5a',land:'the oldest ludus in the empire looms next door',sq:'the Gladiators’ Market'},
  Thysdrus:{g1:'#c4ab72',g2:'#b89f67',aw:'#a86a2a',land:'heat shimmers over African sand',sq:'the Caravan Square'},
  Roma:{g1:'#b5a26e',g2:'#a99663',aw:'#7a2230',land:'the Flavian amphitheater blots out the sun',sq:'the Forum before the Arena'},
  Nemausus:{g1:'#b2a171',g2:'#a69566',aw:'#2e6a3a',land:'chariot teams parade their colors',sq:'the Circus Yard'},
  Pompeii:{g1:'#b8a267',g2:'#ac975d',aw:'#b04a6a',land:'the mountain smokes gently to the north',sq:'the Palaestra Square'},
  'Leptis Magna':{g1:'#c6ad74',g2:'#baa269',aw:'#8a2a2a',land:'marble colonnades gleam against the sea',sq:'the Severan Colonnade'},
  Uthina:{g1:'#c1a870',g2:'#b59d65',aw:'#1f6a6a',land:'poets argue by the fountain',sq:'the Poets’ Court'},
  Pola:{g1:'#b0a173',g2:'#a49668',aw:'#3a4a5a',land:'gulls fight over the fish market',sq:'the Quay Market'},
  Puteoli:{g1:'#b6a46f',g2:'#aa9864',aw:'#1e2e4e',land:'grain ships crowd the harbor',sq:'the Harbor-master’s Square'}};
// the buildings of every square: [key, r0,r1,c0,c1, height, label, icon]
const CITY_BLDG=[
  ['arena',0,1,3,9,2.6,'THE ARENA','🏛'],
  ['arms',3,4,0,1,1.6,'Arms market','⚔️'],
  ['armor',7,8,0,1,1.6,'Armorer','🛡'],
  ['bath',12,13,1,3,1.5,'Bathhouse','🛁'],
  ['tavern',12,13,9,11,1.5,'Tavern','🍷'],
  ['lupanar',7,8,12,13,1.6,'Lupanar','🌙'],
  ['auction',3,4,12,13,1.3,'Auction block','⚖'],
];
const CITY_GATE=[2,6]; // the arena gate tile — walk here (or wait for the horns) to enter
function cityBlocked(r,c){if(r<0||c<0||r>=CITY_N||c>=CITY_N)return true;if(r===7&&c===7)return true; // the fountain
  return CITY_BLDG.some(([k,r0,r1,c0,c1])=>r>=r0&&r<=r1&&c>=c0&&c<=c1)}
function cityBldgAt(r,c){return CITY_BLDG.find(([k,r0,r1,c0,c1])=>r>=r0-0&&r<=r1&&c>=c0&&c<=c1)}
const cityIso=(r,c)=>({x:CITY.OX+(c-r)*CITY.TW/2,y:CITY.OY+(c+r)*CITY.TW/4});

/* ---------------- opening and closing ---------------- */
/* v0.46 THE SQUARE'S SIDEBAR: the city's people and beasts at a glance — kin in the stands and the fighters they come
   to see; the stands (on Match Week: who holds a ticket for the games); the spectator roster; and the city's
   menagerie, its own arena beasts first. */
function citySideDraw(){const el=document.getElementById('citySideBody');if(!el||!CITY.L)return;const L=CITY.L;const regs=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(r=>!r.recruited&&!r.banned);
  const face=r=>typeof specFaceSVG==='function'?specFaceSVG(r.look||{}):'';
  const w=CITY.w;const night=w&&w.night&&w.night.loc===CITY.li?w.night:null;const card=night?night.bouts.flatMap(b=>b.ents).map(id=>typeof gById==='function'?gById(id):null).filter(Boolean):[];
  let h='';
  if(CITY.side==='kin'){const kin=regs.filter(r=>r.kin&&r.kin.name);const fight=new Set(card.map(g=>g.name.toLowerCase()));
    h=`<div class="sect" style="margin-top:0">👪 Family ties <span class="rc-sub">kin in the stands, and the gladiators they come to see</span></div>${kin.length?kin.sort((a,b)=>(fight.has(String(b.kin.name).toLowerCase())?1:0)-(fight.has(String(a.kin.name).toLowerCase())?1:0)).slice(0,40).map(r=>`<div class="csrow ${fight.has(String(r.kin.name).toLowerCase())?'hot':''}">${face(r)}<div><b>${esc(r.name)}</b><small>${esc(r.kin.rel)} of <b>${esc(r.kin.name)}</b>${r.city?` · of ${esc(r.city)}`:''}${fight.has(String(r.kin.name).toLowerCase())?' · <b style="color:var(--gold2)">fights here this week</b>':''}</small></div></div>`).join(''):'<p class="rc-sub">No kin in the crowd yet — family trees grow as fighters make names.</p>'}`}
  else if(CITY.side==='stands'){const here=regs.filter(r=>r.city===L.n);const fans=night?regs.filter(r=>r.favG&&card.some(g=>g.name===r.favG)&&r.city!==L.n):[];
    const tix=[...here,...fans];
    h=`<div class="sect" style="margin-top:0">${night?`🎟 Ticket holders · Match Week`:`🏟 The stands of ${esc(L.n)}`} <span class="rc-sub">${night?'the named regulars coming to this week\u2019s games':'regulars who call this city home'}</span></div>${tix.length?tix.slice(0,48).map(r=>`<div class="csrow">${face(r)}<div><b>${esc(r.name)}</b><small>${esc((SPECT_TASTES[r.taste]||['?'])[0])} fan · ${esc((SPECT_TEMPERS[r.temper]||['?'])[0].toLowerCase())}${r.favG?` · backs <b>${esc(r.favG)}</b>`:''}${r.city!==L.n?` · travels from ${esc(r.city||'?')}`:''}</small></div></div>`).join(''):'<p class="rc-sub">No named regulars here yet.</p>'}
      ${night&&typeof boutTickets==='function'?'':''}`}
  else if(CITY.side==='roster'){h=`<div class="sect" style="margin-top:0">👥 The spectator roster <span class="rc-sub">${regs.length}K spectators across the empire</span></div>${regs.slice().sort((a,b)=>(b.visits||0)-(a.visits||0)).slice(0,80).map(r=>`<div class="csrow">${face(r)}<div><b>${esc(r.name)}</b><small>${esc(r.city||'')} · ${r.visits||0} visits${r.trouble?' · <span style="color:var(--blood2)">troublemaker</span>':''}</small></div></div>`).join('')}`}
  else if(CITY.side==='beasts'){h=typeof cityBeastsHTML==='function'?cityBeastsHTML(CITY.li,{h:9999,only:true}):''}
  el.innerHTML=h}
function openCitySquare(li,opts={}){
  if(HEADLESS||CITY.open)return;const L=LOCATIONS[li];if(!L)return;
  const w=typeof W_==='function'?W_():null;
  if(w&&w.night&&w.night.loc===li&&typeof travelOK==='function'&&!travelOK(w)){if(typeof mToast==='function')mToast(`🛣 Travel to <b>${esc(L.n)}</b> first — pay the road on Match Week.`);return} // v0.42
  // v0.33: horns sounded on this city's card → every door back into the square is barred until the bout is fought
  if(w&&w.night&&w.night.loc===li&&w.night.hornsLock!=null){const n9=w.night;const b9=n9.bouts[n9.hornsLock];
    if(b9&&!b9.done){if(typeof mToast==='function')mToast('🎺 The horns have sounded — the arena gates are shut until the '+(typeof TIERS!=='undefined'?esc(TIERS[b9.tier].n):'bout')+' is fought.');return}}
  Object.assign(CITY,{open:true,li,L,w,mgr:!!(w&&typeof me==='function'&&me()),opts,sel:null,npcs:[],player:null,path:[],stepT:0,mode:'stroll',
    remain:opts.prematch?150000:0,speed:1,lastT:0,filedAt:0,beastT:performance.now()+9000+Math.random()*9000,chatT:performance.now()+2500,hover:null,imgs:{},t0:performance.now()});
  const ov=document.createElement('div');ov.id='cityOv';ov.innerHTML=`
    <div class="citybar"><b>🏛 ${esc((CITY_DRESS[L.n]||{}).sq||'The Square')} · ${esc(L.n)}</b>${typeof CITY_FLAG!=='undefined'&&CITY_FLAG[L.n]&&typeof flagURIk==='function'?`<img class="flagchip" src="${flagURIk(CITY_FLAG[L.n])}" style="height:16px" alt="" title="The banner of ${esc(L.n)}">`:''}<span class="rc-sub" id="cityLand">${esc((CITY_DRESS[L.n]||{}).land||'')}</span>
      <span id="cityClock" class="cityclock" hidden></span><span style="flex:1"></span>
      <span id="cityNext" class="rc-sub"></span>
      <div class="seg" title="How fast the square lives — strolling, walking, the countdown, all of it">${[1,2,4].map(v=>`<button type="button" data-cspd="${v}" class="${v===1?'on':''}">${v}×</button>`).join('')}</div>
      <span class="cityclock" id="cityCoin" title="Your treasury — every shop, gift and auction bid draws on it"></span>
      ${opts.prematch?'<button class="btn tksm" type="button" id="cityBell" title="Sound the horns early — the crowd files in and the games begin">🎺 Sound the horns</button>':''}
      <button class="btn tksm" type="button" id="cityLeave">${opts.prematch?'Leave the square ✕':'LEAVE_LBL'}</button></div>
    <div class="citymain2"><div class="citymain"><canvas id="cityCv"></canvas><div id="cityPanel" class="citypanel" hidden></div></div>
      <aside class="cityside" id="citySide"><div class="seg citysidetabs">${[['kin','👪 Kin'],['stands','🏟 The stands'],['roster','👥 Roster'],['beasts','🐾 Menagerie']].map(([k,l],i)=>`<button type="button" data-cside="${k}" class="${i===1?'on':''}">${l}</button>`).join('')}<button type="button" data-cside="hide" title="Fold the sidebar away">⇥</button></div><div id="citySideBody" class="citysidebody"></div></aside></div>
    <div class="cityhint rc-sub">Click a tile to walk (movement is free here) · click anyone for their card · click a building to visit it${opts.prematch?' · the games begin when the horns sound':''}</div>`;
  document.body.appendChild(ov);
  const fd=document.createElement('div');fd.id='cityFade';document.body.appendChild(fd);
  requestAnimationFrame(()=>{fd.classList.add('dark');setTimeout(()=>fd.classList.remove('dark'),60)});
  CITY.cv=ov.querySelector('#cityCv');CITY.c2=CITY.cv.getContext('2d');
  {const lv=ov.querySelector('#cityLeave');if(!opts.prematch){lv.textContent=CITY_EXIT_LBL[cityExitKind()];lv.onclick=()=>cityExit()}else lv.onclick=()=>closeCity()}
  const bell=ov.querySelector('#cityBell');if(bell)bell.onclick=()=>cityHorns();
  CITY.side='stands';citySideDraw();if(typeof loadBestiary==='function')loadBestiary().then(()=>{if(CITY.open&&CITY.side==='beasts')citySideDraw()}).catch(()=>{});ov.querySelectorAll('[data-cside]').forEach(b=>b.onclick=()=>{if(b.dataset.cside==='hide'){ov.classList.toggle('sidefold');setTimeout(citySize,50);return}CITY.side=b.dataset.cside;ov.querySelectorAll('[data-cside]').forEach(x=>x.classList.toggle('on',x===b));citySideDraw()});
  ov.querySelectorAll('[data-cspd]').forEach(b=>b.onclick=()=>{CITY.speed=+b.dataset.cspd;ov.querySelectorAll('[data-cspd]').forEach(x=>x.classList.toggle('on',x===b))});
  {const nx=ov.querySelector('#cityNext');if(nx)nx.innerHTML=cityNextEventLine()}
  CITY.cv.addEventListener('click',cityClick);CITY.cv.addEventListener('mousemove',cityMove);
  CITY.esc=e=>{if(e.key==='Escape'){e.stopPropagation();closeCity()}};document.addEventListener('keydown',CITY.esc,true);
  cityPopulate();citySize();CITY.raf=requestAnimationFrame(cityLoop);
  window.addEventListener('resize',citySize);
  log2city(`You step into ${(CITY_DRESS[L.n]||{}).sq||'the square'} at ${L.n}.`);
}
function closeCity(cb){if(!CITY.open)return;if(!cb&&CITY.mgr&&CITY.opts&&CITY.opts.prematch&&typeof MGR!=='undefined'){MGR.tab='night';cb=()=>{if(typeof MGR_REDRAW==='function'&&document.getElementById('mgrBody'))MGR_REDRAW();const mb=document.getElementById('mBody');if(mb)mb.scrollTop=0} } // leaving before the games → straight to Match Week
  const fd=document.getElementById('cityFade');
  const fin=()=>{CITY.open=false;cancelAnimationFrame(CITY.raf);document.removeEventListener('keydown',CITY.esc,true);window.removeEventListener('resize',citySize);
    const ov=document.getElementById('cityOv');if(ov)ov.remove();if(cb)cb();setTimeout(()=>{const f2=document.getElementById('cityFade');if(f2){f2.classList.remove('dark');setTimeout(()=>f2.remove(),650)}},80)};
  if(fd){fd.classList.add('dark');setTimeout(fin,620)}else fin()}
function cityHUD(){const el=document.getElementById('cityCoin');if(!el)return;const t=CITY.mgr?`${typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🟡'} ${me().coin} coin`:'👁 visiting';if(el.dataset.v!==t){el.dataset.v=t;el.innerHTML=t}}
function citySize(){if(!CITY.open)return;const cv=CITY.cv;const r=cv.parentElement.getBoundingClientRect();cv.width=r.width;cv.height=r.height;
  CITY.TW=Math.max(34,Math.min(r.width/(CITY_N+1.2),(r.height*2)/(CITY_N+5.6)));CITY.OX=r.width/2;CITY.OY=CITY.TW*2.2}
function log2city(t){CITY.toast={t,until:performance.now()+3600}}

/* ---------------- who is in the square ---------------- */
// what's next on THIS city's sand — this week's card if we are hosting, else the schedule's next visit
function cityNextEventLine(){const w=CITY.w;const li=CITY.li;
  if(w&&w.night&&w.night.loc===li){const b=w.night.bouts.find(x=>!x.done);const f=w.night.fx||{};
    return b?`📜 <b>Tonight:</b> ${esc((EVENTS[w.night.bouts[2].ev]||{}).n||'the games')} — ${w.night.bouts.filter(x=>!x.done).length} bout${w.night.bouts.filter(x=>!x.done).length===1?'':'s'} to fight`:`📜 Tonight's games are done — the results are posted`}
  // v0.41: read the real season schedule forward from today (the old walk lost the week outside Manager mode)
  const c0=w?{season:w.season,week:((w.week-1)%12)+1}:(typeof calNow==='function'?calNow():{season:1,week:1});
  for(let k=1;k<=24;k++){const i=(c0.week-1)+k;const season=c0.season+Math.floor(i/12),wk=(i%12)+1;
    const f=typeof fixtureFor==='function'?fixtureFor(season,wk):null;if(f&&f.loc===li)return `📜 <b>Next games here:</b> ${esc((EVENTS[f.ev]||{}).n||f.ev)} · ${esc(empireDate(season,wk).short)} (${k} week${k===1?'':'s'} off)`}
  return `📜 No games scheduled here for two seasons — the sand waits`}
function cityPopulate(){
  const L=CITY.L,w=CITY.w;const npcs=[];let id=0;
  const spot=()=>{for(let k=0;k<80;k++){const r=2+rnd(CITY_N-3),c=rnd(CITY_N);if(!cityBlocked(r,c)&&!npcs.some(n=>n.r===r&&n.c===c))return [r,c]}return [10,7]};
  // the regulars who live here — the SAME people who fill the stands
  const regs=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(r=>!r.recruited&&r.city===L.n).slice(0,10);
  for(const reg of regs){const [r,c]=spot();npcs.push({id:'n'+id++,kind:'spec',reg,look:reg.look||{},name:reg.name,r,c,wt:1600+Math.random()*3000})}
  // passers-by: the square looks alive beyond our own audience
  const taken=new Set(regs.map(r=>r.name));
  for(let i=0;i<Math.max(6,14-regs.length);i++){const f=typeof specIdentity==='function'?specIdentity(taken):null;const [r,c]=spot();
    npcs.push({id:'n'+id++,kind:'filler',look:f?f.look:{skin:'#e6cfa8',hair:'#4a2c17',robe:pickOne(ROBES)},name:f?f.name:'a stranger',trade:f?f.name.split(' ').slice(1).join(' '):'',r,c,wt:1200+Math.random()*2600,static:Math.random()<.3})}
  // gladiators: this week's card first (they ARE the next fights — Match Week runs in order), then locals
  let glads=[];
  if(w&&w.night){const order=[];for(const b of w.night.bouts)if(!b.done)for(const gid of b.ents){const g=gById(gid);if(g&&g.alive)order.push({g,bout:b})}
    glads=order.slice(0,4);
    for(const g2 of w.glads.filter(g=>g.alive&&g.city===L.n&&!order.some(o=>o.g===g)).slice(0,2))glads.push({g:g2,bout:null})}
  else{for(let i=0;i<3;i++){const g=typeof genGlad==='function'?genGlad({}):null;if(g)glads.push({g,bout:null,ephemeral:true})}}
  for(const {g,bout} of glads){const [r,c]=spot();npcs.push({id:'n'+id++,kind:'glad',g,bout,name:g.name,r,c,wt:2600+Math.random()*3000})}
  // soldiers on their rounds
  for(const [r,c] of [[5,2],[10,11]])npcs.push({id:'n'+id++,kind:'soldier',name:`A ${L.n} watchman`,look:{skin:pickOne(SKINS),hair:'#2a1c12'},r,c,wt:900,patrol:true});
  // the auctioneer, always at his block
  npcs.push({id:'n'+id++,kind:'auct',name:'Vulso the auctioneer',look:{skin:'#d8a47a',hair:'#9a8a70',beard:true,robe:'#a86a2a'},r:4,c:11,static:true});
  // the local sponsor, sometimes taking the air on the arena balcony
  const spId=typeof sponsorForLoc==='function'?sponsorForLoc(CITY.li):null;
  CITY.sponsorHere=spId&&spId!=='flavius'&&Math.random()<.55?sponsorById(spId):(CITY.li===6&&Math.random()<.4?SPONSOR_FLAVIUS:null);
  if(CITY.sponsorHere){const [r,c]=spot();npcs.push({id:'n'+id++,kind:'soldier',empire:true,name:'An empire legionary — the editor\u2019s escort',look:{skin:pickOne(SKINS),hair:'#1a1208'},r,c,wt:800,patrol:true})}
  // the city guard wears the CITY's colors; only the editor's escort wears legion red
  {const fk=typeof CITY_FLAG!=='undefined'&&CITY_FLAG[L.n];const F9=fk&&FLAGS[fk];CITY.guardC=F9?F9.v[0][0]:'#3a4a5a';CITY.guardC2=F9?F9.v[0][1]:'#c9ccd3'}
  CITY.npcs=npcs;
  // you — the lanista in the square (or a traveler, outside a career)
  CITY.player={r:12,c:7,fr:12,fc:7,look:{skin:'#e0ac7e',hair:'#2a1c12',robe:CITY.mgr?(me().color||'#7a2230'):'#7a2230'},name:CITY.mgr?me().name:'You'};
  // what the square is talking about: the empire map's own events, this week's card, the local news
  const key=w?`m:${w.id}:${w.season}:${w.week}`:'now'+new Date().toISOString().slice(0,10);
  const chat=[];
  try{const imp=typeof worldImpact==='function'?worldImpact(CITY.li,key):{list:[]};
    for(const e of imp.list||[])chat.push(e.war?`They say ${e.war.rome} marches on ${e.war.foe}…`:`Have you heard? ${e.n}${e.k<1?`, over in ${e.city}`:''}.`)}catch(e){}
  try{for(const n2 of (typeof cityNews==='function'?cityNews(CITY.li,key):[]))chat.push(String(n2.t||n2).replace(/<[^>]*>/g,''))}catch(e){}
  if(w&&w.night){const b=w.night.bouts.find(x=>!x.done);if(b){const names=b.ents.map(x=>(gById(x)||{}).name).filter(Boolean);if(names.length)chat.push(`${names[0]} fights next — I have coin on it.`,`${names[names.length-1]}? The odds are long, the heart is willing.`)}
    if(w.night.omen&&w.night.omen.k!=='clear')chat.push(`${w.night.omen.n}. The augurs are busy today.`)}
  chat.push('Fine wool, two coins the arm-length!','The bread line was shorter under the old aedile.','Mind the mule.','A denarius says the small one wins.',(CITY_DRESS[L.n]||{}).land||'Fair skies, at least.');
  CITY.chatter=chat.filter(Boolean);
}

/* ---------------- the loop: wander, chatter, beasts, the horns ---------------- */
function cityLoop(ts){if(!CITY.open)return;const now=performance.now();const dt=Math.min(200,now-(CITY.lastT||now));CITY.lastT=now;const spd=CITY.speed||1;const vnow=now*spd; // a faster square just lives faster
  // NPCs drift a step at their own pace
  for(const n of CITY.npcs){if(n.static||n.leaving&&!n.path)continue;
    if(n.path&&n.path.length){if(now-(n.t0||0)>150/spd){const [r,c]=n.path.shift();n.r=r;n.c=c;n.t0=now;if(!n.path.length&&n.leaving)n.gone=true}}
    else if(!n.leaving&&now-(n.t0||0)>n.wt/spd){n.t0=now;const dirs=shuffle([[0,1],[0,-1],[1,0],[-1,0]]);for(const [dr,dc] of dirs){const r=n.r+dr,c=n.c+dc;
      if(!cityBlocked(r,c)&&!(r===CITY_GATE[0]&&c===CITY_GATE[1])&&!CITY.npcs.some(x=>x!==n&&x.r===r&&x.c===c)){n.r=r;n.c=c;break}}}}
  CITY.npcs=CITY.npcs.filter(n=>!n.gone);
  // your own steps
  const P=CITY.player;if(CITY.path.length&&now-CITY.stepT>130/spd){const [r,c]=CITY.path.shift();P.r=r;P.c=c;CITY.stepT=now;
    if(r===CITY_GATE[0]&&c===CITY_GATE[1]){if(cityGamesHere())cityEnterArena();else{CITY.path=[];P.r=r+1;P.c=c;citySealedPanel()}}}
  // a beast is led across the square into the pens
  if(now>CITY.beastT&&CITY.mode!=='filing'){CITY.beastT=now+(22000+Math.random()*20000)/spd;
    const kinds=Object.values(BEAST_KINDS);const K=kinds[rnd(kinds.length)];
    const row=5+rnd(5);CITY.npcs.push({id:'b'+now,kind:'beast',name:`${K.n} for the pens`,tok:K.tok,r:row,c:CITY_N-1,static:false,leaving:true,wt:0,t0:now,
      path:cityBFS([row,CITY_N-1],[CITY_GATE[0]+1,CITY_GATE[1]]).concat([[CITY_GATE[0],CITY_GATE[1]]])});
    log2city(`A ${K.n.toLowerCase()} is led across the square toward the beast gate.`)}
  // idle chatter
  if(now>CITY.chatT&&CITY.mode!=='filing'){CITY.chatT=now+(3800+Math.random()*4200)/spd;const cand=CITY.npcs.filter(n=>['spec','filler','glad','soldier'].includes(n.kind)&&!n.say);
    if(typeof SETTINGS!=='undefined'&&SETTINGS.cityChatter===false){}else if(cand.length&&CITY.chatter.length){const n=pickOne(cand);n.say=pickOne(CITY.chatter);n.sayUntil=now+4200}}
  for(const n of CITY.npcs)if(n.say&&now>n.sayUntil)n.say=null;
  // the horns: time runs out and the square empties into the arena
  if(CITY.remain>0||CITY.mode==='filing'){if(CITY.mode!=='filing')CITY.remain-=dt*spd;const left=CITY.remain;const ck=document.getElementById('cityClock');
    if(ck){ck.hidden=false;ck.textContent=CITY.mode==='filing'?'🎺 the games begin — to the arena!':`🏛 the games begin in ${Math.max(0,Math.ceil(left/1000))}s`;ck.classList.toggle('soon',left<30000&&CITY.mode!=='filing')}
    if(left<=0&&CITY.mode!=='filing')cityHorns()}
  cityHUD();cityDraw();CITY.raf=requestAnimationFrame(cityLoop)}
function cityHorns(){if(CITY.mode==='filing')return;CITY.mode='filing';CITY.remain=0;
  // v0.33 THE GATES SHUT: once the horns sound, there is no strolling back to the square until the bout is fought
  try{const w9=CITY.w;if(CITY.mgr&&w9&&w9.night&&w9.night.loc===CITY.li){const bi9=w9.night.bouts.findIndex(b2=>!b2.done);if(bi9>=0)w9.night.hornsLock=bi9}}catch(e){}
  for(const n of CITY.npcs)if(['spec','filler','glad'].includes(n.kind)){n.leaving=true;n.static=false;
    n.path=cityBFS([n.r,n.c],[CITY_GATE[0]+1,CITY_GATE[1]+(rnd(3)-1)]);n.path.push([CITY_GATE[0],CITY_GATE[1]]);n.t0=performance.now()+rnd(2600)}
  log2city('🎺 The horns! The crowd streams toward the arena gate.');
  citySelect({kind:'enter'})}
function cityEnterArena(){if(CITY.entering)return;CITY.entering=true;const wasMgr=CITY.mgr,li9=CITY.li;
  closeCity(()=>{CITY.entering=false;
    if(!(wasMgr&&typeof MGR!=='undefined'))return;
    const w=W_();MGR.tab='night';
    const bi=w&&w.night&&w.night.loc===li9?w.night.bouts.findIndex(b2=>!b2.done):-1;
    MGR.gatePrompt=bi>=0?bi:null; // v0.32: walking through the gate seats you — the next bout offers itself on the board
    if(bi>=0&&w&&w.night)w.night.hornsLock=bi; // v0.33: through the gate = the square is behind you until this bout is fought
    if(!document.getElementById('mgrBody')){if(typeof openManager==='function')openManager()}else if(typeof MGR_REDRAW==='function')MGR_REDRAW();
    const mb=document.getElementById('mBody');if(mb)mb.scrollTop=0})}
/* v0.35 THE SEALED GATE: with no games on this sand, the arena is barred — and the way out names where you came from */
function cityGamesHere(){const w=CITY.w;return !!(CITY.mgr&&w&&w.night&&w.night.loc===CITY.li&&w.night.bouts.some(b2=>!b2.done))}
function cityExitKind(){const w=CITY.w;if(!CITY.mgr||!w||!w.night)return 'leave';
  if(w.night.loc===CITY.li)return 'night';                  // this city hosts the week — Match Week is where you belong
  return 'ludus'}                                           // the week's games are elsewhere — home to the ludus
const CITY_EXIT_LBL={night:'⏎ Return to Match Week',ludus:'⏎ Return to your ludus',leave:'Leave the square ✕'};
function cityExit(){const k=cityExitKind();
  if(k==='leave'){closeCity();return}
  closeCity(()=>{MGR.tab=k==='night'?'night':'ludus';
    if(!document.getElementById('mgrBody')){if(typeof openManager==='function')openManager(MGR.tab)}else if(typeof MGR_REDRAW==='function')MGR_REDRAW();
    const mb=document.getElementById('mBody');if(mb)mb.scrollTop=0})}
function citySealedPanel(){const w=CITY.w;const k=cityExitKind();
  const why=CITY.mgr&&w&&w.night&&w.night.loc===CITY.li?'Tonight’s games here are already fought — the results are posted on Match Week.':CITY.mgr&&w&&w.night?`This week’s games are at <b>${esc(LOCATIONS[w.night.loc].n)}</b>, not here.`:'No games are called on this sand right now.';
  cityPanel(`<div class="sect" style="margin-top:0">🔒 The arena gate is barred</div><div class="card2"><p style="margin:0">${why} The gatekeeper does not even look up.</p>
    <div class="acts" style="margin-top:8px"><button class="btn primary" type="button" onclick="cityExit()">${CITY_EXIT_LBL[k]}</button><button class="btn tksm" type="button" onclick="cityPanel('')">Keep strolling</button></div></div>`)}
function cityBFS(a,b){const seen={};const q=[[a,[]]];seen[a[0]+','+a[1]]=1;
  while(q.length){const [[r,c],path]=q.shift();if(r===b[0]&&c===b[1])return path;
    for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]){const r2=r+dr,c2=c+dc,k=r2+','+c2;
      if(seen[k])continue;const gate=r2===CITY_GATE[0]&&c2===CITY_GATE[1];
      if(!gate&&cityBlocked(r2,c2))continue;seen[k]=1;const p2=[...path,[r2,c2]];if(r2===b[0]&&c2===b[1])return p2;if(!gate)q.push([[r2,c2],p2])}}
  return []}

/* ---------------- drawing ---------------- */
function cityImg(key,svg){let im=CITY.imgs[key];if(!im){im=new Image();im.src='data:image/svg+xml,'+encodeURIComponent(svg);CITY.imgs[key]=im}return im.complete&&im.naturalWidth?im:null}
function drawTownsfolk(c2,x,y,U,look,opts={}){const lk=look||{};
  c2.fillStyle='rgba(0,0,0,.22)';c2.beginPath();c2.ellipse(x,y,U*0.3,U*0.11,0,0,Math.PI*2);c2.fill();
  c2.fillStyle=opts.armor?'#8a9098':(lk.robe||'#c9b27a');c2.beginPath();c2.moveTo(x-U*0.26,y);c2.quadraticCurveTo(x-U*0.3,y-U*0.62,x,y-U*0.7);c2.quadraticCurveTo(x+U*0.3,y-U*0.62,x+U*0.26,y);c2.closePath();c2.fill();c2.strokeStyle='rgba(20,12,6,.55)';c2.lineWidth=1;c2.stroke();
  if(opts.sash){c2.strokeStyle=opts.sash;c2.lineWidth=U*0.08;c2.beginPath();c2.moveTo(x-U*0.18,y-U*0.14);c2.lineTo(x+U*0.14,y-U*0.56);c2.stroke()}
  c2.fillStyle=lk.skin||'#e6cfa8';c2.beginPath();c2.ellipse(x,y-U*0.82,U*0.17,U*0.17,0,0,Math.PI*2);c2.fill();c2.strokeStyle='#1a120c';c2.lineWidth=1;c2.stroke();
  c2.fillStyle=lk.hair||'#4a2c17';c2.beginPath();c2.ellipse(x,y-U*0.89,U*0.15,U*0.085,0,Math.PI,0);c2.fill();
  if(lk.long){c2.beginPath();c2.ellipse(x-U*0.15,y-U*0.78,U*0.04,U*0.1,0,0,Math.PI*2);c2.ellipse(x+U*0.15,y-U*0.78,U*0.04,U*0.1,0,0,Math.PI*2);c2.fill()}
  if(lk.beard){c2.beginPath();c2.ellipse(x,y-U*0.71,U*0.1,U*0.055,0,0,Math.PI*2);c2.fill()}
  if(opts.helm){c2.fillStyle='#a9aeb5';c2.beginPath();c2.ellipse(x,y-U*0.9,U*0.16,U*0.1,0,Math.PI,0);c2.fill();c2.fillStyle='#a3281f';c2.fillRect(x-U*0.02,y-U*1.06,U*0.04,U*0.14)}
  if(opts.spear){c2.strokeStyle='#7a5a2a';c2.lineWidth=U*0.045;c2.beginPath();c2.moveTo(x+U*0.24,y+U*0.02);c2.lineTo(x+U*0.24,y-U*1.06);c2.stroke();c2.fillStyle='#c9d0d6';c2.beginPath();c2.moveTo(x+U*0.24,y-U*1.2);c2.lineTo(x+U*0.19,y-U*1.04);c2.lineTo(x+U*0.29,y-U*1.04);c2.closePath();c2.fill()}
  if(opts.ring){c2.strokeStyle=opts.ring;c2.lineWidth=2;c2.beginPath();c2.ellipse(x,y-U*0.42,U*0.34,U*0.5,0,0,Math.PI*2);c2.stroke()}}
function cityDraw(){const c2=CITY.c2,cv=CITY.cv;if(!c2)return;const TWc=CITY.TW,TH=TWc/2;const now=performance.now();
  const D=CITY_DRESS[CITY.L.n]||{g1:'#b5a26e',g2:'#a99663',aw:'#7a2230'};
  c2.clearRect(0,0,cv.width,cv.height);
  const sky=c2.createLinearGradient(0,0,0,cv.height*0.5);sky.addColorStop(0,'#2a2018');sky.addColorStop(1,'#3a2e20');c2.fillStyle=sky;c2.fillRect(0,0,cv.width,cv.height);
  // the ground
  for(let r=0;r<CITY_N;r++)for(let c=0;c<CITY_N;c++){const p=cityIso(r,c);
    c2.fillStyle=(r+c)%2?D.g1:D.g2;if(r===7&&c===7)c2.fillStyle='#7e8a90';
    if(r===CITY_GATE[0]&&c===CITY_GATE[1])c2.fillStyle='#8a6a3a';
    c2.beginPath();c2.moveTo(p.x,p.y-TH/2);c2.lineTo(p.x+TWc/2,p.y);c2.lineTo(p.x,p.y+TH/2);c2.lineTo(p.x-TWc/2,p.y);c2.closePath();c2.fill();
    c2.strokeStyle='rgba(40,26,14,.25)';c2.lineWidth=1;c2.stroke()}
  // drawables sorted by depth
  const items=[];
  for(const B of CITY_BLDG)items.push({d:B[0]==='arena'?-9:(B[2]+B[4]),draw:()=>cityDrawBldg(c2,B,D)}); // the arena band is behind everything; shops sort by their front corner
  items.push({d:14.05,draw:()=>{const p=cityIso(7,7); // the fountain
    c2.fillStyle='#9aa4aa';c2.beginPath();c2.ellipse(p.x,p.y-2,TWc*0.34,TWc*0.16,0,0,Math.PI*2);c2.fill();c2.strokeStyle='#4a5258';c2.stroke();
    c2.fillStyle='#4f7f9a';c2.beginPath();c2.ellipse(p.x,p.y-4,TWc*0.26,TWc*0.11,0,0,Math.PI*2);c2.fill();
    c2.fillStyle='#b8c2c8';c2.fillRect(p.x-TWc*0.035,p.y-TWc*0.62,TWc*0.07,TWc*0.55);
    c2.fillStyle='rgba(200,230,255,.6)';for(let k=0;k<3;k++){c2.beginPath();c2.ellipse(p.x+Math.sin(now/300+k*2)*TWc*0.08,p.y-TWc*0.35-k*TWc*0.08,TWc*0.02,TWc*0.04,0,0,Math.PI*2);c2.fill()}}});
  for(const n of CITY.npcs){const p=cityIso(n.r,n.c);items.push({d:n.r+n.c+0.1,draw:()=>{
    {const tok=n.kind==='beast'?n.tok
        :n.kind==='glad'?(typeof tokenForCls==='function'&&n.g?tokenForCls(CLASSES[n.g.cls]?n.g.cls:'soldier'):null)
        :n.kind==='soldier'?(n.empire?TOKEN_DEF.soldier:{...TOKEN_DEF.soldier,c1:CITY.guardC||'#3a4a5a',c2:CITY.guardC2||'#c9ccd3',cape:true})
        :typeof specFig==='function'?(n.fig=n.fig||specFig(n.look,{sash:n.kind==='auct',basket:n.kind==='filler'&&(n.id.charCodeAt(1)%5===0),amphora:n.kind==='filler'&&(n.id.charCodeAt(1)%5===1)})):null;
      const svg=tok&&typeof figureSVG==='function'?figureSVG(tok,{}):null;const im=svg?cityImg('fg'+(n.g?n.g.id:n.id),svg):null;
      c2.fillStyle='rgba(0,0,0,.22)';c2.beginPath();c2.ellipse(p.x,p.y,TWc*0.3,TWc*0.11,0,0,Math.PI*2);c2.fill();
      if(CITY.hover===n||n.reg&&n.reg.kin){c2.strokeStyle=CITY.hover===n?'#f0cf7d':'rgba(240,207,125,.45)';c2.lineWidth=2;c2.beginPath();c2.ellipse(p.x,p.y,TWc*0.32,TWc*0.13,0,0,Math.PI*2);c2.stroke()}
      if(im)c2.drawImage(im,p.x-TWc*0.36,p.y-TWc*1.18,TWc*0.72,TWc*1.22);else drawTownsfolk(c2,p.x,p.y,TWc,n.look||{},{})}
    if(n.say){c2.font=`600 ${Math.max(10,Math.round(TWc*0.22))}px Alegreya Sans, sans-serif`;const wd=c2.measureText(n.say).width+12;
      c2.fillStyle='rgba(245,234,210,.94)';c2.beginPath();c2.roundRect(p.x-wd/2,p.y-TWc*1.42,wd,TWc*0.32,4);c2.fill();
      c2.fillStyle='#241910';c2.textAlign='center';c2.textBaseline='middle';c2.fillText(n.say,p.x,p.y-TWc*1.26)}
    n._x=p.x;n._y=p.y}})}
  {const P=CITY.player;const p=cityIso(P.r,P.c);items.push({d:P.r+P.c+0.2,draw:()=>{
    const tok=P.fig=P.fig||(typeof specFig==='function'?{...specFig(P.look,{body:'robe',scale:1}),c2:'#e6b93a'}:null);
    c2.fillStyle='rgba(0,0,0,.25)';c2.beginPath();c2.ellipse(p.x,p.y,TWc*0.32,TWc*0.12,0,0,Math.PI*2);c2.fill();
    c2.strokeStyle='#f0cf7d';c2.lineWidth=2;c2.beginPath();c2.ellipse(p.x,p.y,TWc*0.34,TWc*0.14,0,0,Math.PI*2);c2.stroke();
    const svg=tok?figureSVG(tok,{}):null;const im=svg?cityImg('me',svg):null;
    if(im)c2.drawImage(im,p.x-TWc*0.37,p.y-TWc*1.22,TWc*0.74,TWc*1.26);else drawTownsfolk(c2,p.x,p.y,TWc*1.06,P.look,{ring:'#f0cf7d'});
    c2.font=`600 ${Math.max(9,Math.round(TWc*0.2))}px IBM Plex Mono, monospace`;c2.fillStyle='#f0cf7d';c2.textAlign='center';c2.fillText(CITY.mgr?'YOU · LANISTA':'YOU',p.x,p.y+TWc*0.28)}})}
  items.sort((a,b)=>a.d-b.d);for(const it of items)it.draw();
  // hover name
  if(CITY.hover&&CITY.hover._x!=null){const n=CITY.hover;c2.font=`600 ${Math.max(10,Math.round(TWc*0.22))}px Alegreya Sans,sans-serif`;const wd=c2.measureText(n.name).width+10;
    c2.fillStyle='rgba(20,14,8,.9)';c2.beginPath();c2.roundRect(n._x-wd/2,n._y+TWc*0.12,wd,TWc*0.3,4);c2.fill();c2.fillStyle='#f0cf7d';c2.textAlign='center';c2.textBaseline='middle';c2.fillText(n.name,n._x,n._y+TWc*0.27)}
  if(CITY.toast&&now<CITY.toast.until){c2.font=`600 ${Math.max(12,Math.round(TWc*0.26))}px Alegreya Sans,sans-serif`;const wd=c2.measureText(CITY.toast.t).width+18;
    c2.fillStyle='rgba(20,14,8,.85)';c2.beginPath();c2.roundRect(cv.width/2-wd/2,10,wd,TWc*0.44,5);c2.fill();c2.fillStyle='#e8dcc0';c2.textAlign='center';c2.textBaseline='middle';c2.fillText(CITY.toast.t,cv.width/2,10+TWc*0.22)}
}
function cityDrawBldg(c2,[k,r0,r1,c0,c1,h,label,icon],D){const TWc=CITY.TW;
  const pA=cityIso(r0,c0),pB=cityIso(r0,c1),pC=cityIso(r1,c1),pD2=cityIso(r1,c0);const H=TWc*h*0.55;
  const stone=k==='arena';const wall1=stone?'#7a6f60':'#8a6f4e',wall2=stone?'#685e50':'#74593c',roofC=k==='arena'?'#8a8070':D.aw;
  const Lx=pD2.x-TWc/2,Ly=pD2.y,Cx=pC.x,Cy=pC.y+TWc/4,Rx=pB.x+TWc/2,Ry=pB.y;
  // left wall (D→C) and right wall (C→B)
  c2.fillStyle=wall2;c2.beginPath();c2.moveTo(Lx,Ly);c2.lineTo(Cx,Cy);c2.lineTo(Cx,Cy-H);c2.lineTo(Lx,Ly-H);c2.closePath();c2.fill();
  c2.fillStyle=wall1;c2.beginPath();c2.moveTo(Cx,Cy);c2.lineTo(Rx,Ry);c2.lineTo(Rx,Ry-H);c2.lineTo(Cx,Cy-H);c2.closePath();c2.fill();
  // texture: stone courses on the arena, timber planks on the shops
  c2.save();c2.globalAlpha=.35;c2.strokeStyle=stone?'#4a4238':'#4a3520';c2.lineWidth=1;
  for(let i=1;i<4;i++){const t=i/4;c2.beginPath();c2.moveTo(Lx,Ly-H*t);c2.lineTo(Cx,Cy-H*t);c2.lineTo(Rx,Ry-H*t);c2.stroke()}
  if(!stone)for(let i=1;i<5;i++){const t=i/5;c2.beginPath();c2.moveTo(Lx+(Cx-Lx)*t,Ly+(Cy-Ly)*t);c2.lineTo(Lx+(Cx-Lx)*t,Ly+(Cy-Ly)*t-H);c2.stroke();c2.beginPath();c2.moveTo(Cx+(Rx-Cx)*t,Cy+(Ry-Cy)*t);c2.lineTo(Cx+(Rx-Cx)*t,Cy+(Ry-Cy)*t-H);c2.stroke()}
  c2.restore();
  // roof
  c2.fillStyle=roofC;c2.beginPath();c2.moveTo(pA.x,pA.y-TWc/4-H);c2.lineTo(Rx,Ry-H);c2.lineTo(Cx,Cy-H);c2.lineTo(Lx,Ly-H);c2.closePath();c2.fill();c2.strokeStyle='rgba(20,12,6,.5)';c2.stroke();
  if(!stone){ // clay tile ridges on shop roofs
    c2.save();c2.globalAlpha=.3;c2.strokeStyle='#2a1a10';for(let i=1;i<4;i++){const t=i/4;c2.beginPath();c2.moveTo(pA.x+(Lx-pA.x)*t,pA.y-TWc/4-H+(Ly-pA.y)*t);c2.lineTo(Rx+(Cx-Rx)*t,Ry-H+(Cy-Ry)*t);c2.stroke()}c2.restore()}
  if(k==='arena'){ // arches, banner poles, the gate, the balcony
    c2.fillStyle='#2a2018';for(let i=0;i<5;i++){const t=(i+0.5)/5;const x=Lx+(Cx-Lx)*t,y=Ly+(Cy-Ly)*t;
      c2.beginPath();c2.ellipse(x,y-H*0.34,TWc*0.11,H*0.3,0,Math.PI,0);c2.rect(x-TWc*0.11,y-H*0.34,TWc*0.22,H*0.34);c2.fill()}
    {const fs=[D.aw,D.aw];if(CITY.mgr&&typeof mgrFlagOf==='function'){CITY.myFlagIm=CITY.myFlagIm||null}
     let fi=0;for(const t of [0.12,0.88]){const x=Lx+(Rx-Lx)*t,y=(t<0.5?Ly+(Cy-Ly)*t*2:Cy+(Ry-Cy)*(t-0.5)*2);
      c2.strokeStyle='#5a4a34';c2.lineWidth=2.5;c2.beginPath();c2.moveTo(x,y-H);c2.lineTo(x,y-H-TWc*0.8);c2.stroke();
      const mine=fi===1&&CITY.mgr&&typeof flagImg==='function';const im=mine?flagImg(mgrFlagOf(me())):null;
      if(im)c2.drawImage(im,x,y-H-TWc*0.82,TWc*0.52,TWc*0.3);else{c2.fillStyle=fs[fi];c2.beginPath();c2.moveTo(x,y-H-TWc*0.8);c2.lineTo(x+TWc*0.4,y-H-TWc*0.68);c2.lineTo(x,y-H-TWc*0.52);c2.closePath();c2.fill()}fi++}}
    const g=cityIso(CITY_GATE[0],CITY_GATE[1]);c2.fillStyle='#14100c';c2.beginPath();c2.ellipse(g.x,g.y-TWc*0.44,TWc*0.3,TWc*0.5,0,Math.PI,0);c2.rect(g.x-TWc*0.3,g.y-TWc*0.44,TWc*0.6,TWc*0.44);c2.fill();
    c2.strokeStyle='#c9a458';c2.lineWidth=1.5;c2.beginPath();c2.ellipse(g.x,g.y-TWc*0.44,TWc*0.3,TWc*0.5,0,Math.PI,0);c2.stroke();
    c2.fillStyle='#e8dcc0';c2.font=`600 ${Math.max(9,Math.round(TWc*0.2))}px IBM Plex Mono,monospace`;c2.textAlign='center';c2.fillText('⬆ THE ARENA GATE',g.x,g.y-TWc*1.0);
    if(CITY.sponsorHere){const im=CITY.imgs['spB']||(()=>{const i2=new Image();i2.src=flavFaceURL('calm',CITY.sponsorHere);CITY.imgs['spB']=i2;return i2})();
      const bx=Rx+TWc*0.2,by=Ry-H-TWc*0.1;if(im.complete&&im.naturalWidth){c2.drawImage(im,bx-TWc*0.55,by-TWc*0.8,TWc*1.1,TWc*0.88);CITY.spBox=[bx-TWc*0.55,by-TWc*0.8,TWc*1.1,TWc*0.88]}}
    return}
  // ---- the shops: each front is its own — awnings only where the perspective earns them ----
  const mid={x:(Lx+Rx)/2,y:(Ly+Ry)/2+(Cy-(Ly+Ry)/2)/2};
  const DECO={arms:{awn:'R',rack:'swords'},armor:{awn:'R',rack:'shield'},bath:{awn:null,steam:true},tavern:{awn:'R',amph:true},lupanar:{awn:null,lamps:true},auction:{awn:null,rope:true}}[k]||{};
  // door on the left wall
  {const t=0.55;const x=Lx+(Cx-Lx)*t,y=Ly+(Cy-Ly)*t;c2.fillStyle='#3a2412';c2.beginPath();c2.ellipse(x,y-H*0.3,TWc*0.12,H*0.28,0,Math.PI,0);c2.rect(x-TWc*0.12,y-H*0.3,TWc*0.24,H*0.3);c2.fill();
    c2.strokeStyle='#1c1006';c2.lineWidth=1;for(let i=-1;i<=1;i++){c2.beginPath();c2.moveTo(x+i*TWc*0.06,y-H*0.52);c2.lineTo(x+i*TWc*0.06,y);c2.stroke()}}
  // window with shutters on the right wall
  {const t=0.45;const x=Cx+(Rx-Cx)*t,y=Cy+(Ry-Cy)*t;c2.fillStyle='#1c140c';c2.fillRect(x-TWc*0.1,y-H*0.62,TWc*0.2,H*0.26);
    c2.fillStyle='#6a4a2a';c2.fillRect(x-TWc*0.16,y-H*0.62,TWc*0.06,H*0.26);c2.fillRect(x+TWc*0.1,y-H*0.62,TWc*0.06,H*0.26);
    c2.strokeStyle='#2a1a0c';c2.strokeRect(x-TWc*0.1,y-H*0.62,TWc*0.2,H*0.26)}
  // striped awning over a stall — drawn on whichever wall actually faces the square
  if(DECO.awn){const onLeft=c0>=8; // right-edge shops open toward the square on their LEFT wall
    const ax=onLeft?Lx+(Cx-Lx)*0.5:Cx+(Rx-Cx)*0.72,ay=onLeft?Ly+(Cy-Ly)*0.5:Cy+(Ry-Cy)*0.72;const aw2=TWc*0.75,ad=TWc*0.42;const dir=onLeft?-0.35:0.35;
    const grad=[D.aw,'#e8dcc0'];for(let i=0;i<5;i++){c2.fillStyle=grad[i%2];
      c2.beginPath();c2.moveTo(ax-aw2/2+i*aw2/5,ay-H*0.62);c2.lineTo(ax-aw2/2+(i+1)*aw2/5,ay-H*0.62);c2.lineTo(ax-aw2/2+(i+1)*aw2/5+ad*dir,ay-H*0.28+ad*0.2);c2.lineTo(ax-aw2/2+i*aw2/5+ad*dir,ay-H*0.28+ad*0.2);c2.closePath();c2.fill()}
    c2.strokeStyle='#5a4a34';c2.lineWidth=2;c2.beginPath();c2.moveTo(ax-aw2/2+ad*dir,ay-H*0.28+ad*0.2);c2.lineTo(ax-aw2/2+ad*dir,ay+TWc*0.06);c2.moveTo(ax+aw2/2+ad*dir,ay-H*0.28+ad*0.2);c2.lineTo(ax+aw2/2+ad*dir,ay+TWc*0.06);c2.stroke();
    c2.fillStyle='#7a5a34';c2.fillRect(ax-aw2/2+ad*dir*0.6,ay-TWc*0.16,aw2*0.8,TWc*0.1);c2.strokeStyle='#4a3520';c2.strokeRect(ax-aw2/2+ad*dir*0.6,ay-TWc*0.16,aw2*0.8,TWc*0.1);
    if(DECO.rack==='swords'){c2.strokeStyle='#c9d0d6';c2.lineWidth=2;for(let i2=0;i2<3;i2++){c2.beginPath();c2.moveTo(ax-aw2*0.2+i2*TWc*0.14,ay-TWc*0.1);c2.lineTo(ax-aw2*0.2+i2*TWc*0.14+TWc*0.04,ay-TWc*0.34);c2.stroke()}}
    if(DECO.rack==='shield'){c2.fillStyle='#7a2230';c2.beginPath();c2.ellipse(ax,ay-TWc*0.26,TWc*0.11,TWc*0.13,0,0,Math.PI*2);c2.fill();c2.strokeStyle='#e6b93a';c2.stroke()}
    if(DECO.amph){c2.fillStyle='#b06a3a';for(let i2=0;i2<2;i2++){c2.beginPath();c2.ellipse(ax+aw2*0.3+i2*TWc*0.12,ay-TWc*0.12,TWc*0.05,TWc*0.1,0,0,Math.PI*2);c2.fill()}}}
  if(DECO.steam){c2.save();c2.fillStyle='rgba(230,238,240,.28)';const tphase=performance.now()/900;for(let i2=0;i2<3;i2++){const sx2=mid.x-TWc*0.3+i2*TWc*0.3,sy2=Ly-H-TWc*(0.15+((tphase+i2*0.7)%1)*0.5);c2.beginPath();c2.ellipse(sx2,sy2,TWc*(0.1+0.05*i2),TWc*0.07,0,0,Math.PI*2);c2.fill()}c2.restore()}
  if(DECO.lamps){for(const t of [0.3,0.7]){const x=Lx+(Cx-Lx)*t,y=Ly+(Cy-Ly)*t;c2.fillStyle='#e0843a';c2.beginPath();c2.ellipse(x,y-H*0.7,TWc*0.045,TWc*0.06,0,0,Math.PI*2);c2.fill();c2.strokeStyle='#5a3a1a';c2.beginPath();c2.moveTo(x,y-H*0.7-TWc*0.06);c2.lineTo(x,y-H*0.82);c2.stroke()}}
  if(DECO.rope){c2.strokeStyle='#a8875a';c2.lineWidth=2;c2.beginPath();c2.moveTo(Lx+TWc*0.1,Ly-H*0.1);c2.quadraticCurveTo((Lx+Cx)/2,Ly+TWc*0.3,Cx-TWc*0.05,Cy-H*0.05);c2.stroke()}
  const midT=cityIso((r0+r1)/2,(c0+c1)/2);
  c2.font=`${Math.round(TWc*0.5)}px serif`;c2.textAlign='center';c2.textBaseline='middle';c2.fillText(icon,midT.x,midT.y-H-TWc*0.32);
  c2.fillStyle='rgba(20,14,8,.78)';c2.font=`600 ${Math.max(9,Math.round(TWc*0.19))}px IBM Plex Mono,monospace`;const wd=c2.measureText(label).width+8;
  c2.fillRect(midT.x-wd/2,midT.y-H-TWc*0.2,wd,TWc*0.26);c2.fillStyle='#e8dcc0';c2.fillText(label,midT.x,midT.y-H-TWc*0.07)}

/* ---------------- picking: tiles, people, buildings ---------------- */
function cityAt(ev){const rect=CITY.cv.getBoundingClientRect();const x=ev.clientX-rect.left,y=ev.clientY-rect.top;const TWc=CITY.TW;
  // sponsor balcony?
  if(CITY.spBox&&x>=CITY.spBox[0]&&x<=CITY.spBox[0]+CITY.spBox[2]&&y>=CITY.spBox[1]&&y<=CITY.spBox[1]+CITY.spBox[3])return {sponsor:true};
  let best=null,bd=1e9;for(const n of CITY.npcs){if(n._x==null)continue;const d=Math.hypot(x-n._x,y-(n._y-TWc*0.45));if(d<TWc*0.5&&d<bd){bd=d;best=n}}
  if(best)return {npc:best};
  const cB=Math.round(((x-CITY.OX)/(TWc/2)+(y-CITY.OY)/(TWc/4))/2),rB=Math.round(((y-CITY.OY)/(TWc/4)-(x-CITY.OX)/(TWc/2))/2);
  return {r:rB,c:cB}}
function cityMove(ev){const hit=cityAt(ev);CITY.hover=hit.npc||null;CITY.cv.style.cursor=hit.npc||hit.sponsor||(hit.r!=null&&cityBldgAt(hit.r,hit.c))?'pointer':'default'}
function cityClick(ev){const hit=cityAt(ev);
  if(hit.sponsor)return citySelect({kind:'sponsor',sp:CITY.sponsorHere});
  if(hit.npc)return citySelect(hit.npc.kind==='auct'?{kind:'auction'}:hit.npc);
  if(hit.r==null)return;const B=cityBldgAt(hit.r,hit.c);
  if(B)return citySelect({kind:'bldg',key:B[0],label:B[6]});
  if(hit.r===CITY_GATE[0]&&hit.c===CITY_GATE[1]||!cityBlocked(hit.r,hit.c)){CITY.path=cityBFS([CITY.player.r,CITY.player.c],[hit.r,hit.c]);CITY.sel=null;cityPanel('')}}

/* ---------------- the side panel: cards, shops, the auction ---------------- */
function cityPanel(html){const p=document.getElementById('cityPanel');if(!p)return;p.hidden=!html;p.innerHTML=html?`<button class="btn tksm citypx" type="button" onclick="cityPanel('')">✕</button>${html}`:'';
  if(html&&!p._wired){p._wired=1;p.addEventListener('click',e=>{const act=e.target.closest('[data-spact]');if(!act)return; // the global handler acts; we refresh the card right after
    setTimeout(()=>{if(CITY.open&&CITY.sel&&CITY.sel.kind==='spec')citySelect(CITY.sel)},120)})}}
function citySelect(sel){CITY.sel=sel;const w=CITY.w,mgr=CITY.mgr;const pm=mgr?me():null;
  if(sel.kind==='spec'&&sel.reg){cityPanel(`<div class="sect" style="margin-top:0">👤 A face from the stands</div>${typeof spectInspectorHTML==='function'?spectInspectorHTML(sel.reg):`<b>${esc(sel.name)}</b>`}
    <p class="rc-sub">${esc(sel.reg.city||CITY.L.n)} is home. You have seen them in the tiers${sel.reg.visits?` ${sel.reg.visits} time${sel.reg.visits===1?'':'s'}`:''}.</p>`);return}
  if(sel.kind==='filler'){cityPanel(`<div class="sect" style="margin-top:0">👤 A passer-by</div><div class="card2"><b>${esc(sel.name)}</b><p class="rc-sub" style="margin:4px 0 0">${pickOne(['Shopping for the week.','Late for something, clearly.','Here for the games, like everyone.','Arguing about chariot teams.','Selling nothing anyone wants.'])} Not a regular of your stands — yet.</p></div>`);return}
  if(sel.kind==='soldier'){cityPanel(`<div class="sect" style="margin-top:0">🛡 A legionary on watch</div><div class="card2"><p style="margin:0">"Move along, citizen." ${w&&w.glads.some(g=>g.inj&&g.inj.war)?'The legions are hungry for men this season — lanistae keep their best fighters out of sight when the levy officer walks.':'Quiet rounds today. The levy lists stay rolled up.'}</p></div>`);return}
  if(sel.kind==='sponsor'){const sp=sel.sp;cityPanel(`<div class="sect" style="margin-top:0">🎭 The editor of the games, on the balcony</div><div class="card2" style="text-align:center"><img src="${flavFaceURL('pleased',sp)}" style="width:130px;border-radius:4px"><br><b>${esc(sp.name)}</b><div class="rc-sub">${esc(sp.title||'')}</div>
    <p class="commsq">“${esc(pickOne(['A fine crowd today. My crowd.','Enjoy my square. Spend freely.','The games? Oh, they will be worth watching. I paid for them.','You there — bring me a winner and we shall talk.']))}”</p></div>`);return}
  if(sel.kind==='glad'){const g=sel.g;const stars='★'.repeat(starsOf(pubOvr(g)));const lud=g.contract&&typeof mgrById==='function'?mgrById(g.contract.mgr):null;
    cityPanel(`<div class="sect" style="margin-top:0">🗡 A gladiator in the square</div><div class="card2"><div style="display:flex;gap:10px">${typeof gArt==='function'?gArt(g,'sm'):''}<div><b>${esc(g.name)}</b> <span class="stars">${stars}</span><div class="rc-sub">${CLASSES[g.cls]?CLASSES[g.cls].name:''} · ${gAge(g)} · of ${esc(g.city||'?')}</div>
      <div class="rc-sub">${g.rec?`${g.rec.w}-${Math.max(0,g.rec.ev-g.rec.w)} on the sand`:''} · ${lud?`fights for ${esc(lud.ludus)}`:'a free sword'}</div>
      ${sel.bout?`<div style="color:var(--gold2);margin-top:4px">⚔ Fights on tonight's card — ${esc(TIERS[sel.bout.tier].n)}</div>`:''}</div></div>
      <p class="commsq" style="margin:6px 0 0">“${esc(sel.bout?pickOne(['Watch the sand tonight. You will remember my name.','I fight at the '+(TIERS[sel.bout.tier].n.toLowerCase())+'. Pray for the other one.','A quiet walk before the noise.']):pickOne(['The baths here are better than Roma’s. Tell no one.','Between contracts. Between everything.','I fought here once. Good crowd, bad sand.']))}”</p>
      ${mgr&&!sel.ephemeral?`<div class="acts" style="margin-top:6px"><button class="btn tksm" type="button" onclick="cityFav('${g.id}')">${g.favd?'★ On your board':'☆ Pin to Favorites'}</button></div>`:''}</div>`);return}
  if(sel.kind==='auction')return cityAuctionPanel();
  if(sel.kind==='bldg')return cityShopPanel(sel.key);
  if(sel.kind==='enter'){cityPanel(`<div class="sect" style="margin-top:0">🎺 The horns have sounded</div><div class="card2"><p style="margin:0">The square empties; the tiers fill. ${CITY.mgr?'Your card is waiting.':'The games are beginning.'}</p>
    <div class="acts" style="margin-top:8px"><button class="btn primary" type="button" onclick="cityEnterArena()">⚔ Enter the arena</button><button class="btn tksm" type="button" onclick="cityPanel('')">Linger a moment</button></div></div>`);return}
}
function cityFav(gid){const g=gById(gid);if(!g)return;g.favd=!g.favd;if(typeof saveWorld==='function')saveWorld();citySelect(CITY.sel);log2city(g.favd?`${g.name} pinned to your Favorites.`:`${g.name} removed from your board.`)}

/* ---------------- the auction block: the unwanted, going cheap ---------------- */
const AUCTION_WOES=[['old bones',g=>{g.age=36+rnd(8)}],['a wet cough',g=>{g.ovr=Math.max(38,g.ovr-6)}],['too fond of the table',g=>{g.ovr=Math.max(38,g.ovr-4)}],['a condemned man',g=>{g.cls='damnatio'}],['"no one hires a woman", says the seller',g=>{g.fem=true;g.cls='amazonia'}],['half-blind in one eye',g=>{g.ovr=Math.max(38,g.ovr-5)}],['freezes at the sight of beasts',g=>{}],['too old to retrain, they say',g=>{g.age=34+rnd(6)}]];
function cityAuctionLot(){const w=CITY.w;if(!w)return [];
  if(!w.cityAuction||w.cityAuction.wk!==w.week||w.cityAuction.li!==CITY.li){
    const lot=[];for(let i=0;i<2+rnd(2);i++){const g=genGlad({ovr:37+rnd(12)});const [woe,fx]=pickOne(AUCTION_WOES);fx(g);g.woe=woe;g.auction=1;g.gemHid=Math.random()<.18?6+rnd(8):0; /* v0.47: the empire's cannon fodder — cheaper, a notch lower, and still the odd gem */
      g.price=5+rnd(9);w.glads.push(g);lot.push(g.id)}
    w.cityAuction={wk:w.week,li:CITY.li,ids:lot};if(typeof saveWorld==='function')saveWorld()}
  return w.cityAuction.ids.map(gById).filter(g=>g&&g.alive&&!g.contract)}
function cityAuctionPanel(){const mgr=CITY.mgr;const lot=cityAuctionLot();const pm=mgr?me():null;
  cityPanel(`<div class="sect" style="margin-top:0">⚖ The auction block</div>
   <p class="rc-sub" style="margin:0 0 6px">"HONEST VULSO'S — fighters no ludus wants, at prices no lanista can refuse!" The unwanted go cheap. Most are exactly what they look like. <b>Most.</b> You learn the truth only if they win their first bout under your name.</p>
   ${!CITY.w?'<p class="rc-sub">Come back wearing a lanista’s ring — Vulso only sells to managers.</p>':lot.length?lot.map(g=>`<div class="card2" style="margin-bottom:6px"><div style="display:flex;gap:8px">${typeof gArt==='function'?gArt(g,'sm'):''}<div style="flex:1"><b>${esc(g.name)}</b> <span class="stars">${'★'.repeat(starsOf(pubOvr(g)))}</span>
      <div class="rc-sub">${CLASSES[g.cls]?CLASSES[g.cls].name:''} · ${gAge(g)} · rated ~${pubOvr(g)} · <i>${esc(g.woe)}</i></div>
      <div class="acts" style="margin-top:4px"><button class="btn primary tksm" type="button" ${mgr&&pm.coin>=g.price?'':'disabled'} onclick="cityBuyLot('${g.id}')">Buy · ${g.price} coin<small>signs 6 weeks at 2/wk</small></button></div></div></div></div>`).join(''):'<p class="rc-sub">The block stands empty — sold out, or nobody desperate enough this week.</p>'}`)}
function cityBuyLot(gid){const g=gById(gid);const pm=me();const w=CITY.w;if(!g||!pm||pm.coin<g.price)return;
  pm.coin-=g.price;g.contract={mgr:pm.id,wage:2,weeks:6,since:w.week};delete g.auction;g.morale=55;g.scout=1;g.unsigned=0;
  ghist(g,`bought off the auction block at ${CITY.L.n} for ${g.price} coin (${g.woe})`);
  tnews(`⚖ Bought ${esc(g.name)} off the auction block at ${esc(CITY.L.n)} (${g.price} coin). ${g.woe}.`);
  if(typeof mlog==='function')mlog(pm,`bought ${g.name} at auction (${g.price} coin)`);
  saveWorld();log2city(`${g.name} is yours. Vulso bites the coin and grins.`);cityAuctionPanel()}
// the hidden gem shows their true worth the first time they WIN for you
function gemCheck(g,m){if(!g||!g.gemHid||!m||!m.isPlayer)return;const up=g.gemHid;g.gemHid=0;
  g.ovr=clamp(g.ovr+up,38,94);g.pot=Math.max(g.pot||g.ovr,g.ovr+3+rnd(5));
  {const w9=W_();w9.gemsFound=(w9.gemsFound||0)+1}
  mnews(`💎 <b>${esc(g.name)}</b> — the auction-block castoff — fights like a champion! The doctores re-rate them at <b>${g.ovr}</b>. Vulso's face, when he hears.`,'big');
  tnews(`💎 Hidden gem: ${esc(g.name)} is re-rated at ${g.ovr} (+${up}).`,'big');ghist(g,`revealed as a hidden gem — re-rated ${g.ovr}`)}

/* ---------------- the shops: a start-of-bout kit, the baths, the tavern ---------------- */
/* v0.36 HOME CITY: in the city where your ludus stands, the merchants know your face — a quarter off everything */
const cityHome=()=>!!(CITY.mgr&&typeof me==='function'&&me()&&me().city===CITY.L.n);
const cityPr=pr=>cityHome()?Math.ceil(pr*0.75):pr;
const CITY_ARMS=[['mw1',6],['mw2',12],['mw3',20],['merc1',5],['merc2',9]];
const CITY_ARMOR=[['ma1',6],['ma2',12],['ma3',20],['elix2',5],['elix4',9]];
function cityShopPanel(key){const w=CITY.w,mgr=CITY.mgr;const pm=mgr?me():null;
  if(key==='arena'){if(cityGamesHere())citySelect({kind:'enter'});else citySealedPanel();return}
  if(key==='arms'||key==='armor'){const stock=key==='arms'?CITY_ARMS:CITY_ARMOR;const ros=mgr?rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a)):[];
    cityPanel(`<div class="sect" style="margin-top:0">${key==='arms'?'⚔️ The arms market':'🛡 The armorer'}</div>
     <p class="rc-sub" style="margin:0 0 6px">Gear bought here is carried into the fighter's <b>next bout this week</b> — they start equipped instead of waiting on the arena market. Their class loadout stays; a swapped-out starting weapon is still theirs to use. Three items a fighter, at most.</p>
     ${!mgr?'<p class="rc-sub">The smith looks up: "Lanistae only. The arena has its own market for fighters."</p>':`
     <label class="rc-sub">For <select id="cityKitWho" class="tin">${ros.map(g=>`<option value="${g.id}">${esc(g.name)} · ${effOvr(g)} · kit ${(g.kit||[]).length}/3</option>`).join('')}</select></label>
     <div class="acts" style="margin-top:6px;flex-direction:column;align-items:stretch">${cityHome()?'<p class="rc-sub" style="margin:0">🏠 <b>Home-city prices</b> — a quarter off, for the lanista whose ludus stands here.</p>':''}${stock.map(([k,pr0])=>{const pr=cityPr(pr0);return `<button class="btn" type="button" onclick="cityBuyKit('${k}',${pr})" ${pm.coin<pr?'disabled':''}>${OFFER[k].g} ${OFFER[k].n} <small>${OFFER[k].s} · ${pr} coin${pr<pr0?` <s>${pr0}</s>`:''}</small></button>`}).join('')}</div>
     <div id="cityKitList">${cityKitListHTML(ros[0])}</div>`}`);return}
  if(key==='bath'){cityPanel(`<div class="sect" style="margin-top:0">🛁 The bathhouse</div><div class="card2"><p style="margin:0">Steam, strigils and gossip. ${mgr?'':'The attendant nods you toward the public pool.'}</p>
    ${mgr?`<div class="acts" style="margin-top:6px"><button class="btn primary tksm" type="button" ${w.bathWk===w.week?'disabled title="Already steamed this week"':me().coin<cityPr(8)?'disabled':''} onclick="cityBath()">Steam the whole stable<small>${cityPr(8)} coin · weekly · +2 morale each</small></button></div>`:''}</div>`);return}
  if(key==='tavern'){cityPanel(`<div class="sect" style="margin-top:0">🍷 The tavern</div><div class="card2"><p style="margin:0">Sour wine, loud opinions, and everything worth knowing in ${esc(CITY.L.n)}.</p>
    ${mgr?`<div class="acts" style="margin-top:6px"><button class="btn primary tksm" type="button" ${w.tavWk===w.week?'disabled title="You already stood a round this week"':me().coin<cityPr(6)?'disabled':''} onclick="cityTavern()">Stand a round<small>${cityPr(6)} coin · weekly · +3 morale each, and someone talks</small></button></div>`:''}</div>`);return}
  if(key==='lupanar'){cityPanel(`<div class="sect" style="margin-top:0">🌙 The lupanar</div><div class="card2"><p style="margin:0">Lamplight and discretion. The door-keeper looks you over: "The house hears everything, lanista. Senators, stewards… <i>rival lanistae.</i>"</p>
    ${mgr?`<div class="acts" style="margin-top:6px"><button class="btn primary tksm" type="button" ${w.lupWk===w.week?'disabled title="The house has already been generous this week"':me().coin<cityPr(10)?'disabled':''} onclick="cityLup()">An evening of diplomacy<small>${cityPr(10)} coin · weekly · a rival house warms to you</small></button></div>`:''}</div>`);return}
  if(key==='auction')return cityAuctionPanel();
}
function cityKitListHTML(g){if(!g)return '';return `<div class="sect">In ${esc(g.name)}'s kit</div>${(g.kit||[]).length?(g.kit||[]).map((k,i)=>`<div style="font-size:12.5px">${OFFER[k].g} ${OFFER[k].n} (${OFFER[k].s}) <button class="btn tksm" type="button" onclick="cityKitDrop('${g.id}',${i})">↩ return</button></div>`).join(''):'<span class="rc-sub">Nothing yet — they walk out with their class loadout.</span>'}`}
function cityBuyKit(k,pr){const pm=me();const sel=document.getElementById('cityKitWho');const g=sel&&gById(sel.value);if(!g||pm.coin<pr)return;
  g.kit=g.kit||[];if(g.kit.length>=3){log2city('Three items is the limit — the fighter has only so many hands.');return}
  pm.coin-=pr;g.kit.push(k);g.kitWk=CITY.w.week;saveWorld();log2city(`${OFFER[k].n} wrapped for ${g.name}.`);
  const box=document.getElementById('cityKitList');if(box)box.innerHTML=cityKitListHTML(g);const o=sel.querySelector(`option[value="${g.id}"]`);if(o)o.textContent=`${g.name} · ${effOvr(g)} · kit ${g.kit.length}/3`}
function cityKitDrop(gid,i){const g=gById(gid);const pm=me();if(!g||!g.kit)return;const k=g.kit.splice(i,1)[0];pm.coin+=Math.ceil((CITY_ARMS.concat(CITY_ARMOR).find(x=>x[0]===k)||[0,4])[1]*0.7);saveWorld();
  const box=document.getElementById('cityKitList');if(box)box.innerHTML=cityKitListHTML(g)}
function cityBath(){const w=CITY.w,pm=me();const f=cityPr(8);if(w.bathWk===w.week||pm.coin<f)return;pm.coin-=f;w.bathWk=w.week;for(const g of rosterOf(pm))g.morale=clamp(g.morale+2,0,100);tnews('🛁 The whole stable steamed at the bathhouse: +2 morale each.');saveWorld();log2city('The stable emerges pink and cheerful. +2 morale each.');cityShopPanel('bath')}
function cityTavern(){const w=CITY.w,pm=me();const f=cityPr(6);if(w.tavWk===w.week||pm.coin<f)return;pm.coin-=f;w.tavWk=w.week;for(const g of rosterOf(pm))g.morale=clamp(g.morale+3,0,100);
  const un=w.glads.filter(g=>g.alive&&(g.scout||0)<1&&(!g.contract||g.contract.mgr!==pm.id));const tip=un.length?pickOne(un):null;if(tip)tip.scout=Math.max(tip.scout||0,1);
  tnews(`🍷 Stood a round at ${esc(CITY.L.n)}: +3 morale each${tip?`, and a drunk swears <b>${esc(tip.name)}</b> is better than the scrolls say (scouted)`:''}.`);saveWorld();
  log2city(tip?`+3 morale each — and a tip about ${tip.name}.`:'+3 morale all around.');cityShopPanel('tavern')}
function cityLup(){const w=CITY.w,pm=me();const f=cityPr(10);if(w.lupWk===w.week||pm.coin<f)return;pm.coin-=f;w.lupWk=w.week;
  const riv=w.mgrs.filter(m=>!m.isPlayer).sort((a,b)=>(typeof opinionOf==='function'?opinionOf(a).v-opinionOf(b).v:0))[0];
  if(riv){riv.relB=(riv.relB||0)+4;if(typeof mlog==='function')mlog(riv,`softened toward ${pm.ludus} after a certain evening at the ${CITY.L.n} lupanar`)}
  tnews(`🌙 An evening of diplomacy at ${esc(CITY.L.n)}${riv?`: ${esc(riv.ludus)} warms to you a little (+4 opinion)`:''}.`);saveWorld();log2city(riv?`${riv.name} will hear of your generosity. +4 opinion.`:'A pleasant, expensive evening.');cityShopPanel('lupanar')}
// clicks from the Imperium's city tiles land here, wherever they are rendered
/* v0.45: in a career you can only walk a city's square in the week you fight there, once the road is paid */
function citySquareGate(li){const w=typeof W_==='function'?W_():null;if(!w||!w.night)return null;if(w.tutorial)return 'Not during the lesson — explore the squares in your own career';
  if(+li!==+w.night.loc)return `Only ${LOCATIONS[w.night.loc]?LOCATIONS[w.night.loc].n:'this week’s city'} this week — each square opens in the week of its games`;
  const t=typeof travelState==='function'?travelState(w):null;if(t&&!t.paid)return `Pay the road to ${LOCATIONS[li].n} first (${t.cost} coin, on Match Week)`;return null}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ct="square"]');if(!b)return;e.preventDefault();const why=citySquareGate(+b.dataset.li);if(why){if(typeof mToast==='function')mToast('🔒 '+esc(why));return}openCitySquare(+b.dataset.li,{})},true);
