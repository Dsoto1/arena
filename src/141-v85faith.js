/* =====================================================================
   141-V85FAITH · v0.85 — FAITH: pagans and Christians (Virgilante, approved 2026-10-04)
   =====================================================================
   1. EVERY FIGHTER is PAGAN or CHRISTIAN (no other cults, no conversions). Manager fighters (league, free agents,
      recruits, rivals') get g.faith once: genGlad wrapper at creation; older careers lazily (faithOf85) and in one
      sweep on load (mgrMigrate wrapper + SAVE_MIGRATIONS '0.85', saved once by an openManager wrapper). The roll is
      deterministic from the fighter id (hashStr → mulberry32, never the dice RNG): FAITH85.rate ≈ 1 in 10.
      A Studio character joins a career with its own faith (gladFromCustom wrapper). Online characters have none.
   2. OPEN — a ✝ chip (.fa85, tooltip "Christian") in every fighter list (gTags wrapper), on the record card
      (detailHTML wrapper), on the player board in play (boardHTML wrapper; p.faith85 from the seat, or the Studio
      character's field). Pagans show nothing. A martyr's chip reads "✝ Martyr".
   3. TEMPLE — Christians take no boost from the pagan offerings (boostFor wrapper runs the chain with w.night.god76
      cleared for them); the temple card says "✝ X will not honour the gods" (templeHTML76 wrapper).
   4. BOND — while two or more Christians share a ludus, each gains FAITH85.bond morale a week (endWeek); the first
      time in your house, a letter from your barracks.
   5. JEERS — the crowds of FAITH85.jeerCities (Roma, Thysdrus, Arles, Leptis Magna) jeer Christians: −FAITH85.jeer
      CF at the first turn (seatFor → seat.jeer85 → mkPlayer → a beginTurn wrapper), never below 0; a note on
      Match Week when it applies.
   6. THE GOVERNOR'S EDICT — at the start of a week (endWeek wrapper, after the base), now and then (FAITH85.edictP,
      ≤ FAITH85.maxEdicts a season; seeded per career + week) a governor issues an edict in a city: the week's host
      city or another. Christians whose house fights in or near it, or whose home it is, may be named (cases).
      DENOUNCE: a rival house bitter enough (rivalry ≥ FAITH85.denHeat) may name one of yours — an edict for him
      alone, the letter names the house. Your case: a letter + a Match Week card with
      🌙 Hide him (sits out the week: pulled from his bout, not entered) · 💰 Bribe the magistrate (coin, chance;
      a failed bribe leaves Face or Refuse) · 🦁 Face the beasts · 🔥 He will not fight (Ad Flamma).
      Rival houses decide at once (hide / bribe / face / refuse). Undecided at the week's end → he is taken (Face).
   7. AD BESTIAS — every faced case of the edict (yours, rivals', free agents') fights together, PvE only, against a
      lion, a bear and two wolves (EVENTS.bestias85, hidden, non-enumerable; every beast slain or the time ends it; no deck/market/crowd/Fates, the
      editor calls the beasts back after FAITH85.rot rotations). Filled to FAITH85.seats with condemned Damnatio CPUs.
      ⚔ Fight it yourself (live, like the beast pen) or ⏩ Let the sand decide (simEvent); unplayed ones run at the
      week's end. Survivors are pardoned: +fame, +morale. The fallen die as martyrs.
   8. AD FLAMMA / MARTYRS — refusing to fight = the printed Damnatio Fate Ad Flamma (its card + text), death by
      killFighter. Anyone who dies under an edict is a martyr: g.martyr85, the grave line "✝ Martyr · …", a ✝ Martyr
      chip, +FAITH85.martyrMorale morale to the believers of his house.
   9. MEMORIAL — faithMark85(g): '✝' for a Christian, 'D · M' for a pagan (the programmata memorial, 140-v84prog).
  10. STUDIO — a Faith field (Pagan / Christian) on Studio characters (charEditorHTML wrapper, data-f="faith"), the
      ✝ chip on their row; in Play Now it is only the chip.
   ===================================================================== */
const FAITH85={rate:0.1,bond:2,martyrMorale:6,jeer:2,jeerCities:['Roma','Thysdrus','Arles','Leptis Magna'],edictP:0.2,maxEdicts:4,
  risk:{host:0.4,near:0.25,home:0.3,free:0.5},nearD:0.2,maxCases:6,denHeat:40,denP:0.06,bribeP:0.65,
  beasts:[['lion',6,6],['bear',5,7],['wolf',7,5],['wolf',5,5]],rot:8,seats:4,npcHp:180,npcDmg:0,survFame:3,survMorale:8,force:null};
const fa85R=(w,k)=>mulberry32(hashStr('faith85:'+((w&&w.id)||'')+':'+k));
function faithRoll85(id){return mulberry32(hashStr('faith85|'+id)).next()<FAITH85.rate?'christian':'pagan'}
function faithOf85(g){if(!g)return 'pagan';if(g.faith!=='christian'&&g.faith!=='pagan')g.faith=faithRoll85(g.id||g.name);return g.faith}
const isChr85=g=>!!g&&faithOf85(g)==='christian';
function faithEnsure85(w){let n=0;for(const g of (w&&w.glads)||[])if(g.faith!=='christian'&&g.faith!=='pagan'){g.faith=faithRoll85(g.id||g.name);n++}return n}
/* the memorial mark: the programmata wall (140-v84prog) and anything else that honours the dead */
function faithMark85(g){return g&&(g.faith==='christian'||g.martyr85)?'✝':'D · M'}
const chip85=g=>!g?'':g.martyr85?`<span class="fa85 m" data-tip="A martyr: died under the governor's edict" aria-label="Christian martyr">✝ Martyr</span>`:isChr85(g)?`<span class="fa85" data-tip="Christian" aria-label="Christian">✝</span>`:'';
const he85=(g,cap)=>{const x=g&&g.fem?'she':'he';return cap?x[0].toUpperCase()+x.slice(1):x};
const hm85=g=>g&&g.fem?'her':'him';
const chipFaith85=f=>f==='christian'?`<span class="fa85" data-tip="Christian" aria-label="Christian">✝</span>`:'';
/* ---------- 1. faith at creation, old careers once ---------- */
{const base=genGlad;genGlad=function(){const g=base.apply(this,arguments);try{if(g&&!g.faith)g.faith=faithRoll85(g.id)}catch(e){}return g}}
{const base=gladFromCustom;gladFromCustom=function(c){const g=base.apply(this,arguments);try{if(g&&c)g.faith=c.faith==='christian'?'christian':'pagan'}catch(e){}return g}}
SAVE_MIGRATIONS.push(['0.85',w=>{faithEnsure85(w)}]);
{const base=mgrMigrate;mgrMigrate=function(w){const o=base.apply(this,arguments);try{if(o&&o.glads&&faithEnsure85(o))o._fa85dirty=1}catch(e){console.error(e)}return o}}
{const base=newWorld;newWorld=function(){const r=base.apply(this,arguments);try{const w=W_();if(w)faithEnsure85(w)}catch(e){console.error(e)}return r}}
{const base=openManager;openManager=async function(){const r=await base.apply(this,arguments);try{const w=W_();if(w&&w._fa85dirty){delete w._fa85dirty;saveWorld()}}catch(e){}return r}}
const fa85State=w=>w.fa85=w.fa85||{edicts:[],ss:{},first:{}};
/* ---------- 2. the chip ---------- */
{const base=gTags;gTags=function(g){const h=base.apply(this,arguments);try{return chip85(g)+h}catch(e){return h}}}
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{const c=chip85(g);if(c){h=h.replace(c,"");const k='>'+esc(g.name)+' ';const i=h.indexOf(k);if(i>=0)h=h.slice(0,i+k.length)+c+' '+h.slice(i+k.length)}}catch(e){console.error(e)}return h}}
function pFaith85(p){if(!p)return '';if(p.faith85)return p.faith85;const C=CLASSES[p.cls];if(C&&C.custom&&C.cid&&typeof CUSTOM!=='undefined'){const c=(CUSTOM.chars||[]).find(z=>z.id===C.cid);return c&&c.faith==='christian'?'christian':''}return ''}
{const base=boardHTML;boardHTML=function(player){let h=base.apply(this,arguments);try{if(player&&!(S&&S.onl)&&pFaith85(player)==='christian')h=h.replace(/(<div class="pname">)([^<]*)/,(a,b,c)=>`${b}${c} ${chipFaith85('christian')}`)}catch(e){}return h}}
/* ---------- 3. the temple ---------- */
const myChr85=()=>{const m=me();return m?rosterOf(m).filter(isChr85):[]};
{const base=boostFor;boostFor=function(g){const w=W_();if(g&&w&&w.night&&w.night.god76&&isChr85(g)){const k=w.night.god76;w.night.god76=null;try{return base.apply(this,arguments)}finally{w.night.god76=k}}return base.apply(this,arguments)}}
{const base=templeHTML76;templeHTML76=function(){const h=base.apply(this,arguments);try{if(!h)return h;const C=myChr85();if(!C.length)return h;const i=h.lastIndexOf('</div>');
  return h.slice(0,i)+`<div class="rc-sub fa85t">✝ ${C.map(g=>esc(g.name)).join(', ')} will not honour the gods — no blessing for ${C.length===1?hm85(C[0]):'them'}.</div>`+h.slice(i)}catch(e){return h}}}
/* ---------- 5. the jeering crowds ---------- */
const jeerCity85=li=>!!(LOCATIONS[li]&&FAITH85.jeerCities.includes(LOCATIONS[li].n));
{const base=seatFor;seatFor=function(g){const s=base.apply(this,arguments);try{if(s&&isChr85(g)){s.faith85='christian';const w=W_();if(w&&w.night&&jeerCity85(w.night.loc))s.jeer85=FAITH85.jeer}}catch(e){}return s}}
{const base=mkPlayer;mkPlayer=function(i,s){const p=base.apply(this,arguments);try{if(p&&s){if(s.faith85)p.faith85=s.faith85;if(s.jeer85)p.jeer85=s.jeer85}}catch(e){}return p}}
{const base=beginTurn;beginTurn=async function(){try{if(S&&!S._jeer85&&S.players&&!S.onl){S._jeer85=1;for(const p of S.players)if(p.jeer85&&p.alive){const d=Math.min(Math.max(0,p.cf),p.jeer85);if(d){cfWhy('the crowd jeers a Christian');p.cf-=d}
  log(`The crowd of ${esc((LOCATIONS[S.locIdx]||{}).n||'the city')} jeers <b>${esc(p.name)}</b>, a Christian${d?` (−${d} CF)`:''}.`,'thought')}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* ---------- 6. edicts ---------- */
const cityN85=li=>LOCATIONS[li]?LOCATIONS[li].n:'?';
const near85=(a,b)=>{const A=LOCATIONS[a],B=LOCATIONS[b];return !!(A&&B)&&a!==b&&Math.hypot(A.x-B.x,A.y-B.y)<FAITH85.nearD};
const bribeCost85=g=>Math.round(12+effOvr(g)*0.3+(g.fame||0)*0.1);
const curEdicts85=w=>(fa85State(w).edicts||[]).filter(E=>E.s===w.season&&E.wk===w.week);
function caseOf85(w,g){if(!w||!g)return null;for(const E of curEdicts85(w)){const c=E.cases.find(x=>x.gid===g.id);if(c)return {E,c}}return null}
/* busy: not to be entered this week (an undecided case, hidden, or held for the beasts) */
function busy85(g){const w=W_();const x=caseOf85(w,g);return !!x&&['open','hid','face'].includes(x.c.st)}
/* take a fighter off this week's card — a free agent fills the seat (the withdraw path, without the editor's count) */
function pull85(w,gid){if(!w.night)return;for(const b of w.night.bouts){if(b.done)continue;const i=b.ents.indexOf(gid);if(i<0)continue;const T=TIERS[b.tier]||{lo:50,hi:70};const used=new Set(w.night.bouts.flatMap(x=>x.ents));
  const rep=freeAgents().find(q=>!used.has(q.id)&&!q.inj&&!busy85(q)&&effOvr(q)>=T.lo-3&&effOvr(q)<=T.hi+3)||genGlad({ovr:T.lo+5});if(!rep.debut)rep.debut={s:w.season,wk:w.week};if(!gById(rep.id))w.glads.push(rep);b.ents[i]=rep.id;voidBets(b,gid)}}
function edictLetter85(w,E,cs){const gs=cs.map(c=>gById(c.gid)).filter(Boolean);if(!gs.length)return;const R=E.den?mgrById(E.den):null;const city=cityN85(E.city);const g=gs[0];
  const nl=gs.map(x=>`<b>${esc(x.name)}</b>`);const names=nl.length>1?nl.slice(0,-1).join(', ')+' and '+nl[nl.length-1]:nl[0];const one=gs.length===1;
  sendLetter(w,{key:'fa85-'+E.id,kind:'letter',from:'the Consilium',adv:'consilium',seal:'✝',until:w.week,
    title:R?`${R.ludus} denounces ${g.name}`:`The governor of ${city} issues an edict`,
    body:`<p>${R?`Men of <b>${esc(R.ludus)}</b> have named ${names} to the magistrates as a Christian. The governor of <b>${esc(city)}</b> orders ${hm85(g)} brought in.`:`The governor of <b>${esc(city)}</b> orders that those who will not sacrifice to the gods be brought before him. ${names} of our house ${one?'is':'are'} named.`}</p>
      <p class="rc-sub">Decide this week. Hidden, a fighter sits the week out. A bribe may strike a name. Facing it means the beasts, beside the other condemned — a fighter may live. Refusing to fight means the fire.</p>
      ${gs.map(x=>`<div class="fa85lrow">${one?'':`<b>${esc(x.name)}</b>`}<div class="fa85box" data-fa85box="${E.id}|${x.id}"></div></div>`).join('')}`})}
function caseButtons85(E,c){const g=gById(c.gid);const m=me();if(!g)return '';const cost=bribeCost85(g);const b=(a,l,s,dis)=>`<button class="btn tksm" type="button" data-fa85="${a}|${E.id}|${g.id}" ${dis?`disabled title="${esc(dis)}"`:''}>${l}<small>${s}</small></button>`;
  if(c.st!=='open')return `<p class="rc-sub fa85done">${caseLine85(E,c)}</p>`;
  return `<div class="acts fa85acts">${b('hide','🌙 Hide '+hm85(g),'sits out this week',c.bribeFail?'The magistrate knows where to look':'')}${b('bribe',`💰 Bribe · ${cost} coin`,`${Math.round((FAITH85.bribeP-(E.den?0.15:0))*100)}% · the coin is gone either way`,c.bribeFail?'Already tried':m&&m.coin<cost?'Not enough coin':'')}${b('face','🦁 Face the beasts','with the other condemned')}${b('refuse',`🔥 ${he85(g,1)} will not fight`,`Ad Flamma — ${he85(g)} dies`)}</div>`}
function caseLine85(E,c){const g=gById(c.gid)||{name:c.n||'?'};const n=esc(g.name||c.n);
  return {hid:`🌙 ${n} is hidden this week.`,bribed:`💰 The magistrate struck ${n}'s name.`,face:`🦁 ${n} is held for the beasts.`,flamma:`🔥 ${n} would not fight — Ad Flamma. A martyr.`,free:`🕊 ${n} survived the beasts and is pardoned.`,martyr:`✝ ${n} died before the beasts. A martyr.`,open:`${n} awaits your decision.`}[c.st]||''}
function newEdict85(w,city,den,only){const S5=fa85State(w);const E={id:'e85_'+w.season+'_'+w.week+'_'+S5.edicts.length,s:w.season,wk:w.week,city,den:den||null,cases:[],done:0};
  const R=fa85R(w,'cases'+E.id);const add=(g,st)=>{const m=g.contract?mgrById(g.contract.mgr):null;E.cases.push({gid:g.id,n:g.name,mgr:m?m.id:null,st:st||'open'})};
  if(only)for(const g of only)add(g);
  else{const host=w.night?w.night.loc:null;
    for(const g of w.glads.filter(g=>g.alive&&isChr85(g)&&!g.inj&&!g.lanista&&!caseOf85(w,g))){if(E.cases.length>=FAITH85.maxCases)break;const hc=LOCATIONS.findIndex(L=>L&&L.n===g.city);
      let p=host===city?FAITH85.risk.host:near85(host,city)?FAITH85.risk.near:0;if(hc===city)p=Math.max(p,FAITH85.risk.home);if(!g.contract)p*=FAITH85.risk.free;if(p&&R.next()<p)add(g)}}
  S5.edicts.unshift(E);S5.edicts=S5.edicts.slice(0,16);S5.ss[w.season]=(S5.ss[w.season]||0)+1;
  const me0=me();const mine=E.cases.filter(c=>c.mgr===me0.id);const names=E.cases.map(c=>esc(c.n));
  mnews(den?`✝ ${esc(mgrById(den).ludus)} denounces <b>${names.join(', ')}</b> as a Christian. The governor of ${esc(cityN85(city))} has the fighter brought in.`
    :`✝ The governor of ${esc(cityN85(city))} issues an edict against the Christians.${names.length?` Named: ${names.join(', ')}.`:' No fighter of the league is named.'}`,mine.length?'bad':'');
  if(mine.length)edictLetter85(w,E,mine);for(const c of mine){tnews(`✝ ${esc(c.n)} is named in the edict of ${esc(cityN85(city))} — decide on Match Week.`,'bad')}
  aiCases85(w,E);return E}
/* rival houses and free agents decide at once */
function aiCases85(w,E){const me0=me();for(const c of E.cases){if(c.st!=='open'||c.mgr===me0.id)continue;const g=gById(c.gid);const m=c.mgr?mgrById(c.mgr):null;const R=fa85R(w,'ai'+E.id+c.gid);const x=R.next();
  if(m&&x<0.4){c.st='hid';pull85(w,g.id)}
  else if(m&&x<0.6&&m.coin>=bribeCost85(g)+20){m.coin-=bribeCost85(g);if(R.next()<FAITH85.bribeP-(E.den?0.15:0))c.st='bribed';else c.st=R.next()<0.2?'flamma':'face'}
  else c.st=R.next()<0.2?'flamma':'face';
  if(c.st==='face'||c.st==='flamma')pull85(w,g.id)}}
/* the week's faith: bonds, a new edict, a denunciation */
function faithWeek85(w){if(!w||w.tutorial||w.dead||!w.night)return;faithEnsure85(w);const S5=fa85State(w);const pm=me();
  for(const m of w.mgrs){if(m.dead)continue;const C=rosterOf(m).filter(isChr85);if(C.length<2)continue;for(const g of C)g.morale=clamp((g.morale||50)+FAITH85.bond,0,100);
    if(m.isPlayer&&!S5.first.bond){S5.first.bond=w.week;sendLetter(w,{key:'fa85bond',kind:'letter',from:'your barracks',adv:'barracks',seal:'✝',until:w.week+1,title:'The Christians keep together',
      body:`<p>${C.map(g=>`<b>${esc(g.name)}</b>`).join(', ')} pray together before dawn. While two or more of them share the barracks, each takes heart: +${FAITH85.bond} morale a week.</p>`});tnews(`✝ ${C.map(g=>esc(g.name)).join(', ')} keep together: +${FAITH85.bond} morale a week.`)}}
  const R=fa85R(w,'edict'+w.season+'_'+w.week);const force=FAITH85.force;if(force)FAITH85.force=null;
  if(force==='edict'||((S5.ss[w.season]||0)<FAITH85.maxEdicts&&R.next()<FAITH85.edictP)){const city=R.next()<0.5&&w.night.loc?w.night.loc:1+Math.floor(R.next()*12);newEdict85(w,city)}
  const mine=rosterOf(pm).filter(g=>isChr85(g)&&!caseOf85(w,g)&&!g.inj);
  if(mine.length){const hot=w.mgrs.filter(m=>!m.isPlayer&&!m.dead&&(m.rivalry||0)>=FAITH85.denHeat).sort((a,b)=>(b.rivalry||0)-(a.rivalry||0))[0];const D=fa85R(w,'den'+w.season+'_'+w.week);
    if(hot&&(force==='denounce'||D.next()<FAITH85.denP+((hot.rivalry||0)-FAITH85.denHeat)/1000)){const g=mine[Math.floor(D.next()*mine.length)];newEdict85(w,w.night.loc||travelHome(pm),hot.id,[g])}}}
/* ---------- 7/8. the sentence ---------- */
function martyr85(w,g,how,city){if(!g||g.alive===false)return;const m=g.contract?mgrById(g.contract.mgr):null;const F=FATES.find(f=>f.n===how)||{g:'Damnatio',n:how};
  g.martyr85={how,s:w.season,wk:w.week,city};g.faith='christian';killFighter(g,m,{g:'✝ Martyr · '+F.g,n:F.n},city);
  if(m){const kin=rosterOf(m).filter(isChr85);for(const x of kin)x.morale=clamp((x.morale||50)+FAITH85.martyrMorale,0,100);
    if(m.isPlayer&&kin.length)tnews(`✝ ${kin.map(x=>esc(x.name)).join(', ')} mourn ${esc(g.name)} and take heart: +${FAITH85.martyrMorale} morale.`)}
  mnews(`✝ <b>${esc(g.name)}</b>${m?` of ${esc(m.ludus)}`:''} dies a martyr at ${esc(city)} — ${esc(F.n)}.`,m&&m.isPlayer?'bad':'')}
function pardon85(w,g,r,city){g.fame=clamp((g.fame||0)+FAITH85.survFame,0,100);g.morale=clamp((g.morale||50)+FAITH85.survMorale,0,100);g.fat=Math.min(100,(g.fat||0)+(typeof FAT_EXH!=='undefined'?FAT_EXH:12));
  if(r){g.rec.kn=(g.rec.kn||0)+(r.kn||0);for(const l of r.severed||[])if(!(g.severed||[]).includes(l))(g.severed=g.severed||[]).push(l)}
  ghist(g,`survived the beasts at ${city} under the governor's edict — pardoned`);const m=g.contract?mgrById(g.contract.mgr):null;
  mnews(`🕊 <b>${esc(g.name)}</b>${m?` of ${esc(m.ludus)}`:''} survives the beasts at ${esc(city)} and is pardoned.`,m&&m.isPlayer?'big':'')}
function bestiasDef85(loc,n){const starts=[[12,4],[12,8],[8,12],[4,12],[0,4],[0,8],[4,0],[8,0]];
  return {custom:true,cid:'bestias85',bestias85:1,img:null,n:'Ad Bestias',short:'Ad bestias',tag:'Edict',loc,min:1,max:8,deck:0,mandata:0,teams:0,coop:0,noTruce:1,noMarket:true,draft:null,loadout:'class',
    classes:Object.keys(CLASSES),blurb:'The condemned of the edict, against the beasts.',noSpect:true,nofates:true,
    rounds:[{n:'Ad bestias',zone:1,pve:1,pvp:0,cf:1,ca:1,end:'survive',endN:FAITH85.rot,reward:{win:0}}],
    layout:{pillars:PILLARS.map(([r,c])=>({r,c,pot:null})),tunnels:[],spikes:[],chest:null,npcs:FAITH85.beasts.map(([t,r,c],i)=>({key:t+i,t,name:NPCT[t].n,r,c,beh:'hunt'})),items:[],starts:starts.slice(0,n)},
    start:{},npcHp:FAITH85.npcHp,npcDmg:FAITH85.npcDmg,priceMul:1,spect:0,limits:{},chariotOffers:0,optOffers:false,eaglePot:false,noCards:[]}}
function bestiasCfg85(w,E,humanGid){const faced=E.cases.filter(c=>c.st==='face').map(c=>gById(c.gid)).filter(g=>g&&g.alive!==false);
  const seats=faced.map(g=>{const m=g.contract?mgrById(g.contract.mgr):null;return seatFor(g,m?m.color:null,g.id===humanGid)});
  const fill=Math.max(0,FAITH85.seats-seats.length);E.fill=E.fill&&E.fill.length===fill?E.fill:Array.from({length:fill},()=>genName({female:Math.random()<.3}));
  for(const n of E.fill)seats.push({cls:'damnatio',cpu:true,diff:'easy',name:n,rating:45,faith85:'christian'});
  Object.defineProperty(EVENTS,'bestias85',{value:bestiasDef85(E.city,seats.length),enumerable:false,configurable:true,writable:true});
  return {ev:'bestias85',loc:E.city,seats,opts:{mods:false,mandata:false,optOffers:false,eaglePot:false,spect:0},omen:OMENS[0],bestias85:{cid:w.id,eid:E.id,week:w.week}}}
/* the outcome: rows {mgrId, alive, kn, severed} */
function bestiasApply85(w,E,rows){if(E.done)return null;E.done=1;const city=cityN85(E.city);const out={free:[],fell:[],fillFell:0};
  for(const c of E.cases){const g=gById(c.gid);if(!g)continue;
    if(c.st==='flamma'){martyr85(w,g,'Ad Flamma',city);c.st='flamma';out.fell.push(g.name);continue}
    if(c.st!=='face')continue;const r=(rows||[]).find(x=>x.mgrId===g.id);
    if(r&&r.alive){pardon85(w,g,r,city);c.st='free';out.free.push(g.name)}else{martyr85(w,g,'Ad Bestias',city);c.st='martyr';out.fell.push(g.name)}}
  out.fillFell=(rows||[]).filter(x=>!x.mgrId&&!x.alive).length;E.res=out;
  const me0=me();const mine=E.cases.filter(c=>c.mgr===me0.id&&['free','martyr','flamma'].includes(c.st));
  if(mine.length)sendLetter(w,{key:'fa85res-'+E.id,kind:'report',from:'the Consilium',adv:'consilium',seal:'✝',until:w.week+2,title:`After the edict of ${city}`,body:`<ul>${mine.map(c=>`<li>${caseLine85(E,c)}</li>`).join('')}</ul>`});
  return out}
async function bestiasSim85(w,E){if(E.done)return null;const faced=E.cases.some(c=>c.st==='face');let rows=[];
  if(faced){let res=null;for(let k=0;k<2&&!(res&&res.rows);k++)res=await simEvent(bestiasCfg85(w,E,null),{timeoutMs:60000}).catch(e=>({error:String(e)}));
    /* a simulation that could not finish never kills anyone: the editor calls the beasts back */
    rows=res&&res.rows?res.rows:E.cases.filter(c=>c.st==='face').map(c=>({mgrId:c.gid,alive:true,kn:0,severed:[]}))}
  return bestiasApply85(w,E,rows)}
/* live: you are your condemned fighter, like the beast pen */
{const base=newState;newState=function(config){const r=base.apply(this,arguments);try{if(S&&config&&config.bestias85)S.bestias85={...config.bestias85}}catch(e){}return r}}
{const base=startEvent;startEvent=function(cfg){const r=base.apply(this,arguments);try{if(cfg&&cfg.bestias85&&typeof LAST_CFG!=='undefined')LAST_CFG=null}catch(e){}return r}}
{const base=checkEndCustom;checkEndCustom=function(ev,rd,act,set,win){if(S&&S.bestias85&&act.length){if(S.npcs.length&&S.npcs.every(n=>!n.alive||n.tamedBy!=null))return win(act,'Every beast is slain — the survivors are pardoned.');
  if(S.rotation>FAITH85.rot)return win(act,'The editor calls the beasts back — the survivors are pardoned.')}return base.apply(this,arguments)}}
{const base=matchSaveOK;matchSaveOK=function(){return S&&S.bestias85?false:base.apply(this,arguments)}}
/* the condemned fight together: no trades or truces (truces are already off by noTruce + no PvP; the Trade button is hidden) */
{const base=openTrade;openTrade=async function(){if(S&&S.bestias85)return;return base.apply(this,arguments)}}
{const base=render;render=function(){const r=base.apply(this,arguments);try{if(S&&S.bestias85)for(const b of document.querySelectorAll('[data-act="trade"]'))b.remove()}catch(e){}return r}}
function bestiasLive85(eid){const w=W_(),m=me();const E=curEdicts85(w).find(x=>x.id===eid);if(!E||E.done)return;const g=E.cases.map(c=>c.mgr===m.id&&c.st==='face'?gById(c.gid):null).find(Boolean);if(!g)return;
  const cfg=bestiasCfg85(w,E,g.id);tnews(`🦁 ${esc(g.name)} walks out to the beasts at ${esc(cityN85(E.city))}.`);saveWorld(true);if(typeof MM!=='undefined')MM.fromMenu=false;
  if(CUR_MODAL)CUR_MODAL.done('bestias85');else modalDismiss();S&&(S.over=true);startEvent(cfg)}
{const base=gameOver;gameOver=async function(winners,reason){if(!S||!S.bestias85||S.sim)return base.apply(this,arguments);
  if(S.overShown)return;S.overShown=true;S.over=true;S.phase='over';S.busy=false;try{render()}catch(e){}log(reason,'big');
  const B=S.bestias85;const rows=S.players.map(p=>({mgrId:p.mgrGid||null,alive:p.alive&&!p.retired,kn:p.trophies.filter(t=>t.pk!=='player').length,severed:['rarm','larm','rleg','lleg'].filter(l=>p.hp[l]<=0),name:p.name}));
  if(!MGR.world||MGR.world.id!==B.cid){const d=await Store.getDoc('mgrCareers',B.cid).catch(()=>null);if(!d)return;MGR.world=mgrMigrate(JSON.parse(d.world))}
  const w=W_();const E=(fa85State(w).edicts||[]).find(x=>x.id===B.eid);if(!E)return;const out=bestiasApply85(w,E,rows)||E.res||{free:[],fell:[]};saveWorld(true);
  const L=[...out.free.map(n=>`🕊 <b>${esc(n)}</b> survives and is pardoned`),...out.fell.map(n=>`✝ <b>${esc(n)}</b> dies a martyr`)];if(out.fillFell)L.push(`✝ ${out.fillFell} other condemned fell`);
  await modal(out.fell.length&&!out.free.length?'✝ Ad bestias':'🕊 Ad bestias',`<ul class="leave76">${L.map(x=>`<li>${x}</li>`).join('')}</ul>`,[{label:'Back to Match Week',value:'back',primary:1}],{close:'back'});
  openManager('night')}}
/* ---------- the week's end: undecided cases are taken, the condemned meet the beasts ---------- */
{const base=endWeek;endWeek=async function(){const w=W_();const ready=!!(w&&!w.dead&&w.night&&w.night.bouts.every(b=>b.done)&&!(w.pend||[]).length&&!(w.special&&!w.special.done));const wk=w&&w.week;
  if(ready&&!w.tutorial){try{for(const E of curEdicts85(w)){if(E.done)continue;for(const c of E.cases)if(c.st==='open'){c.st='face';tnews(`✝ The soldiers take ${esc(c.n)} for the beasts.`,'bad')}
    await bestiasSim85(w,E)}}catch(e){console.error(e)}}
  const r=await base.apply(this,arguments);
  if(ready&&r!==false){try{const w2=W_();if(w2&&w2.week!==wk){faithWeek85(w2);saveWorld()}}catch(e){console.error(e)}}return r}}
/* ---------- your decisions ---------- */
function note85(title,body,btn){return new Promise(res=>{const bg=document.createElement('div');bg.className='veraskbg ask76bg';bg.innerHTML=`<div class="card2 verask fa85note" role="dialog" aria-modal="true"><b>${title}</b><div style="margin:6px 0 10px">${body}</div><div class="acts"><button type="button" class="btn primary" data-note85>${btn||'Close'}</button></div></div>`;
  document.body.appendChild(bg);bg.addEventListener('click',e=>{e.stopPropagation();if(e.target.closest('[data-note85]')||e.target===bg){bg.remove();res(true)}})})}
const flammaCard85=()=>{const F=FATES.find(f=>f.n==='Ad Flamma');return F?`<div class="fa85fate">${cardHTML('f:'+F.img,'md')}<div><b>${esc(F.g)} · ${esc(F.n)}</b><p class="rc-sub">${esc(F.t)}</p></div></div>`:''};
async function decide85(a,eid,gid){const w=W_(),m=me();if(!w||!m)return;const E=curEdicts85(w).find(x=>x.id===eid);const c=E&&E.cases.find(x=>x.gid===gid);const g=gById(gid);if(!c||!g||c.mgr!==m.id)return;
  if(a==='live'||a==='sim'){if(c.st!=='face'||E.done)return;if(a==='live'){bestiasLive85(eid);return}
    const out=await bestiasSim85(w,E);saveWorld(true);if(typeof MGR_REDRAW==='function')MGR_REDRAW();
    if(out){const L=[...out.free.map(n=>`🕊 <b>${esc(n)}</b> survives and is pardoned`),...out.fell.map(n=>`✝ <b>${esc(n)}</b> dies a martyr`)];if(out.fillFell)L.push(`✝ ${out.fillFell} other condemned fell`);await note85(`🦁 Ad bestias at ${esc(cityN85(E.city))}`,`<ul class="leave76">${L.map(x=>`<li>${x}</li>`).join('')}</ul>`)}return}
  if(c.st!=='open')return;
  if(a==='hide'){if(c.bribeFail)return;c.st='hid';pull85(w,gid);tnews(`🌙 ${esc(g.name)} is hidden this week and sits out.`)}
  else if(a==='bribe'){const cost=bribeCost85(g);if(c.bribeFail||m.coin<cost)return;m.coin-=cost;const ok=fa85R(w,'bribe'+eid+gid).next()<FAITH85.bribeP-(E.den?0.15:0);
    if(ok){c.st='bribed';tnews(`💰 ${cost} coin to the magistrate: ${esc(g.name)}'s name is struck.`)}else{c.bribeFail=1;tnews(`💰 The magistrate kept the ${cost} coin — ${esc(g.name)}'s name stands.`,'bad')}
    saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW();await note85(ok?'💰 The name is struck':'💰 The bribe failed',ok?`<p>${esc(g.name)} is free of the edict.</p>`:`<p>The magistrate pocketed ${cost} coin and the sentence stands. ${esc(g.name)} must face the beasts — or refuse.</p>`);return}
  else if(a==='face'){c.st='face';pull85(w,gid);tnews(`🦁 ${esc(g.name)} will face the beasts at ${esc(cityN85(E.city))}.`,'bad')}
  else if(a==='refuse'){const ok=await ask76(`🔥 ${he85(g,1)} will not fight?`,`<p><b>${esc(g.name)}</b> will not raise a hand in the arena. The sentence is the fire: ${he85(g)} dies.</p>`,'🔥 Ad Flamma','Not yet');if(!ok)return;
    c.st='flamma';pull85(w,gid);martyr85(w,g,'Ad Flamma',cityN85(E.city));saveWorld(true);if(typeof MGR_REDRAW==='function')MGR_REDRAW();await note85(`✝ ${esc(g.name)} · Ad Flamma`,flammaCard85()+`<p>${esc(g.name)} is remembered as a martyr.</p>`,`Remember ${hm85(g)}`);return}
  saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-fa85]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();const [a,eid,gid]=b.dataset.fa85.split('|');decide85(a,eid,gid)},true);
/* no entering a condemned fighter */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mgrBody [data-mg="enter"]');if(!b)return;const s=document.getElementById('ent'+b.dataset.id);const g=s&&gById(s.value);if(g&&busy85(g)){e.preventDefault();e.stopPropagation();mToast(`✝ ${esc(g.name)} cannot be entered this week (the edict).`)}},true);
/* the Match Week card: the case, the beasts, the jeering crowd */
function edictCard85(){const w=W_(),m=me();if(!w||!m||!w.night)return '';const out=[];
  for(const E of curEdicts85(w)){const mine=E.cases.filter(c=>c.mgr===m.id);if(!mine.length)continue;const R=E.den?mgrById(E.den):null;const faced=E.cases.filter(c=>c.st==='face');
    out.push(`<div class="card2 fa85card" data-fa85e="${E.id}"><div class="sect" style="margin-top:0">✝ ${R?`Denounced by ${esc(R.ludus)}`:`The edict of ${esc(cityN85(E.city))}`} <span class="rc-sub">${E.done?'carried out':'this week'}</span></div>
      ${mine.map(c=>`<div class="fa85row">${gById(c.gid)?gArt(gById(c.gid),'xs'):''}<div><b>${esc(c.n)}</b>${caseButtons85(E,c)}</div></div>`).join('')}
      ${!E.done&&mine.some(c=>c.st==='face')?`<div class="fa85bst"><span class="rc-sub">🦁 Ad bestias at ${esc(cityN85(E.city))}: ${faced.length} condemned${E.cases.length>mine.length?' from several houses':''} against a lion, a bear and two wolves · ${FAITH85.rot} rotations</span><div class="acts">${(()=>{const c=mine.find(x=>x.st==='face');return `<button class="btn primary" type="button" data-fa85="live|${E.id}|${c.gid}">⚔ Fight it yourself<small>you play ${esc(c.n)}</small></button><button class="btn" type="button" data-fa85="sim|${E.id}|${c.gid}">⏩ Let the sand decide<small>runs now</small></button>`})()}</div></div>`:''}</div>`)}
  const C=myChr85();if(C.length&&jeerCity85(w.night.loc)&&!w.night.bye)out.push(`<div class="card2 fa85card"><span class="rc-sub">✝ The crowd of ${esc(cityN85(w.night.loc))} jeers Christians: ${C.map(g=>esc(g.name)).join(', ')} start${C.length===1?'s':''} ${FAITH85.jeer} CF down.</span></div>`);
  return out.join('')}
{const base=nightHTML;nightHTML=function(){let h=base.apply(this,arguments);try{const w=W_();
  for(const g of rosterOf(me()))if(busy85(g))h=h.split(`<option value="${g.id}">`).join(`<option value="${g.id}" disabled>✝ `);
  const c=edictCard85();if(c)h=c+h}catch(e){console.error(e)}return h}}
/* the letter's own buttons (rendered live from the case) */
function fillBoxes85(){const w=W_();if(!w)return;for(const el of document.querySelectorAll('[data-fa85box]')){const [eid,gid]=el.dataset.fa85box.split('|');const E=(fa85State(w).edicts||[]).find(x=>x.id===eid);const c=E&&E.cases.find(x=>x.gid===gid);
  const h=E&&c?caseButtons85(E,c):'';if(el._h!==h){el._h=h;el.innerHTML=h}}}
setInterval(()=>{try{if(MGR&&MGR.world)fillBoxes85()}catch(e){}},400);
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_(),m=me();for(const E of curEdicts85(w)){
  const open=E.cases.filter(c=>c.mgr===m.id&&c.st==='open'),wait=E.done?[]:E.cases.filter(c=>c.mgr===m.id&&c.st==='face');if(!open.length&&!wait.length)continue;
  const nm=L=>L.map(c=>`<b>${esc(c.n)}</b>`).join(', ');const txt=[open.length?`${nm(open)} ${open.length===1?'is':'are'} named in the edict of ${esc(cityN85(E.city))}`:'',wait.length?`${nm(wait)} ${wait.length===1?'waits':'wait'} for the beasts`:''].filter(Boolean).join(' · ');
  I.unshift({fa85:E.id,done:false,ic:'✝',txt,btn:`<button class="btn tksm" type="button" data-mg="tab" data-id="night">Decide</button>`})}}catch(e){console.error(e)}return I}}
/* ---------- 10. the Studio ---------- */
{const base=charEditorHTML;charEditorHTML=function(){const h=base.apply(this,arguments);try{const c=ST.draft;if(!c)return h;
  return h.replace('<label>Home city',`<label>Faith${fSel('faith',[['','Pagan'],['christian','✝ Christian']],c.faith==='christian'?'christian':'')}</label><label>Home city`)}catch(e){return h}}}
{const base=studioHTML;studioHTML=function(){let h=base.apply(this,arguments);try{if(typeof CUSTOM!=='undefined')for(const c of CUSTOM.chars||[])if(c.faith==='christian'){const k=`<b>${esc(c.name)}</b>`;h=h.split(k).join(k+' '+chipFaith85('christian'))}}catch(e){}return h}}
(()=>{const st=document.createElement('style');st.textContent=`
.fa85{display:inline-block;font:700 12px/1 Georgia,serif;color:#f1e3b8;background:#3a2a1a;border:1px solid #b8913f;border-radius:4px;padding:2px 4px;margin:0 3px 0 0;vertical-align:middle;cursor:default}
.fa85.m{border-color:#9c3a2a;background:#2a1612;color:#f0d7c2}
.fa85card{margin:8px 0;border-color:#8a6a3a}.fa85row{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;margin:6px 0}
.fa85acts{margin-top:4px}.fa85lrow{margin:6px 0}.fa85bst{margin-top:6px;padding-top:6px;border-top:1px dashed #8a6a3a77}.fa85t{margin-top:6px}
.fa85fate{display:flex;gap:12px;align-items:flex-start}.fa85fate p{margin:4px 0 0}.fa85note{max-width:min(560px,92vw)}
@media (max-width:600px){.fa85fate{flex-direction:column;align-items:center}}`;document.head.appendChild(st)})();
