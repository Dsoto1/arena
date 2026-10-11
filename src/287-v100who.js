/* =====================================================================
   287-v100who · v1.0 WHO'S ONLINE (his picks 1c 2b 3a; shared rules = the v1.0 WHO'S ONLINE section of 111-onlcore; the server = its
   "v1.0 WHO'S ONLINE" block in server/src/routes.js; no protocol bump)
   =====================================================================
   1 · WHERE (1c) [the landing panel was removed again, see FOLLOW-UP]: a compact panel beside the Orbis Terrarum on the Online landing (#who100p: its own grid column between the stage and the
       This week / Acta column on desktop, as tall as the stage and scrolling inside itself — it adds no height, so the landing still fits
       without page scroll at ≥1300×900, 142's rule; tablets a row under This week, phones right under the stage) AND a "👥 Online now" tab in the Lobby
       Browser (#who100t: Rooms | Online now strip over the list; the full list with status / region filters and a sort, "Show more" pages
       through the server's cursor). Filters + the tab live in localStorage flavius_onlwho100 (a per-viewer convenience).
   2 · ROWS (2b): the house banner (the Domus-rank banner dr98URI, its name on hover), the lanista name (opens the house card), the active
       gladiator + rank chip, the status (● idle on the landing / in a room / fighting / watching) and the region flag (rg98Flag from the time zone).
       My own row comes first, marked "you" ("you · hidden" when I hide myself).
   3 · ACTIONS (3a): ✉ Invite (lobby.invite to my room — disabled with the reason when I am not hosting a waiting room, they are fighting or in
       a room, take no invitations, or already sit in mine), 👁 Watch (fighting / watching: onlWatch of that match), 🏛 the house card
       (hc98Open), ★ Follow / ☆ (ONL83.follow). Guests read the list; Invite and Follow are not offered to them.
   4 · DATA: here.list once when a panel opens, then every 30 s (ONLC.WHO100.POLL_MS) while a panel shows, the tab is visible and the page is
       not idle (body.idle92). A REAL timer (a 5 s check, cheap: it only asks when due) — not a PERF92 sweep, so the 30 s pace holds while quiet.
       Lists are patched in place (#who100pL / #who100tL) — the rest of the screen never redraws for it.
   MOCK: MOCK_ROUTES['here.list'] mirrors the server (presence = mockHere80; watching = a live match's M.watch; hidden via mockHidden89).
   Kill switch localStorage flavius_who100off=1. Never in S / onlHash. Test tonl100w.
   FOLLOW-UP (his answers 2026-10-11): the landing panel is GONE (the list lives only in the Lobby Browser's "👥 Online now" tab; a lanista with no house or
   gladiator yet shows only there — the server lists every present non-hidden account). PER-GLADIATOR status: a row's st = the lanista's CURRENT activity;
   a gladiator of his still fighting in a match he abandoned (Custom, CPU holds the seat) rides as `ab {m,g}` → a second chip "⚔ <gladiator> still fighting"
   + 👁 Watch on that match. THE LANDING (a100): ★ Followed houses (+ its Find box) left the landing — the Find section of 👤 Profile & Settings already
   holds them, and now finds a house by NAME or FID; the 📜 Acta of the day box is merged INTO the 🏆 Biggest winner / 🪦 Biggest loser boxes (each lists its
   top line + the day's acta lines that fit it, "See today's list ›"). The grid is the stage + playlists on the left and ONE right column (This week + the
   two boxes) — fits without scrolling at ≥1300×900; tablets stack it; phones one column.
   ===================================================================== */
const WHO100=(()=>{const o={rows:[],n:0,next:null,at:0,busy:false,err:'',lb:'rooms',f:{st:'',reg:'',sort:'st'}};
  try{const x=JSON.parse(localStorage.getItem('flavius_onlwho100')||'null');if(x&&typeof x==='object'){if(x.lb==='who')o.lb='who';if(x.f&&typeof x.f==='object')o.f={...o.f,...x.f}}}catch(e){}return o})();
const WHO100_OFF=(()=>{try{return localStorage.getItem('flavius_who100off')==='1'}catch(e){return false}})(); /* kill switch: both panels off */
function who100Save(){try{localStorage.setItem('flavius_onlwho100',JSON.stringify({lb:WHO100.lb,f:WHO100.f}))}catch(e){}}
const who100Guest=()=>!ONL.acct||(typeof onlIsGuest82==='function'&&onlIsGuest82());
const WHO100_ST={idle:_T('idle'),room:_T('in a room'),fight:_T('fighting'),watch:_T('watching')};
/* the waiting room I host (Invite needs it) */
function who100MyRoom(){const me=ONL.acct&&ONL.acct.id;if(!me)return null;return (ONL.lobbies||[]).find(L=>L&&L.status==='waiting'&&L.host&&L.host.id===me)||null}
function who100InvWhy(r){if(who100Guest())return _T('Sign in to invite.');if(r.me)return '';const L=who100MyRoom();if(!L)return _T('Open a room first — you invite to the room you host.');
  if([...(L.members||[]),...(L.players||[])].some(m=>m&&m.id===r.id))return _T('Already in your room.');if(r.st==='fight')return _T('Fighting right now.');
  if(r.st==='room')return _T('Already in another room.');if(r.ni)return _T('They take no invitations from you.');return ''}
function who100Row(r,full){const nm=r.ln||r.g||_T('A lanista');const drn=r.dr&&typeof dr98Name==='function'?dr98Name(r.dr):'';const stx=WHO100_ST[r.st]||r.st;
  const ban=r.dr&&typeof dr98URI==='function'?`<img class="w100ban" src="${dr98URI(r.dr)}" alt="" title="${esc2(drn)}">`:`<span class="w100ban w100nob" aria-hidden="true"></span>`;
  const flag=r.rg&&typeof rg98Flag==='function'?rg98Flag(r.rg):'';
  const you=r.me?`<i class="w100you">${r.hid?_T('you · hidden'):_T('you')}</i>`:'';
  const lbl=t=>`<span class="w100bl">${t}</span>`;
  const inv=r.me||who100Guest()?'':(()=>{const why=who100InvWhy(r);return `<button type="button" class="btn tksm" data-w100="inv" data-v="${esc2(r.id)}" ${why?'disabled':''} title="${esc2(why||_T('Invite to your room'))}" aria-label="${esc2(_T('Invite'))}">✉${lbl(_T('Invite'))}</button>`})();
  const watch=(r.st==='fight'||r.st==='watch')&&r.m&&!r.me?`<button type="button" class="btn tksm" data-w100="watch" data-v="${esc2(r.m)}" title="${esc2(_T('Watch their match'))}" aria-label="${esc2(_T('Watch'))}">👁${lbl(_T('Watch'))}</button>`:'';
  const abG=r.ab?esc2(r.ab.g||_T('A gladiator')):'';
  const abw=r.ab&&!r.me?`<button type="button" class="btn tksm" data-w100="watch" data-v="${esc2(r.ab.m)}" title="${esc2(_T`Watch ${r.ab.g||_T('A gladiator')} fight on`)}" aria-label="${esc2(_T`Watch ${r.ab.g||_T('A gladiator')} fight on`)}">👁${lbl(_T('Watch'))}</button>`:'';
  const card=r.dom?`<button type="button" class="btn tksm" data-hc98="${esc2(r.id)}" title="${esc2(_T('House card'))}" aria-label="${esc2(_T('House card'))}">🏛${lbl(_T('House'))}</button>`:'';
  const fol=r.me||who100Guest()||!r.dom?'':`<button type="button" class="btn tksm ${r.fo?'on':''}" data-w100="fol" data-v="${esc2(r.dom)}" data-on="${r.fo?0:1}" title="${esc2(r.fo?_T('Following — click to stop'):_T('Follow this house'))}" aria-label="${esc2(r.fo?_T('Unfollow'):_T('Follow'))}">${r.fo?'★':'☆'}${lbl(r.fo?_T('Following'):_T('Follow'))}</button>`;
  return `<div class="w100r w100-${esc2(r.st)} ${r.me?'w100me':''}" data-w100r="${esc2(r.id)}">${ban}
    <span class="w100who"><span class="w100l1"><i class="w100dot" title="${esc2(stx+(r.g&&(r.st==='room'||r.st==='fight')?' · '+r.g:''))}" aria-hidden="true"></i><b class="w100n" ${r.dom?`data-hc98="${esc2(r.id)}" role="button" tabindex="0" title="${esc2(r.dn?onlHouse82(r.dn):'')}"`:''}>${esc2(nm)}</b>${you}<span class="w100rg">${flag}</span></span>
      <small>${r.g?esc2(r.g):'—'} ${onlRankChip(r.rk||'tiro')}${full&&r.dn?` · <span class="w100dn">${esc2(onlHouse82(r.dn))}</span>`:''}</small>${r.ab?`<small class="w100ab" data-w100ab="${esc2(r.ab.m)}">${_T`⚔ ${abG} still fighting`}</small>`:''}</span>
    <span class="w100st"><span class="sr93">${_T`Status:`} </span>${esc2(stx)}</span>
    <span class="w100acts">${watch}${abw}${inv}${card}${fol}</span></div>`}
function who100Shown(full){let rows=WHO100.rows||[];if(full){rows=ONLC.whoKeep100(rows,{status:WHO100.f.st,region:WHO100.f.reg});rows=ONLC.whoSort100(rows,WHO100.f.sort)}return rows}
function who100ListHTML(full){if(!WHO100.at&&!WHO100.err)return `<p class="rc-sub w100empty">${_T`Looking around the forum…`}</p>`;
  if(WHO100.err&&!WHO100.rows.length)return `<p class="onl-err w100empty">${esc2(WHO100.err)}</p>`;
  const rows=who100Shown(full);const others=rows.filter(r=>!r.me).length;
  return rows.map(r=>who100Row(r,full)).join('')+(others?'':`<p class="rc-sub w100empty">${full&&(WHO100.f.st||WHO100.f.reg)?_T('Nobody matches these filters.'):_T('Nobody else is online right now.')}</p>`)
    +(full&&WHO100.next?`<div class="w100more"><button type="button" class="btn tksm" data-w100="more">${_T`Show more`} · ${Math.max(0,(WHO100.n|0)-WHO100.rows.length)}</button></div>`:'')}
const who100Count=()=>(WHO100.n||WHO100.rows.length)-((WHO100.rows||[]).some(r=>r.me)?1:0);
/* the Lobby Browser tab */
function who100TabsHTML(){const t=(k,l)=>`<button type="button" class="w100tab ${WHO100.lb===k?'on':''}" data-w100tab="${k}" aria-pressed="${WHO100.lb===k}">${l}</button>`;
  return `<div class="w100tabs" role="tablist">${t('rooms',_T('⚔ Rooms'))}${t('who',_T('👥 Online now')+(WHO100.at?` · ${Math.max(0,who100Count())}`:''))}</div>`}
function who100TabHTML(){const f=WHO100.f;const opt=(v,l,cur)=>`<option value="${esc2(v)}" ${String(cur)===String(v)?'selected':''}>${esc2(l)}</option>`;
  const regs=(ONLC.REGIONS98||[]).map(R=>opt(R.k,typeof rg98Name==='function'?rg98Name(R.k):R.n,f.reg)).join('');
  return `<div class="w100tab-pane" id="who100t"><div class="w100bar">
     <label>${_T`Status`} <select data-w100f="st">${opt('',_T('Everyone'),f.st)}${['idle','room','fight','watch'].map(k=>opt(k,WHO100_ST[k],f.st)).join('')}</select></label>
     <label>${_T`Region`} <select data-w100f="reg">${opt('',_T('All regions'),f.reg)}${regs}${opt('none',_T('No region'),f.reg)}</select></label>
     <label>${_T`Sort`} <select data-w100f="sort">${opt('st',_T('Status'),f.sort)}${opt('name',_T('Name'),f.sort)}${opt('rank',_T('Rank'),f.sort)}${opt('region',_T('Region'),f.sort)}</select></label>
     <button type="button" class="btn tksm" data-w100="refresh" title="${esc2(_T('Refresh'))}">↻</button><span class="rc-sub" id="who100tN">${WHO100.at?_T`${Math.max(0,who100Count())} online`:''}</span></div>
    <div class="w100list w100full" id="who100tL">${who100ListHTML(true)}</div></div>`}
/* patch the lists in place (the rest of the screen stays) */
function who100Patch(){const b=document.getElementById('who100tL');if(b){const h=who100ListHTML(true);if(b.innerHTML!==h)b.innerHTML=h}
  const n=Math.max(0,who100Count());const tn=document.getElementById('who100tN');if(tn)tn.textContent=WHO100.at?_T`${n} online`:'';
  const tb=document.querySelector('#onl .w100tab[data-w100tab="who"]');if(tb)tb.textContent=_T('👥 Online now')+(WHO100.at?` · ${n}`:'')}
const who100Showing=()=>!!document.getElementById('who100t');
async function who100Fetch(more){if(WHO100.busy)return;WHO100.busy=true;
  try{const r=await NET.req('here.list',more&&WHO100.next?{cursor:WHO100.next}:{});const rows=Array.isArray(r&&r.rows)?r.rows:[];
    if(more){const seen=new Set(WHO100.rows.map(x=>x.id));WHO100.rows=WHO100.rows.concat(rows.filter(x=>!seen.has(x.id)))}else WHO100.rows=rows;
    WHO100.n=r&&r.n|0;WHO100.next=r&&r.next||null;WHO100.at=Date.now();WHO100.err=''}
  catch(e){WHO100.err=errText92(e,_T('The list could not be read.'));WHO100.at=WHO100.at||Date.now()}
  finally{WHO100.busy=false;who100Patch()}}
function who100Due(){return who100Showing()&&!document.hidden&&!document.body.classList.contains('idle92')&&Date.now()-WHO100.at>=ONLC.WHO100.POLL_MS-400}
setInterval(()=>{try{if(who100Due())who100Fetch()}catch(e){}},5000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&who100Due())who100Fetch()});

/* ---------- THE LANDING (a100): stage + playlists | one right column (This week, 🏆 Biggest winner, 🪦 Biggest loser) ---------- */
/* the day's acta lines that belong in each box (acta87Line = 149's one line; a line opens the day's list) */
function a100Acta(kind){const T=typeof ONL80F!=='undefined'?ONL80F.today:null;const L=((T&&T.acta)||[]).filter(e=>e&&!e.pre);
  const rows=kind==='fall'?L.filter(e=>(e.fell|0)>0):L.filter(e=>!!e.w);return rows.slice(0,3)}
function a100ActaHTML(kind){const rows=a100Acta(kind);if(!rows.length)return '';
  return `<div class="a100-acta" data-a100="${kind}"><div class="a100-ah">${kind==='fall'?_T`✝ Fell today`:_T`📜 Acta of the day`}</div>${rows.map(acta87Line).join('')}</div>`}
{const base=v85ShowHTML;v85ShowHTML=function(){const h=base.apply(this,arguments);try{if(WHO100_OFF||typeof acta87Line!=='function')return h;
  const T=document.createElement('template');T.innerHTML=h;
  for(const k of ['win','fall']){const box=T.content.querySelector(`.v85sc.${k}`);if(!box)continue;const a=a100ActaHTML(k);if(!a)continue;
    let i=box.querySelector(':scope>.v85sc-i');if(!i)continue;i.insertAdjacentHTML('beforeend',a)}
  return T.innerHTML}catch(e){console.error(e);return h}}}
{const base=onlPlayHTML;onlPlayHTML=function(){const h=base.apply(this,arguments);try{if(WHO100_OFF||typeof h!=='string'||h.indexOf('a85-show')<0||h.indexOf('a100-right')>=0)return h;
  const T=document.createElement('template');T.innerHTML=h;const g=T.content.querySelector('.onl-play81.v85');if(!g)return h;
  const wk=g.querySelector(':scope>.a81-week'),fo=g.querySelector(':scope>.a81-forum'),show=g.querySelector('.a85-show');if(!wk||!show)return h;
  for(const x of g.querySelectorAll('.fl83'))x.remove();if(fo)fo.remove();
  const right=document.createElement('div');right.className='a100-right';const inner=document.createElement('div');inner.className='a100-ri';inner.append(wk,show);right.appendChild(inner);g.appendChild(right);g.classList.add('l100');
  return T.innerHTML}catch(e){console.error(e);return h}}}
/* the Profile's Find: a name or a FID (the server's domus.visit takes both) */
{const base=l89FindHTML;l89FindHTML=function(follow){let h=base.apply(this,arguments);try{if(WHO100_OFF)return h;
  h=h.split(_T('🔍 Find a house by FID')).join(_T('🔍 Find a house by name or FID')).replace(/placeholder="[^"]*"/,`placeholder="${esc2(_T('House name or FID-XXXXXX'))}"`).replace('maxlength="14"','maxlength="40"')}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-l89="find"]');if(!b||WHO100_OFF)return;const i=b.parentElement&&b.parentElement.querySelector('input');const s=String((i&&i.value)||'').trim();
  if(!s||ONLC.fidClean(s))return;e.preventDefault();e.stopPropagation();V89L.find=s;if(s.length<2){V89L.findErr=_T('Type a house name or its FID.');onlRedraw();return}
  onl89Visit({name:s.replace(/^House /i,'')}).then(r=>{if(!r&&document.getElementById('onl')){V89L.findErr=_T('No house with that name.');onlRedraw()}})},true);
/* the Lobby Browser: Rooms | 👥 Online now */
{const base=onlLobbyHTML;onlLobbyHTML=function(){if(WHO100_OFF)return base.apply(this,arguments);if(WHO100.lb==='who'){if(!WHO100.busy&&Date.now()-WHO100.at>=ONLC.WHO100.POLL_MS-400)setTimeout(()=>who100Fetch(),0);return who100TabsHTML()+who100TabHTML()}
  const h=base.apply(this,arguments);return who100TabsHTML()+h}}

/* the controls */
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('#onl [data-w100tab]');if(t){e.preventDefault();WHO100.lb=t.dataset.w100tab==='who'?'who':'rooms';who100Save();onlRedraw();return}
  const b=e.target.closest&&e.target.closest('#onl [data-w100]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();const a=b.dataset.w100,v=b.dataset.v;
  if(a==='refresh'){WHO100.at=0;who100Fetch();return}
  if(a==='more'){who100Fetch(true);return}
  if(a==='inv'){const L=who100MyRoom();if(!L)return;b.disabled=true;try{await NET.req('lobby.invite',{id:L.id,to:v});onlToast80(_T('✉ Invitation sent.'))}catch(err){b.disabled=false;onlToast80('⚠ '+esc2(errText92(err)))}return}
  if(a==='watch'){let L=(ONL.lobbies||[]).find(x=>x.id===v);if(!L||L.status!=='live'){try{const rows=await NET.req('lobby.list',{});if(Array.isArray(rows))ONL.lobbies=rows}catch(err){}L=(ONL.lobbies||[]).find(x=>x.id===v)}
    if(!L||L.status!=='live'){onlToast80(_T('That match is over.'));WHO100.at=0;who100Fetch();return}return onlDo(()=>onlWatch(L))}
  if(a==='fol'){try{const r=await ONL83.follow(v,b.dataset.on==='1');if(typeof ONL83U!=='undefined')ONL83U.follows=r.follows||[];const on=b.dataset.on==='1';
      for(const r2 of WHO100.rows)if(r2.dom===v){if(on)r2.fo=1;else delete r2.fo}if(typeof ONL98!=='undefined')ONL98.hc={};who100Patch()}catch(err){onlToast80('⚠ '+esc2(errText92(err)))}return}},true);
document.addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('#onl select[data-w100f]');if(!s)return;WHO100.f[s.dataset.w100f]=s.value;who100Save();who100Patch()},true);

/* MOCK: the server's here.list, from the mock world */
MOCK_ROUTES['here.list']=(w,d,me)=>{d=d||{};const now=Date.now();const V=me&&w.accounts[me]&&!w.accounts[me].guest?w.accounts[me]:null;
  const maps=ONLC.whoMaps100(Object.values(w.lobbies||{}).filter(L=>!L.mock),now);const rows=[];
  for(const h of mockHere80(w)){if(h.bot)continue;const A0=w.accounts[h.id];if(!A0||A0.guest||/^guest/.test(h.id))continue;
    if(typeof mockHidden89==='function'&&mockHidden89(w,h.id)&&h.id!==me)continue;
    if(!h.match){maps.fight.delete(h.id);maps.fightAll.delete(h.id)}
    let ab=null;for(const L of Object.values(w.lobbies||{})){if(L.mock||L.status!=='live'||!L.players.some(p=>p.id===h.id))continue;const M=w.matches&&w.matches[L.id];
      if(M&&(M.abandoned||{})[h.id]&&M.status!=='done'){ab=ONLC.whoAb100({id:h.id},{id:L.id,status:'live',abandoned:M.abandoned,reports:M.reports},maps,!!L.ranked);if(ab)break}}
    const ch=onlMockChar(w,h.id);const D=A0.domus&&typeof mockDomus82==='function'?mockDomus82(w,A0.domus):null;
    let w100=null;for(const [id,M] of Object.entries(w.matches||{})){const L=w.lobbies[id];if(M&&M.watch&&M.watch[h.id]&&L&&L.status==='live'){w100={id,at:now};break}}
    const hide=typeof mockHidden89==='function'&&mockHidden89(w,h.id);
    const A={...A0,id:h.id,dname:(D&&D.name)||A0.dname||'',w100,priv89:A0.priv89||(hide?{hide:true}:undefined),here:{glad:ch?ch.name:'',rank:ch?ONLC.rankFor(ch).k:'tiro',tz:hide?'':(h.tz||A0.tz||'')}};
    rows.push(ONLC.whoRow100(A,maps,{dr:D?ONLC.drankOf98(+D.dr98||0).k:'',viewer:V,ab}))}
  return {...ONLC.whoPage100(ONLC.whoSort100(ONLC.whoKeep100(rows,d),d.sort),d.cursor),at:now}};
if(!ONLC.GUEST_OK.includes('here.list'))ONLC.GUEST_OK.push('here.list');

{const st=document.createElement('style');st.textContent=`
.w100r{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:6px;padding:3px 6px;border-radius:6px;background:rgba(255,255,255,.035);border:1px solid rgba(214,171,76,.14)}
.w100r.w100me{border-color:rgba(214,171,76,.55);background:rgba(214,171,76,.08)}
.w100ban{width:16px;height:24px;object-fit:contain;display:block}.w100nob{border-left:2px dashed rgba(255,255,255,.18);height:20px;margin-left:7px;width:0}
.w100who{min-width:0;display:flex;flex-direction:column;line-height:1.25}
.w100l1{display:flex;align-items:center;gap:5px;min-width:0}
.w100n{cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.w100n[data-hc98]:hover{text-decoration:underline}
.w100who small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--dim,#a3907a);font-size:12px}.w100who small .onl-rk{font-size:11px}
.w100you{font-style:normal;font-size:11px;color:#e2c46a;white-space:nowrap}
.w100dot{flex:none;width:9px;height:9px;border-radius:50%;background:#7d8a96;display:inline-block}
.w100-idle .w100dot{background:#6fbf73}.w100-room .w100dot{background:#e2b64a}.w100-fight .w100dot{background:#d9534f}.w100-watch .w100dot{background:#5aa9e6}
.w100rg{flex:none;display:inline-flex}.w100rg img{width:18px;height:13px;object-fit:cover;border-radius:2px;display:block}
.w100st{display:none;font-size:12px;white-space:nowrap;color:var(--dim,#a3907a)}
.w100acts{display:inline-flex;gap:3px;flex-wrap:nowrap}.w100acts .btn{padding:1px 5px;min-height:0;line-height:1.3}.w100acts .btn.on{color:#e2c46a}
.w100bl{display:none}
.w100empty{margin:4px 2px}
.w100tabs{display:flex;gap:6px;margin:0 0 8px}.w100tab{background:transparent;border:1px solid rgba(214,171,76,.3);color:inherit;border-radius:14px;padding:4px 12px;cursor:pointer;font:inherit}
.w100tab.on{background:rgba(214,171,76,.2);border-color:#d6ab4c;color:#f3dfa8}
.w100bar{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin-bottom:8px}.w100bar label{display:inline-flex;gap:6px;align-items:center}
.w100full{display:flex;flex-direction:column;gap:4px}.w100full .w100r{grid-template-columns:22px minmax(0,1fr) 92px auto;padding:6px 8px}
.w100full .w100ban{width:20px;height:30px}.w100full .w100st{display:block}.w100full .w100bl{display:inline;margin-left:4px}.w100full .w100acts .btn{padding:2px 8px}
.w100more{text-align:center;margin-top:6px}
/* the landing (a100) */
@media(min-width:1100px){#onl .onl-play81.v85.l100{grid-template-columns:minmax(0,1fr) 340px;grid-template-areas:"stage right" "pls right";grid-template-rows:auto 1fr}}
#onl .onl-play81.v85.l100 .a85-bot{grid-template-columns:minmax(0,1fr)}
#onl .l100>.a100-right{grid-area:right;align-self:stretch;position:relative;min-width:0;min-height:300px}
#onl .a100-ri{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}
#onl .a100-ri>.a81-week{flex:none;align-self:stretch}
#onl .a100-ri>.a85-show{flex:1 1 0;display:flex;flex-direction:column;min-height:0}
#onl .a100-ri .a85-show .onl-h{flex:none;margin:0 0 6px}
#onl .a100-ri .v85show{flex:1 1 0;display:grid;grid-template-columns:minmax(0,1fr);grid-auto-rows:minmax(0,1fr);gap:10px;min-height:0}
#onl .a100-ri .v85sc{min-height:0;overflow:hidden;align-items:flex-start}
#onl .a100-ri .v85sc.none{align-items:center}
#onl .a100-ri .v85sc-fig{margin-right:6px;width:50px}#onl .a100-ri .v85sc-fig .portrait{width:50px!important;height:68px!important}#onl .a100-ri .v85sc-tok{right:-16px}
#onl .a100-ri .v85sc-n>b{font-size:16px}
#onl .a100-ri .v85sc{gap:12px;padding:8px 10px}
#onl .a100-ri .v85sc-ev{white-space:normal}
#onl .a100-acta{display:flex;flex-direction:column;gap:1px;margin-top:4px;padding-top:4px;border-top:1px dashed rgba(214,171,76,.28);min-width:0}
#onl .a100-ah{font:600 10.5px system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#bfae88}
#onl .a100-acta .ac87{all:unset;cursor:pointer;display:block;font:11.5px/1.3 system-ui,sans-serif;padding:2px 0;color:#eadbb8;min-width:0}
#onl .a100-acta .ac87:hover,#onl .a100-acta .ac87:focus-visible{color:#fff}
#onl .a100-acta .ac87t{color:#a99474;margin-right:5px;font-size:10.5px}#onl .a100-acta .ac87e{margin-right:4px}
@media(min-width:761px) and (max-width:1099px){
 #onl .onl-play81.v85.l100{grid-template-columns:minmax(0,1fr);grid-template-areas:"stage" "right" "pls";grid-template-rows:none}
 #onl .l100>.a100-right{min-height:0}#onl .a100-ri{position:static;overflow:visible;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);align-items:start}
 #onl .a100-ri .v85show{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:auto}
}
@media(max-width:760px){
 #onl .onl-play81.v85.l100{grid-template-areas:"stage" "pls" "right";grid-template-rows:none}
 #onl .l100>.a100-right{min-height:0}#onl .a100-ri{position:static;overflow:visible}
 #onl .a100-ri .v85show{grid-auto-rows:auto}
}
@media(min-width:1600px) and (min-height:1000px){#onl .a100-ri .v85show{grid-template-columns:minmax(0,1fr)}}
.w100ab{color:#e8a58e!important;white-space:normal!important}
@media (max-width:760px){
 .w100full .w100r{grid-template-columns:20px minmax(0,1fr) auto;grid-template-areas:"b w s" "b a a"}
 .w100full .w100r>.w100ban{grid-area:b}.w100full .w100r>.w100who{grid-area:w}.w100full .w100r>.w100st{grid-area:s}.w100full .w100r>.w100acts{grid-area:a;flex-wrap:wrap}
 .w100full .w100bl{display:none}}
`;document.head.appendChild(st)}
