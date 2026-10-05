/* 169-v89loot — v0.89 THE LOOT WINDOW IN THE MARKET-BOARD STYLE (his answer, 2026-10-05).
   • The Loot action (07-ui 'loot') and the between-turns 🎒 Manage take (162-v88gear) show what lies on the tile as a spread of the
     ACTUAL pieces: weapon cards standing upright with their art, armor pieces with their own art (cardHTML, the market board's art),
     coin and cards beside them. A small header names whose corpse / pile it is (several piles → one group each; thrown weapons
     "In the sand").
   • Hover (or the first tap on a touch screen) a piece → the market's info panel (155 mk88Info: art, stats, "fits you / replaces X")
     plus the piece's own state line (ammo/AP left, where it lies). Click a lit piece to take it.
   • Pieces you cannot take right now are dimmed with the reason: the turn's one Loot is used (thrown weapons in the sand can still be
     picked up), no arm left to hold a weapon, nowhere left to wear the armor, coin/cards only with the Loot action.
   • Loot = one item on your turn (rules unchanged, p.looted as before). Manage (off-turn) = the same window, reopening after each take
     until you are Done, with ⇄ Swap hands inside it.
   The window VALUES are unchanged (the option index; Cancel/Done = null): the old buttons stay in the window, hidden, and every lit
   piece carries its button's data-mi — online lockstep (113 records modal values) and the CPU paths do not notice. */
const LOOT89={ptr:'',sel:null};
/* loot89Same — two loot options are the same piece (lootOptions builds new objects on every call) */
const loot89Same=(a,b)=>a.t===b.t&&(a.t==='fw'?a.floor===b.floor:a.pl===b.pl&&a.i===b.i);
/* loot89Piece — what the option is: its card ref (w:/a:/c:/m:) and the object */
function loot89Piece(o){try{
  if(o.t==='w'||o.t==='fw'){const w=o.t==='w'?o.pl.weapons[o.i]:o.floor.w;return {kind:'w',obj:w,ref:w&&w.key&&W[w.key]?'w:'+w.key:null}}
  if(o.t==='a'){const a=o.pl.armor[o.i];return {kind:'a',obj:a,ref:a&&a.key&&ARM[a.key]?'a:'+a.key:null}}
  if(o.t==='c')return {kind:'c',obj:o.pl.coin,ref:null};
  if(o.t==='i'){const it=o.pl.items[o.i];return {kind:'i',obj:it,ref:it&&it.kind==='card'&&CARDS[it.key]?'c:'+it.key:it&&it.kind==='mf'?'m:'+it.idx:null}}}catch(e){}
  return {kind:'?',obj:null,ref:null}}
/* loot89Why — why the player cannot take this piece now ('' = takeable) */
function loot89Why(p,o,{taken,mode}){const P=loot89Piece(o);
  if(mode==='manage'&&(o.t==='c'||o.t==='i'))return _T('Coin and cards: only with the Loot action, on your turn.');
  if(mode==='loot'&&taken&&o.t!=='fw')return _T('Your one Loot this turn is used — only thrown weapons in the sand can still be picked up.');
  try{if(P.kind==='w'&&!armsAttached(p).length)return _T('No arm left to hold it.');
    if(P.kind==='a'&&P.obj){const d=ARM[P.obj.key];if(d&&!sideLocs(d).some(l=>p.hp[l]>0))return _T('Nowhere left to wear it.')}}catch(e){}
  return ''}
/* loot89Art — the piece as it lies: an upright weapon card, an armor piece, a coin stack, a card */
function loot89Art(o){const P=loot89Piece(o);
  if(P.kind==='w')return P.ref?`<span class="lt89w">${cardHTML(P.ref,'md')}</span>`:`<span class="lt89w lt89x"><b>${esc(P.obj?P.obj.n:'?')}</b></span>`;
  if(P.kind==='a')return P.ref?`<span class="lt89a">${cardHTML(P.ref,'md')}</span>`:`<span class="lt89a lt89x"><b>${esc(P.obj?P.obj.n:'?')}</b></span>`;
  if(P.kind==='c')return `<span class="lt89c">${ICO.coin}<b>${esc(String(P.obj||0))}</b></span>`;
  if(P.kind==='i'){if(P.ref)return `<span class="lt89i">${cardHTML(P.ref,'md')}</span>`;
    if(P.obj&&P.obj.kind==='offer'&&typeof offerTokHTML==='function')return `<span class="lt89i tok">${offerTokHTML(P.obj.key,72)}</span>`}
  return `<span class="lt89i lt89x"><b>${esc(o.label||'?')}</b></span>`}
/* loot89Group — the header over one pile */
function loot89Head(o){if(o.t==='fw')return {k:'sand',h:_T('In the sand'),col:''};const pl=o.pl;
  return {k:'p'+pl.id,h:pl.corpse?_T`✝ ${esc(pl.name)}’s corpse`:_T`${esc(pl.name)}’s dropped gear`,col:pl.color||''}}
/* loot89HTML — the spread. rows = [{o, mi, why}] (mi −1 = not takeable now) */
function loot89HTML(p,rows,{intro='',mode}={}){const groups=new Map();
  rows.forEach((r,n)=>{const g=loot89Head(r.o);if(!groups.has(g.k))groups.set(g.k,{...g,list:[]});groups.get(g.k).list.push({...r,n})});
  const hands=mode==='manage'?`<div class="lt89hands">${_T`Your hands`}: ${['R','L'].map(a=>`<span>${a==='R'?_T('Primary'):_T('Secondary')} · <b>${p['w'+a]?esc(p['w'+a].n):(armsAttached(p).includes(a)?_T('empty'):_T('arm lost'))}</b></span>`).join('')}</div>`:'';
  const piece=r=>{const lit=r.mi>=0;const name=r.o.t==='c'?_T`${r.o.pl.coin} coin`:r.o.label;const lab=esc(String(r.o.label||'').replace(/<[^>]+>/g,''));
    return lit?`<button type="button" class="lt89p lit" data-lt89="${r.n}" data-mi="${r.mi}" aria-label="${lab}">${loot89Art(r.o)}<span class="lt89n">${name}</span></button>`
      :`<span class="lt89p dim" data-lt89="${r.n}" tabindex="0" aria-label="${lab}" aria-disabled="true">${loot89Art(r.o)}<span class="lt89n">${name}</span></span>`};
  return `<div class="lt89">${intro}${hands}<div class="lt89table">${[...groups.values()].map(g=>`<section class="lt89g"><h5${g.col?_T` style="--pc:${g.col}"`:''}>${g.h}<small>${g.list.length}</small></h5><div class="lt89row">${g.list.map(piece).join('')}</div></section>`).join('')}</div><div class="mk88info lt89info"></div></div>`}
/* loot89Info — the market's info panel for weapons/armor, then the piece's own state and why it is dimmed */
function loot89Info(p,r){if(!r)return `<div class="mk88inf empty">${_T('Point at a piece to see it.')}</div>`;const P=loot89Piece(r.o);
  let h='';if(P.ref&&(P.kind==='w'||P.kind==='a')&&typeof mk88Info==='function')h=mk88Info(p,P.ref);
  else{const art=P.ref?cardHTML(P.ref,'md'):P.kind==='c'?`<span class="lt89c big">${ICO.coin}</span>`:loot89Art(r.o);
    h=`<div class="mk88inf"><span class="mk88art">${art}</span><div class="mk88txt"><b>${r.o.label}</b>${P.kind==='i'&&P.obj?`<div class="lv">${itemInfo(P.obj).t||''}</div><p>${itemInfo(P.obj).d||''}</p>`:''}</div></div>`}
  return `${h}<div class="lt89note">${r.o.sub?`<span>${r.o.sub}</span>`:''}${r.why?`<span class="no">⛔ ${r.why}</span>`:''}</div>`}
/* loot89Wire — hover / first tap shows a piece; the base window's own click handler takes lit ones (data-mi) */
function loot89Wire(root,p,rows){const info=root.querySelector('.lt89info');let sel=null;
  const show=el=>{sel=el;root.querySelectorAll('.sel88').forEach(x=>x.classList.remove('sel88'));if(el)el.classList.add('sel88');info.innerHTML=loot89Info(p,el?rows[+el.dataset.lt89]:null)};
  root.addEventListener('pointerover',e=>{const el=e.target.closest('[data-lt89]');if(el&&root.contains(el)&&el!==sel)show(el)});
  root.addEventListener('pointerdown',e=>{LOOT89.ptr=e.pointerType||''});
  root.addEventListener('focusin',e=>{const el=e.target.closest('[data-lt89]');if(el)show(el)});
  root.addEventListener('click',e=>{const el=e.target.closest('[data-lt89]');if(!el)return;
    if(el.classList.contains('dim')){show(el);e.stopPropagation();return}
    if(LOOT89.ptr==='touch'&&el!==sel){show(el);e.stopPropagation()}});
  const first=root.querySelector('.lt89p.lit')||root.querySelector('.lt89p');show(first)}
/* loot89Win — the window: the old buttons stay (hidden) for their values, the spread above them */
function loot89Win(base,p,title,body,buttons,opt,rows,{mode,intro}){
  const B=buttons.map(b=>typeof b.value==='number'?{...b,style:'display:none'}:b);
  return base(title,loot89HTML(p,rows,{intro,mode}),B,{...opt,wide:1,onOpen:done=>{try{const root=document.querySelector('#mBody .lt89');if(root)loot89Wire(root,p,rows)}catch(e){console.error(e)}if(opt&&opt.onOpen)opt.onOpen(done)}})}
/* loot89Rows — every piece on the tile, lit when it is one of the window's options and takeable */
function loot89Rows(p,opts,mode){
  const rows=lootOptions(p).map(o=>{const j=opts.findIndex(x=>loot89Same(x,o));let why=loot89Why(p,o,{taken:j<0&&mode==='loot',mode});if(j<0&&!why)why=_T('Not now.');return {o,mi:why?-1:j,why}});
  /* an option the full list missed (never expected) still gets a lit piece */
  opts.forEach((o,j)=>{if(!rows.some(r=>loot89Same(r.o,o)))rows.push({o,mi:j,why:''})});
  return rows}

/* the Loot action's window (07-ui): recognised by its title and its option labels */
{const base=modal;modal=function(title,body,buttons,opt={}){
  if(HEADLESS||typeof document==='undefined'||!S||!Array.isArray(buttons))return base.apply(this,arguments);
  try{if(String(title)===_T('Loot')&&/<p>/.test(String(body||''))){const p=cur();
      if(p&&!p.cpu){const opts=lootOptions(p).filter(o=>o.t==='fw'||!p.looted);
        if(opts.length===buttons.length-1&&opts.every((o,j)=>buttons[j]&&buttons[j].value===j&&String(buttons[j].label)===String(o.label)))
          return loot89Win(base,p,title,body,buttons,opt||{},loot89Rows(p,opts,'loot'),{mode:'loot',intro:String(body)})}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* 🎒 Manage between turns (162 gear88Take replaced): the same spread, take as many as there is room for, ⇄ Swap hands inside */
gear88Take=async function(p){for(;;){if(!gear88Ok(p))break;const opts=gear88Opts(p);const arms=armsAttached(p);const canSwap=arms.length===2&&!!(p.wR||p.wL);
    if(!opts.length&&!canSwap)break;const rows=loot89Rows(p,opts,'manage');
    const btns=opts.map((o,j)=>({label:o.label,sub:o.sub,value:j,disabled:rows.some(r=>r.mi<0&&loot89Same(r.o,o))}));
    if(canSwap)btns.push({label:_T('⇄ Swap hands'),sub:_T('primary ↔ secondary'),value:'swap'});btns.push({label:_T('Done'),value:null,primary:!opts.length});
    const intro=`<p>${_T`Not your turn and nobody is attacking you: take anything lying here — as much as you have room for. Weapons go to a free hand (or swap one out); armor goes on a free spot.`}</p>`;
    const i=HEADLESS?null:await loot89Win(modal,p,_T('🎒 Manage your gear'),intro,btns,{close:null},rows,{mode:'manage',intro});
    if(i==null||!gear88Ok(p))break;
    if(i==='swap'){gear88Swap(p);continue}
    const o=opts[i];if(!o)break;const was=p.looted;try{await doLoot(p,o)}finally{p.looted=was}render()}};

{const css=document.createElement('style');css.textContent=`
.lt89 .lt89hands{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;color:var(--muted);margin:2px 0 8px}.lt89 .lt89hands b{color:var(--bone)}
.lt89table{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:10px;border:1px solid rgba(184,150,62,.45);
  background:radial-gradient(ellipse at 50% 40%,#c9a46a 0%,#a7834c 55%,#7d5f35 100%);box-shadow:inset 0 0 40px rgba(60,35,10,.55),0 6px 20px rgba(0,0,0,.45)}
.lt89g h5{display:inline-flex;align-items:center;gap:8px;margin:0 0 6px;padding:3px 12px;border-radius:999px;font:400 15px var(--display);color:#fff4dc;
  background:rgba(30,18,8,.72);border:1px solid var(--pc,rgba(255,215,106,.6))}
.lt89g h5 small{font:11px var(--mono);opacity:.75}
.lt89row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end}
.lt89p{all:unset;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:4px;width:104px;padding:6px 4px 4px;border-radius:10px;cursor:default;position:relative;
  transition:opacity .2s,filter .2s,transform .15s,box-shadow .15s}
.lt89p.lit{cursor:pointer}.lt89p.lit:hover,.lt89p.lit:focus-visible,.lt89p.sel88{transform:translateY(-3px)}
.lt89p.lit .lt89w,.lt89p.lit .lt89i{box-shadow:0 0 0 2px #ffd76a,0 0 14px 3px rgba(255,215,106,.7);border-radius:6px}
.lt89p.lit .lt89a .cimg,.lt89p.lit .lt89c{filter:drop-shadow(0 0 5px #ffd76a) drop-shadow(0 0 2px #ffd76a)}
.lt89p.sel88{background:rgba(255,240,200,.18);box-shadow:inset 0 0 0 2px rgba(255,243,196,.8)}
.lt89p.dim{opacity:.5;filter:grayscale(.8) brightness(.8);cursor:help}
.lt89n{font-size:11.5px;line-height:1.15;text-align:center;color:#2a1a0a;font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.lt89w{position:relative;display:block;width:84px;height:121px;border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,.55)}
.lt89w .cimg{position:absolute!important;left:50%;top:50%;width:121px!important;max-width:none!important;height:auto!important;aspect-ratio:600/416;margin:0!important;transform:translate(-50%,-50%) rotate(-90deg);border-radius:6px}
.lt89a{display:grid;place-items:center;width:96px;height:121px}.lt89a .cimg{width:92px!important;max-width:92px!important;max-height:118px;height:auto!important;filter:drop-shadow(0 4px 6px rgba(0,0,0,.55))}
.lt89i{display:grid;place-items:center;width:84px;height:121px;border-radius:6px;overflow:hidden}.lt89i .cimg{width:84px!important;max-width:84px!important;height:auto!important}
.lt89i.tok{overflow:visible;border-radius:50%}
.lt89c{display:grid;place-items:center;width:84px;height:121px;position:relative}.lt89c .coinimg{width:62px;height:62px}
.lt89c b{position:absolute;bottom:18px;right:6px;padding:1px 7px;border-radius:999px;background:#2a1a0a;color:#ffd76a;font:600 13px var(--mono)}
.lt89c.big{height:auto}.lt89c.big .coinimg{width:90px;height:90px}
.lt89x{display:grid;place-items:center;background:rgba(30,18,8,.6);color:#fff4dc;font-size:12px;text-align:center;padding:6px}
.lt89info{margin-top:10px}
.lt89note{display:flex;flex-wrap:wrap;gap:4px 14px;margin:6px 12px 0;font-size:12.5px;color:var(--muted)}.lt89note .no{color:#e07a6a}
@media (max-width:600px){.lt89p{width:86px}.lt89w{width:70px;height:101px}.lt89w .cimg{width:101px!important}.lt89a{width:80px;height:101px}.lt89a .cimg{width:76px!important;max-width:76px!important}
  .lt89i,.lt89c{width:70px;height:101px}.lt89i .cimg{width:70px!important;max-width:70px!important}.lt89table{padding:8px}}
body.calm .lt89p{transition:none}`;document.head.appendChild(css)}
