/* =====================================================================
   422-v111set — v1.11c SETTINGS THAT STICK (owner report, Safari on a Mac, live v1.11b: "I have to retoggle all my settings each time.
   It will say one thing in the settings, but loads differently (shadows, etc)"). DISPLAY + PERSISTENCE ONLY: rules, dice (RNG), S, the log,
   match saves, replays and the online hash are untouched — nothing here calls rand() or sends anything.
   Rule (his): the player's explicit choice always wins and persists; Auto only changes what he left on Auto / By quality; the panel shows
   what is in effect.
   • P1 A SAVE THAT IS CHECKED. 12-settings' lsSet swallows a failed localStorage write (Safari's per-site quota is about half of
     Chrome's; every Store collection, Manager world and match slot shares it) — the choice then lives only until the page closes. After
     every saving applySettings (the outermost wrapper but 08's) the settings are written once more and read back (this also stores what
     the later wrappers changed: 417 sets lite84 after the base saved). A failed write → a copy in a cookie (only the keys that differ from
     the defaults, ≤ 3.5 KB, a year; deleted again once a localStorage write works) + one toast a visit; the next load takes the cookie's
     keys over the stale localStorage copy and re-applies them (applySettings(false): 417 / 399 follow).
   • P2 OTHER TABS. A second tab of the game kept its old SETTINGS in memory and its next applySettings wrote them all back over the
     choice made in this tab. Now a 'storage' event for flavius_settings adopts the other tab's values here (the panel redraws if open).
   • P3 THE PANEL SAYS WHAT IS IN EFFECT. Quality Auto said "Now: High." also at Auto's rung 1 (High with Lighting Light — where Auto starts
     on phones, ≤ 4 GB devices and any browser 399 once marked slow, flavius_light106drop) → "Now: High. Lighting: Light."; Lighting
     "By quality" names the level it gives now ("By quality: Light."); both refresh when Auto steps or a button is pressed while the
     window is open.
   • P4 SAFARI: THE TOGGLE, DONE ONCE AFTER LOAD (WebKit path only, 406 P107S.webkit / flavius_v107safariforce=1; the open "no shadows
     after load until Lighting off/on" report, known-issues 2026-10-21/22). The first time a match is on the sand (a new start or 337's
     resume), once the shadow sheets it asked for have loaded (or 6 s) and the board is quiet, everything a Lighting change re-bakes is
     re-baked once — 409's v108Sig path (192's layers AR91.ver, 189's night grade, 399's static layer, 409's torch layers) plus 399's cached
     sprites / cells and 406 W3's bitmap copies — and the board drawn. Costs one Lighting toggle a match. Stats V111SET.st.rebake.
   Kill switch localStorage flavius_v111setoff=1 = v1.11b exactly. Stats V111SET.st (405's recorder report: set111). Test tv111set.
   ===================================================================== */
const V111SET={off:(()=>{try{return localStorage.getItem('flavius_v111setoff')==='1'}catch(e){return true}})(),CK:'flavius_set111',toasted:false,
  S:null,rb:null,st:{saves:0,fail:0,ckW:0,ckDel:0,ckR:0,adopt:0,rebake:0,rbWait:0}};
/* the keys that differ from the defaults (what a cookie copy carries) */
function set111Diff(){const o={};try{for(const k of Object.keys(SETTINGS)){const v=SETTINGS[k];if(JSON.stringify(v)!==JSON.stringify(SETTINGS_DEF[k]))o[k]=v}}catch(e){}return o}
function set111CkGet(){try{const m=document.cookie.match(new RegExp('(?:^|; )'+V111SET.CK+'=([^;]*)'));return m?JSON.parse(decodeURIComponent(m[1])):null}catch(e){return null}}
function set111CkPut(o){try{const v=encodeURIComponent(JSON.stringify(o));if(v.length>3500)return false;
  document.cookie=V111SET.CK+'='+v+';max-age=31536000;path=/;SameSite=Lax';V111SET.st.ckW++;return true}catch(e){return false}}
function set111CkDel(){try{if(document.cookie.indexOf(V111SET.CK+'=')<0)return;document.cookie=V111SET.CK+'=;max-age=0;path=/;SameSite=Lax';V111SET.st.ckDel++}catch(e){}}
/* P1 · write + read back; false = the browser refused it */
function set111Save(){V111SET.st.saves++;let ok=false;const s=JSON.stringify(SETTINGS);
  try{localStorage.setItem('flavius_settings',s);ok=localStorage.getItem('flavius_settings')===s}catch(e){ok=false}
  if(ok){set111CkDel();return true}
  V111SET.st.fail++;set111CkPut(set111Diff());
  if(!V111SET.toasted){V111SET.toasted=true;try{mToastSafe(_T('Settings could not be saved: this browser’s storage for the game is full.'))}catch(e){}}
  return false}
if(!V111SET.off&&typeof applySettings==='function'){const base=applySettings;
  applySettings=function(save){const r=base.apply(this,arguments);if(save!==false)try{set111Save()}catch(e){}return r}}
/* P1 · at load: a cookie copy means the last localStorage write failed — its keys win */
if(!V111SET.off){const ck=set111CkGet();if(ck&&typeof ck==='object'){try{let n=0;for(const k of Object.keys(ck)){if(JSON.stringify(SETTINGS[k])!==JSON.stringify(ck[k])){SETTINGS[k]=ck[k];n++}}
    V111SET.st.ckR++;if(n)applySettings(false);set111Save()}catch(e){}}}

/* P2 · another tab changed the settings: take them here too */
function set111Adopt(json){let o=null;try{o=JSON.parse(json)}catch(e){return}if(!o||typeof o!=='object')return;
  for(const k of Object.keys(SETTINGS))if(!(k in o)&&!(k in SETTINGS_DEF))delete SETTINGS[k];   /* e.g. light106 cleared = By quality */
  for(const k of Object.keys(o))SETTINGS[k]=o[k];V111SET.st.adopt++;
  try{applySettings(false)}catch(e){}
  try{if(document.querySelector('#s98')&&typeof set98Refresh==='function')set98Refresh()}catch(e){}
  try{if(typeof S!=='undefined'&&S&&!HEADLESS)draw()}catch(e){}}
if(!V111SET.off)window.addEventListener('storage',e=>{try{if(e.key==='flavius_settings'&&e.newValue&&e.newValue!==JSON.stringify(SETTINGS))set111Adopt(e.newValue)}catch(x){}});

/* P3 · the panel names what is in effect */
const SET111_LN={full:()=>_T('Full'),light:()=>_T('Light'),off:()=>_T('Off')};
const SET111_TL={high:'full',medium:'light',low:'off'};   /* the lighting each tier gives (417 Q110_R) */
const set111Own=()=>{let v=null;try{v=SETTINGS.light106}catch(e){}return v==='full'||v==='light'||v==='off'?v:null};
/* the lighting level "By quality" gives now (399 l106Pref with no explicit choice) */
function set111QLight(){try{return typeof q110Lv==='function'?q110Lv().light:null}catch(e){return null}}
if(!V111SET.off&&typeof q110Desc==='function'&&typeof Q110!=='undefined'&&!Q110.off){const base=q110Desc;q110Desc=function(){let d=base.apply(this,arguments);
  try{if(Q110.mode==='auto'&&!set111Own()){const l=set111QLight();if(l&&SET111_LN[l]&&l!==SET111_TL[Q110.tier])d+=' '+_T('Lighting')+': '+SET111_LN[l]()+'.'}}catch(e){}return d}}
function set111QNote(){const l=set111QLight();return !set111Own()&&l&&SET111_LN[l]?_T('By quality')+': '+SET111_LN[l]()+'.':''}
if(!V111SET.off&&typeof set98Pieces==='function'&&typeof Q110!=='undefined'&&!Q110.off){const base=set98Pieces;set98Pieces=function(){const h=base.apply(this,arguments);try{
    const t=document.createElement('template');t.innerHTML=h;const q=t.content.querySelector('[data-light106="q"]');const row=q&&q.closest('.s98-row');const d=row&&row.querySelector('.d');
    if(!d)return h;const sp=document.createElement('b');sp.id='l111now';sp.textContent=set111QNote();sp.hidden=!sp.textContent;d.insertBefore(document.createTextNode(' '),d.firstChild);d.insertBefore(sp,d.firstChild);
    return t.innerHTML}catch(e){return h}}}
/* the open window follows a button press or an Auto step */
function set111Live(){try{const d=document.getElementById('q110d');if(d&&typeof q110Desc==='function')d.textContent=q110Desc();
  const n=document.getElementById('l111now');if(n){n.textContent=set111QNote();n.hidden=!n.textContent}}catch(e){}}
if(!V111SET.off){document.addEventListener('click',e=>{const t=e.target;if(t&&t.closest&&t.closest('[data-q110],[data-light106]'))set111Live()});
  if(typeof q110Commit==='function'){const base=q110Commit;q110Commit=function(){const r=base.apply(this,arguments);if(r)set111Live();return r};
    try{Q110.commit=q110Commit}catch(e){}}}

/* P4 · WebKit: re-bake what a Lighting change re-bakes, once the first match's shadow sheets are in */
const set111WK=()=>{try{return typeof P107S!=='undefined'&&!P107S.off&&!!P107S.webkit}catch(e){return false}};
function set111Pending(){try{if(typeof L106==='undefined')return false;for(const k of Object.keys(L106.img)){const o=L106.img[k];if(o&&!o.ok&&!o.bad&&o.im&&!o.im.complete)return true}}catch(e){}return false}
function set111Quiet(){try{if(typeof fxRAF!=='undefined'&&fxRAF)return false;if(typeof AN100!=='undefined'&&AN100.raf)return false;
  if(typeof zoom103Moving==='function'&&zoom103Moving())return false}catch(e){}return true}
function set111Rebake(){const st=V111SET.st;st.rebake++;
  try{if(typeof V108!=='undefined'&&typeof v108Sig==='function'){V108.sig='#';v108Sig()}}catch(e){}   /* 409: AR91.ver++, night grade, L106.layer, torch layers */
  try{if(typeof AR91!=='undefined')AR91.ver++}catch(e){}
  try{if(typeof L106!=='undefined'){L106.layer=null;L106.spr.clear();L106.cc.clear()}}catch(e){}
  try{if(typeof W3!=='undefined'&&W3.live){for(const s of W3.live){const R=W3.rec.get(s);if(R&&R.bm){try{R.bm.close()}catch(x){}R.bm=null;R.cnt=0}}W3.live.clear()}}catch(e){}
  try{if(typeof S!=='undefined'&&S&&!HEADLESS)draw()}catch(e){}}
function set111Arm(){const s=typeof S!=='undefined'?S:null;if(!s||s===V111SET.S||s.sim||HEADLESS)return;V111SET.S=s;if(V111SET.rb)clearTimeout(V111SET.rb);
  const t0=performance.now();const tick=()=>{V111SET.rb=0;if(typeof S==='undefined'||S!==s||S.over)return;
    const late=performance.now()-t0>6000;if(!late&&(set111Pending()||!set111Quiet())){V111SET.st.rbWait++;V111SET.rb=setTimeout(tick,300);return}set111Rebake()};
  V111SET.rb=setTimeout(tick,700)}
if(!V111SET.off&&set111WK()&&typeof BUS!=='undefined'){BUS.on('turn.begin',()=>{try{set111Arm()}catch(e){}});BUS.on('event.start',e=>{if(e&&e.sim)return;try{set111Arm()}catch(x){}})}

/* 405's recorder report */
if(!V111SET.off&&typeof rec107Extra==='function'){const base=rec107Extra;rec107Extra=function(){const o=base.apply(this,arguments)||{};try{o.set111={...V111SET.st,ck:!!set111CkGet()}}catch(e){}return o}}
