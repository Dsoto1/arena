/* =====================================================================
   146-v85land · ONLINE LANDING II (his "all ★", v0.85)
   =====================================================================
   1 · LAYOUT: the Today ribbon (#onlToday80 strip + its "+ more") leaves the landing. Under the stage | This week + Forum, the bottom
       is ONE block (.a85-bot) of two columns on desktop: LEFT the playlists in a 2×2 grid (⭐ This week keeps its double border ·
       ⚔ Classic with the Democritus / Egidious / Cassian tabs of 145 part 13 · Familia · Ludi Infames); RIGHT two SHOWCASES stacked, one beside
       each playlist row (#v85show; face left, the story right):
         🏆 BIGGEST WINNER of the day — the most CF in one match (Today's wins[0]): face + token, name, house chip (opens the house's
            profile), rank, event + city, CF earned (wheat) and coin earned (the award, house cut included);
         🪦 BIGGEST LOSER of the day — the best-ranked gladiator who fell in Ranked (fallen[0]: Fate, Damnatio, or slain): face, name,
            house, rank, CF, how he fell and what he lost — the value of the gear he brought (ONLC.valueOf) + his purse.
       ONLC.dayBest(today) picks both (the day record is already sorted that way), so every screen shows the same two. Each box has
       "See today's list ›" → the readable popup (onlTodayPop81, the old "+ more" list). Empty states: "No victor yet today — the sand
       waits." / "No one fell today — the sand waits." (yesterday's record while today's is empty, as before). A new hello patches
       the boxes in place (onlToday80Patch wrapper). Tablets: the playlists over the showcases; phones: one column (the playlists keep
       their sideways scroll), the page scrolls.
   2 · DATA (111-onlcore + server + mock, no protocol change): day entries carry `coin` (wins), `gear` + `purse` (+ `kb`/`kn`: what or
       who killed him) for the fallen (ONLC.dayLost); old entries without them still show (the numbers are left out).
   3 · THE ONLINE DAY turns at 20:00 New York time (ONLC.dayStart/dayKey/dayPrevKey, DST by the US rule): Today's WORLD DAY#, the
       Forum reset (ONLC.forumSince, 30-min grace), the guest pass and the Victor of the Day. Summer keys equal the old UTC-day keys.
   4 · 👥 PARTY: the code box and "Join a party" leave the stage; a 👥 Party button sits after the Invite slots and opens a small
       anchored panel (V85.party; it survives redraws of the Play tab, closes on another tab): in a party → your code (📋 Copy), the members, Leave; else → "Share your
       code" (makes the party, shows the code) and "Join with a code" (input + Join). The same routes and handlers as before
       (data-onl pinvite / pjoin / pleave → party.create / join / leave); an Invite slot also opens the panel. Esc, ✕ or a click
       elsewhere closes it. A redraw keeps what was typed in the code box.
   ===================================================================== */
const V85={party:false};
const v85Coin=()=>typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙';

/* ---------------- 1 · the showcases ---------------- */
function v85Where(e){return `${esc2(onlEvName(e.ev))} <span class="v85at">at</span> ${esc2(onlCityName(e.loc))}`}
function v85House(e){return e&&e.dom&&e.dn?`<button type="button" class="dom84c v85hc" data-onl83="prof" data-v="${esc2(e.dom)}" title="${_T`Open the house`}">🏛 ${esc2(onlHouse82(e.dn))}</button>`:''}
function v85Fig(e,k){return `<div class="v85sc-fig">${onl80Face(e,'md')}<span class="v85sc-tok">${e.cls?onlFig(e.cls,e.look,64):''}</span></div>`}
function v85FellHow(e){if(e.how==='damnatio')return _T('Abandoned the sand — <b>Damnatio</b>');if(e.kb==='g'&&e.kn)return _T`Slain by <b>${esc2(e.kn)}</b>`;
  if(e.kb==='b')return _T('Slain by a beast');return _T('Taken by the Fate')}
function v85ShowHTML(){const T=typeof ONL80F!=='undefined'?ONL80F.today:null;const yd=!!(T&&T.day==='yesterday');const B=ONLC.dayBest(T);const day=yd?'yesterday':'today';
  const W=onlW81(),C=v85Coin();const list=`<button type="button" class="v85list" data-v85="list" title="${_T`The day's lists`}">${_T`See ${day}'s list ›`}</button>`;
  const head=(ic,t,sub)=>`<div class="v85sc-h" title="${sub}"><span><b>${ic} ${t}</b><small>${sub}</small></span>${list}</div>`;
  const w=B.winner,l=B.loser;
  const hw=head('🏆',_T('Biggest winner'),_T`most CF in one bout ${day}`),hl=head('🪦',_T('Biggest loser'),_T`best-ranked fallen ${day}`);
  const win=w?`<div class="v85sc win" data-v85who="win">${v85Fig(w)}<div class="v85sc-i">${hw}
      <div class="v85sc-n"><b>${esc2(w.name)}</b>${v85House(w)}</div><div class="v85sc-r">${onlRankChip(w.rank||'tiro')} <span>${esc2((CLASSES[w.cls]||{}).name||'')}</span></div>
      <div class="v85sc-ev">${_T`Won ${v85Where(w)}${w.ranked===false?_T(' · Custom'):''}`}</div>
      <div class="v85sc-num"><span title="${_T`Crowd Favor earned in that bout`}">${_T`${W}<b>${w.cf|0}</b> CF`}</span><span title="${_T`Coin earned in that bout`}">${_T`${C}<b>${w.coin|0}</b> coin`}</span></div></div></div>`
    :`<div class="v85sc win none" data-v85who="win"><div class="v85sc-i">${hw}<div class="v85sc-empty">${_T`No victor yet ${day} — the sand waits.`}</div></div></div>`;
  const lost=l&&(l.gear!=null||l.purse!=null)?`<div class="v85sc-lost">${_T`<small>Lost</small>`}<span title="${_T`The value of the gear he brought`}">${_T`${C}<b>${l.gear|0}</b> in gear`}</span><span title="${_T`His purse`}">${_T`${C}<b>${l.purse|0}</b> purse`}</span></div>`:'';
  const loss=l?`<div class="v85sc fall" data-v85who="fall">${v85Fig(l)}<div class="v85sc-i">${hl}
      <div class="v85sc-n"><b>${esc2(l.name)}</b>${v85House(l)}</div><div class="v85sc-r">${_T`${onlRankChip(l.rank||'tiro')} <span>${esc2((CLASSES[l.cls]||{}).name||'')}</span><span>${W}<b>${l.cf|0}</b> CF</span>`}</div>
      <div class="v85sc-ev">${v85FellHow(l)} · ${v85Where(l)}</div>${lost}</div></div>`
    :`<div class="v85sc fall none" data-v85who="fall"><div class="v85sc-i">${hl}<div class="v85sc-empty">${_T`No one fell ${day} — the sand waits.`}</div></div></div>`;
  return `<div class="v85show" id="v85show">${win}${loss}</div>`}
/* the landing: no ribbon; the playlists and the showcases share the bottom */
{const base=onlPlayHTML;onlPlayHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||h.indexOf('onl-play81')<0)return h;
  const T=document.createElement('template');T.innerHTML=h;const g=T.content.querySelector('.onl-play81');const pls=g&&g.querySelector(':scope>.a81-pls');if(!g||!pls)return h;
  const td=g.querySelector(':scope>.a81-today');if(td)td.remove();g.classList.add('v85');
  const bot=document.createElement('div');bot.className='a85-bot';pls.replaceWith(bot);bot.appendChild(pls);
  const sh=document.createElement('div');sh.className='a85-show';sh.innerHTML=`<h3 class="onl-h">${_T`The day in the arena`} <span class="rc-sub" title="${_T`The online day turns at 8 PM New York time`}">${_T`turns at 8 PM New York`}</span></h3>${v85ShowHTML()}`;bot.appendChild(sh);
  return T.innerHTML}catch(e){console.error(e);return h}}}
/* a new hello: the showcases follow */
{const base=onlToday80Patch;onlToday80Patch=function(){const r=base.apply(this,arguments);try{const el=document.getElementById('v85show');if(el){const h=v85ShowHTML();if(el.outerHTML!==h)el.outerHTML=h}}catch(e){console.error(e)}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-v85]');if(!b)return;e.preventDefault();e.stopPropagation();if(b.dataset.v85==='list')onlTodayPop81()},true);

/* ---------------- 4 · 👥 the Party panel ---------------- */
{const base=onlPartyHTML;onlPartyHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||h.indexOf('onl-pbox')<0)return h;
  const T=document.createElement('template');T.innerHTML=h;const box=T.content.querySelector('.onl-pbox');const row=T.content.querySelector('.onl-party');if(!box||!row)return h;box.remove();
  const P=ONL.party;const n=P?P.members.length:0;
  const btn=document.createElement('button');btn.type='button';btn.className='onl-slot v85pbtn'+(V85.party?' on':'');btn.dataset.v85p='open';btn.title=_T('Your party: share a code or join one');btn.setAttribute('aria-expanded',V85.party?'true':'false');
  btn.innerHTML=`<span class="v85pi">👥</span>${_T`<small>Party${P?` · ${n}`:''}</small>`}`;const wr=document.createElement('div');wr.className='v85pw';wr.appendChild(btn);row.appendChild(wr);
  if(V85.party){const pp=document.createElement('div');pp.className='v85pp';pp.setAttribute('role','dialog');pp.setAttribute('aria-label',_T('Party'));pp.innerHTML=v85PartyPanel();wr.appendChild(pp)}
  return T.innerHTML}catch(e){console.error(e);return h}}}
function v85PartyPanel(){const P=ONL.party;const me=ONL.acct&&ONL.acct.id;const x=`<button type="button" class="v85px" data-v85p="close" title="${_T`Close`}" aria-label="${_T`Close`}">✕</button>`;
  if(P){const lead=P.leader===me;const names=P.members.map(m=>`<li>${m===me?_T('<b>You</b>'):esc2((P.names||{})[m]||_T('Lanista'))}${P.leader===m?' <small>· leader</small>':''}</li>`).join('');
    return `${x}<div class="v85pp-h">${_T`👥 Your party`}</div><div class="v85pp-code">${_T`<span>Code</span><b class="onl-code" id="v85code">${esc2(P.code)}</b>`}<button type="button" class="btn tksm" data-v85p="copy">${_T`📋 Copy`}</button></div>
      <ul class="v85pp-m">${names}</ul><small class="rc-sub">${lead?_T('You pick the game — your party sits with you (one team in team events).'):_T('Your leader picks the game.')}</small>
      <div class="acts"><button type="button" class="btn tksm" data-onl="pleave">${_T`Leave the party`}</button></div>`}
  return `${x}<div class="v85pp-h">${_T`👥 Party`}</div><div class="v85pp-s">${_T`<b>Share your code</b><small class="rc-sub">Friends who enter it sit with you; in team events you fight on one side.</small>`}
      <button type="button" class="btn primary tksm" data-onl="pinvite">${_T`👥 Make my party code`}</button></div>
    <div class="v85pp-s">${_T`<b>Join with a code</b>`}<div class="v85pp-j"><input class="tin" id="onlPCode" maxlength="6" placeholder="CODE" autocomplete="off" spellcheck="false"><button type="button" class="btn tksm" data-onl="pjoin">${_T`Join`}</button></div></div>`}
/* open/close in place (no redraw: a click that closes the panel still reaches the button it landed on) */
function v85PartySet(on){V85.party=!!on;const wr=document.querySelector('#onl .v85pw');if(!wr)return;for(const p of document.querySelectorAll('#onl .v85pp'))p.remove();
  const b=wr.querySelector('.v85pbtn');if(b){b.classList.toggle('on',V85.party);b.setAttribute('aria-expanded',V85.party?'true':'false')}
  if(V85.party){const pp=document.createElement('div');pp.className='v85pp';pp.setAttribute('role','dialog');pp.setAttribute('aria-label',_T('Party'));pp.innerHTML=v85PartyPanel();wr.appendChild(pp)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-v85p]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.v85p;
  if(a==='open'){v85PartySet(!V85.party);if(V85.party)setTimeout(()=>{const i=document.getElementById('onlPCode');if(i&&!ONL.party)try{i.focus()}catch(err){}},0);return}
  if(a==='close'){v85PartySet(false);return}
  if(a==='copy'){const c=ONL.party&&ONL.party.code;if(!c)return;try{navigator.clipboard&&navigator.clipboard.writeText(c).catch(()=>{})}catch(err){}if(typeof mToast==='function')mToast(_T`📋 Party code <b>${esc2(c)}</b> copied — send it to a friend.`)}},true);
/* an Invite slot makes the party (112) and shows its code here */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-onl="pinvite"]');if(!b||!ONL.char)return;V85.party=true},true);
/* a click elsewhere or Esc closes it */
document.addEventListener('pointerdown',e=>{if(!V85.party)return;const t=e.target;if(!t||!t.closest||t.closest('.v85pp,.v85pbtn'))return;if(document.querySelector('#onl .v85pp'))v85PartySet(false)},true);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&V85.party&&document.querySelector('#onl .v85pp')){e.preventDefault();e.stopImmediatePropagation();v85PartySet(false)}},true); /* before the window's own Esc (which would close Online) */
/* Enter in the code box joins */
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||!e.target||e.target.id!=='onlPCode')return;const j=document.querySelector('#onl .v85pp [data-onl="pjoin"]');if(j){e.preventDefault();j.click()}});
/* a redraw keeps what was typed into the code box (and its focus) */
{const base=onlRedraw;onlRedraw=function(){const i=document.getElementById('onlPCode');const v=i?i.value:null;const f=i&&document.activeElement===i;const r=base.apply(this,arguments);
  try{const j=document.getElementById('onlPCode');if(j&&v!=null&&!j.value){j.value=v;if(f){j.focus();try{j.setSelectionRange(v.length,v.length)}catch(err){}}}
    if(V85.party&&document.getElementById('onl')&&!document.querySelector('#onl .v85pw'))V85.party=false /* another tab: the panel does not wait there */}catch(e){}return r}}

{const st=document.createElement('style');st.textContent=`
/* the bottom block */
#onl .onl-play81.v85 .a85-bot{grid-area:pls;min-width:0;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:12px 16px;align-items:stretch}
#onl .a85-bot>.a81-pls,#onl .a85-bot>.a85-show{grid-area:auto;min-width:0;display:flex;flex-direction:column}
#onl .a85-show .onl-h{margin:2px 0 6px}
#onl .a85-bot .onl-pls81.pl85row{flex:1}
@media(min-width:761px){
 #onl .onl-play81.v85{grid-template-areas:"stage week" "stage forum" "pls pls";grid-template-rows:auto 1fr auto}
 #onl .a85-bot .onl-pls81.pl85row{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-rows:1fr;gap:10px}
 #onl .a85-bot .pl85row .pl85div{display:none}
 #onl .onl-play81.v85 .a81-forum{min-height:150px}
 #onl .onl-play81.v85 .onl-stage81:not(.ng81){padding-bottom:46px}
 #onl .a85-bot .pl85cl .pl85body>.onl-pl{height:100%;box-sizing:border-box}
}
@media(min-width:761px) and (max-width:1099px){
 #onl .onl-play81.v85{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"stage stage" "week forum" "pls pls";grid-template-rows:none}
 #onl .onl-play81.v85 .a85-bot{grid-template-columns:minmax(0,1fr)}
}
/* the showcases */
#onl .v85show{flex:1;display:grid;grid-template-columns:minmax(0,1fr);grid-auto-rows:1fr;gap:10px;min-height:0}
#onl .v85sc{position:relative;display:flex;gap:14px;align-items:center;padding:8px 12px 8px 10px;border:2px solid #c9a24f;border-radius:12px;min-width:0;
  background:radial-gradient(ellipse 30% 90% at 9% 50%,rgba(240,207,125,.2),transparent 70%),linear-gradient(90deg,rgba(201,162,79,.14),rgba(24,17,11,.92) 60%);box-shadow:0 0 18px -8px rgba(240,207,125,.6)}
#onl .v85sc.fall{border-color:#8a3a2a;background:radial-gradient(ellipse 30% 90% at 9% 50%,rgba(160,70,50,.22),transparent 70%),linear-gradient(90deg,rgba(122,58,42,.18),rgba(20,14,12,.94) 60%);box-shadow:0 0 18px -8px rgba(160,60,40,.6)}
#onl .v85sc-fig{position:relative;width:58px;flex:none;margin-right:12px}
#onl .v85sc-fig .portrait{width:58px!important;height:78px!important;border-radius:8px;overflow:hidden;border:1px solid #8a6a32;display:block;box-shadow:0 4px 12px rgba(0,0,0,.5)}
#onl .v85sc.fall .v85sc-fig .portrait{filter:grayscale(.6) sepia(.25);border-color:#6a3a2a}
#onl .v85sc-tok{position:absolute;right:-22px;bottom:-8px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))}#onl .v85sc-tok img,#onl .v85sc-tok svg{max-height:44px;max-width:44px}
#onl .v85sc-i{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
#onl .v85sc-h{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
#onl .v85sc-h>span{display:flex;align-items:baseline;gap:6px;min-width:0;overflow:hidden}#onl .v85sc-h b{font:700 14px Georgia,serif;color:#f0cf7d;white-space:nowrap}#onl .v85sc.fall .v85sc-h b{color:#e3a08a}
#onl .v85sc-h small{font:500 11px system-ui,sans-serif;color:#bfae88;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
#onl .v85list{all:unset;flex:none;cursor:pointer;font:600 11.5px system-ui,sans-serif;color:#e8d6a8;padding:2px 8px;border:1px solid rgba(232,201,106,.45);border-radius:999px;white-space:nowrap}#onl .v85list:hover,#onl .v85list:focus-visible{border-color:#f0cf7d;color:#fff}
#onl .v85sc-n{display:flex;align-items:center;gap:6px;min-width:0}#onl .v85sc-n>b{font:700 18px Georgia,serif;color:var(--bone,#f1e6cf);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;line-height:1.2}
#onl .v85sc-n .dom84c{margin:0;flex:0 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .v85sc-r{display:flex;gap:4px 8px;align-items:center;flex-wrap:wrap;font-size:12.5px;color:#d8c8a2}#onl .v85sc-r b{color:#f3d58a}
#onl .v85sc-ev{font-size:12.5px;line-height:1.3;color:#eadbb8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#onl .v85sc-ev b{color:#f3d58a}.v85at{color:#a8987a}
#onl .v85sc-num,#onl .v85sc-lost{display:flex;gap:4px 14px;align-items:baseline;flex-wrap:wrap;font-size:13px;color:#eadbb8}
#onl .v85sc-num b,#onl .v85sc-lost b{font:700 17px Georgia,serif;color:#ffe08a;margin:0 3px}#onl .v85sc-num img,#onl .v85sc-lost img,#onl .v85sc-r img{height:15px;width:auto;vertical-align:-2px}
#onl .v85sc-lost small{font-size:10.5px;color:#c99a8a;text-transform:uppercase;letter-spacing:.08em}#onl .v85sc-lost b{color:#f0b49a}
#onl .v85sc.none{border-style:dashed;box-shadow:none;opacity:.88}
#onl .v85sc-empty{flex:1;display:flex;align-items:center;justify-content:center;font:italic 15px Georgia,serif;color:var(--muted,#a8987a);padding:10px 6px;min-height:50px}
/* big screens: two TALL showcases side by side (the face on top) */
@media(min-width:1600px) and (min-height:1000px){
 #onl .onl-play81:not(.l100) .v85show{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-auto-rows:auto}
 #onl .onl-play81:not(.l100) .v85sc{flex-direction:column;align-items:center;text-align:center;gap:8px;padding:12px 14px 46px;
   background:radial-gradient(ellipse 70% 40% at 50% 26%,rgba(240,207,125,.2),transparent 70%),linear-gradient(180deg,rgba(201,162,79,.14),rgba(24,17,11,.92) 65%)}
 #onl .onl-play81:not(.l100) .v85sc.fall{background:radial-gradient(ellipse 70% 40% at 50% 26%,rgba(160,70,50,.22),transparent 70%),linear-gradient(180deg,rgba(122,58,42,.18),rgba(20,14,12,.94) 65%)}
 #onl .onl-play81:not(.l100) .v85sc-fig{order:-1;width:78px;margin:0}#onl .onl-play81:not(.l100) .v85sc-fig .portrait{width:78px!important;height:104px!important}#onl .onl-play81:not(.l100) .v85sc-tok{right:-34px}#onl .onl-play81:not(.l100) .v85sc-tok img,#onl .onl-play81:not(.l100) .v85sc-tok svg{max-height:60px;max-width:60px}
 #onl .onl-play81:not(.l100) .v85sc-i{align-items:center;width:100%;gap:5px}#onl .onl-play81:not(.l100) .v85sc-h{justify-content:center}#onl .onl-play81:not(.l100) .v85sc-h>span{flex-direction:column;align-items:center;gap:0}#onl .onl-play81:not(.l100) .v85sc-h b{font-size:16px}
 #onl .onl-play81:not(.l100) .v85sc .v85list{position:absolute;left:50%;bottom:12px;transform:translateX(-50%)}
 #onl .onl-play81:not(.l100) .v85sc-n{flex-direction:column;gap:3px}#onl .onl-play81:not(.l100) .v85sc-n>b{font-size:21px;max-width:100%}#onl .onl-play81:not(.l100) .v85sc-r,#onl .onl-play81:not(.l100) .v85sc-num,#onl .onl-play81:not(.l100) .v85sc-lost{justify-content:center}
 #onl .onl-play81:not(.l100) .v85sc-ev{white-space:normal}#onl .onl-play81:not(.l100) .v85sc-lost small{flex-basis:100%}
 #onl .onl-play81:not(.l100) .v85sc-empty{min-height:150px;font-size:16px}#onl .onl-play81:not(.l100) .v85sc.none .v85sc-i{flex:1}
}
@media(max-width:1399px){#onl .v85sc-h small{display:none}}
/* the Party button + panel */
#onl .v85pw{position:relative;display:flex;flex:none}
#onl .onl-slot.v85pbtn{border-style:solid;border-color:#8a6a32;background:rgba(214,171,76,.12);color:#f0cf7d;cursor:pointer}
#onl .onl-slot.v85pbtn .v85pi{font-size:22px;line-height:1}#onl .onl-slot.v85pbtn.on,#onl .onl-slot.v85pbtn:hover{border-color:#f0cf7d;box-shadow:0 0 10px rgba(240,207,125,.35)}
#onl .onl-stage81:has(.v85pp){overflow:visible}#onl .onl-stage81 .onl-party:has(.v85pp){z-index:30}#onl .a81-stage:has(.v85pp){position:relative;z-index:40}
#onl .v85pp{position:absolute;left:0;top:calc(100% + 8px);z-index:20;width:300px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:12px 14px;border:1px solid #b08a3a;border-radius:12px;
  background:linear-gradient(180deg,#2a1f12,#17110a);box-shadow:0 12px 30px rgba(0,0,0,.7);display:flex;flex-direction:column;gap:8px;text-align:left;color:#eadbb8}
#onl .v85pp-h{font:700 16px Georgia,serif;color:#f0cf7d;padding-right:24px}
#onl .v85px{all:unset;position:absolute;right:8px;top:6px;cursor:pointer;font-size:15px;color:#bfae88;padding:2px 6px;border-radius:6px}#onl .v85px:hover{color:#fff;background:rgba(255,255,255,.08)}
#onl .v85pp-s{display:flex;flex-direction:column;gap:4px;padding:8px 10px;border:1px solid rgba(214,171,76,.25);border-radius:9px;background:rgba(0,0,0,.2)}
#onl .v85pp-s .btn{align-self:flex-start}
#onl .v85pp-j{display:flex;gap:6px}#onl .v85pp-j input{width:110px;text-transform:uppercase;letter-spacing:.12em;height:30px;box-sizing:border-box}
#onl .v85pp-code{display:flex;align-items:center;gap:8px}#onl .v85pp-code .onl-code{font:700 22px var(--mono,monospace);letter-spacing:.14em;color:#ffe08a}
#onl .v85pp-m{margin:0;padding-left:18px;font-size:13px}#onl .v85pp-m small{color:#bfae88}
#onl .v85pp .acts{margin:0}
/* phones: one column */
@media(max-width:760px){
 #onl .onl-play81.v85{grid-template-areas:"stage" "pls" "forum" "week"}
 #onl .onl-play81.v85 .a85-bot{grid-template-columns:minmax(0,1fr)}
 #onl .v85pw{position:static}#onl .onl-stage81 .onl-party:has(.v85pp){position:relative}#onl .v85pp{left:0;right:0;width:auto;max-width:none;margin:0 auto}
 #onl .v85sc-ev{white-space:normal}
}
@media(max-width:420px){#onl .v85sc-h>span small{display:none}#onl .v85sc{gap:8px}}`;document.head.appendChild(st)}
