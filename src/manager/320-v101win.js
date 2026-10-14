/* =====================================================================
   320-V101WIN · v1.01 workstream C — CORRESPONDENCE WINDOWS (M21) + THE CITY SQUARE IN 3D AT DOOR SIZE (M39)
   =====================================================================
   Display only: no rule, number, save, dice or S changes. Everything is RE-HOMED (the 298 approach): the finished HTML of the old
   windows is parsed into a <template>, its live nodes (buttons, selects, inputs with every data-* attribute, id, disabled reason
   and title) are moved into the new layout, so every handler (17-manager data-mg, 23-ludus envoys/trades, 47 tcbtn, 108 clauses,
   306 sandstone…) keeps working untouched.
   M21 · 1  TEAM SCREEN (teamHTML wrapper, League → 🏛 Team screen): a fresco banner (the lanista's portrait in the painted frame,
            house shield + name in the house colour, standing, bio, chips: Ludus grade, fame, record, fighters, treasury, facilities,
            opinion; the trophy case + ← Back to the League moved in); left = the roster as one-line rows (★ pin · face · name/class ·
            grade · record · last five · morale · contract · 🔍 card → the rival fighter card), Coming up, the house's traits, Their ledger;
            right = the CORRESPONDENCE dossier (lanista + quote, opinion bar + reasons, envoys as plates) and the trade / debt as wax
            TABULAE with sandstone main buttons (Send the proposal = primary, Cancel = secondary, Pay all = primary).
        2  FIGHTER CARD for a CONTRACTED fighter (detailHTML wrapper: "Your stable" and "Signed elsewhere" in Recruiting, the Favorites
            board): fresco head (portrait frame, name, class · grade · house shield · age · home chips) and every old ".sect" block as a
            dossier section; "Keeping him" buttons as PLATES (icon · title · cost/effect chips); the contract (wage box, clauses, weeks)
            as a tabula with 📜 Extend (sandstone primary) and Release (carbon); a rival's poach offer as a tabula (Offer = primary).
            Skipped while rosterBlockHTML builds (298's roster re-homes that card itself).
        3  ROSTER (final mgrHTML wrapper, tab roster, 298 on): 298's "Keeping him" block becomes plates, the "More" fold's rest of the
            card becomes dossier sections, Extend / Release in the tabula wear sandstone primary / carbon.
        Phones (≤600 px): one column everywhere, plates one per row.
   M39 · CITY SQUARE (172/313/279/280): my LANISTA ('me') and the TRAINING YARD (two sparring gladiators 'yd<cls>' + the doctore 'yddoc')
            are drawn from 313's crowd sheets (cityImg wrapper, outermost): the lanista = a crowd look by his face/beard/skin, tinted by
            his robe (the house colour in Manager); yard gladiators = crowd100_c_<class> stand-ins (stand / walk frames while they lunge);
            the doctore = the bearded look in his brown robe. DOOR SIZE: door89 is wrapped to record every painted door's height (in z
            units) while the forum bakes; the figure height = V101C.k (0.85) × the median door → CR100.cityH (313's townsfolk + guards +
            gladiators) and our own figures; flat fallbacks (no sheets: standalone, crowd off) are drawn into the same box scaled to it;
            figShadow89 follows the scale. Reduce motion / calm: no walk frames (280 already stops the crowd). Placeholders in CITY.imgs
            (like 313) keep 172 from building svgs every frame; 279's warm-up still waits for the sheets (313 counts them).
   Kill switch localStorage flavius_v101coff=1 (no wrappers act: the v1.0 windows and figures exactly). Test tools/tests/tv101d.js;
   shots tools/plans/v101/shots/ (local only).
   ===================================================================== */
const V101C={k:0.85,      /* TWEAK: figure height ÷ the measured door height */
  minH:0.34,maxH:1.0,     /* TWEAK: clamp of the figure height in city tiles */
  doors:[],doorKey:'',h:null,ros:0,stats:{plates:0,team:0,card:0,city:0}};
function v101On(){try{return localStorage.getItem('flavius_v101coff')!=='1'}catch(e){return true}}
const v101Tpl=h=>{const t=document.createElement('template');t.innerHTML=h||'';return t};
const v101Txt=n=>String(n&&n.textContent||'').replace(/\s+/g,' ').trim();
function v101Face(g){try{return typeof rm100Face==='function'?rm100Face(g):gArt(g,'xs')}catch(e){return ''}}
function v101Grade(g,known){try{const o=known?effOvr(g):pubOvr(g);const L=typeof trait96Grade==='function'?trait96Grade(o):'';
  return `<span class="v101gr${known?'':' est'}" title="${esc(known?_T`Rating ${o}`:_T`Public estimate ~${o} — scout for the truth`)}">${L?`<b>${esc(L)}</b>`:''}<i>${known?'':'~'}${o}</i></span>`}catch(e){return ''}}
function v101Shield(m,px){try{return m&&typeof parma100==='function'?`<span class="v101sh">${parma100(m,px||18)}</span>`:''}catch(e){return ''}}
function v101Scene(k,mode,pos){try{return typeof scene100==='function'?`<span class="rm100pic" style="--op:${pos||'50% 50%'}">${scene100(k,mode||'tile','rm100sc')}</span>`:''}catch(e){return ''}}
function v101Clerk(){try{const w=W_();const a=council83(w).find(x=>x.k==='clerk');return a?{a,f:face83(a,30)}:null}catch(e){return null}}

/* ---------- a button → a plate (icon · title · chips); attributes, disabled and title stay ---------- */
function v101Plate(b){if(!b||b.classList.contains('v101plt'))return;const sm=b.querySelector('small');const smH=sm?sm.innerHTML:'';if(sm)sm.remove();
  let body=b.innerHTML.trim();let ic='';const IC={scout:'🔍',visit:'🍷',gift2:'🎁',offer:'✍',poach:'✍'};const m=/^([^<\p{L}\p{N}]+?)\s+(?=[<\p{L}\p{N}])/u.exec(body);if(m&&m[1].trim()){ic=m[1].trim();body=body.slice(m[0].length)}
  const chips=smH?smH.split(/\s+·\s+/).filter(x=>x.trim()).map((x,i)=>`<span class="v101pc${i===0&&/amt87|<img/.test(x)?' cost':''}">${x}</span>`).join(''):'';
  if(!ic)ic=IC[b.dataset.mg]||'·';b.classList.add('v101plt');b.innerHTML=`<span class="v101pi" aria-hidden="true">${ic}</span><span class="v101pt"><b>${body}</b>${chips?`<span class="v101pcs">${chips}</span>`:''}</span>`;V101C.stats.plates++}
/* an old ".sect" heading + what follows it → dossier sections inside root (in place) */
function v101Sections(root,cls){const kids=[...root.childNodes];const out=document.createDocumentFragment();let cur=null;
  const open=(title,tag)=>{cur=document.createElement('section');cur.className='rm100p v101s'+(cls?' '+cls:'');if(title!=null){const h=document.createElement('div');h.className='rm100ph';h.innerHTML=title;cur.appendChild(h)}if(tag)cur.dataset.v101s=tag;out.appendChild(cur)};
  for(const n of kids){if(n.nodeType===3&&!n.textContent.trim()){n.remove();continue}
    if(n.nodeType===1&&n.matches('div.sect,.sect')){open(n.innerHTML,v101Txt(n).slice(0,40));n.remove();continue}
    if(!cur)open(null,'top');cur.appendChild(n)}
  root.appendChild(out);return root}
/* keeping / recruiting button rows → plates */
function v101Acts(root){for(const a of root.querySelectorAll('.acts')){const bs=[...a.querySelectorAll(':scope > button.btn')];if(!bs.length)continue;
  if(!bs.some(b=>b.querySelector('small')))continue;a.classList.add('v101plts');for(const b of bs){if(['extend','release'].includes(b.dataset.mg))continue;v101Plate(b)}}}

/* ============================== M21 · 1  THE TEAM SCREEN ============================== */
function v101Team(h){const w=W_(),pm=me();const m=mgrById(MGR.teamId);if(!w||!pm||!m||m.isPlayer)return h;
  const t=v101Tpl(h);const R=t.content;const lay=R.querySelector('.teamlay');if(!lay)return h;
  const back=R.querySelector('[data-mg="tab"][data-id="league"]');const adv=R.querySelector('.adv98r');
  const [L,Rt]=[lay.children[0],lay.children[1]];if(!L||!Rt)return h;
  const cards=[...L.querySelectorAll(':scope > .card2')];const hd=cards[0],rosC=cards[1],upC=cards[2];
  const grade=hd&&hd.querySelector('.gradebox');const tc=hd&&hd.querySelector('.tcbtn');const subs=hd?[...hd.querySelectorAll('.rc-sub')]:[];
  const stats=hd&&hd.querySelector('.rc-stats');const comms=Rt.querySelector('.comms');const ledC=[...Rt.querySelectorAll(':scope > .card2')].pop();
  const op=typeof opinionOf==='function'?opinionOf(m):{v:50};const [tn,tcol]=typeof opTier==='function'?opTier(op.v):['',''];
  /* banner */
  const ban=document.createElement('section');ban.className='v101ban v101tban';ban.style.setProperty('--hc',m.color||'#c9a458');
  ban.innerHTML=`<span class="v101bimg" aria-hidden="true">${v101Scene('team','banner','50% 55%')}</span>
    <span class="rm100fr v101por">${typeof mgrPortrait==='function'?mgrPortrait(m,'md'):''}</span>
    <div class="v101bt"><div class="v101bn">${v101Shield(m,30)}<b style="color:${esc(m.color||'#f0cf7d')}">${esc(m.ludus)}</b></div><div class="v101bs"></div><div class="v101chips"></div></div>
    <div class="v101bx"></div>`;
  const bs=ban.querySelector('.v101bs');for(const s of subs.slice(0,2)){s.removeAttribute('style');bs.appendChild(s)}if(adv){adv.classList.add('v101adv');bs.appendChild(adv)}
  const ch=ban.querySelector('.v101chips');
  if(stats){for(const sp of [...stats.querySelectorAll(':scope > span')]){sp.classList.add('v101chip');ch.appendChild(sp)}}
  ch.insertAdjacentHTML('beforeend',`<span class="v101chip op" style="--oc:${esc(tcol||'#c9a458')}" title="${esc(_T('Their opinion of your house'))}"><b>${op.v}</b>${esc(tn||'')}</span>`);
  const bx=ban.querySelector('.v101bx');if(grade)bx.appendChild(grade);if(tc)bx.appendChild(tc);if(back){back.classList.add('v101sec','v101back');bx.appendChild(back)}
  /* the roster as rows */
  const ros=document.createElement('section');ros.className='rm100p v101ros';
  const rows=rosC?[...rosC.querySelectorAll('tr')].filter(tr=>tr.querySelector('td')):[];
  ros.innerHTML=`<div class="rm100ph">${_T`🛡 Roster`} · ${rows.length} <span class="v101mut">${_T`~ = the public estimate · scout for the truth`}</span></div>
    <div class="v101lh"><span></span><span></span><span>${_T`Fighter`}</span><span>${_T`Rating`}</span><span>${_T`W–L`}</span><span>${_T`Last five`}</span><span>${_T`Morale`}</span><span>${_T`Contract`}</span><span></span></div><div class="v101rows"></div>`;
  const rb=ros.querySelector('.v101rows');
  for(const tr of rows){const td=[...tr.children];const fav=td[0]&&td[0].querySelector('[data-mg="fav"]');const id=fav?fav.dataset.id:null;const g=id&&gById(id);if(!g)continue;
    const d=document.createElement('div');d.className='v101lr';d.dataset.v101g=g.id;
    d.innerHTML=`<span class="v101f"></span><span class="rm100av">${v101Face(g)}</span><span class="v101nm"><b class="rm100one">${esc(g.name)}</b><small class="rm100one">${esc(CLASSES[g.cls]?CLASSES[g.cls].name:'')} · ${gAge(g)}${g.inj?' · ⚕':''}</small></span>${v101Grade(g,!!g.scout)}<span class="v101n"></span><span class="v101fm"></span><span class="v101n"></span><span class="v101n v101ct"></span>
      <button type="button" class="v101cardb" data-v101card="${g.id}" title="${esc(_T`Open ${g.name}'s card`)}" aria-label="${esc(_T`Open ${g.name}'s card`)}">🔍</button>`;
    if(fav){fav.removeAttribute('style');fav.classList.add('v101fav');d.querySelector('.v101f').appendChild(fav)}
    const n=d.querySelectorAll('.v101n');if(td[4])n[0].innerHTML=td[4].innerHTML;if(td[6])n[1].innerHTML=td[6].innerHTML;if(td[7])n[2].innerHTML=td[7].innerHTML;
    if(td[5]){const fm=d.querySelector('.v101fm');for(const c of [...td[5].childNodes])fm.appendChild(c)}
    rb.appendChild(d)}
  if(!rows.length)rb.innerHTML=`<p class="v101mut">${_T`An empty barracks.`}</p>`;
  /* coming up · traits · ledger */
  const up=document.createElement('section');up.className='rm100p v101up';if(upC){const s=upC.querySelector('.sect');up.innerHTML=`<div class="rm100ph">${s?s.innerHTML:''}</div>`;if(s)s.remove();for(const c of [...upC.childNodes])up.appendChild(c)}
  const tr=document.createElement('section');tr.className='rm100p v101tr';
  tr.innerHTML=`<div class="rm100ph">${_T`The house · how they run it`}</div><div class="v101trs">${(typeof MGR_KEYS!=='undefined'?MGR_KEYS:[]).map(([k,l])=>{const v=m.p&&m.p[k]||0;return `<span class="v101trt"><span>${esc(l)}</span><span class="rm100bar"><i style="width:${Math.min(100,v)}%"></i></span><b>${v}</b></span>`}).join('')}</div>`;
  const led=document.createElement('section');led.className='rm100p v101led';if(ledC){const s=ledC.querySelector('.sect');led.innerHTML=`<div class="rm100ph">${s?s.innerHTML:''}</div>`;if(s)s.remove();for(const c of [...ledC.childNodes])led.appendChild(c)}
  /* the correspondence dossier */
  const right=document.createElement('div');right.className='v101r';
  if(comms){const cb=comms.querySelector('.commsbody'),opb=comms.querySelector('.opbar'),opl=comms.querySelector('.oplist'),sects=[...comms.querySelectorAll(':scope > .sect')],acts=comms.querySelector('.commsacts');
    const boxes=[...comms.querySelectorAll(':scope > .tradebox')];const rest=[...comms.querySelectorAll(':scope > p')];
    const cor=document.createElement('section');cor.className='rm100p v101cor';cor.style.setProperty('--oc',tcol||'#c9a458');
    cor.innerHTML=`<div class="rm100ph">${_T`📜 Correspondence`} <span class="v101opt" style="color:${esc(tcol||'#c9a458')}">${esc(tn||'')} · ${op.v}</span></div>`;
    if(cb){cb.classList.add('v101cb');cor.appendChild(cb)}if(opb)cor.appendChild(opb);if(opl)cor.appendChild(opl);right.appendChild(cor);
    const env=document.createElement('section');env.className='rm100p v101env';env.innerHTML=`<div class="rm100ph">${sects[0]?sects[0].innerHTML:_T('Send an envoy')}</div>`;
    if(acts){acts.classList.add('v101plts');for(const b of acts.querySelectorAll('button'))v101Plate(b);env.appendChild(acts)}for(const p of rest)env.appendChild(p);right.appendChild(env);
    for(const b of boxes)right.appendChild(v101Tabula(b,m))}
  right.appendChild(led);
  const left=document.createElement('div');left.className='v101l';left.appendChild(ros);left.appendChild(up);left.appendChild(tr);
  const root=document.createElement('div');root.className='v101tm';root.dataset.v101team=m.id;root.appendChild(ban);
  const cols=document.createElement('div');cols.className='v101cols';cols.appendChild(left);cols.appendChild(right);root.appendChild(cols);
  /* whatever else the old screen carried (a later wrapper's line) stays, after the banner */
  const keep=[...R.childNodes].filter(n=>n!==lay&&n.nodeType===1&&!n.matches('.acts')&&!n.classList.contains('adv98r'));
  lay.replaceWith(root);for(const n of keep)root.insertBefore(n,cols);[...R.children].forEach(a=>{if(a.matches('.acts')&&!a.querySelector('button'))a.remove()});
  V101C.stats.team++;return t.innerHTML}
/* a .tradebox (trade / debt) → a wax tabula; its buttons get the sandstone main look */
function v101Tabula(box,m){const s=box.querySelector('.sect');const ttl=s?s.innerHTML:'';if(s)s.remove();
  const tab=document.createElement('section');tab.className='rm100tab v101tab';
  tab.innerHTML=`<span class="rm100fr rm100tstrip">${v101Scene('team','tile','50% 65%')}<span class="rm100tt">${ttl}</span></span><div class="rm100wax"></div>`;
  const wax=tab.querySelector('.rm100wax');const C=v101Clerk();
  if(C)wax.insertAdjacentHTML('beforeend',`<div class="rm100clerk"><span class="rm100rd">${C.f}</span><span class="rm100one"><b>${esc(C.a.name)}</b>, ${esc(C.a.role)}: “${box.querySelector('#trMine')?_T`Contracts travel with the fighters.`:_T`Pay what you owe and they warm to you.`}”</span></div>`);
  for(const c of [...box.childNodes])wax.appendChild(c);
  for(const b of wax.querySelectorAll('button.btn')){const g=b.dataset.mg;b.classList.add(['tradego','loanpayall'].includes(g)||b.classList.contains('primary')?'v101pri':'v101sec')}
  for(const a of wax.querySelectorAll('.acts'))a.classList.add('v101ta');
  return tab}

/* ============================== M21 · 2  A CONTRACTED FIGHTER'S CARD ============================== */
function v101Card(h,g){const w=W_(),pm=me();if(!w||!pm||!g||!g.contract)return h;const t=v101Tpl(h);const R=t.content;const card=R.querySelector('.card2');if(!card||card.classList.contains('v101card'))return h;
  const mine=g.contract.mgr===pm.id;const M=mgrById(g.contract.mgr);const known=mine||!!g.scout;
  const top=card.firstElementChild;const hasP=top&&top.querySelector('.portrait');
  /* head */
  const head=document.createElement('section');head.className='v101fh';
  head.innerHTML=`<span class="rm100fr v101fpor">${gArt(g,'md')}</span><div class="v101fi"></div>
    <div class="v101fc"><span class="v101chip cls" style="--cc:${esc(CLASSES[g.cls]&&CLASSES[g.cls].color||'#c9a458')}">${esc(CLASSES[g.cls]?CLASSES[g.cls].name:'?')}</span>${v101Grade(g,known)}
      <span class="v101chip">${v101Shield(M,16)}${esc(M?M.ludus:'')}${mine?' · '+_T('yours'):''}</span><span class="v101chip">${_T`${gAge(g)} yrs`}</span><span class="v101chip">${esc(g.city||'')}</span>
      ${mine?`<span class="v101chip">${_T`Morale ${g.morale||0}`}</span><span class="v101chip">${_T`Loyalty ${typeof loyaltyOf==='function'?loyaltyOf(g):0}`}</span>`:''}</div>`;
  if(hasP){const info=top.querySelector(':scope > div[style*="flex:1"]')||[...top.children].find(x=>!x.querySelector('.portrait')&&!x.matches('.portrait'));const fi=head.querySelector('.v101fi');
    if(info){info.removeAttribute('style');fi.appendChild(info)}
    for(const x of [...top.children]){if(x!==info&&!x.matches('.portrait')&&!x.querySelector('.portrait'))fi.appendChild(x)}
    top.replaceWith(head)}else card.insertBefore(head,card.firstChild);
  /* the contract tabula (yours) */
  let con=null;
  if(mine){const ext=card.querySelector(`[data-mg="extend"][data-id="${g.id}"]`),rel=card.querySelector(`[data-mg="release"][data-id="${g.id}"]`);const wb=card.querySelector('.wagebox');const cl=card.querySelector('.cl76');
    con=document.createElement('section');con.className='rm100tab v101tab v101con';const c=g.contract;const ask=typeof askWage==='function'?askWage(g):c.wage;const C=v101Clerk();
    con.innerHTML=`<span class="rm100fr rm100tstrip">${v101Scene('team','tile','50% 65%')}<span class="rm100tt">${_T`Tabula · the contract`}</span></span><div class="rm100wax">
      ${C?`<div class="rm100clerk"><span class="rm100rd">${C.f}</span><span class="rm100one"><b>${esc(C.a.name)}</b>, ${esc(C.a.role)}: “${c.weeks<=3?_T`The contract ends in ${Math.max(0,c.weeks)} weeks. Renew it before a rival asks.`:ask>c.wage?_T`Worth ${ask} a week now; takes ${c.wage}.`:_T`A fair wage. Nothing to do yet.`}”</span></div>`:''}
      <div class="rm100tr"><span>${_T`Weeks left`}</span><span class="rm100one">${_T`about ${Math.max(0,c.weeks||0)*(c.wage||0)} still owed`}</span><span>${Math.max(0,c.weeks||0)}</span></div>
      <div class="rm100tr${ask>(c.wage||0)?' no':''}"><span>${_T`Renewal`}</span><span class="rm100one">${_T`asks about ${ask} a week`}</span><span>~${ask}</span></div><div class="v101cw"></div><div class="rm100cl"></div><div class="v101ta"></div></div>`;
    if(wb)con.querySelector('.v101cw').appendChild(wb);if(cl){const nx=cl.nextElementSibling;cl.classList.add('rm100cls');con.querySelector('.rm100cl').appendChild(cl);if(nx&&nx.tagName==='P'&&!nx.querySelector('button')&&/\d/.test(nx.textContent)&&/contract|week/i.test(nx.textContent))con.querySelector('.rm100cl').appendChild(nx)}
    const ta=con.querySelector('.v101ta');if(ext){ext.classList.add('v101pri');ta.appendChild(ext)}if(rel){rel.classList.add('v101dan');ta.appendChild(rel)}}
  /* a rival's fighter: the poach offer as a tabula */
  let poach=null;
  if(!mine){const wage=card.querySelector('#ofWage');const slip=wage&&wage.closest('.bslip');if(slip){poach=document.createElement('section');poach.className='rm100tab v101tab v101poach';
      let s0=slip.previousElementSibling;const parts=[];while(s0&&!(s0.classList&&s0.classList.contains('sect'))){parts.unshift(s0);s0=s0.previousElementSibling}
      const ttl=s0?s0.innerHTML:_T('Offer');poach.innerHTML=`<span class="rm100fr rm100tstrip">${v101Scene('team','tile','50% 40%')}<span class="rm100tt">${ttl}</span></span><div class="rm100wax"></div>`;
      const wax=poach.querySelector('.rm100wax');const after=[];let n=slip.nextElementSibling;while(n&&!(n.classList&&n.classList.contains('sect'))){after.push(n);n=n.nextElementSibling}
      for(const x of [...parts,slip,...after])wax.appendChild(x);if(s0&&s0.parentNode)s0.remove();
      for(const b of wax.querySelectorAll('button.btn'))b.classList.add(b.classList.contains('primary')||['offer','poach'].includes(b.dataset.mg)?'v101pri':'v101sec')}}
  /* everything after the head → dossier sections, keeping rows → plates */
  const body=document.createElement('div');body.className='v101fb';for(const n of [...card.childNodes]){if(n!==head)body.appendChild(n)}
  v101Sections(body);v101Acts(body);
  for(const s of body.querySelectorAll(':scope > section.v101s')){const tt=(s.dataset.v101s||'').toLowerCase();if(s.querySelector('.v101plts'))s.classList.add('v101wide','v101keep');if(s.querySelector('.ratgrid,.gs98,.rt98'))s.classList.add('v101rat');if(tt==='top'&&!s.textContent.trim())s.remove()}
  card.appendChild(body);if(con)body.appendChild(con);if(poach)body.appendChild(poach);
  card.classList.add('v101card',mine?'v101mine':'v101riv');card.dataset.v101fc=g.id;V101C.stats.card++;return t.innerHTML}
{const base=detailHTML;detailHTML=function(g){const h=base.apply(this,arguments);try{if(!v101On()||V101C.ros||!g||!g.contract||typeof h!=='string'||!W_())return h;return v101Card(h,g)}catch(e){console.error(e);return h}}}
{const base=rosterBlockHTML;rosterBlockHTML=function(){V101C.ros++;try{return base.apply(this,arguments)}finally{V101C.ros--}}}
{const base=teamHTML;teamHTML=function(){const h=base.apply(this,arguments);try{if(!v101On()||typeof h!=='string')return h;return v101Team(h)}catch(e){console.error(e);return h}}}

/* ============================== M21 · 3  THE ROSTER'S KEEPING HIM (298) ============================== */
function v101Roster(h){const t=v101Tpl(h);const R=t.content;const keep=R.querySelector('.rm100keep');if(!keep)return h;
  v101Acts(keep);for(const b of keep.querySelectorAll('.acts > button.btn'))v101Plate(b);keep.classList.add('v101keep');
  const rest=R.querySelector('.rm100more .rm100rest');if(rest&&!rest.dataset.v101){rest.dataset.v101='1';v101Sections(rest);v101Acts(rest);rest.classList.add('v101fb')}
  const tb=R.querySelector('.rm100con .rm100tb');if(tb){const e=tb.querySelector('[data-mg="extend"]'),r=tb.querySelector('[data-mg="release"]');if(e)e.classList.add('v101pri');if(r)r.classList.add('v101dan')}
  return t.innerHTML}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(!v101On()||typeof h!=='string'||typeof MGR==='undefined'||MGR.view)return h;
    if(MGR.tab==='roster'&&h.indexOf('rm100keep')>=0)return v101Roster(h)}catch(e){console.error(e)}return h}}
/* 🔍 on a rival's roster row → his card in Recruiting (Signed elsewhere) */
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#mgrBody .v101cardb[data-v101card]');if(!b||!v101On())return;e.preventDefault();e.stopPropagation();
  const g=gById(b.dataset.v101card);if(!g)return;try{if(typeof P101!=='undefined')P101.gcard=true}catch(err){}MGR.tab='recruit';MGR.filter=g.contract&&g.contract.mgr===me().id?'mine':'signed';MGR.sel=g.id;MGR.rq='';if(typeof MGR_REDRAW==='function')MGR_REDRAW();
  setTimeout(()=>{const c=document.querySelector('#mgrBody [data-v101fc="'+g.id+'"]');if(c)c.scrollIntoView({block:'nearest'})},40)},true);

{const st=document.createElement('style');st.id='v101ccss';st.textContent=`
/* shared */
.v101mut{color:var(--muted);font-size:12px;font-weight:400;letter-spacing:0;text-transform:none}
.v101chip{display:inline-flex;align-items:center;gap:5px;min-height:24px;padding:0 9px;border:1px solid #8a6a2a;border-radius:999px;background:#2a1f15e6;color:#f3e3bd;font-size:12.5px;white-space:nowrap}
.v101chip b{font:400 15px var(--display);color:var(--gold2)}
.v101chip.op{border-color:var(--oc)}.v101chip.op b{color:var(--oc)}
.v101chip.cls{border-color:var(--cc);color:#fff3d6;box-shadow:inset 3px 0 0 var(--cc)}
.v101sh{display:inline-flex;vertical-align:middle}.v101sh svg,.v101sh img{display:block}
.v101gr{display:inline-flex;align-items:center;gap:4px;justify-self:end;white-space:nowrap}
.v101gr b{display:inline-grid;place-items:center;min-width:26px;height:20px;padding:0 4px;border-radius:4px;background:linear-gradient(#4a3a1c,#2e2412);border:1px solid #c9a458;color:#f0cf7d;font:400 13px var(--display)}
.v101gr i{font:normal 12px var(--mono);color:var(--dim)}.v101gr.est b{border-style:dashed;opacity:.85}
/* plates */
.v101plts{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:7px;margin:4px 0 0}
.btn.v101plt{display:grid;grid-template-columns:36px minmax(0,1fr);gap:8px;align-items:center;text-align:left;min-height:52px;padding:6px 10px 6px 6px;margin:0;border:1px solid #6b5236;border-radius:8px;
  background:linear-gradient(135deg,#3a2a1a,#241a12);box-shadow:inset 0 1px 0 #ffffff12,0 2px 5px #0006;color:var(--bone);white-space:normal;transition:transform .12s,filter .12s}
.btn.v101plt:hover:not([disabled]){transform:translateY(-1px);filter:brightness(1.12)}
.btn.v101plt[disabled],.btn.v101plt[data-dis]{opacity:.5;filter:grayscale(.5)}
.btn.v101plt.on{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold),0 0 8px #d6ab4c44}
.v101pi{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:radial-gradient(circle at 50% 35%,#5a4430,#2a1d12);box-shadow:0 0 0 1.5px #c9a458,0 0 0 3px #3a1a0c;font-size:18px}
.v101pt{min-width:0;display:flex;flex-direction:column;gap:3px}.v101pt>b{font:400 15px/1.15 var(--display);color:#fff3d6;font-weight:400}
.v101pcs{display:block;font:11.5px/1.35 var(--body,inherit);color:#cbb593}
.v101pc+.v101pc::before{content:" · ";color:#8a7458}
.v101pc.cost{display:inline-block;color:#f0cf7d;font:12px var(--mono);border:1px solid #8a6a2a;border-radius:3px;padding:0 4px;margin-right:2px}.v101pc.cost+.v101pc::before{content:""}.v101pc img{height:12px;vertical-align:-2px}
.rm100ph .rc-sub{text-transform:none;letter-spacing:0;font:12px var(--body,inherit);color:var(--muted)}
/* tabula */
.v101tab .rm100wax select,.v101tab .rm100wax input{background:#1e170e;color:#f0cf7d;border:1px solid #8a6a3a;border-radius:4px}
.v101tab .rm100wax .bslip{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-family:Georgia,serif;color:#e8d6ae}
.v101tab .rm100wax .rc-sub{color:#c4ad88;font-family:Georgia,serif}
.v101tab .v101ta,.v101tab .rm100wax .acts.v101ta{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:9px;align-items:center}
.v101tab .v101ta .btn{flex:1 1 130px;min-height:40px}
.v101tab .traderes{margin:6px 0;padding:5px 8px;border-radius:4px;background:#ffffff10;font-family:Georgia,serif}
.v101tab .wagebox{background:#ffffff08;border:1px solid #8a6a3a55;border-radius:4px;padding:5px 8px;margin:4px 0;font-family:Georgia,serif}
/* the banner */
.v101ban{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center;min-height:132px;padding:12px 14px;margin:0 0 9px;overflow:hidden;border:1px solid #6b5236;border-radius:8px;
  box-shadow:inset 0 0 0 2px #e2c88e33,inset 0 0 0 3px #8a2a1a66,0 3px 10px #0008;background:#1a120d}
.v101ban .v101bimg{position:absolute;inset:0;z-index:0}.v101ban .v101bimg img{width:100%;height:100%;object-fit:cover}
.v101ban::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,#140c07e6 0,#140c07b0 45%,#140c0760 75%,#140c07c0 100%),linear-gradient(0deg,#140c0780,#0000 60%)}
.v101ban>*:not(.v101bimg){position:relative;z-index:2}
.v101por{width:92px;height:118px;background:radial-gradient(circle at 50% 35%,#5a4430,#2a1d12)}
.v101por>.portrait{position:absolute!important;inset:0;width:100%!important;height:100%!important;z-index:1}.v101por>.portrait svg{width:100%;height:100%}
.v101bt{min-width:0;display:flex;flex-direction:column;gap:3px}
.v101bn{display:flex;align-items:center;gap:9px;min-width:0}.v101bn b{font:400 27px/1.1 var(--display);text-shadow:0 2px 4px #000,0 0 12px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v101bs .rc-sub,.v101bs .v101adv{display:block;font-size:12.5px;color:#f3e3bd;text-shadow:0 1px 3px #000;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v101chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}
.v101chips .v101chip{flex-direction:row-reverse;justify-content:flex-end}
.v101bx{display:flex;flex-direction:column;align-items:flex-end;gap:7px}
.v101bx .gradebox{margin:0}.v101bx .tcbtn{margin:0}.v101bx>div:first-child{display:flex}
.v101bx .v101back{font-size:13px;white-space:nowrap}
/* team columns */
.v101cols{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,1fr);gap:9px;align-items:start}
.v101l,.v101r{display:flex;flex-direction:column;gap:8px;min-width:0}
.v101lh,.v101lr{display:grid;grid-template-columns:22px 26px minmax(0,1fr) 62px 40px 82px 44px minmax(64px,92px) 26px;gap:6px;align-items:center;padding:0 6px}
.v101lh{height:20px;font:500 9.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--dim);border-bottom:1px solid #4a3826;white-space:nowrap;overflow:hidden}
.v101rows{display:flex;flex-direction:column}
.v101lr{min-height:42px;border-top:1px solid #ffffff0a;font-size:13px}.v101lr:hover{background:#ffffff08}
.v101nm{min-width:0;display:flex;flex-direction:column}.v101nm b{font-weight:700}.v101nm small{font-size:11.5px;color:var(--muted)}
.v101n{font:12px var(--mono);text-align:right;color:var(--bone);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v101ct{font-size:11px;color:var(--dim)}
.v101fm{display:flex;gap:2px;flex-wrap:nowrap;overflow:hidden}
.v101fav{padding:0!important;border:0!important;background:none!important;font-size:15px;line-height:1;color:var(--dim)}
.v101cardb{width:24px;height:24px;border-radius:50%;border:1px solid #6b5236;background:#2a1f17;color:var(--gold2);cursor:pointer;font-size:12px;padding:0}
.v101cardb:hover{border-color:var(--gold)}
.v101trs{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px 12px}
.v101trt{display:grid;grid-template-columns:minmax(0,1fr) 56px 26px;gap:6px;align-items:center;font-size:12.5px}.v101trt b{font:12px var(--mono);text-align:right;color:var(--gold2)}
.v101led .news{max-height:200px}
.v101cor .v101opt{float:right;letter-spacing:.06em}
.v101cor .commsbody.v101cb{display:grid;grid-template-columns:58px minmax(0,1fr);gap:10px;align-items:center;padding:4px 0 6px}
.v101cor .commsbody .portrait{width:58px!important;height:72px!important;border-radius:6px;overflow:hidden;box-shadow:0 0 0 2px #e2c88e,0 0 0 3.5px #8a2a1a}
.v101cor .commsq{font:italic 14px/1.35 Georgia,serif;color:#e8d6ae;margin:3px 0 0}
.v101cor .opbar{height:8px;border-radius:4px;background:#3a2c1e;overflow:hidden;margin:4px 0 6px}.v101cor .opbar i{display:block;height:100%}
.v101cor .oplist{font-size:12.5px;line-height:1.55}
.v101env .v101plts{grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
/* the fighter card */
.card2.v101card{padding:8px;background:none;border:0;box-shadow:none}
.v101fh{position:relative;display:grid;grid-template-columns:100px minmax(0,1fr);grid-template-rows:auto auto;gap:6px 12px;padding:10px;border:1px solid #6b5236;border-radius:8px;overflow:hidden;
  background:linear-gradient(110deg,#2e2216 0,#1c140e 70%);box-shadow:inset 0 0 0 2px #e2c88e22,inset 0 0 0 3px #8a2a1a55,0 3px 8px #0007}
.v101fpor{grid-row:1/3;width:100px;height:138px;background:radial-gradient(circle at 50% 35%,#5a4430,#2a1d12)}
.v101fpor>.portrait{position:absolute!important;inset:0;width:100%!important;height:100%!important;z-index:1}.v101fpor>.portrait svg{width:100%;height:100%}
.v101fi{min-width:0}.v101fi>div>div:first-child{font:400 22px/1.15 var(--display)!important}
.v101fi .rc-sub{font-size:12.5px;line-height:1.4}
.v101fc{display:flex;flex-wrap:wrap;gap:5px;align-self:end}
.v101fb{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:8px;margin-top:8px;align-items:start}
.v101fb>section.v101s .sect{margin-top:8px}
.v101fb>.v101wide,.v101fb>.v101keep,.v101fb>section.v101s[data-v101s="top"]{grid-column:1/-1}
.v101fb .news{max-height:150px}
.v101fb .card2.carebox{background:#ffffff06}
.rm100keep.v101keep .acts{display:grid!important}
@media (max-width:600px){.v101ban{grid-template-columns:auto minmax(0,1fr);padding:10px}.v101bx{grid-column:1/-1;flex-direction:row;flex-wrap:wrap;justify-content:flex-start;align-items:center}
  .v101por{width:70px;height:92px}.v101bn b{font-size:21px}.v101cols{grid-template-columns:minmax(0,1fr)}
  .v101lh{display:none}.v101lr{grid-template-columns:22px 26px minmax(0,1fr) auto 26px;row-gap:2px;padding:4px 6px}
  .v101lr .v101n,.v101lr .v101fm{display:none}
  .v101plts{grid-template-columns:minmax(0,1fr)!important}.v101fb{grid-template-columns:minmax(0,1fr)}
  .v101fh{grid-template-columns:76px minmax(0,1fr)}.v101fpor{width:76px;height:104px}}
`;document.head.appendChild(st)}
/* the sandstone main buttons (306's generator, so its kill switch and Reduce motion rules apply) */
try{if(typeof sd100CSS==='function'){const st=document.createElement('style');st.id='v101csd';
  st.textContent=sd100CSS({pri:['#mgrBody .btn.v101pri'],sec:['#mgrBody .btn.v101sec'],dan:['#mgrBody .btn.v101dan'],m:[]});document.head.appendChild(st)}}catch(e){console.error(e)}

/* ============================== M39 · THE CITY SQUARE: 3D LANISTA + YARD, DOOR-SIZED FIGURES ============================== */
/* door89 records each painted door's height (z units) — the bake runs once per city/size */
{const base=door89;door89=function(g,F,s,w,hh){try{if(hh>0.3)V101C.doors.push(hh)}catch(e){}return base.apply(this,arguments)}}
{const base=bake89;bake89=function(){V101C.doors=[];const r=base.apply(this,arguments);try{v101DoorH()}catch(e){console.error(e)}return r}}
/* the figure height in city tiles: k × the median door (z → screen tiles via ZK89) */
function v101DoorH(){const D=V101C.doors.slice().sort((a,b)=>a-b);if(!D.length)return V101C.h;const med=D[Math.floor(D.length/2)];
  const h=Math.max(V101C.minH,Math.min(V101C.maxH,med*(typeof ZK89!=='undefined'?ZK89:0.55)*V101C.k));V101C.door=med;
  if(V101C.h!==h){V101C.h=h;try{if(typeof CR100C!=='undefined'){CR100C.box.clear()}V101C.box.clear()}catch(e){}}
  if(v101On()&&typeof CR100!=='undefined'){if(V101C.h0==null)V101C.h0=CR100.cityH;CR100.cityH=h}return h}
V101C.box=new Map();
function v101CityH(){return v101On()&&V101C.h?V101C.h:null}
/* scale factor vs 313's one-tile figure (shadows, flat fallbacks) */
const v101K=()=>{const h=v101CityH();return h?h/1:1};
{const base=figShadow89;figShadow89=function(c2,x,y,T,k){try{if(CITY.open&&v101CityH())k=(k||1)*Math.max(0.45,v101K()*1.05)}catch(e){}return base.call(this,c2,x,y,T,k)}}
/* a crowd-sheet figure in a box (bw × bh tiles, feet at fy tiles from the top) */
function v101Fig(src,o){if(typeof cr100Scale!=='function'||typeof cr100Sprite!=='function')return null;const T=CITY.TW;const M=cr100Scale(src.k);if(!M||!CR100.ready[src.k])return null;
  const fi=o.fi&3;const row=o.row&&M.r[o.row]?o.row:'stand';const cell=M.r[row]&&M.r[row][fi];const stand=M.r.stand&&(M.r.stand[fi]||M.r.stand[0]);if(!cell||!stand)return null;
  const H=v101CityH()||CR100.cityH||1;const s=T*H/Math.max(1,stand[5]-stand[7]);const dpr=window.devicePixelRatio||1;
  const key=src.k+'|'+row+'|'+fi+'|'+src.tint+'|'+Math.round(T*dpr)+'|'+o.bw+'|'+o.bh+'|'+H.toFixed(3);let c=V101C.box.get(key);if(c)return c;
  const bw=T*o.bw,bh=T*o.bh;c=document.createElement('canvas');c.width=Math.max(1,Math.round(bw*dpr));c.height=Math.max(1,Math.round(bh*dpr));const g=c.getContext('2d');
  const sp=cr100Sprite(src.k,row,fi,src.tint,s*dpr);if(!sp)return null;g.scale(dpr,dpr);g.drawImage(sp,bw/2-cell[4]*s,T*o.fy-cell[5]*s,cell[2]*s,cell[3]*s);
  V101C.box.set(key,c);while(V101C.box.size>160)V101C.box.delete(V101C.box.keys().next().value);V101C.stats.city++;return c}
/* a flat (svg) figure redrawn into its box at door size, feet kept */
function v101Flat(im,o,key){const T=CITY.TW;const k=v101K();if(k>=0.98)return im;const dpr=window.devicePixelRatio||1;const ck='flat|'+key+'|'+Math.round(T*dpr)+'|'+k.toFixed(3);let c=V101C.box.get(ck);if(c)return c;
  const bw=T*o.bw,bh=T*o.bh;c=document.createElement('canvas');c.width=Math.max(1,Math.round(bw*dpr));c.height=Math.max(1,Math.round(bh*dpr));const g=c.getContext('2d');g.scale(dpr,dpr);
  const w=bw*k,hh=bh*k;g.drawImage(im,bw/2-w/2,T*o.fy-(T*o.fy)*k,w,hh);V101C.box.set(ck,c);return c}
const V101_BOX={me:{bw:0.74,bh:1.26,fy:1.22},yd:{bw:0.66,bh:1.12,fy:1.10},fg:{bw:0.72,bh:1.22,fy:1.18}};
const v101Calm=()=>{try{return typeof city100Calm==='function'&&city100Calm()}catch(e){return false}};
/* which way a walker faces, and its frame */
function v101Pose(n,now){const moving=n&&n._dr!=null&&(Math.abs(n._dr-n.r)>0.002||Math.abs(n._dc-n.c)>0.002);let fi=n._v101f;
  if(moving){const dr=n.r-(n._fr!=null?n._fr:n.r),dc=n.c-(n._fc!=null?n._fc:n.c);if(dr||dc)fi=n._v101f=cr100Face(dc-dr,dc+dr)}if(fi==null)fi=n._v101f=3;
  return {fi,row:moving&&!v101Calm()?'walk'+(Math.floor(now/(CR100.walkMs||140))&3):'stand'}}
/* the lanista: his crowd look, tinted by his robe (the house colour in Manager) */
function v101Me(){const P=CITY.player;if(!P)return null;const lk=P.look||{};let look=0;try{look=cr100Look({id:P.name||'me',look:lk})}catch(e){}
  const robe=CITY.mgr&&typeof me==='function'&&me()?(me().color||lk.robe):lk.robe;const p=v101Pose(P,performance.now());
  return v101Fig({k:'s'+look,tint:cr100Tint(robe||'#7a2230')},{...V101_BOX.me,...p})}
/* the training yard: two sparring stand-ins (lunging = walk frames) and the doctore */
const V101Y={hero:{fi:3},soldier:{fi:3},doc:{fi:0}};
function v101cYard(key){const now=performance.now();const calm=v101Calm();
  if(key==='yddoc')return v101Fig({k:'s0',tint:cr100Tint('#6a3a22')},{...V101_BOX.yd,fi:0,row:'stand'});
  const cls=key.slice(2);const k='c_'+(CR100_CLS.includes(cls)?cls:'soldier');const ph=cls==='soldier'?Math.PI:0;
  const lunge=Math.sin(now/260+ph);const row=!calm&&lunge>0?'walk'+(Math.floor(now/(CR100.walkMs||140))&3):'stand';
  return v101Fig({k,tint:''},{...V101_BOX.yd,fi:3,row})}
function v101CityReady(){try{return typeof cr100CityReady==='function'&&cr100CityReady()}catch(e){return false}}
{const base=cityImg;cityImg=function(key,svg){try{if(v101On()&&CITY.open&&typeof key==='string'){
      if(key==='me'||key.startsWith('yd')){if(v101CityReady()){const c=key==='me'?v101Me():v101cYard(key);if(c)return c}
        const im=base.apply(this,arguments);return im&&v101CityH()?v101Flat(im,key==='me'?V101_BOX.me:V101_BOX.yd,key):im}
      if(key.startsWith('fg')){const im=base.apply(this,arguments);if(im&&!(im instanceof HTMLCanvasElement)&&v101CityH())return v101Flat(im,V101_BOX.fg,key);return im}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* placeholders: 172 then never builds the lanista's / the yard's svg every frame while we draw them */
{const base=cityDraw;cityDraw=function(){try{if(v101On()&&CITY.open&&CITY.imgs&&v101CityReady())for(const k of ['me','ydhero','ydsoldier','yddoc'])if(!CITY.imgs[k])CITY.imgs[k]={v101:1}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* the kill switch put back at runtime (tests): 313's own height */
function v101CitySet(on){try{if(on)localStorage.removeItem('flavius_v101coff');else localStorage.setItem('flavius_v101coff','1')}catch(e){}
  if(!on&&V101C.h0!=null&&typeof CR100!=='undefined')CR100.cityH=V101C.h0;else if(on)v101DoorH();V101C.box.clear();try{CR100C.box.clear()}catch(e){}}
