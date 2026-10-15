/* =====================================================================
   340-v102prog — v1.02 ONLINE PROGRESSION, the page side (workstream I; the rules: "v1.02 PROGRESSION" at the end of 111-onlcore; the server:
   the "v1.02 PROGRESSION" block of routes.js; docs/backend.md "v1.02 progression"; his look: tools/plans/mock102/progress.html + NOTES-progress.md)
   1 · RESULTS TALLY `#tl102`: after every match a gladiator fought, the server leaves ch.last102; the next time the Online window shows (#onl on
       screen, no live match) the tally opens over it ONCE (char.seen102 at open, on any device): CF → coin to the house treasury → Glory (rank-up
       flourish) → XP (ring + bar, a LEVEL UP flourish per level), Flavius's line; click skips to the end, Reduce motion / Animations Off = the end state at
       once; Continue opens the level-up screen when a point waits.
   2 · LEVEL UP `#lu102`: five rating cards (value → +1, the 40–99 track with the game's bands 76/87/96, what it gives at once), "Train it" =
       char.lvup {id,k} (a request id: 223's NET.req), "Later" keeps the point (it glows on the Domus). Refused for the dead, at 99, in a room / match.
   3 · DOMUS: the XP bar `.xp102w` under the name (level ring, XP to the next level, laurel at 100, ＋N point · spend), "🔒 class set at creation" instead of
       the Change class button (175 d89ClassPop now only says so), "Lv N" on the slot cards + a ⋯ menu `.gc102m` → ⭐ Make active · 🕊 Release… ·
       🗡 Grant the rudis…; the release window `#rl102` (gear to the shelf, Issued pieces vanish, the Hall verdict, typed name, checked on the server too).
   4 · LEVEL EVERYWHERE: room seats + member list (onlRoomHTML80), the lobby list (onlLobbyHTML), Who's online (who100Row), the house card (hc98HTML).
   MOCK: char.lvup / char.seen102 / char.release / char.class (class_fixed) + the tally's match id, house.card + here.list levels, mirroring the server.
   Older online tests set localStorage flavius_tally102off=1 (no automatic tally: it would cover the screens they click).
   Kill switch localStorage flavius_v102ioff=1 → no tally, no level-up screen, no Domus changes (the mock still follows the shared rules).
   ===================================================================== */
const P102={off:(()=>{try{return localStorage.getItem('flavius_v102ioff')==='1'}catch(e){return false}})(),shown:{},run:0,skip:false,tl:null,lu:null,rel:null};
const P102_BANDS={spd:[[76,'+1 movement'],[96,'+2 movement']],str:[[76,'+1 damage'],[87,'+2 damage'],[96,'+3 damage']],lck:[[76,_T('+1 coin a turn')],[96,_T('+2 coin a turn')]],
  cha:[[76,'+1 CF a turn'],[96,'+2 CF a turn']],int:[[65,'Apprentice mind'],[76,'Fighter mind'],[86,'Veteran mind'],[96,'Master mind']]}; /* i18n:skip — translated where shown */
const p102Calm=()=>{try{return (typeof reduceMotion==='function'&&!!reduceMotion())||(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')}catch(e){return false}};
const p102Roman=n=>{n=n|0;if(n<=0)return '0';const R=[[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [v,l] of R)while(n>=v){s+=l;n-=v}return s};
const p102StatN=k=>{const S=typeof STATS!=='undefined'&&STATS.find(x=>x[0]===k);return S?S[1]:k};
const p102StatI=k=>{const S=typeof STATS!=='undefined'&&STATS.find(x=>x[0]===k);return S?S[2]:'•'};
/* "Lv N" (+ a dot when points wait) */
function lv102Chip(n,pts){n=n|0;if(n<1)return '';return `<span class="lv102${pts>0?' pt':''}" title="${esc2(pts>0?_T`Level ${n} · ${pts} point(s) to place`:_T`Level ${n}`)}">${_T`Lv ${n}`}${pts>0?' · +'+(pts|0):''}</span>`}
const p102Char=id=>[ONL.char,...(ONL.chars||[])].find(c=>c&&c.id===id)||null;
const p102Busy=id=>{try{if(typeof onlBusy82==='function'&&onlBusy82().has(id))return true;return !!(typeof onlBusy==='function'&&onlBusy())}catch(e){return false}};
const p102Tpl=h=>{const T=document.createElement('template');T.innerHTML=h;return T};

/* ---------------- 3 · the Domus ---------------- */
function xp102Bar(ch){const B=ONLC.xpBar102(ch);const pts=ch.pts|0;const R=2*Math.PI*21;
  const ring=`<span class="xp102r${B.max?' max':''}" aria-hidden="true"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="21" class="bg"/><circle cx="25" cy="25" r="21" class="fg" stroke-dasharray="${R.toFixed(1)}" stroke-dashoffset="${((1-B.frac)*R).toFixed(1)}" transform="rotate(-90 25 25)"/></svg><b>${B.lv}</b></span>`;
  const sub=B.max?_T`🌿 Level ${B.lv} — the laurel · ${Math.round(B.xp)} XP`:_T`${B.into} / ${B.need} XP to level ${B.lv+1}`;
  return `<div class="xp102w${B.max?' max':''}" data-xp102="${esc2(ch.id)}">${ring}<div class="xp102m"><div class="xp102t"><b>${_T`Level ${B.lv}`}</b><small>${sub}</small></div>
    <div class="xp102b" role="progressbar" aria-label="${esc2(_T('Experience'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(B.frac*100)}"><i style="width:${(B.frac*100).toFixed(1)}%"></i></div></div>
    ${pts>0?`<button type="button" class="xp102s" data-p102="lvup" data-v="${esc2(ch.id)}">${_T`＋${pts} point${pts===1?'':'s'} · spend`}</button>`:''}</div>`}
if(!P102.off&&typeof d89Show==='function'){const base=d89Show;d89Show=function(ch,busy){const h=base.apply(this,arguments);try{if(!ch||typeof h!=='string')return h;const T=p102Tpl(h);
    const cls=T.content.querySelector('[data-d89="cls"]');if(cls){const s=document.createElement('span');s.className='cls102';s.title=_T('Chosen when he was raised — it never changes');s.textContent=_T('🔒 class set at creation');cls.replaceWith(s)}
    const n=T.content.querySelector('.sc89-n');if(n&&!T.content.querySelector('.xp102w'))n.insertAdjacentHTML('afterend',xp102Bar(ch));return T.innerHTML}catch(e){console.error(e);return h}}}
if(!P102.off&&typeof d89Cards==='function'){const base=d89Cards;d89Cards=function(live){const h=base.apply(this,arguments);try{const T=p102Tpl(h);const ids=new Set((live||[]).map(c=>c.id));
    for(const b of [...T.content.querySelectorAll('.gc89[data-v]')]){const id=b.dataset.v;if(!ids.has(id))continue;const c=(live||[]).find(x=>x.id===id);const nm=b.querySelector('.gc89-b>b');
      if(nm&&c)nm.insertAdjacentHTML('afterend',lv102Chip(ONLC.lv102(c),c.pts|0));const w=document.createElement('div');w.className='gc102w';b.replaceWith(w);w.appendChild(b);
      w.insertAdjacentHTML('beforeend',`<button type="button" class="gc102m" data-p102="menu" data-v="${esc2(id)}" aria-haspopup="menu" aria-label="${esc2(_T`More for ${c?c.name:''}`)}" title="${esc2(_T('More'))}">⋯</button>`)}
    return T.innerHTML}catch(e){console.error(e);return h}}}
/* the class is set at creation: whatever still asks for the class window only hears so */
if(!P102.off&&typeof d89ClassPop==='function')d89ClassPop=function(){onlToast80(_T('🔒 The class is set when a gladiator is raised — it never changes.'))};
/* the memorial wall names the released and the freed */
if(!P102.off&&typeof d89Memo==='function'){const base=d89Memo;d89Memo=function(){const h=base.apply(this,arguments);try{if(!h)return h;const memo=((ONL82.dg||{}).memo||[]).filter(m=>m&&m.by&&(m.by.k==='rel'||m.by.k==='rudis'));
    const rels=new Map((ONL.chars||[]).filter(c=>c&&c.rel102).map(c=>[c.name,c.rel102.k]));if(!memo.length&&!rels.size)return h;const T=p102Tpl(h);
    for(const q of T.content.querySelectorAll('.pq89')){const nm=(q.querySelector('b')||{}).textContent||'';const m=memo.find(x=>x.name===nm);const k=m?m.by.k:rels.get(nm)==='rudis'?'rudis':rels.get(nm)?'rel':'';if(!k)continue;
      let b=q.querySelector('.pq89-b');if(!b){b=document.createElement('small');b.className='pq89-b';q.appendChild(b)}b.textContent=k==='rudis'?_T('🗡 freed with the rudis'):_T('🕊 released');
      const old=[...q.querySelectorAll('small')].find(s=>/before v0\.89/.test(s.textContent));if(old)old.remove()}
    return T.innerHTML}catch(e){return h}}}

/* ---------------- the ⋯ menu + release ---------------- */
function p102MenuOff(){const m=document.getElementById('p102menu');if(m)m.remove()}
function p102Menu(btn){p102MenuOff();const id=btn.dataset.v;const ch=p102Char(id);if(!ch)return;const busy=p102Busy(id);const act=ONL.char&&ONL.char.id===id;const why=busy?_T('In a room or a live match — after it is over'):'';
  const m=document.createElement('div');m.id='p102menu';m.setAttribute('role','menu');
  m.innerHTML=`${act?'':`<button type="button" role="menuitem" data-p102="act" data-v="${esc2(id)}" ${busy?_T`disabled title="${esc2(why)}"`:''}>${_T`⭐ Make active`}</button>`}
    <button type="button" role="menuitem" data-p102="rel" data-v="${esc2(id)}" ${busy?_T`disabled title="${esc2(why)}"`:''}>${_T`🕊 Release…`}</button>
    <button type="button" role="menuitem" data-p102="rudis" data-v="${esc2(id)}" ${busy?_T`disabled title="${esc2(why)}"`:''}>${_T`🗡 Grant the rudis… · ${ONLC.RUDIS102} coin`}</button>${busy?`<small>${esc2(why)}</small>`:''}`;
  document.body.appendChild(m);const r=btn.getBoundingClientRect();const w=m.offsetWidth,hh=m.offsetHeight;m.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';
  m.style.top=(r.bottom+hh+8>innerHeight?Math.max(8,r.top-hh-4):r.bottom+4)+'px';const f=m.querySelector('button:not(:disabled)');if(f)f.focus()}
function p102ShelfList(ch){const out=[],gone=[];for(const it of ch.gear||[]){const I=typeof ONL83!=='undefined'&&ONL83.piece?ONL83.piece(ch,it):null;const n=(I&&I.n)||(W[ONLC.itemBase(it)]||ARM[ONLC.itemBase(it)]||{}).n||ONLC.itemBase(it);
    const pc=ONLC.pcOf(ch,it);(pc&&pc.iss?gone:out).push(n)}for(const k of ch.offers||[])out.push(typeof OFF83N==='function'?OFF83N(k):k);return {out,gone}}
function p102RelOpen(id,rudis){p102MenuOff();const ch=p102Char(id);if(!ch||!ch.alive)return;if(p102Busy(id))return onlToast80(_T('⏳ In a room or a live match — release him after it is over.'));
  p102RelClose();const worthy=ONLC.hallWorthy(ch);const plaque=rudis||worthy;const L=p102ShelfList(ch);const T=(ONL.domus||{}).treasury|0;const poor=rudis&&T<ONLC.RUDIS102;
  const Rk=ONLC.rankFor(ch);const sub=_T`${esc2((CLASSES[ch.cls]||{}).name||'')} · ${esc2(Rk.n)} · Lv ${ONLC.lv102(ch)} · ${ch.bouts|0} bouts, ${ch.survived|0} survived, ${ch.wins|0} wins · ${ch.lifeCF|0} lifetime CF`;
  const verd=rudis?`<div class="rl102v hall"><span class="ic" aria-hidden="true">🗡</span><div><b>${_T`Rudiarius — freed`}</b><p>${_T`He takes the wooden sword and walks out a free man. The Hall of the Fallen keeps his name with honour, and the level picks he made.`}</p></div></div>`
    :worthy?`<div class="rl102v hall"><span class="ic" aria-hidden="true">🏛</span><div><b>${_T`The Hall of the Fallen`}</b><p>${_T`He was great: his plaque reads “Released”, with the level picks he made. He counts in the Domus rank like the fallen.`}</p></div></div>`
    :`<div class="rl102v erase"><span class="ic" aria-hidden="true">🌫</span><div><b>${_T`Damnatio memoriae`}</b><p>${_T`He is not great enough for the Hall. His name is erased: no Hall plaque, nothing in the Domus rank.`}</p></div></div>`;
  const bg=document.createElement('div');bg.id='rl102';bg.className='p102scrim';
  bg.innerHTML=`<div class="rl102" role="dialog" aria-modal="true" aria-labelledby="rl102t"><div class="hd"><span class="tok">${typeof onl80Face==='function'?onl80Face(ch,'sm'):''}</span><div><h3 id="rl102t">${rudis?_T`Grant ${esc2(ch.name)} the rudis?`:_T`Release ${esc2(ch.name)}?`}</h3><p>${sub}</p></div></div>
    <div class="bd"><div class="two"><div class="box"><h4>${_T`To the house shelf`}</h4><ul>${L.out.map(n=>`<li>${esc2(n)}</li>`).join('')||`<li class="rc-sub">${_T`Nothing — he carries no gear.`}</li>`}${L.gone.map(n=>`<li class="gone">${_T`${esc2(n)} — Issued, it vanishes`}</li>`).join('')}</ul></div>
      <div class="box"><h4>${_T`What else happens`}</h4><ul>${rudis?`<li>${_T`🪙 ${ONLC.RUDIS102} coin from the house treasury (it holds ${T})`}</li>`:''}<li>${_T`🔓 His slot is free for a new gladiator`}</li><li>${_T`📜 The house record keeps his bouts`}</li><li>${_T`⚔ Not a death: no Fate, nobody loots him`}</li><li>${_T`↺ <b>Cannot be undone</b>`}</li></ul></div></div>
      ${verd}<div class="typed"><label for="rl102in">${_T`Type <b>${esc2(ch.name)}</b> to confirm`}</label><input id="rl102in" autocomplete="off" spellcheck="false" placeholder="${esc2(_T('his name'))}"></div>
      ${poor?`<p class="onl-err">${_T`The treasury needs ${ONLC.RUDIS102} coin to grant the rudis.`}</p>`:''}<p class="onl-err rl102e" hidden></p></div>
    <div class="ft"><span class="sp"></span><button type="button" class="sb100 s" data-p102="relx"><span class="t">${_T`Keep him`}</span></button>
      <button type="button" class="sb100 m ${rudis?'pri':'dan'}" data-p102="relgo" data-v="${esc2(id)}" data-rudis="${rudis?1:0}" disabled><span class="t">${rudis?_T`🗡 Grant the rudis · ${ONLC.RUDIS102}`:_T`Release him`}</span></button></div></div>`;
  document.body.appendChild(bg);P102.rel={id,rudis,poor,back:document.activeElement};const inp=bg.querySelector('#rl102in');if(inp)inp.focus();void plaque}
function p102RelClose(){const b=document.getElementById('rl102');if(b)b.remove();const r=P102.rel;P102.rel=null;try{if(r&&r.back&&r.back.focus)r.back.focus()}catch(e){}}
function p102RelGo(btn){const R=P102.rel;if(!R)return;const ch=p102Char(R.id);const inp=document.getElementById('rl102in');const name=inp?inp.value:'';if(!ch||ONLC.nameKey102(name)!==ONLC.nameKey102(ch.name))return;
  btn.disabled=true;(async()=>{try{const r=await NET.req('char.release',{id:R.id,name,rudis:!!R.rudis});if(r.char)onl83Put(r.char);if(typeof d89Put==='function')d89Put(r);
      if(ONL.char&&ONL.char.id===R.id)ONL.char=(ONL.chars||[]).find(c=>c.alive&&c.id!==R.id)||null;if(typeof ONL82!=='undefined')ONL82.dgAt=0;p102RelClose();
      onlToast80(r.kind==='rudis'?_T`🗡 ${esc2(ch.name)} takes the rudis — freed. The Hall keeps his name.`:r.hall?_T`🕊 ${esc2(ch.name)} is released. The Hall keeps his name.`:_T`🕊 ${esc2(ch.name)} is released — his gear waits on the house shelf.`);onlRedraw()}
    catch(e){const el=document.querySelector('#rl102 .rl102e');if(el){el.hidden=false;el.textContent='⚠ '+errText92(e)}btn.disabled=false}})()}

/* ---------------- 2 · level up ---------------- */
function p102Wit(k,v){const n=v+1;const bands=P102_BANDS[k]||[];const hit=bands.find(b=>b[0]===n);const nx=bands.find(b=>b[0]>n);const dig=k==='int'?` <span class="dig">${_T`(only when a CPU plays his seat)`}</span>`:'';
  if(v>=ONLC.STAT_MAX)return {t:_T`At ${ONLC.STAT_MAX} — the top.`,cross:false};
  if(hit)return {t:_T`<b>${v} → ${n}:</b> ${_T(hit[1])} — at once`+dig,cross:true};
  if(nx)return {t:_T`${v} → ${n}. ${nx[0]-n} more to <b>${_T(nx[1])}</b> at ${nx[0]}`+dig,cross:false};return {t:_T`${v} → ${n}. Top band reached.`,cross:false}}
function p102Track(k,v){const x=s=>((Math.max(40,Math.min(99,s))-40)/59*100).toFixed(1)+'%';const bands=P102_BANDS[k]||[];
  return `<div class="trk" aria-hidden="true"><i class="ln"></i><i class="fill" style="width:${x(v)}"></i>${bands.map(b=>`<i class="bd ${v>=b[0]?'hit':''}" style="left:${x(b[0])}"><span>${b[0]}</span></i>`).join('')}<i class="me" style="left:${x(v)}"></i><i class="gh" style="left:${x(v+1)}"></i></div>`}
function p102LuHTML(ch){const sel=P102.lu&&P102.lu.k;const pts=ch.pts|0;const lv=ONLC.lv102(ch);
  const cards=ONLC.STAT_KEYS.map(k=>{const v=(ch.stats||{})[k]|0;const max=v>=ONLC.STAT_MAX;const W=p102Wit(k,v);
    return `<button type="button" class="rcd ${sel===k?'sel':''} ${W.cross?'cross':''} ${max?'max':''}" data-p102="pick" data-k="${k}" ${max?'disabled':''} aria-pressed="${sel===k}">
      <span class="hd"><span class="ic" aria-hidden="true">${p102StatI(k)}</span><b>${esc2(p102StatN(k))}</b></span>
      <span class="val">${v}${max?'':`<span class="arr">→</span><span class="nv">${v+1}</span>`}</span>${p102Track(k,v)}<span class="wit">${W.t}</span></button>`}).join('');
  return `<div class="lu102" role="dialog" aria-modal="true" aria-labelledby="lu102t"><div class="luhd"><span class="fig">${typeof onlFig==='function'?onlFig(ch.cls,ch.look,170):''}</span>
    <div class="laurel"><span class="num" aria-hidden="true">${p102Roman(lv)}</span><div><div class="t" id="lu102t">${_T`LEVEL ${lv} · ${esc2(String(ch.name||'').toUpperCase())}`}</div>
    <div class="s">${pts>0?_T`<b>+1 to one rating</b> for each point. Choose where he grows — a rating that reaches a band gains its edge on the sand at once.`:_T`No point waits — he earns one each level.`}</div></div></div></div>
    <div class="cards">${cards}</div>
    <div class="lufoot"><span class="pts">${pts===1?_T('1 point to spend'):_T`${pts} points to spend`}</span><span class="why">${sel?_T`${esc2(p102StatN(sel))} +1`:_T('Pick a rating.')}</span><span class="sp"></span>
      <button type="button" class="sb100 s" data-p102="lux"><span class="t">${_T`Later`}</span><small>${_T`it waits on the Domus`}</small></button>
      <button type="button" class="sb100 m pri" data-p102="lugo" ${sel&&pts>0?'':'disabled'}><span class="t">${_T`Train it`}</span></button></div><p class="onl-err lu102e" hidden></p>
    <div class="bands">${_T`<b>Speed</b> 76 / 96 → +1 / +2 movement · <b>Strength</b> 76 / 87 / 96 → +1 / +2 / +3 damage · <b>Luck</b> 76 / 96 → +1 / +2 coin a turn · <b>Charisma</b> 76 / 96 → +1 / +2 CF a turn · <b>Intelligence</b> only when a CPU plays his seat: Apprentice 65 · Fighter 76 · Veteran 86 · Master 96. Online ratings run 50–99.`}</div></div>`}
function p102LuOpen(id){if(P102.off)return;const ch=p102Char(id);if(!ch||!ch.alive)return;p102MenuOff();let bg=document.getElementById('lu102');
  if(!bg){bg=document.createElement('div');bg.id='lu102';bg.className='p102scrim';document.body.appendChild(bg);P102.lu={id,k:null,back:document.activeElement}}else P102.lu.id=id;
  bg.innerHTML=p102LuHTML(ch);const f=bg.querySelector('.rcd:not(:disabled)');if(f&&!P102.lu.k)f.focus()}
function p102LuClose(){const b=document.getElementById('lu102');if(b)b.remove();const r=P102.lu;P102.lu=null;try{if(r&&r.back&&r.back.focus&&document.contains(r.back))r.back.focus()}catch(e){}}
function p102LuGo(btn){const U=P102.lu;if(!U||!U.k)return;const k=U.k;btn.disabled=true;
  (async()=>{try{const r=await NET.req('char.lvup',{id:U.id,k});if(r.char)onl83Put(r.char);const c=p102Char(U.id);onlToast80(_T`💪 ${esc2((c||{}).name||'')}: ${esc2(p102StatN(k))} +1`);
      if(c&&(c.pts|0)>0){U.k=null;p102LuOpen(U.id)}else p102LuClose();onlRedraw()}
    catch(e){const el=document.querySelector('#lu102 .lu102e');if(el){el.hidden=false;el.textContent='⚠ '+errText92(e)}btn.disabled=false}})()}

/* ---------------- 1 · the results tally ---------------- */
function p102TlRow(id,cls,ic,lbl,sub){return `<div class="tr ${cls}" id="${id}"><div class="flash"></div><div class="top">${ic}<div class="lbl">${lbl}<small>${sub}</small></div><span class="sp"></span><span class="gain zero">+0</span><span class="to"></span></div>
  <div class="pbar ${cls==='xprow'?'xp':cls==='cfrow'?'cf':''}"><i class="old"></i><i class="new"></i></div><div class="brk"></div></div>`}
function p102TlHTML(ch,T){const fell=!!T.died;const won=!!T.won;const kick=[T.ranked?_T('RANKED'):_T('CUSTOM'),T.ev?onlEvName(T.ev):'',T.ev&&T.loc!=null?onlCityName(T.loc):''].filter(Boolean).join(' · ').toUpperCase();
  const title=fell?_T('He fell'):won?_T('Victoria'):T.ranked?_T('He lives'):_T('Bout done');const cls=fell?'fell':T.ranked?'':'cust';
  const sub=fell?_T`${T.cf|0} CF at the end — the Fate was against him`:won?_T('He won — he walks out of the Porta Sanavivaria'):T.ranked?_T('He survived the sand'):_T('A friendly bout — no coin, no Fate');
  const mood=fell?'bored':won?'pleased':T.ranked?'calm':'bored';const say=fell?_T('Take him away. Next!'):won?_T('Rome will remember that one — until supper.'):T.ranked?_T('Alive. I suppose that counts for something.'):_T('A practice bout. My lions are bored.');
  const Rk=ONLC.rankFor(ch);const rows=fell?`<div class="fellbox"><span class="ic" aria-hidden="true">🪦</span><div><b>${_T`${esc2(ch.name)} fell`}</b><p>${ONLC.hallWorthy(ch)?_T('The Hall of the Fallen keeps his name.'):_T('He is forgotten — damnatio memoriae.')}</p></div></div>
      ${p102TlRow('tl102cf','cfrow','<span class="ic">🌾</span>',_T('Crowd Favor'),_T('his CF at the end'))}`
    :p102TlRow('tl102cf','cfrow','<span class="ic">🌾</span>',_T('Crowd Favor'),_T('his CF at the end — up to 40 counts for XP'))+
     p102TlRow('tl102co','corow','<span class="ic">🪙</span>',_T('Coin'),T.ranked?_T('to the house treasury'):_T('Custom bout — no coin is paid'))+
     p102TlRow('tl102gl','glrow','<span class="ic">✦</span>',_T('Glory'),_T`his rank: ${esc2(Rk.n)}`)+
     `<div class="tr xprow" id="tl102xp"><div class="flash"></div><span class="lvup" aria-hidden="true">${_T`LEVEL UP`}</span><div class="top"><span class="xp102r big" id="tl102ring"></span><div class="lbl">${_T`Experience`}<small id="tl102xs"></small></div><span class="sp"></span><span class="gain zero">+0</span><span class="to"></span></div>
       <div class="pbar xp"><i class="old"></i><i class="new"></i></div><div class="brk"></div></div>`;
  return `<div class="tl102 ${cls}" role="dialog" aria-modal="true" aria-labelledby="tl102t"><div class="tlhd"><div><div class="kick">${esc2(kick)}</div><h1 id="tl102t" class="${cls}">${title}</h1><div class="sub">${sub}</div></div></div>
    <div class="tlg"><div class="figbox"><span class="fig">${typeof onlFig==='function'?onlFig(ch.cls,ch.look,230):''}</span><span class="rktag" id="tl102rk">${typeof medal100==='function'?medal100(ONLC.rankByGlory(T.g0||0).k,40):''}<small>${esc2(ONLC.rankByGlory(T.g0||0).n)}</small></span>
      <div class="plate"><div><div class="nm">${esc2(ch.name)}</div><div class="cl">${esc2((CLASSES[ch.cls]||{}).name||'')}${ONL.domus&&ONL.domus.name?' · '+esc2(ONL.domus.name):''}</div></div></div></div>
      <div><div class="rows">${rows}</div><div class="flav"><img src="${typeof assetURL==='function'?assetURL('flavmood_'+mood+'.webp'):'assets/flavmood_'+mood+'.webp'}" alt="${esc2(_T('Flavius'))}"><q>${say}</q></div></div></div>
    <div class="tlft"><button type="button" class="sb100 s" data-p102="tlre"><span class="t">${_T`▶ Replay the tally`}</span></button><span class="hint">${_T`Click anywhere to skip to the end`}</span><span class="sp"></span>
      <button type="button" class="sb100 m pri" data-p102="tlgo"><span class="t">${_T`Continue`}</span></button></div></div>`}
const p102Tw=(ms,fn)=>new Promise(res=>{if(P102.skip||p102Calm()){fn(1);return res()}const t0=performance.now();const st=()=>{if(P102.skip){fn(1);return res()}const t=Math.min(1,(performance.now()-t0)/ms);fn(1-Math.pow(1-t,3));t<1?requestAnimationFrame(st):res()};requestAnimationFrame(st)});
const p102Wait=ms=>P102.skip||p102Calm()?Promise.resolve():new Promise(r=>setTimeout(r,ms));
function p102Bar(el,o,n){if(!el)return;el.querySelector('.old').style.width=(Math.max(0,Math.min(1,o))*100)+'%';el.querySelector('.new').style.width=(Math.max(0,Math.min(1,n))*100)+'%'}
function p102Ring(el,lv,frac){if(!el)return;const R=2*Math.PI*21;el.innerHTML=`<svg viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="21" class="bg"/><circle cx="25" cy="25" r="21" class="fg" stroke-dasharray="${R.toFixed(1)}" stroke-dashoffset="${((1-Math.max(0,Math.min(1,frac)))*R).toFixed(1)}" transform="rotate(-90 25 25)"/></svg><b>${lv}</b>`}
async function p102TlPlay(){const S=P102.tl;if(!S)return;const my=++P102.run;P102.skip=false;const ok=()=>my===P102.run&&document.getElementById('tl102');const T=S.T;const root=document.getElementById('tl102');if(!root)return;
  const fmt=n=>Math.round(n).toLocaleString();const live=id=>{const e=document.getElementById(id);if(e){e.classList.add('live')}return e};const done=e=>{if(e){e.classList.remove('live');e.classList.add('done')}};
  const chips=async(e,list)=>{const b=e&&e.querySelector('.brk');if(!b)return;b.innerHTML=list.map(x=>`<span>${x}</span>`).join('');for(const s of b.children){s.classList.add('in');await p102Wait(140)}};
  /* CF */
  {const e=live('tl102cf');const cf=T.cf|0;await p102Tw(650,f=>{if(!e)return;e.querySelector('.gain').textContent='+'+fmt(cf*f);e.querySelector('.gain').classList.toggle('zero',!cf);p102Bar(e.querySelector('.pbar'),0,Math.min(1,cf*f/40))});
    if(e)e.querySelector('.to').innerHTML=cf>40?_T`<b>40</b> count for XP`:'';done(e)}
  if(!ok())return;if(T.died){P102.tl.end=1;return}
  {const e=live('tl102co');const c=T.coin|0;await p102Tw(550,f=>{if(!e)return;e.querySelector('.gain').textContent='+'+fmt(c*f);e.querySelector('.gain').classList.toggle('zero',!c);p102Bar(e.querySelector('.pbar'),0,c?f:0)});
    if(e)e.querySelector('.to').innerHTML=c?_T`treasury <b>${fmt((ONL.domus||{}).treasury|0)}</b>`:'';done(e)}
  if(!ok())return;
  {const e=live('tl102gl');const g0=+T.g0||0,g1=+T.g1||0;const R0=ONLC.rankByGlory(g0),R1=ONLC.rankByGlory(g1);const nx=i=>ONLC.RANKS[ONLC.rankIdx(i)+1]||null;
    const fr=(g,R)=>{const N=nx(R.k);return N?(g-R.glory)/Math.max(1,N.glory-R.glory):1};
    await p102Tw(700,f=>{if(!e)return;const g=g0+(g1-g0)*f;const R=ONLC.rankByGlory(g);e.querySelector('.gain').textContent='+'+(Math.round((g-g0)*10)/10);e.querySelector('.gain').classList.toggle('zero',g1<=g0);
      p102Bar(e.querySelector('.pbar'),R.k===R0.k?fr(g0,R0):0,fr(g,R));const N=nx(R.k);e.querySelector('.to').innerHTML=N?_T`<b>${fmt(g)}</b> · ${esc2(N.n)} at ${N.glory}`:_T`<b>${fmt(g)}</b> · the highest rank`});
    if(R1.k!==R0.k&&e){e.insertAdjacentHTML('beforeend',`<span class="rkup on">${_T`RANK UP · ${esc2(R1.n)}`}</span>`);const t=document.getElementById('tl102rk');if(t){t.classList.add('up');t.innerHTML=(typeof medal100==='function'?medal100(R1.k,40):'')+`<small>${esc2(R1.n)}</small>`}
      const fl=e.querySelector('.flash');if(fl&&!p102Calm()){fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go')}await p102Wait(700)}done(e)}
  if(!ok())return;
  {const e=live('tl102xp');const ring=document.getElementById('tl102ring');const xs=document.getElementById('tl102xs');const gain=T.gain|0;let lv=T.lv0|0||1;const xp0=+T.xp0||0;
    const into=x=>x-ONLC.xpTotal102(lv);const need=()=>ONLC.xpNeed102(lv)||1;let shown=xp0;p102Ring(ring,lv,into(xp0)/need());
    const setRow=x=>{if(!e)return;e.querySelector('.gain').textContent='+'+fmt(x-xp0);e.querySelector('.gain').classList.toggle('zero',!gain);if(xs)xs.textContent=lv>=ONLC.PROG102.MAX?_T('the laurel — XP keeps counting'):_T`${fmt(into(x))} / ${need()} XP to level ${lv+1}`};
    setRow(xp0);p102Bar(e&&e.querySelector('.pbar'),into(xp0)/need(),into(xp0)/need());
    while(ok()&&shown<(+T.xp1||0)){const end=Math.min(+T.xp1||0,lv<ONLC.PROG102.MAX?ONLC.xpTotal102(lv+1):Infinity);const from=shown;const o0=into(from)/need();
      await p102Tw(Math.max(350,Math.min(900,(end-from)*12)),f=>{const x=from+(end-from)*f;setRow(x);p102Bar(e&&e.querySelector('.pbar'),o0,into(x)/need());p102Ring(ring,lv,into(x)/need())});shown=end;
      if(lv<ONLC.PROG102.MAX&&shown>=ONLC.xpTotal102(lv+1)&&lv<(T.lv1|0)){lv++;const b=e&&e.querySelector('.lvup');if(b){b.classList.remove('on');void b.offsetWidth;b.classList.add('on')}
        const fl=e&&e.querySelector('.flash');if(fl&&!p102Calm()){fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go')}p102Ring(ring,lv,0);setRow(shown);p102Bar(e&&e.querySelector('.pbar'),0,0);await p102Wait(450)}else break}
    if(!ok())return;p102Ring(ring,T.lv1|0||lv,ONLC.xpBar102({lv:T.lv1,xp:T.xp1}).frac);
    const f=T.f!=null?+T.f:1;const parts=[`🌾 <b>${Math.min(40,T.cf|0)}</b>`,_T`survived <b>+20</b>`];if(T.won)parts.push(_T`won <b>+15</b>`);if(f!==1)parts.push(_T`table × <b>${f}</b>`);if(!T.ranked)parts.push(_T`Custom × <b>0.5</b>`);
    if(T.cap)parts.push(_T('Custom cap: 300 XP a day'));if((T.lv1|0)>(T.lv0|0))parts.push(_T`level ${T.lv0} → <b>${T.lv1}</b>`);if(T.pts>0)parts.push(_T`<b>+${T.pts}</b> point${T.pts===1?'':'s'} to place`);
    for(const k of T.auto||[])parts.push(_T`${esc2(p102StatN(k))} <b>+1</b> (his weakest)`);
    await chips(e,parts);done(e)}
  if(ok())P102.tl.end=1}
function p102TlOpen(ch){if(P102.off||!ch||!ch.last102)return;const T=ch.last102;const key=ch.id+':'+(T.at||0);if(P102.shown[key])return;P102.shown[key]=1;
  /* shown once, on any device: the server forgets it now */
  (async()=>{try{const r=await NET.req('char.seen102',{id:ch.id});if(r&&r.char)onl83Put(r.char);else{const c=p102Char(ch.id);if(c)delete c.last102}}catch(e){}})();
  const bg=document.createElement('div');bg.id='tl102';bg.className='p102scrim tl102bg';bg.innerHTML=p102TlHTML(ch,T);document.body.appendChild(bg);P102.tl={id:ch.id,T,back:document.activeElement};
  const go=bg.querySelector('[data-p102="tlgo"]');if(go)go.focus();p102TlPlay()}
function p102TlClose(next){const b=document.getElementById('tl102');if(b)b.remove();const S=P102.tl;P102.tl=null;P102.run++;
  if(next&&S){const c=p102Char(S.id);if(c&&c.alive&&(c.pts|0)>0){p102LuOpen(S.id);return}}try{if(S&&S.back&&S.back.focus&&document.contains(S.back))S.back.focus()}catch(e){}
  setTimeout(p102Check,60)}
/* the Online window is up and no match is live → the next waiting tally */
function p102Check(){if(P102.off)return;try{if(localStorage.getItem('flavius_tally102off')==='1')return}catch(e){}try{const o=document.getElementById('onl');if(!o||!o.getClientRects().length)return;if(document.getElementById('tl102')||document.getElementById('lu102')||document.getElementById('rl102'))return;
    if(document.getElementById('tab92')&&document.getElementById('tab92').offsetParent)return;if(typeof onlIsGuest82==='function'&&onlIsGuest82())return;
    if(typeof S!=='undefined'&&S&&S.onl&&!S.over)return;const list=[...(ONL.chars||[])].filter(c=>c&&c.last102&&!P102.shown[c.id+':'+(c.last102.at||0)]).sort((a,b)=>(b.last102.at||0)-(a.last102.at||0));
    if(list.length)p102TlOpen(list[0])}catch(e){console.error(e)}}
{const base=onlRedraw;onlRedraw=function(){const r=base.apply(this,arguments);if(!P102.off)setTimeout(p102Check,0);return r}}

/* ---------------- 4 · the level wherever a name shows ---------------- */
const p102LvOf=(L,id)=>{const p=(L.players||[]).find(x=>x&&x.id===id)||(L.members||[]).find(x=>x&&x.id===id);return p?(p.lv|0)||((p.kit&&p.kit.lv)|0):0};
if(!P102.off&&typeof onlRoomHTML80==='function'){const base=onlRoomHTML80;onlRoomHTML80=function(L){const h=base.apply(this,arguments);try{if(!L||typeof h!=='string')return h;const T=p102Tpl(h);let ch=false;
    for(const s of T.content.querySelectorAll('.lb100-s')){const a=s.querySelector('[data-hc98]');const v=a?p102LvOf(L,a.getAttribute('data-hc98')):0;const box=s.querySelector('.lb100-rks')||s.querySelector('.r80-who');if(v&&box&&!box.querySelector('.lv102')){box.insertAdjacentHTML('beforeend',lv102Chip(v));ch=true}}
    for(const r of T.content.querySelectorAll('[data-u96]')){const v=p102LvOf(L,r.getAttribute('data-u96'));const b=r.querySelector('b');if(v&&b&&!r.querySelector('.lv102')){b.insertAdjacentHTML('afterend',lv102Chip(v));ch=true}}
    return ch?T.innerHTML:h}catch(e){return h}}}
if(!P102.off&&typeof onlLobbyHTML==='function'){const base=onlLobbyHTML;onlLobbyHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||h.indexOf('data-row=')<0)return h;const T=p102Tpl(h);let ch=false;
    for(const tr of T.content.querySelectorAll('tr[data-row]')){const L=(ONL.lobbies||[]).find(x=>x&&x.id===tr.dataset.row);const v=L&&L.host?p102LvOf(L,L.host.id):0;const b=tr.querySelector('td b');if(v&&b&&!tr.querySelector('.lv102')){b.insertAdjacentHTML('afterend',' '+lv102Chip(v));ch=true}}
    return ch?T.innerHTML:h}catch(e){return h}}}
if(!P102.off&&typeof who100Row==='function'){const base=who100Row;who100Row=function(r){const h=base.apply(this,arguments);try{if(!r||!(r.lv>0)||typeof h!=='string')return h;
    return h.replace(/(<b class="w100n"[^>]*>[\s\S]*?<\/b>)/,(m)=>m+lv102Chip(r.lv))}catch(e){return h}}}
if(!P102.off&&typeof hc98HTML==='function'){const base=hc98HTML;hc98HTML=function(r){const h=base.apply(this,arguments);try{const G=(r&&r.glads)||[];if(!G.some(g=>g&&g.lv>0))return h;const T=p102Tpl(h);
    const li=[...T.content.querySelectorAll('.hc98-gl li')];G.forEach((g,i)=>{const x=li[i]&&li[i].querySelector('b');if(x&&g.lv>0)x.insertAdjacentHTML('afterend',' '+lv102Chip(g.lv))});return T.innerHTML}catch(e){return h}}}

/* ---------------- the controls ---------------- */
document.addEventListener('click',e=>{if(P102.off)return;const b=e.target.closest&&e.target.closest('[data-p102]');
  if(!b){if(!e.target.closest||!e.target.closest('#p102menu'))p102MenuOff();
    /* a click on the tally (not a button) skips it to the end */
    if(e.target.closest&&e.target.closest('#tl102')&&P102.tl&&!P102.tl.end)P102.skip=true;return}
  const a=b.dataset.p102,v=b.dataset.v;if(b.disabled)return;e.preventDefault();e.stopPropagation();
  if(a==='menu'){if(document.getElementById('p102menu'))return p102MenuOff();return p102Menu(b)}
  if(a==='act'){p102MenuOff();const c=document.querySelector(`#onl .gc89[data-v="${CSS.escape(v)}"]`);if(c&&!c.disabled)c.click();return}
  if(a==='rel'||a==='rudis')return p102RelOpen(v,a==='rudis');
  if(a==='relx')return p102RelClose();
  if(a==='relgo')return p102RelGo(b);
  if(a==='lvup')return p102LuOpen(v);
  if(a==='pick'){if(!P102.lu)return;P102.lu.k=b.dataset.k;const c=p102Char(P102.lu.id);if(c){document.getElementById('lu102').innerHTML=p102LuHTML(c);const s=document.querySelector('#lu102 .rcd.sel');if(s)s.focus()}return}
  if(a==='lux')return p102LuClose();
  if(a==='lugo')return p102LuGo(b);
  if(a==='tlre'){if(!P102.tl)return;const c=p102Char(P102.tl.id)||{name:'',cls:'soldier'};const bg=document.getElementById('tl102');P102.tl.end=0;bg.innerHTML=p102TlHTML({...c,last102:P102.tl.T},P102.tl.T);p102TlPlay();return}
  if(a==='tlgo'){if(P102.tl&&!P102.tl.end){P102.skip=true;return}return p102TlClose(true)}},true);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='rl102in'&&P102.rel){const ch=p102Char(P102.rel.id);const go=document.querySelector('#rl102 [data-p102="relgo"]');
  if(go&&ch)go.disabled=P102.rel.poor||ONLC.nameKey102(e.target.value)!==ONLC.nameKey102(ch.name)}});
document.addEventListener('keydown',e=>{if(P102.off)return;
  if(e.key==='Escape'){if(document.getElementById('rl102')){e.preventDefault();e.stopPropagation();return p102RelClose()}if(document.getElementById('lu102')){e.preventDefault();e.stopPropagation();return p102LuClose()}
    if(document.getElementById('p102menu')){e.preventDefault();return p102MenuOff()}if(document.getElementById('tl102')){e.preventDefault();e.stopPropagation();if(P102.tl&&!P102.tl.end){P102.skip=true;return}return p102TlClose(false)}}
  if(e.key==='Enter'&&e.target&&e.target.id==='rl102in'){const go=document.querySelector('#rl102 [data-p102="relgo"]');if(go&&!go.disabled){e.preventDefault();p102RelGo(go)}}
  /* keep Tab inside an open window */
  if(e.key==='Tab'){const box=document.querySelector('#rl102 .rl102,#lu102 .lu102,#tl102 .tl102');if(!box)return;const f=[...box.querySelectorAll('button:not(:disabled),input,[tabindex="0"]')];if(!f.length)return;
    const i=f.indexOf(document.activeElement);if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}},true);

/* ---------------- MOCK: the server's routes ---------------- */
function mockBusy102(w,me,cid){for(const L of Object.values(w.lobbies||{})){if(L.mock||(L.status!=='waiting'&&L.status!=='live'))continue;
    if((L.players||[]).some(p=>p.id===me||(cid&&p.char===cid)))return true;if(L.status==='waiting'&&(L.members||[]).some(m=>m.id===me))return true}
  return !!(typeof mockLive80==='function'&&mockLive80(w,me))}
if(typeof MOCK_ROUTES!=='undefined'){
  Object.assign(MOCK_ROUTES,{
    'char.class':(w,d,me)=>{mockOwn83(w,me,d&&d.char);throw onlErr82(_T('The class is set when a gladiator is raised — it never changes.'),'class_fixed')},
    'char.lvup':(w,d,me)=>{d=d||{};const ch=mockOwn83(w,me,String(d.id||d.char||''));const k=String(d.k||'');const why=ONLC.lvupWhy102(ch,k);if(why)throw onlErr82(why,'lvup_bad');
      if(mockBusy102(w,me,ch.id))throw onlErr82(_T('Finish or leave your room or match first.'),'in_match');ONLC.lvup102(ch,k,Date.now());return {char:ch}},
    'char.seen102':(w,d,me)=>{const ch=w.chars[String((d&&(d.id||d.char))||'')];if(!ch||ch.owner!==me)throw new Error(_T('Not yours.'));delete ch.last102;return {char:ch}},
    'char.release':(w,d,me)=>{d=d||{};const rudis=!!d.rudis;const D=mockHouse83(w,me);const ch=mockOwn83(w,me,String(d.id||d.char||''));if(ch.domus&&ch.domus!==D.id)throw new Error(_T('Not of your house.'));
      const why=ONLC.releaseWhy102(ch,d.name,rudis,D.treasury|0);if(why)throw onlErr82(why,/treasury/.test(why)?'no_coin':'release_bad',/treasury/.test(why)?{cost:ONLC.RUDIS102}:undefined);
      if(mockBusy102(w,me,ch.id))throw onlErr82(_T('Finish or leave your room or match first.'),'in_match');const t=Date.now();
      if(rudis){D.treasury=(D.treasury|0)-ONLC.RUDIS102;ONLC.ledAdd(D,'rudis',ONLC.RUDIS102,ch,t)}
      const G=ONLC.releaseGear102(ch);const mk=ONLC.releaseMark102(ch,rudis,t);
      for(const P of G.shelf)ONLC.putPiece(D,P,false);if(G.offers.length)ONLC.offersIn(D,G.offers);if(G.gifts.length)ONLC.giftsIn(D,G.gifts);if((ch.wallet|0)>0){D.treasury=(D.treasury|0)+(ch.wallet|0);ch.wallet=0}
      ONLC.memoAdd(D,{...ONLC.memoEntry(ch,null,{k:mk.kind==='rudis'?'rudis':'rel'},t),lv:ONLC.lv102(ch),rel:mk.kind});
      const A=w.accounts[me];if(A&&A.active===ch.id){const left=Object.values(w.chars).filter(c=>c.owner===me&&c.alive);A.active=left.length?left[left.length-1].id:null}
      if(mk.plaque&&!ch.test){w.hall.unshift(ONLC.hallEntry102(ch,mk.kind,t));w.news.unshift(mk.kind==='rudis'?['🗡',_T`${ch.name} receives the rudis — freed.`]:['🏛',_T`${ch.name} leaves the sand, released.`]);w.news=w.news.slice(0,12)}
      try{if(typeof mockDr98Upd==='function')mockDr98Upd(w,D.id)}catch(e){}
      return {char:ch,domus:typeof mockDRow82==='function'?mockDRow82(D):D,hall:mk.plaque,kind:mk.kind,vanish:G.vanish,shelf:G.shelf.length,offers:G.offers.length,gear:D.gear||[],pcs:D.pcs||{}}}});
  /* the tally knows its match */
  {const base=MOCK_ROUTES['match.result'];MOCK_ROUTES['match.result']=(w,d,me)=>{const r=base(w,d,me);try{const L=w.lobbies[d.id];const M=w.matches[d.id];if(L&&M&&M.status==='done')for(const p of L.players||[]){const c=p&&p.char&&w.chars[p.char];
      if(c&&c.last102&&!c.last102.m)c.last102={...c.last102,m:d.id,ev:L.ev||null,loc:L.loc|0}}}catch(e){}return r}}
  {const base=MOCK_ROUTES['house.card'];if(base)MOCK_ROUTES['house.card']=(w,d,me)=>{const r=base(w,d,me);try{for(const g of r.glads||[]){const c=w.chars[g.id];if(c)g.lv=ONLC.lv102(c)}
      const D=r.domus&&mockDomus82(w,r.domus.id);if(D){const all=Object.values(w.chars).filter(c=>c.owner===D.owner);r.fallen=Math.max(D.fallen|0,all.filter(c=>!c.alive&&!c.rel102).length)}}catch(e){}return r}}
  {const base=MOCK_ROUTES['here.list'];if(base)MOCK_ROUTES['here.list']=(w,d,me)=>{const r=base(w,d,me);try{for(const x of r.rows||[]){const c=typeof onlMockChar==='function'?onlMockChar(w,x.id):null;if(c)x.lv=ONLC.lv102(c)}}catch(e){}return r}}
  if(typeof mockReq==='function'){const base=mockReq;mockReq=async function(t,d){if(['char.lvup','char.release','char.seen102'].includes(t)&&typeof mockIsGuest82==='function'&&mockIsGuest82(mockMe()))throw onlErr82(_T('Sign in to play.'),'guest');return base.apply(this,arguments)}}}

/* ---------------- the look ---------------- */
(function(){if(P102.off)return;const st=document.createElement('style');st.id='p102css';st.textContent=`
.lv102{display:inline-block;margin-left:5px;padding:0 6px;border-radius:999px;border:1px solid #38536e;background:#14202c;color:#cfe8ff;font:600 11px/1.6 ui-monospace,Menlo,monospace;letter-spacing:.02em;white-space:nowrap;vertical-align:1px}
.lv102.pt{border-color:#9fd0ff;color:#e6f4ff;background:#1d3045}
#onl .cls102{display:inline-flex;align-items:center;gap:4px;font-size:12px;padding:1px 8px;border-radius:999px;border:1px solid #4a3826;color:#b8a488;background:#1b140e}
#onl .xp102w{display:flex;align-items:center;gap:10px;margin:6px 0 8px;padding:8px 10px;border-radius:9px;border:1px solid #38536e;background:linear-gradient(#1a2633,#121a23)}
.xp102r{position:relative;width:46px;height:46px;flex:none;display:inline-block}.xp102r svg{position:absolute;inset:0;width:100%;height:100%}.xp102r .bg{fill:#0f1822;stroke:#26384a;stroke-width:5}
.xp102r .fg{fill:none;stroke:#8cc4f2;stroke-width:5;stroke-linecap:round}.xp102r b{position:absolute;inset:0;display:grid;place-items:center;font:400 19px Georgia,serif;color:#e6f4ff;text-shadow:0 2px 0 #0b1a2a}
.xp102r.max .fg{stroke:#e2b14f}.xp102r.big{width:60px;height:60px}.xp102r.big b{font-size:25px}
#onl .xp102m{flex:1;min-width:0}#onl .xp102t{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}#onl .xp102t b{font:400 15px Georgia,serif;color:#cfe8ff;letter-spacing:.04em}#onl .xp102t small{font:500 12px ui-monospace,Menlo,monospace;color:#9cc0e0}
.xp102b{position:relative;height:10px;margin-top:5px;border-radius:5px;background:#0b1118;box-shadow:inset 0 1px 3px #000;overflow:hidden}.xp102b i{position:absolute;inset:0 auto 0 0;border-radius:5px;background:linear-gradient(#e6f4ff,#8cc4f2 50%,#3f7fbf)}
#onl .xp102w.max .xp102b i{background:linear-gradient(#fff2be,#e2b14f 55%,#a87a2a)}
#onl .xp102s{flex:none;padding:6px 11px;border-radius:7px;border:1px solid #9fd0ff;background:linear-gradient(#2e4a66,#1d3045);color:#e6f4ff;font:400 13.5px Georgia,serif;cursor:pointer;white-space:nowrap;animation:p102glow 1.8s ease-in-out infinite}
@keyframes p102glow{50%{filter:brightness(1.18) drop-shadow(0 0 8px #9fd0ff)}}
body.calm #onl .xp102s,body.idle92 #onl .xp102s{animation:none}@media(prefers-reduced-motion:reduce){#onl .xp102s{animation:none}}
#onl .gc102w{position:relative;display:flex;min-width:0;flex-shrink:0}#onl .gc89-b .lv102{justify-self:start;margin-left:0}#onl .gc102w>.gc89{flex-grow:1;min-width:0}
#onl .gc102m{position:absolute;top:4px;right:4px;width:26px;height:22px;border-radius:6px;border:1px solid #6b5236;background:#1b140e;color:#e8d6ae;font:700 14px/1 Georgia,serif;cursor:pointer;z-index:2}
#onl .gc102m:hover,#onl .gc102m:focus-visible{border-color:#d6ab4c;color:#f0cf7d;outline:none}
#p102menu{position:fixed;z-index:100060;display:flex;flex-direction:column;min-width:210px;padding:6px;border-radius:9px;border:1px solid #6b5236;background:linear-gradient(#2a1f17,#1f1711);box-shadow:0 12px 30px #000c}
#p102menu button{all:unset;cursor:pointer;padding:7px 10px;border-radius:6px;color:#efe3cc;font-size:13.5px}#p102menu button:hover:not(:disabled),#p102menu button:focus-visible{background:#3a2a18;color:#f0cf7d}
#p102menu button:disabled{opacity:.45;cursor:not-allowed}#p102menu small{padding:2px 10px 4px;color:#b39d80;font-size:11.5px}
.p102scrim{position:fixed;inset:0;z-index:100050;display:grid;place-items:center;padding:16px;background:rgba(10,6,4,.82);overflow:auto;color:#efe3cc;font:15px/1.45 "Alegreya Sans","Segoe UI",system-ui,sans-serif}
.p102scrim h1,.p102scrim h3,.p102scrim h4{margin:0;font-weight:400}
/* release */
.rl102{width:min(720px,100%);border:1px solid #4a3826;border-top:3px solid #d6ab4c;border-radius:10px;background:linear-gradient(#2a1f17,#1f1711);box-shadow:0 18px 40px #000a}
.rl102 .hd{display:flex;gap:12px;align-items:center;padding:14px 16px 8px}.rl102 .hd .tok{flex:none;width:52px}.rl102 h3{font:400 22px Georgia,serif;color:#f0cf7d}.rl102 .hd p{margin:2px 0 0;color:#b39d80;font-size:13px}
.rl102 .bd{padding:4px 16px 8px}.rl102 .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rl102 .box{border:1px solid #3a2c1f;border-radius:8px;padding:8px 10px;background:#1b140e}
.rl102 .box h4{font:400 14px Georgia,serif;color:#e8d6ae;margin-bottom:4px}.rl102 ul{margin:0;padding-left:18px;font-size:13px}.rl102 li.gone{color:#b39d80;text-decoration:line-through}
.rl102v{display:flex;gap:10px;align-items:flex-start;margin:10px 0;padding:10px 12px;border-radius:8px;border:1px solid #6a2a20;background:#2a1512}.rl102v.hall{border-color:#8c6a3a;background:#2e2212}
.rl102v .ic{font-size:28px;line-height:1}.rl102v b{font:400 16px Georgia,serif;color:#f3b49e}.rl102v.hall b{color:#f0cf7d}.rl102v p{margin:2px 0 0;font-size:13px;color:#d9c7a6}
.rl102 .typed label{display:block;font-size:13.5px;margin-bottom:4px}.rl102 .typed input{width:100%;box-sizing:border-box;padding:8px 10px;border-radius:6px;border:1px solid #6b5236;background:#120c08;color:#efe3cc;font:inherit}
.rl102 .ft{display:flex;align-items:center;gap:10px;padding:10px 16px 14px;flex-wrap:wrap}.rl102 .ft .sp,.lufoot .sp,.tlft .sp{flex:1}
/* level up */
.lu102{width:min(1100px,100%);border:1px solid #38536e;border-top:3px solid #8cc4f2;border-radius:12px;background:radial-gradient(ellipse at 30% 0,#1d2c3c,#14100c 70%);padding:16px 18px;box-shadow:0 18px 40px #000a}
.lu102 .luhd{display:grid;grid-template-columns:150px 1fr;gap:16px;align-items:center;margin-bottom:12px}.lu102 .fig{display:grid;place-items:end center;height:170px;border-radius:10px;background:radial-gradient(ellipse 70% 60% at 50% 70%,#24415e,#121c28 60%,#0b1119);overflow:hidden}
.lu102 .laurel{display:flex;align-items:center;gap:14px}.lu102 .num{font:400 64px/0.9 Georgia,serif;background:linear-gradient(180deg,#fff,#bfe0ff 40%,#5f9bd3 75%,#cfe8ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.lu102 .laurel .t{font:400 19px Georgia,serif;letter-spacing:.16em;color:#cfe8ff}.lu102 .laurel .s{color:#b39d80;font-size:14px;max-width:560px}
.lu102 .cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
.lu102 .rcd{all:unset;box-sizing:border-box;position:relative;cursor:pointer;display:flex;flex-direction:column;border:1px solid #4a3826;border-radius:10px;padding:10px 10px 12px;background:linear-gradient(#271c14,#1b140e);transition:transform .15s,border-color .15s}
.lu102 .rcd:hover:not(:disabled),.lu102 .rcd:focus-visible{transform:translateY(-3px);border-color:#8c6a3a}.lu102 .rcd.sel{border-color:#f0cf7d;box-shadow:0 0 0 3px #d6ab4c;background:linear-gradient(#4a3418,#2a1d10);transform:translateY(-5px)}
.lu102 .rcd.cross::before{content:"BAND UP";position:absolute;top:-10px;right:10px;font:600 10px ui-monospace,monospace;letter-spacing:.12em;padding:2px 7px;border-radius:3px;color:#2a1408;background:linear-gradient(#fff2be,#e2b14f)}
.lu102 .rcd:disabled{opacity:.5;cursor:not-allowed}.lu102 .rcd .hd{display:flex;align-items:center;gap:6px}.lu102 .rcd .hd b{font:400 15px Georgia,serif}.lu102 .rcd .ic{font-size:20px}
.lu102 .rcd .val{display:flex;align-items:baseline;gap:6px;margin:6px 0 2px;font:400 28px/1 Georgia,serif;font-variant-numeric:tabular-nums}.lu102 .rcd .arr{font-size:16px;color:#b39d80}.lu102 .rcd .nv{color:#f0cf7d}
.lu102 .trk{position:relative;height:28px;margin:8px 2px 4px}.lu102 .trk i{position:absolute;display:block}.lu102 .trk .ln{left:0;right:0;top:11px;height:6px;border-radius:3px;background:#120c08}
.lu102 .trk .fill{left:0;top:11px;height:6px;border-radius:3px;background:linear-gradient(90deg,#7a5a2c,#d6ab4c)}.lu102 .trk .bd{top:5px;width:2px;height:18px;background:#6b5236}.lu102 .trk .bd.hit{background:#f0cf7d}
.lu102 .trk .bd span{position:absolute;top:18px;transform:translateX(-50%);font:500 9.5px ui-monospace,monospace;color:#8c7759}.lu102 .trk .me{top:6px;width:10px;height:16px;margin-left:-5px;border-radius:3px;background:#efe3cc}
.lu102 .trk .gh{top:6px;width:10px;height:16px;margin-left:-5px;border-radius:3px;border:2px dashed #f0cf7d;box-sizing:border-box;opacity:0}.lu102 .rcd.sel .gh,.lu102 .rcd:hover .gh{opacity:1}
.lu102 .rcd .wit{margin-top:6px;font-size:12.5px;line-height:1.3;padding:5px 7px;border-radius:6px;background:#2a1f12;border:1px solid #4a3826;min-height:48px}.lu102 .rcd.cross .wit{border-color:#d6ab4c;color:#f0cf7d}.lu102 .dig{color:#cdb2f5}
.lu102 .lufoot{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap}.lu102 .pts{font:400 17px Georgia,serif;color:#cfe8ff}.lu102 .why{color:#b39d80;font-size:13.5px}
.lu102 .bands{margin-top:12px;font-size:12.5px;color:#b39d80;border-top:1px dashed #4a3826;padding-top:8px}.lu102 .bands b{color:#efe3cc;font-weight:500}
/* the tally */
.tl102bg{background:radial-gradient(ellipse 80% 70% at 50% 40%,rgba(42,29,20,.9),rgba(11,7,5,.96) 85%)}
.tl102{width:min(1120px,100%)}.tl102 .kick{font:500 12px ui-monospace,Menlo,monospace;letter-spacing:.2em;color:#c4ab84}
.tl102 h1{font:400 52px/0.95 Georgia,serif;letter-spacing:.06em;background:linear-gradient(180deg,#fff2be,#f0cf7d 35%,#b98a2a 70%,#e7c46c);-webkit-background-clip:text;background-clip:text;color:transparent}
.tl102 h1.fell{background:linear-gradient(180deg,#ffd9c4,#e8805f 40%,#a3281f 75%,#5a160f);-webkit-background-clip:text;background-clip:text}.tl102 h1.cust{background:linear-gradient(180deg,#f3ead8,#c9b38f 60%,#8c7556);-webkit-background-clip:text;background-clip:text}
.tl102 .sub{color:#b39d80;font-size:15px;margin:4px 0 12px}
.tl102 .tlg{display:grid;grid-template-columns:280px 1fr;gap:18px;align-items:start}
.tl102 .figbox{position:relative;display:grid;place-items:end center;height:330px;border-radius:12px;border:1px solid #4a3826;background:radial-gradient(ellipse 70% 55% at 50% 72%,#5a3b1d,#2a1d12 55%,#18110b);overflow:hidden}
.tl102 .figbox .fig{margin-bottom:62px}.tl102 .rktag{position:absolute;top:10px;right:10px;display:flex;flex-direction:column;align-items:center;font:400 12px Georgia,serif;color:#f0cf7d}
.tl102 .rktag.up svg,.tl102 .rktag.up img{transform:scale(1.2) rotate(-8deg);transition:transform .5s cubic-bezier(.3,1.6,.5,1)}
.tl102 .plate{position:absolute;left:0;right:0;bottom:0;padding:10px 12px;background:linear-gradient(transparent,#0e0906f0 40%)}.tl102 .plate .nm{font:400 20px Georgia,serif;color:#f0cf7d}.tl102 .plate .cl{font-size:13px;color:#b39d80}
.tl102 .rows{display:flex;flex-direction:column;gap:10px}
.tl102 .tr{display:block;position:relative;border:1px solid #4a3826;border-radius:10px;background:linear-gradient(#251b13,#1b140e);padding:10px 14px;opacity:.3;transition:opacity .3s,border-color .3s}.tl102 .tr.live,.tl102 .tr.done{opacity:1}.tl102 .tr.live{border-color:#6b5236}
.tl102 .tr .top{display:flex;align-items:center;gap:10px}.tl102 .tr .ic{font-size:20px}.tl102 .tr .lbl{font:400 16px Georgia,serif;letter-spacing:.05em}.tl102 .tr .lbl small{display:block;font:500 12px "Segoe UI",system-ui,sans-serif;letter-spacing:0;color:#b39d80}
.tl102 .tr .gain{font:400 28px/1 Georgia,serif;color:#f0cf7d;min-width:80px;text-align:right;font-variant-numeric:tabular-nums}.tl102 .tr .gain.zero{color:#7d6b55}
.tl102 .tr .to{font:500 12.5px ui-monospace,Menlo,monospace;color:#b39d80;text-align:right;min-width:140px;margin-left:10px;white-space:nowrap}.tl102 .tr .to b{color:#efe3cc;font-weight:500}
.tl102 .pbar{position:relative;height:12px;margin-top:8px;border-radius:6px;background:#120c08;box-shadow:inset 0 1px 3px #000;overflow:hidden}.tl102 .pbar i{position:absolute;top:0;bottom:0;left:0;border-radius:6px}
.tl102 .pbar .old{background:linear-gradient(#8a6a34,#5e4520)}.tl102 .pbar .new{background:linear-gradient(#ffe7a0,#e2b14f 55%,#a87a2a)}.tl102 .pbar.xp .old{background:linear-gradient(#41678c,#2a4562)}.tl102 .pbar.xp .new{background:linear-gradient(#e6f4ff,#8cc4f2 50%,#3f7fbf)}
.tl102 .pbar.cf .new{background:linear-gradient(#f4ecb0,#cdb553 55%,#8e7a2a)}
.tl102 .brk:empty{display:none}.tl102 .brk{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;min-height:22px}.tl102 .brk span{font:500 12px ui-monospace,Menlo,monospace;padding:2px 8px;border-radius:4px;background:#2c2015;border:1px solid #4a3826;color:#b39d80;opacity:0;transition:opacity .25s}
.tl102 .brk span.in{opacity:1}.tl102 .brk span b{color:#efe3cc;font-weight:500}
.tl102 .tr.xprow{border-top:3px solid #6f9cc7}.tl102 .lvup,.tl102 .rkup{position:absolute;right:14px;top:-14px;padding:4px 14px;border-radius:6px;font:400 17px Georgia,serif;letter-spacing:.1em;opacity:0;transform:scale(.6);transition:opacity .25s,transform .35s cubic-bezier(.3,1.7,.5,1)}
.tl102 .lvup{color:#0f1d2b;background:linear-gradient(#e6f4ff,#8cc4f2)}.tl102 .rkup{color:#2a1408;background:linear-gradient(#fff2be,#e2b14f)}.tl102 .lvup.on,.tl102 .rkup.on{opacity:1;transform:scale(1)}
.tl102 .flash{position:absolute;inset:0;border-radius:10px;pointer-events:none;opacity:0}.tl102 .flash.go{animation:p102fl .9s ease-out}@keyframes p102fl{0%{opacity:.8;background:radial-gradient(ellipse at 30% 50%,#cfe8ff88,transparent 70%)}100%{opacity:0}}
.tl102 .fellbox{display:flex;gap:12px;align-items:center;border:1px solid #6a2a20;border-top:3px solid #d24a3a;border-radius:10px;padding:10px 14px;background:linear-gradient(#2a1512,#1b0f0c)}.tl102 .fellbox .ic{font-size:30px}.tl102 .fellbox b{font:400 18px Georgia,serif;color:#f3b49e}.tl102 .fellbox p{margin:2px 0 0}
.tl102 .flav{display:flex;align-items:center;gap:10px;margin-top:8px}.tl102 .flav img{width:52px;height:42px;object-fit:cover;border-radius:6px;border:1px solid #6b5236}.tl102 .flav q{font-style:italic;color:#d9c7a6}
.tl102 .tlft{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap}.tl102 .hint{font-size:12.5px;color:#8c7759}
body.calm .tl102 .tr,body.calm .lu102 .rcd{transition:none}@media(prefers-reduced-motion:reduce){.tl102 .flash.go{animation:none}.tl102 .tr,.lu102 .rcd{transition:none}}
@media(max-width:820px){.tl102 .tlg{grid-template-columns:1fr}.tl102 .figbox{height:200px}.tl102 h1{font-size:38px}.lu102 .cards{grid-template-columns:repeat(2,minmax(0,1fr))}.lu102 .luhd{grid-template-columns:1fr}.lu102 .fig{display:none}.rl102 .two{grid-template-columns:1fr}.tl102 .tr .to{min-width:0}}
@media(max-width:480px){.lu102 .cards{grid-template-columns:1fr}.p102scrim{padding:8px;place-items:start center}}`;document.head.appendChild(st)})();
