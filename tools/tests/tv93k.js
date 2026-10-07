/* v0.93 222-v93token — THE TOKEN MODELLER: an old Studio character (no token) is auto-converted in the background when the
   Studio opens (three.js loaded on demand, one Store write, idempotent on reopen), its list row shows the 3D token; the
   Character designer's token card opens the modeller (presets, 8 facings strip, feet pins), a preset + Save renders a new
   sheet in the minis8 format (meta [cellW,cellH,anchorX,anchorY], webp ≤120 KB, pose ≤600 B); Play Now's seat card shows it;
   a Play Now event draws it on the board (figure path, MINI_CUR facing, draw cost ≈ classic); Classic brings the old token
   back and 3D returns. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const pg=await b.newPage({viewport:{width:1440,height:950}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','1')});
await pg.goto('file://'+process.argv[2],{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const until=async(fn,ms=150000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:250});return true}catch(e){return false}};
/* 1. an old character without a token → auto-converted once while the Studio is open */
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();const c=blankChar();c.id='old93';c.name='Vetus Tokenus';charFromClass(c,'venatore');c.classRef='cls:venatore';
  c.portrait.bs='full';c.portrait.hs='long';c.portrait.fem=false;c.created='2026-01-01';c.status='active';delete c.tok93;await Store.put('customChars',c.id,c);await loadCustoms();
  window.__puts=0;const P=Store.put.bind(Store);Store.put=function(col,i){if(col==='customChars'&&i==='old93')window.__puts++;return P.apply(Store,arguments)};
  window.__lib0=!!window.THREE93;openStudio('chars')});
const conv=await until(()=>{const c=CUSTOM.chars.find(x=>x.id==='old93');return c&&c.tok93&&c.tok93.sheet});
const A=await pg.evaluate(async()=>{await new Promise(r=>setTimeout(r,800));const c=CUSTOM.chars.find(x=>x.id==='old93'),t=c.tok93||{};
  return {lib0:window.__lib0,lib:!!window.THREE93&&!!window.TOK93LIB,puts:window.__puts,meta:t.meta,len:(t.sheet||'').length,webp:/^data:image\/(webp|png)/.test(t.sheet||''),mode:t.mode,pk:t.pk,pose:(t.pose||'').length,h:t.h,hNow:t93Hash(c,t.pose),
    stored:(await Store.list('customChars')).some(x=>x.id==='old93'&&x.tok93&&x.tok93.sheet),row:!!document.querySelector('#studio [data-t93row="old93"] .t93fig')}});
const M=A.meta||[];
ok(conv&&!A.lib0&&A.lib,'auto-convert with three.js loaded on demand '+JSON.stringify({conv,lib0:A.lib0,lib:A.lib}));
ok(A.puts===1&&A.stored&&A.h===A.hNow&&A.mode==='3d'&&A.pk==='stand','saved once, 3D, Stand '+JSON.stringify({puts:A.puts,st:A.stored,mode:A.mode,pk:A.pk}));
ok(M.length===4&&M[0]>=50&&M[0]<=220&&M[1]>=90&&M[1]<=220&&Math.abs(M[2]-M[0]/2)<=2&&M[3]>M[1]*0.6&&M[3]<M[1],'sheet meta sane '+JSON.stringify(M));
ok(A.webp&&A.len>2000&&A.len<=120000&&A.pose>20&&A.pose<=600,'sheet + pose sizes '+JSON.stringify({len:A.len,pose:A.pose}));
ok(A.row,'the Studio list row shows the 3D token');
/* 2. the modeller in the Character designer: a preset, the facings strip, Save */
await pg.evaluate(()=>{ST.draft=JSON.parse(JSON.stringify(CUSTOM.chars.find(x=>x.id==='old93')));ST.view='edit';studioRedraw()});
const B0=await pg.evaluate(()=>({card:!!document.querySelector('#studio [data-t93card] .t93fig'),open:!!document.querySelector('#studio [data-t93="open"]'),on:(document.querySelector('#studio [data-t93mode="3d"]')||{}).className}));
ok(B0.card&&B0.open&&/on/.test(B0.on||''),'token card in the designer '+JSON.stringify(B0));
await pg.evaluate(()=>document.querySelector('#studio [data-t93="open"]').click());
const ready=await until(()=>{const b=document.querySelector('#t93m [data-t93m="save"]');return b&&!b.disabled},90000);
await until(()=>document.querySelectorAll('#t93m #t93strip canvas').length===8,60000);
const C0=await pg.evaluate(()=>({pre:[...document.querySelectorAll('#t93m [data-t93pre]')].map(x=>x.dataset.t93pre).join(','),strip:document.querySelectorAll('#t93m #t93strip canvas').length,
  pins:[...document.querySelectorAll('#t93m [data-t93pin]')].map(x=>x.checked).join(','),stand:T93.api.pose(),cv:(()=>{const c=document.getElementById('t93cv');return c.width>100&&c.height>100})()}));
ok(ready&&C0.pre==='stand,guard,lunge,victory,defend,taunt'&&C0.strip===8&&C0.pins==='true,true'&&C0.cv,'modeller: presets, 8 facings, pinned feet '+JSON.stringify({ready,pre:C0.pre,strip:C0.strip,pins:C0.pins}));
if(SHOT)await pg.screenshot({path:SHOT+'/tv93k_modeller.png'});
await pg.evaluate(()=>document.querySelector('#t93m [data-t93pre="guard"]').click());await pg.waitForTimeout(400);
/* drag the pelvis a little (a pose of his own: the preset mark goes) */
const g=await pg.evaluate(()=>({pose:T93.api.pose(),on:(document.querySelector('#t93m [data-t93pre].on')||{}).dataset}));
ok(g.pose!==C0.stand&&g.on&&g.on.t93pre==='guard','Guard applied');
const old=await pg.evaluate(()=>CUSTOM.chars.find(x=>x.id==='old93').tok93.sheet);
await pg.evaluate(()=>document.querySelector('#t93m [data-t93m="save"]').click());
const saved=await until(()=>!document.getElementById('t93m'),120000);
const D=await pg.evaluate(o=>{const c=CUSTOM.chars.find(x=>x.id==='old93'),t=c.tok93;return {pk:t.pk,pose:t.pose.length,changed:t.sheet!==o,puts:window.__puts,draft:ST.draft&&ST.draft.tok93&&ST.draft.tok93.pk,meta:t.meta,len:t.sheet.length}},old);
ok(saved&&D.pk==='guard'&&D.changed&&D.puts===2&&D.draft==='guard'&&D.pose<=600&&D.len<=120000,'Save renders + stores the new sheet '+JSON.stringify(D));
/* 3. reopening the Studio does not convert again */
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,600));openStudio('chars')});await pg.waitForTimeout(5000);
const E=await pg.evaluate(()=>({puts:window.__puts,need:t93Needs(CUSTOM.chars.find(x=>x.id==='old93')),conv:T93.conv}));
ok(E.puts===2&&!E.need,'idempotent: no second conversion '+JSON.stringify(E));
/* 4. Play Now: the seat card wears it */
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,600));openSetup(true)});
await until(()=>document.querySelector('#mBody .pn-who .seats'),20000);
const F=await pg.evaluate(async()=>{CFG.roster='rolls';CFG.seats[0].cls='cc_old93';CFG.seats[0].saved=null;pnRedraw75();await new Promise(r=>setTimeout(r,300));const s=document.querySelector('#mBody .pn-who .seats>.seat');return {fig:!!(s&&s.querySelector('.t93pn .t93fig'))}});
ok(F.fig,'Play Now seat card shows the 3D token');
if(SHOT)await pg.screenshot({path:SHOT+'/tv93k_playnow.png'});
/* 5. the board draws the sheet (figure path), turning with the piece; draw cost ≈ the classic token */
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,500));menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'cc_old93',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}})});
await until(()=>typeof S!=='undefined'&&S&&S.players&&S.players[0]&&S.players[0].cls==='cc_old93',30000);
await pg.waitForTimeout(3000);
const G=await pg.evaluate(async()=>{for(let i=0;i<12&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300))}
  const p=S.players[0];const t=tokenForP(p);for(let i=0;i<20&&!(t.t93&&t93Img(t.t93));i++)await new Promise(r=>setTimeout(r,100));
  T93.drawn=0;draw();const n=T93.drawn;const f0=miniFace(p,'t93');const r0=p.r,c0=p.c;
  const tm=k=>{const a=performance.now();for(let i=0;i<k;i++)draw();return (performance.now()-a)/k};tm(3);const ms3=tm(20);
  const c=CUSTOM.chars.find(x=>x.id==='old93');c.tok93.mode='classic';T93.drawn=0;tm(3);const msC=tm(20);const nC=T93.drawn;c.tok93.mode='3d';
  const fr=t93Frame(t.t93);return {frame:!!(fr&&fr.width===200&&fr.height===340),n,t93:!!t.t93,json:JSON.stringify(t).indexOf('t93')<0,f0,ms3:+ms3.toFixed(2),msC:+msC.toFixed(2),nC,html:/t93fig/.test(document.getElementById('board').innerHTML)}});
ok(G.t93&&G.json&&G.n>=1&&G.nC===0,'board draws the sheet (non-enumerable tag, classic draws none) '+JSON.stringify(G));
ok(G.ms3<=G.msC*1.5+2,'draw cost with the 3D token ≈ classic '+JSON.stringify({ms3:G.ms3,msC:G.msC}));
ok(G.html,'fighter panel shows the 3D token');ok(G.frame,'figure-frame image for corpses / menu');
if(SHOT)await pg.screenshot({path:SHOT+'/tv93k_board.png'});
/* 6. Classic fallback from the designer card, then back to 3D */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.over=true;if(CUR_MODAL)CUR_MODAL.done(null);await W8(400);openStudio('chars');for(let i=0;i<40&&!document.getElementById('studio');i++)await W8(150);
  ST.draft=JSON.parse(JSON.stringify(CUSTOM.chars.find(x=>x.id==='old93')));ST.view='edit';studioRedraw()});
await pg.evaluate(()=>document.querySelector('#studio [data-t93mode="classic"]').click());await pg.waitForTimeout(600);
const H=await pg.evaluate(async()=>{const c=CUSTOM.chars.find(x=>x.id==='old93');const st=(await Store.list('customChars')).find(x=>x.id==='old93');
  return {mode:c.tok93.mode,stored:st&&st.tok93&&st.tok93.mode,tag:!!(tokenForCls('cc_old93')||{}).t93,fig:/t93fig/.test(figureHTML(tokenForCls('cc_old93'),60)),sheetKept:!!c.tok93.sheet,card:(document.querySelector('#studio [data-t93mode="classic"]')||{}).className}});
ok(H.mode==='classic'&&H.stored==='classic'&&!H.tag&&!H.fig&&H.sheetKept&&/on/.test(H.card||''),'Classic = the old token '+JSON.stringify(H));
await pg.evaluate(()=>document.querySelector('#studio [data-t93mode="3d"]').click());await pg.waitForTimeout(600);
const I=await pg.evaluate(()=>({mode:CUSTOM.chars.find(x=>x.id==='old93').tok93.mode,tag:!!(tokenForCls('cc_old93')||{}).t93}));
ok(I.mode==='3d'&&I.tag,'back to 3D '+JSON.stringify(I));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close()})();
