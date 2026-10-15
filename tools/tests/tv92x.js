/* v0.92: armor EXTRAS in the 2D Armor designer (207-v92extras) — every kind added from the tray, a drag moves one, Size/Turn/
   Colour change it, ✕ removes one; saved on the record (Store), kept after a reload, drawn in armSVG/thumbnails, over the printed
   art of a copy (caOnBodySVG), and on the player board's avatar in a Play Now event with a custom character wearing the piece. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
/* L: location extras — each equip point offers its own kinds (row "For this piece") + the general ones and no other location's;
   every location kind added + drawn once; a helm with the head kinds is saved (checked after the reload in c) */
o.L=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}menuHide();ST.gearSub='a';ST.ca=blankCA();openStudio('gear');await W8(900);
  const gen=Object.keys(X92_K).filter(k=>!X92_K[k].at);const r={bad:[],undrawn:[],seen:[]};
  for(const eq of ['head','chest','belt','fore','hand','thigh','shin']){ST.ca.x92=[];const s=document.querySelector('[data-caeq2]');s.value=eq;s.dispatchEvent(new Event('change',{bubbles:true}));await W8(350);
    const own=Object.keys(X92_K).filter(k=>X92_K[k].at&&X92_K[k].at.includes(eq));const offered=[...document.querySelectorAll('[data-x92add]')].map(b=>b.dataset.x92add);
    const ownRow=[...document.querySelectorAll('.x92own [data-x92add]')].map(b=>b.dataset.x92add);
    if(offered.sort().join()!==[...own,...gen].sort().join()||ownRow.sort().join()!==own.slice().sort().join())r.bad.push(eq);
    for(const k of own){if(r.seen.includes(k))continue;document.querySelector(`[data-x92add="${k}"]`).click();await W8(40);r.seen.push(k);if(!document.querySelector(`#x92Prev .x92e[data-k="${k}"]`)||!armSVG('ca_preview',{...ST.ca}).includes(`data-k="${k}"`))r.undrawn.push(k)}
    if(eq==='head'){ST.ca.name='Tv92 Murmillo Helm';ST.ca.shape='helmR';document.querySelector('[data-gs="asave"]').click();await W8(900);const c=(CUSTOM.armor||[]).find(x=>x.name==='Tv92 Murmillo Helm');r.helm=c&&c.id;r.helmN=c&&(c.x92||[]).length;
      r.refuse=(()=>{const n=ST.ca.x92.length;x92Add('phalerae');return ST.ca.x92.length===n})()}}
  r.all=Object.keys(X92_K).filter(k=>X92_K[k].at&&!['galerus','manica'].includes(k)).every(k=>r.seen.includes(k));return r});
ok(!o.L.bad.length,'L each location offers its own kinds only '+o.L.bad);ok(o.L.all&&!o.L.undrawn.length,'L every location kind drawn '+o.L.undrawn);ok(o.L.helm&&o.L.helmN===8,'L helm saved with the head kinds');ok(o.L.refuse,'L a chest kind refused on a helm');
/* a: the tray, every kind added */
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}menuHide();ST.gearSub='a';ST.ca=blankCA();openStudio('gear');await W8(900);
  const d=ST.ca;d.name='Tv92 Spiked Cuirass';d.shape='muscle';const s=document.querySelector('[data-caeq2]');s.value='chest';s.dispatchEvent(new Event('change',{bubbles:true}));await W8(400);
  const chest={btns:document.querySelectorAll('[data-x92add]').length,arm:!!document.querySelector('[data-x92add="manica"],[data-x92add="galerus"]')};
  /* v0.92: neck guard + Manica plates are arm-only — the rest of the test uses an upper-arm piece */
  {const s2=document.querySelector('[data-caeq2]');s2.value='sho';s2.dispatchEvent(new Event('change',{bubbles:true}));await W8(400)}
  const r={chest,tray:!!document.querySelector('#x92Tray'),btns:document.querySelectorAll('[data-x92add]').length};
  for(const k of [...document.querySelectorAll('[data-x92add]')].map(b=>b.dataset.x92add)){document.querySelector(`[data-x92add="${k}"]`).click();await W8(60)}
  r.n=(ST.ca.x92||[]).length;r.kinds=[...new Set(ST.ca.x92.map(x=>x.k))].length;
  r.drawn=document.querySelectorAll('#x92Prev .x92e').length;r.inPiece=document.querySelectorAll('#caPiece .x92e').length;r.inMock=document.querySelectorAll('#caAv .x92e').length;
  ST.x92sel=1;x92Refresh(true);await W8(100); /* the Manica plates */
  r.x0=ST.ca.x92[1].x;r.y0=ST.ca.x92[1].y;return r});
ok(o.a.chest&&o.a.chest.btns===9+5&&!o.a.chest.arm,'a chest piece: no arm-only extras '+JSON.stringify(o.a.chest));ok(o.a.tray,'a tray shown');ok(o.a.btns===11,'a eleven kinds');ok(o.a.n===11&&o.a.kinds===11,'a every kind added');ok(o.a.drawn===11,'a drawn in the tray');ok(o.a.inPiece===11,'a drawn in the piece preview');ok(o.a.inMock===11,'a drawn on the mock-up');
/* b: drag the selected extra on the tray preview */
/* v1.03 S1: the Gear designers are in 335's tabbed frame — open the tab that holds a control first */
const tab103=(pg,sel)=>pg.evaluate(s=>{const e=document.querySelector(s);const p=e&&e.closest('.df99pane');if(p){const b=document.querySelector('[data-df99t="'+p.dataset.df99p+'"]');if(b)b.click()}},sel);
await tab103(pg,'#x92Prev');await pg.waitForTimeout(200);
await pg.evaluate(()=>{document.querySelector('#x92Prev').scrollIntoView({block:'center'})});await pg.waitForTimeout(200);
const bb=await pg.evaluate(()=>{const ring=[...document.querySelectorAll('#x92Prev [data-x92i="1"]')][0];const r=ring.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,pw:document.querySelector('#x92Prev svg').getBoundingClientRect().width}});
await pg.mouse.move(bb.x,bb.y);await pg.mouse.down();await pg.mouse.move(bb.x+bb.pw*0.1,bb.y+bb.pw*0.1,{steps:5});await pg.mouse.up();await pg.waitForTimeout(200);
o.b=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={sel:ST.x92sel,x:ST.ca.x92[1].x,y:ST.ca.x92[1].y};
  const set=(f,v)=>{const i=document.querySelector(`[data-x92f="${f}"]`);i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}))};
  set('s',150);set('r',30);set('c','#3355aa');await W8(100);const e=ST.ca.x92[1];r.s=e.s;r.r=e.r;r.c=e.c;
  r.tf=(document.querySelectorAll('#x92Prev .x92e')[1]||{getAttribute:()=>''}).getAttribute('transform');
  /* style: damage → cracks */
  const di=ST.ca.x92.findIndex(x=>x.k==='dmg');ST.x92sel=di;x92Refresh(true);await W8(50);const v=document.querySelector('select[data-x92f="v"]');v.value='crack';v.dispatchEvent(new Event('change',{bubbles:true}));await W8(50);r.v=ST.ca.x92[di].v;
  /* remove: the last chip's ✕ (paint) */
  document.querySelector('.x92chip:last-child [data-x92del]').click();await W8(100);r.n=ST.ca.x92.length;r.paint=ST.ca.x92.some(x=>x.k==='paint');
  /* the cap */
  for(let i=0;i<5;i++){document.querySelector('[data-x92add="studs"]').click();await W8(30)}r.cap=ST.ca.x92.length;r.capBtn=document.querySelector('[data-x92add="studs"]').disabled;
  ST.ca.x92.splice(10);ST.x92sel=null;x92Refresh(true);
  /* save */
  document.querySelector('[data-gs="asave"]').click();await W8(900);const c=(CUSTOM.armor||[]).find(x=>x.name==='Tv92 Spiked Cuirass');r.saved=!!c&&(c.x92||[]).length===10;
  const doc=c&&await Store.getDoc('customArmor',c.id);r.store=!!doc&&(doc.x92||[]).length===10;r.id=c&&c.id;
  r.svg=c?armSVG('ca_'+c.id).includes('class="x92"'):false;r.url=c?decodeURIComponent(armArtURL('ca_'+c.id)).includes('class="x92"'):false;
  /* a copy that wears the printed art: the extras lie over the art on the body */
  const a=blankCA();caFromSystem(a,'musculata');a.x92=[{k:'spikes',x:50,y:20,s:90,r:0,c:'#c9d0d6'}];r.art=caArtOn(a)&&caOnBodySVG(a,null,false).includes('class="x92"');
  /* junk from the shared Store is cleaned */
  r.clean=x92Clean([{k:'nope'},{k:'studs',x:'1e9',c:'red"><script>'},null]).length===1&&x92Clean([{k:'studs',c:'red"><script>'}])[0].c==='#d8c27a';
  return r});
ok(o.b.sel===1&&(o.b.x!==o.a.x0||o.b.y!==o.a.y0)&&o.b.x>o.a.x0,'b drag moves it');ok(o.b.s===150&&o.b.r===30&&o.b.c==='#3355aa'&&/rotate\(30\) scale\(1\.50\)/.test(o.b.tf||''),'b size/turn/colour');
ok(o.b.v==='crack','b style');ok(o.b.n===10&&!o.b.paint,'b removed');ok(o.b.cap===12&&o.b.capBtn,'b capped at 12');ok(o.b.saved&&o.b.store,'b saved on the record');ok(o.b.svg&&o.b.url,'b drawn on cards/thumbnails');ok(o.b.art,'b over the printed art');ok(o.b.clean,'b cleaned');
/* c: reload keeps them; a custom character wearing the piece in Play Now shows them on the board's avatar */
await pg.reload();await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
o.c=await pg.evaluate(async([id,hid])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}menuHide();
  for(let i=0;i<30&&!(CUSTOM.armor||[]).some(x=>x.id===id);i++)await W8(100);
  const hc=(CUSTOM.armor||[]).find(x=>x.id===hid);const c=(CUSTOM.armor||[]).find(x=>x.id===id);const r={helm:!!hc&&hc.x92.map(x=>x.k).sort().join()===Object.keys(X92_K).filter(k=>(X92_K[k].at||[]).includes('head')).sort().join(),kept:!!c&&(c.x92||[]).length===10,s:c&&c.x92[1].s,v:c&&(c.x92.find(x=>x.k==='dmg')||{}).v,reg:!!ARM['ca_'+id]};
  const ch=blankChar();ch.id='tv92c';ch.name='Tv92 Wearer';ch.arm.chest='ca_'+id;CUSTOM.chars=[...(CUSTOM.chars||[]).filter(x=>x.id!==ch.id),ch];CLASSES['cc_tv92c']=charClass(ch);
  startEvent({ev:'democritus',loc:6,seats:[{cls:'cc_tv92c',cpu:false},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  for(let i=0;i<40;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>4)break}
  SPEED='pause';const p=S.players.find(x=>x.cls==='cc_tv92c');r.wears=!!p&&Object.values(p.pieces).some(L=>L.some(pc=>pc.key==='ca_'+id));
  r.avatar=!!p&&avatarSVG(p).includes('class="x92"');try{render()}catch(e){}await W8(300);r.board=(document.getElementById('board')||{innerHTML:''}).innerHTML.includes('class="x92"');
  /* cleanup */
  CUSTOM.armor=CUSTOM.armor.filter(x=>x.id!==id);await Store.del('customArmor',id).catch(()=>{});CUSTOM.chars=CUSTOM.chars.filter(x=>x.id!=='tv92c');if(hid){CUSTOM.armor=CUSTOM.armor.filter(x=>x.id!==hid);await Store.del('customArmor',hid).catch(()=>{})}return r},[o.b.id,o.L.helm]);
ok(o.c.kept&&o.c.s===150&&o.c.v==='crack','c kept after a reload');ok(o.c.wears,'c the custom character wears it');ok(o.c.helm,'c helm head extras kept after a reload');ok(o.c.avatar&&o.c.board,'c drawn on the board avatar');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
