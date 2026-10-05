/* 174-v89onlui — his online notes (2026-10-05):
   1 · Online landing: the 📜 Acta of the day in a smaller font (header + lines); 👥 moves to the LEFT of the header as an icon with an ⓘ
       (no "Here now" text); the 🔔 Quiet and ⚔🔔 Turn alerts buttons are gone (defaults: banners/invites pop up; the your-turn title
       flash + horn stay; a desktop notice only if it was allowed before). A stored Quiet is cleared once so nobody is left muted.
   2 · Hovering armor in the Online Armory: no enlarged card pop-up (11-extra #tip) and no "Try it on" header / piece art in the
       try-on box (149 tryOn87Now) — only the avatar with the place it goes marked, and one line with the name.
   3 · The tassets (Tasset Armor, Iron Tasset Armor, Leather Tasset Armor): the avatar is right, their CARD art faced the wrong way —
       assets/armthumb81_{thighplate,femoralia,legwrapsU}.webp mirrored (no code). */
/* ---------------- 1 · the Acta header ---------------- */
try{if(localStorage.getItem('flavius_onlquiet80')==='1'&&!localStorage.getItem('flavius_onlquiet89')){localStorage.setItem('flavius_onlquiet80','0');localStorage.setItem('flavius_onlquiet89','1')}}catch(e){}
if(typeof onlPlayHTML==='function'){const base=onlPlayHTML;onlPlayHTML=function(){let h=base.apply(this,arguments);try{
    h=h.replace(/(<div class="ofor81 acta87" id="onlForum81"><div class="ow-h">)([\s\S]*?)<span class="f80-ctl">[\s\S]*?<\/span><\/div>/,(m,a,t)=>
      `${a}<span class="ac89who"><button type="button" class="btn tksm" data-onl="who" aria-label="${_T`Who is here`}">👥</button><i class="ac89i" data-tip="${_T`👥 Who is here now: the lanistas online — invite, join or watch them.`}">ⓘ</i></span>${t}</div>`)}catch(e){console.error(e)}return h}}
/* ---------------- 2 · the Online Armory hover ---------------- */
document.addEventListener('mouseover',e=>{const c=e.target.closest&&e.target.closest('#onl [data-card^="a:"]');if(!c)return;const tip=document.getElementById('tip');if(tip&&!tip.hidden)tip.hidden=true});
if(typeof tryOn87Now==='function'){const base=tryOn87Now;tryOn87Now=function(el){const r=base.apply(this,arguments);try{const box=document.getElementById('tryOn');
    if(box&&!box.hidden&&el&&el.closest&&el.closest('#onl')){box.classList.add('to89');for(const x of box.querySelectorAll('.tohd,.to87art'))x.remove()}}catch(e){console.error(e)}return r}}
{const st=document.createElement('style');st.textContent=`
#onl .acta87 .ow-h{font-size:14px;align-items:center}
#onl .ac89who{display:inline-flex;align-items:center;gap:2px;margin-right:4px}#onl .ac89who .btn{padding:1px 6px;font-size:13px}
#onl .ac89i{font-style:normal;font-size:12px;color:#a99474;cursor:help}
#onl .ac87{font-size:11.5px;padding:3px 2px}#onl .ac87t{font-size:10.5px}#onl .acta87 .ac87-sub{font-size:10.5px}
#tryOn.to89 .tost{padding-top:2px}`;document.head.appendChild(st)}
