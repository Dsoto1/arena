/* 259-v98regfix — v0.98 regression fixes found by the old tests (display only).
   1 · The Online landing must fit without scrolling on desktop >= 1300x900 (his rule). 252's two event squares under the playlists made the
       left column ~90 px taller; the top row is set by the right column (week card + a 150 px Acta box), so the Acta box gives back 60 px
       (it scrolls inside anyway) and the squares sit a little tighter. */
(()=>{const st=document.createElement('style');st.textContent=`
@media (min-width:1100px){
#onl .onl-play81.v85 .a81-forum{min-height:88px}
#onl .ev98row{margin-top:6px}
}`;document.head.appendChild(st)})();

/* 2 · The v2 action bar (248) lists every spent weapon as "No attack left with it" — also while Telemachus Interdico! forbids all attacks,
   or an arm is gone, or the weapons are spent. 210's atk92Why names the real reason on the old Attack tile (data-act="none"); the v2 plate
   has no such tile, so the reason goes on each disabled weapon button's tip (and aria-label) when nothing in the group can attack. */
{const base=render;render=function(){const r=base.apply(this,arguments);
  try{if(S&&S.phase==='action'&&!isChariot()){const p=cur();if(p&&!p.cpu){const g=document.querySelector('#actions [data-g96="atk"]');
    if(g&&!g.querySelector('button[data-act]:not([disabled])')){const why=atk92Why(p);
      if(why)for(const b of g.querySelectorAll('.wb98')){const t=(b.dataset.tip||'').split('<br>')[0];b.dataset.tip=(t?t+'<br>':'')+esc(why);
        const al=b.getAttribute('aria-label')||'';b.setAttribute('aria-label',al.replace(/ — [^—]*$/,'')+' — '+why)}}}}}catch(e){console.error(e)}
  return r}}
