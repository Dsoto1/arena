/* 264-v99fix2 — v0.99, Virgilante's five notes (second round).
   1 · PIECE BONUSES FOLLOW THE ARMOR. Flavius' Greaves (+1 movement) and the Cestus (+1 damage) read hasPiece(), which only looked at the
       piece LIST. A location's AP is one shared pool (rulebook p.22): at 0 AP its armor is destroyed, but the list could still hold the
       piece (taking another piece off a damaged location — unequipPiece — drained the pool and left the survivors listed; damaged
       loadouts equipped at 0), so the bonus lived on. Fixes: (a) 03-engine hasPiece needs the location alive and its AP > 0;
       (b) unequipPiece sweeps — any location left at 0 AP loses its listed pieces (and their bonus AP, exactly like stripLoc);
       (c) movement is granted at the start of a turn (player.mv = mvMax), so losing a greave DURING one's own turn used to keep the
       extra step until the next turn: stripLoc / unequipPiece take that 1 step back at once when both greaves were on and one is now
       gone with both legs still attached (a severed leg is already handled by the engine's own min(mv, mvMax)). Every client runs the
       same code on the same state, so online hashes agree. Cestus: hasCestus follows hasPiece, so the +1 stops with the piece.
   2 · (the attack button face lives in 248-v98bar: power/range icons; wording sweep in 94-v72 / 26-gear).
   4 · RANKED / CUSTOM CHIP everywhere a game is named: .rk99 gold "⚔ RANKED" / grey "Custom" on Lobby Browser rows, the room header (replaces
       the plain badge), "Your game" / waiting cards, invitations + the Praeco lines (onlRowTxt80), Spectate cards, the Custom-only event squares.
   5 · Recruiting: .mgrid holding #recTable = list | card at about 55 / 45 (was 728 | 380 px at 1440).
       The playlist cards' two play buttons wear the same two looks (gold-edged Ranked, grey Custom). */
/* ---------------- 1 · bonuses follow the armor ---------------- */
function pcSweep264(p){try{if(!p||!p.pieces)return;for(const l of LOCS)if(p.pieces[l]&&p.pieces[l].length&&p.ap[l]<=0)stripLoc(p,l)}catch(e){console.error(e)}}
const GV264=new WeakMap();
function pcMv264(p,had){try{if(!had||!p||greavesOn(p)||!(p.hp.rleg>0&&p.hp.lleg>0))return;if(GV264.get(p)===S.turnNo)return;if(S&&S.players&&cur()===p&&p.mv>0){p.mv--;GV264.set(p,S.turnNo)}}catch(e){}}
const gvPre264=p=>{const had=!!(p&&p.pieces&&greavesOn(p));if(had)GV264.delete(p);return had};
{const base=stripLoc;stripLoc=function(player){const had=gvPre264(player);const r=base.apply(this,arguments);pcMv264(player,had);return r}}
{const base=unequipPiece;unequipPiece=function(player){const had=gvPre264(player);const r=base.apply(this,arguments);pcSweep264(player);pcMv264(player,had);return r}}
/* a hit empties the location's AP first and only then calls stripLoc, so the state before the hit is read here */
{const base=hurt;hurt=async function(victim){const had=gvPre264(victim);const r=await base.apply(this,arguments);pcMv264(victim,had);return r}}

/* ---------------- 4 · the Ranked / Custom chip ---------------- */
function rk99(ranked,only){return ranked?`<span class="rk99 r" title="${esc2(_T('Ranked: your rank only, the Fate is final'))}">${_T`⚔ RANKED`}</span>`:`<span class="rk99 c" title="${esc2(only?_T('Custom only: no death, no rank'):_T('Custom: anyone, no death'))}">${_T`Custom`}</span>`}
function rk99Of(id){return (ONL.lobbies||[]).find(L=>L.id===id)||null}
const rk99Tpl=h=>{const T=document.createElement('template');T.innerHTML=h;return T};
/* Lobby Browser rows: the chip leads the Event cell */
{const base=onlLobbyHTML;onlLobbyHTML=function(){const h=base.apply(this,arguments);try{const T=rk99Tpl(h);
    for(const tr of T.content.querySelectorAll('tr[data-row]')){const L=rk99Of(tr.dataset.row);const td=tr.children[1];if(!L||!td||td.querySelector('.rk99'))continue;td.insertAdjacentHTML('afterbegin',rk99(!!L.ranked)+' ')}
    return T.innerHTML}catch(e){console.error(e);return h}}}
/* the room header: the chip replaces the plain Ranked/Custom badge */
{const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){const h=base.apply(this,arguments);try{if(!L||typeof h!=='string')return h;const T=rk99Tpl(h);const tags=T.content.querySelector('.r80-tags');if(!tags||tags.querySelector('.rk99'))return h;
    const first=tags.querySelector('.badge');if(first&&(first.textContent.includes(_T('Custom'))||first.textContent.includes(_T('⚔ Ranked'))))first.remove();
    tags.insertAdjacentHTML('afterbegin',rk99(!!L.ranked)+' ');return T.innerHTML}catch(e){console.error(e);return h}}}
/* "Your game" + waiting cards: ' · ⚔ Ranked' / ' · Custom' in the first line → the chip */
{const base=onlPlayHTML;onlPlayHTML=function(){const h=base.apply(this,arguments);try{const L=typeof onlMyLobby==='function'?onlMyLobby():null;if(!L||typeof h!=='string'||h.indexOf('onl-mine')<0)return h;
    const T=rk99Tpl(h);const lab=L.ranked?_T('⚔ Ranked'):_T('Custom');
    for(const c of T.content.querySelectorAll('.onl-mine')){if(c.querySelector('.rk99'))continue;const n=[...c.childNodes].find(x=>x.nodeType===3&&x.nodeValue.includes(' · '+lab));
      if(n){const i=n.nodeValue.indexOf(' · '+lab);const a=document.createTextNode(n.nodeValue.slice(0,i)+' '),b=document.createTextNode(n.nodeValue.slice(i+3+lab.length));const s=document.createElement('span');s.innerHTML=rk99(!!L.ranked);
        n.replaceWith(a,s.firstChild,b)}else{const f=c.querySelector('b');if(f)f.insertAdjacentHTML('beforebegin',rk99(!!L.ranked)+' ')}}
    return T.innerHTML}catch(e){console.error(e);return h}}}
/* invitations, the Praeco lines, the feed: "<event> · Ranked · <city>" */
onlRowTxt80=function(r){if(!r)return '';return `${rk99(!!r.ranked)} ${esc2(onlEvName(r.ev))} · ${esc2(onlCityName(r.loc))}`};
/* Spectate cards (live + tickets on sale) */
if(typeof onlSpectHTML==='function'){const base=onlSpectHTML;onlSpectHTML=function(){const h=base.apply(this,arguments);try{const T=rk99Tpl(h);
    for(const c of T.content.querySelectorAll('.onl-sp')){if(c.querySelector('.rk99'))continue;const btn=c.querySelector('[data-v]');const L=btn&&rk99Of(btn.dataset.v);const b=c.querySelector('b');if(L&&b)b.insertAdjacentHTML('beforebegin',rk99(!!L.ranked)+' ')}
    return T.innerHTML}catch(e){console.error(e);return h}}}
/* the cycling Custom-only event squares */
{const base=ev98Square;ev98Square=function(k,i){const h=base.apply(this,arguments);try{if(h.indexOf('rk99')>=0)return h;return h.replace('<div class="ev98b">','<div class="ev98b"><span class="ev98c">'+rk99(false,ONLC.customOnly98(k))+'</span>')}catch(e){return h}}}
(()=>{try{if(typeof document==='undefined')return;const st=document.createElement('style');st.id='fix99';st.textContent=`
.rk99{display:inline-flex;align-items:center;gap:3px;font:800 10.5px/1 system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase;padding:3px 8px;border-radius:999px;white-space:nowrap;vertical-align:middle}
.rk99.r{background:linear-gradient(#f3d98a,#c9972f);color:#2b1c05;border:1px solid #f6dc95;box-shadow:0 0 0 1px rgba(0,0,0,.35)}
.rk99.c{background:#3a3a42;color:#d2d2da;border:1px solid #60606a}
#onl .onl-lb td .rk99{margin-right:6px}#onl .onl-lb td:nth-child(2){white-space:nowrap}
#onl .ev98b .ev98c{grid-column:1;grid-row:1;margin-bottom:2px}#onl .ev98b{grid-template-rows:auto auto auto}#onl .ev98b .btn{grid-row:1/4}
#onl .r80-tags .rk99{margin-right:2px}
#onl [data-onl="quick"][data-v$="|1"]{border-color:#e6c56a;box-shadow:inset 0 0 0 1px rgba(246,220,149,.45)}
#onl [data-onl="quick"][data-v$="|0"]{background:#3a3a42;border-color:#60606a;color:#d9d9e0}
/* 5 · Recruiting: the big card gets the wider share (list rows are one line) */
@media (min-width:901px){.mgrid:has(#recTable){grid-template-columns:minmax(0,1fr) minmax(400px,45%)}}
`;document.head.appendChild(st)}catch(e){console.error(e)}})();
