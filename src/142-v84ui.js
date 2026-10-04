/* =====================================================================
   142-V84UI · v0.84 Settings tidy + the Online landing on one screen (Virgilante's picks 2026-10-04)
   =====================================================================
   A. SETTINGS TIDY (settingsHTML / openSettings wrappers; every earlier wrapper's output is post-processed here):
      • tabs: General · 🎨 Themes · 🗿 Tokens · 🎭 Editors · 🔊 Audio · 💾 Saves (Profiles is gone: openSettings('profiles') → Themes).
      • General opens with 🌐 Language (LANGS84 — English only for now; SETTINGS.lang) and the browser-translate hint.
      • 🎓 Lesson buttons row removed (General + Rules & strategy → Lessons): lessonsMenuVis no longer hides lessons — the
        main menu's 🎓 Tutorials button (126-v82fix) folds #mmLearn, both lessons always inside.
      • ONE text size: Accessibility → Text size is a slider 90–130 % (SETTINGS.tscale; CSS zoom via body.tsz84 + --tsz84 on
        panels/log/side/windows/menu, never the canvas). Themes → "Text & UI size" and the "Large text" theme are gone;
        applyTheme always runs at scale 100. Migration once (localStorage flavius_set84): an old theme scale / Large text →
        SETTINGS.tscale.
      • ONE colour-blind control: Accessibility → Colour-blind select Off / Red-green / Blue-yellow (SETTINGS.cvdMode) applies
        the Red-green safe / Blue-yellow safe theme (keeping your sliders); SETTINGS.cvd (class letters, Okabe–Ito, blue/orange
        badges) is on for Red-green only. Picking a theme in Themes moves the select with it (a cvd theme → its mode, any
        other → Off). applyAccess no longer stomps a theme's class colours when cvd is off.
      • Themes → Arena furniture: Chest (wood) / Chest (gold) pickers removed (135-v83chest draws his chest and reads neither;
        the flat fallback in 07-ui keeps BASE_THEME's defaults). Spikes STAYS: 134-v83spikes' cap still takes its colour
        from THEME.spike (spikePlate82).
      • Tokens → the 🛡 Armor section is gone (his drawn set is the only one).
      • 💾 Saves tab = one line + "Open 💾 Saves" (Settings closes, the Saves window opens on Backups; a screenIntent bridges
        the gap so the menu never flashes). The hub's "🗄 Restore or manage backups" still lands on the full game-save shelf
        (SET84.full, armed by that click only).
      • Themes ends with "💾 Save this look" (the old Profiles: save / apply / delete, same handlers).
      • General: "Confirm before ⏭ End turn" (SETTINGS.confirmEnd, default off): a trusted End turn click in the action dock
        while you can still move or attack asks first (ask76). Never online, in lessons or on CPU turns.
      • General ends with "↺ Restore all defaults" (asks first; SETTINGS_DEF + the Arena theme; saves untouched).
      • Visuals keeps 138-v84's "Light board" row (the Performance item) — nothing else added there.
   B. THE ONLINE LANDING FITS ON ONE SCREEN (desktop > 760 px): the stage keeps its natural height (plate → party slots →
      party code → caption stacked close, the figure beside), the right column's Forum takes the space left (contain:size,
      its feed scrolls inside), Followed houses one line when empty, the Today ribbon one line per card, the playlist cards
      compact (first row visible at 1300×900 / 1440×900 / 1920×1080). Phones keep the one-column scroll. The Victor card
      carries its house chip once (onl84TodayChips de-duplicated).
   ===================================================================== */

/* ================= A · Settings ================= */
const LANGS84=[{k:'en',n:'English'}]; /* more languages join here (Spanish first) */
const TS84={min:90,max:130,step:5};   /* TWEAK: the text-size slider */
const SET84={full:false,armed:false};
const SET84_TABS=[['general','General'],['themes','🎨 Themes'],['tokens','🗿 Tokens'],['sponsors','🎭 Editors'],['audio','🔊 Audio'],['saves','💾 Saves']];
const tsClamp84=v=>{v=Math.round((+v||100)/TS84.step)*TS84.step;return Math.max(TS84.min,Math.min(TS84.max,v))};
/* dead pickers and the Large text theme */
{const dead=['chestWood','chestGold'];for(let i=FURN_TOKENS.length-1;i>=0;i--)if(dead.includes(FURN_TOKENS[i][0]))FURN_TOKENS.splice(i,1)}
delete THEME_PRESETS.large;
/* the theme never scales the page any more: the one text size is SETTINGS.tscale */
{const base=applyTheme;applyTheme=function(t,save){if(t&&t.scale!=null&&+t.scale!==100)t={...t,scale:100};return base.call(this,t||{},save)}}
/* text size + class colours */
{const base=applyAccess;applyAccess=function(){const r=base.apply(this,arguments);try{const b=document.body;if(!b)return r;const v=tsClamp84(SETTINGS.tscale);
  for(const c of [...b.classList])if(/^ts\d+$/.test(c))b.classList.remove(c);b.classList.toggle('tsz84',v!==100);if(v!==100)b.classList.add('ts'+v);b.style.setProperty('--tsz84',String(v/100));
  if(!SETTINGS.cvd&&THEME.classColors)for(const k of Object.keys(THEME.classColors))if(CLASSES[k])CLASSES[k].color=THEME.classColors[k]}catch(e){}return r}}
const CVD84={rg:'deut',by:'trit'};
function cvdFromTheme84(t){t=t||THEME;const cc=t.classColors;if(!cc)return 'off';const same=(a,b)=>!!a&&!!b&&Object.keys(b).every(k=>String(a[k]||'').toLowerCase()===String(b[k]).toLowerCase());
  if(same(cc,THEME_PRESETS.deut.v.classColors))return 'rg';if(same(cc,THEME_PRESETS.trit.v.classColors))return 'by';return 'off'}
function cvdSet84(mode,fromTheme){mode=CVD84[mode]?mode:'off';const was=SETTINGS.cvdMode||'off';SETTINGS.cvdMode=mode;SETTINGS.cvd=mode==='rg';
  if(!fromTheme&&(mode!=='off'||was!=='off')){const u=USER_THEME||THEME;const keep={};for(const k of ['hlAlpha','outZone','warm'])if(u[k]!=null)keep[k]=u[k];
    applyTheme({...(mode==='off'?{}:THEME_PRESETS[CVD84[mode]].v),...keep})}
  applySettings()}
/* migration, once: an old theme scale / Large text → the one text size; the colour-blind switch → the matching mode */
try{if(localStorage.getItem('flavius_set84')!=='1'){const ut=lsGet('theme',{})||{};const sc=+ut.scale||100;
    if(sc!==100&&(!SETTINGS.tscale||+SETTINGS.tscale===100))SETTINGS.tscale=tsClamp84(sc);
    if(SETTINGS.cvdMode==null){const m=cvdFromTheme84(ut);if(m!=='off')SETTINGS.cvdMode=m;else if(SETTINGS.cvd){SETTINGS.cvdMode='rg';applyTheme({...ut,...THEME_PRESETS.deut.v})}else SETTINGS.cvdMode='off';SETTINGS.cvd=SETTINGS.cvdMode==='rg'}
    if(sc!==100)applyTheme({...(USER_THEME||THEME),scale:100});applySettings();localStorage.setItem('flavius_set84','1')}}catch(e){}
try{applyAccess()}catch(e){}

/* the lessons: always both inside the 🎓 Tutorials fold */
lessonsMenuVis=function(){const el=document.getElementById('mmLearn');if(!el)return;for(const b of el.querySelectorAll('[data-mm="learn"],[data-mm="learnmgr"]'))b.hidden=false;el.hidden=false;el.classList.remove('single')};
{const base=lessonsHTML;lessonsHTML=function(){const h=base.apply(this,arguments);return typeof h==='string'?h.replace(/\s*<label class="setrow"[^>]*><input type="checkbox" data-lessonsmenu[\s\S]*?<\/label>/,''):h}}
try{lessonsMenuVis()}catch(e){}

function setTabs84(tab){return `<div class="seg" role="tablist" style="margin-bottom:12px">${SET84_TABS.map(([k,l])=>`<button type="button" role="tab" data-stab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div>`}
const SET84_TABRE=/<div class="seg" role="tablist" style="margin-bottom:12px">[\s\S]*?<\/div>/;
function setGeneral84(h){
  h=h.replace(/<div class="setrow"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-lessonsmenu[\s\S]*?<\/label><\/div>/,'');
  const lang=`<div class="setrow lang84" style="grid-column:1/-1"><span><b>🌐 Language</b><br><span class="hint" data-keep="1" style="margin:0">Your browser's Translate works on this game; game terms stay English.</span></span><select data-lang84="1" aria-label="Language">${LANGS84.map(L=>`<option value="${L.k}" ${(SETTINGS.lang||'en')===L.k?'selected':''}>${esc(L.n)}</option>`).join('')}</select></div>`;
  h=h.replace('<div class="setgrid">','<div class="setgrid">'+lang);
  const cm=SETTINGS.cvdMode||'off';
  const cvd=`<div class="setrow a11yrow cvd84"><span><b>Colour-blind</b><br><span class="hint" style="margin:0">Applies the Red-green safe or Blue-yellow safe theme (🎨 Themes). Red-green also puts a class letter on every token and blue/orange on good/bad.</span></span><select data-cvd84="1" aria-label="Colour-blind">${[['off','Off'],['rg','Red-green'],['by','Blue-yellow']].map(([k,l])=>`<option value="${k}" ${cm===k?'selected':''}>${l}</option>`).join('')}</select></div>`;
  h=h.replace(/<label class="setrow"><input type="checkbox" data-set="cvd"[\s\S]*?<\/label>/,cvd);
  const v=tsClamp84(SETTINGS.tscale);
  const ts=`<label class="setrow slider ts84"><span><b>Text size</b><br><span class="hint" style="margin:0">Panels, log, windows and menus. The arena keeps its size.</span></span><input type="range" min="${TS84.min}" max="${TS84.max}" step="${TS84.step}" data-ts84="1" value="${v}" aria-label="Text size"><output>${v}%</output></label>`;
  h=h.replace(/<div class="setrow a11yrow"><span><b>Text size<\/b>[\s\S]*?<\/div><\/div>/,ts);
  const ce=`<label class="setrow"><input type="checkbox" data-set="confirmEnd" ${SETTINGS.confirmEnd?'checked':''}><span><b>Confirm before ⏭ End turn</b><br><span class="hint" style="margin:0">Asks first while you can still move or attack.</span></span></label>`;
  const at='<label class="setrow"><input type="checkbox" data-set="ctxMenu"';if(h.includes(at))h=h.replace(at,ce+at);
  return h+`<div class="mbtns rst84"><button type="button" class="btn" data-rst84="1">↺ Restore all defaults<small>settings and theme · saves stay</small></button></div>`}
function setThemes84(h,base){
  h=h.replace(/<label class="slider"><span>Text &amp; UI size<\/span>[\s\S]*?<\/label>|<label class="slider"><span>Text & UI size<\/span>[\s\S]*?<\/label>/,'');
  h=h.replace(/Stands, pillars, pots, spikes, the chest and toppled rubble\. Everything here \(colors AND sliders\) is captured when you save a profile below\./,'Stands, pillars, pots, spike caps and toppled rubble. Everything here (colors and sliders) is kept when you save a look below.');
  let p='';try{p=String(base('profiles')||'').replace(SET84_TABRE,'')}catch(e){}
  p=p.replace(/^\s*<p>Save the current colors[\s\S]*?<\/p>/,'<p class="hint" style="margin:0 0 6px">Keep the colors, sliders and options as a named look and switch back any time.</p>').replace('placeholder="Profile name"','placeholder="Look name"').replace('No saved profiles yet.','No saved looks yet.').replace(/class="hint"(?! data-keep)/g,'class="hint" data-keep="1"');
  return h+`<h4 id="look84">💾 Save this look</h4><div class="look84">${p}</div>`}
function setTokens84(h){return h.replace(/<h4 style="margin:12px 0 4px">🛡 Armor<\/h4><p class="rc-sub"[^>]*>[\s\S]*?<\/p>/,'').replace(/<button type="button" class="tokrow[^"]*" data-sarmor="[^"]*">[\s\S]*?<\/button>/g,'')}
{const base=settingsHTML;settingsHTML=function(tab){if(tab==='profiles')tab='themes';tab=tab||'general';
  if(tab==='saves'&&!SET84.full)return setTabs84('saves')+`<div class="sv84"><p>Matches, careers, campaigns and backups live in the 💾 Saves window.</p><div class="mbtns"><button type="button" class="btn primary" data-sv84="hub">💾 Open Saves</button></div></div>`;
  let h=base.call(this,tab);if(typeof h!=='string')return h;
  try{h=h.replace(SET84_TABRE,setTabs84(tab));
    h=h.replace(/<p class="hint"(?! data-keep)/g,'<p class="hint" data-keep="1"'); /* a loose paragraph hint stays a line: as a tooltip it hung on the whole #setBody (52-v50 quietHints) */
    if(tab==='general')h=setGeneral84(h);if(tab==='themes')h=setThemes84(h,t=>base.call(this,t));if(tab==='tokens')h=setTokens84(h)}catch(e){console.error(e)}
  return h}}
{const base=openSettings;openSettings=function(tab){if(tab==='profiles')tab='themes';SET84.full=!!SET84.armed&&tab==='saves';SET84.armed=false;return base.call(this,tab)}}
/* the hub's "Restore or manage backups" is the one way to the full game-save shelf */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#hub76 [data-hubbk="manage"]');if(b)SET84.armed=true},true);
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
  const st=t.closest('#setBody [data-stab]');if(st){SET84.full=false;return}
  const sv=t.closest('#setBody [data-sv84]');if(sv){e.preventDefault();e.stopPropagation();const end=typeof screenIntent==='function'?screenIntent('settings→saves',4000):()=>{};
    try{if(CUR_MODAL)CUR_MODAL.done(1)}catch(err){} /* the hub opens in the same task: no paint between the two windows */
    try{const r=savesHub76('backups');if(r&&r.then)r.then(()=>{},()=>end());else end()}catch(err){end()}return}
  const pr=t.closest('#setBody [data-preset]');if(pr){const k=pr.dataset.preset;cvdSet84(k==='deut'?'rg':k==='trit'?'by':'off',true);return}
  if(t.closest('#setBody [data-sreset]')){cvdSet84('off',true);return}
  if(t.closest('#setBody [data-papply]'))setTimeout(()=>{try{if(SETTINGS.cvdMode==null){SETTINGS.cvdMode=cvdFromTheme84(USER_THEME||THEME);SETTINGS.cvd=SETTINGS.cvdMode==='rg'}applySettings()}catch(err){}},0);
  const rs=t.closest('#setBody [data-rst84]');if(rs){e.preventDefault();e.stopPropagation();
    ask76('↺ Restore all defaults?','Every setting and the theme go back to how the game ships. Your saves, careers and creations stay.','Restore defaults','Cancel').then(ok=>{if(ok)setRestore84()})}},true);
function setRestore84(){SETTINGS={...SETTINGS_DEF,armorStyle:'scan',cvdMode:'off',cvd:false,tscale:100,lang:'en'};
  try{lsSet('hints',SETTINGS.hints?'on':'off')}catch(e){}applySettings();applyTheme({});
  try{settingsLive('tokenStyle')}catch(e){}try{if(typeof audApplyVol==='function')audApplyVol();if(typeof audMuteUI==='function')audMuteUI()}catch(e){}
  try{const g=document.querySelector('#setBody [data-stab="general"]');if(g)g.click()}catch(e){}try{mToast('↺ Settings and theme are back to their defaults.')}catch(e){}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;
  if(t.dataset.lang84){SETTINGS.lang=t.value;applySettings();return}
  if(t.dataset.cvd84){cvdSet84(t.value);return}});
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.ts84)return;SETTINGS.tscale=tsClamp84(t.value);applySettings();const o=t.nextElementSibling;if(o)o.textContent=SETTINGS.tscale+'%'});

/* Confirm before ⏭ End turn */
function endLeft84(p){const out=[];try{if(p.mv>0&&!p.focusRoll&&[...reach(p).tiles].some(([k,c])=>c>0&&c<=p.mv))out.push(`${p.mv} movement`)}catch(e){}
  try{if(attackSources(p).some(s=>targetsFor(p,s).length>0))out.push('an attack')}catch(e){}return out.join(' and ')}
const END84={go:false};
window.addEventListener('click',e=>{if(END84.go||!e.isTrusted||!SETTINGS.confirmEnd)return;const b=e.target.closest&&e.target.closest('[data-act="end"]');if(!b||b.disabled)return;
  try{if(!S||S.over||S.onl||S.sim||HEADLESS||S.phase!=='action'||!humanTurn())return;if(typeof tutLive==='function'&&tutLive())return;
    const dock=b.closest('.acts');if(!dock||!dock.querySelector('[data-act="m-move"]'))return;const left=endLeft84(cur());if(!left)return;
    e.preventDefault();e.stopImmediatePropagation();
    ask76('⏭ End your turn?',`You still have ${left}.`,'End turn','Keep playing').then(ok=>{if(!ok)return;const n=document.querySelector('#actions [data-act="end"]:not([disabled])')||document.querySelector('[data-act="end"]:not([disabled])');
      if(!n)return;END84.go=true;try{n.click()}finally{END84.go=false}})}catch(err){console.error(err)}},true);

{const st=document.createElement('style');st.textContent=`
body.tsz84 #actions,body.tsz84 .logbar,body.tsz84 aside.side,body.tsz84 #mBody,body.tsz84 #mainMenu .mmbtns,body.tsz84 #tip{zoom:var(--tsz84)}
#setBody .lang84,#setBody .cvd84{display:flex;justify-content:space-between;align-items:center;gap:12px}
#setBody .lang84 select,#setBody .cvd84 select{flex:none;min-width:130px;background:var(--ink);color:var(--bone);border:1px solid var(--line2);border-radius:4px;padding:5px 6px}
#setBody .ts84{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:6px 8px;align-content:start}#setBody .ts84>span{grid-column:1/-1}#setBody .ts84 input{width:100%;min-width:0}#setBody .ts84 output{text-align:right;min-width:40px}
#setBody .rst84{margin-top:12px;justify-content:flex-start}#setBody .look84 .acts{margin-top:0}#setBody .sv84 p{margin:0 0 8px}
@media(max-width:520px){#setBody .lang84,#setBody .cvd84{flex-wrap:wrap}}
`;document.head.appendChild(st)}

/* ================= B · the Online landing on one screen ================= */
/* the house chip once per name (and never twice in a row) */
{const base=onl84TodayChips;onl84TodayChips=function(h){let r=base.apply(this,arguments);try{if(typeof r==='string')r=r.replace(/(<button type="button" class="dom84c"[^>]*>[^<]*<\/button>)(?:\s*<button type="button" class="dom84c"[^>]*>[^<]*<\/button>)+/g,'$1')}catch(e){}return r}}
{const st=document.createElement('style');st.textContent=`
@media(min-width:761px){
 #onl .onl-play81{grid-template-rows:auto 1fr auto auto;gap:10px 14px;align-items:start}
 #onl .a81-stage{align-self:stretch}#onl .a81-stage>.onl-stage{height:auto;min-height:100%}
 #onl .onl-stage81{min-height:0;padding:12px 16px 10px;row-gap:8px;align-items:start;align-content:start}
 #onl .onl-stage81 .onl-plate{gap:4px;padding-top:2px;padding-bottom:4px}
 #onl .onl-stage81 .onl-pname{font-size:27px}
 #onl .onl-stage81 .onl-party{gap:8px;row-gap:6px}
 #onl .onl-stage81 .onl-slot{width:74px;height:84px}#onl .onl-stage81 .onl-slot .onl-mini{max-height:62px}
 #onl .onl-stage81 .onl-pbox{flex:1 1 100%;margin-left:2px;gap:4px;display:flex;flex-wrap:wrap;align-items:center}
 #onl .onl-stage81 .onl-pbox>.rc-sub{flex:1 1 100%;margin:0}
 #onl .onl-stage81 .onl-pbox input{height:30px}#onl .onl-stage81 .onl-pbox .btn{padding-top:4px;padding-bottom:4px}
 #onl .onl-stage81 .scap81{margin-top:0}
 #onl .onl-stage81 .onl-fig79{align-self:end;margin-bottom:-4px}
 #onl .a81-week{display:grid;gap:8px}
 #onl .a81-week .wk84{gap:3px;padding:8px 10px}#onl .a81-week .wk84-h b{font-size:14px}#onl .a81-week .wk84-c{font-size:12.5px}#onl .a81-week .wk84-g{font-size:11.5px}
 #onl .a81-forum{align-self:stretch;contain:size;min-height:230px}
 #onl .ofor81{height:100%}#onl .ofor81 .ow-h{margin:0 0 4px}
 #onl .ofor81 .ofor{display:flex;flex-direction:column;min-height:0;flex:1 1 0}
 #onl .ofor81 .ofor-feed{flex:1 1 0;height:auto;min-height:60px;overflow:auto;padding:8px 10px;gap:5px}
 #onl .ofor81 .ofor-chips{flex:none;flex-wrap:nowrap;gap:4px;padding:6px 8px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin}
 #onl .ofor81 .ofor-chips button{flex:none;padding:2px 8px;font-size:12px;white-space:nowrap}
 #onl .fl83:not(:has(.fl83-r)){display:flex;align-items:baseline;gap:8px;padding:6px 10px;min-width:0}
 #onl .fl83:not(:has(.fl83-r))>b{flex:none;font-size:13px}#onl .fl83:not(:has(.fl83-r))>p{margin:0;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
 #onl .fl83{padding:6px 10px}
 #onl .td81-c{min-height:0;padding:5px 10px}
 #onl .td81-t{display:block;line-height:1.25}#onl .td81-t>small{display:block}#onl .td81-t>b{display:inline;font-size:14px}
 #onl .td81-t .dom84c{display:inline-block;vertical-align:1px;margin-left:6px}
 #onl .td81-t>span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 #onl .td81-art .portrait{width:34px!important;height:46px!important}#onl .td81-art{width:34px}
 #onl .td81.quiet{padding:6px 12px}
 #onl .a81-pls .onl-h{margin:2px 0 6px}
 #onl .onl-pls81{gap:10px;grid-template-columns:repeat(auto-fill,minmax(225px,1fr))}
 #onl .onl-pls81>.onl-pl{padding:7px 8px;gap:8px;align-items:center}
 #onl .onl-pls81 .onl-plb{gap:2px}#onl .onl-pls81 .onl-plb b{font-size:15px;line-height:1.15}
 #onl .onl-pls81 .onl-plb small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 #onl .onl-pls81 .onl-plb .acts{flex-wrap:nowrap;gap:4px;margin-top:2px}#onl .onl-pls81 .onl-plb .acts .btn{padding:3px 7px;font-size:12px;white-space:nowrap;min-width:0}
 #onl .onl-pls81 .inf83-art{min-height:70px}
 #onl .pass82{padding:6px 12px;margin-bottom:10px;gap:10px}#onl .pass82-t{font-size:26px}
}
@media(min-width:1100px){#onl .onl-play81{grid-template-columns:minmax(0,1fr) 320px}}
@media(min-width:761px) and (max-width:1099px){#onl .onl-play81{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"stage stage" "today today" "week forum" "pls pls";grid-template-rows:none}}`;document.head.appendChild(st)}
/* the Forum's phrase chips sit on one row: a vertical wheel scrolls them sideways */
document.addEventListener('wheel',e=>{const r=e.target.closest&&e.target.closest('#onl .ofor81 .ofor-chips');if(!r||r.scrollWidth<=r.clientWidth+2||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
  const max=r.scrollWidth-r.clientWidth;if((e.deltaY>0&&r.scrollLeft>=max-1)||(e.deltaY<0&&r.scrollLeft<=0))return;e.preventDefault();r.scrollLeft+=e.deltaY},{passive:false});
