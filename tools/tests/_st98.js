/* v0.98 helper: the Creator Studio designers are split into tabs (247-v98pn, .st98bar). A test that clicks a control by selector
   first opens the tab that holds it, as a player would. auto(pg) patches pg.click / selectOption / fill / check / uncheck / hover. */
const reveal=(pg,sel)=>pg.evaluate(s=>{try{s=s.split(' >> ')[0];if(typeof ST98==='undefined'||!ST98.leaves)return;const el=document.querySelector(s);if(!el||!(el.closest('.st98off')||el.closest('[data-st98top]')))return;
  const i=ST98.leaves.findIndex(l=>l.els.some(e=>e===el||e.contains(el)));if(i<0)return;const b=document.querySelector('#studio .st98bar [data-st98t="'+i+'"]');if(b)b.click()}catch(e){}},sel).catch(()=>{});
exports.reveal=reveal;
exports.auto=pg=>{for(const m of ['click','selectOption','fill','check','uncheck','hover']){const f=pg[m].bind(pg);pg[m]=async(sel,...a)=>{if(typeof sel==='string')await reveal(pg,sel);return f(sel,...a)}}return pg};
