/* 153-v87card — v0.87 the class card's RULES side on Virgilante's template (tools/art/cardtpl87 → assets/clsback87.webp:
   title banner + parchment + column). Drawn live from the class data, so a rule change updates the card:
   • banner: the class name in its colour (names stay English), the subtitle under it;
   • parchment: the ability text (translated), starting coin / keys, weapons with his icons (weaponChips), armor (location · AP),
     starting items as their tokens.
   • classBack87(k,w) returns the card; the card hover (11-extra #tip) shows it beside the printed figure side for every class
     (printed and custom) — the figure side stays his cls_<key>.webp (printed) / the live figure (custom). */
function classBack87(k,w){const C=CLASSES[k];if(!C)return '';w=w||250;
  const wp=['R','L'].map(h=>C[h]&&W[C[h]]?W[C[h]]:null).filter(Boolean);
  const arm=(C.armor||[]).filter(([a])=>ARM[a]);const seen=new Map();
  for(const [a,loc] of arm){const key=a;const e=seen.get(key)||{a,locs:[]};e.locs.push(loc);seen.set(key,e)}
  const armRows=[...seen.values()].map(({a,locs})=>{const A=ARM[a];return `<li>${_T`<b>${esc(A.n)}</b> <span>${locs.map(l=>esc(LOCN[l]||l)).join(' · ')} · ${A.ap|0} AP</span>`}</li>`}).join('');
  const items=(C.items||[]).map(i=>typeof offerTokHTML==='function'?offerTokHTML(i,22):esc(i)).join('');
  const coin=typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙';
  /* a pale class colour (Veteranus) is darkened for the banner so the name stays readable on the parchment */
  let col=String(C.color||'#8a2a1f');try{const h=col.replace('#','');const n=h.length===3?h.split('').map(x=>parseInt(x+x,16)):[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));const L=(0.299*n[0]+0.587*n[1]+0.114*n[2])/255;if(L>0.55){const f=0.55/L;col='#'+n.map(v=>Math.round(v*f).toString(16).padStart(2,'0')).join('')}}catch(e){}
  return `<div class="cb87" style="width:${w}px;--cc:${esc(col)}" role="img" aria-label="${esc(C.name||k)}">
    <img class="bg" src="${assetURL('clsback87.webp')}" alt="" draggable="false">
    <div class="ttl"><b translate="no">${esc(C.name||k)}</b>${C.sub?`<small>${esc(C.sub)}</small>`:''}</div>
    <div class="body">
      <p class="ab">${esc(C.ab||'')}</p>
      <div class="row"><span class="i87">${coin}<b>${C.coin|0}</b></span><span class="i87">🗝<b>${C.keys|0}</b></span>${items?`<span class="i87 it">${items}</span>`:''}</div>
      ${wp.length?`<div class="sec">${_T`Weapons`}</div><ul>${wp.map(x=>`<li><b>${esc(x.n)}</b> <span class="wc">${typeof weaponChips==='function'?weaponChips(x):''}</span></li>`).join('')}</ul>`:''}
      ${armRows?`<div class="sec">${_T`Armor`}</div><ul>${armRows}</ul>`:''}
    </div></div>`}
/* the hover card: class refs show both sides */
{const tip=document.getElementById('tip');
  if(tip)new MutationObserver(()=>{try{if(tip.hidden||tip.dataset.cb87)return;const c=tip.querySelector('[data-card^="k:"],.cimg[aria-label]');
    const el=document.querySelector('[data-card^="k:"]:hover,[data-card^="b:"]:hover');if(!el)return;const k=el.dataset.card.slice(2);if(!CLASSES[k])return;
    if(tip.querySelector('.cb87'))return;const first=tip.firstElementChild;if(!first)return;
    const w=Math.round((first.getBoundingClientRect().width||250));const wrap=document.createElement('div');wrap.className='cb87pair';
    first.replaceWith(wrap);wrap.appendChild(first);wrap.insertAdjacentHTML('beforeend',classBack87(k,w));
    const r=tip.getBoundingClientRect();if(r.right>innerWidth-8)tip.style.left=Math.max(8,innerWidth-r.width-8)+'px'}catch(e){}}).observe(tip,{childList:true})}
{const css=document.createElement('style');css.textContent=`
.cb87{position:relative;aspect-ratio:724/1044;container-type:inline-size;border-radius:3%/2%;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.5);background:#e9dcc0;flex:none}
.cb87 .bg{position:absolute;inset:0;width:100%;height:100%}
.cb87 .ttl{position:absolute;left:9%;right:9%;top:4.6%;height:11%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;line-height:1.02}
.cb87 .ttl b{font:400 10cqw "Marcellus SC",Georgia,serif;color:var(--cc);text-shadow:0 1px 0 rgba(255,255,255,.5);letter-spacing:.03em}
.cb87 .ttl small{font:500 3.6cqw "Alegreya Sans",sans-serif;color:#5a4128;margin-top:.4cqw}
.cb87 .body{position:absolute;left:7%;right:22%;top:19.5%;bottom:5%;overflow:hidden;color:#2a1c10;font:400 4cqw/1.28 "Alegreya Sans",sans-serif}
.cb87 .ab{margin:0 0 2.6cqw}
.cb87 .row{display:flex;gap:3cqw;align-items:center;flex-wrap:wrap;margin-bottom:2cqw}
.cb87 .i87{display:inline-flex;align-items:center;gap:1cqw}.cb87 .i87 .ico,.cb87 .i87 img{width:5.4cqw;height:5.4cqw}.cb87 .i87 b{font:600 4.6cqw var(--mono,monospace)}
.cb87 .i87.it .rtok{width:6.6cqw!important;height:6.6cqw!important}
.cb87 .sec{font:400 4.4cqw "Marcellus SC",Georgia,serif;color:var(--cc);border-bottom:1px solid rgba(90,65,40,.35);margin:2.2cqw 0 1cqw}
.cb87 ul{list-style:none;margin:0;padding:0}.cb87 li{margin:0 0 1.2cqw}.cb87 li span{color:#5a4128;font-size:3.5cqw}
.cb87 .wc .wchip{font-size:3.2cqw;padding:0 1cqw;background:rgba(255,255,255,.35);border-color:rgba(90,65,40,.35);color:#2a1c10}.cb87 .wc .wchip img{width:3.6cqw;height:3.6cqw}
.cb87pair{display:flex;gap:8px;align-items:flex-start}`;document.head.appendChild(css)}
