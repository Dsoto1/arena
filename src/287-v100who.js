/* =====================================================================
   287-v100who · v1.0 WHO'S ONLINE (his picks 1c 2b 3a; shared rules = the v1.0 WHO'S ONLINE section of 111-onlcore; the server = its
   "v1.0 WHO'S ONLINE" block in server/src/routes.js; no protocol bump)
   =====================================================================
   1 · WHERE (1c): a compact panel beside the Orbis Terrarum on the Online landing (#who100p: its own grid column between the stage and the
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
  const card=r.dom?`<button type="button" class="btn tksm" data-hc98="${esc2(r.id)}" title="${esc2(_T('House card'))}" aria-label="${esc2(_T('House card'))}">🏛${lbl(_T('House'))}</button>`:'';
  const fol=r.me||who100Guest()||!r.dom?'':`<button type="button" class="btn tksm ${r.fo?'on':''}" data-w100="fol" data-v="${esc2(r.dom)}" data-on="${r.fo?0:1}" title="${esc2(r.fo?_T('Following — click to stop'):_T('Follow this house'))}" aria-label="${esc2(r.fo?_T('Unfollow'):_T('Follow'))}">${r.fo?'★':'☆'}${lbl(r.fo?_T('Following'):_T('Follow'))}</button>`;
  return `<div class="w100r w100-${esc2(r.st)} ${r.me?'w100me':''}" data-w100r="${esc2(r.id)}">${ban}
    <span class="w100who"><span class="w100l1"><i class="w100dot" title="${esc2(stx)}" aria-hidden="true"></i><b class="w100n" ${r.dom?`data-hc98="${esc2(r.id)}" role="button" tabindex="0" title="${esc2(r.dn?onlHouse82(r.dn):'')}"`:''}>${esc2(nm)}</b>${you}<span class="w100rg">${flag}</span></span>
      <small>${r.g?esc2(r.g):'—'} ${onlRankChip(r.rk||'tiro')}${full&&r.dn?` · <span class="w100dn">${esc2(onlHouse82(r.dn))}</span>`:''}</small></span>
    <span class="w100st"><span class="sr93">${_T`Status:`} </span>${esc2(stx)}</span>
    <span class="w100acts">${watch}${inv}${card}${fol}</span></div>`}
function who100Shown(full){let rows=WHO100.rows||[];if(full){rows=ONLC.whoKeep100(rows,{status:WHO100.f.st,region:WHO100.f.reg});rows=ONLC.whoSort100(rows,WHO100.f.sort)}return rows}
function who100ListHTML(full){if(!WHO100.at&&!WHO100.err)return `<p class="rc-sub w100empty">${_T`Looking around the forum…`}</p>`;
  if(WHO100.err&&!WHO100.rows.length)return `<p class="onl-err w100empty">${esc2(WHO100.err)}</p>`;
  const rows=who100Shown(full);const others=rows.filter(r=>!r.me).length;
  return rows.map(r=>who100Row(r,full)).join('')+(others?'':`<p class="rc-sub w100empty">${full&&(WHO100.f.st||WHO100.f.reg)?_T('Nobody matches these filters.'):_T('Nobody else is online right now.')}</p>`)
    +(full&&WHO100.next?`<div class="w100more"><button type="button" class="btn tksm" data-w100="more">${_T`Show more`} · ${Math.max(0,(WHO100.n|0)-WHO100.rows.length)}</button></div>`:'')}
const who100Count=()=>(WHO100.n||WHO100.rows.length)-((WHO100.rows||[]).some(r=>r.me)?1:0);
/* the landing panel (beside the Orbis) */
function who100PanelHTML(){return `<div class="a100-who card2" id="who100p"><div class="w100h"><b>${_T`👥 Online now`}</b><span class="rc-sub" id="who100pN">${WHO100.at?Math.max(0,who100Count()):''}</span>
    <button type="button" class="btn tksm" data-w100="all" title="${esc2(_T('Everyone online, with filters'))}">${_T`All ›`}</button></div><div class="w100list" id="who100pL">${who100ListHTML(false)}</div></div>`}
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
function who100Patch(){const a=document.getElementById('who100pL');if(a){const h=who100ListHTML(false);if(a.innerHTML!==h)a.innerHTML=h}
  const b=document.getElementById('who100tL');if(b){const h=who100ListHTML(true);if(b.innerHTML!==h)b.innerHTML=h}
  const n=Math.max(0,who100Count());const pn=document.getElementById('who100pN');if(pn)pn.textContent=WHO100.at?String(n):'';const tn=document.getElementById('who100tN');if(tn)tn.textContent=WHO100.at?_T`${n} online`:'';
  const tb=document.querySelector('#onl .w100tab[data-w100tab="who"]');if(tb)tb.textContent=_T('👥 Online now')+(WHO100.at?` · ${n}`:'')}
const who100Showing=()=>!!(document.getElementById('who100p')||document.getElementById('who100t'));
async function who100Fetch(more){if(WHO100.busy)return;WHO100.busy=true;
  try{const r=await NET.req('here.list',more&&WHO100.next?{cursor:WHO100.next}:{});const rows=Array.isArray(r&&r.rows)?r.rows:[];
    if(more){const seen=new Set(WHO100.rows.map(x=>x.id));WHO100.rows=WHO100.rows.concat(rows.filter(x=>!seen.has(x.id)))}else WHO100.rows=rows;
    WHO100.n=r&&r.n|0;WHO100.next=r&&r.next||null;WHO100.at=Date.now();WHO100.err=''}
  catch(e){WHO100.err=errText92(e,_T('The list could not be read.'));WHO100.at=WHO100.at||Date.now()}
  finally{WHO100.busy=false;who100Patch()}}
function who100Due(){return who100Showing()&&!document.hidden&&!document.body.classList.contains('idle92')&&Date.now()-WHO100.at>=ONLC.WHO100.POLL_MS-400}
setInterval(()=>{try{if(who100Due())who100Fetch()}catch(e){}},5000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&who100Due())who100Fetch()});

/* the landing: the panel beside the stage's Orbis (its own column on desktop) */
{const base=onlPlayHTML;onlPlayHTML=function(){const h=base.apply(this,arguments);try{if(WHO100_OFF||typeof h!=='string'||h.indexOf('a81-week')<0||h.indexOf('who100p')>=0)return h;
  const T=document.createElement('template');T.innerHTML=h;const wk=T.content.querySelector('.onl-play81>.a81-week');if(!wk)return h;
  const box=document.createElement('div');box.className='a100-whow';box.innerHTML=who100PanelHTML();wk.after(box);T.content.querySelector('.onl-play81').classList.add('w100on');
  if(!WHO100.busy&&Date.now()-WHO100.at>=ONLC.WHO100.POLL_MS-400)setTimeout(()=>who100Fetch(),0);return T.innerHTML}catch(e){console.error(e);return h}}}
/* the Lobby Browser: Rooms | 👥 Online now */
{const base=onlLobbyHTML;onlLobbyHTML=function(){if(WHO100_OFF)return base.apply(this,arguments);if(WHO100.lb==='who'){if(!WHO100.busy&&Date.now()-WHO100.at>=ONLC.WHO100.POLL_MS-400)setTimeout(()=>who100Fetch(),0);return who100TabsHTML()+who100TabHTML()}
  const h=base.apply(this,arguments);return who100TabsHTML()+h}}

/* the controls */
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('#onl [data-w100tab]');if(t){e.preventDefault();WHO100.lb=t.dataset.w100tab==='who'?'who':'rooms';who100Save();onlRedraw();return}
  const b=e.target.closest&&e.target.closest('#onl [data-w100]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();const a=b.dataset.w100,v=b.dataset.v;
  if(a==='all'){WHO100.lb='who';who100Save();ONL.tab='lobby';onlRedraw();return}
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
    if(maps.fight.has(h.id)&&!h.match)maps.fight.delete(h.id);
    const ch=onlMockChar(w,h.id);const D=A0.domus&&typeof mockDomus82==='function'?mockDomus82(w,A0.domus):null;
    let w100=null;for(const [id,M] of Object.entries(w.matches||{})){const L=w.lobbies[id];if(M&&M.watch&&M.watch[h.id]&&L&&L.status==='live'){w100={id,at:now};break}}
    const hide=typeof mockHidden89==='function'&&mockHidden89(w,h.id);
    const A={...A0,id:h.id,dname:(D&&D.name)||A0.dname||'',w100,priv89:A0.priv89||(hide?{hide:true}:undefined),here:{glad:ch?ch.name:'',rank:ch?ONLC.rankFor(ch).k:'tiro',tz:hide?'':(h.tz||A0.tz||'')}};
    rows.push(ONLC.whoRow100(A,maps,{dr:D?ONLC.drankOf98(+D.dr98||0).k:'',viewer:V}))}
  return {...ONLC.whoPage100(ONLC.whoSort100(ONLC.whoKeep100(rows,d),d.sort),d.cursor),at:now}};
if(!ONLC.GUEST_OK.includes('here.list'))ONLC.GUEST_OK.push('here.list');

{const st=document.createElement('style');st.textContent=`
@media(min-width:1100px){#onl .onl-play81.v85.w100on{grid-template-columns:minmax(0,1fr) 235px 285px;grid-template-areas:"stage who week" "stage who forum" "pls pls pls";grid-template-rows:auto 1fr auto}
 #onl .w100on .a100-whow{position:relative;min-height:150px;align-self:stretch}#onl .w100on .a100-who{position:absolute;inset:0}#onl .w100on .a100-who .w100list{flex:1;max-height:none}}
@media(min-width:1400px){#onl .onl-play81.v85.w100on{grid-template-columns:minmax(0,1fr) 260px 320px}}
@media(min-width:1100px) and (max-width:1399px){#onl .w100on .onl-party{gap:5px}#onl .w100on .onl-party .onl-slot{width:62px;height:78px}}
@media(min-width:761px) and (max-width:1099px){#onl .onl-play81.v85.w100on{grid-template-areas:"stage stage" "week forum" "who who" "pls pls";grid-template-rows:none}}
.a100-whow{grid-area:who;min-width:0}
.a100-who{padding:8px 10px;display:flex;flex-direction:column;gap:6px;min-height:0}
.w100h{display:flex;align-items:center;gap:8px}.w100h b{flex:1;white-space:nowrap}.w100h .btn{white-space:nowrap;padding:1px 7px}
.a100-who .w100list{max-height:136px;overflow-y:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:3px;padding-right:2px}
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
@media (max-width:760px){#onl .onl-play81.v85.w100on{grid-template-areas:"stage" "who" "pls" "forum" "week";grid-template-rows:none}
 .w100full .w100r{grid-template-columns:20px minmax(0,1fr) auto;grid-template-areas:"b w s" "b a a"}
 .w100full .w100r>.w100ban{grid-area:b}.w100full .w100r>.w100who{grid-area:w}.w100full .w100r>.w100st{grid-area:s}.w100full .w100r>.w100acts{grid-area:a;flex-wrap:wrap}
 .w100full .w100bl{display:none}}
`;document.head.appendChild(st)}
