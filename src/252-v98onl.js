/* 250-v98onl — v0.98 PART E · THE ONLINE BATCH (client + mock). Shared rules: the v0.98 section of 111-onlcore; server: routes.js "v0.98".
   No protocol bump (ONLC.VER stays 7): an older page keeps playing against the new server.
   1 · 🔒 PASSWORDS (Custom rooms; his q3a): the host sets / removes one in the room's table settings (lobby.set {pw}); a 🔒 row in the Lobby Browser
       asks for it when you join (pw98Ask — a NET.req wrapper, so every join path asks; a stale list's pw_need asks too). Ranked never has one.
   2 · REGIONS (his q2a): lobby.create / lobby.quick carry the browser's time zone; the room wears its REGION FLAG (rg98Flag: the banner press
       flagURI with the region's colours, device and word) in the list and the room; the Lobby Browser gets a Region filter + sort (ONL96.reg).
   3 · THE HOUSE CARD: every lanista name in the Lobby Browser and the room (and the followed houses in Profile) opens hc98Open — record,
       living gladiators, fallen, best rank, the last 6 events W/L, 🏛 Visit house · ★ Follow (route house.card, cached 30 s).
   4 · DOMUS RANK (his q1a/q4a): a small vertical banner beside every house name in rooms and lists (dr98Chip); the Domus wears the big one with
       its symbol above the Glory bar (onlRankBar82 wrapper). The banners are drawn with the banner press too (dr98URI: flagURI + a symbol layer,
       framed as a hanging swallow-tail banner; hut, amphora, wooden sword, crossed blades, helm, shield, laurel, eagle — no numerals).
   5 · Find me a fight stays silent (server); nothing to do here.
   6 · MORE EVENTS (Custom only): Golden Eagle joins ONL_EVENTS_OK88 (Ludus was taken out again in 255-v98fix2: online drafts need a per-lanista draft) (161's Familia cycle) and TWO SQUARES under the playlists
       (ev98Squares) each cycle a random approved event; ⚔ Play opens or joins a Custom room for it (lobby.quick ranked:false). Their Ranked
       buttons are taken off everywhere; Ranked rooms / Ludi Infames never list them.
   7 · DAMNATIO only at creation: the Domus class picker greys Damnatio (and every class while he is a Damnatio) with the reason.
   8 · BONUS RENAMES: every reply and push is walked by ONLC.renameDeep98 (names are stored on the pieces), so owned gear shows the new names;
       239's auction card labels follow (AUC96_AFF).
   9 · 👤 PROFILE & SETTINGS regrouped to his approved mock (tools/plans/mock98/profile.html): a header card (crest, lanista, house, record, FID +
       rename) and two columns — Privacy · Find a house (+ followed houses) · Tester | Notifications (title flash, horn, browser notices, Quiet) ·
       Account. The flash and the horn are separate switches now (localStorage flavius_onlflash98 / flavius_onlhorn98).
   Test tonl98. */
const ONL98={hc:{},pwAsk:null,sq:[0,1],sqAt:0,MS:7000 /* TWEAK: how long an event square shows one event */};
const tz98=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){return ''}};

/* ---------------- art: region flags + Domus-rank banners (the banner press) ---------------- */
const DR_SYM98={
  hut:`<g fill="none" stroke="FG" stroke-width="13" stroke-linejoin="round"><path d="M228 168 L300 104 L372 168"/><path d="M246 156 V246 H354 V156"/><path d="M286 246 V200 H314 V246"/></g>`,
  amphora:`<g fill="none" stroke="FG" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"><path d="M284 92 H316 M288 92 V122 C246 138 244 206 284 246 L300 262 L316 246 C356 206 354 138 312 122 V92"/><path d="M288 124 C262 118 256 150 270 160 M312 124 C338 118 344 150 330 160"/></g>`,
  rudis:`<g fill="FG"><path d="M291 86 H309 V214 H291 Z" opacity=".85"/><rect x="258" y="214" width="84" height="15" rx="6"/><rect x="292" y="229" width="16" height="34"/><circle cx="300" cy="270" r="12"/></g>`,
  blades:`<g stroke="FG" stroke-width="13" stroke-linecap="round" fill="none"><path d="M236 96 L352 236 M364 96 L248 236"/><path d="M332 252 L374 210 M268 252 L226 210"/></g>`,
  helm:`<g fill="none" stroke="FG" stroke-width="12" stroke-linejoin="round"><path d="M240 246 V176 C240 128 268 106 300 106 C332 106 360 128 360 176 V246 H326 V200 H274 V246 Z"/><path d="M300 106 C300 86 314 76 330 80"/><path d="M286 160 H314"/></g><path d="M262 96 C282 70 318 70 338 96" fill="none" stroke="FG" stroke-width="9" opacity=".7"/>`,
  shield:`<g fill="none" stroke="FG" stroke-width="12" stroke-linejoin="round"><path d="M246 104 H354 V176 C354 220 330 246 300 266 C270 246 246 220 246 176 Z"/><path d="M300 126 V238 M268 170 H332"/></g>`,
  laurel:`<g fill="FG">${Array.from({length:7},(_,i)=>{const a=(215-i*19)*Math.PI/180,b=(-35+i*19)*Math.PI/180;const E=(x,y,r)=>`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="13" ry="6" transform="rotate(${r.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;return E(300+Math.cos(a)*44,182+Math.sin(a)*44,a*180/Math.PI+90)+E(300+Math.cos(b)*44,182+Math.sin(b)*44,b*180/Math.PI+90)}).join('')}<circle cx="300" cy="232" r="5"/></g>`,
  eagle:`<g fill="FG"><path d="M300 100 c-10 0 -16 9 -14 18 l-8 5 l9 2 c2 8 3 15 6 21 l-12 46 l19 -18 l19 18 l-12 -46 c3 -6 4 -13 6 -21 l9 -2 l-8 -5 c2 -9 -4 -18 -14 -18z"/><path d="M290 142 c-22 -24 -50 -32 -76 -28 c18 8 28 14 32 22 c-14 0 -26 4 -36 12 c18 0 32 3 42 9 c-8 4 -14 10 -18 18 c18 -6 38 -12 58 -18z"/><path d="M310 142 c22 -24 50 -32 76 -28 c-18 8 -28 14 -32 22 c14 0 26 4 36 12 c-18 0 -32 3 -42 9 c8 4 14 10 18 18 c-18 -6 -38 -12 -58 -18z"/><circle cx="300" cy="250" r="9"/></g>`};
const DR98_CACHE={},RG98_CACHE={};
/* a Domus-rank banner as an image (data URI): the press paints the cloth + the symbol; a swallow-tail cut, a pole, gold edges */
function dr98URI(k){if(DR98_CACHE[k])return DR98_CACHE[k];const R=ONLC.DRANKS98.find(r=>r.k===k)||ONLC.DRANKS98[0];const i=ONLC.drankIdx98(R.k);
  const sym=`<g transform='translate(300 182) scale(1.75) translate(-300 -182)'>${(DR_SYM98[R.sym]||'').replace(/FG/g,R.fg).replace(/"/g,"'")}</g>`;let cloth='';try{cloth=flagURI(R.bg,R.fg,'','none',sym).replace(/'/g,'%27')}catch(e){}
  const gold=i>=6?'#f3d27a':'#c9a24a',edge=i>=6?2.4:1.6;const tas=i>=6?`<path d="M8 86 l-3 9 M52 86 l3 9" stroke="${gold}" stroke-width="1.6"/><circle cx="5" cy="96" r="2" fill="${gold}"/><circle cx="55" cy="96" r="2" fill="${gold}"/>`:'';
  const top=i>=7?`<rect x="6" y="7" width="48" height="7" fill="#9b2a1c"/>`:'';
  const cut='M6 7 H54 V86 L30 76 L6 86 Z';
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 60 100' width='60' height='100'><defs><clipPath id='c'><path d='${cut}'/></clipPath><linearGradient id='s' x1='0' x2='1'><stop offset='0' stop-color='#000' stop-opacity='.28'/><stop offset='.5' stop-color='#fff' stop-opacity='.06'/><stop offset='1' stop-color='#000' stop-opacity='.3'/></linearGradient></defs>`+
    `<g clip-path='url(#c)'><rect x='0' y='0' width='60' height='100' fill='${R.bg}'/>${cloth?`<image href='${cloth}' xlink:href='${cloth}' x='6' y='7' width='48' height='79' preserveAspectRatio='xMidYMid slice'/>`:''}${top}<rect x='0' y='0' width='60' height='100' fill='url(#s)'/></g>`+
    `<path d='${cut}' fill='none' stroke='${gold}' stroke-width='${edge}'/><path d='M10 11 H50 V80 L30 71 L10 80 Z' fill='none' stroke='${R.fg}' stroke-opacity='.35' stroke-width='.8'/>`+
    `<rect x='2' y='3' width='56' height='4' rx='2' fill='${gold}'/><circle cx='3' cy='5' r='3' fill='${gold}'/><circle cx='57' cy='5' r='3' fill='${gold}'/>${tas}</svg>`;
  return DR98_CACHE[k]='data:image/svg+xml,'+encodeURIComponent(svg)}
const dr98Name=k=>(ONLC.DRANKS98.find(r=>r.k===k)||ONLC.DRANKS98[0]).n;
function dr98Chip(k){if(!k||!ONLC.DRANKS98.some(r=>r.k===k))return '';const R=ONLC.DRANKS98.find(r=>r.k===k);
  return `<img class="dr98c" src="${dr98URI(k)}" alt="${esc2(R.n)}" title="${esc2(_T`Domus rank: ${R.n}`)}" data-dr98="${esc2(k)}">`}
function rg98Flag(k){const R=ONLC.regionByKey98(k);if(!R)return '';if(!RG98_CACHE[k]){try{RG98_CACHE[k]=flagURI(R.bg,R.fg,R.w,R.shape)}catch(e){RG98_CACHE[k]=''}}
  return RG98_CACHE[k]?`<img class="rg98" src="${RG98_CACHE[k]}" alt="${esc2(_T(R.n))}" title="${esc2(_T`Region: ${_T(R.n)}`)}" data-rg98="${esc2(k)}">`:''}
const rg98Name=k=>{const R=ONLC.regionByKey98(k);return R?_T(R.n):''};
/* the region names (translator keys; the data in 111 stays English) */
const RG98_TXT=[_T('North America'),_T('South America'),_T('Europe'),_T('Africa'),_T('Middle East'),_T('Asia'),_T('Oceania')];

/* ---------------- NET: tz on new rooms, the password ask, the renames ---------------- */
function pw98Ask(L,wrong){return new Promise(res=>{const bg=onl83Pop('pw98pop',`<h3 class="pop83h">${_T`🔒 This room has a password`}</h3>
    <p class="rc-sub">${_T`${esc2(onlEvName(L.ev))} at ${esc2(onlCityName(L.loc))} — hosted by ${esc2((L.host&&L.host.name)||'')}.`}</p>${wrong?`<p class="onl-err">${esc2(wrong)}</p>`:''}
    <form class="pw98f" data-pw98f="1"><input class="tin" type="password" id="pw98In" maxlength="${ONLC.PW98.MAX}" autocomplete="off" placeholder="${_T`Password`}" aria-label="${_T`Password`}">
    <div class="acts"><button type="submit" class="btn primary">${_T`Join`}</button><button type="button" class="btn" data-pw98x="1">${_T`Cancel`}</button></div></form>`);
  let done=false;const end=v=>{if(done)return;done=true;bg.remove();res(v)};const f=bg.querySelector('form');
  f.addEventListener('submit',e=>{e.preventDefault();const v=String((bg.querySelector('#pw98In')||{}).value||'');end(v)});
  bg.addEventListener('click',e=>{if(e.target===bg||e.target.closest('[data-pw98x]'))end(null)});
  new MutationObserver((m,o)=>{if(!bg.isConnected){o.disconnect();if(!done){done=true;res(null)}}}).observe(document.body,{childList:true});
  setTimeout(()=>{try{bg.querySelector('#pw98In').focus()}catch(e){}},30)})}
const pw98Cancel=()=>{const e=new Error(_T('No password — you stay out.'));e.code='pw_cancel';return e};
{const base=NET.req;NET.req=function(t,d,...rest){const self=this;
  if((t==='lobby.create'||t==='lobby.quick')&&(d==null||typeof d==='object')&&!(d&&'tz' in d)){const z=tz98();if(z)d={...(d||{}),tz:z}}
  const go=dd=>base.call(self,t,dd,...rest).then(r=>{try{ONLC.renameDeep98(r)}catch(e){}return r});
  if(t==='lobby.join'&&d&&!d.inv&&!d.pw){const me=typeof onlMe80==='function'?onlMe80():null;const L=(ONL.lobbies||[]).find(x=>x.id===d.id);
    const ask=(X,why)=>pw98Ask(X||{id:d.id,ev:'democritus',loc:1},why).then(pw=>{if(pw==null)throw pw98Cancel();return go({...d,pw}).catch(e=>{if(e&&e.code==='pw_bad')return ask(X,errText92(e));throw e})});
    if(L&&L.pw&&!(L.members||[]).some(m=>m.id===me))return ask(L);
    return go(d).catch(e=>{if(e&&e.code==='pw_need')return ask(L||null);throw e})}
  return go(d)}}
{const base=NET.emit;NET.emit=function(t,d){try{if(d&&typeof d==='object')ONLC.renameDeep98(d)}catch(e){}return base.apply(this,arguments)}}
/* the auction's bonus labels follow the renames */
if(typeof AUC96_AFF!=='undefined'){if(AUC96_AFF.crowd)AUC96_AFF.crowd[1]=_T('Gloriosus I');if(AUC96_AFF.pierce)AUC96_AFF.pierce[1]=_T('Acutus I');if(AUC96_AFF.swift)AUC96_AFF.swift[1]=_T('Velox I')}
/* 6 · the new events cycle in 161's Familia box */
for(const k of ONLC.EVENTS_CUSTOM98)if(typeof ONL_EVENTS_OK88!=='undefined'&&!ONL_EVENTS_OK88.includes(k))ONL_EVENTS_OK88.push(k);
/* the squares cycle every approved non-Classic event (Familia + the Custom-only wave) */
const ev98Ok=()=>['familia',...ONLC.EVENTS_CUSTOM98].filter(k=>typeof EVENTS!=='undefined'&&EVENTS[k]);

/* ---------------- 2 · the Lobby Browser: 🔒, region flags, rank chips, names → the house card, a Region filter ---------------- */
if(!('reg' in ONL96))ONL96.reg='';
{const base=lb96Rows;lb96Rows=function(rows,mine){let r=base.apply(this,arguments);if(ONL96.reg)r=r.filter(L=>L===mine||L.reg===ONL96.reg);
  if(ONL96.sort==='reg'){const nm=L=>rg98Name(L.reg)||'~';r=r.slice().sort((a,b)=>nm(a).localeCompare(nm(b))||String(onlEvName(a.ev)).localeCompare(String(onlEvName(b.ev))))}return r}}
{const base=lb96BarHTML;lb96BarHTML=function(all,shown){let h=base.apply(this,arguments);try{const opt=(v,l)=>`<option value="${esc2(v)}" ${String(ONL96.reg)===String(v)?'selected':''}>${esc2(l)}</option>`;
    const sel=`<label>${_T`Region`} <select class="tin" data-lb96="reg">${opt('',_T('All regions'))}${ONLC.REGIONS98.map(R=>opt(R.k,_T(R.n))).join('')}</select></label>`;
    h=h.replace(/(<label>[^<]*<select class="tin" data-lb96="sort">)/,sel+'$1').replace(/(data-lb96="sort">[\s\S]*?)(<\/select>)/,`$1<option value="reg" ${ONL96.sort==='reg'?'selected':''}>${esc2(_T('Region'))}</option>$2`)}catch(e){console.error(e)}return h}}
function lb98Fix(h){if(!h||h.indexOf('data-row')<0)return h;const T=document.createElement('template');T.innerHTML=h;const byId={};for(const L of ONL.lobbies||[])byId[L.id]=L;
  for(const tr of T.content.querySelectorAll('tr[data-row]')){const L=byId[tr.dataset.row];if(!L)continue;const td=tr.cells;if(!td||td.length<3)continue;
    const b=td[0].querySelector('b');if(b&&L.host&&L.host.id&&!/^bot/.test(L.host.id)){b.dataset.hc98=L.host.id;b.classList.add('hc98n');b.setAttribute('role','button');b.tabIndex=0;b.title=_T('Open the house card');
      const dr=(L.host.dr)||((L.members||[]).find(m=>m.id===L.host.id)||{}).dr;if(dr&&!td[0].querySelector('.dr98c'))b.insertAdjacentHTML('beforebegin',dr98Chip(dr))}
    if(L.pw&&!td[1].querySelector('.pw98b'))td[1].insertAdjacentHTML('beforeend',` <span class="badge pw98b" title="${esc2(_T('A password is needed to join'))}">🔒</span>`);
    if(ONLC.customOnly98(L.ev)&&!td[1].querySelector('.co98'))td[1].insertAdjacentHTML('beforeend',` <span class="badge co98">${_T`Custom only`}</span>`);
    if(L.reg&&!td[2].querySelector('.rg98'))td[2].insertAdjacentHTML('afterbegin',rg98Flag(L.reg)+' ')}
  return T.innerHTML}
{const base=onlLobbyHTML;onlLobbyHTML=function(){const h=base.apply(this,arguments);try{return lb98Fix(h)}catch(e){console.error(e);return h}}}

/* ---------------- the room: 🔒 + region tags, rank chips, names → card, the password in the table settings ---------------- */
function rm98Fix(h,L,grey){const me=onlMe80();const T=document.createElement('template');T.innerHTML=h;const root=T.content.querySelector('#onlRoom80');if(!root)return h;
  const tags=root.querySelector('.r80-tags');if(tags){if(L.pw&&!tags.querySelector('.pw98b'))tags.insertAdjacentHTML('beforeend',`<span class="badge pw98b" title="${esc2(_T('A password is needed to join'))}">${_T`🔒 Password`}</span>`);
    if(L.reg&&!tags.querySelector('.rg98'))tags.insertAdjacentHTML('beforeend',`<span class="badge rg98t">${rg98Flag(L.reg)} ${esc2(rg98Name(L.reg))}</span>`)}
  const drOf=id=>((L.members||[]).find(m=>m.id===id)||(L.players||[]).find(p=>p.id===id)||{}).dr||(L.host&&L.host.id===id?L.host.dr:'');
  /* the lanistas list */
  for(const u of root.querySelectorAll('[data-u96]')){const id=u.dataset.u96;const b=u.querySelector('.r96-un > b');if(!b)continue;const dr=drOf(id);
    if(dr&&!u.querySelector('.dr98c'))b.insertAdjacentHTML('afterbegin',dr98Chip(dr));if(!/^bot/.test(id)){b.dataset.hc98=id;b.classList.add('hc98n');b.setAttribute('role','button');b.tabIndex=0;b.title=_T('Open the house card')}}
  /* the seats */
  const seats=root.querySelectorAll('.r80-seats > .r80-seat');seats.forEach((s,i)=>{const p=(L.players||[])[i];if(!p||/^bot/.test(p.id))return;const b=s.querySelector('.r80-who > b');if(!b)return;
    const dr=drOf(p.id);if(dr&&!s.querySelector('.dr98c'))b.insertAdjacentHTML('afterend',dr98Chip(dr));b.dataset.hc98=p.id;b.classList.add('hc98n');b.setAttribute('role','button');b.tabIndex=0;b.title=_T('Open the house card')});
  /* host settings: Ranked never lists the Custom-only events; Custom rooms get the password row */
  const evSel=root.querySelector('select[data-onlrs="ev"]');if(evSel&&L.ranked)for(const o of [...evSel.options])if(ONLC.customOnly98(o.value))o.remove();
  if(evSel)for(const o of evSel.options)if(ONLC.customOnly98(o.value)&&!/Custom/.test(o.textContent))o.textContent+=' · '+_T('Custom');
  const set=root.querySelector('.r80-set');if(set&&!L.ranked&&L.host&&L.host.id===me&&!grey&&!set.querySelector('.pw98r')){
    set.insertAdjacentHTML('beforeend',`<div class="pw98r"><label for="pw98Set">${_T`🔒 Password`}</label><input class="tin" type="password" id="pw98Set" maxlength="${ONLC.PW98.MAX}" autocomplete="new-password" placeholder="${L.pw?_T('set — type a new one'):_T('none — anyone may join')}">
      <button type="button" class="btn tksm" data-pw98="set" data-v="${esc2(L.id)}">${L.pw?_T('Change'):_T('Set')}</button>${L.pw?`<button type="button" class="btn tksm" data-pw98="clear" data-v="${esc2(L.id)}">${_T`Remove`}</button>`:''}
      <small class="rc-sub">${_T`Invited lanistas come in without it.`}</small></div>`)}
  return T.innerHTML}
{const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){const h=base.apply(this,arguments);try{if(!L||typeof h!=='string')return h;return rm98Fix(h,L,grey)}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-pw98]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.pw98,id=b.dataset.v;
  const inp=document.getElementById('pw98Set');const pw=a==='clear'?'':String(inp&&inp.value||'');if(a==='set'){const why=ONLC.pwWhy98(pw,false);if(why){onlToast80('🔒 '+esc2(_T(why)));return}}
  onlDo(async()=>{await NET.req('lobby.set',{id,pw});if(inp)inp.value='';onlToast80(a==='clear'?_T('🔓 The room is open to all again.'):_T('🔒 Password set — share it with your guests.'))})},true);

/* ---------------- 3 · the house card ---------------- */
async function hc98Get(q){const key=JSON.stringify(q);const c=ONL98.hc[key];if(c&&Date.now()-c.at<30000)return c.r;const r=await NET.req('house.card',q);ONL98.hc[key]={at:Date.now(),r};return r}
function hc98HTML(r){const D=r.domus||{};const L=D.look89&&D.look89.crest?D.look89:{c1:'#7a2230',c2:'#d6ab4c',crest:ONLC.CREST89[Math.abs(typeof hashStr==='function'?hashStr(String(D.id||'d')):7)%12]};
  let crest='';try{crest=flagURI(L.c1,L.c2,ludusInitials(String(D.name||'')),L.crest)}catch(e){}
  const dr=(D.dr98&&D.dr98.k)||'tugurium';const st={off:_T('⚫ Away'),free:_T('🟢 In the arena'),room:_T('🟡 In a room'),fight:_T('🔴 Fighting now')}[(r.now||{}).st]||'';
  const rec=[[_T('Bouts'),D.bouts|0],[_T('Won'),D.wins|0],[_T('Survived'),D.survived|0],[_T('Fallen'),r.fallen|0],[_T('Fame'),`✦ ${D.fame|0}`]];
  const glads=(r.glads||[]).map(g=>`<li><b>${esc2(g.name)}</b> <small>${esc2((CLASSES[g.cls]||{}).name||'')}</small> ${onlRankChip(g.rank)} <small class="hc98g">${_T`${g.glory|0} Glory`}</small></li>`).join('')||`<li class="rc-sub">${_T`No living gladiators.`}</li>`;
  const last=(r.last||[]).map(e=>`<span class="hc98e ${e.won?'w':'l'} ${e.died?'d':''}" title="${esc2(_T`${onlEvName(e.ev)} at ${onlCityName(e.loc)} · ${e.glad}${e.ranked?' · Ranked':''}`)}">${e.won?_T('W'):_T('L')}${e.died?'✝':''}</span>`).join('')||`<small class="rc-sub">${_T`No events yet.`}</small>`;
  const guest=typeof l89Guest==='function'&&l89Guest();
  const acts=`<button type="button" class="btn tksm" data-hc98v="${esc2(D.id)}">${_T`🏛 Visit house`}</button>${r.mine||guest||!ONL.acct?'':`<button type="button" class="btn tksm ${r.following?'':'primary'}" data-hc98f="${esc2(D.id)}" data-on="${r.following?0:1}">${r.following?_T('★ Following'):_T('☆ Follow')}</button>`}${(r.now||{}).st==='fight'&&r.now.match?`<button type="button" class="btn tksm" data-onl="watch" data-v="${esc2(r.now.match)}">${_T`👁 Watch`}</button>`:''}`;
  return `<div class="hc98" style="--hc1:${esc2(L.c1)};--hc2:${esc2(L.c2)}"><div class="hc98-top">${crest?`<img class="hc98-crest" src="${crest}" alt="">`:''}
    <div class="hc98-ttl"><h3>${esc2(onlHouse82(D.name||''))}${D.test?' <i class="test83">TEST</i>':''}</h3><small>${r.lan&&r.lan.n?_T`lanista ${esc2(r.lan.n)}`:''}${r.fid?` · ${esc2(r.fid)}`:''}${st?` · ${esc2(st)}`:''}</small>
     <div class="hc98-dr"><img src="${dr98URI(dr)}" alt=""><span><b>${esc2(dr98Name(dr))}</b><small>${_T`Domus rank · ${(D.dr98&&D.dr98.s)|0}`}</small></span><span class="hc98-best">${_T`Best rank`} ${onlRankChip(r.best||'tiro')}</span></div></div></div>
    <div class="hc98-rec">${rec.map(([k,v])=>`<span><b>${v}</b><small>${k}</small></span>`).join('')}</div>
    <div class="hc98-cols"><div><h4>${_T`Gladiators`}</h4><ul class="hc98-gl">${glads}</ul></div><div><h4>${_T`Last 6 events`}</h4><div class="hc98-last">${last}</div></div></div>
    <div class="acts">${acts}<button type="button" class="btn tksm" data-hc98x="1">${_T`Close`}</button></div></div>`}
async function hc98Open(q){const bg=onl83Pop('hc98pop',`<div class="hc98 load"><p class="rc-sub">${_T`Reading the house…`}</p></div>`);bg.querySelector('.pop83box').classList.add('hc98box');
  try{const r=await hc98Get(q);if(!bg.isConnected)return;bg.querySelector('.pop83box').innerHTML=hc98HTML(r);bg.dataset.dom=(r.domus||{}).id||''}
  catch(e){if(bg.isConnected)bg.querySelector('.pop83box').innerHTML=`<p class="onl-err">${esc2(errText92(e,_T('No such house.')))}</p><div class="acts"><button type="button" class="btn tksm" data-hc98x="1">${_T`Close`}</button></div>`}
  bg.addEventListener('click',async e=>{const x=e.target.closest('[data-hc98x],[data-hc98v],[data-hc98f]');if(!x)return;e.preventDefault();
    if(x.dataset.hc98x){bg.remove();return}if(x.dataset.hc98v){bg.remove();onl89Visit({id:x.dataset.hc98v});return}
    if(x.dataset.hc98f){try{const r2=await ONL83.follow(x.dataset.hc98f,x.dataset.on==='1');if(typeof ONL83U!=='undefined')ONL83U.follows=r2.follows||[];ONL98.hc={};bg.remove();hc98Open(q)}catch(err){onlToast80('⚠ '+esc2(errText92(err)))}}})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-hc98], #onl [data-hc98d]');if(!b)return;e.preventDefault();e.stopPropagation();
  hc98Open(b.dataset.hc98d?{id:b.dataset.hc98d}:{acct:b.dataset.hc98})},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const b=e.target.closest&&e.target.closest('#onl [data-hc98], #onl [data-hc98d]');if(!b)return;e.preventDefault();b.click()},true);

/* ---------------- 4 · the Domus wears its rank banner ---------------- */
{const base=onlRankBar82;onlRankBar82=function(){const h=base.apply(this,arguments);try{const D=ONL.domus;if(!D||!D.id)return h;const X=D.dr98||{s:0,k:'tugurium'};const R=ONLC.DRANKS98;const i=ONLC.drankIdx98(X.k);const N=R[i+1];
    const tip=_T`The best four living gladiators' Glory + 20% of the fallen's. It never drops.`;
    const top=`<div class="dr98-top" title="${esc2(tip)}"><img class="dr98-big" src="${dr98URI(X.k)}" alt=""><div class="dr98-t"><small>${_T`Domus rank`}</small><b>${esc2(R[i].n)}</b><small>${X.s|0}${N?' · '+_T`${esc2(N.n)} at ${N.at}`:''}</small></div></div>`;
    return h.replace(/(<aside class="rb82[^"]*"[^>]*>)/,'$1'+top)}catch(e){console.error(e);return h}}}

/* ---------------- 6 · the event squares under the playlists ---------------- */
function ev98Pick(n){const evs=ev98Ok();if(!evs.length)return [];const out=[];for(let i=0;i<n;i++)out.push(evs[(ONL98.sq[i]|0)%evs.length]);if(n>1&&evs.length>1&&out[0]===out[1])out[1]=evs[(evs.indexOf(out[0])+1)%evs.length];return out}
function ev98Square(k,i){const E=EVENTS[k]||{};const open=(ONL.lobbies||[]).filter(L=>L.ev===k&&L.status==='waiting'&&!L.ranked);const tm=ONLC.EVENTS_TEAM.includes(k);const [lo,hi]=ONLC.seatRange(k);
  return `<div class="ev98s" data-ev98="${esc2(k)}" data-ev98i="${i}"><div class="ev98a">${typeof cardHTML==='function'?cardHTML('e:'+k,'sm').replace(/ data-card="[^"]*"/g,''):''}</div>
    <div class="ev98b"><b>${esc2(onlEvName(k))}</b><small>${tm?_T`👥 Teams · ${lo}–${hi} seats`:_T`${lo===hi?lo:lo+'–'+hi} seats`}${ONLC.customOnly98(k)?' · '+_T('Custom only'):' · '+_T('Custom')} · ${_T`${open.length} open`}</small>
    <button type="button" class="btn primary tksm" data-onl="quick" data-v="${esc2(k)}|0">${_T`⚔ Play`}</button></div></div>`}
function ev98Squares(){const evs=ev98Pick(2);if(!evs.length)return '';return `<div class="ev98row" aria-label="${_T`More events — Custom`}"><div class="ev98h">${_T`✦ More events <small>Custom · a new one every few seconds</small>`}</div><div class="ev98g">${evs.map(ev98Square).join('')}</div></div>`}
{const base=onlPlayHTML;onlPlayHTML=function(){let h=base.apply(this,arguments);try{
    const T=document.createElement('template');T.innerHTML=h;
    /* Custom-only events: no Ranked buttons anywhere on the landing */
    for(const b of T.content.querySelectorAll('[data-onl="quick"]')){const [k,r]=String(b.dataset.v||'').split('|');if(r==='1'&&ONLC.customOnly98(k))b.remove()}
    for(const s of T.content.querySelectorAll('select[data-onl83inf="ev"] option'))if(ONLC.customOnly98(s.value))s.remove();
    if(!T.content.querySelector('.ev98row')){const pls=T.content.querySelector('.onl-pls81');const t=document.createElement('template');t.innerHTML=ev98Squares();
      if(pls&&t.content.firstElementChild)pls.after(t.content.firstElementChild);else if(t.content.firstElementChild)T.content.appendChild(t.content.firstElementChild)}
    return T.innerHTML}catch(e){console.error(e);return h}}}
/* the squares turn on their own (staggered), never while the pointer is on them; Reduce motion: no fade */
setInterval(()=>{try{if(document.hidden)return;const row=document.querySelector('#onl .ev98row');if(!row||!row.offsetParent)return;if(row.matches(':hover')||row.contains(document.activeElement))return;
  if(Date.now()-ONL98.sqAt<ONL98.MS/2)return;const evs=ev98Ok();if(evs.length<2)return;ONL98.sqAt=Date.now();const i=ONL98.flip=(ONL98.flip|0)^1;
  /* a random approved event other than the one beside it */
  const other=row.querySelector(`.ev98s[data-ev98i="${i^1}"]`);const keep=other&&other.dataset.ev98;const cur=row.querySelector(`.ev98s[data-ev98i="${i}"]`);if(!cur)return;
  const pool=evs.filter(k=>k!==keep&&k!==cur.dataset.ev98);const pick=(pool.length?pool:evs.filter(k=>k!==keep))[Math.floor(Math.random()*Math.max(1,(pool.length?pool:evs.filter(k=>k!==keep)).length))];
  if(!pick||pick===cur.dataset.ev98)return;ONL98.sq[i]=evs.indexOf(pick);const t=document.createElement('template');t.innerHTML=ev98Square(pick,i);const nx=t.content.firstElementChild;
  if(!document.body.classList.contains('calm')){nx.classList.add('in');setTimeout(()=>nx.classList.remove('in'),40)}cur.replaceWith(nx)}catch(e){}},1000);

/* ---------------- 7 · Damnatio only at creation (the Domus class picker) ---------------- */
if(typeof d89ClassPop==='function'){const base=d89ClassPop;d89ClassPop=function(){const r=base.apply(this,arguments);try{const ch=d89Act();const bg=document.querySelector('.cls89pop');if(ch&&bg){
      for(const b of bg.querySelectorAll('[data-cls89]')){const k=b.dataset.cls89;if(k==='x'||k===ch.cls)continue;const why=ONLC.classWhy(ch,k,{treasury:1e9});if(why&&/Damnatio/.test(why)){b.disabled=true;b.title=_T(why);b.classList.add('dm98')}}
      if(ch.cls==='damnatio'&&!bg.querySelector('.dm98n'))bg.querySelector('h3').insertAdjacentHTML('afterend',`<p class="rc-sub dm98n">${_T`A Damnatio stays condemned — the class is chosen only when he is raised.`}</p>`)}}catch(e){}return r}}

/* ---------------- 9 · 👤 Profile & Settings, regrouped ---------------- */
const n98Get=(k,def)=>{try{const v=localStorage.getItem('flavius_onl'+k+'98');return v==null?def:v==='1'}catch(e){return def}};
const n98Set=(k,on)=>{try{localStorage.setItem('flavius_onl'+k+'98',on?'1':'0');const any=n98Get('flash',true)||n98Get('horn',true);localStorage.setItem('flavius_onlturn84',any?'on':'off')}catch(e){}};
const n98Flash=()=>n98Get('flash',onl84AlertsOn()),n98Horn=()=>n98Get('horn',onl84AlertsOn());
/* the turn alert: the flash and the horn each on their own switch (the desktop notice follows the browser's permission) */
onl84Alert=function(){const fl=n98Flash(),hn=n98Horn();if(!fl&&!hn)return;const ev=(S&&S.onl&&typeof EV==='function'&&EV()&&EV().n)||_T('the arena');const me=S&&S.players&&S.players[ONLM.me];
  if(fl&&!ONL84.flash){ONL84.title0=document.title;let k=0;ONL84.flash=setInterval(()=>{k++;document.title=k%2?_T`⚔ Your turn — ${ev}`:ONL84.title0},900);document.title=_T`⚔ Your turn — ${ev}`}
  if(hn){try{if(typeof sfx==='function')sfx('horn')}catch(e){}}
  try{if('Notification' in window&&Notification.permission==='granted'){const n=new Notification(_T('⚔ Your turn'),{body:`${ev}${me?' — '+me.name+_T(' waits for your word'):''}`,tag:'flavius-turn'});n.onclick=()=>{try{window.focus();n.close()}catch(e){}}}}catch(e){}
  ONL84.alerts=(ONL84.alerts|0)+1};
const pr98Sw=(attrs,on,label)=>`<label class="sw98"><input type="checkbox" ${attrs} ${on?'checked':''}><i aria-hidden="true"></i><span class="sr93">${label}</span></label>`;
const pr98Row=(t,sub,ctl)=>`<div class="pr98-row"><div class="t"><b>${t}</b>${sub?`<span>${sub}</span>`:''}</div>${ctl}</div>`;
function pr98Follows(){const fs=(typeof ONL83U!=='undefined'&&ONL83U.follows)||[];if(!fs.length)return `<p class="rc-sub pr98-nf">${_T`★ Follow a house from its card or its Domus to see it here.`}</p>`;
  const dot={free:'#6fae4c',room:'#e2b64a',fight:'#d24a3a',off:'#6b5a48'};const stx={free:_T('in the arena'),room:_T('in a room'),fight:_T('fighting now'),off:_T('away')};
  const shown=ONL98.allF?fs:fs.slice(0,4);
  return `<div class="pr98-lbl">${_T`★ Houses you follow · ${fs.length}`}${fs.length>4?` <button type="button" class="pr98-all" data-pr98="allf">${ONL98.allF?_T('Fewer ▴'):_T('See all ▸')}</button>`:''}</div><div class="pr98-fol">${shown.map(f=>
    `<div><i style="background:${dot[f.st]||dot.off}"></i><b class="hc98n" data-hc98d="${esc2(f.id)}" role="button" tabindex="0">${esc2(onlHouse82(f.name||''))}</b><small>${f.lan?esc2(f.lan)+' · ':''}${esc2(stx[f.st]||stx.off)}</small>${f.st==='fight'&&f.match?`<button type="button" class="btn tksm" data-onl="watch" data-v="${esc2(f.match)}">${_T`👁 Watch`}</button>`:''}</div>`).join('')}</div>`}
l89ProfHTML=function(){if(!ONL.acct||l89Guest())return `<div class="pr89 pr98"><div class="card2 pr89-s"><h3>${_T`👤 Profile & Settings`}</h3><p class="rc-sub">${_T`Guests only watch. Sign in to choose a lanista name, get your FID and set who may invite you.`}</p></div><div class="card2 pr89-s">${l89FindHTML(false)}</div></div>`;
  const L=V89L.lan||{};const P=L.priv||{hide:false,inv:'all'};const next=L.next||0;const can=!next||next<=l89Now();const D=ONL.domus||null;
  const LK=D&&D.look89&&D.look89.crest?D.look89:{c1:'#7a2230',c2:'#d6ab4c',crest:ONLC.CREST89[Math.abs(typeof hashStr==='function'?hashStr(String((D&&D.id)||'d')):7)%12]};
  let crest='';try{if(D)crest=flagURI(LK.c1,LK.c2,ludusInitials(String(D.name||'')),LK.crest)}catch(e){}
  const stats=D?[[D.bouts|0,_T('bouts')],[D.wins|0,_T('won')],[D.fallen|0,_T('fallen')],[`✦ ${D.fame|0}`,_T('fame')],[Math.max(D.glads|0,(ONL.chars||[]).filter(c=>c.alive).length),_T('gladiators')]]:[];
  const link=D&&typeof ONL83!=='undefined'&&ONL83.share?ONL83.share(D.id):'';
  const inv=[['all',_T('Everyone')],['follow',_T('Houses I follow')],['none',_T('Nobody')]];
  const N='Notification' in window;const perm=N?Notification.permission:'unsupported';
  const notif=perm==='granted'?`<span class="badge gold">${_T`Allowed`}</span>`:perm==='denied'?`<span class="badge">${_T`Blocked by the browser`}</span>`:perm==='unsupported'?`<span class="badge">${_T`Not in this browser`}</span>`:`<button type="button" class="btn tksm gold98" data-pr98="ask">${_T`Allow in this browser`}</button>`;
  const tst=typeof onl83Tester==='function'?onl83Tester():'';const mock=NET.mode!=='aws';
  return `<div class="pr98">
   <section class="pr98-h" style="--hc1:${esc2(LK.c1)};--hc2:${esc2(LK.c2)}">${crest?`<img class="pr98-crest" src="${crest}" alt="">`:'<span></span>'}
    <div class="pr98-who"><div class="pr98-lan">${_T`Lanista`}</div><h2>${esc2(L.name||'—')}</h2>${L.old?`<small class="rc-sub">${_T`formerly ${esc2(L.old)}`}</small>`:''}
     ${D?`<div class="pr98-house">${_T`of <b>${esc2(onlHouse82(D.name||''))}</b>`}${D.founded?` · ${_T`founded ${esc2(l89Date(D.founded))}`}`:''} ${D.dr98?dr98Chip(D.dr98.k):''}</div>`:''}
     ${stats.length?`<div class="pr98-stats">${stats.map(([v,k])=>`<span><b>${v}</b>${k}</span>`).join('')}</div>`:''}</div>
    <div class="pr98-id"><div class="pr98-fid"><small>${_T`FID`}</small><b>${esc2(L.fid||'—')}</b>${L.fid?`<button type="button" class="btn tksm" data-l89="copy" data-v="${esc2(L.fid)}">${_T`📋 Copy`}</button>`:''}${link?`<button type="button" class="btn tksm" data-l89="copy" data-v="${esc2(link)}" title="${_T`Copy a link to your house`}" aria-label="${_T`Copy a link to your house`}">🔗</button>`:''}</div>
     <div class="pr98-ren"><input class="tin" id="ln89Ren" maxlength="${ONLC.LNAME_MAX89}" value="${esc2(L.name||'')}" ${can?'':'disabled'} autocomplete="off" aria-label="${_T`Lanista name`}"><button type="button" class="btn tksm" data-l89="rename" ${can?'':'disabled'}>${_T`✎ Rename`}</button></div>
     <small class="pr98-hint">${can?_T('One rename every 30 days. Your old name shows as “formerly” for 14 days.'):_T`One rename every 30 days · next on ${esc2(l89Date(next))}`}</small>${V89L.err?`<p class="onl-err">${esc2(V89L.err)}</p>`:''}</div></section>
   <div class="pr98-g"><div class="pr98-col">
    <div class="card2 pr98-c"><h3>${_T`🔒 Privacy`}</h3>
     ${pr98Row(_T('Show me in “Here now” and on the Orbis'),_T('Hidden, you still count in the totals — without your name.'),pr98Sw('data-l89p="hide"',!P.hide,_T('Show me in “Here now” and on the Orbis')))}
     ${pr98Row(_T('Who may invite me'),_T('Calls from the Praeco follow the same rule.'),`<div class="seg98" role="radiogroup" aria-label="${_T`Who may invite me`}">${inv.map(([k,l])=>`<label class="${P.inv===k?'on':''}"><input type="radio" name="inv89" data-l89p="inv" value="${k}" ${P.inv===k?'checked':''}>${l}</label>`).join('')}</div>`)}</div>
    <div class="card2 pr98-c pr98-find">${l89FindHTML(true)}${pr98Follows()}</div>
    ${tst?`<div class="card2 pr98-c pr96-tst">${tst}</div>`:''}
   </div><div class="pr98-col">
    <div class="card2 pr98-c"><h3>${_T`🔔 Notifications`}</h3>
     ${pr98Row(_T('Your turn: flash the tab title'),_T('When the match waits for you in another tab.'),pr98Sw('data-n98="flash"',n98Flash(),_T('Your turn: flash the tab title')))}
     ${pr98Row(_T('Your turn: sound the horn'),_T('The game’s mute applies.'),pr98Sw('data-n98="horn"',n98Horn(),_T('Your turn: sound the horn')))}
     ${pr98Row(_T('Browser notifications'),_T('Your turn, while the tab is in the background.'),notif)}
     ${pr98Row(_T('🔕 Quiet'),_T('No popups for calls and invites; they wait in the list.'),pr98Sw('data-n98="quiet"',onlQuiet80(),_T('Quiet')))}</div>
    <div class="card2 pr98-c"><h3>${_T`⚙ Account`}</h3>
     ${pr98Row(mock?_T('Practice account (this browser)'):_T('Signed in with Google'),mock?_T('A mock server for trying Online — nothing leaves this browser.'):_T('Your Google name is never shown — only your lanista name.'),`<button type="button" class="btn tksm" data-onl="signout">${_T`Sign out`}</button>`)}
     <div class="pr98-danger"><b>${_T`🗑 Delete my account`}</b><p>${D?_T`Removes ${esc2(onlHouse82(D.name||''))}, its gladiators, gear, shelf and follows for good. It asks twice.`:_T('Removes your account for good. It asks twice.')}</p>
      <button type="button" class="btn tksm pr98-del" data-l89="del">${_T`Delete my account…`}</button></div></div>
   </div></div></div>`};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches)return;
  if(t.matches('#onl [data-n98]')){e.stopPropagation();const k=t.dataset.n98;if(k==='quiet'){try{localStorage.setItem('flavius_onlquiet80',t.checked?'1':'0')}catch(err){}onlToast80(t.checked?_T('🔕 Quiet — no banners or invite pop-ups.'):_T('🔔 Banners and invites pop up again.'))}
    else{n98Set(k,t.checked);if(!t.checked&&k==='flash')try{onl84FlashOff()}catch(err){}}return}
  if(t.matches('#onl .seg98 input')){const g=t.closest('.seg98');for(const l of g.querySelectorAll('label'))l.classList.toggle('on',!!l.querySelector('input:checked'))}},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-pr98]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.pr98;
  if(a==='allf'){ONL98.allF=!ONL98.allF;onlRedraw();return}
  if(a==='ask'){(async()=>{try{await Notification.requestPermission()}catch(err){}onlRedraw()})()}},true);

/* =========================== THE MOCK (as server/src/routes.js v0.98) =========================== */
const MOCK98={quick:false};
function mockDr98Upd(w,id){const D=mockDomus82(w,id);if(!D)return null;const cs=Object.values(w.chars).filter(c=>c.owner===D.owner&&(!c.domus||c.domus===D.id));ONLC.drankKeep98(D,ONLC.drankScore98(cs));return D}
function mockDr98Acct(w,acct){const A=w.accounts[acct];return A&&A.domus?mockDr98Upd(w,A.domus):null}
{const base=mockGroup;mockGroup=function(w,me){const g=base.apply(this,arguments);for(const x of g){const A=w.accounts[x.id];const D=A&&A.domus&&mockDomus82(w,A.domus);if(D)x.dr=ONLC.drankOf98(+D.dr98||0).k}return g}}
{const base=mockCreate80;mockCreate80=function(w,d,me,cry){d=d||{};const pw=d.pw!=null&&d.pw!==''?ONLC.pwClean98(d.pw):'';if(pw){const why=ONLC.pwWhy98(pw,!!d.ranked);if(why)throw onlErr82(_T(why),d.ranked?'pw_ranked':'pw_bad')}
  const quick=MOCK98.quick||!!d.quick;const L=base.call(this,w,d,me,cry&&!quick);if(quick)L.quick=1;const A=w.accounts[me];const hide=A&&ONLC.privOf89(A).hide;
  const reg=hide?'':ONLC.regionOf98(d.tz!=null?d.tz:(A&&A.tz)||'');if(reg)L.reg=reg;if(pw){mockPw98Set(w,L.id,pw);L.pw=1}if(reg||pw)mockUpd80(w,L);return L}}
function mockPw98Set(w,id,pw){w.pw98=w.pw98||{};if(!pw){delete w.pw98[id];return}const s=Date.now().toString(36)+Math.random().toString(36).slice(2,10);w.pw98[id]={s,h:ONLC.pwHash98(s,pw)}}
function mockPw98Check(w,id,pw,me){pw=ONLC.pwClean98(pw);if(!pw)throw onlErr82(_T('This room has a password.'),'pw_need');const A=w.accounts[me];const b=Math.floor(Date.now()/ONLC.PW98.WIN);
  A.pwq98=A.pwq98&&A.pwq98.h===b?A.pwq98:{h:b,n:0};if(A.pwq98.n>=ONLC.PW98.TRIES)throw onlErr82(_T('Too many tries — wait a few minutes.'),'slow');A.pwq98.n++;
  const X=(w.pw98||{})[id];if(!X||X.h!==ONLC.pwHash98(X.s,pw))throw onlErr82(_T('Wrong password.'),'pw_bad')}
for(const k of ['lobby.quick']){const base=MOCK_ROUTES[k];MOCK_ROUTES[k]=(w,d,me)=>{MOCK98.quick=true;try{return base(w,d,me)}finally{MOCK98.quick=false}}}
{const base=MOCK_ROUTES['lobby.join'];MOCK_ROUTES['lobby.join']=(w,d,me)=>{d=d||{};if(!d.inv&&d.id){const L=w.lobbies[d.id];if(L&&L.pw&&L.status==='waiting'&&!(L.members||[]).some(m=>m.id===me))mockPw98Check(w,L.id,d.pw,me)}return base(w,d,me)}}
{const base=MOCK_ROUTES['lobby.set'];MOCK_ROUTES['lobby.set']=(w,d,me)=>{d=d||{};if(d.pw===undefined)return base(w,d,me);const L=mockLobby80(w,d.id);
  if(L.host.id!==me)throw new Error(_T('Only the host changes the game.'));if(L.status!=='waiting')throw new Error(_T('Already under way.'));const pw=ONLC.pwClean98(d.pw);
  if(pw){const why=ONLC.pwWhy98(pw,!!L.ranked);if(why)throw onlErr82(_T(why),L.ranked?'pw_ranked':'pw_bad')}mockPw98Set(w,L.id,pw);if(pw)L.pw=1;else delete L.pw;
  const rest={...d};delete rest.pw;if(Object.keys(rest).some(k=>k!=='id'&&k!=='rid'))return base(w,rest,me);mockUpd80(w,L);return mockRoomOut80(w,L)}}
{const base=MOCK_ROUTES['domus.get'];MOCK_ROUTES['domus.get']=(w,d,me)=>{try{mockDr98Acct(w,me)}catch(e){}return base(w,d,me)}}
for(const k of ['match.result','match.abandon']){const base=MOCK_ROUTES[k];if(base)MOCK_ROUTES[k]=(w,d,me)=>{const r=base(w,d,me);try{const L=w.lobbies[d.id||d.lobbyId];for(const p of (L&&L.players)||[])if(!/^bot/.test(p.id))mockDr98Acct(w,p.id);mockDr98Acct(w,me)}catch(e){}return r}}
MOCK_ROUTES['house.card']=(w,d,me)=>{d=d||{};mockLook89(w,me);let D=null;if(d.acct!=null){const A=w.accounts[String(d.acct)];D=A&&A.domus&&mockDomus82(w,A.domus);if(!D)throw onlErr82(_T('No such house.'),'no_domus')}else D=mockHouse89(w,d);
  mockDr98Upd(w,D.id);const O=w.accounts[D.owner];const all=Object.values(w.chars).filter(c=>c.owner===D.owner&&(!c.domus||c.domus===D.id));
  const glads=all.filter(c=>c.alive).sort((a,b)=>ONLC.gloryOf(b)-ONLC.gloryOf(a)).map(c=>({id:c.id,name:c.name,cls:c.cls,rank:ONLC.rankFor(c).k,glory:Math.round(ONLC.gloryOf(c))}));
  let best='tiro';for(const c of all)for(const k of [c.died&&c.died.rank,c.rankK,ONLC.rankFor(c).k])if(k&&ONLC.RANKS.some(r=>r.k===k)&&ONLC.rankIdx(k)>ONLC.rankIdx(best))best=k;
  const A=w.accounts[me];const hide=!!(O&&ONLC.privOf89(O).hide);const st=!hide&&typeof mockFollows83==='function'?(mockFollows83(w,[{id:D.id,name:D.name}])[0]||null):null;const inv=A&&O&&A.id!==O.id?ONLC.invWhy89(O,{domus:A.domus}):'';
  return {domus:ONLC.domusPub89(D),glads,fallen:Math.max(D.fallen|0,all.filter(c=>!c.alive).length),best,last:(D.recent||[]).slice(0,6).map(e=>({ev:e.ev,loc:e.loc|0,at:e.at|0,won:!!e.won,died:!!e.died,glad:e.glad||'',ranked:!!e.ranked})),
    lan:O?ONLC.lanOut(O,Date.now()):null,fid:O?ONLC.fidShow(mockFid89(w,O)):'',following:!!(A&&(A.follows||[]).some(f=>f.id===D.id)),mine:!!(A&&A.domus===D.id),
    now:hide||!st?{st:'off'}:{st:st.st,...(st.match?{match:st.match}:{})},acct:!hide&&st&&st.st==='free'&&!inv&&O?O.id:null,inv}};

{const css=document.createElement('style');css.id='v98onlcss';css.textContent=`
#onl .dr98c{height:22px;width:auto;vertical-align:-4px;margin:0 3px 0 0;filter:drop-shadow(0 1px 1px #000a)}
#onl .rg98{height:15px;width:auto;border-radius:2px;vertical-align:-2px;box-shadow:0 0 0 1px #0008}
#onl .hc98n{cursor:pointer;text-decoration:underline dotted rgba(232,201,106,.55);text-underline-offset:3px}#onl .hc98n:hover,#onl .hc98n:focus-visible{color:var(--gold,#e8c96a)}
#onl .pw98b{font-size:11.5px}#onl .co98{font-size:10.5px;opacity:.85}
#onl .pw98r{display:flex;flex-wrap:wrap;gap:6px;align-items:center;flex-basis:100%;grid-column:1/-1;margin-top:6px}#onl .pw98r label{font-size:13px;color:var(--muted)}#onl .pw98r input{width:170px;flex:0 0 170px}#onl .pw98r .btn{width:auto;margin:0}#onl .pw98r small{flex-basis:100%}
.pw98pop .pw98f{display:grid;gap:8px}.pw98pop .pw98f input{width:100%}
.hc98pop .hc98box{max-width:560px;width:calc(100vw - 32px)}
.hc98 .hc98-top{display:flex;gap:12px;align-items:center}.hc98 .hc98-crest{width:74px;height:auto;border-radius:6px;box-shadow:0 2px 6px #000a}
.hc98 h3{margin:0;font:700 20px Georgia,serif;color:var(--gold,#e8c96a)}.hc98 .hc98-ttl>small{color:var(--muted)}
.hc98 .hc98-dr{display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap}.hc98 .hc98-dr img{height:44px}.hc98 .hc98-dr span{display:grid;white-space:nowrap}.hc98 .hc98-dr small{color:var(--muted);font-size:11.5px}
.hc98 .hc98-best{margin-left:auto;font-size:12px;color:var(--muted);display:flex!important;gap:4px;align-items:center}
.hc98 .hc98-rec{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:10px 0;text-align:center}.hc98 .hc98-rec span{display:grid;border:1px solid #4a3a26;border-radius:8px;padding:4px}
.hc98 .hc98-rec b{font:700 16px Georgia,serif}.hc98 .hc98-rec small{color:var(--muted);font-size:11px}
.hc98 .hc98-cols{display:grid;grid-template-columns:1.3fr 1fr;gap:12px}.hc98 h4{margin:0 0 4px;font:700 13px Georgia,serif;color:var(--gold,#e8c96a)}
.hc98 .hc98-gl{list-style:none;margin:0;padding:0;display:grid;gap:3px;font-size:13px;max-height:150px;overflow:auto}.hc98 .hc98-gl small{color:var(--muted)}.hc98 .hc98g{float:right}
.hc98 .hc98-last{display:flex;gap:5px;flex-wrap:wrap}.hc98 .hc98e{display:inline-grid;place-items:center;min-width:28px;height:28px;border-radius:6px;font:700 13px Georgia,serif;border:1px solid}
.hc98 .hc98e.w{color:#9fe08f;border-color:#4f8a45;background:#1f3319}.hc98 .hc98e.l{color:#f0a090;border-color:#8a4535;background:#331b16}.hc98 .hc98e.d{box-shadow:inset 0 -3px 0 #000}
.hc98 .acts{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:12px}.hc98 .acts .btn{width:auto;margin:0}
@media(max-width:600px){.hc98 .hc98-cols{grid-template-columns:1fr}.hc98 .hc98-rec{grid-template-columns:repeat(3,minmax(0,1fr))}}
#onl .dr98-top{display:flex;gap:8px;align-items:center;justify-content:center;margin:0 0 8px;padding-bottom:8px;border-bottom:1px dashed rgba(255,255,255,.12)}
#onl .dr98-big{width:54px;height:90px;filter:drop-shadow(0 3px 5px #000b)}#onl .dr98-t{display:grid;line-height:1.2}#onl .dr98-t b{font:700 15px Georgia,serif;color:#f3e3bd}#onl .dr98-t small{color:var(--muted);font-size:11px}
#onl .ev98row{margin-top:8px}#onl .ev98h{font:700 12.5px Georgia,serif;color:var(--gold,#e8c96a);margin:0 0 4px}#onl .ev98h small{font:400 11.5px system-ui,sans-serif;color:var(--muted)}
#onl .ev98g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#onl .ev98s{display:flex;gap:10px;align-items:center;border:1px solid #6b5636;border-radius:10px;padding:5px 8px;background:linear-gradient(135deg,#2a2017,#1c140e);height:64px;box-sizing:border-box;overflow:hidden;transition:opacity .6s}
#onl .ev98s.in{opacity:0}#onl .ev98a{width:38px;height:54px;flex:none;overflow:hidden;border-radius:4px}#onl .ev98a img,#onl .ev98a>*{max-width:38px;max-height:54px}
#onl .ev98b{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:8px;min-width:0;flex:1;align-items:center}
#onl .ev98b b{font:700 14px Georgia,serif;color:#f3e3bd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#onl .ev98b small{color:var(--muted);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;grid-column:1}
#onl .ev98b small+small{display:none}#onl .ev98b .btn{grid-column:2;grid-row:1/3;width:auto;margin:0}
body.calm #onl .ev98s{transition:none}
@media(max-width:600px){#onl .ev98g{grid-template-columns:1fr}}
#onl .pr98{display:flex;flex-direction:column;gap:12px}
#onl .pr98-h{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:18px;align-items:center;padding:12px 18px;border-radius:10px;border:1px solid #5a4630;overflow:hidden;
  background:linear-gradient(90deg,#1a120dee,#1a120d99 50%,#1a120df0),linear-gradient(90deg,color-mix(in srgb,var(--hc1) 45%,transparent),transparent 55%),url(assets/stone_wall.webp) center/420px auto,#241a12}
#onl .pr98-crest{width:84px;height:auto;border-radius:6px;box-shadow:0 6px 10px #000c}
#onl .pr98-lan{font:500 11px var(--mono,monospace);letter-spacing:.16em;color:var(--muted);text-transform:uppercase}
#onl .pr98-who h2{margin:0;font:400 30px/1.1 Georgia,serif;color:var(--gold,#e8c96a);text-shadow:0 2px 6px #000}#onl .pr98-house{font-size:15px;color:#eadbb8;margin-top:2px}#onl .pr98-house b{font:700 16px Georgia,serif;color:#f3e3bd}
#onl .pr98-stats{display:flex;gap:14px;margin-top:8px;flex-wrap:wrap}#onl .pr98-stats span{font-size:12.5px;color:var(--muted)}#onl .pr98-stats b{font:600 14.5px var(--mono,monospace);color:#eadbb8;margin-right:4px}
#onl .pr98-id{display:flex;flex-direction:column;gap:7px;min-width:290px}
#onl .pr98-fid{display:flex;align-items:center;gap:6px;padding:5px 6px 5px 10px;border:1px solid #6b5236;border-radius:7px;background:#160f0bdd}
#onl .pr98-fid small{font:500 10.5px var(--mono,monospace);letter-spacing:.12em;color:var(--muted)}#onl .pr98-fid b{font:600 17px var(--mono,monospace);color:var(--gold,#e8c96a);letter-spacing:.06em;flex:1}
#onl .pr98-fid .btn,#onl .pr98-ren .btn{width:auto;margin:0}
#onl .pr98-ren{display:flex;gap:6px}#onl .pr98-ren input{flex:1;min-width:0}#onl .pr98-hint{font-size:12px;color:var(--muted);text-align:right}
#onl .pr98-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}#onl .pr98-col{display:grid;gap:12px;min-width:0}
#onl .pr98-c{margin:0;padding:12px 14px}#onl .pr98-c h3{margin:0 0 8px}
#onl .pr98-row{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:9px 10px;border:1px solid #3a2c1e;border-radius:7px;background:rgba(255,255,255,.025);margin-bottom:6px}
#onl .pr98-row .t{display:grid;gap:2px;min-width:0}#onl .pr98-row .t b{font-size:14px;color:#eadbb8}#onl .pr98-row .t span{font-size:12.5px;color:var(--muted)}
#onl .pr98-row .btn{width:auto;margin:0;flex:none}#onl .gold98{border-color:#c9a24a;color:#f3d58a}
#onl .sw98{position:relative;flex:none;width:42px;height:22px;cursor:pointer}#onl .sw98 input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}
#onl .sw98 i{position:absolute;inset:0;border-radius:11px;background:#3a2d20;border:1px solid #6b5636;transition:background .2s}#onl .sw98 i::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#bba98a;transition:transform .2s}
#onl .sw98 input:checked+i{background:#8a6a2a;border-color:#e2b64a}#onl .sw98 input:checked+i::after{transform:translateX(20px);background:#f3d58a}#onl .sw98 input:focus-visible+i{outline:2px solid #e8c96a;outline-offset:2px}
body.calm #onl .sw98 i,body.calm #onl .sw98 i::after{transition:none}
#onl .seg98{display:flex;border:1px solid #6b5636;border-radius:7px;overflow:hidden;flex:none}#onl .seg98 label{position:relative;padding:6px 10px;font-size:13px;color:var(--muted);cursor:pointer;border-left:1px solid #4a3a26}
#onl .seg98 label:first-child{border-left:0}#onl .seg98 label.on{background:#3a2a18;color:var(--gold,#e8c96a)}#onl .seg98 input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}#onl .seg98 label:has(input:focus-visible){outline:2px solid #e8c96a;outline-offset:-2px}
#onl .pr98-lbl{font:500 11px var(--mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:10px 0 6px;display:flex;justify-content:space-between;align-items:center}
#onl .pr98-all{background:none;border:0;color:var(--gold,#e8c96a);cursor:pointer;font-size:12px;text-transform:none;letter-spacing:0}
#onl .pr98-fol{display:grid;gap:5px}#onl .pr98-fol div{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid #3a2c1e;border-radius:6px;background:rgba(255,255,255,.025);font-size:14px}
#onl .pr98-fol i{width:9px;height:9px;border-radius:50%;flex:none}#onl .pr98-fol small{margin-left:auto;color:var(--muted);font-size:12px}#onl .pr98-fol .btn{width:auto;margin:0}
#onl .pr98-danger{margin-top:8px;padding:10px 12px;border:1px solid #6e2a22;border-radius:7px;background:linear-gradient(135deg,#3a1510,#22140f)}#onl .pr98-danger b{color:#ffb7a8}
#onl .pr98-danger p{margin:4px 0 8px;font-size:13px;color:#d9b8ac}#onl .pr98-del{border-color:#c0513f;color:#ffb7a8;background:#2e1410;width:auto}
#onl .pr98 .pr96-tst{border:1px dashed #3f9a8c;background:linear-gradient(135deg,#132824,#1f1711 60%)}
@media(max-width:600px){#onl .pr98-h{grid-template-columns:auto minmax(0,1fr);gap:12px;padding:12px}#onl .pr98-crest{width:62px}#onl .pr98-who h2{font-size:24px}
 #onl .pr98-id{grid-column:1/-1;min-width:0}#onl .pr98-hint{text-align:left}#onl .pr98-g{grid-template-columns:minmax(0,1fr)}
 #onl .pr98-row:has(.seg98){flex-wrap:wrap}#onl .pr98-row:has(.seg98) .t{flex-basis:100%}#onl .seg98{width:100%}#onl .seg98 label{flex:1;text-align:center;padding:6px 4px}}
`;document.head.appendChild(css)}
