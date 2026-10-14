/* =====================================================================
   336-v102tok.js — v1.02 workstream E · 3D tokens (his v1.01 notes, answer 9a)
   =====================================================================
   D2 ONE FIXED FIGURE SIZE. Every 3D gladiator token (Studio characters 222/t93, online pictures 226/t94, the printed classes' animated
     sheets 311/anim100, and what this device renders for them) is made at ONE figure scale: tools/art/rig92/game.js FIG_SCALE 0.69 —
     the head about 55% of a pillar's drawn height on the board (the pillar mini stands 1.27 tiles above its base point; helmets and
     crests add a little). The figure never shrinks for weapons, armor or pose any more (game.js fitTile: f is always 1); a long weapon
     that would reach past the tile is ANGLED about the grip (≤ 60°) and only the weapon may still reach past. The base stays 0.8 tile
     (the minis' board rule TW·MINI_BASE/(25.4·MINI_PXMM) is unchanged — the sheets carry the new size). Stored Studio tokens re-convert
     once (T93_VER 3), this device's animated renders once (ANIM100_LIB VER 3); the printed sheets were re-rendered by
     tools/art/anim100/make.js (+ `sev`). Beasts and the TTS minis fallback keep their own sizes (their bases are baked in).
   D1 THE GRIP in the 3D poser (#t93m): a ⚔ Weapon tab — per hand that holds something, Turn (about the grip, ±180°) and Slide (along
     it, ±150 mm), ◀ ▶ nudges, ↺ per hand. Stored in the pose JSON as g:{R:[turn,slide],L:[…]} (game.js api.grip / setGrip / holds;
     the pose stays ≤ 600 B), so every render of the sheet uses it — the Studio sheet, the online picture, and the animated sets this
     device renders for that token (an100Parts carries parts.grip → 311's pump applies it; a separate cache key).
   Display only: never S, dice, RNG, the log or onlHash. Kill switch localStorage flavius_v102eoff=1 hides the Weapon tab (the size is
   in the assets). Test tv102e.
   ===================================================================== */
const V102E={on:true,nudgeA:5,nudgeS:10,T:{grip:0,strip:0}}; /* TWEAK: degrees / mm a nudge */
try{if(localStorage.getItem('flavius_v102eoff')==='1')V102E.on=false}catch(e){}
/* the grip a stored pose carries ({} when none) */
function v102Grip(pose){try{const o=typeof pose==='string'?JSON.parse(pose):pose;const g=o&&o.g;return g&&typeof g==='object'&&!Array.isArray(g)?g:{}}catch(e){return {}}}
/* the animated sets this device renders for a Studio / online token wear its grip (a parts object per token record, so 311's key cache holds) */
const V102_PG=new WeakMap();
if(typeof an100Parts==='function'){const base=an100Parts;an100Parts=function(p,t){const r=base.apply(this,arguments);
  try{if(!r||!t||typeof t!=='object')return r;const g=v102Grip(t.pose);if(!Object.keys(g).length)return r;
    let c=V102_PG.get(t);if(!c||c.base!==r){c={base:r,out:Object.assign({},r,{grip:g})};V102_PG.set(t,c)}return c.out}catch(e){return r}}}

/* 276 turns a 'stand' token's pose into the armed stand for its gear when it is made: the grip set in the poser rides along */
if(typeof t93Make==='function'){const base=t93Make;t93Make=async function(c,pose,mode,pk){const g=v102Grip(pose);if(pk!=='stand'||!Object.keys(g).length)return base.apply(this,arguments);
  let api=null;try{api=await t93Load()}catch(e){}const sf=api&&api.standFor;if(!sf)return base.apply(this,arguments);
  api.standFor=function(){const s=sf.apply(this,arguments);try{const o=JSON.parse(s);o.g=g;return JSON.stringify(o)}catch(e){return s}};
  try{return await base.apply(this,arguments)}finally{api.standFor=sf}}}

/* ---------- D1: the Weapon tab in the poser ---------- */
const V102_HAND={R:()=>_T('Right hand'),L:()=>_T('Left hand')};
function v102Row(sd,k,lab,lo,hi,unit){return `<div class="t93ax v102ax" data-v102r="${sd}${k}"><span class="t93axc" style="background:${sd==='R'?'#d8433b':'#3b7dd8'}"></span><span class="t93axn">${lab}</span>
  <button type="button" class="btn t93nb" data-v102n="${sd}:${k}:-1" aria-label="${_T`${lab} −`}">◀</button><input type="range" min="${lo}" max="${hi}" step="5" value="0" data-nosnap data-v102g="${sd}:${k}" aria-label="${_T`${V102_HAND[sd]()} · ${lab}`}"><button type="button" class="btn t93nb" data-v102n="${sd}:${k}:1" aria-label="${_T`${lab} +`}">▶</button><output data-v102o="${sd}:${k}">0${unit}</output></div>`}
function v102PaneHTML(api){const h=api.holds?api.holds():{};const sides=['R','L'].filter(sd=>h[sd]);
  if(!sides.length)return `<p class="rc-sub">${_T('This gladiator holds nothing: give him a weapon or a shield in the designer first.')}</p>`;
  return `<p class="rc-sub t93how">${_T('Turn what each hand holds about its grip, or slide it along — the eight facings and the board use it.')}</p>`+sides.map(sd=>`<div class="t93jp v102h" data-v102h="${sd}"><div class="t93jh"><b>${V102_HAND[sd]()}</b><small class="rc-sub">${h[sd]==='shield'?_T('a shield: turns in its own plane, slides along the forearm'):esc(String(h[sd]))}</small></div>
    ${v102Row(sd,0,_T('Turn'),-180,180,'°')}${v102Row(sd,1,_T('Slide'),-150,150,' mm')}
    <div class="t93jbtn"><button type="button" class="btn" data-v102z="${sd}">${_T('↺ Hand')}</button></div></div>`).join('')}
function v102Sync(ov){const api=T93.api;if(!api||!api.grip)return;const g=api.grip();
  for(const el of ov.querySelectorAll('[data-v102g]')){const [sd,k]=el.dataset.v102g.split(':');const v=(g[sd]||[0,0])[+k];if(document.activeElement!==el)el.value=v;
    const o=ov.querySelector(`[data-v102o="${sd}:${k}"]`);if(o)o.textContent=v+(+k?' mm':'°')}}
function v102Strip(ov){clearTimeout(V102E.T.strip);V102E.T.strip=setTimeout(()=>{const api=T93.api,box=ov.querySelector('#t93strip');if(!api||!box||!document.body.contains(ov))return;
  box.innerHTML='';for(const f of api.facings(84)){f.className='t93f';box.appendChild(f)}try{T93.ed&&T93.ed.render()}catch(e){}},250)}
function v102Set(ov,sd,k,v,done){const api=T93.api;if(!api||!api.setGrip)return;const g=api.grip();const cur=(g[sd]||[0,0]).slice();cur[k]=Math.round(v);api.setGrip(sd,cur);
  v102Sync(ov);try{T93.ed&&T93.ed.render()}catch(e){}if(done){try{T93.ui&&T93.ui.commit()}catch(e){}v102Strip(ov)}}
function v102Mount(ov){if(!V102E.on||!ov||ov.dataset.v102)return;const tabs=ov.querySelector('.t93tabs'),side=ov.querySelector('.t93side');if(!tabs||!side)return;ov.dataset.v102='1';
  tabs.insertAdjacentHTML('beforeend',`<button type="button" role="tab" data-t93tab="grip" aria-selected="false">${_T('⚔ Weapon')}</button>`);
  side.insertAdjacentHTML('beforeend',`<div class="t93pane" data-t93pane="grip" hidden><div id="v102g"><p class="rc-sub">${_T('Building the body…')}</p></div></div>`);
  const fill=()=>{const box=ov.querySelector('#v102g');if(box&&T93.api&&T93.ui){box.innerHTML=v102PaneHTML(T93.api);v102Sync(ov);return true}return false};
  let n=0;const wait=()=>{if(!document.body.contains(ov))return;if(fill())return;if(++n<600)setTimeout(wait,200)};wait();
  ov.addEventListener('input',e=>{const r=e.target.closest('[data-v102g]');if(!r)return;e.stopPropagation();const [sd,k]=r.dataset.v102g.split(':');v102Set(ov,sd,+k,+r.value,false)},true);
  ov.addEventListener('change',e=>{const r=e.target.closest('[data-v102g]');if(!r)return;e.stopPropagation();const [sd,k]=r.dataset.v102g.split(':');v102Set(ov,sd,+k,+r.value,true)},true);
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-v102n],[data-v102z]');
    if(!b){/* undo / redo / presets / reset may change the grip: re-read it after 222's own handler */setTimeout(()=>v102Sync(ov),0);return}
    e.stopPropagation();const api=T93.api;if(!api||!api.grip)return;
    if(b.dataset.v102z){api.setGrip(b.dataset.v102z,[0,0]);v102Sync(ov);try{T93.ed&&T93.ed.render();T93.ui&&T93.ui.commit()}catch(x){}v102Strip(ov);return}
    const [sd,k,d]=b.dataset.v102n.split(':');const cur=(api.grip()[sd]||[0,0])[+k];v102Set(ov,sd,+k,cur+(+d)*(+k?V102E.nudgeS:V102E.nudgeA),true)},true);
  document.addEventListener('keyup',function kz(e){if(!document.body.contains(ov)){document.removeEventListener('keyup',kz,true);return}if((e.ctrlKey||e.metaKey)&&/^[zy]$/i.test(e.key))v102Sync(ov)},true)}
if(typeof t93Open==='function'){const base=t93Open;t93Open=function(){const r=base.apply(this,arguments);try{v102Mount(document.getElementById('t93m'))}catch(e){console.error(e)}return r}}
{const st=document.createElement('style');st.textContent=`#t93m .v102h{margin-top:8px}#t93m .v102h .t93jh small{text-transform:none}`;document.head.appendChild(st)}
