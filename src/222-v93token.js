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
   • v0.99 (his 8a): 24 presets in four groups (Stances · Attacks · Defence · Show, rig92 presets.js PRESET_GROUPS) shown as picture buttons
     rendered from the rig on the character's own look (api.thumb, T93.th per look); a JOINTS tab: pick a joint (list or click on the figure),
     Bend / Twist / Side sliders with ◀ ▶ nudges (+ pelvis Height / Forward), the axis drawn as a gizmo ring on the figure, ↺ joint / limb,
     Left → Right / Right → Left copies, Symmetric mode, Lock feet; Undo / Redo (whole poses); keys ↑↓ ←→ 1 2 3 [ ] Ctrl+Z / Ctrl+Y.
     Pose JSON stays ≤ 600 B (eulers clamped ±180°, pelvis ±450 mm); t93Make / t94Sheet unchanged. T93.ui / T93.hist = test hooks.
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
const T93_PRE={stand:_T('Stand'),guard:_T('Guard'),lunge:_T('Lunge'),victory:_T('Victory'),defend:_T('Shield up'),taunt:_T('Taunt'),
  /* v0.99 (his 8a): more presets, grouped (tools/art/rig92/presets.js PRESET_GROUPS) */
  ready:_T('Ready'),wide:_T('Wide'),crouch:_T('Crouch'),coil:_T('Lunge prep'),overhead:_T('Overhead strike'),thrust:_T('Thrust'),slash:_T('Slash wind-up'),bash:_T('Shield bash'),
  throw:_T('Spear throw'),net:_T('Net cast'),aim:_T('Aim'),parry:_T('Parry'),brace:_T('Brace'),salute:_T('Salute'),kneel:_T('Kneel'),crossed:_T('Arms crossed'),limp:_T('Wounded'),spent:_T('Exhausted')};
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

/* v0.99 (his 8a): the joint tools' words. Groups of joints for the list, the three axes of a joint (rig92 eulers, XYZ) */
const T93_GRP={stance:_T('Stances'),attack:_T('Attacks'),defence:_T('Defence'),show:_T('Show')};
const T93_JN={pe:_T('Pelvis'),sp:_T('Spine'),ch:_T('Chest'),ne:_T('Neck'),he:_T('Head'),s:_T('Shoulder'),e:_T('Elbow'),w:_T('Wrist'),h:_T('Hip'),k:_T('Knee'),a:_T('Ankle')};
const T93_JG=[['body',_T('Body'),['pe','sp','ch','ne','he']],['armL',_T('Left arm'),['sL','eL','wL']],['armR',_T('Right arm'),['sR','eR','wR']],['legL',_T('Left leg'),['hL','kL','aL']],['legR',_T('Right leg'),['hR','kR','aR']]];
const T93_JORDER=T93_JG.flatMap(g=>g[2]);
const T93_AX=[{n:_T('Bend'),c:'#ff6b5b',m:180},{n:_T('Twist'),c:'#63d36b',m:90},{n:_T('Side'),c:'#5b9bff',m:180}];
const t93JName=k=>k.length===1||!/[LR]$/.test(k)||['pe','sp','ch','ne','he'].includes(k)?T93_JN[k]:(k[1]==='L'?_T`Left ${T93_JN[k[0]]}`:_T`Right ${T93_JN[k[0]]}`);
const t93Limb=k=>['pe','sp','ch','ne','he'].includes(k)?'spine':'sew'.includes(k[0])?'arm':'leg';
const t93Col=k=>['pe'].includes(k)?'#f28dc4':['sp','ch','ne','he'].includes(k)?'#f4d03f':k[1]==='L'?'#3b7dd8':'#d8433b';
/* the right side shows its numbers mirrored, so a symmetric pose reads the same on both sides */
const t93Sg=k=>/R$/.test(k)&&!['pe','sp','ch','ne','he'].includes(k)?[1,-1,-1]:[1,1,1];
/* the preset buttons' pictures, made once per look (a Map of look hash → {key: data URL}) */
T93.th=T93.th||new Map();

/* ---------- the modeller (a window of its own over the Studio) ---------- */
/* c0 = the character (default: the Studio draft); opt.save(api, pose, pk, say) = a caller's own Save (v0.94 online: render + upload), opt.errText(e) its words for a failure
   v0.99: presets in groups with pictures rendered from the rig · a Joints tab (pick a joint, three axes with sliders + ◀ ▶ nudges, pelvis height,
   reset joint / limb, copy one side onto the other, symmetric mode, lock feet) · Undo / Redo · keys: ↑↓ nudge (Shift 1°, else 5°), ←→ or 1 2 3 the axis,
   [ ] the joint, Ctrl+Z / Ctrl+Y. The pose JSON stays ≤ 600 B (every value is clamped to ±180° / ±450 mm). */
function t93Open(c0,opt){opt=opt||{};const c=c0||(typeof ST!=='undefined'?ST.draft:null);if(!c||T93.busy)return;T93.busy=true;const from=document.activeElement;
  const ov=document.createElement('div');ov.id='t93m';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label',_T('3D token modeller'));
  const axRow=(i)=>`<div class="t93ax" data-t93axr="${i}"><span class="t93axc" style="background:${T93_AX[i].c}"></span><span class="t93axn">${T93_AX[i].n}</span>
      <button type="button" class="btn t93nb" data-t93n="${i}:-1" aria-label="${_T`${T93_AX[i].n} −`}">◀</button><input type="range" min="${-T93_AX[i].m}" max="${T93_AX[i].m}" step="1" value="0" data-nosnap data-t93ax="${i}" aria-label="${T93_AX[i].n}"><button type="button" class="btn t93nb" data-t93n="${i}:1" aria-label="${_T`${T93_AX[i].n} +`}">▶</button><output data-t93o="${i}">0°</output></div>`;
  const offRow=(i,n,lo,hi)=>`<div class="t93ax t93off" data-t93offr="${i}"><span class="t93axc" style="background:#f28dc4"></span><span class="t93axn">${n}</span>
      <button type="button" class="btn t93nb" data-t93no="${i}:-1" aria-label="${_T`${n} −`}">◀</button><input type="range" min="${lo}" max="${hi}" step="5" value="0" data-nosnap data-t93off="${i}" aria-label="${n}"><button type="button" class="btn t93nb" data-t93no="${i}:1" aria-label="${_T`${n} +`}">▶</button><output data-t93oo="${i}">0</output></div>`;
  ov.innerHTML=`<div class="t93box"><div class="t93hd"><b>${_T`🧍 3D token · ${esc(c.name||'')}`}</b><button type="button" class="btn" data-t93m="close" aria-label="${_T('Close')}">✕</button></div>
    <div class="t93bd"><div class="t93view"><canvas id="t93cv"></canvas><div class="t93msg" id="t93msg">${_T('Building the body…')}</div></div>
    <div class="t93side"><div class="seg t93tabs" role="tablist"><button type="button" role="tab" data-t93tab="poses" class="on" aria-selected="true">${_T('Poses')}</button><button type="button" role="tab" data-t93tab="joints" aria-selected="false">${_T('Joints')}</button></div>
      <div class="t93pane" data-t93pane="poses"><div class="t93pre" id="t93pre"></div>
        <p class="rc-sub t93how">${_T('Drag a joint to turn it; drag a wrist or an ankle to reach. Drag empty space to turn the view, the wheel zooms.')}</p>
        <p class="t93key"><span style="background:#f4d03f"></span>${_T('spine')} <span style="background:#3b7dd8"></span>${_T('left')} <span style="background:#d8433b"></span>${_T('right')} <span style="background:#f28dc4"></span>${_T('hands, hips')}</p></div>
      <div class="t93pane" data-t93pane="joints" hidden>
        <div class="t93jl" id="t93jl">${T93_JG.map(([g,n,ks])=>`<div class="t93jg"><small>${n}</small><div>${ks.map(k=>`<button type="button" class="btn t93jb" data-t93j="${k}" aria-pressed="false"><i style="background:${t93Col(k)}"></i>${T93_JN[k.length>2||['pe','sp','ch','ne','he'].includes(k)?k:k[0]]}</button>`).join('')}</div></div>`).join('')}</div>
        <div class="t93jp"><div class="t93jh"><b id="t93jn">—</b><small class="rc-sub" id="t93jnote"></small></div>
          ${axRow(0)}${axRow(1)}${axRow(2)}<div id="t93offs" hidden>${offRow(1,_T('Height'),-450,100)}${offRow(2,_T('Forward'),-200,200)}</div>
          <div class="t93jbtn"><button type="button" class="btn" data-t93m="rj">${_T('↺ Joint')}</button><button type="button" class="btn" data-t93m="rl">${_T('↺ Limb')}</button>
            <button type="button" class="btn" data-t93m="ml" title="${_T('Copy the left side of this limb onto the right (a body joint: both arms and legs)')}">${_T('Left → Right')}</button><button type="button" class="btn" data-t93m="mr" title="${_T('Copy the right side of this limb onto the left (a body joint: both arms and legs)')}">${_T('Right → Left')}</button></div>
          <label class="t93chk"><input type="checkbox" data-t93sym> ${_T('Symmetric: both sides move together')}</label></div>
        <h4>${_T('Lock feet on the base')}</h4><label><input type="checkbox" data-t93pin="L"> ${_T('Left')}</label> <label><input type="checkbox" data-t93pin="R"> ${_T('Right')}</label>
        <p class="rc-sub t93how">${_T('Keys: ↑ ↓ turn the joint (Shift: 1°), ← → pick the axis, [ ] the joint, Ctrl+Z undo.')}</p></div></div></div>
    <div class="t93strip" id="t93strip" aria-label="${_T('The eight facings on the board')}"></div>
    <div class="t93ft"><button type="button" class="btn" data-t93m="reset">${_T('↺ Reset')}</button><button type="button" class="btn" data-t93m="undo" disabled aria-label="${_T('Undo')}" title="${_T('Undo')} (Ctrl+Z)">↶</button><button type="button" class="btn" data-t93m="redo" disabled aria-label="${_T('Redo')}" title="${_T('Redo')} (Ctrl+Y)">↷</button><span style="flex:1"></span><button type="button" class="btn" data-t93m="close">${_T('Cancel')}</button><button type="button" class="btn primary" data-t93m="save" disabled>${_T('✓ Save token')}</button></div></div>`;
  document.body.appendChild(ov);
  const q=s=>ov.querySelector(s);const cv=q('#t93cv'),msg=q('#t93msg');let api=null,ed=null,pk=(c.tok93&&c.tok93.pk)||'',closed=false,stripT=0,thT=0,tab='poses',sel='sR',axis=0,sym=false,kbT=0;
  /* undo / redo: whole poses (JSON + preset mark), at most 60 */
  const H={list:[],at:-1};
  const hBtn=()=>{q('[data-t93m="undo"]').disabled=H.at<=0;q('[data-t93m="redo"]').disabled=H.at>=H.list.length-1};
  const commit=()=>{if(!api)return;const s={pose:api.pose(),pk};const cur=H.list[H.at];if(cur&&cur.pose===s.pose&&cur.pk===s.pk){hBtn();return}
    H.list=H.list.slice(0,H.at+1);H.list.push(s);if(H.list.length>60)H.list.shift();H.at=H.list.length-1;hBtn()};
  const go=d=>{const i=H.at+d;if(!api||i<0||i>=H.list.length)return;H.at=i;const s=H.list[i];api.setPose(s.pose);pk=s.pk;refresh();strip();hBtn()};
  T93.hist=H;
  const close=()=>{if(closed)return;closed=true;clearTimeout(thT);try{ed&&ed.destroy()}catch(e){}ov.remove();document.removeEventListener('keydown',key,true);T93.busy=false;T93.ui=null;try{from&&from.focus&&from.focus()}catch(e){}if(t93Live())setTimeout(()=>{t93Convert()},400)};
  const fit=()=>{const r=cv.parentElement.getBoundingClientRect(),d=Math.min(1.5,window.devicePixelRatio||1);cv.width=Math.max(50,Math.round(r.width*d));cv.height=Math.max(50,Math.round(r.height*d));if(ed)ed.render()};
  const strip=()=>{clearTimeout(stripT);stripT=setTimeout(()=>{if(closed||!api)return;const box=q('#t93strip');box.innerHTML='';for(const f of api.facings(84)){f.className='t93f';box.appendChild(f)}if(ed)ed.render()},250)};
  const pinsUI=()=>{const p=api.pinned();for(const el of ov.querySelectorAll('[data-t93pin]'))el.checked=!!p[el.dataset.t93pin]};
  const preUI=()=>{for(const b of ov.querySelectorAll('[data-t93pre]')){b.classList.toggle('on',b.dataset.t93pre===pk);b.setAttribute('aria-pressed',String(b.dataset.t93pre===pk))}};
  /* the Joints tab shows the selected joint's three axes (or why a pinned leg's can't move) */
  const jointUI=()=>{if(!api)return;for(const b of ov.querySelectorAll('[data-t93j]')){const on=b.dataset.t93j===sel;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))}
    q('#t93jn').textContent=t93JName(sel);const pinned=api.legPinned(sel);q('#t93jnote').textContent=pinned?_T('This foot is locked on the base: drag the ankle, or unlock it to bend the leg.'):'';
    const e=api.joint(sel),sg=t93Sg(sel);
    for(let i=0;i<3;i++){const v=e[i]*sg[i],r=q(`[data-t93ax="${i}"]`);if(document.activeElement!==r||!r.matches(':active'))r.value=v;q(`[data-t93o="${i}"]`).textContent=Math.round(v)+'°';
      const row=q(`[data-t93axr="${i}"]`);row.classList.toggle('hot',i===axis);for(const el of row.querySelectorAll('input,button'))el.disabled=pinned}
    const off=q('#t93offs');off.hidden=sel!=='pe';if(sel==='pe'){const p=api.offset();for(const i of [1,2]){q(`[data-t93off="${i}"]`).value=p[i];q(`[data-t93oo="${i}"]`).textContent=p[i]+' mm'}}
    q('[data-t93m="rl"]').disabled=false;q('[data-t93sym]').checked=sym};
  const refresh=()=>{if(!api)return;preUI();pinsUI();jointUI();if(ed)ed.render()};
  const setTab=t=>{tab=t;for(const b of ov.querySelectorAll('[data-t93tab]')){const on=b.dataset.t93tab===t;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on))}
    for(const p of ov.querySelectorAll('[data-t93pane]'))p.hidden=p.dataset.t93pane!==t;if(ed){ed.select(t==='joints'?sel:null);ed.axis(axis)}if(t==='joints')jointUI()};
  const pick=k=>{if(!k)return;sel=k;if(ed){ed.select(tab==='joints'?k:null)}if(tab!=='joints')setTab('joints');else jointUI()};
  /* symmetric mode: the other side follows the side just changed */
  const mirrorSel=k=>{if(!sym||!api||!/[LR]$/.test(k)||t93Limb(k)==='spine')return;api.mirror(t93Limb(k),k[1])};
  /* one change of the selected joint: e = the three UI values (the right side mirrored) */
  const setSel=(i,v)=>{if(!api||api.legPinned(sel))return;const sg=t93Sg(sel),e=api.joint(sel).map((x,j)=>x*sg[j]);e[i]=Math.max(-T93_AX[i].m,Math.min(T93_AX[i].m,Math.round(v)));
    api.setJoint(sel,e.map((x,j)=>x*sg[j]));mirrorSel(sel);pk='';preUI();pinsUI();jointUI();if(ed)ed.render()};
  const nudge=(i,d)=>{if(!api)return;const sg=t93Sg(sel);setSel(i,api.joint(sel)[i]*sg[i]+d)};
  const setOff=(i,v)=>{if(!api)return;const p=api.offset();p[i]=Math.round(v);api.setOffset(p);pk='';preUI();pinsUI();jointUI();if(ed)ed.render()};
  const later=()=>{clearTimeout(kbT);kbT=setTimeout(()=>{commit();strip()},400)};
  const key=e=>{if(closed)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return}
    const tg=e.target,typing=tg&&/^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName)&&tg.type!=='checkbox'&&tg.type!=='range';if(typing||!api)return;
    const k=e.key,mod=e.ctrlKey||e.metaKey;let done=true;
    if(mod&&(k==='z'||k==='Z')){go(e.shiftKey?1:-1)}else if(mod&&(k==='y'||k==='Y')){go(1)}
    else if(mod||e.altKey)done=false;
    else if(tg&&tg.type==='range')done=false;
    else if(k==='ArrowUp'||k==='ArrowDown'){if(tab!=='joints')setTab('joints');nudge(axis,(k==='ArrowUp'?1:-1)*(e.shiftKey?1:5));later()}
    else if(k==='ArrowLeft'||k==='ArrowRight'){axis=(axis+(k==='ArrowRight'?1:2))%3;if(ed)ed.axis(axis);jointUI()}
    else if(k==='1'||k==='2'||k==='3'){axis=+k-1;if(ed)ed.axis(axis);jointUI()}
    else if(k==='['||k===']'){const i=T93_JORDER.indexOf(sel);pick(T93_JORDER[(i+(k===']'?1:T93_JORDER.length-1))%T93_JORDER.length])}
    else done=false;
    if(done){e.preventDefault();e.stopPropagation()}};
  document.addEventListener('keydown',key,true);
  ov.addEventListener('click',async e=>{const b=e.target.closest('[data-t93m],[data-t93pre],[data-t93tab],[data-t93j],[data-t93n],[data-t93no]');if(!b||!api&&b.dataset.t93m!=='close')return;
    if(b.dataset.t93tab){setTab(b.dataset.t93tab);return}
    if(b.dataset.t93j){pick(b.dataset.t93j);return}
    if(b.dataset.t93n){const [i,d]=b.dataset.t93n.split(':').map(Number);axis=i;if(ed)ed.axis(i);nudge(i,d*(e.shiftKey?1:5));later();return}
    if(b.dataset.t93no){const [i,d]=b.dataset.t93no.split(':').map(Number);setOff(i,api.offset()[i]+d*10);later();return}
    if(b.dataset.t93pre){const p=api.presets.find(x=>x[0]===b.dataset.t93pre);if(p){api.setPose(p[2]);pk=p[0];refresh();commit();strip()}return}
    const a=b.dataset.t93m;if(a==='close')return close();
    if(a==='undo')return go(-1);if(a==='redo')return go(1);
    if(a==='rj'){api.resetJoint(sel);mirrorSel(sel);pk='';refresh();commit();strip();return}
    if(a==='rl'){const L=t93Limb(sel);api.resetLimb(L,sel[1]);if(L!=='spine')mirrorSel(sel);pk='';refresh();commit();strip();return}
    if(a==='ml'||a==='mr'){const L=t93Limb(sel);api.mirror(L==='spine'?'all':L,a==='ml'?'L':'R');pk='';refresh();commit();strip();return}
    if(a==='reset'){const p0=(c.tok93&&c.tok93.pose)||t93Stand(api);api.setPose(p0);pk=(c.tok93&&c.tok93.pk)||(c.tok93&&c.tok93.pose?'':'stand');refresh();commit();strip();return}
    if(a==='save'){b.disabled=true;cv.style.pointerEvents='none';msg.textContent=_T('Rendering the eight facings…');msg.hidden=false;await new Promise(r=>setTimeout(r,30));
      try{const pose=api.pose();if(opt.save){await opt.save(api,pose,pk,m=>{msg.textContent=m});close();return}const tok=await t93Make(c,pose,'3d',pk);c.tok93=tok;await t93Persist(c.id,tok);close();
        if(typeof studioRedraw==='function')studioRedraw();if(typeof mToast==='function')mToast(_T('🧍 3D token saved'))}
      catch(err){if(!opt.errText)console.error(err);msg.textContent=opt.errText?opt.errText(err):_T('That did not work. Try again.');b.disabled=false;cv.style.pointerEvents=''}}});
  ov.addEventListener('input',e=>{const r=e.target.closest('[data-t93ax],[data-t93off]');if(!r||!api)return;
    if(r.dataset.t93ax!=null){axis=+r.dataset.t93ax;if(ed)ed.axis(axis);setSel(axis,+r.value)}else setOff(+r.dataset.t93off,+r.value)});
  ov.addEventListener('change',e=>{const el=e.target;if(!api)return;
    if(el.closest('[data-t93ax],[data-t93off]')){commit();strip();return}
    if(el.matches('[data-t93sym]')){sym=el.checked;if(sym){mirrorSel(sel);refresh();commit();strip()}return}
    const pn=el.closest('[data-t93pin]');if(!pn)return;const p=api.pinned();p[pn.dataset.t93pin]=pn.checked;api.pins(p.L,p.R);pk='';refresh();commit();strip()});
  window.addEventListener('resize',fit);
  /* the preset pictures: rendered from the rig on this look, a few at a time, then kept for the session */
  const thumbs=(P)=>{const hk=hashStr(JSON.stringify(P)).toString(36);let m=T93.th.get(hk);if(!m){m={};T93.th.set(hk,m);if(T93.th.size>8)T93.th.delete(T93.th.keys().next().value)}
    const todo=api.presets.map(p=>p[0]);const put=(k)=>{const sp=q(`[data-t93pre="${k}"] .t93th`);if(sp&&m[k])sp.style.backgroundImage=`url(${m[k]})`};
    todo.forEach(put);const step=()=>{if(closed)return;const k=todo.find(x=>!m[x]);if(!k){ov.dataset.t93th='1';return}
      try{const p=api.presets.find(x=>x[0]===k);m[k]=api.thumb(p[2],60,{span:1.95}).toDataURL('image/png')}catch(er){m[k]='data:,'}put(k);if(ed)ed.render();thT=setTimeout(step,30)};thT=setTimeout(step,200)};
  t93Load(n=>{if(!closed)msg.textContent=_T('Building the body…')+' '+'·'.repeat(1+n%12)}).then(a=>{if(closed)return;api=a;
    const P=t93Parts(c);const pose=(c.tok93&&c.tok93.pose)||t93Stand(api);if(!c.tok93||!c.tok93.pose)pk='stand';api.apply({look:P.look,gear:P.gear,pose});
    const lab=Object.fromEntries(api.presets.map(p=>[p[0],p[1]]));const groups=api.groups||[['all','',api.presets.map(p=>p[0])]];
    q('#t93pre').innerHTML=groups.map(([g,gl,ks])=>`<div class="t93pg" data-t93grp="${g}"><h4>${T93_GRP[g]||gl}</h4><div class="t93pgr">${ks.map(k=>`<button type="button" class="btn t93pb" data-t93pre="${k}" aria-pressed="false" title="${esc(T93_PRE[k]||lab[k]||k)}"><span class="t93th"></span><small>${esc(T93_PRE[k]||lab[k]||k)}</small></button>`).join('')}</div></div>`).join('');
    msg.hidden=true;fit();ed=api.editor(cv,end=>{pk='';const k=ed&&ed.hot();if(k)mirrorSel(k);preUI();jointUI();if(end){pinsUI();commit();strip()}},{onSelect:k=>pick(k)});ed.axis(axis);refresh();commit();strip();thumbs(P);
    T93.ui={sel:()=>sel,axis:()=>axis,pick,setSel,nudge,commit,go,tab:()=>tab,setTab};
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
#t93m .t93bd{display:grid;grid-template-columns:minmax(0,1fr) 330px;min-height:0}
#t93m .t93view{position:relative;min-height:0;background:radial-gradient(ellipse at 50% 70%,#4a4236,#221d18)}#t93m canvas#t93cv{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab}
#t93m .t93msg{position:absolute;left:12px;top:10px;color:var(--muted,#a89c88);pointer-events:none}
#t93m .t93side{padding:10px 12px;overflow:auto;border-left:1px solid var(--line,#4a4036)}#t93m .t93side h4{margin:6px 0}
#t93m .t93pre .on{border-color:var(--gold,#c9a458);background:rgba(201,164,88,.2)}
#t93m .t93tabs{display:flex;margin-bottom:6px}#t93m .t93tabs button{flex:1;padding:5px 8px}#t93m .t93tabs .on{border-color:var(--gold,#c9a458);background:rgba(201,164,88,.2)}
#t93m .t93pg h4{margin:8px 0 4px;font-size:13px;color:var(--gold,#c9a458)}#t93m .t93pgr{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
#t93m .t93pb{display:flex;flex-direction:column;align-items:center;gap:1px;padding:3px 2px;min-width:0}#t93m .t93pb small{font-size:10px;line-height:1.1;text-align:center;overflow:hidden;max-width:100%;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;min-height:2.2em}
#t93m .t93th{display:block;width:56px;height:64px;background:radial-gradient(ellipse at 50% 70%,#4a4236,#2b251f) center/cover;border-radius:6px;background-size:cover}
#t93m .t93th[style*="url"]{background-size:contain;background-repeat:no-repeat;background-position:center;background-color:#3a332a}
#t93m .t93jg{display:flex;align-items:center;gap:6px;margin:2px 0}#t93m .t93jg small{flex:0 0 66px;color:var(--muted,#a89c88);font-size:11px}#t93m .t93jg>div{display:flex;flex-wrap:wrap;gap:3px}
#t93m .t93jb{padding:2px 6px;font-size:11.5px}#t93m .t93jb i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;vertical-align:0}#t93m .t93jb.on{border-color:var(--gold,#c9a458);background:rgba(201,164,88,.25)}
#t93m .t93jp{margin-top:8px;padding:8px;border:1px solid var(--line,#4a4036);border-radius:8px;background:rgba(0,0,0,.15)}#t93m .t93jh{display:grid;gap:2px;margin-bottom:4px}
#t93m .t93ax{display:grid;grid-template-columns:10px 46px 28px minmax(0,1fr) 28px 46px;align-items:center;gap:4px;margin:3px 0;padding:2px;border-radius:6px}#t93m .t93ax.hot{background:rgba(201,164,88,.14)}
#t93m .t93axc{width:10px;height:10px;border-radius:50%}#t93m .t93axn{font-size:12px}#t93m .t93ax input{width:100%;min-width:0;touch-action:pan-y}#t93m .t93nb{padding:2px 0;font-size:11px;min-height:26px}
#t93m .t93ax output{font:12px monospace;text-align:right}#t93m .t93jbtn{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}#t93m .t93jbtn .btn{padding:3px 8px;font-size:12px}#t93m .t93chk{font-size:12.5px}
#t93m .t93key span{display:inline-block;width:10px;height:10px;border-radius:50%;margin:0 3px 0 8px;vertical-align:-1px}
#t93m .t93strip{display:flex;gap:4px;justify-content:center;padding:6px;border-top:1px solid var(--line,#4a4036);min-height:60px;overflow-x:auto}#t93m .t93f{width:64px;height:64px;flex:none}
#t93m .t93ft{display:flex;gap:8px;padding:8px 12px;border-top:1px solid var(--line,#4a4036)}
@media (max-width:700px){#t93m{padding:0}#t93m .t93box{border-radius:0;height:100%}#t93m .t93bd{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) auto}#t93m .t93side{border-left:0;border-top:1px solid var(--line,#4a4036);max-height:34vh}#t93m .t93f{width:44px;height:44px}}`;document.head.appendChild(st)}
