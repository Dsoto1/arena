/* =====================================================================
   149-v87fix · v0.87 FIXES (his notes on v0.86)
   =====================================================================
   1 · Orbis Terrarum on the Online stage: only the 🔍 button opens the large map. The map itself is no longer a button
       (no data-onl="omap", no zoom cursor, no hover brightening) — a click or hover on it does nothing.
   2 · Ave Arena (147-v85music): the 808 bass is softer — about 38% lower, a gentler 25 ms attack, a shorter pitch drop and a
       softer saturation (ave87808); the trap kick sits 30% lower with a short attack (ave87Kick). Everything else plays as before.
   3 · Online Armory & Market: his market-board art no longer sits behind the market (.mb83 keeps its layout on a plain dark panel).
   4 · Domus Storeroom: "🏛 Buy for the shelf" is gone (buying happens only in Armory & Market; a stray data-onl83="dbuy" click is
       swallowed). The shelf is now its own section (#sh87 "🗄 The shelf") under the gladiators' pieces, always shown whatever chip is
       picked (the old Shelf chip goes); "Move… → the shelf" lands the piece there and it glows + scrolls into view.
   5 · Try it on (98-avatar73 #tryOn): the marks show WHERE the piece goes, not the last-change flash — a piece wearable on either
       side (a single arm piece like the Lorica Segmentata, any arm/leg piece) marks BOTH sides, with "either arm — you choose" (the
       engine already asks which side and mirrors the art on the left). The card shows the piece's real art (his arm81 file, else
       the armor art cell); a pair (Flavius' Bracers…) shows two copies in a V, tilted inward, the left one mirrored.
   6 · Hidden mechanics out of the player's text: the Fame glossary line ("drifts back toward 35…"), the Thriving thresholds
       (coin/fame numbers) and the Manager guide's fame line + its "What 16 seasons showed" developer notes.
   7 · Unspent perk points = a weekly checklist task ("🎓 N perk points to spend" → Spend, data-mg="toschool"); the Schooling card's
       top-right points pill goes (the Schooling tile keeps its own count).
   8 · Your ludus: the 📬 Mail panel is half the page wide (full width under 900 px).
   9 · Training Yard banner: the hours box wears its rail oval's light grey (145 part 10), pips too.
  10 · Infirmary: Hygeia's Blessing leaves the big card above the banner for a small card ON the banner (left of the care count);
       same button (data-m48="hygeia"), the description in its tooltip.
  11 · City center arms market / armorer: switching "For" shows THAT fighter's kit (#cityKitList follows #cityKitWho); the shop says
       "Kits ride in only if this fighter fights this week" + whether he is on the card; a kit bought this week for a fighter who did
       not fight is REFUNDED in full at the week's end (price recorded in g.kitPaid87; a news line names it) before 17-manager drops kits.
  12 · Stale mail: every letter records who it names (L.g87: id, alive, yours, free agent) when sent (or first seen); a letter is
       dropped once a named fighter dies, leaves your house (sold/traded/released) or — for a free agent — signs anywhere, and the
       Medicus' risk letter once none of its fighters is still at risk. "⚕ To the ward" always opens the Infirmary (window-capture
       handler, scrolls to the top).
  13 · Online landing: the Forum box goes. In its place "📜 Acta of the day" — the last 8 bouts settled this online day, newest first:
       time · event at city — 🏆 winner (house) N CF · ✝ fallen. A line opens the day's list popup. Empty today → yesterday's
       (the day turns at 20:00 New York, ONLC.dayStart). Data: DAY# records keep an ordered `acta` list (≤10; ONLC.dayFromMatch /
       dayFell in 111-onlcore → server + mock; routes.js dnFill + mockDn84 fill the house names). 👥 Here now and 🔔 Quiet stay in its header.
  14 · Every 🧠 shown beside a CPU mind name (Novice … Master) wears that mind's hue, like aiTierChip — Play Now seat chips (also after
       tapping to cycle; the chip border follows), setup, anywhere: a debounced MutationObserver wraps the bare 🧠 in <i class="brain bN">.
  16 · A fallen fighter watches, never throws: offline (Play Now, hot seat, Manager) no 🎟 seat once a fighter of yours fell in the event (the
       button reads "You fell in this match — you can watch, not throw"), no human spectator upkeep, no wagers window while it runs; online
       a fighter of the match never acts from the stands — ONLC.standsHolders (server match.stands.open + mock) leaves fighters out, a
       pick from a fighter is refused (ONLC.FELL_WATCH), and a ticket holder can no longer sit down in the same room (ONLC.sitGroup).
  17 · The results window opens on the players: the wagers panel moves into its own tab "💰 Wagers · N" (only when there were wagers).
  18 · The event pop-up (#evPop75, the top-left event chip) loses the "This week: <city> · <event> (you are off the schedule)" line and the
       "📅 Season schedule" button, in every mode; card, title, Summa Rudis, place · date · crowd, the long date, Board/Round and
       📋 Event details stay.
  19 · Settings → General: the 💡 Hints master switch and its five switches (Strategy panel, Rule popups, Turn hints, Rule hints, Turn
       recap) sit in ONE box (#hint87): the master as its header row, the five indented under it — greyed and not clickable while the
       master is off. Same setting keys and behaviour.
  20 · Hovering armor (Online Armory & Market, Domus Storeroom, the offline market, draft offers, loot) never flashes the hit red: the try-on is
       re-drawn by tryOn87Now — its AVHIT entries are cleared before and after the avatar is drawn (no .avhit), and the place the piece goes
       (both sides for an either-side piece) wears a calm GOLD outline + glow (.to87). The card opens only after the pointer rests ~120 ms on a
       tile (TRY87; each hover change cancels the pending card and wipes the shown one; the timer draws only if the same piece key is still
       under the pointer — the ghost and its marks are always one piece), so sweeping across the tiles shows nothing. Online / in the Domus the piece is tried on the active
       gladiator in the pieces he brings (tryOn87Body), not on a leftover event's mover. Real hits in a match keep their red flash.
  15 · The main menu's 🔊 mute button (#mmMute, 72-v59) is gone; muting stays in Settings → Audio, the M key and the arena's control.
   ===================================================================== */
const V87={shelf:null};

/* ---------------- 1 · Orbis: only the 🔍 opens the map ---------------- */
const orbis87Strip=h=>typeof h==='string'?h.replace(/ data-onl="omap" role="button" tabindex="0" title="[^"]*"/,''):h;
if(typeof onlStageMap81==='function'){const base=onlStageMap81;onlStageMap81=function(){return orbis87Strip(base.apply(this,arguments))}}
if(typeof onlOrbisHTML80==='function'){const base=onlOrbisHTML80;onlOrbisHTML80=function(){return orbis87Strip(base.apply(this,arguments))}}

/* ---------------- 2 · Ave Arena: a softer bass ---------------- */
const AVE87={bass:0.62,kick:0.7};
function ave87808(t,f,dur,vol){const c=AUD.ctx,o=c.createOscillator(),g=c.createGain(),sh=c.createWaveShaper();const cv=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cv[i]=Math.tanh(1.3*x)}sh.curve=cv;
  o.type='sine';o.frequency.setValueAtTime(f*1.6,t);o.frequency.exponentialRampToValueAtTime(f,t+0.06);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.025);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(sh);sh.connect(g);g.connect(AUD.music);o.start(t);o.stop(t+dur+0.05)}
function ave87Kick(t,v){const c=AUD.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(48,t+0.12);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);o.connect(g);g.connect(AUD.music);o.start(t);o.stop(t+0.3)}
if(typeof ave85Play==='function'){const base=ave85Play;ave85Play=function(v,t,m,len,vel,spB){try{const k=vel/127;
  if(v==='b808'){ave87808(t,audMtof(m),Math.max(0.2,len*spB),0.36*k*AVE87.bass);return}
  if(v==='drums'&&m===36){ave87Kick(t,0.44*k*AVE87.kick);return}}catch(e){}return base.apply(this,arguments)}}

/* ---------------- 4 · the Storeroom: no buying, a shelf you can see ---------------- */
if(typeof onlStoreHTML82==='function'){const base=onlStoreHTML82;onlStoreHTML82=function(){const sel0=typeof ONL82!=='undefined'?ONL82.srSel:null;let h,hAll;
  try{if(sel0==='house')ONL82.srSel='all';h=base.apply(this,arguments);ONL82.srSel='all';hAll=base.apply(this,arguments)}finally{if(typeof ONL82!=='undefined')ONL82.srSel=sel0}
  try{if(typeof h!=='string'||!h)return h;const T=document.createElement('template');T.innerHTML=h;const A=document.createElement('template');A.innerHTML=hAll||'';
    T.content.querySelectorAll('.buy83').forEach(e=>e.remove());T.content.querySelectorAll('.sr82-chip[data-v="house"]').forEach(e=>e.remove());
    const onShelf=el=>!!el.querySelector('select[data-sr83mv^="house|"]');const grid=T.content.querySelector('.sr82-grid');if(!grid)return T.innerHTML;
    grid.querySelectorAll('.sr82-it').forEach(e=>{if(onShelf(e))e.remove()});
    if(!grid.querySelector('.sr82-it')&&!grid.querySelector('p'))grid.innerHTML=`<p class="rc-sub">${_T`Nothing here yet — the Armory sells to your gladiators.`}</p>`;
    const rows=[...A.content.querySelectorAll('.sr82-grid .sr82-it')].filter(onShelf);const box=document.createElement('div');box.className='sh87';box.id='sh87';
    box.innerHTML=`<div class="tr83-h">${_T`🗄 The shelf <small class="rc-sub">${rows.length} piece${rows.length===1?'':'s'} · the house keeps them when a gladiator falls</small>`}</div>
      <div class="sr82-grid sh87-g">${rows.map(r=>r.outerHTML).join('')||`<p class="rc-sub">${_T`Empty — choose “Move… → the shelf” on any piece to put it here.`}</p>`}</div>`;
    grid.after(box);return T.innerHTML}catch(e){console.error(e);return h}}}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-onl83="dbuy"]');if(b){e.preventDefault();e.stopImmediatePropagation()}},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.sr83mv&&t.value==='house'){V87.shelf={k:t.dataset.sr83mv.split('|')[1],t:Date.now()}}},true);
setInterval(()=>{const F=V87.shelf;if(!F)return;if(Date.now()-F.t>9000){V87.shelf=null;return}
  const el=[...document.querySelectorAll('#sh87 [data-sr82]')].find(x=>x.dataset.sr82===F.k);if(!el)return;V87.shelf=null;el.classList.add('fl87');try{el.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(err){}
  setTimeout(()=>el.classList.remove('fl87'),2600)},250);

/* ---------------- 5 · try it on: real art, a V for pairs, marks on every side it fits ---------------- */
function tryOn87Art(k,A){const src=A.art81&&A.art81.f&&typeof assetURL==='function'?assetURL(A.art81.f):null;
  if(!src)return `<div class="to87art">${typeof armArtCell==='function'?armArtCell(k,64):''}</div>`;
  if(A.pair)return `<div class="to87art v"><img src="${src}" alt="" class="vl"><img src="${src}" alt="" class="vr"></div>`;
  return `<div class="to87art"><img src="${src}" alt=""></div>`}
const tryOn87Locs=A=>A.slot==='head'?['head']:A.slot==='chest'?['chest']:A.slot==='arm'?['rarm','larm']:['rleg','lleg'];
/* 20 · the body the piece is tried on: online = the active gladiator in the pieces he brings; else the live event's mover (as before) */
function tryOn87Body(el){if(el.closest&&el.closest('#onl')){const ch=typeof ONL!=='undefined'&&ONL.char;const eq=ch?(Array.isArray(ch.equip)?ch.equip:(ch.gear||[])):[];const list=[];
    for(const k of eq){const A=ARM[k];if(!A)continue;const L=A.slot==='head'?['head']:A.slot==='chest'?['chest']:A.slot==='arm'?(A.pair?['rarm','larm']:['rarm']):A.slot==='leg'?(A.pair?['rleg','lleg']:['rleg']):[];for(const l of L)list.push([k,l])}
    return avatarFor73(list,'tryonbase')}
  return typeof cur==='function'&&S&&!S.over?cur():null}
const tryOn87Clear=()=>{for(const l of LOCS){delete AVHIT['tryon|'+l];delete AVHIT['tryonbase|'+l]}};
/* the try-on card itself (98-avatar73's tryOnShow, re-drawn): never the hit flash, the place it goes marked in calm gold */
function tryOn87Now(el){const k=(el.dataset.card||'').slice(2);const A=ARM[k];const me0=tryOn87Body(el);if(!A||!me0||!me0.pieces)return;
  const p={...me0,id:'tryon',hp:{...me0.hp},ap:{...me0.ap},pieces:Object.fromEntries(LOCS.map(l=>[l,[...((me0.pieces||{})[l]||[])]]))};
  const locs=A.slot==='head'?['head']:A.slot==='chest'?['chest']:A.slot==='arm'?(A.pair?['rarm','larm']:['rarm']):(A.pair?['rleg','lleg']:['rleg']);
  for(const l of locs){p.pieces[l].push({key:k,n:A.n,ap:A.ap});p.ap[l]=(p.ap[l]||0)+A.ap}
  let box=document.getElementById('tryOn');if(!box){box=document.createElement('div');box.id='tryOn';box.className='tryon';document.body.appendChild(box)}
  tryOn87Clear();let sv='';try{sv=avatarSVG(p)}finally{tryOn87Clear()}
  box.innerHTML=`<div class="tohd">${_T`👤 Try it on`}</div><div class="toav">${sv.replace(/class="avzone"[^>]*data-avtip="[^"]*"/g,'')}</div><div class="tost">${_T`<b>${esc(A.n)}</b><small>${A.ap} AP · ${A.slot}${A.pt&&A.pt!=='helm'&&A.pt!=='chest'?' '+A.pt:''} · L${A.lv||1}${A.stack?' · stacks':''}${A.bonus?_T` · +${Object.values(A.bonus)[0]} AP to ${LOCN[Object.keys(A.bonus)[0]]||''}`:''}</small>`}</div>`;
  const r=el.getBoundingClientRect();box.hidden=false;const x=r.right+250>window.innerWidth?r.left-190:r.right+10;box.style.left=Math.max(4,x)+'px';box.style.top=Math.max(8,Math.min(window.innerHeight-330,r.top-40))+'px';
  try{const svg=box.querySelector('.toav svg');
    if(svg){svg.querySelectorAll('.avhit').forEach(x=>x.remove());
      for(const l of tryOn87Locs(A)){const z=svg.querySelector(`path[data-avloc="${l}"]`);if(!z)continue;const q=document.createElementNS('http://www.w3.org/2000/svg','path');
        q.setAttribute('d',z.getAttribute('d'));q.setAttribute('class','to87');q.setAttribute('pointer-events','none');q.dataset.loc=l;svg.appendChild(q)}}
    const st=box.querySelector('.tost');if(st){st.insertAdjacentHTML('beforebegin',tryOn87Art(k,A));
      if(!A.pair&&(A.slot==='arm'||A.slot==='leg'))st.insertAdjacentHTML('beforeend',`<small class="to87e">${A.slot==='arm'?_T('Either arm — you choose which'):_T('Either leg — you choose which')}</small>`)}
    const bb=box.getBoundingClientRect();if(bb.bottom>window.innerHeight-6)box.style.top=Math.max(6,window.innerHeight-6-bb.height)+'px'}catch(e){console.error(e)}}
/* only after the pointer rests ~120 ms on a card; leaving cancels it (98's own mouseover listener calls tryOnShow on every move) */
/* every hover change cancels the pending card and wipes the old one first; the timer draws only the piece still under the pointer */
const TRY87={t:0,el:null,k:'',ms:120};
const tryOn87Wipe=()=>{const b=document.getElementById('tryOn');if(b&&!b.hidden){b.hidden=true;b.innerHTML=''}};
tryOnShow=function(el){if(!el)return;const k=el.dataset.card||'';if(TRY87.el===el&&TRY87.k===k)return;clearTimeout(TRY87.t);TRY87.t=0;tryOn87Wipe();TRY87.el=el;TRY87.k=k;
  TRY87.t=setTimeout(()=>{TRY87.t=0;if(TRY87.el!==el||TRY87.k!==(el.dataset.card||'')||!el.isConnected)return;let hov=true;try{hov=el.matches(':hover')}catch(e){}if(!hov){TRY87.el=null;return}tryOn87Now(el)},TRY87.ms)};
document.addEventListener('mouseover',e=>{const c=e.target.closest&&e.target.closest('#modal [data-card^="a:"]');if(c)return;if(TRY87.t||TRY87.el){clearTimeout(TRY87.t);TRY87.t=0;TRY87.el=null;TRY87.k=''}});

/* ---------------- 6 · no hidden mechanics in the player's text ---------------- */
try{if(GLOSS.fame)GLOSS.fame.d=_T('How known your house is. It opens doors to recruits and draws bigger crowds. Keep winning to hold it.');
  if(GLOSS.thriving)GLOSS.thriving.d=_T('A rich, famous house. It gets no loans, cart, paid road or stipend.')}catch(e){}
if(typeof mgrGuideHTML==='function'){const base=mgrGuideHTML;mgrGuideHTML=function(){let h=base.apply(this,arguments);try{if(typeof h!=='string')return h;
  h=h.split(_T(`Fame opens doors to recruits, but at every season's close it drifts back toward 35. Keep winning to hold it.`)).join(_T('Fame opens doors to recruits and fills the stands. Keep winning to hold it.'));
  const T=document.createElement('template');T.innerHTML=h;const want=_T('What 16 seasons showed');
  for(const el of [...T.content.querySelectorAll('h4,summary')]){if(el.textContent.trim()!==want)continue;const d=el.closest('details');
    if(el.tagName==='SUMMARY'&&d)d.remove();else{const n=el.nextElementSibling;if(n&&n.tagName==='UL')n.remove();el.remove()}}
  return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------------- 7 · unspent perk points = a task ---------------- */
if(typeof weekChecklist==='function'){const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const m=me();const P=(m&&m.perkPts)|0;
  if(P>0&&!I.some(x=>x.perk87))I.push({perk87:1,done:false,ic:'🎓',txt:_T`<b>${P}</b> perk point${P===1?'':'s'} to spend`,btn:`<button class="btn tksm" type="button" data-mg="toschool">${_T`Spend`}</button>`})}catch(e){console.error(e)}return I}}

/* ---------------- 10 · Hygeia's Blessing on the Infirmary banner ---------------- */
if(typeof infirmaryHTML==='function'){const base=infirmaryHTML;infirmaryHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string')return h;
  const T=document.createElement('template');T.innerHTML=h;const hc=T.content.querySelector('.hygcard'),hd=T.content.querySelector('.roomhd');if(!hc||!hd)return h;
  const btn=hc.querySelector('[data-m48="hygeia"]');const txt=(hc.querySelector('.rc-sub')||{}).textContent||'';
  const card=document.createElement('div');card.className='hyg87'+(hc.classList.contains('ready')?' ready':'')+(hd.querySelector('.roomstat')?' r2':'');card.title=txt;
  card.innerHTML=`<span class="hyg87h">${_T`🌿 <b>Hygeia's Blessing</b>`}</span>`;if(btn){btn.classList.add('tksm');card.appendChild(btn)}hd.appendChild(card);hc.remove();return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------------- 11 · the city's kits: follow the fighter, refund the unused ---------------- */
function kitFights87(g){const w=W_();const n=w&&w.night;return !!(n&&n.bouts&&n.bouts.some(b=>(b.ents||[]).includes(g.id)))}
function kitNote87(g){if(!g)return '';return `<p class="rc-sub kit87" id="kit87">${_T`Kits ride in only if this fighter fights this week — otherwise the full price comes back at the week's end.`} ${kitFights87(g)?_T`<b class="ok87">✓ ${esc(g.name)} is on this week's card.</b>`:_T`<b class="no87">${esc(g.name)} is not on this week's card yet.</b>`}</p>`}
if(typeof cityShopPanel==='function'){const base=cityShopPanel;cityShopPanel=function(key){const r=base.apply(this,arguments);try{if(key==='arms'||key==='armor'){const s=document.getElementById('cityKitWho');
  if(s){const g=gById(s.value);const lab=s.closest('label')||s;if(!document.getElementById('kit87'))lab.insertAdjacentHTML('afterend',kitNote87(g));const box=document.getElementById('cityKitList');if(box&&g)box.innerHTML=cityKitListHTML(g)}}}catch(e){console.error(e)}return r}}
document.addEventListener('change',e=>{const s=e.target;if(!s||s.id!=='cityKitWho')return;const g=typeof gById==='function'&&gById(s.value);if(!g)return;
  const box=document.getElementById('cityKitList');if(box)box.innerHTML=cityKitListHTML(g);const n=document.getElementById('kit87');if(n)n.outerHTML=kitNote87(g)});
const kitPrice87=k=>(CITY_ARMS.concat(CITY_ARMOR).find(x=>x[0]===k)||[0,4])[1];
if(typeof cityBuyKit==='function'){const base=cityBuyKit;cityBuyKit=function(key,price){const s=document.getElementById('cityKitWho');const g=s&&gById(s.value);const n0=g?(g.kit||[]).length:0;
  const r=base.apply(this,arguments);try{if(g&&(g.kit||[]).length>n0){const P=g.kitPaid87=(g.kitPaid87||[]).slice(0,n0);while(P.length<n0)P.push(kitPrice87(g.kit[P.length]));P.push(price);saveWorld()}}catch(e){console.error(e)}return r}}
if(typeof cityKitDrop==='function'){const base=cityKitDrop;cityKitDrop=function(gid,i){try{const g=gById(gid);if(g&&g.kitPaid87)g.kitPaid87.splice(i,1)}catch(e){}return base.apply(this,arguments)}}
{const base=endWeek;endWeek=async function(){let due=[];try{const w=W_(),m=me();if(w&&m&&!w.dead){const n=w.night;
    for(const g of rosterOf(m)){if(!(g.kit||[]).length||g.kitWk!==w.week)continue;const fought=!!(n&&n.bouts&&n.bouts.some(b=>b.done&&(b.ents||[]).includes(g.id)));if(fought)continue;
      const P=g.kitPaid87||[];const amt=g.kit.reduce((a,k,i)=>a+(P[i]!=null?P[i]:kitPrice87(k)),0);if(amt>0)due.push({gid:g.id,name:g.name,amt,n:g.kit.length})}}}catch(e){console.error(e);due=[]}
  const w0=W_();const r=await base.apply(this,arguments);
  try{const w=W_(),m=me();if(r!==false&&w===w0&&m&&due.length){let tot=0;for(const d of due){m.coin+=d.amt;tot+=d.amt}
      for(const g of w.glads)if(g.kitPaid87&&!g.kit)delete g.kitPaid87;
      if(typeof tnews==='function')tnews(_T`↩ Kits refunded: ${due.map(d=>_T`${esc(d.name)} (${d.amt} coin)`).join(', ')} did not fight — the smith pays back ${tot} coin.`);saveWorld()}
    else if(w)for(const g of w.glads)if(g.kitPaid87&&!g.kit)delete g.kitPaid87}catch(e){console.error(e)}return r}}

/* ---------------- 12 · stale mail ---------------- */
function mail87Named(w,txt){const m=me();const hit=[];const s=String(txt||'');
  for(const g of w.glads||[]){const n=g&&g.name;if(!n||n.length<4)continue;if(s.includes(esc(n))||s.includes(n))hit.push(g)}
  const keep=hit.filter(g=>!hit.some(o=>o!==g&&o.name.length>g.name.length&&o.name.includes(g.name)));
  return keep.slice(0,6).map(g=>({id:g.id,al:g.alive!==false,own:!!(g.contract&&m&&g.contract.mgr===m.id),fa:!g.contract&&g.alive!==false}))}
function mail87Tag(w,L){if(!L||L.g87)return;try{L.g87=mail87Named(w,(L.title||'')+' '+(L.body||''))}catch(e){L.g87=[]}}
function mail87Stale(w,L){const m=me();
  for(const e of L.g87||[]){const g=gById(e.id);const alive=!!g&&g.alive!==false&&!g.dead;
    if(e.al&&!alive)return true;if(e.own&&!(g&&g.contract&&m&&g.contract.mgr===m.id))return true;if(e.fa&&g&&g.contract)return true}
  if(/^med84-/.test(L.key||'')&&typeof medicus84Risks==='function'){const ids=(L.g87||[]).map(e=>e.id);if(ids.length){const R=new Set(medicus84Risks(w).map(x=>x.g.id));if(!ids.some(id=>R.has(id)))return true}}
  return false}
function mail87Prune(w){if(!w||!Array.isArray(w.letters))return 0;let n=0;for(const L of w.letters)mail87Tag(w,L);
  const keep=w.letters.filter(L=>{const s=mail87Stale(w,L);if(s)n++;return !s});if(n)w.letters=keep;return n}
if(typeof sendLetter==='function'){const base=sendLetter;sendLetter=function(w,o){const r=base.apply(this,arguments);try{const L=(w.letters||[]).find(x=>x.key===o.key);if(L){delete L.g87;mail87Tag(w,L)}}catch(e){}return r}}
if(typeof mailLive==='function'){const base=mailLive;mailLive=function(){try{const w=W_();if(w&&!w.dead)mail87Prune(w)}catch(e){console.error(e)}return base.apply(this,arguments)}}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-med84]');if(!b||typeof W_!=='function'||!W_())return;e.preventDefault();e.stopImmediatePropagation();
  MGR.tab='infirm';if(typeof MGR_REDRAW==='function')MGR_REDRAW();const box=document.getElementById('mBody');if(box)box.scrollTop=0;try{const hd=document.querySelector('#mgrBody .roomhd');if(hd)hd.scrollIntoView({block:'start'})}catch(err){}},true);

/* ---------------- 13 · the Acta of the day replaces the Forum ---------------- */
function acta87Time(at){try{return new Date(at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
function acta87Line(e){const W=e.w;const who=W?_T`🏆 <b>${esc2(W.name)}</b>${W.dn?` <span class="ac87h">(${esc2(typeof onlHouse82==='function'?onlHouse82(W.dn):W.dn)})</span>`:''}${(e.wn|0)>1?` +${(e.wn|0)-1}`:''} <b>${e.cf|0}</b> CF`:_T('no victor');
  return `<button type="button" class="ac87" data-v85="list" title="${_T`See the day's lists`}"><span class="ac87t">${acta87Time(e.at)}</span><span class="ac87e">${_T`${esc2(onlEvName(e.ev))} at ${esc2(onlCityName(e.loc))}`}</span><span class="ac87w">— ${who}${(e.fell|0)>0?` <span class="ac87f" title="${_T`Fell in that bout`}">✝ ${e.fell|0}</span>`:''}</span></button>`}
function acta87Body(){const T=typeof ONL80F!=='undefined'?ONL80F.today:null;const L=((T&&T.acta)||[]).filter(e=>e&&!e.pre).slice(0,8);const yd=!!(T&&T.day==='yesterday');
  return `<div class="ac87-sub rc-sub">${yd?_T('yesterday’s last results · the day turns at 8 PM New York'):_T('the last bouts settled today, newest first')}</div>
    <div class="ac87-list">${L.map(acta87Line).join('')||`<p class="rc-sub ac87-none">${_T`No bout settled yet today — the sand waits.`}</p>`}</div>`}
onlForum81=function(){const q=typeof onlQuiet80==='function'&&onlQuiet80();
  return `<div class="ofor81 acta87" id="onlForum81"><div class="ow-h">${_T`📜 Acta of the day`}<span class="f80-ctl"><button type="button" class="btn tksm" data-onl="who" title="${_T`Who is here`}">${_T`👥 Here now`}</button><button type="button" class="btn tksm ${q?'on':''}" data-onl="quiet" title="${q?_T('Quiet: no banners or invite pop-ups'):_T('Banners and invites pop up')}">${q?_T('🔕 Quiet'):'🔔'}</button></span></div>
    <div class="ac87-body" id="acta87">${acta87Body()}</div></div>`};
if(typeof onlToday80Patch==='function'){const base=onlToday80Patch;onlToday80Patch=function(){const r=base.apply(this,arguments);try{const el=document.getElementById('acta87');if(el){const h=acta87Body();if(el.innerHTML!==h)el.innerHTML=h}}catch(e){console.error(e)}return r}}
if(typeof mockDn84==='function'){const base=mockDn84;mockDn84=function(w){const r=base.apply(this,arguments);try{for(const X of Object.values(w.days80||{}))for(const e of (X&&X.acta)||[]){const W=e&&e.w;if(W&&W.dom&&!W.dn){const H=mockDomus82(w,W.dom);if(H)W.dn=H.name}}}catch(e){}return r}}

/* ---------------- 14 · every 🧠 wears its mind's hue ---------------- */
const BRAIN87=/🧠/;
function brain87Tier(txt){const s=String(txt||'');let best=-1;if(typeof AI_TIERS==='undefined')return -1;AI_TIERS.forEach((T,i)=>{if(new RegExp('^\\s*'+T.n+'\\b').test(s))best=i});return best}
function brain87Sweep(root){if(!root||typeof AI_TIERS==='undefined')return;
  /* the Play Now seat chips: the tier from the hidden select, the border too */
  for(const b of (root.querySelectorAll?root.querySelectorAll('[data-mind76]'):[])){const s=document.getElementById('dif'+b.dataset.mind76);const i=s?s.selectedIndex:-1;const T=AI_TIERS[i];if(!T)continue;
    const want=`<i class="brain b${i}">🧠</i> ${esc(T.n)}`;if(b.innerHTML!==want)b.innerHTML=want;if(T.c)b.style.borderColor=T.c}
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{if(!BRAIN87.test(n.nodeValue))return NodeFilter.FILTER_REJECT;const p=n.parentElement;
    if(!p||p.closest('option,select,script,style,textarea,.brain,svg'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
  const list=[];while(tw.nextNode())list.push(tw.currentNode);
  for(const n of list){const v=n.nodeValue;const at=v.indexOf('🧠');let i=brain87Tier(v.slice(at+2));if(i<0){const nx=n.nextSibling;if(!v.slice(at+2).trim()&&nx)i=brain87Tier(nx.textContent)}if(i<0)continue;
    const after=n.splitText(at);after.nodeValue=after.nodeValue.slice(2);const el=document.createElement('i');el.classList.add('brain','b'+i);el.textContent='🧠';after.parentNode.insertBefore(el,after)}}
{let pend=new Set(),tm=0;const run=()=>{tm=0;const s=pend;pend=new Set();for(const r of s)if(r.isConnected)try{brain87Sweep(r)}catch(e){}};
  const mo=new MutationObserver(ms=>{for(const m of ms){const t=m.type==='characterData'?m.target.parentElement:m.target;if(t&&t.nodeType===1)pend.add(t)}if(!tm)tm=setTimeout(run,60)});
  const go=()=>{if(document.body){mo.observe(document.body,{childList:true,subtree:true,characterData:true});pend.add(document.body);if(!tm)tm=setTimeout(run,60)}};
  if(document.body)go();else document.addEventListener('DOMContentLoaded',go)}

/* ---------------- 15 · no mute button on the main menu ---------------- */
mmMuteInstall=function(){};{const b=document.getElementById('mmMute');if(b)b.remove()}

/* ---------------- 16 · a fallen fighter watches, never throws ---------------- */
function fell87(){if(!S||!S.players)return false;const mine=typeof myFighterIds==='function'?myFighterIds():[];return S.players.some(p=>p&&!p.alive&&!p.exited&&(!p.cpu||mine.includes(p.id)))}
const FELL87=()=>_T('You fell in this match — you can watch, not throw.');
if(typeof ticketOK==='function'){const base=ticketOK;ticketOK=function(){if(S&&(S.onl||fell87()))return false;return base.apply(this,arguments)}}
if(typeof spectUI==='function'){const base=spectUI;spectUI=function(){const r=base.apply(this,arguments);try{const tb=document.getElementById('btnTicket');
  if(tb){const show=!!(S&&!S.over&&!S.onl&&S.phase!=='setup'&&fell87()&&!S.players.some(p=>!p.cpu&&p.alive&&!p.exited));tb.disabled=show;tb.classList.toggle('fell87',show);
    if(show){tb.hidden=false;tb.innerHTML=`🎟 ${FELL87()}`;tb.title=FELL87()}}}catch(e){}return r}}
if(typeof humanSpectatorTurn==='function'){const base=humanSpectatorTurn;humanSpectatorTurn=async function(me){try{if(S&&!S.onl&&fell87()&&me&&me.human){log(FELL87());return}}catch(e){}return base.apply(this,arguments)}}
if(typeof openWagers==='function'){const base=openWagers;openWagers=async function(){try{if(S&&!S.over&&S.phase!=='setup'&&!S.onl&&fell87()&&!(typeof MGR!=='undefined'&&document.getElementById('mgrBody'))){if(typeof mToast==='function')mToast(FELL87());return}}catch(e){}return base.apply(this,arguments)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#btnTicket.fell87');if(b){e.stopImmediatePropagation();e.preventDefault();if(typeof mToast==='function')mToast(FELL87())}},true);

/* ---------------- 17 · the results open on the players; the wagers get their own tab ---------------- */
function wag87Count(lines){const B=((S&&S.bets)||[]).filter(b=>b.won!=null).length,SB=((S&&S.selfBets)||[]).length,C=(S&&S.crowdBets&&S.crowdBets.n)|0;return B+SB+C||(lines||[]).length}
if(typeof wagerPanelHTML==='function'){const base=wagerPanelHTML;wagerPanelHTML=function(lines){const h=base.apply(this,arguments);try{return `<div id="rtab-wag" class="rtab87" data-wn="${wag87Count(lines)}" hidden>${h}</div>`}catch(e){return h}}}
{const base=modal;modal=function(title,body,buttons,opt){try{if(typeof body==='string'&&body.indexOf('data-rtab="res"')>=0&&body.indexOf('id="rtab-wag"')>=0&&body.indexOf('data-rtab="wag"')<0){
    const n=(body.match(/id="rtab-wag" class="rtab87" data-wn="(\d+)"/)||[])[1]|0;
    body=body.replace(/(<div class="rtabs seg" role="tablist">[\s\S]*?)(<\/div>)/,(m0,a,b)=>`${a}<button type="button" data-rtab="wag">${_T`💰 Wagers · ${n}`}</button>${b}`)}}catch(e){console.error(e)}
  return base.call(this,title,body,buttons,opt)}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#mBody [data-rtab]');if(!t)return;const w=document.getElementById('rtab-wag');if(!w)return;const k=t.dataset.rtab;
  t.parentElement.querySelectorAll('[data-rtab]').forEach(b=>b.classList.toggle('on',b===t));for(const x of ['res','graph','fates','wag']){const el=document.getElementById('rtab-'+x);if(el)el.hidden=k!==x}});

/* ---------------- 18 · the event pop-up: no "This week" line, no Season schedule button ---------------- */
if(typeof evPopHTML75==='function'){const base=evPopHTML75;evPopHTML75=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string')return h;
  const T=document.createElement('template');T.innerHTML=h;const inf=T.content.querySelector('.evp-info');if(!inf)return h;
  /* plain lines: the first = place · date · crowd, the last = Board/Round; anything between them is the "This week" line */
  const plain=[...inf.children].filter(e=>e.tagName==='DIV'&&!e.className);for(const e of plain.slice(1,-1))e.remove();
  T.content.querySelectorAll('[data-evsched75]').forEach(b=>b.remove());return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------------- 19 · Settings → General: the hints in one box ---------------- */
if(typeof settingsHTML==='function'){const base=settingsHTML;settingsHTML=function(tab){const h=base.apply(this,arguments);try{if(typeof h!=='string'||(tab&&tab!=='general'&&tab!=='profiles'))return h;
  const T=document.createElement('template');T.innerHTML=h;const mi=T.content.querySelector('input[data-set="hints"]');const si=T.content.querySelector('input[data-set="hintDock"]');if(!mi||!si)return h;
  const ml=mi.closest('.setrow'),sr=si.closest('.setrow');if(!ml||!sr||ml===sr||ml.closest('.hint87'))return h;
  const box=document.createElement('div');box.className='setrow hint87';box.id='hint87';ml.before(box);ml.classList.remove('setrow');ml.classList.add('hint87h');box.appendChild(ml);
  sr.classList.add('hint87s');box.appendChild(sr);return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------------- styles: 1 · 3 · 4 · 5 · 7 · 8 · 9 · 10 · 11 · 13 · 19 ---------------- */
(()=>{const st=document.createElement('style');st.textContent=`
.smap81,.omap{cursor:default!important}.smap81:hover .omap-in{filter:sepia(.45) saturate(.8) brightness(.42) contrast(1.05)}
#onl .mb83{background:linear-gradient(#21170f,#17100a)!important}
.sh87{margin-top:12px;padding:10px;border-radius:10px;background:linear-gradient(#2b1f14,#1d150d);box-shadow:inset 0 -10px 0 #4a3420,inset 0 -12px 0 #6b4a2a;padding-bottom:18px}
.sh87 .tr83-h{margin-bottom:6px}.sh87-g{min-height:40px}
.sr82-it.fl87{animation:fl87 1.3s ease-in-out 2;outline:2px solid #f0cf7d;outline-offset:2px}@keyframes fl87{0%,100%{box-shadow:0 0 0 rgba(240,207,125,0)}50%{box-shadow:0 0 18px 4px rgba(240,207,125,.65)}}
body.calm .sr82-it.fl87{animation:none}
.tryon .to87{fill:#f0cf7d;fill-opacity:.22;stroke:#ffd977;stroke-width:2.2;stroke-linejoin:round;filter:drop-shadow(0 0 3px rgba(240,207,125,.85))}.tryon .avhit{display:none!important}
.to87art{display:flex;justify-content:center;align-items:flex-end;gap:16px;height:54px;margin:4px 0}.to87art img{height:50px;width:auto;object-fit:contain}.to87art .cimg,.to87art .setart{width:50px!important;height:50px!important}
.to87art.v img{height:48px}.to87art.v .vl{transform:scaleX(-1) rotate(-14deg);transform-origin:50% 100%}.to87art.v .vr{transform:rotate(-14deg);transform-origin:50% 100%}
.to87e{display:block;color:#f0cf7d!important;font-size:11.5px}
.schoolcard .ptpill{display:none!important}
#mgrBody #mailBox{width:calc(50% - 6px);min-width:min(100%,440px);box-sizing:border-box}@media (max-width:900px){#mgrBody #mailBox{width:auto;min-width:0}}
.b73-practice .roomstat.rs2,.yard .roomstat.rs2{border-color:#cfd3d8}
.b73-practice .roomstat.rs2 .ptbox.on,.yard .roomstat.rs2 .ptbox.on{background:radial-gradient(circle at 40% 35%,#ffffff,#cfd3d8 60%,#7d838a)!important;box-shadow:0 0 12px rgba(207,211,216,.45)!important;color:#1e2226!important}
.b73-practice .roomstat.rs2 .hpips i[style],.yard .roomstat.rs2 .hpips i[style]{background:#cfd3d8!important}
.roomhd .hyg87{position:absolute;right:14px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 10px;border:1px solid #6fae7a;border-radius:12px;background:rgba(14,22,14,.82);box-shadow:0 4px 14px rgba(0,0,0,.5);max-width:170px;z-index:2}
.roomhd .hyg87.r2,.roomhd:has(.roomstat) .hyg87{right:132px}.roomhd .hyg87 .hyg87h{font-size:12.5px;color:#cfe8cf;white-space:nowrap}.roomhd .hyg87 .btn{font-size:12px;padding:3px 8px;white-space:nowrap}
.roomhd .hyg87.ready{border-color:#9bd59f;box-shadow:0 0 12px rgba(155,213,159,.35)}
@media (max-width:600px){.roomhd .hyg87{right:8px;top:8px;transform:none;padding:4px 6px}.roomhd .hyg87.r2,.roomhd:has(.roomstat) .hyg87{right:auto;left:8px}.roomhd .hyg87 .hyg87h{font-size:11px}}
.kit87{margin:6px 0 0}.kit87 .ok87{color:#9bd59f}.kit87 .no87{color:#e6b36a}
#onl .acta87 .ac87-body{display:flex;flex-direction:column;min-height:0;flex:1 1 0;border:1px solid #4a3a26;border-radius:10px;background:rgba(18,12,8,.6);padding:6px 8px;overflow:auto}
#onl .acta87 .ac87-sub{font-size:11.5px;margin:0 0 4px}
#onl .ac87{display:flex;flex-wrap:wrap;gap:0 6px;align-items:baseline;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid rgba(120,95,60,.25);padding:4px 2px;color:#d8cbb0;font:12.5px/1.35 system-ui,sans-serif;cursor:pointer}
#onl .ac87:hover{background:rgba(240,207,125,.07)}#onl .ac87:last-child{border-bottom:0}
#onl .ac87t{font:11.5px var(--mono);color:#a99474}#onl .ac87e{color:#e9c46a}#onl .ac87w b{color:#f3d58a}#onl .ac87h{color:#9fc0e6}#onl .ac87f{color:#e08070;font-weight:600}
#onl .ac87-none{margin:6px 2px}
#setBody .hint87{grid-column:1/-1;display:flex!important;flex-direction:column;gap:6px;align-items:flex-start!important;justify-content:flex-start!important;text-align:left}#setBody .hint87 .hint87s{justify-items:start;justify-content:start}#setBody .hint87 .hint87h{display:flex;gap:8px;align-items:flex-start;cursor:pointer}
#setBody .hint87 .hint87s{background:none!important;border:0!important;box-shadow:none!important;margin:0;padding:2px 0 0 26px!important}#setBody .hint87 .hint87s.hintsoff label{pointer-events:none;cursor:default}`;document.head.appendChild(st)})();
