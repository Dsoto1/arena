/* 300-v100pn — v1.0 wave 5a (his approved mock tools/plans/mock100/playnow.html + NOTES-playnow.md, answers A1–A5; the event card
   CAROUSEL = his V99 2b). Display + re-homing only: every control keeps its id / data-* hook / handler and CFG field.
   1 · PLAY NOW (Single event, 106 pnLayout75 → 187 pnTidy90 → 205 stands92 → 247 pn98 → this last setupBody wrapper pn100):
       (a) top bar: "Play Now" · the mode tabs · the date chip (Follow leaves it) · the upper-right group (summary · 🎲 · Begin Event as the
           SANDSTONE primary slab .sb100.pri = porphyry inlay + gold-leaf letters) · ✕;
       (b) "THE EVENT" panel replaces Where + What: the event CAROUSEL (cards [data-pnev] = 106's own click → #evSel change; ‹ › step to the
           neighbour; keyboard: arrows/Home/End move the focus, Enter/Space picks; the picked card slides to the centre, Reduce motion = a
           jump), then event card | the map (#mapbox, the city select #locSel, 🎲 #roll6/#roll12, class modifiers) | name, blurb and the
           ROUNDS TABLE (always open — A1a: Ⅰ/Ⅱ/Ⅲ, name + zone, PvE/PvP/CF/CA chips, struck when off, Ends when, reward), the record;
       (c) OPTIONS = one 3-column grid; its first row is FOLLOW THE SCHEDULE (A2a: a switch, CFG.follow100 — ON sets this week's event +
           city and LOCKS them: dashed 🔒 bar with Unlock, other cards greyed, map dimmed "🔒 <city> · this week", city select + dice off;
           🎲 Random event switches it off) + 📅 Season schedule (scheduleHTML, folds open in place); Time of day as Day/Night buttons over
           #oNight91; shorter labels (the full text stays as the tip); the city's class modifiers greyed when it has none;
       (d) WHO: 247's players column + seat cards + 🎟 Stands card, restyled.
   2 · HOT SEAT on the same page (51 hotSeatOpen; 106/247 skip it, so this wrapper runs pnLayout75 → pnTidy90 → stands92 → pn98 itself):
       "Hot Seat" + 🪑 ONE SCREEN, no mode tabs, a blue PASS THE DEVICE strip (Mandata face down, hold 👁 to peek; "Turn the board to each
       player" = SETTINGS.hsTurn90), the players' book (51's .hsbanner, kept whole: its 🗑 + datalist + 158's Begin check) folded under it,
       seats tagged 👤 PLAYER N / CPU with a blue outline on human seats. A3: in the match, each human turn (2+ humans) opens with a slim
       "👤 <name> — your turn" RIBBON sliding over the top bar for ~1.5 s (never over the board; Reduce motion = no slide).
   3 · SANDSTONE SUBMENUS (1c/1d, A4): the Play Now and Manager pop-ups (playNowMenu / managerMenu, same buttons + values incl. 247's
       🛡 Your Play Now Gladiators) are a carved tablet: engraved title, round stone ✕ stud (#mClose), a dark well of sandstone slabs, the
       main choice porphyry + gold, Back a small slab bottom-left. The menu behind steps back (dims 50%, blurs 3.5 px, scales 1.045, drops
       14 px; 320 ms in / 220 ms out; Reduce motion / Calm = dim only; phones = a bottom sheet with a grab handle, no blur) and its show
       pauses (288 mm100Covered) so nothing repaints under the blur.
   The .sb100 slab (primary / secondary / danger = carbon black) × sizes l/m/s is shared CSS for later screens.
   Kill switch localStorage flavius_pn100off=1 (247's layout, plain pop-ups, the old hot-seat page). Test tv100pn; shots tools/plans/pn100/. */
const PN100={off:false,ev:null,focus:false,sched:false,ribT:0};
try{PN100.off=localStorage.getItem('flavius_pn100off')==='1'}catch(e){}
const PN100_IC={
  swords:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 2l9.2 9.2-1.4 1.4L1.6 3.4 3 2zm18 0l1.4 1.4-7.1 7.1 2.1 2.1 1.4-1.4 1.4 1.4-2.1 2.1 2.8 2.8-1.4 1.4-2.8-2.8-2.1 2.1-1.4-1.4 1.4-1.4-2.1-2.1-2.1 2.1 1.4 1.4-1.4 1.4-2.1-2.1-2.8 2.8L4.6 20l2.8-2.8-2.1-2.1 1.4-1.4 1.4 1.4L21 2z"/></svg>',
  temple:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5L22 7v1.6H2V7l10-5.5zM4 10h2.4v8H4zm4.5 0h2.4v8H8.5zm4.6 0h2.4v8h-2.4zm4.5 0H20v8h-2.4zM2 19.5h20V22H2z"/></svg>',
  scroll:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h12a3 3 0 013 3v1h-3v12a3 3 0 01-3 3H5a3 3 0 01-3-3v-1h3V6a3 3 0 00-3-3zm2.5 5v1.6h7V8zm0 3.5v1.6h7v-1.6zm0 3.5v1.6h5V15z"/></svg>',
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3l15 9-15 9z"/></svg>',
  back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4L2 12l8 8v-5h12V9H10z"/></svg>',
  chest:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9a5 5 0 015-5h8a5 5 0 015 5v1H3zm0 3h7v2h4v-2h7v8H3z"/></svg>',
  shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/></svg>',
  plus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/></svg>'};
function pn100Calm(){try{return (typeof reduceMotion==='function'&&reduceMotion())||(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')}catch(e){return false}}
function pn100Fix(){try{return calNow()}catch(e){return null}}
/* is "Follow the schedule" on and still true? (the week can turn, a test can set #evSel) */
function pn100Follow(){const c=pn100Fix();const on=!!(CFG.follow100&&c&&c.fx&&c.fx.ev===CFG.ev&&c.fx.loc===CFG.loc);if(!on)CFG.follow100=false;return on}

/* ---- the rounds table (A1a) ---- */
function pn100Rounds(ev){if(!ev||!Array.isArray(ev.rounds)||!ev.rounds.length)return '';
  const K=[['pve','PvE'],['pvp','PvP'],['cf','CF'],['ca','CA']];
  const rows=ev.rounds.map((r,i)=>{const z=typeof ZONES!=='undefined'&&ZONES[r.zone]?ZONES[r.zone][1]-ZONES[r.zone][0]+1:13;
    const ch=K.map(([k,l])=>{const y=!!r[k];const info=typeof RULE_INFO!=='undefined'&&RULE_INFO[k];return `<span class="${y?'y':'n0'}" title="${esc(info?(y?info[2]:info[3]):l)}">${l}</span>`}).join('');
    const rw=r.reward||{};const rwt=[rw.win?_T`Winner ${cfAmt87('+'+rw.win)}`:'',rw.cards?_T`${rw.cards} cards`:'',rw.coin?coinAmt87(rw.coin):'',rw.cf?cfAmt87(rw.cf):''].filter(Boolean).join(' · ')||'—';
    const end=typeof END_TXT!=='undefined'&&END_TXT[r.end]||r.end||'';
    return `<div class="pn100rd" role="row"><span class="n" role="cell">${RN(i+1)}</span><span class="nm" role="cell"><b>${esc(r.n||'')}</b><span>${_T`Zone ${r.zone||1} · ${z}×${z}`}</span></span><span class="rch" role="cell">${ch}</span><span class="end" role="cell">⏱ ${esc(end)}</span><span class="rw" role="cell">${rwt}</span></div>`}).join('');
  return `<div class="pn100rounds" role="table" aria-label="${_T`Rounds`}"><div class="pn100rd hd" role="row"><span role="columnheader">#</span><span role="columnheader">${_T`Round`}</span><span role="columnheader">${_T`Rules`}</span><span role="columnheader">${_T`Ends when`}</span><span role="columnheader">${_T`Reward`}</span></div>${rows}</div>`}

/* ---- the event carousel (his 2b) ---- */
function pn100Carousel(keys,lock){
  /* a ring: the picked card sits in the middle with its neighbours on both sides (no empty ends) */
  const n=keys.length,si=Math.max(0,keys.indexOf(CFG.ev)),m=Math.floor(n/2);const ring=keys.map((_,i)=>keys[(si-m+i+n*2)%n]);
  const cards=ring.map(k=>{const E=EVENTS[k];const on=k===CFG.ev;const has=!E.custom&&typeof cardRef==='function'&&cardRef('e:'+k);const nm=(E.n||k).replace(/^Classic · /,'');
    return `<button type="button" class="pn-ev pn100c ${on?'on':''}${lock&&!on?' lk':''}" data-pnev="${k}" role="option" aria-selected="${on}" tabindex="${on?0:-1}" title="${esc(E.n)}"${lock&&!on?' aria-disabled="true"':''}>${has?`<span class="pn-evc pn100art" style="${cardStyle('e:'+k)}"></span>`:`<span class="pn-evc pn100art pn-cust">✦</span>`}<span class="pn-evn">${esc(nm)}</span></button>`}).join('');
  return `<div class="pn100car${lock?' lk':''}"><button type="button" class="pn100arr" data-pn100step="-1" aria-label="${_T`Previous event`}" ${lock?'disabled':''}>‹</button><div class="pn100trk" role="listbox" aria-label="${_T`Event`}" aria-orientation="horizontal">${cards}</div><button type="button" class="pn100arr" data-pn100step="1" aria-label="${_T`Next event`}" ${lock?'disabled':''}>›</button></div>`}

/* ---- the switch look (a real button, role=switch) ---- */
const pn100Sw=(on,attr,label)=>`<button type="button" class="pn100sw${on?' on':''}" role="switch" aria-checked="${on}" ${attr} aria-label="${esc(label)}"><i></i></button>`;
/* shorter option labels (the full wording stays as the tip) */
function pn100Short(lab,txt){if(!lab)return;const keep=[...lab.childNodes].filter(n=>n.nodeType===1&&(n.tagName==='INPUT'||n.tagName==='SELECT'));
  const full=lab.textContent.replace(/\s+/g,' ').trim();if(!lab.title)lab.title=full;lab.textContent='';keep.forEach(n=>lab.appendChild(n));lab.insertAdjacentHTML('beforeend',`<span>${txt}</span>`)}

function pn100(h){
  const T=document.createElement('template');T.innerHTML=h;const f=T.content;const wrap=f.querySelector('.pn75');if(!wrap||wrap.classList.contains('pn100'))return h;
  wrap.classList.add('pn100');const hot=!!CFG.hotseat;if(hot)wrap.classList.add('pn100hs');
  const E=EVENTS[CFG.ev]||{};const L=LOCATIONS[CFG.loc];const c=pn100Fix();const lock=pn100Follow();if(lock)wrap.classList.add('pn100lock');
  const Ln=L?L.n:'?';
  /* (a) the top bar */
  const top=wrap.querySelector('.pn-top');const hh=wrap.querySelector('.pn98h');
  if(hh){hh.textContent=hot?_T('Hot Seat'):_T('Play Now');if(hot)hh.insertAdjacentHTML('afterend',`<span class="pn100flag">${_T`🪑 ONE SCREEN`}</span>`)}
  const cal=wrap.querySelector('.pn-cal .calline');if(cal){cal.querySelectorAll('[data-calgo],.badge').forEach(x=>x.remove());cal.classList.add('pn100date')}
  const go=wrap.querySelector('#goBtn');if(go){go.className='sb100 pri m pn100go';go.innerHTML=`${PN100_IC.swords}<span class="t">${_T('Begin Event')}</span>`}
  const sum=wrap.querySelector('.pn98go .pn-sum');
  if(sum){const tk=sum.querySelector('.evtok,img');const seats=CFG.seats.slice(0,CFG.n);const hum=seats.filter(s=>!s.cpu).length;const you=seats.find(s=>!s.cpu);
    const tail=hot?(CFG.n-hum?_T`${hum} players · ${CFG.n-hum} CPU`:_T`${hum} players`):you?_T`You: <span class="gd">${esc((CLASSES[you.cls]||{}).name||you.cls)}</span>`:_T('watching');
    sum.innerHTML=`<span><b>${esc((E.n||'').replace(/^Classic · /,''))}</b> ${_T`at`} <b>${esc(Ln)}</b> · ${_T`${CFG.n} gladiators`} · ${tail}</span>`;if(tk)sum.insertAdjacentElement('afterbegin',tk);sum.setAttribute('title',sum.textContent.trim())}
  /* (b) THE EVENT panel */
  const evSel=wrap.querySelector('#evSel');const keys=evSel?[...evSel.querySelectorAll('option')].map(o=>o.value).filter(k=>EVENTS[k]):Object.keys(EVENTS).filter(k=>EVENTS[k]);
  const nCust=keys.filter(k=>EVENTS[k].custom).length;
  const panel=document.createElement('section');panel.className='pn-card pn100ev';
  panel.innerHTML=`<div class="pn100ttl"><b>${_T`The event`}</b><small>${_T`· where and what`}</small><span class="sp"></span><small>${nCust?_T`${keys.length-nCust} printed · ${nCust} of yours`:_T`${keys.length} printed`}</small></div>
    ${lock?`<div class="pn100lockbar" role="status">🔒 <span>${_T`<b>Following the schedule</b> — this week's event and city are set.`}</span><span class="sp"></span><button type="button" class="btn tksm" data-pn100follow="off">${_T`Unlock · switch off`}</button></div>`:''}
    ${pn100Carousel(keys,lock)}<div class="pn100what"><div class="pn100cardc"></div><div class="pn100map"></div><div class="pn100det"></div></div><div class="pn100sel" hidden></div>`;
  const frame=wrap.querySelector('.pn-frame');if(frame)panel.querySelector('.pn100cardc').appendChild(frame);
  const mapc=panel.querySelector('.pn100map');const mb=wrap.querySelector('#mapbox');
  if(mb){const rolls=[...mb.querySelectorAll('#roll6,#roll12')];const mr=mb.querySelector('.maprolls');if(mr)mr.remove();
    if(lock)mb.insertAdjacentHTML('beforeend',`<span class="pn100maplock">${_T`🔒 ${esc(Ln)} · this week`}</span>`);mapc.appendChild(mb);
    const row=document.createElement('div');row.className='pn100city';const ls=wrap.querySelector('#locSel');
    if(ls){const lab=ls.closest('label');ls.setAttribute('aria-label',_T('City'));if(lock)ls.setAttribute('disabled','');row.appendChild(ls);if(lab)lab.remove()}
    rolls.forEach(b=>{b.classList.add('pn100roll');b.textContent=b.id==='roll6'?_T('🎲 d6'):_T('🎲 d12');if(lock)b.setAttribute('disabled','');row.appendChild(b)});mapc.appendChild(row)}
  const li=wrap.querySelector('.pn-where .locinfo');
  if(li){const md=li.querySelector('.mods');const none=!(L&&(L.good||L.bad));const m=document.createElement('div');m.className='pn100mods';
    m.innerHTML=`<span>${_T`Class modifiers:`}</span>`;if(none)m.insertAdjacentHTML('beforeend',`<span class="pn100none">${_T`none in ${esc(Ln)}`}</span>`);else if(md)[...md.children].forEach(x=>m.appendChild(x));
    mapc.appendChild(m);const rm=li.querySelector('#rollmsg');if(rm)mapc.appendChild(rm)}
  const det=panel.querySelector('.pn100det');const evt=wrap.querySelector('.pn-evt');
  if(evt){det.appendChild(evt);const sm=evt.querySelector('small');if(sm)sm.insertAdjacentHTML('beforeend',` · ${E.min===E.max?_T`${E.min} gladiators`:_T`${E.min}–${E.max} gladiators`}`)}
  const desc=wrap.querySelector('.pn-desc');if(desc){desc.querySelectorAll('.rounds').forEach(x=>x.remove());det.appendChild(desc)}
  det.insertAdjacentHTML('beforeend',pn100Rounds(E));const rec=wrap.querySelector('.pn-rec');if(rec)det.appendChild(rec);
  const evLab=evSel&&(evSel.closest('label')||evSel);if(evLab)panel.querySelector('.pn100sel').appendChild(evLab);
  /* (c) OPTIONS */
  const ow=wrap.querySelector('.pn-optw90');const opts=ow&&ow.querySelector('.opts');
  const onN=ow&&ow.querySelector('summary .rc-sub')?ow.querySelector('summary .rc-sub').textContent.trim():'';
  const op=document.createElement('section');op.className='pn-card pn100opt';
  const fx=c&&c.fx;const fxTxt=fx?_T`<b>${esc((EVENTS[fx.ev]||{}).n||fx.ev)}</b> in <b>${esc((LOCATIONS[fx.loc]||{}).n||'?')}</b>`:'';
  op.innerHTML=`<div class="pn100ttl"><b>${_T`⚙ Options`}</b><small>${onN?'· '+esc(onN):''}</small></div>
    <div class="pn100follow${lock?' on':''}">${pn100Sw(lock,`data-pn100follow="${lock?'off':'on'}"`,_T('Follow the schedule'))}<span class="t">${lock?_T`<b>Follow the schedule</b> — 🔒 event and city locked to this week: ${fxTxt}. Switch off to pick any.`:_T`<b>Follow the schedule</b> — this week: ${fxTxt}. Switch on to lock the event and city to it.`}</span><button type="button" class="btn tksm" data-pn100sched aria-expanded="${!!PN100.sched}">${_T`📅 Season schedule`}</button></div>
    <div class="pn100schedp" ${PN100.sched?'':'hidden'}>${c&&typeof scheduleHTML==='function'?scheduleHTML(c.season,c.week):''}</div><div class="pn100optg"></div>`;
  const g=op.querySelector('.pn100optg');
  if(opts){[...opts.children].forEach(x=>{if(x.tagName==='LABEL'||x.tagName==='DIV'||x.tagName==='DETAILS')g.appendChild(x)});
    const tip=ow.querySelector('p.rc-sub');if(tip){tip.classList.add('pn100tip');g.appendChild(tip)}
    const lab=id=>{const i=g.querySelector('#'+id);return i&&i.closest('label')};
    pn100Short(lab('oCarmina'),_T('Carmina Fescennina first'));pn100Short(lab('oOpt'),_T('Optional offerings in the Blessings bag'));pn100Short(lab('oEagle'),_T('Golden Eagle among the 12 Blessings'));
    pn100Short(lab('oZora'),_T('Zora in the arena deck'));
    const mods=lab('oMods');if(mods){const none=!(L&&(L.good||L.bad));pn100Short(mods,none?_T`${esc(Ln)}'s class modifiers (none)`:_T`${esc(Ln)}'s class modifiers`);if(none)mods.classList.add('pn100dim')}
    const nl=g.querySelector('label.nt91o');const ns=nl&&nl.querySelector('#oNight91');
    if(ns){const nt=ns.value==='night';ns.classList.add('pn100hid');ns.setAttribute('tabindex','-1');ns.setAttribute('aria-hidden','true');
      nl.insertAdjacentHTML('beforeend',`<span class="seg pn100seg" role="group" aria-label="${_T`Time of day`}"><button type="button" class="${nt?'':'on'}" data-pn100night="day" aria-pressed="${!nt}">${_T`☀ Day`}</button><button type="button" class="${nt?'on':''}" data-pn100night="night" aria-pressed="${nt}">${_T`☾ Night`}</button></span>`)}}
  /* place the panels: top bar · [pass] · the event · options · who · the rest */
  const bands=wrap.querySelector('.pn-bands');const who=wrap.querySelector('.pn-who');
  if(bands){bands.before(panel);panel.after(op);bands.remove()}else if(top){top.after(panel);panel.after(op)}
  if(ow)ow.remove();
  if(who){const wl=who.querySelector('.pn-lbl');if(wl&&wl.firstChild&&wl.firstChild.nodeType===3)wl.firstChild.textContent=_T('Who · the gladiators')}
  /* (2) the hot seat */
  if(hot){const hb=f.querySelector('.hsbanner');const pass=document.createElement('div');pass.className='pn100pass';
    const hs=!!(typeof SETTINGS!=='undefined'&&SETTINGS.hsTurn90);
    pass.innerHTML=`<span class="ic" aria-hidden="true">🔁</span><span class="tx">${_T`<b>Pass the device.</b> Each player takes their turn on this screen, then hands it on.`}<small>${_T`Your Mandata stay face down — hold 👁 to peek. Each human turn opens with a short "your turn" ribbon over the top bar.`}</small></span><span class="sp"></span><label class="pn100hst">${_T`Turn the board to each player`} ${pn100Sw(hs,'data-pn100hst',_T('Turn the board to each player'))}</label>`;
    if(top)top.after(pass);
    if(hb){const n=(typeof HS_PROFILES!=='undefined'&&HS_PROFILES.length)||0;const d=document.createElement('details');d.className='pn100prof';if(PN100.prof)d.setAttribute('open','');
      d.innerHTML=`<summary>${_T`🪑 Players on this device`} <span class="rc-sub">· ${n}</span></summary>`;d.appendChild(hb);pass.after(d)}
    const seatEls=who?[...who.querySelectorAll('.seats>.seat:not(.stands92)')]:[];
    seatEls.forEach((el,i)=>{const s=CFG.seats[i];if(!s)return;const hum=!s.cpu;el.classList.add(hum?'pn100hum':'pn100cpu');
      el.insertAdjacentHTML('afterbegin',`<span class="pn100tag ${hum?'hum':'cpu'}">${hum?_T`👤 PLAYER ${i+1}`:_T('CPU')}</span>`)});
    const me=who&&who.querySelector('.stands92 .st92me');if(me)me.remove()}
  return T.innerHTML}

/* the hot seat goes through the Play Now layout first (106/108/247 skip it on purpose) */
function pn100Hot(h){let x=h;if(typeof pnLayout75==='function')x=pnLayout75(x);if(x.indexOf('pn75')<0)return h;if(typeof pnTidy90==='function')x=pnTidy90(x);if(typeof stands92==='function')x=stands92(x);if(typeof pn98==='function')x=pn98(x);return x}
{const base=setupBody;setupBody=function(){const h=base.apply(this,arguments);try{if(PN100.off||typeof CFG==='undefined'||CFG.mode!=='event'||typeof h!=='string')return h;
  const x=CFG.hotseat?pn100Hot(h):h;if(x.indexOf('pn98')<0)return h;return pn100(x)}catch(e){console.error(e);return h}}}
/* 🎲 Random event: an explicit pick — Follow the schedule switches off first */
{const base=pnRand90;pnRand90=function(){CFG.follow100=false;
  /* the hot seat keeps its table: who plays and their names stay, only the event, city and classes roll */
  const keep=CFG.hotseat?CFG.seats.map(s=>({cpu:s.cpu,hsName:s.hsName})):null;const r=base.apply(this,arguments);
  if(keep){CFG.seats.forEach((s,i)=>{if(keep[i]){s.cpu=keep[i].cpu;s.hsName=keep[i].hsName}});pn100Redraw()}return r}}

/* ---- after the setup lands: centre the picked card (a slide from where the strip was), restore keyboard focus ---- */
function pn100Ctr(trk,el){const a=trk.getBoundingClientRect(),b=el.getBoundingClientRect();return Math.max(0,trk.scrollLeft+(b.left-a.left)+b.width/2-trk.clientWidth/2)}
function pn100Mount(){const trk=document.querySelector('#mBody .pn100 .pn100trk');if(!trk)return;const sel=trk.querySelector('.pn100c.on');if(!sel)return;
  const target=pn100Ctr(trk,sel);const calm=pn100Calm();
  /* the slide: start where the old ring stood (the picked card d steps away), then glide to the centre */
  const L=[...trk.querySelectorAll('.pn100c')].map(b=>b.dataset.pnev);const n=L.length;const a=L.indexOf(PN100.ev),b=L.indexOf(CFG.ev);
  let d=a<0||b<0?0:b-a;if(d>n/2)d-=n;if(d<-n/2)d+=n;const step=(sel.nextElementSibling||sel.previousElementSibling||sel).offsetWidth+10;
  trk.scrollLeft=target;if(d&&!calm){trk.scrollLeft=Math.max(0,target-d*step);trk.scrollTo({left:target,behavior:'smooth'})}
    PN100.ev=CFG.ev;if(PN100.focus){PN100.focus=false;try{sel.focus({preventScroll:true})}catch(e){}}}
{const mb=document.getElementById('mBody');if(mb)new MutationObserver(()=>{if(!PN100.off&&mb.querySelector(':scope>.pn100'))pn100Mount()}).observe(mb,{childList:true})}
function pn100Toast(){if(typeof mToast==='function')mToast(_T('🔒 Following the schedule — switch it off to pick any event or city.'))}
function pn100Pick(k){const s=document.getElementById('evSel');if(!s||!EVENTS[k])return;s.value=k;s.dispatchEvent(new Event('change',{bubbles:true}))}
function pn100Redraw(){if(typeof pnRedraw75==='function')pnRedraw75()}
/* clicks: the lock first (window capture — before 106's document-capture [data-pnev] and 08's map), then the new controls */
window.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||PN100.off)return;const root=t.closest('#mBody .pn100');if(!root)return;
  const inCar=t.closest('.pn100trk');if(inCar||t.closest('[data-pn100step]'))PN100.focus=!!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.pn100car'));
  if(CFG.follow100){const blocked=t.closest('.pn100c:not(.on)')||t.closest('[data-pn100step]')||t.closest('#roll6,#roll12')||(t.closest('#mapbox')&&!t.closest('.pn100maplock'));
    if(blocked){e.preventDefault();e.stopPropagation();pn100Toast();return}}
  const st=t.closest('[data-pn100step]');if(st){e.preventDefault();e.stopPropagation();const L=[...root.querySelectorAll('.pn100c[data-pnev]')].map(b=>b.dataset.pnev);const i=L.indexOf(CFG.ev);if(i<0||!L.length)return;
    pn100Pick(L[(i+(+st.dataset.pn100step)+L.length)%L.length]);return}
  const fo=t.closest('[data-pn100follow]');if(fo){e.preventDefault();e.stopPropagation();
    if(fo.dataset.pn100follow==='on'){const c=pn100Fix();if(!c||!c.fx||!EVENTS[c.fx.ev])return;CFG.follow100=true;CFG.loc=c.fx.loc;CFG.ev=c.fx.ev;const E=EVENTS[CFG.ev];CFG.n=clamp(CFG.n,E.min,E.max);if(typeof SEATS89!=='undefined')SEATS89.off=true}
    else CFG.follow100=false;
    pn100Redraw();setTimeout(()=>{const b=document.querySelector('#mBody .pn100 .pn100follow [data-pn100follow]');if(b&&fo.closest('.pn100follow'))try{b.focus({preventScroll:true})}catch(err){}},0);return}
  const sc=t.closest('[data-pn100sched]');if(sc){e.preventDefault();PN100.sched=!PN100.sched;sc.setAttribute('aria-expanded',String(PN100.sched));const p=root.querySelector('.pn100schedp');if(p)p.hidden=!PN100.sched;return}
  const nb=t.closest('[data-pn100night]');if(nb){e.preventDefault();const s=root.querySelector('#oNight91');if(!s)return;s.value=nb.dataset.pn100night;s.dispatchEvent(new Event('change',{bubbles:true}));
    nb.parentElement.querySelectorAll('[data-pn100night]').forEach(x=>{const on=x===nb;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});return}
  const hs=t.closest('[data-pn100hst]');if(hs){e.preventDefault();if(typeof SETTINGS==='undefined')return;SETTINGS.hsTurn90=!SETTINGS.hsTurn90;try{applySettings()}catch(err){}
    hs.classList.toggle('on',!!SETTINGS.hsTurn90);hs.setAttribute('aria-checked',String(!!SETTINGS.hsTurn90));return}},true);
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.classList&&d.classList.contains('pn100prof'))PN100.prof=d.open},true);
/* 🎲's hover text opens on hover, and on keyboard focus only after a Tab (a window that lands with the focus on it stays quiet) */
addEventListener('keydown',e=>{if(e.key==='Tab')document.body.classList.add('kb100')},true);
addEventListener('pointerdown',()=>{document.body.classList.remove('kb100')},true);
/* keyboard: arrows / Home / End walk the cards (roving focus), Enter / Space pick (the button's own click) */
document.addEventListener('keydown',e=>{const t=e.target;if(PN100.off||!t||!t.closest)return;const trk=t.closest('#mBody .pn100trk');if(!trk)return;
  const L=[...trk.querySelectorAll('.pn100c')];const i=L.indexOf(t.closest('.pn100c'));if(i<0)return;let j=-1;
  if(e.key==='ArrowRight'||e.key==='ArrowDown')j=Math.min(L.length-1,i+1);else if(e.key==='ArrowLeft'||e.key==='ArrowUp')j=Math.max(0,i-1);else if(e.key==='Home')j=0;else if(e.key==='End')j=L.length-1;else return;
  e.preventDefault();e.stopPropagation();const n=L[j];L.forEach(x=>x.tabIndex=x===n?0:-1);try{n.focus({preventScroll:true})}catch(err){}
  const target=pn100Ctr(trk,n);trk.scrollTo({left:target,behavior:pn100Calm()?'auto':'smooth'})},true);

/* ---- 2 · the hot-seat "your turn" ribbon (A3) ---- */
function hs100Rib(p){if(HEADLESS||PN100.off||!p||typeof document==='undefined')return;const bar=document.querySelector('header.bar');if(!bar)return;
  let el=document.getElementById('hs100rib');if(!el){el=document.createElement('div');el.id='hs100rib';el.setAttribute('role','status');el.setAttribute('aria-live','polite');bar.appendChild(el)}
  let who=p.name;try{const P=typeof hsProf==='function'&&p.pid?hsProf(p.pid):null;if(P)who=P.name}catch(e){}
  el.style.setProperty('--pc',p.color||'#7fc2e8');el.innerHTML=`<span>${_T`👤 ${esc(who)} — your turn`}</span><small>${esc(who!==p.name?p.name+' · ':'')}${esc((CLASSES[p.cls]||{}).name||'')}</small><i></i>`;
  el.classList.toggle('calm',pn100Calm());el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(PN100.ribT);PN100.ribT=setTimeout(()=>el.classList.remove('show'),1500)}
if(typeof BUS!=='undefined')BUS.on('turn.begin',d=>{try{if(PN100.off||!d||d.cpu||d.sim||!S||!S.hotseat||S.over||S.sim||S.snap)return;const p=S.players.find(x=>x.id===d.id);if(!p||p.cpu)return;
  const hum=S.players.filter(q=>!q.cpu&&q.alive&&!q.exited).length;if(hum<2)return;hs100Rib(p)}catch(e){}});

/* ---- 3 · the sandstone submenus (1c / 1d) ---- */
const SAND100=[];
function sand100Titles(){if(!SAND100.length)SAND100.push(_T('⚔️ Play now'),_T('💼 Manager mode'));return SAND100}
function sand100Off(){const m=document.getElementById('modal');if(m)m.classList.remove('sand100');document.body.classList.remove('sub100','sub100calm')}
function sand100Icon(txt){if(/^⚔/.test(txt))return PN100_IC.swords;if(/^📂/.test(txt))return PN100_IC.chest;if(/^🗂/.test(txt))return PN100_IC.scroll;if(/^🛡/.test(txt))return PN100_IC.shield;if(/^▶/.test(txt))return PN100_IC.play;if(/^✚/.test(txt))return PN100_IC.plus;return ''}
function sand100Dress(title){const m=document.getElementById('modal'),box=document.getElementById('mboxEl'),bt=document.getElementById('mBtns');if(!m||!box||!bt)return;
  m.classList.add('sand100');document.body.classList.add('sub100');document.body.classList.toggle('sub100calm',pn100Calm());
  const mt=document.getElementById('mTitle');const mgr=title===sand100Titles()[1];
  if(mt)mt.innerHTML=`${mgr?PN100_IC.temple:PN100_IC.swords}<span>${mgr?_T('Manager Mode'):_T('Play Now')}</span>`;
  if(!box.querySelector('.grab100'))box.insertAdjacentHTML('afterbegin','<span class="grab100" aria-hidden="true"></span>');
  const B=[...bt.querySelectorAll('button[data-mi]')];let pair=0;
  B.forEach(b=>{const sm=b.querySelector('small');const smT=sm?sm.innerHTML:'';if(sm)sm.remove();const raw=b.textContent.trim();
    const back=!b.classList.contains('primary')&&!smT&&B.indexOf(b)===B.length-1;
    if(back){b.className='sb100 s sand100back';b.innerHTML=`${PN100_IC.back}<span>${esc(raw)}</span>`;return}
    const ic=sand100Icon(raw);const txt=raw.replace(/^(⚔️|⚔|📂|🗂|🛡|▶|✚)\s*/u,'');const pri=b.classList.contains('primary');
    b.className='sb100';if(pri)b.classList.add('pri','primary');if(b.disabled)b.classList.add('dis');
    if(!pri&&pair<2&&(/^📂|^🗂/.test(raw))){b.classList.add('half');pair++}
    b.innerHTML=`${ic}<span class="lab"><span class="t">${esc(txt)}</span>${smT?`<small>${smT}</small>`:''}</span>`});
  let ft=box.querySelector('.sand100ft');if(ft)ft.remove();const back=bt.querySelector('.sand100back');
  if(back){ft=document.createElement('div');ft.className='sand100ft';ft.appendChild(back);ft.insertAdjacentHTML('beforeend',`<span class="seal">${_T`ESC · BACK`}</span>`);bt.after(ft)}}
{const base=modal;modal=function(title,body,buttons,opt){
  if(PN100.off||HEADLESS)return base.apply(this,arguments);
  const o=Object.assign({},opt||{});const on0=o.onOpen;const sand=sand100Titles().includes(title);
  o.onOpen=function(done){try{if(sand)sand100Dress(title);else{sand100Off();const box=document.getElementById('mboxEl');if(box){const g=box.querySelector('.grab100');if(g)g.remove();const ft=box.querySelector('.sand100ft');if(ft)ft.remove()}}}catch(e){console.error(e)}
    if(on0)return on0.apply(this,arguments)};
  const p=base.call(this,title,body,buttons,o);
  if(sand&&p&&p.then)p.then(()=>{setTimeout(()=>{const m=document.getElementById('modal');if(!m||m.hidden||!CUR_MODAL)sand100Off()},0)},()=>{});
  return p}}
/* the menu show stands still under the tablet (nothing repaints under the blur) */
if(typeof mm100Covered==='function'){const base=mm100Covered;mm100Covered=function(){if(base.apply(this,arguments))return true;const m=document.getElementById('modal'),mm=document.getElementById('mainMenu');return !PN100.off&&!!(m&&!m.hidden&&m.classList.contains('sand100')&&mm&&!mm.hidden)}}

(()=>{const st=document.createElement('style');st.textContent=`
/* ---------- the sandstone slab (2a): primary porphyry + gold leaf, secondary sandstone, danger carbon black ---------- */
.sb100{--h:46px;--fs:19px;position:relative;height:var(--h);display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:0 22px;border:0;border-radius:5px;cursor:pointer;white-space:nowrap;isolation:isolate;
  font:400 var(--fs)/1 var(--display);letter-spacing:.07em;color:#4a3017;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 .32 0 0 0 0 .22 0 0 0 0 .1 0 0 0 .8 0'/%3E%3C/filter%3E%3Crect width='240' height='120' filter='url(%23n)'/%3E%3C/svg%3E"),linear-gradient(176deg,#dcc196 0%,#c9a877 38%,#b48f5c 100%);
  background-size:240px 120px,100% 100%;
  box-shadow:inset 0 2px 0 rgba(255,244,214,.75),inset 0 -3px 0 rgba(92,60,28,.55),inset 2px 0 0 rgba(255,238,204,.35),inset -2px 0 0 rgba(80,52,24,.4),0 4px 0 #6b4e2b,0 5px 0 #4b3519,0 10px 18px rgba(0,0,0,.6);
  text-shadow:0 1px 0 rgba(255,240,206,.75),0 -1px 0 rgba(60,36,14,.6);transition:transform .12s,box-shadow .12s,filter .12s}
.sb100::before{content:"";position:absolute;inset:5px;border-radius:3px;border:1px solid rgba(96,64,30,.45);box-shadow:0 1px 0 rgba(255,238,204,.45),inset 0 1px 0 rgba(255,238,204,.35);pointer-events:none;z-index:-1}
.sb100::after{content:"";position:absolute;inset:0;border-radius:5px;pointer-events:none;background:linear-gradient(180deg,rgba(255,246,222,.2),transparent 38%,rgba(60,36,14,.16)),radial-gradient(ellipse 120% 160% at 50% 50%,transparent 60%,rgba(70,44,18,.28))}
.sb100>*{position:relative;z-index:1}
.sb100 svg{width:calc(var(--fs) + 2px);height:calc(var(--fs) + 2px);fill:#4a3017;flex:none;filter:drop-shadow(0 1px 0 rgba(255,240,206,.7))}
.sb100 small{font:500 11.5px var(--body,inherit);letter-spacing:.03em;color:#5a3d1e;text-shadow:0 1px 0 rgba(255,240,206,.6)}
.sb100:hover,.sb100:focus-visible{transform:translateY(-2px);filter:brightness(1.06);outline:none;box-shadow:inset 0 2px 0 rgba(255,244,214,.75),inset 0 -3px 0 rgba(92,60,28,.55),0 6px 0 #6b4e2b,0 7px 0 #4b3519,0 14px 24px rgba(0,0,0,.7),0 0 0 2px rgba(240,207,125,.75),0 0 20px rgba(240,190,90,.28)}
.sb100:active{transform:translateY(3px);filter:brightness(.94);box-shadow:inset 0 3px 6px rgba(60,36,14,.45),inset 0 -1px 0 rgba(255,238,204,.3),0 1px 0 #6b4e2b,0 2px 0 #4b3519,0 3px 6px rgba(0,0,0,.6)}
.sb100.dis,.sb100:disabled{filter:grayscale(.6) brightness(.62);cursor:not-allowed;transform:none;box-shadow:inset 0 2px 0 rgba(255,244,214,.4),0 3px 0 #4b3519}
.sb100.pri::before{inset:6px;border:0;background:linear-gradient(180deg,#8f2a1e,#6d1c13 60%,#5a160f);box-shadow:inset 0 2px 4px rgba(0,0,0,.6),inset 0 -1px 0 rgba(255,180,150,.25),0 1px 0 rgba(255,238,204,.55)}
.sb100.pri .t,.sb100.dan .t{background:linear-gradient(180deg,#fff2be 0%,#f0cf7d 30%,#b98a2a 62%,#e7c46c 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 1px 0 rgba(60,20,8,.85));padding:2px 0}
.sb100.pri svg{fill:#f0cf7d;filter:drop-shadow(0 1px 0 rgba(60,20,8,.85))}
.sb100.pri small{color:#f3d9a8;text-shadow:0 1px 0 #3a0e08}
.sb100.pri:active::before{box-shadow:inset 0 4px 8px rgba(0,0,0,.75)}
.sb100.dan{color:#e0654c;text-shadow:none;background:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 2px,transparent 2px 4px),repeating-linear-gradient(-45deg,rgba(0,0,0,.35) 0 2px,transparent 2px 4px),linear-gradient(178deg,#26262a 0%,#151517 45%,#0b0b0c 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -2px 0 rgba(0,0,0,.8),0 4px 0 #050505,0 5px 0 #000,0 10px 18px rgba(0,0,0,.7)}
.sb100.dan::before{inset:5px;border:1px solid rgba(224,101,76,.28);background:none}
.sb100.dan .t{background:linear-gradient(180deg,#ffd9c4,#e8805f 40%,#c8402e 70%,#e7c46c 100%);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 1px 0 #000)}
.sb100.dan svg{fill:#e0654c}
.sb100.dan:hover,.sb100.dan:focus-visible{box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 6px 0 #050505,0 7px 0 #000,0 14px 24px rgba(0,0,0,.75),0 0 0 2px rgba(224,101,76,.55),0 0 20px rgba(224,101,76,.25)}
.sb100.l{--h:58px;--fs:24px;padding:0 30px}.sb100.m{--h:46px;--fs:19px}.sb100.s{--h:34px;--fs:14.5px;padding:0 14px;gap:7px}.sb100.s::before{inset:4px}
body.calm .sb100,body.calm .sb100:hover{transition:none}
/* ---------- 1 · Play Now ---------- */
.pn100{gap:12px}
.pn100 .pn-top{align-items:center;gap:12px}
.pn100flag{flex:none;font:500 11px var(--mono);letter-spacing:.1em;padding:3px 8px;border-radius:4px;border:1px solid var(--gold);color:var(--gold2);background:#3a2a18;white-space:nowrap}
.pn100 .pn100date{display:flex;align-items:center;gap:7px;border:1px solid var(--line2);border-radius:6px;padding:5px 10px;background:var(--panel2,#1a130e);font-size:14px}
.pn100 .pn98go{border:0;background:none;box-shadow:none;gap:10px;align-items:center}
.pn100 .pn98go .pn98sum{border:0;display:block;max-width:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:0 1 auto}
.pn100 .pn98go .pn98sum .gd{color:var(--gold2)}
.pn100 .pn98go .pn98dice{width:44px;height:44px;border:1px solid #6b5236;border-radius:7px}
.pn100 .pn98go #goBtn.pn100go{min-height:0;padding:0 22px;border-radius:5px;margin:0}
.pn100 .pn98go #goBtn.pn100go::after{content:none}
.pn100 .pn-card{padding:10px 14px 12px}
.pn100ttl{display:flex;align-items:baseline;gap:8px;margin-bottom:8px;min-width:0}
.pn100ttl b{font:400 17px var(--display);color:var(--gold2);letter-spacing:.06em;font-variant:small-caps}
.pn100ttl small{font-size:13px;color:var(--muted)}.pn100ttl .sp,.pn100lockbar .sp,.pn100pass .sp{flex:1}
.pn100lockbar{display:flex;align-items:center;gap:9px;margin:-2px 0 10px;padding:6px 10px;border-radius:6px;border:1px dashed var(--gold);background:#2a1f12;font-size:13.5px;color:var(--muted);flex-wrap:wrap}
.pn100lockbar b{color:var(--gold2)}
/* the carousel */
.pn100car{display:grid;grid-template-columns:34px minmax(0,1fr) 34px;align-items:center;gap:6px;margin-bottom:12px}
.pn100arr{height:64px;border:1px solid #4a3826;border-radius:6px;background:var(--panel2,#1a130e);color:var(--gold2);font:400 26px/1 var(--display);cursor:pointer;padding:0}
.pn100arr:hover:not(:disabled),.pn100arr:focus-visible{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}
.pn100arr:disabled{opacity:.35;cursor:not-allowed}
.pn100trk{display:flex;gap:10px;align-items:center;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x proximity;scrollbar-width:none;padding:8px 70px;min-height:172px;
  -webkit-mask:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
.pn100trk::-webkit-scrollbar{display:none}
.pn100trk .pn100c{flex:none;width:86px;scroll-snap-align:center;display:grid;gap:3px;padding:3px;border:1px solid #3a2c1e;border-radius:6px;background:var(--panel2,#1a130e);color:var(--muted);font-size:11.5px;text-align:center;cursor:pointer;transition:width .2s,transform .2s,box-shadow .2s}
.pn100trk .pn100c .pn100art{display:block;width:100%;aspect-ratio:480/692;height:auto;border-radius:3px;background-repeat:no-repeat}
.pn100trk .pn100c .pn-cust{display:grid;place-items:center;font-size:30px;color:#cdb8ff;background:#2a2040}
.pn100trk .pn100c .pn-evn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pn100trk .pn100c.on{width:118px;border-color:var(--gold);color:var(--gold2);box-shadow:0 0 0 1px var(--gold) inset,0 8px 20px rgba(0,0,0,.6),0 0 18px rgba(214,171,76,.25)}
.pn100trk .pn100c:hover:not(.on):not(.lk),.pn100trk .pn100c:focus-visible{border-color:var(--gold);color:var(--bone)}
.pn100trk .pn100c:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}
.pn100trk .pn100c.lk{opacity:.32;filter:grayscale(.8);cursor:not-allowed}
body.calm .pn100trk .pn100c{transition:none}
@media (prefers-reduced-motion:reduce){.pn100trk .pn100c{transition:none}}
/* card | map | details */
.pn100what{display:grid;grid-template-columns:180px 290px minmax(0,1fr);gap:16px;align-items:start}
.pn100what>*{min-width:0}
.pn100cardc .pn-frame{width:100%;max-width:180px;margin:0}
.pn100map{position:relative}
.pn100map #mapbox{position:relative;max-width:none;margin:0}
.pn100map #mapbox>svg{display:block;width:100%;height:auto;border-radius:7px}
.pn100lock .pn100map #mapbox::after{content:'';position:absolute;inset:0;background:rgba(22,16,11,.62);border-radius:7px;pointer-events:none}
.pn100maplock{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);padding:5px 11px;border-radius:999px;background:#160f0bdd;border:1px solid var(--gold);color:var(--gold2);font-size:13px;white-space:nowrap;z-index:2}
.pn100city{display:flex;gap:6px;align-items:center;margin-top:8px}.pn100city select{flex:1;min-width:0}
.pn100roll{flex:none;padding:5px 8px;font-size:12.5px;white-space:nowrap}
.pn100lock .pn100city select,.pn100lock .pn100roll{opacity:.45}
.pn100mods{display:flex;gap:6px;margin-top:6px;font-size:12.5px;align-items:center;color:var(--muted);flex-wrap:wrap}
.pn100none{padding:1px 7px;border-radius:3px;border:1px solid #4a3826;color:var(--dim)}
.pn100det .pn-evt{display:flex;gap:10px;align-items:center}
.pn100det .pn-evt h3{font:400 25px var(--display);color:var(--gold2);letter-spacing:.03em;margin:0}
.pn100det .pn-evt small{color:var(--muted);font-size:14px}
.pn100det .pn-desc{margin:4px 0 10px;font-size:15px;color:#e2d5bb}
.pn100rounds{display:grid;gap:1px;background:#00000050;border:1px solid #3a2c1e;border-radius:7px;overflow:hidden}
.pn100rd{display:grid;grid-template-columns:34px minmax(0,1fr) 196px minmax(0,1.3fr) minmax(0,1fr);gap:12px;align-items:center;padding:8px 12px;background:var(--panel2,#1a130e)}
.pn100rd.hd{background:#160f0b;padding:5px 12px;font:500 10.5px var(--mono);letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.pn100rd .n{font:400 22px var(--display);color:var(--gold);text-align:center}
.pn100rd .nm b{display:block;font:400 17px var(--display);color:var(--bone);letter-spacing:.02em}
.pn100rd .nm span{font:12px var(--mono);color:var(--muted)}
.pn100rd .rch{display:flex;gap:4px;flex-wrap:nowrap}
.pn100rd .rch span{font:600 11px var(--mono);padding:2px 6px;border-radius:3px;border:1px solid}
.pn100rd .rch .y{border-color:#4d7a43;color:#bfe3b0;background:#1e2d19}
.pn100rd .rch .n0{border-color:#4a3826;color:#a08a6e;text-decoration:line-through;background:#1a130e}
.pn100rd .end,.pn100rd .rw{font-size:14px;color:#ddd0b6;line-height:1.3}.pn100rd .rw{color:var(--gold2)}
.pn100det .pn-rec{margin-top:8px;font-size:13.5px;color:var(--muted)}
.pn100sel{display:none!important}
/* options */
.pn100follow{display:flex;align-items:center;gap:12px;padding:9px 12px;border-radius:7px;border:1px solid var(--line2);background:linear-gradient(90deg,#2a1f14,#1f1711);margin-bottom:10px;flex-wrap:wrap}
.pn100follow.on{border-color:var(--gold);background:linear-gradient(90deg,#3a2a18,#241a12)}
.pn100follow .t{flex:1;min-width:200px;font-size:14.5px;color:var(--muted)}.pn100follow .t b{color:var(--gold2)}.pn100follow .t b:first-child{color:var(--bone)}
.pn100schedp{margin:-4px 0 10px;max-height:300px;overflow:auto;border:1px solid var(--line2);border-radius:7px;padding:6px 8px;background:#160f0b}
.pn100sw{flex:none;position:relative;width:46px;height:24px;border-radius:999px;border:1px solid #6b5236;background:#160f0b;cursor:pointer;padding:0}
.pn100sw i{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#8a7457;transition:left .15s,background .15s}
.pn100sw.on{background:#5a4220;border-color:var(--gold)}.pn100sw.on i{left:25px;background:var(--gold2)}
.pn100sw:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}
body.calm .pn100sw i{transition:none}
.pn100optg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 22px;font-size:14.5px}
.pn100optg>label{display:flex;gap:9px;align-items:center;min-width:0}
.pn100optg>label>span{min-width:0}
.pn100optg .pn100dim{opacity:.55}
.pn100optg .pn100tip{grid-column:1/-1;margin:0!important}
.pn100optg>details,.pn100optg>div{grid-column:1/-1}
.pn100hid{position:absolute!important;width:1px!important;height:1px!important;opacity:0;pointer-events:none}
.pn100seg{display:inline-flex;margin-left:4px}.pn100seg button{padding:4px 10px;font-size:13.5px}
/* who */
.pn100 .pn-who .pn-lbl{font:400 17px var(--display);letter-spacing:.06em;font-variant:small-caps}
/* 2 · the hot seat */
.pn100pass{display:flex;gap:12px;align-items:center;padding:10px 14px;border-radius:8px;border:1px solid #7fc2e8;background:linear-gradient(90deg,#1b2a33,#1a1612 70%);font-size:14.5px;color:#cfe4ee;flex-wrap:wrap}
.pn100pass .ic{font-size:26px}.pn100pass b{color:#fff}.pn100pass small{display:block;color:#a9c8d6;font-size:12.5px;margin-top:2px}
.pn100pass .tx{flex:1 1 320px;min-width:0}
.pn100hst{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#cfe4ee}
.pn100prof{border:1px solid var(--line2);border-radius:8px;background:var(--panel);padding:6px 12px}
.pn100prof>summary{cursor:pointer;font:400 15px var(--display);color:var(--gold2);letter-spacing:.04em}
.pn100prof .hsbanner{margin:8px 0 2px;border:0;padding:0;background:none}
.pn100hs .pn-who .seats>.seat.pn100hum{box-shadow:0 0 0 1px #7fc2e8,0 0 16px rgba(127,194,232,.16)}
.pn100 .pn98dice:focus-visible .pn98tip{display:none}.pn100 .pn98dice:hover .pn98tip,body.kb100 .pn100 .pn98dice:focus-visible .pn98tip{display:block}
.pn100hs .pn-who .seat .hsname,.pn100hs .pn-who .seat .hsown88{margin-right:58px}
.pn100hs .pn-who .seat .hsname{display:flex;align-items:center;gap:6px;min-width:0}.pn100hs .pn-who .seat .hsname input{flex:1;min-width:0}.pn100hs .pn-who .seat .hsname .rc-sub{display:none}
.pn100tag{display:inline-block;font:600 10px var(--mono);letter-spacing:.06em;padding:1px 6px;border-radius:3px;margin-bottom:4px;width:fit-content}
.pn100tag.hum{color:#0d1a22;background:#7fc2e8}.pn100tag.cpu{color:#efe3cc;background:#6b5a46}
#hs100rib{position:absolute;left:0;right:0;top:0;bottom:0;z-index:30;display:flex;align-items:center;justify-content:center;gap:14px;pointer-events:none;
  background:linear-gradient(90deg,transparent,#14303f 18%,#1d4558 50%,#14303f 82%,transparent),rgba(13,26,34,.92);border-bottom:2px solid #7fc2e8;
  font:400 21px var(--display);letter-spacing:.06em;color:#fff;text-shadow:0 1px 3px #000;transform:translateY(-105%);opacity:0;transition:transform .28s cubic-bezier(.2,.7,.2,1),opacity .2s}
#hs100rib.show{transform:none;opacity:1}
#hs100rib.calm{transition:none}
#hs100rib small{font-size:13px;letter-spacing:0;color:#bfe0f0}
#hs100rib i{position:absolute;left:0;bottom:-2px;height:2px;width:62%;background:var(--pc,var(--gold2))}
header.bar{position:relative}
/* ---------- 3 · the sandstone submenus ---------- */
#modal.sand100{background:radial-gradient(ellipse 46% 40% at 50% 56%,rgba(240,190,90,.10),transparent 70%),radial-gradient(ellipse 80% 75% at 50% 52%,rgba(10,6,3,.35),rgba(6,4,2,.86))}
#modal.sand100 #mboxEl{position:relative;width:560px;max-width:calc(100vw - 32px);border:0;border-radius:8px;padding:16px 18px 18px;color:#4a2e14;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 .32 0 0 0 0 .22 0 0 0 0 .1 0 0 0 .7 0'/%3E%3C/filter%3E%3Crect width='240' height='120' filter='url(%23n)'/%3E%3C/svg%3E"),linear-gradient(178deg,#d3b787 0%,#bf9c69 45%,#a98457 100%);
  box-shadow:inset 0 2px 0 rgba(255,244,214,.7),inset 0 -3px 0 rgba(80,52,24,.6),0 6px 0 #5a4024,0 7px 0 #3d2a15,0 30px 70px rgba(0,0,0,.85),0 0 0 1px #2b1d10;animation:sand100in .32s cubic-bezier(.2,.7,.2,1) both}
#modal.sand100 #mboxEl::before{content:"";position:absolute;inset:8px;border-radius:5px;border:1px solid rgba(96,64,30,.55);box-shadow:0 1px 0 rgba(255,238,204,.45),inset 0 1px 0 rgba(255,238,204,.3);pointer-events:none}
@keyframes sand100in{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
#modal.sand100 #mTitle{display:flex;align-items:center;gap:10px;margin:2px 44px 2px 6px;font:400 27px/1.1 var(--display);letter-spacing:.09em;font-variant:small-caps;color:#4a2e14;text-shadow:0 1px 0 rgba(255,240,206,.8),0 -1px 0 rgba(60,36,14,.7)}
#modal.sand100 #mTitle svg{width:28px;height:28px;fill:#5a3a1a;flex:none;filter:drop-shadow(0 1px 0 rgba(255,240,206,.7))}
#modal.sand100 #mBody{position:relative;margin:4px 44px 12px 6px;color:#5a3d1e}
#modal.sand100 #mBody .rc-sub{color:#3f2610!important;font-size:14.5px;text-shadow:0 1px 0 rgba(255,240,206,.5)}
#modal.sand100 #mClose{top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:0;font-size:19px;line-height:1;color:#4a2e14;background:radial-gradient(circle at 40% 35%,#e3cb9f,#b08a58 70%);box-shadow:inset 0 1px 0 rgba(255,244,214,.8),inset 0 -2px 0 rgba(80,52,24,.6),0 2px 0 #5a4024,0 4px 8px rgba(0,0,0,.5);z-index:2}
#modal.sand100 #mClose:focus-visible{outline:2px solid #fff2be;outline-offset:2px}
#modal.sand100 #mBtns{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:11px;margin:0;padding:12px;border-radius:6px;background:linear-gradient(#5b4128,#4a3420);box-shadow:inset 0 3px 8px rgba(0,0,0,.55),inset 0 -1px 0 rgba(255,238,204,.25),0 1px 0 rgba(255,238,204,.5)}
#modal.sand100 #mBtns .sb100{grid-column:1/-1;width:100%;justify-content:flex-start;padding:0 18px;--h:52px;--fs:17px;height:auto;min-height:var(--h);white-space:normal}
#modal.sand100 #mBtns .sb100.half{grid-column:auto;--h:54px}
#modal.sand100 #mBtns .sb100.pri{--h:62px;--fs:22px}
#modal.sand100 #mBtns .sb100 .lab{display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-width:0;padding:7px 0;text-align:left}
#modal.sand100 #mBtns .sb100 .lab small{line-height:1.2}
#modal.sand100 .sand100ft{position:relative;display:flex;justify-content:space-between;align-items:center;margin:12px 4px 0}
#modal.sand100 .sand100ft .seal{font:500 11px var(--mono);letter-spacing:.12em;color:#3f2610}
.grab100{display:none}
body.sub100 #mainMenu{transform:scale(1.045) translateY(14px);filter:blur(3.5px) brightness(.5) saturate(.75);transition:transform .32s cubic-bezier(.2,.7,.2,1),filter .32s}
#mainMenu{transition:transform .22s ease-out,filter .22s ease-out;transform-origin:50% 56%}
body.sub100.sub100calm #mainMenu,body.calm.sub100 #mainMenu{transform:none;filter:brightness(.5);transition:none}
body.sub100calm #modal.sand100 #mboxEl,body.calm #modal.sand100 #mboxEl{animation:none}
@media (prefers-reduced-motion:reduce){body.sub100 #mainMenu{transform:none;filter:brightness(.5);transition:none}#modal.sand100 #mboxEl{animation:none}}
/* ---------- tablets and phones ---------- */
@media (max-width:1100px){.pn100what{grid-template-columns:150px 230px minmax(0,1fr)}.pn100rd{grid-template-columns:30px minmax(0,1fr) auto;row-gap:4px}.pn100rd .end,.pn100rd .rw{grid-column:2/4}.pn100rd.hd{display:none}.pn100optg{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:600px){
  .pn100 .pn-top{flex-wrap:wrap}.pn100 .pn-acts{flex-basis:100%;margin-right:0}
  .pn100 .pn98go{width:100%}.pn100 .pn98go .pn98sum{display:none}.pn100 .pn98go .pn98dice{flex:none!important;width:52px;height:50px}.pn100 .pn98go #goBtn.pn100go{flex:1 1 auto;min-width:0;--h:50px;--fs:21px;padding:0 14px}
  .pn100city{flex-wrap:wrap}.pn100city select{flex:1 1 100%}.pn100roll{flex:1 1 0}
  .pn100what{grid-template-columns:110px minmax(0,1fr);gap:12px}.pn100what>.pn100det{grid-column:1/-1}
  .pn100rd{grid-template-columns:26px minmax(0,1fr)}.pn100rd .rch,.pn100rd .end,.pn100rd .rw{grid-column:2}
  .pn100optg{grid-template-columns:minmax(0,1fr)}
  .pn100car{grid-template-columns:28px minmax(0,1fr) 28px;gap:4px}.pn100arr{height:54px;font-size:22px}
  .pn100trk{min-height:150px}.pn100trk .pn100c{width:72px}.pn100trk .pn100c.on{width:98px}
  .pn100roll{padding:5px 6px}
  #hs100rib{font-size:16px;gap:8px}#hs100rib small{display:none}
  #modal.sand100{align-items:flex-end;padding:0}
  #modal.sand100 #mboxEl{width:100vw!important;max-width:100vw!important;height:auto!important;max-height:92dvh!important;border-radius:16px 16px 0 0!important;padding:8px 12px calc(14px + env(safe-area-inset-bottom))!important;animation:sand100up .3s cubic-bezier(.2,.7,.2,1) both;box-shadow:inset 0 2px 0 rgba(255,244,214,.7),0 -18px 50px rgba(0,0,0,.85),0 0 0 1px #2b1d10}
  #modal.sand100 #mboxEl::before{inset:6px 6px 0;border-bottom:0;border-radius:12px 12px 0 0}
  #modal.sand100 .grab100{display:block;width:44px;height:5px;border-radius:3px;margin:2px auto 4px;background:#7a5a34;box-shadow:inset 0 1px 1px rgba(0,0,0,.5),0 1px 0 rgba(255,238,204,.5)}
  #modal.sand100 #mTitle{font-size:22px}#modal.sand100 #mBtns{padding:9px;grid-template-columns:minmax(0,1fr)}#modal.sand100 #mBtns .sb100.half{grid-column:1/-1}
  #modal.sand100 .sand100ft .seal{display:none}
  body.sub100 #mainMenu{transform:scale(1.03) translateY(-10px);filter:brightness(.5) saturate(.75)}}
@keyframes sand100up{from{transform:translateY(100%)}to{transform:none}}`;document.head.appendChild(st)})();
