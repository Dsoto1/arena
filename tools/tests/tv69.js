/* v0.69: armor designer — the avatar mock-up under the piece (no view tabs), a required equip point (slot + part follow it),
   free placement kept relative to the point (size kept when the point changes), single vs pair preview, a custom piece worn
   only on the limb it is equipped to (mirrored at the left point); the sculpted set only with the Sculpted style; the
   printed-set fit tool open to everyone and saved in the game data (Store armorFit, in SAVE_COLS); gold Flavius' Bracers */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2000);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ST.gearSub='a';ST.ca=blankCA();openStudio('gear');await W8(900);
  const r={tabs:!!document.querySelector('[data-gs="caview"][data-id="avatar"]'),mock:!!document.querySelector('#caAv svg'),eqsel:!!document.querySelector('[data-caeq2]'),old:!!document.querySelector('[data-caf="slot"],[data-caf="pt"]'),fit:true,saveCols:SAVE_COLS.includes('armorFit')};
  const n0=(CUSTOM.armor||[]).length;document.querySelector('[data-gs="asave"]').click();await W8(300);r.blocked=(CUSTOM.armor||[]).length===n0;
  ST.ca=blankCA();caFromSystem(ST.ca,'manica');ST.ca.noArt=1;ST.ca.name='Tv69 Sleeve';ST.ca.pair=0;document.getElementById('caRedraw').click();await W8(400);r.autoEq=ST.ca.eq;
  const sz=document.querySelector('[data-cav="s"]');sz.value=70;sz.dispatchEvent(new Event('input',{bubbles:true}));
  const s=document.querySelector('[data-caeq2]');s.value='fore';s.dispatchEvent(new Event('change',{bubbles:true}));await W8(400);r.part=[ST.ca.slot,ST.ca.pt];r.keptS=caF2(ST.ca).s;
  const g=(document.querySelector('#caAv svg').innerHTML.match(/scale\(0\.7\)/g)||[]).length;r.single=g===1;
  document.querySelector('[data-gs="asave"]').click();await W8(800);const c=(CUSTOM.armor||[]).find(x=>x.name==='Tv69 Sleeve');r.saved=!!c&&c.eq==='fore'&&!!c.fit&&!!c.f2;
  /* worn in a match: only on the left arm, at the left point, mirrored */
  if(c){const key='ca_'+c.id;const p={id:'t69',name:'x',hp:{},ap:{},pieces:{}};for(const l of LOCS){p.hp[l]=5;p.ap[l]=0;p.pieces[l]=[]}p.pieces.larm=[{key,n:c.name,ap:3}];p.ap.larm=3;
    const svg=avatarSVG(p);const m=svg.match(/translate\(([\d.]+) ([\d.]+)\) rotate\([^)]*\) scale\(-1 1\)/g)||[];r.worn=m.length===1&&Math.abs(parseFloat(m[0].slice(10))-(EQ_L.fore[0]-c.f2.dx))<0.6}
  /* the printed-set fit tool (v0.70: behind its code word): saved in the game data */
  localStorage.setItem('flavius_armfit_on','1');document.getElementById('caRedraw').click();await W8(400);document.querySelector('[data-afit3="galerus"]').click();await W8(500);r.fit=!!document.querySelector('.afit #afPrev2');
  const k=document.querySelector('[data-afkey]');k.value='galerus';k.dispatchEvent(new Event('change',{bubbles:true}));await W8(200);
  const w=document.querySelector('.afit [data-afit2="w"]');w.value=50;w.dispatchEvent(new Event('input',{bubbles:true}));
  const f=document.querySelector('[data-afflip]');f.checked=true;f.dispatchEvent(new Event('change',{bubbles:true}));await W8(900);
  const doc=await Store.getDoc('armorFit','sys');r.store=!!doc&&doc.fits&&doc.fits.galerus&&doc.fits.galerus.w===50&&doc.fits.galerus.flip===1;
  const B=armBox('galerus','rarm');r.flip=B.w===50&&B.mirror===true;
  r.gold=cardStyle('a:bracers').includes('sepia')&&!cardStyle('a:provmanica').includes('sepia')&&!!armBox('bracers','rarm').gold;
  delete ARM_FIT_OVR.galerus;afitSave();AFIT.mode=false;localStorage.removeItem('flavius_armfit_on');
  SETTINGS.armorStyle='scan';document.getElementById('caRedraw').click();await W8(400);r.noSculpt=document.querySelectorAll('[data-gs="casys"]').length;
  SETTINGS.armorStyle='drawn';document.getElementById('caRedraw').click();await W8(400);r.sculpt=document.querySelectorAll('[data-gs="casys"]').length;
  if(c){CUSTOM.armor=CUSTOM.armor.filter(x=>x.id!==c.id);await Store.del('customArmor',c.id).catch(()=>{})}return r});
ok(!o.a.tabs&&o.a.mock&&o.a.eqsel&&!o.a.old,'designer layout');ok(o.a.blocked,'save needs an equip point');ok(o.a.autoEq==='sho','printed start picks its point');
ok(o.a.part.join()==='arm,lower'&&o.a.keptS===70,'point sets the part, size kept');ok(o.a.single,'single piece shows one side');ok(o.a.saved,'fit saved with the piece');
ok(o.a.worn,'worn only on its limb, at the left point');ok(o.a.saveCols&&o.a.fit&&o.a.store&&o.a.flip,'fit tool saved in the game data');ok(o.a.gold,'gold bracers');ok(o.a.noSculpt>=27&&o.a.sculpt===o.a.noSculpt,'system set kept in both art styles (v0.72)');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
