/* 408-v108sfx — v1.08a RECORDED SOUND EFFECTS (his ask 2026-10-20 "use better sound effects if able"; picks in tools/plans/v108a/NOTES.md).
   Sound only: never S, the dice, RNG, the log or onlHash (jitter = Math.random). 25 short mp3s (≈0.49 MB; CC0 / CC BY 4.0, credited in
   Credits → "Sound effects") replace ONLY the synthesized voice inside 314's snd100Fire routing: the trims, the Effects slider, mute, the
   fold window, the fanfare family, Fast / To the end gating and the music duck all keep applying unchanged. Per kind, if a decoded buffer
   exists it plays into the same trimmed node (N.g, reverb send N.v for the brass / horn / bell / crash / death), else the synth plays.
   Files (flat in assets/, `sfx108_<key>.mp3`; the standalone's mkshare inlines every file of assets/, not sub-folders):
   assets/sfx108_hit.mp3 assets/sfx108_bighit.mp3 assets/sfx108_block.mp3 assets/sfx108_whoosh.mp3 assets/sfx108_death.mp3 assets/sfx108_spear.mp3
   assets/sfx108_axe.mp3 assets/sfx108_net.mp3 assets/sfx108_netwrap.mp3 assets/sfx108_scrape.mp3 assets/sfx108_crash.mp3 assets/sfx108_step.mp3
   assets/sfx108_cheer.mp3 assets/sfx108_rise.mp3 assets/sfx108_horn.mp3 assets/sfx108_fanfare.mp3 assets/sfx108_titulus.mp3 assets/sfx108_medal.mp3
   assets/sfx108_lion.mp3 assets/sfx108_bear.mp3 assets/sfx108_wolf.mp3 assets/sfx108_snake.mp3 assets/sfx108_eagle.mp3 assets/sfx108_grunt.mp3 assets/sfx108_beast.mp3
   KIND → FILE: hit, bighit, block, whoosh, death, spear (the spear hurled into the stands), net, netwrap, scrape, crash, step, cheer, rise,
   horn, fanfare, titulus, medal = their own file; growl / bark = the beast's file by voice: lion, bear, wolf, snake, zora → eagle, tholo /
   commodus → grunt, any other (custom) beast → beast (bark = the first 0.45 of the same sample with a quick fade, 314's "short" idea).
   NEW: 'axe' — an Axe THROWN (doAttack with source.thr and W.axe) makes a sound (thrown weapons made none before); only the axe, at the moment
   it leaves the hand; a board sound (silent in sims / To the end, only your own at Fast). Without its file it stays silent.
   LEVEL: each sample is matched at load to the measured band of the synth it replaces (tools/plans/sound100/after.txt, loudest-100 ms RMS at the
   master at the default sliders, SFX108_DB) through its own trim, with a peak ceiling, so Effects / trims behave as before.
   LOADING: lazy — after the AudioContext is first created (a real gesture), 3 at a time, fetch + decodeAudioData; never before audio is on,
   never blocks FLAVIUS_READY. A file that is missing / fails → that kind keeps its synth, silently. On file:// (no fetch) only the standalone's
   inlined ASSET_DATA loads; the site / beta (http) load assets/.
   Hooks: wraps snd100Fire (captures the synth `base`), SND100_K entries, audInit, doAttack, creditsHTML (Sound effects list). SFX108.log = what
   played (tests). Kill switch localStorage flavius_sfx108off=1 (nothing installed, nothing fetched: 314's synth exactly). */
const SFX108_OFF=(()=>{try{return localStorage.getItem('flavius_sfx108off')==='1'}catch(e){return false}})();
const SFX108={on:!SFX108_OFF&&typeof SND100!=='undefined'&&SND100.on,buf:new Map(),fail:new Set(),started:false,done:false,base:null,log:[],stats:{sample:0,synth:0},
  jit:0.03,verb:{fanfare:0.35,horn:0.35,titulus:0.3,medal:0.3,crash:0.2,death:0.15,cheer:0.1}};
const SFX108_KEYS=['hit','bighit','block','whoosh','death','spear','axe','net','netwrap','scrape','crash','step','cheer','rise','horn','fanfare','titulus','medal','lion','bear','wolf','snake','eagle','grunt','beast'];
const SFX108_VFILES=['lion','bear','wolf','snake','eagle','grunt','beast'];
const SFX108_JIT={hit:1,step:1,block:1};
/* TWEAK: loudest-100 ms RMS (dBFS at the master, default sliders) each kind should land at — the measured synth values of sound100/after.txt */
const SFX108_DB={hit:-24.7,bighit:-23,block:-28.6,whoosh:-29.8,death:-25.7,cheer:-29.2,fanfare:-26.1,horn:-23.9,step:-32.8,net:-30.9,netwrap:-31.7,scrape:-31.6,crash:-23.5,
  rise:-31,titulus:-26.4,medal:-26.9,spear:-28.9,axe:-26,'v:lion':-24.1,'v:bear':-22.9,'v:wolf':-23.4,'v:snake':-24.8,'v:zora':-26.3,'v:grunt':-23.1,'v:beast':-24};
const SFX108_VOICE={lion:'lion',bear:'bear',wolf:'wolf',snake:'snake',zora:'eagle',grunt:'grunt'};
/* the credits (key, title, author, licence, freesound id) of the 25 files */
const SFX108_CREDITS=[["hit","Tyrael - Sword Hit Flesh - 02.wav","SoundFlakes","CC BY 4.0",492239],["bighit","Punch","danlucaz","CC0",517744],["block","block3.wav","Empiremonkey","CC0",616493],["whoosh","Wooden Stick Swing 1_2","Joao_Janz","CC0",485277],["death","Body fall_02.wav","deleted_user_2104797","CC0",346694],["spear","Imperius - Spear Hit - 03.wav","SoundFlakes","CC BY 4.0",492250],["axe","Axe Throwing Hitting Flesh.wav","SoundFlakes","CC BY 4.0",492225],["net","Swirling Velvet Cloak 1.wav","F.M.Audio","CC BY 4.0",556760],["netwrap","rope leathery creaking.wav","vestibule-door","CC0",664929],["scrape","Scraping_gravel.MP3","CGEffex","CC BY 4.0",86987],["crash","Stone crash","discofield","CC0",711657],["step","Steps-Dirt_3b.OGG","nuFF3","CC BY 4.0",477394],["lion","S01-09_Short lion roars.wav","craigsmith","CC0",675443],["bear","BEARGrowl_03.wav","tbsounddesigns","CC BY 4.0",416859],["wolf","Igor-13C.aif","be-steele","CC BY 4.0",128023],["snake","Snake Hiss","xoiziox","CC0",553374],["eagle","Hawk/Eagle Cry (Distant)","PRINCEofWORMS","CC BY 4.0",571273],["grunt","ManlyGrunt02.wav","melisandepope","CC0",557131],["beast","Monster Snarl 2","EvanBoyerman","CC BY 4.0",753854],["cheer","Approx 800 Cheer and Clapping.wav","lonemonk","CC BY 4.0",72837],["rise","Murmur.wav","stewadosan","CC0",466767],["horn","war horn.wav","adharca","CC0",539956],["fanfare","Short Brass Fanfare 1.wav","_MC5_","CC BY 4.0",524849],["titulus","Brass Sting 1","nomiqbomi","CC0",578589],["medal","Tiny Hand Bell Ding","tosha73","CC BY 4.0",862762]];

const sfx108File=k=>'sfx108_'+k+'.mp3';
function sfx108URL(k){const f=sfx108File(k);try{if(window.ASSET_DATA&&window.ASSET_DATA[f])return window.ASSET_DATA[f]}catch(e){}
  if(location.protocol==='file:')return null;return ASSET+f}
/* loudest 100 ms RMS (dB) + peak (dB) of a decoded buffer */
function sfx108Measure(b){const n=b.length,w=Math.max(1,Math.round(b.sampleRate*0.1)),h=Math.max(1,w>>1);let best=0,pk=0;const ch=[];for(let i=0;i<b.numberOfChannels;i++)ch.push(b.getChannelData(i));
  for(let s=0;s<n;s+=h){let sum=0,cnt=0;const e=Math.min(n,s+w);for(const d of ch)for(let i=s;i<e;i++){const v=d[i];sum+=v*v;cnt++;const a=v<0?-v:v;if(a>pk)pk=a}
    if(cnt&&sum/cnt>best)best=sum/cnt}
  const db=x=>x>0?20*Math.log10(x):-99;return {rms:db(Math.sqrt(best)),pk:db(pk)}}
function sfx108Decode(c,ab){return new Promise((res,rej)=>{try{const p=c.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)}catch(e){rej(e)}})}
function sfx108Load(){if(SFX108.started||!SFX108.on||!AUD.ctx)return;SFX108.started=true;const c=AUD.ctx,q=SFX108_KEYS.slice();
  const one=async()=>{while(q.length){const k=q.shift();try{const u=sfx108URL(k);if(!u)throw 0;const r=await fetch(u);if(!r.ok)throw 0;const b=await sfx108Decode(c,await r.arrayBuffer());
    SFX108.buf.set(k,Object.assign({b},sfx108Measure(b)))}catch(e){SFX108.fail.add(k)}}};
  setTimeout(()=>{Promise.all([one(),one(),one()]).then(()=>{SFX108.done=true}).catch(()=>{})},400)}
/* which file a kind (+ the beast's type) plays */
function sfx108Key(kind,o){if(kind==='growl'||kind==='bark'){const t=o&&o.t,voice=snd100VoiceOf(t);let v=voice;
    if(v==='lion'&&String(t)!=='lion'){let base=null;try{const T=typeof NPCT!=='undefined'&&NPCT[t];base=T&&(T.base||T.type)}catch(e){}if(base!=='lion')v='beast'}
    return {key:SFX108_VOICE[v]||'beast',voice,vd:SFX108_VOICE[v]?v:'beast'}}
  return SFX108_KEYS.includes(kind)&&!SFX108_VFILES.includes(kind)?{key:kind,voice:'',vd:''}:null}
const sfx108Gains=new Map();
function sfx108Gain(kind,e,K){const ck=kind+'|'+K.key+'|'+K.voice+'|'+Math.round(e.rms*10);let g=sfx108Gains.get(ck);if(g!=null)return g;
  const tgt=SFX108_DB[(kind==='growl'||kind==='bark')?'v:'+K.vd:kind],trim=(SND100_TRIM[kind]||0)+(K.voice&&SND100_TRIM['v:'+K.voice]||0),master=-20*Math.log10(AUD_DEF.svol);
  let db=(tgt==null?e.rms:tgt)-e.rms-trim+master;db=Math.min(db,-6-e.pk-trim+master);db=Math.max(-30,Math.min(24,db));g=Math.pow(10,db/20);sfx108Gains.set(ck,g);return g}
/* play the sample into d (the trimmed node of 314's snd100Fire); false → the synth plays */
function sfx108Play(kind,d,t,o){const K=sfx108Key(kind,o);if(!K)return false;const e=SFX108.buf.get(K.key),c=AUD.ctx;if(!e||!c)return false;
  try{const s=c.createBufferSource();s.buffer=e.b;if(SFX108_JIT[kind])s.playbackRate.value=1+(Math.random()*2-1)*SFX108.jit;
    const g=c.createGain(),gain=sfx108Gain(kind,e,K);g.gain.setValueAtTime(gain,t);let dur=e.b.duration;
    if(kind==='bark'){dur=Math.min(dur,Math.max(0.2,e.b.duration*0.45));const fo=Math.min(0.1,dur*0.4);g.gain.setValueAtTime(gain,t+dur-fo);g.gain.linearRampToValueAtTime(0.0001,t+dur)}
    s.connect(g);g.connect(d);const vs=SFX108.verb[kind];if(vs&&AUD.verb){const v=c.createGain();v.gain.value=vs;g.connect(v);v.connect(AUD.verb)}
    s.start(t,0,dur);SFX108.stats.sample++;SFX108.log.push({k:kind,f:K.key});if(SFX108.log.length>200)SFX108.log.shift();return true}catch(err){return false}}

if(SFX108.on){
  SND100_BOARD.axe=1;SND100_TRIM.axe=0;
  {const orig=snd100Fire;snd100Fire=function(base,kind,o){SFX108.base=base;return orig.apply(this,arguments)}}
  for(const k of [...SFX108_KEYS.filter(k=>!SFX108_VFILES.includes(k)),'growl','bark']){const synth=SND100_K[k];
    SND100_K[k]=function(d,t,o){if(sfx108Play(k,d,t,o))return;SFX108.stats.synth++;SFX108.log.push({k,f:''});if(SFX108.log.length>200)SFX108.log.shift();
      if(synth)synth(d,t,o);else if(k!=='axe'&&SFX108.base)SFX108.base.call(window,k)}}
  {const base=audInit;audInit=function(){const r=base.apply(this,arguments);try{if(r)sfx108Load()}catch(e){}return r}}
  if(AUD.ctx)sfx108Load();
  /* an Axe thrown: its own sound, the moment it leaves the hand (the doAttack that 55-anim also wraps for the flying picture) */
  {const base=doAttack;doAttack=async function(p,src,t,opt){try{if(src&&src.thr&&src.w&&src.w.key==='axe'&&!HEADLESS&&S&&!S.sim)sfx('axe',{own:snd100Own(p)})}catch(e){}
    return base.apply(this,arguments)}}
  /* Credits → the sound effects */
  {const base=creditsHTML;creditsHTML=function(){const h=base.apply(this,arguments);try{const li=SFX108_CREDITS.map(([k,n,a,l,id])=>`<li><b>${esc(k)}</b> “${esc(n)}” — ${esc(a)}, ${l} · <a href="https://freesound.org/s/${id}/" target="_blank" rel="noopener noreferrer">freesound.org/s/${id}</a></li>`).join('');
      return h+`<div class="crsfx"><h3>${_T('Sound effects')}</h3><p>${_T('Recorded effects from freesound.org (CC0 or CC BY 4.0), trimmed and levelled.')}</p><ul>${li}</ul></div>`}catch(e){return h}}}
  {const st=document.createElement('style');st.textContent='.crsfx{margin:14px 0 4px;font-size:.78rem;opacity:.9}.crsfx h3{margin:0 0 4px;font-size:.95rem}.crsfx p{margin:0 0 6px}.crsfx ul{margin:0;padding:0;list-style:none;columns:2 300px;column-gap:18px}.crsfx li{break-inside:avoid;margin:0 0 3px}.crsfx a{color:inherit;opacity:.8}';document.head.appendChild(st)}
}
