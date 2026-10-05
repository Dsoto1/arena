/* =====================================================================
   122-V81PLAY · v0.81 drafts, falling pillars, a steady turn bar
   =====================================================================
   • THE MARKET LISTS: 26-gear rebuilt the market from a copy taken before v0.74/v0.75 added Belt I, the Steel Helm, Leather
     Greaves, the Centurian Helm and the Ornate Chest Armor, so a reset ~1 s after load dropped them (market, drafts, armory).
     The base copy (MARKET_A0) now matches the printed lists, and level 1 holds ONE Belt I + ONE Belt II (was two Belt II).
     (The Chariot chest list in 76-chariot59 got the same belt change.)
   • THE GEAR DRAFT (runDraft replaced): the window shows only this pick's offers, two per row, with the rest of the pool folded
     below. Offers are drawn only from gear that fits the drafter: no weapon once both hands are full, no armor without a free
     spot (one regular piece per equip point, one stackable piece per location). Nothing fits → that gladiator's draft ends early
     (logged). CPUs draft from the same filtered offers. Drafted gear leaves the market, like class loadouts.
   • THE JUGGERNAUT'S 5 DECLARE CARDS come out of the arena deck: only cards still in it are offered (×N left), a taken card is
     removed from the deck. The log still only says "5 declare cards".
   • TOPPLED PILLARS (doTopple replaced): the log names the fall line and the rubble, says "no Blessings left on it" when the pots
     are gone, and names each offering and its tile. The offering lands 3 tiles out on the fall line: a pillar there → one tile
     back; off the sand → the last tile on the sand along the fall line; under a beast it lies there; on a gladiator it is theirs at
     once; on raised floor spikes it falls into them (stepping there to take it costs the spike damage). A gold mark flashes there.
   • THE TURN BAR: the inspect line above it keeps a fixed two-line height (longer text cut with …, full text in its title). On a
     desktop the arena is fitted from the window and the TALLEST dock seen (not the live dock / inspect heights on every draw),
     the stands' real height is counted (07-ui divisor 10.9), and the dock only sticks to the bottom when the window is too short.
   ===================================================================== */

/* ---------- the market lists ---------- */
(function(){
  const L1=MARKET_A[1];
  /* one Belt I + one Belt II at level 1 */
  const bi=L1.indexOf('balteus'),bj=L1.lastIndexOf('balteus');if(bi>=0&&bj>bi)L1.splice(bj,1);
  if(!L1.includes('balteus1'))L1.push('balteus1');
  while(L1.filter(k=>k==='balteus1').length>1)L1.splice(L1.lastIndexOf('balteus1'),1);
  /* the base copy the gear designer rebuilds from = the printed lists as they stand now (no custom pieces yet: loadGear runs at 900 ms) */
  for(const lv of [1,2,3]){const keep=MARKET_A[lv].filter(k=>ARM[k]&&!ARM[k].custom);MARKET_A0[lv].length=0;MARKET_A0[lv].push(...keep)}
})();

/* ---------- the gear draft ---------- */
/* draftFits81 — true if this draft item has somewhere to go on the gladiator right now */
function draftFits81(p,x){
  if(x.kind==='w')return armsAttached(p).some(a=>!p['w'+a]);
  const d=ARM[x.k];if(!d)return false;
  return sideLocs(d).some(l=>p.hp[l]>0&&!armorConflict(p,l,x.k))}
/* draftPull81 — drafted gear leaves the market */
function draftPull81(x){try{if(!S||!S.market)return;if(typeof mktFix75==='function')mktFix75();if(x.kind==='w')marketPull(x.k);else marketPullArmor(x.k)}catch(e){console.error(e)}}
const itemName81=x=>x.kind==='w'?W[x.k].n:ARM[x.k].n;
runDraft=async function(){
  const ev=EVENTS[S.evKey];const pool=[];let uidD=0;
  const maxLv=player=>ev.teams==='jugg'&&player.team!=='J'?2:3;
  for(const lv of [1,2,3]){for(const k of MARKET_W[lv])pool.push({id:uidD++,kind:'w',k,lv});for(const k of MARKET_A[lv])pool.push({id:uidD++,kind:'a',k,lv})}
  const picks=player=>ev.draft.all||(player.team==='J'?ev.draft.jugg:ev.draft.team);
  const maxRounds=Math.max(...S.players.map(picks));
  const OFFER=8;
  log(_T`Snake draft: ${S.players.map(player=>_T`${player.name} ${picks(player)} picks`).join(', ')}. Each pick offers a random ${OFFER} of the remaining level 1-3 weapons and armor that still fit the gladiator.`,'hd');
  const done=new Set();let order=S.players.map(player=>player.id);
  for(let rd=0;rd<maxRounds;rd++){
    for(const id of order){const p=S.players[id];
      if(rd>=picks(p)||done.has(p.id))continue;
      const left=pool.filter(x=>!x.by&&x.lv<=maxLv(p));if(!left.length)continue;
      const fit=left.filter(x=>draftFits81(p,x));
      if(!fit.length){done.add(p.id);log(_T`${nm(p)}'s draft ends early: both hands are full and every spot is covered.`);continue}
      const offered=new Set(shuffle([...fit]).slice(0,OFFER).map(x=>x.id));
      const avail=fit.filter(x=>offered.has(x.id));
      let pick;
      if(p.cpu)pick=cpuDraftPick(p,avail);
      else{
        const ord=(a,b)=>(a.kind>b.kind?-1:a.kind<b.kind?1:0)||a.lv-b.lv;
        const grid=[...avail].sort(ord).map(x=>({label:itemName81(x),sub:_T`LV${x.lv} · ${x.kind==='w'?wStats(mkW(x.k)):armorDesc(x.k)}`,value:x.id,style:'border-color:var(--gold)',card:(x.kind==='w'?'w:':'a:')+x.k}));
        const rest=[...pool].filter(x=>!offered.has(x.id)).sort(ord);
        const chip=x=>{if(x.by){const q=S.players[x.by-1];return `<span class="pc81 tk81" style="border-color:${q.color}" title="${_T`taken by ${esc(q.name)}`}">${esc(itemName81(x))}<i>${esc(q.name)}</i></span>`}
          const why=x.lv>maxLv(p)?_T('above your draft level'):!draftFits81(p,x)?_T('no free spot'):_T('not offered this pick');
          return `<span class="pc81" title="${why}">${_T`${esc(itemName81(x))}<i>LV${x.lv}</i>`}</span>`};
        const idx=await modal(_T`Draft · ${p.name} · pick ${rd+1} of ${picks(p)}`,`<p>${_T`Choose one weapon or armor from the <b style="color:var(--gold2)">${avail.length} offered</b> this pick. Weapons go to a free hand; armor equips straight away.`}</p><div class="pickgrid two81" id="pickgrid"></div><details class="pool81"><summary>${_T`Rest of the pool · ${rest.length}`}</summary><div class="pool81b">${rest.map(chip).join('')}</div></details>`,[],{wide:1,grid});
        pick=avail.find(x=>x.id===idx)||avail[0]}
      pick.by=p.id+1;
      log(_T`${nm(p)} drafts <b>${itemName81(pick)}</b>.`);
      draftPull81(pick);
      if(pick.kind==='w')await gainWeapon(p,pick.k);else await gainArmorPiece(p,pick.k);
      render()}
    order.reverse()}
  if(ev.teams==='jugg'){const j=S.players.find(player=>player.team==='J');
    if(j){const deck=Array.isArray(S.deck)?S.deck:null;
      const leftN=k=>deck?deck.slice(1).filter(x=>x===k).length:1;
      for(let i=0;i<5;i++){let k;const opts=DECLARE_PICKS.filter(x=>leftN(x)>0);if(!opts.length)break;
        if(j.cpu){k=['ward','focus','forge3','hercules2','rete','hercules1','forge2','hygeia','ammo','mchoice','discount','lure','lyre'].find(x=>opts.includes(x))||opts[0]}
        else k=await modal(_T`Juggernaut card ${i+1} of 5`,`<p>${_T`Choose a Declare-type arena card. The card leaves the arena deck.`}</p><div class="pickgrid two81 jc81" id="pickgrid"></div>`,[],{wide:1,grid:opts.map(x=>({label:CARDS[x].n,sub:_T`×${leftN(x)} left · ${CARDS[x].d}`,value:x,card:'c:'+x}))});
        if(!k||!opts.includes(k))k=opts[0];
        if(deck){const at=deck.lastIndexOf(k);if(at>0)deck.splice(at,1)}
        j.items.push(mkCard(k))}
      log(_T`${nm(j)} chooses 5 declare cards.`)}}
};
(()=>{const st=document.createElement('style');st.textContent=`.pickgrid.two81{grid-template-columns:repeat(2,minmax(0,1fr));max-height:none;overflow:visible;gap:8px}
.pickgrid.two81 .btn{display:flex;align-items:center;gap:10px;text-align:left;justify-content:flex-start;min-height:64px}
.pickgrid.two81 .btn .cimg{flex:none}
.pickgrid.two81 .btn .cimg.xs{zoom:1.9}
.pickgrid.two81 .btn small{display:block}
.pool81{margin-top:10px;font-size:12.5px;color:var(--muted)}.pool81 summary{cursor:pointer;color:var(--bone)}
.pool81b{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;max-height:30vh;overflow:auto}
.pc81{display:inline-flex;gap:5px;align-items:baseline;border:1px solid var(--line2,#555);border-radius:999px;padding:2px 8px;opacity:.7}
.pc81 i{font-style:normal;font-size:11px;color:var(--muted)}.pc81.tk81{border-width:2px;opacity:1}`;document.head.appendChild(st)})();

/* ---------- toppled pillars ---------- */
let TOP81=null;
/* landing81 — where a toppled pillar's offering comes to rest, and why */
function landing81(pillar,dr,dc){let k=3,why='';
  while(k>0&&!inB(pillar.r+dr*k,pillar.c+dc*k)){k--;why='edge'}
  while(k>0&&pillarAt(pillar.r+dr*k,pillar.c+dc*k)){k--;why='back'}
  return {r:pillar.r+dr*k,c:pillar.c+dc*k,why}}
doTopple=async function(player,pillar){
  player.mv-=3;
  const dr=pillar.r-player.r,dc=pillar.c-player.c;
  S.pillars=S.pillars.filter(x=>x!==pillar);
  stat(player,'topple');crowdReact('topple',{p:player});
  (S.rubble||(S.rubble=[])).push({r:pillar.r,c:pillar.c,dr,dc});
  shake();fx(pillar.r,pillar.c,_T('CRASH!'),'#e6d3b0',{big:1});
  const rub=[0,1,2].map(k=>[pillar.r+dr*k,pillar.c+dc*k]).filter(([r,c])=>inB(r,c)).map(([r,c])=>tl(r,c));
  const far=[3,2,1].map(k=>[pillar.r+dr*k,pillar.c+dc*k]).find(([r,c])=>inB(r,c));
  log(_T`${nm(player)} topples the pillar at ${tl(pillar.r,pillar.c)}${far?_T` toward ${tl(far[0],far[1])}`:''}! Rubble on ${rub.join(', ')}${pillar.pots.length?'':_T(' — no Blessings left on it')}.`,'big');
  for(const k of [1,2]){const r=pillar.r+dr*k,c=pillar.c+dc*k;if(!inB(r,c))continue;
    const q=playerAt(r,c);
    if(q&&q!==player){if(inTruce(player,q)){S.truces.delete(truceKey(player.id,q.id));log(_T`${nm(player)} breaks the truce with ${nm(q)}!`,'bad')}
      await hurt(q,rollLoc(q),3,{type:'player',p:player},_T('Falling pillar'));bumpRel(q,player,-15,_T('dropped a pillar on them'))}
    const n=npcAt(r,c);if(n)hurtNPC(n,3,player,_T('Falling pillar'))}
  if(pillar.pots.length){const L=landing81(pillar,dr,dc);TOP81=L;
    try{await breakPot(pillar,player,[L.r,L.c],true)}finally{TOP81=null}}
  checkMandata(player);checkEnd()};
{const base=revealOffering;revealOffering=async function(player,off,land){
  const L=TOP81;if(!L||off==='spiders'||off==='curse'||!OFFER[off]||!land)return base.apply(this,arguments);
  const r=L.r,c=L.c,O=OFFER[off];
  placeFloor('offer',off,r,c);
  const q=playerAt(r,c),n=npcAt(r,c);
  const note=L.why==='back'?_T(' A pillar stands in the way: it lands one tile back.'):L.why==='edge'?_T(' It rolls to the edge of the sand.'):'';
  const where=q?_T` — right at ${nm(q)}'s feet`:n?_T` — it lies under ${nm(n)}`:spikeAt(r,c)?_T(' — it falls into the spikes'):'';
  log(_T`The offering falls onto ${tl(r,c)}: <b>${O.n}</b> (${O.s})${where}.${note}`);
  fx(r,c,'✦','#f0cf7d',{big:1});
  await pickupAt(r,c)}}

/* ---------- the turn bar ---------- */
const FIT81={key:'',dock:0,res:0};
const deskFit81=()=>!document.body.classList.contains('phoneL')&&!document.body.classList.contains('phoneP2')&&!(typeof phoneLand==='function'&&phoneLand());
{const base=fitReserve;fitReserve=function(){
  if(!deskFit81())return base.apply(this,arguments);
  try{const wrap=cv.parentElement;const top=Math.max(0,Math.round(wrap.getBoundingClientRect().top+scrollY));
    const dock=document.getElementById('actions');const dh=dock&&dock.offsetParent?dock.offsetHeight:0;
    const key=innerWidth+'x'+innerHeight+'|'+top+'|'+(typeof STANDS!=='undefined'?STANDS:'');
    if(key!==FIT81.key){FIT81.key=key;FIT81.dock=0;FIT81.hv=0}
    /* the tallest dock this window has seen (a fixed floor for the Action phase's button rows): grows rarely, never shrinks */
    const want=Math.max(170,dh);if(want>FIT81.dock+4)FIT81.dock=want;
    const hv=document.getElementById('hover');const hh0=hv&&hv.offsetParent?hv.offsetHeight:0;const hh=FIT81.hv=Math.max(FIT81.hv||0,hh0); /* v0.88: the hover line comes and goes on CPU turns — keep its tallest height so the arena never jumps */
    const tk=document.getElementById('crowdTick');const th=tk&&!tk.hidden&&tk.offsetParent?tk.offsetHeight+6:0;
    const res=Math.max(200,Math.min(innerHeight*0.62,top+FIT81.dock+hh+th+24));
    FIT81.res=res;
    document.body.classList.toggle('dockfit81',innerHeight-res>=360);
    return res}catch(e){return base.apply(this,arguments)}}}
addEventListener('resize',()=>{FIT81.key=''});
/* the inspect line: two lines, cut with …, full text in the title */
(function(){const hv=document.getElementById('hover');if(!hv)return;let busy=false;
  const upd=()=>{if(busy)return;busy=true;try{const t=(hv.textContent||'').replace(/\s+/g,' ').trim();if(hv.title!==t)hv.title=t;
    hv.classList.toggle('cut81',hv.scrollHeight>hv.clientHeight+2)}catch(e){}busy=false};
  new MutationObserver(()=>upd()).observe(hv,{childList:true,subtree:true,characterData:true});upd()})();
(()=>{const st=document.createElement('style');st.textContent=`body:not(.phoneL):not(.phoneP2) #hover.hover{height:2.9em;line-height:1.45em;min-height:0;overflow:hidden;position:relative;box-sizing:content-box}
body:not(.phoneL):not(.phoneP2) #hover.hover .rulehint{display:inline;margin:0 0 0 6px;padding:0;border:0;font-size:12.5px;line-height:inherit}
body:not(.phoneL):not(.phoneP2) #hover.hover .rulehint::before{content:'· '}
body:not(.phoneL):not(.phoneP2) #hover.hover.cut81::after{content:'…';position:absolute;right:0;bottom:0;padding-left:14px;color:var(--bone);background:linear-gradient(90deg,transparent,var(--bg,#14100c) 45%)}
body.dockfit81:not(.phoneL):not(.phoneP2) #actions.dock{position:relative;bottom:auto}`;document.head.appendChild(st)})();
