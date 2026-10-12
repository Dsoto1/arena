/* tv100sd — v1.0 THE SOUND PASS (314-v100sound): each new sound fires ONCE on its event (step, growl, bark, net + netwrap, scrape,
   crash, heal, rise, titulus, gem/dud, medal, replay click, spear, chest, market buy), one blow = one sound (−AP + −HP folded), the
   fanfare family plays once, To the end / sims / HEADLESS are silent, Fast plays only your own, mute and the Effects slider silence them
   (and the slider now reaches the reverb send), the seeded dice + log are the same ON vs OFF (kill switch), no console errors. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const open=async off=>{const cx=await b.newContext({viewport:{width:1440,height:900}});const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR/.test(m.text()))errs.push('console: '+m.text())});
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(off=>{if(sessionStorage.getItem('tv100sd'))return;sessionStorage.setItem('tv100sd','1');Object.defineProperty(navigator,'webdriver',{get:()=>false});
    localStorage.setItem('flavius_firstrun','shown');if(off)localStorage.setItem('flavius_sound100off','1');else localStorage.removeItem('flavius_sound100off')},off);
  await pg.goto('file://'+page,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
  await pg.keyboard.press('Shift');await pg.waitForFunction(()=>AUD.ctx&&AUD.ctx.state==='running',null,{timeout:20000}).catch(()=>{});return {pg,cx}};
const start=(pg,allCpu,seed,spect)=>pg.evaluate(async([allCpu,seed,spect])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}SPEED='pause';
  const cfg={ev:'democritus',loc:6,seats:['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:allCpu||i!==0})),opts:spect?{spect}:{}};if(seed!=null)cfg.seed=seed;startEvent(cfg);
  for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}return !!S},[allCpu,seed,spect||0]);

/* ---------------- ON: every sound once ---------------- */
const A=await open(false);
ok(await A.pg.evaluate(()=>AUD.ctx&&AUD.ctx.state==='running'&&!!AUD.duck&&!!AUD.vS&&AUD.verb===AUD.vM),'audio running, sends + duck in the graph');
ok(await start(A.pg,false,4242,24),'event started');
ok(await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='fast';for(let i=0;i<400;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);
  const p=cur();if(p&&!p.cpu&&['choice','action'].includes(S.phase)&&!CUR_MODAL&&i>3)break;await W8(100)}SPEED='normal';await W8(300);return !cur().cpu}),'your turn (nothing else moves while the checks run)');
const R=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=SND100.log;const cnt=(k,from)=>L.slice(from).filter(x=>x.k===k).length;const out={};
  const clear=()=>{L.length=0;SND100.lastFam=0;SND100.lastImp=0};SPEED='normal';const P=S.players;S.turnNo=Math.max(1,S.turnNo);
  /* step: one tile = one step, a redraw without a move = nothing, a jump = nothing */
  clear();const p=cur();draw();const c0=p.c;p.c=c0+(p.c<6?1:-1);draw();draw();await W8(40);out.step1=cnt('step');p.c=c0;draw();await W8(40);out.step2=cnt('step');p.c=c0+(c0<6?4:-4);draw();await W8(40);out.step3=cnt('step');p.c=c0;draw();
  /* a blow: −AP and −HP in one hurt = ONE sound */
  clear();const q=P[1];q.ap.chest=1;q.hp.chest=7;await hurt(q,'chest',3,{type:'player',p:P[0],w:P[0].wR},'x');await W8(120);
  out.blow=L.filter(x=>['hit','bighit','block','whoosh','death'].includes(x.k)).map(x=>x.k);
  /* a beast's blow: one bark, its kind */
  clear();const n=spawnNPC('lion');await W8(80);out.growl=cnt('growl');out.growlT=(L.find(x=>x.k==='growl')||{}).o;
  if(n){q.hp.larm=7;q.ap.larm=0;await hurt(q,'larm',1,{type:'npc',n},'x');await W8(120);out.bark=cnt('bark');out.barkT=(L.find(x=>x.k==='bark')||{}).o}
  /* a net */
  clear();P[2].netted=true;log('test net');log('test net again');await W8(500);out.net=cnt('net');out.wrap=cnt('netwrap');P[2].netted=false;log('free');
  /* crash, heal */
  clear();fx(5,5,'CRASH!','#fff');fx(P[0].r,P[0].c,'+2 HP','#7fe07a');await W8(60);out.crash=cnt('crash');out.heal=cnt('heal');
  /* the push */
  clear();{const T=[[6,2],[6,3],[6,4],[6,5]];const far=[[0,0],[0,12],[12,0],[12,12],[0,6],[12,6]];
    for(const [r,c] of T){S.pillars=S.pillars.filter(x=>!(x.r===r&&x.c===c));S.spikes=S.spikes.filter(x=>!(x.r===r&&x.c===c));S.floor=(S.floor||[]).filter(f=>!(f.r===r&&f.c===c));
      for(const u of [...S.players,...S.npcs])if(u.alive&&u.r===r&&u.c===c&&u!==P[0]&&u!==P[1]){const f=far.shift();u.r=f[0];u.c=f[1]}}
    P[0].r=6;P[0].c=2;P[1].r=6;P[1].c=3;P[1].alive=true;P[0].mv=9;draw();const t=pushTargets(P[0]).find(x=>x.u===P[1]);out.pt=!!t;if(t)await doPush(P[0],t)}await W8(60);out.scrape=cnt('scrape');out.pushStep=cnt('step');
  /* the crowd stands */
  clear();const r0=SND100.riseAt;SND100.riseAt=0;const base=stand100Wave;out.rise0=cnt('rise');
  if(S.spect&&S.spect.length){S.spect.forEach(s=>s.mood=99);STAND100.k.elim=1;const got=stand100Wave('elim');stand100Wave('elim');out.riseGot=got;out.rise=cnt('rise')}else{out.rise='nospect'}
  /* spear, chest, market: through the bus */
  clear();BUS.emit('spear',{by:{id:P[0].id},spect:{name:'x',sec:0},hit:true});BUS.emit('chest.open',{player:{id:P[0].id},key:'gladius'});BUS.emit('market.buy',{player:{id:P[0].id},lv:1,kind:'w',key:'gladius'});await W8(40);
  out.spear=cnt('spear');out.chest=cnt('chest');out.buy=cnt('coin');
  /* the Titulus reveal: its sting, not the fanfare; a fanfare right after is folded */
  clear();const e=tit100Cat()[0];tit100Reveal(e,'tester');await W8(60);sfx('fanfare');await W8(40);out.tit=cnt('titulus');out.fan=cnt('fanfare');document.getElementById('tit100rv')&&document.getElementById('tit100rv').click();
  /* medal */
  clear();SND100.medalMs=50;BUS.emit('challenge.done',{kind:'d',medal:'silver'});await W8(200);out.medal=cnt('medal');out.medalM=(L.find(x=>x.k==='medal')||{}).o;
  /* replay bar click */
  clear();const bar=document.createElement('div');bar.id='rp100bar';bar.innerHTML='<button data-rp1="sp" data-n="2">x2</button>';document.body.appendChild(bar);const sp0=SPEED;RPP.paused=true;bar.querySelector('button').click();await W8(60);bar.remove();SPEED=sp0;out.rp=cnt('rp');
  /* Signing Day: the verdict sounds when it shows (stubbed card: a still / calm card shows at once) */
  clear();const sv=sg100Verdict,sh=sg100HTML,an0=SETTINGS.anim88;out.sign={};
  for(const k of ['gem','dud']){sg100Verdict=()=>({k,dOv:0,avg:0});sg100HTML=()=>'<div class="sg1card"></div>';SETTINGS.anim88='off';
    try{sg100Show({id:'t'})}finally{sg100Verdict=sv;sg100HTML=sh;SETTINGS.anim88=an0}await W8(400);out.sign[k]=cnt(k);const d=document.getElementById('signCard');if(d)d.remove()}
  /* Fast: a CPU's step is silent, your own plays */
  clear();SPEED='fast';const cpuP=P.find(x=>x.cpu);sfx('step',{own:false});sfx('step',{own:true});sfx('growl',{t:'wolf',own:false});await W8(40);out.fastStep=cnt('step');out.fastGrowl=cnt('growl');
  /* To the end: board sounds silent */
  clear();SPEED='snap';S.snap=true;sfx('hit');sfx('step',{own:true});sfx('crash',{own:true});await W8(80);out.snap=L.length;S.snap=false;SPEED='normal';
  /* a sim: silent */
  clear();S.sim=true;sfx('hit');sfx('growl',{t:'lion'});await W8(60);S.sim=false;out.sim=L.length;
  /* mute: nothing plays */
  clear();audToggleMute();sfx('growl',{t:'bear'});sfx('titulus');await W8(60);out.muted=L.length;audToggleMute();
  /* the Effects slider reaches the sends */
  const sv0=SETTINGS.audio&&SETTINGS.audio.svol;SETTINGS.audio={...audSet(),svol:0};audApplyVol();out.vS0=AUD.vS.gain.value;out.sfx0=AUD.sfx.gain.value;
  SETTINGS.audio={...audSet(),svol:sv0!=null?sv0:AUD_DEF.svol};audApplyVol();out.vS1=AUD.vS.gain.value;
  SETTINGS.audio={...audSet(),mvol:0};audApplyVol();out.vM0=AUD.vM.gain.value;SETTINGS.audio={...audSet(),mvol:AUD_DEF.mvol};audApplyVol();out.vM1=AUD.vM.gain.value;
  SPEED='pause';return out});
console.log(JSON.stringify(R));
ok(R.step1===1&&R.step2===2&&R.step3===2,'1 a step per tile, none for a redraw or a jump '+[R.step1,R.step2,R.step3]);
ok(R.blow.length===1,'2 one blow (−AP + −HP) = one sound '+JSON.stringify(R.blow));
ok(R.growl===1&&R.growlT==='lion','3 a beast entering growls once (its kind) '+R.growl+R.growlT);
ok(R.bark===1&&R.barkT==='lion','4 a beast\'s blow barks once '+R.bark+R.barkT);
ok(R.net===1&&R.wrap===1,'5 net thrown + wrap once '+[R.net,R.wrap]);
ok(R.crash===1&&R.heal===1,'6 crash + heal '+[R.crash,R.heal]);
ok(R.scrape===1,'7 the push scrapes once '+[R.scrape,R.pushStep]);
ok(R.rise==='nospect'||R.rise===(R.riseGot?1:0),'8 the crowd rising murmurs once '+JSON.stringify([R.rise,R.riseGot]));
ok(R.spear===1&&R.chest===1&&R.buy===1,'9 spear, chest, market buy '+[R.spear,R.chest,R.buy]);
ok(R.tit===1&&R.fan===0,'10 Titulus sting once, the fanfare family folded '+[R.tit,R.fan]);
ok(R.medal===1&&R.medalM==='silver','11 medal once '+[R.medal,R.medalM]);
ok(R.rp===1,'12 replay click '+R.rp);
ok(R.sign.gem===1&&R.sign.dud===1,'13 Signing Day gem / dud '+JSON.stringify(R.sign));
ok(R.fastStep===1&&R.fastGrowl===0,'14 Fast: only your own '+[R.fastStep,R.fastGrowl]);
ok(R.snap===0&&R.sim===0&&R.muted===0,'15 To the end / sims / mute silent '+[R.snap,R.sim,R.muted]);
ok(R.vS0===0&&R.sfx0===0&&Math.abs(R.vS1-1)<1e-6&&R.vM0===0&&Math.abs(R.vM1-1)<1e-6,'16 sliders reach the reverb sends '+JSON.stringify([R.vS0,R.vS1,R.vM0,R.vM1]));
await A.cx.close();

/* ---------------- the kill switch: no wrappers ---------------- */
{const C=await open(true);const k=await C.pg.evaluate(()=>({on:SND100.on,verb:!AUD.ctx||!AUD.vS}));ok(!k.on&&k.verb,'17 kill switch: nothing installed '+JSON.stringify(k));await C.cx.close()}

/* ---------------- the same dice and log ON vs OFF (Normal pace, all CPU, seeded) ---------------- */
const run=async off=>{const C=await open(off);const okS=await start(C.pg,true,515151);
  const res=await C.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=[],R=[];
    const lb=log;log=function(h){if(S&&S.turnNo>=2&&S.turnNo<=8)L.push(S.turnNo+' '+String(h).replace(/<[^>]+>/g,''));return lb.apply(this,arguments)};
    const offT=BUS.on('turn.begin',e=>{if(e.turnNo<=8)R.push(e.turnNo+':'+RNG.s)});
    SPEED='normal';const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},200);
    for(let i=0;i<1200&&!(S.over||S.turnNo>8);i++)await W8(100);clearInterval(iv);SPEED='pause';log=lb;offT();
    return {L,R,turn:S.turnNo,played:typeof SND100!=='undefined'&&SND100.on?SND100.stats.played:-1}});await C.cx.close();res.ok=okS;return res};
const ON=await run(false),OFF=await run(true);const fl=x=>x.L.filter(l=>!/seed \d|seed <b>/.test(l));
ok(ON.ok&&OFF.ok&&ON.R.length>=3,'18a both seeded runs played '+JSON.stringify([ON.R.length,OFF.R.length,ON.turn,OFF.turn,ON.played]));
ok(JSON.stringify(ON.R)===JSON.stringify(OFF.R),'18b same dice ON vs OFF');
{const a=fl(ON),c=fl(OFF);let i=0;while(i<a.length&&a[i]===c[i])i++;ok(a.length===c.length&&i===a.length,'18c same log ON vs OFF (first difference at '+i+'/'+a.length+': '+JSON.stringify([a[i],c[i]])+')')}
ok(ON.played>0,'18d sounds played during the ON run '+ON.played);
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
