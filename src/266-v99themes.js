/* =====================================================================
   266-V99THEMES · ARENA THEMES THAT READ DIFFERENT (his note "All the arena themes look the same", pick 7a)
   =====================================================================
   Each of the 12 ARENA themes (Settings → Themes → Arenas, THEME_PRESETS loc1–loc12) gets its own UI PANEL palette
   (ink/panel/panel2/borders/text/accent/buttons) AND its own BOARD look (sand tiles, wall, tile lines, stand benches,
   pillars) AND its own stone (192 AR91MAT: the stone_wall filter + cap colour).
   - THEMES99.P[k] = {ui, board, mat}. The preset = ui + board + arena99:k; the Location flavour (LOC_THEMES, applied at
     event start over the player's own theme) = board + arena99:k only — panels stay the player's choice, and highlights,
     the target ring, health/armor/movement colours and class colours are NEVER touched (today's loc tints changed
     ring/hlPush/blood on some arenas; the proposal does not).
   - THEME.arena99 = the arena whose stone the board wears (ar91Mat wrapper; the ludus plaster stays first).
   - Accessibility themes (Red-green safe, Blue-yellow safe, High contrast), Arena (default), Flavius Rule and the Roman
     group are untouched.
   - APPROVED (his a, 2026-10-09): ON by default; kill switch localStorage flavius_themes99=0 (read once at load).
     Sheet: tools/plans/themes99/ (shot.js → sheet.png).
   ===================================================================== */
const THEMES99={on:false,OLD:{},P:{
  /* 1 · Syracusae — sea blue, pale cliff limestone */
  1:{ui:{ink:'#09121e',panel:'#0e1a2b',panel2:'#16263d',line2:'#2f4c72',bone:'#eaf1f8',muted:'#a6bad2',gold:'#7cc4f2',gold2:'#bfe4ff',blood:'#1f5296',blood2:'#ec6a56'},
     board:{tileA:'#e4dcc2',tileB:'#d3c8a8',rim:'#16304f',grid:'#456a92',standA:'#2f4562',standB:'#3d5778',pillar:'#f2f1ea',pillarBase:'#c3c7c6'},
     mat:{n:'Cliff limestone 99',f:'grayscale(.75) sepia(.25) hue-rotate(175deg) saturate(1.5) brightness(1.18) contrast(.6)',cap:'#d6dfe8'}},
  /* 2 · Verona — rose stone */
  2:{ui:{ink:'#1a0d11',panel:'#261419',panel2:'#371d25',line2:'#6c3d4a',bone:'#f9e8ea',muted:'#d6aab2',gold:'#f0a0ae',gold2:'#ffcad3',blood:'#9c2c48',blood2:'#f06a7c'},
     board:{tileA:'#e9c7b8',tileB:'#dbb3a2',rim:'#5a2634',grid:'#8e4e58',standA:'#6e3a46',standB:'#824a56',pillar:'#f4e0da',pillarBase:'#d2a9a2'},
     mat:{n:'Rose marble 99',f:'sepia(.55) saturate(2.1) hue-rotate(-38deg) brightness(1.08) contrast(.62)',cap:'#eab8b2'}},
  /* 3 · Arles — Gallic gold, honey stone */
  3:{ui:{ink:'#171108',panel:'#22190b',panel2:'#31240f',line2:'#6e5422',bone:'#fcf1d2',muted:'#d8c08a',gold:'#f4c63c',gold2:'#ffe27c',blood:'#8a5a0e',blood2:'#ec6a40'},
     board:{tileA:'#efd28e',tileB:'#e0bf72',rim:'#4c3810',grid:'#8e6c24',standA:'#6c5020',standB:'#82642c',pillar:'#f6e8c2',pillarBase:'#d2b97e'},
     mat:{n:'Honey gold 99',f:'sepia(.9) saturate(2.4) hue-rotate(0deg) brightness(1.06) contrast(.62)',cap:'#e8c47a'}},
  /* 4 · Capua — old blood: dark sand, dark red stone */
  4:{ui:{ink:'#120606',panel:'#1d0a09',panel2:'#2c1110',line2:'#64241f',bone:'#f6e2da',muted:'#d0a094',gold:'#ec9a68',gold2:'#ffc29a',blood:'#8e1a12',blood2:'#ff5e4c'},
     board:{tileA:'#bf9374',tileB:'#ae8264',rim:'#2c0c08',grid:'#5e2016',standA:'#4c1c16',standB:'#5e2820',pillar:'#ddcbc0',pillarBase:'#a68e82'},
     mat:{n:'Blood basalt 99',f:'grayscale(.55) sepia(.7) hue-rotate(-32deg) saturate(1.9) brightness(.56) contrast(.85)',cap:'#74382e'}},
  /* 5 · Thysdrus — desert amber */
  5:{ui:{ink:'#170e04',panel:'#231509',panel2:'#331f0d',line2:'#734618',bone:'#fcebd0',muted:'#dcb48a',gold:'#f5a432',gold2:'#ffcc74',blood:'#a24c14',blood2:'#f06440'},
     board:{tileA:'#f0bf74',tileB:'#e2aa5a',rim:'#5c300c',grid:'#9e5e1e',standA:'#7a481a',standB:'#905a24',pillar:'#f5ddb2',pillarBase:'#d4aa70'},
     mat:{n:'Desert amber 99',f:'sepia(.95) saturate(2.8) hue-rotate(-14deg) brightness(.88) contrast(.7)',cap:'#cc8c48'}},
  /* 6 · Roma — Colosseum: white travertine, imperial red benches, gold */
  6:{ui:{ink:'#131315',panel:'#1d1d20',panel2:'#2a292c',line2:'#5a5450',bone:'#f6f2ea',muted:'#c4bcb0',gold:'#e4b440',gold2:'#fbd87a',blood:'#9a1e1e',blood2:'#f0624e'},
     board:{tileA:'#e6dcc6',tileB:'#d8ccb2',rim:'#2e2a28',grid:'#7a6c58',standA:'#6e2620',standB:'#82302a',pillar:'#f3efe6',pillarBase:'#cbc4b6'},
     mat:{n:'Travertine 99',f:'grayscale(.55) sepia(.25) brightness(1.3) contrast(.52)',cap:'#efebe2'}},
  /* 7 · Nemausus — laurel green */
  7:{ui:{ink:'#0b1309',panel:'#111d0f',panel2:'#1a2a17',line2:'#3e5a34',bone:'#edf3e2',muted:'#acc29a',gold:'#b8d46c',gold2:'#dcf09e',blood:'#3c6a26',blood2:'#ec5e48'},
     board:{tileA:'#d6d2a6',tileB:'#c6c08e',rim:'#1c2e16',grid:'#4c6636',standA:'#3a4e2e',standB:'#4a623a',pillar:'#e8ead8',pillarBase:'#b4ba9c'},
     mat:{n:'Laurel stone 99',f:'grayscale(.5) sepia(.45) hue-rotate(52deg) saturate(1.3) brightness(.92) contrast(.66)',cap:'#a8b690'}},
  /* 8 · Pompeii — volcanic ash and cinnabar */
  8:{ui:{ink:'#19191b',panel:'#252427',panel2:'#2c2a2e',line2:'#665e5e',bone:'#f0ecea',muted:'#bbb2af',gold:'#f67e64',gold2:'#ffa892',blood:'#a8261a',blood2:'#ff7058'},
     board:{tileA:'#c6c0b6',tileB:'#b3aca1',rim:'#7a2014',grid:'#5c4a46',standA:'#4a4446',standB:'#5c5456',pillar:'#e6e1dc',pillarBase:'#aaa29c'},
     mat:{n:'Volcanic ash 99',f:'grayscale(1) brightness(.74) contrast(.78)',cap:'#8e8884'}},
  /* 9 · Leptis Magna — blazing white marble over pale desert sand */
  9:{ui:{ink:'#1b1a14',panel:'#28261e',panel2:'#2f2c22',line2:'#736a52',bone:'#fcf9f0',muted:'#d4cbb2',gold:'#ead69c',gold2:'#fff2c8',blood:'#7e6526',blood2:'#f47864'},
     board:{tileA:'#f3e8ca',tileB:'#e6d8b4',rim:'#6c604a',grid:'#ab966c',standA:'#b6ac96',standB:'#cac0a8',pillar:'#fcfaf3',pillarBase:'#dfd8c8'},
     mat:{n:'White marble 99',f:'grayscale(.95) brightness(1.4) contrast(.5)',cap:'#f2efe8',q:1}},
  /* 10 · Uthina — Punic dusk violet */
  10:{ui:{ink:'#130a17',panel:'#1d1024',panel2:'#2b1834',line2:'#5a3a6a',bone:'#f4e8f6',muted:'#c8aad2',gold:'#eeac70',gold2:'#ffd3a2',blood:'#782868',blood2:'#f06282'},
     board:{tileA:'#d8b49a',tileB:'#c8a286',rim:'#301632',grid:'#6c3c60',standA:'#4c2a4c',standB:'#5e365c',pillar:'#ecdee6',pillarBase:'#c0a8b8'},
     mat:{n:'Dusk sandstone 99',f:'sepia(.65) saturate(1.5) hue-rotate(-62deg) brightness(.82) contrast(.68)',cap:'#a87a94'}},
  /* 11 · Pola — Adriatic teal */
  11:{ui:{ink:'#061615',panel:'#0b211f',panel2:'#11312e',line2:'#2a5c56',bone:'#e6f5f2',muted:'#9cc6be',gold:'#56d6c4',gold2:'#a2f2e4',blood:'#176862',blood2:'#ee6a56'},
     board:{tileA:'#ded8c2',tileB:'#ccc5ab',rim:'#123c3a',grid:'#3e7672',standA:'#2c5250',standB:'#3a6462',pillar:'#eef2ec',pillarBase:'#bec6bc'},
     mat:{n:'Adriatic limestone 99',f:'grayscale(.6) sepia(.25) hue-rotate(118deg) saturate(1.2) brightness(1.18) contrast(.56)',cap:'#cde2dc'}},
  /* 12 · Puteoli — sulfur yellow on tuff */
  12:{ui:{ink:'#14130a',panel:'#1e1c0e',panel2:'#2b2812',line2:'#5e5822',bone:'#faf6d8',muted:'#d2c992',gold:'#ead63e',gold2:'#fff27e',blood:'#6e6410',blood2:'#ee6a3a'},
     board:{tileA:'#ded082',tileB:'#cebd66',rim:'#3c3610',grid:'#7c7024',standA:'#5a5420',standB:'#6e662a',pillar:'#eee8c4',pillarBase:'#c6bc84'},
     mat:{n:'Sulfur tuff 99',f:'sepia(.85) saturate(2.3) hue-rotate(16deg) brightness(1.02) contrast(.62)',cap:'#dccc66'}}}};
/* themes99On — the proposal is switched on in this browser */
function themes99On(){try{return localStorage.getItem('flavius_themes99')!=='0'}catch(e){return true}}
/* themes99Apply — swap the 12 arena presets, the location flavours and the stones (once, at load) */
function themes99Apply(){if(THEMES99.on)return;THEMES99.on=true;
  for(const [k,p] of Object.entries(THEMES99.P)){
    THEMES99.OLD[k]={loc:LOC_THEMES[k]&&LOC_THEMES[k].v,pre:THEME_PRESETS['loc'+k]&&THEME_PRESETS['loc'+k].v,mat:typeof AR91MAT!=='undefined'?AR91MAT[k]:null};
    if(LOC_THEMES[k])LOC_THEMES[k].v={...p.board,arena99:+k};
    if(THEME_PRESETS['loc'+k])THEME_PRESETS['loc'+k].v={...p.ui,...p.board,arena99:+k};
    if(typeof AR91MAT!=='undefined')AR91MAT[k]=p.mat}}
/* ar91Mat — the theme's own arena stone when it names one (the ludus plaster first) */
if(typeof ar91Mat==='function'){const base=ar91Mat;ar91Mat=function(){
  if(THEMES99.on&&!(typeof ar91Lud==='function'&&ar91Lud())){const k=typeof THEME!=='undefined'&&THEME&&THEME.arena99;if(k&&THEMES99.P[k])return THEMES99.P[k].mat}
  return base.apply(this,arguments)}}
if(themes99On())try{themes99Apply();
  /* a saved arena theme keeps its old colours until clicked again — refresh it to the proposal's when it is one of the 12 */
  const ut=typeof USER_THEME!=='undefined'&&USER_THEME;if(ut){for(const [k,o] of Object.entries(THEMES99.OLD)){const ov=o.pre;if(!ov)continue;
    const ks=Object.keys(ov).filter(x=>typeof ov[x]==='string');if(ks.length&&ks.every(x=>String(ut[x]||'').toLowerCase()===String(ov[x]).toLowerCase())){applyTheme({...THEME_PRESETS['loc'+k].v});break}}}
}catch(e){}
