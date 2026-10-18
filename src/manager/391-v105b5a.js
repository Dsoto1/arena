/* =====================================================================
   391-V105B5A · v1.05 beta-5 batch A (his beta-4 notes B76–B78)
   =====================================================================
   · B76 The Armory (225 arm94Sel / arm94HTML chips) lists only fighters in the First team, Second team and Reserves (350 team104 'A'/'B'/'R'):
     not a fighter lent out (team 'L'), not an injured one (g.inj, an Infirmary bed, 352 inj104, 319 r101Block). A fighter on loan TO you who sits in
     one of your groups stays. 225 asks arm105Own(pm) instead of rosterOf(pm); the selection falls back to the first listed fighter.
   · B77 The weekly "contract ends this week" task (88 weekChecklist, also the desk rows) shows one button per fighter that names him
     ("✍ Renew Saxum Invictus") — never a bare "Renew" — for every fighter whose contract ends. Same data-mg="extend" handler.
   · B78 The Manager's "Save & quit" (#mClose.saveq, 17 mgrCloseLabel) moves into the rail, directly below "End the week" (about 10 px gap);
     on phones (the rail is the bottom bar) it ends the bar. The SAME element (#mClose, same handler) is moved: it goes home before the next
     repaint of #mgrBody and before any modal() opens, so the window machinery never loses it.
   Kill switch: localStorage flavius_v105b5aoff=1. Test tv105ac.
   ===================================================================== */
const V105B5A_OFF=(()=>{try{return localStorage.getItem('flavius_v105b5aoff')==='1'}catch(e){return false}})();
/* ---- B76 ---- */
function arm105Own(pm){const all=rosterOf(pm);if(V105B5A_OFF)return all;
  return all.filter(g=>{try{if(g.inj||(typeof inj104==='function'&&inj104(g))||(typeof riv105Barred==='function'&&riv105Barred(g))||(typeof inBed76==='function'&&inBed76(g)))return false;
    if(g.loanTo)return false;const t=typeof team104==='function'?team104(g,pm):'R';return t==='A'||t==='B'||t==='R'}catch(e){return true}})}
if(!V105B5A_OFF){
/* ---- B77 ---- */
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const m=me();if(!Array.isArray(I)||!m)return I;
  const exp=rosterOf(m).filter(g=>g.contract&&g.contract.weeks<=1);
  for(const x of I)if(x.ic==='📜'&&typeof x.btn==='string'&&x.btn.includes('data-mg="extend"')&&exp.length)
    x.btn=exp.map(g=>`<button class="btn tksm" type="button" data-mg="extend" data-id="${g.id}" title="${esc(g.name)}">${_T`✍ Renew ${esc(g.name)}<small>${askWage(g)}/wk</small>`}</button>`).join('')}catch(e){console.error(e)}return I}}
/* ---- B78 ---- */
const SQ105={home:null,btn:null};
function sq105Home(){try{const b=SQ105.btn||document.getElementById('mClose');if(!b||!SQ105.home)return;
  if(b.parentNode!==SQ105.home.p){const n=SQ105.home.n&&SQ105.home.n.parentNode===SQ105.home.p?SQ105.home.n:null;SQ105.home.p.insertBefore(b,n)}b.classList.remove('sq105')}catch(e){console.error(e)}}
function sq105Place(){try{const b=document.getElementById('mClose')||SQ105.btn;const rail=document.querySelector('#mgrBody .tabrow');if(!b||!rail||!rail.querySelector('.btn.endwk'))return;
  if(!SQ105.home){SQ105.home={p:b.parentNode,n:b.nextSibling};SQ105.btn=b}
  if(b.parentNode!==rail||rail.lastElementChild!==b)rail.appendChild(b);b.classList.add('sq105')}catch(e){console.error(e)}}
{const base=mgrPaint;mgrPaint=function(el){sq105Home();const r=base.apply(this,arguments);sq105Place();return r}}
/* 184's rail watcher swaps the live rail row back in after a repaint: take the button out first, put it back after the swap */
{const base=rail90Fix;rail90Fix=function(){sq105Home();const r=base.apply(this,arguments);sq105Place();return r}}
{const base=mgrCloseLabel;mgrCloseLabel=function(){const r=base.apply(this,arguments);sq105Place();return r}}
{const base=modal;modal=function(){sq105Home();return base.apply(this,arguments)}}
{const st=document.createElement('style');st.textContent=`
#mgrBody .tabrow #mClose.sq105{position:static!important;float:none!important;display:block;width:100%!important;height:auto!important;min-height:34px;margin:11px 0 0!important;padding:6px 10px!important;border-radius:5px!important;font-size:13px;font-weight:600;white-space:normal;line-height:1.2;text-align:center}
#mgrBody .tabrow #mClose.sq105[hidden]{display:none}
@media (max-width:700px){#modal.full .railwrap #mClose.sq105{width:auto!important;flex:0 0 auto;margin:0 0 0 6px!important;min-height:0;font-size:12px;padding:6px 8px!important;white-space:nowrap}}`;
  document.head.appendChild(st)}
}
