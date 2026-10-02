/* 94-v72 — one look for every designer's sets; armor art toggle; the fit tool inside the armor designer.
   • Every Creator Studio list of sets is a grid of cards (`.setgrid`): "Your … · N" first, "🔒 System … · N" after; system
     cards carry sysActs (🔒 System · 📜 In the rolls · Copy & edit) and a gold border, yours crActs + ✦ custom. `setGridify`
     tags the lists after each studio render (DOM pass, so every designer is covered without touching its template).
   • Armor: the printed set is always listed — Settings → Tokens → Armor only swaps its art (sculpted ↔ original drawn).
     Your armor uses the same cards.
   • Weapons: the printed weapon cards as the system set; Copy & edit starts a new weapon from one (`cwFromSystem`).
   • 🎯 Fit (ARMORFIT unlocked) on each printed armor card loads it into the designer's own place in fit mode (`AFIT.mode`);
     the separate fit panel at the bottom is gone. Custom pieces get Right / Left too (ca.f2.L, the left side's own fit). */
const armArtCell=(k,size)=>{const st=typeof SETTINGS!=='undefined'?(SETTINGS.armorStyle||'drawn'):'drawn';
  if(st==='scan'&&typeof cardRef==='function'&&cardRef('a:'+k))return `<span class="cimg armlu setart" style="${cardStyle('a:'+k)};width:${size}px;height:${size}px"></span>`;
  return `<img class="setart" src="${armArtURL(k)}" alt="" style="width:${size}px;height:${size}px;object-fit:contain">`};
const armSub=A=>`${A.slot}${A.pt&&!['helm','chest'].includes(A.pt)?' '+A.pt:''} · ${A.ap} AP · L${A.lv||1}${A.bonus?' · +'+Object.values(A.bonus)[0]+' '+Object.keys(A.bonus)[0]:''}${A.stack?' · stackable':''}`;
function armSetsHTML(){const sys=Object.keys(ARM).filter(k=>!ARM[k].custom);const L=CUSTOM.armor||[];const fit=typeof afitOn==='function'&&afitOn();
  const mine=L.map(c=>{const A=ARM['ca_'+c.id]||c;return `<div class="lrow" style="--pc:#8a5cc0">${armSVG('ca_'+c.id).replace('<svg','<svg class="setart"')}<div class="t"><b>${esc(c.name)}</b><small>${esc(armSub({...A,slot:c.slot,pt:c.pt,ap:c.ap,lv:c.lv}))}</small></div>${crActs('a',c)}</div>`}).join('');
  const sysc=sys.map(k=>{const A=ARM[k];return `<div class="lrow ${ST.ca&&ST.ca.base===k?'on':''}">${armArtCell(k,72)}<div class="t"><b>${esc(A.n)}</b><small>${esc(armSub(A))}</small></div>${sysActs(`data-gs="casys" data-id="${k}"`).replace('</div>',fit?`<button class="btn tksm" type="button" data-afit3="${k}" title="Fit this printed piece on the avatar — applies for everyone">🎯 Fit</button></div>`:'</div>')}</div>`}).join('');
  return `<h4>Your armor · ${L.length}</h4>${L.length?`<div class="list2 setgrid">${mine}</div>`:'<p class="rc-sub">Nothing forged yet — save a piece above, or copy a printed one.</p>'}
   <h4>🔒 System armor · ${sys.length} <span class="rc-sub">the printed pieces · ${(typeof SETTINGS!=='undefined'&&SETTINGS.armorStyle==='scan')?'original drawn art':'sculpted art'} (Settings → Tokens → Armor)</span></h4><div class="list2 setgrid sys">${sysc}</div>`}
/* the armor designer: the lists replaced; the fit mode takes the designer's place */
AFIT.mode=false;
{const base=gearAHTML;gearAHTML=function(){let h=base.apply(this,arguments);try{
  /* drop the old lists (the sculpted grid, if 91 left it, and Your armor) and the bottom fit panel; add the shared ones */
  for(const mark of ['<h4>The sculpted set','<h4>Your armor']){const i=h.indexOf(mark);if(i<0)continue;const j=h.indexOf('<div class="armgrid',i);const c=j>=0?cutDiv(h,j):null;if(c)h=h.slice(0,i)+c[1].slice(j)}
  const fi=h.indexOf('<div class="card2 afit">');if(fi>=0){const c=cutDiv(h,fi);if(c)h=c[1]}
  h=h.replace(/The <b>sculpted set<\/b> below recreates all \d+ printed pieces — pick any of them \(or choose one under <b>Start from<\/b>\) to begin from its rulebook stats\./,'Copy a printed piece from the system set below — or choose one under <b>Start from</b> — to begin from its rulebook stats.');
  if(AFIT.mode&&typeof afitOn==='function'&&afitOn()){const ti=h.indexOf('<div class="trstudio big">');const c=ti>=0?cutDiv(h,ti):null;
    const panel=(_afitHTML()||'').replace('<div class="card2 afit">','<div class="card2 afit fitmode">').replace(/<button class="btn tksm" type="button" data-afhide>[^<]*<\/button>/,'<span><button class="btn tksm" type="button" data-afhide>🔒 Hide the fit tool</button> <button class="btn tksm primary" type="button" data-afdone>✓ Done</button></span>');
    const banner=`<div class="fitbanner">🎯 Fitting a printed piece · <b>${esc((ARM[AFIT.key]||{}).n||'')}</b> · changes apply for everyone</div>`;
    if(c)h=c[1].slice(0,ti)+banner+panel+c[1].slice(ti)}
  h+=armSetsHTML();if(!h.includes('id="caRedraw"'))h+='<button hidden type="button" id="caRedraw" data-gs="caview" data-id="piece"></button>' /* fit mode removed the designer's own hook */}catch(e){console.error(e)}return h}}
const _afitHTML=afitHTML;afitHTML=function(){return ''};
document.addEventListener('click',e=>{const f=e.target.closest('[data-afit3]');if(f){AFIT.key=f.dataset.afit3;AFIT.side='R';AFIT.mode=true;caRedraw();setTimeout(()=>{const b=document.querySelector('.fitbanner');if(b)b.scrollIntoView({block:'start'})},60);return}
  if(e.target.closest('[data-afdone]')){AFIT.mode=false;caRedraw();return}
  if(e.target.closest('[data-afhide]')){AFIT.mode=false;setTimeout(caRedraw,0)}});
/* refresh helpers used by 92 look for .afit — still the same element, now inside the designer */
afitRefresh=function(full){const box=document.querySelector('.afit');if(!box)return;if(full){caRedraw();return}const pv=document.getElementById('afPrev2');if(pv)pv.innerHTML=afitAvatar(AFIT.key);
  const f=afitF(AFIT.key,AFIT.side);box.querySelectorAll('[data-afit2]').forEach(i=>{const v=f[i.dataset.afit2]||0;if(document.activeElement!==i)i.value=v;const b=i.parentElement.querySelector('b');if(b)b.textContent=v})};
/* ---------- weapons: the printed set ---------- */
const CW_GUESS={gladius:'sword',mace:'club',sica:'dagger',hasta:'spear',stones:'sling',thracian:'shield',knives:'dagger',trident:'trident',rudis:'sword',axe:'axe',falcata:'sword',bow:'bow',pugio:'dagger',scissor:'dagger',scutum:'shield',sling:'sling',arcu:'bow',charun:'hammer',flavgl:'sword',jade:'spear',flail:'flail',pilum:'spear',labrys:'axe',psykhe:'scythe',achilles:'shield'};
const sysWeapons=()=>Object.keys(W).filter(k=>!W[k].custom&&W[k].img!=null&&W[k].img>=0&&!/^severed/.test(k)&&W[k].lv>0);
function cwFromSystem(k){const X=W[k];if(!X)return;const d=blankCW();d.name=X.n+' (remade)';d.type=CW_GUESS[k]||'sword';d.art.type=d.type;
  Object.assign(d.stats,{p:X.p||1,r:X.r||1,ammo:X.ammo||0,thrN:X.throw?X.throw.n:0,thrP:X.throw?X.throw.p:0,thrR:X.throw?X.throw.r:0,shield:X.shield?1:0,absorb:X.absorb||1,uses:X.uses||3,cfw:X.cfw?1:0,soul:X.soul?1:0,both:X.both?1:0,atkUses:X.atkUses||0});
  if(X.stones)d.stats.stones=1;if(X.flav)d.stats.flav=1;d.base=k;ST.cw=d}
function wpnSetsHTML(){const sys=sysWeapons();const L=CUSTOM.weapons||[];
  const mine=L.map(c=>{const wk=W['cw_'+c.id];return `<div class="lrow" style="--pc:#8a5cc0"><div class="setart wcard">${cwCardSVG(c)}</div><div class="t"><b>${esc(c.name)}</b><small>${wk?`L${wk.lv} · ${wk.p} dmg · range ${wk.r}`:''}</small></div>${crActs('w',c)}</div>`}).join('');
  const sysc=sys.map(k=>{const X=W[k];return `<div class="lrow"><span class="setart wcard">${cardHTML('w:'+k,'md')}</span><div class="t"><b>${esc(X.n)}</b><small>L${X.lv} · ${X.shield?'shield':X.p+' dmg · range '+X.r}${X.throw?' · throws':''}</small></div>${sysActs(`data-gs="cwsys" data-id="${k}"`)}</div>`}).join('');
  return `<h4>Your weapons · ${L.length}</h4>${L.length?`<div class="list2 setgrid">${mine}</div>`:'<p class="rc-sub">The forge is cold. Nothing yet — save a weapon above, or copy a printed one.</p>'}
   <h4>🔒 System weapons · ${sys.length} <span class="rc-sub">the printed cards</span></h4><div class="list2 setgrid sys">${sysc}</div>`}
{const base=gearWHTML;gearWHTML=function(){let h=base.apply(this,arguments);try{const i=h.indexOf('<h4>Your weapons');if(i>=0)h=h.slice(0,i) /* the old list was the template's tail */;h+=wpnSetsHTML()}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-gs="cwsys"]');if(!b)return;e.stopImmediatePropagation();cwFromSystem(b.dataset.id);ST.gearSub='w';
  const r=document.querySelector('[data-st="tab"][data-v="gear:w"]');if(r)r.click();else openStudio('gear');setTimeout(()=>{const t=document.querySelector('#mBody .trstudio,#cwPrev');if(t)t.scrollIntoView({block:'start'})},120);
  mToast(`Started from the printed <b>${esc(W[b.dataset.id].n)}</b> — make it yours and save.`)},true);
/* ---------- one grid for every designer's lists ---------- */
function setGridify(root){root=root||document.getElementById('mBody');if(!root||!root.querySelector('[data-st="tab"]'))return;
  for(const h of root.querySelectorAll('h4')){if(h.dataset.sg)continue;const t=h.textContent;
    const sys=/^\s*(🔒|🏛)?\s*(The )?(system|printed|sculpted)/i.test(t)||/^\s*System /.test(t);const mine=/^\s*Your /.test(t);if(!sys&&!mine)continue;
    let n=h.nextElementSibling;while(n&&!(n.classList.contains('list2')||n.classList.contains('armgrid'))&&n.tagName!=='H4')n=n.nextElementSibling;if(!n||n.tagName==='H4')continue;
    h.dataset.sg=1;n.classList.add('setgrid');n.classList.remove('one','onecol');if(sys)n.classList.add('sys');
    if(sys&&!/^\s*🔒/.test(t)){const sub=h.querySelector('.rc-sub');const name=t.replace(sub?sub.textContent:'','').replace(/^\s*(🏛\s*)?(The )?(system |System )?/,'').replace(/\s*·.*$/,'').trim();
      const cnt=n.querySelectorAll(':scope > .lrow, :scope > .armcell').length;h.innerHTML=`🔒 System ${esc(name.replace(/^printed /i,''))} · ${cnt} `+(sub?sub.outerHTML:'')}}}
{let T=null;new MutationObserver(()=>{clearTimeout(T);T=setTimeout(()=>{try{setGridify()}catch(e){}},30)}).observe(document.body,{childList:true,subtree:true})}
/* ---------- custom armor: the left side's own fit ---------- */
ST.caSide='R';
{const base=caF2;caF2=function(ca){const f=base.apply(this,arguments);if(ca&&ca.f2&&ca.f2.L)f.L={...ca.f2.L};return f}}
{const base=caOnBodySVG;caOnBodySVG=function(ca,key,mirror){if(mirror&&ca&&ca.eq&&ca.f2&&ca.f2.L){const f2={...ca.f2,...ca.f2.L};return base.call(this,{...ca,f2},key,mirror)}return base.apply(this,arguments)}}
{const base=caMockHTML;caMockHTML=function(d){let h=base.apply(this,arguments);if(!d||!(d.slot==='arm'||d.slot==='leg')||!d.pair)return h;
  const side=ST.caSide==='L'?'L':'R';const f=side==='L'&&d.f2&&d.f2.L?{...caF2(d),...d.f2.L}:caF2(d);
  h=h.replace(/(<label class="rc-sub cavl">Size <b>)\d+(<\/b><input[^>]*value=")\d+/,`$1${f.s}$2${f.s}`).replace(/(<label class="rc-sub cavl">Turn <b>)-?\d+(<\/b><input[^>]*value=")-?\d+/,`$1${f.r}$2${f.r}`);
  return h.replace('<div class="scart caav" id="caAv">',`<div class="seg" style="margin:0 0 6px">${[['R','Right side'],['L','Left side']].map(([s,l])=>`<button type="button" data-caside="${s}" class="${side===s?'on':''}">${l}</button>`).join('')}</div><div class="scart caav" id="caAv">`)}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-caside]');if(!b)return;ST.caSide=b.dataset.caside;caRedraw()});
/* while the left side is chosen, the sliders and the drag edit f2.L (offset mirrored, as the pointer goes) */
document.addEventListener('input',e=>{const i=e.target.closest('input[type="range"][data-cav]');if(!i||!ST.ca||ST.caSide!=='L')return;e.stopImmediatePropagation();const d=ST.ca;const f=caF2(d);
  d.f2={...f,L:{dx:f.dx,dy:f.dy,s:f.s,r:f.r,...(f.L||{}),[i.dataset.cav]:+i.value}};caSync(d);caMockRefresh();const b2=i.parentElement.querySelector('b');if(b2)b2.textContent=i.value},true);
(()=>{let drag=null;const pt=(e,el)=>{const sv=el.querySelector('svg');if(!sv)return null;const r=sv.getBoundingClientRect();return [AV_VB[0]+(e.clientX-r.left)/r.width*AV_VB[2],AV_VB[1]+(e.clientY-r.top)/r.height*AV_VB[3]]};
  document.addEventListener('pointerdown',e=>{const el=e.target.closest('#caAv');if(!el||!ST.ca||ST.caSide!=='L'||!ST.ca.eq||!ST.ca.pair)return;e.stopImmediatePropagation();const p=pt(e,el);if(!p)return;const f=caF2(ST.ca);const L=f.L||{dx:f.dx,dy:f.dy,s:f.s,r:f.r};drag={el,p0:p,L};e.preventDefault()},true);
  document.addEventListener('pointermove',e=>{if(!drag)return;e.stopImmediatePropagation();const p=pt(e,drag.el);if(!p)return;const d=ST.ca;const f=caF2(d);
    d.f2={...f,L:{...drag.L,dx:Math.round(drag.L.dx-(p[0]-drag.p0[0])),dy:Math.round(drag.L.dy+p[1]-drag.p0[1])}};caSync(d);caMockRefresh()},true);
  window.addEventListener('pointerup',()=>{drag=null},true)})();
(()=>{const st=document.createElement('style');st.textContent=`
.setgrid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(178px,1fr))!important;gap:8px}
.setgrid>.lrow{flex-direction:column;align-items:center;text-align:center;gap:6px;padding:10px 8px 8px;border-left-width:1px;border-top:4px solid var(--pc,var(--line2))}
.setgrid>.lrow>:first-child{flex:none;margin:0 auto}
.setgrid>.lrow .t{flex:none;width:100%}.setgrid>.lrow .t b{display:block}.setgrid>.lrow .t small{display:block;font-size:11.5px;color:var(--muted);line-height:1.3}
.setgrid>.lrow .a,.setgrid>.lrow .acts{justify-content:center;flex-wrap:wrap;margin-top:auto;width:100%}
.setgrid>.lrow .cracts .btn{flex:0 1 auto}
.setgrid.sys>.lrow{border-color:rgba(214,171,76,.45);background:linear-gradient(180deg,rgba(214,171,76,.07),transparent 60%),var(--panel2)}
.setgrid>.lrow.on{box-shadow:0 0 0 2px var(--gold) inset}
.setart{display:block;max-width:100%}.setart.wcard{width:150px}.setart.wcard svg,.setart.wcard .cimg{width:150px!important;height:auto}
svg.setart{width:72px;height:72px}
.fitbanner{padding:8px 12px;border:1px solid var(--gold);border-radius:6px;background:rgba(214,171,76,.1);margin:0 0 8px}
.afit.fitmode{border-color:var(--gold)}`;document.head.appendChild(st)})();
