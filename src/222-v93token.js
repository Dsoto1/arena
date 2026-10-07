/* =====================================================================
   222-V93TOKEN · v0.93 — THE TOKEN MODELLER: posable 3D tokens for Studio characters (his picks 2026-10-06/07)
   =====================================================================
   • Every Studio CUSTOM character wears a posable 3D token that looks like the bare avatar (skin, harness, belt, loincloth,
     sandals, ink outline), coloured from its look (skin, hair, hairstyle, beard, gladiatrix, its colour on the loincloth) and
     wearing its armor + weapons (helmets, crests, cuirass, manica, bracers, greaves, wraps, cestus, shields, swords, spears…;
     custom armor in its metal colour with its 3D-able extras: studs, spikes, fur, neck guard, trim, paint).
     Printed classes keep his 3D minis; ONLINE keeps the sculpted tokens (v0.94).
   • THE MODELLER lives in the Character designer's token step (card "🧍 3D token" under the board token): presets Stand · Guard ·
     Lunge · Victory · Defend · Taunt, drag joints in his pose app's colours (spine yellow, left blue, right red, hands + pelvis
     pink), feet pinned to the base (IK), drag empty space to turn the view, a live strip of the 8 facings.
   • three.js is loaded ON DEMAND (assets/three93.js + assets/tok93.js, plain scripts built by tools/art/rig92/mkgame.js from the
     rig92 sources) — only when the modeller opens or a character's token has to be (re)made. In the standalone they come from
     ASSET_DATA (data: URLs) like every asset. Matches NEVER run 3D: on Save the modeller renders the 8 facings once into a sheet
     in the minis8 format (MINI_YAW order, meta [cellW,cellH,anchorX,anchorY] like MINI8) and stores it with the character:
       c.tok93 = {v, mode:'3d'|'classic', pose (pose JSON ≤600 B), pk (preset key or ''), parts {look,gear}, h (hash of parts+pose),
                  sheet (webp data URL, ~35–45 KB), meta, at}
     The board draws it through the figure path (drawFigureTok, facing from miniFace like the minis, so it turns with the
     board too); HTML spots (Play Now seats, Studio lists, Manager cards — every figureHTML of the character) show its front cell.
   • AUTO-CONVERT: while the Studio is open, characters without a sheet (or whose look / gear changed since) get one in the
     background — one at a time on idle callbacks, the body built in time slices, saved ONCE (the hash makes it idempotent).
     Until a sheet exists the old token draws. Per character "Token: 3D / Classic" (Classic = the old token, kept as the fallback).
   Globals: T93 (state), t93Load, t93Parts, t93Hash, t93Rec, t93ForCls, t93Img, t93URL, t93HTML, t93Make, t93Persist,
   t93Convert, t93Open (the modeller), t93CardHTML. Draw cost: one drawImage per piece (same as the minis). */
const T93_VER=1;
const T93={api:null,loading:null,fail:'',busy:false,conv:false,skip:new Set(),url:new Map(),img:new Map(),made:0,ms:[]};
/* the engine, loaded once on demand (plain scripts: they load from file://, the site and the standalone's data: URLs) */
function t93Script(f){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=assetURL(f);s.async=true;s.onload=()=>ok();s.onerror=()=>no(new Error('load '+f));document.head.appendChild(s)})}
function t93Load(onStep){if(T93.api)return Promise.resolve(T93.api);if(T93.loading)return T93.loading;
  T93.loading=(async()=>{try{
    if(!window.THREE93)await t93Script('three93.js');if(!window.TOK93LIB)await t93Script('tok93.js');
    const probe=document.createElement('canvas');if(!(probe.getContext('webgl2')||probe.getContext('webgl')))throw new Error('nowebgl');
    const t0=performance.now();T93.api=await window.TOK93LIB(window.THREE93).createToken({onStep});T93.buildMs=Math.round(performance.now()-t0);return T93.api}
    catch(e){T93.fail=String(e&&e.message||e);T93.loading=null;throw e}})();
  return T93.loading}

/* ---------- what a character's token is made of ---------- */
const T93_WK={gladius:'sword',psykhe:'sword',flavgl:'flavgl',sica:'sica',falcata:'sica',pugio:'dagger',knives:'dagger',scissor:'dagger',mace:'mace',charun:'hammer',rudis:'club',flail:'flail',
  axe:'axe',labrys:'labrys',hasta:'spear',pilum:'spear',jade:'jade',trident:'trident',bow:'bow',arcu:'crossbow',sling:'sling',stones:'sling',lyre:'lyre',scutum:'scutum',thracian:'parma',achilles:'round'};
function t93Weapon(k){if(!k)return null;if(T93_WK[k])return {t:T93_WK[k]};const w=typeof W!=='undefined'&&W[k];if(!w)return null;
  if(w.shield)return {t:'parma'};const n=String(w.n||'').toLowerCase();
  for(const [re,t] of [[/bow/,'bow'],[/trident/,'trident'],[/spear|hasta|pilum|lance/,'spear'],[/axe/,'axe'],[/mace|club|hammer/,'mace'],[/dagger|knife|pugio/,'dagger'],[/sica|falx|scythe/,'sica']])if(re.test(n))return {t};
  return {t:(w.r||1)>=3?'bow':(w.r||1)===2?'spear':'sword'}}
/* one armor piece: printed key, or a custom design in its metal colour (+ the shape it was started from, + its extras) */
function t93Piece(k){if(!k||typeof ARM==='undefined'||!ARM[k])return null;const a=ARM[k];
  if(!a.caId)return {t:k};const d=(CUSTOM.armor||[]).find(x=>x.id===a.caId)||{};
  const o={t:d.art&&ARM[d.art]&&!ARM[d.art].caId?d.art:k};if(/^#[0-9a-f]{6}$/i.test(String(d.metal||'')))o.c=d.metal;
  const x=(typeof x92Clean==='function'?x92Clean(d.x92):[]).filter(e=>['studs','spikes','fur','galerus','trim','paint'].includes(e.k)).map(e=>({k:e.k,c:e.c}));if(x.length)o.x=x;return o}
const T93_HELM={galea:'galea',crested:'crista',murmillo:'murmillo',thraex:'thrachelm',provocator:'helm5',horned:'horned'};
function t93Parts(c){const p=c.portrait||{},A=c.arm||{};
  const look={skin:p.skin||'',hair:p.hair||'',hs:p.hs||(p.long?'long':''),bs:p.bs&&p.bs!=='none'?p.bs:(p.beard?'full':''),fem:!!p.fem,cloth:c.color||''};
  const g={};const hd=t93Piece(A.head);if(hd)g.head=hd;else if(T93_HELM[p.helm])g.head={t:T93_HELM[p.helm]};else if(['laurel','circlet','band','pileus','diadem','knot'].includes(p.helm))g.helm=p.helm;
  const ch=t93Piece(A.chest);if(ch)g.chest=ch;if(A.belt)g.belt={t:'balteus'};
  g.arm={};for(const [s,k] of [['R','rarm'],['L','larm']]){const a=A[k]||{},o={};const u=t93Piece(a.upper),l=t93Piece(a.lower);if(u)o.upper=u;if(l)o.lower=l;if(a.wraps)o.wraps=1;if(a.cestus)o.cestus=1;if(Object.keys(o).length)g.arm[s]=o}
  const lu=t93Piece(A.legU)||(A.legUp?{t:'legwrapsU'}:null),ll=t93Piece(A.legL)||(A.legLp?{t:'legwraps'}:null);
  if(lu||ll){g.leg={};for(const s of ['L','R']){g.leg[s]={};if(lu)g.leg[s].upper=lu;if(ll)g.leg[s].lower=ll}}
  const wr=t93Weapon(c.R),wl=t93Weapon(c.L);if(wr)g.wR=wr;if(wl)g.wL=wl;
  return {look,gear:g}}
const t93Hash=(c,pose)=>hashStr(JSON.stringify({v:T93_VER,p:t93Parts(c),pose:String(pose||'')})).toString(36);
/* the record that draws: 3D on and a sheet made */
const t93Rec=c=>{const t=c&&c.tok93;return t&&t.mode!=='classic'&&t.sheet&&Array.isArray(t.meta)&&t.meta.length===4?t:null};
const t93Live=()=>typeof HEADLESS!=='undefined'&&!HEADLESS&&!(typeof S!=='undefined'&&S&&(S.onl||S.sim));
/* background conversion: never in a headless browser (the regression suite's software WebGL would stall other tests) unless
   localStorage flavius_tok93auto=1 (tv93k) */
const t93AutoOK=()=>{try{if(localStorage.getItem('flavius_tok93auto')==='1')return true}catch(e){}return !/HeadlessChrome/.test(navigator.userAgent||'')};
function t93ForCls(cls){const C=typeof CLASSES!=='undefined'&&CLASSES[cls];if(!C||!C.custom||!t93Live())return null;
  const c=(typeof CUSTOM!=='undefined'&&CUSTOM.chars||[]).find(x=>'cc_'+x.id===cls);return t93Rec(c)}
/* a sheet as a short blob: URL (made once per sheet) and as an Image for the canvas */
const t93Key=t=>t.h+'|'+t.sheet.length;
function t93URL(t){let u=T93.url.get(t93Key(t));if(u)return u;try{const m=/^data:([^;]+);base64,(.*)$/.exec(t.sheet);const bin=atob(m[2]);const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);
  u=URL.createObjectURL(new Blob([a],{type:m[1]}))}catch(e){u=t.sheet}T93.url.set(t93Key(t),u);return u}
function t93Img(t){const k=t93Key(t);let im=T93.img.get(k);if(!im){im=new Image();im.onload=()=>{try{draw()}catch(e){}};im.src=t93URL(t);T93.img.set(k,im)}return im.complete&&im.naturalWidth?im:null}
/* the front cell laid out like a figure image (100×170 frame, base point at 157/170) for the callers that draw tokenImg
   themselves: corpses in the sand, the menu show, the beast pen's watchers */
function t93Frame(t){const k=t93Key(t);let c=T93.frame&&T93.frame.get(k);if(c)return c;const im=t93Img(t);if(!im)return null;
  const M=t.meta,H=340,W2=200,s=Math.min(H/1.3*MINI_BASE/25.4/MINI_PXMM,W2/M[0]);c=document.createElement('canvas');c.width=W2;c.height=H;
  c.getContext('2d').drawImage(im,0,0,M[0],M[1],W2/2-M[2]*s,H*157/170-M[3]*s,M[0]*s,M[1]*s);(T93.frame||(T93.frame=new Map())).set(k,c);return c}
/* the front cell as an inline figure (Play Now seats, Studio lists, Manager cards…) */
function t93HTML(t,h=60,cell=0){const M=t.meta,k=h/M[1],w=Math.round(M[0]*k);
  return `<span class="tkfig t93fig" role="img" aria-label="${_T('3D token')}" style="display:inline-block;height:${h}px;width:${w}px;background:url('${t93URL(t)}') ${-Math.round(cell*M[0]*k)}px 0/${Math.round(M[0]*8*k)}px ${h}px no-repeat"></span>`}

/* ---------- making a sheet ---------- */
const t93Stand=api=>api.presets[0][2];
function t93Encode(cv){let d='';try{d=cv.toDataURL('image/webp',0.9)}catch(e){}if(!/^data:image\/webp/.test(d))d=cv.toDataURL('image/png');return d}
async function t93Make(c,pose,mode,pk){const api=await t93Load();const P=t93Parts(c);api.apply({look:P.look,gear:P.gear,pose});
  const t0=performance.now();const s=await api.sheetAsync();const sheet=t93Encode(s.canvas);T93.ms.push(Math.round(performance.now()-t0));T93.made++;
  return {v:T93_VER,mode:mode||'3d',pose:String(pose),pk:pk||'',parts:P,h:t93Hash(c,pose),sheet,meta:s.meta,at:new Date().toISOString().slice(0,10)}}
/* store a token on the saved character (only its tok93 changes) and on the open draft */
async function t93Persist(id,tok){if(!id)return;const x=(CUSTOM.chars||[]).find(z=>z.id===id);
  if(typeof ST!=='undefined'&&ST.draft&&ST.draft.id===id&&ST.tab==='chars')ST.draft.tok93=JSON.parse(JSON.stringify(tok));
  if(!x)return;x.tok93=tok;await Store.put('customChars',x.id,JSON.parse(JSON.stringify(x))).catch(()=>{})}
/* a character that needs (another) sheet: never made, or 3D and its look / gear / pose changed since */
const t93Needs=c=>{if(!c||!c.id||T93.skip.has(c.id))return false;const t=c.tok93;if(!t)return true;if(t.mode==='classic')return false;return !t.sheet||t.h!==t93Hash(c,t.pose)};
const t93StudioUp=()=>!!document.getElementById('studio');
const t93Idle=()=>new Promise(ok=>{if(typeof requestIdleCallback==='function')requestIdleCallback(()=>ok(),{timeout:1500});else setTimeout(ok,300)});
/* AUTO-CONVERT: one character at a time while the Studio is open (and the modeller is not) */
async function t93Convert(){if(T93.conv||!t93Live()||T93.fail||!t93AutoOK())return;T93.conv=true;
  try{for(let w=0;w<40&&!t93StudioUp();w++)await new Promise(r=>setTimeout(r,250));await new Promise(r=>setTimeout(r,1200));
    for(let n=0;n<200;n++){if(!t93StudioUp()||T93.busy)break;const c=(CUSTOM.chars||[]).find(t93Needs);if(!c)break;
      await t93Idle();if(!t93StudioUp()||T93.busy)break;
      try{const api=await t93Load();const old=c.tok93||{};const pose=old.pose||t93Stand(api);
        const tok=await t93Make(c,pose,old.mode||'3d',old.pose?old.pk||'':'stand');if(T93.busy)break;await t93Persist(c.id,tok);t93Patch(c.id)}
      catch(e){T93.skip.add(c.id);if(T93.fail)break}}}
  finally{T93.conv=false}}
/* refresh what shows a character's token without redrawing the Studio (focus and typing stay put) */
function t93Patch(id){try{const card=document.querySelector('#studio [data-t93card]');if(card&&ST.draft&&ST.draft.id===id)card.outerHTML=t93CardHTML(ST.draft);
  const c=(CUSTOM.chars||[]).find(z=>z.id===id),t=t93Rec(c);for(const el of document.querySelectorAll(`#studio [data-t93row="${id}"]`))el.innerHTML=t?t93HTML(t,44):'';
  if(typeof draw==='function')draw()}catch(e){}}

/* ---------- the board: custom characters wear their sheet in the figure path ---------- */
const t93Tag=(o,t)=>{const r={...o};Object.defineProperty(r,'t93',{value:t,enumerable:false});return r};
{const base=tokenForCls;tokenForCls=function(cls){const r=base.apply(this,arguments);try{const t=r&&typeof r==='object'&&t93ForCls(cls);if(t)return t93Tag(r,t)}catch(e){}return r}}
{const base=tokenForP;tokenForP=function(p){const r=base.apply(this,arguments);try{if(r&&typeof r==='object'&&!r.t93&&p){const t=t93ForCls(p.cls);if(t)return t93Tag(r,t)}}catch(e){}return r}}
{const base=tokenImg;tokenImg=function(spec){if(spec&&spec.t93){const im=t93Frame(spec.t93);if(im)return im}return base.apply(this,arguments)}}
/* base centred on (x, y≈the tile centre + TW·0.02 from drawPlayer); h = the figure height the caller asked for (TW·1.3 on the board) */
{const base=drawFigureTok;drawFigureTok=function(sp,x,y,h,opt={}){const t=sp&&sp.t93;if(!t||typeof ctx==='undefined')return base.apply(this,arguments);
  const im=t93Img(t);if(!im)return base.apply(this,arguments);
  try{const M=t.meta,s=(h/1.3)*MINI_BASE/25.4/MINI_PXMM,by=y-h*0.015;const i=MINI_CUR&&typeof miniFace==='function'?miniFace(MINI_CUR,'t93'):0;
    ctx.save();ctx.fillStyle='rgba(0,0,0,.32)';const rw=(h/1.3)*MINI_BASE*0.55;ell(x+2,by+3,rw,rw*0.5);ctx.fill();
    if(opt&&opt.dim)ctx.globalAlpha=opt.dim;if(opt&&opt.filter)ctx.filter=opt.filter;
    ctx.drawImage(im,(i||0)*M[0],0,M[0],M[1],x-M[2]*s,by-M[3]*s,M[0]*s,M[1]*s);
    /* the seat's colour on the base rim (the board ring hides under the round base) */
    const pc=MINI_CUR&&MINI_CUR.color&&!(opt&&opt.filter);if(pc){const k=s*MINI_PXMM,rx=12.75*k;ctx.globalAlpha=1;ctx.strokeStyle=pc;ctx.lineWidth=Math.max(1.5,2.3*k);ctx.beginPath();ctx.ellipse(x,by-1.35*k,rx,rx*0.5,0,0.05,Math.PI-0.05);ctx.stroke()}
    ctx.restore();T93.drawn=(T93.drawn||0)+1;
    const top=by-M[3]*s+M[1]*s*0.05;try{TOP83=top}catch(e){}return top}catch(e){console.error(e);return base.apply(this,arguments)}}}
/* every HTML figure of the character */
{const base=figureHTML;figureHTML=function(spec,height){if(spec&&spec.t93&&t93Live())return t93HTML(spec.t93,height||60);return base.apply(this,arguments)}}

/* ---------- the Character designer's token step ---------- */
function t93CardHTML(c){const t=c&&c.tok93,rec=t93Rec(c),classic=t&&t.mode==='classic';
  const stale=rec&&t.h!==t93Hash(c,t.pose);const pk=t&&t.pk?(T93_PRE[t.pk]||''):t&&t.pose?_T('Your own pose'):'';
  const note=T93.fail?_T('3D tokens need WebGL, which this browser has switched off. The classic token is used.')
    :classic?_T('The classic token is on the board.')
    :!rec?_T('Not made yet — open the modeller, or it is made in the background.')
    :stale?_T('The look changed: the token is remade in the background after you save.')
    :pk?_T`Pose: ${pk}`:'';
  return `<div class="card2 t93card" data-t93card><div class="sect" style="margin-top:0">${_T('🧍 3D token')}</div>
    <div class="t93row"><div class="t93pv">${rec&&!classic?t93HTML(t,104):`<span class="t93none">${classic?'—':'?'}</span>`}</div>
    <div class="t93ctl"><div class="seg t93seg" role="group" aria-label="${_T('Board token')}"><button type="button" data-t93mode="3d" class="${classic?'':'on'}" aria-pressed="${!classic}">3D</button><button type="button" data-t93mode="classic" class="${classic?'on':''}" aria-pressed="${!!classic}">${_T('Classic')}</button></div>
    <button class="btn" type="button" data-t93="open">${_T('🧍 Pose the 3D token')}</button><small class="rc-sub">${note}</small></div></div></div>`}
const T93_PRE={stand:_T('Stand'),guard:_T('Guard'),lunge:_T('Lunge'),victory:_T('Victory'),defend:_T('Defend'),taunt:_T('Taunt')};
{const base=charEditorHTML;charEditorHTML=function(){let h=base.apply(this,arguments);try{const c=ST.draft;if(!c||typeof h!=='string'||/data-t93card/.test(h))return h;
  const i=h.indexOf('data-f="tokenRef"');const j=i>=0?h.indexOf('</label>',i):-1;const card=t93CardHTML(c);
  if(j>=0)return h.slice(0,j+8)+card+h.slice(j+8);const k=h.indexOf('<div class="card2"');return k>=0?h.slice(0,k)+card+h.slice(k):h+card}catch(e){console.error(e);return h}}}
/* Studio lists: the token beside each character's portrait */
{const base=studioHTML;studioHTML=function(){let h=base.apply(this,arguments);try{if(typeof ST==='undefined'||ST.tab!=='chars'||typeof h!=='string'||!t93Live())return h;
  for(const c of CUSTOM.chars||[]){const t=t93Rec(c),mk=`data-st="edit" data-id="${c.id}"`;let at=h.indexOf(mk);
    while(at>=0){const row=h.lastIndexOf('<div class="lrow"',at),ti=row<0?-1:h.indexOf('<div class="t">',row);
      if(ti>=0&&ti<at&&h.slice(row,ti).indexOf('data-t93row')<0){const ins=`<span class="t93lt" data-t93row="${c.id}">${t?t93HTML(t,44):''}</span>`;h=h.slice(0,ti)+ins+h.slice(ti);at+=ins.length}
      at=h.indexOf(mk,at+mk.length)}}}catch(e){console.error(e)}return h}}
/* the Studio converts in the background while it is open */
{const base=openStudio;openStudio=function(){const r=base.apply(this,arguments);try{if(t93Live())setTimeout(()=>{t93Convert()},0)}catch(e){}return r}}
/* a save keeps a token made meanwhile, and a changed look gets a new sheet in the background */
{const base=stSaveDraft;stSaveDraft=function(){try{if(ST.tab==='chars'&&ST.draft&&ST.draft.id){const x=(CUSTOM.chars||[]).find(z=>z.id===ST.draft.id);if(x&&x.tok93&&(!ST.draft.tok93||(x.tok93.at||'')>(ST.draft.tok93.at||'')&&x.tok93.h!==ST.draft.tok93.h))ST.draft.tok93=JSON.parse(JSON.stringify(x.tok93))}}catch(e){}
  const r=base.apply(this,arguments);try{if(ST.tab==='chars'&&r&&r.then)r.then(d=>{if(d&&t93Live())setTimeout(()=>{t93Convert()},0)})}catch(e){}return r}}
/* Play Now: custom seats show their token like the printed minis */
{const base=setupBody;setupBody=function(){const h=base.apply(this,arguments);try{if(typeof CFG==='undefined'||!CFG.seats||!/class="pn75|pn-who/.test(h)||!t93Live())return h;
  const d=document.createElement('div');d.innerHTML=h;const seats=d.querySelectorAll('.pn-who .seats>.seat');let n=0;
  [...seats].forEach((el,i)=>{const s=CFG.seats[i];const t=s&&t93ForCls(s.cls);if(!t||el.querySelector('.pn-fig'))return;el.insertAdjacentHTML('afterbegin',`<div class="pn-fig t93pn">${t93HTML(t,80)}</div>`);n++});
  return n?d.innerHTML:h}catch(e){console.error(e);return h}}}

/* ---------- the modeller (a window of its own over the Studio) ---------- */
/* c0 = the character (default: the Studio draft); opt.save(api, pose, pk, say) = a caller's own Save (v0.94 online: render + upload), opt.errText(e) its words for a failure */
function t93Open(c0,opt){opt=opt||{};const c=c0||(typeof ST!=='undefined'?ST.draft:null);if(!c||T93.busy)return;T93.busy=true;const from=document.activeElement;
  const ov=document.createElement('div');ov.id='t93m';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label',_T('3D token modeller'));
  ov.innerHTML=`<div class="t93box"><div class="t93hd"><b>${_T`🧍 3D token · ${esc(c.name||'')}`}</b><button type="button" class="btn" data-t93m="close" aria-label="${_T('Close')}">✕</button></div>
    <div class="t93bd"><div class="t93view"><canvas id="t93cv"></canvas><div class="t93msg" id="t93msg">${_T('Building the body…')}</div></div>
    <div class="t93side"><h4>${_T('Poses')}</h4><div class="t93pre" id="t93pre"></div>
      <h4>${_T('Feet on the base')}</h4><label><input type="checkbox" data-t93pin="L"> ${_T('Pin left')}</label> <label><input type="checkbox" data-t93pin="R"> ${_T('Pin right')}</label>
      <p class="rc-sub t93how">${_T('Drag a joint to turn it; drag a wrist or an ankle to reach. Drag empty space to turn the view, the wheel zooms.')}</p>
      <p class="t93key"><span style="background:#f4d03f"></span>${_T('spine')} <span style="background:#3b7dd8"></span>${_T('left')} <span style="background:#d8433b"></span>${_T('right')} <span style="background:#f28dc4"></span>${_T('hands, hips')}</p></div></div>
    <div class="t93strip" id="t93strip" aria-label="${_T('The eight facings on the board')}"></div>
    <div class="t93ft"><button type="button" class="btn" data-t93m="reset">${_T('↺ Reset')}</button><span style="flex:1"></span><button type="button" class="btn" data-t93m="close">${_T('Cancel')}</button><button type="button" class="btn primary" data-t93m="save" disabled>${_T('✓ Save token')}</button></div></div>`;
  document.body.appendChild(ov);
  const q=s=>ov.querySelector(s);const cv=q('#t93cv'),msg=q('#t93msg');let api=null,ed=null,pk=(c.tok93&&c.tok93.pk)||'',closed=false,stripT=0;
  const close=()=>{if(closed)return;closed=true;try{ed&&ed.destroy()}catch(e){}ov.remove();document.removeEventListener('keydown',key,true);T93.busy=false;try{from&&from.focus&&from.focus()}catch(e){}if(t93Live())setTimeout(()=>{t93Convert()},400)};
  const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}};document.addEventListener('keydown',key,true);
  const fit=()=>{const r=cv.parentElement.getBoundingClientRect(),d=Math.min(1.5,window.devicePixelRatio||1);cv.width=Math.max(50,Math.round(r.width*d));cv.height=Math.max(50,Math.round(r.height*d));if(ed)ed.render()};
  const strip=()=>{clearTimeout(stripT);stripT=setTimeout(()=>{if(closed||!api)return;const box=q('#t93strip');box.innerHTML='';for(const f of api.facings(84)){f.className='t93f';box.appendChild(f)}if(ed)ed.render()},250)};
  const pinsUI=()=>{const p=api.pinned();for(const el of ov.querySelectorAll('[data-t93pin]'))el.checked=!!p[el.dataset.t93pin]};
  const preUI=()=>{for(const b of ov.querySelectorAll('[data-t93pre]')){b.classList.toggle('on',b.dataset.t93pre===pk);b.setAttribute('aria-pressed',String(b.dataset.t93pre===pk))}};
  ov.addEventListener('click',async e=>{const b=e.target.closest('[data-t93m],[data-t93pre]');if(!b||!api&&b.dataset.t93m!=='close')return;
    if(b.dataset.t93pre){const p=api.presets.find(x=>x[0]===b.dataset.t93pre);if(p){api.setPose(p[2]);pk=p[0];preUI();pinsUI();ed.render();strip()}return}
    const a=b.dataset.t93m;if(a==='close')return close();
    if(a==='reset'){const p0=(c.tok93&&c.tok93.pose)||t93Stand(api);api.setPose(p0);pk=(c.tok93&&c.tok93.pk)||(c.tok93&&c.tok93.pose?'':'stand');preUI();pinsUI();ed.render();strip();return}
    if(a==='save'){b.disabled=true;cv.style.pointerEvents='none';msg.textContent=_T('Rendering the eight facings…');msg.hidden=false;await new Promise(r=>setTimeout(r,30));
      try{const pose=api.pose();if(opt.save){await opt.save(api,pose,pk,m=>{msg.textContent=m});close();return}const tok=await t93Make(c,pose,'3d',pk);c.tok93=tok;await t93Persist(c.id,tok);close();
        if(typeof studioRedraw==='function')studioRedraw();if(typeof mToast==='function')mToast(_T('🧍 3D token saved'))}
      catch(err){if(!opt.errText)console.error(err);msg.textContent=opt.errText?opt.errText(err):_T('That did not work. Try again.');b.disabled=false;cv.style.pointerEvents=''}}});
  ov.addEventListener('change',e=>{const el=e.target.closest('[data-t93pin]');if(!el||!api)return;const p=api.pinned();p[el.dataset.t93pin]=el.checked;api.pins(p.L,p.R);pk='';preUI();ed.render();strip()});
  window.addEventListener('resize',fit);
  t93Load(n=>{if(!closed)msg.textContent=_T('Building the body…')+' '+'·'.repeat(1+n%12)}).then(a=>{if(closed)return;api=a;
    const P=t93Parts(c);const pose=(c.tok93&&c.tok93.pose)||t93Stand(api);if(!c.tok93||!c.tok93.pose)pk='stand';api.apply({look:P.look,gear:P.gear,pose});
    q('#t93pre').innerHTML=api.presets.map(([k])=>`<button type="button" class="btn" data-t93pre="${k}">${T93_PRE[k]||k}</button>`).join('');preUI();pinsUI();
    msg.hidden=true;fit();ed=api.editor(cv,end=>{pk='';preUI();if(end){pinsUI();strip()}});strip();
    const sv=q('[data-t93m="save"]');sv.disabled=false;try{sv.focus()}catch(e){}})
  .catch(err=>{if(closed)return;msg.textContent=T93.fail==='nowebgl'?_T('3D tokens need WebGL, which this browser has switched off.'):_T('The 3D engine did not load. Check the connection and try again.')});
  setTimeout(fit,0)}
/* the designer card's buttons */
document.addEventListener('click',async e=>{const t=e.target;if(!t.closest||!t.closest('#studio'))return;
  const o=t.closest('[data-t93="open"]');if(o){e.preventDefault();t93Open();return}
  const m=t.closest('[data-t93mode]');if(m&&ST.draft){e.preventDefault();const c=ST.draft;const mode=m.dataset.t93mode;
    c.tok93=c.tok93?{...c.tok93,mode}:{v:T93_VER,mode};if(c.id){const x=(CUSTOM.chars||[]).find(z=>z.id===c.id);if(x){x.tok93=JSON.parse(JSON.stringify(c.tok93));await Store.put('customChars',x.id,JSON.parse(JSON.stringify(x))).catch(()=>{})}}
    t93Patch(c.id);const card=document.querySelector('#studio [data-t93card]');if(card)card.outerHTML=t93CardHTML(c);for(const k in TOKEN_IMG)delete TOKEN_IMG[k];if(mode==='3d')setTimeout(()=>{t93Convert()},0)}});
{const st=document.createElement('style');st.textContent=`
.t93card{margin-top:8px}.t93row{display:flex;gap:10px;align-items:center}.t93pv{min-width:76px;min-height:104px;display:flex;align-items:flex-end;justify-content:center}
.t93none{display:flex;align-items:center;justify-content:center;width:64px;height:96px;border:1px dashed var(--line,#4a4036);border-radius:8px;color:var(--muted);font-size:22px}
.t93ctl{display:grid;gap:6px;min-width:0}.t93seg button{padding:4px 12px}.t93lt{display:inline-flex;align-items:flex-end;min-width:0;margin-right:4px}
.t93fig{vertical-align:bottom;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}.pn-fig.t93pn{display:flex;align-items:flex-end;justify-content:center}
#t93m{position:fixed;inset:0;z-index:20000;background:rgba(10,7,4,.72);display:flex;align-items:center;justify-content:center;padding:12px}
#t93m .t93box{background:var(--panel,#2a2520);color:var(--bone,#efe6d6);border:1px solid var(--gold,#c9a458);border-radius:12px;width:min(1080px,100%);height:min(780px,100%);display:grid;grid-template-rows:auto 1fr auto auto;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.6)}
#t93m .t93hd{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--line,#4a4036);font:400 18px var(--display,serif)}
#t93m .t93bd{display:grid;grid-template-columns:minmax(0,1fr) 260px;min-height:0}
#t93m .t93view{position:relative;min-height:0;background:radial-gradient(ellipse at 50% 70%,#4a4236,#221d18)}#t93m canvas#t93cv{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab}
#t93m .t93msg{position:absolute;left:12px;top:10px;color:var(--muted,#a89c88);pointer-events:none}
#t93m .t93side{padding:10px 12px;overflow:auto;border-left:1px solid var(--line,#4a4036)}#t93m .t93side h4{margin:6px 0}
#t93m .t93pre{display:flex;flex-wrap:wrap;gap:4px}#t93m .t93pre .on{border-color:var(--gold,#c9a458);background:rgba(201,164,88,.2)}
#t93m .t93key span{display:inline-block;width:10px;height:10px;border-radius:50%;margin:0 3px 0 8px;vertical-align:-1px}
#t93m .t93strip{display:flex;gap:4px;justify-content:center;padding:6px;border-top:1px solid var(--line,#4a4036);min-height:60px;overflow-x:auto}#t93m .t93f{width:64px;height:64px;flex:none}
#t93m .t93ft{display:flex;gap:8px;padding:8px 12px;border-top:1px solid var(--line,#4a4036)}
@media (max-width:700px){#t93m{padding:0}#t93m .t93box{border-radius:0;height:100%}#t93m .t93bd{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) auto}#t93m .t93side{border-left:0;border-top:1px solid var(--line,#4a4036);max-height:34vh}#t93m .t93f{width:44px;height:44px}}`;document.head.appendChild(st)}
