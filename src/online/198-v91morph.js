/* 198-v91morph — v0.91 NO FLICKER ON ONLINE SCREENS (his note 2026-10-06: "🎲 New patron" flickered the whole page).
   onlRedraw used to replace #onl's innerHTML: every image, card and avatar was thrown away and decoded again, folds closed and the page
   jumped for a frame. morph91(root, html) builds the new screen off-page and patches the live one node by node: unchanged nodes stay
   (images stay decoded), changed attributes/text are updated in place, only nodes of another kind are replaced.
   • A <details> keeps the open/closed state the player gave it; a focused input/select/textarea keeps what is being typed.
   • Online screens use delegated listeners (document-level), so kept nodes carry no stale handlers.
   • 112's onlRedraw calls morph91 when it exists (plain innerHTML otherwise). Other screens can adopt it the same way. */
function morph91(root,html){const tpl=document.createElement('template');tpl.innerHTML=html;morph91Kids(root,tpl.content);return root}
function morph91Same(a,b){if(a.nodeType!==b.nodeType)return false;if(a.nodeType!==1)return true;
  if(a.tagName!==b.tagName)return false;const ia=a.id||'',ib=b.getAttribute('id')||'';return ia===ib}
function morph91Kids(oldP,newP){const nk=Array.from(newP.childNodes);let o=oldP.firstChild;
  for(const n of nk){if(!o){oldP.appendChild(n);continue}
    if(morph91Same(o,n)){morph91Node(o,n);o=o.nextSibling}
    else{const next=o.nextSibling;oldP.replaceChild(n,o);o=next}}
  while(o){const next=o.nextSibling;oldP.removeChild(o);o=next}}
function morph91Node(o,n){if(o.nodeType===3||o.nodeType===8){if(o.nodeValue!==n.nodeValue)o.nodeValue=n.nodeValue;return}
  if(o.nodeType!==1)return;const tag=o.tagName;
  /* attributes */
  for(const a of Array.from(o.attributes)){if(!n.hasAttribute(a.name)){if(tag==='DETAILS'&&a.name==='open')continue;o.removeAttribute(a.name)}}
  for(const a of Array.from(n.attributes)){if(tag==='DETAILS'&&a.name==='open')continue;if(o.getAttribute(a.name)!==a.value)o.setAttribute(a.name,a.value)}
  const focused=document.activeElement===o;
  if(tag==='INPUT'){if(!focused){const v=n.getAttribute('value');if(v!=null&&o.value!==v)o.value=v;if(o.type==='checkbox'||o.type==='radio')o.checked=n.hasAttribute('checked')}return}
  if(tag==='TEXTAREA'){if(!focused&&o.value!==n.value)o.value=n.value;return}
  if(tag==='SELECT'){if(focused)return;morph91Kids(o,n);const sel=n.querySelector('option[selected]');if(sel&&o.value!==sel.value)o.value=sel.value;return}
  if(tag==='CANVAS')return;
  morph91Kids(o,n)}
