/* 237-v96domus — v0.97 ONLINE DOMUS fixes (owner's notes 2026-10-08). CLIENT ONLY. Wraps the finished 175/206 Domus HTML.
   1 · 🏆 Trophies moves to the bottom right of the Domus banner, directly under the treasury count (.db96-tc column).
   2 · the 🧪 Tester panel leaves the Domus (stripped from d89Banner) and sits in 👤 Profile & Settings (l89ProfHTML wrapper);
       still only when hello says tester:true (onl83Tester answers '' otherwise). Its handlers (data-onl83="grant", ids tst83*) are unchanged.
   3 · the worn-armor chips under the avatar: more than 5 → the first 4, then a "＋N more ▾" chip that opens the rest in place ("▴ less"
       folds); open/closed is remembered per viewer in localStorage flavius_dm96arm. Chips keep data-d89off / data-d89homew. Test tv96o. */
const DM96={open:(()=>{try{return localStorage.getItem('flavius_dm96arm')==='1'}catch(e){return false}})()};
function dm96Save(){try{localStorage.setItem('flavius_dm96arm',DM96.open?'1':'0')}catch(e){}}

{const base=d89Banner;d89Banner=function(){let h=base.apply(this,arguments);try{
    h=h.replace(/<details class="tst83"[\s\S]*?<\/details>/,'');
    const tm=h.match(/<button type="button" class="btn tksm tr89b"[\s\S]*?<\/button>/);
    const rm=h.match(/<div class="db89-tre"[\s\S]*?<\/div>/);
    if(tm&&rm){h=h.replace(tm[0],'');h=h.replace(rm[0],`<div class="db96-tc">${rm[0]}${tm[0]}</div>`)}
  }catch(e){console.error(e)}return h}}

{const base=l89ProfHTML;l89ProfHTML=function(){let h=base.apply(this,arguments);try{
    if(ONL.acct&&!l89Guest()&&typeof onl83Tester==='function'){const t=onl83Tester();if(t)h=h.replace(/<\/div>\s*$/,`<div class="card2 pr89-s pr96-tst">${t}</div></div>`)}
  }catch(e){console.error(e)}return h}}

{const base=d89Worn;d89Worn=function(){const h=base.apply(this,arguments);try{
    if(!h)return h;const tpl=document.createElement('template');tpl.innerHTML=h;const chips=[...tpl.content.children];
    if(chips.length<=5)return h;
    const n=chips.length-4;const shown=DM96.open?chips:chips.slice(0,4);
    return shown.map(c=>c.outerHTML).join('')+`<button type="button" class="wr96-more ${DM96.open?'on':''}" data-wr96="toggle" aria-expanded="${DM96.open}">${DM96.open?_T('▴ less'):_T`＋${n} more ▾`}</button>`;
  }catch(e){console.error(e)}return h}}

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-wr96="toggle"]');if(!b)return;e.preventDefault();e.stopPropagation();
  DM96.open=!DM96.open;dm96Save();try{onlRedraw()}catch(x){}},true);

(function(){const st=document.createElement('style');st.textContent=`
#onl .db96-tc{display:flex;flex-direction:column;align-items:flex-end;gap:6px}#onl .db96-tc .tr89b{align-self:flex-end}
#onl .wr96-more{font:700 12px Georgia,serif;color:#f3d58a;background:rgba(0,0,0,.35);border:1px dashed #a8873e;border-radius:9px;padding:3px 10px;cursor:pointer}
#onl .wr96-more:hover,#onl .wr96-more.on{background:rgba(168,135,62,.25)}
@media(max-width:600px){#onl .db96-tc{flex-direction:row;align-items:center;justify-content:space-between;width:100%}}`;document.head.appendChild(st)})();
