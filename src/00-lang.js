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
