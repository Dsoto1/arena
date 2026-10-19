/* tv107a — v1.07 OLD TOKEN PIECES RETIRED (400-v107tok, his t1a…t5a): 1 Settings → Board & pieces has no token-style choice (the old
   'tokens' tab keeps its Armor rows), an old per-browser tokenStyle / mini3d is ignored; 2 the board draws the 3D figures (sheets) and,
   with the anim100 / beast100 sheets blocked, the ONE STILL FRAME of them (still107 sheets) — never the old figure / mini; 3 pictures off
   the board are stills facing the viewer (figureHTML, clsPieceHTML, npcPieceHTML, MINI_URL, st107Mini, Play Now seats); 4 the Magnus
   Edition minis (minis8_*) are requested only by Credits → Prototype; 5 the kill switch flavius_v107tokoff=1 = the old styles; no errors. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const mk=async(o={})=>{const pg=await b.newPage({viewport:{width:o.w||1440,height:o.h||900}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  if(o.block)await pg.route(/anim100_|beast100_/,r=>r.abort());const reqs=[];pg.on('request',r=>reqs.push(r.url()));pg.reqs=reqs;pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');
    localStorage.setItem('flavius_settings',JSON.stringify({tokenStyle:'standee',mini3d:true}));if(o.off)localStorage.setItem('flavius_v107tokoff','1')},{off:!!o.off});
  await pg.goto('file://'+page,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});return pg};
const pg=await mk();const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
/* ---- 1 settings ---- */
const s1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}const o={};
  o.style=tokenStyle();o.mini=!!SETTINGS.mini3d;SETTINGS.tokenStyle='standee';SETTINGS.mini3d=true;applySettings();o.style2=tokenStyle();o.mini2=!!SETTINGS.mini3d;
  o.saved=JSON.parse(localStorage.getItem('flavius_settings')||'{}').tokenStyle;
  const t=settingsHTML('tokens');o.tokRows=(t.match(/data-tokstyle=/g)||[]).length;o.armor=(t.match(/data-sarmor=/g)||[]).length;
  openSettings();await W8(600);document.querySelector('#setBody [data-stab="pieces"]').click();await W8(400);
  o.pieces=!!document.querySelector('#setBody [data-pots90]');o.tokBtn=document.querySelectorAll('#setBody [data-tokstyle],#setBody .s98-tok').length;
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}return o});
ok(s1.style==='figure'&&!s1.mini&&s1.style2==='figure'&&!s1.mini2&&s1.saved==='figure','1a an old tokenStyle / mini3d is ignored '+JSON.stringify(s1));
ok(s1.tokRows===0,'1b the tokens tab: no style rows (its Armor rows left in v0.84, 142) '+JSON.stringify(s1));
ok(s1.pieces&&s1.tokBtn===0,'1c Board & pieces: no Gladiators & beasts choice '+JSON.stringify(s1));
/* ---- 3 off the board ---- */
const s3=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  o.fig=figureHTML(tokenForCls('hero'),60);o.figSev=figureHTML({...tokenForCls('soldier'),sev:{rarm:1}},40);o.cls=clsPieceHTML('royalty',40);o.npc=npcPieceHTML({t:'lion',key:'Leo'},40);
  o.beastFig=figureHTML(tokenForNPC({t:'snake'}),50);o.custom=figureHTML({kind:'human',body:'tunic',c1:'#123456'},50);o.url=MINI_URL.hero;o.mini=st107Mini('ursa');
  try{menuHide()}catch(e){}openSetup();await W8(1500);const seats=[...document.querySelectorAll('#mBody .seat')];
  o.seats=Math.min(seats.length,CFG.n);o.seatSt=seats.filter(s=>s.querySelector('.st107 img,.pn-fig img[src*="still107f_"]')).length;
  o.oldPics=[...document.querySelectorAll('#mBody img')].map(i=>i.getAttribute('src')||'').filter(s=>/mini_|minis8_|standee/.test(s)).length;
  const ims=[...document.querySelectorAll('#mBody img[src*="still107f_"]')];for(let i=0;i<30&&!ims.every(x=>x.complete);i++)await W8(100);o.loaded=ims.length&&ims.every(x=>x.complete&&x.naturalWidth>0);
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}return o});
ok(/still107f_hero\.webp/.test(s3.fig)&&/still107f_soldier/.test(s3.figSev)&&/still107f_royalty/.test(s3.cls)&&/still107f_leo/.test(s3.npc)&&/still107f_glykon/.test(s3.beastFig),'3a figureHTML / clsPieceHTML / npcPieceHTML = the still '+JSON.stringify(s3).slice(0,400));
ok(/<svg/.test(s3.custom)&&!/still107/.test(s3.custom),'3b a custom figure keeps its own picture');
ok(/still107f_hero/.test(s3.url)&&s3.mini==='still107f_ursa.webp','3c MINI_URL / st107Mini name the fronts '+JSON.stringify([s3.url,s3.mini]));
ok(s3.seats>=4&&s3.seatSt>=s3.seats&&!s3.oldPics&&s3.loaded,'3d Play Now seats show the stills, no old minis '+JSON.stringify({seats:s3.seats,st:s3.seatSt,old:s3.oldPics,loaded:s3.loaded}));
/* ---- 4 minis8 only in Credits ---- */
const n8a=pg.reqs.filter(u=>/minis8_/.test(u)).length;
await pg.evaluate(async()=>{creditsOpen('proto');const r=document.querySelector('#protoBox .mini8row');if(r)r.scrollIntoView();await new Promise(r=>setTimeout(r,1500))});
const s4=await pg.evaluate(()=>({cells:document.querySelectorAll('#protoBox .mini8c[data-mini8]').length,h4:(document.querySelector('#protoBox .mini8row h4')||{}).textContent||''}));
await pg.waitForTimeout(800);const n8b=pg.reqs.filter(u=>/minis8_/.test(u)).length;
ok(n8a===0,'4a no minis8 request before Credits '+n8a);
ok(s4.cells>=8&&n8b>=8,'4b Credits → Prototype shows the tabletop minis '+JSON.stringify({...s4,n8b}));
await pg.evaluate(()=>{const b=document.getElementById('protoBox');if(b)b.hidden=true});
await pg.close();
/* ---- 2 the board: sheets, then sheets blocked ---- */
const play=async p=>p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<120&&!(humanTurn()&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  SPEED='normal';const P=S.players[0];S.npcs.push(mkNPC('lion','Leo',P.r,Math.min(N-1,P.c+2)));
  for(let i=0;i<30;i++){draw();await W8(150)}
  const a0=AN100.stats.draws,p0=ST107.stats.p,b0=ST107.stats.b,c0=BST100.stats.cells;draw();
  return {an:AN100.stats.draws-a0,stP:ST107.stats.p-p0,stB:ST107.stats.b-b0,bst:BST100.stats.cells-c0,alive:S.players.filter(p=>p.alive).length,beasts:S.npcs.filter(n=>n.alive&&st107BeastKey(n)).length}});
const p2=await mk();const s2a=await play(p2);await p2.close();
ok(s2a.an>=s2a.alive&&s2a.stP===0&&s2a.bst>=1,'2a with the sheets: the 3D figures, no still '+JSON.stringify(s2a));
const p3=await mk({block:true});const s2b=await play(p3);
const s2c=await p3.evaluate(()=>{const i=ST107.img.soldier;return {sheet:!!(i&&i._ok&&i.naturalWidth===ANIM100_META.soldier.move.rows.idle[0][1]*8)}});
const stReq=p3.reqs.filter(u=>/still107_/.test(u)).length;await p3.close();
ok(s2b.an===0&&s2b.stP>=s2b.alive&&s2b.stB>=s2b.beasts&&s2b.beasts>=1&&s2c.sheet&&stReq>=2,'2b sheets blocked: every gladiator and beast drawn as the still '+JSON.stringify({...s2b,...s2c,stReq}));
/* ---- 5 kill switch ---- */
const p4=await mk({off:true});const s5=await p4.evaluate(()=>({style:tokenStyle(),rows:(settingsHTML('tokens').match(/data-tokstyle=/g)||[]).length,fig:/still107/.test(figureHTML(tokenForCls('hero'),60)),url:MINI_URL.hero}));await p4.close();
ok(s5.style==='standee'&&s5.rows>=1&&!s5.fig&&/mini_hero/.test(s5.url),'5 kill switch = the old token styles '+JSON.stringify(s5));
ok(!errs.length,'no page errors '+JSON.stringify(errs.slice(0,3)));
console.log(miss.length?'FAIL\n'+miss.join('\n'):'ALL OK');console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(miss.length?1:0)})();
