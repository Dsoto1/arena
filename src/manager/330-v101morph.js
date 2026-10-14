/* 330-v101morph — v1.01 MANAGER MORPH RENDERING (wave 2 Foundations, last step; backlog "Manager morph + rendering items").
   Every Manager redraw (17's wireManager redraw = window.MGR_REDRAW, and every say/redraw inside it) used to throw #mgrBody away with
   innerHTML: every portrait, scene, map inset and card image was inserted and decoded again, open <details> folded shut, inner lists
   jumped back to the top and the page flashed for a frame.
   Now 17's redraw calls mgrPaint(el, html) and this module PATCHES the live page to match the freshly built one:
   • mgrHTML() and every post-processor (the final mgrHTML wrappers of 202/270/290/294/297/298/299/317/318/319/320 … that re-home nodes on a
     detached template) run exactly as before — they build a string; only the last step (string → page) changed.
   • the string is parsed into a <template> and the live tree is patched node by node (mm101Kids): an unchanged node stays (images stay
     decoded, inner scrollers keep their scroll position, hover/focus stay), changed text/attributes are set in place, only nodes of another
     kind or another identity are swapped. IDENTITY KEYS (MM101_KEYS: id, data-id, data-gid, data-mg, data-mail …) — two nodes whose keys
     differ are never patched into each other, so a row never "becomes" another fighter; a one-step look-ahead keeps rows when one comes/goes.
   • TEMPLATE ATTRIBUTES (as 230's morph95): each node remembers the attributes its template gave it (_p95); a patch changes only what the
     template changed. So what the page adds later stays on kept nodes: the rail sweeps' classes (81 recpend/trpend…, 184's keep list), 220's
     contrast lift + aria names, 138's data-en84, 306's sandstone tags — and a <details> the player opened stays open (the template never
     said "open"); one the template opens/closes on purpose (294's letter to show) still opens/closes.
   • SWEEP-OWNED NODES (MM101_OWN: the rail ovals .c73 / .c85n / .hr99, 157's .imm88lf / .fear88) that sweeps put into kept nodes are left
     where they are (they used to vanish on every redraw until the next sweep: the oval flicker 184 fixed for the rail only).
   • a focused input / textarea / select keeps what is being typed; canvases are kept.
   • all Manager handlers are delegated (#mBody's box.onclick + document listeners on data-* attributes); the few per-node listeners (294's
     .lu100tl scroll hint) are guarded by an expando, so a kept node never gets a second one.
   • a node holding the event in flight's target is kept as a hidden ghost until the event is over; one script click per node per key
     event (see the two blocks below).
   The window's first paint (17's modal body) stays innerHTML; its tree is recorded in a wireManager wrapper so the first patch knows it.
   Kill switch: localStorage flavius_mgrmorph101off=1 (today's innerHTML). Stats: MM101.n {paint, kept, added, ms (last), sum}.
   Test tv101m (node identity, inner scroll, open details, no new <img>, kill switch, redraw ms on/off). Display only — no world data. */
const MM101={on:(()=>{try{return localStorage.getItem('flavius_mgrmorph101off')!=='1'}catch(e){return true}})(),
  n:{paint:0,kept:0,added:0,ms:0,sum:0,fail:0}};
/* TWEAK: attributes that name WHO a node is — differing values are never patched into each other */
const MM101_KEYS=['id','data-id','data-gid','data-gid84','data-yo87row','data-y99sel','data-mail','data-dk99','data-mg','data-tab','data-card','data-bid','data-key','data-lu100adv','data-c83'];
/* TWEAK: classes of nodes that sweeps insert into kept nodes (never in a template): left in place */
const MM101_OWN=['c73','c85n','hr99','imm88lf','fear88','hrchip'];
const MM101_FIG=/s3h[0-9a-z]+/g;
function mm101Own(n){if(!n||n.nodeType!==1||!n.classList)return false;if(n._mm101g)return true;for(const c of MM101_OWN)if(n.classList.contains(c))return true;return false}
function mm101Same(a,b){if(a.nodeType!==b.nodeType)return false;if(a.nodeType!==1)return true;if(a.tagName!==b.tagName)return false;
  for(const k of MM101_KEYS){const x=a.getAttribute(k),y=b.getAttribute(k);if(x!==y&&(k==='id'||(x!=null&&y!=null)))return false}return true}
function mm101Tpl(n){const m={};for(const a of n.attributes)m[a.name]=a.value;return m}
function mm101Rec(n){if(!n||n.nodeType!==1)return;n._p95=mm101Tpl(n);const all=n.getElementsByTagName('*');for(let i=0;i<all.length;i++)all[i]._p95=mm101Tpl(all[i])}
function mm101Set(o,a){try{if(a.namespaceURI)o.setAttributeNS(a.namespaceURI,a.name,a.value);else o.setAttribute(a.name,a.value)}catch(e){/* a bogus name from an unescaped template: skipped */}}
function mm101Attrs(o,n){const prev=o._p95,cur=mm101Tpl(n);
  if(!prev){for(const a of Array.from(o.attributes))if(!n.hasAttributeNS(a.namespaceURI,a.localName)&&!(o.tagName==='DETAILS'&&a.name==='open'))o.removeAttributeNS(a.namespaceURI,a.localName);
    for(const a of n.attributes)if(o.getAttributeNS(a.namespaceURI,a.localName)!==a.value)mm101Set(o,a)}
  else{for(const k in prev)if(!(k in cur)&&o.hasAttribute(k))o.removeAttribute(k);
    for(const a of n.attributes)if(prev[a.name]!==a.value||(!o.hasAttribute(a.name)&&!(a.name in prev)))mm101Set(o,a)}
  o._p95=cur}
function mm101Node(o,n){if(o.nodeType!==1){if(o.nodeValue!==n.nodeValue)o.nodeValue=n.nodeValue;return}
  if(o.isEqualNode(n)){MM101.n.kept++;return}
  /* a lit figure (176) with a new id prefix: the same figure stays, a changed one is swapped whole */
  if(o.tagName==='svg'&&n.innerHTML.indexOf('s3h')>=0){if(o.outerHTML.replace(MM101_FIG,'')===n.outerHTML.replace(MM101_FIG,'')){MM101.n.kept++;return}
    mm101Rec(n);o.parentNode.replaceChild(n,o);MM101.n.added++;return}
  mm101Attrs(o,n);const tag=o.tagName;const focused=document.activeElement===o;
  if(tag==='INPUT'){if(!focused){const v=n.getAttribute('value');const nv=v==null?'':v;if(o.type==='checkbox'||o.type==='radio')o.checked=n.hasAttribute('checked');else if(o.type!=='file'&&o.value!==nv)o.value=nv}return}
  if(tag==='TEXTAREA'){if(!focused&&o.value!==n.value)o.value=n.value;return}
  if(tag==='CANVAS')return;
  if(tag==='SELECT'&&focused)return;
  mm101Kids(o,n);
  if(tag==='SELECT'){const sel=n.querySelector('option[selected]');const v=sel?sel.value:(n.options&&n.options.length?n.options[0].value:null);if(v!=null&&o.value!==v)o.value=v}}
/* the next live child that is not sweep-owned */
function mm101Nx(o){while(o&&mm101Own(o))o=o.nextSibling;return o}
function mm101Kids(oldP,newP){const nk=Array.from(newP.childNodes);let o=mm101Nx(oldP.firstChild);
  for(let i=0;i<nk.length;i++){const n=nk[i];
    /* a sweep-owned node in the template: patch the live one of that kind, else it goes in */
    if(mm101Own(n)){const twin=Array.from(oldP.children).find(x=>mm101Own(x)&&x.className===n.className);if(twin)continue;mm101Rec(n);oldP.insertBefore(n,o);MM101.n.added++;continue}
    if(!o){mm101Rec(n);oldP.appendChild(n);MM101.n.added++;continue}
    if(mm101Same(o,n)){const nx=mm101Nx(o.nextSibling);mm101Node(o,n);o=nx;continue}
    /* one-step look-ahead: a row left (old next matches) or a row came (new next matches the old one) */
    const on=mm101Nx(o.nextSibling),nn=nk[i+1];
    if(on&&mm101Same(on,n)&&!(nn&&mm101Same(o,nn))){mm101Drop(o,null);o=mm101Nx(on.nextSibling);mm101Node(on,n);continue}
    if(nn&&!mm101Own(nn)&&mm101Same(o,nn)){mm101Rec(n);oldP.insertBefore(n,o);MM101.n.added++;continue}
    const next=mm101Nx(o.nextSibling);mm101Rec(n);mm101Drop(o,n);MM101.n.added++;o=next}
  while(o){const next=mm101Nx(o.nextSibling);mm101Drop(o,null);o=next}}
/* THE EVENT IN FLIGHT. A redraw usually runs inside a click/key handler, and later handlers of the same event still ask
   e.target.closest('#lu100pop') etc. innerHTML detached the WHOLE old tree, so the target kept its old ancestors; a patch that removes
   just the target (a ⬆ Train button that becomes "Level 3 is earned") would cut it loose. So a node holding the event's target is not
   removed at once: it stays hidden (inert, aria-hidden) where it was, its replacement goes in before it, and it leaves once the event is
   over (next task; the event is window.event, so the order of the page's listeners does not matter). Ghosts count as sweep-owned: never matched by a later patch. */
const MM101G={ghosts:[],t:0};
function mm101Drop(o,n){const p=o.parentNode;if(!p)return;let T=null;try{const ev=window.event;T=ev&&ev.target&&ev.target.nodeType===1?ev.target:null}catch(e){}
  if(T&&o.nodeType===1&&(o===T||o.contains(T))){if(n)p.insertBefore(n,o);o._mm101g=1;try{o.hidden=true;o.setAttribute('inert','');o.setAttribute('aria-hidden','true');o.style.display='none'}catch(e){}
    MM101G.ghosts.push(o);if(!MM101G.t)MM101G.t=setTimeout(mm101Flush,0);return}
  if(n)p.replaceChild(n,o);else p.removeChild(o)}
function mm101Flush(){MM101G.t=0;const g=MM101G.ghosts;MM101G.ghosts=[];for(const o of g)if(o.parentNode)o.parentNode.removeChild(o)}
/* ONE ACTIVATION PER KEY. Several modules answer Enter/Space on a role=button node with t.click() (220 for every [role=button], 294 for
   the council heads, 298 for the rooms…). With innerHTML the first click redrew the page and the second one landed on a detached node
   (nothing listened); on a patched page the node is still there, so the second click undid the first (a popover opened and shut).
   Within one key event the same node is clicked once: a further script click on it is swallowed. */
const MM101K={ev:null,done:null,t:0};
addEventListener('keydown',e=>{if(!MM101.on||(e.key!=='Enter'&&e.key!==' '))return;MM101K.ev=e;MM101K.done=new Set();if(!MM101K.t)MM101K.t=setTimeout(()=>{MM101K.t=0;MM101K.ev=null;MM101K.done=null},0)},true);
addEventListener('click',e=>{const K=MM101K;if(!K.ev||e.isTrusted||!K.done)return;const t=e.target;if(!t||t.nodeType!==1||!t.closest||!t.closest('#mgrBody'))return;
  if(K.done.has(t)){e.preventDefault();e.stopImmediatePropagation();return}K.done.add(t)},true);
/* mm101Morph — patch el's children to match html (the whole Manager page) */
function mm101Morph(el,html){const tpl=document.createElement('template');tpl.innerHTML=html;
  if(!el._m101){mm101Rec(el);for(const c of el.children)mm101Rec(c);el._m101=1}
  const act=document.activeElement;
  mm101Kids(el,tpl.content);
  try{if(act&&act!==document.body&&act.isConnected&&document.activeElement!==act&&el.contains(act))act.focus({preventScroll:true})}catch(e){}}
{const base=mgrPaint;mgrPaint=function(el,html){
  if(!MM101.on||!el||(typeof HEADLESS!=='undefined'&&HEADLESS))return base.apply(this,arguments);
  const t0=performance.now();
  try{mm101Morph(el,html)}catch(e){console.error(e);MM101.n.fail++;el._m101=0;return base.apply(this,arguments)}
  const ms=performance.now()-t0;MM101.n.paint++;MM101.n.ms=ms;MM101.n.sum+=ms}}
/* the window's first paint is innerHTML (17's modal body): record its tree as "what the template gave" */
{const base=wireManager;wireManager=function(){const r=base.apply(this,arguments);
  try{const el=document.getElementById('mgrBody');if(el&&MM101.on){for(const c of el.children)mm101Rec(c);el._m101=1}}catch(e){console.error(e)}return r}}
