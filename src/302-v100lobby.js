/* 302-v100lobby — v1.0 THE ONLINE ROOM (his approved mock tools/plans/mock100/lobby.html #host #guest #full #phone #eight #extras +
   NOTES-lobby.md revisions 1–3; shots tools/plans/lobby100/ via SHOT=tools/plans/lobby100 node tools/tests/tonl100lb.js). Display only, plus the room-code route (lobby.code, server
   routes.js "v1.0 LOBBY ROOM" + the shared "v1.0 LOBBY ROOM" section of 111-onlcore; mirrored by the mock below).
   A LAST onlRoomHTML80 wrapper takes the finished room (118 + every wrapper up to 293) and lays it out again. The controls that carry
   state are MOVED with their attributes (table settings selects incl. 290's ⏱ turn timer, 189's Day/Night, 252's 🔒 password row, 206's
   🪙 Send, 271's Start / Ready / Stand up foot, 📣 crier, 🚪 leave, 137's countdown + ✕ Hold, the 👁 Watch / Back box of the unseated);
   plain buttons are rebuilt with the same data-onl actions (rsit, rhost, rkick, rsay), so every handler, route and ONLC rule is the old one.
   10a BANNER  event card + name, chips (Ranked/Custom · Day/Night · Free for all/Teams · in the room · seated · Ranked rank gate with its medal
               · 🔒 · region · ⏳ estimate), the ROOM CODE (⧉ Copy → "copied ✓"), 📣 Call the crier (host only: "N of 3 left · next in m:ss",
               "Crier spent"), 🚪 Close lobby (alone) / Exit lobby. No ✉ Invite / Invite by FID in the room (C1a: the code replaces them).
   10e LIST    always 8 rows (dashed "open"): 👑 or index · Domus-rank banner · name (+ you) · Glory medal + rank · house · Seat N (+ team) /
               standing / 👁 watching · ✓ ready / ○; host's 👑 Give host · ✕ Kick on hover/focus; a name opens the house card (252 hc98).
   10f/g SEATS portrait + token on a lit floor, 👑 host before the name, class · house, Glory medal chip, Domus-rank chip, ✓ Ready ribbon,
               the quick-chat bubble UNDER the token (234's bubbles, slot kept), team colour on the top edge; open seat dashed 🪑 "a CPU if
               empty at the horns" + Sit here; your seat holds 🪙 Send. 4 a row, centred; 5–8 seats = compact cards (#eight).
   10i         🧍 Standing strip before the horns ("no seat at the horns = watch"), 👁 Watching once the horns count down / sounded.
   QUICK CHAT  bottom right under the list, grouped Room / Taunts (taunt codes: 111-onlcore "v1.0 SERVER BATCH A" §7).
   C1a         Lobby Browser top bar: Join by code / FID (R-… a room, FID-… the room that lanista is in; 🔒 asks the password; refusals inline).
               House cards gain ⚔ Join while that house waits in a room (house.card now.room).
   C4a         medal100(k,px): the 8 Glory-rank medals (ONLC.RANKS) as inline SVG — seat chips 18 px, list rows 14 px, the banner's rank gate,
               house cards.
   Phones ≤600 px: banner wraps (code row, crier + exit side by side), seats 2 a row, settings 2 columns, the foot sticks to the bottom.
   Kill switch localStorage flavius_lobby100off=1 → the v0.96 room (the Join box, house-card Join and the route stay). Test tonl100lb. */
const LB100={off:false,copied:{},jmsg:'',jerr:false,jbusy:false,jlive:null,crT:0};
try{LB100.off=localStorage.getItem('flavius_lobby100off')==='1'}catch(e){}
const LB100_TEAM={A:'#4b86c6',B:'#e08a35',C:'#4fa36a',D:'#c75aa0'};
const LB100_ROOMQ=['ave','wait','horns','swap','seat','luck','vale'];
const LB100_TAUNT=['mlions','flwatch','damna','helmet','slaves','bucket','gate','betme'];

/* ---------------- C4a · Glory-rank medals ---------------- */
const MEDAL100={tiro:{m:['#b07a44','#6a4220'],ink:'#2a1708',sym:'rudis',rim:'#4a2c12'},novicius:{m:['#d08a56','#8a4a24'],ink:'#2e1406',sym:'sprig',rim:'#5a2e14'},
  gregarius:{m:['#d2a060','#8a6026'],ink:'#2a1a06',sym:'shield',rim:'#5a3a12'},veteranus:{m:['#c4cbd1','#646c74'],ink:'#1a1e22',sym:'swords',rim:'#3a4046'},
  primus:{m:['#f2f5f8','#9aa3ad'],ink:'#1e2630',sym:'column',rim:'#5a6470'},summa:{m:['#ffe39a','#b98a2a'],ink:'#3a2404',sym:'crown',rim:'#7a5414'},
  rudiarius:{m:['#ffe39a','#b98a2a'],ink:'#3a2404',sym:'gladius',rim:'#a3281f',enamel:1},invictus:{m:['#fff0b8','#c9952a'],ink:'#2a103a',sym:'eagle',rim:'#5b2a86',enamel:1,laurel:1}};
const MEDAL100_SYM={
  rudis:'<path d="M19 9h2v16h-2z"/><path d="M15 25h10v2.4H15z"/><path d="M19.2 27.4h1.6v4h-1.6z"/><circle cx="20" cy="32" r="1.4"/>',
  sprig:'<path d="M20 31 C20 24 21 18 24 11" fill="none" stroke="currentColor" stroke-width="1.6"/><ellipse cx="17" cy="20" rx="4.2" ry="2" transform="rotate(-35 17 20)"/><ellipse cx="24.5" cy="19" rx="4.2" ry="2" transform="rotate(30 24.5 19)"/><ellipse cx="18.5" cy="14" rx="3.6" ry="1.7" transform="rotate(-40 18.5 14)"/><ellipse cx="25" cy="13" rx="3.2" ry="1.6" transform="rotate(35 25 13)"/>',
  shield:'<path d="M12 10.5h16v9.5c0 6-8 10.5-8 10.5s-8-4.5-8-10.5z"/><circle cx="20" cy="19" r="2.4" fill="#ffffff55"/>',
  swords:'<g transform="rotate(40 20 20)"><path d="M19.1 7h1.8v18h-1.8z"/><path d="M16 25h8v2H16z"/><path d="M19.3 27h1.4v4h-1.4z"/></g><g transform="rotate(-40 20 20)"><path d="M19.1 7h1.8v18h-1.8z"/><path d="M16 25h8v2H16z"/><path d="M19.3 27h1.4v4h-1.4z"/></g>',
  column:'<path d="M12 10h16v2.5H12z"/><path d="M13.5 12.5h13v1.8h-13z"/><path d="M15 14.3h2v12h-2zM19 14.3h2v12h-2zM23 14.3h2v12h-2z"/><path d="M13.5 26.3h13v1.8h-13z"/><path d="M12 28.1h16v2.4H12z"/>',
  crown:'<path d="M11 27l1.8-13 5 6.2L20 11l2.2 9.2 5-6.2L29 27z"/><path d="M11 28.3h18V31H11z"/>',
  gladius:'<g transform="rotate(35 20 20)"><path d="M18.6 6.5L20 4.5l1.4 2v17.5h-2.8z"/><path d="M14.5 24h11v2.4h-11z"/><path d="M19 26.4h2v4.6h-2z"/><circle cx="20" cy="32" r="1.8"/></g>',
  eagle:'<path d="M20 12c1.8 0 2.8 1.4 2.8 2.8l2.2-.6-1.8 1.8C26 15 30 13 33 9c-1 5-4 9-8.5 10.5L26 25l-3-1.5L20 30l-3-6.5-3 1.5 1.5-5.5C11 18 8 14 7 9c3 4 7 6 9.8 7l-1.8-1.8 2.2.6c0-1.4 1-2.8 2.8-2.8z"/>'};
const lb100Rank=k=>(ONLC.RANKS||[]).find(r=>r.k===k)||(ONLC.RANKS||[])[0]||{k:'tiro',n:'Tiro'};
/* medal100 — the Glory-rank medal of rank key k at px pixels (inline SVG; metal + symbol climb with the rank) */
function medal100(k,px){const R=lb100Rank(k);const M=MEDAL100[R.k]||MEDAL100.tiro;px=px||18;const g='md100'+R.k;
  const laurel=M.laurel?Array.from({length:14},(_,i)=>{const a=(i/14)*Math.PI*2;const x=(20+18.2*Math.cos(a)).toFixed(1),y=(20+18.2*Math.sin(a)).toFixed(1);
    return `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.2" transform="rotate(${(a*180/Math.PI+90).toFixed(0)} ${x} ${y})" fill="#e7c568"/>`}).join(''):'';
  const r1=M.laurel?16:18,r2=M.laurel?14.6:16.4,r3=M.laurel?12.8:M.enamel?14.4:16,sc=M.laurel?.72:M.enamel?.78:.86;
  return `<svg class="medal100" width="${px}" height="${px}" viewBox="0 0 40 40" role="img" aria-label="${esc2(R.n)}"><defs><radialGradient id="${g}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${M.m[0]}"/><stop offset="1" stop-color="${M.m[1]}"/></radialGradient></defs>${laurel}<circle cx="20" cy="20" r="${r1}" fill="${M.rim}"/>${M.enamel?`<circle cx="20" cy="20" r="${r2}" fill="${M.rim}" stroke="#ffe39a" stroke-width="1"/>`:''}<circle cx="20" cy="20" r="${r3}" fill="url(#${g})"/><g fill="${M.ink}" color="${M.ink}" transform="translate(20 20) scale(${sc}) translate(-20 -20)">${MEDAL100_SYM[M.sym]}</g><ellipse cx="15" cy="12" rx="6" ry="3" fill="#ffffff30" transform="rotate(-25 15 12)"/></svg>`}
const lb100Gr=(k,px)=>{const R=lb100Rank(k);return `<span class="lb100-gr" title="${esc2(_T('Glory rank')+' · '+R.n)}">${medal100(R.k,px||18)}<span class="gt84" translate="no">${esc2(R.n)}</span></span>`};
const lb100Dr=k=>{if(!k||typeof dr98URI!=='function')return '';const n=dr98Name(k);return `<span class="lb100-dr" title="${esc2(_T('Domus rank')+' · '+n)}"><img class="dr98c" src="${dr98URI(k)}" alt="" data-dr98="${esc2(k)}">${esc2(n)}</span>`};

/* ---------------- the room, laid out again ---------------- */
const lb100Mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const lb100Nm=s=>String(s||'').replace(/⟦\d+⟧/g,'');  /* 127 marks names for its house chips — the room shows the house on its own line */
const lb100Now=()=>typeof onlNow82==='function'?onlNow82():Date.now();
const lb100House=id=>{try{const d=typeof onlDomOf82==='function'?onlDomOf82(id):null;return d?onlHouse82(d):''}catch(e){return ''}};
/* 118's 📣 handler also appends its own time to L.cry after the reply — a pushed update may already hold that call, so calls < 5 s apart count once */
function lb100Crier(L){const cry=[];for(const t of (L.cry||[]).slice().sort((a,b)=>a-b))if(!cry.length||t-cry[cry.length-1]>=5000)cry.push(t);
  const left=Math.max(0,ONLC.RATE.cryMax-cry.length);const last=cry[cry.length-1]||0;const until=left?last+ONLC.RATE.cryGap:0;
  return {left,until:until>lb100Now()?until:0}}
function lb100CrierHTML(b,L){const c=lb100Crier(L);const full=(L.players||[]).length>=(L.seats|0);
  if(!c.left){b.disabled=true;b.title=_T('The crier has called three times.');b.innerHTML=`📣 <span>${_T`Crier spent`}<small>${_T`0 of ${ONLC.RATE.cryMax} left`}</small></span>`;return}
  if(c.until){b.disabled=true;b.title=_T('The crier rests 2 min between calls');b.dataset.lb100cr=String(c.until)}else if(full)b.disabled=true;
  b.innerHTML=`📣 <span>${_T`Call the crier`}<small>${_T`${c.left} of ${ONLC.RATE.cryMax} left`}${c.until?` · <i class="lb100-nx">${_T`next in ${lb100Mmss(c.until-lb100Now())}`}</i>`:''}</small></span>`}
function lb100Room(h,L,grey){const T=document.createElement('template');T.innerHTML=h;const R=T.content.querySelector('#onlRoom80');if(!R)return h;
  const q=s=>R.querySelector(s);const take=s=>{const e=q(s);if(e)e.remove();return e};const frag=s=>{const t=document.createElement('template');t.innerHTML=s;return t.content};
  const me=onlMe80();const hostId=L.host&&L.host.id;const host=hostId===me&&!grey;const P=L.players||[];
  const members=(L.members&&L.members.length?L.members:P.filter(p=>!/^bot/.test(p.id||'')));const member=members.some(m=>m.id===me);const seatedMe=P.some(p=>p.id===me);
  const horns=!!grey||L.startAt!=null;const tm=typeof ONLC.seatTeams==='function'?ONLC.seatTeams(L):null;const off=L.off||{};
  const drOf=id=>(members.find(m=>m.id===id)||P.find(p=>p.id===id)||{}).dr||(L.host&&L.host.id===id?L.host.dr:'');
  const lan=id=>{try{const v=typeof V89L!=='undefined'&&V89L.names[id];return v&&v.n?v.n:''}catch(e){return ''}};
  /* the pieces that carry state */
  const ev=take('.r80-ev'),h3=take('.r80-ttl h3'),rk=take('.r80-tags .rk99'),pwb=take('.r80-tags .pw98b'),rg=take('.r80-tags .rg98t'),eta=take('.eta100');
  const call=take('[data-onl="rcall"]'),leave=take('[data-onl="leave"]'),cd=take('.cd83'),over=take('.r80-over'),set=take('.r80-set'),tbl=take('.tbl82'),busy=take('.onl-busy'),hoff=take('.r89-hostoff');
  const go=take('.r80-go'),snd=take('.snd92');const say=new Map([...R.querySelectorAll('[data-onl="rsay"]')].map(b=>[b.dataset.v,b]));
  const oldSeats=[...R.querySelectorAll('.r80-seats > .r80-seat')];
  /* 10a · the banner */
  const nm=k=>esc2(lb100Rank(k).n);const nSeat=P.length;const room=members.length;const fans=(L.stands||[]).length;
  const chips=[L.night?`<span class="lb100-c">${_T`🌙 Night`}</span>`:`<span class="lb100-c">${_T`☀ Day`}</span>`,L.team?`<span class="lb100-c">${_T`Teams`} ${esc2((ONLC.teamKeys?ONLC.teamKeys(L):['A','B']).join(' · '))}</span>`:`<span class="lb100-c">${_T`Free for all`}</span>`,
    `<span class="lb100-c dim">${_T`👥 ${room}/${ONLC.ROOM_MAX} in the room`}</span>`,`<span class="lb100-c dim">${_T`🪑 ${nSeat}/${L.seats|0} seated`}</span>`,fans?`<span class="lb100-c dim">🎟 ${fans}</span>`:'',
    L.ranked?`<span class="lb100-c lb100-gate" title="${esc2(_T('Ranked: one rank only'))}">${medal100(L.rank||'tiro',16)}${_T`${nm(L.rank||'tiro')} only`}</span>`:''].join('');
  const ban=document.createElement('div');ban.className='lb100-ban';if(ev)ban.appendChild(ev);
  const t=document.createElement('div');t.className='lb100-t';if(h3)t.appendChild(h3);const tags=document.createElement('div');tags.className='r80-tags lb100-chips';if(rk)tags.appendChild(rk);tags.appendChild(frag(chips));
  if(pwb)tags.appendChild(pwb);if(rg)tags.appendChild(rg);if(eta)tags.appendChild(eta);t.appendChild(tags);ban.appendChild(t);ban.appendChild(frag('<span class="lb100-sp"></span>'));
  if(!grey&&L.status==='waiting'){const code=ONLC.roomCode100(L.id);const ok=Date.now()-(LB100.copied[code]||0)<2500;
    ban.appendChild(frag(`<div class="lb100-code" title="${esc2(_T('Friends type this in the Lobby Browser → Join by code'))}"><span class="l">${_T`Room code`}</span><span class="v"><b translate="no">${code}</b><button type="button" class="lb100-cp" data-lb100copy="${code}" aria-label="${esc2(_T('Copy the room code'))}">${_T`⧉ Copy`}</button><span class="lb100-ok" ${ok?'':'hidden'}>${_T`copied ✓`}</span></span></div>`))}
  const acts=document.createElement('div');acts.className='lb100-acts';if(call&&host){lb100CrierHTML(call,L);call.classList.add('lb100-cr');acts.appendChild(call)}
  if(leave){leave.classList.add('lb100-exit');acts.appendChild(leave)}if(acts.childNodes.length)ban.appendChild(acts);
  /* 10f/10g · the seats */
  const cmp=(L.seats|0)>4;const seats=document.createElement('div');seats.className='r80-seats lb100-seats'+(cmp?' lb100-cmp':'');
  const figH=cmp?90:128;
  for(let i=0;i<(L.seats|0);i++){const p=P[i];const team=tm&&tm[i];const old=oldSeats[i];const s=document.createElement('div');
    s.style.cssText=team&&LB100_TEAM[team]?`--tc100:${LB100_TEAM[team]}`:'';const tlab=team?`<span class="lb100-team">${_T`TEAM ${esc2(team)}`}</span>`:'';
    if(!p){s.className='r80-seat empty open lb100-s lb100-open'+(team?' tm':'');
      s.innerHTML=`${tlab}<span class="lb100-num">${_T`Seat ${i+1}`}</span><span class="lb100-ch" aria-hidden="true">🪑</span><div class="r80-who"><b>${_T`Open seat`}</b><small>${horns?_T('a CPU takes it'):_T('a CPU if empty at the horns')}</small></div>`;
      const sit=old&&old.querySelector('[data-onl="rsit"]');if(sit){sit.textContent=_T('Sit here');sit.classList.add('lb100-sit');s.appendChild(sit)}seats.appendChild(s);continue}
    const bot=/^bot/.test(p.id||'');const k=p.kit||{};const mine=p.id===me;
    s.className=`r80-seat on lb100-s${mine?' me':''}${team?' tm':''}${off[p.id]?' off89':''}`;
    const por=k.cls&&typeof onl80Face==='function'?onl80Face({cls:k.cls,look:k.look,name:p.name},'sm'):'';const fig=k.cls?onlFig(k.cls,k.look,figH):'<span class="onl-rq">?</span>';
    const cls=k.cls?`<span class="gt84" translate="no">${esc2((CLASSES[k.cls]||{}).name||'')}</span>`:'';const hs=bot?_T('CPU'):mine?_T('you'):esc2(lb100House(p.id)||lan(p.id));
    s.innerHTML=`${tlab}<span class="lb100-num">${_T`Seat ${i+1}`}</span>${p.ready?`<span class="lb100-rdy">${_T`✓ Ready`}</span>`:''}
      <div class="lb100-stage"><span class="lb100-por">${por}</span><span class="lb100-tok">${fig}</span></div>${r96BubHTML(L,p.id,'r96-bub lb100-bub')}
      <div class="r80-who"><b ${bot?'':`data-hc98="${esc2(p.id)}" class="hc98n" role="button" tabindex="0" title="${esc2(_T('Open the house card'))}"`}>${p.id===hostId?`<span class="lb100-crown" title="${esc2(_T('Host'))}">👑</span> `:''}${esc2(lb100Nm(p.name))}</b>
      <small class="lb100-cl">${cls}${cls&&hs?' · ':''}${hs}</small>${off[p.id]?`<small class="r89-rc">${_T`reconnecting…`}</small>`:''}</div>
      <div class="lb100-rks">${lb100Gr(p.rank,18)}${lb100Dr(drOf(p.id))}</div>`;
    const mv=old&&old.querySelector('.r80-tm');if(mv)s.appendChild(mv);if(mine&&snd){snd.classList.add('lb100-snd');s.appendChild(snd)}seats.appendChild(s)}
  /* 10i · standing / watching */
  const standing=members.filter(m=>!P.some(p=>p.id===m.id));const stands=(L.stands||[]);let watch='';
  if(standing.length||stands.length){const chip=(x,pre)=>`<span class="lb100-w">${x.kit&&x.kit.cls&&typeof onl80Face==='function'?`<span class="lb100-mp">${onl80Face({cls:x.kit.cls,look:x.kit.look,name:x.name},'xs')}</span>`:''}${pre}${esc2(x.id===me?_T('You'):(lb100Nm(x.name)||_T('A patron')))}</span>`;
    watch=`<div class="lb100-watch ${horns?'on':''}"><span class="h">${horns?_T('👁 Watching'):_T('🧍 Standing')}</span>${standing.map(x=>chip(x,'')).join('')}${stands.map(x=>chip(x,'🎟 ')).join('')}
      <span class="x2">${horns?_T('not seated at the horns → they watch · not counted as players'):_T('no seat at the horns = 👁 watch (not a player)')}</span></div>`}
  /* table settings: the host's controls, the read-only grid for everyone else */
  const box=document.createElement('div');box.className='lb100-set';const hn=esc2(lb100Nm(L.host&&L.host.name));
  box.appendChild(frag(`<div class="lb100-ph"><h4>${_T`Table settings`}</h4><small>${set?_T('you are the host — changes reach everyone'):_T`set by the host · ${hn}`}</small></div>`));
  if(set)box.appendChild(set);else{const c=typeof ONLC.ttOf100==='function'?ONLC.ttOf100(L):{t:0,d:0};const rule=ONLC.abandonRule?ONLC.abandonRule(L):'cpu';
    const f=(l,v)=>`<label>${l}<span class="f">${v}</span></label>`;
    box.appendChild(frag(`<div class="r80-rules rc-sub lb100-ro">${f(_T('Event'),`<span class="gt84" translate="no">${esc2(onlEvName(L.ev))}</span>`)}${f(_T('City'),esc2(onlCityName(L.loc)))}${f(_T('Seats'),L.seats|0)}${f(_T('Time'),L.night?_T('🌙 Night'):_T('☀ Day'))}
      ${f(_T('⏱ Turn timer'),c.t?_T`${c.t} s · decisions ${c.d} s`:_T('Off'))}${f(_T('Stands'),L.standsOff?_T('watch only'):_T('act in round 1'))}${f(_T('Ticket'),L.free?_T('free'):L.ticket?_T`${L.ticket|0} coin`:_T('none'))}
      ${L.team?f(_T('Teams'),`${L.teams||2}${L.ranked||L.autoBal?' · '+_T('balanced'):''}`):f(_T('Leaving'),L.ranked?_T('Damnatio'):rule==='fate'?_T('eliminated'):_T('a CPU fights on'))}${L.pw?f(_T('Password'),_T('🔒 set')):''}</div>`))}
  if(tbl)box.appendChild(tbl);if(hoff)box.appendChild(hoff);
  /* the foot: who is not ready, Start / Ready */
  const foot=document.createElement('div');foot.className='r99-foot lb100-foot';let why='';
  if(busy)why=busy.textContent.trim();else if(host){const nr=P.filter(p=>p.id!==hostId&&!/^bot/.test(p.id||'')&&!p.ready).map(p=>lb100Nm(p.name));const empty=Math.max(0,(L.seats|0)-P.length);
    why=nr.length?_T`⌛ ${nr.join(', ')} not ready`:'';if(empty)why+=(why?' — ':'')+_T`${empty} empty seat${empty===1?'':'s'} go to CPUs`}
  else if(member&&!grey)why=_T('Waiting for the host to start');
  foot.appendChild(frag(`<span class="lb100-why">${esc2(why)}</span>`));if(go)foot.appendChild(go);
  /* 10e · the list (8 rows) */
  const rowsH=[];const order=members.slice().sort((a,b)=>(a.id===hostId?-1:b.id===hostId?1:0));
  for(let i=0;i<ONLC.ROOM_MAX;i++){const m=order[i];if(!m){rowsH.push(`<div class="lb100-row empty"><span class="idx">${i+1}</span><span class="slot"></span><span>${_T`open`}</span></div>`);continue}
    const si=P.findIndex(p=>p.id===m.id);const p=si>=0?P[si]:null;const mine=m.id===me;const dr=drOf(m.id);const hs=lb100House(m.id)||lan(m.id);
    const st=p?`<span class="st s">${_T`Seat ${si+1}`}${tm&&tm[si]?' · '+esc2(tm[si]):''}</span>`:`<span class="st">${horns?_T('👁 watching'):_T('standing')}</span>`;
    const ctl=host&&!mine?`<span class="lb100-ra"><button type="button" class="btn tksm" data-onl="rhost" data-v="${esc2(m.id)}" title="${esc2(_T('Give the room to them'))}">${_T`👑 Give host`}</button><button type="button" class="btn tksm lb100-kick" data-onl="rkick" data-v="${esc2(m.id)}" title="${esc2(_T('Remove from the room (5 minutes)'))}">${_T`✕ Kick`}</button></span>`:'';
    rowsH.push(`<div class="lb100-row r96-u ${mine?'me':''} ${off[m.id]?'off89':''} ${ctl?'ctl':''}" data-u96="${esc2(m.id)}" tabindex="${ctl?0:-1}"><span class="cr">${m.id===hostId?`<span title="${esc2(_T('Host'))}">👑</span>`:`<span class="idx">${i+1}</span>`}</span>
      <span class="bnr">${dr&&typeof dr98URI==='function'?`<img class="dr98c" src="${dr98URI(dr)}" alt="" title="${esc2(dr98Name(dr))}" data-dr98="${esc2(dr)}">`:''}</span>
      <span class="who"><b><span data-hc98="${esc2(m.id)}" class="hc98n" role="button" tabindex="0" title="${esc2(_T('Open the house card'))}">${esc2(lb100Nm(m.name))}</span>${mine?` <i class="lb100-you">· ${_T`you`}</i>`:''}${p?'':r96BubHTML(L,m.id,'r96-lb lb100-lb')}</b>
      <small>${medal100(m.rank||(p&&p.rank)||'tiro',14)} <span class="gt84" translate="no">${nm(m.rank||(p&&p.rank)||'tiro')}</span>${hs?' · '+esc2(hs):''}${off[m.id]?` · <span class="r89-rc">${_T`reconnecting…`}</span>`:''}</small></span>
      ${st}<span class="ok ${p&&p.ready?'':'no'}">${p&&!(m.id===hostId&&!p.ready)?(p.ready?'✓':'○'):''}</span>${ctl}</div>`)}
  /* quick chat: Room · Taunts */
  let qc='';if(say.size&&member&&!grey){const grp=(ks,cls)=>ks.filter(k=>say.has(k)).map(k=>{const b=say.get(k);b.className='lb100-q';return b.outerHTML}).join('');
    const a=grp(LB100_ROOMQ),b=grp(LB100_TAUNT);
    qc=`<div class="lb100-qc"><div class="lb100-ph"><h4>${_T`Quick chat`}</h4><small>${_T`pops under your token · 6 s`}</small></div>${a?`<div class="lb100-qg">${_T`Room`}</div><div class="lb100-qcs">${a}</div>`:''}${b?`<div class="lb100-qg">${_T`Taunts`}</div><div class="lb100-qcs tn">${b}</div>`:''}</div>`}
  const side=`<div class="lb100-side"><div class="lb100-ph"><h4>${_T`In the room`}</h4><span class="n">${room}/${ONLC.ROOM_MAX}</span><span class="lb100-sp"></span><small>${_T`✓ ready · ○ not yet`}</small></div>
    <div class="lb100-list">${rowsH.join('')}</div><div class="lb100-leg">${host?_T('Hover a lanista: 👑 Give host · ✕ Kick (5 min). Click a name: house card.'):_T('Click a name: house card (record, gladiators, ★ Follow).')}</div>${qc}</div>`;
  /* put it together */
  const out=document.createElement('div');out.className=`card2 onl-room80 lb100${grey?' grey':''}`;out.id='onlRoom80';out.dataset.room=R.dataset.room||L.id;out.appendChild(ban);
  const grid=document.createElement('div');grid.className='lb100-grid';const main=document.createElement('div');main.className='lb100-main';
  if(over)main.appendChild(over);if(cd)main.appendChild(cd);main.appendChild(seats);if(watch)main.appendChild(frag(watch));main.appendChild(box);if(foot.querySelector('button')||why)main.appendChild(foot);
  grid.appendChild(main);grid.appendChild(frag(side));out.appendChild(grid);
  const d=document.createElement('div');d.appendChild(out);return d.innerHTML}
{const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){const h=base.apply(this,arguments);if(LB100.off||!L||typeof h!=='string')return h;try{return lb100Room(h,L,grey)}catch(e){console.error(e);return h}}}

/* the crier's "next in m:ss" counts down while the room shows (one timer, only then) */
function lb100Tick(){LB100.crT=0;const b=document.querySelector('#onl #onlRoom80 [data-lb100cr]');if(!b)return;const left=(+b.dataset.lb100cr)-lb100Now();
  if(left<=0){try{onlRedraw()}catch(e){}return}const i=b.querySelector('.lb100-nx');const tx=_T`next in ${lb100Mmss(left)}`;if(i&&i.textContent!==tx)i.textContent=tx;LB100.crT=setTimeout(lb100Tick,1000)}
{const base=onlRedraw;onlRedraw=function(){const r=base.apply(this,arguments);try{if(!LB100.crT&&document.querySelector('#onl #onlRoom80 [data-lb100cr]'))LB100.crT=setTimeout(lb100Tick,1000)}catch(e){}return r}}

/* ⧉ copy the room code */
async function lb100Copy(code){let ok=false;try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(code);ok=true}}catch(e){}
  if(!ok){try{const ta=document.createElement('textarea');ta.value=code;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(ta);ta.select();ok=document.execCommand('copy');ta.remove()}catch(e){}}
  return ok}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-lb100copy]');if(!b)return;e.preventDefault();e.stopPropagation();const code=b.dataset.lb100copy;
  lb100Copy(code).then(ok=>{LB100.copied[code]=Date.now();window.__lb100copied=code;const s=b.parentNode&&b.parentNode.querySelector('.lb100-ok');if(s){s.hidden=false;s.textContent=ok?_T('copied ✓'):_T('select it and copy')}
    setTimeout(()=>{const x=document.querySelector('#onl .lb100-ok');if(x&&Date.now()-(LB100.copied[code]||0)>=2400)x.hidden=true},2600)})},true);
/* the host's actions on a row: shown on hover and when the row has focus (keyboard) */

/* ---------------- C1a · the Lobby Browser: Join by code / FID ---------------- */
function lb100JoinHTML(){if(typeof onlIsGuest82==='function'&&onlIsGuest82())return '';
  return `<form class="lb100-jb" data-lb100jf="1" autocomplete="off"><label class="l" for="lb100In">${_T`Join by code / FID`}</label><input class="tin" id="lb100In" maxlength="16" spellcheck="false" placeholder="R-XXXXX · FID-XXXXXX" aria-describedby="lb100Msg">
    <button type="submit" class="btn primary" ${LB100.jbusy?'disabled':''}>${_T`Join ▸`}</button></form>`}
function lb100MsgHTML(){const live=LB100.jlive?` <button type="button" class="btn tksm" data-onl="watch" data-v="${esc2(LB100.jlive)}">${_T`👁 Watch`}</button>`:'';
  return `<div class="lb100-jmsg ${LB100.jerr?'err':''}" id="lb100Msg" role="status">${LB100.jmsg?esc2(LB100.jmsg)+live:`<small>${_T`Room code (R-…) → that room · FID (FID-…) → the room that lanista is in now.`}</small>`}</div>`}
{const base=onlLobbyHTML;onlLobbyHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||h.indexOf('onl-lbtop')<0)return h;const jb=lb100JoinHTML();if(!jb)return h;
    const T=document.createElement('template');T.innerHTML=h;const top=T.content.querySelector('.onl-lbtop');if(!top||top.querySelector('.lb100-jb'))return h;
    const acts=top.querySelector(':scope > .acts');const f=document.createElement('template');f.innerHTML=jb;if(acts)top.insertBefore(f.content,acts);else top.appendChild(f.content);
    const m=document.createElement('template');m.innerHTML=lb100MsgHTML();top.after(m.content);return T.innerHTML}catch(e){console.error(e);return h}}}
/* the room behind a code, when this page already knows it (for the password window's title) */
function lb100Known(code){const q=ONLC.codeParse100(code);if(!q)return null;const list=ONL.lobbies||[];
  if(q.room){const L=ONLC.roomByCode100(list,q.room);if(L)return L}return null}
async function lb100Join(raw){raw=String(raw||'').trim();LB100.jlive=null;if(!ONLC.codeParse100(raw)){LB100.jmsg=_T('Type a room code (R-…) or a FID (FID-…).');LB100.jerr=true;onlRedraw();return}
  LB100.jbusy=true;LB100.jmsg=_T('Looking…');LB100.jerr=false;onlRedraw();
  const go=pw=>onlReq80('lobby.code',{code:raw,...(pw!=null?{pw}:{})});let L=null;
  try{try{L=await go()}catch(e){if(!e||e.code!=='pw_need')throw e;const X=lb100Known(raw)||(e.extra&&e.extra.room)||e.room||{ev:'democritus',loc:1,host:{name:''}};let wrong='';
      for(;;){const pw=await pw98Ask(X,wrong);if(pw==null)throw pw98Cancel();try{L=await go(pw);break}catch(e2){if(e2&&e2.code==='pw_bad'){wrong=errText92(e2);continue}throw e2}}}
    const R=L&&(L.lobby||L);LB100.jmsg='';try{ONL.lobbies=await NET.req('lobby.list')}catch(e){}const inp=document.getElementById('lb100In');if(inp)inp.value='';
    if(R&&R.host)onlToast80(_T`🪑 You joined ${esc2(R.host.name||'')}’s room.`)}
  catch(e){if(e&&e.code==='pw_cancel'){LB100.jmsg=''}else{LB100.jmsg=errText92(e,_T('That code opens no room.'));LB100.jerr=true;const x=e&&(e.extra||e);if(e&&e.code==='code_live'&&x&&x.id)LB100.jlive=x.id}}
  finally{LB100.jbusy=false;try{onlRedraw()}catch(e){}}}
document.addEventListener('submit',e=>{const f=e.target&&e.target.closest&&e.target.closest('#onl form[data-lb100jf]');if(!f)return;e.preventDefault();e.stopPropagation();if(LB100.jbusy)return;
  const v=(f.querySelector('#lb100In')||{}).value;lb100Join(v)},true);

/* ---------------- C1a · the house card: ⚔ Join while that house waits in a room ---------------- */
if(typeof hc98HTML==='function'){const base=hc98HTML;hc98HTML=function(r){const h=base.apply(this,arguments);try{const T=document.createElement('template');T.innerHTML=h;
    /* the Glory ranks as medals */
    for(const c of T.content.querySelectorAll('.onl-rk')){const k=([...c.classList].find(x=>/^onl-rk-/.test(x))||'').slice(7);if(!k)continue;const n=c.firstChild;
      if(n&&n.nodeType===3){const s=document.createElement('template');s.innerHTML=medal100(k,16)+' ';n.nodeValue=n.nodeValue.replace(/^\S+\s*/,'');c.insertBefore(s.content,n)}c.classList.add('lb100-gr')}
    const N=(r&&r.now)||{};const myRoom=typeof onlMyLobby==='function'?onlMyLobby():null;const guest=typeof onlIsGuest82==='function'&&onlIsGuest82();
    if(N.st==='room'&&N.room&&!r.mine&&!guest&&ONL.acct&&!(myRoom&&myRoom.id===N.room)){const acts=T.content.querySelector('.acts');
      const line=`<div class="lb100-hcnow">${_T`🟢 In a waiting room`}${N.ev?` · <span class="gt84" translate="no">${esc2(onlEvName(N.ev))}</span>`:''}${N.seats?` · ${_T`${N.seated|0}/${N.seats|0} seated`}`:''}${N.code?` · <b translate="no">${esc2(N.code)}</b>`:''}</div>`;
      const btn=`<button type="button" class="btn tksm primary" data-lb100hj="${esc2(N.room)}" ${myRoom&&myRoom.status==='waiting'?'disabled':''} title="${esc2(myRoom&&myRoom.status==='waiting'?_T('Leave your own room first.'):_T('Join their room'))}">${_T`⚔ Join`}</button>`;
      if(acts){acts.insertAdjacentHTML('beforebegin',line);acts.insertAdjacentHTML('afterbegin',btn)}}
    return T.innerHTML}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.hc98pop [data-lb100hj]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();const id=b.dataset.lb100hj;
  const bg=b.closest('.hc98pop');if(bg)bg.remove();onlDo(async()=>{const L=await onlReq80('lobby.join',{id});try{ONL.lobbies=await NET.req('lobby.list')}catch(x){}if(ONL.tab!=='lobby'&&ONL.tab!=='play')ONL.tab='lobby';
    if(L&&L.host)onlToast80(_T`🪑 You joined ${esc2(L.host.name||'')}’s room.`);try{onlRedraw()}catch(x){}})},true);

/* ---------------- the mock server (as routes.js "v1.0 LOBBY ROOM") ---------------- */
if(typeof MOCK_ROUTES!=='undefined'){
  MOCK_ROUTES['lobby.code']=(w,d,me)=>{d=d||{};if(typeof mockLook89==='function')mockLook89(w,me);const q=ONLC.codeParse100(d.code);if(!q)throw onlErr82(_T('Type a room code (R-…) or a FID (FID-…).'),'code_bad');
    const A=w.accounts[me];const g=typeof mockGroup==='function'?mockGroup(w,me):[];const f=g.some(x=>x.strikes>=ONLC.STRIKES_OUT);const list=Object.values(w.lobbies||{}).filter(L=>!!L.flag===f);let L=null;
    const inRoom=(R,a)=>(R.players||[]).some(p=>p.id===a)||(R.members||[]).some(m=>m.id===a);
    if(q.room){L=ONLC.roomByCode100(list,q.room);if(!L&&!q.fid){const lv=list.filter(x=>x.status==='live'&&ONLC.roomCode100(x.id)===q.room)[0];if(lv)throw onlErr82(_T('That room has started — watch it from the list.'),'code_live',{live:true,id:lv.id})}}
    if(!L&&q.fid){const F=mockByFid89(w,q.fid);if(!F){if(!q.room)throw onlErr82(_T('No lanista with that FID is in a room.'),'code_fid_none')}
      else{if(F.A.id===me)throw onlErr82(_T('That is your own FID.'),'code_self');const R0=list.find(x=>x.status==='waiting'&&inRoom(x,F.A.id));
        if(!R0||ONLC.privOf89(F.A).hide||ONLC.invWhy89(F.A,{domus:A&&A.domus}))throw onlErr82(_T('That lanista is not in a room you can join.'),'code_fid_none');L=R0}}
    if(!L)throw onlErr82(_T('No open room with that code.'),'code_none');if(inRoom(L,me))return L;
    try{return MOCK_ROUTES['lobby.join'](w,{id:L.id,...(d.pw!=null?{pw:d.pw}:{})},me)}catch(e){if(e&&(e.code==='pw_need'||e.code==='pw_bad'))e.extra={...(e.extra||{}),room:{id:L.id,ev:L.ev,loc:L.loc,host:{name:L.host&&L.host.name}}};throw e}};
  {const base=MOCK_ROUTES['house.card'];if(base)MOCK_ROUTES['house.card']=(w,d,me)=>{const r=base(w,d,me);try{if(r&&r.now&&r.now.st==='room'&&r.domus&&r.domus.id){const D=mockDomus82(w,r.domus.id);
      const R0=D&&Object.values(w.lobbies||{}).find(x=>x.status==='waiting'&&((x.players||[]).some(p=>p.id===D.owner)||(x.members||[]).some(m=>m.id===D.owner)));
      if(R0)r.now={...r.now,room:R0.id,code:ONLC.roomCode100(R0.id),ranked:!!R0.ranked,ev:R0.ev,seated:(R0.players||[]).length,seats:R0.seats|0}}}catch(e){}return r}}
  if(typeof NEED_DOMUS82!=='undefined')NEED_DOMUS82.add('lobby.code')}

{const css=document.createElement('style');css.id='v100lobbycss';css.textContent=`
#onl .lb100{padding:12px;border:1px solid #6a5036;background:linear-gradient(#211913,#1a130e)}
#onl .lb100 .lb100-ban{display:flex;align-items:center;gap:14px;padding:10px 14px;border:1px solid var(--gold,#d6ab4c);border-radius:10px;background:linear-gradient(100deg,#3a2614 0%,#2a1d12 46%,#1d150e 100%);flex-wrap:wrap}
#onl .lb100 .lb100-ban .r80-ev{flex:none}#onl .lb100 .lb100-ban .r80-ev .cimg{width:58px}
#onl .lb100 .lb100-t{min-width:0;flex:1 1 320px}#onl .lb100 .lb100-t h3{margin:0;font:400 25px/1.15 var(--display,Georgia),serif;color:#f0cf7d;letter-spacing:.02em}#onl .lb100 .lb100-t h3 small{font-size:17px;color:#e8dcc6}
#onl .lb100 .lb100-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;align-items:center}
#onl .lb100 .lb100-c{display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:999px;border:1px solid #5a4630;background:#160f0b;font:500 12px ui-monospace,Menlo,monospace;color:#eadfc8;white-space:nowrap}
#onl .lb100 .lb100-c.dim{color:#b9a88c}#onl .lb100 .lb100-gate{border-color:#8a6a3a}#onl .lb100 .eta100{font-size:12px}
#onl .lb100 .lb100-sp{flex:0 0 0}#onl .lb100 .lb100-snd small{margin-left:auto;white-space:nowrap}#onl .lb100 .lb100-snd{flex-wrap:wrap;justify-content:center}
#onl .lb100 .lb100-code{display:flex;flex-direction:column;gap:2px;padding:5px 10px;border:1px dashed #8a6a3a;border-radius:8px;background:#140e09}
#onl .lb100 .lb100-code .l{font:500 10.5px ui-monospace,Menlo,monospace;letter-spacing:.14em;color:#b9a88c;text-transform:uppercase}
#onl .lb100 .lb100-code .v{display:flex;align-items:center;gap:8px;white-space:nowrap}#onl .lb100 .lb100-code .v b{font:600 19px ui-monospace,Menlo,monospace;color:#f0cf7d;letter-spacing:.08em}
#onl .lb100 .lb100-cp{font:500 12px system-ui,sans-serif;padding:2px 8px;border-radius:5px;border:1px solid #5a4630;background:#2a1f17;color:#eadfc8;cursor:pointer}#onl .lb100 .lb100-cp:hover,#onl .lb100 .lb100-cp:focus-visible{border-color:#f0cf7d}
#onl .lb100 .lb100-ok{font:500 11px ui-monospace,Menlo,monospace;color:#8fd27a}
#onl .lb100 .lb100-acts{display:flex;gap:8px;align-items:center}#onl .lb100 .lb100-acts .btn{width:auto;margin:0;white-space:nowrap}
#onl .lb100 .lb100-cr{display:inline-flex;align-items:center;gap:7px;text-align:left;line-height:1.2}#onl .lb100 .lb100-cr span small{display:block;font:500 11px ui-monospace,Menlo,monospace;color:#b9a88c}#onl .lb100 .lb100-cr .lb100-nx{font-style:normal}
#onl .lb100 .lb100-exit{border-color:#8a3a2e;background:linear-gradient(#4a1d17,#2e120e);color:#f3d1c8}
#onl .lb100 .lb100-grid{display:grid;grid-template-columns:minmax(0,1fr) 370px;gap:14px;margin-top:12px;align-items:stretch}
#onl .lb100 .lb100-main{min-width:0;border:1px solid #4a3a26;border-radius:10px;padding:12px;background:rgba(255,255,255,.02);display:flex;flex-direction:column}
#onl .lb100 .lb100-seats{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
#onl .lb100 .lb100-s{position:relative;width:calc(25% - 9px);min-width:150px;max-width:220px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:0;padding:10px;min-height:280px;border:1px solid #6a5036;border-radius:10px;background:linear-gradient(#2b2017,#1d150f);box-sizing:border-box}
#onl .lb100 .lb100-s.me{border-color:#d6ab4c;box-shadow:0 0 0 1px #d6ab4c55}
#onl .lb100 .lb100-s.tm{border-top:4px solid var(--tc100,#4b86c6)}#onl .lb100 .lb100-team{position:absolute;top:6px;left:8px;font:500 10.5px ui-monospace,Menlo,monospace;letter-spacing:.12em;color:var(--tc100,#8dbbe8);filter:brightness(1.35)}
#onl .lb100 .lb100-num{position:absolute;top:6px;right:8px;font:500 11px ui-monospace,Menlo,monospace;color:#9a8a72}
#onl .lb100 .lb100-rdy{position:absolute;top:28px;right:-6px;padding:2px 8px;border-radius:4px 0 0 4px;background:#3f7d3a;color:#eaffde;font:600 12px system-ui,sans-serif;z-index:1}
#onl .lb100 .lb100-stage{position:relative;width:100%;height:150px;display:flex;align-items:flex-end;justify-content:center;margin-top:10px;background:radial-gradient(ellipse 60% 20% at 50% 92%,#00000080,transparent 70%),radial-gradient(ellipse 70% 70% at 50% 60%,#4a361f55,transparent 70%)}
#onl .lb100 .lb100-por{position:absolute;left:0;top:0;width:58px;height:81px;border-radius:6px;overflow:hidden;border:1px solid #c79a48;background:#140e09}
#onl .lb100 .lb100-por .portrait{width:100%!important;height:100%!important;display:block}#onl .lb100 .lb100-por svg,#onl .lb100 .lb100-por img{width:100%;height:100%;display:block}
#onl .lb100 .lb100-tok{display:flex;align-items:flex-end;max-height:130px}#onl .lb100 .lb100-tok .tkfig{max-height:130px}
#onl .lb100 .lb100-bub{display:flex;justify-content:center;min-height:26px;margin-top:6px;width:100%}
#onl .lb100 .lb100-bub i,#onl .lb100 .lb100-lb i{font-style:normal;position:relative;display:inline-block;padding:2px 10px;border-radius:12px;background:#f2e6cc;color:#2a1a0c;font:600 13px system-ui,sans-serif;line-height:20px;opacity:0;visibility:hidden;transition:opacity .45s;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
#onl .lb100 .lb100-bub i::before{content:'';position:absolute;top:-5px;left:50%;margin-left:-5px;border:5px solid transparent;border-top:0;border-bottom-color:#f2e6cc}
#onl .lb100 .lb100-bub.on i,#onl .lb100 .lb100-lb.on i{opacity:1;visibility:visible}#onl .lb100 .lb100-lb{display:inline-flex;margin-left:6px;vertical-align:middle}#onl .lb100 .lb100-lb:not(.on){display:none}
#onl .lb100 .lb100-s .r80-who{width:100%;flex:0 0 auto}#onl .lb100 .lb100-s .r80-who b{display:block;font:400 18px/1.15 var(--display,Georgia),serif;color:#eadfc8;margin-top:2px}#onl .lb100 .lb100-s.me .r80-who b{color:#f0cf7d}
#onl .lb100 .lb100-s .r80-who small{display:block;font-size:13px;color:#b9a88c}
#onl .lb100 .lb100-rks{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:6px}
#onl .lb100 .lb100-gr{display:inline-flex;align-items:center;gap:4px;padding:1px 8px 1px 4px;border-radius:999px;border:1px solid #8a6a3a;background:#1a120c;font:500 12px ui-monospace,Menlo,monospace;color:#f0d9a6;white-space:nowrap}
#onl .lb100 .lb100-dr{display:inline-flex;align-items:center;gap:4px;padding:1px 8px 1px 3px;border-radius:4px;border:1px solid #5a4630;background:#1a120c;font-size:12px;color:#eadfc8;white-space:nowrap}#onl .lb100 .lb100-dr img{height:20px;width:auto;display:block}
.medal100{flex:none;vertical-align:-3px}
#onl .lb100 .lb100-snd{width:100%;margin-top:10px;display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:7px;border:1px solid #6a5036;background:#140e09;font-size:13px;color:#b9a88c;box-sizing:border-box}#onl .lb100 .lb100-snd select{width:auto}#onl .lb100 .lb100-snd .coinimg{width:16px;height:16px}
#onl .lb100 .lb100-s .r80-tm{display:flex;gap:4px;justify-content:center;margin-top:6px}
#onl .lb100 .lb100-open{border:2px dashed #6a5036;background:transparent;justify-content:center;gap:8px}#onl .lb100 .lb100-ch{font-size:34px;opacity:.6}
#onl .lb100 .lb100-open .r80-who b{font-size:17px;color:#b9a88c}#onl .lb100 .lb100-open .r80-who small{font-size:12.5px;color:#9a8a72}#onl .lb100 .lb100-sit{width:auto}
#onl .lb100 .lb100-cmp .lb100-s{min-height:0;padding:8px 8px 9px}#onl .lb100 .lb100-cmp .lb100-stage{height:96px;margin-top:14px}#onl .lb100 .lb100-cmp .lb100-por{width:44px;height:62px}
#onl .lb100 .lb100-cmp .lb100-tok,#onl .lb100 .lb100-cmp .lb100-tok .tkfig{max-height:92px}#onl .lb100 .lb100-cmp .lb100-bub{min-height:22px;margin-top:3px}#onl .lb100 .lb100-cmp .r80-who b{font-size:15.5px}
#onl .lb100 .lb100-cmp .lb100-rks{flex-direction:column;align-items:center;gap:3px;margin-top:4px}#onl .lb100 .lb100-cmp .lb100-rdy{top:24px;font-size:11px}#onl .lb100 .lb100-cmp .lb100-snd{padding:4px 6px;font-size:12px;margin-top:6px}
#onl .lb100 .lb100-cmp .lb100-open{min-height:170px}
#onl .lb100 .lb100-watch{margin:14px 0 0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;border:1px dashed #3a5266;border-radius:9px;background:linear-gradient(90deg,#16222c,#14100c)}#onl .lb100 .lb100-watch.on{border-style:solid}
#onl .lb100 .lb100-watch .h{font:400 15px var(--display,Georgia),serif;color:#cfe2f2;white-space:nowrap}
#onl .lb100 .lb100-w{display:inline-flex;align-items:center;gap:6px;padding:2px 9px 2px 3px;border-radius:999px;background:#0f171e;border:1px solid #2c4252;font-size:13px;color:#e4eef6}
#onl .lb100 .lb100-mp{width:22px;height:30px;border-radius:4px;overflow:hidden;display:inline-block}#onl .lb100 .lb100-mp .portrait{width:100%!important;height:100%!important}#onl .lb100 .lb100-mp svg{width:100%;height:100%;display:block}
#onl .lb100 .lb100-watch .x2{margin-left:auto;font-size:12.5px;color:#9db6c9}
#onl .lb100 .lb100-set{margin-top:14px}
#onl .lb100 .lb100-ph{display:flex;align-items:baseline;gap:8px;margin-bottom:8px;flex-wrap:wrap}#onl .lb100 .lb100-ph h4{margin:0;font:400 16px var(--display,Georgia),serif;color:#f0cf7d;letter-spacing:.05em}
#onl .lb100 .lb100-ph small,#onl .lb100 .lb100-ph .n{font:500 12px ui-monospace,Menlo,monospace;color:#b9a88c}
#onl .lb100 .lb100-set .r80-set,#onl .lb100 .lb100-ro{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px 12px;border:0;padding:0;margin:0}
#onl .lb100 .lb100-set .r80-set label,#onl .lb100 .lb100-ro label{display:flex;flex-direction:column;gap:3px;font-size:12.5px;color:#b9a88c;margin:0;min-width:0}
#onl .lb100 .lb100-set .r80-set select{width:100%}#onl .lb100 .lb100-set .r80-set label.chk{flex-direction:row;align-items:center}
#onl .lb100 .lb100-set .pw98r{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px;align-items:center}#onl .lb100 .lb100-set .pw98r input{width:200px;max-width:100%}
#onl .lb100 .lb100-ro .f{padding:7px 10px;border:1px dashed #5a4630;border-radius:7px;color:#eadfc8;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .lb100 .lb100-set .tbl82,#onl .lb100 .lb100-set .r89-hostoff{margin:8px 0 0;font-size:13px;color:#b9a88c}
#onl .lb100 .lb100-foot{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:auto;padding-top:10px;border-top:1px solid #4a3a26}#onl .lb100 .lb100-main>.lb100-set+.lb100-foot{margin-top:12px}
#onl .lb100 .lb100-foot .lb100-why{margin-right:auto;font-size:13.5px;color:#b9a88c}#onl .lb100 .lb100-foot .r80-go{display:flex;gap:8px;margin:0}#onl .lb100 .lb100-foot .btn{width:auto;margin:0}
#onl .lb100 .lb100-foot [data-onl="start"]{font-size:18px;padding:10px 28px}
#onl .lb100 .lb100-side{display:flex;flex-direction:column;border:1px solid #4a3a26;border-radius:10px;padding:12px;background:linear-gradient(#2a2017,#211913);min-width:0}
#onl .lb100 .lb100-list{display:flex;flex-direction:column;gap:4px;flex:1}
#onl .lb100 .lb100-row{position:relative;display:grid;grid-template-columns:22px 34px minmax(0,1fr) auto 22px;align-items:center;gap:8px;flex:1 1 44px;min-height:44px;max-height:66px;padding:0 10px;border:1px solid #3a2b1e;border-radius:8px;background:#1a130d;box-sizing:border-box}
#onl .lb100 .lb100-row.me{border-color:#8a6a3a;background:linear-gradient(90deg,#2e2216,#1a130d)}
#onl .lb100 .lb100-row .cr{font-size:16px;text-align:center}#onl .lb100 .lb100-row .bnr img{height:34px;display:block;margin:auto}
#onl .lb100 .lb100-row .who{min-width:0}#onl .lb100 .lb100-row .who b{display:block;font:500 15px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#eadfc8}
#onl .lb100 .lb100-row .who small{display:block;font-size:12px;color:#b9a88c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .lb100 .lb100-you{font-style:normal;color:#f0cf7d;font-size:12px}
#onl .lb100 .lb100-row .st{font:500 11.5px ui-monospace,Menlo,monospace;color:#b9a88c;text-align:right;white-space:nowrap}#onl .lb100 .lb100-row .st.s{color:#e9d39c}
#onl .lb100 .lb100-row .ok{color:#8fd27a;font-size:17px;text-align:center}#onl .lb100 .lb100-row .ok.no{color:#6a5a48}
#onl .lb100 .lb100-row .idx{font:500 11px ui-monospace,Menlo,monospace;color:#9a8a72;text-align:center}
#onl .lb100 .lb100-row.empty{border:1px dashed #4a3826;background:transparent;grid-template-columns:22px 34px 1fr;color:#8a7a62}#onl .lb100 .lb100-row.empty .slot{width:28px;height:28px;border:1px dashed #4a3826;border-radius:4px;margin:auto}
#onl .lb100 .lb100-ra{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:none;gap:6px;padding:4px;border-radius:8px;background:#221811;border:1px solid #d6ab4c}
#onl .lb100 .lb100-ra .btn{width:auto;margin:0;padding:3px 8px;font-size:12.5px}#onl .lb100 .lb100-kick{border-color:#8a3a2e;color:#f3d1c8}
#onl .lb100 .lb100-row.ctl:hover .lb100-ra,#onl .lb100 .lb100-row.ctl:focus-within .lb100-ra{display:flex}#onl .lb100 .lb100-row.ctl:hover,#onl .lb100 .lb100-row.ctl:focus-within{border-color:#d6ab4c}
#onl .lb100 .lb100-leg{margin-top:8px;font-size:12px;color:#9a8a72}
#onl .lb100 .lb100-qc{margin-top:auto;padding-top:12px}#onl .lb100 .lb100-qg{font:500 10.5px ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:#b9a88c;margin:6px 0 5px}
#onl .lb100 .lb100-qcs{display:flex;flex-wrap:wrap;gap:5px}#onl .lb100 .lb100-q{padding:3px 10px;border-radius:999px;border:1px solid #8a6a3a;background:#221811;font:600 13px system-ui,sans-serif;color:#f0d9a6;cursor:pointer;width:auto;margin:0}
#onl .lb100 .lb100-q:hover,#onl .lb100 .lb100-q:focus-visible{border-color:#f0cf7d;color:#f0cf7d}
#onl .lb100 .lb100-qcs.tn .lb100-q{border-color:#7a3a6a;background:#2a1626;color:#f2cfe6;font-weight:500}
#onl .lb100 .cd83,#onl .lb100 .r80-over{margin-bottom:10px}
#onl .lb100.grey .lb100-seats{opacity:.7}
#onl .lb100 .r80-seat.off89{opacity:.5;filter:grayscale(.6)}
#onl .lb100-jb{display:flex;align-items:center;gap:8px;padding:5px 8px 5px 12px;border:1px solid #d6ab4c;border-radius:9px;background:#140e09;flex-wrap:wrap;margin:0 auto 0 12px}
#onl .lb100-jb .l{font:500 11px ui-monospace,Menlo,monospace;letter-spacing:.12em;color:#b9a88c;text-transform:uppercase}
#onl .lb100-jb input{width:190px;font:500 15px ui-monospace,Menlo,monospace;letter-spacing:.05em;text-transform:uppercase}#onl .lb100-jb .btn{width:auto;margin:0}
#onl .lb100-jmsg{margin:4px 0 6px;font-size:13px;color:#b9a88c}#onl .lb100-jmsg.err{color:#f0a090}#onl .lb100-jmsg .btn{width:auto;display:inline-flex}
.hc98pop .lb100-hcnow{margin:8px 0 0;padding:7px 10px;border:1px solid #5a7a3a;border-radius:8px;background:#18200f;font-size:13.5px}
.hc98pop .lb100-gr{display:inline-flex;align-items:center;gap:4px;padding:1px 8px 1px 4px;border-radius:999px;border:1px solid #8a6a3a;background:#1a120c;font:500 12px ui-monospace,Menlo,monospace;color:#f0d9a6;white-space:nowrap}
@media (max-width:1100px){#onl .lb100 .lb100-grid{grid-template-columns:minmax(0,1fr) 300px}}
@media (max-width:900px){#onl .lb100 .lb100-grid{grid-template-columns:1fr}#onl .lb100 .lb100-row{flex:none;height:48px}}
@media (max-width:600px){#onl .lb100{padding:8px}#onl .lb100 .lb100-ban{gap:8px;padding:8px}#onl .lb100 .lb100-ban .r80-ev .cimg{width:40px}#onl .lb100 .lb100-t h3{font-size:19px}#onl .lb100 .lb100-t h3 small{font-size:14px}
  #onl .lb100 .lb100-sp{display:none}#onl .lb100 .lb100-code{width:100%;flex-direction:row;align-items:center;justify-content:space-between;box-sizing:border-box}
  #onl .lb100 .lb100-acts{width:100%}#onl .lb100 .lb100-acts .btn{flex:1;justify-content:center;padding:8px}
  #onl .lb100 .lb100-seats{gap:8px}#onl .lb100 .lb100-s{width:calc(50% - 4px);min-width:0;min-height:240px;padding:8px}#onl .lb100 .lb100-stage{height:118px}#onl .lb100 .lb100-por{width:42px;height:59px}
  #onl .lb100 .lb100-tok,#onl .lb100 .lb100-tok .tkfig{max-height:104px}#onl .lb100 .lb100-s .r80-who b{font-size:16px}#onl .lb100 .lb100-gr,#onl .lb100 .lb100-dr{font-size:11px}
  #onl .lb100 .lb100-set .r80-set,#onl .lb100 .lb100-ro{grid-template-columns:1fr 1fr}#onl .lb100 .lb100-watch .x2{margin-left:0}
  #onl .lb100 .lb100-foot{position:sticky;bottom:0;z-index:3;margin:10px -12px -12px;padding:10px 12px;background:#140e09ee;border-top:1px solid #d6ab4c;flex-wrap:wrap}#onl .lb100 .lb100-foot .lb100-why{font-size:12px}
  #onl .lb100-jb{margin:6px 0 0;width:100%;box-sizing:border-box}#onl .lb100-jb input{flex:1;width:auto;min-width:0}}
@media (prefers-reduced-motion:reduce){#onl .lb100 .lb100-bub i,#onl .lb100 .lb100-lb i{transition:none}}body.calm #onl .lb100 .lb100-bub i{transition:none}
`;document.head.appendChild(css)}
