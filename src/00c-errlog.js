/* 00c-errlog — v0.92 THE ERROR LOG (his pick 2026-10-07). Runs right after 00b-perf, before everything else, so it sees every error:
   window 'error' + 'unhandledrejection', and every console.error (the game's try/catch blocks report through it). Keeps the last 50
   ({t, kind, msg, at, ver, where}) in ERR92.list and in localStorage flavius_errlog92 (so a crash survives the reload), the same
   message at the same spot only once per 10 s. The viewer (Settings → General → 🐞 Error log: Copy for a bug report / Clear) is in
   216-v92errui. Tests read window.ERR92 (errNew92(since) = entries after a mark). Nothing is ever sent anywhere. */
const ERR92={list:[],max:50,seen:{},n:0};
try{const s=localStorage.getItem('flavius_errlog92');if(s){const a=JSON.parse(s);if(Array.isArray(a))ERR92.list=a.slice(-ERR92.max)}}catch(e){}
function err92Where(){try{if(typeof S!=='undefined'&&S&&!S.over&&S.phase&&S.phase!=='setup')return 'event:'+(S.evKey||'')+(S.onl?':online':'');
  if(document.getElementById('mgrBody'))return 'manager';if(document.getElementById('onl'))return 'online';if(document.getElementById('stBody')||document.getElementById('studio'))return 'studio';
  const mm=document.getElementById('mainMenu');if(mm&&!mm.hidden)return 'menu'}catch(e){}return ''}
function err92Add(kind,msg,at){try{msg=String(msg||'').slice(0,400);at=String(at||'').slice(0,240);const k=kind+'|'+msg+'|'+at;const now=Date.now();
  if(ERR92.seen[k]&&now-ERR92.seen[k]<10000)return;ERR92.seen[k]=now;ERR92.n++;
  let ver='';try{const m=/v(\d+\.\d+)/.exec((document.querySelector('.brand .ed')||{}).textContent||'');ver=m?m[1]:''}catch(e){}
  ERR92.list.push({t:new Date(now).toISOString().slice(0,19).replace('T',' '),kind,msg,at,where:err92Where(),ver:ver.slice(0,24)});if(ERR92.list.length>ERR92.max)ERR92.list.splice(0,ERR92.list.length-ERR92.max);
  clearTimeout(ERR92.tm);ERR92.tm=setTimeout(()=>{try{localStorage.setItem('flavius_errlog92',JSON.stringify(ERR92.list))}catch(e){}},300)}catch(e){}}
const err92Stack=e=>{try{const L=String(e&&e.stack||'').split('\n').map(s=>s.trim()).filter(s=>/^at /.test(s));return (L[0]||'').replace(/\(?(file|https?):\/\/[^\s)]*\/([^\s/)]+)\)?/,'$2')}catch(x){return ''}};
window.addEventListener('error',e=>{if(!e)return;const er=e.error;err92Add('error',er&&er.message||e.message,er?err92Stack(er):`${e.filename||''}:${e.lineno||''}`)});
window.addEventListener('unhandledrejection',e=>{const r=e&&e.reason;err92Add('promise',r&&r.message||String(r),r&&r.stack?err92Stack(r):'')});
{const base=console.error.bind(console);console.error=function(...a){try{const e=a.find(x=>x instanceof Error);err92Add('caught',e?e.message:a.map(x=>typeof x==='string'?x:(x&&x.message)||'').join(' '),e?err92Stack(e):'')}catch(x){}return base(...a)}}
/* tests: errNew92(mark) → the entries logged since ERR92.n was `mark` */
function errNew92(mark){const k=Math.max(0,ERR92.n-(mark|0));return k?ERR92.list.slice(-k):[]}
/* v0.93 PLAYER-FACING ERRORS: nothing raw ever reaches the screen (no stack traces, JSON, ids, request names, HTTP codes).
   errText92(e, fallback) → the message when it is player text (the server's own refusals, the game's own lines), else the fallback
   (default "Something went wrong.") + " (ref E-XXXX)": errRef92 files the raw error in the log above under that ref (Settings → 🐞 Error log,
   "Copy for a bug report"), so a player can quote the ref and the log says what happened. */
const ERR_RAW93=/\b(TypeError|ReferenceError|SyntaxError|RangeError|EvalError|is not a function|is not defined|is not iterable|is not a constructor|Cannot read propert|Cannot set propert|Cannot destructure|Cannot access '|Unexpected token|Unexpected end of|in JSON at position|JSON\.parse|NetworkError|Failed to fetch|Load failed|Maximum call stack|out of memory|QuotaExceeded|DOMException|ECONN\w+|ETIMEDOUT)\b|\[object (Object|Promise|Error)\]|\bat \S+ \(|\.js:\d+(:\d+)?|\bHTTP\/?\s?[45]\d\d\b|\bstatus(Code)?[ :=]+[45]\d\d\b|^\s*\{\s*"|^\s*\[\s*[{"\d]|^\s*<!?(html|DOCTYPE)/i;
function errSafe92(e,m){if(!m||typeof m!=='string')return false;if(e&&typeof e==='object'&&!e.extra&&e instanceof Error&&e.constructor!==Error)return false;return !ERR_RAW93.test(m)}
function errRef92(e,kind){let ref='E-';try{ref+=Math.random().toString(36).slice(2,6).toUpperCase().padEnd(4,'0')}catch(x){ref+='0000'}
  try{const m=e&&typeof e==='object'?String(e.message||e.name||e):String(e);const now=Date.now();ERR92.n++;
    ERR92.list.push({t:new Date(now).toISOString().slice(0,19).replace('T',' '),kind:kind||'shown',msg:('['+ref+'] '+m).slice(0,400),at:e&&e.stack?err92Stack(e):'',where:err92Where(),ver:''});
    if(ERR92.list.length>ERR92.max)ERR92.list.splice(0,ERR92.list.length-ERR92.max);clearTimeout(ERR92.tm);ERR92.tm=setTimeout(()=>{try{localStorage.setItem('flavius_errlog92',JSON.stringify(ERR92.list))}catch(x){}},300)}catch(x){}
  return ref}
function errText92(e,fallback){const m=e==null?'':typeof e==='object'?String(e.message||''):String(e);if(errSafe92(e,m))return m;
  if(!m&&fallback)return fallback;const ref=errRef92(e);return (fallback||_T('Something went wrong.'))+' '+_T`(ref ${ref})`}
