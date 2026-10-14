/* 00-lang — v0.86 languages (runs before everything else).
   • _T marks player-facing text. tools/i18n/wrap.js put it on every prose literal / template run:
       _T('Plain text')   _T`Text with ${x} inside`   `<div>${_T`Run of text`}</div>`
   • English (the default) = identity: _T returns exactly what the template literal would have made.
   • Another language: the key is the English text with each ${…} as {0},{1}… (trimmed; edge whitespace kept),
     looked up in LANG_DICT (assets/lang_<l>.js, only the picked language is loaded); {n} in the translation takes the n-th value. A miss = English.
   • The language is chosen before the page runs (localStorage flavius_lang); switching reloads the page
     (data built at load — card text, round names — is translated once, at load).
   • Game terms (GAME_TERMS, 138-v84) and every name (weapons, armor, beasts, offerings, cards, classes,
     events, people) stay English in every language — the dictionary simply keeps them. */
/* every language is named in its own language (v0.87) */
const LANGS86=[{k:'en',n:'English'},{k:'es',n:'Español'},{k:'it',n:'Italiano'},{k:'pt',n:'Português (Brasil)'},{k:'fr',n:'Français'},{k:'de',n:'Deutsch'},{k:'ja',n:'日本語'},{k:'zh',n:'简体中文'},{k:'au',n:'English (Australia)'}];
/* the dictionary arrives as window.LANG_PACK (assets/lang_<l>.js, loaded by 01-head before this script); if it did not load
   (offline, file missing) the game simply runs in English */
const LANG_PACK0=(typeof window!=='undefined'&&window.LANG_PACK)||null;
const LANG=(()=>{try{const l=localStorage.getItem('flavius_lang');return LANGS86.some(L=>L.k===l)&&l!=='en'&&LANG_PACK0&&LANG_PACK0.l===l?l:'en'}catch(e){return 'en'}})();
let LANG_DICT=LANG!=='en'?LANG_PACK0.d:null;
const LANG_SRVPAT=LANG!=='en'&&Array.isArray(LANG_PACK0.s)?LANG_PACK0.s:[];
const LANG_MISS=new Map();          /* key → count of misses (the Spanish walk test reads it) */
function langKey86(s){let k=s[0];for(let i=1;i<s.length;i++)k+='{'+(i-1)+'}'+s[i];return k}
function langLook86(key,vals,quiet){
  const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(key);const core=m[2];
  const tr=LANG_DICT[core];
  if(tr==null){if(core&&!quiet)LANG_MISS.set(core,(LANG_MISS.get(core)||0)+1);return null}
  /* {n} = the value; {n|one|many} = a plural form picked by value n: '' / 1 / '1' / 'y' / 'is' / 'was' / 'has' (English singular) → one, else → many */
  const out=vals.length?tr.replace(/\{(\d+)(?:\|([^|{}]*)\|([^{}]*))?\}/g,(x,n,one,many)=>{n=+n;if(n>=vals.length)return x;
    if(one==null)return String(vals[n]);const v=vals[n];return (v===''||v===1||v==='1'||v==null||v==='y'||v==='is'||v==='was'||v==='has')?one:many}):tr;
  return m[1]+out+m[3]}
function _T(s,...v){
  if(typeof s==='string'){if(!LANG_DICT)return s;const r=langLook86(s,[]);return r==null?s:r}
  if(!s||!Array.isArray(s))return s==null?'':String(s);
  if(LANG_DICT){const r=langLook86(langKey86(s),v);if(r!=null)return r}
  let o=s[0];for(let i=0;i<v.length;i++)o+=String(v[i])+s[i+1];return o}
/* exact lookup for text that never went through _T (static HTML in 01-head, server replies) */
function TX(str){if(!LANG_DICT||typeof str!=='string')return str;const r=langLook86(str,[],true);return r==null?str:r}
/* v0.95 — patch-by-match helpers: a later module that finds a spot in HTML an earlier module made must look for the TRANSLATED text, not the English.
   TX('key') = the exact key as the producer wrapped it; TXPRE('key {0}…') = its translation up to the first {0} (templates with values);
   TXHEAD(key,tail) = TXPRE minus a trailing tail (markup the pattern should not include); RXE(s) = regexp-escape. English: identity. */
/* Fate titles are built with _T (e.g. 'Thumb of Flavius · spared'), so a test on the English words fails in every other language */
function fateSpared(t){t=String(t||'');return /spared/.test(t)||t===TX('Thumb of Flavius · spared')}
function fateThumbsDown(t){t=String(t||'');return /^Thumbs down/.test(t)||t.startsWith(TXPRE('Thumbs down · {0}'))}
function fateIsThumb(t){t=String(t||'');return /^Thumb of Flavius/.test(t)||t.startsWith(TXPRE('Thumb of Flavius · {0}'))}
/* LBLRX(['Close',…],end) — /^(Close|Cerrar|…)/ so code that recognises a window's button by its label keeps working in every language */
function LBLRX(words,end){return new RegExp('^('+String(words).split('|').map(w=>{const t=TX(w);return t===w?RXE(w):RXE(w)+'|'+RXE(t)}).join('|')+')'+(end?'$':''))}
/* TXL('Label') = the translated label of a form field made as _T`Label${select}` (key 'Label{0}') or _T`Label` — RXL() = regexp-escaped */
function TXL(en){const a=TX(en+'{0}');return a!==en+'{0}'?a.replace(/\{0\}$/,''):TX(en)}
function RXL(en){return RXE(TXL(en))}
/* HRX('Rounds') = /^Rounds/ in the player's language (headings tested by their text) */
function HRX(en){return new RegExp('^'+RXE(TX(en)))}
/* TXK(prefix) = the translation of the first dictionary key that starts with prefix (for long keys whose tail is not worth repeating); English: the prefix itself */
const TXK_CACHE=new Map();
function TXK(prefix){if(!LANG_DICT)return prefix;if(TXK_CACHE.has(prefix))return TXK_CACHE.get(prefix);let r=prefix;for(const k in LANG_DICT){if(k.startsWith(prefix)){r=LANG_DICT[k];break}}TXK_CACHE.set(prefix,r);return r}
function TXPRE(key){const t=TX(key);const i=t.indexOf('{0}');return i<0?t:t.slice(0,i)}
function TXHEAD(key,tail){const t=TXPRE(key);return tail&&t.endsWith(tail)?t.slice(0,t.length-tail.length):t}
function RXE(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
