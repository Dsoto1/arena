/* =====================================================================
   322-v101onl — v1.01 ONLINE (workstream F; the shared rules: the "v1.01" section of 111-onlcore; the server: the "v1.01" block of
   server/src/routes.js; docs/backend.md "v1.01"; findings tools/plans/v101/SECURITY.md)
   1 · ONLINE LOADOUTS FOLLOW v1.0: 315-v100bal kept the OLD Damnatio armor and Amazonia's Falcata online (bal100Old around onlKits92 and the
       online giveLoadout). Now online uses the same printed classes as offline: the Damnatio's class kit lists Iron Helm + Belt I, the Amazonia's
       Custom recruit kit has no Falcata. bal100Old becomes a plain call (its wrappers in 315 stay, doing nothing).
   2 · SNAPSHOTS ARE CLEANED BEFORE THEY LOAD (S1): every match state this page loads (online openings / resyncs through onlmLoad, replays, save
       slots) goes through snap101Clean first — the log HTML and every string in S that looks like markup are rebuilt from an inert <template>
       without script-capable tags, inline handlers (on…=), script URLs or style url(); a string that could break out of an HTML attribute loses
       its quotes. Display text only: the rules, the dice and onlHash never read these strings.
   3 · LOCKSTEP INPUTS ARE CLEANED (S2): onlmApply wrapper — another page's move keeps its numbers and keys; a string in it that looks like markup is
       cleaned the same way (an honest page never sends one).
   4 · THE MOCK SERVER refuses what the real one refuses (snap_bad / in_bad), so tests see the same answers.
   Kill switch (cleaning only, never the loadouts): localStorage flavius_snap101off=1.
   ===================================================================== */
/* 1 · the v1.0 loadouts online too */
if(typeof bal100Old==='function')bal100Old=function(fn){return fn()};
/* 2 · the cleaner */
const SNAP101={on:(()=>{try{return localStorage.getItem('flavius_snap101off')!=='1'}catch(e){return true}})(),n:0,
  /* TWEAK: elements dropped whole (with what is inside them) */
  deny:new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','BASE','META','LINK','FORM','INPUT','BUTTON','TEXTAREA','SELECT','OPTION','FRAME','FRAMESET','APPLET',
    'NOSCRIPT','TEMPLATE','MATH','FOREIGNOBJECT','ANIMATE','ANIMATEMOTION','ANIMATETRANSFORM','ANIMATECOLOR','SET','PORTAL','XMP','PLAINTEXT','NOEMBED','NOFRAMES',
    'AUDIO','VIDEO','SOURCE','TRACK','DIALOG','USE','HANDLER','LISTENER']),
  /* attributes dropped whatever their value */
  drop:new Set(['srcdoc','formaction','action','background','poster','ping','srcset','dynsrc','lowsrc','http-equiv','autofocus'])};
/* markup-looking strings (a tag start) and attribute break-outs */
const SNAP101_TAG=/<[a-z!\/?]/i, SNAP101_ATTR=/(^|[\s"'`\/;])on[a-z]+\s*=|j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|vbscript\s*:|srcdoc\s*=|data\s*:\s*text\/html/i;
/* snap101Html — markup checked in an inert template: when something unsafe was found it is rebuilt from what is left (safe tags and attributes), else the string comes back as it was */
function snap101Html(h){const t=document.createElement('template');t.innerHTML=String(h);const all=[...t.content.querySelectorAll('*')];let cut=0;
  for(const el of all){const tag=String(el.tagName||'').toUpperCase();if(SNAP101.deny.has(tag)){el.remove();cut++;continue}
    for(const a of [...el.attributes]){const n=a.name.toLowerCase();const v=String(a.value||'');const flat=v.replace(/[\u0000- ]/g,'').toLowerCase();
      if(n.startsWith('on')||SNAP101.drop.has(n)){el.removeAttribute(a.name);cut++;continue}
      if(n==='href'||n==='src'||n==='xlink:href'||n.endsWith(':href')){if(!(flat.startsWith('data:image/')||flat.startsWith('blob:')||!flat.includes(':'))){el.removeAttribute(a.name);cut++}continue}
      if(n==='style'&&/url\s*\(|expression\s*\(|javascript\s*:|@import|behavior\s*:|-moz-binding/i.test(v)){el.removeAttribute(a.name);cut++;continue}}}
  /* text that could break out of an attribute when this string is later used inside one loses its quotes */
  const tw=document.createTreeWalker(t.content,NodeFilter.SHOW_TEXT);for(let n=tw.nextNode();n;n=tw.nextNode())if(SNAP101_ATTR.test(n.data)&&/["'`]/.test(n.data)){n.data=n.data.replace(/["'`]/g,'');cut++}
  return cut?t.innerHTML:String(h)}
/* snap101Str — one string: plain text is returned as it is; markup is rebuilt; an attribute break-out loses its quotes and angle brackets */
function snap101Str(s){if(typeof s!=='string'||!s)return s;let o=s;if(SNAP101_TAG.test(o))o=snap101Html(o);else if(SNAP101_ATTR.test(o)&&/["'`]/.test(o))o=o.replace(/["'`<>]/g,'');if(o!==s)SNAP101.n++;return o}
/* snap101Deep — every string (and key) of a parsed object, in place where it can, depth-limited; returns the cleaned value */
function snap101Deep(x,d){d=d|0;if(d>60)return x;if(typeof x==='string')return snap101Str(x);if(!x||typeof x!=='object')return x;
  if(Array.isArray(x)){for(let i=0;i<x.length;i++)x[i]=snap101Deep(x[i],d+1);return x}
  for(const k of Object.keys(x)){const v=snap101Deep(x[k],d+1);const k2=snap101Str(k);if(k2!==k){delete x[k];x[k2]=v}else x[k]=v}return x}
/* snap101Clean — a save / snapshot object, cleaned (the S JSON parsed, cleaned and written back; Sets/Maps stay tagged __set/__map) */
function snap101Clean(snap){if(!SNAP101.on||!snap||typeof snap!=='object')return snap;const n0=SNAP101.n;const out={...snap};
  try{if(typeof out.S==='string'){const o=JSON.parse(out.S);out.S=JSON.stringify(snap101Deep(o,0))}}catch(e){}
  if(typeof out.log==='string')out.log=snap101Html(out.log);
  for(const k of Object.keys(out))if(k!=='S'&&k!=='log'&&out[k]&&typeof out[k]==='object')out[k]=snap101Deep(JSON.parse(JSON.stringify(out[k])),0);else if(k!=='S'&&k!=='log'&&typeof out[k]==='string')out[k]=snap101Str(out[k]);
  if(SNAP101.n>n0){try{console.warn('[snap101]',SNAP101.n-n0)}catch(e){}}return out}
/* every load of a match state (save slots, online openings / resyncs through onlmLoad's 'onl' slot, replays' 'rp100' slot) */
{const base=matchLoad;matchLoad=function(slot){try{if(SNAP101.on){const sv=matchSlotGet(slot);if(sv&&typeof sv==='object'){const c=snap101Clean(sv);if(JSON.stringify(c)!==JSON.stringify(sv))matchSlotPut(slot,c)}}}catch(e){if(console.error)console.error(e)}
  return base.apply(this,arguments)}}
/* 3 · another page's move: numbers and keys pass; markup-looking strings are cleaned (internal fields left alone) */
if(typeof onlmApply==='function'){const base=onlmApply;onlmApply=function(inp){try{if(SNAP101.on&&inp&&typeof inp==='object'&&inp.from!=='server'){for(const k of Object.keys(inp)){if(k==='k'||k==='from'||k==='h'||k==='pre')continue;inp[k]=snap101Deep(inp[k],0)}}}catch(e){}
  return base.apply(this,arguments)}}
/* 4 · the mock server mirrors the real one's refusals */
if(typeof MOCK_ROUTES!=='undefined'){
  for(const t of ['match.open','match.snap']){const base=MOCK_ROUTES[t];if(base)MOCK_ROUTES[t]=function(w,d,me){if(d&&ONLC.snapBad101&&ONLC.snapBad101(d.snap))throw new Error(_T('That match state carries markup that is not allowed — refused.'));return base.apply(this,arguments)}}
  {const base=MOCK_ROUTES['match.input'];if(base)MOCK_ROUTES['match.input']=function(w,d,me){if(d&&ONLC.inBad101&&ONLC.inBad101(d.in))throw new Error(_T('That move carries markup that is not allowed.'));return base.apply(this,arguments)}}}
