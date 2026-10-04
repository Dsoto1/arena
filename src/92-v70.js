/* 92-v70 — the printed armor, fitted (Virgilante, v0.70).
   • His fit-tool adjustments (2026-10-02) are baked into ARM_FIT (90-armfit); older saved adjustments are ignored
     (ARMFIT_BAKED), so the tool starts clean from the new defaults.
   • Provocator Manica is a lower-arm piece (bracers); Padded Leg Armor (upper) → Leather Upper Leg Armor.
   • The fit tool is hidden behind a code word (registered hashed; AFIT_ON in localStorage flavius_armfit_on) with a
     🔒 Hide button. Changes still save to the game data (Store armorFit/'sys') and apply for everyone, shown or hidden.
   • Fit tool: Right / Left switch (the left keeps its own dx/dy/w/r under fit.L; untouched it mirrors the right); single
     pieces show on the chosen side only, pairs on both; the drag moves the chosen side the way the pointer goes; no HP/AP
     numbers; the avatar sits lower (AV_VB). Turning mirrors on the left (90-armfit armBox side flag). */
if(ARM.provmanica)ARM.provmanica.pt='lower';
if(ARM.legwrapsU)ARM.legwrapsU.n=_T('Leather Upper Leg Armor');
const ARMFIT_BAKED='2026-10-03T19:57:18Z'; /* v0.81: round 3 (his 12 fits of 2026-10-03 19:57) baked in 123-v81art */
for(const k of Object.keys(ARM_FIT_OVR))delete ARM_FIT_OVR[k];try{localStorage.removeItem('flavius_armfit')}catch(e){}
/* 91 loads the saved doc at start; drop it again if it is the one already baked */
(async()=>{try{const d=await Store.getDoc('armorFit','sys');const old=!d||!d.at||d.at<=ARMFIT_BAKED;const clear=()=>{if(old)for(const k of Object.keys(ARM_FIT_OVR))delete ARM_FIT_OVR[k]};clear();setTimeout(clear,0);setTimeout(clear,2500)}catch(e){}})();
afitSave=function(){clearTimeout(AFIT_T);AFIT_T=setTimeout(()=>{try{Store.put('armorFit','sys',{id:'sys',fits:ARM_FIT_OVR,at:new Date().toISOString()}).catch(()=>{})}catch(e){}},500)};
/* the code word */
const afitOn=()=>{try{return localStorage.getItem('flavius_armfit_on')==='1'}catch(e){return false}};
cheatRegister('h3828236272',()=>{try{localStorage.setItem('flavius_armfit_on','1')}catch(e){}try{const b=document.getElementById('caRedraw');if(b)b.click()}catch(e){}return _T('🎯 <b>Fit the printed set</b> is open in Creator Studio → Gear → Armor. Hide it again with 🔒 beside it.')},'🎯 fit the printed set');
if(typeof CHEAT_SHOW!=='undefined')CHEAT_SHOW.push([[72,89,84,86,89,77,80,91],_T('🎯 Fit the printed set — position, size, turn and mirror every printed armor piece on the avatar (Creator Studio → Gear → Armor)')]);
/* the tool */
AFIT.side='R';
function afitF(k,side){const f=armFit(k)||{};return side==='L'&&f.L?{...f,...f.L}:f}
function afitSet(k,side,patch){const o=ARM_FIT_OVR[k]=ARM_FIT_OVR[k]||{};if(side==='L'){const base=armFit(k)||{};o.L={dx:base.dx||0,dy:base.dy||0,w:base.w,r:base.r||0,...((base.L)||{}),...(o.L||{}),...patch}}else Object.assign(o,patch)}
function afitAvatar(k){const A=ARM[k];const p={id:'afit',name:'fit',hp:{},ap:{},pieces:{}};for(const l of LOCS){p.hp[l]=5;p.ap[l]=0;p.pieces[l]=[]}
  const both=A.slot==='arm'||A.slot==='leg';const R=A.slot==='arm'?'rarm':'rleg',Lf=A.slot==='arm'?'larm':'lleg';
  const locs=!both?[A.slot]:A.pair?[R,Lf]:[AFIT.side==='L'?Lf:R];for(const l of locs){p.pieces[l].push({key:k,n:A.n,ap:A.ap});p.ap[l]=A.ap}
  return avatarSVG(p).replace(/<circle cx="[\d.]+" cy="[\d.]+" r="(?:9|7)"[^>]*\/><text[^>]*>[^<]*<\/text>/g,'').replace(/<text[^>]*>(?:R|L|fist|[^<]*)<\/text>/g,'').replace('viewBox="0 0 150 332"',`viewBox="${AV_VB.join(' ')}"`)}
afitHTML=function(){if(!afitOn())return '';const keys=Object.keys(ARM).filter(k=>!ARM[k].custom&&ARM_FIT[k]);if(!keys.includes(AFIT.key))AFIT.key=keys[0];const A=ARM[AFIT.key];
  const limb=A.slot==='arm'||A.slot==='leg';if(!limb)AFIT.side='R';const f=afitF(AFIT.key,AFIT.side);
  const sl=(k,l,min,max)=>`<label class="rc-sub">${l} <b>${f[k]||0}</b><input type="range" min="${min}" max="${max}" step="1" value="${f[k]||0}" data-afit2="${k}" style="width:100%"></label>`;
  const done=keys.filter(k=>ARM_FIT_OVR[k]).length;
  return `<div class="card2 afit"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h4 style="margin:0">${_T`🎯 Fit the printed set`} <span class="rc-sub">${_T`${done} adjusted · saved in the game data`}</span></h4><button class="btn tksm" type="button" data-afhide>${_T`🔒 Hide the fit tool`}</button></div>
   <div class="afgrid"><div id="afPrev2" class="afprev" title="${_T`Drag the piece · the wheel scales it`}">${afitAvatar(AFIT.key)}</div>
   <div><label>${_T`Piece`}<select data-afkey>${keys.map(k=>`<option value="${k}" ${k===AFIT.key?'selected':''}>${ARM_FIT_OVR[k]?'✎ ':''}${esc(ARM[k].n)} · ${ARM[k].slot}${ARM[k].pt&&ARM[k].pt!=='helm'&&ARM[k].pt!=='chest'?' '+ARM[k].pt:''}</option>`).join('')}</select></label>
    ${limb?`<div class="seg" style="margin:6px 0">${[['R',_T('Right side')],['L',_T('Left side')]].map(([s,l])=>`<button type="button" data-afside="${s}" class="${AFIT.side===s?'on':''}">${l}</button>`).join('')}</div><p class="rc-sub" style="margin:0 0 4px">${AFIT.side==='L'?(f.L||(ARM_FIT_OVR[AFIT.key]&&ARM_FIT_OVR[AFIT.key].L)?_T('The left side has its own fit.'):_T('The left side mirrors the right until you move it.')):_T('The left side mirrors this unless you fit it separately.')}</p>`:''}
    ${sl('dx',_T('Across'),-60,60)}${sl('dy','Up / down',-90,90)}${sl('w',_T('Size'),8,140)}${sl('r',_T('Turn'),-60,60)}
    ${AFIT.side==='R'?`<label class="rc-sub" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-afflip ${f.flip?'checked':''}> ${_T`Mirror the art`}</label>`:''}
    <div class="acts"><button class="btn tksm" type="button" data-afact="prev">◀</button><button class="btn tksm" type="button" data-afact="next">▶</button><button class="btn tksm" type="button" data-afact2="reset">${_T`↺ Default${AFIT.side==='L'?' (left)':''}`}</button><button class="btn tksm" type="button" data-afact="export">${_T`⇪ Copy as text`}</button></div>
    <textarea id="afOut" class="tin" rows="3" style="width:100%;margin-top:6px;font:11px var(--mono)" hidden readonly></textarea></div></div></div>`};
afitRefresh=function(full){const box=document.querySelector('.afit');if(!box)return;if(full){box.outerHTML=afitHTML();return}const pv=document.getElementById('afPrev2');if(pv)pv.innerHTML=afitAvatar(AFIT.key);
  const f=afitF(AFIT.key,AFIT.side);box.querySelectorAll('[data-afit2]').forEach(i=>{const v=f[i.dataset.afit2]||0;if(document.activeElement!==i)i.value=v;const b=i.parentElement.querySelector('b');if(b)b.textContent=v})};
document.addEventListener('input',e=>{const i=e.target.closest('[data-afit2]');if(!i)return;afitSet(AFIT.key,AFIT.side,{[i.dataset.afit2]:+i.value});afitSave();afitRefresh()});
document.addEventListener('click',e=>{const s=e.target.closest('[data-afside]');if(s){AFIT.side=s.dataset.afside;afitRefresh(true);return}
  if(e.target.closest('[data-afhide]')){try{localStorage.removeItem('flavius_armfit_on')}catch(err){}const b=document.querySelector('.afit');if(b)b.remove();mToast(_T('Fit tool hidden — your fits stay. The code word brings it back.'));return}
  const r=e.target.closest('[data-afact2="reset"]');if(r){const o=ARM_FIT_OVR[AFIT.key];if(AFIT.side==='L'){if(o)delete o.L}else if(o){const L=o.L;delete ARM_FIT_OVR[AFIT.key];if(L)ARM_FIT_OVR[AFIT.key]={L}}afitSave();afitRefresh(true)}});
document.addEventListener('change',e=>{if(e.target.closest('[data-afkey]'))AFIT.side='R'},true);
/* drag on the fit avatar: the chosen side moves the way the pointer goes; the wheel scales */
(()=>{let drag=null;const pt=e=>{const sv=document.querySelector('#afPrev2 svg');if(!sv)return null;const r=sv.getBoundingClientRect();return [AV_VB[0]+(e.clientX-r.left)/r.width*AV_VB[2],AV_VB[1]+(e.clientY-r.top)/r.height*AV_VB[3]]};
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#afPrev2'))return;const p=pt(e);if(!p)return;const f=afitF(AFIT.key,AFIT.side);drag={p0:p,dx:f.dx||0,dy:f.dy||0};e.preventDefault()});
  document.addEventListener('pointermove',e=>{if(!drag)return;const p=pt(e);if(!p)return;const sgn=AFIT.side==='L'?-1:1;
    afitSet(AFIT.key,AFIT.side,{dx:Math.round(drag.dx+sgn*(p[0]-drag.p0[0])),dy:Math.round(drag.dy+p[1]-drag.p0[1])});afitRefresh()});
  window.addEventListener('pointerup',()=>{if(drag){drag=null;afitSave();afitRefresh(true)}});
  document.addEventListener('wheel',e=>{if(!e.target.closest('#afPrev2'))return;e.preventDefault();const f=afitF(AFIT.key,AFIT.side);afitSet(AFIT.key,AFIT.side,{w:Math.max(8,Math.min(140,(f.w||30)+(e.deltaY<0?2:-2)))});afitSave();afitRefresh()},{passive:false})})();
(()=>{const st=document.createElement('style');st.textContent=`#afPrev2{cursor:grab;touch-action:none}#afPrev2 svg{width:100%;height:auto;display:block}`;document.head.appendChild(st)})();
