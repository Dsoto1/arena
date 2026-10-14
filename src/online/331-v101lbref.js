/* =========================================================
   331-v101lbref — v1.01 (his answer 2a, 2026-10-14): the Lobby Browser's ↻ Refresh (234's filter bar, [data-lb96r]) wears the sandstone of
   the other main buttons there (306's sd100CSS, secondary, size s — like 321 G16's Refresh / Custom room in the top row). Only a class
   (sd100 lb101r) and a stylesheet: its data-* and 234's click handler are unchanged. Off with 321's board kill switch (B101.off), like G16.
   ========================================================= */
if(typeof lb96BarHTML==='function'){const base=lb96BarHTML;lb96BarHTML=function(){const h=base.apply(this,arguments);
  try{if(typeof B101!=='undefined'&&B101.off)return h;return h.replace(/class="btn tksm" data-lb96r="1"/,_T('class="btn tksm sd100 lb101r" data-lb96r="1"'))}catch(e){return h}}}
try{if(typeof sd100CSS==='function'&&!(typeof B101!=='undefined'&&B101.off)){const st=document.createElement('style');st.id='lb101sd';
  st.textContent=sd100CSS({pri:[],sec:['#onl .lb96f .btn.lb101r[data-lb96r]'],dan:[],m:[]})+
    /* the filter bar keeps its height: the slab sits at the end of the row, no wider than its label */
    '#onl .lb96f .btn.lb101r[data-lb96r]{margin-left:auto;flex:0 0 auto;white-space:nowrap}@media (max-width:600px){#onl .lb96f .btn.lb101r[data-lb96r]{margin-left:0}}';
  document.head.appendChild(st)}}catch(e){console.error(e)}
