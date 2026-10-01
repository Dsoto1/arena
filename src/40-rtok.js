/* =====================================================================
   40-RTOK · THE ROUND TOKENS (v0.45)
   =====================================================================
   The printed game's round tokens, cut from the token sheets (Arena/NPC tokens, Arena tokens and the
   offering tokens — "item tokens" in earlier editions of the rulebook) into one sprite: assets/rtok.webp,
   8 × 4 tokens of 128 px. They now stand for:
   • offerings in a gladiator's hand (the weapon, armor and armor-upgrade tokens; the rest get a token
     struck in the same bronze ring),
   • the beasts in the Menagerie tracker, on hover cards and in the beast list,
   • the loading screens between modes: a Blessing token turning slowly in the dark. */
const RTOK_NAMES=['zora','leaena','chest','brutum','leo','ursa','valencia','spectator','glykon','moechus','arenosus','tholo','boar','commodus','eagle','blessing','key','spike','mw1','mw2','mw3','ma1','ma2','ma3','ap2','ap3','croc','water'];
const RTOK_COLS=8,RTOK_ROWS=4;
function rtokHTML(name,size=28,title=''){const i=RTOK_NAMES.indexOf(name);if(i<0)return '';const c=i%RTOK_COLS,r=Math.floor(i/RTOK_COLS);
  return `<span class="rtok" role="img" aria-label="${esc(title||name)}"${title?` title="${esc(title)}"`:''} style="width:${size}px;height:${size}px;background-image:url('${assetURL('rtok.webp')}');background-size:${RTOK_COLS*100}% ${RTOK_ROWS*100}%;background-position:${(c/(RTOK_COLS-1)*100).toFixed(3)}% ${(r/(RTOK_ROWS-1)*100).toFixed(3)}%"></span>`}
/* an offering's token: printed art where the sheets have it, otherwise the same ring around the offering's sign */
const OFFER_TOK={mw1:'mw1',mw2:'mw2',mw3:'mw3',ma1:'ma1',ma2:'ma2',ma3:'ma3',ap2:'ap2',ap3:'ap3',key:'key',eagle:'eagle'};
const OFFER_SIGN={elix2:'🧪',elix4:'🧪',spiders:'🕷',cf1:'👑',cf2:'👑',merc1:'🪽',merc2:'🪽',curse:'💀'};
function offerTokHTML(k,size=28){const O=typeof OFFER!=='undefined'?OFFER[k]:null;const t=O?`${O.n} · ${O.s}`:k;
  if(OFFER_TOK[k])return rtokHTML(OFFER_TOK[k],size,t);
  return `<span class="rtok rtokx" role="img" aria-label="${esc(t)}" title="${esc(t)}" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.46)}px">${OFFER_SIGN[k]||esc(O&&O.g||'?')}</span>`}
/* a beast's token: by its role on the sheet (the city names change, the tokens do not) */
const NPC_TOK={snake:['glykon','arenosus'],wolf:['valencia','moechus'],bear:['ursa','brutum'],lion:['leo','leaena'],commodus:['commodus'],tholo:['tholo'],zora:['zora'],boar:['boar'],croc:['croc'],crocodile:['croc']};
function npcTokName(n){if(!n)return null;const L=NPC_TOK[n.t];if(!L)return null;if(L.length===1)return L[0];
  // which of the pair: match the base role name, else the city's name for it, else alternate by id
  const roles={glykon:'Glykon',arenosus:'Arenosus',valencia:'Valencia',moechus:'Moechus',ursa:'Ursa',brutum:'Brutum',leo:'Leo',leaena:'Leaena'};
  for(const k of L){const R=roles[k];if(n.name===R||(typeof beastName==='function'&&n.name===beastName(R)))return k}
  return L[(n.id||0)%2]}
function npcTokHTML(n,size=28){const k=npcTokName(n);return k?rtokHTML(k,size,n.name):''}
