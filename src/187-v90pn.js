/* 187-v90pn — v0.90 part C (Virgilante's notes 2026-10-05):
   1 · PLAY NOW SETUP TIDY (the Single-event setup of 106 pnLayout75 + 108 seat cards + 165 dealt seats), a setupBody wrapper over
       the finished HTML:
       (a) the ⚙ Options fold moves up into the empty space under the event card in the "What · the event" panel (open unless the
           player folded it: CFG.optOpen); the spectator options (Spectators, Crowd personality, Play as a spectator) stay below,
           where Options used to be (.pn-optc → .pn-spect90);
       (b) the "Rules in this build" button (#rulesBtn2) is gone from every setup tab (festival, missio, tournament too);
       (c) "Sound the horns" → "Begin Event" (same #goBtn and handler) in the top bar, right of the calendar line and its Follow;
           the bottom bar keeps the summary and the setup error line;
       (d) ⚡ Quick start → 🎲 Random event ([data-pnrand90]): a random printed event from the list + a random city, you as a random
           class against CPUs — the setup only, Begin Event starts it (UI randomness: Math.random, never the dice);
       (e) ★ Presets removed (stored flavius_pnpresets are left alone, never read).
   2 · VERSION HISTORY (34-notes historyHTML, opened from What's new → Version history and the Rules window's tab): tabs of ten
       versions (1–10 · … · 81–90), newest tab first and open; a tab holds only its versions as compact cards (title, terse bullets,
       the fixes as one 🔧 line). A ranged entry ('0.6–0.11') sits in the tab of its first version. The entries' wording was cut in
       34-notes MILESTONES (v0.52–v0.88). Test tv90p. */
function pnRand90(){try{
  const sel=document.getElementById('evSel');
  const keys=(sel?[...sel.querySelectorAll('option')].map(o=>o.value):Object.keys(EVENTS)).filter(k=>EVENTS[k]&&!EVENTS[k].custom);
  if(!keys.length)return;
  const pickR=a=>a[Math.floor(Math.random()*a.length)];
  /* a different event than the one shown, when there is a choice */
  const evs=keys.length>1?keys.filter(k=>k!==CFG.ev):keys;const ev=pickR(evs);const E=EVENTS[ev];
  const locs=LOCATIONS.map((L,i)=>L?i:-1).filter(i=>i>0);const lp=locs.length>1?locs.filter(i=>i!==CFG.loc):locs;
  CFG.mode='event';CFG.ev=ev;CFG.loc=pickR(lp);CFG.n=clamp(4,E.min,E.max);
  const pool=allowedClasses(E).filter(k=>CLASSES[k]&&!CLASSES[k].custom);const sh=pool.slice().sort(()=>Math.random()-.5);
  while(CFG.seats.length<CFG.n)CFG.seats.push({cls:sh[0],cpu:true,diff:'normal',team:'A'});
  CFG.seats.slice(0,CFG.n).forEach((st,i)=>{st.cls=sh[i%sh.length];st.cpu=i!==0;st.saved=null;st.name=clsSavedName(st.cls);
    if(E.coop)st.team='A';else if(E.teams==='jugg')st.team=i===0?'J':'T';else if(E.teams)st.team=i%2?'B':'A'});
  CFG.spectHuman=false;
  if(typeof SEATS89!=='undefined')SEATS89.off=true;
  pnRedraw75();
}catch(e){console.error(e)}}
function pnTidy90(h){
  const T=document.createElement('template');T.innerHTML=h;const f=T.content;
  f.querySelectorAll('#rulesBtn2').forEach(b=>b.remove());
  const wrap=f.querySelector('.pn75');if(!wrap)return T.innerHTML;
  /* (c)(d)(e) the top bar */
  const acts=wrap.querySelector('.pn-acts');
  if(acts){acts.innerHTML=`<button type="button" class="btn pn-rand90" data-pnrand90 title="${_T`A random event in a random city — you as a random class against CPUs`}">${_T`🎲 Random event`}</button>`;
    const go=wrap.querySelector('#goBtn');if(go){go.textContent=_T('Begin Event');go.classList.add('pn-go90');acts.appendChild(go)}}
  const mb=wrap.querySelector('.pn-go .mbtns');if(mb&&!mb.querySelector('button'))mb.remove();
  /* (a) Options under the event card; the spectators stay below */
  const optc=wrap.querySelector('.pn-optc'),fold=optc&&optc.querySelector('details.optfold'),what=wrap.querySelector('.pn-big');
  if(fold&&what){const opts=fold.querySelector('.opts');const sp=document.createElement('div');sp.className='opts pn-spect90';
    if(opts)[...opts.children].forEach(el=>{if(el.matches('.spectopt,.spectme')||el.tagName==='DETAILS')sp.appendChild(el)});
    if(CFG.optOpen!==false)fold.setAttribute('open','');else fold.removeAttribute('open');
    const box=document.createElement('div');box.className='pn-optw90 setup-opts';box.appendChild(fold);what.insertAdjacentElement('afterend',box);
    optc.innerHTML='';if(sp.children.length){optc.insertAdjacentHTML('afterbegin',`<div class="pn-lbl">${_T`Spectators`}</div>`);optc.appendChild(sp)}else optc.remove()}
  return T.innerHTML}
{const base=setupBody;setupBody=function(){const h=base.apply(this,arguments);try{return pnTidy90(h)}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#mBody .pn75 [data-pnrand90]'))return;e.preventDefault();e.stopPropagation();pnRand90()},true);
(()=>{const st=document.createElement('style');st.textContent=`
.pn75 .pn-cal{flex:0 1 auto}.pn75 .pn-acts{flex:1 1 auto;justify-content:flex-end;align-items:center;flex-wrap:wrap}
.pn-rand90{border-color:var(--gold);color:var(--gold2)}
.pn75 .pn-acts #goBtn.pn-go90{font:400 17px var(--display);letter-spacing:.05em;padding:8px 22px}
.pn-optw90{margin-top:10px;border-top:1px solid var(--line2);padding-top:8px}.pn-optw90 .opts{grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.pn-spect90{display:grid;gap:8px}
.pn75 .pn-start{justify-content:flex-start}
@media (max-width:600px){.pn75 .pn-acts{justify-content:stretch}.pn75 .pn-acts .btn{flex:1 1 auto}}
.h90tabs{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 10px;width:fit-content;max-width:100%}.h90tabs button{flex:none}
.h90grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;align-items:start}
.mstone.h90c{padding:9px 12px}.h90c .mshd{margin-bottom:4px}.h90c .msic{font-size:22px}.h90c .mshd b{font-size:16px}
.h90c ul{font-size:13px;gap:2px;line-height:1.35}.h90fx{margin:5px 0 0;font-size:12px;color:var(--muted);line-height:1.35}`;document.head.appendChild(st)})();

/* ---------- 2 · Version history in tabs of ten ---------- */
function hist90Num(v){const m=String(v).match(/^(\d+)\.(\d+)/);return m?(+m[1])*100+(+m[2]):0} /* v1.0 → 100: the 91–100 tab */
function hist90Tab(v){return Math.max(0,Math.floor((hist90Num(v)-1)/10))}
function hist90Card(m){const fx=(m.fx||[]).filter(Boolean);return `<div class="mstone h90c" data-hv90="${esc(m.v)}"><div class="mshd"><span class="msic">${m.ic}</span><div><div class="msv">v${esc(m.v)}</div><b>${esc(m.t)}</b></div></div><ul>${m.hi.map(h=>`<li>${esc(h)}</li>`).join('')}</ul>${fx.length?`<p class="h90fx">🔧 ${fx.map(esc).join(' · ')}</p>`:''}</div>`}
historyHTML=function(){const by={};MILESTONES.forEach(m=>{const k=hist90Tab(m.v);(by[k]=by[k]||[]).push(m)});
  const tabs=Object.keys(by).map(Number).sort((a,b)=>b-a);const first=tabs[0];
  return `<div class="h90"><div class="seg h90tabs" role="tablist">${tabs.map(k=>`<button type="button" role="tab" data-h90="${k}" class="${k===first?'on':''}" aria-selected="${k===first}">${k*10+1}–${k*10+10>=100?'1.0':k*10+10}</button>`).join('')}</div>
    ${tabs.map(k=>`<div class="h90grid" data-h90p="${k}" ${k===first?'':'hidden'}>${by[k].map(hist90Card).join('')}</div>`).join('')}</div>`};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-h90]');if(!b)return;const box=b.closest('.h90');if(!box)return;
  box.querySelectorAll('[data-h90]').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',String(on))});
  box.querySelectorAll('[data-h90p]').forEach(p=>{p.hidden=p.dataset.h90p!==b.dataset.h90})});
