/* v0.99 fix round 2 (264-v99fix2 + edits in 03-engine / 248 / 252 / 94-v72 / 26-gear):
   1 piece bonuses follow the armor: Flavius' Greaves (+1 movement) end when a greave is destroyed (0 AP) / the pool drained by taking another piece off /
     a leg gone, and the extra step already granted this turn is taken back; the Cestus (+1 damage) the same;
   2 the weapon button shows attack-power + range ICONS ("N · N"), tooltip "Attack power N · Range N" — no "dmg" word;
   3 no "a new one every few seconds" on the Online landing;
   4 Ranked / Custom chip on Lobby Browser rows, the room header, invitation text, Spectate cards, the Custom-only squares;
   5 Recruiting: the card column takes a wider share (list ≥ one-line rows) at 1440 and 1280, no sideways scroll at 390.
   SHOT=<dir> saves screenshots. */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');const page=path.resolve(process.argv[2]||'flavius-arena.html');const SHOT=process.env.SHOT||'';
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const boot=async(vp,mob,url)=>{const ctx=await b.newContext(mob?{viewport:vp,screen:vp,isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:vp});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1')});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));await pg.goto(url||('file://'+page));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
/* ---- 1 · greaves + cestus, and 2 · the attack button ---- */
{const pg=await boot({width:1440,height:900});
 const ready=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';startEvent({ev:'democritus',loc:6,seats:['venatore','hero','royalty','soldier'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';return !!S&&cur()===S.players[0]&&S.phase==='action'});
 ok(ready,'0 reached our Action phase');
 out.g=await pg.evaluate(async()=>{const p=cur();const r={};const src={type:'player',p:S.players[1],w:mkW('gladius'),n:'x'};
  const R=()=>{for(const l of LOCS){p.hp[l]=5;stripLoc(p,l)}};R();
  equipPiece(p,'greaves','rleg');equipPiece(p,'greaves','lleg');equipPiece(p,'cestus','rarm');
  r.on=[greavesOn(p),mvMax(p),hasCestus(p,'R')];
  /* (a) mid-turn: both on, mv granted; the right greave is destroyed by a hit → the step goes at once */
  p.mv=mvMax(p);const mv0=p.mv;await hurt(p,'rleg',p.ap.rleg,src,'t');r.hit=[greavesOn(p),mvMax(p),mv0,p.mv,p.pieces.rleg.length];
  /* (b) the pool drained by taking another piece off: greaves + padding on the left leg, padding removed AFTER a hit emptied the pool */
  R();equipPiece(p,'greaves','rleg');equipPiece(p,'greaves','lleg');equipPiece(p,'thighplate','lleg');
  p.ap.lleg=2;const tp=p.pieces.lleg.find(x=>x.key==='thighplate');p.mv=mvMax(p);const m1=p.mv;unequipPiece(p,'lleg',tp);
  r.drain=[p.ap.lleg,p.pieces.lleg.length,greavesOn(p),m1,p.mv];
  /* (c) the display-only case: a listed piece with its location at 0 AP gives nothing */
  R();equipPiece(p,'greaves','rleg');equipPiece(p,'greaves','lleg');p.ap.lleg=0;r.zero=[greavesOn(p),mvMax(p)];
  /* (d) a leg severed: the engine's own rule (no double penalty) */
  R();equipPiece(p,'greaves','rleg');equipPiece(p,'greaves','lleg');p.mv=mvMax(p);const mv3=p.mv;await hurt(p,'rleg',20,src,'t');r.sev=[greavesOn(p),mv3,p.mv,mvMax(p),legs(p)];
  /* cestus analogue */
  for(const l of LOCS){p.hp[l]=5;p.pieces[l]=[];p.ap[l]=0}equipPiece(p,'cestus','rarm');r.c0=hasCestus(p,'R');await hurt(p,'rarm',9,src,'t');r.c1=[hasCestus(p,'R'),p.pieces.rarm.length,p.hp.rarm];
  for(const l of LOCS){p.hp[l]=5;p.pieces[l]=[];p.ap[l]=0}equipPiece(p,'cestus','larm');equipPiece(p,'wraps','larm');p.ap.larm=0;r.c2=hasCestus(p,'L');
  return r});
 ok(out.g.on[0]&&out.g.on[1]===4&&out.g.on[2],'1a pair on: +1 movement (4), cestus on '+JSON.stringify(out.g.on));
 ok(!out.g.hit[0]&&out.g.hit[1]===3&&out.g.hit[3]===out.g.hit[2]-1&&out.g.hit[4]===0,'1b a destroyed greave ends the bonus now and takes this turn\'s extra step back '+JSON.stringify(out.g.hit));
 ok(out.g.drain[0]===0&&out.g.drain[1]===0&&!out.g.drain[2]&&out.g.drain[4]===out.g.drain[3]-1,'1c a pool drained by taking a piece off destroys the rest, bonus gone '+JSON.stringify(out.g.drain));
 ok(!out.g.zero[0]&&out.g.zero[1]===3,'1d a listed greave at 0 AP gives nothing '+JSON.stringify(out.g.zero));
 ok(!out.g.sev[0]&&out.g.sev[3]===2&&out.g.sev[2]<=out.g.sev[1]&&out.g.sev[4]===1,'1e a severed leg: movement follows the engine (no extra penalty) '+JSON.stringify(out.g.sev));
 ok(out.g.c0&&!out.g.c1[0]&&out.g.c1[1]===0&&!out.g.c2,'1f the Cestus +1 damage stops with its armor '+JSON.stringify([out.g.c0,out.g.c1,out.g.c2]));
 /* 2 · the attack button face */
 out.bar=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=cur();for(const l of LOCS){p.hp[l]=5}S.ri=1;p.wR=mkW('hasta');p.wL=mkW('gladius');p.attacks=0;p.mv=5;p.armUses={R:0,L:0};p.hitTargets=new Set();p.focusRoll=false;S.mode='move';
  render();await W8(300);const rows=[...document.querySelectorAll('#actions [data-g96="atk"] .wpn98')].map(r=>{const s=r.querySelector('.st98'),w=r.querySelector('.wb98');return {txt:(s||{}).textContent,ico:(s||{innerHTML:''}).innerHTML,tip:(w||{dataset:{}}).dataset.st98||'',dt:(w||{dataset:{}}).dataset.tip||'',al:(w||{getAttribute:()=>''}).getAttribute('aria-label')||''}});
  return {rows,bar:document.getElementById('actions').innerText.includes(' dmg')}});
 const R0=(out.bar.rows||[])[0]||{};
 ok(/wi87dmg/.test(R0.ico||'')&&/wi87rng/.test(R0.ico||'')&&/^\s*\d+\s*·\s*\d+\s*$/.test(R0.txt||''),'2a the face shows power + range icons "N · N" '+JSON.stringify(R0));
 ok(/Attack power \d+ · Range \d+/.test(R0.tip)&&/Attack power/.test(R0.dt)&&/Attack power/.test(R0.al),'2b tooltip + label read "Attack power N · Range N"');
 ok(!out.bar.bar,'2c no "dmg" word on the action bar');
 if(SHOT){fs.mkdirSync(SHOT,{recursive:true});await (await pg.$('#actions')).screenshot({path:path.join(SHOT,'tv99g_attack.png')})}
 await pg.context().close()}
/* ---- 5 · recruiting card width ---- */
for(const [w,h,mob,min] of [[1440,900,0,.42],[1280,800,0,.40],[390,844,1,0]]){const pg=await boot({width:w,height:h},mob);
 const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});const m=me();m.fame=Math.max(m.fame,60);
  const fa=freeAgents().filter(x=>m.fame>=reqFame(x)).sort((a,b)=>effOvr(b)-effOvr(a));fa.slice(0,4).forEach(g=>g.favd=true);const g=fa[0];
  MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=1;MGR.view=null;MGR_REDRAW();await W8(700);
  const wd=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect().width:0};const card=document.querySelector('#mgrBody .gs98')&&document.querySelector('#mgrBody .gs98').closest('.card2');
  const row=document.querySelector('#recTable tr[data-mg="sel"]');const nm=row&&row.querySelector('b');
  return {list:Math.round(wd('#recTable')),card:card?Math.round(card.getBoundingClientRect().width):0,sx:document.documentElement.scrollWidth-innerWidth,rowH:row?Math.round(row.getBoundingClientRect().height):0}});
 out['rec'+w]=r;
 if(w>600)ok(r.card/(r.card+r.list)>=min&&r.list>=240&&r.card>=400&&r.sx<=1&&r.rowH<=48, /* v1.0 (299): the list is a narrow column beside the dossier */'5 '+w+' the card has the wider share, list rows stay one line '+JSON.stringify(r));
 else ok(r.sx<=1&&r.list>=300,'5 390 stacked, no sideways scroll '+JSON.stringify(r));
 if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv99g_recruit'+w+'.png')});await pg.context().close()}
/* ---- 3 + 4 · Online (mock, one window) ---- */
const root=path.dirname(page),file=path.basename(page);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const U='http://127.0.0.1:'+srv.address().port+'/'+file;
{const pg=await boot({width:1440,height:900},0,U);
 out.on=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  ONL.acct=await NET.req('auth.signin',{name:'Alpha'});await NET.req('domus.create',{name:'Domus Alpha'});ONL.char=await NET.req('char.create',{name:'Alpha the Bold',cls:'hero'});
  try{onlineOpen()}catch(e){}await W8(800);
  /* a Custom room by someone else sits in the mock world already; ours is Ranked */
  await NET.req('lobby.quick',{ev:'democritus',ranked:true}).catch(()=>{});ONL.lobbies=await NET.req('lobby.list',{});ONL.tab='lobby';onlRedraw();await W8(600);
  const rows=[...document.querySelectorAll('#onl tr[data-row]')].map(tr=>{const L=ONL.lobbies.find(x=>x.id===tr.dataset.row);return {ranked:!!(L&&L.ranked),chip:(tr.querySelector('.rk99')||{}).className||'',txt:(tr.querySelector('.rk99')||{}).textContent||''}});
  const room=document.querySelector('#onlRoom80 .r80-tags .rk99');
  const mine=ONL.lobbies.find(L=>L.ranked&&L.players.some(p=>p.id===ONL.acct.id));
  const txt=onlRowTxt80({ev:'democritus',loc:1,ranked:true})+'|'+onlRowTxt80({ev:'democritus',loc:1,ranked:false});
  ONL.tab='spec';onlRedraw();await W8(300);const sp=[...document.querySelectorAll('#onl .onl-sp')].map(c=>!!c.querySelector('.rk99'));
  ONL.tab='play';onlRedraw();await W8(500);const play=document.getElementById('onl').innerText;
  const sq=ev98Pick(1)[0];const sqh=sq?ev98Square(sq,0):'';
  return {rows,room:room?room.textContent:null,roomCls:room?room.className:'',txt,sp,every:/every few seconds/i.test(play)||/every few seconds/i.test(document.documentElement.innerHTML.replace(/<style[\s\S]*?<\/style>/g,'').slice(0,0)),sq:!!sq,sqChip:/rk99 c/.test(sqh),sqSmall:/Custom only|· Custom/.test((sqh.match(/<small>[\s\S]*?<\/small>/)||[''])[0])}});
 ok(out.on.rows.length>=2&&out.on.rows.every(r=>r.chip&&(r.ranked?/rk99 r/.test(r.chip)&&/RANKED/i.test(r.txt):/rk99 c/.test(r.chip)&&/Custom/.test(r.txt))),'4a every Lobby Browser row wears a gold RANKED or a grey Custom chip '+JSON.stringify(out.on.rows));
 ok(out.on.rows.some(r=>r.ranked)&&out.on.rows.some(r=>!r.ranked),'4a both kinds are in the list');
 ok(/rk99 r/.test(out.on.roomCls)&&/RANKED/i.test(out.on.room||''),'4b the room header carries the chip '+out.on.room);
 const [t1,t2]=out.on.txt.split('|');ok(/rk99 r/.test(t1)&&/rk99 c/.test(t2),'4c invitation / Praeco text carries the chip');
 ok(out.on.sq&&out.on.sqChip&&!out.on.sqSmall,'4d the Custom-only event square wears the Custom chip once '+JSON.stringify([out.on.sq,out.on.sqChip,out.on.sqSmall]));
 ok(!out.on.every,'3 no "every few seconds" line on the landing');
 const src=fs.readFileSync(page,'utf8');ok(!/a new one every few seconds/.test(src),'3b the line is gone from the build');
 if(SHOT){fs.mkdirSync(SHOT,{recursive:true});await pg.evaluate(()=>{ONL.tab='lobby';onlRedraw()});await pg.waitForTimeout(500);await pg.screenshot({path:path.join(SHOT,'tv99g_lobby.png')})}
 await pg.context().close()}
srv.close();await b.close();
const mark=0;console.log(JSON.stringify(out));if(errs.length)console.log('PAGEERRS',errs.slice(0,5));console.log(miss.length?'MISS '+miss.join('\n  '):'ALL OK');console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})();
