/* 174-v89onlui — his online notes (2026-10-05):
   1 · Online landing: the 📜 Acta of the day in a smaller font (header + lines); 👥 moves to the LEFT of the header as an icon with an ⓘ
       (no "Here now" text); the 🔔 Quiet and ⚔🔔 Turn alerts buttons are gone (defaults: banners/invites pop up; the your-turn title
       flash + horn stay; a desktop notice only if it was allowed before). A stored Quiet is cleared once so nobody is left muted.
   2 · Hovering armor in the Online Armory: no enlarged card pop-up (11-extra #tip) and no "Try it on" header / piece art in the
       try-on box (149 tryOn87Now) — only the avatar with the place it goes marked, and one line with the name.
   3 · The tassets (Tasset Armor, Iron Tasset Armor, Leather Tasset Armor): the avatar is right, their CARD art faced the wrong way —
       assets/armthumb81_{thighplate,femoralia,legwrapsU}.webp mirrored (no code).
   4 · The rail's ⚔ Play stands out: a gold call-to-action button (red-gold gradient, larger, a slow glow), a gap under it before
       the other tabs; on phones (the rail is a row) it stays the first, larger pill. */
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
#tryOn.to89 .tost{padding-top:2px}
#onl .onl-rail button[data-v="play"]{font:700 18px/1.2 var(--display,Georgia),serif;letter-spacing:.04em;text-align:center;padding:12px 14px;margin-bottom:10px;
  color:#fff3d0;background:linear-gradient(180deg,#b8402f,#7c1f16);border:1px solid #e8c96a;box-shadow:0 0 0 1px rgba(0,0,0,.5) inset,0 3px 10px rgba(0,0,0,.45);text-shadow:0 1px 2px rgba(0,0,0,.6);animation:onlplay89 3.2s ease-in-out infinite}
#onl .onl-rail button[data-v="play"]:hover{background:linear-gradient(180deg,#cf4a36,#8c241a);color:#fff}
#onl .onl-rail button[data-v="play"].on{color:#fff3d0;background:linear-gradient(180deg,#c9482f,#86231a);border-color:#f3d58a;box-shadow:0 0 0 2px rgba(243,213,138,.35),0 3px 12px rgba(0,0,0,.5)}
@keyframes onlplay89{0%,100%{box-shadow:0 0 0 1px rgba(0,0,0,.5) inset,0 3px 10px rgba(0,0,0,.45)}50%{box-shadow:0 0 0 1px rgba(0,0,0,.5) inset,0 0 16px rgba(232,180,90,.55)}}
body.calm #onl .onl-rail button[data-v="play"]{animation:none}
@media(max-width:760px){#onl .onl-rail button[data-v="play"]{margin-bottom:0;font-size:16px;padding:9px 16px}}`;document.head.appendChild(st)}
/* 5 · "✖ Leave the Online arena" from the Online window landed on the empty background arena (his report): when the Online
   window closes without starting a match, no live event, no other window and no city → the main menu. */
{const base=onlineOpen;onlineOpen=async function(){const r=await base.apply(this,arguments);
  setTimeout(()=>{try{const live=typeof eventLive==='function'&&eventLive();const city=typeof CITY!=='undefined'&&CITY.open;
    if(!live&&!city&&!CUR_MODAL&&!document.getElementById('onl')&&!(S&&S.onl&&!S.over)&&typeof menuShow==='function')menuShow()}catch(e){console.error(e)}},450);return r}}
