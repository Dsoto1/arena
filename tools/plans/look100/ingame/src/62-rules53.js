/* =====================================================================
   62-RULES53 · ONE OF EACH, SMARTER FOCUS, FAIR HOT SEAT (v0.53)
   =====================================================================
   • Unique gear: every armor piece except the padded/stackable ones (wraps, leg wraps, the belt) exists
     once. The market holds one of each; a loadout takes its pieces OUT of the market. If two gladiators'
     loadouts want the same unique piece, the first seat keeps it and the other gets the closest unused
     piece of the same slot (armor) or level (weapon), noted in the log.
   ===================================================================== */

/* ---------- the market: one of each non-padded armor ---------- */
/* in place, in both the live list and the base copy the gear designer rebuilds from (26-gear) */
const dedupeArmorList=list=>{const seen=new Set();const keep=list.filter(k=>{if(ARM[k]&&ARM[k].stack)return true;if(seen.has(k))return false;seen.add(k);return true});list.length=0;list.push(...keep)};
for(const lv of [1,2,3]){dedupeArmorList(MARKET_A[lv]);if(typeof MARKET_A0!=='undefined')dedupeArmorList(MARKET_A0[lv])}
const isUniqueArmor=key=>!!(ARM[key]&&!ARM[key].stack);

/* standInArmor: closest unused piece for the same slot/part (level first, then AP) */
function standInArmor(key,isTaken){const want=ARM[key];if(!want)return null;
  const pool=Object.keys(ARM).filter(k=>{const a=ARM[k];return k!==key&&!a.stack&&!a.flav&&!a.custom&&a.slot===want.slot&&a.pt===want.pt&&!isTaken(k)});
  const gap=k=>ARM[k].lv<=want.lv?want.lv-ARM[k].lv:10+ARM[k].lv-want.lv; /* same or lower level first */
  pool.sort((a,b)=>gap(a)-gap(b)||Math.abs(ARM[a].ap-want.ap)-Math.abs(ARM[b].ap-want.ap));return pool[0]||null}
/* standInWeapon: same level from the market list, then the nearest level */
function standInWeapon(key,isTaken){const want=W[key];if(!want)return null;
  const pool=[1,2,3].flatMap(lv=>MARKET_W[lv]).filter(k=>k!==key&&W[k]&&!isTaken(k)&&!!W[k].shield===!!want.shield);
  pool.sort((a,b)=>Math.abs(W[a].lv-want.lv)-Math.abs(W[b].lv-want.lv)||Math.abs((W[a].r||1)-(want.r||1))-Math.abs((W[b].r||1)-(want.r||1)));return pool[0]||null}

/* giveLoadout(player): armor, weapons, purse, keys, items, starting CF — with unique pieces kept unique */
giveLoadout=function(p){const C=CLASSES[p.cls];if(!C)return;
  S.uniqueOwners=S.uniqueOwners||{armor:{},weapon:{}};const owners=S.uniqueOwners;
  const takenArmor=k=>owners.armor[k]!=null&&owners.armor[k]!==p.id;const takenWeapon=k=>owners.weapon[k]!=null&&owners.weapon[k]!==p.id;
  const swapped={};const notes=[];
  for(const [key0,loc] of C.armor){let key=key0;
    if(isUniqueArmor(key)){if(swapped[key0])key=swapped[key0];else if(takenArmor(key)){const alt=standInArmor(key,takenArmor);swapped[key0]=alt;if(alt){notes.push(`${ARM[key0].n} → ${ARM[alt].n}`);key=alt}else{notes.push(_T`${ARM[key0].n} (none left)`);continue}}}
    if(!key)continue;
    const standIn=key!==key0;/* a stand-in never beats what the class card printed: it carries the original AP at most */
    if(equipPiece(p,key,loc,standIn?Math.min(ARM[key].ap,ARM[key0].ap):undefined)&&isUniqueArmor(key)&&owners.armor[key]==null){owners.armor[key]=p.id;marketPullArmor(key)}}
  for(const hand of ['R','L']){let key=C[hand];if(!key||!W[key])continue;
    if(takenWeapon(key)){const alt=standInWeapon(key,takenWeapon);notes.push(`${W[key].n} → ${alt?W[alt].n:'nothing'}`);key=alt}
    if(!key)continue;p['w'+hand]=mkW(key);marketPull(key);owners.weapon[key]=p.id}
  p.coin=C.coin;coinLog(p,C.coin,_T('starting purse'));p.keys=C.keys;
  for(const it of C.items)p.items.push(it.startsWith('c:')?mkCard(it.slice(2)):mkOffer(it));
  if(+C.cf>0){cfWhy(_T('class starting CF'));p.cf+=+C.cf;cfWhy(null)}
  if(notes.length&&!S.sim)log(_T`${nm(p)}’s loadout shares pieces with a gladiator already armed — stand-ins: ${notes.join(', ')}.`)};

/* ---------- Focus: the true best location, and dice you roll and click ---------- */
/* locationScore(target, loc, damage): lower is better.
   head/chest put a gladiator out; an arm puts them out only if the other arm is already gone (otherwise it
   costs them one attack and the weapon in that hand); legs only slow them — always the last suggestion. */
function locationScore(q,loc,damage=0){const cost=q.hp[loc]+q.ap[loc];const other={larm:'rarm',rarm:'larm'}[loc];
  const eliminates=loc==='head'||loc==='chest'||(other&&q.hp[other]<=0);
  if(eliminates)return damage>=cost?-100+cost:cost;          /* TWEAK: a finish this blow beats everything */
  if(other)return cost+(damage>=cost?4:8);                     /* TWEAK: severing one arm is worth something */
  return cost+40}                                             /* TWEAK: legs last */
function bestLocation(q,locs,damage){return [...locs].sort((a,b)=>locationScore(q,a,damage)-locationScore(q,b,damage))[0]}
const LOC_TIP={larm:_T('Sever both arms and they are out. One severed arm drops its weapon and costs them 1 attack (2 attacks max per turn).'),rarm:_T('Sever both arms and they are out. One severed arm drops its weapon and costs them 1 attack (2 attacks max per turn).'),
  rleg:_T('A severed leg only slows them (less movement). It never puts them out.'),lleg:_T('A severed leg only slows them (less movement). It never puts them out.'),head:_T('Lose the head and they are out.'),chest:_T('Lose the chest and they are out.')};
const showStrategy=()=>typeof SETTINGS!=='undefined'&&SETTINGS.hints!==false&&SETTINGS.hintDock!==false&&!(typeof S!=='undefined'&&S&&S.hotseat&&!S.over); /* v0.88: no hints at a hot-seat table */
const FOCUS_SETTLE_MS=[650,1050,1450]; /* TWEAK: when each die stops spinning */
chooseLocation=async function(p,q,how,damage=0){
  const alive=LOCS.filter(l=>q.hp[l]>0);
  if(how==='card'){if(p.cpu)return bestLocation(q,alive,damage);
    const best=showStrategy()?bestLocation(q,alive,damage):null;
    return await modal(_T('Focus!'),`<p>${_T`Choose where to strike ${esc(q.name)}.${best?_T(' 💡 Gold is the fastest finish.'):''}`}</p>`,alive.map(l=>({label:`${l===best?'💡 ':''}${LOCN[l]}`,sub:_T`AP ${q.ap[l]} · HP ${q.hp[l]}${l==='larm'||l==='rarm'?' · arm':l==='rleg'||l==='lleg'?_T(' · only slows'):''}`,value:l,primary:l===best})))}
  const rolls=[rollLoc(q),rollLoc(q),rollLoc(q)];
  log(_T`${nm(p)} focuses: the location die shows ${rolls.map(l=>LOCN[l]).join(', ')}.`);
  if(p.cpu)return bestLocation(q,[...new Set(rolls)],damage);
  const best=showStrategy()?bestLocation(q,[...new Set(rolls)],damage):null;
  const faces=['head','chest','larm','rarm','rleg','lleg'];
  const dieHTML=(l,i)=>`<button type="button" class="focdie2 rolling" data-fdie="${i}" data-loc="${l}" disabled><span class="fdface">${locIcon(faces[i%6])}<b>…</b></span><span class="fdsub"></span></button>`;
  const picked=await modal(_T('🎯 Focus roll'),`<p>${_T`Rolling the location die three times for <b>${esc(q.name)}</b>…`}</p><div class="focdice2">${rolls.map(dieHTML).join('')}</div><p class="rc-sub" id="fdHint" style="margin:6px 0 0;visibility:hidden">${_T`Click a die to strike there.${best?_T(' 💡 The gold one finishes fastest.'):''}`}</p>`,[...new Set(rolls)].map(l=>({label:LOCN[l],value:l})),{close:0,onOpen:done=>{
    const bar=$('#mBtns');if(bar)bar.style.display='none'; /* the dice are the buttons; the bar stays for keyboard/automation */
    const box=$('#mBody');const dice=[...box.querySelectorAll('[data-fdie]')];let spin=0;
    const timer=window.FOCUS_TIMER=setInterval(()=>{spin++;dice.forEach((d,i)=>{if(!d.classList.contains('rolling'))return;const f=faces[(spin+i*2)%6];d.querySelector('.fdface').innerHTML=`${locIcon(f)}<b>${LOCN[f]}</b>`})},85);
    dice.forEach((d,i)=>setTimeout(()=>{const l=d.dataset.loc;d.classList.remove('rolling');d.disabled=false;if(l===best)d.classList.add('best');
      d.querySelector('.fdface').innerHTML=`${locIcon(l)}<b>${l===best?'💡 ':''}${LOCN[l]}</b>`;d.querySelector('.fdsub').innerHTML=`${_T`AP ${q.ap[l]} · HP ${q.hp[l]}`} <span class="qi" data-tip="${esc(LOC_TIP[l])}">ⓘ</span>`;
      if(i===dice.length-1){clearInterval(timer);const hint=$('#fdHint');if(hint)hint.style.visibility='visible'}},FOCUS_SETTLE_MS[i]||1500));
    box.addEventListener('click',e=>{const d=e.target.closest('[data-fdie]');if(!d||d.disabled||e.target.closest('.qi'))return;clearInterval(timer);done(d.dataset.loc)})}});
  clearInterval(window.FOCUS_TIMER);try{const bar=$('#mBtns');if(bar)bar.style.display=''}catch(e){}
  return picked};

/* ---------- hot seat: a defender's response is addressed to them, by name ---------- */
let RESPONDER=null; /* the gladiator whose response window is open (not the one whose turn it is) */
{const baseDefend=defend;defend=async function(v){const prev=RESPONDER;if(v&&v.cls&&!v.cpu&&v!==cur())RESPONDER=v;try{return await baseDefend.apply(this,arguments)}finally{RESPONDER=prev}}}
{const baseAsk=askCard;askCard=async function(p){const prev=RESPONDER;if(p&&p.cls&&!p.cpu&&p!==cur())RESPONDER=p;try{return await baseAsk.apply(this,arguments)}finally{RESPONDER=prev}}}
{const baseModal=modal;modal=function(title,body,buttons,opt){if(RESPONDER&&S&&!S.onl&&(S.hotseat||S.players.filter(q=>!q.cpu).length>1)&&typeof title==='string'){const who=typeof hsWho==='function'?hsWho(RESPONDER):RESPONDER.name; /* v0.88: never online; the player's own name */
    title=`🪑 ${who} — ${title}`;if(typeof body==='string')body=`<p class="hsresp" style="border-left:4px solid ${RESPONDER.color};padding-left:8px">${_T`<b>${esc(who)}</b>, this one is yours to answer — pass the device.`}</p>`+body.replace(/your (Head|Chest|Left Arm|Right Arm|Right Leg|Left Leg)/,`${esc(RESPONDER.name)}’s $1`)}
  return baseModal.call(this,title,body,buttons,opt)}}
