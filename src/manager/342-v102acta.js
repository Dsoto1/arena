/* =====================================================================
   342-v102acta · v1.02 workstream K (his picks 1b 2a 3a 4a + 1c 2c 3a 4a 5a, 2026-10-14) — THE ACTA DIURNA RESTYLED
   mock: tools/plans/mock102/acta.html · notes: tools/plans/mock102/NOTES-acta.md
   =====================================================================
   ONE PAGE (1b): masthead (◀ ▶ editions · ACTA DIURNA · price + omen) → stats strip (only the non-zero numbers) → lead story
   (sepia engraving · kicker · headline · deck · two ink-ruled columns with a drop cap · fact box) → three columns: Your House ·
   The Arena + In Memoriam · The Empire (map inset, numbered pins) → the fun row (Darwinius · Rabble-rousers (284) · Overheard ·
   In brief) + the Classifieds corner (Swords for hire top 3 → each name opens the free agent's dossier, Scout ▸ the Free agents
   list; the League top 2 + your place → League ▸; the Sand's finest top 5) → the Next week ribbon (information only — the
   ▶ Start next week button is gone: the week has already turned when the paper prints, his call).
   LEAD (2a): your house's biggest moment when anything happened to it — a title (season), one of your fighters fell, an UPSET
   win (the field's favourite rated ≥ ACTA102.upset above him), a Main event win, a big signing (rated B or better), any other
   win — else today's league/empire lead (composeWeekPaper's own scoring). A loss alone is not a moment. The replaced league lead
   moves to P.also. Engraving (4a) = the fighter's own portrait (gArt → face99) through a sepia + hatch filter.
   EDITIONS (3a): w.acta102 = the last ACTA102.keep (12) editions, TRIMMED (plain text with <b>/<i>, ids, short lists — ~3–4 KB
   each). No migration: an old world starts from its lastPaper (trimmed on first view). ◀ ▶ / "Back to this week" browse them
   (MGR.ak102 = the index shown); an old edition is the same page read-only, its ribbon "As printed then".
   Your House on a week you did not fight (2c): "<ludus> did not fight this week" + the yard line.
   Every data piece of composeWeekPaper is kept (lead/also/numbers/empire/briefs/standings/best/agents/obits/next/training/quote/
   darwin + 284's rabble); P.k102 adds the house/arena rows and P._k102 the edition key. 290/317's News/Acta read lastPaper as before;
   the Ludus Archives (w.papers) still open old papers through paperHTML (no pager there).
   Opens after End the week as today (5a). Phones: one column. No animation (Reduce motion needs nothing).
   Kill switch: localStorage flavius_v102koff=1 (nothing installed — 17/284's paper exactly). Test: tools/tests/tv102k.js
   ===================================================================== */
const ACTA102={on:true,keep:12,upset:8,bigSign:70};
try{ACTA102.on=localStorage.getItem('flavius_v102koff')!=='1'}catch(e){ACTA102.on=true}
if(ACTA102.on){
/* plain text with only <b>/<i> kept */
function ak102Txt(h){return String(h==null?'':h).replace(/<(?!\/?(b|i)>)[^>]*>/g,'').replace(/\s+/g,' ').trim()}
function ak102Mine(g,pm){return !!(g&&pm&&g.contract&&g.contract.mgr===pm.id)}
function ak102Res(b,gid){const r=b&&b.res&&b.res.rows?b.res.rows.find(x=>x.gid===gid):null;return r}
function ak102Coin(b,gid){try{const H=b.res&&b.res.house101;if(H&&H.by&&H.by[gid]!=null)return H.by[gid]}catch(e){}const r=ak102Res(b,gid);return r&&r.won?b.purse||0:0}
function ak102Place(p){return p?(['','1st','2nd','3rd'][p]||p+'th'):''}

/* the week's extra facts the new page needs (house rows, the rest of the card, lead candidates) */
function ak102Facts(world,night,P){const pm=me();const bouts=(night&&night.bouts||[]).filter(b=>b.done&&b.res);const wk=P.wk;
  const loc=P.locN||'';const house={ludus:pm.ludus,rows:[],signed:[],yard:(P.training||[]).slice(0,2).map(ak102Txt),fought:false,bye:!!(night&&night.bye)};
  const arena=[];const cand=[];
  for(const b of bouts){const T=TIERS[b.tier]||{n:b.tier};const ev=EVENTS[b.ev]?EVENTS[b.ev].n:'';
    const ents=(b.ents||[]).map(gById).filter(Boolean);const winId=b.res.winners&&b.res.winners[0];const win=gById(winId);
    for(const g of ents.filter(g=>ak102Mine(g,pm))){house.fought=true;const r=ak102Res(b,g.id)||{};const coin=ak102Coin(b,g.id);
      const t=r.won?_T`<b>${esc(g.name)}</b> won the ${T.n} (${ev}), ${r.f||0} CF`:r.place?_T`<b>${esc(g.name)}</b> ${ak102Place(r.place)} in the ${T.n} (${ev})`:_T`<b>${esc(g.name)}</b> fought in the ${T.n} (${ev})`;
      house.rows.push({gid:g.id,n:g.name,t:ak102Txt(t),res:r.won?'w':'l',m:coin});
      if(r.won){const fav=ents.filter(x=>x.id!==g.id).sort((a,c)=>pubOvr(c)-pubOvr(a))[0];const mine=pubOvr(g),fo=fav?pubOvr(fav):0;
        if(fav&&fo-mine>=ACTA102.upset)cand.push({rank:3,kind:'upset',g,b,fav,mine,fo,ev,T,r});
        else if(b.tier==='main')cand.push({rank:4,kind:'main',g,b,ev,T,r});
        else cand.push({rank:6,kind:'win',g,b,ev,T,r,sc:b.purse||0})}}
    if(win&&!ak102Mine(win,pm)){const L=win.contract&&mgrById(win.contract.mgr);const r=ak102Res(b,win.id)||{};
      arena.push({gid:win.id,n:win.name,t:ak102Txt(_T`<b>${esc(win.name)}</b> (${L?esc(L.ludus):_T('free sword')}) took the ${T.n}, ${ev}, ${r.f||0} CF`),res:'w',m:b.purse||0})}}
  for(const g of world.glads)if(ak102Mine(g,pm)&&g.contract.since===wk&&g.alive){const o=pubOvr(g);house.signed.push({gid:g.id,n:g.name,t:ak102Txt(_T`<b>${esc(g.name)}</b> signed — ${g.contract.weeks} weeks at ${g.contract.wage} a week`)});
    if(o>=ACTA102.bigSign)cand.push({rank:5,kind:'sign',g,o})}
  for(const d of world.grave.filter(x=>x.wk===wk&&x.mgr===pm.name))cand.push({rank:2,kind:'death',d,sc:(d.fame||0)*2+(d.ovr||0)});
  const rv=world.review;if(rv&&rv.wk===wk){house.coin=rv.coin;house.coinD=rv.coinD}else house.coin=pm.coin;
  cand.sort((a,c)=>(a.rank-c.rank)||((c.sc||0)-(a.sc||0)));return {house,arena,cand,loc}}

/* the house lead (2a) */
function ak102HouseLead(world,P,F){const pm=me();const L0=P.lead||{};const loc=F.loc;
  if(world.week>1&&((P.wk%12)===0)&&L0.h&&pm&&L0.h.indexOf(String(pm.ludus).toUpperCase())===0)return Object.assign({},L0,{kind:'title',house:1,kicker:_T('Your house · the season')});
  const c=F.cand[0];if(!c)return null;const lu=esc(pm.ludus);
  if(c.kind==='death'){const d=c.d;return {kind:'death',house:1,h:_T`${String(d.name).toUpperCase()} FALLS AT ${String(loc).toUpperCase()}`,gids:[],gid:(world.glads.find(g=>g.name===d.name)||{}).id||null,
    kicker:_T('Your house · in memoriam'),deck:_T`${esc(d.name)} of ${lu} died this week — ${esc(d.fate||_T('the crowd turned its thumb'))}.`,
    body:_T`The sand keeps what it is given. <b>${esc(d.name)}</b>, ${CLASSES[d.cls]?CLASSES[d.cls].name:d.cls}${d.ovr!=null?_T`, rated ${d.ovr}`:''}${d.fame?_T`, fame ${d.fame}`:''}, fought for ${lu} for the last time this week. The record left behind: ${d.rec.ev} bouts, ${d.rec.w} wins, ${d.rec.kp} kills. The house drapes its gate in black.`,
    facts:[[_T('Fate'),esc(d.fate||'')],[_T('Record'),_T`${d.rec.ev} bouts · ${d.rec.w} wins`]]}}
  if(c.kind==='sign'){const g=c.g;return {kind:'sign',house:1,gid:g.id,gids:[g.id],h:_T`${String(pm.ludus).toUpperCase()} SIGNS ${String(g.name).toUpperCase()}`,kicker:_T('Your house · a signing'),
    deck:_T`${esc(g.name)}, ${CLASSES[g.cls]?CLASSES[g.cls].name:g.cls} of ${esc(g.city||'')}, joins ${lu} for ${g.contract.weeks} weeks.`,
    body:_T`The criers had it by noon: <b>${esc(g.name)}</b> has put his mark on a contract with ${lu} at ${g.contract.wage} a week. The touts rate him ${trait96Grade(c.o)} and expect to see him on a card before long. Rival lanistae are said to be counting what they offered.`,
    facts:[[_T('Grade'),trait96Grade(c.o)],[_T('Wage'),_T`${g.contract.wage} a week`],[_T('Contract'),_T`${g.contract.weeks} weeks`]]}}
  const g=c.g,b=c.b,r=c.r||{};const purse=ak102Coin(b,g.id)||b.purse||0;const facts=[[_T('Purse'),coinAmt87(purse)],[_T('Crowd Favor'),String(r.f||0)]];
  if(b.res.turns)facts.push([_T('Turns'),String(b.res.turns)]);
  const body=_T`Before a full house at ${esc(loc)}, <b>${esc(g.name)}</b> of ${lu} took the ${esc(c.ev)} with ${r.f||0} Crowd Favor${b.res.turns?_T` after ${b.res.turns} turns`:''}. The purse of ${coinAmt87(purse)} goes to the house.`;
  if(c.kind==='upset'){facts.unshift([_T('Upset'),_T`rated ${c.mine} beat ${c.fo}`]);
    return {kind:'upset',house:1,gid:g.id,gids:[g.id],ev:b.ev,h:_T`${String(g.name).toUpperCase()} FELLS THE FAVOURITE AT ${String(loc).toUpperCase()}`,kicker:_T`${c.T.n} at ${esc(loc)} · your house`,
      deck:_T`Rated ${c.mine}, ${esc(g.name)} beat a field led by ${esc(c.fav.name)} (${c.fo}) in the ${esc(c.ev)}.`,
      body:body+' '+_T`Nobody in the upper tiers had money on him. ${esc(c.fav.name)} will not hear the end of it.`,facts}}
  return {kind:c.kind,house:1,gid:g.id,gids:[g.id],ev:b.ev,h:c.kind==='main'?_T`${String(g.name).toUpperCase()} TAKES THE MAIN EVENT`:_T`${String(g.name).toUpperCase()} WINS THE ${String(c.T.n).toUpperCase()}`,
    kicker:_T`${c.T.n} at ${esc(loc)} · your house`,deck:'',body,facts}}

/* trim a paper into a stored edition (also used for old papers without P.k102) */
function ak102Trim(P){const K=P.k102||{};const L=P.lead||{};const pm=me();
  const kickers={win:_T('The league · the card'),death:_T('In memoriam'),empire:_T('The empire'),title:_T('The season')};
  const lead={h:ak102Txt(L.h),deck:ak102Txt(L.deck||''),body:ak102Txt(L.body),kind:L.kind||'',house:L.house?1:0,
    kicker:ak102Txt(L.kicker||(L.kind==='empire'&&P.empire&&P.empire[0]?_T`The empire · ${esc(P.empire[0].city)}`:kickers[L.kind]||_T('The league'))),
    gid:L.gid||(L.gids&&L.gids[0])||null,ev:L.ev||null,city:L.kind==='empire'&&P.empire&&P.empire[0]?P.empire[0].city:null,facts:(L.facts||[]).map(([k,v])=>[ak102Txt(k),ak102Txt(v)])};
  if(!lead.ev&&lead.gid&&K.evOf)lead.ev=K.evOf[lead.gid]||null;
  const N=P.numbers||{};
  const myRank=(P.standings||[]).findIndex(m=>m.me);
  const table=(P.standings||[]).slice(0,2).map((m,i)=>({p:i+1,ludus:m.ludus,pts:m.pts,me:m.me?1:0}));if(myRank>1)table.push({p:myRank+1,ludus:P.standings[myRank].ludus,pts:P.standings[myRank].pts,me:1});
  else if(myRank<0&&K.myPlace)table.push(K.myPlace);
  const nx=P.next;
  return {v:1,key:`${P.season}.${P.wk}`,wk:P.wk,season:P.season,loc:P.locN||'',grand:P.grand?1:0,omen:P.omen||null,lead,
    nums:{bouts:N.bouts||0,purses:N.purses||0,topCF:N.topCF||0,deaths:N.deaths||0,empire:N.empire||0},
    house:K.house||null,arena:K.arena||null,
    obits:(K.obits||[]),obitsOld:K.obits?null:(P.obits||[]).slice(0,3).map(ak102Txt),
    empire:(P.empire||[]).slice(0,4).map(e=>({i:e.i,n:e.n,city:e.city,sev:e.sev,mood:e.mood})),
    darwin:(P.darwin||[]).slice(0,3).map(ak102Txt),rabble:(P.rabble||[]).slice(0,3).map(r=>({n:r.n,line:ak102Txt(r.line),look:r.look||{},city:r.city||''})),
    over:String(P.quote||'').split(/<br\s*\/?>/).map(ak102Txt).filter(Boolean).slice(0,2),brief:(P.briefs||[]).slice(0,3).map(ak102Txt),
    hire:(P.agents||[]).slice(0,3).map(g=>({gid:g.gid,n:g.name,gr:typeof trait96Grade==='function'?trait96Grade(g.ovr):'',city:g.city||'',wage:g.wage})),
    table,finest:(P.best||[]).slice(0,5).map(g=>({gid:g.gid,n:g.name,ludus:g.ludus,ovr:g.ovr,me:g.me?1:0})),
    next:nx?{wk:nx.wk,where:nx.where,grand:nx.grand?1:0,bye:K.nextBye?1:0,bouts:(nx.bouts||[]).map(b=>({t:b.t,ev:b.ev,purse:b.purse,names:(b.names||[]).slice(0,4)})),rivals:(nx.rivals||[]).slice(0,2)}:null}}
function ak102Store(w,rec){if(!w)return;const A=w.acta102=Array.isArray(w.acta102)?w.acta102:[];const i=A.findIndex(x=>x.key===rec.key);if(i>=0)A[i]=rec;else A.push(rec);while(A.length>ACTA102.keep)A.shift()}
/* old worlds: the stack starts from lastPaper */
function ak102List(w){if(!w)return [];if(!Array.isArray(w.acta102)||!w.acta102.length){w.acta102=[];if(w.lastPaper){const r=ak102Trim(w.lastPaper);w.lastPaper._k102=r.key;w.acta102.push(r)}}return w.acta102}

/* ---- composeWeekPaper: the house lead + the facts + the stored edition ---- */
{const base=composeWeekPaper;composeWeekPaper=function(world,night){const P=base.apply(this,arguments);
  try{if(!P||typeof P!=='object')return P;const nt=arguments.length>1&&night!==undefined?night:world.night;const F=ak102Facts(world,nt,P);
    const HL=ak102HouseLead(world,P,F);if(HL){if(P.lead&&HL.kind!=='title'){(P.also=P.also||[]).unshift({h:P.lead.h,body:ak102Txt(P.lead.body).split('. ').slice(0,2).join('. ')+'.',gids:P.lead.gids||[]})}P.lead=Object.assign({},P.lead||{},HL)}
    const evOf={};for(const b of (nt&&nt.bouts||[]))if(b.res&&b.res.winners)for(const id of b.res.winners)evOf[id]=b.ev;
    const pm=me();const st=leagueSort(world.mgrs,P.season);const mi=st.findIndex(m=>m.isPlayer);
    P.k102={house:F.house,arena:F.arena,evOf,nextBye:!!(world.night&&world.night.bye),
      obits:world.grave.filter(x=>x.wk===P.wk).slice(0,3).map(d=>({gid:(world.glads.find(g=>g.name===d.name)||{}).id||null,n:d.name,d:ak102Txt(`${CLASSES[d.cls]?CLASSES[d.cls].name:d.cls}${d.mgr?' · '+esc(d.mgr):''}${d.age?_T` · aged ${d.age}`:''}`),fate:ak102Txt(d.fate||''),rec:_T`${d.rec.ev} bouts · ${d.rec.w} wins · ${d.rec.kp} kills`})),
      myPlace:mi>=0&&pm?{p:mi+1,ludus:pm.ludus,pts:msp(pm,P.season).pts,me:1}:null};
    const rec=ak102Trim(P);P._k102=rec.key;ak102Store(world,rec)}catch(e){console.error(e)}
  return P}}

/* ---- the page ---- */
const AK102={view:null};
function ak102Face(gid,size){const g=gid!=null?gById(gid):null;if(!g)return '';try{return gArt(g,size||'xs')}catch(e){return ''}}
function ak102MapHTML(pts,w,h){try{if(typeof mapInset100!=='function')return '';return mapInset100({pts,w,h,pad:.06})}catch(e){return ''}}
function ak102Render(R,o){const w=W_();const pm=me();const L=R.lead||{};const N=R.nums||{};const latest=!!o.latest;const ro=!latest;
  const stat=(n,l)=>n?`<span><b>${n}</b>${l}</span>`:'';
  const art=L.kind==='empire'||(!L.gid&&L.city)?(()=>{const m=ak102MapHTML([{p:L.city||(R.empire[0]||{}).city,k:'sel'}],136,160);return m?`<div class="ak102art"><div class="ak102map">${m}</div><div class="ak102cap"><b>${esc(L.city||'')}</b></div></div>`:''})()
    :L.gid&&gById(L.gid)?`<div class="ak102art"><div class="ak102en">${ak102Face(L.gid,'md')}</div><div class="ak102cap"><b>${esc(gById(L.gid).name)}</b>${esc((CLASSES[gById(L.gid).cls]||{}).name||'')}</div></div>`:'';
  const facts=(L.facts||[]).map(([k,v])=>`<div class="ak102fact"><b>${k}</b><br>${v}</div>`).join('');
  const evCard=L.ev&&typeof cardHTML==='function'?`<div class="ak102ev">${cardHTML('e:'+L.ev,'sm').replace(/ data-card="[^"]*"/g,'')}</div>`:'';
  const side=facts||evCard?`<div class="ak102side">${evCard}${facts}</div>`:'';
  const H=R.house;const row=(x,face)=>`<div class="ak102it">${face?`<span class="ak102fc">${ak102Face(x.gid,'xs')}</span>`:''}<div class="ak102t">${x.t}</div>${x.m?`<span class="ak102m">+${x.m}</span>`:''}${x.res&&(x.res==='w'||x.res==='l')?`<span class="ak102r ${x.res}">${x.res==='w'?_T('WON'):_T('LOST')}</span>`:''}</div>`;
  const houseCol=H?`${H.fought?H.rows.map(x=>row(x,1)).join(''):`<div class="ak102q">${_T`${esc(H.ludus)} did not fight this week.`}</div>`}
      ${H.signed&&H.signed.length?`<h4>${_T`Signed`}</h4>${H.signed.map(x=>row(x,1)).join('')}`:''}
      ${H.yard&&H.yard.length?`<h4>${_T`From the Training Yard`}</h4>${H.yard.map(t=>`<div class="ak102it"><div class="ak102t">${t}</div></div>`).join('')}`:''}
      ${H.coin!=null?`<div class="ak102led"><span>${_T`Treasury`} <b>${coinAmt87(H.coin)}</b></span>${H.coinD!=null?`<span>${_T`this week`} <b class="${H.coinD>=0?'up':'dn'}">${H.coinD>=0?'+':'−'}${Math.abs(H.coinD)}</b></span>`:''}</div>`:''}`
    :`<div class="ak102q">${_T`An older edition: the house page was not kept.`}</div>`;
  const arenaCol=`${R.arena?R.arena.map(x=>row(x,0)).join('')||`<div class="ak102q">${_T`No other bouts this week.`}</div>`:''}
      <h4>${_T`In Memoriam`}</h4>${R.obits&&R.obits.length?R.obits.map(d=>`<div class="ak102ob"><span class="ak102x">✝</span><b>${esc(d.n)}</b>${d.d}<br><i>${d.fate}</i><br><span class="ak102dim">${d.rec}</span></div>`).join('')
        :R.obitsOld&&R.obitsOld.length?R.obitsOld.map(t=>`<div class="ak102ob">✝ ${t}</div>`).join(''):`<div class="ak102q">${_T`No one fell this week. The sand is patient.`}</div>`}`;
  const emp=R.empire||[];const empMap=emp.length?ak102MapHTML(emp.map((e,i)=>({p:e.city,k:'pin',n:String(i+1)})),130,130):'';
  const empCol=emp.length?`<div class="ak102emp">${empMap?`<div class="ak102map">${empMap}</div>`:''}<div>${emp.map((e,i)=>`<div class="ak102e"><span class="ak102n">${i+1}</span><b>${esc(e.n)}</b> · ${esc(e.city)} <span class="ak102sev">${'▮'.repeat(e.sev||1)}</span><small>${_T`the crowds ${e.mood>=5?_T('cheerful'):e.mood<=-5?_T('sour'):_T('uneasy')}`}</small></div>`).join('')}</div></div>`
    :`<div class="ak102q">${_T`A quiet week in the provinces.`}</div>`;
  const rabFace=r=>{try{return typeof face99Spect==='function'?face99Spect(r.look||{},{px:26,city:r.city||undefined}):specFaceSVG(r.look||{},null,r.city)}catch(e){return ''}};
  const nameLink=x=>{const g=gById(x.gid);const free=g&&g.alive&&!g.contract;return free?`<button type="button" class="ak102lk ak102nm" data-ak102="fa:${esc(String(x.gid))}" title="${_T`Open the dossier`}">${esc(x.n)}</button>`:`<span${g&&!g.alive?' class="ak102gone"':''}>${esc(x.n)}</span>`};
  const nx=R.next;
  const ribbon=nx?`<div class="ak102rib"><div class="ak102nw">${latest?_T('NEXT WEEK'):_T('AS PRINTED THEN')}<b>${_T`Week ${ROMAN[((nx.wk-1)%12)+1]||nx.wk}`}${nx.bye?' · '+_T('Bye'):nx.where?' · '+esc(nx.where):''}${nx.grand?' · '+_T('The Grand Games'):''}</b></div>
      <div class="ak102card">${nx.bye||!nx.bouts.length?`<span>${_T`A bye across the league — no bouts anywhere. Rest, train and recruit.`}</span>`:nx.bouts.map(b=>`<span><b>${esc(b.t)}</b> · ${esc(b.ev)} · ${coinAmt87(b.purse)}: ${b.names.map(esc).join(', ')||_T('to be announced')}</span>`).join('')}${nx.rivals&&nx.rivals.length?`<span class="ak102bad">${_T`Bad blood: ${nx.rivals.map(esc).join('; ')}`}</span>`:''}</div>
      ${ro&&o.pager?`<div class="ak102go"><button type="button" class="btn ak102back" data-ak102="now">${_T`Back to this week ▶`}</button></div>`:''}</div>`:'';
  const A=o.list||[];const idx=o.idx;
  const pager=o.pager?`<div class="ak102pg"><button type="button" data-ak102="prev" ${idx<=0?'disabled':''} aria-label="${_T`Older edition`}">◀</button><div><b>${_T`Week ${ROMAN[((R.wk-1)%12)+1]||R.wk}`}</b><small>${_T`edition ${idx+1} of ${A.length} kept · up to ${ACTA102.keep}`}</small></div><button type="button" data-ak102="next" ${idx>=A.length-1?'disabled':''} aria-label="${_T`Newer edition`}">▶</button></div>`:'<div></div>';
  return `<div class="paper ak102${ro?' ak102old':''}" data-ak102key="${esc(R.key||'')}">
  <div class="ak102mast">${pager}<div class="ak102tt"><div class="ak102h1">${_T`ACTA DIURNA`}</div><div class="ak102dek">${_T`Season ${R.season} · Week ${ROMAN[((R.wk-1)%12)+1]||R.wk} of XII · nailed to the forum wall at ${esc(R.loc)}`}${R.grand?' · <b>'+_T('THE GRAND GAMES')+'</b>':''}</div></div>
    <div class="ak102mr"><span class="ak102pr">${_T`PRICE II SESTERTII`}</span>${R.omen?`<br><span class="ak102om">${_T`Omen: ${esc(R.omen)}`}</span>`:''}</div></div>
  <div class="ak102strip">${stat(N.bouts,' '+_T('bouts'))}${N.purses?`<span><b>${coinAmt87(N.purses)}</b> ${_T('in purses')}</span>`:''}${stat(N.topCF,' '+_T('top Crowd Favor'))}${stat(N.deaths,' '+_T('fallen'))}${stat(N.empire,' '+_T('empire events'))}</div>
  <div class="ak102lead${art?'':' noart'}${side?'':' noside'}">${art}<div class="ak102lt"><div class="ak102kick">${L.kicker||''}</div><h2 class="ak102hd">${L.h||''}</h2>${L.deck?`<div class="ak102deck">${L.deck}</div>`:''}<div class="ak102body"><p>${L.body||''}</p></div></div>${side}</div>
  <div class="ak102cols">
    <div class="ak102col ak102house"><h3>${_T`Your House`}<small>${esc(H?H.ludus:(pm?pm.ludus:''))}</small></h3>${houseCol}</div>
    <div class="ak102col ak102arena"><h3>${_T`The Arena`}<small>${_T`the rest of the card at ${esc(R.loc)}`}</small></h3>${arenaCol}</div>
    <div class="ak102col ak102emp0"><h3>${_T`The Empire`}<small>${_T`news from the provinces`}</small></h3>${empCol}</div>
  </div>
  <div class="ak102low">
    <div class="ak102fun ak102dar"><h3>${_T`The Darwinius Awards`}</h3>${(R.darwin||[]).map(t=>`<p>${t}</p>`).join('')||`<p class="ak102q">—</p>`}</div>
    <div class="ak102fun ak102rab rab100"><h3>${_T`Rabble-Rousers`}<small>${_T`of the week`}</small></h3>${(R.rabble||[]).map(r=>`<div class="ak102rb"><span class="ak102fc rf">${rabFace(r)}</span><div>${r.line}</div></div>`).join('')||`<p class="ak102q">—</p>`}</div>
    <div class="ak102fun ak102ovr"><h3>${_T`Overheard`}</h3>${(R.over||[]).map(t=>`<p><i>${t}</i></p>`).join('')||`<p class="ak102q">—</p>`}</div>
    <div class="ak102fun ak102brief"><h3>${_T`In Brief`}</h3>${(R.brief||[]).map(t=>`<p>· ${t}</p>`).join('')||`<p class="ak102q">—</p>`}</div>
    <div class="ak102cls"><h3>${_T`Classifieds`}</h3><div class="ak102c2"><div>
      <div class="ak102ch"><span>${_T`SWORDS FOR HIRE`}</span><button type="button" class="ak102lk" data-ak102="scout">${_T`Scout ▸`}</button></div>
      ${(R.hire||[]).map(x=>`<div class="ak102cl" title="${esc(x.city)}"><span class="ak102g">${esc(x.gr||'?')}</span>${nameLink(x)}<span class="ak102d"></span><span>${x.wage}/${_T('wk')}</span></div>`).join('')||`<div class="ak102q">—</div>`}
      <div class="ak102ch"><span>${_T`THE LEAGUE`}</span><button type="button" class="ak102lk" data-ak102="league">${_T`League ▸`}</button></div>
      ${(R.table||[]).map(x=>`<div class="ak102cl${x.me?' me':''}"><span>${ROMAN[x.p]||x.p}.</span><span>${esc(x.ludus)}</span><span class="ak102d"></span><span>${x.pts!=null?x.pts+' '+_T('pts'):''}</span></div>`).join('')}
      </div><div><div class="ak102ch"><span>${_T`THE SAND’S FINEST`}</span></div>
      ${(R.finest||[]).map((x,i)=>`<div class="ak102cl${x.me?' me':''}"><span>${ROMAN[i+1]}.</span><span>${esc(x.n)} <span class="ak102dim">· ${esc(x.ludus||'')}</span></span><span class="ak102d"></span><span>${x.ovr}</span></div>`).join('')}
    </div></div></div>
  </div>
  ${ribbon}
  <div class="ak102foot">${_T`The Acta Diurna is nailed to the forum wall at week's end. Complaints may be addressed to the editor, who does not read them.`}</div></div>`}

{const base=paperHTML;paperHTML=function(){const w=W_();const P=w&&w.lastPaper;if(!P)return base.apply(this,arguments);
  try{const A=ak102List(w);let idx=A.findIndex(x=>x.key===P._k102);const onTab=typeof MGR!=='undefined'&&MGR.tab==='paper';
    if(onTab&&MGR.ak102!=null&&A[MGR.ak102])idx=MGR.ak102;
    let R=idx>=0?A[idx]:ak102Trim(P);const pager=onTab&&idx>=0;
    AK102.view=R.key;return ak102Render(R,{latest:idx<0?true:idx===A.length-1,pager,list:A,idx})}catch(e){console.error(e);return base.apply(this,arguments)}}}

/* clicks: browse, dossier, Free agents list, League */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mgrBody [data-ak102]');if(!b||b.disabled||typeof MGR==='undefined')return;const a=b.dataset.ak102;const w=W_();if(!w)return;
  e.preventDefault();e.stopPropagation();const A=ak102List(w);
  if(a==='prev'||a==='next'){const cur=MGR.ak102!=null?MGR.ak102:Math.max(0,A.findIndex(x=>x.key===AK102.view));const n=cur+(a==='prev'?-1:1);if(A[n])MGR.ak102=n===A.length-1?null:n}
  else if(a==='now')MGR.ak102=null;
  else if(a==='scout'){MGR.ak102=null;MGR.tab='recruit';MGR.filter='free';MGR.sel=null}
  else if(a==='league'){MGR.ak102=null;MGR.tab='league'}
  else if(a.indexOf('fa:')===0){const id=a.slice(3);const g=gById(id)||gById(+id);MGR.ak102=null;MGR.tab='recruit';MGR.filter='free';if(g)MGR.sel=g.id}
  if(typeof MGR_REDRAW==='function')MGR_REDRAW();const mb=document.getElementById('mBody');if(mb&&a!=='prev'&&a!=='next'&&a!=='now')mb.scrollTop=0},true);
/* a fresh look at the paper always opens this week's edition */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="paper"],[data-mg="endweek"],[data-mg="tab"]');if(b&&typeof MGR!=='undefined')MGR.ak102=null},true);

/* the Manager lesson's last step: the paper has no button now — the rail's Your ludus finishes it */
try{const st=typeof MTUT_STEPS!=='undefined'&&MTUT_STEPS.find(s=>s.k==='acta');
  if(st){st.spot=()=>document.querySelector('.mtabs [data-mg="tab"][data-id="ludus"]')||document.querySelector('[data-mg="tab"][data-id="ludus"]');
    st.say=_T`The <b>Acta Diurna</b> — the week's gazette: your house, the arena, the empire and the league's best. When you have read it, open <b>Your ludus</b> to finish this lesson.`}}catch(e){console.error(e)}

{const st=document.createElement('style');st.textContent=`
.paper.ak102{--ink:#2b1a0d;--ink2:#4a3019;--ink3:#6e5233;--ru:rgba(52,30,12,.62);--ru2:rgba(52,30,12,.32);--bl:#7a1d12;
  position:relative;max-width:1400px;margin:0 auto;color:var(--ink);padding:10px 20px 8px;border:1px solid #6b4e2b;border-radius:3px;font:13px/1.32 Georgia,'Times New Roman',serif;text-shadow:none;
  background:repeating-linear-gradient(0deg,rgba(120,84,40,.06) 0 2px,transparent 2px 7px,rgba(255,240,205,.07) 7px 8px,transparent 8px 13px),
    repeating-linear-gradient(90deg,rgba(120,84,40,.05) 0 1px,transparent 1px 23px,rgba(120,84,40,.035) 23px 25px,transparent 25px 61px),
    radial-gradient(ellipse 120% 90% at 50% 40%,transparent 55%,rgba(110,70,30,.32) 100%),#e7d3a6;
  box-shadow:0 10px 34px rgba(0,0,0,.6),inset 0 0 60px rgba(120,80,35,.3)}
.ak102 h2,.ak102 h3,.ak102 h4{color:var(--ink);text-shadow:none}
.paper.ak102 p{color:var(--ink)!important;opacity:1!important;font-size:inherit;line-height:inherit;max-width:none}
.paper.ak102{container-type:inline-size}
.ak102 .ak102mast{display:grid;grid-template-columns:230px 1fr 230px;align-items:center;gap:10px;padding-bottom:4px;border-bottom:3px double var(--ru)}
.ak102pg{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--ink2)}
.ak102pg button{width:28px;height:28px;min-height:0;padding:0;border-radius:50%;border:1px solid var(--ru);background:rgba(255,245,220,.35);color:var(--ink);font:700 13px Georgia,serif;cursor:pointer}
.ak102pg button:disabled{opacity:.3;cursor:default}.ak102pg button:not(:disabled):hover{background:rgba(185,138,42,.35)}
.ak102pg b{font:400 15px var(--display);letter-spacing:.06em;display:block;line-height:1.1}.ak102pg small{color:var(--ink3);font-size:11px}
.ak102tt{text-align:center}.ak102h1{font:400 40px/1 var(--display);letter-spacing:.16em;color:var(--ink)}
.ak102dek{font:italic 13px Georgia,serif;color:var(--ink2)}
.ak102mr{justify-self:end;text-align:right;font:italic 12px/1.3 Georgia,serif;color:var(--ink2)}
.ak102pr{font:400 11px var(--display);letter-spacing:.12em;font-style:normal;color:var(--ink)}
.ak102om{display:inline-block;margin-top:2px;padding:1px 7px;border:1px solid var(--ru2);border-radius:10px}
.ak102strip{display:flex;justify-content:center;flex-wrap:wrap;border-bottom:1px solid var(--ru);padding:3px 0}
.ak102strip>span{padding:0 14px;font-size:12.5px;color:var(--ink2);border-left:1px solid var(--ru2)}.ak102strip>span:first-child{border-left:0}
.ak102strip b{font:400 16px var(--display);color:var(--ink);margin-right:4px}
.ak102lead{display:grid;grid-template-columns:136px minmax(0,1fr) 250px;gap:16px;padding:6px 0;border-bottom:2px solid var(--ru);align-items:start}
.ak102lead.noart{grid-template-columns:minmax(0,1fr) 250px}.ak102lead.noside{grid-template-columns:136px minmax(0,1fr)}.ak102lead.noart.noside{grid-template-columns:1fr}
.ak102kick{font:700 10.5px var(--body,sans-serif);letter-spacing:.2em;color:var(--bl);text-transform:uppercase}
.ak102 .ak102hd{margin:1px 0 2px;font:400 22px/1.1 var(--display);letter-spacing:.03em}
.ak102deck{font:italic 14px/1.25 Georgia,serif;color:var(--ink2);margin-bottom:4px}
.ak102body{columns:2;column-gap:20px;column-rule:1px solid var(--ru2);text-align:justify;hyphens:auto}
.ak102body p{margin:0}.ak102body p::first-letter{float:left;font:400 46px/.82 var(--display);color:var(--bl);padding:4px 6px 0 0}
.ak102art{display:flex;flex-direction:column;align-items:center}
.ak102en{position:relative;width:130px;height:160px;overflow:hidden;border-radius:50% 50% 46% 46%/42% 42% 58% 58%;box-shadow:0 0 0 2px #e7d3a6,0 0 0 3px var(--ink2),0 0 0 6px #e7d3a6,0 0 0 7px var(--ru2);background:#d9c08e;display:grid;place-items:center}
.ak102en .portrait{filter:grayscale(1) sepia(1) contrast(1.45) brightness(.95) saturate(.75);transform:scale(1.2) translateY(8px)}
.ak102en::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(118deg,rgba(43,26,13,.2) 0 1px,transparent 1px 3px),radial-gradient(ellipse at 50% 42%,transparent 52%,rgba(215,190,140,.9) 80%);mix-blend-mode:multiply}
.ak102cap{font:italic 11.5px/1.25 Georgia,serif;color:var(--ink2);text-align:center;margin-top:6px}.ak102cap b{display:block;font:400 11.5px var(--display);font-style:normal;color:var(--ink)}
.ak102map{border:1px solid var(--ink2);filter:sepia(.55) saturate(.8);line-height:0}
.ak102side{border-left:1px solid var(--ru2);padding-left:12px;display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:start}
.ak102ev{grid-row:span 4;width:96px}.ak102ev .card,.ak102ev>*{max-width:96px}
.ak102fact{font-size:12px;color:var(--ink2);border-top:1px solid var(--ru2);padding-top:3px;grid-column:2}.ak102side>.ak102fact:first-child,.ak102ev+.ak102fact{border-top:0}
.ak102fact b{font:400 12.5px var(--display);color:var(--ink)}
.ak102cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-bottom:2px solid var(--ru)}
.ak102col{padding:4px 14px 6px;border-left:1px solid var(--ru)}.ak102col:first-child{border-left:0;padding-left:0}.ak102col:last-child{padding-right:0}
.ak102 h3{margin:0 0 4px;font:400 13px var(--display);letter-spacing:.14em;text-align:center;border-bottom:1px solid var(--ru2);padding-bottom:2px}
.ak102 h3 small{display:block;font:italic 11px Georgia,serif;letter-spacing:0;color:var(--ink3)}
.ak102 h4{margin:6px 0 2px;font:400 11px var(--display);letter-spacing:.14em;color:var(--bl);text-align:center}
.ak102it{display:flex;gap:7px;align-items:flex-start;padding:2px 0;border-bottom:1px dotted var(--ru2);font-size:12.5px;line-height:1.25}.ak102it:last-child{border-bottom:0}
.ak102t{flex:1;min-width:0}
.ak102fc{flex:none;width:28px;height:28px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 1px var(--ink2);background:#d9c08e;display:grid;place-items:center}
.ak102fc .portrait{filter:grayscale(1) sepia(1) contrast(1.35);transform:scale(1.15) translateY(4px)}
.ak102fc.rf svg{width:28px;height:28px;filter:sepia(.6)}
.ak102m{flex:none;font:400 12.5px var(--display);color:#2d5a1f}
.ak102r{flex:none;font:400 11px var(--display);letter-spacing:.05em;padding:0 5px;border:1px solid currentColor;border-radius:2px}.ak102r.w{color:#2d5a1f}.ak102r.l{color:#7a1d12}
.ak102led{display:flex;justify-content:space-between;font-size:12px;margin-top:4px;padding:3px 6px;border:1px solid var(--ru2);background:rgba(255,245,220,.25)}
.ak102led .up{color:#2d5a1f}.ak102led .dn{color:#7a1d12}
.ak102q{font:italic 12.5px Georgia,serif;color:var(--ink3);text-align:center;padding:5px 0}
.ak102ob{text-align:center;padding:3px 0;font-size:12.5px}.ak102ob b{display:block;font:400 13px var(--display)}.ak102x{font-size:15px}
.ak102dim{color:var(--ink3)}.ak102gone{text-decoration:line-through;color:var(--ink3)}
.ak102emp{display:grid;grid-template-columns:130px minmax(0,1fr);gap:10px}.ak102emp>div:only-child{grid-column:1/-1}
.ak102e{font-size:12px;line-height:1.25;padding:2px 0;border-bottom:1px dotted var(--ru2)}.ak102e:last-child{border:0}
.ak102n{display:inline-block;width:15px;height:15px;border-radius:50%;background:#7a1d12;color:#fff;font:700 9.5px/15px Georgia,serif;text-align:center;margin-right:4px}
.ak102e small{display:block;color:var(--ink3);font-style:italic;padding-left:19px}.ak102sev{color:var(--bl);letter-spacing:-1px}
.ak102low{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) minmax(400px,34%);border-bottom:1px solid var(--ru)}
.ak102fun{padding:4px 12px 6px;border-left:1px solid var(--ru2);font-size:12px;line-height:1.3}.ak102fun:first-child{border-left:0;padding-left:0}
.ak102fun p{margin:0 0 4px}.ak102dar p b{font-family:var(--display);font-weight:400}
.ak102rb{display:flex;gap:6px;align-items:center;padding:2px 0;border-bottom:1px dotted var(--ru2)}.ak102rb:last-child{border:0}.ak102rb .ak102fc{width:26px;height:26px}
.ak102cls{margin:4px 0 6px 10px;padding:5px 9px 6px;border:2px solid var(--ink2);outline:1px solid var(--ink2);outline-offset:2px;background:rgba(255,245,220,.28)}
.ak102cls h3{border-bottom:2px solid var(--ink2);font-size:12px}
.ak102c2{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
.ak102ch{display:flex;justify-content:space-between;align-items:baseline;font:400 10.5px var(--display);letter-spacing:.1em;color:var(--bl);margin-top:4px;border-top:1px solid var(--ru2);padding-top:2px}
.ak102c2>div>.ak102ch:first-child{border-top:0;margin-top:0}
.ak102cl{font-size:11.8px;line-height:1.25;display:flex;gap:6px;align-items:baseline;padding:1px 0}
.ak102cl .ak102d{flex:1;border-bottom:1px dotted var(--ru2);transform:translateY(-3px);min-width:8px}
.ak102cl.me{background:rgba(185,138,42,.22);margin:0 -4px;padding:1px 4px}
.ak102g{font:400 10.5px var(--display);border:1px solid var(--ink2);padding:0 3px;border-radius:2px}
.ak102lk{background:none;border:0;border-bottom:1px dotted rgba(122,29,18,.5);padding:0;min-height:0;color:var(--bl);font:700 12px var(--body,sans-serif);cursor:pointer}
.ak102lk.ak102nm{font:inherit;color:var(--ink);font-weight:700;text-align:left}.ak102lk:hover{color:#a52a1a}
.ak102 button:focus-visible{outline:2px solid #b98a2a;outline-offset:2px}
.ak102rib{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:16px;align-items:center;margin:8px -8px 0;padding:6px 26px;background:linear-gradient(180deg,#8f2a1e,#6d1c13 60%,#5a160f);color:#f3e2bd;
  clip-path:polygon(0 0,100% 0,calc(100% - 14px) 50%,100% 100%,0 100%,14px 50%)}
.ak102old .ak102rib{background:linear-gradient(180deg,#6b5a44,#4f4130);}
.ak102nw{font:400 12px var(--display);letter-spacing:.18em;color:#f0cf7d;line-height:1.1}.ak102nw b{display:block;font-size:18px;letter-spacing:.08em;color:#fff2be;font-weight:400}
.ak102card{font-size:13px;line-height:1.3;display:flex;flex-wrap:wrap;gap:3px 16px}.ak102card b{font:400 12.5px var(--display);color:#fff2be}.ak102bad{color:#ffc9a8}
.ak102foot{text-align:center;font:italic 11px Georgia,serif;color:var(--ink3);padding-top:4px}
@container (max-width:1250px){.ak102low{grid-template-columns:repeat(2,minmax(0,1fr)) minmax(380px,40%)}.ak102cls{grid-column:3;grid-row:1/span 2}.ak102fun:nth-child(3){border-left:0;padding-left:0}.ak102fun:nth-child(3),.ak102fun:nth-child(4){border-top:1px solid var(--ru2)}}
@media (max-width:1180px){
  .ak102lead{grid-template-columns:136px minmax(0,1fr)}.ak102lead.noart{grid-template-columns:1fr}.ak102side{grid-column:1/-1;border-left:0;padding-left:0;border-top:1px solid var(--ru2);padding-top:6px}}
@media (max-width:700px){.paper.ak102{padding:8px 10px}.ak102low{grid-template-columns:1fr!important}.ak102cls{grid-column:auto!important;grid-row:auto!important}
  .ak102 .ak102mast{grid-template-columns:1fr;text-align:center;gap:4px}.ak102tt{order:-1}.ak102h1{font-size:28px;letter-spacing:.1em}.ak102pg{justify-content:center}.ak102mr{justify-self:center;text-align:center}
  .ak102strip>span{padding:0 8px}
  .ak102lead,.ak102lead.noart,.ak102lead.noside{grid-template-columns:1fr}.ak102 .ak102hd{font-size:21px;text-align:center}.ak102deck,.ak102kick{text-align:center}.ak102body{columns:1}
  .ak102cols,.ak102low,.ak102c2{grid-template-columns:1fr}.ak102col,.ak102fun{border-left:0;padding:6px 0;border-top:1px solid var(--ru)}.ak102col:first-child{border-top:0}
  .ak102cls{margin:6px 0}.ak102emp{grid-template-columns:110px minmax(0,1fr)}
  .ak102rib{grid-template-columns:1fr;text-align:center;clip-path:none;margin:8px 0 0;padding:8px 10px;border-radius:3px}.ak102card{justify-content:center}}
`;document.head.appendChild(st)}
}
