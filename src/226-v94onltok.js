/* =====================================================================
   226-V94ONLTOK · v0.94 — ONLINE 3D TOKENS AS SERVER PICTURES (his pick 2026-10-07)
   =====================================================================
   • THE OWNER POSES: the Domus showcase (the online gladiator screen) gets a "🧍 3D token" card — the v0.93 modeller (222 t93Open,
     opened on the online gladiator: his face, hair, beard and colour from the look, wrapped forearms, no weapons — the online token rule)
     → Save renders the 8 facings ONCE (minis8 sheet, WebP; re-encoded at lower quality until it fits ONLC.TOK94.MAX = 64 KB) and
     UPLOADS it: char.tok in parts of ≤ 24000 base64 characters (API Gateway's 32 KB WebSocket frame), each part with its own rid
     (223 adds it: char.tok is in ONLC.IDEM93). "Classic" (char.tok {off}) goes back to the sculpted token. Refused while the lanista
     is in a room or a match (the server says so; the card is greyed).
   • EVERY SCREEN FETCHES BY HASH: the gladiator carries ch.tok94 = {h}; kits carry look.t94 = {c, h} (ONLC.kitOf, 111 v0.94) → rooms,
     seats, matches know which picture. t94Rec(ref) = the picture from memory → localStorage (flavius_tok94.<h>, ≤ T94_KEEP of them,
     index flavius_tok94i) → tok.get (one request per picture, deduped, a failure waits a minute). Prefetched when a room shows its seats
     and when a match is entered / joined / watched.
   • IN MATCHES: the seat's look (p._onlLook, 116) names the picture; tokenForP tags the sculpted spec (128 p._onlSc) with a non-enumerable
     t93 → 222's figure path draws the sheet (miniFace cell + seat-colour rim) for every viewer whatever their token style. No three.js in
     matches; drawing only — nothing enters S state, the lockstep inputs or onlHash. A missing / failed picture = the sculpted token.
   • ALSO SHOWN: every onlFig (Play stage, room seat cards, the Today boxes, the Domus cards that use it) and the fighter panel (figureHTML).
   • THE MOCK mirrors the server routes (char.tok / tok.get; pictures in localStorage flavius_onlmocktok94, uploads in memory).
   ABUSE NOTE: the server checks type, size and dimensions, not the content — a modified client can upload any WebP of the right size
   (docs/backend.md). */
const T94_KEEP=12;
const T94={mem:new Map(),inflight:new Map(),fail:new Map(),pose:{},fetched:0,repT:0,up:null};
const t94Err=(m,code)=>{const e=new Error(m);if(code)e.code=code;return e};
/* a picture record in the shape 222 draws (t93HTML / t93Img / t93Frame / drawFigureTok): {h, sheet, meta} (+ o94: an online picture) */
const t94Mk=(h,b64,meta,pose,pk)=>({h,sheet:'data:image/webp;base64,'+b64,meta:meta.slice(),pose:pose||'',pk:pk||'',o94:1});
function t94LSGet(h){try{const x=JSON.parse(localStorage.getItem('flavius_tok94.'+h)||'null');if(x&&typeof x.b==='string'&&Array.isArray(x.m)&&!ONLC.tokMetaWhy94(x.m))return t94Mk(h,x.b,x.m,x.p,x.k)}catch(e){}return null}
function t94LSPut(rec){try{const b=rec.sheet.slice(rec.sheet.indexOf(',')+1);let ix=[];try{ix=JSON.parse(localStorage.getItem('flavius_tok94i')||'[]')}catch(e){}if(!Array.isArray(ix))ix=[];
    ix=[rec.h,...ix.filter(x=>x!==rec.h)];while(ix.length>T94_KEEP){try{localStorage.removeItem('flavius_tok94.'+ix.pop())}catch(e){}}
    localStorage.setItem('flavius_tok94.'+rec.h,JSON.stringify({b,m:rec.meta,p:rec.pose,k:rec.pk}));localStorage.setItem('flavius_tok94i',JSON.stringify(ix))}catch(e){}}
function t94Keep(rec,alias){T94.mem.set(rec.h,rec);if(alias&&alias!==rec.h)T94.mem.set(alias,rec);t94LSPut(rec)}
/* a reference {c: gladiator id, h: picture hash} from a look (kits: look.t94) or a gladiator (ch.tok94) */
const t94RefCh=ch=>ch&&ch.id&&ch.tok94&&ch.tok94.h?{c:ch.id,h:ch.tok94.h}:null;
function t94RefLook(look){if(!look||typeof look!=='object'||typeof ONLC==='undefined'||!ONLC.lookTok94)return null;const r=ONLC.lookTok94(look);if(r)return r;
  for(const c of [ONL.char,...(ONL.chars||[])])if(c&&c.look===look)return t94RefCh(c);return null}
/* the picture now (or null — then it is fetched in the background and the screens repaint when it lands) */
function t94Rec(ref){if(!ref||!ref.h)return null;const m=T94.mem.get(ref.h);if(m)return m;const ls=t94LSGet(ref.h);if(ls){T94.mem.set(ref.h,ls);return ls}t94Fetch(ref);return null}
function t94Fetch(ref){if(!ref||!ref.c||typeof NET==='undefined')return Promise.resolve(null);const k=ref.c+'|'+ref.h;if(T94.inflight.has(k))return T94.inflight.get(k);
  if((T94.fail.get(k)||0)>Date.now())return Promise.resolve(null);
  const p=(async()=>{try{const r=await NET.req('tok.get',{c:ref.c});if(!r||!r.b||!r.h){T94.fail.set(k,Date.now()+60e3);return null}
      const chk=ONLC.tokCheck94(r.b,r.meta);if(chk.why){T94.fail.set(k,Date.now()+600e3);return null}
      const rec=t94Mk(r.h,r.b,r.meta,r.pose,r.pk);t94Keep(rec,ref.h);T94.fetched++;t94Repaint();return rec}
    catch(e){T94.fail.set(k,Date.now()+60e3);return null}finally{T94.inflight.delete(k)}})();
  T94.inflight.set(k,p);return p}
/* the picture, waiting for it (the owner's modeller reads the stored pose) */
async function t94Get(ref){return t94Rec(ref)||await t94Fetch(ref)}
/* repaint what shows pictures once one lands (debounced) */
function t94Repaint(){clearTimeout(T94.repT);T94.repT=setTimeout(()=>{try{if(typeof S!=='undefined'&&S&&S.onl&&typeof draw==='function'){draw();if(typeof render==='function')render()}}catch(e){}
  try{if(document.getElementById('onl')&&typeof onlRedraw==='function'&&!(typeof ONL!=='undefined'&&ONL.busy))onlRedraw()}catch(e){}},200)}
/* prefetch every picture a room / match names */
function t94Prefetch(L){try{for(const p of (L&&L.players)||[]){const ref=ONLC.lookTok94((p.kit||{}).look);if(ref)t94Rec(ref)}}catch(e){}}

/* ---------- the board: an online seat wears its picture (drawing only) ---------- */
{const base=tokenForP;tokenForP=function(p){const r=base.apply(this,arguments);try{if(p&&p._onlLook&&r&&typeof r==='object'&&!r.t93){const ref=ONLC.lookTok94(p._onlLook);const rec=ref&&t94Rec(ref);if(rec)return t93Tag(r,rec)}}catch(e){}return r}}
/* the fighter panel and every other HTML figure of an online seat */
{const base=figureHTML;figureHTML=function(spec,height){if(spec&&spec.t93&&spec.t93.o94)return t93HTML(spec.t93,height||60);return base.apply(this,arguments)}}
/* the fighter panel's head figure (07-ui boardHTML draws clsPieceHTML of the class): the seat's own picture */
{const base=boardHTML;boardHTML=function(player){const was=T94.panelP;T94.panelP=player&&player._onlLook?player:null;try{return base.apply(this,arguments)}finally{T94.panelP=was}}}
{const base=clsPieceHTML;clsPieceHTML=function(cls,height){const p=T94.panelP;if(p&&p.cls===cls){try{const ref=ONLC.lookTok94(p._onlLook);const rec=ref&&t94Rec(ref);if(rec)return t93HTML(rec,height||40)}catch(e){}}return base.apply(this,arguments)}}
/* online screens: the stage, room seats, the Today boxes … */
{const base=onlFig;onlFig=function(cls,look,h){try{const ref=t94RefLook(look);const rec=ref&&t94Rec(ref);if(rec)return t93HTML(rec,h||60)}catch(e){}return base.apply(this,arguments)}}
/* into a match (host, joiner, watcher, rejoin): fetch the pictures now — the board falls back to the sculpted token until they land */
for(const f of ['onlEnter','onlJoinMatch','onlWatch','onlAttach']){if(typeof window[f]!=='function')continue;const base=window[f];window[f]=function(L){t94Prefetch(L);return base.apply(this,arguments)}}

/* ---------- the owner: pose, render, upload ---------- */
/* the online gladiator as the modeller's character: the look's face + colour, wrapped forearms, no weapons (online tokens carry none) */
function t94Char(ch){const L=ch.look||{};const CK=(typeof CLASSES!=='undefined'&&CLASSES[ch.cls])||{};const P=T94.pose[ch.id];
  return {id:'onl94_'+ch.id,name:ch.name,portrait:{...(L.portrait||{})},color:L.color||CK.color||'',arm:{rarm:{wraps:1},larm:{wraps:1}},R:null,L:null,tok93:P&&P.pose?{pose:P.pose,pk:P.pk||''}:null}}
/* the sheet as WebP within the server's limit: quality steps down until it fits */
async function t94Sheet(api,c,pose){const P=t93Parts(c);api.apply({look:P.look,gear:P.gear,pose});const s=await api.sheetAsync();const max=Math.ceil(ONLC.TOK94.MAX/3)*4;
  for(const q of [0.9,0.8,0.7,0.6,0.5,0.4]){let d='';if(!T94.noWebp)try{d=s.canvas.toDataURL('image/webp',q)}catch(e){}
    let b;if(/^data:image\/webp;base64,/.test(d))b=d.slice(d.indexOf(',')+1);
    else{T94.noWebp=true;try{b=await t94EncWasm(s.canvas,Math.round(q*100))}catch(e){console.error(e);throw t94Err(_T('This browser cannot save WebP pictures — try Chrome, Edge or Firefox.'),'no_webp')}}
    if(b.length<=max)return {b64:b,meta:s.meta}}
  throw t94Err(_T('The token picture is too big (64 KB at most).'),'too_big')}
/* SAFARI: its canvas cannot make WebP (toDataURL quietly answers PNG) → libwebp as WebAssembly (assets/webpenc94.js, built by
   tools/mkwebpenc94.py from @jsquash/webp), loaded on demand only here; the bytes are the same kind of WebP Chrome makes */
const T94_WOPT={quality:75,target_size:0,target_PSNR:0,method:4,sns_strength:50,filter_strength:60,filter_sharpness:0,filter_type:1,partitions:0,segments:4,pass:1,
  show_compressed:0,preprocessing:0,autofilter:0,partition_limit:0,alpha_compression:1,alpha_filtering:1,alpha_quality:100,lossless:0,exact:0,image_hint:0,
  emulate_jpeg_size:0,thread_level:0,low_memory:0,near_lossless:100,use_delta_palette:0,use_sharp_yuv:0};
function t94EncLoad(){if(T94.enc)return T94.enc;T94.enc=(async()=>{if(!window.WEBPENC94)await t93Script('webpenc94.js');
    const bin=Uint8Array.from(atob(window.WEBPENC94_WASM),ch=>ch.charCodeAt(0));return window.WEBPENC94({noInitialRun:true,wasmBinary:bin})})();
  T94.enc.catch(()=>{T94.enc=null});return T94.enc}
async function t94EncWasm(cv,q){const M=await t94EncLoad();const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);
  const out=M.encode(d.data,cv.width,cv.height,{...T94_WOPT,quality:q});if(!out||!out.length)throw new Error('webp encode');
  let bin='';const u=new Uint8Array(out.buffer||out);for(let i=0;i<u.length;i+=0x8000)bin+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(bin)}
/* the upload: parts in order (each its own request + rid) → the server's answer to the last one */
async function t94Upload(ch,b64,meta,pose,pk,say){const P=ONLC.TOK94.PART,parts=[];for(let i=0;i<b64.length;i+=P)parts.push(b64.slice(i,i+P));
  if(!parts.length||parts.length>ONLC.TOK94.PARTS)throw t94Err(_T('The token picture is too big (64 KB at most).'),'too_big');
  const up='u'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);let r=null;
  for(let i=0;i<parts.length;i++){if(say)say(_T`Sending the picture… ${i+1}/${parts.length}`);const d={char:ch.id,up,i,n:parts.length,b:parts[i]};if(i===0){d.meta=meta;d.pose=String(pose||'');d.pk=String(pk||'')}
    r=await NET.req('char.tok',d)}
  if(!r||!r.done)throw t94Err(_T('That did not work. Try again.'));return r}
function t94Busy(ch){try{if(typeof d89Busy==='function'&&d89Busy().has(ch.id))return true}catch(e){}try{return !!(typeof onlBusy==='function'&&onlBusy())}catch(e){return false}}
async function t94Open(ch){if(!ch||T93.busy||T94.up)return;if(t94Busy(ch)){onlToast80('⚠ '+esc2(_T('Finish or leave your game first.')));return}
  const ref=t94RefCh(ch);if(ref){try{const rec=await t94Get(ref);if(rec&&rec.pose)T94.pose[ch.id]={pose:rec.pose,pk:rec.pk}}catch(e){}}
  const c=t94Char(ch);
  t93Open(c,{errText:e=>errText92(e,_T('That did not work. Try again.')),save:async(api,pose,pk,say)=>{T94.up=ch.id;try{
      say(_T('Rendering the eight facings…'));const S0=await t94Sheet(api,c,pose);const r=await t94Upload(ch,S0.b64,S0.meta,pose,pk,say);
      t94Keep(t94Mk(r.h,S0.b64,S0.meta,pose,pk));T94.pose[ch.id]={pose,pk};if(r.char&&r.char.id){if(typeof onl83Put==='function')onl83Put(r.char);if(ONL.char&&ONL.char.id===r.char.id)ONL.char=r.char}
      onlToast80(_T('🧍 3D token saved — every lanista sees it now.'));setTimeout(()=>{try{onlRedraw()}catch(e){}},0)}finally{T94.up=null}}})}
function t94Off(ch){if(!ch||!ch.tok94)return;if(t94Busy(ch)){onlToast80('⚠ '+esc2(_T('Finish or leave your game first.')));return}
  return onlDo(async()=>{const r=await NET.req('char.tok',{char:ch.id,off:1});if(r&&r.char){if(typeof onl83Put==='function')onl83Put(r.char);if(ONL.char&&ONL.char.id===r.char.id)ONL.char=r.char}
    onlToast80(_T('The sculpted token is back.'))})}
/* the card on the Domus showcase */
function t94CardHTML(ch,busy){const ref=t94RefCh(ch),rec=ref&&t94Rec(ref);const lock=busy&&busy.has&&busy.has(ch.id);
  const fig=rec?t93HTML(rec,96):(typeof onlFig==='function'?onlFig(ch.cls,ch.look,84):'');
  const note=lock?_T('In a game — the token waits until it is over.'):rec||ref?_T('Every lanista sees this token on the sand.'):_T('Pose a 3D token: it replaces the sculpted one on every screen.');
  return `<div class="t94card" data-t94card="${esc2(ch.id)}"><div class="t94fig">${fig}</div><div class="t94b"><b>${_T('🧍 3D token')}</b><small class="rc-sub">${note}</small>
    <div class="t94row"><button type="button" class="btn tksm" data-t94="pose" data-v="${esc2(ch.id)}" ${lock?'disabled':''}>${ref?_T('🧍 Change the pose'):_T('🧍 Pose the 3D token')}</button>${ref?`<button type="button" class="btn tksm" data-t94="off" data-v="${esc2(ch.id)}" ${lock?'disabled':''}>${_T('Classic')}</button>`:''}</div></div></div>`}
if(typeof d89Show==='function'){const base=d89Show;d89Show=function(ch,busy){const h=base.apply(this,arguments);try{if(!ch||typeof h!=='string'||h.indexOf('data-t94card')>=0)return h;
  const at=h.indexOf('<div class="sc89-mon">');const card=t94CardHTML(ch,busy||new Set());return at>=0?h.slice(0,at)+card+h.slice(at):h}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-t94]');if(!b||!b.closest('#onl'))return;e.preventDefault();e.stopPropagation();
  const id=b.dataset.v;const ch=[ONL.char,...(ONL.chars||[])].find(c=>c&&c.id===id);if(!ch)return;if(b.dataset.t94==='pose')t94Open(ch);else if(b.dataset.t94==='off')t94Off(ch)},true);

/* ---------- the mock server: the same routes and checks as server/src/routes.js (v0.94) ---------- */
const T94M_KEY='flavius_onlmocktok94';
function t94MLoad(){try{const o=JSON.parse(localStorage.getItem(T94M_KEY)||'{}');return o&&typeof o==='object'?o:{}}catch(e){return {}}}
function t94MSave(o){try{localStorage.setItem(T94M_KEY,JSON.stringify(o))}catch(e){throw onlErr82(_T('The arena is busy — try again in a moment.'),'store')}}
const T94M_UP=new Map();
if(typeof MOCK_ROUTES!=='undefined')Object.assign(MOCK_ROUTES,{
  'char.tok':(w,d,me)=>{const ch=w.chars[d.char];if(!ch||ch.owner!==me)throw new Error(_T('Not yours.'));if(!ch.alive)throw new Error(_T('The dead stay as they fell.'));
    if(mockBusy(w,me))throw onlErr82(_T('Finish or leave your game first.'),'in_match');
    if(d.off){const P=t94MLoad();delete P[ch.id];t94MSave(P);delete ch.tok94;return {off:1,char:ch}}
    const why=ONLC.tokPartWhy94(d);if(why)throw onlErr82(_T(why),'tok_part');const k=ch.id+'|'+d.up;let U=T94M_UP.get(k);
    if(d.i===0){const mw=ONLC.tokMetaWhy94(d.meta)||ONLC.tokPoseWhy94(d.pose,d.pk);if(mw)throw onlErr82(_T(mw),'tok_bad');if(!U){U={owner:me,n:d.n,meta:d.meta.slice(),pose:String(d.pose||''),pk:String(d.pk||''),p:[]};T94M_UP.set(k,U)}}
    if(!U||U.owner!==me||U.n!==d.n)throw onlErr82(_T('That upload is out of order — save the token again.'),'tok_part');
    U.p[d.i]=d.b;for(let i=0;i<U.n;i++)if(typeof U.p[i]!=='string')return {got:d.i};
    T94M_UP.delete(k);const b=U.p.join('');const chk=ONLC.tokCheck94(b,U.meta);if(chk.why)throw onlErr82(_T(chk.why),'tok_bad');
    const A=w.accounts[me]||{};const day=ONLC.dayKey(Date.now());if(!A.tq94||A.tq94.h!==day)A.tq94={h:day,n:0};
    if(A.tq94.n>=ONLC.TOK94.DAY_MAX)throw onlErr82(_T`At most ${ONLC.TOK94.DAY_MAX} token pictures a day — try again tomorrow.`,'tok_day');A.tq94.n++;
    const P=t94MLoad();P[ch.id]={owner:me,h:chk.h,b,meta:U.meta,pose:U.pose,pk:U.pk,at:Date.now(),v:1};t94MSave(P);ch.tok94={h:chk.h,at:Date.now()};
    return {done:1,h:chk.h,tok94:ch.tok94,char:ch,bytes:chk.bytes.length}},
  'tok.get':(w,d)=>{const c=String(d.c||'');if(!/^[A-Za-z0-9_-]{1,40}$/.test(c))throw new Error(_T('No such picture.'));const T=t94MLoad()[c];
    if(!T||!T.b)return {c,none:1};if(d.h&&d.h===T.h)return {c,h:T.h,same:1};return {c,h:T.h,b:T.b,meta:T.meta,pose:T.pose||'',pk:T.pk||''}}});

{const st=document.createElement('style');st.textContent=`
.t94card{display:flex;gap:10px;align-items:flex-end;margin:8px 0;padding:6px 8px;border:1px solid var(--line,#4a4036);border-radius:8px;background:rgba(0,0,0,.18)}
.t94card .t94fig{min-width:60px;min-height:84px;display:flex;align-items:flex-end;justify-content:center}.t94card .t94b{display:grid;gap:4px;min-width:0}
.t94card .t94row{display:flex;flex-wrap:wrap;gap:6px}`;document.head.appendChild(st)}
