/* =====================================================================
   430-v115set — v1.15 SETTINGS REORGANISATION (his 1a–8a 2026-10-31 on tools/plans/v115/SETTINGS.md + settings-mock.html).
   LAYOUT ONLY: no SETTINGS key, localStorage key or default changes; every control is LIFTED from the finished v0.98 pages (246 and
   every wrapper after it: 263 277 288 321 396 399 400 417 422) with its data-* attributes, so 12-settings' handlers, 142, 159, 186,
   216, 277, 399, 417 and 422 keep writing the same keys. Wraps settingsHTML LAST (after 396), re-sorts the rows by their controls
   (never by text: translations), and frames the page itself.
   • RAIL: Play (⚔ Play `general` · 💡 Hints `help`) · Look (🖥 Graphics `pieces` · 🏟 Crowd & voices `crowd` NEW · 🎨 Themes) ·
     Sound & access (🔊 Audio · ♿ Accessibility) · Data (💾 Data & saves `data` NEW). Old tab keys still land: tokens → Graphics,
     sponsors → Crowd & voices (24's "editor unlocked" news), visuals → Play, profiles → Themes, saves (no backups shelf) → Data & saves.
   • PLAY: Language · Pace (CPU speed, Animations) · Camera (Follow camera, See-through — buttons Auto / On / Off, translated) ·
     Turns (Confirm before End turn, Confirm attacks — 396's raw checkbox restyled as a normal row with its text, offline only —,
     Event briefing, Context menus, Hot seat: turn the board).
   • HINTS: Hints & help (unchanged) · On the board: Hit feedback Full / Mine / Quiet / OFF, Card reveals, Log on the arena.
     "Off" = the old "Floating combat numbers" switch folded in: it writes SETTINGS.fx=false, EXACTLY today's effect (board
     animations, hit readouts, clean-up crew stop; the text says so); Full / Mine / Quiet write hit100 and fx=true. hit100 is kept
     while Off. (277 kill switch: the old fx switch stays as it was.)
   • GRAPHICS: ONE Quality card (Quality, Lighting — text names the v1.08 torchlight, 422's #l111now / 417's #q110d kept —, Portrait
     detail, Show frame meter) · Pieces (Show token bases, Blood & severed limbs) · Blessings on pillars. 400's s98-edpair is a no-op.
   • CROWD & VOICES: Editors in the box (Editor reacts = SETTINGS.flavius + the 12 city picks) · Voices (Spectator shouts, CPU
     thought bubbles, City-square chatter, Famous visitors).
   • ACCESSIBILITY: Screen shake moves here; the copy of Confirm before End turn goes (it stays in Play).
   • DATA & SAVES: Saves (Open 💾 Saves = 142's data-sv84; a read-only "Settings storage" line ONLY when 422 had to fall back to its
     cookie) · Help us fix it (216's Error log) · Reset (142's Restore all defaults, out of the header). Footer: one line.
   • Unknown rows/cards a later module adds to an old page stay on that page (a "More" card), so nothing is ever lost.
   • Phones (≤ 600 px): the bottom pill row keeps 8 pills with short labels (data-s115); segmented rows wrap instead of clipping
     (CPU speed's ❚❚ Pause). No new motion (nothing to switch off for Reduce motion / Animations Off).
   Kill switch localStorage flavius_v115setoff=1 = v1.14b's layout exactly. Test tv115s.
   ===================================================================== */
const V115S={off:(()=>{try{return localStorage.getItem('flavius_v115setoff')==='1'}catch(e){return false}})()};
const V115S_MAP={general:'general',visuals:'general',help:'help',pieces:'pieces',tokens:'pieces',sponsors:'crowd',crowd:'crowd',
  themes:'themes',profiles:'themes',audio:'audio',access:'access',data:'data',saves:'data'};
const set115On=()=>!V115S.off&&typeof SET98!=='undefined'&&!SET98.off&&typeof set98Row==='function';
/* the rail: [group, icon, [[key, icon, label, phone label]]] (246 reads the first three) */
if(set115On()&&typeof SET98_PAGES!=='undefined')SET98_PAGES.splice(0,SET98_PAGES.length,
  [_T('Play'),'⚙',[['general','⚔',_T('Play')],['help','💡',_T('Hints')]]],
  [_T('Look'),'🏛',[['pieces','🖥',_T('Graphics')],['crowd','🏟',_T('Crowd & voices'),_T('Crowd')],['themes','🎨',_T('Themes')]]],
  [_T('Sound & access'),'♪',[['audio','🔊',_T('Audio')],['access','♿',_T('Accessibility'),_T('Access')]]],
  [_T('Data'),'💾',[['data','💾',_T('Data & saves'),_T('Data')]]]);

function set115Frame(page,inner){
  const rail=SET98_PAGES.map(([g,ic,list])=>`<div class="grp"><span aria-hidden="true">${ic}</span>${g}</div>${list.map(([k,i,l,s])=>`<button type="button" role="tab" data-stab="${k}" class="${page===k?'on':''}" aria-selected="${page===k}"${s?` data-s115="${esc(s)}" aria-label="${esc(String(l).replace(/<[^>]*>/g,''))}"`:''}><span class="ic" aria-hidden="true">${i}</span><span class="l115">${l}</span></button>`).join('')}`).join('');
  return `<div id="s98" class="s98 s115" data-page="${page}"><div class="s98-hd"><h1><span aria-hidden="true">⚙</span> ${_T('Settings')}</h1><span class="sp"></span></div>
    <div class="s98-body"><nav class="s98-rail" role="tablist" aria-label="${_T('Settings sections')}">${rail}</nav><div class="s98-main">${inner}</div></div>
    <div class="s98-foot"><span>${_T('Saved in this browser · changes apply at once')}</span><span class="sp"></span>${_T`<span>arena · v${esc(typeof GAME_VER!=='undefined'?GAME_VER:'')}</span>`}</div></div>`} /* i18n:skip */

/* one row's element (the .s98-row around a control) */
const set115RowOf=(m,sel)=>{const c=m&&m.querySelector(sel);return c?c.closest('.s98-row,label.setrow'):null};
/* where every moved control comes from (source page) — the claims; a row in a source page matching none stays as "More" */
const SET115_CLAIM={
  general:['.s98-lang','[data-sspeed]','[data-anim88]','input[data-set="confirmEnd"]','input[data-set="confirmAtk106"]','input[data-set="cam88"]',
    'input[data-set="briefing"]','input[data-set="ctxMenu"]','input[data-set="famous"]','[data-err92o]','input[data-set="fps100"]'],
  help:['#hint87','input[data-set="fx"]','input[data-set="reveals"]','input[data-set="capFeed"]','input[data-set="shake"]','input[data-set="gore"]',
    '[data-sxray]','input[data-set="hsTurn90"]','input[data-set="shoutsSpect"]','input[data-set="flavius"]','input[data-set="thoughts"]','input[data-set="cityChatter"]'],
  pieces:['[data-q110]','[data-light106]','[data-face99]','[data-hit100]','input[data-set="bases101"]','[data-pots90]','[data-spike98]','.s98-eds']};
/* a row with a new title / description (the control and its state are the lifted one) */
function set115Re(r,t,d){if(!r)return '';const x=r.cloneNode(true);x.removeAttribute('style');
  if(t!=null){const b=x.querySelector('.t>b');if(b)b.textContent=t}
  if(d!=null){const s=x.querySelector('.t>.d');if(s)s.textContent=d;else{const tt=x.querySelector('.t');if(tt){const n=document.createElement('span');n.className='d';n.textContent=d;tt.appendChild(n)}}}
  return x.outerHTML}
const set115Card=(ic,title,rows,o={})=>rows.filter(Boolean).length?set98Card(ic,title,`<div class="s98-rows${o.two?' two':''}">${rows.filter(Boolean).join('')}</div>${o.after||''}`,o):'';
/* what is left on an old page after the claims: cards with controls whole, then loose rows */
function set115Left(m,home){if(!m)return '';const sels=SET115_CLAIM[home]||[];const out=[];
  for(const s of sels)m.querySelectorAll(s).forEach(el=>{const r=el.closest('section.s98-card')&&(s==='#hint87'||s==='.s98-eds'||s==='[data-pots90]')?el.closest('section.s98-card'):(el.closest('.s98-row,label.setrow')||el);r.remove()});
  m.querySelectorAll('section.s98-card,details.s98-card').forEach(c=>{if(c.querySelector('input,select,button')){out.push(c.outerHTML);c.remove()}});
  const rows=[...m.querySelectorAll('.s98-row,label.setrow')].filter(r=>r.querySelector('input,select,button')).map(r=>r.outerHTML);
  return out.join('')+(rows.length?set98Card('⋯',_T('More'),`<div class="s98-rows">${rows.join('')}</div>`):'')}

/* the Hit feedback row with its 4th button (Off = SETTINGS.fx false) */
function set115Hit(r){if(!r)return '';const x=r.cloneNode(true);const seg=x.querySelector('.s98-seg');if(!seg)return x.outerHTML;const off=SETTINGS.fx===false;
  if(off)seg.querySelectorAll('[data-hit100]').forEach(b=>{b.classList.remove('on');b.setAttribute('aria-pressed','false')});
  const b=document.createElement('button');b.type='button';b.dataset.hit115='off';b.className=off?'on':'';b.setAttribute('aria-pressed',String(off));b.textContent=_T('Off');seg.appendChild(b);
  const d=x.querySelector('.t>.d');if(d)d.textContent=_T('Full: your fights in full, others faint. Mine: only your fights. Quiet: only your fighter’s body. Off: no numbers; board animations and the clean-up crew stop too.');
  return x.outerHTML}

function set115Play(src){const G=src('general'),H=src('help');
  let lang='';const L=G&&G.querySelector('.s98-lang');if(L){const x=L.cloneNode(true);const d=x.querySelector('.t>.d');if(d)d.textContent=_T('Game terms (class names, CF, the Fate, Missio) stay English. Switching reloads the page.');lang=x.outerHTML}
  const R=s=>set115RowOf(G,s);
  const xr=set115RowOf(H,'[data-sxray]');let xray='';if(xr){const x=xr.cloneNode(true);const LB={auto:_T('Auto'),on:_T('On'),off:_T('Off')};
    x.querySelectorAll('[data-sxray]').forEach(b=>{const v=b.dataset.sxray;if(LB[v])b.textContent=LB[v];b.setAttribute('aria-pressed',String(b.classList.contains('on')))});
    const d=x.querySelector('.t>.d');if(d)d.textContent=_T('Fade pillars in front of what you look at. X toggles.');xray=x.outerHTML}
  const atk=G&&G.querySelector('input[data-set="confirmAtk106"]');
  const atkRow=atk?set98Row(_T('Confirm attacks'),_T('Asks “Strike …?” before each attack. Not online.'),atk.outerHTML.replace(/\sclass="[^"]*"/,'')):'';
  const pace=set115Card('⏱',_T('Pace'),[set115Re(R('[data-sspeed]'),null,_T('Same as the arena bar; kept between events. Step waits after each CPU action.')),
    set115Re(R('[data-anim88]'),null,_T('Flying stones and spears, the clean-up crew, market rolls. Quick halves them.'))]);
  const cam=set115Card('🎥',_T('Camera'),[set115Re(R('input[data-set="cam88"]')),xray]);
  const turns=set115Card('🎲',_T('Turns'),[set115Re(R('input[data-set="confirmEnd"]'),null,_T('Asks when you still have moves or attacks left.')),atkRow,
    set115Re(R('input[data-set="briefing"]')),set115Re(R('input[data-set="ctxMenu"]')),set115Re(set115RowOf(H,'input[data-set="hsTurn90"]'))]);
  return `<div class="s98-sec"><h2>${_T('Play')}</h2><p>${_T('How a match plays.')}</p></div><div class="s98-stack">${lang}
    ${pace}<div class="s98-grid2">${turns}${cam}</div>${set115Left(G,'general')}</div>`}

function set115Hints(src){const H=src('help'),P=src('pieces');
  const hc=H&&H.querySelector('#hint87');const hints=hc&&hc.closest('section.s98-card')?hc.closest('section.s98-card').outerHTML:'';
  const hit=set115RowOf(P,'[data-hit100]');
  const fx=hit?'':set115Re(set115RowOf(H,'input[data-set="fx"]'));   /* 277 off: the old switch stays */
  const board=set115Card('📣',_T('On the board'),[set115Hit(hit),fx,set115Re(set115RowOf(H,'input[data-set="reveals"]')),
    set115Re(set115RowOf(H,'input[data-set="capFeed"]'),null,_T('The newest log lines over the arena corner. 📌 does the same.'))]);
  return `<div class="s98-sec"><h2>${_T('Hints')}</h2><p>${_T('What the game tells you.')}</p></div><div class="s98-stack"><div class="s98-grid2">${hints}${board}</div>${set115Left(H,'help')}</div>`}

function set115Graphics(src){const P=src('pieces'),G=src('general'),H=src('help');
  const lr=set115RowOf(P,'[data-light106]');let light='';
  if(lr){const x=lr.cloneNode(true);const d=x.querySelector('.t>.d');if(d){const now=d.querySelector('#l111now');d.textContent='';if(now){d.appendChild(now);d.appendChild(document.createTextNode(' '))}
    d.appendChild(document.createTextNode(_T('Full: sun and torch shadows, sand grain, depth. Light: soft shadows at the feet. Off: the flat board, fastest.')));
    try{if(typeof l106Pref==='function'&&typeof L106!=='undefined'&&l106Pref()==='full'&&L106.auto)d.appendChild(document.createTextNode(' '+_T('Now on Light: frames were slow.')))}catch(e){}}light=x.outerHTML}   /* 399's drop note stays */
  const quality=set115Card('⚙',_T('Quality'),[set115Re(set115RowOf(P,'[data-q110]')),light,
    set115Re(set115RowOf(P,'[data-face99]'),null,_T('Light and shade on faces. Light and Off are plainer and faster.')),
    set115Re(set115RowOf(G,'input[data-set="fps100"]'),null,_T('Frames per second in a corner. Keeps the page awake while shown.'))],{span:1});
  const pieces=set115Card('🗿',_T('Pieces'),[set115Re(set115RowOf(P,'input[data-set="bases101"]'),null,_T('The round base under gladiators and beasts.')),
    set115Re(set115RowOf(H,'input[data-set="gore"]'))]);
  const pc=P&&P.querySelector('[data-pots90]');let bless='';if(pc&&pc.closest('section.s98-card')){const x=pc.closest('section.s98-card').cloneNode(true);x.removeAttribute('style');
    const sd=x.querySelector('[data-spike98]');const d=sd&&sd.closest('.s98-row')&&sd.closest('.s98-row').querySelector('.t>.d');if(d)d.textContent=_T('The metal of the spike caps.');bless=x.outerHTML}
  return `<div class="s98-sec"><h2>${_T('Graphics')}</h2><p>${_T('How the arena and its pieces are drawn.')}</p></div><div class="s98-stack">${quality}
    <div class="s98-grid2">${pieces}${bless}</div>${set115Left(P,'pieces')}</div>`}

function set115Crowd(src){const H=src('help'),G=src('general'),P=src('pieces');
  const reacts=set115Re(set115RowOf(H,'input[data-set="flavius"]'),_T('Editor reacts'),_T('Cheers, insults, the odd tear from the box.'));
  const ec=P&&P.querySelector('.s98-eds');const sec=ec&&ec.closest('section.s98-card');let rest='',won='';
  if(sec){const x=sec.cloneNode(true);const h=x.querySelector('h3');if(h)h.remove();rest=`<p class="s98-note s115-note">${_T('Who sits in each city’s box. Win there to unlock its editor.')}</p>`+x.innerHTML;
    try{const n=LOCATIONS.filter((L,i)=>L&&HALL_LOCS.includes(i)).length,all=LOCATIONS.filter(Boolean).length;won=_T`${n} / ${all} cities won`}catch(e){}}
  const eds=set115Card('🎭',_T('Editors in the box'),[reacts],{small:won,after:rest,cls:'s115-eds'});
  const voices=set115Card('🗣',_T('Voices'),[set115Re(set115RowOf(H,'input[data-set="shoutsSpect"]')),set115Re(set115RowOf(H,'input[data-set="thoughts"]')),
    set115Re(set115RowOf(H,'input[data-set="cityChatter"]')),set115Re(set115RowOf(G,'input[data-set="famous"]'))],{two:1});
  return `<div class="s98-sec"><h2>${_T('Crowd & voices')}</h2><p>${_T('Who watches, who talks.')}</p></div><div class="s98-stack">${eds}${voices}</div>`}

/* 422 had to keep the settings in its cookie (a refused localStorage write this visit, or one still pending from the last) */
function set115Refused(){try{return typeof V111SET!=='undefined'&&!V111SET.off&&(V111SET.st.fail>0||(typeof set111CkGet==='function'&&!!set111CkGet()))}catch(e){return false}}
function set115Data(src){const G=src('general');
  const saves=[set98Row(_T('Saves & backups'),_T('Game saves, match saves and backup files.'),`<button type="button" class="btn s98-btn" data-sv84="hub">${_T('Open 💾 Saves')}</button>`),
    set115Refused()?`<div class="s98-row s115-store"><span class="t"><b>${_T('Settings storage')}</b><span class="d">${_T('This browser refused a save: your settings are kept in a backup cookie.')}</span></span><span class="s115-ro" aria-hidden="true">⚠</span></div>`:''];
  const err=set115Re(set115RowOf(G,'[data-err92o]'),_T('🐞 Error log'));
  const reset=set98Row(_T('Restore all defaults'),_T('Settings and theme. Saves stay.'),`<button type="button" class="btn s98-btn" data-rst84="1">${_T('↺ Restore')}</button>`);
  return `<div class="s98-sec"><h2>${_T('Data & saves')}</h2><p>${_T('Your saves, backups and bug reports.')}</p></div><div class="s98-stack">
    ${set115Card('💾',_T('Saves'),saves)}<div class="s98-grid2">${set115Card('🛠',_T('Help us fix it'),[err])}${set115Card('↺',_T('Reset'),[reset])}</div></div>`}

function set115Access(src){const A=src('access'),H=src('help');if(!A)return '';
  const ce=set115RowOf(A,'input[data-set="confirmEnd"]');if(ce)ce.remove();
  const ts=set115RowOf(A,'[data-ts98]');const td=ts&&ts.querySelector('.t>.d');if(td)td.textContent=_T('Panels, log and windows. The arena keeps its size.');
  const sh=set115RowOf(H,'input[data-set="shake"]');const calm=set115RowOf(A,'input[data-set="calm"]');
  if(sh){const t=document.createElement('template');t.innerHTML=set115Re(sh);if(calm)calm.after(t.content);else if(ts)ts.after(t.content)}
  return A.innerHTML}

{const base=settingsHTML;settingsHTML=function(tab){if(!set115On())return base.apply(this,arguments);tab=tab||'general';
  try{const self=this;const memo={};
    const src=k=>{if(!(k in memo)){const t=document.createElement('template');t.innerHTML=String(base.call(self,k)||'');memo[k]=t.content.querySelector('#s98 .s98-main')}return memo[k]};
    if(tab==='saves'&&typeof SET84!=='undefined'&&SET84.full){const m=src('saves');return set115Frame('saves',m?m.innerHTML:'')}
    const p=V115S_MAP[tab]||'general';
    const inner=p==='general'?set115Play(src):p==='help'?set115Hints(src):p==='pieces'?set115Graphics(src):p==='crowd'?set115Crowd(src):p==='data'?set115Data(src)
      :p==='access'?set115Access(src):((src(p)||{}).innerHTML||'');
    if(p==='themes'||p==='audio'){/* unchanged pages */}
    return set115Frame(p,inner)}catch(e){console.error(e);return base.apply(this,arguments)}}}

/* Restore all defaults now lives on Data & saves: 142 redraws General — come back to the page it was pressed on */
if(set115On()&&typeof setRestore84==='function'){const base=setRestore84;setRestore84=function(){const p=(document.querySelector('#s98')||{dataset:{}}).dataset.page;const r=base.apply(this,arguments);
  try{if(p&&p!=='general'){const b=document.querySelector(`#setBody [data-stab="${p}"]`);if(b)b.click()}}catch(e){}return r}}
/* Hit feedback "Off" = the old Floating combat numbers switch off (same write, same live update as 12-settings' checkbox) */
if(set115On()){document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
  const off=t.closest('#s98 [data-hit115]');const hb=!off&&t.closest('#s98 [data-hit100]');if(!off&&!hb)return;
  const want=!off;if((SETTINGS.fx!==false)!==want){SETTINGS.fx=want;try{applySettings()}catch(err){}try{settingsLive('fx')}catch(err){}}
  const seg=(off||hb).parentElement;if(!seg)return;
  if(off)seg.querySelectorAll('[data-hit100]').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});
  seg.querySelectorAll('[data-hit115]').forEach(x=>{x.classList.toggle('on',!!off);x.setAttribute('aria-pressed',String(!!off))})})}

if(set115On()){const st=document.createElement('style');st.textContent=`
.s115 .s98-hd .sp{flex:1}
.s115 .s115-note{margin:10px 0 6px}
.s115 .s115-eds .s98-card>h3 small,.s115-eds>h3 small{white-space:nowrap}
.s115 .s115-store .s115-ro{color:var(--gold2);font-size:18px;flex:none}
.s115 .s98-row .s98-btn{flex:none;white-space:nowrap}
@media (max-width:600px){
 .s115 .s98-rail button[data-s115] .l115{display:none}
 .s115 .s98-rail button[data-s115]::after{content:attr(data-s115)}
 .s115 .s98-row .s98-seg{flex-wrap:wrap;overflow:visible;max-width:100%}
 .s115 .s98-row .s98-seg button{flex:1 1 auto;padding:6px 8px;font-size:13.5px;min-width:0}
}`;document.head.appendChild(st)}
