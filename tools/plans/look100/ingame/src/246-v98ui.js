/* =====================================================================
   246-V98UI · v0.98 part A — Settings full screen, the Tactics window, the sandstone main menu
   (his approved mock-ups: tools/plans/mock98/settings.html, tactics.html, menu.html)
   =====================================================================
   1 SETTINGS (settingsHTML / openSettings / modal wrappers; every earlier wrapper still builds its rows):
     • opens FULL SCREEN (modal opt.full) with a header (title, Restore all defaults = 142's data-rst84, ✕), a left RAIL
       (Play: General, Hints & board · Look: Board & pieces, Themes · Sound & access: Audio, Accessibility) and a footer
       (💾 Saves → 142's data-sv84 hub). Rail buttons are data-stab="<page>", so 12-settings' own redraw renders a page.
     • pages are built FROM the old tabs' finished HTML: each control (input / select / .seg / button) is lifted out with its
       attributes and state, so every handler (12-settings box.onchange/onclick, 138 lite84, 142 lang/cvd/ts/rst, 159 anim88,
       186 pots90, 190 lang91, 216 err92o) keeps working and every SETTINGS key stays. Old tab keys map to pages
       (tokens/sponsors → pieces, profiles → themes, visuals → general); 'saves' only with SET84.full (the hub's backups shelf).
     • General: Language = one dropdown with the current flag (items are 190's data-lang91 → langSet86: reloads, asks during a
       match), Gameplay rows. Hints & board: hints + parts, On the board, Voices & bubbles. Board & pieces: token styles and
       Blessings on pillars as picture cards (assets/pillar98_pots|tokens.webp, shot from the board), Floor spikes Iron/Bronze
       (THEME.spike), Light board, the Editors grid. Themes: swatch grid, Tune it sliders, Location flavours, Save this look,
       Custom colours folded. Audio: switches, volumes, Try it, the music list. Accessibility: text size (SETTINGS.tscale),
       Reduce motion, colour-blind select, confirm End turn, a live preview.
     • REMOVED rows: the Saves tab, Home-city banners (SETTINGS.banners), Spectator emotes (SETTINGS.emotesSpect) — their
       keys keep whatever value they had. Phones (≤600 px): the rail is a bottom pill row (Studio style).
     • kill switch: localStorage flavius_set98off=1 → the old tabbed window.
   2 TACTICS (showRules replaced; still in SCREEN_OPENERS by name): full screen, tabs Tutorials · Rules at a Glance · What's New ·
     Strategy · Reference (Glossary · Bestiary · Quick Reference) · 📖 The Rulebook (PDF) last. Purple ◆ DIGITAL marks = his house
     rules. Old tab keys map (learn → Tutorials, hist/new → What's New, guide/mguide → Strategy, gloss/best → Reference).
     Ids kept for old readers: #rulTab-build (glance), #rulTab-new, #rulTab-hist (187's tabs of ten), #rulTab-guide,
     #rulTab-mguide (52-v50 glossary roots). Tabs carry data-tac98 (NOT data-rul: 60-v53/227 listeners hide panes on those).
     Quick Reference = assets/quickref98.webp (rulebook p.72) with the digital notes beside it.
   3 MAIN MENU: every button is a sandstone slab (bevel, chiselled frame, stone edge, carved lettering, a carved icon);
     Play Now = porphyry inlay with gold-leaf letters; "Rules" → "Tactics" (mmLabels82 replaced by mm98).
   ===================================================================== */
const SET98={off:false,open:false};
try{SET98.off=localStorage.getItem('flavius_set98off')==='1'}catch(e){}
const SET98_PAGES=[[_T('Play'),'⚙',[['general','🎛',_T('General')],['help','💡',_T('Hints & board')]]],
  [_T('Look'),'🏛',[['pieces','🗿',_T('Board & pieces')],['themes','🎨',_T('Themes')]]],
  [_T('Sound & access'),'♪',[['audio','🔊',_T('Audio')],['access','♿',_T('Accessibility')]]]];
const SET98_MAP={general:'general',visuals:'general',help:'help',pieces:'pieces',tokens:'pieces',sponsors:'pieces',themes:'themes',profiles:'themes',audio:'audio',access:'access'};
const SET98_SPIKE={iron:'#6d6862',bronze:'#9a6a32'}; /* TWEAK: the two spike metals (THEME.spike; iron = the default) */
const TS98=[100,115,130];                            /* TWEAK: the text-size steps */

/* parse one old tab's finished HTML */
function set98T(html){const t=document.createElement('template');t.innerHTML=String(html||'');return t.content}
const set98O=el=>el?el.outerHTML:'';
/* a row: title + one line + the control on the right; a checkbox becomes a switch, the whole row toggles it */
function set98Row(title,desc,ctrl,o={}){if(!ctrl)return '';const isCk=/^<input[^>]*type="checkbox"/.test(ctrl);
  const c=isCk?ctrl.replace(/^<input/,`<input class="${o.ck?'s98-ck':'s98-sw'}"`):ctrl;const tag=isCk?'label':'div';
  return `<${tag} class="s98-row${o.cls?' '+o.cls:''}"${o.span?' style="grid-column:1/-1"':''}>${o.ck?c:''}<span class="t"><b>${title}</b>${desc?`<span class="d">${desc}</span>`:''}</span>${o.ck?'':c}</${tag}>`}
function set98Card(ic,title,inner,o={}){return `<section class="s98-card${o.cls?' '+o.cls:''}"${o.span?' style="grid-column:1/-1"':''}><h3><span class="ic">${ic}</span>${title}${o.small?`<small>${o.small}</small>`:''}</h3>${inner}</section>`}
const set98Seg=(T,sel)=>{const b=T.querySelector(sel);const s=b&&b.closest('.seg');return s?s.outerHTML.replace(/^<div class="seg"/,'<div class="seg s98-seg"'):''}; /* i18n:skip */
const set98In=(T,k)=>set98O(T.querySelector(`input[data-set="${k}"]`));

function set98General(base){const T=set98T(base('general'));
  const cur=(typeof LANG!=='undefined'&&LANG)||'en';const L=(typeof LANGS84!=='undefined'?LANGS84:[{k:'en',n:'English'}]);const curL=L.find(x=>x.k===cur)||L[0];
  const fl=k=>typeof flag91==='function'?flag91(k,22):'';
  const sel=T.querySelector('select[data-lang84]');if(sel)sel.setAttribute('hidden','');
  const lang=`<div class="s98-lang"><span class="ic" aria-hidden="true">🌐</span><span class="t"><b>${_T('Language')}</b><span class="d">${_T('Game terms — class names, CF, the Fate, Missio — stay English in every language. Switching reloads the page (asks first during a match).')}</span></span>
    <div class="s98-ldd" translate="no"><button type="button" class="s98-sel" data-ldd98 aria-haspopup="listbox" aria-expanded="false" aria-label="${_T('Language')}">${fl(curL.k)}<span>${esc(curL.n)}</span><i aria-hidden="true">▼</i></button>
    <div class="s98-menu" role="listbox" hidden>${L.map(x=>`<button type="button" role="option" aria-selected="${x.k===cur}" class="${x.k===cur?'on':''}" data-lang91="${x.k}">${fl(x.k)}<span>${esc(x.n)}</span></button>`).join('')}</div></div>${set98O(sel)}</div>`;
  const rows=[set98Row(_T('CPU speed'),_T('Same switch as the arena bar. Step waits after each CPU action.'),set98Seg(T,'[data-sspeed]')),
    set98Row(_T('Animations'),_T('Flying stones and spears, the clean-up crew, market peeks.'),set98Seg(T,'[data-anim88]')),
    set98Row(_T('Confirm before End turn'),_T('Asks once when you still have moves or attacks left.'),set98In(T,'confirmEnd')),
    set98Row(_T('Follow camera'),_T("When zoomed in, the view follows whoever's turn it is."),set98In(T,'cam88')),
    set98Row(_T('Event briefing'),_T('The rounds, the rules and who fights, when the horns sound.'),set98In(T,'briefing')),
    set98Row(_T('Context menus'),_T('Right-click or long-press anything on the sand for its actions.'),set98In(T,'ctxMenu')),
    set98Row(_T('Famous visitors'),_T('Now and then an emperor, a poet or a legend takes a seat.'),set98In(T,'famous'),{span:1})].join('');
  const err=T.querySelector('[data-err92o]');
  return `<div class="s98-sec"><h2>${_T('General')}</h2><p>${_T('How the game plays and talks to you.')}</p></div><div class="s98-stack">${lang}
    ${set98Card('🎲',_T('Gameplay'),`<div class="s98-rows two">${rows}</div>`)}
    ${err?`<div class="s98-rows">${set98Row(_T('🐞 Error log'),_T('If something misbehaves, copy this into your bug report.'),set98O(err))}</div>`:''}</div>`}

function set98Help(base){const T=set98T(base('general'));const on=!!SETTINGS.hints;
  const sub=(k,t,d)=>set98Row(t,d,set98In(T,k),{ck:1,cls:'sub hint87s'+(on?'':' off hintsoff')}); /* i18n:skip */
  const hints=[set98Row(_T('Hints — master switch'),_T('Every hint at once. Never in Ranked online matches.'),set98In(T,'hints')),
    sub('hintDock',_T('🧭 Strategy panel'),_T('The hint box under your actions.')),sub('rulePops',_T('📖 Rule popups'),_T('A short window the first time a rule comes up.')),
    sub('turnHints',_T('✨ Turn hints'),_T('One suggested move glows gold, with a line on why.')),sub('ruleHints',_T('📜 Rule hints'),_T('Hovering a tile or button adds what the rules say.')),
    sub('turnRecap',_T('📰 Turn recap'),_T('What happened since your last turn.'))].join('');
  const board=[set98Row(_T('Floating combat numbers'),_T('Damage, healing, CF and coin rise from the board.'),set98In(T,'fx')),
    set98Row(_T('Card reveals'),_T('Drawn and played cards show in the arena corner.'),set98In(T,'reveals')),
    set98Row(_T('Log on the arena'),_T('The newest log lines over the arena corner.'),set98In(T,'capFeed')),
    set98Row(_T('Screen shake on big hits'),_T('6+ damage or a fall.'),set98In(T,'shake')),
    set98Row(_T('Blood & severed limbs'),_T('Off hides the red; lost limbs still count.'),set98In(T,'gore')),
    set98Row(_T('See-through'),_T('Fade pillars in front of what you look at (X).'),set98Seg(T,'[data-sxray]')),
    set98Row(_T('Hot seat: turn the board'),_T("Each player's corner turns to the bottom on their turn."),set98In(T,'hsTurn90'))].join('');
  const voices=[set98Row(_T('Spectator shouts'),_T('"Bread and blood!", "Murderer!" and the rest.'),set98In(T,'shoutsSpect')),
    set98Row(_T('The editor in the box'),_T('Flavius reacts — cheers, insults, the odd tear.'),set98In(T,'flavius')),
    set98Row(_T('CPU thought bubbles'),_T('CPU gladiators speak their minds.'),set98In(T,'thoughts')),
    set98Row(_T('City-square chatter'),_T("Townsfolk gossip in the Manager's forum."),set98In(T,'cityChatter'))].join('');
  return `<div class="s98-sec"><h2>${_T('Hints & board')}</h2><p>${_T('What the game tells you, and what shows on the sand.')}</p></div>
    <div class="s98-grid2">${set98Card('💡',_T('Hints & help'),`<div class="s98-rows" id="hint87">${hints}</div>`,{small:_T('H toggles all')})}
    ${set98Card('🎯',_T('On the board'),`<div class="s98-rows">${board}</div>`)}
    ${set98Card('🗣',_T('Voices & bubbles'),`<div class="s98-rows two">${voices}</div>`,{span:1})}</div>`}

function set98Pieces(base){const T=set98T(base('tokens'));const G=set98T(base('general'));
  const TXT={mini3d:[_T('3D minis'),_T("Virgilante's sculpted minis on their bases — the eight classes and the printed beasts.")],figure:[_T('Figures'),_T('Sculpted tokens for every class, beast and creation.')]};
  const rows=[...T.querySelectorAll('[data-tokstyle]')].sort((a,b)=>(a.dataset.tokstyle==='mini3d'?-1:0)-(b.dataset.tokstyle==='mini3d'?-1:0));
  const tok=rows.map(r=>{const k=r.dataset.tokstyle,on=r.classList.contains('on');const lu=r.querySelector('.toklineup');const hd=r.querySelector('.tokrowhd b');
    const [t,d]=TXT[k]||[hd?hd.textContent:k,(r.querySelector('.tokrowhd small')||{}).textContent||''];
    return `<button type="button" class="s98-tok${on?' on':''}" data-tokstyle="${esc(k)}" aria-pressed="${on}"><span class="dot" aria-hidden="true"></span><b>${t}</b><span class="lu">${lu?lu.innerHTML:''}</span><small>${d}</small></button>`}).join('');
  const pot=(typeof SETTINGS!=='undefined'&&SETTINGS.pots90==='tokens')?'tokens':'pots';const img=f=>typeof assetURL==='function'?assetURL(f):'assets/'+f;
  const pic=(k,src,t,d,alt)=>`<button type="button" class="s98-pic${pot===k?' on':''}" data-pots90="${k}" aria-pressed="${pot===k}"><span class="dot" aria-hidden="true"></span><span class="im"><img src="${src}" alt="${alt}"></span><span class="tx"><b>${t}</b><span>${d}</span></span></button>`;
  const pots=pic('pots',img('pillar98_pots.webp'),_T('Clay pots'),_T('A 3D pot on each pillar. When it falls it breaks and the offering lands.'),_T('Clay pot on a pillar'))
    +pic('tokens',img('pillar98_tokens.webp'),_T('Token rounds'),_T('The printed Blessing tokens, face up. A knocked-off token flips to its offering.'),_T('Token rounds on a pillar'));
  const sp=String((typeof THEME!=='undefined'&&THEME.spike)||SET98_SPIKE.iron).toLowerCase()===SET98_SPIKE.bronze?'bronze':'iron';
  const spike=`<div class="seg s98-seg">${[['iron',_T('Iron')],['bronze',_T('Bronze')]].map(([k,l])=>`<button type="button" data-spike98="${k}" class="${sp===k?'on':''}">${l}</button>`).join('')}</div>`;
  const lite=set98Seg(G,'[data-lite84]');
  let eds='',won='';try{const S2=set98T(typeof sponsorSettingsHTML==='function'?sponsorSettingsHTML():'');const dev=S2.querySelector('.card2');const list=S2.querySelector('.sponlist');
    if(list)for(const r of list.querySelectorAll('.sponrow')){const sl=r.querySelector('select[data-spcity]');const li=sl?+sl.dataset.spcity:-1;const box=sl&&sl.parentElement;if(!box)continue;
      box.querySelectorAll('.rc-sub').forEach(x=>x.remove());const u=typeof CITY_SPONSORS!=='undefined'&&CITY_SPONSORS[li];const unl=typeof cityUnlocked==='function'&&cityUnlocked(li);
      const s=document.createElement('div');s.className='es98'+(u&&!unl?'':' ok');s.textContent=!u?_T('Flavius’s own city'):unl?_T('✓ unlocked'):_T('🔒 win here');box.insertBefore(s,sl)}
    eds=(dev?set98O(dev):'')+(list?list.outerHTML.replace(/^<div class="sponlist"/,'<div class="sponlist s98-eds"'):''); /* i18n:skip */
    const n=LOCATIONS.filter((L,i)=>L&&HALL_LOCS.includes(i)).length,all=LOCATIONS.filter(Boolean).length;won=_T`${n} / ${all} cities won · win a match at a city to unlock its editor`}catch(e){}
  return `<div class="s98-sec"><h2>${_T('Board & pieces')}</h2><p>${_T('How gladiators, Blessings and the editor in the box look.')}</p></div><div class="s98-stack"><div class="s98-grid2">
    ${set98Card('🗿',_T('Gladiators & beasts'),`<div class="s98-pics">${tok}</div><p class="s98-note">${_T('Your own creations always wear their own 3D tokens.')}</p>`)}
    ${set98Card('🏺',_T('Blessings on pillars'),`<div class="s98-pics">${pots}</div><div class="s98-rows" style="margin-top:10px">${set98Row(_T('Floor spikes'),_T('The metal of the 3D spike caps.'),spike)}${set98Row(_T('Light board for older phones'),_T('Skips the sand grain and scars. Auto: on sharp phone screens.'),lite)}</div>`)}</div>
    ${eds?set98Card('🎭',_T('Editors in the box'),eds,{small:won}):''}</div>`}

function set98Themes(base){const T=set98T(base('themes'));
  const keys=['ink','panel2','gold','blood2','hp','tileA'];const val=(p,k)=>(p.v&&p.v[k])||(typeof BASE_THEME!=='undefined'?BASE_THEME[k]:'#000');
  const same=(a,b)=>String(a||'').toLowerCase()===String(b||'').toLowerCase();
  let best=null,bestN=-1;for(const [k,p] of Object.entries(THEME_PRESETS)){const ks=Object.keys(p.v||{}).filter(x=>typeof p.v[x]==='string');if(ks.every(x=>same(THEME[x],p.v[x]))&&ks.length>bestN){best=k;bestN=ks.length}}
  if(bestN===0&&!keys.every(k=>same(THEME[k],val({v:{}},k))))best=null;
  const groups={};for(const [k,p] of Object.entries(THEME_PRESETS))(groups[p.g]=groups[p.g]||[]).push([k,p]);
  const gname=g=>/Arenas/.test(g)?_T('Arenas'):g;
  const sw=Object.entries(groups).map(([g,list])=>`<h4>${esc(gname(g))}</h4><div class="s98-sws">${list.map(([k,p])=>{const nm=String(p.n||k).split(' · ');const d=p.d||(k==='arena'?_T('The house colours'):'');
    return `<button type="button" class="s98-swt${best===k?' on':''}" data-preset="${k}" title="${esc(p.d||p.n)}" aria-pressed="${best===k}"><span class="sb98">${keys.map(t=>`<i style="background:${val(p,t)}"></i>`).join('')}</span><span class="nm">${esc(nm[0])}<small>${esc(nm[1]||d)}</small></span></button>`}).join('')}</div>`).join('');
  const sl=k=>{const i=T.querySelector(`input[data-tr="${k}"]`);if(!i)return '';const o=i.nextElementSibling;return `<label class="s98-range"><span>${esc((i.closest('label')||{}).firstElementChild?i.closest('label').firstElementChild.textContent:k)}</span><span class="s98-rl">${set98O(i)}${o&&o.tagName==='OUTPUT'?set98O(o):''}</span></label>`};
  const loc=set98Row(_T('Location flavours'),_T('Each arena tints sand and stone its own way.'),set98In(set98T(base('general')),'locFlavor'));
  const profs=(typeof lsGet==='function'?lsGet('profiles',[]):[])||[];
  const look=`<div class="s98-look"><input type="text" id="profName" maxlength="30" placeholder="${_T('Name — e.g. Night games')}" aria-label="${_T('Look name')}"><button type="button" class="btn s98-gold" data-psave="1">${_T('Save')}</button></div>
    <div class="s98-profs">${profs.map((p,i)=>`<div class="s98-prof"><span class="pv">${['ink','panel2','gold','blood2'].map(t=>`<i style="background:${(p.theme&&p.theme[t])||val({v:{}},t)}"></i>`).join('')}</span><b>${esc(p.name)}</b><button type="button" class="btn" data-papply="${i}">${_T('Apply')}</button><button type="button" class="btn" data-pdel="${i}" aria-label="${_T('Delete')}">✕</button></div>`).join('')||`<p class="s98-note">${_T('No saved looks yet.')}</p>`}</div>`;
  const cust=[...T.querySelectorAll('.swatches')].map(s=>{let h=s.previousElementSibling;while(h&&h.tagName!=='H4')h=h.previousElementSibling;return `<h4>${h?esc(h.textContent):''}</h4>${s.outerHTML}`}).join('');
  const reset=set98O(T.querySelector('[data-sreset]'));
  return `<div class="s98-sec"><h2>${_T('Themes')}</h2><p>${_T('One click changes the whole palette. Your board and your panels follow.')}</p></div>
    <div class="s98-grid2 s98-th"><div class="s98-thg">${sw}</div><div class="s98-stack">
    ${set98Card('✦',_T('Tune it'),`<div class="s98-sliders">${sl('hlAlpha')}${sl('outZone')}${sl('warm')}</div><div class="s98-rows" style="margin-top:12px">${loc}</div>`)}
    ${set98Card('💾',_T('Save this look'),look)}
    <details class="s98-card s98-cust"><summary>${_T('🖌 Custom colours — interface, board, furniture')}</summary>${cust}<div class="mbtns">${reset}</div></details></div></div>`}

function set98Audio(base){const T=set98T(base('audio'));const ai=k=>set98O(T.querySelector(`input[data-aud="${k}"]`));
  const rows=[set98Row(_T('Sound'),_T('M mutes everything.'),ai('on')),set98Row(_T('Arena music'),_T('Grows with the rounds.'),ai('music')),
    set98Row(_T('Sound effects'),_T('Hits, coin, cards, fanfares.'),ai('sfx')),set98Row(_T('Music between events'),_T("Roma's theme, softly."),ai('menu'))].join('');
  const vol=k=>{const i=T.querySelector(`input[data-audv="${k}"]`);if(!i)return '';const o=i.nextElementSibling;return `<label class="s98-range"><span>${k==='mvol'?_T('Music volume'):_T('Effects volume')}</span><span class="s98-rl">${set98O(i)}${o&&o.tagName==='OUTPUT'?set98O(o):''}</span></label>`};
  const tryb=T.querySelector('[data-audtry]');const tryS=tryb?tryb.closest('.seg'):null;
  const tr=T.querySelector('#audTracks');let n=0,tot=0;if(tr){tot=tr.querySelectorAll('.trackrow').length;n=tot-tr.querySelectorAll('.trackrow.locked').length}
  return `<div class="s98-sec"><h2>${_T('Audio')}</h2><p>${_T('Every arena has its own theme, unlocked by winning there.')}</p></div>
    <div class="s98-grid2 s98-au"><div class="s98-stack">${set98Card('🔊',_T('Sound'),`<div class="s98-rows">${rows}</div><div class="s98-sliders" style="margin-top:14px">${vol('mvol')}${vol('svol')}</div>${tryS?`<div class="s98-try"><span>${_T('Try it')}</span>${tryS.outerHTML.replace(/^<div class="seg"/,_T('<div class="seg s98-seg"'))}<span id="audState" hidden></span></div>`:''}`)}</div>
    ${set98Card('🎶',_T('The music'),tr?tr.outerHTML:'',{small:tot?_T`${n} of ${tot} themes yours`:''})}</div>`}

function set98Access(base){const T=set98T(base('general'));const v=typeof tsClamp84==='function'?tsClamp84(SETTINGS.tscale):(+SETTINGS.tscale||100);
  const steps=TS98.includes(v)?TS98:[...TS98,v].sort((a,b)=>a-b);
  const ts=`<div class="seg s98-seg">${steps.map(s=>`<button type="button" data-ts98="${s}" class="${s===v?'on':''}" aria-pressed="${s===v}">${s}%</button>`).join('')}</div>`; /* i18n:skip */
  const cvd=T.querySelector('select[data-cvd84]');
  const rows=[set98Row(_T('Text size'),_T('Panels, log and windows. The arena itself keeps its size.'),ts),
    set98Row(_T('Reduce motion'),_T('No pulses, glows or camera eases. Every effect has a still version.'),set98In(T,'calm')),
    set98Row(_T('Colour-blind colours'),_T('Okabe–Ito class colours, a class letter on every token, blue/orange signals.'),cvd?cvd.outerHTML.replace(/^<select/,'<select class="s98-select"'):''), /* i18n:skip */
    set98Row(_T('Confirm before End turn'),_T('Also in General.'),set98In(T,'confirmEnd'))].join('');
  const chips=(typeof BASE_CLS!=='undefined'?BASE_CLS:[]).map(k=>{const c=CLASSES[k];if(!c)return '';return `<span class="s98-cchip"><i style="background:${c.color}">${esc(c.name[0])}</i>${esc(c.name)}</span>`}).join('');
  const col=k=>(CLASSES[k]&&CLASSES[k].color)||'var(--gold)';const nm=k=>esc((CLASSES[k]&&CLASSES[k].name)||k);
  return `<div class="s98-sec"><h2>${_T('Accessibility')}</h2><p>${_T('Bigger text, calmer motion, colours you can tell apart.')}</p></div>
    <div class="s98-grid2">${set98Card('👁',_T('Reading & motion'),`<div class="s98-rows">${rows}</div>`)}
    <div class="s98-stack">${set98Card('◐',_T('Preview'),`<div class="s98-prev">${chips}</div><div class="s98-sig"><span class="badge" style="border-color:#3d8fd6;color:#9cc8f0">${_T`◆ HP 5`}</span><span class="badge" style="border-color:#e69f00;color:#ffc766">▲ −2 AP</span><span>${_T('signals keep a shape, not only a colour')}</span></div>`)}
    ${set98Card('📜',_T`Text at ${v}%`,`<div class="s98-sample" style="font-size:${(17*v/100).toFixed(1)}px"><div style="border-left-color:${col('hero')}"><b style="color:${col('hero')}">${nm('hero')}</b> ${_T('hits')} <b style="color:${col('slave')}">${nm('slave')}</b>${_T("'s chest for 3")} — <span>${_T('2 AP, 1 HP')}</span></div><div style="border-left-color:${col('slave')}"><b style="color:${col('slave')}">${nm('slave')}</b> ${_T('moves to D-7 and loots a Gladius')}</div><div>${_T`<span>${_T('The crowd roars')} — <b style="color:var(--gold2)">+2 CF</b> ${_T('to')} ${nm('hero')}</span>`}</div></div>`)}
    <div class="s98-kbd"><span aria-hidden="true">⌨</span><span>${_T('<b>Keyboard play is always on.</b> Tab to the board, arrows move the cursor, Enter acts, I reads the board aloud for screen readers.')}</span></div></div></div>`}

function set98Frame(page,inner){
  const rail=SET98_PAGES.map(([g,ic,list])=>`<div class="grp"><span aria-hidden="true">${ic}</span>${g}</div>${list.map(([k,i,l])=>`<button type="button" role="tab" data-stab="${k}" class="${page===k?'on':''}" aria-selected="${page===k}"><span class="ic" aria-hidden="true">${i}</span>${l}</button>`).join('')}`).join('');
  return `<div id="s98" class="s98" data-page="${page}"><div class="s98-hd"><h1><span aria-hidden="true">⚙</span> ${_T('Settings')}</h1><span class="sub">${_T('Saved in this browser · changes apply at once')}</span><span class="sp"></span>
    <button type="button" class="btn s98-btn" data-rst84="1">${_T('↺ Restore all defaults')}</button></div>
    <div class="s98-body"><nav class="s98-rail" role="tablist" aria-label="${_T('Settings sections')}">${rail}</nav><div class="s98-main">${inner}</div></div>
    <div class="s98-foot"><span>${_T('💾 Saves and backups live in')} <button type="button" class="s98-link" data-sv84="hub">${_T('💾 Saves')}</button> ${_T('on the main menu.')}</span><span class="sp"></span>${_T`<span>arena · v${esc(typeof GAME_VER!=='undefined'?GAME_VER:'')}</span>`}</div></div>`} /* i18n:skip */

{const base=settingsHTML;settingsHTML=function(tab){if(SET98.off)return base.apply(this,arguments);tab=tab||'general';
  try{const b=t=>base.call(this,t);
    if(tab==='saves'){if(typeof SET84!=='undefined'&&SET84.full){const h=String(b('saves')).replace(/<div class="seg" role="tablist"[\s\S]*?<\/div>/,'');return set98Frame('saves',`<div class="s98-sec"><h2>${_T('💾 Game saves')}</h2></div>${h}`)}tab='general'}
    const p=SET98_MAP[tab]||'general';
    const inner=p==='help'?set98Help(b):p==='pieces'?set98Pieces(b):p==='themes'?set98Themes(b):p==='audio'?set98Audio(b):p==='access'?set98Access(b):set98General(b);
    return set98Frame(p,inner)}catch(e){console.error(e);return base.apply(this,arguments)}}}
/* the window itself goes full screen */
{const base=openSettings;openSettings=function(){if(SET98.off)return base.apply(this,arguments);SET98.open=true;try{return base.apply(this,arguments)}finally{SET98.open=false}}}
{const base=modal;modal=function(title,body,buttons,opt){if(SET98.open&&typeof body==='string'&&body.indexOf('id="setBody"')>=0)opt={...(opt||{}),full:1,wide:1};return base.call(this,title,body,buttons,opt)}}
function set98Refresh(){const b=document.querySelector('#s98 .s98-rail [data-stab].on');if(b)b.click()}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
  const dd=t.closest('#s98 [data-ldd98]');const menus=document.querySelectorAll('#s98 .s98-menu');
  if(dd){const m=dd.parentElement.querySelector('.s98-menu');const open=m.hidden;m.hidden=!open;dd.setAttribute('aria-expanded',String(open));if(open){const f=m.querySelector('.on')||m.querySelector('button');if(f)f.focus()}return}
  if(!t.closest('#s98 .s98-menu'))menus.forEach(m=>{if(!m.hidden){m.hidden=true;const b=m.parentElement.querySelector('[data-ldd98]');if(b)b.setAttribute('aria-expanded','false')}});
  const ts=t.closest('#s98 [data-ts98]');if(ts){SETTINGS.tscale=typeof tsClamp84==='function'?tsClamp84(+ts.dataset.ts98):+ts.dataset.ts98;applySettings();set98Refresh();return}
  const sp=t.closest('#s98 [data-spike98]');if(sp){const c=SET98_SPIKE[sp.dataset.spike98]||SET98_SPIKE.iron;try{USER_THEME={...(USER_THEME||THEME),spike:c};lsSet('theme',USER_THEME);applyTheme({...THEME,spike:c},false)}catch(err){}try{if(S)draw()}catch(err){}set98Refresh();return}
  if(t.closest('#s98 [data-pots90],#s98 [data-tokstyle]'))setTimeout(()=>{try{const p=document.querySelector('#s98');if(p&&p.dataset.page==='pieces'){
    const pv=t.closest('[data-pots90]');if(pv)p.querySelectorAll('[data-pots90]').forEach(x=>{const on=x===pv;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))})}}catch(err){}},0)});
document.addEventListener('keydown',e=>{const m=e.target&&e.target.closest&&e.target.closest('#s98 .s98-ldd');if(!m)return;const items=[...m.querySelectorAll('.s98-menu button')];const i=items.indexOf(document.activeElement);
  if(e.key==='Escape'){const menu=m.querySelector('.s98-menu');if(!menu.hidden){e.preventDefault();e.stopPropagation();menu.hidden=true;const b=m.querySelector('[data-ldd98]');b.setAttribute('aria-expanded','false');b.focus()}return}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(i<0)return;e.preventDefault();const n=items[(i+(e.key==='ArrowDown'?1:items.length-1))%items.length];if(n)n.focus()}},true);
/* a colour-blind change repaints the preview chips */
document.addEventListener('change',e=>{const t=e.target;if(t&&t.closest&&t.closest('#s98')&&t.dataset&&(t.dataset.cvd84||t.dataset.set==='calm'))setTimeout(set98Refresh,30)});

/* ================= 2 · TACTICS ================= */
const TAC98_TABS=[['tut','🎓',_T('Tutorials')],['build','📜',_T('Rules at a Glance')],['new','✨',_T("What's New")],['strat','🧭',_T('Strategy')],['ref','📚',_T('Reference')]];
const TAC98_MAP={tut:'tut',learn:'tut',build:'build',glance:'build',new:'new',hist:'new',strat:'strat',guide:'strat',mguide:'strat',ref:'ref',gloss:'ref',best:'ref',bestiary:'ref',qr:'ref'};
const TAC98_RULEBOOK='https://drive.google.com/file/d/1gNMkuRG4_kFjeGMBWAdAMaj58CFBbo-t/view';
const TAC98_CT={Instant:'Instant',Declare:'Declare',Anytime:'Anytime',Active:'Active'}; /* i18n:skip */
const tac98Dg=()=>`<span class="dg98">${_T('Digital')}</span>`;
const tac98Pg=p=>`<span class="pg98">p.${p}</span>`;
const tac98DL=html=>`<p class="dl98">${tac98Dg()} ${html}</p>`;
function tac98Glance(){
  const N=['commodus','tholo','lion','bear','wolf','snake'].filter(k=>NPCT[k]);const st=(k,f)=>{const n=NPCT[k];return n?n[f]:''};
  const beasts=`<table class="tb98 n98"><tr><th></th>${N.map(k=>`<th>${esc(k==='lion'?_T('Lion'):NPCT[k].n)}</th>`).join('')}</tr>${[['ap',_T('Attack')],['mv',_T('Move')],['hp','HP'],['coin',_T('Coin')],['cf','CF']].map(([f,l])=>`<tr><td>${l}</td>${N.map(k=>`<td>${st(k,f)}${f==='coin'&&k==='tholo'?'+':''}</td>`).join('')}</tr>`).join('')}</table>`;
  const img=f=>typeof assetURL==='function'?assetURL(f):'assets/'+f;
  return `<div class="leg98"><span>${tac98Dg()} ${_T("a rule only this game uses (Virgilante's house rules)")}</span><span>${tac98Pg(22)} ${_T('the page in the Magnus Edition rulebook')}</span><span class="sp"></span><span>${_T('Printed rules win where a card disagrees.')}</span></div>
  <div class="gl98">
   <div class="gc98" style="grid-area:turn"><h3>⏳ ${_T('A turn')} ${tac98Pg(11)}</h3><div class="ph98">
    <div class="r"><i>I</i><span>${_T('<b>Resolve</b> — beasts in range act; spikes and stones land.')}</span></div>
    <div class="c">${_T`<i>II</i><span>${_T('<b>Choice</b> — take <b>2 coin</b> or draw <b>1 arena card</b>.')}</span>`}</div>
    <div class="a">${_T`<i>III</i><span>${_T('<b>Action</b> — move, up to <b>2 attacks</b>, play cards and offerings, the market, Crowd Favor, trade or truce.')}</span>`}</div>
    <div class="e">${_T`<i>IV</i><span>${_T('<b>End &amp; Manage</b> — swap hands, take loot.')}</span>`}</div></div>
    ${tac98DL(_T('Manage between turns too, while nobody is attacking you.'))}
    <h3 style="margin-top:12px">🃏 ${_T('Arena cards')} ${tac98Pg(72)}</h3><div class="ct98">
     <span class="k" style="background:#e8e2d0;color:#222">${TAC98_CT.Instant}</span><span>${_T('resolves at once')}</span>
     <span class="k" style="background:#8a1c1c;color:#f3d9b0">${TAC98_CT.Declare}</span><span>${_T('declare in phase III, then resolve')}</span>
     <span class="k" style="background:#5a2d6e;color:#f0d26a">${TAC98_CT.Anytime}</span><span>${_T('use whenever you like')}</span>
     <span class="k" style="background:#1f3a1a;color:#b9e08a">${TAC98_CT.Active}</span><span>${_T('stays in play, resolves later')}</span></div></div>
   <div class="gc98" style="grid-area:move"><h3>🏃 ${_T('Movement')}</h3><p>${_T('<b>1 + one per leg</b> (3 with both) · +1 with both greaves · −1 carrying the chest · max 7.')}</p>
    <table class="tb98"><tr><td>${_T('Step (side by side)')}</td><td>1</td></tr><tr><td>${_T('Step (diagonal)')}</td><td>2</td></tr><tr><td>${_T('Push a gladiator')}</td><td>2</td></tr><tr><td>${_T('Topple a pillar')}</td><td>3</td></tr><tr><td>${_T('Focus roll')}</td><td>${_T('all left')}</td></tr></table>
    ${tac98DL(_T('Lifting the Arena Chest costs 1.'))}</div>
   <div class="gc98" style="grid-area:attack"><h3>🎯 ${_T('Attacks')}</h3><p>${_T('<b>2 attacks</b> a turn, one per weapon. Roll hit dice:')}</p>
    <div class="dc98"><img src="${img('die-hit.png')}" alt="${_T('Hit')}"><img src="${img('die-miss.png')}" alt="${_T('Miss')}"><span>${_T('<b>2</b> vs gladiators · <b>4</b> vs beasts · beast vs beast <b>2</b>')}</span></div>
    <p>${_T('Damage goes <b>shield → armor AP → HP</b>.')}</p>${tac98DL(_T('Focus needs ≥3 movement — walk first, Focus with the last 3.'))}</div>
   <div class="gc98" style="grid-area:body"><h3>🛡 ${_T('The body')} ${tac98Pg(22)}</h3><p>${_T('<b>Head · chest · two arms · two legs</b>, each with its own HP (max 7) and the AP of the armor worn there.')}</p>
    <p>${_T('An arm or leg at 0 HP is <b>severed</b> — its armor and weapon fall. Head or chest at 0: <b>out</b>.')}</p>${tac98DL(_T("Focus on a pillar's Blessings: +1 damage on a hit."))}</div>
   <div class="gc98" style="grid-area:crowd"><h3>🌾 ${_T('Crowd Favor')}</h3><table class="tb98"><tr><td>${_T('Unlock the market (this turn)')}</td><td>3 CF</td></tr><tr><td>${_T('Arena Key · Arena card')}</td><td>5 CF</td></tr><tr><td>${_T('Elixir +4 HP · AP Upgrade +3')}</td><td>8 CF</td></tr></table>
    ${tac98DL(_T('At most 3 spectator stones hit one gladiator a turn.'))}</div>
   <div class="gc98" style="grid-area:market"><h3>🏛 ${_T('Market')}</h3><p>${_T('Pay a level, take <b>any weapon</b> or <b>one armor piece</b> from its row. Slot 4 lies face up.')}</p>
    <table class="tb98"><tr><th>${_T('Level')}</th><th>${_T('Coin')}</th></tr><tr><td>I</td><td>4</td></tr><tr><td>II</td><td>8</td></tr><tr><td>III</td><td>12</td></tr></table></div>
   <div class="gc98" style="grid-area:fate"><h3>⚖ ${_T('The Fate')}</h3><p>${_T('Your final CF decides. Winning adds <b>15 CF</b>.')}</p><div class="ft98">
    <div style="background:#4a1813;color:#ffb3a3"><b>&lt;17</b>${_T('condemned')}</div><div style="background:#47391a;color:#f0cf7d"><b>17–19</b>${_T('Thumb of Flavius')}</div>
    <div style="background:#26331f;color:#bfe3b0"><b>20–49</b>${_T('Ludus Flavius')}</div><div style="background:#3a2a18;color:var(--gold2);box-shadow:inset 0 0 0 1px var(--gold)"><b>50+</b>${_T('the rudis')}</div></div>
    <p class="sm98">${_T('Thumb: a d6 of 4+ spares you.')}</p></div>
   <div class="gc98" style="grid-area:deals"><h3>🤝 ${_T('Deals')}</h3><p>${_T('Trade gear and coin, or swear a truce. Flavius may break any truce.')}</p>${tac98DL(_T('One trade-or-truce offer per gladiator, per target, per turn.'))}</div>
   <div class="gc98" style="grid-area:beasts"><h3>🐾 ${_T('Beasts')} ${tac98Pg(72)}</h3>${beasts}<p class="sm98">${_T('Initial state. Tholo and the lions hunt the nearest living thing each Resolve.')}</p></div>
  </div>`}
const TAC98_POPIC={telemachus:'🛡',restless:'😠',endgame:'⚔',boar:'🐗',aggro:'🦁',zone:'⭕',firstTurn:'⏳',mandata:'📜',thumb:'👍'};
function tac98Tut(){const img=f=>typeof assetURL==='function'?assetURL(f):'assets/'+f;
  const done=k=>typeof lessonDone==='function'&&lessonDone(k);
  const card=(k,art,title,desc,n,chips)=>{const d=done(k);return `<div class="ls98"><div class="art" style="background-image:url('${art}')"></div><div class="tx">
    <span class="badge${d?' ok98':''}">${d?_T('✓ Done'):_T('Not taken yet')}</span><h3>${title}</h3><p>${desc}</p>
    <div class="pr98"><i style="width:${d?100:0}%"></i></div><small class="sm98">${d?_T`${n} / ${n} steps`:_T`${n} steps`}</small>
    <div class="st98">${chips.map(c=>`<span class="${d?'ok':''}">${c}</span>`).join('')}</div>
    <button type="button" class="btn${d?'':' primary'}" data-lesson="${k}">${d?_T('↻ Play it again'):_T('▶ Start the lesson')}</button></div></div>`};
  const nC=typeof TUT_STEPS!=='undefined'?TUT_STEPS.length:0,nM=typeof MTUT_STEPS!=='undefined'?MTUT_STEPS.length:0;
  const pops=Object.entries(typeof RULE_POPS!=='undefined'?RULE_POPS:{}).map(([k,r])=>`<details class="pop98"><summary><span class="ic" aria-hidden="true">${TAC98_POPIC[k]||'📖'}</span><span>${r[0]}</span></summary><div class="rulepop">${r[2]&&typeof cardHTML==='function'?cardHTML(r[2],'sm'):''}<div>${r[1]}</div></div></details>`).join('');
  return `<div class="tut98">${card('classic',img('cls_hero.webp'),_T('Learn to Play'),_T('One bout, step by step: the four phases, moving and pushing, attacks and the Focus roll, the market, Crowd Favor and the Fate.'),nC,[_T('Phases'),_T('Moving'),_T('Attacks'),_T('Focus'),_T('Market'),_T('Fate')])}
    ${card('manager',img('map.jpg'),_T('Manager Mode'),_T('Run a ludus through a week: recruiting, the Training Yard and its Doctore, the Armory, the infirmary, Match Week and the city square.'),nM,[_T('Your ludus'),_T('Recruiting'),_T('Training Yard'),_T('Armory'),_T('Infirmary'),_T('Match Week')])}</div>
    <h2 class="h98">📖 ${_T('Rule popups')} <small>${_T('— the short rule windows the game shows the first time; open any of them again')}</small></h2><div class="pops98">${pops}</div>`}
function tac98New(){const m=(typeof MILESTONES!=='undefined'&&MILESTONES[0])||null;if(!m)return '';
  const li=h=>{const s=String(h);const mm=s.match(/^(\p{Extended_Pictographic}️?)\s*/u);return `<li><span class="i" aria-hidden="true">${mm?mm[1]:'◆'}</span><span>${esc(mm?s.slice(mm[0].length):s)}</span></li>`};
  const fx=(m.fx||[]).filter(Boolean);
  return `<div class="wn98"><div class="vc98"><div class="vh"><span class="vn msv">v${esc(m.v)}</span><div><div class="vt">${m.ic||''} ${esc(m.t)}</div><div class="vd">${_T('the newest version')}</div></div></div>
    <ul>${m.hi.map(li).join('')}</ul>${fx.length?`<div class="fx">${_T('Also:')} ${fx.map(esc).join(' · ')}</div>`:''}</div>
    <section class="cd98 hist98"><h3>📜 ${_T('Version history')}</h3><div id="rulTab-hist">${typeof historyHTML==='function'?historyHTML():''}</div></section></div>`}
function tac98Strat(){return `<div class="str98"><section class="cd98"><h3>🎲 ${_T('Play Now Guide')}</h3><div id="rulTab-guide">${typeof playGuideHTML==='function'?playGuideHTML():''}</div></section>
  <section class="cd98"><h3>💼 ${_T('Manager Guide')}</h3><div id="rulTab-mguide">${typeof mgrGuideHTML==='function'?mgrGuideHTML():''}</div></section></div>`}
function tac98Ref(sub){const img=typeof assetURL==='function'?assetURL('quickref98.webp'):'assets/quickref98.webp';
  const note=(t,h)=>`<div class="dn98">${tac98Dg()}<br><b>${t}</b> — ${h}</div>`;
  const subs=[['qr',_T('Quick Reference'),_T('Rulebook page 72 with the digital notes')],['gloss',_T('Glossary'),_T('Every game term, A to Z')],['best',_T('Bestiary'),_T('Every beast, its card and its ledger')]];
  return `<div class="rfh98"><div class="sub98" role="tablist">${subs.map(([k,l])=>`<button type="button" role="tab" data-tac98r="${k}" class="${sub===k?'on':''}" aria-selected="${sub===k}">${l}</button>`).join('')}</div><span class="rfs98">${(subs.find(s=>s[0]===sub)||subs[0])[2]}</span></div>
   <div class="rf98" data-tac98rp="qr" ${sub==='qr'?'':'hidden'}><div class="qr98" role="img" aria-label="${_T('Quick Reference, rulebook page 72')}" style="background-image:url('${img}')"></div><div class="nt98">
    <section class="cd98"><h3>📄 ${_T('Rulebook p.72')}</h3><p>${_T('The printed Quick Reference, as in the box. Where this game plays a rule differently, the note is beside it.')}</p></section>
    ${note(_T('Focus roll'),_T('the page says "all available movement". Here it needs at least 3 and uses all that is left, so you may walk 2 first, then Focus with the last 3.'))}
    ${note(_T('Focus on Blessings'),_T("Focusing on a pillar's Blessings adds +1 damage on a hit, like the Soldier's ability."))}
    ${note(_T('Arena Chest'),_T('lifting it costs 1 movement and is refused at 0.'))}
    ${note(_T('Spectator stones'),_T('at most 3 hit one gladiator a turn; the rest fly wide.'))}
    <section class="cd98 sm98">${_T('Checked against the engine: beast stats, move/push/topple costs, hit dice and damage order all match the page.')}</section></div></div>
   <div class="rfp98" data-tac98rp="gloss" ${sub==='gloss'?'':'hidden'}><div id="rulTab-gl98">${typeof glossaryHTML==='function'?glossaryHTML():''}</div></div>
   <div class="rfp98" data-tac98rp="best" ${sub==='best'?'':'hidden'}><div id="rulTab-be98"><p class="sm98">${_T('Reading the ledgers…')}</p></div></div>`}
const reduceMotion98=()=>{try{return typeof reduceMotion==='function'&&reduceMotion()}catch(e){return false}};
const TAC98_BEASTS=[[_T('Humanoids'),[['tholo','tholo','Tholo'],['commodus','commodus','Commodus']]],[_T('Lions'),[['lion','leo','Leo'],['lion','leaena','Leaena']]],[_T('Birds'),[['zora','zora','Zora']]], /* i18n:skip — English names (data-en84 / beast names / printed card types) */
  [_T('Bears'),[['bear','ursa','Ursa'],['bear','brutum','Brutum']]],[_T('Wolves'),[['wolf','valencia','Valencia'],['wolf','moechus','Moechus']]],[_T('Snakes'),[['snake','glykon','Glykon'],['snake','arenosus','Arenosus']]]]; /* i18n:skip — English names (data-en84 / beast names / printed card types) */
function tac98Tag(t,T){return t==='zora'?_T('golden eagle · ally'):t==='commodus'?_T('the emperor'):T.scan?_T('hunts'):T.huntCF?_T('hunts the crowd’s darling'):T.tameable?_T('tameable'):_T('guards its zone')}
function tac98BCard(t,key,name,sel){let sp;try{sp=nc82Spec(t,key,name)}catch(e){return ''}const T=sp.T;
  return `<button type="button" class="bc98${sel?' sel':''}" data-bc98="${esc(t)}|${esc(key)}|${esc(name)}"><span class="im">${typeof nc82Front==='function'?nc82Front(sp):''}</span><span class="tx">${_T`<b>${esc(sp.name)}</b><small>${T.hp} HP · ${tac98Tag(t,T)}</small>`}</span></button>`}
function tac98BDet(t,key,name){let sp;try{sp=nc82Spec(t,key,name)}catch(e){return ''}const T=sp.T;const st=T.states&&T.states.length===3?T.states:null;
  const rows=st?st.map((x,i)=>[x[4]||'',`${i===0?T.hp:st[i-1][0]-1}–${i===2?1:x[0]}`,x[1],x[2],x[3]]):[[_T('Always'),T.hp,T.ap,T.rng||1,T.mv]];
  const uniq=T.unique82||['tholo','commodus','zora'].includes(t)||(t==='lion'&&/^(leo|leaena)$/i.test(key));
  const kind=[T.custom?_T('your creation'):_T('printed'),uniq?_T('unique'):''].filter(Boolean).join(' · ');
  let rules=[];try{rules=nc82Rules(sp)}catch(e){}
  return `<div class="bdet98"><div class="bimg98">${typeof nc82Front==='function'?nc82Front(sp):''}</div><div class="bimg98">${typeof nc82Back==='function'?nc82Back(sp):''}</div>
    <div class="btx98"><h3>${esc(sp.name)} <small>${esc(T.n)} · ${kind}</small></h3>
    <table class="tb98 n98 bst98"><tr><th>${_T('State')}</th><th>HP</th><th>${_T('Attack')}</th><th>${_T('Range')}</th><th>${_T('Move')}</th></tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>
    ${rules.map(x=>`<p>${esc(x)}</p>`).join('')}${t==='tholo'?tac98DL(_T('A Focus-aimed bolt to his head kills him outright.')):''}</div></div>`}
function tac98BestHTML(){const first=TAC98_BEASTS[0][1][0];
  const grp=(h,list,mine)=>list.length?`<div class="bg98${mine?' mine':''}"><div class="typ98">${h}</div><div class="bgc98">${list.map(([t,k,n])=>tac98BCard(t,k,n,t===first[0]&&k===first[1])).join('')}</div></div>`:'';
  const own={};try{for(const [k,T] of Object.entries(NPCT))if(T&&T.custom){const rec=(CUSTOM.npcs||[]).find(x=>x.id===T.cid);(own[T.n]=own[T.n]||[]).push([k,'',rec?rec.name:T.n])}}catch(e){}
  return `<div class="bgs98">${TAC98_BEASTS.map(([h,l])=>grp(h,l)).join('')}${Object.entries(own).map(([n,l])=>grp(_T`Yours · ${esc(n)}`,l,1)).join('')}</div>
    <div id="be98det">${tac98BDet(...first)}</div>
    <details class="cd98 led98"><summary>📖 ${_T('The ledgers — every city’s beasts, slain, taken and tamed')}</summary><div id="menagBody"><p class="sm98">${_T('Reading the ledgers…')}</p></div></details>`}
async function tac98Best(){const box=document.getElementById('rulTab-be98');if(!box||box.dataset.done)return;box.dataset.done='1';
  try{box.innerHTML=tac98BestHTML()}catch(e){console.error(e)}
  try{if(typeof loadBestiary==='function')await loadBestiary()}catch(e){}
  try{const m=box.querySelector('#menagBody');if(m)m.innerHTML=typeof bestiaryHTML==='function'?bestiaryHTML():''}catch(e){}}
function tac98Show(page,sub){const root=document.getElementById('tac98');if(!root)return;
  root.querySelectorAll('[data-tac98]').forEach(b=>{const on=b.dataset.tac98===page;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on))});
  root.querySelectorAll('.tac98-pane').forEach(p=>{p.hidden=p.dataset.pane!==page});
  if(sub){root.querySelectorAll('[data-tac98r]').forEach(b=>{const on=b.dataset.tac98r===sub;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on))});
    root.querySelectorAll('[data-tac98rp]').forEach(p=>{p.hidden=p.dataset.tac98rp!==sub});
    const s=root.querySelector('.rfs98');const tb=root.querySelector(`[data-tac98r="${sub}"]`);if(s&&tb)s.textContent={qr:_T('Rulebook page 72 with the digital notes'),gloss:_T('Every game term, A to Z'),best:_T('Every beast, its card and its ledger')}[sub]||'';
    if(sub==='best')tac98Best()}
  root.dataset.page=page;const m=root.querySelector('.tac98-main');if(m)m.scrollTop=0}
showRules=function(tab){tab=tab||'build';const page=TAC98_MAP[tab]||'build';const sub=tab==='gloss'?'gloss':(tab==='best'||tab==='bestiary')?'best':'qr';
  const tabs=TAC98_TABS.map(([k,i,l])=>`<button type="button" role="tab" data-tac98="${k}" class="${page===k?'on':''}" aria-selected="${page===k}"><span aria-hidden="true">${i}</span> ${l}</button>`).join('');
  const pane=(k,id,h)=>`<div class="tac98-pane" data-pane="${k}" id="${id}" ${page===k?'':'hidden'}>${h}</div>`;
  const body=`<div id="tac98" class="tac98" data-page="${page}"><div class="s98-hd"><h1><span aria-hidden="true">⚔</span> ${_T('Tactics')}</h1><span class="sub">${_T('Learn it, look it up, win it')}</span><span class="sp"></span></div>
    <nav class="tabs98" role="tablist" aria-label="${_T('Tactics')}">${tabs}<span class="sp"></span><a class="ext" href="${TAC98_RULEBOOK}" target="_blank" rel="noopener">${_T('📖 The Rulebook (PDF) ↗')}</a></nav>
    <div class="tac98-main">${pane('tut','rulTab-tut',tac98Tut())}${pane('build','rulTab-build',tac98Glance())}${pane('new','rulTab-new',tac98New())}${pane('strat','rulTab-strat',tac98Strat())}${pane('ref','rulTab-ref',tac98Ref(sub))}</div></div>`;
  return modal(_T('Tactics'),body,[{label:_T('Close'),value:'x'}],{wide:1,full:1,onOpen:()=>{const mb=$('#mBody');
    if(page==='ref'&&sub==='best')tac98Best();
    mb.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
      const tb=t.closest('[data-tac98]');if(tb){tac98Show(tb.dataset.tac98);return}
      const rb=t.closest('[data-tac98r]');if(rb){tac98Show('ref',rb.dataset.tac98r);return}
      const hc=t.closest('#tac98 .hist98 .h90c');if(hc&&!t.closest('a,button')){hc.classList.toggle('open98');return}
      const bc=t.closest('[data-bc98]');if(bc){const [bt,bk,bn]=bc.dataset.bc98.split('|');const d=document.getElementById('be98det');if(d)d.innerHTML=tac98BDet(bt,bk,bn);
        mb.querySelectorAll('[data-bc98]').forEach(x=>x.classList.toggle('sel',x===bc));if(d&&d.scrollIntoView)d.scrollIntoView({block:'nearest',behavior:reduceMotion98()?'auto':'smooth'});return}
      const l=t.closest('[data-lesson]');if(l){const c=CUR_MODAL;if(c)c.done('x');setTimeout(()=>{if(l.dataset.lesson==='manager')startManagerTutorial();else startTutorial()},120)}})}})};

/* ================= 3 · THE MAIN MENU ================= */
const MM98_IC={
  play:'<path d="M3 2l9.2 9.2-1.4 1.4L1.6 3.4 3 2zm18 0l1.4 1.4-7.1 7.1 2.1 2.1 1.4-1.4 1.4 1.4-2.1 2.1 2.8 2.8-1.4 1.4-2.8-2.8-2.1 2.1-1.4-1.4 1.4-1.4-2.1-2.1-2.1 2.1 1.4 1.4-1.4 1.4-2.1-2.1-2.8 2.8L4.6 20l2.8-2.8-2.1-2.1 1.4-1.4 1.4 1.4L21 2z"/>',
  manager:'<path d="M12 1.5L22 7v1.6H2V7l10-5.5zM4 10h2.4v8H4zm4.5 0h2.4v8H8.5zm4.6 0h2.4v8h-2.4zm4.5 0H20v8h-2.4zM2 19.5h20V22H2z"/>',
  multi:'<path d="M7.5 3a5 5 0 015 5v4.5H10V15h2.5v2H2.5v-2H5v-2.5H2.5V8a5 5 0 015-5zm-2.2 5.6h4.4v1.6H5.3zM16.5 3a5 5 0 015 5v4.5H19V15h2.5v2h-6.2v-2H14v-2.5h-1V8a5 5 0 013.5-5zm-1.6 5.6h3.8v1.6h-3.8zM2 19h20v2H2z"/>',
  studio:'<path d="M14.5 2.5l7 7-2.1 2.1-1.4-1.4-6.4 6.4 1.4 1.4-2.1 2.1-7-7 2.1-2.1 1.4 1.4 6.4-6.4-1.4-1.4 2.1-2.1zM3 18.5l2.5 2.5L3 22.5 1.5 21z"/>',
  tut:'<path d="M12 2c1.6 2.2 2.6 3.8 2.6 5.2A2.6 2.6 0 0112 9.8a2.6 2.6 0 01-2.6-2.6C9.4 5.8 10.4 4.2 12 2zM3 13c0-1.7 1.3-3 3-3h12c2.8 0 5 1.8 5 3.6 0 2.2-3 3.4-6.5 3.4H8.5L6 21H3.5l1.4-4.4C3.7 15.9 3 14.6 3 13z"/>',
  annals:'<path d="M12 21c-1.1-1.7-3.1-3-5.6-3.3C3.4 17.3 2 14.6 2 11.6l1.5.2c-.6-1.8-.3-3.8.8-5.5l1.3 1c.3-1.7 1.3-3.3 2.8-4.3l.8 1.5C8.2 7.6 9.4 12.6 12 16c2.6-3.4 3.8-8.4 2.8-11.5l.8-1.5c1.5 1 2.5 2.6 2.8 4.3l1.3-1c1.1 1.7 1.4 3.7.8 5.5l1.5-.2c0 3-1.4 5.7-4.4 6.1-2.5.3-4.5 1.6-5.6 3.3z"/>',
  rules:'<path d="M5 3h12a3 3 0 013 3v1h-3v12a3 3 0 01-3 3H5a3 3 0 01-3-3v-1h3V6a3 3 0 00-3-3zm2.5 5v1.6h7V8zm0 3.5v1.6h7v-1.6zm0 3.5v1.6h5V15z"/>',
  saves:'<path d="M9 2h6v2h-1v2.2c3.4.9 6 4 6 7.8 0 3-1.6 5.6-4 7v1H8v-1c-2.4-1.4-4-4-4-7 0-3.8 2.6-6.9 6-7.8V4H9zM4 9.5L2 11v4l2 1.5zm16 0V16.5l2-1.5v-4z"/>',
  settings:'<path d="M10.3 2h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9L2 13.7v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8zM12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"/>'};
const MM98=[['play','play','Play Now',()=>_T('Play Now'),'',0],['manager','mgr','Manager Mode',()=>_T('Manager Mode'),'',0],['multi','mp','Multiplayer',()=>_T('Multiplayer'),'',0], /* i18n:skip — English names (data-en84 / beast names / printed card types) */
  ['studio','half','Creator Studio',()=>_T('Creator Studio'),'',0],['tut','half','Tutorials',()=>_T('Tutorials'),'',1],['annals','tab','Annals',()=>_T('Annals'),'',0],['rules','tab','Tactics',()=>_T('Tactics'),'',0], /* i18n:skip — English names (data-en84 / beast names / printed card types) */
  ['saves','tab','Saves',()=>_T('Saves'),'',0],['settings','tab','Settings',()=>_T('Settings'),'',0]]; /* i18n:skip — English names (data-en84 / beast names / printed card types) */
function mm98(){const box=document.querySelector('#mainMenu .mmbtns');if(!box)return;box.classList.add('mm98');
  for(const [k,sz,en,lab,sub,t82] of MM98){const b=box.querySelector(t82?'[data-mm82="tut"]':`[data-mm="${k}"]`);if(!b)continue;const L=lab(),S2=typeof sub==='function'?sub():'';
    if(b.dataset.mm98===L&&b.querySelector('.mm98t'))continue;
    b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${MM98_IC[k]||''}</svg><span class="mm98t">${L}</span>${S2?`<small>${S2}</small>`:''}`;
    b.dataset.mm98=L;b.dataset.en84=en;b.classList.add('ss98','ss98-'+sz);if(k==='rules')b.setAttribute('aria-label',L)}
  for(const b of box.querySelectorAll('#mmLearn>button,#mmMulti>button'))b.classList.add('ss98','ss98-sub')}
mmLabels82=function(){try{mm98()}catch(e){}};
try{mm98()}catch(e){}setTimeout(()=>{try{mm98()}catch(e){}},700);
{const base=menuShow;menuShow=function(){const r=base.apply(this,arguments);try{mm98()}catch(e){}return r}}

/* ================= CSS ================= */
{const st=document.createElement('style');st.textContent=`
/* ---------- the full-screen frame (Settings + Tactics) ---------- */
#modal:has(#s98) #mboxEl,#modal:has(#tac98) #mboxEl{padding:0!important;display:flex;flex-direction:column;overflow:hidden;background:linear-gradient(#1d150f,#160f0b)}
#modal:has(#s98) #mTitle,#modal:has(#s98) #mBtns,#modal:has(#s98) #mPeek,#modal:has(#tac98) #mTitle,#modal:has(#tac98) #mBtns,#modal:has(#tac98) #mPeek{display:none!important}
#modal:has(#s98) #mboxEl,#modal:has(#tac98) #mboxEl{position:relative}
#modal:has(#s98) #mClose,#modal:has(#tac98) #mClose{position:absolute;top:13px;right:24px;z-index:6;width:38px;height:38px;border-radius:50%;border:1px solid var(--line2);background:var(--panel2);display:grid;place-items:center;font-size:22px;line-height:1;color:var(--bone);padding:0;margin:0}
#modal:has(#s98) #mClose:hover,#modal:has(#tac98) #mClose:hover{border-color:var(--gold);color:var(--gold2)}
.s98-hd{padding-right:76px!important}
#modal:has(#s98) #mBody,#modal:has(#tac98) #mBody{flex:1;min-height:0;max-height:none!important;height:100%;overflow:hidden!important;padding:0!important;margin:0!important}
#modal:has(#s98) #setBody{height:100%}
.s98,.tac98{height:100%;display:flex;flex-direction:column;color:var(--bone);font:15px/1.45 var(--body)}
.s98-hd{display:flex;align-items:center;gap:14px;padding:14px 24px 12px;border-bottom:1px solid var(--line2);background:linear-gradient(#21180f,#1a120d);flex:none}
.s98-hd h1{font:400 28px/1 var(--display);color:var(--gold2);letter-spacing:.05em;margin:0;white-space:nowrap}
.s98-hd .sub{color:var(--muted);font-size:13.5px}.s98-hd .sp,.s98-foot .sp,.tabs98 .sp{flex:1}
.s98-x{width:38px;height:38px;flex:none;border-radius:50%;border:1px solid var(--line2);background:var(--panel2);display:grid;place-items:center;font-size:18px;color:var(--bone);cursor:pointer;padding:0}
.s98-x:hover{border-color:var(--gold);color:var(--gold2)}
.s98-btn{padding:7px 13px;font-size:14px}
.s98-body{flex:1;min-height:0;display:flex}
.s98-rail{width:236px;flex:none;margin:16px 0 16px 24px;border:1px solid var(--line2);border-radius:8px;background:var(--panel);overflow:auto;align-self:flex-start;display:flex;flex-direction:column}
.s98-rail .grp{display:flex;align-items:center;gap:7px;padding:7px 12px;font:500 10.5px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);background:#160f0b;border-top:1px solid var(--line2)}
.s98-rail .grp:first-child{border-top:0;border-radius:8px 8px 0 0}
.s98-rail button{display:flex;align-items:center;gap:10px;padding:10px 14px;color:var(--bone);background:none;border:0;border-left:3px solid transparent;border-top:1px solid #ffffff08;font:16.5px var(--body);text-align:left;cursor:pointer;width:100%;border-radius:0}
.s98-rail button .ic{width:22px;text-align:center;font-size:16px}
.s98-rail button:hover{background:#ffffff06;color:var(--gold2)}
.s98-rail button.on{background:linear-gradient(90deg,#3a2a18,#2a1f17);border-left-color:var(--gold);color:var(--gold2)}
.s98-main{flex:1;min-width:0;overflow:auto;padding:16px 24px 24px 22px}
.s98-foot{display:flex;align-items:center;gap:10px;padding:10px 24px;border-top:1px solid var(--line2);background:#150f0b;color:var(--dim);font-size:13px;flex:none}
.s98-link{background:none;border:0;padding:0;color:var(--muted);font:700 13px var(--body);cursor:pointer;text-decoration:underline dotted}.s98-link:hover{color:var(--gold2)}
.s98-sec{margin:0 0 8px;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.s98-sec h2{font:400 21px var(--display);color:var(--gold2);letter-spacing:.04em;margin:0}.s98-sec p{margin:0;color:var(--muted);font-size:15px}
.s98-stack{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;align-content:start;min-width:0}
.s98-grid2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}
.s98-card{background:var(--panel);border:1px solid var(--line2);border-radius:8px;padding:12px 14px;min-width:0;margin:0}
.s98-card>h3{font:400 16px var(--display);color:var(--gold2);letter-spacing:.06em;margin:0 0 8px;display:flex;align-items:center;gap:8px}
.s98-card>h3 small{font:11px var(--mono);color:var(--dim);letter-spacing:0;margin-left:auto;text-align:right}
.s98-rows{display:grid;gap:1px;background:#00000040;border-radius:6px;overflow:hidden;border:1px solid #3a2c1e}
.s98-rows.two{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.s98-row{display:flex;align-items:center;gap:14px;padding:10px 12px;background:var(--panel2);margin:0;cursor:default;min-width:0}
label.s98-row{cursor:pointer}
.s98-row .t{flex:1;min-width:0}.s98-row .t b{display:block;font-weight:700;font-size:17px;color:var(--bone)}
.s98-row .t>.d{display:block;color:var(--muted);font-size:15px;line-height:1.3;margin-top:1px}
.s98-row.sub{padding-left:38px;background:#251b14}.s98-row.hintsoff{pointer-events:none}.s98-row.off .t b,.s98-row.off .t span{opacity:.5}
.s98 input.s98-sw{appearance:none;-webkit-appearance:none;width:42px!important;height:22px!important;min-width:42px;padding:0;flex:none;border-radius:11px;background:#160f0b;border:1px solid #6b5236;position:relative;margin:0;cursor:pointer;transition:background .15s}
.s98-sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#7a6650;transition:left .15s}
.s98 input.s98-sw:checked{background:linear-gradient(#5a431f,#3d2c14);border-color:var(--gold)}
.s98 input.s98-sw:checked::after{left:22px;background:radial-gradient(circle at 40% 35%,#ffe7a6,#d6ab4c 70%)}
.s98 input.s98-ck{appearance:none;-webkit-appearance:none;width:20px!important;height:20px!important;min-width:20px;padding:0;flex:none;border-radius:4px;border:1.5px solid #7a6040;background:#160f0b;display:grid;place-items:center;margin:0;cursor:pointer}
.s98 input.s98-ck:checked{background:linear-gradient(#f0cf7d,#c99a3a);border-color:#f0cf7d}.s98 input.s98-ck:checked::after{content:"✓";font:700 13px/1 var(--body);color:#1a1008}
.s98-sw:focus-visible,.s98-ck:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}
.s98 .s98-seg{display:inline-flex;flex-wrap:nowrap;border:1px solid var(--line2);border-radius:5px;overflow:hidden;flex:none;margin:0;gap:0;background:none;padding:0}
.s98 .s98-seg button{background:var(--panel2);border:0;border-right:1px solid var(--line2);border-radius:0;padding:6px 12px;font-size:14.5px;cursor:pointer;white-space:nowrap;color:var(--bone)}
.s98 .s98-seg button:last-child{border-right:0}
.s98 .s98-seg button.on{background:#3a2a18;color:var(--gold2);box-shadow:inset 0 -2px 0 var(--gold)}
.s98-select{background:#160f0b;color:var(--bone);border:1px solid #6b5236;border-radius:5px;padding:7px 10px;font-size:14px;min-width:200px;flex:none}
.s98-note{color:var(--muted);font-size:12.5px;margin:8px 2px 0}
/* language dropdown */
.s98-lang{display:flex;align-items:center;gap:16px;padding:12px 14px;background:var(--panel2);border:1px solid #3a2c1e;border-radius:6px}
.s98-lang>.ic{font-size:22px}.s98-lang .t{flex:1;min-width:0}.s98-lang .t b{display:block;font-size:17px}.s98-lang .t>.d{display:block;color:var(--muted);font-size:15px}
.s98-ldd{position:relative;flex:none}
.s98-sel{display:flex;align-items:center;gap:10px;background:#160f0b;border:1px solid #6b5236;border-radius:5px;padding:8px 12px;font-size:15px;min-width:260px;cursor:pointer;color:var(--bone)}
.s98-sel i{margin-left:auto;color:var(--gold);font-style:normal;font-size:11px}.s98-sel:hover{border-color:var(--gold)}
.s98-menu{position:absolute;right:0;top:calc(100% + 4px);width:260px;background:#1b130d;border:1px solid var(--gold);border-radius:7px;box-shadow:0 14px 34px #000c;z-index:20;padding:4px;display:grid;gap:1px;max-height:60vh;overflow:auto}
.s98-menu[hidden]{display:none}
.s98-menu button{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:5px;font-size:14.5px;background:none;border:0;color:var(--bone);cursor:pointer;text-align:left}
.s98-menu button.on{background:#3a2a18;color:var(--gold2)}.s98-menu button.on::after{content:"✓";margin-left:auto;color:var(--gold)}
.s98-menu button:hover,.s98-menu button:focus{background:#2a1f17}
/* picture cards */
.s98-pics{display:grid;gap:10px}
.s98-tok,.s98-pic{position:relative;display:flex;border:1px solid var(--line2);border-radius:8px;background:var(--panel2);cursor:pointer;color:var(--bone);text-align:left;font:inherit;min-width:0;overflow:hidden}
.s98-tok{flex-direction:column;gap:6px;padding:12px 14px}
.s98-tok b,.s98-pic .tx b{display:block;font:400 18px var(--display);letter-spacing:.03em}
.s98-tok.on,.s98-pic.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset,0 0 18px #d6ab4c22}
.s98-tok.on b,.s98-pic.on .tx b{color:var(--gold2)}
.s98-tok .lu{display:flex;align-items:flex-end;gap:2px;min-height:64px;overflow:hidden;flex-wrap:nowrap}
.s98-tok .lu>*{flex:none;max-height:76px}.s98-tok .lu svg,.s98-tok .lu img{max-height:76px;width:auto}
.s98-tok small{color:var(--muted);font-size:14.5px;line-height:1.3}
.s98-pic{align-items:center;gap:14px;padding:10px 14px 10px 10px}
.s98-pic .im{flex:none;width:118px;height:150px;border-radius:6px;overflow:hidden;background:#d9c49a;box-shadow:inset 0 0 0 1px #00000060}
.s98-pic .im img{width:100%;height:100%;object-fit:cover;display:block}
.s98-pic .tx>span{display:block;color:var(--muted);font-size:15px;line-height:1.35;margin-top:3px}
.s98 .dot{position:absolute;top:10px;right:10px;width:18px;height:18px;border-radius:50%;border:1.5px solid #7a6040;background:#160f0b}
.s98 .on>.dot{border-color:var(--gold2);background:radial-gradient(circle,var(--gold2) 0 4px,#3a2a18 5px)}
/* editors */
.s98 .s98-eds{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
.s98 .s98-eds .sponrow{display:flex;gap:8px;align-items:center;padding:6px;min-width:0;border:1px solid #3a2c1e;border-radius:7px;background:var(--panel2);margin:0}
.s98 .s98-eds .sponrow>div{min-width:0;font-size:13px;line-height:1.2}.s98 .s98-eds .sponrow b{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.s98 .s98-eds .sponrow .es98{font-size:12px;color:var(--dim);margin:2px 0 4px}.s98 .s98-eds .sponrow .es98.ok{color:var(--gold2)}.s98 .s98-eds .sponrow select{max-width:100%;width:100%;font-size:12.5px;background:#160f0b;color:var(--muted);border:1px solid #4a3826;border-radius:4px;padding:2px 4px}
.s98 .s98-eds .sponrow>:first-child{flex:none;width:44px;height:44px;border-radius:5px;overflow:hidden}
.s98 .s98-eds .sponrow>:first-child svg,.s98 .s98-eds .sponrow>:first-child img{width:44px!important;height:44px!important}
/* themes */
.s98-th{grid-template-columns:minmax(0,1fr) 330px}
.s98-thg h4{font:500 11px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:2px 0 8px;display:flex;gap:8px;align-items:center}
.s98-thg h4::after{content:"";flex:1;height:1px;background:var(--line2)}
.s98-sws{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:14px}
.s98-swt{border:1px solid #3a2c1e;border-radius:7px;overflow:hidden;background:var(--panel2);cursor:pointer;position:relative;padding:0;text-align:left;color:var(--bone);font:inherit}
.s98-swt{display:block;width:100%}.s98-swt .sb98{display:grid;grid-template-columns:1.6fr repeat(5,1fr);width:100%;height:30px}.s98-swt .sb98 i{display:block;width:auto;height:30px}
.s98-swt .nm{display:block;padding:5px 9px 6px;font-size:13px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.s98-swt .nm small{display:block;color:var(--dim);font-size:11.5px;overflow:hidden;text-overflow:ellipsis}
.s98-swt.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}
.s98-swt.on::after{content:"✓";position:absolute;top:5px;right:6px;width:18px;height:18px;border-radius:50%;background:var(--gold2);color:#1a1008;font:700 11px/18px var(--body);text-align:center}
.s98-sliders{display:grid;gap:12px}
.s98-range{display:block;margin:0}.s98-range>span:first-child{display:block;color:var(--muted);font-size:13px;margin-bottom:4px}
.s98-rl{display:flex;align-items:center;gap:10px}.s98-rl input[type=range]{flex:1;min-width:120px;accent-color:var(--gold);margin:0}
.s98-rl output{font:500 12px var(--mono);color:var(--gold2);width:40px;text-align:right}
.s98-look{display:flex;gap:6px}.s98-look input{flex:1;min-width:0;background:#160f0b;color:var(--bone);border:1px solid #6b5236;border-radius:5px;padding:7px 10px;font-size:14px}
.s98-gold{border-color:var(--gold)!important;color:var(--gold2)!important;background:#2e2212!important}
.s98-profs{display:grid;gap:6px;margin-top:10px}
.s98-prof{display:flex;align-items:center;gap:10px;padding:6px 10px;border:1px solid #3a2c1e;border-radius:6px;background:var(--panel2);font-size:14px}
.s98-prof b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.s98-prof .btn{padding:3px 8px;font-size:12.5px}
.s98-prof .pv{display:flex;width:56px;height:18px;border-radius:3px;overflow:hidden;flex:none}.s98-prof .pv i{flex:1}
.s98-cust{padding:10px 14px}.s98-cust>summary{cursor:pointer;color:var(--muted)}.s98-cust h4{margin:10px 0 4px;color:var(--gold2);font:400 14px var(--display)}
/* audio */
.s98-au{grid-template-columns:400px minmax(0,1fr)}
.s98-try{display:flex;align-items:center;gap:10px;margin-top:14px}.s98-try>span:first-child{color:var(--muted);font-size:13px}
.s98 #audTracks .tracklist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.s98 #audTracks .trackrow{border:1px solid #3a2c1e;border-radius:6px;background:var(--panel2);padding:6px 10px;margin:0}
.s98 #audTracks .trackrow.on{border-color:var(--gold)}
.s98 #audTracks details.lk88{grid-column:1/-1;border:1px dashed #4a3826;border-radius:6px;padding:4px 10px}
/* accessibility */
.s98-prev{padding:12px;border-radius:7px;background:#160f0b;border:1px solid #3a2c1e;display:flex;flex-wrap:wrap;gap:6px}
.s98-cchip{display:inline-flex;align-items:center;gap:6px;padding:3px 9px 3px 4px;border-radius:999px;background:var(--panel2);border:1px solid #3a2c1e;font-size:13px}
.s98-cchip i{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font:700 10px var(--mono);color:#140f0b;font-style:normal}
.s98-sig{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px;font-size:13.5px;color:var(--muted)}
.s98-sample{line-height:1.5;display:grid;gap:4px}.s98-sample>div{border-left:3px solid var(--gold);padding-left:9px}.s98-sample span{color:var(--muted)}
.s98-kbd{display:flex;gap:9px;align-items:flex-start;padding:9px 12px;border-radius:6px;background:#2a2014;border:1px solid #5a4424;color:var(--muted);font-size:13px}.s98-kbd b{color:var(--bone)}
/* ---------- Tactics ---------- */
.tabs98{display:flex;gap:0;border-bottom:1px solid var(--line2);padding:0 24px;background:#1a120d;flex:none;overflow-x:auto;scrollbar-width:none}
.tabs98 button{flex:none;display:flex;align-items:center;gap:6px;padding:11px 18px 10px;color:var(--muted);background:none;border:0;border-bottom:3px solid transparent;margin-bottom:-1px;white-space:nowrap;font:15px var(--body);cursor:pointer;border-radius:0}
.tabs98 button:hover{color:var(--gold2)}.tabs98 button.on{color:var(--gold2);border-bottom-color:var(--gold);background:linear-gradient(transparent,#3a2a1840)}
.tabs98 a.ext{flex:none;align-self:center;color:var(--gold);font-size:14px;text-decoration:none;white-space:nowrap;padding:0 4px}
.tac98-main{flex:1;min-height:0;overflow:auto;padding:14px 24px 18px}
.tac98 .cd98{background:var(--panel);border:1px solid var(--line2);border-radius:8px;padding:12px 14px;min-width:0}
.tac98 .cd98>h3{font:400 16px var(--display);color:var(--gold2);letter-spacing:.06em;margin:0 0 8px;display:flex;align-items:center;gap:8px}
.tac98 .cd98 p{margin:0;color:#d9ccb3}
.dg98{display:inline-flex;align-items:center;gap:4px;font:600 10.5px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:#f1e6ff;background:linear-gradient(#7f4fc0,#5d3596);border:1px solid var(--gold);border-radius:3px;padding:2px 5px;vertical-align:1px;white-space:nowrap}
.dg98::before{content:"◆";color:var(--gold2);font-size:9px}
.pg98{font:500 10.5px var(--mono);color:var(--gold);border-bottom:1px dotted #8a6a30;white-space:nowrap;margin-left:auto}
.dl98{border-left:3px solid #a77be0;background:linear-gradient(90deg,#a77be01f,transparent 70%);padding:3px 0 3px 8px!important;margin:4px 0 0!important;border-radius:0 4px 4px 0}
.leg98{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 10px;font-size:14px;color:var(--muted)}.leg98 .sp{flex:1}.leg98 .pg98{margin-left:0}
.gl98{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-areas:"turn move attack body" "turn crowd market fate" "turn deals beasts beasts";gap:10px}
.gc98{background:var(--panel);border:1px solid var(--line2);border-radius:8px;padding:9px 12px 10px;font-size:14.5px;line-height:1.38;position:relative;overflow:hidden;min-width:0}
.gc98::before{content:"";position:absolute;inset:0 0 auto 0;height:2px;background:linear-gradient(90deg,var(--gold),transparent)}
.gc98 h3{display:flex;align-items:center;gap:8px;font:400 17px var(--display);color:var(--gold2);letter-spacing:.05em;margin:0 0 5px}
.gc98 b{color:var(--bone)}.gc98 p{margin:0 0 4px;color:#d9ccb3}
.ph98{display:grid;gap:4px}.ph98 div{display:grid;grid-template-columns:30px 1fr;gap:8px;align-items:baseline}
.ph98 i{font:400 15px var(--display);font-style:normal;text-align:center;border-radius:4px;padding:1px 0}
.ph98 .r i{background:#1f3b38;color:#9fe0d8}.ph98 .c i{background:#3d321a;color:#f0cf7d}.ph98 .a i{background:#43201a;color:#ffb3a3}.ph98 .e i{background:#2d2e33;color:#c9ccd6}
.tb98{width:100%;border-collapse:collapse;font-size:13.5px}.tb98 td{padding:2px 4px;border-bottom:1px solid #ffffff0d}
.tb98 td:last-child{text-align:right;font:500 13px var(--mono);color:var(--gold2);white-space:nowrap}
.tb98 th{font:500 10.5px var(--mono);letter-spacing:.08em;color:var(--dim);text-align:right;padding:0 4px 3px}.tb98 th:first-child{text-align:left}
.tb98.n98 td{text-align:right;font:500 13px var(--mono);color:var(--bone)}.tb98.n98 td:first-child{text-align:left;font:14px var(--body)}
.ft98{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:4px}.ft98 div{border-radius:5px;padding:5px 4px;text-align:center;font-size:12.5px;line-height:1.2;border:1px solid #00000050}.ft98 b{display:block;font:500 15px var(--mono);color:inherit}
.ct98{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center;font-size:13.5px}.ct98 .k{font:400 12px var(--display);letter-spacing:.08em;padding:2px 6px;border-radius:3px;text-align:center;border:1px solid #00000080}
.dc98{display:flex;gap:6px;align-items:center;margin:3px 0}.dc98 img{width:26px;height:26px;border-radius:4px}
.sm98{margin:5px 0 0;font-size:13px;color:var(--muted)}
.tut98{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.ls98{display:flex;gap:18px;padding:18px;border:1px solid var(--line2);border-radius:10px;background:linear-gradient(135deg,#2a1f17,#1f1711);min-width:0}
.ls98 .art{flex:none;width:150px;height:200px;border-radius:8px;background-size:cover;background-position:center;box-shadow:0 6px 18px #000a,0 0 0 1px #6b5236}
.ls98 .tx{flex:1;min-width:0}.ls98 h3{font:400 26px var(--display);color:var(--gold2);letter-spacing:.04em;margin:6px 0 4px}.ls98 p{margin:0 0 10px;color:var(--muted);font-size:15px}
.ls98 .badge.ok98{border-color:#4d7a43;color:#bfe3b0}
.pr98{height:8px;border-radius:4px;background:#160f0b;border:1px solid #3a2c1e;overflow:hidden;margin:6px 0 4px}.pr98 i{display:block;height:100%;background:linear-gradient(90deg,#9c7a33,var(--gold2))}
.st98{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 12px}.st98 span{font-size:12.5px;padding:2px 8px;border-radius:999px;border:1px solid #4a3826;color:var(--muted)}.st98 span.ok{border-color:#4d7a43;color:#bfe3b0}
h2.h98{font:400 20px var(--display);color:var(--gold2);letter-spacing:.04em;margin:20px 0 8px;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}h2.h98 small{font:14px var(--body);color:var(--muted);letter-spacing:0}
.pops98{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.pop98{border:1px solid #3a2c1e;border-radius:7px;background:var(--panel2);font-size:14.5px;min-width:0}
.pop98>summary{display:flex;gap:10px;align-items:center;padding:9px 11px;cursor:pointer;list-style:none}.pop98>summary::-webkit-details-marker{display:none}
.pop98>summary .ic{font-size:20px}.pop98[open]{grid-column:1/-1;border-color:var(--gold)}.pop98 .rulepop{padding:0 12px 12px}
.wn98{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:18px;align-items:start}
.vc98{border:1px solid var(--gold);border-radius:10px;background:radial-gradient(ellipse at 20% 0,#3a2a18,#1f1711 60%);padding:18px 22px;box-shadow:0 0 0 1px #00000060 inset,0 10px 30px #0008}
.vc98 .vh{display:flex;align-items:center;gap:14px;margin-bottom:6px}.vc98 .vn{font:400 40px/1 var(--display);color:var(--gold2)}
.vc98 .vt{font:400 21px var(--display);color:var(--bone);letter-spacing:.03em}.vc98 .vd{font:13px var(--mono);color:var(--dim)}
.vc98 ul{margin:10px 0 0;padding:0;list-style:none;display:grid;gap:7px}.vc98 li{display:grid;grid-template-columns:28px 1fr;gap:8px;font-size:15.5px;color:#e6d9bf;align-items:start}.vc98 li .i{font-size:18px;text-align:center}
.vc98 .fx{margin-top:12px;padding-top:10px;border-top:1px solid #6b523650;color:var(--muted);font-size:14px}
.hist98 .h90tabs{margin-bottom:8px}.hist98 .h90tabs button{font:12px var(--mono);padding:3px 8px}
.hist98 .h90grid{grid-template-columns:minmax(0,1fr)!important;gap:5px}
.hist98 .mstone.h90c{cursor:pointer;padding:7px 10px;border:1px solid #3a2c1e;border-radius:6px;background:var(--panel2)}
.hist98 .h90c .mshd{margin:0;display:flex;align-items:center;gap:10px}.hist98 .h90c .msic{display:none}
.hist98 .h90c .mshd>div{display:flex;align-items:baseline;gap:10px;flex:1}.hist98 .h90c .msv{font:500 13px var(--mono);color:var(--gold2);min-width:46px}
.hist98 .h90c .mshd b{font:400 14.5px var(--body);color:#d9ccb3}.hist98 .h90c .mshd::after{content:"▸";color:var(--dim)}.hist98 .h90c.open98 .mshd::after{content:"▾"}
.hist98 .h90c ul,.hist98 .h90c .h90fx{display:none}.hist98 .h90c.open98 ul,.hist98 .h90c.open98 .h90fx{display:block;margin:6px 0 0}
.str98{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start} /* his rule: the guide's charts stay on one row — the two guides stack */
.rfh98{display:flex;align-items:center;gap:14px;margin-bottom:12px;flex-wrap:wrap}.rfs98{color:var(--muted);font-size:14px}
.sub98{display:inline-flex;gap:4px;padding:3px;border:1px solid var(--line2);border-radius:7px;background:#150f0b}
.sub98 button{padding:6px 14px;border-radius:5px;color:var(--muted);background:none;border:0;font:14px var(--body);cursor:pointer}.sub98 button.on{background:#3a2a18;color:var(--gold2);box-shadow:inset 0 0 0 1px #6b5236}
.rf98{display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:start}.rf98[hidden],.rfp98[hidden],.tac98-pane[hidden]{display:none}
.qr98{height:calc(100vh - 200px);max-height:780px;aspect-ratio:1030/1390;border-radius:6px;box-shadow:0 10px 30px #000c,0 0 0 1px #6b5236;background:50% 47%/108% auto no-repeat #e9dcc0}
.nt98{display:grid;gap:10px}
.dn98{padding:10px 12px;border-radius:7px;border:1px solid #6b4f96;background:linear-gradient(135deg,#2c2140,#1f1711 70%);font-size:14.5px;color:#e6dcf2}.dn98 b{color:#fff}.dn98 .dg98{margin-bottom:5px}
.bgs98{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}.bg98{display:flex;flex-direction:column;min-width:0}.bgc98{display:flex;gap:10px;flex-wrap:wrap}
.typ98{font:500 10.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 8px;display:flex;gap:8px;align-items:center}.typ98::after{content:"";flex:1;height:1px;background:var(--line2);min-width:20px}
.bc98{width:132px;border:1px solid var(--line2);border-radius:8px;background:var(--panel);overflow:hidden;padding:0;cursor:pointer;text-align:left;color:var(--bone);font:inherit;display:block}
.bc98 .im{display:block;width:100%;container-type:inline-size}.bc98 .tx{display:block;padding:6px 9px}.bc98 .tx b{font:400 15px var(--display);color:var(--gold2);display:block}.bc98 .tx small{color:var(--dim);font-size:12px}
.bg98.mine .bc98{border-style:dashed}.bc98.sel{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold),0 0 16px #d6ab4c40}
.bdet98{display:grid;grid-template-columns:200px 200px minmax(0,1fr);gap:16px;margin-top:16px;padding:14px;border:1px solid var(--line2);border-radius:10px;background:var(--panel);align-items:start}
.bimg98{container-type:inline-size;min-width:0}.btx98 h3{font:400 26px var(--display);color:var(--gold2);margin:0 0 8px}.btx98 h3 small{font:14px var(--body);color:var(--muted);margin-left:8px}
.btx98 p{margin:8px 0 0;font-size:15.5px;color:#d9ccb3}.bst98{max-width:460px}.bst98 th{text-align:right}.bst98 th:first-child{text-align:left}
.led98{margin-top:14px}.led98>summary{cursor:pointer;color:var(--gold2);font:400 15px var(--display)}
@media (max-width:600px){.bdet98{grid-template-columns:1fr 1fr}.btx98{grid-column:1/-1}.bc98{width:108px}}
/* ---------- phones ---------- */
@media (max-width:600px){
 #modal:has(#s98) #mClose,#modal:has(#tac98) #mClose{top:9px;right:12px}
 .s98-hd{padding:10px 60px 10px 14px!important;gap:8px}.s98-hd h1{font-size:23px}.s98-hd .sub{display:none}.s98-btn{font-size:12.5px;padding:6px 8px}
 .s98-body{flex-direction:column}
 .s98-rail{order:2;width:auto;margin:0;border-radius:0;border-width:1px 0 0;flex-direction:row;overflow-x:auto;align-self:stretch;flex:none;padding:6px 8px;gap:6px;background:#150f0b;scrollbar-width:none}
 .s98-rail .grp{display:none}
 .s98-rail button{flex:none;width:auto;padding:6px 10px;font-size:13px;border:1px solid var(--line2);border-radius:999px;border-left-width:1px}
 .s98-rail button .ic{width:auto;font-size:14px}.s98-rail button.on{border-color:var(--gold)}
 .s98-main{padding:12px 16px 18px}
 .s98-grid2,.s98-rows.two,.s98-th,.s98-au{grid-template-columns:minmax(0,1fr)!important}
 .s98 .s98-eds{grid-template-columns:1fr 1fr}.s98 #audTracks .tracklist{grid-template-columns:1fr}
 .s98-lang{flex-wrap:wrap}.s98-ldd,.s98-sel{width:100%;min-width:0}.s98-menu{left:0;right:0;width:auto}
 .s98-row{flex-wrap:wrap}.s98-row:has(.s98-seg) .t,.s98-row:has(.s98-select) .t{flex-basis:100%}.s98-select{width:100%}
 .s98 .s98-seg{max-width:100%;overflow-x:auto}
 .s98-sec h2{font-size:19px}.s98-sec p{display:none}.s98-foot{display:none}
 .s98-pic .im{width:84px;height:110px}.s98-tok .lu{min-height:0}
 .tabs98{padding:0 6px}.tabs98 button{padding:10px 10px 9px;font-size:14px}.tabs98 .sp{display:none}
 .tac98-main{padding:10px 14px 16px}
 .gl98{grid-template-columns:minmax(0,1fr);grid-template-areas:none}.gl98 .gc98{grid-area:auto!important}
 .tut98,.wn98,.str98,.rf98{grid-template-columns:minmax(0,1fr)}.pops98{grid-template-columns:1fr 1fr}
 .ls98{flex-direction:column}.ls98 .art{width:100%;height:140px}
 .qr98{height:auto;width:100%}
}
/* ---------- the main menu: sandstone slabs ---------- */
#mainMenu .mmsub{font:500 12.5px var(--mono);letter-spacing:.34em;color:#b9a27f}
#mainMenu .mmed{font:400 15px var(--display);letter-spacing:.42em;color:var(--gold)}
#mainMenu .mmbtns.mm98{width:min(460px,92vw);gap:12px 12px;margin-top:2px}
#mainMenu .mmbtns .ss98{--h:50px;--fs:21px;position:relative;height:var(--h);min-height:var(--h);display:flex!important;align-items:center;justify-content:center;gap:11px;border:0!important;border-radius:5px;cursor:pointer;padding:0 12px!important;
  font:400 var(--fs)/1 var(--display)!important;letter-spacing:.08em;color:#4a3017!important;opacity:1!important;white-space:nowrap;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 .32 0 0 0 0 .22 0 0 0 0 .1 0 0 0 .8 0'/%3E%3C/filter%3E%3Crect width='240' height='120' filter='url(%23n)'/%3E%3C/svg%3E"),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='160'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012 .05' numOctaves='4' seed='9'/%3E%3CfeColorMatrix values='0 0 0 0 .95 0 0 0 0 .85 0 0 0 0 .62 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='600' height='160' filter='url(%23m)'/%3E%3C/svg%3E"),linear-gradient(176deg,#dcc196 0%,#c9a877 38%,#b48f5c 100%)!important;
  background-size:240px 120px,600px 160px,100% 100%!important;
  box-shadow:inset 0 2px 0 rgba(255,244,214,.75),inset 0 -3px 0 rgba(92,60,28,.55),inset 2px 0 0 rgba(255,238,204,.35),inset -2px 0 0 rgba(80,52,24,.4),0 5px 0 #6b4e2b,0 6px 0 #4b3519,0 12px 20px rgba(0,0,0,.65)!important;
  text-shadow:0 1px 0 rgba(255,240,206,.75),0 -1px 0 rgba(60,36,14,.6);transition:transform .12s,box-shadow .12s,filter .12s;margin-bottom:6px}
#mainMenu .mmbtns .ss98::before{content:"";position:absolute;inset:5px;border-radius:3px;border:1px solid rgba(96,64,30,.45);box-shadow:0 1px 0 rgba(255,238,204,.45),inset 0 1px 0 rgba(255,238,204,.35);pointer-events:none}
#mainMenu .mmbtns .ss98::after{content:"";position:absolute;inset:0;border-radius:5px;pointer-events:none;background:linear-gradient(180deg,rgba(255,246,222,.2),transparent 38%,rgba(60,36,14,.16)),radial-gradient(ellipse 120% 160% at 50% 50%,transparent 60%,rgba(70,44,18,.28))}
#mainMenu .mmbtns .ss98 svg{width:calc(var(--fs) + 4px);height:calc(var(--fs) + 4px);fill:#4a3017;filter:drop-shadow(0 1px 0 rgba(255,240,206,.75)) drop-shadow(0 -1px 0 rgba(60,36,14,.5));flex:none;position:relative;z-index:1}
#mainMenu .mmbtns .ss98 .mm98t{position:relative;z-index:1;overflow:hidden;text-overflow:ellipsis}
#mainMenu .mmbtns .ss98:hover,#mainMenu .mmbtns .ss98:focus-visible,#mainMenu .mmbtns .ss98.on{transform:translateY(-2px);filter:brightness(1.06);box-shadow:inset 0 2px 0 rgba(255,244,214,.75),inset 0 -3px 0 rgba(92,60,28,.55),inset 2px 0 0 rgba(255,238,204,.35),inset -2px 0 0 rgba(80,52,24,.4),0 7px 0 #6b4e2b,0 8px 0 #4b3519,0 16px 26px rgba(0,0,0,.7),0 0 0 2px rgba(240,207,125,.55),0 0 22px rgba(240,190,90,.28)!important}
#mainMenu .mmbtns .ss98:active{transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,244,214,.6),inset 0 -2px 0 rgba(92,60,28,.5),0 2px 0 #6b4e2b,0 3px 0 #4b3519,0 5px 10px rgba(0,0,0,.6)!important}
#mainMenu .mmbtns .ss98 small{display:inline!important;font:500 11px var(--body)!important;letter-spacing:.05em;color:#6b4c2a!important;text-shadow:0 1px 0 rgba(255,240,206,.6);margin:0 0 0 2px!important;position:relative;z-index:1}
#mainMenu .mmbtns .ss98-play{--h:68px;--fs:28px}
#mainMenu .mmbtns .ss98-play .mm98t{background:linear-gradient(180deg,#fff2be 0%,#f0cf7d 30%,#b98a2a 62%,#e7c46c 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 1px 0 rgba(60,20,8,.85)) drop-shadow(0 -1px 0 rgba(255,236,190,.35));padding:2px 0}
#mainMenu .mmbtns .ss98-play::before{inset:7px;border:0;background:linear-gradient(180deg,#8f2a1e,#6d1c13 60%,#5a160f);box-shadow:inset 0 2px 4px rgba(0,0,0,.6),inset 0 -1px 0 rgba(255,180,150,.25),0 1px 0 rgba(255,238,204,.55)}
#mainMenu .mmbtns .ss98-play svg{fill:#f0cf7d;filter:drop-shadow(0 1px 0 rgba(60,20,8,.85))}
#mainMenu .mmbtns .ss98-mgr{--h:56px;--fs:23px}#mainMenu .mmbtns .ss98-mp{--h:50px;--fs:20px}#mainMenu .mmbtns .ss98-half{--h:48px;--fs:18px}
#mainMenu .mmbtns .ss98-tab{--h:40px;--fs:14.5px;gap:7px;letter-spacing:.06em;padding:0 6px!important}#mainMenu .mmbtns .ss98-tab::before{inset:4px}
#mainMenu .mmbtns .ss98-sub{--h:42px;--fs:15px;flex:1 1 0;min-width:0}
#mainMenu .mmbtns.mm98>.mmrow{gap:10px}
#mainMenu .mmbtns.mm98 #mmLearn,#mainMenu .mmbtns.mm98 #mmMulti{gap:10px}
#mainMenu .mmbtns .ss98[disabled]{filter:grayscale(.5) brightness(.8);cursor:not-allowed}
body.calm #mainMenu .mmbtns .ss98{transition:none}
@media (max-width:600px){#mainMenu .mmbtns.mm98{width:100%;padding:0 16px;box-sizing:border-box}#mainMenu .mmbtns .ss98{--fs:17px}#mainMenu .mmbtns .ss98-play{--fs:23px;--h:60px}#mainMenu .mmbtns .ss98-tab{--fs:13px}#mainMenu .mmbtns .ss98-half{--fs:15px;letter-spacing:.04em}#mainMenu .mmsub{letter-spacing:.16em}#mainMenu .mmed{letter-spacing:.3em}#mainMenu .mmbtns .ss98 small{display:none!important}}
`;document.head.appendChild(st)}
