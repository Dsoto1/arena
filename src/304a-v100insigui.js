/* =====================================================================
   304a-V100INSIGUI · v1.0 — INSIGNIA, the designer (Creator Studio → 🛡 Insignia) + the online Domus's full design
   =====================================================================
   THE DESIGNER replaces the Banner press page (flagStudioHTML) while Insignia is on: six kind buttons (Vexillum · Signum · Flammula ·
   Velarium · Scutum · Parma) with live pictures, the big preview, and tabs Cloth · Pattern · Emblem · Inscription · Sculpt · Trim & wear.
   The sculpt bench is the old one (31-sculpt 'f': ST.fd, the cloth preview #fdPrev) — sculpt layers stay OFFLINE (his 4a). The bench row
   is the old object, adapted at read time (ins100Norm) and saved as v2 only on 💾 Save (with bg/fg/txt/shape kept for old pages).
   Your designs carry the shared row 📜 · 🔒 · Edit · Copy · Delete (37 crActs; Delete asks first through 109 DEL76's [data-cr="del"]);
   the locked SYSTEM designs (empire, cities, Domus ranks, regions, the arena's cloths, Flavius's box) carry 37 sysActs = Copy & edit only.
   ⬇ Use for my house puts the design on the open Manager career's house (m.flag). The signum's aquila topper is the Domus Aurea's alone.
   ONLINE DOMUS: 🎨 Colours & crest grows to the full design minus sculpt — field, emblem colour, second dye, every emblem, pattern,
   inscription (square capitals ≤ 12), signum topper, trim, fringe colour, weathering — sent as domus.look {c1,c2,crest,c3,pat,ins,trim,
   wear,top}; the server's cleanLook89 (111-onlcore "v1.0 INSIGNIA") keeps them. Old pages ignore the new fields.
   Test tv100in.
   ===================================================================== */
const IN100U={k:'vexillum',t:'cloth'};
const IN100_FGS=[['#e2b64a',_T('gold leaf')],['#e8dcc0',_T('chalk')],['#1f1712',_T('black')],['#9b2a1c',_T('madder')],['c2',_T('second dye')]];
const IN100_FCS=[['gold',_T('gold')],['creta',_T('chalk')],['rubia',_T('madder')],['purpura',_T('purple')],['c2',_T('second dye')]];
const IN100_TOPN=[['emb',_T('the house emblem')],['manus',_T('manus (open hand)')],['sym:eagle',_T('aquila')],['sym:laurel',_T('laurel')],['palma',_T('palm')]];
/* the bench design, adapted in place (old fields kept; nothing is stored until Save) */
function in100Bench(){if(typeof ST==='undefined')return null;if(!ST.fd)ST.fd=blankFlag();const f=ST.fd;if(f.c1==null){const n=ins100Norm(f);Object.assign(f,{c1:n.c1,c2:n.c2,fg:n.fg,pat:n.pat,emb:n.emb,top:n.top,ins:n.ins,trim:{...n.trim},wear:0})}
  f.trim=f.trim||{...INS100_TRIM0};return f}
const in100Img=(d,k,px,cls)=>`<img class="${cls||''}" src="${insignia100(d,k,px)}" alt="" draggable="false">`;
function in100HouseOK(){try{return typeof MGR!=='undefined'&&MGR.world&&typeof me==='function'&&!!me()}catch(e){return false}}
function insignia100StudioHTML(){const d=in100Bench();const L=(CUSTOM.flags||[]);const SY=ins100Sys();const K=IN100U.k,T=IN100U.t;const pb=d.fmt==='portrait';
  const kinds=INS100_KS.map(k=>`<button type="button" class="in100kb${k===K?' on':''}" data-in100k="${k}" aria-pressed="${k===K}">${in100Img(d,k,46,'in100ki')}<b>${INS100_KINDS[k].n}</b><small>${esc(INS100_KINDS[k].sub)}</small></button>`).join('');
  const pal=w=>INS100_PAL.map(([c,n,en])=>`<button type="button" class="in100sw${d[w]===c?' on':''}" data-in100pc="${w}" data-c="${c}" title="${esc(en)}"><i style="background:${c}"></i><span>${n}</span></button>`).join('');
  const chip=(attr,v,lab,on,dis,tip)=>`<button type="button" class="in100ch${on?' on':''}" ${attr}="${esc(v)}"${dis?' disabled':''}${tip?` title="${esc(tip)}"`:''}>${esc(lab)}</button>`;
  const tabs=[['cloth',_T('Cloth')],['pat',_T('Pattern')],['emb',_T('Emblem')],['ins',_T('Inscription')],['sculpt',_T('Sculpt')],['trim',_T('Trim & wear')]];
  const pane=(k,inner)=>`<div class="in100pane${T===k?' on':''}" data-in100p="${k}">${inner}</div>`;
  const tr=d.trim||{};const ck=(k,lab,note)=>`<label class="in100tg"><input type="checkbox" data-in100tr="${k}"${(k==='tassels'||k==='topbar'?!!tr[k]:tr[k]!==false)?' checked':''}> ${lab}${note?` <small>${note}</small>`:''}</label>`;
  const panes=pane('cloth',`<h5>${_T`Dye`} <small>${_T`first colour · the cloth`}</small></h5><div class="in100pal">${pal('c1')}</div>
      <h5>${_T`Second dye`} <small>${_T`stripes, borders, roundel, halves`}</small></h5><div class="in100pal">${pal('c2')}</div>
      <h5>${_T`Emblem paint`}</h5><div class="in100chs">${IN100_FGS.map(([c,n])=>chip('data-in100fg',c,n,(c==='c2'?d.c2:c)===d.fg)).join('')}</div>
      <div class="in100cols"><label>${_T`Any colour`}<input type="color" data-in100f="c1" value="${esc(d.c1)}"></label><label>${_T`Second`}<input type="color" data-in100f="c2" value="${esc(d.c2)}"></label><label>${_T`Emblem`}<input type="color" data-in100f="fg" value="${esc(d.fg)}"></label><button type="button" class="btn tksm" data-in100a="roll">${_T`🎲 Roll`}</button></div>`)
    +pane('pat',`<h5>${_T`Pattern`} <small>${_T`woven or painted on the cloth`}</small></h5><div class="in100grid">${INS100_PATS.map(([v,n,en])=>`<button type="button" class="in100pt${d.pat===v?' on':''}" data-in100pat="${v}" title="${esc(en)}">${in100Img({...ins100Norm(d),pat:v,ins:'',emb:v==='clipeus'||v==='laurel'?d.emb:'none'},'vexillum',62)}<span>${esc(n)}</span></button>`).join('')}</div>
      <p class="rc-sub">${_T`Every kind lays the same pattern on its own cloth: clavi run down a vexillum, round a parma's face, across a velarium.`}</p>`)
    +pane('emb',`<h5>${_T`Emblem`} <small>${_T`the house's sign`}</small></h5><div class="in100devs">${chip('data-in100emb','none','—',d.emb==='none')}${INS100_GROUPS.map(([g,list])=>`<div class="in100sep">${esc(g)}</div>`+list.filter(ins100EmbOK).map(v=>`<button type="button" class="in100dv${d.emb===v?' on':''}" data-in100emb="${v}" title="${esc(INS100_N[v]||v)}">${in100Img({...ins100Norm(d),emb:v,pat:'plain',ins:''},'parma',46)}<span>${esc(INS100_N[v]||v)}</span></button>`).join('')).join('')}</div>
      <h5>${_T`Signum topper`} <small>${_T`what crowns the pole`}</small></h5><div class="in100chs">${IN100_TOPN.map(([v,n])=>chip('data-in100top',v,n,(d.top||'emb')===v,v==='sym:eagle',v==='sym:eagle'?_T('The aquila crowns only a Domus Aurea (online)'):'')).join('')}</div>`)
    +pane('ins',`<h5>${_T`Inscription`} <small>${_T`square capitals, ≤ 12`}</small></h5><input type="text" class="in100tin" data-in100f="ins" maxlength="12" value="${esc(d.ins||'')}" placeholder="LVDVS">
      <div class="in100tab">${in100Img({c1:'#000',c2:'#000',fg:'#000',ins:d.ins||'LVDVS'},'velarium',0,'in100tabimg')}</div>
      <p class="rc-sub">${_T`Where it shows: Vexillum in gold leaf on the cloth · Velarium and Signum on a bronze tabula ansata · Scutum, Parma, Flammula never. Chips under 44 px drop it. U → V and J → I, as the Romans cut them.`}</p>`)
    +pane('sculpt',`<h5>${_T`Sculpt layers`} <small>${_T`the shared bench — offline designs only`}</small></h5><div class="trprev scart scflag in100cloth" data-scbprev="f" title="${_T`Drag a shape to move it`}"><img id="fdPrev" draggable="false" src="${houseFlagURI(d)}" alt=""></div>${scbBenchHTML('f')}
      <p class="rc-sub">${_T`Sculpt stays offline: online houses wear the rest of the design.`}</p>`)
    +pane('trim',`<h5>${_T`Trim`}</h5>${ck('gilt',_T('Gilded edge / bronze rim'))}${ck('tassels',_T('Tassels'))}${ck('fringe',_T('Fringe'),_T('vexillum · velarium'))}${ck('bar',_T('Crossbar'))}${ck('topbar',_T('Madder band'),_T('flammula'))}
      <h5>${_T`Fringe & tassel colour`}</h5><div class="in100chs">${IN100_FCS.map(([c,n])=>chip('data-in100fc',c,n,(tr.fc||'gold')===c)).join('')}</div>
      <h5>${_T`Weathering`} <small data-in100wv>${Math.round((+d.wear||0)*100)}</small></h5><input type="range" class="in100rng" data-in100f="wear" min="0" max="100" value="${Math.round((+d.wear||0)*100)}">
      <p class="rc-sub">${_T`Frayed wool, sun-faded dye, chipped paint on the shields. The house chooses.`}</p>`);
  const seg=`<div class="seg pbseg in100seg" role="radiogroup" aria-label="${_T`What the banner is for`}"><button type="button" data-pbfmt="banner" class="${pb?'':'on'}">${_T`🛡 House insignia<small>the rack, masthead, stands, chips</small>`}</button><button type="button" data-pbfmt="portrait" class="${pb?'on':''}">${_T`🖼 Portrait banner<small>behind a portrait's face only</small>`}</button></div>`;
  const mine=L.length?`<div class="in100rack">${L.map(f=>`<div class="in100rc studcard">${in100Img(f,'scutum',84,'in100rcimg')}<b>${esc(f.name||'')}</b>${crActs('f',f)}</div>`).join('')}</div>`:`<p class="rc-sub">${_T`Nothing on the rack yet.`}</p>`;
  const sysK=Object.keys(SY);
  const sys=`<div class="in100rack sys">${sysK.map(k=>{const s=SY[k];return `<div class="in100rc sys" data-in100syscard="${esc(k)}">${in100Img(s.d,s.kind,84,'in100rcimg')}<b>🔒 ${esc(s.n)}</b>${sysActs(`data-in100sys="${esc(k)}"`,{rolls:false})}</div>`}).join('')}</div>`;
  return `<div class="in100" id="in100">${seg}
    <div class="in100hd"><h3>${esc(d.name||_T('Unnamed design'))}</h3><label class="in100nm">${_T`Name`}<input type="text" data-fdf="name" value="${esc(d.name||'')}" maxlength="24" placeholder="${_T`e.g. The Boar of Capua`}"></label></div>
    <div class="in100main"><section class="in100l"><div class="in100kinds" role="group" aria-label="${_T`The six kinds`}">${kinds}</div>
      <div class="in100big" id="in100big"><div class="in100tag">${_T`Preview`} · <b>${INS100_KINDS[K].n}</b> · ${esc(INS100_KINDS[K].sub)}</div>${in100Img(d,K,0,'in100bigimg')}</div>
      <div class="in100small"><span class="rc-sub">${_T`Small sizes:`}</span>${[44,28,18].map(px=>in100Img(d,'parma',px,'in100sm')).join('')}${in100Img(d,'vexillum',40,'in100sm')}</div></section>
     <aside class="in100r"><div class="in100tabs" role="tablist">${tabs.map(([k,n])=>`<button type="button" role="tab" class="${T===k?'on':''}" data-in100t="${k}" aria-selected="${T===k}">${n}</button>`).join('')}</div>${panes}
      <div class="in100foot"><button type="button" class="btn primary" data-in100a="save">${_T`💾 Save design`}</button><button type="button" class="btn" data-in100a="new">${_T`↺ Fresh cloth`}</button>${in100HouseOK()?`<button type="button" class="btn" data-in100a="house">${_T`⬇ Use for my house`}</button>`:''}</div></aside></div>
    <h4>${_T`Your designs · ${L.length}`} <span class="rc-sub">${_T`— 📜 rolls · 🔒 lock · Edit · Copy · Delete (deleting asks first)`}</span></h4>${mine}
    <h4>${_T`🔒 System designs · ${sysK.length}`} <span class="rc-sub">${_T`— the empire, the cities, the Domus ranks, the regions, the arena's cloths, Flavius's box · Copy & edit`}</span></h4>${sys}</div>`}

/* refresh the pictures in place (typing, dragging, sliders) */
function in100Refresh(){const d=in100Bench();if(!d)return;const big=document.querySelector('#in100big .in100bigimg');if(big)big.src=insignia100(d,IN100U.k,0);
  for(const b of document.querySelectorAll('#in100 [data-in100k]')){const i=b.querySelector('img');if(i)i.src=insignia100(d,b.dataset.in100k,46)}
  const sm=document.querySelectorAll('#in100 .in100sm');[44,28,18].forEach((px,i)=>{if(sm[i])sm[i].src=insignia100(d,'parma',px)});if(sm[3])sm[3].src=insignia100(d,'vexillum',40);
  const pv=document.getElementById('fdPrev');if(pv)pv.src=houseFlagURI(d);const h=document.querySelector('#in100 .in100hd h3');if(h)h.textContent=d.name||_T('Unnamed design');
  const tb=document.querySelector('#in100 .in100tabimg');if(tb)tb.src=insignia100({c1:'#000',c2:'#000',fg:'#000',ins:d.ins||'LVDVS'},'velarium',0)}
const in100On=sel=>{const grp=sel.parentElement;if(grp)for(const x of grp.querySelectorAll('.on'))if(x.parentElement===grp)x.classList.remove('on');sel.classList.add('on')};

if(ins100On()){
  /* the Studio tab: "🛡 Insignia" (same key 'flags'); designer tabs of 247 stay off it (it has its own) */
  /* a PORTRAIT banner is only a cloth behind a face: it keeps the old press (44's portrait window + crop), as an old-format row */
  const in100Flat=f=>{if(!f||f.c1==null)return f;const r=ins100Row(f);f.bg=r.bg;f.fg=r.fg;f.txt=r.txt;f.shape=r.shape;for(const k of ['c1','c2','pat','emb','top','ins','trim','wear'])delete f[k];f.v=1;return f};
  {const base=flagStudioHTML;flagStudioHTML=function(){try{if(ST.fd&&ST.fd.fmt==='portrait'){in100Flat(ST.fd);return base.apply(this,arguments)}return insignia100StudioHTML()}catch(e){console.error(e);return base.apply(this,arguments)}}}
  {const base=studioHTML;studioHTML=function(){const h=base.apply(this,arguments);return typeof h==='string'?h.split(_T('🚩 Banners')).join(_T('🛡 Insignia')):h}}
  try{if(typeof ST98_ON!=='undefined'){const i=ST98_ON.indexOf('flags');if(i>=0)ST98_ON.splice(i,1)}}catch(e){}
  /* the bench's sculpt refresh also refreshes every picture */
  try{if(typeof SCB_KIND!=='undefined'&&SCB_KIND.f){const r0=SCB_KIND.f.refresh;SCB_KIND.f.refresh=function(){try{r0.apply(this,arguments)}catch(e){}try{in100Refresh()}catch(e){}}}}catch(e){}
  {const base=flagStudioInput;flagStudioInput=function(input){const r=base.apply(this,arguments);try{in100Refresh()}catch(e){}return r}}

  document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-in100k],[data-in100t],[data-in100pc],[data-in100fg],[data-in100pat],[data-in100emb],[data-in100top],[data-in100fc],[data-in100a],[data-in100sys]');
    if(!b||!b.closest('#in100')||b.disabled)return;const d=in100Bench();if(!d)return;const ds=b.dataset;
    if(ds.in100k){IN100U.k=ds.in100k;in100On(b);for(const x of b.parentElement.children)x.setAttribute('aria-pressed',x===b);const tg=document.querySelector('#in100big .in100tag');if(tg)tg.innerHTML=`${_T`Preview`} · <b>${INS100_KINDS[IN100U.k].n}</b> · ${esc(INS100_KINDS[IN100U.k].sub)}`;in100Refresh();return}
    if(ds.in100t){IN100U.t=ds.in100t;for(const x of document.querySelectorAll('#in100 [data-in100t]')){x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b)}for(const p of document.querySelectorAll('#in100 [data-in100p]'))p.classList.toggle('on',p.dataset.in100p===IN100U.t);return}
    if(ds.in100pc){d[ds.in100pc]=ds.c;in100On(b);const i=document.querySelector(`#in100 [data-in100f="${ds.in100pc}"]`);if(i)i.value=ds.c;in100Refresh();return}
    if(ds.in100fg){d.fg=ds.in100fg==='c2'?d.c2:ds.in100fg;in100On(b);const i=document.querySelector('#in100 [data-in100f="fg"]');if(i)i.value=d.fg;in100Refresh();return}
    if(ds.in100pat){d.pat=ds.in100pat;in100On(b);in100Refresh();return}
    if(ds.in100emb){d.emb=ds.in100emb;for(const x of document.querySelectorAll('#in100 [data-in100emb]'))x.classList.toggle('on',x===b);in100Refresh();return}
    if(ds.in100top){d.top=ds.in100top;in100On(b);in100Refresh();return}
    if(ds.in100fc){d.trim={...(d.trim||{}),fc:ds.in100fc};in100On(b);in100Refresh();return}
    if(ds.in100sys){const s=ins100Sys()[ds.in100sys];if(!s)return;const row=ins100Row(s.d);ST.fd={...blankFlag(),...row,id:'f'+Date.now().toString(36),name:typeof nameSuggest==='function'?nameSuggest('flags',s.n):s.n+' II',layers:[],baked:[],locked:false};
      IN100U.k=s.kind==='wall'?'vexillum':s.kind;if(typeof mToast==='function')mToast(_T`🛡 Copied <b>${esc(s.n)}</b> onto the bench — make it yours.`);studioRedraw();const r=document.getElementById('in100');if(r)r.scrollIntoView({block:'start'});return}
    const a=ds.in100a;
    if(a==='roll'){const P=INS100_PAL;const c1=P[Math.floor(Math.random()*6)][0];let c2=P[Math.floor(Math.random()*8)][0];if(c2===c1)c2='#e8dcc0';d.c1=c1;d.c2=c2;studioRedraw();return}
    if(a==='new'){ST.fd=blankFlag();studioRedraw();return}
    if(a==='save'){if(!String(d.name||'').trim())d.name=_T('Insignia ')+(d.ins||'');if(!nameGuard('flags',d,'[data-fdf="name"]'))return;
      const row={...ins100Row(d),rack:d.rack};if(!row.created)row.created=new Date().toISOString().slice(0,10);Object.assign(d,row);
      CUSTOM.flags=[...(CUSTOM.flags||[]).filter(x=>x.id!==row.id),JSON.parse(JSON.stringify(row))].sort((x,y)=>String(x.name).localeCompare(String(y.name)));await Store.put('customFlags',row.id,row).catch(()=>{});
      if(typeof mToast==='function')mToast(_T`🛡 <b>${esc(row.name)}</b> is ready to fly.`);studioRedraw();return}
    if(a==='house'){if(!in100HouseOK())return;const m=me();const row=ins100Row(d);for(const k of ['id','lockLog','locked','rack','created'])delete row[k];m.flag=row;try{if(typeof saveWorld==='function')saveWorld()}catch(err){}
      if(typeof mToast==='function')mToast(_T`🛡 ${esc(m.ludus||'')} now flies <b>${esc(d.name||_T('this design'))}</b>.`);return}});
  document.addEventListener('input',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#in100'))return;const d=in100Bench();if(!d)return;
    if(t.dataset.in100f){const f=t.dataset.in100f;if(f==='ins'){const v=ins100Caps(t.value,12);if(v!==t.value)t.value=v;d.ins=v}else if(f==='wear'){d.wear=Math.max(0,Math.min(1,(+t.value||0)/100));const o=document.querySelector('#in100 [data-in100wv]');if(o)o.textContent=t.value}else d[f]=t.value;in100Refresh();return}
    if(t.dataset.in100tr){d.trim={...(d.trim||{}),[t.dataset.in100tr]:!!t.checked};in100Refresh();return}});

  /* ---------------- the online Domus: the full design (minus sculpt) ---------------- */
  if(typeof d89LookHTML==='function'){const base=d89LookHTML;d89LookHTML=function(){try{const L=V89D.look||(V89D.look={...d89Look()});const D=(typeof ONL!=='undefined'&&ONL.domus)||{};
      const aurea=!!(D.dr98&&D.dr98.k==='aurea');const nm=ludusInitials(String(D.name||''));const ins=L.ins!=null?L.ins:'';const tr={...INS100_TRIM0,...(L.trim||{})};
      const crests=(ONLC.CREST100||ONLC.CREST89).filter(ins100EmbOK);
      const chip=(attr,v,lab,on,dis,tip)=>`<button type="button" class="in100ch${on?' on':''}" ${attr}="${esc2(v)}"${dis?' disabled':''}${tip?` title="${esc2(tip)}"`:''}>${esc2(lab)}</button>`;
      const ck=(k,lab)=>`<label class="in100tg"><input type="checkbox" data-lk100tr="${k}"${(k==='tassels'||k==='topbar'?!!tr[k]:tr[k]!==false)?' checked':''}> ${lab}</label>`;
      return `<div class="lk89 lk100"><div class="lk89-prev"><img src="${insignia100(L,'scutum',0,{look:1,txt:nm})}" alt=""><img class="lk100v" src="${insignia100(L,'vexillum',0,{look:1,txt:nm})}" alt=""></div><div class="lk89-f">
        <div><label>${_T`Field`}<input type="color" data-lk89="c1" value="${esc2(L.c1)}"></label><label>${_T`Emblem`}<input type="color" data-lk89="c2" value="${esc2(L.c2)}"></label><label>${_T`Second dye`}<input type="color" data-lk89="c3" value="${esc2(L.c3||L.c1)}"></label></div>
        <div class="lk89-g" role="radiogroup" aria-label="${_T`Crest`}">${crests.map(s=>`<button type="button" class="${L.crest===s?'on':''}" data-crest89="${s}" aria-pressed="${L.crest===s}" title="${esc2(INS100_N[s]||s)}"><img src="${insignia100({...L,crest:s},'parma',34,{look:1,txt:''})}" alt=""></button>`).join('')}</div>
        <small class="rc-sub">${_T`Pattern`}</small><div class="in100chs">${INS100_PATS.map(([v,n])=>chip('data-lk100p',v,n,(L.pat||'plain')===v)).join('')}</div>
        <label class="lk100ins">${_T`Inscription`}<input type="text" data-lk100ins maxlength="12" value="${esc2(ins)}" placeholder="${esc2(nm)}"></label>
        <small class="rc-sub">${_T`Signum topper`}</small><div class="in100chs">${IN100_TOPN.map(([v,n])=>chip('data-lk100top',v,n,(L.top||'emb')===v,v==='sym:eagle'&&!aurea,v==='sym:eagle'?_T('The aquila crowns only a Domus Aurea'):'')).join('')}</div>
        <div>${ck('gilt',_T('Gilded edge'))}${ck('tassels',_T('Tassels'))}${ck('fringe',_T('Fringe'))}${ck('bar',_T('Crossbar'))}</div>
        <small class="rc-sub">${_T`Fringe & tassel colour`}</small><div class="in100chs">${IN100_FCS.map(([c,n])=>chip('data-lk100fc',c,n,(tr.fc||'gold')===c)).join('')}</div>
        <label class="lk100w">${_T`Weathering`}<input type="range" data-lk100w min="0" max="100" value="${Math.round((+L.wear||0)*100)}"></label>
        <div class="acts"><button type="button" class="btn primary tksm" data-d89="look">${_T`💾 Fly these colours`}</button><small class="rc-sub">${_T`Sculpt layers stay offline.`}</small></div></div></div>`}catch(e){console.error(e);return base.apply(this,arguments)}}}
  const lk100Pv=()=>{const L=V89D.look;if(!L)return;const nm=ludusInitials(String(((typeof ONL!=='undefined'&&ONL.domus)||{}).name||''));const p=document.querySelector('#onl .lk100 .lk89-prev img');if(p)p.src=insignia100(L,'scutum',0,{look:1,txt:nm});
    const v=document.querySelector('#onl .lk100 .lk100v');if(v)v.src=insignia100(L,'vexillum',0,{look:1,txt:nm});for(const b of document.querySelectorAll('#onl .lk100 [data-crest89] img'))b.src=insignia100({...L,crest:b.parentElement.dataset.crest89},'parma',34,{look:1,txt:''})};
  document.addEventListener('input',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#onl .lk100'))return;if(typeof V89D==='undefined')return;const L=V89D.look=V89D.look||{...d89Look()};
    if(t.dataset.lk100ins!=null){const v=ins100Caps(t.value,12);if(v!==t.value)t.value=v;L.ins=v}else if(t.dataset.lk100w!=null)L.wear=Math.round(+t.value)/100;else if(t.dataset.lk100tr)L.trim={...INS100_TRIM0,...(L.trim||{}),[t.dataset.lk100tr]:!!t.checked};else if(!t.dataset.lk89)return;
    lk100Pv()});
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl .lk100 [data-lk100p],#onl .lk100 [data-lk100top],#onl .lk100 [data-lk100fc]');if(!b||b.disabled||typeof V89D==='undefined')return;const L=V89D.look=V89D.look||{...d89Look()};
    if(b.dataset.lk100p)L.pat=b.dataset.lk100p;else if(b.dataset.lk100top)L.top=b.dataset.lk100top;else L.trim={...INS100_TRIM0,...(L.trim||{}),fc:b.dataset.lk100fc};in100On(b);lk100Pv()});
  /* 💾 sends the whole design (the 175 handler sent only c1/c2/crest) */
  window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-d89="look"]');if(!b||!b.closest('.lk100'))return;e.stopImmediatePropagation();e.preventDefault();
    const L=V89D.look||d89Look();const body={c1:L.c1,c2:L.c2,crest:L.crest};for(const k of ['c3','pat','ins','trim','wear','top'])if(L[k]!=null)body[k]=L[k];
    onlDo(async()=>{const r=await NET.req('domus.look',body);d89Put(r);V89D.look=null;onlToast80(_T('🎨 The house flies its colours.'))})},true);
}

/* ---------------- the designer's CSS (phones: one column, no sideways scroll) ---------------- */
(()=>{if(!ins100On())return;const st=document.createElement('style');st.id='ins100ui';st.textContent=`
.in100{display:grid;gap:10px;min-width:0}.in100 h5{margin:10px 0 4px;font:600 13px var(--display,Georgia),serif;color:var(--gold2,#e8c66a)}.in100 h5 small{font:400 11.5px var(--ui,sans-serif);color:var(--muted,#a3907a);margin-left:4px}
.in100seg{margin:0}.in100hd{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.in100hd h3{margin:0;font:400 22px var(--display,Georgia),serif;color:var(--gold2,#e8c66a)}.in100nm{display:inline-flex;gap:6px;align-items:center;font-size:12px}.in100nm input{width:min(220px,56vw)}
.in100main{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,360px);gap:12px;align-items:start}
.in100l{display:grid;gap:10px;min-width:0}.in100kinds{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.in100kb{display:grid;justify-items:center;gap:2px;padding:6px 4px;border:1px solid rgba(201,162,78,.3);border-radius:8px;background:rgba(0,0,0,.2);color:inherit;cursor:pointer;min-width:0}
.in100kb.on{border-color:#e8c66a;background:rgba(201,162,78,.14)}.in100kb img{height:46px;width:auto;max-width:100%}.in100kb b{font:600 12px var(--display,Georgia),serif}.in100kb small{font-size:10px;color:var(--muted,#a3907a);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.in100big{position:relative;display:grid;place-items:center;min-height:240px;padding:28px 10px 12px;border-radius:10px;background:radial-gradient(ellipse at 50% 40%,#3a2a1c,#120c08)}
.in100big img{max-height:300px;max-width:100%;filter:drop-shadow(0 6px 12px #000b)}.in100tag{position:absolute;left:10px;top:8px;font:500 11px var(--mono,monospace);letter-spacing:.12em;color:#c9b48a;text-transform:uppercase}
.in100small{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}.in100small img{display:block}
.in100r{border:1px solid rgba(201,162,78,.25);border-radius:10px;padding:8px;background:rgba(0,0,0,.18);min-width:0}
.in100tabs{display:flex;flex-wrap:wrap;gap:4px;border-bottom:1px solid rgba(201,162,78,.25);padding-bottom:6px}.in100tabs button{all:unset;cursor:pointer;padding:4px 8px;border-radius:6px;font-size:13px}
.in100tabs button.on{background:rgba(201,162,78,.2);color:#f3e3bd}.in100tabs button:focus-visible{outline:2px solid #e8c66a}
.in100pane{display:none}.in100pane.on{display:block}
.in100pal{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}.in100sw{display:flex;align-items:center;gap:5px;padding:3px 5px;border:1px solid rgba(201,162,78,.25);border-radius:6px;background:rgba(0,0,0,.2);color:inherit;cursor:pointer;font-size:11.5px;min-width:0}
.in100sw i{width:14px;height:14px;border-radius:50%;flex:none;box-shadow:0 0 0 1px #0008}.in100sw span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.in100sw.on{border-color:#e8c66a}
.in100chs{display:flex;flex-wrap:wrap;gap:4px}.in100ch{padding:3px 9px;border:1px solid rgba(201,162,78,.3);border-radius:12px;background:rgba(0,0,0,.2);color:inherit;cursor:pointer;font-size:12px}.in100ch.on{border-color:#e8c66a;background:rgba(201,162,78,.2)}.in100ch:disabled{opacity:.45;cursor:not-allowed}
.in100cols{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-top:8px}.in100cols label{display:grid;font-size:11px;gap:2px}
.in100grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px}.in100pt,.in100dv{display:grid;justify-items:center;gap:2px;padding:4px;border:1px solid rgba(201,162,78,.2);border-radius:8px;background:rgba(0,0,0,.2);color:inherit;cursor:pointer;min-width:0;font-size:11px}
.in100pt.on,.in100dv.on{border-color:#e8c66a;background:rgba(201,162,78,.16)}.in100pt img{height:62px}.in100dv img{height:40px}
.in100devs{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:4px;max-height:330px;overflow:auto}.in100dv span{font-size:10px;text-align:center;line-height:1.1;overflow:hidden;max-width:100%}
.in100sep{grid-column:1/-1;font:600 11px var(--mono,monospace);text-transform:uppercase;letter-spacing:.1em;color:#c9b48a;margin-top:4px}
.in100tin{width:100%;font:500 16px Georgia,serif;letter-spacing:.12em}.in100tab img{max-width:100%;height:auto;max-height:120px;margin-top:6px}
.in100tg{display:flex;gap:6px;align-items:center;font-size:13px;margin:3px 0}.in100tg small{color:var(--muted,#a3907a)}.in100rng{width:100%}
.in100cloth img{width:100%;max-width:320px;border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,.5)}
.in100foot{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;border-top:1px solid rgba(201,162,78,.2);padding-top:8px}
.in100rack{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.in100rc{display:grid;justify-items:center;gap:4px;padding:8px;border:1px solid rgba(201,162,78,.25);border-radius:8px;background:rgba(0,0,0,.18);min-width:0;text-align:center}
.in100rc.sys{border-style:dashed}.in100rc img.in100rcimg{height:84px;width:auto;max-width:100%}.in100rc b{font:600 13px var(--display,Georgia),serif;overflow-wrap:anywhere}.in100rc .cracts{justify-content:center;flex-wrap:wrap}
@media (max-width:760px){.in100main{grid-template-columns:minmax(0,1fr)}.in100kinds{grid-template-columns:repeat(3,minmax(0,1fr))}.in100big{min-height:200px}.in100big img{max-height:230px}.in100rack{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}}
#onl .lk100 .lk89-prev{display:grid;gap:6px;justify-items:center}#onl .lk100 .lk89-prev img{width:84px}#onl .lk100 .lk89-prev img.lk100v{width:66px}
#onl .lk100 .lk89-g img{width:34px;height:34px}#onl .lk100 .lk100ins input{width:9em;letter-spacing:.1em}#onl .lk100 .in100ch{font-size:11px;padding:2px 7px}
@media (max-width:600px){#onl .lk100{flex-direction:column}}`;document.head.appendChild(st)})();
