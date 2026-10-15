/* v0.95 part B: Creator Studio + Play Now (228-v95studio) — roster-set find, live character card, class legs/Tasset, armor fit sides + mirror + save,
   beast token letter, cohort card, pelted + allies, weapon icons/shield, sculptor lock/colour/snap, ratings panel, Stands fold, Your characters */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());{const _c=pg.click.bind(pg);pg.click=async(sel,o)=>{try{await tab103(pg,sel)}catch(e){}return _c(sel,o)}}const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
/* v1.03 S1: the Gear designers are in 335's tabbed frame — open the tab that holds a control first */
const tab103=(pg,sel)=>pg.evaluate(s=>{const e=document.querySelector(s);const p=e&&e.closest('.df99pane');if(p){const b=document.querySelector('[data-df99t="'+p.dataset.df99p+'"]');if(b)b.click()}},sel);
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_armfit_on','1')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});await pg.waitForTimeout(1500);
const r={};const q=(s,a)=>pg.evaluate(s,a);const W=ms=>pg.waitForTimeout(ms);
const mark=await q(()=>ERR92.n);
await q(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openStudio('all')});await W(1500);
await q(()=>{for(const n of ['Marcus','Bestia','Tiber']){const c=blankChar();c.id='c95'+n;c.name=n+' Ferox';charFromClass(c,'hero');c.rolls=n!=='Tiber';CUSTOM.chars.push(c)}ST.tab='rosters';studioRedraw()});await W(400);
/* 1 · Find a creation */
await pg.click('[data-rs77new]');await W(300);
await q(()=>{document.querySelector('.rs77hd').__keep=1});
await pg.click('#rs95q');await pg.keyboard.type('bes',{delay:60});await W(500);
r.find=await q(()=>({keep:!!document.querySelector('.rs77hd').__keep,tiles:document.querySelectorAll('.rs77t').length,old:!!document.getElementById('rs77q'),max:document.getElementById('rs95q').maxLength,w:Math.round(document.getElementById('rs95q').getBoundingClientRect().width),foc:document.activeElement.id}));
r.findOK=r.find.keep&&r.find.tiles===1&&!r.find.old&&r.find.max===32&&r.find.w<=345&&r.find.foc==='rs95q';
await pg.fill('#rs95q','zzzz');await W(400);r.none=await q(()=>!!document.querySelector('.rs95none')&&document.querySelectorAll('.rs77t').length===0);
await pg.fill('#rs95q','');await W(400);
await pg.click('[data-rs77open="rolls"]');await W(400);
r.rolls=await q(()=>!!document.getElementById('rs95q')&&!!document.querySelector('[data-rs77t="chars|c95Marcus"]'));
await pg.fill('#rs95q','marc');await W(400);r.rollsFind=await q(()=>document.querySelectorAll('.rs77t').length===1&&/Marcus/.test(document.querySelector('.rs77t').textContent));
/* 2 · the character card follows the fields */
await q(()=>{const k=blankClass();k.id='k95';k.name='Dust';k.color='#3a7bd5';CUSTOM.classes=[...(CUSTOM.classes||[]),k];ST.tab='chars';ST.draft=blankChar();ST.draft.classRef='ccl:k95';ST.view='edit';studioRedraw()});await W(500);
await q(()=>{const e=document.getElementById('stName');e.value='Zedekiah';e.dispatchEvent(new Event('input',{bubbles:true}))});await W(300);
r.card=await q(()=>{const c=document.querySelector('.clspick .clscard');return !!c&&/zedekiah/i.test(c.textContent+c.innerHTML)});
/* 10 · the ratings panel on the right, live */
await q(()=>{const f=document.querySelector('#studio .df99');if(f)DF99.tab(f,'fight')});await W(200);
r.panel=await q(()=>{const p=document.getElementById('st95stats');const m=document.querySelector('#studio .df99 .ch99cls')/* v0.99: Class & ratings tab, ratings in the right column */;if(!p||!m)return false;return p.getBoundingClientRect().left>=m.getBoundingClientRect().right-2&&!!document.getElementById('st95bar')&&!document.querySelector('#studio .clspick #stStatSum')});
const n0=await q(()=>document.getElementById('st95num').textContent);
await q(()=>{const e=document.querySelector('[data-stat="str"]');e.value=99;e.dispatchEvent(new Event('input',{bubbles:true}))});await W(200);
r.live=await q(n0=>{const t=document.getElementById('st95num').textContent;const st=ST.draft.stats;return t!==n0&&t.startsWith(String(statSum(st)))&&document.querySelectorAll('#st95gl .st95chip').length>=1&&/(\d+)%/.test(document.getElementById('st95bar').firstElementChild.style.width+'%')},n0);
/* 7 · allies */
r.allies=await q(()=>{const k=allyOpts().map(x=>x[0]);return !k.includes('tholo')&&!k.includes('commodus')&&k.includes('lion')&&k.includes('zora')&&k.includes('bear')&&k.includes('snake')&&k.includes('wolf')});
await q(()=>{const c=blankNpc();c.id='hum95';c.name='Titan';c.kind='Humanoid giant';c.kindKey=null;CUSTOM.npcs=[...(CUSTOM.npcs||[]),c];const d=blankNpc();d.id='dog95';d.name='Rex';d.kind='Hound';d.kindKey=null;CUSTOM.npcs.push(d);registerCustoms()});
r.allies2=await q(()=>{const k=allyOpts().map(x=>x[0]);return !k.includes('cn_hum95')&&k.includes('cn_dog95')});
/* 3 · the class designer */
await q(()=>{ST.tab='classes';ST.draft=blankClass();studioRedraw()});await W(500);
r.legs=await q(()=>{const s=document.querySelector('#studio select[data-f="arm.legU"]');const card=s&&s.closest('.card2');const vals=s?[...s.options].map(o=>o.value):[];
  return !!card&&!!card.querySelector('select[data-f="arm.legL"]')&&vals.includes('legwrapsU')&&!document.querySelector('#studio [data-f="arm.legUp"]')&&ST.draft.arm.legU==='legwrapsU'&&!ST.draft.arm.legUp&&s.value==='legwrapsU'});
r.noflash=await q(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));let bad=0;for(const [f,v] of [['arm.legL','ocrea'],['arm.legL',''],['arm.chest',''],['arm.head','']]){const e=document.querySelector(`#studio select[data-f="${f}"]`);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));await W8(120);
    const hit=document.querySelector('#clsCard .avhit');if(hit&&getComputedStyle(hit).display!=='none')bad++}return bad===0});
/* 6 · cohorts */
await q(()=>{ST.tab='cohorts';ST.pxd=pairBlank();ST.pxd.name='The Very Long Named Cohort Of Doom And Gloom';ST.pxd.type='team4';ST.pxd.members=['cls:soldier','npc:lion','cls:hero','npc:wolf'];studioRedraw()});await W(500);
r.cohort=await q(()=>{const c=document.querySelector('.pc95');if(!c)return false;const h=c.querySelector('.pc95h');const cr=c.getBoundingClientRect(),hr=h.getBoundingClientRect();
  return c.querySelectorAll('.pc95t').length===4&&c.querySelectorAll('.rtok').length>=2&&hr.right<=cr.right+1&&hr.left>=cr.left-1&&![...document.querySelectorAll('#studio img')].some(i=>/width:170px/.test(i.getAttribute('style')||''))});
/* 5 · the token round letter sits behind the art */
r.letter=await q(()=>{const s=rtokSVG({ring:'bronze',bg:'#444444',glyph:true,glyphC:'#ffffff',base:'',layers:[{t:'circle',x:50,y:50,w:30,h:30,c:'#ff0000',o:1}],baked:[]},{glyph:'Q',name:'Q'});
  const a=s.indexOf('<text'),c=s.lastIndexOf('<circle cx="0"')>=0?s.indexOf('fill="#ff0000"'):-1;return a>0&&c>a&&s.indexOf('<text')===s.lastIndexOf('<text')});
/* 9 · sculptor: lock, colour, snap points */
await q(()=>{ST.gearSub='w';ST.cw=blankCW();openStudio('gear')});await W(900);
await q(()=>{document.querySelector('[data-scb="add"][data-k="w"]').click()});await W(300);
r.lockBox=await q(()=>!!document.querySelector('[data-scb95="lkp"]'));
await q(()=>{const cols=new Set();for(let i=0;i<14;i++){const L=[];cols.add(scbPickColor95(i?[{c:[...cols].pop()}]:[]))}window.__cols=cols.size});
r.colour=await q(()=>window.__cols>=4);
await pg.click('[data-scb95="lkp"]');await W(100);
await q(()=>{const e=document.querySelector('input[data-scbl="w"][data-k="w"]');e.value=28;e.dispatchEvent(new Event('input',{bubbles:true}))});await W(200);
r.lock=await q(()=>{const L=ST.cw.art.layers[0];return L.lkp===1&&L.w===28&&Math.abs(L.w/L.h-L.pr)<0.15&&+document.querySelector('input[data-scbl="h"][data-k="w"]').value===L.h});
r.wh=await q(()=>{const s=shapeSVG({t:'rect',x:50,y:50,w:40,h:10});return /width="40"/.test(s)&&/height="10"/.test(s)});
r.ticks=await q(()=>document.querySelectorAll('#studio input[type=range][list]').length>=3&&!!document.querySelector('datalist[id^="snp95_"] option'));
r.snap=await q(()=>{const e=document.querySelector('input[data-scbl="o"][data-k="w"]');if(!e)return 'no slider';e.value=0.97;e.dispatchEvent(new Event('input',{bubbles:true}));const keyboard=+e.value;
  e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));e.value=0.96;e.dispatchEvent(new Event('input',{bubbles:true}));const ptr=+e.value;window.dispatchEvent(new PointerEvent('pointerup'));return keyboard<1&&ptr===1});
/* 8 · the weapon designer */
await q(()=>{ST.cw=blankCW();ST.cw.name='Test95';studioRedraw()});await W(400);
await q(()=>{ST.cw.stats.soul=1;ST.cw.stats.cfw=1;studioRedraw()});await W(300);
await pg.click('input[data-cwf="s.both"]').catch(()=>{});await W(200);
r.cap=await q(()=>!ST.cw.stats.both&&document.querySelector('.cw95cap b').textContent==='4');
r.capNoBoth=await q(()=>{const e=document.querySelector('input[data-cwf="s.both"]');return !e||e.disabled||!e.checked});
await q(()=>{ST.cw.stats.both=1;ST.cw.stats.thrN=1;ST.cw.stats.thrP=2;ST.cw.stats.thrR=3;ST.cw.stats.ammo=4;studioRedraw()});await W(300);
await pg.click('input[data-cwf="s.shield"]');await W(400);
r.shield=await q(()=>{const st=ST.cw.stats;const ex=['thrN','ammo','atkUses','soul','cfw','both'].filter(k=>st[k]);const w=cwBuild(ST.cw);return st.shield&&ex.length===1&&!w.ammo&&!w.cfw&&!w.soul&&!w.both&&w.p===0&&w.r===0});
await q(()=>{ST.cw.stats.soul=0;ST.cw.stats.cfw=0;ST.cw.stats.both=0;ST.cw.stats.thrN=0;ST.cw.stats.ammo=0;studioRedraw()});await W(300);
await pg.click('input[data-cwt="shP"]');await W(300);await pg.click('input[data-cwt="shR"]');await W(300);
r.shAtk=await q(()=>{const st=ST.cw.stats;const w=cwBuild(ST.cw);return st.shP>=1&&st.shR>=1&&w.p>=1&&w.r>=1&&w.shield&&document.querySelector('.cw95cap b').textContent==='3'});
await pg.click('input[data-cwf="s.soul"]');await W(300);await pg.click('input[data-cwf="s.cfw"]').catch(()=>{});await W(200);
r.shOne=await q(()=>{const st=ST.cw.stats;return !!st.soul&&!st.cfw&&document.querySelector('.cw95cap b').textContent==='4'});
await q(()=>{ST.cw.stats.thrN=1;ST.cw.stats.ammo=4;ST.cw.stats.both=1});
await pg.click('[data-gs="wsave"]');await W(700);
r.saved=await q(()=>{const w=(CUSTOM.weapons||[]).find(x=>x.name==='Test95');if(!w)return 'not saved';const st=w.stats;const ex=['thrN','ammo','atkUses','soul','cfw','both'].filter(k=>st[k]);return st.shield&&ex.length<=1});
/* 4 · the armor fit tool */
await q(()=>{ST.gearSub='a';ST.ca=blankCA();AFIT.mode=false;openStudio('gear')});await W(900);
await q(()=>{document.querySelector('[data-afit3="legwrapsU"]').click()});await W(700);
r.sides=await q(()=>[...document.querySelectorAll('.afit [data-afside]')].map(x=>x.dataset.afside).join('')==='BRL'&&AFIT.side==='B');
const dxs=()=>q(()=>({o:(ARM_FIT_OVR.legwrapsU||{}).dx,l:((ARM_FIT_OVR.legwrapsU||{}).L||{}).dx}));
await q(()=>{const e=document.querySelector('[data-afit2="dx"]');e.value=11;e.dispatchEvent(new Event('input',{bubbles:true}))});await W(200);
const a=await dxs();r.both=a.o===11&&a.l===11;
await pg.click('[data-afside="R"]');await W(500);
await q(()=>{const e=document.querySelector('[data-afit2="dx"]');e.value=-4;e.dispatchEvent(new Event('input',{bubbles:true}))});await W(200);
const b2=await dxs();r.right=b2.o===-4&&b2.l===11;
await pg.click('[data-afside="L"]');await W(500);
await q(()=>{const e=document.querySelector('[data-afit2="dx"]');e.value=6;e.dispatchEvent(new Event('input',{bubbles:true}))});await W(200);
const c2=await dxs();r.left=c2.o===-4&&c2.l===6;
const mir=()=>q(()=>({r:armBox('legwrapsU','rleg').mirror,l:armBox('legwrapsU','lleg').mirror}));
await pg.click('[data-afside="R"]');await W(500);const m0=await mir();
await pg.click('[data-afflip]');await W(300);const m1=await mir();
r.mirR=m1.r!==m0.r&&m1.l===m0.l;
await pg.click('[data-afside="L"]');await W(500);await pg.click('[data-afflip]');await W(300);const m2=await mir();
r.mirL=m2.l!==m1.l&&m2.r===m1.r;
await pg.click('[data-afside="B"]');await W(500);await pg.click('[data-afflip]');await W(300);const m3=await mir();r.mirB=m3.l!==m2.l&&m3.r!==m2.r;
await q(()=>{window.__toast=[];const t=mToast;window.__mt=t;mToast=function(m){window.__toast.push(String(m));return t.apply(this,arguments)}});
await pg.click('[data-gs="asave"]');await W(300);
r.fitSave=await q(()=>window.__toast.some(m=>/Fit saved/.test(m))&&!window.__toast.some(m=>/equip point/.test(m)));
await q(()=>{mToast=window.__mt;for(const k of Object.keys(ARM_FIT_OVR))delete ARM_FIT_OVR[k];AFIT.mode=false});
/* 11 · Play Now */
await q(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);const c=blankChar();c.id='c95p';c.name='Pia Ferox';charFromClass(c,'hero');c.rolls=true;CUSTOM.chars.push(c);await Store.put('customChars',c.id,c);registerCustoms();CFG.roster='rolls';menuHide();openSetup(true)});await W(1800);
r.stands=await q(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const d=document.querySelector('#mBody .stands92 details.st92pers');if(!d)return 'no fold';const sm=d.querySelector('summary');sm.click();await W8(200);const o1=d.open;
  document.querySelector('#mBody').click();await W8(200);const c1=!d.open;sm.click();await W8(200);const o2=d.open;document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await W8(200);const c2=!d.open;
  sm.click();await W8(200);BUS.emit('window.open',{title:'x'});const reset=CFG.pers92===false;pers95Close();return o1&&c1&&o2&&c2&&reset});
await pg.click('[data-pick76="1"]');await W(400);
r.tabs=await q(()=>!!document.querySelector('.pk95tabs')&&document.querySelector('.pk76grid[data-pk95pane="cls"]')&&!document.querySelector('.pk95chars [data-pk95]')===false);
await pg.click('[data-pk95tab="chars"]');await W(200);
r.charsTab=await q(()=>{const p=document.querySelector('.pk95chars');return !p.hidden&&document.querySelector('.pk76grid[data-pk95pane="cls"]').hidden&&p.querySelectorAll('[data-pk95]').length>=1});
await pg.click('[data-pk95as="1"]');await pg.click('[data-pk95]:not([disabled])');await W(500);
r.seatCpu=await q(()=>String(CFG.seats[1].cls).startsWith('cc_')&&CFG.seats[1].cpu===true);
await q(()=>{CFG.seats[1].cls='soldier';CFG.seats[2].cls='royalty';pnRedraw75()});await W(500);
r.fillBtn=await q(()=>!!document.querySelector('[data-fill95]'));
await pg.click('[data-fill95]');await W(500);
r.fill=await q(()=>CFG.seats.slice(0,CFG.n).some((s,i)=>i>0&&s.cpu&&String(s.cls).startsWith('cc_')));
/* 390 px */
await pg.setViewportSize({width:390,height:800});await W(400);
await q(()=>{if(CUR_MODAL)CUR_MODAL.done(null);ST.tab='chars';ST.draft=blankChar();ST.view='edit';openStudio('chars')});await W(900);
r.phoneChar=await q(()=>{const m=document.getElementById('mBody');const p=document.getElementById('st95stats');return !!p&&m.scrollWidth<=m.clientWidth+3});
await q(()=>{ST.tab='rosters';studioRedraw()});await W(400);
r.phoneRoster=await q(()=>{const m=document.getElementById('mBody');return m.scrollWidth<=m.clientWidth+3});
await q(()=>{ST.tab='cohorts';ST.pxd=pairBlank();ST.pxd.type='team4';ST.pxd.members=['cls:soldier','npc:lion','cls:hero','npc:wolf'];studioRedraw()});await W(400);
r.phoneCohort=await q(()=>{const m=document.getElementById('mBody');return m.scrollWidth<=m.clientWidth+3});
/* 7 · the +10 CF win bonus stays the printed Damnatio's */
await q(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:true},{cls:'hero',cpu:true}],opts:{spect:0}})});await W(2500);
await q(async()=>{for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,150))}});
r.pelted=await q(()=>{const p=S.players[0];CLASSES.cc_t95a={...CLASSES.soldier,weak:'pelted',clsRef:'ccl:zz'};CLASSES.cc_t95b={...CLASSES.soldier,weak:'pelted',clsRef:'cls:damnatio'};const save=p.cls;
  p.cls='cc_t95a';const a=finalCF(p,true);p.cls='cc_t95b';const b2=finalCF(p,true);p.cls='damnatio';const c=finalCF(p,true);p.cls=save;return b2-a===10&&c-a===10&&pelt10_95({cls:'cc_t95a'})===false&&/Pelted/.test(WEAKNESSES.pelted[1])&&!/\+10/.test(WEAKNESSES.pelted[1])});
const errNew=await q(m=>errNew92(m).map(e=>e.kind+':'+e.msg),mark);
const miss=Object.entries(r).filter(([k,v])=>!v||(typeof v==='string')).map(([k])=>k);console.log(JSON.stringify(r));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4),errNew.filter(m=>!/ERR_FAILED|Failed to load/.test(m)).slice(0,4));
await b.close();if(miss.length||errs.length)process.exit(1)})();
