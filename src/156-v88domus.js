/* =====================================================================
   156-v88domus · v0.88 THE ONLINE DOMUS REDESIGN + IMMORTALIS (his picks, 2026-10-05)
   =====================================================================
   SHOWCASE + 4 • 🏛 Domus (ONL.tab 'char') is rebuilt from the screens the older modules draw (onlCharHTML chain: 116 editor,
     127 house card + rank bar, 128 sculpt bench, 137 Bring ticks / Storeroom / offerings / trophies, 149 shelf #sh87):
     – the house card stays on top (name, record, treasury, gifts chest, patron, tester);
     – THE STAGE `.st88`: the ACTIVE gladiator's player-board avatar (avatarFor73 + avatarSVG, 98-avatar73) wearing the armor he
       brings (ONLC.equipOf; named armor by its base art), TWO weapon slots to its LEFT as horizontal weapon cards `.wp88`
       (cardHTML 'w:'+key; the class's recruit weapons first, bought ones fill/replace like 112's giveLoadout; empty = dotted),
       and beside it name, class, rank, Glory, the record (bouts, wins, Ranked survived, lifetime CF) and the money:
       Purse `.mon88.purse` (his own coin — lost if he falls) and Treasury `.mon88.tre` (the house's 20% cut — outlives every
       gladiator, pays for anyone);
     – THE SLOTS `.sl88` (also .onl-gslots): 4 cards (ONLC.GLAD_MAX), a living one makes that gladiator active (data-onl="gact",
       116's char.active route; locked while one is in a game), an empty one = "+ New gladiator" (data-onl="gnew") → the creator
       opens as a POPUP over the Domus (`.cr88pop`, inside #onl so its own handlers work) — only while a slot is free;
     – ✎ the old editor (name, class, look, token, gear to bring) folds under the slots (`details#ged88`, always the active one);
     – TABS `.tb88` [data-tb88] store · offs · tro → panels `.tp88[data-tp88]`: 🗄 Storeroom (#sr82 with 149's #sh87 shelf),
       🧪 Offerings shelf (137's .of83-box moved out of #sr82), 🏆 Trophies (137's .tr83 moved out of the house card).
       The tab is remembered (V88D.tab + localStorage flavius_domtab88). Nothing in the Domus buys (buying = Armory & Market):
       any buy control that would land in it is stripped.
   IMMORTALIS • the top gladiator status (his name, 2026-10-05). Online: onlImmortalis88(ch) = alive, Invictus rank (ONLC.rankFor,
     never demoted) AND 25+ Ranked bouts survived (ch.survived counts only Ranked). Shown as `.imm88` — a gold double frame with
     laurel sprigs at the top corners (generic; the Manager reuses the class) — on the slot card, the stage and the profile line
     (onl83Profile's gladiator rows), plus the chip `.imm88c` "🌿 Immortalis" (stage, slot card, profile, the landing stage name).
   PHONES (≤600 px): stage = avatar beside the facts, the two weapon cards in a row under them; the slot row scrolls sideways;
     then the editor fold and the tabs.
   ===================================================================== */
const V88D={tab:(()=>{try{return localStorage.getItem('flavius_domtab88')||'store'}catch(e){return 'store'}})(),edOpen:false};
const IMM88_SURV=25;
function onlImmortalis88(ch){try{if(!ch||ch.alive===false)return false;return ONLC.rankFor(ch).k==='invictus'&&(ch.survived|0)>=IMM88_SURV}catch(e){return false}}
const imm88Chip=()=>`<span class="imm88c" title="${_T`Invictus with ${IMM88_SURV}+ Ranked bouts survived`}">${_T`🌿 Immortalis`}</span>`;

/* ---------------- the stage: what he wears and holds ---------------- */
function dom88Base(I){return I?(I.named?(I.w||{}).base:I.base)||'':''}
function dom88Armor(ch){const list=[];for(const k of ONLC.equipOf(ch)){let I=null;try{I=ONL83.piece(ch,k)}catch(e){}const b=dom88Base(I)||k;const A=ARM[b];if(!A||(I&&I.kind==='w'))continue;
    const L=A.slot==='head'?['head']:A.slot==='chest'||A.slot==='belt'?['chest']:A.slot==='arm'?(A.pair?['rarm','larm']:['rarm']):A.slot==='leg'?(A.pair?['rleg','lleg']:['rleg']):[];for(const l of L)list.push([b,l])}
  return list}
function dom88Hands(ch){const CK=CLASSES[ch.cls]||{};let R=CK.R&&W[CK.R]?{k:CK.R,kit:true}:null,L=CK.L&&W[CK.L]?{k:CK.L,kit:true}:null;
  for(const k of ONLC.equipOf(ch)){let I=null;try{I=ONL83.piece(ch,k)}catch(e){}if(!I||I.kind!=='w')continue;const b=dom88Base(I);if(!W[b])continue;const x={k:b,I};
    if(!R)R=x;else if(!L&&!(W[R.k]||{}).both)L=x;else R=x}
  return [R,L]}
function dom88Weapon(x,side){const lbl=side==='R'?_T('Right hand'):_T('Left hand');
  if(!x)return `<div class="wp88 empty"><div class="wp88-card"><span>${_T`Empty hand`}</span></div><small>${lbl}</small></div>`;
  const I=x.I;const named=I&&I.named;const R=named?ONLC.rarOf(I.rar):null;const col=named&&ONL83.rarCol?ONL83.rarCol[R.k]:'';
  const nm=named?(I.w&&I.w.n)||I.n:(W[x.k]||{}).n||x.k;
  const sty=col?`style="--rc:${col}"`:''; /* i18n:skip */
  return `<div class="wp88 ${named?'named':''}" ${sty} title="${esc2(nm)}"><div class="wp88-card">${typeof cardHTML==='function'?cardHTML('w:'+x.k,'md'):''}</div>
    <small>${lbl} · <b>${esc2(nm)}</b>${x.kit?_T(' <i>recruit kit</i>'):named?` <i>${esc2(R.n)}</i>`:''}</small></div>`}
function dom88Stage(ch){if(!ch)return `<div class="st88 none"><p class="rc-sub">${_T`No gladiator yet — choose an empty slot below to raise one.`}</p></div>`;
  let av='';try{av=avatarSVG(avatarFor73(dom88Armor(ch),'dom88_'+ch.id))}catch(e){console.error(e)}
  const [R,L]=dom88Hands(ch);const imm=onlImmortalis88(ch);const Rk=ONLC.rankFor(ch);const N=ONLC.nextRank(ch);const g=Math.round(ONLC.gloryOf(ch));const T=(ONL.domus||{}).treasury|0;
  const rec=[[_T('Bouts'),ch.bouts|0],[_T('Wins'),ch.wins|0],[_T('Survived'),ch.survived|0],[_T('Lifetime CF'),cfAmt87(ch.lifeCF|0)],[_T('Glory'),`✦ ${g}`]];
  return `<div class="st88 ${imm?'imm88':''}" data-st88="${esc2(ch.id)}">
    <div class="st88-wp">${dom88Weapon(R,'R')}${dom88Weapon(L,'L')}</div>
    <div class="av88" title="${_T`What ${esc2(ch.name)} wears into the next match`}">${av}</div>
    <div class="st88-info"><div class="st88-n">${esc2(ch.name)}</div>${imm?imm88Chip():''}
      <div class="st88-sub">${esc2((CLASSES[ch.cls]||{}).name||'')} · ${onlRankChip(Rk.k)}</div>
      <small class="rc-sub">${N?_T`Next: ${esc2(N.n)} at ${N.glory} Glory`:_T('The highest rank')}${Rk.k==='invictus'&&!imm?_T` · Immortalis at ${IMM88_SURV} Ranked bouts survived (${ch.survived|0})`:''}</small>
      <div class="st88-rec">${rec.map(([k,v])=>`<div><b>${v}</b><small>${k}</small></div>`).join('')}</div>
      <div class="st88-mon"><div class="mon88 purse">${_T`<small>Purse</small><b>${coinAmt87(ch.wallet|0)}</b><i>${esc2(ch.name)}’s own coin — lost at death</i>`}</div>
        <div class="mon88 tre">${_T`<small>Treasury</small><b>${coinAmt87(T)}</b><i>the house’s cut — outlives every gladiator, pays for anyone</i>`}</div></div>
      <small class="rc-sub st88-shop">${_T`Buying happens in 🛒 Armory &amp; Market.`}</small></div></div>`}

/* ---------------- the 4 slot cards ---------------- */
function dom88Slots(live,busy){const act=ONL.char&&ONL.char.id;const coin=c=>coinAmt87(c.wallet|0);
  const card=c=>{const on=c.id===act;const imm=onlImmortalis88(c);const cl=on?'act on':''; /* i18n:skip */
    return `<button type="button" class="onl-gslot sl88c ${cl} ${imm?'imm88':''}" data-onl="${on?'gpick':'gact'}" data-v="${esc2(c.id)}" ${!on&&busy?_T`disabled title="In a game — switch when it is over"`:''}>
      ${onlFig(c.cls,c.look,72)}<b>${esc2(c.name)}</b>${imm?imm88Chip():''}<small>${esc2((CLASSES[c.cls]||{}).name||'')} · ${onlRankChip(ONLC.rankFor(c).k)}</small><small>✦ ${Math.round(ONLC.gloryOf(c))} · ${coin(c)}</small>
      ${on?_T('<span class="badge gold">⚔ Active</span>'):`<span class="sl88-go">${_T`Make active`}</span>`}</button>`};
  const empty=Array.from({length:Math.max(0,ONLC.GLAD_MAX-live.length)},()=>`<button type="button" class="onl-gslot sl88c empty" data-onl="gnew">${_T`<span class="sl88-plus">＋</span><b>New gladiator</b><small>starts as a Tiro</small>`}</button>`).join('');
  return `<div class="onl-gslots sl88" role="list">${live.map(card).join('')}${empty}</div>`}

/* ---------------- the Domus, rebuilt ---------------- */
{const base=onlCharHTML;onlCharHTML=function(){const live=(typeof onl83Live==='function'?onl83Live():(ONL.chars||[]).filter(c=>c.alive));
  if(ONL.char&&live.some(c=>c.id===ONL.char.id)&&ONL.gsel!==ONL.char.id){ONL.gsel=ONL.char.id;ONL.ged=null}
  const h=base.apply(this,arguments);try{if(typeof h!=='string'||!h.includes('dom82-wrap'))return h;
    const T=document.createElement('template');T.innerHTML=h;const R=T.content;const main=R.querySelector('.dom82-main');if(!main)return h;
    const house=main.querySelector(':scope > .dom82');const tro=house&&house.querySelector('.tr83');if(tro)tro.remove();
    const sr=main.querySelector('#sr82');const offs=sr&&sr.querySelector('.of83-box');if(offs)offs.remove();
    /* buying never happens here */
    R.querySelectorAll('.buy83,[data-onl83="dbuy"],[data-onl82="buy"],[data-onl83="obuy"],[data-onl83="ubuy"]').forEach(e=>e.remove());
    const ged=main.querySelector('.onl-ged');const busyP=main.querySelector('.onl-busy');
    /* the fallen line (116: a .sect "The fallen" + its .rc-sub) */
    const fallen=[];for(const s of main.querySelectorAll(':scope > .sect'))if(s.nextElementSibling&&s.nextElementSibling.classList.contains('rc-sub')){fallen.push(s,s.nextElementSibling)}
    const busy=typeof onlBusy==='function'?onlBusy():null;const ch=ONL.char&&live.find(c=>c.id===ONL.char.id)?ONL.char:null;
    const tab=['store','offs','tro'].includes(V88D.tab)?V88D.tab:'store';
    const tb=(k,l)=>`<button type="button" role="tab" data-tb88="${k}" class="${tab===k?'on':''}" aria-selected="${tab===k}">${l}</button>`;
    const out=document.createElement('div');
    out.innerHTML=`${dom88Stage(ch)}${dom88Slots(live,busy)}<div class="fl88"></div>
      ${ged&&ch?`<details class="ged88" id="ged88" ${V88D.edOpen?'open':''}><summary>${_T`✎ Name, class, look &amp; gear to bring <small class="rc-sub">${esc2(ch.name)}</small>`}</summary><div class="ged88-in"></div></details>`:''}
      <div class="tb88" role="tablist">${tb('store',_T('🗄 Storeroom'))}${tb('offs',_T('🧪 Offerings shelf'))}${tb('tro',_T('🏆 Trophies'))}</div>
      <div class="tp88" data-tp88="store" ${tab==='store'?'':'hidden'}></div><div class="tp88" data-tp88="offs" ${tab==='offs'?'':'hidden'}></div><div class="tp88" data-tp88="tro" ${tab==='tro'?'':'hidden'}></div>`;
    const put=(sel,el)=>{const t=out.querySelector(sel);if(t&&el)t.appendChild(el)};
    if(busyP)out.querySelector('.fl88').appendChild(busyP);for(const f of fallen)out.querySelector('.fl88').appendChild(f);
    put('.ged88-in',ged);put('[data-tp88="store"]',sr);
    put('[data-tp88="offs"]',offs||Object.assign(document.createElement('p'),{className:'rc-sub',textContent:_T('No offerings yet — the Armory sells them.')}));
    put('[data-tp88="tro"]',tro||Object.assign(document.createElement('p'),{className:'rc-sub',textContent:_T('No trophies yet.')}));
    /* everything after the house card is replaced by the new layout */
    for(const el of [...main.children])if(el!==house)el.remove();
    while(out.firstChild)main.appendChild(out.firstChild);
    main.classList.add('dom88');return T.innerHTML}catch(e){console.error(e);return h}}}

/* tabs + the editor fold: no redraw, just show/hide */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-tb88]');if(!b)return;const k=b.dataset.tb88;V88D.tab=k;try{localStorage.setItem('flavius_domtab88',k)}catch(err){}
  const box=b.closest('.dom82-main')||document;for(const x of box.querySelectorAll('[data-tb88]')){x.classList.toggle('on',x===b);x.setAttribute('aria-selected',String(x===b))}
  for(const p of box.querySelectorAll('.tp88'))p.hidden=p.dataset.tp88!==k},true);
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.id==='ged88')V88D.edOpen=t.open},true);

/* "+ New gladiator" from the Domus: the creator as a popup over it, only while a slot is free */
{const base=onlHTML;onlHTML=function(){if(!(ONL.acct&&ONL.newGlad&&ONL.tab==='char'&&!ONL.needDomus&&!(typeof onlIsGuest82==='function'&&onlIsGuest82())))return base.apply(this,arguments);
  const live=(ONL.chars||[]).filter(c=>c.alive).length;if(live>=ONLC.GLAD_MAX){ONL.newGlad=false;ONL.creating=null;return base.apply(this,arguments)}
  ONL.newGlad=false;let h,c='';try{h=base.apply(this,arguments)}finally{ONL.newGlad=true}
  try{c=onlCreatorHTML()}catch(e){console.error(e)}
  return h+`<div class="cr88pop" role="dialog" aria-modal="true" aria-label="${_T`New gladiator`}"><div class="cr88box"><div class="cr88-h"><b>${_T`＋ A new gladiator for ${esc2(onlHouse82(onlMyDomus82()||''))}`}</b><button type="button" class="btn tksm" data-onl="nonew">${_T`✕ Back to the Domus`}</button></div>${c}</div></div>`}}
/* a click on the dim backdrop closes the popup */
document.addEventListener('click',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('cr88pop')){ONL.newGlad=false;ONL.creating=null;if(typeof onlRedraw==='function')onlRedraw()}});

/* ---------------- IMMORTALIS elsewhere: the landing stage name, the profile line ---------------- */
{const base=onlStageHTML;onlStageHTML=function(ch){let h=base.apply(this,arguments);try{if(ch&&onlImmortalis88(ch))h=h.replace(/(<div class="onl-pname)([^"]*)("[^>]*>[^<]*<\/div>)/,`$1$2 imm88n$3${imm88Chip()}`)}catch(e){}return h}}
if(typeof ONL83!=='undefined'&&typeof ONL83.profile==='function'){const base=ONL83.profile;ONL83.profile=async function(){const r=await base.apply(this,arguments);V88D.prof=r;return r}}
if(typeof onl83Profile==='function'){const base=onl83Profile;onl83Profile=async function(){V88D.prof=null;const r=await base.apply(this,arguments);try{const P=V88D.prof;const pop=document.querySelector('.pf83pop');
    if(P&&pop){const rows=[...pop.querySelectorAll('.pf83-g')];(P.glads||[]).forEach((g,i)=>{const el=rows[i];if(!el)return;
      if(onlImmortalis88({alive:true,rankK:g.rank,rank:g.rank,glory:g.glory,survived:g.survived})){el.classList.add('imm88');const b=el.querySelector('b');if(b)b.insertAdjacentHTML('afterend',imm88Chip())}})}}catch(e){console.error(e)}return r}}

/* ---------------- the look ---------------- */
{const st=document.createElement('style');st.id='dom88css';st.textContent=`
.imm88{position:relative;border:3px double #e2b64c!important;box-shadow:0 0 0 1px #5e4417,0 0 16px rgba(232,190,90,.38),inset 0 0 12px rgba(232,190,90,.12)!important}
.imm88::before,.imm88::after{content:'❦';position:absolute;top:-13px;font:18px/1 Georgia,serif;color:#e8c25a;text-shadow:0 1px 2px #000;pointer-events:none;z-index:2}
.imm88::before{left:6px;transform:scaleX(-1) rotate(-20deg)}.imm88::after{right:6px;transform:rotate(-20deg)}
.imm88c{display:inline-block;margin:2px 0;padding:1px 8px;border-radius:999px;font:700 11px Georgia,serif;letter-spacing:.06em;text-transform:uppercase;color:#2a1c06;background:linear-gradient(#f6dc8c,#c99a32);box-shadow:0 0 0 1px #7a5a1c;white-space:nowrap}
.dom88 .st88{display:grid;grid-template-columns:minmax(150px,200px) minmax(150px,220px) minmax(0,1fr);gap:14px;align-items:center;margin:12px 0;padding:14px;border:1px solid #6b5636;border-radius:14px;
  background:radial-gradient(ellipse at 45% 30%,rgba(232,201,106,.13),transparent 60%),linear-gradient(#241a10,#15100a)}
.dom88 .st88.none{display:block;text-align:center;padding:24px}
.st88-wp{display:grid;gap:10px}
.wp88{display:grid;gap:3px;justify-items:center;text-align:center}.wp88 small{font-size:11.5px;color:var(--muted);line-height:1.25}.wp88 small b{color:#eadbb8}.wp88 small i{color:#c9ad6a;font-style:normal}
.wp88-card{width:100%;aspect-ratio:600/416;border-radius:8px;overflow:hidden;display:grid;place-items:center;background:rgba(0,0,0,.25);box-shadow:0 4px 12px rgba(0,0,0,.45)}
.wp88-card>.cimg,.wp88-card>*{width:100%!important;height:100%!important;max-width:none!important;margin:0!important}
.wp88.named .wp88-card{box-shadow:0 0 0 2px var(--rc),0 4px 12px rgba(0,0,0,.45)}
.wp88.empty .wp88-card{border:2px dashed #7a6440;background:rgba(255,255,255,.02);box-shadow:none;color:var(--muted);font-size:12px}.wp88.empty .wp88-card>span{width:auto!important;height:auto!important}
.av88{display:grid;place-items:center;min-height:240px}.av88 svg{width:100%;max-width:200px;height:auto;max-height:330px;filter:drop-shadow(0 8px 14px rgba(0,0,0,.55))}
.st88-info{min-width:0;display:grid;gap:4px;align-content:start}.st88-n{font:700 24px Georgia,serif;color:var(--gold,#e8c96a);line-height:1.1;overflow-wrap:anywhere}
.st88-sub{font-size:13px;color:#eadbb8}.st88-info>.imm88c{justify-self:start}
.st88-rec{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:4px}.st88-rec>div{display:grid;justify-items:center;padding:6px 2px;border:1px solid #4a3a24;border-radius:8px;background:rgba(0,0,0,.2)}
.st88-rec b{font:700 15px Georgia,serif;color:#eadbb8;white-space:nowrap}.st88-rec small{font-size:10.5px;color:var(--muted);text-align:center}
.st88-mon{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}.mon88{display:grid;gap:1px;padding:7px 10px;border-radius:9px;border:1px solid #6b5636;background:rgba(0,0,0,.22)}
.mon88 small{font:700 11px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#cbb88f}.mon88 b{font:700 20px Georgia,serif;color:#f3d58a}.mon88 i{font-style:normal;font-size:11px;color:var(--muted);line-height:1.25}
.mon88.tre{border-color:#a8873e;background:rgba(232,201,106,.07)}.st88-shop{margin-top:2px}
.dom88 .sl88{display:grid;grid-template-columns:repeat(${ONLC.GLAD_MAX},minmax(0,1fr));gap:12px;margin:6px 0 12px;padding-top:12px}
.sl88c{position:relative;align-content:start;min-height:170px}.sl88c.act{border-color:var(--gold,#e8c96a);background:rgba(232,201,106,.09)}.sl88c:disabled{opacity:.6;cursor:not-allowed}
.sl88c:not(.act):not(.empty):not(:disabled):hover{border-color:#a8873e;transform:translateY(-1px)}.sl88-go{font-size:11px;color:#c9ad6a}.sl88-plus{font-size:30px;line-height:1}
.sl88c.empty{align-content:center}
.ged88{margin:4px 0 12px;border:1px solid #4a3a24;border-radius:10px;padding:6px 10px;background:rgba(255,255,255,.02)}.ged88>summary{cursor:pointer;font:700 14px Georgia,serif;color:#eadbb8;padding:4px 0}
.ged88-in{margin-top:8px}
.tb88{display:flex;gap:4px;border-bottom:1px solid #6b5636;margin:8px 0 10px;overflow-x:auto}.tb88 button{all:unset;cursor:pointer;padding:8px 14px;border:1px solid transparent;border-bottom:0;border-radius:9px 9px 0 0;font:700 14px Georgia,serif;color:var(--muted);white-space:nowrap}
.tb88 button.on{color:var(--gold,#e8c96a);border-color:#6b5636;background:linear-gradient(#2a1f13,#1a130c);margin-bottom:-1px}.tb88 button:focus-visible{outline:2px solid var(--gold,#e8c96a)}
.tp88[hidden]{display:none!important}.tp88 .of83-box,.tp88 .tr83{margin-top:0}
.imm88n{color:#f3d58a!important}
.cr88pop{position:fixed;inset:0;z-index:60;background:rgba(8,5,2,.72);display:grid;place-items:center;padding:16px}
.cr88box{width:min(980px,100%);max-height:calc(100vh - 32px);overflow:auto;border:1px solid #a8873e;border-radius:14px;background:linear-gradient(#241a10,#15100a);padding:12px 14px;box-shadow:0 20px 50px rgba(0,0,0,.7)}
.cr88-h{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:8px;font:700 16px Georgia,serif;color:var(--gold,#e8c96a)}
@media(max-width:900px){.dom88 .st88{grid-template-columns:minmax(120px,170px) minmax(0,1fr);grid-template-areas:"av info" "wp wp"}.dom88 .av88{grid-area:av}.dom88 .st88-info{grid-area:info}.dom88 .st88-wp{grid-area:wp;grid-template-columns:1fr 1fr}}
@media(max-width:600px){.dom88 .st88{padding:10px;gap:10px;grid-template-columns:110px minmax(0,1fr)}.av88{min-height:0}.av88 svg{max-height:230px}.st88-n{font-size:19px}
  .st88-rec{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}.st88-rec b{font-size:13px}.st88-mon{grid-template-columns:1fr;gap:6px}.mon88{padding:5px 8px}.mon88 b{font-size:17px}
  .dom88 .sl88{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;padding-bottom:6px;-webkit-overflow-scrolling:touch}.dom88 .sl88c{flex:0 0 140px;scroll-snap-align:start;min-height:160px}
  .tb88 button{padding:7px 10px;font-size:13px}.cr88pop{padding:0}.cr88box{max-height:100vh;border-radius:0}}`;document.head.appendChild(st)}
