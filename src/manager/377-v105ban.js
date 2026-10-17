/* 377-v105ban (v1.05, his F2 call): the Your-ludus week banner loses its row of review chips ("treasury (now N)", "fame", "wins / bouts",
   "fallen · N in all", "N this week"). They repeated the top bar and the Clerk's ledger report. Their source: 17-manager weekReviewHTML's
   .chron.mini, moved into the banner as .lst91 by 202-v91ludus (+ 272's "in all", 294's "N this week"). Only the review chips go: the building
   project chip (.bp104c, 351) stays, the Match Week card, the warnings and the "Week N in review" letter (bout results, Acta Diurna) are untouched.
   Kill switch: localStorage flavius_v105banoff=1. */
function ban105On(){try{return localStorage.getItem('flavius_v105banoff')!=='1'}catch(e){return true}}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{
  if(!ban105On()||typeof h!=='string'||h.indexOf('lst91')<0)return h;
  const T=document.createElement('template');T.innerHTML=h;const R=T.content;let ch=false;
  for(const row of R.querySelectorAll('.lst91')){for(const s of [...row.children])if(!s.classList.contains('bp104c')){s.remove();ch=true}if(!row.children.length)row.remove()}
  if(!ch)return h;const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error(e)}return h}}
