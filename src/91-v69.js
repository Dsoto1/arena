/* 91-v69 — the armor designer, reworked (Virgilante, v0.69).
   • Creator Studio → Gear → Armor: "The piece" with the avatar mock-up straight below it (no view tabs).
   • Custom armor needs an EQUIP POINT (head, chest, belt, upper/lower arm, hand, upper/lower leg) before it can be saved; the
     point sets the slot and part. The piece is dragged freely anywhere on the avatar; its fit is kept RELATIVE to the point
     (ca.f2 = {dx,dy,s,r,flip}), so a left arm/leg wears it mirrored at the left point, and changing the point keeps size, turn
     and mirror. ca.fit (absolute) stays in sync for older code. Single arm/leg pieces show one side; "Pair" shows both.
   • The sculpted set (the system armor's sculpted art) lists only when Settings → Tokens → Armor is Sculpted.
   • 🎯 Fit the printed set: open to everyone (no code) — drag, Size, Turn, Mirror per printed piece; saved in the game data
     (Store 'armorFit', in the backup) and applied at once. Temporary: once Virgilante's fits are baked into ARM_FIT it goes.
   • Flavius' Bracers' token wears the gold grade (BRACER_GOLD, 90-armfit). */
const CA_EQ_ALL=[['head',_T('Head'),'head','helm'],['chest',_T('Chest'),'chest','chest'],['belt',_T('Belt (waist)'),'chest','chest'],['sho',_T('Upper arm'),'arm','upper'],['fore',_T('Lower arm'),'arm','lower'],['hand',_T('Hand'),'arm','hand'],['thigh',_T('Upper leg'),'leg','upper'],['shin',_T('Lower leg'),'leg','lower']];
const caEqRow=k=>CA_EQ_ALL.find(x=>x[0]===k);
const CA_S_DEF={head:46,chest:58,arm:34,leg:30};
function caF2(ca){const f=ca.f2||{};return {dx:+f.dx||0,dy:+f.dy||0,s:+f.s||CA_S_DEF[ca.slot]||46,r:+f.r||0,flip:f.flip?1:0}}
function caSync(ca){if(!ca||!ca.eq||!EQ[ca.eq])return;const f=caF2(ca);ca.f2=f;ca.fit={slot:ca.slot,x:EQ[ca.eq][0]+f.dx,y:EQ[ca.eq][1]+f.dy,s:f.s}}
{const base=caFit;caFit=function(ca){if(ca&&ca.eq&&EQ[ca.eq]){const f=caF2(ca);return {x:EQ[ca.eq][0]+f.dx,y:EQ[ca.eq][1]+f.dy,s:f.s}}return base.apply(this,arguments)}}
{const base=caOnBodySVG;caOnBodySVG=function(ca,key,mirror){if(!ca||!ca.eq||!EQ[ca.eq])return base.apply(this,arguments);const f=caF2(ca);
  const p=mirror?(EQ_L[ca.eq]||[150-EQ[ca.eq][0],EQ[ca.eq][1]]):EQ[ca.eq];const x=mirror?p[0]-f.dx:p[0]+f.dx,y=p[1]+f.dy;
  const inner=armSVG(key||'ca_preview',ca).replace(/^<svg[^>]*>|<\/svg>$/g,'');const sx=(mirror?-1:1)*(f.flip?-1:1);
  return `<g transform="translate(${x} ${y}) rotate(${mirror?-f.r:f.r}) scale(${sx} 1) scale(${f.s/100}) translate(-50 -50)">${inner}</g>`}}
/* the mock-up: the avatar, its equip rings (the chosen one lit), the piece; a pair shows both sides */
function caMockSVG(d){const img=typeof assetURL==='function'?assetURL('avatar.png'):'assets/avatar.png';const pair=d.pair&&(d.slot==='arm'||d.slot==='leg');
  const rings=CA_EQ_ALL.map(([k])=>{const p=EQ[k];const on=d.eq===k;return `<circle cx="${p[0]}" cy="${p[1]}" r="${on?5:3}" fill="none" stroke="${on?'#f0cf7d':'rgba(240,207,125,.35)'}" stroke-width="${on?1.6:1}"/>`}).join('');
  const piece=d.eq?caOnBodySVG(d)+(pair?caOnBodySVG(d,null,true):''):`<g opacity=".55">${caOnBodySVG({...d,eq:null,fit:null})}</g>`;
  return `<svg viewBox="${AV_VB.join(' ')}" xmlns="http://www.w3.org/2000/svg"><image href="${img}" x="7" y="6" width="136" height="301" opacity=".92"/>${rings}${piece}</svg>`}
/* v0.70: the studio avatars sit lower — room above for helmets, less below the feet */
const AV_VB=[0,-18,150,336];
function caMockRefresh(){const el=document.getElementById('caAv');if(el&&ST.ca)el.innerHTML=caMockSVG(ST.ca);const f=ST.ca?caF2(ST.ca):null;
  if(f)document.querySelectorAll('[data-cav]').forEach(i=>{const k=i.dataset.cav;if(k==='flip')i.checked=!!f.flip;else if(i.type==='range'&&document.activeElement!==i){i.value=f[k];const b=i.parentElement.querySelector('b');if(b)b.textContent=f[k]}})}
{const base=caPrevRefresh;caPrevRefresh=function(){const r=base.apply(this,arguments);try{caMockRefresh()}catch(e){}return r}}
function caMockHTML(d){const f=caF2(d);const sl=(k,l,min,max)=>`<label class="rc-sub cavl">${l} <b>${f[k]}</b><input type="range" min="${min}" max="${max}" step="1" value="${f[k]}" data-cav="${k}"></label>`;
  return `<div class="cavbox"><div class="sect" style="margin:8px 0 4px">${_T`On the avatar ${d.eq?`<span class="rc-sub">${_T`· ${esc(caEqRow(d.eq)[1])} · drag it anywhere · the wheel scales it`}</span>`:_T('<span class="rc-sub" style="color:var(--gold2)">· choose its equip point</span>')}`}</div>
    <div class="scart caav" id="caAv">${caMockSVG(d)}</div>
    ${sl('s',_T('Size'),10,160)}${sl('r',_T('Turn'),-60,60)}<div class="acts" style="justify-content:center;align-items:center"><label class="rc-sub" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-cav="flip" ${f.flip?'checked':''}> ${_T`Mirror`}</label><button class="btn tksm" type="button" data-cav="snap">${_T`⌖ Back on the point`}</button></div></div>`}
function caEqSelectHTML(d){return `<label>${_T`Equip point`} <span class="rc-sub">(required)</span><select data-caeq2><option value="" ${d.eq?'':'selected'} disabled>— choose —</option>${CA_EQ_ALL.map(([k,l])=>`<option value="${k}" ${d.eq===k?'selected':''}>${l}</option>`).join('')}</select></label>`}
const armSculptOn=()=>(typeof SETTINGS==='undefined'||(SETTINGS.armorStyle||'drawn')==='drawn');
{const base=gearAHTML;gearAHTML=function(){const d=ST.ca||(ST.ca=blankCA());
  if(d.eq&&caEqRow(d.eq)&&caEqRow(d.eq)[2]!==d.slot)d.eq=null; /* a new slot from "Start from" clears a point that no longer fits */
  if(!d.eq&&d.base&&ARM[d.base]){const A=ARM[d.base];const k=A.slot==='head'?'head':A.slot==='chest'?(A.stack?'belt':'chest'):(ARM_PT_AT[A.slot]||{})[A.pt];if(k)d.eq=k}
  if(d.eq&&!d.f2&&d.fit&&d.fit.slot===d.slot)d.f2={dx:d.fit.x-EQ[d.eq][0],dy:d.fit.y-EQ[d.eq][1],s:d.fit.s,r:0,flip:0};
  ST.caAvatar=false;let h=base.apply(this,arguments);
  try{
    /* the view tabs go; a hidden redraw hook stays */
    const tb=h.indexOf('<div class="seg" style="margin-bottom:6px;justify-content:center">');if(tb>=0){const c=cutDiv(h,tb);if(c)h=c[1].slice(0,tb)+'<button hidden type="button" id="caRedraw" data-gs="caview" data-id="piece"></button>'+c[1].slice(tb)}
    /* the mock-up straight below the piece */
    const pi=h.indexOf('<div class="scart');if(pi>=0){const c=cutDiv(h,pi);if(c){const end=pi+c[0].length;h=c[1].slice(0,pi)+c[0]+caMockHTML(d)+c[1].slice(pi)}}
    /* one Equip point select replaces Body location + Point (and 90's helper select) */
    h=h.replace(/<label>Equip point<select data-caeq>[\s\S]*?<\/select><\/label>/,'');
    h=h.replace(/<label>Body location<select data-caf="slot">[\s\S]*?<\/select><\/label>/,caEqSelectHTML(d)).replace(/<label>Point<select data-caf="pt">[\s\S]*?<\/select><\/label>/,'');
    /* the sculpted set only with the Sculpted armor style */
    if(!armSculptOn()){const si=h.indexOf('<h4>The sculpted set');if(si>=0){const gi=h.indexOf('<div class="armgrid sysgrid">',si);const c=gi>=0?cutDiv(h,gi):null;if(c)h=h.slice(0,si)+c[1].slice(gi)}
      h=h.replace(/The <b>sculpted set<\/b> below recreates all \d+ printed pieces — pick any of them \(or choose one under <b>Start from<\/b>\) to begin from its rulebook stats\./,'Choose a printed piece under <b>Start from</b> to begin from its rulebook stats.')}
    h=h.replace('<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-caf="pair"','<label style="display:flex;gap:6px;align-items:center" title="Unticked: the piece covers one arm or leg — the one it is equipped to"><input type="checkbox" data-caf="pair"');
  }catch(e){console.error(e)}return h}}
const caRedraw=()=>{const b=document.getElementById('caRedraw');if(b)b.click()};
document.addEventListener('change',e=>{const s=e.target.closest('[data-caeq2]');if(!s||!ST.ca)return;const d=ST.ca;const R=caEqRow(s.value);if(!R)return;
  const f=caF2(d);d.eq=R[0];d.slot=R[2];d.pt=R[3];d.f2={...f,dx:0,dy:0};caSync(d);caRedraw()},true);
document.addEventListener('input',e=>{const i=e.target.closest('[data-cav]');if(!i||!ST.ca)return;const d=ST.ca;const f=caF2(d);const k=i.dataset.cav;
  if(k==='flip')f.flip=i.checked?1:0;else f[k]=+i.value;d.f2=f;caSync(d);caMockRefresh()});
document.addEventListener('change',e=>{const i=e.target.closest('input[type="checkbox"][data-cav]');if(!i||!ST.ca)return;const f=caF2(ST.ca);f.flip=i.checked?1:0;ST.ca.f2=f;caSync(ST.ca);caMockRefresh()});
document.addEventListener('click',e=>{const b=e.target.closest('button[data-cav="snap"]');if(b&&ST.ca){const f=caF2(ST.ca);ST.ca.f2={...f,dx:0,dy:0};caSync(ST.ca);caMockRefresh();return}
  const sv=e.target.closest('[data-gs="asave"]');if(sv&&ST.ca&&!ST.ca.eq){e.stopImmediatePropagation();e.preventDefault();mToast(_T('Choose the piece’s <b>equip point</b> first — where it sits on the body.'));const el=document.querySelector('[data-caeq2]');if(el)el.focus();return}
  if(sv&&ST.ca)caSync(ST.ca)},true);
/* free drag anywhere on the mock-up (only the avatar's own box limits it); the wheel scales */
(()=>{let drag=null;const pt=(e,el)=>{const sv=el.querySelector('svg');if(!sv)return null;const r=sv.getBoundingClientRect();return [AV_VB[0]+(e.clientX-r.left)/r.width*AV_VB[2],AV_VB[1]+(e.clientY-r.top)/r.height*AV_VB[3]]};
  document.addEventListener('pointerdown',e=>{const el=e.target.closest('#caAv');if(!el||!ST.ca)return;if(!ST.ca.eq){mToast(_T('Choose the piece’s <b>equip point</b> first.'));return}
    const p=pt(e,el);if(!p)return;drag={el,p0:p,f0:caF2(ST.ca)};e.preventDefault()});
  document.addEventListener('pointermove',e=>{if(!drag)return;const p=pt(e,drag.el);if(!p)return;const d=ST.ca;const P=EQ[d.eq];
    const dx=Math.round(Math.max(-P[0],Math.min(150-P[0],drag.f0.dx+p[0]-drag.p0[0]))),dy=Math.round(Math.max(-P[1],Math.min(332-P[1],drag.f0.dy+p[1]-drag.p0[1])));
    d.f2={...drag.f0,dx,dy};caSync(d);caMockRefresh()});
  window.addEventListener('pointerup',()=>{drag=null});
  document.addEventListener('wheel',e=>{const el=e.target.closest('#caAv');if(!el||!ST.ca||!ST.ca.eq)return;e.preventDefault();const f=caF2(ST.ca);f.s=Math.max(10,Math.min(160,f.s+(e.deltaY<0?3:-3)));ST.ca.f2=f;caSync(ST.ca);caMockRefresh()},{passive:false})})();
/* ---------- 🎯 Fit the printed set — open to everyone, saved in the game data ---------- */
if(typeof SAVE_COLS!=='undefined'&&!SAVE_COLS.includes('armorFit'))SAVE_COLS.push('armorFit');
(async()=>{try{const d=await Store.getDoc('armorFit','sys');if(d&&d.fits){Object.assign(ARM_FIT_OVR,d.fits);if(typeof render==='function'&&typeof S!=='undefined'&&S&&S.phase!=='setup')render()}}catch(e){}})();
let AFIT_T=null;
afitSave=function(){try{localStorage.setItem('flavius_armfit',JSON.stringify(ARM_FIT_OVR))}catch(e){}clearTimeout(AFIT_T);AFIT_T=setTimeout(()=>{try{Store.put('armorFit','sys',{id:'sys',fits:ARM_FIT_OVR,at:new Date().toISOString()}).catch(()=>{})}catch(e){}},500)};
afitHTML=function(){const keys=Object.keys(ARM).filter(k=>!ARM[k].custom&&ARM_FIT[k]);if(!keys.includes(AFIT.key))AFIT.key=keys[0];const f=armFit(AFIT.key)||{};const A=ARM[AFIT.key];
  const sl=(k,l,min,max)=>`<label class="rc-sub">${l} <b>${f[k]||0}</b><input type="range" min="${min}" max="${max}" step="1" value="${f[k]||0}" data-afit="${k}" style="width:100%"></label>`;
  const done=keys.filter(k=>ARM_FIT_OVR[k]).length;
  return `<div class="card2 afit"><h4 style="margin:0 0 6px">${_T`🎯 Fit the printed set`} <span class="rc-sub">${_T`${done} of ${keys.length} adjusted · saved in your game data (Settings → Save file)`}</span></h4>
   <div class="afgrid"><div id="afPrev" class="afprev" title="${_T`Drag the piece · the wheel scales it`}">${avatarSVG(afitPlayer(AFIT.key))}</div>
   <div><label>${_T`Piece`}<select data-afkey>${keys.map(k=>`<option value="${k}" ${k===AFIT.key?'selected':''}>${ARM_FIT_OVR[k]?'✎ ':''}${esc(ARM[k].n)} · ${ARM[k].slot}${ARM[k].pt&&ARM[k].pt!=='helm'&&ARM[k].pt!=='chest'?' '+ARM[k].pt:''}</option>`).join('')}</select></label>
    <p class="rc-sub" style="margin:4px 0">Sits on: <b>${esc((caEqRow(f.at)||[0,f.at])[1])}</b>${A.slot==='arm'||A.slot==='leg'?_T(' — the left side mirrors it'):''}. Drag it on the avatar; the wheel scales it.</p>
    ${sl('dx',_T('Across'),-60,60)}${sl('dy','Up / down',-90,90)}${sl('w',_T('Size'),8,140)}${sl('r',_T('Turn'),-60,60)}
    <label class="rc-sub" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-afflip ${f.flip?'checked':''}> ${_T`Mirror the art`}</label>
    <div class="acts"><button class="btn tksm" type="button" data-afact="prev">◀</button><button class="btn tksm" type="button" data-afact="next">▶</button><button class="btn tksm" type="button" data-afact="reset">${_T`↺ Default`}</button><button class="btn tksm" type="button" data-afact="export">${_T`⇪ Copy as text`}</button></div>
    <textarea id="afOut" class="tin" rows="3" style="width:100%;margin-top:6px;font:11px var(--mono)" hidden readonly></textarea></div></div></div>`};
document.addEventListener('change',e=>{const c=e.target.closest('[data-afflip]');if(!c)return;const k=AFIT.key;ARM_FIT_OVR[k]={...(ARM_FIT_OVR[k]||{}),flip:c.checked?1:0};afitSave();afitRefresh()});
(()=>{let drag=null;const pt=e=>{const sv=document.querySelector('#afPrev svg');if(!sv)return null;const r=sv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*150,(e.clientY-r.top)/r.height*332]};
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#afPrev'))return;const p=pt(e);if(!p)return;const f=armFit(AFIT.key)||{};drag={p0:p,L:p[0]>75,dx:f.dx||0,dy:f.dy||0};e.preventDefault()});
  document.addEventListener('pointermove',e=>{if(!drag)return;const p=pt(e);if(!p)return;const k=AFIT.key;
    ARM_FIT_OVR[k]={...(ARM_FIT_OVR[k]||{}),dx:Math.round(drag.dx+(p[0]-drag.p0[0])*(drag.L?-1:1)),dy:Math.round(drag.dy+p[1]-drag.p0[1])};afitRefresh();
    document.querySelectorAll('.afit [data-afit]').forEach(i=>{const v=(armFit(k)||{})[i.dataset.afit]||0;i.value=v;const b=i.parentElement.querySelector('b');if(b)b.textContent=v})});
  window.addEventListener('pointerup',()=>{if(drag){drag=null;afitSave()}});
  document.addEventListener('wheel',e=>{if(!e.target.closest('#afPrev'))return;e.preventDefault();const k=AFIT.key;const f=armFit(k)||{};ARM_FIT_OVR[k]={...(ARM_FIT_OVR[k]||{}),w:Math.max(8,Math.min(140,(f.w||30)+(e.deltaY<0?2:-2)))};afitSave();afitRefresh(true)},{passive:false})})();
/* the token for Flavius' Bracers wears the gold grade too */
{const base=cardStyle;cardStyle=function(ref){const s=base.apply(this,arguments);return s&&ref==='a:bracers'&&typeof BRACER_GOLD!=='undefined'?s+`;filter:${BRACER_GOLD}`:s}}
(()=>{const st=document.createElement('style');st.textContent=`
.cavbox{margin-top:6px}.cavbox #caAv{max-width:260px;margin:0 auto;cursor:grab;touch-action:none}.cavbox #caAv svg{width:100%;height:auto;display:block}
.cavl{display:block;margin:2px 0}.cavl input{width:100%}
.afgrid{display:grid;grid-template-columns:240px 1fr;gap:12px;align-items:start}#afPrev{cursor:grab;touch-action:none}
@media (max-width:640px){.afgrid{grid-template-columns:1fr}}`;document.head.appendChild(st)})();
/* ---------- phones & tablets (v0.69) ----------
   • The match's own controls (landscape dock + action drawer, the portrait "turn sideways" hint, the phone tab bar, the crowd
     ticker) hide while the main menu or any window is up — they used to sit on top of the menu and every screen.
   • The arena fits the space it really has: draw() reserves the header, the crowd ticker and the action dock as measured
     (fitReserve), not a fixed 230 px — on tablets the dock no longer covers the bottom rows of the sand. */
const menuUp=()=>{const m=document.getElementById('mainMenu');return !!(m&&!m.hidden)};
{const base=phoneLand;phoneLand=function(){return !menuUp()&&base.apply(this,arguments)}}
function fitReserve(){try{const wrap=cv.parentElement;const top=Math.max(0,wrap.getBoundingClientRect().top+scrollY);const dock=document.querySelector('.dock');const dh=dock?Math.min(dock.offsetHeight||0,150):110;
  const tk=document.getElementById('crowdTick');const th=tk&&!tk.hidden?tk.offsetHeight+6:0;const hv=document.querySelector('.hover');const hh=hv?hv.offsetHeight:0;
  return Math.max(200,Math.min(innerHeight*0.62,top+dh+th+hh+28))}catch(e){return 230}}
setInterval(()=>{try{const up=menuUp()||!!(typeof CUR_MODAL!=='undefined'&&CUR_MODAL);document.body.classList.toggle('chromeoff',up)}catch(e){}},250);
(()=>{const st=document.createElement('style');st.textContent=`body.chromeoff #plDock,body.chromeoff #plRot,body.chromeoff #mobTabs,body.chromeoff #crowdTick{display:none!important}`;document.head.appendChild(st)})();
