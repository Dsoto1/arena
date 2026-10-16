/* =====================================================================
   353-v104fixl — v1.04 beta 1 fixes · LUDUS, RECRUITING, LETTERS, POPUPS (his Beta 1 notes B5 B7 B8 B9 B10 B11 B14 B15 B16 B17,
   answers B10a b5; tools/plans/v104/NOTES.md). Manager only. Kill switch localStorage flavius_v104loff=1. Test tools/tests/tv104f.js
   B5   A career started before v1.04 switches to the new season format at its next season (348 cal104Init / SAVE_MIGRATIONS '1.04').
        cal104Init wrapper: the moment the switch is decided ONE letter from the Consilium says so — an old save loaded mid-season
        "From next season: the Superbus playoffs, byes in weeks 4 and 12, Rivalry Week in week 11, an off-season"; a career still in
        week 1 (it switches now) "From this season: …". Nothing before: no letter existed (NEW).
   B7   Recruiting: 64's inline `max-height:62vh` on #recTable beat 317's `max-height:none` (an inline style wins), so the list column
        ended above the bottom of the card beside it ("Where he stands" on the Offer step). REPLACES 317's M5 rule (kept for 1251+): from
        901 px the list column is a flex column whose table fills it (flex 1 1 0, !important), the card's height decides the row.
   B8   The "Promote the ludus" popup: the old monospace font → the popup font of 351's Upgrade School (heading, tiles, hints), and every
        cost keeps the game's coin icon. The icon was lost by 52-v50 quietButtons (button.textContent = the kept parts, flattening the
        <i class=ic87c>); quietButtons wrapper keeps the HTML of the coin/hour parts (also fixes the same flattening anywhere else).
   B9   Armory: the "Spares — sell" list (272 sell99HTML) was not redrawn when a piece moved (225 arm94Redraw only swaps #ar94). An
        arm94Redraw wrapper refreshes / removes / re-adds the sell list, so a piece worn by a gladiator leaves it at once.
   B10  (B10a) At a new season, letters from the previous season are FILED (read) unless they still need an answer and are still valid
        (kind 'offer', until still ahead); the "Week N in review" of the old season is filed too (w.rev99 / w.rev102, 272/333's keys).
        l104Sweep runs before every mail build (mailLive wrapper) and every Manager page (mgrHTML wrapper). REPLACES nothing (the old
        until-based expiry stays for letters inside a season).
   B11  Vulso's cart gets a ✕ (data-v104cart="close", w.cart.closed): cartHTML returns '' for a closed cart. NEW.
   B15  once the 2 fighters the cart allows are taken (w.cart.bought>=2) the cart closes by itself (REPLACES 251's greyed "Vulso keeps the
        last lot" lots and 345's lingering letter): its letter "The Recruiter: Vulso's cart is at the gate" is filed, so the To-do line and
        the rail oval count clear.
   B14  Offers (351): 145's step tabs swap the card with detailHTML() alone, bypassing the mgrHTML pass that disabled the Offer button.
        detailHTML wrapper: while an offer is out the Offer button is DISABLED and the card keeps its "On the table" box (terms + Withdraw)
        every time it is drawn; duplicate boxes from 351's page pass are removed in the mgrHTML wrapper.
   B16  The "Week N in review" (202 details.rev91, on the desk since 270) always starts COLLAPSED (welcome letter excepted); a review the
        player opens stays open until he leaves the Ludus page.
   B17  A letter that points at one fighter or one action files itself when that is no longer so: the Recruiter's "A bargain: <name>" / "Pick
        of the week" (138 data-rec84) once the fighter is signed, an offer to him is out (351 w.of104), or he signed elsewhere; the Medicus'
        "at risk" letter (data-med84) when no risk is left; Vulso's cart letter when the cart is closed / empty. Same sweep as B10.
   No save change (new fields only: w.cart.closed, letter .read, w.rev99 / w.rev102).
   ===================================================================== */
const V104L={on:(()=>{try{return localStorage.getItem('flavius_v104loff')!=='1'}catch(e){return true}})(),revOpen:null};
function l104Live(){try{const w=typeof W_==='function'?W_():null;return V104L.on&&w&&!w.dead&&!w.tutorial?w:null}catch(e){return null}}
if(V104L.on){

/* ---------- B5 · the letter when a career is switched to the new season format ---------- */
if(typeof cal104Init==='function'){const base=cal104Init;cal104Init=function(w){const had=!!(w&&w.cal104!=null);const r=base.apply(this,arguments);
  try{if(!had&&w&&!w.tutorial&&w.cal104!=null&&typeof V104A!=='undefined'&&V104A.on&&typeof sendLetter==='function'){const now=w.cal104<=w.season;
    const body=now?_T('From this season: the Superbus playoffs, byes in weeks 4 and 12, Rivalry Week in week 11, an off-season.'):_T('From next season: the Superbus playoffs, byes in weeks 4 and 12, Rivalry Week in week 11, an off-season.');
    sendLetter(w,{key:'cal104-note',kind:'letter',from:_T('the Consilium'),adv:'consilium',seal:'🏛',title:_T('A new season format'),until:w.week+11,body:`<p>${body}</p>`})}}catch(e){console.error(e)}
  return r}}

/* ---------- B10 + B17 · letters that are no longer valid file themselves ---------- */
function l104CartOpen(w){const C=w&&w.cart;if(!C||C.closed||(C.bought||0)>=2||C.wk<w.week-1)return false;return (C.ids||[]).some(id=>{const g=gById(id);return g&&g.alive&&!g.contract})}
function l104RecOK(w,gid){const g=gById(gid);if(!g||!g.alive||g.contract)return false;try{if(typeof of104Of==='function'&&of104Of(w,g))return false}catch(e){}return true}
function l104Sweep(w){if(!w||!Array.isArray(w.letters)||w.dead)return 0;let n=0;
  /* an old-calendar finale (17: season already rolled, the Superbus still ahead) keeps the old season's letters and review */
  const fin=!!(w.finaleDue&&w.finaleDue.season!=null&&w.finaleDue.season<w.season);
  for(const L of w.letters){if(!L||L.read)continue;const key=L.key||'',body=typeof L.body==='string'?L.body:'';let file=false;
    if(!fin&&L.s!=null&&L.s<w.season&&L.kind!=='offer')file=true; /* B10a: a new season files what asks for nothing */
    else if(/^cart-/.test(key)&&!l104CartOpen(w))file=true; /* B15 */
    else{const m=/data-rec84="([^"]+)"/.exec(body);if(m&&!l104RecOK(w,m[1]))file=true; /* B17 */
      else if(/data-med84=/.test(body)&&typeof medicus84Risks==='function'){try{if(!medicus84Risks(w).length)file=true}catch(e){}}}
    if(file){L.read=true;n++}}
  const R=w.review;if(!fin&&R&&R.season!=null&&R.season<w.season&&!R.sb103){const k={s:R.season,wk:R.wk};
    if(!(w.rev99&&w.rev99.s===k.s&&w.rev99.wk===k.wk)){w.rev99={...k};n++}if(!(w.rev102&&w.rev102.s===k.s&&w.rev102.wk===k.wk))w.rev102={...k}}
  if(n){try{saveWorld(true)}catch(e){}}return n}
{const base=mailLive;mailLive=function(){try{const w=l104Live();if(w)l104Sweep(w)}catch(e){console.error(e)}return base.apply(this,arguments)}}

/* ---------- B11 + B15 · Vulso's cart ---------- */
if(typeof cartHTML==='function'){const base=cartHTML;cartHTML=function(){const w=l104Live();const C=w&&w.cart;
  if(C){if((C.bought||0)>=2)C.closed=1;if(C.closed){try{l104Sweep(w)}catch(e){}return ''}}
  let h=base.apply(this,arguments);try{if(w&&C&&typeof h==='string'&&h)h=h.replace('<div class="card2 offerbox cartbox">',`<div class="card2 offerbox cartbox"><button type="button" class="btn tksm v104cx" data-v104cart="close" title="${esc(_T('Close'))}" aria-label="${esc(_T('Close'))}">✕</button>`)}catch(e){}return h}}
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-v104cart="close"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const w=l104Live();if(!w||!w.cart)return;w.cart.closed=1;try{l104Sweep(w)}catch(err){}try{saveWorld()}catch(err){}if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);

/* ---------- B14 · an offer that is out keeps its button disabled and its box, every time the card is drawn ---------- */
function l104OfferCard(R,w){if(typeof of104Of!=='function')return;for(const b of R.querySelectorAll('[data-mg="offer"]')){const g=gById(String(b.dataset.id||MGR.sel||'').split('|')[0]);if(!g||g.contract)continue;const o=of104Of(w,g);if(!o)continue;
  b.setAttribute('disabled','');b.classList.add('of104on');b.title=_T('Offer on the table — the answer comes when the week ends');
  for(const n of b.querySelectorAll('.of104n'))n.remove();
  const nx=b.nextElementSibling;if(nx&&nx.classList&&nx.classList.contains('of104box'))continue;
  b.insertAdjacentHTML('afterend',`<div class="of104box">${_T`✍ <b>On the table:</b> ${o.wage}/wk for ${o.weeks} weeks${o.bonus?_T`, ${o.bonus} bonus`:''} — he answers when the week ends.`} <button class="btn tksm" type="button" data-of104x="${g.id}">${_T`Withdraw`}</button></div>`)}}
{const base=detailHTML;detailHTML=function(){const h=base.apply(this,arguments);try{const w=l104Live();if(!w||typeof h!=='string'||h.indexOf('data-mg="offer"')<0||!w.of104||!Object.keys(w.of104).length)return h;
  const T=document.createElement('template');T.innerHTML=h;l104OfferCard(T.content,w);return T.innerHTML}catch(e){console.error(e)}return h}}

/* ---------- B9 · the Spares list follows the shelf ---------- */
if(typeof arm94Redraw==='function'&&typeof sell99HTML==='function'){const base=arm94Redraw;arm94Redraw=function(){const r=base.apply(this,arguments);
  try{if(l104Live()){const el=document.querySelector('#mgrPane details.sell99');const h=sell99HTML();
    if(el&&!h)el.remove();else if(el&&h){const T=document.createElement('template');T.innerHTML=h;const nu=T.content.firstElementChild;if(nu){if(el.open)nu.open=true;el.replaceWith(nu)}}
    else if(!el&&h&&document.querySelector('#mgrPane #ar94')&&typeof MGR_REDRAW==='function')MGR_REDRAW()}}catch(e){console.error(e)}return r}}

/* ---------- B8 · a cost keeps its coin icon when long button text moves into a tooltip ---------- */
if(typeof quietButtons==='function'){const base=quietButtons;quietButtons=function(root,min){try{if(root&&root.querySelectorAll)l104Quiet(root,min==null?34:min)}catch(e){console.error(e)}return base.apply(this,arguments)}}
function l104Quiet(root,min){const keepRe=/^(\d+\s?h|\d+\s?coin|free|🔒|\d+\s?wk|\d+\/wk)/;
  for(const s of root.querySelectorAll('.btn small')){if(!s.querySelector('.amt87'))continue;const t=s.textContent.trim();if(t.length<min)continue;const btn=s.closest('.btn');if(!btn||btn.dataset.tip)continue;
    const keep=[],rest=[];for(const p of s.innerHTML.split(' · ')){const d=document.createElement('div');d.innerHTML=p;const tx=d.textContent.trim();(keepRe.test(tx)?keep:rest).push({h:p,t:tx})}
    btn.dataset.tip=esc(rest.map(x=>x.t).join(' · ')||t);if(keep.length)s.innerHTML=keep.map(x=>x.h).join(' · ');else s.remove()}}

/* ---------- B16 · the review starts collapsed; the final mgrHTML pass ---------- */
document.addEventListener('toggle',e=>{const d=e.target;if(!d||!d.matches||!d.matches('details.rev91'))return;const w=l104Live();const R=w&&w.review;V104L.revOpen=d.open&&R?R.season+':'+R.wk:null},true);
{const base=mgrHTML;mgrHTML=function(){const w0=l104Live();if(w0)try{l104Sweep(w0)}catch(e){console.error(e)}let h=base.apply(this,arguments);
  try{const w=l104Live();if(!w||typeof h!=='string'||MGR.view)return h;if(MGR.tab!=='ludus')V104L.revOpen=null;
    const dup=(h.match(/class="of104box"/g)||[]).length>1;const rev=MGR.tab==='ludus'&&/details class="mail report rev91"[^>]*\bopen\b/.test(h);
    if(!dup&&!rev)return h;const T=document.createElement('template');T.innerHTML=h;const R=T.content;
    if(dup)for(const b of R.querySelectorAll('.of104box')){const p=b.previousElementSibling;if(p&&p.classList&&p.classList.contains('of104box'))b.remove()}
    if(rev&&w.review){const d=R.querySelector('details.rev91');const key=w.review.season+':'+w.review.wk;if(d&&V104L.revOpen!==key)d.removeAttribute('open')}
    return T.innerHTML}catch(e){console.error(e)}return h}}

/* ---------- the look ---------- */
{const st=document.createElement('style');st.id='v104lcss';st.textContent=`
@media (min-width:901px){.mgrid.rc100g:has(#recTable){align-items:stretch}.rc100g>div:first-child{display:flex;flex-direction:column;min-width:0}
  .rc100g>div:first-child>#recTable{flex:1 1 0;min-height:300px;max-height:none!important;overflow-y:auto}}
.cartbox{position:relative}.v104cx{position:absolute;top:6px;right:6px;width:26px;height:26px;padding:0!important;line-height:24px;border-radius:9px!important;z-index:2}
.lu100panel.pr101:not(.lu102fac) .sect{font-family:inherit;text-transform:none;letter-spacing:0;font-size:16px;font-weight:700;color:inherit}
.lu100panel.pr101:not(.lu102fac) .sect .rc-sub,.lu100panel.pr101:not(.lu102fac) .pr104t,.lu100panel.pr101:not(.lu102fac) .pr104t small,.lu100panel.pr101:not(.lu102fac) .rc-sub{font-family:inherit}`;
  document.head.appendChild(st)}
}
