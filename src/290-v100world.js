/* =====================================================================
   290-v100world · v1.0 MANAGER WORLD TABS (his picks W1–W9 all a, 2026-10-11; mock tools/plans/mock100/world.html)
   =====================================================================
   ONE SHELL for the five World tabs of the Manager rail (32 MGR_GROUPS World: news, league, imp, trophy, sched): a painted banner per tab
   (keeps .roomhd.b73.b73-<tab> + .roomttl so 95's banner tests still hold), a parchment body (.wd100body), bronze-plaque section heads
   (.wd100plq), one-line rows (.wd100r — never wrapping, ellipsis), shared faces / grade chips / coin + wheat icons and the house PARMA insignia
   (parma100: a round shield in the house banner's colours with its emblem, cached). A final mgrHTML wrapper re-homes: the banner element is
   swapped, the tab's new view goes into #mgrPane, and the tab's OLD content stays underneath (folded where the new view covers it) so every
   existing handler / data attribute keeps working (the scouting card, ⚔ Challenge, team screens, billing, the glass case, the Imperium layers).
   v1.0 (his 1c, 2026-10-11): NO FOLDS any more — what was useful in the old content moved INTO the new views (below), with the old handlers / data-
   attributes / ids intact (cm_set/cm_undo + #cm_<abs>, iv_open/iv_withdraw, arcpap/arcopen/arcback, data-hubview, data-lg90ch, data-mg="team" …).
   1 NEWS = "The Forum Wall": the latest Acta Diurna pinned on top (Darwinius · Rabble-rousers (284 w.rab100 via P.rabble) · Victors, 📜 Read
       it = data-mg="paper"), then a wall of programmata tiles 3 across from w.news + this week's world events — face / house parma / emblem,
       tag Ours · Rival · Arena · Empire, its effect; filter chips (WD100.nf). Every notice of the old list is on the wall (Show all N notices, the four filters cover them), the Ludus Archives
       (archiveHTML: editions, season recaps) sit under it.
   2 LEAGUE = "The Standings": the 231 podium (lp96Podium, Superbus cup) in the banner, the next-prize bar (185 lp90Next), rows: place,
       parma, house + lanista, Points (284's), a 5-dot form strip (the house's last five weeks), top gladiator face + grade, W-L, rivalry
       flames; a row selects the house (MGR.lg90) → FIXED RIGHT COLUMN house card (scutum, lanista, top three, 🔍 Scouting card = 185's lg90HTML,
       ⚔ Challenge = 185's [data-lg90ch] (w.chal76), 🏛 Team screen). The old full ledger's per-house facts (roster, fame, treasury, morale, rivals, heat toward
       you, all-time record, bets, personality, latest event, prize now) = the "Ledger" section of the house card (wd100Ledger); prizes on a row's hover.
   3 IMPERIUM: the empire map (assets/map.jpg) with a pin per city at MAP_PX (this week's host, home, closed, event/weather badges, fans glow)
       and the WORLD EVENTS column (severity, crowd effect); a pin opens the city card beside it (arena stone AR91MAT, stalls CITY94/SPEC94,
       temple, recruits CITY_CLS99, news, your fans, next games with the card art). 🏛 Walk the square only when citySquareGate allows it
       (the existing data-ct="square" entry); no "Plan a trip" (his call). The old map's layers (fans & roads, weather, world events, war map) = four toggle
       chips on the new map (WD100.lay; wd100LayerSVG runs 18-world's own drawing with them, cut down to the layers); the old map is gone in the Manager
       (the Stands window keeps it). The rest of the old window (empire strip, city file, roster, family ties) = "The city file" under the map in
       #standsHubBody.wd100file (a standsHubHTML wrapper keeps it on crowd refreshes).
   4 TROPHIES = "The Tituli": bronze plaques with the trophies' own art (trophySVG — never emoji), catalogue order, earned ones lit, locked =
       dark silhouette + a progress bar where it can be measured; filter Manager · Play Now (Store hallTrophies) · Online (ONL82.dg.trophies when
       this session loaded the Domus). tituli100Plaque() is the reusable plaque. The glass case (22 trophyRoomHTML) stays under it.
   5 SEASON = "The Calendar": 12 week tablets + the Final (Superbus in Roma), byes as stone, past weeks with your place + points (231 acta96),
       DARK tablets on the light parchment (his note: more contrast) and the current week in a gold frame with "THIS WEEK" (scrolled into view
       when the tab opens); switcher This season · Next · The one after (seasonSchedule; TBA for what is not decided). The LISTS (Your Acta,
       Still to come, the later seasons' fixtures) are dark ink on near-white striped rows (AA ≥ 4.5 incl. small text), the current week's row
       highlighted. Billing (early billing rows, upcoming weeks) + Invitations (one-line rows, Answer ▸ = 231's
       fighter popup) + the Superbus note sit under the lists as "Billing" / "Invitations"; a finished week's Acta results card = one line in Your Acta.
   TROPHIES: season-award plaques show NO tally before week 12 ("awarded at season's end"); the banner shows ONLY earned trophies (wd100TroBest: cups
       first, other awards, then the laughs; ties = most recent): none = 4 empty plinths + "Your first honour awaits", all = a laurel ring "ALL n".
   Phones (≤600): one column, 3-across tablets, the Manager rail is already a bottom pill row (99). Display only: no world data changes.
   Kill switch localStorage flavius_world100off=1 → today's tabs. Test tv100w2.
   ===================================================================== */
const WD100={tabs:['news','league','imp','trophy','sched'],nf:'all',nmore:false,lay:{fans:1,weather:1,events:1,war:0},tf:'mgr',sea:0,city:null,scout:false,hall:null,hallBusy:false,last:null,
  off:(()=>{try{return localStorage.getItem('flavius_world100off')==='1'}catch(e){return false}})()};
const wd100On=()=>{if(WD100.off)return false;try{const w=W_();return !!(w&&!w.dead&&!MGR.view&&me())}catch(e){return false}};
const wd100Asset=f=>typeof assetURL==='function'?assetURL(f):'assets/'+f;
const wd100Key=w=>`m:${w.id}:${w.season}:${w.week}`;
const wd100Wk=w=>((w.week-1)%12)+1;
const WD100_ENT={'&quot;':'"','&#39;':"'",'&amp;':'&','&lt;':'<','&gt;':'>','&nbsp;':' '};
const wd100Strip=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&(quot|#39|amp|lt|gt|nbsp);/g,m=>WD100_ENT[m]).replace(/\s+/g,' ').trim();

/* ---------- shared pieces ---------- */
/* small ink icons (map badges, world events, rail of the shell) — never emoji on art */
const WD100I={
  news:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M7 7h10M7 11h10M7 15h6"/></svg>',
  league:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20h16M6 20v-6h4v6M10 20V9h4v11M14 20v-8h4v8"/></svg>',
  imp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8l-1-3H9z"/></svg>',
  sched:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2"/></svg>',
  volcano:'<svg viewBox="0 0 24 24"><path d="M3 21l6-10h6l6 10z" fill="#6a4a34"/><path d="M9 11l1.5-2h3L15 11z" fill="#3a2a1c"/><path d="M12 9c-1-3 1-4 0-7M10 8c-2-2-1-4-3-5M14 8c2-2 1-4 3-5" stroke="#d24a2a" stroke-width="1.6" fill="none"/></svg>',
  plague:'<svg viewBox="0 0 24 24"><path d="M12 3v18" stroke="#6a4216" stroke-width="1.8"/><path d="M8 7c4-2 4 3 8 1M8 11c4-2 4 3 8 1M8 15c4-2 4 3 8 1" stroke="#5f8f3f" stroke-width="1.6" fill="none"/><circle cx="12" cy="3" r="1.6" fill="#6a4216"/></svg>',
  military:'<svg viewBox="0 0 24 24"><path d="M12 3l2 3h-4z M5 9c3 0 5 1 7 3 2-2 4-3 7-3-1 3-3 5-7 6-4-1-6-3-7-6z" fill="#8a5a1a"/><path d="M12 15v6M9 21h6" stroke="#6a4216" stroke-width="1.8"/></svg>',
  famine:'<svg viewBox="0 0 24 24"><path d="M12 22V8" stroke="#8a6414" stroke-width="1.6"/><g fill="#c99a3a"><ellipse cx="12" cy="5" rx="1.8" ry="3"/><ellipse cx="9.5" cy="9" rx="1.6" ry="2.8" transform="rotate(-30 9.5 9)"/><ellipse cx="14.5" cy="9" rx="1.6" ry="2.8" transform="rotate(30 14.5 9)"/><ellipse cx="9.5" cy="13" rx="1.6" ry="2.8" transform="rotate(-30 9.5 13)"/><ellipse cx="14.5" cy="13" rx="1.6" ry="2.8" transform="rotate(30 14.5 13)"/></g></svg>',
  trade:'<svg viewBox="0 0 24 24"><path d="M4 15h16l-3 5H7z" fill="#6a4216"/><path d="M12 3v12M12 4l6 9h-6z" fill="#e8dcc0" stroke="#6a4216" stroke-width="1"/></svg>',
  economy:'<svg viewBox="0 0 24 24"><path d="M8 7c-3 3-4 7-3 10 1 3 13 3 14 0 1-3 0-7-3-10z" fill="#b07a34"/><path d="M8 7l1-3h6l1 3z" fill="#8a5a1a"/><circle cx="12" cy="13" r="2.4" fill="#f0cf7d"/></svg>',
  politics:'<svg viewBox="0 0 24 24"><path d="M4 9l8-5 8 5z" fill="#8a6a9a"/><g fill="#b89ac8"><rect x="6" y="10" width="2.4" height="8"/><rect x="10.8" y="10" width="2.4" height="8"/><rect x="15.6" y="10" width="2.4" height="8"/></g><rect x="4" y="18" width="16" height="2.4" fill="#8a6a9a"/></svg>',
  geo:'<svg viewBox="0 0 24 24"><path d="M2 20l7-11 4 6 3-4 6 9z" fill="#7a5a3a"/><path d="M11 4l-2 5 3 1-2 5" stroke="#c0433a" stroke-width="1.6" fill="none"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="#e2a72e"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="#b07a1a" stroke-width="1.6"/></svg>',
  heat:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="#e2702e"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="#b0441a" stroke-width="1.6"/></svg>',
  rain:'<svg viewBox="0 0 24 24"><path d="M6 13a4 4 0 0 1 1-8 5 5 0 0 1 9 1 3.5 3.5 0 0 1 1 7z" fill="#8a96a3"/><path d="M8 16l-1 3M12 16l-1 3M16 16l-1 3" stroke="#2c5a8c" stroke-width="1.6"/></svg>',
  storm:'<svg viewBox="0 0 24 24"><path d="M6 12a4 4 0 0 1 1-8 5 5 0 0 1 9 1 3.5 3.5 0 0 1 1 7z" fill="#5a6470"/><path d="M12 12l-3 5h3l-2 5 5-7h-3l2-3z" fill="#f0cf3a"/></svg>',
  fog:'<svg viewBox="0 0 24 24"><path d="M3 8h14M6 12h15M3 16h13M7 20h10" stroke="#8a96a3" stroke-width="2" stroke-linecap="round"/></svg>',
  wind:'<svg viewBox="0 0 24 24" fill="none" stroke="#6a7a8a" stroke-width="1.8" stroke-linecap="round"><path d="M3 9h12a3 3 0 1 0-3-3M3 14h16a3 3 0 1 1-3 3M3 19h8"/></svg>',
  flame:'<svg viewBox="0 0 12 14" width="11" height="13" aria-hidden="true"><path d="M6 1c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 2 1 2 0-3 0-4 1-6z" fill="#c0433a"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="#d8c8aa"><path d="M7 10V7a5 5 0 0 1 10 0v3h1v11H6V10zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>'};
/* the house parma (round shield) and scutum (tall shield): the banner's colours + its emblem (flagURI's device), gilt rim. Cached per house look. */
const WD100P=new Map();
function wd100Flag(m){const f=(typeof mgrFlagOf==='function'&&mgrFlagOf(m))||{bg:m.color||'#6a4216',fg:'#f0cf7d',shape:'eagle'};return f}
function wd100Emb(f){try{return flagURI(f.bg,f.fg,'',f.shape)}catch(e){return ''}}
function parma100(m,px=28){if(!m)return '';const f=wd100Flag(m);const k='p|'+[f.bg,f.fg,f.shape].join('|');let s=WD100P.get(k);
  if(!s){const id='w1p'+(hashStr(k)%1e8);const u=wd100Emb(f);
    s=`<svg viewBox="0 0 100 100" class="wd100parma" aria-hidden="true"><defs><clipPath id="${id}c"><circle cx="50" cy="50" r="40"/></clipPath><radialGradient id="${id}g" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe7a8"/><stop offset=".55" stop-color="#b0843a"/><stop offset="1" stop-color="#5a3a12"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill="url(#${id}g)"/><circle cx="50" cy="50" r="41" fill="${esc(f.bg)}"/>${u?`<g clip-path="url(#${id}c)"><image href="${u}" x="-16" y="13" width="132" height="74.8" preserveAspectRatio="none"/></g>`:''}
      <circle cx="50" cy="50" r="40.5" fill="none" stroke="#2a1606" stroke-opacity=".55" stroke-width="1.5"/><circle cx="50" cy="50" r="34" fill="none" stroke="${esc(f.fg)}" stroke-opacity=".35" stroke-width="1.2"/>
      ${[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return `<circle cx="${(50+44.5*Math.cos(a)).toFixed(1)}" cy="${(50+44.5*Math.sin(a)).toFixed(1)}" r="2" fill="#fff0c0" stroke="#5a3a12" stroke-width=".6"/>`}).join('')}</svg>`;WD100P.set(k,s)}
  return `<span class="wd100par" style="width:${px}px;height:${px}px" title="${esc(m.ludus||'')}">${s}</span>`}
function scutum100(m){const f=wd100Flag(m);const k='s|'+[f.bg,f.fg,f.shape].join('|');let s=WD100P.get(k);
  if(!s){const id='w1s'+(hashStr(k)%1e8);const u=wd100Emb(f);
    s=`<svg viewBox="0 0 80 120" class="wd100scu" aria-hidden="true"><defs><clipPath id="${id}c"><rect x="7" y="7" width="66" height="106" rx="12"/></clipPath><linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#7a5418"/><stop offset=".45" stop-color="#ffe0a0"/><stop offset="1" stop-color="#6a4410"/></linearGradient></defs>
      <rect x="2" y="2" width="76" height="116" rx="16" fill="url(#${id}g)"/><rect x="7" y="7" width="66" height="106" rx="12" fill="${esc(f.bg)}"/>${u?`<g clip-path="url(#${id}c)"><image href="${u}" x="-26" y="-6" width="132" height="74.8" preserveAspectRatio="none"/></g>`:''}
      <path d="M7 60h66" stroke="${esc(f.fg)}" stroke-opacity=".4" stroke-width="2"/><circle cx="40" cy="78" r="11" fill="url(#${id}g)" stroke="#3a2208" stroke-width="1"/><circle cx="36" cy="74" r="3" fill="#fff4cc" opacity=".7"/></svg>`;WD100P.set(k,s)}
  return s}
const face100=g=>g?`<span class="wd100fc">${gArt(g,'xs')}</span>`:'<span class="wd100fc"></span>';
const GK100={'A+':'a','A':'a','B+':'bp','B':'b','C+':'cp','C':'c','D':'d','F':'f'};
const gch100=(gr,tip)=>`<span class="wd100gch g-${GK100[gr]||'q'}"${tip?` title="${esc(tip)}"`:''}>${esc(gr)}</span>`;
function wd100Grade(g,m){if(!g)return gch100('?');const mine=m&&m.isPlayer;const sc=mine||g.scout;const v=sc?effOvr(g):pubOvr(g);
  return gch100(trait96Grade(v),sc?_T('Rating grade'):_T('Public estimate — scout them for the true grade'))}
const flames100=v=>{const n=(v||0)>=60?3:(v||0)>=35?2:(v||0)>=15?1:0;return n?`<span class="wd100riv" title="${esc(rivalTier(v))}">${WD100I.flame.repeat(n)}</span>`:''};
const plq100=(t,small)=>`<div class="wd100plq"><b>${t}</b><span class="sp"></span>${small?`<small>${small}</small>`:''}</div>`;
const seg100=(attr,cur,opts)=>`<div class="wd100seg" role="group">${opts.map(([k,l])=>`<button type="button" ${attr}="${k}" class="${cur===k?'on':''}" aria-pressed="${cur===k}">${l}</button>`).join('')}</div>`;
/* a dark panel for content moved in from the old tabs (archives, glass case, the city file) — their own handlers keep working */
const dark100=(cls,html)=>html?`<div class="wd100dk ${cls||''}">${html}</div>`:'';

/* ---------- the banner ---------- */
/* the banner shows ONLY earned trophies: Flavian / Superbus / Aureus / Colossus cups first, then the other awards, then "for the laughs"; ties = the most recent */
const TRO100_TOP=['flavian_cup','palm_roma','aureus','colossus'];
function wd100TroBest(w){const lib=new Set(TROPHY_LIB.map(d=>d.id));const own=new Map();(w.trophies||[]).forEach((t,i)=>{if(!t||!t.tid||!lib.has(t.tid))return;const k=(t.season||0)*1000+i;if(!own.has(t.tid)||k>own.get(t.tid))own.set(t.tid,k)});
  const rank=id=>{const i=TRO100_TOP.indexOf(id);if(i>=0)return [0,i];const d=trophyDef(id);return [d&&d.cat==='fun'?2:1,0]};
  return [...own.entries()].sort((a,b)=>{const ra=rank(a[0]),rb=rank(b[0]);return ra[0]-rb[0]||ra[1]-rb[1]||b[1]-a[1]}).map(x=>x[0])}
/* a gold laurel ring round the count when every trophy is earned */
function wd100AllRing(n){const L=[];for(let i=0;i<10;i++){const t=.22+i*.28;for(const sx of [-1,1]){const x=60+sx*50*Math.sin(t),y=34+29*Math.cos(t);const ang=Math.atan2(-29*Math.sin(t),sx*50*Math.cos(t))*57.3;
      L.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="3" transform="rotate(${ang.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#w1lg)" stroke="#6a4a14" stroke-width=".5"/>`)}}
  return `<span class="wd100all" title="${esc(_T`Every trophy earned`)}"><svg viewBox="0 0 120 68" aria-hidden="true"><defs><linearGradient id="w1lg" x1="0" x2="1"><stop offset="0" stop-color="#ffeaa8"/><stop offset="1" stop-color="#b0843a"/></linearGradient></defs><path d="M60 63v4" stroke="#b0843a" stroke-width="2"/>${L.join('')}</svg><b>${_T`ALL ${n}`}</b></span>`}
function wd100Pic(k){try{
  if(k==='imp')return `<div class="pic" style="background-image:url('${wd100Asset('map.jpg')}');background-position:center 32%"></div>`;
  if(k==='trophy'){const show=wd100TroBest(W_()).slice(0,4);const pic=`<div class="pic" style="background-image:url('${wd100Asset('stone_wall.webp')}')"></div>`;
    if(!show.length)return pic+`<div class="wd100tro none">${[0,1,2,3].map(()=>'<div class="wd100pl"><span class="gh"></span><i></i></div>').join('')}<div class="wd100first">${_T('Your first honour awaits')}</div></div>`;
    return pic+`<div class="wd100tro">${show.map(id=>{const d=trophyDef(id);return d?`<div class="wd100pl" title="${esc(d.name)}"><span class="tr">${trophySVG(d,64)}</span><i></i></div>`:''}).join('')}</div>`}
  if(k==='news'&&typeof SCENE99==='function')return `<div class="pic">${typeof scene100==='function'?scene100('promote','banner'):SCENE99('promote','banner')}</div>`; /* v1.0: 294a's cached picture (no live SVG grain on a redraw) */
  if(k==='sched'){const w=W_();const L=w.night&&LOCATIONS[w.night.loc];const u=L&&typeof C90T!=='undefined'?C90T[L.n]:'';if(u)return `<div class="pic" style="background-image:url(${u});background-position:center 40%"></div>`}
  return `<div class="pic">${typeof roomScene73==='function'?roomScene73(k==='league'?'night':k):''}</div>`}catch(e){console.error(e);return '<div class="pic"></div>'}}
function wd100Banner(k){const w=W_(),pm=me();const wk=wd100Wk(w);const L=w.night&&LOCATIONS[w.night.loc];
  const T={news:[_T('World · News'),_T('The Forum Wall'),_T('What the walls of the empire say this week')],
    league:[_T('World · League'),_T('The Standings'),_T`Season ${w.season} · ${Math.max(0,12-wk)} weeks left · the top four go to the Superbus`],
    imp:[_T('World · Imperium'),_T('The Empire'),_T('Cities, closures, weather, legions, your fans')],
    trophy:[_T('World · Trophies'),_T('The Tituli'),_T('Every honour your house has carved in bronze')],
    sched:[_T('World · Season'),_T('The Calendar'),_T('Twelve weeks, twelve cities, then Roma')]}[k];
  let rt='';
  try{if(k==='news'){const n=(w.news||[]).filter(x=>x.s===w.season&&x.wk===wk).length;rt=`<span class="wd100bc"><b>${n}</b><small>${n===1?_T('new notice'):_T('new notices')}</small></span>`}
    else if(k==='league'){const Ls=leagueSort(w.mgrs);rt=`<div class="wd100pod">${lp96Podium(Ls,Ls.length,Ls.indexOf(pm)+1)}</div>`}
    else if(k==='imp'){const key=wd100Key(w);const cl=LOCATIONS.map((x,i)=>i).filter(i=>LOCATIONS[i]&&worldImpact(i,key).closed).length;
      rt=`${L?`<span class="wd100bc"><b>${esc(L.n)}</b><small>${_T`hosts week ${wk}`}</small></span>`:''}${cl?`<span class="wd100bc"><b>${cl}</b><small>${cl===1?_T('arena closed'):_T('arenas closed')}</small></span>`:''}`}
    else if(k==='trophy'){const T2=tit100Mgr();const nw=T2.filter(x=>x.won).length;rt=nw===T2.length&&nw>0?wd100AllRing(nw):`<span class="wd100bc"><b>${nw} / ${T2.length}</b><small>${_T('earned')}</small></span>`}
    else if(k==='sched'){const f=fixtureFor(w.season,wk);rt=`<span class="wd100bc"><b>${_T`Week ${wk}`}</b><small>${esc(L?L.n:'')} · ${esc((EVENTS[f.ev]||{}).n||'')}</small></span>`}}catch(e){console.error(e)}
  return `<div class="roomhd b73 b73-${k} wd100ban">${wd100Pic(k)}<div class="wd100shade"></div>
    <div class="roomttl wd100tt"><span class="wd100ico">${WD100I[k]}</span><div><div class="kick">${T[0]}</div><h2>${T[1]}</h2><div class="sub">${T[2]}</div></div></div>
    <div class="wd100rt">${rt}</div></div>`}

/* ================= 1 · NEWS: the Forum Wall ================= */
function wd100Glads(){const w=W_();const M=new Map();for(const g of w.glads||[])if(g&&g.name&&g.name.length>3&&!M.has(g.name))M.set(g.name,g);return M}
function wd100Classify(text,w,pm,G){const t=wd100Strip(text);const o={t:'a',text:t};
  if(pm&&(t.includes(pm.ludus)||(pm.name&&t.includes(pm.name))))o.t='h';
  else{const r=w.mgrs.find(m=>!m.isPlayer&&m.ludus&&t.includes(m.ludus));if(r){o.t='r';o.m=r}
    else if(/^(World news|Festival|An? (edict|triumph)|Vesuvius)|attendance|legion|plague|famine|riot|fleet|governor|Senate|eruption|quarantine|pirates/i.test(t))o.t='e'}
  for(const [n,g] of G){if(t.includes(n)){o.g=g;break}}
  const cut=t.search(/ — |: |\. /);if(cut>8&&cut<70){o.h=t.slice(0,cut);o.sb=t.slice(cut+2).replace(/^[—:.]\s*/,'')}else{let i=t.length>52?t.lastIndexOf(' ',48):-1;if(i<20)i=t.length>52?48:t.length;o.h=t.slice(0,i);o.sb=t.slice(i).trim()}
  const m=/([+−-]\s?\d+%?)\s*(fame|coin|pts|points|attendance|mood|%)?/.exec(t);if(m){const neg=/^[−-]/.test(m[1]);o.fx=`<span class="${neg?'loss':'gain'}">${esc(m[1].replace(/\s/g,''))}${m[2]&&m[2]!=='%'?' '+esc(m[2]):''}</span>`}
  return o}
function wd100Acta(w){const P=w.lastPaper;if(!P)return `<div class="wd100acta"><span class="pin l"></span><span class="pin r"></span><h3>${_T`ACTA DIURNA`}</h3><div class="dt">${_T('The first edition is printed when this week ends.')}</div></div>`;
  const G=wd100Glads();const ln=(face,html,i)=>`<div class="ln">${face}<span class="t">${html}</span>${i?`<i>${i}</i>`:''}</div>`;
  const darw=(P.darwin||[]).slice(0,2).map(d=>{const m=/<b>([^<]+)<\/b>/.exec(d);const g=m&&G.get(m[1]);return ln(g?face100(g):'<span class="wd100fc"></span>',d.replace(/<(?!\/?b>)[^>]*>/g,''))}).join('')||`<div class="ln"><span class="t">—</span></div>`;
  const rab=(P.rabble||[]).slice(0,2).map(r=>ln(`<span class="wd100fc">${typeof specFaceSVG==='function'?specFaceSVG(r.look||{}):''}</span>`,wd100Strip(r.line||r.n))).join('')||`<div class="ln"><span class="t">—</span></div>`;
  const vic=[];for(const g of w.glads||[]){const x=(g.recent||[]).find(y=>y.s===P.season&&y.wk===((P.wk-1)%12)+1&&y.won);if(x)vic.push([g,x])}
  vic.sort((a,b)=>(b[1].f||0)-(a[1].f||0));
  const vics=vic.slice(0,2).map(([g,x])=>{const m=g.contract?mgrById(g.contract.mgr):null;return ln(face100(g),`<b>${esc(g.name)}</b>${m?' · '+esc(m.ludus):''}`,typeof cfAmt87==='function'?cfAmt87(x.f||0):(x.f||0)+' CF')}).join('')||`<div class="ln"><span class="t">—</span></div>`;
  return `<div class="wd100acta"><span class="pin l"></span><span class="pin r"></span><h3>${_T`ACTA DIURNA`}</h3>
    <div class="dt">${esc(P.locN||'')} · ${_T`SEASON ${P.season} · WEEK ${ROMAN[((P.wk-1)%12)+1]||P.wk}`} <button type="button" class="wd100pbtn" data-mg="paper">${_T`📜 Read it`}</button></div>
    <div class="cols"><div><h4>${_T`THE DARWINIUS AWARDS`}</h4>${darw}</div><div><h4>${_T`THE RABBLE-ROUSERS`}</h4>${rab}</div><div><h4>${_T`THE VICTORS`}</h4>${vics}</div></div></div>`}
function wd100NewsView(){const w=W_(),pm=me();const G=wd100Glads();const wk=wd100Wk(w);const seen=new Set();const items=[];
  const ns=[...(w.news||[])].map((n,i)=>({n,i})).sort((a,b)=>((b.n.s||0)-(a.n.s||0))||((b.n.wk||0)-(a.n.wk||0))||(a.i-b.i));
  /* every notice of the old list (w.news keeps 90): one tile each; only an identical line in the same week is folded */
  for(const {n} of ns){const t=wd100Strip(n.text);const k=t+'|'+n.s+'|'+n.wk;if(!t||seen.has(k))continue;seen.add(k);const o=wd100Classify(n.text,w,pm,G);o.wk=n.wk;o.s=n.s;o.bad=/\bbad\b/.test(n.cls||'');o.isNew=n.s===w.season&&n.wk===wk;items.push(o);if(items.length>=90)break}
  /* this week's world events as Empire notices */
  try{const evs=[...worldEvents(wd100Key(w))].sort((a,b)=>b.sev-a.sev);const ev2=evs.filter((e,i)=>evs.findIndex(x=>x.n===e.n&&x.city===e.city)===i).slice(0,3);
    for(const e of ev2){const att=Math.round(e.att*100);items.push({t:'e',h:e.n,sb:`${e.city}${e.war?' · '+e.war.rome+' vs '+e.war.foe:''}`,em:e.t,wk,s2:1,isNew:e.age===0,city:e.city,fx:`<span class="${att<0?'loss':'gain'}">${_T('crowd')} ${att>0?'+':''}${att}%</span>`})}}catch(e){}
  const F=WD100.nf;const flt=items.filter(o=>F==='all'||(F==='h'&&o.t==='h')||(F==='r'&&o.t==='r')||(F==='a'&&o.t==='a')||(F==='e'&&o.t==='e'));const show=WD100.nmore?flt:flt.slice(0,12);
  const TT={h:_T('Ours'),r:_T('Rival'),a:_T('Arena'),e:_T('Empire')};
  const tile=o=>{const em=o.g?`<span class="em">${gArt(o.g,'xs')}</span>`:o.m?`<span class="em par">${parma100(o.m,44)}</span>`:o.t==='h'?`<span class="em par">${parma100(pm,44)}</span>`:`<span class="em sym">${WD100I[o.em]||(o.t==='e'?WD100I.politics:WD100I.news)}</span>`;
    const where=o.city||(o.wk?_T`wk ${o.wk}`:'');
    return `<div class="wd100pn${o.isNew?' new':''}${o.bad?' bad':''}" data-wd100t="${o.t}">${em}<b>${esc(o.h)}</b><span class="sb">${esc(o.sb||'')}</span><div class="ft"><span class="wd100tag t${o.t}">${TT[o.t]}</span><span class="wh">${esc(where)}</span>${o.fx||''}</div></div>`};
  const nNew=items.filter(o=>o.isNew).length;
  return `<div class="wd100tools">${seg100('data-wd100nf',F,[['all',_T('All')],['h',_T('Your house')],['r',_T('Rivals')],['a',_T('Arena')],['e',_T('Empire')]])}<span class="sp"></span><small>${_T`${nNew} new this week`}</small></div>
    ${wd100Acta(w)}
    <div class="wd100wall">${show.length?show.map(tile).join(''):`<p class="wd100empty">${_T('Nothing posted here yet.')}</p>`}</div>
    ${flt.length>12?`<div class="wd100more"><button type="button" class="wd100pbtn" data-wd100nm="1" aria-expanded="${!!WD100.nmore}">${WD100.nmore?_T('Show fewer'):_T`Show all ${flt.length} notices`}</button></div>`:''}
    ${plq100(_T('The Ludus Archives'),_T('every back issue of the Acta and every season recap'))}${dark100('wd100arc',typeof archiveHTML==='function'?archiveHTML():'')}`}

/* ================= 2 · LEAGUE: the Standings ================= */
/* the house's last five weeks: w = a win that week, l = fought without a win (bye / no bout = grey) */
function form100(m){const w=W_();const by=new Map();for(const g of rosterOf(m))for(const x of g.recent||[]){if(x.s!==w.season)continue;const k=x.wk;by.set(k,(by.get(k)||'l')==='w'||x.won?'w':'l')}
  const wk=wd100Wk(w);const out=[];for(let k=Math.max(1,wk-5);k<wk;k++)out.push(by.get(k)||'d');if(by.has(wk))out.push(by.get(wk));while(out.length<5)out.unshift('n');
  const tip={w:_T('Won'),l:_T('Lost'),d:_T('No bout'),n:''};return `<span class="wd100form">${out.slice(-5).map(c=>`<i class="${c}"${tip[c]?` title="${tip[c]}"`:''}></i>`).join('')}</span>`}
/* the old full ledger's facts for ONE house (fame, treasury, morale, rivals, heat toward you, roster, record, bets, personality, latest event) */
function wd100Rivals(R){const meId=me().id;const heat={...(R.rivals||{})};if(!R.isPlayer&&(R.rivalry||0)>(heat[meId]||0))heat[meId]=R.rivalry||0;
  return Object.entries(heat).filter(([id,v])=>v>=15&&id!==R.id&&mgrById(id)).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,v])=>({m:mgrById(id),v}))}
function wd100Ledger(R,pos,n){const ros=rosterOf(R).sort((a,b)=>effOvr(b)-effOvr(a));const mo=ros.length?Math.round(ros.reduce((a,g)=>a+g.morale,0)/ros.length):null;const rv=R.rivalry||0;
  const riv=wd100Rivals(R);const kv=(l,v,tip)=>`<div class="kv${l===_T('Rivals')?' rivs':''}"${tip?` title="${esc(tip)}"`:''}><span>${l}</span><span>${v}</span></div>`;
  const pers=MGR_KEYS.map(([k,l])=>[l,R.p&&R.p[k]||0]).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([l,v])=>`${esc(l)} ${v}`).join(', ');
  const meter=(v,col)=>`<span class="mt"><i style="width:${v}%;${col?'background:'+col:''}"></i></span><small>${v}</small>`;
  return `<div class="wd100led" data-wd100led="${R.id}"><div class="sqh">${_T('Ledger')}</div>
    ${kv(_T('Roster'),`${rosterRating(R)||'—'} <small>${_T`${ros.length} fighters`}</small>`,ros.map(g=>`${g.name} ${'★'.repeat(starsOf(pubOvr(g)))}`).join(', '))}
    ${kv(_T('Fame'),`${R.fame||0} <small>${esc(mgrTier(R.fame||0))}</small>`)}
    ${kv(_T('Treasury'),coinAmt87(R.coin||0))}
    ${kv(_T('Morale'),mo==null?'—':meter(mo))}
    ${R.isPlayer?'':kv(_T('Toward you'),`${meter(rv,rv>=60?'#d24a3a':rv>=35?'#d97a3a':'')}<small class="${rv>=35?'hot':''}">${esc(rivalTier(rv))}</small>`,_T('How this lanista feels about YOUR ludus'))}
    ${kv(_T('Rivals'),riv.length?riv.map(x=>`<span class="rvl"><i style="background:${esc(x.m.color)}"></i>${esc(x.m.ludus)} <small class="${x.v>=35?'hot':''}">${esc(rivalTier(x.v))}</small></span>`).join(''):'—')}
    ${kv(_T('All-time'),`${R.wins||0}-${Math.max(0,(R.bouts||0)-(R.wins||0))}`,_T('All-time record'))}
    ${kv(_T('Bets'),`${(R.betNet||0)>=0?'+':''}${R.betNet||0}`)}
    ${kv(_T('Personality'),`${pers}${R.poached?' · '+_T`poached ${R.poached}`:''}`)}
    ${kv(_T('Latest event'),typeof lp96Latest==='function'?lp96Latest(R):'—')}
    ${kv(_T('Prize now'),esc(typeof lp96Tip==='function'?lp96Tip(pos,n):''))}</div>`}
function wd100HouseCard(R){const w=W_(),pm=me();const Ls=leagueSort(w.mgrs);const pos=Ls.indexOf(R)+1;const sp=msp(R);const mine=R.isPlayer;
  const ros=rosterOf(R).sort((a,b)=>effOvr(b)-effOvr(a));const top=ros.slice(0,3);
  const tr=MGR_KEYS.map(([k,l])=>[l,R.p&&R.p[k]||0]).sort((a,b)=>b[1]-a[1]).slice(0,2);
  const why=!mine&&typeof lg90ChalWhy==='function'?lg90ChalWhy(R):'';const set=!mine&&w.chal76&&w.chal76.s===w.season&&w.chal76.wk===w.week&&w.chal76.mgr===R.id;
  const heat=R.rivalry||0;
  return `<div class="wd100hc"${mine?'':` data-lg90box="${R.id}"`}><div class="top2"><div class="sc">${scutum100(R)}</div><div class="hi"><h3>${esc(R.ludus)}</h3>
      <div class="ln2">${esc(R.city||'')} · <b>${lp90Ord(pos)}</b> · ${sp.pts} ${_T('pts')} · <b>${sp.w}-${Math.max(0,sp.b-sp.w)}</b></div>
      <div class="ln2">${_T('Fame')} <b>${R.fame||0}</b> · ${tr.map(([l,v])=>`${esc(l)} ${gch100(trait96Grade(v))}`).join(' ')}</div>
      <div class="lan">${typeof mgrPortrait==='function'?`<span class="wd100fc lg">${mgrPortrait(R,'xs')}</span>`:''}<div><div class="ln2"><b>${esc(R.name)}</b></div><div class="ln2">${_T('Lanista')}${mine?' · '+_T('you'):''}</div></div></div></div></div>
    ${!mine&&heat>=15?`<div class="heat">${flames100(heat)} <b>${esc(rivalTier(heat))}</b> · ${_T('toward you')}</div>`:''}
    <div class="sq"><div class="sqh">${_T('Top gladiators')}</div>${top.length?top.map(g=>`<div class="gr">${face100(g)}<span><b>${esc(g.name)}</b> · ${CLASSES[g.cls]?esc(CLASSES[g.cls].name):''} · ${(g.rec&&g.rec.w)||0}-${Math.max(0,((g.rec&&g.rec.ev)||0)-((g.rec&&g.rec.w)||0))}</span>${wd100Grade(g,R)}</div>`).join(''):`<div class="gr"><span class="rc-sub">${_T('No fighters under contract.')}</span></div>`}</div>
    ${wd100Ledger(R,pos,Ls.length)}
    <div class="btns">${mine?`<button type="button" class="b1" data-mg="tab" data-id="me">${_T('👤 Lanista page')}</button><button type="button" class="b1" data-mg="tab" data-id="roster">${_T('🛡 Roster')}</button>`
      :`<button type="button" class="b1${WD100.scout?' on':''}" data-wd100sc="1" aria-expanded="${WD100.scout}">${_T('🔍 Scout')}<span class="cst">${_T('fighters, form, this week')}</span></button><button type="button" class="b2" data-lg90ch="${R.id}"${why?' disabled':''} title="${esc(why||'')}">${set?_T('⚔ Challenge set'):_T('⚔ Challenge')}<span class="cst">${why&&!set?esc(why):_T('this week · purse ×2')}</span></button>
        <button type="button" class="b1 wide" data-mg="team" data-id="${R.id}">${_T('🏛 Team screen')}</button>`}</div>
    ${!mine&&WD100.scout&&typeof lg90HTML==='function'?`<div class="lg90row wd100scout">${lg90HTML(R)}</div>`:''}</div>`}
function wd100LeagueView(){const w=W_(),pm=me();const Ls=leagueSort(w.mgrs);const wk=wd100Wk(w);
  let sel=MGR.lg90&&mgrById(MGR.lg90);if(!sel)sel=pm;
  const N=typeof lp90Next==='function'?lp90Next():null;
  const rows=Ls.map((m,i)=>{const sp=msp(m);const g=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a))[0];
    return `<div class="wd100r${m.isPlayer?' me':''}${m===sel?' sel':''}${i<4?' top4':''}" data-wd100h="${m.id}" role="button" tabindex="0" aria-pressed="${m===sel}" title="${esc(typeof lp96Tip==='function'?lp96Tip(i+1,Ls.length):'')}">
      <span class="pl">${i+1}</span>${parma100(m,28)}<span class="hn"><b>${esc(m.ludus)}</b><small>${esc(m.name)}</small>${m.isPlayer?'':`<span class="rv">${flames100(m.rivalry)}</span>`}</span>
      <span class="pts">${sp.pts}</span>${form100(m)}<span class="tg c-tg">${g?face100(g):''}<span>${g?esc(g.name):'—'}</span>${g?wd100Grade(g,m):''}</span>
      <span class="rec c-rec">${sp.w}-${Math.max(0,sp.b-sp.w)}</span><span class="c-riv">${m.isPlayer?'':flames100(m.rivalry)}</span><span class="chev">›</span></div>`}).join('');
  return `${N?`<div class="wd100next"><span class="tx">${N.txt}</span>${N.need?`<span class="bar"><i style="width:${Math.max(6,Math.min(100,100-N.need*8))}%"></i></span>`:''}<span class="left">${_T`${Math.max(0,12-wk)} weeks left`}</span></div>`:''}
    <div class="wd100lg"><div class="wd100lgt">${plq100(_T`Season ${w.season} · week ${wk}`,_T`${Ls.length} houses`)}
      <div class="wd100rh"><span>#</span><span></span><span>${_T('House')}</span><span class="n" title="${esc(typeof LP100_TIP==='function'?LP100_TIP():'')}">${_T('Pts')}</span><span>${_T('Form')}</span><span class="c-tg">${_T('Top gladiator')}</span><span class="c-rec n">${_T('W-L')}</span><span class="c-riv">${_T('Rivalry')}</span><span></span></div>
      <div class="wd100rows">${rows}</div></div>
    <div class="wd100side">${wd100HouseCard(sel)}</div></div>`}

/* ================= 3 · IMPERIUM ================= */
function wd100Fans(){const pm=me();const names=new Set(rosterOf(pm).map(g=>String(g.name).toLowerCase()));const out={};if(typeof CROWD_CACHE==='undefined')return out;
  for(const r of CROWD_CACHE){if(!r||r.banned||!r.city)continue;if([r.fanOf,r.patronFav,r.kin&&r.kin.name].some(x=>x&&names.has(String(x).toLowerCase())))out[r.city]=(out[r.city]||0)+1}return out}
function wd100Next(li){const w=W_();const wk=wd100Wk(w);for(let s=w.season;s<=w.season+1;s++)for(let k=(s===w.season?wk:1);k<=12;k++){if(BYE_WKS.includes(k))continue;const f=fixtureFor(s,k);if(f.loc===li)return {s,k,f}}return null}
function wd100CityCard(li){const w=W_(),pm=me();const L=LOCATIONS[li];if(!L)return '';const key=wd100Key(w);const imp=worldImpact(li,key);
  const mat=(typeof AR91MAT!=='undefined'&&AR91MAT[li])||{};const c94=(typeof CITY94!=='undefined'&&CITY94[L.n])||null;const sp=c94&&typeof SPEC94!=='undefined'&&SPEC94[c94.sp];
  const cls=typeof CITY_CLS99!=='undefined'&&CITY_CLS99[L.n];const fans=wd100Fans()[L.n]||0;const nx=wd100Next(li);
  const host=w.night&&w.night.loc===li;const gate=typeof citySquareGate==='function'?citySquareGate(li):'x';
  const gods=typeof TEMPLE76!=='undefined'?Object.values(TEMPLE76).map(t=>t[1]).join(' · '):'';
  const news=imp.list.filter(e=>e.li===li)[0]||imp.list[0];
  const [x,y]=MAP_PX(L.x,L.y);const px=x/MAPW*100,py=y/MAPH*100;
  const pos=px>55?`right:calc(${(100-px).toFixed(2)}% + 22px)`:`left:calc(${px.toFixed(2)}% + 22px)`;
  return `<div class="wd100cc" style="${pos};top:clamp(8px,calc(${py.toFixed(2)}% - 70px),calc(100% - 330px))" role="dialog" aria-label="${esc(L.n)}">
    <div class="hd"><b>${esc(L.n)}</b><small>${host?_T('host this week'):L.n===pm.city?_T('your home'):_T('arena · city')}</small><button type="button" class="x" data-wd100c="" aria-label="${_T('Close')}">✕</button></div>
    <div class="ar"><span class="sw" style="background-image:url('${wd100Asset('stone_wall.webp')}');filter:${esc(mat.f||'none')}"></span><div>
      <div class="kv"><span>${_T('Stone')}</span><span>${esc(String(mat.n||'—').replace(/ \d+$/,''))}</span></div>
      <div class="kv"><span>${_T('Stalls')}</span><span>${sp?esc(sp.n):'—'}${c94?` · L1–${c94.sz>=3?3:2}`:''}</span></div>
      <div class="kv"><span>${_T('Temple')}</span><span>${esc(gods)}</span></div></div></div>
    <div class="kvs"><div class="kv"><span>${_T('Recruits')}</span><span>${cls&&CLASSES[cls]?_T`${CLASSES[cls].name} fighters lean here`:_T('any class')}</span></div>
      <div class="kv"><span>${_T('News')}</span><span class="${news&&news.att<0?'neg':''}">${news?`${esc(news.n)} · ${_T('crowd')} ${news.att>=0?'+':''}${Math.round(news.att*100)}%`:_T('a quiet week')}</span></div>
      <div class="kv"><span>${_T('Your fans')}</span><span>${fans?_T`${fans}K follow your fighters`:_T('none yet')}</span></div>
      ${imp.closed?`<div class="kv"><span>${_T('Arena')}</span><span class="neg">${_T('closed')} · ${esc(imp.closed.n)}</span></div>`:''}</div>
    ${nx?`<div class="nx"><span class="ec">${cardHTML('e:'+nx.f.ev,'sm')||''}</span><div><b>${_T('Next')}: ${esc((EVENTS[nx.f.ev]||{}).n||nx.f.ev)}</b><small>${_T`Season ${nx.s} · week ${nx.k}`} · ${esc(empireDate(nx.s,nx.k).short)}</small></div></div>`:''}
    ${gate?'':`<div class="ft2"><button type="button" class="wd100pbtn gold" data-ct="square" data-li="${li}">${_T('🏛 Walk the square')}</button></div>`}</div>`}
const WD100_NMO={Puteoli:'translate(-34px,-30px)',Pompeii:'translate(30px,0)',Capua:'translate(26px,-20px)'};
/* the old layered map's layers (fans & roads, weather, war) painted over the new map: 18-world's own drawing, run with this view's switches and cut down to the layers */
function wd100LayerSVG(key,focus){const L=WD100.lay;const HL=HUB.layers,HF=HUB.focus;let svg='';
  try{HUB.layers={fans:L.fans?1:0,weather:L.weather?1:0,events:0,war:L.war?1:0};HUB.focus=focus;svg=imperiumMapSVG(key)}catch(e){console.error(e)}finally{HUB.layers=HL;HUB.focus=HF}
  const a=svg.indexOf('<image'),b=svg.indexOf('<g class="city"');if(a<0||b<0)return '';const c=svg.indexOf('/>',a)+2;let inner=svg.slice(c,b);
  const pm=svg.indexOf('<g class="pg84mks">'),pe=svg.lastIndexOf('</svg>');if(pm>=0&&pe>pm)inner+=svg.slice(pm,pe); /* 140's painted-programmata discs ride on the map too */
  return inner?`<svg class="wd100lay" viewBox="0 0 ${MAPW} ${MAPH}" preserveAspectRatio="none" aria-hidden="true">${inner}</svg>`:''}
/* the old Imperium window's other content (empire strip, the city file, spectator roster, family ties) — one dark panel under the map, same handlers */
/* which city the map's layers + the city file follow: a selected pin, else the old Imperium focus (HUB.focus), else this week's host */
const wd100Focus=()=>WD100.city!=null?WD100.city:(HUB.focus!=null?HUB.focus:(W_().night?W_().night.loc:null));
function wd100FileHTML(){const key=worldKey();const HF=HUB.focus;let h='';
  try{HUB.focus=wd100Focus();const F=hubFocus();const nReg=CROWD_CACHE.filter(r=>!r.recruited).length;const vt=(k,l)=>`<button type="button" data-hubview="${k}" class="${HUB.view===k?'on':''}">${l}</button>`;
    h=`${typeof empireStripHTML==='function'?empireStripHTML():''}<div class="seg" style="margin:6px 0">${vt('city','🏙 '+esc(LOCATIONS[F]?LOCATIONS[F].n:_T('City')))}${vt('roster',_T`👥 Spectator roster · ${nReg}`)}</div>
      ${HUB.view==='roster'&&typeof standsRosterViewHTML==='function'?standsRosterViewHTML():cityTileHTML(key)}${typeof familyTiesHTML==='function'?familyTiesHTML():''}`}
  catch(e){console.error(e)}finally{HUB.focus=HF}return h}
/* the Stands window refreshes #standsHubBody on crowd actions: while the Manager's file is the first one, keep it */
{const base=standsHubHTML;standsHubHTML=function(){try{const el=document.querySelector('#standsHubBody');if(el&&el.classList.contains('wd100file')&&wd100On())return wd100FileHTML()}catch(e){}return base.apply(this,arguments)}}
function wd100ImpView(){const w=W_(),pm=me();const key=wd100Key(w);const wk=wd100Wk(w);const host=w.night&&LOCATIONS[w.night.loc];const LY=WD100.lay;
  const evs=worldEvents(key);const fans=wd100Fans();
  const pins=LOCATIONS.map((L,i)=>{if(!L)return '';const [x,y]=MAP_PX(L.x,L.y);const imp=worldImpact(i,key);const isH=w.night&&w.night.loc===i;const e=evs.find(v=>v.li===i);
    const wx=typeof weatherAt==='function'?weatherAt(i,key):null;const b=[];
    if(e&&(LY.events||(LY.war&&e.t==='military')))b.push(WD100I[e.t]||WD100I.politics);if(wx&&LY.weather)b.push(WD100I[wx.t]||WD100I.sun);
    const f=fans[L.n]||0;const glow=f&&LY.fans?`<span class="warm" style="width:${Math.min(120,30+f*1.6)}px;height:${Math.min(120,30+f*1.6)}px"></span>`:'';
    return `<button type="button" class="wd100pin${isH?' host':''}${L.n===pm.city?' mine':''}${imp.closed?' closed':''}${WD100.city===i?' on':''}" style="left:${(x/MAPW*100).toFixed(2)}%;top:${(y/MAPH*100).toFixed(2)}%" data-wd100c="${i}" aria-label="${esc(L.n)}">${glow}<span class="dot">${b[0]?`<span class="badg">${b[0]}</span>`:''}${b[1]?`<span class="badg b2">${b[1]}</span>`:''}</span><span class="nm" style="${WD100_NMO[L.n]?'transform:'+WD100_NMO[L.n]:''}">${esc(L.n)}</span></button>`}).join('');
  const SEV=s=>`<span class="sev">${[1,2,3].map(k=>`<i class="${k<=s?'on':''}"></i>`).join('')}</span>`;
  const list=[...evs].sort((a,b)=>(b.sev*10+Math.abs(b.att)*100)-(a.sev*10+Math.abs(a.att)*100)).filter((e,i,a)=>a.findIndex(x=>x.n===e.n&&x.city===e.city)===i).slice(0,10)
    .map(e=>{const att=Math.round(e.att*100);return `<div class="wd100wev" title="${esc(`${e.n} — ${e.city} · ${_T('severity')} ${e.sev} · ${_T('crowd')} ${att>0?'+':''}${att}% · ${_T('mood')} ${e.mood>=0?'+':''}${e.mood}`)}" style="--c:${esc(e.c)}" data-wd100c="${e.li}" role="button" tabindex="0"><span class="em">${WD100I[e.t]||WD100I.politics}</span><b>${esc(e.n)}</b><span class="sb">${esc(e.city)}${e.war?_T` · ${esc(e.war.rome)} vs ${esc(e.war.foe)}`:''}</span><div class="ft">${SEV(e.sev)}<span>${esc(e.tag||'')}</span><span class="${att<0?'neg':'pos'}">${_T('crowd')} ${att>0?'+':''}${att}%</span></div></div>`}).join('');
  const city=WD100.city!=null&&LOCATIONS[WD100.city]?wd100CityCard(WD100.city):'';
  return `<div class="wd100imp"><div class="wd100mapcol">${plq100(_T`The Empire · week ${ROMAN[wk]||wk}`,host?`${_T('host')}: ${esc(host.n)} · ${esc((EVENTS[w.night.ev]||{}).n||'')}`:'')}
      <div class="wd100map"><div class="mp" style="background-image:url('${wd100Asset('map.jpg')}')"></div>${wd100LayerSVG(key,wd100Focus())}<div class="lay2">${pins}${city}</div>
      <div class="leg"><span><i class="lh"></i>${_T('This week')}</span><span><i class="lm"></i>${_T('Home')}</span><span><i class="lc"></i>${_T('Closed')}</span><span><i class="lf"></i>${_T('Your fans')}</span></div>
      <div class="mtools" role="group" aria-label="${_T('Map layers')}">${[['fans',_T('Fans & roads')],['weather',_T('Weather')],['events',_T('World events')],['war',_T('War map')]].map(([k,l])=>`<button type="button" class="wd100chip${LY[k]?' on':''}" data-wd100lay="${k}" aria-pressed="${!!LY[k]}">${l}</button>`).join('')}</div></div>
      ${city?`<div class="wd100ccph">${city}</div>`:''}</div>
    <div class="wd100evcol">${plq100(_T('World events'),String(evs.length))}<div class="wd100wevs">${list||`<p class="wd100empty">${_T('A quiet week across the empire.')}</p>`}</div></div></div>
    ${plq100(_T`The city file`,_T('who lives there, the arena’s record, local heroes, family ties'))}${dark100('wd100filew',`<div id="standsHubBody" class="wd100file">${wd100FileHTML()}</div>`)}`}

/* ================= 4 · TROPHIES: the Tituli ================= */
/* tituli100Plaque — ONE bronze plaque (reusable): {art, name, sub, won (text when earned), prog [have, need, label], id} */
function tituli100Plaque(o){const lock=!o.won;const pc=o.prog?Math.round(100*Math.min(1,(o.prog[0]||0)/Math.max(1,o.prog[1]||1))):0;
  return `<div class="wd100tp${lock?' lock':''}"${o.id?` data-wd100tp="${esc(o.id)}"`:''} title="${esc(o.tip||o.sub||'')}">${lock?`<span class="lk">${WD100I.lock}</span>`:''}<div class="art">${o.art||''}</div><b>${esc(o.name)}</b><span class="sb">${esc(o.sub||'')}</span>
    ${o.won?`<span class="won">${esc(o.won)}</span>`:o.prog?`<span class="prog"><i><u style="width:${pc}%"></u></i>${esc(String(o.prog[0]))}/${esc(String(o.prog[1]))}</span>`:`<span class="prog none">${esc(o.hint||_T('not yet'))}</span>`}</div>`}
const TIT100_STAT={aureus:g=>g.ss.w,tiro:g=>g.debut&&g.debut.s===g.ss.s?g.ss.w:0,iron_thumb:g=>g.ss.kp,horn:g=>g.ss.kn,darling:g=>g.ss.best,vulcan:g=>g.ss.dmg,aegis:g=>g.ss.surv||0,
  rising:g=>Math.max(0,g.ovr-(g.ss.o0??g.ovr)),vox:g=>typeof fansFor==='function'?fansFor(g.name):0,sponge:g=>g.ss.taken,iron_sandal:g=>g.ss.ev};
function tit100Mgr(){const w=W_(),pm=me();const own={};for(const t of w.trophies||[])if(t.tid)own[t.tid]=t;
  const G=(w.glads||[]).filter(g=>g.ss&&g.ss.s===w.season&&g.ss.ev>0);const mine=G.filter(g=>g.contract&&g.contract.mgr===pm.id);
  return TROPHY_LIB.map(d=>{const t=own[d.id];let prog=null,hint='';
    const hide=wd100Wk(w)<12&&d.id!=='palm_roma'&&(d.cat==='season'||d.cat==='fun'); /* the season's awards are handed out at its end: no tally before week 12 (his 4c) */
    if(!t&&hide)hint=_T('awarded at season’s end');
    else if(!t){if(d.id==='flavian_cup'){const L=leagueSort(w.mgrs);prog=[msp(pm).pts,Math.max(1,msp(L[0]).pts)]}
      else if(TIT100_STAT[d.id]){const f=TIT100_STAT[d.id];const best=a=>a.reduce((m,g)=>Math.max(m,+f(g)||0),0);const lead=best(G);if(lead>0)prog=[best(mine),lead];else hint=_T('no tally yet this season')}
      else if(d.cat==='special'||d.id==='palm_roma')prog=[0,1];else hint=_T('awarded at season’s end')}
    return {id:d.id,d,won:t?`${t.who?t.who+' · ':''}${_T('Season')} ${t.season}${(t.count||1)>1?' · ×'+t.count:''}`:'',prog,hint,cat:d.cat}})}
const TIT100_ONL={first:'aureus',rank:'rising',slew:'horn',vday:'darling',surv10:'aegis',surv25:'aegis',thumb:'iron_thumb'};
function tit100Onl(){const C=typeof ONLC!=='undefined'?ONLC:null;const keys=['first:democritus','first:egidious','first:cassian','first:familia',...((C&&C.RANKS)||[]).slice(1).map(r=>'rank:'+r.k),'slew:tholo','slew:commodus','vday','surv10','surv25','thumb'];
  const got={};const dg=typeof ONL82!=='undefined'&&ONL82.dg;for(const t of (dg&&dg.trophies)||[])got[t.k]=t;
  return keys.map(k=>{const t=got[k];const d=trophyDef(TIT100_ONL[k.split(':')[0]]||'aureus');const n=C&&typeof C.trophyName==='function'?C.trophyName(k):k;
    return {id:'o:'+k,art:d?trophySVG(d,100):'',name:n,sub:_T('Online · your Domus'),won:t?`${t.glad||''}${(t.x|0)>1?' · ×'+t.x:''}`:'',hint:dg?_T('not yet'):_T('open Online to see your Domus')}})}
function wd100HallLoad(){if(WD100.hallBusy||WD100.hall)return;WD100.hallBusy=true;Promise.resolve(Store.list('hallTrophies')).catch(()=>[]).then(L=>{WD100.hall=L||[];WD100.hallBusy=false;if(MGR.tab==='trophy'&&typeof MGR_REDRAW==='function')MGR_REDRAW()})}
function wd100TrophyView(old){const tf=WD100.tf;let body='',count='';
  if(tf==='mgr'){const T=tit100Mgr();const pl=x=>tituli100Plaque({id:x.id,art:trophySVG(x.d,100),name:x.d.name,sub:x.d.desc,won:x.won,prog:x.prog,hint:x.hint});
    const main=T.filter(x=>x.cat!=='fun'),fun=T.filter(x=>x.cat==='fun');count=_T`${T.filter(x=>x.won).length} of ${T.length} earned · locked ones show how close you are`;
    body=plq100(_T('The Flavian awards & invitationals'),_T`season ${W_().season}`)+`<div class="wd100tit">${main.map(pl).join('')}</div>`+plq100(_T('For the laughs'),'')+`<div class="wd100tit">${fun.map(pl).join('')}</div>`+(old?`<div class="wd100case">${plq100(_T('The glass case'),_T('arrange what stands on the shelves'))}${old}</div>`:'')}
  else if(tf==='pn'){wd100HallLoad();const L=WD100.hall;if(!L)body=`<p class="wd100empty">${_T('Reading the Hall…')}</p>`;else{const by={};for(const x of L)(by[x.tid||'n:'+x.name]=by[x.tid||'n:'+x.name]||[]).push(x);
      const lib=TROPHY_LIB.map(d=>{const h=by[d.id];return tituli100Plaque({id:'pn:'+d.id,art:trophySVG(d,100),name:d.name,sub:d.desc,won:h?`${h[0].who||''}${h.length>1?' · ×'+h.length:''}`:'',hint:_T('win it in Play Now')})});
      const cust=Object.entries(by).filter(([k])=>k.startsWith('n:')||!trophyDef(k)).map(([k,h])=>tituli100Plaque({id:'pn:'+k,art:h[0].spec?trophySVG(h[0].spec,100):'',name:h[0].name||'',sub:_T('your own event'),won:`${h[0].who||''}${h.length>1?' · ×'+h.length:''}`}));
      count=_T`${Object.keys(by).length} earned in Play Now`;body=plq100(_T('Play Now honours'),'')+`<div class="wd100tit">${[...lib,...cust].join('')}</div>`}}
  else{const T=tit100Onl();count=_T`${T.filter(x=>x.won).length} of ${T.length} earned`;body=plq100(_T('Online honours'),_T('the Tituli for Online come later'))+`<div class="wd100tit">${T.map(tituli100Plaque).join('')}</div>`}
  return `<div class="wd100tools">${seg100('data-wd100tf',tf,[['mgr',_T('Manager')],['pn',_T('Play Now')],['onl',_T('Online')]])}<span class="sp"></span><small>${count}</small></div>${body}`}

/* ================= 5 · SEASON: the Calendar ================= */
function wd100Acta96(w,abs){const A=w.acta96&&w.acta96[abs];if(!A)return null;let pts=0,best=null;for(const r of A.rows||[]){pts+=r.w?3:r.p===2?1:0;const p=r.w?1:r.p||99;if(!best||p<best.p)best={p,n:r.n}}return {pts,best,n:(A.rows||[]).length}}
/* the Acta results card of a finished week as ONE line (what the old table's Acta column showed) */
function wd100ActaLine(w,abs){const A=w.acta96&&w.acta96[abs];if(!A)return '';if(!A.rows.length)return _T('sat out');
  return A.rows.map(r=>`${r.t||''} ${r.n||'?'} ${r.w?'🏆':r.p?lp90Ord(r.p):'·'}`.trim()).join(' · ')}
/* early billing (name a fighter 3+ weeks ahead): the old Season table's Billing column, upcoming weeks, one line each — same ids / data-mg as before */
function wd100BillRows(w,pm){w.commits=w.commits||{};const ros=rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a));const wk0=wd100Wk(w);const base=w.week-wk0;const out=[];
  for(let abs=w.week;abs<=Math.min(w.week+11,base+16);abs++){const {season,wk}=absSW(w,abs);if(BYE_WKS.includes(wk))continue;if(season!==w.season&&abs>w.week+8)continue;
    const f=fixtureFor(season,wk);const E=EVENTS[f.ev]||{};const c=w.commits[abs];const ahead=abs-w.week;const now=abs===w.week;
    const iv=(w.invites||[]).find(x=>x.wk===abs&&['open','accepted','playing'].includes(x.status));
    const bill=now?(()=>{const b=w.night&&w.night.bouts&&w.night.bouts.find(x=>x.billed);return b?`<b>${esc((gById(b.billed)||{}).name||'')}</b> <small>${_T('on the posters')}</small>`:`<small>${_T('enter on Match Week')}</small>`})()
      :c?`<b>${esc((gById(c.gid)||{}).name||'?')}</b> ${ahead>=3?`<button type="button" class="wd100pbtn sm" data-mg="cm_undo" data-id="${abs}" aria-label="${_T('Withdraw')}">✕</button>`:`<small>${_T('locked in')}</small>`}`
      :ahead>=3&&ros.length?`<select class="tin" id="cm_${abs}" aria-label="${_T('Bill a fighter')}"><option value="">${_T`bill a fighter…`}</option>${ros.map(g=>`<option value="${g.id}">${esc(g.name)} · ${effOvr(g)}</option>`).join('')}</select><button type="button" class="wd100pbtn sm" data-mg="cm_set" data-id="${abs}" aria-label="${_T('Pin')}">📌</button>`
      :`<small>${_T('closed')}</small>`;
    out.push(`<div class="wd100sr bill${now?' now':''}"><span class="wkn">${season!==w.season?'S'+season+' · ':''}${_T('WK')} ${wk}</span><span class="c-cy">${esc(LOCATIONS[f.loc].n)}</span><span class="c-ev">${esc(String(E.short||E.n||f.ev).replace(/^Classic · /,''))}${iv?` · ⭐ ${esc(iv.n)}`:''}</span><span class="c-bl">${bill}</span><span class="pts">×${f.purse}</span></div>`)}
  return out}
/* invitations / special events as one-line rows; Answer ▸ is the old iv_open (231's pick-the-fighters popup), Withdraw the old iv_withdraw */
function wd100InvRows(w,pm){const out=[];
  if(w.special&&!w.special.done)out.push(`<div class="wd100sr iv live"><span class="wkn">★</span><span class="c-cy"><b>${esc(w.special.D.n)}</b></span><span class="c-ev">${_T('is on this week — the league’s card waits')}</span><span class="c-bl"><button type="button" class="wd100pbtn gold sm" data-mg="tab" data-id="night">${_T('Go to it ▸')}</button></span></div>`);
  for(const iv of (w.invites||[]).filter(x=>['open','accepted'].includes(x.status)).sort((a,b)=>a.wk-b.wk)){const D=specDef(iv.sid);if(!D)continue;const td=trophyDef(D.trophy);const Lc=LOCATIONS[D.loc];const wl=iv.wk-w.week;
    const win=iv.exhib?Math.round(D.purse*0.67):D.purse;
    out.push(`<div class="wd100sr iv ${iv.status}"><span class="wkn">${_T('WK')} ${absSW(w,iv.wk).wk}</span><span class="c-cy">${td?`<span class="tro">${trophySVG(td,22)}</span>`:''}<b>${esc(iv.n||D.n)}</b>${iv.exhib?` <small>${_T('exhibition')}</small>`:''}</span>
      <span class="c-ev">${esc(Lc?Lc.n:'')} · ${esc(absDate(w,iv.wk))} · ${wl<=0?_T('this week'):_T`in ${wl} wk${wl===1?'':'s'}`}</span><span class="c-bl">${iv.status==='accepted'?`<b>✓ ${iv.ents.map(id=>esc((gById(id)||{}).name||'?')).join(' & ')}</b><button type="button" class="wd100pbtn sm" data-mg="iv_withdraw" data-id="${iv.id}" title="${_T`The host will remember (−2 fame)`}">${_T('Withdraw')}</button>`
        :`<small title="${esc(td?td.name:'')}">${coinAmt87(win)}</small><button type="button" class="wd100pbtn gold sm" data-mg="iv_open" data-id="${iv.id}">${_T('Answer ▸')}</button>`}</span></div>`);}
  for(const x of (w.specialLog||[]).slice(-6).reverse())out.push(`<div class="wd100sr iv past${x.mine?' mine':''}"><span class="wkn">S${x.season}</span><span class="c-cy"><b>${esc(x.n)}</b></span><span class="c-ev">${esc(x.champ||'?')}${x.mine?' 🏆':''}</span><span class="c-bl"><small>${_T('past')}</small></span></div>`);
  return out}
function wd100SeaView(){const w=W_(),pm=me();const wk0=wd100Wk(w);const baseW=w.week-wk0;const sv=WD100.sea||0;const season=w.season+sv;const cur=sv===0;
  const sch=seasonSchedule(season);const L=leagueSort(w.mgrs);const pos=L.indexOf(pm)+1;const N=cur&&typeof lp90Next==='function'?lp90Next():null;
  const evShort=f=>{const E=EVENTS[f.ev]||{};return String(E.short||E.n||f.ev).replace(/^Classic · /,'')};
  const riv=k=>k===(typeof RIVAL_WK!=='undefined'?RIVAL_WK:12);
  const rivName=()=>{try{const R=w.rivalry&&w.rivalry.season===w.season&&typeof rivalOf==='function'?rivalOf(w,pm.id):null;return R?R.ludus:null}catch(e){return null}};
  const tab=k=>{const f=sch[k-1];const isBye=BYE_WKS.includes(k);const past=cur&&k<wk0,now=cur&&k===wk0;const dt=empireDate(season,k).short;const mon=String(dt).split(' ')[0].slice(0,3);
    if(isBye)return `<div class="wd100wk bye${past?' past':''}${now?' now':''}${!cur?' fut':''}">${now?`<span class="nowt">${_T('THIS WEEK')}</span>`:''}<div class="n"><span>${_T('WK')} ${ROMAN[k]}</span><span>${esc(mon)}</span></div><div class="art"><span>${_T('BYE')}</span></div><div class="ct">${_T('No games')}</div><div class="ev">${_T('rest week')}</div><div class="res">${past?`<span>${_T('rested')}</span>`:'<span>—</span>'}</div></div>`;
    const A=past?wd100Acta96(w,baseW+k):null;const Lc=LOCATIONS[f.loc];const closed=now&&Lc&&worldImpact(f.loc,wd100Key(w)).closed;
    const res=past?(A?(A.n?`<b>${A.best?lp90Ord(A.best.p<99?A.best.p:0)||'—':'—'}</b><span class="pts">+${A.pts} ${_T('pts')}</span>`:`<span>${_T('sat out')}</span>`):'<span>—</span>')
      :now?`<span>${(()=>{const n=typeof onCard96==='function'?onCard96():0;return n?_T`${n} entered`:_T('enter now')})()}</span>`:`<span>${cur?'×'+f.purse:_T('purse')+' ×'+f.purse}</span>`;
    return `<div class="wd100wk${past?' past':''}${now?' now':''}${!cur?' fut':''}"${now?' data-mg="tab" data-id="night" role="button" tabindex="0"':''}>${now?`<span class="nowt">${_T('THIS WEEK')}</span>`:''}${riv(k)?`<span class="riv2">${_T('RIVALRY')}</span>`:''}${closed?`<span class="cl">${_T('CLOSED')}</span>`:''}
      <div class="n"><span>${_T('WK')} ${ROMAN[k]}</span><span>${esc(mon)}</span></div><div class="art">${cardHTML('e:'+f.ev,'sm')||''}</div><div class="ct">${esc(Lc?Lc.n:'')}</div><div class="ev">${riv(k)?`${_T('vs')} ${esc(cur&&rivName()||_T('TBA'))}`:esc(evShort(f))}</div><div class="res">${res}</div></div>`};
  let cupArt='';try{const d=trophyDef('palm_roma');cupArt=d?trophySVG(d,84):''}catch(e){}
  const fin=`<div class="wd100wk gg${!cur?' fut':''}"><div class="n"><span>${_T('FINAL')}</span><span>${esc((LOCATIONS[6]||{}).n||'')}</span></div><div class="art">${cupArt}</div><div class="ct">${_T('Superbus')}</div><div class="ev">${_T('top 4 houses')}</div><div class="res"><span>${cur?(pos<=4?_T`you: #${pos} · in`:_T`you: #${pos}`):_T('TBA')}</span></div></div>`;
  const row=(k,cells,cls,attrs)=>`<div class="wd100sr${cls?' '+cls:''}"${attrs||''}><span class="wkn">${_T('WK')} ${k}</span>${cells}</div>`;
  let lists='';
  if(cur){const acta=[];for(let k=1;k<wk0;k++){if(BYE_WKS.includes(k))continue;const f=sch[k-1];const A=wd100Acta96(w,baseW+k);
      acta.push(row(k,`<span class="c-cy">${esc(LOCATIONS[f.loc].n)}</span><span class="c-ev">${esc(evShort(f))}</span><span class="c-bs sact96" title="${esc(wd100ActaLine(w,baseW+k))}">${esc(wd100ActaLine(w,baseW+k)||'—')}</span><span class="pl2">${A&&A.best&&A.best.p<99?lp90Ord(A.best.p):'—'}</span><span class="pts">${A?'+'+A.pts:''}</span>`))}
    const come=[];for(let k=wk0;k<=12;k++){const f=sch[k-1];const bye=BYE_WKS.includes(k);const c=(w.commits||{})[baseW+k];const now=k===wk0;
      const st=bye?_T('rest'):now?((()=>{const n=typeof onCard96==='function'?onCard96():0;return n?_T`${n} entered`:_T('enter now')})()):c?`📌 ${esc((gById(c.gid)||{}).name||'')}`:riv(k)?`${_T('vs')} ${esc(rivName()||_T('TBA'))}`:_T('open');
      come.push(row(k,`<span class="c-cy">${bye?'—':esc(LOCATIONS[f.loc].n)}</span><span class="c-ev">${bye?_T('Bye'):riv(k)?_T('Rivalry')+' · '+esc(evShort(f)):esc(evShort(f))}</span><span class="c-bs">${st}</span><span class="pl2">${now?`<span class="nowt2">${_T('THIS WEEK')}</span>`:''}</span><span class="pts">${bye?'':'×'+f.purse}</span>`,now?'now':'',now?' data-mg="tab" data-id="night" role="button" tabindex="0"':''))}
    const ptsAll=msp(pm).pts;
    lists=`<div class="wd100two"><div>${plq100(_T('Your Acta'),_T`${ptsAll} pts`)}<div class="wd100sea">${acta.join('')||`<div class="wd100sr empty"><span>${_T('No weeks fought yet this season.')}</span></div>`}</div></div>
      <div>${plq100(_T('Still to come'),_T('prizes at week 12'))}<div class="wd100sea">${come.join('')}</div></div></div>
      <div class="wd100two wd100bill"><div>${plq100(_T('Billing'),_T('name a fighter 3+ weeks ahead'))}<div class="wd100sea">${(()=>{const r=wd100BillRows(w,pm);return r.join('')||`<div class="wd100sr empty"><span>${_T('No weeks left to bill.')}</span></div>`})()}</div>
          <p class="wd100tba">${_T`On the night a billed fighter is entered in the biggest bout that fits: ${coinAmt87('+10')} appearance, +1 fame, and a 15% purse bonus if they win. It lapses harmlessly if they are hurt. Invitationals and the Superbus cannot be billed.`}</p></div>
        <div>${plq100(_T('Invitations'),_T('hosts write 3–5 weeks ahead'))}<div class="wd100sea">${(()=>{const r=wd100InvRows(w,pm);return r.join('')||`<div class="wd100sr empty"><span>${_T('No invitations right now.')}</span></div>`})()}</div>
          <p class="wd100tba">${_T('The Flavius Superbus: the top four of the league table send one fighter each to Roma when week 12 ends — invitation only.')}${(()=>{const sb=(w.specialLog||[]).filter(x=>/Superbus/.test(x.n));return sb.length?' '+_T`Past champions: ${sb.slice(-4).map(x=>`S${x.season} ${esc(x.champ||'?')}`).join(' · ')}.`:''})()}</p></div></div>
      <p class="wd100tba">${(()=>{try{const R=w.rivalry&&w.rivalry.season===w.season&&typeof rivalOf==='function'?rivalOf(w,pm.id):null;return _T`Week ${RIVAL_WK} is Rivalry Week (Familia, two on two) vs ${R?esc(R.ludus):_T('TBD — set at the start of week 11, when the Consilium writes')} · byes in weeks ${BYE_WKS.join(' and ')}.`}catch(e){return ''}})()}</p>`}
  else{const rows=sch.map((f,i)=>{const k=i+1;const bye=BYE_WKS.includes(k);return row(k,`<span class="c-cy">${bye?'—':esc(LOCATIONS[f.loc].n)}</span><span class="c-ev">${bye?_T('Bye'):riv(k)?_T('Rivalry')+' · '+esc(evShort(f)):esc(evShort(f))}</span><span class="c-bs">${esc(empireDate(season,k).short)}</span><span class="pl2">${riv(k)?_T('TBA'):''}</span><span class="pts">${bye?'':'×'+f.purse}</span>`)}).join('');
    lists=`<div class="wd100two one">${plq100(_T`The fixtures · season ${season}`,_T('cities and games are set · rivals, closures and prizes TBA'))}<div class="wd100sea">${rows}</div><p class="wd100tba">${_T('TBA = decided later: arena closures (wars, eruptions, plague), the week-12 rival, purses of the Grand Games.')}</p></div>`}
  return `<div class="wd100seatop">${seg100('data-wd100s',String(sv),[['0',_T`This season · ${ROMAN[w.season]||w.season}`],['1',_T`Next · ${ROMAN[w.season+1]||w.season+1}`],['2',_T`The one after · ${ROMAN[w.season+2]||w.season+2}`]])}
      <div class="wd100prz"><span class="tx">${cur?(N?N.txt:_T`You are ${lp90Ord(pos)} of ${L.length}`):_T('Fixtures are set · rival weeks, closures and prizes TBA')}</span></div></div>
    ${plq100(_T`Season ${season}`,cur?_T`week ${wk0} of 12 · byes ${BYE_WKS.join(' & ')} · the Superbus in Roma`:_T('host cities + games known · the rest is announced week by week'))}
    <div class="wd100cal">${Array.from({length:12},(_,i)=>tab(i+1)).join('')}${fin}</div>
    ${lists}`}

/* ---------- the final mgrHTML wrapper ---------- */
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||!WD100.tabs.includes(MGR.tab)||!wd100On())return h;
    const k=MGR.tab;const T=document.createElement('template');T.innerHTML=h;const pane=T.content.querySelector('#mgrPane');if(!pane)return h;
    const old=pane.innerHTML;let view='';
    if(k==='news')view=wd100NewsView();else if(k==='league')view=wd100LeagueView();else if(k==='imp')view=wd100ImpView();else if(k==='trophy')view=wd100TrophyView(WD100.tf==='mgr'?old:'');else view=wd100SeaView();
    pane.innerHTML=`<div class="wd100body wd100-${k}">${view}</div>`;pane.classList.add('wd100pane');
    const ban=T.content.querySelector('.roomhd.b73-'+k);const nb=wd100Banner(k);
    if(ban){const tt=document.createElement('template');tt.innerHTML=nb;ban.replaceWith(tt.content)}else{const rm=T.content.querySelector('.railmain');if(rm){const tt=document.createElement('template');tt.innerHTML=nb;rm.insertBefore(tt.content,rm.firstChild)}}
    if(document.body)document.body.classList.add('wd100on');
    if(k==='sched'&&WD100.last!=='sched:'+WD100.sea)setTimeout(()=>{const n=document.querySelector('#mgrBody .wd100wk.now');if(n)try{n.scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}},60);
    if(k==='sched'){const w=W_();const L2=w.night&&LOCATIONS[w.night.loc];if(L2&&typeof C90T!=='undefined'&&C90T[L2.n]==null&&typeof city90Thumb==='function'&&!HEADLESS)setTimeout(()=>{try{city90Thumb(w.night.loc);const u=C90T[L2.n];const p=document.querySelector('#mgrBody .b73-sched.wd100ban .pic');if(u&&p){p.innerHTML='';p.style.backgroundImage=`url(${u})`;p.style.backgroundPosition=['center','40%'].join(' ')}}catch(e){}},400)}
    WD100.last=k+':'+WD100.sea;return T.innerHTML}catch(e){console.error(e);return h}}}
/* clicks of the shell (capture, inside the Manager window) */
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#mgrBody'))return;const rd=()=>{if(typeof MGR_REDRAW==='function')MGR_REDRAW()};
  const h=t.closest('[data-wd100h]');if(h){e.preventDefault();e.stopPropagation();const id=h.dataset.wd100h;const R=mgrById(id);MGR.lg90=R&&!R.isPlayer?id:null;rd();return}
  const sc=t.closest('[data-wd100sc]');if(sc){e.preventDefault();e.stopPropagation();WD100.scout=!WD100.scout;rd();return}
  const nf=t.closest('[data-wd100nf]');if(nf){e.preventDefault();WD100.nf=nf.dataset.wd100nf;rd();return}
  const nm=t.closest('[data-wd100nm]');if(nm){e.preventDefault();WD100.nmore=!WD100.nmore;rd();return}
  const ly=t.closest('[data-wd100lay]');if(ly){e.preventDefault();const k=ly.dataset.wd100lay;WD100.lay[k]=WD100.lay[k]?0:1;rd();return}
  const hv=t.closest('.wd100file [data-hubview]');if(hv){e.preventDefault();e.stopPropagation();HUB.view=hv.dataset.hubview;rd();return}
  const tf=t.closest('[data-wd100tf]');if(tf){e.preventDefault();WD100.tf=tf.dataset.wd100tf;rd();return}
  const s=t.closest('[data-wd100s]');if(s){e.preventDefault();WD100.sea=+s.dataset.wd100s||0;rd();return}
  const c=t.closest('[data-wd100c]');if(c&&!t.closest('[data-ct]')){e.preventDefault();e.stopPropagation();const v=c.dataset.wd100c;WD100.city=v===''||+v===WD100.city&&c.classList.contains('wd100pin')?null:+v;rd();return}},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target;if(!t||!t.closest||!t.closest('#mgrBody'))return;if(t.matches('[data-wd100h],[data-wd100c].wd100wev,.wd100wk.now,.wd100sr.now')){e.preventDefault();t.click()}},true);
/* the lesson's "rival" step lights the new house row / card first (the old table is gone) */
try{const st=MTUT_STEPS.find(x=>x&&x.k==='rival');if(st&&typeof st.spot==='function'){const b0=st.spot;st.spot=()=>{if(wd100On()){const id=mtRivalId();const c=document.querySelector(`#mgrPane .wd100hc[data-lg90box="${id}"]`)||document.querySelector(`#mgrPane [data-wd100h="${id}"]`);if(c)return c}return b0()}}}catch(e){}

{const st=document.createElement('style');st.textContent=`
/* ---- the shell ---- */
.wd100ban.roomhd{position:relative;height:118px;overflow:hidden;isolation:isolate;border:1px solid #6a5130;border-bottom:2px solid #b0843a;border-radius:9px 9px 0 0;margin:0;padding:0;background:#1a130d;display:block}
.wd100ban .pic{position:absolute;inset:0;z-index:0;background:#2a1d12 center/cover no-repeat;filter:sepia(.18) saturate(.95)}
.wd100ban .pic svg{width:100%;height:100%;display:block}
.wd100ban .wd100shade{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,rgba(20,12,6,.92) 0%,rgba(20,12,6,.66) 34%,rgba(20,12,6,.1) 60%,rgba(20,12,6,.4) 100%);box-shadow:inset 0 0 0 1px #e2c88e55,inset 0 0 26px 4px #000a}
.wd100ban .wd100tt{position:absolute;z-index:4;left:18px;top:16px;right:auto;bottom:auto;display:flex;flex-direction:row;align-items:center;gap:12px;background:none;padding:0;margin:0;transform:none;max-width:56%}
.wd100ban .wd100ico{width:46px;height:46px;flex:none;border-radius:50%;display:grid;place-items:center;color:#2a1606;background:radial-gradient(circle at 34% 30%,#ffe0a0,#b07a34 55%,#4a2c10);box-shadow:0 0 0 2px #2a1708,0 3px 8px #000a}
.wd100ban .wd100ico svg{width:26px;height:26px;position:static;inset:auto}
.wd100ban .wd100rt svg,.wd100ban .wd100tro svg{position:static;inset:auto}.wd100ban .wd100tt>div{display:block}
.wd100ban .kick{font:700 10.5px var(--mono);letter-spacing:2px;color:#f6dd95;text-transform:uppercase;margin-bottom:3px;white-space:nowrap}
.wd100ban h2{font:400 27px/1 var(--display);color:#fff1cf;letter-spacing:.05em;text-shadow:0 2px 4px #000;margin:0;white-space:nowrap}
.wd100ban .sub{font-size:13.5px;color:#efe4c8;font-style:italic;margin-top:5px;text-shadow:0 1px 2px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wd100ban .wd100rt{position:absolute;z-index:4;right:16px;top:50%;transform:translateY(-50%);display:flex;gap:8px;align-items:center}
.wd100bc{background:#1a120de8;border:1px solid #c9a458;border-radius:6px;padding:4px 10px;text-align:right;white-space:nowrap}
.wd100bc b{display:block;font:400 18px var(--display);color:var(--gold2,#e0b95a)}.wd100bc small{display:block;font:10.5px var(--mono);color:#cdbf9f}
.wd100tro{position:absolute;z-index:2;right:150px;bottom:4px;display:flex;gap:10px;align-items:flex-end}.wd100tro svg{filter:drop-shadow(0 4px 5px #000)}
.b73-league.wd100ban .wd100rt{top:auto;bottom:0;transform:none;right:14px}
.wd100pod .lp96pod{margin:0;padding:0;gap:4px;width:auto;display:flex;align-items:flex-end}
.wd100pod .lp96p{width:92px}.wd100pod .lp96cup{width:40px;height:40px;margin-bottom:-2px;line-height:0}.wd100pod .lp96cup svg{width:40px;height:40px;display:block}
.wd100pod .lp96ban{padding:3px 4px 9px;text-shadow:0 1px 3px #000}.wd100pod .lp96ban b{font-size:12px}.wd100pod .lp96ban small{font-size:10px;white-space:nowrap}.wd100pod .lp96fl{display:none}
.wd100pod .lp96step{margin-top:-5px;padding-top:0;align-items:center;font-size:14px}.wd100pod .lp96p.p1 .lp96step{height:28px}.wd100pod .lp96p.p2 .lp96step{height:20px}.wd100pod .lp96p.p3 .lp96step{height:14px}
#mgrPane.wd100pane{padding:0}
.wd100body{--pink:#22170c;--pdim:#5a4526;--pomp:#7e2414;background:#e9dcbf url('${wd100Asset('parchment.webp')}');color:var(--pink);padding:12px 14px 14px;border:1px solid #6a5130;border-top:0;border-radius:0 0 9px 9px;box-shadow:inset 0 0 0 3px rgba(122,93,42,.22),inset 0 0 50px rgba(110,70,20,.25)}
.wd100body .rc-sub{color:var(--pdim)}
.wd100plq{display:flex;align-items:center;gap:10px;height:30px;padding:0 20px;margin:4px 0 8px;border-radius:4px;position:relative;background:linear-gradient(#c8964a,#8a5a22 55%,#6a4216);box-shadow:inset 0 1px 0 #ffe3a0,inset 0 -1px 0 #3a2208,0 2px 4px #0005;color:#1e1004}
.wd100plq::before,.wd100plq::after{content:"";position:absolute;top:50%;width:7px;height:7px;margin-top:-3.5px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff0c0,#8a5a1a 70%);box-shadow:0 1px 1px #000a}
.wd100plq::before{left:5px}.wd100plq::after{right:5px}
.wd100plq b{font:400 15px var(--display);letter-spacing:.12em;text-transform:uppercase;text-shadow:0 1px 0 #f0c878a0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.wd100plq .sp{flex:1}.wd100plq small{font:11.5px var(--mono);color:#1e1004;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%}
.wd100tools{display:flex;align-items:center;gap:10px;margin-bottom:10px;white-space:nowrap;min-width:0}.wd100tools .sp{flex:1}.wd100tools small{color:var(--pdim);font-size:12.5px;overflow:hidden;text-overflow:ellipsis}
.wd100seg{display:inline-flex;border:1px solid #8a6a3a;border-radius:16px;overflow:hidden;background:rgba(255,248,230,.6);flex:none;max-width:100%;overflow-x:auto}
.wd100seg button{border:0;background:transparent;padding:4px 12px;font-size:13.5px;color:var(--pink);cursor:pointer;white-space:nowrap;min-height:28px}
.wd100seg button+button{border-left:1px solid #b89a6a}.wd100seg button.on{background:linear-gradient(#8a2a1a,#6a1e12);color:#ffe9c9}
.wd100pbtn{font:13px var(--body);border:1px solid #8a5a1a;border-radius:5px;padding:3px 10px;background:linear-gradient(#f6e6c0,#e0c890);color:#22140a;cursor:pointer;white-space:nowrap}
.wd100pbtn.gold{background:linear-gradient(#f0cf7d,#c99a3a)}
.wd100fc{display:inline-block;width:26px;height:26px;border-radius:50%;overflow:hidden;flex:none;background:#3a2a18;box-shadow:0 0 0 1.5px #b0843a;vertical-align:middle;position:relative}
.wd100fc .portrait{display:block;width:26px!important;height:36px!important;margin:0}.wd100fc svg{display:block}.wd100fc.lg{width:34px;height:34px}.wd100fc.lg .portrait{width:34px!important;height:47px!important}
.wd100par{display:inline-block;flex:none;line-height:0;vertical-align:middle}.wd100par svg{width:100%;height:100%;display:block}
.wd100gch{display:inline-grid;place-items:center;min-width:24px;height:18px;padding:0 3px;border-radius:3px;font:600 11.5px var(--mono);color:#160f0b;flex:none;box-sizing:border-box}
.wd100gch.g-a{background:#8ccf5f}.wd100gch.g-bp{background:#c8d66a}.wd100gch.g-b{background:#d8c46a}.wd100gch.g-cp{background:#e0b050}.wd100gch.g-c{background:#e09a50}.wd100gch.g-d{background:#d07a4a}.wd100gch.g-f{background:#a3281f;color:#fff}.wd100gch.g-q{background:#cbb894}
.wd100riv{display:inline-flex;gap:1px;align-items:center;vertical-align:middle}
.wd100empty{color:var(--pdim);font-style:italic;margin:6px 2px}
/* ---- rows ---- */
.wd100rows{display:flex;flex-direction:column;gap:3px}
.wd100r,.wd100rh{display:grid;align-items:center;gap:10px;padding:0 10px;white-space:nowrap;min-width:0}
.wd100r{height:38px;border-radius:5px;background:rgba(255,250,236,.78);border:1px solid rgba(122,93,42,.4);cursor:pointer;font-size:14px;color:var(--pink)}
.wd100r:hover{background:rgba(255,250,236,.95);border-color:#8a6a3a}.wd100r:focus-visible{outline:2px solid #8a5a1a}
.wd100r>*{min-width:0;overflow:hidden;text-overflow:ellipsis}
.wd100r .chev{color:#6a4a1a;font-size:17px;text-align:right;overflow:visible}
.wd100r.me{background:linear-gradient(90deg,rgba(240,207,125,.85),rgba(255,240,200,.8));border-color:#8a5a1a;box-shadow:inset 3px 0 0 #8a5a1a}
.wd100r.sel{outline:2px solid #6a3a10;outline-offset:-1px}
.wd100rh{height:20px;font:600 9.5px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--pdim)}.wd100rh>*{min-width:0;overflow:hidden}.wd100rh .n{text-align:right}
/* ---- news ---- */
.wd100acta{position:relative;border-radius:4px;padding:10px 16px;margin-bottom:12px;background:#f2e6c9;box-shadow:0 0 0 1px #9c8058,0 4px 10px rgba(60,30,10,.35),inset 0 0 30px rgba(140,90,40,.22)}
.wd100acta .pin{position:absolute;top:-6px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe0a0,#8a5a1a 70%);box-shadow:0 2px 3px #0008}.wd100acta .pin.l{left:18px}.wd100acta .pin.r{right:18px}
.wd100acta h3{font:400 22px/1 var(--display);color:var(--pomp);letter-spacing:.14em;text-align:center;margin:2px 0 2px}
.wd100acta .dt{text-align:center;font:11px var(--mono);color:var(--pdim);letter-spacing:.08em;margin-bottom:8px}.wd100acta .dt .wd100pbtn{margin-left:8px;font-size:12px;padding:1px 8px}
.wd100acta .cols>div{min-width:0}.wd100acta .cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.wd100acta h4{font:400 13px var(--display);letter-spacing:.12em;color:var(--pomp);border-bottom:1px solid #b08a5a;padding-bottom:2px;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wd100acta .ln{display:flex;align-items:center;gap:7px;height:28px;font-size:13.5px;white-space:nowrap;min-width:0}.wd100acta .ln .wd100fc{width:22px;height:22px}
.wd100acta .ln .t{min-width:0;overflow:hidden;text-overflow:ellipsis;flex:1}.wd100acta .ln i{font:11px var(--mono);font-style:normal;color:var(--pdim);flex:none}
.wd100acta .ln .wd100fc svg{width:22px;height:22px}
.wd100wall{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;padding:12px;border-radius:6px;background:#cfb98f;box-shadow:inset 0 0 0 2px #e2c88e,inset 0 0 0 4px var(--pomp),inset 0 0 0 5px #3a1a0c,inset 0 0 30px rgba(60,30,10,.45)}
.wd100pn{display:grid;grid-template-columns:44px minmax(0,1fr);grid-template-rows:20px 18px 16px;column-gap:9px;align-items:center;height:72px;padding:6px 10px;border-radius:2px;position:relative;min-width:0;background:#f3e9d2;box-shadow:0 1px 2px rgba(60,30,10,.4),inset 0 0 14px rgba(150,110,60,.22)}
.wd100pn .em{grid-row:1/4;width:44px;height:44px;border-radius:50%;overflow:hidden;background:#3a2a18;box-shadow:0 0 0 2px #e2c88e,0 0 0 3.5px var(--pomp);display:grid;place-items:center}
.wd100pn .em .portrait{width:44px!important;height:61px!important;align-self:start}
.wd100pn .em.sym{background:radial-gradient(circle at 35% 30%,#f6e6c0,#d8bf8a)}.wd100pn .em.sym svg{width:28px;height:28px}
.wd100pn .em.par{background:none;box-shadow:none}
.wd100pn b{font:400 16px/1.1 var(--display);color:var(--pomp);letter-spacing:.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.wd100pn .sb{font-size:13px;color:#2e2112;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.wd100pn .ft{display:flex;gap:6px;align-items:center;font:10.5px var(--mono);color:var(--pdim);white-space:nowrap;overflow:hidden;min-width:0}.wd100pn .ft .wh{overflow:hidden;text-overflow:ellipsis}
.wd100tag{font:600 9.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:0 5px;border-radius:3px;color:#fff6e6;line-height:15px;flex:none}
.wd100tag.th{background:#7a5418}.wd100tag.tr{background:#7e2414}.wd100tag.ta{background:#4a3a7a}.wd100tag.te{background:#22505e}
.wd100pn .ft .gain{margin-left:auto;color:#1f5214;font-weight:600}.wd100pn .ft .loss{margin-left:auto;color:#7e2414;font-weight:600}
.wd100pn.new::after{content:"NEW";position:absolute;top:5px;right:6px;font:700 8.5px var(--mono);letter-spacing:.08em;color:#fff3e0;background:var(--pomp);border-radius:2px;padding:0 4px}
/* ---- league ---- */
.wd100next{display:flex;align-items:center;gap:10px;min-height:34px;padding:0 12px;margin-bottom:10px;border-radius:5px;background:rgba(255,250,236,.6);border:1px dashed #8a6a3a;font-size:14px;white-space:nowrap;overflow:hidden;color:var(--pink)}
.wd100next>b,.wd100next b{color:#5a1e0a}.wd100next .bar{flex:1;height:7px;border-radius:4px;background:rgba(80,50,20,.18);max-width:220px;position:relative;min-width:40px}.wd100next .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:linear-gradient(90deg,#8a5a1a,#d6ab4c)}
.wd100next .tx,.wd100prz .tx{min-width:0;overflow:hidden;text-overflow:ellipsis}
.wd100next .left{margin-left:auto;color:var(--pdim);font-size:12.5px}
.wd100lg{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;align-items:start}
.wd100lgt .wd100rh,.wd100lgt .wd100r{grid-template-columns:22px 28px minmax(0,1.5fr) 40px 84px minmax(0,1.4fr) 52px 48px 12px}
.wd100lgt .pl{font:400 17px var(--display);color:#5a3410;text-align:center}
.wd100lgt .hn b{font-weight:700}.wd100lgt .hn small{color:var(--pdim);font-size:12px;margin-left:6px}.wd100lgt .hn .rv{display:none;margin-left:4px}
.wd100lgt .pts{font:600 15px var(--mono);text-align:right}
.wd100form{display:flex;gap:4px}.wd100form i{width:13px;height:13px;border-radius:50%;box-shadow:inset 0 -1px 2px #0005;flex:none}
.wd100form i.w{background:#3f7a22}.wd100form i.l{background:#a3281f}.wd100form i.d{background:#b8a47e}.wd100form i.n{background:transparent;box-shadow:inset 0 0 0 1px #b8a47e}
.wd100lgt .tg{display:flex;align-items:center;gap:7px}.wd100lgt .tg>span:nth-child(2){overflow:hidden;text-overflow:ellipsis;font-size:13.5px;min-width:0}
.wd100lgt .rec{font:12.5px var(--mono);text-align:right}
.wd100side{position:sticky;top:8px}
.wd100hc{border-radius:7px;overflow:hidden;background:#1f1711;color:var(--bone,#e8dcc0);border:1px solid #8a6a3a;box-shadow:0 4px 14px rgba(40,20,5,.45)}
.wd100hc .top2{display:grid;grid-template-columns:72px minmax(0,1fr);gap:10px;padding:10px;background:linear-gradient(#2e2216,#1f1711)}
.wd100hc .sc svg{width:72px;height:108px;display:block}
.wd100hc h3{font:400 19px/1.1 var(--display);color:var(--gold2,#e0b95a);margin:0 0 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wd100hc .ln2{font-size:13px;color:#cdbf9f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:19px}.wd100hc .ln2 b{color:#f3e6c8;font-weight:500}
.wd100hc .lan{display:flex;gap:8px;align-items:center;margin-top:5px;min-width:0}
.wd100hc .sq{padding:6px 10px 10px}.wd100hc .sqh{font:500 9.5px var(--mono);letter-spacing:.14em;color:#b9a888;text-transform:uppercase;margin:4px 0}
.wd100hc .gr{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:8px;align-items:center;height:32px;border-top:1px solid #ffffff14;font-size:13.5px;white-space:nowrap}.wd100hc .gr>span:nth-child(2){overflow:hidden;text-overflow:ellipsis}
.wd100hc .btns{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:0 10px 10px}.wd100hc .btns .wide{grid-column:1/-1}
.wd100hc .btns button{min-height:38px;border-radius:6px;font:400 15px var(--display);letter-spacing:.04em;cursor:pointer;white-space:normal;line-height:1.15;padding:3px 6px;overflow:visible}
.wd100hc .b1{border:1px solid #c9a458;background:linear-gradient(#5a4520,#3a2c14);color:#f3e3bd}.wd100hc .b1.on{box-shadow:inset 0 0 0 2px #f0cf7d}
.wd100hc .b2{border:1px solid #e2b04e;background:linear-gradient(#7a2318,#4a140d);color:#fff1cf}.wd100hc .b2:disabled{opacity:.6;cursor:not-allowed}
.wd100hc .cst{display:block;font:11px var(--mono);color:#cdbf9f;letter-spacing:0;overflow:hidden;text-overflow:ellipsis}
.wd100hc .heat{display:flex;gap:6px;align-items:center;padding:6px 10px;background:#3a1510;color:#ffc9bb;font-size:12.5px;white-space:nowrap}
.wd100scout{padding:0 8px 8px}.wd100scout .lg90{background:#14100c;border-radius:5px;padding:6px;overflow-x:auto}.wd100scout .lg90 .acts{display:none}
/* ---- imperium ---- */
.wd100imp{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;align-items:start}
.wd100map{position:relative;border-radius:6px;overflow:hidden;box-shadow:inset 0 0 0 2px #e2c88e,0 0 0 1px #6a4216,0 4px 12px rgba(40,20,5,.4);aspect-ratio:900/909;background:#c9b48a;max-height:calc(100vh - 180px);margin:0 auto}
.wd100map .mp{position:absolute;inset:0;background:center/100% 100% no-repeat;filter:sepia(.15) saturate(.9)}
.wd100map .lay2{position:absolute;inset:0}
.wd100pin{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer;background:none;border:0;padding:0;margin:0;z-index:2;font:inherit}
.wd100pin .dot{width:20px;height:20px;border-radius:50%;background:#2a1d13;border:2px solid #e8c88a;box-shadow:0 2px 4px #000a;position:relative;box-sizing:border-box}
.wd100pin .warm{position:absolute;left:50%;top:10px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,140,40,.55),rgba(255,120,30,0) 70%);pointer-events:none}
.wd100pin .nm{font:400 12.5px var(--display);color:#22140a;background:rgba(246,234,206,.94);padding:0 6px;border-radius:3px;margin-top:3px;white-space:nowrap;box-shadow:0 1px 2px #0004}
.wd100pin.host .dot{background:#a3281f;border-color:#ffe39a;width:26px;height:26px;box-shadow:0 0 0 3px rgba(240,207,125,.6),0 0 14px #ffcf6a}.wd100pin.host .nm{background:#7e2414;color:#ffe9c9}
.wd100pin.closed .dot{background:#3a1510;border-color:#ff5a44}.wd100pin.closed .dot::after{content:"";position:absolute;inset:3px;background:linear-gradient(45deg,transparent 42%,#ff5a44 42% 58%,transparent 58%),linear-gradient(-45deg,transparent 42%,#ff5a44 42% 58%,transparent 58%)}
.wd100pin.mine .dot{border-color:#f0cf7d;box-shadow:0 0 0 2px #2a1606,0 0 0 4px #f0cf7d}
.wd100pin.on .nm{outline:2px solid #7e2414}.wd100pin:focus-visible .dot{outline:2px solid #fff}
.wd100pin .badg{position:absolute;top:-10px;right:-14px;width:20px;height:20px;border-radius:50%;background:#f6eace;border:1.5px solid #6a4216;display:grid;place-items:center;box-shadow:0 1px 2px #0006}.wd100pin .badg svg{width:13px;height:13px}.wd100pin .badg.b2{right:auto;left:-14px}
.wd100map .leg{position:absolute;left:10px;bottom:10px;display:flex;gap:10px;align-items:center;background:rgba(246,234,206,.94);border:1px solid #8a6a3a;border-radius:5px;padding:4px 9px;font-size:12px;white-space:nowrap;color:#22140a;z-index:3}
.wd100map .leg i{display:inline-block;width:11px;height:11px;border-radius:50%;vertical-align:-1px;margin-right:3px;border:1.5px solid #6a4216}
.wd100map .leg .lh{background:#a3281f;border-color:#ffe39a}.wd100map .leg .lm{background:#2a1d13;border-color:#f0cf7d}.wd100map .leg .lc{background:#3a1510;border-color:#ff5a44}.wd100map .leg .lf{background:radial-gradient(#ff8c28,#ffd2a0);border-color:#ff8c28}
.wd100map .mtools{position:absolute;right:10px;top:10px;z-index:3}
.wd100cc{position:absolute;width:286px;border-radius:7px;overflow:hidden;background:#1f1711;color:var(--bone,#e8dcc0);border:1px solid #c9a458;box-shadow:0 8px 24px #000c;z-index:6}
.wd100cc .hd{display:flex;align-items:center;gap:9px;padding:7px 10px;background:linear-gradient(90deg,#8a2a1a,#5e1a12)}
.wd100cc .hd b{font:400 19px var(--display);color:#fff1cf;white-space:nowrap}.wd100cc .hd small{font:11px var(--mono);color:#ffd2c4;margin-left:auto;white-space:nowrap}
.wd100cc .hd .x{border:0;background:none;color:#ffe9c9;cursor:pointer;font-size:15px;padding:0 2px}
.wd100cc .ar{display:grid;grid-template-columns:62px minmax(0,1fr);gap:9px;padding:8px 10px}
.wd100cc .sw{width:62px;height:62px;border-radius:5px;background:center/240% auto;box-shadow:inset 0 0 0 1px #0008,0 0 0 1px #c9a458}
.wd100cc .kvs{padding:0 10px 6px}
.wd100cc .kv{display:grid;grid-template-columns:68px minmax(0,1fr);min-height:22px;align-items:center;font-size:13px;white-space:nowrap;gap:4px}
.wd100cc .kv>span:first-child{font:500 9.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:#b9a888}.wd100cc .kv>span:last-child{overflow:hidden;text-overflow:ellipsis}
.wd100cc .neg{color:#ffb3a6}
.wd100cc .nx{display:grid;grid-template-columns:44px minmax(0,1fr);gap:9px;padding:8px 10px;border-top:1px solid #ffffff14;align-items:center}
.wd100cc .nx .ec{display:block;width:44px;line-height:0}.wd100cc .nx .ec .cimg{width:44px!important;height:auto;display:block}
.wd100cc .nx b{display:block;font:400 15px var(--display);color:var(--gold2,#e0b95a);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wd100cc .nx small{display:block;font-size:12.5px;color:#cdbf9f;white-space:nowrap}
.wd100cc .ft2{display:flex;gap:6px;padding:0 10px 10px}.wd100cc .ft2 .wd100pbtn{flex:1;text-align:center}
.wd100ccph{display:none}
.wd100wevs{display:flex;flex-direction:column;gap:6px}
.wd100wev{display:grid;grid-template-columns:40px minmax(0,1fr);grid-template-rows:20px 18px 16px;column-gap:9px;align-items:center;height:68px;padding:6px 9px;border-radius:5px;background:rgba(255,250,236,.75);border:1px solid rgba(122,93,42,.35);border-left:4px solid var(--c);cursor:pointer;min-width:0;box-sizing:border-box}
.wd100wev .em{grid-row:1/4;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#f6e6c0,#d8bf8a);box-shadow:0 0 0 2px var(--c)}.wd100wev .em svg{width:24px;height:24px}
.wd100wev b{font:400 15px var(--display);color:#22140a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.wd100wev .sb{font-size:12.5px;color:#2e2112;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.wd100wev .ft{font:10.5px var(--mono);color:var(--pdim);white-space:nowrap;display:flex;gap:8px;overflow:hidden;align-items:center}.wd100wev .ft .neg{color:#7e2414}.wd100wev .ft .pos{color:#1f5214}
.wd100wev .sev{display:inline-flex;gap:2px}.wd100wev .sev i{width:6px;height:6px;border-radius:1px;background:#c8b48a}.wd100wev .sev i.on{background:var(--c)}
/* ---- tituli ---- */
.wd100tit{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:10px;margin-bottom:12px}
.wd100tp{position:relative;height:204px;border-radius:5px;padding:8px 8px 9px;display:grid;grid-template-rows:110px 20px 18px 24px;gap:2px;justify-items:center;min-width:0;box-sizing:border-box;
 background:linear-gradient(160deg,#d3a35a,#9a6a2a 40%,#7a4e1c 70%,#a8763a);box-shadow:inset 0 1px 0 #ffe7b0,inset 0 -2px 0 #3a2208,inset 0 0 0 3px #6a4216,inset 0 0 0 4px #e0b870,0 3px 7px rgba(40,20,5,.45)}
.wd100tp::before,.wd100tp::after{content:"";position:absolute;top:8px;width:7px;height:7px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff0c0,#7a4a14 70%)}.wd100tp::before{left:8px}.wd100tp::after{right:8px}
.wd100tp .art{height:110px;display:grid;place-items:center;width:100%;border-radius:4px;background:radial-gradient(ellipse at 50% 80%,#2a1a0c,#140c06);box-shadow:inset 0 0 12px #000;overflow:hidden}
.wd100tp .art svg{max-height:100px;max-width:90%;filter:drop-shadow(0 3px 4px #000)}
.wd100tp b{font:400 14.5px var(--display);color:#1e0e02;letter-spacing:.04em;text-shadow:0 1px 0 #f0c878a0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.wd100tp .sb{font-size:12px;color:#1e0e02;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.wd100tp .won{font:11px var(--mono);color:#fff1cf;background:#2a1606d0;border-radius:3px;padding:2px 7px;white-space:nowrap;align-self:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}
.wd100tp.lock{background:linear-gradient(160deg,#5a4a3a,#3a3028 50%,#2e261e);box-shadow:inset 0 1px 0 #8a7a62,inset 0 0 0 3px #2a2018,inset 0 0 0 4px #6a5a48,0 3px 7px rgba(40,20,5,.45)}
.wd100tp.lock .art svg{filter:brightness(0) drop-shadow(0 0 1px #8a7a62);opacity:.6}
.wd100tp.lock b,.wd100tp.lock .sb{color:#e3d6bc;text-shadow:none}
.wd100tp .prog{width:100%;align-self:center;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:center;font:10.5px var(--mono);color:#e3d6bc;white-space:nowrap}
.wd100tp .prog.none{display:block;text-align:center;overflow:hidden;text-overflow:ellipsis}
.wd100tp .prog i{height:7px;border-radius:4px;background:#1a140e;position:relative;box-shadow:inset 0 0 0 1px #6a5a48}.wd100tp .prog i u{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:linear-gradient(90deg,#8a6a2a,#d6ab4c)}
.wd100tp .lk{position:absolute;top:14px;right:14px;width:18px;height:18px;opacity:.8}.wd100tp .lk svg{width:18px;height:18px}
.wd100case{margin-top:6px}.wd100case .troomwrap{background:rgba(30,20,12,.92);border-radius:6px;padding:8px;color:var(--bone,#e8dcc0)}
/* ---- season: dark tablets on the light parchment (his note) ---- */
.wd100seatop{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;margin-bottom:10px}
.wd100prz{display:flex;gap:10px;align-items:center;min-height:34px;padding:0 12px;border-radius:5px;background:rgba(255,250,236,.7);border:1px dashed #8a6a3a;white-space:nowrap;overflow:hidden;font-size:14px;color:var(--pink);min-width:0}
.wd100prz b{color:#5a1e0a}
.wd100cal{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));gap:6px;padding-top:10px}
.wd100wk{position:relative;height:196px;border-radius:5px;padding:5px;display:grid;grid-template-rows:16px 92px 18px 15px 30px;gap:2px;box-sizing:border-box;min-width:0;color:#f6ead0;
 background-color:#3d2b1a;background-image:linear-gradient(#4a3420,#2e2014);border:1px solid #1e140a;box-shadow:inset 0 0 0 1px #9a7440,0 2px 5px rgba(30,15,5,.45)}
.wd100wk .n{display:flex;justify-content:space-between;gap:3px;font:600 9.5px var(--mono);letter-spacing:.06em;color:#ead9b2;white-space:nowrap;overflow:hidden}
.wd100wk .art{border-radius:3px;background:#140c06;box-shadow:inset 0 0 0 1px #6a4216;overflow:hidden;position:relative;display:grid;place-items:center}
.wd100wk .art .cimg{position:absolute;left:50%;top:-6%;width:185%!important;transform:translateX(-50%);max-width:none}
.wd100wk .ct{font:400 13.5px var(--display);color:#fff3dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wd100wk .ev{font-size:11.5px;color:#e6d4ae;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wd100wk .res{display:flex;align-items:center;justify-content:space-between;gap:3px;border-top:1px dashed #9a7a4a;padding-top:3px;font:11px var(--mono);white-space:nowrap;overflow:hidden;color:#f0e2c4}
.wd100wk .res b{font:400 14px var(--display);color:#ffd98a}.wd100wk .res .pts{color:#b6e39a;font-weight:600}
.wd100wk.past{background-color:#3a3026;background-image:linear-gradient(#433628,#2e251c)}.wd100wk.past .art{filter:sepia(.5) saturate(.7)}
.wd100wk .nowt,.wd100sr .nowt2{font:700 9px var(--mono);letter-spacing:.1em;color:#fff4d8;background:#7a1f12;border-radius:3px;padding:1px 6px;white-space:nowrap}
.wd100wk .nowt{position:absolute;top:-10px;left:50%;transform:translateX(-50%);z-index:2;box-shadow:0 0 0 1px #f0cf7d}
.wd100wk.bye{background-color:#45403a;background-image:linear-gradient(#524c44,#38332e);box-shadow:inset 0 0 0 1px #8a8070}
.wd100wk.bye .art{background:#6a6458 url('${wd100Asset('stone_wall.webp')}') center/300% auto;font:400 19px var(--display);color:#fbf5e8;letter-spacing:.14em;text-shadow:0 1px 3px #000}
.wd100wk.gg{background-color:#4a3410;background-image:linear-gradient(#5a4214,#33240a);box-shadow:inset 0 0 0 2px #c99a3a,inset 0 0 0 3px #ffe39a,0 2px 4px rgba(40,20,5,.3)}
.wd100wk.gg .art svg{max-height:86px;filter:drop-shadow(0 2px 4px #000)}
.wd100cal .wd100wk.now{background-color:#5a3d16;background-image:linear-gradient(#6a4a1c,#4a3010);border-color:#f0cf7d;box-shadow:0 0 0 2px #b0843a,0 0 0 4px #f0cf7d,0 0 18px #f0cf7d;transform:translateY(-3px);cursor:pointer;z-index:1}
.wd100cal .wd100wk.now .n{color:#ffe7a8}
.wd100wk .riv2,.wd100wk .cl{position:absolute;top:24px;font:700 9px var(--mono);color:#fff4d8;border-radius:3px;padding:0 4px;letter-spacing:.06em;z-index:1}.wd100wk .riv2{right:8px;background:#7a1f12}.wd100wk .cl{left:8px;background:#1e0a06}
.wd100two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-top:12px}.wd100two.one{grid-template-columns:minmax(0,1fr)}
/* the listed schedule: dark ink on near-white striped rows (AA) */
.wd100sea{display:flex;flex-direction:column;border:1px solid #6a4a22;border-radius:5px;overflow:hidden;background:#fbf5e4}
.wd100sr{display:grid;grid-template-columns:50px minmax(0,.9fr) minmax(0,1.1fr) minmax(0,1.1fr) 70px 46px;gap:10px;align-items:center;height:36px;padding:0 10px;white-space:nowrap;font-size:14px;color:#1c1209;background-color:#fbf5e4;border-top:1px solid #c8b088}
.wd100sr:first-child{border-top:0}.wd100sr:nth-child(even){background-color:#efe3c6}
.wd100sr>*{min-width:0;overflow:hidden;text-overflow:ellipsis}
.wd100sr .wkn{font:700 12px var(--mono);color:#3e2c12}.wd100sr .c-bs{color:#3e2c12}
.wd100sr .pts{font:700 13.5px var(--mono);color:#1b4a10;text-align:right}.wd100sr .pl2{font:400 15px var(--display);color:#5e1a0c;text-align:right}
.wd100sr.now{background-color:#f7dc8e;border-top:2px solid #7a4a10;border-bottom:2px solid #7a4a10;box-shadow:inset 4px 0 0 #7a1f12;cursor:pointer;font-weight:600}
.wd100sr.now .c-bs,.wd100sr.now .wkn{color:#2a1a06}.wd100sr.empty{grid-template-columns:minmax(0,1fr);color:#3e2c12;font-style:italic}
.wd100body .wd100tba{font-size:12.5px;color:#4d3a1f;font-style:italic;margin:8px 0 0}

/* ---- moved in from the old tabs (v1.0 · his 1c): dark panels, the house card ledger, map layer chips, billing ---- */
.wd100dk{margin:2px 0 12px;border:1px solid #8a6a3a;border-radius:6px;background:rgba(30,20,12,.94);color:var(--bone,#e8dcc0);padding:8px 10px;overflow-x:auto}
.wd100dk .rc-sub{color:var(--muted,#b9a888)}.wd100dk p{margin:4px 0}
.wd100more{display:flex;justify-content:center;margin:8px 0 14px}
.wd100pn.bad{box-shadow:0 1px 2px rgba(60,30,10,.4),inset 0 0 14px rgba(150,110,60,.22),inset 3px 0 0 #a3281f}
.wd100r.top4 .pl{text-decoration:underline;text-decoration-color:#b0843a;text-decoration-thickness:2px;text-underline-offset:3px}
.wd100hc .wd100led{padding:2px 10px 8px;border-top:1px solid #ffffff14}
.wd100hc .wd100led .sqh{font:500 9.5px var(--mono);letter-spacing:.14em;color:#b9a888;text-transform:uppercase;margin:6px 0 3px}
.wd100hc .wd100led .kv{display:grid;grid-template-columns:76px minmax(0,1fr);align-items:center;min-height:21px;font-size:12.5px;white-space:nowrap;gap:6px;color:#e8dcc0}
.wd100hc .wd100led .kv>span:first-child{font:500 9.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#b9a888}
.wd100hc .wd100led .kv>span:last-child{overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px;min-width:0}
.wd100hc .wd100led small{font:11px var(--mono);color:#cdbf9f}.wd100hc .wd100led small.hot{color:#ffb3a6}
.wd100hc .wd100led .mt{display:inline-block;width:56px;height:6px;border-radius:3px;background:#0006;box-shadow:inset 0 0 0 1px #6a5a48;position:relative;flex:none}.wd100hc .wd100led .mt i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:linear-gradient(90deg,#8a6a2a,#d6ab4c)}
.wd100hc .wd100led .kv.rivs{align-items:start;padding:2px 0}.wd100hc .wd100led .kv.rivs>span:last-child{flex-direction:column;align-items:flex-start;gap:1px;white-space:nowrap}.wd100hc .wd100led .rvl{display:flex;align-items:center;gap:4px;max-width:100%;overflow:hidden;text-overflow:ellipsis}.wd100hc .wd100led .rvl i{width:8px;height:8px;border-radius:2px;flex:none}
.wd100hc .wd100led .rc-sub{color:#cdbf9f}
.wd100lay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
.wd100lay .pg84mks{pointer-events:auto}.wd100lay .flow{animation:wd100dash 1.6s linear infinite}@keyframes wd100dash{to{stroke-dashoffset:-32}}
body.calm .wd100lay .flow,body.idle92 .wd100lay .flow{animation:none}
@media (prefers-reduced-motion:reduce){.wd100lay .flow{animation:none}}
.wd100map .mtools{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;max-width:62%}
.wd100chip{border:1px solid #8a6a3a;border-radius:14px;background:rgba(246,234,206,.94);color:#22140a;font:13px var(--body);padding:2px 10px;min-height:26px;cursor:pointer;white-space:nowrap}
.wd100chip.on{background:linear-gradient(#8a2a1a,#6a1e12);color:#ffe9c9;border-color:#3a1208}.wd100chip:focus-visible{outline:2px solid #fff}
.wd100filew .empstrip{margin-bottom:6px}.wd100filew .seg{display:flex;gap:4px}
.wd100tro{right:150px;bottom:6px;gap:12px}
.wd100pl{position:relative;display:flex;flex-direction:column;align-items:center;width:62px}
.wd100pl .tr{display:block;line-height:0;z-index:1;margin-bottom:-6px}.wd100pl .tr svg{filter:drop-shadow(0 4px 5px #000)}
.wd100pl i{display:block;width:60px;height:14px;border-radius:3px 3px 1px 1px;background:linear-gradient(#a89878,#6e604a);box-shadow:inset 0 1px 0 #e8dcc0aa,0 3px 5px #000a}
.wd100tro.none{align-items:flex-end}.wd100tro.none .gh{display:block;width:34px;height:46px;margin-bottom:-4px;border:2px dashed #e2c88e;border-radius:50% 50% 6px 6px/40% 40% 6px 6px;opacity:.45}
.wd100first{position:absolute;left:0;right:0;bottom:22px;text-align:center;font:italic 13px var(--body);color:#f6e6c0;text-shadow:0 1px 3px #000,0 0 8px #000;white-space:nowrap}
.wd100all{position:relative;display:inline-grid;place-items:center;width:132px;height:72px;filter:drop-shadow(0 2px 4px #000a)}
.wd100ban .wd100all svg{position:absolute;inset:0;width:100%;height:100%}
.wd100all b{position:relative;font:400 21px var(--display);color:#ffe39a;letter-spacing:.06em;text-shadow:0 1px 3px #000}
.wd100two.wd100bill{margin-top:14px}
.wd100sr.bill{grid-template-columns:62px minmax(0,.7fr) minmax(0,1.25fr) minmax(0,1.35fr) 46px}
.wd100sr.bill .c-bl{display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden}
.wd100sr.bill .c-bl>b,.wd100sr.iv .c-bl>b{overflow:hidden;text-overflow:ellipsis;min-width:0}
.wd100sr small{font:12px var(--mono);color:#3e2c12}
.wd100sr select.tin{max-width:150px;min-width:0;height:26px;border:1px solid #8a6a3a;border-radius:4px;background:#fffaf0;color:#1c1209;font:13px var(--body);flex:1}
.wd100pbtn.sm{padding:1px 8px;font-size:12.5px;flex:none;min-height:24px}
.wd100sr.iv{grid-template-columns:50px minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,1.1fr)}
.wd100sr.iv .c-cy{display:flex;align-items:center;gap:6px;min-width:0}.wd100sr.iv .c-cy .tro{display:inline-block;line-height:0;flex:none;width:22px}.wd100sr.iv .c-cy .tro svg{width:22px;height:22px}
.wd100sr.iv .c-bl{display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden}.wd100sr.iv .c-bl small{overflow:hidden;text-overflow:ellipsis}
.wd100sr.iv.live{background-color:#f7dc8e}.wd100sr.iv.past{color:#3e2c12}.wd100sr.iv.mine{font-weight:600}
.wd100sr .amt87{color:#1c1209}.wd100sr .amt87 .sr87{color:#3e2c12}
/* ---- tablets / phones ---- */
@media (max-width:1100px){.wd100cal{grid-template-columns:repeat(7,minmax(0,1fr));row-gap:16px}.wd100lg,.wd100imp{grid-template-columns:minmax(0,1fr) 260px}.wd100lgt .wd100rh,.wd100lgt .wd100r{grid-template-columns:22px 28px minmax(0,1.5fr) 40px 84px minmax(0,1.2fr) 50px 12px}.wd100lgt .c-riv{display:none}}
@media (max-width:860px){.wd100lg,.wd100imp{grid-template-columns:minmax(0,1fr)}.wd100side{position:static}.wd100wall{grid-template-columns:repeat(2,minmax(0,1fr))}.wd100two{grid-template-columns:minmax(0,1fr)}}
@media (max-width:600px){
 .wd100ban.roomhd{height:96px;border-radius:0}.wd100ban .wd100tt{left:10px;top:12px;max-width:62%}.wd100ban .wd100ico{display:none}.wd100ban h2{font-size:21px}.wd100ban .sub{font-size:12px}.wd100ban .wd100rt{right:8px}
 .wd100ban .wd100bc{padding:3px 7px}.wd100ban .wd100bc b{font-size:15px}.wd100tro{display:none}
 .b73-news.wd100ban .wd100rt,.b73-imp.wd100ban .wd100rt,.b73-trophy.wd100ban .wd100rt,.b73-sched.wd100ban .wd100rt{display:none}.b73-league.wd100ban .sub{display:none}
 .wd100pod .lp96p{width:40px}.wd100pod .lp96ban b,.wd100pod .lp96ban small{display:none}.wd100pod .lp96ban{padding:2px;min-height:6px}.wd100pod .lp96cup,.wd100pod .lp96cup svg{width:26px;height:26px}
 .wd100body{padding:10px 8px 12px;border-radius:0}
 .wd100tools{flex-wrap:wrap}.wd100tools small{display:none}
 .wd100acta .cols{grid-template-columns:minmax(0,1fr);gap:6px}.wd100wall{grid-template-columns:minmax(0,1fr);padding:8px}
 .wd100lgt .wd100rh,.wd100lgt .wd100r{grid-template-columns:18px 24px minmax(0,1fr) 34px 70px 12px;gap:7px;padding:0 7px}
 .wd100lgt .c-tg,.wd100lgt .c-rec,.wd100lgt .c-riv{display:none}.wd100lgt .hn small{display:none}.wd100lgt .hn .rv{display:inline}.wd100lgt .wd100par{width:24px!important;height:24px!important}
 .wd100form{gap:2px}.wd100form i{width:11px;height:11px}.wd100next{font-size:12.5px;gap:7px;flex-wrap:wrap;white-space:normal;padding:4px 10px}.wd100next .bar{display:none}
 .wd100hc{margin-top:12px}
 .wd100map .lay2 .wd100cc{display:none}.wd100ccph{display:block;margin-top:10px}.wd100ccph .wd100cc{position:static;width:auto}
 .wd100pin .nm{font-size:10px;padding:0 3px}.wd100pin .dot{width:14px;height:14px}.wd100pin.host .dot{width:18px;height:18px}.wd100pin .badg{width:15px;height:15px;top:-8px;right:-11px}.wd100pin .badg svg{width:10px;height:10px}.wd100pin .badg.b2{left:-11px}
 .wd100map .leg{font-size:10px;gap:6px;padding:2px 6px;left:4px;bottom:4px}.wd100map .mtools{right:4px;top:4px}.wd100map .mtools .wd100seg button{padding:3px 7px;font-size:12px}
 .wd100tit{grid-template-columns:repeat(2,minmax(0,1fr))}
 .wd100seatop{grid-template-columns:minmax(0,1fr);gap:8px}.wd100seg button{padding:4px 8px;font-size:12.5px}
 .wd100cal{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;row-gap:16px}.wd100wk{height:176px;grid-template-rows:16px 78px 18px 15px 28px}.wd100wk.now{transform:none}
 .wd100sr.bill{grid-template-columns:50px minmax(0,.8fr) minmax(0,1.6fr);gap:7px}.wd100sr.bill .pts,.wd100sr.bill .c-ev{display:none}.wd100sr.iv{grid-template-columns:44px minmax(0,1fr) minmax(0,1.3fr)}.wd100sr.iv .c-ev{display:none}
 .wd100map .mtools{max-width:none;left:4px;right:4px;justify-content:flex-start;top:4px}.wd100chip{font-size:11.5px;padding:1px 7px;min-height:22px}.wd100all{width:104px;height:58px}.wd100all b{font-size:17px}
 .wd100sr{grid-template-columns:44px minmax(0,1fr) minmax(0,1fr) 44px;gap:7px;padding:0 7px}.wd100sr .c-ev,.wd100sr .pl2{display:none}.wd100sr.now .pl2{display:none}
 .wd100plq small{display:none}.wd100prz{font-size:12.5px;white-space:normal;padding:4px 10px}
}
body.calm .wd100wk.now,body.idle92 .wd100wk.now{transform:none}
@media (prefers-reduced-motion:reduce){.wd100wk.now{transform:none}}
`;document.head.appendChild(st)}
