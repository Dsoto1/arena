/* v0.96 part C (233-v96bar): THE ACTION BAR — phase rail in the phase colours, four material groups + End turn, the original [data-act]
   buttons moved (not re-made), placeholders dimmed in place, no "Wager on yourself"; extras 1-8: board preview on hover (never S),
   header pips + spend dimming, "unused" line, done-phase tips from this turn's log, whose turn + next with a face, key hints + A/P/Enter,
   the guide's soft glow, phones = one swipe row with End turn fixed right; CPU turns greyed; Choice = one gold group. SHOT=<dir> saves pictures. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const SHOT=process.env.SHOT||'';
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const boot=async(vp,mob)=>{const ctx=await b.newContext(mob?{viewport:vp,screen:vp,isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:vp});
  await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
/* start Democritus as seat 0 (soldier) vs 3 CPUs; stop at a phase of our own turn */
const start=(pg,stop)=>pg.evaluate(async(stop)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';
  startEvent({ev:'democritus',loc:6,seats:['soldier','hero','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);
    else if(S&&cur()===S.players[0]&&S.phase===stop&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';render();await W8(200);return !!S&&cur()===S.players[0]&&S.phase===stop},stop);
const pg=await boot({width:1440,height:900});
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
/* ---- Choice phase: one gold group with the two original buttons ---- */
ok(await start(pg,'choice'),'0a reached our Choice');
out.ch=await pg.evaluate(()=>({ch:!!document.querySelector('#actions .grid96.ch96'),coin:!!document.querySelector('#actions .ch96 [data-act="coin"]'),card:!!document.querySelector('#actions .ch96 [data-act="card"]'),
  now:(document.querySelector('#actions .ph96.now')||{}).dataset.ph96}));
ok(out.ch.ch&&out.ch.coin&&out.ch.card,'1a choice group holds coin + card '+JSON.stringify(out.ch));ok(out.ch.now==='choice','1b rail: choice is current');
await pg.click('#actions [data-act="coin"]');await pg.waitForFunction(()=>S.phase==='action'&&!S.busy&&!CUR_MODAL,null,{timeout:15000}).catch(()=>{});
await pg.evaluate(()=>{SPEED='pause';render()});
/* ---- Action: layout + phase colours ---- */
const L=await pg.evaluate(()=>{const A=document.getElementById('actions');const q=s=>A.querySelector(s);const cs=e=>e?getComputedStyle(e):{};
  const segs=[...A.querySelectorAll('.rail96 .ph96')].map(e=>({k:e.dataset.ph96,cls:e.className,bg:cs(e).backgroundColor,sh:cs(e).boxShadow}));
  const gr=[...A.querySelectorAll('.grid96 > [data-g96]')].map(e=>e.dataset.g96);
  const acts=[...A.querySelectorAll('[data-act]')].map(e=>e.dataset.act);
  const hd=k=>{const h=q(`[data-g96="${k}"] .hd96`);return h?cs(h).backgroundImage:''};
  const eb=q('.end96 [data-act="end"]');const ebs=cs(eb);
  const oneLine=[...A.querySelectorAll('.g96 .btn.b96')].every(b=>b.getBoundingClientRect().height<40);
  return {bar:A.classList.contains('bar96'),segs,gr,acts,h:A.offsetHeight,hdA:hd('atk'),hdM:hd('mv'),hdD:hd('dl'),hdK:hd('mk'),
    endBg:ebs.backgroundImage||'',endBorder:ebs.borderTopColor,endKey:eb&&eb.querySelector('.kb96')?eb.querySelector('.kb96').textContent:'',
    unused:(q('.end96 .u96')||{}).textContent||'',focus:!!q('[data-g96="atk"] .fc96 .btn'),atkBtns:A.querySelectorAll('[data-g96="atk"] [data-act^="m-atk"],[data-g96="atk"] [data-act="none"]').length,
    mv:['m-move','m-push','m-topple'].every(k=>!!q(`[data-g96="mv"] [data-act="${k}"],[data-g96="mv"] .ph-${k}`)),
    seal:!!q('[data-g96="dl"] .seal96'),mk:!!q('[data-g96="mk"] [data-act="market"]')&&!!q('[data-g96="mk"] [data-act="crowd"]'),selfbet:!!q('[data-act="selfbet"]'),
    tips:[...A.querySelectorAll('.g96 [data-act]')].filter(b=>b.dataset.tip).length,oneLine,old:!!q('.phasebar'),
    who:(q('.rail96 .who96')||{}).textContent||'',face:!!q('.rail96 .who96 .f96'),name:cur().name,dis:[...A.querySelectorAll('.g96 .ph96b')].every(b=>b.disabled&&!b.dataset.act)}});
out.L=L;
ok(L.bar&&!L.old,'2a the new bar replaced the phase strip');ok(L.segs.length===4&&L.segs.map(s=>s.k).join()==='resolve,choice,action,end','2b four phase segments');
ok(/done/.test(L.segs[0].cls)&&/done/.test(L.segs[1].cls)&&/now/.test(L.segs[2].cls)&&!/done|now/.test(L.segs[3].cls),'2c done ✓, current, ahead');
ok(L.segs[2].bg==='rgb(255, 179, 163)','2d current Action filled in the action colour '+L.segs[2].bg);
ok(/79, 154, 148/.test(L.segs[0].sh)&&/201, 164, 74/.test(L.segs[1].sh)&&/125, 130, 144/.test(L.segs[3].sh),'2e underline per segment in the phase colours');
ok(L.gr.join()==='atk,mv,dl,mk,end','2f groups Attack · Move · Deal · Market·Crowd · End '+L.gr.join());
ok(/gradient/.test(L.hdA)&&/gradient/.test(L.hdM)&&/gradient/.test(L.hdD)&&/gradient/.test(L.hdK),'2g material header strips');
ok(L.atkBtns>=1&&L.focus,'2h attack buttons + Focus below');ok(L.mv,'2i Move/Push/Topple in place');ok(L.seal,'2j Trade · Truce with the wax seal');ok(L.mk,'2k Market + Crowd Favor');
ok(!L.selfbet,'2l no Wager on yourself in the bar');ok(['m-move','end','market','crowd'].every(k=>L.acts.includes(k)),'2m original data-act buttons kept');
ok(/gradient/.test(L.endBg)&&L.endBorder==='rgb(216, 180, 90)'&&L.endKey==='Enter','2n End turn red, gold edge, Enter');
ok(L.h<=210,'2o same height as the old dock ('+L.h+')');ok(L.oneLine,'2p one-line buttons');ok(L.tips>=3,'2q reasons on hover (data-tip)');ok(L.dis,'2r placeholders dimmed, no data-act');
/* extra 3 + 5 */
ok(/unused/.test(L.unused),'3 unused line under End turn: '+L.unused);
ok(L.who.includes(L.name)&&/next:/.test(L.who)&&L.face,'5 whose turn + next + face: '+L.who);
/* extra 4: done phase tip from this turn's log */
out.tip=await pg.evaluate(()=>{const c=document.querySelector('#actions .ph96[data-ph96="choice"]');const r=document.querySelector('#actions .ph96[data-ph96="resolve"]');return {c:c&&c.dataset.tip||'',r:r&&r.dataset.tip||''}});
ok(out.tip.c.length>3&&out.tip.r.length>3,'4 done phases carry what happened '+JSON.stringify(out.tip));
/* extra 1 + 2: preview on hover (cosmetic) + pips */
const pv=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=cur();const foe=S.npcs.find(n=>n.alive&&n.t!=='zora')||S.players[1];
  /* a beast next to us so the weapon preview has a target (round 1 may be PvE only) */
  const fr=p.r>0?p.r-1:p.r+1;for(const q of [...S.players,...S.npcs])if(q!==foe&&q.r===fr&&q.c===p.c)q.r=-9;S.pillars=S.pillars.filter(q=>!(q.r===fr&&q.c===p.c));foe.r=fr;foe.c=p.c;p.mv=4;S.mode='move';render();await W8(50);
  const snap=()=>JSON.stringify({m:S.mode,pl:S.players.map(q=>[q.r,q.c,q.mv,q.attacks]),hl:[...HL.keys()].length});const before=snap();
  const ev=(el,t)=>el.dispatchEvent(new MouseEvent(t,{bubbles:true,relatedTarget:document.body}));
  const o={};const atk=document.querySelector('#actions [data-act^="m-atk"]:not([disabled])');o.atk=!!atk;
  if(atk){ev(atk,'mouseover');o.atkPv=BAR96.pv?BAR96.pv.tiles.length:0;o.atkHas=!!(BAR96.pv&&BAR96.pv.tiles.some(([r,c])=>r===foe.r&&c===foe.c));ev(atk,'mouseout');o.atkOff=!BAR96.pv}
  const pips=document.querySelectorAll('#actions .mv96 .pip96.on').length;o.pips=pips===p.mv;o.swords=document.querySelectorAll('#actions [data-g96="atk"] .sw96').length;
  const push=document.querySelector('#actions [data-act="m-push"]');
  if(push){ev(push,'mouseover');o.spend=document.querySelectorAll('#actions .mv96 .pip96.spend96').length;o.pushPv=push.disabled||!!BAR96.pv;ev(push,'mouseout');o.spendOff=document.querySelectorAll('#actions .mv96 .spend96').length===0}
  /* the overlay paints in the highlights layer */
  if(atk){ev(atk,'mouseover');let n=0;const st=CanvasRenderingContext2D.prototype.setLineDash;CanvasRenderingContext2D.prototype.setLineDash=function(a){if(a&&a[0]===5&&a[1]===4)n++;return st.apply(this,arguments)};draw();CanvasRenderingContext2D.prototype.setLineDash=st;o.paint=n;ev(atk,'mouseout')}
  o.same=snap()===before;
  const mk=document.querySelector('#actions [data-act="market"]');o.mkTip=mk?mk.dataset.tip||'':'';return o});
out.pv=pv;
ok(pv.atk&&pv.atkPv>0&&pv.atkHas&&pv.atkOff,'1a weapon hover previews its targets, cleared on leave '+JSON.stringify(pv));ok(pv.paint>0,'1b preview painted on the board');
ok(pv.same,'1c preview never touches S');ok(/level|Opens/.test(pv.mkTip),'1d market tip names affordable levels: '+pv.mkTip);
ok(pv.pips,'2s orange movement pips = movement left');ok(pv.swords===2,'2t two sword pips');ok(pv.spend===2&&pv.spendOff,'2u hovering Push dims 2 pips');
/* extra 6: key hints + keys */
const k=await pg.evaluate(()=>({a:[...document.querySelectorAll('#actions [data-act^="m-atk"] .kb96')].map(e=>e.textContent),p:(document.querySelector('#actions [data-act="m-push"] .kb96')||{}).textContent}));
ok(k.a[0]==='A'&&k.p==='P','6a key hints A / P / Enter '+JSON.stringify(k));
await pg.evaluate(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();S.mode='move';render()});
await pg.keyboard.press('a');out.keyA=await pg.evaluate(()=>S.mode);ok(/^atk/.test(out.keyA),'6b A picks an attack ('+out.keyA+')');
await pg.keyboard.press('Escape');await pg.evaluate(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();S.mode='move';render()});
/* extra 7: the guide's glow is soft (and still the guide's own class) */
out.glow=await pg.evaluate(()=>{const b=document.querySelector('#actions [data-act="m-move"]');b.classList.add('sugglow');const a=getComputedStyle(b).animationName;b.classList.remove('sugglow');return a});
ok(out.glow==='sug96','7 soft glow on the suggested action ('+out.glow+')');
if(SHOT){const d=await pg.$('#actions');await d.screenshot({path:path.join(SHOT,'tv96a_bar.png')})}
/* Enter ends the turn (nothing focused) */
const t0=await pg.evaluate(()=>({n:S.turnNo,c:S.cur}));await pg.evaluate(()=>{SPEED='fast';document.activeElement&&document.activeElement.blur&&document.activeElement.blur()});
await pg.keyboard.press('Enter');await pg.waitForFunction(t0=>S.turnNo!==t0.n||S.cur!==t0.c,t0,{timeout:8000}).catch(()=>{});
out.enter=await pg.evaluate(t0=>S.turnNo!==t0.n||S.cur!==t0.c,t0);ok(out.enter,'6c Enter ends the turn');
/* CPU turn: the same bar, greyed, no live buttons */
await pg.waitForFunction(()=>S&&cur()&&cur().cpu,null,{timeout:8000}).catch(()=>{});
out.cpu=await pg.evaluate(()=>{SPEED='pause';render();const A=document.getElementById('actions');return {cpu:cur().cpu,idle:!!A.querySelector('.grid96.idle96'),live:A.querySelectorAll('.grid96 [data-act]').length,
  groups:A.querySelectorAll('.grid96 [data-g96]').length,who:(A.querySelector('.who96 b')||{}).textContent,name:cur().name}});
ok(out.cpu.cpu&&out.cpu.idle&&out.cpu.live===0&&out.cpu.groups===5,'8a CPU turn: bar greyed, same groups '+JSON.stringify(out.cpu));ok(out.cpu.who===out.cpu.name,'8b the rail names the CPU');
const errN=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m).length:0,mark).catch(()=>0);ok(!errN,'no new error-log entries ('+errN+')');
/* ---- phones: one swipe row, End turn fixed right ---- */
for(const [nm,vp] of [['land',{width:844,height:390}],['port',{width:390,height:844}]]){const P=await boot(vp,true);
  ok(await start(P,'action'),nm+' 0 reached our Action');
  const r=await P.evaluate(()=>{const W=document.body;W.classList.add('pl-act','pp-act');const g=document.querySelector('#actions .grid96');const e=document.querySelector('#actions .end96');
    if(!g||!e)return {none:1,cls:W.className};const gs=getComputedStyle(g),es=getComputedStyle(e);const eb=e.getBoundingClientRect(),gb=g.getBoundingClientRect();
    const btn=[...g.querySelectorAll('.g96 .btn.b96')].map(b=>b.getBoundingClientRect().height);
    return {cls:W.className.split(' ').filter(c=>/phone/.test(c)).join(' '),disp:gs.display,ox:gs.overflowX,wrap:gs.flexWrap,pos:es.position,right:Math.round(gb.right-eb.right),scroll:g.scrollWidth>g.clientWidth,
      page:document.documentElement.scrollWidth-innerWidth,minBtn:Math.round(Math.min(...btn))}});
  out[nm]=r;
  ok(r.disp==='flex'&&/auto|scroll/.test(r.ox)&&r.wrap==='nowrap','9 '+nm+': groups in one swipe row '+JSON.stringify(r));ok(r.pos==='sticky'&&Math.abs(r.right)<=2,'9 '+nm+': End turn fixed on the right');
  ok(r.page<=1,'9 '+nm+': no sideways page scroll');ok(r.minBtn>=36,'9 '+nm+': touch-size buttons');
  if(SHOT)await P.screenshot({path:path.join(SHOT,`tv96a_${nm}.png`)});await P.context().close()}
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',errs.slice(0,6));await b.close();if(miss.length||errs.length)process.exit(1)})();
