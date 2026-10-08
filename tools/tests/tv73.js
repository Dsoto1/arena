/* v0.73: Manager rail ovals + tab banners (count at the right), hours out of the header, scouting shows ratings + personality,
   the roster check clears with a recruit on the board, armor Start from (printed piece: stats, art, placement), armor
   levels, the avatar without number chips (hover card, hit flash), Summa Rudis behind ⓘ, Sica's syndicate (house, spear,
   bribe, poach, never in the Superbus), recruiting plan/compare/signing card, 3D mini facings, phone portrait sheet */
const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.m=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();const r={};MGR.tab='ludus';MGR_REDRAW();await W8(800);
  r.banner=!!document.querySelector('.roomhd.b73-ludus .roomstat .ptbox');r.noHrs=!/Recruiting hours|Training hours/.test(document.querySelector('.mhead').textContent);
  r.ovals=['ludus','recruit','practice'].every(k=>{const c=document.querySelector(`.mtabs [data-id="${k}"] .mcount.c73`);return c&&!c.hidden});
  for(const k of ['roster','night','news','league','imp','trophy','sched','me','exch']){MGR.tab=k;MGR_REDRAW();await W8(80);if(!document.querySelector('.roomhd.b73-'+k))r.missing=(r.missing||'')+k+' '}
  const fa=w.glads.find(g=>!g.contract&&g.alive!==false);fa.scout=2;MGR.tab='recruit';MGR.sel=fa.id;MGR.recFor=fa.id;MGR.recStep=1;MGR_REDRAW();await W8(300);
  r.scout=!!document.querySelector('.gs98 .gb98')&&!!document.querySelector('.pe98:not(.lock) .badge'); /* v0.98: grades + the personality block */r.recStat=/\d/.test( /* v0.98: the recruiter's hours on the Recruiting banner */(document.querySelector('.roomhd.b73-recruit .roomstat .ptbox')||{}).textContent||'');
  /* roster check */
  const ros=rosterOf(me());for(const g of ros.slice(1))g.contract=null;w.glads.forEach(g=>g.favd=false);r.short=weekChecklist().some(x=>!x.done&&/Short-handed/.test(x.txt));fa.favd=true;r.cleared=!weekChecklist().some(x=>!x.done&&/Short-handed/.test(x.txt));
  /* plan + compare */
  MGR.cmp=[fa.id];MGR_REDRAW();await W8(200);r.plan=!!document.querySelector('.rplan');r.cmp=!!document.querySelector('.cmpc');
  /* Sica */
  const sm=sicaMgr(w);r.sica=!!sm&&rosterOf(sm).length===4&&rosterOf(sm).every(g=>gStats(g).str>=86);
  const bt=w.night.bouts.find(b=>b.ents.some(id=>isSicaG(gById(id))));if(bt){bt.sicaSpear=true;const c=boutCfg(bt,true);r.spear=!!c.syndSpear&&!isSicaG(gById(c.syndSpear))}else r.spear=true;
  for(const m of w.mgrs)m.wins=0;sm.wins=99;sm.bouts=99;r.noSuperbus=!leagueSort(w.mgrs.filter(m2=>!m2.sica)).slice(0,4).includes(sm);
  S&&(S.over=true);if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);return r});
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);
  ST.gearSub='a';ST.ca=blankCA();openStudio('gear');await W8(900);r.groups=document.querySelector('select[data-caf="start"]')?1:0; /* v0.76: Start from removed — load the printed piece directly */
  caFromSystem(ST.ca,'galea');openStudio('gear');await W8(900);r.start=ST.ca.base==='galea'&&ST.ca.art==='galea'&&ST.ca.eq==='head'&&!!document.querySelector('#caPiece .caartprev');
  r.levels=!!document.querySelector('.calevels .calv');r.croc=RTOK_NAMES.includes('croc');if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);
  startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:false},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{}});
  await W8(2800);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}setSpeedUI('pause');await W8(600);
  const p=S.players[0];render();await W8(80);p.hp.head-=1;render();await W8(80);const av=document.querySelector('#board .avatar');
  r.noChips=!!av&&!/r="9"/.test(av.innerHTML);r.zones=document.querySelectorAll('#board [data-avloc]').length>=6;r.flash=!!document.querySelector('#board .avhit');
  r.sr=typeof SR_OPEN!=='undefined'&&SR_OPEN===false;r.ratShut=RAT_SHUT===false; /* v0.81: the ratings always show */
  /* 3D mini facing */
  SETTINGS.tokenStyle='standee';SETTINGS.mini3d=true;applySettings();const q={r:5,c:5};miniFace(q,'hero');q.c=6;r.face=miniFace(q,'hero')===1;q.r=6;r.face2=miniFace(q,'hero')===7;
  SETTINGS.mini3d=false;SETTINGS.tokenStyle='figure';applySettings();return r});
const ctx=await b.newContext({...devices['iPhone 13']});const ph=await ctx.newPage();await ph.route(/fonts\./,r=>r.abort());await ph.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await ph.goto('file://'+process.argv[2]);await ph.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
o.p=await ph.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:false},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{}});
  await W8(2800);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}await W8(800);const r={pp:document.body.classList.contains('phoneP2'),tabs:!!document.querySelector('#ppTabs [data-pp="side"]')};
  document.querySelector('#ppTabs [data-pp="side"]').click();await W8(300);r.board=getComputedStyle(document.getElementById('board')).display!=='none';return r});
const m=o.m,a=o.a,p=o.p;ok(m.banner&&!m.missing&&m.recStat,'tab banners + count');ok(m.noHrs,'hours out of the header');ok(m.ovals,'rail ovals');ok(m.scout,'scouting shows ratings + personality');
ok(m.short&&m.cleared,'roster check clears with a board recruit');ok(m.plan&&m.cmp,'recruiting plan + compare');ok(m.sica&&m.spear&&m.noSuperbus,'Sica house');
ok(!a.groups&&a.start,'no Start from; a printed piece still loads');ok(a.levels,'armor levels');ok(a.croc,'croc token');ok(a.noChips&&a.zones&&a.flash,'avatar hover zones + flash');ok(a.sr&&a.ratShut,'summa rudis hidden + ratings always show (v0.81)');
ok(a.face&&a.face2,'mini facing');ok(p.pp&&p.tabs&&p.board,'phone portrait sheet');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
