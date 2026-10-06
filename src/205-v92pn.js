/* 205-v92pn — v0.92 Play Now (his picks 2026-10-06):
   1 · 🎟 THE STANDS CARD: the spectator options that 187-v90pn left in their own section below the seats (.pn-optc .pn-spect90:
       Spectators #oSpectMode/#oSpect, the Crowd personality fold, Play as a spectator #oSpectMe) move into ONE card beside the
       seat cards in the "Who" row (.seat.stands92, the same card look). The elements are re-homed, not rewritten — 08-setup's
       onchange (ids) and the crowd sliders' [data-crowd] handler keep driving CFG/CROWD. The fold is called "Personalities" and
       opens as a panel over the cards (the seat row keeps its height). "Play as a spectator" is never disabled any more: ticking
       it turns every seat CPU (the seat cards redraw as CPU; the human seats are remembered in CFG.spect92), unticking puts them
       back (seat 1 when none was remembered). A seat switched back to You turns the spectator off.
   2 · THE PLAY GUIDE'S CHARTS ON ONE ROW (53-guide50 .gdash .ggrid + the 69-v56 perk chart): one row, never a second one — the
       charts shrink to fit and the row scrolls sideways when even that is too narrow. Test tv92s. */
function stands92(h){
  const T=document.createElement('template');T.innerHTML=h;const f=T.content;
  const seats=f.querySelector('.pn-who .seats'),sp=f.querySelector('.pn-optc .pn-spect90');
  if(!seats||!sp)return h;
  const card=document.createElement('div');card.className='seat stands92';
  const on=!!CFG.spectHuman&&!CFG.seats.slice(0,CFG.n).some(s=>!s.cpu);if(on)card.classList.add('on92');
  card.innerHTML=`<div class="st92hd"><b>${_T`🎟 The Stands`}</b><small>${on?_T('You watch from the stands'):_T('The crowd of Rome')}</small></div>`;
  /* crowd size: the select (+ number) on its own line, the long note as the label's tip */
  const so=sp.querySelector('.spectopt');
  if(so){so.removeAttribute('style');so.classList.add('st92size');const note=so.querySelector('.rc-sub');
    const sel=so.querySelector('#oSpectMode');
    if(note){if(sel&&sel.disabled){note.removeAttribute('style');note.style.flex='1 0 100%'}else{so.title=note.textContent.trim();note.remove()}}
    const tn=[...so.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(tn){const lb=document.createElement('span');lb.className='st92lbl';lb.textContent=_T('Crowd size');tn.replaceWith(lb)}
    card.appendChild(so)}
  const det=sp.querySelector('details');
  if(det){det.removeAttribute('style');det.classList.add('st92pers');const sm=det.querySelector('summary');
    if(sm){const extra=sm.querySelector('span');sm.removeAttribute('style');sm.textContent=_T('Personalities')+' ';if(extra){extra.removeAttribute('style');extra.className='st92dim';sm.appendChild(extra)}}
    if(CFG.pers92)det.setAttribute('open','');else det.removeAttribute('open');
    card.appendChild(det)}
  const me=sp.querySelector('.spectme');
  if(me){me.removeAttribute('style');me.removeAttribute('title');const cb=me.querySelector('#oSpectMe');
    if(cb){cb.removeAttribute('disabled');if(on)cb.setAttribute('checked','');else cb.removeAttribute('checked')}
    const tx=document.createElement('span');[...me.childNodes].filter(n=>n!==cb).forEach(n=>tx.appendChild(n));me.appendChild(tx);
    me.classList.add('st92me');card.appendChild(me)}
  [...sp.children].forEach(el=>card.appendChild(el));
  seats.appendChild(card);
  const optc=sp.closest('.pn-optc');if(optc)optc.remove();
  return T.innerHTML}
{const base=setupBody;setupBody=function(){
  try{if(CFG&&CFG.spectHuman&&Array.isArray(CFG.seats)&&CFG.seats.slice(0,CFG.n).some(s=>!s.cpu)){CFG.spectHuman=false;CFG.spect92=null}}catch(e){}
  const h=base.apply(this,arguments);try{return stands92(h)}catch(e){console.error(e);return h}}}
/* the tick: after 08-setup's onchange (it sets CFG.spectHuman) — every seat CPU, or the remembered humans back */
function spect92Set(on){
  const seats=CFG.seats.slice(0,CFG.n);
  if(on){CFG.spect92=seats.map((s,i)=>s.cpu?-1:i).filter(i=>i>=0);seats.forEach(s=>{s.cpu=true});CFG.spectHuman=true}
  else{CFG.spectHuman=false;const back=(CFG.spect92&&CFG.spect92.length?CFG.spect92:[0]).filter(i=>CFG.seats[i]&&i<CFG.n);
    if(!seats.some(s=>!s.cpu))back.forEach(i=>{CFG.seats[i].cpu=false});CFG.spect92=null}
  pnRedraw75()}
document.addEventListener('change',e=>{const t=e.target;if(!t||t.id!=='oSpectMe'||!t.closest('#mBody .stands92'))return;spect92Set(t.checked)});
/* the Personalities fold remembers itself for the next redraw */
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.matches&&d.matches('#mBody .stands92 details.st92pers'))CFG.pers92=d.open},true);
(()=>{const st=document.createElement('style');st.textContent=`
.pn-who .seat.stands92{--pc:var(--gold);gap:8px}
.stands92.on92{background:linear-gradient(180deg,rgba(201,164,88,.14),transparent 70%)}
.st92hd{display:grid;gap:0}.st92hd b{font:400 20px var(--display);letter-spacing:.03em;color:var(--gold2)}.st92hd small{color:var(--muted);font-size:12.5px}
.stands92 .st92size{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-size:14px}.stands92 .st92size select{max-width:100%;min-width:0}
.stands92 .st92pers{position:relative}.stands92 .st92pers summary{cursor:pointer;font-size:13.5px}.stands92 .st92dim{display:block;color:var(--dim);font-size:12px}.stands92 .st92lbl{flex:1 0 100%}
.stands92 .st92pers[open]>div{position:absolute;z-index:6;right:-11px;top:calc(100% + 4px);width:max(100%,340px);max-width:calc(100vw - 40px);box-sizing:border-box;padding:10px 12px!important;background:var(--panel);border:1px solid var(--gold);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.55)}
.stands92 .st92me{display:flex;gap:8px;align-items:flex-start;font-size:13px;line-height:1.35;cursor:pointer}.stands92 .st92me input{margin-top:3px;flex:none}
@media (max-width:600px){.stands92 .st92pers[open]>div{position:static;width:auto;max-width:none;box-shadow:none;margin-top:6px}}
.gdash .ggrid{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:minmax(210px,1fr);overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;padding-bottom:2px}
.gdash .ggrid>.gvfig{min-width:0}`;document.head.appendChild(st)})();
