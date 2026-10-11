/* 253-v98domus — v0.98 ONLINE DOMUS LAYOUT (his mock tools/plans/mock98/domus/domus_mock4_detail.png) + OFFERINGS CAP 2. CLIENT. Display only: every
   change is made in the HTML a wrapper returns (morph91 patches the screen in place), nothing is moved after render.
   A · the banner (.db89) gets a painted atrium (frieze, two fluted columns, the house-colour banner, spear rack, shield, torch glow, dark fades so text
       stays readable) · 🏆 Trophies at the banner's bottom-right corner under the treasury · the showcase (.sc89 → .sc98) = weapons 190 | avatar 270 | info,
       the avatar svg absolutely placed at ×1.17 (≈388 px) top-aligned with the first weapon card, armor scales with it · the 3D token card is a small chip
       "🧍 3D token" in the name sub-row (click = the poser, hover = the posed picture, "Classic" chip while a picture is posted) · the worn armor chips live in a
       dashed box "🛡 Armor on him" in the info column, ALL pieces (237's fold is off) · the offerings box sits bottom-left under the weapon cards ·
       narrow Domus (container query on .dom89): 2 columns under 760 px, one column under 480 (name/stats · avatar · weapons · armor · offerings).
   B · OFFERINGS CAP 2: a gladiator holds at most 2 and brings all he holds (111-onlcore OFF_MAX; the ★ brought toggles are gone, 175 + 137). The mock server
       mirrors the server's one-time trim (ONLC.offCap98: the first two stay, the rest go to the house shelf, a full shelf refunds PRICE_OFF to the treasury). Test tv98o. */
const DM98={};
DM96.fold=false;

/* ---------------- A1 · the atrium behind the banner ---------------- */
function dm98Atrium(){const col=x=>`<g transform="translate(${x},0)"><rect x="-13" y="8" width="26" height="8" fill="#5a4630"/><rect x="-10" y="16" width="20" height="150" fill="url(#a98cg)"/>${[0,1,2,3,4].map(i=>`<line x1="${-7+i*3.5}" y1="18" x2="${-7+i*3.5}" y2="164" stroke="#2b2015" stroke-width="1" opacity=".45"/>`).join('')}<rect x="-14" y="0" width="28" height="9" fill="#6b5538"/></g>`;
  const spear=(x,r)=>`<g transform="translate(${x},30) rotate(${r})" opacity=".55"><line x1="0" y1="0" x2="0" y2="110" stroke="#4a3522" stroke-width="3"/><path d="M-4 0 L0 -16 L4 0Z" fill="#8c8a84"/></g>`;
  return `<div class="bg98" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 860 140" preserveAspectRatio="xMidYMid slice"><defs>
 <linearGradient id="a98wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a281a"/><stop offset="1" stop-color="#22170f"/></linearGradient>
 <linearGradient id="a98cg" x1="0" x2="1"><stop offset="0" stop-color="#6e5a40"/><stop offset=".5" stop-color="#b59a6c"/><stop offset="1" stop-color="#5a4630"/></linearGradient>
 <radialGradient id="a98glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb44a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb44a" stop-opacity="0"/></radialGradient>
 <linearGradient id="a98fade" x1="0" x2="1"><stop offset="0" stop-color="#1a120c" stop-opacity=".92"/><stop offset=".5" stop-color="#1a120c" stop-opacity=".45"/><stop offset=".7" stop-color="#1a120c" stop-opacity=".3"/><stop offset=".82" stop-color="#1a120c" stop-opacity=".85"/><stop offset="1" stop-color="#1a120c" stop-opacity=".9"/></linearGradient>
 <pattern id="a98fr" width="24" height="10" patternUnits="userSpaceOnUse"><rect width="24" height="10" fill="#4a3220"/><path d="M0 8 h6 v-5 h6 v5 h6 v-5 h6" fill="none" stroke="#a5813f" stroke-width="1.3"/></pattern></defs>
 <rect width="860" height="140" fill="url(#a98wall)"/><rect y="0" width="860" height="10" fill="url(#a98fr)"/>
 <rect x="500" y="22" width="135" height="110" fill="#7a2d1c" opacity=".35"/>
 ${col(512)}${col(622)}${spear(540,-8)}${spear(550,0)}${spear(560,8)}
 <g transform="translate(596,82)" opacity=".6"><ellipse rx="17" ry="24" fill="#5c2a1c" stroke="#9a7a3c" stroke-width="2"/><circle r="5" fill="#9a7a3c"/></g>
 <g transform="translate(567,14)"><rect x="-26" y="0" width="52" height="88" style="fill:color-mix(in srgb,var(--hc1,#4b2a63) 80%,#120c06)"/><path d="M-26 88 L0 104 L26 88Z" style="fill:color-mix(in srgb,var(--hc1,#4b2a63) 80%,#120c06)"/><rect x="-26" y="0" width="52" height="5" fill="#c9a34a"/><circle cy="44" r="15" fill="none" stroke="#c9a34a" stroke-width="2"/><path d="M-8 50 L0 34 L8 50" fill="none" stroke="#c9a34a" stroke-width="2"/></g>
 <circle cx="490" cy="60" r="60" fill="url(#a98glow)"/><circle cx="650" cy="62" r="50" fill="url(#a98glow)"/>
 <g transform="translate(490,58)"><path d="M-6 0 Q0 -18 6 0Z" fill="#ffcf6a"/><rect x="-3" y="0" width="6" height="22" fill="#5a3a20"/></g>
 <rect y="128" width="860" height="12" fill="#2a1d13"/><path d="M0 128 H860" stroke="#7a5a34"/><rect width="860" height="140" fill="url(#a98fade)"/></svg></div>`}
{const base=d89Banner;d89Banner=function(){const h=base.apply(this,arguments);try{
    if(typeof h!=='string'||h.indexOf('bg98')>=0)return h;
    return h.replace(/^(\s*)<div class="db89"([^>]*)>/,(m,sp,rest)=>`${sp}<div class="db89 a98"${rest}>${dm98Atrium()}`)}catch(e){console.error(e);return h}}}

/* ---------------- A2 · the showcase: weapons | avatar | info, offerings under the weapons, armor box, 3D token chip ---------------- */
function dm98Chip(ch,busy){const ref=typeof t94RefCh==='function'?t94RefCh(ch):null;const lock=!!(busy&&busy.has&&busy.has(ch.id));
  return `<button type="button" class="tok98c" data-t94="pose" data-v="${esc2(ch.id)}" ${lock?'disabled':''} aria-haspopup="true">${_T`🧍 3D token`}</button>`+
    (ref?`<button type="button" class="tok98c cl98" data-t94="off" data-v="${esc2(ch.id)}" ${lock?'disabled':''}>${_T`Classic`}</button>`:'')}
{const base=d89Show;d89Show=function(ch,busy){const h=base.apply(this,arguments);try{
    if(!ch||typeof h!=='string'||h.indexOf('class="sc89')<0||h.indexOf('sc98')>=0)return h;
    const tpl=document.createElement('template');tpl.innerHTML=h;const root=tpl.content.querySelector('.sc89');if(!root)return h;
    const av=root.querySelector(':scope>.sc89-av'),info=root.querySelector(':scope>.sc89-info');if(!av||!info)return h;
    root.classList.add('sc98');
    const card=info.querySelector('.t94card');if(card)card.remove();
    const sub=info.querySelector('.sc89-sub');if(sub)sub.insertAdjacentHTML('beforeend',dm98Chip(ch,busy));
    const wl=av.querySelector('.wr89-l');const sat=info.querySelector('.sat89');
    if(wl){const n=wl.querySelectorAll('.wr89').length;const box=document.createElement('div');box.className='arm98';
      box.innerHTML=`<div class="h">${n?_T`🛡 Armor on him · <b>${n}</b> piece${n===1?'':'s'} · drag one back to the shelf to take it off`:_T`🛡 Armor on him · none yet · click or drag a piece from the bar`}</div>`;
      box.appendChild(wl);const mon=info.querySelector('.sc89-mon');if(mon)mon.after(box);else info.appendChild(box)}
    if(sat)root.appendChild(sat);
    return tpl.innerHTML}catch(e){console.error(e);return h}}}

/* hover = the posed token picture (front cell) or the sculpted one it would replace */
function dm98Pop(a){dm98PopOff();const ch=[ONL.char,...(ONL.chars||[])].find(c=>c&&c.id===a.dataset.v);if(!ch)return;
  const ref=typeof t94RefCh==='function'?t94RefCh(ch):null,rec=ref&&typeof t94Rec==='function'?t94Rec(ref):null;
  const fig=rec?t93HTML(rec,120):(typeof onlFig==='function'?onlFig(ch.cls,ch.look,110):'');
  const note=ref?_T('Every lanista sees this token on the sand.'):_T('Pose a 3D token: it replaces the sculpted one on every screen.');
  const p=document.createElement('div');p.id='t94pop98';p.setAttribute('role','tooltip');p.innerHTML=`<div class="f">${fig}</div><small>${note}</small>`;document.body.appendChild(p);
  const r=a.getBoundingClientRect(),w=p.offsetWidth,hh=p.offsetHeight;let x=Math.max(8,Math.min(innerWidth-w-8,r.left)),y=r.bottom+6;if(y+hh>innerHeight-8)y=Math.max(8,r.top-hh-6);
  p.style.left=x+'px';p.style.top=y+'px'}
function dm98PopOff(){const p=document.getElementById('t94pop98');if(p)p.remove()}
document.addEventListener('mouseover',e=>{const a=e.target.closest&&e.target.closest('#onl .tok98c[data-t94="pose"]');if(a)dm98Pop(a)});
document.addEventListener('mouseout',e=>{const a=e.target.closest&&e.target.closest('#onl .tok98c[data-t94="pose"]');if(a&&!(e.relatedTarget&&a.contains(e.relatedTarget)))dm98PopOff()});
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.tok98c'))dm98PopOff()},true);
document.addEventListener('focusin',e=>{const a=e.target.closest&&e.target.closest('#onl .tok98c[data-t94="pose"]');if(a)dm98Pop(a)});
document.addEventListener('focusout',e=>{if(e.target.closest&&e.target.closest('.tok98c'))dm98PopOff()});

/* ---------------- B · the mock server trims a gladiator holding more than 2 offerings (the server's off98), once each ---------------- */
function mockOff98(w,me){if(!w||!w.chars||!me)return;const D=typeof mockHouseOf92==='function'?mockHouseOf92(w,me):null;
  for(const c of Object.values(w.chars))if(c&&c.owner===me&&c.alive&&!c.off98)ONLC.offCap98(c,D||null,Date.now())}
if(typeof MOCK_ROUTES!=='undefined')for(const t of Object.keys(MOCK_ROUTES)){const base=MOCK_ROUTES[t];MOCK_ROUTES[t]=function(w,d,me){try{if(me&&w&&w.accounts&&w.accounts[me])mockOff98(w,me)}catch(e){}return base.apply(this,arguments)}}

(function(){const st=document.createElement('style');st.textContent=`
/* banner */
#onl .dom89{container:dm98/inline-size}
#onl .db89.a98{position:relative;overflow:hidden;isolation:isolate;min-height:112px;background:#1d140e}
#onl .db89.a98>.bg98{position:absolute;inset:0;z-index:-1;pointer-events:none}#onl .bg98 svg{display:block}
#onl .db89.a98 .db96-tc{align-items:flex-end}
#onl .db89.a98 .db96-tc .tr89b{position:absolute;right:12px;bottom:8px}
/* showcase */
#onl .dom89 .sc98{grid-template-columns:190px 270px minmax(0,1fr);grid-template-areas:"wp av info" "sat av info";grid-template-rows:auto 1fr;column-gap:12px;row-gap:8px;align-items:start}
#onl .dom89 .sc98>.sc89-wp{grid-area:wp}#onl .dom89 .sc98>.sc89-av{grid-area:av;width:270px;display:flex;justify-content:center;align-self:start}#onl .dom89 .sc98>.sc89-info{grid-area:info}
#onl .dom89 .sc98>.sat89{grid-area:sat;align-self:start;margin:0;width:auto}
#onl .dom89 .sc98 .av89{position:relative;display:block;width:270px;height:392px;padding:0;overflow:visible}
#onl .dom89 .sc98 .av89 svg{position:absolute;top:0;left:50%;width:150px!important;height:332px!important;max-width:none!important;max-height:none!important;margin:0;transform:translateX(-50%) scale(1.17);transform-origin:50% 0}
#onl .sc98 .tok98c{display:inline-flex;align-items:center;gap:4px;padding:1px 9px;border:1px solid #6b5636;border-radius:12px;font:inherit;font-size:13px;line-height:1.5;background:#241a12;color:#e8d4a8;cursor:pointer}
#onl .sc98 .tok98c:hover:not(:disabled),#onl .sc98 .tok98c:focus-visible{border-color:#e8c96a;background:#33261a}#onl .sc98 .tok98c:disabled{opacity:.5;cursor:default}#onl .sc98 .tok98c.cl98{font-size:11.5px;color:#cbb88f}
#t94pop98{position:fixed;z-index:3000;display:grid;justify-items:center;gap:4px;max-width:210px;padding:8px 10px;border:1px solid #6b5636;border-radius:10px;background:#1c150f;box-shadow:0 8px 24px rgba(0,0,0,.6);pointer-events:none;color:#e8d4a8;text-align:center}
#t94pop98 small{font-size:11.5px;color:#cbb88f}#t94pop98 .f{min-height:84px;display:flex;align-items:flex-end;justify-content:center}
#onl .sc98 .arm98{border:1px dashed #6b5636;border-radius:10px;padding:6px 8px;margin:6px 0 0}
#onl .sc98 .arm98 .h{font-size:12px;color:#c9b48a;margin-bottom:5px}#onl .sc98 .arm98 .h b{color:#f3d58a}
#onl .sc98 .arm98 .wr89-l{display:flex;justify-content:flex-start;flex-wrap:wrap;gap:5px;width:auto;max-width:none;max-height:none}
#onl .sc98 .arm98 .wr89{width:auto}#onl .sc98 .arm98 .wr89-p{max-width:none;width:auto;white-space:nowrap}
#onl .sc98 .sat89{margin-top:0}
/* narrower Domus: avatar + info, weapons + offerings beneath */
@container dm98 (max-width:759px){
 #onl .dom89 .sc98{grid-template-columns:230px minmax(0,1fr);grid-template-areas:"av info" "wp sat"}
 #onl .dom89 .sc98>.sc89-av{width:230px}#onl .dom89 .sc98 .av89{width:230px;height:340px}#onl .dom89 .sc98 .av89 svg{transform:translateX(-50%) scale(1)}
 #onl .dom89 .sc98>.sc89-wp{grid-template-columns:1fr 1fr}
 #onl .db89.a98 .db96-tc .tr89b{right:10px;bottom:6px}}
/* one column: name/stats · avatar · weapons · armor · offerings */
@container dm98 (max-width:479px){
 #onl .dom89 .sc98{grid-template-columns:minmax(0,1fr);grid-template-areas:none;grid-template-rows:none}
 #onl .dom89 .sc98>.sc89-info{display:contents}
 #onl .dom89 .sc98 .sc89-info>*{order:1}
 #onl .dom89 .sc98>.sc89-av{order:2;grid-area:auto;width:100%}#onl .dom89 .sc98 .av89{width:100%;height:340px}
 #onl .dom89 .sc98>.sc89-wp{order:3;grid-area:auto;grid-template-columns:1fr 1fr}
 #onl .dom89 .sc98 .arm98{order:4}#onl .dom89 .sc98>.sat89{order:5;grid-area:auto}#onl .dom89 .sc98 .kt89{order:6}#onl .dom89 .sc98 .onl-busy{order:7}
 #onl .sc98 .arm98 .wr89-p b{display:inline}
 #onl .db89.a98 .db96-tc .tr89b{position:static}#onl .db89.a98{min-height:0}
 #onl .dom89 .sc98 .sc89-rec{grid-template-columns:repeat(5,minmax(0,1fr))}}
`;document.head.appendChild(st)})();
