/* =====================================================================
   147-v85music · v0.85 — a word for ALL the music, and a theme for Online
   =====================================================================
   1 · The music word of power is now five letters long (built from char codes — never in plain text): it unlocks
       every theme the game has (the twelve cities, the other themes and Online's). The old longer word is retired.
   2 · CONTRABANDUS — the Online theme (menus, rooms, the lobby; not during a bout): classic trap with floaty EDM
       (his pick after the first take): E minor, 140 bpm half-time — sliding 808, rolling hats, clap on 3, a sparse
       bell hook; a pumping detuned pad, an airy echoed arpeggio, shimmer and sweeps; the bridge drops the drums. Heard → listed in
       Settings → Audio under the other themes (AUD_WHERE: "open Online to hear it").
   ===================================================================== */
/* 1 · the word */
try{if(typeof CHEATS!=='undefined')delete CHEATS['h2501629703']}catch(e){}
if(typeof cheatRegister==='function'&&typeof cheatKey==='function'){const WM=String.fromCharCode(77,85,83,73,67);
  cheatRegister(cheatKey(WM),()=>{try{localStorage.setItem('flavius_musica','1')}catch(e){}try{const el=document.getElementById('audTracks');if(el&&typeof audListHTML==='function')el.innerHTML=audListHTML()}catch(e){}
    return '🎶 Every theme is yours — the twelve cities, the others and Online’s. Settings → Audio.'},'Every theme')}
try{if(typeof CHEAT_SHOW!=='undefined'){const i=CHEAT_SHOW.findIndex(r=>/themes in Settings/.test(r[1]));const row=[[84,92,90,80,74],'🎶 Every theme in Settings → Audio — the twelve cities, the other themes and Online’s'];if(i>=0)CHEAT_SHOW[i]=row;else CHEAT_SHOW.push(row)}}catch(e){}

/* 2 · CONTRABANDUS */
AUD_THEMES['Online']={root:52,mode:'aeolian',bpm:140,prog:[0,0,5,5,3,3,6,4],bridge:[5,5,3,3,0,0,6,6],lead:'pluck',fn:'contra',nm:'Contrabandus',sub:'the Online menus and rooms'};
AUD_EXTRA.push(['Online','Contrabandus']);AUD_WHERE.Online='open Online to hear it';
/* CONTRABANDUS (v0.85 take 2) — classic trap + floaty EDM: E minor, 140 bpm half-time. Trap: a sliding 808 (glides into the
   next root), rolling hats (triplet and 1/32 rolls), clap on 3, a sparse bell/pluck hook. EDM float: a wide detuned pad that
   PUMPS (each 8th note swells in after the kick, like sidechain), an airy arpeggio with a soft echo, shimmer an octave up,
   a white-noise sweep into each section; the bridge drops the drums for pad + arp + a long rise back in. */
function contraPad85(d,t,f,len,vol){for(const k of [0.994,1,1.006])audNote(d,t,f*k,len,'sawtooth',vol,{lp:1400,lpTo:700,a:len*0.55,r:len*0.35,verb:1})}
AUD_FN.contra=function(th,t,step,inten){const spb=60/th.bpm/2;const S9=audSect(step);const {bar,st}=S9;const B=S9.kind==='B';const chord=B?th.brProg[bar]:th.prog[bar];const d=AUD.music;
  const root=audMtof(th.deg(chord,-2)),nextRoot=audMtof(th.deg((B?th.brProg:th.prog)[(bar+1)%8],-2));
  /* the floaty pad: every 8th note re-swells (the pump); thinner on the bridge's first half */
  const padV=B?(bar<4?0.008:0.011):0.012;for(const k of [0,2,4])contraPad85(d,t,audMtof(th.deg(chord+k,0)),spb*0.95,padV);
  /* the airy arpeggio: up the chord and back, an octave up, with a quieter echo a dotted-8th later */
  const AR=[0,2,4,7,4,2,4,7];const af=audMtof(th.deg(chord+AR[st],1));audNote(d,t,af,spb*0.9,'triangle',0.022,{a:0.005,r:0.25,verb:1,lp:3200});audNote(d,t+spb*1.5,af,spb*0.9,'triangle',0.009,{a:0.005,r:0.3,verb:1,lp:2600});
  if(st===0&&bar%2===0)audNote(d,t,audMtof(th.deg(chord+4,2)),spb*7,'sine',0.012,{a:spb*3,r:spb*2,vib:1,verb:1}); /* shimmer */
  if(!B||bar>=6){
    /* the 808: hit on 1, a ghost on the and-of-2, slides into the next bar's root on bars 2 and 4 */
    if(st===0)aud808(t,root,spb*(bar%2?2.2:3.6),0.38,bar%2===1?null:null);if(st===3&&bar%2===0)aud808(t,root,spb*1.1,0.24);
    if(st===6&&bar%2===1)aud808(t,root,spb*1.9,0.3,nextRoot);
    /* clap on 3 (half-time), hats with rolls */
    if(st===4)audClap(t);audHat(t,0.11);if(st%2===1)audHat(t+spb/2,0.07);
    if(bar%2===1&&st===5)for(const k of [1,2])audHat(t+spb*k/3,0.07);if(bar%4===3&&st>=6)for(const k of [1,2,3])audHat(t+spb*k/4,0.06);if(bar%4===1&&st===7)audHat(t,0.08,true);
    /* the hook: a sparse bell — four notes a bar at most, answered an octave up in A′ */
    const HK=[[4,null,null,3,null,null,0,null],[null,null,2,null,3,null,null,null],[4,null,null,3,null,null,7,null],[6,null,4,null,3,null,0,null]];const h=HK[bar%4][st];
    if(h!=null&&!B){const f=audMtof(th.deg(chord*0+h,1+(S9.kind==='A2'?1:0)));audNote(d,t,f,spb*1.8,'triangle',0.05,{a:0.002,r:0.5,verb:1,lp:4000});audNote(d,t,f*2,spb*1.2,'sine',0.02,{a:0.002,r:0.4,verb:1})}
  }
  if(B&&bar>=4&&st%2===0)audNoise(d,t,0.05,0.04+0.02*(bar-4),{f:2600});if(B&&bar===6&&st===0)audRiser(t,spb*16,0.12);
  if(!B&&S9.last&&st===0)audRiser(t,spb*8,0.08)};
/* play it while the Online window is open and no bout is on */
{const base=audWant;audWant=function(){const w=base.apply(this,arguments);try{if(!AUD.manual&&!audLive()&&audVis('onl')&&!audVis('mgrBody')&&!audVis('hallBody')){audMarkHeard('Online');return 'Online'}}catch(e){}return w}}
