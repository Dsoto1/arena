/* tools/node/dom.js — a SMALL fake DOM for running the built game in Node (v1.01 wave 2, Phase D1 of tools/plans/layers100/PLAN.md).
   Enough of the browser for the game's load-time code and its screen code to run without throwing, never to draw anything:
   a real element tree (so getElementById / querySelector / closest / events behave), innerHTML parsed LAZILY (a panel that is written
   but never queried costs one string), textContent with entities decoded (03-engine logDom → S.logLines uses li.textContent),
   a canvas whose 2D context accepts every call, and events with capture + bubble (cmdTwin's hidden-button click, document listeners).
   Nothing here may ever reach the rules' dice: Math.random / Date / timers are the page's (tools/node/page.js), not this file's. */
'use strict';
const VOID=new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr']);
const RAW=new Set(['script','style','textarea','title']);
const ENT={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',times:'×',middot:'·',hellip:'…',mdash:'—',ndash:'–',rarr:'→',larr:'←',copy:'©',laquo:'«',raquo:'»',deg:'°',bull:'•',minus:'−',thinsp:' ',ensp:' ',emsp:' ',zwj:'‍',shy:'­',hearts:'♥',para:'¶',sect:'§',frac12:'½',frac14:'¼',plusmn:'±',divide:'÷'};
const decode=s=>s.indexOf('&')<0?s:s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi,(m,e)=>e[0]==='#'?String.fromCodePoint(e[1]==='x'||e[1]==='X'?parseInt(e.slice(2),16):+e.slice(1)):ENT[e]!=null?ENT[e]:m);
const escT=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ /g,'&nbsp;');
const escA=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
const camel=s=>s.replace(/-([a-z])/g,(m,c)=>c.toUpperCase()),kebab=s=>s.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());

function makeDOM(win){
  /* ---------------- nodes ---------------- */
  let doc=null;
  /* THE INDEX: every CONNECTED, parsed element under its keys ('#id', 't:tag', 'c:class', 'a:attr'). An innerHTML string that was never
     parsed waits in PEND; a lookup parses only the pending strings that hold its token (most panels are written and never queried). */
  const IDX=new Map(),PEND=new Set();
  const conn=n=>{while(n._p)n=n._p;return n===doc};
  const keys=n=>{const k=['t:'+n.tagName];for(const [a,v] of n._a){k.push('a:'+a);if(a==='id')k.push('#'+v);else if(a==='class')for(const c of v.split(/\s+/))if(c)k.push('c:'+c)}return k};
  const reg1=n=>{for(const k of keys(n)){let s=IDX.get(k);if(!s)IDX.set(k,s=new Set());s.add(n)}};
  const unreg1=n=>{for(const k of keys(n)){const s=IDX.get(k);if(s){s.delete(n);if(!s.size)IDX.delete(k)}}};
  const reg=n=>{if(n.nodeType!==1)return;reg1(n);if(n._raw!=null){if(n._raw.indexOf('<')>=0)PEND.add(n)}else for(const c of n._kids)reg(c)};
  const unreg=n=>{if(n.nodeType!==1)return;unreg1(n);PEND.delete(n);for(const c of n._kids)unreg(c)};
  const pendParse=tok=>{for(let g=0;g<50&&PEND.size;g++){let any=false;for(const e of [...PEND])if(PEND.has(e)&&e._raw!=null&&e._raw.indexOf(tok)>=0){e._k();any=true}if(!any)break}};
  const ixGet=t=>IDX.get(t.k);
  /* document order of two connected nodes */
  const chain=n=>{const a=[];while(n){a.push(n);n=n._p}return a.reverse()};
  const before=(x,y)=>{const A=chain(x),B=chain(y);let i=0;while(i<A.length&&i<B.length&&A[i]===B[i])i++;if(i===A.length)return true;if(i===B.length)return false;const k=A[i-1]._kids;return k.indexOf(A[i])<k.indexOf(B[i])};
  class Node{constructor(){this._p=null}get ownerDocument(){return doc}
    get parentNode(){return this._p}get parentElement(){return this._p&&this._p.nodeType===1?this._p:null}
    get isConnected(){let n=this;while(n._p)n=n._p;return n===doc}
    _sib(d){const p=this._p;if(!p)return null;const k=p._k();return k[k.indexOf(this)+d]||null}
    get nextSibling(){return this._sib(1)}get previousSibling(){return this._sib(-1)}
    get nextElementSibling(){let n=this._sib(1);while(n&&n.nodeType!==1)n=n._sib(1);return n}
    get previousElementSibling(){let n=this._sib(-1);while(n&&n.nodeType!==1)n=n._sib(-1);return n}
    remove(){const p=this._p;if(p){if(conn(p))unreg(this);const k=p._k(),i=k.indexOf(this);if(i>=0)k.splice(i,1);this._p=null}}
    replaceWith(...ns){const p=this._p;if(!p)return;for(const n of ns)p.insertBefore(toNode(n),this);this.remove()}
    before(...ns){const p=this._p;if(p)for(const n of ns)p.insertBefore(toNode(n),this)}
    after(...ns){const p=this._p;if(!p)return;const nx=this.nextSibling;for(const n of ns)p.insertBefore(toNode(n),nx)}
    contains(n){while(n){if(n===this)return true;n=n._p}return false}
    addEventListener(t,f,o){if(!f)return;const c=o===true||!!(o&&o.capture);(this._ev||(this._ev=[])).push({t,f,c,once:!!(o&&o.once)})}
    removeEventListener(t,f,o){const c=o===true||!!(o&&o.capture);if(this._ev)this._ev=this._ev.filter(l=>!(l.t===t&&l.f===f&&l.c===c))}
    dispatchEvent(e){return dispatch(this,e)}
    getRootNode(){let n=this;while(n._p)n=n._p;return n}
  }
  class Text extends Node{constructor(t){super();this.data=String(t)}get nodeType(){return 3}get nodeName(){return '#text'}
    get nodeValue(){return this.data}set nodeValue(v){this.data=String(v)}get textContent(){return this.data}set textContent(v){this.data=String(v)}
    get length(){return this.data.length}cloneNode(){return new Text(this.data)}isEqualNode(n){return !!n&&n.nodeType===3&&n.data===this.data}get _html(){return escT(this.data)}}
  class Comment extends Node{constructor(t){super();this.data=String(t)}get nodeType(){return 8}get nodeName(){return '#comment'}get textContent(){return ''}
    cloneNode(){return new Comment(this.data)}isEqualNode(n){return !!n&&n.nodeType===8&&n.data===this.data}get _html(){return '<!--'+this.data+'-->'}}
  const toNode=n=>n instanceof Node?n:new Text(n);
  const classListOf=el=>{const get=()=>(el.getAttribute('class')||'').split(/\s+/).filter(Boolean),set=a=>el.setAttribute('class',a.join(' '));
    return {add:(...c)=>{const a=get();for(const x of c)if(!a.includes(x))a.push(x);set(a)},remove:(...c)=>set(get().filter(x=>!c.includes(x))),
      contains:c=>get().includes(c),toggle:(c,f)=>{const has=get().includes(c);const on=f===undefined?!has:!!f;if(on&&!has)set([...get(),c]);if(!on&&has)set(get().filter(x=>x!==c));return on},
      replace:(a,b)=>{const g=get();const i=g.indexOf(a);if(i<0)return false;g[i]=b;set(g);return true},item:i=>get()[i]||null,get length(){return get().length},
      get value(){return el.getAttribute('class')||''},forEach:f=>get().forEach(f),[Symbol.iterator]:()=>get()[Symbol.iterator](),toString:()=>el.getAttribute('class')||''}};
  const styleOf=()=>{const st={};const api={setProperty:(k,v)=>{st[k]=String(v)},getPropertyValue:k=>st[k]||'',removeProperty:k=>{const v=st[k];delete st[k];return v||''},
      get cssText(){return Object.entries(st).map(([k,v])=>kebab(k)+':'+v).join(';')},set cssText(v){for(const k of Object.keys(st))delete st[k];for(const d of String(v).split(';')){const i=d.indexOf(':');if(i>0)st[camel(d.slice(0,i).trim())]=d.slice(i+1).trim()}}};
    return new Proxy(st,{get:(t,k)=>k in api?api[k]:typeof k==='string'?(t[k]!=null?t[k]:''):undefined,set:(t,k,v)=>{if(k==='cssText')api.cssText=v;else t[k]=v==null?'':String(v);return true}})};
  class Element extends Node{
    constructor(tag){super();this.tagName=String(tag).toUpperCase();this._a=new Map();this._kids=[];this._raw=null;this.style=styleOf();this._cl=null;this._ds=null}
    get nodeType(){return 1}get nodeName(){return this.tagName}get localName(){return this.tagName.toLowerCase()}
    _k(){if(this._raw!=null){const r=this._raw;this._raw=null;PEND.delete(this);this._kids=[];if(r)for(const n of parse(r,this.localName))this._ins(n,null)}return this._kids}
    _ins(n,ref){if(n.nodeType===11){for(const c of n._k().slice())this._ins(c,ref);return n}n.remove();const k=this._k();const i=ref?k.indexOf(ref):-1;if(i<0)k.push(n);else k.splice(i,0,n);n._p=this;if(conn(this))reg(n);return n}
    get childNodes(){return this._k().slice()}get children(){return this._k().filter(n=>n.nodeType===1)}get childElementCount(){return this.children.length}
    get firstChild(){return this._k()[0]||null}get lastChild(){const k=this._k();return k[k.length-1]||null}
    get firstElementChild(){return this.children[0]||null}get lastElementChild(){const c=this.children;return c[c.length-1]||null}
    hasChildNodes(){return this._k().length>0}
    appendChild(n){return this._ins(toNode(n),null)}append(...ns){for(const n of ns)this._ins(toNode(n),null)}prepend(...ns){const f=this.firstChild;for(const n of ns)this._ins(toNode(n),f)}
    insertBefore(n,ref){return this._ins(toNode(n),ref||null)}removeChild(n){n.remove();return n}replaceChild(n,old){this.insertBefore(n,old);old.remove();return old}
    replaceChildren(...ns){for(const c of this._k().slice())c.remove();this.append(...ns)}
    insertAdjacentHTML(pos,html){const f=new Fragment();f._raw=String(html);this.insertAdjacentElement(pos,f)}
    insertAdjacentElement(pos,n){pos=String(pos).toLowerCase();if(pos==='beforebegin')this.before(n);else if(pos==='afterend')this.after(n);else if(pos==='afterbegin')this.prepend(n);else this.append(n);return n}
    insertAdjacentText(pos,t){this.insertAdjacentElement(pos,new Text(t))}
    get innerHTML(){return this._raw!=null?this._raw:this._kids.map(n=>n._html).join('')}
    set innerHTML(v){const on=conn(this);for(const c of this._kids){if(on)unreg(c);c._p=null}this._kids=[];this._raw=v==null?'':String(v);if(on&&this._raw.indexOf('<')>=0)PEND.add(this);else PEND.delete(this)}
    get outerHTML(){return this._html}set outerHTML(v){const f=new Fragment();f._raw=String(v);this.replaceWith(f)}
    get _html(){const t=this.localName;let s='<'+t;for(const [k,v] of this._a)s+=' '+k+'="'+escA(v)+'"';s+='>';if(VOID.has(t))return s;return s+(RAW.has(t)?this.textContent:this.innerHTML)+'</'+t+'>'}
    get textContent(){if(this._raw!=null&&this._raw.indexOf('<')<0)return decode(this._raw);return this._k().map(n=>n.textContent).join('')}
    set textContent(v){this.innerHTML='';this._raw=null;if(v!=null&&v!=='')this._ins(new Text(v),null)}
    get innerText(){return this.textContent}set innerText(v){this.textContent=v}
    getAttribute(k){k=String(k).toLowerCase();return this._a.has(k)?this._a.get(k):null}setAttribute(k,v){k=String(k).toLowerCase();v=String(v);if(this._a.get(k)===v)return;if(conn(this)){unreg1(this);this._a.set(k,v);reg1(this)}else this._a.set(k,v)}
    hasAttribute(k){return this._a.has(String(k).toLowerCase())}removeAttribute(k){k=String(k).toLowerCase();if(!this._a.has(k))return;if(conn(this)){unreg1(this);this._a.delete(k);reg1(this)}else this._a.delete(k)}
    toggleAttribute(k,f){const on=f===undefined?!this.hasAttribute(k):!!f;if(on)this.setAttribute(k,'');else this.removeAttribute(k);return on}
    getAttributeNS(n,k){return this.getAttribute(k)}setAttributeNS(n,k,v){this.setAttribute(k,v)}hasAttributeNS(n,k){return this.hasAttribute(k)}removeAttributeNS(n,k){this.removeAttribute(k)}
    getAttributeNames(){return [...this._a.keys()]}get attributes(){const a=[...this._a].map(([name,value])=>({name,value}));a.getNamedItem=n=>a.find(x=>x.name===n)||null;return a}
    get id(){return this.getAttribute('id')||''}set id(v){this.setAttribute('id',v)}
    get className(){return this.getAttribute('class')||''}set className(v){this.setAttribute('class',v)}
    get classList(){return this._cl||(this._cl=classListOf(this))}
    get dataset(){if(this._ds)return this._ds;const el=this;return this._ds=new Proxy({},{get:(t,k)=>typeof k==='string'?(el.getAttribute('data-'+kebab(k))??undefined):undefined,
      set:(t,k,v)=>{el.setAttribute('data-'+kebab(k),v);return true},deleteProperty:(t,k)=>{el.removeAttribute('data-'+kebab(k));return true},has:(t,k)=>el.hasAttribute('data-'+kebab(k)),
      ownKeys:()=>[...el._a.keys()].filter(k=>k.startsWith('data-')).map(k=>camel(k.slice(5))),getOwnPropertyDescriptor:(t,k)=>el.hasAttribute('data-'+kebab(k))?{enumerable:true,configurable:true,value:el.getAttribute('data-'+kebab(k))}:undefined})}
    matches(sel){return matchSel(this,sel)}closest(sel){let n=this;while(n&&n.nodeType===1){if(matchSel(n,sel))return n;n=n._p}return null}
    querySelector(sel){return qsa(this,sel,true)[0]||null}querySelectorAll(sel){return qsa(this,sel,false)}
    getElementsByTagName(t){return qsa(this,t,false)}getElementsByClassName(c){return qsa(this,'.'+String(c).trim().split(/\s+/).join('.'),false)}
    cloneNode(deep){const e=doc.createElement(this.localName);for(const [k,v] of this._a)e._a.set(k,v);if(deep){if(this._raw!=null)e._raw=this._raw;else for(const c of this._kids)e._ins(c.cloneNode(true),null)}return e}
    isEqualNode(n){if(!n||n.nodeType!==1||n.tagName!==this.tagName||n._a.size!==this._a.size)return false;for(const [k,v] of this._a)if(n._a.get(k)!==v)return false;
      const a=this._k(),b=n._k();if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(!a[i].isEqualNode(b[i]))return false;return true}
    click(){if(this.disabled)return;if(this.localName==='input'&&/^(checkbox|radio)$/.test(this.type))this.checked=this.type==='radio'?true:!this.checked;dispatch(this,new win.MouseEvent('click',{bubbles:true,cancelable:true}))}
    focus(){doc._active=this}blur(){if(doc._active===this)doc._active=null}scrollIntoView(){}scrollTo(){}scrollBy(){}select(){}setSelectionRange(){}setPointerCapture(){}releasePointerCapture(){}hasPointerCapture(){return false}
    requestFullscreen(){return Promise.resolve()}showModal(){this.setAttribute('open','')}show(){this.setAttribute('open','')}close(){this.removeAttribute('open')}
    animate(){const a={finished:Promise.resolve(),cancel(){},finish(){},play(){},pause(){},reverse(){},onfinish:null,playState:'finished',currentTime:0};win.setTimeout(()=>{if(a.onfinish)a.onfinish()},0);return a}getAnimations(){return []}
    getBoundingClientRect(){return {x:0,y:0,left:0,top:0,right:0,bottom:0,width:0,height:0,toJSON(){return this}}}getClientRects(){return []}
    get offsetWidth(){return 0}get offsetHeight(){return 0}get offsetLeft(){return 0}get offsetTop(){return 0}get offsetParent(){return null}
    get clientWidth(){return 0}get clientHeight(){return 0}get scrollWidth(){return 0}get scrollHeight(){return 0}
    get isContentEditable(){return false}get tabIndex(){return +(this.getAttribute('tabindex')||-1)}set tabIndex(v){this.setAttribute('tabindex',v)}
  }
  /* reflected properties: attribute-backed strings and booleans */
  for(const k of ['title','href','src','type','name','alt','role','lang','dir','placeholder','htmlFor','rel','target','min','max','step','accept','download','autocomplete','inputMode'])
    Object.defineProperty(Element.prototype,k,{get(){const a=k==='htmlFor'?'for':k.toLowerCase();return this.getAttribute(a)??(k==='type'&&this.localName==='button'?'submit':'')},set(v){this.setAttribute(k==='htmlFor'?'for':k.toLowerCase(),v)},configurable:true});
  for(const k of ['hidden','disabled','open','required','readOnly','multiple','autofocus','inert','draggable','defaultChecked'])
    Object.defineProperty(Element.prototype,k,{get(){return this.hasAttribute(k)},set(v){this.toggleAttribute(k,!!v)},configurable:true});
  Object.defineProperty(Element.prototype,'checked',{get(){return this._chk!==undefined?this._chk:this.hasAttribute('checked')},set(v){this._chk=!!v},configurable:true});
  Object.defineProperty(Element.prototype,'value',{get(){if(this._val!==undefined)return this._val;if(this.localName==='select'){const o=this.querySelector('option[selected]')||this.querySelector('option');return o?o.value:''}
      if(this.localName==='textarea')return this.textContent;if(this.localName==='option')return this.getAttribute('value')??this.textContent;return this.getAttribute('value')??(this.type==='checkbox'?'on':'')},set(v){this._val=String(v)},configurable:true});
  Object.defineProperty(Element.prototype,'selectedIndex',{get(){const os=this.querySelectorAll('option');const v=this.value;return os.findIndex(o=>o.value===v)},set(i){const o=this.querySelectorAll('option')[i];if(o)this._val=o.value},configurable:true});
  Object.defineProperty(Element.prototype,'options',{get(){return this.querySelectorAll('option')},configurable:true});
  Object.defineProperty(Element.prototype,'valueAsNumber',{get(){return +this.value},set(v){this.value=v},configurable:true});
  class Fragment extends Element{constructor(){super('#document-fragment')}get nodeType(){return 11}get _html(){return this.innerHTML}}
  class Template extends Element{constructor(){super('template')}get content(){if(!this._c){this._c=new Fragment();this._c._raw=this._raw!=null?this._raw:'';this._raw=''}return this._c}
    set innerHTML(v){this._c=null;this._raw=v==null?'':String(v)}get innerHTML(){return this._c?this._c.innerHTML:this._raw||''}}
  class Canvas extends Element{constructor(){super('canvas');this.width=300;this.height=150}getContext(k){return this._ctx||(this._ctx=ctx2d(this))}
    toDataURL(){return 'data:image/png;base64,'}toBlob(f){win.setTimeout(()=>f(null),0)}transferControlToOffscreen(){return this}}
  const ctx2d=cv=>{const st={canvas:cv,globalAlpha:1,lineWidth:1,font:'10px sans-serif',fillStyle:'#000000',strokeStyle:'#000000',textAlign:'start',textBaseline:'alphabetic',globalCompositeOperation:'source-over',filter:'none',lineCap:'butt',lineJoin:'miter',shadowBlur:0,shadowColor:'rgba(0, 0, 0, 0)',shadowOffsetX:0,shadowOffsetY:0,imageSmoothingEnabled:true,miterLimit:10,lineDashOffset:0,direction:'ltr',letterSpacing:'0px'};
    const grad={addColorStop(){}};const M=()=>({a:1,b:0,c:0,d:1,e:0,f:0,m11:1,m12:0,m21:0,m22:1,m41:0,m42:0,is2D:true,isIdentity:true,inverse(){return M()},multiply(){return M()},translate(){return M()},scale(){return M()},transformPoint:p=>({x:p&&p.x||0,y:p&&p.y||0})});
    const fns={measureText:t=>{const px=+((/([\d.]+)px/.exec(st.font)||[])[1]||10);const w=String(t).length*px*0.55;return {width:w,actualBoundingBoxLeft:0,actualBoundingBoxRight:w,actualBoundingBoxAscent:8,actualBoundingBoxDescent:2,fontBoundingBoxAscent:8,fontBoundingBoxDescent:2}},
      createLinearGradient:()=>grad,createRadialGradient:()=>grad,createConicGradient:()=>grad,createPattern:()=>({setTransform(){}}),
      getImageData:(x,y,w,h)=>({width:w|0,height:h|0,data:new Uint8ClampedArray(Math.max(0,(w|0)*(h|0)*4))}),createImageData:(w,h)=>({width:w|0,height:h|0,data:new Uint8ClampedArray(Math.max(0,(w|0)*(h|0)*4))}),
      getTransform:M,isPointInPath:()=>false,isPointInStroke:()=>false,getLineDash:()=>[],getContextAttributes:()=>({alpha:true})};
    return new Proxy(st,{get:(t,k)=>k in t?t[k]:k in fns?fns[k]:typeof k==='string'?noop:undefined,set:(t,k,v)=>{t[k]=v;return true}})};
  const noop=function(){};
  /* ---------------- HTML parsing (tolerant, enough for the game's own templates) ---------------- */
  function parse(html,ctxTag){const out=[];const stack=[{k:out,tag:ctxTag||''}];const top=()=>stack[stack.length-1];
    const add=n=>{const t=top();if(t.el)t.el._ins(n,null);else t.k.push(n)};
    const re=/<!--([\s\S]*?)-->|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>|<!doctype[^>]*>/gi;
    let i=0,m;while((m=re.exec(html))){if(m.index>i)add(new Text(decode(html.slice(i,m.index))));i=re.lastIndex;
      if(m[1]!==undefined){add(new Comment(m[1]));continue}
      if(m[2]){const t=m[2].toLowerCase();for(let j=stack.length-1;j>0;j--)if(stack[j].tag===t){stack.length=j;break}continue}
      if(!m[3])continue;const tag=m[3].toLowerCase();const el=tag==='canvas'?new Canvas():tag==='template'?new Template():new Element(tag);
      const ar=/([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;let a;while((a=ar.exec(m[4]||''))){el._a.set(a[1].toLowerCase(),decode(a[2]??a[3]??a[4]??''))}
      if(tag==='canvas'){if(el._a.has('width'))el.width=+el._a.get('width');if(el._a.has('height'))el.height=+el._a.get('height')}
      add(el);if(VOID.has(tag)||m[5])continue;
      if(RAW.has(tag)){const end=html.toLowerCase().indexOf('</'+tag,i);const txt=html.slice(i,end<0?html.length:end);if(txt)el._ins(new Text(tag==='textarea'||tag==='title'?decode(txt):txt),null);
        i=end<0?html.length:html.indexOf('>',end)+1;re.lastIndex=i;continue}
      if(tag==='p'||tag==='li'||tag==='option'){const t=top();if(t.tag===tag&&t.el)stack.pop()}
      stack.push({el,tag})}
    if(i<html.length)add(new Text(decode(html.slice(i))));return out}
  /* ---------------- selectors (compound + descendant/child + comma + :not) ---------------- */
  const SC=new Map();
  function compile(sel){let c=SC.get(sel);if(c)return c;const groups=[];for(const g of splitTop(sel,',')){const parts=[];let s=g.trim(),comb=' ';
      while(s){const mm=/^\s*([>+~])\s*/.exec(s);if(mm&&parts.length){comb=mm[1];s=s.slice(mm[0].length);continue}if(/^\s+/.test(s)){s=s.replace(/^\s+/,'');comb=' ';continue}
        let j=0,depth=0,q=null;for(;j<s.length;j++){const ch=s[j];if(q){if(ch===q)q=null;continue}if(ch==='"'||ch==="'"){q=ch;continue}if(ch==='['||ch==='(')depth++;else if(ch===']'||ch===')')depth--;else if(depth===0&&/[\s>+~]/.test(ch))break}
        {const cs=s.slice(0,j);const im=/^#([\w-]+)$/.exec(cs);const tc=compound(cs);parts.push({comb,test:tc,id:im?im[1]:null,tok:tc.tok})}s=s.slice(j);comb=' '}
      groups.push(parts)}if(SC.size>4000)SC.clear();SC.set(sel,groups);return groups}
  function splitTop(s,ch){const out=[];let d=0,q=null,st=0;for(let i=0;i<s.length;i++){const c=s[i];if(q){if(c===q)q=null;continue}if(c==='"'||c==="'")q=c;else if(c==='('||c==='[')d++;else if(c===')'||c===']')d--;else if(c===ch&&d===0){out.push(s.slice(st,i));st=i+1}}out.push(s.slice(st));return out}
  function compound(s){const tests=[];let tok=null,tagTok=null;const re=/^(\*|[a-zA-Z][\w-]*)|#((?:\\.|[\w-])+)|\.((?:\\.|[\w-])+)|\[\s*([\w:-]+)\s*(?:([~^$*|]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+))\s*(i)?)?\s*\]|:(not|is|where|has)\(|:([\w-]+)(?:\(([^)]*)\))?/;
    while(s){const m=re.exec(s);if(!m||m.index!==0)return ()=>false;
      if(m[10]){let d=1,j=m[0].length;for(;j<s.length&&d;j++){if(s[j]==='(')d++;else if(s[j]===')')d--}const inner=s.slice(m[0].length,j-1);const k=m[10];
        tests.push(k==='not'?e=>!matchSel(e,inner):k==='has'?e=>qsa(e,inner,true).length>0:e=>matchSel(e,inner));s=s.slice(j);continue}
      s=s.slice(m[0].length);if(m[1]){if(m[1]!=='*'){const t=m[1].toUpperCase();tagTok={k:'t:'+t,r:'<'+m[1].toLowerCase()};tests.push(e=>e.tagName===t)}}
      else if(m[2]){const v=m[2].replace(/\\/g,'');tok=tok||{k:'#'+v,r:v};tests.push(e=>e.getAttribute('id')===v)}
      else if(m[3]){const v=m[3].replace(/\\/g,'');tok=tok||{k:'c:'+v,r:v};tests.push(e=>{const c=e.getAttribute('class');return !!c&&(' '+c.replace(/\s+/g,' ')+' ').includes(' '+v+' ')})}
      else if(m[4]){tok=tok||{k:'a:'+m[4].toLowerCase(),r:m[4].toLowerCase()};const a=m[4].toLowerCase(),op=m[5],v0=m[6]??m[7]??m[8]??'',ci=!!m[9];const v=ci?v0.toLowerCase():v0;
        tests.push(e=>{let x=e.getAttribute(a);if(x==null)return false;if(ci)x=x.toLowerCase();if(!op)return true;
          return op==='='?x===v:op==='^='?!!v&&x.startsWith(v):op==='$='?!!v&&x.endsWith(v):op==='*='?!!v&&x.includes(v):op==='~='?x.split(/\s+/).includes(v):op==='|='?x===v||x.startsWith(v+'-'):false})}
      else if(m[11]){const p=m[11];tests.push(p==='checked'?e=>!!e.checked:p==='disabled'?e=>!!e.disabled:p==='enabled'?e=>!e.disabled:p==='first-child'?e=>!e.previousElementSibling:
          p==='last-child'?e=>!e.nextElementSibling:p==='only-child'?e=>!e.previousElementSibling&&!e.nextElementSibling:p==='empty'?e=>!e._k().length:p==='scope'||p==='root'?()=>true:
          p==='first-of-type'?e=>!e.parentNode||e.parentNode.children.find(x=>x.tagName===e.tagName)===e:p==='last-of-type'?e=>{const c=e.parentNode?e.parentNode.children.filter(x=>x.tagName===e.tagName):[e];return c[c.length-1]===e}:
          p==='nth-child'?e=>{const n=e.parentNode?e.parentNode.children.indexOf(e)+1:1;const a=String(m[12]||'').trim();return a==='odd'?n%2===1:a==='even'?n%2===0:+a===n}:()=>false)}}
    const f=e=>{for(const t of tests)if(!t(e))return false;return true};f.tok=tok||tagTok;return f}
  function matchParts(e,parts,i){if(!parts[i].test(e))return false;if(i===0)return true;const comb=parts[i].comb;
    if(comb==='>')return !!e.parentElement&&matchParts(e.parentElement,parts,i-1);
    if(comb==='+'){const p=e.previousElementSibling;return !!p&&matchParts(p,parts,i-1)}
    if(comb==='~'){let p=e.previousElementSibling;while(p){if(matchParts(p,parts,i-1))return true;p=p.previousElementSibling}return false}
    let p=e.parentElement;while(p){if(matchParts(p,parts,i-1))return true;p=p.parentElement}return false}
  function matchSel(e,sel){for(const g of compile(String(sel)))if(g.length&&matchParts(e,g,g.length-1))return true;return false}
  function qsa(root,sel,one){const groups=compile(String(sel));const out=[];
    const toks=groups.map(g=>g.length?g[g.length-1].tok:null);const indexed=toks.every(Boolean);
    const hit=c=>{for(const g of groups)if(g.length&&matchParts(c,g,g.length-1))return true;return false};
    /* connected root: the candidates come from the index (rightmost compound's id / class / attribute / tag), in document order */
    if(indexed&&conn(root)){const cand=new Set();for(const t of toks){pendParse(t.r);const s=ixGet(t);if(s)for(const c of s)cand.add(c)}
      for(const c of cand)if(c!==root&&(root===doc||root.contains(c))&&hit(c))out.push(c);
      if(out.length>1){if(one){let b=out[0];for(const c of out)if(before(c,b))b=c;return [b]}out.sort((x,y)=>x===y?0:before(x,y)?-1:1)}return one?out.slice(0,1):out}
    /* otherwise walk; an unparsed subtree whose markup holds none of the tokens cannot hold a match and is never parsed */
    const skip=c=>indexed&&c._raw!=null&&!toks.some(t=>c._raw.indexOf(t.r)>=0);
    const walk=n=>{for(const c of n._k()){if(c.nodeType!==1)continue;if(hit(c)){out.push(c);if(one)return true}if(!skip(c)&&walk(c))return true}return false};
    walk(root);return out}
  /* ---------------- events ---------------- */
  function dispatch(target,e){if(!e||!e.type)return true;const path=[];let n=target;while(n){path.push(n);n=n._p}if(path[path.length-1]===doc&&win.__wt)path.push(win.__wt);
    try{Object.defineProperty(e,'target',{value:target,configurable:true})}catch(x){}
    e.composedPath=()=>path.slice();const run=(node,cap,phase)=>{if(!node._ev||e._stop)return;e.currentTarget=node;e.eventPhase=phase;
      for(const l of node._ev.slice()){if(l.t!==e.type||(phase!==2&&l.c!==cap))continue;if(l.once)node.removeEventListener(l.t,l.f,l.c);
        try{typeof l.f==='function'?l.f.call(node,e):l.f.handleEvent(e)}catch(err){win.__onErr(err)}if(e._stopNow)break}
      const h=node['on'+e.type];if(phase!==1&&typeof h==='function')try{h.call(node,e)}catch(err){win.__onErr(err)}};
    for(let i=path.length-1;i>0&&!e._stop;i--)run(path[i],true,1);if(!e._stop)run(target,true,2);
    if(e.bubbles)for(let i=1;i<path.length&&!e._stop;i++)run(path[i],false,3);e.currentTarget=null;return !e.defaultPrevented}
  /* ---------------- the document ---------------- */
  doc=new Element('#document');Object.defineProperty(doc,'nodeType',{get:()=>9});
  Object.assign(doc,{_active:null,readyState:'loading',visibilityState:'visible',hidden:false,cookie:'',referrer:'',title:'',dir:'ltr',fonts:{ready:Promise.resolve(),load:()=>Promise.resolve([]),check:()=>true,add(){},addEventListener(){}}});
  Object.defineProperty(doc,'hidden',{get:()=>doc.visibilityState==='hidden',set(){},configurable:true});
  const html=new Element('html'),head=new Element('head'),body=new Element('body');doc._ins(html,null);html._ins(head,null);html._ins(body,null);
  Object.assign(doc,{documentElement:html,head,body,
    createElement:t=>{t=String(t).toLowerCase();return t==='canvas'?new Canvas():t==='template'?new Template():new Element(t)},createElementNS:(ns,t)=>new Element(t),createTextNode:t=>new Text(t),createComment:t=>new Comment(t),
    createDocumentFragment:()=>new Fragment(),getElementById(id){id=String(id);let s=IDX.get('#'+id);if(!s){pendParse(id);s=IDX.get('#'+id)}if(!s)return null;let b=null;for(const e of s)if(!b||before(e,b))b=e;return b},
    get activeElement(){return doc._active&&doc._active.isConnected?doc._active:body},hasFocus:()=>true,execCommand:()=>false,elementFromPoint:()=>null,elementsFromPoint:()=>[],
    getSelection:()=>({removeAllRanges(){},addRange(){},toString:()=>''}),createRange:()=>({selectNodeContents(){},setStart(){},setEnd(){},getBoundingClientRect:()=>({left:0,top:0,width:0,height:0})}),
    createTreeWalker(root,show=0xFFFFFFFF,filter=null){const ok=n=>((show>>>((n.nodeType===1?1:n.nodeType===3?3:n.nodeType===8?8:n.nodeType)-1))&1)&&(!filter||(typeof filter==='function'?filter(n):filter.acceptNode(n))===1);
      let list=null;const all=()=>{if(!list){list=[];const w=n=>{for(const c of n._k?n._k():[]){if(ok(c))list.push(c);if(c.nodeType===1||c.nodeType===11)w(c)}};w(root)}return list};let i=-1;
      return {root,currentNode:root,nextNode(){const l=all();if(i+1>=l.length)return null;return this.currentNode=l[++i]},previousNode(){const l=all();if(i<=0)return null;return this.currentNode=l[--i]}}},
    write(){},writeln(){},open(){},close(){},exitFullscreen:()=>Promise.resolve(),fullscreenElement:null,startViewTransition:f=>{f&&f();return {finished:Promise.resolve(),ready:Promise.resolve(),updateCallbackDone:Promise.resolve()}}});
  doc.defaultView=win;
  /* the page's own static markup (everything outside its scripts) so getElementById finds #log, #modal, #mBtns … */
  function loadMarkup(src){/* 01-head writes no <head>/<body> tags: title/style/link/meta go to <head>, the rest is the body */
    src=src.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<!doctype[^>]*>/i,'').replace(/<\/?(html|head|body)\b[^>]*>/gi,'');
    const hd=[];src=src.replace(/<(title|style)\b[\s\S]*?<\/\1>|<(link|meta)\b[^>]*>/gi,m=>{hd.push(m);return ''});
    head.innerHTML=hd.join('\n');body.innerHTML=src;doc.title='Flavius Rule Arena'}
  return {doc,Node,Element,Text,Comment,Fragment,Canvas,parse,loadMarkup,dispatch,decode}}
module.exports={makeDOM,decode};
