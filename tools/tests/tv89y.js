/* v0.89 the square's sidebar reworked for the forum (181-v89citybar): header card (city, tonight, coin, horns); tabs =
   Stalls · Auction · Temple · Arena · People · Menagerie; THIS VISIT lists what was bought here (kit with cost + ↶ undo at the
   stall's own 70%, the temple offering), net spent at the foot; a real click on a building opens its tab (folded sidebar →
   the floating panel as before); People hides empty groups (no "No … yet"); phone width: bottom sheet, no sideways scroll.
   SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W=ms=>pg.waitForTimeout(ms);const SHOT=process.env.SHOT||'';
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}window.travelOK=()=>true;window.travelBlock=()=>false;
  newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_();me().coin=300;w.night.travel={cost:0,paid:true};w.night.god76=null;openCitySquare(w.night.loc,{prematch:true})});
await W(2500);
/* 1 · the frame */
const f=await pg.evaluate(()=>({tabs:[...document.querySelectorAll('#citySide .cbar89tabs [data-cside]')].filter(b=>!b.hidden).map(b=>b.dataset.cside),
  old:!!document.querySelector('#citySide [data-cside="kin"],#citySide [data-cside="stands"],#citySide [data-cside="roster"]'),
  head:(document.querySelector('#citySide .cbar89hd')||{}).textContent||'',side:CITY.side,
  empty:(document.getElementById('cbar89Visit')||{}).textContent||''}));
ok(['stalls','auction','temple','arena','people','beasts','hide'].every(k=>f.tabs.includes(k))&&!f.old,'1 tabs regrouped '+f.tabs);
ok(/Tonight/.test(f.head)&&/coin/.test(f.head)&&/to the horns/.test(f.head),'1 header: tonight, coin, horns '+f.head.slice(0,140));
ok(f.side==='stalls','1 a lanista opens on the Stalls '+f.side);
ok(/Nothing bought yet/.test(f.empty),'1 empty visit line '+f.empty);
/* 2 · a kit for a fighter → THIS VISIT with cost + undo; the undo is the stall's own 70% */
const k=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const s=document.getElementById('cityKitWho');const o={inSide:!!s.closest('#citySide')};
  s.value=s.options[1].value;s.dispatchEvent(new Event('change',{bubbles:true}));await W8(150);const g=gById(document.getElementById('cityKitWho').value);o.follow=g.id===s.options[1].value&&document.getElementById('cityKitList').textContent.includes(g.name);
  const c0=me().coin;const btn=[...document.querySelectorAll('#citySide .cbar89ware')].find(b=>/cityBuyKit\('mw2'/.test(b.getAttribute('onclick')));btn.click();await W8(150);
  o.paid=c0-me().coin;o.kit=(g.kit||[]).slice();const V=document.getElementById('cbar89Visit');o.row=V.textContent;o.undo=V.querySelectorAll('[data-cbar89undo]').length;o.fig=!!V.querySelector('.cbar89vf svg');o.ico=!!V.querySelector('.cbar89vico .rtok,.cbar89vico span,.cbar89vico img');
  const c1=me().coin;V.querySelector('[data-cbar89undo]').click();await W8(150);o.back=me().coin-c1;o.kit2=(g.kit||[]).slice();o.row2=document.getElementById('cbar89Visit').textContent;o.undo2=document.querySelectorAll('#cbar89Visit [data-cbar89undo]').length;
  document.querySelector('#citySide .cbar89ware:not([disabled])').click();await W8(150);o.n=CITY.visit89.length;return o});
ok(k.inSide&&k.follow,'2 the kit picker lives in the Stalls tab and follows the fighter '+JSON.stringify([k.inSide,k.follow]));
ok(k.paid===12&&k.kit.includes('mw2'),'2 kit bought '+JSON.stringify([k.paid,k.kit]));
ok(/Market Weapon/.test(k.row)&&/12/.test(k.row)&&k.undo===1&&k.fig,'2 THIS VISIT: fighter figure, item, cost, undo '+k.row.slice(0,160));
ok(k.back===Math.ceil(12*0.7)&&!k.kit2.includes('mw2')&&/back/.test(k.row2)&&k.undo2===0,'2 undo = the stall return (70%) '+JSON.stringify([k.back,k.kit2,k.undo2]));
ok(k.n===2,'2 a second kit is a second line '+k.n);
if(SHOT)await pg.screenshot({path:SHOT+'/tv89y_stalls.png'});
/* 3 · a REAL click on the temple in the forum opens the Temple tab; the offering lands in THIS VISIT */
const pt=await pg.evaluate(()=>{const S=CB89.sprites&&CB89.sprites.temple;if(!S)return null;const rect=CITY.cv.getBoundingClientRect();
  for(let j=Math.floor(S.h/4);j<S.h/2;j++)for(let i=0;i<S.mw;i++){if(!S.mask[j*S.mw+i])continue;const x=S.x+i*2+1,y=S.y+j*2+1;const hit=cityAt({clientX:rect.left+x,clientY:rect.top+y});if(hit.b89==='temple')return {x:rect.left+x,y:rect.top+y}}return null});
ok(!!pt,'3 found the temple on the canvas');
if(pt){await pg.mouse.click(pt.x,pt.y);await W(400)}
const t=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={side:CITY.side,panel:!document.getElementById('cityPanel').hidden,gods:document.querySelectorAll('#citySideBody [data-god89]').length};
  const c0=me().coin;const g=document.querySelector('#citySideBody [data-god89]:not([disabled])');if(g)g.click();await W8(200);o.paid=c0-me().coin;o.god=W_().night.god76;o.row=document.getElementById('cbar89Visit').textContent;return o});
ok(t.side==='temple'&&!t.panel&&t.gods>=3,'3 temple click → Temple tab, no floating panel '+JSON.stringify(t));
ok(t.paid>0&&!!t.god&&/Mars|Fortuna|Nemesis/.test(t.row),'3 the offering in THIS VISIT '+t.row.slice(0,200));
ok(/Spent here/.test(t.row),'3 total at the foot');
/* 4 · the other buildings: arms → Stalls, auction → Auction, arena → Arena; folded → the floating panel as before */
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  citySelect({kind:'bldg',key:'armor'});await W8(100);o.armor=CITY.side;citySelect({kind:'auction'});await W8(100);o.auct=CITY.side+':'+!!document.querySelector('#citySideBody [onclick^="cityBuyLot"]');
  citySelect({kind:'bldg',key:'arena'});await W8(100);o.arena=CITY.side+':'+/Enter the arena/.test(document.getElementById('citySideBody').textContent);
  citySelect({kind:'bldg',key:'train'});await W8(100);o.train=CITY.side+':'+!!document.querySelector('#citySideBody [data-cw89="yard"]');
  document.querySelector('#citySide [data-cside="hide"]').click();await W8(150);citySelect({kind:'bldg',key:'temple'});await W8(100);o.fold=!document.getElementById('cityPanel').hidden&&!!document.querySelector('#cityPanel [data-god89],#cityPanel .tmp76,#cityPanel .sect');
  cityPanel('');document.querySelector('#citySide [data-cside="hide"]').click();await W8(150);return o});
ok(r.armor==='stalls'&&r.auct==='auction:true'&&r.arena==='arena:true'&&r.train==='arena:true','4 buildings open their tabs '+JSON.stringify(r));
ok(r.fold,'4 folded sidebar → the floating panel');
/* 5 · People: one list, empty groups hidden, no "No … yet" */
const p=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(const x of CROWD_CACHE)if(x.kin)x._k9=x.kin,x.kin=null;
  document.querySelector('#citySide [data-cside="people"]').click();await W8(200);const B=document.getElementById('citySideBody');
  const o={grp:[...B.querySelectorAll('[data-cbar89grp]')].map(x=>x.dataset.cbar89grp),chips:[...B.querySelectorAll('[data-cbar89pf]')].map(x=>x.dataset.cbar89pf),noyet:/No [^.]* yet/.test(document.getElementById('citySide').textContent),rows:B.querySelectorAll('.cbar89p').length};
  const ch=B.querySelector('[data-cbar89pf]:not([data-cbar89pf="all"])');if(ch){ch.click();await W8(150);o.filtered=[...document.querySelectorAll('#citySideBody [data-cbar89grp]')].map(x=>x.dataset.cbar89grp)}
  const row=document.querySelector('#citySideBody .cbar89p');if(row){row.click();await W8(200);o.card=!document.getElementById('cityPanel').hidden}
  for(const x of CROWD_CACHE)if(x._k9)x.kin=x._k9,delete x._k9;return o});
ok(!p.grp.includes('kin')&&!p.chips.includes('kin')&&!p.noyet&&p.rows>0,'5 empty groups hidden '+JSON.stringify(p));
ok(!p.filtered||p.filtered.length===1,'5 a chip filters to one group '+JSON.stringify(p.filtered));
ok(p.card,'5 a face opens its card');
if(SHOT)await pg.screenshot({path:SHOT+'/tv89y_people.png'});
/* 6 · a phone: the sidebar is a bottom sheet, nothing scrolls sideways */
await pg.setViewportSize({width:390,height:844});await W(700);
const ph=await pg.evaluate(()=>{const s=document.getElementById('citySide').getBoundingClientRect();const v=document.getElementById('cbar89Visit').getBoundingClientRect();const c=CITY.cv.getBoundingClientRect();
  return {sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,side:[Math.round(s.left),Math.round(s.right),Math.round(s.top),Math.round(s.height)],visit:Math.round(v.height),below:s.top>=c.bottom-2,ovw:document.getElementById('cityOv').scrollWidth}});
ok(ph.sw<=ph.cw&&ph.ovw<=390&&ph.side[0]>=0&&ph.side[1]<=390&&ph.side[3]>150&&ph.visit>40&&ph.below,'6 phone bottom sheet, no sideways scroll '+JSON.stringify(ph));
if(SHOT)await pg.screenshot({path:SHOT+'/tv89y_phone.png'});
console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(miss.length||errs.length?1:0)})();
