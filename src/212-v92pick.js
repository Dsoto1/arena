/* 212-v92pick — v0.92 PICK ON THE BODY (his idea 2026-10-06): the severed-part outlines (211 SEV92) double as pickers.
   • 🎯 Focus (the roll and the Focus! card): the target's avatar sits in the window; the locations you may strike are outlined LIGHT MAROON
     (the 💡 best one gold, when hints show it); click one = pick it (the dice / buttons stay and do the same).
   • Distribute health / armor: only the part under the pointer lights (GREEN for HP, darker GRAY for AP) with its before → after;
     the planned +N stays on each part; click = +1 there (the − buttons still take it back).
   A MutationObserver adds the picture when such a window shows; the clicks go through the window's own buttons / CUR_MODAL.done,
   so CPUs, hot seat and online lockstep see the same values as before. Display only. */
const AV92={q:null,how:null,best:null,hp:null};
{const base=chooseLocation;chooseLocation=async function(p,q,how,dmg){const keep={...AV92};AV92.q=q;AV92.how=how;AV92.hp=null;
  try{return await base.apply(this,arguments)}finally{Object.assign(AV92,keep)}}}
{const base=distModal;distModal=function(player,n,why,kind){const keep=AV92.hp,kk=AV92.kind;AV92.hp=player;AV92.kind=kind;const r=base.apply(this,arguments);
  Promise.resolve(r).finally(()=>{AV92.hp=keep;AV92.kind=kk});return r}}
/* the centre of a SEV92 outline (for the +N label) */
const AV92C={};function av92Mid(l){if(AV92C[l])return AV92C[l];const n=(SEV92[l].d.match(/-?\d+(\.\d+)?/g)||[]).map(Number);let x=0,y=0,k=0;for(let i=0;i+1<n.length;i+=2){x+=n[i];y+=n[i+1];k++}return (AV92C[l]={x:x/k,y:y/k})}
/* av92SVG — the fighter's avatar with outlined, clickable locations: opts {locs:[…], col, best, label:l=>text} */
function av92SVG(p,o){let s='';try{s=avatarSVG(p)}catch(e){return ''}
  let ov=o.armor?'<defs><filter id="av92red" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.55 0.35 0.1 0 0.28  0.12 0.12 0.06 0 0.03  0.12 0.12 0.06 0 0.03  0 0 0 0.9 0"/></filter></defs>':'';
  for(const l of o.locs){if(!SEV92[l])continue;const b=l===o.best;const c=b?'#f0cf7d':o.col;const m=av92Mid(l);const t=o.label?o.label(l):'';
    /* Focus (his ask): the armor worn on that location is tinted the same red — what the strike could break */
    let arm='';if(o.armor&&typeof armShares==='function'&&typeof armBox==='function'){try{for(const sh of armShares(p,l)){const A=ARM[sh.pc.key];if(!A||A.caId||sh.cur<=0)continue;const B=armBox(sh.pc.key,l);if(B)arm+=armPieceSVG(B,sh.pc.key,1,null,'av92'+p.id+l)}}catch(e){}
      if(arm)arm=`<g filter="url(#av92red)" pointer-events="none">${arm}</g>`}
    ov+=`<g class="av92l" data-av92="${l}" style="cursor:pointer">${arm}<path d="${SEV92[l].d}" fill="none" stroke="#140f0b" stroke-opacity=".75" stroke-width="3.2" stroke-linejoin="round" pointer-events="none"/><path d="${SEV92[l].d}" fill="${c}" fill-opacity="${b?.26:.2}" stroke="${c}" stroke-width="1.8" stroke-dasharray="3 2" stroke-linejoin="round"/>${t?`<text x="${m.x.toFixed(1)}" y="${m.y.toFixed(1)}" fill="#fff" stroke="#140f0b" stroke-width="2.4" paint-order="stroke" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="middle" pointer-events="none">${t}</text>`:''}<title>${esc(o.tip?o.tip(l):LOCN[l])}</title></g>`}
  return s.replace(/<\/svg>\s*$/,ov+'</svg>')}
function av92Paint(){const box=document.getElementById('mBody');if(!box||document.getElementById('modal').hidden)return;
  const old=box.querySelector(':scope > .av92');
  /* Focus */
  if(AV92.q&&(box.querySelector('.focdice2')||(AV92.how==='card'&&/Focus!/.test((document.getElementById('mTitle')||{}).textContent||'')))){
    let locs,best=null;const dice=[...box.querySelectorAll('.focdice2 [data-loc]')];
    if(dice.length){const set=dice.filter(d=>!d.disabled);locs=[...new Set(set.map(d=>d.dataset.loc))];const b=set.find(d=>d.classList.contains('best'));best=b?b.dataset.loc:null}
    else{locs=LOCS.filter(l=>AV92.q.hp[l]>0);const pb=[...document.querySelectorAll('#mBtns button')].find(b=>/💡/.test(b.textContent));if(pb)best=LOCS.find(l=>pb.textContent.includes(LOCN[l]))||null}
    const key='f|'+locs.join(',')+'|'+best;if(old&&old.dataset.k===key)return;
    const html=`<div class="av92" data-k="${key}" data-kind="focus">${av92SVG(AV92.q,{locs,col:'#d0605a',best,armor:true})}<small>${locs.length?_T('Click where to strike'):_T('Rolling…')}</small></div>`;
    if(old)old.outerHTML=html;else box.insertAdjacentHTML('afterbegin',html);return}
  /* Distribute health */
  if(AV92.hp&&box.querySelector('.dist [data-d]')){const p=AV92.hp;const plus=[...box.querySelectorAll('.dist [data-d="+"]')];
    const locs=plus.filter(b=>!b.disabled).map(b=>b.dataset.l);const plan={};for(const b of box.querySelectorAll('.dist [data-d="+"]')){const v=b.previousElementSibling;plan[b.dataset.l]=v?+v.textContent||0:0}
    const ap=AV92.kind==='ap';const shown=LOCS.filter(l=>locs.includes(l)||plan[l]>0);const key=(ap?'a|':'h|')+shown.map(l=>l+':'+(plan[l]||0)+(locs.includes(l)?'+':'')).join(',');if(old&&old.dataset.k===key)return;
    const now=l=>ap?p.ap[l]:p.hp[l];const html=`<div class="av92 hov92" data-k="${key}" data-kind="hp">${av92SVG(p,{locs:shown,col:ap?'#7c848c':'#4fd06a',label:l=>plan[l]?'+'+plan[l]:'',tip:l=>`${LOCN[l]}: ${now(l)} → ${now(l)+(plan[l]||0)}${locs.includes(l)?' · +1':''}`})}<small>${ap?_T('Hover a part · click to add 1 AP'):_T('Hover a part · click to add 1 HP')}</small></div>`;
    if(old)old.outerHTML=html;else box.insertAdjacentHTML('afterbegin',html);return}
  if(old)old.remove()}
{let pend=false;new MutationObserver(()=>{if(pend)return;pend=true;requestAnimationFrame(()=>{pend=false;try{av92Paint()}catch(e){console.error(e)}})}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','hidden','class']})}
document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('.av92 [data-av92]');if(!g)return;const box=g.closest('.av92');const l=g.dataset.av92;e.preventDefault();e.stopPropagation();
  if(box.dataset.kind==='focus'){const d=[...document.querySelectorAll('#mBody .focdice2 [data-loc]')].find(x=>x.dataset.loc===l&&!x.disabled);if(d){d.click();return}
    if(CUR_MODAL&&AV92.how==='card')CUR_MODAL.done(l);return}
  if(box.dataset.kind==='hp'){const b=document.querySelector(`#mBody .dist [data-d="+"][data-l="${l}"]`);if(b&&!b.disabled)b.click()}},true);
{const st=document.createElement('style');st.textContent=`
#mBody>.av92{float:right;width:150px;margin:0 0 6px 12px;text-align:center}
#mBody>.av92 svg{width:150px;height:auto;display:block}
#mBody>.av92 [data-avtip],#mBody>.av92 [data-avloc]{pointer-events:none}
#mBody>.av92 small{display:block;font-size:11px;color:var(--dim,#a89a80)}
#mBody>.av92 .av92l:hover path{fill-opacity:.38}
#mBody>.av92.hov92 .av92l path{opacity:0;transition:opacity .12s}#mBody>.av92.hov92 .av92l:hover path{opacity:1}
@media(max-width:520px){#mBody>.av92{float:none;margin:0 auto 6px}}`;document.head.appendChild(st)}
