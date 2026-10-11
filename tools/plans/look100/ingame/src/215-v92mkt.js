/* 215-v92mkt — v0.92 THE ONLINE MARKET IN LEVEL TABS (his note 2026-10-06): the Armory's weapons and armor sides each get coloured tabs
   I · II · III (bronze, silver, gold) and show one level at a time — Level I by default on both sides — so the page stays at the top
   instead of scrolling through all three levels. The choice per side is remembered while Online is open (ONL92M). Display only. */
const ONL92M={w:1,a:1};
const MK92_COL={1:'#b07a45',2:'#aeb6be',3:'#e0b84a'};
{const base=onl83Board;onl83Board=function(ch){const h=base.apply(this,arguments);try{const T=document.createElement('template');T.innerHTML=h;
  for(const half of T.content.querySelectorAll('.mb83-half')){const side=half.classList.contains('w')?'w':half.classList.contains('a')?'a':null;if(!side)continue;
    const rows=[...half.querySelectorAll(':scope > .mb83-row')];const lvOf=r=>{const t=(r.querySelector('.mb83-lv')||{}).textContent||'';return t.length};
    const have=[...new Set(rows.map(lvOf))].filter(Boolean).sort();if(!have.length)continue;let cur=ONL92M[side];if(!have.includes(cur))cur=have[0];
    const tabs=document.createElement('div');tabs.className='mk92tabs';tabs.setAttribute('role','tablist');
    tabs.innerHTML=[1,2,3].filter(l=>have.includes(l)).map(l=>{const n=rows.filter(r=>lvOf(r)===l).reduce((s,r)=>s+r.querySelectorAll('.mb83-it').length,0);
      return `<button type="button" role="tab" aria-selected="${l===cur}" class="mk92t${l===cur?' on':''}" data-mk92="${side}|${l}" style="--mk:${MK92_COL[l]}">${_T`Level ${'I'.repeat(l)}`} <small>${n}</small></button>`}).join('');
    const hd=half.querySelector(':scope > .mb83-h');if(hd)hd.after(tabs);else half.prepend(tabs);
    for(const r of rows){if(lvOf(r)!==cur)r.remove();else{r.classList.add('mk92on');r.style.setProperty('--mk',MK92_COL[cur])}}}
  return T.innerHTML}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mk92]');if(!b)return;e.preventDefault();e.stopPropagation();const [s,l]=b.dataset.mk92.split('|');ONL92M[s]=+l;
  try{onlRedraw()}catch(err){console.error(err)}},true);
{const st=document.createElement('style');st.textContent=`
.mk92tabs{display:flex;gap:4px;margin:2px 0 6px;flex-wrap:wrap}
.mk92t{flex:1 1 0;min-width:0;padding:5px 8px;border:1px solid var(--mk);border-bottom-width:3px;border-radius:6px 6px 0 0;background:rgba(20,12,6,.45);color:#d9ccb0;font:600 13px Georgia,serif;cursor:pointer;opacity:.72}
.mk92t small{font:11px var(--mono,monospace);opacity:.75;margin-left:4px}
.mk92t.on{opacity:1;background:color-mix(in srgb,var(--mk) 24%,#1c130b);color:#fff3dc;box-shadow:0 -2px 0 var(--mk) inset}
.mk92t:not(.on):hover{opacity:.95}
.mb83-row.mk92on{border-top:none;border-left:3px solid var(--mk);padding-left:4px}
.mb83-row.mk92on .mb83-lv{color:var(--mk)}`;document.head.appendChild(st)}
/* KITS IN THEIR OWN TAB (his note: "they take over too much"): the Armory's 🛒 Flavius's market · 🏺 Used toggle gains 🎒 Kits; the kits
   panel (206 onlKitsHTML92) shows only there (always open), the market board only on its own tab. */
{const base=onlArmoryHTML;onlArmoryHTML=function(){const h=base.apply(this,arguments);try{const ch=ONL.char;if(!ch||(typeof onlIsGuest82==='function'&&onlIsGuest82()))return h;
  const T=document.createElement('template');T.innerHTML=h;const seg=T.content.querySelector('.mk83seg');if(!seg)return h;const kits=T.content.querySelector('details.kt92');
  const t=typeof ONL83U!=='undefined'?ONL83U.mkt:'board';const on=t==='kits';
  const b0=seg.querySelector('[data-v="board"]');const kb=`<button type="button" data-onl83="mkt" data-v="kits" class="${on?'on':''}">${_T`🎒 Kits`}</button>`;if(b0)b0.insertAdjacentHTML('afterend',kb);else seg.insertAdjacentHTML('beforeend',kb);
  if(on){if(b0)b0.classList.remove('on');let n=seg.nextSibling;while(n){const x=n.nextSibling;n.remove();n=x}
    if(kits){kits.setAttribute('open','');seg.after(kits)}else seg.insertAdjacentHTML('afterend',onlKitsHTML92(ch))}
  else if(kits)kits.remove();
  return T.innerHTML}catch(e){console.error(e);return h}}}
