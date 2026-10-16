/* =====================================================================
   354-v104fixw — v1.04 beta fixes · THE TRAINING YARD'S DOCTORE + THE INFIRMARY'S CAPSARIUS (his Beta 1 notes B12 B13 B18 B20,
   answers B12a B13a d1a d2a m1a m2a m3a; tools/plans/v104/NOTES.md). Manager only. Kill switch localStorage flavius_v104woff=1. Test tv104g.
   B12  The Training Yard's "🗣 Care" button (213 data-y92care, 1 training hour: morale +5 and gear care) is GONE from the fighter plan cards
        (y92Card wrapper strips it; the leftover click handler stays harmless). REPLACED by the Baths' 📋 Care routine (351). A care booked
        this week by an old save still counts (y.care / X.morale / X.gear are not touched).
   B13  The Doctore: his face + name + level stars + summary ("drills +10% · Yard 0/3 · hours with him 0/4") now sit in the Yard's BANNER
        (.v104dc); his Intensity (None/Light/Normal/Hard, data-mg="regime") and Time (± hours, data-tp="doc|±1", Study the card) become the TOP
        ROW of this week's plan (the tabula, .v104top = the old .y92doc node, so every handler is reused). REPLACES 298's separate Doctore card
        (the yard is two columns now: the fighter, the tabula).
        d1a  his HOURS LOCK (P.doclk, the plan of the week) as soon as a fighter's card locks with a drill that needs more than the level he gives
             without hours (y92LockIn wrapper), and ALWAYS with Lock in all (also while nothing else is pending — the button stays on until
             then); afterwards the hours can go up, never down that week (window-capture guard on [data-tp="doc|-1"]). Lock in all also
             locks the Intensity (P.reglk) — closes today's gap: add hours → pick a drill → take the hours back.
        d2a  a locked drill tile says how to unlock it with the real need: "🔒 Lv 2 · 2 more hours with <Doctore>, or Yard II" (y104Need).
   B18  The hired house medicus is renamed CAPSARIUS in everything the player reads (108 + 318 + 345 + 351 texts: hire popup, news, letters,
        the Medicus-hours help); the Council's Medicus advisor keeps his name. REPLACES the small "Hire a medicus" / name strip (351 banner,
        332 M8's card at the top of the patient list): a STAFF SLOT in the Infirmary banner beside the Medicus face — empty "Capsarius · empty ·
        +2–6 h a week" + Hire; hired = his face, name, skill ★, wage with the coin icon, Let go; his hours are their own gold segment on the
        banner's hours bar (+ legend). The hire popup (318 med101Pop, REPLACED) is a three-tile picker in the style of the Upgrade School tiles:
        portrait, name, skill stars, wage + coin, effect chips (+N h a week · saves limbs at skill 3+ · may be lured away), Hire; square ✕.
        Candidates get a stored look (medCands76 wrapper, w.medc76.list[].face); a hired Capsarius from an older save draws a look from his name.
   B20  The Infirmary row chips "Treated ✓" / "Rested ✓" read as finished. REPLACES the v1.03 "Treated ✓" text (345 M8) and 351's "Rested ✓":
        while care is booked this week the chip says "Receiving treatment" / "Resting" (no ✓); the week's report (the review after the week
        turns) is where a ✓ belongs.
   No save change (new fields only: week plan P.doclk / P.reglk, candidate .face).
   ===================================================================== */
const V104W={on:(()=>{try{return localStorage.getItem('flavius_v104woff')!=='1'}catch(e){return true}})()};
function w104wLive(){try{const w=typeof W_==='function'?W_():null;return V104W.on&&w&&!w.dead&&!w.tutorial?w:null}catch(e){return null}}
if(V104W.on){
const Y104_ROM=['','I','II','III'];
function y104Doc(w){try{return council83(w).find(x=>x.k==='doctore')||null}catch(e){return null}}
/* ---------- B12 · no 🗣 Care on the cards ---------- */
{const base=y92Card;y92Card=function(){const h=base.apply(this,arguments);try{return typeof h==='string'?h.replace(/<button[^>]*data-y92care[^>]*>[\s\S]*?<\/button>/g,''):h}catch(e){return h}}}
/* ---------- B13 d1a · the Doctore's hours lock with the drills / Lock in all ---------- */
{const base=y92LockIn;y92LockIn=function(g){const w=w104wLive();let want=null;
  try{if(w&&g){const y=y92Peek(thPlan(w),g.id);if(y&&y.pre&&!y.pre.lock)want=y92Pre(y.pre.k)}}catch(e){}
  const r=base.apply(this,arguments);
  try{if(r&&w&&want){const P=thPlan(w),m=me();const keep=P.doc;let base0=0;try{P.doc=0;base0=y92DocLv(w,m)}finally{P.doc=keep}
    if(want.lv>base0&&P.doclk==null){P.doclk=P.doc}}}catch(e){console.error(e)}
  return r}}
/* hours + intensity: guards run before every other click handler (window capture) */
window.addEventListener('click',e=>{try{const w=w104wLive();if(!w)return;const t=e.target&&e.target.closest?e.target.closest('[data-tp="doc|-1"],[data-mg="regime"],[data-y92all]'):null;if(!t||!t.closest('#mgrBody'))return;
  if(typeof roadLocked76==='function'&&roadLocked76(w))return;const P=thPlan(w);
  if(t.hasAttribute('data-y92all')){P.doclk=Math.max(P.doclk==null?0:P.doclk,P.doc||0);P.reglk=1;try{saveWorld()}catch(x){}setTimeout(()=>{try{if(typeof MGR_REDRAW==='function')MGR_REDRAW()}catch(x){}},0);return}
  if(t.matches('[data-tp="doc|-1"]')&&P.doclk!=null&&(P.doc||0)<=P.doclk){e.preventDefault();e.stopPropagation();mToast(_T`🔒 The Doctore's hours are locked in — they can go up, not down, this week.`);return}
  if(t.matches('[data-mg="regime"]')&&P.reglk){e.preventDefault();e.stopPropagation();mToast(_T`🔒 The intensity is locked in for this week.`)}}catch(x){console.error(x)}},true);
/* d2a: what a locked drill needs */
function y104Need(w,m,pl){const P=thPlan(w);const lv0=y92DocLv(w,m);const d=pl.lv-lv0;if(d<=0)return '';const Y=Math.floor(facLvl(m,'yard'));const own=P.doc||0;let hrs=0;
  try{for(let h=1;own+h<=TH_DOC;h++){P.doc=own+h;if(y92DocLv(w,m)>=pl.lv){hrs=h;break}}}finally{P.doc=own}
  const yd=Y+d<=3?Y+d:0;const a=y104Doc(w);const nm=a?esc(a.name):_T('the Doctore');const parts=[];
  if(hrs)parts.push(hrs===1?_T`1 more hour with ${nm}`:_T`${hrs} more hours with ${nm}`);if(yd)parts.push(_T`Yard ${Y104_ROM[yd]}`);
  return `🔒 ${_T`Lv ${pl.lv}`}${parts.length?' · '+parts.join(_T(', or ')):''}`}
function y104Practice(R,w,pm){const pane=R.querySelector('#mgrPane');if(!pane)return;const doc=pane.querySelector('.y92doc.rm100doc');const wax=pane.querySelector('.rm100plan .rm100wax');const hd=pane.querySelector('.roomhd');if(!doc||!wax||!hd||doc.classList.contains('v104top'))return;
  const P=thPlan(w);const lv=y92DocLv(w,pm);const bn=Math.round(y92Bonus(lv)*100);const Y=Math.floor(facLvl(pm,'yard'));const a=y104Doc(w);
  /* banner: his name, stars, summary (the round head is his face) */
  const face=!hd.querySelector('.rm100rd')?`<span class="rm100rd rm100adv">${a&&typeof face83==='function'?face83(a,54):'🧑‍🏫'}</span>`:'';
  const dc=`${face}<div class="v104dc"><b>${a?esc(a.name):_T('Your doctore')}</b><span class="v104st" title="${esc(_T`Doctore · level ${lv}`)}">${'★'.repeat(lv)}${'☆'.repeat(Math.max(0,6-lv))}</span><small>${_T`Doctore · level ${lv}`}</small>
    <small>${_T`drills +${bn}% · Yard ${Y}/3 · hours with him ${P.doc||0}/${TH_DOC}`}${P.doclk!=null?' · 🔒':''}</small></div>`;
  const st=hd.querySelector('.roomstat');if(st)st.insertAdjacentHTML('beforebegin',dc);else hd.insertAdjacentHTML('beforeend',dc);
  const dh=doc.querySelector('.y92dh');if(dh)dh.remove();
  /* the tabula's top row */
  doc.classList.remove('card2','rm100p');doc.classList.add('v104top');
  doc.insertAdjacentHTML('afterbegin',`<div class="v104tl">🧑‍🏫 ${_T`Doctore · this week`}</div>`);
  wax.insertBefore(doc,wax.firstChild);
  if(P.reglk){for(const b of doc.querySelectorAll('[data-mg="regime"]')){b.disabled=true;b.classList.add('v104lk');b.title=_T('Locked in for this week')}
    const l=doc.querySelector('.y92dr .yd76l');if(l)l.textContent+=' 🔒'}
  if(P.doclk!=null){const dn=doc.querySelector('[data-tp="doc|-1"]');if(dn&&(P.doc||0)<=P.doclk){dn.disabled=true;dn.title=_T('Locked in — hours can go up, not down')}
    const dx=doc.querySelector('.y92dx');if(dx)dx.insertAdjacentHTML('beforeend',`<small class="v104hold">${_T`🔒 held at ${P.doclk} h — can go up, not down`}</small>`)}
  /* Lock in all stays on until the Doctore + intensity are locked */
  const all=pane.querySelector('[data-y92all]');if(all&&!P.reglk)all.removeAttribute('disabled');
  /* the room: two columns now, the Care button is gone */
  const g3=pane.querySelector('.rm100y1');if(g3)g3.classList.add('v104y');
  for(const c of pane.querySelectorAll('[data-y92care]'))c.remove();
  /* d2a: locked drill tiles */
  for(const t of pane.querySelectorAll('.rm100plt.lk[data-rm100pre]')){const pl=y92Pre(t.dataset.rm100pre);if(!pl)continue;const s=y104Need(w,pm,pl);if(!s)continue;t.title=s.replace(/^🔒 /,'');t.insertAdjacentHTML('beforeend',`<span class="v104unl">${s}</span>`)}}
/* ---------- B18 · the Capsarius ---------- */
function cap104Look(c){if(c&&c.face)return c.face;const fem=/Herophila|Antonia/.test((c&&c.name)||'');let h=hashStr('cap104:'+((c&&c.name)||'')+((c&&c.skill)||0));const nx=n=>{h=Math.imul(h^(h>>>15),2246822519)>>>0;h=(h+0x9e3779b9)>>>0;return h%n};
  return {skin:SKINS[nx(SKINS.length)],hair:HAIRS[nx(8)],beard:!fem&&nx(5)<2,long:fem||nx(6)===0,fem,hat:'',tunic:'#e8dcc0',robe:'#3d7a5e'}}
function cap104Face(c,sz){try{return face83({face:cap104Look(c)},sz)}catch(e){return '🧑‍⚕️'}}
const cap104Stars=s=>'★'.repeat(s)+'☆'.repeat(Math.max(0,3-s));
{const base=medCands76;medCands76=function(w){const L=base.apply(this,arguments);try{for(const c of L)if(c&&!c.face)c.face=cap104Look(c)}catch(e){}return L}}
function cap104Chips(c){const m=CARE101.medicus;return `<i>${_T`+${m*c.skill} h a week`}</i>${c.skill>=3?`<i>${_T('saves limbs')}</i>`:''}<i class="lure">${_T('may be lured away')}</i>`}
function cap104Pop(){const w=W_(),m=me();if(!w||!m)return;for(const o of document.querySelectorAll('.ask76bg'))o.remove();const bg=document.createElement('div');bg.className='veraskbg ask76bg v101mp v104mp';
  bg.innerHTML=`<div class="card2 verask v104mc" role="dialog" aria-modal="true"><button type="button" class="lu100x v104x" data-v101mx title="${esc(_T('Close'))}" aria-label="${esc(_T('Close'))}">✕</button><b>${_T`🧑‍⚕️ Hire a Capsarius`}</b>
    <p class="rc-sub" style="margin:4px 0 8px">${_T`A weekly wage. Each skill level heals faster and adds ${CARE101.medicus} Medicus hours a week.`}</p>
    <div class="v104ctl">${medCands76(w).map((c,i)=>{const poor=m.coin<c.wage;return `<button type="button" class="v104ct${poor?' poor':''}" data-v101mh="${i}" ${poor?`disabled title="${esc(_T('Not enough coin'))}"`:`title="${esc(MED_SK76[c.skill]||'')}"`}>
      <span class="v104cph">${cap104Face(c,64)}</span><b class="v104cn">${esc(c.name)}</b><span class="v104cs" aria-label="${esc(_T`skill ${c.skill}`)}">${cap104Stars(c.skill)}</span>
      <span class="v104cw">${coinAmt87(c.wage)} <small>${_T`a week`}</small></span><span class="v104chp">${cap104Chips(c)}</span><span class="btn tksm primary v104hb">${poor?_T('Not enough coin'):_T('Hire')}</span></button>`}).join('')}</div></div>`;
  document.body.appendChild(bg);const done=()=>{bg.remove();document.removeEventListener('keydown',key,true)};const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done()}};document.addEventListener('keydown',key,true);
  bg.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-v101mh]');if(!b){if(e.target===bg||e.target.closest('[data-v101mx]'))done();return}if(b.disabled)return;done();
    const w2=W_();if(typeof roadLocked76==='function'&&roadLocked76(w2)){mToast(_T`🛣 On the road — the Infirmary reopens when the week ends.`);return}const c=medCands76(w2)[+b.dataset.v101mh];if(!c)return;w2.medicus76={...c};
    const t=_T`🧑‍⚕️ <b>${esc(c.name)}</b> joins your house as Capsarius (skill ${c.skill}, ${coinAmt87(c.wage)} a week).`;tnews(t,'big');saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW();mToast(t)})}
/* 318's own opener lives in a block scope: the click is taken before it (window capture) */
window.addEventListener('click',e=>{try{const b=e.target&&e.target.closest?e.target.closest('[data-v101med]'):null;if(!b||!b.closest('#mgrBody')||!w104wLive())return;e.preventDefault();e.stopPropagation();cap104Pop()}catch(x){console.error(x)}},true);
function cap104Slot(w){const Md=w.medicus76;const m=CARE101.medicus;
  if(Md)return `<div class="v104cap on" title="${esc(MED_SK76[Md.skill]||'')}"><span class="v104cf">${cap104Face(Md,40)}</span><div class="v104ci"><b>${esc(Md.name)}</b><span class="v104cs">${cap104Stars(Md.skill)} <small>${_T('Capsarius')}</small></span><span class="v104cw">${coinAmt87(Md.wage)}<small>/${_T('wk')}</small> · +${m*Md.skill} h</span></div><button class="btn tksm" type="button" data-med76="fire">${_T`Let go`}</button></div>`;
  return `<div class="v104cap"><span class="v104cf empty">＋</span><div class="v104ci"><b>${_T('Capsarius')} · ${_T('empty')}</b><span class="v104cw">${_T`+${m}–${m*3} h a week`}</span></div><button class="btn tksm primary" type="button" data-v101med title="${esc(_T('A weekly wage · faster healing · more Medicus hours'))}">${_T('Hire')}</button></div>`}
function y104Ward(R,w,pm){const pane=R.querySelector('#mgrPane');if(!pane)return;const hd=pane.querySelector('.roomhd.w104ban');if(!hd)return;
  for(const x of pane.querySelectorAll('.w104list [data-v101med],.w104list .v101med,.w104house .v101med,.v102inf .v101med'))x.remove();
  if(!hd.querySelector('.v104cap')){const old=hd.querySelector('.w104bx .v101med');if(old)old.remove();
    const face=hd.querySelector('.rm100rd');const slot=cap104Slot(w);if(face)face.insertAdjacentHTML('afterend',slot);else hd.insertAdjacentHTML('afterbegin',slot);
    /* his hours on the bar */
    const Md=w.medicus76,bar=hd.querySelector('.w104bar');if(Md&&bar){const Mx=mh101Max(pm,w),cap=CARE101.medicus*(Md.skill||0);if(Mx&&cap){bar.insertAdjacentHTML('afterbegin',`<i class="k104cp" style="width:${(cap/Mx*100).toFixed(1)}%"></i>`);
      const lg=hd.querySelector('.w104hbl');if(lg)lg.insertAdjacentHTML('beforeend',`<span class="k104cp">🧑‍⚕️ ${_T`Capsarius ${cap} h`}</span>`)}}}
  /* B20 */
  for(const c of pane.querySelectorAll('.w104row .trt103')){c.textContent=_T('Receiving treatment');c.title=_T('Care is booked this week — it is done when the week ends')}
  for(const c of pane.querySelectorAll('.w104row .rst104')){c.textContent=_T('Resting');c.title=_T('Recovery is booked this week — it takes effect when the week ends')}}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{const w=w104wLive();if(typeof h!=='string'||!w||MGR.view)return h;const pm=me();if(!pm)return h;const tab=MGR.tab;if(tab!=='practice'&&tab!=='infirm')return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;if(tab==='practice')y104Practice(R,w,pm);else y104Ward(R,w,pm);return t.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- the look ---------- */
(()=>{const st=document.createElement('style');st.id='v104wcss';st.textContent=`
.rm100ban .v104dc{position:relative;z-index:2;display:grid;gap:1px;align-content:center;min-width:0;margin-left:auto;padding:4px 10px;border:1px solid #c9a46a88;border-radius:8px;background:#140c07d8;max-width:340px}
.v104dc b{font:600 14px var(--display,serif);color:#fff3d6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v104dc small{font-size:11px;color:#e8d6b0;line-height:1.25}
.v104st{font-size:12px;letter-spacing:1px;color:#f0cf7d}
.rm100ban .v104dc+.roomstat{margin-left:8px}
.v104top{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:4px 12px;margin:0 0 8px;padding:0 0 8px;border:0!important;background:none!important;box-shadow:none!important;border-bottom:1px solid #6b5236!important}
.v104top .v104tl{grid-column:1/-1;font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:#c9a46a}
.v104top .y92dr{margin-top:0}.v104top .y92dx{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.v104top .y92dx .rc-sub{display:none}
.v104top .yd76b[data-yj="study"]{flex:1 1 100%;text-align:left}
.v104top .y92rg.v104lk,.v104top button[disabled]{opacity:.55}.v104hold{flex-basis:100%;font-size:11px;color:#f0cf7d}
.v104y .rm100tb.y3{grid-template-columns:repeat(2,minmax(0,1fr))}
@container rm100d (min-width:761px){.rm100g3.rm100y1.v104y{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)}}
.rm100plt .v104unl{display:block;margin-top:3px;font-size:10.5px;line-height:1.25;color:#e8a08e;white-space:normal}
.roomhd.w104ban .v104cap{position:relative;z-index:2;display:flex;align-items:center;gap:8px;padding:4px 8px;border:1px solid #c9a46a88;border-radius:8px;background:#140c07d8;min-width:220px;max-width:300px;flex:0 1 auto}
.v104cap.on{border-color:#7fae5f}.v104cf{flex:none;width:40px;height:40px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:radial-gradient(circle at 40% 30%,#4a8a6e,#173a2c);border:2px solid #c9a46a}
.roomhd .v104cf svg,.v104cph svg{position:static;inset:auto;width:100%;height:100%;display:block}.v104cf.empty{background:none;border:2px dashed #c9a46a99;color:#c9a46a;font-size:20px}
.v104ci{display:grid;gap:0;min-width:0;line-height:1.25}.v104ci b{font-size:12.5px;color:#fff3d6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v104cs{font-size:11.5px;color:#f0cf7d;letter-spacing:1px}.v104cs small{letter-spacing:0;color:#e8d6b0}
.v104cw{font-size:11px;color:#e8d6b0;white-space:nowrap}.v104cw small{opacity:.8}
.w104bar{position:relative}.w104bar i.k104wc,.w104bar i.k104rc{position:relative;z-index:1}.w104bar i.k104cp{position:absolute;right:0;top:0;bottom:0;background:repeating-linear-gradient(135deg,#d6ab4c 0 4px,#a98530 4px 8px);opacity:.75}
.w104hbl .k104cp::before{background:#d6ab4c}
.v104mc{position:relative;width:min(640px,100%)!important}.v104x{position:absolute;right:10px;top:10px}.v104mc>b{display:block;padding-right:34px}
.v104ctl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:6px 0 2px}
.v104ct{display:grid;justify-items:center;gap:4px;padding:10px 8px;text-align:center;border:1px solid #6b5236;border-radius:8px;background:#21170f;color:inherit;cursor:pointer;font:inherit}
.v104ct:hover:not([disabled]){border-color:#d6ab4c;background:#2a1d13}.v104ct.poor{opacity:.6;cursor:default}
.v104cph{width:64px;height:64px;border-radius:50%;overflow:hidden;border:2px solid #c9a46a;background:radial-gradient(circle at 40% 30%,#4a8a6e,#173a2c)}.v104cph svg{width:100%;height:100%;display:block}
.v104cn{font-size:13px;color:#fff3d6}.v104chp{display:flex;flex-wrap:wrap;gap:3px;justify-content:center}.v104chp i{font-style:normal;font-size:10.5px;padding:1px 7px;border:1px solid #8a6a44;border-radius:9px;color:#e8d6b0;background:#140c07}
.v104chp i.lure{border-color:#a8665a;color:#f0b8aa}.v104hb{pointer-events:none;margin-top:2px}
@media (max-width:760px){.rm100ban .v104dc{margin-left:0;max-width:none;flex:1 1 100%;order:7}.v104top{grid-template-columns:1fr}
  .roomhd.w104ban .v104cap{order:3;flex:1 1 100%;max-width:none}.v104ctl{grid-template-columns:1fr}.v104ct{grid-template-columns:64px minmax(0,1fr);justify-items:start;text-align:left;column-gap:10px}.v104ct .v104cph{grid-row:span 4}.v104ct .v104chp{justify-content:flex-start}}`;document.head.appendChild(st)})();
}
