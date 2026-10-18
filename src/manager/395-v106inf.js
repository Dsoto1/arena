/* =====================================================================
   395-v106inf — v1.06 I1 (his call 2026-10-18; tools/plans/v106/NOTES.md "His calls 2026-10-18"). Manager only, LAYOUT ONLY.
   Kill switch localStorage flavius_v106infoff=1. Test tools/tests/tv106c.js.
   The Infirmary's slim banner (388 .cp105ban, 392's hours chip + Capsarius chip) gets an INJURED chip "⚕ N injured" (.hc106inj: the hours
   chip's look — 392 .hc105 — big number + small label, dim at 0; its own class so every .hc105 lookup still finds the hours chip) before the Capsarius chip, the Medicus hours chip last. N = your fighters hurt (not
   away at war); the chip's tip adds how many still need care this week (95 infirmNeed73). The rail tab keeps only its "⚕ N" (unchanged).
   The banner stays 74 px at 1440. Answers the open beta-5 question (392 B81 left the injured count on the rail only).
   ===================================================================== */
function inf106On(){try{return localStorage.getItem('flavius_v106infoff')!=='1'}catch(e){return true}}
function inf106Chip(n,need){const tip=_T`${n} injured · ${need} still need care this week`;
  return `<div class="hc106inj${n?'':' hc106z'}" data-tip="${esc(tip)}" tabindex="0"><span class="hc106n">⚕ ${n}</span><span class="hc106l">${_T('injured')}</span></div>`}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{
  if(!inf106On()||typeof h!=='string'||MGR.view||MGR.tab!=='infirm'||h.indexOf('cp105ban')<0)return h;const w=W_(),pm=me();if(!w||w.dead||!pm)return h;
  const T=document.createElement('template');T.innerHTML=h;const hd=T.content.querySelector('.roomhd.cp105ban');if(!hd||hd.querySelector('.hc106inj'))return h;
  const n=rosterOf(pm).filter(g=>g.inj&&!g.inj.war).length;let need=n;try{if(typeof infirmNeed73==='function')need=infirmNeed73()}catch(e){}
  const box=document.createElement('template');box.innerHTML=inf106Chip(n,need);const chip=box.content.firstElementChild;
  const at=hd.querySelector(':scope>.bp104c')||hd.querySelector(':scope>.cp105cap')||hd.querySelector(':scope>.hc105');if(at)at.before(chip);else hd.appendChild(chip);
  const d=document.createElement('div');d.appendChild(T.content);return d.innerHTML}catch(e){console.error(e)}return h}}
(()=>{if(typeof document==='undefined'||document.getElementById('inf106css'))return;const st=document.createElement('style');st.id='inf106css';
  st.textContent=`.hc106inj{position:relative;z-index:2;flex:none;display:grid;justify-items:end;align-content:center;gap:0;max-height:52px;box-sizing:border-box;padding:4px 12px;border:1px solid #c9a458;border-radius:6px;background:#1a120de0;text-align:right;cursor:default}
.hc106inj .hc106n{font:400 21px/1.1 var(--display,serif);color:#f0cf7d;white-space:nowrap}.hc106inj .hc106l{font:11px var(--mono,monospace);color:#cbb593;white-space:nowrap}
.hc106inj.hc106z{border-color:#6b5a3e;opacity:.72}.hc106inj.hc106z .hc106n{color:#b8a27c}
@media (max-width:900px){#mgrBody .roomhd.cp105ban .hc106inj{padding:3px 10px}}
@media (max-width:600px){#mgrBody .roomhd.cp105ban .hc106inj .hc106n{font-size:18px}#mgrBody .roomhd.cp105ban .hc106inj .hc106l{font-size:10px}#mgrBody .roomhd.cp105ban.cp105one .hc106inj{order:1}}`;document.head.appendChild(st)})();
