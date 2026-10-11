/* v1.0 MAP INSETS (295-v100maps): small empire-map insets in seven places — 1 the Match Week travel strip (home → host, host lit), 2 a world letter
   (the Consilium's counsel names a city → inset in the letter), 3 Recruiting (the selected fighter's home city on his/her card + the home-city filter
   removes rows), 4 the Annals Road on the real map (12 arenas, won ✓, next lit, the token keeps id roadSvg/.roadtok), 5 the League house card, 6 the
   programmata city picker (a pin click picks the city through 140's own handler), 7 the Season tablets' hover tip. One cached HTML per key; no new
   00c errors; the kill switch localStorage flavius_maps100off=1 removes every inset; 390 px: no sideways scroll. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const SHOT=process.env.SHOT||'';
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const boot=async(vp,ls)=>{const ctx=await b.newContext({viewport:vp});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const [k,v] of Object.entries(ls||{}))localStorage.setItem(k,v)},ls||{});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.goto('file://'+page,{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
/* every place, in one career; returns counts per place */
const RUN=`(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}
  openManager();await W8(400);newWorld({type:'pre',key:MGR_PRE[4].key});const w=W_(),m=me();const o={mark:ERR92.n};const q=s=>document.querySelectorAll('#mgrBody '+s).length;
  const ov=()=>{const d=document.documentElement;const B=document.getElementById('mgrBody');return {doc:d.scrollWidth-d.clientWidth,body:B?B.scrollWidth-B.clientWidth:0}};o.ov={};
  /* 1 · the travel strip: home → host */
  const host=LOCATIONS[w.night.loc].n;o.away=m.city!==host;
  MGR.tab='night';MGR_REDRAW();await W8(300);const tr=document.querySelector('#mgrBody .strip96 .mi100tr');o.strip=!!tr;
  o.stripHost=!!tr&&!!tr.querySelector('.k-host')&&(tr.querySelector('svg').getAttribute('aria-label')||'').includes(host);o.stripRoute=!!tr&&!!tr.querySelector('path');o.ov.night=ov();
  /* 2 · a world letter names a city */
  sendLetter(w,{key:'consil-'+w.week,from:'the Consilium',seal:'🏛',title:'Counsel for Capua: hold our fighters back',body:'<p>Riots in Capua.</p>'});
  sendLetter(w,{key:'gift-'+w.week,from:'A friend',seal:'🎁',title:'A small purse',body:'<p>From Capua, with love.</p>'});
  const it=mailLive('').items;o.letterMap=it.filter(x=>x.mi100).map(x=>x.key);o.letterCapua=it.some(x=>x.mi100&&/Capua/.test(x.html.slice(0,x.html.indexOf('lbody'))));
  MGR.tab='ludus';MGR_REDRAW();await W8(400);o.letterDom=document.querySelectorAll('#mgrBody .mi100let .mi100').length;o.ov.ludus=ov();
  /* 3 · recruiting: the card + the filter */
  MGR.tab='recruit';MGR_REDRAW();await W8(300);document.querySelector('#mgrBody tr[data-mg="sel"]').click();await W8(300);
  const g=gById(MGR.sel);const rc=document.querySelector('#mgrBody .mi100rcard');o.rcard=!!rc&&!!rc.querySelector('.mi100');o.rcardTxt=rc?rc.textContent:'';o.rcity=g.city;o.fem=!!g.fem;
  const s=document.querySelector('#mgrBody select[data-rc100]');o.rsel=!!s;o.rows0=q('tr[data-mg="sel"]');o.ov.recruit=ov();
  if(s){const c=s.options[1].value;s.value=c;s.dispatchEvent(new Event('change',{bubbles:true}));await W8(300);
    const ids=[...document.querySelectorAll('#mgrBody tr[data-mg="sel"]')].map(r=>r.dataset.id);o.rows1=ids.length;o.rowsOK=ids.every(id=>{const x=gById(id);return !freeAgents().includes(x)||x.city===c});
    MGR.rc100='';MGR_REDRAW();await W8(250)}
  /* 5 · league house card */
  MGR.tab='league';MGR_REDRAW();await W8(300);const row=document.querySelector('#mgrBody [data-wd100h]');row&&row.click();await W8(300);
  const hc=document.querySelector('#mgrBody .wd100hc');const hm=hc&&mgrById(hc.dataset.lg90box);o.hc=!!hc&&!!hc.querySelector('.mi100hcw .mi100');o.hcCity=!!hm&&!!hc.querySelector('.mi100 svg')&&(hc.querySelector('.mi100 svg').getAttribute('aria-label')||'').includes(hm.city);o.ov.league=ov();
  /* 7 · season tablets: hover shows the week's city */
  MGR.tab='sched';MGR_REDRAW();await W8(300);window.__mi100hover=1;const wk=document.querySelector('#mgrBody .wd100wk');wk.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));await W8(120);
  const tip=document.getElementById('mi100tip');const ct=wk.querySelector('.ct').textContent.trim();o.tip=!!tip&&!tip.hidden&&!!tip.querySelector('.mi100');o.tipCity=!!tip&&tip.textContent.includes(ct);
  document.querySelector('#mgrBody .wd100ban,#mgrBody .roomhd').dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));await W8(60);o.tipGone=!tip||tip.hidden;o.ov.sched=ov();
  /* 6 · programmata: pins are the city buttons */
  MGR.tab='ludus';MGR.pg84={open:true,cities:[],weeks:3,gid:null};MGR.run='promote';if(typeof LU100!=='undefined')LU100.panel='promote';MGR_REDRAW();await W8(300);
  o.pgPins=q('.mi100pg [data-pg84="city"]');o.pgBtns=q('.pg84cities [data-pg84="city"]');const pin=document.querySelector('#mgrBody .mi100pg [data-pg84="city"]');
  if(pin){const v=+pin.getAttribute('data-v');pin.dispatchEvent(new MouseEvent('click',{bubbles:true}));await W8(300);o.pgPick=MGR.pg84.cities.includes(v);o.pgLit=!!document.querySelector('#mgrBody .mi100pg .k-sel[data-v="'+v+'"]')}
  o.ov.prog=ov();MGR.pg84.open=false;
  /* 4 · the Annals Road on the map */
  const R={gid:'x',step:3,name:'Leo',cls:'hero'};const rh=roadVisualHTML(R,[],'');const box=document.createElement('div');box.style.cssText='position:fixed;left:0;top:0;width:'+Math.min(980,innerWidth-32)+'px;z-index:99999;background:#1f1711;padding:8px';box.id='mpRoad';box.innerHTML=rh;document.body.appendChild(box);
  const rs=box.querySelector('.mi100road svg#roadSvg');o.road=!!rs;o.roadStops=rs?rs.querySelectorAll('.mi100p').length:0;o.roadWon=rs?rs.querySelectorAll('.k-won').length:0;o.roadNext=rs?rs.querySelectorAll('.k-next').length:0;
  o.roadList=box.querySelectorAll('.mi100rl li').length;o.roadBox=box.scrollWidth-box.clientWidth;o.ov.road=ov();box.remove();
  o.cache=MI100.html.size;o.errs=errNew92(o.mark);return o})()`;
/* ================= DESKTOP ================= */
let pg=await boot({width:1440,height:900});const D=await pg.evaluate(RUN);
ok(D.strip&&D.stripHost&&(!D.away||D.stripRoute),'1 travel strip inset: host lit, route from home '+JSON.stringify([D.strip,D.stripHost,D.stripRoute,D.away]));
ok(D.letterMap.length===1&&/^L:consil-/.test(D.letterMap[0])&&D.letterCapua&&D.letterDom>=1,'2 world letter inset (counsel, not the gift) '+JSON.stringify([D.letterMap,D.letterCapua,D.letterDom]));
ok(D.rcard&&D.rcardTxt.includes(D.rcity)&&(/beyond the map/.test(D.rcardTxt)||(D.fem?/her home/:/his home/).test(D.rcardTxt)),'3 recruit card shows the home city (his/her) '+JSON.stringify([D.rcardTxt,D.fem]));
ok(D.rsel&&D.rows1<D.rows0&&D.rows1>=1&&D.rowsOK,'3 home-city filter keeps only that city '+JSON.stringify([D.rows0,D.rows1,D.rowsOK]));
ok(D.road&&D.roadStops===12&&D.roadWon===3&&D.roadNext===1&&D.roadList===12,'4 Annals Road on the map: 12 stops, 3 won, next lit '+JSON.stringify([D.road,D.roadStops,D.roadWon,D.roadNext,D.roadList]));
ok(D.hc&&D.hcCity,'5 league house card: home city inset '+JSON.stringify([D.hc,D.hcCity]));
ok(D.pgPins===12&&D.pgBtns===12&&D.pgPick&&D.pgLit,'6 programmata: 12 map pins pick the city, old buttons kept '+JSON.stringify([D.pgPins,D.pgBtns,D.pgPick,D.pgLit]));
ok(D.tip&&D.tipCity&&D.tipGone,'7 calendar hover tip with the week\'s city, hides on leave '+JSON.stringify([D.tip,D.tipCity,D.tipGone]));
ok(D.cache>0&&D.cache<=240,'cache bounded '+D.cache);
ok(!D.errs.length,'no new 00c errors '+JSON.stringify(D.errs).slice(0,300));
if(SHOT)await pg.screenshot({path:SHOT+'/desk.png'});
await pg.context().close();
/* ================= KILL SWITCH ================= */
pg=await boot({width:1440,height:900},{flavius_maps100off:'1'});const K=await pg.evaluate(RUN);
ok(!K.strip&&!K.letterMap.length&&!K.letterDom&&!K.rcard&&!K.rsel&&!K.hc&&!K.pgPins&&!K.tip&&!K.road&&K.pgBtns===12,'kill switch removes every inset '+JSON.stringify([K.strip,K.letterMap,K.rcard,K.rsel,K.hc,K.pgPins,K.tip,K.road,K.pgBtns]));
ok(!K.errs.length,'kill switch: no errors '+JSON.stringify(K.errs).slice(0,200));
await pg.context().close();
/* ================= PHONE 390 ================= */
pg=await boot({width:390,height:844});const P=await pg.evaluate(RUN);
ok(P.strip&&P.rcard&&P.hc&&P.pgPins===12&&P.road,'phone: insets present '+JSON.stringify([P.strip,P.rcard,P.hc,P.pgPins,P.road]));
for(const [k,v] of Object.entries(P.ov))ok(v.doc<=1,'phone 390: no sideways scroll on '+k+' '+JSON.stringify(v));
ok(P.roadBox<=1,'phone: road box fits '+P.roadBox);
ok(!P.errs.length,'phone: no errors '+JSON.stringify(P.errs).slice(0,200));
await b.close();
console.log(JSON.stringify({desk:{...D,ov:undefined},phone:P.ov}));
console.log(miss.length?'MISS '+miss.join('\n MISS '):'ALL OK');console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})();
