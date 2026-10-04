/* =====================================================================
   147-v85music · v0.85 — a word for ALL the music, and a theme for Online
   =====================================================================
   1 · The music word of power is now five letters long (built from char codes — never in plain text): it unlocks
       every theme the game has (the twelve cities, the other themes and Online's). The old longer word is retired.
   2 · VIAE IMPERII — the Online theme (menus, rooms, the lobby; not during a bout), made like the city themes (his
       pick after two trap takes): the game's own form and generator, D dorian, 100 bpm, brass lead.
   3 · Music in bouts (his call): Play Now keeps its random pick (64-v54), Manager keeps the host city's theme, and an
       ONLINE match draws one at random from ALL the arena themes and the other themes (unlocked or not — the room
       is shared) except the Online menu theme itself; the final duel keeps its boss theme. Heard → listed in
       Settings → Audio under the other themes (AUD_WHERE: "open Online to hear it").
   ===================================================================== */
/* 1 · the word */
try{if(typeof CHEATS!=='undefined')delete CHEATS['h2501629703']}catch(e){}
if(typeof cheatRegister==='function'&&typeof cheatKey==='function'){const WM=String.fromCharCode(77,85,83,73,67);
  cheatRegister(cheatKey(WM),()=>{try{localStorage.setItem('flavius_musica','1')}catch(e){}try{const el=document.getElementById('audTracks');if(el&&typeof audListHTML==='function')el.innerHTML=audListHTML()}catch(e){}
    return '🎶 Every theme is yours — the twelve cities and all the others. Settings → Audio.'},'Every theme')}
try{if(typeof CHEAT_SHOW!=='undefined'){const i=CHEAT_SHOW.findIndex(r=>/themes in Settings/.test(r[1]));const row=[[84,92,90,80,74],'🎶 Every theme in Settings → Audio — the twelve cities and all the others'];if(i>=0)CHEAT_SHOW[i]=row;else CHEAT_SHOW.push(row)}}catch(e){}

/* 2 · CONTRABANDUS */
/* VIAE IMPERII (take 3, his pick: "like the next track on the list") — a theme in the same mould as the city themes: no
   special generator, the game's own A · A′ · bridge · A with a melody and bridge seeded from its name. D dorian, 100 bpm,
   a brass lead (the bridge hands it to the flute). */
AUD_THEMES['Online']={root:50,mode:'dorian',bpm:100,prog:[0,6,3,4,0,6,5,4],lead:'brass',nm:'Viae Imperii',sub:'the Online menus and rooms'};
AUD_EXTRA.push(['Online','Viae Imperii']);AUD_WHERE.Online='open Online to hear it';
/* play it while the Online window is open and no bout is on */
{const base=audWant;audWant=function(){const w=base.apply(this,arguments);try{if(!AUD.manual&&!audLive()&&audVis('onl')&&!audVis('mgrBody')&&!audVis('hallBody')){audMarkHeard('Online');return 'Online'}}catch(e){}return w}}

/* 3 · an online bout: a random theme from all of them (never the menu's own) */
{const base=audWant;audWant=function(){try{if(!AUD.manual&&typeof audLive==='function'&&audLive()&&S&&S.onl&&!audFinalOn()&&!(typeof audSuperbusOn==='function'&&audSuperbusOn())){
  if(!S.musicPick85){const all=[...AUD_TRACKS,...AUD_EXTRA].map(x=>x[0]).filter(k=>k!=='Online'&&AUD_THEMES[k]&&!AUD_THEMES[k].boss);S.musicPick85=all[Math.floor(Math.random()*all.length)]||'Roma'}return S.musicPick85}}catch(e){}return base.apply(this,arguments)}}
