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
/* RTOK_NAMES — the sprite's cells in reading order (row by row, RTOK_COLS a row); a token's index = its cell. */
const RTOK_NAMES=['zora','leaena','chest','brutum','leo','ursa','valencia','spectator','glykon','moechus','arenosus','tholo','boar','commodus','eagle','blessing','key','spike','mw1','mw2','mw3','ma1','ma2','ma3','ap2','ap3','croc','water',
  'elix2','elix4','spiders','cf1','cf2','merc1','merc2','curse','key2']; /* v0.57: the fifth row, cut from Virgilante's offering-token and chariot scans (tools/mkscans.py) */
/* RTOK_COLS/RTOK_ROWS — the sprite grid of assets/rtok.webp (8 × 5). */
const RTOK_COLS=8,RTOK_ROWS=5;
/* rtokHTML — a round token by name as a sized <span> showing its sprite cell ('' for an unknown name); title → tooltip + aria label. TWEAK: default 28 px. */
function rtokHTML(name,size=28,title=''){const i=RTOK_NAMES.indexOf(name);if(i<0)return '';const c=i%RTOK_COLS,r=Math.floor(i/RTOK_COLS);
  return `<span class="rtok" role="img" aria-label="${esc(title||name)}"${title?` title="${esc(title)}"`:''} style="width:${size}px;height:${size}px;background-image:url('${assetURL('rtok.webp')}');background-size:${RTOK_COLS*100}% ${RTOK_ROWS*100}%;background-position:${(c/(RTOK_COLS-1)*100).toFixed(3)}% ${(r/(RTOK_ROWS-1)*100).toFixed(3)}%"></span>`}
/* an offering's token: printed art where the sheets have it, otherwise the same ring around the offering's sign */
/* OFFER_TOK — offering key → its printed token cell. */
const OFFER_TOK={mw1:'mw1',mw2:'mw2',mw3:'mw3',ma1:'ma1',ma2:'ma2',ma3:'ma3',ap2:'ap2',ap3:'ap3',key:'key',eagle:'eagle',elix2:'elix2',elix4:'elix4',spiders:'spiders',cf1:'cf1',cf2:'cf2',merc1:'merc1',merc2:'merc2',curse:'curse'};
/* OFFER_SIGN — the sign struck in a plain ring for offerings without a printed token. */
const OFFER_SIGN={elix2:'🧪',elix4:'🧪',spiders:'🕷',cf1:'👑',cf2:'👑',merc1:'🪽',merc2:'🪽',curse:'💀'};
/* offerTokHTML — an offering's token (printed cell, else a ring with its sign), titled with the offering's name and effect. */
function offerTokHTML(key,size=28){const O=typeof OFFER!=='undefined'?OFFER[key]:null;const t=O?`${O.n} · ${O.s}`:key;
  if(OFFER_TOK[key])return rtokHTML(OFFER_TOK[key],size,t);
  return `<span class="rtok rtokx" role="img" aria-label="${esc(t)}" title="${esc(t)}" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.46)}px">${OFFER_SIGN[key]||esc(O&&O.g||'?')}</span>`}
/* a beast's token: by its role on the sheet (the city names change, the tokens do not) */
/* NPC_TOK — beast type → its token cell(s); paired kinds (snake, wolf, bear, lion) have two tokens. */
const NPC_TOK={snake:['glykon','arenosus'],wolf:['valencia','moechus'],bear:['ursa','brutum'],lion:['leo','leaena'],commodus:['commodus'],tholo:['tholo'],zora:['zora'],boar:['boar'],croc:['croc'],crocodile:['croc']};
/* npcTokName — which token cell a beast wears: its kind's only token, else the one whose role name (or the city's name for it) matches, else alternate by id; null for no token. */
function npcTokName(npc){if(!npc)return null;const L=NPC_TOK[npc.t];if(!L)return null;if(L.length===1)return L[0];
  // which of the pair: match the base role name, else the city's name for it, else alternate by id
  const roles={glykon:_T('Glykon'),arenosus:_T('Arenosus'),valencia:_T('Valencia'),moechus:_T('Moechus'),ursa:_T('Ursa'),brutum:_T('Brutum'),leo:_T('Leo'),leaena:_T('Leaena')};
  for(const k of L){const R=roles[k];if(npc.name===R||(typeof beastName==='function'&&npc.name===beastName(R)))return k}
  return L[(npc.id||0)%2]}
/* npcTokHTML — the beast's token as HTML, titled with its name ('' when it has none). */
function npcTokHTML(npc,size=28){const k=npcTokName(npc);return k?rtokHTML(k,size,npc.name):''}
