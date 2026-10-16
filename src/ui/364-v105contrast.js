/* 364-v105contrast (v1.05) — player-colour NAMES stay readable on the dark panels. nm() (03-engine) and a few
   panels write a name as <b style="color:#hex"> with the seat/class colour; on the log / panel backgrounds
   (#1f1711, and #3a1f16 in highlighted lines) the red, blue, green, purple and the dark-grey seat colours fell under
   WCAG AA 4.5:1 (purple #8a5cc0 = 3.7:1), so tv93a failed whenever a player drew that colour.
   What it does: one CSS block that lifts ONLY the TEXT colour of those names (b/strong/span with an inline
   color:<seat hex>) to a lighter tint of the same hue (>= 4.6:1 on #3a1f16, >= 5.3:1 on #1f1711). The seat colour itself
   (tokens, chips, borders, backgrounds) is untouched. CSS only: no listeners, no cost per frame.
   Kill switch: localStorage flavius_v105ctoff=1. Test: tv93a (arena scan), the per-colour sweep in the commit message. */
(function(){
  try{if(localStorage.getItem('flavius_v105ctoff')==='1')return}catch(e){}
  const LIFT={'#c0433a':'#d0746d','#4f7fc4':'#6891cc','#4f9a57':'#569e5e','#8a5cc0':'#a480ce','#6f655b':'#948d86'};
  /* ^= : only a style that STARTS with color: (a background/border colour never matches) */
  const css=Object.keys(LIFT).map(h=>['b','strong','span'].map(t=>`${t}[style^="color:${h}"],${t}[style^="color: ${h}"]`).join(',')+`{color:${LIFT[h]}!important}`).join('\n');
  const st=document.createElement('style');st.id='v105ctcss';st.textContent=css;document.head.appendChild(st);
})();
