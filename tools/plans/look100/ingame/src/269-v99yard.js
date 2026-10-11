/* =====================================================================
   269-V99YARD · v0.99 — Training Yard layout + trials (Virgilante's notes 1-4, Manager -> Training Yard)
   =====================================================================
   1. The fighter picked for a trial is OBVIOUS: his card gets a gold frame and a "⚔ Selected for a trial" ribbon strip (every other card
      carries a quiet "⚔ Select for a trial" strip; click it or the card's head), and the Trials panel opens on his large portrait + name,
      rating, status. MGR.tr92 stays the one source of truth (the old [data-tr92] select is kept inside the panel header).
   2. Cards sit in a grid of at most 3 per row (container query on the yard: 3 wide / 2 tablet / 1 phone); a card that gets narrow
      re-flows its bars (label + value above, bar + buttons below).
   3. TRIALS OF THE YARD = a sticky column on the RIGHT of the cards (wide yards, 900 px+); on narrower yards it sits under the cards.
      Same ids/classes as 213 (.y92trials, [data-yb76], panel cut from yardCard76) so every old handler and test still works.
   4. TRIAL LIMITS. BEFORE: a trial was limited PER FIGHTER only, one trial a week of any kind (boutDone76: a spar he is part of -
      as caller or partner - OR his exhibition OR his pen fight); any number of fighters could use the same trial in a week.
      NOW: the same per-fighter rule stays, AND each trial (⚔ Spar, 🏟 Exhibition, 🐾 Beast pen) can be used by ONE fighter of the
      house a week: trialUsedBy99(k,w) names who (spar: the pair booked this week, cancelling it with ✕ frees the trial; exhibition:
      exWk; pen: pen76Wk). The trial's card is disabled "Used this week by <name>"; refused again at the action itself (spar book, exhibition
      go, pen go). Resets with the week (exWk/pen76Wk hold the week number; the spar pair lives in the weekly plan).
   Test: tv99y.
   ===================================================================== */
function trialUsedBy99(k,w){w=w||W_();const m=me();if(!w||!m)return null;const ros=rosterOf(m);
  if(k==='spar'){const P=thPlan(w);const p=P.pairs.find(x=>x.k==='spar');return p?{g:gById(p.a)||gById(p.b),b:gById(p.b),i:P.pairs.indexOf(p)}:null}
  if(k==='exh'){const g=ros.find(x=>x.exWk===w.week);return g?{g}:null}
  if(k==='pen'){const g=ros.find(x=>x.pen76Wk===w.week);return g?{g}:null}
  return null}
const trialUsedTxt99=(k,w)=>{const u=trialUsedBy99(k,w);return u&&u.g?_T`Used this week by ${esc(u.g.name)}`:''};

/* ---------- the Trials panel ---------- */
y92TrialsHTML=function(w,m){const ros=rosterOf(m);if(!ros.length)return '';
  if(MGR.yb76&&MGR.yb76.k!=='bond'&&ros.some(g=>g.id===MGR.yb76.gid))MGR.tr92=MGR.yb76.gid;
  if(!ros.some(g=>g.id===MGR.tr92)){const ok=ros.find(g=>!y92Lock(g)&&!boutDone76(g,w));MGR.tr92=(ok||ros[0]).id}
  const g=gById(MGR.tr92);const left=thLeft(w);const lk=y92Lock(g);const bd=boutDone76(g,w);
  const busy=MGR.yb76&&MGR.yb76.gid===g.id&&MGR.yb76.k!=='bond'?MGR.yb76.k:null;
  const opps=w.mgrs.filter(x=>!x.isPlayer&&rosterOf(x).length);const mine=lk?lk[1]:bd?_T('One trial a week — done'):'';
  const card=(k,art,ttl,cost,fat,give,attr,why)=>{const used=trialUsedTxt99(k,w);const dis=used||mine||why;
    return `<div class="y92t${busy===k?' on':''}${dis?' dis':''}${used?' used99':''}" data-y99t="${k}"><div class="y92ta">${art}</div><div class="y92tb"><b>${ttl}</b>
      <span class="y92tl">⏳ ${cost}</span><span class="y92tl">😮‍💨 ${fat}</span><span class="y92tl give">${give}</span>
      ${used?`<span class="y99used">🔒 ${used}</span>`:''}
      <button type="button" class="btn tksm ${busy===k?'':'primary'}" ${attr} ${dis&&busy!==k?`disabled title="${esc(dis)}"`:''}>${busy===k?_T('Close'):_T('Pick this')}</button></div></div>`}; /* i18n:skip */
  const cards=[card('spar',Y92_ART.spar,_T('⚔ Spar'),_T('2 h each · a housemate'),`+${FAT_SPAR}`,_T('🏃 +0.25 · 💪 +0.25 each'),`data-yb76="spar:${g.id}"`,left<2?_T('Needs 2 hours'):''), /* i18n:skip */
    card('exh',Y92_ART.exh,_T('🏟 Exhibition'),_T`${EXHIB_HOURS} h · ${coinAmt87(EXHIB_COST)}`,`+${FAT_EXH}`,_T`vs a rival · a chance at +1 rating · +1 AP and ${cfAmt87('+2')} this Match Week`,`data-yb76="exh:${g.id}"`,!opps.length?_T('No rival has fighters'):left<EXHIB_HOURS?_T`Needs ${EXHIB_HOURS} hours`:m.coin<EXHIB_COST?_T('Not enough coin'):''), /* i18n:skip */
    card('pen',Y92_ART.pen,_T('🐾 Beast pen'),_T`${PEN76.hours} h + fee`,_T('a real fight'),_T`kill it: +${PEN76.bonus} to a rating`,`data-yb76="pen:${g.id}"`,left<PEN76.hours?_T`Needs ${PEN76.hours} hours`:'')].join(''); /* i18n:skip */
  let panel='';if(busy){try{const h=yardCard76(g,w,m);const i=h.indexOf('<div class="yd76p');if(i>=0){const c=cutDiv(h,i);if(c)panel=c[0]}}catch(e){console.error(e)}}
  let res=[];try{res=yardRes76(g,w).filter(x=>/⚔|🏟|🐾/.test(x))}catch(e){}
  const sel=`<select class="tin" data-tr92 aria-label="${_T('Fighter')}">${ros.map(x=>{const y=y92Lock(x);const d=boutDone76(x,w);return `<option value="${x.id}" ${x.id===g.id?'selected':''}>${esc(x.name)}${y?` — ${y[1]}`:d?_T(' — trial done'):''}</option>`}).join('')}</select>`;
  const st=lk?`<span class="y99st bad">${lk[0]} ${lk[1]}</span>`:bd?`<span class="y99st">${_T('One trial a week — done')}</span>`:`<span class="y99st ok">${_T('Ready for a trial')}</span>`;
  return `<div class="y92trials" data-y99g="${g.id}"><div class="y99who">${gArt(g,'md')}<div class="y99wn"><span class="y99k">${_T`⚔ Trials of the Yard`}</span><b>${esc(g.name)}</b>
      <span class="rc-sub">${_T`rating ${effOvr(g)} · morale ${g.morale}`}</span>${st}</div></div>
    <div class="y99sel"><label class="rc-sub">${_T`Fighter`} ${sel}</label><span class="rc-sub">${_T`one trial a week per fighter · each trial one fighter a week`}</span></div>
    <div class="y92tg">${cards}</div>${panel}${res.length?`<div class="yd76res">${res.map(x=>`<span>${x}</span>`).join('')}</div>`:''}</div>`};

/* ---------- the cards: ribbon strip on top ---------- */
{const base=y92Card;y92Card=function(g,w,m){let h=base.apply(this,arguments);try{
  const on=MGR.tr92===g.id;const strip=on?`<div class="y99rib" aria-hidden="true">${_T('⚔ Selected for a trial')}</div>`:`<button type="button" class="y99pick" data-y99sel="${g.id}">${_T('⚔ Select for a trial')}</button>`;
  const i=h.indexOf('<div class="y92c');if(i<0)return h;const j=h.indexOf('>',i);let tag=h.slice(i,j+1);if(on)tag=tag.replace('class="y92c',_T('class="y92c sel99'));
  h=h.slice(0,i)+tag+strip+h.slice(j+1)}catch(e){console.error(e)}return h}}

/* ---------- the tab: cards left, trials right ---------- */
yard92HTML=function(){const w=W_(),m=me();const ros=rosterOf(m);
  if(ros.length&&!ros.some(g=>g.id===MGR.tr92)){const ok=ros.find(g=>!y92Lock(g)&&!boutDone76(g,w));MGR.tr92=(ok||ros[0]).id}
  const cards=ros.map(g=>y92Card(g,w,m)).join('');const last=(w.lastPlan||[]).slice(0,6);
  const away=typeof yd90Away==='function'&&yd90Away(w)?`<div class="card2 yd90away">${_T`🛣 Away — no training this week`}</div>`:'';
  return `${away}${y92DocHTML(w,m)}<div class="y99wrap"><div class="y99in"><div class="y99main"><div class="y92grid">${cards||`<p class="rc-sub">${_T`No fighters in the yard.`}</p>`}</div></div>
    <aside class="y99side">${y92TrialsHTML(w,m)}</aside></div></div>
    ${last.length||(w.exlog||[]).length?`<details class="yd76log"><summary class="rc-sub">${_T`📜 Last week in the yard`}</summary>${last.map(x=>`<div class="rc-sub">${x}</div>`).join('')}${(w.exlog||[]).slice(0,4).map(x=>`<div class="rc-sub">S${x.s} W${x.wk} · ${x.txt}</div>`).join('')}</details>`:''}`};

/* ---------- picking the fighter ---------- */
window.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target.closest('[data-y99sel],.y92hd'):null;if(!t||!t.closest('#mgrBody'))return;
  const c=t.closest('[data-y92c]');const id=t.dataset.y99sel||(c&&c.dataset.y92c);if(!id||!gById(id)||MGR.tr92===id&&!t.dataset.y99sel)return;
  if(MGR.tr92!==id){MGR.tr92=id;if(MGR.yb76&&MGR.yb76.k!=='bond')MGR.yb76=null;if(typeof MGR_REDRAW==='function')MGR_REDRAW();
    setTimeout(()=>{try{const s=document.querySelector('.y99side');if(s&&s.getBoundingClientRect().left<document.querySelector('.y99main').getBoundingClientRect().right-40)return;if(s)s.scrollIntoView({behavior:'smooth',block:'nearest'})}catch(er){}},80)}},true);

/* ---------- one fighter per trial a week: refused at the action too ---------- */
window.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target.closest('[data-yp76],[data-mg="exsim"],[data-mg="exlive"],[data-mg="exfight"],[data-pen76="go"],[data-yb76]'):null;if(!t||!t.closest('#mgrBody'))return;
  let k=null;if(t.dataset.yp76)k=t.dataset.yp76.split('|')[0]==='spar'?'spar':null;else if(t.dataset.yb76)k=t.dataset.yb76.split(':')[0];else if(t.dataset.pen76)k='pen';else k='exh';
  if(!k||!['spar','exh','pen'].includes(k))return;const w=W_();if(!w)return;
  if(t.dataset.yb76&&MGR.yb76&&MGR.yb76.k===k&&MGR.yb76.gid===(t.dataset.yb76.split(':')[1]))return; /* closing an open panel */
  const used=trialUsedTxt99(k,w);if(!used)return;e.preventDefault();e.stopImmediatePropagation();mToast(used)},true);

(()=>{const st=document.createElement('style');st.textContent=`
.y99wrap{container:y99/inline-size;min-width:0;margin:10px 0}
.y99in{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:start}
.y99main{min-width:0}.y99main .y92grid{margin:0;grid-template-columns:minmax(0,1fr)}.y99side{min-width:0}.y99side .y92trials{margin:0}
.y92c{position:relative;padding-top:0}.y99pick,.y99rib{margin:0 -10px 4px;border:0;border-bottom:1px solid var(--line2);border-radius:9px 9px 0 0;padding:4px 10px;font:600 11px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;text-align:left;min-height:26px}
.y99pick{background:rgba(0,0,0,.18);color:var(--muted);cursor:pointer}.y99pick:hover{color:var(--gold2);background:rgba(214,171,76,.1)}
.y99rib{background:linear-gradient(90deg,#b9902f,#e3c27a);color:#2b1c0f;border-bottom-color:#e3c27a}
.y92c.sel99{border:2px solid #e3c27a;box-shadow:0 0 0 2px rgba(227,194,122,.35),0 0 18px rgba(227,194,122,.25)}.y92c.sel99 .y99rib{margin:0 -10px 4px}
.y92hd{cursor:pointer}
.y99who{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;padding-bottom:8px;border-bottom:1px solid #6b5420;margin-bottom:8px}
.y99who .portrait{border:2px solid #e3c27a;border-radius:8px;overflow:hidden;display:block;max-width:100%}
.y99wn{display:grid;gap:2px;min-width:0}.y99wn b{font:400 24px/1.1 var(--display);color:var(--gold2);overflow-wrap:anywhere}.y99k{font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:#e3c27a}
.y99st{justify-self:start;font-size:12px;border:1px solid var(--line2);border-radius:9px;padding:1px 8px;color:var(--muted)}.y99st.ok{color:#cfe3b8;border-color:#5a7a3a}.y99st.bad{color:#f0a090;border-color:#8a3a2a}
.y99sel{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;margin-bottom:8px}.y99sel select{max-width:200px}
.y99used{font-size:12px;color:#7a2a12;font-weight:600}.y92t.used99{filter:saturate(.35);opacity:.8}
.y92trials{padding-top:10px}
@container y99 (min-width:600px){.y99main .y92grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container y99 (min-width:900px){.y99in{grid-template-columns:minmax(0,1fr) 290px}.y99main .y92grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .y99side{position:sticky;top:8px;max-height:calc(100vh - 16px);overflow:auto;overscroll-behavior:contain}.y99side .y92tg{grid-template-columns:minmax(0,1fr)}
  .y99side .y92t{grid-template-columns:96px minmax(0,1fr);grid-template-rows:none}.y99side .y92ta svg{height:100%;min-height:90px}.y99side .y99who{grid-template-columns:auto minmax(0,1fr)}
  .y99side .y99wn b{font-size:20px}}
@container y99 (max-width:899px){.y99side .y92tg{grid-template-columns:repeat(3,minmax(0,1fr))}.y99side .y92t{grid-template-columns:none;grid-template-rows:auto 1fr}.y99side .y92ta svg{height:84px}}
@container y99 (max-width:599px){.y99side .y92tg{grid-template-columns:minmax(0,1fr)}.y99side .y92t{grid-template-columns:120px minmax(0,1fr);grid-template-rows:none}.y99side .y92ta svg{height:100%}}
@container (max-width:270px){.y92nm b{white-space:normal;overflow:visible}.y92nm{align-self:start}.y92r{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"l v" "m pm";row-gap:2px;column-gap:8px}.y92r .y92l{grid-area:l}.y92r .y92v{grid-area:v}.y92r .y92m{grid-area:m}.y92r .y92pm{grid-area:pm;justify-content:flex-end}
  .y92r.ro{grid-template-areas:"l v" "m n"}.y92r.ro .y92note{grid-area:n;grid-column:auto}.y92hd{grid-template-columns:auto minmax(0,1fr) auto}}
`;document.head.appendChild(st)})();
