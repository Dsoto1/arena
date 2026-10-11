/* 234-v96onl — v0.96 PART D · ONLINE ROOM + LOBBY (his notes 2026-10-07/08: v0.96 NOTES "online reload", NOTES III 14/15/17).
   CLIENT ONLY: no server change (lobby.create already takes cry:false; the mock mirrors the server).
   1 · THE ROOM (mocks tools/plans/mock96 #room + mock2/mock3): the decorated onlRoomHTML80 (118 + 127/137/171/180/189/206 wrappers) is
       re-laid out by DOM moves (r96Layout) — nothing the earlier wrappers add is lost: event card + one-line strip on top with the actions
       (✉ Invite by FID, ✉ Invite, 📣 Call the crier, 🚪 Exit/Close lobby); seats CENTRED as a grid of cards (4 a row → 2×4 for 8 seats;
       figure, name, class · rank, ✓ Ready, team chip; open seats dashed with 🪑 Sit / ✉ Invite); table settings UNDER the seats (host edits,
       others read the rules line); on the right the lanistas in the room (👑 host, Give host ✕ kick — the old data-onl rhost/rkick handlers,
       standing / 🎟 stands, reconnecting); the quick-chat phrases bottom right. NO chat feed: a phrase pops as a bubble UNDER the speaker's
       token (a slot is kept under every token so names never jump; fades after R96.BUB ms) — a standing lanista's beside their name in the
       list. Patched in place by 198's morph91 (no flicker); bubbles are patched on the lobby.say push (onlPatchLog80 wrapper).
   2 · 🪙 SEND (206 lobby.send 0–10) sits INSIDE your own seat card and wears the gold coin (ICO.coin).
   3 · LEAVE: "🚪 Exit lobby" while other lanistas are in the room, "🚪 Close lobby" when you are alone (ticket holders keep "Give back the ticket").
   4 · THE CRIER only on the host's click: every lobby.create goes out with cry:false (a NET.req wrapper — 118's ＋ room buttons, 139's weekly
       challenge, the old 112 paths). The Praeco's "Find me a fight" (lobby.quick) still announces its room server-side (that IS the call).
   5 · LOBBY BROWSER: filter by event and city + sort (newest · event · city · open seats), client-side (ONL96 + localStorage flavius_onllb96);
       your own room is never filtered out; ↻ Refresh re-reads lobby.list (onlRefresh).
   6 · THE DOMUS loses Loadouts ("💾 Save what he wears", ▶ wear, 🛒 restock): d89Kits → ''.
   7 · RELOAD = BACK IN THE MATCH: on boot, a live-match record (121 flavius_onlmatch80) confirmed by hello.live sends you straight back
       (onlLive80Back) instead of waiting on the main menu row; 🚪 Abandon stays on the in-match bar (#btnOnlLeave). Off: localStorage
       flavius_onlauto96=0 (then the v0.80 menu row ⚔ Back / 🚪 Abandon shows as before). Test tonl96. */
const R96={BUB:6000 /* TWEAK: how long a phrase bubble shows */,bubT:0,auto:false};
const ONL96=(()=>{let f={ev:'',loc:'',sort:'new'};try{const x=JSON.parse(localStorage.getItem('flavius_onllb96')||'null');if(x&&typeof x==='object')f={...f,...x}}catch(e){}return f})();
const r96Now=()=>typeof onlNow82==='function'?onlNow82():Date.now();

/* ---------------- 1 · bubbles ---------------- */
function r96Line(L,id){const c=(L&&ONLF.chat[L.id])||[];for(let i=c.length-1;i>=0;i--){const l=c[i];if(l.sys||l.by!==id)continue;if(ONLF.muted&&ONLF.muted.has(l.by))return null;
    const age=r96Now()-(l.at||0);return age<R96.BUB&&age>-60000?{t:onlQ80(l.q),left:R96.BUB-Math.max(0,age)}:null}return null}
const r96BubHTML=(L,id,cls)=>{const b=r96Line(L,id);return `<span class="${cls} ${b?'on':''}" data-bub96="${esc2(id)}" aria-live="polite"><i>${b?esc2(b.t):''}</i></span>`};
function r96BubPatch(){const root=document.querySelector('#onl #onlRoom80');if(!root)return;const U=ONL.unseated80;const L=(U&&Date.now()<U.until&&U.L)||onlMyLobby();if(!L)return;let next=Infinity;
  for(const s of root.querySelectorAll('[data-bub96]')){const b=r96Line(L,s.dataset.bub96);const i=s.querySelector('i')||s.appendChild(document.createElement('i'));
    if(b){if(i.textContent!==b.t)i.textContent=b.t;s.classList.add('on');next=Math.min(next,b.left)}else s.classList.remove('on')}
  clearTimeout(R96.bubT);if(next<Infinity)R96.bubT=setTimeout(r96BubPatch,Math.max(60,next+30))}
{const base=onlPatchLog80;onlPatchLog80=function(){const r=base.apply(this,arguments);try{r96BubPatch()}catch(e){}return r}}
{const base=onlRedraw;onlRedraw=function(){const r=base.apply(this,arguments);try{r96BubPatch()}catch(e){}return r}}

/* ---------------- 1-3 · the room, laid out again ---------------- */
function r96Users(L,grey){const me=onlMe80();const host=L.host&&L.host.id===me;const off=(L.off)||{};const seated=new Set((L.players||[]).map(p=>p.id));
  const mem=(L.members&&L.members.length?L.members:(L.players||[]).filter(p=>!/^bot/.test(p.id||'')));
  const house=id=>{try{const d=typeof onlDomOf82==='function'?onlDomOf82(id):null;return d?esc2(onlHouse82(d)):''}catch(e){return ''}};
  const lan=id=>{try{const v=typeof V89L!=='undefined'&&V89L.names[id];return v?esc2(_T`lanista ${v.n}`):''}catch(e){return ''}};
  const row=m=>{const st=seated.has(m.id);const sub=[lan(m.id)||house(m.id),st?'':_T('standing')].filter(Boolean).join(' · ');
    const ctl=host&&m.id!==me&&!grey?`<span class="r96-ctl"><button type="button" class="btn tksm" data-onl="rhost" data-v="${esc2(m.id)}" title="${_T`Give the room to them`}">${_T`👑 Give host`}</button><button type="button" class="btn tksm" data-onl="rkick" data-v="${esc2(m.id)}" title="${_T`Remove from the room (5 minutes)`}" aria-label="${_T`Remove from the room`}">✕</button></span>`:(m.id===me?`<span class="r96-x">${_T`you`}</span>`:'');
    return `<div class="r96-u ${m.id===me?'me':''} ${off[m.id]?'off89':''}" data-u96="${esc2(m.id)}"><div class="r96-un"><b>${m.id===L.host.id?'👑 ':''}${esc2(m.id===me?_T('You'):m.name)}</b> ${m.rank?onlRankChip(m.rank):''}${st?'':r96BubHTML(L,m.id,'r96-lb')}
      <small>${sub}${off[m.id]?` · <span class="r89-rc">${_T`reconnecting…`}</span>`:''}</small></div>${ctl}</div>`};
  const fans=(L.stands||[]).map(t=>`<div class="r96-u fan ${t.id===me?'me':''}"><div class="r96-un"><b>🎟 ${esc2(t.id===me?_T('You'):(t.name||_T('A patron')))}</b><small>${_T`in the stands`}</small></div></div>`).join('');
  return `<div class="r96-users"><h4>${_T`In the room · ${mem.length}/${ONLC.ROOM_MAX}`}</h4>${mem.map(row).join('')}${fans}</div>`}
function r96Layout(h,L,grey){const me=onlMe80();const T=document.createElement('template');T.innerHTML=h;const root=T.content.querySelector('#onlRoom80');if(!root)return h;
  const q=s=>root.querySelector(s);const member=(L.members||[]).some(m=>m.id===me)||(L.players||[]).some(p=>p.id===me);const seatedMe=(L.players||[]).some(p=>p.id===me);
  const fan=!member&&(L.stands||[]).some(t=>t.id===me);root.classList.add('r96');const frag=s=>{const t=document.createElement('template');t.innerHTML=s;return t.content};
  /* top strip: event card + title/tags + actions */
  const head=q('.r80-head');const acts=document.createElement('div');acts.className='r96-acts';
  const fi=q('.fi89');if(fi)acts.appendChild(fi);const inv=q('[data-onl="rinvite"]');if(inv)acts.appendChild(inv);const call=q('[data-onl="rcall"]');
  if(call){const left=Math.max(0,ONLC.RATE.cryMax-(L.cry||[]).length);call.innerHTML=_T`📣 Call the crier <small>${left} left</small>`;acts.appendChild(call)}
  const lv=q('.r80-lv [data-onl="leave"]');if(lv){if(!fan){const others=(L.members||[]).filter(m=>m.id!==me).length;lv.textContent=others?_T('🚪 Exit lobby'):_T('🚪 Close lobby');
      lv.title=others?_T('Leave the room; the others stay (the crown passes to whoever joined earliest).'):_T('You are alone: leaving closes the room.')}acts.appendChild(lv)}
  const lvBox=q('.r80-lv');if(lvBox)lvBox.remove();if(head)head.appendChild(acts);
  /* the seats: cards */
  const seats=root.querySelectorAll('.r80-seats > .r80-seat');const snd=q('.snd92');
  seats.forEach((s,i)=>{const p=(L.players||[])[i];s.classList.add('r96s');const ctl=s.querySelector('.r80-ctl');if(ctl)ctl.remove();
    if(!p){s.classList.add('open');if(member&&!grey&&!s.querySelector('[data-onl="rinvite"]'))s.appendChild(frag(`<button type="button" class="btn tksm" data-onl="rinvite" data-v="${esc2(L.id)}">${_T`✉ Invite`}</button>`));return}
    const k=p.kit;const fig=document.createElement('div');fig.className='r96-fig';fig.innerHTML=k?onlFig(k.cls,k.look,96):'<span class="onl-rq">?</span>';
    for(const c of Array.from(s.children))if(!c.classList.contains('r80-who'))c.remove();
    s.insertBefore(fig,s.firstChild);fig.after(frag(r96BubHTML(L,p.id,'r96-bub')));
    const tm=s.querySelector('.onl-team');if(tm){tm.classList.add('r96-tm');s.insertBefore(tm,s.firstChild)}
    for(const x of s.querySelectorAll('.r80-who .ln89r'))x.remove();const dc=[...s.querySelectorAll('.r80-who .dom82c')];dc.slice(1).forEach(x=>x.remove());
    const nb=s.querySelector('.r80-who > b');const cr=[...s.querySelectorAll('.r80-who > span')].find(x=>x.textContent.trim()==='👑');if(cr&&nb){cr.remove();nb.insertBefore(document.createTextNode('👑 '),nb.firstChild)}
    const rd=s.querySelector('.onl-rdy');if(rd){rd.textContent=_T('✓ Ready');rd.classList.add('r96-rdy');s.insertBefore(rd,s.firstChild)}
    if(p.id===me&&snd){const b=snd.firstChild;if(b&&b.nodeType===3)b.nodeValue=' ';snd.insertBefore(frag(`${typeof ICO!=='undefined'&&ICO.coin?ICO.coin:''} ${_T`Send`}`),snd.firstChild);s.appendChild(snd)}});
  /* body: main (seats, settings, start) | side (lanistas, phrases) */
  const body=q('.r80-body');const main=q('.r80-main');const talk=q('.r80-talk');const chips=talk&&talk.querySelector('.ofor-chips');const stand=q('.r80-stand');if(stand)stand.remove();
  const set=q('.r80-set')||q('.r80-rules');if(set&&main){const box=document.createElement('div');box.className='r96-tbl';
    box.appendChild(frag(`<h4>${_T`Table settings`} <small>${set.classList.contains('r80-set')?_T('you are the host — changes reach everyone'):_T('set by the host')}</small></h4>`));set.before(box);box.appendChild(set);
    for(const x of root.querySelectorAll('.r80-main > .tbl82, .r80-main > .onl-busy'))box.appendChild(x);const go=q('.r80-go');if(go)box.appendChild(go)}
  if(body){const side=document.createElement('div');side.className='r96-side';side.appendChild(frag(r96Users(L,grey)));
    if(chips&&!grey&&member){const qc=document.createElement('div');qc.className='r96-qc';qc.appendChild(frag(`<small>${_T`Quick chat`}</small>`));qc.appendChild(chips);side.appendChild(qc)}
    if(talk)talk.remove();body.appendChild(side);body.classList.add('r96-body')}
  if(!seatedMe&&snd&&snd.parentNode)snd.remove();
  return T.innerHTML}
{const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){const h=base.apply(this,arguments);try{if(!L||typeof h!=='string')return h;return r96Layout(h,L,grey)}catch(e){console.error(e);return h}}}

/* ---------------- 4 · the crier only on the host's click ---------------- */
{const base=NET.req;NET.req=function(t,d,...rest){if(t==='lobby.create'&&(d==null||typeof d==='object')&&!(d&&'cry' in d))d={...(d||{}),cry:false};return base.call(this,t,d,...rest)}}

/* ---------------- 5 · the Lobby Browser: filters + sort ---------------- */
function lb96Save(){try{localStorage.setItem('flavius_onllb96',JSON.stringify(ONL96))}catch(e){}}
function lb96Rows(rows,mine){let r=(rows||[]).filter(L=>L===mine||((!ONL96.ev||L.ev===ONL96.ev)&&(ONL96.loc===''||String(L.loc)===String(ONL96.loc))));
  const free=L=>(L.seats|0)-((L.players||[]).length);const nm=L=>String(onlEvName(L.ev)),cn=L=>String(onlCityName(L.loc));
  if(ONL96.sort==='ev')r=r.slice().sort((a,b)=>nm(a).localeCompare(nm(b))||cn(a).localeCompare(cn(b)));
  else if(ONL96.sort==='loc')r=r.slice().sort((a,b)=>cn(a).localeCompare(cn(b))||nm(a).localeCompare(nm(b)));
  else if(ONL96.sort==='open')r=r.slice().sort((a,b)=>(a.status==='waiting'?0:1)-(b.status==='waiting'?0:1)||free(b)-free(a));
  return r}
function lb96BarHTML(all,shown){const opt=(v,l,cur)=>`<option value="${esc2(v)}" ${String(cur)===String(v)?'selected':''}>${esc2(l)}</option>`;
  const evs=[...new Set([...(ONLC.EVENTS_ALL||[]),...all.map(L=>L.ev)])].filter(Boolean);
  return `<div class="lb96f" id="lb96f"><label>${_T`Event`} <select class="tin" data-lb96="ev">${opt('',_T('All events'),ONL96.ev)}${evs.map(k=>opt(k,onlEvName(k),ONL96.ev)).join('')}</select></label>
    <label>${_T`City`} <select class="tin" data-lb96="loc">${opt('',_T('All cities'),ONL96.loc)}${(typeof LOCATIONS!=='undefined'?LOCATIONS:[]).map((x,i)=>x?opt(i,x.n,ONL96.loc):'').join('')}</select></label>
    <label>${_T`Sort`} <select class="tin" data-lb96="sort">${opt('new',_T('Newest'),ONL96.sort)}${opt('ev',_T('Event'),ONL96.sort)}${opt('loc',_T('City'),ONL96.sort)}${opt('open',_T('Open seats'),ONL96.sort)}</select></label>
    <span class="rc-sub">${_T`${shown} of ${all.length} shown`}</span><button type="button" class="btn tksm" data-lb96r="1" title="${_T`Read the list of rooms again`}">${_T`↻ Refresh`}</button></div>`}
{const base=onlLobbyHTML;onlLobbyHTML=function(){const keep=ONL.lobbies;const all=keep||[];const mine=onlMyLobby();const rows=lb96Rows(all,mine);ONL.lobbies=rows;let h;try{h=base.apply(this,arguments)}finally{ONL.lobbies=keep}
  try{const T=document.createElement('template');T.innerHTML=h;const top=T.content.querySelector('.onl-lbtop');const bar=document.createElement('template');bar.innerHTML=lb96BarHTML(all,rows.length);
    if(top){const r0=top.querySelector('[data-onl="refresh"]');if(r0)r0.remove();top.after(bar.content)}else T.content.prepend(bar.content);return T.innerHTML}catch(e){console.error(e);return h}}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('#onl [data-lb96]'))return;e.stopPropagation();ONL96[t.dataset.lb96]=t.value;lb96Save();try{onlRedraw()}catch(err){}},true);

document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('#onl [data-lb96r]');if(!t)return;e.preventDefault();e.stopPropagation();if(t.disabled)return;t.disabled=true;
  NET.req('lobby.list').then(rows=>{if(Array.isArray(rows)){ONL.lobbies=rows;ONLF.listAt=Date.now()}}).catch(err=>{try{onlToast80('⚠ '+esc2(errText92(err)))}catch(x){}}).finally(()=>{try{onlRedraw()}catch(x){}})},true);
/* ↻ lives in the filter bar now (the old top-row one is taken out above) */
/* ---------------- 6 · the Domus: no loadouts ---------------- */
if(typeof d89Kits==='function')d89Kits=function(){return ''};

/* ---------------- 7 · reload = straight back into the live match ---------------- */
async function onl96Auto(){if(R96.auto)return;R96.auto=true;try{if(localStorage.getItem('flavius_onlauto96')==='0')return}catch(e){}
  let x=typeof onlLive80Get==='function'?onlLive80Get():null;if(!x||!(typeof ONL_ON==='function'&&ONL_ON()))return;if((ONL.leftMatch||{})[x.id])return;if(S&&S.onl&&!S.over)return;
  try{if(!(await onlLive80Net()))return;await NET.req('hello',{all:1})}catch(e){return}
  x=onlLive80Get();if(!x){setTimeout(()=>{try{netIdleClose()}catch(e){}},1500);return}
  if(S&&S.onl&&!S.over)return;const m=document.getElementById('mainMenu');if(m&&m.hidden)return /* the player already went somewhere */;
  setTimeout(()=>{try{onlToast80(_T('⚔ Back to your match — 🚪 Abandon is on the arena bar.'))}catch(e){}},2500);await onlLive80Back()}
{const t0=Date.now();const iv=setInterval(()=>{try{if(Date.now()-t0>60000){clearInterval(iv);return}const m=document.getElementById('mainMenu');
  if(!window.FLAVIUS_READY||!m||m.hidden||(typeof CUR_MODAL!=='undefined'&&CUR_MODAL))return;clearInterval(iv);onl96Auto()}catch(e){clearInterval(iv)}},400)}

{const css=document.createElement('style');css.id='v96onlcss';css.textContent=`
#onl .onl-room80.r96 .r80-head{flex-wrap:wrap}
#onl .r96 .r96-acts{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:flex-end;margin-left:auto}
#onl .r96 .r96-acts .fi89{display:flex;flex-direction:row;flex-wrap:nowrap;gap:4px;align-items:center;margin:0;width:auto}#onl .r96 .r96-acts .fi89 input{width:118px;min-width:0;flex:0 0 118px}#onl .r96 .r96-acts .fi89 .btn{white-space:nowrap}
#onl .r96 .r96-acts .btn{flex:0 0 auto;width:auto;margin:0}
#onl .r96 .r96-body{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:14px;align-items:start;margin-top:10px}
#onl .r96 .r80-seats{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;max-width:880px;margin:0 auto}
#onl .r96 .r80-seat.r96s{position:relative;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;gap:2px;min-height:196px;padding:10px 6px 8px;border-radius:12px}
#onl .r96 .r80-seat.r96s.open{justify-content:center;border:2px dashed #6b5136;background:transparent}
#onl .r96 .r80-seat.r96s.open .r80-who{flex:0 0 auto}
#onl .r96 .r96-fig{height:100px;display:flex;align-items:flex-end;justify-content:center}#onl .r96 .r96-fig img,#onl .r96 .r96-fig svg,#onl .r96 .r96-fig canvas{max-height:100px}
#onl .r96 .r80-seat .r80-who{flex:0 0 auto;width:100%}#onl .r96 .r80-seat .r80-who b{font:700 14px Georgia,serif}
#onl .r96 .r96-tm{position:absolute;top:6px;left:8px}#onl .r96 .r96-rdy{position:absolute;top:6px;right:8px;font-size:11.5px;color:#7fd07a}
#onl .r96 .r96-bub{display:flex;justify-content:center;height:26px;margin-top:2px}
#onl .r96 .r96-bub i,#onl .r96 .r96-lb i{font-style:normal;background:#f3e6c4;color:#2a1d10;border-radius:12px;padding:2px 10px;font-size:12.5px;line-height:20px;position:relative;opacity:0;transition:opacity .45s;box-shadow:0 2px 6px #0006;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
#onl .r96 .r96-bub i::before{content:'';position:absolute;top:-5px;left:50%;margin-left:-5px;border:5px solid transparent;border-top:0;border-bottom-color:#f3e6c4}
#onl .r96 .r96-bub:not(.on) i,#onl .r96 .r96-lb:not(.on) i{visibility:hidden}#onl .r96 .r96-bub.on i,#onl .r96 .r96-lb.on i{opacity:1;visibility:visible}
#onl .r96 .r96-lb{display:inline-flex;margin-left:4px;vertical-align:middle}#onl .r96 .r96-lb:not(.on){width:0;margin:0}
#onl .r96 .snd92{display:flex;align-items:center;gap:4px;justify-content:center;margin-top:6px;font-size:12.5px}#onl .r96 .snd92 .coinimg{width:16px;height:16px;vertical-align:middle}
#onl .r96 .r96-tbl{margin:12px auto 0;max-width:880px;padding:8px 12px;border:1px solid #4a3a26;border-radius:10px;background:rgba(255,255,255,.02)}
#onl .r96 .r96-tbl h4{margin:0 0 4px;font:700 13px Georgia,serif;color:var(--gold,#e8c96a);letter-spacing:.04em}#onl .r96 .r96-tbl h4 small{font:400 12px system-ui,sans-serif;color:var(--muted)}
#onl .r96 .r96-tbl .r80-set{border:0;padding:0;margin:4px 0}#onl .r96 .r96-tbl .r80-go{justify-content:flex-end}
#onl .r96 .r96-side{display:flex;flex-direction:column;gap:10px;border:1px solid #4a3a26;border-radius:10px;padding:10px;background:linear-gradient(#2a2017,#211913)}
#onl .r96 .r96-users h4{margin:0 0 6px;font:700 14px Georgia,serif;color:var(--gold,#e8c96a)}
#onl .r96 .r96-u{display:flex;gap:6px;align-items:center;padding:5px 4px;border-bottom:1px solid #3a2d1e}#onl .r96 .r96-u.me{background:rgba(232,201,106,.07)}
#onl .r96 .r96-un{flex:1;min-width:0}#onl .r96 .r96-un small{display:block;color:var(--muted);font-size:11.5px}#onl .r96 .r96-x{font-size:11px;color:var(--muted)}
#onl .r96 .r96-ctl{display:flex;gap:3px}#onl .r96 .r96-ctl .btn{width:auto;margin:0;padding:2px 6px;font-size:11.5px}
#onl .r96 .r96-qc small{display:block;color:var(--muted);font-size:11.5px;margin-bottom:4px}#onl .r96 .r96-qc .ofor-chips{display:flex;flex-wrap:wrap;gap:5px;border:0;padding:0;background:none}
#onl .lb96f{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin:6px 0 8px;font-size:13px;color:var(--muted)}#onl .lb96f select{width:auto}
@media(max-width:760px){#onl .r96 .r96-body{grid-template-columns:1fr}#onl .r96 .r80-seats{grid-template-columns:repeat(2,minmax(0,1fr))}#onl .r96 .r96-acts{justify-content:flex-start;margin-left:0}
  #onl .r96 .r80-seat.r96s{min-height:176px}#onl .r96 .r96-fig{height:84px}#onl .r96 .r96-fig img,#onl .r96 .r96-fig svg{max-height:84px}}
`;document.head.appendChild(css)}

/* An invitation checked against a lobby list cached in the last 3 s could miss a room created a moment ago (the crier's
   announcement used to refresh the list first) — a room not found in the cache is looked up fresh before the invitation
   is treated as closed. */
{const base=onlRoomCheck81;onlRoomCheck81=async function(id,fresh){const c=await base(id,fresh);if(!fresh&&c&&!c.ok&&c.why==='closed')return base(id,true);return c}}
