/* =====================================================================
   45-Music · BRIDGES, AND FOUR NEW THEMES (v0.47)
   =====================================================================
   Every song now has a FORM instead of one 8-bar loop played over and over:
       A  → A′ (the melody answered, an octave or a third away, busier drums)
       → B  (a BRIDGE: its own chord progression and melody, a different lead voice, half-time drums,
             and a fill that throws you back in) → A
   Each city's bridge is seeded from its name like its melody, so every arena's bridge is its own — and any
   theme added later gets one the same way (audTheme builds it). The boss theme gets a breakdown bridge.
   New themes (Settings → Audio lists them under "The other themes"):
     • Manager — Ludus Trap: a Roman gladiator trap beat (808 glides, hat rolls, harmonic-minor horns), while
       the Manager window is open
     • Annals — Fasti Consulares: slow and regal (harp, horns, strings, bells), while the Annals are open
     • Superbus — Palma Superba: the championship anthem, for the Flavius Superbus
     • Special — Ludi Extraordinarii: for special events (system or your own) and Play Now tournaments
   ===================================================================== */
AUD_MODES.ionian=[0,2,4,5,7,9,11];
Object.assign(AUD_THEMES,{
  'Manager':{root:45,mode:'harmonic',bpm:140,prog:[0,0,5,5,3,3,4,4],lead:'brass',fn:'trap',nm:'Ludus Trap',sub:_T('while the Manager window is open')},
  'Annals':{root:50,mode:'ionian',bpm:66,prog:[0,3,4,0,5,3,1,4],lead:'brass',fn:'regal',nm:'Fasti Consulares',sub:_T('while the Annals are open')},
  'Superbus':{root:50,mode:'aeolian',bpm:124,prog:[0,5,2,6,0,5,3,4],lead:'brass',fn:'anthem',nm:'Palma Superba',sub:_T('the Flavius Superbus')},
  'Special':{root:52,mode:'mixolydian',bpm:112,prog:[0,6,3,0,0,6,4,4],lead:'reed',fn:'festive',nm:'Ludi Extraordinarii',sub:_T('special events and Play Now tournaments')}});
const AUD_EXTRA=/* i18n:skip — theme keys */['Manager','Annals','Superbus','Special'].map(k=>[k,AUD_THEMES[k].nm]);
const AUD_BRIDGES=[[3,4,5,4,3,4,6,6],[5,3,6,4,5,3,4,4],[2,5,3,6,2,5,4,4],[3,1,4,6,3,1,4,4],[5,6,3,4,5,6,1,4]];
/* the form: which section a step falls in, and how far into it */
const audSect=step=>{const s=Math.floor(step/64)%4;return {s,kind:s===2?'B':s===1?'A2':'A',bar:Math.floor(step/8)%8,st:step%8,last:(step%64)>=56}};
{const _th=audTheme;audTheme=function(name){const th=_th(name);let h=7;for(const ch of (name||_T('Roma'))+'·bridge')h=(h*33+ch.charCodeAt(0))>>>0;const R=()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296};
  th.brProg=th.bridge||(()=>{const b=[...AUD_BRIDGES[h%AUD_BRIDGES.length]];b[1]=[1,2,5,6][(h>>>4)%4];b[5]=[2,3,5,6][(h>>>7)%4];b[2]=[3,4,5,6][(h>>>10)%4];return b})(); /* each theme's bridge is its own */
  /* the bridge melody: fewer, longer notes that climb, then fall back toward the tonic */
  th.brMel=[];for(let bar=0;bar<8;bar++){const row=Array(8).fill(null);const c=th.brProg[bar];row[0]=c+[0,2,4,7][Math.floor(R()*4)];if(R()<0.7)row[3]=c+[2,4,5][Math.floor(R()*3)];if(R()<0.55)row[6]=c+[4,5,7,9][Math.floor(R()*4)];th.brMel.push(row)}
  th.brLead={brass:'flute',flute:'reed',reed:'brass',pluck:'flute',boss:'boss'}[th.lead]||'flute';return th}}
function audLeadNote(lf,d,t,f,spb,long){
  if(lf==='brass')audNote(d,t,f,spb*(long?3:1.6),'sawtooth',0.05,{lp:1800,lpTo:900,a:0.04,r:0.14,vib:1,verb:1});
  else if(lf==='flute')audNote(d,t,f*2,spb*(long?3:1.5),'sine',0.06,{a:0.05,r:0.18,vib:1,verb:1});
  else if(lf==='reed')audNote(d,t,f,spb*(long?2.6:1.4),'square',0.035,{lp:1500,a:0.03,r:0.12,vib:1,verb:1});
  else audNote(d,t,f*2,spb*0.9,'square',0.04,{lp:2600,lpTo:700,a:0.003,r:0.18,verb:1})}
function audRiser(t,dur,vol=0.12){const c=AUD.ctx;const b=c.createBuffer(1,Math.ceil(c.sampleRate*dur),c.sampleRate),dd=b.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=(Math.random()*2-1)*(i/dd.length);
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(6000,t+dur);const g=c.createGain();g.gain.value=vol;s.connect(f);f.connect(g);g.connect(AUD.music);s.start(t);s.stop(t+dur)}
/* the city themes, now in A · A′ · bridge · A */
audStep=function(th,t,step,inten){if(th.fn&&AUD_FN[th.fn])return AUD_FN[th.fn](th,t,step,inten);if(th.boss)return audBossStep(th,t,step);
  const spb=60/th.bpm/2;const S9=audSect(step);const {bar,st}=S9;const B=S9.kind==='B';const chord=B?th.brProg[bar]:th.prog[bar];const d=AUD.music;
  if(!B||st%2===0)audNote(d,t,audMtof(th.deg(chord,-1)),spb*(B?1.8:0.9),'sawtooth',0.07+0.02*inten,{lp:(B?340:420)+inten*260,lpTo:260,a:0.005,r:0.05});
  if(st===0){for(const k of [0,2,4])audNote(d,t,audMtof(th.deg(chord+k)),spb*8,'triangle',B?0.055:0.045,{a:B?0.6:0.35,r:0.7,verb:1});
    audNote(d,t,audMtof(th.deg(chord,1)),spb*8,'square',B?0.018:0.012,{a:0.5,r:0.6,lp:B?900:1400,verb:1})}
  if(B){const m=th.brMel[bar][st];if(m!=null)audLeadNote(th.brLead,d,t,audMtof(th.deg(m,1)),spb,true);
    if(st%2===1)audNote(d,t,audMtof(th.deg(chord+[0,2,4,7][(st>>1)%4],1))*2,spb*0.5,'sine',0.022,{a:0.003,r:0.2,verb:1}); /* a soft harp under the bridge */
    if(st===0&&bar%2===0)audDrum(t,'timp',0.38);if(st===4&&bar%2===1)audDrum(t,'taiko',0.22);
    if(S9.last){audDrum(t,'taiko',0.18+0.05*(st%4));if(st===4)audRiser(t,spb*4,0.1)}return}
  const m0=th.mel[bar][st];const A2=S9.kind==='A2';
  const m=m0!=null?m0+(A2&&bar%2===1?2:0):(A2&&st===5&&bar%2===0?th.prog[bar]+4:null);
  if(m!=null&&(inten>=1||st%2===0||bar%2===1||A2)){audLeadNote(th.lead,d,t,audMtof(th.deg(m,A2&&bar>=4?2:1)),spb,false)}
  if(st===0&&bar%2===0)audDrum(t,'timp',0.45);if((inten>=1||A2)&&st===4)audDrum(t,'taiko',0.35);if((inten>=2||A2)&&st%2===1)audDrum(t,'tick',0.5);if(inten>=2&&st===6&&bar%2===1)audDrum(t,'taiko',0.3);
  if(A2&&S9.last&&st>=6)audDrum(t,'taiko',0.25)};
/* the boss theme: its bridge is a breakdown — no kick, the arpeggio alone, then the build */
{const _bs=audBossStep;audBossStep=function(th,t,step){const S9=audSect(step);if(S9.kind!=='B')return _bs(th,t,step);const spb=60/th.bpm/2;const {bar,st}=S9;const chord=th.brProg[bar];const d=AUD.music;
  const arp=[0,2,4,7];audNote(d,t,audMtof(th.deg(chord+arp[st%4],1)),spb*0.9,'triangle',0.04,{a:0.004,r:0.06,verb:1});
  if(st===0)for(const k of [0,2,4])audNote(d,t,audMtof(th.deg(chord+k)),spb*8,'sawtooth',0.02,{a:0.8,lp:700,lpTo:2400,r:0.5,verb:1});
  if(bar>=4)audDrum(t,'tick',0.3+0.05*(bar-4));if(bar>=6&&st%2===0)audNoise(d,t,0.1,0.12+0.03*(bar-6),{f:1800});if(bar===7&&st===0)audRiser(t,spb*8,0.14)}}

/* ---------- the new themes ---------- */
function aud808(t,f,dur,vol=0.34,glide){const c=AUD.ctx,o=c.createOscillator(),g=c.createGain(),sh=c.createWaveShaper();const cv=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cv[i]=Math.tanh(2.2*x)}sh.curve=cv;
  o.type='sine';o.frequency.setValueAtTime(f*2.6,t);o.frequency.exponentialRampToValueAtTime(f,t+0.05);if(glide)o.frequency.exponentialRampToValueAtTime(glide,t+dur*0.8);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(sh);sh.connect(g);g.connect(AUD.music);o.start(t);o.stop(t+dur+0.05)}
const audHat=(t,v=0.16,open)=>audNoise(AUD.music,t,open?0.18:0.035,v,{f:open?7000:9000,type:'highpass'});
const audClap=(t,v=0.24)=>{for(const o of [0,0.012,0.024])audNoise(AUD.music,t+o,0.14,v,{f:1500,q:0.7,verb:o===0.024})};
const AUD_FN={
  /* LUDUS TRAP — 140, half-time: 808 on the one with glides, the clap on three, hats in 8ths with 16th and triplet rolls,
     harmonic-minor horns trading with a lyre pluck; the bridge drops the 808 and builds on a snare roll */
  trap(th,t,step,inten){const spb=60/th.bpm/2;const S9=audSect(step);const {bar,st}=S9;const B=S9.kind==='B';const chord=B?th.brProg[bar]:th.prog[bar];const d=AUD.music;const root=audMtof(th.deg(chord,-2));
    if(st===0)for(const k of [0,2,4])audNote(d,t,audMtof(th.deg(chord+k)),spb*8,'triangle',0.03,{a:0.3,r:0.6,lp:1200,verb:1});
    if(!B){if(st===0)aud808(t,root,spb*3.4,0.36,bar%2===1?root*0.94:null);if(st===3&&bar%2===0)aud808(t,root,spb*1.4,0.26);if(st===5&&bar%4===3)aud808(t,root*1.19,spb*1.8,0.26,root);
      if(st===4)audClap(t);
      audHat(t,0.13);if(st===6||st===7){audHat(t+spb/2,0.1)}if(bar%4===3&&st>=4){for(const k of [1,2])audHat(t+spb*k/3,0.08)}if(st===7&&bar%2===1)audHat(t,0.08,true);
      const PH=[[0,null,null,2,null,4,null,null],[null,null,5,4,null,2,null,1],[0,null,null,7,null,6,4,null],[4,null,2,null,1,null,0,null]];const p=PH[bar%4][st];
      if(p!=null&&(S9.kind==='A2'||bar<4))audLeadNote('brass',d,t,audMtof(th.deg(chord+p,1)),spb,false);
      else if(p!=null)audNote(d,t,audMtof(th.deg(chord+p,2)),spb*0.7,'triangle',0.05,{a:0.002,r:0.25,verb:1}); /* the lyre answers */
    }else{const m=th.brMel[bar][st];if(m!=null)audNote(d,t,audMtof(th.deg(m,1)),spb*2.4,'sine',0.06,{a:0.08,r:0.3,vib:1,verb:1,lp:1400});
      if(st===0&&bar%2===0)aud808(t,root,spb*6,0.18);if(bar>=4&&st%2===0)audNoise(d,t,0.07,0.06+0.02*(bar-4),{f:2000});if(bar>=6)audNoise(d,t+spb/2,0.06,0.08+0.03*(bar-6),{f:2200});if(bar===7&&st===0)audRiser(t,spb*8,0.13)}},
  /* FASTI CONSULARES — 66, regal: sustained strings, harp arpeggios, a slow horn line, bells at each phrase, timpani rolls;
     the bridge turns to the relative minor and lets the harp sing alone */
  regal(th,t,step,inten){const spb=60/th.bpm/2;const S9=audSect(step);const {bar,st}=S9;const B=S9.kind==='B';const chord=B?[5,3,6,4,5,1,3,4][bar]:th.prog[bar];const d=AUD.music;
    if(st===0){for(const k of [0,2,4])audNote(d,t,audMtof(th.deg(chord+k)),spb*8.2,'sawtooth',0.018,{a:0.9,r:1.2,lp:900,verb:1});audNote(d,t,audMtof(th.deg(chord,-1)),spb*8,'triangle',0.06,{a:0.4,r:0.8,verb:1})}
    audNote(d,t,audMtof(th.deg(chord+[0,2,4,7,9,7,4,2][st],1)),spb*1.6,'sine',B?0.05:0.035,{a:0.003,r:0.6,verb:1});
    if(!B){const HN=[[0,null,null,null,2,null,4,null],[4,null,null,null,5,null,null,null],[7,null,null,6,4,null,null,null],[5,null,4,null,2,null,null,null]];const h=HN[bar%4][st];
      if(h!=null)audNote(d,t,audMtof(th.deg(chord+h+(S9.kind==='A2'&&bar>=4?2:0),0)),spb*3.2,'sawtooth',0.045,{lp:1300,lpTo:800,a:0.12,r:0.3,vib:1,verb:1});
      if(st===0&&bar%4===0)audNote(d,t,audMtof(th.deg(chord,3)),spb*6,'sine',0.03,{a:0.002,r:1.4,verb:1});}
    if(st===7&&bar%2===1)for(let k=0;k<4;k++)audDrum(t+k*spb/4,'timp',0.12+k*0.04);if(st===0&&bar%4===0)audDrum(t,'timp',0.35)},
  /* PALMA SUPERBA — 124, the championship: taiko on every beat, snare pickups, a brass choir, a soaring lead; the bridge
     is a choir swell, and the last chorus lifts a whole step */
  anthem(th,t,step,inten){const spb=60/th.bpm/2;const S9=audSect(step);const {bar,st}=S9;const B=S9.kind==='B';const lift=S9.s===3?2:0;const chord=B?th.brProg[bar]:th.prog[bar];const d=AUD.music;const deg=(x,o)=>th.deg(x,o)+lift;
    if(st===0)for(const k of [0,2,4])for(const dt of [-8,8]){audNote(d,t,audMtof(deg(chord+k))*Math.pow(2,dt/1200),spb*8,'sawtooth',0.016,{a:B?1.2:0.2,lp:B?1800:2600,r:0.6,verb:1})}
    audNote(d,t,audMtof(deg(chord,-1)),spb*0.85,'sawtooth',0.06,{lp:600,a:0.004,r:0.05});
    if(!B){if(st%2===0)audDrum(t,'taiko',0.42);if(st===2||st===6)audNoise(d,t,0.16,0.2,{f:1900,q:0.6});audDrum(t,'tick',0.45);if(bar%4===3&&st>=6)for(let k=0;k<3;k++)audNoise(d,t+k*spb/3,0.07,0.14,{f:2100});
      if(st===0&&bar%2===0)audNoise(d,t,0.9,0.1,{f:5000,type:'highpass',verb:1});
      const L=[[0,null,4,null,7,null,6,4],[5,null,4,null,2,null,null,null],[0,null,4,null,7,null,9,7],[8,null,7,null,6,4,null,null]];const p=L[bar%4][st];
      if(p!=null)audNote(d,t,audMtof(deg(chord+p,1)),spb*(st>=6?1.8:1.1),'square',0.045,{lp:3000,a:0.01,r:0.1,vib:1,verb:1});if(st===0&&bar%4===0)audStab(t,deg(chord),0.07)}
    else{const m=th.brMel[bar][st];if(m!=null)audNote(d,t,audMtof(deg(m,1)),spb*3,'triangle',0.06,{a:0.2,r:0.5,vib:1,verb:1});if(st===0)audDrum(t,'timp',0.3+0.04*bar);if(bar===7&&st===0)audRiser(t,spb*8,0.15)}},
  /* LUDI EXTRAORDINARII — 112, festive: frame drum and tambourine, a reed tune with a flute answering; the bridge is a
     call and response over hand claps */
  festive(th,t,step,inten){const spb=60/th.bpm/2;const S9=audSect(step);const {bar,st}=S9;const B=S9.kind==='B';const chord=B?th.brProg[bar]:th.prog[bar];const d=AUD.music;
    if(st===0)for(const k of [0,2,4])audNote(d,t,audMtof(th.deg(chord+k)),spb*8,'triangle',0.035,{a:0.3,r:0.5,verb:1});
    if([0,3,6].includes(st))audNote(d,t,audMtof(th.deg(chord,-1)),spb*1.2,'triangle',0.09,{a:0.003,r:0.1});
    if([0,3,4,6].includes(st)){audNote(d,t,st===0?90:140,0.18,'sine',st===0?0.32:0.2,{bend:0.6,r:0.12});audNoise(d,t,0.06,0.12,{f:400})}
    audNoise(d,t,0.05,0.07,{f:8500,type:'highpass'});if(st%2===1)audNoise(d,t+spb/2,0.04,0.05,{f:9000,type:'highpass'});
    if(!B){const m=th.mel[bar][st];if(m!=null)audLeadNote(S9.kind==='A2'&&bar%2===1?'flute':'reed',d,t,audMtof(th.deg(m+(S9.kind==='A2'?2:0),1)),spb,false)}
    else{const call=bar%2===0;const m=th.brMel[bar][st];if(m!=null)audLeadNote(call?'reed':'flute',d,t,audMtof(th.deg(m,1)),spb,true);if(st===2||st===6)audClap(t,0.18);if(bar===7&&st===4)audRiser(t,spb*4,0.1)}}};

/* which theme should play now: the Superbus, the final duel, special events, the arena — or, between events, the
   Manager window, the Annals, or the playlist */
const audVis=id=>{const e=document.getElementById(id);const m=document.getElementById('modal');return !!e&&!!m&&!m.hidden};
function audSuperbusOn(){try{if(!audLive()||!S.specCtx)return false;const w=typeof W_==='function'?W_():null;return !!(w&&w.special&&w.special.D&&w.special.D.finale)}catch(e){return false}}
function audSpecialOn(){try{return audLive()&&!!(S.specCtx||S.tourn)&&!audSuperbusOn()}catch(e){return false}}
audWant=function(){if(AUD.manual)return AUD.manual;
  if(audSuperbusOn())return _T('Superbus');if(audFinalOn())return _T('Finale');if(audSpecialOn())return _T('Special');
  if(audLive()&&LOCATIONS[S.locIdx])return LOCATIONS[S.locIdx].n;
  if(audVis('mgrBody'))return _T('Manager');if(audVis('hallBody'))return _T('Annals');
  {const t=AUD_TRACKS[AUD.pl%AUD_TRACKS.length][0];return musicUnlocked(t)?t:_T('Roma')}};
{const _mu=musicUnlocked;musicUnlocked=function(n){return AUD_THEMES[n]&&AUD_THEMES[n].fn?true:_mu(n)}}
/* Settings → Audio: the other themes listed under the cities */
{const _lh=audListHTML;audListHTML=function(){const cur=AUD.loc;const base=_lh();
  return base.replace(/<\/div>$/,'')+`<div class="rc-sub" style="margin:8px 0 2px;font:600 10.5px var(--mono);letter-spacing:.1em">${_T`THE OTHER THEMES`}</div>${AUD_EXTRA.map(([k,nm],i)=>{const on=cur===k&&AUD.playing;const paused=cur===k&&AUD.paused;const T=AUD_THEMES[k];
    return `<div class="trackrow ${on?'on':''}"><span class="n">${String(AUD_TRACKS.length+i+1).padStart(2,'0')}</span><span><b>${esc(nm)}</b><br><span class="rc-sub">${_T`${esc(T.sub)} · ${T.bpm} bpm <b class="trst" style="color:var(--gold2)">${on?_T('♪ now playing'):paused?_T('paused'):''}</b>`}</span></span>
      <span class="seg"><button type="button" data-trk="${on?'pause':'play'}" data-city="${k}" title="${on?_T('Pause'):_T('Play')}">${on?'❚❚':'▶'}</button><button type="button" data-trk="restart" data-city="${k}" title="${_T`Restart from the top`}">↺</button></span></div>`}).join('')}</div>`}}
audListRefresh=function(){const el=document.getElementById('audTracks');if(!el)return;const ALL=[...AUD_TRACKS,...AUD_EXTRA];const rows=el.querySelectorAll('.trackrow');if(rows.length!==ALL.length){el.innerHTML=audListHTML();return}
  ALL.forEach(([city],i)=>{const row=rows[i];const on=AUD.loc===city&&AUD.playing;const paused=AUD.loc===city&&AUD.paused;row.classList.toggle('on',on);
    const b=row.querySelector('[data-trk="play"],[data-trk="pause"]');if(b){const want=on?'pause':'play';if(b.dataset.trk!==want){b.dataset.trk=want;b.textContent=on?'❚❚':'▶';b.title=on?_T('Pause'):_T('Play')}}
    const st=row.querySelector('.trst');if(st){const t=on?_T('♪ now playing'):paused?'paused':'';if(st.textContent!==t)st.textContent=t}})};
