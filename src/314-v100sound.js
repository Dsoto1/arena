/* 314-v100sound — v1.0 THE SOUND PASS (his pick "Audit + new SFX", 2026-10-12). Sound only: never S, the dice, RNG, the log or onlHash.
   AUDIT (measured with tools/plans/sound100/measure.js: every sound rendered through the game's own graph on an OfflineAudioContext):
   (1) ONE MIX — each effect gets a trim (SND100_TRIM, dB) so the effects sit in two bands: blows / horns / beasts ≈ −22 dB RMS,
       cues (coin, card, click, CF, chimes) ≈ −29 dB; the turn clock tick (290) was 20 dB under everything else (+8 dB). The music bed
       (≈ −15 dB) dips 3 dB for half a second under a blow, an elimination, a beast or the horns (AUD.duck, between the fade stage and
       the master) so the board can be heard over it.
   (2) SLIDERS — the reverb send went straight to the convolver: Effects volume 0 or Music volume 0 still let the reverb tails through
       (and music faded out kept its reverb). Now music and effects each have their own send (AUD.vM through the fade mirror AUD.vF,
       AUD.vS), scaled by their slider relative to its default (so at the default sliders the sound is exactly as before).
   (3) DOUBLES — one blow played up to three sounds at once (−AP block + −HP hit + ELIMINATED death from fx()): blows / misses / deaths
       landing within SND100.win ms are folded into ONE, the strongest (death > bighit > hit > block > whoosh); at Fast at most one blow
       a 140 ms. The fanfare family (fanfare, the Titulus sting, medals) plays once in 1.5 s — an event's end + an achievement + its
       Titulus reveal were three fanfares.
   (4) TO THE END — "⏭ To the end" (SPEED 'snap' / S.snap) fired every blow's sound in a burst: board sounds are silent there (as in sims).
   (5) MISSING — topple CRASH!, a heal (+N HP), a spear throw, the Arena Chest opening and a market purchase made no sound.
   NEW SOUNDS (procedural, on the effects bus + its slider; Fast = only your own; sims / HEADLESS / To the end = none):
     step (one per tile a walking piece takes — the active piece; at Fast only yours), growl (a beast enters, per kind: lion roar, bear
     growl, wolf howl, snake hiss, Zora screech, Tholo / Commodus grunt) + bark (its attack, shorter), net (rete thrown: whoosh) + netwrap
     (the cords bite), scrape (294's push), crash (topple), rise (283: the crowd stands — a murmur), titulus (307's reveal: a bright brass
     sting instead of the fanfare), gem / fair / dud (299's Signing Day verdict, when it shows), medal (310: one / two / three bell strikes),
     rp (309's replay bar clicks), heal, spear, chest.
   Hooks: BUS draw.after (steps), hit (beast barks), log (nets), spear, chest.open, market.buy, challenge.done; light wrappers on sfx, fx,
   spawnNPC, doPush, stand100Wave, tit100Next, sg100Show, audInit, audApplyVol, audFadeTo. SND100.log = what really played (tests).
   Kill switch localStorage flavius_sound100off=1 (nothing installed: today's sounds exactly). */
const SND100_OFF=(()=>{try{return localStorage.getItem('flavius_sound100off')==='1'}catch(e){return false}})();
const SND100={on:!SND100_OFF,win:30,signMs:2300,medalMs:3300,fastGap:140,famGap:1500,duckDb:-3,duckMs:500, /* TWEAK: fold window, Fast blow spacing, fanfare family spacing, music dip */
  log:[],pend:null,lastImp:0,lastFam:0,famK:'',seen:new WeakMap(),nets:new WeakSet(),netS:null,step:{S:null,id:null,r:0,c:0},pushing:0,lastBark:new Map(),
  riseAt:0,titIn:0,nodes:null,nctx:null,stats:{played:0,folded:0,fam:0,snap:0,fast:0}};
/* TWEAK: per-sound trim in dB (measured before → after, see tools/plans/sound100/measure.js) */
const SND100_TRIM={block:3,whoosh:4,card:8,cheer:4,fanfare:3,coin:-1,click:9,tt100:13,crash:-5,dud:-8,medal:-3,rise:4,rp:14,titulus:4,chest:4,netwrap:5,
  'v:grunt':-4,'v:bear':-2,'v:zora':6,'v:snake':-2};
const SND100_IMP={whoosh:1,block:2,hit:3,bighit:4,death:5};
const SND100_FAM={fanfare:1,titulus:1,medal:1};
/* board sounds: silent at To the end, only your own at Fast */
const SND100_BOARD={step:1,growl:1,bark:1,net:1,netwrap:1,scrape:1,crash:1,rise:1,heal:1,spear:1,chest:1,hit:1,bighit:1,block:1,whoosh:1,death:1,coin:1,cf:1,card:1};
const SND100_DUCK={hit:1,bighit:1,death:1,horn:1,growl:1,crash:1};

function snd100Live(){try{return typeof S!=='undefined'&&!!S&&!S.over}catch(e){return false}}
function snd100Snap(){try{return !!(S&&(S.snap||(typeof SPEED!=='undefined'&&SPEED==='snap')))}catch(e){return false}}
function snd100Fast(){return typeof SPEED!=='undefined'&&SPEED==='fast'}
/* "your own": a human seat on this screen (online: my seat) */
function snd100Own(p){try{if(!p)return false;if(typeof push100Own==='function')return push100Own(p);return !p.cpu}catch(e){return false}}
function snd100Npc(id){try{return (S.npcs||[]).find(n=>n.id===id)||null}catch(e){return null}}
function snd100Pl(id){try{return (S.players||[]).find(p=>p.id===id)||null}catch(e){return null}}

/* ---------------- the graph: sends, duck, trims ---------------- */
function snd100Route(){const c=AUD.ctx;if(!c||AUD.snd100c===c||!AUD.verb||!AUD.fade)return;try{
  const conv=AUD.verb,vS=c.createGain(),vM=c.createGain(),vF=c.createGain(),duck=c.createGain();
  vS.connect(conv);vM.connect(vF);vF.connect(conv);vF.gain.value=AUD.fade.gain.value;
  try{AUD.fade.disconnect()}catch(e){}AUD.fade.connect(duck);duck.connect(AUD.master);
  Object.assign(AUD,{verbC:conv,vS,vM,vF,duck,verb:vM,snd100c:c});SND100.nodes=new Map();SND100.nctx=c;snd100Mirror()}catch(e){console.error(e)}}
function snd100Mirror(){if(!AUD.vS||!AUD.ctx)return;const a=audSet();
  AUD.vS.gain.value=a.sfx?a.svol/AUD_DEF.svol:0;AUD.vM.gain.value=a.music?a.mvol/AUD_DEF.mvol:0}
function snd100Trim(kind,voice){const c=AUD.ctx;if(SND100.nctx!==c){SND100.nodes=new Map();SND100.nctx=c}const key=voice?kind+'|'+voice:kind;let n=SND100.nodes.get(key);
  if(!n){const g=c.createGain(),v=c.createGain();g.gain.value=v.gain.value=Math.pow(10,((SND100_TRIM[kind]||0)+(voice&&SND100_TRIM['v:'+voice]||0))/20);g.connect(AUD.sfx);v.connect(AUD.vS||AUD.verb);n={g,v};SND100.nodes.set(key,n)}return n}
function snd100Duck(){try{if(!AUD.duck||!snd100Live())return;const g=AUD.duck.gain,t=AUD.ctx.currentTime,lo=Math.pow(10,SND100.duckDb/20);
  g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(lo,t+0.03);g.setValueAtTime(lo,t+0.12);g.linearRampToValueAtTime(1,t+0.12+SND100.duckMs/1000)}catch(e){}}

/* ---------------- procedural helpers (on the trimmed node d) ---------------- */
function snd100Buf(){const c=AUD.ctx;if(SND100.nbC!==c){SND100.nbC=c;const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;SND100.nb=b}return SND100.nb}
/* noise with an attack, a filter (optionally swept) and an exponential release */
function snd100N(d,t,dur,vol,o={}){const c=AUD.ctx,s=c.createBufferSource();s.buffer=snd100Buf();const f=c.createBiquadFilter(),g=c.createGain();
  f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.fTo)f.frequency.exponentialRampToValueAtTime(o.fTo,t+dur);f.Q.value=o.q||0.8;
  const a=o.a||0.005;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+Math.max(a+0.01,dur));
  s.connect(f);f.connect(g);g.connect(d);if(o.verb&&AUD.verb)g.connect(AUD.verb);const off=Math.random()*1.2;s.start(t,off);s.stop(t+dur+0.05)}
const snd100T=(d,t,f,dur,type,vol,o)=>audNote(d,t,f,dur,type,vol,o||{});
/* the beasts' voices: k = kind, s = 1 spawn (full) / 0.45 attack (short) */
const SND100_VOICE={
  lion:(d,t,s)=>{const L=1.1*s;snd100T(d,t,98,L,'sawtooth',0.2,{bend:0.68,lp:760,lpTo:300,a:0.06,r:0.25,vib:1,verb:1});snd100T(d,t,148,L*0.8,'sawtooth',0.07,{bend:0.6,lp:900,a:0.05,r:0.2});snd100N(d,t,L,0.32,{type:'lowpass',f:520,fTo:220,a:0.07})},
  bear:(d,t,s)=>{const L=1.2*s;snd100T(d,t,72,L,'square',0.16,{bend:0.8,lp:420,a:0.08,r:0.3,vib:1,verb:1});snd100T(d,t+0.05,61,L*0.9,'sawtooth',0.12,{bend:0.85,lp:360,a:0.08,r:0.3});snd100N(d,t,L,0.3,{type:'lowpass',f:380,a:0.09})},
  wolf:(d,t,s)=>{if(s<1){snd100T(d,t,360,0.12,'sawtooth',0.14,{bend:0.7,lp:1600,a:0.005,r:0.05});snd100T(d,t+0.16,330,0.14,'sawtooth',0.13,{bend:0.65,lp:1500,a:0.005,r:0.05});snd100N(d,t,0.3,0.12,{f:900,q:1})}
    else{snd100T(d,t,470,0.55,'sine',0.17,{bend:1.5,a:0.12,r:0.1,vib:1,verb:1});snd100T(d,t+0.55,705,0.8,'sine',0.16,{bend:0.68,a:0.02,r:0.3,vib:1,verb:1});snd100T(d,t,940,1.3,'triangle',0.025,{bend:1.1,a:0.2,r:0.3,verb:1})}},
  snake:(d,t,s)=>{snd100N(d,t,0.9*s+0.15,0.3,{type:'highpass',f:4200,a:0.06,q:0.7});snd100N(d,t,0.8*s+0.1,0.14,{f:7000,q:2,a:0.08})},
  zora:(d,t,s)=>{const L=0.55*s+0.12;snd100T(d,t,1500,L,'sawtooth',0.07,{bend:0.6,lp:3600,lpTo:1800,a:0.01,r:0.1,vib:1,verb:1});snd100T(d,t,2240,L*0.8,'square',0.025,{bend:0.6,lp:4200});snd100N(d,t,L,0.12,{f:2800,q:1.5})},
  grunt:(d,t,s)=>{const L=0.32*s+0.12;snd100T(d,t,118,L,'square',0.15,{bend:0.7,lp:520,a:0.015,r:0.08});snd100T(d,t,82,L,'sine',0.2,{bend:0.75,a:0.015,r:0.08});snd100N(d,t,L*0.8,0.18,{type:'lowpass',f:600})}};
function snd100VoiceOf(t){t=String(t||'');if(SND100_VOICE[t])return t;if(t==='tholo'||t==='commodus')return 'grunt';
  try{const T=typeof NPCT!=='undefined'&&NPCT[t];const base=T&&(T.base||T.type);if(base&&SND100_VOICE[base])return base;if(T&&(T.humanoid||T.hum))return 'grunt'}catch(e){}return 'lion'}
/* bells: frequency, start, level (inharmonic partials of a struck bell) */
function snd100Bell(d,t,f,v){snd100T(d,t,f,1.2,'sine',v,{a:0.003,r:0.9,verb:1});snd100T(d,t,f*2.76,0.5,'sine',v*0.35,{a:0.002,r:0.4});snd100T(d,t,f*5.4,0.25,'sine',v*0.15,{a:0.002,r:0.2})}

const SND100_K={
  step:(d,t,o)=>{const f=o&&o.alt?150:120;snd100N(d,t,0.07,0.32,{type:'lowpass',f:420});snd100T(d,t,f,0.05,'sine',0.12,{bend:0.6,a:0.002,r:0.03});snd100N(d,t+0.01,0.04,0.05,{type:'highpass',f:3500})},
  growl:(d,t,o)=>{SND100_VOICE[snd100VoiceOf(o&&o.t)](d,t,1)},
  bark:(d,t,o)=>{SND100_VOICE[snd100VoiceOf(o&&o.t)](d,t,0.45)},
  net:(d,t)=>{snd100N(d,t,0.38,0.3,{f:900,fTo:2600,q:0.9,a:0.08});snd100N(d,t+0.05,0.3,0.12,{type:'highpass',f:3000,a:0.06})},
  netwrap:(d,t)=>{for(const k of [0,0.07,0.15])snd100N(d,t+k,0.09,0.22,{f:1300+k*2000,q:3});snd100T(d,t+0.05,190,0.25,'sawtooth',0.05,{bend:1.3,lp:700})},
  scrape:(d,t)=>{snd100N(d,t,0.45,0.34,{f:650,fTo:420,q:1.3,a:0.03});snd100T(d,t,58,0.4,'sawtooth',0.07,{lp:260,a:0.03,r:0.12});snd100N(d,t+0.05,0.3,0.08,{type:'highpass',f:2800,a:0.04})},
  crash:(d,t)=>{snd100N(d,t,0.9,0.5,{type:'lowpass',f:520,fTo:160,a:0.004,verb:1});snd100T(d,t,64,0.5,'sine',0.3,{bend:0.6,r:0.3});for(const k of [0.09,0.2,0.31,0.45])snd100N(d,t+k,0.06,0.18,{f:900+k*900,q:2})},
  rise:(d,t)=>{snd100N(d,t,1.5,0.16,{f:700,fTo:1100,q:0.5,a:0.45,verb:1});snd100N(d,t+0.1,1.3,0.08,{f:1700,q:0.6,a:0.4})},
  titulus:(d,t)=>{for(const [m,dt,L] of [[67,0,0.14],[72,0.12,0.14],[76,0.24,0.14],[79,0.36,0.6]])for(const det of [0.996,1.004])snd100T(d,t+dt,audMtof(m)*det,L,'sawtooth',0.05,{lp:3200,lpTo:1700,a:0.012,r:0.18,vib:L>0.3?1:0,verb:1});snd100T(d,t+0.36,audMtof(55),0.6,'square',0.04,{lp:900,a:0.02,r:0.2})},
  gem:(d,t)=>{[76,79,83,88,91,95].forEach((m,i)=>snd100T(d,t+i*0.075,audMtof(m),0.5,'triangle',0.085,{a:0.003,r:0.4,verb:1}));snd100N(d,t+0.35,0.6,0.05,{type:'highpass',f:6000,a:0.1,verb:1})},
  fair:(d,t)=>{snd100T(d,t,audMtof(72),0.25,'triangle',0.09,{a:0.004,r:0.2,verb:1});snd100T(d,t+0.12,audMtof(76),0.35,'triangle',0.08,{a:0.004,r:0.25,verb:1})},
  dud:(d,t)=>{snd100T(d,t,72,0.35,'sine',0.35,{bend:0.6,a:0.004,r:0.2});snd100N(d,t,0.25,0.3,{type:'lowpass',f:240});snd100T(d,t+0.05,audMtof(43),0.5,'triangle',0.06,{bend:0.94,lp:500,r:0.3})},
  medal:(d,t,o)=>{const n=o&&o.m==='gold'?3:o&&o.m==='silver'?2:1;const F=[880,1109,1319];for(let i=0;i<n;i++)snd100Bell(d,t+i*0.22,F[i],0.11);if(n===3)snd100N(d,t+0.5,0.8,0.04,{type:'highpass',f:6500,a:0.1,verb:1})},
  rp:(d,t,o)=>{const a=o&&o.a;if(a==='play'||a==='pause'){snd100T(d,t,a==='play'?900:700,0.03,'triangle',0.08,{a:0.002,r:0.02});snd100T(d,t+0.04,a==='play'?1200:520,0.04,'triangle',0.07,{a:0.002,r:0.03})}
    else{snd100T(d,t,1500,0.02,'square',0.04,{lp:4000,a:0.001,r:0.02});snd100N(d,t,0.025,0.06,{type:'highpass',f:4000})}},
  heal:(d,t)=>{snd100T(d,t,audMtof(69),0.3,'sine',0.11,{a:0.02,r:0.2,verb:1});snd100T(d,t+0.1,audMtof(76),0.45,'sine',0.1,{a:0.02,r:0.3,verb:1})},
  spear:(d,t)=>{snd100N(d,t,0.3,0.28,{f:1600,fTo:3200,q:0.8,a:0.1});snd100N(d,t+0.32,0.12,0.4,{type:'lowpass',f:500});snd100T(d,t+0.32,140,0.12,'sine',0.14,{bend:0.6})},
  chest:(d,t)=>{snd100T(d,t,110,0.45,'sawtooth',0.07,{bend:1.45,lp:700,a:0.03,r:0.1,vib:1});snd100N(d,t+0.4,0.08,0.2,{type:'lowpass',f:700});[1319,1568,1760].forEach((f,i)=>snd100T(d,t+0.5+i*0.06,f,0.12,'square',0.035,{lp:4000,a:0.002,r:0.1}))}};

/* Signing Day: the verdict sounds when it SHOWS — at once on a still / Reduce-motion card, else after its 2.2 s fade-in (299's CSS delay) */
function snd100SignWatch(d,k){let done=false,tm=0;const fire=()=>{if(done||!d.isConnected)return;done=true;mo.disconnect();clearTimeout(tm);sfx(k)};
  const check=()=>{if(done)return;if(!d.isConnected){mo.disconnect();return}if(d.classList.contains('still')||d.classList.contains('rm')){tm&&clearTimeout(tm);tm=setTimeout(fire,120);return}
    if(d.classList.contains('go')&&!tm)tm=setTimeout(fire,SND100.signMs)};
  const mo=new MutationObserver(check);mo.observe(d,{attributes:true,attributeFilter:['class']});check();setTimeout(()=>mo.disconnect(),9000)}

/* ---------------- the gate ---------------- */
function snd100Gate(kind,o){const a=audSet();if(HEADLESS||!a.on||!a.sfx)return false;
  try{if(S&&S.sim)return false}catch(e){}
  if(SND100_BOARD[kind]&&snd100Live()){if(snd100Snap()){SND100.stats.snap++;return false}
    if(snd100Fast()&&o&&o.own===false&&!SND100_IMP[kind]){SND100.stats.fast++;return false}}
  return true}
/* play one sound through its trim (base = 21's sfx for the old kinds) */
function snd100Fire(base,kind,o){if(!audInit())return;const c=AUD.ctx;if(c.state!=='running')return;snd100Route();
  SND100.log.push({k:kind,t:Math.round(performance.now()),o:o&&(o.t||o.m||o.a)||''});if(SND100.log.length>200)SND100.log.shift();SND100.stats.played++;
  if(SND100_DUCK[kind])snd100Duck();
  const N=snd100Trim(kind,(kind==='growl'||kind==='bark')?snd100VoiceOf(o&&o.t):''),keepS=AUD.sfx,keepV=AUD.verb;AUD.sfx=N.g;AUD.verb=N.v;
  try{if(SND100_K[kind])SND100_K[kind](N.g,c.currentTime+0.01,o||{});else base.call(window,kind)}catch(e){console.error(e)}finally{AUD.sfx=keepS;AUD.verb=keepV}}
function snd100Flush(base){const P=SND100.pend;SND100.pend=null;if(!P)return;const now=performance.now();
  if(snd100Fast()&&P.k!=='death'&&now-SND100.lastImp<SND100.fastGap){SND100.stats.fast++;return}SND100.lastImp=now;snd100Fire(base,P.k,P.o)}

if(SND100.on){
  {const base=sfx;sfx=function(kind,o){if(!kind)return;if(!snd100Gate(kind,o))return;
    if(kind==='fanfare'&&SND100.titIn)kind='titulus';
    if(SND100_IMP[kind]){const p=SND100_IMP[kind];if(!SND100.pend){SND100.pend={k:kind,o,p};setTimeout(()=>snd100Flush(base),SND100.win)}
      else{SND100.stats.folded++;if(p>SND100.pend.p)SND100.pend={k:kind,o,p}}return}
    if(SND100_FAM[kind]){const now=performance.now();if(now-SND100.lastFam<SND100.famGap){SND100.stats.fam++;return}SND100.lastFam=now;SND100.famK=kind}
    snd100Fire(base,kind,o)}}
  /* the graph */
  {const base=audInit;audInit=function(){const r=base.apply(this,arguments);try{if(r)snd100Route()}catch(e){}return r}}
  {const base=audApplyVol;audApplyVol=function(){const r=base.apply(this,arguments);try{snd100Mirror()}catch(e){}return r}}
  {const base=audFadeTo;audFadeTo=function(level,sec){const r=base.apply(this,arguments);try{if(AUD.vF&&AUD.ctx){const g=AUD.vF.gain,t=AUD.ctx.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(level,t+sec)}}catch(e){}return r}}
  if(AUD.ctx)snd100Route();
  /* the turn clock's tick: louder, on its own trim */
  if(typeof tt100Tick==='function'){const base=tt100Tick;tt100Tick=function(){if(!AUD.ctx||!AUD.sfx)return base.apply(this,arguments);snd100Route();const N=snd100Trim('tt100'),k=AUD.sfx;AUD.sfx=N.g;try{return base.apply(this,arguments)}finally{AUD.sfx=k}}}
  /* fx: the words that had no sound */
  {const base=fx;fx=function(r,c,text){const t=String(text==null?'':text);try{if(!HEADLESS&&S&&!S.sim){
      let own=null;try{own=snd100Own((S.players||[]).find(p=>p.r===r&&p.c===c&&p.alive))}catch(e){}
      if(t==='CRASH!')sfx('crash',{own:snd100Own(typeof cur==='function'?cur():null)});else if(/^\+\d+ HP\b/.test(t))sfx('heal',{own})}}catch(e){}
    return base.apply(this,arguments)}}
  /* a beast enters (not the ones placed at the start) */
  {const base=spawnNPC;spawnNPC=function(target,name,at,extra){const r=base.apply(this,arguments);
    try{if(r&&r.t&&!HEADLESS&&S&&!S.sim&&S.turnNo>0&&!(extra&&extra.tamedBy!=null))sfx('growl',{t:r.t,own:false})}catch(e){}return r}}
  /* the push: a scrape while the piece slides */
  {const base=doPush;doPush=async function(player,target){try{if(!HEADLESS&&S&&!S.sim)sfx('scrape',{own:snd100Own(player)})}catch(e){}
    SND100.pushing++;try{return await base.apply(this,arguments)}finally{SND100.pushing--;try{const p=cur&&cur();if(p)Object.assign(SND100.step,{S,id:p.id,r:p.r,c:p.c})}catch(e){}}}}
  /* the crowd stands */
  if(typeof stand100Wave==='function'){const base=stand100Wave;stand100Wave=function(){const r=base.apply(this,arguments);
    try{const now=performance.now();if(r&&now-SND100.riseAt>2500){SND100.riseAt=now;sfx('rise',{own:true})}}catch(e){}return r}}
  /* the Titulus reveal: its own sting */
  if(typeof tit100Next==='function'){const base=tit100Next;tit100Next=function(){SND100.titIn++;try{return base.apply(this,arguments)}finally{SND100.titIn--}}}
  /* Signing Day: the verdict's sound when the verdict shows */
  if(typeof sg100Show==='function'){const base=sg100Show;sg100Show=function(g){let V=null,calm=false;try{V=sg100Verdict(g);calm=typeof rc100Calm==='function'&&rc100Calm()}catch(e){}
    const d=base.apply(this,arguments);try{if(V&&V.k&&d&&d.classList)snd100SignWatch(d,V.k==='gem'?'gem':V.k==='dud'?'dud':'fair')}catch(e){}return d}}
  /* the replay bar */
  window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#rp100bar [data-rp1]');if(!b||b.tagName==='SELECT')return;const a=b.dataset.rp1;
    if(a==='mute')return;setTimeout(()=>{try{sfx('rp',{a:a==='play'?(typeof RPP!=='undefined'&&RPP.paused?'pause':'play'):a})}catch(err){}},0)},true);
  document.addEventListener('keydown',e=>{if(e.key!==' '||typeof RPP==='undefined'||!RPP.on||CUR_MODAL)return;setTimeout(()=>{try{sfx('rp',{a:RPP.paused?'pause':'play'})}catch(err){}},0)},true);
  /* steps: the active piece's tile moved by one */
  BUS.on('draw.after',()=>{try{if(HEADLESS||!S||S.sim||S.over)return;const p=typeof cur==='function'?cur():null;const st=SND100.step;if(!p||p.r==null){st.S=null;return}
    const same=st.S===S&&st.id===p.id;const dr=Math.abs(p.r-st.r),dc=Math.abs(p.c-st.c);Object.assign(st,{S,id:p.id,r:p.r,c:p.c});
    if(!same||(!dr&&!dc)||Math.max(dr,dc)>1||SND100.pushing||!p.alive)return;if((typeof isChariot==='function'&&isChariot())||(typeof isNaum==='function'&&isNaum()))return;
    st.alt=!st.alt;sfx('step',{own:snd100Own(p),alt:st.alt})}catch(e){}});
  /* a beast's blow */
  BUS.on('hit',e=>{try{if(!e||e.sim||!e.by||!e.by.npc||!S)return;const n=snd100Npc(e.by.id);if(!n)return;const now=performance.now();if(now-(SND100.lastBark.get(n)||0)<400)return;SND100.lastBark.set(n,now);
    const tg=e.target&&!e.target.npc?snd100Pl(e.target.id):null;sfx('bark',{t:n.t,own:snd100Own(tg)})}catch(x){}});
  /* a net thrown over someone */
  BUS.on('log',()=>{try{if(HEADLESS||!S||S.sim)return;const fresh=SND100.netS!==S;SND100.netS=S;for(const u of [...(S.players||[]),...(S.npcs||[])]){if(!u||!u.netted){if(u)SND100.nets.delete(u);continue}
      if(SND100.nets.has(u))continue;SND100.nets.add(u);if(fresh)continue;let by=null;try{by=cur()}catch(e){}const own=snd100Own(by)||snd100Own(u);
      sfx('net',{own});setTimeout(()=>{try{if(u.netted)sfx('netwrap',{own})}catch(e){}},380)}}catch(e){}});
  BUS.on('spear',e=>{try{if(!S||S.sim)return;sfx('spear',{own:snd100Own(e&&e.by&&snd100Pl(e.by.id))})}catch(x){}});
  BUS.on('chest.open',e=>{try{if(!S||S.sim||!e||!e.key)return;sfx('chest',{own:snd100Own(e.player&&snd100Pl(e.player.id))})}catch(x){}});
  BUS.on('market.buy',e=>{try{if(!S||S.sim||!e||!e.kind)return;sfx(e.free?'card':'coin',{own:snd100Own(e.player&&snd100Pl(e.player.id))})}catch(x){}});
  BUS.on('challenge.done',e=>{try{if(!e||!e.medal)return;setTimeout(()=>{try{sfx('medal',{m:e.medal})}catch(x){}},SND100.medalMs)}catch(x){}});
}
