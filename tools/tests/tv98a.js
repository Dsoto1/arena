/* tv98a — v0.98 part A (246-v98ui): Settings full screen with a rail (every setting still toggles its SETTINGS key, the language dropdown,
   removed rows gone), the Tactics window (five tabs + the rulebook link, Rules at a Glance on one screen with ◆ DIGITAL marks, the Quick
   Reference picture, the Bestiary cards), the sandstone main menu (Tactics label) and no sideways scroll at 390 px. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const mk=async(w,h)=>{const pg=await b.newPage({viewport:{width:w,height:h}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(w+':'+String(e)));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const pg=await mk(1440,900);const mark=await pg.evaluate(()=>ERR92.n);

/* ── 1 · Settings: the rail, full screen, every page ── */
const s1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}
  openSettings();await W8(700);const o={};const box=()=>document.getElementById('setBody');
  o.full=document.getElementById('modal').classList.contains('full')&&!!document.querySelector('#modal #s98');
  o.rail=[...box().querySelectorAll('.s98-rail [data-stab]')].map(x=>x.dataset.stab);
  o.grp=[...box().querySelectorAll('.s98-rail .grp')].length;o.close=!!document.querySelector('#mClose')&&getComputedStyle(document.getElementById('mClose')).display!=='none';
  const go=async k=>{box().querySelector(`[data-stab="${k}"]`).click();await W8(250)};
  /* every switch / tick on every page flips its key and back */
  o.flip=[];o.bad=[];const seen=new Set();o.removed=[];o.savesTab=false;
  for(const k of o.rail){await go(k);
    if(box().querySelector('[data-set="banners"],[data-set="emotesSpect"],[data-stab="saves"],[data-sarmor]'))o.removed.push(k);
    const keys=[...box().querySelectorAll('input[type=checkbox][data-set]')].map(i=>i.dataset.set);
    for(const key of keys){if(seen.has(key))continue;seen.add(key);
      if(key==='hints'){const v0=!!SETTINGS.hints;box().querySelector('input[data-set="hints"]').click();await W8(200);const v1=!!SETTINGS.hints;box().querySelector('input[data-set="hints"]').click();await W8(200);(v1!==v0&&!!SETTINGS.hints===v0?o.flip:o.bad).push(key);continue}
      const wasOff=!!document.querySelector('#setBody .hintsoff input[data-set="'+key+'"]');if(wasOff){hintsMaster(true,true);await go(k)}
      const get=()=>box().querySelector(`input[data-set="${key}"]`);const v0=SETTINGS[key];const c0=get().checked;get().click();await W8(120);const v1=SETTINGS[key];const c1=get()?get().checked:null;
      get().click();await W8(120);const v2=SETTINGS[key];
      ((c1===!c0)&&(!!v1===!c0)&&(!!v2===c0)?o.flip:o.bad).push(key);if(wasOff){hintsMaster(false,true);await go(k)}}
    for(const a of [...box().querySelectorAll('input[type=checkbox][data-aud]')].map(i=>i.dataset.aud)){const get=()=>box().querySelector(`input[data-aud="${a}"]`);const c0=get().checked;get().click();await W8(120);
      const v1=!!audSet()[a];get().click();await W8(120);((v1===!c0)&&(!!audSet()[a]===c0)?o.flip:o.bad).push('aud:'+a)}}
  /* segmented switches */
  await go('general');const a0=SETTINGS.anim88||'full';box().querySelector('[data-anim88="quick"]').click();await W8(100);o.anim=SETTINGS.anim88==='quick';box().querySelector(`[data-anim88="${a0}"]`).click();
  await go('help');const x0=SETTINGS.xray||'auto';box().querySelector('[data-sxray="off"]').click();await W8(250);o.xray=SETTINGS.xray==='off';box().querySelector(`[data-sxray="${x0}"]`).click();await W8(250);
  await go('pieces');o.pots=[];for(const v of ['tokens','pots']){box().querySelector(`[data-pots90="${v}"]`).click();await W8(150);o.pots.push(SETTINGS.pots90===v||(v==='pots'&&SETTINGS.pots90!=='tokens'))}
  o.potImgs=[...box().querySelectorAll('.s98-pic img')].map(i=>i.complete&&i.naturalWidth>0);
  box().querySelector('[data-spike98="bronze"]').click();await W8(250);o.bronze=String(THEME.spike).toLowerCase()===SET98_SPIKE.bronze&&!!box().querySelector('[data-spike98="bronze"].on');
  box().querySelector('[data-spike98="iron"]').click();await W8(250);o.iron=String(THEME.spike).toLowerCase()===SET98_SPIKE.iron;
  const q0=SETTINGS.quality110||'auto';box().querySelector('[data-q110="low"]').click();await W8(100);o.lite=SETTINGS.lite84==='on'&&!box().querySelector('[data-lite84]');box().querySelector(`[data-q110="${q0}"]`).click();
  const st0=(box().querySelector('.s98-tok.on')||{dataset:{}}).dataset.tokstyle;const other=[...box().querySelectorAll('[data-tokstyle]')].map(x=>x.dataset.tokstyle).find(x=>x!==st0);
  if(other){box().querySelector(`[data-tokstyle="${other}"]`).click();await W8(300);o.tok=!!box().querySelector(`.s98-tok.on[data-tokstyle="${other}"]`)&&(SETTINGS.tokenStyle===other||!!SETTINGS.mini3d===(other==='mini3d'));box().querySelector(`[data-tokstyle="${st0}"]`).click();await W8(300)}else o.tok=!box().querySelector('[data-tokstyle]')&&tokenStyle()==='figure'; /* v1.07 (400): the token-style choice is retired — one 3D look */
  o.eds=box().querySelectorAll('.s98-eds select[data-spcity]').length;
  await go('access');box().querySelector('[data-ts98="130"]').click();await W8(250);o.ts=SETTINGS.tscale===130&&document.body.classList.contains('ts130');box().querySelector('[data-ts98="100"]').click();await W8(250);o.ts=o.ts&&SETTINGS.tscale===100;
  const sel=box().querySelector('select[data-cvd84]');sel.value='rg';sel.dispatchEvent(new Event('change',{bubbles:true}));await W8(250);o.cvd=SETTINGS.cvdMode==='rg'&&SETTINGS.cvd===true;
  const sel2=box().querySelector('select[data-cvd84]');sel2.value='off';sel2.dispatchEvent(new Event('change',{bubbles:true}));await W8(250);o.cvd=o.cvd&&SETTINGS.cvdMode==='off';
  await go('themes');o.sw=box().querySelectorAll('.s98-swt[data-preset]').length;const bar=box().querySelector('.s98-swt .sb98 i');o.swH=bar?bar.getBoundingClientRect().height:0;
  box().querySelector('[data-preset="imperial"]').click();await W8(250);o.preset=String(THEME.ink).toLowerCase()===String(THEME_PRESETS.imperial.v.ink).toLowerCase()&&!!box().querySelector('.s98-swt.on[data-preset="imperial"]');
  box().querySelector('[data-preset="arena"]').click();await W8(250);
  o.sliders=box().querySelectorAll('input[data-tr]').length;o.look=!!box().querySelector('#profName')&&!!box().querySelector('[data-psave]');o.cust=box().querySelectorAll('.s98-cust [data-tk]').length;
  await go('audio');o.vol=box().querySelectorAll('input[data-audv]').length;o.tracks=!!box().querySelector('#audTracks');o.tryit=box().querySelectorAll('[data-audtry]').length;
  /* the language dropdown */
  await go('general');const dd=box().querySelector('[data-ldd98]');const menu=box().querySelector('.s98-menu');o.l0=!!menu&&menu.hidden;dd.click();await W8(150);
  o.l1=!menu.hidden&&dd.getAttribute('aria-expanded')==='true';o.items=[...menu.querySelectorAll('[data-lang91]')].map(x=>x.dataset.lang91);o.cur=(menu.querySelector('.on')||{dataset:{}}).dataset.lang91;
  o.flag=!!dd.querySelector('svg.flag91');o.select=!!box().querySelector('select[data-lang84][hidden]');
  document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await W8(100);o.l2=menu.hidden;
  dd.click();await W8(100);document.body.click();await W8(100);o.l3=box().querySelector('.s98-menu').hidden;
  o.foot=!!box().querySelector('.s98-foot [data-sv84]');o.rst=!!box().querySelector('.s98-hd [data-rst84]');
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}return o});
ok(s1.full&&s1.close,'Settings opens full screen with the ✕ '+JSON.stringify([s1.full,s1.close]));
ok(JSON.stringify(s1.rail)===JSON.stringify(['general','help','pieces','themes','audio','access'])&&s1.grp===3,'the rail: Play · Look · Sound & access '+JSON.stringify(s1.rail));
ok(!s1.removed.length,'Saves tab, home-city banners, spectator emotes, the armor style are gone '+JSON.stringify(s1.removed));
ok(!s1.bad.length&&s1.flip.length>=24,'every switch flips its setting and back '+JSON.stringify({bad:s1.bad,n:s1.flip.length}));
ok(['briefing','ctxMenu','cam88','confirmEnd','famous','fx','reveals','capFeed','shake','gore','hsTurn90','shoutsSpect','flavius','thoughts','cityChatter','hintDock','rulePops','turnHints','ruleHints','turnRecap','calm','locFlavor','aud:on','aud:sfx'].every(k=>s1.flip.includes(k)),'all the known switches are there '+JSON.stringify(s1.flip));
ok(s1.anim&&s1.xray&&s1.lite&&s1.tok&&s1.pots.every(Boolean),'segments + picture cards set their keys '+JSON.stringify([s1.anim,s1.xray,s1.lite,s1.tok,s1.pots]));
ok(s1.potImgs.length===2&&s1.potImgs.every(Boolean),'the Blessings pictures load '+JSON.stringify(s1.potImgs));
ok(s1.bronze&&s1.iron,'Floor spikes Iron / Bronze set THEME.spike');ok(s1.eds>=12,'the Editors grid has every city '+s1.eds);
ok(s1.ts&&s1.cvd,'text size + colour-blind on Accessibility '+JSON.stringify([s1.ts,s1.cvd]));
ok(s1.sw>=15&&s1.swH>=20&&s1.preset&&s1.sliders===3&&s1.look&&s1.cust>=10,'Themes: swatches, Tune it, Save this look, custom colours '+JSON.stringify([s1.sw,s1.swH,s1.preset,s1.sliders,s1.look,s1.cust]));
ok(s1.vol===2&&s1.tracks&&s1.tryit===5,'Audio: volumes, the music, Try it');
ok(s1.l0&&s1.l1&&s1.items.length>=9&&s1.items[0]==='en'&&s1.items.includes('es')&&s1.cur==='en'&&s1.flag&&s1.select&&s1.l2&&s1.l3,'language: one dropdown with the flag, every language, Esc / outside click close '+JSON.stringify([s1.l0,s1.l1,s1.items,s1.cur,s1.flag,s1.select,s1.l2,s1.l3]));
ok(s1.foot&&s1.rst,'footer → 💾 Saves; Restore all defaults in the header');

/* ── 2 · Tactics ── */
const t1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};showRules();await W8(700);const root=document.getElementById('tac98');
  o.title=document.getElementById('mTitle').textContent;o.full=document.getElementById('modal').classList.contains('full');
  o.tabs=[...root.querySelectorAll('[data-tac98]')].map(x=>x.dataset.tac98);const lk=root.querySelector('.tabs98 a.ext');o.link=!!lk&&/drive\.google|rulebook/i.test(lk.href)&&lk.parentElement.lastElementChild===lk;
  o.open=root.dataset.page;const main=root.querySelector('.tac98-main');
  o.cards=root.querySelectorAll('#rulTab-build .gc98 h3').length; /* ten topics: the turn card also holds Arena cards */o.dg=root.querySelectorAll('#rulTab-build .dg98').length;o.oneScreen=main.scrollHeight<=main.clientHeight+4;
  o.beasts=[...root.querySelectorAll('#rulTab-build .tb98.n98 tr:nth-child(4) td')].map(td=>td.textContent).slice(1).join(',');
  o.panes={};for(const k of o.tabs){root.querySelector(`[data-tac98="${k}"]`).click();await W8(200);o.panes[k]=[...root.querySelectorAll('.tac98-pane')].filter(p=>!p.hidden).map(p=>p.dataset.pane).join()}
  root.querySelector('[data-tac98="tut"]').click();await W8(100);o.lessons=[...root.querySelectorAll('[data-lesson]')].map(x=>x.dataset.lesson).join();o.pops=root.querySelectorAll('.pop98').length;
  const pop=root.querySelector('.pop98 summary');if(pop){pop.click();await W8(100)}o.popOpen=!!root.querySelector('.pop98[open] .rulepop');
  root.querySelector('[data-tac98="new"]').click();await W8(100);o.newV=(root.querySelector('#rulTab-new .vc98 .msv')||{}).textContent;o.hist=root.querySelectorAll('#rulTab-hist .h90c').length;
  const h=root.querySelector('#rulTab-hist .h90c');if(h){h.click();await W8(80)}o.histOpen=!!root.querySelector('#rulTab-hist .h90c.open98');
  root.querySelector('[data-tac98="strat"]').click();await W8(100);o.guides=!!root.querySelector('#rulTab-guide .guide,#rulTab-guide .gsec')&&!!root.querySelector('#rulTab-mguide .gsec,#rulTab-mguide details');
  root.querySelector('[data-tac98="ref"]').click();await W8(100);root.querySelector('[data-tac98r="qr"]').click();await W8(100);
  const qr=root.querySelector('.qr98');o.qrBg=qr?getComputedStyle(qr).backgroundImage:'';o.qrVis=!!qr&&qr.getBoundingClientRect().height>300;o.notes=root.querySelectorAll('.nt98 .dn98').length;
  const src=(o.qrBg.match(/url\("?([^")]+)"?\)/)||[])[1];o.qrLoad=src?await new Promise(r=>{const i=new Image();i.onload=()=>r(i.naturalWidth>500);i.onerror=()=>r(false);i.src=src}):false;
  root.querySelector('[data-tac98r="gloss"]').click();await W8(100);o.gloss=root.querySelectorAll('#rulTab-gl98 .glrow').length;
  root.querySelector('[data-tac98r="best"]').click();for(let i=0;i<30&&!root.querySelector('#rulTab-be98 .bc98');i++)await W8(100);
  o.best=root.querySelectorAll('#rulTab-be98 .bc98').length;const leo=root.querySelector('#rulTab-be98 [data-bc98^="lion|leo"]');if(leo){leo.click();await W8(150)}o.det=/Leo/.test((root.querySelector('#be98det h3')||{}).textContent||'');
  o.fake=/Bear of Dacia|Purple nights/.test(document.getElementById('modal').textContent);
  for(const [t,want] of [['hist','new'],['learn','tut'],['guide','strat'],['gloss','ref']]){CUR_MODAL&&CUR_MODAL.done(null);await W8(250);showRules(t);await W8(500);o['map_'+t]=(document.getElementById('tac98')||{dataset:{}}).dataset.page===want}
  CUR_MODAL&&CUR_MODAL.done(null);await W8(250);return o});
ok(t1.title==='Tactics'&&t1.full,'Tactics: the window title, full screen');
ok(JSON.stringify(t1.tabs)===JSON.stringify(['tut','build','new','strat','ref','onl'])&&t1.link,'tabs Tutorials · Rules at a Glance · What\'s New · Strategy · Reference · Online (293), the rulebook link last '+JSON.stringify(t1.tabs));
ok(t1.open==='build'&&t1.cards===10&&t1.dg>=7&&t1.oneScreen,'Rules at a Glance: ten cards on one screen with ◆ DIGITAL marks '+JSON.stringify([t1.open,t1.cards,t1.dg,t1.oneScreen]));
ok(t1.beasts==='15,20,12,10,6,3','the beasts table reads the real NPCT HP '+t1.beasts);
ok(Object.entries(t1.panes).every(([k,v])=>k===v),'each tab shows its own pane '+JSON.stringify(t1.panes));
ok(t1.lessons==='classic,manager'&&t1.pops>=9&&t1.popOpen,'Tutorials: both lessons + every rule popup opens '+JSON.stringify([t1.lessons,t1.pops,t1.popOpen]));
ok(/^v\d+\.\d+/.test(t1.newV||'')&&t1.hist>=20&&t1.histOpen,"What's New: the newest card + version history rows "+JSON.stringify([t1.newV,t1.hist,t1.histOpen]));
ok(t1.guides,'Strategy: Play Now + Manager guides');
ok(/quickref98/.test(t1.qrBg)&&t1.qrVis&&t1.qrLoad&&t1.notes===4,'Quick Reference: rulebook p.72 + four digital notes '+JSON.stringify([t1.qrBg.slice(0,60),t1.qrVis,t1.qrLoad,t1.notes]));
ok(t1.gloss>=20&&t1.best>=11&&t1.det,'Glossary + Bestiary cards with a detail '+JSON.stringify([t1.gloss,t1.best,t1.det]));
ok(!t1.fake,'no made-up samples');ok(t1.map_hist&&t1.map_learn&&t1.map_guide&&t1.map_gloss,'old tab keys land on their new tabs');

/* ── 3 · the main menu ── */
const m1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}menuShow();await W8(900);
  const q=s=>document.querySelector('#mainMenu '+s);const t=s=>(q(s)||{}).textContent||'';
  return {rules:t('[data-mm="rules"]').trim(),en:(q('[data-mm="rules"]')||{dataset:{}}).dataset.en84,slabs:document.querySelectorAll('#mainMenu .ss98').length,play:!!q('[data-mm="play"].ss98-play svg'),
    sub:t('[data-mm="multi"] small'),bg:getComputedStyle(q('[data-mm="manager"]')).backgroundImage.includes('linear-gradient'),top:(document.getElementById('btnRules')||{}).textContent}});
ok(m1.rules==='Tactics'&&m1.en==='Tactics'&&/Tactics/.test(m1.top||''),'"Rules" → "Tactics" (menu + top bar) '+JSON.stringify([m1.rules,m1.top]));
ok(m1.slabs>=9&&m1.play&&m1.bg&&!/Hot seat/.test(m1.sub),'sandstone slabs, Play Now porphyry, no hot-seat line under Multiplayer (v0.99 1b) '+JSON.stringify(m1));
const e=await pg.evaluate(m0=>ERR92.n-m0,mark);ok(e===0,'no new error-log entries '+e);

/* ── 4 · phones: 390 px, no sideways scroll ── */
const ph=await mk(390,844);
const p1=await ph.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const side=()=>document.documentElement.scrollWidth>innerWidth+1||document.body.scrollWidth>innerWidth+1;const o={bad:[]};
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}await W8(600);if(side())o.bad.push('menu');
  openSettings();await W8(700);const rail=document.querySelector('.s98-rail');o.rail=!!rail&&getComputedStyle(rail).flexDirection==='row'&&rail.getBoundingClientRect().bottom>innerHeight-80;
  for(const k of ['general','help','pieces','themes','audio','access']){document.querySelector(`#setBody [data-stab="${k}"]`).click();await W8(250);if(side())o.bad.push('set:'+k);
    const main=document.querySelector('.s98-main');for(const el of main.querySelectorAll('.s98-row,.s98-card,.s98-lang'))if(el.getBoundingClientRect().right>innerWidth+1){o.bad.push('wide:'+k+':'+el.className);break}
    const sw=main.querySelector('input.s98-sw');if(sw&&sw.getBoundingClientRect().width<40)o.bad.push('sw:'+k)}
  CUR_MODAL&&CUR_MODAL.done(null);await W8(300);showRules();await W8(700);
  for(const k of ['tut','build','new','strat','ref']){document.querySelector(`[data-tac98="${k}"]`).click();await W8(250);if(side())o.bad.push('tac:'+k);
    const main=document.querySelector('.tac98-main');for(const el of main.querySelectorAll('.gc98,.cd98,.ls98,.vc98'))if(el.getBoundingClientRect().right>innerWidth+1){o.bad.push('wide:'+k);break}}
  CUR_MODAL&&CUR_MODAL.done(null);return o});
ok(p1.rail,'phones: the rail is a bottom pill row');ok(!p1.bad.length,'390 px: nothing sideways '+JSON.stringify(p1.bad));

console.log(miss.length?'FAIL '+miss.join('\n  '):'tv98a OK');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
