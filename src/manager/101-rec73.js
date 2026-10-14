/* =====================================================================
   101-REC73 · v0.73 — recruiting extras (Virgilante)
   =====================================================================
   • This week's plan: every recruit on your board with their next step, its hours, and whether it fits the hours left.
   • Compare: ⇄ on a fighter's card puts them side by side (two at a time): rating, ratings (as far as scouted), age,
     class, ask, your interest and rank, fit, personality.
   • The signing card: a signature celebrates each fighter you sign (portrait, terms, ratings).
   ===================================================================== */
MGR.cmp=MGR.cmp||[];
function recPlanHTML(){const w=W_(),m=me();const board=w.glads.filter(g=>g.alive!==false&&g.favd&&!g.contract);if(!board.length)return '';let left=w.hours||0;
  const rows=board.map(g=>{const btn=nextStep(g,m);const h=+((btn.match(/(\d+) h/)||[])[1]||0);const label=btn.replace(/<small>[\s\S]*?<\/small>/,'').replace(/<[^>]*>/g,'').replace(/[★⋯]/g,'').trim();const fits=h&&h<=left;if(fits)left-=h;
    return `<div class="rplan ${fits?'fits':h?'later':''}"><b>${esc(g.name)}</b><span>${esc(label)||'—'}</span><span class="rph">${h?h+' h':''}</span><span class="rps">${h?(fits?_T('✓ this week'):_T('next week')):''}</span></div>`}).join('');
  return `<details class="card2 rplanbox" ${(()=>{try{return localStorage.getItem('flavius_rplan')==='0'}catch(e){return false}})()?'':'open'}><summary class="sect" style="margin:0;cursor:pointer">${_T`🗓 This week's plan`} <span class="rc-sub">${_T`next step for each recruit on your board · ${w.hours||0} h left`}</span></summary>${rows}</details>`}
function recCmpHTML(){const w=W_(),m=me();const L=MGR.cmp.map(gById).filter(g=>g&&g.alive!==false);MGR.cmp=L.map(g=>g.id);if(!L.length)return '';
  const col=g=>{const st=gStats(g);const sc=g.scout||0;const r=STATS.map(([k,n])=>`<div class="cmpr"><span>${n}</span><b>${sc>=2?st[k]:sc?`${st[k]-4}–${st[k]+4}`:'?'}</b></div>`).join('');
    const tags=sc&&typeof persTags73==='function'?persTags73(g).join(' · '):_T('scout them');const iv=interestOf(g,m);const rank=suitors(g).findIndex(x=>x.m===m)+1;
    return `<div class="cmpc"><div class="cmph">${mgAvatar(g)}<div><b>${esc(g.name)}</b><div class="rc-sub">${_T`${esc(CLASSES[g.cls]?CLASSES[g.cls].name:g.cls)} · ${g.age||'?'} yrs`}</div></div><button class="btn tksm" type="button" data-reccmp="${g.id}" title="${_T`Take out of the comparison`}">✕</button></div>
      <div class="cmpr">${_T`<span>Rating</span><b>~${estOvr(g).v}</b>`}</div>${r}<div class="cmpr">${_T`<span>Ask</span><b>${askWage(g)}/wk</b>`}</div><div class="cmpr">${_T`<span>Your interest</span><b>${iv}${rank?` · #${rank}`:''}</b>`}</div>
      <div class="cmpr">${_T`<span>Personality</span><b>${esc(tags)}</b>`}</div></div>`};
  return `<div class="card2 cmpbox"><div class="sect" style="margin-top:0">${_T`⇄ Compare`} <span class="rc-sub">${L.length<2?_T('pick one more with ⇄ on a fighter’s card'):_T('side by side')}</span></div><div class="cmpg">${L.map(col).join('')}</div></div>`}
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||MGR.view||MGR.tab!=='recruit')return h;
  const add=recCmpHTML()+recPlanHTML();if(!add)return h;const i=h.indexOf('<div class="roomhd b73 b73-recruit">');const c=i>=0?cutDiv(h,i):null;
  if(c)h=h.slice(0,i)+c[0]+add+h.slice(i+c[0].length)}catch(e){console.error(e)}return h}}
/* ⇄ on the fighter's card */
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{if(!g||g.contract)return h;const on=MGR.cmp.includes(g.id);
  h=h.replace('<div class="rsteps">',`<button class="btn tksm ${on?'on':''}" type="button" data-reccmp="${g.id}" style="margin:0 0 6px">⇄ ${on?_T('In the comparison'):_T('Compare')}</button><div class="rsteps">`)}catch(e){}return h}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-reccmp]');if(!b)return;e.stopPropagation();const id=b.dataset.reccmp;const i=MGR.cmp.indexOf(id);if(i>=0)MGR.cmp.splice(i,1);else{MGR.cmp.push(id);if(MGR.cmp.length>2)MGR.cmp.shift()}MGR_REDRAW()},true);
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('rplanbox'))try{localStorage.setItem('flavius_rplan',e.target.open?'1':'0')}catch(err){}},true);
/* the signing card */
{const base=signGlad;signGlad=function(g,wage,weeks,bonus,pledge){const r=base.apply(this,arguments);try{if(!HEADLESS&&g&&g.contract&&g.contract.mgr===me().id)setTimeout(()=>signCard73(g),60)}catch(e){}return r}}
function signCard73(g){const old=document.getElementById('signCard');if(old)old.remove();const st=gStats(g);const c=g.contract||{};const m=me();
  const d=document.createElement('div');d.id='signCard';d.className='signcard';
  d.innerHTML=`<div class="sgbox"><div class="sghd">${_T`✍ Signed`}</div><div class="sgface">${mgAvatar(g)}</div><div class="sgname">${esc(g.name)}</div><div class="rc-sub">${_T`${esc(CLASSES[g.cls]?CLASSES[g.cls].name:'')} · ${g.age||'?'} yrs · rating ${effOvr(g)}`}</div>
    <div class="sgterms">${_T`<span><b>${coinAmt87(c.wage)}</b> a week</span><span><b>${c.weeks}</b>weeks</span>${g.pledge?_T('<span><b>★</b>main event</span>'):''}`}</div>
    <div class="sgstats">${STATS.map(([k,n])=>`<span title="${n}"><b>${st[k]}</b>${n.slice(0,3)}</span>`).join('')}</div>
    <div class="rc-sub" style="margin-top:6px">${_T`Fights for`} <b style="color:${m.color}">${esc(m.ludus)}</b></div><button class="btn primary" type="button" data-sgclose>${_T`Welcome to the ludus`}</button></div>`;
  document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-sgclose]'))d.remove()})}
(()=>{const st=document.createElement('style');st.textContent=`
.rplanbox{margin:0 0 8px}.rplan{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1.4fr) 40px 90px;gap:8px;align-items:center;padding:4px 0;border-top:1px solid var(--line2);font-size:13px}
.rplan.fits .rps{color:#b7d59d}.rplan.later .rps{color:var(--muted)}.rph{font:12px var(--mono);color:var(--gold2)}
.cmpbox{margin:0 0 8px;border-color:var(--gold)}.cmpg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.cmpc{background:var(--panel2);border-radius:8px;padding:8px}
.cmph{display:grid;grid-template-columns:44px 1fr auto;gap:8px;align-items:center;margin-bottom:6px}.cmph>:first-child{width:44px;height:52px;overflow:hidden}.cmph>:first-child *{max-width:100%;max-height:52px}
.cmpr{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;padding:2px 0;border-top:1px solid #3a2b1f}.cmpr b{font-family:var(--mono);color:var(--bone)}
.signcard{position:fixed;inset:0;z-index:3500;background:rgba(8,5,3,.6);display:grid;place-items:center;animation:csin .3s ease-out}
.sgbox{width:min(320px,92vw);background:linear-gradient(#2a1f17,#1c140e);border:2px solid var(--gold);border-radius:12px;padding:16px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.7);display:grid;gap:6px;justify-items:center}
.sghd{font:12px var(--mono);letter-spacing:.2em;color:var(--gold2);text-transform:uppercase}.sgface{width:96px;height:112px;overflow:hidden}.sgface *{max-width:100%;max-height:112px}
.sgname{font:400 24px var(--display);color:var(--gold2)}.sgterms,.sgstats{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.sgterms span,.sgstats span{display:flex;flex-direction:column;align-items:center;background:var(--panel);border-radius:6px;padding:4px 8px;font-size:11px;color:var(--muted);min-width:52px}.sgterms b,.sgstats b{font:600 16px var(--mono);color:var(--bone)}
@media (max-width:600px){.cmpg{grid-template-columns:1fr}.rplan{grid-template-columns:1fr auto}.rplan>span:nth-child(2){grid-column:1/-1}}`;document.head.appendChild(st)})();
