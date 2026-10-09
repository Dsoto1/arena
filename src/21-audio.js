/* =====================================================================
   21-AUDIO · v0.24 PROCEDURAL Music AND SOUND EFFECTS (Web Audio, no files)
   ---------------------------------------------------------------------
   Every arena gets its own theme, generated live from a small recipe:
   a key and a mode, a tempo, a chord loop, a pulsing low-string ostinato
   (the big-film pulse), soft square/triangle pads and a plucky lead (the
   blocky-game and 64-bit-era charm), timpani and taiko on the big beats.
   Intensity climbs with the rounds. Settings → Audio turns it all off.
   ===================================================================== */
/* AUD — the audio engine state: context, gain nodes (master, music, sfx, fade), reverb, the step clock and the playing theme. */
const AUD={ctx:null,master:null,music:null,sfx:null,verb:null,timer:null,step:0,next:0,loc:null,theme:null,playing:false};
const AUD_DEF={on:true,music:true,sfx:true,mvol:0.32,svol:0.55,menu:true}; // v0.29: music between events is on by default
// v0.29: music between events turns on once for everyone (older saves stored it off); switch it off again in Settings → Audio
/* one-time switch: music between events turns on for older saves (v0.29). */
setTimeout(()=>{try{if(typeof SETTINGS!=='undefined'&&SETTINGS.audio&&!SETTINGS.audio.m29){SETTINGS.audio={...SETTINGS.audio,menu:true,m29:1};if(typeof applySettings==='function')applySettings()}}catch(e){}},400);
/* audSet — the audio settings with their defaults. */
function audSet(){return {...AUD_DEF,...((typeof SETTINGS!=='undefined'&&SETTINGS.audio)||{})}}
/* audInit — creates the Web Audio graph once (master, music through a fade stage, sfx, a generated reverb hall). */
function audInit(){if(AUD.ctx||HEADLESS)return AUD.ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  try{const c=new AC();AUD.ctx=c;AUD.master=c.createGain();AUD.master.connect(c.destination);AUD.music=c.createGain();AUD.sfx=c.createGain();
    // a small generated hall: decaying stereo audNoise as the impulse response
    const len=c.sampleRate*2.2,ir=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    AUD.verb=c.createConvolver();AUD.verb.buffer=ir;const wet=c.createGain();wet.gain.value=0.28;AUD.verb.connect(wet);wet.connect(AUD.master);
    AUD.fade=c.createGain();AUD.fade.gain.value=0;AUD.music.connect(AUD.fade);AUD.fade.connect(AUD.master);AUD.sfx.connect(AUD.master);audApplyVol()}catch(e){AUD.ctx=null}return AUD.ctx} // v0.36: music runs through a fade stage — never a hard start or stop
/* audApplyVol — applies mute and the music / effects volumes. */
function audApplyVol(){if(!AUD.ctx)return;const a=audSet();AUD.master.gain.value=a.on?1:0;AUD.music.gain.value=a.music?a.mvol:0;AUD.sfx.gain.value=a.sfx?a.svol:0}
// browsers start audio only after a real gesture — and Safari is the strictest of them:
// it wants the context created AND resumed AND a (silent) sound actually played inside that gesture,
// it counts click/touchend more reliably than pointerdown, and it can sit in an 'interrupted' state.
function audUnlock(){if(HEADLESS)return;const a=audSet();if(!a.on)return;if(!audInit())return;const c=AUD.ctx;
  try{if(c.state!=='running')c.resume()}catch(e){}
  if(!AUD.unlocked){try{const b=c.createBuffer(1,1,22050);const s2=c.createBufferSource();s2.buffer=b;s2.connect(c.destination);s2.start(0);AUD.unlocked=true}catch(e){}}
  audApplyVol();audTick()}
/* any first gesture unlocks audio. */
for(const ev of ['pointerdown','touchend','click','keydown'])document.addEventListener(ev,audUnlock,{passive:true,capture:true});
/* resume the audio context when the tab becomes visible again. */
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&AUD.ctx&&AUD.ctx.state!=='running'&&audSet().on)try{AUD.ctx.resume()}catch(e){}
  /* v0.91: going hidden fills the 3 s buffer at once; coming back schedules right away (no wait for the next tick) */
  try{if(AUD.timer&&AUD.pump)AUD.pump()}catch(e){}});

/* ---------- the arena themes ---------- */
/* AUD_MODES — scale steps of each musical mode. */
const AUD_MODES={aeolian:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],mixolydian:[0,2,4,5,7,9,10],harmonic:[0,2,3,5,7,8,11],lydian:[0,2,4,6,7,9,11]};
// root (MIDI), mode, bpm, chord degrees (8 bars), lead flavour
const AUD_THEMES={
  'Roma':{root:50,mode:'aeolian',bpm:92,prog:[0,5,2,6,0,3,4,4],lead:'brass'},
  'Capua':{root:52,mode:'dorian',bpm:100,prog:[0,3,0,6,0,3,4,6],lead:'pluck'},
  'Pompeii':{root:45,mode:'phrygian',bpm:84,prog:[0,1,0,6,0,1,5,4],lead:'brass'},
  'Syracusae':{root:53,mode:'mixolydian',bpm:104,prog:[0,6,3,0,0,6,4,4],lead:'flute'},
  'Verona':{root:55,mode:'dorian',bpm:96,prog:[0,6,5,6,0,3,4,0],lead:'flute'},
  'Arles':{root:48,mode:'lydian',bpm:88,prog:[0,1,0,4,0,1,4,4],lead:'pluck'},
  'Thysdrus':{root:51,mode:'harmonic',bpm:98,prog:[0,5,6,4,0,5,3,4],lead:'reed'},
  'Nemausus':{root:49,mode:'aeolian',bpm:90,prog:[0,3,6,2,0,3,4,4],lead:'reed'},
  'Leptis Magna':{root:47,mode:'harmonic',bpm:102,prog:[0,1,4,0,0,5,4,4],lead:'reed'},
  'Uthina':{root:54,mode:'phrygian',bpm:94,prog:[0,6,5,1,0,6,5,4],lead:'pluck'},
  'Pola':{root:46,mode:'dorian',bpm:86,prog:[0,3,4,0,5,3,4,4],lead:'flute'},
  'Puteoli':{root:56,mode:'mixolydian',bpm:108,prog:[0,3,6,3,0,4,6,4],lead:'pluck'},
  'Finale':{root:45,mode:'harmonic',bpm:150,prog:[0,5,3,4,0,5,6,4],lead:'boss',boss:1}}; // v0.42: the final round's own theme
/* audMtof — MIDI note number → frequency (Hz). */
const audMtof=midi=>440*Math.pow(2,(midi-69)/12);
/* audTheme — an arena's theme: its recipe plus a fixed 8-bar melody seeded from the city name. */
function audTheme(locName){const T=AUD_THEMES[locName]||AUD_THEMES.Roma;const sc=AUD_MODES[T.mode];const deg=(d,oct=0)=>T.root+sc[((d%7)+7)%7]+12*(Math.floor(d/7)+oct);
  // a fixed melody per arena, seeded from its name, so each city is recognisable
  let h=0;for(const ch of locName||_T('Roma'))h=(h*31+ch.charCodeAt(0))>>>0;const R=()=>{h=(h*1103515245+12345)>>>0;return h/4294967296};
  const mel=[];for(let bar=0;bar<8;bar++){const row=[];for(let st=0;st<8;st++){const hit=st===0||(R()<(st%2?0.28:0.5));row.push(hit?(T.prog[bar]+[0,2,4,7,4,2,1,5][Math.floor(R()*8)]):null)}mel.push(row)}
  return {...T,sc,deg,mel,name:locName}}
/* audNote — plays one synthesized note (oscillator, envelope, optional bend / vibrato / low-pass / reverb). */
function audNote(dest,time,freq,dur,type='sine',vol=0.2,opt={}){const c=AUD.ctx;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);
  if(opt.bend)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*opt.bend),time+dur);if(opt.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.5;lg.gain.value=freq*0.012;l.connect(lg);lg.connect(o.frequency);l.start(time);l.stop(time+dur+0.1)}
  let node=o;if(opt.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(opt.lp,time);if(opt.lpTo)f.frequency.exponentialRampToValueAtTime(opt.lpTo,time+dur);o.connect(f);node=f}
  const a=opt.a||0.01,r=opt.r||0.08;g.gain.setValueAtTime(0.0001,time);g.gain.linearRampToValueAtTime(vol,time+a);g.gain.setValueAtTime(vol,time+Math.max(a,dur-r));g.gain.exponentialRampToValueAtTime(0.0001,time+dur+r);
  node.connect(g);g.connect(dest);if(opt.verb&&AUD.verb)g.connect(AUD.verb);o.start(time);o.stop(time+dur+r+0.05)}
/* audNoise — plays a burst of filtered noise. */
function audNoise(dest,time,dur,vol=0.2,opt={}){const c=AUD.ctx;const b=c.createBuffer(1,Math.ceil(c.sampleRate*dur),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type=opt.type||'bandpass';f.frequency.value=opt.f||1200;f.Q.value=opt.q||0.8;const g=c.createGain();g.gain.setValueAtTime(vol,time);g.gain.exponentialRampToValueAtTime(0.0001,time+dur);
  s.connect(f);f.connect(g);g.connect(dest);if(opt.verb&&AUD.verb)g.connect(AUD.verb);s.start(time);s.stop(time+dur)}
/* audDrum — a drum hit: timpani, taiko or a tick. */
function audDrum(time,kind,vol=0.5){const d=AUD.music;if(kind==='timp'){audNote(d,time,110,0.5,'sine',vol,{bend:0.55,r:0.3,verb:1});audNoise(d,time,0.12,vol*0.25,{f:300})}
  else if(kind==='taiko'){audNote(d,time,70,0.35,'sine',vol,{bend:0.5,r:0.25,verb:1});audNoise(d,time,0.08,vol*0.4,{f:180,type:'lowpass'})}
  else if(kind==='tick'){audNoise(d,time,0.04,vol*0.25,{f:6000,type:'highpass'})}}
/* audStep — one eighth-note step of a theme: string ostinato, pads on the bar, the lead, percussion — fuller as intensity (0–2) rises. */
function audStep(theme,time,step,intensity){if(theme.boss)return audBossStep(theme,time,step);const spb=60/theme.bpm/2;const bar=Math.floor(step/8)%8,st=step%8;const chord=theme.prog[bar];const d=AUD.music;
  // ostinato: pulsing low strings (saw through a closing filter)
  if(st%1===0)audNote(d,time,audMtof(theme.deg(chord,-1)),spb*0.9,'sawtooth',0.07+0.02*intensity,{lp:420+intensity*260,lpTo:260,a:0.005,r:0.05});
  if(st===0){ // pads: the chord, soft and wide
    for(const k of [0,2,4])audNote(d,time,audMtof(theme.deg(chord+k)),spb*8,'triangle',0.045,{a:0.35,r:0.6,verb:1});
    audNote(d,time,audMtof(theme.deg(chord,1)),spb*8,'square',0.012,{a:0.5,r:0.6,lp:1400,verb:1})}
  // lead: sparse and plucky, fuller as the event heats up
  const m=theme.mel[bar][st];if(m!=null&&(intensity>=1||st%2===0||bar%2===1)){const lf=theme.lead;const f=audMtof(theme.deg(m,1));
    if(lf==='brass')audNote(d,time,f,spb*1.6,'sawtooth',0.05,{lp:1800,lpTo:900,a:0.04,r:0.12,vib:1,verb:1});
    else if(lf==='flute')audNote(d,time,f*2,spb*1.5,'sine',0.06,{a:0.05,r:0.15,vib:1,verb:1});
    else if(lf==='reed')audNote(d,time,f,spb*1.4,'square',0.035,{lp:1500,a:0.03,r:0.1,vib:1,verb:1});
    else audNote(d,time,f*2,spb*0.9,'square',0.04,{lp:2600,lpTo:700,a:0.003,r:0.18,verb:1})}
  // percussion
  if(st===0&&bar%2===0)audDrum(time,'timp',0.45);if(intensity>=1&&(st===4))audDrum(time,'taiko',0.35);if(intensity>=2&&st%2===1)audDrum(time,'tick',0.5);if(intensity>=2&&st===6&&bar%2===1)audDrum(time,'taiko',0.3)}
/* v0.36 THE PLAYLIST: between events (the main menu included) every city theme plays in order, ~2 minutes
   each, crossfading into the next. During an event the arena's own theme plays. Settings → Audio lists every
   track with play / pause / restart; everything fades in and out, gently. */
/* AUD_TRACKS — the playlist: [city, track name]. */
const AUD_TRACKS=[[_T('Roma'),_T('Ave Imperator')],[_T('Capua'),_T('The School of Batiatus')],[_T('Pompeii'),_T('Under the Mountain')],[_T('Syracusae'),_T('Harbor of Archimedes')],[_T('Verona'),_T('The Rose Stone')],[_T('Arles'),_T('Dusk on the Rhône')],
  [_T('Thysdrus'),_T('Olive Gold')],[_T('Nemausus'),_T('The Crocodile Coin')],[_T('Leptis Magna'),_T('Sea Gate of Severus')],[_T('Uthina'),_T('Dunes and Drums')],[_T('Pola'),_T('The White Amphitheatre')],[_T('Puteoli'),_T('Sulphur Harbor')]];
/* TRACK_STEPS — steps a playlist track runs before the next one (~2 minutes). TWEAK: the 384. */
const TRACK_STEPS=384;
AUD.pl=0;AUD.manual=null;AUD.paused=false;AUD.switching=false;
/* audFadeTo — ramps the music fade stage to a level over sec seconds. */
function audFadeTo(level,sec){if(!AUD.ctx||!AUD.fade)return;const g=AUD.fade.gain,t=AUD.ctx.currentTime;try{g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(level,t+sec)}catch(e){g.value=level}}
/* audLive — true while an event is on the sand. */
function audLive(){return typeof S!=='undefined'&&S&&!S.over&&S.phase!=='setup'}
function audWant(){ // which track should be playing right now
  if(AUD.manual)return AUD.manual;
  if(audFinalOn())return _T('Finale'); // v0.42: the last round of a classic
  if(audLive()&&LOCATIONS[S.locIdx])return LOCATIONS[S.locIdx].n;
  {const t=AUD_TRACKS[AUD.pl%AUD_TRACKS.length][0];return musicUnlocked(t)?t:_T('Roma')}}
/* audSwitch — crossfades to another theme (the Finale starts with its sting). */
function audSwitch(name,fast){AUD.switching=true;audFadeTo(0,fast?0.5:1.4);
  setTimeout(()=>{if(!AUD.ctx)return;AUD.theme=audTheme(name);AUD.loc=name;AUD.step=AUD.seek||0;AUD.seek=0;AUD.next=AUD.ctx.currentTime+0.1;AUD.switching=false;
    if(name==='Finale'){audFadeTo(1,0.3);audBossSting(AUD.ctx.currentTime+0.05);AUD.next=AUD.ctx.currentTime+3.5}else if(AUD.playing)audFadeTo(1,2.2);audListRefresh()},fast?520:1450)}
/* audTick — starts or keeps the music going: the scheduler runs every 100 ms (1 s lookahead), follows audWant(), moves the playlist on and stops when muted or not wanted. */
function audTick(){const a=audSet();if(HEADLESS||!AUD.ctx||!a.on||!a.music||AUD.paused){audStop();return}
  const live=audLive();if(!live&&!a.menu&&!AUD.manual){audStop();return}
  const want=audWant();
  if(!AUD.theme){AUD.theme=audTheme(want);AUD.loc=want;AUD.step=AUD.seek||0;AUD.seek=0;AUD.next=AUD.ctx.currentTime+0.1;audFadeTo(1,2.5)}
  else if(!AUD.playing)audFadeTo(1,2.5);
  AUD.playing=true;if(!AUD.timer)AUD.timer=setInterval(AUD.pump=()=>{if(!AUD.ctx||!AUD.playing)return;const live2=audLive();const a2=audSet();
      if(!a2.on||!a2.music||AUD.paused||(!live2&&!a2.menu&&!AUD.manual)){audStop();return}
      if(typeof SPEED!=='undefined'&&SPEED==='pause'&&live2&&typeof MODAL_PAUSE!=='undefined'&&MODAL_PAUSE!=null&&!AUD.manual&&!document.getElementById('audTracks'))return; /* v0.49: the Audio settings play while open */
      if(AUD.switching)return;
      const want2=audWant();if(want2!==AUD.loc){audSwitch(want2);return}
      // the playlist moves on when a track has run its course (never during an event's own theme)
      if(!live2&&AUD.step>=TRACK_STEPS){let nx=AUD_TRACKS.findIndex(x=>x[0]===AUD.loc);for(let k=0;k<AUD_TRACKS.length;k++){nx=(nx+1)%AUD_TRACKS.length;if(musicUnlocked(AUD_TRACKS[nx][0]))break}AUD.pl=nx;if(AUD.manual)AUD.manual=AUD_TRACKS[AUD.pl][0];audSwitch(audWant());return}
      const inten=live2?Math.min(2,S.ri||0)+(typeof activePlayers==='function'&&activePlayers().length<=2?1:0):0;const spb=60/AUD.theme.bpm/2;
      /* v0.51: a throttled background tab never replays its backlog in a burst. v0.87 (choppy on Mac Safari): skip ahead only when the
         tab was hidden or the timer fell more than half a second behind; notes are scheduled 1 s ahead (was 0.25 s) on a 100 ms timer,
         so a busy frame on the main thread no longer opens gaps in the music */
      /* v0.91 (choppy after switching Mac desktops/windows): a hidden page's timers fire about once a second, so it schedules 3 s ahead
         (1 s while visible); a scheduler that fell behind restarts just ahead of now instead of firing the missed notes in a burst */
      if(AUD.next<AUD.ctx.currentTime)AUD.next=AUD.ctx.currentTime+0.05;
      while(AUD.next<AUD.ctx.currentTime+((document.hidden||(typeof RZ99!=='undefined'&&Date.now()-RZ99.t<1500))?3.0:1.0)){audStep(AUD.theme,AUD.next,AUD.step,Math.min(2,inten));AUD.step++;AUD.next+=spb}},100);
  audListRefresh()}
/* audStop — fades the music out and stops the scheduler. */
function audStop(){const was=AUD.playing;AUD.playing=false;if(was)audFadeTo(0,1.1);
  setTimeout(()=>{if(AUD.playing)return;if(AUD.timer){clearInterval(AUD.timer);AUD.timer=null}if(!AUD.paused){AUD.theme=null;AUD.loc=null}},was?1150:0);audListRefresh()}
// track controls (Settings → Audio)
/* audPlayTrack — plays a track from Settings → Audio (locked tracks refuse). */
function audPlayTrack(name){if(!musicUnlocked(name)){if(typeof mToast==='function')mToast(_T`🔒 Win at ${esc(name)} to unlock its theme.`);return}audUnlock();AUD.paused=false;AUD.manual=name;AUD.pl=Math.max(0,AUD_TRACKS.findIndex(x=>x[0]===name));
  if(AUD.theme&&AUD.loc===name&&!AUD.playing){audTick();return} // resume where it paused
  if(AUD.theme&&AUD.playing)audSwitch(name,true);else{AUD.theme=null;audTick()}}
/* audPauseTrack — pauses the music. */
function audPauseTrack(){AUD.paused=true;audStop()}
/* audRestartTrack — restarts a track from the top. */
function audRestartTrack(name){if(!musicUnlocked(name))return;audUnlock();AUD.paused=false;AUD.manual=name;AUD.pl=Math.max(0,AUD_TRACKS.findIndex(x=>x[0]===name));if(AUD.theme&&AUD.playing)audSwitch(name,true);else{AUD.theme=null;audTick()}}
/* v0.43: each city's theme is heard in its own arena, but joins your playlist only once a human has won there
   (Roma's is yours from the start). A word of power unlocks all twelve. */
function musicUnlocked(city){if(city==='Roma')return true;try{if(localStorage.getItem('flavius_musica')==='1')return true}catch(e){}const li=LOCATIONS.findIndex(L=>L&&L.n===city);return typeof HALL_LOCS!=='undefined'&&HALL_LOCS.includes(li)}
/* audListHTML — the track list in Settings → Audio. */
function audListHTML(){const cur=AUD.loc;return `<div class="tracklist">${AUD_TRACKS.map(([city,nm],i)=>{if(!musicUnlocked(city))return `<div class="trackrow locked"><span class="n">${String(i+1).padStart(2,'0')}</span><span><b>🔒 ${esc(nm)}</b><br><span class="rc-sub">${_T`win an event at <b>${esc(city)}</b> with a gladiator of your own to unlock`}</span></span><span class="seg"><button type="button" disabled>🔒</button></span></div>`;const on=cur===city&&AUD.playing;const paused=cur===city&&AUD.paused;
    return `<div class="trackrow ${on?'on':''}"><span class="n">${String(i+1).padStart(2,'0')}</span><span><b>${esc(nm)}</b><br><span class="rc-sub">${_T`${esc(city)} · ${AUD_THEMES[city].mode} · ${AUD_THEMES[city].bpm} bpm <b class="trst" style="color:var(--gold2)">${on?_T('♪ now playing'):paused?_T('paused'):''}</b>`}</span></span>
      <span class="seg"><button type="button" data-trk="${on?'pause':'play'}" data-city="${esc(city)}" title="${on?_T('Pause'):_T('Play')}">${on?'❚❚':'▶'}</button><button type="button" data-trk="restart" data-city="${esc(city)}" title="${_T`Restart from the top`}">↺</button></span></div>`}).join('')}</div>`}
// update the rows IN PLACE — never replace a button a click is landing on
function audListRefresh(){const el=document.getElementById('audTracks');if(!el)return;const rows=el.querySelectorAll('.trackrow');if(rows.length!==AUD_TRACKS.length){el.innerHTML=audListHTML();return}
  AUD_TRACKS.forEach(([city],i)=>{const row=rows[i];const on=AUD.loc===city&&AUD.playing;const paused=AUD.loc===city&&AUD.paused;row.classList.toggle('on',on);
    const b=row.querySelector('[data-trk="play"],[data-trk="pause"]');if(b){const want=on?'pause':'play';if(b.dataset.trk!==want){b.dataset.trk=want;b.textContent=on?'❚❚':'▶';b.title=on?_T('Pause'):_T('Play')}}
    const st=row.querySelector('.trst');if(st){const t=on?_T('♪ now playing'):paused?'paused':'';if(st.textContent!==t)st.textContent=t}})}
/* track list play / pause / restart buttons. */
document.addEventListener('click',e=>{const b=e.target.closest('[data-trk]');if(!b)return;const c=b.dataset.city;
  if(b.dataset.trk==='play')audPlayTrack(c);else if(b.dataset.trk==='pause')audPauseTrack();else audRestartTrack(c);setTimeout(audListRefresh,80)});
/* every 1.5 s, restarts the music if it should be playing. */
setInterval(()=>{if(!HEADLESS&&AUD.ctx&&audSet().on&&!AUD.playing)audTick()},1500);

/* ---------- sound effects ---------- */
/* sfx — plays a sound effect by name (hit, bighit, block, whoosh, coin, cf, card, death, cheer, fanfare, click, horn). */
function sfx(kind){const a=audSet();if(HEADLESS||!a.on||!a.sfx)return;if(!audInit())return;const c=AUD.ctx;if(c.state!=='running')return;const t=c.currentTime+0.01,d=AUD.sfx;
  switch(kind){
    case 'hit':audNoise(d,t,0.12,0.5,{f:900,q:0.6});audNote(d,t,120,0.12,'square',0.18,{bend:0.5,lp:900});break;
    case 'bighit':audNoise(d,t,0.25,0.6,{f:500,q:0.5,verb:1});audNote(d,t,90,0.3,'sawtooth',0.25,{bend:0.4,lp:700,verb:1});break;
    case 'block':audNote(d,t,660,0.08,'square',0.12,{lp:3000});audNote(d,t+0.03,990,0.1,'triangle',0.1);break;
    case 'whoosh':audNoise(d,t,0.25,0.3,{f:2400,q:0.4,type:'bandpass'});break;
    case 'coin':audNote(d,t,988,0.07,'square',0.1,{lp:4000});audNote(d,t+0.07,1319,0.16,'square',0.1,{lp:4000});break;
    case 'cf':audNote(d,t,523,0.1,'triangle',0.12);audNote(d,t+0.08,659,0.1,'triangle',0.12);audNote(d,t+0.16,784,0.2,'triangle',0.12,{verb:1});break;
    case 'card':audNoise(d,t,0.14,0.25,{f:3500,q:1.5});audNote(d,t+0.05,1400,0.05,'sine',0.05);break;
    case 'death':audNote(d,t,220,0.9,'sawtooth',0.18,{bend:0.35,lp:900,lpTo:200,a:0.02,r:0.4,verb:1});audNoise(d,t,0.6,0.2,{f:200,type:'lowpass',verb:1});break;
    case 'cheer':audNoise(d,t,1.1,0.18,{f:1600,q:0.3,verb:1});break;
    case 'fanfare':[0,4,7,12].forEach((s,i)=>audNote(d,t+i*0.14,audMtof(62+s),i===3?0.7:0.16,'sawtooth',0.12,{lp:2200,a:0.02,r:0.2,vib:i===3?1:0,verb:1}));break;
    case 'click':audNote(d,t,1200,0.03,'square',0.05,{lp:5000});break;
    case 'horn':{ /* v0.45: a Roman cornu — one long blast, then two quick ones rising (the "burr … burr-burr" of the games) */
      const blast=(t0,f,dur,v)=>{audNote(d,t0,f*0.985,dur,'sawtooth',v,{lp:900,lpTo:1700,a:0.05,r:0.12,vib:1,verb:1});audNote(d,t0,f/2,dur,'square',v*0.45,{lp:600,a:0.06,r:0.12,verb:1});audNote(d,t0,f*2,dur*0.9,'sawtooth',v*0.18,{lp:2400,a:0.08,r:0.1});audNoise(d,t0,0.09,0.06,{f:500,q:0.7})};
      blast(t,196,0.62,0.16);blast(t+0.78,196,0.2,0.14);blast(t+1.02,262,0.75,0.17);break}}}
/* any "Sound the horns" button, wherever it is, sounds them */
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&(b.id==='goBtn'||b.id==='cityBell'||/Sound the horns/i.test(b.dataset.en84||b.textContent||'')))setTimeout(()=>{try{sfx('horn')}catch(err){}},30)},true);

/* v0.25: the speaker button on the main bar mutes everything (same switch as Settings → Audio → Sound) */
function audMuteUI(){const b=document.getElementById('btnMute');if(!b)return;const on=audSet().on;b.textContent=on?'🔊':'🔇';b.classList.toggle('muted',!on);b.title=on?_T('Mute all sound (M)'):_T('Sound is muted — click to unmute (M)')}
/* audToggleMute — mutes / unmutes all sound (button or M). */
function audToggleMute(){SETTINGS.audio={...audSet(),on:!audSet().on};if(typeof applySettings==='function')applySettings();if(audSet().on){audInit();if(AUD.ctx&&AUD.ctx.state==='suspended')AUD.ctx.resume();audApplyVol();audTick()}else{audApplyVol();audStop()}audMuteUI()}
/* the speaker button. */
document.addEventListener('click',e=>{if(e.target.closest('#btnMute'))audToggleMute()});
/* M toggles mute (not while typing). */
document.addEventListener('keydown',e=>{if((e.key==='m'||e.key==='M')&&!e.target.closest('input,textarea,select')&&!e.ctrlKey&&!e.metaKey)audToggleMute()});
setTimeout(audMuteUI,300);

/* ================= v0.42 THE FINAL ROUND =================
   When a classic event reaches its last round the arena's theme gives way to an original boss theme:
   a sting first (a rising drone, two great orchestral hits, a riser), then a driving loop — pumping
   chip bass, a racing arpeggio, a heroic square lead and a full kit. */
/* FINAL_EVS — the classic events that get the boss theme in their last round. */
const FINAL_EVS=/^(democritus|egidious|cassian)$/;
/* audFinalOn — true in the last round of a classic, or any 5×5 duel (zone 3). */
function audFinalOn(){try{return audLive()&&!isChariot()&&!isNaum()&&((FINAL_EVS.test(S.evKey||'')&&EV().rounds&&S.ri>=EV().rounds.length-1)||RD().zone===3)}catch(e){return false}} /* v0.46: any 5×5 duel gets the boss theme */
/* audStab — a big orchestral stab chord at a root note. */
function audStab(time,root,vol=0.12){const d=AUD.music;for(const k of [0,3,7,12])for(const det of [-6,6]){const c=AUD.ctx;const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(audMtof(root+k),time);o.detune.value=det;f.type='lowpass';f.frequency.setValueAtTime(3200,time);f.frequency.exponentialRampToValueAtTime(500,time+0.9);
    g.gain.setValueAtTime(0.0001,time);g.gain.linearRampToValueAtTime(vol/4,time+0.01);g.gain.exponentialRampToValueAtTime(0.0001,time+1.1);o.connect(f);f.connect(g);g.connect(d);if(AUD.verb)g.connect(AUD.verb);o.start(time);o.stop(time+1.2)}
  audNote(d,time,audMtof(root-24),1.1,'sine',0.35,{bend:0.6,r:0.4});audNoise(d,time,0.6,0.22,{f:900,verb:1})}
/* audBossSting — the Finale's opening sting: a swelling drone, two stabs and a noise riser. */
function audBossSting(time){const d=AUD.music;const R=45;
  audNote(d,time,audMtof(R-12),1.6,'sawtooth',0.001,{a:1.2,lp:300,lpTo:2400,r:0.2}); // the drone, swelling
  for(let i=0;i<3;i++)audNote(d,time+i*0.02,audMtof(R-12+i*0.08),1.5,'sawtooth',0.05,{a:1.3,lp:250,lpTo:2600,r:0.15});
  audStab(time+1.5,R+3,0.14);audStab(time+2.05,R,0.16); // DUN — DUN
  const c=AUD.ctx;const b=c.createBuffer(1,Math.ceil(c.sampleRate*1.2),c.sampleRate),dd=b.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=(Math.random()*2-1)*(i/dd.length);
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(400,time+2.3);f.frequency.exponentialRampToValueAtTime(7000,time+3.4);const g=c.createGain();g.gain.value=0.16;s.connect(f);f.connect(g);g.connect(d);s.start(time+2.3);s.stop(time+3.5)}
/* audBossStep — one step of the boss loop: chip bass, arpeggio, the lead phrase and a full kit. */
function audBossStep(theme,time,step){const spb=60/theme.bpm/2;const bar=Math.floor(step/8)%8,st=step%8;const chord=theme.prog[bar];const d=AUD.music;
  // pumping chip bass: root / octave on every eighth
  audNote(d,time,audMtof(theme.deg(chord,-1)+(st%2?12:0)),spb*0.8,'square',0.05,{lp:900,a:0.003,r:0.03});
  // racing arpeggio, sixteenths
  const arp=[0,2,4,7];for(const h of [0,1]){const n=arp[(st*2+h)%4];audNote(d,time+h*spb/2,audMtof(theme.deg(chord+ (n===7?7:n),1)),spb*0.42,'triangle',0.035,{a:0.002,r:0.03})}
  // the heroic lead: a fixed phrase per two bars, square with vibrato, and a held note at each phrase end
  const PH=[[0,null,2,4,null,4,5,4],[7,null,6,4,null,2,4,null],[0,null,2,4,null,7,9,7],[8,null,7,6,null,4,6,null]];const ph=PH[bar%4][st];
  if(ph!=null)audNote(d,time,audMtof(theme.deg(chord+ph,1)),spb*(st===7?1.8:0.95),'square',0.04,{lp:3200,a:0.01,r:0.08,vib:1,verb:1});
  if(st===0&&bar%4===0)audStab(time,theme.deg(chord),0.06);
  // the kit: kick on 1 and 3, snare on 2 and 4, hats on every eighth, a fill every fourth bar
  if(st===0||st===4)audDrum(time,'taiko',0.5);if(st===2||st===6)audNoise(d,time,0.14,0.2,{f:1800,q:0.6});audDrum(time,'tick',0.55);
  if(bar%4===3&&st>=6)audNoise(d,time+spb/2,0.08,0.16,{f:2400})}
