/* v0.84 UI (142-v84ui): the SETTINGS TIDY — tabs without Profiles, 🌐 Language first, no lesson-buttons row (both lessons inside 🎓 Tutorials),
   ONE text size (slider; the theme scale and Large text gone, an old theme scale migrates), ONE colour-blind select that applies its theme
   (and the Themes presets move it), no chest pickers / Armor section, Saves → the Saves window (and back to the shelf through Backups),
   "Save this look" in Themes, Restore all defaults (asks first, saves stay), Confirm before End turn (asks with moves left, not without);
   and THE ONLINE LANDING ON ONE SCREEN — (v0.85) all four playlist cards and both showcases inside the window at 1300×900, 1440×900 and
   1920×1080, the victor's house chip once, phones still one column. SHOT=<dir> saves u84u_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const o={};
const mk=async(init,vw)=>{const ctx=await b.newContext({viewport:vw||{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(init||(()=>{}));await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0,{timeout:90000});await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return {ctx,p}};
const W8=(p,ms)=>p.waitForTimeout(ms);
const shot=async(p,n)=>{if(SHOT)await p.screenshot({path:path.join(SHOT,`u84u_${n}.png`)})};

/* ── 1 · migration: an old theme scale (the Large text theme) + the old colour-blind switch ── */
{const {ctx,p}=await mk(()=>{if(!sessionStorage.getItem('mig')){sessionStorage.setItem('mig','1');localStorage.removeItem('flavius_set84');localStorage.setItem('flavius_theme',JSON.stringify({scale:120}));localStorage.setItem('flavius_settings',JSON.stringify({cvd:true}))}});
  o.mig=await p.evaluate(()=>({ts:SETTINGS.tscale,scale:THEME.scale,root:document.documentElement.style.fontSize,mode:SETTINGS.cvdMode,cvd:SETTINGS.cvd,hp:THEME.hp,flag:localStorage.getItem('flavius_set84'),body:document.body.className}));
  ok(o.mig.ts===120&&o.mig.scale===100&&o.mig.root==='100%'&&/tsz84/.test(o.mig.body)&&/ts120/.test(o.mig.body),'an old theme scale becomes the one text size '+JSON.stringify(o.mig));
  ok(o.mig.mode==='rg'&&o.mig.cvd&&o.mig.hp==='#3d8fd6'&&o.mig.flag==='1','the old colour-blind switch → Red-green + its theme');await ctx.close()}

/* ── 2 · the Settings window ── */
const {ctx,p}=await mk();
await p.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await W8(p,400);
await p.evaluate(()=>openSettings('general'));await W8(p,600);
/* v0.98: Settings full screen with a rail (246-v98ui): Language first on General; text size / colour-blind / confirm on Accessibility; Quality (was Light board) on Board & pieces */
o.gen=await p.evaluate(async()=>{const box=document.getElementById('setBody');const first=box.querySelector('.s98-main').querySelector('.s98-lang');
  const pg=async k=>{box.querySelector(`[data-stab="${k}"]`).click();await new Promise(r=>setTimeout(r,250))};const lang=first?[...first.querySelectorAll('select[data-lang84] option')].map(x=>x.value):[],langTxt=first?first.textContent:'';
  const tabs=[...box.querySelectorAll('[data-stab]')].map(x=>x.dataset.stab);const lessons=!!box.querySelector('[data-lessonsmenu]');const rst=!!box.querySelector('[data-rst84]');
  await pg('access');const acc={ts:box.querySelectorAll('[data-ts98]').length>=3,tsOld:box.querySelectorAll('[data-tscale],[data-ts84]').length,cvdSel:!!box.querySelector('select[data-cvd84]'),cvdBox:!!box.querySelector('[data-set="cvd"]'),ce:!!box.querySelector('[data-set="confirmEnd"]')&&!SETTINGS.confirmEnd};
  await pg('pieces');const lite=!!box.querySelector('[data-lite84]');await pg('access');
  return {tabs,first:first&&first.className,lang,langTxt,lessons,...acc,rst,lite}});
ok(JSON.stringify(o.gen.tabs)===JSON.stringify(['general','help','pieces','themes','audio','access']),'the rail: no Profiles, no Saves '+JSON.stringify(o.gen.tabs));
ok(/s98-lang/.test(o.gen.first||'')&&o.gen.lang[0]==='en'&&o.gen.lang.includes('es')&&/stay English in every language/.test(o.gen.langTxt),'🌐 Language row first (English, then the built-in languages) '+JSON.stringify(o.gen.lang));
ok(!o.gen.lessons,'no lesson-buttons row');ok(o.gen.ts&&o.gen.tsOld===0,'one text-size control (100 / 115 / 130)');ok(o.gen.cvdSel&&!o.gen.cvdBox,'colour-blind is a select');
ok(o.gen.ce,'Confirm before End turn (off by default)');ok(o.gen.rst,'Restore all defaults');ok(!o.gen.lite,'Light board setting is gone (folded into Quality Low, v1.10)');
await shot(p,'set_general');
/* text size */
o.ts=await p.evaluate(async()=>{document.querySelector('[data-ts98="115"]').click();await new Promise(r=>setTimeout(r,250));const on=document.querySelector('[data-ts98].on');
  return {v:SETTINGS.tscale,body:document.body.className,z:getComputedStyle(document.getElementById('mBody')).zoom,saved:JSON.parse(localStorage.getItem('flavius_settings')).tscale,out:on&&on.textContent}});
ok(o.ts.v===115&&/tsz84/.test(o.ts.body)&&/ts115/.test(o.ts.body)&&Math.abs(+o.ts.z-1.15)<0.01&&o.ts.saved===115&&o.ts.out==='115%','text size 115% '+JSON.stringify(o.ts));
/* colour-blind select → its theme */
await p.selectOption('[data-cvd84]','rg');await W8(p,200);
o.rg=await p.evaluate(()=>({mode:SETTINGS.cvdMode,cvd:SETTINGS.cvd,hp:THEME.hp,cc:!!THEME.classColors,body:document.body.classList.contains('cvd'),sol:CLASSES.soldier.color}));
ok(o.rg.mode==='rg'&&o.rg.cvd&&o.rg.hp===THEME_HP_DEUT()&&o.rg.cc&&o.rg.body,'Red-green → the Red-green safe theme + letters '+JSON.stringify(o.rg));
await p.selectOption('[data-cvd84]','by');await W8(p,200);
o.by=await p.evaluate(()=>({mode:SETTINGS.cvdMode,cvd:SETTINGS.cvd,hp:THEME.hp,sol:CLASSES.soldier.color,body:document.body.classList.contains('cvd')}));
ok(o.by.mode==='by'&&!o.by.cvd&&o.by.hp==='#009e8f'&&o.by.sol==='#e0315a'&&!o.by.body,'Blue-yellow → the Blue-yellow safe theme (its class colours) '+JSON.stringify(o.by));
await p.selectOption('[data-cvd84]','off');await W8(p,200);
o.off=await p.evaluate(()=>({mode:SETTINGS.cvdMode,hp:THEME.hp,base:BASE_THEME.hp,cc:THEME.classColors,sol:CLASSES.soldier.color,sol0:CLASSES.soldier.baseColor}));
ok(o.off.mode==='off'&&o.off.hp===o.off.base&&!o.off.cc&&o.off.sol===o.off.sol0,'Off → the default palette');
/* Themes: no text size / Large text / chest pickers; the cvd presets move the select; Save this look */
await p.click('#setBody [data-stab="themes"]');await W8(p,300);
o.th=await p.evaluate(()=>{const box=document.getElementById('setBody');return {scale:!!box.querySelector('[data-tr="scale"]'),large:!!box.querySelector('[data-preset="large"]'),
  chest:!!box.querySelector('[data-tk="chestWood"],[data-tk="chestGold"]'),keep:['pot','pillar','pillarBase','rubble','standA','standB','spike'].every(k=>box.querySelector(`[data-tk="${k}"]`)),
  look:!!box.querySelector('[data-psave]')&&!!box.querySelector('#profName'),txt:/Text & UI size/.test(box.textContent)}});
ok(!o.th.scale&&!o.th.large&&!o.th.txt,'Themes: no Text & UI size, no Large text');ok(!o.th.chest&&o.th.keep,'Themes: chest pickers gone, pots/pillars/bases/rubble/stands/spike caps kept');ok(o.th.look,'Save this look in Themes');
await shot(p,'set_themes');
await p.click('#setBody [data-preset="deut"]');await W8(p,200);o.pd=await p.evaluate(()=>({mode:SETTINGS.cvdMode,cvd:SETTINGS.cvd}));
await p.click('#setBody [data-preset="marble"]');await W8(p,200);o.pm=await p.evaluate(()=>({mode:SETTINGS.cvdMode,cvd:SETTINGS.cvd}));
await p.click('#setBody [data-preset="trit"]');await W8(p,200);
await p.click('#setBody [data-stab="access"]');await W8(p,200);o.pt=await p.evaluate(()=>document.querySelector('[data-cvd84]').value);
ok(o.pd.mode==='rg'&&o.pd.cvd&&o.pm.mode==='off'&&!o.pm.cvd&&o.pt==='by','the Themes presets move the colour-blind select '+JSON.stringify([o.pd,o.pm,o.pt]));
await p.click('#setBody [data-stab="themes"]');await W8(p,200);
o.look=await p.evaluate(async()=>{const n0=(JSON.parse(localStorage.getItem('flavius_profiles')||'[]')).length;document.getElementById('profName').value='Night look';document.querySelector('#setBody [data-psave]').click();await new Promise(r=>setTimeout(r,200));
  const L=JSON.parse(localStorage.getItem('flavius_profiles')||'[]');return {n:L.length-n0,apply:!!document.querySelector('#setBody .s98-profs [data-papply]'),tab:[...document.querySelectorAll('#setBody [data-stab].on')].map(x=>x.dataset.stab).join()}});
ok(o.look.n===1&&o.look.apply&&o.look.tab==='themes','a look is saved and listed (still on Themes) '+JSON.stringify(o.look));
o.prof=await p.evaluate(async()=>{CUR_MODAL&&CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300));openSettings('profiles');await new Promise(r=>setTimeout(r,500));return [...document.querySelectorAll('#setBody [data-stab].on')].map(x=>x.dataset.stab).join()});
ok(o.prof==='themes','openSettings("profiles") lands on Themes');
/* Tokens: no Armor section */
await p.click('#setBody [data-stab="pieces"]');await W8(p,300);
o.tok=await p.evaluate(()=>{const box=document.getElementById('setBody');return {arm:!!box.querySelector('[data-sarmor]'),txt:/🛡 Armor/.test(box.textContent),rows:box.querySelectorAll('[data-tokstyle]').length}});
ok(!o.tok.arm&&!o.tok.txt&&o.tok.rows===0,'Board & pieces: no Armor section, no token-style choice (v1.07: one 3D look) '+JSON.stringify(o.tok));await shot(p,'set_tokens');
for(const t of ['help','audio']){await p.click(`#setBody [data-stab="${t}"]`);await W8(p,300);await shot(p,'set_'+t)}
/* Saves: no tab any more (v0.98) — the footer line's 💾 Saves → the Saves window; Backups → the shelf */
o.sv=await p.evaluate(()=>({btn:!!document.querySelector('#setBody .s98-foot [data-sv84]'),shelf:!!document.querySelector('#setBody #saveName'),tab:!!document.querySelector('#setBody [data-stab="saves"]')}));
ok(o.sv.btn&&!o.sv.shelf&&!o.sv.tab,'no Saves tab; the footer opens 💾 Saves');
await p.evaluate(()=>{window.__mm=[];const iv=setInterval(()=>{__mm.push(!document.getElementById('mainMenu').hidden&&document.getElementById('modal').hidden)},15);setTimeout(()=>clearInterval(iv),1500)});
await p.click('#setBody [data-sv84]');await W8(p,1600);
o.hub=await p.evaluate(()=>({hub:!!document.getElementById('hub76'),tab:(document.querySelector('#hub76 [data-hub76].on')||{}).dataset?.hub76,set:!!document.getElementById('setBody'),bare:__mm.some(x=>x)}));
ok(o.hub.hub&&o.hub.tab==='backups'&&!o.hub.set,'the button opens the Saves window on Backups '+JSON.stringify(o.hub));ok(!o.hub.bare,'no bare main menu between the windows');
await p.click('#hub76 [data-hubbk="manage"]');await W8(p,900);
o.shelf=await p.evaluate(()=>({shelf:!!document.querySelector('#setBody #saveName')&&!!document.querySelector('#setBody #saveList'),tab:(document.querySelector('#s98')||{dataset:{}}).dataset.page}));
ok(o.shelf.shelf&&o.shelf.tab==='saves','Backups → manage → the game-save shelf '+JSON.stringify(o.shelf));
await p.click('#setBody [data-stab="general"]');await W8(p,200);
ok(await p.evaluate(()=>!!document.querySelector('#setBody [data-sv84]')&&!document.querySelector('#setBody #saveName')),'leaving the shelf: the footer link again');
/* Restore all defaults (asks first; saves stay) */
await p.evaluate(async()=>{await Store.put('customChars','c84u',{name:'Kept Kaeso',custom:true});SETTINGS.gore=false;SETTINGS.tscale=130;SETTINGS.confirmEnd=true;applySettings();applyTheme({...THEME_PRESETS.imperial.v})});
await p.click('#setBody [data-stab="general"]');await W8(p,200);await p.click('#setBody [data-rst84]');await W8(p,300);
o.ask=await p.evaluate(()=>({ask:!!document.querySelector('.ask76bg'),gore:SETTINGS.gore}));
await p.click('.ask76bg [data-ask76="1"]');await W8(p,500);
o.rst=await p.evaluate(async()=>({gore:SETTINGS.gore,ts:SETTINGS.tscale,ce:!!SETTINGS.confirmEnd,ink:THEME.ink===BASE_THEME.ink,body:/tsz84/.test(document.body.className),kept:(await Store.list('customChars')).some(x=>x.id==='c84u'),saved:JSON.parse(localStorage.getItem('flavius_settings')).gore,ui:!!document.querySelector('#setBody [data-rst84]')}));
ok(o.ask.ask&&o.ask.gore===false,'Restore asks first');ok(o.rst.gore&&o.rst.ts===100&&!o.rst.ce&&o.rst.ink&&!o.rst.body&&o.rst.saved===true&&o.rst.ui,'Restore → defaults + the Arena theme '+JSON.stringify(o.rst));ok(o.rst.kept,'Restore keeps saves');
await p.evaluate(async()=>{await Store.del('customChars','c84u');CUR_MODAL&&CUR_MODAL.done(null)});await W8(p,500);

/* ── 3 · lessons: both always inside 🎓 Tutorials ── */
o.les=await p.evaluate(async()=>{localStorage.setItem('flavius_tutDone','1');localStorage.setItem('flavius_mtutDone','1');SETTINGS.lessonsMenu=false;menuShow();await new Promise(r=>setTimeout(r,300));
  const t=document.querySelector('#mainMenu [data-mm82="tut"]');const L=document.getElementById('mmLearn');const shut=getComputedStyle(L).display==='none';t.click();await new Promise(r=>setTimeout(r,200));
  const vis=s=>{const e=document.querySelector('#mainMenu '+s);return !!e&&e.offsetParent!==null&&!e.hidden};const r={shut,c:vis('[data-mm="learn"]'),m:vis('[data-mm="learnmgr"]')};t.click();
  r.rules=/Lesson buttons on the main menu/.test(lessonsHTML());return r});
ok(o.les.shut&&o.les.c&&o.les.m&&!o.les.rules,'both lessons inside the Tutorials fold, whatever the old pref '+JSON.stringify(o.les));

/* ── 4 · Confirm before ⏭ End turn ── */
await p.evaluate(async()=>{menuHide();SETTINGS.confirmEnd=true;applySettings();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore'},{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  const sp=document.querySelector('[data-speed="fast"]');if(sp)sp.click()});
const toAction=async()=>{for(let i=0;i<160;i++){const st=await p.evaluate(()=>{if(CUR_MODAL){const bb=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(bb)bb.click();else CUR_MODAL.done(null);return 'modal'}
    if(!S||S.over)return 'over';if(!cur().cpu&&!S.busy){if(S.phase==='choice'){const c=document.querySelector('[data-act="coin"]');if(c){c.click();return 'choice'}}if(S.phase==='action')return 'ready'}return 'wait'});
    if(st==='ready'||st==='over')return st;await W8(p,250)}return 'timeout'};
o.st1=await toAction();
if(o.st1==='ready'){
  o.e1=await p.evaluate(()=>{const P=cur();P.mv=Math.max(P.mv,3);render();return {id:P.id,left:endLeft84(P)}});
  await p.click('#actions [data-act="end"]');await W8(p,400);
  o.e2=await p.evaluate(()=>({ask:!!document.querySelector('.ask76bg'),same:cur().id,phase:S.phase,txt:(document.querySelector('.ask76bg')||{}).textContent||''}));
  await shot(p,'endturn_ask');
  await p.click('.ask76bg [data-ask76="0"]');await W8(p,300);o.e3=await p.evaluate(()=>({same:cur().id,phase:S.phase,ask:!!document.querySelector('.ask76bg')}));
  ok(o.e2.ask&&o.e2.same===o.e1.id&&o.e2.phase==='action'&&/movement/.test(o.e2.txt),'End turn with moves left asks first '+JSON.stringify(o.e2));
  ok(!o.e3.ask&&o.e3.same===o.e1.id&&o.e3.phase==='action','Keep playing keeps the turn');
  await p.click('#actions [data-act="end"]');await W8(p,300);await p.click('.ask76bg [data-ask76="1"]');await W8(p,900);
  o.e4=await p.evaluate(id=>({moved:!S.players.find(x=>x.id===id).cpu&&(cur().id!==id||S.phase!=='action')}),o.e1.id);ok(o.e4.moved,'End turn after the question ends the turn');
  o.st2=await toAction();
  if(o.st2==='ready'){o.e5=await p.evaluate(()=>{const P=cur();P.mv=0;P.attacks=9;render();return {id:P.id,left:endLeft84(P)}});
    await p.click('#actions [data-act="end"]');await W8(p,900);
    o.e6=await p.evaluate(id=>({ask:!!document.querySelector('.ask76bg'),ended:cur().id!==id||S.phase!=='action'}),o.e5.id);
    ok(o.e5.left===''&&!o.e6.ask&&o.e6.ended,'nothing left → no question '+JSON.stringify([o.e5,o.e6]))}else miss.push('second human turn not reached: '+o.st2)
}else miss.push('human action phase not reached: '+o.st1);
await p.evaluate(()=>{SETTINGS.confirmEnd=false;applySettings();if(S)S.over=true;for(const x of document.querySelectorAll('.ask76bg'))x.remove()});await ctx.close();

/* ── 5 · the Online landing on one screen ── */
{const {ctx,p}=await mk(()=>{localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0')});
  await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|clock)/.test(k))localStorage.removeItem(k)});await p.reload({timeout:90000});await W8(p,2300);
  await p.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Vettii'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;ONL.char=await NET.req('char.create',{name:'Vettii the Bold',cls:'hero'});
    onlineOpen('play');await new Promise(r=>setTimeout(r,1200));ONL.tab='play';await onlRefresh();
    const e={name:'Vettii the Bold',cls:'hero',ev:'democritus',loc:6,cf:24,dom:ONL.domus.id,dn:'Vettii'};
    ONL80F.today={day:'today',wins:[e,{...e,cf:20},{...e,cf:18},{...e,cf:12}],fallen:[{...e,name:'Aemilii the Bold',how:'damnatio',dom:'x',dn:'Aemilii'}],upsets:[]};onlRedraw()});
  await W8(p,700);
  for(const [w,h] of [[1300,900],[1440,900],[1920,1080]]){await p.setViewportSize({width:w,height:h});await W8(p,600);
    /* v0.85 (146-v85land): the playlists are a 2×2 grid beside the two showcases — all four cards and both showcases in view */
    const m=await p.evaluate(()=>{const box=document.getElementById('mBody').getBoundingClientRect();const cards=[...document.querySelectorAll('#onl .onl-pls81>*:not(.pl85div)'),...document.querySelectorAll('#v85show .v85sc')].filter(c=>c.offsetParent!==null);if(!cards.length)return null;
      const bottom=Math.max(...cards.map(c=>c.getBoundingClientRect().bottom));
      return {n:cards.length,bottom:Math.round(bottom),box:Math.round(box.bottom),sc:document.getElementById('mBody').scrollTop,col:document.querySelector('#onl .a100-right')?document.querySelector('#onl .a100-right').getBoundingClientRect().bottom<=box.bottom+1:true /* v1.0: one right column, the Acta merged into the showcases */,chips:document.querySelectorAll('#v85show .v85sc.win .dom84c').length}});
    o['land'+w]=m;ok(m&&m.n===6&&m.bottom<=m.box&&m.sc===0,`all four playlists + both showcases in view at ${w}×${h} `+JSON.stringify(m));ok(m&&m.chips===1,`the victor's house chip once at ${w}`);ok(m&&m.col,'the right column ends inside the window');
    await shot(p,'landing_'+w)}
  o.dd=await p.evaluate(()=>{const c='<button type="button" class="dom84c" data-onl83="prof" data-v="d1" title="Open the house">🏛 House Vettii</button>';return (onl84TodayChips('<b>X</b>'+c+c+c+c).match(/dom84c/g)||[]).length});
  ok(o.dd===1,'repeated house chips collapse to one ('+o.dd+')');
  await p.setViewportSize({width:390,height:844});await W8(p,600);
  o.ph=await p.evaluate(()=>{const g=document.querySelector('#onl .onl-play81');return {cols:getComputedStyle(g).gridTemplateColumns.split(' ').length,wide:document.documentElement.scrollWidth<=392}});
  ok(o.ph.cols===1&&o.ph.wide,'phones: one column '+JSON.stringify(o.ph));await shot(p,'landing_390');await ctx.close()}

function THEME_HP_DEUT(){return '#3d8fd6'}
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
