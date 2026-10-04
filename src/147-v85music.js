/* =====================================================================
   147-v85music · v0.85 — a word for ALL the music, and a theme for Online
   =====================================================================
   1 · The music word of power is now five letters long (built from char codes — never in plain text): it unlocks
       every theme the game has (the twelve cities, the other themes and Online's). The old longer word is retired.
   2 · CONTRABANDUS — the Online theme (menus, rooms, the lobby; not during a bout): a smuggler's swagger over a
       trap beat. An original heroic brass line (big leaps up, a scrambling run down, a climb and a proud cadence,
       dotted pushes) in D major, 144 bpm half-time: 808 glides, hat rolls, a half-time clap, brass stabs on the
       downbeats; the bridge drops to the relative minor with strings and a snare build. Heard → listed in
       Settings → Audio under the other themes (AUD_WHERE: "open Online to hear it").
   ===================================================================== */
/* 1 · the word */
try{if(typeof CHEATS!=='undefined')delete CHEATS['h2501629703']}catch(e){}
if(typeof cheatRegister==='function'&&typeof cheatKey==='function'){const WM=String.fromCharCode(77,85,83,73,67);
  cheatRegister(cheatKey(WM),()=>{try{localStorage.setItem('flavius_musica','1')}catch(e){}try{const el=document.getElementById('audTracks');if(el&&typeof audListHTML==='function')el.innerHTML=audListHTML()}catch(e){}
    return '🎶 Every theme is yours — the twelve cities, the others and Online’s. Settings → Audio.'},'Every theme')}
try{if(typeof CHEAT_SHOW!=='undefined'){const i=CHEAT_SHOW.findIndex(r=>/themes in Settings/.test(r[1]));const row=[[84,92,90,80,74],'🎶 Every theme in Settings → Audio — the twelve cities, the other themes and Online’s'];if(i>=0)CHEAT_SHOW[i]=row;else CHEAT_SHOW.push(row)}}catch(e){}

/* 2 · CONTRABANDUS */
AUD_THEMES['Online']={root:50,mode:'ionian',bpm:144,prog:[0,0,3,4,0,5,3,4],bridge:[5,5,3,3,1,1,4,4],lead:'brass',fn:'contra',nm:'Contrabandus',sub:'the Online menus and rooms'};
AUD_EXTRA.push(['Online','Contrabandus']);AUD_WHERE.Online='open Online to hear it';
AUD_FN.contra=function(th,t,step,inten){const spb=60/th.bpm/2;const S9=audSect(step);const {bar,st}=S9;const B=S9.kind==='B';const chord=B?th.brProg[bar]:th.prog[bar];const d=AUD.music;const root=audMtof(th.deg(chord,-2));
  if(!B){
    /* brass stabs on the downbeat, a pickup stab before the phrase turns */
    if(st===0)for(const k of [0,2,4])audNote(d,t,audMtof(th.deg(chord+k,0)),spb*1.2,'sawtooth',0.022,{lp:2200,lpTo:900,a:0.01,r:0.12,verb:1});
    if(st===7&&bar%2===1)for(const k of [0,2,4])audNote(d,t,audMtof(th.deg(th.prog[(bar+1)%8]+k,0)),spb*0.5,'sawtooth',0.018,{lp:2000,a:0.005,r:0.06});
    /* the 808: root on 1, a push on the and-of-2, a glide up into the next bar */
    if(st===0)aud808(t,root,spb*2.6,0.36);if(st===3)aud808(t,root,spb*1.2,0.24);if(st===6&&bar%2===1)aud808(t,root*1.12,spb*1.6,0.26,root*1.5);
    /* half-time clap, hats with rolls */
    if(st===4)audClap(t);audHat(t,0.12);if(st%2===1)audHat(t+spb/2,0.08);
    if(bar%4===3&&st>=5)for(const k of [1,2,3])audHat(t+spb*k/4,0.07);if(bar%2===0&&st===7)audHat(t,0.08,true);
    /* the hero's line — original: leap up, scramble down, climb, proud cadence (dotted pushes) */
    const PH=[[0,null,null,4,null,null,7,null],[8,null,7,6,null,4,null,null],[3,null,null,5,null,7,null,8],[9,null,8,null,7,null,4,null]];
    const p=PH[bar%4][st];if(p!=null){const up=S9.kind==='A2'?1:0;audLeadNote('brass',d,t,audMtof(th.deg(p,1+up)),spb,st===0||st===6);
      if(S9.kind==='A2')audNote(d,t,audMtof(th.deg(p+2,1)),spb*0.9,'sawtooth',0.018,{lp:1600,a:0.02,r:0.1})}
  }else{
    /* the bridge: relative-minor strings, a lone flute, a snare build into the return */
    if(st===0)for(const k of [0,2,4])audNote(d,t,audMtof(th.deg(chord+k)),spb*8,'triangle',0.03,{a:0.4,r:0.7,lp:1100,verb:1});
    const m=th.brMel[bar][st];if(m!=null)audNote(d,t,audMtof(th.deg(m,1)),spb*2.2,'sine',0.055,{a:0.07,r:0.3,vib:1,verb:1,lp:1500});
    if(st===0&&bar%2===0)aud808(t,root,spb*6,0.2);if(st===4)audClap(t);
    if(bar>=5&&st%2===0)audNoise(d,t,0.06,0.05+0.025*(bar-5),{f:2100});if(bar>=6)audNoise(d,t+spb/2,0.05,0.07+0.03*(bar-6),{f:2400});if(bar===7&&st===0)audRiser(t,spb*8,0.13)}};
/* play it while the Online window is open and no bout is on */
{const base=audWant;audWant=function(){const w=base.apply(this,arguments);try{if(!AUD.manual&&!audLive()&&audVis('onl')&&!audVis('mgrBody')&&!audVis('hallBody')){audMarkHeard('Online');return 'Online'}}catch(e){}return w}}
