/* =====================================================================
   83-EDSTEPS · v0.63 EVENT DESIGNER — GUIDED STEPS INSIDE THE DESIGNER
   =====================================================================
   The Board / Rounds & rules / Classes & NPCs tabs stay; on top of them a step bar walks a new designer through the
   same fields in order, one step at a time, with ← Back / Next → at the bottom:
     1 Basics (music, name, mode, players, arena, win reward) · 2 Board · 3 Rounds (+ time limits) ·
     4 Rules (arena rules, beast strength, starting bonuses) · 5 Fighters & beasts · 6 Finish (trophy, editor, Summa Rudis,
     notes, what is still missing, Save / Save and play)
   "All sections" shows the classic tabs with everything (remembered per browser: flavius_edall).
   Works on the rendered DOM: the children of #edPane are tagged with their step by the section headings they follow
   (no string surgery on the editor's HTML, so the other modules' sections land in the right step on their own).
   ===================================================================== */
const ED_STEPS=[['basics',_T('Basics'),'rules'],['board',_T('Board'),'board'],['rounds',_T('Rounds'),'rules'],['rules',_T('Rules'),'rules'],['fighters','Fighters & beasts','roster'],['finish',_T('Finish'),'rules']];
let ED_ALL=(()=>{try{return localStorage.getItem('flavius_edall')==='1'}catch(e){return false}})();
{const st=document.createElement('style');st.textContent=`
.edsteps{display:flex;gap:4px;flex-wrap:wrap;margin:6px 0 10px}.edsteps button{border:1px solid var(--line2);background:none;color:var(--muted);border-radius:16px;padding:3px 10px;cursor:pointer;font-size:13px}
.edsteps button.cur{border-color:var(--gold);color:var(--gold2);background:rgba(240,207,125,.08)}.edsteps button.seen{color:var(--text)}
.edsteps .edall{margin-left:auto}.edsteps button.warn::after{content:' ⚠';color:var(--blood2)}
#edPane.stepped>[data-edstep]:not(.edcur){display:none!important}.edstepnav{display:flex;justify-content:space-between;gap:8px;margin:10px 0}`;document.head.appendChild(st)}
function edStepIdx(){return Math.max(0,Math.min(ED_STEPS.length-1,ST.edStep||0))}
/* tag #edPane's children by the headings they follow */
function edTagPane(pane){const k=ED_STEPS[edStepIdx()][0],sub=ST.sub;let cur=sub==='board'?'board':sub==='roster'?'fighters':'basics';
  for(const el of pane.children){const t=(el.textContent||'').trim();
    if(sub==='rules'){
      if(el.querySelector&&el.querySelector('[data-f="trophy"]'))cur='finish';
      else if(el.querySelector&&el.querySelector('[data-edmusic]'))cur='basics';
      else if(el.classList.contains('srcard'))cur='finish';
      else if(el.tagName==='H4'&&/^Rounds/.test(t))cur='rounds';
      else if(el.tagName==='H4'&&/^Arena rules/.test(t))cur='rules';
      else if(el.tagName==='H4'&&/^Notes/.test(t))cur='finish';
      else if(cur==='finish'&&!el.classList.contains('srcard')&&el.querySelector&&el.querySelector('[data-f="name"]'))cur='basics';
    }
    el.dataset.edstep=cur;el.classList.toggle('edcur',cur===k)}}
function edStepsDecorate(){const pane=document.getElementById('edPane');if(!pane||!ST||ST.tab!=='events'||!ST.draft)return;
  const seg=[...document.querySelectorAll('.seg[role="tablist"]')].find(s=>s.querySelector('[data-st="sub"]'));
  let bar=document.querySelector('.edsteps');
  if(!bar&&seg){bar=document.createElement('div');bar.className='edsteps';seg.parentNode.insertBefore(bar,seg)}
  if(!bar)return;const i=edStepIdx();ST.edSeen=ST.edSeen||{};if(!ED_ALL)ST.edSeen[i]=1;
  const errs=typeof eventErrors==='function'?eventErrors(ST.draft):[];
  bar.innerHTML=(ED_ALL?'':ED_STEPS.map(([k,n],j)=>`<button type="button" data-edstep="${j}" class="${j===i?'cur':''} ${ST.edSeen[j]?'seen':''} ${k==='finish'&&errs.length?'warn':''}">${j+1} ${n}</button>`).join(''))
    +`<button type="button" class="edall" data-edall="1">${ED_ALL?_T('🧭 Guided steps'):_T('All sections')}</button>`;
  if(seg)seg.style.display=ED_ALL?'':'none';
  pane.classList.toggle('stepped',!ED_ALL);
  if(ED_ALL){pane.querySelectorAll('.edcur').forEach(x=>x.classList.remove('edcur'));document.querySelectorAll('.edstepnav').forEach(x=>x.remove());return}
  edTagPane(pane);
  let nav=document.querySelector('.edstepnav');if(!nav){nav=document.createElement('div');nav.className='edstepnav';pane.after(nav)}
  nav.innerHTML=`<button class="btn" type="button" data-edgo="-1" ${i?'':'disabled'}>${_T`← Back`}</button>${ED_STEPS[i][0]==='finish'?(errs.length?`<span class="rc-sub" style="color:var(--blood2)">${_T`Still to do: ${errs.map(esc).join(' · ')}`}</span>`:_T('<span class="rc-sub">Ready — save it, or save and play.</span>')):''}<button class="btn primary" type="button" data-edgo="1" ${i<ED_STEPS.length-1?'':'disabled'}>${_T`Next →`}</button>`}
function edGoStep(j){ST.edStep=Math.max(0,Math.min(ED_STEPS.length-1,j));ST.sub=ED_STEPS[ST.edStep][2];
  if(typeof edStudioRedraw==='function')edStudioRedraw();else if(typeof studioRedraw==='function')studioRedraw();
  const p=document.getElementById('edPane');if(p)p.scrollIntoView({block:'nearest'})}
document.addEventListener('click',e=>{const s=e.target.closest('[data-edstep]');if(s&&s.closest('.edsteps')){e.preventDefault();edGoStep(+s.dataset.edstep);return}
  const g=e.target.closest('[data-edgo]');if(g&&!g.disabled){e.preventDefault();edGoStep(edStepIdx()+(+g.dataset.edgo));return}
  const a=e.target.closest('[data-edall]');if(a){e.preventDefault();ED_ALL=!ED_ALL;try{localStorage.setItem('flavius_edall',ED_ALL?'1':'0')}catch(err){}
    if(!ED_ALL)ST.sub=ED_STEPS[edStepIdx()][2];if(typeof edStudioRedraw==='function')edStudioRedraw();else edStepsDecorate()}},true);
/* the classic tabs keep the step in sync when "All sections" is off */
document.addEventListener('click',e=>{const b=e.target.closest('[data-st="sub"]');if(!b||ED_ALL||!ST)return;const j=ED_STEPS.findIndex(x=>x[2]===b.dataset.v);if(j>=0)ST.edStep=j},true);
/* a fresh draft starts at step 1 */
document.addEventListener('click',e=>{const b=e.target.closest('[data-st="new"],[data-st="random"],[data-st="edit"],[data-st="dup"]');if(b&&ST){ST.edStep=0;ST.edSeen={};if(!ED_ALL)setTimeout(()=>{if(ST.tab==='events'&&ST.draft)edGoStep(0)},0)}},true);
new MutationObserver(()=>{const p=document.getElementById('edPane');if(p&&(!p.dataset.edDone||!ED_ALL&&[...p.children].some(c=>!c.dataset.edstep))){p.dataset.edDone='1';try{if(!ED_ALL&&ST&&ST.sub!==ED_STEPS[edStepIdx()][2])ST.edStep=ED_STEPS.findIndex(x=>x[2]===ST.sub);edStepsDecorate()}catch(e){console.error(e)}}})
  .observe(document.body,{childList:true,subtree:true});
