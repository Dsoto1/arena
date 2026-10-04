/* =====================================================================
   110-V77 · THE CREATOR STUDIO, TIDIED (after v0.76)
   =====================================================================
   A · Roster sets as a deck builder: the sets as cards on the left (Classic, Everything on the rolls, yours, + a new one),
       the open set on the right as thumbnails by kind — click a tile to put it in or take it out, All / None per kind, a
       search box, the printed pieces folded in a 🔒 line (always in), empty kinds point to their designer. System sets
       open read-only with ⧉ Copy & edit. Saving, locking, deleting and "Use for Play Now" keep the old data-rs handlers.
   B · The Studio rail: 📚 Roster sets moves up beside 📋 All creations; every tab shows how many you have made.
   C · All creations: an empty Studio shows "make your first …" tiles; the table gains a "Play Now set" column.
   D · Names: 📌 Pin a name (kept in this browser), ✎ Use it for a new character; the two pattern rows become one line.
   E · Spectators: the form is split into Look and Personality; your regulars show as face cards.
   F · Editors: the lock card shows a progress bar (cities won of 12).
   G · Invitationals: numbered steps over the form; Tournament Designer: wider seat pickers and a clear 🎮 You toggle.
   H · Every tab: the long intro paragraph is one line + ⓘ; phones stack the preview over the form.
   ===================================================================== */

/* ---------------- A · Roster sets ---------------- */
const RS77_TAB={chars:'chars',npcs:'npcs',weapons:'gear:w',armor:'gear:a',flags:'flags',trophies:'trophies',sponsors:'sponsors',events:'events',specials:'specials',pairs:'cohorts',classes:'classes',lanistas:'lanistas',tourneys:'tourneys'};
/* what "Everything on the rolls" holds, kind by kind (the same rules as its Copy) */
function rs77Rolls(){const s={};s.chars=(CUSTOM.chars||[]).filter(onRolls).map(c=>c.id);s.weapons=(CUSTOM.weapons||[]).filter(c=>c.rolls&&(c.rolls.market||c.rolls.loadout)).map(c=>c.id);
  s.armor=(CUSTOM.armor||[]).filter(c=>c.rolls&&(c.rolls.market||c.rolls.loadout)).map(c=>c.id);s.flags=(CUSTOM.flags||[]).filter(f=>f.rack!==false).map(f=>f.id);
  s.trophies=(CUSTOM.trophies||[]).filter(t=>t.offered!==false).map(t=>t.id);s.sponsors=(CUSTOM.sponsors||[]).filter(t=>t.offered!==false).map(t=>t.id);
  s.specials=(CUSTOM.specials||[]).filter(x=>x.freq!=='off').map(x=>x.id);s.pairs=(CUSTOM.pairings||[]).filter(p=>p.deck).map(p=>p.id);s.events=(CUSTOM.events||[]).map(e=>e.id);
  s.npcs=(CUSTOM.npcs||[]).map(n=>n.id);s.classes=(CUSTOM.classes||[]).map(c=>c.id);s.lanistas=(CUSTOM.lanistas||[]).filter(x=>x.rolls!==false).map(x=>x.id);s.tourneys=(CUSTOM.tourneys||[]).map(t=>t.id);return s}
function rs77Sel(R){if(!R||R.id==='classic')return {};if(R.id==='rolls')return rs77Rolls();return R.sel||{}}
function rs77Count(R){const s=rs77Sel(R);return RS_KINDS.map(([k,l])=>[k,l,(s[k]||[]).length]).filter(x=>x[2])}
/* careers that play with a set: the open one is known; the saved ones carry their roster in the summary when present */
function rs77Careers(R){const out=[];try{const w=typeof MGR!=='undefined'&&MGR.world;if(w&&w.roster&&w.roster.id===R.id)out.push((w.mgrs.find(m=>m.isPlayer)||{}).ludus||_T('your career'))}catch(e){}return out}
function rs77SetCard(R,openId){const cur=(typeof CFG!=='undefined'&&CFG.roster)||'classic';const n=rs77Count(R);const car=rs77Careers(R);
  const chips=R.id==='classic'?_T('<span class="rc-sub">the printed game only</span>'):n.length?n.map(([k,l,c])=>`<span class="rs77n" title="${esc(l.split(' ').slice(1).join(' '))}">${l.split(' ')[0]} ${c}</span>`).join(''):_T('<span class="rc-sub">nothing of yours yet — plays like Classic</span>');
  return `<div class="rs77set ${R.id===openId?'on':''} ${R.sys?'sys':''}" data-rs77open="${esc(R.id)}" role="button" tabindex="0"><div class="rs77sh"><b>${R.sys?'🏛':'📚'} ${esc(R.name)}</b>${R.locked?' <span title="Locked">🔒</span>':''}</div>
    <div class="rs77chips">${chips}</div>
    <div class="rs77tags">${R.id===cur?_T('<span class="badge gold">▶ Play Now</span>'):''}${car.map(c=>`<span class="badge">💼 ${esc(c)}</span>`).join('')}</div></div>`}
/* a bigger picture per item (falls back to the old row icon) */
function rs77Ico(kind,id,ic){try{
  if(kind==='chars'){const c=(CUSTOM.chars||[]).find(x=>x.id===id);if(c)return portraitHTML(c,'sm')}
  if(kind==='npcs'){const n=(CUSTOM.npcs||[]).find(x=>x.id===id);if(n&&typeof cnTokHTML==='function')return cnTokHTML(n,46)}
  if(kind==='weapons'&&typeof cwCardURL==='function')return `<img src="${cwCardURL('cw_'+id)}" alt="" style="height:44px">`;
  if(kind==='armor'&&typeof armArtURL==='function'&&ARM['ca_'+id])return `<img src="${armArtURL('ca_'+id)}" alt="" style="height:44px">`;
  if(kind==='trophies'){const t=(CUSTOM.trophies||[]).find(x=>x.id===id);if(t&&typeof trophySVG==='function')return trophySVG(t,44)}
  if(kind==='flags'){const f=(CUSTOM.flags||[]).find(x=>x.id===id);if(f&&typeof houseFlagURI==='function')return `<img src="${houseFlagURI(f)}" alt="" style="height:40px">`}
  if(kind==='sponsors'){const s=(CUSTOM.sponsors||[]).find(x=>x.id===id);if(s&&typeof flavFaceURL==='function')return `<img src="${flavFaceURL('calm',s)}" alt="" style="height:44px;border-radius:4px">`}
  if(kind==='classes'){const c=(CUSTOM.classes||[]).find(x=>x.id===id);if(c)return `<span class="rs77dot" style="background:${esc(c.color||'#888')}">${esc((c.name||'?')[0])}</span>`}
  if(kind==='lanistas'){const x=(CUSTOM.lanistas||[]).find(q=>q.id===id);if(x)return portraitHTML({name:x.name,portrait:x.portrait,color:x.color},'sm')}
  }catch(e){}return `<span class="rs77big">${ic||'✦'}</span>`}
function rs77KindHTML(kind,label,d,ro,q){const {sys,mine}=rsItems(kind);const sel=new Set((d.sel||{})[kind]||[]);
  const vis=mine.filter(m=>!q||String(m[1]||'').toLowerCase().includes(q));const tab=RS77_TAB[kind];const word=label.split(' ').slice(1).join(' ');
  if(q&&!vis.length)return '';
  const head=`<div class="rs77kh"><b>${label}</b> <span class="rc-sub">${mine.length?_T`${mine.filter(m=>sel.has(m[0])).length} of ${mine.length} in`:''}</span>${!ro&&mine.length?`<span class="rs77an"><button type="button" class="btn tksm" data-rs77all="${kind}">${_T`All`}</button><button type="button" class="btn tksm" data-rs77none="${kind}">${_T`None`}</button></span>`:''}</div>`;
  const tiles=vis.map(([id,n,ic,st])=>{const on=sel.has(id);return `<button type="button" class="rs77t ${on?'on':''}" ${ro||st?'disabled':''} data-rs77t="${kind}|${esc(id)}" title="${esc(n||'')}${st?' ('+esc(st)+')':''}"><span class="ic">${rs77Ico(kind,id,ic)}</span><span class="nm">${esc(n||'')}</span><span class="ck">${on?'✓ in':'out'}</span></button>`}).join('');
  if(!mine.length)return '';const empty='';
  const sysl=sys.length?`<details class="rs77sys"><summary>${_T`🔒 ${sys.length} printed — always in`}</summary><div class="rs77sl">${sys.map(([k,n])=>`<span>${esc(n)}</span>`).join(' · ')}</div></details>`:'';
  return `<section class="rs77k">${head}${tiles?`<div class="rs77grid">${tiles}</div>`:''}${empty}${sysl}</section>`}
function rs77Unmade(){const L=RS_KINDS.filter(([k])=>!rsItems(k).mine.length);if(!L.length)return '';
  return `<section class="rs77k rs77un"><div class="rs77kh">${_T`<b>Not made yet</b>`} <span class="rc-sub">${_T`the printed pieces of these are always in`}</span></div><div class="rs77ul">${L.map(([k,l])=>RS77_TAB[k]?`<button type="button" class="btn tksm" data-st="tab" data-v="${RS77_TAB[k]}" title="${_T`Open the designer`}">${l} ＋</button>`:`<span class="rs77n">${l}</span>`).join('')}</div></section>`}
function rs77Summary(d){const n=RS_KINDS.map(([k,l])=>[(d.sel&&d.sel[k]||[]).length,l.split(' ').slice(1).join(' ').toLowerCase()]).filter(x=>x[0]);
  return n.length?_T`Plays like Classic + ${n.map(([c,l])=>`${c} ${c===1?l.replace(/s$/,''):l}`).join(', ')}`:_T('Plays like Classic — put some of your creations in')}
rosterStudioHTML=function(){const L=[...ROSTER_SYS,...(CUSTOM.rosters||[])];if(!ST.rs77){if(!ST.rsd)ST.rsd=rsBlank();ST.rs77=ST.rsd.id}const openId=ST.rs77;
  const sysR=ROSTER_SYS.find(r=>r.id===openId);const q=String(ST.rs77q||'').toLowerCase();let right;
  if(sysR){const d={sel:rs77Sel(sysR)};
    right=`<div class="rs77hd"><div><h3>🏛 ${esc(sysR.name)}</h3><div class="rc-sub">${esc(sysR.desc||'')}</div></div><div class="acts"><button class="btn primary tksm" type="button" data-rs="copy" data-v="${sysR.id}">${_T`⧉ Copy &amp; edit`}</button><button class="btn tksm" type="button" data-rs="useplay" data-v="${sysR.id}">${_T`▶ Use for Play Now`}</button></div></div>
      ${sysR.id==='classic'?'<p class="rs77note">Only the printed game — every class, beast, weapon and event from the box, none of your creations.</p>':`<p class="rs77note">${_T`Follows the 📜 rolls: whatever you add to the rolls in each designer joins this set by itself.`}</p>${RS_KINDS.map(([k,l])=>rs77KindHTML(k,l,d,true,q)).join('')}`}`}
  else{const d=ST.rsd||(ST.rsd=rsBlank());const mine=(CUSTOM.rosters||[]).find(r=>r.id===d.id);
    right=`<div class="rs77hd"><div style="flex:1"><label class="rc-sub">${_T`Set name`}<input class="tin" data-rsf="name" value="${esc(d.name)}" maxlength="32" style="display:block;width:100%;max-width:340px"></label><div class="rs77sum">${rs77Summary(d)}</div></div>
       <div class="acts"><button class="btn primary" type="button" data-rs="save">${_T`💾 Save set`}</button>${mine?`<button class="btn tksm" type="button" data-rs="useplay" data-v="${esc(d.id)}">${_T`▶ Use for Play Now`}</button>${lockBtn(mine).replace('data-st="lock"',`data-rs="lock" data-v="${esc(d.id)}"`)}<button class="btn tksm" type="button" data-rs="copy" data-v="${esc(d.id)}">${_T`⧉ Copy`}</button><button class="btn tksm" type="button" data-rs="del" data-v="${esc(d.id)}" ${mine.locked?'disabled':''}>${_T`Delete`}</button>`:''}</div></div>
      <input class="tin rs77q" id="rs77q" placeholder="${_T`🔍 Find a creation…`}" value="${esc(ST.rs77q||'')}">
      ${RS_KINDS.map(([k,l])=>rs77KindHTML(k,l,d,!!(mine&&mine.locked),q)).join('')}${q?'':rs77Unmade()}`}
  const w=typeof MGR!=='undefined'&&MGR.world;
  return `<p class="intro77">${_T`📚 A roster set decides which of your creations play. The printed game is always in.`} <span class="qi" data-tip="${_T`Classic is the default for every New event and every new career. Pick a set on the Play Now screen, or when you found a career — a career keeps its set for life.`}">ⓘ</span></p>
   <div class="rs77"><div class="rs77sets">${L.map(r=>rs77SetCard(r,openId)).join('')}<button type="button" class="rs77set rs77new" data-rs77new="1">${_T`<b>＋ New set</b>`}<span class="rc-sub">${_T`start empty, then click tiles`}</span></button>
     ${w&&w.roster?`<div class="rc-sub rs77car">${_T`💼 Your open career plays with <b>${esc(w.roster.name)}</b> — fixed at its founding.`}</div>`:''}</div>
    <div class="rs77open">${right}</div></div>`};
/* the bench follows the card you open */
document.addEventListener('click',e=>{if(typeof ST==='undefined')return;const st=document.getElementById('studio');if(!st)return;
  const b=e.target.closest('[data-rs77open],[data-rs77new],[data-rs77t],[data-rs77all],[data-rs77none]');
  if(!b){const r=e.target.closest('[data-rs]');if(r&&st.contains(r)){const a=r.dataset.rs;if(a==='copy'||a==='new')setTimeout(()=>{if(ST.rsd){ST.rs77=ST.rsd.id;studioRedraw()}},0);if(a==='save')setTimeout(()=>{if(ST.rsd){ST.rs77=ST.rsd.id;studioRedraw()}},60)}return}
  if(!st.contains(b))return;e.preventDefault();e.stopPropagation();
  if(b.dataset.rs77open!=null){const id=b.dataset.rs77open;ST.rs77=id;const r=(CUSTOM.rosters||[]).find(x=>x.id===id);if(r)ST.rsd=JSON.parse(JSON.stringify(r));studioRedraw();return}
  if(b.dataset.rs77new){ST.rsd=rsBlank();if(nameClash('rosters',ST.rsd.name))ST.rsd.name=nameSuggest('rosters',ST.rsd.name);ST.rs77=ST.rsd.id;studioRedraw();return}
  const d=ST.rsd;if(!d)return;d.sel=d.sel||{};
  if(b.dataset.rs77t){const i=b.dataset.rs77t.indexOf('|');const k=b.dataset.rs77t.slice(0,i),id=b.dataset.rs77t.slice(i+1);const S1=new Set(d.sel[k]||[]);S1.has(id)?S1.delete(id):S1.add(id);d.sel[k]=[...S1];studioRedraw();return}
  if(b.dataset.rs77all){const k=b.dataset.rs77all;d.sel[k]=rsItems(k).mine.filter(m=>!m[3]).map(m=>m[0]);studioRedraw();return}
  if(b.dataset.rs77none){d.sel[b.dataset.rs77none]=[];studioRedraw();return}},true);
document.addEventListener('keydown',e=>{const b=e.target.closest&&e.target.closest('[data-rs77open]');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();b.click()}});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id==='rs77q'&&typeof ST!=='undefined'){ST.rs77q=t.value;clearTimeout(t._rs77);t._rs77=setTimeout(()=>{studioRedraw();const n=document.getElementById('rs77q');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length)}},250)}
  if(t&&t.dataset&&t.dataset.rsf!=null&&typeof ST!=='undefined'&&ST.rsd){const s=document.querySelector('.rs77sum');if(s)s.innerHTML=rs77Summary(ST.rsd)}});

/* ---------------- B · the Studio rail: Roster sets up top, counts on every tab ---------------- */
{const ov=ST_GROUPS.find(g=>g[1].includes('all'));const tl=ST_GROUPS.find(g=>g[1].includes('rosters'));if(ov&&tl&&tl!==ov){tl[1].splice(tl[1].indexOf('rosters'),1);ov[1].push('rosters')}}
function st77Counts(){const n=x=>(x||[]).length;const sp=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(r=>r.custom&&!r.recruited).length;
  const c={classes:n(CUSTOM.classes),chars:n(CUSTOM.chars),lanistas:n(CUSTOM.lanistas),npcs:n(CUSTOM.npcs),cohorts:n(CUSTOM.pairings),tokens:n(CUSTOM.tokens),'gear:w':n(CUSTOM.weapons),'gear:a':n(CUSTOM.armor),
    trophies:n(CUSTOM.trophies),flags:n(CUSTOM.flags),events:n(CUSTOM.events),tourneys:n(CUSTOM.tourneys),specials:n(CUSTOM.specials),sponsors:n(CUSTOM.sponsors),spect:sp,rosters:n(CUSTOM.rosters),names:nm77Pins().length};
  c.all=Object.entries(c).filter(([k])=>k!=='names').reduce((a,[,v])=>a+v,0);return c}

/* ---------------- C · All creations ---------------- */
const ST77_FIRST=[['chars','🛡',_T('a character')],['classes','🎭',_T('a class')],['npcs','🐾',_T('a beast')],['gear:w','⚔',_T('a weapon')],['gear:a','🛡','armor'],['events','🎪',_T('an event')],['flags','🚩',_T('a banner')],['trophies','🏆',_T('a trophy')],['tokens','🗿',_T('a token')],['lanistas','🎩',_T('a lanista')],['tourneys','🏆',_T('a tournament')],['spect','👥',_T('a regular')]];
const ST77_K2SEL={chars:'chars',npcs:'npcs',events:'events',weapons:'weapons',armor:'armor',flags:'flags',trophies:'trophies',sponsors:'sponsors',specials:'specials',pairings:'pairs',tourneys:'tourneys',classes:'classes',lanistas:'lanistas'};
function st77AllTidy(root){const tb=root.querySelector('table.tally');if(!tb)return;const R=rosterById((typeof CFG!=='undefined'&&CFG.roster)||'classic');const sel=rs77Sel(R);
  const rows=[...tb.querySelectorAll('tr')];if(rows.length<=2&&/Nothing made yet/.test(tb.textContent)){const wrap=tb.closest('div');const box=document.createElement('div');box.className='st77first';
    box.innerHTML=`<p class="intro77">${_T`Nothing made yet. Start anywhere:`}</p><div class="st77fgrid">${ST77_FIRST.map(([t,ic,l])=>`<button type="button" class="st77f" data-st="tab" data-v="${t}">${_T`<span>${ic}</span>Make ${l}`}</button>`).join('')}</div>`;(wrap||tb).replaceWith(box);return}
  const hd=rows[0];if(!hd||hd.dataset.s77)return;hd.dataset.s77=1;const th=document.createElement('th');th.textContent=_T('Play Now set');th.title=R.name;hd.insertBefore(th,hd.lastElementChild);
  for(const tr of rows.slice(1)){const b=tr.querySelector('[data-st="allopen"]');const td=document.createElement('td');td.className='rc-sub';if(b){const [k,id]=b.dataset.v.split('|');const sk=ST77_K2SEL[k];td.innerHTML=sk?((sel[sk]||[]).includes(id)?'<span class="badge gold">✓ in</span>':'—'):''}tr.insertBefore(td,tr.lastElementChild)}}

/* ---------------- D · Names: pin and use ---------------- */
function nm77Pins(){try{return JSON.parse(localStorage.getItem('flavius_namepins77')||'[]')}catch(e){return []}}
function nm77Save(L){try{localStorage.setItem('flavius_namepins77',JSON.stringify(L.slice(0,60)))}catch(e){}}
function nm77Tidy(root){const list=root.querySelector('#ngList');if(!list||list.dataset.s77)return;list.dataset.s77=1;const pins=nm77Pins();
  const segs=[...root.querySelectorAll('.seg[role="group"]')].filter(s=>s.querySelector('[data-ngpat]'));if(segs.length===2&&!root.querySelector('.nm77row')){const row=document.createElement('div');row.className='nm77row';segs[0].before(row);row.append(...segs)}
  for(const r of list.querySelectorAll('.lrow')){const n=(r.querySelector('b')||{}).textContent||'';const a=document.createElement('div');a.className='a';
    a.innerHTML=`<button type="button" class="btn tksm" data-nm77pin="${esc(n)}" title="${_T`Keep this name`}">${pins.includes(n)?_T('📌 Pinned'):_T('📌 Pin')}</button><button type="button" class="btn tksm" data-nm77use="${esc(n)}" title="${_T`Start a character with this name`}">${_T`✎ Use`}</button>`;r.append(a)}
  if(pins.length&&!root.querySelector('.nm77pins')){const p=document.createElement('div');p.className='card2 nm77pins';p.innerHTML=`${_T`<b>📌 Pinned names</b>`} <span class="rc-sub">${_T`kept in this browser`}</span><div class="nm77pl">${pins.map(n=>`<span class="nm77p"><b>${esc(n)}</b><button type="button" class="btn tksm" data-nm77use="${esc(n)}">${_T`✎ Use`}</button><button type="button" class="btn tksm" data-nm77pin="${esc(n)}" title="${_T`Unpin`}">✕</button></span>`).join('')}</div>`;list.before(p)}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-nm77pin],[data-nm77use]');if(!b||typeof ST==='undefined')return;e.preventDefault();e.stopPropagation();
  if(b.dataset.nm77pin!=null){const n=b.dataset.nm77pin;const L=nm77Pins();const i=L.indexOf(n);if(i>=0)L.splice(i,1);else L.unshift(n);nm77Save(L);studioRedraw();return}
  const n=b.dataset.nm77use;ST.tab='chars';ST.draft=blankChar();ST.draft.name=n;ST.view='edit';studioRedraw();const box=$('#mBody');if(box)box.scrollTop=0;if(typeof mToast==='function')mToast(_T`✎ <b>${esc(n)}</b> is on the bench — finish the character and save.`)},true);

/* ---------------- E · Spectators ---------------- */
function sp77Tidy(root){const nm=root.querySelector('#spName');if(!nm)return;const fg=nm.closest('.formgrid');if(!fg||fg.dataset.s77)return;fg.dataset.s77=1;
  const lab=t=>[...fg.children].find(l=>l.tagName==='LABEL'&&l.firstChild&&String(l.firstChild.textContent).trim().startsWith(t));
  const hd=(t,before)=>{if(!before)return;const d=document.createElement('div');d.className='sect sp77h';d.style.gridColumn='1/-1';d.innerHTML=t;before.before(d)};
  hd(_T('🎭 Personality <span class="rc-sub">how they watch</span>'),lab(_T('Taste')));hd(_T('👤 Look <span class="rc-sub">face in the stands, figure in the city</span>'),lab(_T('Skin')));
  const h4=[...root.querySelectorAll('h4')].find(h=>/Your custom regulars/.test(h.textContent));const L=h4&&h4.nextElementSibling;if(L&&L.classList.contains('list2'))L.classList.add('sp77list')}

/* ---------------- F · Editors: the lock as progress ---------------- */
function ed77Tidy(root){const lc=root.querySelector('.lockcard');if(!lc||lc.dataset.s77)return;lc.dataset.s77=1;const won=lc.querySelectorAll('.spongrid .badge.gold').length;const all=lc.querySelectorAll('.spongrid .badge').length||12;
  const p=document.createElement('div');p.className='ed77bar';p.innerHTML=`<div class="ed77fill" style="width:${Math.round(won/all*100)}%"></div>${_T`<span>${won} of ${all} cities won</span>`}`;const g=lc.querySelector('.spongrid');if(g)g.before(p)}

/* ---------------- G · Invitationals in steps; tournament seats ---------------- */
function sx77Tidy(root){const nmL=[...root.querySelectorAll('label')].find(l=>l.querySelector('[data-sxf="name"]'));if(!nmL)return;const fg=nmL.parentElement;if(!fg||fg.dataset.s77)return;fg.dataset.s77=1;
  const lab=f=>{const x=fg.querySelector(`[data-sxf="${f}"]`);let l=x&&x.closest('label');while(l&&l.parentElement!==fg)l=l.parentElement;return l};
  const hd=(t,el)=>{if(!el)return;const d=document.createElement('div');d.className='sect sx77h';d.style.gridColumn='1/-1';d.innerHTML=t;el.before(d)};
  const t0=[...root.querySelectorAll('div,span,b,small')].find(x=>!x.children.length&&x.textContent.trim().toUpperCase()==='THE INVITATIONAL');if(t0)t0.textContent='① Arena & trophy';
  hd(_T('② The invitation'),nmL);hd(_T('③ The field'),lab('format'));hd(_T('④ Purse &amp; fame'),lab('purse'));hd(_T('⑤ Words'),lab('blurb'))}
function tn77Tidy(root){for(const l of root.querySelectorAll('.tseat label.chk')){if(l.dataset.s77)continue;l.dataset.s77=1;const i=l.querySelector('input');l.classList.add('tn77you');for(const n of [...l.childNodes])if(n.nodeType===3)n.remove();l.append(_T(' 🎮 You'));if(i&&i.checked)l.classList.add('on')}}
document.addEventListener('change',e=>{const i=e.target;if(i&&i.dataset&&i.dataset.tnh!=null){const l=i.closest('label');if(l)l.classList.toggle('on',i.checked)}},true);

/* ---------------- H · one-line intros, counts, the tidy pass ---------------- */
function st77Intro(root){const rail=root.querySelector('.sttabs');let p=rail&&rail.nextElementSibling;if(!p||p.tagName!=='P'||p.dataset.s77||p.classList.contains('intro77'))return;p.dataset.s77=1;
  const txt=p.textContent.replace(/\s+/g,' ').trim();if(txt.length<170)return;const m=txt.match(/^(.{40,180}?[.!?:—])\s/);if(!m)return;const first=m[1].replace(/[—:]$/,'').trim()+(/[.!?]$/.test(m[1])?'':'.');const rest=txt.slice(m[0].length).trim();
  const badge=p.querySelector('.cbadge');p.className='intro77';p.textContent=first+' ';const q=document.createElement('span');q.className='qi';q.dataset.tip=rest;q.textContent='ⓘ';p.append(q);if(badge){p.append(' ');p.append(badge)}}
function st77Rail(root){const c=st77Counts();for(const b of root.querySelectorAll('.sttabs [data-st="tab"]')){if(b.querySelector('.st77c'))continue;const v=c[b.dataset.v];if(v){const s=document.createElement('span');s.className='st77c';s.textContent=v;b.append(s)}}}
function st77Tidy(){const root=document.getElementById('studio');if(!root)return;try{st77Rail(root);st77Intro(root);
  const t=ST.tab;if(t==='all')st77AllTidy(root);if(t==='names')nm77Tidy(root);if(t==='spect')sp77Tidy(root);if(t==='sponsors')ed77Tidy(root);if(t==='specials')sx77Tidy(root);if(t==='tourneys')tn77Tidy(root)}catch(e){console.error(e)}}
{let t=0;window.ST77N=0;new MutationObserver(()=>{if(t||!document.getElementById('studio'))return;t=setTimeout(()=>{t=0;window.ST77N++;st77Tidy()},30)}).observe(document.body,{childList:true,subtree:true})}

{const st=document.createElement('style');st.textContent=`
.intro77{margin:2px 0 10px;color:var(--muted)}
.sttabs .st77c{margin-left:auto;padding:0 6px;border-radius:999px;font:600 10.5px var(--mono);background:rgba(232,201,106,.14);color:var(--gold,#e8c96a)}
#studio .sttabs button{display:flex;align-items:center;gap:8px}
.rs77{display:grid;grid-template-columns:minmax(220px,280px) minmax(0,1fr);gap:14px;align-items:start}
.rs77sets{display:grid;gap:8px;position:sticky;top:0}
.rs77set{display:grid;gap:6px;text-align:left;padding:10px 12px;border:1px solid var(--line,#4a3a28);border-radius:8px;background:rgba(255,255,255,.03);cursor:pointer;color:inherit;font:inherit}
.rs77set:hover{border-color:var(--gold,#e8c96a)}.rs77set.on{border-color:var(--gold,#e8c96a);box-shadow:0 0 0 1px var(--gold,#e8c96a) inset;background:rgba(232,201,106,.08)}
.rs77set.sys .rs77sh b{font-family:Georgia,serif}.rs77new{border-style:dashed;justify-items:start}.rs77car{padding:2px 4px}
.rs77chips{display:flex;flex-wrap:wrap;gap:4px}.rs77n{font:600 11px var(--mono);padding:1px 6px;border-radius:999px;background:rgba(255,255,255,.07)}
.rs77tags{display:flex;gap:4px;flex-wrap:wrap}.rs77tags:empty{display:none}
.rs77open{min-width:0}.rs77hd .acts{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}.rs77hd .acts .btn{flex:0 0 auto;width:auto}.rs77ul{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.rs77hd{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;margin-bottom:8px}.rs77hd h3{margin:0}
.rs77sum{margin-top:6px;color:var(--gold,#e8c96a);font-size:13px}.rs77q{width:100%;margin:4px 0 10px}.rs77note{color:var(--muted)}
.rs77k{border-top:1px solid var(--line,#4a3a28);padding:8px 0}.rs77kh{display:flex;gap:8px;align-items:center}.rs77an{margin-left:auto;display:flex;gap:4px}
.rs77grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px;margin-top:8px}
.rs77t{display:grid;justify-items:center;gap:3px;padding:8px 4px 6px;border:1px solid var(--line,#4a3a28);border-radius:8px;background:rgba(0,0,0,.18);color:inherit;font:inherit;cursor:pointer;opacity:.55;filter:grayscale(.7)}
.rs77t.on{opacity:1;filter:none;border-color:var(--gold,#e8c96a);background:rgba(232,201,106,.08)}.rs77t:disabled{cursor:default}
.rs77t .ic{height:48px;display:flex;align-items:center;justify-content:center}.rs77t .ic svg{max-height:48px;width:auto}
.rs77t .nm{font-size:12px;line-height:1.15;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.rs77t .ck{font:600 10px var(--mono);color:var(--muted)}.rs77t.on .ck{color:var(--gold,#e8c96a)}
.rs77big{font-size:28px}.rs77dot{display:inline-grid;place-items:center;width:38px;height:38px;border-radius:50%;font:700 18px Georgia,serif;color:#fff}
.rs77empty{color:var(--muted);font-size:13px;margin-top:6px}.rs77sys{margin-top:6px;font-size:12px;color:var(--muted)}.rs77sys summary{cursor:pointer}.rs77sl{margin-top:4px;line-height:1.5}
.st77first{padding:6px 0}.st77fgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.st77f{display:flex;gap:8px;align-items:center;padding:12px;border:1px dashed var(--line,#4a3a28);border-radius:8px;background:rgba(255,255,255,.03);color:inherit;font:inherit;cursor:pointer;text-align:left}.st77f:hover{border-color:var(--gold,#e8c96a)}.st77f span{font-size:22px}
.nm77row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}.nm77row .seg{margin:0!important}
#ngList .lrow{align-items:center}#ngList .lrow .a{display:flex;gap:4px;opacity:.35}#ngList .lrow:hover .a{opacity:1}
.nm77pins{margin-bottom:8px}.nm77pl{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.nm77p{display:inline-flex;gap:4px;align-items:center;padding:3px 4px 3px 10px;border:1px solid var(--line,#4a3a28);border-radius:999px}
.sp77h{margin:6px 0 0}.sp77list{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}.sp77list .lrow{flex-direction:column;align-items:center;text-align:center;border:1px solid var(--line,#4a3a28);border-radius:8px;padding:10px}.sp77list .lrow>svg{width:64px;height:64px}.sp77list .lrow .a{display:flex;gap:4px}
.ed77bar{position:relative;height:18px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden;margin:8px auto;max-width:420px}.ed77fill{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#8a6a2a,var(--gold,#e8c96a))}.ed77bar span{position:relative;font:600 11px var(--mono);line-height:18px}
.sx77h{margin:8px 0 0;color:var(--gold,#e8c96a)}
div:has(> .tseat){min-width:0}.tseat{display:flex!important;gap:6px;align-items:center}.tseat select{flex:1 1 auto;min-width:0;width:auto!important}
*:has(> div > .tseat){display:grid!important;grid-template-columns:repeat(auto-fit,minmax(340px,1fr))!important;gap:8px}
.tseat label.tn77you{white-space:nowrap;border:1px solid var(--line,#4a3a28);border-radius:999px;padding:2px 8px;cursor:pointer}.tseat label.tn77you.on{border-color:var(--gold,#e8c96a);background:rgba(232,201,106,.12)}
@media(max-width:760px){.rs77{grid-template-columns:1fr}.rs77sets{position:static}.trstudio,.trstudio.big{grid-template-columns:1fr!important}#studio .setup-grid{grid-template-columns:1fr!important}}
`;document.head.appendChild(st)}
{const base=studioRedraw;studioRedraw=function(){const r=base.apply(this,arguments);try{st77Tidy()}catch(e){}return r}}
