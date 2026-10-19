/* =====================================================================
   400-v107tok — v1.07 OLD TOKEN PIECES RETIRED (his t1a…t5a, 2026-10-19; tools/plans/v106/NOTES.md "Old token pieces retired").
   REPLACES: v0.72 "3D minis" token style (94-v72), v0.75 "3D minis replace standees" (106-v75), the Figures / Standees / Cylinders
   token styles (12-settings tab 'tokens', 246's Board & pieces card). DISPLAY ONLY: rules, dice (RNG), S, the log and the online hash
   are untouched — no rand(), nothing sent.
   • 1a ONE STYLE: SETTINGS.tokenStyle always reads 'figure' and SETTINGS.mini3d false (a getter put back by every applySettings, so an old
     per-browser value or a profile is ignored) → every board piece goes through drawFigureTok, where 311 / 312 draw the v1.0 3D figures.
     Settings → Board & pieces loses the "Gladiators & beasts" card (set98Pieces) and the old tab 'tokens' its style rows (settingsHTML);
     the Armor style rows of that tab stay.
   • 2a ONE STILL FRAME when the 3D figure cannot show (standalone download — mkshare skips anim100_* / beast100_*; a sheet still loading or
     failed; a Studio / online figure still rendering on this device; two lost limbs — N11a "always 3D"): the idle cell of the 3D figure in
     its facing, cut from the shipped sheets by tools/art/still107/make.py → assets/still107_<cls>.webp (8 MINI_YAW cells = the idle row of
     anim100_<cls>_move, anchors from ANIM100_META) and still107_b_<beast>.webp (beast100 idle0, BEAST100_META iw). Gladiators: 311's
     an100DrawP is wrapped — when it draws nothing, the still is drawn through 311's an100Cell (same scale, shadow, seat rim, glide, 321
     bases). A Studio token with its own 222 picture keeps it (its first rendered frame); else the printed class of its base. Beasts: an
     outer drawFigureTok / drawZoraMini wrapper draws the still whenever 312 will not (off, standalone, decoding). Custom beasts / boar /
     croc kinds keep today's figure.
   • 3a OFF THE BOARD one look: figureHTML / clsPieceHTML / npcPieceHTML show the still facing the viewer (assets/still107f_<k>.webp,
     trimmed) for the printed classes + system beasts (a spec is matched to its class by identity or by its TOKEN_DEF / TOKEN_OVR JSON);
     MINI_URL points at the fronts (Play Now seats 106, onlMini 112); st107Mini(k) names the front for the 'mini_<k>.webp' sites (298
     rooms, 299 recruiting, 301 briefing, 129 beast cards). Custom Studio / online tokens keep their own 3D render (222 t93HTML / 226).
   • 4a His Magnus Edition minis (assets/minis8_*) only in Credits → Prototype: "The tabletop minis" row (protoHTML wrapper, CSS sprites
     of cell 0); 102's mini8Img answers null so nothing else loads them.
   • COST: one cached cell canvas per piece (311's an100CellCanvas / 312's bst100CellCanvas), no extra loop; sheets ≈15 KB each, loaded
     on first need (the eight classes on an idle callback after boot).
   Kill switch localStorage flavius_v107tokoff=1 → the old token styles, settings rows and pictures exactly. Test tv107a.
   ===================================================================== */
const ST107={on:true,img:{},stats:{p:0,b:0,html:0},
  /* trimmed front sizes [w,h] in px (tools/art/still107/make.py prints them) */
  F:{amazonia:[68,97],damnatio:[68,97],hero:[68,103],royalty:[68,99],slave:[68,104],soldier:[68,101],venatore:[68,101],veteranus:[68,98],
    arenosus:[82,63],brutum:[98,97],commodus:[82,139],glykon:[82,63],leaena:[127,98],leo:[130,98],moechus:[82,77],tholo:[82,138],ursa:[98,97],valencia:[82,77],zora:[112,90]}};
try{if(localStorage.getItem('flavius_v107tokoff')==='1')ST107.on=false}catch(e){}
const ST107_CLS=['soldier','hero','slave','royalty','amazonia','veteranus','venatore','damnatio'];
const st107File=k=>ST107_CLS.includes(k)?'still107_'+k+'.webp':'still107_b_'+k+'.webp';
const st107URL=f=>typeof assetURL==='function'?assetURL(f):'assets/'+f;
/* st107Mini — the off-board picture file of class / beast k (the 'mini_<k>.webp' sites); the old file with the kill switch on */
function st107Mini(k){return ST107.on&&ST107.F[k]?'still107f_'+k+'.webp':'mini_'+k+'.webp'}
/* st107Img — the decoded still sheet of k (class or beast key) or null; the first ask loads it, then one redraw */
function st107Img(k){if(typeof HEADLESS!=='undefined'&&HEADLESS)return null;let im=ST107.img[k];
  if(!im){im=new Image();im.decoding='async';ST107.img[k]=im;im.onload=()=>{im._ok=1;try{if(typeof S!=='undefined'&&S&&typeof draw==='function')draw()}catch(e){}};im.onerror=()=>{im._bad=1};im.src=st107URL(st107File(k))}
  return im._ok?im:null}

/* ---------------- 1a · one token style ---------------- */
function st107Pin(){try{if(!ST107.on||typeof SETTINGS==='undefined'||!SETTINGS)return;const d=Object.getOwnPropertyDescriptor(SETTINGS,'tokenStyle');if(d&&d.get&&d.get._st107)return;
  const g1=()=>'figure';g1._st107=1;Object.defineProperty(SETTINGS,'tokenStyle',{get:g1,set(){},enumerable:true,configurable:true});
  Object.defineProperty(SETTINGS,'mini3d',{get:()=>false,set(){},enumerable:true,configurable:true})}catch(e){console.error(e)}}
if(ST107.on){
  st107Pin();try{if(typeof miniApply==='function')miniApply()}catch(e){}
  {const base=applySettings;applySettings=function(){st107Pin();return base.apply(this,arguments)}}
  /* the old tab 'tokens': the style rows go (the Armor style rows stay) */
  {const base=settingsHTML;settingsHTML=function(tab){let h=base.apply(this,arguments);if(tab!=='tokens'||typeof h!=='string')return h;
    try{h=h.replace(/<h4 style="margin:0 0 4px">🗿[^<]*<\/h4><p class="rc-sub"[^>]*>[\s\S]*?<\/p>/,'').replace(/<button type="button" class="tokrow[^"]*" data-tokstyle="[^"]*">[\s\S]*?<\/button>/g,'')}catch(e){}return h}}
  /* Settings → Board & pieces: the "Gladiators & beasts" card goes */
  if(typeof set98Pieces==='function'){const base=set98Pieces;set98Pieces=function(){let h=base.apply(this,arguments);
    try{if(typeof h==='string')h=h.replace(/<section class="s98-card[^"]*"[^>]*><h3><span class="ic">🗿<\/span>[\s\S]*?<\/section>/,'');
      /* Blessings left + Editors in the box right (one grid2 row; stacks on phones via 246's grid2 rule) */
      const m=/<\/section><\/div>\s*(<section class="s98-card[^"]*"[^>]*><h3><span class="ic">🎭<\/span>[\s\S]*<\/section>)<\/div>\s*$/.exec(h);
      if(m){h=h.slice(0,m.index)+'</section>'+m[1]+'</div></div>';h=h.replace('<div class="s98-grid2">','<div class="s98-grid2 s98-edpair">')}}catch(e){}return h}}
  /* nothing loads the Magnus Edition minis on the board any more (Credits → Prototype only) */
  if(typeof mini8Img==='function'){mini8Img=function(){return null}}
}

/* ---------------- 2a · the still on the board: gladiators ---------------- */
/* st107ClsOf — the printed class whose still a gladiator wears (custom characters: their base class) */
function st107ClsOf(p){try{if(!p)return null;if(ST107_CLS.includes(p.cls))return p.cls;const C=typeof CLASSES!=='undefined'&&CLASSES[p.cls];
  if(C&&C.custom){const c=(typeof CUSTOM!=='undefined'?CUSTOM.chars||[]:[]).find(x=>'cc_'+x.id===p.cls);const b=c&&c.base;if(ST107_CLS.includes(b))return b;
    if(C.base&&ST107_CLS.includes(C.base))return C.base;return 'soldier'}return null}catch(e){return null}}
/* st107Src — a 311 source made of the still sheet (one idle cell per facing), so an100Cell draws it like a stand-in */
const ST107_SRC={};
function st107Src(cls){const im=st107Img(cls);if(!im)return null;let s=ST107_SRC[cls];
  if(!s){const M=typeof ANIM100_META!=='undefined'&&ANIM100_META[cls]&&ANIM100_META[cls].move;if(!M)return null;const r=M.rows.idle[0];
    s={key:'s107:'+cls,cls,still:1,move:{meta:{pxmm:M.pxmm,rows:{idle:[[0,r[1],r[2],r[3],r[4]]]}},bm:{idle:{whole:im,y0:0}}},act:{meta:{pxmm:M.pxmm,rows:{}},bm:{}},ready:true};ST107_SRC[cls]=s}
  return s}
function st107DrawP(sp,x,y,opt){const p=typeof AN100!=='undefined'?AN100.cur:null;if(!p||typeof ctx==='undefined')return null;
  /* a Studio / online token with its own picture (222 / 226) keeps it: its first rendered frame */
  if(sp&&sp.t93){try{if(typeof t93Img==='function'&&t93Img(sp.t93))return null}catch(e){}}
  const cls=st107ClsOf(p);if(!cls)return null;const src=st107Src(cls);if(!src)return null;
  const face=typeof miniFace==='function'?miniFace(p,'t93'):0;
  const top=an100Cell(src,{set:'move',name:'idle',i:0},face,AN100.m?AN100.m.x:x,AN100.m?AN100.m.y:y,opt||{});if(top==null)return null;
  ST107.stats.p++;try{TOP83=top}catch(e){}return top}
if(ST107.on&&typeof an100DrawP==='function'){const base=an100DrawP;an100DrawP=function(sp,x,y,opt){const t=base.apply(this,arguments);if(t!=null)return t;
  try{return st107DrawP(sp,x,y,opt)}catch(e){console.error(e);return null}}}

/* ---------------- 2a · the still on the board: beasts ---------------- */
function st107BeastKey(n){try{if(!n||n.cls||!n.t||typeof NPCT==='undefined'||!NPCT[n.t]||NPCT[n.t].custom)return null;const k=typeof bst100Key==='function'?bst100Key(n):null;return k&&ST107.F[k]?k:null}catch(e){return null}}
/* 312 draws its sheet itself this frame? (then today's chain runs untouched) */
function st107Bst100(n,k){try{return typeof BST100!=='undefined'&&BST100.on&&bst100Mode()!=='off'&&!!bst100Img(k,0)}catch(e){return false}}
function st107DrawBeast(n,k,args){const M=BEAST100_META[k];const im=st107Img(k);if(!M||!im)return null;
  let face=0;try{face=miniFace(n,k)}catch(e){}const m=center(n.r,n.c),x=m.x,y=m.y-(n.t==='zora'&&typeof pillarAt==='function'&&pillarAt(n.r,n.c)?TW*1.05:0);
  let opt={};for(const a of args)if(a&&typeof a==='object'&&!Array.isArray(a)&&('filter' in a||'dim' in a))opt=a;if(typeof args[2]==='string'&&args[2])opt={filter:args[2]};
  const s=bst100Scale(M),ay=y-(M.base?BST100_BASE_MM*M.px*s:0),me=M.iw;
  ctx.save();if(M.base){ctx.fillStyle='rgba(0,0,0,.32)';const rw=Math.min(M.base[0]*TW*MINI_BASE/25.4,TW*MINI_FIT)*0.55;fl104Sh(x+2,y+3,rw,rw*(M.base[1]/M.base[0])*0.75)}
  else{ctx.fillStyle='rgba(0,0,0,.32)';const rw=TW*MINI_BASE*0.55;fl104Sh(x+2,y+3,rw,rw*0.5)}ctx.restore();
  ctx.save();if(opt.dim)ctx.globalAlpha*=opt.dim;if(opt.filter)ctx.filter=opt.filter;
  const cc=bst100CellCanvas(im,me,face,0,s);if(cc){if(!(typeof sh103Blit==='function'&&sh103Blit(cc.c,x-me[2]*s,ay-me[3]*s,me[0]*s,me[1]*s,x,ay)))ctx.drawImage(cc.c,x-me[2]*s,ay-me[3]*s,me[0]*s,me[1]*s)}
  else ctx.drawImage(im,face*me[0],0,me[0],me[1],x-me[2]*s,ay-me[3]*s,me[0]*s,me[1]*s);ctx.restore();ST107.stats.b++;return ay-me[3]*s}
function st107Piece(base,self,args){const n=typeof MINI_CUR!=='undefined'?MINI_CUR:null;if(!n||n.cls||(typeof HEADLESS!=='undefined'&&HEADLESS))return base.apply(self,args);
  const k=st107BeastKey(n);if(!k||st107Bst100(n,k))return base.apply(self,args);
  try{const t=st107DrawBeast(n,k,args);if(t!=null)return t}catch(e){console.error(e)}return base.apply(self,args)}
if(ST107.on){
  {const base=drawFigureTok;drawFigureTok=function(){return st107Piece(base,this,arguments)}}
  if(typeof drawZoraMini==='function'){const base=drawZoraMini;drawZoraMini=function(){return st107Piece(base,this,arguments)}}
  /* the eight class stills on an idle callback after boot (≈120 KB), so a board never waits for them */
  try{const go=()=>{for(const c of ST107_CLS)st107Img(c)};if(typeof requestIdleCallback==='function')setTimeout(()=>requestIdleCallback(go,{timeout:4000}),1500);else setTimeout(go,2500)}catch(e){}
}

/* ---------------- 3a · off the board ---------------- */
/* st107HTML — the still facing the viewer, h px tall */
function st107HTML(k,h,cls){const F=ST107.F[k];if(!F)return '';h=Math.round(h||60);const w=Math.max(1,Math.round(h*F[0]/F[1]));ST107.stats.html++;
  return `<span class="tkfig st107${cls?' '+cls:''}" data-st107="${k}" style="display:inline-block;height:${h}px;width:${w}px"><img src="${st107URL('still107f_'+k+'.webp')}" alt="" draggable="false" decoding="async"></span>`}
/* st107KeyOfSpec — the class / beast still of a figure spec (printed class or system beast, by identity or by its JSON), else null */
const ST107_SPEC=new WeakMap();
function st107KeyOfSpec(sp){if(!sp||typeof sp!=='object'||sp.t93)return null;if(ST107_SPEC.has(sp))return ST107_SPEC.get(sp);let k=null;
  try{const cand=[];for(const c of ST107_CLS){if(typeof TOKEN_OVR!=='undefined'&&TOKEN_OVR[c])cand.push([TOKEN_OVR[c],c]);if(TOKEN_DEF[c])cand.push([TOKEN_DEF[c],c])}
    for(const t of Object.keys(NPCT)){const bk=st107BeastKey({t});if(!bk)continue;if(typeof TOKEN_OVR!=='undefined'&&TOKEN_OVR['npc_'+t])cand.push([TOKEN_OVR['npc_'+t],bk]);if(TOKEN_DEF[t])cand.push([TOKEN_DEF[t],bk])}
    const hit=cand.find(([s])=>s===sp);if(hit)k=hit[1];
    else{const strip=o=>{const c={...o};delete c.sev;delete c._nb103;delete c.raise;if(typeof c.weapon==='string'&&c.weapon.startsWith('cw_'))delete c.weapon;return JSON.stringify(c)};const j=strip(sp);
      const h2=cand.find(([s])=>strip(s)===j);if(h2)k=h2[1]}}catch(e){k=null}
  ST107_SPEC.set(sp,k);return k}
if(ST107.on){
  {const base=figureHTML;figureHTML=function(spec,height,ring,extra){try{if(!(extra&&Object.keys(extra).length)){const k=st107KeyOfSpec(spec);if(k)return st107HTML(k,height||60)}}catch(e){}return base.apply(this,arguments)}}
  if(typeof clsPieceHTML==='function'){const base=clsPieceHTML;clsPieceHTML=function(cls,height){try{if(ST107_CLS.includes(cls)&&ST107.F[cls]&&!(typeof T94!=='undefined'&&T94.panelP&&T94.panelP.cls===cls))return st107HTML(cls,height||40)}catch(e){}return base.apply(this,arguments)}}
  if(typeof npcPieceHTML==='function'){const base=npcPieceHTML;npcPieceHTML=function(npc,height){try{const k=st107BeastKey(npc);if(k)return st107HTML(k,height||40)}catch(e){}return base.apply(this,arguments)}}
  /* online figures (stage, room seats, Domus): their own 226 picture when there is one, else the printed class still */
  if(typeof onlFig==='function'){const base=onlFig;onlFig=function(cls,look,h){try{let rec=null;try{const ref=typeof t94RefLook==='function'?t94RefLook(look):null;rec=ref&&typeof t94Rec==='function'?t94Rec(ref):null}catch(e){}
    if(!rec&&ST107_CLS.includes(cls))return st107HTML(cls,h||60)}catch(e){}return base.apply(this,arguments)}}
  /* MINI_URL (Play Now seats 106, onlMini 112): the fronts */
  try{if(typeof MINI_URL!=='undefined')for(const k of Object.keys(MINI_URL))if(ST107.F[k])MINI_URL[k]='assets/still107f_'+k+'.webp'}catch(e){}
}

/* ---------------- 4a · Credits → Prototype: the tabletop minis ---------------- */
if(ST107.on&&typeof protoHTML==='function'){const base=protoHTML;protoHTML=function(){let h=base.apply(this,arguments);
  try{if(typeof MINI8==='undefined'||typeof MINI8_URL==='undefined')return h;const s=0.72; /* TWEAK: one scale for every mini (they keep their real sizes) */
    const cell=k=>{const M=MINI8[k];if(!M)return '';const w=Math.round(M[0]*s),H=Math.round(M[1]*s);
      return `<span class="mini8c" data-mini8="${k}" style="width:${w}px;height:${H}px;background-image:url('${st107URL(MINI8_URL[k].replace(/^assets\//,''))}');background-size:${Math.round(M[0]*8*s)}px ${H}px" title="${esc((CLASSES[k]&&CLASSES[k].name)||k)}"></span>`};
    const keys=[...ST107_CLS,...Object.keys(MINI8_URL).filter(k=>!ST107_CLS.includes(k))];
    h+=`<div class="mini8row"><h4>${_T`The tabletop minis`}</h4><p class="rc-sub">${_T`Virgilante's Magnus Edition minis — the pieces of the Tabletop Simulator game.`}</p><div class="mini8line">${keys.map(cell).join('')}</div></div>`}catch(e){console.error(e)}return h}}

(()=>{if(!ST107.on)return;const st=document.createElement('style');st.textContent=`
.tkfig.st107{position:relative;vertical-align:bottom;line-height:0}.tkfig.st107>img{display:block;width:100%;height:100%;object-fit:contain;object-position:50% 100%}
.mini8row{margin:14px 0 4px;text-align:center}.mini8row h4{margin:0 0 2px}.mini8line{display:flex;flex-wrap:wrap;gap:6px 10px;justify-content:center;align-items:flex-end;margin-top:6px}
.mini8c{display:inline-block;background-repeat:no-repeat;background-position:0 0}
.s98 .s98-edpair .s98-eds{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.s98 .s98-edpair .s98-eds .sponrow>div{flex:1}`;document.head.appendChild(st)})();
