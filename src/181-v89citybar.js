/* =====================================================================
   181-v89citybar · THE SQUARE'S SIDEBAR, REWORKED FOR THE FORUM (v0.89, part M)
   =====================================================================
   His note (2026-10-05): "show anything a lanista purchases for their gladiators in the bottom right of the city
   center window … rework that sidebar to better suit the new city center."
   The right column of the square (#citySide) becomes:
   • HEADER CARD (parchment): the city + its square, tonight's fixture / the next games here (cityNextEventLine),
     your coin and, before the games, the time until the horns (a 400 ms tick while the square is open).
   • TABS = what the forum offers (data-cside, so 25-city's own tab wiring and the ⇥ fold keep working):
     🛒 Stalls (city kits: the fighter picker #cityKitWho + #kit87 + #cityKitList follow the chosen fighter, the arms
     market and the armorer's wares with their medallions) · ⚖ Auction (Vulso's lots, cityAuctionPanel) · 🏛 Temple
     (cityTemplePanel89, [data-god89]) · 🏟 Arena (tonight's card, the gate, the training ground [data-cw89]) ·
     👥 People (kin + the stands + the spectator roster in one list with filter chips; empty groups are hidden; a row
     opens the face's card) · 🐾 Menagerie (only while the city has beasts — its own named beasts, or one led through).
     Stalls/Auction/Temple only for a lanista. Old keys kin/stands/roster land on People.
   • THIS VISIT (parchment, bottom right, always there for a lanista): what you bought or arranged here this visit,
     grouped by fighter (lit figure via figureHTML): kits with their medallion + price and ↶ (cityKitDrop's own 70%
     return, only while the fighter still holds it), auction buys, the temple offering (god + your fighters on the
     card), the bathhouse / tavern / lupanar, a spectator signed or treated in the square. Net spent at the foot.
     Kept in CITY.visit89 (reset on every openCitySquare).
   • BUILDING CLICKS open the matching tab (arms/armor → Stalls, auction + Vulso → Auction, temple → Temple, arena gate
     + training ground → Arena) instead of the floating #cityPanel; when the sidebar is folded the floating panel opens
     as before. The panels' own HTML is rendered INTO the tab (CBAR89.route redirects cityPanel), so every onclick /
     data-* handler is the old one. The horns' "Enter the arena" prompt stays floating.
   • Looks: dark walnut column, parchment header + visit cards, terracotta tab pills, gold rules. ≤900 px wide: the
     column becomes a bottom sheet under the forum (44% high); short landscape phones keep a 250 px side column.
   Small direct edit: 172-v89city's [data-cw89]/[data-god89] click handler also listens inside #citySide.
   UI only — never the seeded dice.
   ===================================================================== */
const CBAR89={route:null,tick:0,pf:'all'};
const CBAR89_TABS=[['stalls','🛒',_T('Stalls')],['auction','⚖',_T('Auction')],['temple','🏛',_T('Temple')],['arena','🏟',_T('Arena')],['people','👥',_T('People')],['beasts','🐾',_T('Menagerie')]];
const CBAR89_MGR=new Set(['stalls','auction','temple']);
/* the base panels, before this module wraps them (the tabs render through them) */
const CBAR89_BASE={auction:cityAuctionPanel,temple:cityTemplePanel89,train:cityTrainPanel89,sealed:citySealedPanel,shop:cityShopPanel};

/* ---------------- helpers ---------------- */
function cbar89Side(){return document.getElementById('citySide')}
/* the sidebar is on screen (not folded, not hidden) — else the floating panel serves */
function cbar89Usable(){const s=cbar89Side(),ov=document.getElementById('cityOv');return !!(CITY.open&&s&&s.dataset.cbar89&&ov&&!ov.classList.contains('sidefold')&&s.offsetWidth>0&&s.offsetHeight>0)}
function cbar89Beasts(){try{return !!((typeof CITY_BEASTS!=='undefined'&&CITY.L&&CITY_BEASTS[CITY.L.n])||(CITY.npcs||[]).some(n=>n.kind==='beast'))}catch(e){return false}}
function cbar89TabOK(k){if(CBAR89_MGR.has(k)&&!CITY.mgr)return false;if(k==='beasts')return cbar89Beasts();return CBAR89_TABS.some(t=>t[0]===k)}
function cbar89Into(sel,fn){const prev=CBAR89.route;CBAR89.route=sel;try{fn()}finally{CBAR89.route=prev}}
function cbar89Fig(g){try{return figureHTML(tokenForCls(CLASSES[g.cls]?g.cls:'soldier'),34)}catch(e){return ''}}
function cbar89Ico(k){return typeof rtokHTML==='function'&&rtokHTML(k,22)||`<b>${esc((OFFER[k]||{}).g||'•')}</b>`}
function cbar89Night(){const w=CITY.w;return w&&w.night&&w.night.loc===CITY.li?w.night:null}
function cbar89Mine(){try{return CITY.mgr?rosterOf(me()).sort((a,b)=>effOvr(b)-effOvr(a)):[]}catch(e){return []}}

/* ---------------- the frame: header, tabs, body, this visit ---------------- */
function cbar89Build(side){side.dataset.cbar89='1';side.classList.add('cbar89');const L=CITY.L;const flag=typeof CITY_FLAG!=='undefined'&&CITY_FLAG[L.n]&&typeof flagURIk==='function'?`<img src="${flagURIk(CITY_FLAG[L.n])}" alt="">`:'';
  side.innerHTML=`<div class="cbar89hd"><div class="cbar89t">${flag}<b>${esc(L.n)}</b><small>${esc((CITY_DRESS[L.n]||{}).sq||'')}</small></div>
      <div class="cbar89n" id="cbar89Next"></div><div class="cbar89r"><span id="cbar89Coin"></span><span id="cbar89Clock" hidden></span></div></div>
    <div class="citysidetabs cbar89tabs">${CBAR89_TABS.map(([k,i,l])=>`<button type="button" data-cside="${k}"><span>${i}</span> ${l}</button>`).join('')}<button type="button" data-cside="hide" class="cbar89fold" title="${_T`Fold the sidebar away`}">⇥</button></div>
    <div id="citySideBody" class="citysidebody cbar89body"></div>
    <div id="cbar89Visit" class="cbar89visit"></div>`;
  if(!cbar89TabOK(CITY.side))CITY.side=CITY.mgr?'stalls':'people';
  clearInterval(CBAR89.tick);CBAR89.tick=setInterval(()=>{if(!CITY.open||!document.getElementById('cbar89Coin')){clearInterval(CBAR89.tick);return}cbar89HeadLive()},400)}
function cbar89Head(){const n=document.getElementById('cbar89Next');if(n){let h='';try{h=cityNextEventLine()}catch(e){}n.innerHTML=h}cbar89HeadLive()}
function cbar89HeadLive(){const c=document.getElementById('cbar89Coin');if(c){const t=CITY.mgr?`${ICO.coin} <b>${me().coin}</b> ${_T`coin`}`:_T('👁 visiting');if(c.dataset.v!==t){c.dataset.v=t;c.innerHTML=t}}
  const k=document.getElementById('cbar89Clock');if(!k)return;let t='';
  if(CITY.mode==='filing')t=_T('🎺 The horns! To the arena');else if(CITY.opts&&CITY.opts.prematch&&CITY.remain>0){const s=Math.max(0,Math.ceil(CITY.remain/1000));t=_T`🎺 ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')} to the horns`}
  k.hidden=!t;if(k.textContent!==t)k.textContent=t;k.classList.toggle('soon',CITY.mode!=='filing'&&CITY.remain>0&&CITY.remain<30000)}
function cbar89Tabs(){const s=cbar89Side();if(!s)return;s.querySelectorAll('.cbar89tabs [data-cside]').forEach(b=>{const k=b.dataset.cside;if(k==='hide')return;b.hidden=!cbar89TabOK(k);b.classList.toggle('on',k===CITY.side)})}
/* cbar89Open — show a tab (from a building click or a panel call); false when the sidebar cannot take it */
function cbar89Open(tab,o){if(!cbar89Usable()||!cbar89TabOK(tab))return false;CITY.side=tab;try{cityPanel('')}catch(e){}citySideDraw();
  const f=o&&o.focus;if(f){const el=document.querySelector(`#citySideBody [data-cbar89sec="${f}"]`);if(el){el.scrollIntoView({block:'nearest'});el.classList.remove('cbar89hi');void el.offsetWidth;el.classList.add('cbar89hi')}}else{const b=document.getElementById('citySideBody');if(b)b.scrollTop=0}
  return true}

/* ---------------- the tabs' bodies ---------------- */
function cbar89Body(){const el=document.getElementById('citySideBody');if(!el)return;const k=CITY.side;
  if(k==='stalls'){el.innerHTML=cbar89StallsHTML();return}
  if(k==='auction'){el.innerHTML='';cbar89Into('#citySideBody',()=>CBAR89_BASE.auction());return}
  if(k==='temple'){el.innerHTML='';cbar89Into('#citySideBody',()=>CBAR89_BASE.temple());return}
  if(k==='arena'){el.innerHTML=`${cbar89CardHTML()}<div id="cbar89Gate" data-cbar89sec="arena"></div><div id="cbar89Train" data-cbar89sec="train"></div>`;
    if(cityGamesHere())document.getElementById('cbar89Gate').innerHTML=`<div class="sect">${_T`🚪 The arena gate`}</div><div class="card2"><p style="margin:0">${_T`The gate stands open. Walk in now, or wait for the horns.`}</p><div class="acts" style="margin-top:6px"><button class="btn primary tksm" type="button" onclick="cityEnterArena()">${_T`⚔ Enter the arena`}</button></div></div>`;
    else cbar89Into('#cbar89Gate',()=>CBAR89_BASE.sealed());
    cbar89Into('#cbar89Train',()=>CBAR89_BASE.train());return}
  if(k==='people'){el.innerHTML=cbar89PeopleHTML();return}
  if(k==='beasts'){el.innerHTML=typeof cityBeastsHTML==='function'?cityBeastsHTML(CITY.li,{h:9999,only:true}):'';return}
  el.innerHTML=''}
/* Stalls: the picker follows the chosen fighter; the arms market and the armorer side by side in one list */
function cbar89StallsHTML(){const pm=me();const ros=cbar89Mine();if(!ros.length)return `<p class="rc-sub">${_T`No fighters in your ludus to kit out.`}</p>`;
  const g=ros.find(x=>x.id===CBAR89.who)||ros[0];CBAR89.who=g.id;const full=(g.kit||[]).length>=3;
  const ware=(k,pr0)=>{const pr=cityPr(pr0);const O=OFFER[k]||{n:k,s:''};return `<button class="cbar89ware" type="button" onclick="cityBuyKit('${k}',${pr})" ${pm.coin<pr||full?'disabled':''} title="${esc(O.n)} · ${esc(O.s)}">${cbar89Ico(k)}<span><b>${esc(O.n)}</b><small>${esc(O.s)}</small></span><em>${coinAmt87(pr)}${pr<pr0?` <s>${pr0}</s>`:''}</em></button>`};
  return `<label class="cbar89who">${_T`For`} <select id="cityKitWho" class="tin">${ros.map(x=>`<option value="${x.id}" ${x.id===g.id?'selected':''}>${_T`${esc(x.name)} · ${effOvr(x)} · kit ${(x.kit||[]).length}/3`}</option>`).join('')}</select></label>
    ${typeof kitNote87==='function'?kitNote87(g):''}<div id="cityKitList" class="cbar89kit">${cityKitListHTML(g)}</div>
    ${cityHome()?`<p class="rc-sub" style="margin:4px 0">${_T`🏠 <b>Home-city prices</b> — a quarter off.`}</p>`:''}
    <div data-cbar89sec="arms"><div class="sect">${_T`⚔️ The arms market`}</div><div class="cbar89wares">${CITY_ARMS.map(([k,p])=>ware(k,p)).join('')}</div></div>
    <div data-cbar89sec="armor"><div class="sect">${_T`🛡 The armorer`}</div><div class="cbar89wares">${CITY_ARMOR.map(([k,p])=>ware(k,p)).join('')}</div></div>
    <p class="rc-sub" style="margin:6px 0 0">${_T`Kit rides into the fighter's next bout this week — three items a fighter.`}</p>`}
/* cbar89StallsSync — after a buy / return / fighter change: update the open Stalls in place (the picker element stays, so
   whatever holds it — a hand on the select, a test — keeps working) */
function cbar89StallsSync(){const s=document.querySelector('#citySideBody #cityKitWho');if(!s)return false;const pm=me();const g=gById(s.value);if(!g)return false;CBAR89.who=g.id;
  for(const o of s.options){const x=gById(o.value);if(x)o.textContent=_T`${x.name} · ${effOvr(x)} · kit ${(x.kit||[]).length}/3`}
  const L=document.getElementById('cityKitList');if(L)L.innerHTML=cityKitListHTML(g);const n=document.getElementById('kit87');if(n&&typeof kitNote87==='function')n.outerHTML=kitNote87(g);
  const full=(g.kit||[]).length>=3;document.querySelectorAll('#citySideBody .cbar89ware').forEach(b=>{const m=/cityBuyKit\('[^']+',(\d+)\)/.exec(b.getAttribute('onclick')||'');if(m)b.disabled=pm.coin<+m[1]||full});return true}
/* Arena: tonight's card, or the next games here */
function cbar89CardHTML(){const n=cbar89Night();if(!n||!n.bouts){let h='';try{h=cityNextEventLine()}catch(e){}return `<div class="sect" style="margin-top:0">${_T`🏟 The arena`}</div><p class="rc-sub" style="margin:0 0 6px">${h}</p>`}
  const pm=CITY.mgr?me():null;
  const rows=n.bouts.map(b=>{const T=TIERS[b.tier]||{n:b.tier};const E=EVENTS[b.ev]||{};const win=b.res&&b.res.winners?new Set(b.res.winners):null;
    const ents=(b.ents||[]).map(id=>{const g=gById(id);if(!g)return '';const mine=pm&&g.contract&&g.contract.mgr===pm.id;return `<span class="cbar89ent ${mine?'mine':''} ${win&&win.has(id)?'won':''}">${win&&win.has(id)?'🏆 ':''}${esc(g.name)}</span>`}).join('');
    return `<div class="cbar89bout ${b.done?'done':''}"><div><b>${esc(T.n)}</b> <small>${esc(E.n||b.ev)}${b.done?_T(' · fought'):''}</small></div><div class="cbar89ents">${ents||`<span class="rc-sub">${_T`no entrants yet`}</span>`}</div></div>`}).join('');
  return `<div class="sect" style="margin-top:0">${_T`📜 Tonight's card`}</div>${rows}`}
/* People: kin, the stands and the empire's regulars in one list; filter chips only for groups that have someone */
function cbar89PeopleHTML(){const L=CITY.L;const regs=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(r=>!r.recruited&&!r.banned);
  const n=cbar89Night();const card=n?n.bouts.flatMap(b=>b.ents||[]).map(id=>gById(id)).filter(Boolean):[];const fight=new Set(card.map(g=>g.name.toLowerCase()));
  const kinOf=r=>r.kin&&r.kin.name;const kin=regs.filter(kinOf).sort((a,b)=>(fight.has(String(b.kin.name).toLowerCase())?1:0)-(fight.has(String(a.kin.name).toLowerCase())?1:0));
  const here=regs.filter(r=>r.city===L.n&&!kinOf(r));const fans=n?regs.filter(r=>!kinOf(r)&&r.city!==L.n&&r.favG&&card.some(g=>g.name===r.favG)):[];
  const seen=new Set([...kin,...here,...fans].map(r=>r.id));const rest=regs.filter(r=>!seen.has(r.id)).sort((a,b)=>(b.visits||0)-(a.visits||0)).slice(0,40);
  const face=r=>typeof specFaceSVG==='function'?specFaceSVG(r.look||{}):'';
  const row=(r,sub,hot)=>`<div class="csrow cbar89p ${hot?'hot':''}" data-cbar89reg="${esc(r.id)}" role="button" tabindex="0">${face(r)}<div><b>${esc(r.name)}</b><small>${sub}</small></div></div>`;
  const taste=r=>esc(((typeof SPECT_TASTES!=='undefined'&&SPECT_TASTES[r.taste])||['?'])[0]);
  const G=[
    ['kin',_T('👪 Kin'),_T('family of the fighters'),kin.slice(0,30).map(r=>{const f=fight.has(String(r.kin.name).toLowerCase());return row(r,_T`${esc(r.kin.rel)} of <b>${esc(r.kin.name)}</b>${f?_T(' · <b class="cbar89gold">fights here this week</b>'):''}`,f)})],
    ['here',n?_T('🎟 Ticket holders'):_T('🏟 Locals'),n?_T('coming to this week’s games'):_T`regulars of ${L.n}`,[...here,...fans].slice(0,40).map(r=>row(r,_T`${taste(r)} fan${r.favG?_T` · backs <b>${esc(r.favG)}</b>`:''}${r.city!==L.n?_T` · from ${esc(r.city||'?')}`:''}`))],
    ['empire',_T('🌍 The empire'),_T('regulars from every city'),rest.map(r=>row(r,_T`${esc(r.city||'')} · ${r.visits||0} visits${r.trouble?_T(' · <span class="cbar89red">troublemaker</span>'):''}`))]].filter(g=>g[3].length);
  if(!G.length)return `<p class="rc-sub">${_T`The square's regulars are still strangers — they come with the games.`}</p>`;
  const pf=G.some(g=>g[0]===CBAR89.pf)?CBAR89.pf:'all';
  const chips=G.length>1?`<div class="cbar89chips"><button type="button" data-cbar89pf="all" class="${pf==='all'?'on':''}">${_T`All`}</button>${G.map(g=>`<button type="button" data-cbar89pf="${g[0]}" class="${pf===g[0]?'on':''}">${g[1]} <small>${g[3].length}</small></button>`).join('')}</div>`:'';
  return chips+G.filter(g=>pf==='all'||g[0]===pf).map(g=>`<div class="cbar89grp" data-cbar89grp="${g[0]}"><div class="sect">${g[1]} <span class="rc-sub">${g[2]}</span></div>${g[3].join('')}</div>`).join('')}

/* ---------------- THIS VISIT ---------------- */
function cbar89Rec(e){if(!CITY.open)return;(CITY.visit89=CITY.visit89||[]).push(Object.assign({t:Date.now()},e));cbar89Visit();const l=document.querySelector('#cbar89Visit .cbar89vl');if(l)l.scrollTop=l.scrollHeight}
function cbar89VisitRows(){const V=CITY.visit89||[];const grp=new Map();
  V.forEach((e,i)=>{const key=e.gid||'house';if(!grp.has(key))grp.set(key,[]);grp.get(key).push([e,i])});return grp}
function cbar89Visit(){const el=document.getElementById('cbar89Visit');if(!el)return;const st=(el.querySelector('.cbar89vl')||{}).scrollTop||0;if(!CITY.mgr){el.hidden=true;return}el.hidden=false;
  const V=CITY.visit89||[];const w=CITY.w;let spent=0,back=0;
  const line=([e,i])=>{spent+=e.price||0;back+=e.ret||0;let ico='',what='',undo='';
    if(e.k==='kit'){const O=OFFER[e.key]||{n:e.key,s:''};ico=cbar89Ico(e.key);what=_T`${esc(O.n)} <small>${esc(O.s)} · kit</small>`;
      const g=gById(e.gid);if(e.ret==null&&g&&(g.kit||[]).includes(e.key)&&w&&g.kitWk===w.week){const r=Math.ceil(kitPrice87(e.key)*0.7);undo=`<button type="button" class="cbar89undo" data-cbar89undo="${i}" title="${_T`Return it to the stall: ${r} coin back`}">↶</button>`}}
    else if(e.k==='lot'){ico='⚖';what=_T`Bought at auction <small>${esc(e.woe||'')}</small>`}
    else if(e.k==='god'){const G=TEMPLE76[e.god]||['🏛',e.god,''];ico=G[0];what=_T`${esc(G[1])} <small>${G[2]}${cbar89Card()?' · '+cbar89Card():''}</small>`}
    else if(e.k==='bath'){ico='🛁';what=_T`The bathhouse <small>+2 morale each</small>`}
    else if(e.k==='tavern'){ico='🍷';what=_T`A round at the tavern <small>+3 morale each</small>`}
    else if(e.k==='lup'){ico='🌙';what=_T`An evening at the lupanar <small>a rival warms to you</small>`}
    else if(e.k==='sign'){ico='✍';what=_T`Signed in the square <small>${esc(e.from||'')}</small>`}
    else {ico='🎟';what=_T`${esc(e.what||'')} <small>${esc(e.name||'')}</small>`}
    const cost=e.ret!=null?`<s>${coinAmt87(e.price)}</s><small class="cbar89back">${_T`↶ +${e.ret} back`}</small>`:e.price?coinAmt87('-'+e.price):`<small>${_T`free`}</small>`;
    return `<div class="cbar89vi ${e.ret!=null?'ret':''}"><span class="cbar89vico">${ico}</span><span class="cbar89vw">${what}</span><span class="cbar89vc">${cost}</span>${undo}</div>`};
  const rows=[...cbar89VisitRows()].map(([key,L])=>{const g=key==='house'?null:gById(key);
    const head=g?`<span class="cbar89vf">${cbar89Fig(g)}</span><b>${esc(g.name)}</b>`:`<span class="cbar89vf cbar89house">🏛</span><b>${_T`The whole house`}</b>`;
    return `<div class="cbar89vg"><div class="cbar89vgh">${head}</div>${L.map(line).join('')}</div>`}).join('');
  const net=spent-back;
  el.innerHTML=`<div class="cbar89vh">${_T`🧾 This visit`}${V.length?`<small>${_T`${V.length} item${V.length===1?'':'s'}`}</small>`:''}</div>
    <div class="cbar89vl">${rows||`<p class="cbar89empty">${_T`Nothing bought yet — the stalls are open.`}</p>`}</div>
    ${V.length?`<div class="cbar89vt">${_T`Spent here`} <b>${coinAmt87(net)}</b>${back?` <small>${_T`(${back} back)`}</small>`:''}</div>`:''}`;const l=el.querySelector('.cbar89vl');if(l)l.scrollTop=st}
/* the house's fighters on this week's card (who a temple blessing reaches) */
function cbar89Card(){const n=cbar89Night();if(!n||!CITY.mgr)return '';const pm=me();const ids=[...new Set(n.bouts.flatMap(b=>b.ents||[]))];
  const mine=ids.map(gById).filter(g=>g&&g.contract&&g.contract.mgr===pm.id);return mine.length?_T`for ${mine.map(g=>esc(g.name)).join(', ')}`:''}

/* ---------------- the render: replaces 25-city's citySideDraw ---------------- */
citySideDraw=function(){const side=cbar89Side();if(!side||!CITY.L)return;
  if(!side.dataset.cbar89){if(CITY.side==='kin'||CITY.side==='stands'||CITY.side==='roster')CITY.side=CITY.mgr?'stalls':'people';cbar89Build(side)}
  if(!cbar89TabOK(CITY.side))CITY.side=CITY.mgr?'stalls':'people';
  cbar89Head();cbar89Tabs();cbar89Body();cbar89Visit();if(CBAR89.last!==CITY.side){CBAR89.last=CITY.side;const b=document.getElementById('citySideBody');if(b)b.scrollTop=0}};
function cbar89Refresh(tabs){if(!CITY.open||!cbar89Side()||!cbar89Side().dataset.cbar89)return;cbar89Visit();cbar89HeadLive();if(CITY.side==='stalls'&&tabs&&tabs.includes('stalls')&&cbar89StallsSync())return;if(!tabs||tabs.includes(CITY.side)){const b=document.getElementById('citySideBody');const st=b?b.scrollTop:0;cbar89Body();if(b)b.scrollTop=st}}

/* ---------------- routing: panels render into their tab when the sidebar is up ---------------- */
{const base=cityPanel;cityPanel=function(html){if(CBAR89.route&&html){const el=document.querySelector(CBAR89.route);if(el){el.innerHTML=html;return}}return base.apply(this,arguments)}}
{const base=cityShopPanel;cityShopPanel=function(key){if((key==='arms'||key==='armor')&&cbar89Open('stalls',{focus:key}))return;if(key==='arena'&&cbar89Open('arena',{focus:'arena'}))return;if(key==='auction')return cityAuctionPanel();return base.apply(this,arguments)}}
{const base=cityAuctionPanel;cityAuctionPanel=function(){if(cbar89Open('auction'))return;return base.apply(this,arguments)}}
{const base=cityTemplePanel89;cityTemplePanel89=function(){try{const n=CITY.w&&CITY.w.night;if(n&&n.god76&&n.god76!==CITY.god0_89&&!(CITY.visit89||[]).some(e=>e.k==='god')){CITY.god0_89=n.god76;cbar89Rec({k:'god',god:n.god76,price:templeCost76(n.god76)})}}catch(e){}
  if(cbar89Open('temple'))return;return base.apply(this,arguments)}}
{const base=cityTrainPanel89;cityTrainPanel89=function(){if(cbar89Open('arena',{focus:'train'}))return;return base.apply(this,arguments)}}
{const base=openCitySquare;openCitySquare=function(li,o){const was=CITY.open;if(!was)CITY.visit89=[];const r=base.apply(this,arguments);try{if(!was&&CITY.open){CITY.visit89=[];CITY.god0_89=CITY.w&&CITY.w.night?CITY.w.night.god76:null;cbar89Refresh()}}catch(e){console.error(e)}return r}}

/* ---------------- recording what was bought ---------------- */
{const base=cityBuyKit;cityBuyKit=function(key,price){const pm=me();const s=document.getElementById('cityKitWho');const g=s&&gById(s.value);const c0=pm?pm.coin:0;const n0=g?(g.kit||[]).length:0;
  const r=base.apply(this,arguments);try{if(g&&pm&&(g.kit||[]).length>n0)cbar89Rec({k:'kit',gid:g.id,key,price:c0-pm.coin});cbar89Refresh(['stalls'])}catch(e){console.error(e)}return r}}
{const base=cityKitDrop;cityKitDrop=function(gid,i){const pm=me();const g=gById(gid);const key=g&&g.kit?g.kit[i]:null;const c0=pm?pm.coin:0;
  const r=base.apply(this,arguments);try{if(key&&pm){const e=(CITY.visit89||[]).slice().reverse().find(x=>x.k==='kit'&&x.gid===gid&&x.key===key&&x.ret==null);if(e)e.ret=pm.coin-c0}cbar89Refresh(['stalls'])}catch(e){console.error(e)}return r}}
{const base=cityBuyLot;cityBuyLot=function(gid){const pm=me();const g=gById(gid);const c0=pm?pm.coin:0;const had=!!(g&&g.contract);
  const r=base.apply(this,arguments);try{if(g&&pm&&!had&&g.contract&&g.contract.mgr===pm.id)cbar89Rec({k:'lot',gid,price:c0-pm.coin,woe:g.woe})}catch(e){console.error(e)}return r}}
for(const [fn,k] of [['cityBath','bath'],['cityTavern','tavern'],['cityLup','lup']]){const base=window[fn];if(typeof base!=='function')continue;
  window[fn]=function(){const pm=me();const c0=pm?pm.coin:0;const r=base.apply(this,arguments);try{if(pm&&pm.coin<c0)cbar89Rec({k,price:c0-pm.coin})}catch(e){}return r}}
/* a face from the stands signed or treated in the square: the crowd's own handler acts, we look a moment later */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('#cityPanel [data-spact]');if(!a||!CITY.open||!CITY.mgr||a.dataset.spact==='close'||a.dataset.spact==='ban')return;
  const pm=me();const c0=pm.coin;const ids=new Set(rosterOf(pm).map(g=>g.id));const reg=CITY.sel&&CITY.sel.reg;const act=a.dataset.spact;
  setTimeout(()=>{try{if(!CITY.open)return;const p2=me();const nu=rosterOf(p2).filter(g=>!ids.has(g.id));for(const g of nu)cbar89Rec({k:'sign',gid:g.id,price:0,from:reg?_T`from the stands`:''});
    if(p2.coin<c0)cbar89Rec({k:'spect',price:c0-p2.coin,what:act==='ticket'?_T('A ticket'):act==='treat'?_T('A round of wine'):_T('A favour'),name:reg?reg.name:''})}catch(err){}},900)});

/* ---------------- the sidebar's own clicks ---------------- */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#citySide [data-cbar89undo],#citySide [data-cbar89pf],#citySide [data-cbar89reg]');if(!t||!CITY.open)return;
  if(t.dataset.cbar89undo!=null){const v=(CITY.visit89||[])[+t.dataset.cbar89undo];const g=v&&gById(v.gid);if(!g||!g.kit)return;const i=g.kit.lastIndexOf(v.key);if(i>=0)cityKitDrop(g.id,i);return}
  if(t.dataset.cbar89pf){CBAR89.pf=t.dataset.cbar89pf;cbar89Refresh(['people']);return}
  if(t.dataset.cbar89reg){const r=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).find(x=>String(x.id)===t.dataset.cbar89reg);if(r)citySelect({kind:'spec',reg:r,name:r.name})}});
document.addEventListener('change',e=>{const s=e.target;if(!s||s.id!=='cityKitWho'||!s.closest('#citySide'))return;CBAR89.who=s.value;cbar89Refresh(['stalls'])});
/* coin moves elsewhere in the square (auction, temple, baths): keep the stall buttons' affordability honest */
{let last=null;setInterval(()=>{if(!CITY.open||!CITY.mgr||CITY.side!=='stalls'||!cbar89Side()||!cbar89Side().dataset.cbar89)return;const c=me().coin;if(last!==null&&c!==last)cbar89Refresh(['stalls']);last=c},700)}

(()=>{const st=document.createElement('style');st.textContent=`
#cityOv .cityside.cbar89{width:340px;background:linear-gradient(180deg,#2c1e13,#1f150d);border-left:2px solid #8a6a32;gap:0}
.cbar89hd{margin:8px 8px 4px;padding:7px 10px 6px;border-radius:6px;background:linear-gradient(180deg,#f3e6c6,#e2cd9e);border:1px solid #b8913a;color:#3a2614;box-shadow:0 2px 8px rgba(0,0,0,.45);flex:none}
.cbar89t{display:flex;align-items:baseline;gap:6px;font:400 18px var(--display);color:#7a2c14;line-height:1.1}.cbar89t img{height:14px;align-self:center}.cbar89t small{font:italic 12px var(--serif,Georgia),serif;color:#7a6040;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.cbar89n{font-size:12.5px;line-height:1.3;margin-top:3px;color:#4a3420}.cbar89n b{color:#7a2c14}
.cbar89r{display:flex;gap:8px;align-items:center;margin-top:4px;font-size:12.5px;flex-wrap:wrap}.cbar89r>span{background:rgba(255,255,255,.35);border:1px solid #c9ab6a;border-radius:10px;padding:1px 8px}.cbar89r .ico{height:14px;vertical-align:-2px}
#cbar89Clock.soon{background:#c4643a;color:#fff3dc;border-color:#e0b25a}
.cbar89tabs{display:flex;flex-wrap:wrap;gap:4px;margin:4px 8px;justify-content:flex-start}
.cbar89tabs button{background:#3a2416;border:1px solid #6b4a2a;color:#ecd9b2;border-radius:14px;padding:3px 9px;font-size:12.5px;cursor:pointer;line-height:1.3}
.cbar89tabs button:hover{border-color:#d6ab4c}.cbar89tabs button.on{background:linear-gradient(180deg,#c9693c,#9a4424);color:#fff4de;border-color:#e6b95c;box-shadow:0 0 0 1px rgba(230,185,92,.25)}
.cbar89tabs .cbar89fold{margin-left:auto;padding:3px 7px}
.cbar89body{flex:1 1 0;min-height:70px;font-size:13px;padding:4px 10px 8px;border-top:1px solid rgba(184,145,58,.35)}
.cbar89body .sect{margin-top:8px}.cbar89body .card2{font-size:13px;padding:6px 9px;margin-bottom:4px}.cbar89body .card2 p{font-size:13px}.cbar89body .kit87{font-size:11.5px;margin:3px 0;line-height:1.35}
.cbar89who{display:flex;gap:6px;align-items:center;font-size:12.5px;color:var(--muted)}.cbar89who select{flex:1;min-width:0}
.cbar89kit{background:rgba(0,0,0,.18);border:1px solid #4a3826;border-radius:5px;padding:2px 8px 6px;margin:4px 0}.cbar89kit .sect{margin-top:4px}
.cbar89wares{display:grid;grid-template-columns:1fr;gap:4px}
.cbar89ware{display:grid;grid-template-columns:26px 1fr auto;gap:8px;align-items:center;text-align:left;background:linear-gradient(180deg,#3b2818,#2e1f13);border:1px solid #6b4a2a;border-radius:5px;color:var(--bone);padding:4px 8px;cursor:pointer;font:inherit;font-size:12.5px}
.cbar89ware:hover:not([disabled]){border-color:#e6b95c;background:linear-gradient(180deg,#4a321d,#3a2818)}.cbar89ware[disabled]{opacity:.45;cursor:default}
.cbar89ware small{display:block;color:var(--muted);font-size:11.5px}.cbar89ware em{font-style:normal;white-space:nowrap}.cbar89ware .rtok,.cbar89ware img{max-width:24px;max-height:24px}
[data-cbar89sec].cbar89hi{animation:cbar89hi 1.4s ease-out}@keyframes cbar89hi{0%{box-shadow:0 0 0 2px #e6b95c;border-radius:5px}100%{box-shadow:0 0 0 2px rgba(230,185,92,0)}}
.cbar89bout{border:1px solid #4a3826;border-radius:5px;padding:4px 8px;margin-bottom:4px;background:rgba(0,0,0,.16);font-size:12.5px}.cbar89bout.done{opacity:.7}.cbar89bout small{color:var(--muted)}
.cbar89ents{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px}.cbar89ent{background:#2e2016;border:1px solid #4a3826;border-radius:9px;padding:0 7px;font-size:11.5px}.cbar89ent.mine{border-color:#d6ab4c;color:var(--gold2)}.cbar89ent.won{background:#3d3214}
.cbar89chips{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}.cbar89chips button{background:#2e2016;border:1px solid #5a432c;color:#e3cfa6;border-radius:12px;padding:1px 8px;font-size:12px;cursor:pointer}.cbar89chips button.on{background:#7a3a1e;border-color:#d6ab4c;color:#fff2d8}.cbar89chips small{opacity:.75}
.cbar89p{cursor:pointer}.cbar89p:hover{background:rgba(240,207,125,.07)}.cbar89gold{color:var(--gold2)}.cbar89red{color:var(--blood2)}
.cbar89visit{flex:0 0 auto;max-height:40%;min-height:0;display:flex;flex-direction:column;margin:6px 8px 8px;border-radius:6px;background:linear-gradient(180deg,#f1e2bf,#dfc896);border:1px solid #b8913a;color:#3a2614;box-shadow:0 -2px 10px rgba(0,0,0,.35)}
.cbar89vh{display:flex;justify-content:space-between;align-items:baseline;padding:5px 10px 3px;font:400 16px var(--display);color:#7a2c14;border-bottom:1px solid rgba(138,106,50,.45);flex:none}.cbar89vh small{font:12px var(--body,inherit);color:#7a6040}
.cbar89vl{overflow-y:auto;min-height:0;padding:2px 8px}
.cbar89empty{margin:6px 2px;font-size:12.5px;font-style:italic;color:#6b5236}
.cbar89vg{border-bottom:1px dashed rgba(138,106,50,.45);padding:3px 0}.cbar89vg:last-child{border-bottom:0}
.cbar89vgh{display:flex;align-items:center;gap:6px;font-size:13px}.cbar89vgh small{color:#6b5236;font-size:11.5px}
.cbar89vf{display:inline-flex;align-items:flex-end;justify-content:center;width:24px;height:34px;flex:none}.cbar89house{font-size:18px;align-items:center}
.cbar89vi{display:grid;grid-template-columns:24px 1fr auto auto;gap:6px;align-items:center;margin-left:30px;font-size:12.5px;padding:1px 0}
.cbar89vi.ret .cbar89vw{opacity:.6;text-decoration:line-through}.cbar89vw small{color:#6b5236;margin-left:3px}.cbar89vico{display:inline-flex;justify-content:center;font-size:15px}.cbar89vico .rtok,.cbar89vico img{max-width:22px;max-height:22px}
.cbar89vc{white-space:nowrap;color:#5a2410;font-weight:600}.cbar89vc small{font-weight:400}.cbar89back{display:block;color:#2f6a2a}
.cbar89undo{background:#fff6e0;border:1px solid #b8913a;color:#7a2c14;border-radius:50%;width:22px;height:22px;padding:0;cursor:pointer;font-size:13px;line-height:1}.cbar89undo:hover{background:#c4643a;color:#fff}
.cbar89vt{flex:none;display:flex;justify-content:flex-end;gap:5px;align-items:baseline;padding:4px 10px 5px;border-top:1px solid rgba(138,106,50,.45);font-size:13px}.cbar89vt small{color:#6b5236}
.cbar89visit .amt87,.cbar89hd .amt87{color:inherit}
#cityOv.sidefold .cityside.cbar89{width:auto}#cityOv.sidefold .cbar89hd,#cityOv.sidefold .cbar89visit{display:none}
@media (max-width:900px){#cityOv .citymain2{flex-direction:column}#cityOv .cityside.cbar89{display:flex;width:auto;height:52%;flex:none;border-left:0;border-top:2px solid #8a6a32}
  #cityOv.sidefold .cityside.cbar89{height:auto}.cbar89hd{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin:5px 6px 2px;padding:4px 8px}.cbar89t{font-size:16px}.cbar89t small,.cbar89n{display:none}.cbar89r{margin-top:0}
  .cbar89tabs{flex-wrap:nowrap;overflow-x:auto;margin:3px 6px;scrollbar-width:none}.cbar89tabs button{flex:none}
  .cbar89visit{max-height:36%;margin:4px 6px 6px}.cbar89vi{margin-left:18px}.cityhint{display:none}}
@media (max-width:600px){#cityOv .citybar{flex-wrap:wrap;gap:4px 6px;padding:4px 8px;font-size:15px}#cityOv .citybar>b{flex:1 1 100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #cityOv #cityLand,#cityOv #cityNext,#cityOv #cityCoin,#cityOv #cityClock,#cityOv .citybar .flagchip{display:none!important}#cityOv .citybar .btn{padding:2px 8px;font-size:13px}}
@media (max-width:900px) and (max-height:500px){#cityOv .citymain2{flex-direction:row}#cityOv .cityside.cbar89{width:300px;height:auto;border-top:0;border-left:2px solid #8a6a32}
  .cbar89r{display:none}.cbar89visit{max-height:40%}}`;document.head.appendChild(st)})();
