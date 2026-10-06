/* =====================================================================
   185-v90week · v0.90 part A3 — MATCH WEEK TIDY, WALK THE SAND AT THE ARENA GATE, THE LEAGUE'S STAKES, THE PEN CAMERA
   (Virgilante 2026-10-06, Manager mode)
   1 · MATCH WEEK TIDY (nightHTML wrapper, on the string through a <template> so every data-mg handler keeps working):
       • the 🏛 Temple card (TEMPLE76, [data-god76]) is gone — offerings are made only at the Temple in the City Center forum
         (172 cityTemplePanel89 / 181 Temple tab; same TEMPLE76 gods, prices and boostFor rewards);
       • 🗺 Walk the sand (data-mg="scoutarena", the Road-box tile of 145 and the walked-sand report card) is gone;
       • 🏙 Walk the city square wears a thumbnail of THAT city's forum (city90Thumb: the 172 forum baked off screen into a
         small canvas → JPEG data URL, cached per city in memory; built a moment after the tab draws) + one line saying
         the temple and the arena gate's walk are there;
       • a one-line league stake: "N points to the next prize — 3rd place (+50)" (lp90NextHTML).
   2 · WALK THE SAND AT THE ARENA GATE: the square's 🏟 Arena tab (181 cbar89Body wrapper) and the floating arena panel
       (cityShopPanel('arena') wrapper, sidebar folded) offer "🗺 Walk the sand" — only in the city of this week's games:
       2 training hours (thPlan(w).spent) + walkFee() coin (6, 3 on home sand) → every fighter of yours on this week's card
       arrives with +1 AP and +1 coin (17 seatFor reads n.scouted); once a week. After the walk the tab shows the report
       (sky, omen, the crowd's temper, a tip). The ludus to-do line (ludusTodos) points at the City Square; the Manager guide
       line (11-extra) says where the walk is now.
   3 · THE LEAGUE TAB (leagueHTML wrapper):
       (a) STAKES PER POSITION: a "🏆 Season stakes" table — what each finishing place earns at season's end: the League
           prize LP90 (new: 1st 120 coin + 5 fame, 2nd 80, 3rd 50, 4th 25, 5th–6th 10, below nothing; every house, paid once
           when week 12 closes — qsClose wrapper), the Flavius Superbus invitation for the top four (existing), and the
           Quaestor's league-finish line (existing: 4 coin a place below you, paid with the Ledger). Your place is lit.
           The next-prize line also sits on Match Week and under the weekly checklist's heading (checklistHTML wrapper).
       (b) SCOUT FROM THE TABLE: clicking a rival house's row opens its scouting card under the row (MGR.lg90): every fighter
           (portrait, class, rating band ★ + public rating — exact once scouted, record, last five, wounds) and who it fields
           this week; buttons 🏛 Team screen (the old row click) and ⚔ Challenge — the rival-letter challenge of 108
           (w.chal76: meet one of theirs in any bout this week, the winner's house takes the purse twice; dodging costs fame)
           while they field someone this week and no challenge is set; +3 rivalry. Your own row keeps opening your Lanista page.
   4 · THE PEN CAMERA: a Manager beast-pen fight (S.pen76) or an exhibition (S.exhib) starts zoomed in (S.zoomIn, the 🔍 button
       still pulls back): the pen eases to ×1.8 on the pen's centre (camFocus wrapper), an exhibition to the free zoom (×1.4)
       following the action.
   UI only — never the seeded dice (the walk's tip uses Math.random).
   Test: tools/tests/tv90k.js
   ===================================================================== */

/* ---------------- 3a · the league's stakes ---------------- */
/* LP90 — the League prize by finishing place (index 0 = 1st). TWEAK: in line with ECON (fees 12/24/40 a week, purses 30/70/150). */
const LP90=[{c:120,f:5},{c:80},{c:50},{c:25},{c:10},{c:10}];
const lp90Prize=pos=>LP90[pos-1]||null;
const lp90Coin=pos=>(lp90Prize(pos)||{c:0}).c;
const lp90Ord=n=>n+(n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th');
function lp90Txt(pos){const P=lp90Prize(pos);if(!P)return '';return `${coinAmt87('+'+P.c)}${P.f?_T`, +${P.f} fame`:''}`}
/* lp90Next — where you stand and what the next better-paid place takes */
function lp90Next(){const w=W_(),pm=me();if(!w||!pm||w.tutorial)return null;const L=leagueSort(w.mgrs);const pos=L.indexOf(pm)+1;if(!pos)return null;
  const mine=msp(pm).pts;const cur=lp90Coin(pos);
  if(pos===1)return {pos,top:1,txt:_T`🏆 <b>Top of the table</b> — finish 1st for ${lp90Txt(1)} and the Superbus.`};
  let t=pos-1;while(t>1&&lp90Coin(t)<=cur)t--;if(lp90Coin(t)<=cur)return null;
  const need=Math.max(1,msp(L[t-1]).pts-mine+1);
  return {pos,t,need,txt:_T`📊 <b>${need} point${need===1?'':'s'}</b> to the next prize — ${lp90Ord(t)} place (${lp90Txt(t)}${t<=4&&pos>4?_T(' + the Superbus'):''}) · you are ${lp90Ord(pos)}.`}}
function lp90NextHTML(cls){try{const N=lp90Next();return N?`<div class="lp90next ${cls||''}">${N.txt}</div>`:''}catch(e){return ''}}
function lp90StakesHTML(){const w=W_(),pm=me();const L=leagueSort(w.mgrs);const n=L.length;const pos=L.indexOf(pm)+1;const top4=new Set(leagueSort(w.mgrs.filter(m2=>!m2.sica)).slice(0,4).map(m2=>m2.id));
  const row=(p,lab,m)=>{const P=lp90Prize(p);const q=Math.max(0,(n-p))*4;
    return `<tr class="${p===pos&&!lab?'me':''}"><td class="n"><b>${lab||lp90Ord(p)}</b></td><td>${P?`<b>${lp90Txt(p)}</b>`:'<span class="rc-sub">—</span>'}</td><td>${p<=4?_T('🏛 Superbus invitation'):'<span class="rc-sub">—</span>'}</td><td class="n">${lab?`<span class="rc-sub">${coinAmt87('+'+q)} … ${coinAmt87('+0')}</span>`:q?coinAmt87('+'+q):'<span class="rc-sub">—</span>'}</td><td class="rc-sub">${p===pos&&!lab?_T('◀ you'):lab?'':esc(m.ludus)}</td></tr>`};
  const K=LP90.length;let rows=L.slice(0,K).map((m,i)=>row(i+1,'',m)).join('');
  if(n>K){if(pos>K)rows+=row(pos,'',pm);const rest=n-K-(pos>K?1:0);if(rest>0)rows+=row(K+1,pos>K?_T`the other ${rest}`:`${lp90Ord(K+1)}–${lp90Ord(n)}`,null)}
  return `<details class="card2 lp90" open><summary>${_T`<b>🏆 Season stakes</b>`} <span class="rc-sub">${_T`what each place earns when week 12 ends`}</span></summary>
    ${lp90NextHTML('in')}
    <table class="tally compact lp90t"><tr><th>${_T`Place`}</th><th title="${_T`Paid into the treasury when the season's last week ends — the same for every house`}">${_T`League prize`}</th><th>${_T`Invitation`}</th><th title="${_T`The Quaestor's Ledger pays 4 coin for each place below you, early next season`}">${_T`Quaestor`}</th><th>${_T`Now`}</th></tr>${rows}</table></details>`}
/* pay the League prize once, as the season's last week closes (every house; the player's line in the news) */
{const base=qsClose;qsClose=function(w,pm){const r=base.apply(this,arguments);try{if(w&&w.lp90!==w.season&&!w.tutorial){w.lp90=w.season;const L=leagueSort(w.mgrs,w.season);
    L.forEach((m,i)=>{const P=lp90Prize(i+1);if(!P||m.dead)return;m.coin=(m.coin||0)+P.c;if(P.f)m.fame=clamp((m.fame||0)+P.f,0,100);
      if(m.isPlayer)tnews(_T`🏆 <b>League prize</b> for finishing ${lp90Ord(i+1)}: ${lp90Txt(i+1)}.`,'big')})}}catch(e){console.error(e)}return r}}

/* ---------------- 3b · scout a rival house from the table ---------------- */
function lg90Fields(R){const w=W_();const n=w.night;if(!n||n.bye||!n.bouts)return [];const out=[];
  n.bouts.forEach(b=>{for(const id of b.ents||[]){const g=gById(id);if(g&&g.contract&&g.contract.mgr===R.id)out.push({g,b})}});return out}
function lg90ChalWhy(R){const w=W_();const n=w.night;const C=w.chal76;
  if(!n||n.bye||!n.bouts||n.bouts.every(b=>b.done))return _T('No games left this week.');
  if(C&&C.s===w.season&&C.wk===w.week)return C.mgr===R.id?_T('Challenge set for this week.'):_T('You already have a challenge this week.');
  if(!lg90Fields(R).some(x=>!x.b.done))return _T`${R.ludus} fields nobody this week.`;return ''}
function lg90HTML(R){const w=W_();const ros=rosterOf(R).sort((a,b)=>effOvr(b)-effOvr(a));const sp=msp(R);const fl=lg90Fields(R);const on=new Map(fl.map(x=>[x.g.id,x.b]));
  const form=g=>(g.recent||[]).slice(-5).map(x=>`<span class="fchip ${x.won?'w':x.place===2?'p':''}" title="${esc(`${x.ev||''} · ${x.loc||''}`)}">${x.won?'W':x.place||'·'}</span>`).join('')||'<span class="rc-sub">—</span>';
  const rows=ros.map(g=>{const b=on.get(g.id);const sc=g.scout;const o=sc?effOvr(g):pubOvr(g);
    return `<tr><td>${gArt(g,'xs')}</td><td><b>${esc(g.name)}</b> <span class="rc-sub">${CLASSES[g.cls]?esc(CLASSES[g.cls].name):''}</span>${g.inj?` <span title="${esc(g.inj.label||'')}">🩹</span>`:''}</td><td class="n"><span class="stars">${'★'.repeat(starsOf(o))}</span> <span class="rc-sub">${sc?o:'~'+o}</span></td><td class="n">${(g.rec&&g.rec.w)||0}-${Math.max(0,((g.rec&&g.rec.ev)||0)-((g.rec&&g.rec.w)||0))}</td><td class="nowrap">${form(g)}</td><td>${b?`<span class="badge gold">⚔ ${esc(TIERS[b.tier].n)}</span>`:''}</td></tr>`}).join('');
  const why=lg90ChalWhy(R);const set=w.chal76&&w.chal76.s===w.season&&w.chal76.wk===w.week&&w.chal76.mgr===R.id;
  return `<div class="lg90" data-lg90box="${R.id}"><div class="lg90h"><b style="color:${R.color}">🔍 ${esc(R.ludus)}</b> <span class="rc-sub">${_T`${esc(R.name)} · ${sp.pts} pts · season ${sp.w}-${Math.max(0,sp.b-sp.w)} · fame ${R.fame}`}</span></div>
    <div class="lg90week">${fl.length?_T`This week: ${fl.map(x=>`<b>${esc(x.g.name)}</b> <span class="rc-sub">(${esc(TIERS[x.b.tier].n)}${x.b.done?_T(' · fought'):''})</span>`).join(' · ')}`:_T('This week: nobody on the card.')}</div>
    ${ros.length?`<table class="tally compact lg90r"><tr><th></th><th>${_T`Fighter`}</th><th title="${_T`Public rating band — exact once your scouts have seen them`}">${_T`Rating`}</th><th>${_T`Record`}</th><th>${_T`Last five`}</th><th>${_T`This week`}</th></tr>${rows}</table>`:`<p class="rc-sub">${_T`No fighters under contract.`}</p>`}
    <div class="acts" style="margin-top:6px"><button class="btn tksm" type="button" data-mg="team" data-id="${R.id}">${_T`🏛 Team screen`}</button>
    <button class="btn tksm" type="button" data-lg90ch="${R.id}" ${why?_T`disabled title="${esc(why)}"`:''}>${set?_T('⚔ Challenge set'):_T`⚔ Challenge<small>this week · winner takes the purse twice</small>`}</button>${why&&!set?`<span class="rc-sub">${esc(why)}</span>`:''}</div></div>`}
{const base=leagueHTML;leagueHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||!me())return h;
    const id=MGR.lg90;const R=id&&mgrById(id);if(R&&!R.isPlayer){const k=h.indexOf(`data-mg="team" data-id="${id}"`);const e=k>=0?h.indexOf('</tr>',k):-1;
      if(e>=0){h=h.slice(0,e+5)+`<tr class="lg90row"><td colspan="14">${lg90HTML(R)}</td></tr>`+h.slice(e+5);h=h.replace(`lrowlink" data-mg="team" data-id="${id}"`,_T`lrowlink lg90on" data-mg="team" data-id="${id}"`)}}
    h=lp90StakesHTML()+h}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
  const ch=t.closest('#mgrBody [data-lg90ch]');if(ch){e.preventDefault();e.stopPropagation();if(ch.disabled)return;const w=W_();const R=mgrById(ch.dataset.lg90ch);if(!w||!R||lg90ChalWhy(R))return;
    w.chal76={mgr:R.id,s:w.season,wk:w.week,met:0};R.rivalry=Math.min(100,(R.rivalry||0)+3);tnews(_T`⚔ You challenge ${esc(R.ludus)}: meet one of their fighters in a bout this week — the winner's house takes the purse twice.`,'big');
    saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  const row=t.closest('#mgrBody tr.lrowlink[data-mg="team"]');if(!row||row.classList.contains('me')||t.closest('.lg90row')||MGR.tab!=='league')return;
  e.preventDefault();e.stopPropagation();const id=row.dataset.id;MGR.lg90=MGR.lg90===id?null:id;if(typeof MGR_REDRAW==='function')MGR_REDRAW();
  setTimeout(()=>{const b=document.querySelector(`#mgrBody [data-lg90box="${id}"]`);if(b)b.scrollIntoView({block:'nearest'})},30)},true);

/* ---------------- 1 · Match Week: no temple, no walk; the square wears its forum ---------------- */
const C90T={};/* city name → thumbnail data URL ('' = could not draw) */
/* city90Render — the 172 forum baked off screen at a small size, the live square's bake put back afterwards */
function city90Render(li){const L=LOCATIONS[li];if(!L||CITY.open||typeof bake89!=='function')return null;
  const KC=['L','TW','OX','OY','W','H','dpr','balc89','bake89ms'];const keepC={};for(const k of KC)keepC[k]=CITY[k];const keepB={...CB89};
  try{const W=560,H=300;CITY.L=L;CITY.W=W;CITY.H=H;CITY.dpr=1;const Hb=H-Math.max(3,H*0.01);const TW=Math.max(14,Math.min(W/(N89+0.3),(Hb-H*0.1)*4/(2*N89-1)));
    CITY.TW=TW;CITY.OX=W/2-TW*0.35;CITY.OY=Hb-(2*N89-1)*TW/4;CB89.key=null;const K=bake89();
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.drawImage(K.bg,0,0,W,H);
    if(K.arena)g.drawImage(K.arena.cv,K.arena.x,K.arena.y,K.arena.w,K.arena.h);
    for(const B of B89.slice().sort((a,b)=>(a.r1+a.c1)-(b.r1+b.c1))){const S2=K.sprites[B.k];if(!S2)continue;g.drawImage(S2.cv,S2.x,S2.y,S2.w,S2.h);const F=K.sprites[B.k+'F'];if(F)g.drawImage(F.cv,F.x,F.y,F.w,F.h)}
    g.drawImage(K.fg,0,0,W,H);return cv.toDataURL('image/jpeg',0.72)}
  catch(e){console.error(e);return ''}
  finally{for(const k of KC)CITY[k]=keepC[k];for(const k of Object.keys(CB89))delete CB89[k];Object.assign(CB89,keepB)}}
function city90Thumb(li){const L=LOCATIONS[li];if(!L)return '';if(C90T[L.n]!=null)return C90T[L.n];const u=city90Render(li);if(u==null)return '';C90T[L.n]=u;return u}
function city90Apply(){const w=W_();const n=w&&w.night;if(!n)return;const L=LOCATIONS[n.loc];if(!L)return;const u=C90T[L.n]!=null?C90T[L.n]:city90Thumb(n.loc);if(!u)return;
  document.querySelectorAll('#mgrBody [data-mg="city"].city90').forEach(b=>{if(!b.style.backgroundImage)b.style.backgroundImage=`linear-gradient(90deg,rgba(18,10,4,.88),rgba(18,10,4,.42) 70%,rgba(18,10,4,.2)),url(${u})`})}
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string')return h;const w=W_();
    const T=document.createElement('template');T.innerHTML=h;const Q=s=>[...T.content.querySelectorAll(s)];
    for(const b of Q('[data-god76]')){const c=b.closest('.tmp76');if(c)c.remove()}
    for(const b of Q('[data-mg="scoutarena"]')){const c=b.closest('.road85t')||b.closest('.card2');if(c&&!c.classList.contains('travelcard'))c.remove();else b.remove()}
    for(const c of Q('.card2')){const s=c.querySelector(':scope > .sect');if(s&&/^🗺/.test(s.textContent.trim())&&c.querySelector('.chron'))c.remove()}
    for(const s of Q('.road85side'))if(!s.children.length)s.remove();
    const cb=T.content.querySelector('[data-mg="city"]');
    if(cb){cb.classList.add('city90');const n=w&&w.night;const L=n&&LOCATIONS[n.loc];if(L&&C90T[L.n])cb.style.backgroundImage=`linear-gradient(90deg,rgba(18,10,4,.88),rgba(18,10,4,.42) 70%,rgba(18,10,4,.2)),url(${C90T[L.n]})`;
      const note=document.createElement('div');note.className='city90n rc-sub';note.innerHTML=_T`🏛 the temple · 🗺 walk the sand at the arena gate${n&&n.scouted?_T(' <b>(walked ✓)</b>'):''}`;cb.insertAdjacentElement('afterend',note)}
    let out=T.innerHTML;const nx=lp90NextHTML('mw');if(nx&&w&&w.night&&!w.night.bye)out=nx+out;
    setTimeout(city90Apply,60);return out}catch(e){console.error(e);return h}}}
/* the ludus to-do line about the walk points at the square */
{const base=ludusTodos;ludusTodos=function(){const T=base.apply(this,arguments);try{const w=W_();const n=w&&w.night;for(const it of T||[]){if(it&&it[0]==='🗺'&&n){
    it[1]=_T`Walk the sand at the arena gate in ${esc(LOCATIONS[n.loc].n)}'s City Square — your fighters on this week's card arrive with +1 AP and ${coinAmt87('+1')}.`;
    it[2]=`<button class="btn" type="button" data-mg="city" style="padding:2px 8px">${_T`🏙 City Square`}</button>`}}}catch(e){}return T}}
/* the weekly checklist: the league stake under its heading */
{const base=checklistHTML;checklistHTML=function(){const h=base.apply(this,arguments);try{const nx=lp90NextHTML('ck');if(!nx)return h;const i=h.indexOf('</div>',h.indexOf('class="sect"'));return i>0?h.slice(0,i+6)+nx+h.slice(i+6):h}catch(e){return h}}}

/* ---------------- 2 · walk the sand at the arena gate ---------------- */
function wsand90Night(){const w=CITY.w||W_();const n=w&&w.night;if(!CITY.mgr||!n||n.loc!==CITY.li||n.bye||n.selfBye||!n.bouts||n.bouts.every(b=>b.done))return null;return n}
function wsand90Why(){const w=W_(),m=me();const n=wsand90Night();if(!n)return _T('No games of yours here this week.');if(n.scouted)return _T('Walked this week.');
  if((typeof thLeft==='function'?thLeft(w):99)<2)return _T('Needs 2 training hours.');if(m.coin<walkFee())return _T('Not enough coin.');return ''}
function wsand90HTML(){if(!CITY.mgr)return '';const n=wsand90Night();if(!n)return '';const L2=LOCATIONS[n.loc];
  if(n.scouted){const S2=n.scouted;return `<div data-cbar89sec="walk" class="wsand90"><div class="sect">${_T`🗺 The sand is walked`}</div><div class="card2"><p style="margin:0">${_T`Your fighters on the card take the sand with <b>+1 AP and ${coinAmt87('+1')}</b>.`}</p>
    <p class="rc-sub" style="margin:4px 0 0">${_T`Sky: <b>${esc(S2.wx||_T('fair skies'))}</b> · omen: <b>${esc(n.omen?n.omen.n:'—')}</b> · the crowd: <b>${esc(S2.temper||'')}</b>`}</p>${S2.tip?`<p class="rc-sub" style="margin:4px 0 0">${esc(S2.tip)}</p>`:''}</div></div>`}
  const why=wsand90Why();const fee=walkFee();
  return `<div data-cbar89sec="walk" class="wsand90"><div class="sect">${_T`🗺 Walk the sand`}</div><div class="card2"><p style="margin:0">${_T`Pace ${esc(L2.n)}'s sand with your doctores before the games: every fighter of yours on this week's card arrives with <b>+1 AP and ${coinAmt87('+1')}</b>. Once a week.`}</p>
    <div class="acts" style="margin-top:6px"><button class="btn primary tksm" type="button" data-wsand90="1" ${why?_T`disabled title="${esc(why)}"`:''}>${_T`🗺 Walk the sand<small>2 training hours · ${coinAmt87(fee)}${fee<6?_T(' · 🏠 home sand'):''}</small>`}</button>${why?`<span class="rc-sub">${esc(why)}</span>`:''}</div></div></div>`}
/* wsand90Walk — the walk itself (17's scoutarena rule; the hours are training hours now) */
function wsand90Walk(){if(wsand90Why())return false;const w=W_(),m=me();const n=w.night;const fee=walkFee();const L2=LOCATIONS[n.loc];const LC=(typeof LOC_CROWD!=='undefined'&&LOC_CROWD[n.loc])||{n:_T('an ordinary crowd')};
  const P=thPlan(w);P.spent=(P.spent||0)+2;m.coin-=fee;const fx=n.fx||{};const special=!/democritus|egidious|cassian/.test(fx.ev||'democritus');
  const tips=[_T('The sand is packed hard on the east side — pillars topple toward the tunnels.'),_T('The upper tiers are nearest the Q1 stands: play to them and the cheers come cheap.'),_T('The ushers here let troublemakers in; expect stones.'),_T('The local beasts are underfed this week — the bears go for the first man they see.'),_T('The editor here rewards a long fight; do not rush the killing.')];
  n.scouted={wx:n.wx,att:n.wAtt||0,world:n.world||[],temper:LC.n||_T('an ordinary crowd'),special,tip:tips[Math.floor(Math.random()*tips.length)]};
  tnews(_T`🗺 Walked the sand at ${esc(L2.n)} (2 training hours, ${coinAmt87(fee)}): +1 AP, ${coinAmt87('+1')} for every fighter you enter.`);saveWorld();
  try{log2city(_T('🗺 Your doctores pace the sand: +1 AP and +1 coin for your fighters.'))}catch(e){}return true}
{const base=cbar89Body;cbar89Body=function(){const r=base.apply(this,arguments);try{if(CITY.side==='arena'){const el=document.getElementById('citySideBody');const h=wsand90HTML();
    if(el&&h&&!el.querySelector('.wsand90')){const g=el.querySelector('#cbar89Gate');if(g)g.insertAdjacentHTML('beforebegin',h);else el.insertAdjacentHTML('afterbegin',h)}}}catch(e){console.error(e)}return r}}
{const base=cityShopPanel;cityShopPanel=function(key){const r=base.apply(this,arguments);try{if(key==='arena'){const p=document.getElementById('cityPanel');const h=wsand90HTML();
    if(p&&!p.hidden&&h&&!p.querySelector('.wsand90'))p.insertAdjacentHTML('beforeend',h)}}catch(e){console.error(e)}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#citySide [data-wsand90],#cityPanel [data-wsand90]');if(!b||!CITY.open)return;e.preventDefault();e.stopPropagation();if(b.disabled)return;
  if(!wsand90Walk())return;const inPanel=!!b.closest('#cityPanel');
  if(inPanel){const box=b.closest('.wsand90');if(box)box.outerHTML=wsand90HTML()}else if(typeof cbar89Refresh==='function')cbar89Refresh(['arena'])},true);

/* ---------------- 4 · the pen camera ---------------- */
const PEN90={z:1.8,c:[5.5,5.5]};
{const base=newState;newState=function(config){const r=base.apply(this,arguments);try{if(S&&config&&(config.pen76||config.exhibCtx)&&!config.sim){S.zoomIn=true;S.zoom90=config.pen76?'pen':'exhib'}}catch(e){}return r}}
{const base=duelCam;duelCam=function(){const z=base.apply(this,arguments);try{if(S&&S.pen76&&S.zoomIn&&!CAM.z&&!duelZoneOn()&&z>1)return 1+(z-1)*(PEN90.z-1)/(FREE_ZOOM-1)}catch(e){}return z}}
{const base=camFocus;camFocus=function(Wd,Hd){try{if(S&&S.pen76&&!S.over)return {r:PEN90.c[0],c:PEN90.c[1],x:Wd/2,y:Hd*0.52}}catch(e){}return base.apply(this,arguments)}}

(()=>{const st=document.createElement('style');st.textContent=`
#mgrBody .btn.city90{background-size:cover;background-position:center 64%;color:#fff4dc;text-shadow:0 1px 3px #000,0 0 2px #000;min-height:78px;border-color:#c9a458;text-align:left;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start}
#mgrBody .btn.city90 small{color:#f2e2bf}
.city90n{font-size:12px;margin-top:4px}
.lp90next{font-size:13px;padding:4px 10px;margin:0 0 8px;border:1px solid rgba(201,164,88,.45);border-radius:6px;background:rgba(201,164,88,.08)}
.lp90next.in{margin:6px 0}.lp90next.ck{margin:4px 0 6px;font-size:12.5px}
.lp90{margin-bottom:10px}.lp90t td,.lp90t th{padding:3px 8px}.lp90t tr.me td{background:rgba(201,164,88,.14)}
tr.lg90on td{background:rgba(201,164,88,.10)}
tr.lg90row>td{padding:0 6px 10px!important;background:rgba(0,0,0,.18)}
.lg90{position:sticky;left:4px;width:max-content;max-width:min(920px,calc(100vw - 48px));box-sizing:border-box;border:1px solid rgba(201,164,88,.5);border-radius:8px;padding:8px 10px;background:rgba(20,14,8,.5)}
.lg90h{font-size:15px;margin-bottom:4px}.lg90week{font-size:13px;margin-bottom:6px}.lg90r td{padding:2px 6px}
.lg90 .btn small{display:block;font-size:11px;opacity:.85}
.wsand90 .card2{border-color:#c9a458}
@media (max-width:600px){#mgrBody .btn.city90{min-height:64px}.lg90r{font-size:12px}.lg90{overflow-x:auto}.lg90r th:nth-child(5),.lg90r td:nth-child(5){display:none}.lp90t th:nth-child(5),.lp90t td:nth-child(5){display:none}.lp90t{font-size:12px}.lp90t td,.lp90t th{padding:3px 4px}}`;document.head.appendChild(st)})();
