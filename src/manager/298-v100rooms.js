/* =====================================================================
   298-V100ROOMS · v1.0 — THE MANAGER ROOMS: ROSTER · TRAINING YARD · INFIRMARY (his approved mock tools/plans/mock100/rooms.html,
   NOTES-rooms.md round 4; shots of the build: tools/plans/rooms100/ via shots.js)
   =====================================================================
   One LOOK for the three rooms (the recruit3 style): a compact fresco BANNER (the room's advisor as a round head: Barracks master /
   Doctore / Medicus, title, line, a count box on the right), a LIST column on the left (one-line rows) and a DOSSIER on the right
   (portrait, panels, painted plates, a wax TABULA). A final mgrHTML wrapper RE-HOMES the finished page (every earlier wrapper has
   run): live nodes move into the new layout, so every data-* handler, MGR state and old test selector keeps working. Nothing in the
   rules, the week's maths or the save changes.
   ROSTER (229 st95 starters/bench/loans, 17 detailHTML card):
     • list .rm100list (also .st95list): slot I/II/III/B/L · face · name · Ovr · W–L · fatigue dot · wound (⚕ / ✂) · weeks left;
       a row = [data-mg="lsel"] (17's own handler). Lent-out fighters show as L (not selectable — they live in the other house).
     • three STARTER TABLETS (.depth > .st95slot[data-slot95]: the slot nodes themselves) — Bout I Undercard · II Feature · III Main
       event: strip art, round face, name, class · rating · fatigue · city; the slot's own Change… select + 🪑 Bench stay in a foot.
     • dossier: portrait block (17's header line kept), RATINGS (17's .ratgrid + an Overall row), PERSONALITY · RECORD · SCARS
       (temper persTags73, wants wants88, record g.rec, scars = g.hist lines about wounds/limbs, last bout g.recent),
       BENCH & LOANS (every non-starter: ⭐ Promote / Lend… moved from the old table rows, ⚕ Ward → data-inf90go, 70's ⇠ Recall),
       the CONTRACT TABULA (Clerk's line, wage, weeks left, clauses = 76's data-cl76 buttons, renewal ask askWage, ✍ Renew = the
       card's data-mg="extend", ⇢ Lend, ✕ Release = data-mg="release"), KEEPING HIM (the card's .acts) and a fold with the rest of
       the card (purse, morale/loyalty, rival interest, how he grades you, chronicle).
   TRAINING YARD (213/269/184): MGR.tr92 = the fighter in the dossier (the list rows are 269's [data-y99sel]); his .y92c card in the
     dossier (portrait beside the bars), the other cards kept in a hidden holder (.rm100hold — their buttons still answer); THE
     DOCTORE (.y92doc, bronze head, intensity as a segmented row, time + Study); THE WEEK'S PLAN tabula (per fighter: sessions, lock,
     hours; house hours; ↻ Same as last week / 🤝 Care / 🔒 Lock in all = the old buttons moved); the DRILL PLATES (Y92_PRE, one a
     fighter a week: [data-y92pre="id|k"] — 213's handler; level-locked / needs a locked session / used); TRIALS OF THE YARD as a
     full-width strip of three big plates (.y92trials / .y92t / [data-yb76] untouched, art replaced).
   INFIRMARY (183/151/108): the list = 183's .iv90list rows; the patient panel + the MARBLE STATUE (183's avatar90 svg: the marble
     image, the wound as a soft red spot, a lost limb broken off — masked from the marble — and drawn as a pale ghost with a dashed
     outline) inside .iv90mid (the HP / fatigue bars stay in it); THE ROAD BACK tabula (fit week per cure from the tiles' own
     fitWeekOf text, Hygeia for a lost limb, rest week for fatigue); the CARE PLATES = .iv90care with its .iv90s sections as
     display:contents, so every plan tile / bed / Hygeia / bath / rest / care button becomes a plate (their handlers unchanged).
   Phones (container queries): one column — banner, list, then the dossier panels; no sideways scroll; plates 2 across.
   Lesson (36-mtutor): the roster step points at the list row; the yard shows lesson fighter B, the drill step lights the plates.
   Display only, no per-frame cost (static DOM; pictures = 294a's cached scene100 + the minis). Kill switch localStorage
   flavius_rooms100off=1 (the old rooms). Test tv100rm.
   ===================================================================== */
const RM100={tabs:{roster:'barracks',practice:'doctore',infirm:'medicus'}};
function rm100On(){try{return localStorage.getItem('flavius_rooms100off')!=='1'}catch(e){return true}}
const rm100Tpl=h=>{const t=document.createElement('template');t.innerHTML=h||'';return t};
const rm100El=h=>rm100Tpl(h).content.firstElementChild;
/* a round face from the portrait (294's crop when present) */
function rm100Face(g){try{return gArt(g,'xs').replace('viewBox="0 0 100 140"','viewBox="15 22 70 70"')}catch(e){return ''}}
function rm100Adv(k,sz){try{const w=W_();const a=council83(w).find(x=>x.k===k);return a?{a,f:face83(a,sz)}:null}catch(e){return null}}
const RM100_MINI=['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio','leo','leaena','ursa'];
function rm100MiniK(g){const c=g&&g.cls;if(RM100_MINI.includes(c))return c;const C=CLASSES[c];const r=C&&(C.clsRef||C.base);const k=r&&String(r).replace(/^cls:/,'');return RM100_MINI.includes(k)?k:'soldier'}
function rm100Mini(k,css){if(!RM100_MINI.includes(k))k='soldier';return `<img class="rm100mini" src="${typeof assetURL==='function'?assetURL(typeof st107Mini==='function'?st107Mini(k):'mini_'+k+'.webp'):'assets/mini_'+k+'.webp'}" style="${css||''}" alt="" draggable="false" decoding="async">`}
/* a painted plate: one of 294a's cached scenes (object-position = pos) + figures on top */
function rm100Scn(k,pos){try{return `<span class="rm100pic" style="--op:${pos||'50% 50%'}">${typeof scene100==='function'?scene100(k,'tile','rm100sc'):''}</span>`}catch(e){return ''}}
const rm100Art=(inner,cls)=>`<span class="rm100fr${cls?' '+cls:''}" aria-hidden="true">${inner}</span>`;
const rm100Fd=g=>{const f=gFat(g);const b=fatBand90(f);return `<i class="rm100fd ${b}" title="${esc(FB90_TXT()[b][1])}"></i>`};
const RM100_RN=['I','II','III'];
/* an Immortalis wears 157's laurel frame wherever his face shows */
const rm100Imm=(h,g)=>{try{return typeof imm88Frame==='function'?imm88Frame(h,g):h}catch(e){return h}};
const rm100First=g=>String(g&&g.name||'').replace(/^"|"$/g,'').split(/\s+/)[0];

/* ---------- the banner: the room's advisor as a round head, the count box on the right ---------- */
function rm100Banner(R,tab,cnt){const hd=R.querySelector('#mgrPane .roomhd, .railmain>.roomhd');if(!hd)return null;
  hd.classList.add('rm100ban');const A=rm100Adv(RM100.tabs[tab],52);
  if(A&&!hd.querySelector('.rm100rd'))hd.insertAdjacentHTML('afterbegin',`<span class="rm100rd rm100adv" title="${esc(A.a.name+' · '+A.a.role)}">${A.f}</span>`);
  if(tab==='practice'&&typeof scene100==='function'&&!hd.querySelector('.rm100bimg'))hd.insertAdjacentHTML('afterbegin',`<span class="rm100bimg" aria-hidden="true">${scene100('school','banner','rm100sc')}</span>`);
  {const st=hd.querySelector('.roomstat');if(st)st.classList.add('rm100cnt');else if(cnt)hd.insertAdjacentHTML('beforeend',`<div class="roomstat rm100cnt">${cnt}</div>`)}
  return hd}

/* ============================== ROSTER ============================== */
function rm100Scars(g){const H=(g.hist||[]).filter(h=>/wound|injur|sever|lost|limb|gash|torn|broke|scar|arm|leg|chest|head|cut/i.test(String(h.txt||'').replace(/<[^>]*>/g,'')));
  return H.slice(0,3).map(h=>`${String(h.txt||'').replace(/<[^>]*>/g,'').slice(0,40)} (S${h.s} W${h.wk})`).join(' · ')}
function rm100Rec(g){const r=g.rec||{};const w=r.w||0,ev=r.ev||0;return {w,l:Math.max(0,ev-w),ev}}
function rm100RosterList(w,pm,ros,sel){const out=w.glads.filter(g=>g.alive&&g.loanFrom&&g.loanFrom.mid===pm.id&&g.contract&&g.contract.mgr!==pm.id);
  const ord=g=>g.slot95?g.slot95:g.inj?5:g.loanFrom?6:4;const L=[...ros].sort((a,b)=>ord(a)-ord(b)||effOvr(b)-effOvr(a));
  const row=(g,lent)=>{const s=lent?'L':g.slot95?RM100_RN[g.slot95-1]:g.loanFrom?'L':'B';const sc=g.slot95?'s':s==='L'?'l':'';const r=rm100Rec(g);
    const wd=(g.inj&&!g.inj.war?'⚕':'')+((g.severed||[]).length?'✂':'');const wk=g.contract?Math.max(0,g.contract.weeks):'';
    const at=lent?`aria-disabled="true" title="${esc(_T`${g.name} — on loan`)}"`:`data-mg="lsel" data-id="${g.id}" role="button" tabindex="0" title="${esc(g.name)}"`;
    return `<div class="rm100lr ros${!lent&&g.id===sel?' on':''}${lent?' lent':''}" ${at}><span class="rm100slot ${sc}">${s}</span><span class="rm100av">${rm100Face(g)}</span><b class="rm100one">${esc(g.name)}${typeof chip85==='function'?chip85(g):''}</b><span class="rm100num">${effOvr(g)}</span><span class="rm100iv">${r.w}–${r.l}</span>${rm100Fd(g)}<span class="rm100wm">${wd}</span><span class="rm100iv">${wk}</span></div>`};
  return `<div class="rm100lhd"><span>${_T`Your fighters`} · ${ros.length}</span></div><div class="rm100rows"><div class="rm100lh ros"><span>${_T`Slot`}</span><span></span><span>${_T`Name`}</span><span>${_T`Ovr`}</span><span>${_T`W–L`}</span><span>●</span><span>⚕</span><span>${_T`Wk`}</span></div>${L.map(g=>row(g,false)).join('')}${out.map(g=>row(g,true)).join('')}</div>`}
function rm100Roster(R,w,pm){const pane=R.querySelector('#mgrPane');const wrap=pane&&pane.querySelector('.st95wrap');if(!wrap)return false;
  const ros=rosterOf(pm);const g=gById(MGR.lsel)&&ros.some(x=>x.id===MGR.lsel)?gById(MGR.lsel):ros[0];if(!g)return false;
  const loc=w.night&&LOCATIONS[w.night.loc]?LOCATIONS[w.night.loc].n:'';
  /* harvest: the old list rows' actions (Promote / Bench / Lend) */
  const act={};for(const tr of wrap.querySelectorAll('.st95list tr[data-mg="lsel"]')){const td=tr.querySelector('td.st95act');act[tr.dataset.id]=td?[...td.querySelectorAll('button,select')]:[]}
  /* the starter tablets = the slot nodes */
  const stt=document.createElement('div');stt.className='depth rm100stt';
  for(const sl of wrap.querySelectorAll('.st95slot')){const s=+sl.dataset.slot95;const g0=ros.find(x=>x.slot95===s);const sa=sl.querySelector('.st95sa');const on=sl.querySelector('.st95on');
    const B=ST95_BOUT[s-1]||['','',''];const art=rm100Scn(['school','promote','team'][s-1]||'school',['50% 72%','50% 30%','50% 20%'][s-1]);
    sl.classList.add('rm100st');sl.innerHTML=`<span class="rm100sb">${art}</span><span class="rm100tier">${B[1]} · ${B[2]}</span><span class="rm100rn" aria-hidden="true">${RM100_RN[s-1]}</span>
      ${g0?`${rm100Imm(`<span class="rm100rd" data-mg="lsel" data-id="${g0.id}" role="button" tabindex="0" aria-label="${esc(g0.name)}">${rm100Face(g0)}</span>`,g0)}<div class="rm100tx"><b class="rm100one" data-mg="lsel" data-id="${g0.id}">${esc(g0.name)}</b><small class="rm100one">${esc(CLASSES[g0.cls]?CLASSES[g0.cls].name:'')} · ${effOvr(g0)} · ${rm100Fd(g0)} ${FB90_TXT()[fatBand90(gFat(g0))][0]} ${gFat(g0)}${loc?' · '+esc(loc):''}</small></div>`
        :`<span class="rm100rd empty"></span><div class="rm100tx"><b>${_T`Empty`}</b><small>${_T`Promote someone from the list.`}</small></div>`}<div class="rm100sa"></div>`;
    const foot=sl.querySelector('.rm100sa');if(on)foot.appendChild(on);if(sa)foot.appendChild(sa);stt.appendChild(sl)}
  /* the fighter card (17 detailHTML) */
  const right=wrap.querySelector('.st95right');const card=right&&right.querySelector('.card2');const extra=right?[...right.children].filter(x=>x!==card):[];
  const head=card&&card.firstElementChild&&card.firstElementChild.querySelector('.portrait')?card.firstElementChild:null;
  const sub=head?head.querySelector('.rc-sub'):null;
  const rat=card&&card.querySelector('.ratgrid');const cl=card&&card.querySelector('.cl76');
  const keep=card&&[...card.querySelectorAll('.acts')].find(a=>a.querySelector('[data-mg="meal"],[data-mg="word"],[data-mg="bonus"]'));
  const ext=card&&card.querySelector(`[data-mg="extend"][data-id="${g.id}"]`);const rel=card&&card.querySelector(`[data-mg="release"][data-id="${g.id}"]`);
  const streak=card&&card.querySelector('.st87');if(head)head.remove();if(rat){const s0=rat.previousElementSibling;if(s0&&s0.classList.contains('sect'))s0.remove();rat.remove()}
  if(cl){const nx=cl.nextElementSibling;if(nx&&nx.tagName==='P'&&/\d/.test(nx.textContent))nx.remove();cl.remove()}
  if(keep){const s0=keep.previousElementSibling;if(s0&&s0.classList.contains('sect'))s0.remove();keep.remove()}
  if(ext)ext.remove();if(rel)rel.remove();
  const slotN=g.slot95||0;const st=gStats(g)||{};const ov=effOvr(g);const gr=typeof trait96Grade==='function'?trait96Grade(ov):'';const f=gFat(g);const loy=typeof loyaltyOf==='function'?loyaltyOf(g):0;const r=rm100Rec(g);
  const phd=slotN?_T`${ST95_BOUT[slotN-1][1]} · ${ST95_BOUT[slotN-1][2]} starter`:g.inj?_T`In the ward`:g.loanFrom?_T`On loan to you`:_T`On the bench`;
  const pblk=`<section class="rm100p rm100pp"><div class="rm100ph">${phd}</div><div class="rm100pblk"><span class="rm100fr rm100por">${gArt(g,'md')}</span><div class="rm100pi">
    <div class="rm100pn">${slotN===3?'★ ':''}${esc(g.name)}${typeof chip85==='function'?chip85(g):''}</div><div class="rm100pl rm100sub"></div>
    <div class="rm100pl">${_T`Overall`} <b class="rm100g">${ov}</b>${gr?' · '+gr:''} · ${rm100Fd(g)} ${FB90_TXT()[fatBand90(f)][0]} ${f}</div>
    <div class="rm100pl">${_T`Morale ${g.morale||0} · Loyalty ${loy}`}</div>
    <div class="rm100chips"><button type="button" class="rm100ch" data-mg="tab" data-id="armory" data-rm100ar="${g.id}">🛡 ${_T`Armory`}</button>${g.inj?`<button type="button" class="rm100ch" data-mg="tab" data-id="infirm" data-inf90go="${g.id}">⚕ ${_T`Ward`}</button>`:''}</div></div></div></section>`;
  const STK=[['spd','🏃'],['str','💪'],['int','🧠'],['lck','🍀'],['cha','🎭']];
  const ratP=`<section class="rm100p rm100rat"><div class="rm100ph">${_T`Ratings · signed, so numbers`}</div><div class="rm100ov"><span>⚖</span><span>${_T`Overall`}</span><span class="rm100bar"><i style="width:${Math.min(100,ov)}%"></i></span><span class="rm100v">${ov}</span></div><div class="rm100rg"></div></section>`;
  const tags=(typeof persTags73==='function'?persTags73(g):[]).slice(0,2);const wn=typeof wants88==='function'?wants88(g):[];
  const last=(g.recent||[]).slice(-1)[0];const scars=rm100Scars(g)||_T`none yet`;
  const prow=(k,v)=>`<div class="rm100row"><span class="rm100k">${k}</span><span class="rm100one">${v}</span></div>`;
  const pers=`<section class="rm100p rm100pers"><div class="rm100ph">${_T`Personality · record · scars`}</div>
    ${prow(_T`Temper`,tags.map(t=>`<span class="rm100tg t">${esc(t)}</span>`).join('')||'—')}
    ${prow(_T`Wants`,wn.map(k=>{const d=typeof want88Def==='function'?want88Def(k,g):[k,'',k];return `<span class="rm100tg w">${d[1]} ${esc(d[2])}</span>`}).join('')||'—')}
    ${prow(_T`Record`,_T`${r.w}–${r.l} · ${r.ev} bouts${g.rec&&g.rec.kn?` · ${g.rec.kn} beasts`:''}`)}
    ${prow(_T`Scars`,esc(scars))}
    ${prow(_T`Last`,last?esc(`W${last.wk} ${last.loc||''} · ${last.won?_T('won'):last.place?_T`place ${last.place}`:_T('fought')}${last.f?_T` · ${last.f} CF`:''}`):_T`no bout yet`)}</section>`;
  /* bench & loans */
  const out=w.glads.filter(x=>x.alive&&x.loanFrom&&x.loanFrom.mid===pm.id&&x.contract&&x.contract.mgr!==pm.id);
  let rec={};try{const lt=rm100Tpl(typeof loansCardHTML==='function'?loansCardHTML():'').content;for(const b of lt.querySelectorAll('[data-recall]'))rec[b.dataset.recall]=b}catch(e){}
  const bench=document.createElement('section');bench.className='rm100p rm100bench';bench.innerHTML=`<div class="rm100ph">${_T`Bench & loans`}</div>`;
  const brow=(x,lent)=>{const d=document.createElement('div');d.className='rm100row rm100br';const other=lent?mgrById(x.contract.mgr):x.loanFrom?mgrById(x.loanFrom.mid):null;
    const note=lent?`${esc(other?other.ludus:'')}${x.contract?' · '+_T`${Math.max(0,x.contract.weeks)} wk`:''}`:x.inj&&!x.inj.war?_T`⚕ in the ward`:x.loanFrom?_T`← from ${esc(other?other.ludus:'')}`:`${rm100Fd(x)} ${FB90_TXT()[fatBand90(gFat(x))][0]} ${gFat(x)}`;
    d.innerHTML=`<span class="rm100av">${rm100Face(x)}</span>${rm100Imm(`<span class="rm100one"${lent?'':` data-mg="lsel" data-id="${x.id}" role="button" tabindex="0"`}><b>${esc(x.name)}</b> · ${esc(CLASSES[x.cls]?CLASSES[x.cls].name:'')} · ${effOvr(x)}</span>`,x)}<span class="rm100one rm100mut">${note}</span><span class="rm100ba"></span>`;
    const ba=d.querySelector('.rm100ba');
    if(lent){if(rec[x.id])ba.appendChild(rec[x.id])}
    else if(x.inj&&!x.inj.war)ba.insertAdjacentHTML('beforeend',`<button type="button" class="rm100ch" data-mg="tab" data-id="infirm" data-inf90go="${x.id}">⚕ ${_T`Ward`}</button>`);
    else for(const b of act[x.id]||[])if(!(x===g&&b.matches('select[data-m47lend]')))ba.appendChild(b);
    return d};
  const nonStart=ros.filter(x=>!x.slot95).sort((a,b)=>(a.inj?1:0)-(b.inj?1:0)||effOvr(b)-effOvr(a));
  for(const x of nonStart)bench.appendChild(brow(x,false));for(const x of out)bench.appendChild(brow(x,true));
  if(!nonStart.length&&!out.length)bench.insertAdjacentHTML('beforeend',`<p class="rm100mut">${_T`Everyone fit is a starter. Lend a benched fighter from here.`}</p>`);
  /* starters keep their Bench button on the list too (old path) — in their tablet's foot already */
  /* the contract tabula */
  const c=g.contract||{};const ask=typeof askWage==='function'?askWage(g):c.wage;const Cl=rm100Adv('clerk',30);
  const lend=(act[g.id]||[]).find(b=>b.matches('select[data-m47lend]'));
  const tab=document.createElement('section');tab.className='rm100tab rm100con';
  tab.innerHTML=`<span class="rm100fr rm100tstrip">${rm100Scn('team','50% 65%')}<span class="rm100tt">${_T`Tabula · the contract`}</span></span><div class="rm100wax">
    ${Cl?`<div class="rm100clerk"><span class="rm100rd">${Cl.f}</span><span class="rm100one"><b>${esc(Cl.a.name)}</b>, ${esc(Cl.a.role)}: “${c.weeks<=3?_T`The contract ends in ${Math.max(0,c.weeks)} weeks. Renew it before a rival asks.`:ask>c.wage?_T`He is worth ${ask} a week now; he takes ${c.wage}.`:_T`A fair wage. Nothing to do yet.`}”</span></div>`:''}
    <div class="rm100tr"><span>${_T`Wage`}</span><span class="rm100one">${_T`${c.wage||0} a week`}${g.ptrain?' · '+_T`+ trainer`:''}</span><span>${c.wage||0}</span></div>
    <div class="rm100tr"><span>${_T`Weeks left`}</span><span class="rm100one">${_T`about ${Math.max(0,c.weeks||0)*(c.wage||0)} still owed`}</span><span>${Math.max(0,c.weeks||0)}</span></div>
    <div class="rm100cl"></div>
    <div class="rm100tr${ask>(c.wage||0)?' no':''}"><span>${_T`Renewal`}</span><span class="rm100one">${_T`asks about ${ask} a week`}</span><span>~${ask}</span></div>
    <div class="rm100tb"></div></div>`;
  if(cl){const box=tab.querySelector('.rm100cl');cl.classList.add('rm100cls');box.appendChild(cl)}
  const tb=tab.querySelector('.rm100tb');
  if(ext){ext.classList.add('rm100tbtn');tb.appendChild(ext)}
  if(lend){const lw=document.createElement('label');lw.className='rm100tbtn rm100lend';lw.innerHTML=`<span>⇢ ${_T`Lend`}</span>`;lw.appendChild(lend);tb.appendChild(lw)}
  else tb.insertAdjacentHTML('beforeend',`<button type="button" class="btn rm100tbtn" disabled title="${esc(slotN?_T('Bench him first to lend him out.'):g.inj?_T('Hurt — nobody borrows him.'):_T('No house will borrow right now.'))}">⇢ ${_T`Lend`}</button>`);
  if(rel){rel.classList.add('rm100tbtn','red');tb.appendChild(rel)}
  /* keeping him + the rest of the card */
  const kp=document.createElement('section');kp.className='rm100p rm100keep';kp.innerHTML=`<div class="rm100ph">${_T`Keeping him · coin and favours`}</div>`;if(keep)kp.appendChild(keep);
  const more=document.createElement('details');more.className='rm100more';more.innerHTML=`<summary>${_T`More: purse, rival interest, how he grades you, chronicle`}</summary>`;
  if(card){card.classList.add('rm100rest');more.appendChild(card)}for(const x of extra)more.appendChild(x);
  /* assemble */
  const room=document.createElement('div');room.className='rm100 rm100-roster st95list';
  room.innerHTML=`<aside class="rm100list"></aside><div class="rm100dos"><div class="rm100g3 rm100r1"></div><div class="rm100g2"></div></div>`;
  room.querySelector('.rm100list').innerHTML=rm100RosterList(w,pm,ros,g.id);
  const dos=room.querySelector('.rm100dos');dos.insertBefore(stt,dos.firstChild);
  const g3=room.querySelector('.rm100r1');g3.innerHTML=pblk+ratP+pers;
  if(sub)g3.querySelector('.rm100sub').appendChild(sub);else g3.querySelector('.rm100sub').remove();if(streak){streak.classList.add('rm100pl');g3.querySelector('.rm100pi').insertBefore(streak,g3.querySelector('.rm100chips'))}
  const rg=g3.querySelector('.rm100rg');if(rat)rg.appendChild(rat);
  const g2=room.querySelector('.rm100g2');g2.appendChild(bench);g2.appendChild(tab);
  dos.appendChild(kp);dos.appendChild(more);
  /* replace the old block (its h4 header too) */
  const h4=wrap.previousElementSibling&&wrap.previousElementSibling.matches('h4.secth')?wrap.previousElementSibling:null;if(h4)h4.remove();
  wrap.replaceWith(room);
  const sl=ros.filter(x=>x.slot95).length;rm100Banner(R,'roster',`<div class="ptbox on">${ros.length}</div><span>${_T`fighters · ${sl} starters`}</span>`);
  return true}
/* the Armory chip opens the Armory tab on him */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rm100ar]');if(b)MGR.ar94=b.dataset.rm100ar},true);
/* rows are role=button divs: Enter / Space click them */
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target;if(!t||!t.closest||!t.closest('.rm100')||t.matches('button,select,input,summary,a'))return;if(t.getAttribute('role')==='button'){e.preventDefault();t.click()}});

/* ============================== TRAINING YARD ============================== */
const RM100_DRILL={foot:['school','50% 75%','venatore'],iron:['armory','30% 60%','soldier'],show:['promote','55% 40%','royalty'],blood:['school','80% 80%','hero','slave'],vet:['team','40% 30%','veteranus'],parade:['promote','20% 40%','amazonia']};
function rm100YardSum(g,w){const P=thPlan(w);const y=y92Peek(P,g.id);const lk=y92Lock(g);const L=y92Sum(y.L),Q=y92Sum(y.Q);
  const ks=o=>Object.entries(o||{}).filter(([,n])=>n>0).map(([k,n])=>`${y92Ic(k)}×${n}`).join(' ');
  const pre=y.pre?y92Pre(y.pre.k):null;
  if(lk)return {cls:'',t:`${lk[0]} ${lk[1]}`,h:'—',dots:'—',lock:''};
  const parts=[];if(L)parts.push('🔒 '+ks(y.L));if(Q)parts.push(ks(y.Q)+' · '+_T('not locked'));if(pre)parts.push(`${pre.ic} ${pre.n}${y.pre.lock?'':' ·?'}`);
  const f=gFat(g);if(!parts.length)parts.push(f>60?_T`worn ${f} · rest`:_T`no sessions`);
  return {cls:Q||(pre&&!y.pre.lock)?'no':L?'ok':'',t:parts.join(' · '),h:L+Q+(pre?Y92.PRE_H:0),dots:'●'.repeat(Math.min(Y92.CAP,L+Q))+'○'.repeat(Math.max(0,Y92.CAP-L-Q)),lock:Q||(pre&&!y.pre.lock)?_T`plan`:L?'🔒':''}}
function rm100Yard(R,w,pm){const pane=R.querySelector('#mgrPane');if(!pane)return false;const grid=pane.querySelector('.y92grid');const doc=pane.querySelector('.y92doc');const tri=pane.querySelector('.y92trials');if(!grid||!doc)return false;
  const ros=rosterOf(pm);let g=gById(MGR.tr92);if(!g||!ros.includes(g))g=ros[0];if(!g)return false;
  const card=grid.querySelector(`.y92c[data-y92c="${g.id}"]`);if(!card)return false;
  const P=thPlan(w);const y=y92Peek(P,g.id);const lv=y92DocLv(w,pm);const left=thLeft(w);const mx=thMax();const lk=y92Lock(g);
  /* the list */
  const list=`<div class="rm100lhd"><span>${_T`The squad`} · ${ros.length}</span></div><div class="rm100rows"><div class="rm100lh yd"><span></span><span>${_T`Name`}</span><span>${_T`Sessions`}</span><span>${_T`Lock`}</span><span>●</span></div>${ros.map(x=>{const s=rm100YardSum(x,w);
    return `<button type="button" class="rm100lr yd${x===g?' on':''}" data-y99sel="${x.id}"><span class="rm100av">${rm100Face(x)}</span><b class="rm100one">${esc(x.name)}</b><span class="rm100dots">${s.dots}</span><span class="rm100iv">${s.lock||(y92Lock(x)?y92Lock(x)[0]:'')}</span><span class="rm100iv">${rm100Fd(x)} ${gFat(x)}</span></button>`}).join('')}</div>`;
  /* the dossier card: portrait + his .y92c */
  const ydos=document.createElement('section');ydos.className='rm100p rm100yc';ydos.innerHTML=`<div class="rm100ph">${esc(g.name)} · ${_T`sessions ${y92Sum(y.L)+y92Sum(y.Q)} / ${Y92.CAP}`} · ${_T`fatigue ${gFat(g)}`}</div><div class="rm100ycg"><span class="rm100fr rm100por">${gArt(g,'md')}</span><div class="rm100ycc y92grid"></div></div>`;
  ydos.querySelector('.rm100ycc').appendChild(card);
  const pre=card.querySelector('.y92pre');
  if(pre){for(const b of [...pre.querySelectorAll('button[data-y92pre]')])if(b.classList.contains('y92pb'))b.remove();
    if(!y.pre&&!lk&&y92Sum(y.L)>=1){pre.classList.add('rm100prel');pre.innerHTML=`<span>${_T`Doctore's drill`}</span><span class="rc-sub">${_T`pick one of the plates below`}</span>`}}
  const care=card.querySelector(`[data-y92care="${g.id}"]`);
  /* the Doctore: bronze head; the drills row leaves for the plates; Same / Lock all go to the plan */
  doc.classList.add('rm100p','rm100doc');const acts=doc.querySelector('.y92acts');const same=doc.querySelector('[data-y92same]');const all=doc.querySelector('[data-y92all]');
  const drow=doc.querySelector('.y92pcs');if(drow){const r0=drow.closest('.y92dr');if(r0)r0.classList.add('rm100hide')}
  /* the week's plan */
  const D=rm100Adv('doctore',30);const plan=document.createElement('section');plan.className='rm100tab rm100plan';
  plan.innerHTML=`<span class="rm100fr rm100tstrip">${rm100Scn('school','50% 65%')}<span class="rm100tt">${_T`Tabula · the week's plan`}</span></span><div class="rm100wax">
    ${D?`<div class="rm100clerk"><span class="rm100rd">${D.f}</span><span class="rm100one"><b>${esc(D.a.name)}</b>, ${esc(D.a.role)}: “${_T`Lock it in or it never happens.`}”</span></div>`:''}
    ${ros.map(x=>{const s=rm100YardSum(x,w);return `<div class="rm100tr ${s.cls}${x===g?' hi':''}"><span>${esc(rm100First(x))}</span><span class="rm100one">${s.t}</span><span>${s.h===0?'—':s.h==='—'?'—':s.h+' h'}</span></div>`}).join('')}
    <div class="rm100tsub">${_T`House hours`}</div>
    <div class="rm100tr"><span>${_T`Used`}</span><span class="rm100one">${_T`${mx-left} of ${mx} · Doctore ${P.doc||0} h`}</span><span>${left}</span></div>
    <div class="rm100tb y3"></div></div>`;
  const tb=plan.querySelector('.rm100tb');if(same){same.classList.add('rm100tbtn');tb.appendChild(same)}if(care){care.classList.add('rm100tbtn');tb.appendChild(care)}if(all){all.classList.add('rm100tbtn','lock');tb.appendChild(all)}
  if(acts&&!acts.children.length)acts.remove();
  /* the drill plates */
  const drills=document.createElement('div');drills.className='rm100drills';
  drills.innerHTML=`<div class="rm100meta"><span>⚒ ${_T`The Doctore's drills · one a fighter a week · ${Y92.PRE_H} house hours · two ratings at once`}</span><span>${_T`more unlock with his level`}</span></div><div class="rm100plates d6">${Y92_PRE.map(p=>{
    const A=RM100_DRILL[p.k]||['school','50% 50%','soldier'];const fig=A[3]?rm100Mini(A[2],'height:58%;left:22%;bottom:4%')+rm100Mini(A[3],'height:58%;left:52%;bottom:4%;transform:scaleX(-1)'):rm100Mini(A[2],'height:62%;left:38%;bottom:4%');
    const mine=y.pre&&y.pre.k===p.k;const lvl=p.lv>lv;let why='';
    if(lk)why=lk[1];else if(lvl)why=_T`Needs a level ${p.lv} Doctore`;else if(y.pre&&!mine)why=_T`One drill a week — ${y92Pre(y.pre.k).n} is set`;else if(mine&&y.pre.lock)why=_T`Locked in this week`;
    else if(!mine&&y92Sum(y.L)<1)why=_T`Lock in a session first`;else if(!mine&&left<Y92.PRE_H)why=_T`Needs ${Y92.PRE_H} hours`;
    const val=mine&&!y.pre.lock?`${g.id}|`:`${g.id}|${p.k}`;
    return `<button type="button" class="rm100plt${mine?' on':''}${lvl?' lk':''}" ${why?`data-rm100pre="${p.k}" disabled title="${esc(why)}"`:`data-y92pre="${val}" title="${esc(mine?_T('Take this drill back'):_T`${p.n}: ${y92Nm(p.a)} + ${y92Nm(p.b)} for ${g.name}`)}"`}>${rm100Art(rm100Scn(A[0],A[1])+fig)}${mine?`<span class="rm100bdg">✓ ${esc(rm100First(g))}</span>`:lvl?`<span class="rm100lkb">🔒 ${_T`Lv ${p.lv}`}</span>`:''}<b class="rm100one">${p.ic} ${p.n}</b><span class="rm100l">${y92Nm(p.a)} + ${y92Nm(p.b)}</span><span class="rm100c"><span>${Y92.PRE_H} h · +${Math.round(y92Bonus(lv)*100)}%</span><span>${_T`Lv ${p.lv}`}</span></span></button>`}).join('')}</div>`; // i18n:skip
  /* the trials strip */
  if(tri){tri.classList.add('rm100tri');tri.insertAdjacentHTML('afterbegin',`<span class="rm100rib">⚔ ${_T`Trials of the Yard · one a week`}</span>`);
    const TA={spar:rm100Scn('school','50% 70%')+rm100Mini(rm100MiniK(g),'height:66%;left:24%;bottom:5%')+rm100Mini('soldier','height:68%;left:52%;bottom:5%;transform:scaleX(-1)'),
      exh:rm100Scn('promote','50% 60%')+rm100Mini('royalty','height:60%;left:42%;bottom:6%'),
      pen:rm100Scn('school','70% 80%')+rm100Mini('leo','height:52%;left:18%;bottom:6%')+rm100Mini(rm100MiniK(g),'height:62%;left:56%;bottom:5%;transform:scaleX(-1)')+'<span class="rm100cage"></span>'};
    for(const t of tri.querySelectorAll('.y92t[data-y99t]')){const a=t.querySelector('.y92ta');if(a&&TA[t.dataset.y99t])a.innerHTML=rm100Art(TA[t.dataset.y99t])}}
  /* assemble */
  const room=document.createElement('div');room.className='rm100 rm100-yard';
  room.innerHTML=`<aside class="rm100list">${list}</aside><div class="rm100dos"><div class="rm100g3 rm100y1"></div></div>`;
  const g3=room.querySelector('.rm100y1');g3.appendChild(ydos);g3.appendChild(doc);g3.appendChild(plan);
  const dos=room.querySelector('.rm100dos');dos.appendChild(drills);if(tri)dos.appendChild(tri);
  const hold=document.createElement('div');hold.className='rm100hold';hold.hidden=true;for(const c of [...grid.children])hold.appendChild(c);
  /* what else the page held (the away note, last week's log, the trials' wrapper) stays, in order, after the room */
  const y99=pane.querySelector('.y99wrap');const before=y99||grid;before.before(room);if(y99)y99.remove();else grid.remove();
  dos.appendChild(hold);
  rm100Banner(R,'practice',null);
  return true}

/* ============================== INFIRMARY ============================== */
/* the marble statue: 183's avatar svg → marble image, a soft wound spot, a lost limb masked off + a pale ghost */
function rm100Statue(sv,g){try{if(!sv||!/<svg/.test(sv))return sv;const id='rm'+(g.id||'x').replace(/[^a-z0-9]/gi,'').slice(-8);
  const sev=(g.severed||[]).filter(l=>typeof SEV92!=='undefined'&&SEV92[l]);
  let defs=`<radialGradient id="${id}wg" cx=".5" cy=".42" r=".42"><stop offset="0" stop-color="#ff4a32" stop-opacity=".85"/><stop offset=".5" stop-color="#ff4a32" stop-opacity=".32"/><stop offset="1" stop-color="#ff4a32" stop-opacity="0"/></radialGradient>`;
  if(sev.length)defs+=`<mask id="${id}mk" maskUnits="userSpaceOnUse" x="-200" y="-200" width="800" height="900"><rect x="-200" y="-200" width="800" height="900" fill="#fff"/>${sev.map(l=>`<path d="${SEV92[l].d}" fill="#000" stroke="#000" stroke-width="2"/>`).join('')}</mask>`;
  sv=sv.replace(/(<svg[^>]*>)/,`$1<defs>${defs}</defs>`);
  if(sev.length)sv=sv.replace(/<image\b/,`<image mask="url(#${id}mk)"`);
  sv=sv.replace(/class="injmark"/,`class="injmark rm100spot"`).replace(/(<path d="[^"]*") fill="#ff4a3a" fill-opacity="\.45" stroke="#ff6a55" stroke-width="2\.5"( class="injmark)/,`$1 fill="url(#${id}wg)" stroke="none"$2`); // i18n:skip
  /* 211's severed fill (dark) → a pale ghost; its cut lines violet */
  sv=sv.replace(/fill="#120a07" fill-opacity="\.72" stroke="#e0503e"/g,'fill="#efe9de" fill-opacity=".16" stroke="#f1e3c4" class="rm100ghost"').replace(/stroke="#ff6a55" stroke-width="1\.3" stroke-dasharray="3 2"/g,'stroke="#d8a8f0" stroke-width="1.3" stroke-dasharray="3 2"');
  return sv}catch(e){console.error(e);return sv}}
function rm100Locs(g){const H=hp90(g);const sev=g.severed||[];const grp=[['head',['head']],['chest',['chest']],['arms',['rarm','larm']],['legs',['rleg','lleg']]];
  const N={head:_T('Head'),chest:_T('Chest'),arms:_T('Arms'),legs:_T('Legs')};const out=[];
  for(const [k,ls] of grp){const wd=ls.includes(H.wl);const lost=ls.filter(l=>sev.includes(l));
    for(const l of lost)out.push(`<div class="rm100w1 cut"><b class="rm100one">${_T`${esc(LOCN[l])} · lost`}</b><small class="rm100one">${_T`Hygeia ${HYGEIA} · needs a bed`}</small></div>`);
    if(wd)out.push(`<div class="rm100w1 wd">${_T`<b class="rm100one">${esc(LOCN[H.wl])} · ${H.loc[H.wl].base} HP → ${H.loc[H.wl].cur}</b><small class="rm100one">${esc(g.inj.label)}</small>`}</div>`);
    const fine=ls.filter(l=>!lost.includes(l)&&l!==H.wl);if(fine.length&&!(wd||lost.length)||fine.length&&ls.length===1&&!wd)out.push(`<div class="rm100w1 ok"><b class="rm100one">${N[k]} · ${fine.map(l=>H.loc[l].cur).join(' · ')}</b><small>${_T`fine`}</small></div>`);
    else if(fine.length&&(wd||lost.length))out.push(`<div class="rm100w1 ok"><b class="rm100one">${fine.map(l=>`${esc(LOCN[l])} ${H.loc[l].cur}`).join(' · ')}</b><small>${_T`fine`}</small></div>`)}
  return out.join('')}
function rm100Ward(R,w,pm){const pane=R.querySelector('#mgrPane');const iv=pane&&pane.querySelector('.iv90');if(!iv)return false;
  const list=iv.querySelector('.iv90list');const mid=iv.querySelector('.iv90mid');const care=iv.querySelector('.iv90care');
  const ros=rosterOf(pm);const g=gById(MGR.inf90)&&ros.some(x=>x.id===MGR.inf90)?gById(MGR.inf90):null;const sel=g||(()=>{const r=list&&list.querySelector('.iv90row.on');return r?gById(r.dataset.inf90):null})();
  const room=document.createElement('div');room.className='rm100 rm100-ward iv90';room.innerHTML=`<aside class="rm100list"></aside><div class="rm100dos"></div>`;
  const L=room.querySelector('.rm100list');const nNeed=list?list.querySelectorAll(':scope>.iv90row').length:0;
  L.insertAdjacentHTML('beforeend',`<div class="rm100lhd"><span>${_T`Hurt and tired`} · ${nNeed}</span></div><div class="rm100lh wd"><span></span><span>${_T`Name`}</span><span>${_T`HP · tired`}</span><span>${_T`Status`}</span></div>`);
  if(list){list.classList.add('rm100rows');L.appendChild(list)}
  const dos=room.querySelector('.rm100dos');
  if(sel&&mid&&care){const f=gFat(sel);const hp=mid.querySelector('.iv90hp');const ft=mid.querySelector('.iv90ft');const av=mid.querySelector('.iv90av');const nd=mid.querySelector('.iv90nd');
    if(av)av.innerHTML=rm100Statue(av.innerHTML,sel);
    const who=care.querySelector('.iv90who');const maim=who&&who.querySelector('.maim87');if(who)who.remove();
    const st=status90(sel);const bedN=bedsClean76(w).indexOf(sel.id);const sub=who?'':'';
    /* the patient */
    const pat=document.createElement('section');pat.className='rm100p rm100pat';
    pat.innerHTML=`<div class="rm100ph">${esc(sel.name)} · ${st[1]}${bedN>=0?' · '+_T`bed ${bedN+1} of ${bedsOf76(pm)}`:''}</div><div class="rm100pblk"><span class="rm100fr rm100por">${gArt(sel,'md')}</span><div class="rm100pi">
      <div class="rm100pn">${esc(sel.name)}</div><div class="rm100pl">${esc(CLASSES[sel.cls]?CLASSES[sel.cls].name:'')} · ${_T`rating ${effOvr(sel)}`}</div><div class="rm100bars"></div>
      <div class="rm100pl">${_T`Morale ${sel.morale||0}`} · ${resting90(sel)?_T('resting this week'):_T('not resting')}</div></div></div><div class="rm100wl"></div>`;
    const bars=pat.querySelector('.rm100bars');if(hp)bars.appendChild(hp);if(ft)bars.appendChild(ft);
    const wl=pat.querySelector('.rm100wl');const i=sel.inj;
    if(i&&!i.war)wl.insertAdjacentHTML('beforeend',`<div class="rm100w1 wd"><b class="rm100one">⚕ ${esc(i.label)}${serious76(sel)?' · '+_T('serious'):''}</b><small class="rm100one">${_T`needs ${injReq(i)==='rest'?_T('rest'):injReq(i)==='medicus'?_T('the Medicus'):_T('the surgeon')}`}${serious76(sel)&&!inBed76(sel)?' · '+_T('half pace on the bench'):''}</small></div>`);
    if(i&&i.war)wl.insertAdjacentHTML('beforeend',`<div class="rm100w1"><b class="rm100one">⚔ ${_T`Away at war`}</b><small class="rm100one">${esc(i.label)}</small></div>`);
    for(const l of sel.severed||[])wl.insertAdjacentHTML('beforeend',`<div class="rm100w1 cut"><b class="rm100one">✂ ${_T`${esc(LOCN[l])} lost`}</b><small class="rm100one">${_T`only Hygeia regrows it`}</small></div>`);
    if(maim){const d=document.createElement('div');d.className='rm100w1 cut';d.innerHTML=`<b class="rm100one">🦿 ${esc(maim.textContent.trim().slice(0,90))}</b>`;wl.appendChild(d)}
    if(f>60)wl.insertAdjacentHTML('beforeend',`<div class="rm100w1 ft"><b>😮‍💨 ${_T`Worn ${f}`}</b><small>${_T`needs rest: −1 movement in every bout`}</small></div>`);
    /* the statue: reuse .iv90mid (the bars moved out but stay inside it: the mid wraps the patient too) */
    const sta=document.createElement('section');sta.className='rm100p rm100sta';sta.innerHTML=`<div class="rm100ph">${_T`His body · marble`}</div><div class="rm100stg"><div class="rm100niche"></div><div class="rm100locs"><div class="rm100pl">${_T`Glows: <b class="rm100wd">wound</b> · broken off: <b class="rm100sv">lost</b>`}</div>${rm100Locs(sel)}</div></div>`;
    if(av)sta.querySelector('.rm100niche').appendChild(av);if(nd)sta.querySelector('.rm100locs').appendChild(nd);
    /* the road back (from the tiles' own fit weeks) */
    const M=rm100Adv('medicus',30);const rows=[];
    for(const t of care.querySelectorAll('.plantile')){const n=t.querySelector('b');const pf=t.querySelector('.pf');const pc=t.querySelector('.pc');const pd=t.querySelector('.pd90');
      const fit=pf?pf.textContent.replace(/^\s*fit\s*/i,'').trim():'';rows.push(`<div class="rm100tr${t.classList.contains('off')||t.disabled?' dim':''}${t.classList.contains('on')||t.classList.contains('cur')?' hi ok':''}"><span>${esc(n?n.textContent:'')}</span><span class="rm100one">${esc((pd?pd.textContent:'').slice(0,60))}${pc&&pc.textContent.trim()&&!/free/i.test(pc.textContent)?' · '+esc(pc.textContent.trim()):''}</span><span>${esc(fit)}</span></div>`)} // i18n:skip
    const sev=sel.severed||[];
    const tab=document.createElement('section');tab.className='rm100tab rm100road';
    tab.innerHTML=`<span class="rm100fr rm100tstrip">${rm100Scn('council','50% 70%')}<span class="rm100tt">${_T`Tabula · the road back`}</span></span><div class="rm100wax">
      ${M?`<div class="rm100clerk"><span class="rm100rd">${M.f}</span><span class="rm100one"><b>${esc(M.a.name)}</b>, ${esc(M.a.role)}: “${sev.length?_T`The limb first. Hygeia will not wait.`:i&&!i.war?_T`Rest him right and he will be back.`:f>60?_T`He is worn to the bone. A week off.`:_T`Nothing for me here.`}”</span></div>`:''}
      ${i&&!i.war?`<div class="rm100tsub">${_T`Fit for the sand by`}</div>${rows.join('')||`<div class="rm100tr"><span>${_T`Rest`}</span><span class="rm100one"></span><span>${esc(wkName(fitWeekOf(sel)))}</span></div>`}`:''}
      ${sev.length?`<div class="rm100tsub">${_T`The limb`}</div><div class="rm100tr ok"><span>${_T`Hygeia`}</span><span class="rm100one">${_T`regrows · ${HYGEIA} a limb · needs a bed`}</span><span>✓</span></div><div class="rm100tr no"><span>${_T`Miss it`}</span><span class="rm100one">${_T`a third lost limb ends a career`}</span><span>✗</span></div>`:''}
      <div class="rm100tsub">${_T`Fatigue`}</div><div class="rm100tr"><span>${_T`Rest week`}</span><span class="rm100one">${_T`−${FAT_REST} · no bout`}</span><span>${f}→${Math.max(0,f-FAT_REST)}</span></div>
      <div class="rm100tr"><span>${_T`Rubdown`}</span><span class="rm100one">${_T`1 training hour`}</span><span>${f}→${Math.max(0,f-10)}</span></div></div>`;
    /* the care plates: every section's buttons in one row (the sections become display:contents) */
    care.classList.add('rm100care');const notes=document.createElement('div');notes.className='rm100notes';
    const ART=b=>{const d=b.dataset;const mg=d.mg||'';const MF=M?`<span class="rm100rd rm100pface">${M.f}</span>`:'';
      if(d.bed76||d.unbed76||d.bedneed76)return rm100Scn('team','50% 70%')+rm100Mini(rm100MiniK(sel),'height:34%;left:40%;bottom:14%;transform:rotate(-80deg)');
      if(mg==='medic')return rm100Scn('council','50% 80%')+MF;if(mg==='surgeon')return rm100Scn('armory','60% 70%')+MF;
      if(mg==='asclepius'||mg==='heal')return rm100Scn('council','80% 40%')+'<span class="rm100glow"></span>';if(mg==='build')return rm100Scn('school','70% 40%');
      if(mg==='bath'||d.bath!=null)return rm100Scn('promote','50% 10%')+'<span class="rm100steam"></span>';if(d.rest!=null)return rm100Scn('team','30% 75%');if(d.care90!=null)return rm100Scn('school','30% 75%');
      return rm100Scn('team','70% 80%')};
    for(const s of [...care.querySelectorAll('.iv90s')]){const h=s.querySelector('.iv90h');if(h)h.classList.add('rm100hide');
      for(const n of [...s.querySelectorAll('.rule87,.iv90rate,.wd76w,.rtimeline,.yd76res')])notes.appendChild(n)}
    for(const n of [...care.querySelectorAll(':scope>.yd76res')])notes.appendChild(n);if(maim)notes.insertBefore(maim,notes.firstChild);
    for(const b of care.querySelectorAll('button')){b.classList.add('rm100plt');if(!b.querySelector('.rm100fr'))b.insertAdjacentHTML('afterbegin',rm100Art(ART(b)))}
    const cm=document.createElement('div');cm.className='rm100meta';cm.innerHTML=`<span>⚕ ${_T`Care · what heals him, cost, time, what it fixes`}</span>`;
    const top=room.querySelector('.rm100dos');const g3=document.createElement('div');g3.className='rm100g3 rm100w3 iv90mid';g3.appendChild(pat);g3.appendChild(sta);g3.appendChild(tab);
    top.appendChild(g3);top.appendChild(cm);top.appendChild(care);if(notes.children.length)care.appendChild(notes)}
  else{for(const x of [mid,care])if(x)dos.appendChild(x)}
  iv.replaceWith(room);
  const beds=bedsOf76(pm),used=bedsClean76(w).length;rm100Banner(R,'infirm',null);
  const hd=R.querySelector('.roomhd.rm100ban');if(hd){const st=hd.querySelector('.roomstat');if(st){st.classList.add('rm100cnt');st.innerHTML=`<div class="ptbox on">${beds}</div><span>${_T`beds · ${Math.max(0,beds-used)} free`}</span>`}
    else hd.insertAdjacentHTML('beforeend',`<div class="roomstat rm100cnt"><div class="ptbox on">${beds}</div><span>${_T`beds · ${Math.max(0,beds-used)} free`}</span></div>`)}
  return true}

/* ---------- the final mgrHTML wrapper ---------- */
{const base=mgrHTML;mgrHTML=function(){let pre=null;try{const w=W_();if(rm100On()&&w&&!w.dead&&!MGR.view){
      if(MGR.tab==='roster'&&typeof ST95!=='undefined'){pre=ST95.tab;ST95.tab='chart'}
      /* the lesson shows fighter B in the yard (its steps light his card) */
      if(MGR.tab==='practice'&&w.tutorial&&typeof MTUT!=='undefined'&&MTUT.B&&gById(MTUT.B))MGR.tr92=MTUT.B}}catch(e){}
  let h=base.apply(this,arguments);if(pre!=null)ST95.tab=pre;
  try{const w=W_();const on=rm100On()&&!!w&&!w.dead&&!MGR.view&&!!RM100.tabs[MGR.tab];if(document.body)document.body.classList.toggle('rm100on',on);
    if(!on||typeof h!=='string')return h;const pm=me();if(!pm)return h;
    const t=rm100Tpl(h);const R=t.content;let ok=false;
    if(MGR.tab==='roster')ok=rm100Roster(R,w,pm);else if(MGR.tab==='practice')ok=rm100Yard(R,w,pm);else if(MGR.tab==='infirm')ok=rm100Ward(R,w,pm);
    return ok?t.innerHTML:h}catch(e){console.error(e)}return h}}

/* ---------- the lesson's spots follow the new rooms ---------- */
try{if(typeof MTUT_STEPS!=='undefined'){const S=k=>MTUT_STEPS.find(x=>x.k===k);
  const ls=S('lsel');if(ls){const o=ls.spot;ls.spot=()=>document.querySelector(`#mgrPane .rm100list [data-mg="lsel"][data-id="${MTUT.B}"]`)||mtEl(o)}
  const yd=S('ydrill');if(yd){const o=yd.spot;yd.spot=()=>document.querySelector('#mgrPane .rm100drills')||mtEl(o)}}}catch(e){console.error(e)}

/* ---------- the look ---------- */
{const st=document.createElement('style');st.id='rm100css';st.textContent=`
body.rm100on .rm100ban{position:relative;min-height:74px;height:auto;display:flex;align-items:center;gap:12px;padding:8px 14px 8px 12px;overflow:hidden;border:1px solid #6b5236;border-radius:8px;box-shadow:inset 0 0 0 2px #e2c88e33,inset 0 0 0 3px #8a2a1a66,0 3px 10px #0008;margin-bottom:8px}
body.rm100on .rm100ban .rm100bimg{position:absolute;inset:0;z-index:0}
body.rm100on .rm100ban .rm100bimg img,body.rm100on .rm100ban img.lu2ban{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 60%}
body.rm100on .rm100ban::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,#140c07d0 0,#140c0790 34%,#140c0700 60%,#140c0780 100%)}
body.rm100on .rm100ban>svg{position:absolute;inset:0;width:100%;height:100%;z-index:0}
body.rm100on .rm100ban>*:not(.rm100bimg):not(img):not(svg){position:relative;z-index:2}
body.rm100on .rm100ban .rm100adv{flex:none;width:54px;height:54px}
body.rm100on .rm100ban .roomttl{position:relative;inset:auto;flex:1;min-width:0;padding:0;background:none}
body.rm100on .rm100ban .roomttl b{font:400 23px var(--display);letter-spacing:.05em;color:#fff3d6;text-shadow:0 2px 4px #000,0 0 12px #000}
body.rm100on .rm100ban .roomttl span{display:block;font-size:13px;color:#f3e3bd;text-shadow:0 1px 3px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body.rm100on .rm100ban .roomstat.rm100cnt{position:relative;inset:auto;flex:none;display:grid;justify-items:end;gap:0;background:#1a120de0;border:1px solid #c9a458;border-radius:6px;padding:4px 12px;margin-left:auto;text-align:right;min-width:92px;transform:none;top:auto;right:auto;box-shadow:none}
body.rm100on .rm100ban .roomstat.rm100cnt .ptbox,body.rm100on .rm100ban .roomstat.rm100cnt .ptbox.on{all:unset;font:400 21px var(--display);color:#b9e39a!important;line-height:1.1;background:none!important;box-shadow:none!important;min-width:0;height:auto;padding:0}
body.rm100on .rm100ban .rm100cnt span{font:11px var(--mono);color:#cbb593;white-space:nowrap}
body.rm100on .rm100ban .rm100cnt .hpips{display:none}
body.rm100on .rm100ban .hyg87{position:relative;inset:auto;flex:none;margin:0}
body.rm100on .rm100ban .iv90why{position:relative;z-index:2}
.rm100rd{display:inline-grid;place-items:center;overflow:hidden;border-radius:50%;background:radial-gradient(circle at 50% 35%,#f4ead6,#c9b48a);box-shadow:0 0 0 2px #e2c88e,0 0 0 3.5px #8a2a1a,0 3px 8px #000a;flex:none}
.rm100rd>svg,.rm100rd>.portrait{width:100%!important;height:100%!important;display:block}.rm100rd .portrait svg,.rm100rd svg{width:100%;height:100%;display:block}
.rm100rd.empty{background:#2a1f17;box-shadow:0 0 0 1px #6b5236}
/* layout */
.rm100{display:grid;grid-template-columns:minmax(220px,286px) minmax(0,1fr);gap:9px;align-items:start;margin:0 0 10px}
.rm100dos{container:rm100d/inline-size;display:flex;flex-direction:column;gap:8px;min-width:0}
.rm100.st95list{overflow:visible}
.rm100g3{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(0,1fr);gap:8px;min-width:0}
.rm100g2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;min-width:0}
.rm100p{position:relative;border:1px solid #5a4430;border-radius:8px;background:linear-gradient(#251b13,#1c140e);padding:8px 10px;min-width:0}
.rm100ph,.rm100lhd,.rm100tsub,.rm100k{font:500 10px var(--mono);letter-spacing:.14em;color:#b39d80;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm100ph{margin-bottom:5px}.rm100lhd{height:20px;display:flex;align-items:center}
.rm100one{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.rm100 .rm100rest table.tally,.rm100 .rm100dos table.tally{display:block;max-width:100%;overflow-x:auto}
.rm100mut{color:var(--muted);font-size:12px}
.rm100hide,.rm100 .rm100hide{display:none!important}
/* the list */
.rm100list{display:flex;flex-direction:column;gap:5px;min-width:0;position:sticky;top:0}
.rm100rows,.rm100list .iv90list.rm100rows{border:1px solid #4a3826;border-radius:7px;background:#1f1711;overflow:hidden;display:flex;flex-direction:column}
.rm100lh,.rm100lr{display:grid;gap:6px;align-items:center;padding:0 8px;min-width:0}
.rm100lh{height:22px;white-space:nowrap;overflow:hidden;font:500 9.5px var(--mono);letter-spacing:.1em;color:var(--dim);text-transform:uppercase;border-bottom:1px solid #4a3826}
.rm100lh>span:nth-child(n+4){text-align:right}
.rm100lh.ros,.rm100lr.ros{grid-template-columns:20px 24px minmax(0,1fr) 22px 32px 9px 16px 16px;gap:5px}
.rm100lh.yd,.rm100lr.yd{grid-template-columns:26px minmax(0,1fr) 44px 34px 40px}
.rm100lh.wd{grid-template-columns:26px minmax(0,1fr) 62px 62px}
.rm100lr{min-height:36px;font-size:13.5px;border:0;border-top:1px solid #ffffff0a;background:none;color:var(--bone);text-align:left;cursor:pointer;width:100%;font-family:inherit}
.rm100lr:hover{background:#ffffff08}.rm100lr.on{background:linear-gradient(90deg,#3a2a18,#2a1f17);box-shadow:inset 3px 0 0 var(--gold)}
.rm100lr.lent{cursor:default;opacity:.8}
.rm100lr b{font-weight:700}
.rm100av{width:26px;height:26px;border-radius:50%;overflow:hidden;display:block;border:1px solid #6b5236;background:#2a1f17;flex:none}
.rm100av>svg,.rm100av>.portrait{width:100%!important;height:100%!important;display:block}.rm100av svg{width:100%;height:100%;display:block}
.rm100num{font:400 15px var(--display);color:var(--gold2);text-align:right}
.rm100iv{font:11.5px var(--mono);color:var(--dim);text-align:right;white-space:nowrap}
.rm100dots{font:12px var(--mono);color:var(--gold2);text-align:right;letter-spacing:1px}
.rm100wm{color:#ff8a7a;font-size:11px;text-align:right;white-space:nowrap;letter-spacing:-1px}
.rm100fd{display:inline-block;width:9px;height:9px;border-radius:50%;vertical-align:0;background:#7fae5f}.rm100fd.tired{background:#d6a23c}.rm100fd.worn{background:#a35ac8}
.rm100slot{display:inline-grid;place-items:center;width:22px;height:19px;border-radius:3px;font:400 12px var(--display);border:1px solid #6b5236;color:var(--muted)}
.rm100slot.s{border-color:var(--gold);color:var(--gold2);background:#3a2a18}.rm100slot.l{border-color:#4f7fc4;color:#a8c4ef}
/* the infirmary list = 183's rows, one line each */
.rm100-ward .iv90list{gap:0;padding:0}
.rm100-ward .iv90list .iv90beds{display:flex;flex-wrap:wrap;gap:4px;padding:6px 8px;border-bottom:1px solid #4a3826}
.rm100-ward .iv90list .iv90lh{display:none}
.rm100-ward .iv90row{display:grid;grid-template-columns:26px minmax(0,1fr) 62px 62px;gap:6px;align-items:center;min-height:36px;padding:0 8px;margin:0;border:0;border-top:1px solid #ffffff0a;border-radius:0;background:none;width:100%;text-align:left}
.rm100-ward .iv90row.on{background:linear-gradient(90deg,#3a2a18,#2a1f17);box-shadow:inset 3px 0 0 var(--gold)}
.rm100-ward .iv90row .iv90f{width:26px;height:26px;border-radius:50%;overflow:hidden;border:1px solid #6b5236}.rm100-ward .iv90row .iv90f .portrait{width:26px!important;height:36px!important;margin-top:-2px}
.rm100-ward .iv90row .iv90n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700}
.rm100-ward .iv90row .iv90bs{display:grid;gap:3px}.rm100-ward .iv90row .iv90c{font-size:11px;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm100-ward .iv90row .fb90{display:none}
.rm100-ward .iv90more summary{padding:6px 8px;font-size:12px;color:var(--muted);cursor:pointer;border-top:1px solid #4a3826}
/* panels */
.rm100pblk{display:grid;grid-template-columns:100px minmax(0,1fr);gap:9px}
.rm100fr{position:relative;display:block;overflow:hidden;border-radius:3px;background:#cbb48a;isolation:isolate}
.rm100fr::before{content:"";position:absolute;inset:0;z-index:3;pointer-events:none;mix-blend-mode:multiply;opacity:.45;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 .78 0 0 0 0 .66 0 0 0 0 .5 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23p)'/%3E%3C/svg%3E")}
.rm100fr::after{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:3px;box-shadow:inset 0 0 0 2px #e2c88e,inset 0 0 0 4px #8a2a1a,inset 0 0 0 5px #3a1a0c,inset 0 0 18px 4px #2a14068c}
.rm100pic{position:absolute;inset:0;z-index:0}.rm100pic img{width:100%;height:100%;object-fit:cover;object-position:var(--op,50% 50%);display:block;filter:sepia(.18) saturate(.92)}
.rm100mini{position:absolute;z-index:2;filter:drop-shadow(2px 3px 2px #0008);width:auto}
.rm100por{width:100px;height:140px;background:radial-gradient(circle at 50% 35%,#5a4430,#2a1d12)}
.rm100por>.portrait{position:absolute!important;inset:0;width:100%!important;height:100%!important;z-index:1}.rm100por>.portrait svg{width:100%;height:100%}
.rm100pn{font:400 19px/1.15 var(--display);color:var(--gold2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm100pl{font-size:12.5px;color:var(--muted);line-height:1.5;min-width:0}.rm100pl b{color:var(--bone);font-weight:600}.rm100pl b.rm100g{color:var(--gold2)}
.rm100sub .rc-sub{font-size:12px;line-height:1.4}
.rm100chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}
.rm100ch{display:inline-flex;align-items:center;gap:4px;min-height:24px;border:1px solid #8a6a2a;border-radius:999px;padding:0 9px;font:12px var(--body,inherit);color:var(--gold2);background:#2e2212;cursor:pointer;white-space:nowrap}
.rm100ch:hover{background:#3a2a18}
.rm100ov{display:grid;grid-template-columns:20px 90px minmax(0,1fr) 36px;gap:6px;align-items:center;min-height:24px;font-size:12.5px;border-bottom:1px solid #ffffff0a;margin-bottom:2px}
.rm100bar{height:7px;border-radius:4px;background:#3a2c1e;overflow:hidden;position:relative}.rm100bar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#9c7a33,#d6ab4c)}
.rm100v{font:13px var(--mono);text-align:right;color:var(--bone)}
.rm100rat .ratgrid{gap:2px 6px;font-size:12.5px;align-items:center}.rm100rat .ratgrid .rc-sub{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.rm100row{display:grid;grid-template-columns:72px minmax(0,1fr);gap:7px;align-items:center;min-height:28px;border-top:1px solid #ffffff0a;font-size:12.5px}
.rm100row:first-of-type{border-top:0}
.rm100tg{display:inline-block;border:1px solid #5a4430;border-radius:3px;padding:0 5px;font-size:12px;margin-right:3px;background:#2a1f17}
.rm100tg.w{border-color:#4a7a2a;background:#1e2a14;color:#cfe8b0}.rm100tg.t{border-color:var(--gold);color:var(--gold2);background:#3a2a18}
.rm100bench .rm100br{grid-template-columns:24px minmax(0,1fr) minmax(0,.7fr) auto;min-height:40px}
.rm100br .rm100av{width:22px;height:22px}
.rm100ba{display:flex;gap:4px;justify-content:flex-end;align-items:center;flex-wrap:wrap}
.rm100ba .btn,.rm100ba select{font-size:12px;padding:3px 8px;min-height:26px;border-radius:999px}
.rm100ba select{max-width:110px;border-radius:5px}
/* the starter tablets */
.rm100stt{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.rm100stt .st95slot.rm100st{position:relative;display:grid;grid-template-columns:76px minmax(0,1fr);grid-template-rows:auto auto;gap:6px 10px;align-items:center;min-height:150px;padding:50px 10px 8px;margin:0;border:0;border-radius:8px;background:linear-gradient(135deg,#6e4420,#4a2c12);box-shadow:inset 0 0 0 1px #a2703a,0 3px 8px #0008;overflow:hidden}
.rm100st .rm100sb{position:absolute;left:0;right:0;top:0;height:42px;border-bottom:2px solid #a2703a;overflow:hidden}
.rm100st .rm100sb .rm100pic img{filter:sepia(.25) brightness(.85)}
.rm100st .rm100tier{position:absolute;z-index:6;left:10px;top:10px;font:500 10px var(--mono);letter-spacing:.14em;color:#f3e3bd;text-transform:uppercase;background:#1a120dd8;padding:2px 7px;border-radius:3px;white-space:nowrap}
.rm100st .rm100rn{position:absolute;z-index:6;right:12px;top:4px;font:400 26px var(--display);color:#f0cf7d;text-shadow:0 1px 3px #000}
.rm100st .rm100rd{width:76px;height:76px;cursor:pointer}
.rm100st .rm100tx{min-width:0}
.rm100st .rm100tx b{display:block;font:400 17px var(--display);color:#fff3d6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.rm100st .rm100tx small{display:block;font-size:12px;color:#e8d6ae}
.rm100st .rm100sa{grid-column:1/-1;display:flex;gap:5px;align-items:center;justify-content:flex-end;flex-wrap:wrap;min-width:0}
.rm100st .rm100sa .st95sa{display:flex;gap:5px;align-items:center;margin:0}
.rm100st .rm100sa select{max-width:130px;font-size:11.5px;padding:2px 4px;min-height:26px;background:#2a1a0c;color:#f0cf7d;border-color:#a2703a}
.rm100st .rm100sa .btn{font-size:11.5px;padding:2px 8px;min-height:26px;background:#2a1a0c;border-color:#a2703a;color:#f0cf7d}
.rm100st .st95on{font-size:11px;color:#cfe8b0;margin-right:auto}
/* the wax tabula */
.rm100tab{display:flex;flex-direction:column;border-radius:8px;padding:7px;background:linear-gradient(135deg,#7a4e26,#5a3618 40%,#6e4420 70%,#4a2c12);box-shadow:inset 0 0 0 1px #a2703a,inset 0 0 12px #2a1606,0 4px 12px #0008;min-width:0}
.rm100tstrip{height:36px;flex:none;border-radius:4px 4px 0 0}
.rm100tt{position:absolute;z-index:5;left:12px;top:8px;background:#2a1c0f;padding:1px 9px;border-radius:4px;font:400 15px var(--display);letter-spacing:.06em;color:#fff3d6;text-shadow:0 1px 3px #000,0 0 8px #000}
.rm100wax{flex:1;margin-top:5px;border-radius:3px;padding:7px 11px 9px;background:radial-gradient(ellipse at 30% 20%,#4a3a24,#2e2414 70%);box-shadow:inset 0 2px 8px #000c,inset 0 0 0 1px #1a1008;color:#e8d6ae;display:flex;flex-direction:column;min-width:0}
.rm100tr{display:grid;grid-template-columns:minmax(52px,86px) minmax(0,1fr) auto;gap:8px;align-items:center;min-height:26px;font-size:12.5px;font-family:Georgia,serif}
.rm100tr>*{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rm100tr>span:first-child{color:#d4bc90;font-style:italic}.rm100tr>span:last-child{text-align:right;font:12px var(--mono);color:#f0cf7d}
.rm100tr.ok>span:last-child{color:#9be86c}.rm100tr.no>span:last-child{color:#ffa596}.rm100tr.hi{background:#ffffff12;border-radius:3px}.rm100tr.dim{opacity:.6}
.rm100tsub{height:22px;line-height:24px;border-top:1px solid #8a6a3a44;margin-top:3px;color:#c4ad88}
.rm100clerk{display:grid;grid-template-columns:30px minmax(0,1fr);gap:8px;align-items:center;min-height:34px;font-size:12.5px;color:#e0cca2;border-bottom:1px dashed #8a6a3a66;margin-bottom:3px}
.rm100clerk .rm100rd{width:28px;height:28px}.rm100clerk b{color:#f0cf7d;font-weight:600}
.rm100cl .cl76{display:flex;flex-direction:column;gap:3px;margin:3px 0}.rm100cl .cl76>.rc-sub{font:500 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:#c4ad88}
.rm100cl .cl76 .btn{display:block;text-align:left;background:#ffffff08;border:1px solid #8a6a3a55;color:#e8d6ae;font:12.5px Georgia,serif;padding:3px 8px;min-height:26px}
.rm100cl .cl76 .btn small{color:#c4ad88}
.rm100tb{margin-top:auto;padding-top:8px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.rm100tb .rm100tbtn{display:flex;align-items:center;justify-content:center;gap:4px;min-height:34px;border-radius:5px;border:1px solid #8a6a3a;background:linear-gradient(#3a2a18,#22180e);color:#f0cf7d;font:400 14px var(--display);letter-spacing:.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:2px 8px;margin:0;cursor:pointer}
.rm100tb .rm100tbtn small{display:none}
.rm100tb .rm100tbtn[disabled]{opacity:.5;cursor:not-allowed}
.rm100tb .rm100tbtn.red{border-color:#c0433a;color:#ffd0c4;background:linear-gradient(#5a1b14,#3a110c)}
.rm100tb .rm100tbtn.lock{grid-column:1/-1;min-height:40px;border-color:#f0cf7d;color:#1a1008;background:linear-gradient(#f0cf7d,#c99a3a);font-size:16px;box-shadow:0 0 10px #d6ab4c55}
.rm100tb .rm100tbtn.lock[disabled]{opacity:.55;box-shadow:none}
.rm100tb.y3{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}
.rm100lend{position:relative}.rm100lend select{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%}
.rm100keep .acts{display:flex;flex-wrap:wrap;gap:6px}.rm100keep .acts .btn{font-size:12.5px;padding:4px 10px;white-space:normal;overflow:visible;max-width:100%}.rm100keep .acts .btn small{display:block;font-size:10.5px}
.rm100more{border:1px solid #4a3826;border-radius:8px;background:#1c140e;padding:4px 10px}.rm100more>summary{cursor:pointer;font-size:12.5px;color:var(--muted);padding:4px 0}
.rm100more>.card2{border:0;background:none;padding:4px 0;margin:0}
/* plates */
.rm100meta{display:flex;justify-content:space-between;gap:10px;align-items:center;min-height:18px;font-size:11.5px;color:var(--dim)}.rm100meta span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.rm100plates{display:grid;gap:7px}.rm100plates.d6{grid-template-columns:repeat(6,minmax(0,1fr))}
.rm100plt{position:relative;display:grid;grid-template-rows:auto auto auto auto;align-content:start;gap:2px;min-width:0;padding:5px;margin:0;border:1px solid #5a4430;border-radius:7px;background:linear-gradient(#2a1f17,#1e160f);color:var(--bone);text-align:left;font:inherit;cursor:pointer;overflow:hidden}
.rm100plt>.rm100fr{height:82px;margin-bottom:3px}
.rm100plt:hover:not([disabled]){border-color:#8a6a2a}
.rm100plt b{font:400 14px var(--display);color:#f3e3bd}
.rm100plt .rm100l{font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm100plt .rm100c{display:flex;justify-content:space-between;gap:8px;font:11.5px var(--mono);color:var(--gold2);white-space:nowrap}
.rm100plt.on{border-color:#d6ab4c;box-shadow:0 0 0 1px #d6ab4c,0 0 12px #d6ab4c33}
.rm100plt[disabled]{cursor:not-allowed}.rm100plt[disabled]:not(.on){opacity:.62}.rm100plt.lk{opacity:.5}
.rm100bdg,.rm100lkb{position:absolute;z-index:7;top:9px;right:9px;font:600 9.5px var(--mono);border-radius:3px;padding:1px 5px}
.rm100bdg{color:#1a1008;background:linear-gradient(#f0cf7d,#c99a3a)}.rm100lkb{color:#f3e3bd;background:#000b}
.rm100doc .y92dh{display:grid;grid-template-columns:76px minmax(0,1fr);gap:10px;align-items:start}
.rm100doc .y92face{width:76px;height:76px;border:0;box-shadow:0 0 0 3px #8a5a22,0 0 0 5px #3a2410,0 0 0 6px #c9a458,0 4px 10px #000c;background:radial-gradient(circle at 40% 30%,#c9934a,#5a3412)}
.rm100doc .y92face svg{filter:sepia(1) saturate(1.7) hue-rotate(-14deg) brightness(.82) contrast(1.25)}
.rm100doc .y92dn b{font:400 16px var(--display);color:var(--gold2)}.rm100doc .y92bank{display:none}
.rm100doc .y92dr{display:block;margin-top:6px;padding:0;border:0}.rm100doc .yd76l{display:block;font:500 9.5px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
.rm100doc .y92rgs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid #4a3826;border-radius:5px;overflow:hidden;gap:0}
.rm100doc .y92rg{border:0;border-right:1px solid #4a3826;border-radius:0;padding:3px 2px;min-height:0;background:none;text-align:center;font-size:0;display:block}
.rm100doc .y92rg:last-child{border-right:0}.rm100doc .y92rg b{font-size:12px;color:var(--bone);font-weight:500}.rm100doc .y92rg small{display:block;font-size:9.5px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm100doc .y92rg.on{background:#3a2a18;box-shadow:inset 0 -2px 0 var(--gold)}.rm100doc .y92rg.on b{color:var(--gold2)}
.rm100doc .y92dx{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.rm100doc .y92dx .rc-sub{font-size:11px}
/* the yard dossier card */
.rm100ycg{display:grid;grid-template-columns:62px minmax(0,1fr);gap:8px;align-items:start}
.rm100yc .rm100por{width:62px;height:87px}
.rm100yc .y92c{border:0;background:none;padding:0;margin:0;box-shadow:none}.rm100yc .y92c .y99rib,.rm100yc .y92c .y99pick{display:none}
.rm100yc .y92c .y92hd .portrait{display:none}.rm100yc .y92c .y92hd{margin-bottom:2px}
.rm100yc .y92c .y92r{grid-template-columns:68px minmax(16px,1fr) auto auto;grid-template-areas:none;column-gap:6px;row-gap:0;font-size:12.5px}.rm100yc .y92c .y92r>*{grid-area:auto}.rm100yc .y92c .y92r.ro{grid-template-columns:68px minmax(16px,1fr) auto auto}.rm100yc .y92c .y92l{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rm100yc .y92c .y92b{width:22px;height:22px;min-height:0;padding:0}.rm100yc .y92c .y92note{font-size:10.5px;white-space:nowrap}
.rm100yc .y92ft{flex-wrap:wrap;gap:5px}
.rm100prel{color:var(--gold2)}
/* trials: one strip of three big plates */
.rm100tri.y92trials{position:relative;margin:10px 0 0;padding:14px 9px 9px;background:linear-gradient(#2a1d12,#1c140e);border:1px solid #6b5236;border-radius:8px}
.rm100tri .y99who,.rm100tri .y99sel{display:none}
.rm100rib{position:absolute;left:50%;top:-11px;transform:translateX(-50%);white-space:nowrap;font:400 13px var(--display);letter-spacing:.08em;color:#f3e3bd;padding:2px 20px;background:linear-gradient(#5a1b14,#3a110c);border:1px solid #a3281f;border-radius:3px;z-index:8}
.rm100tri .y92tg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.rm100tri .y92t{display:grid;grid-template-rows:auto 1fr;gap:4px;padding:5px;border:1px solid #5a4430;border-radius:7px;background:linear-gradient(#2a1f17,#1e160f);min-width:0}
.rm100tri .y92ta{width:auto;height:auto;padding:0;background:none}.rm100tri .y92ta>.rm100fr{height:118px}
.rm100tri .y92tb{display:flex;flex-direction:column;gap:2px;min-width:0}.rm100tri .y92tb b{font:400 15px var(--display);color:#f3e3bd}
.rm100tri .y92tl{font-size:12px;color:var(--muted)}.rm100tri .y92tl.give{color:var(--gold2)}
.rm100tri .y92tb .btn{margin-top:4px;width:100%;min-height:30px;font:400 14px var(--display);border-color:#8a6a3a;background:linear-gradient(#3a2a18,#22180e);color:var(--gold2)}
.rm100cage{position:absolute;inset:0;z-index:3;background:repeating-linear-gradient(90deg,transparent 0 22px,#2a1a0ccc 22px 26px)}
/* the infirmary */
.rm100-ward .rm100bars{display:grid;gap:4px;margin:3px 0}
.rm100-ward .rm100bars .iv90bar{margin:0;padding:0;border:0;background:none}
.rm100-ward .rm100bars .iv90bl{font-size:12px}.rm100-ward .rm100bars .iv90lab{font-size:9.5px}
.rm100wl{display:grid;gap:5px;margin-top:7px}
.rm100w1{border:1px solid #5a4430;border-radius:5px;padding:5px 7px;background:#160f0b;min-width:0}
.rm100w1 b{display:block;font-size:12.5px;color:#ffb3a6;font-weight:600}.rm100w1 small{display:block;font-size:11.5px;color:var(--muted)}
.rm100w1.cut b{color:#dcb6f2}.rm100w1.ok{border-color:#3a2c1e}.rm100w1.ok b{color:var(--bone)}.rm100w1.ft b{color:#d8b4f0}
.rm100w1 .maim87{font-size:12px;color:#dcb6f2;margin:0;padding:0;border:0;background:none}
.rm100w3.iv90mid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.25fr) minmax(0,.95fr);gap:8px;padding:0;border:0;background:none;min-width:0;justify-items:stretch;align-items:stretch}
.rm100stg{display:grid;grid-template-columns:minmax(0,1fr) 136px;gap:10px}
.rm100niche{border-radius:120px 120px 8px 8px;background:radial-gradient(ellipse at 50% 30%,#4a3e30,#1e1610 75%);box-shadow:inset 0 0 0 2px #6b5236,inset 0 0 30px #000;padding:14px 8px 6px;min-width:0;display:grid;place-items:center}
.rm100niche .iv90av{margin:0;width:100%;display:grid;place-items:center}.rm100niche .iv90av svg{width:100%;max-width:200px;height:auto;max-height:380px;display:block}
.rm100niche .iv90av svg image{filter:grayscale(1) brightness(1.62) contrast(.82) sepia(.06) drop-shadow(0 0 6px #fff5)}
.rm100niche .iv90av svg path[fill="#c0392b"]{display:none}
.rm100niche .glow90{stroke-opacity:.45}.rm100niche .glow90.sev{stroke:#d8a8f0;fill-opacity:.08}
.rm100niche .rm100ghost{stroke-width:1.2}
.rm100niche .iv90av.worn{box-shadow:none}
.rm100locs{display:grid;gap:5px;align-content:start;min-width:0}.rm100locs .rm100wd{color:#ff8a7a}.rm100locs .rm100sv{color:#d8a8f0}
.rm100locs .iv90nd{display:flex;flex-wrap:wrap;gap:3px}.rm100locs .nd90{font-size:11px}
.rm100care.iv90care{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;padding:0;border:0;background:none;min-width:0}
.rm100care .iv90s,.rm100care .plantiles,.rm100care .acts,.rm100care .iv90ba{display:contents}
.rm100care .rm100plt{width:auto;height:auto;min-height:0;white-space:normal}
.rm100care .rm100plt>.rm100fr{height:96px}
.rm100care .rm100plt .pi{display:none}.rm100care .rm100plt>b{font:400 14px var(--display);color:#f3e3bd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm100care .rm100plt .pc,.rm100care .rm100plt .pf{font:11.5px var(--mono);color:var(--gold2)}.rm100care .rm100plt .pd90,.rm100care .rm100plt small,.rm100care .rm100plt .pw{display:block;font-size:11.5px;color:var(--muted);line-height:1.3}
.rm100care .rm100plt.off,.rm100care .rm100plt[disabled]{opacity:.6}
.rm100care .rm100plt.on{border-color:#d6ab4c;box-shadow:0 0 0 1px #d6ab4c}
.rm100pface{position:absolute;z-index:2;left:8px;bottom:8px;width:40px;height:40px}
.rm100glow{position:absolute;inset:0;z-index:2;background:radial-gradient(circle at 50% 40%,#ffe7a688,transparent 60%)}
.rm100steam{position:absolute;inset:0;z-index:2;background:linear-gradient(#e8f0f055,transparent 70%)}
.rm100notes{grid-column:1/-1;display:grid;gap:6px;font-size:12px;color:var(--muted);min-width:0}.rm100notes>*{margin:0;min-width:0}
/* the hidden holder */
.rm100hold[hidden]{display:none!important}
/* narrower panes (tablets, small laptops) */
@container rm100d (max-width:760px){.rm100g3,.rm100w3.iv90mid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.rm100g3>.rm100tab,.rm100w3>.rm100tab{grid-column:1/-1}
  .rm100plates.d6,.rm100care.iv90care{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:980px){.rm100{grid-template-columns:minmax(0,1fr)}.rm100list{position:static}}
@container rm100d (max-width:560px){.rm100g3,.rm100g2,.rm100w3.iv90mid,.rm100stt,.rm100tri .y92tg{grid-template-columns:minmax(0,1fr)}
  .rm100plates.d6,.rm100care.iv90care{grid-template-columns:repeat(2,minmax(0,1fr))}
  .rm100stt .st95slot.rm100st{min-height:118px;padding-top:44px;grid-template-columns:62px minmax(0,1fr)}.rm100st .rm100rd{width:62px;height:62px}.rm100st .rm100sb{height:36px}
  .rm100pblk{grid-template-columns:96px minmax(0,1fr)}.rm100por{width:96px;height:134px}
  .rm100stg{grid-template-columns:minmax(0,1fr)}.rm100niche .iv90av svg{max-height:420px}
  .rm100lh.ros,.rm100lr.ros{grid-template-columns:22px 26px minmax(0,1fr) 26px 34px 10px 18px 20px}
  .rm100bench .rm100br{grid-template-columns:24px minmax(0,1fr) auto}.rm100bench .rm100br>.rm100mut{display:none}
  .rm100tb{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.rm100tb .rm100tbtn.red{grid-column:1/-1}
  .rm100meta span:last-child{display:none}}
@media (max-width:600px){.rm100st .rm100sa .btn,.rm100st .rm100sa select,.rm100ba .btn,.rm100ba select,.rm100tb .rm100tbtn,.rm100ch,.rm100cl .cl76 .btn{min-height:36px}
  body.rm100on .rm100ban{min-height:62px}body.rm100on .rm100ban .roomttl b{font-size:19px}body.rm100on .rm100ban .rm100adv{width:44px;height:44px}
  body.rm100on .rm100ban{flex-wrap:wrap}body.rm100on .rm100ban .roomstat.rm100cnt{display:none}}
body.calm .rm100plt,body.calm .rm100lr{transition:none}

/* round 2 fixes */
.rm100ycc.y92grid{display:block;margin:0;padding:0}
.rm100st .rm100rd.imm88{overflow:visible}
@container rm100d (min-width:761px){.rm100g3.rm100y1{grid-template-columns:minmax(0,1.5fr) minmax(0,.95fr) minmax(0,1fr)}}
.rm100yc .y92c .y92v{width:auto;min-width:0;white-space:nowrap;text-align:right}.rm100tb .rm100tbtn{font-size:13px}
.rm100yc .y92c .y92pm{gap:2px}.rm100yc .y92c .y92n{width:auto;min-width:12px}
body.rm100on .rm100ban.yard>svg{display:none}
body.rm100on .rm100ban .hyg87{position:relative!important;inset:auto!important;right:auto!important;left:auto!important;top:auto!important;transform:none!important;flex:none;margin:0}
body.rm100on .rm100ban .roomstat.rm100cnt{top:auto!important;right:auto!important;transform:none!important;border-radius:6px!important}
.rm100list>*{min-width:0;max-width:100%}.rm100list .bd90{white-space:normal;text-align:left}
.rm100sub .rc-sub{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.rm100rat .ratgrid{display:grid;grid-template-columns:minmax(0,108px) minmax(0,1fr) 30px;column-gap:6px}.rm100rat .ratgrid>.rc-sub{display:none}
.rm100rat .ratgrid>span:first-child,.rm100rat .ratgrid>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm100cl .cl76{align-items:stretch}.rm100cl .cl76 .btn{width:100%;box-sizing:border-box}
.rm100cl .cl76 .btn small{display:block;font-size:11px}
.rm100care.iv90care .rm100plt{all:unset;box-sizing:border-box;position:relative;display:grid!important;grid-template-columns:minmax(0,1fr);grid-auto-rows:auto;align-content:start;gap:2px;min-width:0;padding:5px;border:1px solid #5a4430;border-radius:7px;background:linear-gradient(#2a1f17,#1e160f);color:var(--bone);font-size:12px;cursor:pointer;overflow:hidden}
.rm100care.iv90care .rm100plt:hover:not([disabled]){border-color:#8a6a2a}
.rm100care.iv90care .rm100plt>.rm100fr{width:100%;height:96px;margin-bottom:3px}
.rm100care.iv90care .rm100plt[disabled],.rm100care.iv90care .rm100plt.off{opacity:.6;cursor:not-allowed}
.rm100care.iv90care .rm100plt.primary{border-color:#d6ab4c}
.rm100care.iv90care .rm100plt .pi{display:none}
.rm100-ward .rm100bars .iv90bar,.rm100-ward .rm100bars .iv90seg{min-width:0;width:100%}.rm100-ward .rm100bars .iv90lab{display:none}
.rm100-ward .rm100bars .iv90bl{display:flex;justify-content:space-between;gap:6px;white-space:nowrap}.rm100-ward .rm100bars .iv90bl .fb90{display:none}
.rm100niche .glow90:not(.sev){display:none}
.rm100-ward .iv90row .iv90c{font-size:10.5px}
`;(document.head||document.documentElement).appendChild(st)}
{const st=document.createElement('style');st.textContent=`
body.rm100on .card2.wd76top{font-size:13px;padding:6px 10px;margin:0 0 8px;gap:4px 14px}body.rm100on .card2.wd76top b{font-size:14px}
`;(document.head||document.documentElement).appendChild(st)}
